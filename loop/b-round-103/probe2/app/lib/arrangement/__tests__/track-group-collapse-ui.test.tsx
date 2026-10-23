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
import { TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE } from '../groups';
import { createArrangement } from '../model';
import { fitLaneHeights } from '../panels';

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

const resizeCallbacks = new Set<() => void>();

class ControlledResizeObserver {
  private readonly callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe() {
    resizeCallbacks.add(this.callback);
  }
  disconnect() {
    resizeCallbacks.delete(this.callback);
  }
}

const PX_PER_SECOND = 40;
const HEADER_PX = 224;
const LANE_PX = 100;
const GROUP_ROW_PX = 28;
const TIMELINE_CHROME_PX = 44;

const SOURCE_LENGTHS: Record<string, number> = { song: 4000, stem: 1000, hit: 200 };

const groupsCollection: WorkspaceCollection = {
  id: 'track-groups',
  label: 'track-groups',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'track-groups', kind: 'music', origin: 'demo' },
    { id: 'stem', title: 'Stem', collectionLabel: 'track-groups', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'track-groups', kind: 'sfx', origin: 'demo' },
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
  { id: 'cm2', trackId: 'music', sourceId: 'song', start: 20, sourceOffset: 0, duration: 2 },
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

interface GroupsApiRef {
  current: ArrangementContextValue | null;
}

function GroupsProbe({ api }: { api: GroupsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: GroupsApiRef): ArrangementContextValue {
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

async function mountGroupsWorkspace() {
  const api: GroupsApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={groupsCollection} initialArrangement={labArrangement()}>
      <StudioWorkspace />
      <GroupsProbe api={api} />
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
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  return { api, view };
}

type GroupsView = ReturnType<typeof render>;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function laneName(view: GroupsView, name: string): HTMLElement {
  return view.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(name)} — აქტიური ხაზის არჩევა`),
  });
}

function groupName(view: GroupsView, name: string): HTMLElement {
  return view.getByRole('button', { name: new RegExp(`^${escapeRegExp(name)} — ჯგუფი`) });
}

function selectedRows(view: GroupsView): string[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>(
      '[data-track-selected="true"], [data-group-selected="true"]',
    ),
  ).map((row) => row.dataset.trackId ?? `group:${row.textContent?.trim() ?? ''}`);
}

function lanesContainer(view: GroupsView): HTMLElement {
  const container =
    view.container.querySelector<HTMLElement>('[data-track-id="video"]')?.parentElement;
  if (!container) {
    throw new Error('lanes container missing');
  }
  return container;
}

function rowOrder(view: GroupsView): string[] {
  return Array.from(lanesContainer(view).children).flatMap((child) => {
    if (!(child instanceof HTMLElement)) {
      return [];
    }
    if (child.dataset.groupId !== undefined) {
      return [`group:${child.textContent?.replace('▣', '').trim()}:${child.dataset.groupDepth}`];
    }
    if (child.dataset.trackId !== undefined) {
      const header = child.querySelector<HTMLElement>('[data-testid="arrangement-track-header"]');
      return [`${child.dataset.trackId}:${header?.style.paddingLeft || '-'}`];
    }
    return [];
  });
}

function status(view: GroupsView): string {
  return view.getByTestId('arrangement-status').textContent ?? '';
}

function pressGroupKey(shift = false, target: Element = document.body) {
  fireEvent.keyDown(target, {
    key: shift ? 'G' : 'g',
    code: 'KeyG',
    ctrlKey: true,
    shiftKey: shift,
  });
}

function clickLane(view: GroupsView, name: string, modifiers: MouseEventInit = {}) {
  fireEvent.click(laneName(view, name), modifiers);
}

function groupMusicAndStems(view: GroupsView) {
  clickLane(view, 'მუსიკა');
  clickLane(view, 'სტემები', { shiftKey: true });
  pressGroupKey();
}

function groupStemsAndSfx(view: GroupsView) {
  clickLane(view, 'სტემები');
  clickLane(view, 'SFX', { shiftKey: true });
  pressGroupKey();
}

function layoutRows(view: GroupsView): Record<string, number> {
  const centres: Record<string, number> = {};
  let top = 0;
  for (const child of Array.from(lanesContainer(view).children)) {
    if (!(child instanceof HTMLElement)) {
      continue;
    }
    const id = child.dataset.trackId ?? child.dataset.groupId;
    if (id === undefined) {
      continue;
    }
    const height = child.dataset.groupId !== undefined ? GROUP_ROW_PX : LANE_PX;
    const rowTop = top;
    Object.defineProperty(child, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, rowTop, 2000, height),
    });
    centres[child.dataset.groupId !== undefined ? 'group' : id] = rowTop + height / 2;
    top += height;
  }
  return centres;
}

function clipMoveHandle(view: GroupsView, clipId: string) {
  const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
  const handle = root?.querySelector<HTMLElement>('[title$="— გადაადგილება"]');
  if (!root || !handle) {
    throw new Error(`clip ${clipId} not rendered`);
  }
  stubCapture(root);
  return { root, handle };
}

function clipTrack(api: GroupsApiRef, clipId: string): string | undefined {
  return live(api)
    .getArrangement()
    .clips.find((clip) => clip.id === clipId)?.trackId;
}

function dragClipVertically(
  view: GroupsView,
  api: GroupsApiRef,
  clipId: string,
  fromY: number,
  path: readonly number[],
): (string | null)[] {
  const { root, handle } = clipMoveHandle(view, clipId);
  const x = HEADER_PX + 21 * PX_PER_SECOND;
  fireEvent.pointerDown(handle, {
    button: 0,
    buttons: 1,
    pointerId: 7,
    clientX: x,
    clientY: fromY,
  });
  const ghostTracks: (string | null)[] = [];
  for (const y of path) {
    fireEvent.pointerMove(root, { pointerId: 7, clientX: x, clientY: y });
    ghostTracks.push(live(api).clipLaneDrag?.ghosts[0]?.trackId ?? null);
  }
  fireEvent.pointerUp(root, { pointerId: 7, clientX: x, clientY: path.at(-1) ?? fromY });
  return ghostTracks;
}

const layoutFrame = { column: 0 };

function stubTimelineFrame(column: number) {
  layoutFrame.column = column;
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.testid !== 'arrangement-timeline-scroller') {
      return 0;
    }
    const panel = this.nextElementSibling;
    const panelHeight =
      panel instanceof HTMLElement ? Number.parseFloat(panel.style.height) || 0 : 0;
    return layoutFrame.column - panelHeight;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.testid === 'arrangement-detail-panel') {
      return Number.parseFloat(this.style.height) || 0;
    }
    const parent = this.parentElement;
    if (parent?.parentElement?.dataset.testid === 'arrangement-timeline-scroller') {
      return parent.firstElementChild === this ? TIMELINE_CHROME_PX : 0;
    }
    return 0;
  });
}

function fireTimelineResize(column: number) {
  layoutFrame.column = column;
  act(() => {
    for (const callback of resizeCallbacks) {
      callback();
    }
  });
}

function withoutTrackGroups(arrangement: Arrangement): Arrangement {
  const { groups: _groups, ...rest } = arrangement;
  return {
    ...rest,
    tracks: arrangement.tracks.map(({ groupId: _groupId, ...track }) => track),
  };
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  resizeCallbacks.clear();
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

function foldButton(view: GroupsView, name: string): HTMLElement {
  return view.getByRole('button', { name: `ჯგუფის დაკეცვა / გახსნა — ${name}` });
}

function pressU(target: Element = document.body, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: init.shiftKey ? 'U' : 'u',
    code: 'KeyU',
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function renderedLaneIds(view: GroupsView): string[] {
  return Array.from(view.container.querySelectorAll<HTMLElement>('[data-track-id]')).map(
    (lane) => lane.dataset.trackId ?? '',
  );
}

function overviewBlocks(view: GroupsView): HTMLElement[] {
  return Array.from(view.container.querySelectorAll<HTMLElement>('[data-overview-clip-id]'));
}

function laneHeight(view: GroupsView, id: string): number {
  return (
    Number.parseFloat(
      view.container.querySelector<HTMLElement>(`[data-track-id="${id}"]`)?.style.height ?? '0',
    ) - 1
  );
}

function fitEntries(ids: readonly string[]) {
  return ids.map((id) => ({
    kind: id === 'video' ? ('video' as const) : ('audio' as const),
    folded: false,
  }));
}

function mountTimelineFrame(view: GroupsView, visibleRowsHeight: number): number {
  const scroller = view.getByTestId('arrangement-timeline-scroller');
  const panel = scroller.nextElementSibling;
  const panelHeight = panel instanceof HTMLElement ? Number.parseFloat(panel.style.height) || 0 : 0;
  fireTimelineResize(panelHeight + TIMELINE_CHROME_PX + visibleRowsHeight);
  return scroller.clientHeight - TIMELINE_CHROME_PX;
}

describe('SRW-17 stage 2 track group collapse in the workspace', { timeout: 20_000 }, () => {
  it('UC1 the fold button hides the member lanes, shows an overview and writes no history', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    const undoLabel = live(api).undoLabel;
    const fold = foldButton(view, 'ჯგუფი 1');
    expect(fold.getAttribute('aria-expanded')).toBe('true');
    expect(fold.dataset.foldGlyph).toBe('▾');
    expect(fold.getAttribute('title')).toBe('დაკეცვა / გახსნა (U)');
    expect(view.queryByTestId('arrangement-group-overview')).toBeNull();
    fireEvent.click(fold);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(view.container.querySelector('[data-track-id="stems"]')).toBeNull();
    expect(view.container.querySelector('[data-track-id="sfx"]')).toBeNull();
    expect(foldButton(view, 'ჯგუფი 1').getAttribute('aria-expanded')).toBe('false');
    expect(foldButton(view, 'ჯგუფი 1').dataset.foldGlyph).toBe('▸');
    const band = view.getByTestId('arrangement-group-overview');
    expect(band.getAttribute('aria-hidden')).toBe('true');
    expect(band.className).toContain('pointer-events-none');
    const blocks = overviewBlocks(view);
    expect(
      blocks.map((block) => [
        block.dataset.overviewClipId,
        block.dataset.overviewStart,
        block.dataset.overviewEnd,
        block.style.left,
        block.style.width,
      ]),
    ).toEqual([
      ['cs', '2.000', '8.000', `${2 * PX_PER_SECOND}px`, `${6 * PX_PER_SECOND}px`],
      ['cx', '4.000', '6.000', `${4 * PX_PER_SECOND}px`, `${2 * PX_PER_SECOND}px`],
    ]);
    expect(view.container.querySelector('[data-group-id]')?.getAttribute('style')).toContain(
      `height: ${GROUP_ROW_PX}px`,
    );
    expect(live(api).undoLabel).toBe(undoLabel);
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    expect(foldButton(view, 'ჯგუფი 1').getAttribute('aria-expanded')).toBe('true');
    expect(view.queryByTestId('arrangement-group-overview')).toBeNull();
    expect(live(api).undoLabel).toBe(undoLabel);
    expect(live(api).redoLabel).toBeNull();
  });

  it('UC2 plain U toggles the selected groups and refuses a track-only selection', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    const handled = pressU();
    expect(handled.defaultPrevented).toBe(true);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    pressU();
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    clickLane(view, 'მუსიკა');
    const before = live(api).getArrangement();
    pressU();
    expect(status(view)).toBe(TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    expect(live(api).getArrangement()).toBe(before);
  });

  it('UC2 U is ignored in text fields, with modifiers and while repeating', async () => {
    const { view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    const button = groupName(view, 'ჯგუფი 1');
    button.focus();
    fireEvent.keyDown(button, { key: 'F2', code: 'F2' });
    const input = view.getByTestId('arrangement-group-name-input');
    expect(pressU(input).defaultPrevented).toBe(false);
    fireEvent.keyDown(input, { key: 'Escape' });
    for (const testId of ['arrangement-tempo-input', 'arrangement-library-search']) {
      const field = view.getByTestId(testId);
      field.focus();
      expect(pressU(field).defaultPrevented, testId).toBe(false);
    }
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    pressU(document.body, { ctrlKey: true });
    pressU(document.body, { metaKey: true });
    pressU(document.body, { shiftKey: true });
    pressU(document.body, { altKey: true });
    pressU(document.body, { repeat: true });
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    pressU();
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
  });

  it('UC2 U and the fold button are refused during a pointer gesture and a pending fader preview', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(42, () => {});
    });
    pressU();
    expect(status(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus(''));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(status(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    act(() => release?.());
    const previewed = live(api).getArrangement();
    act(() => live(api).previewArrangement(previewed));
    expect(live(api).isArrangementPreviewActive()).toBe(true);
    act(() => live(api).setStatus(''));
    pressU();
    expect(status(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    act(() => {
      live(api).commitArrangement(previewed, 'Preview', previewed);
    });
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    const undoBefore = live(api).undoLabel;
    const fader = view.getByRole('slider', { name: /^Volume — სტემები/ });
    fader.focus();
    fireEvent.change(fader, { target: { value: '0.9' } });
    expect(live(api).undoLabel).toBe(undoBefore);
    act(() => live(api).setStatus(''));
    pressU(fader);
    expect(status(view)).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(live(api).undoLabel).toBe('Volume');
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'stems')?.volume,
    ).toBe(0.9);
    expect(document.activeElement).toBe(groupName(view, 'ჯგუფი 1'));
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBe(undoBefore);
    act(() => live(api).redo());
    expect(live(api).undoLabel).toBe('Volume');
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    const undoAfterCommit = live(api).undoLabel;
    const idleFader = view.getByRole('slider', { name: /^Volume — სტემები/ });
    idleFader.focus();
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(status(view)).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(live(api).undoLabel).toBe(undoAfterCommit);
    expect(document.activeElement).toBe(groupName(view, 'ჯგუფი 1'));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    const musicFader = view.getByRole('slider', { name: /^Volume — მუსიკა/ });
    musicFader.focus();
    pressU(musicFader);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(document.activeElement).toBe(musicFader);
  });

  it('UC3 nested collapse keeps the inner group collapsed when the outer one expands', async () => {
    const { view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    clickLane(view, 'მუსიკა');
    fireEvent.click(groupName(view, 'ჯგუფი 1'), { ctrlKey: true });
    pressGroupKey();
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(rowOrder(view)).toEqual(['video:-', 'group:ჯგუფი 2:0', 'music:20px', 'group:ჯგუფი 1:1']);
    fireEvent.click(foldButton(view, 'ჯგუფი 2'));
    expect(rowOrder(view)).toEqual(['video:-', 'group:ჯგუფი 2:0']);
    expect(overviewBlocks(view).map((block) => block.dataset.overviewClipId)).toEqual([
      'cm',
      'cm2',
      'cs',
      'cx',
    ]);
    fireEvent.click(foldButton(view, 'ჯგუფი 2'));
    expect(rowOrder(view)).toEqual(['video:-', 'group:ჯგუფი 2:0', 'music:20px', 'group:ჯგუფი 1:1']);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
  });

  it('UC3 a collapsed group nested by Ctrl+G stays collapsed and ungrouping shows its children', async () => {
    const { view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    clickLane(view, 'მუსიკა');
    fireEvent.click(groupName(view, 'ჯგუფი 1'), { ctrlKey: true });
    pressGroupKey();
    expect(rowOrder(view)).toEqual(['video:-', 'group:ჯგუფი 2:0', 'music:20px', 'group:ჯგუფი 1:1']);
    fireEvent.click(groupName(view, 'ჯგუფი 1'));
    pressGroupKey(true);
    expect(rowOrder(view)).toEqual([
      'video:-',
      'group:ჯგუფი 2:0',
      'music:20px',
      'stems:20px',
      'sfx:20px',
    ]);
  });

  it('UC4 hidden lane controls are unreachable and the collapsed label carries the clip count', async () => {
    const { view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    expect(groupName(view, 'ჯგუფი 1').getAttribute('aria-label')).toBe(
      'ჯგუფი 1 — ჯგუფი, მონიშნული',
    );
    pressU();
    expect(view.queryByRole('slider', { name: /სტემები|SFX/ })).toBeNull();
    expect(view.queryByRole('button', { name: /^(სტემები|SFX) / })).toBeNull();
    expect(view.queryByRole('button', { name: /Mute — (სტემები|SFX)/ })).toBeNull();
    expect(groupName(view, 'ჯგუფი 1').getAttribute('aria-label')).toBe(
      'ჯგუფი 1 — ჯგუფი, დაკეცილი, 2 კლიპი, მონიშნული',
    );
    clickLane(view, 'მუსიკა');
    expect(groupName(view, 'ჯგუფი 1').getAttribute('aria-label')).toBe(
      'ჯგუფი 1 — ჯგუფი, დაკეცილი, 2 კლიპი',
    );
  });

  it('UC4 F3 a collapse moves focus from a hidden lane to the collapsing group name', async () => {
    const { view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    clickLane(view, 'მუსიკა');
    fireEvent.click(groupName(view, 'ჯგუფი 1'), { ctrlKey: true });
    const stems = laneName(view, 'სტემები');
    stems.focus();
    fireEvent.click(stems, { ctrlKey: true });
    expect(document.activeElement).toBe(stems);
    expect(selectedRows(view)).toEqual(['music', 'group:▣ჯგუფი 1', 'stems']);
    pressU(stems);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(document.activeElement).toBe(groupName(view, 'ჯგუფი 1'));
    const fold = foldButton(view, 'ჯგუფი 1');
    fold.focus();
    fireEvent.click(fold);
    fireEvent.click(fold);
    expect(document.activeElement).toBe(fold);
  });

  it('UC5 collapsing prunes hidden clip, row and lane-range selections, keeps an all-lanes range', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    act(() => live(api).selectClips(['cm', 'cs']));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(live(api).getSelectedClipIds()).toEqual(['cm']);
    act(() => live(api).selectClips([]));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    act(() => live(api).selectClips(['cs']));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(live(api).getSelectedClipIds()).toEqual([]);
    const undoLabel = live(api).undoLabel;
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).undoLabel).toBe(undoLabel);
    expect(live(api).getArrangement().clips).toHaveLength(4);
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    act(() => live(api).setTimeRange({ start: 4, end: 5, trackId: 'sfx' }));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(live(api).range).toBeNull();
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    act(() => live(api).setTimeRange({ start: 1, end: 3, trackId: 'sfx', allTracks: true }));
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(live(api).range).toEqual({ start: 1, end: 3, trackId: 'sfx', allTracks: true });
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    clickLane(view, 'SFX');
    fireEvent.click(groupName(view, 'ჯგუფი 1'), { ctrlKey: true });
    expect(selectedRows(view)).toEqual(['group:▣ჯგუფი 1', 'sfx']);
    pressU();
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    expect(selectedRows(view)).toEqual(['group:▣ჯგუფი 1']);
  });

  it('UC5 Ctrl+A while collapsed selects every clip and marks the overview blocks', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    pressU();
    expect(
      overviewBlocks(view).every((block) => block.dataset.overviewSelected === undefined),
    ).toBe(true);
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA', ctrlKey: true });
    expect([...live(api).getSelectedClipIds()].sort()).toEqual(['cm', 'cm2', 'cs', 'cx']);
    expect(overviewBlocks(view).map((block) => block.dataset.overviewSelected)).toEqual([
      'true',
      'true',
    ]);
  });

  it('UC6 auto-fit uses the visible lanes only and writes heights back by track id', async () => {
    stubTimelineFrame(1000);
    const { view } = await mountGroupsWorkspace();
    const visibleRows = mountTimelineFrame(view, 150);
    expect(visibleRows).toBe(150);
    const all = ['video', 'music', 'stems', 'sfx'];
    expect(all.map((id) => laneHeight(view, id))).toEqual(
      fitLaneHeights({ visibleRowsHeight: visibleRows, lanes: fitEntries(all) }),
    );
    groupMusicAndStems(view);
    const expanded = all.map((id) => laneHeight(view, id));
    expect(expanded).toEqual(
      fitLaneHeights({ visibleRowsHeight: visibleRows - GROUP_ROW_PX, lanes: fitEntries(all) }),
    );
    pressU();
    expect(renderedLaneIds(view)).toEqual(['video', 'sfx']);
    const collapsedFit = fitLaneHeights({
      visibleRowsHeight: visibleRows - GROUP_ROW_PX,
      lanes: fitEntries(['video', 'sfx']),
    });
    expect([laneHeight(view, 'video'), laneHeight(view, 'sfx')]).toEqual(collapsedFit);
    expect(collapsedFit).not.toEqual([expanded[0], expanded[3]]);
    expect(
      laneHeight(view, 'video') + laneHeight(view, 'sfx') + 2 + GROUP_ROW_PX,
    ).toBeLessThanOrEqual(visibleRows);
    pressU();
    expect(all.map((id) => laneHeight(view, id))).toEqual(expanded);
  });

  it('UC6 a hidden lane keeps its manual height across collapse and expand', async () => {
    stubTimelineFrame(1000);
    const { view } = await mountGroupsWorkspace();
    mountTimelineFrame(view, 600);
    const handle = view.container.querySelector<HTMLElement>(
      '[data-track-id="music"] [data-testid="arrangement-track-height"]',
    );
    if (!handle) {
      throw new Error('music height handle missing');
    }
    fireEvent.keyDown(handle, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown', code: 'ArrowDown' });
    const manual = laneHeight(view, 'music');
    expect(manual).toBeGreaterThan(80);
    groupMusicAndStems(view);
    pressU();
    expect(renderedLaneIds(view)).toEqual(['video', 'sfx']);
    pressU();
    expect(laneHeight(view, 'music')).toBe(manual);
  });

  it('UC6 nested: an outer collapse leaves one lane and one group row to fit', async () => {
    stubTimelineFrame(1000);
    const { view } = await mountGroupsWorkspace();
    const visibleRows = mountTimelineFrame(view, 150);
    groupStemsAndSfx(view);
    clickLane(view, 'მუსიკა');
    fireEvent.click(groupName(view, 'ჯგუფი 1'), { ctrlKey: true });
    pressGroupKey();
    const all = ['video', 'music', 'stems', 'sfx'];
    const expanded = all.map((id) => laneHeight(view, id));
    expect(expanded).toEqual(
      fitLaneHeights({ visibleRowsHeight: visibleRows - 2 * GROUP_ROW_PX, lanes: fitEntries(all) }),
    );
    fireEvent.click(foldButton(view, 'ჯგუფი 2'));
    expect(renderedLaneIds(view)).toEqual(['video']);
    expect(laneHeight(view, 'video')).toBe(
      fitLaneHeights({
        visibleRowsHeight: visibleRows - GROUP_ROW_PX,
        lanes: fitEntries(['video']),
      })[0],
    );
    fireEvent.click(foldButton(view, 'ჯგუფი 2'));
    expect(all.map((id) => laneHeight(view, id))).toEqual(expanded);
  });

  it('UC7 a hidden active lane marks its collapsed group and still receives library adds', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    clickLane(view, 'SFX');
    expect(live(api).activeTrackId).toBe('sfx');
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    const row = view.container.querySelector<HTMLElement>('[data-group-id]');
    expect(row?.dataset.containsActive).toBe('true');
    expect(view.getByTestId('arrangement-group-header').className).toContain('border-l-brand');
    act(() => live(api).selectSource('hit'));
    fireEvent.keyDown(document.body, { key: 'Enter', code: 'Enter' });
    const added = live(api)
      .getArrangement()
      .clips.filter((clip) => !['cm', 'cm2', 'cs', 'cx'].includes(clip.id));
    expect(added.map((clip) => clip.trackId)).toEqual(['sfx']);
    expect(overviewBlocks(view)).toHaveLength(3);
    clickLane(view, 'მუსიკა');
    expect(
      view.container.querySelector<HTMLElement>('[data-group-id]')?.dataset.containsActive,
    ).toBe(undefined);
  });

  it('UC8 Undo shows the lanes, Redo restores the collapsed group without pruning', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    expect(view.container.querySelectorAll('[data-group-id]')).toHaveLength(0);
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    act(() => live(api).selectClips(['cs']));
    fireEvent.keyDown(document.body, { key: 'y', code: 'KeyY', ctrlKey: true });
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(foldButton(view, 'ჯგუფი 1').getAttribute('aria-expanded')).toBe('false');
    expect(live(api).getSelectedClipIds()).toEqual(['cs']);
    expect(
      overviewBlocks(view).find((block) => block.dataset.overviewClipId === 'cs')?.dataset
        .overviewSelected,
    ).toBe('true');
    const name = groupName(view, 'ჯგუფი 1');
    fireEvent.click(name);
    name.focus();
    pressGroupKey(true, name);
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    expect(document.activeElement).toBe(laneName(view, 'სტემები'));
  });

  it('UC9 F1 focus moves to the new group name after Ctrl+G so F2 works at once', async () => {
    const { view } = await mountGroupsWorkspace();
    const stems = laneName(view, 'სტემები');
    stems.focus();
    fireEvent.click(stems);
    const sfx = laneName(view, 'SFX');
    sfx.focus();
    fireEvent.click(sfx, { shiftKey: true });
    pressGroupKey(false, sfx);
    const group = groupName(view, 'ჯგუფი 1');
    expect(document.activeElement).toBe(group);
    fireEvent.keyDown(group, { key: 'F2', code: 'F2' });
    expect(document.activeElement).toBe(view.getByTestId('arrangement-group-name-input'));
  });

  it('UC9 F1 from BODY, and F2 after Ctrl+Shift+G focus lands on the first child, never BODY', async () => {
    const { view } = await mountGroupsWorkspace();
    clickLane(view, 'მუსიკა');
    clickLane(view, 'სტემები', { shiftKey: true });
    expect(document.activeElement).toBe(document.body);
    pressGroupKey();
    const group = groupName(view, 'ჯგუფი 1');
    expect(document.activeElement).toBe(group);
    pressGroupKey(true, group);
    expect(document.activeElement).toBe(laneName(view, 'მუსიკა'));
    expect(document.activeElement).not.toBe(document.body);
  });

  it('UC10 a clip dragged onto a collapsed group row keeps its music lane target', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    const y = layoutRows(view);
    expect(rowOrder(view)).toEqual(['video:-', 'music:-', 'group:ჯგუფი 1:0']);
    expect(dragClipVertically(view, api, 'cm2', y.music, [y.group, y.group])).toEqual([null, null]);
    expect(clipTrack(api, 'cm2')).toBe('music');
  });

  it('UC10b a marquee across a collapsed middle group never selects its hidden clips', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupMusicAndStems(view);
    pressU();
    expect(rowOrder(view)).toEqual(['video:-', 'group:ჯგუფი 1:0', 'sfx:-']);
    const y = layoutRows(view);
    const body = view.container.querySelector<HTMLElement>(
      '[data-track-id="video"] [data-grid-seconds]',
    );
    if (!body) {
      throw new Error('video lane body missing');
    }
    fireEvent.pointerDown(body, {
      button: 0,
      buttons: 1,
      pointerId: 3,
      clientX: HEADER_PX + 7 * PX_PER_SECOND,
      clientY: y.video,
    });
    fireEvent.pointerMove(window, {
      pointerId: 3,
      clientX: HEADER_PX + 3 * PX_PER_SECOND,
      clientY: y.sfx,
    });
    fireEvent.pointerUp(window, {
      pointerId: 3,
      clientX: HEADER_PX + 3 * PX_PER_SECOND,
      clientY: y.sfx,
    });
    expect([...live(api).selectedClipIds]).toEqual(['cx']);
  });

  it('UC11 collapsing while playing restarts no sources and leaves the arrangement untouched', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const sources = vi.spyOn(FakeAudioContext.prototype, 'createBufferSource');
    const before = live(api).getArrangement();
    const positionBefore = live(api).getLivePosition();
    pressU();
    fireEvent.click(foldButton(view, 'ჯგუფი 1'));
    pressU();
    fakeClock.base -= 0.5;
    expect(sources).toHaveBeenCalledTimes(0);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThan(positionBefore);
    expect(live(api).getArrangement()).toBe(before);
    expect(withoutTrackGroups(before).tracks.map((track) => track.id)).toEqual([
      'video',
      'music',
      'stems',
      'sfx',
    ]);
    act(() => live(api).togglePlayback());
  });

  it('UC1 Space on the focused fold button toggles the group and does not start playback', async () => {
    const { api, view } = await mountGroupsWorkspace();
    groupStemsAndSfx(view);
    const fold = foldButton(view, 'ჯგუფი 1');
    fold.focus();
    const down = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      fold.dispatchEvent(down);
    });
    fireEvent.keyUp(fold, { key: ' ', code: 'Space' });
    expect(down.defaultPrevented).toBe(true);
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    expect(live(api).isPlaying).toBe(false);
    fireEvent.keyDown(fold, { key: ' ', code: 'Space', repeat: true });
    expect(renderedLaneIds(view)).toEqual(['video', 'music']);
    fireEvent.keyDown(fold, { key: ' ', code: 'Space' });
    expect(renderedLaneIds(view)).toEqual(['video', 'music', 'stems', 'sfx']);
    expect(live(api).isPlaying).toBe(false);
  });

  it('UC12 the shortcut hint lists the group keys and track fold stays independent', async () => {
    const { view } = await mountGroupsWorkspace();
    expect(view.getByTestId('arrangement-shortcut-hint').textContent).toContain(
      'Ctrl+G / Ctrl+Shift+G · F2 · U',
    );
    groupStemsAndSfx(view);
    const stemsFold = () =>
      view.container.querySelector<HTMLElement>(
        '[data-track-id="stems"] [data-testid="arrangement-track-fold"]',
      );
    const fold = stemsFold();
    if (!fold) {
      throw new Error('stems fold missing');
    }
    fireEvent.click(fold);
    expect(stemsFold()?.getAttribute('aria-expanded')).toBe('false');
    pressU();
    pressU();
    expect(stemsFold()?.getAttribute('aria-expanded')).toBe('false');
  });
});
