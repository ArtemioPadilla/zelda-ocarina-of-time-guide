import { useEffect } from 'react';
import {
  $offline,
  INITIAL_OFFLINE,
  initOffline,
  downloadOffline,
  deleteOffline,
  cancelOffline,
} from '@/stores/offline-images';
import { useHydratedStore } from '@/lib/use-hydrated-store';

/**
 * "Offline" panel: per game (and for all of them) how many pictures the
 * service worker only caches on first view, how much they weigh and how
 * many are already saved — with a button to fetch them all ahead of time
 * into that same cache, and one to delete them. State lives in the
 * `$offline` Nano Store, shared by every panel on the page.
 */
export interface OfflineRow {
  /** Game id, or `all`. */
  id: string;
  label: string;
  count: number;
  bytes: number;
}

export interface OfflineLabels {
  images: string;
  saved: string;
  download: string;
  resume: string;
  delete: string;
  cancel: string;
  downloading: string;
  failed: string;
  storage: string;
  of: string;
  unsupported: string;
  persistDenied: string;
}

interface Props {
  endpoint: string;
  cacheName: string;
  rows: OfflineRow[];
  labels: OfflineLabels;
  locale: 'es' | 'en';
}

function size(bytes: number, locale: string): string {
  const [unit, div] =
    bytes >= 1024 ** 3 ? ['GB', 1024 ** 3] : bytes >= 1024 ** 2 ? ['MB', 1024 ** 2] : ['KB', 1024];
  const n = bytes / div;
  return `${n.toLocaleString(locale, { maximumFractionDigits: n < 10 ? 1 : 0 })} ${unit}`;
}

const button =
  'rounded-md border px-3 py-1.5 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-40';

export default function OfflineImages({ endpoint, cacheName, rows, labels, locale }: Props) {
  const s = useHydratedStore($offline, INITIAL_OFFLINE);
  useEffect(() => {
    void initOffline(endpoint, cacheName);
  }, [endpoint, cacheName]);

  const ready = s.status === 'ready';
  const busy = s.job?.running ?? false;
  const savedOf = (id: string) =>
    id === 'all' ? Object.values(s.saved).reduce((a, b) => a + b, 0) : (s.saved[id] ?? 0);

  return (
    <div className="grid gap-3">
      {s.status === 'unsupported' ? (
        <p className="text-sm text-muted-foreground">{labels.unsupported}</p>
      ) : null}
      {rows.map((r) => {
        const saved = savedOf(r.id);
        const job = s.job?.scope === r.id ? s.job : null;
        const all = ready && saved >= r.count;
        return (
          <div key={r.id} className="panel p-3 sm:p-4" data-offline-row={r.id}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-foreground">{r.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {r.count} {labels.images} · {size(r.bytes, locale)}
                  {ready ? (
                    <span className={all ? ' text-primary' : ''}>
                      {' '}
                      · {saved}/{r.count} {labels.saved}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {job?.running ? (
                  <button
                    type="button"
                    className={`${button} border-border text-muted-foreground hover:text-foreground`}
                    onClick={() => cancelOffline()}
                  >
                    {labels.cancel}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${button} border-primary/50 text-primary hover:bg-primary/10`}
                    disabled={!ready || busy || all}
                    onClick={() => void downloadOffline(r.id)}
                  >
                    {saved > 0 && !all ? labels.resume : labels.download}
                  </button>
                )}
                <button
                  type="button"
                  className={`${button} border-border text-muted-foreground hover:text-destructive`}
                  disabled={!ready || busy || saved === 0}
                  onClick={() => void deleteOffline(r.id)}
                >
                  {labels.delete}
                </button>
              </div>
            </div>
            {job ? (
              <div className="mt-3">
                <div
                  className="h-2 overflow-hidden rounded-full border border-border bg-muted"
                  role="progressbar"
                  aria-valuenow={job.done}
                  aria-valuemin={0}
                  aria-valuemax={job.total}
                  aria-label={`${r.label}: ${labels.downloading}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-300"
                    style={{
                      width: `${job.total ? Math.round((job.done / job.total) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground" aria-live="polite">
                  {job.running ? `${labels.downloading} ` : ''}
                  {job.done}/{job.total}
                  {job.failed > 0 ? (
                    <span className="text-destructive">
                      {' '}
                      · {job.failed} {labels.failed}
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
      {ready && s.usage !== undefined ? (
        <p className="font-mono text-[11px] text-muted-foreground">
          {labels.storage}: {size(s.usage, locale)}
          {s.quota ? ` ${labels.of} ${size(s.quota, locale)}` : ''}
        </p>
      ) : null}
      {s.persisted === false ? (
        <p className="text-xs text-muted-foreground">{labels.persistDenied}</p>
      ) : null}
    </div>
  );
}
