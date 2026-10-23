# C — Round 104 verification: GATE96-S2 (a repeated status sentence is announced again) + GATE103-S5

Verifier: C · 2026-10-23 · Task: current-task.md (round 104, D-29z69) · A report: a-round-104.md
I used real Playwright Chromium (headless, installed). Each session was a fresh incognito context with no credentials on `http://127.0.0.1:5173/studio-lab`, and consent was declined in every session. Evidence is in `c-round-104/` (tools/, out/, shots/), and the checkpoint is in `c-round-104/checkpoint.md`.

## Verdict: **PASS**, with one Medium follow-up bug and one acceptance row that B wrote wrongly
- **browserVerified = realVerified = true.** Every browser row that can run in the cloud was run at the stated viewport.
- **Blocked:** only G104-3's fake-Bearer sub-check (backend unavailable in cloud).
- **`passed` holds 11 of the 12 acceptance IDs.** SR-REPEAT-SPACE counts once per viewport. SR-REGION-STABLE is the twelfth and is left out on purpose.
- **SR-REGION-STABLE is not in `passed`.** Its "three distinct status texts" condition cannot be met as written: play and pause set no status, and they did not at `3b6178b` either. It is a spec mismatch, not a regression. Every other condition of the row passed, and SR-TEXT-REG covers its intent.
- **Bug A-R104-REPEAT-DRAG (Medium) is confirmed in the browser.** It is new behaviour since `3b6178b`, but it stays inside B's SR-DRAG-STREAM bound, so it fails no acceptance row. B should plan the `setStatus(() => message)` fix in `ArrangementClip.tsx`.

## Requirement result per row

| ID | Result | Evidence |
|---|---|---|
| SOURCE-UNCHANGED | PASS | <ul><li>Checked at the start and at the end. HEAD is `3b6178b`; `git status` shows 3 M + 4 ??.</li><li>The frozen list checks 535/535.</li><li>A's end hashes match 7/7.</li><li>`git diff -U0` touches only these hunks: the `useReducer` import, the new import block, `statusSequence: number;` after `status: string;`, the replaced l.535, and `statusSequence,` at the 2 value sites.</li><li>No hunk touches l.536–541, l.1484 or any `setStatus(` line.</li><li>In StudioWorkspace, only the destructure line and the `<output>` content line change.</li><li>Doc 091 changes only at l.4.</li></ul> |
| SR-REPEAT-SPACE @1280x720 | PASS | `out/space-1280x720.json`, `shots/sr-repeat-space-1280x720.png`. Details are below the table. |
| SR-REPEAT-SPACE @1440x900 | PASS | `out/space-1440x900.json`, `shots/sr-repeat-space-1440x900.png`. The same 8/8 checks passed, and the AX count is 2/2. |
| SR-REPEAT-FAILED-ROW @1280 | PASS | `out/failed-1280x720.json`, `shots/sr-repeat-failed-row-1280x720.png`. Details are below the table. |
| SR-REGION-STABLE @1280 | **criterion not met as written** | `out/stable-1280x720.json`. Details are below the table. |
| SR-DRAG-STREAM @1280 | PASS (3/3 drags) | `out/drag-1280x720.json`, `shots/sr-drag-1280x720.png`. Details are below the table. |
| SR-TEXT-REG @1280 | PASS | `out/textreg-1280x720.json`, `shots/sr-text-reg-1280x720.png`. Details are below the table. |
| PX-NET | PASS | In all 9 sessions: 0 page-originated requests to studio-token, recording-, /api/download or R2, and 0 Authorization headers. The only anonymous `/api/studio-token` call was C's own `ctx.request` in G104-3, which returned 401. |
| REG-HYD | PASS | <ul><li>All sessions had 0 hydration messages (the regex is checked before the noise filter), 0 pageerror and 0 non-noise console errors.</li><li>The noise was the expected cart `ERR_CONNECTION_REFUSED` and `Failed to load cart`.</li><li>The aborted request in SR-REPEAT-FAILED-ROW logged, verbatim: `Failed to load resource: net::ERR_FAILED`. Its requestfailed entry is `/videos/hero/hero-music.mp3 net::ERR_FAILED`.</li></ul> |
| G104-3 | PASS (1280 and 1440, run alone); fake-Bearer BLOCKED | `out/g1043-*.json`, `shots/g1043-*.png`. Details are below the table. |
| AN-REVIEW | PASS | Details are below the table. |
| T104-TARGETED | PASS | <ul><li>My re-grep gives 69 files, identical to A's list.</li><li>`npx vitest run` → **69/69 files, 1122/1122 tests** (`out/targeted.log`).</li></ul> |
| Gate rows | `gate` | full vitest, typecheck, build, Biome, verify, e2e smoke and PROD-MP3-UNVERIFIED were not run by C. |

### Row details

**SR-REPEAT-SPACE @1280x720**
- The project had 0 clips. After the blur, `activeElement` was BODY.
- After both presses the text was exactly `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.`
- Press 2 produced 2 childList records: the old span was removed, and a SPAN with the exact text was added.
- The inner span is a new node. The `<output>` (tag OUTPUT, `aria-live=polite`) is the same node, and the body-level observer saw no replacement.
- The position stayed `00:00.000` before, between and after the presses (+1 s).
- The CDP AX count was 2 after press 1 and 2 after press 2.

**SR-REPEAT-FAILED-ROW @1280**
- `context.route` aborted `**/videos/hero/hero-music.mp3`. The row showed `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`.
- Keyboard path: focus the roving `tabindex=0` option (Middle East), then ArrowDown to `demo-hero-music`.
- The row title is `CZABA hero — საჯარო preview`. After Enter, 500 ms, Enter, both texts were exactly `„CZABA hero — საჯარო preview“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`
- The second Enter produced a childList record that adds that text. The span was replaced and the `<output>` stayed the same node.
- 0 clips were added. The AX count was 2/2.

**SR-REGION-STABLE @1280 (criterion not met as written)**
- The `<output>` was the same node with exactly 1 element child at all 6 samples, and replaced = 0.
- Real playback ran: the position went `00:00.362` → `00:01.062` while playing and stayed at `00:01.070` after pause.
- **Only 2 distinct texts appeared:** ready, then `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`
- Space (play) and Space (pause) do not set a status. At `3b6178b`, `togglePlayback` sets status only for an empty project or for play past the end. So "three distinct texts" is impossible with these steps, and the spec is wrong rather than the code.
- The intent is covered by SR-TEXT-REG.

**SR-DRAG-STREAM @1280 (3/3 drags)**
- Setup: Middle East via Enter, then Fit, so the clip is 754 px wide. Each drag was a real mouse drag of `arrangement-clip-fade-in-handle` to 200 px past the clip's right edge, with 81 pointermoves each.
- **Added element nodes: 81, 81, 81**, which is ≤ pointermoves + 2. There were 162 childList records and 0 characterData records.
- The fade clamps at `data-fade-in=101.352`, the full clip length (project 01:41.352). The readout ended at `Fade In: 101.352 წმ.`
- **History:** the Undo title went from `Undo: დამატება — Middle East — საჯარო preview` to `Undo: Fade In`, so there is exactly one new entry. Ctrl+Z gives `data-fade-in=0.000` and the Undo title returns to the add entry.
- No longtask in any of the 3 drags (max 0). No pageerror.

**SR-TEXT-REG @1280**
Fit was triggered by **clicking the button** (`data-testid=arrangement-fit`); there is no Fit keyboard shortcut in source. Each text matches the `3b6178b` template:
- Enter → `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` (l.1351);
- Fit → `Fit: მთლიანი პროექტი ჩანს (01:41.352). X აბრუნებს.` (StudioWorkspace fitTimeline);
- Delete → `კლიპი წაიშალა; სიცარიელე დარჩა.` (l.1793), with 0 clips left;
- Ctrl+Z → `Undo: კლიპის წაშლა` (l.2012), with 1 clip back.

For every text the region rect is y 658, h 16, w 1256 and the line-height is 16px, so it is one line. It was the same node with 1 child each time.

**G104-3 (1280 and 1440, run alone)**
- The header link (`Studio LabDemo`) opens `/studio-lab` with 1 workspace and the demo badge.
- `/studio/middle-east` shows sign-in, with 0 workspaces and 0 audio.
- An anonymous `/api/studio-token` request returns **401** `Please sign in to access Studio.`
- localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id`.

**AN-REVIEW**
- I read the fail-before log myself (`a-round-104/fail-before.log`), and it matches §1: SA fails with `Failed to resolve import "../status-announcement"`, SU1 and SU2 fail with `expected null not to be null`, SU3 fails with `expected +0 to be 1`, and SU4 is green.
- **My own mutations** (`tools/mut104.py`, scratch `c-round-104/mut`, `out/mut104.json`, logs `out/mut-*.log`):

  | Mutation | What I changed | Red tests |
  |---|---|---|
  | control | nothing | none, 9/9 green |
  | m1 | identical string → `previous` | SA3, SU1, SU2 |
  | m2 | key replaced by `data-seq` | SU1, SU2 |
  | m3 | `key` moved onto `<output>`, bare text | SU1, SU2, SU3 at the `toBe(region)` identity assertion, plus SU4 (stale region text) |
  | m4 | updater guard removed | SA4, SU4 |

  All four match A's results.
- The module and both test files contain no `as`, `@ts-` or `any`. The added lines of the two app files contain none either.
- The assertions are exact (`toBe`, `toEqual`, `toContain`). There is no `toBeTruthy`, `toBeDefined` or `toBeGreaterThan`.

## Bug for B: A-R104-REPEAT-DRAG (Medium, a11y and render cost)
- **Steps:**
  1. Fresh `/studio-lab` at 1280x720.
  2. Middle East → Enter twice (two back-to-back clips on the music lane), then Fit.
  3. Real mouse: press on the second clip's title strip, drag left onto the first clip (60 moves), then hold at the blocked spot with 20 small moves, and release.
- **Actual:** 81 pointermoves gave **81 added `<span>` nodes**:
  - 80 × `გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.`
  - 1 × `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`

  Each inserted span is a fresh polite announcement of the same sentence. The fade clamp shows the same pattern: 21 identical `Fade In: 101.352 წმ` spans while it was held at the limit.
- **Expected:** the identical sentence should not be re-announced and re-rendered on every move.
- **Why it is new:** at `3b6178b`, an identical `useState` value bails out, so there is no DOM change. That is an inference from A's unit fail-before and React semantics; I did not run a baseline server.
- **Fix direction (A's proposal, which I agree with):**
  - change the per-move call sites in `ArrangementClip.tsx` (l.495, 513, 563, 579–581) to `setStatus(() => message)`, which reuses the reducer's silent branch;
  - treat the fade/trim readout at the clamp the same way.
- **Why it does not fail this round:** B's SR-DRAG-STREAM bound (≤ pointermoves + 2) holds. Doc 092 l.60 records the gap honestly.
- **Severity:** Medium. A screen-reader user dragging against a neighbour now hears the same sentence repeated, possibly on every move. It is not data loss and not security.

## For B
1. **Rewrite SR-REGION-STABLE.** Use action steps that each set a distinct status, for example Enter → Fit → Delete. Play and pause set no status. `pausePlaybackWithStatus(message)` exists, but only other features call it, each with its own message; Space does not.
2. **Plan A-R104-REPEAT-DRAG** (`ArrangementClip.tsx` call sites) as a bounded follow-up. Include a browser criterion: a blocked move held for ≥ 40 moves adds ≤ 2 spans.
3. **Housekeeping:** doc 092 l.4 still says the round is waiting for C. Update it at publication, as with doc 091.
4. **Tech Lead manual check R104-T** (a real NVDA or VoiceOver announcement) was not run: there is no screen reader in the cloud.
5. **Regression round:** it is due on or after 2026-10-24 (`regression-last.json` is dated 2026-10-21).

## Ableton correspondence
**არ ეხება.** This is CZABA's own accessibility rule for the status line. No Ableton source applies, and none was claimed.

## Commands run (C)
- `git rev-parse HEAD`, `git status --short`, `sha256sum -c` (frozen list and A's end hashes), at the start and at the end; `git diff -U0` on the owned files.
- `node c-round-104/tools/sr104.cjs {space 1280x720|space 1440x900|stable|textreg|failed|drag 1280x720 3|blocked}`;
- `node c-round-104/tools/run-g1043.cjs {1280x720|1440x900}`;
- `npx vitest run $(cat c-round-104/out/targeted-list.txt)`;
- `python3 -I c-round-104/tools/mut104.py`.

No app source was edited and nothing was committed. The scratch copy was used only for the mutations, and its originals were restored.
