// Deterministic, explainable ATS checks. Scores 0-100.
const ACTION_VERBS = ['led','built','developed','designed','created','implemented','improved','increased','reduced','launched','managed','delivered','automated','optimized','analyzed','collaborated','architected','deployed','migrated','mentored','owned','drove','streamlined','engineered','established','coordinated','resolved','integrated','maintained','tested','shipped','produced','organized','trained','negotiated'];
const SECTIONS = {
  experience: /\b(experience|employment|work history|internship)/i,
  education: /\beducation\b/i,
  skills: /\bskills\b|technologies|technical proficiencies/i,
  summary: /\b(summary|profile|objective|about me)\b/i,
  projects: /\bprojects?\b/i,
};

function run(text, meta = {}) {
  const checks = [];
  const add = (id, label, passed, detail, severity = 'medium', weight = 10) =>
    checks.push({ id, label, passed, detail, severity, weight });

  const words = text.split(/\s+/).filter(Boolean);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  add('email', 'Email address present', /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text), 'Recruiters and ATS parsers look for an email first.', 'high', 10);
  add('phone', 'Phone number present', /(\+?\d[\d\s().-]{8,}\d)/.test(text), 'Add a phone number in a standard format.', 'medium', 6);

  const lenOk = words.length >= 250 && words.length <= 1000;
  add('length', 'Length is 250-1000 words', lenOk, `Your resume has about ${words.length} words.`, words.length < 150 ? 'high' : 'medium', 10);

  const bullets = lines.filter((l) => /^[•●▪◦·*\-–—]\s+/.test(l)).length;
  add('bullets', 'Uses bullet points', bullets >= 5, `Found ${bullets} bullet lines. Bullets make achievements scannable.`, 'medium', 8);

  const lower = text.toLowerCase();
  const verbsFound = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(lower));
  add('verbs', 'Strong action verbs', verbsFound.length >= 5, `Found ${verbsFound.length} distinct action verbs.`, 'medium', 8);

  add('tables', 'No tables or columns that confuse parsers', !meta.hasTables, 'Tables and multi-column layouts can scramble reading order.', 'high', 10);
  add('images', 'No embedded images or graphics', !meta.hasImages, 'Photos and graphics are ignored by ATS and can break parsing.', 'medium', 6);

  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  const numericDates = (text.match(/\b\d{1,2}\/\d{4}\b/g) || []).length;
  const monthDates = (text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/gi) || []).length;
  const mixedDates = numericDates > 0 && monthDates > 0;
  add('dates', 'Consistent date format', years.length > 0 && !mixedDates, mixedDates ? 'You mix MM/YYYY and Month YYYY formats. Pick one.' : years.length ? 'Dates look consistent.' : 'No dates found.', 'low', 6);

  Object.entries(SECTIONS).forEach(([key, re]) => {
    const required = ['experience', 'education', 'skills'].includes(key);
    add(`section-${key}`, `${key[0].toUpperCase() + key.slice(1)} section`, re.test(text), `Add a clearly labelled ${key} section.`, required ? 'high' : 'low', required ? 8 : 3);
  });

  const withNumbers = lines.filter((l) => /\d+%|\$\s?\d|\b\d{2,}\b/.test(l) && /^[•●▪◦·*\-–—]/.test(l)).length;
  add('metrics', 'Quantified achievements', withNumbers >= 3, `${withNumbers} bullet(s) include numbers. Add real measurable results where you have them.`, 'medium', 8);

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / total) * 100);

  return { score, checks, stats: { words: words.length, bullets, actionVerbs: verbsFound.length } };
}

module.exports = { run };
