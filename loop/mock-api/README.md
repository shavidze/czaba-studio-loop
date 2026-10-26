# CZABA mock API (STORE-0)

## დანიშნულება

ეს არის პატარა, დამოკიდებულებების გარეშე Node HTTP server, რომელიც CZABA .NET backend-ის ნაწილს ბაძავს. cloud runner-ზე ნამდვილი backend (`:5199`) და SQL Server არ არის, ამიტომ store-ის SSR loader-ები (`/`, `/store`, `/products/:handle`) მხოლოდ error ან empty state-ს აჩვენებდნენ. mock-ის საშუალებით C-ს შეუძლია STORE-1…STORE-5-ის გვერდები რეალურ Playwright Chromium-ში შეამოწმოს.

> **ეს ნამდვილი backend არ არის.** mock-ზე მიღებული PASS backend-ის მტკიცებულება არ არის. ownership, auth, cart, orders და payments ლოგიკა აქ არ არსებობს; ასეთი row რჩება BACKEND-ONLY-EVIDENCE-ში ("backend unavailable in cloud").

mock store-ის კოდი არ არის, store-ის dependency არ არის და store-ში არ კომიტდება. ის მხოლოდ loop folder-ში ცხოვრობს.

## სცენარი

**C, round 185.** cloud job-ის დასაწყისში `cloud/run.sh` ხედავს `mock-api/server.mjs`-ს და უშვებს. C ხსნის `http://127.0.0.1:5173/store`-ს. Remix-ის SSR loader `http://localhost:5199/api/products?pageSize=50&sortDesc=true`-ს ითხოვს, mock აბრუნებს 8 fixture პროდუქტს, store ფილტრავს `isActive`-ს და 7 pack-ს აჩვენებს. ბრაუზერში CartContext `GET /api/cart`-ს CORS preflight-ით ითხოვს და ცარიელ cart-ს იღებს. Studio-token-ის fake Bearer მოთხოვნა `/api/downloads`-ზე 401-ს იღებს და store 403 "Unable to verify ownership"-ით პასუხობს.

## გაშვება და გაჩერება

```bash
cd /home/runner/czaba-project/tmp/studio-real-loop
node mock-api/server.mjs > c-round-N/mock.log 2>&1 &
curl -s http://127.0.0.1:5199/__mock/health
```

- გაჩერება: `SIGINT` (Ctrl+C) ან `SIGTERM` (`kill <pid>`). server ხურავს listener-ებს და გამოდის code 0-ით.
- თუ port დაკავებულია, process გამოდის **code 1**-ით და stderr-ში წერს `port <n> is already in use; not starting`. სხვა process-ს არ აჩერებს.
- self-test: `node mock-api/selftest.mjs` თავისუფალ port-ზე უშვებს საკუთარ ასლს, ამოწმებს ყველა endpoint-ს და rc 0 ნიშნავს, რომ ყველა check გავიდა. :5199-ზე მომუშავე mock-ს არ ეხება.

## Port და env

| ცვლადი | default | აღწერა |
|---|---|---|
| `MOCK_API_PORT` | `5199` | port. არასწორი მნიშვნელობა → exit 2 |

- server უსმენს მხოლოდ loopback-ს: `127.0.0.1:<port>` და, თუ host-ს IPv6 loopback აქვს, `[::1]:<port>`. ეს საჭიროა, რადგან `client.ts`-ის default არის `http://localhost:5199`, რომელიც Node-ში შეიძლება `::1`-ად გადაწყდეს. `0.0.0.0` ან `::` არასოდეს.
- store-ის e2e smoke (`playwright.smoke.config.ts`) იყენებს `API_URL=http://127.0.0.1:51999`-ს, ამიტომ mock მასზე არ მოქმედებს.

## Endpoint-ები

ყველა JSON body იყენებს `client.ts`-ის envelope-ს `{ success, data, message? }` (გარდა `/__mock/health`-ისა).

| Method + path | პასუხი |
|---|---|
| `GET /api/products` | 200, `data` = `{ items, totalCount, pageNumber, pageSize }`. filter-ები: `category` (case-insensitive equality), `search` (substring: `title`, `description`, `tags`, `genre`), `genre`, `isNew`, `isPremium`, `page` (default 1), `pageSize` (default 20, max 100). `sortDesc=true` → უახლესი `createdAt` პირველი, სხვა შემთხვევაში უძველესი. `totalCount` = filter-ის შემდეგ |
| `GET /api/products/handle/:handle` | 200 `Product` (`variants`-ით). უცნობი → 404 `Product not found` |
| `GET /api/products/:id` (ციფრები) | იგივე id-ით |
| `GET /api/cart` | 200 ცარიელი `Cart` (`id: null`, `items: []`, ყველა თანხა 0) |
| `POST/PUT/PATCH/DELETE /api/cart`, `/api/cart/**` | **501** `Cart changes are not available in the CZABA mock API.` (ruling R51: ყალბი success არ არის) |
| `/api/auth`, `/api/auth/**` | **401** `Sign-in is not available in the CZABA mock API.` |
| `/api/downloads*`, `/api/orders*`, `/api/payments*`, `/api/sfx-library`, `/api/products/:id/recordings*`, `/api/gift-cards*`, `/api/sfx-scenes*`, `/api/chat*` | **401** `Please sign in to continue.`, `Authorization` header-ის მიუხედავად |
| `GET /__mock/health` | 200 `{ ok: true, products: 8, port }`, envelope-ის გარეშე |
| `OPTIONS *` | **204**, ცარიელი body |
| დანარჩენი (მათ შორის `/hubs/**`, path traversal, ცუდი percent-encoding) | **404** `Not found`. არასოდეს 500. server ფაილებს არ ემსახურება |

**CORS** (ყველა პასუხზე, error-ების ჩათვლით): თუ `Origin` არის `http://127.0.0.1:<port>` ან `http://localhost:<port>` (anchored regex), server აბრუნებს იმავე origin-ს `Access-Control-Allow-Origin`-ში, `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Id` და `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`. `Vary: Origin` ყოველთვის იგზავნება. `*` არასოდეს. სხვა origin CORS header-ებს არ იღებს.

**Log:** stdout-ში თითო request-ზე ერთი ხაზი: ISO დრო, method, path+query, `origin=<Origin ან ->`, `auth=yes|no`, status. `Authorization`-ის მნიშვნელობა არასოდეს იწერება.

## Fixture

8 პროდუქტი, `server.mjs`-ის `MOCK_PRODUCTS` კონსტანტაში. ტიპები ზუსტად `client.ts`-ის `Product` / `ProductVariant` / `VariantAudioMetadata`-ს ემთხვევა, დამატებითი ველების გარეშე.

| id | handle | category | isActive | isNew | isPremium | variants | preview |
|---|---|---|---|---|---|---|---|
| 1 | `middle-east` | Track | ✓ | ✓ | ✓ | Standard $29 / Premium $99 (stems) | `/middle-east.mp3` |
| 2 | `harbour-lights` | Track | ✓ | | | Standard $24 / Premium $79 (stems) | `/videos/hero/hero-music.mp3` |
| 3 | `copper-horizon` | Track | ✓ | | | — | `/middle-east.mp3` |
| 4 | `night-train` | Track | ✓ | | | — | `/videos/hero/hero-music.mp3` |
| 5 | `quiet-valley` | Track | ✓ | | | — | `/middle-east.mp3` |
| 6 | `door-slams` | SFX | ✓ | | | — | `/videos/hero/hero-music.mp3` |
| 7 | `archived-rain` | SFX | **✗** | | | — | `/middle-east.mp3` |
| 8 | `pulse-loop-kit` | Loop | ✓ | ✓ | | — | `/videos/hero/hero-music.mp3` |

- ყველა `imageUrl` არის `/images/packs/*` (store-ის `public/`). ყველა `audioPreviewUrl` არაცარიელი ლოკალური mp3-ია, რადგან ცარიელი preview store-ში R2 worker host-ზე გადადის (აკრძალული host).
- არცერთი remote URL (არც unsplash, არც R2). `vendor: 'CZABA'`. სათაურები და აღწერები სატესტო მონაცემია, რეალურ ადამიანებზე, ჯილდოებზე ან რიცხვებზე claim-ის გარეშე.
- `createdAt` მნიშვნელობები განსხვავებულია, ამიტომ sort შემოწმებადია. `archived-rain` შეგნებულად inactive-ია, რომ C-მ store-ის filter დაამტკიცოს.

## დაცვის წესები (P1–P4)

- **P1.** `/api/downloads*`, `/api/auth/*` და `/api/orders*` არასოდეს აბრუნებს `success: true`-ს, header-ების მიუხედავად. ამიტომ `api.studio-token.ts` fake Bearer-ით მთავრდება **403 "Unable to verify ownership"**-ით და R2 token არ იქმნება.
- **P2.** `Set-Cookie` არასოდეს იგზავნება. `/studio-lab`-ის "0 cookies, no `auth_user`" მიღება ძალაში რჩება.
- **P3.** არც secret-ები, არც `.env`-ის კითხვა, არც გარე network call, არც ფაილის კითხვა. მხოლოდ `node:` import-ები.
- **P4.** mock store-ის process-ებს არ ცვლის, არ უშვებს და არ აჩერებს. store-ის dependency არ არის და store-ში არ კომიტდება.

## ახალი პროდუქტის დამატება

1. `server.mjs`-ში `MOCK_PRODUCTS`-ს დაამატე ობიექტი უნიკალური `id`-ით, `handle`-ით და `createdAt`-ით. გამოიყენე მხოლოდ `client.ts`-ის `Product` ველები.
2. `imageUrl` და `audioPreviewUrl` უნდა იყოს store-ის `public/`-ში არსებული ლოკალური path, არასოდეს remote URL. preview ცარიელი არ უნდა იყოს.
3. `variants`-ისთვის გამოიყენე `variantPair(id, standardPrice, premiumPrice, createdAt)`: Premium-ის `audioMetadata`-ში ექვსივე ველი სავალდებულოა.
4. განაახლე `selftest.mjs`-ის რაოდენობები (8 პროდუქტი, 5/2/1 category, filter-ების რიცხვები) და გაუშვი `node mock-api/selftest.mjs`.
5. ტიპების შემოწმება: round 185-ის recipe (`a-round-185/tools/gen-fixture-typecheck.mjs` + `tsconfig.fixture.json`, `store/`-იდან `npx tsc -p <json>`), 0 error.
