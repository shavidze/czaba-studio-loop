# A round 470: SABA-B-15 stage 2b. Glow shape fix (sketch s6) and doc 305

**Status:** implemented as dispatched. No STOP.

## Start state (step 1)
- HEAD `9ba13ac`. `git status` showed exactly the 4 round-469 lines.
- `git diff | sha256sum` = `9b69dffe162894903a6c7aeb…` (matches).
- Protected manifest (`b-round-318/protected-sha256.txt`) rc 0 (`a-round-470/protected-before.txt`).
- Sketch sha256 `abff32ff…3c0fc3370` (matches); `git apply --check` rc 0.

## Pre-flight and primitives
- The pre-flight gate was posted before the edits (assumptions, the 3-line sketch plus doc, these 3 files, success = typecheck/lint/vitest rc 0 and 4 status lines).
- Read before the apply: `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md` (the component rule) and the first 60 lines of `GEORGIAN_DOCS.md`.
- **Read only after the `git apply`, when the advisor pointed it out:**
  - the full `primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md` (`app/**.tsx` rule);
  - the rest of `GEORGIAN_DOCS.md`.

  `git apply` bypasses the hook. The change adds no exports and renames nothing, so the late read changes nothing in the diff.

## Changes
1. **Sketch.** `git apply b-round-469/sketch-470.patch.txt` rc 0, no tuning. `git diff -U0` `+` lines equal the sketch's `+` lines byte for byte (`a-round-470/tree-470.diff`, `scope.txt`).
   - `ProductSection.tsx` l.38–39 → `scale-160 … from-brand/6 via-brand/3 via-30% to-transparent to-60%` and `scale-180 … from-accent/5 via-accent/2 via-25% … to-60%`.
   - `StudioShowcase.tsx` l.75 → `scale-145 … from-brand/20 via-brand/12 via-35% … to-70%`. The reflection `blur-[40px]` line is untouched.
2. **Doc 305 (step 3), Georgian:**
   - l.4 is `**სტატუსი:** Completed (C round 470 PASS)`.
   - მიდგომა: the s6 classes, R-470-1 (bright patches, patch delta, lean) next to R-469-1, R-470-2 (stop ceiling), and the rejected option "round 469-ის sketch (s0) … (C-R469-01)".
   - ტესტირება: B's s6 numbers, attributed to B (round-470 planning). It adds the line about the old C1 > 33.4 ms count and the new p95 control, and says "C round 470" for C's confirmation.
   - TODO: keeps TLM-R468-SABA-SCROLL-DEVICE and SIG-R469-UNMEASURED-BLURS, and adds SIG-R470-STOP-CEILING.
   - SP ids cited: SP1, SP2, SP3, which all exist in the test file.
   - The 7 TEMPLATE `## ` headings are in order (`scope.txt`).

**Diff stat vs HEAD:** 2 files, 3 insertions(+), 3 deletions(-), plus 2 untracked files (test unchanged, doc 305). New `git diff | sha256sum` = `ca2df2fad8e8cf42050ba639740ac0da3771e3aed7a1a972271c1ed95ced41a9`.

**Vs the round-469 tree:** only the same 3 glow lines differ (`scope.txt` shows the old and new `+` lines), plus the doc 305 edits.

## Scope checks
| Check | Result | File |
|---|---|---|
| `git status --short --untracked-files=all` | the same 4 paths as round 469 | `a-round-470/scope.txt` |
| test sha256 | `b53b4529…252b` (unchanged) | `scope.txt` |
| `will-change` / `transform-gpu` / `translate-z` in the 2 components | 0 / 0 | `scope.txt` |
| Protected manifest after the change | rc 0 | `scope.txt` |
| `useSmoothScroll.ts`, `root.tsx`, `app/styles/**`, SpecialOffers, Newsletter | untouched (not in `git status`) | `scope.txt` |

## Checks run (A speed rules)
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-470/typecheck.log` |
| `npm run lint` | rc 0 (192 warnings, 1 info; the same count as `a-round-469/lint.log`) | `a-round-470/lint.log` |
| `npx biome check` on the 2 components and the test (scoped) | rc 0 | `a-round-470/biome-scoped.log` |
| `npm run check` (non-mutating Biome) | rc 0 (192 warnings, 1 info) | `a-round-470/check.log` |
| `npm run build`, run alone | rc 0; `git status` unchanged after | `a-round-470/build.log` |
| Built CSS selectors (anchored grep on `app-Cvx8Th9l.css`) | each of the 14 s6 tokens has exactly 1 selector, identical to `b-round-469/built-css-classes-s6.txt` | `a-round-470/built-css-classes.txt` |
| Doc-only selectors (backticked doc 305 tokens that emit CSS but are absent from `app/`) | `transform-gpu` only. It comes from a round-469 doc line ("will-change, transform-gpu") that this round did not change. It is an inert selector, and no element uses it. Info for B | `a-round-470/doc-token-selectors.txt` |
| `npx vitest run app/lib/__tests__/store-scroll-paint.test.ts app/lib/__tests__/studio-naming.test.tsx app/lib/__tests__/store-hidden-focusables.test.tsx app/lib/__tests__/store-` | rc 0: 15 files, 212 tests passed, 5.2 s | `a-round-470/vitest.log` |

- No covering test is near its timeout.
- **Claims pre-check (C13 preview).** I ran `bash b-round-469/claims-470.sh` (read-only) with output in `a-round-470/claims-470-a.txt`, rc 0, 0 `MISSING`.
  - Against `claims-470-planning-output.txt`, only two claims differ, both allowed: K1's diff sha is now `ca2df2fad8e8cf42`, and K4's `--check` now fails because the sketch is applied (the script reports rc 141, a pipe through `head`, after git's "patch does not apply").
  - K14 is unchanged.
- **/check omissions.** `.claude/commands/check.md` asks for `npm run verify` and `npm run test:e2e:smoke`. Neither was run by A: under the loop's A speed rules they are root-gate rows. The full suite was not run either.
- No browser run by A. The look and frame rows (C1–C8) are C's.

## code-reviewer (actual subagent, read-only), score 9/10
The reviewer had no shell, so it checked the current files against the stated before/after classes, not `git diff`. A checked the diff itself (`scope.txt`).
- **Medium (doc l.4):** the reviewer called `Completed (C round 470 PASS)` a premature claim. **Ruled by L28 and task step 3; this is no finding.** Those rules require exactly this string as the post-PASS value, and `c-round-470.json` stays the source of truth.
- **Low (doc, the "B ran the test at round-469 planning" line cites `b-round-468/sp-mutant-head.log`):** false alarm.
  - Round 469's planning lives in `b-round-468/`. The file exists, and in it SP1 and SP2 are red (×).
  - This line predates round 470 and was not edited.
- **Info:** no `aria-hidden` on the empty, pointer-events-none glow divs (no change needed). `bg-gradient-to-b` at `StudioShowcase.tsx:72` is the v3 name; it predates this change and is out of scope.
- **Confirmed by the reviewer:**
  - every class is a valid Tailwind v4 utility (bg-radial, via-N%, to-N%, scale-N);
  - only tokens are used;
  - no layer promotion;
  - R-470-2 geometry (70.7 %) is correct;
  - both sections are `overflow-hidden`, so the larger scaled glow cannot cause horizontal scroll;
  - the doc's classes and SP ids match the files.
- **Architecture note (proposal for B/root only):** no signals. Keep as is. A shared `<Glow>` component would be premature with 3 users; propose it only if the SIG-R469-UNMEASURED-BLURS restyle (Newsletter, SpecialOffers) brings the pattern to a 4th or 5th place.

## B acceptance I truly passed
- Step 1 start-state checks: passed.
- Step 2: the sketch was applied verbatim and the test is untouched (sha matches).
- Step 3: doc 305 updated as specified.
- Step 4: typecheck, lint and the named vitest set are green.
- Step 5: code-reviewer ran; its findings are handled above.
- **Not claimed:** C1–C13 (browser look, frames, overflow, mutants, claims) and the gate.

## Known gaps
- A did not run the s6 look or frame probes itself. The numbers in doc 305 are B's (K9/K9b/K10/K11), attributed to B.
- Real-device scroll (TLM-R468-SABA-SCROLL-DEVICE) is still open.

## Exact next C checks
1. Run C1 on HEAD :3471 first. It must give `/` p95 ≥ 33.0 in ≥ 2 of 3 passes per viewport.
2. Then C2/C3 on TREE :3472, recording the slow-frame scrollY clusters per pass.
3. C6b/C6c on `patches2.cjs`, with S0 :3474 as the mutant: S0 product patch < 0.7, delta > 1.5.
4. C7 crops of the upper-right accent patch (record).
5. C10: the new tree diff sha is `ca2df2fa…`; the `+` lines are byte-equal to the sketch.
6. C11: doc 305 l.4 and headings.
7. C13: K1 diff sha and K4 change as the task allows.
