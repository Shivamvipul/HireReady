import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Trash2, Pencil, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumes } from '../api';
import { Button, Card, EmptyState, ErrorState, Input, Modal, PageHeader, Skeleton, Spinner } from '../components/ui';
import TemplateGallery from '../components/builder/TemplateGallery';
import { emptyData, defaultSettings } from '../templates/data';
import { templates } from '../templates/catalog';
import { useAuth } from '../store/authStore';
import { usePrefill } from '../store/builderStore';
import { errMsg, timeAgo, uid } from '../utils/cn';

export function NewResume() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { prefill, clear } = usePrefill();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const data = emptyData(user);
        let title = 'My resume';
        if (prefill) {
          data.contact = { ...data.contact, ...Object.fromEntries(Object.entries(prefill.contact || {}).filter(([, v]) => v)) };
          data.custom = [{ id: uid(), title: 'Imported content (move into the right sections)', content: prefill.importedText.slice(0, 6000) }];
          title = prefill.title || title;
        }
        const tid = params.get('template') || 'ats-safe-1';
        const r = await resumes.create({ title, templateId: templates.some((t) => t.id === tid) ? tid : 'ats-safe-1', data, settings: defaultSettings() });
        if (prefill?.suggestions?.length) sessionStorage.setItem(`sugg-${r._id}`, JSON.stringify(prefill.suggestions));
        clear();
        nav(`/resumes/${r._id}`, { replace: true });
      } catch (e) { toast.error(errMsg(e)); nav('/resumes', { replace: true }); }
    })();
  }, []); // eslint-disable-line

  return <div className="grid min-h-[40vh] place-items-center"><div className="text-center text-sm text-dim"><Spinner className="mx-auto mb-2 h-6 w-6 text-accent" />Creating your resume</div></div>;
}

export default function Resumes() {
  const nav = useNavigate();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [rename, setRename] = useState(null);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setList(await resumes.list()); } catch (e) { setError(errMsg(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const dup = async (id) => { try { const r = await resumes.duplicate(id); toast.success('Resume duplicated'); nav(`/resumes/${r._id}`); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (r) => {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    try { await resumes.remove(r._id); toast.success('Resume deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const doRename = async () => {
    try { await resumes.update(rename._id, { title: name.trim() || rename.title }); toast.success('Renamed'); setRename(null); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <PageHeader title="Resume builder" text="Keep multiple versions, switch templates without losing content, and export to PDF or DOCX."
        action={<Button icon={Plus} onClick={() => nav('/resumes/new')}>New resume</Button>} />

      <h2 className="mb-3 text-lg font-bold">Your resumes</h2>
      {error ? <ErrorState message={error} onRetry={load} />
        : !list ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        : list.length === 0 ? <EmptyState icon={FileText} title="No resumes yet" text="Pick a template below to start, or create a blank resume." action={<Button icon={Plus} onClick={() => nav('/resumes/new')}>Create blank resume</Button>} />
        : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <Card key={r._id} hover className="!p-4">
                <Link to={`/resumes/${r._id}`} className="block rounded-lg">
                  <p className="truncate font-semibold">{r.title}</p>
                  <p className="text-xs text-dim">{templates.find((t) => t.id === r.templateId)?.name || r.templateId} · edited {timeAgo(r.updatedAt)}</p>
                </Link>
                <div className="mt-3 flex gap-1">
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => { setRename(r); setName(r.title); }}>Rename</Button>
                  <Button variant="ghost" size="sm" icon={Copy} onClick={() => dup(r._id)}>Duplicate</Button>
                  <Button variant="danger" size="sm" icon={Trash2} aria-label={`Delete ${r.title}`} onClick={() => del(r)} />
                </div>
              </Card>
            ))}
          </div>
        )}

      <h2 className="mb-1 mt-10 text-lg font-bold">Start from a template</h2>
      <p className="mb-4 text-sm text-dim">48 templates. Badges show which are safe for applicant tracking systems.</p>
      <TemplateGallery onSelect={(tid) => nav(`/resumes/new?template=${tid}`)} />

      <Modal open={!!rename} onClose={() => setRename(null)} title="Rename resume">
        <Input label="Title" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRename()} />
        <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setRename(null)}>Cancel</Button><Button onClick={doRename}>Save</Button></div>
      </Modal>
    </>
  );
}
