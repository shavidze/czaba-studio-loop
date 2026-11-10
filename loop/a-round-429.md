# A round 429 — SYS-2 stage 5 (final): held-Enter fold + closing scan

No STOP. Sketch applied unchanged (the 5 sketch files were not edited after `git apply`); A wrote only the 4 docs. Reviewer: no Critical/High/Medium.

## Baseline
- HEAD at A1 = `7b66064` (not `b604cfb`): one root-only commit `docs(studio): visual and UX audit by product-designer (2026-11-10)`, `git diff b604cfb HEAD -- app` = 0 lines → accepted per task Baseline clause. Clean tree at start.
- A1 claims `a-round-429/claims-start.txt` rc 0, stderr empty (`claims-start.err` 0 bytes). Differs from `claims-429-planning-output.txt` only in K1 (HEAD sha above) and K13 INFO-C428-SPACE-ON-FOCUSED-BUTTON location `backlog:open_findings` → `archive` (allowed by location, D-29z1509). K3 1321 rc 0; K4 rc 0; K5 yes.

## Changed files (9 = 7 M + 2 ??)
- Sketch `b-round-428/sketch-429.patch.txt` sha256 `c75c618623938ab16162760a9f7719175a9f312b923904c76e16245424d9d429`, `git apply --check` + `git apply` rc 0, not edited afterwards:
  - M `app/components/arrangement/ArrangementMarkerRow.tsx`
  - M `app/components/arrangement/ArrangementLibraryMenu.tsx`
  - M `app/lib/arrangement/__tests__/markers-ui.test.tsx` (HK1–HK3)
  - M `app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx` (HK4)
  - ?? `app/lib/arrangement/__tests__/held-enter-source-scan.test.ts` (HS1, HS2)
- A (docs):
  - M `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md`, `275-…panels.md`, `276-…dialogs.md` — l.4 only → `**სტატუსი:** Completed (C round 429 PASS)` (`git diff` shows exactly 3 −/+ pairs).
  - ?? `docs/implementation/2026/quarter-IV/277-sys-held-enter-closing.md` — l.4 `Completed (C round 429 PASS)`; 7 TEMPLATE `## ` headings in order (diff vs TEMPLATE minus `## Prompt` empty); rulings 1–7; K8 HEAD inline-copy list; mutant block = `b-round-428/mutants/summary.txt` (`diff <(grep '^MU-' doc277) summary.txt` empty); browser table from `b-round-428/probe/compare.txt`; A-R107 closure table (stages 1–5: HE1–HE5, HM1–HM14, HP1–HP9, HQ1/HQ2/HN1/HX1–HX3, HK1–HK4/HS1/HS2 — each id grepped present in `app/**/__tests__`); TODO ARCH-CHECKPOINT-SYS-2 (opt-in vs wrapper/lint, TL-R429-06 literal-form limits, delegated menu form, SIG-R427-HELD-ENTER-TEST-HELPER). Primitive `GEORGIAN_DOCS.md` read.

## Checks (logs in `a-round-429/`)
| # | Check | Result |
|---|---|---|
| A2 | `npx vitest run $(cat b-round-428/covering-files.txt)` | rc 0, **47 files, 920/920** (`a2-vitest.log`) |
| A3 | `npm run typecheck` | rc 0 (`typecheck.log`) |
| A3 | `npm run lint` | rc 0, 205 warnings, 1 info — same as HEAD/B precheck (`lint.log`) |
| A4 | `npx biome check` on the 5 code/test files | rc 0, "Checked 5 files … No fixes applied." (`biome5.log`) |
| A5 | end claims `claims-end.txt` | rc 0, stderr empty. vs `claims-429-sketch-output.txt` differs only in K1 (HEAD `7b66064`, root docs commit — see Baseline; sketch output had a scratch sha), K2 `2 ?? 7 M total 9`, K6 (277 last; 274–277 l.4 `Completed (C round 429 PASS)`), K6b (274–276 gone), K13 location→archive. K5 `no`; K8 total 0; K8b MarkerRow 6 LibraryMenu 2 app-total 72 (= sketch); K2b 0; K3 1321 rc 0; K4 rc 0; K19 `L58 OK`. |

Timeout headroom (L11/L31): slowest covering tests CP12a 4.6 s / 30 s (15 %), TC10 3.7 s / 15 s (25 %); markers-ui file 5.7 s, studio-link 3.4 s, scan 0.13 s (per-test 15 s describe timeouts). Nothing above 50 %. Times are higher than B's precheck (CP12c 3.3 s) (runner variance; vitest ran alone, before typecheck/lint); not a STOP.

Not run by A (gate rows): full vitest, build, `npm run verify`. No browser run by A: per-press behaviour is unchanged and C row 4 owns the browser probe.

## Code review (A6, actual `code-reviewer` subagent, twice)
- **Review 1** (all 9 files; reviewer had Read/Grep only, so it could not see removed lines or `tmp/` evidence): no Critical/High/Medium. Score 8/10. Findings:
  - Low — scan false positive: the second regex branch also matches `!event.repeat && event.key === 'Enter'` (a fresh-Enter-only guard), so HS1 would wrongly go red on it; none exists today. In a sketch file → **not edited** (task: do not edit sketch files); recorded in doc 277 TODO and For B.
  - Low — row-id collisions (HE1, HK1–HK4, HS1/HS2, HP1, HM1… reused in other files with other meanings) → **fixed in doc 277**: closure table now has a test-file column plus a note.
  - Low — doc 277 ruling 2 presented K9 counts as menu containers; they are all `if (!event.repeat)` sites (verified by grep: GridMenu 60/191, MarkerMenu 115, DetailPanel 673/765/1243, Library 460/482, GroupHeader 224/264/300) → **fixed in doc 277** (only GridMenu/MarkerMenu named as menu containers; the rest described).
  - Low — repeated Escape in the name editor not pinned by a row (a `repeat`-only mutant would pass HK3) → test files are sketch-owned, **not edited**; recorded in doc 277 TODO and For B.
  - Low — l.4 "Completed (C round 429 PASS)" before C → required by L28/the task; no change.
  - Info — optional chaining not in HS2 → doc 277 ruling 4 now says the class allows `?` but HS2 has no `?.` case. Info — "64 uses" is a raw grep count → doc 277 now says so. Info — HK1/HK2/HK4 discriminate only via `defaultPrevented` (`toBe(false)`) lines; reviewer found nothing else in the bubble path preventing the repeat, so they fail without their guard; HK3 discriminates via editor-open/no-marker/no-undo.
  - Architecture note (Signal 3, `studio-repeat-safe.ts:3`): per-button opt-in policed by a regex scan; keep for now; propose for ARCH-CHECKPOINT-SYS-2 a Biome/AST lint rule vs the regex scan (covers TL-R429-06 limits and the false-positive branch).
- **Review 2** (diff-only, given the absolute patch path so it saw the removed lines): all 6 sites **identical** (none of the removed blocks called `stopPropagation`; control flow identical for repeated Enter, fresh Enter, repeated Escape and other keys). Only Low: double `preventDefault` at the editor (= TL-R429-01, known). Score 10/10.
- Doc 277 changed after review 1 (the fixes above, Mermaid labels quoted so `/]`, `===`, `&&` cannot break parsing, and ruling 2 later extended to describe all 11 `!event.repeat` sites after A inspected each, including Library 460 (ContextMenu/Shift+F10) and 482 (Enter)). A verified the reviewer's facts itself: node run of the scan regex gives 1 match for `!event.repeat && event.key === 'Enter'`, 0 for `event.key === 'Enter' && !event.repeat`, 1 for `event?.key === 'Enter' && event?.repeat`; every closure-table id was grepped as a row title in its named file (0 missing). Doc 277 was not re-reviewed after these doc-only edits. After the edits: mutant-block diff empty, heading diff empty, l.4 exact, end claims re-run (same result), status 9 lines. Code unchanged after both reviews.

## Process note (truthful)
- `lessons.md`: L11–L15, L26 and L28 (truncated) and `GEORGIAN_DOCS.md` were read before writing docs; the full L11/L28 text and L4, L23, L29, L31, L38, L47, L50, L56, L59, L60 were read after review 1 (no clause bars a doc-only fix after review; L11's re-review clause covers code, and code did not change). Pre-flight skill read late (after the apply): assumptions = verbatim sketch, behaviour-identical; smallest version = the sketch itself plus 4 docs; files = the 9 grants; success = A2–A6 as in the table. Pre-flight was not done before the apply.
- `lessons.md` and the rest: `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS` were read **after** `git apply` (verbatim apply, so no code decision depended on them). Note against `AGENT_DISCOVERABLE_CODE` rule 7 (test name = source name): `held-enter-source-scan.test.ts` has no same-named source — B's sketch naming, not changed.
- Build not run by A (speed rule: gate row). No browser run by A (per-press behaviour unchanged; C row 4 owns the probe on :5173; no server started or stopped).

## Scope completed (only what A actually passed)
- [x] A1 claims at start (K1 root-only drift accepted, K13 by location)
- [x] Sketch applied verbatim (sha256 `c75c6186…`)
- [x] Docs 274/275/276 l.4; doc 277 created
- [x] A2 47 files 920/920 rc 0
- [x] A3 typecheck rc 0; lint rc 0 (205 warnings, 1 info)
- [x] A4 Biome 5 files rc 0, no fixes
- [x] A5 end claims as expected (K1 = `7b66064` instead of `b604cfb`, see Baseline)
- [x] A6 code-reviewer: no Critical/High/Medium in sketch logic; doc findings fixed in docs only
- Not claimed: any C row; gate rows (full vitest, build, verify); SYS-2 / A-R107 closure (needs C PASS).

## Known gaps
- Scan false positive on `!event.repeat && event.key === 'Enter'` (Low, sketch test file; not in source today).
- Repeated Escape in the marker name editor has no dedicated row (Low).
- HS2 has no `?.` case (Info). TL-R429-06 literal-form limits stand (documented).
- Browser evidence for this tree is C's (A ran none).

## Exact next C checks
1. Row 1: `bash b-round-428/claims-429.sh`; expect `a-round-429/claims-end.txt` content, stderr empty. **K1 will show HEAD `7b66064`** (root docs commit after gate 428; `git diff b604cfb HEAD -- app` empty) and K13 INFO-C428-SPACE-ON-FOCUSED-BUTTON in `archive`. K19 `L58 OK`, K3 1321 rc 0, K4 rc 0, status = 7 M + 2 ??.
2. Order per L59: row 3 mutants (base = `git archive HEAD`, expect the 13 lines of `b-round-428/mutants/summary.txt`), then row 4 browser (`ALL OK (8 cells)` at 1440×900 and 1280×720 on :5173), row 5 auth, then row 2 (patch identity: `cmp` 5 files; 47 files 920/920), row 6 docs, row 7.
3. Row 6: `git diff HEAD` on 274–276 changes only l.4; doc 277 headings, `grep '^MU-'` == summary.txt, row ids exist in the named files (closure table now has a file column), `grep -rn 'In Progress (stage' docs/implementation` has no 274–276, `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 (A measured 0).
4. Optional: the reviewer's hypothesis (not run by A) that a mutant `if (event.repeat) return;` in the editor branch stays green under HK3, because no row pins repeated Escape.

## For B
- Architecture note (reviewer, Signal 3): keep per-button opt-in now; ARCH-CHECKPOINT-SYS-2 should weigh a Biome/AST lint rule vs the regex scan (covers TL-R429-06 and the `!event.repeat && key === 'Enter'` false-positive branch).
- New Lows for `deferred_low_polish` or the ARCH checkpoint: A-R429-REVIEW-SCAN-NEGATED-REPEAT (HS1 false positive on a negated repeat in the second branch; add HS2 negative case + `!` exclusion); A-R429-REVIEW-EDITOR-REPEAT-ESCAPE (pin repeated Escape settles in the name editor); A-R429-REVIEW-ROW-ID-COLLISIONS (HE/HK/HS/HP/HM ids reused across files with different meanings).
- Task text K9 "delegated menu form … appears in GridMenu 2 … GroupHeader 3" overstates: those are all `if (!event.repeat)` sites; only GridMenu and MarkerMenu are menu containers. Doc 277 corrected.
