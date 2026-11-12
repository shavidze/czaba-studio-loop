import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { preventRepeatedEnterKeyDown } from '~/components/arrangement/studio-repeat-safe';
import {
  type SoftDisabledButtonProps,
  softDisabledButtonProps,
} from '~/components/arrangement/studio-soft-disabled';
import { ArrangementProvider, GESTURE_EDIT_BLOCKED_MESSAGE } from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioLaneStrings, studioMasterStrings } from '../strings';
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

const mixerCollection: WorkspaceCollection = {
  id: 'mixer-held-enter',
  label: 'mixer-held-enter',
  origin: 'demo',
  sources: [{ id: 'hit', title: 'Hit', collectionLabel: 'mh', kind: 'sfx', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const MIXER_CLIPS: ArrangementClip[] = [
  { id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 },
];

function mixerArrangement(): Arrangement {
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

interface MixerApiRef {
  current: WorkspaceProbeValue | null;
}

function MixerProbe({ api }: { api: MixerApiRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: MixerApiRef): WorkspaceProbeValue {
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

async function mountMixerWorkspace() {
  const api: MixerApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={mixerCollection} initialArrangement={mixerArrangement()}>
      <StudioWorkspace />
      <MixerProbe api={api} />
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

type Snapshot = ReturnType<Awaited<ReturnType<typeof mountMixerWorkspace>>['snapshot']>;

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
  'SYS-2 stage 2a: a held Enter acts once on the lane, group, master and tempo-row buttons (D-29z1489)',
  {
    timeout: 15_000,
  },
  () => {
    it('HM1 held Enter on a track Mute mutes once', async () => {
      const mounted = await mountMixerWorkspace();
      holdEnter(
        mounted.trackHeader('sfx').getByRole('button', { name: /^Mute/ }),
        mounted.snapshot,
      );
      expect(
        live(mounted.api)
          .getArrangement()
          .tracks.find((t) => t.id === 'sfx')?.mute,
      ).toBe(true);
    });

    it('HM2 held Enter on a track Solo solos once', async () => {
      const mounted = await mountMixerWorkspace();
      holdEnter(
        mounted
          .trackHeader('sfx')
          .getByRole('button', { name: studioLaneStrings.soloLabel('SFX') }),
        mounted.snapshot,
      );
      expect(
        live(mounted.api)
          .getArrangement()
          .tracks.find((t) => t.id === 'sfx')?.solo,
      ).toBe(true);
    });

    it('HM3 held Enter on a track fold folds once', async () => {
      const mounted = await mountMixerWorkspace();
      const before = mounted.snapshot();
      const after = holdEnter(
        mounted.trackHeader('sfx').getByTestId('arrangement-track-fold'),
        mounted.snapshot,
      );
      expect(after.folded).not.toBe(before.folded);
    });

    it('HM4 held Ctrl+Enter on a track name toggles the selection once', async () => {
      const mounted = await mountMixerWorkspace();
      const before = mounted.snapshot();
      const after = holdEnter(
        mounted.view.getByRole('button', { name: studioLaneStrings.activeTrackLabel('SFX') }),
        mounted.snapshot,
        { ctrlKey: true },
      );
      expect(after.trackSelected).not.toBe(before.trackSelected);
      expect(after.activeTrackId).toBe('sfx');
    });

    it('HM5 Enter on Pan reset centres once and moves focus to the Pan slider; repeats on the slider change nothing and repeats that still reach the reset are prevented', async () => {
      const mounted = await mountMixerWorkspace();
      act(() => {
        live(mounted.api).setTrackPan('sfx', 0.5);
      });
      const reset = mounted.view.getByRole('button', {
        name: studioLaneStrings.panResetLabel('SFX'),
      });
      act(() => reset.focus());
      expect(pressEnter(reset, false)).toBe(true);
      const afterFirst = mounted.snapshot();
      const slider = document.activeElement;
      expect(slider).toBeInstanceOf(HTMLInputElement);
      expect(slider?.getAttribute('type')).toBe('range');
      expect(reset.hasAttribute('disabled')).toBe(true);
      for (let held = 0; held < 3; held++) {
        if (slider) {
          pressEnter(slider, true);
        }
        expect(pressEnter(reset, true)).toBe(false);
      }
      expect(mounted.snapshot()).toEqual(afterFirst);
      const sfx = live(mounted.api)
        .getArrangement()
        .tracks.find((t) => t.id === 'sfx');
      expect(sfx?.pan ?? 0).toBe(0);
    });

    it('HM5b characterization (TL-R425-09, D-29z1493): during a pointer gesture the workspace refuses a fresh Enter on Pan reset before it can click; pan unchanged, focus stays on the reset, refusal written once and not re-announced by the repeats', async () => {
      const mounted = await mountMixerWorkspace();
      act(() => {
        live(mounted.api).setTrackPan('sfx', 0.5);
      });
      const clip = mounted.view.container.querySelector('[data-clip-id="h1"]');
      const header = clip?.firstElementChild;
      if (!(header instanceof HTMLElement)) {
        throw new Error('clip header missing');
      }
      fireEvent.pointerDown(header, { button: 0, buttons: 1, pointerId: 9, clientX: 100 });
      expect(live(mounted.api).isPointerGestureActive()).toBe(true);
      const reset = mounted.view.getByRole('button', {
        name: studioLaneStrings.panResetLabel('SFX'),
      });
      act(() => reset.focus());
      const before = mounted.snapshot();
      expect(pressEnter(reset, false)).toBe(false);
      const afterFirst = mounted.snapshot();
      expect(afterFirst.statusSequence).toBeGreaterThan(before.statusSequence);
      expect(live(mounted.api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(document.activeElement).toBe(reset);
      expect(afterFirst.arrangement).toBe(before.arrangement);
      for (let held = 0; held < 3; held++) {
        expect(pressEnter(reset, true)).toBe(false);
      }
      expect(mounted.snapshot()).toEqual(afterFirst);
      expect(document.activeElement).toBe(reset);
      const sfx = live(mounted.api)
        .getArrangement()
        .tracks.find((t) => t.id === 'sfx');
      expect(sfx?.pan).toBe(0.5);
    });

    it('HM6 held Enter on the video import button opens the file chooser once', async () => {
      const mounted = await mountMixerWorkspace();
      const after = holdEnter(
        mounted
          .trackHeader('video')
          .getByRole('button', { name: new RegExp(studioLaneStrings.videoImportLabel) }),
        mounted.snapshot,
      );
      expect(after.inputClicks).toBe(1);
    });

    it('HM6b held Enter on the compact video import button of a folded video track opens the file chooser once', async () => {
      const mounted = await mountMixerWorkspace();
      fireEvent.click(mounted.trackHeader('video').getByTestId('arrangement-track-fold'));
      const after = holdEnter(
        mounted
          .trackHeader('video')
          .getByRole('button', { name: studioLaneStrings.videoImportLabel }),
        mounted.snapshot,
      );
      expect(after.inputClicks).toBe(1);
    });

    it('HM7 held Enter on a group fold collapses it once', async () => {
      const mounted = await mountMixerWorkspace();
      const before = mounted.snapshot();
      const after = holdEnter(mounted.view.getByTestId('arrangement-group-fold'), mounted.snapshot);
      expect(after.groupCollapsed).not.toBe(before.groupCollapsed);
    });

    it('HM8 held Enter on a group Mute mutes once', async () => {
      const mounted = await mountMixerWorkspace();
      holdEnter(mounted.view.getByTestId('arrangement-group-mute'), mounted.snapshot);
      expect(live(mounted.api).getArrangement().groups?.[0]?.mute).toBe(true);
    });

    it('HM9 held Enter on a group Solo solos once', async () => {
      const mounted = await mountMixerWorkspace();
      const solo = mounted.view.getByTestId('arrangement-group-solo');
      expect(solo.getAttribute('data-solo')).toBe('off');
      holdEnter(solo, mounted.snapshot);
      expect(solo.getAttribute('data-solo')).toBe('on');
    });

    it('HM10 held Ctrl+Enter on a group name toggles the selection once', async () => {
      const mounted = await mountMixerWorkspace();
      const before = mounted.snapshot();
      const after = holdEnter(
        mounted.view.getByTestId('arrangement-group-name'),
        mounted.snapshot,
        {
          ctrlKey: true,
        },
      );
      expect(after.groupSelected).not.toBe(before.groupSelected);
    });

    it('HM11 the group name editor ignores a repeated Enter, commits on a fresh Enter, and returns focus to the name button', async () => {
      const mounted = await mountMixerWorkspace();
      const name = mounted.view.getByTestId('arrangement-group-name');
      act(() => name.focus());
      fireEvent.keyDown(name, { key: 'F2', code: 'F2' });
      const input = mounted.view.getByTestId('arrangement-group-name-input');
      fireEvent.change(input, { target: { value: 'Bed' } });
      expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', repeat: true })).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-group-name-input')).not.toBeNull();
      expect(live(mounted.api).getArrangement().groups?.[0]?.name).toBe('Stems');
      expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(false);
      const after = mounted.snapshot();
      const nameButton = mounted.view.getByTestId('arrangement-group-name');
      expect(document.activeElement).toBe(nameButton);
      for (let held = 0; held < 3; held++) {
        expect(pressEnter(nameButton, true)).toBe(false);
      }
      expect(mounted.snapshot()).toEqual(after);
      expect(after.nameInput).toBe(false);
      expect(live(mounted.api).getArrangement().groups?.[0]?.name).toBe('Bed');
    });

    it('HM11b the group name editor ignores a repeated Escape and cancels on a fresh Escape (defensive guard)', async () => {
      const mounted = await mountMixerWorkspace();
      const name = mounted.view.getByTestId('arrangement-group-name');
      act(() => name.focus());
      fireEvent.keyDown(name, { key: 'F2', code: 'F2' });
      const input = mounted.view.getByTestId('arrangement-group-name-input');
      fireEvent.change(input, { target: { value: 'Bed' } });
      expect(fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', repeat: true })).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-group-name-input')).not.toBeNull();
      expect(fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })).toBe(false);
      expect(mounted.view.queryByTestId('arrangement-group-name-input')).toBeNull();
      expect(live(mounted.api).getArrangement().groups?.[0]?.name).toBe('Stems');
      expect(document.activeElement).toBe(mounted.view.getByTestId('arrangement-group-name'));
    });

    it('HM12 held Enter on Master Mute mutes once', async () => {
      const mounted = await mountMixerWorkspace();
      holdEnter(
        mounted.view.getByRole('button', { name: studioMasterStrings.muteLabel }),
        mounted.snapshot,
      );
      expect(live(mounted.api).getArrangement().master.mute).toBe(true);
    });

    it('HM13 held Enter on the master peak readout resets once (idempotent, so the prevented repeat is the observable)', async () => {
      const mounted = await mountMixerWorkspace();
      holdEnter(mounted.view.getByTestId('arrangement-master-peak'), mounted.snapshot);
    });

    it('HM14 held Enter on the metronome with a tempo switches it on once', async () => {
      const mounted = await mountMixerWorkspace();
      const tempo = mounted.view.getByTestId('arrangement-tempo-input');
      act(() => tempo.focus());
      fireEvent.change(tempo, { target: { value: '120' } });
      fireEvent.keyDown(tempo, { key: 'Enter', code: 'Enter' });
      const metronome = mounted.view.getByTestId('arrangement-metronome-toggle');
      expect(metronome.getAttribute('aria-pressed')).toBe('false');
      holdEnter(metronome, mounted.snapshot);
      expect(metronome.getAttribute('aria-pressed')).toBe('true');
    });

    it('HM15 the shared guard prevents only a repeated Enter and the soft-disabled spread cannot carry onKeyDown', () => {
      const view = render(
        <button type="button" onKeyDown={preventRepeatedEnterKeyDown}>
          guarded
        </button>,
      );
      const button = view.getByRole('button', { name: 'guarded' });
      const keyDown = (key: string, repeat: boolean) => ({
        prevented: !fireEvent.keyDown(button, { key, repeat }),
      });
      expect(keyDown('Enter', true)).toEqual({ prevented: true });
      expect(keyDown('Enter', false)).toEqual({ prevented: false });
      expect(keyDown(' ', true)).toEqual({ prevented: false });
      expect(keyDown('F2', true)).toEqual({ prevented: false });
      expectTypeOf<SoftDisabledButtonProps['onKeyDown']>().toEqualTypeOf<undefined>();
      expect('onKeyDown' in softDisabledButtonProps(true)).toBe(false);
      expect('onKeyDown' in softDisabledButtonProps(false)).toBe(false);
    });
  },
);
