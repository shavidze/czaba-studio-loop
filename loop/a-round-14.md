# A — Round 14 report: floating-video follow-ups C-R13-01, C-R13-02, C-R13-03 (D-29e)

Date 2026-10-10 · Implementer A (Claude Opus 5.5) · Task `current-task.md` (round 14) · **No PASS is claimed. Everything below is A's evidence, pending C.** Nothing was committed, stashed, pushed or deployed. Dev server `127.0.0.1:5173` was used as is (not started/stopped). Browser work used gstack browse with `a-browse.json`.

## 1. Pre-flight gate

**Before the first edit**
- `sha256sum -c b-round-13-tree-sha256.txt` → **42/42 OK** (`a-round-14/gates/sha-start.txt`). HEAD `c5ed47b`.
- §3.3 frozen subset (35 files) → `gates/frozen-start.txt`, 35 OK against B's hashes (`gates/frozen-expected.txt`).
- Owned base backups `a-round-14/bak/*.base.*` (7 files); each equals `b-round-13-tree-sha256.txt` (`gates/bak-base-check.txt`, 7 OK).

**Assumptions**
- D-29e wins over D-29d. Only the three bugs are in scope.
- "Export the two texts as named constants": done literally with `export const` next to the existing (non-exported) `VIDEO_*_MESSAGE` constants (advisor read it the same way).
- The shared Modal renders its own `Close` (X) button before `children`, outside any wrapper I can place inside the children. The Tab cycle therefore covers the wrapper's enabled controls (format radio, `დახურვა`, `WAV-ის ექსპორტი`). X stays mouse-only. `showCloseButton` is **not** changed (that would change the dialog's visible controls). Reported as a known gap (§8, §9).
- ⤢ while expanded is the same return path (`onVideoExpandedChange(false)` → `returnFloatingVideo`), so it also writes the compact return text.

**§1.4 measurements before code** (`runs/measure-1440x900.json`, `runs/measure-1280x720.json`; fresh load, library source selected by default):

| Viewport | Lib | aside t–b | header t–b | search block t–b | body t–b (h) | preview t–b | separator | D-29e box l,t,w×h | covers header/search/sep/preview | inside body |
|---|---|---|---|---|---|---|---|---|---|---|
| 1440×900 | 288 | 84–851 | 84–124 | 124–233 | 233–684 (451) | 684–851 | x 283, w 4 | 8, 523, 272×153 | no/no/no/no | yes |
| 1440×900 | 480 | 84–851 | 84–124 | 124–217 | 217–700 (483) | 700–851 | x 475, w 4 | 8, 431, 464×261 | no/no/no/no | yes |
| 1280×720 | 288 | 122–671 | 122–162 | 162–271 | 271–504 (233) | 504–671 | x 283, w 4 | 8, 343, 272×153 | no/no/no/no | yes |
| 1280×720 | 480 | 122–671 | 122–162 | 162–255 | 255–520 (265) | 520–671 | x 475, w 4 | 8, 263, 442.67×249 | no/no/no/no | yes |

- "No source selected": the library always selects one; a no-results search (`zzzzqq`) still renders the preview bar at the same rect (rows `noResults` in the JSON). A layout without the preview bar does not exist in this UI, so it was not measured.
- **The degenerate 160 px case is reached in no measured case.** 1280/480 is height-capped: top = body.top + 8 = body.bottom − 8 − h = 263.
- No stop condition → proceeded.

**Smallest design:** one rule change in `panels.ts`, one ref prop, the measure reads one more rect, two status constants and two `setStatus` calls, and dialog-local focus handling (two effects and a Tab handler).

**Files with reasons:** `panels.ts` (rule), `ArrangementLibrary.tsx` (`bodyRef`), `StudioWorkspace.tsx` (measure + return status), `ArrangementExportDialog.tsx` (focus), `panels.test.ts` / `floating-video.test.tsx` (changed + new tests), `export-dialog-focus.test.tsx` (new), doc 022 (status/TODO), doc 023 (new).

**Success commands:** §7 of the task; tails in §4.

## 2. Design

**C-R13-01 (`panels.ts`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`).**
- `FloatingVideoLibraryRect` is now `{ left, width, bodyTop, bodyBottom }` (export name kept). New `FLOATING_VIDEO_MIN_WIDTH_PX = 160`.
- `placeFloatingVideoOverLibrary`:
  - availableHeight = bodyBottom − bodyTop − 16;
  - width = max(160, min(640, width − 16, availableHeight × 16/9)), but **0** if width, bodyTop or bodyBottom is non-finite (`Math.max(160, NaN)` would be NaN);
  - height = width × 9/16; left = left + 8; top = max(bodyTop + 8, bodyBottom − 8 − height); then the unchanged `clampFloatingVideoRect` (non-finite coordinate → 0);
  - no rounding (the contract has none; 1280/480 gives 442.67).
- Other float functions and constants: byte-unchanged.
- `ArrangementLibrary`: optional `bodyRef?: RefObject<HTMLDivElement>` on the l.427 body `div`. It is a plain prop like `asideRef`, so render-budget function names are unchanged. Nothing else changed.
- `measureFloatingVideoAnchor`: null if the aside ref or the body ref is missing; otherwise aside left/width and body top/bottom. The placement timing code is untouched.

**C-R13-02 (`StudioWorkspace.tsx`).**
- `export const VIDEO_RETURNED_COMPACT_MESSAGE = 'ვიდეო პატარა ხედს დაუბრუნდა.'`
- `export const VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE = 'ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.'`
- `returnFloatingVideo`: after the existing `!isVideoExpanded` early return, it writes the re-collapse text if `libraryOpenedForVideo`, otherwise the compact text. A no-op writes nothing.
- The ◀ path (`changeLibraryCollapsed`) and ▶/◀ without a video are unchanged.

**C-R13-03 (`ArrangementExportDialog.tsx` only).**
- **Effect A `[isOpen]`:** on open it remembers `document.activeElement` if that is an `HTMLElement`. Its cleanup (close or unmount) focuses the opener only if it is `isConnected` and not `:disabled`.
- **Effect B `[isOpen, isRendering]`:** runs after A, so the opener is captured first.
  - If focus is already on an enabled focusable inside the wrapper, it does nothing.
  - Otherwise it focuses `დახურვა` when not rendering, else the wrapper.
  - So on open, focus goes to `დახურვა`. When a WAV render disables both buttons, focus moves to the wrapper; when the render ends, it goes back to `დახურვა`.
- **Wrapper:** a `div` inside the Modal children with `tabIndex={-1}`, `className="focus:outline-none"`, and `onKeyDown` that acts only on `Tab`:
  - when focus is not on a listed control (e.g. the wrapper itself), Tab goes to the first control and Shift+Tab to the last;
  - Tab on the last control wraps to the first, and Shift+Tab on the first wraps to the last;
  - `preventDefault` is called only when it moves focus, `stopPropagation` never.
- **Focusable list:** enabled `button`/`input`(not hidden)/`select`/`textarea`/`a[href]`/`[tabindex]`, excluding `tabindex=-1`.
- No document listener and no new dependency. Texts, options and test ids are unchanged (no test id added). The workspace capture-phase Export mark and early return are untouched.

## 3. Files actually changed (subset of §3.2)

- `app/lib/arrangement/panels.ts`
- `app/components/arrangement/ArrangementLibrary.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`
- `app/components/arrangement/ArrangementExportDialog.tsx`
- `app/lib/arrangement/__tests__/panels.test.ts`
- `app/lib/arrangement/__tests__/floating-video.test.tsx`
- `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` (new)
- `docs/implementation/2026/quarter-IV/022-studio-lab-floating-video.md` (status and TODO lines only)
- `docs/implementation/2026/quarter-IV/023-studio-lab-floating-video-followups.md` (new; everything "pending C")

Confirmations:
- **No round-6..13 file reverted.** `sha256sum -c b-round-13-tree-sha256.txt` at the end gives exactly 7 FAILED (the 7 owned pre-existing files above) and 35 OK (`gates/sha-end.txt`).
- **`frozen-start.txt` equals B's hashes**, and `gates/frozen-end.txt` is 35/35 OK. That includes `ArrangementVideoDock.tsx`, `video-sync.ts`, `components/ui/Modal.tsx` and `render-budget.test.tsx`.
- **`Header.tsx` == HEAD** (`git diff --quiet HEAD` passes; vs `cc1e531` still `1 file changed, 21 insertions(+)`).
- **Dock and `Modal.tsx` unchanged** (above).
- **Instrumentation grep = 0** (`gates/instrumentation-grep.txt`). The runtime `data-a14` markers used to click the Export button and the header link were DOM attributes set via `$B js` in the browser only, not in source.
- **Protected 4/4 OK** (`gates/protected.txt`).
- **`git status`** equals the round-13 end status plus ` M ArrangementExportDialog.tsx` (owned) and `??` `export-dialog-focus.test.tsx` and doc 023 (`gates/git-status-end.txt`). The foreign `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` were not read, edited or deleted.
- Final owned hashes: `gates/owned-final-sha256.txt` (7 files).

## 4. Command tails (final code)

```
sha256sum -c ../tmp/studio-real-loop/b-round-13-tree-sha256.txt → 7 FAILED (owned), 35 OK
npx vitest run panels.test.ts floating-video.test.tsx export-dialog-focus.test.tsx
  ✓ panels.test.ts (44 tests) · ✓ export-dialog-focus.test.tsx (13 tests) · ✓ floating-video.test.tsx (39 tests) · Tests 96 passed (96)
npx vitest run app/lib/arrangement → Tests 481 passed (481)
npx vitest run → Test Files 55 passed (55) · Tests 945 passed (945)   (914 + 31; sfx-library flake did not recur)
npx tsc --noEmit → TSC=0
npx biome check app/lib/arrangement app/components/arrangement → Checked 54 files … No fixes applied (0 errors, 0 warnings shown)
npx biome check ./app → Checked 321 files … No fixes applied · Found 218 warnings · Found 1 info (0 errors; same 218 as round 13, none in owned files)
npm run build → ✓ built in 7.46s / 2.23s · BUILD_EXIT=0
git status --short → round-13 end + M ArrangementExportDialog.tsx + ?? export-dialog-focus.test.tsx + ?? 023 doc
git diff --stat → 18 files changed, 2813 insertions(+), 379 deletions(-)   (tracked only; untracked files not counted)
git diff app/components/layout/Header.tsx → empty
protected-baseline → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
```

Full outputs: `a-round-14/gates/{vitest-all,vitest-arrangement,vitest-new,tsc,biome-owned,biome-app,build}.txt`.

**`/check`:**
- `biome check --write` was run on owned paths only.
- **Process note:** one run used the `app/lib/arrangement/__tests__/` directory instead of named files. It reported "Fixed 3 files". I immediately checked the frozen hashes (35/35 OK) and `git status` (no new paths). The three files were my own test files.
- `npm run check` and `npm run format` were not run. `Header.tsx` was never written.

## 5. A's browser runs (headless gstack browse, `127.0.0.1:5173/studio-lab`; evidence, not a verdict)

Setup: C's harness via `a-round-14/setup.sh`. Raw files are in `a-round-14/runs/`. All runs are on the final hashes (`gates/owned-final-sha256.txt`). No store file was edited during browser runs.

**R14-P1 (placement). ⤢ by real `$B click`, then state 0.6–0.9 s later.**

| Case | File | Box (fixed, z 40) | Expected | Δ l/t/w/h | 16:9 | Inside body | Hit-test ◀ / search / separator / preview toggle | Real ◀ click |
|---|---|---|---|---|---|---|---|---|
| 1440, lib 288 | `p1-1440-288.txt` | 8, 523, 272×153 | same | 0/0/0/0 | 1.7778 | yes | control ×4, not box | collapses, compact, ◀ text verbatim (`s-1440.txt` S5) |
| 1440, lib 480 (separator keys) | `p1-1440-480.txt` | 8, 431, 464×261 | same | 0/0/0/0 | 1.7778 | yes | control ×4 | collapses, compact, ◀ text verbatim, lib 40 |
| 1440, temporary opening | `p1-1440-temp.json` | 8, 523, 272×153 | same | 0/0/0/0 | 1.7778 | yes | control ×4 | — (✕ path, see R14-S) |
| 1280, lib 288 (fresh load) | `p1-1280-fresh.txt` | 8, 343, 272×153 | same | 0/0/0/0 | 1.7778 | yes | control ×4 | collapses, ◀ text verbatim |
| 1280, temporary opening (fresh) | `p1-1280-fresh.txt` | 8, 343, 272×153 | same | 0/0/0/0 | 1.7778 | yes | control ×4 | real Esc → re-collapse text, lib 40 |
| 1280, lib 480 (after resize from 1440) | `p1-1280.txt` | 8, 263, 442.66×248.98 | 8, 263, 442.67×249 | 0/0/−0.01/−0.02 | 1.7779 | yes | control ×4 | collapses, ◀ text verbatim |
| 1280, lib 288 / temp (after resize) | `p1-1280.txt` | 8, 343, 272×153 | same | 0 | 1.7778 | yes | control ×4 | ◀ verbatim |

- A library source is selected in every case (the preview bar is always visible). The degenerate case was not reached.
- **Unchanged from round 13:**
  - placeholder 160×90 (1440: 1268,92; 1280: 1108,130);
  - dock strip 107 → 107;
  - fresh-load lanes 81×4 and detail 144 (1440) / 36 (1280), Δ 0 across ⤢;
  - expand texts verbatim.
- In the resized-from-1440 1280 session the detail panel stayed open, so lanes were 53/67/67/67 and detail 144. Both were unchanged across ⤢ (Δ 0). This is the existing D-29b auto-fit, not this change.
- Shots:
  - `a-round-14/shots/video-expanded-d29e-1440.png`
  - `a-round-14/shots/video-expanded-d29e-1280.png` (fresh 1280 load)
  - `a-round-14/shots/export-focus-1440.png`

**R14-P2 (find → add while expanded, 1440; `runs/p2-1440.txt`):**
- Video expanded at 8,523.
- Real `$B click` on search, then `$B type "soft"`: the list filters to 1 option ("Soft impact").
- First row 148,237 126×47: `elementFromPoint` at its centre is the row, not the box.
- Real click on the row, then a real Enter: clips 0 → 1, status `„Soft impact“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`
- Undo shows `Undo: დამატება — Soft impact`. One real Undo click → clips 0 and Undo disabled, so there was exactly one entry. Redo restored it.
- The box stayed at 8,523,272 and expanded throughout.

**R14-S (return status, 1440; `runs/s-1440.txt`).** Each return was preceded by an expand that wrote the expand text, so every return text below was freshly written.
- **✕ (S1b), placeholder (S2b), real Esc (S3b)**, library open: `ვიდეო პატარა ხედს დაუბრუნდა.` In each case the box is `relative` 1268,92,160×90 with `style=""` and no placeholder.
- **Temporary opening, then ✕ (S6), real Esc (S7) or placeholder (S8):** `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.` The library is the 40 px rail. Also at 1280: ✕ and Esc (`p1-1280*.txt`).
- **Real ◀ click while expanded (S5):** `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`
- **Esc with nothing expanded (S4):** status unchanged. **▶ without video (S9):** status unchanged.
- **⤢ while expanded (S1, first attempt):** writes the compact return text. That attempt was meant to be ✕ but the video was still expanded from P2; it is kept in the log as evidence for ⤢-as-return, and S1b is the real ✕ run.

**R14-E (Export focus, 1440, real keys and clicks; `runs/e-1440.txt`):**
1. ⤢; focus ✕; real click Export → `activeElement` is `დახურვა` inside `[role=dialog]`. A real Enter closes the dialog, and the video stays expanded. Chromium focused the Export button on click, so focus returned to Export.
2. Opened again. Real Tab ×5: WAV → radio → დახურვა → WAV → radio. Real Shift+Tab ×4: WAV → დახურვა → radio → WAV. `activeInDialog` was true at every step.
3. Focus on `დახურვა`, real Space: position `00:00.000` and `Play` are unchanged. Space activated `დახურვა`, closing the dialog, as a button should.
4. Real Esc closes the dialog, the video stays expanded, and focus returns to the opener (the Export button).
5. Keyboard open: focus Export, real Enter. Then a real Tab to `WAV-ის ექსპორტი` and a real Enter.
   - A WAV was produced: RIFF/WAVE, format 1 (PCM), 2 ch, 48000 Hz, 24-bit, 96000 frames = **2.000 s**, 576 044 B, `czaba-studio-lab.wav`. The dialog status is `WAV შეიქმნა: 00:02.000, 24-bit · 48 kHz · stereo.`
   - After the render, focus was back on `დახურვა`, inside the dialog. That is the review-H1 fix working in the browser.
   - **Deviation:** the project length is this session's project (one 2 s clip added in P2), not the round-13 project length.

**Console:** the cumulative log showed `ReferenceError: bodyRef is not defined` at 22:24:37 local time. That was Vite HMR loading my intermediate edit (JSX ref added before the props edit), during coding and before any measurement. After `console --clear`, a fresh load and an expand/Esc/◀/temporary-opening/✕/Export/Tab/Esc flow, the only errors are the known root `GET localhost:5199/api/cart` failures (backend down) (`runs/console-errors-final.txt`).

**G14-3 (anonymous):**
- **Direct load** (`runs/network-direct.txt`) and **header link** (visible header `Studio Lab` link → `/studio-lab`; `runs/network-headerlink.txt`):
  - no `/api/studio-token`, `/api/recording-*` or `/api/download` request, and no R2 host;
  - media only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`;
  - the direct load also has the known root `localhost:5199/api/cart`.
- `localStorage.auth_user` is null.
- `grep Authorization` in `app/components/arrangement/*.tsx` and `app/lib/arrangement/*.ts` finds nothing. The browse network log does not show headers.
- `curl` anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**. A fake Bearer → **500 `{"error":"Unable to prepare Studio access"}`**, no token (backend 5199 down).
- `/studio/middle-east` shows "Sign in required" (`runs/premium-anon.txt`).

**Not run by A (C's §6 adjacent checks):** R13-F2 quick drag/arrows/second pointer from the new placement, R13-F3 same-node checks, the reduced-motion simulation, R11A-1 preview-stop, the dock compact quick check and RF7-P2. `render-budget.test.tsx` is green inside the 945 and its sha is unchanged.

## 6. Tests

**`panels.test.ts`: 37 → 44, 44/44.**

Named exceptions (existing tests whose input or expectation changed):
1. **"places a narrow library box at (left + 8, top + 8) …"** is renamed to "… at left + 8 on the body bottom …".
   - Before: `{left:0, top:88, width:288}` @1440 → `{8, 96, 272, 153}`; and `{0, 88, 480}` @1280 → `{8, 96, 464, 261}`.
   - After: `{left:0, width:288, bodyTop:233, bodyBottom:684}` @1440 → `{8, 523, 272, 153}`; and `{0, 480, 217, 700}` @1280 → `{8, 431, 464, 261}`.
2. **"caps a wide library at 640 px and keeps 16:9".**
   - Before: `{20, 40, 900}` → width 640, height 360, left 28, top 48.
   - After: `{20, 900, bodyTop 40, bodyBottom 860}` → width 640, height 360, left 28, top 492 (= 860 − 8 − 360).
3. **"clamps the initial placement into the viewport and falls back to 0 for a non-finite library".**
   - (a) Before: `{0, 700, 480}` @1280 → top 459. After: `{0, 480, 300, 1000}` @1280 → `{8, 459, 464, 261}`. Same clamp result, new input shape.
   - (b) Before: `{0, 0, NaN}` → `{8, 8, 0, 0}`. After: `{0, NaN, 0, 0}` → `{8, 8, 0, 0}`. Unchanged result.
   - (c) **Expectation change:** before, `{0, 0, width 10}` → width **0**. After, `{0, 10, 0, 700}` → width **160** (`FLOATING_VIDEO_MIN_WIDTH_PX`). Reason: D-29e's max(160, …) keeps the D-22 compact size as the floor for a finite library. Only non-finite inputs give width 0.

All other existing tests (including the constants test and every clamp/step test) are unchanged.

New tests:
- the 160 constant;
- a tall body capped at 640 and by library − 16;
- a short body capped by height (1280/480: 442.67×249, top 263, bottom = body.bottom − 8);
- the degenerate case (`{0, 288, 400, 500}` → `{8, 408, 160, 90}`);
- bottom anchoring;
- the viewport clamp after the body rule (right edge; body above the viewport);
- non-finite bodyTop / bodyBottom give width 0, and a non-finite left gives coordinate 0.

**`floating-video.test.tsx`: 28 → 39, 39/39.**

Named exceptions:
- **Fixture change.** `LIBRARY_RECT` `{0, 88, 288, 700}` became `{0, 84, 288, 767}` (measured 1440). The per-element `defineProperty` mock on the aside became an `Element.prototype.getBoundingClientRect` spy that returns the aside rect and the body rect (`{0, 233, 288, 451}`, found as the tree's parent). Reason: the body `div` is remounted after collapse → expand, so a per-element mock would be lost. Header, search and preview rects are new constants.
- **Placement assertions**, with `PLACED_TOP` = 233 + 451 − 8 − 153 = **523**:
  - every `{left: 8, top: 96, width: 272}` → `{8, 523, 272}`. That is six assertions: expand, temporary opening, transitionend, release re-expand ×2, fallback timer;
  - ⠿ arrows: `top 96 + 16` → `523 + 16`, and `{40, 96}` → `{40, 523}`;
  - drag: `{208, 196}` → `{208, 623}`;
  - release: `{68, 116}` → `{68, 543}`;
  - commit: `{224, 196}` → `{224, 623}`;
  - blur: `{58, 96}` → `{58, 523}`;
  - burst: `{56, 96}` → `{56, 523}`.
- Clamp and resize assertions (1168/747, 0/0, 1008/567, 992/567) are unchanged. Every other existing test is unchanged.

New tests (11):
- placed inside the body and not intersecting the header, search or preview rects (direct, and after a temporary opening with the remounted body);
- the return status after ✕, the placeholder and Esc (×3);
- the re-collapse status after ✕, the placeholder and Esc from a temporary opening, with the 40 px rail (×3);
- ⤢-as-return writes the compact text;
- a no-op Esc and ▶/◀ without video write nothing;
- ◀ keeps its own text after a temporary opening.

**`export-dialog-focus.test.tsx` (new): 13/13.**
- Open → focus on `დახურვა`.
- Tab and Shift+Tab wrap (`defaultPrevented` only on a wrap; a non-wrap Tab is not prevented).
- Wrapping skips disabled controls (empty project, WAV disabled).
- Only Tab is handled; Enter is not prevented, and Esc dispatched on a dialog button still reaches the Modal (no `stopPropagation`).
- Close restores focus to the opener.
- An opener removed while open is never focused (spy).
- An opener that became disabled is never focused (spy).
- Enter on `დახურვა` is not swallowed, and its activation closes without starting an export. jsdom does not synthesize the click from Enter; the real Enter is R14-E1 above.
- Space on a dialog button leaves the transport alone. This is a regression test: it also passes on the round-13 code.
- During a render (controlled `OfflineAudioContext`), focus stays inside the dialog (wrapper), Tab from the wrapper goes to the first control, and after the render focus returns to `დახურვა`.
- Focus on an enabled control is not stolen when a render starts or ends.
- Tab and Shift+Tab from the wrapper go to the first and last controls.
- After Esc closes Export, focus returns to the expanded video's ✕ and the video stays expanded.

**Guard proof** (`a-round-14/guard-proof.txt`; pre-guard copies in `a-round-14/guard/`). Each mutation is applied by `scripts/guard.cjs`, the three files are run, the original is written back, and then `cmp` runs against the pre-guard copy (every entry shows `restored: cmp OK`). Production code was identical across all of them. G1–G8 ran while `export-dialog-focus.test.tsx` had 12 tests (95 total), and G9 ran with 13 (96).

| Guard | Mutation | Failing |
|---|---|---|
| G1 (task 1) | measure passes the aside top/bottom instead of the body | 12, incl. both body-containment tests |
| G1b | panels anchors at body.top + 8 | 18 |
| G2 (task 2) | return statuses removed | 7 (6 return-path + ⤢-return) |
| G3 (task 3) | focus move in effect B removed | 6, incl. the open-focus test |
| G4 (task 4) | wrap branch removed | 2 (wrap; skip-disabled wrap) |
| G5 | restore check `opener?.isConnected && !:disabled` → `opener` | 2 (removed opener; disabled opener) |
| G6 | `opener.focus()` removed | 2 (restore; ✕ after Esc) |
| G7 | effect B deps `[isOpen]` only | 1 (render window) |
| G8 | outside-the-list Tab branch removed | 2 (render window Tab; wrapper Tab) |
| G9 | effect B no-steal early return removed | 1 (focus not stolen) |

An earlier guard run on the pre-review code (`guard-proof-raw.txt`) gave the same kills for G1–G6. In that run `cmp` was run after the batch and after G6, not after every mutation.

## 7. Code-reviewer (actual `code-reviewer` subagent), three passes

**Review 1 (full diff `a-round-14/diff-all.txt`), 7/10:**
> "D-29e placement and the return status are implemented correctly … **H1** The focus trap breaks after a WAV export starts … Chrome's focus fixup then moves focus to `body` … a forward Tab from there leaves the dialog … exactly the C-R13-03 symptom … **M1** Some changed assertions in `panels.test.ts` change behaviour, not just input shape … `viewport1280` → `viewport1440` … `width: 10` changed from 0 to 160 … **M2** Doc 023 points to files that do not exist and overstates one result … Low: no-selection measurement not taken; 1280/480 box hides most of the body; the Enter test never exercises Enter; the Space test also passes on pre-round code; disabled-opener and ⤢-return untested; Modal X outside the cycle; loose selector; …"

Fixes:
- **H1:** effect B on `[isOpen, isRendering]`, the focusable wrapper (`tabIndex -1`), and the outside-the-list Tab branch, plus tests and guards G7/G8. Confirmed in the browser (R14-E5).
- **M1:** the `viewport1280` case was restored. 10 → 160 is listed as named exception 3c.
- **M2:** this report and `guard-proof.txt` were produced, and the final guard proof runs `cmp` after each mutation.
- **Lows:** the Enter test was renamed; the Space test is described as a regression test; disabled-opener and ⤢-return tests were added; the selector was tightened; doc 023 records the no-selection and 1280/480 observations, the separator guarantee (library ≥ 288), Safari and the Modal X.

**Review 2 (fix delta `diff-dialog-final.txt`, `diff-export-test-final.txt`), 8/10:**
> "H1 is fixed and the fix works … **M1** Modal's built-in ✕ button is outside the trap … Focus can leave the dialog from ✕ … Fix that keeps `Modal.tsx` unchanged: pass `showCloseButton={false}` … it's a Tech Lead call … If you keep ✕, write it up … **M2** Nothing tests the 'don't steal focus' guard … Deleting the `return` passes all 944 tests … **M3** The previous M1 is only half done … width 10 … list it as a named exception … Low: no visible focus on the wrapper; screen readers announce nothing on the wrapper; dead `!first || !last` branch; …"

Fixes:
- **M2:** the new no-steal test and G9 (kills exactly that test).
- **M3:** named exception 3c.
- **M1:** **not changed**, reported as a known limitation (§8.1).
- **L1 (`focus-visible` ring on the wrapper):** not applied. It is a visual change outside the bug, and the render message is in a `role=status` region.

**Review 3 (final delta: M2 test, G9, doc 023), 9/10:**
> "M2 is closed … Doc 023 claims no PASS that C hasn't verified, and it matches the code and the counts … Low: G1–G8 ran against the 12-test file … the named-exception reference depends on a-round-14.md … changed-files entry for the Export dialog is incomplete."

Fixes: doc 023 now states the 12/13-test guard runs, names the 10 → 160 change, and has the complete changed-files entry. This report contains the named exceptions.

## 8. Deviations, each with its reason

1. **Modal X stays outside the Tab cycle.** It is rendered by the read-only `Modal.tsx` before `children`, so a wrapper inside the children cannot catch its keydown.
   - Keyboard Tab never reaches it, but focus can still land on it by mouse. During a render (when `handleClose` is a no-op), a Tab from there can leave the dialog.
   - `showCloseButton={false}` would close this gap but changes the dialog's visible controls. That is left to B or the Tech Lead.
   - The shared Modal focus gap is root/UI-owner work.
2. **Effect B and the focusable wrapper go beyond §2.3's literal "move focus on open".** They were needed because a WAV render disables the focused button, after which the trap was bypassed (review H1). They stay inside the dialog file, use no document listener, and leave the Esc/Enter paths untouched.
3. **The constants are exported** (`export const`), per the task text, although the neighbouring `VIDEO_*` constants are not exported. Trade-off: `StudioWorkspace.tsx` now has non-component exports, so Vite React Fast Refresh does a full reload when that file is edited (dev-only, no runtime effect). B can choose plain `const` later; the tests assert the literal texts, not the exports.
4. **⤢-as-return writes the compact return text.** It is the same `returnFloatingVideo` path; the task names ✕, placeholder and Esc.
5. **No width rounding.** The contract has none; at 1280/480 the browser rect is 442.66×248.98 (Δ ≤ 0.02).
6. **R14-E5 project length** is this session's 2.000 s project, not the round-13 project.
7. **The Enter test is jsdom-limited** (click simulated separately). The real Enter is in the browser run (R14-E1).
8. **One Biome `--write` run hit the `__tests__` directory.** It modified only my 3 files (verified: frozen 35/35, `git status`). Process slip, no effect.

## 9. Not ready / open

**Acceptance IDs not ready:** none known. Every R14 item is implemented, but **none is verified by C**. R14-P1, R14-P2, R14-S, R14-E, R14-U and R14-Doc are all pending C.

**For B / root:**
- Modal X outside the Studio Export dialog's Tab cycle (§8.1). The shared `components/ui/Modal.tsx` has no focus management (root/UI owner; new carry item).
- At 1280×720 with library 480 the D-29e box covers most of the body (263–512 of 255–520). It conforms, but the find → add rows there sit under the box. R14-P2 is specified only at 1440.
- The outer `describe` title in `floating-video.test.tsx` still says "D-29d" while it holds D-29e tests. Left unchanged on purpose: renaming would change every test name.

**Carried, unchanged (from the task's §6.5–§6.6 and the root review):**
- Purchased loader hardcodes middle-east (SRW-21).
- Lenis on `/studio/*` (Tech Lead).
- Portable instruction-file paths.
- Export hard-clip at 0 dBFS (R13-M4, SRW-13).
- Final commit/push only after everything.
- Uncommitted round-6..14 tree (root exposure note).
- Tech Lead: C-R6-02, C-R8-01, RF7-3 quiet Chrome; R11-P3m, R11-SB; real `prefers-reduced-motion` for the placement.
- C-R12-01 → milestone RF5-3.
- Polish rounds 15–17, the 21 regression-debt IDs, SRW-13..20, the SRW-21 adapter and T12.
- Foreign `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml`: untouched; root decides.

## 10. Exact next C checks

1. **G14-2.**
   - `sha256sum -c a-round-14/gates/owned-final-sha256.txt` (7 OK).
   - `sha256sum -c b-round-13-tree-sha256.txt`: exactly the 7 owned files FAILED, 35 OK (dock, `video-sync.ts`, `Modal.tsx`, `render-budget.test.tsx` included).
   - `a-round-14/bak/*.base.*` against B's hashes; protected 4/4; `Header.tsx` == HEAD.
2. **R14-P1** at all six cases with real ⤢ and real ◀ clicks, plus the `elementFromPoint` checks. Compare with §5 (expected Δ 0; 1280/480 → 442.67×249 at 8,263).
3. **R14-P2** at 1440: search → first row uncovered → add → one clip, one Undo, box unmoved.
4. **R14-S:** ✕, placeholder and Esc; the temporary-opening variants; ◀ text; Esc no-op.
5. **R14-E 1–5** with real keys. Also try clicking dialog text, then Tab (should go to the radio), and Tab during a WAV render (focus should stay in the dialog).
6. **Adjacent (§6.2):**
   - R13-F2 quick from 8,523 (drag +200/+100 → 208,623; ⠿ ArrowRight ×3 = +48; bottom-right re-clamp on resize; second pointer ignored; no history);
   - R13-F3 same nodes and the Export-open Esc row;
   - R13-F4 temporary opening after the transition plus the reduced-motion simulation (expected 8,523 at 1440);
   - R11A-1 quick, the dock compact quick check, RF7-P2.
7. **G14-1** (vitest ≥ 945) and **G14-3** as specified.
