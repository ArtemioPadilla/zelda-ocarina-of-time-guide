import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchEntry, SearchKind } from '@/lib/game-search-index';

/**
 * Header search: a button (and ⌘K / Ctrl+K) opens a palette that filters
 * the build-time index of every entity in the guide (src/lib/game-search-index.ts)
 * and navigates to the card or row that renders it. The index is fetched
 * once, on first open, and lives in module scope after that; it is in the
 * PWA precache, so the search works offline.
 */
export interface SearchLabels {
  open: string;
  placeholder: string;
  empty: string;
  hint: string;
  close: string;
}

interface Props {
  indexHref: string;
  labels: SearchLabels;
}

const KIND_STYLE: Partial<Record<SearchKind, string>> = {
  collectible: 'text-primary',
  weapon: 'text-accent-cyan',
  gear: 'text-accent-cyan',
  boss: 'text-destructive',
  enemy: 'text-destructive',
  chapter: 'text-foreground',
};

let cache: SearchEntry[] | null = null;
let inflight: Promise<SearchEntry[]> | null = null;
function loadIndex(href: string): Promise<SearchEntry[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch(href)
    .then((r) => r.json() as Promise<SearchEntry[]>)
    .then((rows) => (cache = rows));
  return inflight;
}

/** Lowercase, accents stripped, so "lampara" finds "Lámpara" and vice versa. */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Rank: title starts with the query, then title contains it, then the
 * subtitle or the hidden text does. Every word of the query must hit. */
export function search(rows: SearchEntry[], query: string, limit = 12): SearchEntry[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { row: SearchEntry; score: number }[] = [];
  for (const row of rows) {
    const title = normalize(row.t);
    const rest = normalize(`${row.s} ${row.x ?? ''}`);
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (title.startsWith(w)) score += 3;
      else if (title.includes(w)) score += 2;
      else if (rest.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ row, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.row.t.localeCompare(b.row.t))
    .slice(0, limit)
    .map((s) => s.row);
}

export default function SearchBox({ indexHref, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<SearchEntry[]>(cache ?? []);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Decided after mount: the server renders "Ctrl", and rendering "⌘" during
  // hydration on a Mac would be a text mismatch.
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform ?? ''));
  }, []);

  const openBox = useCallback(() => {
    setOpen(true);
    loadIndex(indexHref)
      .then(setRows)
      .catch(() => {});
  }, [indexHref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) setOpen(false);
        else openBox();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openBox]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const results = useMemo(() => search(rows, query), [rows, query]);
  useEffect(() => setCursor(0), [query]);

  const go = (row: SearchEntry | undefined) => {
    if (!row) return;
    setOpen(false);
    window.location.assign(row.h);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[cursor]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openBox}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only sm:not-sr-only sm:font-mono sm:text-xs sm:text-muted-foreground">
          {labels.open}
        </span>
        <kbd
          className="hidden rounded border border-border px-1 font-mono text-[10px] text-muted-foreground sm:inline"
          aria-hidden="true"
        >
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 pt-[10vh] backdrop-blur-[2px] sm:pt-[15vh]">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.open}
            className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={results[cursor] ? `search-opt-${cursor}` : undefined}
                aria-autocomplete="list"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder={labels.placeholder}
                className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground hover:text-primary"
              >
                Esc
              </button>
            </div>
            <ul
              id="search-results"
              role="listbox"
              className="max-h-[60vh] overflow-y-auto py-1"
              onMouseDown={(e) => e.preventDefault()}
            >
              {results.map((r, i) => (
                <li
                  key={r.h + r.t}
                  id={`search-opt-${i}`}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                >
                  <a
                    href={r.h}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r);
                    }}
                    className={`flex items-baseline gap-3 px-4 py-2 text-sm ${
                      i === cursor ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className={`font-medium ${KIND_STYLE[r.k] ?? 'text-foreground'}`}>
                      {r.t}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {r.s}
                    </span>
                  </a>
                </li>
              ))}
              {query && results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground">{labels.empty}</li>
              ) : null}
            </ul>
            <p className="border-t border-border px-4 py-1.5 font-mono text-[10px] text-muted-foreground">
              ↑↓ {labels.hint}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
