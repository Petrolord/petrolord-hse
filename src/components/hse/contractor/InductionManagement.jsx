import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { EMPTY, tableHeadClass, tableBodyClass, tableRowClass } from '@/components/petrolord/common/ui';

// Lists the induction records stored in hse.safety_inductions. The previous
// version was static: a hardcoded "12 Contractors waiting" count, buttons with
// no handlers for video modules and certificate printing, and a placeholder
// where the records table should be.
export default function InductionManagement() {
  const { currentOrganization } = useHSE();
  const [inductions, setInductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    contractorService.getInductions(currentOrganization.id)
      .then((rows) => { setInductions(rows || []); setError(false); })
      .catch((e) => { console.error('Error loading inductions:', e); setError(true); })
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const pending = inductions.filter(i => (i.status || '').toLowerCase() === 'pending').length;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-pl-text">Induction Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-pl-sunken border border-pl-border mb-4"><Users className="h-8 w-8 text-pl-muted" aria-hidden="true" /></div>
            <h3 className="text-lg font-semibold text-pl-text">Pending Inductions</h3>
            <p className="text-sm text-pl-muted mt-2">
              {loading || error ? EMPTY : `${pending} of ${inductions.length} induction records pending.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 bg-pl-surface border border-pl-border rounded-lg overflow-auto">
        {loading ? (
          <p className="text-center text-pl-muted py-8">Loading induction records...</p>
        ) : error ? (
          <p className="text-center text-pl-muted py-8">Could not load induction records.</p>
        ) : inductions.length === 0 ? (
          <p className="text-center text-pl-muted py-8">No induction records yet.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className={tableHeadClass}>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Contractor</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody className={`${tableBodyClass} text-pl-text`}>
              {inductions.map((i) => (
                <tr key={i.id} className={tableRowClass}>
                  <td className="px-4 py-2 font-pl-mono tabular-nums">{i.date ? new Date(i.date).toLocaleDateString() : EMPTY}</td>
                  <td className="px-4 py-2">{i.contractor?.company_name || EMPTY}</td>
                  <td className="px-4 py-2">{i.type || EMPTY}</td>
                  <td className="px-4 py-2">{i.status || EMPTY}</td>
                  <td className="px-4 py-2 font-pl-mono tabular-nums">{i.score ?? EMPTY}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
