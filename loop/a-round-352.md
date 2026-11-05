# A round 352 — PERF-CAND-VIDEO-TRIM-FADE-COST stage 1, fix-up 2 (DP72 release and Undo halves, C-R351-01)

**Status: implemented, no STOP.** Both B patches were applied unchanged. Every A row in §2.1 passed. Logs are in `a-round-352/`.

## Changed files (exactly 2 edited by A; the third `M` file, the dock, is untouched)
| File | Change |
|---|---|
| `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply b-round-351/sketch-dp72-release.patch.txt`. `cmp` against `b-round-351/drag-preview-render.test.sketch352.tsx` gives byte-equal. Diff vs r350: `a-round-352/test-vs-r350.diff.txt` |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply b-round-351/sketch-doc232.patch.txt`: l.4 reads `C round 352 pending` (D-29z1125), plus the changed-files line and the DP72 bullet; 7 `## ` headings |

`ArrangementVideoDock.tsx` and `ArrangementContext.tsx` were not edited (K3 is equal to the planning output). Protected files: 11/11 OK (K7).

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | equal to `claims-352-planning-output.txt` | `a-round-352/claims-pre.txt` |
| A-CLAIMS final | K1, K3, K7, K9, K10 and K11 equal planning. K2 = `7f56989 3`. K4, K5 and K6 equal the sketch output (the only sketch diff is K2, as expected). K8 = `diff-lines-outside-3 0 untracked 0` | `a-round-352/claims-final.txt`, `claims-final-vs-planning.diff`, `claims-final-vs-sketch.diff` |
| A-TYPE | `npm run typecheck`: rc 0 | `a-round-352/typecheck.log` |
| A-LINT | `npm run lint`: rc 0, 205 warnings (≤ 205), 1 info. Scoped `biome check` on the test file: rc 0 | `a-round-352/lint.log`, `biome-scoped.log` |
| A-UNIT | `npx vitest run …drag-preview-render.test.tsx`: 74/74, 10.26 s | `a-round-352/unit.log` |
| A-MUTANT | scratch `/home/runner/a352-scratch/sk` (rsync copy, `node_modules` symlinked; deleted afterwards), filter as in the code block below. Every red set equals §0.1 (table below) | `a-round-352/mutant-*.log` |
| A-REVIEW | `code-reviewer` (real subagent): 0 Critical/High/Medium, 3 new Lows (below), score 9/10, Architecture note "none" | this report |

Exact command run per mutant (plain `|`, not the table-escaped form):
```bash
cd /home/runner/a352-scratch/sk
patch -s <target> < <mutant-diff>   # target: dock for all, ArrangementContext.tsx for M-B6; originals restored between runs
npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx -t 'DP6[6-9]|DP7[0-2]' > a-round-352/mutant-<name>.log 2>&1
```

### Mutant red sets (vs §0.1)
| Run | Red | §0.1 | DP72 failing line |
|---|---|---|---|
| control | none (7/7) | none | — |
| M-B2 | DP66, DP67 | same | — |
| M-B2′ | DP66, DP67, DP71 | same | — |
| A-M5 | DP71 | same | — |
| M-B5 | DP72 | same | l.2291 preview `waitFor`: `expected 2 to be close to 1` |
| M-B1 | DP69, DP72 | same | l.2297 release length: `expected [ +0, 2, 1, 1 ] to have a length of 3 but got 4` |
| M-B6 | DP66–DP70, DP72 | same | l.2298 committed start: `expected +0 to be close to 1` |
| M-B7 | DP72 only | same | l.2300 Undo write: `expected 3 to be greater than 3` |

## Review findings (new; not ruled in §0.1; all Low, so not a STOP; not applied because §1.1 requires the file to stay byte-equal to the sketch)
- **A-R352-REVIEW-COMMIT-EXACT (Low), l.2298:** `toBeCloseTo(shownStart, 6)` is looser than the de-dupe key the l.2297 count already relies on. The reviewer suggests `toBe(shownStart)`, placed before l.2297, so that a commit mismatch is reported as a commit failure rather than as an extra seek write.
- **A-R352-REVIEW-DRAG-DISTANCE (Low), l.2288:** `toBeGreaterThan(imported.start)` checks the direction of the drag but not its distance against the 3-digit seek precision. Suggested guard: `> 0.01`. The current run moves the clip by about 1 s, so it is unaffected today.
- **A-R352-REVIEW-WINDOW-PRECONDITION (Low), doc-only candidate:** the no-write window relies on two harness conditions: the stubbed `requestAnimationFrame` (the playing path is never exercised) and jsdom `readyState` 0. The reviewer suggests noting this coverage limit in doc 232.
- Optional suggestion: a shared `importVideoClip(api)` helper for the DP64/DP72 setup duplication.

## Known gaps / notes for B and root
- The three Lows above go to B (`deferred_low_polish` or a later test-polish round).
- Doc 232 l.4 `C round 352 pending` deviates from L28 by D-29z1125. RC-R351-L28-PENDING-FORM is for RETRO 353.
- L11 timing: `unit.log` (default reporter) has no per-test times. The whole file took 7.73 s of test time for 74 tests, and B measured DP72 at about 0.53 s, so no test is plausibly above 50 % of its 5 s timeout. A did not measure this per test.
- No browser rows were run by A (none are A rows). The full suite, build and verify belong to the gate.

## Exact next C checks
1. CLAIMS: `bash b-round-351/claims-352.sh` equals `a-round-352/claims-final.txt`.
2. SOURCE-SCOPE: 3 `M` files and 0 untracked; dock sha256 `037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96`; context unchanged from HEAD; `cmp` of the test file against the sketch352 file.
3. READ, UNIT (74/74), and MUTANT (jsdom) on C's own scratch.
4. MUTANT (browser, M-B2′) on a scratch dev server with its own `cacheDir`. NAMES smoke on :5173. G352-AUTH at both viewports. DOCS.

## Scope completed
All §2.1 A rows passed: A-CLAIMS pre and final, A-TYPE, A-LINT, A-UNIT, A-MUTANT and A-REVIEW. The C rows and the gate rows are not claimed.
