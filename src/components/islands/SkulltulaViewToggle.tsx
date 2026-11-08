import { useState } from 'react';
import GroupedChecklist, { type Group } from './GroupedChecklist';
import SkulltulaMapView from './SkulltulaMapView';
import type { MapPin } from './SkulltulaMap';
import type { SkulltulaArea } from '@/lib/skulltula-map-layout';

interface Props {
  /** IndexedDB key of the checklist (`oot-collectibles-done`). */
  store: string;
  /** List view: the engine's grouped checklist rows. */
  groups: Group[];
  /** Map view: the same pieces as pins (same ids). */
  pins: MapPin[];
  progressLabel: string;
  viewToggleLabel: string;
  listLabel: string;
  mapLabel: string;
  areaLabels: Record<SkulltulaArea, string>;
  doneLabel: string;
  pendingLabel: string;
}

/**
 * List/Map toggle for a collectible type whose pieces carry map pins (the
 * Gold Skulltulas). The view choice is local UI state (not persisted);
 * both views write the same checklist store with the same ids, so
 * switching views never changes or duplicates progress. List is the
 * default and always available; Map is an additional, equally functional
 * way to tick the same pieces, never a replacement for it.
 */
export default function SkulltulaViewToggle({
  store,
  groups,
  pins,
  progressLabel,
  viewToggleLabel,
  listLabel,
  mapLabel,
  areaLabels,
  doneLabel,
  pendingLabel,
}: Props) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const button = (v: 'list' | 'map', label: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => setView(v)}
      className={`rounded-md px-3 py-1.5 transition-colors ${
        view === v
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div
        role="group"
        aria-label={viewToggleLabel}
        className="mb-4 inline-flex rounded-lg border border-border bg-card p-0.5 font-mono text-xs"
      >
        {button('list', listLabel)}
        {button('map', mapLabel)}
      </div>

      {view === 'list' ? (
        <GroupedChecklist store={store} groups={groups} progressLabel={progressLabel} />
      ) : (
        <SkulltulaMapView
          store={store}
          items={pins}
          progressLabel={progressLabel}
          areaLabels={areaLabels}
          doneLabel={doneLabel}
          pendingLabel={pendingLabel}
        />
      )}
    </div>
  );
}
