export interface SfxAudio {
  sampleRate: number;
  channels: Float32Array[];
  sourceStartFrame?: number;
}
export interface SfxEdit {
  start: number;
  end: number;
  gain: number;
  fadeIn: number;
  fadeOut: number;
}

export function decodeSfxWav(bytes: ArrayBuffer): SfxAudio {
  const view = new DataView(bytes);
  const tag = (offset: number) => String.fromCharCode(...new Uint8Array(bytes, offset, 4));
  if (bytes.byteLength < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE')
    throw new Error('Original must be a PCM WAV file.');
  let rate = 0;
  let count = 0;
  let bits = 0;
  let format = 0;
  let offset = 0;
  let size = 0;
  for (let cursor = 12; cursor + 8 <= bytes.byteLength; ) {
    const length = view.getUint32(cursor + 4, true);
    const begin = cursor + 8;
    if (begin + length > bytes.byteLength) throw new Error('Incomplete original WAV.');
    if (tag(cursor) === 'fmt ') {
      if (length < 16) throw new Error('Invalid WAV format chunk.');
      format = view.getUint16(begin, true);
      count = view.getUint16(begin + 2, true);
      rate = view.getUint32(begin + 4, true);
      bits = view.getUint16(begin + 14, true);
      if (format === 65534 && length >= 40) format = view.getUint16(begin + 24, true);
    }
    if (tag(cursor) === 'data') {
      offset = begin;
      size = length;
    }
    cursor = begin + length + (length % 2);
  }
  if (format !== 1 || ![16, 24, 32].includes(bits) || !count || !rate || !size)
    throw new Error('Unsupported original PCM WAV.');
  const width = bits / 8;
  const frames = Math.floor(size / (width * count));
  const channels = Array.from({ length: count }, () => new Float32Array(frames));
  for (let frame = 0; frame < frames; frame++)
    for (let channel = 0; channel < count; channel++) {
      const at = offset + (frame * count + channel) * width;
      let value =
        bits === 16
          ? view.getInt16(at, true)
          : bits === 32
            ? view.getInt32(at, true)
            : view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getInt8(at + 2) << 16);
      value /= 2 ** (bits - 1);
      channels[channel][frame] = value;
    }
  return { sampleRate: rate, channels };
}

export function getSfxFadeGain(
  frame: number,
  length: number,
  fadeIn: number,
  fadeOut: number,
): number {
  return Math.min(
    1,
    fadeIn ? frame / Math.min(length, fadeIn) : 1,
    fadeOut ? Math.max(0, length - 1 - frame) / Math.min(length, fadeOut) : 1,
  );
}

export function renderSfxEdit(audio: SfxAudio, edit: SfxEdit): SfxAudio {
  const { sampleRate } = audio;
  const start = Math.round(edit.start * sampleRate) - (audio.sourceStartFrame ?? 0);
  const end = Math.round(edit.end * sampleRate) - (audio.sourceStartFrame ?? 0);
  if (
    ![edit.start, edit.end, edit.gain, edit.fadeIn, edit.fadeOut].every(Number.isFinite) ||
    start < 0 ||
    end > audio.channels[0].length ||
    end <= start ||
    edit.gain < 0 ||
    edit.fadeIn < 0 ||
    edit.fadeOut < 0
  )
    throw new Error('Choose a valid selection.');
  const length = end - start;
  const fadeIn = Math.min(length, Math.round(edit.fadeIn * sampleRate));
  const fadeOut = Math.min(length, Math.round(edit.fadeOut * sampleRate));
  const channels = audio.channels.map((source) => {
    const output = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const envelope = getSfxFadeGain(i, length, fadeIn, fadeOut);
      const value = Math.max(
        -1,
        Math.min(1 - 1 / 8388608, source[start + i] * edit.gain * envelope),
      );
      output[i] = (Math.round(value * 8388608) || 0) / 8388608;
    }
    return output;
  });
  return { sampleRate, channels };
}

export function encodeSfxWav(
  audio: SfxAudio,
  onProgress?: (fraction: number) => void,
): ArrayBuffer {
  const count = audio.channels.length;
  const length = audio.channels[0].length;
  const size = length * count * 3;
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
  view.setUint16(22, count, true);
  view.setUint32(24, audio.sampleRate, true);
  view.setUint32(28, audio.sampleRate * count * 3, true);
  view.setUint16(32, count * 3, true);
  view.setUint16(34, 24, true);
  tag(36, 'data');
  view.setUint32(40, size, true);
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < count; channel++) {
      const value = Math.round(audio.channels[channel][i] * 8388608);
      const at = 44 + (i * count + channel) * 3;
      view.setUint8(at, value & 255);
      view.setUint8(at + 1, (value >> 8) & 255);
      view.setUint8(at + 2, (value >> 16) & 255);
    }
    if (i % 32768 === 0) onProgress?.(i / length);
  }
  onProgress?.(1);
  return bytes;
}
