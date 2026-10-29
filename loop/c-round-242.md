# C round 242: verification of SABA-B-11b-FIX-2 (C-R241-01, focus return after a mouse-opened grid menu)

**Verdict: PASS.** Every round-242 acceptance row passed in real Chromium at 1440×900 and at 1280×720. Each row used a fresh context, and there were 0 page errors.

**One Medium bug, C-R242-01, is open but did not fail the round.**
- It is pre-existing and lies outside this round's grants, so no acceptance row covers it.
- It confirms A's source-only finding A-R242-REVIEW-M1 in the browser.
- B must schedule it. It is Medium, so the 2026-10-23 bug gate does not let it be deferred.

**Flags and scripts:**
- `browserVerified: true`, `realVerified: true`.
- Script: `c-round-242/c242.cjs`. Its helpers are copied from `c-round-241/c241.cjs`, and the rows `focus`, `focusClip`, `reposition`, `marquee`, `faderInfo` and `spot` are new.
- Data: `c-round-242/out/c242.json` and 22 screenshots in `c-round-242/out/`.
- Before the run, C warmed the dev server with one page load (ready in 2.1 s). No attempt was environment-invalid.

## Rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-242 | PASS | <ul><li>HEAD is `04c2a5b`.</li><li>`git status` equals `b-round-241/git-status-at-planning.txt`: 14 `M` paths and nothing else.</li><li>`sha256sum -c` on the tree list (1,101 files) gives rc 0. The root files give `git diff --quiet HEAD` rc 0, and so do the 7 protected files. Each of the 7 appears once in the frozen list.</li><li>The saved round-241 copies `StudioWorkspace.r241.tsx` and `grid-snap-menu.r241.test.tsx` match the start hashes.</li><li>C applied `b-round-241/precheck-scratch.diff` to those copies (rc 0). The result is **byte-identical** (`cmp`) to the working files.</li><li>`StudioWorkspace` against r241 shows exactly 3 hunks: the ref, the request read/fallback, and the right-press capture (`out/sw-vs-r241.diff`).</li><li>The test file shows 0 removed lines and 75 added (`out/gsm-vs-r241.diff`).</li><li>`origin` appears 0 times in the new hunks.</li></ul> |
| C-UNIT-242 | PASS | `b-round-241/covering.txt`: **61 files, 1,077/1,077 green** in 125.9 s (`c-round-242/covering.log`). The 43 tests of `grid-snap-menu` include GM36–GM39. |
| C-MUT-242 | PASS | Run on the scratch copy `/tmp/c242-scratch`, deleted afterwards. <ul><li>MU-NO-PRESS-CAPTURE (the `button === 2` block deleted): **GM36, GM37 and GM39 red**, 40 pass.</li><li>MU-PRESS-WINS (`pressFocus ?? (active instanceof HTMLElement ? active : null)`, the type-correct form): **GM38 red**, 42 pass.</li><li>Repo `git status` is identical before and after (`git-status-{before,after}-mutants.txt`).</li></ul> Logs: `mu-*.log`. |
| C-FOCUS-242 | PASS | Tab ×30 to the Snap toggle, then a right-click on an empty lane point (hit-test). At both viewports: <ul><li>**(a) Escape:** the menu closes, the grid is unchanged (`1`, adaptive), and `activeElement` is the Snap toggle. `:focus-visible` is true, with an outline of `solid 1px` brass at 0.8 (`color(srgb .788 .643 .416 / .8)`, offset −2px). **Painted:** in a crop of the 41×24 toggle box, 103 pixels are brass, 86 of them on the 4 px edge band. After a mouse choice (no ring) the same crop has 17 brass pixels (the label) and 0 on the edge (`ring-pixels.cjs`, `out/ring-pixels.json`, `out/ring-*.png`).</li><li>**(b) `0.5 s`:** fixed `0.5`, status `Grid: 0.5 s (Snap off)`, focus on the Snap toggle. `:focus-visible` false (info).</li><li>**(c) `Narrow`:** adaptive `0.5`, status `Adaptive grid — Narrow, now 0.5 s`, focus on the Snap toggle. `:focus-visible` false (info).</li><li>**Extra case:** on an empty point of the music lane, Escape also returns focus to the Snap toggle.</li></ul> The event log shows the bug's cause and the fix working: `pointerdown/mousedown active=snap`, then `out:snap`, then `contextmenu active=BODY`, then `in:Medium`, then `in:arrangement-snap-toggle`. Screenshots: `focus-*.png`. |
| C-FOCUS-CLIP-242 | PASS | <ul><li>Setup: the 120 BPM seed (`demo-synth-mix`), then Tab to the Snap toggle.</li><li>The click point is inside the clip `[data-clip-id]`, below its header, on a non-focusable `DIV.cursor-text` (the clip root has no `tabIndex`).</li><li>The grid menu opens in the GM2 shape: "Adaptive grid" with 5 items and "Fixed grid" with 7 s + 6 musical, and the only checked item is Medium.</li><li>After Escape, `activeElement` is the Snap toggle, with `:focus-visible` and a brass outline, at both viewports.</li><li>The log shows the same blur → BODY → fix path.</li></ul> Screenshots: `focus-clip-*.png`. |
| C-MENU-REG-242 | PASS | <ul><li>**Reposition:** a second right-click outside the menu (x 692) closes it, and focus goes back to the Snap toggle. Then `contextmenu` reopens the menu at the new point (box x 1292 → 692), with focus on Medium. The final Escape returns focus to the Snap toggle at both viewports. Note that the window-capture `pointerdown` stops the lane handler, so the return target is taken from `active` (Snap) at `contextmenu`.</li><li>**Swallow:** with the menu open, the first click on Play closes the menu and nothing plays. The second click plays.</li><li>**Choose while playing:** choosing `0.25 s` keeps playback going. The playhead moves 1.631 → 2.133 s (1440) and 1.610 → 2.112 s (1280). Master RMS is 0.042 and 0.056. The division becomes `0.25`.</li><li>**Header:** a right-click on a track header opens no grid menu, and `defaultPrevented` is false.</li><li>**Marquee:** after `demo-stem-pulse` and a click on an empty lane, the clip is unselected. A left-drag that starts on the lane body draws `arrangement-marquee`, and the clip is selected afterwards, at both viewports (`marquee-drag-*.png`).</li></ul> |
| C-2A-SPOT-242 | PASS | Both viewports: <ul><li>The groups are "Adaptive grid" (5 items) and "Fixed grid" (7 items without a BPM), with one check, Medium, and focus on Medium.</li><li>`4` gives `Snap on — grid 1 s (G)`, and `4` again gives `Snap off — free movement (G)`.</li><li>The AX description is `Grid 1 s · 1 — narrower, 2 — wider · Adaptive: follows zoom — 5 for fixed`.</li><li>There is no `(G 4)` or `(4)` in the DOM.</li></ul> |
| C-BUDGET-242 | PASS | Empty 85/69 and demo 101/85 (1440/1280). The line-set diff against the c239 reference inventory, which round 241 also used, is empty both ways. |
| AN-REVIEW-242 | PASS | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>The l.1 title says `(ეტაპები 1 და 2a)`.</li><li>R6 ends `ეტაპი 2a (round 241): plain `4` + `G``, and R8 ends `ეტაპი 2a (round 241)`.</li><li>l.300 has `ეტაპი 1: covering set (39 ფაილი)`.</li><li>The Problem → Solution paragraph for C-R241-01 is at l.255.</li><li>The testing line (l.297) names GM36–GM39 and both mutants.</li><li>The changed-files list has `grid-snap-menu.test.tsx` (GM36–GM39).</li><li>Every GM cited exists: GM1 (pre-existing text) and GM36–GM39.</li><li>**Gap:** there is no round-241 snapshot of the doc, so the grant's "nothing else" cannot be isolated. The diff against HEAD (+116/−13) includes round 241's edits. The 7 listed edits are present.</li></ul> |
| LAB-SMOKE-242 | PASS | <ul><li>Space plays (0 → 0.87) and Space pauses (0.89 stays 0.89).</li><li>Export WAV: 48 kHz, 24-bit, 2 ch, 768,000 frames = 16.000 s, −24.91 dB RMS, peak 0.2967, 0 NaN.</li><li>sha256 `1fea093b…3f94` at both viewports, the same as rounds 237–241.</li><li>0 page errors.</li></ul> |
| Auth | PASS | <ul><li>A fresh context opens `/studio-lab` with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401 `Please sign in to access Studio.`</li></ul> |
| Purchased origin (browser) | BLOCKED | The backend is unavailable in the cloud. `origin` appears 0 times in the new hunks. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke are not claimed. |

## C-R242-01 (Medium, pre-existing): a focused fader loses focus to BODY after a right-click grid menu

- **Steps:**
  1. Open `/studio-lab` and add `demo-stem-pulse`.
  2. Tab from BODY to the track-header Volume range (19 Tabs: `Volume — Original video sound`).
  3. Right-click an empty lane point, then press Escape.
- **Expected:** focus goes back to the fader (L47; the WAI-ARIA menu pattern).
- **Actual:** `activeElement` is BODY at both viewports. The order is:
  1. `pointerdown[b2]` with `active=INPUT`;
  2. `focusout INPUT`, **before** `mousedown`;
  3. `mousedown` with `active=BODY`;
  4. `contextmenu` with `active=BODY`.
- **Cause:** `releaseEditFocusOnTimelinePointerDown` (`onPointerDownCapture`, no `event.button` check) blurs the range input in the capture phase. That happens before the lane's bubble handler stores `gridMenuPressFocusRef`, so the press capture records BODY. This is A-R242-REVIEW-M1, now browser-confirmed.
- **Origin:** this round did not cause it. That function is frozen and byte-identical to round 241. C did not re-measure it at HEAD in the browser. Its being pre-existing rests on the source and the frozen hash.
- **For B:** a ruling is needed. One option is that a right press skips the edit-focus release (`button === 0` gate). The other is that focus returns to the released element. The same probably applies to typing fields, loop braces and markers (source; not each measured).
- **Evidence:** `out/c242.json` → `faderInfo@*`.

## Ableton comparison

This is a bug-fix round (focus management), so the reference-first rule does not apply. The focus return follows the WAI-ARIA menu pattern. Round 241's M1–M10 Ableton rows are unchanged and were not re-judged. CZABA requirement: met. Ableton match: does not apply.

## Notes for B
1. **C-R242-01:** above. It is not deferrable (Medium).
2. **Ring after Escape:** an inset outline (offset −2px), 1px brass at 0.8. Recorded only; the SABA-B-4 style is unchanged.
3. **L47:** it is present in `lessons.md` (l.28), amended with the real event order (right `pointerdown` → blur to BODY → `contextmenu`) and the browser `document.activeElement` record.
4. **Recipe target:** the recipe's first empty point is on the video lane (`arrangement-video-dropzone`). C added a music-lane case, and it passes.
