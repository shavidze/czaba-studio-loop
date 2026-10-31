# A round 278 — SYS-5 stage 2 (final): implementer report

**Baseline:** HEAD `42872cf`, clean tree at start. **No commit, push, deploy or install.** No browser run by A (the browser rows belong to C).

## Pre-flight (posted before code)
- Assumptions: B's sketch `b-round-277/sketch.diff` is the source contract (byte-exact, §2.1). A writes the §6.2 rows and docs 206/207. No frozen file is touched.
- Files: exactly the §5 grants (20 paths).
- Success: typecheck/lint rc 0; the 14 §6.3 files pass; every stated mutant goes red.

## Changed files (`git status --short`: 17 `M`, 3 `??`, all in §5)
- **Source, byte-identical to the sketch applied on HEAD** (checked with `cmp` against a scratch copy of HEAD with the sketch applied: all 13 sketch-touched files `same`):
  - `app/components/arrangement/studio-soft-disabled.ts` (new);
  - `ArrangementTransport.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLibraryPreview.tsx`;
  - `app/lib/arrangement/strings.ts`;
  - `perf/studio-lab{,-interactions,-resources}.perf.spec.ts`.
- **Sketch test edits, byte-identical:** `mode-toggle-colour-ui`, `library-row-strings-ui`, `drag-feedback-colour-ui`, `transport-centre-ui`, `strings.test.ts`.
- **Sketch edits plus A's new rows:**
  - `metronome-ui` (sketch edits to UI1/2/6/11, plus UI12–UI14 and the `TEMPO_INVALID_MESSAGE` import);
  - `library-preview` (sketch edit at l.251, plus LPA1–LPA5 and the helpers `mountPreviewFor`, `liveApi`, `previewToggle`);
  - `self-disabling-focus` (sketch SD7 edit, plus SD8, SD9 and two source-path constants).
- `held-enter-add`: HA5 gains one line, `expect(add.hasAttribute('aria-disabled')).toBe(false);`, after the `disabled` read. Nothing else.
- `studio-soft-disabled.test.tsx` (new): SDU1–SDU4.
- **Doc 206:** exactly 3 lines changed (`git diff --numstat` 3/3):
  - l.4 → `**სტატუსი:** Completed (C round 278 PASS)`;
  - l.9 `(277)` → `(278)`;
  - l.65 `(რაუნდი 277)` → `(რაუნდი 278)`.
- **Doc 207** (new): l.4 byte-exact; the seven TEMPLATE headings in order.
- **Frozen manifest:** `sha256sum -c b-round-277-r278-tree-sha256.txt` rc 0.

## Commands actually run
| Command | Result |
|---|---|
| `git apply` of the sketch | clean |
| `npx biome check` on the 5 source files and the 10 test files A touched | clean, no fixes |
| `npm run typecheck` (covers `perf/**`) | rc 0 (`a-round-278/typecheck.log`) |
| `npm run lint` | rc 0 (205 warnings and 1 info that were already there; no errors) (`a-round-278/lint.log`) |
| `npx vitest run` on the 14 §6.3 files | **14 files, 195/195 pass** (`a-round-278/targeted-vitest.log`) |
| `npx biome check` re-run after the final test edit, on all 15 owned `app/` paths | "Checked 15 files … No fixes applied" |
| `npm run build` | rc 0 (`a-round-278/build.log`). The compiled `build/client/assets/app-*.css` contains `aria-disabled\:cursor-not-allowed\!`. `git status` is unchanged afterwards (20 entries) |

**`/check`:** `.claude/commands/check.md` asks for `npm run verify` plus `test:e2e:smoke`. A did **not** run either: the speed rules give verify and the smoke run to the root gate. The orchestrator asked for scoped Biome, and A ran it (above) together with typecheck, lint, build and the targeted tests.

**L31 (timeouts):** in the parallel run of 14 files, the slowest tests were:
- TC10: 4.58 s under its 15 s describe timeout (31 %);
- LRS4: 2.37 s under the default 5 s (47 %, measured under parallel load).

Run alone, LRS4 takes 0.98 s (20 %). No covering test is above 50 %. `metronome-ui` runs 14 tests in about 1.7–4.0 s under a 15 s timeout.

## Mutants (scratch edits; backups kept outside `store/`; every file restored; logs in `a-round-278/mutants/`)
| Mutant | Edit | Red rows |
|---|---|---|
| G | the wrapper's guard deleted | SDU2, SDU4, LPA1, SD2, SD2b; LPA4 (re-run `G-LPA4`, after LPA4 gained its status check, see below) |
| C-transport | cursor without `!` in Transport | SD7 |
| C-tempo | cursor without `!` in TempoRow | SD9, UI11 |
| C-library | cursor without `!` in LibraryPreview (both buttons) | SD9, LPS1 |
| D | Delete label reverted to `deleteClipLabel` | TC1, SD8 |
| A | the video branch returns `addTitle` | library-preview l.251 ("keeps the video note…") |
| M | `aria-disabled:*:opacity-50` → `disabled:opacity-50` on the metronome | UI11, SD9 |
| SDU1 | props always `{}` | SDU1 (and SDU4) |
| SDU3 | compare with `!== null` | SDU3 |
| SDU4 | the guard caches the first click's state | SDU4 |
| UI12 | TempoRow uses `softDisabledButtonProps` (import added so it compiles) | UI12, UI13, UI14 |
| UI13 | `handleTempoBlur` stops committing (`setDraft(null)` only) | UI13 (and 11 other metronome rows that commit by Enter→blur) |
| SD9-prop | adds `disabled={false}` to Add | SD9 |
| SD9-enabled | an `enabled:hover:` token back on Add | SD9 |

**A deviation from the row text, made openly:** with G alone, LPA4 as worded ("`libraryPreviewSourceId` stays `null`") stayed **green**, because `startLibraryPreview` refuses an unloaded source by itself. An unguarded click does write `sourceNotLoaded`, so LPA4 now also asserts that the status is unchanged. With that, G turns LPA4 red. This makes the row stronger and drops nothing.

**Variant X reproduces in jsdom** in the §6.2 UI13 order (field focus → change `120` → `mouseDown` returns `true` → `act(focus toggle)` → click → pressed). No STOP condition was hit.

## LPA3 reachability statement
All three states are produced in jsdom by `mountPreviewFor(loadSource, sourceId)`, which uses the same provider as `mountPreview` with a different loader:
- **no sound:** `sourceId = null`;
- **loading:** a loader that never resolves;
- **failed:** a loader that rejects.

None was skipped.

## code-reviewer (real subagent run): 9/10, no Critical, High or Medium
Its findings and what A did with each:
1. **Low:** UI12 does not fail if the metronome's `guardSoftDisabledClick` is deleted, because `toggleMetronome` returns early on a null tempo. **Not changed.** B already ruled this in §2.3 and L52: SDU2 is the unit row and SD9/source is the source row. The reviewer's cheap fix is a standalone `ArrangementTempoRow` render with a `vi.fn()` `onMetronomeToggle`. That is a candidate for B.
2. **Low:** doc 207 claimed that Space on an unavailable button does nothing. In fact Space toggles workspace playback on every Studio button. **Fixed** in doc 207.
3. **Low:** docs 206/207 say "Completed (C round 278 PASS)" before C runs. **Not changed:** §5 mandates that text byte-exact. If C fails the round, both l.4 lines must be reverted.
4. **Low:** unused `(event)` params in the Split, Loop and Zoom-to-selection wrappers in Transport. **Not changed:** the sketch is byte-exact, and HUNK-SCOPE compares against it. Candidate for B.
5. **Low (visual note):** child-only dimming leaves the Add border and fill at full strength. This is the accepted §4 trade-off; C's V-LOOK-2 measures it.
6. **Nit:** the perf predicate lines are longer than 100 columns. Biome does not cover `perf/`. They are byte-exact from the sketch.

The reviewer also suggested recording whether Preview should carry a title when available. Today it has none; Add always has one, as §1 specifies.

**Architecture note (verbatim intent, for B; not acted on):**
- **Keep:** `studio-soft-disabled.ts` as the single owner (signal 2).
- **Signal 1:** `ArrangementTempoRow.tsx:318` writes `aria-disabled` by hand while the other buttons use the helper, so there are two patterns. Proposal: one bounded later task adding `softDisabledButtonProps(isUnavailable, { keepMouseFocus: true })` for the metronome. Its acceptance: UI12 and UI13 unchanged, plus a spy-based guard test.
- Keep the DOM-read guard over a captured boolean, because variant X needs the click-time value.

## Known gaps
- No browser verification by A. Every §8 browser and look row is C's: B-TAB-2, B-AX-2, B-NOOP-2, B-VARIANT-X, B-CURSOR, V-LOOK-2, V-RING-2, B-PERF-PREDICATE and the rest.
- The full suite, build, `verify` and e2e smoke were not run (speed rules); they are gate rows.
- Doc 206/207 l.4 assert C PASS in advance, as B required.

## B acceptance A actually passed
- §2.1–§2.5: source equal to the sketch (cmp).
- §5 scope: only granted paths; frozen manifest rc 0.
- §6.2: every row written and passing.
- §6.3 items 1–3: typecheck, lint, the 14 targeted files, and the code-reviewer.
- §6.4: every mutant red, with the LPA4 strengthening noted above.

The browser rows are not claimed.

## Exact next C checks
1. SOURCE-SCOPE, HUNK-SCOPE (the sketch `cmp` method above), CLAIMS and SWEEP.
2. Re-run G (expect SD2, SDU2 and LPA1 red) and the UI12 mutant (it needs the `softDisabledButtonProps` import added).
3. B-VARIANT-X and B-CURSOR first; they are the highest-risk browser rows.
4. Then B-TAB-2, B-AX-2, B-NOOP-2, B-ADD-ENABLE, B-DELETE-NAME, B-PERF-PREDICATE, B-HANDOFF-REG, the look rows, C-R276-02-KEEP, G278-AUTH, DOC-206-207 and STUDIO-SMOKE-278.

Scope completed: the round-278 A deliverables. The SYS-5 feature is not marked done; that is C's and B's call.
