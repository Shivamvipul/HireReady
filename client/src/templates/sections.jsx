import { Github, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const lines = (s = '') => String(s).split('\n').map((l) => l.replace(/^[•●▪◦·*\-–—]\s*/, '').trim()).filter(Boolean);
const dates = (a, b) => [a, b].filter(Boolean).join(' – ');
const href = (u = '') => (/^(https?:|mailto:)/i.test(u) ? u : `https://${u}`);
const CONTACT_ICONS = {
  email: Mail,
  phone: Phone,
  location: MapPin,
  website: Globe,
  linkedin: Linkedin,
  github: Github,
};

export const hasContent = (key, d) => {
  if (key === 'summary') return !!d.summary?.trim();
  return Array.isArray(d[key]) && d[key].length > 0;
};

export function Heading({ title, ctx }) {
  const { accent, tpl, onDark, fs } = ctx;
  const base = { fontFamily: ctx.headingFont, fontSize: fs * 1.05, fontWeight: 700, margin: `${ctx.sp(14)}px 0 ${ctx.sp(6)}px` };
  const color = onDark ? '#fff' : accent;
  switch (tpl.headingStyle) {
    case 'underline': return <div style={{ ...base, color, borderBottom: `1.5px solid ${onDark ? 'rgba(255,255,255,.5)' : accent}`, paddingBottom: 3 }}>{title}</div>;
    case 'bar': return <div style={{ ...base, color: onDark ? '#fff' : ctx.text, borderLeft: `4px solid ${onDark ? '#fff' : accent}`, paddingLeft: 8 }}>{title}</div>;
    case 'caps': return <div style={{ ...base, color: onDark ? '#fff' : ctx.text, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: fs * 0.92, borderBottom: `1px solid ${onDark ? 'rgba(255,255,255,.4)' : (ctx.secondary ? `${ctx.secondary}55` : '#d1d5db')}`, paddingBottom: 3 }}>{title}</div>;
    case 'pill': return <div style={{ ...base }}><span style={{ background: onDark ? '#fff' : accent, color: onDark ? accent : '#fff', borderRadius: 999, padding: '2px 12px', fontSize: fs * 0.95 }}>{title}</span></div>;
    case 'box': return <div style={{ ...base, color, border: `1.5px solid ${onDark ? '#fff' : accent}`, padding: '2px 8px', borderRadius: 4 }}>{title}</div>;
    case 'code': return <div style={{ ...base, color, fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, monospace" }}>{`// ${title.toLowerCase()}`}</div>;
    default: return <div style={{ ...base, color: onDark ? '#fff' : ctx.text }}>{title}</div>;
  }
}

const Bullets = ({ text, ctx }) => (
  <ul style={{ margin: `${ctx.sp(3)}px 0 0`, paddingLeft: 16 }}>
    {lines(text).map((l, i) => <li key={i} style={{ marginBottom: ctx.sp(2) }}>{l}</li>)}
  </ul>
);
const Row = ({ left, right, ctx }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
    <div style={{ fontWeight: 700 }}>{left}</div>
    {right && <div style={{ color: ctx.muted, fontSize: ctx.fs * 0.9, whiteSpace: 'nowrap' }}>{right}</div>}
  </div>
);
const Sub = ({ children, ctx }) => (children ? <div style={{ color: ctx.muted, fontSize: ctx.fs * 0.95 }}>{children}</div> : null);

export const SECTION_RENDER = {
  summary: (d, ctx) => <p style={{ margin: 0 }}>{d.summary}</p>,
  experience: (d, ctx) => d.experience.map((e) => (
    <div className="rr-entry" key={e.id} style={{ marginBottom: ctx.sp(8) }}>
      <Row ctx={ctx} left={[e.role, e.company].filter(Boolean).join(', ')} right={dates(e.start, e.end)} />
      <Sub ctx={ctx}>{e.location}</Sub>
      <Bullets text={e.bullets} ctx={ctx} />
    </div>
  )),
  projects: (d, ctx) => d.projects.map((p) => (
    <div className="rr-entry" key={p.id} style={{ marginBottom: ctx.sp(8) }}>
      <Row ctx={ctx} left={p.title} right={ctx.tpl.tags.projectLinks && p.link ? <a href={href(p.link)} style={{ color: ctx.accentText, textDecoration: 'none' }}>↗ {p.link}</a> : null} />
      <Sub ctx={ctx}>{p.tech}</Sub>
      <Bullets text={p.description} ctx={ctx} />
    </div>
  )),
  education: (d, ctx) => d.education.map((e) => (
    <div className="rr-entry" key={e.id} style={{ marginBottom: ctx.sp(6) }}>
      <Row ctx={ctx} left={[e.degree, e.field].filter(Boolean).join(', ')} right={dates(e.start, e.end)} />
      <Sub ctx={ctx}>{e.school}</Sub>
      {e.details && <div>{e.details}</div>}
    </div>
  )),
  skills: (d, ctx) => d.skills.map((s) => (
    <div key={s.id} style={{ marginBottom: ctx.sp(3) }}>{s.group && <b style={{ color: ctx.onDark ? 'inherit' : ctx.secondary }}>{s.group}: </b>}<span>{s.items}</span></div>
  )),
  certifications: (d, ctx) => d.certifications.map((c) => (
    <div key={c.id} style={{ marginBottom: ctx.sp(3) }}><b>{c.name}</b>{(c.issuer || c.year) && <span style={{ color: ctx.muted }}> · {[c.issuer, c.year].filter(Boolean).join(', ')}</span>}</div>
  )),
  achievements: (d, ctx) => (
    <ul style={{ margin: 0, paddingLeft: 16 }}>{d.achievements.map((a) => <li key={a.id} style={{ marginBottom: ctx.sp(2) }}>{a.text}</li>)}</ul>
  ),
  languages: (d, ctx) => d.languages.map((l) => (
    <div key={l.id} style={{ marginBottom: ctx.sp(2) }}>{l.name}{l.level && <span style={{ color: ctx.muted }}> ({l.level})</span>}</div>
  )),
  links: (d, ctx) => d.links.map((l) => (
    <div key={l.id} style={{ marginBottom: ctx.sp(2), wordBreak: 'break-all' }}>{l.label && <b>{l.label}: </b>}<a href={href(l.url)} style={{ color: 'inherit' }}>{l.url}</a></div>
  )),
};

// Custom sections render as several headed blocks.
export function renderCustom(d, ctx) {
  return d.custom.map((c) => (
    <div className="rr-entry" key={c.id}>
      <Heading title={c.title || 'Additional'} ctx={ctx} />
      <Bullets text={c.content} ctx={{ ...ctx, sp: (n) => 0 * n }} />
    </div>
  ));
}

export function Section({ k, d, ctx }) {
  if (!hasContent(k, d)) return null;
  if (k === 'custom') return <>{renderCustom(d, ctx)}</>;
  const label = { summary: 'Summary', experience: 'Experience', projects: 'Projects', education: 'Education', skills: 'Skills', certifications: 'Certifications', achievements: 'Achievements', languages: 'Languages', links: 'Links' }[k];
  return <section><Heading title={label} ctx={ctx} />{SECTION_RENDER[k](d, ctx)}</section>;
}

export function ContactList({ c, ctx, inline }) {
  const items = [
    c.email && { key: 'email', v: c.email, h: `mailto:${c.email}` },
    c.phone && { key: 'phone', v: c.phone },
    c.location && { key: 'location', v: c.location },
    c.website && { key: 'website', v: c.website, h: href(c.website) },
    c.linkedin && { key: 'linkedin', v: c.linkedin, h: href(c.linkedin) },
    c.github && { key: 'github', v: c.github, h: href(c.github) },
  ].filter(Boolean);
  if (!items.length) return null;
  const Icon = ({ keyName }) => {
    const IconComp = CONTACT_ICONS[keyName] || Globe;
    return <IconComp size={12} style={{ flexShrink: 0, color: ctx.onDark ? 'inherit' : ctx.secondary }} aria-hidden="true" />;
  };
  const el = (i) => {
    const label = i.v
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/^mailto:/i, '');
    const node = i.h ? <a href={i.h} style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}>{label}</a> : <span>{label}</span>;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon keyName={i.key} />
        {node}
      </span>
    );
  };
  if (inline) return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', fontSize: ctx.fs * 0.95 }}>{items.map((i, n) => <span key={n}>{el(i)}</span>)}</div>;
  return <div style={{ fontSize: ctx.fs * 0.95 }}>{items.map((i, n) => <div key={n} style={{ marginBottom: ctx.sp(3), wordBreak: 'break-all' }}>{el(i)}</div>)}</div>;
}
