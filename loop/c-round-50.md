# C — Round 50 verification: SRW-14 stage 3a (FB-13), D-29z15 — position follows the grid (ruler click, playhead drag, empty-lane click, clip-body click; paste follows); C-R49-01 / C-R49-02

Verifier: C (independent) · 2026-10-17 12:06 → 12:23 +04 · Task: `current-task.md` (Round 50)
Evidence: `c-round-50/gates/`, `c-round-50/runs/`, `c-round-50/shots/`, tools in `c-round-50/tools/`, checkpoint `c-round-50/checkpoint.md`.
I re-ran every check myself and did not rely on A's numbers. I made no app edits, commits, installs or deploys, and did not start or stop the dev server.

**taskStatus: PASS.** Every acceptance ID I ran passed. I found **no product bug**. Two things are noted for B below: a test-fixture issue in the spec (CL-EDGE) and a harness-label gap. Neither is an app defect.

## 0. Environment and method

- **HEAD:** `038ed5a45f94596a264c14c4ec834607cb407948` at the start (12:06) and at the end (12:22). `/studio-lab` returned 200.
- **node.exe:** 33 → 41 → 33 over the session. Each run file records its count.
- **REAL (gstack):** `c-round-50/b.sh` with a new state file `c-round-50/c-browse.json`, and a separate anonymous state `c-round-50/anon/c-browse.json`.
  - The CLI daemon started normally both times, so the fallback was not needed. I never ran `$B restart`. `$B stop` printed "Unable to connect" for both. Afterwards both state files were absent, `tasklist` showed no browse process, and node.exe was back at 33, the starting count.
  - Ruler clicks used A's targeting method: a 2 px `position:fixed` child marker inside the ruler at `left + t × pps`. `elementFromPoint` confirmed the hit, and the click bubbles to the ruler.
  - The lane cannot be targeted this way. `handleLaneBackgroundPointerDown` requires `event.target === event.currentTarget`, so a marker click is ignored (`runs/g50-real-1440x900.txt` LA-1: position unchanged). For the REAL lane click I instead ran `$B click` on the lane element itself, with a read-only capture listener that logs the real `clientX` (`runs/g50-real-la1b.txt`).
- **REAL-mouse (PW):** standalone Playwright (`store/node_modules/playwright`, installed chromium, fresh context with no credentials), using `page.mouse` and `page.keyboard`. This is the pending deviation **GSTACK-NO-MOUSE**; it is never called gstack. Tools: `tools/r50.cjs`, `tools/r50b.cjs`, `tools/pwlib.cjs`.
- **Setup:** layout L50 = L49 (video 0–6.008, `სრული მიქსი` on music 7–23, `Soft impact` on SFX 4–6, 40 px/s). It is built by the round-31…34 setup chain evaluated in the page; that is SYNTHETIC setup only. `window.__c` is used only for reads. The round-30 `h30` hook (read-only wrapper on `AudioBufferSourceNode.start`) records the real source starts.
- **Label gap (honest):** §4 lists some IDs as REAL. I ran these with gstack: RU-OFF, RU-1, DR-KEY, LA-1, PA-1 and PL-1. **RU-DBL, RU-10, RU-1280, LA-OFF and PL-OFF ran only as REAL-mouse (PW).** gstack has no double-click command, so RU-DBL cannot be REAL. Every `g` press inside the PW runs is a PW keypress. The RU-ALT-ON `select 0.25` is PW `selectOption`.

## 1. G50-2 — tree integrity: **PASS**

- `git status --short` lists exactly the 7 paths of §3.1, at the start and at the end (`gates/g50-2-start.txt`, `gates/g50-2-end.txt`).
- 401 list: 401 OK / 0 non-OK, at the start and at the end.
- Protected files: 4/4 OK, at the start and at the end.
- Snapshot `SHA256SUMS.txt`: 5/5 OK.

## 2. R50-S — static: **PASS**

The diff is in `gates/snap-diff.txt` (`diff -u --strip-trailing-cr` against `b-round-49-r50-snapshots/`), and `git diff` agrees.

- **`grid.ts`:** one inserted export, `resolveGridTime` (10 lines). It calls `resolveSnapStep` and returns `time` unchanged when the step is `null`, otherwise `snapTimeToGrid`. Every existing line is byte-identical.
- **`ArrangementRuler.tsx`:**
  - the import;
  - 2 optional props;
  - defaults `snapSeconds = null` in both destructures;
  - the playhead move sample;
  - the `pointerup` branch of `onScrubEnd` (cancel keeps `drag.time`);
  - `endRulerNavigation(…, bypass = false)` → `onSeek(resolveGridTime(…))`;
  - `handlePointerEnd` passes `event.altKey`.

  The keys, `pointerTime` and the effects are unchanged.
- **`StudioWorkspace.tsx`:** the import, the two ruler props, and the lane `finish` seek, which reads Alt from `end` (the `pointerup`). The marquee and cancel branches are unchanged.
- **`ArrangementClip.tsx`:** the import, now multi-line, and exactly one line in `finishGesture`. `beginGesture`, `handlePointerMove` and `DRAG_THRESHOLD_PX` have no hunk.
- **`grid-snap-edit.test.tsx`:** SE10 rewritten (title + `toBe(7)`); SE10b, SE20 and SE21 added. Nothing else changed.
- **Line endings (counted with node, `gates/eol.txt`):**
  - `StudioWorkspace.tsx`: CRLF 1668/1668;
  - LF, 0 CRLF: `grid.ts` (84 lines), `ArrangementRuler.tsx` (420), `ArrangementClip.tsx` (664), `grid-snap-edit.test.tsx` (693), the new test (513) and doc 046 (112).

  There is no EOL churn.
- **Banned content.** I grepped the added lines and the new test for `any`, `@ts-ignore`, `as` assertions, `//` comments, hex/rgb colours, fake timers and snapshots: **0 hits**. The new file has 17 `it` (SP1–SP17).
- **Doc 046:**
  - It has every TEMPLATE section in Georgian, one Mermaid diagram, P1–P6, the method note (REAL-mouse (PW), GSTACK-NO-MOUSE pending), and a TODO with 3b, 4, 5, R49-T and R50-T.
  - The §4.9 table is honest. The clip-body row is **დაუდასტურებელი** and states the round-49 over-claim. The scrub-area row is a **შეგნებული განსხვავება**. The handle-drag row is **არ ეხება / დაუდასტურებელი**.

## 3. R50-U — unit tests and mutations: **PASS**

**Red run reproduced** (`runs/red-run-c.txt`; the 5 snapshot sources plus the final tests, in a scratch copy outside `store/`):
- **10 failed / 32 passed.** The red set is exactly SP1, SP3, SP5, SP7, SP11, SP14, SP15, SP16, SP17 and SE10.
- This equals A's 9 red plus SP17, which A ran separately (`red-run-sp17.txt`). Every other case is green on the snapshots, as §2.2 expects.

**Mutations** (`runs/mutations.txt`, runner `tools/run-mut.sh`):
- Scratch `c-round-50/scratch/mut/` was a copy of `app/` plus a `node_modules` junction. I removed the junction with `cmd /c rmdir`; `store/node_modules` is intact (618 entries).
- The unmutated base is **42/42**.

| # | Mutation | Failed tests (C run) | Verdict |
|---|---|---|---|
| (a) | ruler click unsnapped | SP3, SP5, SP15, SP14 | killed |
| (b) | ruler click ignores Alt | SP4, SP5, SP14 | killed |
| (c) | ruler Alt read at `pointerdown` | SP4, SP5, SP14 | killed |
| (d) | playhead snaps only on release | SP7, SP17 | killed |
| (e) | playhead ignores step | SP7, SP17 | killed |
| (f) | ruler drag also seeks | SP6 | killed |
| (g) | playhead ←/→ snapped | SP10 | killed |
| (h) | lane click unsnapped | SP11 | killed |
| (i) | lane Alt read at `pointerdown` | SP12 | killed |
| (j) | clip-body click unsnapped | SE10, SP16 | killed |
| (k) | clip-body ignores Alt | SE10b | killed |
| (l) | free value rounded to ms | SP1 | killed |
| (m) | Alt-enable fixed 1 s | SP1, SP5 | killed |
| (n) | trim clamp-then-snap (C's round-49 (n), verbatim) | SE20 | killed |
| (p) | only `'before-start'` suppresses ghosts | SE21 | killed |
| (r) | clip-body seek clamped to `clip.start` | SP16 | killed |
| **(q)** C | ruler `snapSeconds={gridSeconds}` regardless of Snap | SP2, SP5, SP9 | killed |
| **(s)** C | clip-body Alt read at `pointerdown` | SE10b | killed |
| (t1) C optional | playhead cancel commits the raw x | SP17 | killed |

None ran into a timeout. node.exe was 33–41 during the runs.

**C-R49-01: CLOSED.** SE20 is green and kills (n). **C-R49-02: CLOSED.** SE21 is green and kills (p).

## 4. G50-1 — gates: **PASS**

| Gate | Result | Evidence |
|---|---|---|
| `npm run verify` | **exit 0**; vitest **84 files / 1438 passed**, 0 failed (= 1418 + 3 + 17); both builds ✓ | `gates/verify.txt` l.1112–1113, l.1262 (node 33 at the start and at the end) |
| tsc | exit 0 | `gates/tsc.txt` |
| Biome `./app` (read-only) | **5 errors / 218 warnings / 1 info.** The errors are all `format` errors on the baseline CRLF list: StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, auth.ts | `gates/biome-app.txt` |
| Biome on the 4 LF owned files + new test | 0 diagnostics | `gates/biome-owned.txt` |
| `biome lint StudioWorkspace.tsx` | 0 | `gates/biome-lint-ws.txt` |
| `biome format` on an LF copy of StudioWorkspace | no changes (the error is EOL only) | `scratch/ws-lf-formatted.tsx` |

- **Frozen suites (§4.8):** all 18 are part of the 84-file run, which had 0 failures. I did not run them as a separate batch.
- **C-R48-01:** render-budget was green; no recurrence.

## 5. G50-3 — anonymous workspace and purchase protection: **PASS**

gstack, new anonymous state, 1440×900 (`runs/g50-3.txt`, shots `anon-*.png`):
- **`/studio-lab` direct:**
  - the workspace is shown;
  - `auth_user=null` and the cookie is empty;
  - the badge reads `დემო კოლექცია — ავტორიზაცია არ სჭირდება`.
- **REAL `＋ დამატება`:** status `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` The auth hook recorded no `Authorization` header (`[]`).
- **Header link `Studio LabDemo`** → `/studio-lab`, workspace shown, auth null.
- **`/studio/middle-east`** → "Sign in required", with no workspace.
- **Network** (direct, session and header) has **bad = 0**: no `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 request.
  - Hosts seen: the app, `localhost:5199` (`/api/cart`, allowed), Google Fonts, GA and GTM (allowed).
  - Media: only the public `hero-music.mp3` and `middle-east.mp3`.
  - The PW runs (`r50b`) also showed 0 bad requests and no auth header.
- **Token endpoint:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** (`Please sign in to access Studio.`). A fake Bearer token → 500. That is the known root item, unchanged.

## 6. R50-RULER — **PASS**

| ID | Method | Result | Evidence |
|---|---|---|---|
| RU-OFF | REAL (gstack) + PW, both viewports | 7.3 (`00:07.300`); snap off | `runs/g50-real-1440x900.txt`, `runs/r50-1440x900.txt`, `r50-1280x720-*.txt` |
| RU-1 | REAL (gstack `$B press g`, marker clicks) + PW | **7** (`00:07.000`) then **8** (`00:08.000`); handle x = lane playhead x (793 / 833) | same; shot `RU-1-gstack-1440x900.png` |
| RU-ALT | PW (Alt held) | 7.3; `data-snap="on"` stays | `r50-1440x900.txt` |
| RU-ALT-ON | PW (Alt; PW `selectOption`) | division 1 → **7**; division 0.25 → **7.25**; `data-snap="off"` after both | same |
| RU-NAV | PW | horizontal −100 px → scrollLeft 0→100, position 2 unchanged; vertical +60 px → zoom 40→27.2 px/s, position 2 unchanged | same |
| RU-NAV (playback) | PW | pre-drag 3.001 → drag anchored at 12 s → 3.542 → +400 ms 3.942 (normal advance, no seek to 12); status `Follow შეჩერდა ხელით ნავიგაციისას. Follow ან Play აბრუნებს.` | `runs/r50b-1440x900.txt` |
| RU-DBL | **PW only** (no gstack dblclick) | status `Fit: მთლიანი პროექტი ჩანს (00:23.000). X აბრუნებს.`, zoom 39.7; the position set by the first click = **7.000**, on the grid | `r50-1440x900.txt` |
| RU-10 | PW only | division 10, Snap on, click at 4.9 → **0** | same |
| RU-1280 | PW only | at 1280×720: 7 then 8 (identical) | `r50-1280x720-RU-1_RU-OFF_DR-1_LA-1.txt` |
| P-END | PW click; SYNTHETIC `scrollLeft = max` setup | Snap 10 s, click at x 1438 = 52.95 s → `aria-valuenow` **50**, `aria-valuemax` 53, drawn length 53 s, `projectEnd` 23. Record only (P6); in this layout the snapped value does not exceed the drawn timeline | `r50b-1440x900.txt` |

The first P-END attempt in `r50-1440x900.txt` clicked off-screen at x 2630, because the ruler is 2120 px wide in a 1440 px viewport. That attempt is invalid and was replaced by `r50b`.

## 7. R50-DRAG — **PASS** (REAL-mouse (PW) for the drags)

| ID | Result |
|---|---|
| DR-1 (1440 and 1280) | During the drag at 5.4: `aria-valuenow` **5**. At 5.6: **6**. After release: **6**. Handle x = lane playhead x (713 / 753) — 0 px difference. |
| DR-ALT | Alt held: 5.4 during, 5.6 during, **5.6** after (free); snap stays on. |
| DR-OFF | Snap off: 5.4 / 5.6 / 5.6 (free). |
| DR-PLAY | During playback, dragged to 10.4: `aria-valuenow` **10** during. After release `playing=true` and the readout runs 10.209 → 10.310 → … → 10.761. **Real audio graph:** after the drag the music source restarted with `off 3` (= 10.000 − 7) at the release, and a sample on the way restarted it at `pos 8, off 1`. Stopped with Space. |
| DR-KEY | REAL (gstack click on the handle, then `$B press ArrowRight` ×2): 7.000 → **7.1** → **7.2** (±0.1 s unchanged, P3). PW gives the same. |

## 8. R50-LANE and R50-CLIP — **PASS**

| ID | Method | Result |
|---|---|---|
| LA-1 | REAL (gstack `$B click` on the lane element, clientX 864 → 14.4 s) | → **14.000**; active `stems`; selection 0; range null |
| LA-1 | PW at 4.6 s (1440 and 1280) | → **5**; active `sfx`→`stems`; selection 1→0; range null |
| LA-ALT | PW: down without Alt, then Alt, then up | **4.6** (Alt read on release) |
| LA-OFF | PW only | 4.6 |
| LA-MARQUEE | PW | `Soft impact` selected; position stays **2** |
| CL-1 | PW | music body at 7.3 → **7**, range null |
| CL-ALT | PW (Alt held) | 7.3 |
| CL-EDGE | PW, **adapted fixture** (see §12) | SFX moved with Snap off by +6 px to **4.15**; Snap on; body click at x 688 = 4.40 s (elementFromPoint = the body, `drag = დროის მონიშვნა · click = playhead`) → **4.000**, which is outside the clip, so it is not clamped (P5). Evidence: `runs/r50b-1440x900-CL-EDGE.txt`; the 4.3 geometry is in `runs/r50b-1440x900.txt` |
| CL-RANGE | PW | 7.3 → 9.6 → `{start 7, end 10, music}`; Undo unchanged (regression OK) |

## 9. R50-PASTE and R50-PLAY — **PASS**

| ID | Method | Result |
|---|---|---|
| PA-1 | REAL (gstack) + PW | Click the `Soft impact` header → `Copy: 1 კლიპი ბუფერშია.`, active sfx. Snap on; ruler click at 9.3 → 9. Ctrl+V → a new clip `sfx:9+2`; status exactly **`ჩასმა (1): 00:09.000-ზე · SFX ხაზზე.`**; Undo `ჩასმა (1)`. Ctrl+Z removes it; status `Undo: ჩასმა (1)`. |
| PA-ALT | PW (Alt ruler click) + PW Ctrl+V | 9.3 → new clip at **9.3**; status `ჩასმა (1): 00:09.300-ზე · SFX ხაზზე.` (P4) |
| PL-1 | REAL (gstack Mute, marker click, `$B press Space`; read-only in-page sampler every 25 ms) + PW | Mute `aria-pressed` false→true. Click at 3.6 → **4**. **The SFX source starts with `when 0.05` (= immediately), `off 0`.** The SFX meter is above −∞ from readout **4.022** (gstack) / **4.030** (PW), both ≤ 4.15. |
| PL-OFF | PW only | Click at 3.6 → 3.6. **The SFX source is scheduled 0.4 s later (`when 0.45`, `off 0`), and the video source starts at `off 3.6`.** The SFX meter stays −∞ through readout 3.990 and first rises at **4.051** (≥ 3.95). |

Together PL-1 and PL-OFF show, both in the audio graph and on the meter, that playback really starts from the snapped position.

## 10. R50-REG — **PASS**

- **REG-HYD** (`runs/reg-hyd.txt`): fresh load at 1440×900 and 1280×720, console for 3 s. The only lines are vite connecting/connected and the React DevTools notice. 0 hydration-mismatch, React or `useLayoutEffect` warnings.
- **C-R23-01 (record only):** SSR `/studio-lab` ×3 → 66 062 bytes, **NUL = 3 at offsets 11729, 28025, 28026**, U+FFFD 0 (`runs/ssr.txt`). This is identical to round 49 and is not fixed.
- **TR-1:** move to 4.3 with Snap off, then Snap on and the right edge −30 px → `4.3 + 1.7` (end 6.0); Undo `Trim — მარჯვენა კიდე`. This is identical to round 49.
- **AL-1:** Snap on, Alt held, +30 px → **4.75**; snap stays on. Identical to round 49.
- **G toggle and division texts:**
  - G on: `Snap ჩართულია — ბადე 1 წმ (G)`;
  - select 0.25: `ბადე: 0.25 წმ (Snap ჩართულია)`;
  - G off: `Snap გამორთულია — თავისუფალი გადაადგილება (G)`.

  The status code is not in the diff.
- **Render cost:** `render-budget.test.tsx` is green in the full run.

## 11. Ableton two-verdict table (§4.9)

There was no new fetch; the sources are the round-46 B records.

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Background click places the insert point (6.9) | **PASS** (LA-1) | **confirmed** (text) |
| The point follows the editing grid (6.10, general wording) | **PASS** (LA-1, CL-1) | **confirmed in general terms**; the insert marker is not named |
| Alt bypasses / temporarily enables the grid (6.10) | **PASS** (RU-ALT, RU-ALT-ON, LA-ALT, CL-ALT; read on release) | **confirmed** (text); reading Alt on release is a CZABA detail |
| Click in the clip waveform sets the insert point | **PASS** (CL-1) | **unconfirmed** (not described in 6.9) |
| Scrub-area click (6.2/6.3) | **PASS** (RU-1: moves without starting playback, uses the editing grid) | **deliberate difference** (Live launches playback with launch quantization) |
| Ruler drag scrolls/zooms (6.2) | **PASS** (RU-NAV, no seek) | **confirmed** |
| Playhead handle drag | **PASS** (DR-1, every sample snapped) | **not applicable / unconfirmed** |
| Arrow keys move the insert marker (6.9) | **PASS** (DR-KEY ±0.1 s) | **confirmed** that they move it; the step is **unconfirmed** |
| Paste at the insert marker | **PASS** (PA-1, PA-ALT) | **unconfirmed** |
| Loop-brace arrows by the grid (6.6) | not this round (3b) | confirmed (text); not tested |

Nowhere in this report do I claim that "Ableton does it this way" for an unconfirmed row.

## 12. Findings for B (no product bug)

1. **C-R50-N1 (info, test-spec):** CL-EDGE as written cannot be performed at 40 px/s.
   - After moving `Soft impact` to 4.3, the left trim handle is 8 px wide (x 685–693), which covers 4.30–4.50 s. A "body click at ~4.4" therefore lands on the trim handle, and the first body pixel is 4.55 → 5.
   - My first PW attempt (`r50-1440x900.txt` CL-EDGE: position 0) was this targeting error. It was replaced by the adapted fixture (4.15, click at 4.40 → 4).
   - For future rounds, B should keep fixture times out of the 8 px trim zones (0.2 s at 40 px/s) or zoom in.
2. **C-R50-N2 (record):** during a playhead drag in playback, every new snapped sample restarts the audio sources (`h30`: off 1 at pos 8, then off 3 at 10, then off 3 again at the release). This is the existing scrub behaviour, now quantized to grid lines. Release lands exactly on the line, so it is not a defect. It is recorded for R50-T.
3. **Harness:** see §0 for the REAL label gap. RU-DBL cannot be REAL with gstack. If REAL coverage is required for RU-10, RU-1280, LA-OFF and PL-OFF, B should plan it, or accept PW under GSTACK-NO-MOUSE.
4. **Lane REAL targeting:** a marker child cannot target the lane background (by design, `target === currentTarget`). Future REAL lane clicks should use the element click plus a read-only clientX capture, as in `runs/g50-real-la1b.txt`.

## 13. Carried (not re-run; not PASS)

- **A-R50-REVIEW-CLIP-CANCEL-SEEK** (Low, A's reviewer): a clip-body `pointercancel` with no movement still seeks. C did not test it, because it is outside §4. → B backlog.
- **A's architecture notes** → B / ARCH-CHECKPOINT-SRW14-PREFS:
  - the `(snapSeconds, gridSeconds, bypass)` triple now has 3 consumers;
  - the copied test harness.
- **Open C bugs:**
  - C-R48-01 (no recurrence this round);
  - C-R41-01;
  - C-R27-01 (includes RF3-1, RF3-2, R5-L6), C-R6-02, C-R8-01;
  - C-R23-01 (NUL 3, unchanged) + C-R38-01.
- **Root:**
  - ARCH-CHECKPOINT-SRW13 and ARCH-CHECKPOINT-SRW14-PREFS (unanswered);
  - GSTACK-NO-MOUSE (pending; used again here);
  - GSTACK-ACL, SRW-21, ENV-BROWSE-DAEMON (no daemon failure this round);
  - the CRLF Biome errors on the auth files;
  - fake Bearer → 500 (reproduced, unchanged).
- **`root-pre-push-review.md`** is the round-3 review. Its remaining findings are RF3-1, RF3-2 and R5-L6 under C-R27-01; they are still open.
- **`publication-checkpoint.json` → round49.open:**
  - C-R49-01 and C-R49-02 → **closed by this round**;
  - C-R48-01, R49-T, GSTACK-NO-MOUSE and ARCH-CHECKPOINT-SRW14-PREFS remain.
- **Tech Lead:** R50-T (1–3) plus the earlier manual checks.
- **Not run (per §4.8):**
  - video sync and C-R27-01;
  - the full find → add → fit video → export flow;
  - the FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root).

## 14. Commit readiness (for root)

**Ready.** The 7 paths of §3.1 match exactly, on HEAD `038ed5a`, with 401 OK and protected 4/4. verify exits 0 with 84 / 1438, and Biome is at the baseline. Root still owns `npm run test:e2e:smoke`, the commit and the push.
