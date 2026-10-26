import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  decodeVideoAudio,
  probeVideoFile,
  type VideoProbeResult,
  videoProbeErrorMessage,
} from '~/lib/arrangement/video.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: vi.fn(),
  resetArrangementMp3Encoder: vi.fn(),
}));

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  currentTime = 0;
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
  }
}

class FakeOfflineAudioContext {}

const emptyCollection: WorkspaceCollection = {
  id: 'video-import',
  label: 'video-import',
  origin: 'demo',
  sources: [],
  loadSource: async () => {
    throw new Error('no sources');
  },
};

function emptyVideoArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [],
  };
}

interface VideoImportApiRef {
  current: ArrangementContextValue | null;
}

function VideoImportProbe({ api }: { api: VideoImportApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: VideoImportApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushImport() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountVideoImport() {
  const api: VideoImportApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={emptyCollection} initialArrangement={emptyVideoArrangement()}>
      <VideoImportProbe api={api} />
    </ArrangementProvider>,
  );
  await flushImport();
  return { api, view };
}

function videoClips(api: VideoImportApiRef) {
  return live(api).arrangement.clips.filter((clip) => clip.trackId === 'video');
}

describe('V-0.2c1 video import status texts in the Context', () => {
  beforeEach(() => {
    probeVideoMock.mockReset();
    decodeVideoMock.mockReset();
    decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('VI1 a good import shows Opening, then the added status, the history label and one clip at 0', async () => {
    let resolveProbe: (result: VideoProbeResult) => void = () => undefined;
    probeVideoMock.mockImplementation(
      () =>
        new Promise<VideoProbeResult>((resolve) => {
          resolveProbe = resolve;
        }),
    );
    const { api } = await mountVideoImport();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
    });
    await flushImport();
    expect(probeVideoMock).toHaveBeenCalledTimes(1);
    expect(live(api).status).toBe('Opening “film.mp4”…');
    expect(videoClips(api)).toHaveLength(0);
    await act(async () => {
      resolveProbe({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    });
    await flushImport();
    expect(live(api).status).toBe('“film.mp4” added to the video track: 00:00.000 — 00:04.000');
    expect(live(api).undoLabel).toBe('Add video — film.mp4');
    const clips = videoClips(api);
    expect(clips).toHaveLength(1);
    expect(clips[0]?.start).toBe(0);
    expect(clips[0]?.duration).toBe(4);
  });

  it('VI2 a probe failure shows the probe error and adds no clip', async () => {
    probeVideoMock.mockRejectedValue(new Error(videoProbeErrorMessage('bad.mp4')));
    const { api } = await mountVideoImport();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'bad.mp4', { type: 'video/mp4' })]);
    });
    await flushImport();
    expect(probeVideoMock).toHaveBeenCalledTimes(1);
    expect(live(api).status).toBe(
      '“bad.mp4”: the browser could not open this video — try MP4 (H.264) or WebM.',
    );
    expect(videoClips(api)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('VI3 a rejected batch joins both rejections in order and never probes', async () => {
    const { api } = await mountVideoImport();
    await act(async () => {
      live(api).importVideoFiles([
        new File(['x'], 'tone.wav', { type: 'audio/wav' }),
        new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
      ]);
    });
    await flushImport();
    expect(live(api).status).toBe(
      [
        '“tone.wav”: audio files cannot be added here — only your own video can; sounds are added from the library.',
        '“doc.pdf”: the format is not video (.pdf).',
      ].join(' · '),
    );
    expect(probeVideoMock).not.toHaveBeenCalled();
    expect(videoClips(api)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('VI4 a video without sound stores audio none and the English no-sound note', async () => {
    probeVideoMock.mockResolvedValue({ url: 'blob:quiet', duration: 2, width: 640, height: 360 });
    decodeVideoMock.mockResolvedValue({ buffer: null, reason: 'no-audio' });
    const { api } = await mountVideoImport();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'quiet.mp4', { type: 'video/mp4' })]);
    });
    await flushImport();
    expect(decodeVideoMock).toHaveBeenCalledTimes(1);
    const sources = [...live(api).videoSources.values()];
    expect(sources).toHaveLength(1);
    expect(sources[0]?.audio).toBe('none');
    expect(sources[0]?.audioNote).toBe('The video has no sound');
  });
});
