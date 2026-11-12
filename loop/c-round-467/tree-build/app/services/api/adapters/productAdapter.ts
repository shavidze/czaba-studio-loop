/**
 * Product Adapter
 * BackendProduct → ProductDetail ტრანსფორმაცია
 */

import type { ProductDetail, ProductVariant, ProductVersion } from '~/data';
import { getVariantDisplayInfo } from '~/lib/product-utils';
import { getPreviewUrl, normalizePreviewUrl } from '~/lib/r2.config';
import type { Product as BackendProduct } from '../client';

/**
 * Backend product-ის გარდაქმნა frontend ProductDetail ფორმატში
 */
export function backendProductToProductDetail(product: BackendProduct): ProductDetail {
  return {
    id: (product.id ?? 0).toString(),
    title: product.title,
    handle: product.handle,
    productType: mapCategory(product.category),
    artist: product.vendor || 'CZABA',
    artistHandle: (product.vendor || 'czaba').toLowerCase().replace(/\s+/g, '-'),
    featuredImage: product.imageUrl || '',
    audioPreviewUrl: normalizePreviewUrl(product.audioPreviewUrl) || getPreviewUrl(product.handle),
    publishedAt: (product.createdAt ?? '').split(/[T\s]/)[0],
    bpm: product.bpm || 0,
    musicalKey: product.key || '-',
    plays: 0,
    likes: 0,
    reposts: 0,
    tags: parseTags(product.tags),
    genre: product.genre || 'Music',
    versions: createVersions(product),
    variants: createVariants(product),
    relatedTracks: [],
  };
}

/**
 * Tags string-ის გარდაქმნა array-ად
 */
function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Category-ის მეპინგი frontend type-ზე
 */
function mapCategory(category: string): 'Music' | 'Presets' | 'Sound Effects' {
  const cat = category.toLowerCase();
  if (cat === 'sfx' || cat === 'sound effects') return 'Sound Effects';
  if (cat === 'presets' || cat === 'preset') return 'Presets';
  return 'Music';
}

/**
 * Versions-ის შექმნა Backend Variants-დან ან flat pricing-დან
 */
function createVersions(product: BackendProduct): ProductVersion[] {
  // თუ გვაქვს variants, გამოვიყენოთ ისინი
  if (product.variants && product.variants.length > 0) {
    return product.variants.map((variant) => ({
      id: `version-${variant.name.toLowerCase()}`,
      name: variant.name,
      displayName: variant.name,
      basePrice: variant.price,
      ...getVariantDisplayInfo(variant.name, variant.audioMetadata),
    }));
  }

  // Fallback flat pricing-ზე
  const versions: ProductVersion[] = [
    {
      id: 'version-standard',
      name: 'Standard',
      displayName: 'Standard',
      basePrice: product.standardPrice ?? 0,
      ...getVariantDisplayInfo('Standard'),
    },
  ];

  if (product.premiumPrice) {
    versions.push({
      id: 'version-premium',
      name: 'Premium',
      displayName: 'Premium',
      basePrice: product.premiumPrice,
      ...getVariantDisplayInfo('Premium'),
    });
  }

  return versions;
}

/**
 * Variants-ის შექმნა Backend Variants-დან ან flat pricing-დან
 */
function createVariants(product: BackendProduct): ProductVariant[] {
  // თუ გვაქვს variants, გამოვიყენოთ ისინი
  if (product.variants && product.variants.length > 0) {
    return product.variants.map((variant) => ({
      id: (variant.id ?? 0).toString(),
      versionId: `version-${variant.name.toLowerCase()}`,
      price: {
        amount: (variant.price ?? 0).toFixed(2),
        currencyCode: 'USD',
      },
    }));
  }

  // Fallback flat pricing-ზე
  const variants: ProductVariant[] = [
    {
      id: `${product.id}-standard`,
      versionId: 'version-standard',
      price: {
        amount: (product.standardPrice ?? 0).toFixed(2),
        currencyCode: 'USD',
      },
    },
  ];

  if (product.premiumPrice) {
    variants.push({
      id: `${product.id}-premium`,
      versionId: 'version-premium',
      price: {
        amount: product.premiumPrice.toFixed(2),
        currencyCode: 'USD',
      },
    });
  }

  return variants;
}
