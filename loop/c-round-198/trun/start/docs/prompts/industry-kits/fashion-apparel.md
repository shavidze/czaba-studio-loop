# 👗 Fashion & Apparel Store Starter Kit

> Premium fashion e-commerce template - clothing, accessories, footwear

---

## Quick Start Prompt

```markdown
შექმენი [BRAND_NAME] - Premium Fashion Store შემდეგი სპეციფიკაციით:

## Brand Identity
**ტიპი:** Fashion E-Commerce
**Audience:** Style-conscious consumers, fashion enthusiasts
**Value Prop:** Curated fashion with exceptional quality and design

## Design Philosophy
"ჩვენ არ ვართ fast fashion. ჩვენ ვართ timeless style."

**Visual:**
- Theme: [Dark/Light] - editorial, high-fashion
- Primary: [Neutral/Bold] - black, gold, burgundy
- Vibe: Luxury magazine, runway
- Typography: Elegant serif headers + clean sans body

## Product Categories
1. **Women's** - Dresses, Tops, Bottoms, Outerwear
2. **Men's** - Shirts, Pants, Jackets, Suits
3. **Accessories** - Bags, Jewelry, Scarves
4. **Footwear** - Shoes, Boots, Sneakers

## Industry-Specific Features

### 1. Size & Fit System
```typescript
interface SizeChart {
  category: 'tops' | 'bottoms' | 'dresses' | 'shoes';
  sizes: Array<{
    size: string;        // "S", "M", "L", "38", "40"
    measurements: {
      chest?: number;
      waist?: number;
      hips?: number;
      length?: number;
      footLength?: number;
    };
  }>;
  fitType: 'slim' | 'regular' | 'relaxed' | 'oversized';
}

// Size Guide Modal
- Visual body diagram
- Measurement instructions
- Size comparison table
- "Find your size" quiz
```

### 2. Color Swatches
```typescript
interface ColorVariant {
  name: string;          // "Midnight Blue"
  hex: string;           // "#1a1a2e"
  image: string;         // Product image in this color
  available: boolean;
  lowStock?: boolean;    // "Only 3 left"
}

// Swatch Component
- Visual color circles
- Hover to preview image
- Click to select
- Strikethrough if sold out
```

### 3. Product Gallery
```typescript
interface ProductGallery {
  images: Array<{
    url: string;
    alt: string;
    type: 'front' | 'back' | 'detail' | 'lifestyle' | 'video';
  }>;
  features: {
    zoom: boolean;        // Hover zoom
    lightbox: boolean;    // Fullscreen gallery
    video: boolean;       // Video support
    thumbnails: 'bottom' | 'side';
  };
}

// Gallery Features
- Main image with zoom on hover
- Thumbnail navigation
- Swipe on mobile
- Video integration
- 360° view (optional)
```

### 4. Wishlist / Save for Later
```typescript
interface Wishlist {
  items: WishlistItem[];
  addItem: (productId: string, variantId: string) => void;
  removeItem: (itemId: string) => void;
  moveToCart: (itemId: string) => void;
  shareList: () => string;  // Shareable link
}

// Features
- Heart icon toggle
- Persistent (logged in) or localStorage
- Share wishlist link
- "Back in stock" notifications
- Move to cart action
```

### 5. Stock Alerts
```typescript
// "Notify Me" for out-of-stock items
interface StockAlert {
  email: string;
  productId: string;
  variantId: string;
  size?: string;
  color?: string;
}

// API: POST /api/stock-alerts
// Email when back in stock
```

### 6. Recently Viewed
```typescript
// Store in localStorage
const RECENT_LIMIT = 10;

function addToRecentlyViewed(productId: string) {
  const recent = getRecentlyViewed();
  const updated = [productId, ...recent.filter(id => id !== productId)]
    .slice(0, RECENT_LIMIT);
  localStorage.setItem('recently_viewed', JSON.stringify(updated));
}

// Display section on product page and homepage
```

### 7. Smart Filtering
```typescript
interface FashionFilters {
  category: string[];
  size: string[];
  color: string[];
  priceRange: { min: number; max: number };
  brand?: string[];
  material?: string[];
  style?: string[];      // "Casual", "Formal", "Streetwear"
  occasion?: string[];   // "Wedding", "Work", "Party"
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
}
```

## Page Requirements

### Product Page Sections
1. **Gallery:** Multiple images, zoom, video
2. **Info:** Title, Price, Rating, Reviews count
3. **Variants:** Color swatches, Size selector
4. **Actions:** Add to Cart, Wishlist, Size Guide
5. **Details:** Description, Materials, Care instructions
6. **Fit:** Fit type, Model measurements
7. **Reviews:** Customer photos, ratings
8. **Related:** "Complete the Look", Similar items

### Collection Page Features
- Visual filter sidebar
- Quick view modal
- Infinite scroll or pagination
- Grid/List view toggle
- "X items" count

### Special Pages
- `/lookbook` - Editorial photo collections
- `/new-arrivals` - Latest drops
- `/sale` - Discounted items
- `/size-guide` - Comprehensive sizing

## Tech Specifics

### Image Requirements
```typescript
// Product Images
- Hero: 1200x1600 (3:4 ratio)
- Thumbnails: 200x267
- Zoom: 2400x3200
- Lifestyle: 1920x1080

// Optimization
- WebP format with JPEG fallback
- srcset for responsive
- Lazy loading
- Blur placeholder
```

### Metafields (Shopify)
```
product.metafields.custom.materials
product.metafields.custom.care_instructions
product.metafields.custom.model_info
product.metafields.custom.fit_type
product.metafields.custom.size_chart_id
```

## Pricing & Promotions
- Sale badges with % off
- "New" badge for recent items
- Bundle discounts ("Complete the Look")
- Loyalty points system
- First-order discount popup

## Marketing Copy Examples
- "Elevate your everyday"
- "Timeless pieces, modern edge"
- "Wear the confidence"
- "Curated for the discerning"
```

---

## Example: LUXE Fashion

```markdown
# LUXE - Contemporary Fashion House

## Brand
- Name: LUXE
- Tagline: "Timeless pieces, modern edge"
- Primary: Black + Gold accents
- Theme: Light, editorial

## Special Features
- Size Guide with body measurements
- Color swatches with image preview
- Wishlist with sharing
- "Complete the Look" recommendations
- Virtual try-on (AR future feature)

## Categories
- Women's Collection
- Men's Collection
- Accessories
- Sale
```
