import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from "@/components/ui/use-toast";

const stamp = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '';

export default function Reporting() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [data, setData] = useState({ permits: [], monitoring: [], spills: [], waste: [], studies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    const id = currentOrganization.id;
    setLoading(true);
    Promise.all([
      environmentService.getPermits(id),
      environmentService.getMonitoringResults(id),
      environmentService.getSpills(id),
      environmentService.getWasteManifests(id),
      environmentService.getStudies(id),
    ]).then(([permits, monitoring, spills, waste, studies]) => {
      setData({ permits, monitoring, spills, waste, studies });
    }).catch(console.error).finally(() => setLoading(false));
  }, [currentOrganization]);

  const doExport = (filename, rows) => {
    const ok = exportToCsv(filename, rows);
    if (!ok) toast({ title: "Nothing to export", description: "No records available for this report yet.", variant: "destructive" });
  };

  // NUPRC monthly pack: this calendar month's monitoring results.
  const nuprcMonthlyPack = () => {
    const now = new Date();
    const rows = data.monitoring
      .filter(m => { const d = m.sample_date ? new Date(m.sample_date) : null; return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .map(m => ({ Parameter: m.parameter, Value: m.value, Unit: m.unit, Limit: m.limit_value ?? '', Location: m.location_point || '', 'Sample Date': fmtDate(m.sample_date), Status: m.status || '' }));
    doExport(`nuprc-monthly-monitoring-${stamp()}.csv`, rows);
  };

  // Annual report: consolidated YTD register across spills, waste and monitoring.
  const annualReport = () => {
    const year = new Date().getFullYear();
    const inYear = (d) => d && new Date(d).getFullYear() === year;
    const rows = [
      ...data.spills.filter(s => inYear(s.incident_date)).map(s => ({ Category: 'Spill', Reference: s.spill_id || '', Detail: s.substance || '', Quantity: s.quantity_spilled ?? '', Unit: s.unit || '', Date: fmtDate(s.incident_date), Status: s.status || '' })),
      ...data.waste.filter(w => inYear(w.disposal_date) || inYear(w.created_at)).map(w => ({ Category: 'Waste', Reference: w.manifest_number || '', Detail: w.waste_type || '', Quantity: w.quantity ?? '', Unit: w.unit || '', Date: fmtDate(w.disposal_date), Status: w.status || '' })),
      ...data.monitoring.filter(m => inYear(m.sample_date)).map(m => ({ Category: 'Monitoring', Reference: m.parameter || '', Detail: m.location_point || '', Quantity: m.value ?? '', Unit: m.unit || '', Date: fmtDate(m.sample_date), Status: m.status || '' })),
    ];
    doExport(`annual-environmental-report-${year}.csv`, rows);
  };

  const registers = [
    { key: 'permits', label: 'Permit Register', rows: () => data.permits.map(p => ({ 'Permit #': p.permit_number, Type: p.type, Authority: p.issuing_authority || '', Expiry: fmtDate(p.expiry_date), Status: p.status })) },
    { key: 'monitoring', label: 'Monitoring Results', rows: () => data.monitoring.map(m => ({ Parameter: m.parameter, Value: m.value, Unit: m.unit, Limit: m.limit_value ?? '', Location: m.location_point || '', 'Sample Date': fmtDate(m.sample_date), Status: m.status || '' })) },
    { key: 'spills', label: 'Spill Incidents', rows: () => data.spills.map(s => ({ 'Spill ID': s.spill_id || '', Substance: s.substance || '', Quantity: s.quantity_spilled ?? '', Unit: s.unit || '', Severity: s.severity || '', Date: fmtDate(s.incident_date), Status: s.status || '' })) },
    { key: 'waste', label: 'Waste Manifests', rows: () => data.waste.map(w => ({ 'Manifest #': w.manifest_number, 'Waste Type': w.waste_type, Quantity: w.quantity ?? '', Unit: w.unit || '', Classification: w.classification || '', 'Disposal Facility': w.disposal_facility || '', Status: w.status || '' })) },
    { key: 'studies', label: 'Studies Register', rows: () => data.studies.map(s => ({ Title: s.title, Type: s.type, 'Cycle (yr)': s.cycle_years ?? '', 'Last Conducted': fmtDate(s.last_conducted_date), 'Next Due': fmtDate(s.next_due_date), Status: s.status || '' })) },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40] p-6">
        <h3 className="text-xl text-white font-bold mb-1 flex items-center gap-2"><FileText className="h-5 w-5 text-green-500" /> Compliance Reporting</h3>
        <p className="text-sm text-gray-400 mb-4">{currentOrganization?.name} · Generated {new Date().toLocaleDateString()}</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]" onClick={nuprcMonthlyPack} disabled={loading}>
            <FileDown className="mr-2 h-4 w-4" /> NUPRC Monthly Pack
          </Button>
          <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]" onClick={annualReport} disabled={loading}>
            <FileDown className="mr-2 h-4 w-4" /> Annual Environmental Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registers.map(r => {
          const count = data[r.key].length;
          return (
            <Card key={r.key} className="bg-[#1e1e30] border-[#2a2a40] p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold">{r.label}</h4>
                <p className="text-xs text-gray-400 mt-1">{loading ? 'Loading…' : `${count} record${count === 1 ? '' : 's'}`}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 self-start border-[#3a3a5a] text-gray-300 hover:text-white hover:bg-[#252541]"
                disabled={loading}
                onClick={() => doExport(`${r.key}-${stamp()}.csv`, r.rows())}
              >
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
