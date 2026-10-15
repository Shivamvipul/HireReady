import { Section, ContactList, hasContent } from './sections';

const SIDE = ['skills', 'languages', 'links', 'certifications'];

const Photo = ({ src, size = 92, round = true, ring }) =>
  src ? <img src={src} alt="" style={{ width: size, height: size, objectFit: 'cover', borderRadius: round ? '50%' : 8, border: ring ? `3px solid ${ring}` : 'none', flexShrink: 0 }} /> : null;

const Name = ({ d, ctx, color }) => (
  <div>
    <div style={{ fontFamily: ctx.headingFont, fontSize: ctx.fs * 2.2, fontWeight: 800, lineHeight: 1.1, color: color || ctx.text }}>{d.contact.name || 'Your Name'}</div>
    {d.contact.title && <div style={{ fontSize: ctx.fs * 1.15, marginTop: 2, color: color ? 'rgba(255,255,255,.9)' : ctx.accentText, fontWeight: 600 }}>{d.contact.title}</div>}
  </div>
);

const renderList = (keys, d, ctx) => keys.filter((k) => hasContent(k, d)).map((k) => <Section key={k} k={k} d={d} ctx={ctx} />);

export function SingleColumn({ d, ctx, photo, order }) {
  return (
    <div style={{ padding: `${ctx.sp(38)}px 44px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: ctx.sp(6) }}>
        <div style={{ minWidth: 0 }}><Name d={d} ctx={ctx} /><div style={{ marginTop: ctx.sp(8), color: ctx.muted }}><ContactList c={d.contact} ctx={ctx} inline /></div></div>
        {ctx.tpl.tags.photo && <Photo src={photo} ring={ctx.accent} />}
      </div>
      {renderList(order, d, ctx)}
    </div>
  );
}

export function HeaderBanner({ d, ctx, photo, order }) {
  return (
    <div>
      <div style={{ background: ctx.accent, color: '#fff', padding: `${ctx.sp(30)}px 44px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}><Name d={d} ctx={ctx} color="#fff" /><div style={{ marginTop: ctx.sp(8), opacity: 0.95 }}><ContactList c={d.contact} ctx={{ ...ctx, onDark: true }} inline /></div></div>
        {ctx.tpl.tags.photo && <Photo src={photo} ring="#fff" size={96} />}
      </div>
      <div style={{ padding: `${ctx.sp(14)}px 44px ${ctx.sp(30)}px` }}>{renderList(order, d, ctx)}</div>
    </div>
  );
}

function TwoCol({ d, ctx, photo, order, side, sideBg, sideColor, onDark, sideWidth = 238 }) {
  const sideKeys = order.filter((k) => SIDE.includes(k));
  const mainKeys = order.filter((k) => !SIDE.includes(k));
  const sideCtx = { ...ctx, onDark: !!onDark, sp: ctx.sp };
  const sidebar = (
    <aside style={{ width: sideWidth, flexShrink: 0, background: sideBg, color: sideColor, padding: `${ctx.sp(34)}px 22px` }}>
      {ctx.tpl.tags.photo && photo && <div style={{ marginBottom: ctx.sp(14), textAlign: 'center' }}><Photo src={photo} size={120} ring={onDark ? '#fff' : ctx.accent} /></div>}
      {!ctx.tpl.tags.photo || !photo ? null : null}
      <div style={{ marginBottom: ctx.sp(8) }}><ContactList c={d.contact} ctx={sideCtx} /></div>
      {renderList(sideKeys, d, sideCtx)}
    </aside>
  );
  const main = (
    <div style={{ flex: 1, minWidth: 0, padding: `${ctx.sp(34)}px 30px` }}>
      <Name d={d} ctx={ctx} />
      {renderList(mainKeys, d, ctx)}
    </div>
  );
  return <div style={{ display: 'flex', minHeight: 1123, alignItems: 'stretch' }}>{side === 'left' ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}</div>;
}

export const TwoColumnLeft = (p) => <TwoCol {...p} side="left" sideBg={p.ctx.sideBg} sideColor={p.ctx.text} />;
export const TwoColumnRight = (p) => <TwoCol {...p} side="right" sideBg={p.ctx.sideBg} sideColor={p.ctx.text} />;
export const Sidebar = (p) => <TwoCol {...p} side="left" sideBg={p.ctx.accent} sideColor="#fff" onDark sideWidth={250} />;

export const LAYOUT_COMPONENTS = { SingleColumn, TwoColumnLeft, TwoColumnRight, HeaderBanner, Sidebar };
