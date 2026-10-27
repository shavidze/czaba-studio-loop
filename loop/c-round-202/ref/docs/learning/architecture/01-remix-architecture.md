# Remix Architecture - Czaba Store

## წინაპირობები (Prerequisites)

- HTML, CSS, JavaScript საფუძვლები
- React კომპონენტები, hooks, props
- HTTP მეთოდები (GET, POST) და request/response ციკლი
- Node.js-ისა და npm-ის საბაზისო ცოდნა

---

## ტერმინოლოგია

| ტერმინი | განმარტება |
|---------|-----------|
| **SSR (Server-Side Rendering)** | HTML გენერაცია სერვერზე, ბრაუზერამდე მისვლამდე |
| **CSR (Client-Side Rendering)** | HTML გენერაცია ბრაუზერში JavaScript-ით |
| **Hydration** | სერვერზე შექმნილი HTML-ის "გაცოცხლება" ბრაუზერში — event listener-ების მიბმა |
| **Loader** | სერვერის ფუნქცია, რომელიც მონაცემებს აწვდის კომპონენტს render-ის წინ |
| **Action** | სერვერის ფუნქცია, რომელიც form submission-ს ან mutation-ს ამუშავებს |
| **Route Module** | ფაილი `app/routes/`-ში, რომელიც ერთდროულად არის URL, loader, action და კომპონენტი |
| **File-based Routing** | URL-ების ავტომატური გენერაცია ფაილის სახელიდან |
| **Nested Routes** | მშობელ-შვილ route-ების ხისებრი სტრუქტურა |
| **Outlet** | ადგილი მშობელ layout-ში, სადაც შვილი route რენდერდება |
| **Progressive Enhancement** | აპლიკაცია მუშაობს JavaScript-ის გარეშეც, JS ამდიდრებს გამოცდილებას |

---

## პრობლემის აღწერა - რატომ არის ეს საჭირო

Czaba Store არის მუსიკალური პროდუქტების მაღაზია, რომელსაც ორი ფუნდამენტურად განსხვავებული მოთხოვნა აქვს:

**პროდუქტის გვერდები** - SEO-სთვის აუცილებელია სერვერზე რენდერდებოდეს. Google-ის bot-მა უნდა ნახოს პროდუქტის სახელი, აღწერა, ფასი, ჟანრი. თუ ეს მონაცემები მხოლოდ JavaScript-ით ჩაიტვირთება, საძიებო სისტემა ვერ აინდექსებს.

**Personal Mixdown Studio** - მთლიანად client-side აპლიკაციაა. Web Audio API, WaveSurfer.js, IndexedDB - არცერთი მათგანი სერვერზე არ მუშაობს. Studio-ს SEO არ სჭირდება, რადგან მხოლოდ ავტორიზებულ მომხმარებლებს აქვთ წვდომა.

Remix framework ამ ორივე მოთხოვნას ერთ არქიტექტურაში აერთიანებს - SSR იქ სადაც SEO გვჭირდება, CSR იქ სადაც browser API-ები სჭირდება.

---

## ძირითადი კონცეფცია

### Remix Request Lifecycle

Remix-ის მთავარი იდეა: ბრაუზერი და სერვერი ერთი ფაილის ორი მხარეა. Route module-ში `loader` სერვერზე გაეშვება, `default export` კომპონენტი ბრაუზერშიც და სერვერზეც.

```mermaid
graph TD
    A["Browser: URL Request"] -->|HTTP GET| B["Remix Server"]
    B --> C{"Route Matching"}
    C --> D["loader() Execution"]
    D -->|fetch data| E["Backend API / DB"]
    E -->|JSON| D
    D -->|data| F["React SSR Render"]
    F -->|HTML + Data| G["Browser"]
    G --> H["Hydration"]
    H --> I["Interactive App"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style B fill:#1a1a2e,stroke:#0f3460,color:#fff
    style D fill:#16213e,stroke:#0f3460,color:#fff
    style F fill:#16213e,stroke:#0f3460,color:#fff
    style G fill:#1a1a2e,stroke:#e94560,color:#fff
    style I fill:#1a1a2e,stroke:#53bf7d,color:#fff
```

### Loader vs Action - მონაცემთა ნაკადი

Loader არის GET request-ების handler - მონაცემების წამოღება. Action არის POST/PUT/DELETE request-ების handler - მონაცემების ცვლილება. ორივე სერვერზე ეშვება.

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Remix Server
    participant API as Czaba Backend

    Note over B,API: Loader Flow (GET - მონაცემების წამოღება)
    B->>S: GET /products/epic-cinematic
    S->>S: loader() გაშვება
    S->>API: GET /api/products/epic-cinematic
    API-->>S: Product JSON
    S->>S: React SSR Render
    S-->>B: HTML + embedded data

    Note over B,API: Action Flow (POST - მონაცემების ცვლილება)
    B->>S: POST /cart (Form Submit)
    S->>S: action() გაშვება
    S->>API: POST /api/cart/items
    API-->>S: Updated Cart
    S->>S: redirect ან revalidation
    S-->>B: Updated page
```

---

## როგორ მუშაობს - ნაბიჯ-ნაბიჯ

### ნაბიჯი 1: File-based Routing

Remix-ში URL-ების სტრუქტურა ფაილების სახელებით განისაზღვრება. თითოეული ფაილი `app/routes/`-ში ავტომატურად URL ხდება.

```mermaid
graph LR
    subgraph Files["app/routes/"]
        F1["_index.tsx"]
        F2["products._index.tsx"]
        F3["products.$handle.tsx"]
        F4["studio.$handle.tsx"]
        F5["cart.tsx"]
        F6["account.tsx"]
        F7["account.orders.tsx"]
    end

    subgraph URLs["Generated URLs"]
        U1["/"]
        U2["/products"]
        U3["/products/epic-cinematic"]
        U4["/studio/epic-cinematic"]
        U5["/cart"]
        U6["/account"]
        U7["/account/orders"]
    end

    F1 --> U1
    F2 --> U2
    F3 --> U3
    F4 --> U4
    F5 --> U5
    F6 --> U6
    F7 --> U7
```

`$handle` არის dynamic segment - URL-ის ნაწილი რომელიც ცვლადია. `/products/epic-cinematic`-ში `handle` = `"epic-cinematic"`.

### ნაბიჯი 2: Nested Routes და Layout

Remix-ის nested routing საშუალებას იძლევა მშობელ layout-ში შვილი route ჩაინდოს. მაგალითად, `/account` layout-ს აქვს sidebar ნავიგაცია, და `/account/orders` ამ layout-ში რენდერდება.

```
app/routes/
├── _index.tsx               → / (მთავარი გვერდი)
├── products._index.tsx      → /products (კატალოგი)
├── products.$handle.tsx     → /products/:handle (პროდუქტის გვერდი)
├── studio.$handle.tsx       → /studio/:handle (Personal Mixdown Studio)
├── cart.tsx                 → /cart (კალათა)
├── account.tsx              → /account (layout + sidebar)
└── account.orders.tsx       → /account/orders (account layout-ში)
```

`account.tsx` შეიცავს `<Outlet />`-ს, სადაც `account.orders.tsx` ჩაირენდერება.

### ნაბიჯი 3: SSR vs CSR გადაწყვეტილება Czaba-ში

ყველა route არ საჭიროებს SSR-ს. Czaba-ში მკაფიო დაყოფაა:

```mermaid
graph TB
    subgraph SSR["SSR Routes (SEO-critical)"]
        P1["/products - კატალოგი"]
        P2["/products/:handle - პროდუქტი"]
        P3["/ - მთავარი გვერდი"]
    end

    subgraph CSR["CSR Routes (Browser API-dependent)"]
        S1["/studio/:handle - Mixdown Studio"]
        S2["Audio Player - Web Audio API"]
        S3["StemsPreviewModal - WaveSurfer.js"]
    end

    subgraph HYBRID["Hybrid Routes"]
        H1["/cart - SSR shell + CSR interactivity"]
        H2["/account - SSR layout + CSR data"]
    end

    SSR -->|Google Bot| SEO["SEO Indexing"]
    CSR -->|Auth Required| AUTH["Protected Routes"]
    HYBRID -->|Both| BOTH["SSR + Hydration"]

    style SSR fill:#0d4b3c,stroke:#53bf7d,color:#fff
    style CSR fill:#3d1a1a,stroke:#e94560,color:#fff
    style HYBRID fill:#1a2744,stroke:#0f3460,color:#fff
```

**SSR Routes** - loader-ით მონაცემები სერვერზე ჩაიტვირთება, HTML სრულად შეიქმნება. Google bot ნახავს პროდუქტის სახელს, ფასს, აღწერას.

**CSR Routes** - Studio გვერდი `ClientOnly` wrapper-ით ჩაიტვირთება. სერვერი მხოლოდ shell HTML-ს გამოგზავნის, რეალური კონტენტი ბრაუზერში შეიქმნება.

**Hybrid Routes** - Cart-ის shell SSR-ით რენდერდება, მაგრამ ინტერაქტიული ნაწილი (რაოდენობის ცვლილება, წაშლა) hydration-ის შემდეგ ჩაირთვება.

### ნაბიჯი 4: Loader - მონაცემების ჩატვირთვა

Loader ფუნქცია სერვერზე ეშვება ყოველ GET request-ზე. მისი მიზანია მონაცემების მომზადება კომპონენტისთვის.

```mermaid
sequenceDiagram
    participant G as Google Bot
    participant R as Remix Server
    participant A as Czaba API

    G->>R: GET /products/epic-cinematic
    R->>R: match route: products.$handle.tsx
    R->>R: extract params: handle = "epic-cinematic"
    R->>A: GET /api/products/epic-cinematic
    A-->>R: Product JSON (name, price, stems, genres)
    R->>R: Run React component with data
    R-->>G: Full HTML with product info
    Note over G: Google indexes: "Epic Cinematic - $29.99"
```

### ნაბიჯი 5: Action - ფორმის დამუშავება

Action ფუნქცია form-ის submission-ს ამუშავებს. Remix-ში form-ის submit-ი რეალურ HTTP POST request-ს აგზავნის, JavaScript-ით აძლიერებს.

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant R as Remix Server
    participant A as Czaba API

    U->>B: Click "Add to Cart"
    B->>R: POST /cart (formData: productId)
    R->>R: action() გაშვება
    R->>A: POST /api/cart/items {productId, quantity: 1}
    A-->>R: Updated Cart
    R->>R: Revalidation - loader() ხელახლა
    R->>A: GET /api/cart
    A-->>R: Cart with new item
    R-->>B: Updated cart page
    Note over B: Progressive Enhancement: works without JS too
```

### ნაბიჯი 6: Error Boundaries

Remix-ში ყოველ route-ს შეიძლება ჰქონდეს საკუთარი `ErrorBoundary`. თუ loader-ში ან action-ში შეცდომა მოხდება, მხოლოდ ეს route აჩვენებს შეცდომას - დანარჩენი აპლიკაცია მუშაობს.

```
Root Layout (/root.tsx)
├── Header (მუშაობს)
├── Outlet
│   └── products.$handle.tsx → ErrorBoundary
│       └── "პროდუქტი ვერ მოიძებნა"
└── Footer (მუშაობს)
```

ეს React-ის ErrorBoundary-სგან განსხვავდება - Remix-ის ErrorBoundary loader/action შეცდომებსაც იჭერს, არამარტო render-ის დროინდელს.

---

## Czaba-ში იმპლემენტაცია

### Product Page Loader (SSR)

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { apiClient } from "~/services/api/client";

export async function loader({ params }: LoaderFunctionArgs) {
  const product = await apiClient.getProductByHandle(params.handle!);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({
    product,
    meta: {
      title: `${product.name} | Czaba`,
      description: product.description,
    },
  });
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
    </div>
  );
}
```

### Studio Page (Client-Only)

```tsx
import { ClientOnly } from "remix-utils/client-only";
import { useParams } from "@remix-run/react";

export default function StudioPage() {
  const { handle } = useParams();

  return (
    <ClientOnly fallback={<StudioSkeleton />}>
      {() => <StudioApp handle={handle!} />}
    </ClientOnly>
  );
}
```

Studio `ClientOnly`-ში არის გახვეული რადგან Web Audio API, WaveSurfer.js და IndexedDB მხოლოდ ბრაუზერში არსებობს. სერვერზე ამ API-ების გამოძახება აფეთქებს აპლიკაციას.

---

## Trade-offs

| გადაწყვეტილება | უპირატესობა | ნაკლოვანება |
|---------------|-------------|-------------|
| **SSR პროდუქტებისთვის** | SEO, სწრაფი First Contentful Paint | სერვერის დატვირთვა ყოველ request-ზე |
| **CSR Studio-სთვის** | Browser API-ები ხელმისაწვდომი | არ ინდექსდება, ცარიელი HTML თავდაპირველად |
| **File-based routing** | ინტუიციური URL სტრუქტურა | რთული dynamic routes-ისთვის |
| **Loader/Action pattern** | სერვერი და UI ერთ ფაილში | სერვერის კოდი შეიძლება bundle-ში მოხვდეს (tree-shaking საჭირო) |
| **Nested routes** | Layout-ების მრავალჯერადი გამოყენება | ღრმა nesting-ი რთულია |
| **Progressive Enhancement** | მუშაობს JS-ის გარეშეც | form-ის state management რთულდება |
| **Remix vs Next.js** | Web standards-ზე დაფუძნებული, მარტივი mental model | ნაკლები ecosystem, ნაკლები third-party library |

---

## დაკავშირებული თემები

- [State Management](./03-state-management.md) - როგორ მართავს Czaba state-ს React Context-ებით
- [API Integration](./04-api-integration.md) - loader-ებიდან და კომპონენტებიდან API-სთან კომუნიკაცია
- [Audio Studio System](./02-audio-studio-system.md) - CSR-only Studio არქიტექტურა
- [Czaba Store CLAUDE.md](../../../CLAUDE.md) - პროექტის ტექნიკური overview

---

## Key Takeaways

- **Remix-ში route module = URL + data loading + UI ერთ ფაილში.** `loader` სერვერზე მუშაობს, კომპონენტი ორივეგან.

- **SSR და CSR არჩევანი content-ის ტიპზეა დამოკიდებული.** Czaba-ში პროდუქტები SSR-ით რენდერდება SEO-სთვის, Studio მთლიანად client-side-ია browser API-ების გამო.

- **File-based routing ავტომატურად ქმნის URL სტრუქტურას.** `products.$handle.tsx` = `/products/:handle`. Dynamic segment-ი `$`-ით იწყება.

- **Progressive Enhancement ნიშნავს რომ form-ები მუშაობს JavaScript-ის გარეშეც.** Remix action-ები რეალურ HTTP POST-ს იყენებს, JS მხოლოდ UX-ს აუმჯობესებს.

- **ErrorBoundary ყოველ route-ს შეიძლება ჰქონდეს.** ერთი route-ის შეცდომა არ კლავს მთელ აპლიკაციას.
