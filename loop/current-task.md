# CURRENT TASK — Round 144: V-0.4e close-out — written ruling on the video placeholder delta (C-R143-01) + two leftover Lows + minimal C re-check

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 143 = skipped)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-143.md`, an exact copy of the round-143 `current-task.md` (sha256 `0af0ea05…`). Rationale: `b-round-143.md`. Decision record: **D-29z109** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline:** HEAD is still **`6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`**. Gates 142 and 143 were **skipped** (C FAIL). The round-142 + round-143 work is uncommitted in the tree: the same 22 paths (20 ` M` + 2 `??`). Round 144 builds on that tree. Nothing is reverted, stashed or re-done. Rounds 142 + 143 + 144 publish together after C PASS.
- **Frozen list:** `tmp/studio-real-loop/b-round-143-r144-tree-sha256.txt`, **961 entries**. That is `git ls-files -co --exclude-standard` (963) minus the 2 grants, hashed from the tree as it is now (round-143 end state). `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Grants:** `b-round-143-r144-grants.txt` lists 2 existing files and no new file. **Start hashes:** `b-round-143-r144-granted-start-sha256.txt`; they equal `a-round-143/end-sha256.txt` for these 2 paths. **Start copies:** `b-round-143/r144-granted-start/`, with paths relative to `store/`. A checks all three first. Any difference → A stops and reports.

## 0. Why this round (D-29z109)
- **Round 143: C FAIL**, with `browserVerified` = `realVerified` = true.
  - **Every row passed except LAYOUT 1440:** T143-TARGETED (357/357), SOURCE-SCOPE, AN-REVIEW, VIDEO-REASON-TEXT, LAYOUT 1280, NEIGHBOUR-SAMPLE, GEO-COUNT, G143-3 and PX-NET/REG-HYD.
  - **CLIP-GAIN-AUDIO (real audio):** −20 dB gives a 20.03 dB drop, and reset comes back within −0.07 dB.
  - **The fix works.** At 1440 the video reason is on 1 line, box [640.5, 779.5, 329, 16]. Its text, `title` and U+2014 dash are correct.
- **The only failure is C-R143-01 (Low, process/criterion).** At 1440 the video placeholder box is [735.5, 759.5, 139, 16]. The 6e9f9b1 baseline is [719.5, 759.5, 171, 16], so d = (+16, 0, −32, 0). A measured this exact delta and raised a STOP, but B gave no written acceptance before C ran, so the literal ≤ 1 px rule failed.
- **Why the delta is not a layout regression:**
  - The parent `arrangement-detail-waveform` has d = 0.
  - C's in-page Georgian-swap control puts the placeholder exactly on the baseline box.
  - The whole x/w delta is the width of the centred round-142 `videoPlaceholder` string (`Video clip · no waveform`, 139 px, against the Georgian 171 px), and that string was already ratified.
  - The y −8 of C-R142-01 is gone.
- **B's own error.** The round-143 §1 sentence "the video placeholder stands where it stood before round 142" assumed the Georgian placeholder width. It could not hold with an English placeholder. This is recorded in B-R143-SPEC-CORRECTIONS.
- **Checks at planning:**
  - The regression is due on or after 2026-10-27; today is 2026-10-24.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
  - There is no strings-split checkpoint result (non-blocking).
  - No Critical or High finding is open, and no Medium is open apart from Tech Lead manual items.

### Rulings D-29z109
- **R1 — the placeholder delta is accepted in writing (it closes C-R143-01).**
  - At 1440 in the video state, `arrangement-detail-video-placeholder` is expected at the literal box **[735.5, 759.5, 139, 16] ± 1 px** in each of x, y, w and h. That is d = (+16, 0, −32, 0) against `b-round-141/out/detail-baseline-6e9f9b1.json`.
  - It is an exempt text-width delta of the ratified round-142 `videoPlaceholder` string, in the same class as R4.
  - Conditions that must hold too:
    - the parent `arrangement-detail-waveform` stays at d ≤ 1 px against the baseline;
    - C's Georgian-swap control puts the placeholder back on the baseline box [719.5, 759.5, 171, 16] ± 1 px.
  - C-R143-01 is **not** a `deferred_low_polish` item. It closes on this ruling plus C's LAYOUT re-check in this round.
- **R2 — R4 of D-29z108 is amended.** The toggle delta is (−2, 0, +2, 0): it is right-aligned, so x follows w. The other R4 deltas are unchanged: header label (−45, 0, +43, 0), apply (0, 0, +22, 0).
- **R3 — round shape.** No new scope; V-0.5 is not attached, because rounds 142–144 publish only on a C PASS. A gets two cheap Lows from A's round-143 reviewer, both in files this stage already owns (2026-10-23 bug-gate rule: a Low may be fixed early when the round owns the code and it costs little):
  - **R-L1:** the polish `describe` title still says "Georgian".
  - **R-L2:** doc 118's status line, its stale TODO and its stale "unresolved" entry, plus the testing lines for rounds 143/144.
  - **R-L3** (the broad `'წმ'` guard) is acknowledged as info; no change.
- **R4 — A's round-143 deviations are ratified:**
  - **D1:** DPS2/DPS4 stay green under m89/m90, because a `toContain` cannot see an appended suffix. B's prediction was wrong.
  - **D2:** the Biome join, −1 line shift.
  - **D3:** the probe (b) delta, now ruled by R1.

## 1. What changes (user-visible)
Nothing in the app. No source code, string, class, testid, handler or key binding changes. Only one test `describe` title and doc 118 change.

### 1.1 Edits
| ID | File | Before | After |
|---|---|---|---|
| CL1 | `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` l.362 | `describe('design (d): Georgian detail labels and the w-72 info column (D-29i, D-29j)', () => {` | `describe('design (d): English detail labels and the w-72 info column (D-29i, D-29j)', () => {`. Nothing else in the file changes; the `it` count stays 16 |
| CL2 | `docs/implementation/2026/quarter-IV/118-studio-v0-detail-library-strings.md` | — | (a) The status line (l.4) becomes `In Progress (C round 143 — FAIL მხოლოდ C-R143-01-ზე, დაიხურა B-ის D-29z109 წერილობითი დასკვნით; round 144 — C-ის ხელახალი შემოწმება)`.<br>(b) The entry `**Problem (გადაუწყვეტელი, stop rule):** …` (l.87 at planning) loses the word `გადაუწყვეტელი, `, so it reads `**Problem (stop rule):**`. At the end of its Solution, add one sentence saying it is resolved by D-29z108 (see the C-R142-01 entry).<br>(c) Add one new Problem → Solution entry for C-R143-01. The placeholder's own English text is narrower and centred, so d = (+16, 0, −32, 0). The parent box d = 0, and the Georgian swap gives the baseline box. B accepted it in writing (D-29z109 R1). There is no code change.<br>(d) Under `## ტესტირება`, add two lines: round 143 (A: typecheck/lint 0, 15 files 357/357, m88–m90; C: every row PASS except the unratified placeholder delta; real Clip Gain −20 dB → 20.03 dB) and round 144 (C's re-check per D-29z109, result pending).<br>(e) Under `## TODO / შემდეგი ნაბიჯები`, delete the 3 stale lines (B's approval of the short text, C round 142, and B's §3.2/R8 `stems` decision). Keep the V-0.5 line and add `LIB-SEARCH-KEYWORDS` to it (per-kind search keywords, including the plural, kept apart from the display labels).<br>Georgian, like the rest of the doc. Nothing else changes |

## 2. A — files you own (everything else is frozen)
You own only the 2 paths in `b-round-143-r144-grants.txt`, and only for the edits in §1.1.
- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Frozen, including all round-142/143 content:** `strings.ts`, `ArrangementDetailPanel.tsx`, `library.ts`, `panels.ts`, `clip-gain-multi.ts` and every pin/test file except the polish file. They stay byte-identical to the frozen list.
- **Untracked file (C-R119-01):** doc 118 is untracked (`??`). Before editing it, A stores its own pre-edit copy and sha256 under `a-round-144/pre-edit/`.
- **Edit rule (C-R120-01):** every lasting edit goes through Edit/Write, with no shell writes under `store/`. Biome may rewrap nothing here. If it reports a diagnostic on CL1, A reports it and does not run `--write`.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a start check fails;
  - a non-granted test fails;
  - a diff appears outside the 2 grants.

## 3. A — checks (speed rules)
- **Start:**
  - frozen list (961) OK;
  - 2 start hashes and start copies OK;
  - `git status --short` = exactly the 22 known paths.
- **Tests:**
  - `npm run typecheck` and `npm run lint` exit 0;
  - read-only `npx biome check app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` gives 0 diagnostics;
  - `npx vitest run` on `detail-panel-polish`, `strings` and `detail-panel-strings-ui`, saved to `a-round-144/vitest.json`. Expected: 16 + 44 + 4 = 64, all green. Record the polish `it` count before and after (16 = 16).
- **No mutations this round:** a title change and doc lines have no behaviour to discriminate.
- **No code-reviewer is required:** only 2 files change, and one is a doc. If A runs it anyway, its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build and e2e (the gate does these).
- **End:**
  - `git status --short` = the same 22 paths;
  - frozen list OK;
  - the protected `git diff 6e9f9b1` is empty;
  - the end sha256 of the 2 granted paths is in `a-round-144/end-sha256.txt`.
- Write `a-round-144.md` as you go: start checks, the diff against the start copies (`a-round-144/diff-vs-start.patch`), test counts, shell writes, end state and deviations.
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 4. C — rows (minimal re-check)
Use real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. State Snap at the start (default off).
- C may reuse `c-round-143/tools/` (`c143.cjs`, `layoutcmp.cjs`, `lib.cjs`, `g143-3.cjs`). Every output is new and uniquely named under `c-round-144/` (C-R125-HARNESS-OVERWRITE).
- The video is `tmp/studio-real-loop/media/clip-4s-vp9-opus.webm`.
- First load of a job: discard a crashed setup run and replace it once (ENV-FIRST-LOAD-GRID-NULL).

| Row | Start state → action → expected |
|---|---|
| T144-TARGETED | Run A's 3-file vitest list. The counts equal A's (64, polish 16) |
| SOURCE-SCOPE | Only the 2 granted paths differ from `b-round-143/r144-granted-start/`. The frozen list (961) is OK at start and end. End hashes equal `a-round-144/end-sha256.txt`. The protected diff vs `6e9f9b1` is empty. `git status --short` = the same 22 paths. No source change during C's phase |
| AN-REVIEW | `diff -u` against the start copies. The polish file changes in exactly one line (CL1), with the same `it` count. Doc 118 has only the CL2 (a)–(e) changes, in Georgian, and the text matches the evidence (C-R143-01 numbers, D-29z109) |
| LAYOUT-1440 | Compare all 5 states with `b-round-141/out/detail-baseline-6e9f9b1.json`, with the same rules as round-143 §5 plus D-29z109:<br>**(i) Video state:** `arrangement-detail-video-placeholder` = **[735.5, 759.5, 139, 16] ± 1 px**. The parent `arrangement-detail-waveform` d ≤ 1 px. With the Georgian-swap control, the placeholder is on [719.5, 759.5, 171, 16] ± 1 px.<br>**(ii) The video reason:** 1 line; x/y/h ≤ 1 px, w within the text-width difference (report it).<br>**(iii) Exempt deltas:** only the amended R4 ones (header label −45/+43, apply +22 w, toggle −2/+2), each ± 1 px.<br>**(iv) Everything else:** every other strict node, column and the panel ≤ 1 px. Line counts are no worse than baseline, the group block ≤ 87 px, `contentScroll` = 107/107 and clipped = 0 in all 5 states.<br>Any breach = FAIL |
| LAYOUT-1280-SPOT | One session, panel expanded, video state only. Compare with `c-round-142/out/c142-1280-r1.json` `states.video.measure`: every node d ≤ 1 px, the video reason on 2 lines, `contentScroll` = 98/83, `clippedBelowPanel` = the same list as that baseline (the line `The source file stays unchanged`), and no new horizontal overflow |
| VIDEO-REASON-TEXT-1440 | Video-only state: the reason text and the Clip Gain field `title` = `A video clip has no Clip Gain — use the track Volume/Mute` (U+2014) |
| G144-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge in a fresh anonymous context. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror. The known cart noise is expected |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
- **Not re-run:** NEIGHBOUR-SAMPLE, CLIP-GAIN-AUDIO and GEO-COUNT. Round 144 changes no app code, and SOURCE-SCOPE proves the app tree equals the round-143 end tree. The round-143 PASS rows stand.

**Neighbour risk:**
- None in the app.
- The polish `describe` title is only a test label.
- The doc must not contradict the evidence.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Video placeholder text and its centred width in the detail panel | Live 12 Clip View chapter: **not** in B's capture `b-round-133/live/arrangement-view.txt` (checked 2026-10-24) | unconfirmed | CZABA-only placeholder, in its own simplified detail panel. No Live claim | LAYOUT-1440 (i) |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 6. Evidence and reporting
- **C's report.** C writes `c-round-144.md` and `c-round-144.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `measurements` (the LAYOUT-1440 placeholder box, parent, Georgian swap, exempt deltas, and the 1280 spot), `invalidRuns` and `notesForB`.
- **Evidence location.** Evidence goes under `c-round-144/{tools,out,shots}/`. C makes no writes under `store/`.
- **browserVerified.** It is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.

## 7. Outcome, fixed in advance (B at round 145 planning)
| Condition | Round 145 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (every done / c_pass item, both viewports, `test:e2e:smoke`), then the row below |
| C FAIL with Critical / High / Medium | A bounded fix-up (at most three related bugs) |
| C FAIL only on a literal criterion with no app defect | B rules in writing at once, and the next round is a re-check only. No code fix-up for a non-defect |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4e → `c_pass`, then `c_pass_published` after the gate publishes rounds 142 + 143 + 144 together. **V-0.4 is then complete.** Round 145 = **V-0.5**, re-measured first. Its area: library, preview, dock, route, `studio-lab-demo.ts` UI labels, `collection.ts`, context l.3468, `lang="en"`, and the final RV-4 grep. B decides the split; ≈84 source lines is likely 2–3 rounds. Forward constraints: gate-141 #2 (SSR `console.error` assertion), gate-141 #3 (ST40 meta-title pin), and LIB-SEARCH-KEYWORDS. If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.5 |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Commit readiness:** after C PASS, root may publish rounds 142 + 143 + 144 together as V-0.4e, which completes V-0.4. Until then the 22 paths stay uncommitted in the tree, and nothing may revert them.
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md` + addenda) is still open and non-blocking. V-0.4 completes with this round, which is a feature boundary. B repeats the bounded request in `b-round-143.md` §5.
