import { useStore } from '@nanostores/react';
import { skulltulasStore } from '@/stores/checklist';
import { AREA_REGIONS, type SkulltulaArea } from '@/lib/skulltula-map-layout';

interface MapSkulltula {
  id: string;
  number: number;
  zone: string;
  location: string;
  note?: string;
  x: number;
  y: number;
}

interface Props {
  area: SkulltulaArea;
  items: MapSkulltula[];
  doneLabel: string;
  pendingLabel: string;
}

/**
 * One hub's schematic map: a hand-drawn (not a game screenshot — see
 * skulltula-map-layout.ts) SVG of soft zone regions, with a real `<button>`
 * pin per skulltula absolutely positioned at its `x`/`y`%. Pins read AND
 * write `skulltulasStore.$checked` directly — the exact same nanostores/
 * idb-keyval store `ChecklistItem`'s checkboxes use in the List view, so
 * toggling a pin here is reflected immediately in the list (and vice
 * versa), with no second source of truth.
 */
export default function SkulltulaMap({ area, items, doneLabel, pendingLabel }: Props) {
  const checked = useStore(skulltulasStore.$checked);
  const regions = AREA_REGIONS[area];

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-card">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {regions.map((r) => {
          const [x0, y0, x1, y1] = r.box;
          return (
            <rect
              key={r.zone}
              x={x0}
              y={y0}
              width={x1 - x0}
              height={y1 - y0}
              rx={1.5}
              style={{
                fill: r.interior
                  ? 'color-mix(in oklch, var(--pill-dungeon) 14%, var(--card))'
                  : 'color-mix(in oklch, var(--primary) 10%, var(--card))',
                stroke: r.interior
                  ? 'color-mix(in oklch, var(--pill-dungeon) 45%, transparent)'
                  : 'color-mix(in oklch, var(--primary) 35%, transparent)',
                strokeWidth: 0.4,
                strokeDasharray: r.interior ? '2 1.4' : undefined,
              }}
            />
          );
        })}
      </svg>

      {/* Zone labels as real HTML text (not SVG) so they never get
          non-uniformly stretched by the viewBox→aspect-ratio scaling above. */}
      {regions.map((r) => (
        <span
          key={r.zone}
          className="pointer-events-none absolute font-mono text-[8px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[9px]"
          style={{ left: `${r.box[0]}%`, top: `${r.box[1]}%`, transform: 'translate(3px, 2px)' }}
        >
          {r.zone}
        </span>
      ))}

      {items.map((item) => {
        const isChecked = checked.has(item.id);
        const baseLabel = `#${item.number} ${item.location}${item.note ? ` ${item.note}` : ''}`;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isChecked}
            aria-label={`${baseLabel} — ${isChecked ? doneLabel : pendingLabel}`}
            title={item.location}
            onClick={() => skulltulasStore.toggle(item.id)}
            className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[10px] font-semibold shadow-sm transition-transform hover:z-10 hover:scale-125 focus-visible:z-10 focus-visible:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              isChecked
                ? 'border-border bg-muted text-muted-foreground opacity-70'
                : 'border-primary/70 bg-primary text-primary-foreground'
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {isChecked ? '✓' : item.number}
          </button>
        );
      })}
    </div>
  );
}
