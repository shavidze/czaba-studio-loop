# A round 207 — SABA-B-6 timeline cursor (pointer / grab)

**No STOP.** The scope of §2 is complete. Base `60c82ed`. No commit or push was made.

## Changed files (only the 5 grants and the 2 new files)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | l.353: `cursor-crosshair` → `cursor-pointer`. l.367: `cursor-move` → `cursor-pointer`. Nothing else. |
| `app/components/arrangement/ArrangementVideoDock.tsx` | l.922, floating branch: `'fixed z-40 cursor-grab active:cursor-grabbing touch-none shadow-lg ring-1 ring-outline'`, which replaces `cursor-move`. The compact branch `relative w-40` is unchanged. |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | A new `describe('SABA-B-6 envelope cursor (CU1, CU2)')` at the end of the file. Existing rows are unchanged. |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | A new `CU3` test at the end of the main describe. Existing rows are unchanged. |
| **new** `app/lib/arrangement/__tests__/timeline-cursor-map.test.ts` | CU4, a whole-file source scan. |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | l.4 only, with the exact R113 text. |
| **new** `docs/implementation/2026/quarter-IV/164-timeline-cursor-pointer.md` | Georgian implementation doc. It has the cursor map, the "no reference found" record, D1–D3 and CU1–CU4. Status line: "In Progress (C round 207 check pending)". |

`sha256sum -c --quiet b-round-206-r207-tree-sha256.txt` returns OK (the 1,043 frozen files are unchanged).

## Tests actually run
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (205 warnings and 1 info, repository-wide). Scoped `biome check` on the 5 code files reports no diagnostics. Logs: `a-round-207/typecheck.log`, `lint.log`.
- Targeted vitest (`clip-envelope-ui`, `floating-video`, `timeline-cursor-map`, `affordance-colour-ui`, `panel-radius-ui`): **5 files, 90/90 pass**. That is B's 86 plus CU1–CU4. Log: `a-round-207/targeted-tests.log`.
- **Red-proof** (scratch copy `/tmp/a207` with the start-copy components; the start copies themselves were not edited): CU1, CU2, CU3 and CU4 **fail** (4 failed, 72 passed). Logs: `a-round-207/redproof/start-copy.log` and `start-copy-v2.log` (after the CU4 widening).
- **CU4 named mutants** (scratch copy, patched components): the clean copy passes. **6 mutants each make CU4 fail:**
  - `cursor-move` inside a multi-line `cn(` call in ArrangementVideoDock (`redproof/mutant-cn-multiline.txt`);
  - `cursor-[move]`;
  - `[cursor:move]`;
  - `{ cursor: 'move' }`;
  - `hover:cursor-all-scroll`;
  - `active:cursor-crosshair` in `studio-fader.ts`.

  Log: `redproof/cu4-mutants.log`.
- **Real Chromium** (`a-round-207/tools/a207cursor.cjs`; B's tools copied in, no class injection; server :5173; Snap off; demo-middle-east + demo-soft-impact; `beeps-6s-h264-aac.mp4`; Env on; one breakpoint added by double-click). Outputs: `a-round-207/out/a207cursor-{1440,1280}.json`. Both viewports gave the same result:
  - Editor body at 6 points (10/50/90 % × upper/lower): **`pointer`** at all 6.
  - Breakpoint: **`pointer`** at rest, on press, at all 5 drag steps (+4 px each) and after release. `data-gain` 1.0000 → 0.6000 at 1440, → 0.5918 at 1280. Status line: "Envelope: 4.000 s · −4.4 dB." at 1440, "· −4.6 dB." at 1280.
  - Floating video: **`grab`** at rest, **`grabbing`** on press and at all 4 drag steps, **`grab`** after release. The box moved [40, 8] px. So `:active` gives `grabbing` during the real drag, and the L11 STOP condition does not apply.
  - Compact video after ✕: `auto`.
  - Grid scan (6 px) for crosshair/move/cell/copy/all-scroll: **0 hits** with Env on and 0 hits with the video floating.
  - Network: ok (no auth headers or forbidden hosts).
  - The first attempt at 1440 hit a `setSnapOff` evaluate error during start-up (null element); the re-run was clean.
- Not run by A: the full suite, `npm run build`, `npm run verify` and e2e smoke. These are gate rows.

## Code-reviewer (real subagent): 8/10, no Critical or High
- **Medium: the CU4 regex had gaps.** It missed `cursor-[x]`, `[cursor:x]`, inline style, `all-scroll` and `.ts` files. **Fixed** in my own test file: the pattern now covers these forms, `.ts` files in `app/components/arrangement/` are scanned too, and the 6 mutants above prove it. Still outside CU4: CSS files and runtime-built class names (none exist today).
- **Low: CU1–CU3 are jsdom class checks.** The real cursor is shown only by the browser probe. C must measure computed style. The doc says so.
- **Low: `:active` after a `preventDefault`ed pointerdown may not apply in Firefox or Safari.** Doc 164 now says the measurement is Chromium-only. The proposed alternative (a `data-dragging` attribute) is a handler change, so it is out of R-1 and goes to B.
- **Low (UX): `pointer` on a draggable breakpoint.** This is Saba's choice (D2); keep it in mind for SABA-B-6-R1.
- **Info:** the doc matched the code. I clarified the "four" vs "five" steps wording by naming the element in each line.
- **Architecture note (verbatim):** "none. Three class-token changes add no new state, ownership, lifecycle or mixed responsibility. Keep as is."

## Findings for B
- **A-R207-01 (Low, pre-existing, not changed here).** The ⠿ handle `arrangement-video-drag` has `cn(VIDEO_FLOAT_BUTTON_CLASS, 'cursor-grab')`, but its **computed cursor is `pointer`** at both viewports (`out/a207cursor-*.json` → `handle.handleOwnCursor`).
  - Cause: the unlayered `button { cursor:pointer }` at `app/styles/app.css:476` beats the layered Tailwind utility.
  - `app/styles/**` is protected, so I did not touch it.
  - **The CUR-VIDEO-207 clause "The ⠿ handle is still `grab`" will not hold in computed style.** The cause is outside this diff (A did not touch the handle or `app.css`). The same rule could also override `cursor-grab` or `cursor-*` on other `<button>` elements; this was not audited.
  - B ruling needed: accept `pointer` for buttons, or grant `app.css` (or `!`/a layer) in a later round.
  - **Baseline evidence from B's own data:**
    - `b-round-206/out/cursormap-1440.json`, state "c-video floating" (taken at 60c82ed before my edits), records non-pointer cursors only (`cursormap.cjs` skips `pointer`).
    - It has **no entry** for `arrangement-video-drag` or its svg.
    - Its only `lucide-grip-vertical` `grab` hit is at (522, 366), on the timeline. That is the clip title-bar grip, which also appears in states a and b, before the video floats.
    - So at baseline the ⠿ handle already computed `pointer`.
- **Order of the VideoDock tokens:** `b-round-206/tools/patch207.cjs` contains no `cursor-grab` string. B's scratch edit is not stored as an exact string. §2 ("`cursor-grab … active:cursor-grabbing` in place of `cursor-move`") is therefore the only spec. I put `active:cursor-grabbing` right after `cursor-grab` in the slot `cursor-move` held; the order of tokens in the class string has no effect on cascade.
- **A-R207-02 (info).** `active:cursor-grabbing` is verified in Chromium only (see the reviewer's Low).

## B acceptance self-check (A side only; C verifies)
- §2 edits exactly as specified: done.
- CU1–CU4 exist and locate elements by testid; CU4 reads whole files: done.
- Red-proof on start copies and the named multi-line `cn(` mutant: done.
- Typecheck, lint and targeted tests: done.
- Real-Chromium computed cursor on the three elements: done.
- Code-reviewer run and Medium addressed: done.
- Doc 163 l.4 R113 and doc 164 (conditional status): done.
- Not claimed: any C row, gate rows, and Ableton parity (the cursor shape stays "unconfirmed (no source)").

## Exact next C checks
1. **SCOPE-207:** frozen list OK. Only the 5 grants and the 2 new files differ. The component diffs are exactly 3 tokens. Doc 163 differs at l.4 only.
2. **CUR-ENV-207:** test selected, unselected and muted-lane clips; grid scan with 0 plus cursors.
3. **CUR-POINT-207:** `pointer` through the drag; `data-gain` changes.
4. **CUR-VIDEO-207:** `grab`/`grabbing`/`grab`, box moved, compact not grab/move. **Note A-R207-01:** the ⠿ handle computes `pointer` (pre-existing).
5. **CUR-UNCHANGED-207**, **BEHAV-207** (the double-click add/delete point, Ctrl-click selection, ⠿ arrows 16 px and Esc paths are unchanged in code), **REF-207**, **AN-REVIEW-207** (CU4 now also scans `.ts` files and arbitrary/inline forms), **G207-3**.

## Known gaps
- Firefox/Safari `:active` is unverified.
- A-R207-01 is open for a B ruling.
- SABA-B-6-R1 is `awaiting_user` (unchanged).
- I did not run the full suite or the build (gate).
