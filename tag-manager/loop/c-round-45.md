# C — round 45 ვერიფიკაცია: TM-B11 stage 1 (D-49)

**taskStatus: PASS** · realVerified: **true** · bugs: 0 · BLOCKED: `build:win`/`build:mac` („Windows packaging is not available in the cloud“, FAIL არ არის).

C-მ source-ს არ შეხებია. evidence: `c-round-45/`.

## R45-1 ownership — PASS
- HEAD `d886bef086628cd2b6a8efed3a7a98eeb8454480`. შეცვლილია ზუსტად ოთხი owned ფაილი, untracked-ია მხოლოდ `tests/main/metadata-empty-values.test.ts`.
- frozen და protected path-ების `git diff --quiet d886bef -- …` → exit 0. სიაში იყო: `src/shared/types.ts`, `schema.ts`, `file-system.ts`, `channels.ts`, `src/renderer`, `src/preload`, ხუთი frozen main test-ფაილი, `tests/contract`, `tests/e2e`, `tests/renderer`, `create-fixtures.ts`, `package*.json`, `release.yml`, `app.css`, `.claude/settings*` და `.claude/hooks`.
- `recording-tag-contract.test.ts`-ის diff მხოლოდ T1-10a/b-ს ეხება (სათაურები და `has(..) === false`), 5+/5-.
- log: `r45-1.log`.

## R45-2 red/green და mutants — PASS
- **Red.** temp copy `/tmp/c45-red`, `node_modules` symlink-ით, d886bef-ის `metadata.ts`-ით (diff = 0) და A-ს ტესტებით. შედეგი **10 failed / 10 passed**.
  - ჩავარდა: T1-10a, T1-10b, e1, e2, e3, e4, e5, e7, e10, e11.
  - გაიარა: e6, e8, e9.
  - log: `r45-2-red.log`.
- **Green.** A-ს `metadata.ts`-ზე ოთხი ფაილი გავუშვი: empty-values, contract, write-guard და field-errors. შედეგი **31/31** (`r45-2-green.log`).
- **Mutants:**
  - **M1** (trim ამოღებულია) → ჩავარდა e2, e4, e10. **მოკლულია.**
  - **M2** (`removeValue` → `setValuesFromStrings(id, [''])`) → ჩავარდა T1-10a/b, e1, e2, e3, e4, e5, e7, e11. **მოკლულია.**
  - **M3** (workaround ყოველთვის ეშვება) → **31/31, ცოცხალი გადარჩა.**
    - რეალურ WAV-ზე `infoTags.length === 0` branch არ მიიღწევა. ეს A-ს F1-ია, და e9 მას ირიბად ადასტურებს: bare WAV-ზე `removeValue('AB')` ისვრის.
    - C-მ წაიკითხა `metadata-write-guard.test.ts`. ამ branch-მდე ის მხოლოდ mock-ით აღწევს: `overrideNextTagWithNonRiffTag()`-ში `createFromPath` spy-ია და tag `Id3v2Tag`-ით არის ჩანაცვლებული.
    - ამიტომ M3 სრულად ეკვივალენტური არ არის. A1.4-ის მეორე წინადადება („ყველა `riffChunkId` მნიშვნელობა ცარიელია და InfoTag არ არის → არაფერი, შეცდომის გარეშე“) mock-ით მიღწევადია, მაგრამ არცერთ ტესტში დაფიქსირებული არ არის. ქვემოთ O1-ია.
  - logs: `r45-2-m1.log`, `r45-2-m2.log`, `r45-2-m3.log`.

## R45-3 gate — PASS
- `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **EXIT=0**.
  - Biome: 34 ფაილი, 0 error, **8 warning**.
  - tsc (node, web, test) გაიარა.
  - Renderer **320/320**, Main **109/109** (98 + 11), E2E **7/7**.
  - log: `verify.log`.
- `xvfb-run -a npx playwright test --retries=0` → **7/7** (`e2e-retries0.log`).

## Real app
Build: `out/` A-ს ხიდან, `npm run test:e2e`-ის build-ით (`removeValue` bundle-შია). გაშვება: Playwright `_electron`, `xvfb-run`, სუფთა `XDG_CONFIG_HOME`, viewport 1400×900.

WAV-ები ffmpeg-ით შეიქმნა (sine, 1 s, 48 kHz, s16). სამი reader გამოვიყენე:
- raw `LIST/INFO` parse, ყველა sub-chunk-ის size-ით;
- `ffprobe -show_entries format_tags -of json`;
- `music-metadata` `native.exif`.

Probe: `c-round-45/r45-probe.mjs`. შედეგები: `r45-results-a.json`, `r45-summary-a.txt`. `pageErrors` და `consoleErrors` ცარიელია.

### R45-4 ერთი მნიშვნელობის გასუფთავება — PASS
- **Seed აპით.** r4.wav-ზე UI-ში Category `DOORWood`, Keywords `door, slam`, Comment `მძიმე კარი` → `Tags saved`.
  - raw: ISFT, ICMT, IKEY, ICAT.
  - ffprobe: `IKEY: door, slam`, `ICAT: DOORWood`, `comment: მძიმე კარი`.
  - screenshot: `r45-4-a-before-clear.png`.
- **Keywords გავასუფთავე → Save Tags → `Tags saved`.** სამივე reader-ში **IKEY key არ არის**:
  - raw: `ISFT`, `ICMT=მძიმე კარი`, `ICAT=DOORWood`, size-0 sub-chunk არ არის;
  - ffprobe: `{encoder, comment: მძიმე კარი, ICAT: DOORWood}`;
  - music-metadata exif: `{ISFT, ICMT, ICAT: DOORWood}`.
- music-metadata `exif.ICMT` mojibake-ია (C-R6-02), მაგრამ clear-მდე და clear-ის შემდეგ **ბაიტ-იდენტურია** (`r45-results-a.json`: `r4seed.readers` vs `r4.readers`). raw და ffprobe ICMT-ს ზუსტად აჩვენებს: `მძიმე კარი`. ამიტომ ICMT სამივე reader-ში უცვლელია.
- სხვა ფაილზე გადასვლის და r4-ზე დაბრუნების შემდეგ editor-ში ჩანს Keywords `""`, Category `DOORWood`, Comment `მძიმე კარი`. screenshot: `r45-4-a-after-clear.png`.
- **Contrast (d886bef build, `/tmp/c45-red`):** იგივე ნაბიჯების შემდეგ raw-ში `IKEY:0` sub-chunk რჩება და ffprobe აჩვენებს `IKEY: ""` (`r45-summary-base.txt`).

### R45-5 ხელუხლებელი ცარიელი ველები — PASS
- **ახალი ffmpeg WAV (r5), მხოლოდ Title `R45` → `Tags saved`.**
  - raw: მხოლოდ `ISFT`, `INAM=R45`, size-0 sub-chunk არ არის.
  - ffprobe: `title: R45`.
  - mm exif: `INAM: R45`.
  - IKEY/ICAT არცერთ reader-ში არ არის.
- **Customize Fields → custom Text ველი „Note“ დავამატე** (auto ID `NOTE`, `schema.json`-ში ჩაიწერა) → Done.
  - Note ველი editor-ში ჩანს და ცარიელია.
  - Title შევცვალე `R45b`-ად → Save → `Tags saved`.
  - raw: `ISFT`, `INAM=R45b`, size-0 sub-chunk არ არის.
  - ffprobe: `title: R45b`. mm: `INAM: R45b`.
  - IKEY, ICAT და NOTE არცერთ reader-ში არ არის.
  - screenshots: `r45-5-a-after-first.png`, `r45-5-a-customize.png`, `r45-5-a-after-second.png`.
- **Contrast (d886bef):** პირველი save-ის შემდეგ raw-ში იყო `IKEY:0 ICAT:0`, ffprobe-ში `IKEY: ""` და `ICAT: ""`.

### R45-6 batch-ში გასუფთავება — PASS
- **Seed:** b1, b2, b3, u1 და u2 IPC-ით (`window.api.writeMetadata`) folder-ის გახსნამდე. ყველას აქვს `IKEY=door, slam`, ICAT განსხვავებულია: b1 `DOORWood`, b2 `DOORMetl`, b3 `GLASBrk`. სამივე reader-მა seed დაადასტურა.
- **Batch-ში გასუფთავება.** b1 + Ctrl b2 + Ctrl b3 მოვნიშნე. batch ფორმა ყველა ველს ცარიელად აჩვენებს („Multiple values“, D-21 / C-R19-01). ამიტომ acceptance-ის „clear Keywords“ ნაბიჯი დღევანდელ batch ფორმაზე პირდაპირ ვერ შესრულდება: ველი უკვე ცარიელია და `fill('')` ფორმას dirty-ს არ ხდის (C-ის პირველ probe-გაშვებაში `Save to 3 files` 30 s განმავლობაში `aria-disabled=true` დარჩა; იმ გაშვების შედეგი მეორე გაშვებამ გადაწერა). ეს C-ს არჩეული გადახრა არ არის. მომხმარებელი Keywords-ს ასე ასუფთავებს: ველში `x`-ს აკრეფს და Backspace-ით შლის. ამის შემდეგ ველი `""`-ია და `Save to 3 files` ჩართულია.
- Save → **`Tags saved to 3 files`**. სამივე reader-ში არცერთ ფაილს **IKEY არ აქვს** და თითოეულს საკუთარი ICAT დარჩა (`DOORWood`, `DOORMetl`, `GLASBrk`). size-0 sub-chunk არ არის.
- მოუნიშნავი u1, u2, r4 და r5-ის sha256 save-მდე და save-ის შემდეგ **იდენტურია**.
- screenshots: `r45-6-a-before.png`, `r45-6-a-after.png`.

## R45-7 docs — PASS
- **`docs/recording-tag-contract.md`:**
  - სექციის სათაური ახლა „ცარიელი მნიშვნელობა (D-10/D-49, გადაწყვეტილია)“-ა;
  - აღწერს წაშლას (whitespace-ს, tags item-ებს, ძველი ბაიტების წაშლას, batch-ის `modifiedFields`-ს);
  - number stage 2-ის შენიშვნა (`ITKN '0'`) არის;
  - importer-ის წესი უცვლელია („უცვლელი“);
  - „Saba-მ უნდა გადაწყვიტოს“ წაშლილია;
  - header-ში D-49 დაემატა, `## შემოწმება`-ში ახალი ტესტ-ფაილია.
- **`.claude/primitives/WAV_METADATA.md`:** ერთი ქართული წესი D-49-ზე (`removeValue`, `''`/`[]`).
- ორივე ქართულადაა, English ტექნიკური ტერმინებით.

## დაკვირვებები B-სთვის (ბაგი არ არის, FAIL-ს არ იწვევს)
- **O1 (low, test coverage):** M3 ცოცხალი გადარჩა. A1.4-ის „ყველა ცარიელია და InfoTag არ არის → შეცდომა არ არის“ ტესტით დაფიქსირებული არ არის.
  - რეალურ WAV-ზე ეს ქცევაზე არ მოქმედებს (F1).
  - `metadata-write-guard.test.ts`-ის `overrideNextTagWithNonRiffTag()` ტექნიკით შემოწმება შეიძლება: `{ keywords: '', category: '' }` → resolves, save 1. M3-ზე ეს ტესტი ჩავარდებოდა.
  - B-სთვის signal-ია, acceptance-ს არ ეხება (R45-2 მხოლოდ mutant-ის შედეგის ჩაწერას ითხოვს).
- **O2 (info, pre-existing C-R19-01 / D-21):** batch ფორმა საერთო მნიშვნელობას არ აჩვენებს. ამიტომ batch-ში ველის გასუფთავება მხოლოდ „აკრიფე და წაშალე“ ხერხით ხერხდება, ცარიელ ველზე `fill('')` ფორმას dirty-ს არ ხდის. ეს product/UX კითხვაა Saba-სთვის (Q9–Q17-ის რიგში), ამ რაუნდის scope-ში არ შედის.
- **O3 (info, C-R6-02):** music-metadata `exif` Georgian ICMT-ს mojibake-ად კითხულობს. raw ბაიტები, ffprobe და ID3 COMM სწორია. ცნობილი reader-ის თავისებურებაა.
- **O4 (low, A-ს code-reviewer (1)):** emptiness `field.type`-ით ისაზღვრება. text ველზე `[""]` ან tags ველზე `""` ისევ size-0-ს დაწერს. renderer ასეთ ფორმას არ აგზავნის, ამიტომ ეს `meta:write`-ის shape validation-ის signal-ია.
