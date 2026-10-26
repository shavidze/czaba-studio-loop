export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductPrice {
  amount: string;
  currencyCode: string;
}

export interface ProductMetafield {
  key: string;
  value: string;
}

export interface DisplayProduct {
  id: string;
  title: string;
  handle: string;
  productType: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: ProductPrice;
  };
  featuredImage?: { url: string } | null;
  images: {
    nodes: ProductImage[];
  };
  metafields?: ProductMetafield[];
}
