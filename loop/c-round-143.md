# C — Round 143 verification: V-0.4e fix-up (C-R142-01)

Date: 2026-10-24 · Verifier: C · Task: `current-task.md` (D-29z108) · Env: `env-status.json` store 200 (round 143)

**Verdict: FAIL** · `browserVerified` = `realVerified` = **true**

The fix works: the video reason is 1 line at 1440, and its text, `title` and dash are correct. The only failure is the strict 1440 LAYOUT criterion for the video placeholder. A measured a delta of (+16, 0, −32, 0) and raised a STOP, but **B has not accepted it in writing**: there is no `b-round-143*`, no change to the task, and nothing in feature-status or loop.log. Under §5 ("Any breach = FAIL"), C cannot accept it. C's own control shows this is not a layout regression (C-R143-01, Low). A written B ruling alone, with no code change, closes it.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T143-TARGETED | PASS: 15 files, 357/357, same per-file counts as A | `c-round-143/out/vitest-targeted.json` |
| SOURCE-SCOPE | PASS: HEAD 6e9f9b1; frozen 955 OK at start and end; 8 granted hashes = `a-round-143/end-sha256.txt`, unchanged during C's phase; protected diff vs 6e9f9b1 = 0 bytes; `git status` = the same 22 paths at start and end | `out/c-start-status.txt`, `out/c-end-status.txt`, `out/c-start-granted-sha256.txt` |
| AN-REVIEW | PASS: only VR1, VR2, VR3 (2 Biome joins in the reason/fit files), PL1 (2 `it` titles), PL2 (2 lines) and DOC (status, l.36, one Problem→Solution entry) | `out/an-review.diff` |
| VIDEO-REASON-TEXT | PASS at 1440 and 1280: the reason text and the Clip Gain input `title` = `A video clip has no Clip Gain — use the track Volume/Mute`, dash U+2014, `aria-describedby` → reason id (the fader title is the same text too). Video + audio: `Clip Gain works on audio clips only — remove the video from the selection` (text + title), and the video-only text is absent | `out/c143-{1440,1280}-r1.json` |
| LAYOUT 1440 | **FAIL (placeholder only).** Strict nodes 0 breaches, panel d=0 in all 5 states, contentScroll 107/107, clipped 0. Video reason 1 line, box [640.5,779.5,329,16], d=(−1,0,+2,0) (text width 329 vs 327). R4 exempt: header label (−45,0,+43,0), apply (0,0,+22,0), toggle (−2,0,+2,0) (R4 says "+2 w"; it is right-aligned, so x follows). **Placeholder d=(+16,0,−32,0)**, not accepted by B → C-R143-01 | `out/layout-1440-r1.json`, `shots/video-1440-r1.png` |
| LAYOUT 1280 | PASS against `c142-1280-r1` (R3): every node d=0 in all 5 states; video reason 2 lines (= baseline); contentScroll 96/98/95/98/95 vs 83 (= baseline); clippedBelowPanel identical; no new horizontal overflow; the panel starts collapsed and was expanded | `out/layout-1280-r1.json` |
| NEIGHBOUR-SAMPLE (1440) | PASS. DETAIL-TEXT none: `Nothing selected`, `Collapse ▾` / `Collapse details`. DETAIL-STATUS: `Clip Gain unchanged: 0.0 dB.` CLIP-GAIN-AUDIO (real output RMS at the destination): base −22.56 dB, −20 dB → −42.59 (**drop 20.03 dB**), reset −22.63 (**Δ −0.07 dB**), valid windows 102/102/103 frames. LIBRARY-LABELS: folders Music 2 / SFX 2 / Music 1 / Stems 4; `stem` → 4 stems | `out/c143-1440-r1.json`, `out/audio143-1440-r1.json`, `out/lib143-1440-r1.json` |
| GEO-COUNT | PASS: the detail panel in the video and video + audio states has **0** Georgian at both viewports. No subtraction needed: the video file name is ASCII. The single audio state contains only the source title `Middle East — საჯარო preview` (data, R9) | same |
| G143-3 (alone, last) | PASS: `/studio-lab` shows the workspace and the demo badge in a fresh context without credentials. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]` at 1440 and 1280. `GET /api/studio-token` → 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud) | `out/g143-3.json`, `shots/g143-3-*.png` |
| PX-NET / REG-HYD | PASS: 5 contexts, 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 errors/pageerror (only the 2 known cart noise errors per context) | `net` in each out JSON |

Gate rows (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL. C did not re-run A's mutations m88–m90; those remain A's claims.

## C-R143-01 (Low): the placeholder delta is not ratified
- Process/criterion finding, no user-visible defect.
- Steps: fresh /studio-lab 1440×900, Snap off; add demo-middle-east → Music at 1 s and demo-hero-music → Stems at 1 s; load `media/clip-4s-vp9-opus.webm`; select the video clip; measure `arrangement-detail-video-placeholder`.
- Expected (§5): ≤1 px, or a delta that A measured and B accepted in writing before C's run.
- Actual: [735.5,759.5,139,16] vs baseline [719.5,759.5,171,16] → d=(+16,0,−32,0). No written acceptance exists.
- Why it is not a regression: the parent `arrangement-detail-waveform` d=0. C's in-page Georgian-swap control puts the placeholder at **exactly** the baseline box [719.5,759.5,171,16]. So the entire delta is the width of the centred, ratified round-142 `videoPlaceholder` string (`Video clip · no waveform`). The y −8 of C-R142-01 is gone.
- To close it, B rules (no code change): accept (+16,0,−32,0) as an R4-class text-width delta. B's §1 sentence "the video placeholder stands where it stood before round 142" assumed the Georgian placeholder width.

## Note for B (§8)
§8 has no row for this outcome: the FAIL comes from a literal criterion, the only finding is Low, and there is no code defect. C-R143-01 is not a `deferred_low_polish` candidate: deferring it would leave LAYOUT failed indefinitely. It closes by a ruling. A code fix-up is the wrong response, because A has nothing to change and the 333 px candidate would not move the placeholder. With the ruling, every other LAYOUT sub-criterion already holds (`layout-1440-r1.json`, `layout-1280-r1.json`). Round 144 can be a ruling plus a minimal C re-check.

## Ableton
- CZABA requirement: met (text, `title`, 1 line at 1440, multi reason unchanged).
- Ableton correspondence: **unconfirmed / not applicable**. The wording is CZABA-only, and the Live Clip View chapter is not in B's capture. No Live claim is made.

## Carry-over
C-R142-02 and C-R142-03 (Low) are unchanged; C-R142-03's 1280 clipping is identical to the baseline. The library collection labels and `ყველა ფაილი` are still Georgian (V-0.5 scope).
