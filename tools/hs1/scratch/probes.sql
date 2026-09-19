-- HS1 behavioural probes. run.sh diffs the output against probes.expected.
-- P = exposure hours RLS and checks, Q = classification guard, S = site delete, G = grants.
\set ON_ERROR_STOP 0
\set O1 '''10000000-0000-0000-0000-000000000001'''
set role authenticated;
-- P1 supervisor inserts a month (expect OK)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours, workforce) values (:O1,'2026-01-01','2026-01-31',100000,'combined');
insert into public.hse_exposure_hours(organization_id, site_id, period_start, period_end, hours, workforce) values (:O1,'20000000-0000-0000-0000-000000000001','2026-02-01','2026-02-28',50000,'employee');
select 'P1 rows', count(*), max(created_by::text) from public.hse_exposure_hours;
-- P2 duplicate null-site month (expect unique violation)
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours, workforce) values (:O1,'2026-01-01','2026-01-31',1,'combined');
-- P3 non-month period (expect check violation)
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-03-02','2026-03-31',1);
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-03-01','2026-03-30',1);
-- P4 zero / NaN hours (expect check violation x2)
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-04-01','2026-04-30',0);
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-04-01','2026-04-30','NaN');
-- P5 site from another org (expect RLS violation)
insert into public.hse_exposure_hours(organization_id, site_id, period_start, period_end, hours) values (:O1,'20000000-0000-0000-0000-000000000002','2026-05-01','2026-05-31',1);
-- P6 staff insert (expect RLS violation) and staff read (expect 2)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-06-01','2026-06-30',1);
select 'P6 staff sees', count(*) from public.hse_exposure_hours;
update public.hse_exposure_hours set hours = 1;
select 'P6 staff update left hours', sum(hours) from public.hse_exposure_hours;
-- P7 invited manager (status invited) cannot write
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-06-01','2026-06-30',1);
-- P8 other org owner sees nothing, cannot write into org1
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select 'P8 other org sees', count(*) from public.hse_exposure_hours;
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours) values (:O1,'2026-06-01','2026-06-30',1);
-- P9 created_by forgery (supervisor sets created_by = staff) expect RLS violation
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.hse_exposure_hours(organization_id, period_start, period_end, hours, created_by) values (:O1,'2026-07-01','2026-07-31',1,'00000000-0000-0000-0000-00000000000b');
-- Q1 reporter (staff) tries to classify own report (expect 42501)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
update public.quick_reports set injury_classification = 'first_aid' where id = '30000000-0000-0000-0000-000000000001';
-- Q2 reporter edits title only (expect OK, no stamp)
update public.quick_reports set title = 'edited' where id = '30000000-0000-0000-0000-000000000001';
-- Q3 reporter forges stamp (expect stamp unchanged null)
update public.quick_reports set classified_by = '00000000-0000-0000-0000-00000000000b', classified_at = now() where id = '30000000-0000-0000-0000-000000000001';
select 'Q3', title, classified_by, classified_at from public.quick_reports;
-- Q4 reporter inserts a pre-classified report (expect 42501)
insert into public.quick_reports(organization_id, created_by_user_id, title, injury_classification) values (:O1,'00000000-0000-0000-0000-00000000000b','x','no_injury');
-- Q5 supervisor classifies lost time 3 days (expect OK + stamp)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
update public.quick_reports set injury_classification = 'lost_time', days_away = 3, days_restricted = 2, workforce = 'contractor', pse_classification = 'tier_2', occurred_on = '2026-01-15' where id = '30000000-0000-0000-0000-000000000001';
select 'Q5', injury_classification, days_away, classified_by, classified_at is not null from public.quick_reports;
-- Q6 days_away on a non lost_time class (expect check violation)
update public.quick_reports set injury_classification = 'restricted' where id = '30000000-0000-0000-0000-000000000001';
-- Q7 bad values (expect check violations)
update public.quick_reports set pse_classification = 'tier_5' where id = '30000000-0000-0000-0000-000000000001';
update public.quick_reports set workforce = 'combined' where id = '30000000-0000-0000-0000-000000000001';
-- Q8 service role inserts pre-classified (expect OK, stamp null uid)
reset role; set role service_role; set request.jwt.claim.sub = '';
insert into public.quick_reports(organization_id, title, injury_classification) values (:O1,'svc','near_miss');
select 'Q8', title, injury_classification, classified_by, classified_at is not null from public.quick_reports where title='svc';
-- S1 site delete with hours (expect FK violation)
reset role;
delete from public.organization_sites where id = '20000000-0000-0000-0000-000000000001';
-- G1 anon cannot read hours
set role anon;
select 'G1 anon', count(*) from public.hse_exposure_hours;
