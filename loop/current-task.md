# Round 297: STUDIO-LINK-a2. Test-only fix-up: prove the `?preview=` route wiring and the SSR → hydrate path

**Planned by:** B, at the round 296 → 297 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z752:** round 296 is **C PASS**, and gate 296 published `bc9d9a7`. STUDIO-LINK-a is **მზადაა**.
- **D-29z753:** this round. Two **Medium** findings from A's round-296 code-reviewer are open: A-R296-REVIEW-1 and A-R296-REVIEW-2. The bug gate (2026-10-23) fixes Medium findings before new scope. They and A-R296-REVIEW-5 are three tightly related test gaps in one effect. STUDIO-LINK-b moves to round 298.
- **D-29z754:** rulings on C-R296-01, C-R296-02, A-R296-REVIEW-6 and the gate-296 suggestions (§2).
- **D-29z755:** this is a test-only round, so it has no reference-first, product-designer or screen-budget section. C still runs one small real-browser row and the auth row.
- **D-29z756:** no newer root review or Saba decision file exists. Regression is not due (2026-11-02). RETRO is at round 305.
- **D-29z757:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4 (2 paths).
- **No app source changes.** No route, context, component, auth, cart, checkout, purchase or protected file is touched.
- `/studio-lab` stays public and needs no backend. `/studio/$productId` stays protected.

## Baseline: HEAD `bc9d9a7` [K1], clean tree [K2]
- Gate 296 is `published`, with commit `bc9d9a7` [K1]. `git status` is empty [K2].
- **Frozen list:** `b-round-296-r297-tree-sha256.txt`. It has 1,166 entries, hashed from `git ls-files` at HEAD; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-296/claims-297.sh` **before editing**. Its output must equal `b-round-296/claims-297-output.txt`. Any difference is a STOP (§7).
- **Allowed deltas after the change** (from `b-round-296/claims-297-after-sketch.txt`, the same script on B's sketch-applied scratch copy; its K1/K2/K3 lines are meaningless there because the scratch copy is not a git repo):
  - K2: 2 lines;
  - K3: rc 1, failing only on `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md`;
  - K8: exactly the new l.4 from §3.2;
  - K9: `LH 4; hydrate test file exists 1; studio-lab-demo vi.mock sites 1`;
  - K10: `doc220` may change, while `link-ui` stays 209.

  Every other line (K1, K4–K7, K11) must be identical.

## 0. Read first
1. `lessons.md` (every role). These bind this round: L11, L23, L29, L52 and L56. For C, also L18 and L38.
2. This task.
3. B's sketch, pre-run on a scratch copy. `/tmp/b297-scratch` is a `git archive` of `bc9d9a7` with `node_modules` symlinked; the store tree was not touched. It does not survive the job; the artifacts are the files under `b-round-296/`.
   - **`b-round-296/sketch-studio-link-hydrate-ui.test.tsx.txt`** is the full new test file, already Biome-formatted. A copies it **byte for byte** to `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx`.
   - **Covering run:** `b-round-296/sketch-covering-run.log` has 6 files and 58 tests passing.
   - `b-round-296/sketch-tsc.log`: `tsc --noEmit` rc 0. Biome on the new file: no finding.
   - **Mutants** on the route: `b-round-296/mutant-{e-no-prop,f-no-iswide,g-no-settle}.log` (§5).
4. A's primitives and templates: `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`.

## 1. Why
STUDIO-LINK-a passed C in the real browser. Its unit proof had three gaps, which A's code-reviewer found and A's mutant (e) confirmed:
- **A-R296-REVIEW-2 (Medium).** You can delete `initialSelectedSourceId={previewSourceId}` from the route and every LK test stays green. That is because `demo-middle-east` is `sources[0]` of the real demo collection, so "selected" is also true by default. LK5's focus uses `previewSourceId` directly and does not depend on the prop.
- **A-R296-REVIEW-1 (Medium).** LK5–LK7 use `createRoot`, where the route is already hydrated on its first commit. A real cold load goes through `renderToString` → `hydrateRoot`: the server marks the selection, and the effect focuses the option at the first *hydrated* commit. No unit test covers that path. C's cold-load browser row covered it in round 296.
- **A-R296-REVIEW-5 (Low).** LK7 cannot fail on the narrow guard.

This round closes them with tests only. A user sees no change, so there is no user-facing promise row (L55 does not apply). The proof is that the new rows **fail when the wiring is broken** (§5 mutants).

## 2. Rulings on round 296 and gate 296 (L10)
| Item | Ruling |
|---|---|
| Round 296 | **C PASS.** 15 rows passed, 1 failed, 0 blocked. B-SCREEN-BUDGET failed only on B's own threshold (below). `browserVerified` and `realVerified` are true. Gate 296 published `bc9d9a7` (review 9/10, COMMIT OK). STUDIO-LINK-a is **მზადაა**. |
| C-R296-01 (Low, origin B): the sidebar grows 37.59 px, above the ≤ 32 px budget | **Closed as B spec arithmetic.** B measured the 20 px link box, not the 25.59 px `<p>` line box plus `mt-3`. C's evidence shows the only growth is the justified new line; nothing else moves. The budget is corrected to the measured line box, which is the option C offered. STORE-4 re-measures when it restyles the sidebar. |
| C-R296-02 (Low): after a mouse click, the landing option is focused but shows no ring | **`deferred_low_polish`, plus question 4 in SABA-Q-STUDIO-LINK.** B's probe (`b-round-296/probe/fv.cjs`, Chromium 143.0.7499.4): after a pointer interaction, both `focus()` and `focus({focusVisible:true})` give `:focus-visible` false, even without the project's `data-focus-source` rule. A fix would therefore need a second focus style that is not `:focus-visible`, and that conflicts with SABA-B-4's one shared focus style. So it is a question for Saba, not a hack. |
| A-R296-REVIEW-1 / -2 (Medium), -5 (Low) | **This round** (§3). |
| A-R296-REVIEW-6 (Low): no StrictMode variant | `deferred_low_polish`. |
| Gate-296 S1 (phones reach the narrow state from the link) | `deferred_low_polish` GATE296-S1-PHONE-LINK. STORE-4 owns the sidebar order. The narrow state already has the preview player. |
| Gate-296 S2 (no `prefetch="intent"`) | `deferred_low_polish` GATE296-S2-PREFETCH, a candidate for the PERF route-weight work. |
| Gate-296 S3 (`CSS.escape` once ids are dynamic) | Added as a prerequisite of STUDIO-LINK-DYNAMIC. |
| Gate-296 S4 (changing `?preview=` on a mounted route does nothing) | An explicit decision row of STUDIO-LINK-b (round 298). |
| Gate-296 S5 and the Architecture note, plus A's A-R296-ARCH-DEEPLINK-HOOK | Signal **GATE296-ARCH-ROUTE-DOM-FOCUS** ("keep"; bounded proposal: focus via the library's `optionRefs`). Not scheduled. It is an input to the frontend-architect checkpoint at the PD-REVIEW boundary. |

## 3. What A changes

### 3.1 New `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` (ids LH; the K9 sweep is 0 before)
Copy `b-round-296/sketch-studio-link-hydrate-ui.test.tsx.txt` byte for byte. Its design:
- **A separate file**, because it mocks `~/data/studio-lab-demo` with the **real collection reversed**: `importOriginal` is used, and only `sources` is reordered. That moves `demo-middle-east` off position 0. `studio-link-ui.test.tsx` must keep the real order for LK2, LK5 and LK6, so the mock cannot live there.
- Every row goes through `renderToString` → `hydrateRoot` inside `act`. This is the pattern of NG9 and NG9c in `studio-narrow-gate-ui.test.tsx`, and it uses the same viewport stub with listeners.

| Row | What it proves | Kills |
|---|---|---|
| LH1 | Wide hydrate with `?preview=middle-east` on the reordered library. The first option is **not** `demo-middle-east`. The selected option **is** `demo-middle-east`, and it is focused with `tabindex="0"`. | A-R296-REVIEW-2 (mutant e) |
| LH2 | Wide hydrate with no parameter. The selected option is the first option (not `demo-middle-east`), and focus is BODY. | control: the reorder is real and the default is unchanged |
| LH3 | The server HTML already marks `demo-middle-east` `aria-selected="true"`. After hydration the option is focused and `aria-selected="true"`. `console.error` (spied **after** `renderToString`, as NG9 does) has no hydration warning apart from the tolerated `muted` one, and at most one in total. | A-R296-REVIEW-1 (mutant e as well) |
| LH4 | Narrow hydrate with `?preview=middle-east`: the narrow heading shows and focus is BODY. Widening later focuses `arrangement-exit`, and no option is focused. | closes A-R296-REVIEW-5: mutant (f) shows the guard is equivalent; mutant (g) proves LH4 is not vacuous |

**Why the spy comes after `renderToString`:** in jsdom, React's server renderer logs "useLayoutEffect does nothing on the server … non-hydrated UI". The `/hydrat/` filter matches it. B's first sketch spied before the render and LH3 failed on that server-only warning. NG9 avoids it the same way. This is not a hydration mismatch.

### 3.2 Doc 220: `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md`
- l.4 becomes exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests round 297)` (L28).
- In `## ტესტირება`, add one short Georgian paragraph:
  - the LH1–LH4 rows;
  - the reordered collection;
  - the hydrate path;
  - mutant (e) red, (g) red, and (f) as an equivalent mutant, with the reason from §5.
- In `## შეცვლილი ფაილები`, add the new test file with "(round 297)".
- In `## TODO / შემდეგი ნაბიჯები`, add one line: GATE296-ARCH-ROUTE-DOM-FOCUS (focus via `optionRefs`) as a signal.
- No other section changes. Cite only ids that exist.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` | new (§3.1), byte-equal to the sketch |
| `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` | the §3.2 edits only |

**Frozen:** every other entry of `b-round-296-r297-tree-sha256.txt`. That includes:
- `app/routes/studio-lab.tsx`, `app/contexts/ArrangementContext.tsx` and `app/data/studio-lab-demo.ts`;
- `studio-link-ui.test.tsx` and `studio-narrow-gate-ui.test.tsx`;
- `package.json` and the lock file;
- the 7 protected files [K4].

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §Baseline deltas).
- `npm run typecheck` (rc 0) and `npm run lint`. `npx biome check` on the new test file must report no finding.
- **Covering set** (`npx vitest run`, 6 files):
  - `studio-link-hydrate-ui.test.tsx`
  - `studio-link-ui.test.tsx`
  - `studio-narrow-gate-ui.test.tsx`
  - `ssr-layout-effect.test.tsx`
  - `studio-theme-obsidian.test.tsx`
  - `default-track-names-ssr.test.tsx`

  Expected: **6 files, 58 tests**, all passing (B's log). Report every test above 50 % of its timeout (L11); B's slowest LH row took 377 ms of 15 s. Report any new `act(...)` or hydration stderr lines in the LH rows.
- **Mutants**, on a scratch copy only. Never edit the store's `studio-lab.tsx`. Run the new file plus `studio-link-ui.test.tsx`, restore after each, and `cmp`.
  - **(e)** Delete the line `initialSelectedSourceId={previewSourceId}` → **LH1 and LH3 red** (B: 2 failed of 24).
  - **(g)** Delete `previewFocusSettledRef.current = true;` → **LH4 red** (B: 1 failed of 24).
  - **(f), informational:** change `if (!isWide || previewSourceId === null` to `if (previewSourceId === null` → all green (B: 24 of 24).

    This is an **equivalent mutant**, not a gap. A hydrated narrow route returns `StudioNarrowScreen` before the workspace mounts, so the option the effect would query does not exist. The guard cannot change behaviour on any reachable path. Report the result; it is not a STOP.
- `npm run build` and the full suite are gate rows.
- **code-reviewer:** not required (2 paths), but allowed. If you run it, pass its Architecture note to B.

## 6. Acceptance (C)
**How to run the browser rows:** Playwright Chromium, fresh contexts with empty storage. Load each page once, untimed, first (L38). Both viewports, 1440×900 and 1280×720.

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Equal to `claims-297-output.txt`, except the §Baseline allowed deltas (K2 2 lines; K3 rc 1 only on doc 220; K8 the new l.4; K9 `LH 4; … 1; … 1`; K10 `doc220` only). |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly the 2 §4 paths. `sha256sum -c` fails only on doc 220. The 7 protected files and `studio-lab.tsx` are unchanged. The new test file is byte-equal to the sketch (`cmp`). |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 6 files and 58 tests pass. LH1–LH4 are present by name. None is above 50 % of its timeout. |
| UNIT-MUTANTS | C's own scratch copy | (e) turns LH1 and LH3 red. (g) turns LH4 red. (f) is reported (green expected, equivalent). Each restore is `cmp`-equal. |
| UNIT-VACUITY (L52) | C's own scratch copy | Change the reversed-collection mock to the identity order (drop `.reverse()`), with the route unmutated. **LH1 and LH2 turn red**: LH1 on its `firstOptionSourceId` assertion, LH2 on its `not.toBe(PREVIEW_SOURCE_ID)` assertion. LH3 and LH4 stay green (B: `b-round-296/vacuity-identity-order.log`, 2 failed of 4). This proves the rows cannot pass silently if the reorder ever stops being real. Restore. |
| B-COLD-DEEPLINK | direct cold load of `/studio-lab?preview=middle-east` at both viewports, after the untimed warm-up | Wait for `Demo collection ready` (L48). `document.activeElement` is the `role=option` `demo-middle-east`, with `aria-selected="true"`. 0 page errors, and 0 console errors or hydration warnings. The result equals C round 296's COLD row. Then plain `/studio-lab`: focus BODY, same selection. |
| G297-AUTH | fresh context | `/studio-lab` loads anonymously at 1440×900, with the workspace and the demo badge, and `auth_user` null. `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`. `/api/studio-token` GET returns 401 with no token in the body. |
| DOC-220 | doc | l.4 is exactly as §3.2. The 7 TEMPLATE `## ` headings are still in order (L26). The new test file is listed. LH1–LH4 and GATE296-ARCH-ROUTE-DOM-FOCUS are named, and every cited id exists. |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows. |

**Not re-run:** the other round-296 browser rows, because no app source changes. B-COLD-DEEPLINK is the one adjacent check.

**Adjacent behaviour that could break:** none in the app. The only risk is a test that is vacuous or flaky, which UNIT-MUTANTS, UNIT-VACUITY and the timing check cover.

**Ableton conformity:** not applicable (test-only).

## 7. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-297.md`, and change nothing else, if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- mutant (e) leaves LH1 or LH3 green, or mutant (g) leaves LH4 green;
- the change needs any path outside §4, or any edit to a frozen or protected file;
- Biome reports a finding on the new file;
- after the change, any line other than the allowed deltas differs from `claims-297-output.txt`.

## 8. Deliverables
- **A:** `a-round-297.md` containing:
  - the changed files;
  - the claims before and after;
  - the covering-run counts and timings, plus any stderr from the LH rows;
  - typecheck, lint and Biome;
  - the 3 mutant results.

  A STOP goes at the top.
- **C:** `c-round-297.md` and `c-round-297.json`, with evidence under `c-round-297/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish the 2 paths after C PASS and the gate.

## 9. Claims (`b-round-296/claims-297.sh`; expected `b-round-296/claims-297-output.txt`; after-sketch `b-round-296/claims-297-after-sketch.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `bc9d9a7`; gate 296 `published bc9d9a7` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1166 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | route: the prop wiring line 1, the `!isWide` guard 1, the settle line 1; 115 lines |
| K6 | `studioLabDemoCollection` export at l.156; the first demo source is `demo-middle-east` (l.45) |
| K7 | NG9's `muted` tolerance filter is present once in `studio-narrow-gate-ui.test.tsx` |
| K8 | doc 220 l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS)` |
| K9 | SWEEP: LH ids 0 in `app perf e2e`; the hydrate test file is absent; 0 `vi.mock('~/data/studio-lab-demo'` sites |
| K10 | line counts: link-ui 209, doc220 75 |
| K11 | B's artifacts exist (8 paths) |
