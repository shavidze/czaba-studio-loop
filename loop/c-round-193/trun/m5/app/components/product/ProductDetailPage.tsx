import { useSearchParams } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { usePurchases } from '~/hooks/usePurchases';
import {
  createDisplayVersions,
  type DisplayVersion,
  getArtistHandle,
  mapProductType,
} from '~/lib/product-utils';
import type { Product } from '~/services/api/client';
import type { Track } from '~/types/audio';
import { PlayStemsButton } from './PlayStemsButton';
import { ProductFeatures } from './ProductFeatures';
import { ProductSidebar } from './ProductSidebar';
import { PurchaseHeader } from './PurchaseHeader';
import { UsageTerms } from './UsageTerms';
import { VersionSelector } from './VersionSelector';

interface ProductDetailPageProps {
  product: Product;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [searchParams] = useSearchParams();
  const { getProductVersionType, purchasedProducts } = usePurchases();
  const { isAuthenticated } = useAuth();

  const displayVersions = useMemo(() => createDisplayVersions(product), [product]);
  const productType = useMemo(() => mapProductType(product.category), [product.category]);
  const _artistHandle = useMemo(() => getArtistHandle(product.vendor), [product.vendor]);

  const ownedVersionType = isAuthenticated ? getProductVersionType(product.handle) : null;

  const ownedVersionPrice = useMemo(() => {
    if (ownedVersionType !== 'standard' || product.category !== 'Track') return 0;
    return (
      purchasedProducts.find((purchase) => purchase.handle === product.handle)
        ?.standardUpgradeCredit ?? 0
    );
  }, [ownedVersionType, purchasedProducts, product.category, product.handle]);

  const upgradeParam = searchParams.get('upgrade');
  const shouldDefaultToPremium = upgradeParam === 'premium';

  const [selection, setSelectedVersion] = useState<DisplayVersion | null>(() => {
    if (shouldDefaultToPremium) {
      const premium = displayVersions.find((v) => v.name.toLowerCase() === 'premium');
      if (premium) return premium;
    }
    return (
      displayVersions.find((v) => v.name.toLowerCase() === 'standard') || displayVersions[0] || null
    );
  });

  const selectedVersion =
    displayVersions.find((version) => version.id === selection?.id) || displayVersions[0] || null;

  const handleSelectPremium = useCallback(() => {
    const premiumVersion = displayVersions.find((v) => v.name.toLowerCase() === 'premium');
    if (premiumVersion) {
      setSelectedVersion(premiumVersion);
    }
  }, [displayVersions]);

  const currentPrice = useMemo(() => {
    return selectedVersion?.price ?? 0;
  }, [selectedVersion?.price]);

  const isUpgrade = useMemo(() => {
    if (!ownedVersionType || productType === 'Sound Effects') return false;
    const selectedVersionName = selectedVersion?.name.toLowerCase();
    return ownedVersionType === 'standard' && selectedVersionName === 'premium';
  }, [ownedVersionType, selectedVersion?.name, productType]);

  const stemsTrack = useMemo<Track>(
    () => ({
      id: product.id.toString(),
      title: product.title,
      artist: product.vendor || 'CZABA',
      audioUrl: product.audioPreviewUrl || '',
      imageUrl: product.imageUrl || '',
      productHandle: product.handle,
      stems: selectedVersion?.stems,
    }),
    [product, selectedVersion],
  );

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(to bottom, var(--color-background) 0%, var(--color-elevated) 50%, var(--color-background) 100%)`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12">
          <motion.div
            className="lg:w-[420px] lg:flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lg:sticky lg:top-24">
              <ProductSidebar product={product} />
            </div>
          </motion.div>

          <motion.div
            className="flex-1 min-w-0 space-y-8"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <PurchaseHeader
              price={currentPrice}
              currencyCode="USD"
              productId={product.id}
              productTitle={product.title}
              productHandle={product.handle}
              selectedVersionName={selectedVersion?.name ?? 'Standard'}
              onSelectPremium={
                displayVersions.some((version) => version.name.toLowerCase() === 'premium')
                  ? handleSelectPremium
                  : undefined
              }
              ownedPrice={ownedVersionPrice}
              isUpgrade={isUpgrade}
              productVariantId={selectedVersion?.id}
              recordingsHref={
                productType === 'Sound Effects' && product.id > 0
                  ? `/recordings/${product.id}`
                  : undefined
              }
            />

            {selectedVersion &&
              displayVersions.length > 0 &&
              productType !== 'Sound Effects' &&
              ownedVersionType !== 'premium' && (
                <VersionSelector
                  versions={displayVersions}
                  selectedVersion={selectedVersion}
                  onSelectVersion={setSelectedVersion}
                  ownedVersionType={ownedVersionType}
                  ownedVersionPrice={ownedVersionPrice}
                />
              )}

            {selectedVersion?.stems && selectedVersion.stems.length > 0 && (
              <PlayStemsButton track={stemsTrack} />
            )}

            <ProductFeatures
              trackCount={selectedVersion?.audioFileCount}
              fileFormats={selectedVersion?.formats}
              fileSize={selectedVersion?.fileSize}
              quality={selectedVersion?.quality}
              productType={productType}
              hasStems={
                selectedVersion?.includesStems === true || Boolean(selectedVersion?.stems?.length)
              }
            />

            {product.description && (
              <section className="space-y-4">
                <h2 className="text-sm text-muted uppercase tracking-[0.15em]">
                  About this collection
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </section>
            )}

            <ProvenanceSection vendor={product.vendor} />

            <UsageTerms />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProvenanceSection({ vendor }: { vendor?: string }) {
  const artist = vendor || 'CZABA';

  return (
    <div className="space-y-4">
      <h2 className="text-sm text-muted uppercase tracking-[0.15em]">Provenance</h2>

      <div className="p-5 bg-surface/50 border border-outline rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
            <span className="text-brand font-serif font-bold text-sm">{artist.charAt(0)}</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Crafted by <span className="font-medium">{artist}</span>
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Every sound in this collection has been individually recorded, processed, and mastered
              to cinematic standards. What you hear in the preview is exactly what you get — no
              compromises, no fillers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
