import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { LIBRARY_DRAG_MIME } from '../library';
import { createArrangement } from '../model';
import { studioLaneMoveStrings, studioLaneStrings, studioLibraryPanelStrings } from '../strings';

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

const APP_ROOT = resolve(__dirname, '../../..');
const LANE_PATH = 'components/arrangement/ArrangementLane.tsx';
const LIBRARY_PREVIEW_PATH = 'components/arrangement/ArrangementLibraryPreview.tsx';

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const VIDEO_LANE_Y = 50;
const MUSIC_LANE_Y = 150;
const SFX_LANE_Y = 250;
const VIDEO_IMPORT_NAME = 'Your own video';

const VALID_LIBRARY_GHOST = ['border-foreground', 'bg-foreground/15', 'text-foreground'];
const BLOCKED_GHOST = ['border-muted', 'bg-muted/20', 'text-muted'];
const VALID_MOVE_GHOST = ['border-foreground', 'bg-foreground/20', 'text-foreground'];
const NEUTRAL_BRAND_NAMED_TOKENS = [
  'focus-visible:ring-brand',
  'accent-foreground',
  'text-brand-foreground',
];

const dragFeedbackCollection: WorkspaceCollection = {
  id: 'drag-feedback',
  label: 'drag-feedback',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'drag-feedback', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'drag-feedback', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: source.id === 'hit' ? 200 : 4000,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const DRAG_FEEDBACK_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 20, sourceOffset: 0, duration: 10 },
];

function dragFeedbackArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface DragFeedbackApiRef {
  current: ArrangementContextValue | null;
}

function DragFeedbackProbe({ api }: { api: DragFeedbackApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: DragFeedbackApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

function classTokens(element: Element): string[] {
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function expectDragTokens(element: Element, included: string[], excluded: string[], label: string) {
  const tokens = classTokens(element);
  expect(tokens, `${label} tokens`).toEqual(expect.arrayContaining(included));
  for (const token of excluded) {
    expect(tokens, `${label} must not have ${token}`).not.toContain(token);
  }
}

function brassTokens(element: Element): string[] {
  return classTokens(element).filter(
    (token) =>
      (token.includes('brand') || token.includes('accent')) &&
      !NEUTRAL_BRAND_NAMED_TOKENS.includes(token),
  );
}

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

async function mountDragFeedbackWorkspace(clips: ArrangementClip[] = DRAG_FEEDBACK_CLIPS) {
  const api: DragFeedbackApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={dragFeedbackCollection}
      initialArrangement={dragFeedbackArrangement(clips)}
    >
      <StudioWorkspace />
      <DragFeedbackProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 &&
    (live(api).sourceDurations.get('song') === undefined ||
      live(api).sourceDurations.get('hit') === undefined);
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  if (
    live(api).sourceDurations.get('song') === undefined ||
    live(api).sourceDurations.get('hit') === undefined
  ) {
    throw new Error('source durations not loaded');
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const headers = view.getAllByTestId('arrangement-track-header');
  if (headers.length !== 3) {
    throw new Error(`expected 3 track headers, found ${headers.length}`);
  }
  headers.forEach((header, index) => {
    const row = header.parentElement;
    if (!row) {
      throw new Error(`track row ${index} missing`);
    }
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const laneBody = (trackName: string) => {
    const fold = view.getByRole('button', { name: studioLaneStrings.foldLabel(trackName) });
    const bodyId = fold.getAttribute('aria-controls');
    const body = bodyId ? document.getElementById(bodyId) : null;
    if (!body) {
      throw new Error(`lane body ${trackName} missing`);
    }
    return body;
  };
  return { api, view, laneBody };
}

function libraryTransfer() {
  return { types: [LIBRARY_DRAG_MIME], files: [], dropEffect: 'none' };
}

function fileTransfer() {
  return { types: ['Files'], files: [], dropEffect: 'none' };
}

function dragLibraryOver(lane: HTMLElement, time: number) {
  fireEvent.dragOver(lane, {
    clientX: Math.round(time * PX_PER_SECOND),
    dataTransfer: libraryTransfer(),
  });
}

function libraryGhost(view: ReturnType<typeof render>): HTMLElement {
  const ghosts = view.queryAllByTestId('arrangement-drop-ghost');
  const ghost = ghosts[0];
  if (ghosts.length !== 1 || !ghost) {
    throw new Error(`expected one library drop ghost, found ${ghosts.length}`);
  }
  return ghost;
}

function laneMoveGhost(view: ReturnType<typeof render>, blocked: 'true' | 'false'): HTMLElement {
  const ghosts = view
    .queryAllByTestId('arrangement-lane-move-ghost')
    .filter((ghost) => ghost.dataset.blocked === blocked);
  const ghost = ghosts[0];
  if (ghosts.length !== 1 || !ghost) {
    throw new Error(`expected one lane-move ghost with blocked=${blocked}, found ${ghosts.length}`);
  }
  return ghost;
}

function ringTokens(element: Element): string[] {
  return classTokens(element).filter((token) => token.startsWith('ring-'));
}

function clipHeader(lane: HTMLElement, clipId: string) {
  const root = Array.from(lane.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.dataset.clipId === clipId,
  );
  const header = root?.firstElementChild;
  if (!root || !(header instanceof HTMLElement)) {
    throw new Error(`clip ${clipId} not rendered in its lane`);
  }
  stubCapture(root);
  return { root, header };
}

function fileDragHint(lane: HTMLElement, text: string): HTMLElement {
  const hint = within(lane).queryByText(text);
  if (!hint) {
    throw new Error(`file-drag hint "${text}" missing`);
  }
  return hint;
}

function libraryAddButton(view: ReturnType<typeof render>): HTMLElement {
  const preview = view.queryByRole('region', { name: studioLibraryPanelStrings.previewLabel });
  if (!preview) {
    throw new Error('Preview region missing');
  }
  const add = within(preview).queryByRole('button', { name: studioLibraryPanelStrings.add });
  if (!add) {
    throw new Error('Preview Add button missing');
  }
  return add;
}

function videoImportButton(view: ReturnType<typeof render>): HTMLElement {
  const buttons = view.queryAllByRole('button', { name: VIDEO_IMPORT_NAME });
  const button = buttons[0];
  if (buttons.length !== 1 || !button) {
    throw new Error(`expected one video import button, found ${buttons.length}`);
  }
  return button;
}

const press = { button: 0, buttons: 1 };

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DUX-R-5b-3b drag feedback and import / Add colour', { timeout: 15_000 }, () => {
  it('DXG1: the valid Library ghost uses the foreground recipe and no brass', async () => {
    const { api, view, laneBody } = await mountDragFeedbackWorkspace();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('SFX'), 2);
    const ghost = libraryGhost(view);
    expect(ghost.dataset.blocked).toBe('false');
    expectDragTokens(ghost, VALID_LIBRARY_GHOST, BLOCKED_GHOST, 'valid library ghost');
    expect(brassTokens(ghost)).toEqual([]);
  });

  it('DXG2: the refused and the no-room Library ghosts use the muted recipe and no brass', async () => {
    const { api, view, laneBody } = await mountDragFeedbackWorkspace();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('ვიდეო'), 2);
    const refused = libraryGhost(view);
    expect(refused.dataset.blocked).toBe('true');
    expect(refused.textContent ?? '').toContain(studioLaneStrings.ghostAudioOnVideoTrack);
    expectDragTokens(refused, BLOCKED_GHOST, VALID_LIBRARY_GHOST, 'refused library ghost');
    expect(brassTokens(refused)).toEqual([]);

    fireEvent.dragLeave(laneBody('ვიდეო'), { relatedTarget: null });
    dragLibraryOver(laneBody('მუსიკა'), 24);
    const noRoom = libraryGhost(view);
    expect(noRoom.dataset.blocked).toBe('true');
    expect(noRoom.textContent ?? '').toContain(studioLaneMoveStrings.noRoom);
    expectDragTokens(noRoom, BLOCKED_GHOST, VALID_LIBRARY_GHOST, 'no-room library ghost');
    expect(brassTokens(noRoom)).toEqual([]);
  });

  it('DXG3: the lane-move ghost is foreground on an audio lane and muted on the video lane', async () => {
    const { view, laneBody } = await mountDragFeedbackWorkspace();
    const parts = clipHeader(laneBody('მუსიკა'), 'm1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 4,
      clientX: 100,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 4, clientX: 100, clientY: SFX_LANE_Y });
    const valid = laneMoveGhost(view, 'false');
    expect(valid.dataset.blocked).toBe('false');
    expectDragTokens(valid, VALID_MOVE_GHOST, BLOCKED_GHOST, 'valid lane-move ghost');
    expect(brassTokens(valid)).toEqual([]);

    fireEvent.pointerMove(parts.root, { pointerId: 4, clientX: 100, clientY: VIDEO_LANE_Y });
    const blocked = laneMoveGhost(view, 'true');
    expect(blocked.dataset.blocked).toBe('true');
    expectDragTokens(blocked, BLOCKED_GHOST, VALID_MOVE_GHOST, 'blocked lane-move ghost');
    expect(brassTokens(blocked)).toEqual([]);
    fireEvent.pointerUp(parts.root, { pointerId: 4, clientX: 100, clientY: VIDEO_LANE_Y });
  });

  it('DXG4: a file drag rings the video lane in foreground and an audio lane in muted; the hint is foreground', async () => {
    const { view, laneBody } = await mountDragFeedbackWorkspace();
    const video = laneBody('ვიდეო');
    fireEvent.dragEnter(video, { dataTransfer: fileTransfer() });
    fireEvent.dragOver(video, { dataTransfer: fileTransfer() });
    expectDragTokens(
      video,
      ['ring-2', 'ring-inset', 'ring-foreground'],
      ['ring-muted'],
      'video lane ring',
    );
    expect(ringTokens(video).filter((token) => /brand|accent/.test(token))).toEqual([]);
    const videoHint = view.getByTestId('arrangement-video-drop-hint');
    expect(videoHint.textContent).toBe(studioLaneStrings.dropVideoHere);
    expectDragTokens(videoHint, ['text-foreground'], ['text-muted'], 'video drop hint');
    expect(brassTokens(videoHint)).toEqual([]);
    fireEvent.dragLeave(video, { relatedTarget: null });
    expect(classTokens(video)).not.toContain('ring-2');
    expect(classTokens(video)).not.toContain('ring-foreground');
    expect(view.queryByTestId('arrangement-video-drop-hint')).toBeNull();

    const music = laneBody('მუსიკა');
    fireEvent.dragEnter(music, { dataTransfer: fileTransfer() });
    fireEvent.dragOver(music, { dataTransfer: fileTransfer() });
    expectDragTokens(
      music,
      ['ring-2', 'ring-inset', 'ring-muted'],
      ['ring-foreground'],
      'audio lane ring',
    );
    expect(ringTokens(music).filter((token) => /brand|accent/.test(token))).toEqual([]);
    const audioHint = fileDragHint(music, studioLaneStrings.videoNotOnAudioTrack);
    expectDragTokens(audioHint, ['text-foreground'], ['text-muted'], 'audio refusal hint');
    expect(brassTokens(audioHint)).toEqual([]);
    fireEvent.dragLeave(music, { relatedTarget: null });
    expect(classTokens(music)).not.toContain('ring-2');
    expect(classTokens(music)).not.toContain('ring-muted');
    expect(within(music).queryByText(studioLaneStrings.videoNotOnAudioTrack)).toBeNull();
  });

  it('DXG5: the full and compact video import and the Preview Add take the neutral outline', async () => {
    const { view } = await mountDragFeedbackWorkspace();
    const neutral = ['border', 'border-outline-strong', 'text-foreground'];
    const forbidden = ['border-transparent', 'border-brand', 'text-brand'];

    const full = videoImportButton(view);
    expect(full.textContent).toBe(VIDEO_IMPORT_NAME);
    expectDragTokens(full, neutral, forbidden, 'full video import');
    expect(brassTokens(full)).toEqual([]);

    const add = libraryAddButton(view);
    expectDragTokens(add, [...neutral, 'disabled:opacity-40'], forbidden, 'Preview Add');
    expect(brassTokens(add)).toEqual([]);

    fireEvent.click(view.getByRole('button', { name: studioLaneStrings.foldLabel('ვიდეო') }));
    const compact = videoImportButton(view);
    expect(compact.textContent).toBe('');
    expect(compact.getAttribute('title')).toBe(VIDEO_IMPORT_NAME);
    expectDragTokens(compact, neutral, forbidden, 'compact video import');
    expect(brassTokens(compact)).toEqual([]);
  });

  it('DXG6: the source keeps exactly the new recipes and none of the retired brass strings', () => {
    const lane = readAppSource(LANE_PATH);
    expect(countOccurrences(lane, "'border-muted bg-muted/20 text-muted'"), 'blocked recipe').toBe(
      2,
    );
    expect(
      countOccurrences(lane, "'border-foreground bg-foreground/15 text-foreground'"),
      'valid library ghost recipe',
    ).toBe(1);
    expect(
      countOccurrences(lane, "'border-foreground bg-foreground/20 text-foreground'"),
      'valid lane-move ghost recipe',
    ).toBe(1);
    for (const retired of [
      'ring-accent',
      "'text-accent'",
      'text-xs text-brand motion',
      'border border-brand bg-foreground/5',
      "'border-brand bg-brand/15 text-brand'",
      "'border-brand bg-brand/20 text-brand'",
      "'border-accent bg-accent/20 text-accent'",
    ]) {
      expect(countOccurrences(lane, retired), `${retired} in ${LANE_PATH}`).toBe(0);
    }
    expect(
      countOccurrences(readAppSource(LIBRARY_PREVIEW_PATH), 'border border-brand'),
      `border border-brand in ${LIBRARY_PREVIEW_PATH}`,
    ).toBe(0);
  });

  it('DXG7: valid and blocked feedback differ for both ghosts and for the ring', async () => {
    const { api, view, laneBody } = await mountDragFeedbackWorkspace();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('SFX'), 2);
    const validLibrary = classTokens(libraryGhost(view));
    fireEvent.dragLeave(laneBody('SFX'), { relatedTarget: null });
    dragLibraryOver(laneBody('ვიდეო'), 2);
    const blockedLibrary = classTokens(libraryGhost(view));
    fireEvent.dragLeave(laneBody('ვიდეო'), { relatedTarget: null });
    expect(validLibrary).toContain('border-foreground');
    expect(blockedLibrary).toContain('border-muted');
    expect(validLibrary).not.toEqual(blockedLibrary);
    expect(blockedLibrary).not.toContain('border-foreground');

    const parts = clipHeader(laneBody('მუსიკა'), 'm1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 5,
      clientX: 100,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 5, clientX: 100, clientY: SFX_LANE_Y });
    const validMove = classTokens(laneMoveGhost(view, 'false'));
    fireEvent.pointerMove(parts.root, { pointerId: 5, clientX: 100, clientY: VIDEO_LANE_Y });
    const blockedMove = classTokens(laneMoveGhost(view, 'true'));
    fireEvent.pointerUp(parts.root, { pointerId: 5, clientX: 100, clientY: VIDEO_LANE_Y });
    expect(validMove).toContain('border-foreground');
    expect(blockedMove).toContain('border-muted');
    expect(validMove).not.toEqual(blockedMove);
    expect(blockedMove).not.toContain('border-foreground');

    const video = laneBody('ვიდეო');
    fireEvent.dragOver(video, { dataTransfer: fileTransfer() });
    const validRing = ringTokens(video);
    fireEvent.dragLeave(video, { relatedTarget: null });
    const music = laneBody('მუსიკა');
    fireEvent.dragOver(music, { dataTransfer: fileTransfer() });
    const refusedRing = ringTokens(music);
    fireEvent.dragLeave(music, { relatedTarget: null });
    expect(validRing).toContain('ring-foreground');
    expect(refusedRing).toContain('ring-muted');
    expect(validRing).not.toEqual(refusedRing);
  });
});
