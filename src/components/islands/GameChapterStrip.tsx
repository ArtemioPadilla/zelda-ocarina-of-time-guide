import { checklistStore, currentChapterStore } from '@/stores/checklist';
import { useHydratedStore, NO_CHECKED } from '@/lib/use-hydrated-store';
import { MiniBar } from './MiniBar';

interface ChapterOption {
  id: string;
  number: string;
  title: string;
}

export interface StripTracker {
  /** IndexedDB key of the checklist (`oot-collectibles-done`). */
  storeKey: string;
  total: number;
  label: string;
  short?: string;
}

interface Props {
  game: string;
  chapters: ChapterOption[];
  /** Localised `/<game>/chapters/` prefix (base included). */
  chaptersHref: string;
  pickHref: string;
  pickLabel: string;
  trackers: StripTracker[];
  ariaLabel: string;
}

function Tracker({ t }: { t: StripTracker }) {
  const done = useHydratedStore(checklistStore(t.storeKey).$checked, NO_CHECKED);
  return <MiniBar done={done.size} total={t.total} label={t.label} short={t.short} />;
}

/** The engine games' "where am I" line: current chapter + their trackers. */
export default function GameChapterStrip({
  game,
  chapters,
  chaptersHref,
  pickHref,
  pickLabel,
  trackers,
  ariaLabel,
}: Props) {
  const current = useHydratedStore(currentChapterStore(game).$current, null);
  const chapter = current ? chapters.find((c) => c.id === current) : undefined;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="flex items-center gap-3 overflow-x-auto px-4 py-1.5 font-mono text-[11px] text-muted-foreground"
    >
      {chapter ? (
        <a
          href={`${chaptersHref}${chapter.id}/`}
          className="shrink-0 whitespace-nowrap font-display text-[13px] font-semibold text-foreground hover:text-primary"
        >
          ▶ {chapter.number} {chapter.title}
        </a>
      ) : (
        <a
          href={pickHref}
          className="shrink-0 whitespace-nowrap underline decoration-dotted hover:text-primary"
        >
          {pickLabel}
        </a>
      )}
      <span className="ml-auto flex shrink-0 items-center gap-3">
        {trackers.map((t) => (
          <Tracker key={t.storeKey} t={t} />
        ))}
      </span>
    </div>
  );
}
