import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementClipView } from '~/components/arrangement/ArrangementClip';
import { ArrangementLoopBrace } from '~/components/arrangement/ArrangementLoopBrace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioLoopStrings } from '../strings';

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

const reentryCollection: WorkspaceCollection = {
  id: 'reentry',
  label: 'reentry',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'reentry', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function reentryArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'c1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
    ],
    loop: { start: 2, end: 4, enabled: true },
  };
}

const PX_PER_SECOND = 40;

interface ReentryApiRef {
  current: ArrangementContextValue | null;
}

function ReentryClip({ api }: { api: ReentryApiRef }) {
  const workspace = useArrangement();
  api.current = workspace;
  const clip = workspace.arrangement.clips.find((entry) => entry.id === 'c1');
  if (!clip) {
    return null;
  }
  return (
    <ArrangementClipView
      clip={clip}
      title="Song"
      peaks={undefined}
      isVideo={false}
      audioNote={null}
      pxPerSecond={PX_PER_SECOND}
      isSelected={workspace.selectedClipIds.includes(clip.id)}
      isLaneMoveSource={false}
      range={null}
      sourceDurations={workspace.sourceDurations}
      getArrangement={workspace.getArrangement}
      previewArrangement={workspace.previewArrangement}
      commitArrangement={workspace.commitArrangement}
      selectClip={workspace.selectClip}
      toggleClipSelection={workspace.toggleClipSelection}
      getSelectedClipIds={workspace.getSelectedClipIds}
      setTimeRange={workspace.setTimeRange}
      setActiveTrack={workspace.setActiveTrack}
      seekTo={workspace.seekTo}
      setStatus={workspace.setStatus}
      claimPointerGesture={workspace.claimPointerGesture}
      setClipLaneDrag={workspace.setClipLaneDrag}
    />
  );
}

function ReentryApiProbe({ api }: { api: ReentryApiRef }) {
  api.current = useArrangement();
  return null;
}

function ReentryHarness({ api, show }: { api: ReentryApiRef; show: 'clip' | 'brace' | 'none' }) {
  return (
    <ArrangementProvider collection={reentryCollection} initialArrangement={reentryArrangement()}>
      {show === 'clip' ? <ReentryClip api={api} /> : null}
      {show === 'brace' ? <ArrangementLoopBrace seconds={20} pxPerSecond={PX_PER_SECOND} /> : null}
      <ReentryApiProbe api={api} />
    </ArrangementProvider>
  );
}

function stubPointerCapture(element: HTMLElement, mode: 'ok' | 'throw') {
  Object.defineProperty(element, 'setPointerCapture', {
    configurable: true,
    value: () => {
      if (mode === 'throw') {
        throw new Error('capture failed');
      }
    },
  });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function liveApi(api: ReentryApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountReentryClip(mode: 'ok' | 'throw') {
  const api: ReentryApiRef = { current: null };
  const view = render(<ReentryHarness api={api} show="clip" />);
  await flushLoads();
  const root = view.container.querySelector<HTMLElement>('[data-clip-id="c1"]');
  if (!root) {
    throw new Error('clip not rendered');
  }
  stubPointerCapture(root, mode);
  const header = root.firstElementChild;
  const body = root.children[1];
  const trimStart = root.querySelector<HTMLElement>('[title="Trim — left edge"]');
  if (!(header instanceof HTMLElement) || !(body instanceof HTMLElement) || !trimStart) {
    throw new Error('clip parts not rendered');
  }
  return { api, view, root, header, body, trimStart };
}

async function mountReentryBrace(mode: 'ok' | 'throw') {
  const api: ReentryApiRef = { current: null };
  const view = render(<ReentryHarness api={api} show="brace" />);
  await flushLoads();
  const brace = view.getByTestId('arrangement-loop-brace');
  stubPointerCapture(brace, mode);
  return { api, view, brace, endEdge: view.getByTestId('arrangement-loop-end-edge') };
}

describe('D-23 gesture re-entry (C-R4-02, R5-B1u)', () => {
  beforeEach(() => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('ArrangementClip', () => {
    it.each([
      ['header', 'header'],
      ['trim edge', 'trimStart'],
      ['body (range)', 'body'],
    ] as const)('two pointers on the %s release every gesture', async (_label, part) => {
      const parts = await mountReentryClip('ok');
      const target = parts[part];
      fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(parts.root, { pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 100 });
      expect(liveApi(parts.api).isPointerGestureActive()).toBe(false);
      expect(liveApi(parts.api).undoLabel).toBeNull();
    });

    it('lets the first pointer finish its drag with exactly one history entry', async () => {
      const { api, root, header } = await mountReentryClip('ok');
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(root, { pointerId: 1, clientX: 180 });
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 2, clientX: 300 });
      fireEvent.pointerMove(root, { pointerId: 2, clientX: 400 });
      fireEvent.pointerUp(root, { pointerId: 2, clientX: 400 });
      fireEvent.pointerUp(root, { pointerId: 1, clientX: 180 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
      expect(liveApi(api).arrangement.clips[0].start).toBe(4);
      expect(liveApi(api).undoLabel).toBe('Move clip');
      act(() => liveApi(api).undo());
      expect(liveApi(api).arrangement.clips[0].start).toBe(2);
      expect(liveApi(api).undoLabel).toBeNull();
    });

    it('ignores a second pointer without changing the selection', async () => {
      const { api, root, header } = await mountReentryClip('ok');
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      expect(liveApi(api).selectedClipIds).toEqual(['c1']);
      fireEvent.pointerDown(header, {
        button: 0,
        buttons: 1,
        pointerId: 2,
        clientX: 100,
        ctrlKey: true,
      });
      expect(liveApi(api).selectedClipIds).toEqual(['c1']);
      fireEvent.pointerUp(root, { pointerId: 1, clientX: 100 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });

    it('starts no gesture for a pointerdown without a pressed button (R5-B1r stray event)', async () => {
      const { api, root, header } = await mountReentryClip('throw');
      act(() => liveApi(api).selectClip(null));
      fireEvent.pointerDown(header, { button: 0, buttons: 0, pointerId: 0, clientX: 0 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
      expect(liveApi(api).selectedClipIds).toEqual([]);
      fireEvent.pointerMove(root, { pointerId: 0, clientX: 200 });
      expect(liveApi(api).arrangement.clips[0].start).toBe(2);
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 7, clientX: 100 });
      fireEvent.pointerMove(root, { pointerId: 7, clientX: 140 });
      fireEvent.pointerUp(root, { pointerId: 7, clientX: 140 });
      expect(liveApi(api).arrangement.clips[0].start).toBe(3);
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
      expect(liveApi(api).undoLabel).toBe('Move clip');
    });

    it('releases every gesture when the clip unmounts with two pointers down', async () => {
      const { api, view, header } = await mountReentryClip('ok');
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      expect(liveApi(api).isPointerGestureActive()).toBe(true);
      view.rerender(<ReentryHarness api={api} show="none" />);
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });

    it('releases an uncaptured gesture on a window pointerup after a second pointerdown', async () => {
      const { api, header } = await mountReentryClip('throw');
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(window, { pointerId: 1 });
      fireEvent.pointerUp(window, { pointerId: 2 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });

    it('ends a stale gesture of the same pointer without history and stays draggable', async () => {
      const { api, root, header } = await mountReentryClip('ok');
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(root, { pointerId: 1, clientX: 180 });
      expect(liveApi(api).arrangement.clips[0].start).toBe(4);
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      expect(liveApi(api).arrangement.clips[0].start).toBe(2);
      fireEvent.pointerUp(root, { pointerId: 1, clientX: 100 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
      expect(liveApi(api).undoLabel).toBeNull();
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(root, { pointerId: 1, clientX: 140 });
      fireEvent.pointerUp(root, { pointerId: 1, clientX: 140 });
      expect(liveApi(api).arrangement.clips[0].start).toBe(3);
      expect(liveApi(api).undoLabel).toBe('Move clip');
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });
  });

  describe('ArrangementLoopBrace', () => {
    it.each([
      ['body', 'brace'],
      ['edge', 'endEdge'],
    ] as const)('two pointers on the brace %s release every gesture', async (_label, part) => {
      const parts = await mountReentryBrace('ok');
      const target = parts[part];
      fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(parts.brace, { pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(parts.brace, { pointerId: 1, clientX: 100 });
      expect(liveApi(parts.api).isPointerGestureActive()).toBe(false);
      expect(liveApi(parts.api).undoLabel).toBeNull();
    });

    it('releases every gesture when the brace unmounts with two pointers down', async () => {
      const { api, view, brace } = await mountReentryBrace('ok');
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      view.rerender(<ReentryHarness api={api} show="none" />);
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });

    it('releases an uncaptured brace gesture on a window pointerup after a second pointerdown', async () => {
      const { api, brace } = await mountReentryBrace('throw');
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 2, clientX: 100 });
      fireEvent.pointerUp(window, { pointerId: 1 });
      fireEvent.pointerUp(window, { pointerId: 2 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });

    it('ends a stale brace gesture without history and stays draggable', async () => {
      const { api, brace } = await mountReentryBrace('ok');
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(brace, { pointerId: 1, clientX: 180 });
      expect(liveApi(api).arrangement.loop).toEqual({ start: 4, end: 6, enabled: true });
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      expect(liveApi(api).arrangement.loop).toEqual({ start: 2, end: 4, enabled: true });
      fireEvent.pointerUp(brace, { pointerId: 1, clientX: 100 });
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
      expect(liveApi(api).undoLabel).toBeNull();
      fireEvent.pointerDown(brace, { button: 0, buttons: 1, pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(brace, { pointerId: 1, clientX: 140 });
      fireEvent.pointerUp(brace, { pointerId: 1, clientX: 140 });
      expect(liveApi(api).arrangement.loop).toEqual({ start: 3, end: 5, enabled: true });
      expect(liveApi(api).undoLabel).toBe(studioLoopStrings.historyRange);
      expect(liveApi(api).isPointerGestureActive()).toBe(false);
    });
  });
});
