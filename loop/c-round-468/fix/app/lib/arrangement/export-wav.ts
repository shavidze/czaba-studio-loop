import { encodeSfxWav } from '../sfx-edit';
import { isOverFullScale, MAX_24BIT_SAMPLE } from './meter';

export interface ExportOverloadReport {
  peak: number;
  clippedSamples: number;
}

export interface ArrangementWavEncoding extends ExportOverloadReport {
  bytes: ArrayBuffer;
}

export const ARRANGEMENT_WAV_CHUNK_FRAMES = 65_536;

export interface ArrangementWavChunkSource {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset: number): void;
}

export interface ArrangementWavStreamResult extends ExportOverloadReport {
  blob: Blob;
}

export type ArrangementWavStreamRequest =
  | { type: 'begin'; length: number; channelCount: number; sampleRate: number }
  | { type: 'chunk'; channels: Float32Array[] }
  | { type: 'finish' };

export type ArrangementWavStreamResponse =
  | { type: 'ack'; written: number }
  | ({ type: 'complete' } & ArrangementWavStreamResult)
  | { type: 'error'; message: string };

export function measureExportOverload(
  channels: readonly ArrayLike<number>[],
): ExportOverloadReport {
  let peak = 0;
  let clippedSamples = 0;
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      const sample = channel[i];
      const magnitude = Math.abs(sample);
      if (magnitude > peak) {
        peak = magnitude;
      }
      if (isOverFullScale(sample)) {
        clippedSamples += 1;
      }
    }
  }
  return { peak, clippedSamples };
}

export function encodeArrangementWav(
  channels: readonly Float32Array[],
  sampleRate: number,
  onProgress?: (fraction: number) => void,
): ArrangementWavEncoding {
  const report = measureExportOverload(channels);
  const clampedChannels = channels.map((data) => {
    const clamped = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));
    }
    return clamped;
  });
  const bytes = encodeSfxWav({ sampleRate, channels: clampedChannels }, onProgress);
  return { bytes, ...report };
}

export interface ArrangementWavStreamWriter {
  write(channels: readonly Float32Array[]): number;
  finish(): ArrangementWavEncoding;
}

export function createArrangementWavStreamWriter(
  length: number,
  channelCount: number,
  sampleRate: number,
): ArrangementWavStreamWriter {
  if (
    !Number.isInteger(length) ||
    length < 1 ||
    !Number.isInteger(channelCount) ||
    channelCount < 1
  ) {
    throw new Error('WAV stream: invalid length or channel count');
  }
  const size = length * channelCount * 3;
  const bytes = new ArrayBuffer(44 + size + (size % 2));
  const view = new DataView(bytes);
  const tag = (at: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i));
  };
  tag(0, 'RIFF');
  view.setUint32(4, size + 36 + (size % 2), true);
  tag(8, 'WAVE');
  tag(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 3, true);
  view.setUint16(32, channelCount * 3, true);
  view.setUint16(34, 24, true);
  tag(36, 'data');
  view.setUint32(40, size, true);
  let written = 0;
  let peak = 0;
  let clippedSamples = 0;
  return {
    write(channels) {
      const frames = channels[0]?.length ?? 0;
      if (frames === 0) {
        throw new Error('WAV stream: empty chunk');
      }
      if (
        channels.length !== channelCount ||
        channels.some((channel) => channel.length !== frames)
      ) {
        throw new Error('WAV stream: chunk shape does not match');
      }
      if (written + frames > length) {
        throw new Error('WAV stream: more frames than declared');
      }
      const report = measureExportOverload(channels);
      peak = Math.max(peak, report.peak);
      clippedSamples += report.clippedSamples;
      for (let i = 0; i < frames; i++) {
        for (let channel = 0; channel < channelCount; channel++) {
          const clamped = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, channels[channel][i]));
          const value = Math.round(clamped * 8388608);
          const at = 44 + ((written + i) * channelCount + channel) * 3;
          view.setUint8(at, value & 255);
          view.setUint8(at + 1, (value >> 8) & 255);
          view.setUint8(at + 2, (value >> 16) & 255);
        }
      }
      written += frames;
      return written;
    },
    finish() {
      if (written !== length) {
        throw new Error('WAV stream: fewer frames than declared');
      }
      return { bytes, peak, clippedSamples };
    },
  };
}
