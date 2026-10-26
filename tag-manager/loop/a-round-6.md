# A — Round 6 ანგარიში: TM-B10 (D-16) + RR-R2-01

STATUS: DONE (A-side). realVerified for the real-app checks (R6-4…R6-6) = false: C-მ უნდა გაუშვას.

## Baseline
HEAD `a8c1b53ed043560569dd528e2bc2e5190b63333a`, working tree clean at start.

## შეცვლილი ფაილები (მხოლოდ owned)
- `src/main/ipc/metadata.ts`
  - ახალი internal (არა-exported) `stripRiffNulTerminator(value: string): string`. ის აჭრის string-ის ბოლოში მდგარ NUL-ების run-ს (charCode 0). ქცევით `/\u0000+$/`-ის ექვივალენტია. Leading და interior NUL-ები რჩება.
  - **გადახრა task-ის ტექსტიდან:** regex `/\u0000+$/` Biome-მა უარყო (`lint/suspicious/noControlCharactersInRegex`, error). `biome-ignore` აკრძალულია, ამიტომ helper `while (end > 0 && value.charCodeAt(end - 1) === 0) end--; return value.slice(0, end);` loop-ით დავწერე. ამიტომ C-ის mutation-ები M2/M4 regex-ის ნაცვლად loop-ზე უნდა მოერგოს (იხ. ქვემოთ).
  - `STANDARD_PROP_MAP` getters: `title`, `album`, `comment`, `copyright`, `isrc`, `publisher` → `stripRiffNulTerminator(tag.X ?? '')`. `artists` (performers) და `genres` → `.map(stripRiffNulTerminator)`, `[]` default რჩება, ელემენტები არ იფილტრება.
  - `readTagsFromFile` INFO branch: `getValuesAsStrings(id).map(stripRiffNulTerminator)` tags/number/text განშტოებამდე. number → `Number(stripped) || 0`, text → `join(', ')` (როგორც იყო).
  - `getRiffInfoTags` → named export (იგივე სახელი). non-`CombinedTag`-ზე აბრუნებს `[]`-ს, `throw`-ის ნაცვლად. `CombinedTag` path უცვლელია.
  - write path, IPC handlers, error mapping, `year`/`track`/`bpm` უცვლელია. ახალი კომენტარი, `any`, `@ts-*`, `biome-ignore` არ დამიმატებია.
- `tests/main/riff-info-nul.test.ts` (ახალი) — 8 ტესტი, (a)–(h) task-ის მიხედვით. Inline WAV: sample.wav + LIST/INFO (odd-size pad) + RIFF size-ის გასწორება. schema = STANDARD_FIELDS + `take` (number, ITKN) + `mics` (tags, IMIC).

## რეალურად გაშვებული ტესტები
1. **Red** (`a-round-6/red-before-fix.log`): `/tmp/a-r6-red` (rsync + node_modules symlink), `a8c1b53:metadata.ts`, მხოლოდ export patch-ით (diff = 1 ხაზი). `npx vitest run --config vitest.config.main.ts tests/main/riff-info-nul.test.ts` → **8 failed / 8**.
   - (a) `'heavy door\u0000'`
   - (b) `'\u0000\u0000'`
   - (c) `['Foley\u0000']`
   - (d) `+0 to be 120`
   - (e) `['MKH416\u0000']`
   - (f) `ITKN payload is 120: false`
   - (g) interior ნაწილი: `'a\u0000b\u0000'` (plain ნაწილმა გაიარა)
   - (h) `TypeError: File tag is not a CombinedTag`
2. **Green** (`a-round-6/green-after-fix.log`): იგივე ფაილი რეალურ tree-ზე → **8/8 passed**.
3. **Gate** (`a-round-6/verify.log`): `rm -rf out test-results playwright-report tests/fixtures/*.wav`, შემდეგ `npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e -- --retries=0` → **exit 0**.
   - Biome: 34 ფაილი, 0 error, 9 warning, მათგან არცერთი `metadata.ts`-ში. `a8c1b53`-ის `metadata.ts` ცალკე: 0 diagnostic; ახალი: 0.
   - typecheck: 0 error.
   - Renderer: **107/107**.
   - Main: **50/50** (42 + 8 ახალი).
   - Build: OK.
   - E2E: **7/7**, `--retries=0`.
4. **Mutations** (`a-round-6/mutations.log`, /tmp copy-ში, დაყრდნობილია fixed `metadata.ts`-ზე):
   - M1 (identity helper): (a)–(g) fail, (h) pass.
   - M2 (მხოლოდ ერთი ბოლო NUL, `while`→`if`): მხოლოდ (b) fail.
   - M3 (`throw` აღდგენილია): მხოლოდ (h) fail.
   - M4 (ყველა NUL, `split(\0).join('')`): მხოლოდ (g) fail.

## მიგნებები / ცნობილი ხარვეზები
- **ISFT:** fixed tree-ზე (f) ადასტურებს, რომ `ISFT` save-ის შემდეგაც არსებობს და payload byte-identical-ია (`"Recorder 1.0\0"`, 13 byte). `a8c1b53`-ზე (f) უფრო ადრე, ITKN assertion-ზე ჩავარდა, ამიტომ ISFT იქ პირდაპირ არ შემიმოწმებია. write path უცვლელია, ამიტომ ვვარაუდობ (inference), რომ იქაც რჩება.
- ISFT-ის payload-ში ორიგინალური NUL რჩება. ის non-schema ველია და მას ჩვენ არ ვწერთ, ეს სწორი ქცევაა.
- Real app-ის შემოწმება (R6-4/5/6) A-ს არ გაუშვია. ეს C-ის ამოცანაა.
- code-reviewer subagent არ გამომიძახებია: შეიცვალა 2 ფაილი, ზღვარი 3+ ფაილია.
- `qa-engineer` (`read-primitives.md`-ის მოთხოვნა: "After bug fixes") **შეგნებულად არ გამიშვია**. loop policy-ით regression check C-ს ეკუთვნის ("whoever writes does not verify"). გარდა ამისა, `qa-trigger` ითხოვს `docs/bugs/` ანგარიშს, `docs/**` კი ამ round-ში frozen-ია.
- **ISFT `a8c1b53`-ზე: NOT OBSERVED.** red run-ში (f) ITKN assertion-ზე ჩავარდა, ISFT check-მდე არ მისულა. ეს კითხვა მხოლოდ C-ის R6-5 before/after (`a8c1b53` build) შემოწმებით გადაწყდება.

## C-ს შემდეგი შემოწმებები
- R6-1: red/green ზუსტად ზემოთ მოცემული ბრძანებებით.
- R6-2: M2 = `while (...)` → `if (...)` helper-ში. M4 = `return value.split(String.fromCharCode(0)).join('');`. M1 = `return value;`. M3 = `return [];` → `throw new TypeError(...)`.
- R6-3: gate სუფთა state-იდან.
- R6-4…R6-6: real app, task-ის მიხედვით, მათ შორის `a8c1b53` build-ის "Before" (Take 0).
- R6-7: `git diff --quiet a8c1b53 -- . ':!src/main/ipc/metadata.ts' ':!tests/main/riff-info-nul.test.ts'`.

## Acceptance, რომელიც A-მ რეალურად გაიარა
- R6-1: A-side red/green გაირბინა და log-ები შენახულია.
- R6-2: A-ს self-mutation (adapted) — ოთხივე killed.
- R6-3: A-ს ერთი სრული gate run — exit 0 (C-მ დამოუკიდებლად უნდა გაიმეოროს).
- R6-7: `git status` აჩვენებს მხოლოდ 2 owned path-ს.
- R6-4, R6-5, R6-6: **არ** გამიშვია (realVerified=false).
