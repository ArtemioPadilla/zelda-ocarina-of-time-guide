import { checklistStore } from '@/stores/checklist';
import { useHydratedStore, NO_CHECKED } from '@/lib/use-hydrated-store';
import ProgressBar from './ProgressBar';
import SkulltulaMap, { type MapPin } from './SkulltulaMap';
import { AREA_ORDER, ZONES_BY_HUB, type SkulltulaArea } from '@/lib/skulltula-map-layout';

interface Props {
  /** IndexedDB key of the checklist (`oot-collectibles-done`). */
  store: string;
  items: MapPin[];
  progressLabel: string;
  areaLabels: Record<SkulltulaArea, string>;
  doneLabel: string;
  pendingLabel: string;
}

/** Map view: the same progress bar and the same store as the List view,
 * grouped into the 7 top-level hubs for wayfinding — each hub then renders
 * one map card per fine-grained zone within it (`ZONES_BY_HUB`), not one
 * combined hub-wide map. */
export default function SkulltulaMapView({
  store,
  items,
  progressLabel,
  areaLabels,
  doneLabel,
  pendingLabel,
}: Props) {
  const checked = useHydratedStore(checklistStore(store).$checked, NO_CHECKED);
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
      {AREA_ORDER.map((area) => {
        const areaItems = items.filter((i) => i.hub === area);
        if (areaItems.length === 0) return null;
        const areaDone = areaItems.filter((i) => checked.has(i.id)).length;
        return (
          <section key={area} className="mb-10">
            <h3 className="mb-3 flex items-center justify-between font-display text-base font-semibold text-foreground">
              <span>{areaLabels[area]}</span>
              <span className="font-mono text-[11px] text-primary">
                {areaDone}/{areaItems.length}
              </span>
            </h3>
            {ZONES_BY_HUB[area].map((zoneKey) => {
              const zoneItems = areaItems.filter((i) => i.zoneKey === zoneKey);
              if (zoneItems.length === 0) return null;
              const zoneDone = zoneItems.filter((i) => checked.has(i.id)).length;
              return (
                <div key={zoneKey} className="mb-6">
                  <h4 className="mb-2 flex items-center justify-between font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>{zoneItems[0].zone}</span>
                    <span className="text-primary">
                      {zoneDone}/{zoneItems.length}
                    </span>
                  </h4>
                  <SkulltulaMap
                    store={store}
                    zoneKey={zoneKey}
                    items={zoneItems}
                    doneLabel={doneLabel}
                    pendingLabel={pendingLabel}
                  />
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
