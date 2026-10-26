import { apiClient } from '~/services/api/client';
import { decodeSfxWav } from './sfx-edit';

export async function loadSfxOriginal(
  productId: number,
  recordingId: number,
  token: string,
  signal: AbortSignal,
) {
  const load = (accessToken: string) =>
    fetch(`/api/recording-original?product=${productId}&recording=${recordingId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal,
    });
  let response = await load(apiClient.getAccessToken() ?? token);
  if (response.status === 401) {
    await apiClient.getProductRecordingCatalog(productId);
    response = await load(apiClient.getAccessToken() ?? token);
  }
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? 'Collection ownership is required.'
        : 'Original recording unavailable. Please retry.',
    );
  return decodeSfxWav(await response.arrayBuffer());
}
