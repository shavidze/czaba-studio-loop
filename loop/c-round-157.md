# C round 157 — V-2b-3b verification (Export timecodes in mono, css2 trim, Export "0:00" fix)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. 0 bugs. The only blocked item is the G157-3 fake-Bearer 403 check (backend unavailable in cloud).
Environment: `env-status.json` store 200 (round 157, attempt 1). Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.

## Sessions
| Session | Status |
|---|---|
| c157-1440-r1 | **INVALID (ENV-FIRST-LOAD)**: cold Vite load, "Invalid hook call" + hydration replace, the workspace vanished. Replacement 1 of 2. |
| c157-1440-r2 | Valid environment, superseded. My harness read the range inputs as raw seconds (`3`) and expected Escape to clear the range. Harness fixed only. |
| c157-1440-r3 | Valid. All rows green. Font responses 10/10 were 200. |
| c157-1280-r1 | Valid. All rows green. Font responses 10/10 were 200. |
| ff157-1440 / ff157-1280 | FONT-FAIL sessions (fonts aborted on purpose), plus FONTS-SCOPED and the raw SSR HTML check at 1440. |
| p157-1280 | Probe: dialog scroll reachability and Escape behaviour. |
| p157b-1440 | Probe: loop on with the range cleared, Export opened for the first time. |
| g157-3 | Anonymous / protected-route / token check. |

Tools are in `c-round-157/tools/`: `c157.cjs`, `ff157.cjs`, `p157.cjs`, `g157-3.cjs` and `sum157.py`, with helpers copied from round 156. In `lib122.cjs` I changed only the stale button labels (`Export WAV`, `Done`) and the shot path. Output is in `c-round-157/out/` and screenshots are in `c-round-157/shots/`.

## Row results
| Row | Result | Evidence |
|---|---|---|
| T157-TARGETED | PASS | 43 files, **684/684** (same count as A). ST-TP4, ST-TP5, XU6, XU7, XU8 and TH7 are present and green. See `out/vitest.json`. |
| SOURCE-SCOPE | PASS | HEAD is `cbcd3d9`. Frozen 968 OK at start and at end. `a-round-157/end-sha256.txt` matches 8/8. `git status` shows exactly 7 ` M` + 1 `??`. `git diff --name-only cbcd3d9` lists only the 7 granted paths, so the protected diff is empty. The 976-file start and end hashes are identical, so no source changed during C's phase. |
| AN-REVIEW | PASS | See the notes below this table. |
| TEXT-BYTES-E | PASS | Tables below. |
| MONO-STYLE-N13…N16 | PASS | Tables below. |
| LAYOUT-FIT-E | PASS | No new truncation or wrap. The known C-R124 state applies at 1280. |
| CSS2-TRIM | PASS | See the details below this table. |
| FONT-INVENTORY | PASS | Table below. |
| FONT-FAIL | PASS | Both viewports. Fonts were aborted (3 css2 requests). Play 1 s moved the playhead (0 → 0.99 / 0.97). Clip select, Export open with the description `Entire project · 00:00.000 — 02:30.372`, Done and Escape all worked. 0 pageerror. Fallback: computed `"Instrument Sans", "Noto Sans Georgian", system-ui, sans-serif` rendered as **DejaVu Sans [local]**; mono rendered as **DejaVu Sans Mono [local]**. `document.fonts` is empty. |
| FUNC-SMOKE-E | PASS | Both viewports. See the details below this table. |
| G157-3 | PASS (fake-Bearer row BLOCKED) | `/studio-lab` is anonymous: workspace present and the "Demo collection — no sign-in required" badge shown. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token` → **401**. Fake-Bearer 403: BLOCKED (backend unavailable in cloud). |
| PX-NET / REG-HYD | PASS | Every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only cart noise appeared (2–7 messages). r1 is invalid and is not counted. |

**AN-REVIEW notes:**
- The S1 builders produce exactly the §1 parts and every id starts with `export-`.
- `studioExportStrings`, `studioWorkspaceStrings` and the two round-156 builders are untouched.
- The dialog diff is limited to E0–E4, and `rangeLabel` is removed.
- The only literal change is `'0:00'` → `'00:00.000'` in the `ModalDescription`.
- F1 changes only the URL.
- T1 changes the ST-TP3 title, its key list and its loop, and appends the rest. Info: ST-TP3 also gained one local `exportSpan` constant inside the existing `it`. A disclosed this, and the loop needs it.
- T2 changes only TH7 (href plus two lines).
- T3 changes l.39 and appends XU6–XU8. XU7 also asserts the accessible name. XU8 compares against the `studioExportStrings` loop notes.
- Doc 126 changed only its status line.
- Doc 127 is in Georgian and has every TEMPLATE section.
- Mutation JSONs m147–m150: the red tests match §3. I did not re-run them.

**CSS2-TRIM details:**
- The Studio css2 `<link>` in the DOM and in the raw SSR HTML is exactly one link, string-equal to R4.
- The css2 body was fetched in the page: 25 `@font-face` blocks. The (family, weight) set is exactly {Instrument Sans 400:2, 500:2, 600:2; IBM Plex Mono 400:5; Noto Sans Georgian 400:7, 500:7}. There is no Instrument Sans 700 and no Plex Mono 500.
- Every woff2 that was requested maps to Instrument Sans 400–600, Plex Mono 400 or Noto Sans Georgian 400/500, so no removed face was requested.
- `document.fonts` never lists Instrument Sans 700 or Plex Mono 500 at any status.
- FONTS-SCOPED: `/` and `/products` link only the root Playfair css2 and request only Playfair and Inter. No Studio css2 is linked there.

**FUNC-SMOKE-E details:**
- Play 2 s: the playhead moved 0 → 1.98 / 1.97 and the tapped output peak was 0.1266.
- Range WAV (3–5 s): one download, `czaba-studio-lab-range.wav`, RIFF PCM 24-bit 48 kHz stereo, 96000 frames = **2.00000 s**, 0 NaN, peak 1.0.
- Project WAV: one download, 7217877 frames = **150.37244 s**. The project end is `02:30.372`, a difference of 0.44 ms.
- Done and Escape both close the dialog, and focus returns to the `Export` button.

### TEXT-BYTES-E (same results at 1440-r3 and 1280-r1)
| Case | Site | Reference (strings.ts template + shown times) | Byte-equal |
|---|---|---|---|
| (a) no range | description | `Entire project · 00:00.000 — 02:30.372` | ✔ — no longer `0:00`, so **B-R155-EXPORT-ZERO is closed** |
| (a) | project option | same | ✔ |
| (b) 3→5 range (clip-body drag; inputs read 3 / 5) | description | `Time selection · 00:03.000 — 00:05.000 (2.000 s)` | ✔ |
| (b) | range option | same | ✔ |
| (b) | project option (with range) | `Entire project · 00:00.000 — 02:30.372` | ✔ |
| (b) choose project → back to range | description | (a) text, then the (b) text | ✔ ✔ |
| (c) loop on (Ctrl+L: "Loop created and turned on: 00:03.000 — 00:05.000."), range scope | loop note | `Loop does not change the export — the time selection is exported (00:03.000 — 00:05.000, 2.000 s).` | ✔ |
| (c) loop on, project scope | loop note | `Loop does not change the export — the entire project is exported (00:00.000 — 02:30.372).` | ✔ |
| (c) loop on, range cleared (sfx lane click; Escape does not clear it, see N3) | description + loop note | (a) text + `loopProjectNote`, 2 mono spans each | ✔ ✔ in c157 at both viewports, and in a clean first-open probe `p157b-1440` (scopeChoice still null: project checked, range radio `disabled=true` with the "Make a time selection…" reason). The c157 boolean `rangeDisabled:false` contradicts its own screenshot (`c157-export-loop-noRange-*.png`, range option greyed with the reason), so I treat it as a harness read issue; p157b re-measured it. Source: the radio's `disabled={!hasValidRange…}` comes from the context `range` (l.95–98, outside the diff). |
| (d) CDP `Accessibility.getPartialAXTree` | project radio | name = `Entire project · 00:00.000 — 02:30.372` | ✔ |
| (d) | range radio (with range) | name = `Time selection · 00:03.000 — 00:05.000 (2.000 s)` | ✔ |
| (d) | range radio (no range) | name = `Time selection` (disabled branch, unchanged) | as before |

`getByRole('radio', { name, exact: true })` resolved exactly 1 element.

### MONO-STYLE-N13…N16 (1440-r3; 1280-r1 identical)
| Site | Mono spans (exactly 2) | family / weight / numeric | CDP platform font | "(2.000 s)" / text in a span? | Surrounding text |
|---|---|---|---|---|---|
| N13 description (project, range, loop-no-range) | `00:00.000`,`02:30.372` / `00:03.000`,`00:05.000` | IBM Plex Mono / 400 / tabular-nums | IBM Plex Mono [web] | no | Instrument Sans [web] 400 |
| N14 project option | `00:00.000`,`02:30.372` | same | IBM Plex Mono [web] | no | Instrument Sans [web] 400 |
| N15 range option | `00:03.000`,`00:05.000` | same | IBM Plex Mono [web] | no | Instrument Sans [web] 400 |
| N16 loop note (range / project / no range) | 2 each | same | IBM Plex Mono [web] | no | Instrument Sans [web] 400 |

No other `font-mono` class appears inside these sites. The Master-mute note (`… with 2.000 s of silence …`) has 0 spans and stays sans, as R1 requires.

### LAYOUT-FIT-E (range + loop + Master mute on)
| Site | 1440: cw/sw, lines | 1280: cw/sw, lines | natural mono / sans width |
|---|---|---|---|
| description (range) | 494/494, 1 | 494/494, 1 | 323 / 315 |
| project option | 254/254, 1 | 254/254, 1 | 254 / 241 |
| range option | 323/323, 1 | 323/323, 1 | 323 / 315 |
| loop note (range) | 494/494, 2 | 494/494, 2 | 646 / 636 (sans wraps to 2 lines too) |
| loop note (project) | 494/494, 2 | 494/494, 2 | 587 / 572 (sans wraps to 2 lines too) |

- There is no overflow anywhere, and line counts are unchanged compared with sans.
- **Footer vs focused control:** with the range radio focused (Tab), the 1440 radio is at 615–628 against a footer top of 772.5. At 1280, the browser scrolled the body to scrollTop 21, putting the radio at 574.5–587.5 against a footer top of 612. The footer covers neither.
- At 1280 the range card bottom (625) sits 13 px under the footer, and the loop and mute notes are below it until the body is scrolled. At scrollTop 141 all of them are above the footer (`out/p157-1280.json`, `shots/p157-export-scrolled-1280.png`). This is the known C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER state, not a new finding.

### FONT-INVENTORY (1440 every state; 1280 S0 + Export)
| State | Visible weight ≥700 | Plex ≥500 | Weight-600 elements | IS 700 / Plex 500 faces |
|---|---|---|---|---|
| S0 (1440, 1280) | 0 | 0 | none | none |
| selected clip + Detail expanded | 0 | 0 | none | none |
| range | 0 | 0 | none | none |
| all tracks (Ctrl+Shift+L) | 0 | 0 | none | none |
| range + loop | 0 | 0 | none | none |
| marker menu (open = 1) | 0 | 0 | none | none |
| grid menu (open = 1) | 0 | 0 | none | none |
| library preview playing ("■ Stop") | 0 | 0 | none | none |
| Export with range + loop + Master mute (1440, 1280) | 0 | 0 | `h2 "Export"`: the ModalTitle, Instrument Sans, as expected | none |
| Toast | No Toast appeared in any state. The cart failure produced console noise only. | | | |

## Notes for B (no bugs)
- **C-157-N1 (info):** Instrument Sans and Noto Sans Georgian are served as variable fonts, so all requested weights share the same subset woff2 URLs. Removing Instrument Sans 700 saves no font bytes; the byte saving of R4 comes only from the Plex Mono 500 static files. No synthesized bold appears: 0 visible elements at weight ≥700.
- **C-157-N2 (info):** `/studio-lab` also carries the root Playfair css2 link (`root.tsx` l.37, protected) and the `app.css` `@import` of Inter 300–800. Both existed before and are unchanged. I read "links exactly the R4 URL" as applying to the Studio css2 link.
- **C-157-N3 (harness):** Escape does not clear a time selection, with or without a loop or the dialog (`p157`). This matches the recorded existing behaviour, where deselecting is a click on empty lane. The round-156 escape check passed only because Undo had already removed the range.
- **C-157-N4 (harness):** the task row says "Cancel"; the idle footer button is "Done", and Cancel exists only while rendering. I tested Done and Escape.
- **C-157-N5 (pre-existing):** the demo-mix WAVs reach peak 1.0 with full-scale samples (range 797, project 4741). The round-154 project export also reached peak 1 (3676). No audio code changed, so this is not a round-157 finding. B may want a separate look at Master headroom or a limiter.
- **Ableton parity:** not applicable. This is a CZABA brand decision (`visual-direction-a.md` typography).

## Not run
- Per the task: MONO-STYLE N1–N12, the round-156 TEXT-BYTES (a)–(f), WEIGHT-STYLE, MASTER-OVER, RV-1, LABEL-STYLE and RV-2. Their code is unchanged.
- Gate rows: full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
- No app source was edited, and nothing was committed.
