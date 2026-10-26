import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import * as React from 'react';
import { debug } from '~/lib/debug';
import { apiClient, type Product } from '~/services/api';

export const meta: MetaFunction = () => {
  return [
    { title: 'Store | CZABA - Cinematic Sound Collections' },
    {
      name: 'description',
      content:
        'Curated cinematic sound collections for producers, filmmakers, and creators. Studio-quality audio with complete creative freedom.',
    },
    { property: 'og:title', content: 'CZABA Store - Cinematic Sound Collections' },
    {
      property: 'og:description',
      content: 'Curated cinematic sound collections for producers, filmmakers, and creators.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CZABA Store - Cinematic Sound Collections' },
    {
      name: 'twitter:description',
      content: 'Curated cinematic sound collections for producers, filmmakers, and creators.',
    },
  ];
};

import { Form, Link, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react';
import { ArrowRight, Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { Button } from '~/components/ui';

type PackCategory = 'sfx' | 'loops' | 'sounds' | 'music';

const CATEGORIES: { value: PackCategory; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'sfx', label: 'SFX' },
  { value: 'loops', label: 'Loops' },
  { value: 'sounds', label: 'Sounds' },
];

type BoxColor = 'gold' | 'silver' | 'copper' | 'midnight' | 'emerald' | 'crimson' | 'obsidian';

interface Pack {
  id: string;
  title: string;
  subtitle: string;
  handle: string;
  image: string;
  price: string;
  originalPrice?: string;
  isNew: boolean;
  isLimited?: boolean;
  isFeatured?: boolean;
  limitedStock?: number;
  category: PackCategory;
  itemCount?: number;
  format?: string;
  boxColor?: BoxColor;
}

function mapCategory(category: string): PackCategory {
  const cat = category.trim().toLowerCase();
  if (cat === 'track') return 'music';
  if (cat === 'sfx' || cat === 'sound effects') return 'sfx';
  if (cat === 'loop') return 'loops';
  if (cat === 'preset' || cat === 'presets') return 'sounds';
  return 'music';
}

function mapProductToPack(product: Product): Pack {
  return {
    id: product.id.toString(),
    title: product.title,
    subtitle: product.description || 'Cinematic Sound Collection',
    handle: product.handle,
    image: product.imageUrl || '',
    price: `$${product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0}`,
    isNew: product.isNew,
    category: mapCategory(product.category),
    format: product.assetType || product.category,
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const genre = url.searchParams.get('genre') || undefined;

  try {
    const result = await apiClient.getProducts({
      search: searchQuery,
      category,
      genre,
      pageSize: 50,
      sortDesc: true,
    });

    const packs: Pack[] = result.items.filter((p) => p.isActive).map(mapProductToPack);

    return json<{ packs: Pack[]; searchQuery?: string; error: string | null }>({
      packs,
      searchQuery,
      error: null,
    });
  } catch (error) {
    debug.error('Failed to fetch products from backend:', error);
    return json<{ packs: Pack[]; searchQuery?: string; error: string | null }>({
      packs: [],
      searchQuery,
      error: 'Failed to load products',
    });
  }
}

const fieldClass = 'border border-outline';
function M15Probe() { return <input className={fieldClass} />; }
export default function StorePage() {
  const { packs, searchQuery, error } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const [selectedCategories, setSelectedCategories] = React.useState<PackCategory[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);

  const isSearching =
    navigation.state === 'loading' &&
    new URLSearchParams(navigation.location?.search).has('search');

  const filteredPacks =
    selectedCategories.length === 0
      ? packs
      : packs.filter((pack) => selectedCategories.includes(pack.category));

  const toggleCategory = (category: PackCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
  };

  const clearSearch = () => {
    setSearchParams((prev) => {
      prev.delete('search');
      return prev;
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, var(--color-background) 0%, rgba(var(--color-brand-rgb), 0.08) 50%, var(--color-background) 100%)`,
      }}
    >
      {/* Header */}
      <header className="pt-24 pb-12 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground tracking-tight mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : 'Curated Sound Collections'}
        </h1>
        <p className="text-lg text-muted max-w-4xl mx-auto px-4 mb-4">
          {searchQuery
            ? `Found ${packs.length} ${packs.length === 1 ? 'pack' : 'packs'}`
            : 'Hand-picked, professionally mastered sound libraries. Each pack tells a story.'}
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto px-4 mb-6">
          <Form method="get" className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={20} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery || ''}
                placeholder="Search packs, genres, sounds..."
                className="w-full pl-12 pr-12 py-3 rounded-full bg-foreground/5 border border-outline-strong text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
              />
              {isSearching ? (
                <Loader2
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand animate-spin"
                  size={20}
                />
              ) : (
                searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dim hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                )
              )}
            </div>
          </Form>
        </div>

        {/* Value proposition badges */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="font-mono text-[10px] tracking-wide px-2 py-1 rounded bg-foreground/5 border border-outline text-foreground/70">
              Curated Audio
            </span>
            <span className="font-mono text-[10px] tracking-wide px-2 py-1 rounded bg-foreground/5 border border-outline text-foreground/70">
              Yours Forever
            </span>
            <span className="font-mono text-[10px] tracking-wide px-2 py-1 rounded bg-foreground/5 border border-outline text-foreground/70">
              Music & Sound Effects
            </span>
          </div>
        )}
      </header>

      {/* Filter Bar - Mobile: Dropdown, Desktop: Horizontal Pills */}
      <div className="md:sticky md:top-20 z-40 md:backdrop-blur-xl md:bg-background/80 md:border-y md:border-outline/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {/* Mobile: Dropdown Filter */}
          <div className="md:hidden">
            <div className="relative">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-foreground/5 border border-outline text-foreground cursor-pointer"
              >
                <span className="text-sm font-medium">
                  {selectedCategories.length === 0
                    ? 'All Categories'
                    : `${selectedCategories.length} selected`}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-muted transition-transform duration-300 ${isMobileFilterOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isMobileFilterOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-surface border border-outline shadow-xl z-50">
                  {/* All option */}
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                      selectedCategories.length === 0
                        ? 'bg-brand/10 text-brand'
                        : 'text-secondary hover:bg-foreground/5'
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategories.length === 0 && <Check size={16} />}
                  </button>

                  <div className="my-2 border-t border-outline/50" />

                  {/* Category options */}
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.value);

                    return (
                      <button
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-brand/10 text-brand'
                            : 'text-secondary hover:bg-foreground/5'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isSelected && <Check size={16} />}
                      </button>
                    );
                  })}

                  <div className="mt-2 pt-2 border-t border-outline/50">
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-full py-2 text-sm text-muted cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Results count */}
            {filteredPacks.length > 0 && (
              <div className="text-center mt-3 text-dim text-sm">
                {filteredPacks.length} {filteredPacks.length === 1 ? 'pack' : 'packs'}
              </div>
            )}
          </div>

          {/* Desktop: Horizontal Pills */}
          <div className="hidden md:block">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* "All" button */}
              <button
                onClick={clearAllFilters}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  selectedCategories.length === 0
                    ? 'bg-brand text-background'
                    : 'bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground border border-outline'
                }`}
              >
                All
              </button>

              {/* Category pills */}
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.value);

                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-brand text-background'
                        : 'bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground border border-outline'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Results count */}
            {filteredPacks.length > 0 && (
              <div className="text-center mt-3 text-dim text-sm">
                {filteredPacks.length} {filteredPacks.length === 1 ? 'pack' : 'packs'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-32 pt-8">
        {error ? (
          <div role="alert" className="text-center py-16 space-y-4">
            <p className="text-foreground">The collection could not be loaded. Please try again.</p>
            <Link
              to="/store"
              className="inline-block rounded-lg bg-brand px-5 py-3 text-background"
            >
              Try again
            </Link>
          </div>
        ) : filteredPacks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg mb-4">No collections match your search.</p>
            <Button
              onClick={() => {
                clearAllFilters();
                clearSearch();
              }}
              className="rounded-full"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 md:pl-16">
            {filteredPacks.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Box Color System
// Priority: pack.boxColor > isFeatured/isLimited > category > default
const _BOX_BY_COLOR: Record<BoxColor, string> = {
  gold: '/images/packs/boxes/gold.png',
  silver: '/images/packs/boxes/silver.png',
  copper: '/images/packs/boxes/copper.png',
  midnight: '/images/packs/boxes/midnight.png',
  emerald: '/images/packs/boxes/emerald.png',
  crimson: '/images/packs/boxes/crimson.png',
  obsidian: '/images/packs/boxes/obsidian.png',
};

const _BOX_BY_CATEGORY: Record<PackCategory, BoxColor> = {
  music: 'midnight',
  sfx: 'emerald',
  loops: 'crimson',
  sounds: 'obsidian',
};

// Original CZABA branded box - using same image until new variants are provided
const ORIGINAL_BOXES = ['/images/packs/1.png', '/images/packs/2.png', '/images/packs/3.png'];

function getBoxImage(pack: Pack): string {
  // If pack has custom image, use it
  if (pack.image && pack.image.length > 0) {
    return pack.image;
  }

  // Use original CZABA branded boxes, rotating by pack id
  return ORIGINAL_BOXES[parseInt(pack.id, 10) % ORIGINAL_BOXES.length];
}

// Brand color for accents (better contrast than gold)
const BRAND_COLOR = 'var(--color-brand)';
const BRAND_BG = 'rgba(var(--color-brand-rgb), 0.13)';
const BRAND_BORDER = 'rgba(var(--color-brand-rgb), 0.25)';

function PackCard({ pack }: { pack: Pack }) {
  const displayImage = getBoxImage(pack);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      to={`/products/${pack.handle}`}
      className="group relative block w-full max-w-[400px] mx-auto"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Stacked Layers Container */}
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Layer 4 - furthest back */}
        <div
          className="absolute inset-0 rounded-xl border border-outline bg-surface/80"
          style={{
            transform: `translateX(${isHovered ? '-48px' : '0'}) translateZ(-48px)`,
            opacity: isHovered ? 0.3 : 0.2,
            transition:
              'transform 800ms cubic-bezier(0.33, 1, 0.68, 1), opacity 800ms cubic-bezier(0.33, 1, 0.68, 1)',
            willChange: 'transform, opacity',
          }}
          aria-hidden="true"
        />

        {/* Layer 3 */}
        <div
          className="absolute inset-0 rounded-xl border border-outline bg-surface/80"
          style={{
            transform: `translateX(${isHovered ? '-32px' : '0'}) translateZ(-32px)`,
            opacity: isHovered ? 0.5 : 0.4,
            transition:
              'transform 800ms cubic-bezier(0.33, 1, 0.68, 1), opacity 800ms cubic-bezier(0.33, 1, 0.68, 1)',
            willChange: 'transform, opacity',
          }}
          aria-hidden="true"
        />

        {/* Layer 2 */}
        <div
          className="absolute inset-0 rounded-xl border border-outline bg-surface/80"
          style={{
            transform: `translateX(${isHovered ? '-16px' : '0'}) translateZ(-16px)`,
            opacity: isHovered ? 0.7 : 0.6,
            transition:
              'transform 800ms cubic-bezier(0.33, 1, 0.68, 1), opacity 800ms cubic-bezier(0.33, 1, 0.68, 1)',
            willChange: 'transform, opacity',
          }}
          aria-hidden="true"
        />

        {/* Layer 1 - Front Card (main content) */}
        <div
          className="relative rounded-xl border border-outline bg-surface overflow-hidden"
          style={{
            transform: isHovered ? 'scale(1.015)' : 'scale(1)',
            transition:
              'transform 800ms cubic-bezier(0.33, 1, 0.68, 1), border-color 800ms ease-out, box-shadow 800ms ease-out',
            boxShadow: isHovered
              ? '0 16px 48px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.4)',
            willChange: 'transform',
          }}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={displayImage}
              alt={pack.title}
              className="size-full object-contain p-6"
              style={{
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 800ms cubic-bezier(0.33, 1, 0.68, 1)',
                willChange: 'transform',
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {pack.isNew && (
                <span
                  className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full"
                  style={{
                    backgroundColor: BRAND_BG,
                    color: BRAND_COLOR,
                    border: `1px solid ${BRAND_BORDER}`,
                  }}
                >
                  New Release
                </span>
              )}
              {pack.isLimited && (
                <span
                  className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full"
                  style={{
                    backgroundColor: BRAND_BG,
                    color: BRAND_COLOR,
                    border: `1px solid ${BRAND_BORDER}`,
                  }}
                >
                  Limited • {pack.limitedStock} left
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            {/* Title - Playfair Display, transitions to brand color */}
            <h3
              className="font-serif text-xl font-semibold"
              style={{
                color: isHovered ? BRAND_COLOR : 'var(--color-foreground)',
                transition: 'color 800ms cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              {pack.title}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-muted line-clamp-2">{pack.subtitle}</p>

            {/* Price and CTA Row */}
            <div className="flex items-center justify-between pt-2">
              {/* Price */}
              <div className="flex items-center gap-2">
                {pack.originalPrice && (
                  <span className="text-sm text-dim line-through">{pack.originalPrice}</span>
                )}
                <span className="text-2xl font-bold text-foreground">{pack.price}</span>
              </div>

              {/* CTA - slides in from bottom */}
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{
                  color: BRAND_COLOR,
                  transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                  opacity: isHovered ? 1 : 0,
                  transition:
                    'transform 800ms cubic-bezier(0.33, 1, 0.68, 1), opacity 800ms cubic-bezier(0.33, 1, 0.68, 1)',
                }}
              >
                <span>Discover</span>
                <ArrowRight
                  size={16}
                  style={{
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 600ms cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
                />
              </div>
            </div>

            {/* Format Info */}
            <p className="text-[11px] text-dim tracking-wider uppercase">
              {pack.format}
              {pack.itemCount ? ` • ${pack.itemCount} sounds` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${BRAND_COLOR}25, 0 0 60px ${BRAND_COLOR}10`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 800ms cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      />
    </Link>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from '~/components/errors';
