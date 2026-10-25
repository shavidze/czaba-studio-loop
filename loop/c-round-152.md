# C round 152: V-2a closure re-check (D-29z117), independent verification

Verifier C · 2026-10-25 · Tree: HEAD e94ae88 + the preserved round-151 V-2a tree + A's round-152 T2/D1 (`a-round-152/end-sha256.txt`) · Target `http://127.0.0.1:5173/studio-lab` · Real Playwright Chromium (headless, Linux runner), a fresh context per session, 1440×900 and 1280×720.

**Verdict: PASS.** Every C row of §4 passed in the real browser. The rows checked RV-1-TYPE under the amended R1, the R4 prefetch wording, fonts, function, auth and network. No bug was found. `browserVerified = realVerified = true`. The one blocked part is the fake-Bearer 403, which needs the backend and is unavailable in the cloud.

## Environment
- `env-status.json`: store 200, round 152.
- **Invalid run, replaced once (ENV-FIRST-LOAD):** the first `/studio-lab` load of the job (d6 1440 run 1) hit the cold-Vite "Invalid hook call" + hydration error. It is kept as `out/d6-1440-r1-INVALID-envfirstload.log`; the re-run was clean.
- **Fonts in the measurement sessions (d6 ×4, fontspot ×2):** 9 font responses, all 200, and 0 failures. `fontsWait` ran before each capture. The FUNC-SMOKE sessions (`c152s`, `fs2`) did not record font responses; they are not font-dependent rows.
- **Discarded FONTS-SCOPED first run** (`out/rv3b-INVALID-first-run.json`): `/@1440` got "Execution context was destroyed" (a navigation mid-evaluate, as in round 150/151). Its hover-then-focus order also hid the focus case. It was replaced by `rv3b-hover.json` (all pages clean on attempt 1) and `rv3b-focus.json` (focus only, fresh context).

## Rows
| Row | Result | Evidence |
|---|---|---|
| T152-TARGETED | **PASS**. C re-ran the 2 files: 34/34 (theme 8, track-pan 26), the same counts as A. TH8 l.265 is `expect(panResets).toHaveLength(3);`, and N = 3 is A's recorded SSR count. | `c-round-152/out/vitest.json` |
| SOURCE-SCOPE | **PASS**.<ul><li>HEAD e94ae88.</li><li>The frozen 969 entries are OK at start and end, and the 2 granted end hashes equal `a-round-152/end-sha256.txt`.</li><li>The 7 frozen round-151 paths equal `a-round-151/end-sha256.txt`; only the 2 granted paths differ, as expected.</li><li>`git status` = 8 ` M` + 1 `??` (the round-151 paths), and `git diff e94ae88 --name-only` = 8 files.</li><li>The protected diff is empty (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `root.tsx`, auth*, `AuthContext`, `StudioContext`, `Modal`, `download-routes`).</li><li>The `app.css` diff is still exactly the 3 F1 lines.</li><li>C's start and end sha256 of all 971 files are byte-identical, so no source changed during C's phase.</li></ul> | `out/c-start-sha256.txt`, `out/c-end-sha256.txt` |
| AN-REVIEW | **PASS**.<ul><li>The theme test vs the start copy: the single T2 line (265).</li><li>Doc 123 vs the start copy is D1 only, in Georgian:<ul><li>the status line l.4 is exactly the §1 text;</li><li>3 Problem → Solution entries (C-R151-1/2/3 with R1/R2/R3 and B's numbers);</li><li>„ტესტირება“: the C-151 result bullet (13 PASS, RV-1-TYPE 0 vertical with the hint −119 px, FONT-FAIL DejaVu, RV-2 61/61 min 4.57);</li><li>TODO: the separator decision and the R4 wording.</li></ul></li><li>The V-2b TODO line already existed (l.78), so D1 did not need to add it.</li><li>The stale clause on l.67 („C round 151 ჯერ არ გაშვებულა“) is left, as A disclosed; this is an info note for B.</li></ul> | `diff` vs `b-round-151/r152-granted-start/` |
| RV-1-TYPE (amended R1) | **PASS**. The d6 chain (S0/S1/S2, both viewports, twice) vs `c-round-148/out/bbox-post-v0-{w}.json`, with `arrangement-shortcut-hint` removed from `PANELS`. That key is dropped from the v0 baseline as the direct consequence, because the `<p>` is no longer collected. Results:<ul><li>**0** elements with y/h beyond ±1 px.</li><li>**0** keys missing or added (S0/S1/S2: 102/120/129 at 1280, 110/121/130 at 1440).</li><li>**0** `kind: panel` moves.</li><li>**0** elements newly past 1280.</li><li>**Determinism 0 px** in all 6 state/viewport pairs.</li><li>Movers: 19–21 per state, all horizontal, each an own-text width change or a same-row follower (table below).</li><li>**Vs `c-round-151/out/bbox-post-v2a-{w}.json`: max difference 0 px**, with 0 keys present in only one run (all 6 pairs), as expected.</li><li>The hint itself, measured separately: 1070.1 × 16 at x 12 at both viewports (round 151: 1070).</li></ul> | `out/rv1type-compare.json`, `out/bbox-post-v2a-{1280,1440}.json`, `tools/rv1type152.py`, `tools/d6.cjs` |
| FONTS-SCOPED (R4) | **PASS** on `/` and `/cart` at both viewports, in two separate runs: hover then focus, and focus only in a fresh context.<ul><li>Untouched load: **0** F2 css2 and **0** Instrument Sans / Plex Mono / Noto Georgian woff2.</li><li>Hover on the header "Studio Lab" link: **1** F2 css2 as `<link rel="prefetch">` (resourceType `other`, 200), recorded and allowed; **0 woff2**.</li><li>Focus only (fresh context): the same, 1 prefetch and 0 woff2.</li><li>`body` font-family = `Inter, -apple-system, BlinkMacSystemFont…`, with 0 `[data-studio-theme]`.</li><li>0 pageerror, 0 hydration messages, 0 forbidden requests, 0 Authorization headers.</li></ul> | `out/rv3b-hover.json`, `out/rv3b-focus.json`, `shots/rv3b-*` |
| FONTS-SPOT | **PASS**, CDP `CSS.getPlatformFontsForNode`, both viewports:<ul><li>Title "CZABA Studio Lab": Instrument Sans [web] 28 glyphs.</li><li>BPM "120": IBM Plex Mono [web] 6.</li><li>Master "0.0 dB": IBM Plex Mono [web] 6.</li><li>Transport "00:00.000": IBM Plex Mono [web] 9.</li><li>"სრული მიქსი": Noto Sans Georgian [web] 10 + Instrument Sans 1 (space).</li><li>"Middle East — საჯარო preview": Instrument Sans 21 / Noto Georgian 6.</li></ul>Same as round 151. | `out/fontspot-{1440,1280}.json`, `shots/fontspot-S0-*` |
| FUNC-SMOKE | **PASS**, both viewports:<ul><li>Play 2 s: 0 → 1.97 s, AudioContext running, 2 buffer sources.</li><li>SFX clip drag +1 s, then Ctrl+Z restores it (4 → 5 → 4).</li><li>BPM 90 + Enter: "Tempo 90 BPM · 4/4 — bars ruler updated".</li><li>Library search 9 → 1 → 9.</li><li>Ctrl+L on/off/on.</li><li>Export dialog opens ("Export") and closes with Escape.</li><li>Marker: M, then Enter, gives "Marker 1" at 00:01.000. Right-click opens the menu (Rename (F2) / Play from here / Delete (Delete)), and Escape closes it with the marker kept.</li><li>**A real project WAV export** (`czaba-studio-lab.wav`): PCM 24-bit 48 kHz stereo, 7 217 877 frames = **150.3724 s = project end 02:30.372**, 0 NaN, first audible at 0.261 s. The tail is silent and the sha16 is the same at both viewports (`baf91310…`).</li></ul> | `out/c152s-*.json`, `out/fs2-*.json`, `shots/fs2-*`, `shots/FS-ctrlL-*` |
| G152-3 | **PASS**.<ul><li>`/studio-lab` anonymous: workspace + "Demo collection — no sign-in required".</li><li>`/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]` (1440 and 1280).</li><li>`GET /api/studio-token`: **401** `{"error":"Please sign in to access Studio."}`.</li><li>0 forbidden requests, 0 Authorization headers, 0 errors.</li><li>**Fake-Bearer 403: BLOCKED** (backend unavailable in cloud).</li></ul> | `out/g152-3.json`, `shots/g152-3-*` |
| PX-NET / REG-HYD | **PASS**. In all 10 Studio sessions and 16 Store page loads: 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise appears (2 per Studio session). One ENV-FIRST-LOAD session was replaced. | `net` in every `out/*.json` |

**Comparison-script changes vs round 151 (`tools/rv1type152.py`, disclosed for B):**
1. The hint key is dropped from the v0 and r151 baselines, as a consequence of the permitted `PANELS` edit.
2. **The follower rule is relaxed.** A lead now only has to share the row; round 151 also required the lead to sit to the left of the follower. Against `c-round-151/out/rv1type-compare.json`, the causes differ only in wording and lead lists, with one exception: `arrangement-follow` at 1280 (S0/S1/S2) was "UNEXPLAINED" under the strict rule, and round 151 explained it by hand as a right-anchored `ml-auto` follower. C re-checked that from the bbox: the Export right edge is unchanged (1268 at 1280, 1428 at 1440), while `zoom-back` (dw −3) and `fit` shift inside the row. So Follow +3 follows the right-anchored group. The movers and deltas are identical to round 151 (vs151 0 px).
3. The panel test is stricter: a move counts as a panel move if either the v0 or the new kind is `panel`.

Not re-run (source unchanged, round-151 evidence stands): NO-CLIP, FONT-FAIL, RV-2, TOKENS-SCOPED, VISUAL. The d6 contrast pass ran anyway as part of d6: `text-dim` min 4.57, 32 failures in total, the same count as rounds 150 and 151. No change was seen in those areas.

Gate rows (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

### RV-1-TYPE move table (1440 S0; 1280 and S1/S2 are the same set, see JSON)
| Key | dx | dw | Cause |
|---|---|---|---|
| Master Mute / Master Volume / master-peak | +9 | 0 | follower of `arrangement-exit` (dw −4.5) |
| `arrangement-exit` | 0 | −4.5 | own text |
| Video lane button | 0 | +5 | own text |
| `＋ Your own video` | +5 | −5 | own text |
| `↻ Loop` / `✂ Split` | −2 / 0 | −3.5 / −2.5 | own text |
| `⌫ Delete` | −2 | 0 | follower (Loop/Split row) |
| `zoom-back` / `detail-toggle` | +1 / +2 | −3 / −2 | own text |
| `fit` / `follow` | −2 / +3 | +1 / 0 | follower; Follow is in a right-anchored `ml-auto` group (round 151 `glyphs-1440.json`) |
| `grid-division` / `snap-toggle` | −2 / 0 | −4 / −2 | own text |
| `envelope-toggle` / `waveform-zoom` | −6 | 0 / +1 | follower of the grid division and Snap |
| `marker-add` | −2 | −2 | own text |
| `marker-prev` / `marker-next` | −4 | 0 | follower of `marker-add` (S1 also `arrangement-marker` dw −3) |

## Findings (to B)
None. No Critical, High, Medium or Low finding.

Notes:
- **Doc 123 l.67** still says „C round 151 ჯერ არ გაშვებულა“ next to the new results bullet (A disclosed it; D1 forbade other lines). Info for B to reword later.
- **The export full-scale count is pre-existing summing behaviour.** The project export has 3 676 full-scale samples where the hero music and Soft impact overlap at 0 dB. It is the same class of pre-existing behaviour (0 dB summing of overlapping clips) that round 125 recorded: 159 full-scale samples for hero + pulse in a 4 s range. This round changed no audio code; it is relevant to T12 meters.
- C-R151-2 and C-R151-3 are not C rows this round (R2/R3 put them in `deferred_low_polish`). There is no new observation on them.
- The d6 `PANELS` edit (the one permitted logic edit) is recorded in `c-round-152.json` (`d6PanelsEdited`).

## Ableton
- The typefaces are a CZABA brand decision (`visual-direction-a.md`).
- **Parity: not applicable.** No Ableton source was used or claimed.
- **CZABA requirement:** met for RV-1-TYPE (amended R1), FONTS-SPOT and FONTS-SCOPED.

## Limits
- Headless Linux Chromium only. Windows and macOS rendering are not verified.
- The fake-Bearer 403 is BLOCKED (backend unavailable in cloud).
