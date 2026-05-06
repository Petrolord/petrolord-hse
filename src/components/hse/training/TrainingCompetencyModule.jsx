import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { trainingService } from '@/services/trainingService';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Calendar, Award, CheckSquare, LayoutDashboard } from 'lucide-react';
import TrainingProgramFilters from './TrainingProgramFilters';
import NewTrainingProgramModal from './NewTrainingProgramModal';
import TrainingCompetencyDashboard from './TrainingCompetencyDashboard';

// Inline simplified list components for immediate visibility
const GenericTable = ({ data, columns, emptyMessage }) => (
  <div className="flex-1 overflow-auto p-4">
    <table className="w-full text-sm text-left border-collapse">
      <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
        <tr>{columns.map((c, i) => <th key={i} className="px-6 py-4">{c.header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-[#3a3a5a]">
        {data.map((row, i) => (
          <tr key={row.id || i} className="hover:bg-[#2d2d4a]">
            {columns.map((c, j) => <td key={j} className="px-6 py-4 text-[#e0e0e0]">{c.render ? c.render(row) : row[c.accessor]}</td>)}
          </tr>
        ))}
        {data.length === 0 && <tr><td colSpan={columns.length} className="p-8 text-center text-[#7a7a9a]">{emptyMessage}</td></tr>}
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      {activeTab === 'programs' && <TrainingProgramFilters filters={filters} setFilters={setFilters} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" /> Training & Competency
            </h2>
            <div className="flex items-center gap-2">
              {activeTab === 'programs' && (
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" size="sm" onClick={() => setModals({ ...modals, newProgram: true })}>
                  <Plus className="mr-2 h-4 w-4" /> New Program
                </Button>
              )}
            </div>
          </div>
          <div className="px-4 pb-0 overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-6">
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

        <div className="flex-1 overflow-hidden bg-[var(--bg-app)]">
          {activeTab === 'dashboard' && <TrainingCompetencyDashboard stats={data.stats} />}
          {activeTab === 'programs' && <GenericTable 
            data={data.programs} 
            emptyMessage="No training programs found."
            columns={[
              { header: 'ID', accessor: 'program_id' },
              { header: 'Name', accessor: 'program_name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Duration (Hrs)', accessor: 'duration' },
              { header: 'Status', render: r => <span className={`px-2 py-1 rounded text-xs ${r.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{r.status}</span> }
            ]}
          />}
          {activeTab === 'schedule' && <GenericTable 
            data={data.schedule} 
            emptyMessage="No scheduled trainings."
            columns={[
              { header: 'Date', render: r => new Date(r.scheduled_date).toLocaleDateString() },
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
              { header: 'Date', render: r => new Date(r.training_date).toLocaleDateString() },
              { header: 'Employee', render: r => r.employee?.raw_user_meta_data?.full_name || 'Unknown' },
              { header: 'Program', render: r => r.program?.program_name },
              { header: 'Status', accessor: 'status' },
              { header: 'Score', render: r => r.score ? `${r.score}%` : '-' }
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
              { header: 'Date', render: r => new Date(r.assessment_date).toLocaleDateString() },
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
      className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none bg-transparent px-0 py-2 text-[#7a7a9a] hover:text-white transition-all flex items-center gap-2"
    >
      <Icon className="h-4 w-4" /> {label}
    </TabsTrigger>
  );
}