# Round 299: STUDIO-LINK-a4. Test-only fix-up: make the hydration checks whole (every React hydration warning, no `muted` tolerance)

**Planned by:** B, at the round 298 → 299 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z764:** round 298 is **C PASS** (9 rows), and gate 298 published `ece19e3`. STUDIO-LINK-a3 is **მზადაა** for its own rows. GATE297-F1 is only **partly** closed, because C found C-R298-01 (Medium).
- **D-29z765:** rulings on A's reviewer, the gate-298 review and C's info notes (§2).
- **D-29z766:** this round. C-R298-01 is Medium, so the bug gate (2026-10-23) puts it before new scope. GATE297-S5 is pulled forward and re-classified as a **jsdom-only gap** (§1). The fix is test-only. STUDIO-LINK-b moves to round 300.
- **D-29z767:** lessons L52 and L56 amended.
- **D-29z768:** order after this round. Regression is not due until 2026-11-02, and RETRO is at round 305.
- **Test-only round:** there is no reference-first, product-designer or screen-budget section, as in D-29z755. C still runs real-browser rows: a dock regression row, the deep-link row and the auth row.

**Owner:** A. **Verifier:** C. **Grants:** §4 (4 paths: 3 test files and doc 220).
- **No app source changes.** No route, context, component, auth, cart, checkout, purchase or protected file is touched.
- `/studio-lab` stays public and needs no backend. `/studio/$productId` stays protected.

## Baseline: HEAD `ece19e3` [K1], clean tree [K2]
- Gate 298 is `published`, with commit `ece19e3` [K1]. `git status` is empty [K2].
- **Frozen list:** `b-round-298-r299-tree-sha256.txt`. It has 1,168 entries, hashed from `git ls-files` at HEAD; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-298/claims-299.sh` **before editing**. Its output must equal `b-round-298/claims-299-output.txt`. Any difference is a STOP (§7).
- **Allowed deltas after the change:** exactly `b-round-298/claims-299-after-sketch.txt`, which is the same script run on B's sketch-applied scratch copy. In the real tree:
  - K1 stays the HEAD line.
  - K2 becomes 4 lines.
  - K3 becomes rc 1, failing only on the 4 §4 paths.
  - K5, K6, K8, K9 and K10 change exactly as in the after-sketch file.
  - K4, K7 and K11 must be identical.

## 0. Read first
1. `lessons.md` (every role). These bind this round: L11, L23, L29, L52 and L56. B amended two of them at this planning: L52 gains the once-only-flag clause, and L56 gains the `*.patch.txt` clause. C also follows L25 (file chooser) and L38.
2. This task.
3. B's sketch, pre-run on a scratch copy. `/tmp/b299-scratch` is a `git archive` of `ece19e3`, with `node_modules` symlinked and **its own Vite `cacheDir`** (`/tmp/b299-vite-cache`, set only in the scratch `vitest.config.ts`). The store tree was not touched. The scratch does not survive the job, so the artifacts are the files under `b-round-298/`:
   - **Full files to copy byte for byte:**
     - `sketch-studio-link-hydrate-ssr-ui.test.tsx.txt`
     - `sketch-studio-link-hydrate-ui.test.tsx.txt`
     - `sketch-studio-narrow-gate-ui.test.tsx.txt`
     - `sketch-220-studio-link-deep-link.md.txt`

     The 3 test files are Biome-formatted.
   - `sketch.patch.txt`: the four diffs together, for reading only. The dock is unchanged, so the patch has no entry for it.
   - `sketch-covering-run.log`: 7 files, 58 tests passing.
   - `sketch-tsc.log`: rc 0.
   - The mutant scripts, logs and runner `run-mutant.sh` (§5).
4. A's primitives and templates: `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`.

## 1. Why
Round 298 put LH3 alone in its own file, so React's one-per-load hydration warning (`didWarnInvalidHydration`) could reach it. Three gaps remain.

### Gap 1, the regex (C-R298-01, Medium)
LH3 matched only `/did not match|Expected server HTML|Hydration failed/i`. React 18.3.1 sets the flag at **7 sites** [K7]:

| Message | Sites |
|---|---|
| "…did not match…" (prop or text) | 2 |
| "Extra attributes from the server" | 1 |
| "Did not expect server HTML…" | 2 |
| "Expected server HTML…" | 2 |

React also throws "Hydration failed…" on a structural mismatch.
- C's mutant (x) added an attribute only on the server, and LH3 stayed green.
- B's control run on unmodified `ece19e3` shows that **NG9 had the same gap**: all 20 tests stay green under (x) (`mutant-control-x-at-head.log`).

### Gap 2, the `muted` warning (GATE297-S5): a jsdom gap, not a product bug
B re-measured this at planning:
- The server HTML **does** carry `muted=""` on both `<video>` elements. B checked with a `curl` of `:5173/studio-lab`.
- React compares `muted` as a **property**.
- jsdom does not set `.muted` from the attribute: after both `innerHTML` and the parser it reads `muted false` and `defaultMuted true` [K9].
- Chromium does set it, per the HTML spec. That is why C round 298 saw **0** hydration warnings in the browser.

So the warning appeared only in the jsdom tests. There it used up the flag, which caused two things:
- LH3 and NG9 had to tolerate one `muted` warning, and that tolerance could never fail (A-R298-REVIEW-5);
- any mismatch that hydrates **after** the dock was invisible (A-R298-REVIEW-3). B's control run proves it: mutant (v), an attribute that only the server puts on the standby `<video>`, stays 20/20 green at HEAD.

**The fix is a test helper, `applyBrowserParsedMutedState(container)`.** It sets `video.muted = video.defaultMuted` on the server HTML before `hydrateRoot`, which is what the browser parser does. LH3 calls it through `mountServerHtml`, and NG9 calls it inline.

**B's rejected first option:** `suppressHydrationWarning` on the two `<video>` in `ArrangementVideoDock.tsx`. B pre-ran it, and it works, but it changes production code for a gap in the test environment, and it would also hide real future attribute mismatches on `<video>`.

### Gap 3, cleanup (GATE298-S3 = A-R298-REVIEW-4, Low)
`hydrateRoute` registered the unmount only after `await act(...)`, so a throw inside hydration left a root mounted. It is fixed here because the round owns those lines.

### After this round
- LH3 and NG9 assert **no** hydration warning at all (`toEqual([])`), and the filter covers every emitter site (L52).
- LH1 and NG9c still print the jsdom `muted` warning. They neither check warnings nor use the helper, and the doc says so.

A user sees no change, so there is no user-facing promise row (L55 does not apply).

## 2. Rulings on round 298, gate 298 and the reviewers (L10)
| Item | Ruling |
|---|---|
| Round 298 | **C PASS.** 9 rows passed, 0 failed, 0 blocked; `browserVerified` and `realVerified` are true. CLAIMS was not passed on K11 only, and that origin is B (C-R298-02). Gate 298 published `ece19e3` (review 8/10, COMMIT OK; verify 229 files and 3,416 tests). |
| GATE297-F1 | **Partly closed.** Prop-value and structural mismatches before the dock have been caught since round 298 (mutants h and y). The attribute gap is C-R298-01, this round. |
| GATE297-S2 | **Closed.** Mutant (i) stays green with the narrowed regex, and with the widened regex too (B's (i) is green). |
| GATE297-S3 | **Closed** for completed hydrations. The throw-inside-`act` remainder is GATE298-S3, this round. |
| INFO-C297-01 | **Closed:** doc 220 said round 299. This round changes it to 300. |
| C-R298-01 = A-R298-REVIEW-1 | **Medium, this round** (§3.1, §3.3). |
| C-R298-02 (K11: `sketch.patch` lost to `.gitignore`) | **Low, origin B, closed by method.** This round's diff is `sketch.patch.txt`, and L56 is amended. |
| GATE297-S5-VIDEO-MUTED-SSR | **This round, re-classified as jsdom-only** (§1, Gap 2). It is fixed by the test helper, with no production change. |
| A-R298-REVIEW-2 (structural mismatches might reach only `onRecoverableError`) | **Closed.** C's mutant (y) reached `console.error` under jsdom ("Hydration failed…") and turned LH3 red. B's (y) turns LH3, NG9 and NG9c red. |
| A-R298-REVIEW-3 (LH3 depends on library-before-dock order) | **Closed by this round.** Mutant (v), a dock attribute, is red after the fix and green at HEAD. |
| A-R298-REVIEW-4 = GATE298-S3 | **Low, this round** (§3.1, §3.2). |
| A-R298-REVIEW-5 (the `≤ 1` assertion cannot fail) | **This round:** the line is removed. |
| A-R298-REVIEW-6 ("one hydration per file" has no guard) | **Low, `deferred_low_polish`.** It is an input to A-R298-ARCH-HYDRATE-HARNESS. |
| A-R298-REVIEW-7 = INFO-C298-02 = gate-298 S1 (doc 220 overstates) | **This round's doc grant** (§3.4). |
| Gate-298 S4 (`installViewportStub` return unused) | **Low, `deferred_low_polish`** (GATE298-S4-UNUSED-STUB-RETURN). |
| Architecture note (A + gate-298: about 120 duplicated lines in the two hydrate files) | **Recorded as A-R298-ARCH-HYDRATE-HARNESS, not scheduled.** It joins ROOT-RECON-GRID-HARNESS as one input to the frontend-architect checkpoint that B requests at the STUDIO-LINK-b / NAME-AND-HINT boundary. |
| INFO-C298-01 (`/middle-east.mp3` `ERR_ABORTED`; the server returns 200) | **Signal only,** pre-existing. C keeps logging it as environment. |

## 3. What A changes

### 3.1 `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` [K6, K9]
Replace it with the sketch byte for byte. The diff:
- A named constant `HYDRATION_WARNING_PATTERN = /did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i`, used by `hydrationWarnings`.
- A new file-local `applyBrowserParsedMutedState(container)`, called in `mountServerHtml` after `innerHTML` and before `appendChild`.
- LH3 asserts `expect(hydrationWarnings(consoleError.mock.calls)).toEqual([])`. The `args[1] !== 'muted'` filter and the `toBeLessThanOrEqual(1)` line are removed.
- `hydrateRoute` builds the unmount and pushes it to `mountedRouteUnmounts` **before** `await act(...)`. The unmount is unchanged and idempotent.
- The describe title reads "(rounds 298-299)".

All of LH3's other assertions are unchanged: server `aria-selected`, not first, selected, focused, and `aria-selected` on focus.

### 3.2 `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` [K5]
Replace it with the sketch byte for byte. The only diff is the `hydrateRoute` reorder from §3.1. LH1, LH2 and LH4 are unchanged, and this file does not get the helper.

### 3.3 `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` (NG9 only) [K9]
Replace it with the sketch byte for byte. The diff:
- the same file-local `applyBrowserParsedMutedState`, placed before `testId`;
- NG9 calls it after `container.innerHTML = html`;
- NG9's filter `/hydrat|did not match|didn't match/i` becomes the full pattern from §3.1;
- the `muted` filter and the `≤ 1` line are removed, and the row asserts `expect(hydrationWarnings).toEqual([])`.

Every other NG row, NG9c included, and the mocks are unchanged. The spy is still created after `renderToString`, so the server-only `useLayoutEffect` warnings are not counted.

### 3.4 Doc 220: `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` [K8]
Replace it with `b-round-298/sketch-220-studio-link-deep-link.md.txt` byte for byte. The diff:
- **l.4:** exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests rounds 297–299)` (L28).
- **`## შეცვლილი ფაილები`:** the narrow-gate line and both hydrate lines note round 299.
- **`## პრობლემები და გადაწყვეტები`:** a new Problem → Solution for the jsdom `muted` gap. It covers:
  - the server attribute;
  - the property comparison;
  - jsdom versus Chromium;
  - the helper;
  - why `suppressHydrationWarning` was rejected.
- **`## ტესტირება`:**
  - l.68 names the round-296 set and adds the rounds 298–299 set (7 files, 58 tests);
  - the cleanup sentence is narrowed to "every root whose hydration completed" (gate-298 S1);
  - the round-298 limit sentence is rewritten in the past tense, naming C-R298-01;
  - a new round-299 paragraph covers the regex, zero tolerance, the helper, unmount before hydration, the mutants (x, v, y, h, r, r2, e, g and reorder) and the note that LH1/NG9c do not check warnings.
- **`## TODO`:**
  - "STUDIO-LINK-b (რაუნდი 300)";
  - the GATE297-S5 line becomes an A-R298-ARCH-HYDRATE-HARNESS signal line.

The 7 TEMPLATE headings stay in order. Every cited id exists in `backlog.json`.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` | §3.1, byte-equal to the sketch |
| `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` | §3.2, byte-equal |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | §3.3, byte-equal |
| `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` | §3.4, byte-equal |

**Frozen:** every other entry of `b-round-298-r299-tree-sha256.txt`. That includes:
- **`app/components/arrangement/ArrangementVideoDock.tsx`** [K9/K10: unchanged; no `suppressHydrationWarning` anywhere in `app`];
- `app/routes/studio-lab.tsx`, `ArrangementLibrary.tsx` and `StudioWorkspace.tsx`;
- every other test file;
- `package.json` and the lock file;
- the 7 protected files [K4].

**L23 sweep:**
- `applyBrowserParsedMutedState` and `HYDRATION_WARNING_PATTERN` are file-local and are not exported.
- No other test imports these files.
- No other test asserts on the `muted` tolerance [K9].

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §Baseline deltas).
- `npm run typecheck` (rc 0) and `npm run lint`. `npx biome check` on the 3 test files must report no finding.
- **Covering set:** `npx vitest run` on 7 files, all in `app/lib/arrangement/__tests__/`:
  - `studio-link-hydrate-ssr-ui.test.tsx`, `studio-link-hydrate-ui.test.tsx`
  - `studio-link-ui.test.tsx`, `studio-narrow-gate-ui.test.tsx`
  - `ssr-layout-effect.test.tsx`, `studio-theme-obsidian.test.tsx`
  - `default-track-names-ssr.test.tsx`

  Expected: **7 files, 58 tests**, all passing (B's log).
  - **L11:** report every test above 50 % of its timeout. B's slowest were NG5 at 2,091 ms (timeout 15 s), LH3 at 855 ms and LH1 at 761 ms.
  - **stderr:** the only lines that may match the §3.1 pattern are the jsdom `muted` warning under LH1 and NG9c. Report any other, and **any** match under LH3 or NG9.
- **Mutants,** on a scratch copy only. Make a `git archive` of HEAD with A's 4 files applied, and give its `vitest.config.ts` its own `cacheDir`. Never edit the store's app files.
  - **How to run:** `bash b-round-298/run-mutant.sh <scratch> <name> <script>`. It runs the two LH files plus `studio-narrow-gate-ui.test.tsx`, then restores `app/` and checks it is equal.
  - **Expected** (B's logs `mutant-<name>.log`):

| Mutant | Script | Expected |
|---|---|---|
| (x) server-only attribute on the library option | `mutant-x-extra-attr.py` | **LH3 and NG9 red** |
| (v) server-only attribute on the standby `<video>` | `mutant-v-dock-extra-attr.py` | **LH3 and NG9 red** |
| (y) server-only extra node | `mutant-y-extra-node.py` | **LH3, NG9 and NG9c red** |
| (h) differing value | `../b-round-297/mutant-h-option-mismatch.py` | **LH3 and NG9 red** |
| (r) LH3 without the helper call | `mutant-r-no-shim-ssr.py` | **LH3 red** |
| (r2) NG9 without the helper call | `mutant-r2-no-shim-ng9.py` | **NG9 red** |
| (e) | `mutant-e-no-prop.py` | **LH1 and LH3 red** |
| (g) | `mutant-g-no-settle.py` | **LH4 red** |
| (i), informational | `mutant-i-spy-before-render.py` | green (20/20) |

- `npm run build` and the full suite are gate rows.
- **code-reviewer:** run it (4 paths). Pass its findings and Architecture note to B.

## 6. Acceptance (C)
**How to run the browser rows:**
- Use Playwright Chromium, with fresh contexts and empty storage, at both viewports (1440×900 and 1280×720).
- Load each page once, untimed, first (L38).
- Run the jsdom mutants **before** the browser rows, or give their scratch its own `cacheDir`.
- The console probe collects `pageerror`, plus every console error or warning matching `/did not match|Extra attributes|Did not expect server HTML|Expected server HTML|Hydration failed|hydrat/i`.

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Equal to `claims-299-output.txt`, except the §Baseline deltas: K2 4 lines; K3 rc 1 only on the 4 §4 paths; K5, K6, K8, K9 and K10 exactly as in `claims-299-after-sketch.txt`. K11 is all `ok` (30 artifacts). |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly the 4 §4 paths. `sha256sum -c` fails only on those 4. Unchanged: the 7 protected files, `ArrangementVideoDock.tsx`, `studio-lab.tsx`, `ArrangementLibrary.tsx` and `StudioWorkspace.tsx`. Each granted file is `cmp`-equal to its sketch. |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 7 files and 58 tests pass, and none is above 50 % of its timeout. No stderr line under LH3 or NG9 matches the §3.1 pattern. The jsdom `muted` warning appears only under LH1 and NG9c. |
| UNIT-MUTANTS | C's own scratch copy | Every §5 expectation holds: x, v, y, h, r, r2, e and g are red on the named rows, and (i) is reported (green expected). **Controls:** (x) and (v), each applied to a scratch of unmodified `ece19e3`, give 20/20 green. That reproduces C-R298-01 and A-R298-REVIEW-3. Every restore is `cmp`-equal. |
| UNIT-VACUITY (L52) | C's own scratch copy | `vacuity-identity-order.py` drops `.reverse()` in the ssr file, with the route unmutated. **LH3 turns red** on its `firstOptionSourceId` assertion. Restore. |
| UNIT-CLEANUP (GATE298-S3) | code reading + one run | In both hydrate files, `mountedRouteUnmounts.push(unmount)` comes before `await act(` [K5/K6 `push-before-act 1`]. `afterEach` calls every tracked unmount before `document.body.innerHTML = ''`. A second call of the unmount is a no-op. |
| JSDOM-MUTED-PREMISE | one `node` check + one `curl` + one browser evaluate | jsdom: `<video muted="">` set through `innerHTML` reads `muted false`, `defaultMuted true` [K9]. `curl :5173/studio-lab`: both `<video` tags carry `muted=""`. **Chromium** (Playwright page): `new DOMParser().parseFromString('<video muted=""></video>','text/html').querySelector('video').muted` is `true`. This row measures both halves of the Gap 2 premise. |
| B-DOCK-MUTED (regression, both viewports) | cold `/studio-lab`, then try a video | **Pass criterion, step 1:** after `Demo collection ready` (L48), both `[data-testid="arrangement-video"]` report `.muted === true`, with 0 page errors and 0 probe matches. **Step 2, conditional:** read `document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')`. If it is empty, the Playwright Chromium build cannot decode H.264. Record it as environment and skip steps 3–4; that is neither FAIL nor PASS, and step 1 still decides the row. **Step 3:** add `public/videos/hero/1.mp4` through `arrangement-video-input` (L25 file chooser). **Step 4:** play with Space for about 2 s, then Stop. During play the active `<video>`'s `currentTime` advances by more than 0.5 s, both `<video>` stay `.muted === true`, and there are 0 probe matches. This row is regression-only: no app source changed. |
| B-COLD-DEEPLINK | direct cold load of `/studio-lab?preview=middle-east` at both viewports, after the warm-up | Wait for `Demo collection ready` (L48). `document.activeElement` is the `role=option` `demo-middle-east`, with `aria-selected="true"`. Expect 0 page errors and 0 probe matches. The only console errors allowed are the expected cloud cart / `ERR_CONNECTION_REFUSED` and INFO-C298-01. Then load plain `/studio-lab`: focus is on BODY, with the same selection. |
| G299-AUTH | fresh context | `/studio-lab` loads anonymously at 1440×900, showing the workspace and the demo badge, with `auth_user` null. `/studio/middle-east` shows `Sign in required`, with 0 `audio[src]`. `GET /api/studio-token` returns 401 with no token in the body. |
| DOC-220 | doc | l.4 is exactly as in §3.4. The 7 TEMPLATE `## ` headings are still in order (L26). All 3 test files are listed. "row-ის ჩავარდნის შემთხვევაშიც" is gone, and "STUDIO-LINK-b (რაუნდი 300)" is present [K8]. The jsdom/Chromium statement matches the two measurements in JSDOM-MUTED-PREMISE. Every cited id exists in `backlog.json`. |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows. |

**Adjacent behaviour that could break:** none in the app. The risk is a vacuous test, or one that over-matches. UNIT-MUTANTS, the controls, UNIT-VACUITY and mutant (i) cover it.

**Ableton conformity:** not applicable (test-only).

## 7. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-299.md`, and change nothing else, if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- any §5 mutant gives a result other than expected: a mutant that should be red stays green, or (i) turns red;
- the change needs any path outside §4, or any edit to a frozen or protected file;
- Biome reports a finding on a granted test file;
- after the change, any line other than the allowed deltas differs from `claims-299-output.txt`.

## 8. Deliverables
- **A:** `a-round-299.md` containing:
  - the changed files;
  - the claims before and after;
  - the covering-run counts and timings, plus any matching stderr;
  - typecheck, lint and Biome;
  - the mutant table;
  - the reviewer's findings and Architecture note.

  A STOP goes at the top.
- **C:** `c-round-299.md` and `c-round-299.json`, with evidence under `c-round-299/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` for each finding.
- **Root:** publish the 4 paths after C PASS and the gate.

## 9. Claims (`b-round-298/claims-299.sh`; expected `b-round-298/claims-299-output.txt`; after-sketch `b-round-298/claims-299-after-sketch.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `ece19e3`; gate 298 `published ece19e3` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1168 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | hydrate-ui: rows LH1, LH2, LH4; push-before-act 0 |
| K6 | ssr: row LH3; full regex 0; `muted` tolerance 1; `≤ 1` line 1; push-before-act 0 |
| K7 | react-dom 18.3.1; 7 `didWarnInvalidHydration = true;` sites; emitters: did-not-match 2, extra-attr 1, did-not-expect 2, expected 2, hydration-failed 1 |
| K8 | doc 220: the l.4 text; "STUDIO-LINK-b (რაუნდი 299)" 1, "(რაუნდი 300)" 0; "9 ფაილი, 89 ტესტი" 1; "row-ის ჩავარდნის შემთხვევაშიც" 1; C-R298-01 0 |
| K9 | dock: 2 bare `muted` lines; `suppressHydrationWarning` in `app` 0; NG9 `muted` tolerance 1; NG9 full regex 0; helper calls ssr 0, narrow-gate 0, hydrate-ui 0; jsdom `<video muted="">`: attr true, `muted` false, `defaultMuted` true |
| K10 | line counts: hydrate-ui 188, ssr 186, narrow-gate 441, dock 1003, doc220 82 |
| K11 | B's artifacts exist (30 paths under `b-round-298/`) |
