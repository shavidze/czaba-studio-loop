import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '~/services/api/client';

const loaderState = vi.hoisted((): { data: unknown } => ({ data: undefined }));
const apiSpies = vi.hoisted(() => ({ getProducts: vi.fn() }));

vi.mock('@remix-run/react', () => ({
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Form: ({ children, className }: { children: ReactNode; className?: string }) => (
    <form className={className}>{children}</form>
  ),
  useLoaderData: () => loaderState.data,
  useNavigation: () => ({ state: 'idle', location: undefined }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));
vi.mock('~/components/audio', () => ({
  AudioPreviewButton: () => <button type="button">Play preview</button>,
}));
vi.mock('~/components/errors', () => ({ RouteErrorBoundary: () => null }));
vi.mock('~/services/api', () => ({ apiClient: { getProducts: apiSpies.getProducts } }));

import { ProductCard } from '~/components/product/ProductCard';
import { VersionSelector } from '~/components/product/VersionSelector';
import { createDisplayVersions, type DisplayVersion } from '~/lib/product-utils';
import StorePage, { loader } from '~/routes/store';

function createCardProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 9,
    title: 'Priceless Pack',
    handle: 'priceless-pack',
    category: 'Track',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-31',
    ...overrides,
  };
}

function renderVersions(
  versions: DisplayVersion[],
  owned?: { type: 'standard'; price: number },
): string {
  const [first] = versions;
  if (!first) throw new Error('fixture has no versions');
  return renderToStaticMarkup(
    <VersionSelector
      versions={versions}
      selectedVersion={first}
      onSelectVersion={() => {}}
      ownedVersionType={owned?.type}
      ownedVersionPrice={owned?.price}
    />,
  );
}

function renderStoreCards(): string {
  return renderToStaticMarkup(<StorePage />);
}

describe('version card price slot', () => {
  it('VC1: a priceless Track shows Price unavailable and no dollar sign', () => {
    const versions = createDisplayVersions(createCardProduct({ handle: 'priceless-track' }));
    expect(versions).toHaveLength(1);
    const html = renderVersions(versions);
    expect(html).toContain('Price unavailable');
    expect(html).not.toContain('$');
  });

  it('VC2: an unknown Standard next to a known Premium shows each state', () => {
    const versions = createDisplayVersions(createCardProduct({ premiumPrice: 99 }));
    expect(versions.map((version) => version.name)).toEqual(['Standard', 'Premium']);
    const html = renderVersions(versions);
    expect(html).toContain('Price unavailable');
    expect(html).toMatch(/\$(<!-- -->)?99/);
    expect(html).not.toMatch(/\$(<!-- -->)?0(?!\d)/);
    expect(html).not.toContain('NaN');
  });

  it('VC3: an upgrade to an unknown Premium price shows Upgrade and Price unavailable only', () => {
    const versions = createDisplayVersions(
      createCardProduct({
        variants: [
          {
            id: 12,
            productId: 9,
            name: 'Standard',
            price: 80,
            position: 1,
            createdAt: '2026-10-31',
          },
          {
            id: 13,
            productId: 9,
            name: 'Premium',
            price: Number.NaN,
            position: 2,
            createdAt: '2026-10-31',
          },
        ],
      }),
    );
    const html = renderVersions(versions, { type: 'standard', price: 50 });
    expect(html).toContain('Upgrade');
    expect(html).toContain('Price unavailable');
    expect(html).not.toContain('+$');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('$');
  });

  it('VC4: known prices keep their upgrade and plain price slots', () => {
    const upgradeVersions = createDisplayVersions(
      createCardProduct({
        variants: [
          {
            id: 12,
            productId: 9,
            name: 'Standard',
            price: 80,
            position: 1,
            createdAt: '2026-10-31',
          },
          {
            id: 13,
            productId: 9,
            name: 'Premium',
            price: 199,
            position: 2,
            createdAt: '2026-10-31',
          },
        ],
      }),
    );
    const upgradeHtml = renderVersions(upgradeVersions, { type: 'standard', price: 50 });
    expect(upgradeHtml).toMatch(/\+\$(<!-- -->)?149/);
    expect(upgradeHtml).toMatch(/line-through">\$(<!-- -->)?199/);
    expect(upgradeHtml).not.toContain('Price unavailable');

    const plainVersions = createDisplayVersions(
      createCardProduct({
        category: 'SFX',
        standardPrice: 49,
        variants: [
          {
            id: 20,
            productId: 9,
            name: 'Universal',
            price: 49,
            position: 1,
            createdAt: '2026-10-31',
          },
        ],
      }),
    );
    const plainHtml = renderVersions(plainVersions);
    expect(plainHtml).toMatch(/text-xl font-light text-foreground">\$(<!-- -->)?49/);
    expect(plainHtml).not.toContain('Price unavailable');

    const freeHtml = renderVersions(
      createDisplayVersions(createCardProduct({ category: 'Track', standardPrice: 0 })),
    );
    expect(freeHtml).toMatch(/text-xl font-light text-foreground">\$(<!-- -->)?0</);
    expect(freeHtml).not.toContain('Price unavailable');
  });
});

describe('home product card price', () => {
  it('PC1: an SFX product with no price is not free and shows Price unavailable', () => {
    const html = renderToStaticMarkup(
      <ProductCard product={createCardProduct({ category: 'SFX' })} />,
    );
    expect(html).toContain('Price unavailable');
    expect(html).toContain('text-sm font-light text-muted');
    expect(html).not.toContain('Complimentary');
    expect(html).not.toContain('$');
    expect(html).toMatch(/>Pack</);
  });

  it('PC2: an explicit 0 stays Complimentary and a known price stays a dollar figure', () => {
    const freeHtml = renderToStaticMarkup(
      <ProductCard product={createCardProduct({ category: 'SFX', standardPrice: 0 })} />,
    );
    expect(freeHtml).toContain('text-lg font-bold text-foreground">Complimentary<');
    expect(freeHtml).not.toContain('Price unavailable');
    expect(freeHtml).not.toContain('text-sm font-light text-muted');

    const paidHtml = renderToStaticMarkup(
      <ProductCard product={createCardProduct({ category: 'SFX', standardPrice: 9 })} />,
    );
    expect(paidHtml).toContain('text-lg font-bold text-foreground">$9<');
    expect(paidHtml).not.toContain('Complimentary');
    expect(paidHtml).not.toContain('Price unavailable');
    expect(paidHtml).not.toContain('$0');
  });
});

describe('/store card price', () => {
  beforeEach(() => {
    apiSpies.getProducts.mockReset();
    loaderState.data = undefined;
  });

  it('SC1: the route loader maps a priceless pack to Price unavailable and a known one to its price', async () => {
    apiSpies.getProducts.mockResolvedValue({
      items: [
        createCardProduct({ id: 9, title: 'Priceless Pack', category: 'SFX' }),
        createCardProduct({
          id: 3,
          title: 'Known Pack',
          handle: 'known-pack',
          category: 'SFX',
          standardPrice: 29,
        }),
        createCardProduct({
          id: 5,
          title: 'Free Pack',
          handle: 'free-pack',
          category: 'SFX',
          standardPrice: 0,
          minPrice: 0,
        }),
      ],
    });
    const response = await loader({
      request: new Request('http://localhost/store'),
      params: {},
      context: {},
    });
    loaderState.data = await response.json();
    const html = renderStoreCards();
    const cardFor = (handle: string): string => {
      const start = html.indexOf(`href="/products/${handle}"`);
      expect(start).toBeGreaterThan(-1);
      const end = html.indexOf('href="/products/', start + 1);
      return html.slice(start, end === -1 ? undefined : end);
    };
    const priceless = cardFor('priceless-pack');
    expect(priceless).toContain(
      '<span class="text-sm font-light text-muted">Price unavailable</span>',
    );
    expect(priceless).not.toContain('$');
    expect(cardFor('known-pack')).toContain(
      '<span class="text-2xl font-bold text-foreground">$29</span>',
    );
    const free = cardFor('free-pack');
    expect(free).toContain('<span class="text-2xl font-bold text-foreground">$0</span>');
    expect(free).not.toContain('Price unavailable');
  });
});
