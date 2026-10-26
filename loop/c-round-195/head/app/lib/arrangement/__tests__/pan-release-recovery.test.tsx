import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement, formatTrackPan, trackPanValue } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const PAN_LABEL = 'Pan — მუსიკა';
const MUTE_VIDEO_LABEL = 'Mute — ვიდეო';

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  targets: Array<{ target: number; startTime: number; timeConstant: number }> = [];
  setTargetAtTime(target: number, startTime: number, timeConstant: number) {
    this.targets.push({ target, startTime, timeConstant });
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  disconnected = false;
  constructor(readonly kind: string) {}
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.disconnected = true;
  }
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
  destination = new FakeNode('destination');
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
    return new FakeGain('gain');
  }
  createStereoPanner() {
    return new FakePanner('panner');
  }
  createBufferSource() {
    return new FakeSource('source');
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

const recoveryCollection: WorkspaceCollection = {
  id: 'fader',
  label: 'fader',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function recoveryArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => (track.id === 'music' ? { ...track, volume: 0.6 } : track)),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

type ClipRow = [string, string, number, number];

function clipTable(arrangement: Arrangement): ClipRow[] {
  return arrangement.clips.map((clip) => [clip.id, clip.trackId, clip.start, clip.duration]);
}

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

interface RecoveryApiRef {
  current: ArrangementContextValue | null;
}

function RecoveryProbe({ api }: { api: RecoveryApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: RecoveryApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(api: RecoveryApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

function musicPan(api: RecoveryApiRef): number {
  return trackPanValue(trackOf(live(api).arrangement, 'music'));
}

async function mountRecoveryWorkspace() {
  const api: RecoveryApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={recoveryCollection} initialArrangement={recoveryArrangement()}>
      <StudioWorkspace />
      <RecoveryProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const range = (selector: string) => {
    const input = view.container.querySelector(selector);
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
      throw new Error(`range ${selector} missing`);
    }
    return input;
  };
  const controls = {
    pan: () => range('[data-track-id="music"] [data-testid="arrangement-track-pan"]'),
    musicVolume: () => range('[data-track-id="music"] input[aria-label="Volume — მუსიკა"]'),
    reset: () => {
      const button = view.container.querySelector(
        '[data-track-id="music"] [data-testid="arrangement-track-pan-reset"]',
      );
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error('pan reset missing');
      }
      return button;
    },
  };
  const selectSfxClip = () => {
    act(() => live(api).selectClip('s1'));
    expect(live(api).selectedClipIds).toEqual(['s1']);
  };
  return { api, controls, selectSfxClip };
}

const press = { button: 0, buttons: 1 };

function windowPointer(type: 'pointerup' | 'pointercancel', pointerId: number) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId }));
  });
}

function windowBlur() {
  act(() => {
    window.dispatchEvent(new Event('blur'));
  });
}

describe('Pan release recovery (A-R32-REVIEW-1, A-R31-REVIEW-2; D-29z7)', () => {
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

  describe('a keydown on the Pan slider ends the blur suppression (R42-PK)', () => {
    async function mountSuppressed() {
      const mounted = await mountRecoveryWorkspace();
      const { api, controls } = mounted;
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.blur(controls.pan());
      expect(musicPan(api)).toBe(0);
      expect(controls.pan().value).toBe('0');
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      return mounted;
    }

    it('PK1: ArrowRight on the Pan slider after a lost release writes the next change once', async () => {
      const { api, controls } = await mountSuppressed();
      controls.pan().focus();
      fireEvent.keyDown(controls.pan(), { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(musicPan(api)).toBe(0.1);
      expect(controls.pan().value).toBe('5');
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('PK2: a keydown on the music Volume slider does not end the Pan suppression', async () => {
      const { api, controls } = await mountSuppressed();
      const arrangementBefore = live(api).arrangement;
      controls.musicVolume().focus();
      fireEvent.keyDown(controls.musicVolume(), { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(musicPan(api)).toBe(0);
      expect(controls.pan().value).toBe('0');
      expect(undoChainLabels(api)).toEqual([MUTE_VIDEO_LABEL]);
    });

    it('PK3: after the keyboard entry a late pointerup and pointercancel of the old pointer write nothing', async () => {
      const { api, controls } = await mountSuppressed();
      controls.pan().focus();
      fireEvent.keyDown(controls.pan(), { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(musicPan(api)).toBe(0.1);
      const afterKey = live(api).arrangement;
      windowPointer('pointerup', 41);
      windowPointer('pointercancel', 41);
      expect(live(api).arrangement).toBe(afterKey);
      expect(musicPan(api)).toBe(0.1);
      expect(controls.pan().value).toBe('5');
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('PK4: Delete on the suppressed Pan slider still reaches the window unprevented and makes no Pan entry', async () => {
      const { api, controls, selectSfxClip } = await mountSuppressed();
      selectSfxClip();
      const pan = controls.pan();
      const received: Array<{ key: string; target: EventTarget | null; prevented: boolean }> = [];
      const listener = (event: KeyboardEvent) => {
        received.push({ key: event.key, target: event.target, prevented: event.defaultPrevented });
      };
      window.addEventListener('keydown', listener);
      try {
        pan.focus();
        fireEvent.keyDown(pan, { key: 'Delete', code: 'Delete' });
      } finally {
        window.removeEventListener('keydown', listener);
      }
      expect(received).toEqual([{ key: 'Delete', target: pan, prevented: false }]);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(recoveryArrangement()));
      expect(live(api).selectedClipIds).toEqual(['s1']);
      expect(musicPan(api)).toBe(0);
      expect(undoChainLabels(api)).toEqual([MUTE_VIDEO_LABEL]);
    });
  });

  describe('a window blur ends the Lane Pan drag (R42-RW)', () => {
    async function mountWindowBlurred() {
      const mounted = await mountRecoveryWorkspace();
      const { api, controls } = mounted;
      const resetTextBefore = controls.reset().textContent;
      const arrangementBefore = live(api).arrangement;
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      expect(controls.pan().value).toBe('-10');
      windowBlur();
      return { ...mounted, resetTextBefore, arrangementBefore };
    }

    it('RW1: the slider and the reset button show the stored pan, with no gesture and no entry', async () => {
      const { api, controls, resetTextBefore, arrangementBefore } = await mountWindowBlurred();
      expect(controls.pan().value).toBe('0');
      expect(controls.reset().textContent).toBe(resetTextBefore);
      expect(controls.reset().textContent).toBe(formatTrackPan(0));
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(live(api).undoLabel).toBeNull();
      windowPointer('pointerup', 41);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(controls.pan().value).toBe('0');
      expect(live(api).undoLabel).toBeNull();
    });

    it('RW2: a Pan change during another gesture is refused without a draft and is written after its release', async () => {
      const { api, controls } = await mountWindowBlurred();
      let release: (() => void) | null = null;
      act(() => {
        release = live(api).claimPointerGesture(77, () => undefined);
      });
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(controls.pan().value).toBe('0');
      expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(live(api).undoLabel).toBeNull();
      act(() => release?.());
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(musicPan(api)).toBe(0.1);
      expect(controls.pan().value).toBe('5');
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });

    it('RW3: a window blur after a finished drag changes nothing', async () => {
      const { api, controls } = await mountRecoveryWorkspace();
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '10' } });
      fireEvent.pointerUp(controls.pan(), { pointerId: 41 });
      expect(musicPan(api)).toBe(0.2);
      const blurAdded = addSpy.mock.calls.filter(([type]) => type === 'blur').map(([, fn]) => fn);
      const blurRemoved = removeSpy.mock.calls
        .filter(([type]) => type === 'blur')
        .map(([, fn]) => fn);
      expect(blurAdded.length).toBeGreaterThan(0);
      for (const listener of blurAdded) {
        expect(blurRemoved).toContain(listener);
      }
      const afterDrag = live(api).arrangement;
      windowBlur();
      expect(live(api).arrangement).toBe(afterDrag);
      expect(controls.pan().value).toBe('10');
      expect(musicPan(api)).toBe(0.2);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });

    it('RW4: the window blur does not suppress the next change without a keydown', async () => {
      const { api, controls } = await mountWindowBlurred();
      fireEvent.change(controls.pan(), { target: { value: '3' } });
      expect(musicPan(api)).toBe(0.06);
      expect(controls.pan().value).toBe('3');
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });
  });
});
