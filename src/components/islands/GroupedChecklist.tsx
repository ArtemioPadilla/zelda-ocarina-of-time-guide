import { checklistStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';
import { useHydratedStore, NO_CHECKED } from '@/lib/use-hydrated-store';

/**
 * A plain grouped checklist (files, achievements): one checkbox per row,
 * grouped under headings, progress on top. Which persisted store it writes
 * to is chosen by its IndexedDB key (such as
 * `oot-files-done`), so the same island serves every checklist page.
 */
export interface GroupedItem {
  id: string;
  title: string;
  /** Small tag after the title (the English original, the trophy tier). */
  tag?: string;
  detail?: string;
  note?: string;
  /** Link to the thing's own page or chapter ("Ficha →"). */
  href?: string;
  hrefLabel?: string;
  /** More links after `href` (a collectible's card and its chapter). */
  links?: { href: string; label: string }[];
}

export interface Group {
  title: string;
  /** Copy under the heading (what collecting the whole group unlocks). */
  note?: string;
  items: GroupedItem[];
}

interface Props {
  store: string;
  groups: Group[];
  progressLabel: string;
  /** Hide the overall bar (a chapter page shows several small lists). */
  hideProgress?: boolean;
}

export default function GroupedChecklist({ store, groups, progressLabel, hideProgress }: Props) {
  const s = checklistStore(store);
  const checked = useHydratedStore(s.$checked, NO_CHECKED);
  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      {hideProgress ? null : <ProgressBar done={done} total={all.length} label={progressLabel} />}
      {groups.map((group) => {
        const groupDone = group.items.filter((i) => checked.has(i.id)).length;
        return (
          <section key={group.title} className="mb-6">
            <h2 className="mb-2 flex items-baseline gap-2 font-display text-sm font-semibold tracking-wide text-muted-foreground">
              {group.title}
              <span className="font-mono text-xs font-normal text-primary">
                {groupDone}/{group.items.length}
              </span>
            </h2>
            {group.note ? <p className="mb-2 text-xs text-muted-foreground">{group.note}</p> : null}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  checked={checked.has(item.id)}
                  onToggle={() => s.toggle(item.id)}
                  extra={
                    item.href || item.links?.length ? (
                      <span className="flex flex-wrap gap-x-3">
                        {[
                          ...(item.href ? [{ href: item.href, label: item.hrefLabel ?? '→' }] : []),
                          ...(item.links ?? []),
                        ].map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            className="font-mono text-[11px] text-primary underline decoration-dotted"
                          >
                            {l.label}
                          </a>
                        ))}
                      </span>
                    ) : undefined
                  }
                >
                  <span className="font-medium">{item.title}</span>
                  {item.tag ? (
                    <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                      {item.tag}
                    </span>
                  ) : null}
                  {item.detail ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  ) : null}
                  {item.note ? (
                    <span className="mt-0.5 block text-xs text-primary">{item.note}</span>
                  ) : null}
                </ChecklistItem>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
