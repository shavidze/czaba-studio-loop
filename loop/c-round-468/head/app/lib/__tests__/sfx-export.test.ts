import { unzipSync } from 'fflate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeSfxWav, type SfxAudio } from '../sfx-edit';
import {
  guardSfxExportMemory,
  planSfxExport,
  prepareSfxExport,
  type SfxExportMode,
  type SfxExportProgress,
  type SfxExportResponse,
  sfxExportName,
} from '../sfx-export';
import { runSfxExport } from '../sfx-export.client';
import { renderSfxScene, type SfxScene, type SfxSceneClip } from '../sfx-scene';

const sound = (
  id: string,
  recordingId: number,
  patch: Partial<SfxSceneClip> = {},
): SfxSceneClip => ({
  id,
  recordingId,
  start: 0.25,
  end: 1.25,
  offset: 5,
  length: 1,
  gain: 0.5,
  pan: 0,
  fadeIn: 0.1,
  fadeOut: 0.2,
  loop: false,
  crossfade: 0,
  mute: false,
  solo: false,
  ...patch,
});
const scene: SfxScene = {
  version: 1,
  id: 'scene',
  productId: 1004,
  name: 'Shopping Mall',
  duration: 30,
  clips: [
    sound('background', 1, {
      offset: 0,
      length: 30,
      loop: true,
      crossfade: 0.05,
      fadeIn: 0.5,
      fadeOut: 0.5,
      pan: -0.3,
    }),
    sound('till', 2, { offset: 12, pan: 0.5 }),
    sound('entrance', 3, { offset: 25, pan: -0.5 }),
  ],
};
const originals = new Map<number, SfxAudio>(
  [1, 2, 3].map((id) => [
    id,
    {
      sampleRate: id === 2 ? 1600 : 1000,
      channels: [
        Float32Array.from(
          { length: id === 2 ? 3200 : 2000 },
          (_, i) => Math.sin(i * 0.02 * id) * 0.15,
        ),
      ],
    },
  ]),
);
const titles = new Map([
  [1, 'Hall'],
  [2, 'Cash register'],
  [3, 'Entrance'],
]);

function read(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error('Expected binary output'));
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
const request = (mode: SfxExportMode, edit = scene) => ({
  scene: edit,
  originals,
  mode,
  files: planSfxExport(edit, mode, titles),
});

describe('SFX Export for Editing', () => {
  it('sends only selected source windows to the worker and preserves exact source sample positions', async () => {
    const raw = request('mix');
    const guarded = guardSfxExportMemory(raw);
    expect(guarded.originals.get(1)?.channels[0]).toHaveLength(1000);
    expect(guarded.scene).toBe(raw.scene);
    const original = originals.get(1)?.channels[0].slice();
    const full = decodeSfxWav(await read(prepareSfxExport(raw, () => {}).blob));
    const selected = decodeSfxWav(await read(prepareSfxExport(guarded, () => {}).blob));
    expect(selected.channels).toEqual(full.channels);
    expect(originals.get(1)?.channels[0]).toEqual(original);
    expect(raw.scene).toBe(scene);
  });
  it('keeps 44.1 kHz millisecond selections and exact half-selection crossfades valid', async () => {
    const data = new Map([
      [
        1,
        {
          sampleRate: 44100,
          channels: [Float32Array.from({ length: 1000 }, (_, i) => Math.sin(i) * 0.1)],
        },
      ],
    ]);
    for (const loop of [false, true]) {
      const edit = {
        ...scene,
        duration: 1,
        clips: [
          sound('tiny', 1, {
            start: 0.001,
            end: 0.002,
            length: 0.001,
            offset: 0.3,
            loop,
            crossfade: loop ? 0.0005 : 0,
            fadeIn: 0,
            fadeOut: 0,
          }),
        ],
      };
      const raw = { ...request('mix', edit), originals: data };
      const result = decodeSfxWav(
        await read(prepareSfxExport(guardSfxExportMemory(raw), () => {}).blob),
      );
      expect(result.channels).toEqual(renderSfxScene(edit, data).audio.channels);
    }
  });
  it('creates the exact combined preview WAV and a readable three-file ZIP whose sum matches it', async () => {
    const snapshot = originals.get(1)?.channels[0].slice();
    const mix = decodeSfxWav(await read(prepareSfxExport(request('mix'), () => {}).blob));
    expect(mix.channels).toEqual(renderSfxScene(scene, originals).audio.channels);
    expect(mix.sampleRate).toBe(1600);
    const progress: SfxExportProgress[] = [];
    const bytes = await read(
      prepareSfxExport(request('aligned'), (value) => progress.push(value)).blob,
    );
    const zip = unzipSync(new Uint8Array(bytes));
    const wavs = Object.values(zip).map((value) => decodeSfxWav(new Uint8Array(value).buffer));
    expect(wavs).toHaveLength(3);
    for (const wav of wavs) {
      expect(wav.sampleRate).toBe(1600);
      expect(wav.channels[0]).toHaveLength(48000);
    }
    expect(wavs[1].channels[0].subarray(0, 12 * 1600).every((value) => value === 0)).toBe(true);
    expect(wavs[2].channels[0].subarray(0, 25 * 1600).every((value) => value === 0)).toBe(true);
    let difference = 0;
    for (let channel = 0; channel < 2; channel++)
      for (let i = 0; i < 48000; i++) {
        difference = Math.max(
          difference,
          Math.abs(
            wavs.reduce((sum, wav) => sum + wav.channels[channel][i], 0) - mix.channels[channel][i],
          ),
        );
      }
    expect(difference).toBeLessThanOrEqual(3 / 8388608);
    expect(progress.at(-1)?.fraction).toBe(1);
    expect(progress.every((item, i) => i === 0 || item.fraction >= progress[i - 1].fraction)).toBe(
      true,
    );
    expect(new Set(progress.map((item) => item.fraction)).size).toBeGreaterThan(10);
    expect(originals.get(1)?.channels[0]).toEqual(snapshot);
  });
  it('exports compact clips with the exact same fades, level, pan and loop as aligned files', async () => {
    const aligned = unzipSync(
      new Uint8Array(await read(prepareSfxExport(request('aligned'), () => {}).blob)),
    );
    const compact = unzipSync(
      new Uint8Array(await read(prepareSfxExport(request('compact'), () => {}).blob)),
    );
    const a = Object.values(aligned).map((value) => decodeSfxWav(new Uint8Array(value).buffer));
    const c = Object.values(compact).map((value) => decodeSfxWav(new Uint8Array(value).buffer));
    for (const [index, clip] of scene.clips.entries())
      for (let channel = 0; channel < 2; channel++) {
        expect(c[index].channels[channel]).toEqual(
          a[index].channels[channel].subarray(
            Math.round(clip.offset * 1600),
            Math.round(clip.offset * 1600) + Math.round(clip.length * 1600),
          ),
        );
      }
    expect(planSfxExport(scene, 'compact', titles).map((file) => file.duration)).toEqual([
      30, 1, 1,
    ]);
  });
  it('respects Mute and Solo and gives duplicate recordings unique safe Unicode filenames', () => {
    const edit = {
      ...scene,
      name: '../სცენა:/',
      clips: [
        sound('one', 1, { solo: true }),
        sound('two', 1, { solo: true }),
        sound('muted', 2, { mute: true, solo: true }),
        sound('other', 3),
      ],
    };
    const files = planSfxExport(edit, 'aligned', new Map([[1, '../კარის ხმა\\:*']]));
    expect(files).toHaveLength(2);
    expect(new Set(files.map((file) => file.name)).size).toBe(2);
    expect(files.every((file) => !/[\\/:\p{Cc}]/u.test(file.name))).toBe(true);
    expect(files[0].name).toContain('კარის ხმა');
    expect(sfxExportName(' . ')).toBe('Scene');
  });
  it('preserves the mix when all twelve supported sounds overlap within PCM rounding precision', async () => {
    const edit = {
      ...scene,
      duration: 2,
      clips: Array.from({ length: 12 }, (_, index) =>
        sound(`overlap-${index}`, 1, {
          offset: index * 0.01,
          gain: 0.25,
          pan: index % 2 ? -0.3 : 0.3,
        }),
      ),
    };
    const mixed = renderSfxScene(edit, originals).audio;
    const bytes = await read(prepareSfxExport(request('aligned', edit), () => {}).blob);
    const files = Object.values(unzipSync(new Uint8Array(bytes))).map((value) =>
      decodeSfxWav(new Uint8Array(value).buffer),
    );
    expect(files).toHaveLength(12);
    let difference = 0;
    for (let channel = 0; channel < 2; channel++)
      for (let i = 0; i < mixed.channels[channel].length; i++)
        difference = Math.max(
          difference,
          Math.abs(
            files.reduce((sum, file) => sum + file.channels[channel][i], 0) -
              mixed.channels[channel][i],
          ),
        );
    expect(difference).toBeLessThanOrEqual(12 / 8388608);
  });
  it('rejects unavailable originals and overloaded separate files without changing the scene', () => {
    expect(() => prepareSfxExport({ ...request('mix'), originals: new Map() }, () => {})).toThrow(
      'unavailable',
    );
    const edit = { ...scene, clips: [sound('one', 1, { gain: 2 }), sound('two', 1, { gain: 2 })] };
    const loud = new Map([[1, { sampleRate: 1000, channels: [new Float32Array(2000).fill(0.8)] }]]);
    const snapshot = JSON.stringify(edit);
    expect(() =>
      prepareSfxExport({ ...request('aligned', edit), originals: loud }, () => {}),
    ).toThrow('Lower sound levels');
    expect(
      prepareSfxExport({ ...request('mix', edit), originals: loud }, () => {}).overloaded,
    ).toBe(true);
    expect(JSON.stringify(edit)).toBe(snapshot);
  });
});

const workers: TestWorker[] = [];
class TestWorker {
  onmessage: ((event: { data: SfxExportResponse }) => void) | null = null;
  onerror: (() => void) | null = null;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    workers.push(this);
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  workers.length = 0;
});
describe('Cancellable export worker', () => {
  it('rejects unsafe peak memory before creating a worker and filters unrelated cached originals', async () => {
    vi.stubGlobal('Worker', TestWorker);
    const large = {
      ...scene,
      duration: 300,
      clips: [sound('long', 1, { loop: true, offset: 0, length: 300 })],
    };
    const data = new Map([[1, { sampleRate: 192000, channels: [new Float32Array(240000)] }]]);
    await expect(
      runSfxExport(
        { ...request('aligned', large), originals: data },
        new AbortController().signal,
        () => {},
      ),
    ).rejects.toThrow('browser memory');
    expect(workers).toHaveLength(0);
    const cached = new Map(originals);
    cached.set(99, { sampleRate: 1000, channels: [new Float32Array(1000)] });
    const abort = new AbortController();
    const work = runSfxExport({ ...request('mix'), originals: cached }, abort.signal, () => {});
    expect(workers[0].postMessage).toHaveBeenCalledWith(
      guardSfxExportMemory(request('mix')),
      expect.any(Array),
    );
    abort.abort();
    await expect(work).rejects.toHaveProperty('name', 'AbortError');
  });
  it('terminates an in-flight render immediately and can retry with the original scene', async () => {
    vi.stubGlobal('Worker', TestWorker);
    const abort = new AbortController();
    const work = runSfxExport(request('aligned'), abort.signal, () => {});
    abort.abort();
    await expect(work).rejects.toHaveProperty('name', 'AbortError');
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    const retry = runSfxExport(request('mix'), new AbortController().signal, () => {});
    const blob = new Blob(['wav']);
    workers[1].onmessage?.({ data: { type: 'complete', blob, overloaded: false } });
    await expect(retry).resolves.toEqual({ type: 'complete', blob, overloaded: false });
    expect(workers[1].terminate).toHaveBeenCalledOnce();
    expect(workers[1].postMessage).toHaveBeenCalledWith(
      guardSfxExportMemory(request('mix')),
      expect.any(Array),
    );
  });
  it('reports worker failures and cleans up without producing a download', async () => {
    vi.stubGlobal('Worker', TestWorker);
    const work = runSfxExport(request('mix'), new AbortController().signal, () => {});
    workers[0].onerror?.();
    await expect(work).rejects.toThrow('scene is preserved');
    expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
});
