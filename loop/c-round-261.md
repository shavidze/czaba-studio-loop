# C round 261 — PERF-HARNESS-STRINGS-DRIFT + RT-FIX-261

**Verdict: PASS.** All 10 task rows pass, and claims K1–K8 match. `browserVerified` = `realVerified` = **true**: PERF-RUN drove real Chromium, and G261-AUTH ran in a fresh anonymous context at 1440×900.
- **Bugs filed:** 0.
- **Info notes for B:** 5, in §3.
- **Gate rows (root's, not claimed):** full vitest, build, Biome, `npm run verify`, e2e smoke.
- **Ableton conformance:** not applicable (test-only round, no `/studio-lab` UI change).
- **Screen budget / viewports:** not applicable (task §3). G261-AUTH ran at 1440×900 only, as the row specifies.

Every result below comes from my own commands in this session. A's report was used only to know which checks to make. Evidence is in `c-round-261/`.

## 1. Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | `source-scope.txt` (start) and `source-scope-final.txt` (05:11 UTC, after perf + auth). Both show: sha256 check rc 0; `git status` lists only the 4 grants (` M`) and the 2 new files (`??`); HEAD `7a960c1511bf…`. The final file also records the sha256 of the 6 round files. |
| PERF-SWEEP | PASS | `perf-sweep.txt`: the K3 regex over the 4 files gives 0; the second grep gives 0. The baseline at `7a960c1` re-counts to 23. I also grepped for other app-text patterns (`includes('`, `=== '`, `toHaveText`, `name: '…`): no app label is left. `rangeLabelEnd` is the only pattern left (§3 N3). |
| WIRING | PASS (with ruling N2) | `wiring-allowlist.txt`, plus my read of `perf/lib/app-labels.ts`.<ul><li>Exactly one import, `../../app/lib/arrangement/strings`, and no `~/`.</li><li>All 11 class (a) values come from their named key or function (l.23–48).</li><li>The allowlist has exactly 6 entries with `label`/`sourceFile`/`sourceNeedle`.</li><li>`grep -nwE "as\|any\|ts-ignore"` gives 0 hits.</li><li>No class (a) value is copied.</li><li>`'Music'`/`'Stems'`/`'Undo'` equal `strings.ts` values only by coincidence or by the task's own rule (N2).</li></ul> |
| ALLOWLIST-TRUE | PASS | `grep -cF` gives 1 for each of the 6 needles (DetailPanel l.429, Lane l.797/l.832, Master l.208, Transport l.397 (exact-line match) and l.153).<ul><li>No `strings.ts` key produces `Clip Gain — fader`, `Master Volume`, `Pan — …`, `Volume — <track>` or `Export`. The `Clip Gain` hits at l.768–795 are reasons, status and reset texts, not the fader name.</li><li>`'Undo'` appears only inside `undoTitle` (l.150).</li></ul> |
| MUTANT-PERF | PASS | My own fresh scratch copies in `/tmp` (rsync without `node_modules`/`.git`/`build`, `node_modules` symlinked), removed afterwards.<ul><li>Control: `npx tsc --noEmit` rc 0 (`mutant-control.txt`).</li><li>Mutant 1, `zoomSliderLabel`→`zoomSliderLabelX`: rc 2, `perf/lib/app-labels.ts(26,54): error TS2551` (`mutant1.txt`).</li><li>Mutant 2 (separate copy), `moveTitle`→`moveTitleX`: rc 2, `perf/lib/app-labels.ts(42,58): error TS2551` (`mutant2.txt`; its other errors are in `app/` users of `moveTitle`).</li></ul> |
| TYPECHECK | PASS | `npm run typecheck` rc 0 (`typecheck.txt`), run before the perf run. |
| PERF-RUN (browser) | PASS | `npm run test:perf`, alone: no vitest, tsc or other browser job ran, and the process check before the start showed 0 such processes. It ran 04:54→05:08 UTC: **rc 0, 3 passed (14.0 m)**, in 1 valid attempt with 0 replacements (`perf-run-1.log`). It ran on the final files, after A's review fixes; their sha256 are in `source-scope-final.txt`. This closes A's caveat that its own perf run predates those fixes. The JSON copies are in `latest*.json`; `perf-compare.txt` and `perf-asserts.txt` hold my comparison.<ul><li>PERF-1a: complete, 6 passes, 0 aborts, 0 pageErrors, 0 problems, 0 failures; 92 assert rows, all pass.</li><li>PERF-1b-i: complete, 6/0/0/0/0; 17 assert rows, all pass.</li><li>PERF-1b-ii: complete, 6/0/0/0/0; 15 assert rows, all pass.</li><li>The log has 0 ` FAIL` lines.</li><li>`harness.audio-running` = 1 and `interact.harness.audio-running` = 1 ([1,1,1]).</li><li>All 12 `fader.*.playing.restarts` rows = 0 (track, group, master, pan, clipgain, clipgain-members; 1x and 6x).</li><li>`move-components-per-move` stays between 0.65 and 2.75, within ≤ 3. `release-commits` = 1, meeting ≥ 1.</li><li>**Against the round-259 oracle** (`c-round-259/latest*.json`): 0 deterministic deltas (166/106/37 rows), and no new or missing rows.</li><li>`sequence`, row `scenario` and row `note` are byte-equal in all 3 reports. This independently confirms spec tension 1 (the templated step and problem strings are unchanged).</li></ul> |
| DOC-261 | PASS | Doc 195:<ul><li>The headings are in TEMPLATE order: კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO / შემდეგი ნაბიჯები.</li><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 261 PASS)` (`cmp`).</li><li>It cites only `npm run typecheck` and the 3 existing perf specs.</li><li>Limit 1 (a key that is still there but no longer rendered is not caught) is l.59; limit 2 (the 6 inline labels are unprotected, SIG-R261-INLINE-LABELS) is l.60. Limit 3 (`rangeLabelEnd`) and limit 4 (a future `~` import) are extra.</li></ul> |
| RT-FIX-261 | PASS | `rt-fix.txt`.<ul><li>The lessons diff touches only l.18. `wc -l` = 59, and the 3 parts are present.</li><li>Both substrings appear exactly once. Removing them gives the old l.18 byte for byte (python check `removed==before True`).</li><li>The retro diff touches only l.93 and l.121.</li><li>l.121: B-R239 → L49 "round-240-ის დაგეგმვისას" (matches `retro_candidates` B-R239-BYPASSED-SIDE-EFFECT, "applied at round-240 planning"), and only B-R237 → L51 from retro 245.</li><li>l.93 now uses `backlog.json` and `policy.local.md` as evidence. It names agent-workflow.md only to say its 0 proves nothing.</li><li>`backlog.json` `open_findings`: C-R260-01 and C-R260-02 have status `fixed_in_planning_awaiting_c …`. D-29z524…D-29z529 are all present.</li></ul> |
| G261-AUTH (browser) | PASS | `g261-auth.json`, `studio-lab-anon-1440x900.png`, `studio-product-anon-1440x900.png`; fresh anonymous context at 1440×900.<ul><li>`/studio-lab`: the workspace renders (4 lanes, 1 `Add`, 1 `Play`). The badge "Demo collection — no sign-in required" and the notice show. `auth_user` = null, 0 cookies, 0 page errors.</li><li>`/studio/middle-east`: "Sign in required" ×1, 0 `audio[src]`, 0 audio or token requests.</li><li>`/api/studio-token` with no header → **401** `{"error":"Please sign in to access Studio."}`. With a fake Bearer → 500 `Unable to prepare Studio access`. Neither response is 200, and neither body contains a token.</li></ul> |
| Claims K1–K8 | match | `claims.txt`: every command re-run gives its expected output (K4 = 11 lines at the stated numbers; K5 l.429/797/832/208/397/153). |

My own regex derivation check (`derive-c.ts`, output in `derive-c.txt`):
- All 5 derived `.source` strings are byte-equal to the `7a960c1` literals.
- The group regex matches `Volume — Group 1 (group)` and rejects `Volume — Music`.
- The move suffix matches `Soft impact — drag to move`.
- The WAV length pattern parses `WAV created: 00:04.500, 24-bit …`.
- `wavDone` (`strings.ts` l.89–90) has exactly one `exportedLength` placeholder before the comma, so the sentinel split is sound.

## 2. A's spec tensions: C's ruling (B confirms)
1. **Step-name clause vs PERF-SWEEP.** One change meets both clauses: the strings are templated, and their values are unchanged. Byte equality of `sequence`/`scenario`/`note` against round 259 proves it on the real run. Not a STOP and not a FAIL.
2. **"No literal equals a `strings.ts` value" vs the §1(c) fixtures.**
   - The track names `Music`/`Stems`/`SFX` come from `app/routes/studio-lab.tsx` l.19–21, not from `strings.ts`.
   - Their equality with `kindMusic`/`folderMusic` (l.278/280) and `folderStems` (l.281), which are library labels, is a coincidence.
   - §1(c) itself requires these constants, and §1(b) classifies `Undo`.
   - The clause's own parenthetical, "(no copies)", fixes its meaning. `'Music'`/`'Stems'` are not copies of a `strings.ts` value, so the clause is met as it is defined, together with §1(c). This is not a D-29z526 STOP. Only a bare literal-equality reading would conflict, so N2 suggests clearer wording.
3. **`rangeLabelEnd`.** It is a parser for the clip range readout, not a locator, and both sweeps are 0. Not a FAIL. Doc 195 discloses it as unprotected (limit 3). B rules (N3).

## 3. Info notes for B (not bugs)
- **N1, K3 sweep undercount.** The claim command still counts 23, so there is no L29 mismatch. But the regex misses browser-side `textContent?.trim() === 'Add'` checks (3 sites at `7a960c1`). A found and wired them. Planning gap: a sweep for app text should include `=== '` / `includes('` forms.
- **N2, WIRING clause wording.** Next time, write "no copy of a class (a) value" rather than "no literal equals any `strings.ts` value". The latter collides with fixture data whose values happen to be equal.
- **N3, `rangeLabelEnd`.** Its `–`/`·` separators are inline JSX in `ArrangementClip.tsx` (A cites l.981/985; I confirmed the `–` at l.981). It is a 7th drift-unprotected pattern next to SIG-R261-INLINE-LABELS. B should consider it there.
- **N4, C tooling side effect.** I ran `npx tsx` for my derive check, and npx installed `tsx@4.23.15` into the npm cache (outside `store/`, the same class as C-R29-NPX-CACHE). `store/` is unchanged: `source-scope-final.txt` was taken after it.
- **N5, auth script.** My first G261-AUTH attempt timed out in its own `getByRole('button', {name:'Add'}).waitFor` (90 s, visible state) right after the perf run. The rerun used the harness readiness predicate (`Add` text + preview waveform) and found exactly 1 role-matched `Add`, with 0 page errors. I treat this as my script or environment (no page error, and the perf harness clicks that same locator 18 times successfully). It is not an app bug and is not reproduced.

## 4. Lessons applied
- I read `lessons.md` (l.1–59) and applied L26, L28, L29, L30 and L38, plus the C section (L16–L25 and L38; none of L16–L25 applies to a test-only perf round).
- **L29 task scan:** `grep -nE 'l\.[0-9]+|(app|perf|docs)/[^ `]+|data-testid|aria-[a-z-]+' current-task.md` gives 31 hits (`c-round-261/l29-scan.txt`).
  - Every hit that states a fact about a `store/` file is tagged: l.41/45–48 [K5], l.59 [K6], l.63 [K7], l.141–147 are the claims themselves.
  - The other hits are grants, instructions or loop artifacts. No untagged claim, so no planning FAIL.
- **L29 sweep roots:** K3 and PERF-SWEEP are literal-site sweeps of the 4 granted perf files, not rename or meaning sweeps, so the `perf/**` root fits their purpose.

## 5. Gate (root)
Full vitest, `npm run build`, Biome, `npm run verify`, and `npm run test:e2e:smoke` are root gate rows; C did not claim them. The perf webServer did run `npm run build` successfully as part of `test:perf` (log), but that is not the gate.

Commit-ready on this PASS: the 4 perf files, `perf/lib/app-labels.ts` and doc 195.
