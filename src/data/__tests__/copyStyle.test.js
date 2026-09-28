// Batch 4B copy pass: the help guides, the FAQ, the safety moments library
// and the benefit pages carry no em dash (or en dash used as one), no
// "X, not Y" contrast, and no "rather than", ", never" or "instead of".
// Each module's exported values are walked, so code comments do not count.
const MODULES = import.meta.glob(['../helpContent/*.js', '!../helpContent/*.test.js', '../helpContent.js', '../safetyMomentsData.js', '../benefitsData.js'], { eager: true });

const BANNED = [
  [/—/, 'em dash'],
  [/ – /, 'en dash used as a dash'],
  [/\brather than\b/i, '"rather than"'],
  [/, never\b/i, '", never"'],
  [/\binstead of\b/i, '"instead of"'],
  [/, not \w/i, '"X, not Y"'],
];

function strings(value, where, out) {
  if (typeof value === 'string') out.push([where, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${where}[${i}]`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) strings(v, `${where}.${k}`, out);
  return out;
}

const all = Object.entries(MODULES)
  .filter(([file]) => !file.endsWith('.test.js'))
  .flatMap(([file, mod]) => strings(mod, file.replace('../', ''), []));

describe('user-facing copy style (batch 4B)', () => {
  it('walks the help content, safety moments and benefit pages', () => {
    expect(Object.keys(MODULES).length).toBeGreaterThanOrEqual(24);
    expect(all.length).toBeGreaterThan(1000);
  });

  it.each(BANNED)('no %s', (re, label) => {
    const hits = all.filter(([, s]) => re.test(s)).map(([w, s]) => `${w}: ${s.slice(0, 120)}`);
    expect(hits, `${label} found`).toEqual([]);
  });
});
