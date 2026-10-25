# B round 152 → 153 planning (D-29z118)

Date: 2026-10-25 · Author: B. **Advisor: available.** I called it once before writing anything, after orientation and measurement. I call it again before finishing.

## Inputs read
- **Task:** `current-task.md` (round 152), archived as `tasks/round-152.md` (identical copy, sha256 `d76725e1529b116d97f7830d15fe1f0e2b2ebc59971cbd1bffca664e510dff5d`). Before I edited anything I saved `-before` copies of `backlog.json`, `feature-status.md`, `plan.md` and the round-151 `b-next.json` in `b-round-152/`.
- **Reports:**
  - `a-round-152.md`.
  - `c-round-152.md` / `c-round-152.json`: **PASS**, `browserVerified` = `realVerified` = true, 10 rows passed, 0 bugs. The fake-Bearer 403 is blocked (backend unavailable in cloud).
- **Gate:** `gates/gate-round-152.json` = **published** `ff2fd6c` (both remotes). This commit is the baseline. The store tree is clean at `ff2fd6c`.
- **Lookups only:**
  - `context/active-summary.md`;
  - ID lookups in `backlog.json` and `feature-status.md`;
  - `plan.md` D-29z116/117;
  - `visual-direction-a.md` (§ ტიპოგრაფია, § საზღვრები).
- **Not due / absent:**
  - The regression is not due: `regression-last.json` says 2026-10-24, round 122, so the next one is due on or after 2026-10-27.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.

## B measurements this planning (real Chromium on `ff2fd6c`, store untouched)
All tools are in `b-round-152/tools/` and all results in `b-round-152/out/`. The tools copy C's round-152 helper libs.

**`size152.cjs` → `size152-{1440,1280}.json`** covers S0, S1 (clips, video, marker, range, loop, group, selected clip), the marker menu, the grid menu and S2 (Export).
- The only Studio texts ≥ 16 px are:
  - the mono position;
  - `◀`;
  - the 24 px Export `ModalTitle`.
- The spec's display roles are 12–14 px: Library h2 14 px, Clip details h2 12 px, track names 14 px, library titles 14 px, selected clip name 12 px.

**`dispsim.cjs` → `dispsim-*.json`** (the display roles at 16 px, in-page style only):
- 59–65 vertical moves;
- long library titles wrap (+27.5 px each);
- 0 new clip.

**`labelsim.cjs` → `labelsim-*.json`** (11 px / 16 px line-height / 500 / 0.14em / uppercase on the six labels):
- 16 movers, all horizontal;
- 0 vertical (dh within ±1 from inline glyph boxes only);
- 0 new clip, 0 missing/added;
- the right-most moved edge is 1256 (1440) and 1096 (1280).
- The table is in `current-task.md` §0.1 R3.

**`serifprobe.cjs`:** no Playfair and no element outside the studio container render on `/studio-lab` (S0, Export).

**`__tests__` grep:** no class assertions on the six label parents. `VDS1` reads the caption span's `textContent`; L3 keeps it with an explicit space, and mutation m136 checks this.

## Backlog updates from evidence (v145; only C round 152 evidence + gate 152)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2a | ბაგია (round 151) | **მზადაა** (C PASS browserVerified, published ff2fd6c) | `c-round-152.json`, `gates/gate-round-152.json` |
| C-R151-1 | ruled | closed | RV-1-TYPE PASS (amended R1) |
| A-R151-REVIEW-L4 | scheduled | closed | T152-TARGETED, TH8 `toHaveLength(3)` |
| A-R151-REVIEW-L1 | ruled | closed | FONTS-SCOPED `rv3b-*.json` |
| B-R151-V2B-SIZE16 | V-2b input | superseded by B-R152-V2B-DISPLAY | `b-round-152/out/size152-*.json` |
| C-R151-SIG-SANS-TIMECODES | V-2b input | scheduled V-2b-2 | — |
| B-R152-V2B-DISPLAY (new) | — | info, awaiting_user | `size152`, `dispsim` |
| C-R152-DOC123-L67 (new) | — | info, scheduled round 153 D1 | `c-round-152.md` |
| C-R152-EXPORT-FULLSCALE (new) | — | info signal for T12-ADVANCED (pre-existing 0 dB summing, c-round-125 class) | `c-round-152.md` notes |
| B-R152-LABEL-WIDEN-26PX (new) | — | info, user-vetoable decision | `labelsim` |

The round-152 entry in `rounds` is now `c_pass_published`, and a round-153 entry was added. The VISUAL-A queue status was extended, and `v2b_split_d29z118` was added. `feature-status.md` gained the round-152 line, and its VISUAL-A row was updated.

## Decisions (D-29z118) and rationale
- **R1 — Split V-2b; nothing is dropped.**
  - Labels are the only V-2b part with measured, layout-safe evidence, so they go first.
  - Weight roles and the remaining mono numerals are a separate stage (V-2b-2). They touch other files (Lane, GroupHeader, Library, Workspace h1, Master M/peak, ruler/library timecodes), and B has to measure them first.
  - **Advisor disagreement, recorded:** the advisor suggested treating "weight roles" as already satisfied by V-2a, since the 600/700 weights now render real (not faux) bold. I kept it open. The spec table says UI sans is 400/500, and D-29z116 R5 kept 600/700 only to avoid faux bold, not as the final role. Closing it would claim conformance that the spec text does not support. Keeping it open is the conservative reading: it shrinks no scope and claims nothing unverified.
- **R2 — Display serif waits for the user.**
  - The spec says "მხოლოდ ≥ 16 px", and no named role qualifies. Making one qualify needs a size change, which is a layout move, and only the user can approve that.
  - Cormorant is not loaded for zero consumers.
  - The Export title is ≥ 16 px but is not in the spec's list, and its defaults come from the protected `Modal.tsx`. It is offered as option (c) and not applied silently.
- **R3 — Label set.** This is the smallest honest reading of "MASTER, ARRANGEMENT და სხვ.": static Latin section/row names. The widening (≤ 26 px horizontal) is a direct consequence of the approved style, and the user can veto it.
- **R4 — `@theme` tokens** instead of arbitrary values (TAILWIND_FIRST). The obsidian block is untouched, so TH2 stays unchanged.
- **R5 — CSS uppercase only.** The text content is unchanged, as the spec boundary requires.
- **R6 — doc 123 l.67 fix-up** goes in the same round (same doc owner, 2 lines).

## Ownership (round 153)
- **A owns 9 existing files + 1 new** (`b-round-152-r153-grants.txt`, `b-round-152-r153-new-files.txt`):
  - `app.css` (3 `@theme` lines);
  - Master, Transport, VideoDock, TempoRow, MarkerRow, StudioWorkspace (one label each);
  - `studio-theme-obsidian.test.tsx` (TH9);
  - doc 123 (2 lines);
  - the new doc 124.
- **Frozen:** 962 (`b-round-152-r153-tree-sha256.txt`; `sha256sum -c` OK at planning).
- **Start state:** hashes in `b-round-152-r153-granted-start-sha256.txt`, copies in `b-round-152/r153-granted-start/`.
- **Protected files stay unchanged:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx`.

## Architecture
- No new reviewer note this round (round 152 had none).
- `b-round-148-checkpoint-request.md` is still pending with root and does not block.
- No owner-concentration risk: each component gets a one-line class or wrapper edit.
- V-2 is a feature boundary once V-2b-2 closes. B will re-ask the checkpoint then, together with the pending V-0/V-1 questions.

## Commit readiness
- Round 152 is published. Round 153 becomes commit-ready only on a C round 153 PASS.

## Remaining scope (not shrunk)
- **VISUAL-A:**
  - V-2b-1 (round 153);
  - V-2b-2 (weights + remaining mono numerals);
  - V-2b-DISPLAY (awaiting_user);
  - V-3 (lucide icons, borderless buttons, radius, hover motion);
  - M1, M3, M4.
- **Then T12-ADVANCED.**
- **The deferred_low_polish pass** (including C-R151-2/3) comes before release.
- **awaiting_user:** ABL-R-*, DUX-R-*, the C-R151-2 option, V-2b-DISPLAY, M5.
- **Other:**
  - SRW-21 is deferred_user;
  - the Tech Lead manual checks;
  - the backend-only evidence (fake-Bearer 403);
  - PROD-MP3-UNVERIFIED / PROD-SSR-NUL (gate);
  - the regression due 2026-10-27;
  - the final full regression.

## Final advisor checks (after the deliverables were written)
- **d6 keying:** `c-round-152/tools/d6.cjs` `collect` keys only interactive, panel and clip elements. The new wrapper spans add no key, so "0 keys missing/added" stands. I rewrote the RV-1-LABELS prediction in d6 terms: the Master controls about −14.2, Follow about −10.1, the BPM input and Metronome about +1.6, the marker buttons about +18.8, and every panel within ±1 px. The labels and the caption themselves are measured in LABEL-STYLE and NO-CLIP.
- **`DESIGN_TOKENS.md`** says nothing about font-size tokens. R4 stands, and this is noted in the task and in `plan.md`.
- The advisor withdrew its earlier "weight roles are done" remark, so V-2b-2 stays open.
