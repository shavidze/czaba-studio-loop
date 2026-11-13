// TODO: rename to a legacy-mp3 facade once Saba allows file renames (PERF-16b)
const LEGACY_MP3_BITRATES: ReadonlyMap<string, number> = new Map([
  ['128k', 128_000],
  ['192k', 192_000],
  ['320k', 320_000],
]);

export async function convertWavToMp3(wavBlob: Blob, bitrate: string = '320k'): Promise<Blob> {
  const bitsPerSecond = LEGACY_MP3_BITRATES.get(bitrate);
  if (bitsPerSecond === undefined) {
    throw new Error(`Unsupported MP3 bitrate: ${bitrate}`);
  }
  const { loadArrangementMp3Encoder } = await import('~/lib/arrangement/mp3-encoder.client');
  const encoder = await loadArrangementMp3Encoder();
  return encoder.encode(wavBlob, undefined, { bitrate: bitsPerSecond });
}
