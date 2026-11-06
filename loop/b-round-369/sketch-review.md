# Sketch review: PERF-11a (round 370)

**Dispatched sketch sha256:** `338dbe409ec2d5fada4df5b801dfdb9c4b0b6fcd724a0a28260bfc46c9ef1785` (`sketch.patch.txt`, `sketch-dispatched.sha256`).
**Reviewed sha256 (delta review):** `338dbe409ec2d5fada4df5b801dfdb9c4b0b6fcd724a0a28260bfc46c9ef1785`. It equals the dispatched sha (L58, RETRO 369).
**First review:** v1 `745653735bb93821088fa2c9be875a3be2d506b824dce8c3e505d086bf67bfbf` (`sketch-v1.patch.txt`). Delta from v1 to final: `sketch-v1-to-final.diff.txt`.
**Reviewer:** `tech-lead` (the code-reviewer is not on B's consult list). Both reviews were read-only; the verdicts are opinions.

## Rulings
| id | severity | finding (v1) | ruling |
|---|---|---|---|
| TL-1 | Medium | `budgets.resources.json` was re-serialised (`±` → `±` in 14 unrelated notes) | **Fixed in the sketch.** The 3 rows are edited by text; budget objects are multi-line like the rest of the file. Delta review: closed |
| TL-2 | Medium | CL2 depended on test order (the factory counter and the module-level `loadedSignalR` persisted) | **Fixed in the sketch.** `beforeEach` runs `vi.resetModules()` and `vi.doMock('@microsoft/signalr', signalrModule)`, resets the counters, and each test imports ChatContext dynamically. Seeds 1, 7 and 42 pass (`sketch-chat-shuffle.log`). Delta review: closed |
| TL-3 | Low | dead `failNext` | **Fixed:** CL4 (a failed import → `disconnected`, the exact connect error text, no invoke) |
| TL-4 | Low | unmount race: a connection built after unmount is never stopped; the import widens a gap that exists at HEAD around `start()` | **Not in 11a.** Pre-existing, deferred as B-R369-CHAT-UNMOUNT-RACE (`deferred_low_polish`) |
| TL-5 | Low | duplicate null check at 2 sites | **Fixed:** `isHubConnected` is a type predicate (`connection is HubConnection`) |
| TL-6 | Low | store → studio loses the 0.3 s exit fade | **Accepted, written in the task §1** (smallest honest behaviour) |
| TL-7 | Low | RT2 imports `MemoryRouter` from `react-router-dom`, which is transitive and not in `package.json` | **Accepted as is.** 4 existing test files already import `react-router-dom` this way, `react-router` is not direct either, and `package.json` is protected. No sketch change, so reviewed = dispatched holds |
| TL-8 | Low | budget headroom 2.6–3.0 %; note wording | **Fixed:** each note says a deliberate bundle change re-bases the budget with a measurement in its own task |
| TL-9 | Low (new, delta review) | after a failed chunk load, some browsers cache the failure; chat can stay down until reload | **Recorded in task §5**, no code in 11a. Same class as any lazy chunk |

## Evidence
- Covering: `sketch-covering.log`, 4 files, 23/23.
- Typecheck: `sketch-typecheck.log`, rc 0.
- Biome: `sketch-biome.log`, rc 0, 5 pre-existing warnings.
- Mutants (`mutants/`), each run with the new tests:
  - MU-CHAT-STATIC → CL1, CL2 and CL4 red;
  - MU-CHAT-IMPORT-OUTSIDE-TRY → CL4 red;
  - MU-CHAT-ALWAYS-CONNECTED → CL3 red;
  - MU-RT-NO-KEY → RT3 red;
  - MU-RT-STORE-PLAIN → RT2 red;
  - MU-RT-STUDIO-MOTION → RT1, RT3 and RT4 red;
  - MU-CHAT-STATIC-perf → the 3 encoded-bytes asserts FAIL (378,149 / 264,669 / 286,137). This run used the v1 sketch tree, which had the old budgets formatting and the v1 chat test. Only ChatContext affects the bundle, and the budget values are identical, so the result holds for the final sketch.
- Perf on the final sketch: `perf-res-sketch-final.log`, 362,477 / 250,526 / 270,648, PASS. v1: `perf-res-sketch-v1.log`. HEAD: `perf-res-head.log`.
