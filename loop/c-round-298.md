# C — round 298 (STUDIO-LINK-a3, test-only): **PASS**, with a Medium kept open

**Verdict:** every acceptance row except CLAIMS meets its pass text. **CLAIMS is not passed**: K11 differs because B's `sketch.patch` is missing (planning/environment, origin B, not A).

**GATE297-F1 is only partly closed. Do not mark it closed.** C confirmed A-R298-REVIEW-1 with its own mutant. LH3 now catches prop-value mismatches and structural (extra-node) mismatches that hydrate before the video dock. A server-only **extra attribute** still passes LH3 green. The new finding is C-R298-01 (Medium).

Browser checks were real: Playwright Chromium 143.0.7499.4, fresh contexts, untimed warm-up first. `browserVerified` and `realVerified` are true. State file: `c-browse.json`. Evidence is under `c-round-298/`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **not passed: equal except K11** | `c-round-298/claims-after.txt`. Against `claims-298-after-sketch.txt` it differs only in K1 (the real HEAD line `77d5341`, allowed), K2 (3 lines, allowed) and **K11 `MISSING:b-round-297/sketch.patch`**. K3–K10 are identical to the after-sketch; K4, K7 and K9 are unchanged. Cause re-proved: `git check-ignore -v` gives `.gitignore:14:loop/**/*.patch`. The three full sketch files exist, and the `cmp` row below is the stronger check. |
| SOURCE-SCOPE | PASS | `git status`: exactly the 3 §4 paths. `sha256sum -c` (1,167 entries) fails only on hydrate-ui and doc 220. All 3 files are `cmp`-equal to B's sketches. The protected files, `studio-lab.tsx`, `ArrangementLibrary.tsx` and `ArrangementVideoDock.tsx` hash OK. Re-run after all mutant and browser work gave the same output, so there was no drift during C's phase. |
| TYPECHECK | PASS | `npm run typecheck` rc 0 (`tsc.log`) |
| UNIT | PASS | `covering.log`: 7 files, 58 tests. LH3 ran from the new file (840 ms; describe timeout 15 s, 5.6 %). LH1 686 ms, LH2 415 ms and LH4 497 ms ran from the old file. Slowest was NG5 at 2,042 ms of 15 s. Nothing is above 50 %. LH3 stderr holds only the server `useLayoutEffect` warnings and one ``Prop `muted` did not match`` (GATE297-S5). |
| UNIT-MUTANTS | PASS | Run on C's own scratch `/tmp/c298-scratch` (`git archive HEAD` + A's 2 test files, `cacheDir /tmp/c298-vite-cache`). baseline 4/4 green. (h): LH3 red, warning names `data-probe`. (e): LH1 + LH3 red. (g): LH4 red. (i): green (informational, as expected). **Control:** (h) with HEAD's hydrate-ui file and the new file absent gives 4/4 green, which reproduces F1. Every restore was `cmp`-equal. Logs: `mutant-*.log`. |
| UNIT-VACUITY | PASS | `.reverse()` dropped: LH3 red at ssr-ui l.176 `expect(firstOptionSourceId()).not.toBe(PREVIEW_SOURCE_ID)` (`mutant-vacuity.log`) |
| UNIT-CLEANUP | PASS | **Code reading:** in both files `afterEach` splices and calls every tracked unmount before `document.body.innerHTML = ''`. The unmount nulls `root` before it calls `unmount`. **Run:** LH3 calls `unmount()` itself, and `afterEach` calls it again with rc 0, so the second call is a no-op. Caveat (A-R298-REVIEW-4, Low): `push` happens after `await act(...)`, so a throw inside hydration leaves the root untracked. |
| B-COLD-DEEPLINK | PASS | `browser.json`, `shots/{cold,plain}-{1440x900,1280x720}.png`. **Cold `?preview=middle-east`, both viewports:** active element is BUTTON `role=option` `demo-middle-east` with `aria-selected="true"`; 0 page errors; 0 hydration warnings (the probe regex includes `Extra attributes` / `Did not expect server HTML`); non-environment console errors 0. **Plain `/studio-lab`:** focus BODY, `demo-middle-east` selected. Attempt 1 of the script was environment-invalid: a 60 s cold compile of `/studio/middle-east` timed out (`browser-attempt1-env-invalid.log`). It was replaced after an untimed warm-up of that route (L38). |
| G298-AUTH | PASS | Fresh context: 0 cookies, empty storage. `/studio-lab` at 1440×900 shows the workspace and "Demo collection — no sign-in required"; `auth_user` is null; the only localStorage key is `czaba_session_id`. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `GET /api/studio-token` returns **401** `{"error":"Please sign in to access Studio."}` with no token. Shots: `shots/auth-*.png`. |
| DOC-220 | PASS (with info) | l.4 is exactly the §3.3 text. The 7 TEMPLATE `## ` headings are in order. Both test files are listed (l.48–49). "hydration warning-ის გარეშე" occurs 0 times; "STUDIO-LINK-b (რაუნდი 299)" is present. Every cited id is in `backlog.json` (D-29z749, D-29z750, GATE296-ARCH-ROUTE-DOM-FOCUS, GATE297-S5-VIDEO-MUTED-SSR, STUDIO-LINK-a/b). See INFO-C298-02 and C-R298-01 for wording limits. |
| gate | gate | Full suite, build, Biome, verify and e2e smoke: root gate. C did not run them (speed rules). |

L29 task grep: no untagged fact about a store file. The frozen-file names at l.108 are covered by K3.

## Findings for B
- **C-R298-01 (Medium; origin: A's reviewer A-R298-REVIEW-1, confirmed by C; the regex was specified in B's sketch per S2). GATE297-F1 is only partly closed.**
  - **Steps:**
    1. Make a scratch copy of HEAD plus the round-298 test files.
    2. In `ArrangementLibrary.tsx` after `data-source-id={source.id}`, add `data-probe={document.body.childElementCount > 0 ? undefined : 'detached'}`. The attribute is now server-only.
    3. Run the two LH files.
  - **Expected:** LH3 turns red, because the server HTML does not match the client.
  - **Actual:** 4/4 green. stderr prints "Extra attributes from the server: data-probe" twice. React sets `didWarnInvalidHydration` before that message, and `/did not match|Expected server HTML|Hydration failed/i` does not match it. By source reading, "Did not expect server HTML to contain…" is missed the same way.
  - **Evidence:** `c-round-298/mutant-x-extra-attr.log`.
  - **Contrast:** an extra server-only child node (mutant y) **does** turn LH3 red, through "Hydration failed…" and ``Prop `className` did not match`` (`mutant-y-extra-node.log`). So the follow-up is a regex widening plus an add-attribute mutant. `onRecoverableError` is not required for this case. That also settles A-R298-REVIEW-2 for structural mismatches: they are caught.
  - **Doc 220:** l.73's limit sentence implies LH3 catches every mismatch that hydrates before the dock. That overstates it.
- **C-R298-02 (Low/info; origin B, planning/environment).** K11 `b-round-297/sketch.patch` is missing because the loop `.gitignore` drops `loop/**/*.patch` at job hand-over. This is the 3rd occurrence of the L56 class (C-R289-INFO-01). Fix: name such artifacts `*.patch.txt` (A's retro candidate). manifestPaths: 14; missing: 1.
- **INFO-C298-01 (pre-existing).** `/middle-east.mp3 net::ERR_ABORTED` shows on cold and plain loads at both viewports. The server returns 200 (4,054,080 bytes). This looks like a client-side media preload abort. C round 297 did not log `requestfailed`, so this is new visibility, not new behaviour. No app source changed this round.
- **INFO-C298-02 (origin B sketch; A-R298-REVIEW-7).** Doc 220 l.68 still says "Covering set: 9 ფაილი, 89 ტესტი" (the round-296 set); this round's set is 7/58. The "row-ის ჩავარდნის შემთხვევაშიც" sentence slightly overstates cleanup (A-R298-REVIEW-4).
- The real-browser deep link still lands on a source that is first in the real library, so the browser does not exercise the reorder. That is INFO-C297-02, unchanged; the jsdom LH rows cover the reorder.
- Other reviewer items (A-R298-REVIEW-3, -5, -6 and the Architecture note) were not re-verified by C. They stay open for B's ruling.

**Ableton conformity:** not applicable (test-only).
