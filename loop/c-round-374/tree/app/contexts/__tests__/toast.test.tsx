import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastContext, ToastProvider } from '../ToastContext';

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with no toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('showToast (string type API)', () => {
    it('adds a success toast with string type', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Item added!', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Item added!');
      expect(result.current.toasts[0].type).toBe('success');
    });

    it('adds an error toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Something failed', 'error');
      });

      expect(result.current.toasts[0].type).toBe('error');
    });

    it('defaults to success when no type provided', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Hello');
      });

      expect(result.current.toasts[0].type).toBe('success');
    });
  });

  describe('showToast (options object API)', () => {
    it('accepts options object with type', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Warning message', { type: 'warning' });
      });

      expect(result.current.toasts[0].type).toBe('warning');
    });

    it('accepts options object with title', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Details here', { title: 'Heads up', type: 'info' });
      });

      expect(result.current.toasts[0].title).toBe('Heads up');
      expect(result.current.toasts[0].message).toBe('Details here');
      expect(result.current.toasts[0].type).toBe('info');
    });

    it('defaults to success when options has no type', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('No type', { title: 'Test' });
      });

      expect(result.current.toasts[0].type).toBe('success');
    });
  });

  describe('auto-removal', () => {
    it('removes toast after 4 seconds', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Temporary');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('does not remove toast before 4 seconds', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Still here');
      });

      act(() => {
        vi.advanceTimersByTime(3999);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('removeToast (manual)', () => {
    it('removes specific toast by ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('First', 'success');
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('does nothing when removing non-existent ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Exists');
      });

      act(() => {
        result.current.removeToast('toast-nonexistent');
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('multiple concurrent toasts', () => {
    it('supports multiple toasts at once', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
        result.current.showToast('First');
      });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.001Z'));
        result.current.showToast('Second');
      });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.002Z'));
        result.current.showToast('Third');
      });

      expect(result.current.toasts).toHaveLength(3);
    });

    it('auto-removes toasts independently', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
        result.current.showToast('First');
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.showToast('Second');
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Second');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('toast IDs', () => {
    it('generates unique IDs with toast- prefix', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
        result.current.showToast('A');
      });

      act(() => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.001Z'));
        result.current.showToast('B');
      });

      const ids = result.current.toasts.map((t) => t.id);
      expect(ids[0]).toMatch(/^toast-/);
      expect(ids[1]).toMatch(/^toast-/);
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('_BUG potential ID collision when Date.now() returns same ms', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

      act(() => {
        result.current.showToast('Toast A');
        result.current.showToast('Toast B');
      });

      const ids = result.current.toasts.map((t) => t.id);
      expect(ids[0]).toBe(ids[1]);
    });
  });
});
