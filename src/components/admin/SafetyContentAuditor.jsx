import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function SafetyContentAuditor() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safety_moments')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setMoments(data || []);
    } catch (err) {
      console.error("Failed to fetch safety moments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const checkField = (value, type = 'text') => {
    if (value === null || value === undefined) return { status: 'missing', label: 'Missing' };
    
    if (type === 'array') {
      if (Array.isArray(value) && value.length > 0) return { status: 'ok', label: `${value.length} items` };
      return { status: 'empty', label: 'Empty Array' };
    }
    
    if (type === 'object') {
      if (value && Object.keys(value).length > 0) return { status: 'ok', label: 'Populated' };
      return { status: 'empty', label: 'Empty Object' };
    }
    
    if (typeof value === 'string' && value.length > 10) return { status: 'ok', label: 'Populated' };
    
    return { status: 'empty', label: 'Too Short/Empty' };
  };

  const StatusIcon = ({ status }) => {
    if (status === 'ok') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const targetTopics = [
    'Office Ergonomics',
    'Micro-Breaks',
    'Driving Ergonomics',
    'Stress at Work',
    'CPR Awareness',
    'Spill Response'
  ];

  return (
    <div className="p-6 bg-[#1a1a2e] min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Safety Content Auditor</h1>
            <p className="text-[#7a7a9a]">Inspect database content population for Safety Moments</p>
          </div>
          <Button onClick={fetchMoments} variant="outline" className="gap-2 border-[#3a3a5a] text-white hover:bg-[#252541]">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh Data
          </Button>
        </div>

        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white">Database Content Status</CardTitle>
            <CardDescription className="text-[#7a7a9a]">
              Found {moments.length} safety moments in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded-md border border-[#3a3a5a]">
              <Table>
                <TableHeader className="bg-[#1a1a2e] sticky top-0 z-10">
                  <TableRow className="border-[#3a3a5a] hover:bg-[#1a1a2e]">
                    <TableHead className="text-white w-[50px]"></TableHead>
                    <TableHead className="text-white">Topic Title</TableHead>
                    <TableHead className="text-white">Recap</TableHead>
                    <TableHead className="text-white">Key Points</TableHead>
                    <TableHead className="text-white">Do/Don't</TableHead>
                    <TableHead className="text-white">Scenario</TableHead>
                    <TableHead className="text-white">Checklist</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moments.map((moment) => {
                    const isTarget = targetTopics.includes(moment.title);
                    const recapCheck = checkField(moment.one_minute_recap);
                    const pointsCheck = checkField(moment.key_points, 'array');
                    const doCheck = checkField(moment.do_list, 'array');
                    const scenarioCheck = checkField(moment.incident_scenario, 'object');
                    const checklistCheck = checkField(moment.site_checklist, 'array');
                    
                    // Simple completeness calculation
                    const checks = [recapCheck, pointsCheck, doCheck, scenarioCheck, checklistCheck];
                    const missingCount = checks.filter(c => c.status !== 'ok').length;
                    const isComplete = missingCount === 0;

                    return (
                      <React.Fragment key={moment.id}>
                        <TableRow 
                          className={cn(
                            "border-[#3a3a5a] hover:bg-[#2a2a45] cursor-pointer transition-colors",
                            isTarget && "bg-[#2a2a45]/50"
                          )}
                          onClick={() => toggleExpand(moment.id)}
                        >
                          <TableCell>
                            {expandedId === moment.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              {moment.title}
                              {isTarget && <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 text-[10px] border-0">Target</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={recapCheck.status} />
                              <span className="text-xs text-[#b0b0c0]">{recapCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={pointsCheck.status} />
                              <span className="text-xs text-[#b0b0c0]">{pointsCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={doCheck.status} />
                              <span className="text-xs text-[#b0b0c0]">{doCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={scenarioCheck.status} />
                              <span className="text-xs text-[#b0b0c0]">{scenarioCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={checklistCheck.status} />
                              <span className="text-xs text-[#b0b0c0]">{checklistCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge className="bg-green-900/50 text-green-200 border-green-800">Complete</Badge>
                            ) : (
                              <Badge className="bg-red-900/50 text-red-200 border-red-800">Incomplete</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedId === moment.id && (
                          <TableRow className="bg-[#151525] border-[#3a3a5a] hover:bg-[#151525]">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm text-[#b0b0c0]">
                                <div>
                                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#FFC107]" /> Why It Matters
                                  </h4>
                                  <p className="bg-[#1a1a2e] p-3 rounded border border-[#3a3a5a]">
                                    {moment.why_it_matters || "No content available."}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" /> Incident Scenario
                                  </h4>
                                  <div className="bg-[#1a1a2e] p-3 rounded border border-[#3a3a5a]">
                                    {moment.incident_scenario ? (
                                      <pre className="whitespace-pre-wrap font-sans text-xs">
                                        {JSON.stringify(moment.incident_scenario, null, 2)}
                                      </pre>
                                    ) : "No scenario data."}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <h4 className="font-bold text-white mb-2">Raw Data Preview</h4>
                                  <div className="flex gap-4">
                                     <div className="flex-1">
                                        <p className="text-xs font-semibold mb-1">Key Points (First 3)</p>
                                        <ul className="list-disc pl-4 text-xs space-y-1">
                                          {moment.key_points?.slice(0,3).map((kp, i) => <li key={i}>{kp}</li>)}
                                          {(!moment.key_points || moment.key_points.length === 0) && <li>None</li>}
                                        </ul>
                                     </div>
                                     <div className="flex-1">
                                        <p className="text-xs font-semibold mb-1">References</p>
                                        <ul className="list-disc pl-4 text-xs space-y-1">
                                          {moment.references?.map((ref, i) => <li key={i}>{ref}</li>)}
                                          {(!moment.references || moment.references.length === 0) && <li>None</li>}
                                        </ul>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}