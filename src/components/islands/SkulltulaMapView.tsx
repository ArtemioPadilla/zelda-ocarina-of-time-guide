import { useStore } from '@nanostores/react';
import { skulltulasStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import SkulltulaMap from './SkulltulaMap';
import { AREA_ORDER, type SkulltulaArea } from '@/lib/skulltula-map-layout';

interface MapSkulltula {
  id: string;
  number: number;
  zone: string;
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
 * view (SkulltulaChecklist) — grouped into the 7 top-level hub maps instead
 * of the 31 fine-grained zone headings. */
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
          <div key={area} className="mb-8">
            <h3 className="mb-2 flex items-center justify-between font-display text-sm font-semibold text-muted-foreground">
              <span>{areaLabels[area]}</span>
              <span className="font-mono text-[10px] text-primary">
                {areaDone}/{areaItems.length}
              </span>
            </h3>
            <SkulltulaMap area={area} items={areaItems} doneLabel={doneLabel} pendingLabel={pendingLabel} />
          </div>
        );
      })}
    </div>
  );
}
