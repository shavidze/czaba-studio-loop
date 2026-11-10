import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RouteTransition } from '../RouteTransition';

function Page({ label }: { label: string }) {
  return <p data-testid="page">{label}</p>;
}

describe('RouteTransition', () => {
  it('RT1: a studio path renders the wrapper with no inline opacity on the server', () => {
    const html = renderToString(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="studio" />
      </RouteTransition>,
    );
    expect(html).toContain('class="page-transition-wrapper"');
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it('RT2: a store path keeps the motion fade (inline opacity 0 on the server)', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <RouteTransition pathname="/" isStudioPage={false}>
          <Page label="home" />
        </RouteTransition>
      </MemoryRouter>,
    );
    expect(html).toContain('class="page-transition-wrapper"');
    expect(html).toMatch(/opacity:\s*0/);
  });

  it('RT3: a studio path change remounts the page', () => {
    const { rerender, getByTestId } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <Page label="a" />
      </RouteTransition>,
    );
    const first = getByTestId('page');
    rerender(
      <RouteTransition pathname="/studio/b" isStudioPage>
        <Page label="b" />
      </RouteTransition>,
    );
    expect(getByTestId('page')).not.toBe(first);
  });

  it('RT4: the same studio path keeps the page mounted', () => {
    const { rerender, getByTestId } = render(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="x" />
      </RouteTransition>,
    );
    const first = getByTestId('page');
    rerender(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="y" />
      </RouteTransition>,
    );
    expect(getByTestId('page')).toBe(first);
  });
});
