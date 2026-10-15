import { useEffect, useState, useCallback, useMemo } from 'react';
import { Sparkles, Search, Download, History, Trash2, MessagesSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { interview, resumes, upload } from '../api';
import { Button, Card, PageHeader, Input, Select, Textarea, FileDrop, Tabs, SkeletonCard, EmptyState, ErrorState, Skeleton } from '../components/ui';
import QuestionCard from '../components/interview/QuestionCard';
import { exportSetAsPdf } from '../components/interview/exportSet';
import { errMsg, timeAgo } from '../utils/cn';

const MODULES = [
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'HR & behavioral' },
  { id: 'project', label: 'Projects & experience' },
  { id: 'company', label: 'Company & role' },
];
const LEVELS = ['Fresher', 'Junior', 'Mid', 'Senior'];

export default function Interview() {
  const [form, setForm] = useState({ role: '', company: '', level: 'Junior' });
  const [source, setSource] = useState('saved');
  const [saved, setSaved] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [pasted, setPasted] = useState('');
  const [active, setActive] = useState('technical');
  const [sets, setSets] = useState({});
  const [busy, setBusy] = useState(false);
  const [regen, setRegen] = useState(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState(null);
  const [histErr, setHistErr] = useState('');

  const loadHistory = useCallback(async () => {
    setHistErr('');
    try { setHistory(await interview.history()); } catch (e) { setHistErr(errMsg(e)); }
  }, []);
  useEffect(() => { loadHistory(); resumes.list().then(setSaved).catch(() => {}); }, [loadHistory]);

  const set = sets[active];
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (form.role.trim().length < 2) return toast.error('Enter the role you are preparing for.');
    setBusy(true);
    try {
      let resumeText = pasted;
      let id;
      if (source === 'saved') id = resumeId || undefined;
      if (source === 'upload') {
        if (!file) { setBusy(false); return toast.error('Upload your resume or choose another source.'); }
        resumeText = (await upload.resumeText(file)).text;
      }
      const s = await interview.generate({ ...form, module: active, resumeId: id, resumeText: source === 'saved' ? undefined : resumeText });
      setSets((p) => ({ ...p, [active]: s }));
      toast.success(`${s.questions.length} questions ready`);
      loadHistory();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const toggle = async (qid, field) => {
    try {
      const r = await interview.toggle(set._id, { questionId: qid, field });
      setSets((p) => ({ ...p, [active]: { ...p[active], bookmarks: r.bookmarks, practiced: r.practiced } }));
    } catch (e) { toast.error(errMsg(e)); }
  };

  const regenerate = async (qid) => {
    setRegen(qid);
    try { const s = await interview.regenerate({ setId: set._id, questionId: qid }); setSets((p) => ({ ...p, [active]: s })); toast.success('Question replaced'); }
    catch (e) { toast.error(errMsg(e)); } finally { setRegen(null); }
  };

  const openSet = async (id) => {
    try {
      const s = await interview.get(id);
      setSets((p) => ({ ...p, [s.module]: s })); setActive(s.module);
      setForm({ role: s.role, company: s.company, level: s.level });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { toast.error(errMsg(e)); }
  };
  const removeSet = async (id) => {
    try { await interview.remove(id); setSets((p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v._id !== id))); loadHistory(); toast.success('Question set deleted'); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const visible = useMemo(() => {
    if (!set) return [];
    const needle = q.trim().toLowerCase();
    return set.questions.filter((x) => {
      if (needle && !(`${x.question} ${x.answer_outline}`.toLowerCase().includes(needle))) return false;
      if (filter === 'bookmarked') return set.bookmarks.includes(x.id);
      if (filter === 'todo') return !set.practiced.includes(x.id);
      if (['easy', 'medium', 'hard'].includes(filter)) return x.difficulty === filter;
      return true;
    });
  }, [set, q, filter]);

  const pct = set ? Math.round((set.practiced.length / set.questions.length) * 100) : 0;

  return (
    <>
      <PageHeader title="Interview prep" text="Questions built from your resume for the role and company you are targeting. Answers use only your real experience." />

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Role" value={form.role} onChange={upd('role')} placeholder="e.g. Backend Engineer" maxLength={120} />
          <Input label="Company (optional)" value={form.company} onChange={upd('company')} placeholder="e.g. Acme Corp" maxLength={120} />
          <Select label="Level" value={form.level} onChange={upd('level')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
        </div>
        <div className="mt-5">
          <p className="label">Resume source</p>
          <Tabs className="mb-3 w-fit" value={source} onChange={setSource} tabs={[{ id: 'saved', label: 'Saved resume' }, { id: 'upload', label: 'Upload' }, { id: 'paste', label: 'Paste' }]} />
          {source === 'saved' && (
            <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)} aria-label="Saved resume">
              <option value="">No resume (general questions)</option>
              {saved.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
            </Select>
          )}
          {source === 'upload' && <FileDrop file={file} onFile={setFile} />}
          {source === 'paste' && <Textarea rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste your resume text" aria-label="Resume text" />}
        </div>
      </Card>

      <Tabs value={active} onChange={(t) => { setActive(t); setQ(''); setFilter('all'); }} tabs={MODULES} className="mb-5" />

      {busy ? <div className="space-y-3"><SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
        : !set ? (
          <EmptyState icon={MessagesSquare} title={`No ${MODULES.find((m) => m.id === active).label.toLowerCase()} questions yet`} text="Fill in the role above, then generate 10 to 15 questions for this tab."
            action={<Button icon={Sparkles} onClick={generate}>Generate questions</Button>} />
        ) : (
          <>
            <Card className="mb-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{set.role}{set.company ? ` at ${set.company}` : ''} · {set.level}</p>
                  <p className="text-xs text-dim">{set.practiced.length} of {set.questions.length} practiced</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" icon={Download} onClick={() => exportSetAsPdf(set, MODULES.find((m) => m.id === active).label + ' questions') || toast.error('Allow pop-ups to export')}>Export PDF</Button>
                  <Button size="sm" icon={Sparkles} onClick={generate}>New set</Button>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Practice progress">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-strong to-good transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]">
                <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-dim" aria-hidden /><input className="input pl-9" placeholder="Search questions" aria-label="Search questions" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                <select className="input" aria-label="Filter questions" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All questions</option><option value="bookmarked">Bookmarked</option><option value="todo">Not practiced</option>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
            </Card>
            <div className="space-y-3">
              {visible.length === 0 && <EmptyState title="No questions match" text="Clear the search or filter to see all questions." />}
              {visible.map((x) => (
                <QuestionCard key={`${set._id}-${x.id}-${x.question.length}`} q={x} set={set} bookmarked={set.bookmarks.includes(x.id)} practiced={set.practiced.includes(x.id)}
                  onToggle={toggle} onRegenerate={regenerate} regenerating={regen === x.id} />
              ))}
            </div>
          </>
        )}

      <section className="mt-10" aria-labelledby="ih">
        <h2 id="ih" className="mb-3 flex items-center gap-2 text-lg font-bold"><History className="h-5 w-5 text-accent" aria-hidden />Saved question sets</h2>
        {histErr ? <ErrorState message={histErr} onRetry={loadHistory} /> : !history ? <Skeleton className="h-20 w-full" />
          : history.length === 0 ? <EmptyState title="Nothing saved yet" text="Every generated set is saved here with your bookmarks and progress." />
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((h) => (
                <Card key={h._id} hover className="flex items-center justify-between gap-2 !p-4">
                  <button className="min-w-0 flex-1 text-left" onClick={() => openSet(h._id)}>
                    <p className="truncate text-sm font-semibold">{h.role}{h.company ? ` @ ${h.company}` : ''}</p>
                    <p className="text-xs capitalize text-dim">{h.module} · {h.practiced}/{h.total} practiced · {timeAgo(h.createdAt)}</p>
                  </button>
                  <button aria-label="Delete set" className="rounded-lg p-1.5 text-dim hover:bg-bad/10 hover:text-bad" onClick={() => removeSet(h._id)}><Trash2 className="h-4 w-4" /></button>
                </Card>
              ))}
            </div>
          )}
      </section>
    </>
  );
}
