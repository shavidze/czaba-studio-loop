# C — Round 36 verification (C-R34-01 + C-R34-02, D-29z / D-29z1)

Verifier: C · 2026-10-13 (17:24–17:40 +04:00) · Server `http://127.0.0.1:5173/studio-lab` 200. The served `StudioWorkspace.tsx` module contains `releaseTypingFocusBeforeRangePointerDown` (2 matches, `c-round-36/gates/served-module.txt`).
- **Browser:** gstack `/browse`, state file `c-browse.json`, HeadlessChrome. Anonymous context: `auth_user` null, cookie ''. The daemon was restarted (`$B restart`) for G36-3, which gives a fresh context with no credentials.
- **Viewports:** 1440×900 with the detail panel expanded (`arrangement-detail-toggle` aria-expanded `true`), plus a 1280×720 spot check.
- **Media:** C's own synthetic `beeps-6s-vp9-opus.webm` and the 2 demo MP3s. Nothing was uploaded externally.
- **node.exe:** 7 at start, during the gates and during almost every browser run. One-off readings came from other processes: 9 and 13 during R36-CR, 19 at the end of R36-K, 11 during the Zoom retry.
- **No changes:** no app source was edited. Mutations ran only in `c-round-36/mut/`, outside `store/`. No commit, push or deploy.

**Verdict: PASS.** Every acceptance row of round 36 holds with real clicks.
- **C-R34-01 is fixed.** The typed `3` is committed before every range gesture, and the blocked status no longer appears.
- **C-R34-02 is fixed** in doc 036.
- **One open bug carries over: C-R36-01** (Medium, it predates this round, so it is not a regression). It is A's code-review finding A-R36-REVIEW-1, now reproduced in the browser. The contract deliberately leaves this path unchanged, so it does not fail this round. It goes to B for stage 4b.

## 1. Summary per ID

| ID | Result | Evidence |
|---|---|---|
| G36-1 | **PASS** | `gates/summary.txt`, `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `frozen.txt` |
| G36-2 | **PASS** | `gates/g36-2-end.txt` |
| G36-3 | **PASS** (the fake-Bearer 500 is a known item, carried) | `runs/anon-*.json`, `network-*.txt`, `curl-token.txt`, `g36-3-cr-drag-auth.txt`, `shots/anon-*.png` |
| R36-S | **PASS** | `gates/snap-*.diff` |
| R36-CR | **PASS** (5/5 targets + two Undos + the 1280 spot check) | `runs/cr-1440.txt`, `cr-1280.txt`, `shots/cr-master-1440.png` |
| R36-OT | **PASS** (7 rows) | `runs/ot.txt` |
| R36-CL | **PASS** (3 valid attempts, 0 replacements) | `runs/cl.txt` |
| R36-R34 | **PASS** (CG-1, TS, SB, FT, R33-G, round-32 must-not) | `runs/r34-cg.txt`, `r34-ts.txt`, `r34-sb.txt`, `r33-ft.txt`, `r33-g.txt` |
| R36-K | **PASS** | `runs/k.txt`, `k-zoom.txt` |
| R36-U | **PASS** (12 cases green; mutations a–f all killed) | `runs/mut-*.txt`, `mut-*.diff`, `mut-summary.txt` |
| R36-Doc | **PASS**, with one follow-up note for B (§8) | `gates/snap-036.diff` |
| C-R23-01 record | 2 NUL bytes at offsets 28013 and 28014, in 63 520 bytes (unchanged from round 35) | `runs/c-r23-01-record.txt` |

## 2. Gates

**G36-1** (17:24:57–17:26:29, node.exe 7 → 7):
- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: **69 files, 1259/1259**. This equals 1247 + 12.
- `npm run build`: ✓ built in 3.22 s.
- `npx biome check ./app`: 338 files, **2 errors**, 218 warnings, 1 info.
  - `--diagnostic-level=error` lists only `app\lib\auth.ts` and `app\lib\__tests__\bug-hunting\auth-bugs.test.ts`, both `format` (the CRLF baseline, root's).
  - `biome check` on the 2 owned TS files: no diagnostics.
- Frozen list plus fader-guards: **12 files, 319/319**. That is the 11 frozen suites (253) plus fader-guards (66).

**G36-2** (start 17:24 and end 17:38):
- HEAD `1cefea1` at start and at end; root did not commit.
- `git status --short`: the same **9** lines.
- `b-round-35-tree-sha256.txt`: **376 OK** (0 not OK).
- Protected files: 4/4 OK.
- Owned file shas:
  - `StudioWorkspace.tsx` `7fe98434`;
  - `fader-guards.test.tsx` `ca3153ad`;
  - doc 036 `d5f206c1`.
- The artifacts A used still have their dispatched shas: `proposed-StudioWorkspace.diff` `3ec3dca1`, `new-describe.tsx.txt` `ab95eb26`.

**G36-3:**
- **Direct open, fresh context:** `/studio-lab` shows the workspace and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“; `auth_user` null, cookie ''.
- **Header link:** a real click on the visible `Studio LabDemo` link (836,19) on `/` goes to `/studio-lab`, with the same result.
  - C's first selector matched the hidden duplicate link and did not navigate. That was a harness error, not an app bug.
- **Network** (header, direct, and the session that covered R36-CR, R36-CL and the drags):
  - 0 requests to `studio-token`, `recording-*` or `/api/download`, and no R2 host;
  - media only `/middle-east.mp3`, `/videos/hero/hero-music.mp3` and `blob:`;
  - only the known extras: `localhost:5199/api/cart`, GA/gtag, and fonts.
- **Authorization hook** (fetch + XHR, labelled as C instrumentation): 0 requests with an `Authorization` header during the 1280 R36-CR Master click, and 0 during a fresh-context R36-CR Master click plus a synthetic Volume drag (1 → 0.75, +1 entry).
- **curl:**
  - an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401** `Please sign in to access Studio.`;
  - a fake Bearer returns **500** `Unable to prepare Studio access`, with no token (a known root item).
- **`/studio/middle-east`:** "Sign in required", and no workspace is shown. **Premium auth is not bypassed.**

## 3. R36-S — static diffs

**`StudioWorkspace.tsx`:**
- 2 hunks: the new `useCallback` `releaseTypingFocusBeforeRangePointerDown` (+15 lines) and `onPointerDownCapture` on the root `studio-container` div.
- Apart from the header lines, the `diff -u` body is **byte-identical** to `a-round-35/proposed-StudioWorkspace.diff`.
- Nothing else changed. That includes `releaseEditFocusOnTimelinePointerDown`, the predicates, the keydown handler, the round-32 guard and the scroller's `onPointerDownCapture` (now l.1395).

**`fader-guards.test.tsx`:**
- C compared the first 1360 snapshot lines with the live file line by line. Exactly 3 lines differ, **l.1258, l.1265 and l.1272**, and their bytes match the ruling table (indentation unchanged).
- Every other change is an appended line. The file ends with `new-describe.tsx.txt + '});\n'` (`endsWith` = true), so the describe is byte-identical.
- The describe has 12 `it`s, matching the task list 1–12.

**Doc 036:** 3 hunks: the l.4 header, the l.355 parenthesis, and an append from l.391 on.

**Style:** no `any`, `@ts-ignore`, `// comment` or hardcoded colour in the added code.

## 4. R36-CR — Clip Gain `3` without Enter, then a real click on a range (1440×900)

The steps in every case:
1. a real click on the SFX header;
2. a real click into Clip Gain;
3. a real Ctrl+A;
4. real typing of `3`;
5. a real `$B click` at the target's centre.

Layout L36: video at 0, `სრული მიქსი` on music at 7, `Soft impact` on SFX at 4. The history `past` = 3 before every case.

| Target | Round 35 (`c-round-35/runs/cr-baseline-1440.txt`) | Round 36 (`runs/cr-1440.txt`) | Result |
|---|---|---|---|
| music Volume | SFX `-` (lost); tail `[…, Volume]`; status „რედაქტირება drag-ის დროს არ მუშაობს…“; focus Volume | SFX **gainDb 3**; past 3→5, tail `[…, Clip Gain, Volume]`; status `Clip Gain: Soft impact — +3.0 dB.`; focus `Volume — მუსიკა`; fader 1 → **0.5** (the native jump to the click point); after reselecting SFX the field shows `3.0` | PASS |
| two Ctrl+Z after the music Volume case | — | Undo 1: `Undo: Volume`, Volume 0.5 → 1, SFX still 3. Undo 2: SFX back to `-`, field `0.0`, past 3 | PASS |
| music Pan (centre click) | lost; blocked status; focus Pan | SFX **3**; past 3→4, tail `[…, Clip Gain]`; no blocked status; focus `Pan — მუსიკა`; Pan 0 → 0; **0 Pan entries** (D-29z1) | PASS |
| Master Volume | lost; blocked status | SFX **3**; tail `[…, Clip Gain, Master Volume]`; status `+3.0 dB`; focus `Master Volume`; Master 0 → −27 (the jump) | PASS |
| video Volume | lost; blocked status | SFX **3**; tail `[…, Clip Gain, Volume]`; focus `Volume — ვიდეოს ორიგინალი ხმა`; video Volume 1 → 0.5 | PASS |
| Zoom (regression) | +1 Clip Gain | +1 `Clip Gain` only; no blocked status; focus `Zoom (px/წმ)`; Zoom 678 → 500 | PASS |

- **1280×720 spot check** (`runs/cr-1280.txt`): Clip Gain `3`, then a real click on Master → SFX **3**, tail `[Clip Gain, Master Volume]`, focus `Master Volume`, Master −27, 0 Authorization requests.
- **Fresh context (after the browse restart)**, `runs/g36-3-cr-drag-auth.txt`: the same Master case gives the same tail `[Clip Gain, Master Volume]`.

## 5. R36-OT — the other rows (`runs/ot.txt`)

| Case | Result | Verdict |
|---|---|---|
| Clip Gain `0.0` (unchanged) → real click on music Volume | 0 `Clip Gain` entries; +1 `Volume`; focus Volume | PASS |
| Invalid `-` → real click on Master, against a real Tab from the same text | Both give status `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).` and 0 `Clip Gain` entries. The click adds `Master Volume` (the fader's own entry); Tab adds nothing. In both, the field resets to `0.0`. Note: the number field reports `value ""` for `-`. | PASS |
| Invalid `1e`, the same pair | The same as `-`: identical status and 0 `Clip Gain` entries in both | PASS |
| Detail start `9` typed without Enter (music selected) → real click on Master | Focus on `Master Volume`; `range` null (not applied); 0 entries from the field (+1 `Master Volume` only). The field text stays `9`. | PASS |
| Search `ab` → real click on Master | Focus `Master Volume`; search `ab`; 4 items (the same as round 35) | PASS |
| **SYNTHETIC gesture:** Clip Gain `3` focused; `pointerdown` id 41 on the detail separator, then id 42 on Master | id 41: `defaultPrevented` true, gesture true. Right after id 42, `activeElement` is still Clip Gain and the field still shows `3`, with 0 entries. After `pointerup` 41, the gesture is false, focus stays on Clip Gain and the field still shows `3`. A later real click on the SFX header commits it: +1 `Clip Gain`, SFX 3. | PASS |
| **Must-not:** music Volume focused with `focus()`, then a real click on Master | Focus moves natively to Master; +1 `Master Volume`; nothing else changes | PASS (record) |
| **Decision 4** (REC-OUT-1): search `ab` → real click on a library item → Delete | focus `BUTTON`; Delete deletes the SFX clip (+1) | PASS (= round 34 REC-OUT-1) |

- **The must-not row has no exact round-34 baseline.** Round 34 recorded only Delete/Backspace on a focused Volume. The result above is what plain native behaviour gives. Mutation (e) proves that the new handler does nothing for a focused range: case 12 and 3 round-32 focused-range tests fail when it does.
- **The stale refusal status** (stage 4b, carried) showed again: the blocked status left by OT-5b was still shown during OT-6.

### C-R36-01 (Medium, predates this round): a second pointer on a range during another gesture loses the typed value. This is A-R36-REVIEW-1, reproduced.

The pointer events are partly synthetic and labelled as such (`runs/ot.txt`, block OT-5b).

**Steps:**
1. Select SFX, click into Clip Gain and type `3` (no Enter).
2. Start a **synthetic** detail-separator `pointerdown` id 41. It calls `preventDefault`, and the gesture becomes active.
3. Make a **real** `$B click` on Master Volume.

**Result:**
- The SFX value is `-` (the `3` is lost) and the field shows `0.0`.
- The status is „რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“
- Focus is on `Master Volume`, and `past` is unchanged.
- After `pointerup` 41 the value is still lost.

**Why it is not a round-36 failure:**
- D-29z row 2 says: gesture active → the new code does not blur, and the existing behaviour is unchanged.
- In a real browser, a real press needs a second simultaneous pointer (multi-touch or pen plus mouse) to be active while another gesture is held.

**Notes for B:**
- Doc 036 says this path is "ბრაუზერში არ შემოწმებულა"; that is now outdated.
- Fix this in stage 4b, or relabel case 10's focus assertions as jsdom-only.

## 6. R36-CL — live audio (`runs/cl.txt`)

- **Hooks** (C instrumentation): `createGain`, `connect`, `AudioParam.setTargetAtTime` and `AudioBufferSourceNode.start`.
- **Loop:** 3.5–6.0, from a range on the video lane (detail start/end + Apply), then Ctrl+L.
- **Each attempt:** Space, then a real click on the SFX header, a real click into Clip Gain, typing `3`, and a real click on the **music Volume**.

| Attempt | pos at commit (hook) | Clip-gain `setTargetAtTime(1.412538, τ 0.015)` | Restarts (`start` with `when` ≈ the click) | Next SFX source `gv` | Volume line gain | History | Valid |
|---|---|---|---|---|---|---|---|
| 1 | 4.118 (inside [4,6)) | **2**: `g26` (playing, when 80.52) + `g28` (scheduled, when 83.02) | 0 | `g30` = 1.412538 | `g20` → 0.5 (τ 0.015) | past 4 → 6: `Clip Gain`, `Volume` | ✓ |
| 2 | 4.121 | **2**: `g39` (playing) + `g41` (scheduled) | 0 | `g43` = 1.412538 | `g33` → 0.5 | 4 → 6 | ✓ |
| 3 | 4.230 | **2**: `g52` (playing) + `g54` (scheduled) | 0 | `g56` = 1.412538 | `g46` → 0.5 | 4 → 6 | ✓ |

- **Budget:** 3 valid runs and 0 replacements. Playback was running at every click.
- **Commit-time re-targets:** each commit also re-targets the line and master gains (`g18`–`g22` and so on) to 1. The music Volume change then re-targets its line gain to 0.5. Neither is a clip-gain node.
- **No restarts:** the only `start` calls in the click window are the scheduler's usual lookahead (pos ≈ 4.01, when +2 s).

## 7. R36-R34 and R36-K

**R36-R34:**
- **CG-1:** Clip Gain `3`, then a real click on the music header → +1 `Clip Gain`, music selected, focus BODY; Delete deletes (+1).
  - CG-1u: reselect, then Undo → `Undo: Clip Gain`, field `0.0`.
  - CG-2: Clip Gain `3`, then a real click on the SFX header → +1, then Delete deletes.
- **R34-TS:** search `ab`, then a real click on the SFX header → focus BODY, search still `ab`. Delete and Backspace each delete the clip (+1, clips 3 → 2).
- **R34-SB:** all 4 lanes folded with real clicks, then a real click on the scroller centre, which hit-tests to the scroller itself, with the search focused → BODY, search `ab`. Delete and Backspace each delete (+1). The lanes were unfolded afterwards.
- **R33-FT:** FT-1 (music Volume → SFX header → Delete), FT-2 (Master → ruler → Delete) and FT-3 (Pan → lane → header → Backspace) each delete +1.
- **R33-G** (synthetic, playing):
  - The setup: Pan `pointerdown` id 41 plus inputs −10/−20, then an SFX-header `pointerdown`/`pointerup` id 42, then a window `pointerup` 41.
  - Pan keeps focus, and id 42 causes 0 `setTargetAtTime` calls. The hook was live: 2 Pan calls during the inputs.
  - +1 `Pan — მუსიკა` at `pointerup` 41, with the stored Pan at −0.4.
- **Round-32 must-not:** music Volume focused with `focus()`, then Delete and Backspace → `past` stays 3 and focus stays on Volume.

**R36-K:**
- **Synthetic drags** with no field focused: each writes **exactly one** entry.
  - Volume 1 → 0.7 → `Volume`;
  - Pan 0 → −30 → `Pan — მუსიკა`, readout `30L`;
  - Master 0 → −9 → `Master Volume`, readout `−9.0 dB`.
- **Clip Gain:**
  - Enter → +1, `+3.0 dB`, and focus stays in the field;
  - the `0 dB` reset → +1, `0.0 dB`;
  - Escape (typed `5`) → 0 entries, and the following blur → 0 entries.
- **Zoom:**
  - A real centre click from 1000 goes to 500 (scrollWidth 17184 → 1147), with 0 entries.
  - A centre click when the thumb is already at the centre (497–500) does not move it. That is native thumb behaviour, recorded.
- **Toggles** (real clicks): Master Mute false → true → false; music Mute false → true → false; music Solo false → true → false.
  - Each toggle writes one history entry, for example `Master Mute`. This is existing behaviour, not checked against an earlier baseline.

## 8. R36-U — tests and mutations

- **The 12 cases** exist and are green: fader-guards 66/66 in the frozen run and inside the full 1259.
- **A's red/intermediate/green runs** (A's files, read by C; C did not repeat them in `store/`, which would be an in-place change):
  - `a-round-36/red-run.txt`: `Tests 9 failed | 57 passed (66)`. The 9 failures are exactly cases 1–9 (Volume, Pan, Master, video Volume, Zoom, unchanged, emptied, detail start, search); cases 10, 11 and 12 are not in the failure list.
  - `intermediate-run.txt`: `Tests 1 failed | 65 passed (66)`. The only failure is `review: during an active Pan drag a clip header pointerdown keeps the search focus`, at `fader-guards.test.tsx:1265:38`.
  - `green-run.txt`: `Tests 66 passed (66)`.
  - These match the task's expected counts. Mutation (a) is C's own equivalent of the red run: with the handler removed, cases 1–9 fail.
- **Mutation setup:** the scratch copy is `c-round-36/mut/` (store `app/` + a vitest config) with a `node_modules` junction. The config runs fader-guards + clip-gain, 94 tests.
  - Afterwards, `diff -rq` between the scratch and store `app/` reports no difference.
  - The junction was removed with `rmdir` (link only), and store `node_modules` is intact.

| Mutation | How | Failed | Expected | Killed |
|---|---|---|---|---|
| control | none | 0 / 94 | — | — |
| (a) | the root `onPointerDownCapture` line deleted | **10**: cases 1–9 plus the amended l.1258 test (the Pan press no longer releases the search) | 1–9 | ✓ (stronger) |
| (b) | l.918 gesture condition → `true` | **1**: case 10 | 10 | ✓ |
| (c) | root attribute deleted; the scroller's `onPointerDownCapture` → `(event) => { releaseTypingFocusBeforeRangePointerDown(event); releaseEditFocusOnTimelinePointerDown(event); }` | **5**: cases 3, 5, 7, 8, 9 | 3, 5, 7, 8, 9 | ✓ (exact) |
| (d) | l.917 `isRangeInputTarget(event.target) &&` → `true &&` | **4**: cases 10 and 11, plus round 34's gutter tests (`search focused → … gutter keeps the search focus` and `review: the gutter boundary…`) | 10/11 | ✓ |
| (e) | l.916 → `(isTypingTarget(focused) \|\| isRangeInputTarget(focused)) &&` | **4**: case 12, plus 3 round-32 focused-range tests | 12 | ✓ |
| (f) | DetailPanel l.504 `onBlur={() => undefined}` | **13**: cases 1–5 and 10, plus round-34 blur cases and 2 clip-gain blur tests | 1–5 | ✓ (stronger) |

## 9. R36-Doc

- The new section covers every §2.2 item:
  - the bug, its cause and the owner list including the lane-background marquee;
  - the 3 conditions and the capture order;
  - what stays unchanged;
  - decisions 1–5 with the 4b note;
  - the round-35 stop and the D-29z1 ruling with C's evidence;
  - the Pan centre note;
  - the l.360 supersession, stated without rewriting l.360;
  - the 12 tests and the red/intermediate/green numbers;
  - the C and Tech Lead IDs;
  - the Ableton note.
- It matches the code and C's measurements.
- **The l.355 correction** matches `c-round-34/runs/sb-geometry.txt`: `offW − clientW = 10`, `gutter: stable`, horizontal 0.
- **Follow-up for B (Low, doc):** the sentence on A-R36-REVIEW-1 ("ბრაუზერში არ შემოწმებულა") is now outdated. C reproduced it with a synthetic gesture 41 plus a real Master click (C-R36-01). Update it in the next doc touch.

## 10. Ableton: two verdicts (§4.6)

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| A typed, uncommitted value box value is committed when a fader is pressed | **PASS** (R36-CR, R36-CL) | **დაუდასტურებელი.** §18.1 (`b-round-29/ableton-mixing-20261012.txt`) does not cover it; C did not browse a new source. |
| A text field loses focus when a fader is pressed | **PASS** (R36-OT; native browser behaviour) | **დაუდასტურებელი** |
| A fader press jumps to the click point | Not this round (stage 4b); observed: Volume 1 → 0.5, Master 0 → −27 | **დაუდასტურებელი** |
| Pan/Volume reset by double-click | Not this round (stage 4b) | **დადასტურებული** in §18.1; not implemented yet |

C makes no "Ableton does it this way" claim for an unconfirmed row.

## 11. Not run in this round (none of these is a PASS)

- **`npm run test:e2e:smoke`:** its playwright `webServer` starts its own dev server on 5187, and C may not start servers. Root should run it.
- **Out of scope by §4.7**, so not run: the exports, WAV data checks, R31-PE/PV/PL, PUI geometry, R32-BC, video sync, the C-R27-01 table, and the full find sound → add → fit video → export flow with FB-01..FB-16. These stay for the stage regression.
- **Real two-pointer (CDP touch) input** for C-R36-01: C used a synthetic gesture plus a real mouse click instead.

## 12. Carried items (unchanged unless noted)

**Open C bugs:**
- C-R27-01, C-R6-02, C-R8-01 and C-R23-01 (all Tech Lead). C-R23-01 is still 2 NUL bytes at 28013/28014 in 63 520 bytes.
- C-R30-01 (polish).
- **New: C-R36-01** (Medium, predates this round; stage 4b candidate).

**Open low items:**
- R26-M1.
- Stage 4b: MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, and the stale refusal status (seen again, §5).
- R9-REVIEWER-M1-L8.
- A-R34-REVIEW-RESIDUALS.
- A's round-36 test nits:
  - case 8 does not pin `start.value`;
  - case 7 does not pin the status;
  - l.1272 is redundant.
- DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE, DOC035-NOTES.
- The new doc note for A-R36-REVIEW-1 (§9).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json` `followupReview`/`oct13Checkpoint`):
- **Rounds 31–34 plus round 36 (the same 9 status lines) are C-verified.** Round 36's 3 files are ready for root's checkpoint commit, after root's own gates and review.
- The purchased loader hardcodes middle-east (SRW-21).
- Lenis on `/studio/*`.
- Portable instruction-file paths.
- The export hard-clip at 0 dBFS.
- The CRLF Biome errors on the auth files.
- The `frontend-architect.md` Write/Bash grant.
- The `Modal.tsx` focus gap.
- GA `scroll` with consent denied.
- The fake Bearer gets 500.
- The CDP allowlist.
- `Content-Type` without a charset.
- The dev server's availability.
- Low reviewer suggestions in `checkpoint-oct13-review.md` still need B's triage.

**Tech Lead manual checks:**
- R35-T is now meaningful: a real mouse in real Chrome, Clip Gain `3`, then a click on Volume, Pan or Master.
- R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.
- Optionally, a real two-finger test of C-R36-01 on a touch device.
