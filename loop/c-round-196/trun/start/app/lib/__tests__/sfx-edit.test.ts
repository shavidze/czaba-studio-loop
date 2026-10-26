import { describe, expect, it } from 'vitest';
import { decodeSfxWav, encodeSfxWav, renderSfxEdit } from '../sfx-edit';

describe('SFX original editing', () => {
  it('exports exactly the heard 12 seconds with original rate, stereo, gain and fades', () => {
    const audio = {
      sampleRate: 96000,
      channels: [new Float32Array(14 * 96000).fill(0.5), new Float32Array(14 * 96000).fill(-0.25)],
    };
    const original = audio.channels[0].slice();
    const rendered = renderSfxEdit(audio, { start: 1, end: 13, gain: 0.5, fadeIn: 1, fadeOut: 2 });
    const exported = decodeSfxWav(encodeSfxWav(rendered));
    expect(exported.sampleRate).toBe(96000);
    expect(exported.channels).toHaveLength(2);
    expect(exported.channels[0]).toHaveLength(12 * 96000);
    expect(
      exported.channels[0].every((sample, index) => Object.is(sample, rendered.channels[0][index])),
    ).toBe(true);
    expect(
      exported.channels[1].every((sample, index) => Object.is(sample, rendered.channels[1][index])),
    ).toBe(true);
    expect(exported.channels[0][0]).toBe(0);
    expect(exported.channels[0].at(-1)).toBe(0);
    expect(exported.channels[0][96000]).toBe(0.25);
    expect(exported.channels[0][6 * 96000]).toBe(0.25);
    expect(exported.channels[0][48000]).toBeCloseTo(0.125);
    expect(audio.channels[0].every((sample, index) => sample === original[index])).toBe(true);
  });
  it('pads odd mono PCM data without changing duration', () => {
    const bytes = encodeSfxWav({ sampleRate: 96000, channels: [new Float32Array(3)] });
    expect(bytes.byteLength).toBe(54);
    expect(new DataView(bytes).getUint32(40, true)).toBe(9);
    expect(decodeSfxWav(bytes).channels[0]).toHaveLength(3);
  });
  it('rejects invalid regions and compressed listening files', () => {
    const audio = { sampleRate: 10, channels: [new Float32Array(100)] };
    for (const [start, end] of [
      [2, 1],
      [-1, 2],
      [1, 11],
      [0, Number.NaN],
    ]) {
      expect(() => renderSfxEdit(audio, { start, end, gain: 1, fadeIn: 0, fadeOut: 0 })).toThrow();
    }
    expect(() => decodeSfxWav(new ArrayBuffer(100))).toThrow();
  });
});
