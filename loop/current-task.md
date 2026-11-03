# Round 317: PERF-7 fix-up (C-R316-01). The 4 Playfair Display woff2 files become the bytes browsers actually receive from Google at HEAD; their 4 sha256 pins follow

**Planned by:** B, at the round 316 → 317 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v276 → `decisions_log_b`):
- **D-29z855: round 316 ruled.** C FAIL on one Medium finding, **C-R316-01** (origin B). The other 13 rows passed; FONT-PIXEL failed. `browserVerified`/`realVerified` are true. Gate 316 was `skipped` (C FAIL) [K1], so nothing was published. **PERF-7 stays in progress**; it is not done.
- **D-29z856: B confirmed C-R316-01 independently** (§0.1). B's round-315 fetch of the Playfair CSS returned Google's `/l/font?kit=` URLs (16 of them; the Inter and Studio CSS had none). Those are a different file variant from the `/s/playfairdisplay/v40/` files a Chrome browser loads. **B's round-315 claim that the `/store` 2,015 px band "moves by itself" was unevidenced.** C's HEAD-vs-HEAD control was 0 px, and so is B's re-run today. C's explanation (B's control load caught Playfair before it swapped in) is an inference, not a proven fact.
- **D-29z857: round 317 = the C-R316-01 fix only.** A replaces the 4 files and the 4 sha pins and corrects doc 229. `fonts.css`, the notices and TL10 do not change. C ruled that their text ("unmodified, as served by Google Fonts", "byte-identical") becomes true once the bytes are fixed.
  - A-R316-REVIEW-P1 and P2 (Low test-strength proposals) go to `deferred_low_polish`. Their fix home is STORE-2c, which rewrites this test when it deletes Inter and Playfair.
  - P3 and P5 are info only.
  - P4 (a future CSP needs `font-src 'self' data:`) is a signal.
- **D-29z858: bookkeeping.**
  - `lessons.md`: L37 gains the control-pair clause and L29 the mirrored-bytes clause. No line is added.
  - REGRESSION is not due: `regression-last.json` is 2026-11-02, so the next falls on or after 2026-11-05 [K9]. RETRO is at round 320.

**Read first:** `lessons.md`. These apply directly:
- L37: the premise is re-measured, and the control pair is clean (new clause);
- L29: mirrored bytes are pinned against what the browser downloads (new clause);
- L23: B's pre-check;
- L52: the mutants;
- L26 / L28: the doc;
- L38: perf runs alone;
- L57: C's harness fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]` (§9).

## Baseline: HEAD `c136dfd` plus A's round-316 tree (40 entries)
- Gate 316 is `skipped`, so HEAD stays `c136dfd`. `git status --short --untracked-files=all` shows **40 entries** [K2]. They are A's round-316 work.
- **A edits that tree in place.** Do not revert, re-apply or re-copy anything from round 316. Swapping 4 files' bytes and 4 test strings keeps the count at 40.
- **Protected and config files:** `b-round-312/protected-sha256.txt`, 11/11 OK [K8]. They must stay OK.

## 0. Why this round

### 0.1 The finding, re-measured by B (L37)
**Byte sweep.** B ran `python3 -I b-round-316/byte-identity-317.py` with a pinned Chrome UA (`b-round-316/fonts-src/fetch/user-agent.txt`).
- It fetched the 3 HEAD Google CSS URLs (`fonts-src/fetch/head-css-urls.txt`).
- It mapped all 83 remote faces onto the 83 local faces by family, weight and unicode-range. The result is 25 files, a 1:1 match.
- It compared the bytes:
  - **before the fix** (`byte-identity-before-fix.txt`): 21/25 identical. The 4 Playfair files differ:

    | Subset | Ours (B) | Google (B) |
    |---|---|---|
    | latin | 39,172 | 38,404 |
    | latin-ext | 50,272 | 21,140 |
    | cyrillic | 55,840 | 21,152 |
    | vietnamese | 42,892 | 9,112 |

  - **after the fix** (`byte-identity-after-fix.txt`): **25/25 identical, 0 kit URLs** [K12].
- The 4 replacement files are `cmp`-equal to C's `c-round-316/gfonts-dl/` downloads.

**Mapping.** The Chrome-UA CSS puts each Playfair subset on the same unicode-range as our existing face:
- latin → `…DTzYgA`
- latin-ext → `…DTLYgFE_`
- cyrillic → `…DTjYgFE_`
- vietnamese → `…DTPYgFE_`

So **`fonts.css` needs no change** [K11].

**Pre-check on the scratch `/tmp/b317s`** (A's tree + the 4 files + the pin sketch):

| Check | Result |
|---|---|
| `sha256sum -c b-round-316/fonts-src/fonts-sha256.txt` | 25 OK [K5 sketch] |
| `self-hosted-fonts.test.ts`, `studio-theme-obsidian.test.tsx`, `third-party-licenses.test.ts` | 3 files, 87/87 |
| `unit-mutants-316.py` | Output identical to `b-round-315/precheck-unit-mutants-316.txt`: 12 red, restored 17 passed. Saved as `b-round-316/precheck-unit-mutants-317.txt` |
| Negative check | The old kit `playfair-display-latin.woff2` put back → FN3 red |
| Production builds of HEAD (`git archive c136dfd`) and the scratch | rc 0 for both; 23 hashed woff2 |
| `/store` pixels (`probe/pxdiff.txt`) | HEAD vs HEAD **0 px**, HEAD vs fix **0 px**, at 1440 and 1280 |
| `/studio-lab` pixels | 0 px |
| `/` pixels | Inconclusive. The hero animates, and HEAD vs HEAD already differs by 103k–130k px below y=81 |
| Font bytes per route (`probe/font-bytes-summary.txt`, `font-bytes.cjs`) | On `/studio-lab`, `/`, `/store` and `/studio/middle-east`, every woff2 body the browser received in the fix build has the same sha256 as HEAD's body from `fonts.gstatic.com`: 3, 2, 2 and 1 files. The loaded `document.fonts` set is equal per route |

### 0.2 What changes for the user
- **Nothing visible versus today.** `/store`'s Playfair heading renders exactly as at HEAD. Round 316's files did not.
- Everything round 316 achieved stays:
  - 0 Google requests;
  - 0 render-blocking third-party requests;
  - the 2 preloads;
  - immutable caching.

### 0.3 Consults / reference / screen budget
- **Reference, screen budget and journey:** none apply. This is a byte fix-up in a performance round, with no visible change and no new persistent element.
- **Consults:** none this round. The fix is mechanical, and both C and B measured it. The round-316 consults (performance-optimizer and tech-lead; D-29z853) stand.

## 1. Rulings
| Id | Ruling |
|---|---|
| Source of truth for mirrored bytes | The file a Chrome browser receives at HEAD: the `/s/…` URL from the Chrome-UA CSS, never a `/l/font?kit=` URL. `b-round-316/fonts-src/` supersedes `b-round-315/fonts-src/`, which stays as the record of what was wrong |
| `fonts.css`, notices, TL10, `root.tsx`, `app.css`, `studio-lab.tsx`, TH7 | Unchanged from round 316 |
| Doc 229 | l.4 becomes round 317. One new Problem → Solution entry about the kit variant (§2.2). The title and the other "byte-identical" lines stay; they become true |
| A-R316-REVIEW-P1/P2 | Moved to `deferred_low_polish`, fix home STORE-2c (D-29z857) |
| PERF-7 closes on | C PASS of this round plus gate 317. The round-316 PASS rows are not re-run in full; §3.2 says which ones are |

## 2. Contract (D-29z857)

### 2.1 Files
| File | Change |
|---|---|
| `app/assets/fonts/playfair-display-latin.woff2`, `-latin-ext`, `-cyrillic`, `-vietnamese` | `cp` from `b-round-316/fonts-src/files/`. These are byte copies; no other tool touches them |
| `app/lib/__tests__/self-hosted-fonts.test.ts` | Only the 4 Playfair sha256 strings in `SELF_HOSTED_FONT_SHA256` change. `cp b-round-316/sketch-self-hosted-fonts.test.ts.txt` over it; the review diff is `sketch-pins.patch.txt` (4 lines out, 4 in) |
| `docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md` | §2.2 |

### 2.2 Doc 229 (A writes, in Georgian with technical terms in English)
- **l.4** reads exactly `**სტატუსი:** Completed (C round 317 PASS)` (L28).
- **`## პრობლემები და გადაწყვეტები`** gets one new entry, after the RFN entry:
  - **Problem:** the first mirror took the 4 Playfair files from Google's `/l/font?kit=` URLs. B's fetch returned these, but with a Chrome UA Google serves `/s/playfairdisplay/v40/…`. They were a different variant (a 400–700 instance with different outline rasterization), so `/store`'s heading differed by 2,015 px (C-R316-01).
  - **Solution:** the 4 files were re-fetched from the `/s/` URLs with a pinned Chrome UA, and their sha256 pins in FN3 were updated. A sweep of all 25 files against the Chrome-UA CSS gives 25/25 identical and 0 kit URLs.
- **`## ტესტირება`** names C's round-317 rows BYTE-IDENTITY and FONT-BYTES (§3.2).
- Nothing else changes.

### 2.3 Unchanged
- every other path in the 40-entry tree;
- `public/**`, `vite.config.ts`, `package.json`, the lockfile and `biome.json`;
- `perf/**`;
- every protected file.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-316/claims-317.sh`. Its output equals `b-round-316/claims-317-head-output.txt`. A difference is a STOP |
| A-APPLY | `cp` the 4 woff2 files. Then, in `app/assets/fonts`, `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-316/fonts-src/fonts-sha256.txt` gives **25 OK**. `cp` the test sketch; the test file is `cmp`-equal to `b-round-316/sketch-self-hosted-fonts.test.ts.txt` |
| A-DOC | §2.2 |
| A-CLAIMS-AFTER | Run `claims-317.sh` again. It equals `claims-317-sketch-output.txt` except by design: K7 shows round 317, K14 is ≥ 1, and K15 is `34 OK 6 FAILED` (the sketch shows 35/5 because B's scratch did not edit doc 229) |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 |
| A-UNIT | `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/__tests__/third-party-licenses.test.ts`: 87/87 |
| A-MUTANTS | On a scratch copy, never in `store/`: `python3 -I b-round-315/unit-mutants-316.py <scratch>` prints the same lines as `b-round-316/precheck-unit-mutants-317.txt`. Then **MU-KIT-BACK**: copy `b-round-315/fonts-src/files/playfair-display-latin.woff2` over the scratch's file; FN3 is red |
| A-REVIEW | Required (6 paths change; speed rules: code-reviewer for 3+ files), and kept short. Ask `code-reviewer` to confirm: the 4 pins equal `b-round-316/fonts-src/fonts-sha256.txt`; the doc entry's numbers match `c-round-316.md` (2,015 px, the 4 sizes); nothing outside §4 moved (`sha256sum -c b-round-316/tree-316-sha256.txt` from `store/`: 34 OK, 6 FAILED). A Medium+ inside the grants is fixed and re-reviewed (L11). If anything outside §2.1 seems to need changing, A STOPs |

### 3.2 C's rows
C writes `c-round-317.md` and `c-round-317.json` as it goes, with the L57 fields:
- `assertsSpecified` = 1: FN3. The other FN, TH and TL rows are unchanged from round 316.
- `mutantsRecorded` = 13: the 12 in `unit-mutants-316.py` plus MU-KIT-BACK.
- `mutantRedOnSketch` = 13.

Each finding carries an `origin`.

**Builds.** As in round 316 §3.2:
- HEAD `c136dfd` from `git archive`, and A's tree from a tar copy, each in its own scratch;
- `node_modules` symlinked, then `npm run build` and `PORT=<p> npx remix-serve build/server/index.js`;
- never build inside `store/`.

**Scripts:** `b-round-316/probe/{shots.cjs, pxdiff.cjs, font-bytes.cjs}` and `b-round-316/byte-identity-317.py`. They write to B's folders, so C copies them and points every output at `c-round-317/`.

**Network.** BYTE-IDENTITY and FONT-BYTES need Google reachable from C's job. If `fonts.googleapis.com` or `fonts.gstatic.com` is unreachable, those rows are BLOCKED (environment) and `browserVerified` is false. They are never PASS from B's saved bytes.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status --short --untracked-files=all`; from `store/`, `sha256sum -c ../tmp/studio-real-loop/b-round-316/tree-316-sha256.txt` (content hashes of the 40 paths as A left them in round 316, taken by B at planning); `sha256sum -c b-round-312/protected-sha256.txt` | Still exactly the **40** round-316 entries (same list as `c-round-316/git-status-end.txt`). The tree check gives **34 OK and exactly 6 FAILED**: the 4 Playfair woff2, `self-hosted-fonts.test.ts` and doc 229. Protected 11/11 OK |
| CLAIMS | `claims-317.sh` | As A-CLAIMS-AFTER |
| BYTE-IDENTITY (new; the row that would have caught C-R316-01) | C fetches the 3 HEAD CSS URLs itself with a Chrome UA, maps the faces onto `fonts.css` and `cmp`s each mapped file with `store/app/assets/fonts/`. C may copy `byte-identity-317.py` or write its own | 83 remote faces → 25 files, **25/25 identical**. **0** `/l/font?kit=` URLs in the fetched CSS and **0** in `b-round-316/fonts-src/manifest.json` |
| UNIT | The 3 files of A-UNIT on C's own scratch (own `cacheDir`); `unit-mutants-316.py`; MU-KIT-BACK; at least one mutant of C's own | 87/87. Mutant output equal to `precheck-unit-mutants-317.txt`. MU-KIT-BACK red on FN3 |
| FONT-BYTES (new, deterministic) | `font-bytes.cjs` on both builds: `/studio-lab`, `/`, `/store`, `/studio/middle-east` at 1440 | Per route, the sorted sha256 list of the woff2 bodies the browser received is equal HEAD vs A: 3, 2, 2 and 1 files (HEAD's from `fonts.gstatic.com`, A's from our origin). The loaded `document.fonts` set is equal. A's tree makes 0 requests to Google hosts |
| FONT-PIXEL | `shots.cjs` twice on HEAD and once on A, then `pxdiff.cjs` (reducedMotion, `document.fonts.ready` + 3 s) | **`/store`: 0 px HEAD vs A at 1440 and 1280**, with a 0 px HEAD-vs-HEAD control. `/studio-lab`: 0 px at both viewports. `/`: report the numbers only; FONT-BYTES covers it. If a control pair is not 0 px where the change could matter, rerun it (up to 2 replacement runs). If it still differs, that region is a finding, not an exemption (L37) |
| FONT-NET / FONT-PRELOAD / FONT-CACHE | One confirmation run of the round-316 rows on A's build: `/studio-lab` at both viewports, the other routes at 1440 | Unchanged from C round 316: 0 Google requests and 0 render-blocking third-party requests; the same file set per route; each file fetched once; exactly 2 CORS preloads on `/studio-lab`; immutable caching. The `/studio-lab` decoded bytes stay 69,732, because the Playfair files are not loaded there |
| FCP / PERF-LOAD | One confirmation run. FCP comes from FONT-NET's loads. Run the perf spec **alone** (L38), then `rowcmp.py c-round-315/perf-harness.json <run>` | FCP − DCL < 150 ms on `/` and `/store`; `/studio-lab` FCP ≤ 1.3 × HEAD (wallclock, up to 2 replacement runs). Perf: `failures` empty, `loaf-scripts-live` ≥ 50, 164/164 deterministic rows equal. The changed bytes reach store pages only, so a difference on `/studio-lab` is a finding |
| DOC | Doc 229 | l.4 names round 317. The new Problem → Solution entry exists, and its numbers match `c-round-316.md` (2,015 px; the 4 sizes). BYTE-IDENTITY and FONT-BYTES are named under testing. The 7 TEMPLATE headings are still in order |
| G317-AUTH | As G316-AUTH (`c-round-316/g316-auth.cjs`), **both viewports**, on the dev server `http://127.0.0.1:5173` | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, the build in `store/`, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if all of these ran: BYTE-IDENTITY, FONT-BYTES, FONT-PIXEL, FONT-NET, FONT-PRELOAD, FCP, PERF-LOAD and G317-AUTH.

**Ableton conformance:** not applicable. There is no user-visible behaviour and no reference.

## 4. Grants (D-29z857)
A edits only:
1. the 4 `app/assets/fonts/playfair-display-*.woff2` files (byte copies);
2. `app/lib/__tests__/self-hosted-fonts.test.ts`: the 4 sha strings, `cmp`-equal to the sketch;
3. `docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md`: §2.2.

**Nothing else:**
- no other `app/**` file, `fonts.css` included;
- no notices;
- no config, dependency, `perf/**` or `public/**` change;
- no protected file.

## 5. Neighbouring behaviour at risk (C probes)
- **The `/store` heading and any other Playfair text:** FONT-PIXEL and FONT-BYTES.
- **Weights:** `fonts.css` declares only Playfair 400, 500, 600 and 700, so the `/s/` files must cover them. The Chrome-UA CSS maps all 4 weights per subset onto one file, exactly as before.
- **Studio:** unaffected by construction, because Playfair is not loaded there. The `/studio-lab` pixel row and PERF-LOAD confirm it.
- **Auth:** G317-AUTH.

## 6. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-317.md` and changes nothing else when:
- A-CLAIMS differs from `claims-317-head-output.txt`;
- the sha check gives fewer than 25 OK;
- a covering test or a mutant line differs from §3.1;
- anything outside §4 seems to need changing.

## 7. Next (D-29z858)
- **After C PASS and gate 317:** PERF-7 is done. Root publishes round 316's 40 paths with round 317's content (§8).
- **Round 318:**
  - **REGRESSION**, if the round-318 planning falls on or after **2026-11-05**;
  - otherwise **PERF-8** (range and selection in an external store, `zustand@5.0.16` per `oss-adoption.md`). B files `loop/root-deps-request.json` in the same planning step that dispatches it and grants the notices files (L35).
- **RETRO:** at round 320.
- **Deferred (D-29z857), fix home STORE-2c:**
  - A-R316-REVIEW-P1: FN4 checks only the generic OFL header.
  - A-R316-REVIEW-P2: FN1 does not scan `public/`, `vite.config.ts` or `*.html`.
- **Signals:**
  - A-R316-REVIEW-P4: a future CSP needs `font-src 'self' data:`.
  - C-R316 observation: the `/studio-lab` FCP − DCL (199 / 149 ms) stays with PERF-11.
  - C-R316 observation: which glyph pulls `noto-sans-georgian-latin` is undetermined. The same request happens at HEAD.
- **For Saba and root:** unchanged from round 316.

## 8. Commit readiness
After C PASS and the gate, root publishes the same 40 paths as round 316 §11:
- M: `app/root.tsx`, `app/styles/app.css`, `app/routes/studio-lab.tsx`, `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, `app/lib/third-party-licenses.ts`, `app/lib/__tests__/third-party-licenses.test.ts`, `THIRD_PARTY_NOTICES.md`;
- new: `app/lib/__tests__/self-hosted-fonts.test.ts`, `app/assets/fonts/fonts.css`, the 25 woff2, the 5 licences and doc 229.

Root's diff review checks the woff2 files against **`b-round-316/fonts-src/fonts-sha256.txt`**, not round 315's list.

## 9. Claims (L29 + L56)
Run `bash b-round-316/claims-317.sh` from any directory. Outputs:
- `b-round-316/claims-317-head-output.txt`: A's round-316 tree at planning;
- `b-round-316/claims-317-sketch-output.txt`: `CLAIMS_STORE=/tmp/b317s`.

| Tag | Claim | Now | Sketch |
|---|---|---|---|
| K1 | gate 316 | `skipped C taskStatus FAIL` | same |
| K2 | `git status` entries, HEAD | `40 c136dfd` | same |
| K3 | Playfair woff2 sha (first 12 chars) | `252fb6cf590f 685362647a14 f0f65d35bd09 857eda4dfad5` | `c108681cba6a 42898ad49a6b e0c764a8e9e1 ef6446229b59` |
| K4 | FN3 Playfair pins | as K3 now | as K3 sketch |
| K5 | store files vs the corrected list | 21 of 25 | 25 of 25 |
| K6 | kit URLs: old manifest / new manifest | 16 / 0 | same |
| K7 | doc 229 l.4 | round 316 | round 316 (after A: 317) |
| K8 | protected OK | 11 | 11 |
| K9 | `regression-last.json` date | 2026-11-02 | same |
| K10 | test file vs the round-316 sketch / the round-317 sketch | equal / differs | differs / equal |
| K11 | `fonts.css` sha OK | 1 | 1 |
| K12 | byte sweep after the fix | 25/25 identical, 0 kit | same |
| K13 | notices fonts heading | 1 | 1 |
| K14 | doc 229 lines naming `l/font?kit=` | 0 | 0 (after A: ≥ 1) |
| K15 | `tree-316-sha256.txt` check: OK / FAILED | 40 / 0 | 35 / 5 (after A: 34 / 6) |

**Artifacts** (all exist):
- `b-round-316/`: `byte-identity-317.py`, `byte-identity-before-fix.txt`, `byte-identity-after-fix.txt`, `claims-317.sh`, `claims-317-head-output.txt`, `claims-317-sketch-output.txt`, `precheck-unit-mutants-317.txt`, `sketch-self-hosted-fonts.test.ts.txt`, `sketch-pins.patch.txt`, `tree-316-sha256.txt`;
- `b-round-316/fonts-src/`: `files/` (25), `licenses/` (5), `fonts-sha256.txt`, `licenses-sha256.txt`, `fonts.css`, `fonts-css-sha256.txt`, `manifest.json`, `fetch/`;
- `b-round-316/probe/`: `shots.cjs`, `pxdiff.cjs`, `pxdiff.txt`, `font-bytes.cjs`, `font-bytes-head.json`, `font-bytes-fix.json`, `font-bytes-summary.txt`, `shots/`.
