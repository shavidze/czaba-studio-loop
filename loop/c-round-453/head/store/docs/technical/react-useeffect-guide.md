# React useEffect - დეტალური გზამკვლევი

## სარჩევი
1. [React-ის რენდერინგის მექანიზმი](#react-ის-რენდერინგის-მექანიზმი)
2. [რა არის useEffect?](#რა-არის-useeffect)
3. [Dependency Array](#dependency-array)
4. [PurchasesContext - დეტალური ანალიზი](#purchasescontext---დეტალური-ანალიზი)
5. [useCallback და მისი როლი](#usecallback-და-მისი-როლი)
6. [ხშირი შეცდომები](#ხშირი-შეცდომები)
7. [Best Practices](#best-practices)

---

## React-ის რენდერინგის მექანიზმი

### რა არის "რენდერი"?

**რენდერი** = კომპონენტის ფუნქციის გამოძახება.

```typescript
function ProductCard({ title, price }) {
  console.log('ProductCard რენდერდება!');  // ეს იბეჭდება ყოველ რენდერზე

  return (
    <div>
      <h2>{title}</h2>
      <span>{price}</span>
    </div>
  );
}
```

როდესაც React "რენდერავს" კომპონენტს:
1. იძახებს კომპონენტის ფუნქციას
2. ფუნქცია აბრუნებს JSX-ს (React Elements)
3. React ადარებს ძველ და ახალ JSX-ს
4. განსხვავებულ ნაწილებს აახლებს DOM-ში

### რა იწვევს რენდერს?

რენდერი ხდება **მხოლოდ სამ შემთხვევაში**:

```
┌─────────────────────────────────────────────────────────────┐
│                    რენდერის მიზეზები                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INITIAL RENDER (პირველი რენდერი)                       │
│     └─ კომპონენტი პირველად mount-დება                      │
│                                                             │
│  2. STATE CHANGE (state-ის ცვლილება)                       │
│     └─ useState-ის setter გამოძახება                       │
│     └─ useReducer-ის dispatch                              │
│                                                             │
│  3. PARENT RE-RENDER (მშობლის რენდერი)                     │
│     └─ მშობელი კომპონენტი თავიდან რენდერდება               │
│     └─ ბავშვებიც რენდერდებიან (default behavior)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1. Initial Render (პირველი რენდერი)

```typescript
// App.tsx
function App() {
  return <ProductCard title="Middle East" price={29} />;
}

// React-ის სამუშაო:
// 1. App() გამოიძახება → აბრუნებს <ProductCard ... />
// 2. ProductCard() გამოიძახება → აბრუნებს <div>...</div>
// 3. DOM-ში იქმნება რეალური ელემენტები
```

### 2. State Change (state-ის ცვლილება)

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  console.log('Counter რენდერდება, count =', count);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// Timeline:
// 1. Initial render: "Counter რენდერდება, count = 0"
// 2. User clicks button
// 3. setCount(1) გამოიძახება
// 4. React schedules re-render
// 5. Re-render: "Counter რენდერდება, count = 1"
// 6. DOM updates: button text changes to "1"
```

**მნიშვნელოვანი**: `setState` არ ცვლის state-ს დაუყოვნებლივ!

```typescript
function Example() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(1);
    console.log(count); // ჯერ კიდევ 0! არა 1!
    // state შეიცვლება მომდევნო რენდერზე
  };
}
```

### 3. Parent Re-render (მშობლის რენდერი)

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  console.log('Parent რენდერდება');

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child name="A" />
      <Child name="B" />
    </div>
  );
}

function Child({ name }) {
  console.log(`Child ${name} რენდერდება`);
  return <span>{name}</span>;
}

// Button click-ზე:
// "Parent რენდერდება"
// "Child A რენდერდება"  ← მიუხედავად იმისა რომ props არ შეცვლილა!
// "Child B რენდერდება"  ← მიუხედავად იმისა რომ props არ შეცვლილა!
```

### რა არ იწვევს რენდერს?

```typescript
function Example() {
  let localVar = 0;  // ❌ ეს არ იწვევს რენდერს

  const handleClick = () => {
    localVar = 5;  // მნიშვნელობა შეიცვლება, მაგრამ რენდერი არ მოხდება
    console.log(localVar); // 5, მაგრამ UI არ განახლდება
  };

  return <button onClick={handleClick}>{localVar}</button>; // ყოველთვის 0
}
```

**მხოლოდ `useState` და `useReducer` იწვევს რენდერს!**

---

## Render Phase vs Commit Phase

React-ის მუშაობა ორ ფაზად იყოფა:

```
┌─────────────────────────────────────────────────────────────┐
│                     RENDER PHASE                            │
│                   (Pure, No Side Effects)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. React იძახებს კომპონენტის ფუნქციას                     │
│  2. ფუნქცია აბრუნებს JSX (React Elements)                  │
│  3. React ქმნის Virtual DOM-ს                              │
│  4. შედარება ძველ Virtual DOM-თან (Reconciliation)         │
│                                                             │
│  ⚠️  ეს ფაზა შეიძლება გამეორდეს!                           │
│  ⚠️  აქ side effects არ უნდა იყოს!                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMMIT PHASE                            │
│                 (DOM Updates, Side Effects)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. React აახლებს რეალურ DOM-ს                             │
│  2. გაეშვება useLayoutEffect                               │
│  3. ბრაუზერი ხატავს (paint)                                │
│  4. გაეშვება useEffect                                     │
│                                                             │
│  ✅ აქ უსაფრთხოა side effects                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Render Phase - დეტალურად

```typescript
function ProductList({ products }) {
  // ──────────────────────────────────
  // RENDER PHASE - ეს კოდი სრულდება
  // ──────────────────────────────────

  console.log('Rendering...'); // ეს იბეჭდება

  // ❌ არასწორი - side effect render phase-ში
  // fetch('/api/products'); // ეს არ უნდა იყოს აქ!

  // ❌ არასწორი - DOM manipulation render phase-ში
  // document.title = 'Products'; // ეს არ უნდა იყოს აქ!

  // ✅ სწორი - pure calculations
  const sortedProducts = products.sort((a, b) => a.price - b.price);
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      {sortedProducts.map(p => <ProductCard key={p.id} product={p} />)}
      <span>Total: {totalPrice}</span>
    </div>
  );
}
```

### Commit Phase და useEffect

```typescript
function ProductList({ products }) {
  useEffect(() => {
    // ──────────────────────────────────
    // COMMIT PHASE - ეს კოდი სრულდება
    // DOM განახლების შემდეგ
    // ──────────────────────────────────

    console.log('Effect running after render');

    // ✅ სწორი - side effects აქ
    document.title = `${products.length} Products`;

    // ✅ სწორი - API calls აქ
    analytics.track('viewed_products', { count: products.length });

  }, [products.length]);

  return <div>...</div>;
}
```

---

## Virtual DOM და Reconciliation

### რა არის Virtual DOM?

Virtual DOM არის JavaScript object-ების ხე, რომელიც აღწერს UI-ს:

```typescript
// JSX:
<div className="card">
  <h2>Title</h2>
  <p>Description</p>
</div>

// Virtual DOM (რეალურად ასე გამოიყურება):
{
  type: 'div',
  props: {
    className: 'card',
    children: [
      { type: 'h2', props: { children: 'Title' } },
      { type: 'p', props: { children: 'Description' } }
    ]
  }
}
```

### Reconciliation (შედარება)

როდესაც state იცვლება, React:

```
Old Virtual DOM              New Virtual DOM
─────────────────            ─────────────────
div.card                     div.card           ✓ იგივე
├── h2 "Title"               ├── h2 "Title"     ✓ იგივე
└── p "Description"          └── p "New Text"   ✗ განსხვავებული!
                                                  ↓
                                          მხოლოდ ეს იცვლება DOM-ში
```

```typescript
function Card({ text }) {
  // text: "Description" → "New Text"

  return (
    <div className="card">        {/* არ იცვლება */}
      <h2>Title</h2>              {/* არ იცვლება */}
      <p>{text}</p>               {/* მხოლოდ ეს იცვლება! */}
    </div>
  );
}
```

---

## სრული Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPONENT LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────┘

     TRIGGER                    RENDER PHASE              COMMIT PHASE
  ─────────────              ─────────────────          ────────────────

  ┌───────────┐              ┌───────────────┐          ┌──────────────┐
  │  Initial  │─────────────▶│  Component    │─────────▶│  Update DOM  │
  │  Mount    │              │  Function()   │          │              │
  └───────────┘              └───────────────┘          └──────────────┘
                                    │                          │
                                    ▼                          ▼
                             ┌───────────────┐          ┌──────────────┐
                             │  Return JSX   │          │  useEffect() │
                             └───────────────┘          │  გაეშვება    │
                                                        └──────────────┘

       │
       ▼

  ┌───────────┐              ┌───────────────┐          ┌──────────────┐
  │ setState  │─────────────▶│  Component    │─────────▶│  Update DOM  │
  │ გამოძახება│              │  Function()   │          │  (only diff) │
  └───────────┘              └───────────────┘          └──────────────┘
                                    │                          │
                                    ▼                          ▼
                             ┌───────────────┐          ┌──────────────┐
                             │  Return JSX   │          │  Cleanup()   │
                             │  (ახალი)      │          │  useEffect() │
                             └───────────────┘          └──────────────┘

       │
       ▼

  ┌───────────┐                                         ┌──────────────┐
  │  Unmount  │────────────────────────────────────────▶│  Cleanup()   │
  │           │                                         │  final       │
  └───────────┘                                         └──────────────┘
```

---

## Batching (setState-ების დაჯგუფება)

### მთავარი პრინციპი: Render ≠ Paint

```
   JavaScript Thread                          Browser
   ─────────────────                          ───────

   setState(1)  ─┐
   setState(2)  ─┼─► React აგროვებს          ❌ ჯერ არ იხატება!
   setState(3)  ─┘
        │
        ▼
   ┌─────────────────┐
   │  RENDER PHASE   │  React იძახებს ფუნქციებს,
   │  (JavaScript)   │  ქმნის Virtual DOM-ს      ❌ ჯერ არ იხატება!
   └─────────────────┘
        │
        ▼
   ┌─────────────────┐
   │  COMMIT PHASE   │  React აახლებს DOM-ს
   └─────────────────┘
        │
        ▼
                         ┌─────────────────┐
                         │  BROWSER PAINT  │  ✅ ახლა იხატება!
                         └─────────────────┘
```

**რატომ?** Performance! ერთი paint, არა სამი = smooth UI.

React აჯგუფებს მრავალ setState-ს ერთ რენდერში:

```typescript
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  console.log('Form რენდერდება');

  const handleSubmit = () => {
    setName('John');   // არ იწვევს რენდერს ჯერ
    setEmail('j@e.c'); // არ იწვევს რენდერს ჯერ
    setAge(25);        // არ იწვევს რენდერს ჯერ

    // React აჯგუფებს და ერთხელ რენდერავს!
  };

  // Result: "Form რენდერდება" იბეჭდება მხოლოდ ერთხელ
}
```

### Batching async-ში (React 18+)

```typescript
// React 18-მდე: async-ში batching არ მუშაობდა
// React 18+: batching ყველგან მუშაობს

const handleClick = async () => {
  const data = await fetch('/api/data');

  setName(data.name);  // ჯგუფდება
  setEmail(data.email); // ჯგუფდება
  // ერთი რენდერი
};
```

---

## რენდერის ოპტიმიზაცია

### React.memo - ბავშვის ზედმეტი რენდერის თავიდან აცილება

```typescript
// ❌ ყოველთვის რენდერდება როცა Parent რენდერდება
function Child({ name }) {
  console.log(`Child ${name} რენდერდება`);
  return <span>{name}</span>;
}

// ✅ რენდერდება მხოლოდ როცა props იცვლება
const MemoizedChild = React.memo(function Child({ name }) {
  console.log(`Child ${name} რენდერდება`);
  return <span>{name}</span>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+{count}</button>
      <MemoizedChild name="A" /> {/* არ რენდერდება count ცვლილებაზე */}
    </div>
  );
}
```

### useMemo - გამოთვლის ქეშირება

```typescript
function ProductList({ products, filter }) {
  // ❌ ყოველ რენდერზე თავიდან იფილტრება
  const filtered = products.filter(p => p.category === filter);

  // ✅ იფილტრება მხოლოდ როცა products ან filter იცვლება
  const filtered = useMemo(() => {
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  return <div>{filtered.map(p => <Card key={p.id} product={p} />)}</div>;
}
```

---

## რა არის useEffect?

`useEffect` არის React Hook რომელიც საშუალებას გვაძლევს შევასრულოთ "side effects":
- API calls
- Subscriptions
- DOM manipulation
- Timers

### ძირითადი სინტაქსი

```typescript
useEffect(() => {
  // Effect code - runs after render

  return () => {
    // Cleanup function - runs before next effect or unmount
  };
}, [dependencies]);
```

### სამი ვარიანტი:

```typescript
// 1. ყოველ რენდერზე
useEffect(() => {
  console.log('Runs after every render');
});

// 2. მხოლოდ mount-ზე (componentDidMount)
useEffect(() => {
  console.log('Runs only once on mount');
}, []);

// 3. dependency-ების შეცვლაზე
useEffect(() => {
  console.log('Runs when count changes');
}, [count]);
```

---

## Dependency Array

Dependency array განსაზღვრავს როდის უნდა გაეშვას effect.

### როგორ მუშაობს?

```typescript
const [count, setCount] = useState(0);
const [name, setName] = useState('');

useEffect(() => {
  console.log('Count changed to:', count);
}, [count]);

// count: 0 → 1  → effect გაეშვება
// name: '' → 'A' → effect არ გაეშვება (name არ არის dependency)
```

### რა უნდა ჩავწეროთ dependency-ში?

**წესი**: ყველა reactive value რომელსაც effect იყენებს.

```typescript
// ❌ არასწორი - props.userId არ არის dependency-ში
useEffect(() => {
  fetchUser(props.userId);
}, []);

// ✅ სწორი
useEffect(() => {
  fetchUser(props.userId);
}, [props.userId]);
```

---

## PurchasesContext - დეტალური ანალიზი

მოდით დეტალურად გავარჩიოთ `PurchasesContext.tsx`:

### სრული კოდი ანოტაციებით

```typescript
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '~/hooks';
import { shopifyFetch } from '~/lib/shopify.client';
import { CUSTOMER_PURCHASES_QUERY } from '~/lib/shopify.queries';

// ========================================
// CONTEXT VALUE TYPE
// ========================================
interface PurchasesContextValue {
  purchasedProductIds: string[];      // ნაყიდი პროდუქტების ID-ები
  isLoading: boolean;                 // იტვირთება თუ არა
  isProductOwned: (productId: string) => boolean;  // შემოწმების ფუნქცია
  refreshPurchases: () => Promise<void>;           // ხელით განახლება
}

// ========================================
// CONTEXT CREATION
// ========================================
const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

// ========================================
// PROVIDER COMPONENT
// ========================================
export function PurchasesProvider({ children }: { children: ReactNode }) {
  // ვიღებთ auth მონაცემებს სხვა context-იდან
  const { user, isAuthenticated } = useAuth();

  // ლოკალური state
  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // FETCH FUNCTION (useCallback)
  // ========================================
  const fetchPurchases = useCallback(async () => {
    // Guard clause - თუ არ არის token, გასვლა
    if (!user?.accessToken) {
      setPurchasedProductIds([]);
      return;
    }

    setIsLoading(true);

    try {
      // Shopify API call
      const response = await shopifyFetch<CustomerPurchasesResponse>({
        query: CUSTOMER_PURCHASES_QUERY,
        variables: {
          customerAccessToken: user.accessToken,
        },
      });

      // Response-ის დამუშავება
      if (!response.customer?.orders) {
        setPurchasedProductIds([]);
        return;
      }

      // Product ID-ების ამოღება PAID orders-დან
      const productIds = new Set<string>();

      for (const orderEdge of response.customer.orders.edges) {
        const order = orderEdge.node;

        // მხოლოდ გადახდილი შეკვეთები
        if (order.financialStatus !== 'PAID') continue;

        for (const lineItemEdge of order.lineItems.edges) {
          const productId = lineItemEdge.node.variant?.product?.id;
          if (productId) {
            productIds.add(productId);
          }
        }
      }

      setPurchasedProductIds(Array.from(productIds));
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      setPurchasedProductIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken]);  // 👈 DEPENDENCY: მხოლოდ accessToken

  // ========================================
  // MAIN EFFECT - AUTH CHANGE HANDLER
  // ========================================
  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      // მომხმარებელი შემოვიდა - წამოვიღოთ purchases
      fetchPurchases();
    } else {
      // მომხმარებელი გავიდა - გავასუფთავოთ
      setPurchasedProductIds([]);
    }
  }, [isAuthenticated, user?.accessToken, fetchPurchases]);
  // 👆 DEPENDENCIES:
  // - isAuthenticated: true/false ცვლილებაზე
  // - user?.accessToken: token-ის შეცვლაზე
  // - fetchPurchases: useCallback reference

  // ========================================
  // OWNERSHIP CHECK FUNCTION
  // ========================================
  const isProductOwned = useCallback((productId: string): boolean => {
    if (!productId || purchasedProductIds.length === 0) return false;

    const numericId = extractNumericId(productId);

    return purchasedProductIds.some(id => {
      const ownedNumericId = extractNumericId(id);
      return id === productId || ownedNumericId === numericId;
    });
  }, [purchasedProductIds]);  // 👈 DEPENDENCY: purchasedProductIds

  // ========================================
  // CONTEXT VALUE
  // ========================================
  const value: PurchasesContextValue = {
    purchasedProductIds,
    isLoading,
    isProductOwned,
    refreshPurchases: fetchPurchases,
  };

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}
```

### Effect-ის Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT MOUNT                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useEffect გაეშვება (initial render-ის შემდეგ)              │
│  Dependencies: [isAuthenticated, user?.accessToken, ...]    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ isAuthenticated?     │
                 └──────────────────────┘
                    │              │
                   YES            NO
                    │              │
                    ▼              ▼
         ┌──────────────┐   ┌──────────────────┐
         │fetchPurchases│   │ setPurchased([]) │
         │    ()        │   │ (clear state)    │
         └──────────────┘   └──────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Shopify API Call     │
         │ CUSTOMER_PURCHASES   │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ setPurchasedIds([])  │
         │ (update state)       │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Component re-renders │
         │ with new data        │
         └──────────────────────┘
```

### Dependency Change Scenarios

```
Scenario 1: მომხმარებელი შემოდის
─────────────────────────────────────
Before: isAuthenticated = false
After:  isAuthenticated = true, user.accessToken = "abc123"

→ useEffect გაეშვება რადგან dependency შეიცვალა
→ fetchPurchases() გამოიძახება
→ Shopify-დან მოდის purchases
→ state განახლდება


Scenario 2: მომხმარებელი გადის
─────────────────────────────────────
Before: isAuthenticated = true
After:  isAuthenticated = false, user = null

→ useEffect გაეშვება
→ else branch: setPurchasedProductIds([])
→ state იწმინდება


Scenario 3: სხვა state შეიცვალა (მაგ: cart)
─────────────────────────────────────
cart: [] → [{product1}]

→ useEffect არ გაეშვება
→ რადგან cart არ არის dependency-ში
```

---

## useCallback და მისი როლი

### პრობლემა useCallback-ის გარეშე

```typescript
// ❌ პრობლემატური
function PurchasesProvider({ children }) {
  const { user } = useAuth();

  // ეს ფუნქცია ყოველ რენდერზე იქმნება ახალი
  const fetchPurchases = async () => {
    await shopifyFetch({ ... });
  };

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]); // ❌ Infinite loop!

  // რენდერი → ახალი fetchPurchases → effect გაეშვება →
  // setState → რენდერი → ახალი fetchPurchases → ...
}
```

### გადაწყვეტა useCallback-ით

```typescript
// ✅ სწორი
const fetchPurchases = useCallback(async () => {
  await shopifyFetch({ ... });
}, [user?.accessToken]); // მხოლოდ accessToken ცვლილებაზე იქმნება ახალი

useEffect(() => {
  fetchPurchases();
}, [fetchPurchases]); // ახლა უსაფრთხოა
```

### როდის გამოვიყენოთ useCallback?

1. ფუნქცია dependency-ში რომ გვინდა
2. ფუნქცია child component-ს გადაეცემა props-ად
3. ფუნქცია სხვა hook-ში გამოიყენება

---

## ხშირი შეცდომები

### 1. Missing Dependency

```typescript
// ❌ userId არ არის dependency-ში
useEffect(() => {
  fetchUser(userId);
}, []); // ESLint warning!

// ✅
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 2. Object/Array Dependency

```typescript
// ❌ ყოველ რენდერზე ახალი object reference
useEffect(() => {
  doSomething(options);
}, [options]); // options = { a: 1 } ყოველთვის "ახალია"

// ✅ გამოსავალი 1: primitive values
useEffect(() => {
  doSomething({ a: options.a });
}, [options.a]);

// ✅ გამოსავალი 2: useMemo
const memoizedOptions = useMemo(() => ({ a: 1 }), []);
useEffect(() => {
  doSomething(memoizedOptions);
}, [memoizedOptions]);
```

### 3. Async Effect

```typescript
// ❌ async ფუნქციას აბრუნებს Promise, არა cleanup
useEffect(async () => {
  await fetchData();
}, []);

// ✅ შიგნით async ფუნქცია
useEffect(() => {
  const fetchData = async () => {
    await ...
  };
  fetchData();
}, []);

// ✅ ან IIFE
useEffect(() => {
  (async () => {
    await fetchData();
  })();
}, []);
```

### 4. Stale Closure

```typescript
// ❌ count ყოველთვის 0 იქნება
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1); // closure "იმახსოვრებს" count = 0
  }, 1000);
  return () => clearInterval(interval);
}, []); // count არ არის dependency-ში

// ✅ functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1); // prev ყოველთვის current value
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

---

## Best Practices

### 1. Effect-ების გამიჯვნა

```typescript
// ❌ ერთი დიდი effect
useEffect(() => {
  fetchUser(userId);
  fetchPosts(userId);
  trackPageView();
  setupWebSocket();
}, [userId]);

// ✅ ცალ-ცალკე effects
useEffect(() => {
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  fetchPosts(userId);
}, [userId]);

useEffect(() => {
  trackPageView();
}, []);

useEffect(() => {
  const ws = setupWebSocket();
  return () => ws.close();
}, []);
```

### 2. Cleanup Function

```typescript
useEffect(() => {
  const subscription = eventEmitter.subscribe(handler);

  // Cleanup - გაეშვება unmount-ზე ან შემდეგ effect-მდე
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. Race Condition Prevention

```typescript
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    const result = await api.fetch(id);

    // თუ component unmount-დება ან id შეიცვალა
    if (!cancelled) {
      setData(result);
    }
  };

  fetchData();

  return () => {
    cancelled = true; // აღარ დავაყენოთ state
  };
}, [id]);
```

### 4. Custom Hook Extraction

```typescript
// თუ effect logic კომპლექსურია, გამოიტანეთ custom hook-ში
function usePurchases() {
  const { user, isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    fetchPurchases(user.accessToken)
      .then(setPurchases)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user?.accessToken]);

  return { purchases, isLoading };
}

// გამოყენება
function ProductPage() {
  const { purchases, isLoading } = usePurchases();
  // ...
}
```

---

## შეჯამება

| Concept | როდის გამოვიყენოთ |
|---------|-------------------|
| `useEffect(() => {}, [])` | ერთხელ mount-ზე (API call, subscription) |
| `useEffect(() => {}, [dep])` | dependency ცვლილებაზე |
| `useCallback` | ფუნქცია dependency-ში ან props-ში |
| `useMemo` | object/array dependency-ში |
| Cleanup function | Subscriptions, timers, event listeners |
