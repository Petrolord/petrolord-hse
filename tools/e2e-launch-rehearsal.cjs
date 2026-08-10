// HSE launch runway Phase 4: API-level dress rehearsal against the live stack.
// Exercises the same Supabase/edge-function calls the frontend makes.
// Creates a clearly-labeled test org, asserts every step, cleans up fully.
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const KEYS = JSON.parse(fs.readFileSync(__dirname + '/sb-keys.json', 'utf8'));
const URL = 'https://ssyckywijlrkgcwvkwlr.supabase.co';
const STAMP = Date.now().toString().slice(-7);
const ADMIN_EMAIL = `hse-e2e-admin-${STAMP}@example.com`;
const MEMBER_EMAIL = `hse-e2e-member-${STAMP}@example.com`;
const PASSWORD = 'E2e!rehearsal42';
const ORG_NAME = `E2E REHEARSAL ORG ${STAMP} (safe to delete)`;

const anon = () => createClient(URL, KEYS.anon, { auth: { persistSession: false } });
const svc = createClient(URL, KEYS.service_role, { auth: { persistSession: false } });

let pass = 0, fail = 0;
const results = [];
function check(name, ok, detail = '') {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`;
  results.push(line);
  console.log(line);
  ok ? pass++ : fail++;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// tiny 1x1 png
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

(async () => {
  let orgId = null, adminId = null, memberId = null, siteId = null, qrToken = null;
  const adminClient = anon();
  const memberClient = anon();

  try {
    // ---------- 1. Org signup (unified signup path) ----------
    // NOTE: the hosted project has mailer_autoconfirm=false, so a real signUp
    // yields NO session until the user clicks the emailed confirmation link.
    // We provision via the admin API with email_confirm:true (identical
    // metadata → same handle_new_user trigger) to reach the post-confirmation
    // state, then sign in with the password like a confirmed user would.
    const { data: created, error: suErr } = await svc.auth.admin.createUser({
      email: ADMIN_EMAIL, password: PASSWORD, email_confirm: true,
      user_metadata: {
        full_name: 'E2E Admin', organization_name: ORG_NAME, phone_number: '+2340000000000',
        role: 'owner', user_role: 'org_admin', primary_app: 'hse', organization_status: 'PENDING_VERIFICATION'
      }
    });
    check('signup: admin auth user created (trigger fires)', !suErr && !!created?.user?.id, suErr?.message);
    adminId = created?.user?.id;
    await sleep(1500); // let the trigger finish
    const { data: sess, error: sessErr } = await adminClient.auth.signInWithPassword({ email: ADMIN_EMAIL, password: PASSWORD });
    check('signup: confirmed admin can sign in', !sessErr && !!sess?.session, sessErr?.message);

    // ---------- 2. Provisioning asserts ----------
    const { data: mem } = await svc.from('organization_members').select('*').eq('user_id', adminId);
    orgId = mem?.[0]?.organization_id;
    check('trigger: organization_members row exists', !!orgId);
    check('trigger: creator role is owner', mem?.[0]?.role === 'owner', `role=${mem?.[0]?.role}`);
    const { data: org } = await svc.from('organizations').select('*').eq('id', orgId).single();
    check('trigger: organization created via signup', org?.created_via === 'signup' && org?.name === ORG_NAME);
    check('trigger: hse ACTIVE, suite NONE, setup_completed false',
      org?.hse_status === 'ACTIVE' && org?.suite_status === 'NONE' && org?.setup_completed === false,
      `hse=${org?.hse_status} suite=${org?.suite_status} setup=${org?.setup_completed}`);
    const { data: apps } = await svc.from('organization_apps').select('*').eq('organization_id', orgId);
    check('trigger: organization_apps has hse/hse_free', apps?.some(a => a.app_id === 'hse' && a.module_id === 'hse_free'));

    // ---------- 3. Setup: site (rig!), department ----------
    const { data: site, error: siteErr } = await adminClient.from('organization_sites').insert({
      organization_id: orgId, name: 'E2E Rig Alpha', site_type: 'rig', address: 'Test Field', is_active: true
    }).select().single();
    check('setup: create site with type rig (constraint fix)', !siteErr && !!site?.id, siteErr?.message);
    siteId = site?.id; qrToken = site?.qr_token;
    check('setup: site auto-issued a qr_token', !!qrToken);

    const { data: dept, error: deptErr } = await adminClient.from('departments').insert({
      organization_id: orgId, name: 'Operations', is_active: true
    }).select().single();
    check('setup: create department', !deptErr && !!dept?.id, deptErr?.message);

    // Negative: member-role completion attempt comes later; admin completion at the end.

    // ---------- 4. Invite via hse-invite-user ----------
    const { data: inv1, error: invErr } = await adminClient.functions.invoke('hse-invite-user', {
      body: { email: MEMBER_EMAIL, role: 'member', org_id: orgId, invited_by: adminId }
    });
    check('invite: hse-invite-user succeeds', !invErr && inv1?.success === true, invErr?.message || inv1?.error);
    check('invite: email failed but inviteLink returned (outage fallback)',
      inv1?.emailSent === false && typeof inv1?.inviteLink === 'string' && inv1.inviteLink.includes('/accept-invite/'),
      `emailSent=${inv1?.emailSent}`);
    const exp1 = new Date(inv1?.invite?.expires_at).getTime();

    await sleep(1100);
    const { data: inv2 } = await adminClient.functions.invoke('hse-invite-user', {
      body: { email: MEMBER_EMAIL, role: 'member', org_id: orgId, invited_by: adminId, is_resend: true }
    });
    const exp2 = new Date(inv2?.invite?.expires_at).getTime();
    check('invite: resend refreshes token and extends expiry',
      inv2?.invite?.token !== inv1?.invite?.token && exp2 > exp1,
      `Δexpiry=${exp2 - exp1}ms`);

    // ---------- 5. Accept invite: role must NOT escalate ----------
    // Same confirmation caveat; provision confirmed with the invite metadata
    // (org_id + invited role, no organization_name) exactly like
    // InvitationAcceptance's signUp does.
    const { data: su2, error: su2Err } = await svc.auth.admin.createUser({
      email: MEMBER_EMAIL, password: PASSWORD, email_confirm: true,
      user_metadata: { full_name: 'E2E Member', organization_id: orgId, role: inv2?.invite?.role || 'member', primary_app: 'hse' }
    });
    check('accept: invitee auth user created', !su2Err && !!su2?.user?.id, su2Err?.message);
    memberId = su2?.user?.id;
    await sleep(1500);
    const { error: msErr } = await memberClient.auth.signInWithPassword({ email: MEMBER_EMAIL, password: PASSWORD });
    check('accept: invitee can sign in', !msErr, msErr?.message);

    const { data: mem2 } = await svc.from('organization_members').select('*').eq('user_id', memberId).eq('organization_id', orgId);
    check('accept: invitee joined the SAME org (no new org created)', mem2?.length === 1);
    check('accept: invitee role is member, NOT owner (escalation fix)', mem2?.[0]?.role === 'member', `role=${mem2?.[0]?.role}`);
    const { data: memberOrgs } = await svc.from('organizations').select('id').eq('created_by', memberId);
    check('accept: no organization created by invitee', (memberOrgs || []).length === 0);

    // existing-user RPC path (idempotent early return)
    const { error: rpcErr } = await memberClient.rpc('add_user_to_organization', {
      p_user_id: memberId, p_org_id: orgId, p_role: 'member'
    });
    check('accept: add_user_to_organization idempotent for existing member', !rpcErr, rpcErr?.message);

    // invitation status update as invitee (client does this best-effort)
    const { error: invUpErr } = await memberClient.from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('token', inv2?.invite?.token);
    check('accept: invitation marked accepted (best-effort in client)', !invUpErr, invUpErr?.message || 'ok');

    // ---------- 6. Quick reports: attributed + anonymous + negative ----------
    const mkReport = (client, uid, title) => client.from('quick_reports').insert({
      organization_id: orgId, created_by_user_id: uid, title,
      description: 'E2E rehearsal report', status: 'submitted', severity: 'low', location: 'E2E Rig Alpha',
      report_data: { source: 'e2e', category: 'Other', severity: 'low' }
    }).select().single();

    let repOk = true;
    for (let i = 0; i < 3; i++) {
      const { error } = await mkReport(memberClient, memberId, `E2E member report ${i + 1}`);
      if (error) { repOk = false; check('reports: member attributed insert', false, error.message); break; }
    }
    if (repOk) check('reports: member can file attributed reports (x3)', true);

    const { error: anonRepErr } = await memberClient.from('quick_reports').insert({
      organization_id: orgId, created_by_user_id: null, title: 'E2E anonymous in-app report',
      description: 'anonymous', status: 'submitted', severity: 'low', report_data: { source: 'e2e-anon' }
    });
    check('reports: signed-in member can file ANONYMOUS report (new policy)', !anonRepErr, anonRepErr?.message);

    const { error: adminRepErr } = await mkReport(adminClient, adminId, 'E2E admin report 5');
    check('reports: admin attributed insert', !adminRepErr, adminRepErr?.message);

    const { error: anonInsErr } = await anon().from('quick_reports').insert({
      organization_id: orgId, created_by_user_id: null, title: 'anon-key forged report', description: 'x', report_data: {}
    });
    check('security: raw anon key CANNOT insert quick_reports', !!anonInsErr, anonInsErr?.message?.slice(0, 60));

    // member reads org reports (supervisor-style select)
    const { data: allReps } = await adminClient.from('quick_reports').select('id').eq('organization_id', orgId);
    check('reports: admin sees all org reports', (allReps || []).length >= 5, `count=${allReps?.length}`);

    // ---------- 7. QR public flow ----------
    const { data: resolved, error: resErr } = await anon().rpc('resolve_qr_token', { p_token: qrToken });
    check('qr: resolve_qr_token returns exactly the scanned site', !resErr && resolved?.length === 1 && resolved[0].site_id === siteId, resErr?.message);
    const { data: resolvedBad } = await anon().rpc('resolve_qr_token', { p_token: '00000000-0000-0000-0000-000000000000' });
    check('qr: unknown token resolves to nothing', (resolvedBad || []).length === 0);

    const { error: viewWriteErr } = await anon().from('public_qr_sites')
      .update({ name: 'hacked' }).eq('qr_token', qrToken);
    check('security: anon CANNOT write through public_qr_sites view', !!viewWriteErr, viewWriteErr?.message?.slice(0, 60));

    const { data: pub1, error: pubErr } = await anon().functions.invoke('submit-public-observation', {
      body: { qr_token: qrToken, description: 'E2E public observation: loose handrail near stairs', reporter_name: 'E2E Walker', reporter_phone: '+2341112223333' }
    });
    check('qr: public text observation accepted', !pubErr && pub1?.success === true, pubErr?.message || pub1?.error);
    if (pub1?.report_id) {
      const { data: pubRow } = await svc.from('quick_reports').select('*').eq('id', pub1.report_id).single();
      check('qr: row tagged qr_public with site + null creator',
        pubRow?.report_data?.submission_source === 'qr_public' && pubRow?.site_id === siteId && pubRow?.created_by_user_id === null);
      check('qr: reporter contact stored in report_data', pubRow?.report_data?.reporter_name === 'E2E Walker');
    }

    // AI path: submission with an image; asserts the metering ledger regardless of AI outcome
    const { data: pubAi } = await anon().functions.invoke('submit-public-observation', {
      body: { qr_token: qrToken, description: 'E2E public observation with photo', imageBase64: PNG_1PX, imageMimeType: 'image/png' }
    });
    check('qr: public observation with photo accepted', pubAi?.success === true, pubAi?.error);
    const { data: usageQR } = await svc.from('hse_ai_usage').select('*').eq('organization_id', orgId).eq('feature', 'quick_report_analysis');
    check('ai: public analysis metered against site org (hse_ai_usage)', (usageQR?.[0]?.used || 0) >= 1, `used=${usageQR?.[0]?.used}, ai_used=${pubAi?.ai_used}`);

    // disable / enable
    await adminClient.from('organization_sites').update({ qr_enabled: false }).eq('id', siteId);
    const { data: pubDisabled } = await anon().functions.invoke('submit-public-observation', {
      body: { qr_token: qrToken, description: 'should be rejected' }
    });
    check('qr: disabled site rejects submissions with clear message', !!pubDisabled?.error && /disabled/i.test(pubDisabled.error), pubDisabled?.error);
    await adminClient.from('organization_sites').update({ qr_enabled: true }).eq('id', siteId);

    // ---------- 8. Forecast: quota + persistence ----------
    const summary = {
      window: 'e2e rehearsal', metrics: { incident_count: 1, near_miss_count: 2 },
      monthly_trends: [], detected_risk_factors: [],
      submitted_reports: { total: 6, by_category: { Other: 6 }, by_severity: { low: 6 }, hotspot_locations: { 'E2E Rig Alpha': 5 }, recent_samples: [{ category: 'Other', severity: 'low', location: 'E2E Rig Alpha', note: 'loose handrail' }] },
      incidents: { total: 0, by_category: {}, by_severity: {} }
    };
    const { data: fc, error: fcErr } = await adminClient.functions.invoke('forecast-safety', { body: { summary, priorAccuracy: null } });
    check('forecast: authed generation returns structured forecast', !fcErr && !fc?.error && !!fc?.overall_risk_level, fcErr?.message || fc?.error);
    const { data: usageFc } = await svc.from('hse_ai_usage').select('*').eq('organization_id', orgId).eq('feature', 'safety_forecast');
    check('forecast: metered under safety_forecast feature', (usageFc?.[0]?.used || 0) >= 1, `used=${usageFc?.[0]?.used}`);

    if (fc && !fc.error) {
      const { error: persErr } = await adminClient.from('predictions').insert({
        organization_id: orgId, prediction_type: 'safety_forecast', predicted_value: fc,
        confidence_level: fc.confidence ?? null, timeframe: '30 days',
        expires_at: new Date(Date.now() + 30 * 864e5).toISOString()
      });
      check('forecast: persists to predictions under member RLS', !persErr, persErr?.message);
      const { data: latest } = await adminClient.from('predictions').select('id').eq('organization_id', orgId).eq('prediction_type', 'safety_forecast');
      check('forecast: reads back after reload (no vanish)', (latest || []).length >= 1);
    }

    const { error: anonFcErr, data: anonFcData } = await anon().functions.invoke('forecast-safety', { body: { summary, priorAccuracy: null } });
    const anonBlocked = !!anonFcErr || anonFcData?.code === 'AUTH_REQUIRED' || anonFcData?.code === 'NO_ORGANIZATION' || !!anonFcData?.error;
    check('security: anon key cannot consume forecast quota', anonBlocked, anonFcData?.code || anonFcErr?.message);

    // ---------- 9. Setup completion RPC ----------
    const { error: memberSetupErr } = await memberClient.rpc('hse_complete_org_setup', { p_org_id: orgId });
    check('security: member role CANNOT complete org setup', !!memberSetupErr, memberSetupErr?.message?.slice(0, 60));
    const { data: setupOk, error: setupErr } = await adminClient.rpc('hse_complete_org_setup', { p_org_id: orgId });
    check('setup: admin completes setup via RPC', !setupErr && setupOk === true, setupErr?.message);
    const { data: orgAfter } = await svc.from('organizations').select('setup_completed, setup_completed_at').eq('id', orgId).single();
    check('setup: setup_completed persisted with timestamp', orgAfter?.setup_completed === true && !!orgAfter?.setup_completed_at);

    // ---------- 10. Suite grant path (the two Suite-bound orgs) ----------
    const { data: appsBefore } = await svc.from('organization_apps').select('app_id, module_id').eq('organization_id', orgId);
    console.log('   apps before suite grant:', JSON.stringify(appsBefore));
    check('suite: HSE org starts with hse app only (no stray suite)',
      appsBefore?.length === 1 && appsBefore[0].app_id === 'hse', JSON.stringify(appsBefore));
    // Idempotent grant, mirroring the trigger's ON CONFLICT DO NOTHING.
    const { error: suiteErr } = await svc.from('organization_apps').upsert({
      organization_id: orgId, app_id: 'suite', module_id: 'suite_trial', seats_allocated: 5, seats_used: 0, status: 'ACTIVE'
    }, { onConflict: 'organization_id,app_id', ignoreDuplicates: true });
    check('suite: organization_apps suite grant succeeds', !suiteErr, suiteErr?.message);
    const { data: suiteApps } = await adminClient.from('organization_apps').select('app_id').eq('organization_id', orgId);
    check('suite: same login now sees both hse and suite apps', suiteApps?.some(a => a.app_id === 'suite') && suiteApps?.some(a => a.app_id === 'hse'));

  } catch (e) {
    check('UNEXPECTED SCRIPT ERROR', false, e.message);
  }

  // ---------- Cleanup ----------
  console.log('\n--- cleanup ---');
  try {
    // organizations.created_by FKs to the user; make sure any org either test
    // user created is included so the auth-user delete can't be blocked.
    const createdOrgIds = new Set();
    for (const uid of [adminId, memberId].filter(Boolean)) {
      const { data } = await svc.from('organizations').select('id').eq('created_by', uid);
      (data || []).forEach(o => createdOrgIds.add(o.id));
    }
    if (orgId) createdOrgIds.add(orgId);
    for (const oid of createdOrgIds) {
      for (const [table, col] of [
        ['predictions', 'organization_id'], ['ai_insights', 'org_id'], ['hse_ai_usage', 'organization_id'],
        ['quick_reports', 'organization_id'], ['invitations', 'org_id'], ['organization_audit_logs', 'organization_id'],
        ['organization_sites', 'organization_id'], ['departments', 'organization_id'],
        ['purchased_modules', 'organization_id'], ['organization_apps', 'organization_id'],
        ['user_points_summary', 'organization_id'], ['organization_members', 'organization_id']
      ]) {
        await svc.from(table).delete().eq(col, oid);
      }
      await svc.from('organizations').delete().eq('id', oid);
    }
    if (orgId) {
      for (const [table, col] of [
        ['predictions', 'organization_id'], ['ai_insights', 'org_id'], ['hse_ai_usage', 'organization_id'],
        ['quick_reports', 'organization_id'], ['invitations', 'org_id'], ['organization_audit_logs', 'organization_id'],
        ['organization_sites', 'organization_id'], ['departments', 'organization_id'],
        ['purchased_modules', 'organization_id'], ['organization_apps', 'organization_id'],
        ['user_points_summary', 'organization_id'], ['organization_members', 'organization_id']
      ]) {
        const { error } = await svc.from(table).delete().eq(col, orgId);
        if (error) console.log(`cleanup warn ${table}: ${error.message}`);
      }
      for (const uid of [adminId, memberId].filter(Boolean)) {
        await svc.from('user_profiles').delete().eq('id', uid);
        await svc.from('users').delete().eq('id', uid);
      }
      const { error: orgDelErr } = await svc.from('organizations').delete().eq('id', orgId);
      console.log(orgDelErr ? `cleanup warn organizations: ${orgDelErr.message}` : 'org row deleted');
    }
    for (const uid of [adminId, memberId].filter(Boolean)) {
      const { error } = await svc.auth.admin.deleteUser(uid);
      console.log(error ? `cleanup warn auth user ${uid}: ${error.message}` : `auth user ${uid} deleted`);
    }
    if (orgId) {
      const { data: leftover } = await svc.from('organizations').select('id').eq('id', orgId);
      console.log(`verify: org rows remaining = ${(leftover || []).length}`);
    }
  } catch (e) {
    console.log('cleanup error:', e.message);
  }

  console.log(`\n=== REHEARSAL RESULT: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
})();
