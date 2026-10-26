import { describe, expect, it, vi } from 'vitest';
import { backendProductToProductDetail } from '../adapters/productAdapter';
import type { ProductVariant as BackendVariant, Product } from '../client';

vi.mock('~/lib/r2.config', () => ({
  normalizePreviewUrl: (value?: string) => value || '',
  getPreviewUrl: (handle: string) => `https://r2.example.com/previews/${handle}.mp3`,
}));

const mockBackendProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Epic Cinematic Score',
  category: 'Track',
  handle: 'epic-cinematic-score',
  isNew: true,
  isPremium: false,
  isActive: true,
  createdAt: '2025-06-15T10:30:00',
  standardPrice: 29.99,
  vendor: 'CZABA',
  genre: 'Cinematic',
  bpm: 120,
  key: 'Am',
  tags: 'cinematic,epic,trailer',
  ...overrides,
});

const mockVariant = (overrides: Partial<BackendVariant> = {}): BackendVariant => ({
  id: 10,
  productId: 1,
  name: 'Standard',
  price: 29.99,
  position: 1,
  createdAt: '2025-01-01',
  ...overrides,
});

describe('backendProductToProductDetail', () => {
  it('transforms basic product fields correctly', () => {
    const result = backendProductToProductDetail(mockBackendProduct());

    expect(result.id).toBe('1');
    expect(result.title).toBe('Epic Cinematic Score');
    expect(result.handle).toBe('epic-cinematic-score');
    expect(result.artist).toBe('CZABA');
    expect(result.artistHandle).toBe('czaba');
    expect(result.bpm).toBe(120);
    expect(result.musicalKey).toBe('Am');
    expect(result.genre).toBe('Cinematic');
    expect(result.plays).toBe(0);
    expect(result.likes).toBe(0);
    expect(result.relatedTracks).toEqual([]);
  });

  it('extracts publishedAt date from createdAt with T separator', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ createdAt: '2025-06-15T10:30:00' }),
    );
    expect(result.publishedAt).toBe('2025-06-15');
  });

  it('uses fallback artist when vendor is empty', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ vendor: '' }));
    expect(result.artist).toBe('CZABA');
    expect(result.artistHandle).toBe('czaba');
  });

  it('uses fallback artist when vendor is undefined', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ vendor: undefined }));
    expect(result.artist).toBe('CZABA');
  });

  it('converts vendor with spaces to hyphenated handle', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ vendor: 'John Smith' }));
    expect(result.artistHandle).toBe('john-smith');
  });

  it('converts vendor with multiple spaces', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ vendor: 'John  Michael  Smith' }),
    );
    expect(result.artistHandle).toBe('john-michael-smith');
  });

  it('uses empty string when imageUrl is missing', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ imageUrl: undefined }));
    expect(result.featuredImage).toBe('');
  });

  it('uses imageUrl when provided', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ imageUrl: 'https://cdn.example.com/img.jpg' }),
    );
    expect(result.featuredImage).toBe('https://cdn.example.com/img.jpg');
  });

  it('falls back to R2 preview URL when audioPreviewUrl is missing', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ audioPreviewUrl: undefined }),
    );
    expect(result.audioPreviewUrl).toBe('https://r2.example.com/previews/epic-cinematic-score.mp3');
  });

  it('uses audioPreviewUrl when provided', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ audioPreviewUrl: 'https://cdn.example.com/preview.mp3' }),
    );
    expect(result.audioPreviewUrl).toBe('https://cdn.example.com/preview.mp3');
  });

  it('defaults bpm to 0 when missing', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ bpm: undefined }));
    expect(result.bpm).toBe(0);
  });

  it('defaults musicalKey to "-" when missing', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ key: undefined }));
    expect(result.musicalKey).toBe('-');
  });

  it('defaults genre to "Music" when missing', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ genre: undefined }));
    expect(result.genre).toBe('Music');
  });
});

describe('mapCategory (via backendProductToProductDetail)', () => {
  it('maps "sfx" to Sound Effects', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'sfx' }));
    expect(result.productType).toBe('Sound Effects');
  });

  it('maps "SFX" (uppercase) to Sound Effects', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'SFX' }));
    expect(result.productType).toBe('Sound Effects');
  });

  it('maps "sound effects" to Sound Effects', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'sound effects' }));
    expect(result.productType).toBe('Sound Effects');
  });

  it('maps "presets" to Presets', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'presets' }));
    expect(result.productType).toBe('Presets');
  });

  it('maps "preset" (singular) to Presets', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'preset' }));
    expect(result.productType).toBe('Presets');
  });

  it('maps "Track" to Music', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'Track' }));
    expect(result.productType).toBe('Music');
  });

  it('maps unknown category to Music', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ category: 'Loop' }));
    expect(result.productType).toBe('Music');
  });
});

describe('parseTags (via backendProductToProductDetail)', () => {
  it('parses comma-separated tags', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ tags: 'cinematic,epic,trailer' }),
    );
    expect(result.tags).toEqual(['cinematic', 'epic', 'trailer']);
  });

  it('trims whitespace from tags', () => {
    const result = backendProductToProductDetail(
      mockBackendProduct({ tags: ' cinematic , epic , trailer ' }),
    );
    expect(result.tags).toEqual(['cinematic', 'epic', 'trailer']);
  });

  it('returns empty array for undefined tags', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ tags: undefined }));
    expect(result.tags).toEqual([]);
  });

  it('returns empty array for empty string tags', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ tags: '' }));
    expect(result.tags).toEqual([]);
  });

  it('filters out empty segments from double commas', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ tags: 'cinematic,,epic,' }));
    expect(result.tags).toEqual(['cinematic', 'epic']);
  });

  it('handles whitespace-only tags', () => {
    const result = backendProductToProductDetail(mockBackendProduct({ tags: ' , , ' }));
    expect(result.tags).toEqual([]);
  });
});

describe('createVersions (via backendProductToProductDetail)', () => {
  it('creates versions from backend variants', () => {
    const product = mockBackendProduct({
      variants: [
        mockVariant({ id: 10, name: 'Standard', price: 29.99 }),
        mockVariant({ id: 20, name: 'Premium', price: 49.99 }),
      ],
    });

    const result = backendProductToProductDetail(product);

    expect(result.versions).toHaveLength(2);
    expect(result.versions[0]).toEqual(
      expect.objectContaining({
        id: 'version-standard',
        name: 'Standard',
        displayName: 'Standard',
        basePrice: 29.99,
        formats: [],
        quality: '',
        fileSize: '',
        isFeatured: false,
      }),
    );
    expect(result.versions[1]).toEqual(
      expect.objectContaining({
        id: 'version-premium',
        name: 'Premium',
        displayName: 'Premium',
        basePrice: 49.99,
        formats: [],
        quality: '',
        fileSize: '',
        isFeatured: true,
      }),
    );
  });

  it('falls back to flat pricing when no variants', () => {
    const product = mockBackendProduct({
      standardPrice: 19.99,
      variants: undefined,
    });

    const result = backendProductToProductDetail(product);

    expect(result.versions).toHaveLength(1);
    expect(result.versions[0].name).toBe('Standard');
    expect(result.versions[0].basePrice).toBe(19.99);
    expect(result.versions[0].formats).toEqual([]);
  });

  it('falls back to flat pricing when variants is empty array', () => {
    const product = mockBackendProduct({
      standardPrice: 19.99,
      variants: [],
    });

    const result = backendProductToProductDetail(product);
    expect(result.versions).toHaveLength(1);
    expect(result.versions[0].name).toBe('Standard');
  });

  it('includes Premium fallback version when premiumPrice exists', () => {
    const product = mockBackendProduct({
      standardPrice: 19.99,
      premiumPrice: 39.99,
      variants: undefined,
    });

    const result = backendProductToProductDetail(product);

    expect(result.versions).toHaveLength(2);
    expect(result.versions[1].name).toBe('Premium');
    expect(result.versions[1].basePrice).toBe(39.99);
    expect(result.versions[1].isFeatured).toBe(true);
  });

  it('Premium tiers never invent stems in either data path', () => {
    const productWithVariants = mockBackendProduct({
      variants: [mockVariant({ name: 'Premium', price: 49.99 })],
    });
    const productWithFallback = mockBackendProduct({
      premiumPrice: 49.99,
      variants: undefined,
    });

    const variantResult = backendProductToProductDetail(productWithVariants);
    const fallbackResult = backendProductToProductDetail(productWithFallback);

    const variantFormats = variantResult.versions[0].formats;
    const fallbackFormats = fallbackResult.versions[1].formats;

    expect(variantFormats).not.toContain('Stems');
    expect(fallbackFormats).not.toContain('Stems');
    expect(variantFormats).toEqual(fallbackFormats);
  });

  it('does not infer file details from Exclusive tier', () => {
    const product = mockBackendProduct({
      variants: [mockVariant({ name: 'Exclusive', price: 199.99 })],
    });

    const result = backendProductToProductDetail(product);
    expect(result.versions[0].formats).toEqual([]);
    expect(result.versions[0].fileSize).toBe('');
    expect(result.versions[0].quality).toBe('');
  });
});

describe('createVariants (via backendProductToProductDetail)', () => {
  it('creates variants from backend variants', () => {
    const product = mockBackendProduct({
      variants: [
        mockVariant({ id: 10, name: 'Standard', price: 29.99 }),
        mockVariant({ id: 20, name: 'Premium', price: 49.99 }),
      ],
    });

    const result = backendProductToProductDetail(product);

    expect(result.variants).toHaveLength(2);
    expect(result.variants[0]).toEqual({
      id: '10',
      versionId: 'version-standard',
      price: { amount: '29.99', currencyCode: 'USD' },
    });
    expect(result.variants[1]).toEqual({
      id: '20',
      versionId: 'version-premium',
      price: { amount: '49.99', currencyCode: 'USD' },
    });
  });

  it('creates fallback variants from flat pricing', () => {
    const product = mockBackendProduct({
      id: 5,
      standardPrice: 19.99,
      premiumPrice: 39.99,
      variants: undefined,
    });

    const result = backendProductToProductDetail(product);

    expect(result.variants).toHaveLength(2);
    expect(result.variants[0]).toEqual({
      id: '5-standard',
      versionId: 'version-standard',
      price: { amount: '19.99', currencyCode: 'USD' },
    });
    expect(result.variants[1]).toEqual({
      id: '5-premium',
      versionId: 'version-premium',
      price: { amount: '39.99', currencyCode: 'USD' },
    });
  });

  it('formats price with two decimal places', () => {
    const product = mockBackendProduct({
      variants: [mockVariant({ price: 50 })],
    });

    const result = backendProductToProductDetail(product);
    expect(result.variants[0].price.amount).toBe('50.00');
  });

  it('handles price with many decimal places', () => {
    const product = mockBackendProduct({
      variants: [mockVariant({ price: 29.999 })],
    });

    const result = backendProductToProductDetail(product);
    expect(result.variants[0].price.amount).toBe('30.00');
  });
});

describe('_BUG createdAt without T separator', () => {
  it('returns empty string when createdAt has no T separator', () => {
    const product = mockBackendProduct({ createdAt: '2025-06-15' });
    const result = backendProductToProductDetail(product);
    expect(result.publishedAt).toBe('2025-06-15');
  });

  it('handles ISO format with timezone', () => {
    const product = mockBackendProduct({ createdAt: '2025-06-15T10:30:00Z' });
    const result = backendProductToProductDetail(product);
    expect(result.publishedAt).toBe('2025-06-15');
  });
});
