# A — Round 155 report: V-2b-2 fix-up, C-R154-01 (lane-move ghost timecode Plex Mono 500)

Implementer: A · Date: 2026-10-25 · Task: `current-task.md` (D-29z120) · Status: **implemented, awaiting C round 155**

## Start check (task §Baseline, "First step for A")
- HEAD = `037e25f`. ✔
- `git status --short` = 13 ` M` + 1 `??` (doc 125), same paths as round 154. ✔
- `sha256sum -c b-round-154-r155-granted-start-sha256.txt`: 3/3 OK. ✔
- `sha256sum -c b-round-154-r155-tree-sha256.txt`: 970/970 OK. ✔
- Pre-flight run (assumptions, smallest version, 3 files, success = TH10 green + mutations). Primitives read: TAILWIND_FIRST, DESIGN_TOKENS, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, GEORGIAN_DOCS, TESTING_QUALITY_GATES, AGENT_DISCOVERABLE_CODE.

## Changed files (only the 3 grants; all edits via Edit)
| ID | File | Change |
|---|---|---|
| F1 | `app/components/arrangement/ArrangementLane.tsx` | l.929: added a single `font-normal` token. Diff vs start copy = 1 line (see `a-round-155/diff-vs-start.patch`). Container l.912, drop ghost, range label: byte-identical. |
| T1 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | (i) TH10 N6 `after` → `'"shrink-0 whitespace-nowrap font-mono font-normal tabular-nums"'`, `before` unchanged. (ii) New source-level assertions at the end of TH10: exact l.912 container literal count = 1 (message: "lane-move ghost container keeps the inherited font-medium for the sans title") and N6 span with `font-normal` count = 1 (message: "lane-move ghost timecode span overrides the inherited font-medium with font-normal"). TH1–TH9 and other TH10 entries unchanged; `// @vitest-environment node` unchanged; no snapshots. |
| D1 | `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | Status → `In Progress (awaiting C round 155)`. Added C-R154-01 Problem → Solution entry, a round-155 testing entry (TH10 change, m141/m142), and changed TODO: V-2b-3 names the drop ghost and range overlay label (R3); css2 trim waits for R4 evidence (PLEX500-INVENTORY + COOKIE-SOURCE). In Georgian. |

## Tests actually run
| Command | Result |
|---|---|
| Baseline vitest, 24 files (`a-round-155/vitest-files.txt` = round-154's 21 + grid-snap-ui, marker-snap, grid-snap-clip-edges) | **382/382 pass** (`a-round-155/vitest-baseline.json`) |
| Same 24 files after edits | **382/382 pass**, TH10 green (`a-round-155/vitest-after.json`) |
| `npm run typecheck` | exit 0 (`typecheck.log`) |
| `npm run lint` | exit 0; 218 warnings + 1 info that existed before (`lint.log`) |
| `npx biome check` on the 2 code/test files (read-only) | exit 0, clean (`biome-scoped.log`). The first run flagged one formatter line wrap in the new assertion. I fixed it by Edit before taking the post-edit hashes. |
| m141: remove `font-normal` from l.929 | 381/382; **only TH10 red**, via the N6 `after` string (`mutations/m141.json`). Restored by Edit; sha256 = post-edit hash ✔ |
| m142: remove `font-medium` from container l.912 only | 381/382; **only TH10 red**, via the new container assertion (ii); the N6 string still matched (`mutations/m142.json`). Restored by Edit; sha256 = post-edit hash ✔ |

Not run by A, as the speed rules require: the full suite, `npm run verify`, build, e2e, and all browser rows.

Code-reviewer: not invoked. Only 2 code/test files + 1 doc changed, and the task says it is not required. No Architecture note.

## End check
- Frozen 970: OK. Protected diff vs `037e25f` (studio.$productId, api.studio-token, account.downloads, download-routes.test, auth*, AuthContext, StudioContext, Modal, root, CookieConsent): empty.
- `git status --short` = same 13 ` M` + 1 `??`. `diff a-round-155/git-status-start.txt a-round-155/git-status-end.txt` shows no difference (same paths). HEAD still `037e25f`.
- The TH part of `diff-vs-start.patch` has exactly 2 hunks: the N6 `after` line and the appended (ii) block.
- `a-round-155/end-sha256.txt` (3 grants), `a-round-155/diff-vs-start.patch` (vs `b-round-154/r155-granted-start/`), `post-edit-sha256.txt`.

## B acceptance passed by A (A-side only)
- F1, T1 (i)(ii)(iii), D1: done as specified.
- Baseline/after vitest, typecheck, lint, scoped Biome: pass.
- m141 and m142 behave as the task predicted.
- End scope checks: pass.

Not claimed: MONO-STYLE-N6, LANE-GHOST-FIT, PLEX500-INVENTORY, COOKIE-SOURCE, FUNC-SMOKE-S, G155-3 and PX-NET/REG-HYD. These are C's browser and evidence rows.

## Known gaps
- The effect in the browser (Plex Mono at weight 400, CDP "IBM Plex Mono [web]") is not verified yet. The test checks the source only, because the ghost only appears during a drag and TH10 runs in a node environment.
- R3 items (the drop-ghost timecode and the range overlay label) still use sans inside sentence strings by design. They are V-2b-3 scope.
- The css2 trim is not done (R4).

## Exact next C checks
1. T155-TARGETED: `npx vitest run $(cat a-round-155/vitest-files.txt)`, expected 382/382.
2. SOURCE-SCOPE / AN-REVIEW: `sha256sum -c a-round-155/end-sha256.txt`, the frozen 970, the protected diff, and `diff-vs-start.patch`.
3. MONO-STYLE-N6 at 1440×900 and 1280×720: `[data-testid=arrangement-lane-move-ghost-label] > span:first-child` should be weight 400, Plex Mono, tabular-nums, CDP "IBM Plex Mono [web]". The title should stay Instrument Sans 500.
4. LANE-GHOST-FIT (info), PLEX500-INVENTORY, COOKIE-SOURCE (source-level; render blocked), FUNC-SMOKE-S, G155-3, PX-NET/REG-HYD.

## Scope completed
Round 155 A scope (F1, T1, D1) is complete. The whole backlog is **not** complete; V-2b-2 is waiting for C.
