import { describe, expect, it } from 'vitest';
import { createArrangementStatusPreviewStore, statusPreviewKey } from '../status-preview-store';

describe('status preview store', () => {
  it('SP1 a new text replaces the preview and an equal text keeps the same object', () => {
    const store = createArrangementStatusPreviewStore();
    expect(store.getState().preview).toBeNull();
    store.getState().showPreview('Fade In: 1.000 s');
    const first = store.getState().preview;
    expect(first).toEqual({ text: 'Fade In: 1.000 s', sequence: 1 });
    store.getState().showPreview('Fade In: 1.000 s');
    expect(store.getState().preview).toBe(first);
    store.getState().showPreview('Fade In: 2.000 s');
    expect(store.getState().preview).toEqual({ text: 'Fade In: 2.000 s', sequence: 2 });
  });

  it('SP2 the sequence keeps counting after a clear, so a later key never repeats', () => {
    const store = createArrangementStatusPreviewStore();
    store.getState().showPreview('a');
    store.getState().clearPreview();
    expect(store.getState().preview).toBeNull();
    store.getState().showPreview('a');
    expect(store.getState().preview?.sequence).toBe(2);
  });

  it('SP3 the key is derived from the sequence and differs per write', () => {
    expect(statusPreviewKey({ text: 'x', sequence: 3 })).toBe('preview-3');
    expect(statusPreviewKey({ text: 'x', sequence: 4 })).not.toBe('preview-3');
  });
});
