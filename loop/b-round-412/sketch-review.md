Reviewed = dispatched: sketch-413.patch.txt sha256 a7913dece594db71cecc3214075398d70c4978a644bf77ee5d3af1c5f8da2201 (v4)
# PERF-15b-ii-a sketch review (B round 412 -> 413; L58)

## Reviews
| Sketch | sha256 | Reviewer | Verdict |
|---|---|---|---|
| v1 `sketch-413-v1.patch.txt` | dce4c32bfc417c6a76ded2dc28191b2358dcba124094e882f019d389e5d389e6 | `tech-lead` | APPROVE WITH LOWS: TL-R413-L1 (stalled abort never settles when an injected fetch ignores init.signal), TL-R413-L2 (bearer token to a cross-origin peaksUrl), I1 (scratch commit polluted by the reviewer's own mutant during B's commit; the sha-verified patch was correct), I2-I5 info |
| v2 (not kept; superseded by v3 within minutes) | - | - | L1 + L2 applied |
| v3 `sketch-413-v3.patch.txt` | 360181ad6201ebca44a2057cee3fd958f9fab6df7efefdcf1dfd75b279e31dec | (B mutants: MU-413-EMPTY-PEAKSURL-KEPT survived -> PK4 strengthened in v4) | - |
| **v4 `sketch-413.patch.txt` (dispatched)** | **a7913dece594db71cecc3214075398d70c4978a644bf77ee5d3af1c5f8da2201** | `tech-lead` delta re-review v1 -> v4 | **APPROVE WITH LOWS**, no Medium+ |

## Findings and rulings
| Id | Sev | Ruling |
|---|---|---|
| TL-R413-L1 | Low | Fixed in v4: pre-abort cancel, abort listener `{ once: true }` removed in finally; caller check `text === null \|\| signal.aborted`. Rows PP12, PP12b, PP7e; mutants MU-413-NO-ABORT-LISTENER(-PP7D), MU-413-NO-PRE-ABORT, MU-413-NO-CALLER-ABORT-CHECK |
| TL-R413-L2 | Low | Fixed in v4: peaksUrl kept only when same origin as the stem audioUrl (both resolved against https://base.invalid; empty/unparsable dropped). Row PK4; mutants MU-413-NO-ORIGIN-CHECK, MU-413-EMPTY-PEAKSURL-KEPT |
| TL-R413-L-a | Low | Product contract, fail-closed (performance only): written into `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md` ("peaksUrl must share the audioUrl origin"); doc 265 states it. A later {audio, API} allowlist is a backlog candidate |
| TL-R413-L-b | Low | Kept: the 1 s race timers in PP12/PP12b outlive the test harmlessly -> deferred_low_polish |
| TL-R413-L-c | Low | Doc 265 gets one sentence: a dropped peaksUrl means the decode-based waveform (A, docs grant) |
| TL-R413-I1 | Info | Process: B's `commit -a` captured a reviewer mutant into the scratch-only commit; repaired (scratch status 0); the patch was always sha-verified. Lesson input for RETRO 416: reviewers copy the scratch, never edit it (now in the review prompt) |
| TL-R413-I3 | Info | TextDecoder + JSON.parse = response.json() decoding (UTF-8, BOM stripped) |
| TL-R413-I4 | Info | `fetchPeaks` keeps an inline function type in `app/types/arrangement.ts` (no lib import into types) |

## Ordering matrix (one read in flight; L58). Event kinds: P = signal already aborted at read start, A = abort while a read is pending, C = chunk under cap, X = chunk crossing the cap, D = stream done, E = stream errors (fetch honours the signal)
| first \ then | P | A | C | X | D | E |
|---|---|---|---|---|---|---|
| **P** | n/a (one signal) | n/a (already aborted) | excluded: never read (PP12b) | excluded: never read (PP12b) | excluded: never read (PP12b) | excluded: never read (PP12b) |
| **A** | n/a | n/a (once) | PP7d (listener cancels; partial text -> caller null) | excluded: listener cancelled first; same path as PP7d | PP7e (done after abort -> caller null) | PP7 outer catch (PP7b rejected-fetch class); TL I2 |
| **C** | n/a | PP7d, PP12 | PP7a/PP11-at-cap (multi-chunk read) | PP10 | PP7a | PP7b class (outer catch) |
| **X** | n/a | excluded: reader already cancelled, loop returned | excluded: returned | excluded: returned | excluded: returned | excluded: returned |
| **D** | n/a | PP7e | excluded: stream closed | excluded: stream closed | n/a | excluded: closed |
| **E** | n/a | excluded: errored first | excluded | excluded | excluded | n/a |
36 cells; each names a row or a ruled exclusion.

## Evidence (scratch /tmp/b413, base = git archive 107eb2d, v4 commit)
- Mutants: `mutants/summary.txt` (15/15 RED, pristine before/after rc 0, scratch status 0); per-id logs `mutants/MU-413-*.log`.
- Covering: `sketch-logs/covering.json` (24 files); full: `precheck-full.json` / `precheck-full.log` (see claims K15).
- tsc / Biome on v4: rc 0 (re-run in A2 by A).
