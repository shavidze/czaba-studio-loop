import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useStableHandler } from '~/hooks/useStableHandler';

describe('useStableHandler', () => {
  it('SH1: the returned function keeps its identity across rerenders with a new handler', () => {
    const { result, rerender } = renderHook(({ handler }) => useStableHandler(handler), {
      initialProps: { handler: (value: number) => value + 1 },
    });
    const first = result.current;

    rerender({ handler: (value: number) => value + 2 });

    expect(result.current).toBe(first);
  });

  it('SH2: after a rerender it calls the latest handler, not the first one', () => {
    const firstHandler = vi.fn(() => 'first');
    const latestHandler = vi.fn(() => 'latest');
    const { result, rerender } = renderHook(({ handler }) => useStableHandler(handler), {
      initialProps: { handler: firstHandler },
    });

    rerender({ handler: latestHandler });

    expect(result.current()).toBe('latest');
    expect(firstHandler).not.toHaveBeenCalled();
    expect(latestHandler).toHaveBeenCalledTimes(1);
  });

  it('SH3: arguments and the return value pass through', () => {
    const { result } = renderHook(({ handler }) => useStableHandler(handler), {
      initialProps: { handler: (left: number, label: string) => `${label}:${left * 2}` },
    });

    expect(result.current(21, 'gain')).toBe('gain:42');
  });

  it('SH4: rendering alone never calls the handler', () => {
    const handler = vi.fn((value: number) => value);
    const { result, rerender } = renderHook(({ current }) => useStableHandler(current), {
      initialProps: { current: handler },
    });

    rerender({ current: handler });
    rerender({ current: handler });
    expect(handler).toHaveBeenCalledTimes(0);

    result.current(1);
    result.current(2);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(2, 2);
  });
});
