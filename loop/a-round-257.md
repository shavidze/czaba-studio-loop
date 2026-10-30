# A round 257: SABA-B-9 stage 1 fix-up (C-R256-01 playing state, C-R256-02)

**No STOP.** This round changes only the 7 granted files, each within its §0.1 scope. There are no commits or pushes. Evidence is in `a-round-257/`.

## 1. Start state (§0) — every check passed before any edit
- HEAD is `a061d524d14af347119f06b239b77747c36362a0`.
- `git status` showed exactly the 14 lines.
- `git diff HEAD | sha256sum` = `7faaa604…b566fb0`.
- These checks each gave rc 0: carried (7), frozen tree (1,106), root files, grants-start (7), and the 7 protected files (`git diff --quiet HEAD`).

## 2. Hunks (old → new). Full diff: `a-round-257/granted-vs-start.diff` (230 lines), compared with `b-round-256/r257-granted-start/`
1. **`ArrangementTransport.tsx`:** byte-identical to B's `probe/sketch.diff`.
   - The `react` import gains `useId`.
   - `const playbackStateId = useId();` sits before `undoButtonRef`.
   - Play and Stop each gain `aria-describedby={playbackStateId}`, right after `aria-label`.
   - After Stop: `<span id={playbackStateId} hidden data-testid="arrangement-playback-state">`, with text `isPlaying ? studioPlaybackStrings.playbackStatePlaying : …playbackStateStopped`.
   - Nothing else changed: classes, handlers, names, titles, `aria-keyshortcuts`, `data-playing` and the grid are untouched.
2. **`strings.ts`:** `playbackStatePlaying: 'Playing'` and `playbackStateStopped: 'Stopped'` go right after `stopTitle`.
3. **`strings.test.ts`:** the same two literals go into ST10's expected `studioPlaybackStrings`, after `stopTitle`.
4. **`render-budget.test.tsx`:** three sites get a pair around the trailing cleanup Stop click: `expect(Play.dataset.playing).toBe('true')` before it and `.toBe('false')` after.
   - The sites were l.348, l.371 and l.472; the new lines are 348/350, 373/375 and 476/478.
   - Nothing else changed and no assertion was removed.
   - Note: the 4th Stop site (start l.616, now l.622) already had the pair from round 256 and is untouched.
5. **`grid-snap-ui.test.tsx`:** GS14's title becomes "GS14 lists the regrouped transport toolbar controls in order and has no Snap control". The body is unchanged.
6. **`transport-centre-ui.test.tsx`:** TC10 and TC11 are added after TC9. TC1–TC9 are unchanged.
   - **TC10:** uses the `getByRole('button', { name, description })` filter.
     - The steps: Stopped, then click Play (Playing), click Play again (still Playing), click Stop (Stopped), Space on `window` (Playing), Space again (Stopped), then Play and a real-order double-click on Stop (`click`, `click`, `dblclick`), ending Stopped.
     - Each step also checks `isPlaying`, and the titles `Play (Space)` / `Stop (Space)`.
   - **TC11:**
     - exactly 1 state element;
     - `getAttribute('hidden') === ''`;
     - it is inside `arrangement-transport-centre`;
     - it has no `tabindex`, `aria-live` or `role`;
     - its id is non-empty and equals both buttons' `aria-describedby`;
     - inside the toolbar, the `aria-describedby` referrers are exactly [Play, Stop];
     - across the whole document, the `aria-describedby` / `aria-labelledby` referrers are exactly [Play, Stop].
7. **Doc 193:**
   - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 257 PASS)`.
   - One line in `## შეცვლილი ფაილები` (render-budget and GS14). The M9 count in the testing bullet is "five render-budget tests, all three cleanup sites among them".
   - One Problem → Solution bullet that names C-R256-01, D-29z492, the hidden-description solution, and why `aria-pressed` was rejected (DV3), plus DV1.
   - One `## ტესტირება` bullet that names TC10, TC11 and M6–M9.
   - The 7 TEMPLATE headings stay in order.

## 3. Checks run
- **`npm run typecheck`:** rc 0, run both after the edits and at the end.
- **`npm run lint`:** rc 0. Its 205 warnings and 1 info are repository-wide. `npx biome check` on the 6 owned source and test files reports nothing.
- **vitest on the §2.3.3 set (15 files):** 15 files, **243 tests passed**, rc 0 (`a-round-257/vitest-set.txt`, `vitest-set.json`).
  - After the reviewer fix, `transport-centre-ui` was re-run alone: 11/11.

**Per-file time, highest test, and its declared timeout** (`vitest.config.ts` sets no `testTimeout`, so the default is 5 s):

| File | Tests | File time | Highest test | Timeout | % |
|---|---|---|---|---|---|
| transport-centre-ui | 11 | 9.2 s | TC10 2,824 ms | 15 s (describe) | 19 % |
| render-budget | 8 | 8.4 s | "does not re-render clips…" 2,484 ms | 15 s | 17 % |
| bars-ruler-ui | 25 | 5.9 s | BR2 780 ms | 15 s (describe l.249) | 5 % |
| insert-marker-ui | 29 | 5.7 s | IM7 528 ms | 15 s (describe l.180) | 4 % |
| shortcut-sheet-ui | 13 | 5.4 s | SS2 1,318 ms | 20 s | 7 % |
| grid-snap-ui | 25 | 5.3 s | GS14 682 ms | 15 s (describe l.213) | 5 % |
| navigation-strings-ui | 7 | 2.7 s | NS5 1,305 ms | 5 s default | 26 % |
| transport-surface-ui | 8 | 2.4 s | TS2 1,149 ms | 15 s | 8 % |
| master-ui | 18 | 2.1 s | 1,495 ms | 15 s | 10 % |
| affordance-colour-ui | 7 | 1.7 s | 631 ms | 5 s default | 13 % |
| mode-toggle-colour-ui | 8 | 1.4 s | 364 ms | 5 s default | 7 % |
| panel-radius-ui | 7 | 1.2 s | 412 ms | 5 s default | 8 % |
| studio-focus-ring | 7 | 0.15 s | 63 ms | 5 s default | 1 % |
| strings | 64 | 0.06 s | 8 ms | 5 s default | < 1 % |
| shortcuts | 6 | 0.01 s | 4 ms | 5 s default | < 1 % |

No test is above 50 %. I grepped every one of the 15 files for `timeout` (`describe`/`it` options and positional `15000`). Where the grep found none, the 5 s vitest default applies.

## 4. Mutants
Each mutant was applied in place and restored; every restore was checked with sha256. Logs are `a-round-257/mutant-*.txt`.

| Mutant | Change | Result |
|---|---|---|
| M6 | Play has no `aria-describedby` | **red:** TC10 and TC11 |
| M7 | the state text is always `Stopped` | **red:** TC10 |
| M8 | no `hidden` | **red:** TC11 (re-run after the reviewer fix: still red) |
| M9 | Stop's `onClick` does nothing | **red:** 5 render-budget tests, including all three sites (doc 193 says five tests). First-red lines: **l.330**, **l.364** and **l.462**. |
| M9b (extra) | Stop toggles only on its first click per mount | **red:** exactly the three sites, at the **new** after-click lines **l.350, l.375 and l.478** |
| M8b (extra, reviewer Low) | `hidden="until-found"` | **green.** React 18.3.1 renders `hidden` as a boolean, so this mutant equals the real code. It cannot be killed in this React version. |

**Deviation from B's M9 prediction:**
- At the l.472 site, M9's first red is the **existing** l.457 pair (now l.462), not the new line. That test clicks Stop once before the cleanup site.
- M9b closes this. It proves that each of the three new after-click lines (l.350, l.375, l.478) fails on its own when only that cleanup Stop is broken.

## 5. Chromium, :5173 `/studio-lab`, both viewports
Script: `a-round-257/desc-probe-a257.cjs`. Output: `desc-probe-a257.json`, plus `toolbar-*.png` screenshots. Each viewport ran in a fresh context, with demo-stem-pulse added.

The first attempt timed out waiting for `Demo collection ready`, most likely because Vite was recompiling after the edits. A diagnostic run right after showed the status ready, and the re-run passed. I am noting the timeout so nobody counts it as a pass or hides it.

The rows below were the same at 1440×900 and 1280×720:

| State | `data-playing` | Play name / description | Stop name / description |
|---|---|---|---|
| Stopped | false | Play / Stopped | Stop / Stopped |
| Playing (click) | true | Play / Playing | Stop / Playing |
| After Stop | false | Play / Stopped | Stop / Stopped |
| After Space (window) | true | Play / Playing | Stop / Playing |
| After double-click Stop | false | Play / Stopped | Stop / Stopped |

- **In every state:** the titles are `Play (Space)` / `Stop (Space)` and `aria-keyshortcuts` is `Space`.
- **Toolbar height:** 1440 → **49 px**, 1280 → **87 px**, the same as round 256.
- **The state element:** `boundingBox()` is **null** and it occurs once. Calling `focus()` on it does not focus it.
- **After double-clicking Stop:** `activeElement` is Stop.
- **Page errors:** 0. The only console errors are the expected cart `ERR_CONNECTION_REFUSED` ones.

## 6. L50 grep
The §0.2.4 command gives **2 hits**: l.120 `handoff.partner.focus()` and l.227 `{navigation.followMode === 'paused' ? …}`. These are the same two as at the start, shifted by one line. The new span's ternary does not match. B's ruling (hidden, non-focusable text) applies.

## 7. code-reviewer (actual subagent, agentId ad88d536916c50b28)
Score 9/10. No Critical, High or Medium findings.
- **Low, TC11 `hasAttribute('hidden')`:** fixed. It is now `getAttribute('hidden') === ''`, which is an equal-or-stronger replacement. See M8b for why `until-found` cannot be killed in React 18.
- **Info, for B:**
  - Doc 193 l.132 (the round-256 bullet, not granted this round) says a Stop-does-nothing mutant reddens "six tests" across render-budget and master-ui. The new l.146 says M9 reddens three render-budget tests. These count different scopes, but a reader may see a conflict.
  - Doc 193 l.39–43 (the "Play მუდმივია" approach bullet) does not mention the new description. It is not granted this round; B can rule on it at the stage-1 close.
  - **Over-crediting:** the l.348/l.371 pairs never fail first under M9. M9b is the proof that they bite.
- **Architecture note (forwarded to B verbatim in substance; not acted on):**
  - **The signal:** a repeated costly change in `ArrangementTransport.tsx` l.206–280, the centre group. Rounds 249, 256 and 257 each changed Play/Stop semantics, and each change needed 9–10 collision test files plus 4 scanners.
  - **Keep:** `isPlaying` remains the single source, and extracting a component now would add prop plumbing and put the focus-handoff layout effect at risk.
  - **Proposal:** one bounded task that makes a single test file the owner of the transport's a11y and state contract (names, descriptions, `aria-pressed`, `aria-keyshortcuts`). Other files would read `data-playing` instead of names. Bundle it with the backlogged `role="group"` signal (D-29z496). Acceptance: the next Play/Stop semantic change touches at most 2 test files.

## 8. End state
- HEAD is unchanged at `a061d52`.
- `git status` still lists exactly the same 14 paths.
- **Hash re-checks at the end:** carried rc 0, frozen tree (1,106) rc 0, root files rc 0, and the 7 protected files unchanged.
- The end sha256 of the granted files is in `a-round-257/granted-end-sha256.txt`.

## 9. What I did not run
- No full suite, `verify`, build, or e2e smoke. Under the speed rule these are gate rows.
- No WAV export or LAB-SMOKE: that is C's row.
- No contrast re-measure: no colour or class changed.

## 10. Exact next C checks
- **C-SCOPE-257:** the status has 14 paths; diff the 7 granted files against `b-round-256/r257-granted-start/`.
- **C-UNIT-257:** re-run M6 and M8 on a scratch copy.
- **C-A11Y-257:** use the CDP table above. Use the attribute selector, not `#id`: `useId` ids contain colons.
- **The rest of §3.1:** C-ONSTATE, C-FOCUS (Tab stops and the 80-stop sequence), C-KEYS, C-LAYOUT, C-BUDGET (the hidden span is not a line), C-LESSON, AN-REVIEW (doc 193 l.4 byte-exact; TC10/TC11 exist), LAB-SMOKE (export sha256 `1fea093b…3f94`), and Auth.

## 11. B acceptance (§2.3) that A truly passed
- [x] Start state.
- [x] Typecheck and lint.
- [x] The covering vitest set: 243/243, all under 50 % of their timeouts.
- [x] Mutants M6–M9 red, plus M9b. M9's first red at the l.472 site differs from B's prediction (see §4).
- [x] Chromium at both viewports: the description table, the toolbar height, and the null box.
- [x] code-reviewer run; its Low is fixed.
- [x] Hash re-check.

The C rows in §3.1 are not claimed. SABA-B-9 stage 1 is not marked done; that waits for C and the gate.
