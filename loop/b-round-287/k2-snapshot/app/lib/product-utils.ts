import type { Product, VariantAudioMetadata } from '~/services/api/client';
import type { AudioStem } from '~/types/audio';

export interface VersionDisplayInfo {
  formats: string[];
  quality: string;
  fileSize: string;
  isFeatured: boolean;
  audioFileCount?: number;
  includesStems?: boolean;
}

export interface DisplayVersion {
  id: number;
  name: string;
  displayName: string;
  price: number | undefined;
  formats: string[];
  quality: string;
  fileSize: string;
  isFeatured: boolean;
  audioFileCount?: number;
  includesStems?: boolean;
  stems?: AudioStem[];
}

export function getVariantDisplayInfo(
  variantName: string,
  metadata?: VariantAudioMetadata | null,
): VersionDisplayInfo {
  const isPremium = variantName.toLowerCase() === 'premium';
  return {
    formats: metadata?.audioFormat ? [metadata.audioFormat] : [],
    quality: [
      metadata?.bitDepth ? `${metadata.bitDepth}-bit` : '',
      metadata?.sampleRateHz ? `${metadata.sampleRateHz / 1000} kHz` : '',
    ]
      .filter(Boolean)
      .join(' / '),
    fileSize: metadata?.downloadSizeBytes
      ? `${(metadata.downloadSizeBytes / 1000000).toFixed(2)} MB`
      : '',
    isFeatured: isPremium,
    ...(metadata?.audioFileCount ? { audioFileCount: metadata.audioFileCount } : {}),
    ...(metadata?.includesStems != null ? { includesStems: metadata.includesStems } : {}),
  };
}

export function mapProductType(category: string): 'Music' | 'Presets' | 'Sound Effects' {
  const cat = category.toLowerCase();
  if (cat === 'sfx' || cat === 'sound effects') return 'Sound Effects';
  if (cat === 'presets' || cat === 'preset') return 'Presets';
  return 'Music';
}

export function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function createDisplayVersions(product: Product): DisplayVersion[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants
      .filter(
        (variant) =>
          mapProductType(product.category) !== 'Sound Effects' ||
          !product.variants?.some((item) => item.name.toLowerCase() === 'universal') ||
          variant.name.toLowerCase() === 'universal',
      )
      .map((variant) => {
        const displayInfo = getVariantDisplayInfo(variant.name, variant.audioMetadata);
        return {
          id: variant.id,
          name: variant.name,
          displayName: variant.name,
          price: isValidCatalogPrice(variant.price) ? variant.price : undefined,
          ...displayInfo,
        };
      });
  }

  if (mapProductType(product.category) === 'Sound Effects') return [];

  const versions: DisplayVersion[] = [
    {
      id: -1,
      name: 'Standard',
      displayName: 'Standard',
      price: resolveCatalogPrice(product),
      formats: [],
      quality: '',
      fileSize: '',
      isFeatured: false,
    },
  ];

  if (product.premiumPrice) {
    versions.push({
      id: -2,
      name: 'Premium',
      displayName: 'Premium',
      price: product.premiumPrice,
      formats: [],
      quality: '',
      fileSize: '',
      isFeatured: true,
    });
  }

  return versions;
}

function isValidCatalogPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

// Catalogue price as the /store card shows it, or undefined when no valid price is known.
export function resolveCatalogPrice(product: Product): number | undefined {
  const candidates: unknown[] = [
    product.standardPrice,
    product.minPrice,
    product.variants?.[0]?.price,
  ];
  return candidates.find(isValidCatalogPrice);
}

// Card price text: "Price unavailable" for an unknown price, otherwise "$" and the number.
export function formatCatalogPriceLabel(price: number | undefined): string {
  return price === undefined ? 'Price unavailable' : `$${price}`;
}

// Price for the selected version; the synthetic Standard (id -1) or no version uses the catalogue price.
export function resolvePurchasePrice(
  product: Product,
  version: DisplayVersion | null,
): number | undefined {
  if (version && version.id !== -1) {
    return isValidCatalogPrice(version.price) ? version.price : undefined;
  }
  return resolveCatalogPrice(product);
}

export function getArtistHandle(vendor: string | undefined): string {
  return (vendor || 'czaba')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getVariantIdForVersion(product: Product, versionName: string): number | undefined {
  if (!product.variants) return undefined;
  const variant = product.variants.find((v) => v.name.toLowerCase() === versionName.toLowerCase());
  return variant?.id;
}

export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1000000) {
    return sign + (abs / 1000000).toFixed(1) + 'M';
  }
  if (abs >= 1000) {
    return sign + (abs / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
