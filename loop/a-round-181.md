# A — Round 181 report: M1, round icon-only Play button (D-29z146)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-26 · Baseline HEAD `59d4bab`
No commit, push or deploy. The :5173 server was not touched, and A did no browser work.

## Start checks (all OK)
- HEAD = `59d4bab`.
- `sha256sum -c --quiet b-round-180-r181-tree-sha256.txt` (999 entries): OK.
- The 6 hashes in `b-round-180-r181-granted-start-sha256.txt`: all OK.
- Vitest base, 15 files, before the edits: **229/229, 0 failed** (`a-round-181/out/vitest-before.json`).
- Pre-flight was run. These primitives were read first: FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/new-test.md and docs/implementation/TEMPLATE.md.

## Changed files (7, all edited with Edit/Write)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` | **P1:** classes are now `'w-8 justify-center rounded-full px-0 bg-foreground text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88'`. **P2:** both `<span>` labels and both fragments are removed; the lucide icons are unchanged. **P3:** `aria-label` uses `studioPlaybackStrings.pauseLabel/playLabel`, and a new `title` uses `pauseTitle/playTitle`. |
| `app/lib/arrangement/strings.ts` | **S1:** `playLabel: 'Play'`, `pauseLabel: 'Pause'`, `playTitle: 'Play (Space)'`, `pauseTitle: 'Pause (Space)'`. |
| `app/lib/arrangement/__tests__/strings.test.ts` | **S2:** the same 4 entries were added to `EXPECTED_V02B_PLAIN_STRINGS.studioPlaybackStrings`. |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | **T1:** in TS1, Play must have `rounded-full` and not `rounded-md`; the other 11 buttons must have `rounded-md`. The counts 12 and 10 are unchanged. **T2:** `present` has `w-8 h-8 rounded-full px-0 justify-center` added, and `w-24` was dropped from it. `absent` has `w-24 rounded-md px-2.5` added. `textContent` must be `''` for Play and for Pause. The ▶/❚ checks are kept. New `title` checks use `playTitle` / `pauseTitle`. The svg count, lucide class and role lookups are unchanged. The TS2 title was reworded to "…lucide icon only, round". |
| doc 147 | **D1:** the l.124 TODO is struck through and marked done (C round 179 PASS, published `15189d5`). |
| doc 148 | **D2:** l.4 status → `Completed`. The l.121 TODO is struck through and marked done (C round 180 PASS, `59d4bab`). |
| doc 149 (new) | **D3:** Georgian, with the TEMPLATE sections, P1–P3/S1, R38–R40, B's prediction table, m299–m303 and the §6 Ableton rows. Status: `In Progress (awaiting C round 181)`. |

`git status` shows 6 ` M` + 1 `??`, and nothing else. Frozen 999 was OK again after the mutations. `a-round-181/end-sha256.txt` (7 paths) is OK.
Diff: `a-round-181/diff-vs-start.patch` (the 6 grants against `b-round-180/r181-granted-start/`, plus doc 149 in full).

## Commands actually run
| Command | Result |
|---|---|
| `npx vitest run <15 files from a-round-181/vitest-files.txt>`, after the edits | **229/229, 0 failed** (`out/vitest-after.json`) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (218 warnings + 1 info, repo-wide and already present; none in the 4 files) |
| `npx biome check` on the 4 code/test files | "Checked 4 files. No fixes applied." Clean, and nothing was reflowed. |
| Not run (not A's job) | full suite, `npm run verify`, build, e2e, browser rows |

`/check` (`.claude/commands/check.md`) normally means `npm run verify` + `npm run test:e2e:smoke`. Under the 2026-10-21 speed rules and the task §4, A ran only the scoped part: typecheck, lint, Biome on the 4 owned paths, and the 15 targeted files. The verify and smoke part of `/check` is open for the root gate.

## Mutations (`a-round-181/mutations/m29x|m30x.{json,diff}`, tool `a-round-181/tools/run-mutation.sh`)
Each mutation was a temporary perl edit of `ArrangementTransport.tsx`, followed by the 15-file run, a restore, and `sha256sum -c end-sha256.txt`. Every restore was **OK**.
| ID | Edit | Red | Expected red / green met? |
|---|---|---|---|
| m299 | `rounded-full` → `rounded-md` | TS1, TS2 (227/229) | yes; the other 14 files green |
| m300 | `w-8` → `w-24` | TS2 (228/229) | yes; the other 14 files green |
| m301 | `<span>Play</span>` re-added after the Play icon, in a fragment | TS2 (228/229) | yes |
| m302 | `title` attribute removed | TS2 (228/229) | yes; the other 14 files green |
| m303 | `aria-label` → `playTitle` / `pauseTitle` | 25 tests in 10 files: TS1, TS2, render-budget (4), grid-snap-ui GS14, grid-snap-menu GM16, library-focus-handoff LF5/LF6, library-video-return-focus VR4, master-ui, meter-ui, mode-toggle-colour-ui DXT1–7, navigation-strings-ui NS1–4 | yes; `strings.test.ts` green |

Nothing turned out weaker than §4.1 expected.

## Code review (actual `code-reviewer` subagent, 7 files)
Method: the reviewer had no shell. It read `a-round-181/diff-vs-start.patch` and checked it line by line against the live files, and it also read the mutation and vitest artefacts. It did not run `git diff` itself.
Verdict: matches the spec, 0 Critical, 0 High, 0 Medium, score 9/10. The Lows are passed to B:
1. **Low:** the TS1 test title still says "gives all 12 transport buttons the 8 px radius", but Play is now `rounded-full`. The spec allowed rewording only the TS2 title, so A left TS1's alone. B decides.
2. **Low:** doc 149 points to this report for the mutation results. **Addressed:** this report now exists.
3. **Low (nit):** `byName('Play')` is looked up twice in TS1 (`roundPlay` and the existing `play`). It's harmless, and merging them would edit TS1 lines outside T1. Left for B.
4. **Planner suggestion (not a defect):** Play could get `aria-keyshortcuts="Space"`, like Zoom's `"Z"` / `"X"`. It's not in P3, so it's for B.

**Architecture note (verbatim):** "none. The diff adds no state, effect, ref, listener or coupling. The strings move into `studioPlaybackStrings`, which is that object's job. TS1/TS2 still repeat the fake AudioContext / ResizeObserver mount, but that is already in B's `b-round-180-checkpoint-request.md` (Q2 / ROOT-RECON-GRID-HARNESS), so it isn't a new signal here."

## B acceptance — what A truly passed
- §1 P1, P2, P3, S1: implemented as written (unit-level evidence: TS1, TS2, ST10).
- §2 S2, T1, T2, D1, D2, D3: done.
- §4: base 229/229 before and after; typecheck, lint and scoped Biome clean; mutations m299–m303 match; code-reviewer run.
- **Not claimed:** every §5 browser row (CC-M1, LAYOUT-M1, RV1-M1, CONTRAST-M1, FOCUS-M1, NO-BRASS-M1, BEHAVIOUR-M1, A11Y-M1, G181-3, PX-NET / REG-HYD). Those are C's. M1 is not done until C passes them.

## Known gaps / risks for C
- The layout numbers are B's simulation, not measured by A. The real rounded box and the neighbour shift (x −64) need C's measurements.
- BEHAVIOUR-M1, Space or Enter on a focused Play button: A did not touch the workspace Space handler. Whether a focused button toggles once or twice is the same as on HEAD. If it toggles twice, it is a pre-existing finding.
- The `title` makes the accessible description `Play (Space)`. The name stays `Play` / `Pause`.
- Chromium hit-tests the rounded corners, so a click in a box corner may miss the button (A11Y-M1 info row).

## Exact next C checks
1. T181-TARGETED: `npx vitest run $(cat a-round-181/vitest-files.txt)` → 229/229.
2. SCOPE-181: frozen 999 OK; `sha256sum -c a-round-181/end-sha256.txt`; `git status` = 6 ` M` + 1 `??`; empty protected diff against `59d4bab`.
3. AN-REVIEW-181 / MUT-181: read `diff-vs-start.patch` and `mutations/`.
4. Browser at 1440×900 and 1280×720 on http://127.0.0.1:5173/studio-lab: CC-M1 (32×32 at (12, 43), radius ≥ 16, corner pixels = surface, `innerText` ''), LAYOUT-M1 (against the §1 table), RV1-M1, CONTRAST-M1, FOCUS-M1 (45° ring pixel, ring-brand), NO-BRASS-M1, BEHAVIOUR-M1 (click, Space, focused Space / Enter once, real tap peak, Undo), A11Y-M1 (name `Play` / `Pause`, title `Play (Space)` / `Pause (Space)`), G181-3, PX-NET / REG-HYD.

## Scope completed
Round 181 A scope (P1–P3, S1, S2, T1, T2, D1–D3, §4 checks and mutations) is complete. The backlog is not marked complete, and M1 status is for B/C.
