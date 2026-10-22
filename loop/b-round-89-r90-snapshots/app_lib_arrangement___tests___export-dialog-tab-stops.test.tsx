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
import { dialogTabStopFocusTarget, groupDialogTabStops } from '../dialog-tab-stops';
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

const offlineRender: { reject: ((error: Error) => void) | null } = { reject: null };

class ControlledOfflineAudioContext extends FakeAudioContext {
  startRendering() {
    return new Promise<AudioBuffer>((_resolve, reject) => {
      offlineRender.reject = reject;
    });
  }
}

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

const tabStopsCollection: WorkspaceCollection = {
  id: 'tab-stops',
  label: 'tab-stops',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'tab-stops', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function tabStopsArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 8 },
    ],
  };
}

interface TabStopsApiRef {
  current: ArrangementContextValue | null;
}

function TabStopsProbe({ api }: { api: TabStopsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: TabStopsApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function openExportDialog() {
  const api: TabStopsApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={tabStopsCollection} initialArrangement={tabStopsArrangement()}>
      <StudioWorkspace />
      <TabStopsProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  const exportButton = view.getByRole('button', { name: 'Export' });
  exportButton.focus();
  fireEvent.click(exportButton);
  const dialog = view.getByRole('dialog');
  return { api, dialog };
}

function dialogButton(dialog: HTMLElement, name: string): HTMLButtonElement {
  const button = Array.from(dialog.querySelectorAll('button')).find(
    (entry) => entry.textContent?.trim() === name,
  );
  if (!button) {
    throw new Error(`dialog button ${name} missing`);
  }
  return button;
}

function modalCloseButton(dialog: HTMLElement): HTMLButtonElement {
  const button = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
  if (!button) {
    throw new Error('Modal X missing');
  }
  return button;
}

function byTestId(dialog: HTMLElement, testId: string): HTMLInputElement {
  const element = dialog.querySelector(`[data-testid="${testId}"]`);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`${testId} missing`);
  }
  return element;
}

function focusTrapOf(dialog: HTMLElement): HTMLElement {
  const trap = dialogButton(dialog, 'დახურვა').closest<HTMLElement>('[tabindex="-1"]');
  if (!trap || !dialog.contains(trap)) {
    throw new Error('focus trap wrapper missing');
  }
  return trap;
}

function pressTab(target: HTMLElement, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

async function startRender(api: TabStopsApiRef, dialog: HTMLElement, buttonName: string) {
  await act(async () => {
    fireEvent.click(dialogButton(dialog, buttonName));
    await Promise.resolve();
  });
  expect(live(api).exportState.phase).toBe('rendering');
}

async function stopRender(api: TabStopsApiRef) {
  await act(async () => {
    offlineRender.reject?.(new Error('render stopped by the test'));
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(live(api).exportState.phase).toBe('error');
}

function button(label: string): HTMLButtonElement {
  const element = document.createElement('button');
  element.textContent = label;
  return element;
}

function radio(name: string, value: string, checked = false): HTMLInputElement {
  const element = document.createElement('input');
  element.type = 'radio';
  element.name = name;
  element.value = value;
  element.checked = checked;
  return element;
}

describe('TS1 groupDialogTabStops', () => {
  it('puts same-name radios in one stop and keeps every other element alone', () => {
    const first = button('first');
    const ax = radio('a', 'x');
    const ay = radio('a', 'y');
    const bz = radio('b', 'z');
    const last = button('last');
    expect(groupDialogTabStops([first, ax, ay, bz, last])).toEqual([
      [first],
      [ax, ay],
      [bz],
      [last],
    ]);
  });

  it('keeps radios with an empty name as separate stops', () => {
    const one = radio('', 'one');
    const two = radio('', 'two');
    const stops = groupDialogTabStops([one, two]);
    expect(stops).toHaveLength(2);
    expect(stops[0]).toEqual([one]);
    expect(stops[1]).toEqual([two]);
  });

  it('joins same-name radios split by a button into one stop at the first radio position', () => {
    const ax = radio('a', 'x');
    const middle = button('middle');
    const ay = radio('a', 'y');
    expect(groupDialogTabStops([ax, middle, ay])).toEqual([[ax, ay], [middle]]);
  });

  it('returns an empty list for no focusable elements', () => {
    expect(groupDialogTabStops([])).toEqual([]);
  });
});

describe('TS2 dialogTabStopFocusTarget', () => {
  it('returns the checked radio even when it is not first', () => {
    const ax = radio('a', 'x');
    const ay = radio('a', 'y', true);
    expect(dialogTabStopFocusTarget([ax, ay])).toBe(ay);
  });

  it('returns the first member when no radio is checked', () => {
    const ax = radio('a', 'x');
    const ay = radio('a', 'y');
    expect(dialogTabStopFocusTarget([ax, ay])).toBe(ax);
  });

  it('returns a single button', () => {
    const only = button('only');
    expect(dialogTabStopFocusTarget([only])).toBe(only);
  });

  it('returns null for an empty stop', () => {
    expect(dialogTabStopFocusTarget([])).toBeNull();
  });
});

describe('Export dialog Tab stops during a render (R88-FOCUS-ESCAPE-RENDER, D-29z54; jsdom does not move focus on Tab, so the tests check defaultPrevented and the focus the trap sets)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    offlineRender.reject = null;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', ControlledOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    offlineRender.reject?.(new Error('render released by afterEach'));
    offlineRender.reject = null;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('TR1 WAV checked: Tab from the checked and from the unchecked format radio wraps to X', async () => {
    const { api, dialog } = await openExportDialog();
    const wav = byTestId(dialog, 'arrangement-export-format-wav');
    const mp3 = byTestId(dialog, 'arrangement-export-format-mp3');
    const modalClose = modalCloseButton(dialog);
    expect(wav.checked).toBe(true);
    await startRender(api, dialog, 'WAV-ის ექსპორტი');
    expect(wav.disabled).toBe(false);
    wav.focus();
    const fromChecked = pressTab(wav);
    expect(fromChecked.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    mp3.focus();
    const fromUnchecked = pressTab(mp3);
    expect(fromUnchecked.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    await stopRender(api);
  });

  it('TR2 MP3 checked: Tab from the checked MP3 radio wraps to X', async () => {
    const { api, dialog } = await openExportDialog();
    const mp3 = byTestId(dialog, 'arrangement-export-format-mp3');
    fireEvent.click(mp3);
    expect(mp3.checked).toBe(true);
    await startRender(api, dialog, 'MP3-ის ექსპორტი');
    mp3.focus();
    const forward = pressTab(mp3);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
    await stopRender(api);
  });

  it('TR3 WAV + MP3 checked: Tab from the both radio wraps to X (C round 88 V3)', async () => {
    const { api, dialog } = await openExportDialog();
    const both = byTestId(dialog, 'arrangement-export-format-both');
    fireEvent.click(both);
    expect(both.checked).toBe(true);
    await startRender(api, dialog, 'WAV + MP3 ექსპორტი');
    both.focus();
    const forward = pressTab(both);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
    await stopRender(api);
  });

  it('TR4 MP3 checked: Shift+Tab from X and from the trap wrapper goes to the checked MP3 radio, not both', async () => {
    const { api, dialog } = await openExportDialog();
    const mp3 = byTestId(dialog, 'arrangement-export-format-mp3');
    const both = byTestId(dialog, 'arrangement-export-format-both');
    fireEvent.click(mp3);
    await startRender(api, dialog, 'MP3-ის ექსპორტი');
    const modalClose = modalCloseButton(dialog);
    modalClose.focus();
    const fromX = pressTab(modalClose, true);
    expect(fromX.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(mp3);
    expect(document.activeElement).not.toBe(both);
    const trap = focusTrapOf(dialog);
    trap.focus();
    const fromTrap = pressTab(trap, true);
    expect(fromTrap.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(mp3);
    await stopRender(api);
  });

  it('TR5 render: Shift+Tab from the checked WAV radio and Tab from X stay native', async () => {
    const { api, dialog } = await openExportDialog();
    const wav = byTestId(dialog, 'arrangement-export-format-wav');
    const modalClose = modalCloseButton(dialog);
    await startRender(api, dialog, 'WAV-ის ექსპორტი');
    wav.focus();
    const backFromRadio = pressTab(wav, true);
    expect(backFromRadio.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(wav);
    modalClose.focus();
    const forwardFromX = pressTab(modalClose);
    expect(forwardFromX.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(modalClose);
    await stopRender(api);
  });
});

describe('Export dialog Tab stops when idle (D-29z54 over-trap guard; jsdom does not move focus on Tab)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', ControlledOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('TR6 idle: Tab from the checked format and scope radios stays native; Export ↔ X wrap', async () => {
    const { api, dialog } = await openExportDialog();
    expect(live(api).exportState.phase).toBe('idle');
    const wav = byTestId(dialog, 'arrangement-export-format-wav');
    const scopeProject = byTestId(dialog, 'arrangement-export-scope-project');
    const exportWav = dialogButton(dialog, 'WAV-ის ექსპორტი');
    const modalClose = modalCloseButton(dialog);
    expect(wav.checked).toBe(true);
    expect(scopeProject.checked).toBe(true);
    wav.focus();
    const fromFormat = pressTab(wav);
    expect(fromFormat.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(wav);
    scopeProject.focus();
    const fromScope = pressTab(scopeProject);
    expect(fromScope.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(scopeProject);
    exportWav.focus();
    const fromExport = pressTab(exportWav);
    expect(fromExport.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    const fromX = pressTab(modalClose, true);
    expect(fromX.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(exportWav);
  });
});
