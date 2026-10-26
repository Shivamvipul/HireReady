import { forwardRef } from 'react';
import { LAYOUT_COMPONENTS } from './layouts';
import { FONT_OPTIONS, ALL_SECTIONS, THEMES } from './data';

const SPACING = { compact: 0.78, comfortable: 1, airy: 1.28 };

// Renders ANY resume JSON in ANY template config.
const ResumeRenderer = forwardRef(function ResumeRenderer({ data, settings = {}, tpl, photo }, ref) {
  const fs = settings.fontSize || 13;
  const spKey = settings.spacing && settings.spacing !== 'template' ? settings.spacing : tpl.spacing;
  const scale = SPACING[spKey] || 1;
  const sp = (n) => Math.round(n * scale);
  const theme = THEMES.find((t) => t.id === settings.theme);
  const accent = settings.accent || theme?.primary || tpl.colors.accent;
  const secondary = theme?.secondary || accent;
  const fontOpt = FONT_OPTIONS.find((f) => f.id === settings.font);
  const bodyFont = fontOpt?.stack || tpl.fonts.body;
  const headingFont = fontOpt?.stack || tpl.fonts.heading;

  const base = settings.sectionOrder?.length ? settings.sectionOrder : tpl.sectionOrder;
  const order = [...base, ...ALL_SECTIONS.filter((k) => !base.includes(k))].filter((k) => !(settings.hidden || []).includes(k));

  const ctx = {
    fs, sp, tpl, accent, secondary, accentText: secondary, text: tpl.colors.text, muted: tpl.colors.muted, sideBg: theme?.side || tpl.colors.side,
    headingFont, onDark: false,
  };
  const Layout = LAYOUT_COMPONENTS[tpl.layout] || LAYOUT_COMPONENTS.SingleColumn;

  return (
    <div
      ref={ref}
      className="rr-root"
      style={{ width: 794, minHeight: 1123, background: '#fff', color: ctx.text, fontFamily: bodyFont, fontSize: fs, lineHeight: 1.45, position: 'relative', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1 }}><Layout d={data} ctx={ctx} photo={photo} order={order} /></div>
      {settings.footerTag !== false && (
        <div className="rr-footer" style={{ textAlign: 'center', fontSize: 9, color: '#9ca3af', padding: '8px 0 12px' }}>Made with HireReady AI</div>
      )}
    </div>
  );
});

export default ResumeRenderer;
