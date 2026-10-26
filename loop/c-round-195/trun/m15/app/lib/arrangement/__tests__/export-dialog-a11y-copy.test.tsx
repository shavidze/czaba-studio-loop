import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { renderArrangementWav } from '~/lib/arrangement/graph.client';
import { studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

const renderWavMock = vi.mocked(renderArrangementWav);

const WAV_NAME = 'WAV · 24-bit · 48 kHz · stereo';
const MP3_NAME = 'MP3 · 48 kHz · stereo';
const BOTH_NAME = studioExportStrings.bothOptionName;
const VIDEO_NAME = studioExportStrings.videoOptionName;
const RANGE_NAME = studioExportStrings.rangeOptionName;
const RANGE_VALID_NAME = studioExportStrings.rangeScope(
  `00:04.000 — 00:09.000 (${studioExportStrings.rangeSeconds(5)})`,
);
const PROJECT_NAME = studioExportStrings.projectScope('00:00.000', '00:20.000');
const MP3_NOTE = studioExportStrings.mp3FormatNote;
const BOTH_NOTE = studioExportStrings.bothFormatNote;
const VIDEO_REASON = studioExportStrings.videoRenderReason;
const RANGE_MISSING_REASON = studioExportStrings.rangeMissingReason;
const WAV_NOTE_PROJECT = studioExportStrings.wavNoteProject;
const WAV_NOTE_RANGE_LOOP = studioExportStrings.wavNoteRangeLoop;
const WAV_NOTE_PROJECT_LOOP = studioExportStrings.wavNoteProjectLoop;
const NAME_LEAK = new RegExp(
  [
    'LAME',
    studioExportStrings.bothFormatNote.split(' — ')[1].split(' ').slice(0, 2).join(' '),
    'graph',
    studioExportStrings.videoRenderReason.split(' ').slice(0, 3).join(' '),
    studioExportStrings.rangeMissingReason.split(' ').slice(0, 3).join(' '),
  ].join('|'),
);

function masterMuteNote(creates: string, length: string): string {
  return studioExportStrings.masterMutedNote(creates, length);
}

function noSoundNote(creates: string, length: string): string {
  return studioExportStrings.noSoundNote(creates, length);
}

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

const a11yCollection: WorkspaceCollection = {
  id: 'a11y',
  label: 'a11y',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'a11y', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function a11yArrangement(sourceId = 'song'): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      {
        id: sourceId === 'song' ? 'music-1' : 'ghost',
        trackId: 'music',
        sourceId,
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
    ],
  };
}

interface A11yApiRef {
  current: ArrangementContextValue | null;
}

function A11yProbe({ api }: { api: A11yApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: A11yApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function A11yDialogHost({ api }: { api: A11yApiRef }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <A11yProbe api={api} />
    </>
  );
}

async function mountA11yDialog(
  options: { arrangement?: Arrangement; range?: { start: number; end: number } } = {},
) {
  const api: A11yApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={a11yCollection}
      initialArrangement={options.arrangement ?? a11yArrangement()}
    >
      <A11yDialogHost api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const range = options.range;
  if (range) {
    act(() => live(api).setTimeRange({ ...range, trackId: 'music' }));
  }
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  return { api, view };
}

function radioInput(element: HTMLElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('radio input missing');
  }
  return element;
}

function dialogElement(view: ReturnType<typeof render>): HTMLElement {
  return view.getByRole('dialog');
}

function formatRadios(view: ReturnType<typeof render>): HTMLInputElement[] {
  return Array.from(
    view.baseElement.querySelectorAll<HTMLInputElement>('input[name="arrangement-export-format"]'),
  );
}

function masterMuteText(view: ReturnType<typeof render>): string {
  return view.getByTestId('arrangement-export-master-mute').textContent ?? '';
}

function noSoundText(view: ReturnType<typeof render>): string {
  return (
    view.getByText(new RegExp(studioExportStrings.noSoundNote('', '').split(' — ')[0]))
      .textContent ?? ''
  );
}

describe(
  'Round 93 export dialog radio names, descriptions and format-aware notes (D-29z58)',
  {
    timeout: 15_000,
  },
  () => {
    beforeEach(() => {
      renderWavMock.mockReset();
      renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 0.5, clippedSamples: 0 });
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
      vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
      vi.stubGlobal('requestAnimationFrame', () => 1);
      vi.stubGlobal('cancelAnimationFrame', () => undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('AN1 no range, no loop: every radio has the exact name and description', async () => {
      const { view } = await mountA11yDialog();
      expect(
        view.getByRole('radio', { name: WAV_NAME, description: WAV_NOTE_PROJECT }),
      ).toBeTruthy();
      expect(view.getByRole('radio', { name: MP3_NAME, description: MP3_NOTE })).toBeTruthy();
      expect(view.getByRole('radio', { name: BOTH_NAME, description: BOTH_NOTE })).toBeTruthy();
      expect(view.getByRole('radio', { name: VIDEO_NAME, description: VIDEO_REASON })).toBeTruthy();
      const range = radioInput(
        view.getByRole('radio', { name: RANGE_NAME, description: RANGE_MISSING_REASON }),
      );
      expect(range.dataset.testid).toBe('arrangement-export-scope-range');
      expect(range.disabled).toBe(true);
      const project = radioInput(view.getByRole('radio', { name: PROJECT_NAME }));
      expect(project.hasAttribute('aria-describedby')).toBe(false);
      expect(project.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('AN2 no note or reason text leaks into any radio name', async () => {
      const { view } = await mountA11yDialog();
      expect(view.getAllByRole('radio')).toHaveLength(6);
      expect(view.queryAllByRole('radio', { name: NAME_LEAK })).toEqual([]);
    });

    it('AN3 valid range + loop: range name without description, WAV description follows the live note', async () => {
      const looped: Arrangement = {
        ...a11yArrangement(),
        loop: { start: 2, end: 6, enabled: true },
      };
      const { view } = await mountA11yDialog({ arrangement: looped, range: { start: 4, end: 9 } });
      const range = radioInput(view.getByRole('radio', { name: RANGE_VALID_NAME }));
      expect(range.checked).toBe(true);
      expect(range.hasAttribute('aria-describedby')).toBe(false);
      expect(range.hasAttribute('aria-labelledby')).toBe(false);
      expect(
        view.getByRole('radio', { name: WAV_NAME, description: WAV_NOTE_RANGE_LOOP }),
      ).toBeTruthy();
      expect(view.queryAllByRole('radio', { name: NAME_LEAK })).toEqual([]);
      fireEvent.click(view.getByRole('radio', { name: PROJECT_NAME }));
      expect(
        view.getByRole('radio', { name: WAV_NAME, description: WAV_NOTE_PROJECT_LOOP }),
      ).toBeTruthy();
    });

    it('AN4 a click on the name or note text still selects its radio', async () => {
      const { view } = await mountA11yDialog();
      const mp3 = radioInput(view.getByTestId('arrangement-export-format-mp3'));
      const both = radioInput(view.getByTestId('arrangement-export-format-both'));
      fireEvent.click(view.getByText(MP3_NAME));
      expect(mp3.checked).toBe(true);
      expect(view.getByRole('button', { name: studioExportStrings.formatButtonMp3 })).toBeTruthy();
      fireEvent.click(view.getByText(BOTH_NOTE));
      expect(both.checked).toBe(true);
      expect(mp3.checked).toBe(false);
      expect(view.getByRole('button', { name: studioExportStrings.formatButtonBoth })).toBeTruthy();
    });

    it('AN5 every labelledby/describedby id resolves to one element inside the dialog and all differ', async () => {
      for (const range of [undefined, { start: 4, end: 9 }]) {
        const { view } = await mountA11yDialog(range ? { range } : {});
        const dialog = dialogElement(view);
        const ids = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
          .flatMap((radio) => [
            radio.getAttribute('aria-labelledby'),
            radio.getAttribute('aria-describedby'),
          ])
          .filter((id): id is string => id !== null);
        expect(ids).toHaveLength(range ? 8 : 10);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) {
          expect(id).not.toBe('');
          expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
          const target = document.getElementById(id);
          expect(target).not.toBeNull();
          expect(dialog.contains(target)).toBe(true);
          expect(target?.textContent).not.toBe('');
        }
        view.unmount();
      }
    });

    it('AN6 each format label keeps its frozen textContent', async () => {
      const { view } = await mountA11yDialog();
      expect(formatRadios(view).map((radio) => radio.closest('label')?.textContent ?? '')).toEqual([
        `${WAV_NAME}${WAV_NOTE_PROJECT}`,
        `${MP3_NAME}${MP3_NOTE}`,
        `${BOTH_NAME}${BOTH_NOTE}`,
        `${VIDEO_NAME}${VIDEO_REASON}`,
      ]);
      const range = radioInput(view.getByTestId('arrangement-export-scope-range'));
      expect(range.closest('label')?.textContent).toBe(`${RANGE_NAME}${RANGE_MISSING_REASON}`);
    });

    it('NC1 the Master-mute note names the selected format in project and range scope', async () => {
      const { api, view } = await mountA11yDialog({ range: { start: 4, end: 9 } });
      act(() => live(api).toggleMasterMute());
      fireEvent.click(view.getByTestId('arrangement-export-scope-project'));
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesWav, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-format-mp3'));
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesMp3, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-format-both'));
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesBoth, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-format-wav'));
      expect(masterMuteText(view)).toBe(
        studioExportStrings.masterMutedNote(studioExportStrings.formatCreatesWav, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-scope-range'));
      fireEvent.click(view.getByTestId('arrangement-export-format-mp3'));
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesMp3, studioExportStrings.rangeSeconds(5)),
      );
    });

    it('NC2 the no-sound note names the selected format in project and range scope', async () => {
      const { view } = await mountA11yDialog({
        arrangement: a11yArrangement('missing'),
        range: { start: 4, end: 9 },
      });
      fireEvent.click(view.getByTestId('arrangement-export-scope-project'));
      expect(noSoundText(view)).toBe(
        studioExportStrings.noSoundNote(studioExportStrings.formatCreatesWav, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-format-mp3'));
      expect(noSoundText(view)).toBe(
        noSoundNote(studioExportStrings.formatCreatesMp3, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-format-both'));
      expect(noSoundText(view)).toBe(
        noSoundNote(studioExportStrings.formatCreatesBoth, '00:20.000'),
      );
      fireEvent.click(view.getByTestId('arrangement-export-scope-range'));
      fireEvent.click(view.getByTestId('arrangement-export-format-mp3'));
      expect(noSoundText(view)).toBe(
        noSoundNote(studioExportStrings.formatCreatesMp3, studioExportStrings.rangeSeconds(5)),
      );
    });

    it('NC3 closing and reopening resets the format to WAV and the note says WAV', async () => {
      const { api, view } = await mountA11yDialog();
      act(() => live(api).toggleMasterMute());
      fireEvent.click(view.getByTestId('arrangement-export-format-both'));
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesBoth, '00:20.000'),
      );
      fireEvent.click(view.getByRole('button', { name: studioExportStrings.closeButton }));
      expect(view.queryByTestId('arrangement-export-master-mute')).toBeNull();
      fireEvent.click(view.getByRole('button', { name: 'open-export' }));
      expect(radioInput(view.getByTestId('arrangement-export-format-wav')).checked).toBe(true);
      expect(masterMuteText(view)).toBe(
        masterMuteNote(studioExportStrings.formatCreatesWav, '00:20.000'),
      );
    });
  },
);
