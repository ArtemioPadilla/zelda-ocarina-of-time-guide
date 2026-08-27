import { useStore } from '@nanostores/react';
import { skulltulasStore, heartsStore, $currentChapter, setCurrentChapter, resetCurrentChapter } from '@/stores/checklist';
import ProgressBar from './ProgressBar';

interface ChapterOption {
  id: string;
  number: string;
  title: string;
}

interface Props {
  totalSkulltulas: number;
  totalHearts: number;
  chapters: ChapterOption[];
  skulltulasLabel: string;
  heartsLabel: string;
  chapterLabel: string;
  resetLabel: string;
  resetConfirmMessage: string;
}

export default function HomeProgress({
  totalSkulltulas,
  totalHearts,
  chapters,
  skulltulasLabel,
  heartsLabel,
  chapterLabel,
  resetLabel,
  resetConfirmMessage,
}: Props) {
  const skulltulasChecked = useStore(skulltulasStore.$checked);
  const heartsChecked = useStore(heartsStore.$checked);
  const current = useStore($currentChapter);

  function handleReset() {
    if (!window.confirm(resetConfirmMessage)) return;
    skulltulasStore.reset();
    heartsStore.reset();
    resetCurrentChapter();
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">{skulltulasLabel}</p>
          <ProgressBar done={skulltulasChecked.size} total={totalSkulltulas} label={skulltulasLabel} />
        </div>
        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">{heartsLabel}</p>
          <ProgressBar done={heartsChecked.size} total={totalHearts} label={heartsLabel} />
        </div>
      </div>
      <div className="mt-1">
        <label htmlFor="current-chapter" className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {chapterLabel}
        </label>
        <select
          id="current-chapter"
          value={current ?? ''}
          onChange={(e) => setCurrentChapter(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="" disabled>
            —
          </option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.number} — {c.title}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="mt-4 font-mono text-xs text-muted-foreground underline decoration-dotted transition-colors hover:text-destructive"
      >
        {resetLabel}
      </button>
    </div>
  );
}
