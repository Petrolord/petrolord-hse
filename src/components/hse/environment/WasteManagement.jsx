import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react';

export default function WasteManagement({ records }) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((rec) => (
          <div key={rec.id} className="bg-[#252541] rounded-lg border border-[#3a3a5a] p-4 hover:border-[#FFC107]/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-700/30 rounded-lg">
                  <Trash2 className="h-5 w-5 text-[#b0b0c0]" />
                </div>
                <div>
                  <p className="text-white font-medium">{rec.waste_type}</p>
                  <p className="text-xs text-[#7a7a9a]">{new Date(rec.disposal_date).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge className="bg-blue-500/10 text-blue-400">{rec.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-[#3a3a5a]">
              <div>
                <p className="text-[#7a7a9a] text-xs uppercase">Quantity</p>
                <p className="text-white font-mono">{rec.quantity} {rec.unit}</p>
              </div>
              <div>
                <p className="text-[#7a7a9a] text-xs uppercase">Method</p>
                <p className="text-white">{rec.disposal_method}</p>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <div className="col-span-full text-center text-[#7a7a9a] py-12">No waste records found.</div>}
      </div>
    </div>
  );
}