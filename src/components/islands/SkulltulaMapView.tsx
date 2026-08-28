import { useStore } from '@nanostores/react';
import { skulltulasStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import SkulltulaMap from './SkulltulaMap';
import { AREA_ORDER, ZONES_BY_HUB, type SkulltulaArea } from '@/lib/skulltula-map-layout';

interface MapSkulltula {
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
  items: MapSkulltula[];
  progressLabel: string;
  areaLabels: Record<SkulltulaArea, string>;
  doneLabel: string;
  pendingLabel: string;
}

/** Map view: same shared progress bar + same `items` array as the List
 * view (SkulltulaChecklist), grouped into the 7 top-level hubs for
 * wayfinding — each hub then renders one map card per fine-grained zone
 * within it (`ZONES_BY_HUB`), not one combined hub-wide map. */
export default function SkulltulaMapView({ items, progressLabel, areaLabels, doneLabel, pendingLabel }: Props) {
  const checked = useStore(skulltulasStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
      {AREA_ORDER.map((area) => {
        const areaItems = items.filter((i) => i.area === area);
        if (areaItems.length === 0) return null;
        const areaDone = areaItems.filter((i) => checked.has(i.id)).length;
        return (
          <div key={area} className="mb-10">
            <h3 className="mb-3 flex items-center justify-between font-display text-sm font-semibold text-muted-foreground">
              <span>{areaLabels[area]}</span>
              <span className="font-mono text-[10px] text-primary">
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
                  <SkulltulaMap zoneKey={zoneKey} items={zoneItems} doneLabel={doneLabel} pendingLabel={pendingLabel} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
