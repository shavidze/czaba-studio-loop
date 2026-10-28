COMMIT: OK

## Code Review: round 224, PERF-HARNESS-SHARED-LIB-b-i (determinism contract + GATE214-S4)

Ცვლილება მხოლოდ `perf/**`-სა და `docs/implementation/2026/quarter-IV/`-ს ეხება. `app/**`, auth, purchase და download კოდი შეცვლილი არ არის. `measureExport`/`download.path()` diff-ში არ ჩანს. Browser-ში გაშვებული კოდი, listener-ები, timer-ები, render path, a11y და Tailwind არ შეცვლილა. ამიტომ ამ კატეგორიებში რეგრესიის რისკი არ არის. Import-ების გრაფი აციკლურია: `page.ts → report.ts → {budgets, determinism, stats}`. `report.ts` Playwright-ს არ იმპორტებს, ამიტომ node-ის vitest-ში ეშვება. `tsconfig.json`-ის `include: ["**/*.ts"]` `perf/`-საც მოიცავს, ასე რომ ახალი ფაილები `npm run typecheck`-ით მოწმდება.

### Critical Issues
- არ არის.

### Suggestions (რიგით)

1. **Medium (gate coverage). `perf/lib/report.test.ts` gate-ში არ ეშვება.** `vitest.config.ts:9`-ში მხოლოდ `app/**/*.test.{ts,tsx}` წერია, ამიტომ 16 DC-* ტესტი და mutant-ებით მიღებული red-proof მხოლოდ scratch config-ით ეშვება. Doc 176 ამას გულწრფელად აღწერს, მაგრამ სანამ include არ დაემატება, contract-ის რეგრესიას CI ვერ დაიჭერს.
   **Fix (root-ის grant):** `include`-ში დაამატე `'perf/**/*.test.ts'`. ფაილს `// @vitest-environment node` უკვე აქვს.

2. **Low (fail-open კიდე). `perf/lib/report.ts:769-774` (`tenths`).** როცა რომელიმე sample `NaN`-ია, `Math.max`/`Math.min` აბრუნებს `NaN`-ს, `spread > 1` ხდება `false` და სტრიქონი ჩუმად გადის. `exact`-ში `NaN === NaN` false-ია და შემოწმება ვარდება, ამიტომ ქცევა ასიმეტრიულია. იგივე ხდება `detailNumbers`-ში (`report.ts:749-757`): `typeof NaN === 'number'`.
   **Fix:** determinism-ის შემოწმების დასაწყისში დაამატე `if (!values.every(Number.isFinite)) return \`non-finite sample ${row.id}: [...]\``, ხოლო `detailNumbers`-ში `typeof`-ის ნაცვლად გამოიყენე `Number.isFinite(value)`. საჭიროა ერთი DC ტესტიც.

3. **Low (invariant). `report.ts:776-789` (`ratio`).** `sample.value` საერთოდ არ მოწმდება, მხოლოდ detail-ის წყვილი. თუ spec-ში value და detail სხვადასხვა წყაროდან დაითვლება (მაგ. `studio-lab.perf.spec.ts:346-349` ან interactions `:349-367`), contract ამას ვერ დაინახავს.
   **Fix:** როცა წყვილი ემთხვევა, დამატებით მოითხოვე `allEqual(values)`. ეს უფასო invariant-ია, რადგან ტოლი num/den ტოლ value-ს ნიშნავს.

4. **Low (real-browser watch). 1×/6× ზუსტი შედარება `move-components-per-move`-ზე** (`report.ts:822`, `crossRateMetrics`). 6×-ზე Chromium-ს შეუძლია `pointermove` rAF-თან გაასწოროს და coalesce გაუკეთოს. ძველი ±2 ტოლერანსი ამას შთანთქავდა. ახლა ერთი move-ის სხვაობაც კი (`movesInWindow` 120 → 119) run-ს ჩააგდებს.
   - მტკიცებულება, რომ ახლა სტაბილურია: EQUIV-224-ის ერთი run და B-ის 13 report-ის replay.
   - ამიტომ ეს block არ არის.
   - **Fix/შემდეგი ნაბიჯი:** PERF-2-მდე exact contract-ით 2–3 სრული run დაგროვდეს. ჩავარდნისას failure-ის ტექსტში უნდა გამოჩნდეს `movesInWindow`, რათა coalescing app-ის რეგრესიისგან განსხვავდეს.

5. **Nit. `studio-lab-interactions.perf.spec.ts:395-400`.** `Number(attr || Number.NaN)` სწორია და `"0"`-ს სწორად კითხულობს. Early return-ის შემდეგ zoom-ის სტრიქონები დაუზომავი რჩება, ამიტომ problem-ს „row not measured“ failure-ებიც მოჰყვება. ეს fail-closed ქცევაა და მისაღებია. `min`/`max` `t0`-მდე იკითხება, ამიტომ key-ის ფანჯარაში round-trip არ ხვდება.

### Good Practices Found
- **Fail-closed contract:** უცნობ unit-ზე ვარდება 0 ან 1 sample-ის დროსაც (`report.ts:762-764`, DC-UNKNOWN).
- **ერთი წყარო:** spec-ების სამი metric-სიმრავლე და `determinismRequiresKind` წაიშალა. 1a-ში ძველი `determinismRequiresKind: false` სემანტიკა არ დაკარგულა: grep-ით შევამოწმე, რომ `budgets.json`-ის 108 `moves-dispatched`/`components-per-commit`/`restarts`/`move-components-*` სტრიქონი ყველა `deterministic`-ია.
- **DC-DENOM** მეორე assertion-ით ფარავს მხოლოდ-მნიშვნელის mutant-ს (MU-2). Mutant-ები სახელობით არის დოკუმენტირებული.
- **GATE214-S4:** სიმეტრიული გზისა და მკაცრი `min < v < max` შემოწმება clamp-ილ გზას ხურავს. Problem-ის ტექსტი ასახელებს, რომელი წესი ჩავარდა.
- `load.longtasks-over-50` და `res.export.1.longtasks-over-50` `wallclock`-ზე replay-ის მტკიცებულებით გადავიდა (`[1, 1, 2]`…). `note`-ში მიზეზი წერია.
- `rateRowId` re-export-ის გამო spec-ების import-ები არ შეცვლილა. Playwright-free ბირთვი node-ში ტესტირებადია.
- Type assertion, `any` და suppression არ არის. `switch` exhaustive-ია discriminated union-ზე.

### Architecture note
- **სიგნალი 2 (მფლობელობა): `perf/lib/report.ts:49-53` + `perf/lib/page.ts:87`.** Row-id-ის helper-ები (`rowRate`, `rateRowId`) report-ის ბირთვში გადავიდა, ხოლო `page.ts` მათ ხელახლა აექსპორტებს. ახლა ერთ helper-ს ორი import გზა აქვს.
  → **keep:** ცვლილება იაფია და ციკლს არ ქმნის. Re-export spec-ების import-ებს byte-stable ტოვებს.
  → **proposal (B-სთვის, არასავალდებულო):** b-ii-ში ერთი შეზღუდული დავალება: spec-ებმა `rateRowId` პირდაპირ `./lib/report`-იდან (ან ცალკე `ids.ts`-იდან) შემოიტანონ და `page.ts`-ის re-export წაიშალოს. მიღების კრიტერიუმი: `grep "rateRowId" perf/` აჩვენებს ერთ წყაროს, typecheck და DC-RATE მწვანეა.
- **სიგნალი 3 (განმეორებითი ცვლილება): docs 163/168/169/175-ის determinism-ის სექციები** round 214, 223 და 224-ში თავიდან იწერება.
  → **keep, რადგან** ახლა ნორმატიული წყარო ერთია (doc 176) და დანარჩენი doc-ები მასზე მიუთითებს. დამატებით არაფერი სჭირდება.
- ეს diff-ის review-ა და არა perf/ მოდულის სრული აუდიტი.

### Alternative Approach
- **Current:** Contract კოდშია (`determinismContract(row)` metric/unit-ის მიხედვით), budget JSON უცვლელია.
- **Alternative:** Per-row `toleranceAbs`/`ratioOf` ველები JSON-ში (performance-optimizer-ის ვარიანტი).
- **Verdict:** მიმდინარე მიდგომა უკეთესია:
  - budget-ის ფაილები და report-ის key-ების რიგი byte-stable რჩება;
  - ახალი unit ავტომატურად fail-closed ხდება და JSON-ში ჩუმად დაშვებული ტოლერანსი ვერ გაჩნდება;
  - contract ერთ ფაილშია და unit ტესტით მოწმდება.

  ფასი ის არის, რომ ახალ ratio metric-ს `ratioPairsByMetric`-ში კოდის ცვლილება სჭირდება. ეს მისაღებია, რადგან ასეთი ცვლილება ისედაც review-ს გადის.

### Score: 9/10
Pre-commit-ის block არ არის. Commit-ს მხოლოდ suggestion 1 (gate coverage, root-ის grant) და suggestions 2–3 (მცირე fail-open კიდეები) აკლია ქულის სისრულემდე.