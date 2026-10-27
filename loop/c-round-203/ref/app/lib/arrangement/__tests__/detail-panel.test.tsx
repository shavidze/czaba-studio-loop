import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementDetailPanel } from '~/components/arrangement/ArrangementDetailPanel';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
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
  buffer: unknown = null;
  onended: (() => void) | null = null;
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

const detailCollection: WorkspaceCollection = {
  id: 'detail',
  label: 'detail',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'detail', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'detail', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function detailArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 8 },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 12, sourceOffset: 0, duration: 2 },
      { id: 'video-1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
    ],
  };
}

const INVALID_RANGE_TEXT =
  'The time selection must stay inside the clip, and its end must be after its start.';

interface DetailApiRef {
  current: ArrangementContextValue | null;
}

function DetailProbe({ api }: { api: DetailApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: DetailApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountDetailWorkspace() {
  const api: DetailApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={detailCollection} initialArrangement={detailArrangement()}>
      <StudioWorkspace />
      <DetailProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const panel = view.getByTestId('arrangement-detail-panel');
  const separator = view.getByTestId('arrangement-detail-separator');
  const toggle = view.getByTestId('arrangement-detail-toggle');
  return { api, view, panel, separator, toggle };
}

function panelHeight(panel: HTMLElement): number {
  return Number.parseFloat(panel.style.height);
}

function rangeInputs(view: ReturnType<typeof render>) {
  const start = view.getByTestId('arrangement-detail-start');
  const end = view.getByTestId('arrangement-detail-end');
  const apply = view.getByTestId('arrangement-detail-apply');
  if (!(start instanceof HTMLInputElement) || !(end instanceof HTMLInputElement)) {
    throw new Error('range inputs missing');
  }
  return { start, end, apply };
}

const press = { button: 0, buttons: 1 };

describe('Clip Detail panel (SRW-11B stage 1, D-29, D-29a, R11-U1)', () => {
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

  it('collapses and expands to the previous height without a history entry', async () => {
    const { api, panel, toggle } = await mountDetailWorkspace();
    expect(panelHeight(panel)).toBe(36);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBeTruthy();
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(144);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.className).toContain('motion-safe:transition-[height]');
    expect(panel.className).toContain('motion-safe:duration-300');
    fireEvent.keyDown(detailSeparatorOf(panel), { key: 'ArrowUp' });
    expect(panelHeight(panel)).toBe(160);
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(36);
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(160);
    expect(live(api).undoLabel).toBeNull();
  });

  it('steps the separator ±16 px, clamps at 120 and 280, opens first when collapsed and never nudges the clip', async () => {
    const { api, panel, separator } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.keyDown(separator, { key: 'ArrowDown' });
    expect(panelHeight(panel)).toBe(144);
    expect(panel.dataset.collapsed).toBe('false');
    for (let i = 0; i < 4; i++) {
      fireEvent.keyDown(separator, { key: 'ArrowDown' });
    }
    expect(panelHeight(panel)).toBe(120);
    expect(separator.getAttribute('aria-valuenow')).toBe('120');
    for (let i = 0; i < 12; i++) {
      fireEvent.keyDown(separator, { key: 'ArrowUp' });
    }
    expect(panelHeight(panel)).toBe(280);
    expect(separator.getAttribute('aria-valuenow')).toBe('280');
    expect(separator.getAttribute('aria-valuemin')).toBe('120');
    expect(separator.getAttribute('aria-valuemax')).toBe('280');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
    fireEvent.keyDown(separator, { key: 'ArrowLeft' });
    fireEvent.keyDown(separator, { key: 'ArrowRight' });
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.start).toBe(2);
    expect(live(api).undoLabel).toBeNull();
  });

  it('claims the gesture registry while dragging the separator: a second pointer on a clip and Mute are refused', async () => {
    const { api, view, panel, separator } = await mountDetailWorkspace();
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    fireEvent.pointerDown(separator, { ...press, pointerId: 1, clientX: 400, clientY: 500 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 400, clientY: 460 });
    expect(panelHeight(panel)).toBe(184);
    expect(separator.getAttribute('aria-valuenow')).toBe('184');
    expect(panel.className).not.toContain('motion-safe:transition-[height]');
    const clipHeader = view.container.querySelector('[data-clip-id="hit-1"]')?.firstElementChild;
    if (!(clipHeader instanceof HTMLElement)) {
      throw new Error('clip header missing');
    }
    fireEvent.pointerDown(clipHeader, { ...press, pointerId: 2, clientX: 500, clientY: 200 });
    fireEvent.pointerMove(clipHeader, { pointerId: 2, clientX: 600, clientY: 200 });
    fireEvent.pointerUp(clipHeader, { pointerId: 2, clientX: 600, clientY: 200 });
    expect(live(api).selectedClipIds).toEqual([]);
    fireEvent.click(view.getByRole('button', { name: 'Mute — მუსიკა' }));
    expect(view.getByTestId('arrangement-status').textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.mute).toBe(false);
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 400, clientY: 100 });
    expect(panelHeight(panel)).toBe(280);
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 400, clientY: 100 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(panelHeight(panel)).toBe(280);
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'hit-1')?.start).toBe(12);
    expect(live(api).undoLabel).toBeNull();
  });

  it('ignores a separator pointerdown while another gesture is active', async () => {
    const { api, panel, separator } = await mountDetailWorkspace();
    const release = live(api).claimPointerGesture(9, () => undefined);
    expect(release).not.toBeNull();
    fireEvent.pointerDown(separator, { ...press, pointerId: 3, clientY: 500 });
    fireEvent.pointerMove(window, { pointerId: 3, clientY: 400 });
    expect(panelHeight(panel)).toBe(36);
    release?.();
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('restores the pre-drag height on window blur and on pointercancel', async () => {
    const { api, panel, separator } = await mountDetailWorkspace();
    fireEvent.pointerDown(separator, { ...press, pointerId: 4, clientY: 500 });
    fireEvent.pointerMove(window, { pointerId: 4, clientY: 450 });
    expect(panelHeight(panel)).toBe(194);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(panelHeight(panel)).toBe(36);
    expect(panel.dataset.collapsed).toBe('true');
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.keyDown(separator, { key: 'ArrowUp' });
    expect(panelHeight(panel)).toBe(144);
    fireEvent.pointerDown(separator, { ...press, pointerId: 5, clientY: 500 });
    fireEvent.pointerMove(window, { pointerId: 5, clientY: 560 });
    expect(panelHeight(panel)).toBe(120);
    fireEvent.pointerCancel(window, { pointerId: 5 });
    expect(panelHeight(panel)).toBe(144);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('applies a range inside the clip with the button and with Enter, without a history entry', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.click(toggle);
    expect(view.getByTestId('arrangement-detail-header-label').textContent).toBe('Song');
    const content = view.getByTestId('arrangement-detail-content');
    expect(content.textContent).toContain('მუსიკა');
    expect(content.textContent).toContain('00:02.000');
    expect(content.textContent).toContain('00:08.000');
    expect(content.textContent).toContain('00:01.000');
    expect(content.textContent).toContain('The source file stays unchanged');
    const { start, end, apply } = rangeInputs(view);
    expect(start.disabled).toBe(false);
    fireEvent.change(start, { target: { value: '3.5' } });
    fireEvent.change(end, { target: { value: '7.25' } });
    fireEvent.click(apply);
    expect(live(api).range).toEqual({ start: 3.5, end: 7.25, trackId: 'music' });
    expect(view.getByTestId('arrangement-range').textContent).toContain('00:03.500 — 00:07.250');
    expect(view.getByTestId('arrangement-delete-hint')).toBeTruthy();
    expect(view.getByTestId('arrangement-status').textContent).toBe(
      'Time selection: 00:03.500 — 00:07.250 · მუსიკა.',
    );
    expect(view.getByTestId('arrangement-detail-range').style.width).toBe('46.875%');
    act(() => live(api).setTimeRange(null));
    fireEvent.change(start, { target: { value: '4' } });
    fireEvent.change(end, { target: { value: '5' } });
    fireEvent.keyDown(end, { key: 'Enter' });
    expect(live(api).range).toEqual({ start: 4, end: 5, trackId: 'music' });
    expect(live(api).undoLabel).toBeNull();
  });

  it('refuses out-of-clip values, end ≤ start and empty input with the exact status', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.click(toggle);
    const { start, end, apply } = rangeInputs(view);
    const status = () => view.getByTestId('arrangement-status').textContent;
    for (const [from, to] of [
      ['1', '5'],
      ['3', '10.5'],
      ['6', '6'],
      ['7', '4'],
      ['', '5'],
    ]) {
      act(() => live(api).setStatus('—'));
      fireEvent.change(start, { target: { value: from } });
      fireEvent.change(end, { target: { value: to } });
      fireEvent.click(apply);
      expect(status()).toBe(INVALID_RANGE_TEXT);
      expect(live(api).range).toBeNull();
    }
    fireEvent.change(start, { target: { value: '1.995' } });
    fireEvent.change(end, { target: { value: '10.005' } });
    fireEvent.click(apply);
    expect(live(api).range).toEqual({ start: 2, end: 10, trackId: 'music' });
  });

  it('refuses a tolerated range that collapses at a clip edge and follows a moved clip', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.click(toggle);
    const { start, end, apply } = rangeInputs(view);
    expect([start.value, end.value]).toEqual(['2', '10']);
    fireEvent.change(start, { target: { value: '10.005' } });
    fireEvent.change(end, { target: { value: '10.01' } });
    fireEvent.click(apply);
    expect(view.getByTestId('arrangement-status').textContent).toBe(INVALID_RANGE_TEXT);
    expect(live(api).range).toBeNull();
    act(() => live(api).nudgeSelectedClip(0.5));
    expect([start.value, end.value]).toEqual(['2.5', '10.5']);
    fireEvent.click(apply);
    expect(live(api).range).toEqual({ start: 2.5, end: 10.5, trackId: 'music' });
  });

  it('refuses a range during an active pointer gesture', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.click(toggle);
    const { start, end, apply } = rangeInputs(view);
    fireEvent.change(start, { target: { value: '3' } });
    fireEvent.change(end, { target: { value: '4' } });
    const release = live(api).claimPointerGesture(11, () => undefined);
    fireEvent.click(apply);
    expect(view.getByTestId('arrangement-status').textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).range).toBeNull();
    release?.();
  });

  it('disables the inputs with a reason for several clips and for no selection, and shows the video placeholder', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    fireEvent.click(toggle);
    let inputs = rangeInputs(view);
    expect(view.getByTestId('arrangement-detail-hint').textContent).toBe(
      'Select a clip to see its details',
    );
    expect(inputs.start.disabled).toBe(true);
    expect(inputs.end.disabled).toBe(true);
    expect(inputs.start.title).toBe('Select a clip first');
    act(() => live(api).selectClips(['music-1', 'hit-1']));
    inputs = rangeInputs(view);
    expect(view.getByTestId('arrangement-detail-header-label').textContent).toBe('2 clips');
    const group = view.getByTestId('arrangement-detail-group');
    expect(group.textContent).toContain('2 clips');
    expect(group.textContent).toContain('მუსიკა, SFX');
    expect(group.textContent).toContain('00:02.000');
    expect(group.textContent).toContain('00:12.000');
    expect(inputs.start.disabled).toBe(true);
    expect(inputs.start.title).toBe('A time selection is set on one clip — select only one');
    act(() => live(api).selectClip('video-1'));
    expect(view.getByTestId('arrangement-detail-video-placeholder').textContent).toBe(
      'Video clip · no waveform',
    );
    expect(rangeInputs(view).start.disabled).toBe(false);
  });

  it('keeps + − z x Space and Delete inside the number inputs', async () => {
    const { api, view, toggle } = await mountDetailWorkspace();
    act(() => live(api).selectClip('music-1'));
    fireEvent.click(toggle);
    const { start } = rangeInputs(view);
    const zoom = live(api).pxPerSecond;
    for (const key of ['+', '-', 'z', 'x', ' ', 'Delete', 'ArrowLeft']) {
      fireEvent.keyDown(start, { key, code: key === ' ' ? 'Space' : `Key${key.toUpperCase()}` });
    }
    expect(live(api).pxPerSecond).toBe(zoom);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).arrangement.clips).toHaveLength(3);
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.start).toBe(2);
  });

  it('Space on the focused toggle toggles the panel and does not start playback', async () => {
    const { api, panel, toggle } = await mountDetailWorkspace();
    toggle.focus();
    const notPrevented = fireEvent.keyDown(toggle, { key: ' ', code: 'Space' });
    fireEvent.keyUp(toggle, { key: ' ', code: 'Space' });
    expect(notPrevented).toBe(false);
    expect(panelHeight(panel)).toBe(144);
    expect(live(api).isPlaying).toBe(false);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(true);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(false);
  });
});

describe('D-29a default open state at mount', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubTimelineMetrics(scrollerClientHeight: number, timelineContentHeight: number) {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.testid === 'arrangement-timeline-scroller' ? scrollerClientHeight : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.parentElement?.dataset.testid === 'arrangement-timeline-scroller'
        ? timelineContentHeight
        : 0;
    });
  }

  it('opens at 144 px without a transition when the lanes still fit (1440×900)', async () => {
    stubTimelineMetrics(650, 368);
    const { panel, toggle } = await mountDetailWorkspace();
    expect(panelHeight(panel)).toBe(144);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.className).not.toContain('transition');
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(36);
    expect(panel.className).toContain('motion-safe:transition-[height]');
  });

  it('starts collapsed when opening would push lanes out of view (1280×720)', async () => {
    stubTimelineMetrics(412, 368);
    const { panel, toggle } = await mountDetailWorkspace();
    expect(panelHeight(panel)).toBe(36);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.className).not.toContain('transition');
  });
});

describe('D-29b open-height cap while lane auto-fit is on', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubDetailColumn(columnHeight: number) {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.dataset.testid !== 'arrangement-timeline-scroller') {
        return 0;
      }
      const panel = this.nextElementSibling;
      return (
        columnHeight -
        (panel instanceof HTMLElement ? Number.parseFloat(panel.style.height) || 0 : 0)
      );
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.dataset.testid === 'arrangement-detail-panel') {
        return Number.parseFloat(this.style.height) || 0;
      }
      const parent = this.parentElement;
      if (parent?.dataset.testid === 'arrangement-timeline-scroller') {
        return 287;
      }
      if (parent?.parentElement?.dataset.testid === 'arrangement-timeline-scroller') {
        return parent.firstElementChild === this ? 44 : 0;
      }
      return 0;
    });
  }

  it('limits the rendered open height to the cap and reports it in aria-valuenow and aria-valuetext', async () => {
    stubDetailColumn(349);
    const { panel, separator, toggle } = await mountDetailWorkspace();
    expect(panelHeight(panel)).toBe(36);
    expect(separator.getAttribute('aria-valuetext')).toBe('collapsed · 130 px');
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(130);
    expect(separator.getAttribute('aria-valuenow')).toBe('130');
    expect(separator.getAttribute('aria-valuetext')).toBe('130 px');
  });

  it('a user separator step starts from the rendered height and turns the cap off for the session', async () => {
    stubDetailColumn(349);
    const { api, panel, separator, toggle } = await mountDetailWorkspace();
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(130);
    fireEvent.keyDown(separator, { key: 'ArrowUp' });
    expect(panelHeight(panel)).toBe(146);
    expect(separator.getAttribute('aria-valuenow')).toBe('146');
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(panelHeight(panel)).toBe(146);
    fireEvent.keyDown(separator, { key: 'ArrowDown' });
    expect(panelHeight(panel)).toBe(130);
    fireEvent.keyDown(separator, { key: 'ArrowUp' });
    fireEvent.keyDown(separator, { key: 'ArrowUp' });
    expect(panelHeight(panel)).toBe(162);
    expect(live(api).undoLabel).toBeNull();
  });

  it('a user separator drag starts from the rendered height without a jump and turns the cap off', async () => {
    stubDetailColumn(349);
    const { panel, separator, toggle } = await mountDetailWorkspace();
    fireEvent.click(toggle);
    fireEvent.pointerDown(separator, { ...press, pointerId: 21, clientY: 500 });
    expect(panelHeight(panel)).toBe(130);
    fireEvent.pointerMove(window, { pointerId: 21, clientY: 440 });
    expect(panelHeight(panel)).toBe(190);
    expect(separator.getAttribute('aria-valuenow')).toBe('190');
    fireEvent.pointerUp(window, { pointerId: 21, clientY: 440 });
    expect(panelHeight(panel)).toBe(190);
  });

  it('a cancelled first drag restores the capped height', async () => {
    stubDetailColumn(349);
    const { panel, separator, toggle } = await mountDetailWorkspace();
    fireEvent.click(toggle);
    fireEvent.pointerDown(separator, { ...press, pointerId: 22, clientY: 500 });
    fireEvent.pointerMove(window, { pointerId: 22, clientY: 400 });
    expect(panelHeight(panel)).toBe(230);
    fireEvent.pointerCancel(window, { pointerId: 22 });
    expect(panelHeight(panel)).toBe(130);
  });

  it('does not engage when the minimums fit with the stored height (1440×900-like column)', async () => {
    stubDetailColumn(660);
    const { panel, separator } = await mountDetailWorkspace();
    expect(panelHeight(panel)).toBe(144);
    expect(separator.getAttribute('aria-valuenow')).toBe('144');
  });
});

describe('C-R11-03 cap release keeps the rendered height only when lane auto-fit turns off (D-29c 3)', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function CapHarness({ cap, isAutoFitOn }: { cap: number | null; isAutoFitOn: boolean }) {
    return (
      <ArrangementProvider collection={detailCollection} initialArrangement={detailArrangement()}>
        <ArrangementDetailPanel
          selection={null}
          group={null}
          peaks={undefined}
          range={null}
          setTimeRange={() => undefined}
          setStatus={() => undefined}
          isPointerGestureActive={() => false}
          claimPointerGesture={() => () => undefined}
          measureTimelineFit={() => null}
          openHeightCap={cap}
          isLaneAutoFitOn={isAutoFitOn}
        />
      </ArrangementProvider>
    );
  }

  function mountCapHarness(cap: number | null) {
    const view = render(<CapHarness cap={cap} isAutoFitOn />);
    const panel = view.getByTestId('arrangement-detail-panel');
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    return { view, panel, separator: detailSeparatorOf(panel) };
  }

  it('stores the capped height when auto-fit turns off and keeps it afterwards', () => {
    const { view, panel, separator } = mountCapHarness(130);
    expect(panelHeight(panel)).toBe(130);
    view.rerender(<CapHarness cap={null} isAutoFitOn={false} />);
    expect(panelHeight(panel)).toBe(130);
    expect(separator.getAttribute('aria-valuenow')).toBe('130');
    expect(panel.className).not.toContain('motion-safe:transition-[height]');
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    expect(panelHeight(panel)).toBe(130);
  });

  it('restores the stored height when the cap is released with auto-fit still on', () => {
    const { view, panel } = mountCapHarness(130);
    view.rerender(<CapHarness cap={null} isAutoFitOn />);
    expect(panelHeight(panel)).toBe(144);
  });

  it('gives the pre-clamp height back when auto-fit returns with the cap (cancelled lane drag)', () => {
    const { view, panel } = mountCapHarness(130);
    view.rerender(<CapHarness cap={null} isAutoFitOn={false} />);
    expect(panelHeight(panel)).toBe(130);
    view.rerender(<CapHarness cap={130} isAutoFitOn />);
    expect(panelHeight(panel)).toBe(130);
    view.rerender(<CapHarness cap={null} isAutoFitOn />);
    expect(panelHeight(panel)).toBe(144);
  });

  it('stores the capped open height also while collapsed, so it reopens at the height its separator announced', () => {
    const view = render(<CapHarness cap={130} isAutoFitOn />);
    const panel = view.getByTestId('arrangement-detail-panel');
    const separator = detailSeparatorOf(panel);
    expect(panelHeight(panel)).toBe(36);
    expect(separator.getAttribute('aria-valuetext')).toBe('collapsed · 130 px');
    view.rerender(<CapHarness cap={null} isAutoFitOn={false} />);
    expect(separator.getAttribute('aria-valuetext')).toBe('collapsed · 130 px');
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    expect(panelHeight(panel)).toBe(130);
  });

  it('keeps the stored height when auto-fit turns off with a cap that was not limiting it', () => {
    const { view, panel } = mountCapHarness(200);
    expect(panelHeight(panel)).toBe(144);
    view.rerender(<CapHarness cap={null} isAutoFitOn={false} />);
    expect(panelHeight(panel)).toBe(144);
  });
});

function detailSeparatorOf(panel: HTMLElement): HTMLElement {
  const separator = panel.querySelector<HTMLElement>('[role="separator"]');
  if (!separator) {
    throw new Error('separator missing');
  }
  return separator;
}
