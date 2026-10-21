# A — Round 25 report (SRW-13 stage 1: Master Volume, Master Mute, export overload warning)

Status: implementation done and reviewed. **No PASS claim** — C verifies.

## 1. Pre-flight gate

- **Baseline (before any edit):** `sha256sum -c b-round-24-tree-sha256.txt` → 50 OK. `git status --short` → 47 lines, identical to `c-round-24/gates/git-status-end.txt` (`diff` empty). HEAD `c5ed47b`. The seven owned files matched the dispatch snapshot shas (4f8b93fe, 98f8de60, db337424, d9a14202, 324061ea, 146aa2fa, 52bad7b3). No difference.
- **Read:** `.claude/rules/read-primitives.md`; primitives AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, REACT_CONTEXT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; prompts `studio-feature.md`, `new-component.md`; skill `pre-flight`. Also read every source range in §1.3, plus the frozen `render-budget.test.tsx` and `export-dialog-focus.test.tsx`.
- **Breakage greps (advisor):**
  - `renderArrangementWav` has one caller (the context). The frozen `graph.test.ts` source-text test needs the literal `applySchedule(ctx, planSchedule(arrangement, 0)`, and no `setTrackGain` after `renderArrangementWav`. Both are kept.
  - No frozen test asserts the done-message text.
  - No frozen test builds a bare `Arrangement` literal outside the 3 tsc sites B named. tsc after the type change showed no other site.
- **Assumptions:**
  - `master` is a required field. All constructions go through `createArrangement` or a spread, except B's 3 sites.
  - The Master gain sits on the existing master GainNode. `scheduleKey` is unchanged, so there is no reschedule.
  - Gesture/history uses a **parallel master path** (justified in doc 031).
  - The overload is measured on the pre-clamp floats, and the clamp is unchanged.
- **Smallest version:** model ~35, graph ~55, context ~170, component ~80 and dialog ~25 added lines. The context is the largest part because it mirrors the track gesture pipeline.
- **Files:** exactly §3.2.
- **Success:** the §5 commands; new tests red on the snapshot sources and green after.

### design-philosopher (run once, read-only) — advice and dispositions

| Advice | Disposition |
|---|---|
| M button `h-5 w-5` (≤22 px keeps the header at 35 px) | ADOPTED |
| Fader `h-1 w-24 accent-brand` | ADOPTED |
| Readout `w-16 text-right text-xs tabular-nums`, U+2212 minus | ADOPTED |
| Wrap the Master group and the badge in one right-side flex group; `border-l border-outline pl-3` seam | ADOPTED (DOM/Tab order ← CZABA → Master Mute → Master Volume → transport) |
| Same muted/unmuted tokens as the track M | ADOPTED |
| No colour on the readout above 0 dB | ADOPTED |
| `uppercase tracking-wider` label | DECLINED: CSS uppercase makes `innerText` `MASTER`, and C records the label code points. The text stays `Master`. |
| `opacity-50` on the fader/readout when muted | DECLINED: a still-operable control would look disabled. The state is shown by the accent M (`aria-pressed`). |

## 2. Red first, then green

**Red, live tree, before any source edit** (`a-round-25/red-live.txt`):
- `master.test.ts`: **15 failed / 15**. The missing exports surface as `TypeError: (0, __vite_ssr_import_3__.setMasterMix) is not a function` (and the same for `masterLinearGain`, `formatMasterGainDb`, `measureExportOverload`, `formatExportOverloadWarning`), plus `handle.setMasterGain is not a function`. Value checks fail too: `AssertionError: expected undefined to deeply equal { gainDb: +0, mute: false }` and `expected 1 to be 0.25`.
- `master-ui.test.tsx`: the file fails to load with `Failed to resolve import "~/components/arrangement/ArrangementMaster"`. This was expected, because the module did not exist.

**Red for `master-ui.test.tsx` in a scratch copy** (`a-round-25/red-ui-scratch.txt`):
- The scratch copy is `../tmp/studio-real-loop/a-round-25/scratch/`. It holds a copy of `app/` and the configs, taken **before** any source edit; the context sha `d9a14202` and the StudioWorkspace sha `324061ea` were verified. The only addition is a stub `ArrangementMaster.tsx` that returns `null`. `node_modules` is reached through a junction to the store's `node_modules` (link only).
- Result: **15 failed / 15.** Examples: `result.current.toggleMasterMute is not a function`; `Unable to find … role "group" and name "Master"`; `Unable to find … [data-testid="arrangement-export-overload"]`; `expected { phase: 'done', …(1) } to deeply equal { phase: 'done', …(2) }`.

**Green, final** (`a-round-25/green-new.txt`): `Test Files 3 passed (3)`, `Tests 47 passed (47)` for `master.test.ts` (17), `master-ui.test.tsx` (18) and `schedule.test.ts` (12). There is no stderr. The first green run, before the review additions, was 42/42.

**Frozen four** (`a-round-25/green-frozen4.txt`): `render-budget`, `export-dialog-focus`, `graph` and `ArrangementContext` give `Test Files 4 passed (4)`, `Tests 66 passed (66)`. Their sha256 values are unchanged (part of the 50 OK).

**New `it` blocks: 35** (≥12 required; 30 written first, plus 5 after the review, §4). The §2.6 coverage map:
1. **Model:** default; clamp −80→−60 and +9→+6; same object on a no-op; linear gain −6/mute/0; `deleteTime` and a paste keep `master`; undo/redo.
2. **Graph:** initial gain, and 1 when the option is omitted; τ 0.003/0.003/0.015; a muted start unmutes with τ 0.003; no-op after `disconnect`.
3. **Export maths:** 1.1/3 → `+0.8 dBFS`, `3 sample`, `0.9 dB`; exactly `MAX_24BIT_SAMPLE` → 0 and `null`; −1.2 counted; the `+0.0`/`0.1` edge; NaN.
4. **Context:**
   - Master Mute: one entry, Undo/Redo, no status text.
   - A change while playing calls `setMasterGain` on the live handle with no extra `applySchedule` call (spy through `vi.mock` of `graph.client` wrapping the actual function).
   - A new graph gets the current gain.
   - A pointer drag gives 1 entry; Undo is refused mid-drag.
   - Keyboard: one entry per key-up, and Undo flushes a pending preview.
   - Blur cancels a drag.
   - Master edits are refused during another gesture; track `Volume` and `Mute — მუსიკა` labels are unchanged.
5. **UI:**
   - Group, `aria-pressed`, min/max/step, readout `0.0 dB` → `−6.0 dB`, `aria-valuetext`.
   - Header placement: exit link < Master Mute, and Master Volume < Play.
   - **0 renders per Play frame:** Play → 450 ms → clear → 30× frames, with the frozen devtools-hook counting method.
6. **Dialog:**
   - The mute note appears only when muted, and the export button stays enabled.
   - The gain note appears only when the gain is ≠ 0.
   - The overload `role=alert` with `text-accent` is gone after `დახურვა`.
   - A clean export state has no `warning` key (`toEqual({phase,message})` plus an `Object.hasOwn` check).

## 3. Diff summary (against `b-round-24-snapshots/`; full `diff -u` in `a-round-25/diff-*.txt`)

| File | ± | Hunks and purpose |
|---|---|---|
| `types/arrangement.ts` | +5/−0 | `ArrangementMaster` interface; required `master` field. |
| `model.ts` | +35/−1 | Type import. `DEFAULT_ARRANGEMENT_MASTER`, `MASTER_GAIN_MIN_DB`, `MASTER_GAIN_MAX_DB`. `createArrangement` default copy. The l.118 `projectEnd({...})` literal gets `master` (Biome wrapped it over 4 lines). New `setMasterMix`, `masterLinearGain`, `formatMasterGainDb`. |
| `graph.client.ts` | +55/−6 | `masterLinearGain` import. `masterGain?` option. `setMasterGain` on the handle type. `ExportOverloadReport`/`ArrangementWavResult` types. `lastMasterTarget` initialised from the option. `setMasterGain` (no-op after disconnect; τ rule). New pure `measureExportOverload` and `formatExportOverloadWarning`. `renderArrangementWav` passes `masterGain`, measures the raw channels, keeps the identical clamp, and returns `{blob, peak, clippedSamples}`. |
| `ArrangementContext.tsx` | +172/−8 | Imports. 3 label constants. `warning?` on the export state. 6 value members. `MasterGainGesture` type. `masterBeforeRef`/`masterGestureRef`. `startGraph` passes `masterGain`. `syncPlayback` no-reschedule branch calls `setMasterGain`. `flushPendingMaster`, plus calls in `applyEdit`, `undo`, `redo` and `beginTrackVolumeGesture` (deps updated). New master actions block. `exportWav` destructures the result, adds the mute suffix and the optional `warning`. Unmount releases the master gesture. Value and deps. `scheduleKey` is unchanged. |
| `ArrangementMaster.tsx` | new | `<fieldset aria-label="Master">` with the hidden label, M, fader and readout. |
| `StudioWorkspace.tsx` | +7/−3 | Only the relative import, and the header render (the Master and the badge wrapped in one `flex items-center gap-3` div). |
| `ArrangementExportDialog.tsx` | +25/−0 | `formatMasterGainDb` import; the mute note, the gain note and the overload alert. |
| `schedule.test.ts` | +1/−0 | Only the fixture line `master: { gainDb: 0, mute: false }` (a literal, so there is no import hunk). |
| `master.test.ts`, `master-ui.test.tsx` | new | §2. |
| doc 031 | new | Georgian; covers every R25-Doc point. |

R25-S notes:
- Biome normalised the `'−'` escape in `formatMasterGainDb` to the literal U+2212 character. It is the same code point (`e2 88 92`).
- There are no `limiter`, `normalize` or `compress` words in the code or the UI. The words appear only in doc 031, which must say that the clamp is not a limiter.

## 4. code-reviewer findings and dispositions

I ran the real `code-reviewer` subagent, read-only, on 10 files. It found **no Critical and no High** issues and scored the change 8.5/10. Its review was static: it had no shell and ran no gates.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Medium | The export path is untested: `renderArrangementWav` is mocked in the UI tests, so removing `masterGain` from the offline render, or measuring the clamped data, would pass. | **FIXED.** Two `it` blocks were added to `master.test.ts`. They stub `OfflineAudioContext` and assert the offline master gain (−6 dB → 0.501187, 0 dB → exactly 1, mute → 0), the raw `peak` 1.2 and `clippedSamples` 2, and the WAV 24-bit sample values after the clamp (8388607, −8388608, 4194304, 0), read with `FileReader` from the real `encodeSfxWav` output. |
| 2 | Medium | The Master abort and unmount paths are untested. | **FIXED.** Three `it` blocks were added to `master-ui.test.tsx`: `pointercancel` reverts with no entry; `beginMasterGainGesture` returns `false` while another pointer owns a gesture, and that gesture is kept; unmounting mid-drag removes both capture listeners from window. |
| 3 | Low | Asymmetry: `previewTrackVolume` does not flush a pending Master change. It is unreachable today. | Track path not touched (spec). The invariant is **documented** in doc 031. |
| 4 | Low | The `+0.0` floor departs from the literal formula. | Already deviation 4; it is also stated in doc 031. |
| 5 | Low | Float edge cases in the half-up rounding and in `ceil`. | **Documented** in doc 031: R stays conservative. No code change. |
| 6 | Low | The 0-render test depends on real-time timing, like the frozen render-budget test. | Accepted; it uses the same numbers as the frozen test. |
| 7 | Low | No unit test compares 12 Master key-ups with 12 track key-ups. | Accepted; C runs this live (R25-H). The code paths mirror each other. |

**Red after the review fixes:** I copied the final test files into the scratch copy (snapshot sources: context `d9a14202`, graph `db337424`). Result: **35 failed / 35** (`a-round-25/red-final-scratch.txt`), including all 5 added cases. Then I removed the scratch `node_modules` junction (the link only; the store's `node_modules` is intact).

## 5. Command tails (actually run)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-24-tree-sha256.txt   → 50 OK, 0 FAILED   (a-round-25/sha-frozen.txt)
$ npx vitest run master.test.ts master-ui.test.tsx schedule.test.ts  → Test Files 3 passed (3) · Tests 47 passed (47)
$ npx vitest run render-budget export-dialog-focus graph ArrangementContext → Test Files 4 passed (4) · Tests 66 passed (66)
$ npx tsc --noEmit                                                   → exit 0, no output
$ npx vitest run                                                     → Test Files 59 passed (59) · Tests 1045 passed (1045)   (= 1010 + 35)
$ npm run build                                                      → exit 0 (client and server "✓ built")
$ npx biome check ./app                                              → exit 0; "Checked 326 files … No fixes applied. Found 218 warnings. Found 1 info." (= round 24)
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx         → 1 file changed, 21 insertions(+)
$ protected-baseline node check                                      → 4/4 OK
$ git status --short                                                 → see §5.1
```

The scoped `npx biome check --write` was run on the 10 owned code/test files. The first run reported 1 error, `lint/a11y/useSemanticElements` on `div role="group"`. I replaced the div with `<fieldset>`, and the re-run gave "Checked 10 files … No fixes applied." Biome reflowed the l.118 literal and normalised the `−` escape. The project has no `/check` skill under `store/.claude/skills`, so the scoped Biome run plus the read-only `./app` run stand in for it (deviation 3).

### 5.1 Final status

`git status --short` → **54 lines** (`a-round-25/git-status-end.txt`). These are the 47 baseline lines plus exactly these 7:
```
 M app/lib/arrangement/__tests__/schedule.test.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/components/arrangement/ArrangementMaster.tsx
?? app/lib/arrangement/__tests__/master-ui.test.tsx
?? app/lib/arrangement/__tests__/master.test.ts
?? docs/implementation/2026/quarter-IV/031-studio-lab-master-bus.md
```
After the final edits: `sha256sum -c b-round-24-tree-sha256.txt` → OK=50 FAIL=0; protected 4/4 OK; `Header.tsx` +21/−0 vs `cc1e531`.

Final owned file sha256 prefixes:
- `ArrangementMaster.tsx` d6548d21
- `master.test.ts` 93be4dcd
- `master-ui.test.tsx` ee7fafe1
- `ArrangementContext.tsx` 2ec43d1a
- `graph.client.ts` 63f1fdf9
- `model.ts` f67135a8
- `types/arrangement.ts` ac2eed7e
- `StudioWorkspace.tsx` 750c75e6
- `ArrangementExportDialog.tsx` dda9f265
- `schedule.test.ts` 1d5bd689
- doc 031 1060e617 (final)

### Browser smoke (§5; not a PASS claim)

gstack browse, state `a-browse.json`, the existing `:5173`, `/studio-lab` with the empty demo arrangement:
- **1440×900:** header 35 px and transport 49 px. The Master group is a `FIELDSET`, 256.9×20 at y=7. M is 20 px, the fader 96 px and the readout 64 px, with no overflow (scrollWidth = clientWidth = 64).
- **Master Mute:** a real `$B click` set `aria-pressed` to `true`, and a second click set it to `false`. Screenshot `a-round-25/header-1440-muted.png`.
- **Fader:** focus was set via JS (`$B focus` needs headed mode). After 12 real `$B press ArrowDown`, the readout is `−6.0 dB` (code points `2212 36 2e 30 20 64 42`), `aria-valuetext` is the same, focus stays on Master Volume, and the Undo button title is `Undo: Master Volume`.
- **1280×720:** header 35 px, transport 87 px, group at x=700 with height 20. Screenshot `a-round-25/header-1280.png`.
- **Console errors:** only the known anonymous `/api/cart` `ERR_CONNECTION_REFUSED` / "Failed to load cart".
- **Chrome a11y snapshot** (fresh load, 1440): `[group] "Master"` → `[button] "Master Mute"`, `[slider] "Master Volume"`, text `0.0 dB`; next comes the badge, then `[button] "Play"`. So the `<fieldset>` is exposed as role group with the name Master. **C should still verify this in its own tree (deviation 2).**
- **Readout extremes:** with the fader focused, a real `$B press Home` gave `−60.0 dB` and a real `End` gave `+6.0 dB`. The readout has scrollWidth = clientWidth = 64 both times, the header stays 35 px, and focus stays on Master Volume. The position after Home is `00:00.000`, but it was already 0, so this does **not** prove "Home does not seek"; that is left to C (R25-K, from a non-zero position).
- The banned-word grep (`limiter|normaliz|compress`) also finds nothing in the two new test files.

## 6. Deviations

1. **Parallel master gesture path rather than generalising `TrackVolumeGesture`.** B allowed either. The reasons are in doc 031: label safety, and the track diff is limited to added flush calls.
2. **`<fieldset aria-label="Master">` instead of `div role="group"`.** Biome `useSemanticElements` is an error. The fieldset's implicit role is `group`, so the accessible name and role are the same.
3. **No `/check` skill exists** in `store/.claude/skills`. I used the scoped `biome check --write` on owned files plus the read-only `./app` run.
4. **P is floored at 0.0** in the warning. A sample in `(MAX_24BIT_SAMPLE, 1]` is clipped, but its dB is a tiny negative. Without the floor the text would read `+-0.0`; a test covers this. R has no epsilon guard (B's formula as written).
5. **Extra exports beyond B's list:** `formatMasterGainDb` (model; shared by the readout and the dialog note), `measureExportOverload`/`formatExportOverloadWarning` (B's suggested names), and the types `ExportOverloadReport`/`ArrangementWavResult`.
6. **`ArrangementMaster` reads its accessible name from the fieldset.** The visible `Master` label is `aria-hidden` so it is not announced twice.
7. **Scratch dir:** `a-round-25/scratch/` (a copy of `app/` and the configs, with the final tests and a null `ArrangementMaster` stub) remains under my report folder. Its `node_modules` junction has been removed (the link only).

## 7. Known gaps / not verified by A

- Not measured by A: live tap levels (R25-MV/MM), the decay monotonicity, loop-wrap behaviour during a master change, the real export files (R25-E0/EO/E6/EM), the lane/scroller/floating-video geometry with `lay11` (R25-L), the full Tab order and Home/End/Space on the fader in a browser (R25-K), the network policy (G25-3), and C-R23-01 NUL offsets. These are all C's oracles.
- Not proven in a browser: Escape during a drag, the real-mouse drag (R25-T is a Tech Lead item), and video sound under Master Mute.
- **Edge-case self-check (§2.7), by reasoning and tests only:**
  - Mute while playing then Undo: tested; `setMasterGain(1)` is called and no graph is created.
  - Blur during a drag: tested.
  - A loop wrap: the graph is untouched, and `scheduleKey` is unchanged.
  - Mute with soloed tracks: the master gain is applied after track gains, so it is independent of them.
  - Video sound: it goes only through the graph.
  - Export while muted: tested; a real render with gain 0.
  - +6 dB over-range: the measurement is tested with the pure helper.
  - −60 dB: linear 0.001, not 0.

## 8. Exact next C checks

R25-MV, R25-MM, R25-ML, R25-E0 (byte-identical at 0 dB vs round 24), R25-EO (N vs FS, P, apply R and re-export), R25-E6, R25-EM, R25-H (N `Master Volume` vs N `Volume` for 12 presses; synthetic drag gives 1 entry), R25-K (1440 and 1280; Home/End/Space on the fader), R25-L (header 35, transport 49/87, rows and scroller, floating video 8,503 272×153), R25-R, R25-S (diffs in `a-round-25/diff-*.txt`), R25-U mutations (a)–(d) in a scratch copy, R25-Doc, G25-1..3, and the C-R23-01 record (the Master labels' code points after hydration).

## 9. Carried items (unchanged; for B/C follow-up)

- C-R23-01 (awaits the Tech Lead's decision: (a) React 19, or (b) an `entry.server.tsx` grant), C-R6-02 and C-R8-01.
- From `root-pre-push-review.md` / `publication-checkpoint.json`:
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip (now **visible** through R25-EO, with the clamp unchanged);
  - the final commit/push and the uncommitted round-6..25 tree;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the two foreign agent files;
  - the fake Bearer gets 500;
  - the CDP allowlist;
  - the checkpoint requirements (library/stems/scrollbars, T12);
  - the `text/html` charset observation.
- SRW-13 stages 2–4, LIB-SEP-REASON, and Tech Lead R25-T.
