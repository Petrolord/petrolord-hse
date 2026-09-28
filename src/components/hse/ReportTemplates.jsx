import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { templateService } from '@/services/templateService';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useThemeClass } from '@/design/themeClass';

// Scope-aware (the Report Wizard opens on every module): outside a design-system scope every class is the legacy
// string (pinned by src/components/hse/__tests__/reportingLegacyDom.test.jsx),
// inside one the themed string.

// Fallback hardcoded templates in case DB fetch fails or is empty initially
const FALLBACK_TEMPLATES = [
  { id: "slip-trip", name: "Slip/Trip Hazard", icon: "⚠️", category: "Slip/Trip", severity: "medium", description: "Observed potential slip/trip hazard.", controls: "Area cordoned off, signs placed." },
  { id: "ppe-not-worn", name: "PPE Not Worn", icon: "🦺", category: "PPE", severity: "high", description: "Staff member not wearing required PPE.", controls: "Stopped work, provided PPE." },
  { id: "unsafe-behavior", name: "Unsafe Behavior", icon: "🚫", category: "Unsafe Behavior", severity: "medium", description: "Observed unsafe work practice.", controls: "Corrected immediately, coaching provided." },
  { id: "housekeeping", name: "Poor Housekeeping", icon: "🧹", category: "Housekeeping", severity: "low", description: "Area needs cleaning/organizing.", controls: "Area cleaned and organized." },
  { id: "near-miss", name: "Near Miss", icon: "💫", category: "Near Miss", severity: "medium", description: "Incident almost happened.", controls: "Investigated root cause." },
  { id: "hazard-id", name: "Hazard ID", icon: "🔍", category: "Hazard", severity: "medium", description: "Potential hazard identified.", controls: "Risk assessed." }
];

export default function ReportTemplates({ onSelect, onSkip }) {
  const { currentOrganization } = useHSE();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const tc = useThemeClass();

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!currentOrganization) {
          setTemplates(FALLBACK_TEMPLATES);
          setLoading(false);
          return;
      }
      try {
        const data = await templateService.getTemplates(currentOrganization.id);
        setTemplates(data.length > 0 ? data : FALLBACK_TEMPLATES);
      } catch (e) {
        setTemplates(FALLBACK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [currentOrganization]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className={tc('animate-spin text-[#FFC107] h-8 w-8', 'animate-spin text-pl-primary-text h-8 w-8')} /></div>;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className={tc('text-xl font-bold text-white', 'text-xl font-semibold text-pl-text')}>Choose a Template</h3>
        <p className={tc('text-[#b0b0c0] text-sm', 'text-pl-muted text-sm')}>Select a common scenario to auto-fill details, or start from scratch.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(tpl => (
          <Card 
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className={tc('bg-[#252541] border-[#3a3a5a] hover:border-[#FFC107] hover:bg-[#2a2a4a] cursor-pointer transition-all p-4 flex flex-col items-center text-center group', 'hover:border-pl-primary hover:bg-pl-sunken cursor-pointer transition-all p-4 flex flex-col items-center text-center group')}
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tpl.icon}</span>
            <span className={tc('font-medium text-white text-sm', 'font-medium text-pl-text text-sm')}>{tpl.name}</span>
            <span className={tc('text-[10px] text-[#7a7a9a] mt-1 capitalize', 'text-[10px] text-pl-muted mt-1 capitalize')}>{tpl.category} • {tpl.severity}</span>
          </Card>
        ))}
        
        <Card 
          onClick={onSkip}
          className={tc('bg-[#1a1a2e] border-[#3a3a5a] hover:border-white border-dashed cursor-pointer transition-all p-4 flex flex-col items-center justify-center text-center', 'bg-pl-sunken border-dashed hover:border-pl-border-strong cursor-pointer transition-all p-4 flex flex-col items-center justify-center text-center')}
        >
          <span className={tc('text-2xl mb-3 text-[#7a7a9a]', 'text-2xl mb-3 text-pl-muted')}>+</span>
          <span className={tc('font-medium text-[#b0b0c0] text-sm', 'font-medium text-pl-text text-sm')}>Start Fresh</span>
          <span className={tc('text-[10px] text-[#7a7a9a] mt-1', 'text-[10px] text-pl-muted mt-1')}>Empty Form</span>
        </Card>
      </div>
    </div>
  );
}