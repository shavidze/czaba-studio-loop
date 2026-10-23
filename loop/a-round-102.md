# A round 102 — Export dialog focus guard measures the option card; progress text read once (+ doc 089 status)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-23 · Task: `current-task.md` (round 102, D-29z67)
Status: **implementation complete, waiting for C.** No commit/push. Nothing outside ownership touched.

## Start state (checked)
- HEAD `56231c030d0cf85c13b818b481eec2886ebf1a04`, `git status --short` empty, frozen list 533/533 OK, owned files = snapshots (`c2c32e1c` / `9997e4cb` / `dcf8d187`).

## Changed files (end sha256) — `git status --short` = 3 M + 1 ??
| File | sha256 | Change |
|---|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | `37be31c440fbc3bd5250766df292bfd4838dd61e7738c9b08e35fc7cd3985cb5` | T1 guard: `coveredBottom = max(target.bottom, closest('label').bottom if content.contains(label) else -Infinity)`; T2: one line `progressText` before `handleClose`; `<p>` gets `aria-hidden="true"` + `{progressText}`; `<progress aria-valuetext={progressText ?? undefined}>` |
| `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | `b231b9b5891f5b13616215f4ea68154643ee7e8b7c2b85b7b0c39fae856480ae` | append-only: FC1, FC2, FC3, **FC4** (extra, from code review), FA1. One hunk `@@ -491,0 +492,92 @@` |
| `docs/implementation/2026/quarter-IV/089-studio-export-footer-strip-valuetext.md` | `a8fcdc9242818fb8dfc8c80df63e72756d4d36aed4462366d793c6272d0701fe` | l.4 only: `**სტატუსი:** C PASS (Round 101), გამოქვეყნდა 56231c0 (D-29z66)` |
| `docs/implementation/2026/quarter-IV/090-studio-export-focus-card-progress-once.md` (new) | `53e116a2cfe101e6f28577977cda6c42770e1c1ec799903f719c754f3e3c6c91` | Georgian implementation doc, status "Round 102 — C-ის შემოწმებას ელოდება (D-29z67)" |

Dialog `git diff -U0` hunks: `@@ -233 +233,7` (guard body), `@@ -241,0 +248` (the single `progressText` line, directly before `const handleClose`), `@@ -505,2 +512,6` and `@@ -511 +522` (progress block). All are inside the allowed ranges.
End: frozen list 533/533 OK. Protected hashes unchanged (fa2cf0bc, 13914809, caa388e7, 0995ae78, 741c2341, ddb70919, 56f5b76f, bf9ee257, 23468664, 280fe7f2). CR=0 in the test file and doc 090. `a-round-102/end-hashes.txt`.

## Commands run and results
- `npm run typecheck` → exit 0 (`a-round-102/typecheck.log`).
- `npm run lint` → exit 0, 441 files, 218 warnings + 1 info repo-wide, no errors (`lint.log`). Scoped Biome on the 2 code files: `npx biome check <dialog> <test>` → exit 0, no diagnostics (`biome-check-owned.txt`). `biome format --stdin-file-path` diff vs file: identical for both. No `--write` used.
- Targeted vitest: the §1 grep gives 13 files (`targeted-list.txt`). `npx vitest run $(cat …)` → **13 files, 143/143 pass** (`targeted-vitest.log`); the footer file has 15 tests. (Before FC4 was added: 142/142.)
- Full suite / `npm run verify`: not run (speed rules; root gate).
- The added test lines contain no `as`, `as const` or `@ts-` (grep checked).

## Browser reproduction (A's own check, Chromium, copies of B probes in `a-round-102/`, server :5173)
| Case | before (`repro-before-focus.json`) | after (`repro-after-focus.json`) |
|---|---|---|
| 1280 done, Tab → scope-project | scrollTop **43** / max 137, footer top 520, radio −8.5, **card +8** (under the footer) | scrollTop **59** / max 137, radio −24.5, **card −8** (above the footer) |
| 1280 idle | 0, card −41 | 0, card −41 |
| 1440 idle / done | 0, card −86 / −86 | 0, card −86 / −86 |
| Tab order (idle & done) | დახურვა → WAV → Close(X) → format-wav → scope-project → დახურვა … | unchanged |
- AX (`repro-before-ax.json` → `repro-after-ax.json`, unmodified page = "baseline" key). Before: a `StaticText "რენდერი · 14%"` node, and the dialog text has `რენდერი · 14% რენდერი · 14%`. After: no StaticText hit, the dialog text has `რენდერი · 9%` **once**, and the bar is `ექსპორტის პროგრესი` with a valuetext.
- The valuetext property shows mojibake in CDP (INFO-B101-VALUETEXT-CDP), same as B's dump.
- Not measured by A: the card **top** vs the panel top after the scroll. That check is C's (CARD-1280).
- **Process note, honest:** I edited the dialog while the first "before" probe was still running against the HMR server. I stopped it, restored my own file from B's snapshot `c2c32e1c` and re-ran "before" on the baseline, then put the edit back (hash `37be31c4` = final).
  - The first "after" focus run was interrupted by a page reload ("Execution context was destroyed"), most likely Vite reacting to my test-file edit. Its log is kept as `run-focus-after-attempt1-reload.log`. The second run had no store edits during it and completed.
  - The dialog code did not change after these probes.

## Fail-before and mutations (scratch `a-round-102/mut/`, cacheDir in scratch; `mutations.log`, `mutation-results.json`)
| Run | Red tests | Passed |
|---|---|---|
| fail-before (snapshot `c2c32e1c` + extended test) | **FC1, FA1** | 13 (FC2, FC3, FC4 + 10 existing) |
| a: measure target only | FC1 | 14 |
| b: measure label only (`card ? card.bottom : 0`) | FT4 "scrolls the panel by overlap + margin", FC2, FC4 | 12 |
| c: drop `content.contains(card)` | **none**: not testable, no reachable DOM puts the label outside the panel; no test invented | 15 |
| d: remove `aria-hidden` | FA1 | 14 |
| e: second independent `formatArrangementExportProgress` call for valuetext | none (equivalence, refactor-only check for S2) | 15 |
| unmutated | none | 15 |

- This matches B's §1 expectation: FC1 + FA1 red, and FC2, FC3 and the 10 existing tests green.
- The only difference is FC4, an extra test added after the code review. It is green on the baseline, because the baseline already measured unlabeled controls correctly. Mutation b now turns FC4 red too.
- The earlier run (before FC4): `mutation-results-v1-before-review.json`. Same reds, minus FC4.

## Code-reviewer (actual `code-reviewer` subagent, score 8.5/10, no Critical/High/Medium)
| Finding | Disposition |
|---|---|
| Low: the no-label path (`card === null`) was never reached by a test (FC3's Close is inside the footer and returns early) | **Fixed**: added FC4 (Modal X, 12 px under the footer → scrollTop 20). Mutation b catches it. |
| Low: FC1 asserted `dialog.contains(card)` but the guard checks the panel | **Fixed**: now `panel.contains(card)`. |
| Low: a11y. On a screen reader that ignores `aria-valuetext` on native `<progress>` (historically VoiceOver/Safari), the phase text is now only in valuetext, and the MP3 load phase has no value | **Not changed (B decision, candidate a).** Passed to B/C: AX-ONCE is CDP evidence only, and a real screen reader sign-off stays a Tech Lead item (doc 090 TODO). |
| nit: FC1 asserted the same value twice | **Fixed**: kept `toBe(19)` only. |
| nit: FA1 overlaps FV1 except aria-hidden | Accepted (append-only file; FA1 is B's spec). |
| nit: doc 090 "mutation c" unclear | **Fixed**: the wording now names the `content.contains` mutation. |
| info: a card taller than the space between the panel top and the footer would push the control out at the top | Not reachable with `p-3` cards. C's CARD-1280 card-top check covers today's case. |

**Architecture note (verbatim):**
> This is signal 3 (an expensive region that keeps changing): the footer and focus-guard code was touched in docs 083, 089 and 090, and the dialog now has four focus-related effects (`ArrangementExportDialog.tsx:145-246`). Keep it as it is: it's one effect and one listener, bound to the dialog's own refs and lifecycle, and pulling it out would add `footerRef`/panel plumbing without making the tests cheaper (rects would still be mocked). If another round touches this region, here's a proposal for the planner (a proposal only, not approved scope): fold the four focus effects into one hook local to the dialog, with the existing FT/FC tests as the acceptance gate.

This is a proposal for B/root only. No refactor was done.

## B acceptance items A actually satisfied
- T1 implemented as specified (max of target and in-panel label, early returns kept, margin 8, no new state/ref/effect/listener/export).
- T2 implemented: one `progressText` line, `aria-hidden` on `<p>`, `aria-valuetext={progressText ?? undefined}`, aria-label/max/value/testid/className unchanged, no aria-live/role.
- Tests FC1–FC3, FA1 appended as specified (plus FC4). Fail-before and mutations a/b/d/e as expected; c reported as untestable.
- Docs: 089 l.4 only; new 090.
- The C rows (CARD-1280, AX-ONCE, etc.) are **not** claimed. A's browser runs are reproduction, not acceptance.

## Known gaps
- Mutation c (`content.contains`) is not covered by any test (unreachable DOM).
- A real screen reader check of `aria-valuetext` on `<progress>` (reviewer Low) is open for the Tech Lead.
- The card-top-after-scroll value was not measured by A.
- MP3-path AX sample not taken by A (B's probe only covers WAV).

## Exact next C checks
- **CARD-1280** (primary): 1280 done, Tab to scope-project → card bottom ≤ footer top (A saw −8), radio above the footer, `elementFromPoint` at card bottom−2 hits the card, **card top below the panel top**, scrollTop ≈ 59 ≤ 137, screenshot.
- **CARD-IDLE-REG**: 1280 idle, 1440 idle + done → scrollTop stays 0.
- **AX-ONCE**: WAV render + one MP3 sample (load or mp3 phase). Record INFO-B101-VALUETEXT-CDP under notes.
- **VALUETEXT-REG**, **FOCUS-REG**, **STRIP-REG**, **EXPORT-REG**, **PX-NET**, **REG-HYD**, **G102-3** (fake-Bearer sub-check BLOCKED: backend unavailable in cloud).
- **AN-REVIEW**:
  - re-run mutations a, b and d in C's own scratch. Expected reds: a → FC1; b → FT4 "scrolls the panel by overlap + margin", FC2, FC4; d → FA1.
  - note that FC4 is an extra test beyond B's list.
  - check the test hunk is the pure addition `@@ -491,0 +492,92 @@`.
- **T102-TARGETED**: 13 files, 143 tests.
- **SOURCE-UNCHANGED**: hashes above, 533/533.

## Report files
- `a-round-102-result.json` is harness-generated (session metadata), so A's machine-readable summary is `a-round-102/a-round-102-summary.json`. This markdown is the durable report.
- The `as`/`@ts-` grep over the added test lines matches only the English word "as" in FA1's title. There is no type assertion and no `@ts-` directive.
- No Playwright/Chromium processes were left running.
