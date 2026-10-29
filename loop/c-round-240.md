# C round 240 — SABA-B-11b-FIX-1 verification

**Verdict: PASS.** `browserVerified: true` and `realVerified: true`. Every browser row ran in real Chromium (Playwright, `chromium-1200`) against `http://127.0.0.1:5173/studio-lab`. Each row ran at 1440×900 and 1280×720 in a fresh context, waited for `Demo collection ready` first, and logged 0 page errors. I found one bug, a Low in the docs: C-R240-01.

- **Script:** `c-round-240/c240.cjs`, a copy of C239's helpers. The head leg was removed: no `:5174` server was needed, because the budget and the sha are compared with the round-239 data.
- **Raw results:** `c-round-240/out/c240.json`. Screenshots are in `c-round-240/out/*.png`.
- **Env:** `env-status.json` showed store 200 at 03:28Z, and `curl` returned 200 before the run.

## Acceptance

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-240 | PASS | <ul><li>HEAD is `d0afa64`; exactly 3 `M` (the grants).</li><li>Tree list (1,101) and root list: `sha256sum -c` rc 0. The 7 protected files: `git diff --quiet HEAD` rc 0.</li><li>Grant 1 `-U0`: 3 hunks at l.1548, 1561 and 1570, all inside `stepGridDivision` (l.1543–1586). The `+` lines are the moved end-check (4) and `gridHandChosenRef.current = true;`; the `-` lines are only the moved block. `origin` appears 0 times.</li><li>Grant 2: the only `-` line is the describe title; 0 `expect(` lines removed.</li><li>I also checked HEAD's order: the old end-check already ran before the ±2 guard, so the move changes no outcome (GATE239-S3).</li></ul>`c-round-240/scope.txt` |
| C-UNIT-240 | PASS | `covering.txt`: 41 files, **680/680**, rc 0. GAU1–GAU17 all green; the slowest is GAU6 at 1.87 s (15 s limit). `c-round-240/covering.json`, `covering.log` |
| C-MUT-240 | PASS | Scratch copy at `/tmp/c240-scratch`, outside the repo, now deleted. The file has two `gridHandChosenRef.current = true;` lines (l.1410 `changeGridDivision`, l.1570 new); only l.1570 was mutated.<ul><li>MU-FLAG-MISSING: **GAU16 ×**, 16 passed.</li><li>MU-FLAG-BEFORE-GUARDS (flag as the first statement of the adaptive branch): **GAU17 ×**, 16 passed.</li><li>Restored: 17/17.</li></ul>Repo `git status` was identical before and after. `mutant-*.log`, `git-status-before-mutants.txt` |
| C-HAND-240 | PASS (both) | Each case seeds `demo-synth-mix` with Enter. All three end with `data-bpm` 120, adaptive, Snap on.<ul><li>(a) `1` → `Grid: 0.5 s (Snap off)`; after the seed `0.5`, status ends `Snap on — grid 0.5 s (G)`.</li><li>(b) `2` → `2`; after the seed `2`, ends `Snap on — grid 2 s (G)`.</li><li>(c) no key; after the seed `1/2`, ends `Snap on — grid 1/2 (G)`.</li></ul>`hand-*.png` |
| C-REFUSED-240 | PASS (both) | <ul><li>`=`×10: `0.1`, ruler pps 320.</li><li>`1` gives the byte-exact `The grid is already at its narrowest — 0.1 s (1)`.</li><li>Seed: adaptive `1/16`, status ends `Snap on — grid 1/16 (G)`. Painted period 40 px = 0.125 s × 320 (≥ 24 px); 1/32 would be 20 px (< 24).</li><li>§6 neighbour: a third `1` at 40 px/s gives the density-limit text, after two accepted presses had set the flag. The seed then keeps `0.25` (expected).</li></ul>`refused-*.png` |
| C-DENSITY-MODEL-240 | PASS (both) | Each press was logged one at a time and compared with an independent §2.1 simulator (zoom 40·1.25ⁿ clamped to 0.5…320).<ul><li>(a) ends **2**.</li><li>(b) ends **5**.</li><li>(c) `2 2` (density 2), `−`×20 → `10`, then `1` → `5` (density stored as −1), then `=`×20 → **0.5**, which is what the simulator predicts. The final zoom, measured from the ruler ticks, is **43.37 px/s** at both viewports (0.5·1.25²⁰, because `−`×20 clamps at 0.5). GAU15 pins the same 0.5 s at 40 px/s; base index 3 covers about 24–48 px/s.</li><li>Across all presses: 0 swallowed, 0 bad, 0 simulator mismatches (division and exact status), 0 zoom mismatches.</li><li>The mode stayed adaptive throughout.</li><li>The `output[aria-live]` observer counted key presses (+2 each) and 0 changes on any zoom step.</li></ul>`density-*.png` |
| C-SEED-REG-240 | PASS (both) | <ul><li>(a) Select `0.5` → fixed `0.5`; after the seed, still fixed `0.5`.</li><li>(b) `5` → fixed; after the seed, fixed `1/4`, status ends `Snap on — grid 1/4 (G)`.</li><li>(c) Seed, then `3` → adaptive `1/2T`, `Grid: 1/2T · 0.667 s at 120 BPM (Snap on)`.</li></ul> |
| C-GRID-REG-240 | PASS (both) | <ul><li>adaptSec (`=`×6, `−`×10): divisions identical to `c-round-239/out/c239.json` (1,0.5,0.5,0.5,0.25…,2). Every painted period matches pps within 0.5 px and is ≥ 24 px. Live count 0 → 0 over every zoom step.</li><li>density (`1`×3, `2`×5): divisions and exact statuses identical to round 239.</li></ul> |
| C-BUDGET-240 | PASS | Persistent lines outside the timeline: empty 85/69, demo 101/85 (1440/1280), the same as round 239. The line set diff against round 239's inventory is empty both ways. `budget-*.png` |
| C-REF-240 | PASS | <ul><li>`eq2.mjs`: 9 lines × 2,190, `diffs 0` each. `eq.mjs`: 960, `diffs 0` (`eq.log`).</li><li>Script reading: `rev()` = `base(px) − c + step` with the ±2 → `limit` refusal and the family-end check, which is the gate reviewer's formula. `cur()` = `d+step`, stepping while `pick` is unchanged, then the ±2 refusal, which mirrors l.1552–1568.</li><li>`SABA-Q-11B-DENSITY-MODEL` is one id entry in `backlog.json` (l.25167, 3 mentions in total).</li><li>F1 and F2 are judged below.</li></ul> |
| AN-REVIEW-240 | PASS (with Low C-R240-01) | <ul><li>l.4 is byte-exact.</li><li>The 7 `## ` headings are in TEMPLATE order.</li><li>Cited ids GA1–GA8, GAU1–GAU17 and `tempo-seed-ui` TU5 all exist.</li><li>The equivalence counts 19,710 and 960 are present, with the ruling.</li><li>Stale: l.128 still says `GAU1–GAU13` (outside grant 3) → C-R240-01.</li></ul> |
| LAB-SMOKE-240 | PASS (both) | <ul><li>Space plays: position 0.87/0.882 after 0.9 s, tap RMS > 0.</li><li>Space pauses: 0.89 held across 400 ms.</li><li>Export WAV: 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, −24.91 dBFS, peak 0.2967, 0 NaN.</li><li>**sha256 `1fea093b…3f94` matches.**</li></ul> |
| Auth | PASS (both) | <ul><li>Fresh context: `/studio-lab` opens with `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.</li><li>`/api/studio-token` with no header: 401 `Please sign in to access Studio.`</li></ul>`auth-guard-*.png` |
| Purchased origin (browser) | BLOCKED | The backend is unavailable in the cloud. Static check: `origin` in the grant-1 hunks = 0. |
| gate | gate | Full vitest, typecheck, lint, build, `verify` and e2e smoke belong to the root gate and are not claimed. |

## Reference (§3): CZABA requirement vs Live

| # | CZABA requirement | Ableton match |
|---|---|---|
| F1 Clamped-end density | **Met:** the ruled model D-29z361. Every press moves one step or shows a refusal text, and the zoom-back values equal the simulator's. | **Unconfirmed: no reference found.** The Live 12 manual §6.10, re-read via WebFetch on 2026-10-29, says only that Ctrl/Cmd+1 "narrows the grid, doubling the density" and Ctrl/Cmd+2 "widens…halving". It says nothing about limits or adaptive spacing. SABA-Q-11B-DENSITY-MODEL stays open. |
| F2 A tempo seed keeps a hand-set grid | **Met:** C-HAND-240 (a)/(b), C-SEED-REG-240 (a). A refused key is not a hand choice (C-REFUSED-240). | **Not applicable:** Live has no catalogue tempo seed. |

## Bugs for B

- **C-R240-01 (Low → `deferred_low_polish`).** In doc 186, `## შეცვლილი ფაილები` l.128 lists `grid-adaptive-ui.test.tsx` as `GAU1–GAU13`, while the file and `## ტესტირება` have GAU1–GAU17.
  - **Repro:** `grep -n "GAU1–GAU13" docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` → l.128.
  - **Fix:** a one-word change in a later grant. A reported the same in `a-round-240.md` §2.

## Notes
- The `toggleGridMode` (`5`) seed override is still in place (C-SEED-REG (b)), as D-29z362 intends.
- The `1`-then-`2` (net 0) hand-choice observation from A's review was not re-probed as a bug; it is the same as fixed mode.
