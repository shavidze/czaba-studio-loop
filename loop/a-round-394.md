# A round 394: PERF-13c-ii-a (stream stall, external pause, sync throw)

## STOP: needs a B ruling on A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING (Medium, origin: A's code-reviewer)

**What it is:** a same-URL seek (a wave click) made before the element reaches `playing` turns the stall watchdog off for good. A HOLD stream then stays on `Stop` with no fallback, which is the REV-B393-M1-STALL symptom again, reached by an ordinary click.

**How it happens** (`preview.client.ts`, seek branch and `armStall`):
1. The stream starts at 0, so `armedAt` = 0.
2. The user clicks the wave. The seek branch sets `currentTime = 5`. At `readyState` HAVE_NOTHING, the HTML spec stores this as the default playback start position, and the getter returns it. No `seeking` or `waiting` event fires.
3. At 8 s, the callback sees `currentTime` (5) ≠ `armedAt` (0). The "moved time wins" rule applies, so nothing happens, and `cancelStall` becomes null.
4. `progress` only restarts an armed timer, so it cannot re-arm one. B's HOLD event order (`play`, `waiting`, `loadstart`, `stalled`) is all over before the click, so no later `waiting` re-arms it either.

**Measurement:** this was checked in jsdom only, on the scratch copy `/tmp/a394-scratch` (a probe row that is not in `store/`). Log: `a-round-394/probe-seek-before-playing.log`, rc 0. After start 0, a same-URL seek to 5 and `fire()`:
- `onStreamError` is called 0 times;
- 0 timers are pending, and still 0 after `progress`;
- the offset reads 5.

I ran no browser (the task forbids it). The browser half rests on HTML-spec reasoning only, so it is **unverified in a browser**.

**Why no C row catches it:**
- R1 never clicks the wave.
- R3 clicks after 10 s of `playing`, when the watchdog is already off by design.

**Options for B** (I implemented neither, per L11):
- **(a)** The reviewer's fix: after a successful same-URL seek, restart only a timer that is already armed, re-reading `armedAt` (the same rule as `progress`). Add a row PS25: start 0, seek 5 with no `playing`, fire → `onStreamError(5)`, with a mutant. This changes §1's "not armed by: a same-URL seek" line, and the K8 claim wording or counts.
- **(b)** Accept it and record it as a known gap next to the §8 trickle gap in doc 252.

Apart from this, the work is complete and every A check is green. The round is not closable until B rules.

## Changed files (exactly the 3 grants; `git status --short` shows 3 × M)
- `app/lib/arrangement/preview.client.ts`
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx`
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`

## Sketch
- `b-round-393/sketch-394.patch.txt`: sha256 `723a6d9e42b1aaa0…` verified, applied with `git apply` (rc 0).
- **No deviation from the sketch** in the source or the tests. I compared it by eye against §1 items 1–3 and the L49 side-effect table:
  - `return` and `armStall` sit inside the `try`;
  - `progress` restarts only an armed timer;
  - `detach` disarms the timer and removes 6 listeners;
  - the seek `catch` calls `active.fail()`.

## Commands (logs under `a-round-394/`)

| Command | rc | Log |
|---|---|---|
| claims script at start, compared with `claims-394-planning-output.txt` | 0, diff empty | `claims-start.txt` |
| `npm run typecheck` | 0 | `typecheck.log` |
| `npm run lint` | 0 | `lint.log` |
| `npx biome check` on the 2 code paths | 0 | `biome-scoped.log` |
| `npx vitest run` on the covering set (14 files from `a-round-393/covering-files.txt`) | 0: 14 files, 256 tests | `covering.log` |
| mutants (B's `run.py` retargeted to `/tmp/a394-scratch`) | 12/12 red, pristine rc 0 | `mutants/summary.txt`, `mutants/*.log`, `mutants/run.py` |
| claims script at end, compared with `claims-394-on-sketch.txt` | 0 | `claims-end.txt` |
| `sha256sum -c b-round-393/r394-frozen-sha256.txt` | 0 failures | (inline) |

- **Covering-set timing:** the slowest test is LRS4 at 2282 ms, under a 15 s describe timeout (15 %). PS16–PS24 take 0–4 ms each.
- **Claims at the end:** only K2 differs (`1091b9e 3` against the sketch's `a5b63b8 2`), plus the K11 l.4 string, which is now the §3 string. K8, K9 (no provider change), K10 (23, PS24, 3 describes, demo-PS15 1) and K12 equal the sketch output.

**Mutants:** each row's named mutant is red.

| Mutant | Red rows |
|---|---|
| NO-WATCHDOG | PS16, PS17, PS19, PS24 |
| PLAYING-NOT-DISARM | PS17, PS19 |
| NO-WAITING-REARM | PS17 |
| PROGRESS-ARMS-ALWAYS | PS17 |
| NO-PROGRESS-CHECK | PS18 |
| STALL-SURVIVES-STOP | PS19, PS22 |
| PAUSE-IGNORED | PS20 |
| PAUSE-NO-ENDED-GUARD | PS21 |
| PAUSE-NO-ERROR-GUARD | PS21 |
| SYNC-THROW-START | PS22 |
| SYNC-THROW-SEEK | PS23 |
| DEFAULT-DELAY | PS16, PS24 |

## Doc 252
- **l.4:** `**სტატუსი:** In Progress (stage 2 of 3; C round 394 PASS)`.
- **Title:** now `PERF-13c: … (rounds 393–394)`.
- **Headings:** 7 `## ` headings, none added. The stage-2 parts sit under `###` subsections and bullets.
- **Content:**
  - the watchdog rule, the 8 s choice and the false-positive cost;
  - the pause guards and the jsdom `undefined` note;
  - the sync-throw route;
  - the NotAllowedError ruling;
  - the premise and sketch numbers with their 3 files;
  - the §8 trickle gap;
  - a TODO with stage 3 = 13c-ii-b.
- **Cited ids:** only PS1–PS24 and MU-394-*. R1–R7 are named explicitly as C browser rows.
- **Changed after the review:** two lines of the stage-2 mermaid state diagram, which the reviewer showed misdescribed the code.
  1. An expiry with moved time now goes to `Unarmed`; only `waiting` re-arms from there.
  2. A `pause` can now end the preview from `Armed`, not only from `Playing`.
- Code is unchanged since the review, so no second review pass is needed. The new STOP gap is **not** written into the doc; B rules on it first.

## Code-reviewer (the real `code-reviewer` subagent, 3 files; score 7/10)
- **Medium:** the STOP above.
- **Low, PS22:** §5 asks for "src removed; offset null" in both cases. Two asserts are missing: `throwingTime.hasAttribute('src') === false` in the first case, and `second.getLibraryPreviewOffset()` is null in the second. I did not add them, because the tree stays at the dispatched sketch under the STOP. B may add them with the ruling.
- **Low, PS21(a):** it cannot catch a listener that `detach` failed to remove, because the `active === preview` guard already blocks it. No row asserts that the 4 new listeners are removed. K8 counts the removals.
- **Low, record only:** a synchronous throw calls `onStreamError` re-entrantly inside the provider's `startLibraryPreview`. The provider returns right after that call, so it is safe, but no provider-level test covers the path.
- **Re-entrancy cases the reviewer traced and found sound:** the timer after a stop; the `pause` from our own `pause()`/`load()`; a throw after the timer was armed; a double `handleError`.
- **Architecture note (signal for B, not acted on):** `preview.client.ts` now holds 6 listeners, a timer and 3 handlers in one closure. The reviewer's advice is to keep it for now and consider a stream-watchdog unit in the preview-controller extraction already queued for the checkpoint after 13c-ii-b.

## Known gaps
- A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING (the STOP above).
- The §8 trickle gap (recorded in doc 252).
- The browser behaviour is unverified by A (no browser by task).

## Exact next C checks (after B's ruling)
- SOURCE-SCOPE:
  - claims at start must equal `a-round-394/claims-end.txt` (if nothing else changes);
  - `git status` shows only the 3 grants;
  - the frozen and protected manifests pass.
- R1–R7, PERF-RES, AUTH and DOC-252 as in §6.
- Add a wave click during HOLD as a C probe if B rules (a) or wants the gap measured in a browser.
- jsdom-only rows: PS21(b), PS22 and PS23, relying on `a-round-394/mutants/summary.txt`.

## Scope completed
- §3 items 1–3 are implemented as B's sketch, and the A checks are all green.
- No B acceptance row is marked as passed here. The C rows are C's, and the round is held by the STOP.
