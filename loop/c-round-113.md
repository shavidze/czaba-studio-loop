# C — Round 113 verification: a touch press must not jump the faders (A-R38-REVIEW-TOUCH, D-29z78)

Verifier: C · Date: 2026-10-23 (UTC ~15:55–16:30) · Env: `env-status.json` store 200 (round 113, attempt 1) · Chromium 143.0.7499.4 (Playwright 1.57, headless), `hasTouch: true`, `isMobile: false`, a fresh context per session.
Source: read-only. C wrote only under `tmp/studio-real-loop/c-round-113*`.

## Verdict: PASS (browserVerified = true)
- **Fixed:** the touch jump. In round 112 every target jumped in 3/3 runs. Now **0 of 42** fader touch/tap/double-tap sessions jump: 28 at 1440, 12 at 1280 and 2 on the video lane. The Zoom positive control jumped in 4/4 sessions, by design.
- **Still works:** the relative drag on touch (R3 holds), one history entry per drag, and a no-op tap.
- **Unchanged:** mouse and keyboard.
- **Harness valid:** the Zoom positive control still jumps at both viewports.
- **No new finding.**
- **Blocked:** only the fake-Bearer 403 sub-check (backend unavailable in cloud).
- **Gate rows** are not claimed.

## 1. Method
- **Harness:** `c-round-113/tools/touch.cjs`, with `lib.cjs` copied byte-identical (`cmp`) from c-round-112. The touch method is round 112's:
  - CDP `Input.dispatchTouchEvent` on **one CDP session per run** (a fresh session per event fails with "Must send a TouchStart first", so one session per run, as round 112 did);
  - touchStart at 15 % of the width from the end opposite the thumb;
  - the value is read 100 ms after touchStart, before any move;
  - 5 touchMoves with 40 ms between them, then touchEnd.
- **Task-specified deviations from round 112's script:**
  - the moves are **−4 px** each (§4 TC-REL);
  - the pass rules are the task's: `afterStart == v0`; the final Δ is negative, ≥ 1 step and ≤ `20/width × range + step`; and every intermediate value is within that bound and not above v0.
  - With −4 px moves, the drag moves *toward* the touch point on Volume/Master/group by construction. So the test is not the direction: a jump is detected by the start read and by the 20 px + 1 step ceiling.
- **Layout:** music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s, SFX `demo-soft-impact` @4 s, all added from the library at the insert marker. Snap off, then Home, in the Stop state.
- **Group:** stems name click, Shift+click SFX, Ctrl+G („ჯგუფი 1“); the target is `[data-testid=arrangement-group-volume]`.
- **Video:** `beeps-6s-vp9-opus.webm` (owned synthetic media in the loop media folder). The lane was found from the DOM: `data-track-id=video`, „Volume — ვიდეოს ორიგინალი ხმა“.
- **TC-UNDO:** blur, wait 250 ms, then a real **Ctrl+Z**. "Exactly one entry" means that after Ctrl+Z the value == v0 **and** the Undo button's title and disabled state equal the pre-gesture state.
- **TC-TAP:** touchStart, 60 ms, touchEnd. The value, the Undo title and the disabled state must stay unchanged.
- **TC-DTAP / MC-DBL:** the value is first moved off default with the keyboard (Volume/group ArrowLeft×10 → 0.90, Pan ArrowRight×5 → 5R, Master ArrowLeft×10 → −5.0 dB), then blur, then the measurement. TC-DTAP = tap, 120 ms gap, tap (< 250 ms).
- **Scope:** 40 sessions in the 1440 series, 22 at 1280 and 2 for video. Every session passed on its first attempt (no retries were used).

## 2. Results (evidence: `c-round-113/out/touch-1440-series.json`, `touch-1280.json`, `touch-1440-video.json`; logs `series-*.log`; shots `c-round-113/shots/<target>-<mode>-<vp>.png`)
| Row | Target | 1440×900 | 1280×720 | Measured |
|---|---|---|---|---|
| TC-ZOOM (validity) | Zoom | 3/3 jump | 1/1 jump | 678 → 63 px/s on touchStart, so the harness reaches the native path at both viewports |
| TC-START | music Volume | 3/3 PASS | PASS | 1 → 1 at +100 ms (r112: 1.00 → 0.09) |
| | music Pan | 3/3 PASS | PASS | 0 → 0 (r112: C → 50R) |
| | Master | 3/3 PASS | PASS | 0.0 → 0.0 dB (r112: −54.5) |
| | group Volume | 3/3 PASS | PASS | 1 → 1 |
| TC-REL | music Volume | 3/3 PASS | PASS | 0.96/0.93/0.89/0.85/0.81; Δ −0.19 ≤ 0.1969 (w 107 px) |
| | music Pan | 3/3 PASS | PASS | −8/−17/−25/−33/−42; Δ −42 ≤ 42.67 (w 48 px) |
| | Master | 3/3 PASS | PASS | −2.5/−5.5/−8/−11/−13.5 dB; Δ −13.5 ≤ 14.25 (w 96 px) |
| | group Volume | 3/3 PASS | PASS | 0.92/0.83/0.75/0.67/0.58; Δ −0.42 ≤ 0.4267 (w 48 px) |
| TC-UNDO | all four | 3/3 PASS | PASS | One new entry each: „Undo: Volume“, „Undo: Pan — მუსიკა“, „Undo: Master Volume“, and „Undo: Volume“ for the group (ArrangementContext commits the group with the label 'Volume', l.2317). Ctrl+Z restores v0 and the title returns to the pre-gesture one („Undo: დამატება — Soft impact“ / „Undo: Group Tracks“). |
| TC-TAP | all four | 3/3 PASS | PASS | The value, the Undo title and the disabled state are unchanged. |
| TC-DTAP (info) | all four | no reset | no reset | Volume 0.90, Pan 5R, Master −5.0 dB and group 0.90 all stay. The Undo title is unchanged, but the title alone cannot exclude a zero-delta entry, because the nudge's label equals the fader's label. This is the deliberate R4 behaviour (TOUCH-DOUBLE-TAP-RESET). |
| MC-PRESS | all four | PASS | PASS | A mouse press at the far point, held 100 ms, does not jump; the history is unchanged. |
| MC-DRAG | Volume, Master | PASS | PASS | −20 px: Volume Δ −0.19, Master Δ −13.5 dB, one entry each; Ctrl+Z restores. |
| MC-DBL | Volume, Master | PASS | PASS | 0.90 → 1.00 and −5.0 → 0.0 dB. The first Ctrl+Z gives 0.90 / −5.0. A second Ctrl+Z gives 0.91 / −4.5, the last keyboard nudge. So the top of the stack is exactly [nudge, reset]: one reset entry each (`out/touch-{1440,1280}-mdbl2.json`). |
| KB-ARROW | music Pan | PASS | PASS | 0 → 1 (+1 step), „Undo: Pan — მუსიკა“ |
| TC-VIDEO-VOL | video Volume | PASS (1 run) | n/a (task: 1440 only) | Touch: start 1 → 1; moves 0.96…0.81, Δ −0.19; one entry; Ctrl+Z → 1, and the title returns to „Undo: ვიდეოს დამატება — beeps-6s-vp9-opus.webm“. Tap: the value and the history are unchanged. |

The first 1440 series (`series-1440-run1.log`) gave identical numbers. Its JSON was overwritten by the video run, which used the same output name (a C harness slip). The full series was re-run into `touch-1440-series.json`, so every claim above is backed by a saved JSON.

## 3. Non-browser rows
- **SOURCE-SCOPE: PASS.**
  - `git diff --stat ad58b5e`: the 4 app files, +50/−15.
  - `git status`: 4 ` M` + 2 `??` (`app/lib/arrangement/__tests__/fader-touch.test.tsx`, doc 097), at the start and at the end of C.
  - `sha256sum -c --quiet b-round-112-r113-tree-sha256.txt`: OK at C's start and end.
  - `git diff ad58b5e` on the 4 protected auth/purchase files is empty, and their sha256 prefixes `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257` equal B's.
- **T113-TARGETED: PASS.** The 9 files give 167 tests passed (fader-touch 7), the same as A (`c-round-113/out/vitest-targeted.txt`). React act() stack-trace noise appears in stderr; there are 0 failures.
- **AN-REVIEW: PASS.**
  - `useRelativeFaderDrag` returns `{ onPointerDown, ref }`. `ref` is `useCallback([])`: it detaches from the previous element, then `addEventListener('touchstart', preventFaderTouchStartDefault, { passive: false })` on the `<input>` itself, at mount. The handler only calls `preventDefault()`.
  - Pan merges `panSliderRef` through a stable `useCallback` (`useRef<HTMLInputElement | null>`, no assertion).
  - Zoom/`ArrangementTransport.tsx` is untouched; there is no CSS/class change.
  - React ^18.3.1, so `ref(null)` on unmount/fold is the cleanup.
  - The `onPointerDown` body is unchanged apart from its binding.
- **DOC-097: PASS.** It has the template sections (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO). l.4 is exactly „Round 113 — C-ის შემოწმებას ელოდება (D-29z78; A-R38-REVIEW-TOUCH).“

## 4. PX-NET / REG-HYD: PASS
73 sessions in total: 40 + 22 + 2 + 4 (the MC-DBL double-undo check) + G113-3. The harness sessions use lib.cjs's full forbidden list, which includes studio-token. `g113-3.cjs` deliberately leaves studio-token out of its page list, because it calls that endpoint on purpose through `ctx.request`. Results: 0 console errors outside the known cloud noise ("Failed to load cart" / `ERR_*`, 128 noise lines), 0 hydration errors, 0 `pageerror`, 0 requests to forbidden hosts (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token), and 0 `Authorization` headers.

## 5. G113-3 (run alone, last): PASS, with one sub-check BLOCKED
- `/studio-lab` in a fresh context with no credentials: the workspace is present, and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ is shown.
- `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.
- `GET /api/studio-token?product=middle-east&file=stem1.wav` → **401** `{"error":"Please sign in to access Studio."}`. Premium auth is not bypassed.
- Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)**.
- Evidence: `out/g113-3.json`, shots `g113-3-*.png`.

## 6. Ableton correspondence
Every row: **არ ეხება** (touch on a browser `<input type=range>`; Live is a desktop application). No Ableton claim is made. The mouse contract D-29z3 (relative drag, no jump on press) is confirmed unchanged by MC-*.

## 7. Notes for B (info, not bugs)
- **TOUCH-DOUBLE-TAP-RESET:** confirmed in the browser. A touch double-tap does not reset any of the four faders (R4, accepted).
- **Not tested:** the long-press `contextmenu` on the faders, which A's reviewer raised (same mechanism as R4). It is not a task row.
- **Tech Lead list (R38-T):** a real touch device (iPad/Android) stays there. CDP touch emulation in headless Chromium is not a real device.
- **Gate rows** (full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL) were not run by C; they belong to the gate.
- **Per task §5:** A-R38-REVIEW-TOUCH is done for Chromium, and SRW-13 → `c_pass_tech_lead_manual`. The next planning on or after 2026-10-24 is the REGRESSION round.
