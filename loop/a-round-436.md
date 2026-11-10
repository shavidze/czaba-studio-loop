# A round 436 — COPY-PD-VIS stage 1 (STUDIO-VIS-4 + SR-435-2, STUDIO-VIS-6)

STATUS: DONE (no STOP; ready for C)

**Status:** implemented, ready for C. No STOP.
Baseline HEAD `8233840`, clean tree at start. No commit, push or deploy.

## Changed files (11, all inside `b-round-435/grants-436.txt`)
- `app/lib/arrangement/strings.ts`: 4 literals ("Clip origin", " · clip origin ", "From", "To").
- `app/components/arrangement/ArrangementClip.tsx`: the inline move/trim status says "clip origin".
- 8 test files (assertion literals only, 24 lines): clip-fades-ui, detail-panel-polish, detail-panel-strings-ui, grid-snap-clip-edges, lane-strings-ui, strings.test.ts, track-layout, workspace-strings-ui.
- New: `docs/implementation/2026/quarter-IV/283-studio-vis-4-6-detail-copy.md`.
  - l.4 is `**სტატუსი:** Completed (C round 436 PASS)`. This follows the format of docs 270–282; the value string is exactly what the task gives.
  - The TEMPLATE headings are in order.
  - Every cited test row id was grep-verified (1 hit each).

The code change is B's sketch applied as-is. A made no edit beyond it.

## A checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | `git apply --check` OK. Applied; `git diff` equals the sketch, ignoring `index` lines. 10 headers | `a-round-436/applied.diff` |
| A2 | covering vitest: 8 files, 208/208, rc 0. Slowest test 1766 ms against the 5000 ms default (35 %, under the L11 50 % line) | `a-round-436/covering.log` |
| A3 | typecheck rc 0. lint rc 0, 205 warnings (= B's `b-round-435/precheck-lint.log` on the sketch; A did not lint HEAD itself) | `a-round-436/typecheck.log`, `lint.log` |
| A4 | K9 source-offset 0 / clip-origin 3. K9b old 0 / files 0 / new 20 (= B's sketch output) | `a-round-436/sweeps.txt` |
| /check | Biome scoped to the 10 changed code files: rc 0, no fixes | `a-round-436/biome-scoped.log` |
| claims | `bash b-round-435/claims-436.sh` rc 0. Diff vs B's sketch output: only K1 (B's scratch HEAD hash), K2 (total 11) and K6 (doc 283 present), as C10 expects | `a-round-436/claims-a.txt` |
| scope | `git status`: the 10 granted M paths + doc 283. Frozen manifest rc 0, protected manifest rc 0 | (this run) |

Not run by A (speed rules / gate): the full vitest suite, `npm run verify`, the build, and the browser rows (C3–C7, C12, C13).

## code-reviewer (real subagent run)
No Critical, High, Medium or Low findings; score 9/10.
- Info: WSU2's check on the new text is a side assertion.
- Info: "Clip origin" could be misread as a timeline position. Saba approved the wording.
- Info: the manual citation was not verified by the reviewer.
- Architecture note: none (TL-R436-02 is already deferred).
No code changed after the review.

## Process record (truthful)
- **Pre-flight:** the gate (assumptions, smallest version, files, success commands) was posted in chat after `git apply --check` and before the sketch was applied.
- **Read:**
  - the task, `context/active-summary.md`, store `AGENTS.md` (= CLAUDE.md), `.claude/commands/check.md`, `.claude/primitives-map.json`, the pre-flight skill and `docs/implementation/TEMPLATE.md`;
  - the lessons: A-section L11–L28, plus L3, L23, L29, L39, L56 and L58 (headlines);
  - the primitives mapped to the changed paths: GEORGIAN_DOCS (full), plus the section structure of AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT and AUDIO_ARCHITECTURE. DESIGN_TOKENS and TAILWIND_FIRST were not opened: no class or colour changed.
  - There is no root `/home/runner/czaba-project/AGENTS.md`.
- **The sketch was applied with `git apply`**, so the Edit hook's primitive reminder did not fire for the 10 code files. Literal-only changes; no component structure, token or class change.
- **/check:** `check.md` asks for `npm run verify` + `test:e2e:smoke`. Per the speed rules, A ran only typecheck, lint, the covering tests and Biome scoped to the changed paths. verify/smoke are gate/C rows and were **not** run by A.
- **Doc 283's facts were cross-checked against B's artifacts:**
  - mutants M1–M5 red and the sketch green: `mutants/summary.txt`;
  - HEAD hits 0+2+1+3+1+3+1 = 11 per viewport, boxes equal and overflow 0: `probe/compare-raw.txt`.

## Proposal for B (architecture note, not acted on)
- AGENT_DISCOVERABLE_CODE rule 2 ("one concept, one term"): the UI now says "clip origin" while the code keeps `sourceOffset` / `sourceOffsetLabel` / `clip-offset-label` (B's ruling 1). A later rename round, or a glossary line in `docs/technical/`, would remove the split. This is not a finding for this round.

## B acceptance passed by A
A1, A2, A3 and A4 PASS. Browser rows C3–C14 are C's and are not claimed here.

## Known gaps
- The range inputs' label-in-name gap (TL-R436-03, deferred Low) is unchanged by ruling.
- The inline status literal (TL-R436-02, deferred Low) is unchanged by ruling.
- Q4 / SR-435-1 (unit in the label) is still awaiting Saba.

## Next C checks
C1 SOURCE-SCOPE → C3–C7 browser via `b-round-435/probe/copy-probe.mjs` against http://127.0.0.1:5173 (warm up first). Then C2 PATCH-IDENTITY, C8 mutants, C9 unit, C10 claims (expected extra diffs: K2 total 11, K6 doc 283 present), C11 doc 283, C12 auth guard, C13 smoke, C14 end scope + l57-check.
