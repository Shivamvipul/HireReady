import { useState } from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle, RefreshCw, Mic, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { interview } from '../../api';
import { Button, Chip, Textarea, ScoreRing } from '../ui';
import { cn, errMsg } from '../../utils/cn';

const diffTone = { easy: 'good', medium: 'accent', hard: 'bad' };

export default function QuestionCard({ q, set, bookmarked, practiced, onToggle, onRegenerate, regenerating }) {
  const [open, setOpen] = useState(false);
  const [practice, setPractice] = useState(false);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const evaluate = async () => {
    setBusy(true);
    try {
      setResult(await interview.evaluate({ question: q.question, answer, role: set.role, level: set.level, setId: set._id }));
      toast.success('Answer evaluated');
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className={cn('card !p-0 card-hover', practiced && 'border-good/25')}>
      <div className="flex items-start gap-3 p-4">
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <span className="mt-0.5 text-xs font-bold text-dim">{q.id}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-snug">{q.question}</span>
            <span className="mt-2 flex items-center gap-2"><Chip tone={diffTone[q.difficulty]}>{q.difficulty}</Chip>{practiced && <Chip tone="good">practiced</Chip>}</span>
          </span>
          <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-dim transition', open && 'rotate-180')} aria-hidden />
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'} aria-pressed={bookmarked} onClick={() => onToggle(q.id, 'bookmarks')} className="rounded-lg p-1.5 text-dim hover:bg-raised hover:text-accent">
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button aria-label={practiced ? 'Mark as not practiced' : 'Mark as practiced'} aria-pressed={practiced} onClick={() => onToggle(q.id, 'practiced')} className="rounded-lg p-1.5 text-dim hover:bg-raised hover:text-good">
            {practiced ? <CheckCircle2 className="h-4 w-4 text-good" /> : <Circle className="h-4 w-4" />}
          </button>
          <button aria-label="Replace this question" disabled={regenerating} onClick={() => onRegenerate(q.id)} className="rounded-lg p-1.5 text-dim hover:bg-raised hover:text-fg disabled:opacity-50">
            <RefreshCw className={cn('h-4 w-4', regenerating && 'animate-spin')} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-line p-4 text-sm">
              <div><p className="mb-1 text-xs font-semibold text-dim">Answer outline</p><p className="whitespace-pre-line">{q.answer_outline}</p></div>
              {q.key_points?.length > 0 && <div><p className="mb-1 text-xs font-semibold text-dim">Key points to hit</p><ul className="list-disc space-y-1 pl-5">{q.key_points.map((k, i) => <li key={i}>{k}</li>)}</ul></div>}
              {q.tips && <div className="rounded-xl bg-accent-soft p-3"><p className="mb-1 text-xs font-semibold text-accent">Tip</p>{q.tips}</div>}
              {q.follow_ups?.length > 0 && <div><p className="mb-1 text-xs font-semibold text-dim">Likely follow-ups</p><ul className="list-disc space-y-1 pl-5 text-dim">{q.follow_ups.map((k, i) => <li key={i}>{k}</li>)}</ul></div>}

              <Button variant="ghost" size="sm" icon={Mic} onClick={() => setPractice(!practice)}>{practice ? 'Close practice' : 'Practice this answer'}</Button>
              {practice && (
                <div className="space-y-3 rounded-xl border border-line p-3">
                  <Textarea label="Your answer" rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as you would say it in the interview" />
                  <Button size="sm" loading={busy} disabled={answer.trim().length < 10} onClick={evaluate}>Get feedback</Button>
                  {result && (
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                      <div className="grid place-items-center"><ScoreRing value={Math.round(result.score * 10)} size={96} stroke={8} label={`${result.score}/10`} /></div>
                      <div className="space-y-2">
                        {result.verdict && <p className="font-medium">{result.verdict}</p>}
                        {result.strengths.length > 0 && <ul className="list-disc space-y-1 pl-5 text-good">{result.strengths.map((s, i) => <li key={i}><span className="text-fg">{s}</span></li>)}</ul>}
                        {result.improvements.length > 0 && <ul className="list-disc space-y-1 pl-5 text-warn">{result.improvements.map((s, i) => <li key={i}><span className="text-fg">{s}</span></li>)}</ul>}
                        {result.improved_answer && <div className="rounded-lg bg-raised p-3 text-dim"><p className="mb-1 text-xs font-semibold text-fg">Sharper version of your answer</p>{result.improved_answer}</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
