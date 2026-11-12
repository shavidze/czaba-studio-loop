import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { studioLabDemoCollection } from '~/data/studio-lab-demo';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { libraryNoticeStorageKey } from '../library-notice';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const NOTICE_TEXT = 'Synthetic demo stems — not CZABA catalogue audio.';
const DISMISS_NAME = 'Dismiss this notice';
const DEMO_STORAGE_KEY = 'czaba-studio-notice-dismissed:studio-lab-demo';

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
  currentTime = 0;
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

function noticeCollection(id: string): WorkspaceCollection {
  return {
    ...studioLabDemoCollection,
    id,
    sources: [{ id: 'song', title: 'Song', collectionLabel: id, kind: 'music', origin: 'demo' }],
    loadSource: () =>
      Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 })),
  };
}

function noticeArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface NoticeApiRef {
  current: ArrangementContextValue | null;
}

function NoticeProbe({ api }: { api: NoticeApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: NoticeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function noticeWorkspace(collection: WorkspaceCollection, api: NoticeApiRef) {
  return (
    <ArrangementProvider collection={collection} initialArrangement={noticeArrangement()}>
      <StudioWorkspace />
      <NoticeProbe api={api} />
    </ArrangementProvider>
  );
}

async function flushNoticeLoads() {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountNoticeWorkspace(collectionId: string) {
  const api: NoticeApiRef = { current: null };
  const view = render(noticeWorkspace(noticeCollection(collectionId), api));
  await flushNoticeLoads();
  const search = () => view.getByRole('searchbox', { name: 'Search the library' });
  const notice = () => view.queryByTestId('arrangement-library-notice');
  const dismiss = () => view.getByRole('button', { name: DISMISS_NAME });
  return { api, view, search, notice, dismiss };
}

describe('CALM-2b dismissible library notice (SABA-B-8)', () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('LN1: the demo workspace shows the one-sentence notice and a named dismiss button', async () => {
    const mounted = await mountNoticeWorkspace('ln1-demo');
    expect(studioLabDemoCollection.notice).toBe(NOTICE_TEXT);
    expect(mounted.notice()?.textContent).toBe(NOTICE_TEXT);
    const dismiss = mounted.dismiss();
    expect(dismiss.getAttribute('type')).toBe('button');
    expect(dismiss.getAttribute('title')).toBe(DISMISS_NAME);
    expect(mounted.view.getAllByRole('button', { name: DISMISS_NAME })).toHaveLength(1);
  });

  it('LN2: a click hides the notice, remembers it per collection and moves focus to the search field', async () => {
    const mounted = await mountNoticeWorkspace('studio-lab-demo');
    expect(libraryNoticeStorageKey('studio-lab-demo')).toBe(DEMO_STORAGE_KEY);
    fireEvent.click(mounted.dismiss());
    expect(mounted.notice()).toBeNull();
    expect(mounted.view.queryByRole('button', { name: DISMISS_NAME })).toBeNull();
    expect(window.localStorage.getItem(DEMO_STORAGE_KEY)).toBe('1');
    expect(document.activeElement).toBe(mounted.search());
  });

  it('LN3: a remembered dismissal hides only that collection notice and leaves the library intact', async () => {
    window.localStorage.setItem(libraryNoticeStorageKey('ln3-dismissed'), '1');
    const dismissed = await mountNoticeWorkspace('ln3-dismissed');
    expect(dismissed.notice()).toBeNull();
    expect(dismissed.view.queryByRole('button', { name: DISMISS_NAME })).toBeNull();
    expect(dismissed.search()).toBeDefined();
    expect(dismissed.view.getByRole('listbox', { name: 'Sounds' })).toBeDefined();
    expect(dismissed.view.getByRole('navigation', { name: 'Library sidebar' })).toBeDefined();
    dismissed.view.unmount();
    const other = await mountNoticeWorkspace('ln3-other');
    expect(other.notice()?.textContent).toBe(NOTICE_TEXT);
  });

  it('LN4: when storage refuses the write the notice still hides for this page', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const mounted = await mountNoticeWorkspace('ln4-storage-error');
    fireEvent.click(mounted.dismiss());
    expect(setItem).toHaveBeenCalled();
    expect(mounted.notice()).toBeNull();
    expect(window.localStorage.getItem(libraryNoticeStorageKey('ln4-storage-error'))).toBeNull();
  });

  it('LN5: the server snapshot shows the notice even when this browser dismissed it', () => {
    window.localStorage.setItem(libraryNoticeStorageKey('ln5-server'), '1');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const api: NoticeApiRef = { current: null };
    const html = renderToString(noticeWorkspace(noticeCollection('ln5-server'), api));
    expect(html).toContain(NOTICE_TEXT);
    expect(html).toContain('data-testid="arrangement-library-notice"');
  });

  it('LN6: Enter on the focused dismiss button hides the notice and adds no clip', async () => {
    const mounted = await mountNoticeWorkspace('ln6-enter');
    expect(live(mounted.api).sourceStates.song?.status).toBe('ready');
    const dismiss = mounted.dismiss();
    dismiss.focus();
    fireEvent.keyDown(dismiss, { key: 'Enter' });
    fireEvent.click(dismiss);
    expect(mounted.notice()).toBeNull();
    expect(document.activeElement).toBe(mounted.search());
    expect(live(mounted.api).arrangement.clips).toHaveLength(0);
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(live(mounted.api).arrangement.clips).toHaveLength(1);
  });
});
