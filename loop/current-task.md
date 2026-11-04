# Round 326: GATE325-IM24-WALLCLOCK fix-up. Make the IM24 playing-state reads deterministic so the gate can publish rounds 325 + 326

**Planned by:** B, at the round 325 → 326 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v285):
- **D-29z920: round 325 closed from evidence.** C PASS (`c-round-325.json`: `browserVerified`/`realVerified` true, 0 bugs). Gate 325 **failed** [K1]: the full vitest run was 3544/3545, and the only failure was `insert-marker-ui` IM24 [K15]. Nothing was published. PERF-DRAG-PREVIEW stage a is `c_pass_unpublished`, not done.
- **D-29z921: GATE325-IM24-WALLCLOCK** (Medium, origin pre-existing test harness, gate-blocking) is this round. It supersedes the watch signal B-R299-IM24-LOAD-SIGNAL.
- **D-29z922: D-29z914 is superseded.** REGRESSION is not due today (`regression-last` 2026-11-02 [K9]; due on or after 2026-11-05). It becomes the first round planned on or after 2026-11-05.
- **D-29z923:** A's code-review Low 4c → `deferred_low_polish` as A-R325-REVIEW-L4C, to be re-examined in stage c.
- **D-29z924:** the systemic task SYS-CLOCK-DETERMINISM is recorded, not scheduled. It covers the other wall-clock rows (VDS3, EN10, BW5).
- **D-29z925:** round-325 info rulings (move commits, restart-loop harness signal, the Architecture note).
- **D-29z926:** the doc for this fix is one bullet in doc 232.
- **D-29z927:** lesson L48 gains a jsdom-clock clause.

**Read first:** `lessons.md`: L11, L23, L26, L28, L29, L48 (new clause), L52, L56, L57, L58.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§8).

## Baseline
- **HEAD `b925434`** plus round 325's uncommitted tree: 16 status entries [K2], unchanged since C round 325.
  - Round 325's app and perf diff is pinned by K11 (name lists) and K12 (content hashes; the first K12 value excludes the one file this round edits).
  - Protected files: 11/11 OK [K8].
- No dependency change.

## 0. Why this round
- **Gate 325 failure (fact):** `IM24 … expected [ 2, 6, 10, 16, 16.001 ] to deeply equal [ 2, 6, 10, 16, 16 ]` [K15].
- **Mechanism (fact, code):**
  - The test fake's `currentTime` is `Date.now() / 1000 - fakeClock.base` [K5]. It follows the wall clock.
  - After a seek, playback holds the position for `PLAYBACK_LOOKAHEAD` = 0.05 s [K6].
  - IM24 reads `getLivePosition()` while playing, rounded to 1 ms [K4]. The 5th read comes after a Ctrl+Right that does not move (the last marker is 16).
  - Under full-suite load, more than 50 ms of wall time passed between the 4th seek and the 5th read.
- **Reproduced by B (L58)** on a scratch copy of the current tree (b925434 + round 325):
  - Mutant **MU-DELAY-60** (`b-round-325/sketch/mu-delay-60.patch.txt`) adds a 60 ms `performance.now()` busy-wait before the 5th read. Result: red, `16.021` (`run-head-mu-delay-60.log`).
  - The fix (`b-round-325/sketch/im24-fix.patch.txt`, one line) adds `vi.spyOn(Date, 'now').mockReturnValue(Date.now());` right after `mountMarkerWorkspace()` in IM24.
    - With MU-DELAY-60 applied, the fix is green (`run-fix-mu-delay-60.log`).
    - The whole file is 29/29, three times (`run-fix-file-{1,2,3}.log`; `summary.txt`) [K14].
- **Why freezing is safe:**
  - App code times with `performance.now()`, not `Date.now()`. The double-click guards, meters and overview all use it.
  - The spy is restored by the file's `afterEach` `vi.restoreAllMocks()` [K7].
  - IM24 advances time only through `advance()` (`fakeClock.base`) [K18 first value] and has no `waitFor` [K18 second value, file-wide 0].
- **The assertion keeps its strength.** With the clock frozen, a playing visit can change only through a seek. A Ctrl+Right that did not seek would leave the read at the play-from position, and the row goes red.
- **Why we missed it:**
  - B-R299-IM24-LOAD-SIGNAL (round 299) was a "watch" with the condition "a failure in a run alone is a STOP". A load-only flake can never meet that condition, and the gate is a loaded run.
  - Rule (L48 clause, D-29z927): fix a jsdom timing flake with a known wall-clock mechanism when it is first seen (frozen clock + delay mutant). Do not watch it.
- **Reference-first, product-designer, screen budget:** not applicable (test-only fix-up; nothing visible changes).

## 1. Contract
1. **`app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`** gets exactly the sketch change.
   - IM24's first statement after `const mounted = await mountMarkerWorkspace();` becomes `vi.spyOn(Date, 'now').mockReturnValue(Date.now());`.
   - No other line in the file changes. Every IM24 assertion stays byte-identical, and the `expect(` count stays 204 [K10]. (`vi` is already imported: the file's `beforeEach` calls `vi.stubGlobal`.)
2. **`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`** gets one Georgian bullet (technical terms in English) in `## პრობლემები და გადაწყვეტები` [K17]. It is in Problem → Solution form:
   - **Problem:** gate 325 IM24, wall-clock fake + 50 ms hold.
   - **Solution:** IM24 freezes `Date.now`; MU-DELAY-60 is red without the freeze and green with it.

   l.4 stays exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 325 PASS)` [K13]. Nothing else in the doc changes.
3. **Nothing else changes.** No app source, no other test, no perf file, no helper, no budgets, no other doc. The round-325 tree stays as it is: K12's two values and K11's two values stay equal to planning.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-325/claims-326.sh` from the loop root. The output equals `b-round-325/claims-326-planning-output.txt`. Any difference is a STOP |
| A-IMPL | §1.1 and §1.2 |
| A-CLAIMS-AFTER | Every line equals planning except: K2 `b925434 17` (the IM file becomes a modified tracked file; doc 232 is already untracked); K3 `1`; K11 first value (changes, see the ruling below); K17 second value ≥ 1. A saves the output as `a-round-326/claims-after.txt` |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`, three times: 29/29 each run. Report the IM24 time against its timeout |
| A-MUTANT | On a scratch copy, never in `store/`: apply `b-round-325/sketch/mu-delay-60.patch.txt` to the **pre-fix** file → IM24 red; apply it to the fixed file → IM24 green. Save `a-round-326/mutant-*.log` |
| A-EXPECT | `grep -c 'expect(' insert-marker-ui.test.tsx` = 204 before and after |
| A-REVIEW | Not required (2 files). If A asks for one anyway, its notes go to B |

**Ruling on K11:** K11's first value is a hash of the changed-file name list under `app`/`perf`. `insert-marker-ui.test.tsx` is not in that list at planning, so the value **will** change. A and C do not compare K11's first value. They check instead that `git diff --name-only HEAD -- app perf | sort` equals `b-round-325/app-perf-changed-files.txt` (9 paths, saved at planning) plus `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`. K12's first value excludes that file, so it **must not** change.

### 2.2 C's rows
C writes `c-round-326.md` and `c-round-326.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified` = 1 (IM24 under MU-DELAY-60);
- `mutantsRecorded` = 1 (MU-DELAY-60);
- `mutantRedOnSketch` = true (B's `run-head-mu-delay-60.log`; C re-checks it);
- `mutantRedOnTree` (C's own run);
- `gateChecksNamed` = 6;
- `gateChecksRunOnSketch` = 0, reason "B ran only the touched file";
- `chainHeadGateRunGreen` = `null`, reason "not a fix-up chain; gate 326 is the first re-run".

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-325/claims-326.sh`, first (L56) | As A-CLAIMS-AFTER and the K11 ruling. K12's first value equals planning (`a098fabed5c4`), and K12's second value equals planning (`cfe1faaafc67`) |
| SOURCE-SCOPE | `git status`; `git diff --stat HEAD -- app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`; protected sha | 17 status entries: round 325's 16 plus the IM file. The IM diff is exactly `1 insertion`. Doc 232 differs from C round 325's copy only by the one bullet. Protected 11/11 |
| UNIT | On C's scratch: the IM file ×3 alone; then 3 runs of the file **in parallel with CPU load**: 2 × `node -e "for(;;){}"` for the duration, killed afterwards | Alone: 29/29 on every run. Under load, IM24 is green on every run. A **timeout** under load is environment-invalid: replace that run, at most 2 replacements. An **assertion** failure under load in a test other than IM24 that passes alone (and passed in gate 325) is recorded as a finding for SYS-CLOCK-DETERMINISM with its log, not a FAIL of this round |
| MUTANT | MU-DELAY-60 on a pre-fix copy and on the fixed copy, plus one mutant of C's own (for example a Ctrl+Right handler that does not seek while playing, or removing the spy line) | Pre-fix: red. Fixed: green. C's mutant: red on the IM24 playing assertion. Restored: green |
| EXPECT | `expect(` count of the IM file | 204, same as HEAD and as planning |
| DOCS | Doc 232: the new bullet sits inside `## პრობლემები და გადაწყვეტები`; l.4 byte-equal to [K13]; the 7 TEMPLATE headings stay in order (L26) | As specified |
| B-IM24 (browser) | `/studio-lab`, 1440×900 and 1280×720, fresh anonymous context. The demo data defines no markers (`app/data/studio-lab-demo.ts` has no `markers`; B's grep). Add markers at 2 s and 6 s (the M key or the marker "+"; the method is free), Home, Space, then press Ctrl+Right repeatedly while playing | Each press lands on the next marker time. C lists the observed sequence, which must contain 2 then 6, in order. After the last marker, the status reads `No more markers after the playhead` and the transport still shows Playing. Screenshots per step. This is the real behaviour IM24 encodes. It is a sanity row: a FAIL here is a real bug, with its own severity |
| G326-AUTH | As G325-AUTH, both viewports | `/studio-lab`: anonymous workspace + demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| CARRY-325 | K12 equality (above) | Round 325's app/perf content is unchanged, so its browser, perf and export evidence (`c-round-325.*`) still applies. C does **not** re-run those rows. If K12 differs, that is a FAIL "round-325 tree changed" |

**Gate rows.** C does not claim these; they go under `"gate"`: the full vitest, the build in `store/`, Biome, typecheck, `npm run verify` and the e2e smoke. The gate re-runs the full suite on the combined 325 + 326 tree and publishes both rounds.

**Browser flags.** `browserVerified` is true only if B-IM24 and G326-AUTH ran at both viewports.

**Ableton conformance:** not applicable. The test is about our own transport behaviour, already agreed in SABA-B-10a (D-29z436), and this round changes no behaviour.

## 3. Grants
A edits only:
- `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` (§1.1);
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`, the section `## პრობლემები და გადაწყვეტები` only (§1.2).

Nothing else: not round 325's files, not the shared helper `helpers/workspace-test-environment.ts`, not `package.json`, the lock or config, no protected file, no loop artifact outside `a-round-326*`.

## 4. Neighbouring behaviour at risk (C probes)
- **Other IM tests in the same file.** The spy lives inside IM24 only and is restored in `afterEach`. A leak would freeze the clock for later tests. UNIT runs the whole file, and C may add an order check (IM24 then IM21 alone with `-t`).
- **The round-325 tree.** It must not change (CARRY-325).

## 5. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-326.md` and changes nothing else when:
- A-CLAIMS differs from planning;
- the fixed file fails in any of the 3 runs;
- MU-DELAY-60 is not red on the pre-fix copy, or not green on the fixed copy;
- any other file seems to need a change.

## 6. Next and commit readiness
- **After C PASS:** the gate re-runs verify on the combined tree. On green, root publishes rounds 325 + 326 on top of `b925434`. The publish set is the 16 `paths` of `gates/gate-round-325.json` plus `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`. Only then do PERF-DRAG-PREVIEW stage a and GATE325-IM24-WALLCLOCK become done.
- **Next round:** REGRESSION if its planning falls on or after 2026-11-05 (it carries C-R318-06 and CAND-R323-FOLD-CLEARS-SELECTION with a Live 12 reference question). Otherwise PERF-DRAG-PREVIEW stage b (fades). The stage-a per-move asserts (D-29z917) move to stage b's planning (D-29z922).
- **Later:** stage c, PERF-9 … PERF-15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, then the rest of the queue.

## 7. Open items carried (not this round)
- A-R325-REVIEW-L4C (deferred Low).
- INFO-C325-MOVE-COMMITS (stage c re-measure).
- A-R325-REVIEW-RESTART-LOOP (harness signal).
- A-R325-ARCH-PREVIEW-OWNER (joins checkpoint request D-29z915).
- SYS-CLOCK-DETERMINISM (closes VDS3, EN10 and BW5 later).

## 8. Claims (L29 + L56)
Run `bash b-round-325/claims-326.sh` from the loop root (`CLAIMS_STORE` may override the store path). Planning output: `b-round-325/claims-326-planning-output.txt`.

| Tag | Claim | Now | After A |
|---|---|---|---|
| K1 | gate 325 status, head | failed b925434 | same |
| K2 | HEAD, status entries | b925434 16 | b925434 17 |
| K3 | `vi.spyOn(Date, 'now')` in the IM file | 0 | 1 |
| K4 | the IM24 playing read line; the `[2, 6, 10, 16, 16]` assert | 1 1 | 1 1 |
| K5 | helper `currentTime` = `Date.now() / 1000 - fakeClock.base` | 1 | 1 |
| K6 | `const PLAYBACK_LOOKAHEAD = 0.05;` | 1 | 1 |
| K7 | `vi.restoreAllMocks();` in the IM file | 1 | 1 |
| K8 | protected OK | 11 | 11 |
| K9 | regression-last date | 2026-11-02 | same |
| K10 | `expect(` lines in the IM file | 204 | 204 |
| K11 | hashes of changed and untracked name lists under app/perf | 526af7a408b5 ef6a06dbc3de | first changes (+IM file), second same |
| K12 | content hash of the app/perf diff excluding the IM file; content hash of untracked app/perf files | a098fabed5c4 cfe1faaafc67 | same, same |
| K13 | doc 232 l.4 | `**სტატუსი:** In Progress (stage 1 of 3; C round 325 PASS)` | same |
| K14 | cited artifacts exist | checked | checked |
| K15 | IM24 title; the 16.001 message in the gate log | 3 2 | same |
| K16 | `tasks/round-325.md` equals the before-copy | archive-equal | same |
| K17 | doc 232 problem heading; `IM24` mentions in doc 232 | 1 0 | 1 ≥1 |
| K18 | `advance(` lines in the IM file; `await waitFor` in the IM file | 17 0 | 17 0 |
