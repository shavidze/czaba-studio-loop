import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExportConfig } from '~/types/studio';

interface FakeStudioStem {
  id: string;
  name: string;
  audioUrl: string;
  volume: number;
  isMuted: boolean;
  isSoloed: boolean;
}

interface FakeStudioState {
  stems: FakeStudioStem[];
  isExporting: boolean;
  exportProgress: number;
  productTitle: string;
}

const studioMock = vi.hoisted(() => {
  const initialState: FakeStudioState = {
    stems: [],
    isExporting: false,
    exportProgress: 0,
    productTitle: 'Middle East',
  };
  return {
    state: initialState,
    exportAudio: vi.fn<(config: ExportConfig) => Promise<Blob>>(),
  };
});

vi.mock('~/contexts/StudioContext', () => ({
  useStudio: () => studioMock,
}));

vi.mock('~/utils/ableton-export', () => ({
  downloadAbletonLiveSet: vi.fn(),
  exportToAbletonLiveSet: vi.fn(),
}));

import { ExportDialog } from '~/components/studio/ExportDialog';

function createFakeStem(id: string, overrides: Partial<FakeStudioStem> = {}): FakeStudioStem {
  return {
    id,
    name: `Stem ${id}`,
    audioUrl: `https://example.test/${id}.wav`,
    volume: 1,
    isMuted: false,
    isSoloed: false,
    ...overrides,
  };
}

function setStudioStems(stems: FakeStudioStem[]): void {
  studioMock.state = { ...studioMock.state, stems };
}

function renderDialogElement(isOpen: boolean) {
  return <ExportDialog isOpen={isOpen} onClose={() => {}} />;
}

function getDialog(): HTMLElement {
  return screen.getByRole('dialog');
}

function getStemCheckboxes(): HTMLInputElement[] {
  return within(getDialog())
    .getAllByRole('checkbox')
    .filter((box): box is HTMLInputElement => box instanceof HTMLInputElement);
}

function getCheckedStemNames(): string[] {
  return within(getDialog())
    .getAllByRole('checkbox')
    .filter((box) => box instanceof HTMLInputElement && box.checked)
    .map((box) => box.closest('label')?.textContent?.trim() ?? '');
}

function getDialogButton(name: string): HTMLElement {
  const matches = within(getDialog()).getAllByRole('button', { name });
  expect(matches).toHaveLength(1);
  return matches[0];
}

function getStemCheckbox(stemName: string): HTMLElement {
  return within(getDialog()).getByRole('checkbox', { name: stemName });
}

describe('legacy ExportDialog stem selection (B-R220-LEGACY-EXPORT-NO-STEMS)', () => {
  beforeEach(() => {
    studioMock.state = {
      stems: [],
      isExporting: false,
      exportProgress: 0,
      productTitle: 'Middle East',
    };
    studioMock.exportAudio.mockReset();
    studioMock.exportAudio.mockImplementation(() => new Promise<Blob>(() => {}));
  });

  afterEach(() => {
    cleanup();
  });

  it('ES1: stems loaded after a closed mount are all selected when the dialog opens', () => {
    const { rerender } = render(renderDialogElement(false));
    setStudioStems(Array.from({ length: 10 }, (_, index) => createFakeStem(`s${index + 1}`)));
    rerender(renderDialogElement(false));
    rerender(renderDialogElement(true));

    const boxes = getStemCheckboxes();
    expect(boxes).toHaveLength(10);
    expect(boxes.filter((box) => box.checked)).toHaveLength(10);
    expect(getDialogButton('Export Audio').hasAttribute('disabled')).toBe(false);
    expect(within(getDialog()).getAllByRole('button', { name: 'Deselect All' })).toHaveLength(1);
    expect(within(getDialog()).queryAllByRole('button', { name: 'Select All' })).toHaveLength(0);
  });

  it('ES2: stems present at mount are all selected (initializer path)', () => {
    setStudioStems([createFakeStem('a'), createFakeStem('b'), createFakeStem('c')]);
    render(renderDialogElement(true));

    const boxes = getStemCheckboxes();
    expect(boxes).toHaveLength(3);
    expect(boxes.filter((box) => box.checked)).toHaveLength(3);
  });

  it('ES3: a same-ID stems rebuild keeps the user toggle, also across close and reopen', () => {
    setStudioStems([createFakeStem('a'), createFakeStem('b'), createFakeStem('c')]);
    const { rerender } = render(renderDialogElement(true));
    fireEvent.click(getStemCheckbox('Stem b'));
    expect(getCheckedStemNames()).toEqual(['Stem a', 'Stem c']);

    setStudioStems([
      createFakeStem('a'),
      createFakeStem('b', { isMuted: true }),
      createFakeStem('c', { volume: 0.4 }),
    ]);
    rerender(renderDialogElement(true));
    expect(getCheckedStemNames()).toEqual(['Stem a', 'Stem c']);

    rerender(renderDialogElement(false));
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
    rerender(renderDialogElement(true));
    expect(getCheckedStemNames()).toEqual(['Stem a', 'Stem c']);
  });

  it('ES4: the same IDs in a different order keep the selection', () => {
    setStudioStems([createFakeStem('a'), createFakeStem('b'), createFakeStem('c')]);
    const { rerender } = render(renderDialogElement(true));
    fireEvent.click(getStemCheckbox('Stem a'));

    setStudioStems([createFakeStem('c'), createFakeStem('a'), createFakeStem('b')]);
    rerender(renderDialogElement(true));
    expect(getCheckedStemNames()).toEqual(['Stem c', 'Stem b']);
  });

  it('ES5: a replaced ID set selects every new stem and exports only the new IDs', () => {
    setStudioStems([createFakeStem('a'), createFakeStem('b')]);
    const { rerender } = render(renderDialogElement(true));
    fireEvent.click(getStemCheckbox('Stem a'));
    expect(getCheckedStemNames()).toEqual(['Stem b']);

    setStudioStems([createFakeStem('x'), createFakeStem('y')]);
    rerender(renderDialogElement(true));
    expect(getStemCheckboxes().filter((box) => box.checked)).toHaveLength(2);

    fireEvent.click(getDialogButton('Export Audio'));
    expect(studioMock.exportAudio).toHaveBeenCalledTimes(1);
    expect(studioMock.exportAudio.mock.calls[0][0].includedStemIds).toEqual(['x', 'y']);
  });

  it('ES6: a removed ID leaves the selection and Select/Deselect All stay correct', () => {
    setStudioStems([createFakeStem('a'), createFakeStem('b'), createFakeStem('c')]);
    const { rerender } = render(renderDialogElement(true));

    setStudioStems([createFakeStem('a'), createFakeStem('b')]);
    rerender(renderDialogElement(true));
    expect(within(getDialog()).getAllByRole('button', { name: 'Deselect All' })).toHaveLength(1);
    expect(getStemCheckboxes().filter((box) => box.checked)).toHaveLength(2);

    fireEvent.click(getDialogButton('Deselect All'));
    expect(getStemCheckboxes().filter((box) => box.checked)).toHaveLength(0);
    expect(getDialogButton('Export Audio').hasAttribute('disabled')).toBe(true);

    fireEvent.click(getDialogButton('Select All'));
    expect(getStemCheckboxes().filter((box) => box.checked)).toHaveLength(2);
    expect(getDialogButton('Export Audio').hasAttribute('disabled')).toBe(false);
  });

  it('ES7: the Ableton tab export button is enabled once stems load after mount', () => {
    const { rerender } = render(renderDialogElement(false));
    setStudioStems(Array.from({ length: 10 }, (_, index) => createFakeStem(`s${index + 1}`)));
    rerender(renderDialogElement(false));
    rerender(renderDialogElement(true));

    fireEvent.click(getDialogButton('Ableton Live'));
    expect(getDialogButton('Download .als').hasAttribute('disabled')).toBe(false);
  });
});
