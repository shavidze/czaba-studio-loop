# A round 413 — PERF-15b-ii-a (purchased peaks URL, streamed 4 MiB cap, abort listener)

No STOP. A1–A5 passed; C rows 1–10 are not claimed by A.

## 0. Pre-flight gate (recorded)
- Assumptions: apply sketch v4 byte-for-byte, no edits to its 9 files; A authors only doc 265 and l.4 of docs 263/264; demo runtime unchanged; purchased path unit-proved only.
- Smallest version: `git apply` + one Georgian doc + two one-line status edits; no new abstraction of A's.
- Files: exactly the 12 grants (9 = the sketch; 3 docs = §1 Docs ruling).
- Success: A1 equal to planning output; A2 rc 0 ×3; A3 436/436 with slowest < 50 %; A4 equal to sketch output on K7–K7d/K10b/K10c with the expected K1/K2/K6/K6b deltas; A5 no Medium+ in sketch logic.

## 1. Changed files (12 granted paths; `a-round-413/status-end.txt`)
| File | Change |
|---|---|
| `app/lib/arrangement/precomputed-peaks.ts` | sketch v4 (readCappedText, streamed cap, abort listener) |
| `app/lib/arrangement/collection.ts` | sketch v4 (peaksUrl snapshot, same-origin rule, `fetchPeaks: fetchAudio`) |
| `app/types/arrangement.ts` | sketch v4 (`fetchPeaks?`) |
| `app/types/audio.ts` | sketch v4 (`AudioStem.peaksUrl?`) |
| `app/contexts/ArrangementContext.tsx` | sketch v4, one hunk (`collection.fetchPeaks` third arg) |
| `app/lib/arrangement/__tests__/precomputed-peaks.test.ts` | sketch v4 (PP7d rewritten; PP7e, PP10, PP11, PP12, PP12b) |
| `app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx` | sketch v4 (PPC12) |
| `app/lib/arrangement/__tests__/collection.test.ts` | sketch v4 (PK1–PK4) |
| `app/data/__tests__/studio-lab-demo.test.ts` | sketch v4 (PS18) |
| `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md` | l.4 only → `**სტატუსი:** Completed (C round 413 PASS)` |
| `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md` | l.4 only → same string |
| `docs/implementation/2026/quarter-IV/265-perf-precomputed-peaks-purchased.md` | new (A-authored), Georgian |

- Sketch applied byte-for-byte: sha256 `a7913dec…2201` = `sketch-dispatched.sha256` = reviewed sha in `sketch-review.md`. `git apply --check` OK, applied; `git apply -R --check` OK; `git diff HEAD -- app` is text-identical to the patch body. The 9 code files were not edited afterwards.
- `git status --short --untracked-files=all`: 11 ` M` + 1 `??` (doc 265). `git diff --stat HEAD -- app/components app/routes`: empty. No protected file touched.

## 2. Checks actually run
| # | Check | Result | Log |
|---|---|---|---|
| A1 | `bash b-round-412/claims-413.sh` at start | equals `claims-413-planning-output.txt` (diff empty); stderr empty; HEAD `107eb2d` | `a-round-413/claims-start.txt`, `claims-planning-vs-start.diff` |
| A2 | `npm run typecheck` | rc 0 | `a-round-413/typecheck.log` |
| A2 | `npm run lint` | rc 0 (205 warnings / 1 info repo-wide, pre-existing; 0 lines name an owned file) | `a-round-413/lint.log` |
| A2 | `npx biome check` on the 9 code/test files | rc 0, "Checked 9 files … No fixes applied", 0 warnings | `a-round-413/biome.log` |
| A3 | `npx vitest run $(cat b-round-412/sketch-logs/covering.txt)` (24 files) | **24/24 files, 436/436 tests**, rc 0 | `a-round-413/covering.log`, `covering.json` |
| A3 | slowest test vs timeout | 1,710 ms / 15,000 ms (11 %; gate 412 verify.log: 1,911 ms = 13 %) — render-budget "does not re-render clips…". Detail-panel row 1,370 ms / 5,000 ms default (27 %; gate 412: 1,347 ms). All < 50 % | `a-round-413/slowest.txt` |
| A4 | claims at end vs `claims-413-sketch-output.txt` | differs only on K1 (real HEAD vs scratch base), K2 (`1 ?? 11 M total 12`), K6 (three Completed l.4 lines), K6b (`in-progress-stage-docs 7 pending-form 0`). K7–K7d, K10b (`json-override 0`), K10c equal. K3 1301 rc 0, K4 rc 0 / granted 0, K2b 0, K5 `no`; stderr empty | `a-round-413/claims-end.txt`, `claims-sketch-vs-end.diff` |
| doc | doc 265 headings | 7 TEMPLATE headings in order | — |
| doc | doc 265 `MU-413-` lines vs `b-round-412/mutants/summary.txt` | 15 lines, `diff` empty | — |
| doc | every row doc 265 cites exists (PP7d, PP7e, PP10, PP11, PP12, PP12b, PPC12, PK1–PK4, PS18) | all found in their files | — |
| doc | `grep -rn 'C round [0-9]* pending' docs/implementation` / `grep -rln 'In Progress (stage' … \| wc -l` | 0 / 7 | — |

Not run by A (speed rules): full suite, build, `npm run verify` (gate); mutants and browser rows (C). A did not use a browser this round (no browser row is A's).

## 3. Known gaps
- Purchased path is unit-proved only; the protected purchased route does not mount the adapter (SRW-21 `deferred_user`).
- Firefox decode-length probe (TLM-PERF15-FIREFOX) not runnable: Playwright Firefox not installed (ROOT-REQ-PLAYWRIGHT-FIREFOX).
- Handoff doc (`/home/runner/czaba-project/docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md`) is outside the store repo and outside A's grants; B already wrote the same-origin rule there (l.22, l.32). A did not edit it.

## 4. Reviewer (A5): `code-reviewer` subagent, actually run on the 9 files + doc 265
Verdict: **0 Critical, 0 High, 0 Medium**, score 8.5/10. The reviewer had no shell, so it read the working-tree files; it ran no tests.
| Id | Sev | Finding | A's handling |
|---|---|---|---|
| A-R413-REVIEW-L1 | Low | `readCappedText` returns partial text after an abort; only the caller's `signal.aborted` check makes it safe (`precomputed-peaks.ts` ~l.116–137) | Sketch logic, not edited (byte-for-byte rule). Covered today by PP7d/PP7e + MU-413-NO-CALLER-ABORT-CHECK. **For B** |
| A-R413-REVIEW-L2 | Low | No cap+1-byte streamed row: a limit like `> maxBytes + 1024` passes PP10/PP11 (PP10's `null` is also implied by invalid JSON; its `cancelled` assert is what matters) | Test gap in the sketch; not edited. **For B** (one row + mutant) |
| A-R413-REVIEW-L3 | Low | PK2's `Authorization` assert is set by the test's own stub, so it can't fail; the real proof is the identity (1 call, URL, `omit`, global fetch unused) | Doc 265 l.97 reworded to say exactly that. Test unchanged. **For B**: drop or reword that assert later |
| A-R413-REVIEW-L4 | Low | Same-origin check covers the first URL only; a same-origin 302 to another host is followed (`redirect: 'follow'`); Authorization stripping on cross-origin redirect is up to the browser. Audio path has the same exposure | **For B**: handoff-doc note or `redirect: 'error'` on the peaks request |
| A-R413-REVIEW-L5 | Low | Opaque origins (`data:`, `file:`, custom schemes) all give `"null"`, so `"null" === "null"` passes the same-origin check; no network/token leak | **For B**: reject origin `'null'` (one condition) |
| A-R413-REVIEW-L6 | Low | Doc 265 l.4 says Completed before the gate | Already ruled by L28 + task §1 Docs (byte-exact string). Not changed |
| Info | — | one chunk > 4 MiB is allocated before refusal (cap bounds what is kept); `releaseLock()` never needed; doc wording "decode-ილი byte-ები" | Doc 265 l.23 reworded to "stream-ის byte-ები (HTTP decompression-ის შემდეგ, `TextDecoder`-მდე)" |

Post-review edits: doc 265 only (l.23, l.97 wording, plus earlier title `-a` and A's numbers in ტესტირება). No code changed after the review. Headings still 7 in order; l.4 unchanged; `MU-413-` block unchanged.

Architecture note (reviewer, proposal only): **keep** `readCappedText` in `precomputed-peaks.ts` (single caller). If the audio body (`source-fetch.ts`, uncapped `arrayBuffer()`) ever needs a cap, extract it to `lib/arrangement/capped-body.ts` as one bounded task, with PP10–PP12b moving along.

## 5. Next C checks (exact)
Rows 1–10 of `current-task.md` §5 as written: row 3 mutants first (`/tmp/c413-scratch`, 15/15 RED), then rows 4–5 browser on :5173 (warm `/studio-lab` first), then 2, 6–10. A4 expectations above are the row 1 / row 10 baseline.

## 6. For B
- Reviewer Lows A-R413-REVIEW-L1…L5 (above): all are in sketch logic or sketch tests, so A did not edit them. Rule them (`deferred_low_polish` or a follow-up). L6 is already ruled by L28.
- Architecture note (above): keep; extract only if the audio body gets a cap.
- INFO-A413-PS18-DUPLICATE-ID: the row id `PS18` also exists, unchanged, in `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` l.687 ("the watchdog does nothing…"). The new PS18 is in `app/data/__tests__/studio-lab-demo.test.ts`. Mutant logs that name only "PS18" are ambiguous across files; the mutant runner scopes by covering file. Pre-existing, outside grants, so A did not change it.
- Row 7 self-check: `grep -nE 'console\.'` on `precomputed-peaks.ts` and `collection.ts` gives 0.

## 7. Scope completed
- §2 steps 1–4 done. A-owned acceptance: **A1 PASS, A2 PASS, A3 PASS (436/436), A4 PASS, A5 PASS (no Medium+)**.
- Not claimed: C rows 1–10 (mutants, browser, auth, docs/screen, Firefox, L57) and the gate rows. PERF-15 is not marked closed by A; per D-29z1435 it closes on C PASS.
