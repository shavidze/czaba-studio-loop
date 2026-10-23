import { describe, expect, it, vi } from 'vitest';
import {
  type ArrangementStatusEntry,
  createArrangementStatusEntry,
  reduceArrangementStatus,
} from '../status-announcement';

describe('reduceArrangementStatus (GATE96-S2)', () => {
  it('SA1 creates the initial entry with sequence 0', () => {
    expect(createArrangementStatusEntry('x')).toEqual({ text: 'x', sequence: 0 });
  });

  it('SA2 a different string gives a new entry with the exact text and sequence + 1', () => {
    const previous: ArrangementStatusEntry = { text: 'a', sequence: 4 };
    const next = reduceArrangementStatus(previous, 'b');
    expect(next).not.toBe(previous);
    expect(next).toEqual({ text: 'b', sequence: 5 });
    expect(previous).toEqual({ text: 'a', sequence: 4 });
  });

  it('SA3 the same string gives a new entry with the same text and sequence + 1, twice gives + 2', () => {
    const previous = createArrangementStatusEntry('same');
    const once = reduceArrangementStatus(previous, 'same');
    expect(once).not.toBe(previous);
    expect(once).toEqual({ text: 'same', sequence: 1 });
    const twice = reduceArrangementStatus(once, 'same');
    expect(twice).not.toBe(once);
    expect(twice).toEqual({ text: 'same', sequence: 2 });
  });

  it('SA4 an updater that returns the current text gives the same entry object', () => {
    const previous: ArrangementStatusEntry = { text: 'kept', sequence: 7 };
    const next = reduceArrangementStatus(previous, (current) => current);
    expect(next).toBe(previous);
    expect(next).toEqual({ text: 'kept', sequence: 7 });
  });

  it('SA5 an updater that returns a different text gives a new entry with sequence + 1', () => {
    const previous: ArrangementStatusEntry = { text: 'before', sequence: 2 };
    const updater = vi.fn((current: string) => `${current} after`);
    const next = reduceArrangementStatus(previous, updater);
    expect(next).not.toBe(previous);
    expect(next).toEqual({ text: 'before after', sequence: 3 });
    expect(updater).toHaveBeenCalledTimes(1);
    expect(updater).toHaveBeenCalledWith('before');
  });
});
