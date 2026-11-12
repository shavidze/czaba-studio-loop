import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { isImeCompositionKeyDown } from '~/components/arrangement/studio-ime-composition';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { tempoStatusMessage } from '../tempo';
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

type ImeKey = 'Enter' | 'Escape';
type ImeForm = 'isComposing' | 'keyCode229';

const IME_FORMS: readonly ImeForm[] = ['isComposing', 'keyCode229'];

type HeldEditor = 'BPM' | 'marker' | 'Clip Gain';

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

describe('IME composition never commits or cancels a Studio editor (SYS-3 stage 1)', () => {
  it('IME0 the helper reads nativeEvent.isComposing and keyCode 229, and nothing else', () => {
    const fake = (isComposing: boolean, keyCode: number) => ({
      nativeEvent: new KeyboardEvent('keydown', { key: 'Enter', isComposing }),
      keyCode,
    });
    expect(isImeCompositionKeyDown(fake(true, 13))).toBe(true);
    expect(isImeCompositionKeyDown(fake(false, 229))).toBe(true);
    expect(isImeCompositionKeyDown(fake(false, 13))).toBe(false);
    expect(isImeCompositionKeyDown(fake(false, 27))).toBe(false);
  });

  it.each(
    IME_FORMS,
  )('IME1 BPM field (%s): a composing Enter or Escape keeps focus and the draft and commits nothing; a plain Enter then commits', async (form) => {
    const { view, snapshot } = await mountImeWorkspace();
    const input = inputById(view, 'arrangement-tempo-input');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '96' } });
    const before = snapshot();
    expect(pressComposingKey(input, 'Enter', form)).toBe(true);
    expect(pressComposingKey(input, 'Escape', form)).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('96');
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(document.activeElement).not.toBe(input);
    expect(input.value).toBe('96');
    expect(snapshot().statusSequence).toBeGreaterThan(before.statusSequence);
    expect(snapshot().status).toBe(tempoStatusMessage(96));
  });

  it.each(
    IME_FORMS,
  )('IME2 marker name editor (%s): a composing Enter or Escape keeps the editor open and adds nothing; a plain Enter then adds the marker', async (form) => {
    const { api, view, snapshot } = await mountImeWorkspace();
    fireEvent.click(view.getByTestId('arrangement-marker-add'));
    const input = inputById(view, 'arrangement-marker-name-input');
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: 'Hit' } });
    const before = snapshot();
    const parentKeydown = vi.fn();
    document.body.addEventListener('keydown', parentKeydown);
    expect(pressComposingKey(input, 'Enter', form)).toBe(true);
    expect(pressComposingKey(input, 'Escape', form)).toBe(true);
    document.body.removeEventListener('keydown', parentKeydown);
    expect(parentKeydown).not.toHaveBeenCalled();
    expect(view.getByTestId('arrangement-marker-name-input')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Hit');
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect((live(api).getArrangement().markers ?? []).map((marker) => marker.name)).toStrictEqual([
      'Hit',
    ]);
  });

  it.each(
    IME_FORMS,
  )('IME3 group name editor (%s): a composing Enter or Escape keeps the editor open and renames nothing; a plain Enter then renames', async (form) => {
    const { api, view, snapshot } = await mountImeWorkspace();
    const name = view.getByTestId('arrangement-group-name');
    act(() => name.focus());
    fireEvent.keyDown(name, { key: 'F2', code: 'F2' });
    const input = inputById(view, 'arrangement-group-name-input');
    fireEvent.change(input, { target: { value: 'Bed' } });
    const before = snapshot();
    const parentKeydown = vi.fn();
    document.body.addEventListener('keydown', parentKeydown);
    expect(pressComposingKey(input, 'Enter', form)).toBe(true);
    expect(pressComposingKey(input, 'Escape', form)).toBe(true);
    document.body.removeEventListener('keydown', parentKeydown);
    expect(parentKeydown).not.toHaveBeenCalled();
    expect(view.getByTestId('arrangement-group-name-input')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Bed');
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(live(api).undoLabel).toBe('Rename Group');
    expect((live(api).getArrangement().groups ?? []).map((group) => group.name)).toStrictEqual([
      'Bed',
    ]);
  });

  it.each(
    IME_FORMS,
  )('IME4 Detail From and To fields (%s): a composing Enter in either field applies no time selection; a plain Enter then applies it', async (form) => {
    const { api, view, snapshot } = await mountImeWorkspace();
    act(() => live(api).selectClip('h1'));
    const start = inputById(view, 'arrangement-detail-start');
    const end = inputById(view, 'arrangement-detail-end');
    fireEvent.change(start, { target: { value: '2' } });
    fireEvent.change(end, { target: { value: '10' } });
    const before = snapshot();
    for (const field of [start, end]) {
      act(() => field.focus());
      expect(pressComposingKey(field, 'Enter', form)).toBe(true);
      expect(document.activeElement).toBe(field);
    }
    expect([start.value, end.value]).toStrictEqual(['2', '10']);
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(end, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(snapshot().statusSequence).toBeGreaterThan(before.statusSequence);
    expect(snapshot().status).toMatch(/^Time selection: 00:02\.000 — 00:10\.000/);
  });

  it.each(
    IME_FORMS,
  )('IME5 Detail Clip Gain field (%s): a composing Enter applies nothing and a composing Escape does not revert the text; a plain Enter then applies', async (form) => {
    const { api, view, snapshot } = await mountImeWorkspace();
    act(() => live(api).selectClip('h1'));
    const gain = inputById(view, 'arrangement-detail-clip-gain-input');
    act(() => gain.focus());
    fireEvent.change(gain, { target: { value: '-3' } });
    const before = snapshot();
    expect(pressComposingKey(gain, 'Enter', form)).toBe(true);
    expect(pressComposingKey(gain, 'Escape', form)).toBe(true);
    expect(document.activeElement).toBe(gain);
    expect(gain.value).toBe('-3');
    expect(snapshot()).toStrictEqual(before);
    expect(fireEvent.keyDown(gain, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(
      live(api)
        .getArrangement()
        .clips.find((clip) => clip.id === 'h1')?.gainDb,
    ).toBe(-3);
  });

  const HELD_EDITORS: readonly HeldEditor[] = ['BPM', 'marker', 'Clip Gain'];
  const HELD_CASES: readonly (readonly [HeldEditor, ImeForm])[] = HELD_EDITORS.flatMap((editor) =>
    IME_FORMS.map((form): readonly [HeldEditor, ImeForm] => [editor, form]),
  );

  it.each(
    HELD_CASES,
  )('IME6 held key after a composing key, %s editor (%s): auto-repeat Enter or Escape (repeat: true, not composing) settles nothing; a fresh plain key then acts (BPM Enter commits 96, marker Escape cancels, Clip Gain Escape shows the stored gain)', async (editor, form) => {
    const { api, view, snapshot } = await mountImeWorkspace();
    const holdAfterComposing = (target: Element, key: ImeKey) => {
      expect(pressComposingKey(target, key, form)).toBe(true);
      for (let step = 0; step < 3; step += 1) {
        expect(fireEvent.keyDown(target, { key, code: key, repeat: true })).toBe(false);
      }
    };

    if (editor === 'BPM') {
      const tempo = inputById(view, 'arrangement-tempo-input');
      act(() => tempo.focus());
      fireEvent.change(tempo, { target: { value: '96' } });
      const beforeTempo = snapshot();
      holdAfterComposing(tempo, 'Enter');
      holdAfterComposing(tempo, 'Escape');
      expect(document.activeElement).toBe(tempo);
      expect(tempo.value).toBe('96');
      expect(snapshot()).toStrictEqual(beforeTempo);
      expect(fireEvent.keyDown(tempo, { key: 'Enter', code: 'Enter' })).toBe(false);
      expect(document.activeElement).not.toBe(tempo);
      expect(snapshot().status).toBe(tempoStatusMessage(96));
      return;
    }

    if (editor === 'marker') {
      fireEvent.click(view.getByTestId('arrangement-marker-add'));
      const marker = inputById(view, 'arrangement-marker-name-input');
      fireEvent.change(marker, { target: { value: 'Hit' } });
      const beforeMarker = snapshot();
      holdAfterComposing(marker, 'Enter');
      holdAfterComposing(marker, 'Escape');
      expect(view.getByTestId('arrangement-marker-name-input')).toBe(marker);
      expect(document.activeElement).toBe(marker);
      expect(marker.value).toBe('Hit');
      expect(snapshot()).toStrictEqual(beforeMarker);
      fireEvent.keyDown(marker, { key: 'Escape', code: 'Escape' });
      expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
      expect(live(api).getArrangement().markers ?? []).toStrictEqual([]);
      return;
    }

    act(() => live(api).selectClip('h1'));
    const gain = inputById(view, 'arrangement-detail-clip-gain-input');
    act(() => gain.focus());
    const shown = gain.value;
    fireEvent.change(gain, { target: { value: '-3' } });
    const beforeGain = snapshot();
    holdAfterComposing(gain, 'Enter');
    holdAfterComposing(gain, 'Escape');
    expect(document.activeElement).toBe(gain);
    expect(gain.value).toBe('-3');
    expect(snapshot()).toStrictEqual(beforeGain);
    fireEvent.keyDown(gain, { key: 'Escape', code: 'Escape' });
    expect(gain.value).toBe(shown);
    expect(
      live(api)
        .getArrangement()
        .clips.find((clip) => clip.id === 'h1')?.gainDb ?? 0,
    ).toBe(0);
  });

  it.each(
    IME_FORMS,
  )('IME7 a plain Escape after a composing Escape cancels as before (%s): BPM draft dropped, marker editor closed, group name kept, Clip Gain text reverted', async (form) => {
    const { api, view, snapshot } = await mountImeWorkspace();

    const tempo = inputById(view, 'arrangement-tempo-input');
    act(() => tempo.focus());
    const beforeTempo = snapshot();
    fireEvent.change(tempo, { target: { value: '96' } });
    expect(pressComposingKey(tempo, 'Escape', form)).toBe(true);
    expect(fireEvent.keyDown(tempo, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(document.activeElement).not.toBe(tempo);
    expect(tempo.value).toBe('');
    expect(snapshot()).toStrictEqual(beforeTempo);

    fireEvent.click(view.getByTestId('arrangement-marker-add'));
    const marker = inputById(view, 'arrangement-marker-name-input');
    fireEvent.change(marker, { target: { value: 'Hit' } });
    expect(pressComposingKey(marker, 'Escape', form)).toBe(true);
    expect(fireEvent.keyDown(marker, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(live(api).getArrangement().markers ?? []).toStrictEqual([]);

    const name = view.getByTestId('arrangement-group-name');
    act(() => name.focus());
    fireEvent.keyDown(name, { key: 'F2', code: 'F2' });
    const group = inputById(view, 'arrangement-group-name-input');
    fireEvent.change(group, { target: { value: 'Bed' } });
    expect(pressComposingKey(group, 'Escape', form)).toBe(true);
    expect(fireEvent.keyDown(group, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(view.queryByTestId('arrangement-group-name-input')).toBeNull();
    expect((live(api).getArrangement().groups ?? []).map((entry) => entry.name)).toStrictEqual([
      'Stems',
    ]);

    act(() => live(api).selectClip('h1'));
    const gain = inputById(view, 'arrangement-detail-clip-gain-input');
    act(() => gain.focus());
    const shown = gain.value;
    fireEvent.change(gain, { target: { value: '-3' } });
    const before = snapshot();
    expect(pressComposingKey(gain, 'Escape', form)).toBe(true);
    expect(gain.value).toBe('-3');
    expect(fireEvent.keyDown(gain, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(gain.value).toBe(shown);
    expect(snapshot().arrangement).toBe(before.arrangement);
  });
});
