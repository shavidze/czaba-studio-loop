# CURRENT TASK — Round 24: Home on separators and the detail-panel ref (A round-11 follow-ups, part 2; D-29o)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

## Why this round

C round 23 (`c-round-23.md`, `c-round-23.json`) is a **PASS**: R23-F1, F2, N, R, S, U, Doc, G23-1..3 and the export sanity check all pass, with vitest at 1007/1007. Part 1 of the lane-header a11y follow-ups is done.

C found one new **medium** bug, **C-R23-01**:
- React 18.3.1's server `writeStringChunk` flushes its whole 2048-byte view when a 3-byte Georgian character does not fit, unused zero bytes included.
- `/studio-lab` SSR therefore has 4 NUL bytes, and the music name button's `aria-label` keeps two U+FFFD for the whole session.
- B re-checked this independently: a live curl shows 4 NULs; `/`, `/products`, `/about` and `/studio/middle-east` show 0; `react-dom-server.node.development.js` l.129 writes `currentView` in full.

The fix needs `app/entry.server.tsx` or `package.json`. Neither is in A's ownership (plan §6), and the only narrow-grant precedent (Header.tsx) rested on explicit user permission. So C-R23-01 goes to the Tech Lead as a **concrete permission request** (§7 and `b-round-23.md` §3). It is not deferred and not blocking.

This round therefore does the scheduled **part 2** in `StudioWorkspace.tsx`, which is related and small:
1. **Home on a focused `role=separator` no longer seeks to 0.**
2. **The detail panel is found through an explicit ref** instead of `scroller.nextElementSibling`. The ref is passed through a `panelRef` prop, following the `asideRef`/`bodyRef` precedent in `ArrangementLibrary`. It is **not** a `forwardRef` (see §2.2 for why).

Each is one small behaviour or refactor item.

**Previous round:** archived as `tmp/studio-real-loop/tasks/round-23.md` (sha `ec319195…`).

**References:**
- B's record: `b-round-23.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29o).
- Origin of the items: `a-round-11.md` §9 (follow-ups); `current-task` round 23 §7.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline:** HEAD `c5ed47b` plus the round-6..23 dirty tree.
- `git status --short` has **46 lines**, identical to `c-round-23/gates/git-status-end.txt`. B's copy is `b-round-23-git-status.txt`.
- Frozen for this round: `../tmp/studio-real-loop/b-round-23-tree-sha256.txt`, **51 files**. That is round 22's 50, minus `StudioWorkspace.tsx` and `ArrangementDetailPanel.tsx`, plus:
  - `ArrangementLane.tsx` (`cdaf07f4…`);
  - doc 029 (`38414675…`);
  - `app/entry.server.tsx`, frozen explicitly because of C-R23-01.
  B verified 51 OK on the live tree.
- Dispatch snapshots of A's three files are in `../tmp/studio-real-loop/b-round-23-snapshots/`:
  - `StudioWorkspace.tsx` `47e33554…`;
  - `ArrangementDetailPanel.tsx` `f28e069f…`;
  - `track-layout.test.tsx` `fba42d8a…`.
- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit or delete them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- `StudioWorkspace.tsx` (§2.1, §2.2);
- `ArrangementDetailPanel.tsx` (§2.2: only the optional `panelRef` prop and `ref={panelRef}` on the root `<section>`);
- red-first tests in `track-layout.test.tsx` (§2.3);
- implementation doc 030.

**In (C):** R24-H, R24-HC, R24-F, R24-R, R24-S, R24-U, R24-Doc, G24-1..3, the export sanity check, and the C-R23-01 information record (§4).

**Not in this round** (scheduled; not PASS):
- **C-R23-01** (medium): awaits the Tech Lead's answer to the permission request in §7.
- **SRW-13** (next feature round, stage 1; see §7):
  - FB-04 clip gain;
  - FB-05 pan;
  - FB-14 master volume/mute and the overload indicator;
  - the R13-M4 export hard-clip;
  - M1/L8, if the Tech Lead run has not happened;
  - the volume-click UX note.
  It may split into stages. After it, in dependency order:
  - SRW-14 → SRW-15 → SRW-16;
  - SRW-17;
  - SRW-18 → SRW-19;
  - SRW-20;
  - then the SRW-21 adapter, then T12.
- **`ArrangementLibrary.tsx:549` comment:** its `biome-ignore` reason still cites a process ("B task §9 requires …") rather than a technical reason. This is the same class as round 23's l.661 item and root L6. It is scheduled for the first round that edits `ArrangementLibrary.tsx`, or at the latest the fix round before the final regression. The file is frozen here.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), and the manual list in §4.7.
- **Other later items:**
  - the lane overlay `/60` (SRW-14 or SRW-18);
  - the footer selected-clip Latin text;
  - the Latin `range` in the group hint;
  - folded clips staying in the accessibility tree (doc 029 TODO; a candidate for SRW-17, where groups and folding are redesigned).

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the global Home key everywhere else (it must still seek to 0);
- Arrow keys on the three separators (lane height ±8, detail height, library width);
- the lane refit after the detail panel's height transition (R11-P2a, `transitionend`);
- detail panel open, close, drag and auto-fit;
- the floating-video placement, which listens to the library's `transitionend` on another element and must stay unaffected.

Audio, video sync, export and the scheduler are **not** affected. No context, graph, dock, scheduler or transport file changes, and G24-2 proves it.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md` (component edit). This round deliberately does **not** use `forwardRef`; record why in doc 030 (§2.2);
   - `AGENT_DISCOVERABLE_CODE.md` (naming);
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
   - `GEORGIAN_DOCS.md` (doc 030).

   Also read `prompts/new-component.md` (editing rules) and run the `pre-flight` skill.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-23-tree-sha256.txt` and expect **51 OK**. Run `git status --short` and expect **46 lines**, identical to `c-round-23/gates/git-status-end.txt`. Compare your three files with the snapshot shas above. Report any difference **before** doing anything else, and do not "fix" it.
3. Read:
   - `StudioWorkspace.tsx` l.200–250 (the target helpers), l.440–480 (`refreshTrackLaneLayout`, `handleDetailPanelTransitionEnd`), l.995–1180 (the global keydown handler) and l.1300–1430 (the render: the `onTransitionEnd` wrapper, the scroller, `<ArrangementDetailPanel>`);
   - `ArrangementDetailPanel.tsx` l.395–420 and l.596–660;
   - `track-layout.test.tsx` l.170–230 (`LayoutProbe`, `live`, `mountTrackLayout`) and l.543–563 (the R11-P2a refit test).
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Home on a focused separator does not seek (`StudioWorkspace.tsx` ~l.1125)

**Today:** the window keydown handler runs `event.preventDefault(); current.seekTo(0)` for Home on any non-slider target. The three separator handlers (lane height `ArrangementLane.tsx:283`, detail height `ArrangementDetailPanel.tsx` `handleSeparatorKeyDown`, library width `ArrangementLibrary.tsx:315`) only handle arrows. So Home on a focused separator moves the playhead to 0, even though the user is resizing a panel.

**Contract (B, D-29o; the smallest honest behaviour):**
- With focus on an element whose `role` is `separator`, Home is still `preventDefault`ed. This keeps today's no-scroll behaviour. But it does **not** seek: the transport position, play state, selection, status text and the separator's `aria-valuenow` are all unchanged.
- Separators get **no** new Home/End behaviour (no "jump to minimum size"). End stays unhandled as today.
- Every other target keeps today's Home exactly:
  - non-slider, non-separator targets: `preventDefault` + `seekTo(0)`;
  - sliders: native behaviour.
  - The modifier early-return order is unchanged.
- Use the existing `isSeparatorTarget` helper (l.242). Do not add a new helper and do not change `isSliderTarget`.

**Rationale.** Keeping `preventDefault` means the only change the user sees is "no seek". Skipping it would let Chrome's default Home scroll the timeline scroller to the top while a lane handle is focused, which would be a new behaviour.

### 2.2 Explicit detail-panel ref (`StudioWorkspace.tsx` l.447, l.474; `ArrangementDetailPanel.tsx` l.68, l.402, l.607)

This is a no-behaviour refactor.

**Why not `forwardRef`** (B, D-29o, after reading the frozen tests):
- `render-budget.test.tsx` (frozen) counts renders through a fake devtools hook, keyed by `fiber.type.name` for **function** types. It asserts that `ArrangementDetailPanel` renders 0 times per Play frame and more than 0 after a selection change (l.240, l.420, l.560).
- A `forwardRef` export makes the fiber type an object. The count under that name would then be 0, and that frozen test would fail.
- An inline `forwardRef(...)` would also make Biome re-indent the ~250-line body, so the diff could not be audited.
- The codebase already passes DOM refs as ordinary props: `ArrangementLibrary`'s `asideRef?: RefObject<HTMLElement>` and `bodyRef` (l.134–135, l.362, l.435).

**Exact change:**
- **`ArrangementDetailPanel.tsx`:**
  - add `panelRef?: RefObject<HTMLElement>;` to `ArrangementDetailPanelProps` (l.68), plus the `RefObject` type import if it is missing;
  - add `panelRef` to the destructured parameters of `export function ArrangementDetailPanel` (l.402), so it is not spread into `contentProps`;
  - add `ref={panelRef}` on the root `<section data-testid="arrangement-detail-panel">`;
  - nothing else changes: the name, the function form, the hooks, the markup and the classes stay. `detail-panel.test.tsx`'s `CapHarness` (frozen; it passes no ref) must still compile and pass.
- **`StudioWorkspace.tsx`:**
  - add `const detailPanelRef = useRef<HTMLElement>(null);` and pass `panelRef={detailPanelRef}` to `<ArrangementDetailPanel>`;
  - in `refreshTrackLaneLayout`, `const panel = detailPanelRef.current;`;
  - in `handleDetailPanelTransitionEnd`, compare `event.target === detailPanelRef.current`;
  - the `instanceof HTMLElement` guards may become null checks with the same meaning;
  - nothing else changes: the metrics, the animation check, the `useCallback` dependencies (a ref is stable) and the wrapper's `onTransitionEnd`.
- After the change, `nextElementSibling` must not appear anywhere in `StudioWorkspace.tsx`.
- `render-budget.test.tsx` and `detail-panel.test.tsx` stay unchanged and green.

### 2.3 Tests (`app/lib/arrangement/__tests__/track-layout.test.tsx`), written first

**Order:**
1. Write the new tests against the **unchanged** source files.
2. Run `npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx` and paste which tests fail and why.
3. Implement, then re-run.

Required (at least **3** new `it` blocks; local helpers inside the file are allowed):

1. **R24-H (red on old code).**
   - Mount with `mountTrackLayout`, then move the playhead to a non-zero time through the context (for example `live(api).seekTo(5)`) and read it back through the context to confirm it is 5.
   - Then, for **each** of the three separators: the music lane's `role=separator` named `მუსიკა სიმაღლე`, `arrangement-detail-separator` and `arrangement-library-separator`. The library separator renders only while the library is expanded. If the fixture starts with it collapsed, expand it in the test before focusing that separator. For each one:
     - focus it;
     - dispatch a real `keydown` `Home` that bubbles to `window` (`fireEvent.keyDown(separator, { key: 'Home', code: 'Home' })`).
   - Assert, through the context, that:
     - the position is still 5;
     - the event's `defaultPrevented` is `true`;
     - the separator's `aria-valuenow` is unchanged;
     - the status text is unchanged.
   - On the old code, the position becomes 0, so the test must fail.
2. **R24-HC (control; green before and after).** Home still seeks to 0 from:
   - `document.body`;
   - a focused fold button.

   A Home on a focused volume `input[type=range]` does not seek. This guards the global contract against over-broad fixes.
3. **R24-F (red on old code).**
   - Render `ArrangementDetailPanel` alone with the minimal props, as `detail-panel.test.tsx`'s `CapHarness` does (the provider, `selection={null}` and so on), plus `panelRef={createRef<HTMLElement>()}`.
   - Assert that `ref.current` is the element with `data-testid="arrangement-detail-panel"`.
   - On the old code the unknown prop is ignored, so `ref.current` is `null` and the test fails.
   - The red run is a vitest run. tsc on the test file is expected to fail until the prop exists; say so in the report.

Also:
- The existing R11-P2a refit test (l.543, "skips the lane refit while the detail panel animates and refits once on its height `transitionend`") must stay **unchanged and green**. It is the behaviour oracle for §2.2.
- No test may be deleted or weakened.

### 2.4 After the code

- Self-check the edge cases:
  - the library collapsed, so its separator is not rendered;
  - a folded lane, where the handle has `pointer-events-none` but stays focusable;
  - Home with Ctrl or Shift;
  - Home during playback, where the separator must not seek either;
  - the detail panel collapsed (its ref still points at the section).
- Run `npx biome check --write` **only** on your 3 code/test files, then a read-only `npx biome check ./app`.
- Run the `code-reviewer` agent (at least 3 files changed) and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`**, or reasoning on the diff. Never mutate in place.
- Run the §5 commands.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{graph.client.ts,video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,graph.test.ts,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx,detail-panel-polish.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..029}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1: the Home condition. §2.2: `detailPanelRef`, its two uses and `ref=` on `<ArrangementDetailPanel>` |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.2 only: the optional `panelRef` prop (its type, the destructuring, and the `RefObject` import if needed) and `ref={panelRef}` on the root `<section>` |
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | A | §2.3: new `it` blocks and local helpers only |
| `docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-24.md`, `a-round-24/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-24.md`, `c-round-24.json`, `c-round-24/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: 47 lines.** The three code/test files are already among the 46 (` M` / `??` / `??`), so the only new line is:

```
?? docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md
```

### 3.3 Frozen this round

**Frozen:** all 51 files in `b-round-23-tree-sha256.txt` and everything else under `store/`. That includes:
- `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementClip.tsx`, `ArrangementContext.tsx` and `app/entry.server.tsx`;
- `graph.client.ts`, `schedule.ts`, `model.ts`, `panels.ts`, `video-sync.ts` and `ArrangementVideoDock.tsx`;
- docs 015–029, `app/types/*` and `components/ui/Modal.tsx`.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**` and `../backend/**`;
- user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..23 work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900, and 1280×720 for R24-H only.

**Harness rules:**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press` or Tab.
- No source instrumentation.
- Mutation checks run only in a scratch copy outside `store/`.

**Setup:** the demo loads with an empty arrangement. Use the round-11 `lay11` layout (`c-round-11/scripts/lay11.js`: video 0–6.008, music 0–16, stems 2–18, SFX 4–6). Record the clip table.

### 4.1 R24-H: Home on each separator does not seek

At 1440×900 (and repeated once at 1280×720):
1. Click the ruler at about 5 s, or seek there with the transport. Record the position, which must be non-zero.
2. Focus each separator in turn: the music lane height handle (`მუსიკა სიმაღლე`), the video lane height handle, `arrangement-detail-separator` (with the detail panel open) and `arrangement-library-separator` (with the library expanded).
3. For each one, press real `Home`.

**Oracle, for each separator:**
- the transport position/time display is unchanged (±1 frame);
- `document.activeElement` is still the separator;
- its `aria-valuenow` is unchanged;
- the timeline scroller's `scrollTop`/`scrollLeft` and `window.scrollY` are unchanged;
- the status text is unchanged.

**Also:**
- **During playback:** start Play, focus the music handle and press Home. The playback keeps running from its current position, with no jump to 0.
  - The position read 200 ms later is greater than the position at the press.
  - Then stop.
- **Arrows still work on each separator:**
  - lane height ↑/↓ = ∓8/±8;
  - the detail separator resizes;
  - the library separator ←/→ changes the width.
  Report the before and after values.

### 4.2 R24-HC: the global Home is unchanged elsewhere

From a position other than 0, press real Home with focus on:
- `body` (after clicking an empty header area);
- a lane fold button;
- a selected clip (click it first).

Each returns the position to **0**.

With focus on a volume range input, Home sets that slider to its minimum (native behaviour) and does **not** seek. Restore the volume afterwards.

### 4.3 R24-F: the detail-panel refactor changes no behaviour

- **R11-P2a refit after the height transition (quick):**
  - with `lay11` at 1440×900 and the detail panel collapsed, record the lane heights;
  - real click on the detail toggle (open);
  - after the 300 ms transition, the lanes are refitted once. Record the heights;
  - toggle again (close) and record again.

  **Oracle:** the same values as C round 21 §2.6 / round 11 R11-P2a for the same viewport and layout (C reports the reference it uses). The panel's height ends at its open height or 36, and no lane height is left mid-way.
- **Detail separator drag** (synthetic pointer harness, as before): the panel resizes, and on release the lanes refit with auto-fit on.
- **Floating-video regression (quick):** expand the video (R13-F2 quick). The box is placed after the library's `transitionend`, as in round 14.
- **Static check:** `grep -c nextElementSibling app/components/arrangement/StudioWorkspace.tsx` is 0.

### 4.4 R24-R: adjacent regressions (quick, one run each)

- Fold and unfold by click and by Space on the music lane; the transport stays stopped.
- Header Tab order on the music lane is unchanged (fold → name → M → S → volume → height).
- Space on a focused separator: today's behaviour is unchanged. Report what it does and compare it with the round-23 run.
- Library drop of `სრული მიქსი` onto music at 7: one clip.

### 4.5 R24-S, R24-U and R24-Doc

**R24-S (static, read-only):** use `diff -u` of the dispatch snapshots in `b-round-23-snapshots/` against the live files.
- `StudioWorkspace.tsx` changes only:
  - the Home condition;
  - the `detailPanelRef` declaration;
  - its two read sites;
  - `panelRef=` on `<ArrangementDetailPanel>`.
- `ArrangementDetailPanel.tsx` changes only:
  - the `panelRef` line in the props interface;
  - the `RefObject` import, if it was missing;
  - `panelRef` in the destructured parameters;
  - `ref={panelRef}` on the root `<section>`.

  Nothing in the function body is re-indented. It is still a plain function named `ArrangementDetailPanel`, with no `forwardRef`.
- `track-layout.test.tsx` shows only added lines.

**R24-U:**
- the §2.3 cases exist and are green;
- A's red-first output shows R24-H and R24-F failing on the old code;
- C runs mutations in a scratch copy outside `store/`:
  - reverting the Home condition makes R24-H fail;
  - removing `ref={panelRef}` from the `<section>` makes R24-F fail;
  - **optionally**, making `handleDetailPanelTransitionEnd` compare against the wrong element (for example `null`) makes the l.543 refit test fail. This shows the existing test guards the refactor.

  Report how each mutation was done.

**R24-Doc:** doc 030 exists and is in Georgian. It states:
- the separator Home contract and its rationale (preventDefault is kept, there is no seek and no new Home/End);
- the ref refactor: why `nextElementSibling` was fragile, and why a `panelRef` prop was used instead of `forwardRef` (render-budget counts renders by name, the body would be re-indented, and `asideRef` is the precedent);
- the tests.

It must match the code.

### 4.6 Gates

**G24-1:**
- tsc 0;
- vitest = **1007** + A's new tests, with at least 3 new `it` blocks and 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs);
- the build passes;
- Biome 0 errors on `./app` (read-only). The warning count must not exceed round 23's 218 warnings + 1 info.
- `render-budget.test.tsx` and `detail-panel.test.tsx` are green **and unchanged** (their sha256 is in the frozen list).

**G24-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-23-tree-sha256.txt` gives **51 OK**;
- `git status --short` shows the 46 baseline lines plus exactly the 1 line in §3.2 (47 lines);
- `Header.tsx` is identical to HEAD;
- nothing else under `store/` changed.

**G24-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts`.

**Real export sanity:** one real `WAV-ის ექსპორტი` through the dialog on `lay11`.
- Report the frames, duration, NaN count and full-scale sample count.
- **Oracle:** the duration equals the projectEnd shown in the dialog, NaN is 0, and the header is valid.
- **Reference:** 864 000 frames = 18.000 s.
- The R13-M4 hard-clip is a known carry (1800 full-scale samples).

**C-R23-01 information record (not PASS, not FAIL):**
- the NUL-byte count of `curl -s http://127.0.0.1:5173/studio-lab` (round 23: 4);
- the code points of each lane name button's `aria-label` after hydration.

This round does not touch the stream. The record shows whether the byte boundary moved with this round's markup change.

**Not re-run this round:** RF5-3, R3-V1, R3-V2, R3-V4, R5-L3, R11-P3 sync and R22-M1/M2. No audio, sync, dock, scheduler or transport change happened, and G24-2 proves it. They are not PASS for round 24; their latest evidence is in rounds 21–22.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- **C-R23-01** (medium, SSR NUL; awaits the Tech Lead, §7);
- C-R6-02 and C-R8-01 (Tech Lead quiet Chrome).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything, and the uncommitted round-6..23 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, and C's python probes in rounds 21–22;
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push);
- `Content-Type: text/html` without a charset in `entry.server.tsx` (observation; part of the same Tech Lead question).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**Tech Lead manual checks:** R23-1/2 (the round-4 scrollbar), R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, Lenis `/studio/*`, and the positive MP4/MOV import path.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-23-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
grep -c nextElementSibling app/components/arrangement/StudioWorkspace.tsx
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check: Home on a focused lane handle on `/studio-lab` keeps the position, with no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-24.md`:**
1. the pre-flight gate;
2. the red-first output, then the green output;
3. the diff summary for the 3 files;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-24.md` and `c-round-24.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID), or **not run** (with the budget reason);
- the positions before and after Home per separator;
- the R11-P2a heights and their reference;
- the setup mapping;
- the gates;
- the C-R23-01 information record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

### C-R23-01 — the Tech Lead decision (requested in `b-round-23.md` §3)

The two fix options:
- **(a)** Upgrade React to 19, whose `writeStringChunk` writes only `subarray(0, writtenBytes)`. This is a dependency change across the store.
- **(b)** A narrow grant of `app/entry.server.tsx` to A: replace the `PassThrough` with a tiny `Transform` (its own small module, for example `app/lib/ssr-nul-filter.server.ts`, with tests) that drops `0x00` bytes from the HTML stream. A valid UTF-8 HTML document never contains `0x00`, so only the padding React mistakenly flushes is removed.

**Oracle for either option:**
- the `/studio-lab` HTML (and the other Georgian SSR pages) has NUL count 0;
- no DOM attribute contains U+FFFD after hydration;
- a unit test reproduces the React padding with a real `renderToPipeableStream` whose Georgian text crosses a 2048-byte boundary, and shows the filtered output is exact;
- bots (`onAllReady`) and browsers (`onShellReady`) both stream;
- purchase protection is unchanged;
- because this touches shared SSR infrastructure, the round includes a broad SSR page regression (`/`, `/products`, a product page, `/account` anonymous, `/studio/middle-east`, `/studio-lab`).

As soon as the Tech Lead answers, B schedules the round **before** further feature rounds.

### Then: SRW-13 (FB-04 clip gain, FB-05 pan, FB-14 master volume/mute and the overload indicator)

SRW-13 stage 1 is the export hard-clip (R13-M4) together with the master bus (master gain/mute in the graph and in the offline export), so that the overload indicator has a real signal. Clip gain, pan and the meters follow as separate stages. Each stage follows the full user request; nothing is cut.

### After SRW-13

- SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo, never audio stretch) → SRW-16 (FB-10 markers);
- SRW-17 (FB-12 track groups);
- SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
- SRW-20 (range export, MP3);
- the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission);
- T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 24 -StartPhase A` and a higher limit.
