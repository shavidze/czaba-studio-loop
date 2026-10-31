import { describe, expect, it } from 'vitest';
import type { Product } from '~/services/api/client';
import {
  createDisplayVersions,
  formatNumber,
  getArtistHandle,
  getVariantDisplayInfo,
  getVariantIdForVersion,
  mapProductType,
  parseTags,
} from '../product-utils';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Epic Score',
  category: 'Track',
  handle: 'epic-score',
  isNew: true,
  isPremium: false,
  isActive: true,
  createdAt: '2025-01-01',
  ...overrides,
});

describe('getVariantDisplayInfo', () => {
  it('returns Premium info for premium variant', () => {
    const info = getVariantDisplayInfo('Premium');
    expect(info.formats).toEqual([]);
    expect(info.quality).toBe('');
    expect(info.fileSize).toBe('');
    expect(info.isFeatured).toBe(true);
  });

  it('returns Premium info case-insensitive', () => {
    const info = getVariantDisplayInfo('premium');
    expect(info.isFeatured).toBe(true);
    expect(info.formats).not.toContain('Stems');
  });

  it('returns Standard info for non-premium variant', () => {
    const info = getVariantDisplayInfo('Standard');
    expect(info.formats).toEqual([]);
    expect(info.quality).toBe('');
    expect(info.fileSize).toBe('');
    expect(info.isFeatured).toBe(false);
  });

  it('returns Standard info for unknown variant name', () => {
    const info = getVariantDisplayInfo('Basic');
    expect(info.isFeatured).toBe(false);
    expect(info.formats).toEqual([]);
  });
});

describe('mapProductType', () => {
  it('maps sfx to Sound Effects', () => {
    expect(mapProductType('sfx')).toBe('Sound Effects');
  });

  it('maps SFX (uppercase) to Sound Effects', () => {
    expect(mapProductType('SFX')).toBe('Sound Effects');
  });

  it('maps "sound effects" to Sound Effects', () => {
    expect(mapProductType('sound effects')).toBe('Sound Effects');
  });

  it('maps presets to Presets', () => {
    expect(mapProductType('presets')).toBe('Presets');
  });

  it('maps preset (singular) to Presets', () => {
    expect(mapProductType('preset')).toBe('Presets');
  });

  it('maps track to Music', () => {
    expect(mapProductType('Track')).toBe('Music');
  });

  it('maps unknown category to Music', () => {
    expect(mapProductType('Loop')).toBe('Music');
  });
});

describe('parseTags', () => {
  it('returns empty array for undefined', () => {
    expect(parseTags(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('parses comma-separated tags', () => {
    expect(parseTags('cinematic,epic,trailer')).toEqual(['cinematic', 'epic', 'trailer']);
  });

  it('trims whitespace from tags', () => {
    expect(parseTags(' cinematic , epic , trailer ')).toEqual(['cinematic', 'epic', 'trailer']);
  });

  it('filters out empty strings', () => {
    expect(parseTags('cinematic,,epic,')).toEqual(['cinematic', 'epic']);
  });
});

describe('createDisplayVersions', () => {
  it('creates versions from product variants', () => {
    const product = mockProduct({
      variants: [
        {
          id: 1,
          productId: 1,
          name: 'Standard',
          price: 29.99,
          position: 1,
          createdAt: '2025-01-01',
        },
        {
          id: 2,
          productId: 1,
          name: 'Premium',
          price: 49.99,
          position: 2,
          createdAt: '2025-01-01',
        },
      ],
    });

    const versions = createDisplayVersions(product);
    expect(versions).toHaveLength(2);

    expect(versions[0].name).toBe('Standard');
    expect(versions[0].price).toBe(29.99);
    expect(versions[0].formats).toEqual([]);
    expect(versions[0].isFeatured).toBe(false);

    expect(versions[1].name).toBe('Premium');
    expect(versions[1].price).toBe(49.99);
    expect(versions[1].formats).not.toContain('Stems');
    expect(versions[1].isFeatured).toBe(true);
  });

  it('falls back to standardPrice when no variants', () => {
    const product = mockProduct({ standardPrice: 19.99, variants: undefined });
    const versions = createDisplayVersions(product);

    expect(versions).toHaveLength(1);
    expect(versions[0].name).toBe('Standard');
    expect(versions[0].price).toBe(19.99);
  });

  it('includes Premium version when premiumPrice exists', () => {
    const product = mockProduct({ standardPrice: 19.99, premiumPrice: 39.99, variants: undefined });
    const versions = createDisplayVersions(product);

    expect(versions).toHaveLength(2);
    expect(versions[0].name).toBe('Standard');
    expect(versions[0].price).toBe(19.99);
    expect(versions[1].name).toBe('Premium');
    expect(versions[1].price).toBe(39.99);
  });

  it('creates only Standard when no premiumPrice and no variants', () => {
    const product = mockProduct({ standardPrice: 9.99, variants: [] });
    const versions = createDisplayVersions(product);

    expect(versions).toHaveLength(1);
    expect(versions[0].name).toBe('Standard');
  });
});

describe('getArtistHandle', () => {
  it('returns lowercase handle', () => {
    expect(getArtistHandle('Czaba')).toBe('czaba');
  });

  it('replaces spaces with hyphens', () => {
    expect(getArtistHandle('John Smith')).toBe('john-smith');
  });

  it('replaces multiple spaces', () => {
    expect(getArtistHandle('John  Smith')).toBe('john-smith');
  });

  it('returns czaba for undefined vendor', () => {
    expect(getArtistHandle(undefined)).toBe('czaba');
  });

  it('returns czaba for empty string', () => {
    expect(getArtistHandle('')).toBe('czaba');
  });
});

describe('getVariantIdForVersion', () => {
  const product = mockProduct({
    variants: [
      {
        id: 10,
        productId: 1,
        name: 'Standard',
        price: 29.99,
        position: 1,
        createdAt: '2025-01-01',
      },
      { id: 20, productId: 1, name: 'Premium', price: 49.99, position: 2, createdAt: '2025-01-01' },
    ],
  });

  it('finds variant by name (case-insensitive)', () => {
    expect(getVariantIdForVersion(product, 'standard')).toBe(10);
    expect(getVariantIdForVersion(product, 'Premium')).toBe(20);
  });

  it('returns undefined for unknown version', () => {
    expect(getVariantIdForVersion(product, 'Enterprise')).toBeUndefined();
  });

  it('returns undefined when no variants', () => {
    const noVariants = mockProduct({ variants: undefined });
    expect(getVariantIdForVersion(noVariants, 'Standard')).toBeUndefined();
  });
});

describe('formatNumber', () => {
  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });

  it('formats thousands with k suffix', () => {
    expect(formatNumber(1000)).toBe('1.0k');
    expect(formatNumber(15000)).toBe('15.0k');
  });

  it('returns plain number for small values', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
  });
});

describe('Universal SFX offers', () => {
  it('shows only the canonical offer while retaining legacy variants in source data', () => {
    const product = mockProduct({
      category: 'SFX',
      variants: [
        { id: 19, productId: 1, name: 'Standard', price: 49, position: 1, createdAt: '2025-01-01' },
        {
          id: 20,
          productId: 1,
          name: 'Universal',
          price: 49,
          position: 2,
          createdAt: '2025-01-01',
        },
      ],
    });
    expect(createDisplayVersions(product).map((v) => v.name)).toEqual(['Universal']);
    expect(product.variants).toHaveLength(2);
    expect(createDisplayVersions({ ...product, category: 'Track' })).toHaveLength(2);
  });
  it('does not invent a purchasable SFX variant when none exists', () => {
    expect(createDisplayVersions(mockProduct({ category: 'SFX', variants: [] }))).toEqual([]);
  });
});

describe('purchase price resolution', () => {
  const withPriceFields = (json: string): Product => {
    const overrides: Partial<Product> = JSON.parse(json);
    return mockProduct(overrides);
  };

  it('PR1: follows the catalogue order standardPrice, minPrice, first variant price', async () => {
    const { resolveCatalogPrice } = await import('../product-utils');
    expect(resolveCatalogPrice(mockProduct({ standardPrice: 9, minPrice: 7 }))).toBe(9);
    expect(resolveCatalogPrice(mockProduct({ minPrice: 7 }))).toBe(7);
    expect(
      resolveCatalogPrice(
        mockProduct({
          variants: [
            {
              id: 3,
              productId: 1,
              name: 'Standard',
              price: 5,
              position: 1,
              createdAt: '2025-01-01',
            },
          ],
        }),
      ),
    ).toBe(5);
  });

  it('PR2: skips null, NaN and negative values and returns undefined when nothing is valid', async () => {
    const { resolveCatalogPrice } = await import('../product-utils');
    expect(resolveCatalogPrice(mockProduct())).toBeUndefined();
    expect(resolveCatalogPrice(withPriceFields('{"standardPrice":null,"minPrice":7}'))).toBe(7);
    expect(resolveCatalogPrice(mockProduct({ standardPrice: Number.NaN, minPrice: 7 }))).toBe(7);
    expect(resolveCatalogPrice(mockProduct({ standardPrice: -1, minPrice: 7 }))).toBe(7);
    expect(resolveCatalogPrice(mockProduct({ standardPrice: Number.NaN }))).toBeUndefined();
    expect(resolveCatalogPrice(mockProduct({ standardPrice: -1 }))).toBeUndefined();
  });

  it('PR3: keeps an explicit standardPrice of 0', async () => {
    const { resolveCatalogPrice } = await import('../product-utils');
    expect(resolveCatalogPrice(mockProduct({ standardPrice: 0, minPrice: 7 }))).toBe(0);
  });

  it('PR4: a real variant price wins over the catalogue price, and a non-finite one is unknown', async () => {
    const { resolvePurchasePrice } = await import('../product-utils');
    const product = mockProduct({
      standardPrice: 29,
      variants: [
        { id: 12, productId: 1, name: 'Premium', price: 49, position: 1, createdAt: '2025-01-01' },
      ],
    });
    const [version] = createDisplayVersions(product);
    expect(version?.id).toBe(12);
    expect(resolvePurchasePrice(product, version ?? null)).toBe(49);
    const broken = mockProduct({
      standardPrice: 29,
      variants: [
        {
          id: 12,
          productId: 1,
          name: 'Premium',
          price: Number.POSITIVE_INFINITY,
          position: 1,
          createdAt: '2025-01-01',
        },
      ],
    });
    const [brokenVersion] = createDisplayVersions(broken);
    expect(resolvePurchasePrice(broken, brokenVersion ?? null)).toBeUndefined();
  });

  it('PR5: no version uses the catalogue price, and the synthetic Standard of a priceless Track is unknown', async () => {
    const { resolvePurchasePrice } = await import('../product-utils');
    const sfx = mockProduct({ category: 'SFX', standardPrice: 9 });
    expect(createDisplayVersions(sfx)).toEqual([]);
    expect(resolvePurchasePrice(sfx, null)).toBe(9);
    const track = mockProduct({ category: 'Track' });
    const [standard] = createDisplayVersions(track);
    expect(standard?.id).toBe(-1);
    expect(standard?.price).toBeUndefined();
    expect(resolvePurchasePrice(track, standard ?? null)).toBeUndefined();
  });

  it('PR6: the synthetic Premium resolves to premiumPrice', async () => {
    const { resolvePurchasePrice } = await import('../product-utils');
    const track = mockProduct({ category: 'Track', standardPrice: 19, premiumPrice: 59 });
    const premium = createDisplayVersions(track).find((version) => version.id === -2);
    expect(premium?.name).toBe('Premium');
    expect(resolvePurchasePrice(track, premium ?? null)).toBe(59);
  });
});

describe('display version and card price labels', () => {
  it('PR7: the synthetic Standard is unknown without a price and keeps a known or explicit 0 price', () => {
    const findStandard = (product: Product) =>
      createDisplayVersions(product).find((version) => version.id === -1);
    const priceless = findStandard(mockProduct({ category: 'Track' }));
    expect(priceless).toBeDefined();
    expect(priceless?.price).toBeUndefined();
    expect(findStandard(mockProduct({ category: 'Track', standardPrice: 19 }))?.price).toBe(19);
    expect(findStandard(mockProduct({ category: 'Track', minPrice: 7 }))?.price).toBe(7);
    const free = findStandard(mockProduct({ category: 'Track', standardPrice: 0 }));
    expect(free?.price).toBe(0);
    expect(free?.price).not.toBeUndefined();
  });

  it('PR8: a real variant keeps a valid price and an invalid one becomes unknown', () => {
    const withVariantPrice = (price: number) =>
      createDisplayVersions(
        mockProduct({
          category: 'Track',
          variants: [
            { id: 31, productId: 1, name: 'Premium', price, position: 1, createdAt: '2025-01-01' },
          ],
        }),
      )[0];
    expect(withVariantPrice(49)?.price).toBe(49);
    expect(withVariantPrice(0)?.price).toBe(0);
    expect(withVariantPrice(Number.NaN)?.id).toBe(31);
    expect(withVariantPrice(Number.NaN)?.price).toBeUndefined();
    expect(withVariantPrice(-1)?.price).toBeUndefined();
  });

  it('PR9: formatCatalogPriceLabel names an unknown price and formats a known one', async () => {
    const { formatCatalogPriceLabel } = await import('../product-utils');
    expect(formatCatalogPriceLabel(undefined)).toBe('Price unavailable');
    expect(formatCatalogPriceLabel(0)).toBe('$0');
    expect(formatCatalogPriceLabel(29)).toBe('$29');
    expect(formatCatalogPriceLabel(12.5)).toBe('$12.5');
  });
});
