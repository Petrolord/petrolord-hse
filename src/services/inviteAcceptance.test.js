// Security fix 2026-09-19 (Suite migration
// 20260919190000_security_invitation_acceptance.sql). Invitation acceptance
// used to call add_user_to_organization(p_user_id, p_org_id, p_role), a
// SECURITY DEFINER function anyone could call to make any user an owner of
// any organization, and the signup passed organization_id + role in its
// metadata, which the signup trigger trusted. These tests pin the new path:
// the page reads and accepts only through token RPCs, never sends a user id,
// an organization or a role, and the invite edge function checks its caller.

import fs from 'node:fs';
import path from 'node:path';

const rpc = vi.fn();
const from = vi.fn();
vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: {
    rpc: (...args) => rpc(...args),
    from: (...args) => from(...args),
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    functions: { invoke: vi.fn() },
  },
}));

const { inviteUserService } = await import('@/services/inviteUserService');

const read = (rel) => fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');

beforeEach(() => {
  rpc.mockReset();
  from.mockReset();
});

describe('inviteUserService', () => {
  it('looks an invitation up by token through get_invitation_by_token, not the table', async () => {
    rpc.mockResolvedValue({ data: { id: 'i1', email: 'a@b.test', role: 'member', organizations: { name: 'Org' } }, error: null });
    const inv = await inviteUserService.validateToken('tok');
    expect(rpc).toHaveBeenCalledWith('get_invitation_by_token', { p_token: 'tok' });
    expect(from).not.toHaveBeenCalled();
    expect(inv.organizations.name).toBe('Org');
  });

  it('returns null for an unknown token or an RPC error', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await inviteUserService.validateToken('nope')).toBeNull();
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await inviteUserService.validateToken('nope')).toBeNull();
    expect(await inviteUserService.validateToken('')).toBeNull();
  });

  it('accepts with the token ONLY: no user id, no organization, no role', async () => {
    rpc.mockResolvedValue({ data: { status: 'accepted' }, error: null });
    await inviteUserService.acceptInvitation('tok', 'someone-elses-id');
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('accept_invitation', { p_token: 'tok' });
    expect(from).not.toHaveBeenCalled();
  });

  it('surfaces the refusal message from the database', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'This invitation was sent to a different email address.' } });
    await expect(inviteUserService.acceptInvitation('tok')).rejects.toThrow('different email address');
  });

  it('declines through decline_invitation, not a table update', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await inviteUserService.declineInvitation('tok');
    expect(rpc).toHaveBeenCalledWith('decline_invitation', { p_token: 'tok' });
    expect(from).not.toHaveBeenCalled();
  });
});

describe('no path back to the trust-everything function', () => {
  it('nothing in src calls add_user_to_organization', () => {
    const hits = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(jsx?|tsx?)$/.test(e.name) && !e.name.endsWith('.test.js')
          && fs.readFileSync(p, 'utf8').includes("rpc('add_user_to_organization'")) hits.push(p);
      }
    };
    walk(path.resolve(__dirname, '..'));
    expect(hits).toEqual([]);
  });

  it('the acceptance page signs up with the token and never with organization_id or role', () => {
    const page = read('src/components/auth/InvitationAcceptance.jsx');
    const signUp = page.slice(page.indexOf('supabase.auth.signUp('), page.indexOf('if (signUpError)'));
    expect(signUp).toContain('invitation_token: token');
    expect(signUp).not.toMatch(/organization_id\s*:/);
    expect(signUp).not.toMatch(/\brole\s*:/);
    expect(page).not.toMatch(/acceptInvitation\(token,/);
  });
});

describe('hse-invite-user edge function', () => {
  const fn = read('supabase/functions/hse-invite-user/index.ts');

  it('resolves the caller from the JWT and refuses without one', () => {
    expect(fn).toMatch(/auth\.getUser\(jwt\)/);
    expect(fn).toMatch(/401/);
  });

  it('requires an active admin membership of org_id', () => {
    expect(fn).toMatch(/from\('organization_members'\)[\s\S]*eq\('organization_id', org_id\)[\s\S]*eq\('user_id', caller\.id\)/);
    expect(fn).toMatch(/Only organization admins can invite members/);
  });

  it('stamps invited_by from the session, never from the body', () => {
    expect(fn).toContain('const invited_by = caller.id;');
    expect(fn).not.toMatch(/const \{[^}]*invited_by[^}]*\} = await req\.json\(\)/);
  });
});
