import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioTempoStrings } from '../strings';
import { useWorkspaceStatusProbe, type WorkspaceStatusProbeValue } from './helpers/workspace-probe';
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const sessionCollection: WorkspaceCollection = {
  id: 'session',
  label: 'session',
  origin: 'demo',
  sources: [
    {
      id: 'stem-90',
      title: 'Slow stem',
      collectionLabel: 'session',
      kind: 'stem',
      origin: 'demo',
      bpm: 90,
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 }),
};

const SEEDED_SENTENCE = studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' });

function sessionArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface SessionApiRef {
  current: WorkspaceStatusProbeValue | null;
  showWorkspace: ((next: boolean) => void) | null;
}

function SessionHarness({ api }: { api: SessionApiRef }) {
  const [shown, setShown] = useState(true);
  api.current = useWorkspaceStatusProbe();
  api.showWorkspace = setShown;
  return shown ? <StudioWorkspace /> : null;
}

function live(api: SessionApiRef): WorkspaceStatusProbeValue {
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

function seededProvider(api: SessionApiRef) {
  return (
    <ArrangementProvider
      collection={sessionCollection}
      initialArrangement={sessionArrangement([
        { id: 'c1', trackId: 'music', sourceId: 'stem-90', start: 2, sourceOffset: 0, duration: 4 },
      ])}
    >
      <SessionHarness api={api} />
    </ArrangementProvider>
  );
}

async function mountSession() {
  const api: SessionApiRef = { current: null, showWorkspace: null };
  const view = render(seededProvider(api));
  await settle();
  const remount = async () => {
    act(() => api.showWorkspace?.(false));
    act(() => api.showWorkspace?.(true));
    await settle();
  };
  return { api, view, remount };
}

type SessionView = Awaited<ReturnType<typeof mountSession>>['view'];

function tempoInput(view: SessionView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function divisionSelect(view: SessionView): HTMLSelectElement {
  const select = view.getByTestId('arrangement-grid-division');
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error('grid division select missing');
  }
  return select;
}

function pressed(view: SessionView, testId: string): string | null {
  return view.getByTestId(testId).getAttribute('aria-pressed');
}

function commitTempo(input: HTMLInputElement, text: string) {
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  act(() => input.blur());
}

function occurrences(text: string, part: string): number {
  return text.split(part).length - 1;
}

describe('Workspace tempo and grid settings survive a remount under a live provider', () => {
  it('WS1 a typed tempo survives a remount and the seed does not run again', async () => {
    const { api, view, remount } = await mountSession();
    expect(tempoInput(view).value).toBe('90');
    commitTempo(tempoInput(view), '100');
    expect(tempoInput(view).value).toBe('100');
    const sequenceBefore = live(api).statusSequence;
    await remount();
    expect(tempoInput(view).value).toBe('100');
    expect(live(api).status).not.toContain(SEEDED_SENTENCE);
    await remount();
    expect(tempoInput(view).value).toBe('100');
    expect(live(api).statusSequence).toBe(sequenceBefore);
  });

  it('WS2 the seed sentence appears once across two remounts when the user never typed a tempo', async () => {
    const { api, view, remount } = await mountSession();
    expect(occurrences(live(api).status, SEEDED_SENTENCE)).toBe(1);
    await remount();
    await remount();
    expect(tempoInput(view).value).toBe('90');
    expect(occurrences(live(api).status, SEEDED_SENTENCE)).toBe(1);
  });

  it('WS3 a cleared tempo stays cleared after a remount', async () => {
    const { api, view, remount } = await mountSession();
    commitTempo(tempoInput(view), '');
    expect(tempoInput(view).value).toBe('');
    await remount();
    expect(tempoInput(view).value).toBe('');
    expect(live(api).status).not.toContain(SEEDED_SENTENCE);
  });

  it('WS4 grid division, snap and metronome chosen by hand survive a remount', async () => {
    const { view, remount } = await mountSession();
    expect(pressed(view, 'arrangement-snap-toggle')).toBe('true');
    fireEvent.click(view.getByTestId('arrangement-snap-toggle'));
    fireEvent.change(divisionSelect(view), { target: { value: '1/8' } });
    fireEvent.click(view.getByTestId('arrangement-metronome-toggle'));
    const before = {
      snap: pressed(view, 'arrangement-snap-toggle'),
      division: divisionSelect(view).value,
      metronome: pressed(view, 'arrangement-metronome-toggle'),
    };
    expect(before).toEqual({ snap: 'false', division: '1/8', metronome: 'true' });
    await remount();
    expect({
      snap: pressed(view, 'arrangement-snap-toggle'),
      division: divisionSelect(view).value,
      metronome: pressed(view, 'arrangement-metronome-toggle'),
    }).toEqual(before);
  });

  it('WS5 a new provider starts from the defaults and seeds again', async () => {
    const first = await mountSession();
    commitTempo(tempoInput(first.view), '100');
    first.view.unmount();
    const second = await mountSession();
    expect(tempoInput(second.view).value).toBe('90');
    expect(occurrences(live(second.api).status, SEEDED_SENTENCE)).toBe(1);
    expect(pressed(second.view, 'arrangement-snap-toggle')).toBe('true');
  });
});
