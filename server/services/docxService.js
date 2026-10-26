const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, Footer, ExternalHyperlink,
} = require('docx');

const hex = (c, fallback = '4F46E5') => (/^#?[0-9a-f]{6}$/i.test(c || '') ? c.replace('#', '') : fallback);
const lines = (s = '') => String(s).split('\n').map((l) => l.replace(/^[•●▪◦·*\-–—]\s*/, '').trim()).filter(Boolean);

async function buildDocx(resume) {
  const d = resume.data || {};
  const s = resume.settings || {};
  const THEME_PRIMARY = { ocean: '#1d4ed8', royal: '#1e40af', 'blue-orange': '#1e3a8a', 'orange-blue': '#c2410c', aqua: '#0e7490', forest: '#15803d', mint: '#111827', slate: '#334155', gold: '#1e293b', purple: '#6d28d9', rose: '#be123c', burgundy: '#7f1d1d' };
  const accent = hex(s.accent || THEME_PRIMARY[s.theme]);
  const font = (s.font || 'Calibri').split(',')[0].replace(/['"]/g, '');
  const size = Math.round((s.fontSize || 11) * 2);
  const order = s.sectionOrder?.length ? s.sectionOrder : ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'languages', 'links', 'custom'];
  const hidden = new Set(s.hidden || []);

  const run = (text, o = {}) => new TextRun({ text: String(text || ''), font, size, ...o });
  const heading = (t) =>
    new Paragraph({
      spacing: { before: 240, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 2 } },
      children: [run(t.toUpperCase(), { bold: true, color: accent, size: size + 2 })],
    });
  const row = (left, right) =>
    new Paragraph({ spacing: { before: 80 }, children: [run(left, { bold: true }), run(right ? `  |  ${right}` : '', { color: '555555' })] });
  const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [run(t)] });
  const para = (t) => new Paragraph({ spacing: { after: 60 }, children: [run(t)] });

  const c = d.contact || {};
  const out = [
    new Paragraph({ alignment: AlignmentType.LEFT, children: [run(c.name || 'Your Name', { bold: true, size: size * 2, color: accent })] }),
  ];
  if (c.title) out.push(new Paragraph({ children: [run(c.title, { size: size + 2 })] }));
  const contactLine = [c.email, c.phone, c.location, c.website, c.linkedin, c.github].filter(Boolean).join('  |  ');
  if (contactLine) out.push(new Paragraph({ spacing: { after: 120 }, children: [run(contactLine, { color: '555555' })] }));

  const builders = {
    summary: () => (d.summary ? [heading('Summary'), para(d.summary)] : []),
    experience: () =>
      (d.experience || []).length
        ? [heading('Experience'), ...d.experience.flatMap((e) => [
            row(`${e.role || ''}${e.company ? ', ' + e.company : ''}`, [e.start, e.end].filter(Boolean).join(' - ')),
            ...lines(e.bullets).map(bullet),
          ])]
        : [],
    projects: () =>
      (d.projects || []).length
        ? [heading('Projects'), ...d.projects.flatMap((p) => [
            new Paragraph({ spacing: { before: 80 }, children: [
              run(p.title || '', { bold: true }),
              run(p.tech ? `  |  ${p.tech}` : '', { color: '555555' }),
              ...(p.link ? [run('  |  '), new ExternalHyperlink({ link: /^https?:/.test(p.link) ? p.link : `https://${p.link}`, children: [run(p.link, { color: accent, underline: {} })] })] : []),
            ] }),
            ...lines(p.description).map(bullet),
          ])]
        : [],
    education: () =>
      (d.education || []).length
        ? [heading('Education'), ...d.education.flatMap((e) => [
            row(`${e.degree || ''}${e.field ? ', ' + e.field : ''}`, [e.start, e.end].filter(Boolean).join(' - ')),
            para([e.school, e.details].filter(Boolean).join(' - ')),
          ])]
        : [],
    skills: () =>
      (d.skills || []).length
        ? [heading('Skills'), ...d.skills.map((x) => new Paragraph({ children: [run(x.group ? `${x.group}: ` : '', { bold: true }), run(x.items)] }))]
        : [],
    certifications: () =>
      (d.certifications || []).length
        ? [heading('Certifications'), ...d.certifications.map((x) => bullet([x.name, x.issuer, x.year].filter(Boolean).join(' - ')))]
        : [],
    achievements: () => ((d.achievements || []).length ? [heading('Achievements'), ...d.achievements.map((x) => bullet(x.text))] : []),
    languages: () => ((d.languages || []).length ? [heading('Languages'), para(d.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(', '))] : []),
    links: () => ((d.links || []).length ? [heading('Links'), ...d.links.map((l) => para(`${l.label ? l.label + ': ' : ''}${l.url || ''}`))] : []),
    custom: () => (d.custom || []).flatMap((x) => [heading(x.title || 'Additional'), ...lines(x.content).map(bullet)]),
  };

  order.filter((k) => !hidden.has(k) && builders[k]).forEach((k) => out.push(...builders[k]()));

  const footer = s.footerTag === false
    ? undefined
    : { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Made with HireReady AI', { size: 16, color: '888888' })] })] }) };

  const doc = new Document({
    creator: 'HireReady AI',
    title: resume.title,
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } }, footers: footer, children: out }],
  });
  return Packer.toBuffer(doc);
}

module.exports = { buildDocx };
