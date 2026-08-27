import { useStore } from '@nanostores/react';
import { skulltulasStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';

interface SkulltulaItem {
  id: string;
  number: number;
  zone: string;
  location: string;
  note?: string;
}

interface Props {
  items: SkulltulaItem[];
  progressLabel: string;
}

export default function SkulltulaChecklist({ items, progressLabel }: Props) {
  const checked = useStore(skulltulasStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;

  const zones = [...new Set(items.map((i) => i.zone))];

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
      {zones.map((zone) => (
        <div key={zone} className="mb-6">
          <h2 className="mb-2 font-display text-sm font-semibold tracking-wide text-muted-foreground">
            {zone}
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items
              .filter((i) => i.zone === zone)
              .map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <ChecklistItem key={item.id} checked={isChecked} onToggle={() => skulltulasStore.toggle(item.id)}>
                    <span className="mr-1.5 font-mono text-xs text-primary">#{item.number}</span>
                    {item.location}
                    {item.note ? <span className="mt-0.5 block text-xs text-muted-foreground">{item.note}</span> : null}
                  </ChecklistItem>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}
