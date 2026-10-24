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

const polishCollection: WorkspaceCollection = {
  id: 'detail',
  label: 'detail',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'detail', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'detail', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function polishArrangement(): Arrangement {
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

const WAVEFORM_BOX_CLASS =
  'relative min-h-0 min-w-32 flex-1 overflow-hidden rounded-sm border border-outline bg-background text-brand/70 contain-strict';

interface PolishApiRef {
  current: ArrangementContextValue | null;
}

function PolishProbe({ api }: { api: PolishApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: PolishApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountPolishWorkspace() {
  const api: PolishApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={polishCollection} initialArrangement={polishArrangement()}>
      <StudioWorkspace />
      <PolishProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const toggle = view.getByTestId('arrangement-detail-toggle');
  return { api, view, toggle };
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

async function mountWithMusicSelected() {
  const mounted = await mountPolishWorkspace();
  act(() => live(mounted.api).selectClip('music-1'));
  fireEvent.click(mounted.toggle);
  return { ...mounted, ...rangeInputs(mounted.view) };
}

function dispatchCancelableWheel(target: Element): boolean {
  const wheel = new WheelEvent('wheel', { cancelable: true, bubbles: true, deltaY: 100 });
  target.dispatchEvent(wheel);
  return wheel.defaultPrevented;
}

describe('Detail panel polish 14b (D-29i, R18-U)', () => {
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

  describe('L4: typed range text survives unrelated range changes', () => {
    it('keeps typed start text when a range on another lane appears and when it is cleared', async () => {
      const { api, start, end } = await mountWithMusicSelected();
      expect([start.value, end.value]).toEqual(['2', '10']);
      fireEvent.change(start, { target: { value: '3.5' } });
      act(() => live(api).setTimeRange({ start: 12.5, end: 13, trackId: 'sfx' }));
      expect(start.value).toBe('3.5');
      act(() => live(api).setTimeRange(null));
      expect(start.value).toBe('3.5');
      expect(end.value).toBe('10');
    });

    it('keeps typed start text when the same range is set again as a new object', async () => {
      const { api, start, end, apply } = await mountWithMusicSelected();
      fireEvent.change(start, { target: { value: '3.5' } });
      fireEvent.change(end, { target: { value: '7.25' } });
      fireEvent.click(apply);
      expect(live(api).range).toEqual({ start: 3.5, end: 7.25, trackId: 'music' });
      fireEvent.change(start, { target: { value: '4' } });
      act(() => live(api).setTimeRange({ start: 3.5, end: 7.25, trackId: 'music' }));
      expect(start.value).toBe('4');
      expect(end.value).toBe('7.25');
    });

    it('resets to a changed on-clip range, to the clip bounds when it leaves, and follows a nudged clip', async () => {
      const { api, start, end } = await mountWithMusicSelected();
      fireEvent.change(start, { target: { value: '3.5' } });
      act(() => live(api).setTimeRange({ start: 5, end: 6, trackId: 'music' }));
      expect([start.value, end.value]).toEqual(['5', '6']);
      fireEvent.change(end, { target: { value: '9' } });
      act(() => live(api).setTimeRange(null));
      expect([start.value, end.value]).toEqual(['2', '10']);
      fireEvent.change(start, { target: { value: '3' } });
      act(() => live(api).nudgeSelectedClip(0.5));
      expect([start.value, end.value]).toEqual(['2.5', '10.5']);
    });

    it('keeps typed text for a same-lane range off the clip and resets for a range equal to the clip bounds', async () => {
      const { api, start, end } = await mountWithMusicSelected();
      fireEvent.change(start, { target: { value: '3' } });
      act(() => live(api).setTimeRange({ start: 11, end: 12, trackId: 'music' }));
      expect(start.value).toBe('3');
      act(() => live(api).setTimeRange({ start: 2, end: 10, trackId: 'music' }));
      expect([start.value, end.value]).toEqual(['2', '10']);
    });

    it('follows a trimmed clip duration', async () => {
      const { api, start, end } = await mountWithMusicSelected();
      fireEvent.change(start, { target: { value: '3' } });
      const before = live(api).arrangement;
      const next = {
        ...before,
        clips: before.clips.map((clip) =>
          clip.id === 'music-1' ? { ...clip, duration: 6 } : clip,
        ),
      };
      act(() => {
        live(api).commitArrangement(next, 'trim', before);
      });
      expect([start.value, end.value]).toEqual(['2', '8']);
    });

    it('shows the normalized applied values after Apply even when the on-clip bounds do not change', async () => {
      const { api, start, end, apply } = await mountWithMusicSelected();
      act(() => live(api).setTimeRange({ start: 2, end: 7.25, trackId: 'music' }));
      fireEvent.change(start, { target: { value: '1.995' } });
      fireEvent.change(end, { target: { value: '7.250' } });
      fireEvent.click(apply);
      expect(live(api).range).toEqual({ start: 2, end: 7.25, trackId: 'music' });
      expect([start.value, end.value]).toEqual(['2', '7.25']);
      fireEvent.change(start, { target: { value: '20' } });
      fireEvent.change(end, { target: { value: '21' } });
      fireEvent.click(apply);
      expect(live(api).range).toEqual({ start: 2, end: 7.25, trackId: 'music' });
      expect([start.value, end.value]).toEqual(['20', '21']);
    });

    it('shows the clamped overlap for a range that only partly lies on the clip', async () => {
      const { api, start, end } = await mountWithMusicSelected();
      act(() => live(api).setTimeRange({ start: 0.5, end: 4, trackId: 'music' }));
      expect([start.value, end.value]).toEqual(['2', '4']);
      fireEvent.change(start, { target: { value: '3' } });
      act(() => live(api).setTimeRange({ start: 1, end: 4, trackId: 'music' }));
      expect(start.value).toBe('3');
    });
  });

  describe('L11: wheel over a focused range input', () => {
    it('prevents the wheel default on the focused start and end inputs', async () => {
      const { start, end } = await mountWithMusicSelected();
      start.focus();
      expect(document.activeElement).toBe(start);
      expect(dispatchCancelableWheel(start)).toBe(true);
      end.focus();
      expect(dispatchCancelableWheel(end)).toBe(true);
    });

    it('keeps preventing the wheel on the focused input after the selection changes and the content remounts', async () => {
      const { api, view } = await mountWithMusicSelected();
      const contentBefore = view.getByTestId('arrangement-detail-content');
      act(() => live(api).selectClip('hit-1'));
      expect(view.getByTestId('arrangement-detail-content')).not.toBe(contentBefore);
      const { start } = rangeInputs(view);
      expect(start.value).toBe('12');
      start.focus();
      expect(dispatchCancelableWheel(start)).toBe(true);
    });

    it('leaves the wheel alone on an unfocused input and on the waveform box', async () => {
      const { view, start, end } = await mountWithMusicSelected();
      end.focus();
      expect(document.activeElement).toBe(end);
      expect(dispatchCancelableWheel(start)).toBe(false);
      expect(dispatchCancelableWheel(view.getByTestId('arrangement-detail-waveform'))).toBe(false);
    });

    it('leaves the wheel alone on disabled inputs with no clip selected', async () => {
      const { view, toggle } = await mountPolishWorkspace();
      fireEvent.click(toggle);
      const { start } = rangeInputs(view);
      expect(start.disabled).toBe(true);
      start.focus();
      expect(document.activeElement).not.toBe(start);
      expect(dispatchCancelableWheel(start)).toBe(false);
    });

    it('registers one non-passive wheel listener on the content and removes the same handler on unmount', async () => {
      const addSpy = vi.spyOn(EventTarget.prototype, 'addEventListener');
      const removeSpy = vi.spyOn(EventTarget.prototype, 'removeEventListener');
      const { view } = await mountWithMusicSelected();
      const content = view.getByTestId('arrangement-detail-content');
      const added = addSpy.mock.calls.filter(
        (call, index) => call[0] === 'wheel' && addSpy.mock.contexts[index] === content,
      );
      expect(added).toHaveLength(1);
      expect(added[0][2]).toEqual({ passive: false });
      const handler = added[0][1];
      view.unmount();
      const removed = removeSpy.mock.calls.filter(
        (call, index) => call[0] === 'wheel' && removeSpy.mock.contexts[index] === content,
      );
      expect(removed).toHaveLength(1);
      expect(removed[0][1]).toBe(handler);
    });
  });

  describe('design (b): overlay alpha and the R9-D3 waveform box', () => {
    it('draws the detail range overlay at /30 with the foreground border and keeps the waveform box class', async () => {
      const { api, view } = await mountWithMusicSelected();
      act(() => live(api).setTimeRange({ start: 3.5, end: 7.25, trackId: 'music' }));
      const overlay = view.getByTestId('arrangement-detail-range');
      expect(overlay.className).toContain('bg-foreground/30');
      expect(overlay.className).not.toContain('bg-foreground/60');
      expect(overlay.className).toContain('border-x-2 border-foreground');
      expect(view.getByTestId('arrangement-detail-waveform').className).toBe(WAVEFORM_BOX_CLASS);
    });
  });

  describe('design (d): Georgian detail labels and the w-72 info column (D-29i, D-29j)', () => {
    function detailLabelTexts(view: ReturnType<typeof render>) {
      const content = view.getByTestId('arrangement-detail-content');
      const info = content.firstElementChild;
      if (!info) {
        throw new Error('info column missing');
      }
      const infoLabels = Array.from(info.querySelectorAll('span.font-sans')).map(
        (span) => span.textContent,
      );
      const rangeLabels = Array.from(
        content.querySelectorAll('label:not([data-testid="arrangement-detail-clip-gain"] *)'),
      ).map((label) => label.firstChild?.textContent ?? null);
      const ariaLabels = Array.from(
        content.querySelectorAll('input:not([data-testid="arrangement-detail-clip-gain"] *)'),
      ).map((input) => input.getAttribute('aria-label'));
      return { content, infoLabels, rangeLabels, ariaLabels };
    }

    it('labels the single clip info and the range inputs in English and keeps the aria-labels', async () => {
      const { view } = await mountWithMusicSelected();
      const { content, infoLabels, rangeLabels, ariaLabels } = detailLabelTexts(view);
      expect(infoLabels).toEqual(['Start', 'Length', 'Source offset']);
      expect(rangeLabels).toEqual(['From, s', 'To, s']);
      expect(ariaLabels).toEqual([
        'Time selection start (seconds)',
        'Time selection end (seconds)',
      ]);
      expect(content.textContent).not.toMatch(/დასაწყისი|სიგრძე|წყაროდან/);
      expect(content.textContent).not.toContain('წმ');
    });

    it('labels the group info and the range inputs in English and keeps the aria-labels', async () => {
      const { api, view, toggle } = await mountPolishWorkspace();
      fireEvent.click(toggle);
      act(() => live(api).selectClips(['music-1', 'hit-1']));
      expect(view.getByTestId('arrangement-detail-group')).toBeTruthy();
      const { content, infoLabels, rangeLabels, ariaLabels } = detailLabelTexts(view);
      expect(infoLabels).toEqual(['Start', 'Length']);
      expect(rangeLabels).toEqual(['From, s', 'To, s']);
      expect(ariaLabels).toEqual([
        'Time selection start (seconds)',
        'Time selection end (seconds)',
      ]);
      expect(content.textContent).not.toMatch(/დასაწყისი|სიგრძე|წყაროდან/);
      expect(content.textContent).not.toContain('წმ');
    });

    it('sizes the info column wrapper with w-72 instead of w-56', async () => {
      const { view } = await mountWithMusicSelected();
      const wrapper = view.getByTestId('arrangement-detail-content').firstElementChild;
      expect(wrapper).not.toBeNull();
      const tokens = (wrapper?.className ?? '').split(/\s+/);
      expect(tokens).toContain('w-72');
      expect(tokens).not.toContain('w-56');
    });
  });
});
