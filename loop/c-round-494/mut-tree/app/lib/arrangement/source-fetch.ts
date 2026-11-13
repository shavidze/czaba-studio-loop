import { studioSourceLoadStrings } from './strings';

export type SourceFetch = (url: string, init: RequestInit) => Promise<Response>;

export const plainSourceFetch: SourceFetch = (url, init) => fetch(url, init);

export async function fetchAndDecodeSource(
  url: string,
  ctx: BaseAudioContext,
  signal: AbortSignal,
  fetchSource: SourceFetch,
): Promise<AudioBuffer> {
  let response: Response;
  try {
    response = await fetchSource(url, { credentials: 'omit', signal });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new Error(studioSourceLoadStrings.networkFailed);
  }
  if (!response.ok) {
    throw new Error(studioSourceLoadStrings.httpFailed(response.status));
  }
  let audioData: ArrayBuffer;
  try {
    audioData = await response.arrayBuffer();
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new Error(studioSourceLoadStrings.networkFailed);
  }
  try {
    return await ctx.decodeAudioData(audioData);
  } catch {
    throw new Error(studioSourceLoadStrings.decodeFailed);
  }
}
