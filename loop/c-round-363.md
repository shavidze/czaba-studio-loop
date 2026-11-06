# C — round 363 (PERF-10b-ii-b): FAIL (A STOPped; browserVerified true)

Verdict: **FAIL**. A stopped on DC-KINDS (perf-lib 39/40) and never wrote docs 234/168. The parts A did deliver are real and verified.

## Passed (own evidence under `c-round-363/`)
- **SOURCE-SCOPE:** 3 modified files, 0 untracked; B's sketch reverse-applies; no `app/` file changed except `render-budget.test.tsx`.
- **RB-MEMO:** `render-budget.log` 13/13; RB-MEMO1–3 at 70/73/69 ms.
- **MUTANTS** (scratch deleted, store unchanged): MU-P red on RB-MEMO1 only; MU-W on RB-MEMO2 only; MU-R on RB-MEMO3 only (12/13 each: `mutant-Arrangement*.log`). C's own mutant (`selection={{ ...selection }}` into the waveform) is red on RB-MEMO2 (`mutant-C363.log`).
- **PERF** (production, alone): rc 0, 8.2 min, `complete` true, `failures` [], `durationMs` 476892. 264 rows; 95/95 asserted pass; 0 DIFF versus C362 (`rowcmp.txt`). New rows: 8 non-wallclock (move-components-max 37, per-move 7.383, release-commits 1, live=1 at 1× and 6×). Wallclock: commits-per-move 0.983; move-to-paint-p95 2.3 ms at 1×, 14.7–18 ms at 6×.
- **BG-RANGE** (browser, dev, 1440×900 and 1280×720): a +120 px drag on the empty video-lane background produced exactly one `arrangement-lane-range`, on the dragged lane, none elsewhere, with the readout "Time selection 00:00.000 — 00:03.000". No clip selected after the drag (Clip Gain fader disabled). The name-bar click then gave 0 range elements and 0 `[data-range-start]`, with the clip selected (fader enabled). The position text was unchanged. This reads the playhead text only; the Insert Marker was not read separately. Screenshots: `bg-range-*.png`, `bg-reset-*.png`.
- **G363-AUTH** (new context, no credentials, both viewports): `/studio-lab` opens the demo (`auth_user` null). `/studio/middle-east` shows "sign in required" with 0 audio sources. GET `/api/studio-token` returns 401 and no token body. Premium auth is not bypassed.

## Failed
- **C-R363-01 (Medium, origin B-spec/L23):** PERF-LIB is 39/40 (`perf-lib.log`). `report.test.ts` DC-KINDS regex does not know `background-range`. B's options (a)/(b)/(c) are in `a-round-363.md`. Option (a) is the honest one: grant `perf/lib/report.test.ts` (regex plus `toHaveLength(16)` → 18). The 12 measured values still apply.
- **C-R363-02 (Medium, origin A, follows from -01):** DOCS row not met. Doc 234 l.4 is still "In Progress (stage 4 of 5…)", with no stage-5 section. Doc 168 has no background-range mentions. A's code-reviewer Lows are unapplied.

## Blocked / not run
- Fake-bearer `/api/studio-token` returns 500 (fails closed without a backend; no token).
- MARKER-NONE-PLAYING-BACK not run (best effort, not counted).
- `claims-363.sh` not re-run by C; A's final claims differ from planning only in K2, K14 and K16, because docs were not done.
- Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed.

## For B
Rule on option (a). Re-dispatch A for the grant, docs 234/168 and the reviewer Lows. The perf spec is unchanged unless the Lows touch it; if it changes, rerun PERF.
