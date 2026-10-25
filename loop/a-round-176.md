# A round 176 — DUX-R-5b-2a mixer on-states + A-R175-DETAIL-SEP-ACCENT

**Status:** implementation complete, awaiting C. No commit, push, install or browser work by A.

## Pre-check (task §0, "A's first step")
- HEAD = `c53eefc`, the tree was clean, 997 files, `sha256sum -c` of the 988-entry frozen list OK, all 9 start hashes OK, and neither new file existed.
- Base vitest (13 files): **184/184** (`a-round-176/out/vitest-base.json`).

## Changed files (9 grants + 2 new; `git status` = 9 ` M` + 2 `??`)
| ID | File | Change |
|---|---|---|
| M1, M2 | `app/components/arrangement/ArrangementLane.tsx` l.615, l.633 | Mute on → `border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted`; Solo on → `border-foreground bg-foreground text-background enabled:hover:bg-foreground enabled:active:bg-foreground` |
| M3–M5 | `ArrangementGroupHeader.tsx` l.288, l.304, l.306 | as M1 and M2; mixed → `border-foreground bg-gradient-to-r from-foreground/40 from-50% to-transparent to-50% text-foreground` |
| M6 | `ArrangementMaster.tsx` l.173 | as M1 |
| B1 | `ArrangementDetailPanel.tsx` l.1121 | `hover:bg-accent/60` → `hover:bg-foreground/50` (only that token) |
| L1 | `lane-strings-ui.test.tsx` | the Mute-on and Solo-on expected tokens only |
| L2 | `track-group-mix-ui.test.tsx` | l.540 `from-foreground/40`; Mute-on and Solo-on tokens; the mixed full string and its tokens |
| L3 | `transport-surface-ui.test.tsx` | the Master Mute-on tokens only |
| L4 | `affordance-colour-ui.test.tsx` | removed `DETAIL_SEPARATOR_ACCENT_GAP_R175`, its TODO and its DXA7 branch (now `toBe(0)`); removed the ExportDialog `accent-brand = 6` and Lane `'border-accent bg-accent/20 text-accent' = 2` counts and the now-unused `EXPORT_DIALOG_PATH` |
| T1 | **new** `mixer-onstate-colour-ui.test.tsx` | DXM1–DXM6 (§3.2) |
| D1 | doc 144 | (a)–(d) exactly as written |
| D2 | **new** doc 145 | Georgian, TEMPLATE sections, status `In Progress (awaiting C round 176)` |

Nothing else changed: no `style=`, no hex, no `app/styles/`, no data-/aria/handler/size changes. The kept sites (§0.2) and the 5b-2b/5b-3 sites are untouched. The protected diff against `c53eefc` is empty (StudioWorkspace, app/styles, routes, components/studio, contexts, .claude were checked). The frozen 988 list is still OK.

## Tests and checks actually run
- Targeted vitest, 14 files (`a-round-176/vitest-files.txt`): **190/190** (`out/vitest-final.json`). That is 184 base + 6 new.
- `npm run typecheck`: OK.
- `npm run lint`: 0 errors. The 218 warnings and 1 info are pre-existing and not in the owned files.
- Read-only `npx biome check` on the 9 owned code and test files: clean.
- Mutations `a-round-176/mutations/m258…m265.json` (tool: `a-round-176/tools/mutate.mjs`, run with cwd = store). **All 8 turned red as required**, and each was restored and sha-checked:
  - m258: DXM1, DXM2, DXM6, LSU7.
  - m259: DXM2, DXM6, LSU7.
  - m260: DXM2 (distinctness), DXM6.
  - m261: DXM3, DXM6, UM11.
  - m262: DXM3, DXM6, UM4, UM11.
  - m263: DXM4, DXM6, TS8 (transport-surface).
  - m264: DXM5, DXM6, DXA7.
  - m265: DXM6, DXA6, DXA7.
- Not run by A, per the speed rules: the full suite, `npm run verify`, build, e2e and all browser rows.
- Artifacts: `a-round-176/end-sha256.txt` (11 paths) and `a-round-176/diff-vs-start.patch` (against `b-round-175/r176-granted-start/`, with the new files as new).

## Finding for B/C: mixed Solo contrast at rest differs from §0.1 (A-R176-MIXED-REST-BASE, info or Low)
- §0.1 assumes the `from-foreground/40` half paints over the base `bg-foreground/5`. In fact tailwind-merge v3 **drops `bg-foreground/5`** when `bg-gradient-to-r` is merged. I checked this with a direct `twMerge` call, and the existing UM11 asserts `bg-foreground/5` is absent on the mixed button. The `enabled:hover:/8` and `enabled:active:/12` fills stay.
- A's computation (sRGB WCAG, elevated #1d1a17, foreground #ece6da):

  | State | Half (rgb) | Half vs group header | Letter on half |
  |---|---|---|---|
  | Rest | ≈ (112,108,101) | **3.30** (B: 3.62) | **4.22** (B: 3.85) |
  | Hover | — | 3.81 | 3.66 |
  | Press | — | 4.08 | 3.42 |

- Every value stays ≥ 3:1. The rest half is exactly at B's 3.3 floor, so C must measure it in CONTRAST-ONSTATE.
- No token was changed for this, because that is outside §1. B rules on it.
- **R2 note for C (mixed button only):** the M5 string has no hover or press override. Its background-color therefore goes transparent → `foreground/8` → `foreground/12` under the gradient. §0.1's hover 3.80 and press 4.07 already assume this. The structure is the same as the pre-existing `from-brand` version. For the mixed button, only the gradient, border and text must equal rest. Background-color follows the hover/press values above. "Hover and press equal rest" applies literally to the Mute-on and Solo-on buttons (track, group, Master).

## Code review (code-reviewer subagent, run for real): 9/10, nothing blocking
- **Addressed:**
  - Low 1–3: doc 145 now has the full §0.1 table (6.03; hover 3.80; press 4.07 and 3.42), the ExportDialog K line numbers, the loop-edge 3.43 value, and "DXM1–DXM5 mount".
- **Not adopted:**
  - Suggestion 1, "assert `bg-foreground/5` stays under the gradient": it is factually wrong. The base is dropped by tailwind-merge, and UM11 already locks its absence. See the finding above.
  - Low 4, the `as const` in DXM6: kept. It follows the existing precedent (`RETIRED_AFFORDANCE_TOKENS … as const`). It is a const assertion, not a type cast. B may rule.
  - Suggestion 2, the redundant `not.toStrictEqual` in DXM2: kept for intent, as the reviewer advised.
- **Architecture note (verbatim, for B):**
  > Signal 3 (the same region changed repeatedly at high cost): the mixer on-state strings in `ArrangementLane.tsx` l.615/633, `ArrangementGroupHeader.tsx` l.288/304/306 and `ArrangementMaster.tsx` l.173 changed again. Each change forces matching token updates in 4–5 test files (L1–L3 plus DXM6). Keep for now: §0 (D-29z141) explicitly decided against a semantic token, `app/styles/` is outside this grant, and checkpoint Q1 has no answer. This stays a signal under GATE167-TOKEN-TEST-FRAGILITY and checkpoint Q1, not a task.
  > Test harness: `mixer-onstate-colour-ui.test.tsx` l.285–362 is another copy of the fake Web Audio and ResizeObserver harness. Keep for now. It is test-only, does not affect audio timing, refs or Undo, and is already queued as ROOT-RECON-GRID-HARNESS.

## B acceptance: what A truly passed
- §1, M1–M6, B1, L1–L4, T1, D1, D2: done as written.
- §3.1: before = 184/184; after = 190/190; typecheck, lint and scoped biome OK; code-reviewer invoked.
- §3.3: m258–m265 all red as required.
- Browser rows (§4): **not A's, not run.** realVerified is still pending C.

## Known gaps
- The mixed rest contrast is 3.30, not 3.62 (above).
- The Ableton parity for on-state colours is unverified (§5). It is an inference only.
- The harness duplication (ROOT-RECON-GRID-HARNESS) is noted, not solved.

## Exact next C checks
1. T176-TARGETED: re-run `a-round-176/vitest-files.txt`. Expect 190/190.
2. SOURCE-SCOPE: compare against `end-sha256.txt`. Check the frozen list, that `git status` shows 9 M + 2 ??, and that the protected diff is empty.
3. AN-REVIEW: read `diff-vs-start.patch`.
4. INVENTORY-GREP: run it per token.
5. CC-ONSTATE: confirm the mixed button has **no** base `bg-foreground/5` at rest (background-color transparent). R2 "hover/press = rest" applies literally to the Mute-on and Solo-on buttons. On the mixed button, only the gradient, border and text equal rest; its background-color steps to foreground/8 and /12 by design (see the R2 note above).
6. NO-BRASS-ONSTATE.
7. SEP-HOVER: at 1280, expand the details panel first.
8. CONTRAST-ONSTATE: measure the mixed rest half against the group header, expecting ≈ 3.30 (threshold 3:1).
9. STATE-DISTINCT-ONSTATE.
10. FUNC-SMOKE-ONSTATE.
11. ENV-VIS.
12. RV1-DUX5B2A.
13. RV3-STORE.
14. G176-3.
15. PX-NET / REG-HYD.

## Scope
Round 176 scope is complete on A's side. DUX-R-5 as a whole is **not** complete: 5b-2b and 5b-3 remain. The backlog is not self-marked.
