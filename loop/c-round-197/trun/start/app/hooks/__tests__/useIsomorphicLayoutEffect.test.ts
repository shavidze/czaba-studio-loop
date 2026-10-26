import { renderHook } from '@testing-library/react';
import { useEffect, useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';

describe('useIsomorphicLayoutEffect', () => {
  it('ISO1: in the browser it is React useLayoutEffect', () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it('ISO2: its callback runs before a sibling passive effect declared earlier', () => {
    const passiveRanBeforeLayout: boolean[] = [];
    let passiveRan = false;

    renderHook(() => {
      useEffect(() => {
        passiveRan = true;
      }, []);
      useIsomorphicLayoutEffect(() => {
        passiveRanBeforeLayout.push(passiveRan);
      }, []);
    });

    expect(passiveRan).toBe(true);
    expect(passiveRanBeforeLayout).toEqual([false]);
  });
});
