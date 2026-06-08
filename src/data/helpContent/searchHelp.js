import { guideList } from './index';
import { faqs } from '../helpContent';

const stripTags = (s) => String(s).replace(/<[^>]*>/g, ' ');

// Flatten a section's content blocks (or HTML string) into searchable text.
function blockText(content) {
  if (!content) return '';
  if (typeof content === 'string') return stripTags(content);
  return content.map((b) => {
    if (!b) return '';
    if (b.type === 'paragraph') return b.text || '';
    if (b.type === 'list') return (b.items || []).join(' ');
    if (b.type === 'step-list') return (b.items || []).map((i) => `${i.title || ''} ${i.description || ''}`).join(' ');
    if (b.type === 'alert') return `${b.title || ''} ${b.text || ''}`;
    return '';
  }).join(' ');
}

function sectionText(s) {
  return [
    s.title,
    s.description,
    blockText(s.content),
    (s.subsections || []).map((ss) => `${ss.title} ${blockText(ss.content)}`).join(' '),
  ].filter(Boolean).join(' ');
}

/**
 * Search across all module guides (titles, descriptions, section content) and FAQs.
 * Returns { guides: [{ guide, sections: [matchedSectionTitle] }], faqs: [{ category, q, a }] }.
 */
export function searchHelp(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return { guides: [], faqs: [] };

  const guides = [];
  for (const g of guideList) {
    const matchedSections = (g.sections || [])
      .filter((s) => sectionText(s).toLowerCase().includes(q))
      .map((s) => s.title);
    const headerHit = `${g.title} ${g.description}`.toLowerCase().includes(q);
    if (headerHit || matchedSections.length) {
      guides.push({ guide: g, sections: matchedSections.slice(0, 5) });
    }
  }

  const faqHits = [];
  for (const cat of faqs) {
    for (const item of cat.questions || []) {
      if (`${item.q} ${item.a}`.toLowerCase().includes(q)) {
        faqHits.push({ category: cat.category, q: item.q, a: item.a });
      }
    }
  }

  return { guides, faqs: faqHits };
}
