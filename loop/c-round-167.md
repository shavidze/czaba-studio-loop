# C round 167 — V-3c-4a: toolbar button surfaces (D-29z132) — **PASS**

Verifier C · 2026-10-25 · target `http://127.0.0.1:5173/studio-lab`, real Playwright Chromium (headless, fresh context per session) at 1440×900 and 1280×720. env-status: store 200 (round 167, attempt 1). `browserVerified = realVerified = true`. 0 bugs.

## Summary
| Row | Result | Evidence |
|---|---|---|
| T167-TARGETED | PASS: 180/180 (A: 180/180). TS8, UI11, MS5 and HM7 present and green | `c-round-167/out/vitest-c.json` |
| SOURCE-SCOPE | PASS: HEAD `330f1f3`; frozen 976 OK at start and end; end hashes = `a-round-167/end-sha256.txt`; `git status` = 9 ` M` + doc 136 `??`; protected diff empty; all-file sha256 lists identical start to end (986 files) | `out/c-start-all-sha256.txt`, `out/c-end-all-sha256.txt` |
| AN-REVIEW | PASS (see below) | `out/c-diff.patch` |
| SURF-V3C4A-1440 / -1280 | PASS | `out/surf/surf-{1440,1280}-1.json`, `out/surf-analysis.json`, `shots/surf/` |
| BOX-V3C4A-1440 / -1280 | PASS: 0.00 px on all 11 controls in S0 and S3 | same |
| CONTRAST-V3C4A-1440 / -1280 | PASS | same + d6 |
| RV1-V3C4A-1440 / -1280 | PASS | `out/d6/d6-{1440,1280}-r1.json`, `out/rv1-v3c4a.json` |
| FUNC-SMOKE-V3C4A-1440 / -1280 | PASS (Triplets note row included) | `out/func/func-1440-2.json`, `out/func/func-1280-1.json`, `out/func/trip-{1440,1280}-1.json`, `shots/func/` |
| G167-3 | PASS. Fake-Bearer 403: BLOCKED (backend unavailable in cloud) | `out/g167-3.json`, `shots/g167-3-*.png` |
| PX-NET / REG-HYD | PASS in every valid session | the `net` field of each JSON |

## AN-REVIEW (C read the diff vs `330f1f3` itself)
- **StudioWorkspace:** exactly 4 class sites (W2–W5).
  - The Snap and Env base strings got SURF + MOTION + `rounded-md`. `border-outline` is removed. `h-6 px-1.5 text-xs leading-none text-muted hover:text-foreground` and the focus tokens are kept.
  - The Snap and Env on-strings are byte-identical apart from the R2 append. The only other change is a line wrap.
  - The two selects change only `rounded-sm` → `rounded-md`.
- **TempoRow:** T1–T3 as specified. The disabled cues are kept.
- **MarkerRow:**
  - K2 changes only `MARKER_HEADER_BUTTON_CLASS`. `MARKER_STEP_BUTTON_CLASS` is untouched.
  - K3 changes the radius only.
- **Master Peak:**
  - The base string is converted. The clear string is now `'text-muted hover:text-foreground'`.
  - The over string `'border-destructive bg-destructive/15 text-destructive'` is byte-identical with `330f1f3` (l.110 in both).
  - The third `cn` argument is `over && 'enabled:hover:bg-destructive/15 enabled:active:bg-destructive/15'`.
- **Master Mute:** X2 as specified.
- **Recipe:** SURF + MOTION are byte-identical to `toolButtonClass` (`ArrangementTransport.tsx` l.51). The only arbitrary values are the 4 MOTION tokens. No text, aria, handler, size, padding or `data-*` change.
- **Tests:**
  - Additions only (0 removed lines). The only new `it`s are TS8, UI11, MS5 and HM7.
  - `expect(` counts at `330f1f3` → now: 67→74, 72→83, 40→48, 17→24. There are no drops.
- **Docs:**
  - Doc 135 changes l.4 and the l.154 TODO (the allowed change).
  - Doc 136 exists. Its header has თარიღი, სტატუსი `In Progress (awaiting C round 167)` and შეცვლილი პროექტი. It has the sections კონტექსტი, მიდგომა (R1–R5, before/after tokens, probe table), არქიტექტურა, შეცვლილი ფაილები, პრობლემები, ტესტირება and TODO.

## SURF-V3C4A (identical at 1440 and 1280)
Computed values with a real mouse hover and a held mouse button, read after a 450 ms settle. Backgrounds are composited with a canvas colour parse (B's `measureSites`, copied verbatim).

| State | Button | border-top | width | radius | rest bg | hover bg | active bg | transition |
|---|---|---|---|---|---|---|---|---|
| S0 | Snap, Env, marker add/prev/next, Peak (clear), Master Mute | `rgba(0,0,0,0)` | 1px ×4 | 8px ×4 | 33,31,28 | 39,36,34 | 48,46,43 | `background-color, color` 0.18s `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| S0 | Metronome (disabled, no tempo) | transparent | 1px | 8px | 33,31,28 | 33,31,28 (`enabled:` correctly inert) | 33,31,28 | same |
| S3 | Snap, Env, Metronome (on) | `rgb(201,164,106)` accent | 1px | 8px | 58,49,35 | 58,49,35 | 58,49,35 | same |
| S3 | Master Mute (on) | accent | 1px | 8px | 201,164,106 | 201,164,106 | 201,164,106 | same |
| S3 | marker add/prev/next, Peak (clear) | transparent | 1px | 8px | 33,31,28 | 39,36,34 | 48,46,43 | same |
| S4 | Master Peak **over** (real overload) | `rgb(210,119,106)` destructive | 1px | 8px | destructive/15 | destructive/15 (identical) | destructive/15 (identical) | — |

- **On-states:** hover and active keep the on-fill. After the held press is released off the button, `aria-pressed` is unchanged.
- **S4 was produced for real in both viewports.** The demo was placed at 0 s on Music, Stems and SFX, the Master was set to +6 dB, and playback ran. The Peak read `+4.7 dBFS — overload (Clip)` with `data-state=over`.
  - Its rest, hover and held backgrounds are all `oklab(0.6667 0.1017 0.0566 / 0.15)`, and the border is destructive.
  - A click reset it to `−∞`, clear. Crops: `shots/func/func-*-S4-over-crop.png`.
- **Reduced motion** (`reducedMotion: 'reduce'`, `matchMedia` true): `transition-property` is `none` on all 8 buttons, in S0 and S3, at both viewports.
- **Fields:** radius 8px on all four corners.
  - The BPM input border is `rgb(115,107,96)`, and the grid-division and waveform-zoom borders are `rgb(36,33,30)`. All three equal B's `330f1f3` values.
  - The marker name input (S5, opened with M) has an 8px radius and border `rgb(201,164,106)` (`border-brand`, class unchanged), and it has focus.
- **R4 crops (4×, DPR 4; layout boxes identical to DPR 1):** `shots/surf/crop4x-{1440,1280}-1-{S0,S3}-{marker,metronome,master,snapenv}.png`.
  - The 16 px marker `+` is a circle, and ◀ ▶ and the Metronome are pills.
  - The 20 px Mute and the Peak, and the 24 px Snap and Env, have 8 px corners.
  - This is Saba's veto point (R4). It is not a finding.

## BOX-V3C4A
The raw `getBoundingClientRect` of the 11 controls in S0 and S3 was compared with B's `before.box` from `330f1f3`. The **max delta is 0.000 px** at both viewports in both states.

## CONTRAST-V3C4A (both viewports identical)
| Control state | Ratio | Threshold |
|---|---|---|
| Off-state muted text at rest | 5.98 | ≥4.5 ✓ |
| Off-state hover | 12.35 | ✓ |
| Off-state held | 10.93 | ✓ |
| Snap / Env / Metronome on (rest, hover, held) | 5.48 | ✓ |
| Master Mute on (rest, hover, held) | 8.32 | ✓ |
| Master Peak **over** (S4, real overload; destructive text on destructive/15 composited to rgb(50,35,31); rest, hover and held) | 4.72 | ≥4.5 ✓ (`out/func/s4-contrast-{1440,1280}.json`) |
| Disabled metronome | 2.52 (was 2.59) | exempt, reported |
| Fields | 15.62 / 14.78 / 14.78 | unchanged |

## RV1-V3C4A (d6, sha256 `3abc88fe…` unchanged; one valid run per viewport)
Compared with `c-round-166/out/d6/d6-{1440,1280}-r1.json`, with no renames:
- **States:** S0, S1 and S2 at both viewports have 0 missing keys, 0 added keys, 0 collisions and a **max box delta of 0**.
- **Contrast (S0 and S1):**
  - 0 missing and 0 added entries, and a max box delta of 0.
  - The changed entries are exactly the 8 converted buttons: 6.68 → 5.98, all still passing. The disabled metronome changed 2.59 → 2.52 (Δ0.07 ≤ 0.1).
  - The failing set is identical to the reference: Undo, Redo, Split, Delete, Loop, Zoom-back and the disabled metronome. These are pre-existing.

## FUNC-SMOKE-V3C4A (real mouse clicks at the button centre; `elementFromPoint` hit the target every time)
| Check | 1440 | 1280 |
|---|---|---|
| Snap click on/off: status `Snap on — grid 1 s (G)` / `Snap off — free movement (G)`, `aria-pressed` flips; `G` toggles both ways | ✓ | ✓ |
| Env click flips `aria-pressed`; `A` toggles both ways | ✓ | ✓ |
| Grid select 1→10: `Grid: 10 s (Snap off)`, and back | ✓ | ✓ |
| Waveform zoom 1→0.5: `Waveform Zoom 50% — view only…`, and back | ✓ | ✓ |
| BPM 120 + Enter: metronome disabled→enabled; a click makes it pressed, a second click unpressed | ✓ | ✓ |
| Play: tap peak 0.37436; playhead 1.471 s after 1.5 s | ✓ | ✓ |
| Markers M+name at 2 s and 6 s; next → 2, next → 6, prev → 2; the `+` button opens the editor, Enter adds at 4 s | ✓ | ✓ |
| Master Mute during playback: pressed, tap peak < 0.001 from 87 ms (1440) / 61 ms (1280) after the click to the end of a 0.9 s window (last peaks 0); unmute: peak 0.38655 | ✓ | ✓ |
| Master Peak click resets the readout (−7.6 → −∞) | ✓ | ✓ |
| **Triplets checked icon** (BPM 120 → 1/8 → Triplets (3) → reopen): `Triplets (3):true:1`, `1/8T:true:1`, every other item 0 checks (Snap off). **Closes C-R166-TRIPLET-CHECKED-BROWSER.** | ✓ | ✓ |

Triplets note: the literal row ("BPM 120, click Triplets") with the default 1 s grid gives the status `Triplets work only on the bars grid — choose 1/2 … 1/32 (3)`, and Triplets stays unchecked. That is designed behaviour, not a bug. The checked state needs a bars division, so C chose 1/8 first, as round 166 did.

## G167-3
- **`/studio-lab`, fresh context, no credentials:** `auth_user` is null, 0 cookies, the workspace renders, and the demo badge `Demo collection — no sign-in required` shows.
- **`/studio/middle-east`** at 1440 and 1280: `Sign in required`, no workspace, 0 `audio[src]`.
- **`GET /api/studio-token`:** **401** `Please sign in to access Studio.`
- **Fake-Bearer 403:** BLOCKED, because the backend is unavailable in the cloud.
- **Page:** 0 forbidden requests, 0 Authorization headers, 0 errors, 0 hydration messages.

## PX-NET / REG-HYD
Every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 page errors. Each session had only 2 expected noise errors (cart / connection refused). Font responses were 200; there were 0 font failures.

Valid sessions: d6 1440, d6 1280, surf ×3 per viewport, func 1440-2, func 1280-1, trip ×2, s4-contrast ×2 and g167-3.

## Invalid or replaced runs
- **d6 1440 attempt 1:** a cold-Vite first load (ENV-FIRST-LOAD-LUCIDE) gave "Invalid hook call" and a hydration replacement, and `collect` hit a null root. This was the one allowed replacement. The files are kept as `out/d6/INVALID-coldload-d6-1440-r1-attempt1.json` and `out/INVALID-coldload-d6-1440-attempt1.log`.
- **func 1440 attempt 1:** **C script defects, not app behaviour.**
  - The Triplets selector used `menuitemradio`, but the item is a `menuitemcheckbox`.
  - The grid menu was therefore left open, and the first ruler seek closed it instead of seeking. That put the marker at 0 instead of 2.
  - The script was fixed and run again as `func-1440-2`. Network was clean in attempt 1, and all its other values match attempt 2. Kept as `out/func/func-1440-1.json`.

## Ableton
- **Parity:** not applicable (task §5). This is a CZABA brand decision from `visual-direction-a.md`. C makes no Ableton claim and verified none.
- **Requirement:** met (SURF, BOX, CONTRAST, RV1, FUNC).

## Not run / gate
- **Not re-run (code unchanged):** the transport, dock, lane, group, clip and library rows, the round-166 icon rows, ENV-VIS, OV-CORNERS and MK-*.
- **Gate rows, not C's:** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## Notes for B
1. **Saba-vetoable items (task §8): R1, R2, R3 and R4.** The R4 crops are in `shots/surf/crop4x-*`.
2. The task row "click Triplets at BPM 120" needs a bars division first (see the Triplets note above). Future rows should say "choose 1/8, then Triplets".
3. **Master Mute** also silences the output that the demo track feeds. C did not check the metronome click path under Mute, because the metronome was off during the mute test. If it matters, schedule it as a separate check.
4. **Code-reviewer architecture note:** the reviewer counts 7 copies of the recipe across 5 files. A forwarded it verbatim. It strengthens checkpoint Q1 before V-3c-4b.
