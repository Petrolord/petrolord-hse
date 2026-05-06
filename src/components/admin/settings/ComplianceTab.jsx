import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { complianceService } from '@/services/complianceService';

export default function ComplianceTab() {
  const { currentOrganization } = useHSE();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrganization?.id) {
        loadRules();
    }
  }, [currentOrganization]);

  const loadRules = async () => {
      // Mock loading or fetch actual if API exists
      try {
          // If no API, default to empty array instead of throwing
          const data = await complianceService.getFrameworks(currentOrganization.id); 
          setRules(data || []);
      } catch (e) {
          console.log("Compliance data fetch failed, defaulting to empty", e);
          setRules([]);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1a1a2e] p-4 rounded-lg border border-[#3a3a5a]">
        <div>
            <h3 className="text-lg font-bold text-white">Compliance Rules Engine</h3>
            <p className="text-[#b0b0c0] text-sm">Set mandatory safety protocols and tracking.</p>
        </div>
        <Button className="bg-[#FFC107] hover:bg-yellow-600 text-black font-semibold">
            <Plus className="mr-2 h-4 w-4" /> New Rule
        </Button>
      </div>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-0">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#252541] text-[#7a7a9a] uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Rule Name</th>
                        <th className="px-6 py-4">Severity</th>
                        <th className="px-6 py-4">Frequency</th>
                        <th className="px-6 py-4">Responsible</th>
                        <th className="px-6 py-4">Next Due</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#3a3a5a] text-[#e0e0e0]">
                    {rules.length > 0 ? rules.map((rule, i) => (
                        <tr key={i} className="hover:bg-[#252541]">
                            <td className="px-6 py-4 font-medium">{rule.name}</td>
                            <td className="px-6 py-4"><Badge variant="outline">{rule.severity}</Badge></td>
                            <td className="px-6 py-4">{rule.frequency}</td>
                            <td className="px-6 py-4">{rule.responsible}</td>
                            <td className="px-6 py-4">{rule.next_due}</td>
                            <td className="px-6 py-4"><Button variant="ghost" size="sm">Edit</Button></td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-[#7a7a9a]">
                                <div className="flex flex-col items-center justify-center">
                                    <CheckCircle className="h-12 w-12 text-[#252541] mb-2" />
                                    <p className="text-lg">No compliance rules defined yet.</p>
                                    <p className="text-xs mt-1">Add a rule to start monitoring compliance status.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </CardContent>
      </Card>
    </div>
  );
}