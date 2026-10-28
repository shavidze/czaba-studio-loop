# B — Round 39-ის დახურვა და round 40-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. Round 39-ის შედეგი
- **C: PASS** (`c-round-39.md` / `.json`): R39-1…R39-5, realVerified=**true**, ბაგი არ არის.
  - **R39-1:** `src/` byte-identical `96f1e45`-თან.
  - **R39-2:** red (HEAD helper) — 1 failed ((q4)) / 309 of 310; green 310/310 ×2.
  - **R39-3:** B-ის mutant-ები HM-1…HM-5, PM-6, CM-3, CM-8 და C-ის C-1…C-8 — ყველა მოკლულია.
  - **R39-4:** gate 310/93/7, `--retries=0` 7/7, Biome 0/8, real app smoke.
- **Root gate:** published `24e9723557fb82d572a655136ff7a0849a8e61f3` (`gates/gate-round-39.json`). Review: **COMMIT OK** — 0 critical/high/medium, 2 low, 1 არქიტექტურის შენიშვნა. ეს არის round 40-ის baseline.
- **სტატუსები:**
  - TM-B41 → **done**;
  - დახურული finding-ები: C-R36-01, RR-R36-02, RR-R36-03, R36-A-02, RR-R36-04, C-R37-01, B-R37-02, C-R38-01, RR-R38-03.
- **Archive:** `tasks/round-39.md` ახალი ასლია (`cp -n`, `cmp` იდენტური). ძველი archive არ არსებობდა.

## 2. ახალი finding-ები
| ID | Severity | რა | სად მიდის |
|---|---|---|---|
| RR-R39-01 | low | (f9) store-ს პირდაპირ ცვლის | **closed**: `resetAllStores` აღადგენს; C-მ ცალკეც და სრულ suite-შიც გაუშვა |
| RR-R39-02 | low | (x8) store-ის ტესტია component suite-ში | record (მომავალი test round-ის ride-along) |
| RR-R39-03 | info | `queryButtonByText` | signal (task არ არის) |
| A-R39-01 | low | (f9) `toHaveTextContent("Done")` substring-ით ამოწმებს | record |
| A-R39-02 | info | §6 trim-ს მხოლოდ string-ზე ახსენებს | record |
| B-R39-01 | info | hover cue ძველია (§3) | TM-B42 |
| B-R39-02 | info | fieldset-ის ისრებს Applying-ის დროს cursor `default` აქვს (ძველიც ასე იყო) | record |

## 3. TM-B42-ის გაზომვა (B, real app)
**როგორ გავზომე:**
- სამი build: `ea4a1cb` (native `disabled`), `24e9723` (`aria-disabled`) და prototype. ყველა `/tmp/b40`-შია, `git archive`-ით; repository-ს არ შევხებივარ.
- `b-round-39-exp/hover-probe.mjs`: Playwright `_electron`, `xvfb-run`, C-ის round-38 harness. mouse hover → `getComputedStyle`.

**შედეგი** (`hover-summary.txt`):
- `(hover: hover)` xvfb-ში true-ა.
- **ძველი == ახალი ყველა ნაბიჯზე:**
  - disabled Save და Done hover-ზე `rgb(18,217,200)` → `rgb(29,237,219)`;
  - ისარი და X ფერს იცვლის;
  - Add Field და Rescan bg-ს იცვლის.
- ე.ი. RR-R38-01-ის „ახალი cue“ D-45-ის regression არ არის. A-ს code-reviewer მართალი იყო.

**რატომ ვაგრძელებ TM-B42-ს:**
- cue reference-ს ეწინააღმდეგება:
  - Bootstrap: disabled ღილაკზე hover არ ჩნდება;
  - Tailwind-ის `enabled:hover:` pattern;
  - app-ის საკუთარი AudioPlayer.
- reference-ისგან განსხვავება, რომელსაც მიზეზი არ აქვს, project-ის წესით ბაგია. ამიტომ TM-B42 ძველი cue-ს fix-ად გრძელდება (D-46).
- Scope არ შემცირებულა: RR-R38-01/04 + იგივე მიზეზის მქონე Rescan და Add Field.

**Prototype** (`prototype.diff`, 42 ±ხაზი):
- `Button` variant-ები `enabled:not-aria-disabled:hover:`;
- SchemaEditor-ის 4 fieldset ღილაკი `enabled:hover:`;
- docs: style-guide, component-specs, 001-ის ორი `button.tsx:35→36` ref.

**Prototype-ის შემოწმება:**
- ყველა disabled ნაბიჯზე rest == hover; enabled control-ები ისევ იცვლება;
- renderer 310/310, tsc 0, Biome 0/8;
- CSS სწორია (`:enabled:not([aria-disabled="true"]):hover`);
- dry-run `patch -p1` სუფთა ასლზე == prototype.

შენიშვნა: `hover-summary.txt` prototype-ის `biome format`-მდე build-იდანაა; `hover-proto.json` formatted build-იდანაა, მნიშვნელობები იდენტურია.

**ტესტი:** test-on-bugfix-ის გამონაკლისია (styling-only). jsdom `:hover`-ს ვერ ითვლის. მტკიცებულება C-ის real-app გაზომვაა (R40-3).

## 4. Saba-ს კითხვები (ღიაა, ჩემი გადაწყვეტილება არ არის)
- **RR-R35-02:** როცა `onSave` არასოდეს სრულდება, `Applying...` / `Saving...` სამუდამოდ რჩება. გინდა timeout (მაგ. 30 s), რომელიც busy მდგომარეობას მოხსნის და toast-ს აჩვენებს?
- **ძალაში რჩება:**
  - `b-round-23.md` §5;
  - B-R36-01: სიის ჩაკეტვა scan-ის დროს;
  - TM-T2-DATA: UCS სია და ლიცენზია.
- **TM-B42-ის შემდეგ Saba-ს გადაწყვეტილება სჭირდება:**
  - TM-B08: არტისტები ISTR-შია თუ IART-ში — K-4 კონტრაქტის ნაწილია? (D-12)
  - TM-B11: Number ველის default `0`-ის ჩაწერის წესი (D-10).
  - TM-B05: ცარიელი data chunk — error message თუ upstream issue?
  - TM-B06: Biome-მა `tests/`-იც შეამოწმოს?
  - TM-T1-DUP: ძველი custom field-ისა და category-ის შეჯახება.

## 5. დარჩენილი სამუშაო
- **TM-B42:** round 40.
- **TM-T1-MIG:** შეიძლება Saba-ს გარეშე დაიგეგმოს. D-07-ის default-ით acceptance არის C-ის real-UI შემოწმება და doc note. round 41-ში ვამოწმებ, უკვე ასე მუშაობს თუ არა.
- **root-ის Actions link-ს ელოდება:** TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14 — მწვანე `Check` run `7879ee0`-ზე ან უფრო გვიან commit-ზე.
- **Saba:** TM-T2, TM-T2-DATA და §4-ის item-ები.

## 6. Checkpoint
- [x] `tasks/round-39.md` (archive)
- [x] `backlog.json`:
  - TM-B41 done + evidence; 9 finding closed;
  - RR-R39-01…03, A-R39-01/02, B-R39-01/02 დამატებულია;
  - TM-B42 in_progress (round 40, D-46, Reference R1–R4);
  - D-46 დამატებულია;
  - round 39 published, round 40 planned.
- [x] `feature-status.md`
- [x] `b-round-39-exp/`: `hover-probe.mjs`, `hover-{old,new,proto}.json/.log`, `hover-summary.txt`, screenshot-ები, `prototype.diff`, draft-ები, `proto-renderer.log`
- [x] `current-task.md` (round 40)
- [x] `b-next.json`
