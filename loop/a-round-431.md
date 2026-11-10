# A round 431 — SABA-B-12 stage 2a (STUDIO-VIS-2): Export dialog radios drawn by the theme

Status: DONE (implementation complete; awaiting C). No STOP.

## Changed files (`git status --short --untracked-files=all`: 4 ` M`, 3 `??`)
- ` M app/components/arrangement/ArrangementExportDialog.tsx` (sketch only)
- ` M app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` (sketch only)
- ` M app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx` (sketch only)
- ` M app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx` (sketch only)
- `?? app/components/arrangement/studio-radio.ts` (sketch only)
- `?? app/lib/arrangement/__tests__/studio-radio.test.ts` (sketch only)
- `?? docs/implementation/2026/quarter-IV/279-saba-b-12-export-radios.md` (A, whole file)

The sketch `b-round-430/sketch-431.patch.txt` (sha256 `18d59a2fbe599fa84d67e442d6b602fc313a32982b2643172a62e861ee8222d6`, 6 `diff --git` headers) was applied with `git apply --check` and then `git apply`, both rc 0. None of the six sketch files was edited afterwards.

## Checks (logs in `a-round-431/`)
| # | Check | Result |
|---|---|---|
| A1 | `bash b-round-430/claims-431.sh` at the start | rc 0, stderr empty (`claims-start.txt`). It differs from `claims-431-planning-output.txt` only in **K13's location**: `archive` instead of `backlog:open_findings`. The id was found, not NOT-FOUND, so K13 passes by location. The backlog optimizer probably archived it after B planned. |
| A2 | `npx vitest run $(cat …/covering-files.txt)` | rc 0, **29 files, 384/384** (`a2-vitest.log`, ANSI-stripped `a2-clean.log`). Timeout headroom was checked on the full untruncated list. Every single test at or above 1.5 s was mapped to its declared timeout; `vitest.config.ts` has no `testTimeout`, so the default is 5 s. Results: UM1–UM11 in `track-group-mix-ui`, max 3,271 ms against a 20 s describe (gate 430: 3,181 ms) → 16 %. `render-budget` 'does not re-render clips…' 2,857 ms against a 15 s test timeout (gate 3,004 ms) → 20 %. `render-budget` RB-IM 2,021 ms / 15 s. `render-budget` R11-P1e 2,142 ms against the **5 s default** (gate 2,086 ms) → **43 %**, the closest to the limit. `master-ui` footer test 1,993 ms against a 15 s describe. No covering test is at or above 50 %, so this is no STOP. |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each (`typecheck.log`, `lint.log`). Lint has 205 warnings and 1 info, the same as HEAD and B's precheck. |
| A4 | `npx biome check` on the 6 code and test files | rc 0, no fixes (`biome6.log`) |
| A5 | Claims at the end | rc 0, stderr empty (`claims-end.txt`, re-run after the doc fix). Compared with `claims-431-sketch-output.txt`, it differs only in K1 (the real HEAD `5a30894` instead of B's scratch commit), K2 (`3 ?? 4 M total 7`), K6 (doc 279 is last, with l.4 as ruling 9) and K13 (archive location, as in A1). Also: K2b 0, K3 frozen 1330 rc 0, K4 protected rc 0 with 0 granted-protected, K5 `no`, K8 `radios 6 accent-brand 0 radio-class-uses 6 constant-file present`, K8c `DXA7-kept 0 DXL8-accent5 0 DXL7c-progress 1`, K17 `1 RD1 1 RD2 1 RD3`, K19 `L58 OK`. |
| A6 | `code-reviewer` subagent on the 7 files | No Critical, High or Medium. 4 new Lows (below). The doc Low was fixed in the doc. |
| extra | Real Chromium, B's probes on A's tree at :5173 (`a-round-431/probe/`) | Attempt 1 timed out on a cold start (environment, L38; kept as `probe/probe-attempt1-cold.log`). After a browser warm-up: `radio-probe.mjs` → **`ALL OK (2 cells, 6 radios each)`** (`probe/compare.txt`). `radio-extra-probe.mjs` → **`EXTRA ALL OK (2 cells)`** (`probe/compare-extra.txt`; forced colours, disabled-checked, and WAV export through to the file). I looked at `after/1440x900-dialog.png` and `after/1280x720-mp3-key-focus.png` myself: there is no OS radio, the disabled Video and Time selection radios show faded hollow rings, and keyboard focus draws the ring around the dot. 0 page errors. |

Contrast (L15): I did not compute any new ratios. B's computed values (`b-round-430/probe/contrast.txt`): unchecked ring vs card 3.5:1, brass ring vs selected card 6.74:1, centre vs ring 8.32:1, hover ring 9.72:1, focus ring ≈ 4.85:1. My probe gives the same computed colours: `rgb(115,107,96)` 1 px, `rgb(201,164,106)` 4 px, centre `rgb(14,13,12)`, hover `rgb(217,184,127)`. The reviewer re-derived 3.5:1 independently.

## What I read (honest)
- Primitives, in full: `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- Primitives, partly: `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (the regression acceptance rule, the heading outline and the frontend bug-hunting section) and `FORWARDREF_COMPONENT.md` (outline only; this round adds no component). I read them before applying the sketch.
- Lessons, read with lines cut at about 600–1,200 characters: the A self-check section (l.42–51: 11, 12, 13, 14, 15, 26, 28) and 1, 4, 23, 31, 38, 58 and 61. I did **not** read `lessons.md` end to end in full; the long evidence tails of several lessons were cut.
- **Not read:** `context/active-summary.md` and `context/active-backlog.json` (the output of my first command was too large and was persisted, and I did not open it), the root and store AGENTS files, and the `pre-flight` skill. I did not run the `pre-flight` skill formally. The scope came from the task's grants list, and the claims script checks it (K2b 0, K3 rc 0, K4 rc 0).
- Also read: the whole task, `sketch-431.patch.txt`, B's probe outputs (`compare*.txt`, `contrast.txt`, `head/radio-probe.json`), `mutants/summary.txt`, doc 278 (format) and `gates/round-430/verify.log` (timeout times).

## Reviewer findings (code-reviewer, A6)
- **A-R431-REVIEW-L1 (Low, sketch test, not editable):** RD2 (`studio-radio.test.ts:62`) passes `<input type="text" {...rest} />`, where the spread could override `type` at runtime. `ArrangementMixFader.tsx:62,75` has this shape today. TypeScript `Omit<…,'type'>` (l.18–21) guards it; the regex does not. Fix: flag any input tag that contains `{...`, or allow-list it.
- **A-R431-REVIEW-L2 (Low, sketch test):** `\btype=` also matches `data-type=` and `aria-…type=` (`studio-radio.test.ts:9,11`). Fix: `(?<![\w-])type=`.
- **A-R431-REVIEW-L3 (Low, sketch test):** `LITERAL_TYPE` `[a-z]+` rejects `type="datetime-local"`, which would be a false red. Fix: `[a-z-]+`.
- **A-R431-REVIEW-L4 (Low, doc) — FIXED in doc 279:** the doc said a radio "cannot hide behind a spread", following ruling 6's wording. It now says the guard covers `type={variable}` and spread-only tags, and states that a spread after a literal type is covered by TypeScript, not by RD2. The TODO now lists all three regex limits. After the advisor review I also added an explicit SABA-B-12 stage list to the TODO (1 done, 2a this, 2b, 3, 4 deferred), as task step 3 requires. The end claims were re-run after that edit: rc 0, and they differ only in K1, K2, K6 and K13. Doc l.4, the 7 headings and the 7 mutant lines were re-checked.
- Reviewer side notes: RD3 compares exact class strings, which is close to L12 but does not select by class, so it is not counted as a finding. An `<input …></input>` written without self-closing would make INPUT_TAG overrun; this is theoretical and not reported.

## For B
- **Architecture note (reviewer, proposal only):** `studio-radio.ts` is the second class-constant module next to `studio-fader.ts`, and both are enforced by source-scan regexes. One bounded future task could add a `StudioRadio` forwardRef component, so the guard becomes "no raw `type="radio"`". Keep it as is this round.
- **Ruling 6's wording is too strong:** "a radio cannot hide behind a spread" is not what RD2 proves (A-R431-REVIEW-L1). Please record L1–L3 as Lows on the sketch's test file. Under the 2026-10-23 gate they are `deferred_low_polish` candidates.
- **Probe naming quirk (C row 4):** in `radio-probe.mjs`, `checkedRest`/`*-both-checked.png` is measured after ArrowDown has cycled back to WAV. In both HEAD and after, it shows `both` **unchecked**; at 1440 it is mid 150 ms fade, `rgb(142,125,99)`. `compare-radio.py` passes regardless. C should not read that crop as "Both checked"; Both becoming checked is covered by `arrowDown2.bothChecked`; the checked dot look is covered by the `wav`/`project` rest crops and `mp3-key-focus`.
- K13 now resolves to `archive` (see A1).

## Known gaps
- Firefox and Safari are not checked (TLM-SABA-B-12-FIREFOX-SAFARI, deadline RETRO 435).
- A did not run: the full vitest suite, the build, verify or the mutants. These are gate rows and C row 3.
- Stage 2b (`<progress>`), stage 3 (search ✕) and stage 4 (selects) are not started.

## Next C checks
Rows 1–7 as written in the task: claims, patch identity (cmp of the 6 files), mutants (7 lines), `radio-probe` and `radio-extra-probe` at both viewports, auth, doc 279 (l.4 byte-exact, 7 headings, 7 mutant lines, cited rows exist), and source scope at the end plus L57.

## B acceptance self-assessment (A's part only)
A1 ✔ (K13 by location), A2 ✔, A3 ✔, A4 ✔, A5 ✔ (expected differences only), A6 ✔ (no Medium+). C rows are C's to judge.
