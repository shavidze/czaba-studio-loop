# CURRENT TASK — Round 340: REGRESSION round (REGRESSION-ROUND-2026-11-05). C-only browser sweep: phase 1, T12 V1, everything done since round 199, now including rounds 302–339. A changes nothing

Dispatcher: B · Implementer: A (no change; baseline report only) · Verifier: C · Planned 2026-11-04 23:20 → 2026-11-05 00:1x UTC.
Decisions: **D-29z1049 … D-29z1058** (`backlog.json` → `decisions_log_b`, `rounds[340]`, `regression_rounds` id `REGRESSION-ROUND-2026-11-05`).

**Read first:**
- `lessons.md` in full. Directly relevant:
  - L6: every scope addition is a named row or "carried";
  - L29: claims;
  - L38: perf runs alone;
  - L48: playback-start lead; wait for `Demo collection ready`;
  - L54: journey row;
  - L57: harness fields.
- The rules: `docs/technical/studio-real-workspace/agent-workflow.md`, especially:
  - the speed rules and "Regression round every 3 days";
  - the 2026-10-23 bug gate;
  - the cloud-runner section.
- **The template, by reference:** `tasks/round-301.md` §2–§10 (round 301 references round 258, which references 199), plus `c-round-301.md` (133 rows PASS; tools in `c-round-301/tools/`). **This task lists only what changed since round 301. Where it differs from round 301, this task wins.**
- The previous task is `tasks/round-339.md` (exact copy of the round-339 `current-task.md`). B's reasoning: `b-round-339.md`.
- Every fact about current code below carries a `[K#]` tag from `b-round-339/claims-r340.sh` (output `b-round-339/claims-r340-planning-output.txt`). Re-run it at SOURCE-SCOPE start and end.

## Baseline: HEAD `99a5912`, clean tree
- `gates/gate-round-339.json` is `published` with `commit` `99a5912a6a76…` on both remotes [K1]. Its `head` field `662ed42` is the pre-commit HEAD; do not use it. `context/head-sha.txt` is stale as well.
- At planning:
  - `git rev-parse --short HEAD` = `99a5912` and `git status --short --untracked-files=all` is empty [K2];
  - the protected files in `b-round-318/protected-sha256.txt` are 11/11 OK [K3];
  - the tracked tree is frozen in `b-round-339/r340-tree-sha256.txt` (1239 entries, 0 failures) [K4]. Run `sha256sum -c` on it from `store/`; it must report 0 failures at start and at end.

## 0. Why this round (D-29z1051)
- **The regression is due.** `regression-last.json` = 2026-11-02, round 301 [K5]. This planning finished on 2026-11-05 UTC (3 days). Six earlier D-IDs (D-29z1009…D-29z1043) fixed "the first planning on or after 2026-11-05". The speed rule makes this round a REGRESSION round instead of new scope.
- **Round 339 passed and is published** (C PASS, 10 rows, `browserVerified`/`realVerified` true; gate 339 published `99a5912`).
- **Nothing outranks it.** No Critical or High finding is open. The open Mediums are root-only or manual-only.
- **The planned next stage is ready and waits one round.** PERF-DRAG-PREVIEW c4-ii is fully sketched, measured and reviewed in `b-round-339/` (`current-task-c4-ii-draft.md`) and becomes round 341 (§7).
- A Critical, High or Medium finding becomes round 341 instead, as a bounded fix-up, and c4-ii follows it.

## 1. A — no code or doc change
- From `store/`: `git rev-parse HEAD` must be `99a5912…`, and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-340.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer, because there is no change.
- Write `a-round-340.md`: the start HEAD, the status output, and "no change by design (REGRESSION round, D-29z1051)".
- Forbidden:
  - everything in `global_forbidden_files` / `global_forbidden_actions`;
  - the protected files;
  - commit, push, stash, checkout, deploy;
  - dev-server restarts.

## 2. C — scope, method and budget (round 301 §2 applies, with these changes)
- **SOURCE-SCOPE** at start and at end:
  - HEAD = `99a5912`, status empty, K3 11 OK;
  - `sha256sum -c b-round-339/r340-tree-sha256.txt` reports 0 failures.
  
  Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Tooling:**
  - For §3–§4c, reuse round 301's tools (`c-round-301/tools/`, which bundle rounds 258–300).
  - For §4d, use the script of the round each row cites. Where a round kept no script, rebuild the check from that round's row text in `c-round-N.md` and record a lookup.
  - Copy what you use into `c-round-340/tools/`.
  - Adapting a script only for a changed UI fact listed below counts as **"lookup, not deviation"**.
- **Changed UI facts since round 301 (adapt older scripts to these):**
  - **The product name is "CZABA Studio" everywhere** (NAME-AND-HINT-a, round 302): the `/studio-lab` title and h1, the home h2 and mockup, the checkout success step. "Personal Mixdown Studio" and "Studio Lab · Workspace" are retired. An older row that reads a retired string uses the round-302 N-* expectations.
  - **The first successful library add appends a one-time `Drag a clip by its name bar to move it.`** (NAME-AND-HINT-b, round 303). A row that compares the first status after an add expects that suffix once per browser profile.
  - **Self-hosted fonts** (PERF-7, rounds 316/317): no request to `fonts.googleapis.com` / `fonts.gstatic.com`, and 2 CORS preloads on `/studio-lab`.
  - **Drag previews no longer re-render the provider** (PERF-DRAG-PREVIEW a … c3-ii, rounds 325–338). Visible behaviour is unchanged by contract, and any visible difference is a finding.
- **Rule from B's planning (D-29z1057):** never start a second dev server from a tree that symlinks the store's `node_modules`. Vite re-optimizes the shared `node_modules/.vite` under :5173. Every dev row runs on :5173 (the default). If you ever need a second server, serve a production build; never start a second dev server.
- **Store rows and journey rows need the mock API.** At planning, :5199 returned 000 [K6]. Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199, record its PID, and stop only that PID. Mock data is not backend evidence.
- **Order** (after a time-limit stop, resume from `c-round-340/progress.json`):
  1. SOURCE-SCOPE start and claims (only K6 may differ, if you already started the mock);
  2. §4d (rounds 302–339, newest risk first);
  3. §4c (round 301's rows for 259–300);
  4. §4b;
  5. §3;
  6. §4 and §4.S;
  7. §5;
  8. RR-PERF (alone, L38);
  9. RG-SMOKE;
  10. G340-AUTH;
  11. SOURCE-SCOPE end.

  **Write `c-round-340.json` and `c-round-340.md` after every row**, not only at the end.
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only. Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Network and console:** the known cloud noise is `Failed to load cart`, `ERR_CONNECTION_REFUSED` and `ERR_TUNNEL_CONNECTION_FAILED`. Record any other page error with its row.
- **Ableton:** no new behaviour, so no new parity claim. C judges the CZABA requirement only.

## 3. C — Studio phase 1 + T12 V1 rows
Run round 301 §3 (RG-01 … RG-24, RG-T1 … RG-T4B, with its adaptations) at both viewports (RG-03 at 1440 only). The only new adaptation: any RG row that reads the Studio title or h1 uses "CZABA Studio" (round 302).

## 4. C — round 301 §4 / §4.S, §4b and §4c
- **§4, §4.S and §4b:** run them as round 301 did, with the mock API for the store rows. RV-EN scans the same states plus the first-add status (round 303 hint).
- **NO-SHIFT-203 (scope addition 4):** carried again unless you start a reference server. Give the reason.
- **§4c (R301-MASTER … R301-JOURNEY):** run every row as written in round 301. Two exceptions:
  - **R301-PERF3** compares with round 284's screenshots as before.
  - **R301-JOURNEY** step 2 expects the round-303 hint text once.

## 4d. C — items finished in rounds 302–339 (one short check each; both viewports unless stated)
"As in round N" means: reuse that round's C script and threshold. Every `scope_additions` entry of `REGRESSION-ROUND-2026-11-05` is a named row here or in §5/§6 (L6). The scope addition number is shown as **[SA-n]**.

| Row | Item (rounds) | Action and expected |
|---|---|---|
| R340-CROSS-LANE **[SA-20]** | PERF-DRAG-PREVIEW c3-ii (338, source change, published `662ed42`, never regression-checked) | As CROSS-BEHAVIOUR (round 338, `b-round-337/cross-lane-probe.mjs`), **while playing**, at both viewports. Drag a clip by its name bar to the next lane, back, and to the next lane again, then release: <ul><li>ghosts on the target lane while dragging;</li><li>the clip lands on the target lane with one Undo entry `Move to track — <lane>`;</li><li>playback continues;</li><li>`pageErrors` [].</li></ul> The behaviour fields equal `c-round-338/probe-head-<w>.json` after dropping per-commit counts |
| R340-GROUP-MOVE **[SA-20]** | PERF-DRAG-PREVIEW c4-i premise (339; app unchanged) | `node b-round-338/group-probe.mjs http://127.0.0.1:5173 <out> <w> <h>`: <ul><li>both selected clips move together (same delta), and Undo reads "Move (2)";</li><li>the behaviour fields equal `b-round-338/probe/head-<w>.json` after dropping counts, `top`, ids and times.</li></ul> |
| R340-WAVEFORM **[SA-16, SA-17]** | c2b-iii (334) | As WAVEFORM-D, WAVEFORM-D-TRIM-END and VIDEO-WAVE (round 334), per viewport: <ul><li>fade and move a clip;</li><li>change Clip Gain by fader and by typing;</li><li>zoom 2×.</li></ul> The lane and detail peak path `d` follow the round-334 shape rules (fade/move: unchanged; gain: rescaled), with no visual change |
| R340-DETAIL-TEXT **[SA-15]** | c2b-ii (333) | As DETAIL-TEXT (round 333): <ul><li>type in Start, then drag the clip: Start follows the clip;</li><li>type, then change Clip Gain: the typed text is kept.</li></ul> |
| R340-OVERVIEW-METER **[SA-12, SA-14]** | c2b-i (332) | As OVERVIEW-SHOWN and METER-SHOWN (round 332): <ul><li>a fade drag leaves the overview markup unchanged;</li><li>a same-lane move moves the overview bar;</li><li>**sub-check [SA-14]:** press L after a fade preview and after a move preview. The overview `data-extent` and bars equal the values before the preview, as round 332 measured at HEAD.</li></ul> The commit-name half of SA-12 is a dev-probe record (the names are not minified on :5173) |
| R340-SHOWN-READERS **[SA-11]** | c2a (331) | As FADE-SHOWN, TRIM-SHOWN, MOVE-HINT and GROUP-SHOWN (round 331): <ul><li>a fade drag leaves the readout and detail unchanged;</li><li>trim and move readouts follow;</li><li>the lane-move hint shows;</li><li>the group readout shows both clips.</li></ul> |
| R340-PROJECT-END **[SA-9]** | c1 (329/330) | As END-LIVE and VIEWPORT-BOUND (round 330): moving a clip past the project end grows the timeline width and the transport end live, and the release keeps it |
| R340-FADE-STATUS **[SA-9]** | stage b (327/328) | As B-FADE-STATUS, B-FADE-CANCEL, B-FADE-END-STOP, B-FADE-PLAYING and B-VIDEO-FADE (round 328): <ul><li>fade drag status text per move;</li><li>cancel restores;</li><li>end-of-drag text;</li><li>playing does not restart;</li><li>video fade unchanged.</li></ul> B-FADE-EXPORT at 1440 only |
| R340-DRAG-A | stage a (325/326) | As D-TRIM, D-MOVE, D-MIXED, D-ABORT, D-UNDO, D-NOFLASH and D-LOOP (round 325): trim and same-lane move previews, abort restores, one Undo entry, no flash at release. EXPORT at 1440 only (byte-compare as round 325) |
| R340-SELECTION | PERF-8b (322–324) | As S-CLICK, S-EDIT, S-DETAIL, S-TRANSPORT, S-RANGE and S-GROUP (round 324): the selection shows on clips, detail and transport after click, Ctrl+click, Shift+click and select-all. WAV export byte-compare at 1440 only (round 324) |
| R340-RANGE | PERF-8a (318–320) | As R-DRAG, R-ALLTRACKS, R-CLEAR, R-SPACE, R-SPLIT, R-DELETE, R-CUT-TIME, R-LOOP, R-ZOOM, R-DETAIL, R-BG, R-MARQUEE and R-TRANSPORT (round 320; `c-round-320/`). R-EXPORT at 1440 only |
| R340-FONTS | PERF-7 (316/317) | As FONT-NET, FONT-PRELOAD, FONT-CACHE and FONT-PIXEL (round 317): <ul><li>0 requests to the Google font hosts;</li><li>2 CORS preloads on `/studio-lab`;</li><li>the woff2 files are served from `/s/`;</li><li>glyph pixels equal round 317's.</li></ul> FCP is recorded only |
| R340-PEAKS | PERF-5a/5b (312–315) | As PK-LOAD, PK-COLD-START and PK-VIDEO-SOUND (round 315): <ul><li>peaks are computed off the main thread;</li><li>waveforms appear after `Demo collection ready`;</li><li>video sound is unaffected.</li></ul> |
| R340-WORKER-R2 | PERF-4a/d/e (309–311) | As WK-BROWSER-PROXY, WK-GUARD-PROXY and WK-HEAD-CONTROL (round 311; the worker proxy runs locally as in round 311): ETag/304, single-range 206/416, `Expose-Headers`, one R2 get per GET. If the proxy cannot start here, mark the row BLOCKED with the reason; do not FAIL it |
| R340-RESCHEDULE | PERF-COMMIT-RESCHEDULE (307/308) | As CONT-1, CONT-30, ENDED and NO-CHANGE (round 308): an edit during playback continues without a click or restart of unchanged clips (1 clip and 30 clips); ended state; no change when nothing changed |
| R340-PERF3D | PERF-3d (306) | As SCROLL-UPGRADE, VIS-EQUIV and PLAY-SMOKE-306 (round 306) |
| R340-NAME | NAME-AND-HINT-a (302) | As N-TITLE-H1, N-RETIRED-TEXT, N-HOME, N-CHECKOUT, N-NAV, N-NARROW and N-EXPORT-NAME (round 302; mock API for the store pages) |
| R340-HINT **[SA-1]** | NAME-AND-HINT-b (303) | As H-FIRST-ENTER, H-SECOND, H-FIRST-DROP, H-UNDO, H-RELOAD, H-VIDEO-FIRST and H-SR (round 303): the hint shows once per profile, on the first successful add only (Enter or drop); never on video-first; not after reload |
| R340-JOURNEY | L54 (302/303 + 296–300; mock API) | R301-JOURNEY extended with the names: product page → "Try it in the Studio" → `/studio-lab` titled "CZABA Studio" → Enter adds (hint once) → Space ≥ 1 s → Stop → Export WAV non-silent → "View in store" new tab with `opener` null. Screenshot per step |

## 5. C — parked rows and observations (record only unless stated)
| Row | Source | Action | Expected / how B rules it |
|---|---|---|---|
| Round 301 §5 rows (RP-METRO-MUTE, RP-SPACE-EMPTY, RP-VIDEO-MARKER, RP-NARROW, RP-MENU-SHEET, RP-LINK-NATIVE-MENU, RP-LINK-DRAG) | as round 301 | as round 301 | as round 301 |
| RP-C301-01 **[SA-3]** | C-R301-01 (deferred Low) | Tab out of a pointer-opened grid menu with no prior focus | Record where focus lands. Record only |
| RP-C318-06 **[SA-5]** | C-R318-06 (D-29z870) | At 1280×720 and 1440×900, follow the repro in `c-round-318.md`. Before Ctrl+E, log the time selection, the selected clip and the insert marker; press Ctrl+E; log which clips were cut and where | Classify the severity with the root cause (a split outside the selection, or of an unselected clip, is Medium: data change). If it does not reproduce, say so with the logs |
| RP-FOLD-SELECTION **[SA-6]** | CAND-R323-FOLD-CLEARS-SELECTION (D-29z909) | Select a clip, fold its lane (the lane fold button), unfold, and record whether the clip selection survives | Record. The Live 12 reference question is written for Saba in `c-round-340.md` (what Live does is not settled here; no parity claim) |
| RP-NOBPM-RULER **[SA-7]** | SIG-R327-NOBPM-RULER-CLICK (D-29z941) | With no BPM asset in the project (seconds grid), click the bars-ruler strip | Compare with the SABA-B-11a contract (`tasks/round-*.md` of 11a, policy: no invented 120 BPM; the min:sec ruler stays). A contract break is Medium |
| RP-SAME-TEXT-RACE **[SA-8]** | A-R328-REVIEW-SAME-TEXT-RACE (D-29z948) | A timer `setStatus(sameText)` and a pointermove in one frame (as A-R328 describes; a page script may schedule both in one rAF) | Record whether the status line flickers or re-announces. Record only, Low unless a lost status |
| RP-GATE328-S1 **[SA-10]** | GATE328-S1 (D-29z953) | An updater-only `setStatus` during a pending collection settle mid fade drag | Record whether one frame shows text from the old committed status. Record only; Low unless it reproduces at Medium |
| RP-C331-01 **[SA-13]** | C-R331-01 (deferred Low) | Trim-left centre under the fade handle at 1280×720, with the panel open | Record only |
| SA-19 (note) | RETRO 336 screen candidates | Not regression rows (`awaiting_user`) | Carried: not run |

## 6. C — perf, smoke, auth guard
- **RR-PERF [SA-2, SA-18, SA-20]:**
  - Run `npm run test:perf` **alone**, after §5 (L38). An overlapped run is environment-invalid and uses one replacement attempt.
  - **PASS:** rc 0, 3/3 specs, every budget row passes its contract, `complete` true, 0 aborts and 0 page errors.
  - A failing budget on a valid isolated run is a finding: Medium for fader, drag or playback budgets, Low otherwise.
  - **Named rows:**
    - `interact.harness.drag-lane-live` = 1 [SA-18];
    - `interact.harness.drag-group-live` = 1 with the c4-i group rows present [SA-20]. 219 interactions rows, 45 asserted [K7].
  - **Comparison:**
    - `latest-interactions.json` vs `c-round-339/perf-results/latest-interactions.json`, with `python3 -I b-round-329/perf-rowcmp.py`. HEAD is the published commit of C's round-339 run ([K1], [K2]; `perf/` last changed at `99a5912` [K7]), so the expected result is 0 DIFF; a DIFF is reported with its rows.
    - `latest.json` and `latest-resources.json` vs `c-round-301/perf/` (D-29z783), with `python3 -I b-round-224/scripts/equiv-check-b2.py <oracle> <new>`. This is report only; B rules the deltas.
- **RG-SMOKE:** run `npm run test:e2e:smoke` in `store/` after RR-PERF, alone.
- **G340-AUTH:** as G339-AUTH (`c-round-339/g339-auth.cjs`), both viewports:
  - `/studio-lab` anonymous shows the workspace and the demo badge, with `auth_user` null;
  - `/studio/middle-east` shows "Sign in required", with 0 `audio[src]`;
  - `/api/studio-token`: no header → 401; fake Bearer → 403 with the mock, else 500; never 200 and no token in any body; bare → 400 (record).
  - SRW-21 stays BLOCKED (`deferred_user`).
- **Blocked, as in round 301** (backend unavailable in cloud): list them under `blocked`. They do not make `browserVerified` false.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome and `npm run verify`.

## 7. Outcome, fixed in advance (D-29z1058)
| C result | B at the 340 → 341 planning |
|---|---|
| Every row PASS, smoke PASS | <ul><li>Set `regression-last.json` = `{"date": <C's completion date>, "round": 340}`.</li><li>Round 341 = **PERF-DRAG-PREVIEW c4-ii** from `b-round-339/current-task-c4-ii-draft.md`, with its carry-forward note applied (round numbers and K1).</li></ul> |
| Any Critical, High or Medium finding, including a regression | <ul><li>Round 341 = a bounded fix-up (≤ 3 related bugs, Critical first). C re-runs the failed rows.</li><li>`regression-last.json` is still updated when every row ran.</li><li>c4-ii follows. If the fix moves HEAD, it is re-checked first: patches `--check`, the 23 suites, and one perf run alone.</li></ul> |
| Low findings only | They go to `deferred_low_polish`. Otherwise the same as the all-PASS row |
| Rows not run (time limit), or inconclusive past the budget | <ul><li>The missing rows continue first in round 341, from `progress.json`.</li><li>`regression-last.json` is not updated until every row has run.</li></ul> |
| A browser row that could run here did not run | `browserVerified=false`, and B re-plans that half |

**Item status:** a failed row does not change its item's status by itself. It opens a finding linked to the item.

## 8. Neighbour risk
| Risk | Check |
|---|---|
| A probe, the mock or a scratch server writes into `store/` or disturbs :5173 | SOURCE-SCOPE and `sha256sum -c`, at start and at end; the D-29z1057 rule (§2) |
| Perf or smoke disturbs the :5173 tabs | The serial order in §2 |
| The job time limit | Incremental reports and `progress.json`; §4d runs first |
| False FAILs from pre-302 scripts (retired names, the first-add hint) | The §2 "Changed UI facts"; record "lookup, not deviation" |
| Mock product data taken as backend evidence | R340-NAME, R340-JOURNEY and the store rows prove the client path only |

## 9. Deliverables
- **A:** `a-round-340.md` (baseline only).
- **C:**
  - `c-round-340.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `observations`, `invalidRuns`, `lookups`, `carried`, plus the L57 harness fields;
  - `c-round-340.md`;
  - evidence under `c-round-340/{tools,out,shots}`.
- **Every bug gets:** an id `C-R340-NN`, a severity, the item, the steps, the evidence path, and "regression yes/no" with the round of its last pass.

## 10. Root notes
- No source change is expected. Nothing is published when no source changed; the loop-state commit records the sweep.
- **Frontend-architect checkpoint:** `ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE` is planned for the close of PERF-DRAG-PREVIEW (after c5). See `b-round-339.md` §5. It is not due now.
- **Still open for root:**
  - checkpoint D-29z915;
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS.
