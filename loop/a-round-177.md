# A round 177: DUX-R-5b-2b (mode toggles go neutral) + gate-176 S1 (G1)

Status: **implementation done; awaiting C round 177.** Browser rows were not run by A (they are C's). realVerified/browserVerified: not claimed by A.

## Baseline (checked before any edit)
- HEAD `ff3f710`, `git status --short` empty, 999 files, `sha256sum -c b-round-176-r177-tree-sha256.txt` OK, the 14 grant start hashes OK, both new files absent.
- Base vitest (13 files) before the edits: **134/134** (`a-round-177/out/vitest-base.json`).

## Changed files (14 granted + 2 new; nothing else)
- Components:
  - `ArrangementTransport.tsx`: T1 l.218, T2 l.234, T3 l.255–256, T4 l.257.
  - `ArrangementTempoRow.tsx`: R1 l.243.
  - `StudioWorkspace.tsx`: W1 l.2287, W2 l.2368, W3 l.2388. `git diff ff3f710` shows exactly 3 hunks of 1 line each.
  - `ArrangementLoopBrace.tsx`: B1 l.239, B2 l.257.
  - `ArrangementLibraryPreview.tsx`: P1 l.308.
  - `ArrangementLibrary.tsx`: Y1 l.132.
  - **Note for C (AN-REVIEW):** I wrapped the T3 string over 2 lines (it fits Biome's line width; `biome check` reports nothing). Transport gains 1 line, so K9 Export moves from l.339 to **l.340**. No other token changed.
- Tests:
  - L1 `transport-surface-ui`, L2 `metronome-ui`, L3 `waveform-zoom`, L4 `clip-envelope-ui` (token split), L5 `studio-theme-obsidian` TH6, L6 `library-row-strings-ui`, G1 `affordance-colour-ui`.
  - G1 adds `EXPORT_DIALOG_PATH`, `KEPT_BRASS_COUNTS` (ExportDialog `accent-brand` = 6), `LATER_STAGE_BRASS_SITES` (Lane ghost = 2, with a `// TODO:` for 5b-3), and the checks in DXA7.
- New: `app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx` (DXT1–DXT8).
- Docs: D1 doc 145 (l.4 status, l.93 struck through, l.94 suffix). D2 new doc 146 (Georgian, the TEMPLATE sections), status `In Progress (awaiting C round 177)`.

## Deviations from §1 (B to rule; both in granted files and forced by the mandated edits)
1. **A-R177-TS1-FOLLOW:** TS1 (`transport-surface-ui` l.271–290) checks that all "plain 10" buttons have `border-transparent` plus the base fill. Follow starts `'on'` (§0.4), so after T3 it has `border-foreground` and `bg-foreground/20` at mount, and TS1 went red. L1 said "nothing else", but the T3 edit makes this unavoidable.
   - Fix: inside the loop, Follow is checked separately: `aria-pressed="true"`, `border-foreground` and `bg-foreground/20` present, `border-transparent` and `bg-foreground/5` absent. The other 9 buttons are checked exactly as before, and the count of 10 is kept.
   - The TS1 title is unchanged and slightly stale ("the plain 10 the borderless…"). B can rename it.
2. **A-R177-LRS3-CLASS:** LRS3 (`library-row-strings-ui` l.235) pins the previewing label's full className with `text-brand`. Y1 makes this red. The fix: the expected string now ends in `text-foreground`; Biome wrapped it over 3 lines. Nothing else changed.
- **Info:** LPS1's title in `library-row-strings-ui` still says "(Stop keeps its accent border)". I left it unchanged per "nothing else"; B can rename it.

## Tests actually run
- After the edits: 13 base files + the new file = **14 files, 142/142** (`a-round-177/vitest-files.txt`, `out/vitest-after.json`; re-run after the review fix: `out/vitest-final.json`, 142/142).
- Neighbour check, outside the base list: `detail-panel-strings-ui`, `export-dialog-hold-enter`, `grid-triplet-ui`, `lane-strings-ui`, `master-ui`, `video-fades-ui` and every `*follow*|*loop*|*snap*|*envelope*|*metronome*|*library*|*navigation*|*transport*` test: **33 files, 522/522**.
- `npm run typecheck`: OK.
- `npm run lint`: exit 0 (218 warnings, none in the changed files).
- `npx biome check` on the 13 granted code/test paths + the new test: clean (14 files, no fixes).
- Not run by A (gate/C): the full suite, `npm run verify`, build, e2e, browser rows.

## Mutations m266–m277 (`a-round-177/mutations/*.json`, script `a-round-177/tools/mutate.py`)
All 12 went **red**. Each file was restored and sha-checked (`restored_ok: true`), and the frozen tree check passes afterwards. The extra reds beyond §3.3 are listed too.
- m266 → DXT1, DXT8, TS5
- m267 → DXT3, DXT8, (+TS1)
- m268 → DXT3, DXT8
- m269 → DXT4, DXT8, metronome UI11
- m270 → DXT4, DXT8, TS8
- m271 → DXT4, DXT8, TS8, EU1
- m272 → DXT5, DXT8, WZ2
- m273 → DXT6, DXT8, TH6
- m274 → DXT7, DXT8, LPS1
- m275 → DXT7, DXT8, (+LRS3)
- m276 (temporary edit to the protected ExportDialog, restored) → DXA7
- m277 (temporary edit to the protected Lane, restored) → DXA7
- m267 and m268 were re-run after the DXT3 review tweak: still red.

## Code review (code-reviewer subagent, actually run): 9/10, nothing blocking
- **Addressed:**
  - Doc 146 wrongly said "`border-solid` → `border-dashed`" (there is no base style token). Corrected.
  - DXT3 Follow-on now also excludes `bg-foreground/5`.
- **Left for B:** the stale TS1 and LPS1 titles; Preview `text-foreground` repeated in both branches (the spec fixes that exact string and DXT8 locks it).
- **Architecture note (verbatim):** "Architecture note: this is a review of the diff only, not a full audit of the modules. Signal 3 (one region keeps getting expensive changes): the same on-state literal is repeated at `ArrangementTransport.tsx:234` and `:256`, `ArrangementTempoRow.tsx:243`, and `StudioWorkspace.tsx:2287` and `:2368`. A shorter version appears at `StudioWorkspace.tsx:2388` and `ArrangementLoopBrace.tsx:239`. DXT8 (`mode-toggle-colour-ui.test.tsx:474-487`) locks these exact strings, so pulling them into a shared constant would change the test contract. Keep them as they are; this is the gate-176 S2 proposal (`ARRANGEMENT_MIX_ON_STATE`), which is still awaiting approval. The fake Web Audio and ResizeObserver test setup is copied again at `mode-toggle-colour-ui.test.tsx:23-100`. Keep that too; it is already tracked as ROOT-RECON-GRID-HARNESS. Signals 1, 2 and 4: none. No state, effect, listener or ownership moved."

## Evidence files
- `a-round-177/end-sha256.txt` (16 paths)
- `a-round-177/diff-vs-start.patch` (against `b-round-176/r177-granted-start/`, new files as new)
- `a-round-177/vitest-files.txt`, `out/vitest-{base,after,final}.json`, `mutations/`

## B acceptance criteria A truly passed
- [x] §1 T1–T4, R1, W1–W3, B1–B2, P1, Y1 as written (T3 wrapped over 2 lines; tokens exact).
- [x] L1–L6 and G1 as written, **plus the two deviations above** (B rules).
- [x] N1 DXT1–DXT8, D1, D2.
- [x] StudioWorkspace has exactly 3 changed lines; frozen tree (985 entries) OK at the end.
- [x] §3.1: base 134/134 before; 142/142 after; typecheck, lint and scoped Biome clean.
- [x] §3.3: 12/12 mutations red, restored and sha-checked.
- [x] code-reviewer run; architecture note passed on.
- [ ] Every §4 row is C's (not claimed).

## Known gaps
- No browser verification by A. Contrast, pixel and computed-style values in §0.1 are B's computation, not measured by A.
- The two deviations need B's ruling.

## Exact next checks for C
- **T177-TARGETED:** re-run `a-round-177/vitest-files.txt`; expect 14 files, 142/142.
- **SOURCE-SCOPE:**
  - `git status` shows 14 ` M` + 2 `??`.
  - `git diff ff3f710 -- app/components/arrangement/StudioWorkspace.tsx` shows 3 one-line hunks (l.2287/2368/2388).
  - The protected diff is empty, and `sha256sum -c b-round-176-r177-tree-sha256.txt` passes.
  - `a-round-177/end-sha256.txt` matches.
- **AN-REVIEW:** include the T3 2-line wrap (K9 at l.340) and the TS1 and LRS3 deviations.
- **§4 browser rows:** CC-TOGGLE, NO-BRASS-TOGGLE (`--disable-lcd-text`), CONTRAST-TOGGLE, STATE-DISTINCT-TOGGLE (Follow on at first paint), LOOP-EDGE, FUNC-SMOKE-TOGGLE, ENV-VIS, RV1-DUX5B2B, RV3-STORE, G177-3, PX-NET/REG-HYD, at 1440×900 and 1280×720 on http://127.0.0.1:5173/studio-lab.

## Final verification (after the report)
- `npx biome lint .` gives 0 diagnostics in any of the 16 owned paths. 218 warnings equals the gate-176 `verify.log` baseline (218 warnings, 1 info). The full-tree run shows 2 infos, against 1 in `npm run lint`; the extra one is outside the owned paths.
- `git status --short` gives 14 ` M` + 2 `??`, exactly the grants plus the new files. `sha256sum -c a-round-177/end-sha256.txt` is OK.
- I read `.claude/prompts/new-test.md` including its checklist. The new test follows the sibling arrangement UI suites:
  - fakes are stubbed in `beforeEach`;
  - cleanup runs in `afterEach` with `vi.unstubAllGlobals` and `vi.restoreAllMocks`;
  - there is no shared state between tests and no `console.log`.
  - The template's `vi.mocked` service-mock items do not apply here, since no services are mocked.

## Scope completed
DUX-R-5b-2b implementation and G1 only. DUX-R-5 is **not** complete; 5b-3 follows after C PASS. Nothing committed or pushed.
