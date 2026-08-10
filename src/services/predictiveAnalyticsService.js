import { supabase } from '@/lib/customSupabaseClient';

// Minimum combined quick reports + incidents before a forecast is worth the
// AI call; below this the model has nothing real to reason from.
const MIN_FORECAST_DATA_POINTS = 5;

/**
 * Petrolord AI Safety Predictor - Phase 1: Data Aggregation & Foundation
 * This service aggregates data from Incidents, Actions, Audits, and Environment
 * to create a normalized dataset for future AI modeling.
 */
export const predictiveAnalyticsService = {
  
  /**
   * Aggregates all safety data for a specific organization
   * Acts as the "Data Foundation" for the AI model
   */
  async getAggregatedSafetyData(orgId) {
    if (!orgId) return null;

    // Parallel fetch for performance
    const [incidents, actions, audits, envData, hazards] = await Promise.all([
      this.fetchIncidents(orgId),
      this.fetchActions(orgId),
      this.fetchAudits(orgId),
      this.fetchEnvironmentalData(orgId),
      this.fetchHazards(orgId)
    ]);

    return {
      metrics: this.calculateKPIMetrics(incidents, actions, audits, hazards),
      trends: this.calculateTrends(incidents),
      risk_factors: this.identifyRiskFactors(incidents, actions, audits, hazards),
      raw_data: { incidents, actions, audits, envData, hazards } // For ML Training
    };
  },

  // --- Data Fetchers ---

  async fetchIncidents(orgId) {
    const { data } = await supabase
      .from('incidents')
      .select('id, report_type, severity, incident_date, status, site_id, hazard_category')
      .eq('organization_id', orgId)
      .order('incident_date', { ascending: false });
    return data || [];
  },

  async fetchActions(orgId) {
    const { data } = await supabase
      .from('actions')
      .select('id, status, priority, due_date, updated_at, effectiveness_score')
      .eq('organization_id', orgId);
    return data || [];
  },

  async fetchAudits(orgId) {
    try {
      const { data } = await supabase
        .from('safety_audits')
        .select('compliance_score, audit_date')
        .eq('organization_id', orgId)
        .order('audit_date', { ascending: false })
        .limit(10);
      return data || [];
    } catch (e) { return []; } 
  },

  async fetchEnvironmentalData(orgId) {
    try {
      const { data } = await supabase
        .from('environmental_monitoring')
        .select('*')
        .eq('organization_id', orgId)
        .order('reading_time', { ascending: false })
        .limit(50);
      return data || [];
    } catch (e) { return []; }
  },

  async fetchHazards(orgId) {
    try {
      const { data } = await supabase
        .from('hazard_assessments')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'active');
      return data || [];
    } catch (e) { return []; }
  },

  // --- Normalization & Calculation Engines ---

  calculateKPIMetrics(incidents, actions, audits, hazards) {
    const totalIncidents = incidents.filter(i => ['Incident', 'Accident'].includes(i.report_type)).length;
    const totalNearMisses = incidents.filter(i => i.report_type === 'Near Miss').length;
    
    // Near-miss to Incident Ratio (Leading Indicator)
    const ratio = totalIncidents > 0 ? (totalNearMisses / totalIncidents).toFixed(1) : totalNearMisses;

    // Corrective Action Closure Rate
    const closedActions = actions.filter(a => a.status === 'closed' || a.status === 'completed').length;
    const closureRate = actions.length > 0 ? Math.round((closedActions / actions.length) * 100) : 0;

    // Average Compliance
    const avgCompliance = audits.length > 0 
      ? Math.round(audits.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / audits.length) 
      : 0;

    return {
      incident_count: totalIncidents,
      near_miss_count: totalNearMisses,
      nm_incident_ratio: ratio,
      action_closure_rate: closureRate,
      avg_compliance_score: avgCompliance,
      active_hazards: hazards.length
    };
  },

  calculateTrends(incidents) {
    // Group by month for last 6 months
    const trends = {};
    const months = 6;
    
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trends[key] = { incidents: 0, nearmisses: 0 };
    }

    incidents.forEach(inc => {
      if (!inc.incident_date) return;
      const date = new Date(inc.incident_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (trends[key]) {
        if (['Incident', 'Accident'].includes(inc.report_type)) {
          trends[key].incidents++;
        } else if (inc.report_type === 'Near Miss') {
          trends[key].nearmisses++;
        }
      }
    });

    return Object.entries(trends)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  identifyRiskFactors(incidents, actions, audits, hazards) {
    const riskFactors = [];

    // 1. High Incident Severity Detection
    const criticalIncidents = incidents.filter(i => ['Critical', 'High'].includes(i.severity)).length;
    if (criticalIncidents > 0) {
      riskFactors.push({
        type: 'critical_severity',
        severity: 'High',
        message: `${criticalIncidents} critical/high severity incidents recorded recently.`
      });
    }

    // 2. Action Lag Detection
    const overdueActions = actions.filter(a => {
      return (a.status !== 'closed' && a.status !== 'completed') && new Date(a.due_date) < new Date();
    }).length;
    
    if (overdueActions > 5) {
      riskFactors.push({
        type: 'action_lag',
        severity: 'Medium',
        message: `${overdueActions} corrective actions are overdue.`
      });
    }

    // 3. Compliance Dip
    if (audits.length >= 2) {
      const latest = audits[0].compliance_score;
      const previous = audits[1].compliance_score;
      if (latest < previous) {
        riskFactors.push({
          type: 'compliance_dip',
          severity: 'Medium',
          message: 'Safety compliance score has dropped since last audit.'
        });
      }
    }

    // 4. High Risk Hazards
    const highRiskHazards = hazards.filter(h => h.likelihood === 'High' && h.impact === 'Severe').length;
    if (highRiskHazards > 0) {
      riskFactors.push({
        type: 'high_risk_hazard',
        severity: 'High',
        message: `${highRiskHazards} identified hazards have High Likelihood & Severe Impact.`
      });
    }

    return riskFactors;
  },

  // ===========================================================================
  // AI FORECAST — turns the aggregated history into a forward-looking prediction
  // via the forecast-safety edge function (OpenAI), persists it to the RLS-
  // protected `predictions` table, and scores past forecasts against reality.
  // ===========================================================================

  // Submitted reports (the behaviours/events the user wants the model to reason over).
  async fetchQuickReports(orgId) {
    const { data } = await supabase
      .from('quick_reports')
      .select('category, severity, status, hazard_classification, location, department_id, created_at, transcription, root_cause')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(200);
    return data || [];
  },

  _tally(rows, key) {
    const m = {};
    rows.forEach(r => { const v = (r[key] || '').toString().trim() || 'Unspecified'; m[v] = (m[v] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  },

  // Builds the compact, token-aware payload sent to the forecasting model.
  async buildForecastSummary(orgId) {
    const [agg, quickReports] = await Promise.all([
      this.getAggregatedSafetyData(orgId),
      this.fetchQuickReports(orgId),
    ]);
    const incidents = agg?.raw_data?.incidents || [];

    const recentReports = quickReports.slice(0, 25).map(r => ({
      category: r.category || r.hazard_classification || 'Unspecified',
      severity: r.severity || 'unknown',
      location: r.location || 'Unspecified',
      note: (r.root_cause || r.transcription || '').toString().slice(0, 160),
    }));

    return {
      window: 'last ~6 months of submitted reports',
      metrics: agg?.metrics || {},
      monthly_trends: agg?.trends || [],
      detected_risk_factors: agg?.risk_factors || [],
      submitted_reports: {
        total: quickReports.length,
        by_category: this._tally(quickReports, 'category'),
        by_severity: this._tally(quickReports, 'severity'),
        hotspot_locations: this._tally(quickReports, 'location'),
        recent_samples: recentReports,
      },
      incidents: {
        total: incidents.length,
        by_category: this._tally(incidents, 'hazard_category'),
        by_severity: this._tally(incidents, 'severity'),
      },
    };
  },

  // Generate a fresh forecast, persist it, and return it.
  async generateForecast(orgId) {
    if (!orgId) throw new Error('generateForecast requires an organization id');

    // Best-effort: score any matured predictions first so the model gets calibration.
    let priorAccuracy = null;
    try {
      await this.reconcileOutcomes(orgId);
      const acc = await this.getForecastAccuracy(orgId);
      priorAccuracy = acc?.accuracy ?? null; // edge fn expects a number|null
    } catch (e) { /* non-fatal */ }

    const summary = await this.buildForecastSummary(orgId);

    // A forecast from an empty history is noise (and a wasted AI call).
    // Require a handful of real data points before invoking the model.
    const dataPoints =
      (summary?.submitted_reports?.total || 0) +
      (summary?.incidents?.total || 0);
    if (dataPoints < MIN_FORECAST_DATA_POINTS) {
      throw new Error(
        `Not enough safety data to forecast yet. Submit at least ${MIN_FORECAST_DATA_POINTS} observations or incidents first (you have ${dataPoints}).`
      );
    }

    const { data, error } = await supabase.functions.invoke('forecast-safety', {
      body: { summary, priorAccuracy },
    });
    if (error) throw new Error(error.message || 'Forecast service unavailable.');
    if (data?.error) throw new Error(data.error);

    await this.persistForecast(orgId, data);
    return data;
  },

  async persistForecast(orgId, forecast) {
    const horizon = forecast.horizon_days || 30;
    const expiresAt = new Date(Date.now() + horizon * 24 * 60 * 60 * 1000).toISOString();

    // Headline row — full forecast object, used for display. A silent RLS
    // rejection here previously made the forecast render once and then
    // vanish on reload, so surface the failure.
    const { error: headlineError } = await supabase.from('predictions').insert({
      organization_id: orgId,
      prediction_type: 'safety_forecast',
      predicted_value: forecast,
      confidence_level: forecast.confidence ?? null,
      timeframe: `${horizon} days`,
      expires_at: expiresAt,
    });
    if (headlineError) {
      console.error('persistForecast: headline insert failed:', headlineError);
      throw new Error('The forecast was generated but could not be saved. Please try again or contact support.');
    }

    // One row per predicted incident — these drive the feedback loop.
    const incidentRows = (forecast.predicted_incidents || []).map(pi => ({
      organization_id: orgId,
      prediction_type: 'incident_forecast',
      predicted_value: pi,
      probability: typeof pi.likelihood === 'number' ? pi.likelihood : null,
      confidence_level: forecast.confidence ?? null,
      timeframe: pi.timeframe || `${horizon} days`,
      affected_department: pi.department || null,
      expires_at: expiresAt,
    }));
    if (incidentRows.length) {
      const { error: incidentsError } = await supabase.from('predictions').insert(incidentRows);
      if (incidentsError) {
        // Headline persisted, so the forecast still displays; the feedback
        // loop just skips this round. Log rather than fail.
        console.error('persistForecast: incident rows insert failed:', incidentsError);
      }
    }

    // Best-effort insight record (ai_insights has no RLS we depend on).
    try {
      await supabase.from('ai_insights').insert({
        org_id: orgId,
        type: 'safety_forecast',
        title: `Safety outlook — next ${horizon} days (${forecast.overall_risk_level || 'n/a'} risk)`,
        description: forecast.summary || '',
        confidence_score: forecast.confidence ?? null,
        metadata: forecast,
      });
    } catch (e) { /* non-fatal */ }
  },

  // Latest stored forecast for display (null if none yet).
  async getLatestForecast(orgId) {
    if (!orgId) return null;
    const { data } = await supabase
      .from('predictions')
      .select('id, predicted_value, confidence_level, timeframe, created_at, expires_at')
      .eq('organization_id', orgId)
      .eq('prediction_type', 'safety_forecast')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return { ...data.predicted_value, _generated_at: data.created_at, _expires_at: data.expires_at };
  },

  _categoryMatch(actual, predicted) {
    const a = (actual || '').toString().toLowerCase().trim();
    const p = (predicted || '').toString().toLowerCase().trim();
    if (!a || !p) return false;
    return a === p || a.includes(p) || p.includes(a);
  },

  // Score matured incident_forecast rows against what actually happened.
  async reconcileOutcomes(orgId) {
    const now = new Date().toISOString();
    const { data: matured } = await supabase
      .from('predictions')
      .select('id, predicted_value, created_at, expires_at')
      .eq('organization_id', orgId)
      .eq('prediction_type', 'incident_forecast')
      .is('actual_outcome', null)
      .lt('expires_at', now);

    if (!matured || matured.length === 0) return { scored: 0 };

    const earliest = matured.reduce((m, p) => (p.created_at < m ? p.created_at : m), matured[0].created_at);

    const [{ data: incidents }, { data: qrs }] = await Promise.all([
      supabase.from('incidents')
        .select('hazard_category, report_type, incident_date, created_at')
        .eq('organization_id', orgId).gte('incident_date', earliest),
      supabase.from('quick_reports')
        .select('category, hazard_classification, created_at')
        .eq('organization_id', orgId).gte('created_at', earliest),
    ]);

    const inc = incidents || [];
    const qr = qrs || [];

    const updates = matured.map(p => {
      const predCat = p.predicted_value?.category;
      const start = new Date(p.created_at).getTime();
      const end = new Date(p.expires_at).getTime();
      const inWindow = (ts) => { const t = new Date(ts).getTime(); return t >= start && t <= end; };

      const hit =
        inc.some(i => inWindow(i.incident_date || i.created_at) &&
          (this._categoryMatch(i.hazard_category, predCat) || this._categoryMatch(i.report_type, predCat))) ||
        qr.some(q => inWindow(q.created_at) &&
          (this._categoryMatch(q.category, predCat) || this._categoryMatch(q.hazard_classification, predCat)));

      return supabase.from('predictions').update({ actual_outcome: hit }).eq('id', p.id);
    });

    await Promise.all(updates);
    return { scored: matured.length };
  },

  // Hit rate over already-scored predictions (null until some have matured).
  async getForecastAccuracy(orgId) {
    const { data } = await supabase
      .from('predictions')
      .select('actual_outcome')
      .eq('organization_id', orgId)
      .eq('prediction_type', 'incident_forecast')
      .not('actual_outcome', 'is', null);
    if (!data || data.length === 0) return null;
    const hits = data.filter(d => d.actual_outcome === true).length;
    return { accuracy: Math.round((hits / data.length) * 100), scored: data.length };
  },
};