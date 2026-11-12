# A round 462: STORE-2b-3d-1, deleting 6 dead Store modules

**STOP: needs a B ruling on step 6 / claim K23 (claim value only, the code is complete).**
- `claims-after.txt` matches `b-round-461/claims-462-expected-after-A.txt` on every row except K23. Stderr is empty and the script returns rc 0.
- K23 now reads `storeDocForms=292 293 294 296 297 301`. B's file expects `292 293 294 296 297`.
- **Cause:**
  - *Observed:* B's expected file has `K15 doc301free=1` but no 301 under K23. The real doc 301 has the exact line 4 that §2.3 requires, and K23's regex (`claims-462.sh` l.33) matches that line.
  - *Inferred:* the placeholder doc 301 that B used (current-task §6) lacked that status line.
- The two requirements (§2.3 line 4 exact, step 6 output identical) cannot both hold. I kept §2.3.
- Under L22 this is a claim-value STOP, so the full C run applies.
- Evidence: `a-round-462/claims-after.txt`, `a-round-462/claims-after.err` (0 bytes).

## What changed (15 paths = grants-462.txt)
- The sketch was applied with `git apply`: `sha256sum -c sketch-462.sha256` gave OK, and the 8 file sha256 checks gave 8 OK. No hand edits.
- **Deleted (6):**
  - `app/components/home/VideoShowcase.tsx`
  - `app/components/loading/PianoLoadingAnimation.tsx`
  - `app/components/loading/PianoCurtainLoader.tsx`
  - `app/components/loading/CinemaCurtainLoader.tsx`
  - `app/components/audio/Timeline.tsx`
  - `app/lib/email.server.ts`
- **Modified (8):**
  - 4 barrels: `app/components/{home,loading,common,audio}/index.ts`
  - 4 tests: `app/lib/__tests__/store-{gradient-text,teal-sweep,glow-shadow,live-teal}.test.ts`
- **New:** `docs/implementation/2026/quarter-IV/301-store-2b-3d-1-dead-store-modules.md` (Georgian).
  - Line 4 is the exact §2.3 text.
  - `grep -ci pending` = 0, and `grep -rn 'C round [0-9]* pending' docs/implementation` = 0.
  - The 7 TEMPLATE headings appear in order.
  - Every test row the doc names exists: GS2, GS4, GT1b, GT3, GT4b, GT5, GT5b, GT6, LT7, TS1, TS2, TS5.
- **Scope:** `git status --short --untracked-files=all` lists 15 paths: 6 D, 8 M and 1 `??` (`a-round-462/status.txt`).
  - The path lists match `grants-462.txt` after both sides were reduced to bare paths (`diff` rc 0).
  - The letters also match line for line, except doc 301, which git shows as `??` and the grants file marks `A`. It is untracked, as §4 step 7 expects.
  - Evidence: `a-round-462/scope-compare.txt`.

## Checks actually run
| Check | Result | Log |
|---|---|---|
| Claims before | identical to `claims-462-planning-output.txt`; stderr empty | `a-round-462/claims-before.txt` |
| `npm run typecheck` | rc 0 | `a-round-462/typecheck.log` |
| `npm run lint` | rc 0, 192 warnings, 1 info | `a-round-462/lint.log` |
| `npx biome check` on the 4 barrels + 4 tests | rc 0, 8 files, no fixes | `a-round-462/biome.log` |
| `npx vitest run` on the 6 covering files | 6 files / 77 tests passed; vitest `Duration 1.36s` (tests 2.05s) | `a-round-462/covering.log` |
| Mutants (`/tmp/a462-mut` = a7fa78e + sketch) | `mutants.txt` byte-identical to B's: BASE GREEN, M1–M9 RED with the listed rows | `a-round-462/mutants/mutants.txt` |
| Claims after | identical except K23 (see the STOP above) | `a-round-462/claims-after.txt` |
| code-reviewer subagent | 0 Critical/High/Medium, 5 Low, 1 Info, 9/10 | `a-round-462/code-review.md` (verbatim) |

**Not run (gate rows):** the full suite, `verify`, the production build. I used no browser, because no UI changed. B's prod build and page probe are its evidence, and C6–C8 re-run them.

## code-reviewer findings (all Low; for B, not fixed)
The touched files are pinned by sha256 to B's sketch, so a hand fix would break C3. None of the findings blocks this round.
- **CR-R462-L1:** GT6 checks only the exact `.ts`/`.tsx` paths. A module brought back as `.jsx` or in another folder would not be caught.
- **CR-R462-L2:** GT6's scan of `components/index.ts` cannot fail, because that file holds only `export *` lines. Barrels outside the 5 listed (ui, product, chat …) are not scanned; tsc covers them. This adds to TL-R462-L2.
- **CR-R462-L3:** GT1b's allow-list check compares an empty constant with itself. It guards against new entries but has no real check content.
- **CR-R462-L4:** `store-live-teal.test.ts`'s `'loading-brand': {}` is equivalent to a missing key, because of `?? {}`. It only documents intent.
- **CR-R462-L5:** in `app/components/loading/index.ts` the `// Component Skeletons` comment is now out of place.
- **Info:** ChatButton is imported by `ChatWidget.tsx`, which is not mounted. It is dead only transitively.
- **Architecture note (proposal for B/root, not acted on):** keep things as they are now. Possible later split: move GT5/GT5b/GT6 into their own `store-dead-modules.test.ts` before 2b-3d-2.

## Known gaps
- K23 claim deviation (STOP above).
- The B-acceptance browser rows C6/C7/C8 were not run by A; they belong to C.

## B acceptance I truly passed
- Step 1: lessons A part; the four primitives read in full (the last two completed before handover).
- Step 2 (claims before).
- Step 3 (apply + sha checks).
- Step 4 (doc 301 per §2.3).
- Step 5 (typecheck, lint 192, biome, covering 6/77, mutants identical, code-reviewer).
- Step 7 (scope = 15 grant paths).
- **Step 6 NOT passed as written** (K23 only).

## Next C checks
C1–C10 as in current-task §5. For C2, compare against the expected-after-A file with only K23 differing, pending B's ruling. Heaviest first: C6 builds, then C7 on the same servers, then C8 on dev :5173.
