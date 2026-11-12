import { useSyncExternalStore } from 'react';

export const STUDIO_WIDE_MIN_PX = 900;
const STUDIO_WIDE_QUERY = `(min-width: ${STUDIO_WIDE_MIN_PX}px)`;

function readStudioWideViewport(): boolean {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(STUDIO_WIDE_QUERY).matches;
  }
  return window.innerWidth >= STUDIO_WIDE_MIN_PX;
}

function subscribeStudioWideViewport(onChange: () => void): () => void {
  if (typeof window.matchMedia === 'function') {
    const query = window.matchMedia(STUDIO_WIDE_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function readStudioWideServerSnapshot(): boolean {
  return true;
}

export function useStudioWideViewport(): boolean {
  return useSyncExternalStore(
    subscribeStudioWideViewport,
    readStudioWideViewport,
    readStudioWideServerSnapshot,
  );
}

function subscribeStudioHydrationNoop(): () => void {
  return () => undefined;
}

function readStudioHydratedClient(): boolean {
  return true;
}

function readStudioHydratedServer(): boolean {
  return false;
}

export function useStudioHydrated(): boolean {
  return useSyncExternalStore(
    subscribeStudioHydrationNoop,
    readStudioHydratedClient,
    readStudioHydratedServer,
  );
}
