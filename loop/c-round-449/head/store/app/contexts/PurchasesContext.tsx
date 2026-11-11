import { createContext, type ReactNode, useCallback, useEffect, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { apiClient } from '~/services/api/client';

interface PurchasedProduct {
  standardUpgradeCredit: number;
  productId: number;
  handle: string;
  versionType: 'premium' | 'standard' | 'universal' | null;
}

interface PurchasesContextValue {
  purchasedProductIds: number[];
  purchasedProducts: PurchasedProduct[];
  isLoading: boolean;
  isProductOwned: (productId: number) => boolean;
  isProductOwnedByHandle: (handle: string) => boolean;
  getProductVersionType: (handle: string) => 'premium' | 'standard' | 'universal' | null;
  refreshPurchases: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

interface PurchasesProviderProps {
  children: ReactNode;
}

export function determineVersionType(
  licenseType: string | null | undefined,
): 'premium' | 'standard' | 'universal' | null {
  if (!licenseType) return null;
  const type = licenseType.toLowerCase();
  if (type === 'universal') return 'universal';
  if (type.includes('premium')) return 'premium';
  if (type.includes('standard')) return 'standard';
  return null;
}

export function PurchasesProvider({ children }: PurchasesProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [purchasedProductIds, setPurchasedProductIds] = useState<number[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPurchases = useCallback(async () => {
    if (!user?.accessToken) {
      setPurchasedProductIds([]);
      setPurchasedProducts([]);
      return;
    }

    setIsLoading(true);

    try {
      apiClient.setAccessToken(user.accessToken);
      const response = await apiClient.getMyDownloads();

      if (!response.products || response.products.length === 0) {
        setPurchasedProductIds([]);
        setPurchasedProducts([]);
        return;
      }

      const productIds = new Set<number>();
      const productsMap = new Map<string, PurchasedProduct>();

      for (const product of response.products) {
        if (!product.isAvailable) continue;
        productIds.add(product.productId);

        const existingProduct = productsMap.get(product.handle);
        const newVersionType = determineVersionType(product.licenseType);

        // უმაღლესი tier შევინახოთ (Premium > Standard)
        const shouldUpdateVersion =
          !existingProduct ||
          (newVersionType === 'premium' && existingProduct.versionType !== 'premium');

        if (!existingProduct) {
          productsMap.set(product.handle, {
            productId: product.productId,
            handle: product.handle,
            versionType: newVersionType,
            standardUpgradeCredit: product.standardUpgradeCredit ?? 0,
          });
        } else if (shouldUpdateVersion) {
          productsMap.set(product.handle, {
            ...existingProduct,
            versionType: newVersionType,
            standardUpgradeCredit: product.standardUpgradeCredit ?? 0,
          });
        }
      }

      setPurchasedProductIds(Array.from(productIds));
      setPurchasedProducts(Array.from(productsMap.values()));
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      setPurchasedProductIds([]);
      setPurchasedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      fetchPurchases();
    } else {
      setPurchasedProductIds([]);
      setPurchasedProducts([]);
    }
  }, [isAuthenticated, user?.accessToken, fetchPurchases]);

  const isProductOwned = useCallback(
    (productId: number): boolean => {
      if (!productId || purchasedProductIds.length === 0) return false;
      return purchasedProductIds.includes(productId);
    },
    [purchasedProductIds],
  );

  const isProductOwnedByHandle = useCallback(
    (handle: string): boolean => {
      if (!handle || purchasedProducts.length === 0) return false;
      return purchasedProducts.some((p) => p.handle === handle);
    },
    [purchasedProducts],
  );

  const getProductVersionType = useCallback(
    (handle: string): 'premium' | 'standard' | 'universal' | null => {
      const product = purchasedProducts.find((p) => p.handle === handle);
      return product?.versionType ?? null;
    },
    [purchasedProducts],
  );

  const value: PurchasesContextValue = {
    purchasedProductIds,
    purchasedProducts,
    isLoading,
    isProductOwned,
    isProductOwnedByHandle,
    getProductVersionType,
    refreshPurchases: fetchPurchases,
  };

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export { PurchasesContext };
