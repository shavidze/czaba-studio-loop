import { studioVideoStrings } from './strings';
import { VIDEO_AUDIO_DECODE_LIMIT_SECONDS } from './video';

const VIDEO_PROBE_TIMEOUT_MS = 10000;
const VIDEO_AUDIO_DECODE_MAX_BYTES = 1024 * 1024 * 1024;
const AUDIO_MARKER_SCAN_BYTES = 8 * 1024 * 1024;

const AUDIO_TRACK_MARKERS = [
  'soun',
  'A_OPUS',
  'A_VORBIS',
  'A_AAC',
  'A_MPEG',
  'A_PCM',
  'A_FLAC',
  'A_AC3',
  'A_EAC3',
  'OpusHead',
  'vorbis',
];

export interface VideoProbeResult {
  url: string;
  duration: number;
  width: number;
  height: number;
}

export type VideoAudioDecodeFailure = 'no-audio' | 'decode-failed' | 'too-long' | 'too-large';

export type VideoAudioDecodeResult =
  | { buffer: AudioBuffer; reason: null }
  | { buffer: null; reason: VideoAudioDecodeFailure };

export function videoProbeErrorMessage(name: string): string {
  return studioVideoStrings.probeFailed(name);
}

export function videoAudioNote(reason: VideoAudioDecodeFailure): string {
  if (reason === 'no-audio') {
    return studioVideoStrings.noSound;
  }
  if (reason === 'too-long') {
    return studioVideoStrings.tooLongToRead;
  }
  if (reason === 'too-large') {
    return studioVideoStrings.tooLargeToRead;
  }
  return studioVideoStrings.soundUnreadable;
}

export function probeVideoFile(file: File, signal: AbortSignal): Promise<VideoProbeResult> {
  const url = URL.createObjectURL(file);
  const probe = document.createElement('video');
  probe.preload = 'metadata';
  probe.muted = true;
  return new Promise<VideoProbeResult>((resolve, reject) => {
    const release = () => {
      window.clearTimeout(timeout);
      probe.onloadedmetadata = null;
      probe.onerror = null;
      signal.removeEventListener('abort', cancelled);
      probe.removeAttribute('src');
      probe.load();
    };
    const fail = (message: string) => {
      release();
      URL.revokeObjectURL(url);
      reject(new Error(message));
    };
    const cancelled = () => fail(studioVideoStrings.probeCancelled);
    const timeout = window.setTimeout(
      () => fail(videoProbeErrorMessage(file.name)),
      VIDEO_PROBE_TIMEOUT_MS,
    );
    if (signal.aborted) {
      cancelled();
      return;
    }
    signal.addEventListener('abort', cancelled, { once: true });
    probe.onerror = () => fail(videoProbeErrorMessage(file.name));
    probe.onloadedmetadata = () => {
      const { duration, videoWidth, videoHeight } = probe;
      if (!Number.isFinite(duration) || duration <= 0 || videoWidth === 0) {
        fail(videoProbeErrorMessage(file.name));
        return;
      }
      release();
      resolve({ url, duration, width: videoWidth, height: videoHeight });
    };
    probe.src = url;
  });
}

function containsAsciiMarker(bytes: Uint8Array, marker: string): boolean {
  const first = marker.charCodeAt(0);
  let index = bytes.indexOf(first);
  while (index >= 0 && index + marker.length <= bytes.length) {
    let matches = true;
    for (let offset = 1; offset < marker.length; offset++) {
      if (bytes[index + offset] !== marker.charCodeAt(offset)) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return true;
    }
    index = bytes.indexOf(first, index + 1);
  }
  return false;
}

async function hasAudioTrackMarker(file: File): Promise<boolean> {
  const slices =
    file.size <= AUDIO_MARKER_SCAN_BYTES * 2
      ? [file]
      : [file.slice(0, AUDIO_MARKER_SCAN_BYTES), file.slice(file.size - AUDIO_MARKER_SCAN_BYTES)];
  for (const slice of slices) {
    const bytes = new Uint8Array(await slice.arrayBuffer());
    if (AUDIO_TRACK_MARKERS.some((marker) => containsAsciiMarker(bytes, marker))) {
      return true;
    }
  }
  return false;
}

export async function decodeVideoAudio(
  file: File,
  ctx: BaseAudioContext,
  signal: AbortSignal,
  duration: number,
): Promise<VideoAudioDecodeResult> {
  if (duration > VIDEO_AUDIO_DECODE_LIMIT_SECONDS) {
    return { buffer: null, reason: 'too-long' };
  }
  if (file.size > VIDEO_AUDIO_DECODE_MAX_BYTES) {
    return { buffer: null, reason: 'too-large' };
  }
  const bytes = await file.arrayBuffer();
  if (signal.aborted) {
    throw new Error(studioVideoStrings.decodeCancelled);
  }
  try {
    const buffer = await ctx.decodeAudioData(bytes);
    return { buffer, reason: null };
  } catch {
    if (signal.aborted) {
      throw new Error(studioVideoStrings.decodeCancelled);
    }
    const hasMarker = await hasAudioTrackMarker(file);
    return { buffer: null, reason: hasMarker ? 'decode-failed' : 'no-audio' };
  }
}
