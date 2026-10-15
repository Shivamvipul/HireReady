import { forwardRef, useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, UploadCloud, FileText, X, AlertTriangle, Inbox } from 'lucide-react';
import { cn, scoreTone } from '../../utils/cn';

export const Spinner = ({ className = 'h-4 w-4' }) => <Loader2 className={cn('animate-spin', className)} aria-hidden />;

export function Button({ variant = 'primary', size, loading, children, className, icon: Icon, ...p }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cn(variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-ghost', size === 'sm' && 'btn-sm', className)}
    >
      {loading ? <Spinner /> : Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
    </button>
  );
}

export const Card = ({ className, hover, ...p }) => <div {...p} className={cn('card', hover && 'card-hover', className)} />;

export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-xl bg-raised', className)} aria-hidden />;
export const SkeletonCard = ({ lines = 3 }) => (
  <Card><Skeleton className="mb-4 h-5 w-1/3" />{Array.from({ length: lines }).map((_, i) => <Skeleton key={i} className="mb-2 h-4 w-full" />)}</Card>
);

export const EmptyState = ({ icon: Icon = Inbox, title, text, action }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
    <div className="mb-3 rounded-xl bg-accent-soft p-3 text-accent"><Icon className="h-6 w-6" aria-hidden /></div>
    <h3 className="text-base font-semibold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-dim">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center rounded-2xl border border-bad/30 bg-bad/5 px-6 py-10 text-center">
    <AlertTriangle className="mb-2 h-6 w-6 text-bad" aria-hidden />
    <p className="text-sm text-fg">{message || 'Something went wrong.'}</p>
    {onRetry && <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>Try again</Button>}
  </div>
);

export function ScoreRing({ value = 0, size = 140, stroke = 10, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const color = scoreTone(v);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label || 'Score'}: ${v} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4ece7" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }} style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold" style={{ color }}>{v}</div>
        {label && <div className="text-[11px] text-dim">{label}</div>}
      </div>
    </div>
  );
}

export const GradientBar = ({ value = 0, label }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs"><span className="text-dim">{label}</span><span className="font-semibold">{value}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <motion.div className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
    </div>
  </div>
);

export const Chip = ({ tone = 'neutral', children, className }) => <span className={cn(`chip-${tone}`, className)}>{children}</span>;

export function Field({ label, error, hint, children, id }) {
  const gen = useId();
  const fid = id || gen;
  return (
    <div>
      {label && <label htmlFor={fid} className="label">{label}</label>}
      {typeof children === 'function' ? children(fid) : children}
      {hint && !error && <p className="mt-1 text-xs text-dim">{hint}</p>}
      {error && <p className="mt-1 text-xs text-bad" role="alert">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(({ label, error, hint, className, ...p }, ref) => (
  <Field label={label} error={error} hint={hint} id={p.id}>{(id) => <input id={id} {...p} ref={ref} aria-invalid={!!error} className={cn('input', className)} />}</Field>
));
export const Textarea = ({ label, error, hint, className, rows = 4, ...p }) => (
  <Field label={label} error={error} hint={hint} id={p.id}>{(id) => <textarea id={id} rows={rows} {...p} aria-invalid={!!error} className={cn('input resize-y', className)} />}</Field>
);
export const Select = ({ label, error, children, className, ...p }) => (
  <Field label={label} error={error} id={p.id}>{(id) => <select id={id} {...p} className={cn('input', className)}>{children}</select>}</Field>
);

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1', className)}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cn('whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition', value === t.id ? 'bg-accent-strong text-white shadow-glow' : 'text-dim hover:bg-raised hover:text-fg')}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Accordion({ title, right, children, defaultOpen = false, tone }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn('rounded-xl border bg-surface', tone === 'high' ? 'border-bad/30' : tone === 'medium' ? 'border-warn/30' : 'border-line')}>
      <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-2">{right}<ChevronDown className={cn('h-4 w-4 text-dim transition', open && 'rotate-180')} aria-hidden /></span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-line px-4 py-3 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileDrop({ file, onFile, accept = '.pdf,.docx', hint = 'PDF or DOCX, up to 5 MB' }) {
  const [over, setOver] = useState(false);
  const ref = useRef();
  const pick = (f) => f && onFile(f);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
      className={cn('rounded-2xl border border-dashed p-6 text-center transition', over ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent/50')}
    >
      <input ref={ref} type="file" accept={accept} className="sr-only" id="filedrop" onChange={(e) => pick(e.target.files?.[0])} />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          <span className="truncate text-sm font-medium">{file.name}</span>
          <button type="button" aria-label="Remove file" className="rounded-lg p-1 text-dim hover:bg-raised hover:text-fg" onClick={() => onFile(null)}><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <label htmlFor="filedrop" className="flex cursor-pointer flex-col items-center gap-1">
          <UploadCloud className="h-7 w-7 text-accent" aria-hidden />
          <span className="text-sm font-medium">Drop your file here or <span className="text-accent underline">browse</span></span>
          <span className="text-xs text-dim">{hint}</span>
        </label>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn('card relative max-h-[90vh] w-full overflow-auto', wide ? 'max-w-3xl' : 'max-w-md')}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-dim hover:bg-raised"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export const PageHeader = ({ title, text, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{text && <p className="mt-1 max-w-2xl text-sm text-dim">{text}</p>}</div>
    {action}
  </div>
);
