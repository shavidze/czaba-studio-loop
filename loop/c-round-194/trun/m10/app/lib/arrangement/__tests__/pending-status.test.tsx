import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  GESTURE_UNDO_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';
const CLIP_GAIN_LABEL = 'Clip Gain';
const MUTE_MUSIC_LABEL = 'Mute — მუსიკა';
const PENDING_TEXT = 'Unsaved — Enter saves, Esc reverts';

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

const pendingCollection: WorkspaceCollection = {
  id: 'pending-status',
  label: 'pending-status',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'pending-status', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'pending-status', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function pendingArrangement(): Arrangement {
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

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

function providerWrapper(initial: Arrangement) {
  return ({ children }: { children: ReactNode }) =>
    createElement(
      ArrangementProvider,
      { collection: pendingCollection, initialArrangement: initial },
      children,
    );
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountPendingHook() {
  const hook = renderHook(() => useArrangement(), {
    wrapper: providerWrapper(pendingArrangement()),
  });
  await flushLoads();
  return hook;
}

interface PendingApiRef {
  current: ArrangementContextValue | null;
}

function PendingProbe({ api }: { api: PendingApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: PendingApiRef): ArrangementContextValue {
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

const press = { button: 0, buttons: 1 };

function windowPointerUp(pointerId: number) {
  act(() => {
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId }));
  });
}

async function mountPendingWorkspace() {
  const api: PendingApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={pendingCollection} initialArrangement={pendingArrangement()}>
      <StudioWorkspace />
      <PendingProbe api={api} />
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
  const pending = () => view.queryByTestId('arrangement-detail-clip-gain-pending');
  const status = () => view.getByTestId('arrangement-status').textContent;
  const musicVolume = () => {
    const input = view.container.querySelector(
      '[data-track-id="music"] input[aria-label="Volume — მუსიკა"]',
    );
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('music volume missing');
    }
    return input;
  };
  const startSeparatorGesture = () => {
    const separator = view.getByTestId('arrangement-detail-separator');
    fireEvent.pointerDown(separator, { ...press, pointerId: 41, clientY: 400 });
    expect(live(api).isPointerGestureActive()).toBe(true);
  };
  return { api, view, field, reset, pending, status, musicVolume, startSeparatorGesture };
}

function expectNoMarker(field: HTMLInputElement, pending: HTMLElement | null) {
  expect(field.hasAttribute('data-pending')).toBe(false);
  expect(pending).toBeNull();
}

describe('pending status and unsaved Clip Gain (D-29z4, C-R37-01, PENDING-COMMIT-ORDER)', () => {
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

  describe('refusal status returns when the last gesture ends', () => {
    it('S1: an edit refusal during a gesture shows the blocked status, then the previous status after release', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => release());
      expect(result.current.status).toBe('X');
      expect(result.current.undoLabel).toBeNull();
    });

    it('S2: an Undo refusal during a gesture keeps the entry and restores the previous status after release', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.toggleTrackMute('music'));
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.undo());
      expect(result.current.status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      expect(result.current.undoLabel).toBe(MUTE_MUSIC_LABEL);
      act(() => release());
      expect(result.current.status).toBe('X');
      expect(result.current.undoLabel).toBe(MUTE_MUSIC_LABEL);
      expect(trackOf(result.current.arrangement, 'music').mute).toBe(true);
    });

    it('S3: a newer non-refusal status set during the gesture stays after release', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      act(() => result.current.setStatus('Y'));
      act(() => release());
      expect(result.current.status).toBe('Y');
    });

    it('S1-same-act: a refusal queued in the same batch as the release still restores the previous status', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => {
        result.current.toggleTrackMute('music');
        release();
      });
      expect(result.current.status).toBe('X');
      expect(result.current.undoLabel).toBeNull();
    });

    it('S3-same-act: a new status queued in the same batch as the release stays', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => {
        result.current.setStatus('Y');
        release();
      });
      expect(result.current.status).toBe('Y');
    });

    it('S4: the refusal stays while a second gesture is still active and returns only when both end', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let releaseFirst: () => void = () => undefined;
      let releaseSecond: () => void = () => undefined;
      act(() => {
        releaseFirst = result.current.beginPointerGesture();
        releaseSecond = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      act(() => releaseFirst());
      expect(result.current.isPointerGestureActive()).toBe(true);
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => releaseSecond());
      expect(result.current.status).toBe('X');
    });

    it('S5: an edit refusal followed by an Undo refusal still restores the previous status', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      act(() => result.current.undo());
      expect(result.current.status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      act(() => release());
      expect(result.current.status).toBe('X');
    });

    it('S5b: refusal, a new status, a second refusal and release restore the most recent non-refusal status', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleTrackMute('music'));
      act(() => result.current.setStatus('T'));
      act(() => result.current.toggleTrackSolo('music', false));
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => release());
      expect(result.current.status).toBe('T');
    });

    it('S6: a gesture with no refusal leaves the status unchanged', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => release());
      expect(result.current.status).toBe('X');
    });

    it('S7: a refused music Volume press during the separator drag shows blocked, then the prior status after pointerup', async () => {
      const { api, status, musicVolume, startSeparatorGesture } = await mountPendingWorkspace();
      act(() => live(api).setStatus('X'));
      startSeparatorGesture();
      fireEvent.pointerDown(musicVolume(), { ...press, pointerId: 42, clientX: 50 });
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      windowPointerUp(42);
      windowPointerUp(41);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(status()).toBe('X');
      expect(live(api).undoLabel).toBeNull();
    });

    it('S8: a window blur that aborts a claimed gesture restores the prior status', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.setStatus('X'));
      const abort = vi.fn();
      act(() => {
        result.current.claimPointerGesture(41, abort);
      });
      act(() => result.current.toggleTrackMute('music'));
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      expect(abort).toHaveBeenCalledTimes(1);
      expect(result.current.isPointerGestureActive()).toBe(false);
      expect(result.current.status).toBe('X');
    });

    it('S9: a Clip Gain blur kept during a gesture restores the prior status and keeps the text with its marker', async () => {
      const { api, field, pending, status, startSeparatorGesture } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      fireEvent.change(field(), { target: { value: '3' } });
      const before = status();
      expect(before).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      startSeparatorGesture();
      fireEvent.blur(field());
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      windowPointerUp(41);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(status()).toBe(before);
      expect(field().value).toBe('3');
      expect(field().getAttribute('data-pending')).toBe('true');
      expect(pending()?.textContent).toBe(PENDING_TEXT);
      expect(live(api).undoLabel).toBeNull();
    });
  });

  describe('unsaved Clip Gain marker', () => {
    it('PM1: typed text that differs from the stored value shows the marker, the warning border and the description', async () => {
      const { api, field, pending } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      expectNoMarker(field(), pending());
      fireEvent.change(field(), { target: { value: '3' } });
      expect(field().getAttribute('data-pending')).toBe('true');
      const marker = pending();
      expect(marker?.textContent).toBe(PENDING_TEXT);
      expect(marker?.id).toBeTruthy();
      expect(field().getAttribute('aria-describedby')).toBe(marker?.id);
      expect(field().className).toContain('border-warning');
      expect(field().className).not.toContain('border-outline');
    });

    it('PM2: Enter commits one Clip Gain entry and removes the marker and the description', async () => {
      const { api, field, pending, status } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      fireEvent.change(field(), { target: { value: '3' } });
      expect(field().getAttribute('data-pending')).toBe('true');
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe('Clip Gain: Hit — +3.0 dB.');
      expectNoMarker(field(), pending());
      expect(field().hasAttribute('aria-describedby')).toBe(false);
      expect(field().className).toContain('border-outline');
      expect(undoChainLabels(() => live(api))).toEqual([CLIP_GAIN_LABEL]);
    });

    it('PM3: Escape reverts the text, removes the marker and writes no entry', async () => {
      const { api, field, pending } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      fireEvent.change(field(), { target: { value: '3' } });
      expect(pending()?.textContent).toBe(PENDING_TEXT);
      fireEvent.keyDown(field(), { key: 'Escape' });
      expect(field().value).toBe('0.0');
      expectNoMarker(field(), pending());
      expect(live(api).undoLabel).toBeNull();
    });

    it('PM4: a raw text that differs only in format shows the marker until the blur reverts it', async () => {
      const { api, field, pending } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      fireEvent.change(field(), { target: { value: '0' } });
      expect(field().getAttribute('data-pending')).toBe('true');
      expect(pending()).not.toBeNull();
      fireEvent.blur(field());
      expect(live(api).undoLabel).toBeNull();
      expect(field().value).toBe('0.0');
      expectNoMarker(field(), pending());
    });

    it('PM5: a disabled field for a video clip or a group shows no marker and keeps the reason description', async () => {
      const { api, view, field, pending } = await mountPendingWorkspace();
      act(() => live(api).selectClip('v1'));
      const videoReason = view.getByTestId('arrangement-detail-clip-gain-reason');
      expect(field().disabled).toBe(true);
      expectNoMarker(field(), pending());
      expect(field().getAttribute('aria-describedby')).toBe(videoReason.id);
      act(() => live(api).selectClips(['m1', 'v1']));
      const groupReason = view.getByTestId('arrangement-detail-clip-gain-reason');
      expect(field().disabled).toBe(true);
      expectNoMarker(field(), pending());
      expect(field().getAttribute('aria-describedby')).toBe(groupReason.id);
    });

    it('PM6: the 0 dB reset after a typed value stores 0, shows 0.0 and removes the marker', async () => {
      const { api, field, pending, reset } = await mountPendingWorkspace();
      act(() => live(api).selectClip('s1'));
      fireEvent.change(field(), { target: { value: '3' } });
      fireEvent.keyDown(field(), { key: 'Enter' });
      fireEvent.change(field(), { target: { value: '5' } });
      expect(pending()).not.toBeNull();
      fireEvent.click(reset());
      const clip = live(api).arrangement.clips.find((entry) => entry.id === 's1');
      expect(clip).toBeDefined();
      expect(clip && Object.hasOwn(clip, 'gainDb')).toBe(false);
      expect(field().value).toBe('0.0');
      expectNoMarker(field(), pending());
      expect(undoChainLabels(() => live(api))).toEqual([CLIP_GAIN_LABEL, CLIP_GAIN_LABEL]);
    });
  });

  describe('pending preview order', () => {
    it('PO1: an older pending Master preview is committed before a new Volume preview, so Undo restores both', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.previewMasterGain(-3));
      act(() => result.current.previewTrackVolume('video', 0.5));
      act(() => result.current.toggleTrackMute('music'));
      expect(undoChainLabels(() => result.current)).toEqual([
        MUTE_MUSIC_LABEL,
        VOLUME_LABEL,
        MASTER_VOLUME_LABEL,
      ]);
      expect(result.current.arrangement.master.gainDb).toBe(0);
      expect(trackOf(result.current.arrangement, 'video').volume).toBe(1);
      expect(trackOf(result.current.arrangement, 'music').mute).toBe(false);
    });

    it('PO2: a Volume preview followed by a Master preview keeps its order and Undo restores both', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.previewTrackVolume('video', 0.5));
      act(() => result.current.previewMasterGain(-3));
      act(() => result.current.toggleTrackMute('music'));
      expect(undoChainLabels(() => result.current)).toEqual([
        MUTE_MUSIC_LABEL,
        MASTER_VOLUME_LABEL,
        VOLUME_LABEL,
      ]);
      expect(result.current.arrangement.master.gainDb).toBe(0);
      expect(trackOf(result.current.arrangement, 'video').volume).toBe(1);
    });

    it('PO4: a Volume preview refused during a gesture flushes nothing, so the pending Master preview stays pending', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.previewMasterGain(-3));
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.previewTrackVolume('video', 0.5));
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(result.current.undoLabel).toBeNull();
      expect(trackOf(result.current.arrangement, 'video').volume).toBe(1);
      act(() => release());
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.arrangement.master.gainDb).toBe(-3);
      act(() => result.current.commitMasterGain());
      expect(undoChainLabels(() => result.current)).toEqual([MASTER_VOLUME_LABEL]);
      expect(result.current.arrangement.master.gainDb).toBe(0);
    });

    it('PO3: a Volume preview and commit with no pending Master writes exactly one Volume entry', async () => {
      const { result } = await mountPendingHook();
      act(() => result.current.previewTrackVolume('video', 0.5));
      act(() => result.current.commitTrackVolume());
      expect(trackOf(result.current.arrangement, 'video').volume).toBe(0.5);
      expect(undoChainLabels(() => result.current)).toEqual([VOLUME_LABEL]);
      expect(trackOf(result.current.arrangement, 'video').volume).toBe(1);
    });
  });
});
