import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { arrangementGroups } from '../groups';
import { createArrangement, trackPanValue } from '../model';
import { trackVolumeFromDb } from '../track-volume-db';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const GROUP_NAME = 'ჯგუფი 1';

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

const touchCollection: WorkspaceCollection = {
  id: 'fader-touch',
  label: 'fader-touch',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader-touch', kind: 'music', origin: 'demo' },
    { id: 'stem', title: 'Stem', collectionLabel: 'fader-touch', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader-touch', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function touchArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => (track.id === 'music' ? { ...track, volume: 0.6 } : track)),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 'st1', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
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

interface TouchApiRef {
  current: ArrangementContextValue | null;
}

function TouchProbe({ api }: { api: TouchApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: TouchApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type FaderName = 'musicVolume' | 'pan' | 'master' | 'groupVolume';

const FADER_NAMES: FaderName[] = ['musicVolume', 'pan', 'master', 'groupVolume'];

const RELATIVE_FADER_NAMES: Array<FaderName | 'videoVolume'> = [...FADER_NAMES, 'videoVolume'];

async function mountTouchWorkspace() {
  const api: TouchApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={touchCollection} initialArrangement={touchArrangement()}>
      <StudioWorkspace />
      <TouchProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const laneName = (name: string) =>
    view.getByRole('button', {
      name: new RegExp(`^${escapeRegExp(name)} — set as the active track`),
    });
  fireEvent.click(laneName('სტემები'));
  fireEvent.click(laneName('SFX'), { shiftKey: true });
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG', ctrlKey: true });
  const range = (selector: string) => {
    const input = view.container.querySelector(selector);
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
      throw new Error(`range ${selector} missing`);
    }
    return input;
  };
  const controls: Record<FaderName | 'zoom' | 'videoVolume', () => HTMLInputElement> = {
    musicVolume: () => range('[data-track-id="music"] input[aria-label="Volume — მუსიკა"]'),
    pan: () => range('[data-track-id="music"] [data-testid="arrangement-track-pan"]'),
    master: () => range('input[aria-label="Master Volume"]'),
    groupVolume: () => range('[data-testid="arrangement-group-volume"]'),
    videoVolume: () =>
      range('[data-track-id="video"] input[aria-label="Volume — Original video sound"]'),
    zoom: () => range('[data-testid="arrangement-zoom"]'),
  };
  return { api, view, controls };
}

function faderValue(api: TouchApiRef, name: FaderName): number | undefined {
  const arrangement = live(api).getArrangement();
  if (name === 'musicVolume') {
    return trackOf(arrangement, 'music').volume;
  }
  if (name === 'pan') {
    return trackPanValue(trackOf(arrangement, 'music'));
  }
  if (name === 'master') {
    return arrangement.master.gainDb;
  }
  return arrangementGroups(arrangement).find((group) => group.name === GROUP_NAME)?.volume;
}

function touchStart(input: HTMLInputElement): TouchEvent {
  const event = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
  act(() => {
    input.dispatchEvent(event);
  });
  return event;
}

function stubFaderWidth(input: HTMLInputElement, width: number) {
  const rect: DOMRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width,
    height: 4,
    right: width,
    bottom: 4,
    toJSON: () => ({}),
  };
  Object.defineProperty(input, 'getBoundingClientRect', { configurable: true, value: () => rect });
}

function windowPointer(type: 'pointermove' | 'pointerup', pointerId: number, clientX = 0) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX, pointerType: 'touch' }));
  });
}

function touchPress(input: HTMLInputElement, pointerId: number, clientX: number) {
  return fireEvent.pointerDown(input, {
    button: 0,
    buttons: 1,
    pointerId,
    pointerType: 'touch',
    clientX,
  });
}

function touchStartRegistrations(
  spy: MockInstance<EventTarget['addEventListener']>,
  input: Element,
) {
  return spy.mock.calls.flatMap(([type, , options], index) =>
    spy.mock.contexts[index] === input && type === 'touchstart' ? [options] : [],
  );
}

describe('fader touch press does not jump (A-R38-REVIEW-TOUCH, D-29z78)', () => {
  let addListenerSpy: MockInstance<EventTarget['addEventListener']>;

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
    addListenerSpy = vi.spyOn(EventTarget.prototype, 'addEventListener');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('FT1: a cancelable touchstart is default-prevented on music Volume, Pan, Master, group Volume and video Volume', async () => {
    const { controls } = await mountTouchWorkspace();
    for (const name of RELATIVE_FADER_NAMES) {
      expect(touchStart(controls[name]()).defaultPrevented, name).toBe(true);
    }
  });

  it('FT2 must-not: a touchstart on the Zoom slider is not default-prevented', async () => {
    const { controls } = await mountTouchWorkspace();
    expect(touchStart(controls.zoom()).defaultPrevented).toBe(false);
    expect(touchStartRegistrations(addListenerSpy, controls.zoom())).toEqual([]);
  });

  it('FT3: each fader registers exactly one non-passive native touchstart listener', async () => {
    const { controls } = await mountTouchWorkspace();
    for (const name of RELATIVE_FADER_NAMES) {
      expect(touchStartRegistrations(addListenerSpy, controls[name]()), name).toEqual([
        { passive: false },
      ]);
    }
  });

  it('FT4: re-renders do not re-register; after unmount the same input is no longer prevented and a remount registers once', async () => {
    const first = await mountTouchWorkspace();
    const faders = FADER_NAMES.map((name) => first.controls[name]());
    act(() => live(first.api).setPxPerSecond(60));
    act(() => live(first.api).setStatus('re-render'));
    act(() => live(first.api).setPxPerSecond(80));
    for (const [index, fader] of faders.entries()) {
      expect(fader.isConnected, FADER_NAMES[index]).toBe(true);
      expect(touchStartRegistrations(addListenerSpy, fader), FADER_NAMES[index]).toHaveLength(1);
    }
    first.view.unmount();
    for (const [index, fader] of faders.entries()) {
      expect(touchStart(fader).defaultPrevented, FADER_NAMES[index]).toBe(false);
    }
    const second = await mountTouchWorkspace();
    for (const name of FADER_NAMES) {
      const fader = second.controls[name]();
      expect(touchStartRegistrations(addListenerSpy, fader), name).toHaveLength(1);
      expect(touchStart(fader).defaultPrevented, name).toBe(true);
    }
  });

  it('FT7: folding the music lane detaches the old Volume and Pan inputs; unfolding attaches the new ones once', async () => {
    const { view, controls } = await mountTouchWorkspace();
    const foldButton = () => {
      const fold = view.container.querySelector(
        '[data-track-id="music"] [data-testid="arrangement-track-fold"]',
      );
      if (!(fold instanceof HTMLElement)) {
        throw new Error('music fold button missing');
      }
      return fold;
    };
    const oldFaders = [controls.musicVolume(), controls.pan()];
    fireEvent.click(foldButton());
    for (const fader of oldFaders) {
      expect(fader.isConnected).toBe(false);
      expect(touchStart(fader).defaultPrevented).toBe(false);
    }
    fireEvent.click(foldButton());
    for (const fader of [controls.musicVolume(), controls.pan()]) {
      expect(oldFaders).not.toContain(fader);
      expect(touchStartRegistrations(addListenerSpy, fader)).toEqual([{ passive: false }]);
      expect(touchStart(fader).defaultPrevented).toBe(true);
    }
  });

  it('FT5: a touch press with no move keeps every fader value and writes no history entry', async () => {
    const { api, controls } = await mountTouchWorkspace();
    const undoBefore = live(api).undoLabel;
    for (const [index, name] of FADER_NAMES.entries()) {
      const fader = controls[name]();
      stubFaderWidth(fader, 100);
      const valueBefore = faderValue(api, name);
      const pointerId = 70 + index;
      expect(touchPress(fader, pointerId, 15), name).toBe(false);
      expect(touchStart(fader).defaultPrevented, name).toBe(true);
      windowPointer('pointerup', pointerId, 15);
      expect(live(api).isPointerGestureActive(), name).toBe(false);
      expect(faderValue(api, name), name).toBe(valueBefore);
      expect(live(api).undoLabel, name).toBe(undoBefore);
    }
  });

  it('FT6: a touch relative drag of −25 px over 100 px moves the music Volume −4.4 dB → −19.4 dB with one Volume entry', async () => {
    const { api, controls } = await mountTouchWorkspace();
    const undoBefore = live(api).undoLabel;
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    expect(touchPress(volume, 81, 50)).toBe(false);
    expect(touchStart(volume).defaultPrevented).toBe(true);
    windowPointer('pointermove', 81, 25);
    windowPointer('pointerup', 81, 25);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(trackVolumeFromDb(-19.4));
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBe(undoBefore);
  });
});
