import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScanSearch, Trash2, History, FileUp, ClipboardPaste } from 'lucide-react';
import toast from 'react-hot-toast';
import { ats } from '../api';
import { Button, Card, PageHeader, Input, Textarea, FileDrop, Tabs, Skeleton, SkeletonCard, EmptyState, ErrorState } from '../components/ui';
import AtsResult from '../components/ats/AtsResult';
import { errMsg, timeAgo, scoreTone } from '../utils/cn';

export default function Ats() {
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [jobRole, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState(null);
  const [histErr, setHistErr] = useState('');

  const loadHistory = useCallback(async () => {
    setHistErr('');
    try { setHistory(await ats.history()); } catch (e) { setHistErr(errMsg(e)); }
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const open = useCallback(async (id) => {
    setLoading(true);
    try { setReport(await ats.get(id)); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { const id = params.get('id'); if (id) open(id); }, [params, open]);

  const run = async () => {
    if (mode === 'upload' && !file) return toast.error('Choose a PDF or DOCX file first.');
    if (mode === 'paste' && text.trim().length < 80) return toast.error('Paste your full resume text.');
    setLoading(true); setReport(null);
    try {
      const r = await ats.analyze({ file: mode === 'upload' ? file : null, resumeText: text, jobRole, jobDescription: jd });
      setReport(r); toast.success('Analysis complete'); loadHistory();
    } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  };

  const remove = async (id) => {
    try { await ats.remove(id); toast.success('Report deleted'); if (report?._id === id) setReport(null); if (params.get('id')) setParams({}); loadHistory(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <PageHeader title="ATS resume checker" text="Upload your resume and get an ATS score, keyword gaps and rewrites based only on what you wrote." />

      <Card className="mb-8">
        <Tabs className="mb-4 w-fit" value={mode} onChange={setMode} tabs={[{ id: 'upload', label: 'Upload file' }, { id: 'paste', label: 'Paste text' }]} />
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            {mode === 'upload'
              ? <FileDrop file={file} onFile={setFile} />
              : <Textarea label="Resume text" rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your resume here" />}
          </div>
          <div className="space-y-4">
            <Input label="Target role (optional)" value={jobRole} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer" maxLength={120} />
            <Textarea label="Job description (optional)" rows={mode === 'upload' ? 6 : 8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job posting to get a match percentage and missing keywords" />
          </div>
        </div>
        <div className="mt-5 flex justify-end"><Button icon={ScanSearch} loading={loading} onClick={run}>Analyze resume</Button></div>
      </Card>

      {loading && !report && <div className="grid gap-4 lg:grid-cols-2"><SkeletonCard lines={5} /><SkeletonCard lines={5} /></div>}
      {report && <AtsResult report={report} />}

      <section className="mt-10" aria-labelledby="hist">
        <h2 id="hist" className="mb-3 flex items-center gap-2 text-lg font-bold"><History className="h-5 w-5 text-accent" aria-hidden />Past checks</h2>
        {histErr ? <ErrorState message={histErr} onRetry={loadHistory} />
          : !history ? <Skeleton className="h-20 w-full" />
          : history.length === 0 ? <EmptyState icon={FileUp} title="No checks yet" text="Your analyzed resumes will appear here so you can track progress." />
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((h) => (
                <Card key={h._id} hover className="flex items-center justify-between gap-3 !p-4">
                  <button className="min-w-0 flex-1 text-left" onClick={() => { setParams({ id: h._id }); }}>
                    <p className="truncate text-sm font-semibold">{h.jobRole || h.fileName}</p>
                    <p className="text-xs text-dim">{timeAgo(h.createdAt)}</p>
                  </button>
                  <span className="font-display text-2xl font-bold" style={{ color: scoreTone(h.result?.overall_score) }}>{h.result?.overall_score}</span>
                  <button aria-label="Delete report" className="rounded-lg p-1.5 text-dim hover:bg-bad/10 hover:text-bad" onClick={() => remove(h._id)}><Trash2 className="h-4 w-4" /></button>
                </Card>
              ))}
            </div>
          )}
      </section>
    </>
  );
}
