import type { MetaFunction } from '@remix-run/node';
import { Link, useParams } from '@remix-run/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import { SfxSceneBuilder } from '~/components/recordings/SfxSceneBuilder';
import { Button } from '~/components/ui/Button';
import { useAudio } from '~/contexts/AudioContext';
import { useAuth } from '~/hooks/useAuth';
import { ApiError, apiClient, type ProductRecordingCatalog } from '~/services/api/client';

export const meta: MetaFunction = () => [
  { title: 'Scene Builder | CZABA' },
  { name: 'robots', content: 'noindex' },
];

function SceneContent() {
  const { productId: rawId } = useParams();
  const { user } = useAuth();
  const userId = user?.id;
  const { closePlayer } = useAudio();
  const closePlayerRef = useRef(closePlayer);
  closePlayerRef.current = closePlayer;
  const [catalog, setCatalog] = useState<ProductRecordingCatalog | null>(null);
  const [library, setLibrary] = useState<ProductRecordingCatalog[]>([]);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryDelay, setRetryDelay] = useState(0);
  useEffect(() => {
    if (!retryDelay) return;
    const timer = window.setTimeout(
      () => setRetryDelay((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [retryDelay]);
  useEffect(() => {
    if (user?.accessToken) apiClient.setAccessToken(user.accessToken);
  }, [user?.accessToken]);
  useEffect(() => {
    let cancelled = false;
    setCatalog(null);
    setError('');
    closePlayerRef.current();
    if (!userId || !rawId || !/^[1-9]\d{0,8}$/.test(rawId)) {
      setError('Please sign in and open a valid collection.');
      return;
    }
    Promise.all([apiClient.getProductRecordingCatalog(Number(rawId)), apiClient.getSfxLibrary()])
      .then(([result, ownedCatalogs]) => {
        if (cancelled) return;
        if (result.licenseType.toLowerCase() !== 'universal') {
          setError('Scene Builder is available to owners of Sound Effects collections.');
          return;
        }
        setLibrary(ownedCatalogs);
        setCatalog(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          if (reason instanceof ApiError && reason.status === 429) {
            setError(
              'Your collection received too many requests. Please wait a moment, then retry.',
            );
            setRetryDelay(15);
            return;
          }
          setError(reason instanceof Error ? reason.message : 'Unable to open this collection.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [rawId, userId, retry]);
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to={`/recordings/${rawId}`}
          className="mb-6 inline-flex min-h-11 items-center text-sm text-muted hover:text-brand"
        >
          ← Collection recordings
        </Link>
        {error ? (
          <SceneLoadingState
            error={error}
            retryDelay={retryDelay}
            onRetry={() => setRetry((value) => value + 1)}
          />
        ) : catalog && user ? (
          <SfxSceneBuilder
            key={`${user.id}:${catalog.productId}`}
            catalog={catalog}
            library={library}
            accountId={String(user.id)}
            token={user.accessToken}
            onPlaybackStart={closePlayer}
          />
        ) : (
          <SceneLoadingState />
        )}
      </div>
    </main>
  );
}

function SceneLoadingState({
  error,
  retryDelay = 0,
  onRetry,
}: {
  error?: string;
  retryDelay?: number;
  onRetry?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <section aria-label="Preparing Scene Builder" className="space-y-6 [overflow-anchor:none]">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand">
          Sound Effects · Scene Builder
        </p>
        <h1 className="font-serif text-3xl text-foreground">
          {error ? 'Your scene workspace' : 'Preparing your scene'}
        </h1>
        <output className="block text-sm text-muted">
          {error ? 'Collection access could not be checked.' : 'Checking your collection access…'}
        </output>
      </header>
      <div className="h-24" aria-hidden="true" />
      <div className="rounded-xl border border-outline bg-surface p-4 sm:p-6">
        <div className="mb-4 h-11 w-32 rounded-lg bg-background" aria-hidden="true" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <div className="relative flex aspect-video items-center justify-center rounded-lg bg-background">
              {error ? (
                <div className="absolute inset-0 overflow-y-auto p-4 text-center">
                  <div className="mx-auto max-w-sm space-y-4">
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                    <Button variant="secondary" disabled={retryDelay > 0} onClick={onRetry}>
                      {retryDelay > 0 ? `Retry in ${retryDelay}s` : 'Retry'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-16 items-center gap-2" aria-hidden="true">
                  {['h-3', 'h-5', 'h-8', 'h-12', 'h-8', 'h-5', 'h-3'].map((height, index) => (
                    <motion.span
                      key={`${index}-${height}`}
                      className={`w-1 rounded-full bg-brand ${height}`}
                      initial={false}
                      animate={{
                        opacity: reduceMotion ? 0.6 : [0.25, 0.8, 0.25],
                        scaleY: reduceMotion ? 1 : [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: reduceMotion ? 0 : Infinity,
                        delay: index * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 h-10" />
          </div>
          <div
            aria-hidden="true"
            className="h-96 space-y-4 rounded-lg border border-outline bg-background p-4"
          >
            <div className="h-11 rounded-lg bg-surface" />
            <div className="h-5 w-3/4 rounded bg-surface" />
            <div className="h-11 rounded-lg bg-surface" />
            <div className="h-5 w-1/2 rounded bg-surface" />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="h-96 rounded-xl border border-outline bg-surface p-6">
        <div className="h-11 w-2/3 rounded-lg bg-background" />
      </div>
    </section>
  );
}

export default function SceneRoute() {
  return (
    <RequireAuth>
      <SceneContent />
    </RequireAuth>
  );
}
