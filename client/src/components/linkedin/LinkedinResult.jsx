import { useMemo, useState } from 'react';
import { Copy, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, ScoreRing, Chip, Tabs } from '../ui';
import { copy } from '../../utils/cn';

const List = ({ items = [] }) => (items.length ? <ul className="list-disc space-y-1.5 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="text-sm text-dim">Nothing to add here.</p>);
const CopyBtn = ({ text, label = 'Copy' }) => <button className="flex items-center gap-1 text-xs text-dim hover:text-fg" aria-label={`${label} text`} onClick={() => copy(text, toast)}><Copy className="h-3.5 w-3.5" />{label}</button>;

export default function LinkedinResult({ report }) {
  const r = report.result;
  const [tab, setTab] = useState('experience');
  const done = r.completeness_checklist.filter((c) => c.done).length;
  const pct = r.completeness_checklist.length ? Math.round((done / r.completeness_checklist.length) * 100) : 0;

  const plan = useMemo(() => {
    const todo = r.completeness_checklist.filter((c) => !c.done).map((c) => c.item);
    const themes = r.networking_content_plan || [];
    return [
      { week: 'Week 1: Fix the basics', items: [`Pick one of the headline options and update your headline`, `Replace your About section with the rewrite`, ...todo.slice(0, 2)] },
      { week: 'Week 2: Experience and skills', items: ['Update experience bullets using the suggestions (add your real numbers)', 'Add the relevant skills you can honestly claim', ...todo.slice(2, 4)] },
      { week: 'Week 3: Visibility', items: [themes[0] || 'Post one useful update about your work', themes[1] || 'Comment on 5 posts from people in your target field', ...r.featured_section_ideas.slice(0, 1)] },
      { week: 'Week 4: Network', items: [themes[2] || 'Reach out to 5 people at target companies', themes[3] || 'Request 2 recommendations', r.recommendations_strategy ? 'Follow the recommendations strategy below' : 'Ask a colleague for a recommendation'] },
    ];
  }, [r]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center justify-center gap-3"><ScoreRing value={r.profile_score} label="Profile score" size={150} />
          {report.linkedinUrl && <a href={report.linkedinUrl} target="_blank" rel="noreferrer" className="max-w-[200px] truncate text-xs text-accent underline">{report.linkedinUrl.replace(/^https?:\/\//, '')}</a>}</Card>
        <Card>
          <h2 className="mb-3 text-lg font-bold">Headline options</h2>
          <div className="space-y-2">{r.headline_options.map((h, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-raised p-3 text-sm"><span>{h}</span><CopyBtn text={h} /></div>
          ))}</div>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-bold">About section rewrite</h2><CopyBtn text={r.about_rewrite} /></div>
        <p className="whitespace-pre-line text-sm leading-relaxed">{r.about_rewrite}</p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Profile checklist</h2><span className="text-sm text-dim">{done}/{r.completeness_checklist.length} done</span></div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress"><div className="h-full rounded-full bg-gradient-to-r from-accent-strong to-good" style={{ width: `${pct}%` }} /></div>
        <ul className="grid gap-2 sm:grid-cols-2">{r.completeness_checklist.map((c, i) => (
          <li key={i} className="flex gap-2 text-sm">{c.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-dim" aria-hidden />}<span className={c.done ? 'text-dim' : ''}>{c.item}</span></li>
        ))}</ul>
      </Card>

      <div>
        <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'experience', label: 'Experience' }, { id: 'skills', label: 'Skills & keywords' }, { id: 'brand', label: 'Branding' }, { id: 'network', label: 'Network & recruiters' }]} />
        <Card>
          {tab === 'experience' && (r.experience_suggestions.length ? (
            <div className="space-y-4">{r.experience_suggestions.map((s, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-bad/20 bg-bad/5 p-3 text-sm"><p className="mb-1 text-xs font-semibold text-bad">Current</p>{s.original}</div>
                <div className="rounded-xl border border-good/20 bg-good/5 p-3 text-sm"><div className="mb-1 flex justify-between"><p className="text-xs font-semibold text-good">Suggested</p><CopyBtn text={s.improved} /></div>{s.improved}</div>
              </div>))}</div>
          ) : <p className="text-sm text-dim">No experience rewrites were suggested.</p>)}
          {tab === 'skills' && (
            <div className="space-y-5">
              <div><p className="mb-2 text-xs font-semibold text-dim">Skills to add (only if true)</p><div className="flex flex-wrap gap-2">{r.skills_to_add.map((s) => <Chip key={s} tone="good">{s}</Chip>)}</div></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">Consider removing</p><div className="flex flex-wrap gap-2">{r.skills_to_remove.length ? r.skills_to_remove.map((s) => <Chip key={s} tone="bad">{s}</Chip>) : <span className="text-sm text-dim">Nothing to remove.</span>}</div></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">Keywords recruiters search for</p><div className="flex flex-wrap gap-2">{r.keywords_for_role.map((s) => <Chip key={s} tone="accent">{s}</Chip>)}</div></div>
            </div>
          )}
          {tab === 'brand' && (
            <div className="space-y-5">
              <div><p className="mb-2 text-xs font-semibold text-dim">Banner and photo</p><List items={r.banner_photo_tips} /></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">Custom URL</p><p className="text-sm">{r.custom_url_tips || 'No suggestions.'}</p></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">Featured section ideas</p><List items={r.featured_section_ideas} /></div>
            </div>
          )}
          {tab === 'network' && (
            <div className="space-y-5">
              <div><p className="mb-2 text-xs font-semibold text-dim">Recommendations strategy</p><p className="text-sm">{r.recommendations_strategy || 'No suggestions.'}</p></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">Networking and content themes</p><List items={r.networking_content_plan} /></div>
              <div><p className="mb-2 text-xs font-semibold text-dim">How recruiters will find you</p><List items={r.recruiter_search_tips} /></div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-bold">30-day action plan</h2>
        <div className="grid gap-4 md:grid-cols-2">{plan.map((w) => (
          <div key={w.week} className="rounded-xl bg-raised p-4"><p className="mb-2 text-sm font-semibold">{w.week}</p><List items={w.items.filter(Boolean)} /></div>
        ))}</div>
      </Card>
    </div>
  );
}
