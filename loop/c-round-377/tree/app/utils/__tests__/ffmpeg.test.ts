import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client';

const encoderFake = vi.hoisted(() => ({
  moduleFactoryCalls: vi.fn<() => void>(),
  loadArrangementMp3Encoder: vi.fn<() => Promise<ArrangementMp3Encoder>>(),
  encode: vi.fn<ArrangementMp3Encoder['encode']>(),
}));

const FACADE_PATH = resolve(__dirname, '../ffmpeg.ts');

async function importLegacyMp3Facade() {
  vi.resetModules();
  vi.doMock('~/lib/arrangement/mp3-encoder.client', () => {
    encoderFake.moduleFactoryCalls();
    return { loadArrangementMp3Encoder: encoderFake.loadArrangementMp3Encoder };
  });
  return import('../ffmpeg');
}

describe('PERF-16b-i legacy MP3 facade (app/utils/ffmpeg.ts) delegates to the shared LAME encoder', () => {
  const mp3Blob = new Blob([Uint8Array.of(255, 251)], { type: 'audio/mpeg' });

  beforeEach(() => {
    encoderFake.moduleFactoryCalls.mockReset();
    encoderFake.encode.mockReset();
    encoderFake.encode.mockResolvedValue(mp3Blob);
    encoderFake.loadArrangementMp3Encoder.mockReset();
    encoderFake.loadArrangementMp3Encoder.mockImplementation(() =>
      Promise.resolve({ encode: encoderFake.encode }),
    );
  });

  it.each([
    ['128k', 128_000],
    ['192k', 192_000],
    ['320k', 320_000],
  ])('LF1 %s calls encode(wav, undefined, { bitrate: %i }) with the same wav', async (bitrate, bitsPerSecond) => {
    const { convertWavToMp3 } = await importLegacyMp3Facade();
    const wav = new Blob(['RIFF'], { type: 'audio/wav' });
    await convertWavToMp3(wav, bitrate);
    expect(encoderFake.encode).toHaveBeenCalledTimes(1);
    expect(encoderFake.encode).toHaveBeenCalledWith(wav, undefined, { bitrate: bitsPerSecond });
    expect(encoderFake.encode.mock.calls[0]?.[0]).toBe(wav);
  });

  it('LF1 no bitrate argument defaults to 320000', async () => {
    const { convertWavToMp3 } = await importLegacyMp3Facade();
    const wav = new Blob(['RIFF'], { type: 'audio/wav' });
    await convertWavToMp3(wav);
    expect(encoderFake.encode).toHaveBeenCalledWith(wav, undefined, { bitrate: 320_000 });
    expect(encoderFake.encode.mock.calls[0]?.[0]).toBe(wav);
  });

  it.each([
    '256k',
    '',
    '320',
    '320K',
  ])('LF2 %j rejects with Unsupported MP3 bitrate before the encoder module is imported', async (bitrate) => {
    const { convertWavToMp3 } = await importLegacyMp3Facade();
    await expect(convertWavToMp3(new Blob(['RIFF']), bitrate)).rejects.toThrow(
      new Error(`Unsupported MP3 bitrate: ${bitrate}`),
    );
    expect(encoderFake.moduleFactoryCalls).not.toHaveBeenCalled();
    expect(encoderFake.loadArrangementMp3Encoder).not.toHaveBeenCalled();
    expect(encoderFake.encode).not.toHaveBeenCalled();
  });

  it("LF3 returns the encoder's Blob unchanged and propagates load and encode rejections unchanged", async () => {
    const { convertWavToMp3 } = await importLegacyMp3Facade();
    await expect(convertWavToMp3(new Blob(['RIFF']), '192k')).resolves.toBe(mp3Blob);

    const loadError = new Error('chunk load failed');
    encoderFake.loadArrangementMp3Encoder.mockRejectedValueOnce(loadError);
    const loadOutcome = await convertWavToMp3(new Blob(['RIFF']), '128k').catch(
      (reason: unknown) => reason,
    );
    expect(loadOutcome).toBe(loadError);

    const encodeError = new Error('lame crashed');
    encoderFake.encode.mockRejectedValueOnce(encodeError);
    const encodeOutcome = await convertWavToMp3(new Blob(['RIFF']), '320k').catch(
      (reason: unknown) => reason,
    );
    expect(encodeOutcome).toBe(encodeError);
  });

  it('LF4 every call loads the encoder again, so no encoder object is cached across calls', async () => {
    const { convertWavToMp3 } = await importLegacyMp3Facade();
    await convertWavToMp3(new Blob(['RIFF']), '128k');
    await convertWavToMp3(new Blob(['RIFF']), '320k');
    expect(encoderFake.loadArrangementMp3Encoder).toHaveBeenCalledTimes(2);
    expect(encoderFake.encode).toHaveBeenCalledTimes(2);
  });

  it('LF5 the facade source has no @ffmpeg, unpkg or FFmpeg, and its only runtime export is convertWavToMp3', async () => {
    const source = readFileSync(FACADE_PATH, 'utf-8');
    expect(source).not.toContain('@ffmpeg');
    expect(source).not.toContain('unpkg');
    expect(source).not.toContain('FFmpeg');
    const facadeModule = await importLegacyMp3Facade();
    expect(Object.keys(facadeModule).sort()).toEqual(['convertWavToMp3']);
  });
});
