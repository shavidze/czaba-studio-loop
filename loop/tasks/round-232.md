# Round 232: SABA-B-8 CALM-3 — a quiet Overview in an empty project, and Ctrl+Alt+O to hide or show it (+ GATE229-S2, GATE229-S4 row)

**Planned by:** B, at the round 231 → 232 planning, 2026-10-28. **Decisions:** D-29z306…D-29z312.
**Type:** feature stage, the **final stage of SABA-B-8 "Calm Studio"** (CALM-1 done, CALM-2a + CALM-2b done). Saba decision 3 (policy "SABA-B-8 Calm Studio"):
- "Overview: stays, thin, as a quiet hairline in an empty project. Its full view appears with the first clip, and its bbox is unchanged."
- "It can be hidden with **Ctrl+Alt+O** as in Live; the choice is remembered, and the shortcut is listed in the sheet."
- "Collapsing the whole dock row when there is no video is **not** approved (layout change)."

**Read first:** `lessons.md` in full (B, A and C). These lessons apply directly:
- L4 (one rule per element, §2 rulings);
- L11, L32, L33 (STOP);
- L12 (no class pins; the visual empty state is checked in the browser, §5);
- L23 (pre-check done, §0.2);
- L26, L28 (doc 180, §2.8);
- L29 (every named signal and recipe was run in the browser at baseline and on B's scratch, §0.3);
- L31 (§0.3);
- L39 (this round removes persistent paint and adds none; C counts, §5);
- L40 (changed testid elements, §0.3).

**Not this round:**
- Collapsing the dock row when there is no video (not approved; Saba Q3).
- Any change to the Overview's interactions (click = centre, ↔ drag = scroll, ↕ drag = zoom, double-click = Fit, ← / → = 5 s), its `aria-label`, `title` or role.
- A visible Overview toggle button or a View menu (Saba: "no new visible control"; calm-studio-review §3 item 3).
- C-R231-01 / C-R139-02 (stale library ghost after an Escape-cancelled drag): deferred Low; `ArrangementLane.tsx` is not granted (D-29z307).
- The "any drag active" lane-hint proposal (A round 231 reviewer R1): an architecture signal, not scheduled (D-29z307).
- Screen-review candidates SR-230-1…10 and SABA-Q-NOTICE-ONE-ROW: awaiting Saba.

## 0. Baseline and scope

**Baseline:** HEAD = `e5507ffe56a4e59234bbb5a66f0537aaad5ceb62` (gate 231 `published`, its `commit`). At the start, `git status --short --untracked-files=all` must be empty (B checked: `b-round-231/git-status-at-planning.txt`, 0 lines).
- If HEAD differs, or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-231-r232-tree-sha256.txt` lists 1,078 tracked files: every tracked file except the 8 grants and the 4 root files. Run it from `store/` with `sha256sum -c --quiet`; it gives rc 0 at planning. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/routes/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx` and `entry.server.tsx`;
- `.claude/**`, `CLAUDE.md` and every config file;
- `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementShortcutSheet.tsx`, `ArrangementTransport.tsx`, `ArrangementContext.tsx`, `view.ts` and `library-notice.ts`;
- the tests `track-layout.test.tsx`, `content-colour-ui.test.tsx`, `studio-theme-obsidian.test.tsx`, `shortcut-sheet-ui.test.tsx` and `render-budget.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-231-r232-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-231-r232-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
- The list is `b-round-231-r232-grants.txt`. Start hashes are in `b-round-231-r232-granted-start-sha256.txt`; start copies are in `b-round-231/granted-start/`.
- The new files are listed in `b-round-231-r232-new-files.txt` (N1–N4).

| # | Path | What may change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementOverview.tsx` | §2.4 only: the empty state. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | §2.5 only: the visibility read, the hidden slot, the Ctrl+Alt+O branch of the window keydown handler, and the imports these need. |
| 3 | `app/components/arrangement/ArrangementVideoDock.tsx` | §2.6 only (GATE229-S2): the l.889 caption row loses `justify-between gap-2`. Nothing else. |
| 4 | `app/lib/arrangement/shortcuts.ts` | §2.2: one new row, `overview-toggle`. |
| 5 | `app/lib/arrangement/strings.ts` | §2.1: two new `studioViewStrings` keys. Nothing else. |
| 6 | `app/lib/arrangement/__tests__/strings.test.ts` | The ST17 map and key list gain the two new keys (as in `b-round-231/precheck-tests.py`). **New case ST-C3** (§2.7). |
| 7 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | SC1 `EXPECTED_ROW_ORDER` gains `overview-toggle` after `overview-scroll`; the SC5 count goes 8 → 9. **New case SC-C3** (§2.7). |
| 8 | `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` | l.77 only: the Overview root site literal becomes `'relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel'`, because the background token moves into a conditional (§2.4). |
| N1 | `app/lib/arrangement/overview-visibility.ts` | New (§2.3). |
| N2 | `app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx` | New (§2.7). |
| N3 | `docs/implementation/2026/quarter-IV/180-calm-3-overview-empty-toggle.md` | New (§2.8). |
| N4 | `app/lib/arrangement/__tests__/overview-visibility-persist-ui.test.tsx` | New (§2.7): OV-T3 only, in its own file so the module's in-memory value starts `null`. |

Anything else is out of scope. If a needed edit falls outside the grants, write a **STOP** (L11) and do not make the edit.

### 0.2 B's collision pre-check (L23, done)
- **Reference implementation.** `b-round-231/precheck-apply.py` (app) and `b-round-231/precheck-tests.py` (test fixes) were applied to a scratch copy of `e5507ff` outside the repo. The full diff is `b-round-231/precheck-scratch.diff`.
  - A may use it as a starting point and must still meet every clause below. `patch -p0 --dry-run` of it against a fresh `git archive HEAD app` copy gives rc 0; `patch` warns about the absolute `---` names and uses the relative `+++` names. The diff also adds B's two-case sketch as `overview-visibility-ui.test.tsx`; A replaces it with the real N2.
  - The reference test sketch is `b-round-231/reference-overview-visibility-ui.test.tsx.txt` (two cases). A writes the real N2.
- **Sweep with the app change only.** Every test file that imports the workspace, the route, the Overview, the dock, `shortcuts` or `strings` was run on the scratch: 121 files, listed in `b-round-231/l23-sweep-files.txt`. Result: **3 files / 4 tests red** (`l23-sweep-raw.log`):
  - PNR2 (`panel-radius-ui`): the Overview root site literal ended in `bg-background`. Fixed by grant 8.
  - SC1 and SC5 (`shortcuts.test.ts`): the row order and the aria row count. Fixed by grant 7.
  - ST17 (`strings.test.ts`): the `studioViewStrings` key list and plain-string map. Fixed by grant 6.
- **After the test fixes and the sketch file:** 122 files / 1,789 tests green, `tsc --noEmit` rc 0, and Biome clean on the 6 changed app files (`l23-precheck-fixed.log`).
- **Pins that stay green by design.** Do not break them:
  - OV1 (`studio-theme-obsidian`, frozen) counts the exact literal `<div className="pointer-events-none absolute inset-0 rounded-panel border border-outline" />` = 1 in `ArrangementOverview.tsx`. Keep that line byte-identical, and render it only when the project has clips (§2.4).
  - PNR4 (`panel-radius-ui`) counts `rounded-panel` = 3 in the Overview source. The new baseline element must not use `rounded-panel`.
  - DXC4 (`content-colour-ui`, frozen) and PNR4 read `overview.children[1]` as the bar-rows container. So in the empty state the baseline **replaces** the outline overlay as child 0, and child 1 stays the rows container in both states.
  - TH5 (frozen) reads the playhead tokens in the empty SSR route. The playhead keeps `bg-accent ring-1 ring-background`.
- **Mutant shown red on the scratch:** removing `!event.getModifierState('AltGraph')` turns the sketch's REF1 red, so jsdom honours `modifierAltGraph`.

### 0.3 Render conditions, timeouts and testids (L29, L31, L40)
- **Baseline browser probe** (`b-round-231/probe-overview.mjs` → `probe/baseline.json`; both viewports; the running :5173 server at `e5507ff`):
  - **Heights:** the dock is 107 px tall, set by the 160×90 video box and not by the Overview. The Overview is 64 px (h-16), with the 16 px caption row above it. The scroller `clientHeight` is 516 (1440) / 406 (1280).
  - **Empty extent:** the empty project's `data-extent` is 10.000 s, so the view frame covers the whole Overview (956 / 796 px wide). That is the "empty frame with a title" look.
  - **Without the Overview:** taking it out of layout leaves the dock and the scroller unchanged, but the caption row drops 68 px (y 98 → 166 at 1440). Hence the hidden **slot** (§2.5, D-29z309).
  - **Today:** Ctrl+Alt+O does nothing, whether the body or the Overview has focus. Chromium has no binding for it.
  - **Tab order around the Overview:** library separator → **Overview** → `arrangement-video-expand`.
- **B's scratch run** (`b-round-231/probe-calm3.mjs` on a scratch dev server at :5174 → `probe-scratch/scratch.json`, screenshots `probe-scratch/*.png`). Every recipe in §5 was run at both viewports:
  - **Empty state:** the root is transparent. The baseline is 1 px (956×1 at y 181 at 1440; 796×1 at y 219 at 1280). The outline overlay is absent, and the frame and playhead have `visibility: hidden`.
  - **Navigation:** ← in the empty Overview still moves `aria-valuenow` 0 → 5.
  - **Hide:** Ctrl+Alt+O with the Overview focused hides it. The slot is 956×64 / 796×64 at the same place, and the dock, caption and scroller are unchanged. The status reads "Overview hidden. Ctrl+Alt+O shows it again.", and the key is `'1'`.
  - **Focus:** it falls to `body`, and the next Tab reaches `arrangement-video-expand` (Chromium's sequential focus starting point; D-29z309).
  - **Persistence:** a reload keeps it hidden. Ctrl+Alt+O shows it again and removes the key.
  - **First clip:** Enter (from the body) adds a clip → `data-overview-state="full"`, a 1 px outline, and the frame and playhead visible. Ctrl+Z → empty again.
  - **Sheet:** searching "overview" lists `fit`, `overview-scroll` and `overview-toggle`.
  - 0 page errors.
- **Signals and their render branch (L29):**
  - `data-overview-state` is on the Overview root in both branches. It is `'empty'` exactly when `arrangement.clips.length === 0`.
  - `arrangement-overview-baseline` renders only in the empty branch.
  - `arrangement-overview-hidden-slot` renders only while the Overview is hidden; `arrangement-overview` is then absent.
  - The status text is in `arrangement-status` (existing).
- **L31:** rows are added to `strings.test.ts` (63 tests, 70 ms total at gate 231), `shortcuts.test.ts` (5 tests, 22 ms) and the new N2. No test in them is near 50 % of its timeout. N2 mounts the workspace the way `shortcut-sheet-ui` does (11 tests, 4,088 ms at gate 231). Keep each N2 case under 2.5 s, or split it.
- **L40 (changed testid elements):** `arrangement-overview`, `arrangement-overview-frame`, `arrangement-overview-playhead`, and the caption row of `arrangement-video-dock`. Their test hits are in the covering set `b-round-231/covering-files.txt` (32 files with N2 and N4, including `track-layout.test.tsx` per D-29z283). A hit that pins a class in a frozen file is a STOP (L11) with the hit list.

## 1. Why
Saba finds the Studio screen overloaded (SABA-B-8). In an empty project the Overview is a framed 64 px box with nothing in it: form without content (calm-studio-review §3). Live has the same Overview (6.1) and lets the user hide it (42.1, Ctrl+Alt+O). CALM-1 and CALM-2 removed the label and the helper text. This stage makes the empty Overview quiet and adds the keyboard toggle.

**Why we missed it** (policy rule for Saba-reported issues; SABA-B-8 is Saba's report): the full analysis is in CALM-1's task (round 226). In short, no round looked at the whole screen in its empty state, and the Overview was verified only as a navigation control. Lesson L39 (screen budget) is the rule that now catches this. C checks that it exists (C-LESSON-232).

## 2. Changes

### 2.1 `strings.ts` (exact)
Add these two keys to `studioViewStrings`, directly after `followOn`:
- `overviewHidden: 'Overview hidden. Ctrl+Alt+O shows it again.'`
- `overviewShown: 'Overview shown. Ctrl+Alt+O hides it.'`

Nothing else changes. `overviewLabel` and `overviewTitle` stay byte-identical.

### 2.2 `shortcuts.ts` (exact)
In group `zoom-view`, directly after `overview-scroll`, add:
`{ id: 'overview-toggle', action: 'Show / hide the overview', keys: ['Ctrl+Alt+O'], ariaKeyShortcuts: 'Control+Alt+O Meta+Alt+O' }`.

No other row moves. The sheet renders the new row from the source, so the sheet itself does not change.

### 2.3 New `overview-visibility.ts` (N1)
It uses the same pattern as `library-notice.ts` (no third storage pattern):
- `OVERVIEW_HIDDEN_STORAGE_KEY = 'czaba-studio-overview-hidden'`. There is one key per browser, **not** one per collection (D-29z309). It is a view preference of the workspace, like Live's view toggles, not a fact about the content.
- `readOverviewHidden(): boolean`:
  - returns the in-memory value first (set by the last `setOverviewHidden`);
  - else `false` on the server;
  - else `localStorage.getItem(key) === '1'`;
  - `false` if storage throws.
- `setOverviewHidden(hidden: boolean): void` sets the in-memory value. It writes `'1'` when hidden and **removes** the key when shown (in a try/catch, silent on failure), then notifies the listeners.
- `subscribeOverviewVisibility(listener): () => void`.
- No `any`, no type assertions, no comments; every statement ends with a semicolon.

### 2.4 Overview empty state (`ArrangementOverview.tsx`)
One rule (L4): **empty** ⇔ `arrangement.clips.length === 0`. It is project-level and counts clips on any track, video included (the same rule as the CALM-2b lane hint). The empty state returns after an Undo back to 0 clips.
- **Root:** add `data-overview-state={hasClips ? 'full' : 'empty'}`. The background token becomes conditional: `bg-background` when full, `bg-transparent` when empty. Every other root class, `role="slider"`, `tabIndex`, all `aria-*`, `title`, `data-*` and every handler stay unchanged.
- **Child 0:** when full, the existing outline overlay line, byte-identical (OV1). When empty, a baseline in its place, with no `rounded-panel`: `<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-outline" data-testid="arrangement-overview-baseline" />`.
- **Child 1:** the rows container, unchanged.
- **Frame and playhead:** `arrangement-overview-frame` and `arrangement-overview-playhead` get `invisible` when empty. They stay mounted, so `updateOverviewFrame` keeps writing `aria-valuenow` and `aria-valuetext` in the empty state. Their other tokens are unchanged (TH5, OV1).
- **Bbox:** unchanged in both states (h-16, full width, ±1 px).
- **Focus ring:** the existing shared ring, not touched. It stays visible on keyboard focus in both states (C row).

### 2.5 Toggle and hidden slot (`StudioWorkspace.tsx`)
- **Visibility read:** `const isOverviewHidden = useSyncExternalStore(subscribeOverviewVisibility, readOverviewHidden, () => false)`. The server snapshot is "shown" because the route is SSR (the same as the CALM-2b notice).
- **The dock's `overview` prop:**
  - hidden → `<div aria-hidden="true" className="h-16 w-full" data-testid="arrangement-overview-hidden-slot" />`. The slot keeps the caption row and every other element in place (D-29z309). The baseline probe showed the caption drops 68 px without it.
  - shown → the existing `<ArrangementOverview …/>`, with its props unchanged.
- **Key branch in the window `keydown` handler.** Place it after the floating-video Escape branch and before `const current = workspaceRef.current`. The existing early returns (shortcut sheet open, Export open, typing target) then apply to it too.
  - **Condition:** `event.code === 'KeyO' && event.altKey && (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.getModifierState('AltGraph')`.
  - **Effect:** call `preventDefault()`. If `event.repeat` is set or a pointer gesture is active (`workspaceRef.current.isPointerGestureActive()`), stop there. Otherwise:
    - `hidden = !readOverviewHidden()`;
    - `setOverviewHidden(hidden)`;
    - `setStatus(hidden ? studioViewStrings.overviewHidden : studioViewStrings.overviewShown)`.
  - **View state only:** it adds **no** arrangement history entry, and Undo does not touch it.
  - **Code-based:** it works on the Georgian layout, where `event.key` is `ო`.
  - **AltGr:** AltGr (Ctrl+Alt on Windows, e.g. Polish `ó`) is ignored, so the character still types wherever text is allowed.
- **Focus:** if the Overview has focus when it hides, the code does **not** move focus (D-29z309, the smallest honest behaviour; no new focus target is invented).
  - Chromium keeps the sequential focus starting point, so the next Tab goes to `arrangement-video-expand` (measured, §0.3).
  - The status line announces the change.
  - C measures this. If a browser drops the starting point to the top of the document, C reports a Low. It is not a STOP.

### 2.6 GATE229-S2 (`ArrangementVideoDock.tsx`)
l.889 changes from `<div className="flex min-h-4 items-baseline justify-between gap-2 text-xs leading-4 text-muted">` to `<div className="flex min-h-4 items-baseline text-xs leading-4 text-muted">`. The row has one child, so the bbox does not change (C-BBOX and the GATE229-S4 row check it). Nothing else in the dock changes.

### 2.7 Tests: new and changed cases
- **Fixes (grants 6–8):** exactly as in `b-round-231/precheck-tests.py`.
- **ST-C3** (`strings.test.ts`): both new strings equal their literals. Both mention `Ctrl+Alt+O`, which must equal `findStudioShortcut('overview-toggle')?.keys[0]`, so the status and the sheet cannot drift apart.
- **SC-C3** (`shortcuts.test.ts`):
  - `findStudioShortcut('overview-toggle')` has keys `['Ctrl+Alt+O']` and aria `'Control+Alt+O Meta+Alt+O'`;
  - the row sits in group `zoom-view`, directly after `overview-scroll`;
  - `filterStudioShortcutGroups('overview')` contains `fit`, `overview-scroll` and `overview-toggle`.
- **N2 `overview-visibility-ui.test.tsx`.**
  - **Setup:** mount like `shortcut-sheet-ui`. Reset in `afterEach` with `act(() => setOverviewHidden(false))` and `localStorage.clear()`. Find elements by testid, role and text only; no class assertions (L12).
  - **Module state (binding):** `setOverviewHidden` sets the in-memory value, and `readOverviewHidden` reads it before `localStorage`. After the first `afterEach`, a preset storage key is therefore never read in N2. No N2 case may depend on reading storage at mount; that case lives in N4.
  - **OV-E1:** with 0 clips, `data-overview-state="empty"`, the baseline exists, and the root's child 1 is the rows container. Adding one clip through the context API → `full` and no baseline. `undo()` → `empty`.
  - **OV-E2:** in the empty state, `aria-valuenow` and `aria-valuemax` are present, and ArrowRight on the focused Overview changes `aria-valuenow` (navigation unchanged).
  - **OV-T1:** Ctrl+Alt+O on the body:
    - `fireEvent` returns `false` (default prevented);
    - `arrangement-overview` is absent, and the slot exists with `aria-hidden="true"`;
    - the storage key is `'1'`;
    - the status equals `overviewHidden`.

    The Meta variant (`metaKey` + `altKey`) then shows it again: the key is removed and the status equals `overviewShown`.
  - **OV-T2 (ignored cases).** Each leaves the Overview shown and the key `null`:
    - `modifierAltGraph: true` (here `fireEvent` also returns `true`);
    - Shift added;
    - `repeat: true`;
    - the target is the library search field;
    - the shortcut sheet is open;
    - Ctrl+O without Alt;
    - Alt+O without Ctrl or Meta.
  - **OV-T3** is in **N4**, not N2 (see below).
  - **OV-T4:** the toggle adds no history entry. Undo availability is the same after hide and show, and `undo()` after a toggle undoes the previous edit, not the toggle.
  - **OV-T5:** when storage throws (a `setItem` / `getItem` spy that throws), the toggle still hides and shows within the session (in memory), with no error.
- **N4 `overview-visibility-persist-ui.test.tsx`: OV-T3 only.** Vitest isolates module state per file (default `isolate`; `vitest.config.ts` does not change it), so the in-memory value starts `null` here. One test, so the result does not depend on order (A ran `--sequence.shuffle` in round 231):
  1. set `localStorage` key `'1'`;
  2. `renderToString` of the workspace tree renders `arrangement-overview` (server snapshot "shown"); `setOverviewHidden` is never called in this file;
  3. `render` of the same tree mounts hidden: the slot exists and `arrangement-overview` is absent (client snapshot reads storage).
  Reset storage in `afterEach`. Do not import a helper that calls `setOverviewHidden` at module load.
  B verified this on the scratch: the sketch `b-round-231/reference-overview-visibility-persist-ui.test.tsx.txt` passes, and MU-4 turns it red.
- **Mutants A must show red.** Restore each one and keep the logs in `a-round-232/mutants/`.

  | Mutant | Change | Expected |
  |---|---|---|
  | MU-1 | Invert the empty-state rule (`hasClips` → `!hasClips`) | red |
  | MU-2 | Drop the AltGraph guard | red |
  | MU-3 | Drop the `event.repeat` guard | red |
  | MU-4 | Server snapshot = `readOverviewHidden` | red (OV-T3 in N4) |
  | MU-5 | `setOverviewHidden(false)` writes `'0'` instead of removing the key | red (OV-T1) |
  | MU-6 | Render `null` instead of the slot when hidden | red in N2; C-TOGGLE also checks the caption position in the browser |
  | MU-7 | Swap the two status strings | red |
  | MU-8 | Drop `invisible` from the frame | expected green in jsdom, so **browser-only** (C-OVERVIEW-EMPTY). Do not add a class pin (L12). |

### 2.8 Doc (N3)
`docs/implementation/2026/quarter-IV/180-calm-3-overview-empty-toggle.md`, in Georgian with English technical terms (TEMPLATE.md):
- l.4 is exactly `**სტატუსი:** Completed (C round 232 PASS)` (L28);
- the seven TEMPLATE headings after `## Prompt`, in order (L26);
- cite only test ids that exist (OV-E1, OV-E2, OV-T1…T5, ST-C3, SC-C3), and say that OV-T3 is in N4;
- state the reason for the hidden slot, the focus ruling and the AltGr limit.

The SABA-B-8 docs 177–179 already read `Completed`, so no other doc line is granted. `grep -rn 'In Progress (stage' docs/implementation` returns only doc 176, which is tied to the open PERF-HARNESS-SHARED-LIB-b-ii stage.

## 3. Reference: how Ableton Live 12 does it
Sources, re-fetched by B with WebFetch on 2026-10-28 (earlier capture: `b-round-71/ableton-*-20261021.txt`):
- Live 12 manual **6.1 Layout**: https://www.ableton.com/en/live-manual/12/arrangement-view/
- Live 12 manual **42.1 Showing and Hiding Views**: https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/

| # | Behaviour | Live 12 (source) | CZABA decision | C check |
|---|---|---|---|---|
| R1 | What the Overview is | 6.1: it "displays the Arrangement's entire layout of clips from start to end and can be used for zooming and navigation"; "the black outline represents the currently displayed part" | Same role. The outline is our view frame, unchanged when the project has clips | C-OVERVIEW-FIRSTCLIP |
| R2 | Gestures | 6.1: drag horizontally = scroll, drag vertically = zoom; double-click inside the outline = the whole Arrangement | Unchanged. Click = centre, double-click anywhere = Fit and ← / → = 5 s are earlier CZABA choices | C-OVERVIEW-EMPTY (gestures still work when empty) |
| R3 | Hide and show | 42.1: Hide/Show Overview = **Ctrl+Alt+O** (Win) / **Cmd+Option+O** (Mac) | Same keys (Ctrl or Cmd, with Alt/Option) | C-TOGGLE, Mac row TLM-R232-MAC |
| R4 | Discoverability | 42.1 lists it under "Showing and Hiding Views" | Listed in the sheet's "Zoom & view" group, plus a one-time status line on toggle | C-SHEET-232 |
| R5 | Empty-project look | No reference found: 6.1 and 42.1 say nothing about the Overview of an empty Arrangement (both pages searched) | CZABA/Saba: a quiet hairline, with no outline, frame or playhead | C-OVERVIEW-EMPTY |
| R6 | Toggle remembered across sessions | Not confirmed: the manual does not say, and it was not observed | CZABA/Saba: remembered per browser | C-TOGGLE-PERSIST |

**Deviations, with reasons:**
- **D1.** The empty-state hairline is CZABA's (Saba decision 3). Live documents no empty look.
- **D2.** No View-menu entry and no visible button. Saba approved only the key ("no new visible control"), and CZABA has no menu bar.
- **D3.** A one-time status message on toggle. Live documents none. Ours is there because there is no visible control: the status line, the Studio's one feedback channel, confirms the action and teaches the way back.
- **D4.** The hidden Overview leaves an empty 64 px slot. The video monitor sets the dock row height (Saba did not approve collapsing it), and the slot keeps the caption from jumping. Whether Live gives the space back is an inference, not confirmed (the fetched pages do not say). We could not without the unapproved layout change.
- **D5.** AltGr+O (Ctrl+Alt on some Windows layouts) is ignored, so that it can still type a character. On those layouts the toggle needs the left Ctrl+Alt.
- **D6.** `?` opens the sheet, not Info View (CALM-1, unchanged).

**Screen budget (L39):** this round adds no persistent text and no persistent element. It removes the empty Overview's outline, frame and playhead paint. The new status messages appear only after the user presses the key. Quieter homes considered:
- the Overview's tooltip: adding the key there is allowed but not needed, because the sheet carries it;
- the `?` sheet: chosen;
- the status line: chosen, one-time.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:**
   - HEAD is `e5507ff` and the status is empty;
   - from `store/`, `sha256sum -c --quiet` gives rc 0 on `b-round-231-r232-tree-sha256.txt`, `b-round-231-r232-granted-start-sha256.txt` and `b-round-231-r232-root-files-start-sha256.txt`.
2. **Static:**
   - `npm run typecheck` rc 0;
   - `npm run lint` rc 0, with 0 diagnostics in the grants and new files;
   - `npx biome check` on the changed app and test paths: clean.
3. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-231/covering-files.txt)` (32 files including N2 and N4), all green. Also run N2 and N4 once with `--sequence.shuffle`.
   - L32: a failure, a timeout, or a test above 50 % of its timeout is a STOP at the top of `a-round-232.md`. Report your time and the gate-231 time.
   - Add any extra file your own grep finds (L40).
4. **Mutants:** MU-1…MU-8 as in §2.7. MU-8 is browser-only.
5. **Optional browser self-check:** copy `b-round-231/probe-calm3.mjs` into `a-round-232/` and run it against :5173. Do not edit B's file. Compare the result with `b-round-231/probe-scratch/scratch.json`.
6. **code-reviewer** (3+ files changed): forward its Architecture note to B. Do not act on it outside the grants.
7. **End:**
   - `git status` shows exactly 8 `M` and N1–N4 as `??`;
   - the frozen and root lists give rc 0;
   - write `a-round-232/changed-end-sha256.txt` and `a-round-232/granted-hunks.diff` (against `b-round-231/granted-start/`; new files against /dev/null).

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720)
B's numbers are in `b-round-231/probe/baseline.json` (before) and `b-round-231/probe-scratch/scratch.json` (after, on B's scratch). The gate rows (full vitest, typecheck, build, lint, verify, e2e smoke) are `gate` and are not claimed.

| Row | Check | Pass when |
|---|---|---|
| C-SCOPE-232 | HEAD, status, hashes, hunks | <ul><li>HEAD is `e5507ff`;</li><li>8 `M` plus N1–N4;</li><li>the frozen, root and A-end lists give rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0;</li><li>the hunks are §2.1–§2.6 plus the §2.7 test changes.</li></ul> |
| C-UNIT-232 | Covering set | `covering-files.txt` (32 files) is green. ST-C3, SC-C3, OV-E1/E2, OV-T1, OV-T2, OV-T4, OV-T5 (N2) and OV-T3 (N4) exist. N2 and N4 also pass with `--sequence.shuffle`. |
| C-OVERVIEW-EMPTY | Fresh context, 0 clips, both viewports | <ul><li>`data-overview-state="empty"`.</li><li>The root background is transparent (computed `rgba(0, 0, 0, 0)`), and no element at the Overview has a 1 px `border-outline` box.</li><li>The frame and playhead have computed `visibility: hidden`.</li><li>The baseline is 1 px tall, the full Overview width, at the Overview's bottom edge.</li><li>**Pixels:** a screenshot crop of the Overview shows no outline or frame rectangle (compare `probe/ov-empty-*` before and after).</li><li>The Overview bbox equals the baseline ±1 px.</li><li>← / → on the focused Overview change `aria-valuenow`.</li><li>Double-click runs Fit (status "Fit: …").</li><li>A horizontal drag in the empty Overview does not throw (0 page errors).</li><li>**Keyboard focus ring:** visible on the empty Overview (brass pixels painted > 0, contrast against the dock ≥ 3:1).</li><li>A mouse press shows no ring.</li></ul> |
| C-OVERVIEW-FIRSTCLIP | Enter adds a clip; then Ctrl+Z | <ul><li>After Enter: `full`, a 1 px outline overlay, the frame and playhead visible, and the root background back to its before value (`rgb(14, 13, 12)`). The bars are visible.</li><li>After Ctrl+Z: `empty` again.</li><li>The same at both viewports.</li></ul> |
| C-TOGGLE | Ctrl+Alt+O from the body and from the focused Overview | <ul><li>**Hidden:** `arrangement-overview` is absent, and the slot is at the Overview's former bbox ±1 px.</li><li>The dock bbox, the caption row bbox and the scroller `clientHeight` equal the shown state ±1 px.</li><li>The status is exactly "Overview hidden. Ctrl+Alt+O shows it again."</li><li>Pressing it again shows it, with the status "Overview shown. Ctrl+Alt+O hides it."</li><li>**Negative:** in the library search field the key does nothing to the Overview; while the shortcut sheet is open, nothing happens; Ctrl+O alone and Alt+O alone do nothing; a held key (auto-repeat, ≥ 10 repeats) toggles exactly once.</li></ul> |
| C-TOGGLE-FOCUS | Overview focused, then Ctrl+Alt+O | After hiding, the next Tab lands on `arrangement-video-expand`. After a fresh hide, Shift+Tab lands on the library separator. Record `document.activeElement` honestly. |
| C-TOGGLE-PERSIST | Reload; fresh context | <ul><li>A reload keeps it hidden (key `'1'`), with 0 `layout-shift` entries after hydration.</li><li>Measure whether the SSR Overview paints before hydration removes it (C-NOTICE-231 method: FCP versus the removal time, and the per-rAF effective opacity). A visible flash is a Low, not a FAIL.</li><li>A fresh context shows the Overview.</li><li>Showing it removes the key.</li></ul> |
| C-UNDO-232 | Toggle after an edit | Add a clip, toggle twice, then press Ctrl+Z: the clip is undone (the toggle is not in history). |
| C-SHEET-232 | `?`, then search "overview" | <ul><li>The rows are `fit`, `overview-scroll` and `overview-toggle`.</li><li>The `overview-toggle` row shows `Ctrl+Alt+O` in the "Zoom & view" group.</li><li>The sheet's row count equals the source count.</li></ul> |
| C-CAPTION-232 (GATE229-S4) | Caption row at 1280 | <ul><li>The row is 16 px tall with an empty caption.</li><li>It is also 16 px with a long file name: load a local video whose name has ≥ 80 characters through "Your own video" (L25 filechooser recipe). The text truncates on one line, and the Overview below does not move.</li><li>Check both viewports, with the Overview shown and hidden.</li></ul> |
| C-BBOX-232 | D6 all-element bbox | Every element's bbox delta is ≤ 1 px against the baseline, except the Overview's own children and the listed state changes. |
| C-BUDGET-232 (L39) | Persistent text rows | Count the rows outside the timeline at S0 and S1, at both viewports, before and after: no increase. |
| C-LESSON-232 | `lessons.md` | L39 exists (the "Why we missed it" rule). |
| G232-3 | Purchase protection | <ul><li>`/studio-lab` returns 200, shows the demo badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401.</li><li>No token is issued.</li></ul> |
| LAB-SMOKE-232 | Real audio | Add, then Export WAV: 24-bit, 48 kHz, stereo. The length and RMS equal C round 231 (101.352 s; −65.21 / −21.59 / −21.54 dB). 0 page errors. |
| AN-REVIEW-232 | Doc 180 | l.4 is byte-exact `**სტატუსი:** Completed (C round 232 PASS)`; the L26 headings are present; the cited ids exist. |
| C-REF-232 | §3 table | R1–R4 match or are listed deviations; R5 and R6 are recorded as no reference / not confirmed; no unlisted difference. |
| C-SHOTS-232 | Screenshots | S0 and S1, before (B's `probe/`) and after, plus the hidden state, at both viewports. |
| TLM-R232-MAC | Tech Lead manual check | Cmd+Option+O toggles on a Mac. It cannot be claimed in the cloud: mark it `blocked` with the reason "needs a Mac". It is not a FAIL. |

**Ableton conformance** (separate from the CZABA requirement): R1–R3 are confirmed by the manual; R4 is a CZABA addition; R5 has no reference; R6 is not confirmed.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Overview navigation with clips:** a click outside the frame re-centres, ↔ drag scrolls, ↕ drag zooms, double-click runs Fit, and Space on the focused Overview plays.
- **Window shortcuts with Alt or Ctrl:** Ctrl+←/→ edge navigation, Alt+drag snap bypass, Ctrl+Z/Y, `?`, and G, A, U, M, 1/2/3. None of them changes.
- **Floating video:** expand and return, and the placeholder, still sit beside the slot or the Overview. Escape still returns the floating video.
- **Export dialog open:** Ctrl+Alt+O does nothing.
- **render-budget:** Play → Pause → Play re-renders the Overview 0 times (covering set).

## 7. Outcomes for B's next planning
- **C PASS and gate PASS:** SABA-B-8 is complete.
  - B files the bounded frontend-architect checkpoint request (`b-round-231-checkpoint-request.md`, D-29z312).
  - If round-233 planning falls on or after 2026-10-30, the next round is **REGRESSION** (`regression-last.json` is round 199; carry every `scope_additions` entry, L6).
  - Otherwise it is **SABA-B-7-ENVELOPE-DB** (reference-first, with the checkpoint addendum `b-round-229-checkpoint-request.md`).
  - Then SYS-5, then PERF b-ii.
- **C FAIL on a feature row:** a fix-up on the same grants.
- **Gate fail:** B re-runs L23 against the actual tree and grants the fix precisely.

## 8. Root notes
- **Checkpoint:** SABA-B-8 ends with this round. `b-round-231-checkpoint-request.md` asks for one bounded frontend-architect checkpoint after C PASS. It covers the two `useSyncExternalStore` storage helpers (`library-notice.ts`, `overview-visibility.ts`) and the growth of the `StudioWorkspace` keydown handler (GATE228-S2/S4 signals). It is non-blocking.
- **Still pending and non-blocking:** `b-round-229-checkpoint-request.md` (wanted before SABA-B-7), and the `b-round-211`, `-221` and `-225` requests.
- **Saba:** SABA-Q-NOTICE-ONE-ROW (C round 231 N7: the notice fits one row when the library is 56 px wider), SR-230-1…10 and the `screen-review-230.md` addendum await him.
- **Loop folder:** B's scratch copy and scratch dev server were outside the repo (`/tmp/b231-scratch`, port 5174, now stopped). `store/` was not touched: HEAD `e5507ff`, empty status, and the frozen list gives rc 0 at the end.
