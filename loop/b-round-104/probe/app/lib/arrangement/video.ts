import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import {
  isContinuousVideoBoundary,
  VIDEO_DISCONTINUITY_SECONDS,
  VIDEO_SOFT_SYNC_LIMIT_SECONDS,
  videoClipEndingAt,
} from './video-sync';

export {
  VIDEO_CONTINUITY_SECONDS,
  VIDEO_DISCONTINUITY_SECONDS,
  VIDEO_RATE_MAX,
  VIDEO_RATE_MIN,
  videoRateCorrection,
} from './video-sync';

export type VideoFileKind = 'video' | 'audio' | 'unsupported';

export type VideoDriftAction = 'none' | 'seek';

export interface VideoFileDescriptor {
  name: string;
  type: string;
}

export interface VideoClipLocation {
  clip: ArrangementClip;
  mediaTime: number;
}

export interface VideoTarget extends VideoClipLocation {
  continuous: boolean;
}

export const VIDEO_DRIFT_PLAYING_SECONDS = VIDEO_SOFT_SYNC_LIMIT_SECONDS;
export const VIDEO_DRIFT_STOPPED_SECONDS = 0.001;
export const VIDEO_AUDIO_DECODE_LIMIT_SECONDS = 20 * 60;

const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'mov', 'webm', 'mkv', 'ogv']);
const AUDIO_EXTENSIONS = new Set(['wav', 'mp3', 'aac', 'm4a', 'flac', 'ogg', 'opus']);

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

export function classifyVideoFile(file: VideoFileDescriptor): VideoFileKind {
  const type = file.type.toLowerCase();
  const extension = fileExtension(file.name);
  if (type.startsWith('video/')) {
    return 'video';
  }
  if (type.startsWith('audio/')) {
    return 'audio';
  }
  if ((type === '' || type === 'application/octet-stream') && VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }
  if (AUDIO_EXTENSIONS.has(extension)) {
    return 'audio';
  }
  return 'unsupported';
}

export function audioFileRejectionMessage(name: string): string {
  return `„${name}“: აუდიო ფაილის დამატება აქ არ შეიძლება — საკუთარი შეიძლება მხოლოდ ვიდეო; ხმები ბიბლიოთეკიდან ემატება.`;
}

export function unsupportedFileMessage(file: VideoFileDescriptor): string {
  const extension = fileExtension(file.name);
  const detail = extension ? `.${extension}` : file.type || 'უცნობი ტიპი';
  return `„${file.name}“: ფორმატი არ არის ვიდეო (${detail}).`;
}

export function audioLaneDropMessage(files: readonly VideoFileDescriptor[]): string {
  return files
    .map((file) => {
      const kind = classifyVideoFile(file);
      if (kind === 'audio') {
        return audioFileRejectionMessage(file.name);
      }
      if (kind === 'unsupported') {
        return unsupportedFileMessage(file);
      }
      return 'ვიდეო ჩააგდე ვიდეოხაზზე.';
    })
    .filter((message, index, all) => all.indexOf(message) === index)
    .join(' ');
}

function videoTrackClips(arrangement: Arrangement): ArrangementClip[] {
  const videoTrack = arrangement.tracks.find((track) => track.kind === 'video');
  if (!videoTrack) {
    return [];
  }
  return arrangement.clips.filter((clip) => clip.trackId === videoTrack.id);
}

export function findVideoClipAt(
  arrangement: Arrangement,
  position: number,
): VideoClipLocation | null {
  const clip = videoTrackClips(arrangement).find(
    (entry) => entry.start <= position && position < entry.start + entry.duration,
  );
  if (!clip) {
    return null;
  }
  return { clip, mediaTime: position - clip.start + clip.sourceOffset };
}

export function nextVideoStart(arrangement: Arrangement): number {
  return videoTrackClips(arrangement).reduce(
    (end, clip) => Math.max(end, clip.start + clip.duration),
    0,
  );
}

export function resolveVideoTarget(arrangement: Arrangement, position: number): VideoTarget | null {
  const current = findVideoClipAt(arrangement, position);
  if (!current) {
    return null;
  }
  const previous = videoClipEndingAt(videoTrackClips(arrangement), current.clip);
  return { ...current, continuous: isContinuousVideoBoundary(previous, current.clip) };
}

export function isVideoTargetJump(
  previousMediaTime: number,
  nextMediaTime: number,
  elapsedSeconds: number,
): boolean {
  return (
    Math.abs(nextMediaTime - (previousMediaTime + Math.max(0, elapsedSeconds))) >
    VIDEO_DISCONTINUITY_SECONDS
  );
}

export function videoDriftAction(
  currentMediaTime: number,
  targetMediaTime: number,
  isPlaying: boolean,
): VideoDriftAction {
  const threshold = isPlaying ? VIDEO_DRIFT_PLAYING_SECONDS : VIDEO_DRIFT_STOPPED_SECONDS;
  return Math.abs(currentMediaTime - targetMediaTime) > threshold ? 'seek' : 'none';
}
