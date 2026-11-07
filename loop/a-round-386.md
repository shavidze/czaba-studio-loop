# A round 386: decode-resync error handling (GATE384-M1, A-R383-REVIEW-L1, GATE384-L2)

**No STOP.** The sketch was applied verbatim and every A check is green. The code-reviewer returned two results (§5, §5b). Their only Medium, the retry Play throwing again, is already ruled into GATE-B385-M2 (sketch-review TL-R385-M2), so it is not a STOP.

## 1. Pre-flight
- HEAD `7295618`, `git status` empty at start.
- `sha256sum -c --quiet b-round-385/r386-frozen-sha256.txt` rc 0; the protected manifest `b-round-318/protected-sha256.txt` rc 0.
- `sketch-386.patch.txt` sha256 `1cada6c7e1eda38c82a51001bc6e09dad0999fe93bb9dedbc5e9c13edc3a01ae` (equals the reviewed sha); `git apply --check` rc 0, then `git apply` rc 0.
- Primitives read: AUDIO_ARCHITECTURE, REACT_CONTEXT, ERROR_TAXONOMY, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AGENT_DISCOVERABLE_CODE; TEMPLATE.md; skill pre-flight.

## 2. Changed files (6 = the grants)
- `app/contexts/ArrangementContext.tsx` (patch)
- `app/lib/arrangement/strings.ts` (patch)
- `app/lib/arrangement/__tests__/strings.test.ts` (patch)
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx` (patch)
- `app/lib/arrangement/__tests__/peaks-worker-video.test.tsx` (patch)
- `docs/implementation/2026/quarter-IV/249-decode-resync-errors.md` (new; written by A)

**PATCH-EQUAL (self-check):** the concatenated `diff -u` of the 5 files against `git show 7295618:<f>`, in grants order, `cmp` identical to `sketch-386.patch.txt` (`a-round-386/patch-equal.txt`). A changed no line beyond the patch.
**Scope at hand-off:** `git status --short --untracked-files=all` = the 5 M files + `?? docs/…/249-decode-resync-errors.md`; frozen rc 0; protected rc 0.

## 3. Checks actually run
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-386/typecheck.log` |
| `npm run lint` | rc 0; 205 warnings + 1 info, the same warning count as gate 384's `verify.log` ("Found 205 warnings."); no error | `a-round-386/lint.log` |
| `npx biome check` on the 5 owned code paths | rc 0, no diagnostics | `a-round-386/biome-scoped.log` |
| `npx vitest run $(cat b-round-385/covering-386-full.txt)` | **34 files, 633 tests passed**, 52.5 s (equals B's sketch run 34/633) | `a-round-386/covering.log` |
| Mutants `run-mutants-386.sh` on a `cp -a` copy (`a-round-386/tree`, removed afterwards by absolute path) | **7/7 red** on their named rows; `restored` printed in every log; restored copy `cmp`-equal to `store/` | `a-round-386/mutants/mutant-*.log` |

Mutant detail (red rows): NO-CATCH → EV11 ×2, EV15, PW20; NO-OWNER-GUARD → EV12; CLICK-STOP → EV13 ×2; LOAD-PATH-DIRECT → EV15; VIDEO-PATH-DIRECT → PW20; REPLAY-STATUS → EV11 (row 1); UNSTABLE-RESYNC → 15 rows including EV14. Matches the `sketch-review.md` table.

**Timeout headroom (L11/L31):** the slowest covering tests are TC10 3503 ms (describe timeout 15 000), UM9 3110 / UM4 3035 / UM3 3029 / UM11 2881 / UM1 2769 ms (20 000), DXM3 2706 ms (20 000), render-budget "does not re-render clips…" 2733 ms (15 000). All < 25 % of their declared timeout. Gate 384 `verify.log` (the higher time decides): TC10 4596 ms (15 000 → 31 %), UM3 3861, UM9 3405, UM4 3255 ms (20 000 → < 20 %). All below 50 %; no headroom STOP. The new EV11–EV15 / PW20 rows run 43–96 ms each.

**Not run (speed rules):** the full suite, `npm run verify`, the build, perf, browser. The root gate owns them.

## 4. Doc 249
- l.4 byte for byte `**სტატუსი:** Completed (C round 386 PASS)` (checked with `test "$(sed -n 4p …)" = '…'` → exact).
- `## ` headings = TEMPLATE's seven, in order.
- Every id it names exists: EV11 (2), EV12, EV13 (2), EV14, EV15, PW20 in the test files; all 7 MU-386-* in `b-round-385/mutants/mutate.py`.
- `grep -rn 'C round [0-9]* pending' docs/implementation` = 0.

## 5. code-reviewer
Real `code-reviewer` subagent run on the working tree after all checks. **No Medium+ findings → no STOP.** No source was changed after the review.
- **A-R386-REVIEW-L1 (Low):** `stopPlayback()` inside the helper's `catch` (`ArrangementContext.tsx` l.1423) could itself throw while it tears down a half-built graph, and the error would escape the fulfilled handler. The reviewer says this is reachable only through the ruled **GATE-B385-M2** (partial `applySchedule`). Proposal: attach it to that task's rows. Not fixed here (reviewed = dispatched).
- **A-R386-REVIEW-L2 (Low, info):** EV12 covers a stale *call* after the swap, not an in-flight decode resolving after it; EV7 already covers the latter. Coverage is adequate together.
- The reviewer checked and found these fine: the hook deps (stable helper; MU-386-UNSTABLE-RESYNC), the owner guard and reset, the L2 supersede check, the status literal compare, TypeScript strictness and semicolons, and that the tests are not vacuous.

**Architecture note (verbatim):** `ArrangementProvider` now has three decode paths (collection load, `ensureDecoded`, video audio) that each repeat "decode → peaks → settle state → resync". The shared tail is now one helper, which is the right size for this round. A later extraction of a `useSourceDecode` hook (decode + pin + abort ownership + resync) would make the owner guard and the resync contract one unit with one test surface. Keep for now: it changes no behaviour, and the provider's size alone is not a reason to split (agent-workflow architectural checkpoint).
→ A proposal for B/root only; nothing was extracted.

### 5b. Second result from the same code-reviewer run (arrived after the first; score 7.5/10)
- **A-R386-REVIEW-M1 (Medium), already ruled → not a STOP.** `startPlaybackAt` (`ArrangementContext.tsx` l.1676–1686) sets `isPlaying` and rewrites the status, the new `scheduleFailed` clause included, *before* `startGraph`. If the retry Play throws again, the UI stays "playing" with no graph and shows "Playing from …". This is the case "repeated throw on Play leaves `isPlaying` true", which `b-round-385/sketch-review.md` l.12 (TL-R385-M2) explicitly puts in the scope of **GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK**. Detail for B to add to that task: the new status clause makes the failed retry show "Playing from …", so its row should assert that the status stays `scheduleFailed` and `isPlaying` is false after a second throw.
- **Low:** a stale `startLibraryPreview` call still stops a live preview, pins the old id and shows `sourceNotLoaded`. This is **TL-R385-L6** (already deferred; not reachable in the browser).
- **Suggestions (info):** EV11 could also assert that the old graph's sources stopped. The bare `catch` hides programming errors (= TL-R385-L8, deferred). `syncPlayback` is still unguarded on the commit path (l.1605) and in the loop resync (l.1410/1321), which is out of scope and belongs with GATE-B385-M2.
- **Architecture note (verbatim, 2nd result):** "Signal 3, repeated costly changes to one region: `ArrangementContext.tsx` 1150-1233 (`startGraph`) and its callers at 1412-1426, 1646-1707 and 1899-1937. The rule "graph build failed → stop and show status" now lives only in `resyncAfterDecode`. `startPlaybackAt`, the commit path, scrub and the loop pump each call `startGraph` with no recovery. The status clause in `startPlaybackAt` (1679) is also collecting special cases. Keep for now. This round's fixes are correct, and splitting things up now would risk audio timing, the refs and the scrub gesture lifecycle. Proposal for the planner, one bounded task: a single build-or-stop wrapper owned by the provider, used by all `startGraph` callers. Keep `useArrangement()` and the timing/anchor behaviour unchanged. Acceptance tests: EV11, EV15 and PW20 still pass, plus new rows for a throw on Play retry, on commit and on loop resync." Note: this conflicts with TL-R385-ARCH (sketch-review l.20: the all-or-nothing rule belongs in `graph.client.ts`, not in call-site wrappers). B rules on it when it plans GATE-B385-M2.
- No code changed after either review.

## 6. B acceptance actually passed by A
- §2 "apply the reviewed sketch verbatim": yes (PATCH-EQUAL identical).
- §3 typecheck, lint: yes. Covering set 34 files: yes. Mutants 7/7 red + restored: yes.
- Doc 249 (§2.6): written; DOCS-row criteria self-checked.
- C rows (BROWSER-*, G386-AUTH, STUDIO-SMOKE, CLAIMS) were **not** run by A and are not claimed.

## 7. Known gaps
- No browser run by A (not required). M1/L2 browser behaviour is unverified until C runs B's probes.
- Pre-existing and ruled out of scope: GATE-B385-M2 (partial `applySchedule`), TL-R385-L4/L5/L6/L8 (deferred), Q-PREVIEW-STOPS-TRANSPORT (awaiting_user).

## 8. Exact next C checks
SOURCE-SCOPE (5 M + doc 249; frozen and protected rc 0), CLAIMS (`bash b-round-385/claims-386.sh` vs `claims-386-output.txt`), PATCH-EQUAL (pinned to `7295618`), UNIT (34 covering files), MUTANTS on a `cp -a` copy, BROWSER-M1 ×2 viewports, BROWSER-M1-MUTANT (record), BROWSER-L2-OK ×2, BROWSER-L2-FAIL ×2, BROWSER-JOIN ×2, G386-AUTH ×2, STUDIO-SMOKE ×2, DOCS. Use the server already on :5173.

## Scope completed
Round 386's A part only. The backlog is not marked complete.
