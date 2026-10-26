import { afterEach, describe, expect, it, vi } from 'vitest';
import { encodeSfxWav } from '../../sfx-edit';
import {
  encodeArrangementWav,
  encodeArrangementWavInPlace,
  measureExportOverload,
} from '../export-wav';
import { MAX_24BIT_SAMPLE } from '../meter';

function wavOracle(raw: readonly Float32Array[], sampleRate: number) {
  const report = measureExportOverload(raw);
  const channels = raw.map((data) => {
    const clamped = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));
    }
    return clamped;
  });
  const bytes = encodeSfxWav({ sampleRate, channels });
  return { bytes, channels, ...report };
}

function seededChannel(length: number, seed: number): Float32Array {
  const channel = new Float32Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    channel[i] = (state / 2_147_483_648) * 3 - 1.5;
  }
  channel.set([1.5, -1.5, MAX_24BIT_SAMPLE, -1, Number.NaN, 1, -1.0001, 0], 0);
  return channel;
}

function testChannels(length = 70_000): Float32Array[] {
  return [seededChannel(length, 7), seededChannel(length, 11)];
}

function bytesOf(buffer: ArrayBuffer): number[] {
  return Array.from(new Uint8Array(buffer));
}

function copyChannels(raw: readonly Float32Array[]): Float32Array[] {
  return raw.map((channel) => channel.slice());
}

function expectSamplesIdentical(
  actual: readonly Float32Array[],
  expected: readonly Float32Array[],
) {
  expect(actual).toHaveLength(expected.length);
  for (let c = 0; c < expected.length; c++) {
    const left = actual[c];
    const right = expected[c];
    expect(left?.length).toBe(right?.length);
    let mismatches = 0;
    for (let i = 0; i < (right?.length ?? 0); i++) {
      if (!Object.is(left?.[i], right?.[i])) {
        mismatches += 1;
      }
    }
    expect(mismatches).toBe(0);
  }
}

describe('SRW-20 stage 3b-2 in-place WAV encoding for worker-owned channels (D-29z56, GATE89-S2)', () => {
  afterEach(() => {
    window.onmessage = null;
    vi.restoreAllMocks();
  });

  it('IP1 encodeArrangementWavInPlace bytes equal the oracle and the report is measured on the unclamped samples', () => {
    const raw = testChannels();
    const copy = copyChannels(raw);
    const expected = wavOracle(copy, 48000);
    const actual = encodeArrangementWavInPlace(raw, 48000);
    expect({ peak: actual.peak, clippedSamples: actual.clippedSamples }).toEqual(
      measureExportOverload(copy),
    );
    expect(actual.peak).toBe(1.5);
    expect(actual.clippedSamples).toBeGreaterThan(0);
    expect(actual.bytes.byteLength).toBe(expected.bytes.byteLength);
    expect(bytesOf(actual.bytes)).toEqual(bytesOf(expected.bytes));
  });

  it('IP2 the same array objects passed in hold the clamped samples afterwards', () => {
    const raw = testChannels();
    const [left, right] = raw;
    const expected = wavOracle(copyChannels(raw), 48000);
    encodeArrangementWavInPlace(raw, 48000);
    expect(raw[0]).toBe(left);
    expect(raw[1]).toBe(right);
    expect(raw[0]?.[0]).toBe(MAX_24BIT_SAMPLE);
    expect(raw[0]?.[1]).toBe(-1);
    expect(Number.isNaN(raw[0]?.[4])).toBe(true);
    expect(raw[0]?.[6]).toBe(-1);
    expectSamplesIdentical(raw, expected.channels);
  });

  it('IP3 in-place encoding progress never decreases and ends at 1', () => {
    const fractions: number[] = [];
    encodeArrangementWavInPlace(testChannels(), 48000, (fraction) => fractions.push(fraction));
    expect(fractions.length).toBeGreaterThan(2);
    for (let i = 1; i < fractions.length; i++) {
      expect(fractions[i]).toBeGreaterThanOrEqual(fractions[i - 1]);
    }
    expect(fractions.at(-1)).toBe(1);
  });

  it('IP4 the worker module encodes the posted channels in place and transfers only the bytes', async () => {
    const posted: Array<{ message: unknown; transfer: Transferable[] }> = [];
    vi.spyOn(window, 'postMessage').mockImplementation(
      (message: unknown, options?: WindowPostMessageOptions) => {
        posted.push({ message, transfer: options?.transfer ?? [] });
      },
    );
    await import('../export-wav.worker');
    const handler = window.onmessage;
    if (!handler) {
      throw new Error('worker onmessage not installed');
    }
    const raw = testChannels(200_000);
    const [left] = raw;
    const expected = wavOracle(copyChannels(raw), 48000);
    handler.call(
      window,
      new MessageEvent('message', { data: { channels: raw, sampleRate: 48000 } }),
    );
    const last = posted.at(-1);
    expect(last?.message).toMatchObject({
      type: 'complete',
      peak: 1.5,
      clippedSamples: expected.clippedSamples,
    });
    const bytes =
      typeof last?.message === 'object' && last.message !== null && 'bytes' in last.message
        ? last.message.bytes
        : null;
    expect(bytes instanceof ArrayBuffer).toBe(true);
    expect(last?.transfer).toEqual([bytes]);
    expect(bytes instanceof ArrayBuffer ? bytesOf(bytes) : []).toEqual(bytesOf(expected.bytes));
    expect(raw[0]).toBe(left);
    expect(raw[0]?.[0]).toBe(MAX_24BIT_SAMPLE);
    expectSamplesIdentical(raw, expected.channels);
  });

  it('IP5 encodeArrangementWav still leaves its input untouched and matches the in-place result', () => {
    const raw = testChannels();
    const copy = copyChannels(raw);
    const shared = encodeArrangementWav(raw, 48000);
    expectSamplesIdentical(raw, copy);
    expect(raw[0]?.[0]).toBe(1.5);
    const inPlace = encodeArrangementWavInPlace(copyChannels(copy), 48000);
    expect({ peak: shared.peak, clippedSamples: shared.clippedSamples }).toEqual({
      peak: inPlace.peak,
      clippedSamples: inPlace.clippedSamples,
    });
    expect(bytesOf(shared.bytes)).toEqual(bytesOf(inPlace.bytes));
  });
});
