import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioExportStrings } from '../strings';

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

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const VIDEO_LANE_Y = 50;
const VIDEO_FADE_IN_HANDLE = 'arrangement-video-fade-in-handle';
const VIDEO_FADE_OUT_HANDLE = 'arrangement-video-fade-out-handle';
const AUDIO_FADE_IN_HANDLE = 'arrangement-clip-fade-in-handle';
const VIDEO_FADE_OVERLAY = 'arrangement-video-fade';
const EXPORT_VIDEO_FADES = 'arrangement-export-video-fades';
const EXPORT_VIDEO_FADES_TEXT = studioExportStrings.videoFadesPreviewNote;
const VIDEO_RENDER_REASON_TEXT = studioExportStrings.videoRenderReason;
const LIBRARY_RECT = { left: 0, top: 84, width: 288, height: 767 };
const LIBRARY_BODY_RECT = { left: 0, top: 233, width: 288, height: 451 };

const videoFadeCollection: WorkspaceCollection = {
  id: 'video-fade',
  label: 'video-fade',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'video-fade', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function clipAt(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  fades: Pick<ArrangementClip, 'fadeIn' | 'fadeOut'> = {},
): ArrangementClip {
  return {
    id,
    trackId,
    sourceId: trackId === 'video' ? 'film' : 'song',
    start,
    sourceOffset: 0,
    duration,
    ...fades,
  };
}

function videoFadeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, clips };
}

interface VideoFadeApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function VideoFadeProbe({ api }: { api: VideoFadeApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: VideoFadeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function setPositionOf(api: VideoFadeApiRef, position: number) {
  const store = api.position;
  if (!store) {
    throw new Error('position store not mounted');
  }
  act(() => store.setPosition(position));
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

function toDomRect(rect: { left: number; top: number; width: number; height: number }) {
  return new DOMRect(rect.left, rect.top, rect.width, rect.height);
}

function mockLibraryLayoutRects() {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.getAttribute('data-testid') === 'arrangement-library') {
      return toDomRect(LIBRARY_RECT);
    }
    if (this.firstElementChild?.getAttribute('data-testid') === 'arrangement-library-tree') {
      return toDomRect(LIBRARY_BODY_RECT);
    }
    return original.call(this);
  });
}

async function mountVideoFadeWorkspace(clips: ArrangementClip[]) {
  const api: VideoFadeApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={videoFadeCollection}
      initialArrangement={videoFadeArrangement(clips)}
    >
      <StudioWorkspace />
      <VideoFadeProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const clipRoot = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    if (!root) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return root;
  };
  const handleOf = (clipId: string, testId: string) => {
    const handle = clipRoot(clipId).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!handle) {
      throw new Error(`${testId} missing on ${clipId}`);
    }
    stubCapture(handle);
    return handle;
  };
  const overlay = () => view.getByTestId(VIDEO_FADE_OVERLAY);
  return { api, view, clipRoot, handleOf, overlay };
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function undoAll(api: VideoFadeApiRef): number {
  let steps = 0;
  while (live(api).undoLabel !== null && steps < 20) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
}

function pressUndo() {
  fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
}

function pressRedo() {
  fireEvent.keyDown(document.body, { key: 'y', code: 'KeyY', ctrlKey: true });
}

const press = { button: 0, buttons: 1 };

function dragHandle(
  handle: HTMLElement,
  root: HTMLElement,
  dx: number,
  options: { cancel?: boolean } = {},
) {
  fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 100, clientY: VIDEO_LANE_Y });
  fireEvent.pointerMove(root, { pointerId: 1, clientX: 100 + dx, clientY: VIDEO_LANE_Y });
  const finish = options.cancel ? fireEvent.pointerCancel : fireEvent.pointerUp;
  finish(root, { pointerId: 1, clientX: 100 + dx, clientY: VIDEO_LANE_Y });
}

function overlayState(overlay: HTMLElement) {
  return { picture: overlay.dataset.videoOpacity, overlay: Number(overlay.style.opacity) };
}

let performanceNow = 1000;

beforeEach(() => {
  performanceNow = 1000;
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(performance, 'now').mockImplementation(() => performanceNow);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SRW-19 video fade handles (VU1)', () => {
  it('VU1 a video clip gets its own fade handles and no audio-fade testids; audio is unchanged', async () => {
    const { clipRoot } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6),
      clipAt('m1', 'music', 0, 10),
    ]);
    const video = clipRoot('v1');
    const fadeIn = video.querySelector<HTMLElement>(`[data-testid="${VIDEO_FADE_IN_HANDLE}"]`);
    const fadeOut = video.querySelector<HTMLElement>(`[data-testid="${VIDEO_FADE_OUT_HANDLE}"]`);
    expect(fadeIn?.title).toBe('Video Fade In — სურათი (ხმა არ იცვლება) · drag · double-click = 0');
    expect(fadeOut?.title).toBe(
      'Video Fade Out — სურათი (ხმა არ იცვლება) · drag · double-click = 0',
    );
    expect(fadeIn?.style.left).toBe('0px');
    expect(fadeOut?.style.right).toBe('0px');
    expect(video.querySelector('[data-testid^="arrangement-clip-fade-"]')).toBeNull();
    expect(video.querySelector('[data-testid="arrangement-video-fade-ramps"]')).toBeNull();
    const music = clipRoot('m1');
    expect(
      music.querySelector(`[data-testid="${AUDIO_FADE_IN_HANDLE}"]`)?.getAttribute('title'),
    ).toBe('Fade In — drag · double-click = 0');
    expect(music.querySelector('[data-testid^="arrangement-video-fade-"]')).toBeNull();
  });

  it('VU1 Env mode, a narrow video clip and a folded video lane show no video handles', async () => {
    const { view, clipRoot } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6, { fadeIn: 1 }),
      clipAt('v2', 'video', 10, 0.5),
    ]);
    expect(clipRoot('v2').querySelector('[data-testid^="arrangement-video-fade-"]')).toBeNull();
    expect(clipRoot('v1').querySelectorAll('[data-testid$="-handle"]')).toHaveLength(2);
    fireEvent.click(view.getByTestId('arrangement-envelope-toggle'));
    expect(clipRoot('v1').querySelector('[data-testid$="-handle"]')).toBeNull();
    fireEvent.click(view.getByTestId('arrangement-envelope-toggle'));
    expect(clipRoot('v1').querySelectorAll('[data-testid$="-handle"]')).toHaveLength(2);
    const fold = view.container
      .querySelector<HTMLElement>('[data-track-id="video"]')
      ?.querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
    if (!fold) {
      throw new Error('video fold button missing');
    }
    fireEvent.click(fold);
    expect(clipRoot('v1').querySelector('[data-testid^="arrangement-video-fade-"]')).toBeNull();
    expect(clipRoot('v1').dataset.fadeIn).toBe('1.000');
  });
});

describe('SRW-19 video fade gestures (VU2)', () => {
  it('VU2 a drag sets the fade with one Video Fade In entry; undo and redo restore it', async () => {
    const { api, view, clipRoot, handleOf } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6),
    ]);
    const root = clipRoot('v1');
    fireEvent.pointerDown(handleOf('v1', VIDEO_FADE_IN_HANDLE), {
      ...press,
      pointerId: 1,
      clientX: 100,
      clientY: VIDEO_LANE_Y,
    });
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: VIDEO_LANE_Y });
    expect(statusText(view)).toBe('Video Fade In: 1.000 წმ');
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 140, clientY: VIDEO_LANE_Y });
    expect(clipRoot('v1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBe('Video Fade In');
    expect(statusText(view)).toBe('Video Fade In: 1.000 წმ.');
    expect(
      clipRoot('v1')
        .querySelector('[data-testid="arrangement-video-fade-ramps"] path')
        ?.getAttribute('d'),
    ).toBe('M0 0L0 1L40 0Z');
    expect(
      clipRoot('v1')
        .querySelector('[data-testid="arrangement-video-fade-ramps"]')
        ?.getAttribute('class'),
    ).toContain('text-accent');
    pressUndo();
    expect(clipRoot('v1').dataset.fadeIn).toBe('0.000');
    expect(live(api).arrangement.clips[0]).toStrictEqual(clipAt('v1', 'video', 2, 6));
    pressRedo();
    expect(clipRoot('v1').dataset.fadeIn).toBe('1.000');
    expect(undoAll(api)).toBe(1);
  });

  it('VU2 the fade-out drag, the guarded double-click reset and a cancelled drag', async () => {
    const { api, view, clipRoot, handleOf } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6, { fadeIn: 1 }),
    ]);
    dragHandle(handleOf('v1', VIDEO_FADE_OUT_HANDLE), clipRoot('v1'), -80);
    expect(clipRoot('v1').dataset.fadeOut).toBe('2.000');
    expect(live(api).undoLabel).toBe('Video Fade Out');
    expect(statusText(view)).toBe('Video Fade Out: 2.000 წმ.');
    performanceNow += 200;
    fireEvent.doubleClick(handleOf('v1', VIDEO_FADE_OUT_HANDLE));
    expect(clipRoot('v1').dataset.fadeOut).toBe('2.000');
    performanceNow += 400;
    fireEvent.doubleClick(handleOf('v1', VIDEO_FADE_OUT_HANDLE));
    expect(clipRoot('v1').dataset.fadeOut).toBe('0.000');
    expect(live(api).undoLabel).toBe('Video Fade Out');
    expect(statusText(view)).toBe('Video Fade Out: 0.000 წმ.');
    fireEvent.doubleClick(handleOf('v1', VIDEO_FADE_OUT_HANDLE));
    expect(undoAll(api)).toBe(2);
    expect(clipRoot('v1').dataset.fadeIn).toBe('1.000');
    dragHandle(handleOf('v1', VIDEO_FADE_IN_HANDLE), clipRoot('v1'), 40, { cancel: true });
    expect(clipRoot('v1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBeNull();
  });

  it('VU2 an audio clip next to a video clip still uses the audio fade path', async () => {
    const { api, clipRoot, handleOf } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6),
      clipAt('m1', 'music', 0, 10),
    ]);
    dragHandle(handleOf('m1', AUDIO_FADE_IN_HANDLE), clipRoot('m1'), 40);
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBe('Fade In');
    expect(clipRoot('v1').dataset.fadeIn).toBe('0.000');
  });
});

describe('SRW-19 video fade preview overlay (VU3)', () => {
  it('VU3 the overlay follows the stopped position and a fade edit without playing', async () => {
    const { api, view, overlay, clipRoot, handleOf } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6, { fadeIn: 1, fadeOut: 2 }),
    ]);
    const element = overlay();
    expect(element.parentElement).toBe(view.getByTestId('arrangement-video-box'));
    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.className).toContain('bg-background');
    expect(element.className).toContain('pointer-events-none');
    expect(overlayState(element)).toEqual({ picture: '1.000', overlay: 0 });
    setPositionOf(api, 2.5);
    expect(overlayState(element)).toEqual({ picture: '0.500', overlay: 0.5 });
    setPositionOf(api, 2.25);
    expect(overlayState(element)).toEqual({ picture: '0.250', overlay: 0.75 });
    setPositionOf(api, 4);
    expect(overlayState(element)).toEqual({ picture: '1.000', overlay: 0 });
    setPositionOf(api, 7.5);
    expect(overlayState(element)).toEqual({ picture: '0.250', overlay: 0.75 });
    setPositionOf(api, 2.5);
    dragHandle(handleOf('v1', VIDEO_FADE_IN_HANDLE), clipRoot('v1'), 40);
    expect(clipRoot('v1').dataset.fadeIn).toBe('2.000');
    expect(overlayState(element)).toEqual({ picture: '0.250', overlay: 0.75 });
    pressUndo();
    expect(overlayState(element)).toEqual({ picture: '0.500', overlay: 0.5 });
  });

  it('VU3 the first render already shows the value at the current position', async () => {
    const { api, view } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 0, 6, { fadeIn: 2 }),
    ]);
    expect(overlayState(view.getByTestId(VIDEO_FADE_OVERLAY))).toEqual({
      picture: '0.000',
      overlay: 1,
    });
    setPositionOf(api, 1);
    expect(overlayState(view.getByTestId(VIDEO_FADE_OVERLAY))).toEqual({
      picture: '0.500',
      overlay: 0.5,
    });
  });

  it('VU3 an equal 3-decimal value is never rewritten', async () => {
    const { api, overlay } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6, { fadeIn: 1 }),
    ]);
    const element = overlay();
    setPositionOf(api, 2.5);
    const observer = new MutationObserver(() => undefined);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'data-video-opacity'],
    });
    setPositionOf(api, 2.5002);
    setPositionOf(api, 2.5004);
    expect(observer.takeRecords()).toHaveLength(0);
    setPositionOf(api, 6);
    setPositionOf(api, 6.5);
    expect(observer.takeRecords()).toHaveLength(2);
    setPositionOf(api, 7);
    expect(observer.takeRecords()).toHaveLength(0);
    observer.disconnect();
    expect(overlayState(element)).toEqual({ picture: '1.000', overlay: 0 });
  });

  it('VU3 the overlay stays inside the floating box', async () => {
    const { api, view, overlay } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6, { fadeIn: 1 }),
    ]);
    mockLibraryLayoutRects();
    const box = view.getByTestId('arrangement-video-box');
    stubCapture(box);
    fireEvent.click(view.getByTestId('arrangement-video-expand'));
    expect(box.dataset.videoFloating).toBe('true');
    expect(overlay().parentElement).toBe(box);
    setPositionOf(api, 2.5);
    expect(overlayState(overlay())).toEqual({ picture: '0.500', overlay: 0.5 });
  });
});

describe('SRW-19 export dialog video fade note (VU4)', () => {
  it('VU4 the note appears only with an effective video fade; the video option stays disabled', async () => {
    const { api, view, clipRoot, handleOf } = await mountVideoFadeWorkspace([
      clipAt('v1', 'video', 2, 6),
      clipAt('m1', 'music', 0, 10, { fadeIn: 2 }),
    ]);
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.queryByTestId(EXPORT_VIDEO_FADES)).toBeNull();
    const reason = view.getByText(VIDEO_RENDER_REASON_TEXT);
    const videoOption = reason.closest('label')?.querySelector('input');
    expect(videoOption?.disabled).toBe(true);
    fireEvent.click(view.getByRole('button', { name: studioExportStrings.closeButton }));
    dragHandle(handleOf('v1', VIDEO_FADE_IN_HANDLE), clipRoot('v1'), 40);
    expect(live(api).undoLabel).toBe('Video Fade In');
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByTestId(EXPORT_VIDEO_FADES).textContent).toBe(EXPORT_VIDEO_FADES_TEXT);
    expect(
      view.getByText(VIDEO_RENDER_REASON_TEXT).closest('label')?.querySelector('input')?.disabled,
    ).toBe(true);
  });
});
