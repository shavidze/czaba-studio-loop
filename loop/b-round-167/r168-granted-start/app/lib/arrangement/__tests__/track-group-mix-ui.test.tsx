import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import type {
  Arrangement,
  ArrangementClip,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { arrangementGroups } from '../groups';
import { createArrangement, toggleSolo } from '../model';
import { isTrackAudibleWithGroups, trackEffectiveGains } from '../schedule';
import { trackVolumeFromDb } from '../track-volume-db';

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
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
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

const createdGains: FakeGain[] = [];

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
    const gain = new FakeGain();
    createdGains.push(gain);
    return gain;
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

class ControlledResizeObserver {
  observe() {}
  disconnect() {}
}

const TRACK_IDS = ['video', 'music', 'stems', 'sfx'];
const SOURCE_LENGTHS: Record<string, number> = { song: 4000, stem: 1000, hit: 200 };

const mixCollection: WorkspaceCollection = {
  id: 'track-group-mix',
  label: 'track-group-mix',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'track-group-mix',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'stem', title: 'Stem', collectionLabel: 'track-group-mix', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'track-group-mix', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: SOURCE_LENGTHS[source.id] ?? 100,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const LAB_CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function labArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: LAB_CLIPS,
  };
}

interface MixApiRef {
  current: ArrangementContextValue | null;
}

function MixProbe({ api }: { api: MixApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MixApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountMixWorkspace() {
  const api: MixApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={mixCollection} initialArrangement={labArrangement()}>
      <StudioWorkspace />
      <MixProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 && ['song', 'stem', 'hit'].some((id) => !live(api).sourceDurations.has(id));
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(40));
  return { api, view };
}

type MixView = ReturnType<typeof render>;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function laneName(view: MixView, name: string): HTMLElement {
  return view.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(name)} — set as the active track`),
  });
}

function groupName(view: MixView, name: string): HTMLElement {
  return view.getByRole('button', { name: new RegExp(`^${escapeRegExp(name)} — group`) });
}

function groupRow(view: MixView, name: string): HTMLElement {
  const row = groupName(view, name).closest<HTMLElement>('[data-group-id]');
  if (!row) {
    throw new Error(`group row ${name} missing`);
  }
  return row;
}

function groupControl(
  view: MixView,
  name: string,
  testId: 'arrangement-group-mute' | 'arrangement-group-solo' | 'arrangement-group-volume',
): HTMLElement {
  const control = groupRow(view, name).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!control) {
    throw new Error(`${testId} missing on ${name}`);
  }
  return control;
}

function groupFader(view: MixView, name: string): HTMLInputElement {
  const fader = groupControl(view, name, 'arrangement-group-volume');
  if (!(fader instanceof HTMLInputElement)) {
    throw new Error('group fader is not an input');
  }
  return fader;
}

function laneFader(view: MixView, name: string): HTMLInputElement {
  const fader = view.getByRole('slider', { name: new RegExp(`^Volume — ${escapeRegExp(name)}`) });
  if (!(fader instanceof HTMLInputElement)) {
    throw new Error('lane fader is not an input');
  }
  return fader;
}

function rowOrder(view: MixView): string[] {
  const container =
    view.container.querySelector<HTMLElement>('[data-track-id="video"]')?.parentElement;
  if (!container) {
    throw new Error('lanes container missing');
  }
  return Array.from(container.children).flatMap((child) => {
    if (!(child instanceof HTMLElement)) {
      return [];
    }
    if (child.dataset.groupId !== undefined) {
      return [`group:${child.textContent?.replace('▣', '').trim()}:${child.dataset.groupDepth}`];
    }
    return child.dataset.trackId !== undefined ? [child.dataset.trackId] : [];
  });
}

function status(view: MixView): string {
  return view.getByTestId('arrangement-status').textContent ?? '';
}

function pressGroupKey(shift = false) {
  fireEvent.keyDown(document.body, {
    key: shift ? 'G' : 'g',
    code: 'KeyG',
    ctrlKey: true,
    shiftKey: shift,
  });
}

function groupRows(view: MixView, first: string, last: string) {
  fireEvent.click(laneName(view, first));
  fireEvent.click(laneName(view, last), { shiftKey: true });
  pressGroupKey();
}

function nestMusicAndG1(view: MixView) {
  fireEvent.click(laneName(view, 'მუსიკა'));
  fireEvent.click(groupName(view, 'Group 1'), { shiftKey: true });
  pressGroupKey();
}

function pressKey(target: Element, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function pressU(target: Element = document.body): KeyboardEvent {
  return pressKey(target, { key: 'u', code: 'KeyU' });
}

function renderedLaneIds(view: MixView): string[] {
  return Array.from(view.container.querySelectorAll<HTMLElement>('[data-track-id]')).map(
    (lane) => lane.dataset.trackId ?? '',
  );
}

function liveTrackGains(): Record<string, number> {
  const trackGains = createdGains.filter((gain) =>
    gain.outputs.some((output) => output instanceof FakePanner),
  );
  const latest = trackGains.slice(-TRACK_IDS.length);
  return Object.fromEntries(TRACK_IDS.map((id, index) => [id, latest[index]?.gain.value ?? -1]));
}

function storedGains(api: MixApiRef): Record<string, number> {
  return Object.fromEntries(trackEffectiveGains(live(api).getArrangement()));
}

function groupMix(api: MixApiRef, name: string) {
  return arrangementGroups(live(api).getArrangement()).find((group) => group.name === name);
}

function trackVolume(api: MixApiRef, trackId: string): number | undefined {
  return live(api)
    .getArrangement()
    .tracks.find((track) => track.id === trackId)?.volume;
}

function stubFaderWidth(input: HTMLInputElement, width: number) {
  Object.defineProperty(input, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(0, 0, width, 4),
  });
}

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  x = 0,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX: x }));
  });
}

function dragFader(input: HTMLInputElement, pointerId: number, deltaPx: number, release = true) {
  stubFaderWidth(input, 100);
  fireEvent.pointerDown(input, { button: 0, buttons: 1, pointerId, clientX: 50 });
  windowPointer('pointermove', pointerId, 50 + deltaPx);
  if (release) {
    windowPointer('pointerup', pointerId, 50 + deltaPx);
  }
}

function keyboardFader(input: HTMLInputElement, value: string) {
  input.focus();
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.change(input, { target: { value } });
  fireEvent.keyUp(input, { key: 'ArrowDown', code: 'ArrowDown' });
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  createdGains.length = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

describe('SRW-17 stage 3 group Mute / Solo / Volume in the workspace', { timeout: 20_000 }, () => {
  it('UM1 controls render expanded and collapsed, add no text and keep the 28 px row', async () => {
    const { view } = await mountMixWorkspace();
    expect(view.queryAllByTestId('arrangement-group-mute')).toHaveLength(0);
    expect(view.queryAllByTestId('arrangement-group-solo')).toHaveLength(0);
    expect(view.queryAllByTestId('arrangement-group-volume')).toHaveLength(0);
    groupRows(view, 'სტემები', 'SFX');
    expect(rowOrder(view)).toEqual(['video', 'music', 'group:Group 1:0', 'stems', 'sfx']);
    for (const collapsed of [false, true]) {
      const mute = groupControl(view, 'Group 1', 'arrangement-group-mute');
      const solo = groupControl(view, 'Group 1', 'arrangement-group-solo');
      const fader = groupFader(view, 'Group 1');
      expect(mute.getAttribute('aria-label')).toBe('Mute — Group 1 (group)');
      expect(mute.getAttribute('aria-pressed')).toBe('false');
      expect(mute.getAttribute('title')).toBe('Mute');
      expect(mute.className).toContain('h-6 w-6');
      expect(mute.className).toContain("before:content-['M']");
      expect(solo.getAttribute('aria-label')).toBe(
        'Solo — Group 1 (group, Ctrl/Cmd+click = add to solo)',
      );
      expect(solo.getAttribute('title')).toBe('Solo (Ctrl/Cmd+click = add to solo)');
      expect(solo.getAttribute('aria-pressed')).toBe('false');
      expect(solo.dataset.solo).toBe('off');
      expect(solo.className).toContain("before:content-['S']");
      expect(fader.type).toBe('range');
      expect([fader.min, fader.max, fader.step]).toEqual(['-60', '0', '0.1']);
      expect(fader.getAttribute('aria-label')).toBe('Volume — Group 1 (group)');
      expect(fader.getAttribute('aria-valuetext')).toBe('+0.0 dB');
      expect(fader.getAttribute('title')).toBe('Volume +0.0 dB');
      expect(fader.className).toContain('min-w-12');
      expect(mute.textContent).toBe('');
      expect(solo.textContent).toBe('');
      expect(groupRow(view, 'Group 1').textContent?.replace('▣', '').trim()).toBe('Group 1');
      expect(groupRow(view, 'Group 1').getAttribute('style')).toContain('height: 28px');
      expect(view.queryAllByRole('button', { name: /Mute — (სტემები|SFX)/ })).not.toContain(mute);
      expect(view.getAllByRole('slider', { name: /^Volume — მუსიკა/ })).toHaveLength(1);
      expect(view.queryAllByRole('slider', { name: /^Volume — სტემები/ })).toHaveLength(
        collapsed ? 0 : 1,
      );
      if (!collapsed) {
        fireEvent.click(view.getByRole('button', { name: 'Fold or unfold group — Group 1' }));
        expect(renderedLaneIds(view)).toEqual(['video', 'music']);
      }
    }
    expect(rowOrder(view)).toEqual(['video', 'music', 'group:Group 1:0']);
  });

  it('UM2 group Mute silences the members live with one history entry and no restart', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    act(() => live(api).togglePlayback());
    const sources = vi.spyOn(FakeAudioContext.prototype, 'createBufferSource');
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    const mute = groupControl(view, 'Group 1', 'arrangement-group-mute');
    fireEvent.click(mute);
    expect(
      groupControl(view, 'Group 1', 'arrangement-group-mute').getAttribute('aria-pressed'),
    ).toBe('true');
    expect(live(api).undoLabel).toBe('Mute — Group 1');
    expect(groupMix(api, 'Group 1')?.mute).toBe(true);
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 0, sfx: 0 });
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-mute'));
    expect(groupMix(api, 'Group 1')?.mute).toBeUndefined();
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.mute).toBe(true);
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 0, sfx: 0 });
    act(() => live(api).redo());
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    expect(sources).toHaveBeenCalledTimes(0);
    act(() => live(api).togglePlayback());
  });

  it('UM3 group Volume: drag, keyboard, blur and double-click each write one entry; cancel reverts', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    const groupedLabel = live(api).undoLabel;
    dragFader(groupFader(view, 'Group 1'), 11, -25);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-15));
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBe(groupedLabel);
    expect(groupMix(api, 'Group 1')?.volume).toBeUndefined();
    act(() => live(api).redo());
    keyboardFader(groupFader(view, 'Group 1'), '-2.6');
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-2.6));
    expect(groupFader(view, 'Group 1').getAttribute('aria-valuetext')).toBe('−2.6 dB');
    expect(groupFader(view, 'Group 1').getAttribute('title')).toBe('Volume −2.6 dB');
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-15));
    act(() => live(api).redo());
    const fader = groupFader(view, 'Group 1');
    fader.focus();
    fireEvent.change(fader, { target: { value: '-4.4' } });
    expect(live(api).undoLabel).toBe('Volume');
    const stemsFader = laneFader(view, 'სტემები');
    dragFader(stemsFader, 12, -50);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-4.4));
    expect(trackVolume(api, 'stems')).toBe(trackVolumeFromDb(-30));
    act(() => live(api).undo());
    expect(trackVolume(api, 'stems')).toBe(1);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-4.4));
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-2.6));
    act(() => live(api).redo());
    act(() => live(api).redo());
    const blurFader = groupFader(view, 'Group 1');
    blurFader.focus();
    fireEvent.change(blurFader, { target: { value: '-8' } });
    act(() => blurFader.blur());
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-8));
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-4.4));
    act(() => live(api).redo());
    const cancelled = groupFader(view, 'Group 1');
    const labelBeforeCancel = live(api).undoLabel;
    dragFader(cancelled, 13, -20, false);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-20));
    windowPointer('pointercancel', 13);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-8));
    expect(live(api).undoLabel).toBe(labelBeforeCancel);
    fireEvent.doubleClick(groupFader(view, 'Group 1'));
    expect(groupMix(api, 'Group 1')?.volume).toBeUndefined();
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-8));
    const groupId = groupMix(api, 'Group 1')?.id ?? '';
    act(() => {
      live(api).previewTrackVolume('stems', 0.6);
      live(api).previewGroupVolume(groupId, 0.7);
      live(api).commitTrackVolume();
    });
    expect(trackVolume(api, 'stems')).toBe(0.6);
    expect(groupMix(api, 'Group 1')?.volume).toBe(0.7);
    act(() => live(api).undo());
    expect(trackVolume(api, 'stems')).toBe(0.6);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-8));
    act(() => live(api).undo());
    expect(trackVolume(api, 'stems')).toBe(trackVolumeFromDb(-30));
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-8));
  });

  it('UM4 group Solo: exclusive, cleared by a lane solo, Ctrl additive, half-solo on the parent', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    nestMusicAndG1(view);
    act(() => live(api).togglePlayback());
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-solo'));
    expect(live(api).undoLabel).toBe('Solo — Group 1');
    expect(
      groupControl(view, 'Group 1', 'arrangement-group-solo').getAttribute('aria-pressed'),
    ).toBe('true');
    const parentSolo = groupControl(view, 'Group 2', 'arrangement-group-solo');
    expect(parentSolo.getAttribute('aria-pressed')).toBe('mixed');
    expect(parentSolo.dataset.solo).toBe('mixed');
    expect(parentSolo.className).toContain('from-brand');
    expect(liveTrackGains()).toEqual({ video: 0, music: 0, stems: 1, sfx: 1 });
    fireEvent.click(view.getByRole('button', { name: /^Solo — მუსიკა/ }));
    expect(groupMix(api, 'Group 1')?.solo).toBeUndefined();
    expect(groupControl(view, 'Group 1', 'arrangement-group-solo').dataset.solo).toBe('off');
    expect(groupControl(view, 'Group 2', 'arrangement-group-solo').dataset.solo).toBe('mixed');
    expect(liveTrackGains()).toEqual({ video: 0, music: 1, stems: 0, sfx: 0 });
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-solo'), { ctrlKey: true });
    expect(groupMix(api, 'Group 1')?.solo).toBe(true);
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.solo,
    ).toBe(true);
    expect(liveTrackGains()).toEqual({ video: 0, music: 1, stems: 1, sfx: 1 });
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-solo'), { metaKey: true });
    expect(groupMix(api, 'Group 1')?.solo).toBeUndefined();
    fireEvent.click(view.getByRole('button', { name: /^Solo — მუსიკა/ }));
    expect(groupControl(view, 'Group 2', 'arrangement-group-solo').dataset.solo).toBe('off');
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    act(() => live(api).togglePlayback());
  });

  it('UM5 R17-G3: inner controls stay adjustable under a muted outer group', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    nestMusicAndG1(view);
    act(() => live(api).togglePlayback());
    fireEvent.click(groupControl(view, 'Group 2', 'arrangement-group-mute'));
    expect(liveTrackGains()).toEqual({ video: 1, music: 0, stems: 0, sfx: 0 });
    keyboardFader(laneFader(view, 'სტემები'), '-6');
    keyboardFader(groupFader(view, 'Group 1'), '-6');
    expect(trackVolume(api, 'stems')).toBe(trackVolumeFromDb(-6));
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-6));
    expect(liveTrackGains().stems).toBe(0);
    fireEvent.click(groupControl(view, 'Group 2', 'arrangement-group-mute'));
    expect(liveTrackGains()).toEqual({
      video: 1,
      music: 1,
      stems: trackVolumeFromDb(-6) * trackVolumeFromDb(-6),
      sfx: trackVolumeFromDb(-6),
    });
    expect(liveTrackGains()).toEqual(storedGains(api));
    act(() => live(api).togglePlayback());
  });

  it('UM6 Ctrl+G, group M/S/Volume and Ctrl+Shift+G while playing restart no sources', async () => {
    const { api, view } = await mountMixWorkspace();
    act(() => live(api).togglePlayback());
    const sources = vi.spyOn(FakeAudioContext.prototype, 'createBufferSource');
    const positionBefore = live(api).getLivePosition();
    groupRows(view, 'სტემები', 'SFX');
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-mute'));
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-solo'));
    dragFader(groupFader(view, 'Group 1'), 21, -30);
    fireEvent.click(groupName(view, 'Group 1'));
    pressGroupKey(true);
    fakeClock.base -= 0.5;
    expect(sources).toHaveBeenCalledTimes(0);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThan(positionBefore);
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    act(() => live(api).togglePlayback());
  });

  it('UM7 ungrouping a muted group makes its members audible; Undo mutes them again', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    act(() => live(api).togglePlayback());
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-mute'));
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 0, sfx: 0 });
    fireEvent.click(groupName(view, 'Group 1'));
    pressGroupKey(true);
    expect(live(api).getArrangement().groups).toBeUndefined();
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 1, sfx: 1 });
    act(() => live(api).undo());
    expect(groupMix(api, 'Group 1')?.mute).toBe(true);
    expect(liveTrackGains()).toEqual({ video: 1, music: 1, stems: 0, sfx: 0 });
    expect(
      groupControl(view, 'Group 1', 'arrangement-group-mute').getAttribute('aria-pressed'),
    ).toBe('true');
    act(() => live(api).togglePlayback());
  });

  it('UM8 the export dialog video-sound line uses the group-aware rule', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    const video = () =>
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'video');
    const audible = () => {
      const track = video();
      return track ? isTrackAudibleWithGroups(track, live(api).getArrangement()) : null;
    };
    expect(audible()).toBe(true);
    fireEvent.click(groupControl(view, 'Group 1', 'arrangement-group-solo'));
    expect(audible()).toBe(false);
    const trackSolo = toggleSolo(labArrangement(), 'music', false);
    const soloVideo = trackSolo.tracks.find((track) => track.id === 'video');
    expect(soloVideo && isTrackAudibleWithGroups(soloVideo, trackSolo)).toBe(false);
    const dialogSource = readFileSync(
      resolve(__dirname, '../../../components/arrangement/ArrangementExportDialog.tsx'),
      'utf8',
    );
    expect(dialogSource).toContain('isTrackAudibleWithGroups(videoTrack, arrangement)');
    expect(dialogSource).not.toMatch(/isTrackAudible\(/);
  });

  it('UM9 X1: collapsing blurs a hidden focused fader, commits a pending preview and focuses the group', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    const groupedLabel = live(api).undoLabel;
    laneFader(view, 'სტემები').focus();
    act(() => live(api).setStatus(''));
    pressU(laneFader(view, 'სტემები'));
    expect(status(view)).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(document.activeElement).toBe(groupName(view, 'Group 1'));
    expect(live(api).undoLabel).toBe(groupedLabel);
    pressU();
    const pending = laneFader(view, 'სტემები');
    pending.focus();
    fireEvent.change(pending, { target: { value: '-3.1' } });
    pressU(pending);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(trackVolume(api, 'stems')).toBe(trackVolumeFromDb(-3.1));
    expect(document.activeElement).toBe(groupName(view, 'Group 1'));
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBe(groupedLabel);
    expect(trackVolume(api, 'stems')).toBe(1);
    act(() => live(api).redo());
    pressU();
    nestMusicAndG1(view);
    const innerFader = groupFader(view, 'Group 1');
    innerFader.focus();
    fireEvent.change(innerFader, { target: { value: '-10.5' } });
    const labelBeforeOuter = live(api).undoLabel;
    expect(labelBeforeOuter).toBe('Group Tracks');
    fireEvent.click(view.getByRole('button', { name: 'Fold or unfold group — Group 2' }));
    expect(innerFader.isConnected).toBe(false);
    expect(document.activeElement).toBe(groupName(view, 'Group 2'));
    expect(rowOrder(view)).toEqual(['video', 'group:Group 2:0']);
    expect(groupMix(api, 'Group 1')?.volume).toBe(trackVolumeFromDb(-10.5));
    expect(live(api).undoLabel).toBe('Volume');
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBe(labelBeforeOuter);
    act(() => live(api).redo());
    fireEvent.click(view.getByRole('button', { name: 'Fold or unfold group — Group 2' }));
    const dragged = groupFader(view, 'Group 1');
    dragFader(dragged, 31, -10, false);
    act(() => live(api).setStatus(''));
    pressU(dragged);
    fireEvent.click(view.getByRole('button', { name: 'Fold or unfold group — Group 2' }));
    expect(status(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(rowOrder(view)).toEqual([
      'video',
      'group:Group 2:0',
      'music',
      'group:Group 1:1',
      'stems',
      'sfx',
    ]);
    windowPointer('pointerup', 31, 40);
  });

  it('UM10 Space, m and u on a focused group M/S behave as on a lane M/S', async () => {
    const { api, view } = await mountMixWorkspace();
    groupRows(view, 'სტემები', 'SFX');
    const laneMute = view.getByRole('button', { name: /^Mute — მუსიკა/ });
    const groupMute = groupControl(view, 'Group 1', 'arrangement-group-mute');
    const results = [laneMute, groupMute].map((button) => {
      button.focus();
      const space = pressKey(button, { key: ' ', code: 'Space' });
      fireEvent.keyUp(button, { key: ' ', code: 'Space' });
      const playing = live(api).isPlaying;
      if (playing) {
        act(() => live(api).togglePlayback());
      }
      button.focus();
      const marker = pressKey(button, { key: 'm', code: 'KeyM' });
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
      button.focus();
      return {
        spacePrevented: space.defaultPrevented,
        playing,
        markerPrevented: marker.defaultPrevented,
      };
    });
    expect(results[0]).toEqual({ spacePrevented: true, playing: true, markerPrevented: true });
    expect(results[1]).toEqual(results[0]);
    expect(groupMix(api, 'Group 1')?.mute).toBeUndefined();
    const groupSolo = groupControl(view, 'Group 1', 'arrangement-group-solo');
    groupSolo.focus();
    const collapse = pressU(groupSolo);
    expect(collapse.defaultPrevented).toBe(true);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(document.activeElement).toBe(groupControl(view, 'Group 1', 'arrangement-group-solo'));
    expect(groupMix(api, 'Group 1')?.solo).toBeUndefined();
  });
});
