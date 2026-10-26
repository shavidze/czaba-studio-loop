import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { mapProductType } from '~/lib/product-utils';

const PRODUCT_META_DESCRIPTION_MAX = 160;

function buildProductMetaDescription(description: string | undefined, fallback: string): string {
  const collapsed = (description ?? '').replace(/\s+/g, ' ').trim();
  if (!collapsed) return fallback;
  if (collapsed.length <= PRODUCT_META_DESCRIPTION_MAX) return collapsed;
  const cutLimit = PRODUCT_META_DESCRIPTION_MAX - 1;
  const lastSpace = collapsed.lastIndexOf(' ', cutLimit);
  return `${collapsed.slice(0, cutLimit)}…`;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [
      { title: 'Product Not Found | CZABA' },
      { name: 'description', content: 'The requested product could not be found.' },
    ];
  }

  const product = data.product;
  const productType = mapProductType(product.category);
  const title = `${product.title} | CZABA`;
  const description = buildProductMetaDescription(
    product.description,
    `${product.title} — ${productType} by CZABA.`,
  );
  const image = product.imageUrl || '/og-image.jpg';

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'product' },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { property: 'product:brand', content: 'CZABA' },
    { property: 'product:category', content: productType },
  ];
};

import { ProductDetailSkeleton } from '~/components/loading';
import { ProductDetailPage } from '~/components/product';
import { ApiError, apiClient, type Product } from '~/services/api/client';

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params;

  if (!handle) {
    throw new Response('Product not found', { status: 404 });
  }

  let product: Product;
  try {
    product = await apiClient.getProductByHandle(handle);
  } catch (error) {
    console.error('Failed to fetch product from backend:', error);

    if (error instanceof ApiError && error.status === 404) {
      throw new Response('Product not found', { status: 404 });
    }
    throw new Response('The product could not be loaded. Please try again.', { status: 503 });
  }

  if (product.isActive === false) {
    throw new Response('Product not found', { status: 404 });
  }

  return json({ product });
}

export default function ProductDetailRoute() {
  const navigation = useNavigation();
  const { product } = useLoaderData<typeof loader>();

  if (navigation.state === 'loading') {
    return <ProductDetailSkeleton />;
  }

  return <ProductDetailPage product={product} />;
}

export { RouteErrorBoundary as ErrorBoundary } from '~/components/errors';
