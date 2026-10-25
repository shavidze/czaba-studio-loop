# C round 158 — V-3a verification (transport surfaces, Play/Export roles, lucide icons)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z123) · Base HEAD `f8a316a` + A's 4 paths
Env: `env-status.json` round 158, store 200. Real Playwright Chromium (headless) on `http://127.0.0.1:5173/studio-lab`, fresh context per session, 1440×900 and 1280×720.

## Verdict: **FAIL (one Low finding, C-R158-01)**. browserVerified = realVerified = **true**
Every runnable browser row was run at both viewports. Everything passes except SURFACE-STYLE (h): the colour motion and reduced-motion behaviour that B's R3 asks for never reach the computed style. An unlayered global CSS rule overrides the new `motion-safe:` utilities on every transport button. Per §7, a Low in V-3a's own code: B decides between a cheap fix-up and `deferred_low_polish`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T158-TARGETED | PASS | 25 files, 386/386, TS1–TS6 present and green. Same counts as A. `c-round-158/out/vitest.json` |
| SOURCE-SCOPE | PASS | HEAD `f8a316a`; frozen 974 OK at start and end; `a-round-158/end-sha256.txt` 4/4 OK; status 2 ` M` + 2 `??`; protected diff vs `f8a316a` empty (full §2 list incl. strings.ts, StudioWorkspace, studio-lab, obsidian test, app/styles, icons, auth*, package.json); C start/end hashes of all 978 tracked+untracked files identical (`out/c-{start,end}-sha256.txt`) |
| AN-REVIEW | PASS | Read `git diff f8a316a` myself. T0–T5 only; `toolButtonClass` is byte-identical to the T1 string; only ▶, ❚❚ and ⇔ removed; handlers, aria-labels, widths and other glyphs unchanged; no hex, no `style=`, no CSS; `lucide-react` imported directly; doc 127 changed only its status line; doc 128 is Georgian and follows the TEMPLATE sections (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO) |
| RV1-V3A | PASS | Table below. 0 px in every state at both viewports |
| SURFACE-STYLE | **FAIL** ((h) only) | (a)–(g) and (i) pass at both viewports. (h) fails: C-R158-01. Full tables: `c-round-158/out/surface-{1440,1280}.md` |
| ICON-STYLE | PASS | Play, Pause and Zoom to selection each have exactly 1 svg, 16×16, `stroke-width="1.5"`, `aria-hidden="true"`, lucide classes (`lucide-play`/`lucide-pause`/`lucide-move-horizontal`). Computed stroke equals the button colour (Play/Pause rgb(14,13,12), zoom rgb(236,230,218)). CDP names: `Play`, `Pause`, `Zoom to selection (Z)`. No ▶ ❚ ⇔ in the transport text. The other buttons' text is byte-identical: `↤`, `↶Undo`, `↷Redo`, `✂ Split`, `⌫ Delete`, `↻ Loop`, `Follow`, `↩ Zoom`, `Fit`, `Export`, with 0 svg. Shots: `shots/transport-{rest,hover-fit,hover-play,pause,loop-on}-c158-{1440,1280}.png` |
| CONTRAST-V3A | PASS | 30 enabled rows per viewport (S0 rest/hover, S2 range rest/hover). Minimum 6.56:1 (Follow, brand text on 8 % hover). 16 disabled rows listed and exempt. Pixel samples below |
| FUNC-SMOKE-T | PASS | Both viewports. Play click: playhead 0 → 3.31 / 3.34 s, real output tap peak 0.3054. Pause click → Play. Space → Pause (playhead moving) → Space → Play. Range 3–5: Z 40 → 275.4 px/s (1280: 227.4), ↩ Zoom → 40, Zoom-to-selection click → same zoom as Z, ↩ Zoom → 40, focus handed to Fit. Undo ×4: on the click that disables Undo, focus moves to Redo. Export: Done closes and focus returns to Export; Escape closes and focus returns to Export |
| OVERLOAD-CHECK | PASS: **B-R157-EXPORT-PEAK closes as info** | Table below. The warning renders, and its count equals the file's exact 24-bit full-scale count |
| G158-3 | PASS (fake-Bearer row BLOCKED) | `/studio-lab` anonymous, workspace and the badge "Demo collection — no sign-in required". `/studio/middle-east` (1440 and 1280): "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token` → 401 `{"error":"Please sign in to access Studio."}`. Fake-Bearer 403: BLOCKED (backend unavailable in cloud). `out/g158-3.json` |
| PX-NET / REG-HYD | PASS | Valid sessions (d6 ×4, c158 ×2 plus reduced-motion ×2, g158-3): 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. Only the expected cart noise (2 per session). Google Fonts responses: all 200 (9/9) in the c158 sessions and the reduced-motion sessions at both viewports. The unchanged d6.cjs does not record font statuses, so for the 4 d6 sessions font validity is inferred only from the 0 px match with B's reference. |

### Invalid / replaced runs
- `out/d6-1440-r1-INVALID-envfirstload.*`: the first browser load after server start gave a hydration error and "Invalid hook call". Replaced once under ENV-FIRST-LOAD. The Vite deps cache (incl. `lucide-react`, newly used by the studio route) was written at 07:35:58, two minutes before this run. It did **not** recur in any of the 8 later warm sessions. Note for root: the first cold load after a deploy of a newly imported dep is a dev-server effect, not a production one.
- `out/c158-1440-r0-HARNESS-libclick.*`: harness error. My own Tab helper clicked at x=4 (the library), so the library option lookup failed. I fixed the helper (no click) and re-ran. Not an app finding.

## C-R158-01 (Low): transport colour motion is not 180 ms / cubic-bezier, and reduced motion keeps a 150 ms transition
- **Steps:** open `/studio-lab` (either viewport) and read `getComputedStyle` on any of the 12 transport buttons: `transitionProperty`, `transitionDuration`, `transitionTimingFunction`. Repeat in a context with `reducedMotion: 'reduce'`.
- **Expected (R3, SURFACE-STYLE (h)):** `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`; with reduced motion `0s` or no transition.
- **Actual (all 12 buttons, both viewports):** `color, background-color, border-color, box-shadow, transform, opacity` / `0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s` / `ease-out ×6`. With reduced motion (`matchMedia` reduce = true) it is identical, 0.15 s.
- **Cause (confirmed from the served CSS, `out/served-app.css`):** `app/styles/app.css` l.305–314 `a, button, [role="button"], input, textarea, select { transition: … }` is **unlayered** (served l.6043 and l.6398). Tailwind's `.motion-safe:transition-[background-color,color]`, `.motion-safe:duration-180` and `motion-safe:ease-[…]` are inside `@layer utilities` (l.347–6042). In the cascade, unlayered normal declarations beat layered ones, whatever the specificity. So the three new utilities are generated but have no effect on `<button>`. The `ArrangementLane`/`DetailPanel` `motion-safe:transition-[…]` precedent cited in R3 does not carry over to buttons.
- **Why the tests are green:** TS1 asserts class tokens in jsdom, which has no cascade. The class is present, but the behaviour is not.
- **Severity: Low** (project table: a UX/visual difference with no logic effect). The 150 ms ease-out fade on colour already existed before V-3a for every button, so reduced motion is not a regression. Still, the row's explicit requirement is not met, and B's R3 claim "reduced motion means no transition" is false for these buttons.
- **Scope note for B (not a fix):** app.css is protected for A. Any fix must win over an unlayered rule from component classes, or come through a separate grant. That decision is B's. Whether a given override works must be checked in the browser on computed style, not by class tokens.
- **§7 input for B:** none of the four files this round owns can satisfy (h) with ordinary component classes. It needs either a cascade-level override from the component (e.g. important utilities) or a new grant for the global rule in `app/styles/app.css`. Acceptance for any fix-up must be re-measured on **computed style in the real browser** (SURFACE-STYLE (h) and (h-rm)). TS1 going green on class tokens again is not evidence.
- **Evidence:** `out/surface-{1440,1280}.md` rows (h)/(h-rm), `out/c158-{1440,1280}.json` keys `S0.btns[*].tp/td/ttf` and `reducedMotion`, `out/served-app.css`.

## RV1-V3A (d6.cjs unchanged; tool sha256 = `b-round-157/tools-sha256.txt`)
| VP | State | keys (ref / C) | missing | added | max Δ vs B ref r1 | C r1 vs r2 |
|---|---|---|---|---|---|---|
| 1440 | S0 | 111 / 111 | 0 | 0 | 0 px | 0 px |
| 1440 | S1 | 122 / 122 | 0 | 0 | 0 px | 0 px |
| 1440 | S2 | 131 / 131 | 0 | 0 | 0 px | 0 px |
| 1280 | S0 | 103 / 103 | 0 | 0 | 0 px | 0 px |
| 1280 | S1 | 121 / 121 | 0 | 0 | 0 px | 0 px |
| 1280 | S2 | 130 / 130 | 0 | 0 | 0 px | 0 px |

`out/rv1-{1440,1280}-{ref-vs-r1,r1-vs-r2}.json`, raw `out/d6/`.

## SURFACE-STYLE summary (identical at 1440 and 1280; `matchMedia('(hover: hover)')` = true in both sessions)
Tokens resolved in obsidian: foreground `#ece6da`, background `#0e0d0c`, brand `#c9a46a`, accent `#c9a46a`, `--radius-md` 0.5rem. Colours parsed from the raw computed strings (`oklab(0.926355 0.00167474 0.0172472 / a)` = rgb(236,230,218)/a). Tolerance ±0.005 alpha, ±1 channel.

| (x) | Check | 1440 | 1280 |
|---|---|---|---|
| a | rest: 1 px border, transparent border (except Export/cues), fg 5 %, radius 8 px, 12 buttons | 45/45 | 45/45 |
| b | hover on enabled buttons = fg 8 % (S0 and with range) | 13/13 | 13/13 |
| c | pressed (real mousedown held) = fg 12 % | 12/12 | 12/12 |
| d | disabled hover (Undo, Redo, Split, Delete, Loop, Zoom-to-sel, ↩ Zoom at S0) stays 5 % | 7/7 | 7/7 |
| e | Play opaque fg, text = background colour; hover 92 %, pressed 88 %; same in Pause (pressed in Pause did not toggle playback) | 8/8 | 8/8 |
| f | Export border and text brand rgb(201,164,106), bg 5 % | 3/3 | 3/3 |
| g | Loop on: accent 20 % at rest, hover and pressed; accent border and text | 4/4 | 4/4 |
| cue | Delete with range: accent border and text, bg 5 % | 3/3 | 3/3 |
| h | transition property/duration/timing | **0/24** | **0/24** |
| h-rm | reduced motion → 0 s | **0/12** | **0/12** |
| i | Tab focus-visible on Play, Fit, Export: `rgb(201,164,106) 0 0 0 2px` box-shadow (read after the 0.25 s box-shadow transition settled) | 3/3 | 3/3 |

## CONTRAST-V3A
Composited ratio (button fill over ancestor chain), enabled controls: min 6.56:1 at both viewports (all ≥ 4.5 text, ≥ 3 icon). Pixel samples (screenshot, mode bg vs max-contrast pixel; identical at both viewports):

| Button | State | bg px | fg px | ratio |
|---|---|---|---|---|
| Play | rest | 236,230,218 | 14,13,12 | 15.62 |
| Play | hover | 218,213,202 | 14,13,12 | 13.27 |
| Export | rest | 32,30,28 | 201,164,106 | 7.12 |
| Export | hover | 39,36,33 | 201,164,106 | 6.62 |
| Zoom to selection (range) | rest | 32,30,28 | 134,130,123 | 4.35 (icon, antialiased 1.5 px stroke; computed 15.x) |
| Zoom to selection (range) | hover | 39,36,33 | 170,165,156 | 6.30 |

## OVERLOAD-CHECK (B-R157-EXPORT-PEAK) — unchanged audio code, round-157 demo state
State: snap off; hero-music@0 music, stem-pulse@2 stems, soft-impact@4 sfx; range 3–5 s by a clip-body drag.

| VP | Export | frames / s | fmt | peak | +8388607 | −8388608 | exact FS | ≥0.9999 | Warning rendered (exact text) | Ruling |
|---|---|---|---|---|---|---|---|---|---|---|
| 1440 | range WAV | 96000 / 2.000 | 24-bit 48 kHz stereo | 1.0 | 407 | 390 | 797 | 797 | "Overload: peak +3.5 dBFS — 797 samples clipped to 0 dBFS. Lower Master by at least 3.6 dB and export again." | count = file → info |
| 1440 | project WAV | 7217877 / 150.372 | 24-bit 48 kHz stereo | 1.0 | 2703 | 1985 | 4688 | 4741 | "Overload: peak +3.5 dBFS — 4688 samples clipped to 0 dBFS. Lower Master by at least 3.6 dB and export again." | count = file → info |
| 1280 | range WAV (spot) | 96000 / 2.000 | 24-bit 48 kHz stereo | 1.0 | 407 | 390 | 797 | 797 | same text as 1440 range | count = file → info |

Round 157's 4741 was the loose ≥0.9999 threshold. The 53 extra samples are just under full scale, not clipped. The SRW-20 warning works as designed: **B-R157-EXPORT-PEAK → info, closed.** No C-R158-OVERLOAD.

## Ableton parity
Not applicable (CZABA brand decision, §5). Behaviour, shortcuts and sizes are unchanged and RV1 confirms 0 px.

## Notes (not findings)
- A's Low UX note is confirmed visually: at S0, 7 of 12 buttons are disabled, and opacity 40 % on a 5 % fill makes the idle toolbar read as mostly unframed text (`shots/transport-rest-*.png`). This belongs to the D-29z123 R3 veto list.
- The focus ring transitions in over 0.25 s (global rule). At about 150 ms it reads 1.79 px / alpha 0.89; after it settles, it is the full 2 px brand ring.
- Gate rows (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Tools / outputs
`c-round-158/tools/` (d6 set copied unchanged; `c158.cjs`, `color158.cjs`, `analyze158.cjs`, `cmp.cjs`, `g158-3.cjs`), `c-round-158/out/`, `c-round-158/shots/`.
