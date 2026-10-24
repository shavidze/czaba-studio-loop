// @vitest-environment node
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { expect, it, vi } from 'vitest';
import StudioLabRoute from '~/routes/studio-lab';

vi.mock('/home/runner/czaba-project/store/node_modules/@remix-run/react/dist/esm/index.js', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) =>
    createElement('a', { href: to, className }, children),
}));

it('probe', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  renderToString(createElement(StudioLabRoute));
  console.log('CALLS', JSON.stringify(spy.mock.calls.map((c) => String(c[0]).slice(0, 300))));
  expect(true).toBe(true);
});
