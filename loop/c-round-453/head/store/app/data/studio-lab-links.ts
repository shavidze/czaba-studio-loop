export const STUDIO_LAB_PREVIEW_PARAM = 'preview';

const studioLabPreviewSourceIdByHandle: ReadonlyMap<string, string> = new Map([
  ['middle-east', 'demo-middle-east'],
]);

const studioLabProductHandleBySourceId: ReadonlyMap<string, string> = new Map(
  Array.from(studioLabPreviewSourceIdByHandle, ([handle, sourceId]) => [sourceId, handle]),
);

export function resolveStudioLabPreviewSourceId(handle: string | null): string | null {
  if (handle === null) {
    return null;
  }
  return studioLabPreviewSourceIdByHandle.get(handle) ?? null;
}

export function getStudioLabPreviewHref(handle: string): string | null {
  if (resolveStudioLabPreviewSourceId(handle) === null) {
    return null;
  }
  return `/studio-lab?${new URLSearchParams({ [STUDIO_LAB_PREVIEW_PARAM]: handle }).toString()}`;
}

export function resolveStudioLabProductHandle(sourceId: string): string | null {
  return studioLabProductHandleBySourceId.get(sourceId) ?? null;
}

export function getStudioLabProductHref(sourceId: string): string | null {
  const handle = resolveStudioLabProductHandle(sourceId);
  return handle === null ? null : `/products/${encodeURIComponent(handle)}`;
}
