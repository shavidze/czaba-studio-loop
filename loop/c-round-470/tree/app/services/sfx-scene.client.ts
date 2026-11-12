import { parseSfxScene, type SfxScene } from '~/lib/sfx-scene';
import { apiClient } from './api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5199';

async function requestScene(
  path: string,
  productId: number,
  token: string,
  scene?: SfxScene,
): Promise<unknown> {
  const send = () =>
    fetch(`${API_URL}/api/sfx-scenes${path}`, {
      method: scene ? 'PUT' : 'GET',
      headers: {
        Authorization: `Bearer ${apiClient.getAccessToken() ?? token}`,
        'Content-Type': 'application/json',
      },
      body: scene ? JSON.stringify(scene) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  let response = await send();
  if (response.status === 401) {
    await apiClient.getProductRecordingCatalog(productId);
    response = await send();
  }
  const result: { success?: boolean; data?: unknown; message?: string; detail?: string } =
    await response.json().catch(() => ({}));
  if (!response.ok || !result.success)
    throw new Error(
      result.detail ||
        result.message ||
        'Unable to save or open your account scenes. Please try again.',
    );
  return result.data;
}

export async function listAccountScenes(
  productId: number,
  token: string,
  allowedIds: ReadonlySet<number>,
) {
  const result = await requestScene(`?productId=${productId}`, productId, token);
  if (!Array.isArray(result)) throw new Error('Unable to load your saved scenes.');
  return result.map((scene: unknown) => parseSfxScene(scene, productId, allowedIds));
}

export async function openAccountScene(
  id: string,
  productId: number,
  token: string,
  allowedIds: ReadonlySet<number>,
) {
  return parseSfxScene(
    await requestScene(`/${encodeURIComponent(id)}`, productId, token),
    productId,
    allowedIds,
  );
}

export async function saveAccountScene(
  scene: SfxScene,
  token: string,
  allowedIds: ReadonlySet<number>,
) {
  return parseSfxScene(
    await requestScene(`/${encodeURIComponent(scene.id)}`, scene.productId, token, scene),
    scene.productId,
    allowedIds,
  );
}
