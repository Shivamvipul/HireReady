import { useNavigate } from 'react-router-dom';
import { Copy, ArrowRight, CheckCircle2, XCircle, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, ScoreRing, GradientBar, Chip, Accordion, Button } from '../ui';
import CategoryRadar from '../charts/CategoryRadar';
import { copy } from '../../utils/cn';
import { usePrefill } from '../../store/builderStore';

const SEV = { high: 0, medium: 1, low: 2 };
const sevTone = { high: 'bad', medium: 'neutral', low: 'neutral' };

function extractContact(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || '';
  const phone = text.match(/(\+?\d[\d\s().-]{8,}\d)/)?.[0] || '';
  const name = (text.split('\n').find((l) => l.trim().length > 1 && l.trim().length < 50 && !/@|\d{5}/.test(l)) || '').trim();
  return { name, email, phone };
}

export default function AtsResult({ report }) {
  const r = report.result;
  const nav = useNavigate();
  const setPrefill = usePrefill((s) => s.setPrefill);

  const improve = () => {
    setPrefill({
      contact: extractContact(report.resumeText),
      importedText: report.resumeText,
      suggestions: r.rewrite_suggestions || [],
      title: report.jobRole ? `Resume - ${report.jobRole}` : 'Resume (from ATS check)',
    });
    nav('/resumes/new');
  };

  const issues = [...(r.issues || [])].sort((a, b) => SEV[a.severity] - SEV[b.severity]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:flex-col">
          <ScoreRing value={r.overall_score} label="ATS score" size={160} />
          {r.job_match_percent != null && <ScoreRing value={r.job_match_percent} label="Job match" size={110} stroke={8} />}
        </Card>
        <Card>
          <h2 className="mb-1 text-lg font-bold">Category breakdown</h2>
          <div className="grid items-center gap-4 md:grid-cols-2">
            <CategoryRadar scores={r.category_scores} />
            <div className="space-y-3">{Object.entries(r.category_scores).map(([k, v]) => <GradientBar key={k} label={k[0].toUpperCase() + k.slice(1)} value={v} />)}</div>
          </div>
          <p className="mt-3 text-xs text-dim">Blend of AI review ({r.ai_score}) and rule-based checks ({r.rule_score}).</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">What to fix</h2>
        <Button icon={Wand2} onClick={improve}>Improve in Resume Builder</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Keywords</h3>
          <p className="mb-2 text-xs text-dim">Found in your resume</p>
          <div className="mb-4 flex flex-wrap gap-2">{r.matched_keywords?.length ? r.matched_keywords.map((k) => <Chip key={k} tone="good">{k}</Chip>) : <span className="text-sm text-dim">None detected.</span>}</div>
          <p className="mb-2 text-xs text-dim">Missing. Add only the ones that are true for you.</p>
          <div className="flex flex-wrap gap-2">{r.missing_keywords?.length ? r.missing_keywords.map((k) => <Chip key={k} tone="bad">{k}</Chip>) : <span className="text-sm text-dim">Nothing missing.</span>}</div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Strengths and weaknesses</h3>
          <ul className="space-y-1.5 text-sm">
            {r.strengths?.map((s, i) => <li key={`s${i}`} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden />{s}</li>)}
            {r.weaknesses?.map((s, i) => <li key={`w${i}`} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden />{s}</li>)}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Issues by priority</h3>
        <div className="space-y-2">
          {issues.length === 0 && <p className="text-sm text-dim">No issues found.</p>}
          {issues.map((i, n) => (
            <Accordion key={n} tone={i.severity} defaultOpen={n === 0 && i.severity === 'high'} title={i.issue} right={<Chip tone={sevTone[i.severity]}>{i.severity}</Chip>}>
              <p className="text-dim"><span className="font-semibold text-fg">Fix: </span>{i.fix}</p>
            </Accordion>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Rewrite suggestions</h3>
        {r.rewrite_suggestions?.length ? (
          <div className="space-y-4">
            {r.rewrite_suggestions.map((s, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
                <div className="rounded-xl border border-bad/20 bg-bad/5 p-3 text-sm"><p className="mb-1 text-xs font-semibold text-bad">Before</p>{s.original}</div>
                <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-dim md:block" aria-hidden />
                <div className="rounded-xl border border-good/20 bg-good/5 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between"><p className="text-xs font-semibold text-good">After</p>
                    <button className="flex items-center gap-1 text-xs text-dim hover:text-fg" onClick={() => copy(s.improved, toast)} aria-label="Copy improved text"><Copy className="h-3.5 w-3.5" />Copy</button></div>
                  {s.improved}
                  <p className="mt-2 text-xs text-dim">{s.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-dim">No rewrites suggested.</p>}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Section feedback</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(r.section_feedback || {}).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-raised p-3 text-sm"><p className="mb-1 font-semibold capitalize">{k}</p><p className="text-dim">{v}</p></div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Automatic format checks</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {r.rule_checks?.map((c) => (
            <li key={c.id} className="flex gap-2 text-sm">
              {c.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden />}
              <span><span className="font-medium">{c.label}.</span> <span className="text-dim">{c.detail}</span></span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
