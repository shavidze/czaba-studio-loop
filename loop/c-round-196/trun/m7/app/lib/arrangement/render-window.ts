import type { ArrangementRenderWindow } from '~/lib/arrangement/graph.client';

export const ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS = 0.001;

export function isValidArrangementRenderWindow(renderWindow: ArrangementRenderWindow): boolean {
  return (
    Number.isFinite(renderWindow.start) &&
    Number.isFinite(renderWindow.end) &&
    renderWindow.start >= 0 &&
    renderWindow.end - renderWindow.start >= ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS
  );
}

export function arrangementRangeRenderWindow(
  range: { start: number; end: number } | null | undefined,
): ArrangementRenderWindow | null {
  if (!range) {
    return null;
  }
  const renderWindow = {
    start: Math.min(range.start, range.end),
    end: Math.max(range.start, range.end),
  };
  return isValidArrangementRenderWindow(renderWindow) ? renderWindow : null;
}
