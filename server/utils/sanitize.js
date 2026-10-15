// Clean parsed text before it is placed into any prompt or stored.
const MAX_CHARS = 20000;

exports.cleanText = (input = '', max = MAX_CHARS) =>
  String(input)
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/<\/?(resume|job_description|profile|answer|question)>/gi, '') // stop tag break-outs
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);

exports.stripHtml = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

// Turn Resume.data into plain text for prompts.
exports.resumeToText = (d = {}) => {
  const c = d.contact || {};
  const lines = [];
  lines.push([c.name, c.title].filter(Boolean).join(' - '));
  lines.push([c.email, c.phone, c.location, c.website, c.linkedin, c.github].filter(Boolean).join(' | '));
  if (d.summary) lines.push('\nSUMMARY\n' + d.summary);
  if (d.experience?.length) {
    lines.push('\nEXPERIENCE');
    d.experience.forEach((e) =>
      lines.push(`${e.role || ''} at ${e.company || ''} (${e.start || ''} - ${e.end || ''})\n${e.bullets || ''}`)
    );
  }
  if (d.projects?.length) {
    lines.push('\nPROJECTS');
    d.projects.forEach((p) => lines.push(`${p.title || ''} [${p.tech || ''}] ${p.link || ''}\n${p.description || ''}`));
  }
  if (d.education?.length) {
    lines.push('\nEDUCATION');
    d.education.forEach((e) => lines.push(`${e.degree || ''} ${e.field || ''}, ${e.school || ''} (${e.start || ''} - ${e.end || ''}) ${e.details || ''}`));
  }
  if (d.skills?.length) {
    lines.push('\nSKILLS');
    d.skills.forEach((s) => lines.push(`${s.group ? s.group + ': ' : ''}${s.items || ''}`));
  }
  if (d.certifications?.length) {
    lines.push('\nCERTIFICATIONS');
    d.certifications.forEach((x) => lines.push(`${x.name || ''} ${x.issuer || ''} ${x.year || ''}`));
  }
  if (d.achievements?.length) {
    lines.push('\nACHIEVEMENTS');
    d.achievements.forEach((x) => lines.push(x.text || ''));
  }
  if (d.languages?.length) lines.push('\nLANGUAGES\n' + d.languages.map((l) => `${l.name} ${l.level || ''}`).join(', '));
  (d.custom || []).forEach((x) => lines.push(`\n${(x.title || 'CUSTOM').toUpperCase()}\n${x.content || ''}`));
  return exports.cleanText(lines.join('\n'));
};
