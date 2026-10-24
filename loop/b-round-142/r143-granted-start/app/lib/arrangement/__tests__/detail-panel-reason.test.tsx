import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { STUDIO_SCROLLBAR_CLASS } from '~/components/arrangement/studio-scrollbar';
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

const RANGE_GROUP_REASON = 'A time selection is set on one clip — select only one';
const CLIP_GAIN_GROUP_REASON =
  'Clip Gain works on audio clips only — remove the video from the selection';
const CLIP_GAIN_VIDEO_REASON =
  'A video clip has no Clip Gain — for its sound use the track Volume/Mute';
const NONE_REASON = 'Select a clip first';
const VIDEO_PLACEHOLDER = 'Video clip · no waveform';
const RANGE_REASON_ID = 'arrangement-detail-reason';
const CLIP_GAIN_REASON_ID = 'arrangement-detail-clip-gain-reason';

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

const reasonCollection: WorkspaceCollection = {
  id: 'detail-panel-reason',
  label: 'detail-panel-reason',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'detail-panel-reason',
      kind: 'music',
      origin: 'demo',
    },
    {
      id: 'hit',
      title: 'Hit',
      collectionLabel: 'detail-panel-reason',
      kind: 'sfx',
      origin: 'demo',
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function reasonArrangement(): Arrangement {
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

interface ReasonApiRef {
  current: ArrangementContextValue | null;
}

function ReasonProbe({ api }: { api: ReasonApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ReasonApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function classTokens(element: Element | null | undefined): string[] {
  return (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

async function mountReasonWorkspace() {
  const api: ReasonApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={reasonCollection} initialArrangement={reasonArrangement()}>
      <StudioWorkspace />
      <ReasonProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
  const content = () => view.getByTestId('arrangement-detail-content');
  const middle = () => {
    const box = content().children[1];
    if (!box) {
      throw new Error('middle box missing');
    }
    return box;
  };
  const startInput = () => view.getByTestId('arrangement-detail-start');
  const rangeColumn = () => {
    const start = startInput();
    const column = Array.from(content().children).find((child) => child.contains(start));
    if (!column) {
      throw new Error('range column missing');
    }
    return column;
  };
  const clipGainColumn = () => view.getByTestId('arrangement-detail-clip-gain');
  const field = () => {
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain input missing');
    }
    return input;
  };
  const reset = () => view.getByTestId('arrangement-detail-clip-gain-reset');
  const rangeReason = () => view.getByTestId(RANGE_REASON_ID);
  const clipGainReason = () => view.getByTestId(CLIP_GAIN_REASON_ID);
  return {
    api,
    view,
    content,
    middle,
    startInput,
    rangeColumn,
    clipGainColumn,
    field,
    reset,
    rangeReason,
    clipGainReason,
  };
}

describe('disabled-control reasons stay visible in every state (D-29z6, C-R40-01)', () => {
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

  it('RF1: a group shows the range reason and then the Clip Gain reason in the middle box, still linked', async () => {
    const mounted = await mountReasonWorkspace();
    act(() => live(mounted.api).selectClips(['m1', 'v1']));
    const rangeReason = mounted.rangeReason();
    const clipGainReason = mounted.clipGainReason();
    const middle = mounted.middle();
    expect(middle.contains(rangeReason)).toBe(true);
    expect(middle.contains(clipGainReason)).toBe(true);
    expect(
      rangeReason.compareDocumentPosition(clipGainReason) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    for (const reason of [rangeReason, clipGainReason]) {
      expect(mounted.rangeColumn().contains(reason)).toBe(false);
      expect(mounted.clipGainColumn().contains(reason)).toBe(false);
    }
    expect(rangeReason.textContent).toBe(RANGE_GROUP_REASON);
    expect(clipGainReason.textContent).toBe(CLIP_GAIN_GROUP_REASON);
    expect(rangeReason.id).not.toBe('');
    expect(clipGainReason.id).not.toBe('');
    expect(mounted.startInput().getAttribute('aria-describedby')).toBe(rangeReason.id);
    expect(
      mounted.view.getByTestId('arrangement-detail-end').getAttribute('aria-describedby'),
    ).toBe(rangeReason.id);
    expect(mounted.field().getAttribute('aria-describedby')).toBe(clipGainReason.id);
  });

  it('RF2: a video clip shows the Clip Gain reason in the waveform box below the placeholder, not inside it', async () => {
    const mounted = await mountReasonWorkspace();
    act(() => live(mounted.api).selectClip('v1'));
    const waveform = mounted.view.getByTestId('arrangement-detail-waveform');
    const placeholder = mounted.view.getByTestId('arrangement-detail-video-placeholder');
    const reason = mounted.clipGainReason();
    expect(waveform.contains(reason)).toBe(true);
    expect(placeholder.textContent).toBe(VIDEO_PLACEHOLDER);
    expect(placeholder.contains(reason)).toBe(false);
    expect(placeholder.parentElement).not.toBeNull();
    expect(reason.parentElement).toBe(placeholder.parentElement);
    expect(placeholder.compareDocumentPosition(reason) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(mounted.clipGainColumn().contains(reason)).toBe(false);
    expect(reason.textContent).toBe(CLIP_GAIN_VIDEO_REASON);
    expect(mounted.field().disabled).toBe(true);
    expect(mounted.field().title).toBe(CLIP_GAIN_VIDEO_REASON);
    expect(reason.id).not.toBe('');
    expect(mounted.field().getAttribute('aria-describedby')).toBe(reason.id);
    expect(mounted.view.queryByTestId(RANGE_REASON_ID)).toBeNull();
  });

  it('RF3: with nothing selected both reasons stay in their columns and the middle box stays empty', async () => {
    const mounted = await mountReasonWorkspace();
    const rangeReason = mounted.rangeReason();
    const clipGainReason = mounted.clipGainReason();
    expect(mounted.rangeColumn().contains(rangeReason)).toBe(true);
    expect(mounted.clipGainColumn().contains(clipGainReason)).toBe(true);
    expect(rangeReason.textContent).toBe(NONE_REASON);
    expect(clipGainReason.textContent).toBe(NONE_REASON);
    expect(mounted.middle().contains(rangeReason)).toBe(false);
    expect(mounted.middle().contains(clipGainReason)).toBe(false);
    expect(mounted.middle().childElementCount).toBe(0);
  });

  it('RF4: an audio clip has no reason, no text in the waveform and the pending marker in the reset row', async () => {
    const mounted = await mountReasonWorkspace();
    act(() => live(mounted.api).selectClip('s1'));
    fireEvent.change(mounted.field(), { target: { value: '3' } });
    expect(mounted.view.queryByTestId(RANGE_REASON_ID)).toBeNull();
    expect(mounted.view.queryByTestId(CLIP_GAIN_REASON_ID)).toBeNull();
    expect(
      mounted.view.getByTestId('arrangement-detail-waveform').querySelectorAll('p'),
    ).toHaveLength(0);
    const marker = mounted.view.getByTestId('arrangement-detail-clip-gain-pending');
    expect(mounted.clipGainColumn().contains(marker)).toBe(true);
    expect(marker.parentElement).toBe(mounted.reset().parentElement);
  });

  it('RF5: the content scroller uses the Studio scrollbar class and keeps overflow-y-auto', async () => {
    const mounted = await mountReasonWorkspace();
    const tokens = classTokens(mounted.content());
    expect(tokens).toEqual(expect.arrayContaining(STUDIO_SCROLLBAR_CLASS.split(' ')));
    expect(tokens).toContain('overflow-y-auto');
    act(() => live(mounted.api).selectClips(['m1', 's1']));
    expect(classTokens(mounted.content())).toEqual(
      expect.arrayContaining([...STUDIO_SCROLLBAR_CLASS.split(' '), 'overflow-y-auto']),
    );
  });

  it('RF6: every visible reason stays text-dim, untruncated, without a title and whole (group, then video)', async () => {
    const mounted = await mountReasonWorkspace();
    act(() => live(mounted.api).selectClips(['m1', 'v1']));
    const groupReasons: Array<[HTMLElement, string]> = [
      [mounted.rangeReason(), RANGE_GROUP_REASON],
      [mounted.clipGainReason(), CLIP_GAIN_GROUP_REASON],
    ];
    for (const [reason, text] of groupReasons) {
      expect(reason.className).toBe('text-dim');
      expect(reason.hasAttribute('title')).toBe(false);
      expect(reason.textContent).toBe(text);
    }
    act(() => live(mounted.api).selectClip('v1'));
    const videoReason = mounted.clipGainReason();
    expect(videoReason.className).toBe('text-dim');
    expect(videoReason.hasAttribute('title')).toBe(false);
    expect(videoReason.textContent).toBe(CLIP_GAIN_VIDEO_REASON);
  });
});
