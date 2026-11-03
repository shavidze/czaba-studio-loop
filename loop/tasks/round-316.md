# Round 316: PERF-7. Self-hosted fonts: no Google Fonts request and no render-blocking third-party request on any route; every face byte-identical to today

**Planned by:** B, at the round 315 → 316 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v275 → `decisions_log_b`):
- **D-29z850: round 315 ruled.** C PASS: 10 rows, `browserVerified`/`realVerified` true, 0 app defects, 2 Low test-coverage findings (C-R315-T1/T2). Gate 315 published `c136dfd` on both remotes [K1]. **PERF-5 is done** (5a + 5b). A-R312-REVIEW-L1…L5 are closed.
- **D-29z851: PERF-7's target is split on evidence** (§0.1). PERF-7 owns "0 render-blocking third-party requests" on every route and "FCP − DCL < 150 ms" on `/` and `/store`. On `/studio-lab`, first paint waits for hydration because of the SSR `opacity:0` page transition [K17]. Fonts cannot move it, so that part of the target goes to **PERF-11**, which already owns "no framer-motion page transition on `/studio*`".
- **D-29z852: round 316 = PERF-7.** All 25 woff2 files that Google serves today are mirrored byte-identical into `app/assets/fonts/`, with the same 83 `@font-face` rules and the families' OFL licences. Grants are narrow:
  - `root.tsx`: one import and one links entry replace 2 preconnects and the Playfair link (precedent: D-29z166);
  - `app.css`: deletion of l.1 only.

  Local files are used, not `@fontsource/*`: no dependency or `root-deps-request.json` is needed.
- **D-29z853:** consults: performance-optimizer and tech-lead (§0.4).
- **D-29z854:** bookkeeping and signals (§10). The round-315 Lows and the gate-315 review items go to `deferred_low_polish`, with PERF-14 (the next owner of `peaks.client.ts`) as the fix home. `lessons.md` is unchanged.

**Read first:** `lessons.md`. These apply directly:
- L3 / L20: a font change gets box and glyph rows. Here the bytes are identical, so the rows are exact equalities (§3.2 FONT-PIXEL, FONT-GLYPHS).
- L23: B applied the change on a scratch copy and ran the covering files (§2).
- L29 / L56: claims and artifacts.
- L30: Biome includes only `app/**/*.ts(x)` [K11], so `fonts.css` is checked by FN2, not by Biome.
- L35: notices are granted (§5).
- L38: perf runs alone.
- L52: every new assert has a mutant (§6).
- L26 / L28 / L34: the doc.
- L57: C's harness fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `c136dfd`, clean tree
- **Gate 315:** `published`, commit `c136dfd` [K1]. `git status` shows 0 entries [K2].
- **Protected and config files:** `b-round-312/protected-sha256.txt`, 11/11 OK [K13]. They must stay OK.
- **Last implementation doc in quarter IV:** `228-perf-peaks-worker.md` [K9]. The new doc is **229**.

## 0. Why this round

### 0.1 Measured premise (L37; `b-round-315/probe/`)
**Probe.** Production builds of HEAD (port 5316) and of B's sketch (port 5317), Playwright Chromium at 1440×900, 3 fresh loads per route. Data: `fonts-5316.json`, `fonts-5317.json`.

**Fonts at HEAD** [K3]:
- `root.tsx` has 2 preconnects and the Playfair Display stylesheet from Google [K4];
- `app.css` l.1 is `@import` of Inter 300–800 from Google [K5];
- `studio-lab.tsx` links Instrument Sans, IBM Plex Mono and Noto Sans Georgian from Google [K6].

| Route | HEAD: render-blocking 3rd-party / Google requests | Sketch | HEAD FCP − DCL (ms) | Sketch FCP − DCL (ms) |
|---|---|---|---|---|
| `/studio-lab` | 3 / 6 | **0 / 0** | 131, 135, 216 | 228, 240, 301 |
| `/` | 2 / 4 | **0 / 0** | 2, 11, −1 | −1, 6, 1 |
| `/store` | 2 / 4 | **0 / 0** | 6, 5, 13 | 8, 56, 3 |
| `/studio/middle-east` (sign-in guard) | 2 / 3 | **0 / 0** | 104, 79, 78 | 129, 116, 105 |

The `document.fonts` loaded set is equal per route in both builds: on `/studio-lab`, Instrument Sans 400/500, IBM Plex Mono 400 and Noto Sans Georgian 400. The font request count per route is also equal: 3, 2, 2 and 1.

**Why `/studio-lab`'s FCP − DCL did not fall** (D-29z851):
- In the sketch, DCL fell from 116–217 ms to 59–152 ms, but FCP stayed at about 300–380 ms in both builds.
- The SSR HTML wraps the page in `<div class="page-transition-wrapper" style="opacity:0;transform:translateY(8px)">` [K17].
- `/studio-lab` has no header outside that wrapper, so nothing paints until hydration runs the transition. `/` and `/store` paint their header at once.
- The fonts are not the bottleneck. PERF-11 owns the page transition on `/studio*`. performance-optimizer agrees.

### 0.2 What this round does
- **Same files, same rules, new host.** Google's CSS API returns 83 `@font-face` rules over 25 unique woff2 files (variable fonts, one file per unicode subset). B fetched them all (`fonts-src/manifest.json`, sha256 in `fonts-sha256.txt`).
  - `fonts.css` carries those rules unchanged, except that each URL becomes `url('./<file>.woff2')` and Google's subset comments are dropped [K14].
  - Vite hashes the files into `build/client/assets/`. The two 1,760 B Noto stubs (cyrillic-ext, greek-ext) are inlined as `data:` URIs by Vite's default limit (`vite.config.ts` is frozen).
- **`root.tsx`** links `fonts.css` before `app.css`. The 2 preconnects and the Playfair link are removed.
- **`app.css`** loses only l.1.
- **`/studio-lab`** preloads the two files used on first paint (`instrument-sans-latin`, one variable file for 400/500/600; `ibm-plex-mono-latin`) with `crossOrigin: 'anonymous'`. Fonts are always fetched in CORS mode, so without it the preload would not match and the file would download twice.
- **Licences.** The 5 families are SIL OFL 1.1 [K19]. Their `OFL.txt` files go to `app/assets/fonts/licenses/`, and `THIRD_PARTY_NOTICES.md` gains a fonts section.

### 0.3 What changes for the user
- **Nothing visible.** `/studio-lab` is pixel-identical at 1440 and 1280 (`probe/pxdiff.txt`: 0 px). `/` and `/store` differ only where HEAD also differs from itself (hero animation and one animated band; `probe/pxdiff-head-vs-head.txt`).
- **No request to Google** on any page, so the visitor's IP no longer reaches a third party on page load.
- Fonts come from our origin with `Cache-Control: public, max-age=31536000, immutable` [K12]. DCL is earlier on every route.
- **Store pages keep Inter and Playfair.** STORE-2c later removes them (spec: the store adopts Instrument Sans and Plex Mono) and then deletes their files from `app/assets/fonts/`. PERF-7 does not restyle the store.

### 0.4 Consults (read-only; D-29z853)
- **performance-optimizer:**
  - D-29z851 is right; measure absolute FCP as the no-regression row, not the delta.
  - The preloads are right, and `crossOrigin` is required. The preload `?url` and the CSS `url()` resolve to the same hashed file. No preloaded file may be small enough to inline.
  - Do not trim subsets: the browser downloads only matching unicode ranges, so the bytes cost the repo, not users.
  - `remix-serve` already serves `/assets/*` as immutable [K12]; add a header row.
  - Deterministic rows: Google requests = 0, render-blocking 3rd-party = 0, font file set and bytes per route, the loaded set.
- **tech-lead:**
  - `app/assets/fonts/` with `?url` is the right home. A file that holds only `@font-face` rules does not break "Tailwind-first", because Tailwind cannot declare font sources.
  - Licences go in a `licenses/` subfolder. The notices must state "unmodified, as served by Google Fonts, sha256-pinned". Never re-subset, re-encode or rename: "Playfair Display" and "Plex" are Reserved Font Names, and the risk turns on "unmodified".
  - Tests to add: FN3 (sha256 pin in the repo), FN4 (every family in the `--font-*` tokens has a face), a TH7 preload-to-face link, and the root links order. All adopted (§6).
  - No double load unless `fonts.css` is also imported as a side effect or from `app.css`: FN1 and FN2 assert neither.
  - The legacy `/studio/$productId` route and the e2e smoke are not at risk.
- **Not consulted:** product-designer and ableton-arrangement-expert. Nothing user-visible changes.

### 0.5 Reference / screen budget / journey
- This is a performance round with no visible change, so the reference rule does not apply. Nothing persistent is added to the screen.
- L54 (journey) does not apply: no entry, exit or hand-off changes. G316-AUTH covers the shared `root.tsx` path on the store, Studio and guard pages.

## 1. Rulings
| Id | Ruling |
|---|---|
| PERF-7 target | Split (D-29z851). PERF-7 closes on: 0 Google and 0 render-blocking 3rd-party requests on `/`, `/store`, `/studio-lab` and `/studio/middle-east`; FCP − DCL < 150 ms (median) on `/` and `/store`; `/studio-lab` absolute FCP no worse than HEAD (median, +30 % wallclock margin). `/studio-lab` FCP − DCL < 150 ms moves to PERF-11 |
| Subsets | **Mirror all 25 files; no trimming, re-encoding or renaming.** Cyrillic, Greek, Vietnamese, math and symbols stay. They are unicode-range gated, cost no user bytes, and dropping one would change fallback glyphs |
| Inter / Playfair | Self-hosted now, unchanged. STORE-2c deletes them when the store adopts the Studio type (handoff recorded in STORE-2c) |
| Preloads | Exactly 2, only on `/studio-lab`. No preload on store pages (STORE-2c owns store font loading). Nothing unicode-range gated is preloaded |
| `root.tsx` grant (D-29z852) | Allowed: the `fontStyles` import line, and the 2 preconnects + Playfair entry replaced by `{ rel: 'stylesheet', href: fontStyles }` before `appStyles`. Byte-equal to `sketch-root.tsx.txt`. Basis: Saba-approved perf-plan PERF-7 (self-hosting is impossible while root links Google) and D-29z166's narrow `root.tsx` precedent. The STORE-2c request in `b-round-191.md` §8 (fonts + Lenis + restyle) stays open for STORE-2c |
| `app.css` grant | Delete l.1 only; every other byte unchanged (TH2 still binds the obsidian block) |
| `public/**` | Not used. The hashed `app/assets/` path needs no grant to `public/` |

## 2. B's pre-check (L23, L37)
On the scratch `/tmp/b316s` (HEAD + `b-round-315/sketch.patch.txt` + the 25 woff2 + 5 licences):
| Check | Result |
|---|---|
| `tsc --noEmit` | rc 0 |
| `biome check` on `root.tsx`, `studio-lab.tsx`, `self-hosted-fonts.test.ts`, `studio-theme-obsidian.test.tsx` | clean (3 pre-existing `noDangerouslySetInnerHtml` warnings in `root.tsx`) |
| Build | rc 0. 23 hashed woff2 in `build/client/assets/`, 2 inlined `data:font`, `fonts-*.css` 36.67 kB (4.20 kB gzip) |
| `self-hosted-fonts.test.ts` + `studio-theme-obsidian.test.tsx` | 17/17 |
| Covering files (§7 step 4: the 15 files that import `~/routes/studio-lab`, `~/root` or read `styles/app.css`, plus `third-party-licenses.test.ts`) | 16 files, 233/233 |
| Mutants (`unit-mutants-316.py`) | 12/12 red, restored 17 passed (`precheck-unit-mutants-316.txt`) |
| Browser probe (`probe/`) | §0.1 table; pixel diff §0.3; `curl -I` on a hashed woff2: `Cache-Control: public, max-age=31536000, immutable`, `Content-Type: font/woff2` |
| Perf spec `perf/studio-lab.perf.spec.ts` on the sketch, alone | rc 0 (5.9 min), `failures` empty, `harness.loaf-scripts-live` 80; `rowcmp.py c-round-315/perf-harness.json precheck-perf.json`: 164/164 deterministic rows equal, 0 differ, 0 extra [K20] |

`git apply --check b-round-315/sketch.patch.txt` succeeds on HEAD.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-315/claims-316.sh` equals `b-round-315/claims-316-head-output.txt`. A difference is a STOP |
| A-APPLY | From `store/`: `git apply ../tmp/studio-real-loop/b-round-315/sketch.patch.txt`. Then copy `b-round-315/fonts-src/files/*.woff2` into `app/assets/fonts/` and `fonts-src/licenses/*.txt` into `app/assets/fonts/licenses/` with `cp` (no other tool touches them). In `app/assets/fonts`, `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-315/fonts-src/fonts-sha256.txt` gives 25 OK; in `app/assets/fonts/licenses`, `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-315/fonts-src/licenses-sha256.txt` gives 5 OK. The six patched files are `cmp`-equal to the `sketch-*.txt` copies |
| A-NOTICES | §4.2: the fonts section in `third-party-licenses.ts`, TL10 in `third-party-licenses.test.ts`, then regenerate `THIRD_PARTY_NOTICES.md` with `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`. TL5 passes without `-u` afterwards |
| A-TYPE | `npm run typecheck` rc 0 |
| A-LINT | `npm run lint` rc 0 |
| A-UNIT | §7 step 4's 16 files. All pass |
| A-MUTANTS | On a scratch copy of A's tree (never in `store/`), `python3 -I b-round-315/unit-mutants-316.py <scratch>` prints the same lines as `precheck-unit-mutants-316.txt`. Then A's own MU-NOTICES-DROP-FAMILY (§6) is red on TL10 |
| A-DOC | §4.3, in Georgian with technical terms in English. Cite only rows that exist (L26) |
| A-REVIEW | `code-reviewer` on the changed files (3+ files). Ask about: the narrow `root.tsx` and `app.css` edits, CSS order, preload/CORS matching, the notices wording (unmodified, RFN), and FN1–FN5/TL10 strength. A Medium+ inside the grants is fixed and re-reviewed (L11). A change to a §4.1 file beyond the sketch is a STOP |

### 3.2 C's rows
C writes `c-round-316.md` and `c-round-316.json` as it goes, with the L57 fields:
- `assertsSpecified` = 7: FN1, FN2, FN3, FN4, FN5, TH7, TL10;
- `mutantsRecorded` = 13: the 12 in `unit-mutants-316.py` plus A's MU-NOTICES-DROP-FAMILY;
- `mutantRedOnSketch` = 12.

Each finding carries an `origin`.

**Builds.** HEAD `c136dfd`: `git -C store archive c136dfd | tar -x -C <scratch-head>`, symlink `node_modules`, `npm run build`, `PORT=<p1> npx remix-serve build/server/index.js`. A's tree: a tar copy of `store/` built the same way on `<p2>`. Never build inside `store/`. The probe scripts are in `b-round-315/probe/` (`fonts-probe.cjs <base> <paths> <runs>`, `shots.cjs <base> <tag>`, `pxdiff.cjs`); C may copy and extend them.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `sha256sum -c b-round-312/protected-sha256.txt` from `store/` | Exactly 40 entries. M: `app/root.tsx`, `app/styles/app.css`, `app/routes/studio-lab.tsx`, `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, `app/lib/third-party-licenses.ts`, `app/lib/__tests__/third-party-licenses.test.ts`, `THIRD_PARTY_NOTICES.md`. ??: `app/lib/__tests__/self-hosted-fonts.test.ts`, `app/assets/fonts/fonts.css`, 25 `app/assets/fonts/*.woff2`, 5 `app/assets/fonts/licenses/OFL-*.txt`, doc 229. Protected 11/11 OK |
| CLAIMS | Re-run `claims-316.sh` | Equals `claims-316-sketch-output.txt` except by design: K2 `40 c136dfd`; K9 `229-perf-self-hosted-fonts.md`; K10 gains the `## Fonts (SIL Open Font License 1.1)` heading |
| SKETCH-EQUAL | `cmp` the six §4.1 files with `sketch-*.txt`; sha256 of the woff2 and licences against the `fonts-src` lists | All equal; 25 + 5 OK |
| UNIT | §7 step 4's 16 files on C's own scratch (own `cacheDir`); `unit-mutants-316.py` on that scratch; A's MU-NOTICES-DROP-FAMILY; at least one mutant of C's own | All pass. Mutant lines equal `precheck-unit-mutants-316.txt`. Record C's own mutant |
| FONT-NET | Browser, both builds, 1440×900, 3 fresh loads each of `/studio-lab`, `/`, `/store`, `/studio/middle-east`; `/studio-lab` also at 1280×720 | A's tree: 0 requests to `fonts.googleapis.com`/`fonts.gstatic.com` and 0 third-party `renderBlockingStatus === 'blocking'` resources on every route (HEAD: 3/2/2/2 blocking). The loaded `document.fonts` set per route equals HEAD's. The woff2 files fetched per route are exactly: `/studio-lab` instrument-sans-latin, ibm-plex-mono-latin, noto-sans-georgian-latin; `/` and `/store` inter-latin, playfair-display-latin; `/studio/middle-east` inter-latin. Each is fetched once (no duplicate from the preload). 0 console warnings about preload. With cache disabled, the decoded body bytes of the woff2 responses on `/studio-lab` total 69,732 (30,092 + 14,708 + 24,932; content-fixed whatever the transport encoding) |
| FONT-PRELOAD | A's tree: SSR HTML of `/studio-lab` and the network log | Exactly 2 `<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous">` in `<head>`. Their hrefs are the same hashed URLs the page fetches (the instrument-sans-latin and ibm-plex-mono-latin entries of the FONT-NET row). No other route has a font preload |
| FONT-CACHE | `curl -sI` on A's build: one hashed woff2 and the hashed `fonts-*.css` | `Cache-Control: public, max-age=31536000, immutable`; woff2 `Content-Type: font/woff2` |
| FONT-PIXEL | Screenshots of HEAD and A's tree (`reducedMotion: 'reduce'`, after `document.fonts.ready` + 3 s, videos paused), `/studio-lab`, `/`, `/store`, both viewports; first a HEAD-vs-HEAD control pair | `/studio-lab`: 0 px differ at 1440 and 1280. `/` and `/store`: every region that differs between HEAD and A also differs in the HEAD-vs-HEAD control (B's run: home hero and one `/store` band move by themselves). A region that differs only HEAD vs A is a finding |
| FONT-GLYPHS (L20) | CDP `CSS.getPlatformFontsForNode` on every element with direct text on `/studio-lab` (both viewports) and `/store` (1440), both builds | The per-node list of `{familyName, glyphCount}` is equal between HEAD and A's tree. Report the non-ASCII glyphs on screen and their platform font (this also shows which glyph pulls `noto-sans-georgian-latin` on `/studio-lab`) |
| FCP | From FONT-NET's loads: FCP and DCL per load, median of 3 per route and build | Gate rows: FCP − DCL < 150 ms on `/` and `/store` in A's tree; `/studio-lab` absolute FCP median ≤ 1.3 × HEAD's median. Reported only (owned by PERF-11): `/studio-lab` FCP − DCL. These are wallclock rows: an out-of-margin result gets up to 2 replacement runs (L38), then it is a finding |
| PERF-LOAD | `perf/studio-lab.perf.spec.ts` on A's tree, **alone**, after a browser warm-up (L38), 1 run; `python3 -I c-round-314/rowcmp.py c-round-315/perf-harness.json <run json>` | `failures` empty; `harness.loaf-scripts-live` ≥ 50; deterministic rows equal C round 315's run (B's sketch run: §12 K20). A differing row is reported with its id |
| NOTICES | Read `THIRD_PARTY_NOTICES.md` and §4.2 | The fonts section exists once, after the LAME section; it names the 5 families, each licence path (each file exists), "unmodified", Google Fonts, sha256, and the two Reserved Font Names. No `@fontsource` or `fonts.googleapis.com` row |
| DOC | Doc 229 | l.4 is `**სტატუსი:** Completed (C round 316 PASS)`; the 7 TEMPLATE headings in order (L26); every cited test row exists; the D-29z851 split and the STORE-2c handoff are stated |
| G316-AUTH | As G315-AUTH (copy `c-round-315/g315-auth*.cjs` if present, else `c-round-314/g314-auth.cjs`), **both viewports**, on the dev server `http://127.0.0.1:5173` | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, build, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if FONT-NET, FONT-PRELOAD, FONT-PIXEL, FONT-GLYPHS, FCP, PERF-LOAD and G316-AUTH all ran.

## 4. Contract (D-29z852)

### 4.1 Files equal to the sketch (`cmp`)
| File | Sketch copy | Change |
|---|---|---|
| `app/root.tsx` | `sketch-root.tsx.txt` | `import fontStyles from './assets/fonts/fonts.css?url';`; links = `[{ rel: 'stylesheet', href: fontStyles }, { rel: 'stylesheet', href: appStyles }]` |
| `app/styles/app.css` | `sketch-app.css.txt` | l.1 (Inter `@import`) deleted; nothing else |
| `app/routes/studio-lab.tsx` | `sketch-studio-lab.tsx.txt` | `STUDIO_FONTS_HREF` removed; 2 `?url` imports; links = 2 preloads (`as: 'font'`, `type: 'font/woff2'`, `crossOrigin: 'anonymous'`), Instrument Sans first |
| `app/assets/fonts/fonts.css` (new) | `sketch-fonts.css.txt` | 83 faces, 25 local URLs, `font-display: swap` everywhere, no comments |
| `app/lib/__tests__/self-hosted-fonts.test.ts` (new) | `sketch-self-hosted-fonts.test.ts.txt` | FN1–FN5 |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | `sketch-studio-theme-obsidian.test.tsx.txt` | TH7 rewritten + the `FONTS_CSS_PATH` constant; no other row changed |

The 25 woff2 and 5 licence files are byte copies of `fonts-src/files/` and `fonts-src/licenses/`.

### 4.2 Notices (A writes)
In `app/lib/third-party-licenses.ts`:
- Add a static section constant rendered by `renderThirdPartyNotices` **right after the LAME section**. Its heading is exactly `## Fonts (SIL Open Font License 1.1)`.
- It says that the store ships web font files as served by Google Fonts, unmodified (not re-subset, re-encoded or renamed) and pinned by sha256 in `app/lib/__tests__/self-hosted-fonts.test.ts`.
- One bullet per family, alphabetical: family name, licence file path, upstream project URL.

| Family | Licence file | Upstream |
|---|---|---|
| IBM Plex Mono | `app/assets/fonts/licenses/OFL-ibm-plex-mono.txt` | https://github.com/IBM/plex |
| Instrument Sans | `app/assets/fonts/licenses/OFL-instrument-sans.txt` | https://github.com/Instrument/instrument-sans |
| Inter | `app/assets/fonts/licenses/OFL-inter.txt` | https://github.com/rsms/inter |
| Noto Sans Georgian | `app/assets/fonts/licenses/OFL-noto-sans-georgian.txt` | https://github.com/notofonts/georgian |
| Playfair Display | `app/assets/fonts/licenses/OFL-playfair-display.txt` | https://github.com/clauseggers/Playfair-Display |

- One sentence names the Reserved Font Names: "Playfair Display" and "Plex".
- Plain ASCII apart from the family names; lines ≤ 100 characters.
- Say "Google Fonts" in words. Never write the host names `fonts.googleapis.com` or `fonts.gstatic.com`: FN1 scans every non-test file under `app/`, including `third-party-licenses.ts`.

**TL10** in `third-party-licenses.test.ts` (new describe or inside TL6), on the rendered notices for the real lock:
- the section exists exactly once and comes after `## LAME MP3 Encoder`;
- it names all 5 families and each licence path, and each path exists on disk (`readFileSync` relative to the repo root);
- it contains `unmodified`, `Google Fonts`, `sha256`, `Playfair Display` and `Plex`.

Then regenerate `THIRD_PARTY_NOTICES.md` (§3.1 A-NOTICES). No other row in either file changes.

### 4.3 Doc 229 (A writes)
`docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md`, following `docs/implementation/TEMPLATE.md`:
- Header block, as doc 228: l.1 `# ` title; l.3 `**თარიღი:** 2026-11-03` (or the day A writes it); l.4 exactly `**სტატუსი:** Completed (C round 316 PASS)` (L28); l.5 `**შეცვლილი პროექტი:** Store (…the changed paths…)`. Then the 7 TEMPLATE headings in order.
- Context: PERF-7, the §0.1 premise table, and D-29z851's split with its evidence (SSR `opacity:0` wrapper; PERF-11).
- Approach: mirror versus `@fontsource` versus trimming, and why.
- Files.
- Problems: CORS preload, inlined stubs, RFN.
- Testing: FN1–FN5, TH7, TL10, and C's browser rows.
- TODO: STORE-2c deletes Inter/Playfair; PERF-11 owns `/studio-lab` first paint.

### 4.4 Unchanged
- `public/**`, `vite.config.ts`, `package.json`, `package-lock.json`, `biome.json` and every protected file;
- `perf/**` (no harness change);
- every other app file, including `PageTransition.tsx`, the store routes and the legacy Studio route.

## 5. Grants (D-29z852)
A edits only:
1. `app/root.tsx`: §4.1, byte-equal to the sketch (narrow grant on a global_forbidden file).
2. `app/styles/app.css`: deletion of l.1 only, byte-equal to the sketch (narrow grant on a global_forbidden file).
3. `app/routes/studio-lab.tsx`: §4.1.
4. New `app/assets/fonts/fonts.css`, the 25 `app/assets/fonts/*.woff2`, and the 5 `app/assets/fonts/licenses/OFL-*.txt`: byte copies.
5. New `app/lib/__tests__/self-hosted-fonts.test.ts`: the sketch.
6. `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`: the sketch (TH7 + one constant).
7. `app/lib/third-party-licenses.ts`, `app/lib/__tests__/third-party-licenses.test.ts`, `THIRD_PARTY_NOTICES.md`: §4.2 only (L35).
8. New doc `docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md`: §4.3.

**Nothing else:**
- no other `app/**` file;
- no `perf/**`, `public/**` or config file;
- no dependency change;
- no protected file.

## 6. Specified test rows (L52)
| Assert | Red-proof (`unit-mutants-316.py`) |
|---|---|
| FN1: no non-test `app/**` `.ts`/`.tsx`/`.css` names a Google Fonts host; nothing imports `fonts.css` except as `?url` | MU-GOOGLE-LINK-BACK, MU-INTER-IMPORT-BACK, MU-SIDE-EFFECT-IMPORT |
| FN2: 83 faces; the 5 families; `font-display: swap` and a `unicode-range` on every face; every `url()` is a local woff2 that exists; every woff2 in the folder is used; no `@import` | MU-DROP-FACE, MU-SWAP-BLOCK, MU-DELETE-WOFF2, MU-RENAME-FAMILY |
| FN3: every woff2 matches its pinned sha256, and the file list equals the pin list | MU-ALTER-BYTE, MU-DELETE-WOFF2 |
| FN4: the families named in `--font-sans`/`--font-serif`/`--font-mono` in `app.css` are exactly the 5, each has a face, and each family's OFL file exists and is OFL 1.1 | MU-RENAME-FAMILY, MU-LICENSE-MISSING |
| FN5: `root.tsx` imports `fonts.css?url` and links exactly `fontStyles` then `appStyles`; `links()` has 2 entries and no `http(s)` href | MU-GOOGLE-LINK-BACK, MU-ROOT-ORDER |
| TH7 (rewritten): exactly 2 preloads with `as`/`type`/`crossOrigin`, hrefs ending in the two files, and each file is a weight-400 face of its family in `fonts.css` | MU-PRELOAD-NO-CORS, MU-PRELOAD-WRONG-FILE, MU-RENAME-FAMILY |
| **TL10 (A writes)** | **MU-NOTICES-DROP-FAMILY** (A's own: remove one family bullet from the section constant; TL10 red) |

**Note.** In vitest, a CSS `?url` import resolves to `""`. That is why FN5 checks the order by source and the runtime only for the count and the absence of `http`. The browser rows check the real hrefs.

## 7. A's order of work
1. A-CLAIMS.
2. A-APPLY (patch, then the byte copies, then the sha checks).
3. A-TYPE and A-LINT.
4. Covering files, all of them: `app/lib/__tests__/audio-preview-player.test.tsx`, `self-hosted-fonts.test.ts`, `store-focus-fixups.test.tsx`, `store-focus-ring.test.ts`, `store-theme-tokens.test.ts`, `third-party-licenses.test.ts`; and under `app/lib/arrangement/__tests__/`: `default-track-names-ssr.test.tsx`, `panel-radius-ui.test.tsx`, `ssr-layout-effect.test.tsx`, `studio-focus-ring.test.ts`, `studio-link-hydrate-ssr-ui.test.tsx`, `studio-link-hydrate-ui.test.tsx`, `studio-link-ui.test.tsx`, `studio-link-view-in-store-ui.test.tsx`, `studio-narrow-gate-ui.test.tsx`, `studio-theme-obsidian.test.tsx`. B's run: 16 files, 233/233.
5. A-NOTICES (TL10, regenerate, rerun `third-party-licenses.test.ts` without `-u`).
6. A-MUTANTS.
7. A-DOC.
8. A-REVIEW; fix inside the grants; re-review.
9. Write `a-round-316.md` with every row actually run.

## 8. Neighbouring behaviour at risk (C probes)
- **Store pages** (Inter + Playfair) and the legacy guard page (Inter via `app.css` `--font-sans` [K5]): same fonts loaded and the same pixels (FONT-NET, FONT-PIXEL).
- **CSS order:** `fonts.css` before `app.css`. The two do not share selectors, but the cascade order of `@font-face` matters only for duplicate families, and there are none.
- **Double fetch:** a preload without a matching CORS mode, or `fonts.css` loaded twice (FONT-NET counts each file once).
- **Inlined stubs:** the two 1,760 B Noto files become `data:` URIs. They are never preloaded and are fetched by no request.
- **Auth:** `root.tsx` is shared by every route (G316-AUTH).

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-316.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- `git apply` fails, a sha check fails, or a change is needed outside §5;
- a covering test fails, or one runs above 50 % of its timeout (L11);
- the reviewer asks for a change to a §4.1 file (trimming, renaming, another preload, a different `root.tsx` shape);
- the reviewer reports a Medium+ outside the grants;
- regenerating `THIRD_PARTY_NOTICES.md` changes anything other than inserting the fonts section (for example a `## Runtime packages` row). That would mean the notices were already stale at HEAD, which is a separate finding.

## 10. Next, and requests (D-29z854)
- **After C PASS and the gate:** PERF-7 is done. Root publishes the 40 paths (§11).
- **Next round (317):**
  - **REGRESSION**, if the round-317 planning falls on or after **2026-11-05** [K18];
  - otherwise **PERF-8** (range and selection in an external store). It needs `zustand@5.0.16` (oss-adoption.md). B files `root-deps-request.json` in the same planning step that dispatches PERF-8, and grants the notices files in that task (L35).
- **RETRO:** at round 320.
- **Moved to `deferred_low_polish`** (D-29z854; fix home PERF-14, the next round that owns `peaks.client.ts` and its tests):
  - C-R315-T1: PW14 does not pin 10,000 ms;
  - C-R315-T2: no row for "an unparsable message does not end the cold start";
  - A-R315-REVIEW-L1: `dispose()` keeps `workerReplied`;
  - A-R315-REVIEW-L2 = GATE315-S6: a main-thread compute throw stops the fallback loop;
  - A-R315-REVIEW-L3: no "no Worker + throwing `onPeaks`" row;
  - A-R315-REVIEW-L4 = GATE315-S1: the `afterEach` of the PW12–PW13 describe lacks `vi.useRealTimers()`;
  - GATE315-S2: PW18 unmounts only on pass;
  - GATE315-S8: doc 228 credits the stage-1 browser rows to round 314 instead of 312.
- **Signals (not scheduled):**
  - GATE315-S4 / A-R315 info: N sources ready during playback give N graph restarts (unreachable in `/studio-lab`) → PERF-10 / SRW-21-PLAN.
  - GATE315-S5: = B-R314-EXPORT-LOADING-GATE → SRW-21-PLAN.
  - ARCH-R315-COMMIT-DECODED-SOURCE: the reviewer's proposal to extract the duplicated "source ready" sequence into one local `useCallback` → keep as a signal; decided at PERF-10 planning.
  - C-R315 observation: a video's own sound ends with no fade at the video's duration → T12-ADVANCED (T12.13 micro fades).
  - STORE-2c handoff: delete the Inter and Playfair files and faces when the store adopts the Studio type.
- **For Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **For root (unchanged):** ROOT-REQ-VITEST-PERF-INCLUDE and ROOT-REQ-VERIFY-WORKER-TESTS. No architecture checkpoint: one small owner set.

## 11. Commit readiness
After C PASS and the gate, root publishes 40 paths:
- M `app/root.tsx`, `app/styles/app.css`, `app/routes/studio-lab.tsx`, `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, `app/lib/third-party-licenses.ts`, `app/lib/__tests__/third-party-licenses.test.ts`, `THIRD_PARTY_NOTICES.md`;
- new: `app/lib/__tests__/self-hosted-fonts.test.ts`, `app/assets/fonts/fonts.css`, the 25 woff2, the 5 licences, doc 229.

The woff2 files are binary; root's diff review uses their sha256 against `fonts-src/fonts-sha256.txt`. There is no deploy step.

## 12. Claims (L29 + L56)
Run `bash b-round-315/claims-316.sh` from the loop root. Outputs:
- `b-round-315/claims-316-head-output.txt`: HEAD at planning;
- `b-round-315/claims-316-sketch-output.txt`: `CLAIMS_STORE=/tmp/b316s`.

| Tag | Claim | HEAD | Sketch |
|---|---|---|---|
| K1 | gate 315 status, commit | `published c136dfd` | same |
| K2 | `git status` entries, HEAD | `0 c136dfd` | (no git) |
| K3 | non-test `app/**` files naming a Google Fonts host; line count | `app/root.tsx app/routes/studio-lab.tsx app/styles/app.css`, 5 | none, 0 |
| K4 | `root.tsx`: preconnects, `fontStyles` import, `fontStyles` link, `appStyles` link line | `2 0 0 40` | `0 1 1 36` |
| K5 | `app.css` l.1 | the Inter Google `@import` | `@import "tailwindcss";` |
| K6 | `studio-lab.tsx`: `STUDIO_FONTS_HREF`, preloads, woff2 `?url` imports | `2 0 0` | `0 2 2` |
| K7 | TH7 line | l.250, Google stylesheet | l.251, preloads |
| K8 | `app/assets/fonts` | absent | 25 woff2, css present |
| K9 | last quarter-IV doc | `228-perf-peaks-worker.md` | same (after A: 229) |
| K10 | `THIRD_PARTY_NOTICES.md` `##` headings | LAME, MPL-2.0, exceptions, runtime packages (560) | same (after A: plus the fonts heading) |
| K11 | Biome `files.includes` | `app/**/*.ts`, `app/**/*.tsx` | same |
| K12 | `remix-serve` `immutable: true` | 1 | same |
| K13 | protected OK | 11 | 11 |
| K14 | staged fonts: faces, families, urls, woff2, sha OK, licences OK, `fonts.css` sha OK, swap, comments | `83 5 25 25 25 5 1 83 0` | same |
| K15 | cited artifacts exist | all 1 | all 1 |
| K16 | test files naming a Google Fonts host | `studio-theme-obsidian.test.tsx` | none |
| K17 | `root.tsx` `<PageTransition key={location.pathname}>`; `opacity: 0` lines in `PageTransition.tsx` | `1; 3` | same |
| K18 | `regression-last.json` date | `2026-11-02` | same |
| K19 | OFL 1.1 header in each staged licence | `11111` | same |
| K20 | `python3 -I c-round-314/rowcmp.py c-round-315/perf-harness.json b-round-315/precheck-perf.json` | — | `ref-det 164 run-det 164 equal 164 differ 0 [] extra []` |
