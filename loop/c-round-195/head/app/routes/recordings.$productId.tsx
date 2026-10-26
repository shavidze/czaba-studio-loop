import type { MetaFunction } from '@remix-run/node';
import { Link, useParams } from '@remix-run/react';
import { ArrowLeft, AudioLines, Lock, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import { RecordingCatalogRow } from '~/components/recordings/RecordingCatalogRow';
import { SfxQuickEdit } from '~/components/recordings/SfxQuickEdit';
import { Button, EmptyState } from '~/components/ui';
import { useAudio } from '~/contexts/AudioContext';
import { useAuth } from '~/hooks/useAuth';
import { type RecordingStreamGrant, useRecordingPlayer } from '~/hooks/useRecordingPlayer';
import { ApiError, apiClient, type ProductRecordingCatalog } from '~/services/api/client';

export const meta: MetaFunction = () => [
  { title: 'Recordings | CZABA' },
  { name: 'robots', content: 'noindex' },
];

type RecordingCatalogLoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; catalog: ProductRecordingCatalog }
  | { kind: 'denied' }
  | { kind: 'not-found' }
  | { kind: 'error' };

function parseCatalogProductId(value: string | undefined): number | null {
  if (!value || !/^\d{1,9}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

function RecordingCatalogSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <li key={index} className="rounded-xl border border-outline/60 bg-surface/50 p-5">
          <div className="flex items-start gap-4">
            <div className="skeleton-shimmer h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-5 w-48 rounded" />
              <div className="skeleton-shimmer h-3 w-32 rounded" />
              <div className="skeleton-shimmer h-2 w-full rounded" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecordingCatalogContent() {
  const { productId: productIdParam } = useParams();
  const productId = parseCatalogProductId(productIdParam);
  const { user } = useAuth();
  const { closePlayer } = useAudio();
  const [loadState, setLoadState] = useState<RecordingCatalogLoadState>({ kind: 'loading' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!productId) {
      setLoadState({ kind: 'not-found' });
      return;
    }
    if (!user?.accessToken) return;
    let cancelled = false;
    setLoadState({ kind: 'loading' });
    apiClient.setAccessToken(user.accessToken);
    apiClient
      .getProductRecordingCatalog(productId)
      .then((catalog) => {
        if (!cancelled) setLoadState({ kind: 'ready', catalog });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 403) setLoadState({ kind: 'denied' });
        else if (error instanceof ApiError && error.status === 404)
          setLoadState({ kind: 'not-found' });
        else setLoadState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [productId, user?.accessToken, reloadKey]);

  const requestStreamGrant = useCallback(
    async (recordingId: number): Promise<RecordingStreamGrant> => {
      const accessToken = apiClient.getAccessToken() ?? user?.accessToken;
      if (!productId || !accessToken)
        throw new Error('Please sign in to listen to this recording.');
      const requestGrant = (token: string) =>
        fetch(`/api/recording-stream?product=${productId}&recording=${recordingId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: AbortSignal.timeout(15000),
        });
      let response = await requestGrant(accessToken);
      if (response.status === 401) {
        await apiClient.getProductRecordingCatalog(productId);
        const refreshedToken = apiClient.getAccessToken();
        if (refreshedToken) response = await requestGrant(refreshedToken);
      }
      const body: { streamUrl?: string; expiresAt?: number; error?: string } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok || !body.streamUrl || !body.expiresAt) {
        throw new Error(body.error || 'Unable to load this recording. Please try again.');
      }
      return { streamUrl: body.streamUrl, expiresAt: body.expiresAt };
    },
    [productId, user?.accessToken],
  );

  const handlePlaybackStart = useCallback(() => {
    setEditingId(null);
    closePlayer();
  }, [closePlayer]);

  const {
    state: player,
    toggleRecordingPlayback,
    seekRecording,
  } = useRecordingPlayer({
    requestStreamGrant,
    onPlaybackStart: handlePlaybackStart,
  });

  if (loadState.kind === 'denied') {
    return (
      <EmptyState
        icon={Lock}
        title="Collection ownership required"
        description="These recordings are available to owners of this collection."
        actionLabel="Go to Downloads"
        actionHref="/account/downloads"
        secondaryActionLabel="Browse the store"
        secondaryActionHref="/store"
      />
    );
  }
  if (loadState.kind === 'not-found') {
    return (
      <EmptyState
        icon={AudioLines}
        title="Collection not found"
        description="We couldn't find this collection."
        actionLabel="Go to Downloads"
        actionHref="/account/downloads"
      />
    );
  }
  if (loadState.kind === 'error') {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted">We couldn't load the recordings. Please try again.</p>
        <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }
  if (loadState.kind === 'loading') {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading recordings</span>
        <RecordingCatalogSkeleton />
      </div>
    );
  }

  const { catalog } = loadState;
  return (
    <>
      <header className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand mb-2">
          {catalog.licenseType} · {catalog.recordings.length} recordings
        </p>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
          {catalog.productTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Listen to any recording without downloading the archive. Playback uses a compressed
          listening copy; the original files are in your download.
        </p>
      </header>
      {catalog.licenseType.toLowerCase() === 'universal' && catalog.recordings.length > 0 && (
        <Link
          to={`/scenes/${catalog.productId}`}
          className="mb-6 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-background hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand"
        >
          Create a scene
        </Link>
      )}
      {editingId &&
        productId &&
        user?.accessToken &&
        catalog.licenseType.toLowerCase() === 'universal' &&
        catalog.recordings
          .filter((recording) => recording.id === editingId)
          .map((recording) => (
            <SfxQuickEdit
              key={recording.id}
              productId={productId}
              recording={recording}
              token={user.accessToken}
              onClose={() => setEditingId(null)}
            />
          ))}
      {catalog.recordings.length === 0 ? (
        <EmptyState
          icon={AudioLines}
          title="No recordings yet"
          description="Recordings for this collection haven't been added yet. Your download is still available."
          actionLabel="Go to Downloads"
          actionHref="/account/downloads"
        />
      ) : (
        <ul className="space-y-3">
          {catalog.recordings.map((recording) => (
            <RecordingCatalogRow
              key={recording.id}
              recording={recording}
              isActive={player.activeRecordingId === recording.id}
              status={player.status}
              currentTime={player.currentTime}
              duration={player.duration}
              errorMessage={player.errorMessage}
              onTogglePlayback={toggleRecordingPlayback}
              onSeek={seekRecording}
              onQuickEdit={
                catalog.licenseType.toLowerCase() === 'universal'
                  ? (id) => {
                      if (player.status === 'playing' || player.status === 'loading')
                        toggleRecordingPlayback(player.activeRecordingId ?? id);
                      closePlayer();
                      setEditingId(id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}

export default function RecordingCatalogRoute() {
  const { productId } = useParams();
  const { user } = useAuth();
  return (
    <RequireAuth>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <Link
            to="/account/downloads"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Downloads</span>
          </Link>
          <RecordingCatalogContent key={`${productId}:${user?.id}`} />
        </div>
      </main>
    </RequireAuth>
  );
}
