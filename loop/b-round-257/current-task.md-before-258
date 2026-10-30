# Round 257: SABA-B-9 stage 1 fix-up — the playing state becomes programmatically determinable (C-R256-01), plus C-R256-02

This round finishes SABA-B-9 stage 1. C round 256 failed on one Medium only, and the cause was B's spec, not A's code.

- **The ruling (D-29z492).** Play and Stop get one shared accessible description, "Playing" or "Stopped". It comes from a hidden state element inside the centre group, referenced by `aria-describedby`. Play's name stays `Play` (§2.3 of round 256 holds).
- **The Low (D-29z494).** C-R256-02 is fixed in the same round. Three render-budget cleanup Stop clicks regain an explicit "still playing" check.
- **The rest.** Every other round-256 row carries **by diff identity** (§3.3). C re-runs only the rows this change can affect.

**Planned by:** B, at the round 256 → 257 planning, 2026-10-29 (≈ 23:20 UTC). **Decisions:** D-29z491…D-29z498.

**Why this round (D-29z491):**
- **C round 256:** FAIL. `browserVerified` and `realVerified` are both true. 16 rows PASS.
  - The FAIL comes only from **C-R256-01** (Medium, an a11y regression this round caused). While playing, the build exposes `button "Play"` and `button "Stop"` with no state. HEAD exposed playing as the name `Pause`. The brass fill is now the only playing signal (WCAG 1.3.1 / 4.1.2, Level A).
  - C states the cause is §2.3 of round 256: it removed the name signal and named no replacement. A's code-reviewer had already flagged this as M-2.
- **Gate 256 was `skipped`** ("C taskStatus FAIL"). Nothing was published, so the baseline is still `a061d52` plus the unpublished round-256 diff.
- **Policy:** "If C fails: a fix-up on the same grants" (`tasks/round-256.md` §7). L10: rule before re-dispatch.
- **REGRESSION is not due.** `regression-last.json` = 2026-10-27, and this planning is on 2026-10-29, which is 2 days later. It falls due on or after 2026-10-30.
  - A regression round checks the published HEAD, and the round-256 diff is not published. So REGRESSION is the first task after this fix-up publishes, if the date has come (D-29z497).

**Read first:**
- `lessons.md` in full. These lessons apply directly:
  - L10: the ruling;
  - L11/L12: STOP, and no class selectors;
  - L23: the pre-check below;
  - L26/L28: doc 193;
  - L29: the new clause on removed accessible signals;
  - L39: screen budget;
  - L47/L50: focus.
- `tasks/round-256.md` §2.3, §2.4 and §2.6, and `c-round-256.md` C-R256-01/02.
- Primitives: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md`.

## 0. Baseline and scope

**Start state:**
- **HEAD** = `a061d524d14af347119f06b239b77747c36362a0`, the gate 255 publication (`b-round-256/head-at-planning.txt`).
- **`git status --short --untracked-files=all` lists exactly these 14 lines** (`b-round-256/git-status-at-planning.txt`), which is the round-256 diff:

  ```
   M app/components/arrangement/ArrangementTransport.tsx
   M app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx
   M app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
   M app/lib/arrangement/__tests__/master-ui.test.tsx
   M app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx
   M app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx
   M app/lib/arrangement/__tests__/render-budget.test.tsx
   M app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx
   M app/lib/arrangement/__tests__/strings.test.ts
   M app/lib/arrangement/__tests__/transport-surface-ui.test.tsx
   M app/lib/arrangement/shortcuts.ts
   M app/lib/arrangement/strings.ts
  ?? app/lib/arrangement/__tests__/transport-centre-ui.test.tsx
  ?? docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md
  ```

- **STOP (L11)** if HEAD differs, the status differs, or any hash check below fails. Exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Hash checks** (run from `store/`; each gave rc 0 at planning):
- **The round-256 diff is the one C verified.** All 14 files were last written between 22:29:59 and 22:55:09 UTC. C round 256 started at 22:55:47 (`c-round-256/checkpoint.txt` l.1).
  - `git diff HEAD | sha256sum` = `7faaa6047d4bd4302a8fc2c44cca4a26d121a0224604b84ea69249f90b566fb0` (tracked files only; copy in `b-round-256/round256-full.diff`).
- **Carried files, frozen at their round-256 content.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-256-r257-carried-sha256.txt` covers 7 files (`b-round-256-r257-carried.txt`):
  - the `bars-ruler-ui`, `master-ui`, `mode-toggle-colour-ui`, `navigation-strings-ui`, `shortcut-sheet-ui` and `transport-surface-ui` tests;
  - `shortcuts.ts`.

  Their `git diff HEAD -- …` sha256 is `b261346f4808a255fbc95779369bb45f8b55a3d434f182276f1420bd4e516cba`, 285 lines (`b-round-256/round256-carried.diff`).
- **Frozen tree.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-256-r257-tree-sha256.txt` covers **1,106** files: `git ls-files` (1,115) minus the 4 root files and the 5 tracked granted files. It includes the 7 carried files at their round-256 content.
- **Protected files.** The 7 protected files are inside the frozen list, and each also gives `git diff --quiet HEAD` rc 0:
  - `app/routes/studio.$productId.tsx`
  - `app/routes/api.studio-token.ts`
  - `app/routes/account.downloads.tsx`
  - `app/lib/__tests__/download-routes.test.ts`
  - `app/lib/auth.ts`
  - `app/contexts/AuthContext.tsx`
  - `app/entry.server.tsx`
- **Root files.** `b-round-256-r257-root-files-start-sha256.txt` covers `package.json`, `package-lock.json`, `vite.config.ts` and `vitest.config.ts`. No dependency is needed: `useId` is React's.
- **Grant start state.** `b-round-256-r257-grants-start-sha256.txt` covers 7 files, with a copy in `b-round-256/r257-granted-start/`.

### 0.1 Grants (`b-round-256-r257-grants.txt`, 7 paths)
| # | Path | What may change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementTransport.tsx` | §2.1 only: the `useId` import, one id, `aria-describedby` on Play and on Stop, and one hidden state element. Nothing else: the classes, handlers, names, titles, `aria-keyshortcuts`, `data-playing` and the grid stay byte-identical. |
| 2 | `app/lib/arrangement/strings.ts` | In `studioPlaybackStrings` only, add two keys right after `stopTitle`: `playbackStatePlaying: 'Playing'` and `playbackStateStopped: 'Stopped'`. No other key changes. |
| 3 | `app/lib/arrangement/__tests__/strings.test.ts` | Collision C10 (B's scratch: ST10 red on the key list). Add the two keys with their exact literals to ST10's expected `studioPlaybackStrings` literals. Nothing else. |
| 4 | `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` (untracked) | Add TC10 and TC11 (§2.2). TC1–TC9 keep every assertion. |
| 5 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | C-R256-02 only, at the three trailing cleanup Stop clicks (now l.348, l.371 and l.472). Before each one, add `expect(view.getByRole('button', { name: 'Play' }).dataset.playing).toBe('true')`. After each one, add the matching `.toBe('false')`. This is the l.411 pattern. Nothing else. |
| 6 | `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | GS14's title only (C info: stale). Replace "keeps the transport toolbar unchanged and without a Snap control" with a title that names what it asserts, for example "GS14 lists the regrouped transport toolbar controls in order and has no Snap control". The body is unchanged. |
| 7 | `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md` (untracked) | <ul><li>**l.4** becomes exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 257 PASS)` (L28 re-dispatch).</li><li>**One bullet** in `## პრობლემები და გადაწყვეტები`, in Problem → Solution form. It names C-R256-01, D-29z492 and the hidden-description solution, and why `aria-pressed` was rejected.</li><li>**One bullet** in `## ტესტირება` that names TC10, TC11 and M6–M9.</li><li>**Optionally, one line** in `## შეცვლილი ფაილები` for the render-budget and GS14 edits.</li><li>The 7 TEMPLATE headings stay in order. Georgian, with English technical terms.</li></ul> |

**Rules for the grants:**
- **Every other file is frozen,** including the 7 carried files, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `app.css` and `e2e/**`. No context change is needed.
- **No assertion lost.** Equal or stronger replacements are allowed (D-29z495 wording). A test whose only change is a removed assertion is a Medium bug.
- **A collision outside C10 is a STOP (L11, L23),** with the hit list. A must not edit a frozen file.

### 0.2 B's pre-check (L23, L29, L50)
Everything below is in `b-round-256/probe/`.

**1. Scratch with the sketch applied.**
- The copy is the whole working tree in `/tmp/b256-scratch`. The sketch diff is `probe/sketch.diff` (61 lines). It is a sketch, not a prescription.
- `tsc --noEmit`: rc 0, no errors. `npx biome check` on the two scratch source files: clean.
- `vitest run app/lib/arrangement app/components/arrangement app/contexts`: **170 files, 2,513 tests; 1 failed:** ST10 (`probe/scratch-vitest-tail.txt`). That is collision C10, and it is granted.
- **jsdom half (L29):** this repo has no jest-dom, so `toHaveAccessibleDescription` does not exist (`Invalid Chai property`). Testing Library's `getByRole('button', { name: 'Play', description: 'Stopped' })` resolves the hidden referenced span in jsdom: a probe row went green on the sketch and red with the state text forced to `Stopped` (`probe/jsdom-description-probe.txt`, `probe/transport-centre-ui.scratch-probe.test.tsx`).

**2. Greps (L29).**
- No test in `app/**/__tests__` pins Play's or Stop's description or `aria-describedby`. The `aria-describedby` / `describedby` hits in tests are in the detail panel, clip gain, meter, pending-status and export files only. `toHaveAccessibleDescription` has 0 hits in `app/**`.
- The four source scanners that read `ArrangementTransport.tsx` stayed green on the scratch:
  - `mode-toggle-colour-ui` (class tokens);
  - `studio-focus-ring`;
  - `affordance-colour-ui`;
  - `panel-radius-ui`.
- `strings.test` ST27 forbids Georgian codepoints in the transport source. The new strings are English and live in `strings.ts`.

**3. Chromium on the scratch** (port 5181, stopped afterwards; `probe/desc-probe.cjs`, `desc-probe-sketch.json`). CDP `Accessibility.getPartialAXTree` at 1440×900 and 1280×720:

| State | Play name / description | Stop name / description |
|---|---|---|
| Stopped | `Play` / `Stopped` | `Stop` / `Stopped` |
| Playing | `Play` / `Playing` | `Stop` / `Playing` |
| After Stop | `Play` / `Stopped` | – |

- The hidden element's `boundingBox()` is `null`.
- The toolbar is 49 px at 1440 and 87 px at 1280, the same as round 256.
- **Control: the current round-256 tree on :5173** (`desc-probe-r256tree.json`). Play's description is `Play (Space)` and Stop's is `Stop (Space)`: Chromium uses `title` as the description when nothing else gives one. With `aria-describedby`, the description becomes the state. This is deviation **DV2** (§1).

**4. L50 grep** on the 2 granted source files:

```
grep -nE "onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)" app/components/arrangement/ArrangementTransport.tsx app/lib/arrangement/strings.ts
```

- **Working tree (round-256 content): 2 hits.**
  - l.119 `handoff.partner.focus()`: the Undo/Redo/Delete/Zoom-back handoff, kept; TC9 covers it.
  - l.226 `{navigation.followMode === 'paused' ? …}`: the Follow text, same element, unchanged.
- **Scratch with the sketch: 2 hits,** the same two shifted by one line (l.120, l.227).
- **The new span's text matches 0 times:** Biome puts its ternary on several lines (`{isPlaying` / `? …`), and the `\?` alternative only matches a one-line `{…?`. B rules on it by hand: it is text inside a hidden, non-focusable `span`, so nothing focusable mounts or unmounts. Play and Stop stay mounted and enabled in both states, so no focus target changes (TC9 stays).
- A re-runs the grep and pastes the hit count.

**5. Timeout headroom (L31).** Gate 256 did not run, so A's round-256 numbers are the only source (`a-round-256.md` §5):
- `transport-centre-ui` 9.8 s for the file, highest row TC5 1,618 ms / 15 s;
- `render-budget` highest 2,892 ms / 15 s (19 %);
- `strings` 0.08 s.

TC10/TC11 and six read-only lines fit under 50 %.

## 1. Reference: how Ableton Live 12 does it

**Sources:**
- **[ACC]** <https://www.ableton.com/en/live-manual/12/accessibility-and-keyboard-navigation/> (WebFetch 2026-10-29; the page numbers its sections 41.x):
  - 41.4.1.1: "The Control Bar … transport controls … The controls are organized into accessible groupings; you can use Tab and Shift+Tab to navigate between them with Speak Help Text activated";
  - 41.1.2: "It is also possible to use the Enter key to switch between toggle states."
- **[AV]** 6.3 "Transport and Playback", as in round 256.
- Live version 12.

| # | Behaviour | Live source | Confirmed in Live | CZABA decision / deviation | C check |
|---|---|---|---|---|---|
| R7-SR | A screen reader can tell whether playback runs | **No reference found.** I searched [ACC], ch. 38 "Accessibility Options in Live" (search result) and WebSearch ("Ableton Live 12 screen reader Play button announced state"). None says how Live exposes the Play button's on state to a screen reader. | **Unconfirmed** | Play and Stop carry the description "Playing" or "Stopped" (D-29z492). The name stays `Play`. | C-A11Y-257 |
| R-GROUP | Control Bar in accessible groupings, Tab between them | [ACC] 41.4.1.1 | Yes (text) | Already true in DOM order: edit, then centre, then view. No `role="group"` is added in this round; the pre-existing finding stays a backlog signal (D-29z496). | C-FOCUS-257 (order unchanged) |

**Deviations (listed, each with a reason):**
- **DV1: not announced on change.** The state is determinable on focus or by query. Starting or stopping playback is **not** announced by a new live region.
  - **The one existing announcement:** the shared status line (`StudioWorkspace.tsx` l.3097–3101, `<output aria-live="polite" data-testid="arrangement-status">`) writes "Stopped — Space plays from the insert marker at …" (`insertMarkerAfterStop`) on a stop. It does so **only** when the line held a while-playing marker or Follow-paused text (`StudioWorkspace.tsx` l.1928–1941). A plain start or stop announces nothing, at HEAD as now.
  - **Why not here:** a transport live region would compete with that conditional stop status and with the ready and refusal texts on the same polite channel, which needs an L51 clobber analysis. A "Playing"/"Stopped" status write needs `StudioWorkspace.tsx` or `ArrangementContext.tsx`, which are frozen in this fix-up.
  - Asked once as **SABA-Q-9-TRANSPORT (f)**: should starting and stopping playback be announced?
- **DV2: the title is no longer the description.** Play's and Stop's description changes from the title text (`Play (Space)`, `Stop (Space)`) to the state.
  - The key stays exposed: `aria-keyshortcuts="Space"`, the visible tooltip and the `?` sheet row. This is the CALM rule: the tooltip shows its key, with a matching `aria-keyshortcuts`.
- **DV3: `aria-pressed` is rejected (D-29z492).** It would announce "Play, toggle button, pressed", which says a second press releases it. Round 256 §2.3 / R5 makes a second click on Play a no-op, so `aria-pressed` would misdescribe the control (A's reviewer M-2). Follow and Loop keep `aria-pressed`, because their second press does release.

## 2. A: what to build

### 2.1 The state element (ArrangementTransport.tsx)
**The element:**
- `const playbackStateId = useId();` sits in `ArrangementTransport`.
- Inside the centre group, right after the Stop button, add one `span`:
  - `id={playbackStateId}`;
  - the `hidden` attribute;
  - `data-testid="arrangement-playback-state"`;
  - text: `studioPlaybackStrings.playbackStatePlaying` while `isPlaying`, otherwise `playbackStateStopped`.
- No class is needed (`hidden` is `display: none`).
  - It must not be `sr-only`: browse mode would then read a stray word in the toolbar.
  - It must not be a live region (DV1).
  - It has no `tabIndex`.

**The buttons:**
- Play and Stop both get `aria-describedby={playbackStateId}`.
- Back to start, Loop, Follow and every other control get nothing.

**Unchanged:** Play's `aria-label` `Play`, title `Play (Space)`, `aria-keyshortcuts` `Space`, `data-playing`, the classes, the click guards (R5/R6), `onDoubleClick` and the Enter repeat guard. The same holds for Stop.

### 2.2 Tests (transport-centre-ui.test.tsx)
Find elements by role, name, text or `data-testid` only (L12). Use the existing describe and harness.

| Row | Asserts |
|---|---|
| TC10 | <ol><li>**Stopped:** `getByRole('button', { name: 'Play', description: 'Stopped' })` is the Play element, and `{ name: 'Stop', description: 'Stopped' }` is Stop. Use the `description` filter, not `toHaveAccessibleDescription`: jest-dom is not installed (§0.2.1).</li><li>**Click Play:** both descriptions are `Playing`, and the names are unchanged.</li><li>**Click Play again (no-op):** still `Playing`.</li><li>**Click Stop:** both are `Stopped`.</li><li>**Space keydown on `window`:** `Playing`; Space again: `Stopped`. This covers a state change that does not come from the buttons.</li><li>**Double-click Stop while playing** (real order `click`, `click`, `dblclick`): `Stopped`.</li><li>**Titles in both states:** `Play (Space)` and `Stop (Space)`.</li></ol> |
| TC11 | The state element (`getByTestId('arrangement-playback-state')`): <ul><li>it has the `hidden` attribute;</li><li>it is inside `arrangement-transport-centre`;</li><li>it has no `tabindex`, no `aria-live` and no `role`;</li><li>its id equals both buttons' `aria-describedby`;</li><li>no other element in the toolbar references it;</li><li>exactly one such element exists.</li></ul> |

**Red-proofs** (named mutants on a scratch copy, or in place and restored with a sha256 check; report each red row):
- **M6:** remove `aria-describedby` from Play. TC10 must go red.
- **M7:** the state text is always `playbackStateStopped`. TC10 must go red.
- **M8:** remove `hidden`. TC11 must go red.
- **M9:** Stop's `onClick` does nothing. The three render-budget tests go red. The first red line is the existing l.330 (`isPlaying` false), the existing l.362, and the **new** after-click line at the l.472 site. The l.348 and l.371 pairs are equal replacements of HEAD's implicit check. They have no separate mutant red-proof, because an earlier existing line fails first. Report the three first-red lines.

### 2.3 Checks A runs (speed rule: no full suite, no `verify`)
1. The start state of §0.
2. Run `npm run typecheck` and `npm run lint`.
3. Run `npx vitest run` on the round-256 set: the 9 collision files, `transport-centre-ui`, `shortcuts.test.ts` and `insert-marker-ui.test.tsx`. Also run the 3 other source scanners: `studio-focus-ring`, `affordance-colour-ui` and `panel-radius-ui` (`mode-toggle-colour-ui` is already in the set).
   - Report each file's time against its declared timeout (L31). Any test above 50 % is a STOP.
4. Run the mutants M6–M9.
5. **Chromium at both viewports, one run each:** the CDP description table of §0.2.3 (stopped, playing, after Stop), the toolbar height, and the state element's box (null).
6. **code-reviewer:** 3 or more files changed, so it is required. Pass every Architecture note to B.
7. **Re-check the hashes:** the frozen tree, the carried files and the protected files give rc 0, and the root files are unchanged.
8. **Report `a-round-257.md`:**
   - every hunk, old → new;
   - the description table;
   - test times;
   - mutants;
   - reviewer notes;
   - a STOP at the top if there is one.

## 3. C: acceptance
Run each browser row at **1440×900 and 1280×720**, in a fresh context.

**Setup:** open `/studio-lab` and wait until `[data-testid="arrangement-status"]` starts with `Demo collection ready` (L48). Click `[data-source-id="demo-stem-pulse"]`, then Add. For marker rows, set the insert marker at 2.000 as in round 256.
- No HEAD server is needed: C-A11Y-257's control column cites the existing evidence. C may start one if it doubts that evidence; stop it afterwards.

### 3.1 Rows
| ID | Check | Pass |
|---|---|---|
| C-SCOPE-257 | HEAD, status, hashes | <ul><li>HEAD is `a061d52`.</li><li>The status lists the same 14 paths as §0.</li><li>The carried files (7), frozen tree (1,106), root and protected checks give rc 0.</li><li>`git diff` of each granted file against `b-round-256/r257-granted-start/` shows only §0.1 changes.</li><li>Re-check at the end of the phase.</li></ul> |
| C-UNIT-257 | The §2.3.3 files, run alone | All green; report the counts. Re-run M6 and M8 yourself on a scratch copy: both must be red. |
| C-COLLISION-257 | `git diff -w` of `strings.test.ts`, `render-budget.test.tsx` and `grid-snap-ui.test.tsx` against the start copies | <ul><li>ST10 gains exactly the two keys.</li><li>render-budget gains the 3 before/after pairs at the 3 cleanup sites, and nothing else.</li><li>GS14: the title only.</li><li>No assertion is removed.</li></ul> |
| C-A11Y-257 | Playing state, read programmatically (closes C-R256-01). CDP `Accessibility.getPartialAXTree` on Play and Stop, plus an `ariaSnapshot` of the centre group. | <ul><li>Stopped: descriptions `Stopped`. Playing: `Playing`. After Stop: `Stopped`. After a Space press: it follows. After a double-click on Stop while playing: `Stopped`.</li><li>Names are constant `Play` / `Stop`, titles `Play (Space)` / `Stop (Space)`, and `aria-keyshortcuts` `Space`, in every state.</li><li>The state element has no box (`boundingBox()` null) and is never focused.</li><li>The status log does not change on Play. This is DV1, a listed deviation, not a FAIL.</li><li>**Control column:** cite the existing evidence, with no new HEAD server: HEAD `Pause` while playing is in `c-round-256/browser/a11y-playing-state.json`, and the round-256 description `Play (Space)` (DV2) is in `b-round-256/probe/desc-probe-r256tree.json`.</li></ul> |
| C-ONSTATE-257 | Play's state (short re-run) | `data-playing` flips. The Play box is ±0 px between states. The glyph contrast is ≥ 3:1 in both states (round 256: 15.62 / 8.32; Stop 13.24). |
| C-FOCUS-257 | Focus | <ul><li>The toolbar Tab stops equal round 256's list: Undo, Split, Delete, Follow, Play, Stop, Back to start, Zoom slider, Fit, Export.</li><li>The full page sequence has 80 stops, the same as round 256.</li><li>After a double-click on Stop, `activeElement` is Stop. The ring shows on `:focus-visible` after keyboard focus only.</li></ul> |
| C-KEYS-257 | Keyboard (short re-run) | <ul><li>Tab to Play, then Space: one toggle. Tab to Stop, then Space: one toggle.</li><li>0 native click events from Space (round-256 method).</li><li>Held Enter on Stop while playing: one stop.</li><li>The description follows each toggle.</li></ul> |
| C-LAYOUT-257 | Toolbar (short) | 1440: 49 px, centre offset ≤ 24 px. 1280: ≤ 87 px. Library, dock, ruler and first-lane tops equal round 256's numbers (84/84/191/275 and 122/122/229/313). |
| C-BUDGET-257 | Screen budget (L39) | Persistent visible text lines outside the timeline equal round 256: 1440 empty 85 / demo 101; 1280 empty 69 / demo 85. Count visible text only: a `hidden` element is not a line. Full-window screenshots. |
| C-LESSON-257 | `lessons.md` | ≤ 60 lines. L29 contains the C-R256-01 clause, and L4 contains the row-wording clause (D-29z495). |
| AN-REVIEW-257 | Doc 193 | <ul><li>l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 257 PASS)`.</li><li>The new Problem → Solution bullet names C-R256-01 and D-29z492.</li><li>Every cited test id exists, including TC10 and TC11 (L26).</li><li>The 7 TEMPLATE headings are in order.</li><li>Georgian, with English terms.</li></ul> |
| LAB-SMOKE-257 | Load, play, export WAV | No page errors. The export sha256 equals rounds 255 and 256: `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`. |
| Auth | `/studio/<handle>` without a session | `Sign in required`, no `audio[src]`, and `/api/studio-token` never returns 200. |
| Purchased origin | `/studio/$productId` | **BLOCKED:** backend unavailable in cloud. |
| gate | Full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows; C does not claim them. |

### 3.2 `browserVerified`
True only if C-A11Y, C-ONSTATE, C-FOCUS, C-KEYS, C-LAYOUT, C-BUDGET, LAB-SMOKE and Auth all ran in the browser.

### 3.3 Carried by diff identity (D-29z493)
These round-256 PASS rows test files and behaviour this round does not change: C-STOP-256, C-STATUS-256, C-SHEET-256 and C-REF-256 (R1–R6, R8–R10; R7 is re-judged by C-A11Y-257).
- **The carried files** are proven identical by `b-round-256-r257-carried-sha256.txt`.
- **The granted source change** adds only an attribute and a hidden element. B's scratch showed the toolbar height and the Tab order are unchanged.
- **Who decides:** C decides whether the carry holds. If C-SCOPE-257 shows anything else changed, or a re-run row shows a behaviour change, C re-runs the affected round-256 row.

## 4. Neighbouring behaviour that could break
- **Description-based tests elsewhere:** none pin the transport (§0.2.2).
- **The tooltip and the `?` sheet:** unchanged. DV2 changes only the AX description.
- **The status line:** untouched (DV1). This round writes no new status text, so no L51 clobber row is needed.
- **render-budget:** its render budgets are unchanged. The new lines are reads only.
- **The 1,408 px breakpoint and grid:** untouched. The hidden span is `display: none`, so it takes no gap.

## 5. Saba questions (L44): SABA-Q-9-TRANSPORT gains two parts
| Part | Question | Default until answered |
|---|---|---|
| (e) | Space on a focused Play while playing stops, and Space on a focused Stop while stopped plays. That is the global Space toggle, the same as Live's Space bar. A's reviewer (A-R256-REVIEW-SPACE-ON-FOCUSED, Low) says it undercuts the honest label. Keep it, or make Space on a focused transport button behave like its click? | Keep the global toggle (Live 6.3: "use the space bar to toggle playback"). |
| (f) | Should starting and stopping playback be announced to screen readers (a "Playing" / "Stopped" status)? Today only a stop after a while-playing marker or Follow-paused text is announced. | Not announced; the state is a description on Play and Stop (DV1). |

## 6. Root cause (spec-induced; not a Saba-reported issue)
- **What happened:** B's round-256 §2.3 made Play's name constant to fix a Low (B-R249-PAUSE-LABEL). That removed the only programmatic playing signal, and the task named no replacement. A's reviewer caught it (M-2), but the spec did not let A fix it.
- **The rule:** L29 gains a clause. A removed or constant-ed accessible name or state is a signal too: the task names its programmatic replacement, with a row. B adds it in this planning (D-29z495).

## 7. Next (D-29z497)
**If C passes and the gate publishes:**
- SABA-B-9 stage 1 is **done**. C-R256-01, C-R256-02 and B-R249-PAUSE-LABEL close.
- Then **REGRESSION-ROUND-2026-10-30** if the date is 2026-10-30 or later. It carries every `scope_additions` entry, plus C-LAYOUT-256, C-STOP-256, C-SHEET-256 and C-A11Y-257.
- Then **SABA-B-9 stage 2** (master volume to the workspace bottom-right), then **SABA-B-11c** (after the expert consult on the off-grid offset), then **SABA-B-7** when Saba answers.
- RETRO at round 260.

**If C fails:** a fix-up on the same grants, with a ruling on what C found.
