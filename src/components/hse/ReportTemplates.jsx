import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { templateService } from '@/services/templateService';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

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

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FFC107] h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Choose a Template</h3>
        <p className="text-[#b0b0c0] text-sm">Select a common scenario to auto-fill details, or start from scratch.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(tpl => (
          <Card 
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className="bg-[#252541] border-[#3a3a5a] hover:border-[#FFC107] hover:bg-[#2a2a4a] cursor-pointer transition-all p-4 flex flex-col items-center text-center group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tpl.icon}</span>
            <span className="font-medium text-white text-sm">{tpl.name}</span>
            <span className="text-[10px] text-[#7a7a9a] mt-1 capitalize">{tpl.category} • {tpl.severity}</span>
          </Card>
        ))}
        
        <Card 
          onClick={onSkip}
          className="bg-[#1a1a2e] border-[#3a3a5a] hover:border-white border-dashed cursor-pointer transition-all p-4 flex flex-col items-center justify-center text-center"
        >
          <span className="text-2xl mb-3 text-[#7a7a9a]">+</span>
          <span className="font-medium text-[#b0b0c0] text-sm">Start Fresh</span>
          <span className="text-[10px] text-[#7a7a9a] mt-1">Empty Form</span>
        </Card>
      </div>
    </div>
  );
}