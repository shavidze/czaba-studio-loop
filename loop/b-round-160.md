# B round 160 → round 161 planning (D-29z126)

Date: 2026-10-25 · Author: B · Advisor: **used**. It was available, and B called it after orientation and before writing. Advice followed:
- the V-3c split is by owner, with the Library first;
- every spec-gap icon ruling is recorded;
- one sentence-glyph rule (SG) closes the open "V-3c decides" question, including `⌫ Deleted`;
- a B browser probe ran before the sizes were fixed. It covers heights and the previewing row;
- dedicated rows cover the states d6 does not;
- C's round-160 d6 output is the new RV-1 reference;
- the test grants are narrow;
- one consolidated checkpoint request was written;
- the `user-review/` path is stated.

The advisor was called again before finishing (see the end).

## Inputs read
- **Gate and environment:**
  - `context/active-summary.md`.
  - `gates/gate-round-160.json`: **published**, commit `aeba543e80cda33921023081dc4ba6ed476e05c9` on both remotes, so the baseline is `aeba543`. `git status` is clean and HEAD = `aeba543`.
  - `env-status.json`: store 200.
  - `regression-last.json`: 2026-10-24, so the next regression is due 2026-10-27; today is 2026-10-25.
  - `user-review/`: only the review files; no `*-decisions.md`.
- **Round 160 artifacts:** `current-task.md` (round 160), `a-round-160.md`, `c-round-160.md`, `c-round-160.json`, `b-next.json`, `b-round-159.md`. Also the tail of `root-pre-push-review.md` and `publication-checkpoint.json`; they hold no open item for this round.
- **`backlog.json`:** looked up by ID only (VISUAL-A `v3_plan_d29z123` / `v3b_plan_d29z125`, open_findings, rounds, architecture_signals, deferred_low_polish).
- **Spec:** `visual-direction-a.md` § „იკონები“ / „ღილაკები“ / M-table.
- **Source, read only:**
  - `ArrangementLibrary.tsx` (glyph regions);
  - `ArrangementLibraryPreview.tsx` (preview/Add);
  - the `strings.ts` glyph lines;
  - `collection.ts` l.19 and l.32;
  - the test pins (grep);
  - the lucide 0.561 icon files;
  - the d6 key rule.

## C round 160 evidence → backlog (only what C evidenced)
| Item | C evidence | Backlog / status |
|---|---|---|
| V-3b | <ul><li>C PASS; `browserVerified` and `realVerified` true; 0 bugs.</li><li>ICON-V3B, RV1-V3B (raw max 0.8 px), SURFACE-SPOT, FUNC-SMOKE-7, BRACE-HINT and G160-3 (3 sub-rows) pass at both viewports.</li></ul> | **მზადაა** (round 160, `aeba543`). `rounds[160]` = `c_pass_published` |
| INFO-C159-DOC128-STALE | AN-REVIEW: doc 128 has the 3 D4 edits | **closed** |
| A11Y-R160-ZOOMBACK-NAME | CDP name `Zoom`, confirmed in the browser | still a signal; evidence added |
| A-R160-REVIEW-DESCRIBE-TITLE (Low) | A reviewer + C note: the `describe` title at `transport-surface-ui.test.tsx:207` still says V-3a | new, `deferred_low_polish` (test text; that file is frozen this round) |
| G160-3 fake-Bearer 403 | BLOCKED (backend unavailable in cloud) | open backend evidence (not a reason for `browserVerified` false) |
| m160 | equivalent mutant (lucide default `aria-hidden`) | INFO-R160-M160-EQUIVALENT; future lists use m160b |
| A reviewer Architecture note | Signal 3: the transport size/stroke/gap triple, verdict keep | ARCH-R160-TRANSPORT-ICON-TRIPLE (signal) → checkpoint Q1 |

## Decision D-29z126: round 161 = V-3c-1 (Library icons)
`tasks/round-160.md` §7 fixed this outcome on a C PASS:
- **Checkpoint request:** `b-round-160-checkpoint-request.md`. It consolidates 148/155/157/158, ARCH-R159 and ARCH-R160, and it is non-blocking.
- **Round 161:** the first V-3c stage.
- **Nothing blocks it:** the regression is not due, there are no user answers, and no Critical, High or Medium finding is open.

**V-3c split by owner** (nothing dropped):
- V-3c-1: Library.
- V-3c-2: Lane, GroupHeader (a CSS `before:content` fold, which is structural and gets its own ruling) and Clip.
- V-3c-3: Dock, MarkerRow, DetailPanel, GridMenu ✓ and `← CZABA`.
- V-3c-4: other components' button surfaces. The checkpoint answer feeds in here.
- V-3c-5: the 10 px panel radius.

**B probes before writing** (planning data, not C rows; real Chromium at `aeba543`, both viewports):
- **`lib-glyph-metrics.cjs`:** the glyph font sizes, advances and spaces for the 8 sites.
- **`lib-icon-probe.cjs`:** the R2'' sizes with flex centring give a **0.000 px** max edge delta for every library element (47/33/48/2 elements in S0, search, preview-playing and collapsed). Fixed-box icons are centred exactly. Its "before" boxes are the LIB-STATES-BOX baseline (`out/lib-states-before.json`).
- **`add-probe.cjs`:** 0.000 px; the new key `button:Add#1` is unique.
- **Vitest base:** 18 files, **330/330**, and the tree was clean afterwards.

**Rulings (user-vetoable):**
- **R1 — R2'':** R2' generalised into one V-3c rule: 12 px text → `size-2.5` / 2.4; 14–16 px text → `size-3` / 2; the gap equals the old space; fixed boxes are flex-centred.
- **R2:** `ChevronRight` (expand), `X`, `ChevronDown`/`ChevronRight` (collection fold, which also binds the V-3c-2 fold), `Square` (stop) and `Plus` are B rulings for spec gaps. `ChevronLeft` and `Play` come from the spec.
- **R3 — SG:** a glyph that names a control or action becomes a word; a decorative leading glyph is dropped; key notation stays. The ✕ sentences are assigned to V-3c-3.
- **R4:** 6 strings. The "ready" sentence follows through interpolation (`(Enter or Add)`), and `collection.ts` stays frozen.
- **R5:** a11y name notes, recorded as signals.

**Smallest honest behaviour:**
- The spec says "the icon matches the old symbol's box, so the element does not move." R2'' meets this exactly (0 px) without an M-type move.
- The SG rule keeps every sentence truthful about the visible labels.

## Round 161 summary (`current-task.md`)
- **Owner A.** 11 grants:
  - the 2 library components;
  - `strings.ts` (6 values);
  - 7 test files (`strings`, `library-row-strings-ui`, `library-preview`, `held-enter-add`, `collection`, `collection-load-status`, `purchased-collection-ui`);
  - doc 129 (status line only).
- **New file:** doc 130.
- **Frozen:** 968 files. Protected files include auth/purchase, `collection.ts`, `StudioWorkspace`, the transport and styles.
- **New tests:** LI1–LI3 (UI icon locks, including "no glyph text in the library" in 3 states) and LG1 (strings glyph lock). Mutations are m162–m166.
- **C rows:** T161-TARGETED, SOURCE-SCOPE, AN-REVIEW, ICON-V3C1, RV1-V3C1 (the c-round-160 reference + 1 rename), LIB-STATES-BOX (B baseline), FUNC-SMOKE-LIB (real preview audio, Add, focus handoff, range-delete status), READY-STATUS, G161-3, PX-NET/REG-HYD.
- **Outcome table §7:**
  - On PASS, root publishes round 161, V-3c-1 → მზადაა, and round 162 = V-3c-2.
  - If B plans on or after 2026-10-27, the REGRESSION round comes first.

## Architecture signals (recorded, not scheduled)
- **ARCH-R160-TRANSPORT-ICON-TRIPLE:** added to `architecture_signals` and carried as checkpoint Q1.
- **ARCH-CHECKPOINT-V3C:** a new open_findings pointer to `b-round-160-checkpoint-request.md`. It is the feature-boundary request named by §7. It does not block the icon stages. Without an answer by V-3c-4, B applies fallback (c) and records it.

## Scope check (nothing shrunk, nothing newly deferred)
- **Still to do:** V-3c-1..5, M1, M3, M4, RV-1/2/3/5, the deferred Lows (220), T12-ADVANCED, the 3-day regression (due 2026-10-27) and the final regression.
- **Awaiting the user:** V-2b-DISPLAY, B-R153-PREVIEW-DUR, Q-V3-ICON-SIZE (default R2''), ABL-R, DUX-R, M5 and phase 2.
- **Deferred by the user:** SRW-21.
- **Out of scope, unchanged:** professional plugins/effects, pitch and multiple video layers. Grid tempo is not audio stretch.
- **Purchase protection:** G160-3 PASS (`/api/studio-token` 401; "Sign in required" on `/studio/middle-east`, 0 `audio[src]`). The reusable `/studio-lab` workspace opens anonymously with the demo badge.

## Ready for commit?
- Round 160 is already published (`aeba543`).
- Round 161 becomes publishable after a C PASS.

## Preserved artifacts
- `tasks/round-160.md` = the round-160 `current-task.md` (sha256 `2bee548c…a84410c8`, identical at copy time).
- Snapshots taken before editing: `b-round-160/{backlog-before-r161.json, feature-status-before-r161.md, b-next-before-r161.json}`.
- Planning hashes: `b-round-160/planning-sha256.txt` (probes, outputs, grant/frozen/start lists, rename map, task archive).
- B changed no app source. `git status --short` was empty after the probes and the vitest run.

## Probe provenance
- `out/lib-icon-probe.json` was produced by the first version of `lib-icon-probe.cjs`.
- `out/lib-states-before.json` was produced by the same script after one edit: it also stores the `before` arrays. The measurement code is identical.
- The hash in `planning-sha256.txt` is of that second version.
- Both runs gave 0.000 px in every state at both viewports.

## Advisor, second call (before finishing)
- **CONTINUE confirmed.** The §7 obligations are met (archive, checkpoint request, V-3c first stage).
- **Fixes applied to `current-task.md`:**
  - D4 is the doc 129 status line **l.4**; l.3 is the date, the same slip A reported in round 160.
  - The Biome check covers 10 files.
  - LRS3's expected `className` is the final string as Biome leaves it.
  - LI1 notes that the row fixture renders the fold buttons (B verified l.279–289), with a fallback mount so the fold lock is never dropped.
  - LIB-STATES-BOX: only testid/aria-label-keyed controls and the two panels are findings; text-keyed nodes are notes.
  - §0.1 now names `lib-states-before.json`.
- **Optional sharpening applied:** `library-row-strings-ui` l.351 `toContain(addText)` → `toContain('(Enter or Add)')`.
