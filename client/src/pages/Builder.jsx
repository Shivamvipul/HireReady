import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, LayoutTemplate, Share2, Copy, Check, Cloud, Palette, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumes } from '../api';
import { Button, Card, ErrorState, Modal, Skeleton, Spinner, Input } from '../components/ui';
import EditorForm, { AiContext } from '../components/builder/EditorForm';
import PhotoCropper from '../components/builder/PhotoCropper';
import TemplateGallery from '../components/builder/TemplateGallery';
import ScaledPreview from '../templates/ScaledPreview';
import { templates } from '../templates/catalog';
import { FONT_OPTIONS, THEMES, defaultSettings, emptyData, ALL_SECTIONS, mergeContact } from '../templates/data';
import useDebounce from '../hooks/useDebounce';
import { copy, errMsg, saveBlob } from '../utils/cn';

const ACCENTS = ['#4f46e5', '#0ea5e9', '#059669', '#d97706', '#dc2626', '#db2777', '#7c3aed', '#111827'];

export default function Builder() {
  const { id } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [meta, setMeta] = useState({ isPublic: false, slug: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('saved'); // saved | saving | dirty | error
  const [gallery, setGallery] = useState(false);
  const [cropper, setCropper] = useState(false);
  const [share, setShare] = useState(false);
  const [exporting, setExporting] = useState('');
  const [mobileTab, setMobileTab] = useState('edit');
  const [suggestions, setSuggestions] = useState([]);
  const previewRef = useRef(null);
  const ready = useRef(false);
  const lastSaved = useRef('');

  const load = useCallback(async () => {
    setError('');
    try {
      const r = await resumes.get(id);
      const data = { ...emptyData(), ...r.data, contact: mergeContact(r.data?.contact || {}) };
      const settings = { ...defaultSettings(), ...(r.settings || {}) };
      setDoc({ title: r.title, templateId: r.templateId, data, settings, photoUrl: r.photoUrl || '' });
      setMeta({ isPublic: r.isPublic, slug: r.slug || '' });
      lastSaved.current = JSON.stringify({ title: r.title, templateId: r.templateId, data, settings, photoUrl: r.photoUrl || '' });
      try { const s = JSON.parse(sessionStorage.getItem(`sugg-${id}`) || '[]'); setSuggestions(s); } catch { /* ignore */ }
      ready.current = true;
    } catch (e) { setError(errMsg(e)); }
  }, [id]);
  useEffect(() => { ready.current = false; load(); }, [load]);

  const patch = (p) => { setDoc((d) => ({ ...d, ...p })); setStatus('dirty'); };

  const save = useCallback(async (d) => {
    const body = JSON.stringify(d);
    if (body === lastSaved.current) { setStatus('saved'); return; }
    setStatus('saving');
    try { await resumes.update(id, d); lastSaved.current = body; setStatus('saved'); }
    catch (e) { setStatus('error'); toast.error(`Auto-save failed: ${errMsg(e)}`); }
  }, [id]);

  const debounced = useDebounce(doc, 1200);
  useEffect(() => { if (ready.current && debounced) save(debounced); }, [debounced, save]);

  const flush = useCallback(() => (doc ? save(doc) : Promise.resolve()), [doc, save]);

  const tpl = useMemo(() => templates.find((t) => t.id === doc?.templateId) || templates[0], [doc?.templateId]);
  const order = useMemo(() => {
    if (!doc) return [];
    const base = doc.settings.sectionOrder?.length ? doc.settings.sectionOrder : tpl.sectionOrder;
    return [...base, ...ALL_SECTIONS.filter((k) => !base.includes(k))];
  }, [doc, tpl]);

  const ai = useCallback(async ({ section, text, mode }) => {
    await flush(); // server reads the saved copy as context
    return resumes.aiImprove(id, { section, text, mode });
  }, [id, flush]);

  const download = async (format) => {
    setExporting(format);
    try {
      await flush();
      let blob;
      if (format === 'pdf') {
        const html = previewRef.current?.outerHTML;
        if (!html) throw new Error('Preview is not ready.');
        blob = await resumes.download(id, 'pdf', { html });
      } else {
        blob = await resumes.download(id, 'docx', { data: doc.data, settings: doc.settings });
      }
      saveBlob(blob, `${(doc.title || 'resume').replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-')}.${format}`);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) {
      let msg = errMsg(e);
      if (e?.response?.data instanceof Blob) { try { msg = JSON.parse(await e.response.data.text()).message; } catch { /* keep */ } }
      toast.error(msg);
    } finally { setExporting(''); }
  };

  const setPublic = async (isPublic) => {
    try { const r = await resumes.update(id, { isPublic }); setMeta({ isPublic: r.isPublic, slug: r.slug || '' }); toast.success(isPublic ? 'Share link is on' : 'Share link is off'); }
    catch (e) { toast.error(errMsg(e)); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!doc) return <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-[70vh]" /><Skeleton className="h-[70vh]" /></div>;

  const shareUrl = meta.slug ? `${window.location.origin}/r/${meta.slug}` : '';
  const setSettings = (s) => patch({ settings: s });
  const statusUi = { saved: [Check, 'Saved', 'text-good'], saving: [Spinner, 'Saving', 'text-dim'], dirty: [Cloud, 'Unsaved changes', 'text-warn'], error: [Cloud, 'Not saved', 'text-bad'] }[status];
  const StatusIcon = statusUi[0];

  return (
    <AiContext.Provider value={ai}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/resumes" aria-label="Back to resumes" className="rounded-lg p-2 text-dim hover:bg-raised hover:text-fg"><ArrowLeft className="h-5 w-5" /></Link>
        <input aria-label="Resume title" value={doc.title} maxLength={100} onChange={(e) => patch({ title: e.target.value })} className="input !w-auto min-w-[10rem] flex-1 !bg-transparent font-display text-lg font-bold sm:max-w-xs" />
        <span className={`flex items-center gap-1.5 text-xs ${statusUi[2]}`} role="status"><StatusIcon className="h-3.5 w-3.5" />{statusUi[1]}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" icon={LayoutTemplate} onClick={() => setGallery(true)}>Template</Button>
          <Button variant="ghost" size="sm" icon={Share2} onClick={() => setShare(true)}>Share</Button>
          <Button variant="ghost" size="sm" icon={FileText} loading={exporting === 'docx'} onClick={() => download('docx')}>DOCX</Button>
          <Button size="sm" icon={Download} loading={exporting === 'pdf'} onClick={() => download('pdf')}>PDF</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-line bg-surface p-1 lg:hidden" role="tablist">
        {['edit', 'preview'].map((t) => <button key={t} role="tab" aria-selected={mobileTab === t} onClick={() => setMobileTab(t)} className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize ${mobileTab === t ? 'bg-accent-strong text-white' : 'text-dim'}`}>{t}</button>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={mobileTab === 'edit' ? '' : 'hidden lg:block'}>
          {suggestions.length > 0 && (
            <Card className="mb-3 !p-4">
              <div className="mb-2 flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-warn" aria-hidden />Suggestions from your ATS check</p>
                <button className="text-xs text-dim hover:text-fg" onClick={() => { setSuggestions([]); sessionStorage.removeItem(`sugg-${id}`); }}>Dismiss</button></div>
              <div className="max-h-56 space-y-3 overflow-auto text-sm">
                {suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg bg-raised p-2.5"><p className="text-xs text-dim line-through">{s.original}</p><p className="mt-1">{s.improved}</p>
                    <button className="mt-1 flex items-center gap-1 text-xs text-accent" onClick={() => copy(s.improved, toast)}><Copy className="h-3 w-3" />Copy</button></div>
                ))}
              </div>
            </Card>
          )}

          <Card className="mb-3 !p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4 text-accent" aria-hidden />Style</p>
            <p className="label">Color theme</p>
            <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Color theme">
              {THEMES.map((t) => (
                <button key={t.id} title={t.name} aria-label={`${t.name} theme`} aria-pressed={doc.settings.theme === t.id} onClick={() => setSettings({ ...doc.settings, theme: t.id, accent: null })} className="h-8 w-8 overflow-hidden rounded-full border-2" style={{ background: `linear-gradient(135deg, ${t.primary} 50%, ${t.secondary} 50%)`, borderColor: doc.settings.theme === t.id ? '#17342e' : 'transparent' }} />
              ))}
              {(doc.settings.theme || doc.settings.accent) && <button className="text-xs text-dim underline" onClick={() => setSettings({ ...doc.settings, theme: null, accent: null })}>Use template color</button>}
            </div>
            <p className="label">Single accent color</p>
            <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Accent color">
              {ACCENTS.map((c) => <button key={c} aria-label={`Accent ${c}`} aria-pressed={doc.settings.accent === c} onClick={() => setSettings({ ...doc.settings, accent: c })} className="h-7 w-7 rounded-full border-2" style={{ background: c, borderColor: doc.settings.accent === c ? '#17342e' : 'transparent' }} />)}
              <input type="color" aria-label="Custom accent color" value={doc.settings.accent || THEMES.find((t) => t.id === doc.settings.theme)?.primary || tpl.colors.accent} onChange={(e) => setSettings({ ...doc.settings, accent: e.target.value })} className="h-7 w-9 cursor-pointer rounded bg-transparent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="label">Font
                <select className="input mt-1" value={doc.settings.font} onChange={(e) => setSettings({ ...doc.settings, font: e.target.value })}>{FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></label>
              <label className="label">Text size ({doc.settings.fontSize}px)
                <input type="range" min="11" max="15" step="0.5" value={doc.settings.fontSize} onChange={(e) => setSettings({ ...doc.settings, fontSize: +e.target.value })} className="mt-3 w-full accent-accent" /></label>
              <label className="label">Spacing
                <select className="input mt-1" value={doc.settings.spacing} onChange={(e) => setSettings({ ...doc.settings, spacing: e.target.value })}><option value="template">Template default</option><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="airy">Airy</option></select></label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-accent" checked={doc.settings.footerTag !== false} onChange={(e) => setSettings({ ...doc.settings, footerTag: e.target.checked })} />Show "Made with HireReady AI" footer</label>
          </Card>

          <EditorForm data={doc.data} settings={doc.settings} order={order} onData={(d) => patch({ data: d })} onSettings={setSettings}
            photo={doc.photoUrl} hasPhotoTemplate={tpl.tags.photo} onPhotoClick={() => setCropper(true)} onRemovePhoto={() => patch({ photoUrl: '' })} />
        </div>

        <div className={`${mobileTab === 'preview' ? '' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            <div className="mb-2 flex items-center justify-between text-xs text-dim"><span>{tpl.name}{tpl.atsSafe ? ' · ATS-safe' : ''}</span><span>A4 preview</span></div>
            <div className="max-h-[calc(100vh-7rem)] overflow-auto rounded-xl border border-line bg-white shadow-xl">
              <ScaledPreview rootRef={previewRef} tpl={tpl} data={doc.data} settings={doc.settings} photo={tpl.tags.photo ? doc.photoUrl : undefined} />
            </div>
          </div>
        </div>
      </div>

      <Modal open={gallery} onClose={() => setGallery(false)} title="Switch template" wide>
        <p className="mb-4 text-sm text-dim">Your content stays exactly as it is. Only the design changes.</p>
        <TemplateGallery selected={doc.templateId} data={doc.data} photo={doc.photoUrl} settings={doc.settings}
          onSelect={(tid) => { patch({ templateId: tid }); setGallery(false); toast.success('Template changed'); }} />
      </Modal>
      <PhotoCropper open={cropper} onClose={() => setCropper(false)} onDone={(url) => patch({ photoUrl: url })} />
      <Modal open={share} onClose={() => setShare(false)} title="Share your resume">
        <p className="mb-3 text-sm text-dim">Anyone with the link can view this resume. Turn it off at any time.</p>
        <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-accent" checked={meta.isPublic} onChange={(e) => setPublic(e.target.checked)} />Public link enabled</label>
        {meta.isPublic && shareUrl && (
          <div className="flex gap-2"><Input aria-label="Share link" readOnly value={shareUrl} onFocus={(e) => e.target.select()} /><Button variant="ghost" icon={Copy} onClick={() => copy(shareUrl, toast)}>Copy</Button></div>
        )}
        <p className="mt-3 text-xs text-dim">Changes you make are visible on the shared page after auto-save.</p>
      </Modal>
    </AiContext.Provider>
  );
}
