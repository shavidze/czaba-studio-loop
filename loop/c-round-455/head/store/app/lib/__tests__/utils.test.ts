import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cn } from '../utils';
import { debounce } from '../utils/debounce';
import { getErrorMessage } from '../utils/getErrorMessage';

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('something broke'))).toBe('something broke');
  });

  it('returns string errors as-is', () => {
    expect(getErrorMessage('raw error string')).toBe('raw error string');
  });

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
  });

  it('returns fallback for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
  });

  it('returns fallback for number', () => {
    expect(getErrorMessage(42)).toBe('An unknown error occurred');
  });

  it('returns fallback for object without message', () => {
    expect(getErrorMessage({ code: 500 })).toBe('An unknown error occurred');
  });

  it('returns fallback for boolean', () => {
    expect(getErrorMessage(false)).toBe('An unknown error occurred');
  });

  it('handles empty string', () => {
    expect(getErrorMessage('')).toBe('');
  });

  it('extracts message from Error subclass', () => {
    expect(getErrorMessage(new TypeError('type error'))).toBe('type error');
  });

  it('extracts message from RangeError', () => {
    expect(getErrorMessage(new RangeError('out of range'))).toBe('out of range');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls function after specified delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('passes arguments to the debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('hello', 42);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('hello', 42);
  });

  it('uses last call arguments when called multiple times', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('second');
    debounced('third');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('can be called again after firing', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced('second');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('handles zero delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 0);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('handles rapid fire (10 calls in quick succession)', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    for (let i = 0; i < 10; i++) {
      debounced(i);
      vi.advanceTimersByTime(50);
    }

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(9);
  });
});

describe('cn', () => {
  it('merges simple classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves conflicting Tailwind classes (last wins)', () => {
    const result = cn('text-sm', 'text-lg');
    expect(result).toBe('text-lg');
  });

  it('resolves conflicting padding', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('base');
    expect(result).toContain('active');
  });

  it('filters out falsy values', () => {
    const result = cn('base', false, null, undefined, 0, '', 'end');
    expect(result).toBe('base end');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('merges array of classes', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toBe('px-4 py-2');
  });

  it('resolves conflicting colors', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });
});
