import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { trainingService } from '@/services/trainingService';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EMPTY, moduleTabTriggerClass, tableBodyClass, tableRowClass } from '@/components/petrolord/common/ui';
import { Plus, BookOpen, Calendar, Award, CheckSquare, LayoutDashboard } from 'lucide-react';
import TrainingProgramFilters from './TrainingProgramFilters';
import NewTrainingProgramModal from './NewTrainingProgramModal';
import TrainingCompetencyDashboard from './TrainingCompetencyDashboard';

// Inline simplified list components for immediate visibility
const GenericTable = ({ data, columns, emptyMessage }) => (
  <div className="flex-1 overflow-auto p-4">
    <table className="w-full min-w-[640px] text-sm text-left border-collapse bg-pl-surface border border-pl-border">
      <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-medium sticky top-0 z-10">
        <tr>{columns.map((c, i) => <th key={i} className="px-6 py-4">{c.header}</th>)}</tr>
      </thead>
      <tbody className={tableBodyClass}>
        {data.map((row, i) => (
          <tr key={row.id || i} className={tableRowClass}>
            {columns.map((c, j) => <td key={j} className="px-6 py-4 text-pl-text">{c.render ? c.render(row) : row[c.accessor]}</td>)}
          </tr>
        ))}
        {data.length === 0 && <tr><td colSpan={columns.length} className="p-8 text-center text-pl-muted">{emptyMessage}</td></tr>}
      </tbody>
    </table>
  </div>
);

export default function TrainingCompetencyModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    programs: [],
    schedule: [],
    records: [],
    competencies: [],
    assessments: [],
    stats: {}
  });
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '' });
  const [modals, setModals] = useState({ newProgram: false });

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      const [prog, sched, rec, comp, assess, stats] = await Promise.all([
        trainingService.getPrograms(currentOrganization.id, filters),
        trainingService.getSchedule(currentOrganization.id),
        trainingService.getRecords(currentOrganization.id),
        trainingService.getCompetencies(currentOrganization.id),
        trainingService.getAssessments(currentOrganization.id),
        trainingService.getStats(currentOrganization.id)
      ]);
      setData({ programs: prog || [], schedule: sched || [], records: rec || [], competencies: comp || [], assessments: assess || [], stats: stats || {} });
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [currentOrganization, activeTab, filters]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-pl-bg text-pl-text">
      {activeTab === 'programs' && <TrainingProgramFilters filters={filters} setFilters={setFilters} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col border-b border-pl-border bg-pl-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="font-pl-display text-xl font-semibold text-pl-text flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-pl-muted shrink-0" aria-hidden="true" /> Training & Competency
            </h2>
            <div className="flex items-center gap-2">
              {activeTab === 'programs' && (
                <Button size="sm" onClick={() => setModals({ ...modals, newProgram: true })}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Program
                </Button>
              )}
            </div>
          </div>
          <div className="px-4 pb-0 overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0 flex-nowrap w-max">
                <TabTrigger value="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <TabTrigger value="programs" icon={BookOpen} label="Programs" />
                <TabTrigger value="schedule" icon={Calendar} label="Schedule" />
                <TabTrigger value="records" icon={CheckSquare} label="Records" />
                <TabTrigger value="competency" icon={Award} label="Competency" />
                <TabTrigger value="assessments" icon={CheckSquare} label="Assessments" />
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-pl-bg">
          {activeTab === 'dashboard' && <TrainingCompetencyDashboard stats={data.stats} />}
          {activeTab === 'programs' && <GenericTable 
            data={data.programs} 
            emptyMessage="No training programs found."
            columns={[
              { header: 'ID', accessor: 'program_id' },
              { header: 'Name', accessor: 'program_name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Duration (Hrs)', render: r => <span className="font-pl-mono tabular-nums">{r.duration}</span> },
              { header: 'Status', render: r => <Badge variant={r.status === 'Active' ? 'success' : 'outline'}>{r.status}</Badge> }
            ]}
          />}
          {activeTab === 'schedule' && <GenericTable 
            data={data.schedule} 
            emptyMessage="No scheduled trainings."
            columns={[
              { header: 'Date', render: r => <span className="font-pl-mono tabular-nums whitespace-nowrap">{new Date(r.scheduled_date).toLocaleDateString()}</span> },
              { header: 'Program', render: r => r.program?.program_name },
              { header: 'Location', render: r => r.location?.name || 'TBD' },
              { header: 'Trainer', render: r => r.trainer?.raw_user_meta_data?.full_name || 'TBD' },
              { header: 'Status', accessor: 'status' }
            ]}
          />}
          {activeTab === 'records' && <GenericTable 
            data={data.records} 
            emptyMessage="No training records."
            columns={[
              { header: 'Date', render: r => <span className="font-pl-mono tabular-nums whitespace-nowrap">{new Date(r.training_date).toLocaleDateString()}</span> },
              { header: 'Employee', render: r => r.employee?.raw_user_meta_data?.full_name || 'Unknown' },
              { header: 'Program', render: r => r.program?.program_name },
              { header: 'Status', accessor: 'status' },
              { header: 'Score', render: r => r.score ? <span className="font-pl-mono tabular-nums">{r.score}%</span> : EMPTY }
            ]}
          />}
          {activeTab === 'competency' && <GenericTable 
            data={data.competencies} 
            emptyMessage="No competency framework defined."
            columns={[
              { header: 'ID', accessor: 'competency_id' },
              { header: 'Name', accessor: 'competency_name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Level', accessor: 'level' }
            ]}
          />}
          {activeTab === 'assessments' && <GenericTable 
            data={data.assessments} 
            emptyMessage="No assessments recorded."
            columns={[
              { header: 'Date', render: r => <span className="font-pl-mono tabular-nums whitespace-nowrap">{new Date(r.assessment_date).toLocaleDateString()}</span> },
              { header: 'Employee', render: r => r.employee?.raw_user_meta_data?.full_name },
              { header: 'Competency', render: r => r.competency?.competency_name },
              { header: 'Result', accessor: 'status' }
            ]}
          />}
        </div>
      </div>
      
      <NewTrainingProgramModal isOpen={modals.newProgram} onClose={() => setModals({ ...modals, newProgram: false })} onSuccess={fetchData} />
    </div>
  );
}

function TabTrigger({ value, icon: Icon, label }) {
  return (
    <TabsTrigger 
      value={value} 
      className={`${moduleTabTriggerClass} py-2 min-w-fit`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </TabsTrigger>
  );
}