// Data-driven template catalog (48 configs). Mirror of server/utils/templateCatalog.js
export const LAYOUTS = ['SingleColumn', 'TwoColumnLeft', 'TwoColumnRight', 'HeaderBanner', 'Sidebar'];

const BASE_ORDER = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'languages', 'links', 'custom'];

const STYLES = [
  { key: 'modern', name: 'Modern', fonts: { heading: 'Inter, Arial, sans-serif', body: 'Inter, Arial, sans-serif' }, headings: ['bar', 'underline', 'bar', 'plain', 'bar', 'underline'], accents: ['#6366f1', '#0ea5e9', '#8b5cf6'], spacing: 'comfortable', order: BASE_ORDER },
  { key: 'classic', name: 'Classic', fonts: { heading: "Merriweather, Georgia, serif", body: "Merriweather, Georgia, serif" }, headings: ['underline', 'caps', 'underline', 'plain', 'caps', 'underline'], accents: ['#1e3a8a', '#7f1d1d', '#14532d'], spacing: 'comfortable', order: ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'links', 'custom'] },
  { key: 'minimal', name: 'Minimal', fonts: { heading: "'Source Sans 3', Arial, sans-serif", body: "'Source Sans 3', Arial, sans-serif" }, headings: ['plain', 'caps', 'plain', 'underline', 'plain', 'caps'], accents: ['#111827', '#374151', '#0f766e'], spacing: 'airy', order: BASE_ORDER },
  { key: 'creative', name: 'Creative', fonts: { heading: 'Poppins, Arial, sans-serif', body: "'Source Sans 3', Arial, sans-serif" }, headings: ['pill', 'bar', 'pill', 'box', 'pill', 'bar'], accents: ['#db2777', '#ea580c', '#7c3aed'], spacing: 'comfortable', order: BASE_ORDER },
  { key: 'ats-safe', name: 'ATS-Safe', fonts: { heading: 'Arial, Helvetica, sans-serif', body: 'Arial, Helvetica, sans-serif' }, headings: ['caps', 'underline', 'plain', 'caps', 'underline', 'plain'], accents: ['#111827', '#1f2937', '#1e3a8a'], spacing: 'compact', order: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'languages', 'links', 'custom'], forceSingle: true },
  { key: 'executive', name: 'Executive', fonts: { heading: "'Playfair Display', Georgia, serif", body: "'Source Sans 3', Arial, sans-serif" }, headings: ['underline', 'caps', 'underline', 'bar', 'caps', 'underline'], accents: ['#7c2d12', '#1e293b', '#134e4a'], spacing: 'airy', order: ['summary', 'experience', 'achievements', 'education', 'skills', 'certifications', 'projects', 'languages', 'links', 'custom'] },
  { key: 'tech', name: 'Tech', fonts: { heading: "'Inter', Arial, sans-serif", body: "'Inter', Arial, sans-serif" }, headings: ['code', 'bar', 'code', 'underline', 'code', 'box'], accents: ['#059669', '#2563eb', '#7c3aed'], spacing: 'compact', order: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'languages', 'links', 'custom'] },
  { key: 'fresher', name: 'Fresher', fonts: { heading: 'Lora, Georgia, serif', body: "'Source Sans 3', Arial, sans-serif" }, headings: ['box', 'underline', 'bar', 'box', 'underline', 'plain'], accents: ['#0369a1', '#0f766e', '#6d28d9'], spacing: 'comfortable', order: ['summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'achievements', 'languages', 'links', 'custom'] },
];

// 6 variants per style: layout, photo, project links
const VARIANTS = [
  { layout: 'SingleColumn', photo: false, projectLinks: true },
  { layout: 'SingleColumn', photo: true, projectLinks: false },
  { layout: 'TwoColumnLeft', photo: true, projectLinks: true },
  { layout: 'TwoColumnRight', photo: false, projectLinks: false },
  { layout: 'HeaderBanner', photo: true, projectLinks: true },
  { layout: 'Sidebar', photo: false, projectLinks: true },
];

export const templates = [];
STYLES.forEach((s) => {
  VARIANTS.forEach((v, i) => {
    const layout = s.forceSingle ? 'SingleColumn' : v.layout;
    const photo = s.forceSingle ? false : v.photo;
    const projectLinks = s.forceSingle ? i % 2 === 0 : v.projectLinks;
    const columns = layout === 'SingleColumn' || layout === 'HeaderBanner' ? 1 : 2;
    const accent = s.accents[i % s.accents.length];
    const atsSafe = !photo && columns === 1 && layout !== 'HeaderBanner' && s.key !== 'creative';
    templates.push({
      id: `${s.key}-${i + 1}`,
      name: `${s.name} ${i + 1}`,
      tags: { photo, columns, projectLinks, style: s.name },
      atsSafe,
      layout,
      fonts: s.fonts,
      colors: { accent, text: '#1f2937', muted: '#6b7280', side: '#f3f4f6', bg: '#ffffff' },
      headingStyle: s.headings[i],
      sectionOrder: s.order,
      spacing: s.spacing,
    });
  });
});



export const STYLE_NAMES = STYLES.map((s) => s.name);
