import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { skulltulasStore } from '@/stores/checklist';
import { ZONE_MAP_BY_KEY } from '@/lib/skulltula-map-layout';
import { withBase } from '@/lib/href';

interface MapSkulltula {
  id: string;
  number: number;
  zoneKey: string;
  location: string;
  note?: string;
  x: number;
  y: number;
  /** Which floor tab this pin belongs to, for the 11 floored dungeon
   * interiors (see `ZONE_MAP_BY_KEY[zoneKey].floors`). Unused elsewhere. */
  floor?: string;
}

interface Props {
  zoneKey: string;
  items: MapSkulltula[];
  doneLabel: string;
  pendingLabel: string;
}

/**
 * One zone's map: a real sourced photo of that zone (see
 * `ZONE_MAP_BY_KEY[zoneKey].image` — a Zelda Wiki OoT/OoT3D screenshot,
 * attributed below the map), a per-floor set of real photos with a floor
 * switcher (`ZONE_MAP_BY_KEY[zoneKey].floors` — the 11 dungeon interiors),
 * or, where no photo was sourced yet, the original hand-drawn single-region
 * schematic fallback — with a real `<button>` pin per skulltula absolutely
 * positioned at its `x`/`y`% within that zone's (or, for a floored zone,
 * that floor's) own canvas. Pins read AND write `skulltulasStore.$checked`
 * directly — the exact same nanostores/idb-keyval store `ChecklistItem`'s
 * checkboxes use in the List view, so toggling a pin here is reflected
 * immediately in the list (and vice versa), with no second source of
 * truth.
 */
export default function SkulltulaMap({ zoneKey, items, doneLabel, pendingLabel }: Props) {
  const checked = useStore(skulltulasStore.$checked);
  const config = ZONE_MAP_BY_KEY[zoneKey];
  const floors = config?.floors;
  const [selectedFloor, setSelectedFloor] = useState(floors?.[0]?.key);
  const currentFloor = floors?.find((f) => f.key === selectedFloor) ?? floors?.[0];
  const image = currentFloor?.image ?? config?.image;
  const interior = config?.interior ?? false;
  const aspect = image ? `${image.width} / ${image.height}` : '16 / 10';
  // A floored zone only shows the pins that belong to the selected floor —
  // every skulltula in a floored zone carries a matching `floor` field.
  const visibleItems = floors
    ? items.filter((item) => item.floor === (currentFloor?.key ?? selectedFloor))
    : items;

  return (
    <div>
      {floors && floors.length > 1 ? (
        <div role="tablist" aria-label={`${zoneKey} floors`} className="mb-2 flex flex-wrap gap-1">
          {floors.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={f.key === (currentFloor?.key ?? selectedFloor)}
              onClick={() => setSelectedFloor(f.key)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                f.key === (currentFloor?.key ?? selectedFloor)
                  ? 'border-primary/70 bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="relative w-full overflow-hidden rounded-lg border border-border bg-card"
        style={{ aspectRatio: aspect }}
      >
        {image ? (
          <img
            src={withBase(image.src)}
            alt={`${zoneKey}${currentFloor ? ` — ${currentFloor.label}` : ''}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <rect
              x={0}
              y={0}
              width={100}
              height={100}
              style={{
                fill: interior
                  ? 'color-mix(in oklch, var(--pill-dungeon) 14%, var(--card))'
                  : 'color-mix(in oklch, var(--primary) 10%, var(--card))',
                stroke: interior
                  ? 'color-mix(in oklch, var(--pill-dungeon) 45%, transparent)'
                  : 'color-mix(in oklch, var(--primary) 35%, transparent)',
                strokeWidth: 0.4,
                strokeDasharray: interior ? '2 1.4' : undefined,
              }}
            />
          </svg>
        )}

        {visibleItems.map((item) => {
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
      {image ? (
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hover:underline"
          >
            {image.attribution}
          </a>
        </p>
      ) : null}
    </div>
  );
}
