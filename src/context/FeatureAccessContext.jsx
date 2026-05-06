import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { FREE_TIER_FEATURES, PREMIUM_FEATURES } from '@/lib/featureFlags';
import UpgradeToSuiteModal from '@/components/common/UpgradeToSuiteModal';

const FeatureAccessContext = createContext();

export function FeatureAccessProvider({ children }) {
  const { user } = useAuth();
  const [subscribedModules, setSubscribedModules] = useState([]);
  const [primaryApp, setPrimaryApp] = useState('hse');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [triggeredFeature, setTriggeredFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch permissions on mount or user change
  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setSubscribedModules(['hse_free']); // Default to free if not logged in (e.g. public view)
      setLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscribed_modules, primary_app')
        .eq('id', user.id)
        .single();

      if (data) {
        setSubscribedModules(data.subscribed_modules || ['hse_free']);
        setPrimaryApp(data.primary_app || 'hse');
      } else {
        // Fallback if record doesn't exist yet
        setSubscribedModules(['hse_free']);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setSubscribedModules(['hse_free']);
    } finally {
      setLoading(false);
    }
  };

  const hasPremiumAccess = () => {
    return subscribedModules.some(m => 
      ['hse_paid', 'suite', 'HSE Premium', 'Enterprise'].includes(m)
    );
  };

  const canAccessFeature = (featureName) => {
    // 1. Always allow free features
    if (FREE_TIER_FEATURES.includes(featureName)) return true;

    // 2. Check for premium access
    if (PREMIUM_FEATURES.includes(featureName)) {
      return hasPremiumAccess();
    }

    // 3. Default safe (allow if not explicitly restricted, or strict mode?)
    // For safety, if it's not in our lists, we might default to open or closed.
    // Let's default to open for unknown features to avoid breaking things, 
    // but strictly lock known premium ones.
    return true; 
  };

  const triggerUpgrade = (featureName) => {
    setTriggeredFeature(featureName);
    setUpgradeModalOpen(true);
    
    // Log the attempt
    if (user) {
      supabase.from('app_activity_log').insert([{
        user_id: user.id,
        app_name: 'hse',
        action: `access_attempt_${featureName}`,
        timestamp: new Date()
      }]).then(() => {});
    }
  };

  return (
    <FeatureAccessContext.Provider value={{ 
      canAccessFeature, 
      triggerUpgrade, 
      hasPremiumAccess,
      subscribedModules,
      loading
    }}>
      {children}
      <UpgradeToSuiteModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName={triggeredFeature} 
      />
    </FeatureAccessContext.Provider>
  );
}

export function useFeatureAccess() {
  const context = useContext(FeatureAccessContext);
  if (!context) {
    throw new Error('useFeatureAccess must be used within a FeatureAccessProvider');
  }
  return context;
}