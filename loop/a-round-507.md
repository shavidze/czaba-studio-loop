# STOP — needs B ruling on A-R507-CR-1-N1-2-SWAP-MUTANT (Medium, code-reviewer): the N1-2 swap mutant survives

A, round 507: DPG-BUTTON-CLEANUP-2-NONBRAND stage N1 (AudioPlayer → IconButton ghost). Written 2026-11-14.

- **Evidence:** in `app/lib/__tests__/store-button-cleanup-n1.test.tsx` l.117–125, all four clicks run before any assertion. Each mock is checked only with `toHaveBeenCalledTimes(1)`. So a handler swap between Previous and Next (or among Close, Previous and Next) passes.
- **Proven:** I applied mutant M7-prev-next-swap (Previous `onClick={skipNext}`, Next `onClick={skipPrevious}`). The N1 file stayed green, 5/5. I then restored the file: check 4 rc 0 and check 1 rc 0. Log: `a-round-507/mutant-swap.log`.
- **B's matrix:** `b-round-506/mutants-507.txt` has no pure-swap mutant. M2 is caught only because one handler runs twice.
- **Product code:** the handlers in `AudioPlayer.tsx` are correct (the reviewer checked them). This is a gap in test strength, not a behaviour bug.
- **Severity:** Medium is the reviewer's rating, and it is not on the pre-ruled Low list (#2 covers N1-1, N1-3 and N1-4). I did not downgrade it.
- **Why it is outside the grants:** the four files are granted "exactly as the sketch writes them", and check 4 pins their bytes. A fix to the test would make check 4 fail, so I left the tree as it is.
- **Proposed fix (not applied, untested):** `a-round-507/proposed-n1-2-fix.diff.txt`. It asserts after each click (the right mock called once, the others not at all) and adds mutant M7 to the matrix. It has not been run through vitest, typecheck or Biome. That M7 turns red under it is expected, not observed.

## State of the tree
- The sketch v2 is applied. Its sha256 `65ee9231…6474` matches `sketch-sha.txt`. `git apply --check` was rc 0, and so was `git apply`.
- Frozen checks:
  - before applying, checks 1, 2 and 3 were rc 0 (`a-round-507/frozen-pre.log`);
  - after applying, checks 4, 1 and 2 were rc 0 (`frozen-post.log`);
  - after the mutant was restored, checks 4 and 1 were rc 0 again.
- Changed files:

| File | Status |
|---|---|
| `app/components/audio/AudioPlayer.tsx` | M |
| `docs/design/DESIGN_SYSTEM.md` | M |
| `app/lib/__tests__/store-button-cleanup-n1.test.tsx` | new |
| `docs/implementation/2026/quarter-IV/328-dpg-nonbrand-stage-n1-audio-player.md` | new |

- Nothing outside the grants was touched. No protected file was changed (check 2 rc 0).

## Checks actually run (logs in `a-round-507/`)

| Check | Result | B's expected value |
|---|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) | rc 0 ✓ |
| `npm run lint` | rc 0, "Found 175 warnings." (`lint.log`) | 175 ✓ |
| `npx biome check` on the 2 code files | rc 0, "Checked 2 files", no fixes, "Found 1 warning." (`biome.log`; the warning is `useButtonType` on Play, pre-ruled #7) | ✓ |
| Covering tests (`covering-files.txt`) | 8 files, 86/86 passed, N1-1 to N1-5 present (`covering.log`, `covering-plain.log`) | 8 / 86 ✓ |

- **Slowest covering tests:**
  - LT7: 763 ms;
  - LT9: 482 ms;
  - PU1 (`product-price-unavailable.test.tsx`): 299 ms.
- All of them are under the §3 limit of 2,500 ms, so this is not a STOP. It is reported for B because it is above B's slowest recorded test (444 ms, L31).
- **Code-reviewer:** I ran the real subagent on `a-round-507/diff.patch`, which is `git diff 3021b30` plus the two untracked files. Score 8/10, with no Critical or High finding.
- **Not run (per the task):** the full suite, the build and any browser check. Browser verification is C's.

## For B (not part of the STOP)
- **Doc 328 l.4 on a re-dispatch (L28):** the line pins "C round 507 PASS". L28 says that on a re-dispatch as round N+1, "that doc's l.4 is granted implicitly, for rewriting N only. C checks the string byte for byte". A did not edit doc 328.
- **Final tree:** `a-round-507/frozen-final.log`. `git status` shows exactly the 4 granted paths; checks 1, 2 and 4 are rc 0.
- **A-R507-CR-2 (Low):** N1-4 measures icon size only at volume 0.7. The Unmute icon (volume 0, `AudioPlayer.tsx:163`) and the low-volume icon (l.178) are not checked.
- **A-R507-CR-3 (Low):** the ghost paragraph in `DESIGN_SYSTEM.md` (l.1216) does not describe the press behaviour. Ghost has `active:scale-95`, which stacks with the global `:active` scale 0.98. The brand paragraph just above it does describe its press behaviour.
- **A-R507-CR-4 (Low):** doc 328 l.52 cites `app.css`; the file is `app/styles/app.css`. The same rule is also in `app/styles/base/utilities.css:18`.
- **Reviewer confirmed:**
  - Close's `className` appends only position classes, with no conflict (IconButton does no class merging);
  - pressing Close keeps it centred, because translate and scale are separate properties in Tailwind v4;
  - `{...props}` comes after `aria-label` and `title`, and no call site overrides them;
  - no security issue;
  - no `any` and no type assertions.
- **Architecture note (code-reviewer):** keep. No state, effect or ref ownership moved. A round shape would need a `shape` prop on the shared `IconButton`, which is already tracked as SABA-Q-507-PLAYER-ICON-SHAPE. Nothing should be extracted.

## Acceptance status
- **Met (by A's own runs):**
  - the sketch applied cleanly;
  - frozen checks 1–4 rc 0;
  - typecheck, lint, Biome and the covering tests all match B's §3 values;
  - the code-reviewer was invoked.
- **Not met:** the review raised one Medium (A-R507-CR-1-N1-2-SWAP-MUTANT) that A cannot fix inside the grants. This is the STOP.
- **Not claimed:** any browser row (C1–C11), the full suite and the build.

## Exact next checks for C (if B lets the round proceed, or after sketch v3)
- Run frozen check 4 (`r507-post-sketch-sha.txt`), or the v3 equivalent.
- Run the §4 browser rows at 1440, 1280 and 375:
  - sizes: 40×40 and 32×32;
  - radius 12 px;
  - rest colour `rgb(163,155,142)`;
  - hover: bg `rgb(29,26,23)` and text `rgb(236,230,218)`;
  - player height 90 px and Play centre unchanged at 1440 and 1280; +4 px at 375;
  - Mute sets volume 0 and Unmute sets 0.7;
  - Close leaves the audio paused at t 0;
  - the keyboard ring shows on `:focus-visible` only.
- Record rows for:
  - C3, B-R507-PLAYER-CLOSE-RING-CLIPPED;
  - C6, B-R507-PLAYER-CLOSE-FOCUS-LOST;
  - the anonymous "Sign in required" row;
  - the C11 `/studio-lab` smoke check.
