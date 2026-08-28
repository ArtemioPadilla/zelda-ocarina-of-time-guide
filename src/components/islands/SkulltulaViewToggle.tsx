import { useState } from 'react';
import SkulltulaChecklist from './SkulltulaChecklist';
import SkulltulaMapView from './SkulltulaMapView';
import type { SkulltulaArea } from '@/lib/skulltula-map-layout';

interface Item {
  id: string;
  number: number;
  zone: string;
  zoneKey: string;
  area: SkulltulaArea;
  location: string;
  note?: string;
  x: number;
  y: number;
}

interface Props {
  items: Item[];
  progressLabel: string;
  viewToggleLabel: string;
  listLabel: string;
  mapLabel: string;
  areaLabels: Record<SkulltulaArea, string>;
  doneLabel: string;
  pendingLabel: string;
}

/**
 * List/Map toggle for the Skulltulas page. Purely local UI state (not
 * persisted) — both views read the same `items` prop and the same
 * `skulltulasStore`, so switching views never changes or duplicates
 * progress. List stays the default and is always available; Map is an
 * additional, equally-functional way to toggle the same items, never a
 * replacement for it.
 */
export default function SkulltulaViewToggle({
  items,
  progressLabel,
  viewToggleLabel,
  listLabel,
  mapLabel,
  areaLabels,
  doneLabel,
  pendingLabel,
}: Props) {
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <div>
      <div role="group" aria-label={viewToggleLabel} className="mb-4 inline-flex rounded-lg border border-border p-0.5 font-mono text-xs">
        <button
          type="button"
          aria-pressed={view === 'list'}
          onClick={() => setView('list')}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {listLabel}
        </button>
        <button
          type="button"
          aria-pressed={view === 'map'}
          onClick={() => setView('map')}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mapLabel}
        </button>
      </div>

      {view === 'list' ? (
        <SkulltulaChecklist items={items} progressLabel={progressLabel} />
      ) : (
        <SkulltulaMapView
          items={items}
          progressLabel={progressLabel}
          areaLabels={areaLabels}
          doneLabel={doneLabel}
          pendingLabel={pendingLabel}
        />
      )}
    </div>
  );
}
