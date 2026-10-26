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
