# Sketch review: PERF-15a (round 410)

Dispatched sketch sha256: 8f22c005447dc3885ed81152d621d868d530329a06a9c52380fd4fa899ab8c42 (`sketch-410.patch.txt`, v2)
Earlier sketch sha256: ac774c3c80e2f1ca6f0384f97c739a882838edbd5d9732139c463b24fec03ba9 (`sketch-410-v1.patch.txt`, v1)

Reviewer: `tech-lead` (read-only project agent), twice. 1) On v1: APPROVE WITH LOWS. 2) Delta re-review on v2 (it recomputed the hash, first 16 hex 8f22c005447dc388, equal to the dispatched one): APPROVE WITH LOWS.

## Findings and rulings
| id | sev | finding | ruling |
|---|---|---|---|
| TL-R410-SK-1 | Low | 4 MiB cap is advisory (missing header passes; gzip header = compressed size) | docs: handoff note + doc 263 call it defence in depth |
| TL-R410-SK-2 | Low | early precomputed peaks survive a collection swap / unmount for sources not yet ready | fixed in v2: cleanup drops early peaks of sources not in peaksReady; PPC10, PPC11; mutants SWAP-KEEPS-EARLY, READY-NOT-MARKED red |
| TL-R410-SK-3 | Low | collection.peaksUrl?.(source) unguarded, like previewUrl at HEAD | deferred_low_polish, fix together with previewUrl |
| TL-R410-SK-4 | Low | missing rows: decode rejects before peaks; swap mid-load; PPC8 weak; title PPC1-PPC9 | fixed in v2: PPC9, PPC10, PPC11, title PPC1-PPC11; mutant ERROR-NOT-DECIDED red. PPC8 stays (it proves the fetch gets the effect signal and is aborted on unmount; MU-410-NO-SIGNAL red) |
| TL-R410-SK-5 | Info | length*spp overshoots by up to a pixel; MP3 trimming offset not detected by a length check | handoff note (WAV master or browser-identical trimming) |
| TL-R410-SK-6 | Info | a matched 16-bit file is final; re-master with same duration shows stale peaks | handoff note (versioned peaksUrl) |
| TL-R410-SK-7 | Info | no peaksUrl provider yet; peaks fetches unthrottled; parse on main thread | recorded; 15b wires a provider |
| TL-R410-SK-8 | Low (process) | equivalent-mutant record missing | fixed: `mutants/equivalent.txt` |

Verdict on the dispatched sha: APPROVE WITH LOWS; no Medium or higher open.
