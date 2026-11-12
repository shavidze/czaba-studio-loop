import { useNavigate } from '@remix-run/react';
import { AudioWaveform, Download, FileText, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import { DownloadCardSkeleton } from '~/components/loading';
import { DownloadDialog } from '~/components/studio';
import { Button, EmptyState } from '~/components/ui';
import { useAuth } from '~/hooks';
import { apiClient, type DownloadableProduct } from '~/services/api/client';

type Category = 'all' | 'music' | 'presets' | 'sfx';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function mapCategoryToType(category: string): 'music' | 'presets' | 'sfx' {
  const cat = category.toLowerCase();
  if (cat === 'preset' || cat === 'presets') return 'presets';
  if (cat === 'sfx' || cat === 'sound effects') return 'sfx';
  return 'music';
}

function getLicenseType(licenseType: string): 'premium' | 'standard' | 'universal' | null {
  const type = licenseType.toLowerCase();
  if (type === 'universal') return 'universal';
  if (type.includes('premium')) return 'premium';
  if (type.includes('standard')) return 'standard';
  return null;
}

interface ProductCardProps {
  product: DownloadableProduct;
  onOpenDownloadDialog: (product: DownloadableProduct) => void;
}

function ProductCard({ product, onOpenDownloadDialog }: ProductCardProps) {
  const navigate = useNavigate();
  const category = mapCategoryToType(product.category);
  const isPremium = product.licenseType.toLowerCase().includes('premium');
  const shouldShowStudioButton =
    product.isAvailable &&
    (category === 'sfx' ||
      (category === 'music' &&
        ['standard', 'premium'].includes(product.licenseType.toLowerCase())));

  return (
    <div className="group bg-surface/50 border border-outline/50 rounded-xl overflow-hidden hover:border-brand/30 transition-all">
      <div className="aspect-[4/3] bg-background relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={40} className="text-muted/50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm rounded-md text-foreground/80 capitalize">
            {category}
          </span>
        </div>
        {isPremium && category !== 'sfx' && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-medium bg-brand/80 backdrop-blur-sm rounded-md text-black">
              Premium
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-foreground font-medium text-lg mb-2 line-clamp-1">
          {product.productTitle}
        </h3>

        <p className="text-sm text-muted mb-5">
          {category === 'sfx' ? 'Universal' : product.licenseType} &middot;{' '}
          {formatDate(product.purchasedAt)}
        </p>

        <div className="space-y-3">
          <Button onClick={() => onOpenDownloadDialog(product)} fullWidth size="lg">
            <Download size={18} />
            <span>Download</span>
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" fullWidth className="bg-elevated hover:bg-muted-bg">
              <FileText size={16} />
              <span>License</span>
            </Button>

            {shouldShowStudioButton && (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() =>
                  navigate(
                    category === 'sfx'
                      ? `/recordings/${product.productId}`
                      : `/studio/${product.handle}`,
                  )
                }
                className="bg-elevated hover:bg-muted-bg"
              >
                <AudioWaveform size={16} />
                <span>{category === 'sfx' ? 'Open in Studio' : 'Studio'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadsContent() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [products, setProducts] = useState<DownloadableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DownloadableProduct | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDownloads() {
      if (!user?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        apiClient.setAccessToken(user.accessToken);
        const response = await apiClient.getMyDownloads();

        if (cancelled) return;

        const sortedProducts = (response.products || []).sort(
          (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
        );

        setProducts(sortedProducts);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch downloads:', err);
        setError('Failed to load your downloads. Please try again later.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchDownloads();
    return () => {
      cancelled = true;
    };
  }, [user?.accessToken]);

  const handleOpenDownloadDialog = (product: DownloadableProduct) => {
    setSelectedProduct(product);
    setDownloadDialogOpen(true);
  };

  const handleCloseDownloadDialog = () => {
    setDownloadDialogOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="skeleton-shimmer h-10 w-64 rounded mb-2" />
            <div className="skeleton-shimmer h-5 w-96 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <DownloadCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    if (activeCategory === 'all') return true;
    return mapCategoryToType(product.category) === activeCategory;
  });

  const tabs: { id: Category; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: products.length },
    {
      id: 'music',
      label: 'Music',
      count: products.filter((p) => mapCategoryToType(p.category) === 'music').length,
    },
    {
      id: 'presets',
      label: 'Presets',
      count: products.filter((p) => mapCategoryToType(p.category) === 'presets').length,
    },
    {
      id: 'sfx',
      label: 'Sound Effects',
      count: products.filter((p) => mapCategoryToType(p.category) === 'sfx').length,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Downloads</h1>
          <p className="text-muted">Access all your purchased products and licenses</p>
        </div>

        <div className="flex items-center gap-2 mb-8 border-b border-outline pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-brand text-foreground'
                  : 'bg-elevated text-muted hover:text-foreground hover:bg-elevated/80'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={`${product.productId}-${product.orderNumber}`}
                product={product}
                onOpenDownloadDialog={handleOpenDownloadDialog}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            preset="downloads"
            title={activeCategory === 'all' ? 'No products yet' : `No ${activeCategory} products`}
            description={
              activeCategory === 'all'
                ? "You haven't purchased any products yet. Explore our collection and find something you'll love!"
                : `No ${activeCategory} products in your library. Check out our ${activeCategory} collection.`
            }
            actionLabel={activeCategory === 'all' ? 'Browse Music' : `Browse ${activeCategory}`}
            actionHref={activeCategory === 'all' ? '/music' : `/${activeCategory}`}
          />
        )}
      </div>

      {selectedProduct && (
        <DownloadDialog
          isOpen={downloadDialogOpen}
          onClose={handleCloseDownloadDialog}
          productTitle={selectedProduct.productTitle}
          productHandle={selectedProduct.handle}
          userLicense={getLicenseType(selectedProduct.licenseType)}
          customerAccessToken={user?.accessToken}
        />
      )}
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <RequireAuth>
      <DownloadsContent />
    </RequireAuth>
  );
}
