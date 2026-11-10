# A round 434 — SABA-B-12 stage 3b (Studio dialog scrollbar)

STATUS: DONE (A scope). No STOP. Ready for C.

## Changed files (exactly the 6 granted paths)
`git status --short --untracked-files=all` → 4 ` M` + 2 `??`:
- ` M app/components/ui/Modal.tsx` (sketch only)
- ` M app/components/arrangement/studio-scrollbar.ts` (sketch only)
- ` M app/components/arrangement/ArrangementShortcutSheet.tsx` (sketch only)
- ` M app/components/arrangement/ArrangementExportDialog.tsx` (sketch only)
- `?? app/lib/arrangement/__tests__/studio-dialog-scrollbar.test.tsx` (sketch only, DS1–DS4)
- `?? docs/implementation/2026/quarter-IV/282-saba-b-12-dialog-scrollbar.md` (A, whole file)

The 5 sketch files were applied with `git apply` from `b-round-433/sketch-434.patch.txt` (sha256 `8aed38f329cada7bcb16c6bd5242a26616915d0a0f0de7f5b9ca764940920975`, matches the task) and not edited afterwards. No protected, frozen, auth, route, purchase or download file touched.

## Checks (logs in `a-round-434/`)
| # | Check | Result |
|---|---|---|
| A1 | claims at start | rc 0, stderr 0 bytes (`claims-start.txt`). Equal to `claims-434-planning-output.txt` except K13 location: `archive` instead of `backlog:open_findings`, same id, severity and status. The task accepts this ("K13 by location"); optimize-backlog archived the finding. HEAD `0c22ac9`, tree clean before apply |
| — | sketch apply | `git apply --check` + `git apply` rc 0 |
| A2 | `npx vitest run $(cat b-round-433/covering-files.txt)` | rc 0, **30 files, 442/442** (`covering.log`) |
| L31 | timing (`timing.log`, verbose) | DS1 193 ms, DS2 14 ms, DS3 1 ms, DS4 3 ms (max 3.9 % of 5 s). render-budget R11-P1e **1206 ms** of 5 s (round 433: 979 ms) |
| A3 | `npm run typecheck` / `npm run lint` | rc 0 / rc 0, 205 warnings + 1 info, the same as HEAD (`typecheck.log`, `lint.log`) |
| A4 | `npx biome check` on the 5 code/test files | rc 0, 0 errors, 5 warnings, all pre-existing a11y in `Modal.tsx` (98, 107, 123, 297, 304) (`biome.log`) |
| A5 | claims at end (re-run after the doc fix) | rc 0, stderr 0 bytes (`claims-end.txt`). Differs from the planning output only in K2 `2 ?? 4 M total 6`, K5 `no`, K6 doc 282 last with line 4, K8 `1/1/1`, K8b `1/1/1`, K8c `sheet 1 export 1 legacy 0`, K17 DS1…DS4 one each, plus the K13 location line above. K3 frozen 1338 rc 0; K4 protected rc 0, granted-protected 0; K19 `L58 OK` |
| A6 | code-reviewer (real subagent, 6 files) | No Critical/High/Medium. 1 Low (doc), fixed in the doc only. See below |

Doc 282 self-checks: line 4 is byte-exact to ruling 8. The 7 TEMPLATE `## ` headings are in order. The mutant block is `cmp`-identical to `b-round-433/mutants/summary.txt`. The only row ids cited are DS1–DS4 (grep). The Firefox note (ruling 5), the prop note (ruling 6), DS4 reach (ruling 7) and the Tech Lead row (TLM-SABA-B-12-FIREFOX-SAFARI, deadline RETRO 435) are stated. The HEAD/sketch browser table and the contrast numbers are copied from `b-round-433/probe/compare.txt`, `compare-head.txt` and `contrast.txt`. The ARCH checkpoint TODO is present.

I did not run a browser probe in this round. Rows 4, 4b and 5 belong to C, and B's probe numbers in the doc come from B's run.

## Primitives, lessons, skills read
- Primitives, read in full: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
  - `GEORGIAN_DOCS.md` was first read only to about line 51. I read lines 50–100 before hand-off.
  - Those lines give a general docs layout. TEMPLATE's 7 headings govern implementation docs, as the task requires, so doc 282 needed no change.
- Primitives, read in part (the first 30–60 lines): `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`.
- Doc 281, used as the style model.
- `lessons.md` (60 lines): I read the A self-check section (L11–L15, L26, L28 and the rest of that section) before hand-off, not at the start.
  - **L12:** `grep -rln styled-scrollbar app/**/__tests__` hits only the new DS file, so no other test depends on the removed token.
  - **L14:** no button names changed. The covering suites for the sheet and Export dialog pass.
  - **L15:** no new colour was introduced. The contrast numbers are B's measurements, quoted in the doc.
  - **L26 and L28:** checked.
  - **L11:** no STOP condition hit. The longest timing is 193 ms of 5 s.
- I did **not** read `context/active-summary.md` or `context/active-backlog.json`. I only grepped `backlog.json` for TLM-SABA-B-12-FIREFOX-SAFARI.
- **Pre-flight skill:** applied **late**. I read it after the sketch was applied and the doc was written, not before.
  - Retroactive gate: the assumptions are B's rulings 1–8.
  - Smallest version: B's sketch, +14/−3 lines in 4 files plus 1 test file, applied without edits.
  - Files: the 6 grants only.
  - Success: A2–A5 as listed above.
- **`/check` (`.claude/commands/check.md`):** it asks for the full `npm run verify` plus `npm run test:e2e:smoke`. Under the 2026-10-21 speed rules and the task's §5, A ran only the scoped subset: typecheck, lint, Biome on the 5 files, and the covering vitest. **Full verify and the e2e smoke were not run by A**; they belong to the root gate.

## Reviewer findings (code-reviewer, 9/10; `a-round-434/review.md`)
- **Low (doc), fixed.** The doc said `ConfirmModal`. The real component is `ConfirmDialog` (`Modal.tsx:271`, used by `cart.tsx:634`). I verified this with grep, and `ConfirmModal` does not exist anywhere in `app/`. The doc now says `ConfirmDialog` in 4 places. **For B:** the task text §1 and ruling 1 carry the same misnomer.
- **Advisor touch-ups (doc only).** Ruling 5 now says a `scrollbar-color` would replace the Studio skin with the standard bar (experiment 1). It no longer says the thumb would vanish. The mermaid ConfirmDialog label is quoted. The invariants and end claims were re-run afterwards, with an unchanged result.
- **Info, addressed.** The doc's DS4 summary now also says DS4 requires that exactly the two files hold a Modal.
- **Info (no action).**
  - Dropping `styled-scrollbar` loses no overscroll behaviour, because the panel keeps `overscroll-contain` and DS2 checks it.
  - `scrollbarClassName=""` is filtered out.
  - The pre-existing `ref as React.RefObject` assertion and the comments in `Modal.tsx` are HEAD code and are out of scope.
- The reviewer raised no TL-R434-* items as new findings.

## For B
- **Architecture note (reviewer; a proposal, not a refactor):** the shared store primitive `Modal.tsx` now carries a Studio-specific use, and DS4 enforces it with a source scan rather than with types. Keep it for now: the change is small, the default is unchanged, and there are only two callers. Revisit a bounded `StudioDialog` wrapper (skin, focus trap, Esc) if a third Studio dialog appears. This is already covered by question 4 of ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS.
- Fix the `ConfirmModal` → `ConfirmDialog` naming in future task text.

## Known gaps
- No browser check by A: C rows 4, 4b and 5 are pending.
- Firefox and Safari are not checkable in the cloud (TLM-SABA-B-12-FIREFOX-SAFARI).
- The `/cart` ConfirmDialog cannot be opened in the cloud (no backend). DS1 covers it at unit level only.

## Exact next C checks
In the task's order: row 3 (mutants on HEAD + sketch), row 4 (scrollbar probe with `ignoreDefaultArgs: ['--hide-scrollbars']`, expect `ALL OK (2 cells)`), row 4b (search-clear neighbour, `ALL OK (2 cells)`), row 5 (auth), then rows 1, 2, 6 and 7. The dev server is at :5173 on A's tree. Doc row 6: the doc now names `ConfirmDialog`, not `ConfirmModal`.

## Scope completed
B §3 steps 1–4 and A1–A6 all pass. C's acceptance rows are not self-marked, and the backlog is not marked complete.
