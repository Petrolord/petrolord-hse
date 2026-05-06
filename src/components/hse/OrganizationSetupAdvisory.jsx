import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';

export const OrganizationSetupAdvisory = ({ onSetupClick, onDismiss }) => {
  const { currentOrganization } = useHSE();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show if setup is not complete
  if (isDismissed || currentOrganization?.setup_completed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">
            Organization Setup Recommended
          </h3>
          <p className="text-blue-200 text-sm mb-3">
            Set up your organization structure (departments, positions, sites, key personnel) 
            to enable better reporting and organization of safety observations.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onSetupClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Setup Wizard
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-transparent text-blue-300 border border-blue-800 rounded-lg text-sm font-semibold hover:text-white hover:border-blue-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-white flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};