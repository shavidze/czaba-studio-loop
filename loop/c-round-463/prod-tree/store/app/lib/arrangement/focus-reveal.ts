export interface FocusRevealScrollInput {
  scrollTop: number;
  chromeBottom: number;
  targetTop: number;
}

export const FOCUS_REVEAL_TOLERANCE_PX = 0.5;

export function resolveFocusRevealScrollTop(input: FocusRevealScrollInput): number | null {
  const { scrollTop, chromeBottom, targetTop } = input;
  if (
    !Number.isFinite(scrollTop) ||
    !Number.isFinite(chromeBottom) ||
    !Number.isFinite(targetTop)
  ) {
    return null;
  }
  const delta = chromeBottom - targetTop;
  if (delta <= FOCUS_REVEAL_TOLERANCE_PX) {
    return null;
  }
  return Math.max(0, scrollTop - delta);
}
