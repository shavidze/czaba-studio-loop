# C — Round 42 verification: TM-T1-DUP / RR-R3-01 (D-47)

Verifier: C · 2026-10-28 · HEAD `a5c6a6b` (working tree = A-ს ცვლილებები, commit არ არის) · **taskStatus: PASS**, realVerified=true, bugs `[]`.

ყველა ლოგი და screenshot: `c-round-42/`. Probe: `c-round-42/r42-probe.mjs` (Playwright `_electron`, `xvfb-run`, `XDG_CONFIG_HOME` temp, planted `Electron/schema.json`; userData დადასტურდა: `<tmp>/xdg/Electron`).

## R42-1 ownership — PASS
- `git diff --name-only a5c6a6b` = 6 owned ფაილი (`SchemaEditor.tsx`, `schema-editor.test.ts`, 4 docs); `git status --porcelain --untracked-files=all` — untracked არ არის; helper ფაილი არ შექმნილა (inline ვარიანტი).
- `git diff --quiet a5c6a6b --` სუფთაა: `src/main`, `src/preload`, `src/shared/types.ts`, `stores`, `lib`, `metadata-editor`, `styles/app.css`, `tests/main`, `tests/e2e`, `playwright.config.ts`, `vitest.config.*`, `biome.json`, `.github`, `package*.json`, `.claude` (`r42-1-frozen.txt`).
- `src/` diff-ში დამატებული კომენტარი არ არის (`^\+.*(//|/\*)` grep ცარიელი).

## R42-2 tests + code — PASS
- diff წავიკითხე: conflict rule (`standard !== true`; key, შემდეგ `riffChunkId` მხოლოდ თუ standard-ს აქვს; ორივე დამთხვევისას `key`; schema-ს რიგით პირველი), warning ტექსტი spec-ს ზუსტად ემთხვევა, warning-ები `STANDARD_FIELDS` რიგით chips-ის შემდეგ, section = chips || warnings, chips wrapper მხოლოდ chips-ით, guard enable branch-ში (`:101`), disable branch უცვლელი. ყველაფერი `<fieldset disabled={isApplying}>`-ის შიგნითაა (real app-ში `inFieldset: true`).
- T-a…T-d ზუსტი სტრიქონებით არსებობს; + A-ს დამატებითი T-e/T-f/T-g. 4 ძველი ტესტი diff-ში უცვლელია (`-` ხაზი არ არის). renderer 317/317.

## R42-3 red proof — PASS
- `git archive a5c6a6b` → `/tmp/c42-base` + A-ს ტესტ-ფაილი: **7 failed / 4 passed (11)** (`r42-3-red-baseline.log`).
- T-a/T-b/T-c/T-d ვარდება `expected <button …+ Category (UCS)/+ Publisher> to be null`-ზე; T-c — pre-state assert-ზე (ხაზი 148). 4 ძველი green. A-ს tree-ზე 11/11 green (gate).

## R42-4 real app, collision — PASS
| | (a) custom `category`/`CATE` | (b) custom `ucs_cat`/`ICAT` |
|---|---|---|
| `+ Category (UCS)` chip | არ არის (chips `[]`) | არ არის |
| warning (ზუსტი ტექსტი) | `Category (UCS) is unavailable: custom field "Category" already uses key "category".` | `Category (UCS) is unavailable: custom field "UCS Cat" already uses RIFF ID "ICAT".` |
| class / computed color | `text-[10px] text-warning` / `rgb(245, 158, 11)` | იგივე |
| Hidden Standard Fields title | ჩანს | ჩანს |
| pageErrors / duplicate-key error | `[]` / არა | `[]` / არა |
| Save `DOORWood` — raw INFO | `CATE=DOORWood` (8), **ICAT არ არის** | **ერთი** `ICAT=DOORWood` (8) |
| music-metadata native | `CATE=DOORWood`, ICAT არ არის | `ICAT=DOORWood` |
| ffprobe format_tags | `CATE: DOORWood`, ICAT არ არის | `ICAT: DOORWood` |
- Screenshots: `r42-4a-editor.png`, `r42-4a-saved.png`, `r42-4b-editor.png`, `r42-4b-saved.png`.
- (a) custom ველის წაშლა (Trash2) editor-ში → chips `["+ Category (UCS)"]`, warning-ები `[]` (`r42-4a-after-delete.png`).
- ffprobe და music-metadata ორივე აჩვენებს უცნობ 4cc `CATE`-ს (supporting evidence).
- ორივე შემთხვევაში იწერება ცარიელი `IKEY` (size 0) — ეს ცნობილი B-R42-02 / TM-B11 / Q4-ია, ამ რაუნდს არ ეხება.

## R42-5 regression (D-07 / TM-T1-MIG) — PASS
- 12 pre-T-1 standard ველი: chips `["+ Category (UCS)"]`, warning არ არის (`r42-5-editor-before.png`).
- Title Hide (X) → `+ Title` ჩნდება; `+ Title` → Title ბრუნდება (სხვა hidden field toggle მუშაობს).
- `+ Category (UCS)` → Done → `schema.json` = 13 key (`category` ბოლოს, ICAT). section ქრება (chips/warnings არ არის) (`r42-5-editor-enabled.png`).
- relaunch → panel-ში `Category (UCS)` label ჩანს; Save `DOORWood` → ffprobe `ICAT=DOORWood`, music-metadata და raw INFO იგივე (`r42-5-relaunch-saved.png`). pageErrors ორივე launch-ზე `[]`.

## R42-6 observation (Q18 / B-R42-01 input, no pass/fail)
Schema = 12 standard + standard `category`/ICAT + custom `category`/CATE:
- Panel: ორი ველი `Category (UCS)` და `Category`. ერთში ჩაწერა ორივე input-ს ავსებს (`["DOORWood","DOORWood"]`), რადგან ორივე key `category`-ზეა.
- Save → **სამივე reader-ში** იწერება `ICAT=DOORWood` **და** `CATE=DOORWood` (ერთი მნიშვნელობა ორ chunk-ში).
- Active Fields: ორივე row (`Category (UCS) ICAT`, `Category CATE`); warning არ არის (spec-ის მიხედვით, Deviation 3).
- console duplicate-key error: built (production) React-ში არ ჩანს; pageErrors `[]`.
- **Hide (X) standard Category-ზე ორივე ველს შლის** (`removeField(key)`) — `schema.json` Done-ის შემდეგ 12 standard key-ს შეიცავს, custom `category`/`CATE`-იც დაიკარგა. ეს Q18-ისთვის მნიშვნელოვანია (custom ველის მოულოდნელი წაშლა). Screenshots: `r42-6-panel.png`, `r42-6-editor.png`, `r42-6-after-hide.png`.

## R42-7 gate + docs — PASS
- `verifyCommand` (C-მ თავად გაუშვა): **EXIT=0** (`gate.log`). Biome: 0 error, 8 warning (A-ს ბაზისის მონაცემით უცვლელი). typecheck OK. renderer **317/317** (21 files; +7 ახალი ტესტი, ძველი 310). main **93/93**. E2E 7/7.
- `xvfb-run -a npx playwright test --retries=0`: 7 passed, EXIT=0 (`e2e-retries0.log`).
- Docs:
  - 001: `## N.` = 23, `**სტატუსი:** გასწორდა` = 14. README-ში იგივე რიცხვებია (23/14, 9-დან 5 Saba — 5 `Saba-ს კითხვა` სტატუსი დავთვალე).
  - D-47 არის ჩამონათვალში. entry 23-ის `**…**` ველები entry 22-ის ველებს ემთხვევა. ტექსტი ქართულია.
  - recording-tag-contract: „ღია საკითხია (TM-T1-DUP)“ აღარ არის. D-47-ის ქცევა და B-R42-01-ის ხაზი დამატებულია.
  - component-specs: `text-[10px] text-warning` = კოდის class string, ინგლისურად.
  - შემოწმებული ხაზების ref-ები: `:31-43`, `:101`, `:282-286`.

## Reference check (B-სთვის, არა A-ს ბაგი)
- Primary reference (Saba Q2) სრულდება.
- R1 Mp3tag: WebFetch-მა cited thread-ში (`…/59902`) ვერ იპოვა წინადადება, რომ standard frame-ის სახელის მქონე custom ველი ყოველთვის standard frame-ში ინახება. thread მხოლოდ ამბობს, რომ custom = TXXX. `docs.mp3tag.de/mapping` ამბობს, რომ mapping-ის შეცვლა შესაძლებელია, და same-name შემთხვევას არ ეხება.
- B-მ ეს თავადვე მონიშნა „community დაკვირვება, არა ოფიციალური docs“-ად. ამიტომ ეს ჩანაწერია და არა FAIL: B-მ R1-ის ფორმულირება 001 entry 23-ში ხელახლა უნდა შეამოწმოს, ან „დაუდასტურებელი“ დაწეროს.

## BLOCKED
- `build:win` / `build:mac`: Windows packaging is not available in the cloud (FAIL არ არის).
