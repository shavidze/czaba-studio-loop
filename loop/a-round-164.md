# A round 164 — SABA-B-1 (envelope visibility) + SABA-B-2 (overview corners)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-25 · Task: `current-task.md` round 164 (D-29z129)

## Start state (verified before editing)
- HEAD `0e4287f423d287a1a7b4fc885ae7f1a14bdc5788`, `git status --short` empty, 982 files.
- Frozen 977 (`b-round-163-r164-tree-sha256.txt`) `sha256sum -c --quiet` OK; 5 grant start hashes OK.
- Baseline vitest on the 6 files of `b-round-163-r164-vitest-base.txt`: **92/92** → `a-round-164/vitest-baseline.json`.

## Changed files (all within the grants)
| ID | Path | Change |
|---|---|---|
| E1 | `app/components/arrangement/ArrangementClipEnvelope.tsx` | `text-accent` removed from the line `svg` class; nothing else on the svg |
| E2 | same | One polyline → two with the same `points`, `fill="none"`, `vectorEffect="non-scaling-stroke"`: halo `className="stroke-background"` `strokeWidth={4}`, then line `className="stroke-foreground"` `strokeWidth={1.5}`; no `stroke=` attribute |
| E3 | same | Point class → `absolute z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-xs border border-background bg-foreground hover:scale-125` (verbatim B string) |
| O1 | `app/components/arrangement/ArrangementOverview.tsx` | frame `rounded-xs` → `rounded-sm`; nothing else |
| EV1 | `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | New `describe('SABA-B-1 envelope visibility (EV1)')` with 1 `it` (checks Env off → on → off); existing tests untouched |
| OV1 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | New `it('OV1: …')` inside the existing describe; nothing else |
| D1 | `docs/implementation/2026/quarter-IV/132-studio-v3c3a-video-dock-icons.md` | l.4 → `**სტატუსი:** Completed (C round 163 PASS; published 0e4287f)` |
| D2 | **new** `docs/implementation/2026/quarter-IV/133-studio-saba-b1-b2-envelope-overview.md` | TEMPLATE sections, Georgian; status `In Progress (awaiting C round 164)` |

All 5 grants were needed. `git status --short` = 5 ` M` + 1 `??` (doc 133), nothing else.

## Tests and commands actually run
- Same 6 files after edits: **94/94** (92 + EV1 + OV1, both green) → `a-round-164/vitest-after.json`.
- `npm run typecheck`: exit 0 (`a-round-164/typecheck.log`).
- `npm run lint`: exit 0; 218 warnings + 1 info repo-wide (pre-existing; none in the 4 owned code/test files) (`lint.log`).
- `npx biome check` (read-only) on the 4 code/test files: clean (one formatter issue in my EV1 token list found first and fixed by Edit before the final run).
- `expect(` counts: clip-envelope-ui **136 → 153**, studio-theme-obsidian **72 → 76**. No drop.
- Not run by A (per task): full suite, `npm run verify`, build, e2e, any browser row.

## Mutations (Edit → run → restore by Edit → sha check vs `a-round-164/post-edit-sha256.txt`)
| ID | Mutation | Result | Restore |
|---|---|---|---|
| m178 | line `stroke-foreground` → `stroke-accent` | 25/26, only EV1 red | 4/4 OK |
| m179 | halo polyline deleted | 25/26, only EV1 red; EU5 ×3, EU7 ×3, AL1 ×2 green (two-sided) | 4/4 OK |
| m180 | point `bg-foreground` → `bg-accent` | 25/26, only EV1 red | 3/4 OK; Overview differed only because m181 was already applied (see note) |
| m181 | frame `rounded-sm` → `rounded-xs` | 11/12, only OV1 red | 4/4 OK |

Note on m180: its restore check (`m180-restore.txt`) was run after I had already applied the m181 Edit, so that file shows ArrangementOverview.tsx as differing (mutated by m181) and the envelope file OK. The m181 restore check afterwards shows all 4 files OK, and `end-sha256.txt` equals `post-edit-sha256.txt` for the 4 files.

## End state
- Frozen 977 OK at end; `git diff 0e4287f` lists only the 5 grants; protected paths diff empty (studio.$productId, api.studio-token, account.downloads, download-routes.test, app/styles, StudioWorkspace, contexts, ArrangementClip).
- `a-round-164/end-sha256.txt` (5 grants + doc 133), `a-round-164/diff-vs-start.patch` (vs `b-round-163/r164-granted-start/` + doc 133 as new).
- No commit, push, stash, install, build, or browser run by A.
- `a-round-164/mut-run.sh` was written with a shell heredoc. It is a test runner in the loop folder, not a source edit. Every repo edit, including each mutation and its restore, went through Edit/Write.

## Code-reviewer (actual subagent run, read-only)
Verdict: no Critical/High/Medium; 9/10. Findings, not applied (EV1/OV1 are defined exactly by the task; changing them would also invalidate the mutation hashes):
1. info (for C): Tailwind v4 wraps `hover:` in `@media (hover: hover)`; if ENV-VIS (c) shows no `scale: 1.25`, check Playwright hover/media emulation before the class.
2. Low: old `svg polyline` queries (EU5/EU7/AL1, l.612/736/741/900) now read the halo; valid because EV1 locks equal `points`. Doc 133 "პრობლემები" records this.
3. Low: EV1 does not lock `-translate-x-1/2`, `-translate-y-1/2`, `cursor-move` (centring under hover scale). Proposal for a later round.
4. Low: OV1 overlay lock is an exact source string (format-fragile); a regex or test id is a later option.
5. Low (visual edge, for C as a note): the view frame has no min width; at high zoom on a long project a frame < 12 px with 6 px radius looks pill-shaped. Not covered by OV-CORNERS/RV1.
6. info: the 4 px halo extends 2 px beyond the body at gain 1 / gain 0 (`overflow-visible`); covered by ENV-VIS (e).

**Architecture note (verbatim for B):** "none. diff მხოლოდ class-ებსა და markup-ს ცვლის. … `ArrangementOverview.tsx:293/305/329`-ზე სამი hard-coded `rounded-sm` ერთად უნდა იცვლებოდეს. დავტოვებდი ასე, რადგან ამას OV1 იცავს და spec მას V-3c-5-მდე გადადებს. ახლა საერთო constant-ში გატანა ერთჯერადი abstraction იქნებოდა."

## B acceptance criteria — status from A's side
- Passed (A-runnable): E1–E3, O1, D1, D2 as specified; EV1 and OV1 added and green; 6 targeted files 94/94; typecheck, lint, scoped Biome; m178–m181 each kill their lock; frozen/protected/status checks.
- **Not run by A (C's rows):** ENV-VIS, ENV-FUNC (incl. real audio), OV-CORNERS, RV1-SABA, OV-FUNC, G164-3, PX-NET/REG-HYD. `realVerified` for SABA-B-1/2 is **false** until C runs them. Contrast ≥ 3:1 and notch ≤ 1 are B's simulated predictions, not measured on the real code by A.

## Exact next C checks
1. T164-TARGETED: `npx vitest run $(cat a-round-164/vitest-files.txt)` → 94/94, EV1 + OV1 present.
2. SOURCE-SCOPE: hashes vs `a-round-164/end-sha256.txt`; frozen 977; git status 5 ` M` + 1 `??`.
3. ENV-VIS at DPR 2, both viewports, states (a)–(f): computed line rgb(236,230,218)/1.5, halo rgb(14,13,12)/4, point bg rgb(236,230,218) border rgb(14,13,12), 10×10; (c) `scale` 1.25 (see reviewer info 1); `sample()` min ≥ 3:1 in every state.
4. OV-CORNERS at DPR 4: radius 6px ×3; notch tl/tr/bl/br ≤ 1 on touched corners (baseline 3/13/3/15).
5. ENV-FUNC (add/drag/delete/undo/redo/A key + real audio peak < 25 %), OV-FUNC, RV1-SABA (d6 ±1 px), G164-3, PX-NET/REG-HYD.
6. Optional note: narrow-frame appearance at max zoom (reviewer Low 5).

## Known gaps
- No browser verification by A (by task design).
- Reviewer Lows 2–5 left for B to schedule or defer.
- Scope completed: round 164 A implementation only. The backlog is not complete.
