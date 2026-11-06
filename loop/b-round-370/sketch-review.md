# Sketch review — round 371 PERF-11c-i

Dispatched sketch sha256: e82ad29248a8157a306ff391a0bb4cdbdb35118aec7f8093f15698a4828d51bb (`sketch.patch.txt`, = `sketch-dispatched.sha256`)
Reviewed sha256 (delta review): e82ad29248a8157a306ff391a0bb4cdbdb35118aec7f8093f15698a4828d51bb — equal to dispatched (L58 RETRO 369).

## Review 1 — v1 (sha256 ff3671beb05a22585f502051782627e26c86e197851410d8794989039c997f09, `sketch-v1.patch.txt`)
Reviewer: `tech-lead` (read-only, no runs). Full text: `sketch-review-v1.txt`. Verdict: approve; 0 Critical/High, 1 Medium, 6 Low.

| Id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-1 | Medium | Hand-written comparator (wrapper props) and hand-listed clip fields: a new prop/field is silently ignored → stale UI | **Fixed in v2**: `PropEquality<Props>` mapped type (`-?`, every key required; tsc rejects a missing or extra key), table `GROUP_HEADER_WITH_SELECTION_PROP_EQUALITY` (15 props), `TRACK_GROUP_OVERVIEW_CLIP_EQUALITY` (4 fields), generic `samePropsByTable` (`for…in` over the table). Mutant MU-GH-CLIP-START-IGNORED red (GH3) |
| TL-2 | Low | No row for sibling-group isolation | **Fixed in v2**: GH5 (two groups; muting one renders exactly 1 header leaf; red on HEAD "expected 2 to be 1") |
| TL-3 | Low | No row/mutant where only `activeCandidateTrackIds` changes (clip-less track joins/leaves a folded group) | Ruled: edge case; the table compares it with `sameTrackIdList` and tsc forces the key. Recorded as B-R370-GH-ACTIVE-CANDIDATES-ROW (Low, deferred_low_polish) |
| TL-4 | Low | No named mutant "comparator ignores group" | **Fixed in v2**: MU-GH-COMPARATOR-NO-GROUP red (GH4, GH5) |
| TL-5 | Low | GH1/GH2 cover only a folded group | Ruled: an expanded group gets the constant `NO_*` arrays, trivially stable. Not added |
| TL-6 | Low | Leaf name load-bearing for fader-pointer-preview `PARENT_NAMES` | **Fixed in v2**: TODO line at the leaf |
| TL-7 | Low | `hookName` could be a literal union; other wrapper hooks report the store hook's name | Ruled: nit; L8c/L8d pin both names. The other hooks are recorded as B-R370-HOOK-ERROR-NAMES (Low, deferred_low_polish) |

Callback stability (reviewer, read at HEAD): all 9 `groupHeaderActions` callbacks and the 4 wrapper callbacks are identity-stable across edits and status writes; GH1/GH2 turn red if one stops being stable (MU-GH-ACTIONS-INLINE).

## Review 2 — delta v1 → v2 (sha256 e82ad292…51bb; `sketch-v1-to-v2.diff.txt`)
Reviewer: `tech-lead`. Verdict: **approve v2**; Medium fixed; nothing new at Medium+.
- Low: `-?` strips `undefined` from an optional prop's type; latent only (no optional prop today). Recorded with TL-3's id note; not acted on.
- Low: `Object.is` vs `===` (−0/NaN) — harmless.
- Low: per-clip table loop costs a few µs on a large folded group; ruled acceptable (perf rows unchanged, see `perf-fader-sketch.log`).
- Optional: GH5 could also assert the wrapper renders once — not added (the sketch stays equal to the reviewed sha).

## Mutants (run with the new tests, logs `mutants/mutant-<id>.log`, script `mutants.py`)
| Mutant | Predicted red | Observed red |
|---|---|---|
| MU-GH-CTX (leaf calls `useArrangement()` again) | GH1, GH2, GH5 | GH1, GH2, GH5 |
| MU-GH-DEFAULT-MEMO (wrapper plain `memo`) | GH2, GH5 | GH2, GH5 |
| MU-GH-ACTIONS-INLINE (`actions={{ ...groupHeaderActions }}`) | GH1, GH2, GH5 (+SS8a) | SS8a, GH1, GH2, GH5 |
| MU-GH-SOLO-OFF (`soloState={'off'}`) | GH4 | GH4 |
| MU-GH-COMPARATOR-NO-SOLO | GH4 | GH4 |
| MU-GH-COMPARATOR-NO-GROUP | GH4, GH5 | GH4, GH5 |
| MU-GH-CLIP-START-IGNORED | GH3 | GH3 |
| MU-L8-NAME (reader passes the old name) | L8d | L8d |

## Ordering matrix
Not applicable: no concurrency or ordering contract (writes/aborts/queues) changes in this round.
