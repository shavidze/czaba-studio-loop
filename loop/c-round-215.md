# C — Round 215 (RETRO 200–214 verification)

**Verdict: FAIL (RT-NUM, one Low count error in `retro-215.md`).** Every other row passes. Browser rows ran at both viewports: `browserVerified` = `realVerified` = true. No Medium+ finding, no auth bypass, no source change. Per task §4, B corrects the line at round-216 planning and the next C round re-checks only that line (RT-FIX). Round 216 runs as planned.

Environment: `env-status.json` round 215, store 200. Dev server `http://127.0.0.1:5173`; `:5199` mock not running (curl 000). Evidence: `c-round-215/` (`rt/` recomputed numbers, `tools/` scripts, `out/` JSON/logs, `shots/`).

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | Start and end (00:58 UTC): HEAD `eb9e76e1bc2b…`, `git status --short --untracked-files=all` empty, frozen list (1,062) rc 0. `out/scope-end.txt` |
| RT-NUM | **FAIL (1 number)** | See below |
| RT-CAUSE | PASS (2 notes) | See below |
| RT-IDS | PASS | See below |
| RT-LESSONS | PASS (1 note on L28) | See below |
| RT-SABA | PASS | §9 header says proposals only, nothing applied; items 1–2 use "should be added" / "unanswered"; `biome.json`, `.claude/**`, `CLAUDE.md` unchanged (SOURCE-SCOPE) |
| G215-3 | PASS | `out/g215-3.json`, `shots/g215-3-*` |
| STUDIO-SMOKE-215 | PASS (1440×900, 1280×720) | `out/smoke-{1440,1280}.json`, `shots/smoke-*` |
| gate rows | `gate` | Full vitest, typecheck, build, Biome, `npm run verify` and e2e smoke were not run by C (speed rules). No diff exists. |

## RT-NUM

I copied B's 9 scripts to `c-round-215/rt/`, changed only the output prefix `b-round-214/` → `c-round-215/rt/`, and ran them from the loop root with `python3 -I`. The outputs are byte-identical to `b-round-214/*` (retro-numbers, fails-detail, gate-reviews, classify + classify-out.json, window-findings, l28-status, deferred-totals, open-medium-plus, cost-rows.json), with two explained exceptions:
- `collect.txt` / `rounds-200-214.json`: round 214's `b_cost` is now 11.76, not 0, because `b-round-214-result.json` (the planning of 215) exists now. `cost.py` uses the offset `b-round-(N−1)`, so `cost-rows.json` is identical. This matches the retro's note that this planning is excluded.
- `cost.txt`: only the key order of the gate dict differs.

Checked against the retro: totals B/A/C/all 151.29/146.46/112.19/409.94; FAIL rounds 200, 201, 202 and 209 at $100.40 (19.27 + 17.00 + 31.53 + 32.60); median round $28.54 (8th of 15); top 5; phase medians and ranges (B 10.49 (4.80–16.94), A 9.70 (0.43–20.72), C 6.92 (2.83–13.43)); top 6 phases; A FAIL/PASS average 9.38/9.90; re-do rounds 202, 203, 210 and 213 at $101.46; gate published 9, skipped 4, blocked 1 (204), failed 1 (212); browserVerified false in 201 and 209; C bugs 26 (medium 9, low 17); open_findings window 72 (C 23, gate 24, A 14, B 11); categories 28/15/8/7/6; deferred window 49 (18/13/13/5); deferred 324 (11 closed or folded, 313 other); before-count 319 (`backlog-before-215.json`); 8 stale-status findings (`l28-status.txt`; GATE205 is the only one before L28); 3 open Medium+ findings, all from before the window; every window Medium or gate_blocker is closed (my own scan); retro-200 median $21.12 (`retro-200.md` l.23); round 192 C $3.22 (`c-round-192-result.json`); STOP C costs $2.83 and $3.85; `lessons.md` has 47 lines. Stage round counts in §5 match `backlog.json` `rounds[]` types (201–203, 204–205, 206, 207, 208–213, 214, 200).

**Mismatch (C-R215-01, Low):** `retro-215.md` l.53 says "69, 11 review-ში (203–208, 210, 211, 213, 214; 209-სა და 212-ზე review არ არსებობს)". There are **10** `gates/round-N/review.md` files in 200–214 (`gate-reviews.txt` prints 10 rows with data; the listed rounds are also 10). The note also omits that 200, 201 and 202 have no review. The 69 itself is correct (1 critical + 68 suggestions).

## RT-CAUSE (all six §3 rows traced)
- **200:** `c-round-200.json` bugs C-R200-01 (medium) and C-R200-02 (low); failed RT-CAUSE and RT-LESSONS. Matches.
- **201:** `a-round-201.md` l.1–17: STOP on `SfxVideoSync.tsx:34` opacity-0 input, R94 removes its only indicator. B-R200-HIDDEN-FOCUSABLE-GAP exists in `open_findings`. Matches.
- **202:** `c-round-202.json` failed = [ERROR-BORDER, CONTRAST]; `a-round-202.md` §6 says "None was fixed in this round … each goes to B" for A-R202-REVIEW-INPUT-ERROR-BORDER; C-R202-02 is 2.68 against the teal glow. C-R202-04/05 are Medium and not failed rows. Matches.
- **209:** `a-round-209.md` l.3 STOP on frozen `gesture-guard.test.tsx` l.447; `b-round-208.md` l.36 "grepped the 15 fader test files"; `a-round-209.md` l.20 "This is the 10th file". The "very likely but not checked" inference is labelled (*დასკვნა*). Matches.
- **gate 204:** GATE204-B1 is a gate_blocker, "doc 161 l.111 claims a jsdom test … no such test". Matches.
- **gate 212:** `gates/round-212/verify.log` l.552 CP12 33332 ms ×; `gates/round-211/verify.log` l.562 CP12 25434 ms; `clip-gain-pointer-preview.test.tsx:503` `describe(…, { timeout: 30_000 })` at HEAD; `a-round-212.md` l.38–41 (31.8 / 32.8 s, "predates the round … Root gate risk"); `c-round-212.md` l.224 "root-gate matter". Matches. The cited range l.38–42 is one line wider than the content (l.42 is the test:perf bullet). This is not a defect.
- Notes (not failures): (a) row 200's class label "ambiguous task text" does not fit the stated cause, a B analysis error; the parenthesis states the real cause. (b) §4 "who finds" and the category split are labelled as inferences or heuristics.
- §4 L7 closures: GATE211-S1 → `c-round-212.md` l.172 shows `draftedClipGains` reads the `storedClipGainsDb` prop (matches). At `eb9e76e`, doc 163 l.4 = "Completed (PERF-1a C round 206 PASS …; PERF-FADER-a0 C round 208 PASS …)" and doc 166 l.4 = "Completed (PERF-FADER-b C round 211 PASS …)". GATE206-DOC163, GATE208-DOC163 and GATE211-S6 are recorded as closed. GATE206-S3, GATE206-S6 and GATE211-S4 are closed by round 214. The §6 "keep" claim for PERF-HARNESS-SHARED-LIB matches `gates/round-214/review.md` l.44 "Keep this round".

## RT-IDS
- `backlog.json` → `systemic_tasks` SYS-4 closes GATE214-DOC168-STATUS, B-R214-DOC160-161-STATUS and GATE205-DOC162-STATUS. All three exist in `open_findings` (low) with status "queued: SYS-4". They are open and in the doc-status class.
- `git show eb9e76e:<doc> | sed -n 4p` gives non-final statuses:
  - 160: "In Progress (C-ის browser შემოწმებას ელოდება)";
  - 161: "In Progress (… C-ის რაუნდი 204 PASS …)";
  - 162: "In Progress (C round 205 PASS …)";
  - 168: "In Progress (C round 214 check pending)".
- Target rounds 203, 204, 205 and 214: each `c-round-N.json` is PASS with browserVerified true, and each is the PASS for that doc's work (203 is the stage-2 fix-up after the 202 FAIL; 204's gate was blocked and its work was published with 205).

## RT-LESSONS
- 47 lines (≤ 60) and exactly three parts (B / A / C). Every lesson names an observable check and cites ids.
- New and changed lessons, citations opened (for L23 also the older `a-round-127.md` §3 and `a-round-178.md` l.43 DEVIATION 2; both match):
  - **L23:** `b-round-208.md` l.36; `a-round-209.md` l.20; C-R209-01; `c-round-203.md` l.26 STF2 repo-scan note.
  - **L28:** `l28-status.txt`; ROOT-L28-AMEND-MISSED; GATE214-DOC168-STATUS.
  - **L29:** A-R214-DEV-RANGE-LIVE; `ArrangementLane.tsx` l.1016 `range?.allTracks`.
  - **L30:** GATE206-S2; C-R214-BIOME-PERF-VACUOUS; `biome.json` `files.includes` = `app/**/*.ts(x)` only.
  - **L31:** GATE212-B1; B-R212-TIMEOUT-HEADROOM; the 25.4 / 33.3 / 30 s figures in the gate logs.
  - **L32:** `a-round-212.md` l.38–41.
  - **L33:** C-R202-01; `a-round-202.md` §6.
  - **L34:** C-R208-01, C-R210-01 and C-R209-02, all about doc 163.
- All citations exist and say what the lessons claim.
- **Note on L28 (C-R215-02, needsBRuling, not a bug):** I agree with A's feedback (`a-round-215.md` "Lesson feedback"). The rule is checkable, but during the C phase, and in any FAIL tree, l.4 states a PASS that has not happened yet. A grep cannot tell a claimed PASS from a real one. Gate 212 also shows that a C PASS can still be followed by a gate failure. The line stays true there, but the doc is published one round later with a different commit. A gate-script substitution after reading `c-round-N.json` (A's option b) removes the human step without the premature claim. This is not a FAIL: the lesson is concrete and its evidence is real.

## G215-3 (fresh anonymous contexts)
- `/studio-lab`:
  - 1440×900: workspace and "Demo collection — no sign-in required" badge visible, `auth_user` null, 0 cookies;
  - 1280×720: the same, with 0 forbidden or authorised requests.
- `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]`.
- `GET /api/studio-token?product=middle-east&file=stem1.wav`:
  - no header → **401** `{"error":"Please sign in to access Studio."}`;
  - fake Bearer → **500** "Unable to prepare Studio access" (mock not running, allowed).
- **No token issued.** No Set-Cookie, 0 context cookies, 0 page errors, 0 hydration warnings.

## STUDIO-SMOKE-215 (real mouse, fresh anonymous context, both viewports)
Steps: add the demo clip "Middle East — საჯარო preview", drag `arrangement-clip-fade-in-handle` +40 px (hit test = the handle), then Ctrl+Z.
- Fade-in went 0.000 → 1.000, already live during the drag.
- Undo went "Add — …" → "Undo: Fade In": one entry.
- After Ctrl+Z, the fade-in is 0.000, start and width are unchanged, Undo is back to "Add — …", and Redo shows "Redo: Fade In".
- 0 page errors, 0 non-environment console errors.
- The results are identical at 1440×900 and 1280×720.
- Screenshot `shots/smoke-1280-after-drag.png` shows the fade ramp and "Fade In: 1.000 s."

**Ableton:** not applicable (RETRO, no new behaviour). No parity claim.

## For B
1. **C-R215-01 (Low):** correct `retro-215.md` l.53 to "10 review-ში" and say that 200–202, 209 and 212 have no review. RT-FIX re-checks that line only.
2. **C-R215-02 (needsBRuling, in JSON `needsBRuling`, not `bugs[]`):** rule on A's L28 feedback (premature PASS string; option b, a gate-script substitution).
3. **Bookkeeping observation (info, not a retro number):** `backlog.json` `rounds[]` shows round 211 status "dispatched" and round 212 "c_pass_published", though gate 212 failed and fe556fd published 212–213. The retro does not use these fields (it uses `gates/*.json`), so no retro number is affected.
4. Process note: a detached `&` background run of the browser script stalled with no output for about 5 minutes; foreground runs finished in seconds. The tools are unchanged; this is an environment note only.
