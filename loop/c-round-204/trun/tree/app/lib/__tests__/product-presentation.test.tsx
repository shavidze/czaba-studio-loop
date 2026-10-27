import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductFeatures } from '~/components/product/ProductFeatures';
import { VersionSelector } from '~/components/product/VersionSelector';
import { createDisplayVersions } from '~/lib/product-utils';
import { normalizePreviewUrl, R2_WORKER_URL } from '~/lib/r2.config';
import type { Product } from '~/services/api/client';

const product: Product = {
  id: 1004,
  title: 'Shopping Mall Ambience',
  handle: 'shopping-mall-ambience',
  category: 'SFX',
  standardPrice: 49,
  variants: [
    { id: 20, productId: 1004, name: 'Universal', price: 49, position: 1, createdAt: '2026-10-03' },
  ],
  isNew: false,
  isPremium: false,
  isActive: true,
  createdAt: '2026-10-02',
};

describe('SFX product presentation', () => {
  it('uses the supplied paid Standard credit instead of its current catalog price', () => {
    const versions = createDisplayVersions({
      ...product,
      category: 'Track',
      variants: [
        { id: 12, productId: 4, name: 'Standard', price: 80, position: 1, createdAt: '2026-10-03' },
        { id: 13, productId: 4, name: 'Premium', price: 199, position: 2, createdAt: '2026-10-03' },
      ],
    });
    const html = renderToStaticMarkup(
      <VersionSelector
        versions={versions}
        selectedVersion={versions[1]}
        onSelectVersion={() => {}}
        ownedVersionType="standard"
        ownedVersionPrice={50}
      />,
    );
    expect(html).toContain('149');
    expect(html).not.toContain('119');
  });

  it('does not advertise invented stems, quality or archive sizes', () => {
    const versions = createDisplayVersions(product);
    const html = renderToStaticMarkup(
      <VersionSelector
        versions={versions}
        selectedVersion={versions[0]}
        onSelectVersion={() => {}}
      />,
    );
    expect(html).toContain('$');
    expect(html).toContain('49');
    expect(html).toContain('Universal');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toMatch(/Stems|96kHz|320 MB|Includes Standard/);
  });

  it('does not show music stems on SFX even with an incorrect stems flag', () => {
    const html = renderToStaticMarkup(<ProductFeatures productType="Sound Effects" hasStems />);
    expect(html).not.toContain('Individual stems included');
  });

  it('retains explicit music stems', () => {
    const html = renderToStaticMarkup(<ProductFeatures productType="Music" hasStems />);
    expect(html).toContain('Individual stems included');
  });
});

describe('legacy public preview URLs', () => {
  it('corrects the bucket path while preserving extension and query', () => {
    expect(
      normalizePreviewUrl(`${R2_WORKER_URL}/shopping-mall-ambience/Preview/preview.wav?v=2`),
    ).toBe(`${R2_WORKER_URL}/preview/shopping-mall-ambience/preview.wav?v=2`);
  });
  it('leaves external URLs and protected download URLs untouched', () => {
    for (const url of [
      'https://example.com/a/Preview/preview.wav',
      `${R2_WORKER_URL}/download/a/file.zip`,
    ]) {
      expect(normalizePreviewUrl(url)).toBe(url);
    }
    expect(normalizePreviewUrl()).toBe('');
  });
});

describe('verified audio metadata', () => {
  it('renders exact variant details rather than tier defaults', () => {
    const variants = createDisplayVersions({
      ...product,
      variants: [
        {
          id: 12,
          productId: product.id,
          name: 'Premium',
          price: 199,
          position: 2,
          createdAt: '2026-10-02',
          audioMetadata: {
            audioFormat: 'WAV',
            sampleRateHz: 96000,
            bitDepth: 24,
            audioFileCount: 10,
            downloadSizeBytes: 994035018,
            includesStems: false,
          },
        },
      ],
    });
    expect(variants[0]).toMatchObject({
      formats: ['WAV'],
      quality: '24-bit / 96 kHz',
      fileSize: '994.04 MB',
      audioFileCount: 10,
      includesStems: false,
    });
    const html = renderToStaticMarkup(
      <VersionSelector
        versions={variants}
        selectedVersion={variants[0]}
        onSelectVersion={() => {}}
      />,
    );
    expect(html).toContain('10 audio files');
    expect(html).not.toContain('Stems');
  });

  it('keeps unknown values absent', () => {
    const variants = createDisplayVersions({
      ...product,
      variants: [
        {
          id: 12,
          productId: product.id,
          name: 'Premium',
          price: 199,
          position: 2,
          createdAt: '2026-10-02',
          audioMetadata: {
            audioFormat: null,
            sampleRateHz: null,
            bitDepth: null,
            audioFileCount: null,
            downloadSizeBytes: null,
            includesStems: null,
          },
        },
      ],
    });
    expect(variants[0]).toMatchObject({ formats: [], quality: '', fileSize: '' });
    expect(variants[0].includesStems).toBeUndefined();
  });
});
