import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { debugService } from '@/services/debugService';

export default function MasterAppsDebug() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null);
  const [schema, setSchema] = useState([]);
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    try {
      setLoading(true);
      const [countData, schemaData, sampleData] = await Promise.all([
        debugService.getMasterAppsCount(),
        debugService.getMasterAppsSchema(),
        debugService.getSampleApps()
      ]);
      setCount(countData);
      setSchema(schemaData);
      setSamples(sampleData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white flex items-center gap-2"><Loader2 className="animate-spin" /> Analyzing Database...</div>;

  return (
    <div className="space-y-6 p-6 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="text-blue-400" /> Master Apps Audit
        </h1>
        <Badge variant="outline" className={count === 238 ? "bg-green-900/50 text-green-400 border-green-800" : "bg-yellow-900/50 text-yellow-400 border-yellow-800"}>
          {count === 238 ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
          {count} Records Found (Expected: 238)
        </Badge>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 p-4 rounded text-red-200">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Schema Structure</CardTitle>
            <CardDescription>Inferred from record keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {schema.map(key => (
                <Badge key={key} variant="secondary" className="bg-[#2d2d4a] text-blue-300 font-mono">
                  {key}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">App Distribution</CardTitle>
            <CardDescription>By Module (Sample)</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow className="border-[#3a3a5a]">
                  <TableHead className="text-gray-400">App Name</TableHead>
                  <TableHead className="text-gray-400">Module</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((app) => (
                  <TableRow key={app.id} className="border-[#3a3a5a]">
                    <TableCell className="font-medium text-white">{app.app_name}</TableCell>
                    <TableCell className="text-gray-300">{app.module}</TableCell>
                    <TableCell>
                      <Badge className={app.status === 'active' ? "bg-green-900 text-green-300" : "bg-gray-700"}>
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}