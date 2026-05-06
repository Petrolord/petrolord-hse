import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BulkOperations({ onImport, dataToExport, exportName = "data" }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) {
      toast({ title: "Export Failed", description: "No data to export.", variant: "destructive" });
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportName}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Successful", description: `${rows.length} records exported.` });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const results = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const currentLine = lines[i].split(',');
          const obj = {};
          
          headers.forEach((header, index) => {
            let val = currentLine[index]?.trim();
             // Remove quotes if present
            if (val && val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            obj[header] = val;
          });
          results.push(obj);
        }

        if (onImport) onImport(results);
        toast({ title: "Import Parsed", description: `Ready to process ${results.length} records.` });
      } catch (err) {
        toast({ title: "Import Failed", description: "Invalid CSV format.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = null; 
  };

  return (
    <div className="flex gap-2">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />
      <Button variant="outline" size="sm" className="border-[#3a3a5a] text-[#b0b0c0]" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" /> Import CSV
      </Button>
      <Button variant="outline" size="sm" className="border-[#3a3a5a] text-[#b0b0c0]" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" /> Export CSV
      </Button>
    </div>
  );
}