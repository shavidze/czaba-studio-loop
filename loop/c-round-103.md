# C — Round 103 report (independent verification)

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`. 0 bugs. Every browser row ran in real Chromium (Playwright with the installed Chromium), each in a fresh incognito context with no credentials, against `http://127.0.0.1:5173/studio-lab`.
- **Blocked (environment):** only the G103-3 fake-Bearer sub-check, because the backend is unavailable in the cloud. It does not change `browserVerified`.
- **Gate rows (not claimed here):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke` and PROD-MP3-UNVERIFIED.

Evidence is in `c-round-103/`:
- `out/run103-*.json` (one per scenario), `out/g1033-*.json`, `out/mut103.json`, `out/pu-*.log`, `out/targeted.log`;
- screenshots in `shots/`;
- tools in `tools/` (`run103.cjs`, `lib103.cjs`, `mut103.cjs`, `run-g1033.cjs`, `setup-scratch.sh`).

**Fault injection, stated plainly.** An init script subclasses `window.Worker`. Only when the URL contains `export-wav.worker`, and only in the stall/error rows, it constructs a module worker from a Blob stub instead:
- **stall:** `self.onmessage = () => {}`;
- **error:** posts `{type:'error', message:'C-stub boom'}`.

Only the worker's answer is simulated. The app's stall timer, `terminate`, reject, state and UI paths all ran for real.

The wrapper records:
- construction time, `postMessage` time and every message time (`performance.now()`);
- the `terminate()` count.

A MutationObserver stamps the first moment a `[role=alert]` appears, so the delays below are not smeared by polling. Playwright's `worker` close event is a second, independent terminate witness.

Setup for every browser row:
1. Decline consent.
2. Focus the Middle East row and press Enter. Every run shows 0 clips before and 1 after.
3. Open Export with a real click.
4. Click the export button with the real mouse.

## Source state (start and end)
- HEAD is `b6c97166…`, and `git status --short` is **5 M + 1 ??**, as expected (CU10 kept).
- The frozen list is **532/532 OK**, and A's `end-hashes.txt` is 6/6 OK. I checked both at the start and again at the end of my phase.
- The protected hashes are unchanged: `fa2cf0bc 13914809 caa388e7 0995ae78 741c2341 ddb70919 56f5b76f bf9ee257 23468664 280fe7f2`.
- **Diff structure (`git diff -U0`):**
  - `export-wav.test.ts` has one hunk, `@@ -456,0 +457,139 @@`, a pure append.
  - `export-cancel-ui.test.tsx` has one hunk, `@@ -658,0 +659,40 @@`, a pure append.
  - Every hunk in `export-progress-ui.test.tsx` is inside baseline l.243–321.
  - Doc 090 has one hunk, `@@ -4 +4 @@`.
  - `export-wav.client.ts` keeps its signature, the pre-abort check, the no-Worker fallback and the constructor-catch message.
- The added app lines contain no `as` casts and no `@ts-`.
- I edited no app source. Mutations ran only in `c-round-103/mut/`, with `cacheDir` in scratch.

## Browser rows
| ID | Result | Measured evidence |
|---|---|---|
| **WD-STALL 1280** | PASS | <ul><li>The alert reads exactly `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა შეჩერდა — worker 30 წამი არ პასუხობს.`</li><li>It appeared **30 008.7 ms** after construction (30 008.6 ms after `postMessage`).</li><li>At +25.15 s: label `რენდერი · 100%`, status `რენდერი და 24-bit WAV-ის შექმნა…`, Cancel present, Close disabled, terminate 0.</li><li>Final: no bar and no label, Cancel gone, Close enabled and focused.</li><li>terminate 1, still 1 six seconds later. The worker-close event fired at +30.0 s.</li><li>0 downloads. `shots/r103-stall1280-{at25s,final}.png`</li></ul> |
| **WD-STALL 1440** | PASS | <ul><li>The same exact text, at **30 009.4 ms**.</li><li>Before the timeout, the label was `რენდერი · 100%`.</li><li>terminate 1 (still 1 at +6 s), 0 downloads, Close enabled, no Cancel and no bar.</li></ul> |
| **WD-CANCEL 1280** | PASS | <ul><li>Cancel was a real mouse click at **5 054 ms** after construction, with the label at `რენდერი · 100%` (trusted pointerdown).</li><li>**terminate is 1** right after Cancel and **still 1 at +35 s** after Cancel (+40 s after construction).</li><li>No alert at any time (MutationObserver plus 35 one-second samples).</li><li>The status stayed `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.` throughout.</li><li>Close was focused and enabled, with 0 downloads.</li></ul> |
| **WD-ERRTEXT 1280** | PASS | <ul><li>The alert reads exactly `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker). C-stub boom`, 34 ms after construction.</li><li>terminate 1, 0 downloads, Close enabled and focused.</li></ul> |
| **WD-MP3 1280** | PASS | <ul><li>The export button was `MP3-ის ექსპორტი`.</li><li>The exact stall alert (MP3 render-error path) appeared at **30 009.9 ms**.</li><li>**0 unpkg requests** in the whole session, and the load label was never seen.</li><li>terminate 1, 0 downloads.</li></ul> |
| **WD-SLOW 1280** | PASS (one note) | <ul><li>CDP `Emulation.setCPUThrottlingRate {rate:6}`, with the wrapper only recording.</li><li>Exactly one WAV: RIFF/WAVE, PCM tag 1, 2 ch, 48 000 Hz, 24-bit, 4 864 896 frames = 101.352 s, NaN 0. The done message was shown.</li><li>102 worker messages (progress, then complete).</li><li>**Largest gap 145 ms**, and it is the construction-to-first-progress interval (the reviewer's #3). The wav phase took 767 ms. 145 ms is about 0.5 % of the 30 000 ms limit.</li><li>**Note:** the throttle took effect (the wav phase took 767 ms, against 262–314 ms unthrottled, 2.4–2.9× longer). I did not confirm that the dedicated worker thread itself was throttled, because the CDP session is on the page.</li></ul> |
| **EXPORT-REG** | PASS | <ul><li>**WAV 1280 and 1440:** one `czaba-studio-lab.wav` each, 29 189 420 bytes, identical to round 102. RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit, 101.352 s, NaN 0.</li><li>**WAV done text:** `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.` This is identical to round 102, including the pre-existing clip warning alert.</li><li>**WAV phases:** render, then wav (`რენდერი · 4%` … `WAV-ის ჩაწერა · 100%`).</li><li>**MP3 1280:** 3 291 117 bytes, identical to round 102. It decodes in Web Audio: 48 kHz, 2 ch, 101.352 s.</li><li>**MP3 phases:** render, wav, load, mp3. The done text `MP3 შეიქმნა: 01:41.352, 48 kHz · stereo.` is identical to round 102.</li></ul> |
| **CANCEL-REG 1280** | PASS | <ul><li>**WAV:** a valid cancel at `რენდერი · 9%` gives `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`</li><li>**MP3:** a valid cancel at `MP3-ის შექმნა · 0%` gives `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.`</li><li>Both had 0 downloads in the following 15 s, and Close was focused and enabled.</li></ul> |
| **PX-NET** | PASS | All 12 sessions: 0 requests to studio-token, R2, recording-* or `/api/download`, and 0 `Authorization` headers. The only third-party requests were fonts, images and `localhost:5199/api/cart` (expected noise). |
| **REG-HYD** | PASS | All 12 sessions: 0 pageerrors, 0 hydration warnings, 0 non-noise console errors or warnings (2 expected cart/connection noise lines each). The injected stall/error rows logged **no** rejection at all. |
| **G103-3** (run alone, last, at both viewports) | PASS | <ul><li>The visible header link `Studio LabDemo` opens `/studio-lab` with the workspace and the `დემო კოლექცია` badge.</li><li>`/studio/middle-east` shows "Sign in required", with 0 workspace and 0 `audio[src]`.</li><li>Anonymous `/api/studio-token` returns **401**.</li><li>The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud).</li></ul> |

## Offline rows (C's own scratch)
- **AN-REVIEW: PASS.** I wrote my own mutation strings in `tools/mut103.cjs`, independently of A's script.

  | Run | Result |
  |---|---|
  | control | 18/18 |
  | fail-before (snapshot `b56ca58e`) | **EW8a, EW8b, EW8c, EW8e, EW8f red**; EW1–EW7 and EW8d green |
  | m1, no timer | EW8a, EW8b red |
  | m3, complete does not clear the timer | EW8c red (`expected 1 to be +0`) |
  | m5, error text dropped | EW8e red |
  | cancel-ui unmutated | 12/12 ×3, **CU10 green 3/3** |
  | m6, delete `ArrangementContext.tsx` l.2915–2917 in scratch (the lines checked first) | **CU10 red 3/3** (`expected ['czaba-studio-lab.wav', …] to deeply equal []`); CU1–CU9 green |

  - The fail-before differs from B's prediction in two places: EW8d is green on the baseline and EW8c is red. I reproduced both independently, and A's explanation is correct.
  - Assertions are exact (`toBe`, `toEqual`, `toThrow(new Error(exact))`).
- **PU-ALONE: PASS.**
  - With A's file, `-t PU1`, `-t PU2` and `-t PU3` each pass alone (tests 261–394 ms, wall clock about 2.6 s).
  - With baseline `4c47dfd4`, `-t PU2` **fails** (2 failed). It fails by assertion (`loadEncoderMock` called 0 times), not by the 15 s timeout. PU1 and PU3 are green on the baseline.
  - The whole file passes, 8/8.
  - **Body diff (my script):** all 8 `it` blocks are byte-identical to the baseline and in the same order, with the same titles.
- **T103-TARGETED: PASS.** I re-ran the grep, and it gives the same 9 files as A's list. Result: 9 files, **100/100** (`out/targeted.log`).

## Ableton correspondence
Both behaviours (the stall watchdog and the worker error text) are CZABA's own robustness rules. Their status is **არ ეხება** (not applicable), and no Ableton claim is made.

## Return to B (non-bugs and open items)
1. **WD-SLOW coverage limit.** Page-level CPU throttling was confirmed in effect; throttling of the worker thread was not.
   - Even so, the largest gap is 145 ms against 30 s.
   - If B wants a stronger guard, a later task could throttle the worker target directly (CDP auto-attach), or test a much longer project.
2. **The task text had the T3 failure mode wrong.** On the baseline, PU2 fails by assertion, not by timeout, and "same for PU1" does not hold. This is not a defect in A's work.
3. **Unreviewed delta.** The code-reviewer saw only the version before `detachWorker` and before the CU10 witness. The root gate review should cover that delta. Reviewer nits #5 and #7 (English engine text in a Georgian alert; EW5's title) stay with B.
4. **Regression round due.** The next B planning on or after 2026-10-24 is the regression round (per `current-task.md`).
