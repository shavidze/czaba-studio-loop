# A round 95 — C-R92-N1 demo loader error text in Georgian + doc status lines (D-29z60)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · Baseline HEAD `0513439` (clean at start, frozen 522/522 OK at start and end).
No commits, pushes, deploys, installs or server start/stop. No `--write` Biome was run on the repo (the test file was formatted stdin→stdout). Mutations and fail-before ran only in `a-round-95/mut/` (Vitest cacheDir in scratch).

## Changed files (end sha256; also in `a-round-95/end-hashes.txt`)
| File | State | sha256 |
|---|---|---|
| `app/data/studio-lab-demo.ts` | M (hunks only at l.106 and l.110, inside `loadDemoSource`) | `0d53059f4ec839fc9009805effb44d0f9165b7705b19a6141ffa69f2ad4efb28` |
| `app/data/__tests__/studio-lab-demo.test.ts` | ?? new (12 tests) | `23c16b5f21d0c0fbeeba8e4756c41b425c3fecc5e58f5505b8deae889621be71` |
| `docs/implementation/2026/quarter-IV/082-studio-workspace-collection-load-status.md` | M (l.4 only) | `4453975b607d25351f85dbb8be904fa60f62affff92e698911885d6ce066cb2a` |
| `docs/technical/arrangement-workspace.md` | M (l.44–45 + 1 appended bullet l.46) | `0ae11c8f60df4ab107fb0968703f8ad50e22aa2ccac4dcd065e0b470114465ea` |
| `docs/implementation/2026/quarter-IV/083-studio-lab-demo-loader-error-text.md` | ?? new | `923dc48b334645b46df744330276a7711f0eefe7820361ecb072f1403e80a907` |

`git status --short` = exactly 3 M + 2 ?? as specified.

## E1
`loadDemoSource` URL branch now mirrors `collection.ts` l.86–111: three try/catch blocks; `fetch`/`arrayBuffer` errors → `ფაილი ვერ ჩაიტვირთა (ქსელი)` unless `signal.aborted` (same object rethrown); decode → `ფაილი ვერ გაიშიფრა` (`await` inside `try`); `!ok` → `ფაილი ვერ ჩაიტვირთა (N)` unchanged. No import from `collection.ts`, no new export, synthetic path / URL table / `credentials:'omit'` / signal unchanged.

## Commands and results (store/)
- `npm run typecheck` → exit 0 (`a-round-95/typecheck.log`)
- `npm run lint` → exit 0, 437 files, 218 warnings + 1 info (same count as round 94; none in owned files; `npx biome lint` on both code files clean)
- `npx biome check app/data/studio-lab-demo.ts app/data/__tests__/studio-lab-demo.test.ts` → exit 0 (`biome-check-owned.txt`)
- `npx vitest run $(cat a-round-95/targeted-list.txt)` → 4 files / **42 tests passed** (studio-lab-demo 12, collection 14, collection-load-status 10, purchased-collection-ui 6) (`targeted-vitest.log`)
- Not run (gate's): full vitest, build, `npm run verify`, `test:e2e:smoke`. No browser run by A (C owns §3).

## Fail-before (baseline snapshot `69ac90f7` in scratch; `a-round-95/fail-before.txt`)
Red: **DL1, DL2, DL3, DL8** (= B's prediction) **+ "DL5 decode failure after abort"** (a test added after the code review; the baseline code passed the raw DOMException through). Green on both: DL4, DL5 aborted fetch, DL5 aborted body read, DL5 raw TypeError after abort, DL6 ×2, DL7. 5 red / 7 green.

## Mutations (scratch, `run-mutations.py`, `mutation-results.json`; run against the 4 targeted files)
| Mut | Change | Red tests |
|---|---|---|
| a | remove fetch try/catch | DL1, DL8 |
| b | drop `signal.aborted` rethrow in the fetch catch | DL5 aborted fetch, DL5 raw TypeError after abort |
| c | remove decode try/catch | DL3, DL5 decode after abort, DL8 |
| d | remove arrayBuffer try/catch | DL2 |
| e | remove `credentials:'omit'` | DL6 ×2 |
| f | network text `(ქსელი)`→`(ქსელ)` | DL1, DL8 |
| g (extra) | pass `new AbortController().signal` instead of the caller's signal | DL6 ×2 |
| h (extra) | drop the abort rethrow in the body catch | DL5 aborted body read |
| control | unmutated | 0 failed / 42 passed |

## code-reviewer (actual subagent, score 8/10, no Critical/High)
- **Medium — DL6 `toStrictEqual` cannot detect a different signal.** Accepted and proven: in scratch, with mutation g and no extra assertion, all 12 tests stayed green. Fix: added `expect(init?.signal).toBe(controller.signal)` (the `toStrictEqual` is kept). Mutation g now turns DL6 red.
- **Low — no test for a non-abort error while aborted.** Added "DL5 any fetch error after abort is rethrown unchanged, not mapped" (it asserts `rejects.toBe(sameError)`; the title avoids the word " as " so the AN-REVIEW grep for `as` finds 0 hits).
- **Low — decode failure while aborted not pinned.** Added "DL5 decode failure after abort still maps to the Georgian decode text" (parity with purchased).
- **Nit — the workspace doc overstated the abort rule.** Reworded l.46 to say the rethrow covers fetch/body only. Doc 083 now states that decode errors are always mapped.
- **Nit — DL1 repeats the `instanceof` check.** Not changed; harmless.
- **Nit — GATE95-DUP-ERROR-MAP is recorded twice in 083.** Not changed; intended.
- Reviewer limitation (its own words): it had no shell to run `git diff`. My `git diff -U0` shows the hunks only at l.106 and l.110 of `studio-lab-demo.ts`.

**Architecture note (verbatim, for B):**
> The only signal is that the error mapping is duplicated in `app/data/studio-lab-demo.ts:106-131` and `app/lib/arrangement/collection.ts:86-111` (GATE95-DUP-ERROR-MAP). Keep it this round: `collection.ts` is frozen, DL8 enforces parity, and the copy is small and has no state or lifecycle. Proposal for the planner: once `collection.ts` comes back into ownership, create one small task that extracts a shared helper (for example `loadAudioWithMappedErrors(fetcher, url, ctx, signal)`) for both adapters, with DL8 and the `collection.test.ts` cases kept as the regression gate.

## Deviations from the B task (for B/C)
- The test file has 12 tests, not B's 10: two extra DL5 cases from the review. Because of them the fail-before list has 5 red tests, B's 4 plus "DL5 decode after abort". The extra red is explained above.
- Extra mutations g and h, beyond B's a–f.

## B acceptance passed by A (unit/static only)
E1 implemented as specified; DL1–DL8 present with exact `toBe`/`toStrictEqual` and no `as`; fail-before contains B's expected red set; mutations a–f red as named; typecheck/lint/scoped Biome/targeted vitest green; end state 3 M + 2 ??, frozen 522/522. **Not claimed:** any browser row (ERR-*, DEMO-LOAD-REG, AUDIO-REG, PX-NET, REG-HYD, G95-3) — C must run them.

## Known gaps
- Browser behaviour not verified by A.
- The texts are duplicated with `collection.ts` (GATE95-DUP-ERROR-MAP, nit).
- ERR-ADD-REFUSED behaviour is untouched and unobserved by A.

## Exact next C checks
Run §3 of current-task.md at 1280×720 and 1440×900:
- **ERR-NET:** abort `**/middle-east.mp3` → the row shows `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`, no `Failed to fetch`, status `failed(1)`, 8 other durations.
- **ERR-DECODE:** a 200 `not audio` body → `შეცდომა: ფაილი ვერ გაიშიფრა`.
- **ERR-HTTP:** 404 → `(404)`.
- **ERR-BOTH:** → `failed(2)`.
- **ERR-ADD-REFUSED.**
- **DEMO-LOAD-REG:** each demo URL is requested once.
- **AUDIO-REG:** a 48 kHz/2ch WAV with RMS > 0.
- **PX-NET, REG-HYD, G95-3:** fake-Bearer BLOCKED.
- **AN-REVIEW:** re-run mutations a, b, f via the `a-round-95/run-mutations.py a b f` pattern in C's own scratch. Note the 12-test and 5-red deviation.
- **T95-TARGETED:** 4 files / 42 tests.
- **SOURCE-UNCHANGED:** against the end hashes above.
