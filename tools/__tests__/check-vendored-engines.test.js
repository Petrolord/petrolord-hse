// The vendoring guard must go red when the vendored subset drifts, and
// green only when it matches the manifest. Each case runs the REAL guard
// script against a throwaway git repository holding a copy of
// packages/engines, then damages that copy the way a real mistake would.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const ENGINE = 'packages/engines/engines/hse/safetyStats.js';
const EXPOSURE = 'packages/engines/engines/hse/exposure.js';

const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8' });

let dir;

const makeRepo = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'hse-vendor-guard-'));
  fs.cpSync(path.join(REPO, 'packages', 'engines'), path.join(d, 'packages', 'engines'), { recursive: true });
  fs.mkdirSync(path.join(d, 'tools'));
  fs.copyFileSync(path.join(REPO, 'tools', 'check-vendored-engines.mjs'), path.join(d, 'tools', 'check-vendored-engines.mjs'));
  git(d, 'init', '-q');
  git(d, 'add', 'packages');
  return d;
};

const guard = (...extra) => {
  const r = spawnSync(process.execPath, [path.join(dir, 'tools', 'check-vendored-engines.mjs'), ...extra], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

const editVendor = (fn) => {
  const p = path.join(dir, 'packages', 'engines', 'VENDOR.json');
  const v = JSON.parse(fs.readFileSync(p, 'utf8'));
  fn(v);
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
};

beforeEach(() => { dir = makeRepo(); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

describe('vendored engine guard', () => {
  test('the committed subset is clean and the guard says how much it compared', () => {
    const r = guard();
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/10 path\(s\) compared byte for byte/);
  });

  test('an unstaged hand edit to the engine is caught (hashed from disk)', () => {
    fs.appendFileSync(path.join(dir, ENGINE), '\n// local tweak\n');
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/DIFFERING/);
    expect(r.out).toContain('engines/hse/safetyStats.js');
  });

  test('a hand edit to the H2 exposure engine is caught, by name', () => {
    fs.writeFileSync(path.join(dir, EXPOSURE), fs.readFileSync(path.join(dir, EXPOSURE), 'utf8').replace('twaCoefficientDb: 16.61', 'twaCoefficientDb: 16.6'));
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/DIFFERING/);
    expect(r.out).toContain('engines/hse/exposure.js');
  });

  test('the exposure golden deleted from the vendored tree is caught', () => {
    fs.rmSync(path.join(dir, 'packages', 'engines', 'test-data', 'hse', 'goldens', 'exposure_cases.json'));
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/MISSING/);
    expect(r.out).toContain('exposure_cases.json');
  });

  test('a file added to packages/engines outside the subset is caught', () => {
    const extra = path.join(dir, 'packages', 'engines', 'engines', 'hse', 'extra.js');
    fs.writeFileSync(extra, 'export const x = 1;\n');
    git(dir, 'add', 'packages');
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/EXTRA/);
  });

  test('a subset file deleted from the vendored tree is caught', () => {
    fs.rmSync(path.join(dir, 'packages', 'engines', 'test-data', 'hse', 'goldens', 'safetyStats_cases.json'));
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/MISSING/);
  });

  test('the subset and the manifest must name the same paths', () => {
    editVendor((v) => { v.subset = v.subset.filter((p) => !p.endsWith('oracle_safetystats.py')); });
    const r = guard();
    expect(r.code).toBe(2);
    expect(r.out).toMatch(/disagree/);
  });

  test('a recorded deviation pinned to the current blob passes, and a second drift fails', () => {
    fs.appendFileSync(path.join(dir, ENGINE), '\n// deliberate\n');
    const sha = git(dir, 'hash-object', ENGINE).trim();
    editVendor((v) => {
      v.knownDeviations = [{
        path: 'engines/hse/safetyStats.js', kind: 'differing', vendoredSha: sha,
        reason: 'test fixture deviation', group: 'test', burnDownWhen: 'the test finishes',
      }];
    });
    expect(guard().code).toBe(0);
    fs.appendFileSync(path.join(dir, ENGINE), '\n// and again\n');
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/DRIFT/);
  });

  test('a ledger entry for a deviation that no longer exists is itself a failure', () => {
    editVendor((v) => {
      v.knownDeviations = [{
        path: 'engines/hse/safetyStats.js', kind: 'differing', vendoredSha: 'a'.repeat(40),
        reason: 'stale row left behind', group: 'test', burnDownWhen: 'never, it is stale',
      }];
    });
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/STALE/);
  });

  test('an empty vendored tree is refused, never reported clean', () => {
    git(dir, 'rm', '-q', '-r', '--cached', 'packages/engines');
    const r = guard();
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/EMPTY SWEEP REFUSED/);
  });
});
