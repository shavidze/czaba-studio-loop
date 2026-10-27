import { getSfxFadeGain, renderSfxEdit, type SfxAudio, type SfxEdit } from './sfx-edit';

export interface SfxSceneClip extends SfxEdit {
  id: string;
  recordingId: number;
  offset: number;
  length: number;
  pan: number;
  loop: boolean;
  crossfade: number;
  mute: boolean;
  solo: boolean;
}

export interface SfxScene {
  version: 1;
  id: string;
  productId: number;
  name: string;
  duration: number;
  clips: SfxSceneClip[];
  video?: SfxSceneVideo;
}

export interface SfxSceneVideo {
  fileName: string;
  duration: number;
  width: number;
  height: number;
  volume: number;
  muted: boolean;
  markers: { id: string; time: number; name: string }[];
  loop: { start: number; end: number; enabled: boolean };
}

export const MAX_SCENE_SECONDS = 300;
export const MAX_SCENE_CLIPS = 12;

export function validateSfxScene(scene: SfxScene, allowedRecordingIds: ReadonlySet<number>) {
  if (
    scene.version !== 1 ||
    !scene.name.trim() ||
    scene.name.length > 100 ||
    !Number.isFinite(scene.duration) ||
    scene.duration <= 0 ||
    scene.duration > MAX_SCENE_SECONDS ||
    scene.clips.length > MAX_SCENE_CLIPS
  )
    throw new Error(
      'Use a scene name and a duration between 0 and 300 seconds, with up to 12 sounds.',
    );
  const ids = new Set<string>();
  if (scene.video) {
    const video = scene.video;
    if (
      !video.fileName.trim() ||
      video.fileName.length > 255 ||
      /[/\\:\p{Cc}]/u.test(video.fileName) ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      video.duration > MAX_SCENE_SECONDS ||
      Math.abs(video.duration - scene.duration) > 0.001 ||
      ![video.width, video.height].every(
        (size) => Number.isInteger(size) && size > 0 && size <= 16384,
      ) ||
      !Number.isFinite(video.volume) ||
      video.volume < 0 ||
      video.volume > 1 ||
      video.markers.length > 100 ||
      new Set(video.markers.map((marker) => marker.id)).size !== video.markers.length ||
      video.markers.some(
        (marker) =>
          !marker.id ||
          !marker.name.trim() ||
          marker.name.length > 100 ||
          !Number.isFinite(marker.time) ||
          marker.time < 0 ||
          marker.time > video.duration,
      ) ||
      ![video.loop.start, video.loop.end].every(Number.isFinite) ||
      video.loop.start < 0 ||
      video.loop.end <= video.loop.start ||
      video.loop.end > video.duration
    )
      throw new Error('Check video duration, markers and repeat section.');
  }
  for (const clip of scene.clips) {
    if (ids.has(clip.id) || !allowedRecordingIds.has(clip.recordingId))
      throw new Error('This scene contains an unavailable recording.');
    ids.add(clip.id);
    if (
      ![
        clip.start,
        clip.end,
        clip.offset,
        clip.length,
        clip.gain,
        clip.pan,
        clip.fadeIn,
        clip.fadeOut,
        clip.crossfade,
      ].every(Number.isFinite) ||
      clip.start < 0 ||
      clip.end <= clip.start ||
      clip.offset < 0 ||
      clip.length <= 0 ||
      clip.offset + clip.length > scene.duration + 0.000001 ||
      clip.gain < 0 ||
      clip.gain > 2 ||
      Math.abs(clip.pan) > 1 ||
      clip.fadeIn < 0 ||
      clip.fadeIn > clip.length ||
      clip.fadeOut < 0 ||
      clip.fadeOut > clip.length ||
      clip.crossfade < 0 ||
      clip.crossfade > (clip.end - clip.start) / 2 ||
      (!clip.loop && clip.length > clip.end - clip.start + 0.000001)
    )
      throw new Error('Check each sound’s position, selected segment, length and fades.');
  }
}

export function parseSfxScene(
  value: unknown,
  productId: number,
  allowedRecordingIds: ReadonlySet<number>,
): SfxScene {
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !('productId' in value) ||
    value.productId !== productId ||
    !('duration' in value) ||
    typeof value.duration !== 'number' ||
    !('clips' in value) ||
    !Array.isArray(value.clips)
  )
    throw new Error('This saved scene cannot be opened.');
  const clips: SfxSceneClip[] = value.clips.map((clip: unknown) => {
    if (
      !clip ||
      typeof clip !== 'object' ||
      !('id' in clip) ||
      typeof clip.id !== 'string' ||
      !('recordingId' in clip) ||
      typeof clip.recordingId !== 'number' ||
      !('start' in clip) ||
      typeof clip.start !== 'number' ||
      !('end' in clip) ||
      typeof clip.end !== 'number' ||
      !('offset' in clip) ||
      typeof clip.offset !== 'number' ||
      !('length' in clip) ||
      typeof clip.length !== 'number' ||
      !('gain' in clip) ||
      typeof clip.gain !== 'number' ||
      !('pan' in clip) ||
      typeof clip.pan !== 'number' ||
      !('fadeIn' in clip) ||
      typeof clip.fadeIn !== 'number' ||
      !('fadeOut' in clip) ||
      typeof clip.fadeOut !== 'number' ||
      !('loop' in clip) ||
      typeof clip.loop !== 'boolean' ||
      !('crossfade' in clip) ||
      typeof clip.crossfade !== 'number' ||
      !('mute' in clip) ||
      typeof clip.mute !== 'boolean' ||
      !('solo' in clip) ||
      typeof clip.solo !== 'boolean'
    )
      throw new Error('Invalid saved sound settings.');
    return {
      id: clip.id,
      recordingId: clip.recordingId,
      start: clip.start,
      end: clip.end,
      offset: clip.offset,
      length: clip.length,
      gain: clip.gain,
      pan: clip.pan,
      fadeIn: clip.fadeIn,
      fadeOut: clip.fadeOut,
      loop: clip.loop,
      crossfade: clip.crossfade,
      mute: clip.mute,
      solo: clip.solo,
    };
  });
  const scene: SfxScene = {
    version: 1,
    id: value.id,
    name: value.name,
    productId,
    duration: value.duration,
    clips,
    video: 'video' in value && value.video != null ? parseSceneVideo(value.video) : undefined,
  };
  validateSfxScene(scene, allowedRecordingIds);
  return scene;
}

function parseSceneVideo(value: unknown): SfxSceneVideo {
  if (
    !value ||
    typeof value !== 'object' ||
    !('fileName' in value) ||
    typeof value.fileName !== 'string' ||
    !('duration' in value) ||
    typeof value.duration !== 'number' ||
    !('width' in value) ||
    typeof value.width !== 'number' ||
    !('height' in value) ||
    typeof value.height !== 'number' ||
    !('volume' in value) ||
    typeof value.volume !== 'number' ||
    !('muted' in value) ||
    typeof value.muted !== 'boolean' ||
    !('markers' in value) ||
    !Array.isArray(value.markers) ||
    !('loop' in value) ||
    !value.loop ||
    typeof value.loop !== 'object' ||
    !('start' in value.loop) ||
    typeof value.loop.start !== 'number' ||
    !('end' in value.loop) ||
    typeof value.loop.end !== 'number' ||
    !('enabled' in value.loop) ||
    typeof value.loop.enabled !== 'boolean'
  )
    throw new Error('Invalid saved video sync settings.');
  const markers = value.markers.map((marker: unknown) => {
    if (
      !marker ||
      typeof marker !== 'object' ||
      !('id' in marker) ||
      typeof marker.id !== 'string' ||
      !('time' in marker) ||
      typeof marker.time !== 'number' ||
      !('name' in marker) ||
      typeof marker.name !== 'string'
    )
      throw new Error('Invalid saved video marker.');
    return { id: marker.id, time: marker.time, name: marker.name };
  });
  return {
    fileName: value.fileName,
    duration: value.duration,
    width: value.width,
    height: value.height,
    volume: value.volume,
    muted: value.muted,
    markers,
    loop: { start: value.loop.start, end: value.loop.end, enabled: value.loop.enabled },
  };
}

export function renderSfxScene(scene: SfxScene, originals: ReadonlyMap<number, SfxAudio>) {
  const steps = renderSfxSceneSteps(scene, originals);
  let step = steps.next();
  while (!step.done) step = steps.next();
  return step.value;
}

export function* renderSfxSceneSteps(
  scene: SfxScene,
  originals: ReadonlyMap<number, SfxAudio>,
  clipId?: string,
  compact = false,
) {
  validateSfxScene(scene, new Set(originals.keys()));
  if (!scene.clips.length) throw new Error('Add a sound before playing or exporting.');
  const sampleRate = Math.max(
    ...scene.clips.map((clip) => originals.get(clip.recordingId)?.sampleRate ?? 0),
  );
  const selected = scene.clips.find((clip) => clip.id === clipId);
  const frames = Math.round((compact && selected ? selected.length : scene.duration) * sampleRate);
  const channels = [new Float32Array(frames), new Float32Array(frames)];
  const hasSolo = scene.clips.some((clip) => clip.solo);
  const active = scene.clips.filter(
    (clip) => !clip.mute && (!hasSolo || clip.solo) && (!clipId || clip.id === clipId),
  );
  const total = active.reduce(
    (sum, clip) => sum + Math.round(clip.length * sampleRate),
    frames * 2,
  );
  let completed = 0;
  for (const clip of active) {
    const original = originals.get(clip.recordingId);
    if (!original || original.channels.length > 2)
      throw new Error('Use mono or stereo original WAV recordings.');
    const segment = renderSfxEdit(original, { ...clip, gain: 1, fadeIn: 0, fadeOut: 0 });
    const segmentFrames = segment.channels[0].length;
    const overlap = clip.loop ? Math.round(clip.crossfade * original.sampleRate) : 0;
    const period = segmentFrames - overlap;
    const clipFrames = Math.round(clip.length * sampleRate);
    const at = compact ? 0 : Math.round(clip.offset * sampleRate);
    const monoAngle = ((clip.pan + 1) * Math.PI) / 4;
    const stereoAngle = ((clip.pan <= 0 ? clip.pan + 1 : clip.pan) * Math.PI) / 2;
    const read = (data: Float32Array, frame: number) => {
      const index = Math.floor(frame);
      const fraction = frame - index;
      const sample = (i: number) => {
        if (!clip.loop || i < period) return data[Math.min(i, data.length - 1)];
        const phase = i % period;
        if (overlap && phase < overlap)
          return data[period + phase] * (1 - phase / overlap) + data[phase] * (phase / overlap);
        return data[phase];
      };
      return sample(index) * (1 - fraction) + sample(index + 1) * fraction;
    };
    for (let frame = 0; frame < clipFrames && at + frame < frames; frame++) {
      const time = frame / sampleRate;
      const envelope = getSfxFadeGain(
        frame,
        clipFrames,
        Math.round(clip.fadeIn * sampleRate),
        Math.round(clip.fadeOut * sampleRate),
      );
      const sourceFrame = time * original.sampleRate;
      const left = read(segment.channels[0], sourceFrame);
      const right = read(segment.channels[1] ?? segment.channels[0], sourceFrame);
      const pannedLeft =
        segment.channels.length === 1
          ? left * Math.cos(monoAngle)
          : clip.pan <= 0
            ? left + right * Math.cos(stereoAngle)
            : left * Math.cos(stereoAngle);
      const pannedRight =
        segment.channels.length === 1
          ? right * Math.sin(monoAngle)
          : clip.pan <= 0
            ? right * Math.sin(stereoAngle)
            : right + left * Math.sin(stereoAngle);
      channels[0][at + frame] += pannedLeft * clip.gain * envelope;
      channels[1][at + frame] += pannedRight * clip.gain * envelope;
      completed++;
      if (completed % 32768 === 0) yield completed / total;
    }
  }
  let peak = 0;
  for (const channel of channels)
    for (let frame = 0; frame < frames; frame++) {
      peak = Math.max(peak, Math.abs(channel[frame]));
      channel[frame] =
        (Math.round(Math.max(-1, Math.min(1 - 1 / 8388608, channel[frame])) * 8388608) || 0) /
        8388608;
      completed++;
      if (completed % 32768 === 0) yield completed / total;
    }
  yield 1;
  return { audio: { sampleRate, channels }, peak, overloaded: peak >= 1 };
}
