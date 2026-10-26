import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { TEMPO_EMPTY_HINT, TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';
import { sliderPositionFromZoom } from '../view';

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

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const SNAP_ON_STATUS = 'Snap on — grid 1 s (G)';

const tempoCollection: WorkspaceCollection = {
  id: 'grid',
  label: 'grid',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const TEMPO_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 8 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function tempoArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface TempoApiRef {
  current: ArrangementContextValue | null;
}

function TempoProbe({ api }: { api: TempoApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: TempoApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountTempoWorkspace() {
  const api: TempoApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={tempoCollection}
      initialArrangement={tempoArrangement(TEMPO_CLIPS)}
    >
      <StudioWorkspace />
      <TempoProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  return { api, view };
}

type TempoView = Awaited<ReturnType<typeof mountTempoWorkspace>>['view'];

function tempoInput(view: TempoView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function barsStrip(view: TempoView): HTMLElement {
  return view.getByTestId('arrangement-bars-ruler');
}

function barsMarks(view: TempoView): HTMLElement[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-testid="arrangement-bars-mark"]'),
  );
}

function barMarks(view: TempoView): HTMLElement[] {
  return barsMarks(view).filter((mark) => mark.dataset.kind === 'bar');
}

function markSnapshot(view: TempoView) {
  return barsMarks(view).map((mark) => ({
    kind: mark.dataset.kind,
    time: mark.dataset.time,
    left: mark.style.left,
    text: mark.textContent,
  }));
}

function statusText(view: TempoView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function gridControl(view: TempoView): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function undoTitle(view: TempoView): string {
  const button = view.container.querySelector<HTMLButtonElement>('button[title^="Undo"]');
  if (!button) {
    throw new Error('undo button missing');
  }
  return button.title;
}

function secondsTickLefts(view: TempoView): string[] {
  const ruler = view.getByTestId('arrangement-ruler');
  const handle = view.getByTestId('arrangement-playhead-handle');
  const playheadLine = handle.previousElementSibling;
  return Array.from(ruler.children)
    .filter(
      (child): child is HTMLDivElement =>
        child instanceof HTMLDivElement &&
        child !== handle &&
        child !== playheadLine &&
        child.style.left !== '',
    )
    .map((child) => child.style.left);
}

function focusTempoInput(input: HTMLInputElement) {
  act(() => input.focus());
}

function typeTempo(input: HTMLInputElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
}

function commitTempo(input: HTMLInputElement, text: string) {
  focusTempoInput(input);
  typeTempo(input, text);
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function pressG(target: Element = document.body) {
  fireEvent.keyDown(target, { key: 'g', code: 'KeyG' });
}

function expectMarksAtZoom(view: TempoView, pxPerSecond: number) {
  const marks = barsMarks(view);
  expect(marks.length).toBeGreaterThan(0);
  for (const mark of marks) {
    expect(parseFloat(mark.style.left)).toBeCloseTo(Number(mark.dataset.time) * pxPerSecond, 3);
  }
}

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

describe('SRW-15 stage 1 tempo row and bars ruler', { timeout: 15_000 }, () => {
  it('U1 has no tempo by default: empty field, hint, no marks, 4/4 shown', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    expect(input.value).toBe('');
    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('decimal');
    expect(input.getAttribute('aria-label')).toBe('Project tempo (BPM)');
    const strip = barsStrip(view);
    expect(strip.dataset.bpm).toBe('');
    expect(barsMarks(view)).toHaveLength(0);
    expect(strip.textContent).toContain(TEMPO_EMPTY_HINT);
    expect(input.parentElement?.textContent).toContain('4/4');
    expect(input.parentElement?.textContent).toContain('BPM');
  });

  it('U2 setting 90 BPM draws bars 1–4 at their times and blurs the field', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    expect(statusText(view)).toBe(tempoStatusMessage(90));
    expect(statusText(view)).toBe(
      'Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
    );
    expect(barsStrip(view).dataset.bpm).toBe('90');
    const bars = barMarks(view);
    expect(bars.slice(0, 4).map((mark) => mark.dataset.time)).toEqual([
      '0',
      '2.666667',
      '5.333333',
      '8',
    ]);
    expect(bars.slice(0, 4).map((mark) => mark.textContent)).toEqual(['1', '2', '3', '4']);
    expectMarksAtZoom(view, PX_PER_SECOND);
    expect(document.activeElement).not.toBe(input);
    expect(input.value).toBe('90');
  });

  it('U3 a tempo changes only the bars ruler: seconds ruler, model, Undo and Snap stay', async () => {
    const { api, view } = await mountTempoWorkspace();
    const ticksBefore = secondsTickLefts(view);
    expect(ticksBefore.length).toBeGreaterThan(0);
    const arrangementBefore = structuredClone(live(api).arrangement);
    const undoBefore = undoTitle(view);
    const snapBefore = gridControl(view).dataset.snap;
    const gridBefore = gridControl(view).dataset.gridSeconds;
    commitTempo(tempoInput(view), '90');
    expect(barsStrip(view).dataset.bpm).toBe('90');
    expect(secondsTickLefts(view)).toEqual(ticksBefore);
    expect(live(api).arrangement).toEqual(arrangementBefore);
    expect(live(api).undoLabel).toBeNull();
    expect(undoTitle(view)).toBe(undoBefore);
    expect(gridControl(view).dataset.snap).toBe(snapBefore);
    expect(gridControl(view).dataset.gridSeconds).toBe(gridBefore);
  });

  it('U4 changing 90 to 120 rescales the bars', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    commitTempo(input, '120');
    expect(barMarks(view)[1].dataset.time).toBe('2');
    expect(statusText(view)).toBe(tempoStatusMessage(120));
    expect(barsStrip(view).dataset.bpm).toBe('120');
  });

  it('U5 invalid text changes nothing and shows the current value again', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    const marksBefore = markSnapshot(view);
    for (const text of ['1000', 'abc', '999.5']) {
      pressG();
      expect(statusText(view)).not.toBe(TEMPO_INVALID_MESSAGE);
      commitTempo(input, text);
      expect(statusText(view)).toBe(TEMPO_INVALID_MESSAGE);
      expect(statusText(view)).toBe('Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.');
      expect(input.value).toBe('90');
      expect(barsStrip(view).dataset.bpm).toBe('90');
      expect(markSnapshot(view)).toEqual(marksBefore);
    }
  });

  it('U6 Escape restores the current value without writing a status', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    pressG();
    expect(statusText(view)).toBe(SNAP_ON_STATUS);
    focusTempoInput(input);
    typeTempo(input, '70');
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(input.value).toBe('90');
    expect(barsStrip(view).dataset.bpm).toBe('90');
    expect(statusText(view)).toBe(SNAP_ON_STATUS);
    expect(document.activeElement).not.toBe(input);
  });

  it('U7 blur commits the typed tempo', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    focusTempoInput(input);
    typeTempo(input, '100');
    fireEvent.blur(input);
    expect(barsStrip(view).dataset.bpm).toBe('100');
    expect(statusText(view)).toBe(tempoStatusMessage(100));
  });

  it('U8 empty text clears the tempo and the marks', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    expect(barsMarks(view).length).toBeGreaterThan(0);
    commitTempo(input, '');
    expect(barsStrip(view).dataset.bpm).toBe('');
    expect(barsMarks(view)).toHaveLength(0);
    expect(statusText(view)).toBe(tempoStatusMessage(null));
    expect(statusText(view)).toBe('Tempo cleared — the bars ruler is hidden. Audio is unchanged.');
    expect(barsStrip(view).textContent).toContain(TEMPO_EMPTY_HINT);
    expect(barsStrip(view).textContent).toContain(
      'Bars: set a BPM — grid only, audio is not stretched',
    );
  });

  it('U9 committing the same value again is a no-op without a status', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    commitTempo(input, '90');
    pressG();
    expect(statusText(view)).toBe(SNAP_ON_STATUS);
    commitTempo(input, '90.00');
    expect(statusText(view)).toBe(SNAP_ON_STATUS);
    expect(barsStrip(view).dataset.bpm).toBe('90');
    expect(input.value).toBe('90');
  });

  it('U10 typing in the field keeps workspace shortcuts away', async () => {
    const { api, view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    focusTempoInput(input);
    fireEvent.keyDown(input, { key: 'g', code: 'KeyG' });
    fireEvent.keyDown(input, { key: '1', code: 'Digit1' });
    fireEvent.keyDown(input, { key: '2', code: 'Digit2' });
    fireEvent.keyDown(input, { key: ' ', code: 'Space' });
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
    expect(live(api).isPlaying).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('U12 a click inside the focused field keeps it focused; a lane click still releases it', async () => {
    const { view } = await mountTempoWorkspace();
    const input = tempoInput(view);
    focusTempoInput(input);
    typeTempo(input, '9');
    const statusBefore = statusText(view);
    fireEvent.pointerDown(input, { button: 0, buttons: 1, pointerId: 1 });
    expect(document.activeElement).toBe(input);
    expect(statusText(view)).toBe(statusBefore);
    expect(barsStrip(view).dataset.bpm).toBe('');
    typeTempo(input, '90');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(barsStrip(view).dataset.bpm).toBe('90');
    focusTempoInput(input);
    expect(document.activeElement).toBe(input);
    const laneBody = view.container.querySelector<HTMLElement>('[data-track-id] [data-grid-lines]');
    if (!laneBody) {
      throw new Error('lane body missing');
    }
    fireEvent.pointerDown(laneBody, {
      button: 0,
      buttons: 1,
      pointerId: 2,
      clientX: 300,
      clientY: 150,
    });
    expect(document.activeElement).not.toBe(input);
    expect(barsStrip(view).dataset.bpm).toBe('90');
  });

  it('U11 zoom rescales the bars strip and its width', async () => {
    const { api, view } = await mountTempoWorkspace();
    commitTempo(tempoInput(view), '90');
    const secondsBefore = parseFloat(barsStrip(view).style.width) / PX_PER_SECOND;
    const slider = view.getByTestId('arrangement-zoom');
    fireEvent.change(slider, {
      target: { value: String(sliderPositionFromZoom(PX_PER_SECOND) + 12) },
    });
    const zoomed = live(api).pxPerSecond;
    expect(zoomed).not.toBeCloseTo(PX_PER_SECOND, 1);
    expectMarksAtZoom(view, zoomed);
    const strip = barsStrip(view);
    const ruler = view.getByTestId('arrangement-ruler');
    const stripWidth = parseFloat(strip.style.width);
    expect(stripWidth).toBeCloseTo(parseFloat(ruler.style.width), 3);
    expect(stripWidth).toBeCloseTo(secondsBefore * zoomed, 3);
  });
});
