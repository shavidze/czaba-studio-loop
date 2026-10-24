import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return {
    ...actual,
    applySchedule: vi.fn(actual.applySchedule),
  };
});

const applyScheduleMock = vi.mocked(applySchedule);

const fakeClock = { base: 0 };
const splitters: FakeSplitter[] = [];

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.outputs = [];
  }
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

class FakeAnalyser extends FakeNode {
  fftSize = 2048;
  level = 0;
  getFloatTimeDomainData(target: Float32Array) {
    target.fill(this.level);
  }
}

class FakeSplitter extends FakeNode {
  channelOutputs: Array<[FakeNode, number]> = [];
  constructor(readonly channels: number) {
    super();
  }
  connect(destination: FakeNode, output = 0) {
    this.channelOutputs.push([destination, output]);
    return super.connect(destination);
  }
}

class MeteredAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return Date.now() / 1000 - fakeClock.base;
  }
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
  createChannelSplitter(channels: number) {
    const splitter = new FakeSplitter(channels);
    splitters.push(splitter);
    return splitter;
  }
  createAnalyser() {
    return new FakeAnalyser();
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const PX_PER_SECOND = 40;
const MINUS_12_DBFS = 10 ** (-12 / 20);

const stringsCollection: WorkspaceCollection = {
  id: 'v04c-strings',
  label: 'v04c-strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'v04c-strings', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function stringsArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 20 },
      { id: 's1', trackId: 'stems', sourceId: 'song', start: 2, sourceOffset: 0, duration: 16 },
    ],
  };
}

interface StringsApiRef {
  current: ArrangementContextValue | null;
}

function StringsProbe({ api }: { api: StringsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: StringsApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tapAnalysers(splitter: FakeSplitter | undefined): FakeAnalyser[] {
  return (splitter?.channelOutputs ?? []).flatMap(([node]) =>
    node instanceof FakeAnalyser ? [node] : [],
  );
}

function trackTapOf(trackId: string): FakeSplitter {
  const tap = applyScheduleMock.mock.calls.at(-1)?.[2].trackTaps?.get(trackId);
  if (!(tap instanceof FakeSplitter)) {
    throw new Error(`no tap for ${trackId}`);
  }
  return tap;
}

describe('V-0.4c header, meter and envelope texts in the workspace', { timeout: 20_000 }, () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    splitters.length = 0;
    fakeClock.base = Date.now() / 1000;
    applyScheduleMock.mockClear();
    vi.stubGlobal('AudioContext', MeteredAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function runFrames(count = 1) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

  async function mountStringsWorkspace() {
    const api: StringsApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={stringsCollection} initialArrangement={stringsArrangement()}>
        <StudioWorkspace />
        <StringsProbe api={api} />
      </ArrangementProvider>,
    );
    for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
    }
    act(() => live(api).setPxPerSecond(PX_PER_SECOND));
    const laneName = (name: string) =>
      view.getByRole('button', {
        name: new RegExp(`^${escapeRegExp(name)} — set as the active track`),
      });
    const groupStemsAndSfx = () => {
      fireEvent.click(laneName('სტემები'));
      fireEvent.click(laneName('SFX'), { shiftKey: true });
      fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG', ctrlKey: true });
    };
    const meterOf = (trackId: string) => {
      const meter = view.container
        .querySelector<HTMLElement>(`[data-track-id="${trackId}"]`)
        ?.querySelector<HTMLElement>('[data-testid="arrangement-track-meter"]');
      if (!meter) {
        throw new Error(`meter missing on ${trackId}`);
      }
      return meter;
    };
    return { api, view, laneName, groupStemsAndSfx, meterOf };
  }

  async function startPlaying(api: StringsApiRef) {
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  }

  it('HM1 the envelope editor and a new point carry the English titles', async () => {
    const { view } = await mountStringsWorkspace();
    fireEvent.click(view.getByTestId('arrangement-envelope-toggle'));
    const clip = view.container.querySelector<HTMLElement>('[data-clip-id="s1"]');
    const editor = clip?.querySelector<HTMLElement>(
      '[data-testid="arrangement-clip-envelope-editor"]',
    );
    if (!clip || !editor) {
      throw new Error('envelope editor missing on s1');
    }
    expect(editor.getAttribute('title')).toBe('Envelope — double-click = add point');
    fireEvent.doubleClick(editor, { clientX: 160, clientY: 60 });
    const points = clip.querySelectorAll<HTMLElement>(
      '[data-testid="arrangement-clip-envelope-point"]',
    );
    expect(points).toHaveLength(1);
    expect(points[0].dataset.time).toBe('6.000');
    expect(points[0].getAttribute('title')).toBe(
      'Envelope: 6.000 s · 0.0 dB — drag · double-click = delete',
    );
  });

  it('HM2 the group name button title and the F2 input label are English', async () => {
    const { view, groupStemsAndSfx } = await mountStringsWorkspace();
    groupStemsAndSfx();
    const name = view.getByTestId('arrangement-group-name');
    expect(name.getAttribute('aria-label')).toBe('ჯგუფი 1 — group, selected');
    expect(name.getAttribute('title')).toBe(
      'F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks',
    );
    fireEvent.keyDown(name, { key: 'F2', code: 'F2' });
    const input = view.getByTestId('arrangement-group-name-input');
    expect(input.getAttribute('aria-label')).toBe('Group name — ჯგუფი 1');
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(view.queryByTestId('arrangement-group-name-input')).toBeNull();
    expect(view.getByTestId('arrangement-group-name').textContent).toContain('ჯგუფი 1');
  });

  it('HM3 the group Solo button title is the shared lane Solo title', async () => {
    const { view, groupStemsAndSfx } = await mountStringsWorkspace();
    groupStemsAndSfx();
    expect(view.getByTestId('arrangement-group-solo').getAttribute('title')).toBe(
      'Solo (Ctrl/Cmd+click = add to solo)',
    );
  });

  it('HM4 a folded group whose members hold one clip says 1 clip', async () => {
    const { view, laneName, groupStemsAndSfx } = await mountStringsWorkspace();
    groupStemsAndSfx();
    fireEvent.click(view.getByRole('button', { name: 'Fold or unfold group — ჯგუფი 1' }));
    expect(view.container.querySelectorAll('[data-overview-clip-id]')).toHaveLength(1);
    fireEvent.click(laneName('მუსიკა'));
    expect(view.getByTestId('arrangement-group-name').getAttribute('aria-label')).toBe(
      'ჯგუფი 1 — group, folded, 1 clip',
    );
  });

  it('HM5 a track meter without an over has the plain Peak title for a −12 dBFS frame', async () => {
    const { api, meterOf } = await mountStringsWorkspace();
    await startPlaying(api);
    for (const analyser of tapAnalysers(trackTapOf('music'))) {
      analyser.level = MINUS_12_DBFS;
    }
    runFrames(3);
    expect(meterOf('music').getAttribute('data-state')).toBe('clear');
    expect(meterOf('music').getAttribute('title')).toBe('მუსიკა · Peak −12.0 dBFS');
    act(() => live(api).togglePlayback());
  });

  it('HM6 the Master Peak button reads the over label, then the clear label after a reset', async () => {
    const { api, view } = await mountStringsWorkspace();
    await startPlaying(api);
    for (const analyser of tapAnalysers(splitters[0])) {
      analyser.level = 1.5;
    }
    runFrames(2);
    const peak = view.getByTestId('arrangement-master-peak');
    expect(peak.getAttribute('aria-label')).toBe(
      'Master Peak +3.5 dBFS — overload (Clip). Click to clear',
    );
    fireEvent.click(peak);
    expect(peak.getAttribute('aria-label')).toBe('Master Peak −∞ dBFS — click to clear');
    act(() => live(api).togglePlayback());
  });
});
