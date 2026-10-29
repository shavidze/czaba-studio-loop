# Round 255: SABA-B-10b fix-up — the ruling on C-R254-01 and the re-verification of the round-254 diff

This round finishes SABA-B-10b. **No app code changes.**

- **The ruling.** C round 254 failed on one row only, C-SHEET-254: the `?` sheet scrolls 30 px more than at HEAD. B wrote that clause, and it was tighter than the sheet's own pattern. B accepts the measured growth and replaces the clause with a measured bound (§1.1, D-29z476).
- **A's work.** A edits one file: doc 192. Its status line must name the round that actually passes, and it gets one Problem → Solution bullet.
- **C's work.** C re-runs the amended sheet row in the browser, plus a short identity set. C also runs one neighbour row that round 254 did not probe: video z-order. Every other round-254 PASS row carries forward **by diff identity** (§3.3).

**Planned by:** B, at the round 254 → 255 planning, 2026-10-29. **Decisions:** D-29z475…D-29z480.

**Why this round (D-29z475):**
- **C round 254:** FAIL, with `browserVerified` and `realVerified` both true.
  - 18 rows PASS. Only C-SHEET-254 fails (C-R254-01, Low).
  - C states the cause is the spec, not A's code: the texts are byte-exact to the task's §1.2.
- **Gate 254 was `skipped`** ("C taskStatus FAIL"), so nothing was published. The baseline is still `c65e5e9`, plus the unpublished round-254 diff.
- **The policy:** "If C fails: a fix-up on the same grants" (`tasks/round-254.md` §7), and L10: rule on the finding before re-dispatch.
- **REGRESSION is not due.** `regression-last.json` = 2026-10-27, and today (2026-10-29) is 2 days later. It is due at the next planning on or after 2026-10-30.
  - It is **not merged** into this round. A regression round checks published HEAD, and the round-254 diff is not published yet.

**Read first:** `lessons.md` in full. These lessons apply directly:
- **L3:** its evidence now includes C-R254-01.
- **L10:** rule before re-dispatch.
- **L26/L28:** the doc's headings and status line.
- **L29:** every code claim cites a grep.

## 0. Baseline and scope

**Start state:**
- **HEAD** = `c65e5e9ab7d53d66d2225ed794bd0c7ef657151b` (`b-round-254/head-at-planning.txt`).
- **`git status --short --untracked-files=all` lists exactly 8 lines** (`b-round-254/git-status-at-planning.txt`):

  ```
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/insert-marker-ui.test.tsx
   M app/lib/arrangement/__tests__/render-budget.test.tsx
   M app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx
   M app/lib/arrangement/__tests__/shortcuts.test.ts
   M app/lib/arrangement/shortcuts.ts
   M app/styles/app.css
  ?? docs/implementation/2026/quarter-IV/192-saba-b-10b-visible-insert-marker.md
  ```

- **STOP (L11)** if HEAD differs, the status differs, or any hash check below fails. Exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Hash checks** (run from `store/`; each gave rc 0 at planning):
- **Carried round-254 diff, frozen.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-254-r255-carried-sha256.txt` covers the 7 `M` files.
  - `git diff HEAD -- $(cat ../tmp/studio-real-loop/b-round-254-r255-carried.txt) | sha256sum` = `a8492a4c8a23b7a1f1a12b7697d883518eb63e4a5b7ed53e1d6e833b099a46d5`. The copy is in `b-round-254/round254-carried.diff`, 531 lines.
  - All 7 files were last written between 20:26 and 20:48 UTC, before C round 254 began at about 20:59. So this diff is the one C verified.
- **Frozen tree.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-254-r255-tree-sha256.txt` covers **1,110** files: `git ls-files` minus the 4 root files. It includes the 7 carried files at their round-254 content.
- **Protected files.** Each of the 7 protected auth and purchase files gives `git diff --quiet HEAD` rc 0:
  - `app/routes/studio.$productId.tsx`
  - `app/routes/api.studio-token.ts`
  - `app/routes/account.downloads.tsx`
  - `app/lib/__tests__/download-routes.test.ts`
  - `app/lib/auth.ts`
  - `app/contexts/AuthContext.tsx`
  - `app/entry.server.tsx`
- **Root-owned files.** `b-round-254-r255-root-files-start-sha256.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`) must equal HEAD. No dependency is needed.
- **Grant start state.** `b-round-254-r255-grants-start-sha256.txt`, with a copy in `b-round-254/r255-granted-start/`.

### 0.1 Grants (`b-round-254-r255-grants.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `docs/implementation/2026/quarter-IV/192-saba-b-10b-visible-insert-marker.md` (untracked) | <ul><li>**l.4** becomes exactly `**სტატუსი:** Completed (C round 255 PASS)` (L28).</li><li>**One new bullet** at the end of `## პრობლემები და გადაწყვეტები`, in Problem → Solution form, in Georgian. It names C-R254-01, HEAD 1230 → 1260 px, and the ruling D-29z476 (the bound now is ≤ 1260 px, with no new or changed row above 2 lines).</li><li>Optionally, one bullet in `## TODO / შემდეგი ნაბიჯები` that names C-R254-OBS-01 (deferred with C-R253-01).</li><li>Nothing else. The 7 TEMPLATE headings stay in order.</li></ul> |

- **Every other file is frozen,** including the 7 carried files. A must not "improve" the sheet copy, the line or the tests. Any such change is out of scope and makes C-SCOPE-255 fail.
- **Read before editing:** `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.

### 0.2 B's pre-check (L23)
- **The carried diff is unchanged since C ran.** Frozen tree rc 0, protected rc 0, root rc 0, at planning time.
- **The +30 px.** B did not re-measure it. B relies on C's two-viewport measurement, which used a HEAD control server: `c-round-254/browser/sheet-diag.json`, `c254.json` rows `sheet@1440x900` and `sheet@1280x720`. Those numbers are the bound in §1.1.
- **Doc 192** cites round 254 only at l.4 and l.121. l.121 is the INFO id `INFO-B254-INK-ON-BRASS` and stays (grep `254\|255` on the doc).

## 1. Rulings

### 1.1 C-R254-01: accept the measured growth, and replace the clause (D-29z476)

**Facts (C round 254, both viewports):**

| | scrollHeight | clientHeight |
|---|---|---|
| HEAD `c65e5e9` | 1,230 | 808 / 646 |
| Round 254 | 1,260 | 808 / 646 |
| Both, with `white-space: nowrap` | 1,070 | – |

- **Where the +30 px comes from:** it is all wrapping.
  - **+10 px:** in the Transport/Edit grid row. The Transport list is now 232 px against Edit's 222 px.
  - **+20 px:** from the `marker` row wrapping in Time & clips.
  - The two new rows alone add no scroll.
- **The sheet already scrolled at HEAD,** by 422 px at 1440 and 584 px at 1280. It already had multi-line rows, for example `fit` 64 px, `waveform-zoom` 60 px and `edge-nav` 40 px (`a-round-254.md`).

**Ruling:**
- The round-254 clause, "a two-line action is allowed only if the dialog does not scroll more than at HEAD", was **tighter than the sheet's own existing pattern**. B wrote it without measuring the HEAD container. That is a B spec error, not a product regression.
- **Option (b), shortening the copy to one line, is rejected.** The point of 10a/10b is that Space and M say honestly where they act: the insert marker, the selection start, or the playhead while playing. A one-line version at the available width would drop one of those cases, and that reopens A-R250-REVIEW-SHEET-MARKER-COPY.
- **Option (c), a wider or reflowed sheet, is a layout change.** That needs Saba, and it is not proposed.
- **The sheet is on demand.** It is a modal opened with `?`, not persistent screen, so the screen-budget rule (L39) does not apply to it. C-BUDGET-254 already showed the persistent line count unchanged.

**The new bound for C-SHEET-255:**
- `scrollHeight` ≤ **1,260** at both viewports, with `clientHeight` unchanged (808 / 646).
- `scrollWidth` = `clientWidth`: no horizontal overflow.
- Each of the 5 rows **round 254** changed or added is at most 2 lines, measured as row height ≤ 40 px: `play-stop`, `continue-playback`, `insert-marker-to-playhead`, `back-to-start`, `marker`.
- Every other row's height equals HEAD's. This is compared per row id, on the HEAD control. `sheet-diag.json` has only section heights, so C measures the rows itself.

**Status of C-R254-01:** `ruled (D-29z476)`. It closes when C-SHEET-255 passes.

### 1.2 A-R254-WRONG-TIMEOUT-PREMISE (D-29z478)
- **What was wrong:** D-29z471's premise, "the test has no declared timeout", was false. At HEAD the test already ended with a positional `}, 15000);`, so A's 2,534 ms was 17 % of its timeout, not 50.7 %.
- **The ruling stays:** keep the `{ timeout: 15_000 }` form. It is the same value, and C confirmed with `git diff -w` that no assertion was removed. Reverting it would churn the frozen diff.
- The premise was a code claim made without a grep. It is now recorded as L29 evidence.

### 1.3 Why we missed it (C-R254-01)
- **Which phase should have caught it:** B's round-253 pre-check. It had a scratch dev server, but it did not measure the sheet container against HEAD before writing a no-growth clause. A estimated the growth (+132 px) instead of measuring it against a control.
- **The rule:** L3's evidence now includes C-R254-01: "when a task bounds a container's growth, B's pre-check measures that container at HEAD and on the sketch at both viewports and writes the measured bound". No new lesson line; `lessons.md` stays at 58 lines.

## 2. A: what to do (speed rule: no full suite, no `verify`)
1. **Start state.** Every §0 check gives rc 0, and the status equals the 8 lines in §0.
2. **Edit grant 1** as in §0.1.
3. **Static checks.**
   - Biome does not check `docs/` (L30), so it does not apply.
   - Run `sha256sum -c` on the carried and frozen lists again after the edit. Both must still give rc 0.
4. **Report.** Write `a-round-255.md`: the exact new l.4, the new bullet(s), the hash re-checks, and a STOP at the top if there is one.
   - **No code-reviewer is needed:** 1 file changed, and it is docs only.
   - **No tests are needed:** no code changed.
   - **No Playwright is needed:** the browser rows are C's.

## 3. C: acceptance
Run each browser row at **1440×900 and 1280×720**, in a fresh context.

**Setup:** open `/studio-lab` and wait for `Demo collection ready` (L48). Click `demo-stem-pulse`, then Add, and blur.

**HEAD control:** a `git archive HEAD` copy served on a scratch port, as in round 254. Stop it afterwards.

### 3.1 Rows run this round
| ID | Check | Pass |
|---|---|---|
| C-SCOPE-255 | HEAD, status, hashes | <ul><li>HEAD is `c65e5e9`.</li><li>The status shows the same 7 `M` files plus `??` doc 192.</li><li>The carried sha256 and the diff sha256 `a8492a4c…46d5` match.</li><li>The frozen (1,110), root and protected checks give rc 0.</li><li>Doc 192 against `b-round-254/r255-granted-start/`: only l.4 and the new bullet(s) of §0.1 differ.</li></ul> |
| C-UNIT-255 | Run alone: `shortcuts.test`, `shortcut-sheet-ui`, `insert-marker-ui`, `render-budget`, `bars-ruler-ui`, `store-theme-tokens`, `studio-theme-obsidian` | All green; the expectation is 131/131, as in round 254. |
| C-SHEET-255 | Open the sheet with `?`, on new and on the HEAD control | <ul><li>The §1.1 bound: `scrollHeight` ≤ 1,260, `clientHeight` 808 / 646, no horizontal overflow.</li><li>The 5 rows round 254 changed or added (`play-stop`, `continue-playback`, `insert-marker-to-playhead`, `back-to-start`, `marker`) are each ≤ 40 px.</li><li>Every other row's height equals HEAD's, compared per row id on the HEAD control. List each row id with both heights.</li><li>The transport group has its 6 rows in the round-254 §1.2 order, with the exact texts and keys.</li><li>The `marker` row text is exact.</li><li>Searching `insert marker` lists play-stop, insert-marker-to-playhead, back-to-start, split, marker and add-sound.</li><li>Esc closes the sheet, and focus returns to `Keyboard shortcuts (?)`.</li><li>The last row (`close`) can be scrolled into view and read at 1280×720.</li></ul> |
| C-VIDEO-ZORDER-255 | The neighbour row round 254 did not probe. Load a video: `tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm` through `[data-testid=arrangement-video-input]`, the recipe in `c-round-249/c249.cjs` l.373. Place the marker at 2 s and the playhead elsewhere. Check the dock monitor and, if it can be opened, the floating video. | <ul><li>Over the docked video and the floating video, the insert-marker line paints in the same order as the playhead: both above or both below, with the painted pixel checked at the line x.</li><li>The order is the same as on the HEAD control for the playhead.</li><li>The video's own controls stay the hit target at the line x (`elementFromPoint`).</li><li>Any difference from the playhead's order is a bug with a screenshot.</li></ul> |
| C-LESSON-255 | `lessons.md` | ≤ 60 lines; L3 cites C-R254-01; L44 and L45 are still present. |
| AN-REVIEW-255 | Doc 192 | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 255 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>The new bullet cites C-R254-01 and D-29z476.</li><li>Every cited id exists.</li></ul> |
| LAB-SMOKE-255 | `/studio-lab` loads, plays and exports a WAV | <ul><li>No page errors.</li><li>The export sha256 equals round 254's (`1fea093b…033f94`).</li></ul> |
| Auth | `/studio/<handle>` without a session | <ul><li>`Sign in required`, and no `audio[src]`.</li><li>`/api/studio-token` never returns 200.</li></ul> |
| Purchased origin | `/studio/$productId`, purchased copy | **BLOCKED:** backend unavailable in cloud. |
| gate | full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows; C does not claim them. |

### 3.2 `browserVerified` and `passed`
- **`passed` lists only the rows run in round 255.**
- **The 12 rows in §3.3 are carried.** They are valid round-254 evidence on the identical diff, and C-SCOPE-255 proves that identity. They are not a gap for the gate reviewer.

C-SHEET-255, C-VIDEO-ZORDER-255, LAB-SMOKE-255 and Auth are browser rows that can run here. `browserVerified` is true only if all of them ran.

### 3.3 Rows carried from round 254 by diff identity (D-29z477)
These rows passed in C round 254 on exactly the diff that C-SCOPE-255 re-hashes. They are **not re-run**, and they count as passed for SABA-B-10b only if C-SCOPE-255 passes. C lists them under a separate `"carried"` key in `c-round-255.json`, with their evidence path, and **not** under `"passed"`.

| Row | Round-254 evidence |
|---|---|
| C-MUT-254 | `c-round-254/mutants/summary.txt` |
| C-MARKER-VISIBLE-254 | `c-round-254/browser/c254.json`, `visible-*.png` |
| C-BLINK-254 | `c254.json` |
| C-CONTRAST-254 | `c254.json`, `visible-(un)selected-*.png` |
| C-TWO-LINES-254 | `two-lines-*.png` |
| C-MARKER-PLAYING-254 | `playing-click-*.png` |
| C-MARKER-RANGE-254 | `range-*.png`, `range-cleared-*.png` |
| C-HOME-254 | `home-oldvalue.json` |
| C-ZOOM-254 | `zoom-scroll-*.png` |
| C-TITLES-254 | `c254.json` |
| C-FOCUS-254 | `c254.json` (45-Tab sequence equal to HEAD) |
| C-BUDGET-254 | `budget-*.png` (85/101 and 69/85) |

**If C-SCOPE-255 fails,** none of these carry, and the round is FAIL.

**Ableton conformity:** unchanged from `c-round-254.md`. This round changes no behaviour.

## 4. Neighbouring behaviour that could break
- **Nothing in the app can change this round:** only one doc is granted. C-SCOPE-255 proves it.
- **The video z-order** is the one neighbour round 254 left unprobed (§3.1).
- **Past the end (observe only):** C-R254-OBS-01 is deferred. Report it only if it changes.

## 5. Findings routed at this planning (no action in this round)
| ID | Severity | Route |
|---|---|---|
| C-R254-01 | Low | Ruled, D-29z476. Closes on C-SHEET-255 PASS. |
| C-R254-OBS-01 | Low | `deferred_low_polish`, with C-R253-01 (same class; needs the exported resolver, ARCH-CHECKPOINT-TRANSPORT-POSITIONS). |
| A-R254-SHEET-SCROLL-DELTA | info | Closed by C's measurement: +30 px, not +132. |
| A-R254-WRONG-TIMEOUT-PREMISE | info | Recorded in §1.2. |
| A-R254-REVIEW-FRAMES-ROW (reviewer #4) | Low | `deferred_low_polish`: the line is not in render-budget's per-frame zero-render list. |
| A-R254-REVIEW-BLINK-WCAG222 (reviewer #5) | Low | `deferred_low_polish`, and appended to SABA-Q-10B-MARKER-LOOK as (e): the blink stops only with OS reduced motion. |
| A-R254-REVIEW-SC5-BLANK (reviewer #9) | Low | `deferred_low_polish`: a pre-existing missing blank line. |
| A-R254-ARCH-POSITION-WRITER | signal | `architecture_signals`: one shared layout-effect position writer for the playhead, this line and the library caption. Input for ARCH-CHECKPOINT-TRANSPORT-POSITIONS. |

## 6. Next (D-29z480)
**If C passes and the gate publishes:**
- **SABA-B-10b is done.** The exception is double-click Stop, which is SABA-B-9 scope by design.
- **These close:** GATE249-S4, GATE249-S7, A-R250-REVIEW-SHEET-MARKER-COPY, INFO-B249-STALE-MARKER-STATUS and C-R254-01.
- GATE249-S5 is answered by C-HOME-254 (1 record stopped, 2 while playing, no foreign value).

**If C fails:** a fix-up on the same grant, or a ruling on what C found.

**Then:**
1. **REGRESSION-ROUND-2026-10-30.** It is due at the round 255 → 256 planning if that is on or after 2026-10-30, and goes before any new scope.
   - It carries every `scope_additions` entry.
   - It adds C-SHEET-255 (the measured bound) and the round-254 rows.
2. **SABA-B-9:** the centre transport, the Stop button with double-click and its label (closes B-R249-PAUSE-LABEL), and master volume at the bottom right.
3. **SABA-B-11c.** It needs the expert consult on the off-grid offset first.
4. **SABA-B-7** when Saba answers.
