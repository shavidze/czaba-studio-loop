# Round 290: RETRO 290 (seventh retrospective, rounds 275–289) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 289 → 290 planning, 2026-10-31.

**Decisions:**
- D-29z710: round 289 accepted; FIX-PD-1b is done; L7 closures.
- D-29z711: gate-289 triage; FIX-PD-1b2 queued for round 291.
- D-29z712: RETRO 290 outputs.
- D-29z713: lessons.
- D-29z714: screen and journey review.
- D-29z715: L46, TLM-R274.
- D-29z716: experiments and the systemic task.
- D-29z717: what comes next.
- D-29z718: inventory of every entry that names "RETRO 290".

**Rules:**
- **Policy:** "Retrospective: stop, look back, improve" (Saba, 2026-10-26); "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28); the product-designer rule (2026-10-30); the RETRO journey step (2026-10-31); `backlog.json` → `retro_policy`.
- **Window:** retro 275 covered 260–274, so this one covers 275–289. Precedent: rounds 260 and 275.
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 290:
  - L27 is merged into L52;
  - L17 is folded into L2;
  - **L56** is new;
  - L4 gains the ruling-line clause.
  - This task uses L56 itself: every `b-round-289/` file it cites is checked by a `test -f` claim in §8.

## Baseline: HEAD `5a911ff`, clean tree
- **Gate:** gate 289 published `5a911ff…` on both remotes [K1]. That commit is the round-290 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning [K2].
- **Frozen:** every tracked file, **1,157** entries, is listed in `b-round-289-r290-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-289-r290-tree-sha256.txt`.
  - B ran it after the last consult: rc 0.
  - Each of the 7 protected auth and purchase files appears exactly once [K4].
- **Grants: none.** `b-round-289-r290-grants.txt` and `b-round-289-r290-new-files.txt` are empty on purpose. No file in `store/` may change in this round.

## 0. Why this round
- **Round 289 passed.**
  - C: 13 rows, `browserVerified` and `realVerified` both true, 0 bugs.
  - Gate 289 published `5a911ff`.
  - **FIX-PD-1b is done.** F7 and SR-230-6 are closed.
  - L7 bookkeeping: C-R282-01/02/03 and A-R282-REVIEW-DW11 were still "fix dispatched". Round 283 fixed them and was published, so they are now closed.
- **Gate-289 triage (D-29z711):**
  - **Two Mediums → FIX-PD-1b2, round 291:**
    - GATE289-S1: the heading `div` inside `listbox > group` may be read twice by a screen reader. Fix: `aria-hidden`.
    - GATE289-S2: doc 216 l.17 says the collection "always shows", which is false.
  - GATE289-S3 (run keys) and A-R289-REVIEW-L2 (stale test names) are fixed early in that round. They have the same owner and cost little.
  - S5, A-R289-REVIEW-L3 and Mtavruli go to `deferred_low_polish`.
  - The product question goes to Saba as SABA-Q-LIB-SINGLE-RUN.
- **RETRO is due:** `retro_policy.next_due` was "round 290".
- **REGRESSION is not due yet.** `regression-last.json` says 2026-10-30, so the next one is due on or after 2026-11-02.
- **No open Critical or High.** The new Mediums run next round, and the older ones are parked:
  - Tech Lead manual: GATE232-S2 and GATE274-S1;
  - awaiting Saba: GATE271-S1;
  - environment or backend: A-R73, GATE128-S1 and R80.

  None is a security or data-loss bug.
- **Reference first / Ableton:** not applicable (RETRO round). **Screen budget:** nothing visible changes.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-290.md` | The analysis, in Georgian with English terms, for Saba. Window 275–289 |
| `lessons.md` | **59 lines** (≤ 60), three parts. Before-copy: `b-round-289/lessons-before-290.md`. Diff: `b-round-289/lessons-diff.txt` |
| `user-review/screen-review-290.md` | Candidates **SR-290-1…10** and the question SABA-Q-LIB-SINGLE-RUN. Captures in `b-round-289/screens/` (`capture.mjs`, `screen290.json`, `counts.txt`, `stems-probe.mjs/.json`, the PNGs) |
| `b-round-289/*.py`, `*.txt`, `*.json` | The scripts and data behind every number. <ul><li>Hand files: `fails-cause-hand.txt`, `claims-findings-hand.txt`, `stops.txt`.</li><li>`claims-count.txt` comes from a shell loop: SWEEP hits, unique `[K#]`, STOP lines and shadow fields per round.</li><li>`retro290-mentions.txt` and `retro290-mention-ids.txt` hold the "RETRO 290" inventory.</li><li>`helper-users.txt`.</li><li>`update-backlog.py` and `update-backlog-2.py` hold this planning's backlog edits.</li></ul> |
| `backlog.json` (version 250) | Decisions D-29z710…D-29z718. <ul><li>`retro_runs` 290 and `retro_policy`.</li><li>`harness_rules`: HR-C-MANIFEST-FIELDS and HR-CAPTURE-LANE-BY-NAME are new; HR-C-SHADOW-FIELDS is retired.</li><li>`systemic_tasks` SYS-VACUOUS-ROWS.</li><li>`screen_review_candidates` SR-290-*.</li><li>The gate-289 ids and the retro-candidate dispositions.</li></ul> Before-copy: `b-round-289/backlog-before-290.json` |
| `feature-status.md` | Rows 289/290, the next line, the PD-REVIEW row and the TLM-R274 row |

**Order of work (the C-R215-01 lesson).**
- The analysis scripts read the **before** copy.
- Run them from the loop root as `python3 -I b-round-289/<script>.py`: first `collect.py`, then `cost.py`, then the others.
- `cost.py` prints to stdout; B saved that output as `cost.txt`.
- `update-backlog*.py` are **not** re-runnable: each refuses to run twice. Do not run them.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD = `5a911ff…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-290.md` with the three results and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `user-review/` or any B file. If you disagree with a lesson in the A part, or with L56 or the L4 ruling line as they affect A, write it under "Lesson feedback".

## 3. C: what to verify
C writes `c-round-290.md` and `c-round-290.json` as it goes. New fields under HR-C-MANIFEST-FIELDS, starting this round:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for each finding: B spec, B pre-check, A, pre-existing or environment.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `5a911ff`, a clean status, and the frozen list with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run K1–K12 of §8 verbatim, **first** (L56) | Every output equals its expected value. Each `test -f` path exists |
| **RT-NUM** | Recompute **every number** in `retro-290.md` §1, §2, §9 and §10 from its named file or script. C may copy the scripts to `c-round-290/`; run them from the loop root. At least: <ul><li>**Totals:** $183.74 / $96.58 / $78.49 / $358.81; the round median $22.32; the phase medians B $12.77, A $6.54, C $4.98; the FAIL-round cost $72.19; the fix-up costs 11.93 / 17.41 / 15.26.</li><li>**Groups:** feature stage $193.90; test-only $79.89.</li><li>**Counts:** gate 11 / 3 / 1; C `bugs[]` Medium 3, Low 13; 56 review suggestions; the `classify.txt` origin and category counts; 503 / 22 / 481.</li><li>**Origins in §4:** C 24, gate 23, A 30, B 11 (`open_findings` + `deferred_low_polish` window sums).</li><li>The 2 STOPs; max tags 24.</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each item of §9, open the quoted source: <ul><li>`c-round-275.json`;</li><li>`gates/gate-round-276.json` and `gates/round-276/verify.log` (NS1, NS6, TC9);</li><li>`tasks/round-276.md` §2.5 (runtime-only rulings);</li><li>`c-round-282.json`;</li><li>`c-round-287.json`;</li><li>`tasks/round-286.md` (0 SWEEP hits);</li><li>`c-round-286.json`.</li></ul> | Each stated cause is what the source says. No invented cause. The SWEEP verdict follows from the written rule in `retros/retro-275.md` §10 |
| **RT-IDS** | <ul><li>**Round 289 closure:** FIX-PD-1b is `done (D-29z710)`. SR-230-6 is done. C-R282-01/02/03 and A-R282-REVIEW-DW11 are `closed (D-29z710…)`.</li><li>**Gate-289 ids:** S1/S2 are Medium `open` and are named in the FIX-PD-1b2 stage. S3 and A-R289-REVIEW-L2 are `open`. S5, A-R289-REVIEW-L3 and L4-MTAVRULI are in `deferred_low_polish`. SABA-Q-LIB-SINGLE-RUN is `awaiting_user`. BACKEND-EVIDENCE-F7 and A-R289-ARCH-GROUP-RUNS are present.</li><li>**Inventory (D-29z718):** every id in `b-round-289/retro290-mention-ids.txt` has a disposition in `retro-290.md` §7, §8 or §10. Also grep the **before** copy for `RETRO 290`, `RETRO-290` and `retro 290`, case-insensitive, to catch spelling variants. Any entry with no disposition is a finding.</li><li>**Systemic task:** SYS-VACUOUS-ROWS closes the 4 Lows it names, and each of them has the `scheduled in systemic task` status.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-289/lessons-before-290.md lessons.md` touches only l.3, L2, L4, L52, the new L56 and the removed L17 and L27;</li><li>L2 and L4 start with their old text byte for byte (prefix compare) and only append;</li><li>the merged L52 keeps every evidence id of the old L27 and L52;</li><li>no other line changed</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-SABA** | `retro-290.md` §12 and `screen-review-290.md`: every rule change and screen candidate is phrased as a **proposal or question**. SR-290-3 and SR-290-10 are questions. The position-moving variant of SR-290-7/10 says it needs Saba | As stated |
| **RT-SCREEN** | Every SR-290 candidate names a screenshot that exists, and shows what it describes. C opens the PNGs. **SR-290-3 rests on `stems-probe.json`, not on the screenshots.** C re-runs `stems-probe.mjs` (or an equivalent) at both viewports and checks two things: with no lane chosen, Add puts a Stem on Music; after clicking the name `Stems`, Add puts it on Stems. The "capture error" paragraph matches what C sees | Each candidate is as described. A mismatch is a finding against the review, not against the app |
| **G290-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720: <ul><li>`/studio-lab` shows the workspace and the `Demo collection — no sign-in required` badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>the token API returns 401 with no header, and 403 with a fake bearer when the mock runs.</li></ul> If the mock does not run, record the status code: a 500 with no token means "fails closed" | As stated |
| **STUDIO-SMOKE-290 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48): <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>export a WAV: RIFF/WAVE, 48 kHz, length 16.000 s, non-silent (peak > 0)</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`:** true only if G290-AUTH, STUDIO-SMOKE-290 and the RT-SCREEN re-probe ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `consequence-tester` may review L56 and EXP-R290-ARTIFACT-MANIFEST for checkability. Record any disagreement as a finding against the retro.

## 4. Outcome, fixed in advance (D-29z717)
| C result | B at the round-291 planning |
|---|---|
| All rows PASS | Round 291 is **FIX-PD-1b2**. Its scope: <ul><li>GATE289-S1: `aria-hidden` on the heading; C checks the Chromium accessibility tree, and the group name still resolves.</li><li>GATE289-S2: doc 216 wording.</li><li>GATE289-S3: `key` from the first id of the run.</li><li>A-R289-REVIEW-L2: test names.</li></ul> One owner, `ArrangementLibrary.tsx`. The Medium fix goes first even when REGRESSION is due (on or after 2026-11-02); REGRESSION then follows in round 292 |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause, a candidate not as described) | B corrects the files at the round-291 planning. The next C round re-checks only the changed lines (RT-FIX, as rounds 216, 231, 246, 261 and 276), together with FIX-PD-1b2 |
| G290-AUTH or STUDIO-SMOKE-290 finds a Medium or worse | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** FIX-PD-1c → SYS-VACUOUS-ROWS → STUDIO-LINK → NAME-AND-HINT → PERF-3c and the rest of STUDIO-PERFORMANCE → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 5. Neighbour risk
App code carries none: no source file changes. The risk is in the process:
- **L56** adds a `test -f` claim per cited artifact. EXP-R290-ARTIFACT-MANIFEST stops it if a manifest grows past 30 lines or the B median passes $15.96.
- **L52's merge** must keep the old L27 evidence. RT-LESSONS checks this.
- **The screen review goes to Saba.** SR-290-3 corrects a capture error, so RT-SCREEN re-probes it.

## 6. Deliverables
- **A:** `a-round-290.md`.
- **C:** `c-round-290.md` and `c-round-290.json`, with evidence under `c-round-290/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, plus the HR-C-MANIFEST-FIELDS fields.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:**
  - `user-review/screen-review-290.md`: 10 candidates and one question;
  - `retro-290.md` §12: RC-R275-STOP-ROUTES-TO-B, repeated (2 STOPped rounds reached C);
  - TLM-R274 is now on the final acceptance list.
- **For root:** no new frontend-architect checkpoint. A-R289-ARCH-GROUP-RUNS is a small signal on one owner. The older requests stay pending and non-blocking.

## 8. Claims (L29 + L56 form; C re-runs each one verbatim, from the loop root unless stated)
| Tag | Claim | Command | Expected |
|---|---|---|---|
| K1 | gate 289 published `5a911ff` | `python3 -I -c "import json;g=json.load(open('gates/gate-round-289.json'));print(g['status'],g['commit'][:7])"` | `published 5a911ff` |
| K2 | clean tree at planning | `wc -c < b-round-289/git-status-at-planning.txt` | `0` |
| K3 | 1,157 frozen entries | `wc -l < b-round-289-r290-tree-sha256.txt` | `1157` |
| K4 | each protected file appears once | `for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-289-r290-tree-sha256.txt; done \| tr '\n' ' '` | `1 1 1 1 1 1 1 ` |
| K5 | Play's playing signal and name | from `store/`: `grep -n "data-playing" app/components/arrangement/ArrangementTransport.tsx; grep -n "playLabel" app/lib/arrangement/strings.ts` | `272:          data-playing={isPlaying ? 'true' : 'false'}`; `233:  playLabel: 'Play',` |
| K6 | screen-capture element counts | `python3 -I -c "import json;d=json.load(open('b-round-289/screens/screen290.json'));print({k:len(v) for k,v in d['screens'].items()})"` | `{'1440x900-S0': 139, '1440x900-DEMO': 167, '1280x720-S0': 119, '1280x720-DEMO': 143}` |
| K7 | lessons line count | `wc -l < lessons.md` | `59` |
| K8 | the cited artifacts exist (L56) | `for p in b-round-289/backlog-before-290.json b-round-289/lessons-before-290.md b-round-289/lessons-diff.txt b-round-289/cost.txt b-round-289/retro-numbers.txt b-round-289/fails-detail.txt b-round-289/gate-reviews.txt b-round-289/classify.txt b-round-289/window-findings.txt b-round-289/deferred-totals.txt b-round-289/open-medium-plus.txt b-round-289/claims-count.txt b-round-289/fails-cause-hand.txt b-round-289/claims-findings-hand.txt b-round-289/stops.txt b-round-289/retro290-mentions.txt b-round-289/retro290-mention-ids.txt b-round-289/helper-users.txt b-round-289/screens/capture.mjs b-round-289/screens/stems-probe.mjs b-round-289/screens/stems-probe.json b-round-289/screens/counts.txt; do test -f $p \|\| echo MISSING $p; done; echo done` | `done` |
| K9 | the screenshots exist | `ls b-round-289/screens/*.png \| wc -l` | `12` (10 capture + 2 stems-probe) |
| K10 | backlog version and last decision | `python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])"` | `250 D-29z718` |
| K11 | shadow fields only in 275–276 | `grep -l shadowRowSeverityVerdict c-round-27[5-9].json c-round-28[0-9].json` | `c-round-275.json` and `c-round-276.json` only |
| K12 | the stems probe facts | `python3 -I -c "import json;d=json.load(open('b-round-289/screens/stems-probe.json'));print([(k,v['noSelectStatus'][:45],v['afterSelectStatus'][:45]) for k,v in d.items()])"` | both viewports: the second item starts with `“Night Pulse · Bass” added to the Music track` and the third with `“Night Pulse · Pad” added to the Stems track` (the 45-character slice of the third ends in one space) |
