import type { ReactNode } from 'react';

interface Props {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Shared `<li><label><input type=checkbox>…</label></li>` shell — the
 * markup SkulltulaChecklist and HeartChecklist have in common. */
export default function ChecklistItem({ checked, onToggle, children }: Props) {
  return (
    <li>
      <label className="panel flex cursor-pointer items-start gap-3 px-3 py-2.5 text-sm hover:border-primary/60">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className={checked ? 'text-muted-foreground line-through decoration-muted-foreground/60' : ''}>
          {children}
        </span>
      </label>
    </li>
  );
}
