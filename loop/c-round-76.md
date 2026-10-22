# C round 76 — SRW-16 stage 2b-1: clips snap to markers (D-29z41)

**Verdict: PASS. browserVerified=true, realVerified=true. No bugs.** C did not edit `store/`, and did not commit or push.
Env: `env-status.json` round 76 store 200 (re-checked: `/studio-lab` loads). Backend :5199 unavailable (expected in the cloud).

## Method
- Real Playwright Chromium (headless, installed), new context, no credentials, `http://127.0.0.1:5173/studio-lab`, at **1440x900 and 1280x720**. All pointer input was real mouse moves via `page.mouse` (Alt/Ctrl/Shift held with `keyboard.down`).
- Tools: `c-round-76/tools/ms76.cjs` (groups A–G, one fresh page per group), `g76.cjs`, `tok.cjs`. Raw results: `c-round-76/ms76-<vp>-<group>.json`, `meter-<vp>.json`, `g76-<vp>.json`, `token-api.json`, `vitest-targeted.txt`, screenshots in `c-round-76/shots/`.
- **Fixture (deviation, recorded):** Snap on, grid 1 s (default `data-grid-seconds=1`), 40 px/s. I added the markers with Snap off by clicking the ruler and pressing M, Enter. Their observed `data-marker-time` values are **6.300 and 14.700**, not the example 12.3/20.7, because the 1280 timeline shows only 19.2 s. Both are off-grid, so a result of x.300 or x.700 can only come from a marker candidate. 1 px = 25 ms.

## Acceptance (both viewports, identical results)
| ID | Evidence (1440 / 1280) | Result |
|---|---|---|
| MS-MOVE | Soft impact 1.000 → raw start 6.375 (3 px past the marker) → `data-clip-start` **6.300**; undo `კლიპის გადატანა`. Grid probe: raw 6.075 (marker 9 px away) → **6.000** | PASS |
| MS-MOVE-END | 2 s clip, raw start 12.750 / raw end 14.750 → start **12.700**, end **14.700** | PASS |
| MS-CROSSLANE | sfx → music and sfx → stems, raw 6.375: `data-ghost-start` **6.300** (blocked=false) during the drag; after the drop the clip is on the target lane at **6.300**; undo label `გადატანა ხაზზე — …` | PASS |
| MS-TRIM | Slow rise 12–17, right trim raw end 14.750 → end **14.700**, offset 00:00.000. Slow rise 5–10, left trim raw 6.375 → start **6.300**, end 10.000, **source offset 00:01.300** (detail panel and status). The offset was verified from the model readout, not by an audio measurement (the slow-rise onset could not tell them apart). No blocked text | PASS |
| MS-GROUP | Click A (1.000), Ctrl+click B (4.000), both selected; drag A to raw 6.375 → A **6.300**, B **9.300** (offset 3.000 kept); undo `გადატანა (2)` | PASS |
| MS-DROP | Library Soft impact at raw 6.375: ghost `00:06.300`, left 252 px (= 6.3×40), clip **6.300**. Slow rise with raw end 14.750: ghost `00:09.700`, clip 9.700 → end **14.700**. Video-lane hover: ghost `00:06.000 · აუდიო ვიდეოხაზზე არ ემატება`, blocked=true (still grid-only), status `აირჩიე აუდიო ხაზი …`, no clip added | PASS |
| MS-SNAPOFF-ALT | raw 6.375: Snap off → **6.375** (free); Snap on + Alt → **6.375** (free); Snap off + Alt → **6.300** (marker) | PASS |
| MS-UNDO | `(id,time,name)` of both markers byte-equal before the move, after it, after Ctrl+Z and after Ctrl+Shift+Z. Ctrl+Z → 1.000, undo title back to the previous entry; Ctrl+Shift+Z → 6.300. One step | PASS |
| MS-PLAY (real audio) | Long Middle East clip on music (not soloed) keeps the project end at 1:41. SFX Solo on, video Mute on (real clicks). (1) Clip on 6.300, double-click marker 6.3: `data-level-db` (10 ms sampler) −inf → **0.0 dB onset at 79 ms** (1440: 78.9, 1280: 78.7), transport 6.3 → 7.47. (2) Ctrl+Z (clip at 1.000–3.000, does not cover 6.3), play from the marker again: the transport advanced to 7.55/7.56 and the meter stayed **−inf for 1.3 s** (no sample ≥ −15 dB). Solo/Mute restored | PASS |
| REG-EDGES | Marker present: reference clip edge 6.200 (music, Snap-off drop at 4.2). Raw 6.225 → **6.200** (edge wins); raw 6.275 → **6.300** (marker wins). Fresh load, no markers: raw 6.225 → 6.200, raw 6.275 → **6.200**, raw 6.075 → 6.000 (round-75 behaviour, M8) | PASS |
| REG-MARKERS | Marker 6.3 dragged +40 px with Snap → **7.000**, `Move Marker`; right-click opens one menu `[სახელის შეცვლა (F2), დაკვრა აქედან, წაშლა (Delete)]`; Play from here → 14.86 → 15.46 (1280) / 14.89 → 15.49 (1440) | PASS |
| T76-TARGETED | A's 8-file vitest list, run once: **8 files / 201 tests passed** (`vitest-targeted.txt`) | PASS |
| REG-HYD | Every page (groups A–G, both viewports): 0 hydration / `useLayoutEffect` lines, 0 non-noise errors | PASS |
| G76-3 | Header link → `/studio-lab`, workspace and demo badge (both viewports). Anonymous `/studio/middle-east` → "Sign in required", 0 workspaces. Anonymous `/api/studio-token?product=…&file=…` → **401** (request context and in-page). Page network: 0 `/api/studio-token` (the only 2 were C's own probes), 0 recording/download/R2, 0 Authorization headers | PASS (fake-Bearer sub-check BLOCKED) |
| SOURCE-UNCHANGED | Start and end: HEAD e347b973; status 4 M + 2 ??; A's hashes 0398debc / 168cd442 / 4b82508a / 8bd53baf / 2b1baff1 / 8576ba44; frozen 451/451 OK; protected 4/4 (cd68eb6e, 9f738237, 13914809, fa2cf0bc) | PASS |

**Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
**Blocked:** the fake-Bearer 403 sub-check of G76-3. `/api/studio-token` with a fake Bearer returns 500 "Unable to prepare Studio access" because the backend is unavailable in the cloud. It is not a PASS and not a FAIL of A.

## Harness notes (disclosed; no app fault)
- At 1440, MS-PLAY needed 3 harness-invalid attempts before the valid one:
  1. Solo/Mute were clicked after the move, so Ctrl+Z undid Mute.
  2. Space was pressed while the marker had focus, so the transport did not stop and the next double-click toggled it off.
  3. With only the SFX clip, the project ended at 3 s and the transport would not start at 6.3.
  
  Half 1 agreed in all 1440 attempts: onsets 80, 82, 78 and 79 ms, all 0 dB. The 80 ms and 82 ms values come from the C session log; their JSON files were overwritten by the rerun. The half-2 results of the first three attempts are invalid for the reasons above. This is more than the budget's "two extra attempts", but none of them was a measurement miss and no tolerance was changed. At 1280 the first measurement was valid.
- `page.mouse.click({modifiers})` does not send modifier keys, and a dropped clip is auto-selected. My first group setup therefore toggled B off. It was rerun with click A, then a held-Ctrl click on B.

## CZABA requirement vs Ableton match (judged separately)
| Behaviour | CZABA (this round) | Ableton match |
|---|---|---|
| Clip move / cross-lane move snaps to locators | PASS | Confirmed (Live 12 §6.7 text, B capture 2026-10-21) |
| Trim snaps to locators | PASS | Inference (§6.7 does not say "resize" explicitly) |
| Group move, library drop to markers | PASS | Unconfirmed (CZABA consistency rule) |
| Nearest wins, tie → grid, no px threshold | PASS for "nearest" (grid vs marker, edge vs marker). The exact tie was not browser-tested (vitest MS3 only) | Unconfirmed |
| Alt inverts Snap | PASS | Confirmed (§6.10) |
| Shift time lock ignores markers | Not a C row; vitest MS13 only | CZABA rule |
| Time-signature snap | — | Not applicable |

## For B (observations, not bugs)
1. **MS8c (A's note):** if the nearest candidate is a marker outside the group bounds, the group falls back to the grid and skips a nearer in-bounds clip edge. This complies with M2. I did not test it in the browser. B decides whether a later stage tries the next-nearest in-bounds candidate.
2. **Pre-existing:** Solo and Mute clicks are undo-history entries (`Undo: Mute — ვიდეო`), so Ctrl+Z after toggling Mute undoes Mute, not an earlier clip move. This round did not change it, and no contract covers it.
3. **Pre-existing:** double-clicking a marker that lies after the project end does not start the transport and shows no status text. This round did not change it.
4. **Architecture signal (A/code-reviewer):** `clipEdgeTargets(…, markerSnapTimes(arr))` now appears at 4 call sites. The proposal is one `snapEdgeTargets` helper in `grid.ts`; keep it as is for now.
5. Root pre-push and gate findings: nothing new from C. GATE75-S1/S2 remain scheduled after stage 2b, as `current-task.md` says.
