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
import { createArrangement, TRACK_PAN_STEPS, trackPanValue } from '../model';
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
const CLIP_GAIN_LABEL = 'Clip Gain';
const PRESS_POINTER_ID = 41;

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.outputs = [];
  }
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

const focusOrderCollection: WorkspaceCollection = {
  id: 'fader',
  label: 'fader',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function focusOrderArrangement(): Arrangement {
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

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

interface FocusOrderApiRef {
  current: ArrangementContextValue | null;
}

function FocusOrderProbe({ api }: { api: FocusOrderApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FocusOrderApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(api: FocusOrderApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

interface StoredMix {
  musicVolume: number;
  sfxVolume: number;
  masterGainDb: number;
  musicPan: number;
  sfxClipGainDb: number | undefined;
}

function storedMix(api: FocusOrderApiRef): StoredMix {
  const arrangement = live(api).arrangement;
  return {
    musicVolume: trackOf(arrangement, 'music').volume,
    sfxVolume: trackOf(arrangement, 'sfx').volume,
    masterGainDb: arrangement.master.gainDb,
    musicPan: trackPanValue(trackOf(arrangement, 'music')),
    sfxClipGainDb: arrangement.clips.find((clip) => clip.id === 's1')?.gainDb,
  };
}

async function mountFocusOrderWorkspace() {
  const api: FocusOrderApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={focusOrderCollection}
      initialArrangement={focusOrderArrangement()}
    >
      <StudioWorkspace />
      <FocusOrderProbe api={api} />
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
  };
  const clipGainField = () => {
    const field = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(field instanceof HTMLInputElement)) {
      throw new Error('Clip Gain input missing');
    }
    return field;
  };
  const initialMix = storedMix(api);
  return { api, controls, clipGainField, initialMix };
}

const press = { button: 0, buttons: 1, pointerId: PRESS_POINTER_ID };

function releasePress(control: HTMLInputElement) {
  fireEvent.pointerUp(control, { pointerId: PRESS_POINTER_ID });
  act(() => {
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: PRESS_POINTER_ID }));
  });
}

describe('fader press contract pins: green with focus() before or after beginGesture, so they do not detect the order (A-R38-TEST-ORDER; D-29z, D-29z3)', () => {
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

  it('S1 must-not: Clip Gain "3" typed on SFX → music Volume press commits Clip Gain once before the gesture; focus on the Volume; no blocked status', async () => {
    const { api, controls, clipGainField, initialMix } = await mountFocusOrderWorkspace();
    act(() => live(api).selectClip('s1'));
    const field = clipGainField();
    field.focus();
    fireEvent.change(field, { target: { value: '3' } });
    expect(live(api).undoLabel).toBeNull();
    const volume = controls.musicVolume();
    fireEvent.pointerDown(volume, press);
    expect(document.activeElement).toBe(volume);
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    expect(live(api).status).toBe('Clip Gain: Hit — +3.0 dB.');
    expect(field.value).toBe('3.0');
    expect(storedMix(api)).toEqual({ ...initialMix, sfxClipGainDb: 3 });
    releasePress(volume);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(document.activeElement).toBe(volume);
    expect(live(api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(storedMix(api)).toEqual(initialMix);
  });

  it('S2 must-not: a pending music Volume key preview → SFX Volume press writes exactly one Volume entry; focus on the SFX Volume', async () => {
    const { api, controls, initialMix } = await mountFocusOrderWorkspace();
    const music = controls.musicVolume();
    music.focus();
    fireEvent.keyDown(music, { key: 'ArrowLeft' });
    fireEvent.change(music, { target: { value: '-4.5' } });
    expect(live(api).undoLabel).toBeNull();
    const statusBefore = live(api).status;
    const sfx = controls.sfxVolume();
    fireEvent.pointerDown(sfx, press);
    expect(document.activeElement).toBe(sfx);
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(live(api).undoLabel).toBe(VOLUME_LABEL);
    expect(storedMix(api)).toEqual({ ...initialMix, musicVolume: trackVolumeFromDb(-4.5) });
    releasePress(sfx);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(document.activeElement).toBe(sfx);
    expect(live(api).status).toBe(statusBefore);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    expect(storedMix(api)).toEqual(initialMix);
  });

  it('S3 must-not: a pending Master key preview → music Volume press writes exactly one Master Volume entry; focus on the music Volume', async () => {
    const { api, controls, initialMix } = await mountFocusOrderWorkspace();
    const master = controls.master();
    master.focus();
    fireEvent.keyDown(master, { key: 'ArrowLeft' });
    fireEvent.change(master, { target: { value: '-0.5' } });
    expect(live(api).undoLabel).toBeNull();
    const statusBefore = live(api).status;
    const volume = controls.musicVolume();
    fireEvent.pointerDown(volume, press);
    expect(document.activeElement).toBe(volume);
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(live(api).undoLabel).toBe(MASTER_VOLUME_LABEL);
    expect(storedMix(api)).toEqual({ ...initialMix, masterGainDb: -0.5 });
    releasePress(volume);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(document.activeElement).toBe(volume);
    expect(live(api).status).toBe(statusBefore);
    expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL]);
    expect(storedMix(api)).toEqual(initialMix);
  });

  it('S4 must-not: music Pan focused after a key step → music Volume press adds no entry to the Pan step; focus on the Volume', async () => {
    const { api, controls, initialMix } = await mountFocusOrderWorkspace();
    const pan = controls.pan();
    pan.focus();
    fireEvent.keyDown(pan, { key: 'ArrowRight' });
    fireEvent.change(pan, { target: { value: '1' } });
    expect(live(api).undoLabel).toBe(PAN_LABEL);
    const statusBefore = live(api).status;
    const volume = controls.musicVolume();
    fireEvent.pointerDown(volume, press);
    expect(document.activeElement).toBe(volume);
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(live(api).undoLabel).toBe(PAN_LABEL);
    expect(storedMix(api)).toEqual({ ...initialMix, musicPan: 1 / TRACK_PAN_STEPS });
    releasePress(volume);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(document.activeElement).toBe(volume);
    expect(live(api).status).toBe(statusBefore);
    expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
    expect(storedMix(api)).toEqual(initialMix);
  });

  it('S5 must-not: a pending music Volume key preview → Master press writes exactly one Volume entry; focus on Master', async () => {
    const { api, controls, initialMix } = await mountFocusOrderWorkspace();
    const music = controls.musicVolume();
    music.focus();
    fireEvent.keyDown(music, { key: 'ArrowLeft' });
    fireEvent.change(music, { target: { value: '-4.5' } });
    expect(live(api).undoLabel).toBeNull();
    const statusBefore = live(api).status;
    const master = controls.master();
    fireEvent.pointerDown(master, press);
    expect(document.activeElement).toBe(master);
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(live(api).undoLabel).toBe(VOLUME_LABEL);
    expect(storedMix(api)).toEqual({ ...initialMix, musicVolume: trackVolumeFromDb(-4.5) });
    releasePress(master);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(document.activeElement).toBe(master);
    expect(live(api).status).toBe(statusBefore);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    expect(storedMix(api)).toEqual(initialMix);
  });
});
