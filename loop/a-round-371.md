# A round 371 — PERF-11c-i (group header leaf) + playback-store hook error text

**No STOP.** An earlier draft of this report raised an L11 STOP (tests above 50 % of their timeout). That was wrong. A had read only `vitest.config.ts`, where no `testTimeout` is set, so the default is 5000 ms. Every slow test, however, sits in a `describe(..., { timeout: 20_000 }, ...)`:
- `track-group-collapse-ui.test.tsx` l.478;
- `track-group-mix-ui.test.tsx` l.381 and l.767;
- `track-groups-ui.test.tsx` l.420;
- `mixer-onstate-colour-ui.test.tsx` l.344.

No `vitest.workspace*` or npm-script flag changes this. The `test:run` script is `vitest run`.

The slowest covering test in A's 19-file run is UC5 at 3573 ms, which is 18 % of 20000 ms. No covering test is above 50 % of its declared timeout.

Timings, for the record (ms; declared timeout 20000):

| Test | A, 19-file run | A, 4 files alone (tree) | HEAD copy, same 4 files, same runner | gate 370 verify.log |
|---|---|---|---|---|
| UC1 | 3169 | 3192 | 3165 | 2016 |
| UC5 | 3573 | 2136 | 2399 | 2509 |
| UM1 | 3376 | 3500 | 3690 | 2295 |
| UM3 | 3553 | 3061 | 2974 | 2516 |
| UM4 | 3149 | 2871 | 2481 | 2318 |
| UM9 | 3273 | 1795 | 1778 | 2299 |
| UM11 | 3052 | 1507 | 1549 | 1755 |
| TG1 | 3099 | 3284 | 3195 | 2159 |
| TG5 | 2562 | 1580 | 1755 | 1843 |
| DXM3 | 3525 | 3247 | 3397 | 2368 |

The sketch adds no measurable time against a HEAD copy (`git archive HEAD`) on the same runner. Logs: `a-round-371/vitest-covering.log`, `vitest-slow4-tree.log`, `vitest-slow4-head.log`. The scratch HEAD copy was removed after the run; the logs are kept.

The round is ready for C.

## Changed files (`git status --short --untracked-files=all`: exactly these 6)
- M `app/components/arrangement/ArrangementGroupHeader.tsx`
- M `app/components/arrangement/StudioWorkspace.tsx`
- M `app/contexts/ArrangementContext.tsx`
- M `app/lib/arrangement/__tests__/context-hygiene.test.tsx`
- M `app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx`
- ?? `docs/implementation/2026/quarter-IV/238-perf-group-header-leaf.md` (new)

The five code/test files are B's sketch applied with `patch -p1` after `sha256sum` of `sketch.patch.txt` = `e82ad292…51bb` (= `sketch-dispatched.sha256`). No other edit. `sha256sum -c b-round-370/sketch-files-sha256.txt` → 5 OK, rc 0 (SKETCH-EQUAL). No `.orig`/`.rej`. The HEAD copy for the timing comparison was a scratch outside `store/` and has been removed.

## Checks actually run (logs in `a-round-371/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0, the repo's 205 existing warnings (`lint.log`) |
| `npx biome check` on the 5 code/test files | rc 0, no fixes (`biome.log`) |
| `npx vitest run` on the 19 covering files from §2 | 19 files, 366 tests pass (`vitest-covering.log`); max 3573 ms against a 20000 ms declared timeout |
| `selection-wrappers-render.test.tsx --sequence.shuffle --sequence.seed=42` | 1 file, 7 tests pass (`vitest-shuffle.log`) |
| GH1–GH5, L8c, L8d present | yes: `selection-wrappers-render.test.tsx` l.370/386/408/428/450; `context-hygiene.test.tsx` L8c/L8d |
| Doc 238 | l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 3; C round 371 PASS)`; the 7 TEMPLATE headings in order; names only GH1–GH5, L8c, L8d; `grep -rn 'C round [0-9]* pending' docs/implementation` → 0 |
| Browser (Playwright, existing :5173 dev server, A's tree): B's `group-probe.mjs` copied to `a-round-371/` | Cold first run: 1440 timed out waiting for the scroller (Vite re-optimising after the edit, L38), and 1280 ran OK (`group-tree-cold.json`). Warm re-run: both viewports match every behaviour field of `b-round-370/probe/group-head.json` (solo off→on→off, member solo `mixed`→off, mute true→Undo false, volume 0→−0.1→Undo 0, rename "Drums" with focus back on the name button, folded `aria-expanded=false`, outside mute pressed). `rendersOnOutsideMute` at both viewports: header **0**, wrapper **0**, workspace 1 (HEAD: 1/1/1). Screenshots `group-tree-1440.png`, `group-tree-1280.png`. This is A's evidence only; C's browser rows are still to run |
| Perf specs | not run (the task assigns them to B and C) |
| Full suite / verify / build | not run (gate) |

## Code-reviewer (one run on the final code; doc 238 was written during the run and the reviewer read it; no code changed after it)
Score 9/10. No Critical/High/Medium. Comparator completeness, the actions dependency list (1:1 with the 9 Pick keys), soloState equivalence and the hook rules all checked. Lows, **not applied** because SKETCH-EQUAL forbids any edit to the five files. Handed to B:
- **A-R371-REVIEW-TODO-COMMENT** (Low): `ArrangementGroupHeader.tsx:99`. The TODO is explanatory and asks for no action. The task item 1 mandates it.
- **A-R371-REVIEW-SOLO-FALLBACK** (Low): the `?? 'off'` fallback in `StudioWorkspace.tsx` (~l.3550) is unreachable, because the map covers every group row.
- **A-R371-REVIEW-GH5-IDENTITY** (Low): GH5 asserts `count === 1` but not which group's header rendered. Suggestion: key the count on `memoizedProps.group.id`.
- L8c is green on HEAD too. It is a positive control, and the task already says so.
- **Architecture note (proposal for B/root, not done):** the generic `PropEquality`/`samePropsByTable` helper lives in the StudioWorkspace owner (l.738–751). Keep it while it has one consumer. Move it to `app/lib/arrangement/` as one bounded task when a second memo wrapper uses the pattern.

## B acceptance status (only what A truly ran)
- SKETCH-EQUAL: run, rc 0.
- Covering files: run, all green, under 50 % of their timeout.
- Doc 238 checks: run, OK.
- Typecheck, lint, scoped Biome: rc 0.
- Not A's to mark: SOURCE-SCOPE/CLAIMS/MUTANTS-TREE/PERF-*/GROUP-*/G371-AUTH/STUDIO-SMOKE-371/DOCS are C rows. A's probe run is not C evidence.

## Known gaps
- The three reviewer Lows above are not applied (no grant).

## Exact next C checks
Run §3 as written. GROUP-BEHAVIOUR and G371-AUTH: warm the dev server first (L38). A's cold run timed out at 1440 on the first navigation. GROUP-RENDERS: A's warm run read header 0 / wrapper 0 at both viewports. MUTANTS-TREE: pass `c-round-371/mutants` as the output directory, never B's default.
