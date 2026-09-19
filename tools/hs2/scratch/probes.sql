-- HS2 behavioural probes. run.sh diffs the output against probes.expected.
-- N = noise, C = chemical, H = heat, R = RLS by role and org, T = stamp
-- trigger, S = site delete, G = grants.
\set ON_ERROR_STOP 0
\set O1 '''10000000-0000-0000-0000-000000000001'''
\set O2 '''10000000-0000-0000-0000-000000000002'''
\set P '''[{"levelDbA":95,"durationH":2},{"levelDbA":90,"durationH":4},{"levelDbA":100,"durationH":1}]'''
set role authenticated;
-- N1 supervisor inserts the 1910.95 example (expect OK), with a site and a named worker
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.hse_noise_samples(id, organization_id, site_id, subject_label, worker_user_id, sample_date, periods, criterion)
  values ('40000000-0000-0000-0000-000000000001', :O1, '20000000-0000-0000-0000-000000000001', 'Compressor operators', '00000000-0000-0000-0000-00000000000b', '2026-09-01', :P, 'OSHA_PEL');
select 'N1', subject_label, created_by, updated_by, jsonb_array_length(periods) from public.hse_noise_samples;
-- N2 shape refusals (expect 7 check violations): not an array, empty, missing key,
-- string level, negative duration, over 24 h, unknown criterion
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '{"levelDbA":90,"durationH":8}');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '[]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90}]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '[{"levelDbA":"90","durationH":8}]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":-1}]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":20},{"levelDbA":85,"durationH":5}]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, criterion) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":8}]', 'ACGIH');
-- N3 protector consistency (expect 3 check violations): NRR without method, NIOSH without type,
-- OSHA field 50 on C-weighted data; then a complete NIOSH earmuff (expect OK)
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, protector_nrr_db) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":8}]', 25);
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, protector_method, protector_nrr_db) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":8}]', 'NIOSH_TYPE', 25);
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, protector_method, protector_nrr_db, protector_weighting) values (:O1, 'x', '2026-09-01', '[{"levelDbA":90,"durationH":8}]', 'OSHA_FIELD_50', 25, 'C');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, protector_method, protector_nrr_db, protector_type) values (:O1, 'Muff wearer', '2026-09-02', '[{"levelDbA":100,"durationH":8}]', 'NIOSH_TYPE', 30, 'earmuff');
select 'N3 rows', count(*) from public.hse_noise_samples;
-- C1 the 1910.1000(d)(2) mixture as one atomic three-row insert (expect OK, 3 rows, one group)
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, twa_limit, limit_source, periods, mixture_group_id) values
 (:O1, 'Tank cleaners', '2026-09-03', 'Substance A', 'ppm', 1000, 'OSHA Table Z-1', '[{"concentration":500,"durationH":8}]', '50000000-0000-0000-0000-000000000001'),
 (:O1, 'Tank cleaners', '2026-09-03', 'Substance B', 'ppm', 200, 'OSHA Table Z-1', '[{"concentration":45,"durationH":8}]', '50000000-0000-0000-0000-000000000001'),
 (:O1, 'Tank cleaners', '2026-09-03', 'Substance C', 'ppm', 200, 'OSHA Table Z-1', '[{"concentration":40,"durationH":8}]', '50000000-0000-0000-0000-000000000001');
select 'C1', count(*), count(distinct mixture_group_id) from public.hse_chemical_samples;
-- C2 a group insert with one bad row is refused whole (expect check violation, still 3 rows)
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, twa_limit, limit_source, periods, mixture_group_id) values
 (:O1, 'Tank cleaners', '2026-09-04', 'Substance D', 'ppm', 100, 'site limit', '[{"concentration":10,"durationH":8}]', '50000000-0000-0000-0000-000000000002'),
 (:O1, 'Tank cleaners', '2026-09-04', 'Substance E', 'ppm', 100, 'site limit', '[{"concentration":-1,"durationH":8}]', '50000000-0000-0000-0000-000000000002');
select 'C2', count(*) from public.hse_chemical_samples;
-- C3 limit without a source, unknown unit, STEL over 15 min (expect 3 check violations)
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, twa_limit, periods) values (:O1, 'x', '2026-09-05', 'Toluene', 'ppm', 20, '[{"concentration":10,"durationH":8}]');
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, periods) values (:O1, 'x', '2026-09-05', 'Toluene', 'percent', '[{"concentration":10,"durationH":8}]');
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, stel_limit, limit_source, periods, stel_periods) values (:O1, 'x', '2026-09-05', 'Toluene', 'ppm', 150, 'site', '[{"concentration":10,"durationH":8}]', '[{"concentration":300,"durationMin":10},{"concentration":100,"durationMin":10}]');
-- C4 a sample with no limit at all is allowed (results then have nothing to compare against)
insert into public.hse_chemical_samples(organization_id, subject_label, sample_date, agent_name, units, periods, shift_hours, weekly_hours) values (:O1, 'x', '2026-09-05', 'Unknown solvent', 'mg/m3', '[{"concentration":3,"durationH":12}]', 12, 60);
select 'C4', count(*) from public.hse_chemical_samples;
-- H1 health officer inserts an outdoor hour (expect OK); bad forms refused (expect 4 check violations:
-- outdoor without dryBulbC, 70 minutes, zero metabolic rate, unknown form)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
insert into public.hse_heat_assessments(organization_id, subject_label, assessment_date, wbgt_form, wbgt_periods, metabolic_periods, acclimatized) values
 (:O1, 'Deck crew', '2026-09-06', 'outdoor', '[{"naturalWetBulbC":25,"globeC":45,"dryBulbC":32,"durationMin":45},{"naturalWetBulbC":22,"globeC":30,"dryBulbC":28,"durationMin":15}]', '[{"metabolicRateW":400,"durationMin":45},{"metabolicRateW":120,"durationMin":15}]', true);
insert into public.hse_heat_assessments(organization_id, subject_label, assessment_date, wbgt_form, wbgt_periods, metabolic_periods, acclimatized) values
 (:O1, 'x', '2026-09-06', 'outdoor', '[{"naturalWetBulbC":25,"globeC":45,"durationMin":60}]', '[{"metabolicRateW":400,"durationMin":60}]', true);
insert into public.hse_heat_assessments(organization_id, subject_label, assessment_date, wbgt_form, wbgt_periods, metabolic_periods, acclimatized) values
 (:O1, 'x', '2026-09-06', 'measured', '[{"wbgtC":30,"durationMin":70}]', '[{"metabolicRateW":400,"durationMin":60}]', true);
insert into public.hse_heat_assessments(organization_id, subject_label, assessment_date, wbgt_form, wbgt_periods, metabolic_periods, acclimatized) values
 (:O1, 'x', '2026-09-06', 'measured', '[{"wbgtC":30,"durationMin":60}]', '[{"metabolicRateW":0,"durationMin":60}]', true);
insert into public.hse_heat_assessments(organization_id, subject_label, assessment_date, wbgt_form, wbgt_periods, metabolic_periods, acclimatized) values
 (:O1, 'x', '2026-09-06', 'shade', '[{"wbgtC":30,"durationMin":60}]', '[{"metabolicRateW":300,"durationMin":60}]', true);
select 'H1', count(*), max(created_by::text) from public.hse_heat_assessments;
-- R1 staff: reads everything in the org, cannot insert (RLS), update or delete changes nothing
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select 'R1 staff sees', (select count(*) from public.hse_noise_samples), (select count(*) from public.hse_chemical_samples), (select count(*) from public.hse_heat_assessments);
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'staff', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
update public.hse_noise_samples set subject_label = 'hijacked';
delete from public.hse_chemical_samples;
select 'R1 after staff writes', (select count(*) from public.hse_noise_samples where subject_label = 'hijacked'), (select count(*) from public.hse_chemical_samples);
-- R2 invited manager cannot write
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'invited', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
-- R3 other org owner sees nothing, cannot write into org1, cannot use org1's site or name org1's worker in org2
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select 'R3 other org sees', (select count(*) from public.hse_noise_samples), (select count(*) from public.hse_chemical_samples), (select count(*) from public.hse_heat_assessments);
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O1, 'intruder', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
insert into public.hse_noise_samples(organization_id, site_id, subject_label, sample_date, periods) values (:O2, '20000000-0000-0000-0000-000000000001', 'x', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
insert into public.hse_noise_samples(organization_id, subject_label, worker_user_id, sample_date, periods) values (:O2, 'x', '00000000-0000-0000-0000-00000000000b', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods) values (:O2, 'own org ok', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
select 'R3 own org rows', count(*) from public.hse_noise_samples;
-- R4 supervisor: forged created_by refused (RLS); a worker from another org refused (RLS)
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.hse_noise_samples(organization_id, subject_label, sample_date, periods, created_by) values (:O1, 'forged', '2026-09-01', '[{"levelDbA":90,"durationH":8}]', '00000000-0000-0000-0000-00000000000b');
insert into public.hse_noise_samples(organization_id, subject_label, worker_user_id, sample_date, periods) values (:O1, 'x', '00000000-0000-0000-0000-00000000000c', '2026-09-01', '[{"levelDbA":90,"durationH":8}]');
-- T1 an update cannot rewrite created_by or created_at, and stamps updated_by
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
update public.hse_noise_samples set subject_label = 'Compressor operators (rev)', created_by = '00000000-0000-0000-0000-00000000000b', created_at = '2000-01-01' where id = '40000000-0000-0000-0000-000000000001';
select 'T1', subject_label, created_by, updated_by, created_at > '2020-01-01' from public.hse_noise_samples where id = '40000000-0000-0000-0000-000000000001';
-- T2 moving a record to another org is refused by the trigger itself, even for
-- the service role, which bypasses RLS
reset role; set role service_role; set request.jwt.claim.sub = '';
update public.hse_noise_samples set organization_id = :O2 where id = '40000000-0000-0000-0000-000000000001';
select 'T2 org kept', organization_id from public.hse_noise_samples where id = '40000000-0000-0000-0000-000000000001';
-- S1 deleting a site that has samples is refused (FK RESTRICT)
reset role;
delete from public.organization_sites where id = '20000000-0000-0000-0000-000000000001';
-- G1 anon cannot read any hygiene table
set role anon;
select 'G1 anon', count(*) from public.hse_noise_samples;
select 'G1 anon', count(*) from public.hse_chemical_samples;
select 'G1 anon', count(*) from public.hse_heat_assessments;
