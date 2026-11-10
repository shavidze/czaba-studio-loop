# Round 439: SYS-R435-SOURCE-SCAN-HELPER re-do (v4.1): fix C-R438-01 (NF2 wrapper-tag narrowing) and the string-markup narrowing, then the full round-438 acceptance (test-only)

**Planned by:** B, at the round 438 → 439 planning, 2026-11-10 (`b-round-438.md`).
- The advisor was consulted after orientation and before hand-off.
- The round-438 task is archived as `tasks/round-438.md` (byte-identical, [K12]).
- **Test-only round.** No file outside `app/lib/arrangement/__tests__/` changes, except doc 285.
- Reference-first and the `product-designer` consult do not apply (policy: refactor and test-only rounds).
- **Baseline:** gate 438 was `skipped` (C FAIL), so the baseline HEAD stays `142918b` [K1]. The store tree is **not clean**: it holds A's round-438 work (the v3 sketch, 8 test paths, plus doc 285), which this round builds on. Do not revert it.

## Decisions (`backlog.json` v424 → v425, `decisions_log_b`) [K15]
- **D-29z1560:** round 438 is **not accepted** (`c-round-438.json` FAIL, `browserVerified` true) [K16].
  - **C-R438-01-NF2-WRAPPER-TAG-NARROWING** (Medium, origin B spec) is open and is this round's first target. A found it with the code-reviewer and stopped (L11); C reproduced it independently (M17: HEAD rc 1, v3 rc 0; `c-round-438/m17-*.log`).
  - SYS-R435 stays `in_progress`; none of its closes take effect until C passes this round.
  - C's round-438 browser rows (auth, play, export) passed on the v3 tree. They are evidence only; this round repeats them on v4.1.
- **D-29z1561: ruling = A's option (2), a v4.1 sketch**, not "accept the narrowing". Accepting it would lose a HEAD assertion on a Medium that came from B's spec.
  - Reviewed by tech-lead twice (`b-round-438/tech-lead-review-v4.md`, `tech-lead-review-v41.md`; dispositions in `b-round-438/sketch-review.md`).
  - A's reviewer Lows: **A-R438-REVIEW-L1-PG2-STRING-MARKUP is fixed in v4.1** (M19, and the same class for inputs: M20, M21b, M22). **-L2-DS4-SF2-TEXT-CONTAINMENT** (equal to HEAD) and **-L3-PARSE-DIAGNOSTICS** (typecheck covers it) are deferred Lows.
  - A's Architecture note ("which element counts as a number/radio/search field lives in each suite's filter") is recorded on SIG-R438-OTHER-SCANNERS as `confirmedBy`. It is a signal, not a scheduled task.
- **D-29z1562:** this dispatch; the order after it is unchanged. RETRO-450 input: B's round-438 mutant matrix tested only where HEAD was wrong, never what HEAD caught that the port drops (`retro_candidates` B-R438-REVERSE-DIRECTION-MATRIX). `lessons.md` is not edited now.

## Read first
- `lessons.md` (60 lines). Apply especially: **L4** (no assertion lost), **L11** (STOP on an unruled reviewer Medium+), **L23** (every red-proof is a named mutant), **L29** (tagged claims), **L31** (timeout headroom: under full-suite load the slowest covering file takes 663 ms in total, at most 14 % of the 5 s default; `b-round-438/l31-headroom.txt`), **L38** (never run vitest while a browser probe runs), **L56–L58** (cited artifacts exist; numbers are saved output on B's sketch), **L57** (C's JSON), **L59/L60** (run every row to a result; mutants only in scratch copies, never in `store/`).

## 0. Why this round
- C's round-438 Medium came from B's spec. The bug gate (2026-10-23) fixes Medium before new scope [K14].
- No Critical or High finding is open. The other loop-fixable Mediums (STUDIO-VIS-5, SABA-B-12 stage 4) are parked by Saba's "defer" in REVIEW-RECOMMENDATIONS (D-29z1512) [K14].
- REGRESSION is not due until 2026-11-13 [K8]. Next RETRO: round 450.
- The helper must land before ARCH-SPLIT (L8): five of the six old scanners read only the top level of `app/components/arrangement`.

## 1. What v4.1 changes against the v3 tree (5 files; B's scratch evidence in `b-round-438/`)
1. `helpers/source-scan.ts`:
   - `JsxOpeningTag` gains `name` (the tag name text: `input`, `Input`, `ui.Field`).
   - New `allJsxOpeningTags(source, path)` and `scanAllJsxOpeningTags(files)`: every JSX opening and self-closing tag, whatever its name.
   - `jsxOpeningTags(source, name, path)` becomes a filter over `allJsxOpeningTags` (tech-lead v4 L3: one visitor, no drift).
2. `source-scan.test.ts`: new **SS9** (the any-tag query reads `Input`, `input`, `ui.Field`, `span`, with their `type` literals; `jsxOpeningTags(…, 'input')` does not see `Input`).
3. `studio-number-field.test.ts` (**NF2**):
   - number fields are selected by `type === 'number'` on **any** tag (`scanAllJsxOpeningTags`);
   - the list of non-`input` number tags is pinned to `[]`, with the message "a wrapper component must be an `<input>` with the shared class, or be pinned here";
   - a per-file raw-text guard: the count of `/(?<![\w-])type=["'`{]+number["'`}]+/g` in each arrangement `.ts`/`.tsx` equals that file's number-tag count. Markup in strings or comments, or a wrapper with a computed `type` (`{'number' as const}`), is red, as at HEAD. The lookbehind keeps `data-input-type="number"` (M1) green.
   - Everything else in NF2 (owner pin, 3 tags, carrier, `inputClass` checks, hazards) is unchanged.
4. `studio-progress.test.ts` (**PG2**): a per-file raw-text guard: the count of `/<progress\b/g` equals the JSX progress-tag count (closes A-R438-REVIEW-L1).
5. `studio-radio.test.ts` (**IN1**): the same guard for `/<input\b/g` against JSX `input` tags. It closes the string-markup class for radio and search fields too (M20, M21b).

**Mutant matrix** (`b-round-438/mutants/head.jsonl`, `v3.jsonl`, `sketch.jsonl`, `helper.jsonl`; scripts `mutate.py`, `helper-mutants.py` in the same folder) [K18]:

| Id | Mutant | HEAD | v3 (round 438) | v4.1 |
|---|---|---|---|---|
| M1–M16 | as in round 438 (`tasks/round-438.md` §2) | unchanged | unchanged | equal to v3, line for line |
| M17 | `<Input type="number" />` in a new file | red NF2 | **green (C-R438-01)** | red NF2 |
| M18 | the same wrapper inside `ArrangementDetailPanel.tsx` | green (HEAD false pass) | green | red NF2 |
| M19 | `'<progress max="1"></progress>'` in a string | red PG2 | green | red PG2 |
| M20 | `'<input type="radio" name="f" />'` in a string | red RD2 | green | red IN1 |
| M21 / M21b | `'<input type="search" />'` in a string; M21 runs SF2, M21b runs the radio suite | M21 red SF2; M21b green | green; green | M21 green; **M21b red IN1** |
| M22 | `'<input type="number" />'` in a string | red NF2 | green | red NF2 |
| M23 | `<Input type={'number' as const} />` in a new file | red NF2 | green | red NF2 |
| M24 | the existing `<progress … />` written as a paired tag that keeps the class | red PG2 (HEAD scanner limit) | green | green (ruling (i)) |
| M25 | the same paired tag without the class | red PG2 | red PG2 | red PG2 |
| H1–H9 | as in round 438 | — | — | as round 438, except H5, which also turns the new SS9 red (SF1, SS3, SS9); H7 is re-anchored to the new filter |
| H10 | the any-tag query keeps only `input` | — | — | red DS4, PG2, SS2, SS9 |

- **Red at HEAD, green on v4.1 in the same suite:** M1, M2, M4, M5, M12, M21 and M24.
  - M1, M4, M5 and M12 are HEAD's false reds, accepted in round 438.
  - M2 is replaced by v4.1's stricter per-tag carrier.
  - M21 is caught by IN1 in the radio suite (M21b red), so the covering set stays red.
  - M24 falls under ruling (i).
- **HEAD assertion map:** `b-round-438/head-assertion-map.md` maps every HEAD `expect(` in the six tests to its v4.1 counterpart or to a named ruling. Three HEAD checks only measured the old scanner's coverage, had no runtime meaning, and are deliberately not ported:
  - **ruling (h):** DS4's `<Modal` text inside strings and comments. A component cannot render from a string.
  - **ruling (i):** PG2's "every `<progress` is self-closing" and "no `</progress>`". The parser reads paired tags, and the class, hazard and count rules apply to them (M25 stays red).
  - **ruling (j):** HEAD's file lists also read top-level `*.test.tsx` (SF2, DS4) and `*.spec.tsx` (NF2, RD2, PG2). The helper skips test and spec files, which are never rendered in the Studio UI; none exists today.
  Doc 285 states all three.

## 2. What A does
**Precondition (STOP if it fails):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-438/claims-439.sh | grep -E '^K(2|5|6) '`. Expect `K2 … outside-grants 0`, `K5 tree-equals-v3 8/8`, `K6 delta-applies yes`.

1. **Apply the delta.** `git apply --check -p1 ../tmp/studio-real-loop/b-round-438/sketch-439-delta.patch.txt`, then `git apply -p1` the same file (sha256 in `b-round-438/sketch-439.sha256`). Do not hand-edit it. A code-reviewer request is applied only if `b-round-438/sketch-review.md` already rules on it; any other Medium+ is a STOP (L11).
2. **Doc 285** (`docs/implementation/2026/quarter-IV/285-sys-r435-source-scan-helper.md`): apply edits E1–E8 from `b-round-438/doc285-edits.md`.
   - Fenced text is verbatim; text outside the fences only says where it goes.
   - The edits cover: line 4 (`**სტატუსი:** Completed (C round 439 PASS)`), rulings (h), (i) and (j), the closes table, the "NF1, RD1, PG1 …" line, the testing numbers, TODO, the changed-files bullets and the diagram.
   - B applied E1–E8 to A's current doc by script. The result is `b-round-438/doc285-expected.md` (sha256 `3989aec1…`; script `b-round-438/apply-doc285-edits.py`). **A's doc must be byte-identical to it** (`cmp`).
   - Self-check: `grep -nE 'SS1–SS8|23/23|round 438|a-round-438|b-round-437/mutants'` on the doc prints nothing.

### A's checks (the full suite and verify are gate rows)
| # | Check | PASS means |
|---|---|---|
| A1 | From `store/`, `cmp` each path in `b-round-438/sketch-paths.txt` with `../tmp/studio-real-loop/b-round-438/sketch-files/<path>`; `cmp` doc 285 with `../tmp/studio-real-loop/b-round-438/doc285-expected.md` | 8/8 identical; doc identical |
| A2 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-438/covering-files.txt)` | rc 0, **7 files, 24/24** (`b-round-438/covering-sketch.log`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each; lint **205 warnings** (= HEAD; `b-round-438/lint-sketch.log`) |
| A4 | `bash ../tmp/studio-real-loop/b-round-438/claims-439.sh` | Differs from `b-round-438/claims-439-planning-output.txt` exactly as `b-round-438/claims-439-expected-after-A.diff.txt` (B simulated the apply and E1/E4 on a scratch copy), that is only in K5 (`tree-equals-v3 3/8 tree-equals-v4 8/8`), K6 (`delta-applies no`), K7 (line 4 becomes the E1 text; `no-assertion-lost 0`) K9 (all four markers `1`) and K21 (`identical stale-grep 0`). K2 stays `total 9 outside-grants 0` |

- **code-reviewer: required** (6 changed files incl. the doc). Pass its Architecture note to B.
- Write `a-round-439.md` as you go; logs in `a-round-439/`.

## 3. Grants (`b-round-438/grants-439.txt`, 9 paths)
The 8 test paths plus doc 285, the same as round 438. Nothing else in `store/` may change. Frozen files: `b-round-437/r438-frozen-sha256.txt` (1340 entries; HEAD is unchanged) [K3]. Protected files: `b-round-318/protected-sha256.txt`, 0 granted [K4].

## 4. C's acceptance
**Order:** C1, then the browser rows C7–C8 (warm up first), then the rest. Write `c-round-439.md`, `c-round-439.json` and `c-round-439/progress.json` as you go. Never run vitest during a browser row (L38). Run every row to a result; round 438 left C5's HEAD half, the helper mutants, C6 and C10 partly unrun.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the frozen and protected manifests | Only the 9 granted paths changed; both manifests rc 0 |
| C2 | **PATCH-IDENTITY** | (a) `git archive HEAD` into a scratch, `git apply -p1 b-round-438/sketch-439.patch.txt`, `cmp` the 8 paths with the working tree. (b) A scratch with `b-round-437/sketch-files/` over HEAD, `git apply -p1 b-round-438/sketch-439-delta.patch.txt`, `cmp` again | (a) and (b) both 8/8 identical; doc 285 is the only extra path |
| C3 | **NO-RUNTIME-CHANGE** | `git status --short` | Every changed path is under `app/lib/arrangement/__tests__/`, or is doc 285 |
| C4 | **COVERING** | A2 on the working tree | 7 files, 24/24, rc 0 |
| C5 | **MUTANTS (all three runs)** | Scratch trees with a `node_modules` symlink: old = `git archive HEAD`; new = old plus the 8 working-tree test paths. `python3 -I b-round-438/mutants/mutate.py <old>`, `… <new>`, `python3 -I b-round-438/mutants/helper-mutants.py <new>` | Each line equals `head.jsonl`, `sketch.jsonl`, `helper.jsonl` in `id`, `rc` and `fails`/`red`. In particular M17, M18, M22, M23 red NF2; M19 and M25 red PG2; M20 and M21b red IN1; M24 green |
| C6 | **SWEEP** | `grep -c readdirSync` over the six ported files; claims K9 and K10 | 0 hits; K9 all 1; K10 `0` (no wrapper with `type=number` today). NF2's own owner pin is the authoritative inventory |
| C7 | **G439-AUTH (browser)** | Warm-up: one untimed load of `/studio-lab`. Then a fresh anonymous context: `/studio-lab`, `/studio/middle-east`, `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization | `auth_user` null on `/studio-lab`; "Sign in required" with 0 `audio[src]`; token API 401. Fake bearer: BLOCKED (backend unavailable in cloud) |
| C8 | **SMOKE + REAL EXPORT (browser), both viewports** | `cd c-round-439 && node ../b-round-437/probe/play-status.mjs > play-status.json`; then from the loop root `node b-round-436/probe/press-export-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-439/>`. One retry is allowed after a cold-start timeout; record both attempts | Play: "Loading …", then "… is ready."; the second press plays and the clock advances. Export: `czaba-studio-lab.wav`, 29189420 bytes, `RIFF`…`WAVE`, button back to "Export WAV" at opacity 1 |
| C9 | **CLAIMS** | `bash b-round-438/claims-439.sh`, compared with `b-round-438/claims-439-planning-output.txt` | Allowed differences: K5, K6, K7, K9 and K21 as in A4 (`b-round-438/claims-439-expected-after-A.diff.txt`). Anything else is a finding |
| C10 | **DOC** | Doc 285: `cmp` with `b-round-438/doc285-expected.md`; TEMPLATE headings; the E8 self-check grep; the cited ids; spot-check the map's rows against `git show HEAD:` | Identical to the expected file; TEMPLATE headings in order (L26); line 4 exact (L28); the grep prints nothing; every cited test id exists (SS1–SS9, NF2, RD2, IN1, PG2, SF1, SF2, DS4, HS1, HS2, F10); at least 3 map rows match HEAD (row ids in the report) |
| C11 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-439.json c-round-439/l57-check.txt` | As C1; rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List under `"gate"`. B's run on v4.1: 273 files, 4029 tests, rc 0 (`b-round-438/full-suite-sketch.log`) [K19] |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-438/mutants/sketch.jsonl` and `helper.jsonl`. Every bug has an enum `origin`.
- **Ableton conformance:** does not apply (test-only).
- **Neighbouring behaviour that could break:** a JSDoc or comment that mentions `<progress`, `<input` or `type="number"` in an arrangement source now turns PG2/IN1/NF2 red (HEAD did the same for top-level `.tsx`; the message names the reason). Other suites with their own scanners (SIG-R438-OTHER-SCANNERS) are untouched. SS6 temp-dir cleanup.

## 5. Claims (`b-round-438/claims-439.sh`; B's run `b-round-438/claims-439-planning-output.txt`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 438 |
| K2 | Tree status: total, outside-grants |
| K3 | Frozen manifest |
| K4 | Protected manifest; granted protected files |
| K5 | The 8 test paths equal v3 / v4.1 |
| K6 | The delta applies to the tree |
| K7 | Doc 285: present, line 4, the old "no assertion lost" sentence, last doc |
| K8 | `regression-last.json` |
| K9 | v4.1 markers: any-tag query, NF2 uses it, PG2 raw guard, SS9 |
| K10 | Wrapper tags with `type=number` in the arrangement sources today |
| K11 | Cited artifacts exist |
| K12 | Archive of round 438 |
| K13 | Backlog ids |
| K14 | Open Critical/High/Medium ids |
| K15 | Backlog version and last D-ID |
| K16 | C round 438 result |
| K17 | sketch-review names both shas; `l58-check` |
| K18 | Mutant result files |
| K19 | B's full run on v4.1 |
| K20 | `lessons.md` line count |
| K21 | Doc 285 against `doc285-expected.md`; stale-text grep count |
