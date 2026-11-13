import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioLibraryPanelStrings } from '../strings';
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

const panelCollection: WorkspaceCollection = {
  id: 'panel-held-enter',
  label: 'panel-held-enter',
  origin: 'demo',
  notice: 'Synthetic demo stems.',
  sources: [{ id: 'hit', title: 'Hit', collectionLabel: 'mh', kind: 'sfx', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const MIXER_CLIPS: ArrangementClip[] = [
  { id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 },
];

function panelArrangement(): Arrangement {
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
    clips: MIXER_CLIPS,
  };
}

interface PanelApiRef {
  current: WorkspaceProbeValue | null;
}

function PanelProbe({ api }: { api: PanelApiRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: PanelApiRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

let inputClicks = 0;

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  inputClicks = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('innerWidth', 1440);
  vi.stubGlobal('innerHeight', 900);
  localStorage.clear();
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {
    inputClicks += 1;
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

interface EnterModifiers {
  ctrlKey?: boolean;
}

function pressEnter(button: Element, repeat: boolean, modifiers: EnterModifiers = {}): boolean {
  const notPrevented = fireEvent.keyDown(button, {
    key: 'Enter',
    code: 'Enter',
    repeat,
    ...modifiers,
  });
  if (notPrevented && button instanceof HTMLButtonElement && !button.disabled) {
    fireEvent.click(button, modifiers);
  }
  return notPrevented;
}

async function mountPanelWorkspace() {
  const api: PanelApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={panelCollection} initialArrangement={panelArrangement()}>
      <StudioWorkspace />
      <PanelProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const attributes = (selector: string, name: string) =>
    Array.from(view.container.querySelectorAll(selector))
      .map((element) => element.getAttribute(name))
      .join(',');
  const snapshot = () => ({
    arrangement: JSON.stringify(live(api).getArrangement()),
    undo: view.getByRole('button', { name: /^Undo/ }).getAttribute('title'),
    statusSequence: live(api).statusSequence,
    activeTrackId: live(api).activeTrackId,
    folded: attributes('[data-track-folded]', 'data-track-folded'),
    trackSelected: attributes('[data-track-id]', 'data-track-selected'),
    groupSelected: attributes('[data-group-id]', 'data-group-selected'),
    groupCollapsed: attributes('[data-group-id]', 'data-group-collapsed'),
    pressed: attributes('button[aria-pressed]', 'aria-pressed'),
    nameInput: view.queryByTestId('arrangement-group-name-input') !== null,
    libraryExpanded: attributes(
      '[data-testid="arrangement-library-tree"] button[aria-expanded]',
      'aria-expanded',
    ),
    libraryCurrent: attributes('[data-testid="arrangement-library-tree"] button', 'aria-current'),
    detailExpanded: attributes('[data-testid="arrangement-detail-toggle"]', 'aria-expanded'),
    videoExpandLabel: attributes('[data-testid="arrangement-video-expand"]', 'aria-label'),
    inputClicks,
  });
  const trackHeader = (trackId: string) => {
    const row = view.container.querySelector(`[data-track-id="${trackId}"]`);
    if (!(row instanceof HTMLElement)) {
      throw new Error(`track ${trackId} missing`);
    }
    return within(row);
  };
  return { api, view, snapshot, trackHeader };
}

type Snapshot = ReturnType<Awaited<ReturnType<typeof mountPanelWorkspace>>['snapshot']>;

function holdEnter(
  button: HTMLElement,
  snapshot: () => Snapshot,
  modifiers: EnterModifiers = {},
): Snapshot {
  act(() => button.focus());
  expect(pressEnter(button, false, modifiers)).toBe(true);
  const afterFirst = snapshot();
  const heldTarget = document.activeElement ?? button;
  for (let held = 0; held < 3; held++) {
    expect(pressEnter(heldTarget, true, modifiers)).toBe(false);
  }
  expect(snapshot()).toEqual(afterFirst);
  return afterFirst;
}

describe(
  'SYS-2 stage 2b-i: a held Enter acts once on the footer toggles, library tree, detail toggle and video dock buttons (D-29z1494)',
  {
    timeout: 15_000,
  },
  () => {
    it('HP1 held Enter on the Snap toggle switches it once', async () => {
      const mounted = await mountPanelWorkspace();
      const snap = mounted.view.getByTestId('arrangement-snap-toggle');
      const before = snap.getAttribute('aria-pressed');
      holdEnter(snap, mounted.snapshot);
      expect(snap.getAttribute('aria-pressed')).not.toBe(before);
    });

    it('HP2 held Enter on the envelope toggle switches it once', async () => {
      const mounted = await mountPanelWorkspace();
      const envelope = mounted.view.getByTestId('arrangement-envelope-toggle');
      expect(envelope.getAttribute('aria-pressed')).toBe('false');
      holdEnter(envelope, mounted.snapshot);
      expect(envelope.getAttribute('aria-pressed')).toBe('true');
    });

    it('HP3 held Enter on a library collection fold folds it once', async () => {
      const mounted = await mountPanelWorkspace();
      const fold = mounted.view.getByRole('button', {
        name: `mh — ${studioLibraryPanelStrings.fold}`,
      });
      expect(fold.getAttribute('aria-expanded')).toBe('true');
      holdEnter(fold, mounted.snapshot);
      const after = mounted.view.getByRole('button', {
        name: `mh — ${studioLibraryPanelStrings.unfold}`,
      });
      expect(after).toBe(fold);
      expect(fold.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(fold);
    });

    it('HP4 held Enter on the library tree nodes selects once and the repeats are prevented', async () => {
      const mounted = await mountPanelWorkspace();
      const tree = within(mounted.view.getByTestId('arrangement-library-tree'));
      const folder = tree.getAllByTestId('arrangement-library-folder')[0];
      const collectionNode = tree.getByRole('button', { name: 'mh' });
      const all = tree.getByRole('button', {
        name: new RegExp(`^${studioLibraryPanelStrings.all}`),
      });
      for (const node of [folder, collectionNode, all]) {
        holdEnter(node, mounted.snapshot);
        expect(node.getAttribute('aria-current')).toBe('true');
      }
    });

    it('HP5 the library notice dismiss ignores a repeated Enter; a fresh Enter dismisses once and focuses the search field', async () => {
      const mounted = await mountPanelWorkspace();
      const dismiss = mounted.view.getByRole('button', {
        name: studioLibraryPanelStrings.dismissNotice,
      });
      act(() => dismiss.focus());
      expect(pressEnter(dismiss, true)).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-library-notice')).not.toBeNull();
      expect(pressEnter(dismiss, false)).toBe(true);
      expect(mounted.view.queryByTestId('arrangement-library-notice')).toBeNull();
      const search = document.activeElement;
      expect(search).toBeInstanceOf(HTMLInputElement);
      expect(search?.getAttribute('type')).toBe('search');
      const afterFirst = mounted.snapshot();
      for (let held = 0; held < 3; held++) {
        if (search) {
          pressEnter(search, true);
        }
      }
      expect(mounted.snapshot()).toEqual(afterFirst);
      expect(document.activeElement).toBe(search);
    });

    it('HP6 held Enter on the detail panel toggle collapses it once; Space still toggles once per press', async () => {
      const mounted = await mountPanelWorkspace();
      const toggle = mounted.view.getByTestId('arrangement-detail-toggle');
      const before = toggle.getAttribute('aria-expanded');
      holdEnter(toggle, mounted.snapshot);
      const afterEnter = toggle.getAttribute('aria-expanded');
      expect(afterEnter).not.toBe(before);
      fireEvent.keyDown(toggle, { key: ' ', code: 'Space' });
      fireEvent.keyDown(toggle, { key: ' ', code: 'Space', repeat: true });
      fireEvent.keyUp(toggle, { key: ' ', code: 'Space' });
      expect(toggle.getAttribute('aria-expanded')).toBe(before);
    });

    it('HP7 held Enter on the video expand button floats the video once', async () => {
      const mounted = await mountPanelWorkspace();
      const expand = mounted.view.getByTestId('arrangement-video-expand');
      const label = expand.getAttribute('aria-label');
      holdEnter(expand, mounted.snapshot);
      expect(
        mounted.view.getByTestId('arrangement-video-expand').getAttribute('aria-label'),
      ).not.toBe(label);
      expect(mounted.view.queryByTestId('arrangement-video-close')).not.toBeNull();
    });

    it('HP8 held Enter on the floating video close button docks it once', async () => {
      const mounted = await mountPanelWorkspace();
      fireEvent.click(mounted.view.getByTestId('arrangement-video-expand'));
      const close = mounted.view.getByTestId('arrangement-video-close');
      act(() => close.focus());
      expect(pressEnter(close, true)).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-video-close')).not.toBeNull();
      holdEnter(close, mounted.snapshot);
      expect(mounted.view.queryByTestId('arrangement-video-close')).toBeNull();
      expect(document.activeElement).toBe(mounted.view.getByTestId('arrangement-video-expand'));
    });

    it('HP9 the video placeholder return button ignores a repeated Enter and docks once on a fresh Enter', async () => {
      const mounted = await mountPanelWorkspace();
      fireEvent.click(mounted.view.getByTestId('arrangement-video-expand'));
      const back = mounted.view.getByTestId('arrangement-video-placeholder-return');
      act(() => back.focus());
      expect(pressEnter(back, true)).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-video-placeholder-return')).not.toBeNull();
      holdEnter(back, mounted.snapshot);
      expect(mounted.view.queryByTestId('arrangement-video-placeholder-return')).toBeNull();
      expect(document.activeElement).toBe(mounted.view.getByTestId('arrangement-video-expand'));
    });
  },
);
