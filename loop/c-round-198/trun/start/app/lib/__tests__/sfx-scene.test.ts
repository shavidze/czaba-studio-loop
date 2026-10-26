import { describe, expect, it } from 'vitest';
import { decodeSfxWav, encodeSfxWav, type SfxAudio } from '../sfx-edit';
import {
  parseSfxScene,
  renderSfxScene,
  type SfxScene,
  type SfxSceneClip,
  type SfxSceneVideo,
} from '../sfx-scene';

function clip(overrides: Partial<SfxSceneClip> = {}): SfxSceneClip {
  return {
    id: crypto.randomUUID(),
    recordingId: 1,
    start: 0,
    end: 1,
    offset: 0,
    length: 1,
    gain: 1,
    pan: 0,
    fadeIn: 0,
    fadeOut: 0,
    loop: false,
    crossfade: 0,
    mute: false,
    solo: false,
    ...overrides,
  };
}
function scene(clips: SfxSceneClip[], duration = 30): SfxScene {
  return {
    version: 1,
    id: crypto.randomUUID(),
    productId: 1004,
    name: 'Mall scene',
    duration,
    clips,
  };
}
function audio(left: number, right = left, duration = 12, sampleRate = 1000): SfxAudio {
  return {
    sampleRate,
    channels: [
      new Float32Array(duration * sampleRate).fill(left),
      new Float32Array(duration * sampleRate).fill(right),
    ],
  };
}

describe('Scene Builder shared rendering', () => {
  const video: SfxSceneVideo = {
    fileName: 'Mall.mp4',
    duration: 30,
    width: 1920,
    height: 1080,
    volume: 0.4,
    muted: true,
    markers: [{ id: crypto.randomUUID(), time: 7.24, name: 'Door opens' }],
    loop: { start: 5, end: 10, enabled: true },
  };
  it('reopens video sync metadata and preserves leading silence and exact three cue positions in a full-duration WAV', () => {
    const edit = {
      ...scene([clip({ offset: 5 }), clip({ offset: 12 }), clip({ offset: 25 })]),
      video,
    };
    const reopened = parseSfxScene(JSON.parse(JSON.stringify(edit)), 1004, new Set([1]));
    expect(reopened.video).toEqual(video);
    const rendered = renderSfxScene(reopened, new Map([[1, audio(0.1)]]));
    const wav = decodeSfxWav(encodeSfxWav(rendered.audio));
    expect(wav.channels[0]).toHaveLength(30000);
    expect(wav.channels[0].slice(0, 5000).every((sample) => sample === 0)).toBe(true);
    for (const at of [5, 12, 25]) {
      expect(wav.channels[0][at * 1000 - 1]).toBe(0);
      expect(wav.channels[0][at * 1000]).toBeCloseTo(0.1);
      expect(wav.channels[0][(at + 1) * 1000]).toBe(0);
    }
    expect(wav.channels).toEqual(rendered.audio.channels);
    expect(wav.channels[0].slice(26000).every((sample) => sample === 0)).toBe(true);
  });
  it('keeps legacy scenes compatible and rejects invalid video sync metadata', () => {
    expect(parseSfxScene(scene([clip()]), 1004, new Set([1])).video).toBeUndefined();
    for (const bad of [
      { ...video, duration: 29 },
      { ...video, volume: NaN },
      { ...video, fileName: 'https://example.com/video' },
      { ...video, width: 0 },
      { ...video, loop: { start: 10, end: 5, enabled: false } },
      { ...video, markers: [{ id: '1', time: 31, name: 'Late' }] },
      { ...video, markers: [{ id: '1', time: 1, name: ' ' }] },
    ])
      expect(() => parseSfxScene({ ...scene([clip()]), video: bad }, 1004, new Set([1]))).toThrow();
  });
  it('reopens a saved 30-second, three-recording scene and exports the exact preview samples', () => {
    const originals = new Map([
      [1, audio(0.1)],
      [2, audio(0.2)],
      [3, audio(0.3)],
    ]);
    const originalSnapshot = originals.get(1)?.channels[0].slice();
    const edit = scene([
      clip({ end: 12, length: 30, loop: true, crossfade: 0.05, fadeIn: 1, fadeOut: 1 }),
      clip({
        recordingId: 2,
        offset: 5,
        length: 3,
        end: 3,
        gain: 0.5,
        fadeIn: 1,
        fadeOut: 1,
        pan: -0.5,
      }),
      clip({
        recordingId: 3,
        offset: 20,
        length: 5,
        end: 5,
        gain: 0.25,
        fadeIn: 0.5,
        fadeOut: 1,
        pan: 0.5,
      }),
    ]);
    const reopened = parseSfxScene(JSON.parse(JSON.stringify(edit)), 1004, new Set([1, 2, 3]));
    const preview = renderSfxScene(edit, originals);
    const continued = renderSfxScene(reopened, originals);
    const exported = decodeSfxWav(encodeSfxWav(continued.audio));
    expect(exported.sampleRate).toBe(1000);
    expect(exported.channels[0]).toHaveLength(30000);
    expect(
      exported.channels.every((channel, c) =>
        channel.every((sample, i) => Object.is(sample, preview.audio.channels[c][i])),
      ),
    ).toBe(true);
    expect(exported.channels[0][2000]).toBeCloseTo(0.1);
    expect(exported.channels[0][15000]).toBeCloseTo(0.1);
    expect(exported.channels[0][6500]).toBeGreaterThan(0.1);
    expect(exported.channels[1][22500]).toBeGreaterThan(0.1);
    expect(preview.overloaded).toBe(false);
    expect(originals.get(1)?.channels[0]).toEqual(originalSnapshot);
  });

  it('softens loop joins without discontinuities', () => {
    const source = Float32Array.from({ length: 1000 }, (_, i) => -0.4 + i * 0.0008);
    const originals = new Map([[1, { sampleRate: 1000, channels: [source, source] }]]);
    const smooth = renderSfxScene(
      scene([clip({ loop: true, length: 3, crossfade: 0.1 })], 3),
      originals,
    ).audio.channels[0];
    const hard = renderSfxScene(scene([clip({ loop: true, length: 3 })], 3), originals).audio
      .channels[0];
    let biggestJoin = 0;
    for (let i = 890; i < 1020; i++)
      biggestJoin = Math.max(biggestJoin, Math.abs(smooth[i] - smooth[i - 1]));
    expect(biggestJoin).toBeLessThan(0.01);
    expect(Math.abs(hard[1000] - hard[999])).toBeGreaterThan(0.7);
  });

  it('pans both stereo channels and applies mute and solo', () => {
    const originals = new Map([
      [1, audio(0.2, 0.3)],
      [2, audio(0.8)],
    ]);
    const result = renderSfxScene(
      scene(
        [
          clip({ pan: -1, solo: true }),
          clip({ recordingId: 2, mute: true, solo: true }),
          clip({ recordingId: 2 }),
        ],
        1,
      ),
      originals,
    );
    expect(result.audio.channels[0][500]).toBeCloseTo(0.5);
    expect(result.audio.channels[1][500]).toBe(0);
    const right = renderSfxScene(scene([clip({ pan: 1 })], 1), originals);
    expect(right.audio.channels[0][500]).toBe(0);
    expect(right.audio.channels[1][500]).toBeCloseTo(0.5);
  });

  it('warns about overload before limiting the shared preview and WAV result', () => {
    const result = renderSfxScene(scene([clip(), clip()], 1), new Map([[1, audio(0.8)]]));
    expect(result.overloaded).toBe(true);
    expect(result.peak).toBeGreaterThan(1.5);
    expect(result.audio.channels[0][0]).toBeLessThan(1);
    expect(decodeSfxWav(encodeSfxWav(result.audio)).channels[0]).toEqual(result.audio.channels[0]);
  });

  it('preserves the highest original rate when combining different original rates', () => {
    const result = renderSfxScene(
      scene([clip(), clip({ recordingId: 2 })], 1),
      new Map([
        [1, audio(0.1, 0.1, 1, 1000)],
        [2, audio(0.2, 0.2, 1, 2000)],
      ]),
    );
    expect(result.audio.sampleRate).toBe(2000);
    expect(result.audio.channels[0]).toHaveLength(2000);
    expect(result.audio.channels[0][500]).toBeCloseTo(0.3);
  });

  it('rejects foreign recordings, foreign collections and invalid timing', () => {
    expect(() => parseSfxScene(scene([clip({ recordingId: 999 })]), 1004, new Set([1]))).toThrow(
      'unavailable',
    );
    expect(() => parseSfxScene(scene([clip()]), 99, new Set([1]))).toThrow();
    const originals = new Map([[1, audio(0.1)]]);
    for (const invalid of [
      clip({ length: 31, loop: true }),
      clip({ start: 2, end: 1 }),
      clip({ pan: 2 }),
      clip({ fadeIn: 2 }),
      clip({ gain: Number.NaN }),
    ])
      expect(() => renderSfxScene(scene([invalid]), originals)).toThrow();
    expect(() => renderSfxScene(scene([clip({ end: 13, length: 1 })]), originals)).toThrow();
  });
});
