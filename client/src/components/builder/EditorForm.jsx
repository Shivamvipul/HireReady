import { createContext, useContext, useState } from 'react';
import { ChevronDown, Eye, EyeOff, Plus, Trash2, Wand2, Sparkles, Camera, Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SortableList from './SortableList';
import { Button, Input, Textarea } from '../ui';
import { SECTION_LABELS, newEntry } from '../../templates/data';
import { cn, errMsg } from '../../utils/cn';

export const AiContext = createContext(async () => { throw new Error('AI unavailable'); });

// Textarea with an "AI improve" button. Suggestions are shown first and only applied on request.
function AiField({ label, value, onChange, section, rows = 4, placeholder, mode = 'improve', buttonLabel = 'AI improve' }) {
  const ai = useContext(AiContext);
  const [busy, setBusy] = useState(false);
  const [sug, setSug] = useState(null);
  const run = async () => {
    setBusy(true); setSug(null);
    try { setSug(await ai({ section, text: value, mode })); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div>
      <Textarea label={label} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-1.5 flex justify-end">
        <Button variant="ghost" size="sm" icon={mode === 'summary' ? Sparkles : Wand2} loading={busy} onClick={run}>{buttonLabel}</Button>
      </div>
      {sug && (
        <div className="mt-2 rounded-xl border border-accent/30 bg-accent-soft p-3 text-sm">
          <p className="mb-1 text-xs font-semibold text-accent">AI suggestion (based only on your content)</p>
          <p className="whitespace-pre-line">{sug.improved}</p>
          {sug.missing_info?.length > 0 && <div className="mt-2 text-xs text-warn"><b>Add real details to strengthen this:</b><ul className="list-disc pl-5">{sug.missing_info.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => { onChange(sug.improved); setSug(null); toast.success('Applied'); }}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setSug(null)}>Dismiss</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Field definitions drive every list section.
const DEFS = {
  education: { title: (e) => [e.degree, e.school].filter(Boolean).join(' - ') || 'New education', fields: [['school', 'School'], ['degree', 'Degree'], ['field', 'Field of study'], ['start', 'Start'], ['end', 'End'], ['details', 'Details', 'area']], cols: 2 },
  experience: { title: (e) => [e.role, e.company].filter(Boolean).join(' at ') || 'New experience', fields: [['role', 'Job title'], ['company', 'Company'], ['location', 'Location'], ['start', 'Start'], ['end', 'End'], ['bullets', 'Achievements (one per line)', 'ai']], cols: 2 },
  projects: { title: (e) => e.title || 'New project', fields: [['title', 'Project title'], ['tech', 'Tech used'], ['link', 'GitHub / live link', 'link'], ['description', 'Description (one point per line)', 'ai']], cols: 1 },
  skills: { title: (e) => e.group || e.items || 'New skill group', fields: [['group', 'Group (e.g. Languages)'], ['items', 'Skills, comma separated']], cols: 2 },
  certifications: { title: (e) => e.name || 'New certification', fields: [['name', 'Name'], ['issuer', 'Issuer'], ['year', 'Year']], cols: 2 },
  achievements: { title: (e) => e.text || 'New achievement', fields: [['text', 'Achievement', 'ai']], cols: 1 },
  languages: { title: (e) => e.name || 'New language', fields: [['name', 'Language'], ['level', 'Level']], cols: 2 },
  links: { title: (e) => e.label || e.url || 'New link', fields: [['label', 'Label'], ['url', 'URL']], cols: 2 },
  custom: { title: (e) => e.title || 'New section', fields: [['title', 'Section title'], ['content', 'Content (one point per line)', 'ai']], cols: 1 },
};

function Entry({ section, item, onChange, onDelete, handle }) {
  const def = DEFS[section];
  const [open, setOpen] = useState(!def.title(item) || def.title(item).startsWith('New'));
  const set = (k) => (v) => onChange({ ...item, [k]: v });
  return (
    <div className="mb-2 rounded-xl border border-line bg-ink/40">
      <div className="flex items-center gap-1 px-2 py-1.5">
        {handle}
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium hover:bg-raised">
          <span className="truncate">{def.title(item)}</span><ChevronDown className={cn('h-4 w-4 shrink-0 text-dim transition', open && 'rotate-180')} aria-hidden />
        </button>
        <button type="button" aria-label="Delete entry" onClick={onDelete} className="rounded-lg p-1.5 text-dim hover:bg-bad/10 hover:text-bad"><Trash2 className="h-4 w-4" /></button>
      </div>
      {open && (
        <div className={cn('grid gap-3 border-t border-line p-3', def.cols === 2 && 'sm:grid-cols-2')}>
          {def.fields.map(([k, label, kind]) => kind === 'ai' ? (
            <div key={k} className="sm:col-span-2"><AiField label={label} section={section} rows={4} value={item[k] || ''} onChange={set(k)} /></div>
          ) : kind === 'area' ? (
            <div key={k} className="sm:col-span-2"><Textarea label={label} rows={2} value={item[k] || ''} onChange={(e) => set(k)(e.target.value)} /></div>
          ) : (
            <div key={k} className={k === 'link' || k === 'title' && def.cols === 1 ? 'sm:col-span-2' : ''}>
              <Input label={kind === 'link' ? <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" aria-hidden />{label}</span> : label} value={item[k] || ''} onChange={(e) => set(k)(e.target.value)} placeholder={kind === 'link' ? 'github.com/you/project' : undefined} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListSection({ section, items, onChange }) {
  return (
    <div>
      <SortableList items={items} onChange={onChange}>
        {(item, i, handle) => (
          <Entry section={section} item={item} handle={handle}
            onChange={(n) => onChange(items.map((x, j) => (j === i ? n : x)))}
            onDelete={() => onChange(items.filter((_, j) => j !== i))} />
        )}
      </SortableList>
      <Button variant="ghost" size="sm" icon={Plus} onClick={() => onChange([...items, newEntry(section)])}>Add {section === 'custom' ? 'section' : 'entry'}</Button>
    </div>
  );
}

function Panel({ title, children, right, defaultOpen = false, handle }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card !p-0">
      <div className="flex items-center gap-1 px-3 py-2.5">
        {handle}
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex flex-1 items-center justify-between rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-raised">
          {title}<ChevronDown className={cn('h-4 w-4 text-dim transition', open && 'rotate-180')} aria-hidden />
        </button>
        {right}
      </div>
      {open && <div className="border-t border-line p-4">{children}</div>}
    </div>
  );
}

export default function EditorForm({ data, settings, order, onData, onSettings, photo, onPhotoClick, onRemovePhoto, hasPhotoTemplate }) {
  const c = data.contact;
  const setC = (k) => (e) => onData({ ...data, contact: { ...c, [k]: e.target.value } });
  const hidden = settings.hidden || [];
  const toggleHidden = (k) => onSettings({ ...settings, hidden: hidden.includes(k) ? hidden.filter((x) => x !== k) : [...hidden, k] });

  return (
    <div className="space-y-3">
      <Panel title="Contact" defaultOpen>
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-line bg-raised">{photo ? <img src={photo} alt="Your profile" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5 text-dim" aria-hidden />}</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={onPhotoClick}>{photo ? 'Change photo' : 'Add photo'}</Button>
            {photo && <Button variant="ghost" size="sm" icon={X} onClick={onRemovePhoto}>Remove</Button>}
          </div>
          {!hasPhotoTemplate && <p className="text-xs text-dim">This template does not show a photo.</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" value={c.name} onChange={setC('name')} />
          <Input label="Headline / job title" value={c.title} onChange={setC('title')} />
          <Input label="Email" type="email" value={c.email} onChange={setC('email')} />
          <Input label="Phone" value={c.phone} onChange={setC('phone')} />
          <Input label="Location" value={c.location} onChange={setC('location')} />
          <Input label="Website" value={c.website} onChange={setC('website')} />
          <Input label="LinkedIn" value={c.linkedin} onChange={setC('linkedin')} />
          <Input label="GitHub" value={c.github} onChange={setC('github')} />
        </div>
      </Panel>

      <SortableList items={order} getId={(k) => k} onChange={(o) => onSettings({ ...settings, sectionOrder: o })}>
        {(k, i, handle) => (
          <div className={cn('mb-3', hidden.includes(k) && 'opacity-60')}>
            <Panel handle={handle} title={SECTION_LABELS[k]}
              right={<button type="button" aria-label={hidden.includes(k) ? `Show ${SECTION_LABELS[k]}` : `Hide ${SECTION_LABELS[k]}`} aria-pressed={!hidden.includes(k)} onClick={() => toggleHidden(k)} className="rounded-lg p-1.5 text-dim hover:bg-raised hover:text-fg">{hidden.includes(k) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}>
              {k === 'summary'
                ? <>
                    <AiField label="Professional summary" section="summary" rows={5} value={data.summary} onChange={(v) => onData({ ...data, summary: v })} placeholder="2 to 4 sentences about your background and strengths" />
                    <div className="mt-1"><SummaryGen data={data} onData={onData} /></div>
                  </>
                : <ListSection section={k} items={data[k] || []} onChange={(v) => onData({ ...data, [k]: v })} />}
            </Panel>
          </div>
        )}
      </SortableList>
    </div>
  );
}

function SummaryGen({ data, onData }) {
  const ai = useContext(AiContext);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { const r = await ai({ section: 'summary', text: '', mode: 'summary' }); onData({ ...data, summary: r.improved }); toast.success('Summary generated from your details'); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return <Button variant="ghost" size="sm" icon={Sparkles} loading={busy} onClick={go}>Generate summary from my details</Button>;
}
