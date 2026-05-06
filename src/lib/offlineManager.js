import { supabase } from '@/lib/customSupabaseClient';

/**
 * Offline Manager
 * Handles data persistence using IndexedDB when offline.
 * Queues actions and syncs them when online.
 */

const DB_NAME = 'petrolord_hse_db';
const DB_VERSION = 1;
const STORES = {
  ACTIONS: 'offline_actions', // Queue for mutations (POST/PUT/DELETE)
  DATA: 'cached_data'         // Cache for data fetching (GET)
};

// --- IndexedDB Helpers ---

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Database error: ' + event.target.error);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.ACTIONS)) {
        db.createObjectStore(STORES.ACTIONS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.DATA)) {
        db.createObjectStore(STORES.DATA, { keyPath: 'key' });
      }
    };
  });
};

const dbOp = async (storeName, mode, callback) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

// --- Public API ---

export const offlineManager = {
  
  /**
   * Save an incident or report locally when offline.
   */
  async saveIncident(reportData) {
    console.log('[OfflineManager] Saving incident to queue:', reportData);
    await dbOp(STORES.ACTIONS, 'readwrite', (store) => {
      return store.add({
        type: 'CREATE_INCIDENT',
        payload: reportData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    });
    return true;
  },

  /**
   * Generic method to queue any action
   */
  async queueAction(type, payload) {
    console.log(`[OfflineManager] Queuing action: ${type}`);
    await dbOp(STORES.ACTIONS, 'readwrite', (store) => {
      return store.add({
        type,
        payload,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    });
  },

  /**
   * Get all queued actions
   */
  async getQueuedActions() {
    return await dbOp(STORES.ACTIONS, 'readonly', (store) => store.getAll());
  },

  /**
   * Remove an action from queue (after sync)
   */
  async removeAction(id) {
    await dbOp(STORES.ACTIONS, 'readwrite', (store) => store.delete(id));
  },

  /**
   * Cache data for offline viewing
   */
  async cacheData(key, data) {
    try {
      await dbOp(STORES.DATA, 'readwrite', (store) => {
        return store.put({ key, data, timestamp: new Date().toISOString() });
      });
    } catch (e) {
      console.warn('Failed to cache data', e);
    }
  },

  /**
   * Get cached data
   */
  async getCachedData(key) {
    try {
      const result = await dbOp(STORES.DATA, 'readonly', (store) => store.get(key));
      return result ? result.data : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Sync Mechanism: Process queue
   * This should be called when connection is restored
   */
  async syncPendingActions() {
    if (!navigator.onLine) return;

    const actions = await this.getQueuedActions();
    if (actions.length === 0) return;

    console.log(`[OfflineManager] Syncing ${actions.length} pending actions...`);

    for (const action of actions) {
      try {
        let success = false;

        switch (action.type) {
          case 'CREATE_INCIDENT':
            // We use the raw supabase client here to avoid circular dependency with services
            // But we need to handle the specific table logic
            const { error } = await supabase.from('incidents').insert([action.payload]);
            if (!error) success = true;
            else console.error("Sync Error (Incident):", error);
            break;
            
          // Add other cases here (e.g., UPDATE_STATUS, CREATE_OBSERVATION)
          default:
            console.warn("Unknown action type:", action.type);
            // We remove unknown actions to prevent blocking the queue forever
            success = true; 
        }

        if (success) {
          await this.removeAction(action.id);
          console.log(`[OfflineManager] Action ${action.id} synced successfully.`);
        }
      } catch (err) {
        console.error(`[OfflineManager] Failed to sync action ${action.id}:`, err);
      }
    }
  }
};