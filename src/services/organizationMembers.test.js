// The Members card (OrganizationMembers) reads fetchOrganizationMembers.
// It used to read organization_users with an auth.users embed; the API
// cannot embed auth.users and organization_users is no longer a table
// (membership consolidation, 2026-07), so the call failed and the card
// showed "No members yet". It now reads organization_members, which carries
// full_name and email, with avatars from user_profiles.
const db = {
  calls: [],
  tables: {
    organization_members: [
      { id: 'm1', user_id: 'u1', full_name: 'Ada Obi', email: 'ada@example.com', role: 'owner', status: 'active', created_at: '2026-01-02T00:00:00Z', joined_at: null },
      { id: 'm2', user_id: null, full_name: '', email: 'new@example.com', role: 'employee', status: 'invited', created_at: '2026-02-02T00:00:00Z', joined_at: null },
    ],
    user_profiles: [{ id: 'u1', avatar_url: 'https://cdn.example.com/a.png' }],
  },
};
function from(table) {
  const call = { table, select: null, filters: [], op: 'select' };
  db.calls.push(call);
  const q = {
    select: (cols) => { call.select = cols; return q; },
    delete: () => { call.op = 'delete'; return q; },
    eq: (c, v) => { call.filters.push(['eq', c, v]); return q; },
    in: (c, v) => { call.filters.push(['in', c, v]); return q; },
    order: () => q,
    then: (res, rej) => {
      // As live: organization_users is gone, and auth.users cannot be embedded.
      const out = table === 'organization_users'
        ? { data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.organization_users' in the schema cache" } }
        : /user:user_id|users:user_id/.test(call.select || '')
          ? { data: null, error: { message: 'Could not find a relationship' } }
          : { data: call.op === 'delete' ? null : (db.tables[table] || []), error: null };
      return Promise.resolve(out).then(res, rej);
    },
  };
  return q;
}
vi.mock('@/lib/customSupabaseClient', () => ({ supabase: { from: (t) => from(t) } }));

const { fetchOrganizationMembers, removeMember } = await import('@/services/organizationService');

afterEach(() => { db.calls = []; });

describe('fetchOrganizationMembers', () => {
  it('reads organization_members for the organisation, with names and emails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const rows = await fetchOrganizationMembers('o1');
    const main = db.calls[0];
    expect(main.table).toBe('organization_members');
    expect(main.select).not.toMatch(/user:|users:|raw_user_meta_data/);
    expect(main.filters).toContainEqual(['eq', 'organization_id', 'o1']);
    expect(rows.map((r) => [r.id, r.full_name, r.email, r.role, r.avatar_url])).toEqual([
      ['m1', 'Ada Obi', 'ada@example.com', 'owner', 'https://cdn.example.com/a.png'],
      ['m2', 'new', 'new@example.com', 'employee', null],
    ]);
    expect(db.calls.some((c) => c.table === 'organization_users')).toBe(false);
  });

  it('removeMember deletes the organization_members row in that organisation', async () => {
    await removeMember('m2', 'o1');
    const del = db.calls.find((c) => c.op === 'delete');
    expect(del.table).toBe('organization_members');
    expect(del.filters).toEqual([['eq', 'id', 'm2'], ['eq', 'organization_id', 'o1']]);
  });
});
