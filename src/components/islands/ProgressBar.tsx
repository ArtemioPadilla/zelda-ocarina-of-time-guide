interface Props {
  done: number;
  total: number;
  label: string;
}

export default function ProgressBar({ done, total, label }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div
        className="h-2 min-w-[180px] flex-1 overflow-hidden rounded-full border border-border bg-muted"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
      >
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="min-w-[64px] shrink-0 font-mono text-sm text-primary" aria-hidden="true">
        {done} / {total}
      </span>
    </div>
  );
}
