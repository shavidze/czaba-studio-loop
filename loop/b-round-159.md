# B round 159 → round 160 planning (D-29z125)

Date: 2026-10-25 · Author: B · Advisor: **used**. It was available and was called after orientation, before writing, and again before finishing. Advice followed:
- the R2 correction is recorded with probe evidence;
- explicit strokeWidth for each size;
- the ↤ spec-gap ruling;
- an explicit braceHint / `⌫ Deleted` decision;
- a narrow `strings.ts` grant;
- a uniqueness check in the delete-selection helper;
- the doc 128 stale-line fix;
- the d6 rename map;
- FUNC-SMOKE on all 7 buttons.

## Inputs read
- `context/active-summary.md` (head) and `gates/gate-round-159.json`: **published**, commit `ad0df770e7fec74c6feb236a8ab59a738f12c79a` on both remotes, so the baseline is `ad0df77`.
- `env-status.json` (store 200), `regression-last.json` (2026-10-24, so the regression is not due until 2026-10-27), and `user-review/`: no decision files.
- `current-task.md` (round 159), `a-round-159.md`, `c-round-159.md`, `c-round-159.json`, `b-next.json`, and `tasks/round-158.md` (the V-3 split and R2).
- `backlog.json`: looked up by ID only (VISUAL-A `v3_plan_d29z123`, open_findings, rounds, architecture_signals).
- Source, read only:
  - `ArrangementTransport.tsx` (whole file);
  - the glyph lines in `strings.ts`;
  - the 6 glyph-pinned test files (query helpers and pins);
  - doc 128 l.1–8, l.50 and l.72–75;
  - `visual-direction-a.md` § „იკონები“;
  - the lucide 0.561 icon files and `createLucideIcon` class names;
  - the d6 key rule.

## C round 159 evidence → backlog (only what C evidenced)
| Item | C evidence | Backlog / status |
|---|---|---|
| V-3a | C PASS, `browserVerified` and `realVerified` true, 0 bugs. All SURFACE sub-rows (a)–(i) + (h-rm), CASCADE-SCOPE and RV1 0 px pass at both viewports. | **მზადაა** (rounds 158–159, `ad0df77`). `rounds[159]` = `c_pass_published` |
| C-R158-01 (Low) | (h) 12/12 and (h-rm) 12/12 at 1440 and 1280 | **closed** |
| INFO-C159-DOC128-STALE | C note + A known gap | open (info), scheduled round 160 (D4) |
| INFO-C159-GLOBAL-RULE-SCOPE | an inference, **not measured** (probe found no element) | added to ROOT-GLOBAL-TRANSITION-RULE as unconfirmed |
| ROOT-GLOBAL-TRANSITION-RULE | A's reviewer, confirmed by C: two copies (`app.css` l.305–314, `base/utilities.css` l.7–15) | amended; still a root signal, not scheduled |

## Decision D-29z125: round 160 = V-3b
`tasks/round-159.md` §7 fixed this outcome on a C PASS. The regression is not due, there are no user answers, and no Critical, High or Medium finding is open.

**Scope:** the 7 transport glyphs (↤ ↶ ↷ ✂ ⌫ ↻ ↩) become lucide icons, plus the glyph-pinned tests and `deleteButton`/`deleteClipLabel`. Nothing is dropped from V-3.

**B probe before writing (planning data, not C rows):**
- `b-round-159/icon-probe.cjs` → `out/icon-probe.json`, in real Chromium at `ad0df77`.
  - **R2 as written (D-29z123) shifts the row by up to 4.0 px.** The svg plus the 4 px flex gap replaces the glyph's 3.02 px space, and the shifts add up along the row.
  - **Chosen R2':** the gap equals the old space (Split/Loop `gap-0.75`, Delete/Zoom back `gap-0.5`). Max shift **0.53 px** at both viewports.
- `tw-probe.mjs`: `gap-0.75` is generated as `calc(var(--spacing)*0.75)` = 3 px. `twMerge` drops `gap-1`.
- **d6 keys:** 6 reference keys contain the glyph (Undo, Undo: Group Tracks, Redo, Split, Delete aria-label, Loop), so C gets a fixed rename map (`b-round-159-r160-d6-key-renames.json`). Without it, RV1 would report false missing and added keys.

**Rulings (user-vetoable):**
- **R2':** the corrected sizing. 12 px with stroke 2, 10 px with stroke 2.4 and 20 px with stroke 1.2, all a 1 px visual line.
- **R8:** ↤ → `ArrowLeftToLine`. This is a spec gap, decided by B. Zoom back shares `Undo2` with Undo, as the spec says.
- **R9:** `braceHint` is brought forward because it names the Loop button by its changing label. The `⌫ Deleted …` status sentence stays and is added to the V-3c inventory.
- **R11:** Zoom back's name "Zoom" is recorded as the signal A11Y-R160-ZOOMBACK-NAME. It is not a finding.

**Smallest honest behaviour:** the spec says "the icon size matches the old symbol's box, so the element does not move". R2' meets this literally, within the ±1 px RV-1 limit, without an M-type move. The spec's 16 px option stays open as Q-V3-ICON-SIZE (a).

## Round 160 summary (`current-task.md`)
- **Owner A.** 9 grants: the component, `strings.ts` (3 values), `strings.test.ts`, the 5 other glyph-pinned test files and doc 128 (D4). One new file: doc 129.
- **Frozen:** 969 files. The vitest base is the same 25 files (386).
- **Mutations:** m158–m161 (Undo2/Redo2 swap, Delete size, aria-hidden, Split gap).
- **C rows:** T160-TARGETED, SOURCE-SCOPE, AN-REVIEW (including `expect(` counts), ICON-V3B (svg, size, stroke, CDP names), RV1-V3B (d6 + rename map, ±1 px), SURFACE-SPOT, FUNC-SMOKE-7 (each button's real action), BRACE-HINT, G160-3 and PX-NET/REG-HYD.
- **Outcome table §7:**
  - On PASS, root publishes round 160. V-3b → მზადაა.
  - B then requests the frontend-architect checkpoint before V-3c, and round 161 = the first V-3c stage.
  - If B plans on or after 2026-10-27, the regression round comes first.

## Architecture signals (recorded, not scheduled)
- **ARCH-R159-GLOBAL-TRANSITION-COUPLING:** A round 159's reviewer note. The transport's transition depends on two global rules it does not own. Proposal: one root-approved task. It is added to the pending checkpoint list.
- **Checkpoint requests:** 148, 155, 157 and 158 (+ ARCH-R158-TOOL-BUTTON-RECIPE) are still pending. The natural point is before V-3c. This is not a new request: V-3b is not a feature boundary, and the transport owner's risk is bounded (3 small rounds, no audio or state logic). If root has not run the checkpoint, it does not block V-3c's first stage.

## Scope check (nothing shrunk, nothing newly deferred)
- **Still to do:** V-3b, V-3c (now including the `⌫ Deleted` status glyph), M1, M3, M4, the deferred Lows (219), T12-ADVANCED, the 3-day regression (due 2026-10-27) and the final regression.
- **Awaiting the user:** V-2b-DISPLAY, B-R153-PREVIEW-DUR, Q-V3-ICON-SIZE (default R2', vetoable), ABL-R, DUX-R, M5 and phase 2.
- **Deferred by the user:** SRW-21.
- **Out of scope, unchanged:** professional plugins/effects, pitch and multiple video layers. Grid tempo is not audio stretch.
- **Purchase protection:** G159-3 PASS (`/api/studio-token` 401; "Sign in required" on `/studio/middle-east`). The reusable `/studio-lab` workspace opens anonymously.

## Ready for commit?
- Rounds 158+159 are already published (`ad0df77`).
- Round 160 becomes publishable after a C PASS.

## Preserved artifacts
- `tasks/round-159.md` = the round-159 `current-task.md` (sha256 `b6716c93…`).
- Snapshots of `backlog.json`, `feature-status.md` and `b-next.json` taken before editing are in `b-round-159/*-before-r160.*`.
- Planning probe hashes: `b-round-159/planning-sha256.txt`.
