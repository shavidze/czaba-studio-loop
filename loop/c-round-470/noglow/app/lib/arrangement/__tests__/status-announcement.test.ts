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
    const next = reduceArrangementStatus(previous, 'b', false);
    expect(next).not.toBe(previous);
    expect(next).toEqual({ text: 'b', sequence: 5 });
    expect(previous).toEqual({ text: 'a', sequence: 4 });
  });

  it('SA3 the same string gives a new entry with the same text and sequence + 1, twice gives + 2', () => {
    const previous = createArrangementStatusEntry('same');
    const once = reduceArrangementStatus(previous, 'same', false);
    expect(once).not.toBe(previous);
    expect(once).toEqual({ text: 'same', sequence: 1 });
    const twice = reduceArrangementStatus(once, 'same', false);
    expect(twice).not.toBe(once);
    expect(twice).toEqual({ text: 'same', sequence: 2 });
  });

  it('SA4 an updater that returns the current text gives the same entry object', () => {
    const previous: ArrangementStatusEntry = { text: 'kept', sequence: 7 };
    const next = reduceArrangementStatus(previous, (current) => current, false);
    expect(next).toBe(previous);
    expect(next).toEqual({ text: 'kept', sequence: 7 });
  });

  it('SA5 an updater that returns a different text gives a new entry with sequence + 1', () => {
    const previous: ArrangementStatusEntry = { text: 'before', sequence: 2 };
    const updater = vi.fn((current: string) => `${current} after`);
    const next = reduceArrangementStatus(previous, updater, false);
    expect(next).not.toBe(previous);
    expect(next).toEqual({ text: 'before after', sequence: 3 });
    expect(updater).toHaveBeenCalledTimes(1);
    expect(updater).toHaveBeenCalledWith('before');
  });

  it('SA6 the same string during a gesture gives the same entry object', () => {
    const previous: ArrangementStatusEntry = { text: 'blocked', sequence: 9 };
    const next = reduceArrangementStatus(previous, 'blocked', true);
    expect(next).toBe(previous);
    expect(next).toEqual({ text: 'blocked', sequence: 9 });
  });

  it('SA7 outside a gesture the same string still bumps, and during a gesture a different string bumps', () => {
    const previous: ArrangementStatusEntry = { text: 'blocked', sequence: 9 };
    const outside = reduceArrangementStatus(previous, 'blocked', false);
    expect(outside).not.toBe(previous);
    expect(outside).toEqual({ text: 'blocked', sequence: 10 });
    const changed = reduceArrangementStatus(previous, 'Fade In: 1.000 წმ', true);
    expect(changed).not.toBe(previous);
    expect(changed).toEqual({ text: 'Fade In: 1.000 წმ', sequence: 10 });
  });
});
