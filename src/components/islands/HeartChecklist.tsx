import { useStore } from '@nanostores/react';
import { heartsStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';

interface HeartItem {
  id: string;
  name: string;
  detail: string;
  missable?: boolean;
}

interface Props {
  items: HeartItem[];
  progressLabel: string;
  missableLabel: string;
}

export default function HeartChecklist({ items, progressLabel, missableLabel }: Props) {
  const checked = useStore(heartsStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <ChecklistItem key={item.id} checked={isChecked} onToggle={() => heartsStore.toggle(item.id)}>
              <span className="font-medium text-foreground">{item.name}</span>
              {item.missable ? <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wide text-destructive">{missableLabel}</span> : null}
              <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
            </ChecklistItem>
          );
        })}
      </ul>
    </div>
  );
}
