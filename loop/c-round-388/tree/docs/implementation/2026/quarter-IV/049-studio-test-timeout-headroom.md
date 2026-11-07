# Studio-ს ტესტების timeout-ის მარაგი დატვირთვისას (C-R48-01)

**თარიღი:** 2026-10-17
**სტატუსი:** Round 56 — D-29z21; C-ის შემოწმებას ელოდება
**შეცვლილი პროექტი:** Store (მხოლოდ ტესტები)

## კონტექსტი

C-R48-01 (Medium) 48-ე რაუნდში დაფიქსირდა: `npm run verify`-ის vitest-ის ნაწილი დატვირთულ მანქანაზე ზოგჯერ ჩავარდნილია `Test timed out in 5000ms`-ით, თუმცა ჩავარდნილი ფაილები შეცვლილი არ იყო. 54-ე რაუნდში C-ის სამივე სრული გაშვება ამ მიზეზით ჩავარდა. 55-ე რაუნდის ერთი მშვიდი PASS ბაგს არ ხურავს: gate არასაიმედოა და ყოველი ჩავარდნა ცალკე გამოკვლევას მოითხოვს.

51–54 რაუნდების A/C გაშვებების `Test timed out in` ხაზების მიხედვით დაზარალებული ტესტები:

| ტესტი | ფაილი | რამდენჯერ |
|---|---|---|
| `folds a lane to a 36 px row …` | `track-layout.test.tsx` | 8 |
| `writes no history for fold, height or auto-fit …` | `track-layout.test.tsx` | 1 |
| `adds three sounds from two collections …` | `sfx-library.test.tsx` | 5 |
| `searches tags, filters collections …` | `sfx-library.test.tsx` | 1 |
| `renders the Master group with Mute …` | `master-ui.test.tsx` | 1 |
| `Clip Gain typed "3" → the same SFX header click …` | `fader-guards.test.tsx` | 1 |
| GS14 | `grid-snap-ui.test.tsx` | 1 |
| SD1 | `grid-snap-loop-drop.test.tsx` | 1 |

ცალკე გაშვებისას ეს ტესტები 0.05–1.9 წამში სრულდება (B: fold 1579 ms, adds three 1845 ms; A, round 56: 998 ms და 1145 ms). დატვირთვისას იგივე ტესტებმა 5000 ms გადააჭარბა, მაქსიმუმ 8454 ms-მდე (`fader-guards`, C round 54). პრობლემა ტესტის ლოგიკა კი არა, jsdom-ში `StudioWorkspace`-ის mount-ის ხარჯია, როცა worker-ები CPU-ს ინაწილებენ.

## მიდგომა

ოთხ ფაილში, რომლებშიც timeout რეალურად დაფიქსირდა, ყოველ top-level `describe`-ს მეორე არგუმენტად ემატება suite option `{ timeout: 15_000 }`. სულ 6 `describe`: `track-layout` — 3, `sfx-library`, `master-ui`, `fader-guards` — თითო. ჩადგმული `describe`-ები და ყველა `it` ამ მნიშვნელობას მემკვიდრეობით იღებს.

ეს **მარაგია და არა აჩქარება**. ნამდვილი hang კვლავ ჩავარდება, 5 წამის ნაცვლად 15 წამზე. 15 000 ms ყველაზე ცუდ დაკვირვებას (8.45 s) დაახლოებით 1.8-ჯერ აღემატება და ცალკე გაშვების დროს დაახლოებით 8-ჯერ. ის მაინც ბევრად ნაკლებია იმ მნიშვნელობაზე (მაგ. 60 s), რომელიც hang-ს დამალავდა.

უარყოფილი ალტერნატივები:
- **root-ის `vitest.config.ts`-ში `testTimeout` ან worker-ების ლიმიტი.** ეს root-ის ბერკეტია; B-მ ორჯერ ითხოვა და პასუხი არ მიუღია. მოთხოვნა ძალაში რჩება, რადგან grid-ის residual-საც დაფარავდა.
- **ყველა ფაილი, რომელიც `StudioWorkspace`-ს mount-ავს (26 ფაილი).** timeout მხოლოდ ამ 4 ფაილში (და grid-ის 2 residual-ში) დაფიქსირდა, ამიტომ ცვლილება მტკიცებულებით შეზღუდულ ნაკრებზე რჩება.
- **ცალკეულ `it`-ზე რიცხვითი timeout.** 120-ზე მეტ ტესტს შეეხებოდა და ახალ ტესტს მარაგს არ მისცემდა.
- **`vi.setConfig`.** runtime-ში იცვლება, ჩანს ნაკლებად და ფაილის რიგზეა დამოკიდებული.
- **`retry`.** მარცხს მალავს და ტესტის დროს ორმაგებს.

ასერტები, fixtures, helpers, `it`-ების სათაურები, რაოდენობა და რიგი არ შეცვლილა. კონფიგურაცია და app source უცვლელია.

## არქიტექტურა

მექანიზმი დაყენებულ runner-შია (vitest 4.0.16, `node_modules/@vitest/runner/dist/index.js`):
- `parseArguments` (≈l.725–748): options მესამე არგუმენტად Vitest 4-ში `TypeError`-ს აგდებს. სწორი ფორმაა `describe(name, options, fn)`.
- `task` (≈l.757): ტესტის timeout არის `options.timeout ?? runner.config.testTimeout`. ნაგულისხმევი 5000 ms მხოლოდ მაშინ მოქმედებს, როცა ტესტს საკუთარი მნიშვნელობა არ აქვს.
- `test` collector (≈l.817–818): suite-ის options ერწყმის ყოველი ტესტის options-ს.
- suite collector (≈l.942–944): ჩადგმული suite მშობლის options-ს იღებს.
- hook-ების (`beforeEach` და ა.შ.) timeout ამ ცვლილებით არ იცვლება; ის კვლავ `hookTimeout`-ია.

დიაგრამა არ არის საჭირო.

## შეცვლილი ფაილები

- `app/lib/arrangement/__tests__/track-layout.test.tsx` — 3 top-level `describe`-ს დაემატა `{ timeout: 15_000 }`. სათაურები 100 სიმბოლოზე გრძელია, ამიტომ Biome-მა გამოძახება სამ ხაზად გადაიტანა და სამივე callback-ის ტანი ერთი დონით შეწია. ამ გადაწევამ ორი `expect(...).toBe(...)` ხაზი ახალ ზღვარს გადააცილა. Biome-მა ისინი ორ ხაზად გადაიტანა და trailing comma დაამატა.
- `app/lib/__tests__/sfx-library.test.tsx` — 1 `describe`, ერთი ხაზი.
- `app/lib/arrangement/__tests__/master-ui.test.tsx` — 1 `describe`, ერთი ხაზი. 4 ჩადგმული `describe` მემკვიდრეობით იღებს.
- `app/lib/arrangement/__tests__/fader-guards.test.tsx` — 1 `describe`, ერთი ხაზი. ყველა ჩადგმული `describe` მემკვიდრეობით იღებს, მათ შორის ორი დონით ჩადგმული (`C-R36-01 …`).
- `docs/implementation/2026/quarter-IV/049-studio-test-timeout-headroom.md` — ეს დოკუმენტი.

## პრობლემები და გადაწყვეტები

- **პრობლემა:** `track-layout`-ის სამი სათაური option-ის დამატებით ხაზის 100-სიმბოლოიან ლიმიტს სცდება. ერთ ხაზად დატოვება Biome-ის format error-ს იწვევს, ეს კი 0 diagnostics-ის კრიტერიუმს ეწინააღმდეგება.
  **გადაწყვეტა:** `biome check --write` გაეშვა მხოლოდ ამ 4 ფაილზე. შედეგად ტანი ერთი დონით შეიწია და ორი `toBe(...)` ხაზი გადაიტანა. ეკვივალენტობა შემოწმდა: snapshot-ს დაემატა სამი `{ timeout: 15_000 },` არგუმენტი, ორივე მხრიდან ამოიშალა whitespace და `,)` → `)`. ამის შემდეგ snapshot და შეცვლილი ფაილი იდენტურია (`a-round-56/token-equivalence.txt`). `diff -w`-ში, ამ ორი `toBe` ხაზის გარდა, მხოლოდ დამატებული არგუმენტი და `},\n);` დახურვა ჩანს.
- **პრობლემა:** M1–M4-ის მტკიცებულება `store/`-ის ფაილების შეცვლას არ უნდა საჭიროებდეს.
  **გადაწყვეტა:** scratch ასლი `tmp/studio-real-loop/a-round-56/scratch`-ში, საკუთარი vitest config-ით და `node_modules` junction-ით. junction ბოლოს წაიშალა; `store/node_modules` ხელუხლებელია.

## ტესტირება

**მექანიზმი (scratch, `a-round-56/mechanism.txt`):** ტესტის პირველ statement-ად ჩაისვა `await new Promise<void>(() => undefined);`.
- **M1:** `track-layout`, fold ტესტი → `Test timed out in 15000ms`; დანარჩენი 35 გაიარა.
- **M2:** `fader-guards`, ორი დონით ჩადგმული `C-R36-01` describe-ის პირველი `it` → `Test timed out in 15000ms`; დანარჩენი 70 გაიარა.
- **M3:** M1 + describe-იდან option-ის მოხსნა → `Test timed out in 5000ms`.
- **M4:** არა-owned `grid-snap-ui`, GS14 → `Test timed out in 5000ms`. option-ის გარეთ ნაგულისხმევი მნიშვნელობა უცვლელია.

**ცალკე გაშვების დრო (4 ფაილი, 128/128, `node.exe` 9):**

| ტესტი | ადრე (ms) | შემდეგ (ms) |
|---|---|---|
| fold | 998 | 891 |
| no-history | 116 | 170 |
| adds three | 1145 | 1041 |
| searches | 462 | 600 |
| renders | 370 | 296 |
| `Clip Gain typed "3" → the same SFX header click …` (`fader-guards`) | 57 | 80 |

არცერთი ცვლილება 2-ჯერ არ აღემატება.

**Gate-ები:** `npx tsc --noEmit` → 0; სრული `npx vitest run` → 87 ფაილი / 1504, 0 ჩავარდნა; `npm run build` → rc 0. Biome `./app` → 5 / 218 / 1 (baseline, CRLF-ის 5 error სხვა ფაილებზე); 4 owned ფაილზე 0 diagnostics. `npm run verify` → rc 0.

**დატვირთვის ქვეშ (R56-LOAD)** C ამოწმებს; A-ს გაზომვა არ ჩაუტარებია.

## Ableton-ის წყარო და შესაბამისობა

არ ეხება. ცვლილება მხოლოდ ტესტების ინფრასტრუქტურას შეეხება და მომხმარებლისთვის ხილული ქცევა არ შეცვლილა.

## TODO / შემდეგი ნაბიჯები

- **C-R48-01-GRID-RESIDUAL (Low):** `grid-snap-ui.test.tsx` (GS14) და `grid-snap-loop-drop.test.tsx` (SD1) round 50–55-ის დაუკომიტებელ ერთეულს ეკუთვნის და ამ რაუნდის ფარგლებს გარეთაა.
- **root-ის config:** jsdom suite-ებისთვის `testTimeout` ან worker-ების ლიმიტი ორივე residual-ს დაფარავდა.
- **stage-4a-ის browser acceptance** და G-3 (purchase protection) — სერვერები 52–56 რაუნდებში მიუწვდომელია.
- **SRW-14 stage 4b.**
