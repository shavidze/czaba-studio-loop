# C round 232: verification of SABA-B-8 CALM-3 (quiet empty Overview, Ctrl+Alt+O, GATE229-S2)

**Verdict: PASS.** Every acceptance row of task §5 that can run in the cloud ran in real Chromium 143.0.7499.4 (Playwright) on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720.
- There are no new bugs against A's work.
- There is one **info/Low** test-headroom finding, C-R232-01 (A's L32 STOP, ruled below).
- TLM-R232-MAC is `blocked` (it needs a Mac).
- `browserVerified = realVerified = true`. Env: `env-status.json` round 232, store 200.
- C made no app edits, commits or deploys, and wrote only to `tmp/studio-real-loop/c-round-232*`.

Evidence folder: `c-round-232/`.
- `unit.log`, `unit-shuffle.log`
- `out/` (`c232.cjs`: empty state, toggle, negatives, first clip, undo, neighbours, sheet, caption, persistence)
- `out-cap/` (caption with a 249-character name)
- `out-e/` (`c232e.cjs`: auth guard and WAV)
- `out-g/` (`c232g.cjs`: Georgian layout key and AltGraph attempt)
- `bbox/` (with `delta.txt`), `inv/` (with `diff.txt`)

**Reproducibility notes:**
- After `out/` was produced, I added two env gates to `c232.cjs` (`ONLY=<steps>` and `NOFLOAT=1`). Without them it runs every step, as it did for `out/`.
- `out/` used a 98-character name for the owned synthetic webm (`media/clip-4s-vp9-opus.webm` from the loop folder). That name fits the caption box, so truncation was not exercised. I then renamed the same file to 249 characters and ran `ONLY=caption NOFLOAT=1` → `out-cap/`. `media/` now holds only the 249-character name.
- The `ringContrast: 1.11` field in `out/c232.json` is a **tool artifact**: `parseRgb` read `color(srgb 0.788 0.643 0.416 / 0.8)` as 0–255 values. The correct value, recomputed by hand, is in C-OVERVIEW-EMPTY: **5.45:1**.

## 1. Rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-232 | **PASS** | <ul><li>HEAD is `e5507ff`.</li><li>`git status`: exactly the 8 granted `M` and N1–N4 as `??`.</li><li>`sha256sum -c --quiet` gives rc 0 on `b-round-231-r232-tree-sha256.txt`, the root files and `a-round-232/changed-end-sha256.txt`.</li><li>Protected auth, purchase and download files plus `entry.server.tsx`: `git diff --quiet HEAD` gives rc 0.</li><li>`git diff` of the app hunks is exactly §2.1 (two strings after `followOn`), §2.2 (the `overview-toggle` row after `overview-scroll`), §2.4 (`hasClips`, conditional background, `data-overview-state`, OV1 line byte-identical in the full branch, baseline in the empty branch, `invisible` on the frame and playhead), §2.5 (`useSyncExternalStore` with server `false`, the `aria-hidden` h-16 slot, and the key branch after the floating-video Escape and before `const current`) and §2.6 (the caption row class).</li><li>N1 matches §2.3: in-memory value first, `false` on the server, `'1'` written or the key removed, silent try/catch.</li></ul> |
| C-UNIT-232 | **PASS** (+ info C-R232-01) | <ul><li>The covering set (`covering-files.txt`, 32 files) is **541/541 green**, rc 0.</li><li>N2 + N4 with `--sequence.shuffle`: 7/7, rc 0.</li><li>ST-C3, SC-C3, OV-E1/E2, OV-T1/T2/T4/T5 (N2) and OV-T3 (N4) exist (grep: 1 file each).</li><li>**Ruling on A's L32 STOP:** `render-budget` "Play → Pause → Play" took **2,620 ms (52 %) in my covering run**, against A's 2,594–2,790 ms, gate 231's 1,749 ms, and **1,485 ms (30 %) when the file runs alone**. A's control (HEAD app code, same load: 2,574 ms) shows this is load, not the CALM-3 diff. The row passes on its criterion ("green"). The headroom is filed as C-R232-01 (info/Low) for B.</li></ul> |
| C-OVERVIEW-EMPTY | **PASS** | **Both viewports, fresh context, 0 clips:**<ul><li>`data-overview-state="empty"` and root background `rgba(0, 0, 0, 0)`.</li><li>The only 1px-border element inside the Overview is the frame, at `visibility: hidden`. Child 0 is `arrangement-overview-baseline` with a 0 px border, and child 1 is the rows container.</li><li>Frame and playhead: computed `visibility: hidden`.</li><li>Baseline: 956×1 at y 181 (1440) and 796×1 at y 219 (1280). That is the Overview's bottom edge and full width (Overview 300,118,956,64 / 300,156,796,64), equal to B's baseline bbox.</li><li>**Pixels** (crop ±4 px): after, 0 bright px, 0 brass px, and exactly one full-width differing row (the baseline). Before (B's `probe/ov-empty-*`): 2,053 bright px and a filled frame rectangle in every row.</li><li>→ / ← on the focused Overview: `aria-valuenow` 0 → 5 → 0.</li><li>Double-click: status "Fit: the entire project is visible (00:10.000). X goes back."</li><li>Horizontal drag: 0 page errors.</li><li>**Keyboard ring** (library separator → Tab): focus-visible, solid 1px `#C9A46A` at 0.8, 2px offset. 2,000 brass px painted (`out/ring-kb-empty-*.png`). Composite over the dock `rgb(22,20,18)` gives a contrast of **5.45:1**.</li><li>**Mouse press:** outline none and 0 brass px (`ring-mouse-empty-*`).</li></ul> |
| C-OVERVIEW-FIRSTCLIP | **PASS** | **Both viewports.** After Enter (1 clip, Music, 00:00.000):<ul><li>`full`;</li><li>child 0 has a 1px `rgb(36,33,30)` (border-outline) border;</li><li>frame and playhead `visible`;</li><li>root `rgb(14, 13, 12)`;</li><li>1 bar rendered;</li><li>crop: 11,799 / 9,849 bright px.</li></ul>After Ctrl+Z: `empty`, baseline back, frame and playhead hidden. |
| C-TOGGLE | **PASS** | **Both viewports.**<ul><li>**Body:** default prevented. `arrangement-overview` is absent, and the slot (`aria-hidden="true"`) sits at the Overview's former bbox exactly (300,118,956,64 / 300,156,796,64). Dock (288,84,1152,107 / 288,122,992,107), caption row (y 98 / 136, 16 px) and scroller `clientHeight` (516 / 406) are identical to the shown state.</li><li>Status texts are exact, both ways. The key is `'1'`, then removed.</li><li>**Meta+Alt+O** also hides and shows.</li><li>**From the focused Overview:** it hides.</li><li>**With a clip:** it hides and shows (`hidden-S1-*.png`).</li><li>**Negatives**, each leaving the Overview shown and the key `null`:<ul><li>library search field (value stays `''`);</li><li>open shortcut sheet;</li><li>Ctrl+O;</li><li>Alt+O;</li><li>Ctrl+Alt+Shift+O;</li><li>Export dialog open;</li><li>during an Overview pointer drag.</li></ul></li><li>**Held key:** 12 keydowns (1 + 11 `repeat`) give exactly **1** toggle.</li><li>**Georgian layout** (CDP, `key='ო'`, `code='KeyO'`, Ctrl+Alt): it toggles both ways, default prevented.</li></ul> |
| C-TOGGLE-FOCUS | **PASS** | Both viewports, with the Overview focused, then Ctrl+Alt+O:<ul><li>`document.activeElement` = BODY;</li><li>the next Tab lands on `arrangement-video-expand`;</li><li>after a fresh hide, Shift+Tab lands on `arrangement-library-separator`.</li></ul> |
| C-TOGGLE-PERSIST | **PASS** | **Both viewports.**<ul><li>Hide, then reload: still hidden (slot present, key `'1'`). `layout-shift` entries: **0**.</li><li>**Flash:** the server HTML contains the Overview (snapshot "shown"). In the per-rAF trace, the SSR Overview had effective opacity 0 in every frame. The slot replaced it at 740 / 702 ms, before FCP (784 / 740 ms). **0 frames painted a visible Overview**, so there is no flash.</li><li>Showing it removes the key.</li><li>A fresh context shows the Overview, also while another context has it hidden.</li></ul> |
| C-UNDO-232 | **PASS** | Add (1 clip), toggle twice (1 clip), Ctrl+Z → 0 clips and status "Undo: Add — …". The toggle is not in history. Redo brings the clip back. Both viewports. |
| C-SHEET-232 | **PASS** | <ul><li>`?`, then searching "overview" lists `fit`, `overview-scroll` and `overview-toggle`.</li><li>The `overview-toggle` row reads "Show / hide the overview", with `kbd` `Ctrl+Alt+O`, under the heading "Zoom & view".</li><li>The sheet shows 44 rows, and the source (`STUDIO_SHORTCUT_GROUPS`, vite-node) has 44 in the same id order.</li></ul> |
| C-CAPTION-232 (GATE229-S4) | **PASS** | **Caption row, both viewports:**<ul><li>16 px with an empty caption.</li><li>With the 249-character name loaded through "Your own video" (L25 recipe): still 16 px. The caption is `nowrap` + `ellipsis`, `scrollWidth` 1651 > `clientWidth` 956 / 796, one line.</li><li>The Overview stays at y 118 / 156, shown and hidden.</li></ul>**Floating video with the Overview hidden:** expand works, and Escape returns it ("The video went back to the compact view."). The slot stays in place. |
| C-BBOX-232 | **PASS** | `bbox.mjs` S0 and S1 at both viewports against C round 231's `bbox-after.json` (the same HEAD before this diff). The only change is the **new** `arrangement-overview-baseline` (S0, the Overview's own child). Every other element is within ≤ 1 px, and the footer/scroller geometry is equal (`bbox/delta.txt`). |
| C-BUDGET-232 (L39) | **PASS** | The `inventory.mjs` text multiset at S0 and S1, both viewports, is **identical** to C round 231 (142/158/121/127 entries, 0 added, 0 removed; `inv/diff.txt`). The bboxes are unchanged too. So the persistent rows stay at round 231's counts: **1440 S0 5, 1280 S0 4**. The round removes paint (outline, frame, playhead) and adds none. The status messages appear only after the key press. |
| C-LESSON-232 | **PASS** | `lessons.md` l.25 holds L39 "Persistent screen text is a budgeted row…" (SABA-B-8 evidence). |
| G232-3 | **PASS** | <ul><li>`/studio-lab` returns 200, shows "Demo collection — no sign-in required", and `auth_user` is null, both viewports.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` with no header → **401**.</li><li>Fake bearer → 500 "Unable to prepare Studio access". Round 231 gave the same 500 (backend unavailable in the cloud).</li><li>No token issued.</li></ul> |
| LAB-SMOKE-232 | **PASS** | Add, then Export WAV at both viewports:<ul><li>"WAV created: 01:41.352, 24-bit · 48 kHz · stereo."</li><li>29,189,420 bytes = 44 + 4,864,896 frames × 6.</li><li>101.352 s.</li><li>RMS −65.21 / −21.59 / −21.54 dB (0–0.05 / 0.05–0.10 / 1–2 s), whole file −15.29 dB.</li></ul>This equals C round 231 exactly. 0 page errors. |
| AN-REVIEW-232 | **PASS** | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 232 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every cited id exists in the tests (OV-E1/E2, OV-T1…T5, with OV-T3 in N4; ST-C3, SC-C3, OV1, PNR4, DXC4, TH5, SC1, SC5, ST17). The MU-* ids are A's mutant labels.</li><li>The slot reason, the focus ruling and the AltGr limit are stated (l.42–51).</li></ul> |
| C-REF-232 | **PASS** | See §2. |
| C-SHOTS-232 | **PASS** | <ul><li>Before: B's `b-round-231/probe/S0-*`, `S1-*`.</li><li>After: `out/S0-*`, `out/S1-*`, `out/hidden-*` (S0 hidden) and `out/hidden-S1-*`, at both viewports.</li><li>Plus crops (`ov-empty-*`, `ov-clip-*`, ring crops), `caption-long-*`, `out-cap/caption-long-hidden-*` and `float-hidden-*`.</li></ul> |
| TLM-R232-MAC | **BLOCKED** | Needs a Mac. Meta+Alt+O was exercised in Linux Chromium and works, but that is not a Mac check. |
| Gate rows | `gate` | Full vitest, typecheck, build, lint, verify, e2e smoke: not claimed. |

**§6 neighbours (with a clip, both viewports):**
- Click outside the frame re-centres (`aria-valuenow` 2 → 81).
- ↔ drag scrolls (81 → 29 / 25).
- ↕ drag zooms (frame 94.7 → 114.1 px).
- Double-click runs Fit (0 / 101).
- Space on the focused Overview plays (Pause shown).
- `?` opens the sheet, Ctrl+Z/Redo work, and Escape returns the floating video.
- I did not separately re-probe Ctrl+←/→, G, A, U, M or 1/2/3. The new branch returns only on `code === 'KeyO'` with Alt plus Ctrl or Meta, so those keys cannot reach it. This is an inference, not a browser measurement.

## 2. Reference conformance (separate from the CZABA requirement)

| # | CZABA result | Ableton conformance |
|---|---|---|
| R1 role / outline with clips | Observed: the view frame and outline show once a clip exists | Confirmed (manual 6.1, per B's §3) |
| R2 gestures | Observed: with clips, re-centre, ↔ scroll, ↕ zoom and double-click Fit; when empty, arrows, Fit and drag still work | Confirmed for drag and double-click; click-centre and ←/→ are earlier CZABA choices |
| R3 Ctrl+Alt+O / Cmd+Option+O | Observed: Ctrl+Alt+O and Meta+Alt+O in Chromium, and the Georgian layout through `code` | Confirmed (42.1); the Mac row is blocked |
| R4 discoverability | Observed: the sheet row is in "Zoom & view", plus a one-time status | Deviation D3 is listed (status) |
| R5 empty look | Observed: hairline only | No reference (D1) |
| R6 remembered | Observed: per browser, survives reload, not across contexts | Not confirmed (CZABA/Saba) |

D1–D6 are listed in the task. I saw no unlisted difference. **D5 (AltGr ignored) is verified in jsdom only.** Playwright on Linux Chromium cannot produce the `AltGraph` modifier state (`out-g/c232g.json`: `ag:false`, and the keydown carried no Ctrl/Alt). Suggestion: a Windows AltGr layout check next to TLM-R232-MAC, plus the Firefox check from A's reviewer (L5).

## 3. Findings and info for B

- **C-R232-01 (info/Low, test infra; A's L32 STOP).** The frozen test `render-budget.test.tsx` › "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play" runs at its default 5,000 ms timeout and needs:
  - 2,620 ms (52 %) in the 32-file covering run;
  - 1,485 ms (30 %) alone;
  - 1,749 ms at gate 231.

  The extra time comes from parallel load and is not caused by this diff (A's HEAD-app control: 2,574 ms). It passes every time. Suggestion: grant a `{ timeout }` on that describe (or split it) in a later round. It does not block CALM-3.
- **N1 (info).** The empty baseline uses `bg-outline` `rgb(36,33,30)` on the dock `rgb(22,20,18)`: **1.15:1**. That is deliberately "quiet" (Saba decision 3) and the same token the old outline used, but in the empty state it is the slider's only visual boundary. Focus is covered by the 5.45:1 ring. Recorded for the design review, not a bug.
- **N2 (info).** After an Undo back to 0 clips, the hidden frame keeps its last position (x 479.9, `aria-valuenow` 2 of max 10). It is invisible, so there is no user-facing effect.
- **N3 (info, A's known gap).** There is no cross-tab `storage` sync, and the toggle still fires while a `role="menu"` has focus. Neither is in the spec.

## 4. Outcome for B
CALM-3 meets every runnable C row. If the gate passes, SABA-B-8 "Calm Studio" can be marked complete, with TLM-R232-MAC (and the suggested AltGr / Firefox check) on the Tech Lead list. Carry C-R232-01 as a bounded test-headroom item.
