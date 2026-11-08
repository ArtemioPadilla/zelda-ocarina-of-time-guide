/** One compact tracker counter (label, bar, done/total) for the chapter strip. */
export function MiniBar({
  done,
  total,
  label,
  short,
}: {
  done: number;
  total: number;
  label: string;
  short?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <span className="flex items-center gap-1.5">
      <span className="hidden sm:inline">{label}</span>
      {short ? (
        <span className="sm:hidden" aria-hidden="true">
          {short}
        </span>
      ) : null}
      <span
        role="progressbar"
        aria-label={label}
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:w-20"
      >
        <span className="block h-full bg-primary" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-primary" aria-hidden="true">
        {done}/{total}
      </span>
    </span>
  );
}
