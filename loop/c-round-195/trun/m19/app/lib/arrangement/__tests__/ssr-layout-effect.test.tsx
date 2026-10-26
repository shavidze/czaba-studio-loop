// @vitest-environment node
import { type ReactNode, useLayoutEffect } from 'react';
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

const SERVER_LAYOUT_EFFECT_WARNING = 'useLayoutEffect does nothing on the server';

function serverLayoutEffectWarningFrames(calls: unknown[][]): string[] {
  return calls
    .map((args) => args.map((arg) => String(arg)).join(' '))
    .filter((text) => text.includes(SERVER_LAYOUT_EFFECT_WARNING))
    .map((text) => /\n\s+at (\S+)/.exec(text)?.[1] ?? 'unknown');
}

function ServerLayoutEffectProbe() {
  useLayoutEffect(() => undefined, []);
  return null;
}

describe('studio-lab server rendering', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('SSR1: renderToString of the studio-lab route emits no useLayoutEffect server warning', () => {
    renderToString(<StudioLabRoute />);

    expect(serverLayoutEffectWarningFrames(consoleErrorSpy.mock.calls)).toEqual([]);
  });

  it('SSR2: the server HTML contains the real ruler and detail panel', () => {
    const html = renderToString(<StudioLabRoute />);

    expect(html).toContain('data-testid="arrangement-ruler"');
    expect(html).toContain('data-testid="arrangement-detail-panel"');
  });

  it('SSR3: the file runs without a window, as the dev server does', () => {
    expect(typeof window).toBe('undefined');
  });

  it('SSR4: a bare useLayoutEffect probe is detected with its component frame', () => {
    renderToString(<ServerLayoutEffectProbe />);

    expect(serverLayoutEffectWarningFrames(consoleErrorSpy.mock.calls)).toEqual([
      'ServerLayoutEffectProbe',
    ]);
  });
});
