# Round 386: decode-resync error handling. Three bugs in `ensureDecoded` / `startLibraryPreview` (GATE384-M1, A-R383-REVIEW-L1, GATE384-L2)

**Planned by:** B, at the round 385 → 386 planning, 2026-11-07 (`b-round-385.md`).

**Decisions** (`backlog.json` v352 → v353, `decisions_log_b`):
- **D-29z1293:** round 385 (RETRO 385) is accepted on C's evidence: C PASS, 12 rows, `browserVerified` true, 0 bugs (`c-round-385.json`). Gate 385 was `skipped` (no source change), so the **baseline stays `7295618`**.
- **D-29z1294:** **scope.** Three tightly related bugs in the same two functions:
  - **GATE384-M1** (Medium): unhandled rejection after a post-decode resync throws;
  - **A-R383-REVIEW-L1** (Low): a stale `ensureDecoded` decodes under the new collection's controller;
  - **GATE384-L2** (Low): a deferred preview stops the timeline at click time, even when its decode then fails.

  GATE384-L4 (Low, load-effect identity) gets no code change. It closes on this round's guard row EV14 when C passes.
- **D-29z1295:** **the contract after a throw** (the smallest honest behaviour; rationale in §1):
  - when the resync after a successful decode throws, playback **stops**;
  - the status line shows `studioPlaybackStrings.scheduleFailed`;
  - the decoded buffer stays, and the source stays `ready`;
  - the next successful Play replaces the text with "Playing from …".
- **D-29z1296:** the **load path** (HEAD l.4316) and the **video-audio path** (HEAD l.2848) have the same unguarded call [K3]. All three call sites go through one helper (L7: close the same root cause together). The sketch reviewer `tech-lead` raised the video path as TL-R385-M1.
- **D-29z1297:** **GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK** (Medium, pre-existing, from `tech-lead`) is ruled out of this round and scheduled as its own task. The problem: `applySchedule` is not all-or-nothing, so a throw partway through `startPlan` can leave already-started sources sounding. Accepted by the delta reviewer with that risk (`b-round-385/sketch-review.md`). TL-R385-L4, L5, L6 and L8 → `deferred_low_polish`.

- **D-29z1298:** the order after this round (§6). **D-29z1299:** the pre-existing direct-preview stop goes to Saba once as Q-PREVIEW-STOPS-TRANSPORT (L44). It is not scheduled.

**Why this round.** Gate 384's reviewer rated GATE384-M1 Medium. Under the bug gate, Mediums go before new PERF scope. B reproduced it in the real browser at HEAD [K23]:
- a forced throw in the post-decode resync gives **1 `pageerror` ("injected schedule failure")**;
- the timeline keeps playing the old graph, so the newly placed clip is silent;
- the status does not change.

**What the user notices:**
- **Normally: nothing.**
- **Preview while playing.** Clicking Preview on a library sound that must be decoded again while the timeline plays now keeps the timeline playing until that preview actually starts. If the decode fails, the timeline keeps playing and the existing failure text appears. Before, the timeline stopped at the click and nothing played.
- **Resync failure.** In the rare case that scheduling fails after a decode, playback stops with a clear status instead of continuing silently.

**Read first:**
- `lessons.md`: A reads 11, 12, 23, 26, 28, 31, 49, 51 and 58. C also reads 38, 56, 57, 59 and 60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`.
- `b-round-385/sketch-review.md`: findings, rulings, the ordering matrix and B's browser pre-check.

**Not applicable:**
- **Reference-first and `product-designer`:** this is a bug round with no new feature. Live has no documented equivalent of an internal scheduling failure; no reference was searched.
- **YouTube request:** not applicable.
- **Screen budget (L39):** no new persistent element. `scheduleFailed` is an error-only text in the existing status line.

**Reference and Deviations (L2 only; M1 and L1 have no user-facing reference).**
- **Source:** Live 12 manual, *Working with the Browser*, "Previewing Files" (§4.9 on B's 2026-11-07 fetch; §5.9 in the 2026-10-24 capture of `user-review/ableton-review.md`), https://www.ableton.com/en/live-manual/12/working-with-the-browser/.
- **Confirmed fact:** "By default, the Raw button is deactivated, which allows Live to preview files at the beginning of the next bar when transport is running". A preview does not stop the Arrangement transport.
- **CZABA now:** a **direct** preview (buffer already decoded) stops timeline playback before it starts (l.1761) [K24]. That is a pre-existing difference, and this round does not touch it. It goes to Saba once as **Q-PREVIEW-STOPS-TRANSPORT** (L44; `user-review/questions-preview-transport.md`) and stays `awaiting_user`.
- **This round:** the **deferred** path no longer stops at the click. During the decode it behaves like Live, and the final stop when the preview starts equals the direct path.

## Baseline
- **HEAD:** `7295618`, 0 status lines [K1, K2].
- **Post-decode resync**, three direct `syncPlayback(present, undefined, true)` calls [K3]:
  - in `ensureDecoded`'s fulfilled handler, l.1442. This is the two-argument `.then`: a throw inside `onFulfilled` is not routed to `onRejected` [K3];
  - in video audio, l.2848 [K3];
  - in the load effect, l.4316 [K3].
- **The three `void` call sites** [K4]: l.927, l.1646 and l.1727.
- **Deferred-preview click-time stop** at l.1722–1724 [K5].
- **`collectionControllerRef`** is `AbortController | null` (l.819). It is set at l.4255 and compared at l.4260 [K6].
- **`startPlaybackAt`'s status updater** replaces only `'stopped'`-kind text (l.1659–1663) [K7].
- **`scheduleFailed`:** 0 hits in `app` [K8].
- **Existing rows:** 15 `it('EV` and 1 `it('PW`; the new names have 0 hits [K9]. The ST10 literal map lists `nothingToPlay` at `strings.test.ts` l.673 [K10]. `applySchedule` is imported in the context (l.63) [K11].
- **Timeout headroom (L31), at gate 384** [K12]:
  - eviction file: 15 tests, 1522 ms;
  - `peaks-worker-video`: 1 test, 89 ms;
  - `strings.test.ts`: 64 tests, 171 ms.

  No per-test timeout is declared, so the vitest default applies. All are far below 50 %.
- **Manifests:**
  - frozen: `b-round-385/r386-frozen-sha256.txt`, 1,275 entries (every tracked and untracked file except the 6 grants), rc 0 [K16];
  - protected: `b-round-318/protected-sha256.txt`, rc 0 [K15].
- **Sketch:** `b-round-385/sketch-386.patch.txt`, sha256 `1cada6c7…a01ae` [K13]. It applies cleanly to HEAD [K14].

## 1. Behaviour that must not change
- **EV1–EV10 and PW19:** the round-382/383 contracts stay unchanged. EV1–EV10 are every existing eviction row:
  - eviction;
  - single re-decode;
  - Play refusal during a decode;
  - join-while-playing;
  - Undo/Redo;
  - export pins (complete, cancel, replace);
  - failure text;
  - preview and supersede;
  - collection reset with `deleteMany`;
  - peaks arrival.
- **Unchanged code paths:**
  - a decode that **rejects** still sets the source to `error` with the existing text;
  - an export whose decode **fails** still creates no file;
  - a **direct** preview (buffer already decoded) still stops timeline playback before it starts (l.1761) [K24];
  - Play during a decode is still refused with the existing text (GATE384-L3 stays a deferred product question).
- **Purchase protection:** unchanged. No protected file is touched (K15).
- **Why stop rather than continue (D-29z1295).** B measured HEAD: the throw happens in `applySchedule` before the handle swap, so the old graph keeps playing **without the new clip**. Continuing would make the mix silently wrong; stopping with a status is the honest, smallest state. The status text is an existing-line error message, not a new persistent element.

## 2. What A changes (grants: `b-round-385/grants-386.txt`, 6 paths)
**Apply the reviewed sketch verbatim:** from `store/`, run `git apply ../tmp/studio-real-loop/b-round-385/sketch-386.patch.txt`. Reviewed = dispatched (L58): A changes no line of those five files beyond the patch. If a check fails, A writes **STOP** (L11) and does not improvise. The patch contains:
1. **`app/contexts/ArrangementContext.tsx`:**
   - **`resyncAfterDecode(sourceId)`.** A `useCallback` with deps `[setStatus, stopPlayback, syncPlayback]`. It returns if no clip uses `sourceId`. Otherwise it calls `syncPlayback(present, undefined, true)` in `try`; the `catch` calls `stopPlayback()` and `setStatus(studioPlaybackStrings.scheduleFailed)`.
   - **Three call sites use the helper:** `ensureDecoded` (after `decodedBuffers.has(id)`), video audio and the load effect. The deps of `ensureDecoded`, `decodeVideoSourceAudio` and the load effect swap `syncPlayback` for `resyncAfterDecode`.
   - **Owner guard (L1).** `collectionControllerRef` holds `{ collection, controller }`. `ensureDecoded` uses the controller only when `owner.collection === collection`; otherwise it decodes nothing. The reset compares `.controller`.
   - **L2.** The deferred branch of `startLibraryPreview` no longer calls `stopPlayback()` at click time.
   - **Replay status.** The `startPlaybackAt` status updater also replaces the text when it equals `scheduleFailed`.
2. **`app/lib/arrangement/strings.ts`:** `studioPlaybackStrings.scheduleFailed = 'Playback stopped — the audio could not be scheduled. Press Play to try again.'`
3. **`app/lib/arrangement/__tests__/strings.test.ts`:** the ST10 expected map gains that literal (an L23 grant: ST10 pins every plain string) [K10].
4. **`app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`:**
   - `applySchedule` spied through the existing `graph.client` mock, with `mockReset()` in `beforeEach`;
   - **EV11** ×2: a throw while playing → 0 unhandled rejections, stopped, status, `ready`, buffer kept, and replay "Playing from"; an export joined to the same decode still renders;
   - **EV12:** a stale preview after a collection change → no load, no entry;
   - **EV13** ×2: the timeline keeps playing during the preview decode; a failed decode keeps it playing and shows the failure text;
   - **EV14:** a same-collection re-render → no reload, no `deleteMany`;
   - **EV15:** a load-path throw.
5. **`app/lib/arrangement/__tests__/peaks-worker-video.test.tsx`:** **PW20**, a video-audio resync throw → no window error, stopped, status, audio `ready`. The applied throw is proved by the call count.
6. **New doc `docs/implementation/2026/quarter-IV/249-decode-resync-errors.md`** (number free [K19]), in Georgian, with the TEMPLATE headings in order (L26):
   - l.4 byte for byte: `**სტატუსი:** Completed (C round 386 PASS)` (L28);
   - Problem → Solution for M1, L1 and L2, plus the video and load paths;
   - the D-29z1295 contract;
   - the follow-up GATE-B385-M2;
   - each EV/PW/MU id it names exists.

   Doc 248 is not edited.

## 3. A: checks (speed rules)
- **Static checks:** `npm run typecheck` and `npm run lint`.
- **Tests:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-385/covering-386-full.txt)` (34 files). On the sketch, B's run had 34 files and 633 tests passing (`covering-386-full-sketch.log`). Paste the totals.
- **Mutants:** run `TREE=<abs cp -a copy of store> OUT=<abs a-round-386/mutants> bash ../tmp/studio-real-loop/b-round-385/mutants/run-mutants-386.sh` on a copy, never on `store/`. All 7 mutants must be red on their rows (the table in `sketch-review.md`), and `restored` must be printed.
- **No full suite, no perf run, no browser run is required of A.**
- **`code-reviewer`:** required (3+ files). Paste its Architecture note verbatim.
  - A Medium+ that the sketch review did not rule is a **STOP**: B rules on it. The sketch-review findings are already ruled.

**STOP (L11):** in any of these cases A writes STOP at the top of `a-round-386.md` and changes nothing else:
- `r386-frozen` is not rc 0 at the start;
- `git apply` fails;
- a covering test fails.

## 4. C: what to verify
C writes `c-round-386.md` and `c-round-386.json` as it goes, with **all L57 fields**:
- `assertsSpecified` = the EV11–EV15/PW20 rows;
- `mutantsRecorded` = 7;
- `mutantRedOnSketch` = "7/7 (b-round-385/mutants)";
- write `progress.json` after every row (L59);
- copies and destructive commands stay under `c-round-386/` (L60);
- browser jobs run alone (L38).

**Browser scripts:** B's `b-round-385/probe/resync-throw.mjs` and `preview-while-playing.mjs`. Run them **in place**, with absolute output paths under `c-round-386/`: they import `../../c-round-382/lib.mjs` relative to their own folder. Do not edit them; BROWSER-JOIN has its own script, `join-while-playing.mjs`. The clock (the first `mm:ss.mmm` on the page) is the playing signal. The transport Stop is always rendered, so its count is not a signal.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At start and end: `git status --short --untracked-files=all`; `sha256sum -c --quiet b-round-385/r386-frozen-sha256.txt` and the protected manifest, from `store/` | Status lines are exactly the 5 patched files plus the new doc 249; both checks rc 0 |
| **CLAIMS** | `bash b-round-385/claims-386.sh`, compared with `b-round-385/claims-386-output.txt`; plus L29's task grep | Differences only where the patch changes lines. K3: 1 call inside the helper. K4: shifted lines. K5: the block is gone. K6: new type. K7: new clause. K8: hits now present. K9: 22 EV `it`s, 2 PW, 8 new-name hits (EV11 ×2, EV12, EV13 ×2, EV14, EV15, PW20). K14: `--check` fails because the patch is applied (expected; `git apply --check -R` passes). K16: rc 0. No `MISSING` |
| **PATCH-EQUAL** | For the 5 files: `diff -u --label a/$f --label b/$f <(git show 7295618:$f) $f` (pinned to the baseline, not HEAD, in case root lands a pre-round commit), concatenated in grants order, then `cmp` with `sketch-386.patch.txt` | Identical (reviewed = dispatched) |
| **UNIT** | The 34 covering files | All pass; EV11–EV15 and PW20 present by name |
| **MUTANTS** | `run-mutants-386.sh` on a `cp -a` copy of store, with `OUT` under `c-round-386/` | All 7 red on the named rows; `restored` printed; the copy only |
| **BROWSER-M1** (1440×900, 1280×720) | `resync-throw.mjs http://127.0.0.1:5173 <out> [w h]` | `thrown` 1; `errors` []; the clock is frozen after the throw (`clockAfter[0] === clockAfter[1]`); `statusHasScheduleFailed` true; after Play, `replayStatusPlayingFrom` true and `replayStatusStillFailed` false. Screenshot. B's sketch values are in `probe/sketch-*.json` |
| **BROWSER-M1-MUTANT** (1440×900) | MU-386-NO-CATCH applied (`mutate.py <copy> MU-386-NO-CATCH`) on a `cp -a` copy, with its own dev server on :5174 and its own Vite `cacheDir` (L38); then the same script | `record — not run on sketch: B ran the HEAD control instead (probe/head-*.json: 1 pageerror, clock running)`. Expected: ≥ 1 `pageerror` "injected schedule failure". Stop the server afterwards |
| **BROWSER-L2-OK** (both viewports) | `preview-while-playing.mjs <base> <out> ok [w h]` | `clockDuringDecode[1] > [0]` (the timeline plays during the decode); `previewStarted` true; `clockAfterSettle` frozen; `errors` []. The first reads are 150 ms apart and B measured the decode at about 360 ms (01.050 → stop at 01.413). If a run's decode settles inside that window (both reads equal and `previewStarted` true already), it is environment-invalid and uses the sync-measurement replacement budget (2 extra attempts), not a FAIL |
| **BROWSER-L2-FAIL** (both viewports) | `… fail [w h]` (`decodeAudioData` rejects once) | `decodeFailed` 1; `previewStarted` false; `clockAfterSettle[1] > [0]` (the timeline keeps playing); `failText` = "“Middle East — public preview” failed to load — details are in the library."; `errors` [] |
| **BROWSER-JOIN** (both viewports) | `b-round-385/probe/join-while-playing.mjs <base> <abs out> [w h]`, in place | `longSourceStarted` = [101.35] (Middle East re-decoded and started in the live `AudioContext`); `clockAfterJoin[1] > [0]`; `errors` []. B's HEAD values: `probe/join-head-1440.json` and `join-head-1280.json` ([101.35], 01.422 → 02.211, []). Neighbour regression for EV3; the patch does not change this path |
| **G386-AUTH** (both viewports) | Fresh anonymous context (the G385 recipe; L29: valid `product`/`file` params) | `/studio-lab` workspace with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=stem.mp3` without Authorization → 401, no token. Fake bearer → `blocked` (backend) |
| **STUDIO-SMOKE** (both viewports) | Enter adds a clip, Play for 1.5 s, Stop, Export dialog opens, Esc closes | As in round 385 |
| **DOCS** | Doc 249 | l.4 byte for byte; TEMPLATE headings in order; every EV/PW/MU id it names exists; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 hits |

**`browserVerified`:** true only if BROWSER-M1, BROWSER-L2-OK, BROWSER-L2-FAIL, BROWSER-JOIN, G386-AUTH and STUDIO-SMOKE ran at both viewports in this round.

**Verdict:**
- **PASS:** every row other than BROWSER-M1-MUTANT, which is `record`, passes.
- **Gate rows** (verify, full suite, build) are not claimed.

## 5. Neighbour risk
- **Status clobber (L51).** `scheduleFailed` can follow "… added to the Music track …" or a settled collection status (the load path settles first, then the resync, so `scheduleFailed` wins; EV15). A later "N failed" settle can replace it (TL-R385-L4, deferred: both are true).
- **Effect identity (GATE384-L4).** The load effect's deps change. EV14, together with MU-386-UNSTABLE-RESYNC, proves that it does not re-run on a same-collection render.
- **Preview + resync** (TL-R385-L5, deferred). A preview of a placed, evicted source while playing rebuilds once, then stops for the preview.
- **Partial schedule** (GATE-B385-M2, the next Medium task). Out of scope; do not touch `graph.client.ts`.

## 6. Order after this round (D-29z1298)
1. **REGRESSION-2026-11-08,** if the next planning is on or after 2026-11-08 (it is due then). Otherwise GATE-B385-M2 comes first and the regression follows.
2. **GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK** (Medium; `graph.client.ts` all-or-nothing, plus a repeated throw on Play leaving `isPlaying` true).
3. **PERF-13b-ii,** then PERF-13c, PERF-13d, PERF-14 and PERF-15.
   - PERF-11c-iii-d/e stay held for Saba (questions-arch-leaf-plumbing). If there is no answer by RETRO 400, the default is SYS-R385-LEAF-ACTIONS-CONTEXT.
4. **SYS-R2-FAKE-FIDELITY** and **SYS-CLOCK-DETERMINISM.**
5. **STEM-LANES,** then SYS-1…3, then STORE-2b…5 (direction gate).
6. **REVIEW-RECOMMENDATIONS,** then T12-ADVANCED.
7. **The phase-2 entries,** under the skip rule.

## 7. Claims
Run `bash b-round-385/claims-386.sh` from the loop root. The output at planning is in `b-round-385/claims-386-output.txt` (0 `MISSING`).
- **K23** (the HEAD browser reproduction) is the files `b-round-385/probe/head-1440.json` and `head-1280.json` (checked with `test -f` in K17).
- **K17** also covers every cited `b-round-385/` artifact. **K18** checks the mutant logs; **K20–K22** read doc 248 l.4 and the HEAD deps blocks [K20, K21, K22]; **K24** reads the direct-preview stop at l.1761 [K24].
