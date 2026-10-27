import { Zip, ZipPassThrough } from 'fflate';
import { encodeSfxWav, type SfxAudio } from './sfx-edit';
import { renderSfxSceneSteps, type SfxScene, validateSfxScene } from './sfx-scene';

export type SfxExportMode = 'mix' | 'aligned' | 'compact';
export interface SfxExportFile {
  clipId?: string;
  name: string;
  duration: number;
}
export interface SfxExportProgress {
  fraction: number;
  label: string;
}
export interface SfxExportRequest {
  scene: SfxScene;
  originals: Map<number, SfxAudio>;
  files: SfxExportFile[];
  mode: SfxExportMode;
}
export type SfxExportResponse =
  | { type: 'progress'; progress: SfxExportProgress }
  | { type: 'complete'; blob: Blob; overloaded: boolean }
  | { type: 'error'; message: string };

export function sfxExportName(value: string) {
  return (
    value
      .normalize('NFC')
      .replace(/[<>:"/\\|?*\p{Cc}]/gu, '-')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 80) || 'Scene'
  );
}

export function planSfxExport(
  scene: SfxScene,
  mode: SfxExportMode,
  titles: ReadonlyMap<number, string>,
): SfxExportFile[] {
  const name = sfxExportName(scene.name);
  if (mode === 'mix')
    return [{ name: `${name}_${scene.duration.toFixed(3)}s_CZABA.wav`, duration: scene.duration }];
  const solo = scene.clips.some((clip) => clip.solo);
  return scene.clips
    .filter((clip) => !clip.mute && (!solo || clip.solo))
    .map((clip, index) => ({
      clipId: clip.id,
      name: `${name}_${String(index + 1).padStart(2, '0')}_${sfxExportName(titles.get(clip.recordingId) ?? 'Sound')}_${mode}.wav`,
      duration: mode === 'aligned' ? scene.duration : clip.length,
    }));
}

export function prepareSfxExport(
  request: SfxExportRequest,
  onProgress: (progress: SfxExportProgress) => void,
) {
  const { scene, originals, files, mode } = request;
  validateSfxScene(scene, new Set(originals.keys()));
  if (!files.length) throw new Error('Unmute a sound or clear Solo before exporting.');
  const rate = Math.max(
    ...scene.clips.map((clip) => originals.get(clip.recordingId)?.sampleRate ?? 0),
  );
  const estimated = files.reduce((sum, file) => sum + Math.round(file.duration * rate) * 6 + 44, 0);
  if (estimated > 512 * 1024 * 1024)
    throw new Error(
      'This export is too large for the browser. Choose used segments or shorten the scene. Your work is preserved.',
    );
  const render = (clipId: string | undefined, start: number, span: number) => {
    const steps = renderSfxSceneSteps(scene, originals, clipId, !!clipId && mode === 'compact');
    let step = steps.next();
    while (!step.done) {
      onProgress({
        fraction: start + step.value * span,
        label: clipId ? 'Processing sound' : 'Processing scene',
      });
      step = steps.next();
    }
    return step.value;
  };
  if (mode === 'mix') {
    const mix = render(undefined, 0, 0.6);
    const bytes = encodeSfxWav(mix.audio, (fraction) =>
      onProgress({ fraction: 0.6 + fraction * 0.4, label: 'Writing WAV' }),
    );
    return { blob: new Blob([bytes], { type: 'audio/wav' }), overloaded: mix.overloaded };
  }
  if (render(undefined, 0, 0.15).overloaded)
    throw new Error(
      'Lower sound levels before exporting separate files. An overloaded mix cannot be recreated by adding separate WAVs together. Your scene is preserved.',
    );
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const zip = new Zip((error, bytes) => {
    if (error) throw error;
    chunks.push(new Uint8Array(bytes));
  });
  for (const [index, file] of files.entries()) {
    const clip = scene.clips.find((item) => item.id === file.clipId);
    if (!clip) throw new Error('A sound is no longer available. Close export and try again.');
    const start = 0.15 + (index / files.length) * 0.8;
    const span = 0.8 / files.length;
    const sound = render(clip.id, start, span * 0.65);
    if (sound.overloaded)
      throw new Error(
        'Lower this sound’s level before exporting separate files. Your scene is preserved.',
      );
    const bytes = encodeSfxWav(sound.audio, (fraction) =>
      onProgress({
        fraction: start + span * (0.65 + fraction * 0.35),
        label: `Writing ${index + 1} of ${files.length} WAVs`,
      }),
    );
    const entry = new ZipPassThrough(file.name);
    zip.add(entry);
    entry.push(new Uint8Array(bytes), true);
  }
  onProgress({ fraction: 0.95, label: 'Finishing ZIP' });
  zip.end();
  onProgress({ fraction: 1, label: 'Ready to download' });
  return { blob: new Blob(chunks, { type: 'application/zip' }), overloaded: false };
}

export function guardSfxExportMemory(request: SfxExportRequest): SfxExportRequest {
  const ids = new Set(request.scene.clips.map((clip) => clip.recordingId));
  const originals = new Map([...request.originals].filter(([id]) => ids.has(id)));
  validateSfxScene(request.scene, new Set(originals.keys()));
  const windows = new Map(
    [...originals].map(([id, audio]) => {
      const clips = request.scene.clips.filter((clip) => clip.recordingId === id);
      const from = Math.min(...clips.map((clip) => Math.round(clip.start * audio.sampleRate)));
      const to = Math.max(...clips.map((clip) => Math.round(clip.end * audio.sampleRate)));
      if (from < 0 || to > audio.channels[0].length || to <= from)
        throw new Error('Choose a valid source segment before exporting. Your scene is preserved.');
      return [id, { audio, from, to }] satisfies [
        number,
        { audio: SfxAudio; from: number; to: number },
      ];
    }),
  );
  const decodedBytes = [...windows.values()].reduce(
    (sum, window) => sum + (window.to - window.from) * window.audio.channels.length * 4,
    0,
  );
  const rate = Math.max(...[...originals.values()].map((audio) => audio.sampleRate));
  const fileBytes = request.files.map((file) => Math.round(file.duration * rate) * 6 + 44);
  const sceneBuffer = Math.round(request.scene.duration * rate) * 8;
  const soundBuffer =
    request.mode === 'compact'
      ? Math.max(0, ...request.scene.clips.map((clip) => Math.round(clip.length * rate) * 8))
      : sceneBuffer;
  const maxSegment = Math.max(
    0,
    ...request.scene.clips.map((clip) => {
      const audio = originals.get(clip.recordingId);
      return (clip.end - clip.start) * (audio?.sampleRate ?? 0) * (audio?.channels.length ?? 0) * 4;
    }),
  );
  const peak =
    decodedBytes * 2 +
    maxSegment +
    sceneBuffer +
    (request.mode === 'mix' ? 0 : soundBuffer) +
    fileBytes.reduce((sum, bytes) => sum + bytes, 0) * 3 +
    Math.max(0, ...fileBytes);
  if (peak > 512 * 1024 * 1024)
    throw new Error(
      'This export needs too much browser memory. Choose used segments, fewer sounds or a shorter scene. Your work is preserved.',
    );
  const selected = new Map(
    [...windows].map(([id, window]) => [
      id,
      {
        sampleRate: window.audio.sampleRate,
        sourceStartFrame: window.from,
        channels: window.audio.channels.map((channel) => channel.slice(window.from, window.to)),
      },
    ]),
  );
  return { ...request, originals: selected };
}
