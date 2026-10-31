# A round 293 — FIX-PD-1c2 (C-R292-01): narrowing stops the library preview

No STOP. Claims before editing matched `b-round-292/claims-293-output.txt` exactly (`diff` empty).

**For B/C, CLAIMS row: K15 changes from `1` to `2`.** The CLAIMS row's allow-list does not include this. It comes from NG5c itself using `demo-soft-impact`, which §3.2 and B's own `sketch-ng5c.diff` require. NG5b still has its single use. The delta was predictable from the spec, so it is a spec gap, not an A deviation; C should record it as INFO.

## Changed files (exactly the 3 §4 grants)
- `app/routes/studio-lab.tsx` — `StopPlaybackOnNarrow` destructures `stopLibraryPreview` and calls it once on mount in its own `useEffect(..., [stopLibraryPreview])`. The `togglePlayback` effect, latch, branches, keys, focus effect, `meta`/`links` are unchanged. Reverse-applying B's `sketch-route.diff` gives sha256 `de98ea81…4423`, which equals the frozen-list entry, so the change is exactly the sketch.
- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` — new row **NG5c**, right after NG5b, inside the existing describe (`{ timeout: 15_000 }`). Uses `demo-soft-impact` and the NG5b `AudioBuffer` stub. It spies `FakeAudioContext.prototype.createBufferSource` to capture the preview source, so the helper is untouched. It finds the toggle via `within(getByRole('region', { name: 'Preview' })).getByRole('button', { name: 'Preview' | 'Stop' })`, with no class selectors and no match on `[data-playing]`. It asserts Stop before narrowing, that `stop` was not called before narrowing, `stop` called exactly once on narrowing, and after widening no `Stop` and one `Preview`. It also adds `within` to the testing-library import. No other row changed.
- `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md`:
  - l.4 now reads `**სტატუსი:** Completed (C round 293 PASS)` (L28).
  - New Problem → Solution entry for C-R292-01.
  - NG5c is cited in the testing list (the id list and the description).
  - The doc had no "stops all sound" sentence, so nothing was removed.

## Checks actually run
- Claims after editing: the diff against the expected output shows only K3 (rc 1), K5 (94 lines, new destructure), K6 (3), K10 (440 lines, rows 16, NG5c 1) and K11 (`Completed (C round 293 PASS)`), **plus K15: `1` → `2`**. That one comes from NG5c itself using `demo-soft-impact`, as §3.2 requires; NG5b still uses it once. It is an expected consequence but **not in C's CLAIMS allow-list**, so B/C should accept it. Log: `a-round-293/claims-after.txt`.
- `sha256sum -c b-round-292-r293-tree-sha256.txt` fails only on the 3 §4 paths. `git status` still shows exactly the 9 round-292 paths. Protected files are untouched.
- `npm run typecheck` rc 0. `npm run lint` rc 0 (205 pre-existing warnings, unchanged repo-wide). `npx biome check` on the 2 code paths rc 0, after `biome format --write` on the test file (line wrap only). No ignore added.
- Covering set (`studio-narrow-gate-ui`, `library-preview`, `ssr-layout-effect`, `default-track-names-ssr`, `studio-theme-obsidian`): **5 files, 46 tests, all pass**.
  - Slowest: NG5 927 ms (15 000 ms timeout, 6 %). NG5c 237 ms. Next slowest: library-preview 252 ms (5 000 ms default).
  - No test is above 50 % of its timeout.
  - NG1–NG9, NG5b, NG5c, NG7a–d, NG9b and NG9c are all present by name.
  - Log: `a-round-293/covering.clean.log`.
- **NG5c mutant** (new effect deleted): NG5c **red**, "expected "stop" to be called 1 times, but got 0 times". The file was restored and `cmp`-checked. Log: `a-round-293/mutant-ng5c.log`.
- **M9 mutant** (`<StopPlaybackOnNarrow />` replaced by `null`): NG5b and NG5c both **red**, 14 others pass. The file was restored. Log: `a-round-293/mutant-m9.log`.
- **Browser self-check** (not acceptance; Playwright Chromium on the running `:5173`, C's round-292 master-tap method):
  - Script `a-round-293/a293-probe.cjs`, result `a293-probe.json`, screenshots in `a-round-293/shots/`.
  - Library `Bass` → Preview at RMS 0.0473, then resize. RMS was **0 at +0.3, +1, +5 and +10 s** for 1440→899, 1280→899 and 1440→390.
  - After widening, the toggle reads `Preview`, Bass is still selected, and pressing it plays again (RMS 0.049–0.057). Pass on all 3.
- **code-reviewer subagent** (real run, on the 3 paths): no Critical, High or Medium findings; score 9/10. Lows:
  - test: pick the source created after the click → fixed (`sourcesBeforePreview`);
  - test: pin the stop to the narrowing (`not.toHaveBeenCalled` before, `toHaveBeenCalledTimes(1)` after) → fixed;
  - doc C-R292-01 sentence on the never-wide branch was imprecise → reworded: the provider is mounted only in the hydration pass, so no preview can start, and its cleanup still calls `stopLibraryPreview`;
  - doc l.4 "claims a PASS before the verdict" → **not changed**: L28 and §3.3 require exactly this value;
  - doc l.21 (approach section) still describes only `togglePlayback` for the narrowed branch → **outside the grant** (§4 grants l.4 plus additions only). For B: a one-clause addition in a later doc touch.
  - Sweep confirmed by the reviewer: every `startGraph` path is gated by `isPlayingRef`; `ArrangementVideoDock` lives only in `StudioWorkspace`; the preview player is the only remaining source.
  - All mutants, the covering run and the checks above were re-run after the review fixes.

## Architecture note (for B; not acted on)
The reviewer says keep: `StopPlaybackOnNarrow` (`studio-lab.tsx:26-37`) is now the route's informal "silence the provider" list, so any new audible source in the provider must also be added there. Proposal: when `ArrangementContext.tsx` is next unfrozen, a bounded task adds one context method (for example `silenceAll()`: transport + preview) that this component calls instead.

## Known gaps / not done
- B-NARROW-MIX, B-RESIZE-KEEP, B-NARROW-WIDE, B-DESK-SAME, B-NARROW-LOAD and G293-AUTH were **not** run by A. They are C rows.
- Full suite, build, `verify` and `test:e2e:smoke` were not run (gate rows).
- Deferred Lows from §2 (NARROW-REMOUNT, TH4-TITLE, ERROR-NOT-ANNOUNCED) are untouched, as ruled.

## B acceptance criteria A actually passed
TYPECHECK (rc 0); UNIT (covering set green, names present, timings < 50 %); UNIT-MUTANTS (a) and (b) run by A (red as required; (c) not run by A); SOURCE-SCOPE (3 failing paths only; 9-path union); CLAIMS (all expected deltas, plus the K15 delta flagged above). Everything else is for C.

## Exact next C checks
CLAIMS (accept or reject K15 = 2), SOURCE-SCOPE, TYPECHECK, UNIT, UNIT-MUTANTS (a)/(b)/(c), B-NARROW-PREVIEW (1440/1280; 899 and 390), B-NARROW-MIX, B-RESIZE-KEEP (a)+(b), B-NARROW-WIDE, B-DESK-SAME, B-NARROW-LOAD (short), G293-AUTH, DOC-218.

Scope completed: §3.1, §3.2 and §3.3 of the round-293 task. Backlog not self-marked.
