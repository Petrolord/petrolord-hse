-- HSE registers behavioural probes. run.sh diffs the output against
-- probes.expected (stdout) and probes.expected-errors (stderr).
\set ON_ERROR_STOP 0
\set O1 '''10000000-0000-0000-0000-000000000001'''
\set O2 '''10000000-0000-0000-0000-000000000002'''
\set S1 '''20000000-0000-0000-0000-000000000001'''
\set S2 '''20000000-0000-0000-0000-000000000002'''
-- B (org2 owner) seeds org2 rows
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
insert into public.hse_training_programs(id, org_id, program_name) values ('30000000-0000-0000-0000-000000000002', :O2, 'org2 program');
insert into public.hse_contractors(id, org_id, contractor_id, company_name) values ('40000000-0000-0000-0000-000000000002', :O2, 'CON-2', 'Org2 Co');
-- R1 A inserts an org1 program; created_by defaults to A (expect OK)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.hse_training_programs(id, org_id, program_name) values ('30000000-0000-0000-0000-000000000001', :O1, 'org1 program');
select 'R1 created_by', created_by from public.hse_training_programs;
-- R2 A stamps someone else as creator (expect RLS violation)
insert into public.hse_training_programs(org_id, program_name, created_by) values (:O1, 'forged', '00000000-0000-0000-0000-00000000000b');
-- R3 A writes into org2 (expect RLS violation)
insert into public.hse_training_programs(org_id, program_name) values (:O2, 'intruder');
-- R4 A schedules org1 program (OK) and org2 program (expect RLS violation)
insert into public.hse_training_schedule(org_id, program_id, scheduled_date) values (:O1, '30000000-0000-0000-0000-000000000001', '2026-10-01');
insert into public.hse_training_schedule(org_id, program_id, scheduled_date) values (:O1, '30000000-0000-0000-0000-000000000002', '2026-10-01');
-- R5 A contractor on own site (OK) and on org2 site (expect RLS violation)
insert into public.hse_contractors(id, org_id, contractor_id, company_name, assigned_site_id) values ('40000000-0000-0000-0000-000000000001', :O1, 'CON-1', 'Org1 Co', :S1);
insert into public.hse_contractors(org_id, contractor_id, company_name, assigned_site_id) values (:O1, 'CON-X', 'Bad site', :S2);
-- R6 A links an induction to an org2 contractor (expect RLS violation), own contractor OK
insert into public.hse_safety_inductions(org_id, induction_id, contractor_id, date, type) values (:O1, 'IND-X', '40000000-0000-0000-0000-000000000002', now(), 'General');
insert into public.hse_safety_inductions(org_id, induction_id, contractor_id, date, type) values (:O1, 'IND-1', '40000000-0000-0000-0000-000000000001', now(), 'General');
-- R7 audit on own site OK, org2 site refused; finding against own audit OK
insert into public.hse_audit_schedule(id, org_id, audit_id, audit_type, scheduled_date, location_id) values ('50000000-0000-0000-0000-000000000001', :O1, 'AUD-1', 'Internal', now(), :S1);
insert into public.hse_audit_schedule(org_id, audit_id, audit_type, scheduled_date, location_id) values (:O1, 'AUD-X', 'Internal', now(), :S2);
insert into public.hse_audit_findings(org_id, finding_id, audit_id) values (:O1, 'F-1', '50000000-0000-0000-0000-000000000001');
-- R8 A reads only org1
select 'R8 A sees programs', count(*) from public.hse_training_programs;
select 'R8 A sees contractors', count(*) from public.hse_contractors;
-- R9 A moves an org1 contractor into org2 (expect RLS violation)
update public.hse_contractors set org_id = :O2 where id = '40000000-0000-0000-0000-000000000001';
-- R10 A re-points own contractor to org2 site (expect RLS violation)
update public.hse_contractors set assigned_site_id = :S2 where id = '40000000-0000-0000-0000-000000000001';
-- R11 A updates own row (OK, updated_at moves)
update public.hse_contractors set safety_rating = 4 where id = '40000000-0000-0000-0000-000000000001';
select 'R11 rating', safety_rating, updated_at >= created_at from public.hse_contractors where id = '40000000-0000-0000-0000-000000000001';
-- R12 A deletes (expect permission denied)
delete from public.hse_training_programs;
-- R13 B sees none of org1 and cannot update them
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select 'R13 B sees programs', count(*) from public.hse_training_programs;
update public.hse_contractors set company_name = 'hijack' where org_id = :O1;
select 'R13 B sees schedule/inductions/audits', (select count(*) from public.hse_training_schedule), (select count(*) from public.hse_safety_inductions), (select count(*) from public.hse_audit_schedule);
-- R14 invited (not active) admin of org1 sees nothing and cannot write
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select 'R14 invited sees', count(*) from public.hse_training_programs;
insert into public.hse_training_programs(org_id, program_name) values (:O1, 'invited');
-- R15 super admin reads across orgs, cannot write
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
select 'R15 super admin sees', count(*) from public.hse_training_programs;
-- R16 anon has no access
reset role;
set role anon;
select count(*) from public.hse_training_programs;
insert into public.hse_contractors(org_id, contractor_id, company_name) values (:O1, 'A', 'anon');
reset role;
-- R17 org1 as owner-of-data: final counts (bypassing RLS)
select 'R17 totals', (select count(*) from public.hse_training_programs), (select count(*) from public.hse_training_schedule), (select count(*) from public.hse_contractors), (select count(*) from public.hse_safety_inductions), (select count(*) from public.hse_audit_schedule), (select count(*) from public.hse_audit_findings);
