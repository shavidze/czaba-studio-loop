# C — Round 155 verification: V-2b-2 fix-up (C-R154-01, lane-move ghost timecode)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z120) · **Verdict: PASS** · `browserVerified` = `realVerified` = **true**

Real Playwright Chromium, a fresh context per session, `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720. `envStatus`: store 200 (`env-status.json`, 2026-10-25T04:52:44Z). Tools: `c-round-155/tools/` (`c155.cjs` was adapted from `c154.cjs`; also `g155-3.cjs` and `sum155.py`). Raw output is in `c-round-155/out/` and screenshots are in `c-round-155/shots/`.

## Sessions
| Run | Status | Note |
|---|---|---|
| c155-1440-r1 | **INVALID (ENV-FIRST-LOAD)** | A cold Vite first load caused "Invalid hook call" and a hydration replace, and every section failed. This used the one allowed replacement. |
| c155-1440-r2 | valid, info only | The setup lacked the stem clip from the C-R154-01 repro, so the release went to Stems. N6 still measured 400 / "IBM Plex Mono [web]". |
| c155-1440-r3, c155-1440-r4 | valid | Exact C-R154-01 repro (hero@Music 0 s, pulse@Stems 2 s, Soft impact@SFX 4 s, snap off). 9 font responses, all 200, 0 failed. |
| c155-1280-r1 | valid | Same repro. 9 font responses, all 200. |
| g155-3 | valid | Fresh context, no credentials. |

## Rows
| Row | Result | Evidence |
|---|---|---|
| T155-TARGETED | **PASS** | I re-ran the 24 files in `a-round-155/vitest-files.txt`: 382/382, the same as A. TH10 passed. It contains the new N6 `after` string and the (ii) container/span lock (read in the diff). `out/vitest.json` |
| SOURCE-SCOPE | **PASS** | HEAD is `037e25f`. The frozen 970 match at start and end, and A's end hashes match 3/3. `git status` shows 13 ` M` + 1 `??` (the same paths as round 154). The protected diff vs `037e25f` is empty, including `CookieConsent.tsx`, `Modal.tsx`, `root.tsx`, `app.css`, `studio-lab.tsx` and `package.json`. C start and end hashes for all 973 files are identical, so no source changed during C's phase (`out/c-start-sha256.txt`, `out/c-end-sha256.txt`). |
| AN-REVIEW | **PASS** | I diffed each file myself against `b-round-154/r155-granted-start/`. `ArrangementLane.tsx` changed by +1/−1 (one `font-normal` token on l.929). The container l.912 is unchanged. The TH file changed by +18/−1 (the N6 `after` line and the (ii) block). Doc 125 changed by +6/−1, in Georgian: the status line is `In Progress (awaiting C round 155)`, plus the C-R154-01 Problem → Solution entry, the round-155 testing entry and the TODO updates for R3/R4. |
| MONO-STYLE-N6 | **PASS** | See the table below. |
| LANE-GHOST-FIT | info (measured) | See the table below. |
| PLEX500-INVENTORY | **PASS** | See below. |
| COOKIE-SOURCE | source PASS; render **BLOCKED** | See below. |
| FUNC-SMOKE-S | **PASS** (both viewports) | See below. |
| G155-3 | **PASS**; fake-Bearer 403 **BLOCKED** | `/studio-lab` loads the workspace and the "Demo collection — no sign-in required" badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`, at both 1440 and 1280. `GET /api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`. Page requests: 0 forbidden, 0 Authorization headers, 0 errors, 0 hydration messages. The fake-Bearer 403 check is blocked because the backend is unavailable in the cloud. `out/g155-3.json`, `shots/g155-3-*.png` |
| PX-NET / REG-HYD | **PASS** | Every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. The only noise was the 2 expected cart messages per session. The hook/hydration errors appeared only in the invalid cold-Vite r1. |

### MONO-STYLE-N6 (hold over Music, `[data-testid=arrangement-lane-move-ghost-label] > span:first-child`)
| VP | text | family | weight | numeric | CDP platform font | title span | release | Ctrl+Z |
|---|---|---|---|---|---|---|---|---|
| 1440 (r3, r4) | 00:05.000 | IBM Plex Mono | **400** | tabular-nums | **IBM Plex Mono [web]** (not Medium) | "Soft impact", Instrument Sans 500, CDP Instrument Sans [web] | "No room here — … SFX, start 00:04.063." | **Undo: Move clip**, SFX back to 4.000 |
| 1280 (r1) | 00:05.000 | IBM Plex Mono | **400** | tabular-nums | **IBM Plex Mono [web]** | the same | the same | **Undo: Move clip** |

Round 154 measured the same element at weight 500 with "IBM Plex Mono Medium [web]". The fix shows up in the browser. Screenshots: `shots/c155-ghost-sfx-to-music-*.png`.

### LANE-GHOST-FIT (info)
- **Start-time width:** 63 px at both viewports. This is unchanged and matches B's prediction (Plex Mono has the same advance width at every weight).
- **Soft impact ghost:** the ghost is 2 s = 80 px wide. The title measures clientWidth **1** / scrollWidth 65, the same as round 154, so it is effectively hidden. This is a pre-existing narrow-ghost fit, not a regression.
- **Long clip (hero music held over SFX):** the title "CZABA hero — საჯარო preview" measures 180/180 and is fully visible. Its timecode is Plex Mono 400 [web]. Screenshot: `shots/c155-ghost-music-to-sfx-*.png`.

### PLEX500-INVENTORY (1440, sessions r3 and r4)
- **States scanned, each while active:** S0, lane-move ghost hold, long-clip ghost hold, library drop-ghost hold, S1 (Group "Music, Stems" created), S1 lane-ghost hold, S1 drop-ghost hold, marker menu (open = 1), grid menu (open = 1) and the Export dialog.
- **Plex Mono at weight ≥ 500:** 0 visible elements in every state. Every visible Plex Mono element is weight 400 (50 to 210 elements depending on the state).
- **`document.fonts` loaded at the end of the session:** IBM Plex Mono 400, Instrument Sans 400/500/600 and Noto Sans Georgian 400/500. **IBM Plex Mono 500 is `unloaded`**: css2 declares it but nothing uses it.
- **Visible elements at weight ≥ 600 on the whole page:** none in S0, S1, the marker menu or the grid menu. The only one is the Export dialog `h2` "Export" at 600 (the protected `ModalTitle`). This matches the expectation.
- **Note:** round 154's grid-menu inventory never opened the menu (`gridMenuOpen` 0). This round right-clicks the lane background inside the viewport, and the menu opened.

### COOKIE-SOURCE (read-only)
- `CookieConsent.tsx` returns `null` while `isVisible` is false.
- `isVisible` only becomes true inside the `useEffect`, after the `if (!GA4_MEASUREMENT_ID) return;` guard. `GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || ''` (in `app/lib/analytics`). Only `.env.example` exists, so the banner never renders in the cloud.
- The component's only weight class is `font-medium` (l.78). It has no `font-semibold`, `font-bold` or `font-[6-9]00`.
- The browser render is **blocked: GA4 not configured in cloud**. This does not affect `browserVerified`.
- R4's two conditions (zero Plex Mono 500 consumers, and no 600/700 in the cookie banner) both hold on this evidence.

### FUNC-SMOKE-S (1440 r3/r4 and 1280 r1)
- **Play 2 s:** the playhead moved 0 → 1.97–1.98 s. The AudioContext was `running` and the measured output peak was 0.1266.
- **Cross-lane drag to free space:** the SFX clip moved to Stems at 24 s ("Move to track — Stems: start 00:24.000."). Ctrl+Z gave "Undo: Move to track — Stems" and SFX was back at 4 s. Checked at both viewports.
- **Blocked cross-lane drag:** the Music drop was refused ("No room here"). Ctrl+Z gave "Undo: Move clip" and the clip was restored.
- **Library drop:** while I held the drag, the ghost appeared on SFX ("00:12.000", not blocked). The release added "Soft impact" at 00:12.000. Ctrl+Z gave "Undo: Add — Soft impact" and the clips were restored. Screenshots: `shots/c155-dropghost-*.png`.
- **Lane M:** the measured output peak was 0.1266 before, 0 with Music muted, and 0.1266 after Ctrl+Z ("Undo: Mute — Music", `aria-pressed` false).

## Bugs
None new.

Observations, not filed:
- **Drop-ghost timecode:** it renders Instrument Sans 500. That is V-2b-3 scope (D-29z120 R3).
- **Narrow ghost title:** a 2 s ghost leaves the title 1 px wide. This is unchanged since round 154, and the task records it as info only.

## Ableton
The row is **not applicable**: CZABA brand typography (`visual-direction-a.md`). I make no parity claim.

## Gate and not-run rows
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
- **Not re-run, per the task (code unchanged since C round 154):** WEIGHT-STYLE, MASTER-OVER, MONO-STYLE N1–N5, RV-1, NO-CLIP/OVERLAP, FONTS-SCOPED, the full FUNC-SMOKE with WAV export, LABEL-STYLE, RV-2 and FONT-FAIL.

## For B
- MONO-STYLE-N6 and PLEX500-INVENTORY pass, and COOKIE-SOURCE holds at source level. The R4 css2 trim conditions are met: removing Plex Mono 500 has evidence of zero consumers. Instrument Sans 600 is still used by the Export `ModalTitle`.
- Per §7, root may publish rounds 154 + 155 after its gate.
