import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementLane } from '~/components/arrangement/ArrangementLane';
import { ArrangementLoopBrace } from '~/components/arrangement/ArrangementLoopBrace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

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

class FakeOfflineAudioContext {}

const guardCollection: WorkspaceCollection = {
  id: 'guard',
  label: 'guard',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'guard', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function guardArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
      { id: 'impact', trackId: 'sfx', sourceId: 'song', start: 8, sourceOffset: 0, duration: 2 },
    ],
    loop: { start: 12, end: 14, enabled: true },
  };
}

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 80;
const SFX_LANE_Y = 120;

interface GuardApiRef {
  current: ArrangementContextValue | null;
}

function GuardProbe({ api }: { api: GuardApiRef }) {
  api.current = useArrangement();
  return null;
}

function GuardLanes() {
  const { arrangement } = useArrangement();
  return (
    <div>
      {arrangement.tracks
        .filter((track) => track.kind === 'audio')
        .map((track) => (
          <ArrangementLane
            key={track.id}
            track={track}
            timelineWidth={800}
            onBackgroundPointerDown={() => undefined}
          />
        ))}
    </div>
  );
}

function stubCapture(element: Element) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountGuard() {
  const api: GuardApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={guardCollection} initialArrangement={guardArrangement()}>
      <ArrangementLoopBrace seconds={20} pxPerSecond={PX_PER_SECOND} />
      <GuardLanes />
      <GuardProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => api.current?.setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
  };
  const brace = view.getByTestId('arrangement-loop-brace');
  stubCapture(brace);
  return { api, view, clipParts, brace };
}

function live(api: GuardApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function clipStart(api: GuardApiRef, clipId: string): number | undefined {
  return live(api).arrangement.clips.find((clip) => clip.id === clipId)?.start;
}

const press = { button: 0, buttons: 1 };

function volumeSlider(view: ReturnType<typeof render>, trackName: string): HTMLInputElement {
  const volume = view.getByRole('slider', { name: `Volume — ${trackName}` });
  if (!(volume instanceof HTMLInputElement)) {
    throw new Error('volume slider missing');
  }
  return volume;
}

function trackVolume(api: GuardApiRef, trackId: string): number | undefined {
  return live(api).arrangement.tracks.find((track) => track.id === trackId)?.volume;
}

describe('D-26 one edit gesture at a time (C-R5-02, R26-U)', () => {
  beforeEach(() => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ignores a second pointer dragging another clip; only the first gesture commits', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const impact = clipParts('impact');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    fireEvent.pointerDown(impact.header, {
      ...press,
      pointerId: 21,
      clientX: 340,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(impact.root, { pointerId: 21, clientX: 380, clientY: SFX_LANE_Y });
    fireEvent.pointerUp(impact.root, { pointerId: 21, clientX: 380, clientY: SFX_LANE_Y });
    expect(clipStart(api, 'impact')).toBe(8);
    expect(live(api).selectedClipIds).toEqual(['music-1']);
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 180, clientY: 0 });
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 180, clientY: 0 });
    expect(clipStart(api, 'music-1')).toBe(4);
    expect(clipStart(api, 'impact')).toBe(8);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    act(() => live(api).undo());
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(live(api).undoLabel).toBeNull();
  });

  it('ignores a second pointer on the loop brace while a clip is dragged', async () => {
    const { api, clipParts, brace } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    fireEvent.pointerDown(brace, { ...press, pointerId: 21, clientX: 500 });
    fireEvent.pointerMove(brace, { pointerId: 21, clientX: 580 });
    expect(live(api).arrangement.loop).toEqual({ start: 12, end: 14, enabled: true });
    fireEvent.pointerUp(brace, { pointerId: 21, clientX: 580 });
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(live(api).arrangement.loop).toEqual({ start: 12, end: 14, enabled: true });
    expect(clipStart(api, 'music-1')).toBe(3);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('refuses Mute, Solo and Volume during a gesture without a history entry', async () => {
    const { api, view, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    const mute = view.getByRole('button', { name: 'Mute — SFX' });
    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    const solo = view.getByRole('button', { name: /^Solo — SFX/ });
    fireEvent.click(solo);
    expect(solo.getAttribute('aria-pressed')).toBe('false');
    const volume = view.getByRole('slider', { name: 'Volume — SFX' });
    if (!(volume instanceof HTMLInputElement)) {
      throw new Error('volume slider missing');
    }
    fireEvent.change(volume, { target: { value: '0.3' } });
    fireEvent.pointerUp(volume);
    expect(volume.value).toBe('1');
    expect(live(api).arrangement.tracks.find((track) => track.id === 'sfx')?.volume).toBe(1);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 100, clientY: 0 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    expect(live(api).undoLabel).toBe('Mute — SFX');
  });

  it('refuses library add and library drop during a gesture', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    act(() => live(api).addSourceToActiveTrack('song'));
    expect(live(api).arrangement.clips).toHaveLength(2);
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    let dropped = true;
    act(() => {
      live(api).beginLibraryDrag('song');
      dropped = live(api).dropLibrarySource('sfx', 14);
    });
    expect(dropped).toBe(false);
    expect(live(api).arrangement.clips).toHaveLength(2);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 100, clientY: 0 });
  });

  it('ends a stale gesture of the same pointer on another clip before the new one starts', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const impact = clipParts('impact');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 180, clientY: 0 });
    expect(clipStart(api, 'music-1')).toBe(4);
    fireEvent.pointerDown(impact.header, {
      ...press,
      pointerId: 7,
      clientX: 340,
      clientY: SFX_LANE_Y,
    });
    expect(clipStart(api, 'music-1')).toBe(2);
    fireEvent.pointerMove(impact.root, { pointerId: 7, clientX: 380, clientY: SFX_LANE_Y });
    fireEvent.pointerUp(impact.root, { pointerId: 7, clientX: 380, clientY: SFX_LANE_Y });
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(clipStart(api, 'impact')).toBe(9);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    act(() => live(api).undo());
    expect(clipStart(api, 'impact')).toBe(8);
    expect(live(api).undoLabel).toBeNull();
  });

  it('ends a stale brace gesture of the same pointer when a clip drag starts', async () => {
    const { api, clipParts, brace } = await mountGuard();
    const impact = clipParts('impact');
    fireEvent.pointerDown(brace, { ...press, pointerId: 7, clientX: 500 });
    fireEvent.pointerMove(brace, { pointerId: 7, clientX: 580 });
    expect(live(api).arrangement.loop).toEqual({ start: 14, end: 16, enabled: true });
    fireEvent.pointerDown(impact.header, {
      ...press,
      pointerId: 7,
      clientX: 340,
      clientY: SFX_LANE_Y,
    });
    expect(live(api).arrangement.loop).toEqual({ start: 12, end: 14, enabled: true });
    fireEvent.pointerMove(impact.root, { pointerId: 7, clientX: 380, clientY: SFX_LANE_Y });
    fireEvent.pointerUp(impact.root, { pointerId: 7, clientX: 380, clientY: SFX_LANE_Y });
    expect(clipStart(api, 'impact')).toBe(9);
    expect(live(api).arrangement.loop).toEqual({ start: 12, end: 14, enabled: true });
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('keeps the first gesture ghost when another clip is pressed and released', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const impact = clipParts('impact');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 100, clientY: SFX_LANE_Y });
    expect(live(api).clipLaneDrag?.ghosts.length).toBeGreaterThan(0);
    fireEvent.pointerDown(impact.header, {
      ...press,
      pointerId: 21,
      clientX: 340,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(impact.root, { pointerId: 21, clientX: 380, clientY: SFX_LANE_Y });
    fireEvent.pointerUp(impact.root, { pointerId: 21, clientX: 380, clientY: SFX_LANE_Y });
    expect(live(api).clipLaneDrag?.ghosts.length).toBeGreaterThan(0);
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 100, clientY: SFX_LANE_Y });
    expect(live(api).clipLaneDrag).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('publishes whether Shift locks time so the footer hint can follow it (R6-H1)', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(live(api).clipLaneDrag?.timeLocked).toBe(false);
    fireEvent.pointerMove(music.root, {
      pointerId: 7,
      clientX: 140,
      clientY: SFX_LANE_Y,
      shiftKey: true,
    });
    expect(live(api).clipLaneDrag?.timeLocked).toBe(true);
    expect(live(api).clipLaneDrag?.ghosts[0]?.start).toBe(2);
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: SFX_LANE_Y });
    expect(live(api).clipLaneDrag).toBeNull();
  });

  it('ends a gesture whose pointerup reached only the window, so a new pointer is not locked out', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const impact = clipParts('impact');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 31, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 31, clientX: 180, clientY: 0 });
    expect(clipStart(api, 'music-1')).toBe(4);
    fireEvent.pointerUp(window, { pointerId: 31 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerDown(impact.header, {
      ...press,
      pointerId: 32,
      clientX: 340,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(impact.root, { pointerId: 32, clientX: 380, clientY: SFX_LANE_Y });
    fireEvent.pointerUp(impact.root, { pointerId: 32, clientX: 380, clientY: SFX_LANE_Y });
    expect(clipStart(api, 'impact')).toBe(9);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
  });

  it('ends an active gesture without an entry when the window loses focus', async () => {
    const { api, clipParts, brace } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 41, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 41, clientX: 180, clientY: 0 });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerDown(brace, { ...press, pointerId: 42, clientX: 500 });
    fireEvent.pointerMove(brace, { pointerId: 42, clientX: 580 });
    fireEvent.pointerUp(brace, { pointerId: 42, clientX: 580 });
    expect(live(api).arrangement.loop).toEqual({ start: 14, end: 16, enabled: true });
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('treats a Volume slider drag as the gesture: a second pointer cannot drag a clip and Volume commits on release (D-30, R30-1)', async () => {
    const { api, view, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(volume, { ...press, pointerId: 1 });
    fireEvent.change(volume, { target: { value: '0.5' } });
    expect(live(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'Mute — SFX' }));
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    fireEvent.pointerUp(volume, { pointerId: 1 });
    expect(live(api).undoLabel).toBe('Volume');
    expect(trackVolume(api, 'sfx')).toBe(0.5);
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 180, clientY: 0 });
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 180, clientY: 0 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(live(api).undoLabel).toBe('Volume');
    expect(live(api).isPointerGestureActive()).toBe(false);
    act(() => live(api).undo());
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBeNull();
  });

  it('writes one Volume entry with the final value for a normal drag and undo restores it (R30-2)', async () => {
    const { api, view } = await mountGuard();
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(volume, { ...press, pointerId: 2 });
    fireEvent.change(volume, { target: { value: '0.7' } });
    fireEvent.change(volume, { target: { value: '0.4' } });
    fireEvent.pointerUp(volume, { pointerId: 2 });
    expect(trackVolume(api, 'sfx')).toBe(0.4);
    expect(live(api).undoLabel).toBe('Volume');
    expect(live(api).isPointerGestureActive()).toBe(false);
    act(() => live(api).undo());
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBeNull();
  });

  it('keeps refusing a Volume drag that starts while a clip is dragged (R26-2 order)', async () => {
    const { api, view, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerDown(volume, { ...press, pointerId: 3 });
    fireEvent.change(volume, { target: { value: '0.2' } });
    expect(volume.value).toBe('1');
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    fireEvent.pointerUp(volume, { pointerId: 3 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('restores the stored Volume without an entry when the slider blurs mid-drag (D-30 abort)', async () => {
    const { api, view } = await mountGuard();
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(volume, { ...press, pointerId: 4 });
    fireEvent.change(volume, { target: { value: '0.3' } });
    expect(trackVolume(api, 'sfx')).toBe(0.3);
    fireEvent.blur(volume);
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(volume.value).toBe('1');
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerUp(volume, { pointerId: 4 });
    expect(live(api).undoLabel).toBeNull();
  });

  it('aborts a Volume drag on window blur and commits one whose release reached only the window', async () => {
    const { api, view } = await mountGuard();
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(volume, { ...press, pointerId: 5 });
    fireEvent.change(volume, { target: { value: '0.6' } });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerDown(volume, { ...press, pointerId: 6 });
    fireEvent.change(volume, { target: { value: '0.6' } });
    fireEvent.pointerUp(window, { pointerId: 6 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(trackVolume(api, 'sfx')).toBe(0.6);
    expect(live(api).undoLabel).toBe('Volume');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('keeps a Volume drag when another slider loses focus as the drag starts (D-30)', async () => {
    const { api, view, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const sfxVolume = volumeSlider(view, 'SFX');
    const musicVolume = volumeSlider(view, 'მუსიკა');
    fireEvent.pointerDown(sfxVolume, { ...press, pointerId: 11 });
    fireEvent.blur(musicVolume);
    fireEvent.change(sfxVolume, { target: { value: '0.4' } });
    expect(live(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerUp(musicVolume, { pointerId: 12 });
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(clipStart(api, 'music-1')).toBe(2);
    fireEvent.pointerUp(sfxVolume, { pointerId: 11 });
    expect(trackVolume(api, 'sfx')).toBe(0.4);
    expect(live(api).undoLabel).toBe('Volume');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('reverts a Volume drag whose pointer is cancelled, without an entry', async () => {
    const { api, view } = await mountGuard();
    const volume = volumeSlider(view, 'SFX');
    fireEvent.pointerDown(volume, { ...press, pointerId: 13 });
    fireEvent.change(volume, { target: { value: '0.2' } });
    fireEvent.pointerCancel(window, { pointerId: 13 });
    fireEvent(volume, new Event('lostpointercapture', { bubbles: true }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('keeps a keyboard Volume change pending during a clip drag and writes it before the move', async () => {
    const { api, view, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    const volume = volumeSlider(view, 'SFX');
    fireEvent.change(volume, { target: { value: '0.5' } });
    fireEvent.pointerDown(music.header, { ...press, pointerId: 7, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    fireEvent.keyUp(volume, { key: 'ArrowLeft' });
    fireEvent.blur(volume);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: 0 });
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(clipStart(api, 'music-1')).toBe(3);
    act(() => live(api).undo());
    expect(clipStart(api, 'music-1')).toBe(2);
    expect(trackVolume(api, 'sfx')).toBe(0.5);
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(trackVolume(api, 'sfx')).toBe(1);
    expect(live(api).undoLabel).toBeNull();
  });

  it('keeps a gesture whose own element received the pointerup when the window sees it too', async () => {
    const { api, clipParts } = await mountGuard();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, { ...press, pointerId: 51, clientX: 100, clientY: 0 });
    fireEvent.pointerMove(music.root, { pointerId: 51, clientX: 180, clientY: 0 });
    fireEvent.pointerUp(music.root, { pointerId: 51, clientX: 180, clientY: 0 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(clipStart(api, 'music-1')).toBe(4);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(live(api).isPointerGestureActive()).toBe(false);
  });
});
