import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  isImeCompositionKeyDown,
  isNativeImeCompositionKeyDown,
} from '~/components/arrangement/studio-ime-composition';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const imeCollection: WorkspaceCollection = {
  id: 'ime-composition',
  label: 'ime-composition',
  origin: 'demo',
  notice: 'Synthetic demo stems.',
  sources: [{ id: 'hit', title: 'Hit', collectionLabel: 'ime', kind: 'sfx', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

function imeArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) =>
      track.id === 'music' || track.id === 'sfx' ? { ...track, groupId: 'stems' } : track,
    ),
    groups: [{ id: 'stems', name: 'Stems', parentId: null }],
    clips: [{ id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 }],
  };
}

interface ImeApiRef {
  current: WorkspaceProbeValue | null;
}

function ImeProbe({ api }: { api: ImeApiRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: ImeApiRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('innerWidth', 1440);
  vi.stubGlobal('innerHeight', 900);
  localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function mountImeWorkspace() {
  const api: ImeApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={imeCollection} initialArrangement={imeArrangement()}>
      <StudioWorkspace />
      <ImeProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const snapshot = () => ({
    arrangement: JSON.stringify(live(api).getArrangement()),
    undo: live(api).undoLabel,
    status: live(api).status,
    statusSequence: live(api).statusSequence,
  });
  return { api, view, snapshot };
}

type ImeKey = 'Enter' | 'Escape' | 'ArrowDown';
type ImeForm = 'isComposing' | 'keyCode229';

const IME_FORMS: readonly ImeForm[] = ['isComposing', 'keyCode229'];

function pressComposingKey(target: Element, key: ImeKey, form: ImeForm): boolean {
  return fireEvent.keyDown(
    target,
    form === 'isComposing'
      ? { key, code: key, isComposing: true }
      : { key, code: key, keyCode: 229 },
  );
}

function inputById(view: ReturnType<typeof render>, testId: string): HTMLInputElement {
  const element = view.getByTestId(testId);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`${testId} is not an input`);
  }
  return element;
}

const SHEET_NAME = 'Keyboard shortcuts';
const FOOTER_NAME = 'Keyboard shortcuts (?)';

function sheetDialog(view: ReturnType<typeof render>): HTMLElement | null {
  return view.queryByRole('dialog', { name: SHEET_NAME });
}

function sheetSearchInput(view: ReturnType<typeof render>): HTMLInputElement {
  const dialog = sheetDialog(view);
  if (!dialog) {
    throw new Error('sheet not open');
  }
  const input = dialog.querySelector('input[type="search"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('sheet search missing');
  }
  return input;
}

function pressHeldRepeats(target: Element, key: ImeKey): boolean[] {
  return [0, 1, 2].map(() => fireEvent.keyDown(target, { key, code: key, repeat: true }));
}

describe('IME composition never clears, moves or closes Studio search fields (SYS-3 stage 2a)', () => {
  it('IME8 the native helper reads isComposing and keyCode 229 only, and the React helper delegates to it', () => {
    const native = (isComposing: boolean, keyCode: number) =>
      new KeyboardEvent('keydown', { key: 'Escape', isComposing, keyCode });
    expect(isNativeImeCompositionKeyDown(native(true, 27))).toBe(true);
    expect(isNativeImeCompositionKeyDown(native(false, 229))).toBe(true);
    expect(isNativeImeCompositionKeyDown(native(false, 27))).toBe(false);
    expect(isNativeImeCompositionKeyDown(native(false, 13))).toBe(false);
    expect(isImeCompositionKeyDown({ nativeEvent: native(false, 0), keyCode: 229 })).toBe(true);
    expect(isImeCompositionKeyDown({ nativeEvent: native(true, 0), keyCode: 27 })).toBe(true);
    expect(isImeCompositionKeyDown({ nativeEvent: native(false, 0), keyCode: 27 })).toBe(false);
  });

  it.each(
    IME_FORMS,
  )('IME9 Library search (%s): a composing Escape keeps the query and a composing ArrowDown keeps focus; held Escape repeats clear nothing; a plain Escape then clears and a plain ArrowDown moves to the first result', async (form) => {
    const { view, snapshot } = await mountImeWorkspace();
    const search = inputById(view, 'arrangement-library-search');
    const focusFrames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      focusFrames.push(callback);
      return focusFrames.length;
    });

    act(() => search.focus());
    fireEvent.change(search, { target: { value: 'Hi' } });
    const before = snapshot();
    expect(pressComposingKey(search, 'Escape', form)).toBe(true);
    expect(search.value).toBe('Hi');
    expect(document.activeElement).toBe(search);
    expect(pressComposingKey(search, 'ArrowDown', form)).toBe(true);
    expect(document.activeElement).toBe(search);
    expect(focusFrames).toHaveLength(0);
    expect(pressHeldRepeats(search, 'Escape')).toStrictEqual([false, false, false]);
    expect(search.value).toBe('Hi');
    expect(document.activeElement).toBe(search);
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(search, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(search.value).toBe('');
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: 'Hi' } });
    expect(fireEvent.keyDown(search, { key: 'ArrowDown', code: 'ArrowDown' })).toBe(false);
    expect(focusFrames).toHaveLength(1);
    act(() => {
      for (const callback of focusFrames) {
        callback(0);
      }
    });
    expect(document.activeElement?.getAttribute('role')).toBe('option');
    expect(document.activeElement?.textContent ?? '').toContain('Hit');
  });

  it.each(
    IME_FORMS,
  )('IME10 shortcut sheet search (%s): a composing Escape and held Escape repeats keep the sheet open with focus and query; a plain Escape then closes it and focus returns to the footer button', async (form) => {
    const { view, snapshot } = await mountImeWorkspace();
    act(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    fireEvent.keyDown(document.body, { key: '?', code: 'Slash', shiftKey: true });
    const search = sheetSearchInput(view);
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: 'pl' } });
    const before = snapshot();
    const documentKeydown = vi.fn();
    document.addEventListener('keydown', documentKeydown);
    expect(pressComposingKey(search, 'Escape', form)).toBe(true);
    document.removeEventListener('keydown', documentKeydown);
    expect(documentKeydown).not.toHaveBeenCalled();
    expect(sheetDialog(view)).not.toBeNull();
    expect(document.activeElement).toBe(search);
    expect(search.value).toBe('pl');
    expect(pressHeldRepeats(search, 'Escape')).toStrictEqual([false, false, false]);
    expect(sheetDialog(view)).not.toBeNull();
    expect(sheetSearchInput(view)).toBe(search);
    expect(document.activeElement).toBe(search);
    expect(search.value).toBe('pl');
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(search, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(sheetDialog(view)).toBeNull();
    expect(document.activeElement).toBe(view.getByRole('button', { name: FOOTER_NAME }));
  });
});
