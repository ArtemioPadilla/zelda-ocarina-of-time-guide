import { checklistStore, currentChapterStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import { useHydratedStore, NO_CHECKED } from '@/lib/use-hydrated-store';

interface ChapterOption {
  id: string;
  number: string;
  title: string;
}

export interface ProgressTracker {
  storeKey: string;
  total: number;
  label: string;
}

interface Props {
  game: string;
  trackers: ProgressTracker[];
  chapters: ChapterOption[];
  chapterLabel: string;
  resetLabel: string;
  resetConfirmMessage: string;
}

function Tracker({ t }: { t: ProgressTracker }) {
  const checked = useHydratedStore(checklistStore(t.storeKey).$checked, NO_CHECKED);
  return (
    <div>
      <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
        {t.label}
      </p>
      <ProgressBar done={checked.size} total={t.total} label={t.label} />
    </div>
  );
}

/** An engine game's home card: its trackers and the current-chapter picker. */
export default function GameProgress({
  game,
  trackers,
  chapters,
  chapterLabel,
  resetLabel,
  resetConfirmMessage,
}: Props) {
  const current = currentChapterStore(game);
  const chapter = useHydratedStore(current.$current, null);

  function handleReset() {
    if (!window.confirm(resetConfirmMessage)) return;
    for (const t of trackers) checklistStore(t.storeKey).reset();
    current.reset();
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {trackers.map((t) => (
          <Tracker key={t.storeKey} t={t} />
        ))}
      </div>
      <div className="mt-1">
        <label
          htmlFor="current-chapter"
          className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground"
        >
          {chapterLabel}
        </label>
        <select
          id="current-chapter"
          value={chapter ?? ''}
          onChange={(e) => current.set(e.target.value)}
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
