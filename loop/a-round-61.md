# A — Round 61 report (SRW-14 grid-menu fix-up, D-29z26)

Implementer: A (Claude Opus 5.5) · 2026-10-18 · No PASS claimed; C verifies.

## 1. Pre-flight gate and baseline

**Pre-flight gate (posted before the first edit):**
- Assumptions: case A baseline; implement §0.1 F, §0.2 K, §0.3 V literally; GM32–GM35 appended after GM31; doc 054 new.
- Smallest version: Menu +12/−2 lines, Workspace +5 lines (CRLF), tests +88 lines, doc 054.
- Files: exactly the 3 owned files + doc 054 (§3.1).
- Success: vitest 89/1556, grid-snap-menu 39 `it`, mutations a–f each killed by the named test, tsc 0, build rc 0, scoped Biome 0.

Required reading done before editing: `rules/read-primitives.md`; primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (plus DESIGN_TOKENS via the project hook); prompts studio-feature, new-test; `docs/implementation/TEMPLATE.md`; skill `pre-flight`.

**Baseline (18:39 +04, before any edit): case A.**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` = 29 lines.
- Frozen list `b-round-60-r61-tree-sha256.txt`: `grep -vc ': OK$'` → 0.
- Snapshots `SHA256SUMS.txt`: 3/3 OK; `cmp` → all three "same".
- `StudioWorkspace.tsx` EOL 1807/1807 (CRLF).
- Protected 4/4 OK. `node.exe` 12. `/studio-lab` 200, `:5199/api/products` 200.

## 2. Diff summary (vs. snapshots, `a-round-61/diff.patch`)

| File | Change | EOL (CRLF / LF) | sha256 |
|---|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | §0.1: root `onMouseDown` → `preventDefault()` only when `!(event.target instanceof Element && event.target.closest('button'))`. §0.2: named `releaseOnFreshKey(event: WindowEventMap['keydown'])` returns without release on `event.repeat`; the **same reference** is used in `addEventListener('keydown', releaseOnFreshKey, true)` and `removeEventListener('keydown', releaseOnFreshKey, true)`. `blur` unchanged (non-capture). | 0 / 212 | `96779a7d…` |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.3 only: `const openScrollTop = scroller?.scrollTop ?? 0;` when the effect arms; first statement of `closeGridMenuOnUserScroll`: `if (scroller && scroller.scrollTop !== openScrollTop) { closeGridMenu(); return; }`. Deps unchanged `[isGridMenuOpen, closeGridMenu]`. `handleTimelineScroll` untouched. | **1812 / 1812** (0 bare LF) | `49ce77b0…` |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | GM32–GM35 appended inside describe 1 after GM31. Harness, hooks, helpers, 35 existing `it` untouched. 39 `it`. | 0 / 1042 | `839847b9…` |
| `docs/implementation/2026/quarter-IV/054-studio-lab-grid-menu-focus-repeat-vscroll.md` | new (§2.5 sections, Mermaid, Ableton table, supersession sentence, narrowed trade-off) | 0 / 110 | `852bdbd5…` |

No comments, `any`, assertions, `@ts-ignore`, `.skip/.only/.todo`, retries or per-`it` timeouts added. No new UI text.

## 3. GM32–GM35

All pass on the unmutated tree (no spec-assumption stop: jsdom stores `scrollTop` 120/240; `repeat: true` reaches the listener; GM35's click returns `false`).

| ID | Alone (verbose, `grid-snap-menu` only) | 4-file run |
|---|---|---|
| GM32 C-R60-01 non-item press keeps focus; item press not prevented | 106 ms | 54 ms |
| GM33 C-R60-02 auto-repeat keeps swallow armed; fresh key releases | 109 ms | 58 ms |
| GM34 ROOT-R50-58-L1 vertical scroll during Follow closes the menu | 73 ms | 38 ms |
| GM35 blur release ignores the item blur from the focus return | 76 ms | 37 ms |

`grid-snap-menu` alone (`--reporter=verbose`, `a-round-61/alone-grid-snap-menu.txt`): 39 passed, Duration 10.20 s (tests 6.23 s). Slowest single test in that run: 700 ms; no test over 3 s.

## 4. Mutations (`a-round-61/mutations.txt`, script `a-round-61/mut.mjs`)

Scratch: `a-round-61/scratch/` (copy of `store/app`, `node_modules` junction via `cmd //c mklink /J` with stdin `/dev/null`, own `vitest.config.mts`). Command (cwd scratch): `npx vitest run --config vitest.config.mts grid-snap-keys grid-snap-menu grid-snap-ui gesture-guard --reporter=verbose`. Files restored after each (`restored=true` ×3).

| # | Mutation | Result | Failing tests | Required | Killed |
|---|---|---|---|---|---|
| none | unmutated | 91/91 | — | — | — |
| a | root `onMouseDown` removed | 1 failed | GM32 | GM32 | yes |
| b | prevent every target (`event.target instanceof Node`) | 1 failed | GM32 | GM32 | yes |
| c | `repeat` guard removed | 1 failed | GM33 | GM33 | yes |
| d | `scrollTop` check removed | 1 failed | GM34 | GM34 | yes |
| e | compare to `0` | 1 failed | GM34 | GM34 | yes |
| f | `blur` add + remove with capture `true` | 1 failed | GM35 | GM35 | yes |
| g (r60) | `onContextMenu` removed | 1 failed | GM25 | GM25 | yes |
| h (r60) | `keydown` add removed | 2 failed | GM26, GM33 | GM26 | yes |
| i (r60) | `blur` add removed | 1 failed | GM27 | GM27 | yes |
| r58a | swallow arm removed | 3 failed | GM16, GM33, GM35 | GM16 | yes |
| r58d | close on any scroll | 2 failed | GM21, GM34 | GM21 | yes |
| r59k | release calls `preventDefault` | 1 failed | GM23 | GM23 | yes |
| n (info) | 2 px tolerance | 91/91 | — | expected survive | survives (as expected) |
| p (info) | only `button === 0` prevented | 1 failed | GM32 | GM32 | yes |
| q (info) | wrapper also ignores `Shift` | 2 failed | GM26, GM33 | GM33 | yes |

## 5. Browser smoke (not a PASS claim; `a-round-61/smoke.txt`, `smoke-1440.png`)

- gstack CLI daemon started normally this time (no fallback needed). State file `a-round-61/a-browse.json`; `browse stop` printed "Unable to connect" but the state file is gone and no `browse`/`bun` process remains; `node.exe` 12 before and after.
- 1440×900, `/studio-lab` → 200. Workspace rendered (scroller present, 4 tracks), badge text „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ present, `auth_user` null, grid `1`.
- Network: 162 requests; 0 matches for `studio-token|recording-|api/download|r2|cloudflarestorage|authorization`. Known root `GET /api/cart` (pending/CORS). Audio requests are the public demo files `/middle-east.mp3` and `/videos/hero/hero-music.mp3` (same as round 60).

## 6. Code review (real `code-reviewer` subagent) — 9/10, no Critical/High

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Info | keydown add/remove symmetric by reference; `blur` non-capture at both ends; no leak | none |
| 2 | Low | No unit test can catch a leaked (never-removed) keydown wrapper; only the §0.2 static check covers it | → C: keep the static add/remove-by-reference check as a real gate (R61-S). No test outside §2.2 added. |
| 3 | Info | `?? 0` fallback in `openScrollTop` is dead when `scroller` is null (no listener attached) | Kept (spec shape, harmless) |
| 4 | Info | Exact equality also closes on browser-driven vertical changes (clamp when content shrinks, scroll anchoring, sub-pixel zoom) | Accepted per §0.3 "no tolerance"; menu is viewport-fixed so content moving under it justifies close. Signal for C's VSCROLL-CLOSE only. |
| 5 | Info | Touch compat `mousedown` / pen fine; middle press on padding no longer starts autoscroll | none |
| 6 | Info | `closest('button')` searches past the menu root; safe since the menu is not rendered inside a button | Optional hardening → B (A-R61-REVIEW-CLOSEST-SCOPE), not done |
| 7–9 | Info | GM32–GM35 discriminating power; GM35 depends on jsdom window capture path | Confirmed by mutations a–f above |
| 10 | Info | Project rules met | none |

**Architecture notes (proposals for B / root; not acted on):**
- The "is this a Follow auto-scroll" check now exists twice in `StudioWorkspace.tsx` (menu-scroll effect and `handleTimelineScroll`). Reviewer: **keep** now; proposal: a pure `isFollowAutoScroll(scroller, autoScrollLeft)` helper as its own task, `StudioWorkspace.tsx` only, GM21/GM24/GM34 + Follow tests unchanged. Belongs with root's ARCH-CHECKPOINT-SRW14-PREFS / ROOT-R50-58-L5.
- `armGridMenuDismissClickSwallow` carries six window listeners + a timer: **keep** (one cohesive closure; splitting scatters the add/remove pairs).

## 7. Command tails (verbatim)

```
$ npx tsc --noEmit
tsc=0

$ npx vitest run   (a-round-61/vitest-full.txt)
 Test Files  89 passed (89)
      Tests  1556 passed (1556)
vitest=0   (no "Test timed out")

$ npm run build   (a-round-61/build.txt)
build/server/index.js                    1,366.41 kB
✓ built in 2.84s
build=0

$ npx biome check ./app   (a-round-61/biome-app.txt)
Checked 363 files in 1132ms. No fixes applied.
Found 5 errors.
Found 218 warnings.
Found 1 info.
  5 errors = format on StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts (baseline CRLF list)

$ npx biome check app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx
Checked 2 files in 47ms. No fixes applied.   owned=0
$ npx biome lint app/components/arrangement/StudioWorkspace.tsx
Checked 1 file in 36ms. No fixes applied.    swlint=0
$ biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < sw-lf.tsx  → cmp equal (swfmt=same)

$ npm run verify   (a-round-61/verify.txt, attempt 1, quiet, nothing in parallel)
✓ built in 3.05s
verify=0

$ vitest 4 files (store)   Test Files 4 passed (4) / Tests 91 passed (91)

End state (a-round-61/end-state.txt):
038ed5a45f94596a264c14c4ec834607cb407948
git status --short: 30 lines (29 start + ?? doc 054); owned files keep start codes ( M StudioWorkspace, ?? ArrangementGridMenu, ?? grid-snap-menu)
frozen-notok=0
protected: download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
tasklist | grep -ci node.exe → 12 (start 12; 12 before verify; 12 end)
/studio-lab 200 · :5199/api/products 200
```

## 8. Deviations

- **D1 (browse state path):** the orchestrator said `tmp/studio-real-loop/a-browse.json`; the task said a new state file under my round folder. Used `a-round-61/a-browse.json` (new and own). Recorded.
- **D2:** the primitives hook blocked the first Edit on `ArrangementGridMenu.tsx`, the first Edit on `StudioWorkspace.tsx` and the first Write of doc 054 (once-per-primitive gate); each was retried unchanged. The test-file Edit was not blocked.
- **D4:** `a-round-61/scratch/` (copy of `app/` + `node_modules` junction) is left in place, as in round 60. Root can remove the junction with `cmd //c rmdir` (stdin `/dev/null`).
- **D3:** mutation extras n/p/q (C's suggested info set) were also run by A, for information only.
- No commit, push, stash, install, server start/stop, or change outside §3.1.

## 9. Known gaps / not done

- Real browser behaviour (MN-EDGE-FOCUS focus, MN-REPEAT, VSCROLL-CLOSE, regressions) is **not** tested by A — C's §4.6.
- jsdom cannot show the focus move of a real `mousedown`; GM32 pins it via return values only.
- Not testable headless (→ Tech Lead R61-T): real OS auto-repeat timing, real Alt-Tab while held, native select popup keys, Ctrl/Cmd+digit.
- Leaked-listener class (reviewer #2) is covered only statically.

## 10. Exact next C checks

1. G61-2: frozen 418 OK, protected 4/4, status 30 lines (case A), owned hashes above.
2. R61-S: `diff -u --strip-trailing-cr` vs snapshots; confirm `releaseOnFreshKey` is the identifier in both `addEventListener('keydown', …, true)` and `removeEventListener('keydown', …, true)`; no inline keydown arrow; `blur` non-capture; 35 old `it` AST-identical; CRLF 1812/1812.
3. R61-U: own a–f + re-runs g/h/i/r58a/r58d/r59k; extras n (expect survive), p, q.
4. G61-1: tsc, build, Biome, vitest 89/1556, verify.
5. §4.6 at 1440 then 1280: MN-EDGE-FOCUS*, MN-CONTEXT*, MN-ITEM-PRESS, MN-REPEAT, MN-KEY-RELEASE (focus-while-held method), VSCROLL-CLOSE* (watch reviewer #4: a browser clamp of `scrollTop` would also close — info), MN-FOLLOW, MN-DISMISS-BUTTON*, MN-KEYS, SEL-KEYS; G61-3; Ableton rows with two verdicts.

## 11. Scope completed (B's acceptance items A can attest)

- §0.1 F, §0.2 K, §0.3 V implemented in the owned files only; §0.4 T test added.
- GM32–GM35 added exactly; 39 `it`; suite 89/1556.
- Mutations a–f each fail the named test; all six re-runs killed.
- tsc 0, build rc 0, verify rc 0 (attempt 1), Biome within baseline, owned files 0 diagnostics, StudioWorkspace lint 0 + stdin format equal, CRLF kept.
- Doc 054 written. Real code-reviewer run; findings above.
- Not claimed: any C acceptance row (R61-S, R61-U, G61-x, §4.6, Ableton).

## 12. Carried follow-ups for C/B (from root-pre-push-review.md and publication-checkpoint.json, unchanged this round)

- Video sync RF3-1, RF3-2, R5-L6 (C-R27-01) open; R5-L3 partially measured; R5-L5, R5-E1, R6-S2, R6-S3 unit-only.
- Medium M1 (loop refill rAF-only → hidden tab silent), M2 (per-frame `position` re-renders consumers); Lows L1–L4, L6–L8.
- `root-review-r50-58.md`: L1 addressed this round (pending C); L5 architecture.
- publication-checkpoint: SRW-21 (purchased loader hardcodes `middle-east`), portable instruction paths, SRW-23 scrollbar check at 1280×720 and 1440×900, SRW-11/12 library/stems parity, T12.
- New from this round → B: A-R61-REVIEW-CLOSEST-SCOPE (Info), A-R61-REVIEW-LEAK-STATIC-ONLY (Low, C static gate), A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP (architecture proposal).
