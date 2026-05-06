import React from 'react';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { Progress } from '@/components/ui/progress';
import { Crown, Mail, Image, Video } from 'lucide-react';

// Simple Progress component wrapper since raw radix might need more setup
const SimpleProgress = ({ value, className, indicatorClassName }) => (
  <div className={`h-2 w-full bg-gray-700 rounded-full overflow-hidden ${className}`}>
    <div 
      className={`h-full transition-all duration-300 ${indicatorClassName || 'bg-blue-500'}`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const UsageItem = ({ label, icon: Icon, count, limit, isPremium }) => {
  const percentage = limit === -1 ? 0 : (count / limit) * 100;
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-[#e0e0e0]">
          <Icon className="h-4 w-4 text-[#7a7a9a]" />
          <span>{label}</span>
        </div>
        <span className={`text-xs font-mono ${percentage >= 90 && limit !== -1 ? 'text-red-400' : 'text-[#b0b0c0]'}`}>
          {isPremium ? 'Unlimited' : `${count} / ${limit}`}
        </span>
      </div>
      {!isPremium && (
        <SimpleProgress 
          value={percentage} 
          indicatorClassName={percentage >= 90 ? 'bg-red-500' : 'bg-[#FFC107]'}
        />
      )}
      {isPremium && (
        <div className="h-1 w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
      )}
    </div>
  );
};

export function UsageTracker({ className }) {
  const { isPremium, usageMetrics, limits } = useHSEAccess();

  return (
    <div className={`petrolord-card p-4 bg-[#252541] border border-[#3a3a5a] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#e0e0e0] uppercase tracking-wider">Monthly Usage</h3>
        {isPremium && <Crown className="h-4 w-4 text-[#FFC107]" />}
      </div>

      <UsageItem 
        label="Email Notifications" 
        icon={Mail}
        count={usageMetrics?.email_count || 0}
        limit={limits.email_limit}
        isPremium={isPremium}
      />
      
      <UsageItem 
        label="Image Uploads" 
        icon={Image}
        count={usageMetrics?.image_upload_count || 0}
        limit={limits.image_limit}
        isPremium={isPremium}
      />

      <UsageItem 
        label="Video Uploads" 
        icon={Video}
        count={usageMetrics?.video_upload_count || 0}
        limit={limits.video_limit}
        isPremium={isPremium}
      />
      
      {!isPremium && (
         <div className="mt-4 pt-4 border-t border-[#3a3a5a] text-center">
           <p className="text-xs text-[#7a7a9a]">Limits reset on the 1st of next month.</p>
         </div>
      )}
    </div>
  );
}

export default UsageTracker;