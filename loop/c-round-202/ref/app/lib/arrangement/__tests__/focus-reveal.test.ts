import { describe, expect, it } from 'vitest';
import { resolveFocusRevealScrollTop } from '../focus-reveal';

describe('resolveFocusRevealScrollTop (C-R196-02 / R91)', () => {
  it('FRU-1: a target 46 px under the chrome bottom scrolls up by 46 px, to 0', () => {
    expect(resolveFocusRevealScrollTop({ scrollTop: 46, chromeBottom: 313, targetTop: 267 })).toBe(
      0,
    );
  });

  it('FRU-1b: a partial overlap scrolls up by exactly the hidden amount', () => {
    expect(resolveFocusRevealScrollTop({ scrollTop: 46, chromeBottom: 313, targetTop: 303 })).toBe(
      36,
    );
  });

  it('FRU-2: a target at or below the chrome bottom needs no scroll', () => {
    expect(
      resolveFocusRevealScrollTop({ scrollTop: 46, chromeBottom: 313, targetTop: 313 }),
    ).toBeNull();
    expect(
      resolveFocusRevealScrollTop({ scrollTop: 46, chromeBottom: 313, targetTop: 400 }),
    ).toBeNull();
  });

  it('FRU-3: the result is never negative', () => {
    expect(resolveFocusRevealScrollTop({ scrollTop: 10, chromeBottom: 313, targetTop: 267 })).toBe(
      0,
    );
    expect(resolveFocusRevealScrollTop({ scrollTop: 0, chromeBottom: 313, targetTop: 100 })).toBe(
      0,
    );
  });

  it('FRU-4: an overlap of 0.5 px is tolerated; 0.6 px is revealed', () => {
    expect(
      resolveFocusRevealScrollTop({ scrollTop: 46, chromeBottom: 313, targetTop: 312.5 }),
    ).toBeNull();
    const revealed = resolveFocusRevealScrollTop({
      scrollTop: 46,
      chromeBottom: 313,
      targetTop: 312.4,
    });
    expect(revealed).not.toBeNull();
    expect(revealed ?? Number.NaN).toBeCloseTo(45.4, 6);
  });

  it('FRU-5: NaN or Infinity in any input gives null', () => {
    const base = { scrollTop: 46, chromeBottom: 313, targetTop: 267 };
    const keys: ReadonlyArray<keyof typeof base> = ['scrollTop', 'chromeBottom', 'targetTop'];
    for (const key of keys) {
      for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        expect(resolveFocusRevealScrollTop({ ...base, [key]: bad }), `${key}=${bad}`).toBeNull();
      }
    }
  });
});
