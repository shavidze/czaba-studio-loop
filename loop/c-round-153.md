# C round 153: VISUAL-A V-2b-1 label typography (D-29z118), independent verification

Verifier C · 2026-10-25 · Tree: HEAD `ff2fd6c` + A's round-153 working tree (`a-round-153/end-sha256.txt`, 9 ` M` + 1 `??`) · Target `http://127.0.0.1:5173/studio-lab` · Real Playwright Chromium (headless, Linux runner), a fresh context per session, 1440×900 and 1280×720.

**Verdict: PASS.** Every C row in §4 passed in the real browser. The one blocked part is the fake-Bearer 403, which needs the backend (unavailable in cloud). No bug found. `browserVerified = realVerified = true`.

## Environment
- `env-status.json`: store 200, round 153, attempt 1.
- **Invalid run, replaced once (ENV-FIRST-LOAD):** d6 1440 run 1 was the job's first `/studio-lab` load. It hit the cold-Vite "Invalid hook call" + hydration error, the same as round 152. The run is kept as `c-round-153/out/d6-1440-r1-INVALID-envfirstload.log` and `out/d6/d6-1440-r1-INVALID-envfirstload.json`. The re-run was clean.
- **Fonts:** every Studio measurement session (d6 ×4 valid, labels ×2) got 9 font responses, all 200, with 0 failures. `fontsWait` was ok before each capture.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T153-TARGETED | **PASS**. C re-ran the 7 files: **89/89** (theme 9, video-dock 3, master 18, tempo 12, markers 22, grid-snap 20, navigation 5). This matches A's count. TH9 is green and asserts the 6 labels as the ordered list `Master, Zoom, Arrangement, BPM, Markers, Loop`, plus the 4 classes, the 3 `@theme` declarations and the `Arrangement · Overview` text. | `c-round-153/out/vitest.json` |
| SOURCE-SCOPE | **PASS**.<ul><li>HEAD is `ff2fd6c`.</li><li>The frozen 962 entries are OK at start and at end.</li><li>The 10 end hashes equal `a-round-153/end-sha256.txt`.</li><li>`git status` = 9 ` M` + 1 `??` (doc 124).</li><li>The protected diff vs `ff2fd6c` is 0 bytes (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `root.tsx`, `AuthContext`, `StudioContext`, `Modal`, `download-routes.test.ts`), and no `auth*` path is in the diff.</li><li>The `app.css` diff is exactly the 3 F1 `+` lines after `--font-serif`.</li><li>C's start and end sha256 of all 972 files are byte-identical, so no source changed during C's phase.</li></ul> | `out/c-start-sha256.txt`, `out/c-end-sha256.txt` |
| AN-REVIEW | **PASS**.<ul><li>Each component diff is exactly its L-row. Master: `text-xs` → `text-label` + `uppercase tracking-label`, with `font-medium`, `text-muted` and `aria-hidden` kept; Biome split it over 4 lines. Zoom, BPM, Markers and Loop are wrapped in spans. Arrangement is wrapped, followed by `{' '}`.</li><li>The test diff is only the new TH9 (+57 lines). TH1–TH8 are unchanged.</li><li>Doc 123 has exactly 2 changed lines: the status on l.4, and the clause on **l.70**. The task said l.67, but the clause occurs exactly once, so l.70 is the right line; A disclosed this.</li><li>Doc 124 is in Georgian, with technical terms in English. It has every TEMPLATE section (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO), and its status is `In Progress (awaiting C round 153)`.</li></ul> | `git diff ff2fd6c` |
| LABEL-STYLE | **PASS** at both viewports. L1–L6 were checked in S0; L1–L5 also in S1, where the loop replaces L6. Every label has `font-size` 11px, `line-height` 16px, `font-weight` 500, `letter-spacing` 1.54px and `text-transform` uppercase. The family is `"Instrument Sans", "Noto Sans Georgian", …`, and CDP `getPlatformFontsForNode` gives **Instrument Sans [web]** only, with glyph counts 6/4/11/3/7/4. `textContent` is the original-case word, and `innerText` and the screenshots show MASTER, ZOOM, ARRANGEMENT, BPM, MARKERS and LOOP. **Accessible names** are identical to the pre-label rendering in the same page: Master group "Master", "Master Mute", "Master Volume", the Zoom slider "Zoom (px/s)", "Add marker (M)", "Previous marker (Ctrl+←)", "Next marker (Ctrl+→)", "Project tempo (BPM)", "Metronome" and "Follow". | `out/labels-{1440,1280}.json`, `shots/label-S0-*`, `shots/labels-S{0,1}-full-*` |
| RV-1-LABELS | **PASS**. The d6 chain ran S0/S1/S2 at both viewports, twice, and was compared with `c-round-152/out/bbox-post-v2a-{w}.json`. Results:<ul><li>**0** y/h moves beyond ±1 px.</li><li>**0** keys missing or added (102/120/129 at 1280, 110/121/130 at 1440).</li><li>**0** panel moves.</li><li>**0** elements newly past 1280.</li><li>Determinism is **0 px** in all 6 pairs.</li><li>Only 6 d6 movers, all horizontal and identical in every state and viewport (table below). Each is a same-row follower of a widened label; the label spans are not d6 keys, so their widths were measured in LABEL-STYLE.</li></ul> | `out/rv1labels-compare.json`, `out/bbox-post-v2b1-{1280,1440}.json`, `tools/rv1labels.py`, `tools/d6.cjs` (unchanged `collect`) |
| NO-CLIP | **PASS** in S0 and S1 at both viewports.<ul><li>All six labels render on 1 line, inside their parent, and the parent has no `scrollWidth > clientWidth`.</li><li>The 224 px header columns do not overflow: BPM row content ends at 494.6 vs a column right edge of 512, and the Markers row at 433.3 vs 512 (`sw = cw = 223`).</li><li>Marker `+`/`◀`/`▶`, BPM input, 4/4, Metronome, Follow and the Master group: `sw == cw`, 1 line.</li><li>Video caption: 789 px at 1440 and 629 px at 1280, `sw == cw`, so it is not truncated, both with no video and with `beeps-6s-h264-aac.mp4` loaded.</li><li>The baseline is the same live page with the 4 label classes removed at runtime (Master gets `text-xs font-medium` back) and then restored, with `restoredSame` true. It had the same no-clip result, so nothing is newly clipped.</li></ul> | `out/labels-*.json` (`pre` vs `post`), `shots/labels-*-PRESIM-full-*` |
| FONTS-SCOPED | **PASS**.<ul><li>`/` and `/cart` at both viewports, in 2 runs (hover-then-focus, and focus only in a fresh context). An untouched load fetched 0 F2 css2 and 0 Instrument Sans / Plex Mono / Noto Georgian woff2. A hover or focus fetched 1 css2 as `prefetch` (type `other`, 200), which is allowed, and 0 woff2.</li><li>`body` is `Inter, -apple-system, BlinkMacSystemFont…`.</li><li>**0** elements have computed letter-spacing 1.54px, and there are 0 `.tracking-label`/`.text-label` elements, in every phase.</li><li>`/studio-lab` requests the same V-2a css2 URL as round 152 (Instrument Sans 400–700, IBM Plex Mono 400/500, Noto Sans Georgian 400/500), with no Cormorant and no new family. The full css2 set in the d6 session (3 URLs: Inter, the V-2a URL and Playfair Display) equals round 152's d6 session.</li></ul> | `out/rv3b-hover.json`, `out/rv3b-focus.json`, `out/d6/d6-1440-r1.json` `fontResp` |
| TOKENS-SCOPED | **PASS**. The `app.css` diff is only the 3 F1 lines, so the obsidian block is byte-identical to `ff2fd6c` (TH2 is green as well). The component diff has 0 hex values. There is no Cormorant in `app/`. | `git diff ff2fd6c` |
| FUNC-SMOKE | **PASS**, both viewports:<ul><li>Play 2 s: 0 → 1.97 s, AudioContext running, 2 buffer sources.</li><li>SFX drag 4 → 5 s, then Ctrl+Z → 4.</li><li>BPM 90 + Enter: "Tempo 90 BPM · 4/4 — bars ruler updated". The tool's `applied` flag compares the seconds ruler, so it reads false, as in round 152; the value and status confirm the tempo was applied.</li><li>Zoom slider: 5 × → gives 40 → 41.3 px/s, and 5 × ← returns to 40.</li><li>M, then Enter: "Marker 1" at 00:01.000. A second marker at 3.003. From 0: `▶` → 1, `▶` → 3.003, `◀` → 1.</li><li>Marker menu (Rename / Play from here / Delete) closes with Escape.</li><li>Ctrl+L on/off/on works.</li><li>The Export dialog opens and Escape closes it.</li><li>Real project WAV export `czaba-studio-lab.wav`: PCM 24-bit 48 kHz stereo, 7 217 877 frames = 150.3724 s = project end 02:30.372, 0 NaN, first audible at 0.2612 s, silent tail. sha16 `baf913109088dddd` at both viewports, identical to round 152.</li></ul> | `out/c153s-*.json`, `out/fs3-*.json`, `shots/fs3-*`, `shots/FS-ctrlL-*` |
| G153-3 | **PASS**.<ul><li>`/studio-lab` loads anonymously with the workspace and "Demo collection — no sign-in required".</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`, at 1440 and 1280.</li><li>`GET /api/studio-token` returns **401**.</li><li>0 forbidden requests, 0 Authorization headers.</li><li>**Fake-Bearer 403: BLOCKED** (backend unavailable in cloud).</li></ul> | `out/g153-3.json`, `shots/g153-3-*` |
| PX-NET / REG-HYD | **PASS**. Every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror: d6 ×4, labels ×2, c153s ×2, fs3 ×2, G153-3, and 16 Store page loads. Only the expected cart noise appeared (2 per Studio session). One ENV-FIRST-LOAD session was replaced. | `net` in every `out/*.json` |

### RV-1-LABELS: d6 movers vs B's prediction (identical in S0/S1/S2 and at 1280/1440)
| d6 key | Measured dx / dw | B prediction (§4) | Cause |
|---|---|---|---|
| `arrangement-follow` | −10 / 0 | −10.1 | follower: Zoom label dw +10.2 (right-anchored group) |
| `arrangement-tempo-input` | +1.5 / 0 | +1.6 | follower: BPM dw +1.6 |
| `arrangement-metronome-toggle` | +1.5 / 0 | +1.6 | follower: BPM dw +1.6 (4/4 is +1.6 too, measured in NO-CLIP) |
| `arrangement-marker-add` / `-prev` / `-next` | +19 / 0 | +18.8 | follower: Markers dw +18.8 |
| Zoom slider / readout | ≤ 1 px | "≤ 1 px or the same shift" | right-anchored, unmoved |
| Every panel (video dock, marker row, tempo row, loop strip) | 0 | ±1 | — |

**One discrepancy in the prediction text (not a defect):** §4 predicted the "Master `M` / Volume / Peak controls dx ≈ −14.2". In the real browser those controls do **not** move (≤ 1 px). Only the Master fieldset and the label move: dx −14.2 and dw +14.3, measured in LABEL-STYLE (`master` box 780 → 765.8, w 410 → 424.3). This matches B's own `labelsim-*.json`, which lists only the fieldset and the span, not the controls. The fieldset grows leftwards because it is right-anchored. The fieldset is not a d6 key, so d6 shows no Master mover.

### LABEL-STYLE / label widths vs B's labelsim (1440 and 1280 identical)
| Label | Computed (size/lh/wt/ls/tt) | Platform font | w before → after | dw (B sim) | dx |
|---|---|---|---|---|---|
| Master | 11px/16px/500/1.54px/uppercase | Instrument Sans [web] 6 | 41 → 55.3 | +14.3 (+14.3) | −14.2 |
| Zoom | same | Instrument Sans [web] 4 | 31 → 41.2 | +10.2 (+10.2) | −10.1 |
| Arrangement | same | Instrument Sans [web] 11 | 76 → 102 | +26 (+26) | 0; "· Overview" +26, caption dx +26 / dw −26 |
| BPM | same | Instrument Sans [web] 3 | 27 → 28.6 | +1.6 (+1.6) | 0 |
| Markers | same | Instrument Sans [web] 7 | 46 → 64.8 | +18.8 (+18.8) | 0 |
| Loop (S0) | same | Instrument Sans [web] 4 | 27 → 36.2 | +9.2 (+9.2) | 0 |

The maximum horizontal shift is 26 px (Arrangement / "· Overview" / caption). This is the user-vetoable decision D-29z118 R3, recorded by B.

## Findings (to B)
None: no Critical, High, Medium or Low finding.

Notes (info, not bugs):
- **FUNC-SMOKE Ctrl+L, what the app does:** the `LOOP` label shows only while no loop range exists. After Ctrl+L off, the strip keeps the range and shows "Loop 00:04.405 — 00:05.406 · off" and "Loop off". The `LOOP` label does **not** return, even after Escape. This is the unchanged loop-times branch ("the range is kept"), as specified in L6. **Cleared:** after Ctrl+Z ("Undo: Loop created"), the range is gone (`loop-times` is null) and `LOOP` comes back with the label style (11px, 1.54px, uppercase), at both viewports. So the L6 branch re-renders correctly after a state change (`out/loopclear-{1440,1280}.json`, `shots/loopclear-*`).
- **Task text l.67 vs real l.70** in doc 123 (A disclosed it). The prediction-text discrepancy for the Master controls is described above.
- **Screen readers:** the accessible names of the controls are unchanged. The Master span is `aria-hidden`, and the group name is still "Master". Whether a screen reader spells CSS-uppercase static text letter by letter (A's reviewer note) was not tested with a real screen reader.
- The d6 contrast pass ran anyway: 32 failures (text-foreground 26 + text-muted 6), `text-dim` min 4.57. This is the same count as round 152.

## Tool changes vs round 152 (disclosed for B)
- `d6.cjs`: `collect`/`PANELS` are unchanged; only paths and labels changed. `d6build.py` only renames its outputs (`bbox-post-v2b1-*`).
- `rv3b.cjs`: `snap()` gained `ls154` (the count of computed letter-spacing 1.54px) and `trackingLabel`. Screenshot names now include ORDER.
- New tools: `labels.cjs` (LABEL-STYLE / NO-CLIP / AX names with the reversible class strip), `rv1labels.py` (the round-152 comparison logic against the round-152 reference), `fs3.cjs` (`fs2` + zoom, marker ◀/▶ and loop label), and `loopclear.cjs`. `c153s.cjs` and `g153-3.cjs` changed only their output names.
- **The tempo row has no `data-testid`.** The `arrangement-tempo-row` entry in d6 `PANELS` is dead, so d6 does not cover that panel. Its "0 move" rests on the direct measurement of the header column in `labels-*.json` (`[288,219,224,20]` at 1440 and `[288,257,224,20]` at 1280, the same before and after). This is an info note about the tool, not the app. In `labels.cjs`, `tempoHeaderCol` and `fourFour` were found via the tempo input's parent.

## Ableton
- Uppercase, spaced section labels are a CZABA brand decision (`visual-direction-a.md`). No Ableton source was used or claimed. **Parity: not applicable.**
- **CZABA requirement:** met. LABEL-STYLE, RV-1-LABELS and NO-CLIP passed.

## Not run / gate
- Not re-run, as the task allows: RV-2 contrast (it ran anyway inside d6, with the same count), FONT-FAIL.
- Gate rows (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Limits
- Headless Linux Chromium only. Windows and macOS rendering are not verified.
- The NO-CLIP and LABEL-STYLE "before" values come from a runtime class strip in the same live page, not from a `ff2fd6c` checkout; C cannot change source. The strip is reversible (`restoredSame` true), and its widths match B's independent `labelsim` exactly.
- The fake-Bearer 403 is BLOCKED (backend unavailable in cloud).
