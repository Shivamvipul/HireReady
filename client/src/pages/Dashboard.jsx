import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch, MessagesSquare, FileText, Linkedin, ArrowUpRight, Activity } from 'lucide-react';
import { dashboard } from '../api';
import { useAuth } from '../store/authStore';
import { Card, ErrorState, PageHeader, ScoreRing, Skeleton, EmptyState, Button } from '../components/ui';
import { errMsg, timeAgo } from '../utils/cn';
import { templates } from '../templates/catalog';

const ROUTE = { ats: (a) => `/ats?id=${a.id}`, interview: () => '/interview', linkedin: () => '/linkedin', resume: (a) => `/resumes/${a.id}` };
const ICON = { ats: ScanSearch, interview: MessagesSquare, linkedin: Linkedin, resume: FileText };

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => { setErr(''); try { setD(await dashboard.get()); } catch (e) { setErr(errMsg(e)); } }, []);
  useEffect(() => { load(); }, [load]);

  const cards = [
    { to: '/ats', icon: ScanSearch, title: 'ATS resume checker', text: 'Score your resume and fix what parsers miss.', n: d?.counts.ats, unit: 'checks' },
    { to: '/interview', icon: MessagesSquare, title: 'Interview prep', text: 'Role and company questions from your resume.', n: d?.counts.interview, unit: 'sets' },
    { to: '/resumes', icon: FileText, title: 'Resume builder', text: '48 templates, PDF and DOCX export.', n: d?.counts.resumes, unit: 'resumes' },
    { to: '/linkedin', icon: Linkedin, title: 'LinkedIn optimizer', text: 'Headline, About and a 30-day plan.', n: d?.counts.linkedin, unit: 'reviews' },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} text="Pick up a module or check your latest results." />
      {err ? <ErrorState message={err} onRetry={load} /> : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <Link key={c.to} to={c.to} className="card card-hover group block">
                <div className="mb-4 flex items-center justify-between"><span className="rounded-xl bg-accent-soft p-2.5 text-accent"><c.icon className="h-5 w-5" aria-hidden /></span><ArrowUpRight className="h-4 w-4 text-dim transition group-hover:text-accent" aria-hidden /></div>
                <h2 className="font-semibold">{c.title}</h2>
                <p className="mt-1 text-sm text-dim">{c.text}</p>
                <div className="mt-3 text-xs text-dim">{d ? `${c.n} ${c.unit}` : <Skeleton className="h-3 w-16" />}</div>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Card className="flex flex-col items-center justify-center text-center">
              <h2 className="mb-4 font-semibold">Latest ATS score</h2>
              {!d ? <Skeleton className="h-36 w-36 !rounded-full" /> : d.latestAts ? (
                <>
                  <ScoreRing value={d.latestAts.score} label="ATS score" size={150} />
                  <p className="mt-3 max-w-[240px] truncate text-sm text-dim">{d.latestAts.label} · {timeAgo(d.latestAts.at)}</p>
                  <Link to={`/ats?id=${d.latestAts.id}`} className="mt-2 text-sm text-accent underline">View report</Link>
                </>
              ) : <EmptyState icon={ScanSearch} title="No score yet" text="Check a resume to see your first score." action={<Link to="/ats"><Button size="sm">Check my resume</Button></Link>} />}
            </Card>

            <Card>
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-accent" aria-hidden />Recent activity</h2>
              {!d ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
                : d.activity.length === 0 ? <EmptyState title="Nothing here yet" text="Everything you create in HireRead shows up here." />
                : <ul className="divide-y divide-line">{d.activity.map((a) => {
                  const I = ICON[a.type];
                  return <li key={`${a.type}${a.id}`}><Link to={ROUTE[a.type](a)} className="flex items-center gap-3 rounded-lg py-3 hover:bg-raised/60"><I className="h-4 w-4 shrink-0 text-accent" aria-hidden /><span className="min-w-0 flex-1 truncate text-sm">{a.title}</span><span className="text-xs text-dim">{a.detail}</span><span className="w-16 text-right text-xs text-dim">{timeAgo(a.at)}</span></Link></li>;
                })}</ul>}
            </Card>
          </div>

          <h2 className="mb-3 mt-8 text-lg font-bold">Saved resumes</h2>
          {!d ? <Skeleton className="h-20" /> : d.resumes.length === 0 ? <EmptyState icon={FileText} title="No resumes saved" text="Create one in the builder. You can keep a version per role." action={<Link to="/resumes"><Button size="sm">Open builder</Button></Link>} />
            : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.resumes.map((r) => (
              <Link key={r._id} to={`/resumes/${r._id}`} className="card card-hover block !p-4"><p className="truncate font-semibold">{r.title}</p><p className="text-xs text-dim">{templates.find((t) => t.id === r.templateId)?.name} · edited {timeAgo(r.updatedAt)}</p></Link>))}</div>}
        </>
      )}
    </>
  );
}
