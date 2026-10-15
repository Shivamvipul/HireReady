import { useMemo, useState } from 'react';
import { ShieldCheck, Image as ImageIcon, Columns2, Link2 } from 'lucide-react';
import { templates, STYLE_NAMES } from '../../templates/catalog';
import { sampleData } from '../../templates/data';
import ScaledPreview from '../../templates/ScaledPreview';
import { Chip } from '../ui';
import { cn } from '../../utils/cn';

const sample = sampleData();
const SAMPLE_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#cbd5e1"/><circle cx="60" cy="46" r="22" fill="#94a3b8"/><rect x="22" y="76" width="76" height="50" rx="30" fill="#94a3b8"/></svg>')}`;

const Seg = ({ label, value, onChange, options }) => (
  <label className="block text-xs font-semibold text-dim">{label}
    <select className="input mt-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
  </label>
);

export default function TemplateGallery({ selected, onSelect, data, photo, settings }) {
  const [f, setF] = useState({ style: 'all', photo: 'any', columns: 'any', links: 'any', ats: false });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const list = useMemo(() => templates.filter((t) =>
    (f.style === 'all' || t.tags.style === f.style) &&
    (f.photo === 'any' || (f.photo === 'with') === t.tags.photo) &&
    (f.columns === 'any' || String(t.tags.columns) === f.columns) &&
    (f.links === 'any' || (f.links === 'with') === t.tags.projectLinks) &&
    (!f.ats || t.atsSafe)), [f]);

  const preview = data && Object.keys(data).length ? data : sample;
  const usingSample = preview === sample;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Seg label="Style" value={f.style} onChange={set('style')} options={[['all', 'All styles'], ...STYLE_NAMES.map((s) => [s, s])]} />
        <Seg label="Photo" value={f.photo} onChange={set('photo')} options={[['any', 'Any'], ['with', 'With photo'], ['without', 'No photo']]} />
        <Seg label="Columns" value={f.columns} onChange={set('columns')} options={[['any', 'Any'], ['1', '1 column'], ['2', '2 columns']]} />
        <Seg label="Project links" value={f.links} onChange={set('links')} options={[['any', 'Any'], ['with', 'Shows links'], ['without', 'No links']]} />
        <label className="flex items-end gap-2 pb-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-accent" checked={f.ats} onChange={(e) => set('ats')(e.target.checked)} />ATS-safe only</label>
      </div>
      <p className="mb-3 text-xs text-dim">{list.length} of {templates.length} templates{usingSample ? ' shown with sample content' : ' shown with your content'}.</p>
      {list.length === 0 && <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-dim">No templates match these filters. Loosen one of them.</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((t) => (
          <button key={t.id} onClick={() => onSelect(t.id)} aria-pressed={selected === t.id} aria-label={`Use template ${t.name}`}
            className={cn('card card-hover group !p-2.5 text-left', selected === t.id && 'shadow-glow')}>
            <div className="overflow-hidden rounded-lg border border-line bg-white" aria-hidden>
              <ScaledPreview fixedScale={0.2} tpl={t} data={preview} photo={t.tags.photo ? (photo || SAMPLE_PHOTO) : undefined} settings={{ footerTag: false, ...(settings && !usingSample ? { accent: null } : {}) }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-1">
              <span className="truncate text-sm font-semibold">{t.name}</span>
              {t.atsSafe && <Chip tone="good" className="!px-1.5 !py-0.5 !text-[10px]"><ShieldCheck className="mr-0.5 h-3 w-3" aria-hidden />ATS-safe</Chip>}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-dim">
              <span className="flex items-center gap-1"><Columns2 className="h-3 w-3" aria-hidden />{t.tags.columns}</span>
              {t.tags.photo && <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" aria-hidden />photo</span>}
              {t.tags.projectLinks && <span className="flex items-center gap-1"><Link2 className="h-3 w-3" aria-hidden />links</span>}
              <span>{t.tags.style}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
