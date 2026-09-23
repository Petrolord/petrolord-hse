import { describe, test, expect } from 'vitest';
import { normalizeRole, hseAccessLevel, HSE_ROLES } from './hseAccess';

describe('normalizeRole: the shared role column read by HSE', () => {
  test('Suite roles and blanks become staff (no empty sidebar)', () => {
    for (const r of ['engineer', 'viewer', 'geoscientist', 'Engineer ', '', null, undefined, 'constructor', '__proto__', 'toString']) {
      expect(normalizeRole(r)).toBe('staff');
    }
  });

  test('owners and admins are org admins; member and employee are staff', () => {
    expect(normalizeRole('owner')).toBe('org_admin');
    expect(normalizeRole('admin')).toBe('org_admin');
    expect(normalizeRole('member')).toBe('staff');
    expect(normalizeRole('employee')).toBe('staff');
  });

  test('HSE roles pass through unchanged', () => {
    for (const r of HSE_ROLES) expect(normalizeRole(r)).toBe(r);
    expect(normalizeRole('Supervisor')).toBe('supervisor');
  });
});

describe('hseAccessLevel', () => {
  const free = [{ app_id: 'hse', module_id: 'hse_free', status: 'ACTIVE' }];
  const pro = [{ app_id: 'hse', module_id: 'hse_professional', status: 'ACTIVE' }];

  test('an internal org is premium on the free row, and with no hse row at all', () => {
    expect(hseAccessLevel(free, { is_internal: true })).toBe('premium');
    expect(hseAccessLevel([{ app_id: 'suite', module_id: 'suite_trial', status: 'ACTIVE' }], { is_internal: true })).toBe('premium');
    expect(hseAccessLevel([], { is_internal: true })).toBe('premium');
  });

  test('other orgs: the hse row decides; inactive rows and other apps do not count', () => {
    expect(hseAccessLevel(free, { is_internal: false })).toBe('basic');
    expect(hseAccessLevel(pro, {})).toBe('premium');
    expect(hseAccessLevel([{ ...pro[0], status: 'SUSPENDED' }], {})).toBe('none');
    expect(hseAccessLevel([{ app_id: 'suite', module_id: 'suite_trial', status: 'ACTIVE' }], null)).toBe('none');
    expect(hseAccessLevel(null, null)).toBe('none');
  });

  test('only a real true flag makes an org internal', () => {
    expect(hseAccessLevel(free, { is_internal: 'true' })).toBe('basic');
    expect(hseAccessLevel(free, { is_internal: 1 })).toBe('basic');
  });
});
