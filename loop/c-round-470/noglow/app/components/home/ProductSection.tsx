import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Product } from '~/services/api/client';
import type { DisplayProduct } from '~/types';
import { Carousel } from '../common/Carousel';
import { PageContainer } from '../layout';
import { ProductCard, ProductCardSkeleton } from '../product';

interface ProductSectionProps {
  title: ReactNode;
  description: string;
  products: (DisplayProduct | Product)[];
  viewAllLink: string;
  viewAllText: string;
  altBackground?: boolean;
  isLoading?: boolean;
}

export function ProductSection({
  title,
  description,
  products,
  viewAllLink,
  viewAllText,
  altBackground = false,
  isLoading = false,
}: ProductSectionProps) {
  const displayProducts = products.slice(0, 8);
  const skeletonCount = 4;

  return (
    <section
      className={`relative overflow-hidden py-16 md:py-24 ${
        altBackground ? 'bg-surface' : 'bg-background'
      }`}
    >
      {/* Background glow effects */}

      {/* Header */}
      <PageContainer className="relative mb-10">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">{description}</p>
        </div>
      </PageContainer>

      {/* Carousel */}
      <PageContainer className="relative">
        <Carousel itemWidth={320}>
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </Carousel>
      </PageContainer>

      {/* View All Link */}
      <PageContainer className="relative mt-10">
        <div className="flex justify-center">
          <a
            href={viewAllLink}
            className="group inline-flex cursor-pointer items-center gap-2 text-muted transition-colors hover:text-foreground"
          >
            <span className="text-lg">{viewAllText}</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </PageContainer>
    </section>
  );
}
