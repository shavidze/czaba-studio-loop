import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const CLIP_GAIN_LABEL = 'Clip Gain';
const PENDING_FULL_TEXT = 'Unsaved — Enter saves, Esc reverts';
const PENDING_VISIBLE_LABEL = 'Unsaved';
const PENDING_HIDDEN_HINT = ' — Enter saves, Esc reverts';
const CLIP_GAIN_VIDEO_REASON = 'A video clip has no Clip Gain — use the track Volume/Mute';
const CLIP_GAIN_GROUP_REASON =
  'Clip Gain works on audio clips only — remove the video from the selection';
const RANGE_GROUP_REASON = 'A time selection is set on one clip — select only one';

const fakeClock = { base: 0 };

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
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
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

const fitCollection: WorkspaceCollection = {
  id: 'detail-panel-fit',
  label: 'detail-panel-fit',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'detail-panel-fit',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'detail-panel-fit', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function fitArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

interface FitApiRef {
  current: ArrangementContextValue | null;
}

function FitProbe({ api }: { api: FitApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FitApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(readApi: () => ArrangementContextValue): string[] {
  const labels: string[] = [];
  for (let label = readApi().undoLabel; label !== null; label = readApi().undoLabel) {
    labels.push(label);
    act(() => readApi().undo());
  }
  return labels;
}

function classTokens(element: Element | null | undefined): string[] {
  return (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

async function mountFitWorkspace() {
  const api: FitApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={fitCollection} initialArrangement={fitArrangement()}>
      <StudioWorkspace />
      <FitProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
  const field = () => {
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain input missing');
    }
    return input;
  };
  const reset = () => {
    const button = view.getByTestId('arrangement-detail-clip-gain-reset');
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('clip gain reset missing');
    }
    return button;
  };
  const marker = () => view.queryByTestId('arrangement-detail-clip-gain-pending');
  const infoColumn = () => {
    const column = view.getByTestId('arrangement-detail-content').firstElementChild;
    if (!column) {
      throw new Error('info column missing');
    }
    return column;
  };
  return { api, view, field, reset, marker, infoColumn };
}

function expectResetRow(reset: HTMLButtonElement) {
  const row = reset.parentElement;
  expect(row?.getAttribute('data-testid')).not.toBe('arrangement-detail-clip-gain');
  expect(classTokens(row)).toEqual(expect.arrayContaining(['flex', 'items-center']));
}

describe('detail panel content fits its height (D-29z5, C-R39-01, C-R30-01)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('F1: the pending marker shows one truncating label and keeps the full hint for screen readers and hover', async () => {
    const { api, field, marker } = await mountFitWorkspace();
    act(() => live(api).selectClip('s1'));
    fireEvent.change(field(), { target: { value: '3' } });
    const element = marker();
    expect(element).not.toBeNull();
    expect(classTokens(element)).toEqual(expect.arrayContaining(['truncate', 'min-w-0']));
    const first = element?.childNodes[0];
    expect(first?.nodeType).toBe(Node.TEXT_NODE);
    expect(first?.nodeValue).toBe(PENDING_VISIBLE_LABEL);
    expect(element?.querySelector('.sr-only')?.textContent).toBe(PENDING_HIDDEN_HINT);
    expect(element?.textContent).toBe(PENDING_FULL_TEXT);
    expect(element?.getAttribute('title')).toBe(PENDING_FULL_TEXT);
  });

  it('F2: the marker shares one flex row with the 0 dB button', async () => {
    const { api, field, reset, marker } = await mountFitWorkspace();
    act(() => live(api).selectClip('s1'));
    fireEvent.change(field(), { target: { value: '3' } });
    const element = marker();
    expect(element).not.toBeNull();
    expect(element?.parentElement).toBe(reset().parentElement);
    expectResetRow(reset());
  });

  it('F3: the input carries the full hint as its title only while pending (Enter and Escape)', async () => {
    const { api, field, reset, marker } = await mountFitWorkspace();
    act(() => live(api).selectClip('s1'));
    expect(field().hasAttribute('title')).toBe(false);
    fireEvent.change(field(), { target: { value: '3' } });
    expect(field().getAttribute('title')).toBe(PENDING_FULL_TEXT);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().hasAttribute('title')).toBe(false);
    expect(marker()).toBeNull();
    expectResetRow(reset());
    fireEvent.change(field(), { target: { value: '5' } });
    expect(field().getAttribute('title')).toBe(PENDING_FULL_TEXT);
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field().value).toBe('3.0');
    expect(field().hasAttribute('title')).toBe(false);
    expect(marker()).toBeNull();
    expectResetRow(reset());
  });

  it('F4: while pending the border is warning, otherwise outline-strong; focus adds no ring recipe of its own (SABA-B-4 R87)', async () => {
    const { api, field } = await mountFitWorkspace();
    const focusTokens = (tokens: string[]) =>
      tokens.filter((token) => token.startsWith('focus-visible:') || token.startsWith('focus:'));
    act(() => live(api).selectClip('s1'));
    expect(classTokens(field())).toContain('border-outline-strong');
    expect(focusTokens(classTokens(field()))).toStrictEqual([]);
    fireEvent.change(field(), { target: { value: '3' } });
    const pendingTokens = classTokens(field());
    expect(pendingTokens).toContain('border-warning');
    expect(focusTokens(pendingTokens)).toStrictEqual([]);
    expect(pendingTokens).not.toContain('border-outline-strong');
    fireEvent.change(field(), { target: { value: '0.0' } });
    expect(classTokens(field())).toContain('border-outline-strong');
    expect(classTokens(field())).not.toContain('border-warning');
    expect(focusTokens(classTokens(field()))).toStrictEqual([]);
  });

  it('F5: the disabled reason lines stay whole, untruncated and linked (video, then a group)', async () => {
    const { api, view, field } = await mountFitWorkspace();
    act(() => live(api).selectClip('v1'));
    const videoReason = view.getByTestId('arrangement-detail-clip-gain-reason');
    expect(videoReason.textContent).toBe(CLIP_GAIN_VIDEO_REASON);
    expect(classTokens(videoReason)).not.toContain('truncate');
    expect(videoReason.hasAttribute('title')).toBe(false);
    expect(field().getAttribute('aria-describedby')).toBe(videoReason.id);
    act(() => live(api).selectClips(['m1', 'v1']));
    const groupReason = view.getByTestId('arrangement-detail-clip-gain-reason');
    const rangeReason = view.getByTestId('arrangement-detail-reason');
    expect(groupReason.textContent).toBe(CLIP_GAIN_GROUP_REASON);
    expect(rangeReason.textContent).toBe(RANGE_GROUP_REASON);
    for (const reason of [groupReason, rangeReason]) {
      expect(classTokens(reason)).not.toContain('truncate');
      expect(reason.hasAttribute('title')).toBe(false);
    }
    expect(field().getAttribute('aria-describedby')).toBe(groupReason.id);
    expect(view.getByTestId('arrangement-detail-start').getAttribute('aria-describedby')).toBe(
      rangeReason.id,
    );
  });

  it('F8: the truncating info lines keep their line box (shrink-0) for a clip and a group', async () => {
    const { api, view, infoColumn } = await mountFitWorkspace();
    act(() => live(api).selectClip('s1'));
    const [title, lane] = Array.from(infoColumn().children);
    expect(title?.textContent).toBe('Hit');
    expect(classTokens(title)).toEqual(expect.arrayContaining(['truncate', 'shrink-0']));
    expect(lane?.textContent).toBe('Track SFX');
    expect(classTokens(lane)).toEqual(expect.arrayContaining(['truncate', 'shrink-0']));
    act(() => live(api).selectClips(['m1', 's1']));
    const laneNames = view.getByTestId('arrangement-detail-group').children[1];
    expect(laneNames?.textContent).toBe('Tracks მუსიკა, SFX');
    expect(classTokens(laneNames)).toEqual(expect.arrayContaining(['truncate', 'shrink-0']));
  });

  it('F9: the 0 dB reset from a pending value still stores 0 and removes the marker', async () => {
    const { api, field, reset, marker } = await mountFitWorkspace();
    act(() => live(api).selectClip('s1'));
    fireEvent.change(field(), { target: { value: '3' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    fireEvent.change(field(), { target: { value: '5' } });
    expect(marker()).not.toBeNull();
    fireEvent.click(reset());
    const clip = live(api).arrangement.clips.find((entry) => entry.id === 's1');
    expect(clip).toBeDefined();
    expect(clip && Object.hasOwn(clip, 'gainDb')).toBe(false);
    expect(field().value).toBe('0.0');
    expect(marker()).toBeNull();
    expect(undoChainLabels(() => live(api))).toEqual([CLIP_GAIN_LABEL, CLIP_GAIN_LABEL]);
  });
});
