import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';

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
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Induction Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-green-500/10 mb-4"><Users className="h-8 w-8 text-green-400" /></div>
            <h3 className="text-lg font-bold text-white">Pending Inductions</h3>
            <p className="text-sm text-[#7a7a9a] mt-2">
              {loading || error ? '--' : `${pending} of ${inductions.length} induction records pending.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 bg-[#252541] border border-[#3a3a5a] rounded-lg p-4 overflow-auto">
        {loading ? (
          <p className="text-center text-[#7a7a9a] py-8">Loading induction records...</p>
        ) : error ? (
          <p className="text-center text-[#7a7a9a] py-8">Could not load induction records.</p>
        ) : inductions.length === 0 ? (
          <p className="text-center text-[#7a7a9a] py-8">No induction records yet.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-[#7a7a9a] text-xs uppercase">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Contractor</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {inductions.map((i) => (
                <tr key={i.id} className="border-t border-[#3a3a5a]">
                  <td className="py-2 pr-4">{i.date ? new Date(i.date).toLocaleDateString() : '--'}</td>
                  <td className="py-2 pr-4">{i.contractor?.company_name || '--'}</td>
                  <td className="py-2 pr-4">{i.type || '--'}</td>
                  <td className="py-2 pr-4">{i.status || '--'}</td>
                  <td className="py-2">{i.score ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
