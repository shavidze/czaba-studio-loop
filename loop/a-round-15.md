# A — Round 15 report: library rows while the video is expanded (C-R14-01) and the Modal X in the Export Tab cycle (C-R14-02) (D-29f)

Date 2026-10-11 · Implementer A (Claude Opus 5.5) · Task `current-task.md` (round 15) · **No PASS is claimed. Everything below is A's evidence, pending C.** Nothing was committed, stashed, pushed or deployed. The running dev server `127.0.0.1:5173` was used as is (not started or stopped). Browser work used gstack browse with `a-browse.json`. Raw files are in `a-round-15/`.

## 1. Pre-flight gate

**Before the first edit**
- HEAD `c5ed47b`. `sha256sum -c b-round-14-tree-sha256.txt` → **44/44 OK** (`gates/sha-start.txt`).
- §3.3 frozen subset (36 files: the dock, `video-sync*`, Lane/Clip/Detail and their tests, Context/Preview/position-store/render-budget, Overview/Transport/Ruler/LoopBrace, view and gesture/context tests, the types/schedule/transport/loop/model/graph files, `Modal.tsx`, docs 015–022, `Header.tsx`) → `gates/frozen-start.txt`. It is identical to B's hashes (`gates/frozen-expected.txt`).
- Owned base backups `a-round-15/bak/*.base.*` (8 files). Each one equals `b-round-14-tree-sha256.txt` (`gates/bak-base-check.txt`, 8 OK).

**Assumptions**
- D-29f wins over D-29e. Only C-R14-01 and C-R14-02 are in scope. No polish item, no dock or `video-sync` change, and no `Modal.tsx` change.
- The inset is computed from the placed anchor height only (B: "the inset is only extra scroll room"). A drag, the arrows or a resize do not change it.
- The X stays visible. `showCloseButton={false}` would need the Tech Lead.

**§1.5 measurements before code** (`runs/measure-1440x900.json`, `runs/measure-1280x720.json`; fresh load, unfiltered, rects of the aside, body, `nav`, listbox, every option and every tree button at scrollTop 0 and at max):

| Case | aside (l,t,w,h) | body t–b (h) | D-29f box (l, t, w × h) | inset | 160 min | covers header/search/sep/preview | tallest row / free upper part |
|---|---|---|---|---|---|---|---|
| 1440/288 | 0,84,288,767 | 233–684 (451) | 8, 523, 272×153 | 169 | no | no/no/no/no | 80.25 / 282 |
| 1440/480 | 0,84,480,767 | 217–700 (483) | 8, 450.5, 429.33×241.5 | 257.5 | no | no/no/no/no | 63.75 / 225.5 |
| 1280/288 | 0,122,288,549 | 271–504 (233) | 8, 379.5, 207.11×116.5 | 132.5 | no | no/no/no/no | 80.25 / 100.5 |
| 1280/480 | 0,122,480,549 | 255–520 (265) | 8, 379.5, 235.56×132.5 | 148.5 | no | no/no/no/no | 63.75 / 116.5 |

- All four equal B's table exactly. **No stop condition was met.** No case reaches 160, and no box covers a control. The tallest row is shorter than the free upper part in every case.
- Pre-expand values: listbox and `nav` `padding-bottom` 4 px; listbox `scrollHeight`/`clientHeight` 637/451 (1440/288), 516/483, 637/233, 516/265. The tree `scrollHeight` equals its `clientHeight` in every case, so the tree does not overflow.

**Mechanism probe (before code, browser only; `runs/probe-1280-480.txt`).**
- Setup: 1280/480 with the video expanded, inline listbox `paddingBottom` and `scrollPaddingBottom` = 148.5 px, first option focused, then real `$B press ArrowDown` ×9.
- **Honest reading:** the live box was still the round-14 box (top 263, h 249), because no code had changed yet. The probe therefore recorded `above:false` against that box.
- What it does show: every focused row's bottom stopped at ≤ 371.8 = 520 − 148.5, so Chrome honours `scroll-padding-bottom` on `.focus()`. That bottom lies above the D-29f top of 379.5, but this was an inference, not an observation. R15-P2.4 below measures it directly on the real code.
- No allowance was needed.

**Smallest design:**
- one width term, one constant and one pure helper in `panels.ts`;
- one expression and one prop in `StudioWorkspace`;
- one prop and two conditional inline styles in `ArrangementLibrary`;
- a content ref, one native listener effect, the wrapper `onKeyDown` removed and effect B's list changed in `ArrangementExportDialog`.

**Files with reasons:**
- `panels.ts`: the §2.1 cap and the §2.2 helper.
- `ArrangementLibrary.tsx`: applies the inset.
- `StudioWorkspace.tsx`: computes and passes the inset.
- `ArrangementExportDialog.tsx`: the §2.3 Tab cycle.
- The three test files: named exceptions and new tests.
- doc 023: status/TODO lines. doc 024: new.

**Success commands:** the task's §7 list; the tails are in §4.

## 2. Design

**C-R14-01 (a) `panels.ts`.**
- `bodyHeight = bodyBottom − bodyTop`. `availableHeight` = bodyHeight − 16, which is the same value as before.
- New `min()` term: `bodyHeight × FLOATING_VIDEO_BODY_SHARE × FLOATING_VIDEO_ASPECT_RATIO`.
- New `export const FLOATING_VIDEO_BODY_SHARE = 0.5`.
- Height, left, top, the viewport clamp and the non-finite rules (width 0, coordinate 0) are unchanged. The old (h − 16) term is kept, as B required.
- The other float functions and constants are byte-unchanged.

**C-R14-01 (b) inset.**
- `floatingVideoLibraryInsetPx(rect: FloatingVideoRect | null): number` returns `rect.height + 2 × FLOATING_VIDEO_OFFSET_PX` when the rect exists and its height is finite and > 0; otherwise 0. It does not use `FLOATING_VIDEO_LIBRARY_INSET_PX`, which is the 16 px *width* inset.
- `StudioWorkspace`: `const libraryBottomInsetPx = isVideoExpanded ? floatingVideoLibraryInsetPx(videoFloatAnchor) : 0;` is passed as `bottomInsetPx`. There is no new state, effect, measurement or listener.
- `ArrangementLibrary`:
  - optional `bottomInsetPx = 0`;
  - `bottomInsetStyle = bottomInsetPx > 0 ? { paddingBottom, scrollPaddingBottom } : undefined`, applied to the tree `nav` and to the `[role=listbox]`;
  - it stays a plain prop (no `forwardRef`), and classes and test ids are unchanged.

**C-R14-02 `ArrangementExportDialog.tsx`.**
- `dialogContentRef = useRef<HTMLDivElement>(null)` is passed as `ref` to `<Modal>`, which places it on the content `div` that holds the X and the children.
- **Effect C `[isOpen]`:** when the dialog is open and the content element exists, it adds one native `keydown` listener and removes it in the cleanup.
  - The handler acts only on Tab, and computes the list from the content element with `exportDialogFocusableElements`.
  - When focus is outside the list, Tab goes to the first control and Shift+Tab to the last.
  - Tab on the last control wraps to the first; Shift+Tab on the first wraps to the last.
  - It calls `preventDefault` only when it moves focus, and never `stopPropagation`.
- The wrapper's React `onKeyDown` was removed. The wrapper keeps `ref` and `tabIndex={-1}`, and its `KeyboardEvent` type import was dropped.
- **Effect B:** its no-steal check now uses `exportDialogFocusableElements(content)`. Everything else in effects A and B is unchanged.
- No document listener and no new dependency. Texts, options and test ids are unchanged. The workspace's round-13 Export capture mark and early return are untouched.

## 3. Files actually changed (subset of §3.2)

- `app/lib/arrangement/panels.ts`
- `app/components/arrangement/ArrangementLibrary.tsx`
- `app/components/arrangement/StudioWorkspace.tsx` (the import, one expression and one prop only)
- `app/components/arrangement/ArrangementExportDialog.tsx`
- `app/lib/arrangement/__tests__/panels.test.ts`
- `app/lib/arrangement/__tests__/floating-video.test.tsx` (the inset component tests are here; **`library-inset.test.tsx` was not created**)
- `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx`
- `docs/implementation/2026/quarter-IV/023-studio-lab-floating-video-followups.md` (the status line and TODO lines only)
- `docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md` (new; everything "pending C")

Confirmations:
- **No round-6..14 file was reverted.** `sha256sum -c b-round-14-tree-sha256.txt` at the end gives exactly **8 FAILED** (the 8 owned pre-existing files above) and **36 OK** (`gates/sha-end.txt`).
- **`frozen-start.txt` equals B's hashes**, and `gates/frozen-end.txt` is 36/36 OK. That includes `ArrangementVideoDock.tsx`, `video-sync.ts`, `ArrangementLibraryPreview.tsx`, `components/ui/Modal.tsx`, `render-budget.test.tsx` and `Header.tsx`.
- **`Header.tsx` == HEAD.** `git diff` is empty, and against `cc1e531` it is still `1 file changed, 21 insertions(+)`.
- **Instrumentation grep = 0** (`gates/instrumentation-grep.txt`). The `data-a15` markers used to click Export, Undo/Redo and the header link were set via `$B js` in the browser only, not in source. The jsdom scratch test I used for the `style=""` probe was deleted before any gate ran; no `zz*` file remains.
- **Protected 4/4 OK** (`gates/protected.txt`).
- **`git status`** equals C's round-14 end status plus `?? docs/…/024-studio-lab-library-rows-modal-x.md` (`gates/git-status-end.txt`, diffed against `c-round-14/gates/git-status-end.txt`). No `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `app/data` path changed.
- The foreign `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` were not read, edited or deleted. Report them to root.
- Final owned hashes: `gates/owned-final-sha256.txt` (7 code/test files and docs 023/024).

## 4. Command tails (final tree)

```
sha256sum -c ../tmp/studio-real-loop/b-round-14-tree-sha256.txt → 8 FAILED (owned), 36 OK
npx vitest run panels.test.ts floating-video.test.tsx export-dialog-focus.test.tsx
  ✓ panels.test.ts (53 tests) · ✓ export-dialog-focus.test.tsx (18 tests) · ✓ floating-video.test.tsx (45 tests) · Tests 116 passed (116)
npx vitest run app/lib/arrangement → Tests 501 passed (501)
npx vitest run → Test Files 55 passed (55) · Tests 965 passed (965)   (945 + 20; the sfx-library flake did not recur)
npx tsc --noEmit → TSC=0
npx biome check <7 owned files> → Checked 7 files … No fixes applied (0 diagnostics)
npx biome check app/lib/arrangement app/components/arrangement → Checked 54 files … No fixes applied
npx biome check ./app → Checked 321 files … No fixes applied · Found 218 warnings · Found 1 info (0 errors; same 218 as round 14; none in owned files)
npm run build → ✓ built in 8.96s / 2.55s · BUILD_EXIT=0
git status --short → C round-14 end + ?? docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md
git diff --stat → 18 files changed, 2830 insertions(+), 379 deletions(-)   (tracked files only)
git diff app/components/layout/Header.tsx → empty
protected-baseline → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
```

Full outputs are in `a-round-15/gates/`.

**Late test-only refresh:** after the advisor's final check, the ✕/Esc inset `it.each` table in `floating-video.test.tsx` changed from `[…] as const` to a typed `ReadonlyArray<[string, 'close' | 'escape']>`. This matches the file's existing `returnPaths` pattern and the no-type-assertions rule. Logic and test names are unchanged. After it: Biome on the file reported no fixes, tsc 0, and the focused run was 116/116 (`gates/vitest-new.txt`). `gates/owned-final-sha256.txt` and `diff-all.txt` were regenerated. The full suite and the guard proof were not re-run, because no source file or mutation target changed.

**`/check`:**
- `biome check --write` ran only on the **named** owned files (7 code/test files), never on a directory and never on `Header.tsx`. The test files were also formatted by name with `biome format --write`.
- `npm run check` was **not** run: `./app` carries 218 warnings in files I do not own. `npm run format` was not run.

## 5. A's browser runs (headless gstack browse, `127.0.0.1:5173/studio-lab`; evidence, not a verdict)

All post-code runs used the final source hashes. No store file was edited while a measurement ran. The test files were edited between runs only, and they are not part of the app module graph.

**R15-P1** (`runs/p1-{1440-288,1440-480,1280-288,1280-480}.txt`; ⤢ by real `$B click`, state read 0.9 s later; the 480 width was set with real `$B press ArrowRight` ×12 on the focused separator):

| Case | Box (fixed, z 40) | Expected (live rects) | Δ l/t/w/h | 16:9 | h ≤ body/2+1 | Inside body | Hit-test ◀/search/sep/preview | Real ◀ click |
|---|---|---|---|---|---|---|---|---|
| 1440/288 | 8, 523, 272×153 | 8, 523, 272×153 | 0/0/0/0 | 1.7778 | yes | yes | control ×4 | lib 40, compact, ◀ text verbatim |
| 1440/480 | 8, 450.5, 429.33×241.48 | 8, 450.5, 429.33×241.5 | 0/0/0/−0.02 | 1.7779 | yes | yes | control ×4 | same |
| 1280/288 | 8, 379.5, 207.11×116.48 | 8, 379.5, 207.11×116.5 | 0/0/0/−0.02 | 1.7781 | yes | yes | control ×4 | same |
| 1280/480 | 8, 379.5, 235.55×132.48 | 8, 379.5, 235.56×132.5 | 0/0/−0.01/−0.02 | 1.778 | yes | yes | control ×4 | same |
| temp. opening 1280/288 | 8, 379.5, 207.11×116.48 | same | 0/0/0/−0.02 | 1.7781 | yes | yes | control ×4 | ✕ → re-collapse text, lib 40 |
| temp. opening 1440/288 | 8, 523, 272×153 | same | 0 | 1.7778 | yes | yes | control ×4 | ✕ → re-collapse text |

- **No case reaches the 160 px minimum.**
- **Unchanged across ⤢ (Δ 0):** placeholder 160×90; dock strip 107; lanes 81×4; detail 144 (1440) and 36 (1280); expand texts verbatim (the D-29e and temporary-opening texts).
- **Inset while expanded:** computed `padding-bottom` = `scroll-padding-bottom` = 169 / 257.5 / 132.5 / 148.5 px, which is box height + 16 (the box's measured 0.02 px subpixel shortfall stays within ±1).
- Shot: `shots/video-expanded-d29f-1280-480.png`.

**R15-P2.**
1. **1280×720, library 480, the exact round-14 repro** (`runs/p2-1280-480.txt`):
   - real `$B click` on search, then `$B type soft` → 1 option ("Soft impact") at 148,259 317×47;
   - real `$B click` on `[role=option]` (no "not interactable" failure), then a real Enter → clips 0 → 1, status `„Soft impact“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`, Undo `Undo: დამატება — Soft impact`;
   - one real Undo click → clips 0 and Undo disabled, so there was exactly one entry; Redo restored it;
   - the box stayed at 8,379.5 and expanded throughout.
2. **1440×900, library 288, no filter, list at max scroll** (`runs/p2-last-rows-1440-288.json`; scrollTop 351, `scrollHeight` 802, `clientHeight` 451):
   - "პადი" 354.25–434.5 → `elementFromPoint` is the row, not the box;
   - "მელოდია" 434.5–514.75 → the row, not the box (box top 523).
   - Shot: `shots/library-rows-scrolled-1440-288.png`.
3. **All four cases, unfiltered, scrolling only each element's own container** (`runs/p2-reach-*.json`):

| Case | List rows reachable | Tree rows reachable | Covered at scrollTop 0 (list/tree) | List sh/ch | Tree sh/ch | padding-bottom = scroll-padding-bottom (both) | box h + 16 |
|---|---|---|---|---|---|---|---|
| 1440/288 | 9/9 | 9/9 | 2/0 | 802/451 | 451/451 | 169px | 169 |
| 1440/480 | 9/9 | 9/9 | 3/0 | 769/483 | 483/483 | 257.5px | 257.48 |
| 1280/288 | 9/9 | 9/9 | 2/5 | 765/233 | 358/233 | 132.5px | 132.48 |
| 1280/480 | 9/9 | 9/9 | 0/4 | 660/265 | 374/265 | 148.5px | 148.48 |

   At 1440 the tree does not overflow even with the inset (content + padding ≤ client height), and no tree row is under the box.
4. **Keyboard, 1280/480** (`runs/p2-keyboard-1280-480.txt`):
   - first option focused, then real ArrowDown ×9 (there are 9 rows, so the 9th press stays on the last);
   - every focused row's centre was above the box top 379.5 (centres 313–348; bottoms ≤ 371.8), and `elementFromPoint` returned the row, never the box;
   - a real Enter on the last row ("მელოდია") → clips 0 → 1, one Undo label.

**R15-P3** (`runs/p3-1440-288.txt`; pre-expand: no `style` attribute, `padding-bottom` 4 px, list/tree `scrollHeight` 637/451):
- **After ✕ and after a real Esc:**
  - computed `padding-bottom` 4 px and `scroll-padding-bottom` auto on both;
  - `scrollHeight` 637/451 (= pre-expand);
  - status `ვიდეო პატარა ხედს დაუბრუნდა.` verbatim;
  - **but the `nav` and the listbox keep an empty `style=""` attribute** (deviation 1, §8).
- **After ◀ then ▶:** while the library is a rail, the body is not rendered. After ▶, there is **no `style` attribute**, padding is 4 px and `scrollHeight` is 637/451. The status is the ◀ text, verbatim.
- **Temporary opening before placement** (`PENDING` line, read 20 ms after an expand click from the rail): expanded true, floating false, **no `style` attribute and 4 px on both**. 800 ms later: placed, 169 px on both.

**R15-E (1440×900, non-empty project, real keys; `runs/e-1440.txt`, `runs/e-quick-1440.txt`):**
1. **Exact round-14 repro:**
   - opened by a real click → focus on `დახურვა`;
   - `.focus()` on `[aria-label=Close]` → X;
   - real Shift+Tab → `WAV-ის ექსპორტი`; real Shift+Tab → `დახურვა` (`activeInDialog` true at every step);
   - real Enter → the dialog closes, `blobs` stays 0 (no render), detail 144 → 144, position `00:00.000`, Play unchanged, library and video unchanged.
   - Shot: `shots/export-focus-x-1440.png` (X focused).
2. **Full cycle from open (focus on `დახურვა`):**
   - real Tab ×8: WAV → X → radio → დახურვა → WAV → X → radio → დახურვა;
   - real Shift+Tab ×8: radio → X → WAV → დახურვა → radio → X → WAV → დახურვა;
   - `activeInDialog` true at all 16 steps.
3. **Tab from the X → radio.** X reached by a forward Tab ×2 from open, then a real Enter → the dialog closes and focus returns to the connected opener (the Export button). It also works when X is reached by Shift+Tab.
4. **R14-E quick:**
   - **E1:** with the video expanded, open by click → `დახურვა`; Enter closes; the video stays expanded and floating.
   - **E3:** a real Space on a dialog button (`WAV-ის ექსპორტი`, reached by Tab) activates that button, so a WAV is rendered. Position `00:00.000` and Play are unchanged, so the transport was not touched.
   - **E4** (re-run on a fresh open; the first attempt's click hit the still-open E3 dialog's backdrop): open by click, then a real Esc → the dialog closes, the video stays expanded, and focus is on Export.
   - **E5:** focus Export, real Enter, Tab to `WAV-ის ექსპორტი`, real Enter → RIFF/WAVE, format 1 (PCM), 2 ch, 48000 Hz, 24-bit, 4 864 896 frames = **101.352 s**. This equals the dialog's project end `01:41.352`; this session's project was one Middle East clip.
5. **Mid-render focus (sampled):** 50 ms after Enter on WAV, `activeElement` was the dialog wrapper, inside the dialog. After the render, it was `დახურვა`.

**Console:**
- The cumulative log has `ReferenceError: floatingVideoLibraryInsetPx is not defined` at 19:47:37Z. That was Vite HMR loading my intermediate `StudioWorkspace.tsx`: the primitives hook blocked the import edit once, after the usage edits had already landed. It happened during coding, before any post-code measurement.
- After `console --clear`, a fresh load and an expand / Esc / ◀ / temporary-opening / ✕ flow, the only errors are the known root `GET localhost:5199/api/cart` failures (backend down) (`runs/console-errors-final.txt`).

**G15-3 (anonymous):**
- **Direct load** (`runs/network-direct.txt`) and **header link** (visible `Studio Lab` link → `/studio-lab`, `localStorage.auth_user` null; `runs/network-headerlink.txt`):
  - no `/api/studio-token`, `/api/recording-*` or `/api/download` request, and no R2 host;
  - media only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`;
  - plus the known root `localhost:5199/api/cart` and GA collect.
  - The single `r2` grep hit in the header-link log is the Vite dev source module `/app/lib/r2.config.ts`, loaded by the home page's root bundle. It is not a request to an R2 host.
- `grep Authorization` in `app/components/arrangement/` and `app/lib/arrangement/*.ts` → 0.
- `curl` anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**. A fake Bearer → **500 `{"error":"Unable to prepare Studio access"}`**, no token (backend 5199 down; same as round 14).
- `/studio/middle-east` shows "Sign in required" (`runs/premium-anon.txt`).

**Not run by A** (C's §6 adjacent checks):
- R13-F2 quick from 8,450.5 (drag +200/+100, ⠿ ×3, the resize re-clamp, a second pointer, history);
- R13-F3 `isSameNode`;
- R13-F4 reduced-motion simulation in the browser;
- R11A-1 preview-stop;
- dock compact quick;
- RF7-P2. `render-budget.test.tsx` is green inside the 965, and its sha is unchanged.

## 6. Tests

**`panels.test.ts`: 44 → 53, 53/53.**
- Named exceptions (expected numbers changed by the new term):
  1. "places a narrow library box at left + 8 on the body bottom with width − 16 and a 16:9 height", second case `{0, 480, 217–700}` @1280. Before: `toEqual({8, 700−8−261, 464, 261})`. After: left 8, height ≈ 241.5, width ≈ 241.5·16/9 (429.33), top ≈ 700−8−241.5 = 450.5 (`toBeCloseTo` 10). The name was kept; its 288 case still matches it.
  2. "caps a short body by its height so the box fits between body.top + 8 and body.bottom − 8", `{0, 480, 255–520}`. Before: height 249, width 249·16/9, top 263. After: height 132.5, width 132.5·16/9, top 379.5. Bottom = 512 and left 8 are unchanged.
- Every other existing test is unchanged and green: the 640 cap, 272 at 288, the degenerate 160, the 300–1000 clamp, the non-finite cases and the viewport clamp.
- New `describe('floating video body-share cap and library inset (D-29f, C-R14-01)')`:
  - the constant is 0.5;
  - `it.each` over the four measured geometries with B's values (±0.01): 16:9, height ≤ body/2, bottom = body.bottom − 8, upper half free;
  - a tall body still capped by 640 and by library − 16;
  - the 160 minimum when half the body is < 90;
  - the inset helper returns height + 16 (169, 148.5, 257.5);
  - it returns 0 for null, NaN, Infinity, 0 and a negative height.

**`floating-video.test.tsx`: 39 → 45, 45/45. No existing assertion changed** (the 1440/288 fixture keeps 8,523 272×153). New tests:
- expanded → `nav` and listbox `paddingBottom` = `scrollPaddingBottom` = 169px; no `style` attribute before the expand;
- temporary opening → no `style` attribute while placement is pending; 169px after `flushFrames`;
- a drag and arrows do not change the inset (box at 224, +84);
- ✕ and Esc → `style.cssText === ''` and empty padding declarations. This asserts the real React behaviour; see deviation 1;
- ◀ then ▶ → no `style` attribute.

**`export-dialog-focus.test.tsx`: 13 → 18, 18/18.**
- Named exceptions (the first control is now the X):
  1. "wraps Tab from the last control …":
     - Tab from WAV: before → radio, after → **X**;
     - Shift+Tab: before from radio → WAV (prevented); after from **X** → WAV (prevented);
     - added: the radio is focused and Shift+Tab from it is not prevented.
  2. "skips disabled controls … (WAV disabled)":
     - Tab from დახურვა: before → radio, after → **X**;
     - Shift+Tab: before from radio → დახურვა; after from **X** → დახურვა;
     - added: the radio is focused and Shift+Tab from it is not prevented.
  3. "keeps focus inside the dialog while a WAV render …": Tab from the wrapper mid-render. Before → radio; after → **X** (the X is not disabled during a render).
  4. "sends Tab to the first control and Shift+Tab to the last … dialog itself": Tab from the wrapper. Before → radio; after → **X**. Shift+Tab → WAV is unchanged.
- New tests:
  - "keeps X → radio → დახურვა → WAV-ის ექსპორტი in DOM order and intercepts Tab only at the ends": strict identity order, and per control Tab/Shift+Tab `defaultPrevented` only at the wrap ends;
  - the exact C-R14-02 repro: Shift+Tab from X → WAV, inside the dialog, no export;
  - a render start and end do not steal focus from the X;
  - only Tab on the X: Enter is not prevented and reaches `document`; Esc is not prevented and closes the Modal;
  - the listener is removed on close: Tab and Shift+Tab dispatched on the detached content are not prevented, and focus stays on Export.

**Guard proof** (`a-round-15/guard-proof.txt`, script `scripts/guard.cjs`). Each mutation was temporary. A pre-guard copy is in `a-round-15/guard/`, and every restore was `IDENTICAL`. It was re-run on the final tests:

| Guard | Result |
|---|---|
| G1 remove the body-share term | 6 failed: both named-exception placement tests, three D-29f geometry cases (1440/480, 1280/288, 1280/480) and the 160 minimum case |
| G2 inset helper always 0 | 7 failed: the helper test, expanded inset, pending → placed, drag/arrows, ✕, Esc and ◀/▶ (the last three fail at the expanded precondition) |
| G3 Tab handler back on the wrapper (React `onKeyDown`), content listener removed | 6 failed: both wrap tests, mid-render wrapper Tab, wrapper Tab, the X cycle test and the exact C-R14-02 repro |
| G4 effect B's no-steal check uses the wrapper list | 1 failed: "does not steal focus from the X while a render starts and ends" |

## 7. Code-reviewer (actual `code-reviewer` subagent), two passes

**Pass 1** (full diff `a-round-15/diff-all.txt`, all changed files): "No critical issues. Score 9/10."
- (1) Low: two tests press Shift+Tab "from the radio" without focusing it. **Fixed** (`radio.focus()` plus an `activeElement` assertion).
- (2) Low: the cycle test only proved DOM order. **Fixed**: it now walks each control with Tab and Shift+Tab and asserts `preventDefault` only at the wrap ends.
- (3) Low: focus on `body` (for example after a scrollbar click) escapes the trap. This is pre-existing, and closing it needs a document listener, which the spec bans. **Documented** in doc 024 as a known limit.
- (4) Nit: rename the helper to `floatingVideoLibraryBottomInsetPx`. **Declined**: B's task names `floatingVideoLibraryInsetPx` explicitly.
- (5) Nit: the (h − 16) term is now dead for bodies ≥ 32 px. Kept, per spec; documented.
- (6) Nit: the 160 minimum makes the box taller than half the body below about 196 px. Documented; it is not reached in any measured case.
- The reviewer also verified: listener order (the capture-phase Export mark first, then the content listener, then React and the bubbling window handler's early return; no `stopPropagation`), effect order A → B → C, cleanup on the same captured element, the inset derived in render with no new state, and rule compliance.

**Pass 2** (fix delta, `a-round-15/review-fix-delta.txt`): "Both findings are fixed. The changed tests prove what they claim … no flakiness and breaks no project rules."
- Optional Lows: the test name overstated "walks", and `toEqual` on DOM nodes is structural. **Both applied**: the test was renamed to "keeps … in DOM order and intercepts Tab only at the ends", and the order check now uses `toBe` per element.
- Left as is: the test selector is narrower than the component's. There is no difference today, and the component's selector constant is not exported.

## 8. Deviations, each with its reason

1. **R15-P3 / §2.2 "no `style` attribute" after an in-place return (✕, Esc).**
   - What happens: React clears each style property when the `style` prop goes from an object to `undefined`, but it keeps an **empty `style=""` attribute**.
   - Proof: a jsdom probe before the tests (`A2 true ""`) and the browser (`runs/p3-1440-288.txt`).
   - Everything that carries the intent is met: no declarations, computed padding 4 px, `scrollHeight` equal to the pre-expand value, and texts verbatim. The first render and the ◀ → ▶ path have **no** attribute.
   - Why I did not fix it in code:
     - a `key` remount would lose list scroll and the focused row on expand and return, which is the flow this round fixes;
     - a `removeAttribute` effect is outside "the prop and two conditional inline styles only" and fights React's style bookkeeping.
   - Precedent: the dock box already leaves `style=""`, and C's R13-F3 check accepts it.
   - **B needs to rule:** accept `style=""` on the ✕/Esc paths, or name a mechanism. Until then the sub-check is listed under "not ready".
2. **Inset component tests are in `floating-video.test.tsx`**, not a new `library-inset.test.tsx`. The task allowed either; this file already has the mocked 1440/288 layout.
3. **Helper name kept as `floatingVideoLibraryInsetPx`**, against reviewer nit 4, because B's task specifies it.
4. **E3 Space** was pressed on `WAV-ის ექსპორტი`, which was reached by Tab, so Space correctly started a WAV render. The transport was untouched. Round 14 used `დახურვა`.
5. **E4** was re-run after the first attempt's click hit the still-open E3 dialog's backdrop ("not interactable"). Both logs are kept.
6. **The mechanism probe** was against the round-14 box (no code yet), so "above the box" was an inference from the 371.8 bound. R15-P2.4 measured it directly afterwards.

## 9. Not ready / open

- **R15-P3, sub-check "the tree `nav` and the listbox have no inline `style` attribute" after ✕ and after Esc:** not met literally (`style=""` remains). The same R15-P3 bullet after ◀ → ▶, and its padding, `scrollHeight` and status-text sub-checks, are met in A's run. B ruling requested (deviation 1).
- Everything else is A's evidence only, **pending C**: R15-P1, R15-P2, R15-P3 (rest), R15-E, R15-U, R15-Doc and G15-1..3.
- Not this round, still open or carried:
  - C-R6-02, C-R8-01 and RF7-3 (Tech Lead quiet Chrome);
  - C-R12-01 (RF5-3);
  - polish rounds 16–18;
  - the 21 regression-debt IDs;
  - Tech Lead manual checks (R11-P3m, R11-SB, R13-RM real `prefers-reduced-motion`).
- Root carry (from `root-pre-push-review.md`, `publication-checkpoint.json` and task §6.5; M1–M3 and L1–L4, L6–L8 are closed by C):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*` (Tech Lead);
  - portable instruction-file paths;
  - export hard-clip at 0 dBFS (R13-M4, SRW-13);
  - final commit/push only after everything;
  - the uncommitted round-6..15 tree;
  - the shared `Modal.tsx` focus gap (now also: focus on `body` escapes, review note 3);
  - root GA sends `scroll` with consent denied;
  - the two foreign agent files (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`) for root to decide.

## 10. Exact next C checks

1. **R15-P1:**
   - all four cases plus the temporary opening at 1280/288;
   - the box is fixed and 16:9;
   - width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9)) from live rects (±1); left and top per D-29f;
   - height ≤ body/2 + 1; inside the body;
   - hit-tests on ◀, search, separator and preview;
   - a real ◀ click with its text;
   - placeholder 160×90, dock 107, lanes and detail unchanged.
2. **R15-P2:**
   - the 1280/480 `soft` click → Enter repro (one clip and one Undo, box unmoved);
   - 1440/288 last two rows at max scroll;
   - all-row reachability per case with sh/ch and padding = box h + 16;
   - the 1280/480 ArrowDown walk and Enter on the last row.
3. **R15-P3:**
   - ✕, Esc, and ◀ → ▶: padding 4 px and `scrollHeight` back to pre-expand;
   - **the `style` attribute: expect `style=""` after ✕/Esc and none after ◀ → ▶ (deviation 1, B ruling)**;
   - the inset is 0 before placement on a temporary opening.
4. **R15-E:**
   - X `.focus()` → Shift+Tab ×2 → Enter (stays in the dialog, closes, no render, detail 144);
   - Tab ×8 and Shift+Tab ×8 sequences;
   - Tab from X → radio, Enter on X;
   - E1, E3, E4 and E5 (WAV length = session project);
   - mid-render focus sample.
5. **Adjacent:**
   - R13-F2 quick from 8,450.5 at 1440/480;
   - R13-F3/F4 quick;
   - R11A-1 quick;
   - dock compact;
   - RF7-P2 sha and green.
6. **G15-1..3** as in the task's §6.3. vitest is expected to be 965.
