# 🍕 Food & Delivery Store Starter Kit

> Template for food e-commerce - restaurants, meal kits, specialty foods, groceries

---

## Quick Start Prompt

```markdown
შექმენი [BRAND_NAME] - Food E-Commerce Platform შემდეგი სპეციფიკაციით:

## Brand Identity
**ტიპი:** Food Delivery / Specialty Foods
**Audience:** Food lovers, busy professionals, health-conscious consumers
**Value Prop:** Quality ingredients, convenient delivery, exceptional taste

## Design Philosophy
"ჩვენ არ ვყიდით საკვებს. ჩვენ ვყიდით გამოცდილებას."

**Visual:**
- Theme: Warm, appetizing, inviting
- Primary: Orange/Red (#f97316) ან Green (#22c55e)
- Vibe: Fresh, artisan, homemade
- Typography: Friendly, readable

## Product Types
1. **Ready Meals** - Fresh, prepared dishes
2. **Meal Kits** - Ingredients + recipes
3. **Groceries** - Specialty items, pantry
4. **Subscription Boxes** - Weekly/monthly deliveries
5. **Catering** - Events, parties

## Industry-Specific Features

### 1. Allergen & Dietary Information
```typescript
interface NutritionalInfo {
  servingSize: string;       // "1 portion (350g)"
  calories: number;
  protein: number;           // grams
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}

interface AllergenInfo {
  contains: string[];        // ["Gluten", "Dairy", "Nuts"]
  mayContain: string[];      // Cross-contamination
  freeFrom: string[];        // ["Gluten-free", "Vegan"]
}

interface DietaryTags {
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isOrganic: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isKeto: boolean;
  isLowCarb: boolean;
}

// Display
- Clear allergen badges
- Filter by dietary preference
- Warning modals before purchase
```

### 2. Delivery Scheduling
```typescript
interface DeliverySlot {
  date: Date;
  timeWindow: string;        // "10:00 - 12:00"
  available: boolean;
  price: number;             // Express delivery extra
  cutoffTime: Date;          // Order by time
}

interface DeliveryZone {
  postcode: string;
  deliveryDays: string[];    // ["Mon", "Wed", "Fri"]
  minOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
}

// Features
- Date picker calendar
- Time slot selection
- Delivery zone check (postcode)
- Express delivery option
- Recurring delivery setup
```

### 3. Subscription Boxes
```typescript
interface SubscriptionBox {
  id: string;
  name: string;              // "Weekly Veggie Box"
  description: string;
  price: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  contents: string;          // "Seasonal vegetables, 8-10 items"

  customizable: boolean;     // Can swap items?
  skipAllowed: boolean;      // Skip a week
  cancelAnytime: boolean;

  preferences?: {
    excludeItems: string[];  // "No mushrooms"
    dietaryNeeds: string[];
  };
}

// Features
- Subscription management portal
- Skip/pause delivery
- Swap items before cutoff
- Add extras to box
- Gift subscriptions
```

### 4. Inventory & Freshness
```typescript
interface InventoryItem {
  productId: string;
  stockLevel: number;
  reorderPoint: number;

  // Freshness tracking
  bestBefore?: Date;
  batchNumber?: string;
  harvestDate?: Date;        // For produce
  madeOn?: Date;             // For prepared foods

  // Availability
  availableFrom?: Date;      // Seasonal items
  availableUntil?: Date;
  dailyLimit?: number;       // "Only 20 made daily"
}

// Display
- "Made fresh daily"
- "Best before" date
- "Limited availability"
- Stock countdown
```

### 5. Order Customization
```typescript
interface ProductCustomization {
  // For meals
  portionSize?: 'regular' | 'large';
  spiceLevel?: 'mild' | 'medium' | 'hot';
  removeIngredients?: string[];  // "No onions"
  addExtras?: Array<{
    name: string;
    price: number;
  }>;

  // For meal kits
  servings?: 2 | 4 | 6;
  includeOptional?: string[];    // "Add dessert recipe"

  // Special instructions
  notes?: string;                // "Ring doorbell twice"
}
```

### 6. Store Locator (if physical stores)
```typescript
interface StoreLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: Record<string, string>;  // "Mon": "9:00-21:00"
  services: string[];             // ["Pickup", "Dine-in"]
  currentWaitTime?: number;       // minutes
}

// Features
- Map integration (Google Maps / Mapbox)
- Distance calculation
- Store hours display
- Click & collect booking
```

### 7. Recipe Integration (for meal kits)
```typescript
interface Recipe {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'challenging';
  prepTime: number;          // minutes
  cookTime: number;
  totalTime: number;
  servings: number;

  ingredients: Array<{
    name: string;
    amount: string;
    included: boolean;       // In the kit?
  }>;

  steps: Array<{
    stepNumber: number;
    instruction: string;
    image?: string;
    tip?: string;
    timer?: number;          // Set timer button
  }>;

  nutritionPerServing: NutritionalInfo;
  winePairing?: string;
  storageInstructions: string;
}
```

## Page Requirements

### Product Page Sections
1. **Hero:** Image, Name, Price, Quick add
2. **Details:** Description, serving size
3. **Nutrition:** Expandable nutritional info
4. **Allergens:** Clear warnings, badges
5. **Customization:** Options, extras
6. **Reviews:** Customer feedback
7. **Pairings:** "Goes well with"

### Checkout Additions
- Delivery date/time selector
- Special instructions field
- Tip option (for delivery)
- Eco-friendly packaging toggle
- Leave at door option

### Menu/Collection Page
- Category tabs (Starters, Mains, etc.)
- Dietary filters (prominent)
- Quick view with add to cart
- "Popular" and "New" badges
- Calorie count on cards

### Order Tracking
- Order status timeline
- Live driver tracking (if applicable)
- ETA updates
- Contact delivery person
- Delivery confirmation photo

## Tech Specifics

### Required Integrations
```
Delivery: Stuart, DoorDash Drive, own fleet
Payments: Stripe, local payment methods
Maps: Google Maps API, Mapbox
Notifications: SMS (Twilio), Push
```

### Special Metafields (Shopify)
```
product.metafields.food.calories
product.metafields.food.allergens
product.metafields.food.dietary_tags
product.metafields.food.prep_time
product.metafields.food.ingredients_list
product.metafields.food.storage_instructions
```

### Order Data Structure
```typescript
interface FoodOrder {
  // Standard order fields...

  deliveryDetails: {
    type: 'delivery' | 'pickup';
    scheduledDate: Date;
    timeSlot: string;
    address?: Address;
    storeId?: string;
    specialInstructions?: string;
    contactless: boolean;
  };

  items: Array<{
    productId: string;
    quantity: number;
    customizations: ProductCustomization;
  }>;
}
```

## Pricing & Promotions
- Minimum order for free delivery
- First order discount
- Referral program
- Loyalty points
- Subscription discounts (10-15%)
- Bundle meals savings

## Marketing Copy Examples
- "Farm to table, delivered to your door"
- "Skip the cooking, not the quality"
- "Real food, real fast"
- "Eat well, live well"
- "Your kitchen, upgraded"
```

---

## Example: FreshBox

```markdown
# FreshBox - Farm Fresh Meal Kits

## Brand
- Name: FreshBox
- Tagline: "Farm to table, delivered"
- Primary: Green #22c55e
- Theme: Light, fresh, organic

## Product Types
- Weekly meal kit subscriptions
- Individual recipes
- Pantry essentials
- Add-on proteins

## Special Features
- Recipe cards with each kit
- Ingredient sourcing transparency
- Dietary preference matching
- Flexible subscription (skip/swap)
- Eco-friendly packaging
- Zero food waste commitment
```
