# A — Round 170 report: V-3c-4c-2 (ArrangementDetailPanel surfaces, D-29z135)

## Start checks
- HEAD `352dc91`, `git status --short` empty, 988 files, frozen 985 `sha256sum -c --quiet` OK, 3 grant start hashes OK.
- Pre-flight run; primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE, prompts/studio-feature, prompts/new-test, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS.

## Changed files (status at end)
```
 M app/components/arrangement/ArrangementDetailPanel.tsx
 M app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx
 M docs/implementation/2026/quarter-IV/138-studio-v3c4c1-library-button-surfaces.md
?? docs/implementation/2026/quarter-IV/139-studio-v3c4c2-detail-panel-button-surfaces.md
```
All 3 grants used. End hashes: `a-round-170/end-sha256.txt`. Diff vs `b-round-169/r170-granted-start/` + doc 139 as new: `a-round-170/diff-vs-start.patch`.

- **S1** l.752 Set selection, **S2** l.861 0 dB reset, **S3** l.1142 toggle: `rounded-sm`→`rounded-md`; `border-outline`→`border-transparent bg-foreground/5`; MOTION + `enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12` inserted (token order as transport `toolButtonClass`). `hover:text-brand`, focus ring, `disabled:text-dim` (S1/S2), `font-mono` (S2), `inline-flex h-6 shrink-0 items-center gap-0.5 pl-2 pr-1` (S3), `h-6 w-fit px-2` (S1/S2) unchanged. No `disabled:opacity-40`.
- **F1** l.640 `inputClass`: `rounded-sm`→`rounded-md` only.
- **Test:** new describe at end of file with DSU1 and DFR1; helpers and token lists inside the describe; own stubs; `afterEach` unmounts before unstubbing. 0 lines removed from the test file; DPS1–DPS5 untouched.
- **D1:** doc 138 l.4 → `**სტატუსი:** Completed (C round 169 PASS; published 352dc91)`; l.126 TODO struck through. Nothing else.
- **D2:** doc 139 created (TEMPLATE sections, R1/R3/R13/R14, probe table, before/after tokens, tests/mutations, trade-offs, TODO, status `In Progress (awaiting C round 170)`).

Process note: while appending the test describe I first appended a one-line placeholder via shell heredoc, then replaced it with the real content via Edit in the same minute. The lasting content went through Edit; flagged for transparency (C-R120-01). Closed: `grep -c PLACEHOLDER_R170` on the final test file = 0, and the test-file sha in `end-sha256.txt` (`2906b539…`) is the final post-Edit content.

`git diff 352dc91 --numstat`: ArrangementDetailPanel.tsx 4 added / 4 removed; detail-panel-strings-ui.test.tsx 104 / 0; doc 138 2 / 2; doc 139 untracked (new).

## Tests and commands (actually run)
| Check | Result |
|---|---|
| Baseline 11 files (`a-round-170/vitest-files.txt`) | 183/183 (`vitest-baseline.json`) |
| After, same 11 files | **185/185** (`vitest-after.json`) |
| `expect(` in detail-panel-strings-ui | 48 → 60 (`expect-counts.json`) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (218 pre-existing warnings, none in my 2 files) |
| `npx biome check` on the 2 code/test files | clean, no fixes |
| Frozen 985 at end | OK |
| Protected diff vs `352dc91` | empty |

Mutations (`a-round-170/mutations/m213..m218.json`; temporary shell string replace → run strings-ui + studio-theme-obsidian → restore from post-edit copy → sha256 verified; re-run against the final test file):
| Mutation | Red |
|---|---|
| m213 Set selection `border-outline` back | DSU1 |
| m214 0 dB without `hover:text-brand` | DSU1 |
| m215 toggle `rounded-sm` | DSU1 |
| m216 toggle without `enabled:hover:bg-foreground/8` | DSU1 |
| m217 inputClass `rounded-sm` | DFR1 |
| m218 inputClass `border-outline` | DFR1, TH5 |

Not run by A (speed rules): full suite, `npm run verify`, build, e2e, every browser row. `browserVerified=false`, `realVerified=false` for A's phase — C owns those.

## Code-reviewer (ran, subagent `code-reviewer`)
Score 9/10, no Critical/blocking. Caveat: the reviewer had no shell and checked by reading the current files against the contract, not via `git diff`; the byte-level scope is the numstat above plus `diff-vs-start.patch`. Addressed: DSU1 now also locks `h-6`/`px-2` on Set selection and 0 dB and `h-6` on the toggle (re-ran tests + all mutations after). Not applied (optional): prefix check `startsWith('border-outline')` on the buttons; shorter doc 139 title.

**Architecture note (verbatim to B):** "Signal (same region changed repeatedly at high cost): the same roughly 330-character SURF+MOTION string is now copied three times in `ArrangementDetailPanel.tsx` (`:752`, `:861`, `:1142`) and once more in `ArrangementTransport.tsx:51`. Rounds V-3c-4a, 4b, 4c-1 and 4c-2 have each hand-copied it. **Keep for now.** Checkpoint Q1 is still open and fallback (c) is the agreed policy. There are no invariants at risk here… **Proposal for planner (after the Q1 answer):** one bounded task, either a file-local `detailButtonSurfaceClass` constant or a shared recipe. It should cover only the SURF+MOTION+RADIUS tokens, leave the per-button extras inline, and keep the DSU1/DPS5 checks unchanged." Not acted on (out of scope).

## B acceptance — A's part
- [x] S1–S3, F1 class-string only; no text/aria/handler/size/padding/data-* change.
- [x] DSU1, DFR1 added in a new describe with internal helpers and afterEach unmount.
- [x] D1, D2.
- [x] Baseline 183/183; after 185/185; typecheck; lint; scoped Biome.
- [x] m213–m218 red, restores sha-verified.
- [x] Code-reviewer run, finding addressed, Architecture note relayed.
- [x] Frozen 985 OK, protected diff empty, git status = 3 ` M` + 1 `??`.
- Browser rows (SURF/BOX/CONTRAST/RV1/FUNC-SMOKE/FOCUS-RING-INFO/G170-3/PX-NET): **not claimed** — C.

## Known gaps
- No browser verification by A. Pre-existing 1280 Set selection squash (B-R169-1280-SET-SELECTION-SQUASH) intentionally untouched.
- The first describe (DPS1–DPS5) still has no explicit unmount — pre-existing, outside the allowed change.

## Exact next C checks
Run §4 rows of `current-task.md` on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720: T170-TARGETED (expect 185/185, DSU1/DFR1/DPS1–5/TH5/TH10/PM1/PM2/F4 green), SOURCE-SCOPE (compare `a-round-170/end-sha256.txt`), AN-REVIEW (`a-round-170/diff-vs-start.patch`), SURF-V3C4C2 (border transparent 1 px, radius 8 px, hover/active fills, transition 0.18 s cubic-bezier(0.2,0.8,0.2,1), reduced-motion `none`), BOX-V3C4C2 (0.00 px vs B probe `before.box`), CONTRAST-V3C4C2, RV1-V3C4C2 (d6 one run per viewport), FUNC-SMOKE-V3C4C2 (Set selection valid/invalid, Clip Gain −20 dB / 0 dB with audio tap + Ctrl+Z, toggle click/Space/Enter), FOCUS-RING-INFO, G170-3, PX-NET/REG-HYD.

## Scope completed
A's implementation phase of V-3c-4c-2 only. Not the stage, not the backlog.
