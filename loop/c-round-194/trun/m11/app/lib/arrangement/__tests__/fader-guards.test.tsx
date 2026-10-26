import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement, trackPanValue } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioEditStrings } from '../strings';
import { trackVolumeFromDb } from '../track-volume-db';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const PAN_LABEL = 'Pan — მუსიკა';
const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';
const MUTE_VIDEO_LABEL = 'Mute — ვიდეო';
const CLIP_DELETE_LABEL = studioEditStrings.historyDeleteClip;
const TRACKS_PER_GRAPH = 3;

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

const audioLog: { panners: FakePanner[] } = { panners: [] };

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
    const panner = new FakePanner('panner');
    audioLog.panners.push(panner);
    return panner;
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

const faderCollection: WorkspaceCollection = {
  id: 'fader',
  label: 'fader',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function faderArrangement(): Arrangement {
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

function musicPanner(): FakePanner {
  const music = audioLog.panners.slice(-TRACKS_PER_GRAPH)[1];
  if (!music) {
    throw new Error('no graph panners');
  }
  return music;
}

interface FaderApiRef {
  current: ArrangementContextValue | null;
}

interface PositionStoreRef {
  current: ArrangementPositionStore | null;
}

function FaderProbe({ api, store }: { api: FaderApiRef; store: PositionStoreRef }) {
  api.current = useArrangement();
  store.current = useArrangementPositionStore();
  return null;
}

function live(api: FaderApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(api: FaderApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

async function mountFaderWorkspace() {
  const api: FaderApiRef = { current: null };
  const store: PositionStoreRef = { current: null };
  const view = render(
    <ArrangementProvider collection={faderCollection} initialArrangement={faderArrangement()}>
      <StudioWorkspace />
      <FaderProbe api={api} store={store} />
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
    sfxVolume: () => range('[data-track-id="sfx"] input[aria-label="Volume — SFX"]'),
    master: () => range('input[aria-label="Master Volume"]'),
    zoom: () => range('[data-testid="arrangement-zoom"]'),
    playhead: () => view.getByRole('slider', { name: 'Playhead' }),
  };
  const readPosition = () => {
    if (!store.current) {
      throw new Error('position store not mounted');
    }
    return store.current.getPosition();
  };
  const selectSfxClip = () => {
    act(() => live(api).selectClip('s1'));
    expect(live(api).selectedClipIds).toEqual(['s1']);
  };
  return { api, view, controls, readPosition, selectSfxClip };
}

const press = { button: 0, buttons: 1 };

function windowPointer(type: 'pointerup' | 'pointercancel', pointerId: number) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId }));
  });
}

describe('fader keys and pointers (C-R31-02, C-R31-01; D-29w)', { timeout: 15_000 }, () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    audioLog.panners = [];
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

  describe('Delete guard on native range inputs (C-R31-02)', () => {
    const guarded = ['musicVolume', 'sfxVolume', 'master', 'zoom', 'pan'] as const;

    for (const name of guarded) {
      it(`Delete and Backspace on the focused ${name} slider keep the selected clip, history, status and value`, async () => {
        const { api, controls, selectSfxClip } = await mountFaderWorkspace();
        selectSfxClip();
        const control = controls[name]();
        const arrangementBefore = live(api).arrangement;
        const tableBefore = clipTable(arrangementBefore);
        const statusBefore = live(api).status;
        const valueBefore = control.value;
        control.focus();
        expect(fireEvent.keyDown(control, { key: 'Delete', code: 'Delete' })).toBe(true);
        expect(fireEvent.keyDown(control, { key: 'Backspace', code: 'Backspace' })).toBe(true);
        expect(live(api).arrangement).toBe(arrangementBefore);
        expect(clipTable(live(api).arrangement)).toEqual(tableBefore);
        expect(live(api).undoLabel).toBeNull();
        expect(live(api).status).toBe(statusBefore);
        expect(live(api).selectedClipIds).toEqual(['s1']);
        expect(controls[name]().value).toBe(valueBefore);
      });
    }

    it('positive control: Delete on document.body deletes the selected clip with one entry and leaves a gap', async () => {
      const { api, selectSfxClip } = await mountFaderWorkspace();
      selectSfxClip();
      expect(fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' })).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
      ]);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
    });

    it('narrow guard: Delete on the focused playhead handle (role="slider") still deletes the selected clip', async () => {
      const { api, controls, selectSfxClip } = await mountFaderWorkspace();
      selectSfxClip();
      const playhead = controls.playhead();
      playhead.focus();
      expect(document.activeElement).toBe(playhead);
      expect(fireEvent.keyDown(playhead, { key: 'Delete', code: 'Delete' })).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
      ]);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
    });

    it('the Pan slider no longer stops Delete: a window keydown listener receives it', async () => {
      const { api, controls, selectSfxClip } = await mountFaderWorkspace();
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
        fireEvent.keyDown(pan, { key: 'Backspace', code: 'Backspace' });
      } finally {
        window.removeEventListener('keydown', listener);
      }
      expect(received).toEqual([
        { key: 'Delete', target: pan, prevented: false },
        { key: 'Backspace', target: pan, prevented: false },
      ]);
      expect(live(api).undoLabel).toBeNull();
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
    });

    it('during another pointer gesture Delete on a focused Volume keeps the gesture-blocked status (unchanged)', async () => {
      const { api, controls, selectSfxClip } = await mountFaderWorkspace();
      selectSfxClip();
      let release: (() => void) | null = null;
      act(() => {
        release = live(api).claimPointerGesture(77, () => undefined);
      });
      const volume = controls.musicVolume();
      volume.focus();
      expect(fireEvent.keyDown(volume, { key: 'Delete', code: 'Delete' })).toBe(false);
      expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(live(api).undoLabel).toBeNull();
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      act(() => release?.());
    });
  });

  describe('Pan blur-continue (C-R31-01)', () => {
    it('after a blur the same held pointer writes nothing: no entry, stored pan, stored slider value, no panner push', async () => {
      const { api, controls } = await mountFaderWorkspace();
      fireEvent.change(controls.pan(), { target: { value: '10' } });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.2);
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      const panner = musicPanner();
      expect(panner.pan.value).toBe(0.2);
      const presentBefore = live(api).arrangement;
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.change(controls.pan(), { target: { value: '-20' } });
      fireEvent.blur(controls.pan());
      const targetsAfterRevert = panner.pan.targets.map((entry) => entry.target);
      expect(targetsAfterRevert).toEqual([-0.2, -0.4, 0.2]);
      fireEvent.change(controls.pan(), { target: { value: '-30' } });
      fireEvent.change(controls.pan(), { target: { value: '-40' } });
      expect(controls.pan().value).toBe('10');
      windowPointer('pointerup', 41);
      expect(live(api).arrangement).toBe(presentBefore);
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.2);
      expect(controls.pan().value).toBe('10');
      expect(panner.pan.targets.map((entry) => entry.target)).toEqual(targetsAfterRevert);
      expect(live(api).isPointerGestureActive()).toBe(false);
      act(() => live(api).togglePlayback());
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });

    it('after that pointer is released a fresh drag gives exactly one Pan entry', async () => {
      const { api, controls } = await mountFaderWorkspace();
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.blur(controls.pan());
      fireEvent.change(controls.pan(), { target: { value: '-20' } });
      windowPointer('pointerup', 41);
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 43 });
      fireEvent.change(controls.pan(), { target: { value: '-25' } });
      expect(controls.pan().value).toBe('-25');
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      fireEvent.pointerUp(controls.pan(), { pointerId: 43 });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.5);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('after a pointercancel of that pointer one keyboard-style change gives exactly one Pan entry', async () => {
      const { api, controls } = await mountFaderWorkspace();
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.blur(controls.pan());
      fireEvent.change(controls.pan(), { target: { value: '-20' } });
      windowPointer('pointercancel', 41);
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      fireEvent.change(controls.pan(), { target: { value: '7' } });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.14);
      expect(controls.pan().value).toBe('7');
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('a new successful pointerdown while suppressed starts a normal drag; the old pointer release does nothing', async () => {
      const { api, controls } = await mountFaderWorkspace();
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.blur(controls.pan());
      fireEvent.change(controls.pan(), { target: { value: '-20' } });
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 42 });
      fireEvent.change(controls.pan(), { target: { value: '-15' } });
      expect(controls.pan().value).toBe('-15');
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      fireEvent.pointerUp(controls.pan(), { pointerId: 42 });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.3);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
      const afterCommit = live(api).arrangement;
      windowPointer('pointerup', 41);
      expect(live(api).arrangement).toBe(afterCommit);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('a pointerup of another pointer and a refused pointerdown keep the suppression', async () => {
      const { api, controls } = await mountFaderWorkspace();
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.blur(controls.pan());
      windowPointer('pointerup', 99);
      fireEvent.change(controls.pan(), { target: { value: '-20' } });
      expect(controls.pan().value).toBe('0');
      let release: (() => void) | null = null;
      act(() => {
        release = live(api).claimPointerGesture(77, () => undefined);
      });
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 42 });
      act(() => release?.());
      fireEvent.change(controls.pan(), { target: { value: '-15' } });
      expect(controls.pan().value).toBe('0');
      expect(live(api).undoLabel).toBe(MUTE_VIDEO_LABEL);
      windowPointer('pointerup', 41);
      fireEvent.change(controls.pan(), { target: { value: '5' } });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.1);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MUTE_VIDEO_LABEL]);
    });

    it('unmounting with a pending suppression removes its window listeners', async () => {
      const added: Array<[string, EventListenerOrEventListenerObject]> = [];
      const removed: Array<[string, EventListenerOrEventListenerObject]> = [];
      const { view, controls } = await mountFaderWorkspace();
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      const addSpy = vi.spyOn(window, 'addEventListener');
      fireEvent.blur(controls.pan());
      for (const [type, listener] of addSpy.mock.calls) {
        if ((type === 'pointerup' || type === 'pointercancel') && listener) {
          added.push([type, listener]);
        }
      }
      addSpy.mockRestore();
      expect(added.map(([type]) => type)).toEqual(['pointerup', 'pointercancel']);
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      view.unmount();
      for (const [type, listener] of removeSpy.mock.calls) {
        if (listener) {
          removed.push([type, listener]);
        }
      }
      for (const entry of added) {
        expect(removed).toContainEqual(entry);
      }
    });
  });

  describe('Volume blur-continue reference (unchanged behaviour)', () => {
    it('the same sequence on the music Volume gives exactly one Volume entry on release', async () => {
      const { api, controls } = await mountFaderWorkspace();
      act(() => live(api).toggleTrackMute('video'));
      fireEvent.pointerDown(controls.musicVolume(), { ...press, pointerId: 41 });
      fireEvent.change(controls.musicVolume(), { target: { value: '-6' } });
      fireEvent.change(controls.musicVolume(), { target: { value: '-8' } });
      fireEvent.blur(controls.musicVolume());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
      fireEvent.change(controls.musicVolume(), { target: { value: '-10.5' } });
      fireEvent.change(controls.musicVolume(), { target: { value: '-14' } });
      fireEvent.pointerUp(controls.musicVolume(), { pointerId: 41 });
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(trackVolumeFromDb(-14));
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, MUTE_VIDEO_LABEL]);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    });
  });

  describe('coverage closures (C round 31 notes)', () => {
    it('Home on the focused music Volume and on Master does not seek', async () => {
      const { api, controls, readPosition } = await mountFaderWorkspace();
      for (const control of [controls.musicVolume(), controls.master()]) {
        act(() => live(api).seekTo(5));
        expect(readPosition()).toBe(5);
        control.focus();
        expect(fireEvent.keyDown(control, { key: 'Home', code: 'Home' })).toBe(true);
        expect(readPosition()).toBe(5);
      }
    });

    it('a pending keyboard Volume preview is committed before the Pan gesture starts', async () => {
      const { api, controls } = await mountFaderWorkspace();
      fireEvent.change(controls.musicVolume(), { target: { value: '-10.5' } });
      expect(live(api).undoLabel).toBeNull();
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.pointerUp(controls.pan(), { pointerId: 41 });
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(trackVolumeFromDb(-10.5));
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.2);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, VOLUME_LABEL]);
    });

    it('a pending keyboard Master preview is committed before the Pan gesture starts', async () => {
      const { api, controls } = await mountFaderWorkspace();
      fireEvent.change(controls.master(), { target: { value: '-12' } });
      expect(live(api).undoLabel).toBeNull();
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 41 });
      expect(live(api).undoLabel).toBe(MASTER_VOLUME_LABEL);
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.pointerUp(controls.pan(), { pointerId: 41 });
      expect(live(api).arrangement.master.gainDb).toBe(-12);
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.2);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, MASTER_VOLUME_LABEL]);
    });
  });

  describe('a timeline pointerdown releases fader focus (C-R32-01)', () => {
    const SFX_DELETED_TABLE: ClipRow[] = [
      ['v1', 'video', 0, 4],
      ['m1', 'music', 7, 12],
    ];

    function stubTimelineCapture(element: Element) {
      Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
      Object.defineProperty(element, 'hasPointerCapture', {
        configurable: true,
        value: () => false,
      });
      Object.defineProperty(element, 'releasePointerCapture', {
        configurable: true,
        value: () => {},
      });
    }

    function timelineParts(view: Awaited<ReturnType<typeof mountFaderWorkspace>>['view']) {
      const clipRoot = () => {
        const root = view.container.querySelector<HTMLElement>('[data-clip-id="s1"]');
        if (!root) {
          throw new Error('clip s1 not rendered');
        }
        stubTimelineCapture(root);
        return root;
      };
      const clipHeader = () => {
        const header = clipRoot().firstElementChild;
        if (!(header instanceof HTMLElement)) {
          throw new Error('clip s1 header missing');
        }
        return header;
      };
      const clipBody = () => {
        const body = clipRoot().querySelector<HTMLElement>('[title^="drag = time selection"]');
        if (!body) {
          throw new Error('clip s1 body missing');
        }
        return body;
      };
      const sfxLaneBody = () => {
        const fold = view.container.querySelector(
          '[data-track-id="sfx"] [data-testid="arrangement-track-fold"]',
        );
        const id = fold?.getAttribute('aria-controls') ?? '';
        const body = document.getElementById(id);
        if (!body) {
          throw new Error('sfx lane body missing');
        }
        return body;
      };
      const ruler = () => {
        const element = view.getByTestId('arrangement-ruler');
        stubTimelineCapture(element);
        return element;
      };
      return { clipRoot, clipHeader, clipBody, sfxLaneBody, ruler };
    }

    function pressOnFocused(key: string): boolean {
      const target = document.activeElement ?? document.body;
      return fireEvent.keyDown(target, { key, code: key });
    }

    function clickClipHeader(parts: ReturnType<typeof timelineParts>, pointerId: number) {
      fireEvent.pointerDown(parts.clipHeader(), { ...press, pointerId, clientX: 10, clientY: 5 });
      fireEvent.pointerUp(parts.clipRoot(), { pointerId, clientX: 10, clientY: 5 });
    }

    const faders = ['musicVolume', 'pan', 'master', 'zoom'] as const;

    for (const name of faders) {
      it(`${name} focused → clip header click → Delete deletes the SFX clip with one entry and a gap`, async () => {
        const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
        const parts = timelineParts(view);
        selectSfxClip();
        const control = controls[name]();
        control.focus();
        expect(document.activeElement).toBe(control);
        clickClipHeader(parts, 51);
        expect(document.activeElement).not.toBe(control);
        expect(live(api).isPointerGestureActive()).toBe(false);
        expect(live(api).selectedClipIds).toEqual(['s1']);
        expect(pressOnFocused('Delete')).toBe(false);
        expect(clipTable(live(api).arrangement)).toEqual(SFX_DELETED_TABLE);
        expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
        expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      });
    }

    it('music Volume focused → empty SFX lane body → clip header → Delete deletes with one entry', async () => {
      const { api, view, controls } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      const volume = controls.musicVolume();
      volume.focus();
      const lane = parts.sfxLaneBody();
      fireEvent.pointerDown(lane, { ...press, pointerId: 52, clientX: 300, clientY: 5 });
      expect(document.activeElement).not.toBe(volume);
      windowPointer('pointerup', 52);
      fireEvent.pointerUp(lane, { pointerId: 52, clientX: 300, clientY: 5 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      clickClipHeader(parts, 53);
      expect(live(api).selectedClipIds).toEqual(['s1']);
      expect(pressOnFocused('Delete')).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual(SFX_DELETED_TABLE);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
    });

    it('music Volume focused → clip body pointerdown releases the fader focus', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      fireEvent.pointerDown(parts.clipBody(), {
        ...press,
        pointerId: 54,
        clientX: 10,
        clientY: 30,
      });
      expect(document.activeElement).not.toBe(volume);
      fireEvent.pointerUp(parts.clipRoot(), { pointerId: 54, clientX: 10, clientY: 30 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).undoLabel).toBeNull();
    });

    it('music Volume focused → ruler click releases the fader focus; Delete then acts as with body focus', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      const ruler = parts.ruler();
      fireEvent.pointerDown(ruler, { ...press, pointerId: 55, clientX: 40, clientY: 3 });
      expect(document.activeElement).not.toBe(volume);
      fireEvent.pointerUp(ruler, { pointerId: 55, clientX: 40, clientY: 3 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).selectedClipIds).toEqual(['s1']);
      expect(pressOnFocused('Delete')).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual(SFX_DELETED_TABLE);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
    });

    it('a pending keyboard Volume preview is committed by the blur before the clip gesture, then Delete adds its own entry', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      fireEvent.change(volume, { target: { value: '-10.5' } });
      expect(live(api).undoLabel).toBeNull();
      fireEvent.pointerDown(parts.clipHeader(), {
        ...press,
        pointerId: 56,
        clientX: 10,
        clientY: 5,
      });
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      fireEvent.pointerUp(parts.clipRoot(), { pointerId: 56, clientX: 10, clientY: 5 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(pressOnFocused('Delete')).toBe(false);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(trackVolumeFromDb(-10.5));
      expect(clipTable(live(api).arrangement)).toEqual(SFX_DELETED_TABLE);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL, VOLUME_LABEL]);
    });

    it('music Volume focused → clip header click → ArrowRight nudges the selected clip with one entry', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      clickClipHeader(parts, 57);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(pressOnFocused('ArrowRight')).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
        ['s1', 'sfx', 4.1, 2],
      ]);
      expect(undoChainLabels(api)).toHaveLength(1);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
    });

    it('a pointerdown on the focused Volume itself keeps its focus', async () => {
      const { api, controls } = await mountFaderWorkspace();
      const volume = controls.musicVolume();
      volume.focus();
      fireEvent.pointerDown(volume, { ...press, pointerId: 58 });
      expect(document.activeElement).toBe(volume);
      fireEvent.pointerUp(volume, { pointerId: 58 });
      windowPointer('pointerup', 58);
      expect(document.activeElement).toBe(volume);
      expect(live(api).isPointerGestureActive()).toBe(false);
    });

    it('during an active Pan drag a clip header pointerdown does not blur Pan; the drag still commits one Pan entry', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const pan = controls.pan();
      pan.focus();
      fireEvent.pointerDown(pan, { ...press, pointerId: 41 });
      fireEvent.change(pan, { target: { value: '-10' } });
      expect(live(api).isPointerGestureActive()).toBe(true);
      fireEvent.pointerDown(parts.clipHeader(), {
        ...press,
        pointerId: 42,
        clientX: 10,
        clientY: 5,
      });
      expect(document.activeElement).toBe(pan);
      fireEvent.pointerUp(parts.clipRoot(), { pointerId: 42, clientX: 10, clientY: 5 });
      windowPointer('pointerup', 41);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.2);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });

    it('a plain blur of Pan by a clip header click creates no suppression: one keyboard-style change gives one Pan entry', async () => {
      const { api, view, controls } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      const pan = controls.pan();
      pan.focus();
      clickClipHeader(parts, 59);
      expect(document.activeElement).not.toBe(pan);
      pan.focus();
      fireEvent.change(controls.pan(), { target: { value: '7' } });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.14);
      expect(controls.pan().value).toBe('7');
      expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    });

    it('round-32 regression: Delete on the focused music Volume with no click in between changes nothing', async () => {
      const { api, controls, selectSfxClip } = await mountFaderWorkspace();
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      const arrangementBefore = live(api).arrangement;
      expect(pressOnFocused('Delete')).toBe(true);
      expect(pressOnFocused('Backspace')).toBe(true);
      expect(document.activeElement).toBe(volume);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      expect(live(api).undoLabel).toBeNull();
    });

    it('self-check: a clip drag started while the music Volume is focused moves the clip with one entry', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const volume = controls.musicVolume();
      volume.focus();
      const oneSecondPx = live(api).pxPerSecond;
      fireEvent.pointerDown(parts.clipHeader(), {
        ...press,
        pointerId: 61,
        clientX: 10,
        clientY: 5,
      });
      expect(document.activeElement).not.toBe(volume);
      fireEvent.pointerMove(parts.clipRoot(), {
        pointerId: 61,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      fireEvent.pointerUp(parts.clipRoot(), {
        pointerId: 61,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
        ['s1', 'sfx', 5, 2],
      ]);
      expect(undoChainLabels(api)).toHaveLength(1);
    });

    it('self-check: a drag on the SFX Volume while the music Volume is focused writes one Volume entry', async () => {
      const { api, controls } = await mountFaderWorkspace();
      controls.musicVolume().focus();
      const sfxVolume = controls.sfxVolume();
      fireEvent.pointerDown(sfxVolume, { ...press, pointerId: 62 });
      expect(document.activeElement).toBe(sfxVolume);
      fireEvent.change(sfxVolume, { target: { value: '-6' } });
      fireEvent.pointerUp(sfxVolume, { pointerId: 62 });
      expect(trackOf(live(api).arrangement, 'sfx').volume).toBe(trackVolumeFromDb(-6));
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    });

    it('review: a pending keyboard Master preview is committed by the blur before the clip gesture, then Delete adds its own entry', async () => {
      const { api, view, controls, selectSfxClip } = await mountFaderWorkspace();
      const parts = timelineParts(view);
      selectSfxClip();
      const master = controls.master();
      master.focus();
      fireEvent.change(master, { target: { value: '-12' } });
      expect(live(api).undoLabel).toBeNull();
      fireEvent.pointerDown(parts.clipHeader(), {
        ...press,
        pointerId: 63,
        clientX: 10,
        clientY: 5,
      });
      expect(live(api).undoLabel).toBe(MASTER_VOLUME_LABEL);
      fireEvent.pointerUp(parts.clipRoot(), { pointerId: 63, clientX: 10, clientY: 5 });
      expect(pressOnFocused('Delete')).toBe(false);
      expect(live(api).arrangement.master.gainDb).toBe(-12);
      expect(clipTable(live(api).arrangement)).toEqual(SFX_DELETED_TABLE);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL, MASTER_VOLUME_LABEL]);
    });

    it('review: the Pan readout reset blurs Pan on pointerdown, then returns to C with one entry and refocuses the slider', async () => {
      const { api, view, controls } = await mountFaderWorkspace();
      fireEvent.change(controls.pan(), { target: { value: '-25' } });
      const pan = controls.pan();
      pan.focus();
      const reset = view.container.querySelector<HTMLButtonElement>(
        '[data-track-id="music"] [data-testid="arrangement-track-pan-reset"]',
      );
      if (!reset) {
        throw new Error('pan reset missing');
      }
      fireEvent.pointerDown(reset, { ...press, pointerId: 64 });
      expect(document.activeElement).not.toBe(pan);
      fireEvent.pointerUp(reset, { pointerId: 64 });
      fireEvent.click(reset);
      expect(document.activeElement).toBe(controls.pan());
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, PAN_LABEL]);
    });

    it('self-check: Backspace in the focused library search is left to the text field', async () => {
      const { api, view, selectSfxClip } = await mountFaderWorkspace();
      selectSfxClip();
      const search = view.getByRole('searchbox', { name: 'Search the library' });
      search.focus();
      fireEvent.change(search, { target: { value: 'ab' } });
      expect(pressOnFocused('Backspace')).toBe(true);
      expect(document.activeElement).toBe(search);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      expect(live(api).undoLabel).toBeNull();
    });
  });

  describe('a timeline pointerdown releases text-field focus (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD; D-29y)', () => {
    const CLIP_GAIN_LABEL = 'Clip Gain';
    const CLIP_GAIN_INVALID_STATUS = 'Clip Gain: enter a number in dB (−60…+24).';
    const SFX_GONE_TABLE: ClipRow[] = [
      ['v1', 'video', 0, 4],
      ['m1', 'music', 7, 12],
    ];
    const MUSIC_GONE_TABLE: ClipRow[] = [
      ['v1', 'video', 0, 4],
      ['s1', 'sfx', 4, 2],
    ];
    const SCROLLER_GUTTER_POINT = { clientX: 605, clientY: 100 };
    const SCROLLER_CLIENT_POINT = { clientX: 300, clientY: 100 };

    type EditWorkspace = Awaited<ReturnType<typeof mountFaderWorkspace>>;

    function stubClipCapture(element: Element) {
      Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
      Object.defineProperty(element, 'hasPointerCapture', {
        configurable: true,
        value: () => false,
      });
      Object.defineProperty(element, 'releasePointerCapture', {
        configurable: true,
        value: () => {},
      });
    }

    function textField(view: EditWorkspace['view'], testId: string): HTMLInputElement {
      const field = view.getByTestId(testId);
      if (!(field instanceof HTMLInputElement)) {
        throw new Error(`${testId} is not an input`);
      }
      return field;
    }

    function editParts(view: EditWorkspace['view']) {
      const clipRoot = (clipId: string) => {
        const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
        if (!root) {
          throw new Error(`clip ${clipId} not rendered`);
        }
        stubClipCapture(root);
        return root;
      };
      const clipHeader = (clipId: string) => {
        const header = clipRoot(clipId).firstElementChild;
        if (!(header instanceof HTMLElement)) {
          throw new Error(`clip ${clipId} header missing`);
        }
        return header;
      };
      const sfxLaneBody = () => {
        const fold = view.container.querySelector(
          '[data-track-id="sfx"] [data-testid="arrangement-track-fold"]',
        );
        const body = document.getElementById(fold?.getAttribute('aria-controls') ?? '');
        if (!body) {
          throw new Error('sfx lane body missing');
        }
        return body;
      };
      const scroller = () => view.getByTestId('arrangement-timeline-scroller');
      const search = () => textField(view, 'arrangement-library-search');
      const clipGain = () => textField(view, 'arrangement-detail-clip-gain-input');
      const detailStart = () => textField(view, 'arrangement-detail-start');
      const libraryItemCount = () =>
        view.container.querySelectorAll('[data-testid="arrangement-library-option-title"]').length;
      return {
        clipRoot,
        clipHeader,
        sfxLaneBody,
        scroller,
        search,
        clipGain,
        detailStart,
        libraryItemCount,
      };
    }

    function clickClip(parts: ReturnType<typeof editParts>, clipId: string, pointerId: number) {
      fireEvent.pointerDown(parts.clipHeader(clipId), {
        ...press,
        pointerId,
        clientX: 10,
        clientY: 5,
      });
      fireEvent.pointerUp(parts.clipRoot(clipId), { pointerId, clientX: 10, clientY: 5 });
    }

    function pressOnActive(key: string): boolean {
      return fireEvent.keyDown(document.activeElement ?? document.body, { key, code: key });
    }

    function stubScrollerGeometry(scroller: HTMLElement) {
      const box = { clientWidth: 500, clientHeight: 300, clientLeft: 1, clientTop: 1 };
      for (const [name, value] of Object.entries(box)) {
        Object.defineProperty(scroller, name, { configurable: true, value });
      }
      const rect: DOMRect = {
        x: 100,
        y: 50,
        left: 100,
        top: 50,
        width: 512,
        height: 312,
        right: 612,
        bottom: 362,
        toJSON: () => ({}),
      };
      Object.defineProperty(scroller, 'getBoundingClientRect', {
        configurable: true,
        value: () => rect,
      });
    }

    function typeInSearch(parts: ReturnType<typeof editParts>, text: string) {
      const search = parts.search();
      search.focus();
      fireEvent.change(search, { target: { value: text } });
      expect(document.activeElement).toBe(search);
      expect(search.value).toBe(text);
      return search;
    }

    function typeClipGain(
      workspace: EditWorkspace,
      parts: ReturnType<typeof editParts>,
      text: string,
    ) {
      workspace.selectSfxClip();
      const field = parts.clipGain();
      expect(field.disabled).toBe(false);
      expect(field.value).toBe('0.0');
      field.focus();
      fireEvent.change(field, { target: { value: text } });
      expect(document.activeElement).toBe(field);
      expect(field.value).toBe(text);
      expect(live(workspace.api).undoLabel).toBeNull();
      return field;
    }

    function sfxGainDb(api: FaderApiRef): number | undefined {
      return live(api).arrangement.clips.find((clip) => clip.id === 's1')?.gainDb;
    }

    for (const key of ['Delete', 'Backspace'] as const) {
      it(`search focused, typed "ab" → SFX clip header click → ${key} deletes the SFX clip; the search text and filter are unchanged`, async () => {
        const workspace = await mountFaderWorkspace();
        const { api, view } = workspace;
        const parts = editParts(view);
        const unfilteredCount = parts.libraryItemCount();
        const search = typeInSearch(parts, 'ab');
        const filteredCount = parts.libraryItemCount();
        expect(filteredCount).toBeLessThan(unfilteredCount);
        clickClip(parts, 's1', 71);
        expect(document.activeElement).not.toBe(search);
        expect(live(api).isPointerGestureActive()).toBe(false);
        expect(live(api).selectedClipIds).toEqual(['s1']);
        expect(parts.search().value).toBe('ab');
        expect(parts.libraryItemCount()).toBe(filteredCount);
        expect(pressOnActive(key)).toBe(false);
        expect(clipTable(live(api).arrangement)).toEqual(SFX_GONE_TABLE);
        expect(parts.search().value).toBe('ab');
        expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL]);
      });
    }

    it('search focused → empty SFX lane body pointerdown releases the search focus', async () => {
      const { api, view } = await mountFaderWorkspace();
      const parts = editParts(view);
      const search = typeInSearch(parts, 'ab');
      const lane = parts.sfxLaneBody();
      fireEvent.pointerDown(lane, { ...press, pointerId: 72, clientX: 300, clientY: 5 });
      expect(document.activeElement).not.toBe(search);
      windowPointer('pointerup', 72);
      fireEvent.pointerUp(lane, { pointerId: 72, clientX: 300, clientY: 5 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(parts.search().value).toBe('ab');
      expect(live(api).undoLabel).toBeNull();
    });

    it('Clip Gain typed "3" → music clip header pointerdown commits one Clip Gain entry to SFX before the music gesture; Delete then removes the music clip', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      const field = typeClipGain(workspace, parts, '3');
      fireEvent.pointerDown(parts.clipHeader('m1'), {
        ...press,
        pointerId: 73,
        clientX: 10,
        clientY: 5,
      });
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      expect(sfxGainDb(api)).toBe(3);
      expect(document.activeElement).not.toBe(field);
      fireEvent.pointerUp(parts.clipRoot('m1'), { pointerId: 73, clientX: 10, clientY: 5 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).selectedClipIds).toEqual(['m1']);
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      expect(pressOnActive('Delete')).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual(MUSIC_GONE_TABLE);
      expect(sfxGainDb(api)).toBe(3);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL, CLIP_GAIN_LABEL]);
      expect(sfxGainDb(api)).toBeUndefined();
    });

    it('Clip Gain typed "3" → the same SFX header click commits one entry and releases focus; Delete then removes the SFX clip', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      const field = typeClipGain(workspace, parts, '3');
      clickClip(parts, 's1', 74);
      expect(document.activeElement).not.toBe(field);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).selectedClipIds).toEqual(['s1']);
      expect(sfxGainDb(api)).toBe(3);
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      expect(pressOnActive('Delete')).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual(SFX_GONE_TABLE);
      expect(undoChainLabels(api)).toEqual([CLIP_DELETE_LABEL, CLIP_GAIN_LABEL]);
    });

    it('Clip Gain typed "3" → empty SFX lane body pointerdown commits one Clip Gain entry on SFX', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      const field = typeClipGain(workspace, parts, '3');
      const lane = parts.sfxLaneBody();
      fireEvent.pointerDown(lane, { ...press, pointerId: 75, clientX: 300, clientY: 5 });
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      expect(document.activeElement).not.toBe(field);
      windowPointer('pointerup', 75);
      fireEvent.pointerUp(lane, { pointerId: 75, clientX: 300, clientY: 5 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(sfxGainDb(api)).toBe(3);
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
      expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    });

    it('Clip Gain with its unchanged text → music clip header click writes no entry', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      const field = typeClipGain(workspace, parts, '0.0');
      clickClip(parts, 'm1', 76);
      expect(document.activeElement).not.toBe(field);
      expect(live(api).selectedClipIds).toEqual(['m1']);
      expect(sfxGainDb(api)).toBeUndefined();
      expect(live(api).undoLabel).toBeNull();
    });

    it('Clip Gain emptied → music clip header click gives exactly the status and history of a plain blur of the same text', async () => {
      const control = await mountFaderWorkspace();
      const controlField = typeClipGain(control, editParts(control.view), '');
      fireEvent.blur(controlField);
      const blurStatus = live(control.api).status;
      const blurLabel = live(control.api).undoLabel;
      expect(blurStatus).toBe(CLIP_GAIN_INVALID_STATUS);
      expect(blurLabel).toBeNull();
      control.view.unmount();

      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      const field = typeClipGain(workspace, parts, '');
      fireEvent.pointerDown(parts.clipHeader('m1'), {
        ...press,
        pointerId: 77,
        clientX: 10,
        clientY: 5,
      });
      expect(live(api).status).toBe(blurStatus);
      expect(document.activeElement).not.toBe(field);
      fireEvent.pointerUp(parts.clipRoot('m1'), { pointerId: 77, clientX: 10, clientY: 5 });
      expect(live(api).undoLabel).toBe(blurLabel);
      expect(sfxGainDb(api)).toBeUndefined();
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
    });

    it('detail start typed without Enter → clip header click releases focus, writes no entry and applies no range', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      workspace.selectSfxClip();
      const rangeBefore = live(api).range;
      const start = parts.detailStart();
      expect(start.disabled).toBe(false);
      start.focus();
      fireEvent.change(start, { target: { value: '4.5' } });
      expect(document.activeElement).toBe(start);
      clickClip(parts, 's1', 78);
      expect(document.activeElement).not.toBe(start);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).undoLabel).toBeNull();
      expect(live(api).range).toEqual(rangeBefore);
    });

    it('search focused → pointerdown in the scroller scrollbar gutter keeps the search focus', async () => {
      const { api, view } = await mountFaderWorkspace();
      const parts = editParts(view);
      const scroller = parts.scroller();
      stubScrollerGeometry(scroller);
      const search = typeInSearch(parts, 'ab');
      fireEvent.pointerDown(scroller, { ...press, pointerId: 79, ...SCROLLER_GUTTER_POINT });
      expect(document.activeElement).toBe(search);
      fireEvent.pointerUp(scroller, { pointerId: 79, ...SCROLLER_GUTTER_POINT });
      expect(document.activeElement).toBe(search);
      expect(live(api).undoLabel).toBeNull();
    });

    it('music Volume focused → pointerdown in the scroller scrollbar gutter keeps the Volume focus', async () => {
      const { api, view, controls } = await mountFaderWorkspace();
      const scroller = editParts(view).scroller();
      stubScrollerGeometry(scroller);
      const volume = controls.musicVolume();
      volume.focus();
      fireEvent.pointerDown(scroller, { ...press, pointerId: 80, clientX: 300, clientY: 351 });
      expect(document.activeElement).toBe(volume);
      fireEvent.pointerUp(scroller, { pointerId: 80, clientX: 300, clientY: 351 });
      fireEvent.pointerDown(scroller, { ...press, pointerId: 81, ...SCROLLER_GUTTER_POINT });
      expect(document.activeElement).toBe(volume);
      fireEvent.pointerUp(scroller, { pointerId: 81, ...SCROLLER_GUTTER_POINT });
      expect(live(api).undoLabel).toBeNull();
    });

    it('search focused → pointerdown on the scroller itself inside its client box releases the search focus', async () => {
      const { view } = await mountFaderWorkspace();
      const parts = editParts(view);
      const scroller = parts.scroller();
      stubScrollerGeometry(scroller);
      const search = typeInSearch(parts, 'ab');
      fireEvent.pointerDown(scroller, { ...press, pointerId: 82, ...SCROLLER_CLIENT_POINT });
      expect(document.activeElement).not.toBe(search);
      fireEvent.pointerUp(scroller, { pointerId: 82, ...SCROLLER_CLIENT_POINT });
      expect(parts.search().value).toBe('ab');
    });

    it('review: the gutter boundary subtracts the scroller border (x = 499 releases, x = 500 keeps)', async () => {
      const { view } = await mountFaderWorkspace();
      const parts = editParts(view);
      const scroller = parts.scroller();
      stubScrollerGeometry(scroller);
      const search = typeInSearch(parts, 'ab');
      fireEvent.pointerDown(scroller, { ...press, pointerId: 85, clientX: 601, clientY: 100 });
      expect(document.activeElement).toBe(search);
      fireEvent.pointerUp(scroller, { pointerId: 85, clientX: 601, clientY: 100 });
      fireEvent.pointerDown(scroller, { ...press, pointerId: 86, clientX: 300, clientY: 351 });
      expect(document.activeElement).toBe(search);
      fireEvent.pointerUp(scroller, { pointerId: 86, clientX: 300, clientY: 351 });
      fireEvent.pointerDown(scroller, { ...press, pointerId: 87, clientX: 600, clientY: 350 });
      expect(document.activeElement).not.toBe(search);
      fireEvent.pointerUp(scroller, { pointerId: 87, clientX: 600, clientY: 350 });
    });

    it('review: during an active Pan drag a clip header pointerdown edits nothing; the Pan press itself released the search (D-29z)', async () => {
      const { api, view, controls } = await mountFaderWorkspace();
      const parts = editParts(view);
      const search = typeInSearch(parts, 'ab');
      const pan = controls.pan();
      fireEvent.pointerDown(pan, { ...press, pointerId: 88 });
      expect(live(api).isPointerGestureActive()).toBe(true);
      expect(document.activeElement).not.toBe(search);
      fireEvent.pointerDown(parts.clipHeader('s1'), {
        ...press,
        pointerId: 89,
        clientX: 10,
        clientY: 5,
      });
      expect(document.activeElement).not.toBe(search);
      fireEvent.pointerUp(parts.clipRoot('s1'), { pointerId: 89, clientX: 10, clientY: 5 });
      windowPointer('pointerup', 88);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(parts.search().value).toBe('ab');
      expect(clipTable(live(api).arrangement)).toEqual(clipTable(faderArrangement()));
    });

    it('regression: search focused, typed "ab", Backspace with no click is left to the text field', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      workspace.selectSfxClip();
      const search = typeInSearch(parts, 'ab');
      const arrangementBefore = live(api).arrangement;
      expect(pressOnActive('Backspace')).toBe(true);
      expect(pressOnActive('Delete')).toBe(true);
      expect(document.activeElement).toBe(search);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(live(api).selectedClipIds).toEqual(['s1']);
      expect(live(api).undoLabel).toBeNull();
    });

    it('self-check: a clip drag started while the search is focused moves the clip with one entry', async () => {
      const { api, view } = await mountFaderWorkspace();
      const parts = editParts(view);
      const search = typeInSearch(parts, 'ab');
      const oneSecondPx = live(api).pxPerSecond;
      fireEvent.pointerDown(parts.clipHeader('s1'), {
        ...press,
        pointerId: 83,
        clientX: 10,
        clientY: 5,
      });
      expect(document.activeElement).not.toBe(search);
      fireEvent.pointerMove(parts.clipRoot('s1'), {
        pointerId: 83,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      fireEvent.pointerUp(parts.clipRoot('s1'), {
        pointerId: 83,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
        ['s1', 'sfx', 5, 2],
      ]);
      expect(parts.search().value).toBe('ab');
      expect(undoChainLabels(api)).toHaveLength(1);
    });

    it('self-check: Clip Gain typed "3" → a drag of the same SFX clip keeps the committed gain and adds its own entry', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view } = workspace;
      const parts = editParts(view);
      typeClipGain(workspace, parts, '3');
      const oneSecondPx = live(api).pxPerSecond;
      fireEvent.pointerDown(parts.clipHeader('s1'), {
        ...press,
        pointerId: 84,
        clientX: 10,
        clientY: 5,
      });
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      fireEvent.pointerMove(parts.clipRoot('s1'), {
        pointerId: 84,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      fireEvent.pointerUp(parts.clipRoot('s1'), {
        pointerId: 84,
        clientX: 10 + oneSecondPx,
        clientY: 5,
      });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(clipTable(live(api).arrangement)).toEqual([
        ['v1', 'video', 0, 4],
        ['m1', 'music', 7, 12],
        ['s1', 'sfx', 5, 2],
      ]);
      expect(sfxGainDb(api)).toBe(3);
      const labels = undoChainLabels(api);
      expect(labels).toHaveLength(2);
      expect(labels[1]).toBe(CLIP_GAIN_LABEL);
    });
  });

  describe('a range pointerdown first releases a focused text field (C-R34-01; D-29z)', () => {
    const CLIP_GAIN_LABEL = 'Clip Gain';
    const VIDEO_VOLUME_SELECTOR = '[data-track-id="video"] input[type="range"]';

    type RangeWorkspace = Awaited<ReturnType<typeof mountFaderWorkspace>>;

    function inputByTestId(workspace: RangeWorkspace, testId: string): HTMLInputElement {
      const field = workspace.view.getByTestId(testId);
      if (!(field instanceof HTMLInputElement)) {
        throw new Error(`${testId} is not an input`);
      }
      return field;
    }

    function videoVolume(workspace: RangeWorkspace): HTMLInputElement {
      const input = workspace.view.container.querySelector(VIDEO_VOLUME_SELECTOR);
      if (!(input instanceof HTMLInputElement)) {
        throw new Error('video Volume missing');
      }
      return input;
    }

    function libraryCount(workspace: RangeWorkspace): number {
      return workspace.view.container.querySelectorAll(
        '[data-testid="arrangement-library-option-title"]',
      ).length;
    }

    function typeGain(workspace: RangeWorkspace, text: string): HTMLInputElement {
      workspace.selectSfxClip();
      const field = inputByTestId(workspace, 'arrangement-detail-clip-gain-input');
      expect(field.disabled).toBe(false);
      expect(field.value).toBe('0.0');
      field.focus();
      fireEvent.change(field, { target: { value: text } });
      expect(document.activeElement).toBe(field);
      expect(live(workspace.api).undoLabel).toBeNull();
      return field;
    }

    function gainOfSfx(api: FaderApiRef): number | undefined {
      return live(api).arrangement.clips.find((clip) => clip.id === 's1')?.gainDb;
    }

    function expectCommittedAtPress(api: FaderApiRef, field: HTMLInputElement) {
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      expect(gainOfSfx(api)).toBe(3);
      expect(document.activeElement).not.toBe(field);
      expect(live(api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    }

    it('Clip Gain typed "3" → music Volume pointerdown commits Clip Gain first; the Volume drag adds its own entry; two Undos restore Volume, then the gain', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '3');
      fireEvent.pointerDown(controls.musicVolume(), { ...press, pointerId: 91 });
      expectCommittedAtPress(api, field);
      expect(live(api).isPointerGestureActive()).toBe(true);
      fireEvent.change(controls.musicVolume(), { target: { value: '-10.5' } });
      fireEvent.pointerUp(controls.musicVolume(), { pointerId: 91 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(trackVolumeFromDb(-10.5));
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
      expect(gainOfSfx(api)).toBe(3);
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => live(api).undo());
      expect(gainOfSfx(api)).toBeUndefined();
      expect(live(api).undoLabel).toBeNull();
    });

    it('Clip Gain typed "3" → music Pan pointerdown commits Clip Gain first; the Pan entry follows', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '3');
      fireEvent.pointerDown(controls.pan(), { ...press, pointerId: 92 });
      expectCommittedAtPress(api, field);
      fireEvent.change(controls.pan(), { target: { value: '-10' } });
      fireEvent.pointerUp(controls.pan(), { pointerId: 92 });
      expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(-0.2);
      expect(undoChainLabels(api)).toEqual([PAN_LABEL, CLIP_GAIN_LABEL]);
      expect(gainOfSfx(api)).toBeUndefined();
    });

    it('Clip Gain typed "3" → Master Volume pointerdown (outside the scroller) commits Clip Gain first; the Master entry follows', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '3');
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 93 });
      expectCommittedAtPress(api, field);
      fireEvent.change(controls.master(), { target: { value: '-6' } });
      fireEvent.pointerUp(controls.master(), { pointerId: 93 });
      expect(live(api).arrangement.master.gainDb).toBe(-6);
      expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL, CLIP_GAIN_LABEL]);
      expect(gainOfSfx(api)).toBeUndefined();
    });

    it('Clip Gain typed "3" → video Volume pointerdown commits Clip Gain first; the Volume entry follows', async () => {
      const workspace = await mountFaderWorkspace();
      const { api } = workspace;
      const field = typeGain(workspace, '3');
      const volume = videoVolume(workspace);
      fireEvent.pointerDown(volume, { ...press, pointerId: 94 });
      expectCommittedAtPress(api, field);
      fireEvent.change(videoVolume(workspace), { target: { value: '-6' } });
      fireEvent.pointerUp(videoVolume(workspace), { pointerId: 94 });
      expect(trackOf(live(api).arrangement, 'video').volume).toBe(trackVolumeFromDb(-6));
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, CLIP_GAIN_LABEL]);
      expect(gainOfSfx(api)).toBeUndefined();
    });

    it('regression: Clip Gain typed "3" → Zoom pointerdown commits one Clip Gain entry; Zoom writes no entry', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '3');
      fireEvent.pointerDown(controls.zoom(), { ...press, pointerId: 95 });
      expectCommittedAtPress(api, field);
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireEvent.pointerUp(controls.zoom(), { pointerId: 95 });
      expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    });

    it('Clip Gain with its unchanged text → music Volume pointerdown releases the field and writes no Clip Gain entry', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '0.0');
      fireEvent.pointerDown(controls.musicVolume(), { ...press, pointerId: 96 });
      expect(document.activeElement).not.toBe(field);
      expect(live(api).undoLabel).toBeNull();
      fireEvent.change(controls.musicVolume(), { target: { value: '-10.5' } });
      fireEvent.pointerUp(controls.musicVolume(), { pointerId: 96 });
      expect(gainOfSfx(api)).toBeUndefined();
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    });

    it('Clip Gain emptied → Master pointerdown gives exactly the status and history of a plain blur of the same text', async () => {
      const control = await mountFaderWorkspace();
      const controlField = typeGain(control, '');
      fireEvent.blur(controlField);
      const blurStatus = live(control.api).status;
      expect(blurStatus).toBe('Clip Gain: enter a number in dB (−60…+24).');
      const blurLabel = live(control.api).undoLabel;
      expect(blurLabel).toBeNull();
      control.view.unmount();

      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const field = typeGain(workspace, '');
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 97 });
      expect(document.activeElement).not.toBe(field);
      expect(live(api).status).toBe(blurStatus);
      expect(live(api).undoLabel).toBe(blurLabel);
      fireEvent.pointerUp(controls.master(), { pointerId: 97 });
      expect(gainOfSfx(api)).toBeUndefined();
      expect(live(api).undoLabel).toBeNull();
    });

    it('detail start typed without Enter → Master pointerdown releases the field, writes no entry from it and applies no range', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      workspace.selectSfxClip();
      const rangeBefore = live(api).range;
      const start = inputByTestId(workspace, 'arrangement-detail-start');
      expect(start.disabled).toBe(false);
      start.focus();
      fireEvent.change(start, { target: { value: '4.5' } });
      expect(document.activeElement).toBe(start);
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 98 });
      expect(document.activeElement).not.toBe(start);
      expect(live(api).undoLabel).toBeNull();
      expect(live(api).range).toEqual(rangeBefore);
      expect(start.value).toBe('4.5');
      fireEvent.pointerUp(controls.master(), { pointerId: 98 });
      expect(live(api).undoLabel).toBeNull();
      expect(live(api).range).toEqual(rangeBefore);
      expect(start.value).toBe('4.5');
    });

    it('search typed "ab" → Master pointerdown releases the search; its text and filter are unchanged', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, controls } = workspace;
      const unfiltered = libraryCount(workspace);
      const search = inputByTestId(workspace, 'arrangement-library-search');
      search.focus();
      fireEvent.change(search, { target: { value: 'ab' } });
      const filtered = libraryCount(workspace);
      expect(filtered).toBeLessThan(unfiltered);
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 99 });
      expect(document.activeElement).not.toBe(search);
      expect(inputByTestId(workspace, 'arrangement-library-search').value).toBe('ab');
      expect(libraryCount(workspace)).toBe(filtered);
      fireEvent.pointerUp(controls.master(), { pointerId: 99 });
      expect(live(api).undoLabel).toBeNull();
    });

    it('must-not: during a detail-separator gesture a Master pointerdown of a second pointer keeps the Clip Gain focus and writes no entry', async () => {
      const workspace = await mountFaderWorkspace();
      const { api, view, controls } = workspace;
      const field = typeGain(workspace, '3');
      const separator = view.getByTestId('arrangement-detail-separator');
      fireEvent.pointerDown(separator, { ...press, pointerId: 41, clientY: 400 });
      expect(live(api).isPointerGestureActive()).toBe(true);
      expect(document.activeElement).toBe(field);
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 42 });
      expect(document.activeElement).toBe(field);
      expect(live(api).undoLabel).toBeNull();
      expect(gainOfSfx(api)).toBeUndefined();
      windowPointer('pointerup', 41);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(document.activeElement).toBe(field);
      expect(field.value).toBe('3');
      fireEvent.blur(field);
      expect(gainOfSfx(api)).toBe(3);
      expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    });

    it('decision 4: search focused → library item pointerdown (outside the scroller, not a range) keeps the search focus', async () => {
      const workspace = await mountFaderWorkspace();
      const search = inputByTestId(workspace, 'arrangement-library-search');
      search.focus();
      const title = workspace.view.container.querySelector(
        '[data-testid="arrangement-library-option-title"]',
      );
      const option = title?.closest('[role="option"]');
      if (!(option instanceof HTMLElement)) {
        throw new Error('library option missing');
      }
      fireEvent.pointerDown(option, { ...press, pointerId: 100 });
      expect(document.activeElement).toBe(search);
      fireEvent.pointerUp(option, { pointerId: 100 });
      expect(document.activeElement).toBe(search);
    });

    it('a focused music Volume: a Master press moves the focus to Master and leaves the music Volume value unchanged (D-29z3)', async () => {
      const { api, controls } = await mountFaderWorkspace();
      const volume = controls.musicVolume();
      volume.focus();
      fireEvent.pointerDown(controls.master(), { ...press, pointerId: 101 });
      expect(document.activeElement).toBe(controls.master());
      fireEvent.pointerUp(controls.master(), { pointerId: 101 });
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    });

    describe('C-R36-01: a blur during another pointer gesture keeps the typed Clip Gain text (D-29z2)', () => {
      const INVALID_STATUS = 'Clip Gain: enter a number in dB (−60…+24).';

      function startSeparatorGesture(workspace: RangeWorkspace) {
        const separator = workspace.view.getByTestId('arrangement-detail-separator');
        fireEvent.pointerDown(separator, { ...press, pointerId: 41, clientY: 400 });
        expect(live(workspace.api).isPointerGestureActive()).toBe(true);
      }

      function releaseSeparatorGesture(api: FaderApiRef) {
        windowPointer('pointerup', 41);
        expect(live(api).isPointerGestureActive()).toBe(false);
      }

      it('"3" typed → blur during the gesture keeps "3" with the blocked status and no entry; Enter after release commits +3.0 dB once', async () => {
        const workspace = await mountFaderWorkspace();
        const { api } = workspace;
        const field = typeGain(workspace, '3');
        startSeparatorGesture(workspace);
        act(() => {
          field.blur();
        });
        expect(document.activeElement).not.toBe(field);
        expect(field.value).toBe('3');
        expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
        expect(gainOfSfx(api)).toBeUndefined();
        expect(live(api).undoLabel).toBeNull();
        releaseSeparatorGesture(api);
        expect(field.value).toBe('3');
        expect(live(api).undoLabel).toBeNull();
        field.focus();
        expect(document.activeElement).toBe(field);
        fireEvent.keyDown(field, { key: 'Enter' });
        expect(gainOfSfx(api)).toBe(3);
        expect(live(api).status).toBe('Clip Gain: Hit — +3.0 dB.');
        expect(field.value).toBe('3.0');
        expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
      });

      it('"3" typed → a second-pointer Master press and the native blur keep "3" and leave Master unchanged; the blur after release commits once', async () => {
        const workspace = await mountFaderWorkspace();
        const { api, controls } = workspace;
        const field = typeGain(workspace, '3');
        const masterBefore = live(api).arrangement.master.gainDb;
        startSeparatorGesture(workspace);
        fireEvent.pointerDown(controls.master(), { ...press, pointerId: 42 });
        expect(document.activeElement).toBe(field);
        act(() => {
          field.blur();
        });
        expect(document.activeElement).not.toBe(field);
        expect(field.value).toBe('3');
        expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
        expect(live(api).arrangement.master.gainDb).toBe(masterBefore);
        expect(live(api).undoLabel).toBeNull();
        fireEvent.pointerUp(controls.master(), { pointerId: 42 });
        releaseSeparatorGesture(api);
        expect(field.value).toBe('3');
        expect(live(api).arrangement.master.gainDb).toBe(masterBefore);
        field.focus();
        expect(document.activeElement).toBe(field);
        fireEvent.blur(field);
        expect(gainOfSfx(api)).toBe(3);
        expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
      });

      it('emptied text → blur during the gesture keeps "" with the blocked status; Enter after release gives the invalid status and resets', async () => {
        const workspace = await mountFaderWorkspace();
        const { api } = workspace;
        const field = typeGain(workspace, '');
        startSeparatorGesture(workspace);
        fireEvent.blur(field);
        expect(field.value).toBe('');
        expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
        expect(live(api).undoLabel).toBeNull();
        releaseSeparatorGesture(api);
        field.focus();
        fireEvent.keyDown(field, { key: 'Enter' });
        expect(live(api).status).toBe(INVALID_STATUS);
        expect(field.value).toBe('0.0');
        expect(gainOfSfx(api)).toBeUndefined();
        expect(live(api).undoLabel).toBeNull();
      });

      it('must-not: Enter during the gesture still shows the blocked status, resets the text and writes no entry', async () => {
        const workspace = await mountFaderWorkspace();
        const { api } = workspace;
        const field = typeGain(workspace, '3');
        startSeparatorGesture(workspace);
        fireEvent.keyDown(field, { key: 'Enter' });
        expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
        expect(field.value).toBe('0.0');
        expect(gainOfSfx(api)).toBeUndefined();
        expect(live(api).undoLabel).toBeNull();
        releaseSeparatorGesture(api);
      });

      it('must-not (limitation): the text kept by the blur is discarded by a selection change with no entry', async () => {
        const workspace = await mountFaderWorkspace();
        const { api } = workspace;
        const field = typeGain(workspace, '3');
        startSeparatorGesture(workspace);
        fireEvent.blur(field);
        releaseSeparatorGesture(api);
        expect(field.value).toBe('3');
        expect(live(api).undoLabel).toBeNull();
        act(() => live(api).selectClip('m1'));
        act(() => live(api).selectClip('s1'));
        expect(inputByTestId(workspace, 'arrangement-detail-clip-gain-input').value).toBe('0.0');
        expect(gainOfSfx(api)).toBeUndefined();
        expect(live(api).undoLabel).toBeNull();
      });
    });
  });
});
