import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '~/components/ui/Button';
import type { RecordingPlayerState } from '~/hooks/useRecordingPlayer';
import type { ProductRecordingCatalog } from '~/services/api/client';

interface Props {
  catalogs: ProductRecordingCatalog[];
  accountId: string;
  position: number;
  disabled: boolean;
  preview: RecordingPlayerState;
  onPreview: (id: number) => void;
  onStopPreview: () => void;
  onAdd: (id: number) => void;
}

export function SfxSoundLibrary({
  catalogs,
  accountId,
  position,
  disabled,
  preview,
  onPreview,
  onStopPreview,
  onAdd,
}: Props) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const reduceMotion = useReducedMotion();
  const storageKey = `czaba:sfx-favorites:${accountId}`;
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (Array.isArray(saved)) {
        setFavorites(saved.filter((id): id is number => Number.isSafeInteger(id) && id > 0));
      }
    } catch {
      setStorageError('Favorites cannot be saved in this browser.');
    }
    setFavoritesReady(true);
  }, [storageKey]);
  useEffect(() => {
    if (!favoritesReady) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {
      setStorageError('Favorites cannot be saved in this browser.');
    }
  }, [favorites, favoritesReady, storageKey]);
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return catalogs
      .filter((catalog) => collection === 'all' || String(catalog.productId) === collection)
      .flatMap((catalog) => catalog.recordings.map((recording) => ({ catalog, recording })))
      .filter(
        ({ catalog, recording }) =>
          (!favoritesOnly || favorites.includes(recording.id)) &&
          `${recording.title} ${catalog.tags ?? ''}`.toLocaleLowerCase().includes(search),
      );
  }, [catalogs, collection, query, favoritesOnly, favorites]);
  const inputClass =
    'min-h-11 w-full rounded-lg border border-outline bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-brand';
  return (
    <section
      aria-label="Your sound library"
      className="flex h-96 flex-col rounded-xl border border-outline bg-surface p-4 [overflow-anchor:none]"
    >
      <header className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="font-serif text-lg text-foreground">Your sound library</h2>
        <Button
          variant="ghost"
          onClick={() => {
            onStopPreview();
            setOpen(!open);
          }}
          aria-expanded={open}
          aria-controls="sfx-library-content"
        >
          {open ? 'Close library' : 'Open library'}
        </Button>
      </header>
      <div id="sfx-library-content" hidden={!open} className="min-h-0 flex-1">
        <motion.div
          className="flex h-full flex-col"
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <label className="sr-only" htmlFor="sfx-library-search">
            Search sounds
          </label>
          <input
            id="sfx-library-search"
            className={`${inputClass} mt-3`}
            type="search"
            placeholder="Search sounds or tags"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <div className="mt-2 flex shrink-0 items-center gap-2">
            <label className="sr-only" htmlFor="sfx-library-collection">
              Collection filter
            </label>
            <select
              id="sfx-library-collection"
              className={`${inputClass} min-w-0 flex-1`}
              value={collection}
              onChange={(event) => setCollection(event.currentTarget.value)}
            >
              <option value="all">All collections</option>
              {catalogs.map((catalog) => (
                <option key={catalog.productId} value={catalog.productId}>
                  {catalog.productTitle}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              Favorites
            </Button>
          </div>
          <output aria-live="polite" className="my-2 block min-h-5 shrink-0 text-xs text-muted">
            {results.length} sounds · Add at {position.toFixed(3)}s
          </output>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {results.map(({ catalog, recording }) => {
              const active =
                preview.activeRecordingId === recording.id &&
                (preview.status === 'playing' || preview.status === 'loading');
              const favorite = favorites.includes(recording.id);
              return (
                <article key={recording.id} className="border-t border-outline py-3">
                  <h3 className="break-words text-sm text-foreground">{recording.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {catalog.productTitle} · {(recording.durationMs / 1000).toFixed(1)}s
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      aria-label={`${active ? 'Stop preview' : 'Preview'} ${recording.title}`}
                      onClick={() => (active ? onStopPreview() : onPreview(recording.id))}
                    >
                      {active ? 'Stop' : 'Preview'}
                    </Button>
                    <Button
                      variant="ghost"
                      className={favorite ? 'text-accent' : ''}
                      aria-pressed={favorite}
                      aria-label={`Favorite ${recording.title}`}
                      onClick={() =>
                        setFavorites((current) =>
                          favorite
                            ? current.filter((id) => id !== recording.id)
                            : [...current, recording.id],
                        )
                      }
                    >
                      {favorite ? '★ Saved' : '☆ Favorite'}
                    </Button>
                    <Button
                      disabled={disabled}
                      aria-label={`Add ${recording.title} at current position`}
                      onClick={() => onAdd(recording.id)}
                    >
                      Add at position
                    </Button>
                  </div>
                </article>
              );
            })}
            {!results.length && (
              <p className="py-6 text-sm text-muted">
                No sounds match. Try another name, tag or collection.
              </p>
            )}
          </div>
          <output aria-live="polite" className="mt-2 min-h-5 shrink-0 text-xs text-muted">
            {preview.errorMessage ||
              storageError ||
              'Favorites stay in this browser for your account.'}
          </output>
        </motion.div>
      </div>
      {!open && (
        <p className="mt-6 text-sm text-muted">
          Your sounds are ready. Search and collection filters are preserved.
        </p>
      )}
    </section>
  );
}
