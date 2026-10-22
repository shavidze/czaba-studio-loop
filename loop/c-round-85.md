# C — Round 85 verification: X1 (C-R84-M1 header stacking) + SRW-20 stage 1 (range export)

Verifier: C · Date: 2026-10-22 · Target: `http://127.0.0.1:5173/studio-lab` (anonymous Playwright Chromium, fresh context per session, real `page.mouse`/keyboard), 1440x900 and 1280x720.
**Verdict: PASS. `browserVerified=true`, `realVerified=true`.** Two Low findings for B; neither blocks. One sub-check is BLOCKED (backend). XR-PASTEND is "not reachable", which the task says is not a FAIL.

## Source state (start = end)
- HEAD `88b0262`, `git status` = 6 M + 4 ?? (exactly A's table; the X1 alternative was not used).
- Frozen list 481/481 OK. A's `end-hashes.txt` OK (11/11). `ArrangementClip.tsx` = `67166666` (byte-identical).
- Protected 4/4 + auth files unchanged. `env-status.json`: store 200.
- C changed no source. Every exported WAV was deleted after measurement; only sha16 and stats are kept.

## Results (both viewports unless noted)
| ID | Result | Evidence (numbers are 1440 / 1280) |
|---|---|---|
| M1-HANDLE | PASS | The handle/trim point was scrolled under the header (x=362, header 288–512). `elementFromPoint` is a header descendant (`inClip=false`) in every case: video fade handle → header DIV; audio fade handle → stems name BUTTON; audio trim strip → stems Volume INPUT; video trim strip → video Volume INPUT. At the trim-strip spot the topmost element is the header Volume slider. Its value before/after was not recorded; the Undo label was unchanged. A real +40 px drag there left the fades (V 1.000, A 1.000) and starts unchanged, added no Undo entry (label unchanged) and wrote no status. Screenshots `shots/m1-*-unsel-*.png`: no teal squares on the header. `m1-*.json` |
| M1-SELECTED | PASS | The same 4 probes with the clip selected (`ring-brand` verified) and unselected (verified unselected): the header is topmost in all 8/8 per viewport |
| M1-GHOST | PASS | Lane-move ghost (amber dashed, `left` 352 < header right 512). Ghost-colour pixels inside the sfx header crop: before 0 → during **0**; lane part 0 → 654 / 640. `elementFromPoint` at the ghost spot under the header → sfx header. The only other header-pixel change is the "· აქტიური" label moving to stems once the drag starts (screenshots `m1-ghost-before/during-*.png`). The **Escape** step does not cancel → C-R85-L1 |
| M1-VISIBLE | PASS | Visible area: FD-IN +20 px → 1.500 ("Undo: Fade In"), Undo → 1.000. The trim strip is topmost in the clip; a +40 px trim moves the start by +1.000. EN-DRAG point gain 0.5000→0.7400 / 0.7449, then undone. Selected ring over the duplicated neighbour: neighbour-side pixels differ (139 / 137 px), selected root `z-index:10`. Playhead pixel = `bg-accent` rgb(249,169,31) over the clip and over the selected clip. Empty-video-lane hint left = 512 = header right (`M1-VISIBLE-hint`) |
| M1-ENV | PASS | Envelope point (6 s) under the stems header → header BUTTON. A drag there leaves the envelope unchanged. A real click on header Mute → Mute (false→true→false), envelope unchanged |
| (reviewer L6) M1-GROUP | PASS (extra) | Group folded, overview block scrolled under the group header → `arrangement-group-header` topmost |
| XR-DEFAULT | PASS | Snap 1 s, range drag 4→9 on the stems body. Readout `00:04.000 — 00:09.000`. Range radio checked and enabled, label `მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)`, same description. Project label `მთელი პროექტი · 00:00.000 — 01:41.702` |
| XR-WAV | PASS | `czaba-studio-lab-range.wav`, **240000 frames**, PCM 24-bit / 48 kHz / 2 ch, NaN 0. Versus the project export frames [192000, 432000): max \|diff\| **0 LSB / 1 LSB** (1.19e-7 FS; 0 / 3254 samples ≠). Done message exact. The overload warning `+1.7 dBFS — 456 sample` = 456 full-scale samples in the file |
| XR-MIDSTART | PASS | Stems fade-in 2.000 s (2→4 s) + envelope `2.5:1 · 6:0.2512 · 10:1`, range 3–8. Versus project frames [144000, 384000): max 1 LSB (3996 / 3979 samples ≠). The edit is audible (P2 vs original differs 0.164 FS at 3.0008 s) |
| XR-ALLTRACKS | PASS | Max \|diff\| versus the project window, 1440 / 1280: music-lane range 4–9 → 1 / 0 LSB; Ctrl+Shift+L all lanes → 0 / 1 LSB (readout `ყველა ხაზი`); at 1440 its sha equals the XR-WAV file. Sfx-lane range 4–5 (48000 frames): max 1 LSB, message `მონაკვეთი 00:04.000 — 00:05.000 (1.000 წმ)`. All three are the Master mix |
| XR-PROJECT | PASS | With a range, choosing project → `czaba-studio-lab.wav`, 4881696 = ceil(101.702×48000) frames, message `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.`, description/graph note byte-exact. Reopen → range default again. Cleared range (click on an empty lane) → range radio disabled with the exact reason; the project radio is checked **and disabled** → C-R85-L2 |
| XR-PASTEND | NOT REACHABLE | A clip range is clamped to the clip end (= project end); a drag starting past the end is a marquee that clears the range. Extra: the range 95.000–101.702 → 321696 frames, 0 LSB versus the project window. Renderer: A's XR4 |
| XR-OVERLOAD | PASS | Music muted (so a quiet span exists), reference export at −6 dB, then Master +6.0 dB. Quiet range 5–10 (predicted −3.6 dBFS): no warning, 0 clamped. Loud range 1–6: `პიკი +7.5 dBFS — 5252 sample`; predicted 7.48 dB, file full-scale 5252, predicted clamped 5252 |
| XR-KEYS | PASS | Export opened with Enter on a focused button. 14 Tab/Shift+Tab steps all stay in the dialog; the scope group is a single tab stop. ArrowUp → project, ArrowDown → range, Space selects; Enter on WAV → `czaba-studio-lab.wav`. Reopen → range default, Enter → `czaba-studio-lab-range.wav` (240000 frames). Focus returns to Export. No range: Tab wraps and skips the disabled scope radios |
| XR-X3 | PASS | With and without video: MP3 disabled `ამ ეტაპზე ხელმისაწვდომი არ არის`; video option disabled with the unchanged reason; the round-84 fade line shows only after a video fade. Downloads: only `.wav`. Range 3–7 over the video's own sound: 192000 frames, ≤1 LSB (C-R84-L1 rule) |
| REG-HYD | PASS | All 12 sessions: no hydration / `useLayoutEffect` warning, no non-noise error |
| G85-3 | PASS (+1 BLOCKED sub) | `/studio/middle-east` anonymous → "Sign in required", 0 workspace. `/api/studio-token?product=middle-east&file=stem1.wav` anonymous → 401 (context and in-page). No token/R2/download request from `/studio-lab`, 0 auth headers. The header link opens `/studio-lab` with the demo badge. Fake Bearer → 500 → **BLOCKED** (backend unavailable in cloud) |
| T85-TARGETED | PASS | A's 65 files: 65/65 files, 1151/1151 tests (`c-round-85/vitest-targeted.txt`) |
| SOURCE-UNCHANGED | PASS | See above |
| Gate rows | gate | full vitest, typecheck, build, Biome, verify, e2e smoke → root gate |

## Bugs for B
- **C-R85-L1 (Low, pre-existing):** Escape does not cancel a clip drag or lane-move. On release the move commits (here the lane change was refused and the clip moved 2.000→1.750, with an Undo entry). The task assumed "then Escape" cancels. Ableton behaviour is unconfirmed. B: decide whether this is a requirement.
- **C-R85-L2 (Low, spec deviation):** with no range, the project radio is checked+disabled (B's E2 disables only the range radio). A forced this to keep frozen C-R14-02 green. B: accept, or grant the frozen focus test in a later round.
- **C-R84-L1 evidence extended (no new ID):** the 1-LSB jitter also happens **without video**, in the 4–9 s span (Soft impact + stems). Two unchanged project exports differed in 3254 samples. Range files match one of the two variants bit-for-bit. This is within tolerance and not caused by range export.

## Ableton match (separate from PASS)
Time selection → render range: **confirmed** (§5.1.3.1 text). Whole Set by default: **confirmed**. Main = master mix: **confirmed**. Typed Start/Length: **conscious difference**. Per-track render: **not in scope**. Loop/MP3/progress: **conscious difference / stage 2 / stage 3**. Header stacking: **not applicable**. Escape-cancel: **unconfirmed**.

## Artifacts
`c-round-85/tools/{lib85,xr,ov,m1,x3,g85,tok}.cjs`, results `c-round-85/{xr,ov,m1,x3,g85}-<vp>.json`, `tools/tok.log`, `vitest-targeted.txt`, screenshots `c-round-85/shots/`, checkpoint `c-round-85/checkpoint.md`. State file `c-browse.json` (fresh incognito contexts, no credentials, no stored state).
