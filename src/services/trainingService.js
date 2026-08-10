import { supabase } from '@/lib/customSupabaseClient';

// All training/competency domain tables live in the `hse` schema and are scoped
// by `org_id` (the gold-standard Work Permits pattern). Every read filters on the
// caller's organization; every method degrades to an empty result on error rather
// than throwing into the UI's swallowing try/catch.
const hse = () => supabase.schema('hse');

export const trainingService = {
  /**
   * Training programs for an org, with optional category/status/search filters
   * coming from <TrainingProgramFilters>.
   */
  async getPrograms(orgId, filters = {}) {
    if (!orgId) return [];
    let query = hse()
      .from('training_programs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.search) query = query.ilike('program_name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) { console.error('trainingService.getPrograms:', error); return []; }
    return data || [];
  },

  /**
   * Scheduled training sessions. Embeds the program name via the
   * training_schedule.program_id -> training_programs FK so the UI can render
   * `row.program.program_name`. Trainer/location are left unresolved (the UI
   * falls back to 'TBD') because they reference auth users / a separate sites
   * table that PostgREST can't embed here.
   */
  async getSchedule(orgId) {
    if (!orgId) return [];
    const { data, error } = await hse()
      .from('training_schedule')
      .select('*, program:program_id(program_name)')
      .eq('org_id', orgId)
      .order('scheduled_date', { ascending: true });
    if (error) { console.error('trainingService.getSchedule:', error); return []; }
    return data || [];
  },

  /**
   * Completed/attempted training records. The UI reads `training_date`, so we
   * alias the table's `date` column. Employee/program names are not linked on
   * this table, so those cells fall back to 'Unknown' in the UI.
   */
  async getRecords(orgId) {
    if (!orgId) return [];
    const { data, error } = await hse()
      .from('training_records')
      .select('*, training_date:date')
      .eq('org_id', orgId)
      .order('date', { ascending: false });
    if (error) { console.error('trainingService.getRecords:', error); return []; }
    return data || [];
  },

  /**
   * Competency framework (definitions), which is what the Competency tab lists
   * (competency_id / competency_name / category / level).
   */
  async getCompetencies(orgId) {
    if (!orgId) return [];
    const { data, error } = await hse()
      .from('competency_framework')
      .select('*')
      .eq('org_id', orgId)
      .order('competency_name', { ascending: true });
    if (error) { console.error('trainingService.getCompetencies:', error); return []; }
    return data || [];
  },

  /**
   * Competency assessments, embedding the assessed competency's name via the
   * competency_assessments.competency_id -> competency_framework FK.
   */
  async getAssessments(orgId) {
    if (!orgId) return [];
    const { data, error } = await hse()
      .from('competency_assessments')
      .select('*, competency:competency_id(competency_name)')
      .eq('org_id', orgId)
      .order('assessment_date', { ascending: false });
    if (error) { console.error('trainingService.getAssessments:', error); return []; }
    return data || [];
  },

  /**
   * KPI counts for the Training dashboard. All four are real org-scoped counts;
   * an empty org honestly returns zeros.
   */
  async getStats(orgId) {
    const empty = { activePrograms: 0, upcomingTrainings: 0, completedTrainings: 0, qualifiedPersonnel: 0 };
    if (!orgId) return empty;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const nowIso = new Date().toISOString();
      const [programs, schedule, records, competencies] = await Promise.all([
        hse().from('training_programs').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'Active'),
        hse().from('training_schedule').select('id', { count: 'exact', head: true }).eq('org_id', orgId).gte('scheduled_date', today),
        hse().from('training_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'Completed'),
        // Personnel holding a competency that hasn't expired (null expiry = no expiry).
        hse().from('competency_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId).or(`expiry_date.is.null,expiry_date.gte.${nowIso}`),
      ]);
      return {
        activePrograms: programs.count || 0,
        upcomingTrainings: schedule.count || 0,
        completedTrainings: records.count || 0,
        qualifiedPersonnel: competencies.count || 0,
      };
    } catch (e) {
      console.error('trainingService.getStats:', e);
      return empty;
    }
  },

  /**
   * Real chart data for the Training dashboard, org-scoped:
   *   - complianceTrend: completed training records per month, trailing 6 months (line)
   *   - competencyGaps: average assessment score per competency category (radar),
   *     joined competency_assessments -> competency_framework for the category.
   * Both return []/all-zero when there's no underlying data, so the dashboard
   * shows an honest empty state rather than a fabricated chart.
   */
  async getCharts(orgId) {
    const empty = { complianceTrend: [], competencyGaps: [] };
    if (!orgId) return empty;
    try {
      const [records, assessments] = await Promise.all([
        hse().from('training_records').select('status, date').eq('org_id', orgId),
        hse().from('competency_assessments').select('score, competency:competency_id(category)').eq('org_id', orgId),
      ]);
      const recs = records.data || [];
      const assess = assessments.data || [];

      // Line: completed trainings per month over the trailing 6 months.
      const now = new Date();
      const months = [];
      const monthIndex = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthIndex[key] = months.length;
        months.push({ month: d.toLocaleString('default', { month: 'short' }), completed: 0 });
      }
      recs.forEach(r => {
        if ((r.status || '').toLowerCase() !== 'completed' || !r.date) return;
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthIndex) months[monthIndex[key]].completed += 1;
      });

      // Radar: average assessment score per competency category.
      const catAgg = {};
      assess.forEach(a => {
        const cat = a.competency?.category;
        if (!cat || a.score == null) return;
        if (!catAgg[cat]) catAgg[cat] = { sum: 0, n: 0 };
        catAgg[cat].sum += Number(a.score);
        catAgg[cat].n += 1;
      });
      const competencyGaps = Object.entries(catAgg).map(([category, { sum, n }]) => ({
        category,
        score: Math.round(sum / n),
      }));

      return { complianceTrend: months, competencyGaps };
    } catch (e) {
      console.error('trainingService.getCharts:', e);
      return empty;
    }
  },

  /**
   * Create a training program. Payload comes from <NewTrainingProgramModal>
   * already shaped to the table's columns.
   */
  async createProgram(payload) {
    const { data, error } = await hse()
      .from('training_programs')
      .insert([{
        org_id: payload.org_id,
        program_id: payload.program_id,
        program_name: payload.program_name,
        category: payload.category,
        duration: payload.duration,
        description: payload.description,
        target_audience: payload.target_audience,
        status: payload.status || 'Active',
        created_by: payload.created_by,
      }])
      .select()
      .single();
    if (error) { console.error('trainingService.createProgram:', error); throw error; }
    return data;
  },

  /**
   * Real dashboard aggregation for the main HSE dashboard's Training tile.
   * Returns honest counts — `complianceRate` is null when there are no
   * competency records to measure.
   */
  async getDashboardStats(orgId) {
    try {
      const [training, competency] = await Promise.all([
        hse().from('training_records').select('status').eq('org_id', orgId),
        hse().from('competency_records').select('status, expiry_date').eq('org_id', orgId),
      ]);

      const trainingRows = training.data || [];
      const competencyRows = competency.data || [];
      const totalCompetencies = competencyRows.length;
      const validCompetencies = competencyRows.filter(
        c => !c.expiry_date || new Date(c.expiry_date) > new Date()
      ).length;
      const complianceRate = totalCompetencies > 0
        ? Math.round((validCompetencies / totalCompetencies) * 100)
        : null;

      return {
        trainingRecords: trainingRows.length,
        totalCompetencies,
        validCompetencies,
        complianceRate,
      };
    } catch (e) {
      console.error('Error getting training stats:', e);
      return { trainingRecords: 0, totalCompetencies: 0, validCompetencies: 0, complianceRate: null };
    }
  },

  /**
   * Per-user security/awareness training (separate `security_training` table,
   * used outside the Training & Competency module). Left intact.
   */
  async getUserTraining(userId) {
    if (!userId) return [];
    const { data } = await supabase
      .from('security_training')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  },
};
