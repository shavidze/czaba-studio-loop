# B — Round 195 → 196 planning (D-29z161)

Date: 2026-10-26 · Author: B · Advisor: **used** (two calls: one before writing, one review after writing; both adopted, see "Advisor" below).

## 1. Inputs read
- `context/active-summary.md`, plus `context/active-backlog.json` through targeted `backlog.json` lookups by id: STORE-REDESIGN, SABA-B-1..3, GLOBAL-FOCUS-VISIBLE-UNLAYERED, C-R169-N1, GATE191-PAN-RESET-DOUBLE-RING, ARCH-R191-PAN-RING-COUPLING, C-R177, C-R173-N1, C-R191-01.
- `current-task.md` (round 195), `a-round-195.md` (Architecture note), `c-round-195.md`, `c-round-195.json`.
- `gates/gate-round-195.json`: **published**, commit `7339cd5`. This is the baseline HEAD for round 196. `env-status.json`: store 200.
- `regression-last.json`: 2026-10-24, round 122. The next regression is due on or after 2026-10-27, so it is **not due** today (2026-10-26).
- RETRO: due at round 200 or at the STORE-REDESIGN exit, so not now. `loop/lessons.md` is empty.
- `direction-decision.md` exists (direction A), so STORE-2..5 are unblocked.
- Saba's screenshot `user-review/img/saba-2026-10-26-pan-focus-ring.png` (viewed): a thick brass pill around the Pan slider; Pan thumb large and white; Volume thumb cream.

## 2. Acceptance results used (independently evidenced by C)
- **Round 195: C PASS**, `browserVerified=true`, `realVerified=true`. 12 rows passed. RECORDINGS-195 is BLOCKED (backend unavailable in cloud), so it is not passed. Gate rows were left to root. 0 new bugs.
  - **C-R194-01** closed: GuestForm 3.70:1 at 1440, 1280 and 375 (HEAD 1.62).
  - **C-R194-02** closed: m14, m15 and m19 now turn ST8b red.
  - C-R193-01/02 closed with the publication.
- **Gate 195** published `7339cd5` (rounds 193 + 194 + 195).
- **Backlog updated from this evidence only:**
  - STORE-2a → done (`store2a_result_r195`).
  - The four Medium findings → closed.
  - R80 recordings → source done; its browser row stays open backend evidence, not passed.

## 3. Decision: round 196 = SABA-B-4 stage 1 (Studio)
- **Policy SABA-B-4 (Saba, 2026-10-26):**
  - The focus ring and slider thumbs feel heavy. "Fix it everywhere."
  - Run it **next round, ahead of the remaining STORE stages**, in at most 2 rounds: Studio first, then store pages.
  - The round-195 §7 line "round 196 is STORE-2b" was written before this item was planned. Saba's ordering supersedes it.
- **SABA-B-4 was not yet in `backlog.json`** (grep found it only in `policy.local.md`). B added it as an open finding:
  - **Severity Medium:** Saba saw it himself, the same rule as SABA-B-3.
  - It records the cause, the split, and the ids it closes.
- **Root cause, from B's inventory** (`b-round-195/tools/focus-inventory.mjs` → `b-round-195/out/`):
  - There are two **unlayered** global `:focus-visible` rules (2 px brass, offset 2). They beat the layered `focus-visible:outline-none`, so about 50 Studio controls draw the outline **plus** their `ring-2` → a double band.
  - The Pan pill is the reset button's `::before` (`STUDIO_FADER_FOCUS_PEER_RING_CLASS`).
  - Pan and Zoom use the native white thumb.
  - Chromium shows `:focus-visible` after a mouse press on range inputs and selects.
- **Why the global rule is not layered in stage 1:** 27 store sites use `focus:outline-none` with no ring of their own. Layering the rule would remove their only indicator. So stage 1 changes only the rule's **values**, removes the duplicate, and deletes the Studio ring recipes. Stage 2 layers the rule together with the store sweep.
- **Smallest honest behaviour for unclear contracts** (vetoable, recorded as R83–R87 in the task and in doc 159):
  1. **Ring.** Brass at 80 % with a 2 px offset; an inset variant only on clipped rows.
  2. **Mouse press.** "Never after a mouse press" needs JS: a pointer/keyboard source attribute on `<html>`. A non-modifier key after a mouse press shows the ring; this is the CSS `:focus-visible` heuristic. Text fields get no special case.
  3. **Thumb.** One 14 px thumb in `#ECE6DA`, with no hover or active change, inside one `h-4` box on all six inputs. Pan and Zoom keep a neutral track (R70).
  4. **Focus feedback.** Focus no longer changes fill or border: search, separator, clip-gain pending and the marker flag.
- **Rest pixels.** Changing the thumb size necessarily changes rest pixels inside the six fader boxes. REST-196 limits the change to those boxes; it does not require 0 px.

## 4. Scope bookkeeping
- **Grants:** 34 existing files.
  - 18 Studio components/modules.
  - `app.css` and `base/utilities.css`. Both are under `app/styles/**` (global_forbidden), so they are granted narrowly.
  - 14 tests, each limited to updating token assertions.
- **New files:** 5.
- **Pre-authorised extra test edits:** only token assertions under `app/lib/arrangement/__tests__/`. This applies the lesson of B-R192/R194, where planning gaps cost whole rounds.
- **Frozen list:** 990 entries, verified OK from the store root. **Start copies:** `b-round-195/r196-granted-start/`.
- **No protected purchase/auth file and no `root.tsx`.** The R85 mount lives in `StudioWorkspace`. The store mount is a stage-2 question (root grant or a store layout component).
- **Backups before editing:** `b-round-195/backlog-before-r196.json` and `b-round-195/feature-status-before-r196.md`.

## 5. Signals recorded (not scheduled)
- **A-R195-SIGNALS.** The reviewer's Architecture note, verbatim from `a-round-195.md`: *"I'd keep the field scanner in the test file this round. It is cohesive, test-only, guarded by ST8c and has no production coupling, so extracting it now is worth little. The risk is a third rewrite of the same region: if that happens, extract it to a helper or replace it with the TypeScript AST walk as one scoped task."* It is decided at the STORE-2 exit, with ARCH-R193-THEME-REGION and ARCH-R194-TEST-WALKERS.
- **Checkpoint.** A one-line addendum was appended to `b-round-183-checkpoint-request.md`: `app.css` now carries the shared focus rule as well as the store theme. It is non-blocking.
- **B-R195-WORKFLOW-DOC-DRIFT** (root note). `agent-workflow.md` lacks the policy sections from SABA-B-3 onward that `policy.local.md` has.
- **Unchanged and open:** the C-R191-01 thumb-vs-fill design call (awaiting_user), and the backend-blocked rows (R80 recordings, F11–F13, F16).

## 6. Queue after round 196
1. **Round 197.** The planning is expected on or after 2026-10-27, so round 197 is the **REGRESSION round**. It includes the SABA-B-4 stage 1 key check, and `regression-last.json` is updated when it closes.
2. **SABA-B-4 stage 2** (store pages).
3. **STORE-2b, 2c, 2d**, then STORE-3..5.
4. **RETRO** at round 200, or earlier at the STORE-REDESIGN exit.
5. **REVIEW-RECOMMENDATIONS**, then STUDIO-PERFORMANCE, then T12-ADVANCED.
6. **PHASE2-VIDEO-SCORING** stays gated on the user go-ahead (skip rule).
7. **PHASE2B-SPOTTING**, STUDIO-AGENT-COMMANDS and RECORDING-META-S1, in queue order.

## 7. Advisor
B consulted the advisor once, before writing. The advice adopted:
- Record SABA-B-4 in the backlog.
- Do not layer the global rule in stage 1.
- Allow one inset variant.
- Use a JS source attribute for pointer presses.
- Pan's ring goes on its own input, and one thumb recipe covers all six faders.
- REST-196 allows changes inside the fader boxes only.
- Grant the 14 tests, add a source-count guard plus a C INVENTORY row, do the archive and closure bookkeeping, and sample contrast against the pixel outside the ring.

A second call reviewed the written files. Three fixes were applied before dispatch:
1. K2 now also removes `focus:outline-none` on the library search, so SFR2's "exactly once" (the ExportDialog container) is reachable.
2. The inset variable is renamed `--focus-offset`, so it cannot trip the `ring-offset` guard.
3. All six range inputs keep one `h-4` box. The level faders were already `h-4`, so only Pan grows, and no neighbour row can move.

It also noted that SFR5 is red on the start copies, which is expected.

No conflict with B's own evidence came up.

## 8. Commit readiness (for root)
- Round 195 is already published (`7339cd5`).
- Nothing new is commit-ready until C judges round 196.
