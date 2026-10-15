import { useEffect, useState, useCallback } from 'react';
import { Linkedin as LiIcon, Trash2, History, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { linkedin, resumes } from '../api';
import { Button, Card, PageHeader, Input, SkeletonCard, Skeleton, EmptyState, ErrorState } from '../components/ui';
import LinkedinResult from '../components/linkedin/LinkedinResult';
import { errMsg, timeAgo, scoreTone } from '../utils/cn';

const URL_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%.]+\/?(\?.*)?$/i;

export default function Linkedin() {
  const [url, setUrl] = useState('');
  const [urlErr, setUrlErr] = useState('');
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState(null);
  const [histErr, setHistErr] = useState('');

  const loadHistory = useCallback(async () => {
    setHistErr('');
    try { setHistory(await linkedin.history()); } catch (e) { setHistErr(errMsg(e)); }
  }, []);
  useEffect(() => { loadHistory(); resumes.list().then(setSaved).catch(() => setSaved([])); }, [loadHistory]);

  const run = async () => {
    if (!saved?.length) { toast.error('Create a saved resume before optimizing your profile.'); return; }
    if (url && !URL_RE.test(url.trim())) { setUrlErr('Enter a URL like https://www.linkedin.com/in/your-name'); return; }
    setUrlErr('');
    setBusy(true); setReport(null);
    try {
      const r = await linkedin.optimize({ linkedinUrl: url.trim(), resumeId: saved[0]._id });
      setReport(r); toast.success('Profile analysis ready'); loadHistory();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const open = async (id) => { try { setReport(await linkedin.get(id)); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { toast.error(errMsg(e)); } };
  const remove = async (id) => { try { await linkedin.remove(id); if (report?._id === id) setReport(null); loadHistory(); toast.success('Report deleted'); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <>
      <PageHeader title="LinkedIn profile optimizer" text="Get a stronger headline, About section and a 30-day plan, built from the content you provide." />
      <div className="mb-5 flex gap-3 rounded-2xl border border-accent/25 bg-accent-soft p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p>LinkedIn does not allow scraping, so HireRead analyzes your most recently updated saved resume. Your profile URL is only used for custom-URL tips.</p>
      </div>

      <Card className="mb-8">
        <Input label="LinkedIn profile URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.linkedin.com/in/your-name" error={urlErr} />
        {!saved && <p className="mt-4 text-sm text-dim">Loading your saved resumes...</p>}
        {saved?.length === 0 && <p className="mt-4 text-sm text-dim">Create a saved resume in the Resume builder to optimize your profile.</p>}
        <div className="mt-5 flex justify-end"><Button icon={LiIcon} loading={busy} disabled={!saved?.length} onClick={run}>Optimize profile</Button></div>
      </Card>

      {busy && <div className="grid gap-4 lg:grid-cols-2"><SkeletonCard lines={5} /><SkeletonCard lines={5} /></div>}
      {report && <LinkedinResult report={report} />}

      <section className="mt-10" aria-labelledby="lh">
        <h2 id="lh" className="mb-3 flex items-center gap-2 text-lg font-bold"><History className="h-5 w-5 text-accent" aria-hidden />Past reviews</h2>
        {histErr ? <ErrorState message={histErr} onRetry={loadHistory} /> : !history ? <Skeleton className="h-20 w-full" />
          : history.length === 0 ? <EmptyState title="No reviews yet" text="Run your first optimization to see it here." />
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{history.map((h) => (
            <Card key={h._id} hover className="flex items-center justify-between gap-3 !p-4">
              <button className="min-w-0 flex-1 text-left" onClick={() => open(h._id)}><p className="truncate text-sm font-semibold">{h.targetRole || 'Profile review'}</p><p className="text-xs text-dim">{timeAgo(h.createdAt)}</p></button>
              <span className="font-display text-2xl font-bold" style={{ color: scoreTone(h.result?.profile_score) }}>{h.result?.profile_score}</span>
              <button aria-label="Delete review" className="rounded-lg p-1.5 text-dim hover:bg-bad/10 hover:text-bad" onClick={() => remove(h._id)}><Trash2 className="h-4 w-4" /></button>
            </Card>))}</div>}
      </section>
    </>
  );
}
