# CURRENT TASK — Round 23: lane-header a11y follow-ups (A round-11) in `ArrangementLane.tsx` (D-29n)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this round.** C round 22 (`c-round-22.md`, `c-round-22.json`) is **PASS** with no new bug. C-R21-01 is closed (R22-M1: the beep 60.7 ms after the mute is −240 dBFS; R22-M2: a real 2.9 dB/ms ramp). There is no open C bug that A can fix (C-R6-02 and C-R8-01 wait for the Tech Lead's quiet Chrome). So the milestone fix round starts: the A round-11 follow-ups, split by file.

This round is **part 1: `ArrangementLane.tsx` only**:
1. the lane fold button gets `aria-controls`;
2. the track-name button gets `focus-visible:ring-inset`;
3. the `:661` `biome-ignore` reason gets technical wording (comment only).

Two related behaviour items plus one comment line, all in one lane header file.

**B text correction (D-29n).** Round 22's §7 and plan D-29m also listed "the silent fold refusal during a gesture" for this round. That item was **already fixed in round 16** (A round-11 deviation 9, D-29c, doc 025 l.56, C round 16 PASS). `StudioWorkspace.tsx:482-486` writes `GESTURE_EDIT_BLOCKED_MESSAGE` during a gesture. It is not scope here. C re-checks it only as a regression (R23-F2).

**Previous round.** Archived as `tmp/studio-real-loop/tasks/round-22.md`.

**References.**
- B's record: `b-round-22.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29n).
- Origin of the items: `a-round-11.md` §7 pass 4 ("the optional `ring-inset` on the track-name button") and §9 (follow-ups); doc 020 l.121.
- Precedents in the same codebase:
  - `aria-controls` via `useId()`: `ArrangementDetailPanel.tsx` l.410, l.630, l.650;
  - the technical `biome-ignore` wording: `ArrangementDetailPanel.tsx` l.620 (root L6 fix, round 18).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline.** HEAD `c5ed47b`, plus the round-6..22 dirty tree. It has **45 lines**, identical to `c-round-22/gates/git-status-end.txt` (B re-checked: identical; copy in `b-round-22-git-status.txt`).
- Frozen files for this round: `../tmp/studio-real-loop/b-round-22-tree-sha256.txt`, **50 files**. That is round 21's 49, minus `ArrangementLane.tsx` and `track-layout.test.tsx`, plus `graph.client.ts`, `graph.test.ts` and doc 028. B verified 50 OK on the live tree.
- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit them or delete them. Root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- `ArrangementLane.tsx`: §2.1–§2.3;
- red-first tests in `track-layout.test.tsx` (§2.4);
- implementation doc 029.

**In (C):** R23-F1, R23-F2, R23-N, R23-R, R23-S, R23-U, R23-Doc, G23-1..3 and the export sanity check (§4).

**Not in this round** (scheduled; not PASS):
- **Round 24** (part 2, `StudioWorkspace.tsx` + `ArrangementDetailPanel.tsx` + a test file):
  - Home on a focused `role=separator` must not trigger the global seek (`StudioWorkspace.tsx:1125`; `isSliderTarget` does not cover separators);
  - the detail panel is found via `scroller.nextElementSibling` (l.447, l.474). This becomes an explicit ref, which needs a `forwardRef` on `ArrangementDetailPanel` (React 18).
- **Then** SRW-13 (FB-04 clip gain, FB-05 pan, FB-14 master volume/mute and the overload indicator; the R13-M4 export hard-clip; M1/L8 if the Tech Lead run has not happened). It may split into stages. After it, in dependency order: SRW-14 → SRW-15 → SRW-16, SRW-17, SRW-18 → SRW-19, SRW-20. Then the SRW-21 adapter, then T12.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), and the manual list in §4.7.
- The lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- fold/unfold by click and by Space (Space must not start the transport);
- file drop on the video lane and library drop on audio lanes, because the lane body gets a new `id` attribute;
- the header's Tab order and focus rings;
- the fold refusal during a gesture (round 16).

Audio, video sync, export and the scheduler are **not** affected: no context, graph, dock, scheduler or transport file changes, and G23-2 proves it.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md` (component edit);
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (class change);
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests);
   - `GEORGIAN_DOCS.md` (doc 029);
   - `AGENT_DISCOVERABLE_CODE.md` (naming).
   Also read `prompts/new-component.md` (editing rules) and run the `pre-flight` skill (assumptions, simplicity, scope, success criteria).
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-22-tree-sha256.txt`. Expect **50 OK**. Run `git status --short`. Expect **45 lines**, identical to `c-round-22/gates/git-status-end.txt`. Report any difference **before** doing anything else, and do not "fix" it.
3. Read `ArrangementLane.tsx` in full, `ArrangementDetailPanel.tsx` l.400–420 and l.600–660, and `track-layout.test.tsx` l.1–300 (the `mountTrackLayout` helper and the fold test at l.273).
4. Post the pre-flight gate at the top of your report.

## 2. A: the change (`app/components/arrangement/ArrangementLane.tsx`)

### 2.1 `aria-controls` on the fold button

**Decision (B, D-29n).** The fold button controls the **lane body**: the `<div ref={laneBodyRef}>` at l.515, which holds the clips. Fold changes its height and stops rendering the clip bodies. The same lane's row also hides the volume row in the header, but the header contains the button itself, and a control that points at its own ancestor is meaningless. The detail panel uses the same pattern (`useId` → `contentId` on the controlled content).

Exact rule:
- add `useId` to the existing `react` import; inside `ArrangementLane`, `const laneBodyId = useId();`;
- the lane-body `<div>` gets `id={laneBodyId}`. Nothing else on that element changes (`ref`, classes, `style`, handlers and `data-testid` stay);
- the fold `<button>` gets `aria-controls={laneBodyId}`. `aria-expanded`, `aria-label`, `title`, the handlers, the classes and `data-testid` stay;
- the element exists whether the lane is folded or not (it does today), so the reference never dangles.

### 2.2 `ring-inset` on the track-name button

On the name button (l.431), add `focus-visible:ring-inset` to the class string, right after `focus-visible:ring-2`. No other class changes. This is the same pattern as the fold button and the compact `＋` (round 11 pass 3), so the ring is drawn inside the button and is not clipped by the header's `overflow-hidden` with `pt-0` on folded and tight lanes.

### 2.3 The `:661` reason text (comment only)

Replace the process reference with the technical reason, verbatim from the detail panel (l.620):

```
{/* biome-ignore lint/a11y/useSemanticElements: a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator */}
```

The rule name stays `lint/a11y/useSemanticElements`. Biome must report no new "unused suppression" or error for this line.

**Nothing else changes in this file.** In particular:
- `handleFoldKeyDown`/`KeyUp` (the Space handling);
- the height handle;
- the drop handlers;
- M/S, the volume slider, density, the classes of other elements.

### 2.4 Tests (`app/lib/arrangement/__tests__/track-layout.test.tsx`), written first

**Order:**
1. Write the new tests against the **unchanged** `ArrangementLane.tsx` and run `npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx`. Paste which tests fail and why. Both new behaviour tests must fail on the old code.
2. Then implement and re-run.

**Required (at least 2 new `it` blocks):**
- **aria-controls**, for every lane in the fixture:
  - the fold button's `aria-controls` is non-empty;
  - `document.getElementById(value)` resolves to an element inside that lane's own row (`[data-track-id]`), and that element is **not** inside the header;
  - for a lane that has clips, the element contains that lane's `[data-clip-id]` nodes;
  - all ids are unique across lanes;
  - after a fold click, `aria-expanded` is `false` and the same `aria-controls` still resolves to an element in the same row. After an unfold, the same holds.
- **ring-inset**, on both a folded lane and an unfolded lane: the track-name button (`name: '{track} — აქტიური ხაზის არჩევა'`) has `focus-visible:ring-2`, `focus-visible:ring-inset` and `focus-visible:ring-brand` in its class list.

No test may be deleted or weakened. The existing fold test (l.273) and the round-16 refusal test (around l.359 / l.965) stay green and unchanged.

### 2.5 After the code

- Self-check (edge cases: many lanes, a lane with no clips, the video lane, a folded lane).
- `npx biome check --write` **only** on your 2 code/test files, then a read-only `npx biome check ./app`.
- Three files changed, so run the `code-reviewer` agent and report its findings and your dispositions.
- **Mutation checks only in a scratch copy outside `store/`.** In round 22, A mutated `graph.client.ts` in place, and the shared dev server could pick it up (A round-22 deviation 4). From this round on, A and C both mutate only in a copy outside `store/`, or reason on the diff when a copy cannot run.
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
?? docs/implementation/2026/quarter-IV/{016..028}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.1–§2.3 only: the `useId` import and call, `id` on the lane body, `aria-controls` on the fold button, one class on the name button, and the l.661 comment |
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | A | §2.4: new `it` blocks only (a small local helper is allowed) |
| `docs/implementation/2026/quarter-IV/029-studio-lab-lane-header-a11y.md` | A | new doc (Georgian, `docs/implementation/TEMPLATE.md`) |
| `../tmp/studio-real-loop/a-round-23.md`, `a-round-23/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-23.md`, `c-round-23.json`, `c-round-23/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: 46 lines.** `ArrangementLane.tsx` (` M`) and `track-layout.test.tsx` (`??`) are already among the 45, so the only new line is:

```
?? docs/implementation/2026/quarter-IV/029-studio-lab-lane-header-a11y.md
```

### 3.3 Frozen this round

**All 50 files in `b-round-22-tree-sha256.txt`, and everything else under `store/`**, including:
- `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementClip.tsx`, `ArrangementContext.tsx`;
- `graph.client.ts`, `schedule.ts`, `model.ts`, `panels.ts`, `video-sync.ts`, `ArrangementVideoDock.tsx`;
- docs 015–028, `app/types/*` and `components/ui/Modal.tsx`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..22 work;
- in-place mutation of `store/` files (§2.5);
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

Viewports: 1440×900 for everything, plus 1280×720 for R23-N.

**Harness rules:**
- "Real click" means `$B click` at the element centre, and keys mean real `$B press`/Tab.
- `$B type` goes only into an **enabled, focused** input.
- No source instrumentation.
- Any mutation check runs in a scratch copy outside `store/`.

**Setup.** The demo loads with an empty arrangement (C round 22 §5). For lanes with clips, use the round-11 `lay11` layout (`c-round-11/scripts/lay11.js`: video 0–6.008, music 0–16, stems 2–18, SFX 4–6). Record the clip table.

### 4.1 R23-F1 — the fold button references the lane body

For each of the 4 lanes, read in the page:
- `aria-controls` on `[data-testid=arrangement-track-fold]`;
- `document.getElementById(value)`. Use `getElementById`, not a CSS selector: React `useId` values contain `:`.

**Oracle:**
- the value is non-empty and the 4 values are unique;
- the element exists, sits inside the same `[data-track-id]` row as the button and outside `[data-testid=arrangement-track-header]`;
- on `lay11`, it contains that lane's `[data-clip-id]` nodes;
- after a real click on the fold button: `aria-expanded="false"`, the row is 36 px, and the same id still resolves inside the same row. After a real click again: `aria-expanded="true"`, the row returns to its previous height and the id still resolves;
- Space on the focused fold button folds the lane and the transport stays stopped (round 11 contract).

### 4.2 R23-F2 — the fold refusal during a gesture (regression of round 16 G1)

Hold a clip drag with the round-16 harness (synthetic pointer; CDP denies `Input.dispatchMouseEvent`), then activate the fold button (click or Space).

**Oracle:**
- the status reads `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`;
- the row height and `aria-expanded` are unchanged;
- after release, one real click folds the lane.

### 4.3 R23-N — the name button's focus ring is inside its bounds

At **1440×900 and 1280×720**:
- on a **folded** lane (36 px), and on a **tight** lane, reach the track-name button with real Tab from the fold button. Only the video lane can be tight (height 52–59; audio lanes have a 60 px minimum), so set the video lane to 52 with real ↑ presses on its focused height handle;
- **Oracle:**
  - `document.activeElement` is the name button and `:focus-visible` matches;
  - the computed `box-shadow` contains `inset`;
  - a screenshot crop of the header shows the full ring, with no edge cut by the header's top edge or `overflow-hidden`.
- Report the button rect and the header rect (top inset in px).
- **Reference:** the fold button already has `ring-inset`. Its computed `box-shadow` must also contain `inset` (unchanged).

### 4.4 R23-R — adjacent regressions (quick, one run each)

- **File drop** (round-21 `dropFiles`) of `beeps-6s-vp9-opus.webm` onto the video lane body: one clip at 0–6.008, the drop hint shows during dragover.
- **Library drop** (round-21 `place`) of `სრული მიქსი` onto the music lane at 7: one clip.
- **Header Tab order** on an unfolded audio lane (real Tab): fold → name → M → S → volume. On the video lane at full height: fold → name → `＋ საკუთარი ვიდეო` → M → S → volume. This is the same as before; report the sequence.
- **R11-P2 quick:** fold to 36 px with M/S usable (real click on M → `aria-pressed` true, then back). The height handle's ↑/↓ moves by ±8.

### 4.5 R23-S, R23-U and R23-Doc

**R23-S (static, read-only):** `git diff -- app/components/arrangement/ArrangementLane.tsx`, compared with the hunks that existed at dispatch (`ArrangementLane.tsx` was already ` M`), adds only:
- `useId` in the react import, and the `laneBodyId` declaration;
- `id={laneBodyId}` on the lane body;
- `aria-controls={laneBodyId}` on the fold button;
- `focus-visible:ring-inset` on the name button;
- the l.661 comment text.

The "before" is B's dispatch snapshot `../tmp/studio-real-loop/b-round-22-snapshots/ArrangementLane.tsx` (sha `5b427e3e…`, equal to the live file at dispatch). Use `diff -u` of the snapshot against the live file. Nothing else in the file changes. The same folder holds the dispatch `track-layout.test.tsx` (sha `426586b3…`); its diff must show only added `it` blocks (and an optional local helper).

**R23-U:**
- `track-layout.test.tsx` contains the §2.4 cases and is green;
- A's report shows the red-first run with both new behaviour tests failing;
- C runs one **mutation check** in a scratch copy outside `store/`:
  - removing `aria-controls` makes the aria-controls test fail;
  - removing `focus-visible:ring-inset` from the name button makes the ring test fail.
  Report how it was done.

**R23-Doc:** doc 029 exists and is in Georgian. It states the `aria-controls` target and its rationale, the ring fix, the comment change and the round-16 correction (the fold refusal was already done), and it matches the code.

### 4.6 Gates

- **G23-1:**
  - tsc 0;
  - vitest = **1005** + the number of new tests A reports, with **at least 2 new `it` blocks** and 0 failures. If the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs;
  - the build passes;
  - Biome 0 errors on `./app` (read-only), and no suppression warning on `ArrangementLane.tsx` l.661.
- **G23-2:**
  - protected hashes 4/4 OK;
  - `sha256sum -c b-round-22-tree-sha256.txt` gives **50 OK**;
  - `git status --short` shows the 45 baseline lines plus exactly the 1 line in §3.2 (46 lines);
  - `Header.tsx` is identical to HEAD;
  - nothing else under `store/` changed.
- **G23-3:** anonymous `/studio-lab`, opened directly and via the header link:
  - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
  - media only from the 2 demo MP3s and `blob:`;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
  - `/studio/middle-east` shows "Sign in required".

  These are known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts` (a Vite module, not an R2 host).
- **Real export sanity:** one real `WAV-ის ექსპორტი` through the dialog on the **`lay11` layout** (text corrected: the demo itself loads empty). Report the frames, duration, NaN count and the full-scale sample count.
  - **Oracle:** duration = the projectEnd shown in the dialog, NaN 0, a valid header.
  - **Reference:** 864 000 frames = 18.000 s, as in rounds 16–22.
  - The R13-M4 hard-clip is a known carry (round 22: 1800 full-scale samples).

**Not re-run this round** (no audio, sync, dock, scheduler or transport change; G23-2 proves it): RF5-3, R3-V1, R3-V2, R3-V4, R5-L3, R11-P3 sync, R22-M1/M2. They are not PASS for round 23. Their latest evidence is rounds 21–22.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

Root (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..22 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4 (in-place mutation seen by the dev server; restored, hash-verified), and C's stuck python probes in rounds 21–22 (killed by C);
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

**SRW-13 UX note (not a bug):** a click on a volume slider jumps to the click point (native range). Ableton faders do not jump. This is recorded for SRW-13.

Tech Lead manual checks: R23-1/2, R12-L4 (real drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, Lenis `/studio/*`, and the positive MP4/MOV import path. Note: "R23-1/2" is the scrollbar check from round 4. Its ID collides in name only with this round's R23-F/N/R/S/U; C must not mix them.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-22-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat -- app/components/arrangement/ArrangementLane.tsx
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check: Tab to a folded lane's name button and fold/unfold on `/studio-lab` with no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-23.md`:**
1. the pre-flight gate;
2. the red-first test output, then the green output;
3. the diff summary (`ArrangementLane.tsx` lines touched);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-23.md` and `c-round-23.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (budget, with the reason);
- the aria-controls values and resolved elements;
- the focus-ring rects and the computed `box-shadow`;
- the setup mapping;
- the gates;
- carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 24** (part 2), in 3 files: `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx` and a test file.
  - Home on a focused `role=separator` (lane height, detail, library) no longer seeks to 0. **The smallest honest behaviour:** the global Home is skipped for separators, and separators get no new Home/End behaviour in this round.
  - `scroller.nextElementSibling` → an explicit ref via `forwardRef` on `ArrangementDetailPanel`. This is a no-behaviour refactor: the lane refit after the panel's height transition must stay the same (R11-P2a, `transitionend`).
- **Then:**
  - SRW-13 (FB-04 clip gain, FB-05 pan, FB-14 master volume/mute and the overload indicator; the R13-M4 hard-clip; M1/L8 if still open; the volume-click UX note). It may split into stages;
  - SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo, never audio stretch) → SRW-16 (FB-10 markers);
  - SRW-17 (FB-12 track groups);
  - SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
  - SRW-20 (range export, MP3).
- **Then** the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission), then T12.
- **Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 23 -StartPhase A` and a higher limit.
