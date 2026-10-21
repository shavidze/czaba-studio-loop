# C — Round 38 verification: SRW-13 stage 4b-1 (fader press does not jump, relative drag, double-click reset)

Verifier: C (independent) · Date: 2026-10-13 19:37–20:05 (session 1) and 2026-10-14 10:05–10:30 +04:00 (session 2, resume after the owned processes disappeared; no compact) · Raw evidence: `c-round-38/` (checkpoint `c-round-38/checkpoint.md`).
Browser: gstack `/browse` (`c-round-34/b.sh` wrapper, state `c-browse.json`), HeadlessChrome, target `http://127.0.0.1:5173/studio-lab`. Each session started a fresh daemon: a new context with no credentials (`auth_user` null, cookie `''`). Layout L38 = L37 (demo video `beeps-6s-vp9-opus.webm` at 0 (owned synthetic media), `სრული მიქსი` on music at 7, `Soft impact` on SFX at 4), built by `c-round-34/reset.sh`. The detail panel was expanded (`aria-expanded=true`).
Harness labels: **REAL** = `$B click` at the element centre, or `$B press` / `$B type`. **SYNTHETIC** = the dispatched pointer events (drags id 51, separator gesture id 41, lane-height id 61), window `pointerup` / `pointercancel`, `dblclick`, `blur()`, the zoom value restore and `seekTo`. C instrumentation (labelled): the `window.__c` reader, `hook30.js` (`setTargetAtTime` on gains + `AudioBufferSourceNode.start`), `hook31.js` (`StereoPannerNode.pan`), `hst.js`, `ptail.js`, `hl.js` and the fetch/XHR Authorization hook `c-round-35/scripts/authhook.js`. No source instrumentation. `node.exe` was recorded in every run: 5–11 (11 once during MN-CR36 setup, otherwise 6–7).

## 1. Verdict

**Task status: PASS.** Every round-38 acceptance ID that C ran passes on C's own runs: G38-1, G38-2, G38-3, R38-S, R38-PG, R38-DR, R38-DC, R38-MN, R38-CR, R38-K, R38-U and R38-Doc.

- A real click no longer moves any fader. Round 37 gave Volume 0.5 and Master −27 dB. Round 38 gives 1 / 0 dB, 0 entries, and the fader gets focus.
- The drag is relative and matches the §0 formula at the measured widths. The live music gain and pan follow the drag through `setTargetAtTime`, with 0 new source `start` calls.
- A synthetic double-click resets each fader with one entry. A **real** double-click cannot be produced by the harness; that stays Tech Lead R38-T.

**New item:** **C-R38-01 (low)**. The open bug C-R23-01 (NUL bytes in the SSR HTML) now lands inside two `aria-label` attributes. Hydration does not repair attributes, so they stay corrupted in the live DOM. The cause is not A's logic: the bytes moved because A's `touch-none` classes shifted the stream offsets. Details are in §9.

**Ableton:** only the Pan double-click reset is confirmed by the source. The no-jump press, the relative drag and the Volume/Master double-click are CZABA requirements that the source does not confirm (§8).

## 2. Gates

| ID | Result | Evidence |
|---|---|---|
| G38-1 | **PASS** (session 1, 19:38–19:41; the source shas were identical in session 2). tsc exit 0. vitest **70 files / 1290 passed** (= 1264 + 26). build ✓ (8.25 s). Biome `./app`: **2 errors**, only the baseline CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, plus 218 warnings and 1 info. The 6 Studio files are clean. Related 15 files: **373 passed** (fader-guards **71**, fader-click **26**, gesture-guard, track-pan, master-ui, clip-gain, meter-ui, track-meter-ui, track-layout, render-budget, delete-selection-ui, ArrangementContext.test.ts and others). The mutation control run (scratch copy) gave 97/97 again in session 2. node 6–7. | `c-round-38/gates/summary.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `related.txt`, `runs/mutations.txt` (control) |
| G38-2 | **PASS for A's scope.** HEAD `134b4aba8f46…` at the start (19:37 on 10-13) and the end (10:26 on 10-14). A's 7 lines match §3.2 exactly. Frozen list **376 OK**, 0 non-OK. Protected 4/4 OK. Shas `7de5a093` / `1707798c` / `9721d08f` / `d754367a` / `dabedf7d` / `65758397` / `263325b9` (= A's). **Root-side deviation, not A's:** 17 new `?? .codex/agents/*.toml` files appeared on 2026-10-14 at 10:02 (`.codex/**` is root's; none of them is in the frozen list). Root must exclude them from, or decide them for, a round-38 checkpoint. | `gates/g38-2-start.txt`, `gates/g38-2-end.txt` |
| G38-3 | **PASS.** The fake Bearer 500 is a known root item and is carried. | §2.1 |

### 2.1 G38-3 (anonymous, fresh context)

- **Header link:** a real click on the visible `Studio LabDemo` link on `/` opens `/studio-lab`. The workspace and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ appear; `auth_user` null, cookie `''`. Evidence: `runs/anon-header.json`, `shots/anon-header.png`.
- **Direct open after a restart:** the same result. Evidence: `runs/anon-direct.json`, `shots/anon-direct.png`.
- **Network on the header and direct loads:** 0 requests to `studio-token`, `recording-*` or `/api/download`, and no R2 host. Media is only `middle-east.mp3` and `hero-music.mp3`. The API calls are only the known `localhost:5199/api/cart` and the dev-module `/app/services/api/client.ts`. Evidence: `runs/g3-anon.txt`, `runs/network-anon-*.txt`.
- **Network during the press/drag session** (REAL clicks on music Volume, Master and video Volume, plus a SYNTHETIC DR-V, on the session-2 page): **0 requests**, and the Authorization hook shows `[]`. Each press again gave 0 entries, and DR-V gave 0.75 with one `Volume` entry. Evidence: `runs/g3-session.txt`, `runs/network-session.txt`.
- **curl:** an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401** `Please sign in to access Studio.`. A fake Bearer returns **500** `Unable to prepare Studio access` and no token (a known root item). Evidence: `runs/curl-token.txt`.
- **`/studio/middle-east`:** "Sign in required" and no workspace. **Premium auth is not bypassed.** Evidence: `runs/anon-studio-me.json`, `shots/anon-studio-me.png`.

## 3. R38-S — static review (PASS)

`diff -u` of `b-round-37-snapshots/` against the live files:
- **`ArrangementLane.tsx`** changes only:
  - the imports;
  - two constants (`TRACK_VOLUME_STEP = 0.01`, the same value as the old literal `step={0.01}`, so no behaviour change; `TRACK_VOLUME_DEFAULT = 1`);
  - `handlePanPointerDown`'s body → `beginPanPointerDrag(pointerId): boolean` (the button guard moved into the hook);
  - the two hook instances;
  - `resetTrackVolume`;
  - Pan `onDoubleClick` + `touch-none`;
  - Volume `onPointerDown` → hook, `onDoubleClick`, `step` constant, `touch-none`.

  `suppressPanPointerAfterBlur`, `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur`, the readout button and Volume's `onChange` / `onPointerUp` / `onLostPointerCapture` / `onKeyUp` / `onBlur` are not in the diff (byte-identical).
- **`ArrangementMaster.tsx`** changes only the import, `MASTER_GAIN_DEFAULT_DB`, the destructure (+`getArrangement`, `setStatus`), the hook, `resetMasterGain`, `onPointerDown`, `onDoubleClick` and `touch-none`.
- **`fader-guards.test.tsx`:** exactly 3 `-` and 3 `+` (l.840, the l.1597 title, l.1602), as authorised.
- **New files:** `fader.ts` (33 lines), `useRelativeFaderDrag.ts` (92 lines), `fader-click.test.tsx` (26 `it`) and doc 037.
- **Banned patterns:** no `any`, no `@ts-ignore`, no type assertion (the only ` as ` is the import alias `PointerEvent as ReactPointerEvent`), no `//` comment, no hardcoded colour (only the `touch-none` class was added).
- 376 OK.

## 4. R38-PG — a press does not jump (REAL clicks; PASS)

1440×900, anonymous (`auth=null`). Evidence: `runs/pg-1440.txt`, `runs/pg-1280.txt`, `shots/pg-1280.png`.

| Case | Round 37 (old code) | Round 38 value | Entries | Focus after | Status |
|---|---|---|---|---|---|
| PG-V music Volume | **0.5** (`c-round-37/runs/crk.txt` CR-1) | `1` | 0 | `Volume — მუსიკა` | unchanged |
| PG-S SFX Volume | 0.5 (same input type) | `1` | 0 | `Volume — SFX` | unchanged |
| PG-VID video Volume | 0.5 | `1` | 0 | `Volume — ვიდეოს ორიგინალი ხმა` | unchanged |
| PG-M Master | **−27 dB** (`c-round-37.md` CR-2) | `0` | 0 | `Master Volume` | unchanged |
| PG-P Pan at `10R` (setup: a REAL click on Pan (itself 0 entries, value `0`) + 10 × REAL ArrowRight = 10 entries) | `C` | `10` (`10R`), pan 0.2 | 0 | `Pan — მუსიკა` | unchanged |
| PG-KEY after PG-M, REAL ArrowDown ×2 | — | Master `−1` | 2 | Master | — |
| PG-DEL SFX clip selected → REAL click music Volume → REAL Delete | — | clip kept | 0 | Volume | — |
| PG-DEL then REAL click SFX header → REAL Delete | — | clip deleted, `კლიპის წაშლა` | 1 | BODY | `კლიპი წაიშალა; სიცარიელე დარჩა.` |
| PG-1280 (1280×720) PG-V and PG-M | — | `1` / `0` | 0 / 0 | the fader | unchanged |

Widths at 1440: Volume 107 px, Master 96 px, Pan 48 px. At 1280: Volume 107, Master 96. Session 2 repeated PG-V, PG-M and PG-VID: the same results (`runs/g3-session.txt`).

## 5. R38-DR — relative drag (SYNTHETIC pointer id 51; PASS)

Press at left + 0.3·width (vertical centre), 3 window `pointermove` steps, window/element `pointerup`. The expected value comes from the §0 formula at the measured width.

| Case | Width px | Δ px | Mid values | Expected | Result | Entries | Evidence |
|---|---|---|---|---|---|---|---|
| DR-V music Volume | 107 | −26.75 | 0.92 / 0.83 / 0.75 (past unchanged) | 0.75 | **0.75**, `Volume`; REAL ruler click + Ctrl+Z → `1` | 1 | `runs/dr-v.txt` |
| DR-VID video Volume | 107 | −53.5 | — | 0.5 | **0.5** | 1 `Volume` | `runs/dr-vid-m.txt` |
| DR-M Master | 96 | −17.4545 (= 12/66·96) | −4 / −8 / −12 | −12.0 | **−12** | 1 `Master Volume` | `runs/dr-vid-m.txt` |
| DR-P music Pan | 48 | +9.6 | 7 / 13 / 20, `history.past` 3/3/3 during the drag | 20R | **20R** (pan 0.4) | 1 `Pan — მუსიკა` | `runs/dr-p-0-y-off.txt` |
| DR-0 music Volume | 107 | −20 → back to 0 | 0.91 / 0.81 / 0.91 / 1 | unchanged | **1** | 0 | same |
| DR-Y music Volume | 107 | 0, dy +40 | 1 / 1 / 1 | unchanged | **1** | 0 | same |
| DR-V-OFF (extra) | 107 | −26.75, release 60 px below, on a BUTTON | 0.92 / 0.83 / 0.75 | 0.75 | 0.75; no pending value after the blur | 1 | same, `runs/dr-1280.txt` |
| DR-1280 (1280×720) | 107 | −26.75 | — | 0.75 | **0.75** | 1 | `runs/dr-1280.txt` |

**Live audio** (`runs/dr-au.txt`; C hooks on `setTargetAtTime` and `AudioBufferSourceNode.prototype.start`):
- **DR-AU:** synthetic `seekTo(8)`, then REAL Play (playing, position 10.06 s), then DR-V during playback. The music gain node (g3) received `setTargetAtTime` targets **0.92 → 0.83 → 0.75** during the move. **0** new `start` calls (`starts30: 0, starts31: 0`). The other track gains were re-set to 1 on each move (same targets, no audible change). Then Pause.
- **DR-AU-P:** DR-P during playback. The music `StereoPannerNode.pan` received `setTargetAtTime` **0.14 → 0.26 → 0.40** (= 20R). **0** new `start` calls. Pause.

## 6. R38-DC — double-click (SYNTHETIC `dblclick`; PASS) and DC-REAL (info)

Evidence: `runs/dc.txt`, `runs/dc-g-seq.txt`, `runs/dc-real.txt`.

| Case | Before | After | Entries | Notes |
|---|---|---|---|---|
| DC-V | music Volume 0.75 | **1** | +1 `Volume` | status unchanged |
| DC-M | Master −12 | **0** | +1 `Master Volume` | |
| DC-P | Pan 20R (0.4) | **C** (0) | +1 `Pan — მუსიკა` | readout `C`, disabled |
| DC-VID | video 0.5 | **1** | +1 `Volume` | |
| DC-0 | defaults on Volume, Master, Pan, video | unchanged | 0 each | status unchanged; readout `C disabled=true` |
| DC-G | music Volume 0.75, synthetic separator 41 held | 0.75 | 0 | status `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` |
| DC-SEQ | Master −12: synthetic pointerdown/up/click ×2 + dblclick | **0** | exactly +1 (5 → 6) | |
| DC-REAL (info only) | Master −12; two REAL `$B click`s in one `$B chain`, 88–92 ms apart | −12 | 0 | Events: `pointerdown`, `click` ×2. `click.detail` was 1 both times; no `mousedown`, because the prevented `pointerdown` suppresses the compatibility events. **No `dblclick` fired**: CDP sends `clickCount=1` for each click. The harness cannot produce a real double-click, so this stays **Tech Lead R38-T**. |

After DC-G the blocked status persists into the next steps (for example the MN-RESET pre-state). That is the known **C-R37-01** stale-status item (4b-2), not a new bug.

## 7. R38-MN, R38-CR, R38-K (PASS)

Evidence: `runs/mn1.txt`, `runs/mn2.txt`, `runs/mn3.txt`, `runs/cr.txt`, `runs/lh.txt`, `shots/mn-z.png`.

| ID | Result |
|---|---|
| MN-Z | A REAL centre click moves Zoom from 678 to **500** (native jump kept). Focus goes to `Zoom (px/წმ)`, there is no `touch-none` class, and a synthetic `pointerdown` is not prevented (`ret=true`). 0 history entries. (The session-1 focus read had a harness quoting error, so session 2 re-read it.) |
| MN-G | Synthetic separator 41 held, then a REAL click on music Volume: value `1`, focus stays BODY, status blocked, 0 entries, gesture flag still true until `pointerup` 41. |
| MN-CR36 | Clip Gain `3` typed, synthetic separator 41, then a REAL click on Master: the field **keeps focus** and `3`, Master stays `0`, status blocked, 0 entries. After `pointerup` 41, a REAL Enter gives +1 `Clip Gain` and the status `Clip Gain: Soft impact — +3.0 dB.`. |
| MN-BLUR | Synthetic held drag (0.92 / 0.83 / 0.75, gesture active), then a **REAL Tab** (focus moved to `მუსიკა სიმაღლე`): the value returns to `1`, 0 entries, gesture off. Then a synthetic window `pointermove` 51 (Δ −40): `history.present` music volume = **1 synchronously** after `dispatchEvent` and still 1 after 250 ms. The input shows `1`. **0** new `setTargetAtTime` calls. Then synthetic `pointerup` 51, a REAL ruler click and a blur: still 0 entries. |
| MN-CANCEL | The same sequence with a synthetic window `pointercancel` 51: value restored to `1`, the stray move changes nothing (sync and +250 ms), 0 `setTargetAtTime`, 0 entries. |
| MN-RESET | Pan 20R (synthetic drag, +1), then a REAL click on `Pan → C`: `C`, +1 `Pan — მუსიკა`, readout disabled, focus Pan. |
| CR-1 | Clip Gain `3` (no Enter), then a REAL click on music Volume: tail `[…, Clip Gain]` **only** (round 37 also had `Volume` from the jump). SFX gain 3, Volume `1`, focus music Volume, no blocked status. REAL ruler click + Ctrl+Z → `Undo: Clip Gain`. |
| CR-2 | The same with Master (focus Master, `0`) and with music Pan (focus Pan, `0`): `[…, Clip Gain]` only. |
| CR-3 | Library search `ab` (4 items), then a REAL click on music Pan: search released (focus Pan), text `ab` and 4 items kept, Pan `0`, 0 entries. |
| CR-4 | CG-1: Clip Gain `3`, then a REAL click on the music header: +1 `Clip Gain`, focus BODY. REAL Delete deletes the music clip (`კლიპის წაშლა`). |
| CR-5 | REAL click on music Volume, REAL click on the SFX header, REAL Delete: the clip is deleted (+1). |
| K Mute/Solo/Master Mute | One entry each (`Mute — მუსიკა`, `Solo — მუსიკა`, `Master Mute`); `aria-pressed=true`. |
| K Clip Gain | Enter +1; 0 dB reset +1 (`0.0`); Escape 0 and blur 0. |
| K keyboard | 2 REAL Tabs reach music Volume; REAL ArrowLeft → `0.99`, +1 `Volume`. |
| K lane height | Synthetic drag of `მუსიკა სიმაღლე` +30 px: the lane goes from 111 to 141 px, 0 history entries, Volume unchanged. |

## 8. Ableton two-verdict table (§4.8)

Sources were not re-fetched; I used B's captures (`b-round-29/ableton-mixing-20261012.txt` §18.1, `b-round-37/ableton-live-keyboard-shortcuts-20261013.txt` §42.4/§42.6). No video was used.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| Pan double-click → default | **PASS** (DC-P; synthetic dblclick only; real dblclick = R38-T) | **დადასტურებული** (§18.1: "Double-clicking the Pan control resets it to its default value.") |
| Volume / Master double-click → 100 % / 0 dB | **PASS** (DC-V, DC-M, DC-VID; synthetic) | **დაუდასტურებელი** for mixer Volume/Main. §42.4 covers device parameters; §18.1 names only Pan. |
| Click does not jump; relative drag | **PASS** (R38-PG, R38-DR) | **დაუდასტურებელი**. No text was found in §18.1, Live Concepts or §42. It is a CZABA requirement. |
| Delete on a focused control → default | **PASS** for the CZABA contract (PG-DEL: Delete on a focused fader is a no-op) | **შეგნებული განსხვავება**. §42.6 "Return to Default — Delete" is confirmed in the source; CZABA deliberately keeps the round 32–33 no-op. |
| Shift = finer drag | not in this round (T12.9); not run | **არ ეხება** this round. The source confirms it (§42.6), but it is not implemented. |

## 9. R38-U mutations, R38-Doc and new findings

### 9.1 Mutations (scratch copy `c-round-38/mut/`, outside `store/`; `node_modules` is a junction; restore was verified identical)

| # | Mutation | Result |
|---|---|---|
| control | none | 97/97 |
| (a) | remove `preventDefault` from the press | **caught:** F1, F2, F6, F7 (T1 / Zoom stays green) |
| (b) | remove `fader.focus()` | **caught:** F1, F6, R1, both amended fader-guards tests (l.835 self-check, l.1597) |
| (c) | scale by `2·widthPx` | **caught:** 11 tests (F2–F6, F8, F9/F9b, P1, P3, P4, P6) |
| (d) | remove Volume `onDoubleClick` | **caught:** D1, D5, D6 |
| (e) | drop the refusal status | **caught:** F7 |
| (f) | keep previewing after blur/cancel (the `pointermove` listener is not removed) | **caught:** F8, F9/F9b, the unmount test |
| (g) | remove `touch-none` from Master | **caught:** T1 |
| (h) | no snap | **caught:** P5, P6 (not P1/P3, as A stated) |
| (i) optional | `focus()` after `beginGesture` (order swap) | **survives (97/97).** This confirms A's **A-R38-TEST-ORDER**: no jsdom test isolates the order. The browser order is correct today (CR-1/CR-2 keep only `Clip Gain`). Low, for B. |

Evidence: `runs/mutations.txt`, `runs/mut-*.txt`, `runs/mut-*.diff`.

**A's red run reproduces as recorded:** `a-round-38/red-run.txt` shows 22 failed / 71 passed (93), P5 and D4 green on old code; the green run shows 97/97. C's (a) and (b) results match A's description of which tests depend on the press handling.

### 9.2 R38-Doc — PASS

Doc 037 covers every §2.4 item:
- the date, the status (In Progress) and the project;
- the context with C's −27 dB / 50 % evidence;
- the contract table;
- the mechanism and the B probe;
- why `onChange` stays;
- the focus decision with the 3 authorised lines;
- the rejected alternatives a–d;
- the formula and the `toPrecision(12)` normalisation;
- the dblclick and its verification limit;
- touch;
- the files;
- problems → solutions;
- the tests with red/green numbers;
- the C IDs;
- the Ableton table, identical in substance to §4.8;
- the 4b-2 TODO.

It matches the code. One note for B: the doc does not mention the untested `focus()`→`begin` order (A-R38-TEST-ORDER), and C confirmed it with mutation (i).

### 9.3 C-R38-01 (low, new manifestation of C-R23-01)

**C-R23-01 record:** `curl -s http://127.0.0.1:5173/studio-lab` returns **63 611 bytes with 5 NUL** at offsets **11729, 28025, 28026, 58745, 58746**. Three repeats gave identical results. Round 37 had 63 520 bytes with 2 NUL at 28013/28014.
- The +91 bytes and the shifted offsets fit A's added `touch-none ` classes.
- The NULs fall inside multi-byte Georgian text, so they look like a stream chunk-boundary defect.
- In the hydrated DOM, the text node at 28025 is repaired, but two **attributes** stay corrupted:
  - `BUTTON aria-label="ბიბ�ლიოთეკის დაკეცვა"` (library collapse);
  - `INPUT aria-label="range-ის დ��ასაწყისი (წამი)"` (detail range start).
- A screen reader reads a broken label on two controls.

Evidence: `runs/studio-lab.html`, `runs/sl1-3.html`, `runs/c-r23-01-dom.txt`. A's logic is not the cause. Owner: Tech Lead / root with C-R23-01. It is not proven whether a production build shows the same defect.

## 10. Carried, honest (not PASS)

- **Not run this round:** exports and WAV integrity; PUI geometry and video sync; the C-R27-01 table; the full find → add → fit video → export flow; FB-01..FB-16 (stage regression). The export path is unchanged.
- **Tech Lead R38-T:**
  - a real-mouse no-jump check, a smooth drag and a real double-click on Volume, Master and Pan;
  - a touch device: the drag does not scroll, and **A-R38-REVIEW-TOUCH** (a possible native touch slide, unverified, Medium per the reviewer).

  Also R35-T, R30-T, R31-T, R33-T, R34-T and TL-Q-FB05-FB11.
- **Open C bugs:** C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 (updated record above, plus C-R38-01); C-R30-01; C-R37-01 (stale refusal status, seen again after DC-G and MN-G).
- **Open low items:** A-R38-TEST-ORDER (confirmed); R26-M1; the stage 4b-2 list (FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending-commit order, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES, A-R37-TEST-HARDENING); R9-REVIEWER-M1-L8; A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE; L3-REMOVED-TRACK-TAPS; LIB-SEP-REASON; DOC034-UNREACHABLE-NOTE; DOC035-NOTES; DOC036-R37-TAIL; DOC036-ROUND-REF; DOC015-DELETE-GAP-NOTE; EXPORT-DIALOG-FOCUS-RESTORE.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json` → `round37Checkpoint` `134b4ab` "lows for B triage", `checkpoint-r37-review.md`):
  - round 38 is now C-passed and can be considered for a checkpoint, but only A's 7 paths; the 17 untracked `.codex/agents/*.toml` are root's and must be decided separately;
  - `npm run test:e2e:smoke` (root only; C did not run it);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` Write/Bash grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist (blocks a real dblclick/drag);
  - `Content-Type` without a charset;
  - dev-server availability: in session 2 the gstack daemon printed "Server failed to start within 15s" twice; a retried `goto` worked.
