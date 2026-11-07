# A round 376 — PERF-11c-iii-c1 (Transport leaves)

## STOP — needs B ruling (L11 / L58), tree left at the consistent applied-sketch state

1. **TC10 timeout headroom (L11, old L32).** `transport-centre-ui.test.tsx` › "TC10 Play and Stop share a Playing or Stopped description that follows every toggle". Declared timeout: vitest default **5 s** (no describe/row timeout; `vitest.config.ts` sets none). A's time in the 140-file covering run: **3,088 ms (62 %)**. Gate 375 `gates/round-375/verify.log` l.521: 2,096 ms (42 %). The higher time decides → above 50 %. Not a changed file, so not in B's §0 "no changed-file row above 50 %" claim.
   - Standalone, same file only, 3 runs each (`a-round-376/slow-rerun.log`, `a-round-376/head-tc10.log`): tree 1,456 / 1,466 / 1,485 ms vs a HEAD copy (the 6 files from `git show HEAD:`) 1,337 / 1,319 / 1,302 ms → ≈ +10 % from c1. The 3.09 s is mainly load (4 workers, 140 files). The HEAD copy was removed after measuring.
   - Other rows near the line are below 50 % of their own timeout: CP12a–d (30 s describe) max 4,637 ms = 15 %; UM1 2,507 ms and UM9 2,499 ms (20 s describe) = 13 %; render-budget Play→Stop→Play 2,138 ms (15 s) = 14 %; RB-LEAF4 386 ms; FL11 below the 300 ms report line.
2. **Reviewer Medium on B's sketch (L58), test files frozen by the sha manifest, so A did not edit:** *A-R376-REVIEW-M1* — RB-LEAF4 never makes an edit that leaves `undoLabel`/`redoLabel` unchanged, so nothing proves `undo`, `redo`, `splitSelection`, `deleteSelection` keep identity across edits (the Edit group would re-render per edit if one did). Proposed row: two `setClipGain` edits with the same label, Edit group 0 on the second. A's read: the provider deps are ref/store-based (`undo`/`redo` deps `[flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory, setStatus]`), and MU-T-ACTIONS-FRESH already turns RB-LEAF4 + start-hold red for a fresh actions object on non-edit commits; failure mode is a perf miss, not behaviour. B rules severity / whether to add the row.
   - The reviewer's second Medium (*A-R376-REVIEW-M2*, the one-frame expiry assumes synchronous commits) is documented in doc 243 (A's own file); A grepped `startTransition|useDeferredValue|useTransition` in ArrangementContext.tsx, StudioWorkspace.tsx, ArrangementTransport.tsx: 0 hits. Code unchanged. B may still want a guard row.

Everything else below is complete.

## Changed files (grants `b-round-375/grants-376.txt` only)
- `sha256sum b-round-375/sketch.patch.txt` = `01243414bf435f0c…78fceaed` = `sketch-dispatched.sha256`; `patch -p1` applied clean; `sha256sum -c sketch-files-sha256.txt` **6/6 OK** (re-checked after review, still 6/6). No other edit to:
  - app/components/arrangement/ArrangementTransport.tsx
  - app/components/arrangement/StudioWorkspace.tsx
  - app/lib/arrangement/__tests__/drag-preview-render.test.tsx
  - app/lib/arrangement/__tests__/render-budget.test.tsx
  - app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx
  - app/lib/arrangement/__tests__/self-disabling-focus.test.tsx
- New: docs/implementation/2026/quarter-IV/243-perf-transport-leaves.md. l.4 byte-exact `**სტატუსი:** Completed (C round 376 PASS)`. `## ` headings equal TEMPLATE's seven in order (diff empty). Mutant list cites rows that actually went red in `b-round-375/mutants/mutant-*.log` (grep of `×` lines), not the task table: e.g. MU-T-UNDO-ARM-SELF also TC9; MU-T-CANZOOMBACK-TRUE FL6, FL10, SD1, SD2, SD2b, SD3, NS1, NS3; ACTIONS-FRESH / EXPORT-INLINE / VIEW-NO-MEMO also the start-hold row.
- Protected files untouched; `git status`: the 6 M files + the 1 new doc only.

## Checks (logs in `a-round-376/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0; 205 warnings / 1 info repo-wide, pre-existing (`lint.log`) |
| `npx biome check` on the 6 files | rc 0, "Checked 6 files … No fixes applied", no diagnostics (`biome.log`) |
| `xargs -a b-round-375/covering-376.txt npx vitest run` | **140 files, 2,200 tests pass**, rc 0, 174 s (`covering.log`, `covering.clean.log`) |
| Not run by A (speed rules) | full suite, `npm run verify`, build, perf, mutants, browser rows |

## Code review (code-reviewer subagent, on the diff; score 8/10; no Critical/High)
- M1, M2: see STOP above.
- Lows (sketch files, not edited — for B): rAF scheduled even when nothing armed (`ArrangementTransport.tsx` ~l.200, early return); DP23 title "renders the transport" is stale and could also assert Centre/View 0 on `selectClip`; unused `event` params (l.336/451/529, Biome rule off); wrapper-name `toBe(0)` in RB-LEAF4 is a site-revert tripwire only (kept, by design).
- Doc Lows fixed in doc 243 (A's file, doc-only so no code re-review needed): `openExportDialog` deps wording (`[]`); which two "commit happened" controls were renamed (PERF-8b describe and GH1, after `resetExportState()`); synchronous-commit assumption added.
- Reviewer could not run git, so HEAD-vs-tree attribute parity (titles/aria) was not confirmed by it; B's §0 claims and C's browser rows cover that.
- **Architecture note (for B, not acted on):** three `use*Actions(workspace)` hooks now sit in StudioWorkspace (l.1032–1034) and render-budget tests were rewritten across rounds 374–376; reviewer says keep for now, route to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Alternative noted: a per-group state bump on arm would remove the timer and survive transitions at +1 group render per click; reviewer verdict keep current.

## Pre-flight honesty
A applied B's frozen sketch byte-for-byte and wrote no code. Primitives actually read: GEORGIAN_DOCS.md, docs/implementation/TEMPLATE.md headings, doc 242 as the house model, lessons L11/12/23/26/28/47/50/58. The code primitives listed in the task (AUDIO_ARCHITECTURE, REACT_CONTEXT, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS) were not re-read because A authored no code.

## Known gaps
- TC10 headroom and reviewer M1 await B's ruling (above).
- No browser or perf run by A (C's and gate's rows).

## Exact next C checks
- Name-keyed rows live on tree: RB-LEAF4 (mount > 0 for the four inner names, then the step table), FL11, GH1 (`ArrangementTransportViewInner` > 0 at mount, 0 on status write), DP23 mount controls + Edit group on selection.
- Browser 1440×900 and 1280×720: the four hand-offs (Undo→Redo, Redo→Undo, Delete→Undo, Zoom back→Fit) land on the partner with a visible ring; soft-disabled titles/`aria-keyshortcuts` equal HEAD; Loop pressed state; zoom slider value/readout; Export dialog opens and focus returns to Export; Play/Stop and position during playback.
- Perf (production build, alone): zoom.1 41, zoom.30 128, click 29, range/background-range `move-components-max` 27/39 within budget.
- Re-time TC10 in the full suite / gate `verify.log`.
- Doc 243: l.4 byte check; mutant rows vs logs; L26 every cited row id exists.

## B acceptance criteria actually passed by A
- §1.1 sketch applied, 6/6 sha OK, no other edit — **yes**.
- §1.2 doc 243 with l.4, TEMPLATE headings, required content — **yes** (C to verify).
- §2 typecheck, lint, Biome on the 6 files, 140 covering files — **yes, all green**; "report any test above 50 %" — **reported, TC10 (STOP)**.
- §2 code-reviewer on the diff — **yes**; re-review after change: only doc 243 changed after the review, and it got a **delta re-review** (code-reviewer, doc 243 only): **no inaccuracies**; the 10 mutant row lists match the `×` lines in the logs, `openExportDialog` `[]` at StudioWorkspace l.1031, no `startTransition`/`useDeferredValue`/`useTransition` on the path (`startTransition` only in `entry.client.tsx`), the two `StudioWorkspace > 0` controls at l.343–344 (SS8a) and l.384–385 (GH1), l.4 exact. One optional Low nit (also name `useTransition` in l.30) not applied.

**Round status:** STOP pending B's rulings on TC10 headroom and A-R376-REVIEW-M1. Not self-marked complete.
