# C — Round 115 verification: T12 stage 2, multi-clip Clip Gain (T12.7) + GATE114-S1/S2/S5

Verifier: C · Date: 2026-10-23 (~18:55–19:30 UTC) · Task: `current-task.md` (D-29z80) · A report: `a-round-115.md` (treated as data, re-checked)

## Verdict
**PASS**: `browserVerified: true`, `realVerified: true`. Every §4 browser row ran in real Chromium (Playwright 1440×900 ×3 and 1280×720 ×1, each in a fresh context, plus MC-PLAY ×3 and the export session). One new **Low** (C-R115-01). No Critical, High or Medium finding. Gate rows are not claimed.

- **CZABA requirement met:** yes for R1–R12 as observed in the browser.
- **Ableton correspondence:** see §5. Only the range display is confirmed, and only through B's 2026-10-12 record.

## 1. Environment and source
- env-status: store 200 (round 115). HEAD `38c0e21`. `git status` shows only the §2 paths: 9 ` M` and 3 `??`.
- Frozen list `b-round-114-r115-tree-sha256.txt` is **OK** at the start and at the end.
- Protected file hashes are unchanged: `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257`.
- Hash of (diff + new files) is identical at the start and the end of my phase (`out/source-start.sha`), so the source did not change while I was verifying.
- **T115-TARGETED:** A's 18 files, **323/323 green**, same counts as A (`c-round-115/out/vitest-targeted.log`).

## 2. Browser rows (evidence `c-round-115/out/multi-*.json|log`, shots `c-round-115/shots/`)
- **Setup:** music `demo-middle-east` @0, stems `demo-stem-pulse` @2, SFX `demo-soft-impact` @4, all added from the library. Snap off. Detail panel open at default height.
- **Multi-select modifier:** **Shift**+click on the SFX clip header gives exactly {stems, SFX}.
- **Clicking a member of a live group keeps the group.** To read one clip's value, my harness first clicks empty lane space.
- **Exact entry counts:** before each row I wrote a distinct sentinel history entry (`Undo: Volume`, one music-track key step). "One entry" therefore means: one Ctrl+Z restores the values **and** the Undo title returns to `Undo: Volume`.
- Fader width `w` = 96 px at both viewports.

| ID | 1440 r1/r2/r3 | 1280 r1 | Measured |
|---|---|---|---|
| MC-PRESENT | P/P/P | P | Field `""`, range `−6.0 … +1.0 dB`, fader 1, `aria-valuetext` = range, field `aria-describedby` → range node, `title` = range. Equal −3/−3 → field `-3.0`, no range node, `−3.0 dB`. |
| MC-LAYOUT | P/P/P | P | Block `w-52` = 208 px. Height single = multi (91 px at 1440, 67 px at 1280). scrollW 208 = clientW. Range node 115.2 px. Range, field, fader and `0 dB` all inside the visible panel box. No new row. Shots `layout-multi-*-panel.png`. |
| MC-DRAG | P/P/P | P | +20 px → Δ 17.5 / 17.5 (expected 17.5 ± 0.975). Difference 7.0. One entry. Ctrl+Z → −6.0 / +1.0. |
| MC-STATUS | P/P/P | P | `Clip Gain: 2 კლიპი — +11.5 … +18.5 dB.` |
| MC-FINE | P/P/P | P | Shift +20 px → Δ 1.8 / 1.8 (1.75 ± 0.188). One entry. |
| MC-CLAMP | P/P/P | P | Right: +17.0 / +24.0. Left: −60.0 / −53.0. Difference 7.0 both times. One entry per drag. |
| MC-KEY | P/P/P | P | 3× ArrowRight → −5.7 / +1.3. **3 entries.** The 3rd Ctrl+Z gives back `Undo: Volume`. |
| MC-DBL | P/P/P | P | → 0.0 / 0.0, one entry. The second double-click adds none. |
| MC-RESET-BTN | P/P/P | P | → 0.0 / 0.0, one entry. Focus moves to the field. `0 dB` is then disabled. |
| MC-FIELD | P/P/P | P | `-3` + Enter → −3.0 / −3.0, one entry. Type then Escape → field `""`, range restored, no entry. |
| MC-PENDING-DRAG | P/P/P | P | Type `-3` without Enter, then drag +20 px. Status at press already reads `2 კლიპი — −3.0 dB` (the text committed first). Final 14.5 / 14.5 (expected 14.5). Ctrl+Z → −3 / −3, Ctrl+Z → −6 / +1 with the sentinel title back. |
| MC-VIDEO-MIX | P/P/P | P | Shift+click on video gives {video, stems}. Field, fader and `0 dB` are disabled. title, field title and `aria-describedby` text are exactly R1. A drag and a double-click change nothing and write no entry. Stems stays −6.0. **See C-R115-01.** |
| MC-SELECT-MIDDRAG | P/P/P | P | Ctrl+A **does** change the selection while the fader is focused (music, stems, SFX), so the row is not inconclusive. Only stems changed (+8.8). SFX and music are unchanged. One entry. 0 refusal statuses. The selection change ends the drag (content remount, which A disclosed), so the second +10 px is ignored. |
| MC-SELECT-MIDDRAG-GROUP (extra) | P (r4) | P | Stems+SFX, +10 px, then Ctrl+A (3 clips), then +10 px. The drag **continues on the captured 2 ids**: Δ 17.5 each, music 0. One entry. This shows R8 in the real browser. |
| MC-BLUR-DISABLED (observe) | P/P/P | P | ArrowRight held ~0.5 s (repeat keydowns, no keyup) → −4.5 / −4.6. Ctrl+A → all 4 clips selected incl. video; fader disabled; focus → BODY. **No value lost:** stems keeps the previewed value. The `Clip Gain` entry is **not** written at Ctrl+A or at keyup; it appears only when the next edit (music Clip Gain −1) flushes it. Undo then restores in one step (−4.5 → −6.0, title back to the start). This is the known late-entry Low (GATE114-S3), not new. **Re-run with a track Volume edit as the later edit (1440 r6, video loaded):** the stems entry is flushed before the Volume entry and two Ctrl+Z restore −6.0, so the same holds outside the Clip Gain path. |
| NB-SINGLE | P/P/P | P | Single stems: +20 px → Δ 17.5, no range node, `+11.5 dB`. Double-click → 0. Undo works. |
| NB-TRACK-SHIFT | P/P/P | P | Plain = Shift = −0.19 (same as round 114). |
| NB-MASTER | P/P/P | P | −13.5 plain = Shift (same as round 114). |

### MC-PLAY (1440 ×3, `out/mcplay-1440-{1,2,3}.json`)
- **Setup:** music muted; stems −6 and SFX +1 multi-selected; play from 2.05 s.
- **Drag:** −40 px during playback.
- **Values:** range went from `−6.0 … +1.0` to `−41.0 … −34.0 dB`.
- **Level:** output peak −22.95 → −51.55 dBFS, a **28.6 dB drop**. The window ended at 3.65 s, before the SFX onset at 4.0 s.
- **Sources:** **0** `createBufferSource` calls between press and release (instrumented before load).
- **Transport:** playhead monotonic 2.05 → 4.10 s, still playing.
- **Both members live:** the 4.0–4.1 s tail peaks at −33.5 dBFS. That matches the SFX live gain of −34 dB on a 0 dBFS source, so the SFX member's gain changed live too.
- All 3 runs passed.

### G-T2-MULTI (`out/exp-1440-sfx-m12.json`, WAVs + `wav-sha256.txt`)
- **Harness deviation (not authorized by B; also in `harnessDeviations` in the JSON):**
  - With the exact recipe (Master 0 dB), the SFX baseline has 2 full-scale samples, so it is **invalid**.
  - The music substitute has 30, so it is **invalid** too.
  - The accepted run uses **Master −12 dB for all four exports** (round-29 R13-M1 precedent; Master is post-sum and linear).
  - Under that run both baselines have 0 full-scale samples and no overload message. The SFX baseline peaks at exactly −12.000 dBFS, so the Master-0 "clipped" samples were the source file's own 0 dBFS peaks, not summing overload.
- **Values:** stems −6 and SFX −2, multi-select, drag −20 px. Stored values: stems **−23.5**, SFX **−19.5**; difference **exactly 4.0**.
- **Stems:** peak and RMS ratio 0.066834 vs target 0.066834 (error −0.001 % / 0.000 %).
- **SFX:** peak and RMS ratio 0.105925 vs target 0.105925 (0.000 %).
- **Format:** WAV PCM 24-bit, 48 kHz, stereo, 101.352 s. 0 NaN, 0 clipped. Onsets at 2.000 s and 4.000 s; stems ends 18.0 s and SFX ends 6.0 s.
- The Master-0 run also gave exact ratios, but I do not count it because its baseline is invalid (`out/exp-1440-sfx-invalid.json`).

### Security and hygiene
- **G115-3** (alone, last): `/studio-lab` shows the demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ and the workspace.
  - `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.
  - The token API returns **401** `Please sign in to access Studio.`
  - The fake-Bearer 403 sub-check is **BLOCKED** (backend unavailable in cloud).
- **PX-NET / REG-HYD** (11 sessions, `out/px-net-reg-hyd.json`):
  - 0 forbidden-host requests and 0 `Authorization` headers.
  - 0 hydration errors and 0 `pageerror`.
  - Only the known cloud noise (cart / ERR_CONNECTION, 2 per session).

## 3. AN-REVIEW (static, re-read rather than taken from A's report)
- **R2:** lives in the new `clip-gain-multi.ts`.
  - Shared delta, clamped to `[−60−min, +24−max]`, then snapped to 0.1.
  - Audio-track members only.
  - A no-op returns the same object.
  - `model.ts`, `fader.ts` and `useRelativeFaderDrag.ts` are unchanged (frozen list OK).
- **Context:** `previewClipGainMembers` computes targets from `clipGainBeforeRef ?? present`, so previews come from the before state, and writes them onto `present`.
  - There is one pending slot, keyed by member set (R11).
  - The single-clip functions are thin wrappers.
  - Volume and Master machines are untouched.
- **Panel:**
  - R8 capture: `clipGainDragIdsRef` is set in `beginGesture`.
  - R9: `step={DETAIL_CLIP_GAIN_STEP_DB}`.
  - R1 text is exact.
  - `w-52` (within the `w-56` cap).
- **Granted test edits:** match §2 line for line (5 files, constant + selection only, strength kept). `clip-gain.test.tsx` l.783 is unchanged, as A said.
- **Project rules:** no type assertions, no `any`, no `@ts-ignore` in the added lines. No CSS file changed.
- **DOC-099:** follows the template sections; l.4 is exactly as §2. **DOC-098:** l.4 and CF1–CF14 are as R10.

## 4. Findings for B
- **C-R115-01 (Low, inherited pattern):** stage 1 already rendered a disabled group as `0.0`. R1 makes the video-containing group the only disabled-group state left. A disabled multi-selection that contains video shows the field `0.0` and fader `0.0 dB` while its audio member is at −6.0 dB.
  - The R1 reason is correct. The displayed value is misleading; there is no data impact.
  - Repro and evidence: `c-round-115.json`; screenshot `shots/video-mix-1440-1-panel.png`.
  - Goes to `deferred_low_polish` under the 2026-10-23 bug gate.
- **Known Low seen again (not new):** GATE114-S3. The late `Clip Gain` entry is written only at the next edit's flush. No value lost.
- **Not exercised:** A's reviewer #1 dead zone when returning from the floor. The B rows have no return leg, so I neither pass nor fail it.
- **Observation:** a single→group selection change during a drag ends the drag; the rest of the pointer movement is ignored. This is acceptable under the row criteria. B may decide whether that matches the intent of R8 for single→group.

## 5. Ableton correspondence (rated separately)
- **Multi-selection shows the range of differing values:** **confirmed per B's 2026-10-12 record** (Live 12 §8.4.7 + §8.13, plan.md l.636). I did not re-open the manual: the capture folder `b-round-29/` is not on this runner and I have no web tool. The CZABA text form matches the requirement.
- **Shared relative shift keeps the differences:** **დაუდასტურებელი** (unconfirmed) in Live. It is a CZABA requirement, and it is met.
- **A typed value sets every member:** **დაუდასტურებელი**. It is a CZABA decision, and it is met.
- **Video in the selection:** **არ ეხება** (not applicable to Live). The CZABA rule is met.
- **Shift fine / double-click reset:** confirmed for controls generally per the 2026-10-13 record. Inherited from stage 1 and met.

## 6. Gate (not claimed)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED and PROD-SSR-NUL are root-gate rows.

## 7. Harness notes
- **Debug runs** (not acceptance): runs 91–93 were not retained; the scripts `dbg-sel.cjs` and `dbg2.cjs` and two `shots/dbg-single-*.png` were kept. Run 1 was re-run after I fixed my harness (title-based entry counting, and the select-all deselect). App behaviour did not change between attempts.
- **Stopped/failed export attempts** are kept as `export-1440-music-attempt*` logs. Run 1440 r5 (`*-novideo`) repeated MC-BLUR-DISABLED without video by mistake; it is kept only as an observation.
- **Backlog check:** `context/active-backlog.json` lists GATE114-S1/S2/S5 (verified here), S3 (observed, known Low) and S4 (outside this round's scope). No other open item needed a check this round.
