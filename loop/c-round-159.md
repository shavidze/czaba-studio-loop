# C round 159: verification of the V-3a fix-up for C-R158-01

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z124) · Evidence: `c-round-159/` · JSON: `c-round-159.json`

## Verdict: **PASS**. browserVerified = realVerified = **true**
- C-R158-01 is closed. In real Chromium (Playwright), at 1440×900 and 1280×720, all 12 transport buttons compute `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- In a `reducedMotion: 'reduce'` context (`matchMedia(...).matches = true`), all 12 compute `transition-property: none`.
- Every other round-158 SURFACE sub-row returned exactly the same raw computed values as round 158, at both viewports.
- The global transition rule still applies outside the transport.
- Button boxes moved 0 px.
- The premium route is not bypassed.
- Bugs: none.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T159-TARGETED | PASS. 25 files, 386/386, the same count as A. TS1–TS6 present and passed. | `c-round-159/out/vitest.json`, `vitest.log` |
| SOURCE-SCOPE | PASS. HEAD `f8a316a`. Frozen 975 OK at start (08:14Z) and at end (08:22Z). `a-round-159/end-sha256.txt` 4/4 OK. `git status` = 2 ` M` + 2 `??` exactly. Protected diff vs `f8a316a` is empty (incl. `app/styles/**`, root, icons, Modal, Toast, CookieConsent, strings, StudioWorkspace, studio-lab, auth/purchase files). All 978 tracked + untracked files hashed at start and end, byte-identical: no source changed during C. | `c-round-159/out/c-start-sha256.txt`, `c-end-sha256.txt` |
| AN-REVIEW | PASS. C diffed `b-round-158/r159-granted-start/` itself; it equals `a-round-159/diff-vs-start.patch`. Component: only the 3 motion tokens get a trailing `!`, plus `motion-reduce:transition-none!` (F1). Test: only TS1 (N1'). Doc 128 contains D2'. No `style=`, no CSS file, no hex, no leading `!`. Cumulative diff vs `f8a316a` = round-158 scope (lucide Play/Pause/MoveHorizontal, surfaces, Loop-on hover, Export outline, doc 127 status) + F1. | diff read inline |
| SURFACE-STYLE (a)–(g) | PASS, both viewports. 134 checks per viewport, 0 fails. Raw values are identical to round 158 for every non-(h) row. The contrast table is identical too. | `c-round-159/out/surface-{1440,1280}.{json,md}` |
| SURFACE-STYLE (h) | **PASS**, 12/12 per viewport (r158 FAIL) | tables below |
| SURFACE-STYLE (h-rm) | **PASS**, 12/12 per viewport, `transition-property: none` | tables below; `c159-*.json` `.reducedMotion` |
| SURFACE-STYLE (i) | PASS. Play, Fit, Export: `:focus-visible`, and the 2 px `rgb(201,164,106)` ring is complete on the first read (about 40 ms after Tab) and at +300 ms, so the ring is now immediate. | tables below |
| CASCADE-SCOPE | PASS. Library collapse button, lane Mute (M) and Export Done are all `BUTTON` and match the global selector. All still compute `color, background-color, border-color, box-shadow, transform, opacity` / `0.15s ×3, 0.25s, 0.15s ×2` / `ease-out ×6`. | tables below; `shots/export-idle-done-c159-*.png` |
| RV1-V3A | PASS. `b-round-157/tools/d6.cjs` (sha256 OK against `b-round-157/tools-sha256.txt`), one run per viewport. S0/S1/S2: 111/122/131 keys (1440) and 103/121/130 (1280). 0 missing, 0 added, maxDelta **0 px**. | `c-round-159/out/rv1-{1440,1280}-ref-vs-r1.json`, `out/d6/` |
| FUNC-SMOKE-T | PASS, both viewports (details below) | `c159-*.json` `.play2s`, `.cascade`, `.exportEsc` |
| G159-3 | PASS. `/studio-lab` anonymous, workspace + demo badge. `/studio/middle-east` (1440 and 1280): "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token` returns 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud). | `c-round-159/out/g159-3.log`, `shots/g159-3-*` |
| PX-NET / REG-HYD | PASS in every valid session (c159 ×2 + reduced-motion ×2, d6 ×2, G159-3 contexts): 0 forbidden, 0 Authorization, 0 hydration, 0 pageerror, fonts all 200. Only the expected cart noise. | `netOk` in each JSON |

**Invalid run (replaced once):** `c159-1440 r0`. On the first cold Vite load it logged a hydration warning and "Invalid hook call" (ENV-FIRST-LOAD, as in round 158). It did not recur. Kept as `out/c159-1440-r0-INVALID-envfirstload.*`.

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
**Not re-run as rows** (code unchanged): ICON-STYLE, CONTRAST-V3A, OVERLOAD-CHECK, V-2 rows. The harness still measured ICON (3/3 ok) and contrast (identical to r158), as notes only.

## Ableton
Not applicable. This is a CZABA brand decision (visual-direction-a + WCAG 2.3.3); behaviour, shortcuts and sizes are unchanged. Requirement met per SURFACE-STYLE (h)/(h-rm) and CASCADE-SCOPE. Parity status: not applicable.

## Notes for B (no bugs)
- **INFO-C159-DOC128-STALE:** two lines in doc 128 are stale. The new C-R158-01 entry is correct.
  - l.74, the "შემდეგ" row of the class table, still shows the 3 non-important tokens.
  - l.50 (R3) still claims that the `motion-safe:` pattern alone means no transition under reduced motion, which C-R158-01 disproved.
  - A flagged this; it is outside the D2' scope. Documentation only; suggest a one-line fix at V-3b.
- **INFO-C159-GLOBAL-RULE-SCOPE (inference, not measured):** doc 128 l.50 says `ArrangementLane` and `DetailPanel` use the same `motion-safe:transition-[…]` pattern. If so, the unlayered global rule probably overrides those utilities on `a`/`button`/… elements today (pre-existing). C tried to measure this: `tools/probe-motion.cjs` (`out/probe-motion.json`) found **no** element with a `motion-safe:transition` class outside the transport in the empty demo state at either viewport. So it is unconfirmed. It is relevant to ROOT-GLOBAL-TRANSITION-RULE, which should name both copies (`app.css` l.305–314 and `base/utilities.css` l.7–15), per A's reviewer.
- **Served CSS (A's known gap):** C fetched `app.css?direct` again (`out/served-app.css`). It contains both the `motion-safe:transition-[background-color,color]!` selector and the plain `motion-safe:transition-[background-color,color]` selector. The plain one is inert: no transport button carries it (class strings in `c159-*.json` S0 `cls`), and the computed (h) values come from the `!` rules. Most likely the scanner picked it up from the test's `not.toContain` strings and doc 128; C has not verified which.
- **Harness hygiene:** no file under any earlier `c-round-*/out/` was written during this round (find `-newermt 08:14Z` lists only root/A loop files). C's outputs are only in `c-round-159/`, `c-round-159.md` and `c-round-159.json`.
- Under reduced motion, the computed duration and timing still show the global 0.15s/0.25s ease-out. Because `transition-property` is `none`, nothing animates; this is the accepted (h-rm) branch.
- Accepted consequence observed: the focus ring and the disabled → enabled change are instant on the transport (§0.1).

## Tables

### RV1-V3A (vs `b-round-157/out/d6/d6-{W}-r1.json`)

| Viewport | State | keys ref/now | missing | added | maxDelta |
|---|---|---|---|---|---|
| 1440 | S0 | 111/111 | 0 | 0 | 0 px |
| 1440 | S1 | 122/122 | 0 | 0 | 0 px |
| 1440 | S2 | 131/131 | 0 | 0 | 0 px |
| 1280 | S0 | 103/103 | 0 | 0 | 0 px |
| 1280 | S1 | 121/121 | 0 | 0 | 0 px |
| 1280 | S2 | 130/130 | 0 | 0 | 0 px |

### SURFACE-STYLE 1440 (hover MQ true, reduced-motion MQ in rm context true)

| Sub-row | Checks pass/total | vs r158 |
|---|---|---|
| a | 45/45 | raw values identical |
| e | 8/8 | raw values identical |
| f | 3/3 | raw values identical |
| b | 13/13 | raw values identical |
| d | 7/7 | raw values identical |
| c | 12/12 | raw values identical |
| cue | 3/3 | raw values identical |
| g | 4/4 | raw values identical |
| h | 24/24 | r158 FAIL → now PASS |
| h-rm | 12/12 | r158 FAIL → now PASS |
| i | 3/3 | raw values identical |

(h)/(h-rm) per button, 1440:

| # | Button | transition-property | duration | timing | reduced-motion property / duration |
|---|---|---|---|---|---|
| 0 | Play | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 1 | Back to start | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 2 | ↶Undo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 3 | ↷Redo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 4 | ✂ Split | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 5 | ⌫ Delete — the selected clip; leaves a gap | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 6 | ↻ Loop | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 7 | Follow | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 8 | Zoom to selection (Z) | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 9 | ↩ Zoom | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 10 | Fit | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 11 | Export | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |

(i) focus ring, 1440 (about 40 ms after Tab, then +300 ms):

| Button | :focus-visible | immediate 2px brand ring | +300 ms ring |
|---|---|---|---|
| Play | true | true | true |
| Fit | true | true | true |
| Export | true | true | true |

CASCADE-SCOPE 1440:

| Control | tag/role | matches global selector | transition-property | duration | timing |
|---|---|---|---|---|---|
| Collapse library | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Mute — Original video sound | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Done | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |

FUNC-SMOKE-T 1440: Play click moved the playhead 0 → 3.34 s, output peak 0.3054, label while playing Pause, after the Pause click Play. Space: Pause (moving true) → Play. Export → Done: closed true, focus → Export. Escape: closed true, focus → Export.
Net 1440: errors 0, hydration 0, forbidden 0, Authorization 0, fonts 200, allowed noise 2.

### SURFACE-STYLE 1280 (hover MQ true, reduced-motion MQ in rm context true)

| Sub-row | Checks pass/total | vs r158 |
|---|---|---|
| a | 45/45 | raw values identical |
| e | 8/8 | raw values identical |
| f | 3/3 | raw values identical |
| b | 13/13 | raw values identical |
| d | 7/7 | raw values identical |
| c | 12/12 | raw values identical |
| cue | 3/3 | raw values identical |
| g | 4/4 | raw values identical |
| h | 24/24 | r158 FAIL → now PASS |
| h-rm | 12/12 | r158 FAIL → now PASS |
| i | 3/3 | raw values identical |

(h)/(h-rm) per button, 1280:

| # | Button | transition-property | duration | timing | reduced-motion property / duration |
|---|---|---|---|---|---|
| 0 | Play | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 1 | Back to start | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 2 | ↶Undo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 3 | ↷Redo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 4 | ✂ Split | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 5 | ⌫ Delete — the selected clip; leaves a gap | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 6 | ↻ Loop | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 7 | Follow | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 8 | Zoom to selection (Z) | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 9 | ↩ Zoom | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 10 | Fit | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 11 | Export | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |

(i) focus ring, 1280 (about 40 ms after Tab, then +300 ms):

| Button | :focus-visible | immediate 2px brand ring | +300 ms ring |
|---|---|---|---|
| Play | true | true | true |
| Fit | true | true | true |
| Export | true | true | true |

CASCADE-SCOPE 1280:

| Control | tag/role | matches global selector | transition-property | duration | timing |
|---|---|---|---|---|---|
| Collapse library | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Mute — Original video sound | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Done | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |

FUNC-SMOKE-T 1280: Play click moved the playhead 0 → 3.311 s, output peak 0.3054, label while playing Pause, after the Pause click Play. Space: Pause (moving true) → Play. Export → Done: closed true, focus → Export. Escape: closed true, focus → Export.
Net 1280: errors 0, hydration 0, forbidden 0, Authorization 0, fonts 200, allowed noise 2.
