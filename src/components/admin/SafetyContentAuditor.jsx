import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AccountScope, AccountPage, AccountHeader } from '@/components/account/accountChrome';

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
    if (status === 'ok') return <CheckCircle2 className="h-4 w-4 text-pl-success-text" aria-hidden="true" />;
    return <XCircle className="h-4 w-4 text-pl-danger-text" aria-hidden="true" />;
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

  // /auditor sits outside the signed-in layout, so it opens its own
  // design-system scope (AccountScope) with the light/dark toggle in its
  // header (docs/scope/DesignSystem-Rollout.md section 4.2, batch 3A).
  return (
    <AccountScope testId="safety-content-auditor-theme-scope" className="text-pl-text">
      <AccountPage width="max-w-7xl">
        <AccountHeader
          eyebrow="Admin"
          icon={FileText}
          title="Safety Content Auditor"
          description="Inspect database content population for Safety Moments"
          actions={(
            <Button onClick={fetchMoments} variant="outline" className="gap-2">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" /> Refresh Data
            </Button>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Database Content Status</CardTitle>
            <CardDescription>
              Found <span className="font-pl-mono tabular-nums">{moments.length}</span> safety moments in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* A plain scroll box: the table scrolls sideways on a phone (the
                Radix ScrollArea only scrolled down and clipped the columns). */}
            <div className="h-[600px] overflow-auto rounded-md border border-pl-border">
              <Table>
                <TableHeader className="bg-pl-sunken sticky top-0 z-10">
                  <TableRow className="hover:bg-pl-sunken">
                    <TableHead className="w-[50px]"><span className="sr-only">Expand</span></TableHead>
                    <TableHead>Topic Title</TableHead>
                    <TableHead>Recap</TableHead>
                    <TableHead>Key Points</TableHead>
                    <TableHead>Do/Don't</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Status</TableHead>
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
                            "cursor-pointer transition-colors",
                            isTarget && "bg-pl-sunken/60"
                          )}
                          onClick={() => toggleExpand(moment.id)}
                        >
                          <TableCell>
                            {expandedId === moment.id ? <ChevronUp className="h-4 w-4 text-pl-muted" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-pl-muted" aria-hidden="true" />}
                          </TableCell>
                          <TableCell className="font-medium text-pl-text">
                            <div className="flex items-center gap-2">
                              {moment.title}
                              {isTarget && <Badge variant="neutral" className="text-[10px]">Target</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={recapCheck.status} />
                              <span className="text-xs text-pl-muted">{recapCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={pointsCheck.status} />
                              <span className="text-xs text-pl-muted">{pointsCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={doCheck.status} />
                              <span className="text-xs text-pl-muted">{doCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={scenarioCheck.status} />
                              <span className="text-xs text-pl-muted">{scenarioCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={checklistCheck.status} />
                              <span className="text-xs text-pl-muted">{checklistCheck.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge variant="success">Complete</Badge>
                            ) : (
                              <Badge variant="danger">Incomplete</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedId === moment.id && (
                          <TableRow className="bg-pl-sunken hover:bg-pl-sunken">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-pl-muted">
                                <div>
                                  <h4 className="font-semibold text-pl-text mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-pl-accent-text" aria-hidden="true" /> Why It Matters
                                  </h4>
                                  <p className="bg-pl-surface p-3 rounded border border-pl-border">
                                    {moment.why_it_matters || "No content available."}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-pl-text mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-pl-warning-text" aria-hidden="true" /> Incident Scenario
                                  </h4>
                                  <div className="bg-pl-surface p-3 rounded border border-pl-border">
                                    {moment.incident_scenario ? (
                                      <pre className="whitespace-pre-wrap font-pl-mono text-xs">
                                        {JSON.stringify(moment.incident_scenario, null, 2)}
                                      </pre>
                                    ) : "No scenario data."}
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <h4 className="font-semibold text-pl-text mb-2">Raw Data Preview</h4>
                                  <div className="flex flex-col sm:flex-row gap-4">
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
            </div>
          </CardContent>
        </Card>
      </AccountPage>
    </AccountScope>
  );
}