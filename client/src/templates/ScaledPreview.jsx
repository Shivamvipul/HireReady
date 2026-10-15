import { useEffect, useRef, useState } from 'react';
import ResumeRenderer from './ResumeRenderer';

// Fits an A4-width resume into any container width.
export default function ScaledPreview({ data, settings, tpl, photo, rootRef, fixedScale }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(fixedScale || 0.5);
  const [h, setH] = useState(1123);

  useEffect(() => {
    if (fixedScale) { setScale(fixedScale); return undefined; }
    const el = wrap.current;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 794)));
    ro.observe(el); setScale(Math.min(1, el.clientWidth / 794));
    return () => ro.disconnect();
  }, [fixedScale]);

  useEffect(() => {
    const el = inner.current;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el); setH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} style={{ width: fixedScale ? 794 * fixedScale : '100%', height: h * scale, overflow: 'hidden' }}>
      <div ref={inner} style={{ width: 794, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <ResumeRenderer ref={rootRef} data={data} settings={settings} tpl={tpl} photo={photo} />
      </div>
    </div>
  );
}
