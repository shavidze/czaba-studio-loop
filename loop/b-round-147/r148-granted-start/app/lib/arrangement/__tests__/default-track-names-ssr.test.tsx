// @vitest-environment node
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudioLabRoute from '~/routes/studio-lab';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const ACTIVE_TRACK_SUFFIX = ' — set as the active track';
const GEORGIAN_DEFAULT_GROUP_NAME = new RegExp(
  `${String.fromCodePoint(0x10ef, 0x10d2, 0x10e3, 0x10e4, 0x10d8)} \\d`,
);

function activeTrackAriaLabels(html: string): string[] {
  return [...html.matchAll(/aria-label="([^"]*)"/g)]
    .map((match) => match[1] ?? '')
    .filter((label) => label.includes(ACTIVE_TRACK_SUFFIX));
}

describe('studio-lab default track names on the server', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('DS1: the four track-name buttons carry the English default names', () => {
    const labels = activeTrackAriaLabels(renderToString(<StudioLabRoute />));

    expect(labels).toEqual([
      'Video — set as the active track',
      'Music — set as the active track',
      'Stems — set as the active track',
      'SFX — set as the active track',
    ]);
  });

  it('DS2: no default group name or Georgian default track name reaches the track headers', () => {
    const html = renderToString(<StudioLabRoute />);
    const labels = activeTrackAriaLabels(html);

    expect(labels).toHaveLength(4);
    expect(html).not.toMatch(GEORGIAN_DEFAULT_GROUP_NAME);
    for (const label of labels) {
      for (const georgianName of ['ვიდეო', 'მუსიკა', 'სტემები', 'აუდიო']) {
        expect(label, georgianName).not.toContain(georgianName);
      }
    }
  });
});
