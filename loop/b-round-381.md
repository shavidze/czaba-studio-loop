# B round 381 → 382 planning

**Date:** 2026-11-07 (07:15 UTC) · **Backlog:** v347 → v348 · **Decisions:** D-29z1272 … D-29z1275 · **Next task:** `current-task.md` (round 382, PERF-13b-i) · **Archive:** `tasks/round-381.md` (byte-equal copy of the round-381 task, checked with `cmp`) · **Baseline HEAD:** `5745526` (`gates/gate-round-381.json` status `published`; store HEAD = `5745526`, tree clean).

## 1. Round 381 acceptance (D-29z1272)
Accepted from independent evidence only:
- **C PASS** (`c-round-381.json`): 8 rows passed and 0 bugs, with `browserVerified` and `realVerified` both true.
  - PERF-RES ran on the production build. The new rows read: PCM 124 MiB, count 9, decode 92.2 MiB, after-export delta 0.
  - Existing rows: identical, including export bytes. The wall-ms drift matches a HEAD control run on the same machine.
  - PCM probe: run at both viewports ×3.
  - Mutants: 3/3 red.
  - Auth guard: checked at both viewports.
- **Blocked:** the fake-bearer 500 is listed under `blocked` (backend unavailable). The gate rows are not claimed.
- **Gate 381:** `published`, commit `5745526` on both remotes. The verify log ends with a green build.

PERF-13a is done.

## 2. Gate 381 review and A/C notes (D-29z1273)
| Source | Item | Ruling |
|---|---|---|
| Gate finding 1 | The registry is installed in every pass | `GATE381-L1-REGISTRY-EVERY-PASS`, fixed inside round 382 §2.6, because the round owns those lines |
| Gate finding 2 | `instanceof` vs the subclass | `GATE381-L2-INSTANCEOF-SUBCLASS`, deferred Low (0 app hits today) |
| Gate finding 3 | The listbox count could be virtualized | `GATE381-L3-LISTBOX-COUNT`, deferred Low |
| Gate finding 4 | Probe left set on an error path | Info, closed (the page is discarded) |
| code-reviewer M1 | Existing rows may shift | Closed by C's evidence: every existing row is identical |
| code-reviewer M2 | `perf/lib` tests are outside the gate | = GATE304-M1 (root). Unchanged |
| code-reviewer M3 | No dropped-probe guard | Folded into round 382 §2.5 |
| A L-drift and `perfLibraryListLabel` | Spec sequence text; label import | `A-R381-SPEC-SEQUENCE-TEXT`, deferred Low |
| Architecture notes | Record-probe accretion; count guard vs eviction | `SIG-R381-RESOURCES-RECORD-PROBES` (keep) and `SIG-R381-COUNT-GUARD-VS-EVICTION` (scheduled in round 382) |

No Critical, High or Medium finding was opened. C reported no bugs, so no C bug comes before new scope.

## 3. Next round choice (D-29z1274, D-29z1275)
- **REGRESSION is not due.** It last ran on 2026-11-05, and this planning ran on 2026-11-07 at 07:15 UTC; the rule needs 3 days. The first planning on or after 2026-11-08 is REGRESSION.
- **The rest of the order:**
  - PERF-12b waits for SABA-Q-PERF12B-TOLERANCE (`user-review/questions-perf12b.md` has no answer).
  - PERF-11b is `awaiting_user`.
  - PERF-11c-iii-d/e wait for the checkpoint or for RETRO 384.
  - **So PERF-13b is next**, as ordered in D-29z1271.
- **Facts behind the design.** They come from the claims script (`b-round-381/claims-382-output.txt`):
  - The studio-lab initial arrangement has **no clips** (K20). So at ready all 9 sources are unplaced, and both MP3s (55.07 + 37.12 MiB, K24) can be evicted.
  - The perf spec's Add places the default first source, `demo-middle-east` (K22). Its exports become a natural byte-identity check for the re-decode.
- **Split (D-29z1274):**
  - **13b-i:** the cache, eviction, pins, `ensureDecoded`, Play refusal, the failure path and the harness guard change.
  - **13b-ii:** the known-vs-decoded state, the preview text, the assert flip with B's production sketch (L58), and the purchased-reload question.
- **Consult: `tech-lead`**, read-only (`b-round-381/tech-lead-382.md`). It set:
  - the pin site (`updateHistory`, skipped when `clips` keeps its identity);
  - Play refused while a source decodes (rather than a silent or delayed start);
  - six hazards, each with its rule;
  - the note that LRU never chooses on the demo, so only unit rows prove it.

  All of it is adopted.
- **Behaviour rulings (D-29z1275):**
  - **What can be evicted:** only sources for which `canReloadSource` returns true, which today means the two demo URL sources. Purchased stems are excluded because signed URLs may expire.
  - **Budget:** 32 MiB.
  - **Play refusal** uses the existing `sourceNotLoaded` text, so no new string is added.
  - **The checkpoint:** editing ArrangementContext while the leaf-plumbing checkpoint is open is allowed. This is recorded as its tenth echo, SIG-R382-DECODED-CACHE-IN-PROVIDER. It also explains why the round-380 refusal of "wire now" (no measurable gain) does not apply: 13b-i is expected to free about 92 MiB at ready.

## 4. Task design notes
- **Perf rows stay `record`.** B ran no production sketch, so by L58 nothing new is asserted. The expected values come from arithmetic on the measured buffers (31.9 MiB, 7 live, 0 decode at ready; about 69.0 MiB and 8 after Add), with a pre-ruling for differences that are explained.
- **Hard browser rows** replace the assert, and they are behaviour checks on the real page:
  - EVICT-BROWSER (the buffer lengths in the registry);
  - PLAY-REFUSE-BROWSER;
  - EXPORT-BROWSER (WAV sha equal to HEAD).
- **L23:** B could not pre-apply a behaviour that does not exist yet. So the 10 C-DEMO test files get a conditional, fixture-only grant: the `expect(` count may not fall (`fixture-expect-counts-head.txt`), and C reads the diff.
- **L49 SWEEP:** there are 9 `buffersRef` hits in `app/**` + `perf/**` (K5); each consumer has a rule in §2.4.
- **L51:** the refusal status names what it overwrites and how long it stays.
- **The harness guard** changes from "count = sources" to a bound P ≤ N ≤ M. It also gains an app-independent decode probe and a dropped-probe guard (M3), each with a unit row and a browser mutant.
- **Manifests:** the frozen manifest has 1,259 entries (all tracked files minus the 11 grants and 10 C-DEMO files); the protected check is rc 0.

## 5. Root notes
- **ROOT-NOTE-PERF13-PLAN-ROW** stands: `perf-plan.md` row 39 should target `res.mem.pcm-live-mib-ready`. B does not own that file.
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING** is unanswered, with RETRO 384 as the deadline. A feature-boundary checkpoint for PERF-13 is not requested yet. B will request it after 13b-ii, when the cache's place in the provider is final.
- **GATE304-M1** (`perf/lib` tests outside the gate) is still a root item.

## 6. Status and completion
- **Decision: CONTINUE.**
- **Why not COMPLETE.** These remain:
  - STUDIO-PERFORMANCE: 13b-i/ii, 13c, 13d, 14, 15, 12b, 11b, 11c-iii-d/e, 9c/d, 4b/c and DRAG-PREVIEW;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - `deferred_low_polish`.
- **Not BLOCKED.** Round 382 needs nothing external.
- **Purchase protection unchanged.** Protected sha rc 0; the purchased collection is unchanged this round, and G382-AUTH re-checks the guard.
- **The workspace opens anonymously.** C confirmed it in round 381 at both viewports.
- **lessons.md** is unchanged at 60 lines; there was no Saba-reported issue this round. `regression-last.json` is unchanged.
- **Commit readiness.** Round 381 is already published. Round 382 is ready for the gate after C PASS.

## 7. Advisor and agents
- **Advisor:** consulted before the approach. It shaped the split, the hazard list, the harness guard change, M3 and the bookkeeping. A final check runs before handover (§8).
- **Project agent:** `tech-lead` (read-only). `performance-optimizer`, `product-designer` and `ableton-arrangement-expert` were not consulted: the round-380 performance consult already covers the policy, and nothing visible is designed this round.

## 8. Final check (after the advisor's handover review)
- **Consumer types: checked.** `applySchedule` and `renderArrangementWav` already take `ReadonlyMap` (K31), so passing `asReadonlyMap()` needs no new grant.
- **Other buffer holders: checked.** The peaks client clears its `active` job (4 sites) and the preview player clears its active source (2 sites). The stem-cache client holds no `AudioBuffer` (K32). So EVICT-BROWSER (a) can pass once the cache releases its reference.
- **Task text tightened:**
  - the three probes have distinct shapes (1, 2 and 480 frames);
  - the decode probe and the `OfflineAudioContext` share a 48 kHz rate, so there is no resampling;
  - `pcm-live-mib-after-add` polls the registry for a live `'decode'` entry, not the export button;
  - EV rows observe the cache through `vi.mock` of the real factory (no provider prop);
  - K29–K32 were added, and the CLAIMS row's allowed line shifts include K28–K30.
- **Claims:** the script was re-run after the last edit; `claims-382-output.txt` has 0 `MISSING`.
