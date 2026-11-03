# A round 306 — PERF-3d: waveform rebuild only inside the timeline window (+ GATE304-M2/L3, C-R304-02)

**Status:** implemented; no STOP. Every A row in §3.1 ran and passed. EXIT and the browser rows are C's.
Baseline HEAD `adf959d`. Nothing committed or pushed. No installs. The :5173 server was not touched. Progress checkpoints: `a-round-306/checkpoints.md`.

## Changed files (exactly the §5 grants: 7 modified + 2 new)
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | Changes are in `ArrangementClipViewInner` only. The `peakColumns` line is replaced by the gate: `useSyncExternalStore` with a per-clip boolean "span in the page window", plus `useState` and a guarded render-time `setState` for the last shown columns. Also: the optional prop `timelineWindow?: TimelineWindowSource`, the React and `view` imports, and the module helpers `noWindowSubscription` and `alwaysInWindow`. `buildPeakShape` and `ArrangementPeakPath` are **byte-identical** to HEAD (83-line extract diffed) |
| `app/components/arrangement/ArrangementLane.tsx` | Optional prop `timelineWindow`, passed next to `timelineSeconds={laneSeconds}`, plus the type import |
| `app/components/arrangement/StudioWorkspace.tsx` | One `useMemo` `{ getTimelineView, getTimelineViewportPx, subscribeTimelineScroll }` and `timelineWindow={timelineWindow}` on `<ArrangementLane` |
| `app/lib/arrangement/view.ts` | `TimelineWindowSource` interface and `spanInTimelineWindow(fromPx, toPx, timelineWindow?: TimelinePxWindow)`: `undefined` → true, inclusive edges. The parameter is optional, per the grant wording; B's sketch had `| undefined` |
| `perf/budgets.interactions.json` | The 9 rows of §5: out path-rewrites `==` 3, wheel `==` 2 (with the exact notes), and the GATE304-L3 sentence appended to 7 notes |
| `perf/studio-lab-interactions.perf.spec.ts` | The last `interactionSequence` entry only (C-R304-02 text) |
| `docs/implementation/2026/quarter-IV/222-perf-zoom-harness-rows.md` | One line added in `## მიდგომა`, right after the `== 60` bullet (exact A-DOC text) |
| `app/lib/arrangement/__tests__/waveform-window-ui.test.tsx` (new) | WG0–WG4 as §6, **plus WG5** (see Reviewer). WG3's title changed from "…rebuilds it once" to "…rebuilds it at the new band" (reviewer Low; the row id and assertions are unchanged) |
| `docs/implementation/2026/quarter-IV/223-perf-waveform-window.md` (new) | The template's 7 headings in order (diffed against TEMPLATE), l.4 `**სტატუსი:** Completed (C round 306 PASS)` |

The starting point was B's `b-round-305/sketch.patch.txt`, applied with `patch -p0` (no `.orig` or `.rej` files left).

## A rows
| Row | Result |
|---|---|
| A-CLAIMS | **PASS.** Before editing, `claims-306.sh` output == `claims-306-head-output.txt` (`a-round-306/claims-before.txt`) |
| A-UNIT | **PASS.** Covering set of 11 files / 169 tests, all green (`a-round-306/covering.log`, `covering.json`; this run had WG0–WG4). After WG5 was added, the WG file re-ran at 6/6 green (`a-round-306/wg-store.log`, plus a final run after the `toBeCloseTo` change). Per-file times below; no test reaches 50 % of its timeout |
| A-MUTANTS | **PASS.** All on scratch `/tmp/a306/scratch` (git archive HEAD + A's files + a `node_modules` symlink, own config `/tmp/a306/vitest.scratch.config.mjs`). Table below |
| A-PERF-RUN | **PASS.** `npm run test:perf` once, alone: rc 0, 3 passed in 14.1 min. Values below |
| A-PERF-LIB | **PASS.** `/tmp/a306/vitest.perf.config.mjs` (root = store, own cacheDir): `report.test.ts` + `zoom-probe.test.ts`, 2 files / 29 tests green (`a-round-306/unit-perf-lib.log`) |
| A-TYPE/LINT | **PASS.** `npm run typecheck` rc 0 (run again after the last test edit). `npm run lint` rc 0: 205 warnings and 1 info repo-wide, **none in a granted path** (checked with `biome lint --max-diagnostics=1000`). Scoped `npx biome check` on the 5 app paths: clean. `biome.json` `files.includes` is `app/**/*.ts(x)` only (l.65–66), so the 2 perf paths were checked on scratch with `files` removed from the scratch `biome.json` (as round 304): `Checked 2 files … No fixes applied` |
| A-REVIEW | **PASS.** code-reviewer on all §5 paths found one Medium, inside the grants: no test went through the real anchored zoom (pending view). Fixed with WG5, and the reviewer re-ran on the changed lines: no Critical/High/Medium. Its one Low (exact float compare) is fixed |
| A-DOC | **PASS.** Doc 223 cites WG0–WG5 and MU-GATE-OFF / MU-NO-SCROLL / MU-FALLBACK / MU-EDGE / MU-NO-PENDING, each of which exists. The doc-222 line is byte-exact |

### Covering-set times (`covering.json`)
| File | File ms | Slowest test ms | Declared timeout |
|---|---|---|---|
| clip-gain-pointer-preview | 30,367 | **9,991** (CP12a) | 30,000 → **33 %** (gate 304 `verify.log`: 9,464) |
| render-budget | 10,924 | 3,104 | 15,000 (21 %) |
| clip-envelope-ui | 8,725 | 791 | default 5,000 (16 %) |
| tempo-window-ui | 4,274 | 631 | 15,000 |
| video-fades-ui | 4,115 | 1,663 | default 5,000 (33 %) |
| waveform-zoom | 2,992 | 811 | default 5,000 |
| clip-gain-waveform | 2,598 | 510 | default 5,000 |
| content-colour-ui | 1,647 | 616 | default 5,000 |
| waveform-window-ui (new) | 1,648 | 703 (WG1) | 15,000 |
| view.test | 501 | 131 | default 5,000 |
| waveform-outline-path | 28 | 9 | default 5,000 |

### Mutants (scratch; logs and diffs `a-round-306/mut-*.log|diff`)
| Mutant | Change | Red rows | Expected (§6) |
|---|---|---|---|
| control | none | 5/5 green (6/6 after WG5) | — |
| MU-GATE-OFF | `peakColumns = targetPeakColumns` | WG2, WG3, WG4 | WG2, WG3, WG4 ✓ |
| MU-NO-SCROLL | subscribe = `noWindowSubscription` | WG3 | WG3 ✓ |
| MU-FALLBACK | `undefined` window → false | WG0, WG1 | WG0, WG1 ✓ |
| MU-EDGE | `>` / `<` (exclusive edges) | WG0 | WG0 ✓ |
| MU-NO-PENDING (A, for WG5) | `getTimelineView` ignores `pendingViewRef` | WG5 only (WG0–WG4 green) | — |
| restored | none | 5/5 and 6/6 green; the scratch `StudioWorkspace.tsx` is byte-equal to store | — |

The first four mutants ran against the 5-row file, before WG5 existed. Under MU-NO-PENDING, the failing WG5 assert was `near` (received 4096, expected 1250). The `far` assert passed: after commit, `useSyncExternalStore` re-checks its snapshot and reads the real `scrollLeft`, and the extra render rebuilds `far`. The re-reviewer's reasoning predicted both asserts would fail. The run shows only `near` does. The row is red either way.

### A-PERF-RUN values (reports copied to `a-round-306/perf/`)
- All three reports: `complete` true, `failures` [], 0 pageErrors, 0 problems. Asserts: perf-1a 93/93, perf-1b-ii 15/15, perf-1b-i (interactions) 23/23, all passing; the `interact.drag.fade.30.*` rows are included.
- Interactions runtime 348,952 ms (5.8 min, 39 % of 15 min). perf-1a: 422 s. perf-1b-ii: 63 s.
- `interact.zoom.30.in.keydown-max-ms` [16,24,24] median **24**. `out.keydown-max-ms` [24,24,24] median **24**. Keydown medians: in 16, out 16.
- `in/out/wheel.loaf-max-ms` **0 / 0 / 0**.
- `in.commits-per-key`, `out.commits-per-key` and `wheel.commits-per-step` are 1, with **`detail.max` 1** in all 3 samples (every per-key/per-step value is 1).
- `zoom.30.components-per-key` **247** [247,247,247]. `zoom.30.commits-per-key` 1. `key-window-longest-ms` median 9.5.
- `path-rewrites`: in **0**; out **3** [3,3,3], perKey `0,0,1,1,0,0,0,1,0,0`; wheel **2** [2,2,2], perStep `0,0,0,1,0,0,1,0,0,0`. Both match B's sketch exactly.
- Environment note (L38): no vitest, tsc, build or browser job overlapped the run. A read-only code-reviewer agent (file reads only) ran during it. I also edited the WG test file during the run; the perf run does not load it.
- What these numbers mean for EXIT (A's reading; C decides): in/out keydown medians 24/24 < 50, wheel LoAF 0 < 50, every commits `detail.max` ≤ 1.

## Claims after the change
`a-round-306/claims-after.txt` vs `b-round-305/claims-306-sketch-output.txt`: the only difference is **K2** = `9 adf959d`, which is the expected environment value. K15 equals the sketch value (27). K1/K3/K19/K22/K25 keep their values.
`sha256sum -c` fails on exactly the 7 modified paths. The protected files `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx` and `download-routes.test.ts` have no diff.

## Reviewer
- Pass 1 (all §5 paths): 8/10. No Critical/High.
  - **Medium:** WG rows only call `setPxPerSecond`, so the pending-view zoom path is untested. **Fixed:** WG5 drives the Zoom slider → `applyTimelineView` with the playhead at 175 s and the scroll at 3000, then asserts the anchored `scrollLeft`, `far` at the new band and `near` still at the 20 px/s band.
  - Low: the WG3 title overclaimed "once". Fixed by renaming the title.
  - Low: two preconditions can't fail alone (the mount band = the default 40). Kept as preconditions.
  - Info: in-window clips render twice at a band crossing (render-time `setState`; same commit). Edits to an off-window clip still rebuild with the old column count; the doc now says so. Each clip re-reads the window per scroll event, which is cheap at 30 clips.
- Pass 2 (changed lines): 9/10. No Critical/High/Medium. Low: exact float `toBe(zoomed)`, changed to `toBeCloseTo(zoomed, 9)`. After pass 2, only that one-token Low was applied, and **no third reviewer pass ran**.
- The final WG file run (`a-round-306/wg-store-final.log`): 6/6, rc 0, no React or `act()` warnings (0 matches).
- **Architecture note (for B):** `StudioWorkspace` now passes the timeline window contract in two shapes: one bundled `timelineWindow` object to the lane, and three separate callbacks to the Ruler and TempoRow (`StudioWorkspace.tsx` ~2810, ~3000–3021). Keep for this round. A possible later bounded task: move Ruler and TempoRow onto `TimelineWindowSource` with no behaviour change. `StudioWorkspace` size is not a signal by itself.

## For B / C (deviations and known gaps)
- **WG5 is an extra row beyond §6** (WG0–WG4). It was added to fix the reviewer's Medium inside the granted test file. C's `assertsSpecified` stays 5 per the task; WG5 and MU-NO-PENDING are A additions. B: please accept or rule on this.
- The WG3 title text changed (the id and assertions did not).
- The `spanInTimelineWindow` third parameter is `?:` (grant text) rather than the sketch's `| undefined`. Callers are unaffected.
- Not run by A (the speed rules): the full vitest suite, build, `npm run verify` and e2e smoke are gate rows. The browser rows PROBE, SCROLL-UPGRADE, VIS-EQUIV, PLAY-SMOKE-306 and G306-AUTH are C's. I did no browser probing of my own beyond the perf harness.
- RT-FIX (`user-review/screen-review-305.md`) is B's document edit; A did not touch it.
- Signals recorded as candidates, not done: `PERF-3D-VERTICAL-GATE`, `PERF-3D-SCROLL-HARNESS-ROW`.

## Next C checks (exact)
1. SOURCE-SCOPE: `git status --short --untracked-files=all` = the 9 paths above. `sha256sum -c` fails only on the 7. Diff `buildPeakShape`/`ArrangementPeakPath` against HEAD (byte-identical). The budgets diff touches exactly 9 rows; the spec diff is only the K12 entry; doc 222 has a one-line add.
2. CLAIMS: run `claims-306.sh` and compare with `claims-306-sketch-output.txt` (expect only K2 = `9 adf959d`).
3. PERF-RUN + EXIT (alone, on production builds), then PROBE (`zoom-attr.cjs`, out and wheel-out, 1440 and 1280), SCROLL-UPGRADE (A at both viewports + HEAD at 1440), VIS-EQUIV (HEAD vs A at both viewports, 3 keys), PLAY-SMOKE-306 and G306-AUTH.
4. TESTS-READ: WG0–WG4 semantics per §6, plus a decision on the extra WG5. Mutant log in `a-round-306/mut-*.log`.
5. DOC: doc 223 headings and l.4; doc 222 one line.
