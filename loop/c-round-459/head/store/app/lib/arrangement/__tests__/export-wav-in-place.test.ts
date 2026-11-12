import { describe, expect, it } from 'vitest';
import {
  ARRANGEMENT_WAV_CHUNK_FRAMES,
  type ArrangementWavStreamWriter,
  createArrangementWavStreamWriter,
  encodeArrangementWav,
  measureExportOverload,
} from '../export-wav';
import { MAX_24BIT_SAMPLE } from '../meter';

const SPECIAL_SAMPLES = [1.5, -1.5, MAX_24BIT_SAMPLE, -1, Number.NaN, 1, -1.0001, 0];

function seededChannel(length: number, seed: number): Float32Array {
  const channel = new Float32Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    channel[i] = (state / 2_147_483_648) * 3 - 1.5;
  }
  const head = SPECIAL_SAMPLES.slice(0, length);
  channel.set(head, 0);
  if (length > SPECIAL_SAMPLES.length * 2) {
    channel.set(SPECIAL_SAMPLES, length - SPECIAL_SAMPLES.length);
  }
  return channel;
}

function stereo(length: number): Float32Array[] {
  return [seededChannel(length, 7), seededChannel(length, 11)];
}

function copyChannels(raw: readonly Float32Array[]): Float32Array[] {
  return raw.map((channel) => channel.slice());
}

function writeInChunks(
  writer: ArrangementWavStreamWriter,
  raw: readonly Float32Array[],
  chunkFrames: number,
): number[] {
  const length = raw[0]?.length ?? 0;
  const written: number[] = [];
  for (let offset = 0; offset < length; offset += chunkFrames) {
    written.push(
      writer.write(raw.map((channel) => channel.subarray(offset, offset + chunkFrames))),
    );
  }
  return written;
}

function streamEncode(raw: readonly Float32Array[], chunkFrames: number, sampleRate = 48000) {
  const writer = createArrangementWavStreamWriter(raw[0]?.length ?? 0, raw.length, sampleRate);
  writeInChunks(writer, raw, chunkFrames);
  return writer.finish();
}

function countByteMismatches(actual: ArrayBuffer, expected: ArrayBuffer): number {
  const left = new Uint8Array(actual);
  const right = new Uint8Array(expected);
  let mismatches = Math.abs(left.length - right.length);
  const shared = Math.min(left.length, right.length);
  for (let i = 0; i < shared; i++) {
    if (left[i] !== right[i]) {
      mismatches += 1;
    }
  }
  return mismatches;
}

function countSampleMismatches(
  actual: readonly Float32Array[],
  expected: readonly Float32Array[],
): number {
  let mismatches = Math.abs(actual.length - expected.length);
  for (let c = 0; c < Math.min(actual.length, expected.length); c++) {
    const left = actual[c];
    const right = expected[c];
    mismatches += Math.abs((left?.length ?? 0) - (right?.length ?? 0));
    for (let i = 0; i < Math.min(left?.length ?? 0, right?.length ?? 0); i++) {
      if (!Object.is(left?.[i], right?.[i])) {
        mismatches += 1;
      }
    }
  }
  return mismatches;
}

function latePeakChannels(): Float32Array[] {
  const length = 3 * ARRANGEMENT_WAV_CHUNK_FRAMES + 10;
  const channels = [seededChannel(length, 17), seededChannel(length, 19)].map((channel) =>
    channel.map((sample) => (Number.isNaN(sample) ? 0 : sample / 3)),
  );
  const [left, right] = channels;
  left[40] = 1.05;
  right[ARRANGEMENT_WAV_CHUNK_FRAMES + 7] = -1.1;
  left[2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 10] = 1.3;
  return channels;
}

function earlyPeakChannels(): Float32Array[] {
  const length = 3 * ARRANGEMENT_WAV_CHUNK_FRAMES + 10;
  const channels = [seededChannel(length, 3), seededChannel(length, 5)].map((channel) =>
    channel.map((sample) => (Number.isNaN(sample) ? 0 : sample * 0.4)),
  );
  const [left, right] = channels;
  left.set([1.75, 1.2, -1.3], 100);
  right.set([-1.25, 1.1], 2_000);
  left[ARRANGEMENT_WAV_CHUNK_FRAMES + 50] = 1.1;
  right[3 * ARRANGEMENT_WAV_CHUNK_FRAMES + 4] = 1.05;
  return channels;
}

describe('PERF-12a SW1 the WAV stream writer the worker runs (round 380)', () => {
  it('SW1 writer bytes, peak and clipped equal encodeArrangementWav at lengths 1, 65,535, 65,536, 65,537 and 2·65,536+123', () => {
    const lengths = [
      1,
      ARRANGEMENT_WAV_CHUNK_FRAMES - 1,
      ARRANGEMENT_WAV_CHUNK_FRAMES,
      ARRANGEMENT_WAV_CHUNK_FRAMES + 1,
      2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123,
    ];
    for (const length of lengths) {
      const raw = stereo(length);
      const expected = encodeArrangementWav(copyChannels(raw), 48000);
      const actual = streamEncode(raw, ARRANGEMENT_WAV_CHUNK_FRAMES);
      expect(actual.bytes.byteLength).toBe(expected.bytes.byteLength);
      expect(actual.bytes.byteLength).toBe(44 + length * 2 * 3);
      expect(countByteMismatches(actual.bytes, expected.bytes)).toBe(0);
      expect({ peak: actual.peak, clippedSamples: actual.clippedSamples }).toEqual({
        peak: expected.peak,
        clippedSamples: expected.clippedSamples,
      });
    }
  });

  it('SW1 the data covers NaN, ±1.5, exactly MAX_24BIT_SAMPLE and −1 in the first and the last chunk', () => {
    const raw = stereo(2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123);
    const [left] = raw;
    const tail = left.subarray(left.length - SPECIAL_SAMPLES.length);
    for (const view of [left.subarray(0, SPECIAL_SAMPLES.length), tail]) {
      expect(view[0]).toBe(1.5);
      expect(view[1]).toBe(-1.5);
      expect(view[2]).toBe(MAX_24BIT_SAMPLE);
      expect(view[3]).toBe(-1);
      expect(Number.isNaN(view[4])).toBe(true);
    }
    const bytes = new Uint8Array(streamEncode(raw, ARRANGEMENT_WAV_CHUNK_FRAMES).bytes);
    const sampleAt = (frame: number) => {
      const at = 44 + frame * 2 * 3;
      const value = bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16);
      return value >= 0x800000 ? value - 0x1000000 : value;
    };
    const lastHead = left.length - SPECIAL_SAMPLES.length;
    for (const base of [0, lastHead]) {
      expect(sampleAt(base)).toBe(8_388_607);
      expect(sampleAt(base + 1)).toBe(-8_388_608);
      expect(sampleAt(base + 2)).toBe(8_388_607);
      expect(sampleAt(base + 3)).toBe(-8_388_608);
      expect(sampleAt(base + 4)).toBe(0);
    }
  });

  it('SW1 chunk sizes 1, 7, 65,536 and one whole chunk give the same bytes as the oracle', () => {
    const raw = stereo(70_000);
    const expected = encodeArrangementWav(copyChannels(raw), 44100);
    for (const chunkFrames of [1, 7, ARRANGEMENT_WAV_CHUNK_FRAMES, raw[0].length]) {
      const actual = streamEncode(raw, chunkFrames, 44100);
      expect(countByteMismatches(actual.bytes, expected.bytes)).toBe(0);
      expect(actual.peak).toBe(expected.peak);
      expect(actual.clippedSamples).toBe(expected.clippedSamples);
    }
  });

  it('SW1 a mono odd-length stream writes the pad byte and the header sizes like the oracle', () => {
    for (const length of [1, 3, 7, ARRANGEMENT_WAV_CHUNK_FRAMES + 1]) {
      const raw = [seededChannel(length, 13)];
      const expected = encodeArrangementWav(copyChannels(raw), 48000);
      const actual = streamEncode(raw, 2);
      const dataSize = length * 3;
      expect(actual.bytes.byteLength).toBe(44 + dataSize + (dataSize % 2));
      expect(dataSize % 2).toBe(1);
      expect(new Uint8Array(actual.bytes).at(-1)).toBe(0);
      expect(new DataView(actual.bytes).getUint32(40, true)).toBe(dataSize);
      expect(new DataView(actual.bytes).getUint32(4, true)).toBe(dataSize + 37);
      expect(countByteMismatches(actual.bytes, expected.bytes)).toBe(0);
    }
  });

  it('SW1 peak and clipped equal measureExportOverload on the whole input when the loudest sample sits in an early chunk', () => {
    const raw = earlyPeakChannels();
    const whole = measureExportOverload(raw);
    const lastChunk = measureExportOverload(
      raw.map((channel) => channel.subarray(3 * ARRANGEMENT_WAV_CHUNK_FRAMES)),
    );
    expect(whole.peak).toBe(Math.fround(1.75));
    expect(lastChunk.peak).toBeLessThan(whole.peak);
    expect(lastChunk.clippedSamples).toBeLessThan(whole.clippedSamples);
    const actual = streamEncode(raw, ARRANGEMENT_WAV_CHUNK_FRAMES);
    expect(actual.peak).toBe(whole.peak);
    expect(actual.clippedSamples).toBe(whole.clippedSamples);
    expect(actual.clippedSamples).toBe(7);
    const expected = encodeArrangementWav(copyChannels(raw), 48000);
    expect(countByteMismatches(actual.bytes, expected.bytes)).toBe(0);
  });

  it('SW1 peak equals measureExportOverload on the whole input when the loudest sample sits in a later chunk', () => {
    const raw = latePeakChannels();
    const whole = measureExportOverload(raw);
    const firstChunk = measureExportOverload(
      raw.map((channel) => channel.subarray(0, ARRANGEMENT_WAV_CHUNK_FRAMES)),
    );
    expect(whole.peak).toBe(Math.fround(1.3));
    expect(firstChunk.peak).toBeLessThan(whole.peak);
    const actual = streamEncode(raw, ARRANGEMENT_WAV_CHUNK_FRAMES);
    expect(actual.peak).toBe(Math.fround(1.3));
    expect(actual.clippedSamples).toBe(whole.clippedSamples);
    expect(actual.clippedSamples).toBe(3);
    const expected = encodeArrangementWav(copyChannels(raw), 48000);
    expect(countByteMismatches(actual.bytes, expected.bytes)).toBe(0);
  });

  it('SW1 length 0, a non-integer length and a bad channel count reject at once', () => {
    const cases: Array<[number, number]> = [
      [0, 2],
      [1.5, 2],
      [-4, 2],
      [Number.NaN, 2],
      [10, 0],
      [10, 1.5],
    ];
    for (const [length, channelCount] of cases) {
      expect(() => createArrangementWavStreamWriter(length, channelCount, 48000)).toThrow(
        new Error('WAV stream: invalid length or channel count'),
      );
    }
  });

  it('SW1 the writer rejects an empty chunk, a shape mismatch and more frames than declared, and keeps what it wrote', () => {
    const writer = createArrangementWavStreamWriter(10, 2, 48000);
    expect(() => writer.write([new Float32Array(0), new Float32Array(0)])).toThrow(
      new Error('WAV stream: empty chunk'),
    );
    expect(() => writer.write([])).toThrow(new Error('WAV stream: empty chunk'));
    expect(() => writer.write([new Float32Array(4)])).toThrow(
      new Error('WAV stream: chunk shape does not match'),
    );
    expect(() => writer.write([new Float32Array(4), new Float32Array(3)])).toThrow(
      new Error('WAV stream: chunk shape does not match'),
    );
    expect(writer.write([new Float32Array(6), new Float32Array(6)])).toBe(6);
    expect(() => writer.write([new Float32Array(5), new Float32Array(5)])).toThrow(
      new Error('WAV stream: more frames than declared'),
    );
    expect(writer.write([new Float32Array(4), new Float32Array(4)])).toBe(10);
    expect(writer.finish().bytes.byteLength).toBe(44 + 10 * 2 * 3);
  });

  it('SW1 finish with fewer frames than declared throws, at zero and part way', () => {
    const empty = createArrangementWavStreamWriter(4, 1, 48000);
    expect(() => empty.finish()).toThrow(new Error('WAV stream: fewer frames than declared'));
    const partial = createArrangementWavStreamWriter(4, 1, 48000);
    expect(partial.write([Float32Array.of(0.1, 0.2, 0.3)])).toBe(3);
    expect(() => partial.finish()).toThrow(new Error('WAV stream: fewer frames than declared'));
    expect(partial.write([Float32Array.of(0.4)])).toBe(4);
    expect(partial.finish().bytes.byteLength).toBe(44 + 12);
  });

  it('SW1 the writer leaves its input chunks untouched (replaces IP2: no in-place clamp any more)', () => {
    const raw = stereo(2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123);
    const before = copyChannels(raw);
    const [left, right] = raw;
    const writer = createArrangementWavStreamWriter(left.length, 2, 48000);
    const chunks: Float32Array[][] = [];
    for (let offset = 0; offset < left.length; offset += ARRANGEMENT_WAV_CHUNK_FRAMES) {
      const chunk = raw.map((channel) =>
        channel.slice(offset, offset + ARRANGEMENT_WAV_CHUNK_FRAMES),
      );
      const chunkBefore = copyChannels(chunk);
      writer.write(chunk);
      expect(countSampleMismatches(chunk, chunkBefore)).toBe(0);
      chunks.push(chunk);
    }
    writer.finish();
    expect(chunks[0]?.[0]?.[0]).toBe(1.5);
    expect(Number.isNaN(chunks[0]?.[0]?.[4])).toBe(true);
    streamEncode(raw, 7);
    expect(left[0]).toBe(1.5);
    expect(right[0]).toBe(1.5);
    expect(left[6]).toBe(Math.fround(-1.0001));
    expect(countSampleMismatches(raw, before)).toBe(0);
  });

  it('SW1 encodeArrangementWav still leaves its input untouched and equals the stream writer (replaces IP5)', () => {
    const raw = stereo(70_000);
    const copy = copyChannels(raw);
    const oracle = encodeArrangementWav(raw, 48000);
    expect(countSampleMismatches(raw, copy)).toBe(0);
    expect(raw[0]?.[0]).toBe(1.5);
    const streamed = streamEncode(copy, ARRANGEMENT_WAV_CHUNK_FRAMES);
    expect({ peak: oracle.peak, clippedSamples: oracle.clippedSamples }).toEqual({
      peak: streamed.peak,
      clippedSamples: streamed.clippedSamples,
    });
    expect(oracle.peak).toBe(1.5);
    expect(oracle.clippedSamples).toBeGreaterThan(0);
    expect(countByteMismatches(oracle.bytes, streamed.bytes)).toBe(0);
  });

  it('SW1 write returns the cumulative written count per chunk', () => {
    const raw = stereo(2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123);
    const writer = createArrangementWavStreamWriter(raw[0].length, 2, 48000);
    expect(writeInChunks(writer, raw, ARRANGEMENT_WAV_CHUNK_FRAMES)).toEqual([
      ARRANGEMENT_WAV_CHUNK_FRAMES,
      2 * ARRANGEMENT_WAV_CHUNK_FRAMES,
      2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123,
    ]);
  });
});
