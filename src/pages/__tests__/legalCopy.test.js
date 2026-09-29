// Copy rule on the three legal pages (Privacy, Terms, Security): no em or en
// dashes, and no "X, not Y", "not just", "rather than", "instead of" or
// ", never" phrasing. The legal meaning is unchanged; only the phrasing is.
import fs from 'node:fs';
import path from 'node:path';

const PAGES = ['PrivacyPolicyPage.jsx', 'TermsOfServicePage.jsx', 'SecurityPage.jsx'];
const RULES = [
  ['em or en dash', /[—–]|&mdash;|&ndash;/],
  ['"not just"', /\bnot just\b/i],
  ['"rather than"', /\brather than\b/i],
  ['"instead of"', /\binstead of\b/i],
  ['", never"', /,\s+never\b/i],
  ['"X, not Y"', /\w,\s+not\s+(?!be\b|to\b|limited\b)\w/i],
];

describe('legal pages copy', () => {
  for (const page of PAGES) {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src/pages', page), 'utf8');
    for (const [name, re] of RULES) {
      it(`${page} has no ${name}`, () => {
        expect(src.match(re)?.[0] ?? null).toBeNull();
      });
    }
  }
});
