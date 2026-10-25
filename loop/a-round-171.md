# A round 171 — V-3c-4c-3 (D-29z136) — Export dialog and video dock surfaces

Status: implementation complete, code-reviewed (9/10, no blocking findings). Waiting for C.
browserVerified=false, realVerified=false for A's phase (every browser row belongs to C).

## Start check
- HEAD `fe6ea99361592b9ca6dbecda8f1879d47cf0a369`, clean tree, 989 files; 984 frozen OK; 5 grant start hashes OK.

## Changed files (exactly the 5 grants + doc 140; all grants used)
- `app/components/arrangement/ArrangementExportDialog.tsx` — 9 lines, class strings only:
  - S1 Cancel (l.581), S2 Done (l.596): R16;
  - S3 Export (l.615): R15 `exportLook` variant;
  - S4: the six cards at l.288/321/344/365/392/418, radius only.
- `app/components/arrangement/ArrangementVideoDock.tsx` — 2 lines:
  - K1: l.60 `VIDEO_FLOAT_BUTTON_CLASS`, radius only;
  - K2: l.911 Return, radius only;
  - l.901/l.920 (the R19 frames) are still `rounded-sm` and untouched.
- `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx` — +204 / −0:
  - a new final describe with ESU1 and ECR1;
  - its own beforeEach/afterEach, helpers inside the describe;
  - views are unmounted in afterEach, and ESU1 settles its render in `finally`.
- `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` — +85 / −0:
  - a new final describe with VFR1;
  - its own setup, unmount in `finally`.
- `docs/.../139-…md` — l.4 is now exactly `**სტატუსი:** Completed (C round 170 PASS; published fe6ea99)`; the l.100 TODO is struck through. Nothing else changed.
- new `docs/.../140-studio-v3c4c3-export-dialog-video-dock-surfaces.md` — D2, with status `In Progress (awaiting C round 171)`.

## Tests actually run
- **Baseline**, the 19 files in `a-round-171/vitest-files.txt`: 279/279 (`vitest-baseline.json`).
- **After the edits**, the same 19 files: **282/282** (`vitest-after.json`) = 279 + ESU1 + ECR1 + VFR1, all green.
  - HE1–HE8, FS1, LVD1, VDS1–VDS3, TH11 and the TS rows are unchanged and green.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It reports 218 warnings and 1 info; they were there before and none are in my files.
- `npx biome check` on the 4 code/test files: clean, no fixes.
- **`expect(` counts:** hold-enter 47 → 61; video-dock-strings-ui 44 → 48 (`a-round-171/expect-counts.txt`).
- **Mutations m219–m226** (`a-round-171/mutations/m2xx.json`): all 8 turned red as required, and m223 turned both ESU1 and HE5 red.
  - Each mutant was applied and restored by Edit. Both components' sha256 matched `post-edit-sha256.txt` before the next mutant.
  - After the review hardening, all 8 were re-run against the final test files (temporary sed mutation, restored by copy, sha256 verified each time): all red again (`mutations/final-recheck/`).
- **Not run by A** (speed rules): the full suite, `npm run verify`, the build, e2e and every browser row.

## Code review (code-reviewer subagent, actually invoked)
- **Score:** 9/10. No Critical, High or Medium findings. The reviewer confirmed spec compliance for S1–S4 and K1–K2, and that the MOTION tokens are byte-identical to `ArrangementTransport.tsx:51`.
- **Lows:**
  - **Applied (L1):** the radius-only sites now also exclude `bg-foreground/5` and every `motion-` token; the cards also exclude `border-transparent`.
  - **Applied (L3):** ESU1 now settles its render in `finally`.
  - **Not applied (L2):** ECR1 finds the video card with `:not([data-testid])`. Making that cleaner would need a new `data-*` attribute, which the task forbids.
  - **Not applied (L4):** the Export focus ring sits against the brand border with no offset. This was already so before this round and nothing changed it; C should look at the Export focus state in the 4× crops.
- **Architecture note (verbatim for B; not acted on):**
  > Signal 3 (the same costly change repeated across rounds): `ArrangementExportDialog.tsx:581`, `:596`, `:615` now hold copies of the SURF+MOTION recipe, the same one as `ArrangementTransport.tsx:51`. V-3c-4a/4b/4c-1/4c-2 already pasted it into the toolbar, lane/group headers, Library and DetailPanel. Each round re-pastes about 230 characters per site and adds a new token-lock test with its own copy of the token list (`MOTION_TOKENS`/`SURFACE_FILL_TOKENS` now exist as separate test-local copies in several files). If the spec changes (for example the duration or the fill percentages), the edit touches N components and N tests.
  > - Keep, for now: fallback (c) is in force until root answers the pending checkpoint (`b-round-170-checkpoint-request.md`). The copies are class strings only and touch no audio timing, refs, gesture lifecycle, Undo/Redo or hook shape. They are locked by tests, so the current cost is mechanical, not a bug risk.
  > - Proposal for the planner, only if the checkpoint answer is "extract": one bounded round that moves SURF, FILL and MOTION into a single exported class-string module under `app/lib/arrangement/` (or `components/arrangement/`), with no `cn()` structure change at the call sites. Add one shared test-side token list, and keep the existing per-site locks green unchanged. Acceptance: zero computed-style or box delta (RV1 or BOX), and the existing locks plus `transport-surface-ui` are green. Cost: low-medium.

## End state
- The 984 frozen files are OK. The protected diff vs `fe6ea99` is empty: the purchase/auth routes, `download-routes.test.ts`, `app/styles`, `components/ui` (Modal), icons, `root.tsx`, contexts, MarkerRow, Transport, `strings.ts` and `studio-lab.tsx`.
- `git status`: 5 ` M` + 1 `??` (doc 140), nothing else.
- `a-round-171/end-sha256.txt` (6 paths) and `a-round-171/diff-vs-start.patch` (vs `b-round-170/r171-granted-start/` + doc 140 as new) were regenerated after the final edits.

## B acceptance I actually passed (A's part only)
- §1 S1–S4, K1–K2, D1 and D2 are implemented as specified.
- §2: ownership is respected, ESU1/ECR1/VFR1 are added with helpers inside the new describes, and the existing tests are unchanged.
- §3: baseline 279/279; after 282/282; typecheck, lint and scoped Biome are clean; the `expect(` counts only grew; m219–m226 are all red and restored; the code-reviewer was invoked; end-state checks are done.
- The §4 rows are **not** claimed: they are C's (browser).

## Known gaps
- **Cancel (E2):** nobody has verified it in a browser yet. C has to catch it during a real render (`c-round-100/tools/lib100.cjs` l.82–127 has a recipe).
- **R15 is a visible look change:** Export loses its solid brand fill, and contrast goes 8.32 → 7.05 per B's probe. Saba can veto it; `keepFill` is the fallback.
- **Dock buttons** keep the global 150 ms transition (C-R168-BORDERLESS-REDUCED-MOTION).
- **Export focus ring:** it sits flush against the brand border (reviewer L4). This is not new; it is a look-check item for C.

## Next C checks
Run the §4 rows of `current-task.md` on http://127.0.0.1:5173/studio-lab at 1440×900 and 1280×720:
- T171-TARGETED: expect 282/282 on `a-round-171/vitest-files.txt`;
- SOURCE-SCOPE: compare with `a-round-171/end-sha256.txt`;
- AN-REVIEW: read `a-round-171/diff-vs-start.patch`;
- SURF-V3C4C3: include E2 Cancel and reduced motion, plus 4× crops, the Export focus state among them;
- BOX-V3C4C3;
- CONTRAST-V3C4C3;
- RV1-V3C4C3;
- FUNC-SMOKE-V3C4C3: real WAV download parse, Cancel status text, Done focus restore, cards, dock drag/close/Escape/Return/playback;
- G171-3;
- PX-NET/REG-HYD.
