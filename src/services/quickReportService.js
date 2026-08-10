import { supabase } from '@/lib/customSupabaseClient';
// PETROLORD QUICK REPORT DEFENSIVE FIX v1 (2026-05-06)
// PETROLORD QUICK REPORT DEFENSIVE FIX v2 (2026-05-07)
// v2: gamificationService methods may be undefined (addPoints, awardBadge, etc).
//     Wrap all gamification calls in a guard so a missing method does not crash the submit.
import { gamificationService } from './gamificationService';

const safeGamification = async (methodName, ...args) => {
  try {
    if (gamificationService && typeof gamificationService[methodName] === 'function') {
      return await gamificationService[methodName](...args);
    } else {
      console.warn('[gamification] method not implemented:', methodName);
      return null;
    }
  } catch (e) {
    console.warn('[gamification] call to ' + methodName + ' failed (non-fatal):', e?.message);
    return null;
  }
};

// safeAuditLog: fire-and-forget call to log-audit-event edge function.
// v8: also passes actor_id explicitly in the body, since the edge function's
// JWT-based extraction is returning null in our environment. The function will
// still prefer the JWT-derived actor when present; this is just a fallback.
const safeAuditLog = async (organizationId, action, resourceId, details = {}) => {
  if (!organizationId || !action) return;
  try {
    let actorId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      actorId = user?.id || null;
    } catch (_e) { /* leave null */ }
    await supabase.functions.invoke('log-audit-event', {
      body: {
        organization_id: organizationId,
        action,
        resource_type: 'quick_report',
        resource_id: resourceId,
        details,
        actor_id: actorId
      }
    });
  } catch (err) {
    console.warn('[audit] log failed (non-fatal):', action, err?.message);
  }
};

export const quickReportService = {
// PETROLORD QUICK REPORT FIX v6 (2026-05-08): real AI via OpenAI edge function
// PETROLORD QUICK REPORT FIX v7 (2026-05-09): audit trail integration
// PETROLORD QUICK REPORT FIX v8 (2026-05-09): pass actor_id explicitly + supervisor assignee resolution
// PETROLORD QUICK REPORT FIX v9 (2026-05-09): 5 Whys investigation save method
  // Analyze audio/image using AI. Calls the analyze-quick-report edge function
  // which dispatches to OpenAI vision + transcription server-side.
  // Falls back to a soft-empty result when AI is unavailable so the user can
  // always file the report manually.
  analyzeReport: async (photoBlob, audioBlob) => {
    const startedAt = Date.now();

    const blobToBase64 = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.substring(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

    const softFallback = (description = '') => ({
      success: true,
      reportId: `QR-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      confidence: 0,
      category: 'Other',
      severity: 'medium',
      location: '',
      description: description || 'Unable to auto-analyze. Please complete the report manually.',
      transcription: '',
      combinedAnalysis: {
        summary: description || 'Manual entry required.',
        recommendedActions: []
      },
      ai_unavailable: true
    });

    try {
      const payload = {};
      if (photoBlob) {
        payload.imageBase64 = await blobToBase64(photoBlob);
        payload.imageMimeType = photoBlob.type || 'image/jpeg';
      }
      if (audioBlob) {
        payload.audioBase64 = await blobToBase64(audioBlob);
        payload.audioMimeType = audioBlob.type || 'audio/webm';
      }

      const { data, error } = await supabase.functions.invoke('analyze-quick-report', {
        body: payload,
      });

      if (error) {
        console.warn('analyzeReport edge function error:', error);
        return softFallback();
      }
      if (data?.error) {
        console.warn('analyzeReport AI error:', data.error, data.code || '');
        const fb = softFallback(data.partial?.transcription || '');
        if (data.code === 'QUOTA_EXCEEDED') {
          fb.quota_exceeded = true;
          fb.usage = data.usage || null;
          fb.description = 'Monthly AI analysis limit reached. Please complete the report manually.';
          fb.combinedAnalysis.summary = fb.description;
        }
        return fb;
      }

      const transcription = data.transcription || '';
      const description = data.description || transcription || '';
      return {
        success: true,
        reportId: `QR-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        confidence: data.confidence ?? 0,
        category: data.category || 'Other',
        severity: data.severity || 'medium',
        location: '',
        description,
        transcription,
        combinedAnalysis: {
          summary: description,
          recommendedActions: data.recommendedActions || []
        },
        ai_meta: data.ai_meta,
        usage: data.usage || null
      };
    } catch (err) {
      console.error('analyzeReport unexpected error:', err);
      return softFallback();
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed > 30000) console.warn('analyzeReport took', elapsed, 'ms');
    }
  },

  // Current month's AI usage for the org (for the usage meter). Reads
  // hse_ai_usage under RLS (org members can read their own org's rows).
  // Returns { used, quota, tier } or null when no analyses ran yet this month.
  getAiUsage: async (organizationId) => {
    if (!organizationId) return null;
    try {
      const periodStart = new Date();
      const monthStart = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}-01`;
      const { data, error } = await supabase
        .from('hse_ai_usage')
        .select('used, quota, tier')
        .eq('organization_id', organizationId)
        .eq('feature', 'quick_report_analysis')
        .eq('period_start', monthStart)
        .maybeSingle();
      if (error) {
        console.warn('getAiUsage error:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('getAiUsage unexpected error:', err);
      return null;
    }
  },

// PETROLORD QUICK REPORT FIX v3 (2026-05-07): add getSupervisorReports
//
// SupervisorDashboardModule calls quickReportService.getSupervisorReports(orgId)
// but the method did not exist. Returning { data, error } shape to match
// the component's destructuring.

  // Fetch all quick reports for an organization (for supervisor / manager view).
  // Returns { data, error } to match Supabase response shape that the caller expects.
  getSupervisorReports: async (organizationId) => {
    if (!organizationId) {
      return { data: [], error: null };
    }
    try {
      const { data, error } = await supabase
        .from('quick_reports')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      // Resolve reporter AND assignee names from organization_members in one query.
      // v8: previously we only resolved reporters, leaving Supervisor View
      // showing 'Unassigned' for assigned reports.
      const userIds = [...new Set([
        ...(data || []).map(r => r.created_by_user_id),
        ...(data || []).map(r => r.assigned_to)
      ].filter(Boolean))];

      let nameMap = {};
      if (userIds.length > 0) {
        const { data: members } = await supabase
          .from('organization_members')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        nameMap = Object.fromEntries(
          (members || []).map(m => [m.user_id, m.full_name || m.email || 'Unknown'])
        );
      }

      const enriched = (data || []).map(r => {
        // QR walk-up submissions have no account; surface their self-provided
        // contact details instead of 'Unknown'.
        const isPublic = r.report_data?.submission_source === 'qr_public';
        const publicName = r.report_data?.reporter_name;
        return {
          ...r,
          is_public_submission: isPublic,
          reporter_name: isPublic
            ? (publicName || 'Anonymous (QR)')
            : (nameMap[r.created_by_user_id] || 'Unknown'),
          reporter_phone: isPublic ? (r.report_data?.reporter_phone || null) : null,
          assignee_name: r.assigned_to ? (nameMap[r.assigned_to] || 'Unknown') : null
        };
      });

      return { data: enriched, error: null };
    } catch (err) {
      console.error('getSupervisorReports failed:', err);
      return { data: null, error: err };
    }
  },

// PETROLORD QUICK REPORT FIX v4 (2026-05-07): action assignment + status changes
//
// Adds getOrgMembers, assignReport, updateReportStatus to satisfy Criteria 4 and 5.

  // Fetch members of an organization for assignment dropdown.
  // Returns { data: [{id, name, email}], error }.
  getOrgMembers: async (organizationId) => {
    if (!organizationId) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('user_id, full_name, email, role, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active');
      if (error) return { data: null, error };
      const members = (data || []).map(m => ({
        id: m.user_id,
        name: m.full_name || m.email || 'Unknown',
        email: m.email,
        role: m.role
      }));
      return { data: members, error: null };
    } catch (err) {
      console.error('getOrgMembers failed:', err);
      return { data: null, error: err };
    }
  },

  // Assign a report to a user. Updates quick_reports.assigned_to.
  assignReport: async (reportId, assigneeUserId) => {
    try {
      const { data, error } = await supabase
        .from('quick_reports')
        .update({
          assigned_to: assigneeUserId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      if (!error && data) {
        await safeAuditLog(data.organization_id, 'quick_report.assigned', reportId, {
          assigned_to: assigneeUserId,
          report_title: data.title
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Update a report's status. Sets closed_at when transitioning to a closed state.
  updateReportStatus: async (reportId, newStatus) => {
    const closedStates = ['resolved', 'closed'];
    const update = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    if (closedStates.includes(newStatus)) {
      update.closed_at = new Date().toISOString();
    }
    try {
      // Read previous status BEFORE updating, so audit details capture the transition
      const { data: prev } = await supabase
        .from('quick_reports')
        .select('status, organization_id, title')
        .eq('id', reportId)
        .single();

      const { data, error } = await supabase
        .from('quick_reports')
        .update(update)
        .eq('id', reportId)
        .select()
        .single();

      if (!error && data) {
        const orgId = data.organization_id || prev?.organization_id;
        const title = data.title || prev?.title;
        // Generic transition event
        await safeAuditLog(orgId, 'quick_report.status_changed', reportId, {
          from: prev?.status || 'unknown',
          to: newStatus,
          report_title: title
        });
        // Headline event for the timeline when reaching a terminal state
        if (newStatus === 'resolved') {
          await safeAuditLog(orgId, 'quick_report.resolved', reportId, { report_title: title });
        } else if (newStatus === 'closed') {
          await safeAuditLog(orgId, 'quick_report.closed', reportId, { report_title: title });
        }
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Fetch the audit timeline for a report. Resolves actor names from
  // organization_members. Synthesizes a 'created' event from quick_reports
  // metadata since report creation predates audit wiring. Returns oldest-first
  // events with actor_name and formatted action labels for direct UI rendering.
  getReportAuditLog: async (reportId) => {
    if (!reportId) return { data: [], error: null };
    try {
      // Fetch the report itself for the synthetic created event
      const { data: report } = await supabase
        .from('quick_reports')
        .select('created_at, created_by_user_id, title')
        .eq('id', reportId)
        .single();

      const { data, error } = await supabase
        .from('organization_audit_logs')
        .select('id, actor_id, action, details, created_at')
        .eq('resource_type', 'quick_report')
        .eq('resource_id', reportId)
        .order('created_at', { ascending: true });
      if (error) return { data: null, error };

      // Collect all actor ids (existing audit + synthetic created)
      const actorIds = [...new Set([
        ...(data || []).map(r => r.actor_id).filter(Boolean),
        report?.created_by_user_id
      ].filter(Boolean))];

      let nameMap = {};
      if (actorIds.length > 0) {
        const { data: members } = await supabase
          .from('organization_members')
          .select('user_id, full_name, email')
          .in('user_id', actorIds);
        nameMap = Object.fromEntries(
          (members || []).map(m => [m.user_id, m.full_name || m.email || 'Unknown'])
        );
      }

      const labelMap = {
        'quick_report.created': 'Report filed',
        'quick_report.created_public': 'Filed via QR',
        'quick_report.assigned': 'Assigned',
        'quick_report.status_changed': 'Status changed',
        'quick_report.resolved': 'Resolved',
        'quick_report.closed': 'Closed',
        'quick_report.investigation_completed': 'Investigation completed'
      };

      const events = [];
      // Synthesize the creation event from quick_reports if no explicit
      // 'quick_report.created' event was logged (older reports won't have one).
      const hasCreatedEvent = (data || []).some(r => r.action === 'quick_report.created');
      if (report && !hasCreatedEvent) {
        events.push({
          id: 'synth-created-' + reportId,
          actor_id: report.created_by_user_id,
          action: 'quick_report.created',
          details: { report_title: report.title },
          created_at: report.created_at,
          actor_name: nameMap[report.created_by_user_id] || 'Unknown',
          label: 'Report filed'
        });
      }

      events.push(...(data || []).map(r => ({
        ...r,
        actor_name: r.actor_id ? (nameMap[r.actor_id] || 'Unknown') : 'System',
        label: labelMap[r.action] || r.action
      })));

      // Sort by created_at to interleave synthetic with real
      events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      return { data: events, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Save a 5 Whys investigation for a quick report.
  // payload: {
  //   whys: [{ why: 1, question: '...', answer: '...' }, ... up to 5 entries],
  //   root_cause: string,
  //   corrective_actions: string,
  //   preventive_actions: string,
  //   lessons_learned: string
  // }
  // Writes to columns added in 2026-05-09_add_investigation_columns.sql.
  saveInvestigation: async (reportId, payload) => {
    if (!reportId) {
      return { data: null, error: new Error('reportId is required') };
    }
    try {
      const update = {
        investigation_whys: payload.whys || [],
        root_cause: payload.root_cause || null,
        corrective_actions: payload.corrective_actions || null,
        preventive_actions: payload.preventive_actions || null,
        lessons_learned: payload.lessons_learned || null,
        investigation_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('quick_reports')
        .update(update)
        .eq('id', reportId)
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(
          data.organization_id,
          'quick_report.investigation_completed',
          reportId,
          {
            report_title: data.title,
            why_count: (payload.whys || []).filter(w => w?.answer?.trim()).length,
            has_root_cause: !!payload.root_cause
          }
        );
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Submit the final report
  submitReport: async (reportData, options = {}, user, organization) => {
    // Defensive: resolve user/org from auth + DB if caller passed null/stale values.
    // Decouples submit from any context loading state.
    if (!user?.id || !organization?.id) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated. Please log in again.');
      if (!user?.id) {
        user = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email
        };
      }
      if (!organization?.id) {
        const { data: mems } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', authUser.id)
          .limit(1);
        if (mems?.[0]?.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', mems[0].organization_id)
            .single();
          organization = org;
        }
      }
    }
    if (!organization?.id) {
      throw new Error('No organization found for this user. Please refresh and try again.');
    }

    try {
      let mediaUrls = [];
      
      // 1. Upload Media if present (Photo from capture step)
      if (reportData.photo) {
        const fileName = `quick-reports/${organization.id}/${Date.now()}_photo.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('org-assets')
          .upload(fileName, reportData.photo);
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
          mediaUrls.push({ type: 'image', url: publicUrl, name: 'Capture.jpg' });
        }
      }

      // 2. Upload Audio if present
      if (reportData.audioBlob) {
        const fileName = `quick-reports/${organization.id}/${Date.now()}_audio.webm`;
        const { error: uploadError } = await supabase.storage
          .from('org-assets')
          .upload(fileName, reportData.audioBlob);
          
        if (!uploadError) {
           const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
           // We might store audio URL in specific column or media_urls
           reportData.audio_url = publicUrl; 
        }
      }

      // 3. Upload Advanced Media (Additional photos/videos)
      if (reportData.advancedMedia && reportData.advancedMedia.length > 0) {
        for (const file of reportData.advancedMedia) {
           const fileName = `quick-reports/${organization.id}/${Date.now()}_${file.name}`;
           const { error: uploadError } = await supabase.storage
             .from('org-assets')
             .upload(fileName, file);
             
           if (!uploadError) {
             const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
             mediaUrls.push({ type: file.type.startsWith('video') ? 'video' : 'image', url: publicUrl, name: file.name });
           }
        }
      }

      // 4. Calculate Points (Bonus for advanced details)
      let pointsBase = 10;
      let pointsBonus = 0;
      
      // Check for advanced details completeness
      if (reportData.category && reportData.category !== 'Other') pointsBonus += 2;
      if (reportData.immediate_actions) pointsBonus += 3;
      if (reportData.media_urls && reportData.media_urls.length > 0) pointsBonus += 2;
      
      const totalPoints = pointsBase + pointsBonus;

      // 5. Insert into Database
      const { data: insertedReport, error: insertError } = await supabase
        .from('quick_reports')
        .insert({
          organization_id: organization.id,
          created_by_user_id: options.isAnonymous ? null : user.id,
          title: reportData.title || 'Quick Report',
          description: reportData.description || reportData.transcription || 'No description provided.',
          report_data: reportData, // Store full raw AI data
          status: options.saveAsDraft ? 'draft' : 'submitted',
          severity: reportData.severity?.toLowerCase() || 'low',
          location: reportData.location || 'Unknown',
          audio_blob_url: reportData.audio_url,
          transcription: reportData.transcription,
          leaderboard_points: totalPoints,
          
          // New Advanced Fields
          category: reportData.category,
          hazard_classification: reportData.hazard_classification,
          media_urls: mediaUrls, // JSONB array
          witnesses: reportData.witnesses || [], // JSONB array
          injured_persons: reportData.injured_persons || [], // JSONB array
          immediate_actions: reportData.immediate_actions,
          corrective_actions: reportData.corrective_actions,
          additional_notes: reportData.additional_notes,
          
          // Mappings for backward compatibility or different schema versions if needed
          people_involved: [...(reportData.witnesses || []).map(w => ({...w, role: 'witness'})), ...(reportData.injured_persons || []).map(p => ({...p, role: 'injured'}))]
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 6. Trigger Gamification Update
      if (!options.isAnonymous && !options.saveAsDraft) {
        await safeGamification('addPoints', user.id, organization.id, totalPoints, 'Quick Report Submission');
        await safeGamification('updateStreak', user.id, organization.id);
      }

      return {
        success: true,
        reportId: insertedReport.id, // Use actual DB ID
        points: totalPoints,
        streak: 1 // In real app, fetch actual streak
      };

    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

// PETROLORD QUICK REPORT FIX v5 (2026-05-07): enrich getUserReports with assignee
  getUserReports: async (userId, orgId, status = 'all') => {
    try {
      let query = supabase
        .from('quick_reports')
        .select('*')
        .eq('organization_id', orgId)
        .eq('created_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // v5: enrich with assignee names from organization_members
      const assigneeIds = [...new Set((data || []).map(r => r.assigned_to).filter(Boolean))];
      let nameMap = {};
      if (assigneeIds.length > 0) {
        const { data: members } = await supabase
          .from('organization_members')
          .select('user_id, full_name, email')
          .in('user_id', assigneeIds);
        nameMap = Object.fromEntries(
          (members || []).map(m => [m.user_id, m.full_name || m.email || 'Unknown'])
        );
      }
      return (data || []).map(r => ({
        ...r,
        assignee_name: r.assigned_to ? (nameMap[r.assigned_to] || 'Unknown') : null
      }));
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  },
  
  // Helper to fetch single report details
  getReportById: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('quick_reports')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      return null;
    }
  }
};