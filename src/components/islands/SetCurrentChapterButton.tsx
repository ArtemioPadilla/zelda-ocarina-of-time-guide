import { currentChapterStore } from '@/stores/checklist';
import { useHydratedStore } from '@/lib/use-hydrated-store';

interface Props {
  chapterId: string;
  label: string;
  currentLabel: string;
  /** Whose current chapter this sets. */
  game: string;
}

export default function SetCurrentChapterButton({ chapterId, label, currentLabel, game }: Props) {
  const store = currentChapterStore(game);
  const current = useHydratedStore(store.$current, null);
  const isCurrent = current === chapterId;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isCurrent) store.set(chapterId);
      }}
      // aria-disabled (not the `disabled` attribute): "current chapter" is
      // persistent state, not a momentarily-inert control, and `disabled`
      // removes the button from the tab order and drops keyboard focus to
      // <body> the instant it's set — right after the user just activated
      // it. aria-disabled keeps it focusable; the click handler no-ops instead.
      aria-disabled={isCurrent}
      className="rounded-md border border-primary/50 px-3 py-1.5 font-mono text-xs text-primary transition-colors hover:bg-primary/10 aria-disabled:cursor-default aria-disabled:bg-primary/10"
    >
      {isCurrent ? currentLabel : label}
    </button>
  );
}
