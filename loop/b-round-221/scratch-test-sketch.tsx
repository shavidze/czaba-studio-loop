import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface MockStem {
  id: string;
  name: string;
  isMuted: boolean;
  isSoloed: boolean;
  volume: number;
}

const studio = {
  state: { stems: [] as MockStem[], isExporting: false, exportProgress: 0, productTitle: 'Middle East' },
  exportAudio: vi.fn(async () => new Blob(['x'])),
};

vi.mock('~/contexts/StudioContext', () => ({
  useStudio: () => studio,
}));

import { ExportDialog } from '~/components/studio/ExportDialog';

function stems(ids: string[]): MockStem[] {
  return ids.map((id) => ({ id, name: `Stem ${id}`, isMuted: false, isSoloed: false, volume: 1 }));
}
const ui = (open: boolean) => <ExportDialog isOpen={open} onClose={() => {}} />;
const boxes = () => within(screen.getByRole('dialog')).getAllByRole('checkbox');
const checked = () => boxes().filter((b) => b instanceof HTMLInputElement && b.checked).length;

beforeEach(() => {
  studio.state.stems = [];
  studio.exportAudio.mockClear();
});

describe('legacy ExportDialog stem selection', () => {
  it('ES1 empty at mount, 10 stems loaded, open -> 10/10 and Export Audio enabled', () => {
    const r = render(ui(false));
    studio.state = { ...studio.state, stems: stems(['0','1','2','3','4','5','6','7','8','9']) };
    r.rerender(ui(false));
    r.rerender(ui(true));
    expect(boxes()).toHaveLength(10);
    expect(checked()).toBe(10);
    expect(screen.getByRole('button', { name: /export audio/i }).hasAttribute('disabled')).toBe(false);
    expect(screen.getAllByRole('button', { name: 'Deselect All' })).toHaveLength(1);
  });
  it('ES3 deselect one, mute-style same-id update -> still 9', () => {
    studio.state = { ...studio.state, stems: stems(['a','b','c']) };
    const r = render(ui(true));
    fireEvent.click(boxes()[1]);
    expect(checked()).toBe(2);
    studio.state = { ...studio.state, stems: stems(['a','b','c']).map((s) => ({ ...s, isMuted: s.id === 'a' })) };
    r.rerender(ui(true));
    expect(checked()).toBe(2);
    r.rerender(ui(false));
    r.rerender(ui(true));
    expect(checked()).toBe(2);
  });
  it('ES5 id set replaced -> all new selected, export payload', async () => {
    studio.state = { ...studio.state, stems: stems(['a','b']) };
    const r = render(ui(true));
    fireEvent.click(boxes()[0]);
    studio.state = { ...studio.state, stems: stems(['x','y']) };
    r.rerender(ui(true));
    expect(checked()).toBe(2);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /export audio/i })); });
    expect(studio.exportAudio).toHaveBeenCalledWith(expect.objectContaining({ includedStemIds: ['x','y'] }));
  });
});
