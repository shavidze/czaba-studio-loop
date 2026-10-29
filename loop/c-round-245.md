# C — round 245 (RETRO 245 verification)

**Date:** 2026-10-29 · **Role:** C (independent verifier) · **Verdict: FAIL** (RT-LESSONS and RT-SABA; both are document findings, Low) · `browserVerified` = `realVerified` = **true** · bugs: 3 Low (C-R245-01…03), 0 Critical/High/Medium.

Per `current-task.md` §4, an RT row FAIL means: B corrects `lessons.md` / `retro-245.md` at the round-246 planning, the next C round re-checks only the changed lines (RT-FIX-246), and round 246 runs as planned. No product regression was found. No store file changed.

## Summary table
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | start and end (08:23Z): HEAD `e9fb805e28e6…`, `git status` 0 lines, `sha256sum -c --quiet` rc 0, no output (1110 entries) |
| RT-NUM | PASS (2 info notes) | `c-round-245/out/*.txt` |
| RT-CAUSE | PASS | sources below |
| RT-IDS | PASS | backlog greps below |
| RT-LESSONS | **FAIL** | C-R245-01 (merge dropped 3 clauses); C-R245-03 (L50 regex alternative matches 0 lines) |
| RT-SABA | **FAIL** | C-R245-02 (GATE244-S4 has no deadline; R49-T has no question) |
| RT-SCREEN | PASS | counts are equal; all 8 candidates appear as described |
| G245-AUTH (browser) | PASS, both viewports | `c-round-245/out-browser/c245.json`, `auth-guard-*.png` |
| STUDIO-SMOKE-245 (browser) | PASS, both viewports | same JSON, `marker-escape-*.png` |
| gate rows | `gate` | full vitest, typecheck, build, Biome, verify, e2e smoke: not run by C (speed rule) |

Blocked: none. No row this round needs the backend.

## RT-NUM
Method: I copied B's scripts to `c-round-245/scripts/`, with every `b-round-244/` path rewritten to `c-round-245/out/`, so B's files are not overwritten. The input is a copy of `b-round-244/backlog-before-245.json`. `update-backlog.py` was not run. Run from the loop root.
- All outputs are byte-identical to B's except `collect.txt`. That file differs only in round 244's `b_cost` (0 → 12.38), because `b-round-244-result.json`, the round-245 planning, now exists. `cost.py` uses the n−1 shift, so no window number changes (INFO-C245-COLLECT-DIFF).
- Costs: B $158.80 / A $110.75 / C $78.15 / total $347.70, as in `cost.txt`. My independent raw sums are 158.80 / 110.72 / 78.14 / 347.67. The difference comes from B rounding each file before summing. I applied ±0.01 to the named script output (INFO-C245-COST-ROUNDING).
- Median $22.81. Top 5 rounds: 231 $31.72, 239 $31.12, 232 $27.32, 235 $26.30, 234 $25.47. Top 6 phases are all B planning: 231 $14.88, 239 $13.48, 233 $13.27, 230 $13.20, 234 $12.24, 232 $11.89. Phase medians: B $11.44 (range 1.34–14.88), A $7.29 (1.19–11.48), C $5.22 (3.76–7.39). All match.
- FAIL rounds are 230, 237 and 241. I read `taskStatus` in each `c-round-N.json` directly. Their cost is $54.36. C PASS 12.
- Fix rounds: group (a) 233, 236, 237, 238, 240 and group (b) 242, 243, 244 total $173.17. The feature stages 231, 232, 234, 235, 239, 241 total $154.86. Adding RETRO 230 ($19.67) gives $347.70. I checked each round's group against the title of `tasks/round-N.md`, and all are consistent: 233 is the CALM-3 follow-up for GATE232-S1, 236/237/238 are 11a-FIX-1/2/3, 240 is 11b-FIX-1, 242 is 11b-FIX-2, 243 is C-R242-01-FIX and 244 is EDITOR-MENU-FOCUS-FIX. The §6 stage counts also match the titles: 11a = 234–238 (5), 11b = 239–242 (4).
- A's FAIL average is (1.19 + 7.48 + 4.95) / 3 = 4.54. Without round 230 it is (7.48 + 4.95) / 2 = 6.215 → $6.22. PASS average $8.09.
- Gate: published 12 (231–236, 238–240, 242–244), skipped 3 (230, 237, 241), failed 0. I read `gates/gate-round-N.json` `status` directly.
- C `bugs[]`: 15 entries (medium 3: C-R237-01, C-R241-01, C-R242-01; low 12). `browserVerified` false: none.
- Gate reviews: `ls gates/round-2{30..44}/review.md` returns 12 files (230, 237 and 241 are missing). The numbered items are 7+7+5+7+4+5+5+6+3+4+4+7 = 64.
- Window counts: `open_findings` 65 (gate reviewer 27, C 16, A 16, B 6) and `deferred_low_polish` 29 (15 / 7 / 5 / 2). The deferred total is 387 (14 closed or folded, 373 other). Open Medium+ is 8, read from the before-copy (`open-medium-plus.txt`).
- §9 numbers: at `e9fb805`, `grep -rn 'In Progress (stage' docs/implementation` finds only doc 176 (stage 1 of 2; C round 225) and doc 186 (stage 2 of 3; C round 242). Line 4 of doc 178 reads `Completed (C round 231 PASS)`, and line 4 of docs 182 and 183 reads `Completed (C round 235 PASS)`, exactly as quoted. C-SCOPE is 15/15: I read each `c-round-N.json` `passed` directly and none has a scope row under `failed`.
- $15.87 = 1.5 × $10.58, and $10.58 is the B planning median in retro-230 l.46. Other retro-230 baselines are also cited correctly: $22.52, 13/2, and re-do $50.27 (l.24, 25, 38, 49).
- Limitation (INFO-C245-BEFORE-COPY-UNVERIFIABLE): the loop git repo is a shallow single commit (`e280950a`), and that commit already holds the post-planning backlog. So I could not compare the before-copy with history. Its `updated` field reads "B round 243 -> 244 planning". It has 1199 open_findings and 387 deferred, against 1203 / 395 now.

## RT-CAUSE
- 230: `c-round-230.json` C-R230-01 (Low) says L26 required `## Prompt`, which no doc has. Matches.
- STOP 232: `a-round-232.md` l.3 has the STOP for the L32 headroom ruling, and C-R232-01 measured 2620 ms (52 %). Matches.
- STOP 233: `a-round-233.md` l.3 has the STOP ("task premise invalid"). `c-round-233.json` C-R233-01 contains the quoted phrase "C-R232-01 is NOT closed (premise invalid)". Matches.
- 237: `a-round-237.md` l.3 has the STOP on A-R237-REVIEW-M1 (L33/L11). `c-round-237.json` C-R237-01 (Medium) shows the final status stuck on 'Loading the demo collection…'. Matches.
- 241: `c-round-241.json` C-R241-01 reads "Pre-existing: identical at HEAD 04c2a5b". Matches.
- 243/244 "Why we missed it": `tasks/round-243.md` l.120 (one origin class per round) and `tasks/round-244.md` l.154–157 (blur-unmount editors). Both match.
- B-R230-APPLY-DESCRIBEDBY in the before-copy: Apply had no `aria-describedby`. Matches.
- L42 claim: `grep -c 'SABA-B-9'` gives 0 in `b-round-229-prompt.txt`, 0 in `b-round-230-prompt.txt`, 0 in `b-round-231-prompt.txt` and 3 in `b-round-232-prompt.txt` (that file is the round-233 planning). Matches.
- §4 hand classification (`window-mediums-hand.txt`): I checked each of the 15 ids against its before-copy title. The focus group has 6 ids (A-R242-REVIEW-M1 is recorded as merged into C-R242-01). The status-clobber three are A-R234-REVIEW-M1, B-R235-READY-CLOBBER and C-R237-01. The remaining ids are A-R235-REVIEW-M1 (render-time ref), GATE235-S1 (dblclick → Fit), GATE239-S2 (bypassed side effect), GATE232-S2 (AltGr, open_tech_lead_manual) and GATE243-S1 (process). All are consistent.
- Consult labels: every `tech-lead` / `consequence-tester` statement is attributed by name to the consult (l.5, 27, 78, 83, 93, 94, 123, 134, 135, 137, 140, 145, 157). The inferences are labelled as such: the l.128 hypothesis is marked "დაუდასტურებელი ჰიპოთეზა" (unconfirmed hypothesis), and §9 reads "არ უარყოფილა, სუსტი" (not refuted, weak).
- The §5 claim that every new visible element in the window had a budget row holds: `passed` contains a C-BUDGET row in rounds 231, 232, 234, 235, 239 and 241.

## RT-IDS
- D-29z399 closures: B-R242-MARKER-EDITOR-MENU-FOCUS, B-R243-GROUP-EDITOR-MENU-FOCUS, A-R243-REVIEW-L1 (with GATE243-S3), A-R243-REVIEW-L2/L3 and GATE243-S2 are all closed, citing `c-round-244.json` rows and gate 244.
- D-29z403 Lows: A-R244-REVIEW-L1/L3/L4/L5, GATE244-S2/S3/S4/S7 are in `deferred_low_polish` as Low. GATE244-S1 is an alias inside A-R244-REVIEW-L5's title, and A-R244-REVIEW-L6 is an alias inside GATE244-S4's title. Neither is a separate entry, which matches the task's "=" notation.
- INFO-C244-ADD-EXISTING-UNREACHABLE, INFO-C244-BPM-RING-MOUSE and GATE244-S6 are `info`. GATE244-ARCH-GRIDMENU-FOCUS-HOOK is in `architecture_signals` with status "not scheduled".
- B-R243-UNDO-MARKER-FOCUS is open, Medium, and scheduled per D-29z405.
- `retro_runs`: the 245 entry exists (dispatched). The 230 entry is `done`, and RT-FIX-231 is in `c-round-231.json` `passed`.
- Every id in `b-round-244-checkpoint-request.md` exists in `backlog.json`: ARCH-CHECKPOINT-TEMPO-GRID, GATE233-ARCH-DOCK-FOCUS-RESCUE, A-R237-ARCH-STATUS-PARTS, GATE244-S3/S4, A-R244-REVIEW-L6 (alias), B-R243-UNDO-MARKER-FOCUS and SABA-B-7.
- §7 ids exist: GATE233-S3, GATE233-S1, C-R236-01, A-R236-REVIEW-PLAYING-PAST-END, INFO-C239-STATUS-STALE-AFTER-ZOOM and SYS-1/2/3/5. No SYS task was created, and §7 gives the tech-lead reason.

## RT-LESSONS — FAIL
- `lessons.md` has 57 lines and the three required parts. The diff (`c-round-245/lessons.diff`) touches only the header, L29, L47, one removed blank line, the new L50/L51, L11, L12, and the removed L32/L33/L40. No other lesson changed.
- Citations: 90 id-like tokens. Every one exists outside `lessons.md` / `retro-245.md`, except `STUBBED-N`, which is a naming pattern. For the changed and new lessons:
  - L29: B-R230-APPLY-DESCRIBEDBY and C-R233-01 + STOP 233 say what the lesson claims.
  - L47: GATE232-S1, C-R241-01, C-R242-01 and B-R242/B-R243 all exist.
  - L50: the 241→244 chain and B-R243-UNDO-MARKER-FOCUS.
  - L51: A-R234-REVIEW-M1, B-R235-READY-CLOBBER and C-R237-01 are all status clobbers.
- Clause-by-clause check of the merges:

| Old clause | New L11/L12 | Result |
|---|---|---|
| L32: failing or slow covering test is a STOP even if pre-existing | L11 "Also a STOP (old L32)" | kept |
| L32: "(a timeout included)" | only implied by "slow" | weakened |
| L32: written at the top, **not under "For B/root"** | "write it at the top as STOP" | **dropped** |
| L32: above 50 % listed **with its time and limit** | "with A's time and the last gate `verify.log` time" | **dropped (limit)** |
| L32: gate time when a `verify.log` exists; the higher decides | unconditional "(the higher decides)" | reworded, kept |
| L33: Medium+ regression from your change or reviewer, fix outside grants → STOP | L11 "And (old L33)" | kept |
| L40: changed `data-testid` element → grep the testid, run every hit file | L12 "(old L40)" | kept |
| L40: **a hit that pins classes in a frozen file is a STOP (L11) with the hit list** | absent; L12's earlier STOP sentence covers class-token renames only | **dropped** |
| L40: B's L23 pre-check covers only B's sketch | kept | kept |

  → **C-R245-01** (Low). A's "Lesson feedback" in `a-round-245.md` names the same three clauses; I confirmed them independently.
- L50 regex: valid under `grep -rnE`. On `app/components/arrangement` it finds 82 hits in 19 files: `onPointerDown(Capture)?` 30, `onBlur` 11, `settleEditor\(` 4, `\.focus\(` 39, and `\{[^}]*&&\s*<` **0**. The conditional-render alternative is vacuous in this code, because conditional JSX here is written as multi-line `{x ? (` ternaries (for example `ArrangementGridMenu.tsx` l.235, 292, 312). Over the whole folder, 82 hits is also above the retro's own 20-origin stop condition. → **C-R245-03** (Low): the lesson needs an alternative that matches this code's conditional renders (for example `\? \(\s*$` / `&& \(\s*$`), or a narrower root.

## RT-SABA — FAIL
- (1) §12 and `screen-review-245.md` are phrased as proposals and questions: "მხოლოდ წინადადებები და კითხვები, არაფერი გამოყენებულა" (only proposals and questions, nothing applied); SR-245-1 "მხოლოდ შენი თანხმობით" (only with your consent); SR-245-4 "მხოლოდ კითხვაა" (a question only). No rule file changed (SOURCE-SCOPE).
- (2) The lessons named for each Saba item exist: L39 (SABA-B-8), L41 and L42 (SABA-B-7), L43–L46 (SABA-B-9/10/11).
- In the L46 list (§12 item 2), GATE232-S2/TLM-R232-ALTGR-WIN, TLM-R232-MAC/TLM-R228-META-KEYS, TLM-R233-SR-ORDER and A-R204-SAFARI-USERMENU-CLICK each have a concrete question and "ვადა: RETRO 260" (deadline: RETRO 260). **GATE244-S4 / A-R244-REVIEW-L6 has no deadline. R49-T has no question,** and its deadline is a task (SABA-B-11c), not a round. → **C-R245-02** (Low). If B rules that R49-T needs no question because Saba's approved SABA-B-11c closes it, that ruling should say so explicitly. GATE244-S4 still needs a deadline.

## RT-SCREEN — PASS
- All 4 cited PNGs exist and I opened each one. SR-245-1 through SR-245-8 appear as described:
  - SR-245-1: the five-fact status line is visible at both sizes.
  - SR-245-2: auto-Snap appears on the 1/2 grid.
  - SR-245-3: the BPM, MARKERS and LOOP strips take about 55 px in S0. The BPM field is empty and Metronome is grey.
  - SR-245-4: the seconds ruler and the bars ruler 1…12 both show.
  - SR-245-5: the grid changes from 1s to 1/2.
  - SR-245-6: 1× and Env show in all four screenshots.
  - SR-245-7: the Undo button shows "Undo: Ad…".
  - SR-245-8: Clip Gain shows the 0.0 field, the slider and the 0 dB readout at 1440, in both S0 and DEMO.
- The exclusions cite decisions that exist in the policy: SABA-B-8 decision 3 (dock row collapse "not approved") and decision 2 ("fields keep their geometry"). The third exclusion is DP's own ("audio is not stretched").
- SR-245-1 names the CALM status fact and SR-245-4 names SABA-B-11 decision 3; both are phrased as questions. SR-245-2 is `info`. The backlog has SR-245-1 and SR-245-3…8 as `awaiting_user` and SR-245-2 as `info`. No candidate repeats SR-230-1…10. SR-245-6 touches the zoom group of SR-230-4, but it is about the 1× control, which SR-230-4 does not cover.
- Browser: I ran `node ../tmp/studio-real-loop/b-round-244/screens/screens.mjs <c-round-245> c245` from `store/`. The first attempt timed out waiting for the scroller on a cold dev-server compile (environment). The rerun gave **S0 142/121 and DEMO 170/147**, equal to B's. The DEMO output has the full Undo text "Undo: Add — ღამის პულსი · პულსი" and the status starting "“ღამის პულსი · პულსი” added to the Music track at 01:43.352 (nearest free spot). Tempo 120 BPM from …". The full text is in the screenshot and in the smoke row (it ends "— bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/2 (G)"). Evidence: `c-round-245/c245.json`, `c-round-245/c245-full-*.png`.

## G245-AUTH (browser) — PASS
Fresh anonymous context with 0 cookies, at 1440×900 and at 1280×720 (`c-round-245/c245.cjs`, `out-browser/c245.json`):
- `/studio-lab` shows the workspace (scroller count 1) and the "Demo collection — no sign-in required" badge. `localStorage.auth_user` is null.
- `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `auth_user` is still null.
- `GET /api/studio-token?product=middle-east&file=stem1.wav` with no header returns **401** `{"error":"Please sign in to access Studio."}`.
- The same request with a fake Bearer returns **500** `{"error":"Unable to prepare Studio access"}`. No mock is running on `:5199`, so 500 is the expected answer.
- **No token was issued.** No bypass.

## STUDIO-SMOKE-245 (browser) — PASS
I waited for `Demo collection ready` (L48) and added `demo-stem-pulse`, the same recipe as rounds 237–244.
- **Space:** at 1440 the playhead went 0 → 0.870 s after 900 ms and the live RMS tap read 0.0015 (non-zero). After the second Space it held at 0.882 → 0.882 over 500 ms and RMS read 0. At 1280: 0 → 0.861, then held at 0.882 → 0.882.
- **Export WAV (both viewports):** sha256 `1fea093b…033f94`, the expected value. 48 kHz, 24-bit, stereo, 768000 frames = 16.000 s, 0 NaN, peak 0.2967, RMS −24.91 dB.
- **Round-244 fix:** I pressed `M` (editor open), right-clicked an empty lane (grid menu opened) and pressed Escape. The menu closed and a new marker "Marker 1" was created. `document.activeElement` is `arrangement-marker` with that new id, `:focus-visible` true, outline 1px solid brass at 0.8 alpha, at both viewports.
- Page errors: 0 in every context.

## For B (round-246 planning)
1. **C-R245-01:** restore the three dropped clauses in L11/L12: "not under 'For B/root'", "and its declared timeout", and "a testid hit in a frozen or protected file is a STOP (L11) with the hit list". This is consistent with A's feedback.
2. **C-R245-02:** give GATE244-S4 a deadline round, and either a question for R49-T or an explicit ruling that SABA-B-11c is its deadline.
3. **C-R245-03:** fix L50's conditional-render alternative (multi-line ternary / `&& (`) and say which root folder it runs on, given 82 hits on the whole folder.
4. RT-FIX-246 should re-check only those lines.

None of these touches app code. The outcome table in §4 of the task applies: an RT row failed, and round 246 still runs as planned.
