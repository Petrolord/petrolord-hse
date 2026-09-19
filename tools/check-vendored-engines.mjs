#!/usr/bin/env node
/**
 * THE VENDORED ENGINE GUARD (Petrolord HSE).
 *
 * Adapted from petrolord-suite tools/check-vendored-engines.mjs. HSE vendors
 * a SUBSET of Petrolord/petrolord-engines at packages/engines: only the
 * engines the app imports, each with its test, golden, oracle and FINDINGS.
 * The subset is listed in packages/engines/VENDOR.json, and the committed
 * packages/engines/VENDOR.manifest carries the canonical blob hash of exactly
 * those paths at the pinned commit.
 *
 * Why it exists: the failure mode of a vendored copy is silent. The build is
 * clean, the tests are green, and a repaired engine defect simply never
 * reaches the live app (the Suite found its tree sitting behind canonical on
 * 2026-09-16 with a pipeline pressure-drop defect still live). A hand edit to
 * the vendored copy is the other half: it forks the engine without anyone
 * deciding to.
 *
 * WHAT THIS CHECKS. Every tracked path under packages/engines/ (apart from
 * VENDOR.json and VENDOR.manifest) is joined by path against the manifest
 * and compared BY GIT BLOB HASH, hashed from the file ON DISK rather than
 * from the git index, so an unstaged hand edit is caught too. A manifest
 * path that is absent, a vendored path that is not in the manifest, or a
 * path differing by one byte is a finding. The manifest's path set must
 * equal VENDOR.json `subset` exactly, so the subset cannot quietly grow or
 * shrink on one side only.
 *
 * THE LEDGER. As in the Suite, a deliberate deviation may be recorded in
 * VENDOR.json `knownDeviations` with a reason, a group, a burnDownWhen and,
 * for a differing or extra path, the vendored blob it is pinned to (a second
 * drift on a known path still fails). An entry whose deviation has gone is
 * itself a failure, so the list can only shrink. The expected state is empty.
 *
 * OFFLINE BY DEFAULT. CI has no credentials for the private engines
 * repository, so the manifest is committed and trusted. Passing
 * --canonical <clone> re-derives the subset's blob hashes from that clone at
 * the pinned commit and verifies the committed manifest against them.
 * --write-manifest <clone> regenerates the manifest from the clone (the step
 * of a vendoring pass). --ahead <clone> reports, without ever failing, how
 * far canonical has moved past the pin.
 *
 * FAILING ON AN EMPTY SWEEP. A gate that examines nothing must never report
 * success, so the manifest, the vendored tree and the join must be non-empty
 * and at least the floors recorded in VENDOR.json.
 *
 * Usage:
 *   node tools/check-vendored-engines.mjs [--canonical <dir>] [--write-manifest <dir>]
 *                                        [--ahead <dir>] [--ahead-ref <ref>] [--json] [--quiet]
 * Exit 0 clean, 1 on any finding, 2 on a usage or integrity error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR_DIR = path.join(REPO, 'packages', 'engines');
const VENDOR_JSON = path.join(VENDOR_DIR, 'VENDOR.json');
const VENDOR_MANIFEST = path.join(VENDOR_DIR, 'VENDOR.manifest');
const PREFIX = 'packages/engines/';
// The vendoring contract lives inside the vendored directory so it travels
// with the tree, but it is HSE's own control data with no canonical
// counterpart, so it is not compared.
const SELF = new Set(['VENDOR.json', 'VENDOR.manifest']);

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const has = (name) => args.includes(name);
const QUIET = has('--quiet');
const AS_JSON = has('--json');

const die = (msg) => {
  process.stderr.write(`check-vendored-engines: ${msg}\n`);
  process.exit(2);
};

/* ---------------------------------------------------------------- inputs */

if (!fs.existsSync(VENDOR_JSON)) die(`missing ${path.relative(REPO, VENDOR_JSON)}`);
let vendor;
try {
  vendor = JSON.parse(fs.readFileSync(VENDOR_JSON, 'utf8'));
} catch (e) {
  die(`${path.relative(REPO, VENDOR_JSON)} is not valid JSON: ${e.message}`);
}

const commit = vendor?.canonical?.commit;
if (typeof commit !== 'string' || !/^[0-9a-f]{40}$/.test(commit)) {
  die('canonical.commit must be a full 40 character sha in VENDOR.json');
}

const subset = vendor.subset;
if (!Array.isArray(subset) || subset.length === 0 || !subset.every((p) => typeof p === 'string' && p.length > 0)) {
  die('VENDOR.json "subset" must be a non-empty array of canonical paths');
}
if (new Set(subset).size !== subset.length) die('VENDOR.json "subset" lists a path twice');
for (const p of subset) {
  if (p.startsWith('/') || p.split('/').includes('..')) die(`subset path ${p} must be relative and inside the canonical tree`);
  if (SELF.has(p)) die(`subset path ${p} collides with the vendoring contract files`);
}

const floors = vendor.floors ?? {};
const MIN_MANIFEST = Number(floors.manifestPaths ?? 1);
const MIN_VENDORED = Number(floors.vendoredPaths ?? 1);

/** path -> blob sha, from "<sha> <path>" lines. */
const readManifest = (text, whence) => {
  const map = new Map();
  let lineNo = 0;
  for (const raw of text.split('\n')) {
    lineNo += 1;
    const line = raw.trimEnd();
    if (!line || line.startsWith('#')) continue;
    const sp = line.indexOf(' ');
    if (sp === -1) die(`${whence}:${lineNo}: expected "<sha> <path>"`);
    const sha = line.slice(0, sp);
    const p = line.slice(sp + 1);
    if (!/^[0-9a-f]{40}$/.test(sha)) die(`${whence}:${lineNo}: bad blob sha`);
    if (map.has(p)) die(`${whence}:${lineNo}: duplicate path ${p}`);
    map.set(p, sha);
  }
  return map;
};

/** The subset's blob hashes in a real canonical clone at the pinned commit. */
const canonicalBlobs = (dir) => {
  if (!fs.existsSync(path.join(dir, '.git'))) die(`${dir} is not a git clone`);
  let out;
  try {
    out = execFileSync('git', ['-C', dir, 'ls-tree', '-r', commit, '--format=%(objectname) %(path)', '--', ...subset], {
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    die(`cannot list canonical ${commit} in ${dir}: ${e.message}`);
  }
  const live = readManifest(out, `${dir}@${commit}`);
  const absent = subset.filter((p) => !live.has(p));
  if (absent.length) die(`subset path(s) absent from canonical ${commit}: ${absent.join(', ')}`);
  return live;
};

/* Optional: regenerate the manifest (a vendoring pass). */
const writeDir = opt('--write-manifest');
if (writeDir) {
  const live = canonicalBlobs(writeDir);
  const lines = [
    '# Canonical petrolord-engines blobs for the SUBSET vendored here, at the commit pinned in VENDOR.json.',
    '# Generated, do not hand edit: node tools/check-vendored-engines.mjs --canonical <clone> verifies it.',
    `# commit ${commit}`,
    ...[...live.keys()].sort().map((p) => `${live.get(p)} ${p}`),
  ];
  fs.writeFileSync(VENDOR_MANIFEST, `${lines.join('\n')}\n`);
  process.stdout.write(`wrote ${path.relative(REPO, VENDOR_MANIFEST)}: ${live.size} path(s) at ${commit.slice(0, 7)}\n`);
  process.exit(0);
}

if (!fs.existsSync(VENDOR_MANIFEST)) die(`missing ${path.relative(REPO, VENDOR_MANIFEST)}`);
const canonical = readManifest(fs.readFileSync(VENDOR_MANIFEST, 'utf8'), 'VENDOR.manifest');

/* The manifest and the subset must name the same paths. */
{
  const bad = [];
  for (const p of subset) if (!canonical.has(p)) bad.push(`subset lists ${p}, the manifest does not`);
  for (const p of canonical.keys()) if (!subset.includes(p)) bad.push(`manifest lists ${p}, the subset does not`);
  if (bad.length) {
    for (const b of bad) process.stderr.write(`  ${b}\n`);
    die('VENDOR.manifest and VENDOR.json "subset" disagree; regenerate the manifest with --write-manifest <clone>');
  }
}

/* Optional: verify the committed manifest against a real canonical clone. */
const canonDir = opt('--canonical');
if (canonDir) {
  const live = canonicalBlobs(canonDir);
  const drift = [];
  for (const [p, sha] of live) if (canonical.get(p) !== sha) drift.push(`manifest is stale for ${p}`);
  if (drift.length) {
    for (const d of drift) process.stderr.write(`  ${d}\n`);
    die(`VENDOR.manifest disagrees with ${canonDir} at ${commit} on ${drift.length} path(s); regenerate it`);
  }
  if (!QUIET) process.stdout.write(`manifest verified against ${canonDir} at ${commit.slice(0, 7)} (${live.size} subset paths)\n`);
}

/* Optional advisory: how far canonical has moved past the pin. Never fails. */
const aheadDir = opt('--ahead');
if (aheadDir) {
  if (!fs.existsSync(path.join(aheadDir, '.git'))) die(`--ahead ${aheadDir} is not a git clone`);
  const ref = opt('--ahead-ref') || 'origin/main';
  try {
    const gap = execFileSync('git', ['-C', aheadDir, 'rev-list', '--count', `${commit}..${ref}`], { encoding: 'utf8' }).trim();
    const touched = execFileSync('git', ['-C', aheadDir, 'diff', '--name-only', commit, ref, '--', ...subset], { encoding: 'utf8' }).trim();
    const head = execFileSync('git', ['-C', aheadDir, 'rev-parse', '--short', ref], { encoding: 'utf8' }).trim();
    if (gap === '0') {
      process.stdout.write(`ADVISORY: the pin is ${ref} (${head}). Nothing to vendor.\n`);
    } else {
      process.stdout.write(`ADVISORY: canonical ${ref} is ${head}, ${gap} commit(s) ahead of the pinned ${commit.slice(0, 7)}; `
        + `${touched ? `subset paths changed since the pin: ${touched.split('\n').join(', ')}` : 'no subset path changed'}. `
        + 'This is NOT a failure of this check.\n');
    }
  } catch (e) {
    process.stdout.write(`ADVISORY: cannot measure the gap to ${ref} in ${aheadDir} (${e.message.split('\n')[0]})\n`);
  }
}

/* The vendored tree, as git sees it: tracked paths only. */
let lsFiles;
try {
  lsFiles = execFileSync('git', ['-C', REPO, 'ls-files', '-s', '--', 'packages/engines'], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  die(`git ls-files failed: ${e.message}`);
}

const vendored = new Map();
for (const line of lsFiles.split('\n')) {
  if (!line.trim()) continue;
  const tab = line.indexOf('\t');
  if (tab === -1) die(`unparseable git ls-files line: ${line}`);
  const [, sha] = line.slice(0, tab).split(/\s+/);
  const p = line.slice(tab + 1);
  if (!p.startsWith(PREFIX)) continue;
  const rel = p.slice(PREFIX.length);
  if (SELF.has(rel)) continue;
  vendored.set(rel, sha);
}

/* Content hashed from disk, not the index, so an unstaged edit is caught. */
const onDisk = [];
const deleted = [];
for (const rel of vendored.keys()) {
  (fs.existsSync(path.join(VENDOR_DIR, rel)) ? onDisk : deleted).push(rel);
}
for (const rel of deleted) vendored.delete(rel);
if (onDisk.length) {
  let hashed;
  try {
    hashed = execFileSync('git', ['-C', REPO, 'hash-object', '--stdin-paths'], {
      input: `${onDisk.map((rel) => PREFIX + rel).join('\n')}\n`,
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    }).trim().split('\n');
  } catch (e) {
    die(`git hash-object failed over the vendored tree: ${e.message}`);
  }
  if (hashed.length !== onDisk.length) die(`git hash-object returned ${hashed.length} hashes for ${onDisk.length} paths`);
  onDisk.forEach((rel, i) => {
    if (!/^[0-9a-f]{40}$/.test(hashed[i])) die(`git hash-object gave a bad sha for ${rel}`);
    vendored.set(rel, hashed[i]);
  });
}

/* ------------------------------------------------- the empty-sweep guard */

const fatal = [];
if (canonical.size === 0) fatal.push('VENDOR.manifest lists no canonical paths');
if (vendored.size === 0) fatal.push('git ls-files found no tracked paths under packages/engines');
if (canonical.size < MIN_MANIFEST) fatal.push(`manifest has ${canonical.size} paths, below the floor of ${MIN_MANIFEST}`);
if (vendored.size < MIN_VENDORED) fatal.push(`vendored tree has ${vendored.size} tracked paths, below the floor of ${MIN_VENDORED}`);
if (fatal.length) {
  for (const f of fatal) process.stderr.write(`EMPTY SWEEP REFUSED: ${f}\n`);
  process.stderr.write('A gate that examines nothing must never report success.\n');
  process.exit(1);
}

/* ------------------------------------------------------------- the ledger */

const ledger = new Map();
const seenLedger = new Set();
for (const [i, entry] of (vendor.knownDeviations ?? []).entries()) {
  const where = `knownDeviations[${i}]`;
  if (!entry || typeof entry.path !== 'string') die(`${where}: needs a "path"`);
  if (!['missing', 'differing', 'extra'].includes(entry.kind)) die(`${where}: kind must be missing, differing or extra`);
  if (typeof entry.reason !== 'string' || entry.reason.trim().length < 8) die(`${where}: needs a real "reason"`);
  if (typeof entry.group !== 'string' || !entry.group) die(`${where}: needs a "group"`);
  if (typeof entry.burnDownWhen !== 'string' || entry.burnDownWhen.trim().length < 8) {
    die(`${where}: needs a "burnDownWhen" saying the condition under which this row must be removed`);
  }
  if (entry.kind !== 'missing' && !/^[0-9a-f]{40}$/.test(entry.vendoredSha ?? '')) {
    die(`${where}: a ${entry.kind} path must pin "vendoredSha" to the blob currently vendored`);
  }
  if (ledger.has(entry.path)) die(`${where}: ${entry.path} is listed twice`);
  ledger.set(entry.path, entry);
}

const findings = [];
const note = (kind, p, detail, entry) => findings.push({
  kind, path: p, detail, group: entry?.group ?? null, burnDownWhen: entry?.burnDownWhen ?? null,
});

let compared = 0;

for (const [p, canonSha] of canonical) {
  const vendSha = vendored.get(p);
  const entry = ledger.get(p);
  if (vendSha === undefined) {
    if (!entry) note('MISSING', p, 'in the subset manifest, absent from the vendored tree, and not in the ledger');
    else if (entry.kind !== 'missing') note('LEDGER', p, `ledger calls this "${entry.kind}" but the path is absent`, entry);
    else seenLedger.add(p);
    continue;
  }
  compared += 1;
  if (vendSha === canonSha) {
    if (entry) note('STALE', p, `ledger still lists this as "${entry.kind}" but it now matches canonical; remove the entry`, entry);
    continue;
  }
  if (!entry) {
    note('DIFFERING', p, `vendored ${vendSha.slice(0, 12)} vs canonical ${canonSha.slice(0, 12)}, and not in the ledger`);
  } else if (entry.kind !== 'differing') {
    note('LEDGER', p, `ledger calls this "${entry.kind}" but the path is present and differs`, entry);
  } else if (entry.vendoredSha !== vendSha) {
    note('DRIFT', p, `known divergence, but the vendored blob moved: pinned ${entry.vendoredSha.slice(0, 12)}, now ${vendSha.slice(0, 12)}`, entry);
  } else {
    seenLedger.add(p);
  }
}

for (const [p, vendSha] of vendored) {
  if (canonical.has(p)) continue;
  const entry = ledger.get(p);
  if (!entry) {
    note('EXTRA', p, 'present in the vendored tree, not in the subset manifest, and not in the ledger');
  } else if (entry.kind !== 'extra') {
    note('LEDGER', p, `ledger calls this "${entry.kind}" but the path exists only in the vendored tree`, entry);
  } else if (entry.vendoredSha !== vendSha) {
    note('DRIFT', p, `known local-only file, but its blob moved: pinned ${entry.vendoredSha.slice(0, 12)}, now ${vendSha.slice(0, 12)}`, entry);
  } else {
    seenLedger.add(p);
  }
}

for (const p of ledger.keys()) {
  if (seenLedger.has(p)) continue;
  if (findings.some((f) => f.path === p)) continue;
  note('STALE', p, 'ledger entry matches no deviation in the tree; remove it', ledger.get(p));
}

if (compared === 0) {
  process.stderr.write('EMPTY SWEEP REFUSED: the join compared zero present paths.\n');
  process.exit(1);
}

/* -------------------------------------------------------------- reporting */

if (AS_JSON) {
  process.stdout.write(`${JSON.stringify({
    commit, subsetPaths: subset.length, canonicalPaths: canonical.size, vendoredPaths: vendored.size,
    comparedPaths: compared, ledgerEntries: ledger.size, findings,
  }, null, 2)}\n`);
} else if (findings.length) {
  const order = ['MISSING', 'DIFFERING', 'EXTRA', 'DRIFT', 'LEDGER', 'STALE'];
  process.stderr.write(`\nVENDORED ENGINE GUARD: ${findings.length} finding(s) against canonical ${commit.slice(0, 7)}\n\n`);
  for (const kind of order) {
    const rows = findings.filter((f) => f.kind === kind);
    if (!rows.length) continue;
    process.stderr.write(`${kind} (${rows.length}):\n`);
    for (const r of rows) {
      process.stderr.write(`  ${r.path}\n      ${r.detail}\n`);
      if (r.burnDownWhen) process.stderr.write(`      burn down when: ${r.burnDownWhen}\n`);
    }
    process.stderr.write('\n');
  }
  process.stderr.write(
    'Every deviation from canonical must be either reconciled or recorded in\n'
    + 'packages/engines/VENDOR.json with a reason, a group and a burnDownWhen.\n'
    + 'Engine changes are made in Petrolord/petrolord-engines and vendored here,\n'
    + 'never edited in place.\n',
  );
} else if (!QUIET) {
  process.stdout.write(
    `vendored engines clean against canonical ${commit.slice(0, 7)}: `
    + `${compared} path(s) compared byte for byte, ${subset.length} in the subset, `
    + `${vendored.size} vendored, ${ledger.size} recorded deviation(s).\n`,
  );
}

process.exit(findings.length ? 1 : 0);
