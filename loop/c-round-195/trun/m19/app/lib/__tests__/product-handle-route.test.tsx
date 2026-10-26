import type { MetaArgs, MetaDescriptor } from '@remix-run/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loader, meta } from '~/routes/products.$handle';
import { ApiError, apiClient, type Product } from '~/services/api/client';

vi.mock('~/components/product', () => ({ ProductDetailPage: () => null }));
vi.mock('~/components/loading', () => ({ ProductDetailSkeleton: () => null }));
vi.mock('~/components/errors', () => ({ RouteErrorBoundary: () => null }));
vi.mock('~/services/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/services/api/client')>();
  return {
    ...actual,
    apiClient: { getProductByHandle: vi.fn() },
  };
});

function createRouteProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Middle East',
    description: 'A fixture track.',
    category: 'Track',
    handle: 'middle-east',
    imageUrl: '/images/middle-east.jpg',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

function createLoaderArgs(handle: string | undefined) {
  return {
    request: new Request(`http://localhost/products/${handle ?? ''}`),
    params: handle === undefined ? {} : { handle },
    context: {},
  };
}

function createMetaArgs(product: Product | undefined): MetaArgs<typeof loader> {
  return {
    data: product ? { product } : undefined,
    params: { handle: product?.handle ?? 'missing' },
    location: {
      pathname: `/products/${product?.handle ?? 'missing'}`,
      search: '',
      hash: '',
      state: null,
      key: 'default',
    },
    matches: [],
  };
}

function runMeta(product: Product | undefined): MetaDescriptor[] {
  return meta(createMetaArgs(product)) ?? [];
}

function metaKey(descriptor: MetaDescriptor): string {
  if ('title' in descriptor) return 'title';
  if ('name' in descriptor) return `name:${String(descriptor.name)}`;
  if ('property' in descriptor) return `property:${String(descriptor.property)}`;
  return 'unknown';
}

function metaContent(descriptors: MetaDescriptor[], key: string): unknown {
  const match = descriptors.find((descriptor) => metaKey(descriptor) === key);
  if (!match) return undefined;
  if ('title' in match) return match.title;
  return 'content' in match ? match.content : undefined;
}

function descriptionTriple(descriptors: MetaDescriptor[]): unknown[] {
  return [
    metaContent(descriptors, 'name:description'),
    metaContent(descriptors, 'property:og:description'),
    metaContent(descriptors, 'name:twitter:description'),
  ];
}

async function catchLoaderResponse(handle: string): Promise<Response> {
  try {
    await loader(createLoaderArgs(handle));
  } catch (thrown) {
    if (thrown instanceof Response) return thrown;
    throw thrown;
  }
  throw new Error('loader resolved instead of throwing');
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('products.$handle loader', () => {
  it('L1: refuses an inactive product with a 404, not a 503', async () => {
    vi.mocked(apiClient.getProductByHandle).mockResolvedValue(
      createRouteProduct({ handle: 'archived-rain', isActive: false }),
    );
    const response = await catchLoaderResponse('archived-rain');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Product not found');
  });

  it('L2: returns an active product unchanged', async () => {
    const product = createRouteProduct({ isActive: true });
    vi.mocked(apiClient.getProductByHandle).mockResolvedValue(product);
    const response = await loader(createLoaderArgs('middle-east'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ product });
  });

  it('L2: returns a product with no isActive field unchanged', async () => {
    const product = createRouteProduct();
    Reflect.deleteProperty(product, 'isActive');
    vi.mocked(apiClient.getProductByHandle).mockResolvedValue(product);
    const response = await loader(createLoaderArgs('middle-east'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ product });
    expect('isActive' in body.product).toBe(false);
  });

  it('L3: maps an API 404 to 404 and any other error to 503', async () => {
    vi.mocked(apiClient.getProductByHandle).mockRejectedValueOnce(new ApiError('Missing', 404));
    expect((await catchLoaderResponse('gone')).status).toBe(404);
    vi.mocked(apiClient.getProductByHandle).mockRejectedValueOnce(new ApiError('Boom', 500));
    const unavailable = await catchLoaderResponse('broken');
    expect(unavailable.status).toBe(503);
    expect(await unavailable.text()).toBe('The product could not be loaded. Please try again.');
    vi.mocked(apiClient.getProductByHandle).mockRejectedValueOnce(new TypeError('fetch failed'));
    expect((await catchLoaderResponse('offline')).status).toBe(503);
  });
});

describe('products.$handle meta description', () => {
  it('M1: collapses whitespace and repeats the text in all three description tags', () => {
    const raw = '  Slow strings\n\nand  low   brass,\tlate night.  ';
    const descriptors = runMeta(createRouteProduct({ description: raw }));
    expect(descriptionTriple(descriptors)).toEqual([
      'Slow strings and low brass, late night.',
      'Slow strings and low brass, late night.',
      'Slow strings and low brass, late night.',
    ]);
  });

  it('M2: trims a 300-character description at a word boundary to at most 160 characters', () => {
    const words = Array.from({ length: 60 }, (_, index) => `word${index}`).join(' ');
    const description = words.slice(0, 300);
    expect(description).toHaveLength(300);
    const [text, og, twitter] = descriptionTriple(runMeta(createRouteProduct({ description })));
    expect(typeof text).toBe('string');
    const value = String(text);
    expect(value.length).toBeLessThanOrEqual(160);
    expect(value.endsWith('…')).toBe(true);
    const kept = value.slice(0, -1);
    expect(description.startsWith(kept)).toBe(true);
    expect(description.charAt(kept.length)).toBe(' ');
    expect(kept.endsWith(' ')).toBe(false);
    expect(description.indexOf(' ', kept.length + 1)).toBeGreaterThan(159);
    expect(og).toBe(value);
    expect(twitter).toBe(value);
  });

  it('M2: cuts at the last space at or before index 159 and never past it', () => {
    const a = 'a'.repeat(100);
    const cases = [
      {
        description: `${a} ${'b'.repeat(58)} ${'c'.repeat(20)}`,
        expected: `${a} ${'b'.repeat(58)}…`,
      },
      {
        description: `${a} ${'b'.repeat(57)} ${'c'.repeat(21)}`,
        expected: `${a} ${'b'.repeat(57)}…`,
      },
      { description: `${a} ${'b'.repeat(59)} ${'c'.repeat(19)}`, expected: `${a}…` },
      { description: `${'a'.repeat(80)} ${'b'.repeat(80)}`, expected: `${'a'.repeat(80)}…` },
    ];
    for (const { description, expected } of cases) {
      const [text] = descriptionTriple(runMeta(createRouteProduct({ description })));
      expect(text).toBe(expected);
      expect(String(text).length).toBeLessThanOrEqual(160);
    }
  });

  it('M2: hard-cuts a 300-character description with no spaces at 159 plus an ellipsis', () => {
    const description = 'x'.repeat(300);
    const [text] = descriptionTriple(runMeta(createRouteProduct({ description })));
    expect(text).toBe(`${'x'.repeat(159)}…`);
  });

  it('M2: keeps a description of exactly 160 characters unchanged', () => {
    const description = `${'a'.repeat(80)} ${'b'.repeat(79)}`;
    expect(description).toHaveLength(160);
    const [text] = descriptionTriple(runMeta(createRouteProduct({ description })));
    expect(text).toBe(description);
  });

  it('M3: uses the factual fallback for empty, blank or missing descriptions', () => {
    for (const description of ['', '   \n\t ', undefined]) {
      const track = runMeta(createRouteProduct({ title: 'Harbour Lights', description }));
      expect(descriptionTriple(track)).toEqual(Array(3).fill('Harbour Lights — Music by CZABA.'));
      const sfx = runMeta(
        createRouteProduct({ title: 'Door Slams', category: 'SFX', description }),
      );
      expect(descriptionTriple(sfx)).toEqual(Array(3).fill('Door Slams — Sound Effects by CZABA.'));
    }
    const nullDescription = createRouteProduct({ title: 'Night Train' });
    Reflect.set(nullDescription, 'description', null);
    expect(descriptionTriple(runMeta(nullDescription))).toEqual(
      Array(3).fill('Night Train — Music by CZABA.'),
    );
  });

  it('M4: keeps the not-found meta and the product meta keys, order and other values', () => {
    expect(runMeta(undefined)).toEqual([
      { title: 'Product Not Found | CZABA' },
      { name: 'description', content: 'The requested product could not be found.' },
    ]);
    const descriptors = runMeta(createRouteProduct());
    expect(descriptors.map(metaKey)).toEqual([
      'title',
      'name:description',
      'property:og:title',
      'property:og:description',
      'property:og:type',
      'property:og:image',
      'name:twitter:card',
      'name:twitter:title',
      'name:twitter:description',
      'name:twitter:image',
      'property:product:brand',
      'property:product:category',
    ]);
    expect(metaContent(descriptors, 'title')).toBe('Middle East | CZABA');
    expect(metaContent(descriptors, 'property:og:title')).toBe('Middle East | CZABA');
    expect(metaContent(descriptors, 'property:og:type')).toBe('product');
    expect(metaContent(descriptors, 'property:og:image')).toBe('/images/middle-east.jpg');
    expect(metaContent(descriptors, 'name:twitter:card')).toBe('summary_large_image');
    expect(metaContent(descriptors, 'name:twitter:image')).toBe('/images/middle-east.jpg');
    expect(metaContent(descriptors, 'property:product:brand')).toBe('CZABA');
    expect(metaContent(descriptors, 'property:product:category')).toBe('Music');
    const noImage = runMeta(createRouteProduct({ imageUrl: undefined }));
    expect(metaContent(noImage, 'property:og:image')).toBe('/og-image.jpg');
  });

  it('M5: no meta value repeats the old marketing template', () => {
    for (const product of [
      createRouteProduct(),
      createRouteProduct({ description: undefined }),
      createRouteProduct({ category: 'SFX', description: '' }),
    ]) {
      for (const descriptor of runMeta(product)) {
        for (const value of Object.values(descriptor)) {
          expect(String(value)).not.toContain('complete creative freedom');
          expect(String(value)).not.toContain('Studio-quality');
        }
      }
    }
  });
});
