import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  decodeSfxWav,
  encodeSfxWav,
  renderSfxEdit,
  type SfxAudio,
  type SfxEdit,
} from '~/lib/sfx-edit';
import { apiClient, type ProductRecording } from '~/services/api/client';

interface Props {
  productId: number;
  recording: ProductRecording;
  token: string;
  onClose: () => void;
}

export function SfxQuickEdit({ productId, recording, token, onClose }: Props) {
  const [audio, setAudio] = useState<SfxAudio | null>(null);
  const [edit, setEdit] = useState<SfxEdit>({ start: 0, end: 0, gain: 1, fadeIn: 0, fadeOut: 0 });
  const [history, setHistory] = useState<SfxEdit[]>([]);
  const [error, setError] = useState('');
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const context = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const playbackRequest = useRef(0);
  const startedAt = useRef(0);
  const playbackOffset = useRef(0);
  const duration = audio ? audio.channels[0].length / audio.sampleRate : 0;
  const valid = !!audio && edit.start >= 0 && edit.end <= duration && edit.end > edit.start;
  const stop = () => {
    playbackRequest.current++;
    if (source.current) {
      source.current.onended = null;
      source.current.stop();
      source.current = null;
    }
    setPlaying(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    setAudio(null);
    setError('');
    const fetchOriginal = (accessToken: string) =>
      fetch(`/api/recording-original?product=${productId}&recording=${recording.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
        cache: 'no-store',
      });
    fetchOriginal(apiClient.getAccessToken() ?? token)
      .then(async (initialResponse) => {
        let response = initialResponse;
        if (response.status === 401) {
          await apiClient.getProductRecordingCatalog(productId);
          response = await fetchOriginal(apiClient.getAccessToken() ?? token);
        }
        if (!response.ok)
          throw new Error(
            response.status === 403
              ? 'Collection ownership is required.'
              : 'Original recording unavailable. Please retry.',
          );
        const original = decodeSfxWav(await response.arrayBuffer());
        if (controller.signal.aborted) return;
        setAudio(original);
        setEdit({
          start: 0,
          end: original.channels[0].length / original.sampleRate,
          gain: 1,
          fadeIn: 0,
          fadeOut: 0,
        });
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Unable to load original.');
      });
    return () => {
      controller.abort();
      playbackRequest.current++;
      source.current?.stop();
      source.current = null;
      void context.current?.close();
      context.current = null;
    };
  }, [productId, recording.id, token]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const elapsed =
        (context.current?.currentTime ?? 0) - startedAt.current + playbackOffset.current;
      const length = edit.end - edit.start;
      setPosition(edit.start + (loop ? elapsed % length : Math.min(elapsed, length)));
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, edit.start, edit.end, loop]);

  const peaks = useMemo(() => {
    if (!audio) return [];
    const samples = audio.channels[0];
    const step = Math.max(1, Math.floor(samples.length / 400));
    return Array.from({ length: 400 }, (_, i) => {
      let peak = 0;
      for (
        let at = i * step;
        at < Math.min(samples.length, (i + 1) * step);
        at += Math.max(1, Math.floor(step / 100))
      )
        peak = Math.max(peak, Math.abs(samples[at]));
      return peak;
    });
  }, [audio]);

  const change = (next: SfxEdit) => {
    stop();
    setHistory((items) => [...items.slice(-49), edit]);
    setEdit(next);
    setPosition(next.start);
  };
  const play = async (at = edit.start) => {
    if (!audio || !valid) return;
    stop();
    setError('');
    try {
      const engine = context.current ?? new AudioContext();
      context.current = engine;
      const requestId = playbackRequest.current;
      await engine.resume();
      if (requestId !== playbackRequest.current) return;
      const rendered = renderSfxEdit(audio, edit);
      const buffer = engine.createBuffer(
        rendered.channels.length,
        rendered.channels[0].length,
        rendered.sampleRate,
      );
      rendered.channels.forEach((channel, index) => {
        buffer.copyToChannel(new Float32Array(channel), index);
      });
      const node = engine.createBufferSource();
      node.buffer = buffer;
      node.loop = loop;
      node.connect(engine.destination);
      const offset = Math.max(
        0,
        Math.min(at - edit.start, buffer.duration - 1 / buffer.sampleRate),
      );
      startedAt.current = engine.currentTime;
      playbackOffset.current = offset;
      source.current = node;
      node.onended = () => {
        if (source.current === node) {
          setPlaying(false);
          setPosition(edit.end);
          source.current = null;
        }
      };
      node.start(0, offset);
      setPlaying(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Playback failed.');
    }
  };
  const download = () => {
    if (!audio || !valid) return;
    try {
      const blob = new Blob([encodeSfxWav(renderSfxEdit(audio, edit))], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recording.title.replace(/[^a-z0-9_-]+/gi, '-')}_${edit.start.toFixed(3)}-${edit.end.toFixed(3)}s_CZABA.wav`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Export failed.');
    }
  };
  const inputClass =
    'mt-2 min-h-11 w-full rounded-lg border border-outline bg-background px-3 text-foreground focus-visible:ring-2 focus-visible:ring-brand';

  return (
    <section
      aria-label="Sound Effects Quick Edit"
      className="mb-8 rounded-xl border border-brand/40 bg-surface p-4 sm:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-brand uppercase tracking-widest">Sound Effects · Quick Edit</p>
          <h2 className="mt-2 font-serif text-xl text-foreground">{recording.title}</h2>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close editor
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {!audio ? (
        <output className="block text-muted">
          {error ? 'Close and reopen to retry.' : 'Loading original WAV…'}
        </output>
      ) : (
        <>
          <p className="text-xs text-muted">
            Original WAV · {audio.sampleRate / 1000} kHz · {audio.channels.length} channels · 24-bit
            WAV export
          </p>
          <svg
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="h-32 w-full text-brand"
            role="img"
            aria-label="Original recording waveform"
          >
            <title>Original recording waveform and selected region</title>
            <rect
              x={(edit.start / duration) * 400}
              width={Math.max(0, ((edit.end - edit.start) / duration) * 400)}
              height="100"
              fill="currentColor"
              opacity="0.15"
            />
            <path
              d={peaks
                .map((peak, index) => `M ${index} ${50 - peak * 48} V ${50 + peak * 48}`)
                .join(' ')}
              stroke="currentColor"
            />
            <path
              d={`M ${(position / duration) * 400} 0 V 100`}
              className="text-foreground"
              stroke="currentColor"
            />
          </svg>
          <label className="block text-sm text-muted">
            Seek · {position.toFixed(3)} s
            <input
              type="range"
              min={edit.start}
              max={Math.max(edit.start, edit.end)}
              step="0.001"
              value={position}
              disabled={!valid}
              className="block h-11 w-full accent-brand"
              onChange={(event) => {
                const at = Number(event.currentTarget.value);
                setPosition(at);
                if (playing) void play(at);
              }}
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['start', 'end'] as const).map((field) => (
              <label key={field} className="text-sm text-muted">
                {field === 'start' ? 'Selection start' : 'Selection end'} (seconds)
                <input
                  type="number"
                  min="0"
                  max={duration}
                  step="0.001"
                  value={edit[field]}
                  className={inputClass}
                  onChange={(event) =>
                    change({ ...edit, [field]: Number(event.currentTarget.value) })
                  }
                />
                <input
                  type="range"
                  aria-label={`${field} selection`}
                  min="0"
                  max={duration}
                  step="0.001"
                  value={edit[field]}
                  className="h-11 w-full accent-brand"
                  onChange={(event) =>
                    change({ ...edit, [field]: Number(event.currentTarget.value) })
                  }
                />
              </label>
            ))}
          </div>
          <output className={valid ? 'text-sm text-muted' : 'text-sm text-destructive'}>
            {valid
              ? `${(edit.end - edit.start).toFixed(3)} seconds selected`
              : 'End must be after start and within the recording.'}
          </output>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="text-sm text-muted">
              Level · {Math.round(edit.gain * 100)}%
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={edit.gain}
                className="block h-11 w-full accent-brand"
                onChange={(event) => change({ ...edit, gain: Number(event.currentTarget.value) })}
              />
            </label>
            {(['fadeIn', 'fadeOut'] as const).map((field) => (
              <label key={field} className="text-sm text-muted">
                {field === 'fadeIn' ? 'Fade In' : 'Fade Out'} (seconds)
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, edit.end - edit.start)}
                  step="0.01"
                  value={edit[field]}
                  className={inputClass}
                  onChange={(event) =>
                    change({ ...edit, [field]: Math.max(0, Number(event.currentTarget.value)) })
                  }
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!valid}
              onClick={() =>
                playing
                  ? stop()
                  : void play(position >= edit.start && position < edit.end ? position : edit.start)
              }
            >
              {playing ? 'Stop' : 'Play selection'}
            </Button>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={loop}
                onChange={(event) => {
                  stop();
                  setLoop(event.currentTarget.checked);
                }}
                className="accent-brand"
              />
              Loop selection
            </label>
            <Button
              variant="secondary"
              disabled={!history.length}
              onClick={() => {
                const previous = history[history.length - 1];
                if (previous) {
                  stop();
                  setEdit(previous);
                  setPosition(previous.start);
                  setHistory(history.slice(0, -1));
                }
              }}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() => change({ start: 0, end: duration, gain: 1, fadeIn: 0, fadeOut: 0 })}
            >
              Reset
            </Button>
            <Button disabled={!valid} onClick={download}>
              Download WAV
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
