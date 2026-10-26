import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { useRecordingPlayer } from '~/hooks/useRecordingPlayer';
import type { SfxAudio } from '~/lib/sfx-edit';
import { loadSfxOriginal } from '~/lib/sfx-original.client';
import {
  MAX_SCENE_CLIPS,
  MAX_SCENE_SECONDS,
  renderSfxScene,
  type SfxScene,
  type SfxSceneClip,
  type SfxSceneVideo,
  validateSfxScene,
} from '~/lib/sfx-scene';
import { getSfxSyncPosition, seekSfxVideo } from '~/lib/sfx-video.client';
import { apiClient, type ProductRecordingCatalog } from '~/services/api/client';
import { listAccountScenes, openAccountScene, saveAccountScene } from '~/services/sfx-scene.client';
import { SfxSceneExport } from './SfxSceneExport';
import { SfxSoundLibrary } from './SfxSoundLibrary';
import { SfxVideoSync } from './SfxVideoSync';

interface Props {
  catalog: ProductRecordingCatalog;
  library?: ProductRecordingCatalog[];
  accountId?: string;
  token: string;
  onPlaybackStart: () => void;
}
interface History {
  past: SfxScene[];
  present: SfxScene;
  future: SfxScene[];
}

export function SfxSceneBuilder({
  catalog,
  library,
  accountId = 'preview',
  token,
  onPlaybackStart,
}: Props) {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: {
      version: 1,
      id: crypto.randomUUID(),
      productId: catalog.productId,
      name: 'Shopping scene',
      duration: 30,
      clips: [],
    },
    future: [],
  }));
  const scene = history.present;
  const [originals, setOriginals] = useState<Map<number, SfxAudio>>(new Map());
  const [savedScenes, setSavedScenes] = useState<SfxScene[]>([]);
  const [savedId, setSavedId] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [busy, setBusy] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [overloaded, setOverloaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [localVideo, setLocalVideo] = useState<{
    url: string;
    fileName: string;
    duration: number;
  } | null>(null);
  const [pictureTime, setPictureTime] = useState(0);
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const videoSelection = useRef(0);
  const playbackController = useRef<AbortController | null>(null);
  const playRef = useRef<((at: number) => Promise<void>) | null>(null);
  const videoUrl =
    scene.video &&
    localVideo &&
    scene.video.fileName === localVideo.fileName &&
    Math.abs(scene.video.duration - localVideo.duration) <= 0.001
      ? localVideo.url
      : '';
  const initialToken = useRef(token);
  const renderCache = useRef<{
    scene: SfxScene;
    originals: Map<number, SfxAudio>;
    result: ReturnType<typeof renderSfxScene>;
  } | null>(null);
  const bufferCache = useRef<{ audio: SfxAudio; buffer: AudioBuffer } | null>(null);
  const engine = useRef<AudioContext | null>(null);
  const node = useRef<AudioBufferSourceNode | null>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const playbackStarted = useRef(0);
  const playbackOffset = useRef(0);
  const ownedCatalogs = useMemo(() => library ?? [catalog], [library, catalog]);
  const libraryRecordings = useMemo(
    () =>
      ownedCatalogs.flatMap((collection) =>
        collection.recordings.map((recording) => ({
          ...recording,
          productId: collection.productId,
        })),
      ),
    [ownedCatalogs],
  );
  const allowedIds = useMemo(
    () => new Set(libraryRecordings.map((recording) => recording.id)),
    [libraryRecordings],
  );
  const inputClass =
    'mt-1 min-h-11 w-full rounded-lg border border-outline-strong bg-background px-3 text-foreground focus-visible:ring-2 focus-visible:ring-brand';
  const dirty = JSON.stringify(scene) !== savedSnapshot;

  const stop = () => {
    generation.current++;
    playbackController.current?.abort();
    videoElement.current?.pause();
    if (node.current) {
      node.current.onended = null;
      node.current.stop();
      node.current.disconnect();
      node.current = null;
    }
    setPlaying(false);
  };
  const pause = () => {
    const at = getSfxSyncPosition(
      playbackOffset.current + (engine.current?.currentTime ?? 0) - playbackStarted.current,
      scene.duration,
      scene.video?.loop,
    );
    stop();
    setPosition(at);
    if (videoElement.current && videoUrl) videoElement.current.currentTime = at;
  };
  const previewPlayer = useRecordingPlayer({
    requestStreamGrant: async (recordingId) => {
      const recording = libraryRecordings.find((item) => item.id === recordingId);
      if (!recording) throw new Error('This sound is unavailable to your account.');
      const requestGrant = () =>
        fetch(`/api/recording-stream?product=${recording.productId}&recording=${recordingId}`, {
          headers: { Authorization: `Bearer ${apiClient.getAccessToken() ?? token}` },
          cache: 'no-store',
          signal: AbortSignal.timeout(15000),
        });
      let response = await requestGrant();
      if (response.status === 401) {
        await apiClient.getProductRecordingCatalog(recording.productId);
        response = await requestGrant();
      }
      const body: { streamUrl?: string; expiresAt?: number; error?: string } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok || !body.streamUrl || !body.expiresAt)
        throw new Error(body.error || 'Unable to preview this sound. Please retry.');
      return { streamUrl: body.streamUrl, expiresAt: body.expiresAt };
    },
    onPlaybackStart: () => {
      if (playing) pause();
      else stop();
      onPlaybackStart();
    },
  });
  const commit = (next: SfxScene) => {
    stop();
    setOverloaded(false);
    setMessage('');
    setHistory((current) => ({
      past: [...current.past.slice(-49), current.present],
      present: next,
      future: [],
    }));
    setPosition((current) => Math.min(current, next.duration));
  };
  const updateClip = (id: string, patch: Partial<SfxSceneClip>) =>
    commit({
      ...scene,
      clips: scene.clips.map((clip) => {
        if (clip.id !== id) return clip;
        const next = { ...clip, ...patch };
        return {
          ...next,
          crossfade: Math.min(next.crossfade, Math.max(0, (next.end - next.start) / 2)),
          fadeIn: Math.min(next.fadeIn, Math.max(0, next.length)),
          fadeOut: Math.min(next.fadeOut, Math.max(0, next.length)),
        };
      }),
    });

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    listAccountScenes(catalog.productId, initialToken.current, allowedIds)
      .then((items) => {
        if (!abort.signal.aborted) setSavedScenes(items);
      })
      .catch((reason: unknown) => {
        if (!abort.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Unable to load account scenes.');
      });
    return () => {
      abort.abort();
      generation.current++;
      videoSelection.current++;
      playbackController.current?.abort();
      videoElement.current?.pause();
      if (node.current) {
        node.current.onended = null;
        node.current.stop();
        node.current.disconnect();
        node.current = null;
      }
      void engine.current?.close();
      engine.current = null;
    };
  }, [catalog.productId, allowedIds]);

  useEffect(
    () => () => {
      if (localVideo) URL.revokeObjectURL(localVideo.url);
    },
    [localVideo],
  );
  useEffect(() => {
    const video = videoElement.current;
    if (!videoUrl || !video || !video.requestVideoFrameCallback) return;
    let handle = 0;
    let closed = false;
    const frame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (closed) return;
      setPictureTime(metadata.mediaTime);
      handle = video.requestVideoFrameCallback(frame);
    };
    handle = video.requestVideoFrameCallback(frame);
    return () => {
      closed = true;
      video.cancelVideoFrameCallback(handle);
    };
  }, [videoUrl]);
  useEffect(() => {
    if (!playing && videoUrl && videoElement.current)
      videoElement.current.currentTime = Math.min(position, scene.duration);
    if (videoElement.current) {
      videoElement.current.volume = scene.video?.volume ?? 1;
      videoElement.current.muted = scene.video?.muted ?? true;
    }
  }, [position, playing, videoUrl, scene.duration, scene.video?.volume, scene.video?.muted]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const elapsed =
        playbackOffset.current + (engine.current?.currentTime ?? 0) - playbackStarted.current;
      const at = getSfxSyncPosition(elapsed, scene.duration, scene.video?.loop);
      setPosition(at);
      const video = videoElement.current;
      if (videoUrl && video && !video.seeking && Math.abs(video.currentTime - at) > 0.08) {
        void playRef.current?.(at);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, scene.duration, scene.video?.loop, videoUrl]);

  const chooseVideo = async (file: File) => {
    stop();
    const request = ++videoSelection.current;
    const url = URL.createObjectURL(file);
    const media = document.createElement('video');
    media.preload = 'metadata';
    setBusy(true);
    setError('');
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error('Video metadata could not be read.')),
          10000,
        );
        media.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
        media.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Choose a video format supported by your browser.'));
        };
        media.src = url;
      });
      if (request !== videoSelection.current || controller.current?.signal.aborted) {
        URL.revokeObjectURL(url);
        return;
      }
      const duration = media.duration;
      if (
        !Number.isFinite(duration) ||
        duration <= 0 ||
        duration > MAX_SCENE_SECONDS ||
        !media.videoWidth ||
        !media.videoHeight
      )
        throw new Error('Choose a video with a readable duration of up to 5 minutes.');
      if (scene.clips.some((clip) => clip.offset + clip.length > duration + 0.000001))
        throw new Error(
          'Some sounds extend beyond this video. Shorten or move them, then choose the video again.',
        );
      if (scene.video && Math.abs(scene.video.duration - duration) > 0.001)
        throw new Error(
          'Choose the original video with the saved duration to preserve your sync settings.',
        );
      const settings: SfxSceneVideo = scene.video ?? {
        fileName: file.name,
        duration,
        width: media.videoWidth,
        height: media.videoHeight,
        volume: 1,
        muted: true,
        markers: [],
        loop: { start: 0, end: duration, enabled: false },
      };
      const next = {
        ...scene,
        duration,
        video: {
          ...settings,
          fileName: file.name,
          width: media.videoWidth,
          height: media.videoHeight,
        },
      };
      validateSfxScene(next, allowedIds);
      commit(next);
      setLocalVideo({ url, fileName: file.name, duration });
      setPosition(0);
    } catch (reason) {
      URL.revokeObjectURL(url);
      reportError(reason);
    } finally {
      media.removeAttribute('src');
      media.load();
      if (request === videoSelection.current && !controller.current?.signal.aborted) setBusy(false);
    }
  };
  const seek = (at: number) => {
    const target = Math.max(0, Math.min(scene.duration, at));
    setPosition(target);
    if (playing) void play(target);
    else if (videoUrl && videoElement.current) videoElement.current.currentTime = target;
  };

  const fetchOriginals = async (ids: number[]) => {
    const signal = controller.current?.signal;
    if (!signal || signal.aborted) throw new Error('Editor closed.');
    const next = new Map(originals);
    for (const id of new Set(ids)) {
      if (!allowedIds.has(id)) throw new Error('This recording is not available to your account.');
      const recording = libraryRecordings.find((item) => item.id === id);
      if (!recording) throw new Error('This sound is unavailable to your account.');
      if (!next.has(id))
        next.set(id, await loadSfxOriginal(recording.productId, id, token, signal));
      if (signal.aborted) throw new Error('Editor closed.');
    }
    setOriginals(next);
    return next;
  };
  const reportError = (reason: unknown) => {
    if (!controller.current?.signal.aborted)
      setError(reason instanceof Error ? reason.message : 'Unable to process scene.');
  };
  const addSound = async (recordingId: number) => {
    if (busy || scene.clips.length >= MAX_SCENE_CLIPS) return;
    const at = playing
      ? getSfxSyncPosition(
          playbackOffset.current + (engine.current?.currentTime ?? 0) - playbackStarted.current,
          scene.duration,
          scene.video?.loop,
        )
      : position;
    previewPlayer.stopRecordingPlayback();
    stop();
    setPosition(at);
    setBusy(true);
    setError('');
    try {
      const sources = await fetchOriginals([recordingId]);
      const audio = sources.get(recordingId);
      if (!audio) return;
      const end = Math.min(12, audio.channels[0].length / audio.sampleRate, scene.duration - at);
      if (end <= 0) throw new Error('Move the scene position before its end to add a sound.');
      commit({
        ...scene,
        clips: [
          ...scene.clips,
          {
            id: crypto.randomUUID(),
            recordingId,
            start: 0,
            end,
            offset: at,
            length: end,
            gain: 1,
            pan: 0,
            fadeIn: 0,
            fadeOut: 0,
            mute: false,
            solo: false,
            loop: false,
            crossfade: Math.min(0.05, end / 2),
          },
        ],
      });
    } catch (reason) {
      reportError(reason);
    } finally {
      if (!controller.current?.signal.aborted) setBusy(false);
    }
  };
  const renderScene = () => {
    validateSfxScene(scene, allowedIds);
    const cached = renderCache.current;
    const rendered =
      cached?.scene === scene && cached.originals === originals
        ? cached.result
        : renderSfxScene(scene, originals);
    renderCache.current = { scene, originals, result: rendered };
    setOverloaded(rendered.overloaded);
    return rendered;
  };
  const play = async (at: number) => {
    previewPlayer.stopRecordingPlayback();
    stop();
    setError('');
    const request = generation.current;
    const abort = new AbortController();
    playbackController.current = abort;
    try {
      const context = engine.current ?? new AudioContext();
      engine.current = context;
      await context.resume();
      if (request !== generation.current) return;
      if (scene.video && !videoUrl)
        throw new Error(
          'Choose your saved video again for synchronized playback. Your scene settings are preserved.',
        );
      const loop = scene.video?.loop;
      const offset = loop?.enabled
        ? at >= loop.start && at < loop.end
          ? at
          : loop.start
        : at < scene.duration
          ? Math.max(0, at)
          : 0;
      const end = loop?.enabled ? loop.end : scene.duration;
      const rendered = scene.clips.length
        ? renderScene()
        : {
            audio: {
              sampleRate: 48000,
              channels: [
                new Float32Array(Math.round(scene.duration * 48000)),
                new Float32Array(Math.round(scene.duration * 48000)),
              ],
            },
            overloaded: false,
            peak: 0,
          };
      let buffer =
        bufferCache.current?.audio === rendered.audio ? bufferCache.current.buffer : null;
      if (!buffer) {
        buffer = context.createBuffer(
          2,
          rendered.audio.channels[0].length,
          rendered.audio.sampleRate,
        );
        rendered.audio.channels.forEach((channel, index) => {
          buffer?.copyToChannel(new Float32Array(channel), index);
        });
        bufferCache.current = { audio: rendered.audio, buffer };
      }
      if (videoUrl && videoElement.current) {
        await seekSfxVideo(videoElement.current, offset, abort.signal);
        if (request !== generation.current) return;
        await videoElement.current.play();
        if (request !== generation.current) {
          if (!node.current) videoElement.current.pause();
          return;
        }
      }
      const synchronizedOffset =
        videoUrl && videoElement.current
          ? getSfxSyncPosition(videoElement.current.currentTime, scene.duration, loop)
          : offset;
      if (synchronizedOffset >= scene.duration) {
        stop();
        setPosition(scene.duration);
        return;
      }
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.loop = !!loop?.enabled;
      source.loopStart = loop?.start ?? 0;
      source.loopEnd = end;
      source.onended = () => {
        if (node.current === source) {
          setPlaying(false);
          setPosition(scene.duration);
          videoElement.current?.pause();
          source.disconnect();
          node.current = null;
        }
      };
      node.current = source;
      playbackStarted.current = context.currentTime;
      playbackOffset.current = synchronizedOffset;
      onPlaybackStart();
      source.start(0, synchronizedOffset);
      setPlaying(true);
    } catch (reason) {
      if (request === generation.current) {
        stop();
        reportError(reason);
      }
    }
  };
  playRef.current = play;
  const save = async () => {
    stop();
    setBusy(true);
    setError('');
    try {
      const snapshot = { ...scene, id: scene.id || crypto.randomUUID() };
      validateSfxScene(snapshot, allowedIds);
      const result = await saveAccountScene(snapshot, token, allowedIds);
      if (controller.current?.signal.aborted) return;
      setHistory((current) => ({ ...current, present: result }));
      setSavedSnapshot(JSON.stringify(result));
      setSavedId(result.id);
      setSavedScenes((items) => [result, ...items.filter((item) => item.id !== result.id)]);
      setMessage('Saved to your account. Continue on any device.');
    } catch (reason) {
      reportError(reason);
    } finally {
      if (!controller.current?.signal.aborted) setBusy(false);
    }
  };
  const open = async () => {
    if (!savedId) return;
    if (
      dirty &&
      scene.clips.length &&
      !window.confirm('Open saved scene and discard unsaved changes?')
    )
      return;
    stop();
    setBusy(true);
    setError('');
    try {
      const result = await openAccountScene(savedId, catalog.productId, token, allowedIds);
      await fetchOriginals(result.clips.map((clip) => clip.recordingId));
      if (controller.current?.signal.aborted) return;
      setHistory({ past: [], present: result, future: [] });
      setLocalVideo(null);
      setPosition(0);
      setOverloaded(false);
      setSavedSnapshot(JSON.stringify(result));
      setMessage('Saved scene opened.');
    } catch (reason) {
      reportError(reason);
    } finally {
      if (!controller.current?.signal.aborted) setBusy(false);
    }
  };

  return (
    <section aria-label="SFX Scene Builder" className="space-y-6">
      {exportOpen && (
        <SfxSceneExport
          scene={scene}
          originals={originals}
          titles={new Map(libraryRecordings.map((recording) => [recording.id, recording.title]))}
          onClose={() => setExportOpen(false)}
        />
      )}
      <header>
        <p className="text-xs uppercase tracking-widest text-brand">
          Sound Effects · Scene Builder
        </p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">{catalog.productTitle}</h1>
        <p className="mt-3 text-sm text-muted">
          Layer your recordings, place sounds in time and create your own atmosphere.
        </p>
      </header>
      <div className="h-24 overflow-y-auto" aria-live="polite" aria-atomic="true">
        {error && (
          <p role="alert" className="rounded-lg border border-destructive p-3 text-destructive">
            {error}
          </p>
        )}
        {overloaded && (
          <p role="alert" className="rounded-lg border border-accent p-3 text-accent">
            Some sounds are too loud together. Lower their levels to avoid distortion. Playback and
            WAV export use the same limited result.
          </p>
        )}
        {message && <output className="block text-sm text-brand">{message}</output>}
      </div>
      <SfxVideoSync
        ref={videoElement}
        video={scene.video}
        url={videoUrl}
        position={
          videoUrl && videoElement.current?.requestVideoFrameCallback ? pictureTime : position
        }
        busy={busy}
        onChoose={(file) => void chooseVideo(file)}
        onUpdate={(video) => {
          if (
            video.markers.length > (scene.video?.markers.length ?? 0) &&
            videoElement.current?.seeking
          ) {
            setMessage('Wait for the selected picture frame, then mark the moment.');
            return;
          }
          commit({ ...scene, video });
        }}
        onSeek={seek}
        onBuffering={() => {
          if (node.current) {
            pause();
            setMessage('Video is buffering. Press Play to continue together.');
          }
        }}
        onError={() => {
          if (videoUrl) {
            stop();
            setError(
              'Video cannot be played. Choose a supported local video again; your scene is preserved.',
            );
          }
        }}
      />
      <fieldset
        disabled={busy}
        className="space-y-5 rounded-xl border border-outline bg-surface p-4 sm:p-6"
      >
        <legend className="sr-only">Scene settings</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-muted">
            Scene name
            <input
              maxLength={100}
              value={scene.name}
              onChange={(event) => commit({ ...scene, name: event.currentTarget.value })}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-muted">
            Scene length (seconds)
            <input
              type="number"
              min="0.001"
              max={MAX_SCENE_SECONDS}
              step="0.001"
              value={scene.duration}
              disabled={!!scene.video}
              onChange={(event) =>
                commit({ ...scene, duration: Number(event.currentTarget.value) })
              }
              className={inputClass}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={(!scene.clips.length && !videoUrl) || scene.duration <= 0}
            onClick={() => (playing ? pause() : void play(position))}
          >
            {playing ? 'Pause scene' : 'Play scene'}
          </Button>
          <Button
            variant="secondary"
            disabled={!history.past.length}
            onClick={() => {
              stop();
              const previous = history.past.at(-1);
              if (previous) {
                setHistory({
                  past: history.past.slice(0, -1),
                  present: previous,
                  future: [scene, ...history.future],
                });
                setPosition(0);
                setOverloaded(false);
              }
            }}
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            disabled={!history.future.length}
            onClick={() => {
              stop();
              const next = history.future[0];
              if (next) {
                setHistory({
                  past: [...history.past, scene],
                  present: next,
                  future: history.future.slice(1),
                });
                setPosition(0);
                setOverloaded(false);
              }
            }}
          >
            Redo
          </Button>
          <Button variant="secondary" onClick={() => void save()}>
            Save scene{dirty ? ' · Unsaved' : ''}
          </Button>
          <Button
            disabled={!scene.clips.length}
            onClick={() => {
              stop();
              setExportOpen(true);
            }}
          >
            Export audio
          </Button>
        </div>
        <label className="block text-sm text-muted">
          Scene position · {position.toFixed(3)} / {scene.duration.toFixed(3)} s
          <input
            aria-label="Seek scene"
            type="range"
            min="0"
            max={Math.max(0, scene.duration)}
            step="0.001"
            value={position}
            className="block h-11 w-full accent-brand"
            onChange={(event) => {
              seek(Number(event.currentTarget.value));
            }}
          />
        </label>
        {videoUrl && (
          <p className="text-xs tabular-nums text-muted">
            Picture frame · {pictureTime.toFixed(3)} s
          </p>
        )}
        <label className="block text-sm text-muted">
          Exact scene position (seconds)
          <input
            type="number"
            min="0"
            max={scene.duration}
            step="0.001"
            value={Number(position.toFixed(3))}
            onChange={(event) => seek(Number(event.currentTarget.value))}
            className={inputClass}
          />
        </label>
        <SfxSoundLibrary
          catalogs={ownedCatalogs}
          accountId={accountId}
          position={position}
          disabled={busy || scene.clips.length >= MAX_SCENE_CLIPS || position >= scene.duration}
          preview={previewPlayer.state}
          onPreview={previewPlayer.toggleRecordingPlayback}
          onStopPreview={previewPlayer.stopRecordingPlayback}
          onAdd={(id) => void addSound(id)}
        />
        <output className="block min-h-5 text-sm text-muted">
          {busy ? 'Loading originals or saving scene…' : ''}
        </output>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm text-muted">
            Saved account scenes
            <select
              className={inputClass}
              value={savedId}
              onChange={(event) => setSavedId(event.currentTarget.value)}
            >
              <option value="">Choose a saved scene</option>
              {savedScenes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.duration}s
                </option>
              ))}
            </select>
          </label>
          <Button variant="secondary" disabled={!savedId} onClick={() => void open()}>
            Open scene
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (
                dirty &&
                scene.clips.length &&
                !window.confirm('Start a new scene and discard unsaved changes?')
              )
                return;
              commit({
                version: 1,
                id: crypto.randomUUID(),
                productId: catalog.productId,
                name: 'Untitled scene',
                duration: 30,
                clips: [],
              });
              setSavedId('');
              setLocalVideo(null);
            }}
          >
            New scene
          </Button>
        </div>
      </fieldset>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="sr-only">Sounds on the scene timeline</legend>
        <div className="flex justify-between text-xs text-muted">
          <span>0 s</span>
          <span>{(scene.duration / 2).toFixed(1)} s</span>
          <span>{scene.duration.toFixed(1)} s</span>
        </div>
        {!!scene.video?.markers.length && (
          <nav className="flex flex-wrap gap-2" aria-label="Timeline moments">
            {scene.video.markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                onClick={() => seek(marker.time)}
                className="min-h-11 rounded-lg border border-brand/30 px-3 text-xs text-brand focus-visible:ring-2 focus-visible:ring-brand"
              >
                {marker.name} · {marker.time.toFixed(3)} s
              </button>
            ))}
          </nav>
        )}
        {!scene.clips.length && (
          <p className="rounded-xl border border-dashed border-outline p-8 text-center text-muted">
            Add your first sound to start building a scene.
          </p>
        )}
        {scene.clips.map((clip, index) => {
          const recording = libraryRecordings.find((item) => item.id === clip.recordingId);
          const original = originals.get(clip.recordingId);
          const sourceDuration = original
            ? original.channels[0].length / original.sampleRate
            : (recording?.durationMs ?? 0) / 1000;
          return (
            <article
              key={clip.id}
              className={`rounded-xl border p-4 ${clip.mute ? 'border-outline bg-background' : 'border-brand/30 bg-surface'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-medium text-foreground">
                  {index + 1}. {recording?.title ?? 'Unavailable sound'}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={position + clip.length > scene.duration}
                    onClick={() => {
                      if (videoUrl && videoElement.current?.seeking) {
                        setMessage('Wait for the selected picture frame, then place the sound.');
                        return;
                      }
                      const at =
                        videoUrl && videoElement.current?.requestVideoFrameCallback
                          ? pictureTime
                          : position;
                      if (at + clip.length <= scene.duration) updateClip(clip.id, { offset: at });
                    }}
                  >
                    {videoUrl ? 'Place at current frame' : 'Place at playhead'}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={scene.clips.length >= MAX_SCENE_CLIPS}
                    onClick={() =>
                      commit({
                        ...scene,
                        clips: [...scene.clips, { ...clip, id: crypto.randomUUID() }],
                      })
                    }
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      commit({ ...scene, clips: scene.clips.filter((item) => item.id !== clip.id) })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <svg
                viewBox="0 0 1000 60"
                preserveAspectRatio="none"
                className="my-3 h-14 w-full text-brand"
                role="img"
                aria-label={`${recording?.title} from ${clip.offset} to ${clip.offset + clip.length} seconds`}
              >
                <title>Sound placement on the common timeline</title>
                <rect
                  x="0"
                  y="0"
                  width="1000"
                  height="60"
                  className="text-elevated"
                  fill="currentColor"
                />
                <rect
                  x={scene.duration > 0 ? (clip.offset / scene.duration) * 1000 : 0}
                  y="8"
                  width={scene.duration > 0 ? (clip.length / scene.duration) * 1000 : 0}
                  height="44"
                  rx="4"
                  fill="currentColor"
                  opacity={clip.mute ? 0.2 : 0.65}
                />
                <path
                  d={`M ${scene.duration > 0 ? (position / scene.duration) * 1000 : 0} 0 V 60`}
                  className="text-foreground"
                  stroke="currentColor"
                />
              </svg>
              <label className="block text-xs text-muted">
                Move sound · {clip.offset.toFixed(3)} s
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, scene.duration - clip.length)}
                  step="0.001"
                  value={clip.offset}
                  className="h-11 w-full accent-brand"
                  onChange={(event) =>
                    updateClip(clip.id, { offset: Number(event.currentTarget.value) })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    { field: 'offset', label: 'Starts in scene', max: scene.duration },
                    { field: 'start', label: 'Source start', max: sourceDuration },
                    { field: 'end', label: 'Source end', max: sourceDuration },
                    { field: 'length', label: 'Sound length', max: scene.duration - clip.offset },
                    { field: 'fadeIn', label: 'Fade In', max: clip.length },
                    { field: 'fadeOut', label: 'Fade Out', max: clip.length },
                  ] satisfies {
                    field: 'offset' | 'start' | 'end' | 'length' | 'fadeIn' | 'fadeOut';
                    label: string;
                    max: number;
                  }[]
                ).map(({ field, label, max }) => (
                  <label key={field} className="text-xs text-muted">
                    {label} (s)
                    <input
                      type="number"
                      min="0"
                      max={Math.max(0, max)}
                      step="0.001"
                      value={clip[field]}
                      className={inputClass}
                      onChange={(event) => {
                        const value = Number(event.currentTarget.value);
                        const patch: Partial<SfxSceneClip> = { [field]: value };
                        if ((field === 'start' || field === 'end') && !clip.loop)
                          patch.length = Math.min(
                            clip.length,
                            field === 'start' ? clip.end - value : value - clip.start,
                          );
                        updateClip(clip.id, patch);
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-muted">
                  Level · {Math.round(clip.gain * 100)}%
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={clip.gain}
                    className="block h-11 w-full accent-brand"
                    onChange={(event) =>
                      updateClip(clip.id, { gain: Number(event.currentTarget.value) })
                    }
                  />
                </label>
                <label className="text-xs text-muted">
                  Left / Right ·{' '}
                  {clip.pan === 0
                    ? 'Center'
                    : `${Math.round(Math.abs(clip.pan) * 100)}% ${clip.pan < 0 ? 'Left' : 'Right'}`}
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={clip.pan}
                    className="block h-11 w-full accent-brand"
                    onChange={(event) =>
                      updateClip(clip.id, { pan: Number(event.currentTarget.value) })
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {(['mute', 'solo', 'loop'] as const).map((field) => (
                  <label
                    key={field}
                    className="flex min-h-11 items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={clip[field]}
                      className="accent-brand"
                      onChange={(event) =>
                        updateClip(clip.id, {
                          [field]: event.currentTarget.checked,
                          ...(field === 'loop' && !event.currentTarget.checked
                            ? { length: Math.min(clip.length, clip.end - clip.start) }
                            : {}),
                        })
                      }
                    />
                    {field === 'mute'
                      ? 'Mute'
                      : field === 'solo'
                        ? 'Solo'
                        : 'Loop selected segment'}
                  </label>
                ))}
              </div>
              {clip.loop && (
                <label className="block max-w-xs text-xs text-muted">
                  Soft loop transition (seconds)
                  <input
                    type="number"
                    min="0"
                    max={Math.max(0, (clip.end - clip.start) / 2)}
                    step="0.001"
                    value={clip.crossfade}
                    className={inputClass}
                    onChange={(event) =>
                      updateClip(clip.id, { crossfade: Number(event.currentTarget.value) })
                    }
                  />
                </label>
              )}
            </article>
          );
        })}
      </fieldset>
      <p className="text-xs text-muted">
        Original WAV recordings stay unchanged. Up to 12 sounds and 5 minutes per scene. Scenes save
        to your account; originals are loaded again when you open them on another device.
      </p>
    </section>
  );
}
