# C round 173: V-3c-5b verification (D-29z138). Verdict: PASS

- **Date:** 2026-10-25
- **Verifier:** C
- **Baseline:** HEAD `3810816`, plus A's uncommitted round-173 worktree.
- **Browser:** real Playwright Chromium (headless) on `http://127.0.0.1:5173/studio-lab`, with a fresh context for every session, at 1440×900 and 1280×720.
- **Fonts:** fonts OK in every valid session (Instrument Sans, IBM Plex Mono and Noto Sans Georgian at 400 loaded, 0 non-200 font responses).
- **env-status:** store 200 (round 173, attempt 1).
- **browserVerified = realVerified = true.** Every browser row that can run in the cloud ran at both viewports. Only the fake-Bearer 403 is BLOCKED (backend unavailable in cloud).

## Rows
| Row | Result | Evidence |
|---|---|---|
| T173-TARGETED | **PASS**: 425/425, the same as A (`a-round-173/vitest-after.json` 425/425). OV1, PNR1, PNR2, PNR3a/b/c, PNR4, PNR5, TH1×3 and TS1 are present and green. `view.test.ts` (7+41), `navigation-strings-ui` (5) and `library-preview` (7) are green. | `c-round-173/out/vitest-c.json` |
| SOURCE-SCOPE | **PASS**: HEAD `3810816`. The 986 frozen files are OK at start and end. A's `end-sha256.txt` 7/7 OK at the end. `git status` shows 6 ` M` + 1 `??`. The protected diff against `3810816` is empty (routes, contexts, styles, ui, icons, `view.ts`, `strings.ts`, `StudioWorkspace.tsx`, `root.tsx`). The full tree hash at start equals the hash at end, so no source changed during C's phase. | `c-round-173/start-tree-sha256.txt`, `end-tree-sha256.txt` |
| AN-REVIEW | **PASS**: C read the diff itself. O1, O2, O3, S1 and S2 each change exactly one token (`rounded-sm` → `rounded-panel` or `rounded-md`). The clip bars (`rounded-xs`), playhead, handlers, aria, `data-*` and inline styles are untouched. L1 touches only the OV1 `it` (+2 `expect`s). L2 removes only the PNR2 title. No arbitrary value, no `min-w`, no `style=`. Doc 141 changes only l.4 (exact text) and l.82 (struck through). Doc 142 has the TEMPLATE sections (კონტექსტი, მიდგომა, probe, არქიტექტურა, ფაილები, პრობლემები, ტესტირება, TODO) and status `In Progress (awaiting C round 173)`. | `git diff 3810816` |
| RADIUS-V3C5B | **PASS** (tables below) | `out/c173-{1440-normal-2,1280-normal-1}.json`, `out/c173-*-crops-1.json` |
| OV-CORNERS (SABA-B-2) | **PASS**: no notch, no square corner, no double border | `shots/c173-*-crops-1/`, `shots/c173-*-o2clean/`, `shots/mag/` |
| NARROW-FRAME | **PASS**: the capsule is recorded as evidence for Saba | below |
| BOX-V3C5B | **PASS**: worst delta for root, overlay and frame against B's `probe-ov.json` is **0.00 px** in all six probe states at both viewports | `out/cmp-probe-173.json`, `out/probe-ov-173.json` |
| RV1-V3C5B | **PASS**: S0/S1/S2 at both viewports: 0 missing, 0 added, max delta 0. Contrast S0/S1: same counts, maxBox 0, identical failing set. d6 `fontBadAtExit` 0. | `out/rv1-v3c5b.json`, `out/d6/` |
| FUNC-SMOKE-V3C5B | **PASS** (below) | `out/c173-{1440-normal-2,1280-normal-1}.json` |
| G173-3 | **PASS** for the rows that can run here. `/studio-lab` opens anonymously (no `auth_user`, 0 cookies), with the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?product=middle-east&file=stem1.wav` returns **401** (`Please sign in to access Studio.`). Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud). | `out/g173-3.json`, `shots/g173-3-*.png` |
| PX-NET / REG-HYD | **PASS**: 16 C sessions plus the d6 sessions all had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise (2–3 per session) appeared. | `out/pxnet-173.json`, `d6 net.ok` |

## RADIUS-V3C5B (computed on the compiled class)
| Site | 1440 | 1280 | Border / bg / shadow |
|---|---|---|---|
| Overview root (O0–O3) | 10px ×4 | 10px ×4 | border 0, bg rgb(14,13,12), shadow none when not focused, `overflow-hidden` |
| Overlay | 10px ×4 | 10px ×4 | 1px solid rgb(36,33,30) (`border-outline`), transparent bg |
| Frame | 10px ×4 (computed) | 10px ×4 (computed) | 1px `foreground/70`, bg `foreground/5`, shadow none |
| Frame **used** radius, O1–O3 | 10 px (w 27.05 ≥ 20) | **9.30 px** (w 18.59 < 20, so CSS scales the radius by 18.59/20 = 0.93) | 4× crop diagonal estimate ≈ 9.4–11 px at the top corners |
| Overview clip bar | 2px (`rounded-xs`) | 2px | bg brand, no `rounded-panel` |
| Overview playhead | 0px | 0px | unchanged |
| Transport readout (T0) | **8px** ×4 | **8px** ×4 | border 0, bg rgb(14,13,12), shadow none; 4× diagonal ≈ 8.5 px |
| Preview wave W0 (not ready: `cursor-not-allowed`, opacity 0.4, `aria-disabled=true`, caught 132 ms after load in the browser) | **8px** ×4 | **8px** ×4 | border 0, bg rgb(14,13,12), shadow none |
| Preview wave W1 (ready) | **8px** ×4 | **8px** ×4 | same |
| `arrangement-exit` (real DOM testid present, `<a>`) | **6px** ×4 | **6px** ×4 | border 0, transparent bg, shadow none |

**Before-values:**
- From round 172 (C's D1 state): the Overview root and frame were 6px and the border/bg values were the same.
- From B's probe at `3810816`: 6px.
- There is no earlier C measurement of the readout or the wave, so they have no before-value. A radius change does not move boxes, and RV1 shows 0 delta.

## OV-CORNERS
These are 4× (DSF 4) crops of all four root corners in O0, O1 and O2 at both viewports, plus O2 again after blur, magnified ×16 in `shots/mag/`.
- **O0/O1:** the overlay's dim border follows the root's 10 px curve at every corner. There is no gap between the overlay and the root clip: the diagonal goes outside → border → interior with no root-background pixel before the border.
- **The left edge in O0/O1:** the Overview playhead (brass, 2px, `ring-1 ring-background`) sits at x = 0 and covers the frame's left border. It is clipped by the root's curve, so it looks like a curved brass edge with the dark playhead ring next to it.
  - This is the playhead's own ring, not a notch.
  - It is unchanged code.
- **O1 at 1280, with the frame scaled to 9.30 px:** the frame's arc sits inside the root's 10 px curve. There is no square corner, no light sliver and no double border.
- **O2 (frame flush right and running past the root):** the frame's own right corners are clipped by the root's 10 px curve. What you see is the frame's left arc meeting the root's dim curved border (`shots/mag/{1440,1280}-O2clean-{tr,br}-x16.png`). There is no square corner and no notch.
- **The bottom corners against the panel below** are closed, with no notch like the one in Saba's `saba-2026-10-25-overview-corners.png`.

## NARROW-FRAME (frame width / x; before-values = B's `probe-ov.json`)
| State | 1440 | 1280 | Δ vs `3810816` |
|---|---|---|---|
| O1 `clip_max_left` | x 300, w 27.05, used r 10 | x 300, w **18.59**, used r 9.30 (capsule) | 0.00 / 0.00 |
| O2 `clip_max_right` (probe click `ov.x+ov.width−2`) | x 1240.47, w 27.05 (11.5 px past the root) | x 1084.69, w 18.59 (7.3 px past the root, clipped) | 0.00 / 0.00 |
| O3 (frame dragged to the middle) | x 770.23, w 27.05 | x 692.34, w 18.59 | no before-value |

**What the browser showed:**
- The frame is present in every state and its border is continuous (`shots/c173-*-crops-1/O{1,2,3}-frame*.png`).
- At 1280 it is a vertical capsule. This is the accepted R25 trade-off, and Saba can still veto it.
- O2 running past the root is the pre-existing B-R172-OV-FRAME-OVERFLOW.

## BOX-V3C5B (raw rects, 0.01 px)
**Overview root, overlay and frame against B's probe:**
- `empty_default`, `empty_max`, `empty_min`, `clip_default`, `clip_max_left` and `clip_max_right` all differ by **0.00** at both viewports.
- Root: 1440 → 300, 118, 956 × 64; 1280 → 300, 156, 796 × 64.

**No before-value (recorded only):**
- Playhead: x 300, w 2, h 64.
- Clip bar: 1440 → x 300, y 136.5, 956 × 12.5; 1280 → x 300, y 174.5, 796 × 12.5 (in the probe sequence the clip landed at 00:00).

**T0 readout, both viewports:**
- Container: 154, 43, 227 × 32.
- Position: 166, 47, 90 × 24.
- End: 264, 53, 105 × 16.

**Preview wave (W1):**
- 1440: 12, 705, 264 × 32.
- 1280: 12, 525, 264 × 32.

W0's y is 8 px higher (713 / 517) while the library is still loading. This is a transient loading-state layout and has nothing to do with the radius.

These sites have no before-value of their own. Their page-level before-value is RV1 (0 delta).

## FUNC-SMOKE-V3C5B
A real mouse was used. `elementFromPoint` hits the target: the Overview centre hits `arrangement-overview`, and the wave hits `arrangement-library-preview-wave`.

| Check | 1440 | 1280 |
|---|---|---|
| Drag the frame (O2 → middle) | valuenow 100 → 50; ruler left −31394 → −15441; frame x 1240.47 → 770.23 | 100 → 50; ruler −31460 → −15474; frame x 1084.69 → 692.34 |
| Click at 25 % of the width | valuenow 50 → 24; the frame moves to the click | 50 → 24 |
| ArrowRight / ArrowLeft with the Overview focused | 0 → 5 → 0; `aria-valuetext` "Visible start 00:05.000 / 01:41.352"; ruler 512 → −1088 → 512 | same |
| Double-click | **Fit**: zoom 320 → 9 px/s; frame = whole root (x 300, 956 wide); valuenow 0 | Fit: 320 → 7.4 px/s; frame 796 wide |
| Readout during Space | 00:00.000 → 00:01.140 → 00:01.961; end 01:41.352 | 00:00.000 → 00:01.152 → 00:01.953 |
| Preview wave click at 1/3 (ready) | `aria-valuenow` 0 → 34 (00:34.286) | 0 → 34 (00:34.295) |
| Wave not ready (W0), real click at 1/3 | The audio fetches (`/middle-east.mp3` and `/videos/hero/hero-music.mp3`) were held for 90 s with `page.route`. The wave stayed `aria-disabled=true`, `cursor-not-allowed`, opacity 0.4, radius 8px ×4. `elementFromPoint` hit the wave. After the click, `aria-valuenow` stayed 0 → 0 and nothing played: **nothing happens**. | same (0 → 0, 8px); `out/c173-w0click-{1440,1280}.json`, `shots/c173-w0click-*.png` |
| Focus rings (keyboard modality, `:focus-visible` true) | Overview: 2px brass outline plus ring, following 10px. Wave: same, following 8px. Exit: 2px brass outline, following 6px (its `ring-2` box-shadow computes transparent; the outline draws the ring). | same; 4× crops in `shots/c173-*-crops-1/focus-*` |
| Tab reachability from body | wave 22nd Tab, Overview 26th, exit 68th | same |

**Double-click as at HEAD:** the handler is unchanged in the diff, and `view.test`/`navigation-strings-ui` are green. The browser observed Fit. There is no browser run at `3810816` for direct comparison.

## Notes for B (no new bugs in this round)
- **C-R173-N1 (info, pre-existing, not a regression):** a pure mouse click on the Overview (first interaction in a fresh context) shows the brass focus ring (`:focus-visible` true).
  - Cause: `ArrangementOverview.tsx` l.182 calls `event.currentTarget.focus()` in `pointerdown`.
  - The handler is unchanged this round. The ring now follows 10 px.
  - Evidence: `out/c173-{1440,1280}-o2clean.json` `pureMouseFocus`.
  - It is a product question whether mouse use should show the ring.
- **C-R173-N2 (info, pre-existing):** when the playhead is at 0, the Overview playhead covers the frame's left border (O0/O1). This is the stacking order, not the radius.
- **C-R173-N3 (info):** the `arrangement-exit` focus ring is drawn by the outline; its `ring-2` box-shadow computes transparent. `StudioWorkspace.tsx` is unchanged, so this is pre-existing.
- **Ableton parity:** not applicable. This is a CZABA brand decision; no claim is made about Live's Overview.

## Invalid or replaced runs (environment or harness, not findings)
1. `probe-ov-173` attempt 1: a cold-Vite first load (`arrangement-zoom` timed out at 1440). Replaced (ENV-FIRST-LOAD-LUCIDE). `out/probe-ov-173-attempt1-invalid.log`.
2. `c173-1440-normal-1`: a harness order error. The clip was added at a different zoom, so O1 was not flush-left, and the readout was tested on an empty project. Replaced by `-normal-2`; the `-1` output is kept.
3. d6 attempts 1–2: the copied d6 needed helper files (`lib122`, `h3`, `wav`, `report`) that were not copied yet. No browser run happened. They were copied unchanged from `c-round-172/tools`.

**Tool changes:**
- `probe-ov.cjs` was copied from B with only output names changed, plus playhead/bar fields in `m()`.
- `cmp-d6-173.cjs` has only its paths changed.
- `g173-3.cjs` has only output names changed.

## Gate rows (not C's)
full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
