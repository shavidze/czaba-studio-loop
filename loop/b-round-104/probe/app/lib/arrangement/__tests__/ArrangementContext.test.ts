import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementLoopBrace } from '~/components/arrangement/ArrangementLoopBrace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  GESTURE_UNDO_BLOCKED_MESSAGE,
  playPastEndMessage,
  useArrangement,
  WEB_AUDIO_UNAVAILABLE_MESSAGE,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement, deleteTime } from '../model';

interface FakeStart {
  calledAt: number;
  when: number;
  offset: number;
  duration: number;
}

const fakeClock = { base: 0 };
const fakeStarts: FakeStart[] = [];
const fakeStops: number[] = [];

function fakeNow(): number {
  return Date.now() / 1000 - fakeClock.base;
}

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
  start(when: number, offset: number, duration: number) {
    fakeStarts.push({ calledAt: fakeNow(), when, offset, duration });
  }
  stop(when?: number) {
    fakeStops.push(when ?? fakeNow());
  }
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return fakeNow();
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

class ThrowingAudioContext {
  constructor() {
    throw new Error('Web Audio is not available');
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

const testCollection: WorkspaceCollection = {
  id: 'test',
  label: 'test',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'test', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1000, numberOfChannels: 1, sampleRate: 100 }),
};

function loopedArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
    ],
    loop: { start: 2, end: 4, enabled: true },
  };
}

function providerWrapper(initial: Arrangement) {
  return ({ children }: { children: ReactNode }) =>
    createElement(
      ArrangementProvider,
      { collection: testCollection, initialArrangement: initial },
      children,
    );
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('ArrangementProvider', () => {
  beforeEach(() => {
    fakeStarts.length = 0;
    fakeStops.length = 0;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('Undo/Redo during a pointer gesture (D-20, R4-B1)', () => {
    it('refuses undo and redo while a gesture is active and keeps the history', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(loopedArrangement()),
      });
      await flushLoads();
      const before = result.current.getArrangement();
      act(() => {
        result.current.commitArrangement({ ...before, loop: null }, 'Loop off', before);
      });
      expect(result.current.undoLabel).toBe('Loop off');
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.undo());
      expect(result.current.status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      expect(result.current.undoLabel).toBe('Loop off');
      expect(result.current.arrangement.loop).toBeNull();
      act(() => result.current.redo());
      expect(result.current.status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      act(() => release());
      act(() => result.current.undo());
      expect(result.current.arrangement.loop).toEqual({ start: 2, end: 4, enabled: true });
      expect(result.current.redoLabel).toBe('Loop off');
    });

    it('reports an active gesture until every nested gesture is released', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(loopedArrangement()),
      });
      await flushLoads();
      expect(result.current.isPointerGestureActive()).toBe(false);
      let first: () => void = () => undefined;
      let second: () => void = () => undefined;
      act(() => {
        first = result.current.beginPointerGesture();
        second = result.current.beginPointerGesture();
      });
      expect(result.current.isPointerGestureActive()).toBe(true);
      act(() => first());
      act(() => first());
      expect(result.current.isPointerGestureActive()).toBe(true);
      act(() => second());
      expect(result.current.isPointerGestureActive()).toBe(false);
    });
  });

  describe('aborted gestures clear the preview-active flag (D-20, R4-B2)', () => {
    it('clears the flag when the last gesture is released without a commit', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(loopedArrangement()),
      });
      await flushLoads();
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
        result.current.previewArrangement({ ...result.current.getArrangement(), loop: null });
      });
      expect(result.current.isArrangementPreviewActive()).toBe(true);
      act(() => release());
      expect(result.current.isArrangementPreviewActive()).toBe(false);
    });

    it('ends an uncaptured brace gesture on a pointerup anywhere and reverts its preview', async () => {
      let api: ArrangementContextValue | null = null;
      function Probe() {
        api = useArrangement();
        return null;
      }
      const view = render(
        createElement(
          ArrangementProvider,
          { collection: testCollection, initialArrangement: loopedArrangement() },
          createElement(ArrangementLoopBrace, { seconds: 20, pxPerSecond: 40 }),
          createElement(Probe),
        ),
      );
      await flushLoads();
      const brace = view.getByTestId('arrangement-loop-brace');
      Object.defineProperty(brace, 'setPointerCapture', {
        configurable: true,
        value: () => {
          throw new Error('capture failed');
        },
      });
      const current = (): ArrangementContextValue => {
        if (!api) {
          throw new Error('provider not mounted');
        }
        return api;
      };
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 3, clientX: 100 });
      fireEvent.pointerMove(brace, { pointerId: 3, clientX: 180 });
      expect(current().arrangement.loop).toEqual({ start: 4, end: 6, enabled: true });
      expect(current().isArrangementPreviewActive()).toBe(true);
      act(() => current().undo());
      expect(current().status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      fireEvent.pointerUp(window, { pointerId: 99 });
      expect(current().isArrangementPreviewActive()).toBe(true);
      fireEvent.pointerUp(window, { pointerId: 3 });
      expect(current().isArrangementPreviewActive()).toBe(false);
      expect(current().arrangement.loop).toEqual({ start: 2, end: 4, enabled: true });
      expect(current().undoLabel).toBeNull();
      act(() => current().setStatus('ready'));
      act(() => current().undo());
      expect(current().status).toBe('ready');
    });

    it('releases the gesture and the preview flag when the brace unmounts mid-drag', async () => {
      let api: ArrangementContextValue | null = null;
      function Probe() {
        api = useArrangement();
        return null;
      }
      function Harness({ showBrace }: { showBrace: boolean }) {
        return createElement(
          ArrangementProvider,
          { collection: testCollection, initialArrangement: loopedArrangement() },
          showBrace ? createElement(ArrangementLoopBrace, { seconds: 20, pxPerSecond: 40 }) : null,
          createElement(Probe),
        );
      }
      const view = render(createElement(Harness, { showBrace: true }));
      await flushLoads();
      const brace = view.getByTestId('arrangement-loop-brace');
      Object.defineProperty(brace, 'setPointerCapture', { configurable: true, value: () => {} });
      Object.defineProperty(brace, 'hasPointerCapture', {
        configurable: true,
        value: () => false,
      });
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 4, clientX: 100 });
      fireEvent.pointerMove(brace, { pointerId: 4, clientX: 180 });
      const current = (): ArrangementContextValue => {
        if (!api) {
          throw new Error('provider not mounted');
        }
        return api;
      };
      expect(current().isArrangementPreviewActive()).toBe(true);
      act(() => current().undo());
      expect(current().status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
      view.rerender(createElement(Harness, { showBrace: false }));
      expect(current().isArrangementPreviewActive()).toBe(false);
      act(() => current().setStatus('ready'));
      act(() => current().undo());
      expect(current().status).toBe('ready');
    });
  });

  describe('Web Audio unavailable (L8, R4-B6)', () => {
    it('shows the reason, stays stopped and refuses export without throwing', async () => {
      vi.stubGlobal('AudioContext', ThrowingAudioContext);
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(loopedArrangement()),
      });
      await flushLoads();
      expect(() => act(() => result.current.togglePlayback())).not.toThrow();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.status).toBe(WEB_AUDIO_UNAVAILABLE_MESSAGE);
      await act(async () => {
        await result.current.exportWav();
      });
      expect(result.current.exportState).toEqual({
        phase: 'error',
        message: WEB_AUDIO_UNAVAILABLE_MESSAGE,
      });
    });
  });

  describe('loop refill without requestAnimationFrame (M1, R4-B7)', () => {
    it('keeps scheduling loop iterations ahead from the timer while rAF is stalled', async () => {
      vi.useFakeTimers();
      fakeClock.base = Date.now() / 1000;
      const stalledFrames: FrameRequestCallback[] = [];
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        stalledFrames.push(callback);
        return stalledFrames.length;
      });
      vi.stubGlobal('cancelAnimationFrame', () => undefined);
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(loopedArrangement()),
      });
      await flushLoads();
      act(() => result.current.seekTo(1));
      act(() => result.current.togglePlayback());
      expect(result.current.isPlaying).toBe(true);
      for (let step = 0; step < 55; step++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }
      const now = fakeNow();
      expect(now).toBeGreaterThanOrEqual(5);
      expect(fakeStarts.length).toBeGreaterThanOrEqual(3);
      for (const start of fakeStarts) {
        expect(start.when).toBeGreaterThanOrEqual(start.calledAt);
      }
      const wraps = fakeStarts.filter((start) => Math.abs(start.offset - 2) < 1e-9);
      const wrapsSounded = wraps.filter((start) => start.when <= now);
      expect(wrapsSounded.length).toBeGreaterThanOrEqual(2);
      const ordered = [...fakeStarts].sort((a, b) => a.when - b.when);
      for (let index = 1; index < ordered.length; index++) {
        const previous = ordered[index - 1];
        expect(ordered[index].when).toBeCloseTo(previous.when + previous.duration, 9);
      }
      expect(fakeStops).toHaveLength(0);
      expect(stalledFrames.length).toBeLessThanOrEqual(2);
    });
  });
});

function editArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 8 },
      { id: 's1', trackId: 'sfx', sourceId: 'song', start: 2, sourceOffset: 1, duration: 4 },
    ],
    loop: null,
  };
}

describe('SRW-07/09 edit commands in the provider', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function mountEditProvider() {
    const view = renderHook(() => useArrangement(), {
      wrapper: providerWrapper(editArrangement()),
    });
    await flushLoads();
    return view.result;
  }

  it('refuses Duplicate, Copy, Cut, Cut Time and Paste during a pointer gesture (R7-D5, R9-C5)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClip('m1'));
    act(() => result.current.copySelection());
    const before = result.current.arrangement;
    let release: () => void = () => undefined;
    act(() => {
      release = result.current.beginPointerGesture();
    });
    for (const command of [
      result.current.duplicateSelection,
      result.current.copySelection,
      result.current.cutSelection,
      result.current.cutTimeSelection,
      result.current.pasteClipboard,
    ]) {
      act(() => result.current.setStatus('ready'));
      act(() => command());
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(result.current.arrangement).toBe(before);
      expect(result.current.undoLabel).toBeNull();
    }
    act(() => release());
    act(() => result.current.duplicateSelection());
    expect(result.current.undoLabel).toBe('დუბლირება (1)');
  });

  it('duplicates the selection after itself as one history entry (R7-D1)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClip('m1'));
    act(() => result.current.duplicateSelection());
    const copy = result.current.arrangement.clips.find(
      (clip) => clip.id === result.current.selectedClipId,
    );
    expect(copy).toMatchObject({ trackId: 'music', start: 8, sourceOffset: 0, duration: 8 });
    expect(result.current.projectEnd).toBe(16);
    expect(result.current.undoLabel).toBe('დუბლირება (1)');
    act(() => result.current.undo());
    expect(result.current.arrangement.clips).toHaveLength(2);
    expect(result.current.undoLabel).toBeNull();
  });

  it('refuses Duplicate with a range and without a selection', async () => {
    const result = await mountEditProvider();
    act(() => result.current.duplicateSelection());
    expect(result.current.status).toBe('დასადუბლირებლად აირჩიე კლიპი.');
    act(() => result.current.selectClip('m1'));
    act(() => result.current.setTimeRange({ start: 1, end: 2, trackId: 'music' }));
    act(() => result.current.duplicateSelection());
    expect(result.current.status).toBe('დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.');
    expect(result.current.undoLabel).toBeNull();
  });

  it('splits every selected clip crossed by the playhead as one entry (R7-D4)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClips(['m1', 's1']));
    act(() => result.current.seekTo(3));
    act(() => result.current.splitSelection());
    expect(result.current.undoLabel).toBe('გაყოფა (2)');
    expect(result.current.selectedClipIds).toHaveLength(2);
    const rights = result.current.arrangement.clips.filter((clip) =>
      result.current.selectedClipIds.includes(clip.id),
    );
    expect(rights.map((clip) => [clip.trackId, clip.start, clip.sourceOffset])).toEqual([
      ['music', 3, 3],
      ['sfx', 3, 2],
    ]);
    act(() => result.current.seekTo(30));
    act(() => result.current.splitSelection());
    expect(result.current.status).toBe('Playhead არცერთ მონიშნულ კლიპს არ კვეთს.');
    expect(result.current.undoLabel).toBe('გაყოფა (2)');
  });

  it('copies and pastes at the playhead onto the active track as one entry (R9-C1)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.pasteClipboard());
    expect(result.current.status).toBe('ბუფერი ცარიელია — ჯერ Copy ან Cut.');
    act(() => result.current.selectClip('m1'));
    act(() => result.current.copySelection());
    expect(result.current.undoLabel).toBeNull();
    act(() => result.current.setActiveTrack('music'));
    act(() => result.current.seekTo(20));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe('ჩასმა (1)');
    const pasted = result.current.arrangement.clips.find(
      (clip) => clip.id === result.current.selectedClipId,
    );
    expect(pasted).toMatchObject({ trackId: 'music', start: 20, sourceOffset: 0, duration: 8 });
    act(() => result.current.undo());
    expect(result.current.arrangement.clips.map((clip) => clip.id)).toEqual(['m1', 's1']);
  });

  it('Cut Time over silence keeps the previous clipboard (review finding #2)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClip('s1'));
    act(() => result.current.copySelection());
    act(() => result.current.setTimeRange({ start: 9, end: 10, trackId: 'music' }));
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.status).toContain('ბუფერი არ შეცვლილა');
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(20));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe('ჩასმა (1)');
    const pasted = result.current.arrangement.clips.find(
      (clip) => clip.id === result.current.selectedClipId,
    );
    expect(pasted).toMatchObject({ trackId: 'sfx', start: 20, sourceOffset: 1, duration: 4 });
  });

  it('Cut Time equals Delete Time and fills the clipboard (R9-C3)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.setTimeRange({ start: 4, end: 6, trackId: 'music' }));
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBe('Cut Time');
    expect(
      result.current.arrangement.clips.map((clip) => [clip.trackId, clip.start, clip.duration]),
    ).toEqual(
      deleteTime(editArrangement(), 4, 6).clips.map((clip) => [
        clip.trackId,
        clip.start,
        clip.duration,
      ]),
    );
    act(() => result.current.seekTo(30));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe('ჩასმა (2)');
    act(() => result.current.cutTimeSelection());
    expect(result.current.status).toBe('Cut Time-ისთვის ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+X).');
  });

  it('refuses split, delete and loop while a pointer gesture is active (D-26)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClip('m1'));
    act(() => result.current.seekTo(3));
    act(() => result.current.setTimeRange({ start: 1, end: 2, trackId: 'music' }));
    const before = result.current.arrangement;
    const claim: { release: (() => void) | null } = { release: null };
    act(() => {
      claim.release = result.current.claimPointerGesture(7, () => undefined);
    });
    for (const command of [
      result.current.splitSelection,
      result.current.deleteSelection,
      result.current.toggleLoopSelection,
    ]) {
      act(() => result.current.setStatus('ready'));
      act(() => command());
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(result.current.arrangement).toBe(before);
      expect(result.current.undoLabel).toBeNull();
    }
    act(() => claim.release?.());
    act(() => result.current.deleteSelection());
    expect(result.current.undoLabel).toBe('წაშლა მონაკვეთზე');
  });

  it('claims one pointer gesture at a time: other pointers are refused, the same pointer aborts the stale one (D-26)', async () => {
    const result = await mountEditProvider();
    const aborted: string[] = [];
    const claims: { first: (() => void) | null; third: (() => void) | null } = {
      first: null,
      third: null,
    };
    act(() => {
      claims.first = result.current.claimPointerGesture(7, () => {
        aborted.push('first');
        claims.first?.();
      });
    });
    expect(result.current.isPointerGestureActive()).toBe(true);
    expect(result.current.claimPointerGesture(21, () => aborted.push('second'))).toBeNull();
    act(() => {
      claims.third = result.current.claimPointerGesture(7, () => aborted.push('third'));
    });
    expect(aborted).toEqual(['first']);
    expect(claims.third).not.toBeNull();
    expect(result.current.isPointerGestureActive()).toBe(true);
    act(() => claims.third?.());
    expect(result.current.isPointerGestureActive()).toBe(false);
  });

  it('names the lane and the paste time in the lane-kind refusal (C-R5-04, R6-P1)', async () => {
    const result = await mountEditProvider();
    act(() => result.current.selectClip('m1'));
    act(() => result.current.copySelection());
    act(() => result.current.setActiveTrack('video'));
    act(() => result.current.seekTo(40));
    const before = result.current.arrangement;
    act(() => result.current.pasteClipboard());
    expect(result.current.status).toBe(
      'ჩასმა ვერ შესრულდა: ვიდეო ხაზზე 00:40.000-დან ეს მასალა არ ჯდება (აუდიო და ვიდეო ხაზს არ იცვლის). არაფერი შეცვლილა.',
    );
    expect(result.current.arrangement).toBe(before);
    expect(result.current.undoLabel).toBeNull();
  });
});

describe('D-27 Play past the project end keeps the insert position (R27-U)', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function impactArrangement(loop: Arrangement['loop']): Arrangement {
    const base = createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]);
    return {
      ...base,
      clips: [
        { id: 'i1', trackId: 'sfx', sourceId: 'song', start: 0, sourceOffset: 0, duration: 2 },
      ],
      loop,
    };
  }

  async function mountImpact(loop: Arrangement['loop'] = null) {
    const view = renderHook(() => useArrangement(), {
      wrapper: providerWrapper(impactArrangement(loop)),
    });
    await flushLoads();
    return view.result;
  }

  it('refuses Play beyond the end, keeps the position and lets paste land there', async () => {
    const result = await mountImpact();
    act(() => result.current.selectClip('i1'));
    act(() => result.current.copySelection());
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(5));
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.getLivePosition()).toBe(5);
    expect(result.current.status).toBe(playPastEndMessage(5, 2));
    expect(result.current.status).toBe(
      'Playhead (00:05.000) პროექტის ბოლოს (00:02.000) მიღმაა — აქ დასაკრავი არაფერია. Home აბრუნებს 0-ზე.',
    );
    act(() => result.current.pasteClipboard());
    const pasted = result.current.arrangement.clips.find(
      (clip) => clip.id === result.current.selectedClipId,
    );
    expect(pasted).toMatchObject({ trackId: 'sfx', start: 5 });
  });

  it('creates no AudioContext when Play is refused beyond the end', async () => {
    const created = { count: 0 };
    class CountingAudioContext extends FakeAudioContext {
      constructor() {
        super();
        created.count += 1;
      }
    }
    vi.stubGlobal('AudioContext', CountingAudioContext);
    const result = await mountImpact();
    act(() => result.current.seekTo(5));
    const before = created.count;
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(false);
    expect(created.count).toBe(before);
    expect(result.current.getLivePosition()).toBe(5);
  });

  it('restarts from 0 when the position is at the end and plays from an inner position', async () => {
    const result = await mountImpact();
    act(() => result.current.seekTo(2));
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.getLivePosition()).toBeLessThan(0.5);
    act(() => result.current.togglePlayback());
    act(() => result.current.seekTo(1));
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.getLivePosition()).toBeGreaterThanOrEqual(0.99);
    act(() => result.current.togglePlayback());
  });

  it('keeps the D-17 loop behaviour past the end when a loop covers the position', async () => {
    const result = await mountImpact({ start: 3, end: 4, enabled: true });
    act(() => result.current.seekTo(3.5));
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.getLivePosition()).toBeGreaterThanOrEqual(3.49);
    act(() => result.current.togglePlayback());
  });
});
