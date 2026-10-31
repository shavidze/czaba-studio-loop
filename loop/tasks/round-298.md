# Round 298: STUDIO-LINK-a3. Test-only fix-up: make LH3's hydration-warning check able to fail

**Planned by:** B, at the round 297 → 298 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z758:** round 297 is **C PASS** (9/9), and gate 297 published `77d5341`. STUDIO-LINK-a2 is **მზადაა**.
- **D-29z759:** rulings on the gate-297 review (§2).
- **D-29z760:** this round. GATE297-F1 is **Medium**, so the bug gate (2026-10-23) puts it before new scope. This round fixes it together with GATE297-S2 and GATE297-S3, three related test gaps in the same two files, plus the doc-220 line (INFO-C297-01 = gate S4). STUDIO-LINK-b moves to round 299.
- **D-29z761:** C's info notes.
- **D-29z762:** no new Saba or root file. Regression is not due (2026-11-02). RETRO is at round 305.
- **D-29z763:** the order after this round.
- **Test-only round:** no reference-first, product-designer or screen-budget section (as D-29z755). C still runs one small real-browser row and the auth row.

**Owner:** A. **Verifier:** C. **Grants:** §4 (3 paths).
- **No app source changes.** No route, context, component, auth, cart, checkout, purchase or protected file is touched.
- `/studio-lab` stays public and needs no backend. `/studio/$productId` stays protected.

## Baseline: HEAD `77d5341` [K1], clean tree [K2]
- Gate 297 is `published`, with commit `77d5341` [K1]. `git status` is empty [K2].
- **Frozen list:** `b-round-297-r298-tree-sha256.txt`. It has 1,167 entries, hashed from `git ls-files` at HEAD; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-297/claims-298.sh` **before editing**. Its output must equal `b-round-297/claims-298-output.txt`. Any difference is a STOP (§7).
- **Allowed deltas after the change** are exactly `b-round-297/claims-298-after-sketch.txt`, which is the same script run on B's sketch-applied scratch copy. In the real tree, K1 stays the HEAD line and K2/K3 become:
  - K2: 3 lines;
  - K3: rc 1, failing only on `studio-link-hydrate-ui.test.tsx` and doc 220.

  K5, K6, K8 and K10 change exactly as in the after-sketch file. K4, K7, K9 and K11 must be identical.

## 0. Read first
1. `lessons.md` (every role). These bind this round: L11, L23, L29, L52 and L56. For C, also L38.
2. This task.
3. B's sketch, pre-run on a scratch copy. `/tmp/b298-scratch` is a `git archive` of `77d5341`, with `node_modules` symlinked and **its own Vite `cacheDir`** (`/tmp/b298-vite-cache`, set in the scratch `vitest.config.ts` only). The store tree was not touched. The scratch copy does not survive the job; the artifacts are the files under `b-round-297/`:
   - `sketch-studio-link-hydrate-ssr-ui.test.tsx.txt`: the full new file;
   - `sketch-studio-link-hydrate-ui.test.tsx.txt`: the full edited file;
   - `sketch-220-studio-link-deep-link.md.txt`: the full edited doc;
   - `sketch.patch`: the three diffs together.

   Both test files are Biome-formatted. A copies all three **byte for byte**.
   - **Covering run:** `sketch-covering-run.log` has 7 files and 58 tests passing. `sketch-tsc.log`: `tsc --noEmit` rc 0. Biome: no finding on either test file.
   - **Mutants:** see §5.
4. A's primitives and templates: `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`.

## 1. Why
LH3 (round 297) asserts that hydrating `/studio-lab?preview=middle-east` prints no hydration mismatch apart from the known `muted` one. The gate-297 reviewer found that this assertion cannot fail when the whole file runs, and B reproduced it.
- **React 18.3.1 prints only one prop-mismatch warning per load.** A module-level flag, `didWarnInvalidHydration` in `react-dom.development.js` [K7], silences every later one.
- LH1 hydrates first in the same file and consumes that flag.
- **B's mutant (h)** gives the library option an attribute that differs between server and client (`b-round-297/mutant-h-option-mismatch.py`). React prints the warning under LH1, and all four LH rows stay green at HEAD (`mutant-h-at-head-file.log`).
- With LH3 alone in its own file, the same mutant turns LH3 red (`mutant-h-option-mismatch.log`). Vitest gives each test file a fresh React.

**Known limit (not fixed here).** The video dock's `<video muted>` mismatch (GATE297-S5, deferred Low) also consumes the flag. So LH3 catches only mismatches that hydrate **before** the dock in tree order. The library does; mutant (h) proves it. The doc records this limit.

**B's method note:** B's first probe used `typeof window === 'undefined'` as the server/client difference. Under jsdom, `renderToString` also sees `window`, so that mutant changed nothing and briefly led to a wrong conclusion. Mutant (h) differs by a test-observable state instead: the container is attached to `body` only at hydrate time.

A user sees no change, so there is no user-facing promise row (L55 does not apply).

## 2. Rulings on round 297 and gate 297 (L10)
| Item | Ruling |
|---|---|
| Round 297 | **C PASS.** 9 rows passed, 0 failed, 0 blocked; `browserVerified` and `realVerified` are true. Gate 297 published `77d5341` (review 7/10, COMMIT OK). STUDIO-LINK-a2 is **მზადაა**. A-R296-REVIEW-2 and -5 are **closed**. A-R296-REVIEW-1 is **closed** for its focus/selection half (LH3's server `aria-selected` and hydrated focus, red under mutant e). Its warning half is reopened as GATE297-F1. |
| Gate-297 F1 (LH3's warning check is vacuous) | **Medium**, this round (§3.1). C's INFO-C297-04 is the same finding and is merged into it. |
| Gate-297 S2 (`/hydrat/` also matches the server-only "non-hydrated" warning) | This round. The regex becomes `/did not match|Expected server HTML|Hydration failed/i`. |
| Gate-297 S3 (a failing row leaves its root mounted) | This round. Every hydrated root is tracked, and `afterEach` unmounts it. The unmount function is idempotent. |
| Gate-297 S4 = INFO-C297-01 (doc 220 TODO says STUDIO-LINK-b round 297) | This round's doc grant: it becomes round 299. |
| Gate-297 S5 (`<video muted>`: server `false`, client `true`) | **GATE297-S5-VIDEO-MUTED-SSR, Low, `deferred_low_polish`.** It has no user effect: React sets the property on the client. It does cost tests the flag (§1). B's scratch: `suppressHydrationWarning` on the two `<video muted>` [K9] removes the warning. It is a candidate to bundle with the next round that owns `ArrangementVideoDock.tsx`. |
| Gate-297 Alternative (`onRecoverableError`) | Not adopted, as the reviewer concluded: prop mismatches only reach `console.error`. |
| INFO-C297-02 | A STUDIO-LINK-DYNAMIC browser row with a non-first previewable source. |
| INFO-C297-03 | Mutant runs in this round use their own `cacheDir` (§5). Retro candidate RC-R297-SCRATCH-CACHEDIR. |

## 3. What A changes

### 3.1 New `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` [K6: absent before]
Copy `b-round-297/sketch-studio-link-hydrate-ssr-ui.test.tsx.txt` byte for byte.
- It has the same mocks and environment as `studio-link-hydrate-ui.test.tsx`: the reversed demo collection, the viewport stub and the fake audio classes.
- **Only one row, LH3,** so its hydration is the only one in that React load. LH3 keeps its round-297 assertions and adds two:
  - `firstOptionSourceId()` is not `demo-middle-east`, so the reorder is real in this file too;
  - `selectedSourceId()` is `demo-middle-east` after hydration.
- It uses the narrowed regex (S2) and tracked unmounts (S3).
- It keeps the `muted` tolerance and the `≤ 1` count. The `muted` warning is the real product mismatch GATE297-S5.

### 3.2 `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` [K5]
Replace it with `b-round-297/sketch-studio-link-hydrate-ui.test.tsx.txt` byte for byte. Its diff:
- LH3 and the now-unused `hydrationWarnings` helper are removed.
- `hydrateRoute` returns an idempotent unmount and records it in `mountedRouteUnmounts`.
- `afterEach` calls each remaining unmount first.

LH1, LH2 and LH4 are unchanged.

### 3.3 Doc 220: `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` [K8]
Replace it with `b-round-297/sketch-220-studio-link-deep-link.md.txt` byte for byte. Its diff:
- l.4 becomes exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests rounds 297–298)` (L28).
- `## შეცვლილი ფაილები`: the hydrate-ui line notes the round-298 change, and the new file is listed.
- `## ტესტირება`: the LH3 sentence no longer claims "hydration warning-ის გარეშე" [K8]. A new paragraph explains:
  - the per-load flag;
  - the split, the narrowed regex and the unmounts;
  - mutants h/e/g and identity order;
  - the GATE297-S5 limit.
- `## TODO`: "STUDIO-LINK-b (რაუნდი 299)", and one GATE297-S5-VIDEO-MUTED-SSR line.

The 7 TEMPLATE headings stay in order. Every cited id exists in `backlog.json`.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` | new (§3.1), byte-equal to the sketch |
| `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` | §3.2, byte-equal to the sketch |
| `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` | §3.3, byte-equal to the sketch |

**Frozen:** every other entry of `b-round-297-r298-tree-sha256.txt`. That includes:
- `app/routes/studio-lab.tsx`, `app/components/arrangement/ArrangementLibrary.tsx` and `ArrangementVideoDock.tsx`;
- `studio-link-ui.test.tsx` and `studio-narrow-gate-ui.test.tsx` (its NG9 `muted` tolerance stays [K9]);
- `package.json` and the lock file;
- the 7 protected files [K4].

**L23 sweep:** the new file name is referenced nowhere in `app perf e2e` [K6]. The removed helper `hydrationWarnings` was file-local. No other test imports either test file.

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §Baseline deltas).
- `npm run typecheck` (rc 0) and `npm run lint`. `npx biome check` on both test files must report no finding.
- **Covering set** (`npx vitest run`, 7 files, all in `app/lib/arrangement/__tests__/`):
  - `studio-link-hydrate-ssr-ui.test.tsx`
  - `studio-link-hydrate-ui.test.tsx`
  - `studio-link-ui.test.tsx`
  - `studio-narrow-gate-ui.test.tsx`
  - `ssr-layout-effect.test.tsx`
  - `studio-theme-obsidian.test.tsx`
  - `default-track-names-ssr.test.tsx`

  Expected: **7 files, 58 tests**, all passing (B's log).
  - **L11:** report every test above 50 % of its timeout. B's slowest row was NG5 at 2,062 ms (15 s timeout) and LH3 at 568 ms. Gate 297's `verify.log` has narrow-gate at 4,535 ms for 16 tests.
  - Report any stderr in LH3 other than the `muted` warning and the server-render `useLayoutEffect` warnings.
- **Mutants,** on a scratch copy only (`git archive` of HEAD). Give its `vitest.config.ts` its own `cacheDir` (INFO-C297-03). Never edit the store's app files. Run the two LH files, restore after each mutant, and `cmp`.
  - **(h)** `python3 b-round-297/mutant-h-option-mismatch.py <scratch>` → **LH3 red** (B: 1 failed of 4; the failing value names `data-probe`).
  - **(e)** Delete `initialSelectedSourceId={previewSourceId}` from the route → **LH1 and LH3 red** (B: 2 of 4).
  - **(g)** Delete `previewFocusSettledRef.current = true;` → **LH4 red** (B: 1 of 4).
  - **(i), informational:** in the new file, move `vi.spyOn(console, 'error')` above `mountServerHtml()`. LH3 stays green, because the narrowed regex no longer matches the server-only warning (B: 1 of 1 green).
- `npm run build` and the full suite are gate rows.
- **code-reviewer:** run it (3 paths). Pass its findings and Architecture note to B.

## 6. Acceptance (C)
**How to run the browser rows:** Playwright Chromium, fresh contexts with empty storage. Load each page once, untimed, first (L38). Both viewports, 1440×900 and 1280×720.
- **Run C's mutants before the browser rows,** or give the scratch its own `cacheDir`. This is a precaution against repeating INFO-C297-03; a slow warm-up for another reason is environment, not a planning FAIL.

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Equal to `claims-298-output.txt`, except: K2 3 lines; K3 rc 1 only on the two §4 modified paths; K5, K6, K8 and K10 exactly as in `claims-298-after-sketch.txt`. |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly the 3 §4 paths. `sha256sum -c` fails only on the 2 modified paths. The 7 protected files, `studio-lab.tsx`, `ArrangementLibrary.tsx` and `ArrangementVideoDock.tsx` are unchanged. Each of the 3 files is `cmp`-equal to its sketch. |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 7 files and 58 tests pass. LH3 runs from the new file, and LH1, LH2 and LH4 from the old one (by name). None is above 50 % of its timeout. |
| UNIT-MUTANTS | C's own scratch copy | (h) turns LH3 red. (e) turns LH1 and LH3 red. (g) turns LH4 red. (i) is reported (green expected). **Control:** (h) applied with the HEAD version of `studio-link-hydrate-ui.test.tsx` gives 4/4 green, which reproduces F1. Each restore is `cmp`-equal. |
| UNIT-VACUITY (L52) | C's own scratch copy | In the new file, drop `.reverse()` from the mock, with the route unmutated. **LH3 turns red** on its `firstOptionSourceId` assertion (B: `vacuity-identity-order.log`). Restore. |
| UNIT-CLEANUP (S3) | code reading + one run | `afterEach` in both files unmounts every root that `hydrateRoute` returned, before `document.body.innerHTML = ''`. A second call of the returned unmount is a no-op (it nulls `root` first). |
| B-COLD-DEEPLINK | direct cold load of `/studio-lab?preview=middle-east` at both viewports, after the untimed warm-up | Wait for `Demo collection ready` (L48). `document.activeElement` is the `role=option` `demo-middle-east`, with `aria-selected="true"`. 0 page errors, and 0 console errors or hydration warnings apart from the expected cloud cart / `ERR_CONNECTION_REFUSED`. This equals C round 297's row. Then plain `/studio-lab`: focus BODY, same selection. |
| G298-AUTH | fresh context | `/studio-lab` loads anonymously at 1440×900, with the workspace and the demo badge, and `auth_user` null. `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`. `/api/studio-token` GET returns 401 with no token in the body. |
| DOC-220 | doc | l.4 is exactly as §3.3. The 7 TEMPLATE `## ` headings are still in order (L26). Both test files are listed. "hydration warning-ის გარეშე" is gone [K8]. "STUDIO-LINK-b (რაუნდი 299)" is present. Every cited id exists. |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows. |

**Not re-run:** the other round-296 browser rows, because no app source changes.

**Adjacent behaviour that could break:** none in the app. The risk is a vacuous or flaky test, which UNIT-MUTANTS, UNIT-VACUITY and the timing check cover.

**Ableton conformity:** not applicable (test-only).

## 7. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-298.md`, and change nothing else, if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- mutant (h) or (e) leaves LH3 green, (e) leaves LH1 green, or (g) leaves LH4 green;
- the change needs any path outside §4, or any edit to a frozen or protected file;
- Biome reports a finding on either test file;
- after the change, any line other than the allowed deltas differs from `claims-298-output.txt`.

## 8. Deliverables
- **A:** `a-round-298.md` containing:
  - the changed files;
  - the claims before and after;
  - the covering-run counts and timings, plus any LH3 stderr;
  - typecheck, lint and Biome;
  - the mutant results;
  - the reviewer's findings and Architecture note.

  A STOP goes at the top.
- **C:** `c-round-298.md` and `c-round-298.json`, with evidence under `c-round-298/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish the 3 paths after C PASS and the gate.

## 9. Claims (`b-round-297/claims-298.sh`; expected `b-round-297/claims-298-output.txt`; after-sketch `b-round-297/claims-298-after-sketch.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `77d5341`; gate 297 `published 77d5341` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1167 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `studio-link-hydrate-ui.test.tsx`: rows LH1–LH4; `hydrationWarnings` helper 1; old regex 1; `mountedRouteUnmounts` 0 |
| K6 | the new file is absent; SWEEP: 0 references to `studio-link-hydrate-ssr` in `app perf e2e` |
| K7 | react-dom 18.3.1; one `var didWarnInvalidHydration = false;` declaration |
| K8 | doc 220: the l.4 text; "STUDIO-LINK-b (რაუნდი 297)" 1; "hydration warning-ის გარეშე" 1; GATE297-S5-VIDEO-MUTED-SSR 0 |
| K9 | the video dock has 2 bare `muted` JSX lines; NG9's `muted` tolerance is present once |
| K10 | line counts: hydrate-ui 206, ssr 0, doc220 78 |
| K11 | B's artifacts exist (14 paths) |
