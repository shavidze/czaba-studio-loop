# CURRENT TASK — Round 40: C bugs from the round-39 record — the detail panel content fits its height (unsaved Clip Gain marker, info column overlap; reason lines measured only)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-14
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13).
- Decision record: **D-29z5** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-39.md`.
- Round size: **two tightly related C bugs**, one defect family (the detail panel content does not fit its height), **one source file**, plus one measurement-only record (DETAIL-REASON-FIT). No new feature.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B time (2026-10-14 16:10 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **23 → 23** during B's gate run (round 39 saw a bun/icacls storm). Every A and C run records the count (`tasklist | grep -ci node.exe`). Under load, re-run a timed-out file alone and report both runs; never weaken a criterion.

## Why this round

**Round 39 result** (`c-round-39.md`, `c-round-39.json`): **C FAIL on one Low bug only, C-R39-01.** Every other ID passed: G39-1..3 (`npm run verify` exit 0, 1312/1312), R39-S, R39-ST (the refusal status now returns), R39-PM-2/3/RAW/VID/KEPT-TAB, R39-PO (unit-only), R39-MN, R39-CR, R39-K, R39-U (mutations a–h + b2), R39-Doc.

The workflow puts C's bugs first. The two bugs are one family, in one file (`ArrangementDetailPanel.tsx`); the third item is measured only:

1. **C-R39-01 (Low, C evidence).** At the default 144 px height the marker text `შეუნახავია — Enter ინახავს, Esc აბრუნებს` wraps to **3 lines** (48 px) in the `w-32` Clip Gain slot. The content scroller (`clientHeight` 107, `scrollHeight` 122) clips the 3rd line ("აბრუნებს") by **15 px**, at 1440×900 and 1280×720. While the field has focus, the teal `focus-visible:ring-brand` ring also hides the orange `border-warning`, exactly when the field is pending.
2. **C-R30-01 (Low, C evidence, pre-existing).** At 1280×720 with the panel open and a range shown, the content box is 85 px (69 px inside the padding). The info column's `truncate` lines (title, `ხაზი …`) have flex min-height 0, so they **shrink and overlap**; `scrollHeight = clientHeight = 85`, so nothing scrolls (`c-round-30.md` §10, `c-round-30/shots/gui-1280x720.png`).
3. **DETAIL-REASON-FIT (Low, B probe only; measurement-only this round, no code change).** The disabled Clip Gain reasons are long: video **345.5 px** nowrap, group **320.6 px**. In the 128 px slot they wrap to 3 lines (48 px), the same height as the clipped marker. The range group reason (`w-44`) wraps to 2 lines (`b-round-39/measure-reason-1440.txt`). **Not changed this round:** `truncate` would leave a prefix such as "ვიდეო კლიპს Clip Ga…" as the only visible text, and the full reason would be reachable only by hover `title` or screen-reader browse mode. The inputs are disabled, so keyboard and touch users could not reach it. That is an information loss, not a pure fix. C measures the real states (R40-RS); if C confirms clipping, it becomes a C-evidenced bug with its own design round (for example shorter reason strings).

**B's measurement** (gstack `/browse`, 1440×900, a temporary DOM element only, no source change; `b-round-39/measure-1440.txt`):

| Quantity | px |
|---|---|
| Clip Gain slot width | 128 |
| font / line height | 12 / 16 |
| `0 dB` button width | 44.2 |
| "შეუნახავია" nowrap | 69.8 |
| full marker text nowrap | 257.5 |
| scroller without marker | `clientHeight` 107 = `scrollHeight` 107 |
| a 1-line marker on its own row | clips **3 px** (does not fit) |
| the marker inline with the button: 44.2 + 4 + 69.8 | **118 ≤ 128** (10 px spare) |

So the only placement that adds **0 px** of height is one visible line next to the `0 dB` button. The full sentence cannot fit on one line in any reasonable slot width.

**Round 39 checkpoint:** round 39's 5 paths are **ready for a root checkpoint with C-R39-01 open** (D-29z5; round 37 precedent: checkpoint ≠ PASS). If root commits them, it must happen **before A starts**, with exactly these 5 paths.

**C-R39-INFO-KEPT-PREMISE:** since round 38, a refused fader press keeps focus in the Clip Gain field. So a "kept text" test must blur the field with a **REAL Tab while gesture 41 is held** (C's PM-KEPT-TAB), not with a Master click.

## Baseline

B verified on 2026-10-14 16:10–16:16 (`b-round-39/gates.txt`):
- HEAD **`6c7b4bb`**. `git status --short` shows round 39's **5 paths** plus root's **17 untracked `.codex/agents/*.toml`**:
  - ` M app/components/arrangement/ArrangementDetailPanel.tsx` (sha `4249f4f3`);
  - ` M app/contexts/ArrangementContext.tsx` (`91fa12d6`);
  - ` M docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` (`9d9f2122`);
  - `?? app/lib/arrangement/__tests__/pending-status.test.tsx` (`f2cd4b53`);
  - `?? docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md` (`7bf223eb`).
  - Each sha equals the one C verified in round 39.
- **New frozen list** `../tmp/studio-real-loop/b-round-39-tree-sha256.txt` → **383 OK**: round 38's 380 plus `ArrangementContext.tsx`, doc 037 and `pending-status.test.tsx`.
- Protected 4/4 OK (C G39-2). tsc 0. vitest **71 files, 1312/1312**.
- Biome `./app` (C round 39): **2 errors**, the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, **do not touch**. Plus 218 warnings and 1 info. Your files must add 0 errors and 0 warnings.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-39-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementDetailPanel.tsx` `4249f4f3`, `038-studio-lab-pending-status.md` `7bf223eb`.
- **If root has committed round 39 before you start:** record the new HEAD. Check that the commit contains exactly those 5 shas, that the 383 list is still OK, and that your 2 files equal their snapshots. If any differs, **stop and report**.
- **Environment note:** the dev log showed `.kilo/worktrees/graceful-mousepad` at 15:59. It is not in `git status`, and it is not yours. Do not touch new untracked paths; record any you see.

Rules:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `AGENTS.md` and the agent files are root's.
- Only root commits or pushes.

## 0. Scope

### 0.1 The contract (D-29z5), `ArrangementDetailPanel.tsx` only

**A. Unsaved Clip Gain marker (C-R39-01).** The condition `isClipGainPending` and the element's `id` (`clipGainPendingId`), `data-testid="arrangement-detail-clip-gain-pending"` and the input's `data-pending` / `aria-describedby` / `border-warning` are **unchanged**.

| Item | Result |
|---|---|
| Placement | The `0 dB` button and the marker share one row: a wrapper `div` with `flex items-center gap-1` (a `min-w-0` where `truncate` needs it). The button's attributes, handlers and `data-testid` are unchanged. With no marker, the row shows only the button, at its current position |
| Visible text | Only **`შეუნახავია`**, as a plain text node, the first child of the marker element. The **marker element itself** (the `<p>`, a flex item in the button row) gets `text-warning truncate min-w-0`, so it can never wrap; `truncate` on an inline span would not work |
| The rest | ` — Enter ინახავს, Esc აბრუნებს` in a `<span className="sr-only">` inside the same element. So the element's `textContent` is **exactly** the round-39 string, and the accessible description is unchanged |
| `title` | The marker element gets `title` = the full string. When pending, the input's `title` = the full string too: `clipGainReason ?? (isClipGainPending ? <full string> : undefined)`. Otherwise the title is unchanged |
| Focus ring | While pending, the input uses `focus-visible:ring-warning` instead of `focus-visible:ring-brand`, in the same `cn(…)` call as `border-warning`. twMerge drops `ring-brand`. Not pending: unchanged (`ring-brand`) |
| Geometry | The marker adds **0 px** to the Clip Gain column: the content `scrollHeight` with the marker = without it, at 1440×900 and 1280×720 at the default height |

- Keep the full string and the label in module-level constants (discoverable names, not exported). Derive the `sr-only` part as `FULL.slice(LABEL.length)`, so JSX whitespace trimming cannot drop the leading space. Use them for the visible part, the `sr-only` part and both `title`s, so they cannot drift. The two parts must concatenate to exactly `შეუნახავია — Enter ინახავს, Esc აბრუნებს`.
- If the A smoke shows that the marker `<p>` is truncated at 1440×900 (`scrollWidth > clientWidth`, or `getBoundingClientRect().width < 69`), **stop and report**. Measure the `<p>`, not an inline span: inline elements report `scrollWidth` 0. Do not change font size, slot width or panel height.

**B. Reason lines (DETAIL-REASON-FIT): no change this round.** The Clip Gain reason `<p>` and the range reason `<p>` stay byte-identical. The reason is the information trade-off described in "Why this round". C measures them (R40-RS).

**C. Info column (C-R30-01).**
- The `truncate` `<p>`s in the info column (the selection title l.399, the lane line l.402, the group lane names l.425) get `shrink-0`, so each keeps its 16 px line box.
- If the column is taller than the content box, the existing `overflow-y-auto` content scroller scrolls. **No overlap.**
- No other class in the column changes. `DETAIL_PANEL_DEFAULT_HEIGHT_PX`, `openHeightCap` and the lane auto-fit are unchanged.

**Rejected (D-29z5):**
- (a) shortening the hint by deleting information: the hint stays in `sr-only` and `title`;
- (b) widening the slot: the full text is 257.5 px and does not fit on one line even in `w-44`, and the neighbours would narrow;
- (c) raising the default height: it costs timeline space and changes the D-29j measurements;
- (d) `sr-only` only: sighted users would lose the marker text;
- (e) `aria-live`: it would announce on every keystroke (MARKER-LIVE-REGION, rejected);
- (f) `truncate` on the disabled reason lines this round: it hides the reason from keyboard and touch users (see above).

**Unchanged (C checks):**
- the round-39 marker semantics (PM-2/3/RAW/KEPT-TAB/VID) and the status restore (R39-ST);
- the D-29z2 kept text; the raw-text early return; Enter/Escape/blur commit and revert;
- the `0 dB` reset (`onMouseDown` preventDefault + click) and the Tab order (field → `0 dB` → next control);
- Delete/Backspace on a focused field;
- the round-38 no-jump faders; the range Apply;
- the panel's outer height and the first lane's top.

**Out of this round** (queued, not deferred scope):
- round 41: Pan group (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES);
- round 42: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH;
- round 43: MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER;
- 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY;
- polish: SSR-LAYOUT-EFFECT-WARN, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE;
- A-R38-REVIEW-TOUCH (Tech Lead R38-T first).

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- the frozen suites `pending-status`, `clip-gain`, `detail-panel`, `detail-panel-polish`, `track-layout`, `gesture-guard`, `fader-guards`, `fader-click`, `delete-selection-ui`;
- the Clip Gain flows of rounds 34–39;
- the detail panel geometry at 1440×900 and 1280×720;
- the info column in a group selection.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md` and `prompts/studio-feature.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:** HEAD; `git status --short`; `sha256sum -c ../tmp/studio-real-loop/b-round-39-tree-sha256.txt | grep -vc ': OK$'` → 0; your 2 files against the snapshot shas; protected 4/4; `node.exe`.
3. **Read:**
   - `ArrangementDetailPanel.tsx` l.37–53 (constants, `cn`), l.217–330, l.385–552 (the content markup);
   - `app/styles/app.css` l.64–78 (tokens);
   - `pending-status.test.tsx` l.20–30 and l.430–520 (PM1–PM6: they read `textContent`, `aria-describedby`, `data-pending`, the class);
   - `clip-gain.test.tsx` l.760–800 (the reason assertions);
   - `c-round-39.md` §R39-PM and `c-round-30.md` §10;
   - B's `b-round-39/measure-1440.txt` and `measure-reason-1440.txt`.
4. **Re-check (report each):**
   - grep every test file under `app/lib/arrangement/__tests__/` (all of them, not a sample) for `arrangement-detail-clip-gain-pending`, `arrangement-detail-clip-gain-reason`, `arrangement-detail-reason`, `arrangement-detail-clip-gain-reset` and the info column. If one asserts the exact `className`, `parentElement`, `title` absence, or a `getByText` with the full marker string as a single text node, that test pins the old markup: **stop and report**. Do not amend it. Note: `getByText(full string)` would not match text split across a span.
   - Run `npx biome check app/components/arrangement/ArrangementDetailPanel.tsx` before and after: no new diagnostic.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementDetailPanel.tsx`

The diff is limited to:
- the marker string constants;
- the marker's markup (row wrapper around the `0 dB` button + marker, the visible span, the `sr-only` span, `title`);
- the input's `title` and its `cn(…)` pending classes (`border-warning focus-visible:ring-warning`);
- `shrink-0` on the three info `truncate` `<p>`s.

Rules:
- Tokens only. No hardcoded colours, no custom CSS, no arbitrary values, no inline styles.
- No comments, no new exports, no `any`, no type assertions.
- Semicolons.
- Nothing else in the file changes.

### 2.2 Doc 038 (narrow)

Edit only these parts:
- the `**სტატუსი:**` line → `Round 39 C PASS (ხილვადობის გარდა — C-R39-01); Round 40 — D-29z5.`;
- the layout-decision section: the round-40 placement, with B's numbers and your smoke numbers;
- the clipping entry in the problems list → its round-40 solution;
- one new section `## Round 40 — detail panel-ის ჩატევა (D-29z5)`, covering:
  - C-R39-01 and C-R30-01, plus DETAIL-REASON-FIT as a measurement-only record (rejected f);
  - the contract;
  - rejected a–f;
  - the files;
  - the tests (red/green);
  - the C IDs;
  - the Ableton row (§4.8);
- one TODO line.

Write in Georgian per `GEORGIAN_DOCS.md`. Nothing else changes.

### 2.3 Tests (red-first, in `store/`)

**New file:** `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx`.
- Mount the way `pending-status.test.tsx` / `clip-gain.test.tsx` do; copy what you need, and do not import from another test file.
- jsdom has no layout. These tests pin the **markup contract**; C's browser run is the geometry evidence.
- Write every case first, run it against the **current** source, and record red/green per case in `a-round-40/red-run.txt`.

| ID | Case | Expected | Old source |
|---|---|---|---|
| F1 | SFX clip; type `3` | `marker.classList` contains `truncate` and `min-w-0`; `marker.childNodes[0]` is a text node equal to `შეუნახავია`; `marker.querySelector('.sr-only').textContent` is exactly ` — Enter ინახავს, Esc აბრუნებს` (leading space); `marker.textContent` = the full string; `marker.title` = the full string | red |
| F2 | F1 | `marker.parentElement === reset.parentElement`, and that parent's class contains `flex` and `items-center` | red |
| F3 | F1, then Enter; separately F1, then Escape | While pending: input `title` = full. After each: input `title` absent, no marker, and the reset button is still in the row | red (pending title) |
| F4 | F1 | The input class contains `focus-visible:ring-warning` and `border-warning`, and **not** `focus-visible:ring-brand` / `border-outline`. With the text equal to the stored text: `focus-visible:ring-brand`, no `ring-warning` | red |
| F5 | Must-not: a video clip selected; then a group selection | The Clip Gain reason `<p>` and the range reason `<p>`: `textContent` = the full reason, no `truncate` class, no `title`; the `aria-describedby` targets are unchanged | green |
| F8 | A clip selected; then a group selection | The info title `<p>` and the lane `<p>`, and the group lane-names `<p>`, have class `shrink-0` | red |
| F9 | Must-not: F1, then click the reset button (the round-39 PM6 path: commit `3` with Enter first, type `5`, click `0 dB`) | +1 `Clip Gain`, stored gain unset, text `0.0`, no marker | green |

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions, no comments;
- exact strings come from the rendered DOM, or from the source where they are exported;
- no snapshot tests;
- no timers.

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.9 and the full `npx vitest run` (1312 + your new `it` count).
- **Biome:** run `npx biome check --write` **only** on your 2 TS/TSX files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent. Report its findings and your dispositions.
- **Browser smoke** (A, one run if the server is up; `a-browse.json`; not a PASS claim). At 1440×900, default height, SFX clip, type `3`, then record:
  - `arrangement-detail-content` `scrollHeight`/`clientHeight` before and after;
  - the marker `<p>` rect and its `scrollWidth`/`clientWidth` (on the `<p>`, not a span);
  - the focused input's computed `box-shadow`.
- **Mutations:** only in a scratch copy outside `store/`. They are C's; A may skip them.
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `6c7b4bb` with round 39's 5 paths and root's 17 `.codex` lines, or a newer root commit that contains exactly the round-39 shas.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.1 only |
| `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md` | A | §2.2 only |
| `../tmp/studio-real-loop/a-round-40.md`, `a-round-40/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-40.md`, `c-round-40.json`, `c-round-40/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

- `a-round-39/`, `c-round-39/` and `b-round-39/` are read-only.
- **Expected `git status --short` at the end** (root has not committed): the round-39 lines **plus** one new `?? app/lib/arrangement/__tests__/detail-panel-fit.test.tsx`, and root's 17 `.codex` lines.
  - `ArrangementDetailPanel.tsx` and doc 038 stay ` M` / `??`; their content changes.
  - If root committed round 39 first: ` M` for those 2 files and `??` for the new test.

### 3.3 Frozen this round

- All **383** files in `b-round-39-tree-sha256.txt`, and everything else under `store/`.
- This includes:
  - `ArrangementContext.tsx`, `pending-status.test.tsx`, doc 037;
  - `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `useRelativeFaderDrag.ts`, `fader.ts`, `StudioWorkspace.tsx`, `panels.ts`, `model.ts`, `graph.client.ts`, `app/hooks/index.ts`;
  - every existing test file;
  - docs 001–037.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900 with the detail panel expanded (a real click on `arrangement-detail-toggle`; check `aria-expanded` first, because the state persists), plus the 1280×720 cases named below.

**Harness rules (unchanged):**
- **REAL** = `$B click` at the element centre, or `$B press` / `$B type`.
- **SYNTHETIC** (label it): pointer events at computed coordinates, the separator gesture (id 41), window `pointerup`/`blur`, `blur()`.
- C may read state through the existing `window.__c` reader; label it.
- No source instrumentation. Mutations only in a scratch copy outside `store/`.
- Every run and gate records `node.exe`.

**Layout L40** = L39: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

**Geometry reader:** C's `geo()` from round 39, extended with:
- the content scroller's `scrollHeight`/`clientHeight`;
- the marker rect;
- the marker `<p>`'s `scrollWidth`/`clientWidth` and rect width;
- each reason `<p>`'s height;
- each info `<p>`'s top/bottom.

**Checkpoint order if the session may end:** G40-2 → R40-S → R40-PM → R40-RS → R40-INFO → R40-MN → R40-U → the rest. Write `c-round-40/checkpoint.md` as you go.

### 4.1 R40-PM — the marker fits (REAL inputs)

| Case | Steps | Expected |
|---|---|---|
| PM-1 | 1440×900, default height. Record the geometry. REAL click the SFX header, REAL click Clip Gain, REAL type `3` | `data-pending="true"`; the marker `<p>` shows `შეუნახავია` and is not truncated (`scrollWidth ≤ clientWidth` **and** rect width ≥ 69 px, B's nowrap width; measured on the `<p>`, because an inline span reports 0); the marker height = **16 px** (1 line); the marker rect is fully inside the content scroller rect and inside the Clip Gain column; scroller **`scrollHeight` after = before** (±0); the panel height and the first lane top are unchanged (round 39: 144, lane 235); the `0 dB` button is in the same row (same top ±2 px); `aria-describedby` → the marker id, whose `textContent` = the full string; `title` = the full string on the marker and on the input; the input's computed `box-shadow` contains `rgb(245, 158, 11)` while focused; screenshot |
| PM-1280 | PM-1 at 1280×720 | As PM-1 (round 39: panel 144, lane 123) |
| PM-2 | REAL Enter | +1 `Clip Gain`; status `Clip Gain: Soft impact — +3.0 dB.`; no marker; the input `title` is absent; the ring is back to brand; the button stays where it was |
| PM-3 | REAL type `5`, REAL Escape | `3.0`, no marker, 0 entries |
| PM-KEPT-TAB | Type `6` → synthetic separator 41 → **REAL Tab** (blur during the gesture) → `pointerup` 41 | The field shows `6` with the marker, 0 entries, and the status returns (round 39). REAL click into the field + REAL Tab → +1 `Clip Gain` `+6.0 dB`, no marker |
| PM-RAW | Stored `3.0`; REAL type `3` | Marker shown; REAL Tab → 0 entries, `3.0`, no marker |
| PM-RESET | Stored `3.0`; type `5` (marker shown); REAL click `0 dB` | +1, gain unset, `0.0`, no marker |
| PM-TAB | Focus the input, then REAL Tab | Focus moves to `0 dB`, then to the same next control as in round 39 (record it) |
| PM-R30 | The C-R30-01 state: 1280×720, panel open, a range shown (as in `c-round-30.md` §10). Type `3` in Clip Gain | The marker adds **0 px** (scroller `scrollHeight` with = without the marker), and the marker is visible or reachable by scroll; record the numbers |

### 4.2 R40-RS — reason lines (DETAIL-REASON-FIT): measurement only

| Case | Steps | Expected |
|---|---|---|
| RS-VID | 1440 and 1280, default height: select the video clip | Record each reason line's height and line count, the content scroller `clientHeight`/`scrollHeight`, how many px of the reason are clipped (its bottom − the scroller bottom), and a screenshot. The markup must be unchanged (R40-S) |
| RS-GRP | Select two clips (REAL Shift/Ctrl-click or marquee; name the method) | The same record for both reason lines (range and Clip Gain) |
| RS-NONE | Clear the selection | The same record |

Verdict: **record only**. A ran no code for this item, so it gets no PASS/FAIL. If a reason line is clipped in a real state, open a C-evidenced bug (Low) with the numbers. B then designs it separately: shorter strings, or another placement that does not hide the reason from keyboard/touch users.

**Before/after honesty:** C cannot run the old markup in the browser. B's probe numbers (`b-round-39/measure-reason-1440.txt`) are the "before"; mark them as B's.

### 4.3 R40-INFO — info column (C-R30-01)

- In the C-R30-01 state (1280×720, panel open, a range shown), select the SFX clip.
- **Expected:**
  - each info `<p>` is 16 px high;
  - no two lines overlap (`p[i].bottom ≤ p[i+1].top`);
  - if the column is taller than the box, the content scroller has `scrollHeight > clientHeight` and scrolling reaches the last line;
  - screenshot before and after the scroll.
- Repeat once with a group selection.
- Compare with `c-round-30/shots/gui-1280x720.png`.

### 4.4 R40-MN — must-not

| Case | Expected |
|---|---|
| MN-1 | R39 ST-1 once: the refusal status returns after `pointerup` 41 |
| MN-2 | CR-1: Clip Gain `3` → a REAL click on music Volume → `[…, Clip Gain]`, focus on music Volume |
| MN-3 | CR-4: Clip Gain `3` → a REAL click on the music header → +1 `Clip Gain`, focus BODY; Delete deletes the music clip |
| MN-4 | PG-DEL: SFX selected → REAL music Volume → REAL Delete → nothing deleted |
| MN-5 | The range Apply without a gesture → `მონიშვნა: …` status; the panel height is unchanged |
| MN-6 | The panel resize (keyboard on the separator, `DETAIL_PANEL_KEY_STEP_PX`) at 120 px (the minimum): the marker stays 1 line; the content scrolls if needed; record it |

### 4.5 R40-CR, R40-K

- **R40-CR:** the round-39 PM-VID and ST-2 once each.
- **R40-K:**
  - Mute/Solo/Master Mute: one entry each;
  - REAL Space with focus on music Volume toggles playback, and a second Space stops it (as in R39-K);
  - the lane height drag (synthetic): 0 fader entries.

### 4.6 R40-S, R40-U, R40-Doc

**R40-S** (static, read-only): `diff -u` of `b-round-39-snapshots/` against the live files.
- **`ArrangementDetailPanel.tsx`:** changes only the §2.1 items.
- **Doc 038:** only the §2.2 parts.
- 383 OK; the new test file exists.
- No `any`, no `@ts-ignore`, no type assertion, no new `//` comment, no hardcoded colour, no arbitrary value.

**R40-U:**
- The new tests are green, and A's red run matches §2.3: F1–F4 and F8 red on the old source; F5 and F9 green.
- `pending-status.test.tsx` (22) is green **unchanged**.
- **Mutations** in a scratch copy outside `store/`. Each must make a test fail; report which.

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | The marker back on its own row (outside the button's row) | F2 |
| (b) | No `sr-only` span: the full text visible in one span | F1 |
| (c) | No `title` on the marker | F1 |
| (d) | No `focus-visible:ring-warning` | F4 |
| (e) | `ring-warning` also when not pending | F4 |
| (f) | `truncate` added to the Clip Gain reason | F5 |
| (g) | The marker's visible label moved into an inline `<span className="truncate">`, with `truncate` removed from the `<p>` | F1 |
| (h) | No `shrink-0` on the lane line | F8 |
| (i) | The input `title` = the full string even when not pending | F3 |

**R40-Doc:**
- Doc 038 changes only as §2.2 says, and matches the code.
- Its Ableton row matches §4.8.

### 4.7 Gates

**G40-1:**
- tsc 0;
- vitest = 1312 + the new `it` count, 0 failures (record `node.exe`; on a timeout under load, re-run that file alone and report both runs);
- build passes;
- Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218 + 1 info;
- green: `detail-panel-fit`, `pending-status` (22), `clip-gain`, `detail-panel`, `detail-panel-polish`, `track-layout`, `gesture-guard`, `fader-guards` (71), `fader-click` (26), `delete-selection-ui`, `ArrangementContext.test.ts`.

**G40-2:**
- protected 4/4 OK;
- `sha256sum -c b-round-39-tree-sha256.txt` → 383 OK;
- `git status --short` = §3.2;
- HEAD at the start and the end.

**G40-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: root `CartContext` `GET /api/cart`, root GA consent-denied events, the dev-module requests, the homepage hero image from `images.unsplash.com`.

**Not re-run this round** (not PASS):
- exports and WAV integrity;
- video sync and C-R27-01;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

There is no new behaviour this round. Sources are as in round 39: Live 12 Reference Manual §3.2 "The Status Bar" (https://www.ableton.com/en/live-manual/12/live-concepts/, captured 2026-10-13, `b-round-37/ableton-live-concepts-20261013.txt`). No new browsing and no video.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| An unsaved value-box entry is marked | none found | **Unconfirmed** | CZABA requirement (C-R37-01 / C-R39-01); round 40 changes only how it fits | R40-PM |
| The marker hint is shortened to one visible word, with the full text on hover / for screen readers | none | **Not applicable** (CZABA layout) | CZABA layout decision D-29z5 | R40-PM |
| Info lines never overlap; the panel scrolls instead | none | **Not applicable** | CZABA layout fix (C-R30-01) | R40-INFO |

C gives two verdicts per row. Never write "Ableton does it this way" for an unconfirmed or not-applicable row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab` and the hydrated `aria-label`s. Round 39: 5 NUL at 11729, 28025/28026, 58745/58746; 63 611 bytes; 1 U+FFFD label. Your byte changes may move them.
- **Open low items:**
  - R26-M1;
  - 4b-2 groups 2–4 (rounds 41–43);
  - A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS;
  - DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN;
  - DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - round 39 checkpoint-ready (5 paths, C-verified shas, C-R39-01 open); round 40 becomes ready only after C PASS;
  - the 17 `.codex/agents/*.toml` files;
  - the `.kilo/worktrees` observation;
  - `npm run test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - the dev server's availability and the machine load.
- **Tech Lead manual checks:** R38-T (including A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-39-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementDetailPanel.tsx docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
npx vitest run app/lib/arrangement/__tests__/detail-panel-fit.test.tsx
npx vitest run app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-39-snapshots/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementDetailPanel.tsx
diff -u ../tmp/studio-real-loop/b-round-39-snapshots/038-studio-lab-pending-status.md docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than `detail-panel-fit.test.tsx`.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- If it is down, say so in the report and do the offline items (G40-1/2, R40-S, R40-U, R40-Doc).
- Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-40.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case) and the green run;
3. the diff summary per file;
4. the smoke geometry (scroller before/after, the marker `<p>` rect and widths, the ring colour);
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-40.md` and `c-round-40.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R40-PM table with geometry and screenshots (1440, 1280, the C-R30-01 state);
- the R40-RS measurement record (B's probe numbers labelled as B's) and the R40-INFO table;
- the mutation table;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH:** if R38-T confirms a touch jump, B schedules the pre-specified fix: a non-passive `touchstart` + `preventDefault` on Volume, Pan and Master, with Zoom excluded.
- **Round 41 — 4b-2 group 2 (Pan, Lane only):**
  - a `keydown` on the Pan slider clears the blur suppression (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK). A `change` without a keydown stays ignored, so frozen `fader-guards` l.363–430 stay green;
  - the Lane's Pan bookkeeping also ends on `window` `blur` (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES).
- **Round 42:** FADER-KEY-ENTRIES (re-read C's R30-K record first), A-R29-REVIEW-1, A-R33-REVIEW-TOUCH.
- **Round 43:** MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER.
- **Then:**
  - 4c (round-9 M1/L8, PREVIEW-VOLUME-IDENTITY) + polish (SSR-LAYOUT-EFFECT-WARN, docs notes);
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 40 -StartPhase A` and a higher limit.
