export const saveState = (key, state) => {
  try {
    if (state === undefined) return;
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error(`Error saving state for key "${key}":`, err);
  }
};

export const loadState = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error(`Error loading state for key "${key}":`, err);
    return undefined;
  }
};

export const clearState = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error clearing state for key "${key}":`, err);
  }
};

// Validate state structure to prevent app crashes from stale/malformed data
export const validateState = (state, schema) => {
  if (!state) return false;
  // Simple validation: check if keys in schema exist in state
  // This can be expanded for complex validation
  return Object.keys(schema).every(key => Object.prototype.hasOwnProperty.call(state, key));
};