# C round 171 — V-3c-4c-3 verification (D-29z136)

**Verdict: PASS.** browserVerified = realVerified = true. Every acceptance row of §4 was run in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720, in fresh contexts. Two **pre-existing Low** findings were recorded; neither was caused by this round's class edits (→ `deferred_low_polish`). The Fake-Bearer 403 check is BLOCKED (backend unavailable in cloud).

Env: `env-status.json` round 171, store 200. All measured sessions loaded fonts (`fonts.ok` true) with 0 non-200 font responses.

## Rows

| Row | Result | Evidence |
|---|---|---|
| T171-TARGETED | PASS: 282/282 on `a-round-171/vitest-files.txt` (A: 282/282). ESU1, ECR1, VFR1, HE1–HE6, FS1, LVD1, VDS1–VDS3, TH11 and TS1 rows are present and green. | `c-round-171/out/vitest-c.json` |
| SOURCE-SCOPE | PASS: HEAD fe6ea99. The frozen 984 files are OK at start and end. The end hashes equal `a-round-171/end-sha256.txt`. `git status` = 5 ` M` + doc 140 `??`. The protected diff is empty (purchase/auth routes, contexts, styles, ui/Modal, icons, root, MarkerRow, Transport, strings, studio-lab, collection). The whole tree is byte-identical between C start and C end (990 files). | `c-round-171/{start,end}-tree-sha256.txt` |
| AN-REVIEW | PASS (C read the diff). Details below. | `git diff fe6ea99` |
| SURF-V3C4C3 | PASS at both viewports | `out/surf/surf-*.json`, `shots/surf/` |
| BOX-V3C4C3 | PASS: max 0.00 px on every probe site in E0, E1, V0 and V1, at both viewports | `out/box-v3c4c3.json` |
| CONTRAST-V3C4C3 | PASS: every enabled control is ≥ 4.5:1 at rest and on hover; cards and dock equal B's `before` values | `out/box-v3c4c3.json` (contrastDiff = []) |
| RV1-V3C4C3 | PASS: 0 missing / 0 added keys in S0, S1 and S2, max delta 0, and the failing-contrast set equals the c-round-170 reference at both viewports | `out/rv1-v3c4c3.json`, `out/d6/` |
| FUNC-SMOKE-V3C4C3 | PASS at both viewports | `out/func/func-{1440,1280}-1.json`, `shots/func/` |
| G171-3 | PASS. The Fake-Bearer 403 part is BLOCKED (backend unavailable in cloud). | `out/g171-3.json` |
| PX-NET / REG-HYD | PASS: 44 sessions (40 surf/func, 2 d6, and the g171-3 contexts) with 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The only noise is the expected cart noise. | the surf/func JSON `netRaw` |

### AN-REVIEW
- **`ArrangementExportDialog.tsx`:** 9 lines change, class strings only.
  - **Cards (6):** `rounded-sm` → `rounded-md` only.
  - **Cancel and Done:** `border-outline` and `hover:border-outline-hover` are replaced by `border-transparent` + SURF + MOTION + `rounded-md`. Each has exactly one border colour. Done keeps `disabled:opacity-40`, and Cancel has no `disabled:` token.
  - **Export:** `border-brand font-medium` stay. `bg-brand` and `text-brand-foreground` are gone; FILL, `text-brand`, MOTION and `rounded-md` are added.
- **`ArrangementVideoDock.tsx`:** the radius changes on l.60 and l.911 only. l.901 and l.920 are untouched.
- **Arbitrary values:** the only ones are `[background-color,color]` and `[cubic-bezier(0.2,0.8,0.2,1)]`, three times each (within the 4 MOTION tokens).
- **Nothing else changed:** no text, aria, role, title, handler, size, gap or padding change.
- **Tests:** add-only (0 removed lines in `app/lib`). `expect(` counts are 47 → 61 and 44 → 48.
- **Doc 139:** only l.4 and the struck l.100 TODO changed. **Doc 140** exists with the template sections and status In Progress.

## SURF (computed, shipped classes, no DOM swap)

| Site | Viewport | Border-top | Radius | Rest bg / contrast | Hover | Active (held, released inside the dialog) | Transition | Reduced motion |
|---|---|---|---|---|---|---|---|---|
| Done (E1, enabled) | 1440 / 1280 | transparent, 1 px | 8 px ×4 | rgb(33,31,28) / 13.24 | rgb(39,36,34) / 12.35 | rgb(48,46,43) / 10.93 | `background-color, color 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)` | `none` |
| Cancel (E2, rendering) | 1440 / 1280 | transparent, 1 px | 8 px | rgb(33,31,28) / 13.24 | rgb(39,36,34) / 12.35 | rgb(48,46,43) / 10.93 | same | `none` |
| Export (E1, enabled) | 1440 / 1280 | rgb(201,164,106), 1 px | 8 px | rgb(33,31,28), text brand rgb(201,164,106) / 7.05 | rgb(39,36,34), text brand / 6.58 | rgb(48,46,43) / 5.82 | same | `none` |
| Done, disabled (E2) | both | transparent | 8 px | opacity 0.4 / 3.27 (info) | n/a | n/a | same | `none` |
| Export, disabled (E0) | both | brand | 8 px | opacity 0.4 / 2.26 (info; B 2.26) | unchanged (disabled) | n/a | same | `none` |
| Cards (E0, E1, E2) | both | WAV/project brand; others rgb(36,33,30) | 8 px | selected 12.56; unselected 14.78; video and range 5.38 (= B before) | MP3 card hover unchanged (no hover token, as before) | n/a | unchanged | n/a |
| Dock expand/drag/close (V0, V1) | both | n/a (0 px) | 8 px ×4 | rgb(14,12,12) / 7.09 (= B) | text rgb(236,230,218) / 15.68 (= B) | n/a | global 150 ms (as planned, R18) | n/a |
| Placeholder Return (V1) | both | n/a | 8 px | 15.62 (= B) | rgb(29,26,23) / 13.94 (= B) | n/a | global 150 ms | n/a |

- **Fill against its surface:** 1.12 on Done, Cancel and Export at both viewports (B: 1.12). This is the known GATE167-WCAG-1411-FILL trade-off and is informational only.
- **How Cancel was caught (E2):** the project had 21 clips (demo-middle-east on Music, Stems and SFX, plus 6× Ctrl+D on each). Cancel was caught 2–6 ms after a real-mouse Export click, and the render lasted ≈ 4 s.
- **4× crops** (`shots/surf/crop4x-*`):
  - footer rest/hover (E1), the disabled footer (E0), Cancel at rest and on hover (E2), the format and scope cards;
  - the Export focus state: the ring-2 sits flush on the brand border and reads as a thicker brand outline, distinct from rest (reviewer L4; not new);
  - the float buttons over a **real video frame** in V1 (SMPTE-style colour bars).
- **Dock legibility over the video:** the icons stay legible, but `bg-background/80` lets saturated colour through (magenta and cyan tint). Rough estimate: muted icon vs background/80 over pure white ≈ 4:1, over magenta ≈ 5:1, so above the 3:1 non-text threshold. These colours are pre-existing and unchanged by R18; recorded for Saba's veto.

## BOX (getBoundingClientRect vs `b-round-170/out/v3c4c3-probe.json` before.*, exportLook runs)
- **Delta:** 0.00 px on every site: E0 and E1 (Done, Export, 6 cards), V0 (expand, box) and V1 (expand, drag, close, Return, box, placeholder), at 1440 and 1280.
- **Cancel (E2, no baseline):** 1440 [693, 759.5, 77, 38]; 1280 [613, 629, 77, 38].
- **Footer during the render:**
  - Done keeps 69×38 and Export keeps h 38.
  - Export becomes 112 px wide (113 in E1) because its label changes to "Rendering…". This is a text change and predates the round; the classes do not affect width.
  - At 1440 the footer also moves down 31.8 px once the progress label appears: see C-R171-02.

## CONTRAST
- **Enabled controls:** Done 13.24 / 12.35, Cancel 13.24 / 12.35, Export 7.05 / 6.58 (rest / hover). All are ≥ 4.5 and equal B's after values.
- **Cards and dock:** they equal B's before values exactly (contrastDiff = []).
- **Disabled:** informational (Done 3.27 at opacity-40, Export 2.26).

## RV1 (d6.cjs unchanged, sha 3abc88fe…, through d6-fontwrap; one run per viewport)
| Viewport | S0 | S1 | S2 | contrastS0 failing | contrastS1 failing |
|---|---|---|---|---|---|
| 1440 | 111 = 111, max 0 | 122 = 122, max 0 | 131 = 131, max 0 | 7 = reference | 3 = reference |
| 1280 | 103 = 103, max 0 | 121 = 121, max 0 | 130 = 130, max 0 | 7 = reference | 3 = reference |

## FUNC-SMOKE (real mouse at centre, elementFromPoint hit = true for every click)

**Export (E1, WAV):**
- One real `czaba-studio-lab.wav` download, 29,477,420 B: RIFF/WAVE, PCM 24-bit, 48 kHz, stereo.
- Duration 102.352 s = project end 102.352 s (Δ 0).
- Peak 1.0, RMS 0.171, NaN 0. The first 0.95 s are silent (the clip starts at 1 s); the 1.5–60 s window is non-zero.
- Status: `WAV created: 01:42.352…`. The app also warned "Overload … 14 samples clipped", which is the demo mix at 0 dB; that is a pre-existing export behaviour, not this round.
- Same at both viewports.

**Cancel (E2):**
- Clicked at "Rendering · 4%".
- The status reads exactly `Export cancelled — no file was created.` No download arrived in 5 s. Done is enabled again, Cancel is gone, and the Export label is back to "Export WAV".
- Focus lands on Done (inside the dialog). Same at both viewports.

**Done:** the dialog closes, and focus is on the transport "Export" button (outside the dialog) at both viewports.

**Cards:** clicking the MP3 card checks MP3, gives it the brand border and a 10 % brand fill, and the Export label becomes "Export MP3". Clicking WAV restores everything.

**Dock** (real `beeps-6s-h264-aac.mp4`):
- Expand: the box becomes `position: fixed`, and the placeholder and Return appear.
- Drag + ArrowRight: dx = 16, dy = 0.
- Playback: Space → the floating video `currentTime` goes 0 → 1.469 s (1280: 1.467 s) with the playhead at 1.483. After the pause it stays at 1.483.
- Close: back to compact, and focus is on `arrangement-video-expand`.
- Return and Escape: back to compact, with focus on Expand video.
- Same at both viewports.

## Findings (to B)

**C-R171-01 (Low, pre-existing, `Modal.tsx` protected): pressing inside the Export dialog and releasing on the backdrop closes the dialog.**
- **Steps:** open Export, press on Done (or another dialog button), drag onto the backdrop, release.
- **Cause:** Chromium dispatches `click` to the common ancestor, which is the backdrop, so `handleBackdropClick` (l.83, `target === currentTarget`) closes the dialog.
- **Scope:** reproduced at 1440 and 1280. During a render it does not close, so there is no data loss.
- **Usual fix:** close only when the pointer went down **and** up on the backdrop.
- **Evidence:** `out/func/func-*-1.json` `A.pressDoneReleaseBackdrop`, `C.renderPressReleaseBackdrop`.

**C-R171-02 (Low, pre-existing): at 1440×900 the Export dialog footer moves down 31.8 px about 220 ms into a render.**
- **What happens:** the move starts when the progress label appears. Cancel goes from y 759.5 to 791.3, so a pointer resting on it loses `:hover` and a quick click misses. There is no shift at 1280×720 (y 629 stays).
- **Not from this round:** the class edits do not affect height (BOX 0.00 px in E0/E1).
- **Evidence:** `out/surf/surf-1440-3.json` `states.E2-rendering.hoverSeries` vs `surf-1280-1.json`.

## Ableton parity
Not applicable. This is a CZABA brand decision (`visual-direction-a.md`); no Live behaviour is claimed. The CZABA requirement is met (rows above).

## Notes / invalid runs
- **warm.cjs:** the warm-up load had a cold-Vite "Invalid hook call" pageerror (ENV-FIRST-LOAD); it is not a measured session.
- **surf-1440-1:**
  - Its rest values are valid and are the BOX source.
  - Its hover/active harness released on the backdrop, which closed the dialog (C-R171-01, so E1 Export HA was null), and its Cancel hover was lost to C-R171-02.
  - Hover/active come from surf-1440-2/-3 (identical rest values).
- **c171-e2try.cjs runs:** timing experiments for the E2 recipe only.
- **Downloaded WAV files:** deleted after parsing, to save space; sizes and parse results are in the JSON.
- **Tool disclosure:**
  - `c171-surf.cjs` on disk is the final version. surf-1440-1 came from the first version (release at (2,2) on the backdrop, no hoverSeries) and surf-1440-2 from the version without the y trace; the rest values are identical.
  - `c171-surf.cjs` reuses B's `DLG`/`DOCK` site table and `measureSites` verbatim from `v3c4c3-probe.cjs`.
  - `cmp-d6-171.cjs` is `cmp-d6-170.cjs` with its paths shifted.
  - `g171-3.cjs` is `g170-3.cjs` with the output names changed.
  - `d6.cjs` was copied unchanged.
- **Not re-run:** the rows listed in task §4 as not re-run.
- **Gate rows:** these belong to root's gate.

## Routing for B
The task status is PASS: every §4 acceptance row passed. C-R171-01 and C-R171-02 are pre-existing Lows outside the §1 edited lines, so under the 2026-10-23 bug gate they go to `deferred_low_polish`. Under §7 "C PASS", V-3c-4c-3 → მზადაა and round 172 = V-3c-5, unless the regression round is due or the checkpoint answer is "extract".
