import type { ReactNode } from 'react';

interface Props {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
  /**
   * Content rendered inside the row but OUTSIDE the <label> — anything
   * interactive on its own (the "see location" <details>) must live here,
   * otherwise every click on it would also activate the label and flip the
   * checkbox.
   */
  extra?: ReactNode;
  /** Anchor for deep links (the global search lands here). */
  id?: string;
}

/** Shared `<li><label><input type=checkbox>…</label></li>` shell of every checklist row. */
export default function ChecklistItem({ checked, onToggle, children, extra, id }: Props) {
  return (
    <li id={id} className="panel px-3 py-2.5 text-sm hover:border-primary/60">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
        />
        <span
          className={
            checked ? 'text-muted-foreground line-through decoration-muted-foreground/60' : ''
          }
        >
          {children}
        </span>
      </label>
      {extra ? <div className="pl-7">{extra}</div> : null}
    </li>
  );
}
