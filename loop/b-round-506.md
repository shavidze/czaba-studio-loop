# B: planning from round 506 to round 507 (2026-11-14)

**Decision: CONTINUE.** The next task is round 507, DPG-BUTTON-CLEANUP-2-NONBRAND stage N1 (the global audio player), in `current-task.md`.
- **Advisor:** available. I consulted it after orientation and once more before closing.
- **Archive:** `tasks/round-506.md` is a byte-identical copy of the round-506 task (`cmp` rc 0).
- **Baseline:** gate 506 `published`, commit `3021b30` on both remotes. The gate's `head` field (`d6903a7`) is the pre-commit head. The store worktree was clean at planning and is clean at the end.
- **Checkpoint:** `b-round-506/checkpoint.md`. Snapshots taken before editing: `b-round-506/*-before-507.*`.

## 1. Round 506 acceptance (C's evidence only)
- `c-round-506.json`: PASS with `browserVerified` and `realVerified` true, C0–C14 passed, 0 bugs. C6's success path is `-STUBBED`; the real Brevo subscription stays LEADMAGNET-REAL-SUBSCRIBE (blocked in the cloud).
- Gate 506: published `3021b30`.
- **Stage 2e (LeadMagnet) is verified (D-29z1828).** SABA-Q-506-LM-CONTINUE-COLOUR stays `awaiting_user` (default brass).

## 2. Follow-ups from round 506 (L7)
| Source | Item | Ruling |
|---|---|---|
| A CR-1 | The popup now loads Toast/`useToast` through the ui barrel, while two tests mock `~/hooks` only partially | New deferred Low A-R506-CR-1-HOOKS-MOCK-BARREL (with GATE498-L2-BARREL-IMPORT) |
| Gate 506, suggestion 1 | A disabled submit drops focus | Already measured by C5/C7 (`activeAfterError` INPUT at 3 widths); no id |
| Gate 506, suggestion 2 | `pointer-events-none` hides `cursor-not-allowed` | `confirmedBy` PD-R504-DISABLED-NO-REASON |
| Gate 506, suggestion 3 | Whole class-string pins | `confirmedBy` SIG-R501-SHARED-BUTTON-SCANNER |
| Gate 506, suggestion 4 | Doc 327 says In Progress | Pre-ruled Low #3 (L28 contract) |
| Gate 506 reviewer | "Button has no focus-visible style" | Inaccurate: C3 measured the shared `:focus-visible` ring (solid, offset 2px) on all three actions. Recorded in D-29z1828, not a finding |
| A Architecture note | None (a component swap) | No checkpoint |

## 3. NONBRAND inventory (D-29z1829)
**Scanner.**
- `b-round-506/scan-nonbrand.py` parses each whole JSX opening tag (L13), including multi-line `cn()` and template classNames.
- HEAD: 58 tags in 29 files.
- The mutant file (`scan-mutant.txt`) is caught as expected. The one blind spot, `className={CONST}`, is closed by `scan-var-classname.txt` (9 Footer text links, not buttons).

**Delta vs the round-497 record (30/18).**
- Removed: checkout.cancel/success (converted in 2b) and LeadMagnet CONTINUE (converted in 2e).
- Added: the LeadMagnet Close X by name, plus 28 found by whole-tag parsing and Link.

**product-designer** (`b-round-506/consult-product-designer.md`) gives every tag one ruling:
- 16 → Button, 13 → IconButton, 28 keep (the K classes are signalled as SIG-R507-NONBRAND-KEEP-PRIMITIVES), 2 root (protected `studio.$productId.tsx`, `confirmedBy` ROOT-REQ-DPG-BUTTONS-PROTECTED);
- 3 scanner misses added by name: CookieConsent Decline and Close, and the StemsPlayerModal play button;
- stages N1–N9 by user visibility.

**Where I differ from the consult:**
- **N1 is AudioPlayer only.** No mock product has a version `stems` array, and the first SSR request cannot be stubbed, so the StemsPlayerModal rows could not run in the browser. I filed ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE. Stubbing a client-side navigation is not tried yet; I try it at round-508 planning (D-29z1832).
- **Radius is 12px, not 8.** That is Chromium's measured value for `rounded-lg`.
- **The player grows +4 px at 375,** not 0 (measured). It is accepted as D5.

## 4. Round 507 planning summary
**Sketch v2.** tech-lead reviewed v1: APPROVE WITH CONDITIONS, all Low (`sketch-review.md`). v2 fixes the test mock (no dead `state` spread), drops `as const`, and corrects doc 328 / DESIGN_SYSTEM wording. The status line and the shared-IconButton Lows are pre-ruled.

**Pre-check on v2 (scratch outside `store/`):**
- tsc rc 0; lint 175 warnings (HEAD 179); Biome clean.
- Covering: 8 files / 86 tests. Two product-price files were added after the K8 sweep.
- Full suite: 304 files / 4,384 tests, rc 0. Build rc 0.
- Mutants M0–M6 OK.
- Scanner 58/29 → 54/28; brand scanner unchanged at 92/31.
- Fresh-archive apply: checks 4 and 1 rc 0.
- Claims K1–K16: no MISSING.

**Browser probes (HEAD :5173 vs sketch :5174, own `node_modules` without `.vite`, 1440/1280/375):**
- sizes 34/36 → 32/40 px;
- radius 9999 → 12px;
- hover white overlay → `bg-elevated`;
- rest contrast 7.2;
- ring offset 2px;
- player height and Play's centre unchanged at 1440/1280; +4 px at 375;
- real preview audio advances;
- Mute → volume 0 and Unmute → 0.7; Mute now has a title;
- Close keeps its centre while pressed and stops playback.

**Bugs first.**
- New B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (Medium): the product page's "Complimentary Download" for free products is a button with no action, since 2026-03-08.
- It cannot be fixed or browser-verified honestly without a target decision and a free mock product, and it is not a regression. It is therefore round 508, bug-first, and the already-prepared N1 stage goes first.
- Rationale recorded in D-29z1831.

**Saba questions** (`user-review/questions-round-507.md`, defaults apply, none blocks): player icon shape, cookie button weight, outline variant.

**Closing check (D-29z1832, advisor):**
- Keyboard Close sends focus to BODY at HEAD and on the sketch. This is pre-existing: deferred Low B-R507-PLAYER-CLOSE-FOCUS-LOST, a C6 record row.
- The L50 regex finds 4 unchanged hits.
- Close's ring is clipped at the viewport's right edge, at HEAD and on the sketch: deferred Low B-R507-PLAYER-CLOSE-RING-CLIPPED. The C3 clause is reworded to match.
- K12 now lists every cited artifact; the claims outputs were regenerated.
- The Saba info block now lists D2 and D3.

**Architecture:** no checkpoint. This is one owner and a component swap. The K-class primitives are a signal for the stage-2 close-out.

## 5. Files written by B
- `current-task.md` (round 507) and `tasks/round-506.md` (archive).
- `backlog.json` v508 → v510 (`b-round-506/update-backlog-507.py`, D-29z1828…D-29z1831; `update-backlog-507b.py`, D-29z1832).
- `feature-status.md` (header, round 506/507 lines, DPG-FIX row).
- `b-next.json` and `user-review/questions-round-507.md`.
- `b-round-506/`:
  - the sketch (v1, v2), the review and the consult;
  - the probes (`probe/head`, `probe/sketch`);
  - mutants, claims and the pre-check logs;
  - the frozen lists `r507-*.txt`, `covering-files.txt`, the scanner files and `head-AudioPlayer.tsx.txt`.
- **Scratch trees outside `store/`:** `/home/runner/b506-scratch`, `/home/runner/b506-fresh`, `/home/runner/b506-nm` and `/home/runner/b506-mut`. The sketch server on :5174 is stopped. B started a mock API on :5199 for the probes (log `b-round-506/mock.log`).

## 6. Ready for commit
Root has nothing new to commit from B. Round 506 is already published at `3021b30`.
