# CURRENT TASK — Round 50: SRW-14 stage 3a (FB-13) — the play/insert position follows the grid (ruler click, playhead drag, lane-background click, clip-body click; paste follows the position); carried C-R49-01 and C-R49-02 test gaps

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap).
- Decision record: **D-29z15** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-49.md`.
- Round size: **one feature stage.** SRW-14 stage 3 is split in two so that each part can be checked on its own: **3a (this round)** = every gesture that sets the playhead / insert position; **3b (round 51)** = library drop ghost/drop and loop brace drag/keys. Nothing is dropped; 3b is scheduled.
- Carried with it, because they live in the test file this round must open anyway (SE10 changes contract): **C-R49-01** and **C-R49-02** (Low test gaps; test-only, no app code for them).

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-17 11:22 +04, `b-round-49/gates.txt`). If it is down, root restarts it. No agent starts or stops it.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never run `$B restart`.
> - Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** gstack has no mouse down/move/up and no held modifier during a click. REAL-mouse drags and Alt+click therefore use standalone Playwright (installed chromium, no install), as in rounds 47 and 49. This is a **deviation still pending root/user acceptance**. Label it `REAL-mouse (PW)`; never call it gstack. Plain clicks without a modifier may use gstack `$B click` (REAL).
>
> **Machine load:** `node.exe` was **33** at B's gates. Record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs.

## Why this round

**Round 49 result** (`c-round-49.md`, `c-round-49.json`): **C PASS** on every ID it ran — R49-S, R49-U (mutations a–m killed), R49-TRIM, R49-RANGE, R49-ALT, R49-GROUP, R49-S1 (stage 1 re-run on the reconciled tree, including AU-1 export decode onset 6.000 s), REG-HYD, G49-1 (83 files / 1418, `npm run verify` exit 0), G49-2, G49-3 (anonymous `/studio-lab`, token 401, `/studio/middle-east` → "Sign in required").
- **Closed by C evidence:** GROUP-LANE-REFUSAL-TEXT (GR-BEFORE), LANE-RANGE-OVERLAY-60 (RG-USE, computed alpha 0.3), DOC044-STATUS-LINE + DOC044-FINDINGS-PATH (R49-S), RECONCILE-STAGE1-RECHECK (§9).
- **New Low (test gaps, behaviour correct in the browser):**
  - **C-R49-01:** no committed test tells snap-then-clamp from clamp-then-snap for trim (mutation (n) survives; C's C49-N1 kills it).
  - **C-R49-02:** the UI `'out-of-range'` → "no lane ghosts" branch is unpinned (mutation (p) survives; C's GR-OUT shows the right behaviour).
- **Root afterwards** (`publication-checkpoint.json` → `round49`): committed **`038ed5a`** (`feat(studio): snap trim edges and ranges with Alt override`), verify 83 / 1418, smoke 2 PASS, actual code-reviewer (no code blockers, 8.5/10), and **four doc-045 accuracy fixes** (status line now "C PASS (2026-10-17)", final red counts 16/6, (n)/(p) survivors, the PW method gap). Both remotes at `038ed5a` (B's own `git ls-remote` at 11:22 confirms both).

**What stage 3a delivers (FB-13; user transcript `2.srt` 05:16–07:53: "clip movement **and the play position** must follow the chosen grid"):**
- With Snap on, every **pointer gesture that sets the position** lands on a grid line: a ruler click, a playhead-handle drag, a click on an empty lane, a click in a clip body.
- **Alt** bypasses snapping when Snap is on and temporarily enables it when Snap is off (Live 6.10, same rule as stage 2).
- **Paste** (Ctrl+V) uses the current position (SRW-09 contract), so after a snapped click it lands on the grid with no paste code change.

## Baseline

B verified on 2026-10-17 11:22 +04 (`b-round-49/gates.txt`, `tsc.txt`, `vitest-focus.txt`, `biome-app.txt`, `biome-app-errors.txt`):
- HEAD **`038ed5a45f94596a264c14c4ec834607cb407948`**, `git status --short` **empty**; `git ls-remote` on both URLs → `038ed5a`. If HEAD is a newer root commit, report it and continue only if `git diff 038ed5a --stat -- app docs` is empty.
- **Frozen list:** `../tmp/studio-real-loop/b-round-49-r50-tree-sha256.txt` → **401 OK** (run from `store/`). It contains every tracked `app/**` and `docs/implementation/**` file except the 5 owned tracked files below.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-49-r50-snapshots/`, `SHA256SUMS.txt` inside):

  | File | sha (first 8) | working-copy EOL |
  |---|---|---|
  | `ArrangementRuler.tsx` | `b529a97c` | LF (0 / 409 CRLF) |
  | `StudioWorkspace.tsx` | `c8cf3382` | **CRLF** (1658 / 1658) |
  | `ArrangementClip.tsx` | `031b6771` | LF (0 / 659) — root's commit left it LF; round 49 had it CRLF |
  | `grid-snap-edit.test.tsx` | `15c3294a` | LF (0 / 644) |
  | `grid.ts` | `57ec79e1` | LF (0 / 74) — LF since root's commit |

- Other checks:
  - protected 4/4 OK; tsc **0**;
  - focused vitest (grid-snap-edit, grid, grid-snap-ui, render-budget, gesture-reentry, gesture-guard, view): **7 files / 135 passed**;
  - full vitest at `038ed5a`: **83 files / 1418** (root, `publication-checkpoint.json` → `round49`; C49 G49-1);
  - `/studio-lab` 200.
- **Biome `./app` baseline (B, 11:22): 5 errors, 218 warnings, 1 info.** All 5 errors are CRLF-only `format` diagnostics: `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. (Round 49's 8 became 5 because root's commit left `ArrangementClip.tsx`, `ArrangementLane.tsx` and `grid.ts` LF.)
- **Line-ending rule (A and C):**
  - Owned files keep their current working-copy line endings: `StudioWorkspace.tsx` stays **CRLF**; `ArrangementRuler.tsx`, `ArrangementClip.tsx`, `grid.ts` and `grid-snap-edit.test.tsx` stay **LF**.
  - **Do not run `npx biome check --write` on `StudioWorkspace.tsx`** (it would only rewrite EOLs). The LF owned files may be checked with `npx biome check <file>` directly; they must report 0 diagnostics.
  - New files (the new test and doc 046) are written LF.
  - For `StudioWorkspace.tsx`, A checks format on an LF copy in scratch (`tr -d '\r'`) with `biome format`; it must report no changes.
  - Diffs against the snapshots use `diff -u --strip-trailing-cr`; C also uses `git diff`.
  - Line-ending churn is a finding. The 5 CRLF-only `format` errors on baseline files are not.
- **Before you edit:** confirm HEAD, the clean tree, 401 OK and the 5 snapshot shas. If anything differs, **stop and report**.

**Rules:**
- Do not revert, re-create or reformat anything. The round 47–49 grid code (integer-ms `snapTimeToGrid`, `resolveSnapStep`, validated select, `getArrangement()` nudge anchor) stays as it is.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Pure helper — `app/lib/arrangement/grid.ts` (one new export)

`resolveGridTime(time: number, snapSeconds: number | null, gridSeconds: number | undefined, bypass: boolean): number`
- `step = resolveSnapStep(snapSeconds, gridSeconds, bypass)`;
- `step === null` → return `time` **unchanged** (no rounding — today's free value);
- otherwise → `snapTimeToGrid(time, step)` (integer-ms, never below 0).

Nothing else in `grid.ts` changes. Existing exports stay byte-identical.

### 0.2 Ruler and playhead handle — `app/components/arrangement/ArrangementRuler.tsx`

- `ArrangementRulerProps` gains two **optional** props: `snapSeconds?: number | null` (default `null`) and `gridSeconds?: number` (default `undefined`). They reach `ArrangementRulerPlayhead` through the existing `{...props}` spread. A render without them behaves exactly as today.
- **Ruler click (no drag):** when `endRulerNavigation(navigation, seek)` seeks (`!navigation.moved && seek`), it calls `onSeek(resolveGridTime(navigation.anchorTime, snapSeconds, gridSeconds, bypass))`, where `bypass` is the **`altKey` of the `pointerup`** that ended the click. The abort/unmount paths (`seek === false`) do not seek, as today. The value may reach `endRulerNavigation` as a parameter or a field on the navigation object; A chooses and states it.
- **Ruler drag** (≥ `TIMELINE_DRAG_THRESHOLD_PX`): navigation (scroll/zoom) only, no seek, **unchanged**. Double-click Fit/zoom unchanged.
- **Playhead-handle drag:** in `handlePlayheadPointerMove`, `drag.time = resolveGridTime(pointerTime(event.clientX), snapSeconds, gridSeconds, event.altKey)` before `onScrub(drag.time)`. In `handlePlayheadPointerUp`, the `pointerup` branch uses `resolveGridTime(pointerTime(event.clientX), snapSeconds, gridSeconds, event.altKey)` for `onScrubEnd`; the cancel/lost-capture branch keeps `drag.time`. **Every scrub sample is snapped** (preview = commit, as for move/trim/range since round 47), so the line never shows a position the release will not keep.
- **Playhead ←/→ (±0.1 s):** **unchanged**, also with Snap on (decision D-29z15 P3, §0.6).
- No new state, effect, listener or export in this file. `pointerTime` itself is unchanged.

### 0.3 Workspace — `app/components/arrangement/StudioWorkspace.tsx` (two spots, CRLF kept)

1. `<ArrangementRuler …>` (l.1516–1527) gains `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}`, the same expressions the lanes already receive (l.1561–1562).
2. **Lane-background click** — in `handleLaneBackgroundPointerDown`'s `finish` (l.1043–1053), `latest.seekTo(gesture.clickTime)` becomes `latest.seekTo(resolveGridTime(gesture.clickTime, snapEnabledRef.current ? gridSecondsRef.current : null, gridSecondsRef.current, end.altKey))`. Alt is read from the **`pointerup`** (`end`). The marquee branch (`gesture.active`) and the cancel branch are unchanged.

Nothing else in `StudioWorkspace.tsx` changes: no new state, ref, effect, shortcut or status text. The `grid` import line gains `resolveGridTime` (one import edit is allowed).

### 0.4 Clip-body click — `app/components/arrangement/ArrangementClip.tsx` (one spot)

- In `finishGesture`, the range branch `if (!gesture.moved) { setTimeRange(null); seekTo(gesture.anchorTime); }` becomes `seekTo(resolveGridTime(gesture.anchorTime, snapSeconds, gridSeconds, event.altKey))`. Alt is read from the `pointerup`/`pointercancel` event passed to `finishGesture`.
- The seek is **not** clamped to the clip: the position is a timeline position, so a click at 7.3 in a clip that starts at 7.5 may seek to 7.000 (1 s grid). This is the smallest honest rule; C records it (CL-EDGE).
- **This is the one hunk allowed in `finishGesture`.** Round 49 required `finishGesture` to be byte-identical; that requirement is superseded for this single line. `beginGesture`, `handlePointerMove`, `DRAG_THRESHOLD_PX` and every other line of `finishGesture` stay byte-identical.
- The header click (move kind, no movement) still does not seek.

### 0.5 Paste — no code change

`pasteClipboard()` in `ArrangementContext.tsx` uses `livePosition()` (SRW-09). Because stage 3a snaps every pointer seek, Ctrl+V after a snapped click lands on the grid. A position reached otherwise stays as it is and paste uses it unchanged: during playback, after Stop at an arbitrary time, after ←/→ (±0.1 s) or after an Alt-click. **Decision D-29z15 P4** (§0.6). `ArrangementContext.tsx` stays frozen.

### 0.6 B decisions recorded for this round (D-29z15)

- **P1 — Alt for a click:** a click has no `pointermove`, so Alt is read from the event that completes the action: `pointerup` (ruler, empty lane, clip body). For a drag (playhead handle) it is read on every `pointermove` and on the final `pointerup`, like stage 2. Pressing Alt between down and up therefore counts.
- **P2 — playhead drag snaps every sample** (§0.2). Snapping only on release would show one position and commit another.
- **P3 — playhead ←/→ stays ±0.1 s with Snap on.** Live 6.9 confirms that arrow keys move the insert marker, but the saved manual text gives no step; the clip nudge (round 47) is a different command. Changing the playhead keys is not needed for the user's request ("play position follows the grid" refers to placing it). Loop-brace arrow keys, which Live 6.6 *does* tie to the grid, are planned in round 51 (stage 3b).
- **P4 — paste is not snapped by itself** (§0.5). Snapping inside paste would need the Snap state in `ArrangementContext` (it lives in `StudioWorkspace`), i.e. the edit-preferences slice that ARCH-CHECKPOINT-SRW14-PREFS is meant to decide. Paste follows the position, the position follows the grid on every pointer seek; that satisfies the request without opening the 2850-line context. Reopen on Tech Lead evidence (R50-T).
- **P5 — clip-body click is not clamped to the clip** (§0.4).
- **P6 — no maximum clamp** on the snapped ruler/playhead time (today's `pointerTime` has none either; a snapped value can exceed the drawn timeline only by less than half a division, and only when the timeline end is off-grid). C records the observed `aria-valuenow` at the far right (P-END).
- **ARCH-CHECKPOINT-SRW14-PREFS** is still unanswered (`publication-checkpoint.json` → `round49.open`). As planned in round 49 §7, stage 3a is built on the current structure (props, as for lanes and clips); it adds one more prop consumer (the ruler). B renews the request to root for a **bounded** checkpoint before the stage-4 dispatch (round 52), combined with the reviewer's `trimRequestOnGrid` / `rangeEndsOnGrid` signal (`b-round-49.md` §6). Non-gating.

### 0.7 Carried test gaps — `grid-snap-edit.test.tsx` (narrow grant)

Exactly these changes; every other line stays byte-identical:
1. **SE10 rewritten to the new contract** (its old expectation — unsnapped seek — is superseded by §0.4): Snap on 1 s, click in the music body (7–23) at x(7.3) → `range === null`, position **7.000** (`toBe(7)`). Rename the title accordingly.
2. **SE10b (new `it`):** the same click with `altKey: true` on the `pointerup` → position 7.3 (`toBeCloseTo(7.3, 9)`). `dragFrom` takes Alt only from the last move, so use the existing C49-N1 pattern: `dragFrom(parts.body, parts.root, x, [], { release: false })`, then `fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: x, clientY: MUSIC_LANE_Y, altKey: true })`. No helper changes.
3. **SE20 (new `it`, closes C-R49-01):** C's C49-N1, verbatim in substance (`c-round-49/tests/c49-supplement-cases.tsx.txt`): `clipAt('m1', 'music', 7.7, 3, 0.1)` (source start 7.6), Snap 1 s, left trim −10 px (request 7.45 → line 7) → start **7.600** (`toBeCloseTo(7.6, 9)`), status exactly `TRIM_START_BLOCKED`, `data-clip-start` `7.600` after release.
4. **SE21 (new `it`, closes C-R49-02):** group = music clip on `music` + a clip on `sfx` (the bottom lane); drag the music header one lane down (to `stems`) by a small dx with Snap off → **during the move** no element with `data-ghost-start` in any lane and status exactly `OUT_OF_RANGE_TEXT`; after release the commit is time-only (both clips keep their lanes, both starts moved by the same free delta, one Undo entry).

Helpers may be reused; no helper is renamed or changed. If a helper must change, **stop and report**.

### 0.8 Docs

- **New doc 046:** `docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Header: date; status `Round 50 — D-29z15; C-ის შემოწმებას ელოდება`; the project. Sections:
  - **კონტექსტი:** FB-13, stage 3 split into 3a/3b and why;
  - **მიდგომა:** `resolveGridTime`; the four entry points; Alt on `pointerup` for clicks (P1); playhead drag snaps every sample (P2); ←/→ unchanged (P3); paste follows the position (P4); no clamp to the clip (P5) or at the timeline end (P6);
  - **არქიტექტურა:** one Mermaid diagram: pointer event → `resolveGridTime` → `seekTo` / `onScrub` / `onScrubEnd`;
  - **შეცვლილი ფაილები**, **პრობლემები და გადაწყვეტები**, **ტესტირება** (including the method note: REAL-mouse (PW) under the pending GSTACK-NO-MOUSE deviation);
  - **the §4.9 Ableton table**;
  - **TODO:** stage 3b (library drop, loop brace drag + keys), stage 4, stage 5, R49-T, R50-T.
- Docs 001–045 are frozen.

### 0.9 Unchanged / out of this round

**Unchanged (frozen, in the 401 list):** `ArrangementContext.tsx` (`seekTo`, `scrubPlayhead`, `endPlayheadScrub`, `pasteClipboard` are called, not edited), `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `loop.ts`, `library.ts`, `selection.ts`, `model.ts`, `view.ts`, `ArrangementOverview.tsx` (navigation only, no seek), `ArrangementTransport.tsx`; every existing test file except the §0.7 grant.

**Not this round (scheduled, not deferred):**
- **Round 51 — stage 3b:** library drop ghost + drop position (`ArrangementLane.tsx` `libraryDropStart`, `DragEvent.altKey`), loop brace move/resize drag (`ArrangementLoopBrace.tsx`), loop-brace ←/→ by the grid (Live 6.6).
- **Round 52 — stage 4:** clip-edge snap (Live 6.7), right-click division menu on lanes (user, transcript 07:00), narrow/widen keys (Live 6.10 Ctrl+1/2).
- Stage 5 after SRW-15; SRW-16..20; Lows (C-R48-01, R26-M1, …); SRW-21; full regression and root review; T12.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):**
- free seek with Snap off (ruler, lane, clip body, playhead drag) — must be today's behaviour;
- ruler drag scroll/zoom and double-click Fit (no seek);
- marquee from an empty lane;
- clip-body range drag (stage 2) and its zero-width rule;
- playback restart from a snapped seek (audio actually starts there);
- Follow pause on ruler navigation;
- paste position;
- render cost of a drag and of a ruler click;
- SSR/hydration warnings.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-49-r50-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `cmp` each of the 5 owned files with its snapshot (`b-round-49-r50-snapshots/`), and `(cd ../tmp/studio-real-loop/b-round-49-r50-snapshots && sha256sum -c SHA256SUMS.txt)`;
   - protected 4/4, Biome numbers (5 / 218 / 1), `node.exe`.
3. **Read:**
   - `ArrangementRuler.tsx` (all), `grid.ts` (all);
   - `StudioWorkspace.tsx` l.297–330, l.960–1060, l.1500–1570;
   - `ArrangementClip.tsx` l.280–300 (`anchorTime`), l.504–520 (`finishGesture`);
   - `ArrangementContext.tsx` `seekTo` / `scrubPlayhead` / `endPlayheadScrub` (l.1087–1140) and `pasteClipboard` (l.1784–1815), read-only;
   - `grid-snap-edit.test.tsx` (mount helper, `dragFrom`, `xAt`, `positionOf`, `pressG`, `chooseDivision`) and `c-round-49/tests/c49-supplement-cases.tsx.txt`;
   - `b-round-46/ableton-6.7-6.10-20261016.txt` and `b-round-46/ableton-arrangement-view-20261016.txt` (6.2, 6.3, 6.6, 6.9, 6.10).
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.1–§0.4. Code rules:
- no comments, no `any`, no type assertions, no `@ts-ignore`;
- semicolons;
- no reformatting of unrelated lines;
- new exports: only `resolveGridTime`.

### 2.2 Tests

**(a) New file `app/lib/arrangement/__tests__/grid-snap-position.test.tsx`.** Same harness approach as `grid-snap-edit.test.tsx`: mount `StudioWorkspace` under `ArrangementProvider`, copy (do not import) the stubs, pointer-capture stubs. The ruler is `data-testid="arrangement-ruler"`, the handle `arrangement-playhead-handle` (read `aria-valuenow`). In jsdom the rects are 0, so a ruler/lane `clientX` maps to `clientX / 40` s; state it if the mounted zoom differs (`arrangement-zoom-readout`).

| ID | Case | Expected |
|---|---|---|
| SP1 | `resolveGridTime`: (7.3, 1, 1, false) → 7; (7.3, 1, 1, true) → 7.3; (7.3, null, 1, false) → 7.3; (7.3, null, 0.25, true) → 7.25; (7.3, null, undefined, true) → 7.3; (7.3456, null, 1, false) → 7.3456 (no rounding when free) | per §0.1 |
| SP2 | Snap off; ruler click (down/up, no move) at x = 292 (7.3 s) | position 7.3 (free, today's behaviour) |
| SP3 | Snap on 1 s; ruler click at 7.3, then at 7.6 | 7.000, then 8.000 (`toBe`) |
| SP4 | Snap on; ruler click at 7.3 with `altKey: true` on the `pointerup` only | 7.3 (bypass read from `pointerup`) |
| SP5 | Snap off, division 1; Alt ruler click at 7.3; then division 0.25, Alt click at 7.3 | 7.000, then 7.25; `data-snap="off"` after both |
| SP6 | Snap on; ruler drag down/move ≥ 3 px/up | no seek: position unchanged; the view changes as today (scrollLeft or zoom) |
| SP7 | Snap on 1 s; playhead handle drag: move to x(5.4) (read before release), then up at x(5.6) | `aria-valuenow` **5** during the drag; position **6** after release |
| SP8 | Snap on; playhead drag with `altKey: true` on the moves and the up, to x(5.4) | 5.4 during and after (free) |
| SP9 | Snap off; playhead drag to x(5.4) | 5.4 (today's behaviour) |
| SP10 | Snap on; focus handle at 7.000, ArrowRight | 7.1 (±0.1 s unchanged, P3) |
| SP11 | Snap on 1 s; click on an empty lane background at 4.6 s | position 5.000, active lane = that lane, selection cleared, range `null` |
| SP12 | Snap on; empty-lane click at 4.6 with `altKey` on `pointerup` only (down without Alt) | 4.6 |
| SP13 | Snap on; marquee drag on an empty lane over a clip | the clip is selected; position unchanged (no seek) |
| SP14 | Paste follows. Fixture: a 2 s clip on `sfx` at 4 (nothing else on `sfx`). Click its header (no move; this selects it **and** makes `sfx` the active lane — `ArrangementClip` calls `setActiveTrack`), Ctrl+C; Snap on; ruler click at 9.3; Ctrl+V | the pasted clip is on `sfx` and starts at **9.000**; status starts `ჩასმა (1): 00:09.000-ზე · ` and names the SFX lane; one Undo entry `ჩასმა (1)`; then Ctrl+Z, Alt ruler click at 9.3, Ctrl+V → start 9.3 (P4) |
| SP16 | P5: clip on `music` at 7.2–9, Snap 1 s, body click (no move) at x(7.3) | position **7** (outside the clip; not clamped) |
| SP15 | Snap on 10 s; ruler click at 4.9 | 0 (absolute nearest line, like F1) |

**(b) `grid-snap-edit.test.tsx` — the §0.7 changes only** (SE10 rewritten, SE10b, SE20, SE21).

**Red/green:** write the tests first and run them against the snapshot sources (scratch copy outside `store/` with the 5 snapshot files) → `a-round-50/red-run.txt`. Expected on the snapshots (nothing snaps there): **green** SP2, SP4, SP6, SP8, SP9, SP10, SP12, SP13, SE10b, SE20, SE21 (the Alt and Snap-off cases already give the free value; SE20/SE21 pin already-correct behaviour, which is the point of a test-gap fix — they go red under mutations (n)/(p) below); **SP1** fails on the missing export; **red** SP3, SP5, SP7, SP11, SP14 (its first half), SP15, SP16 and the rewritten SE10. Explain every difference. Explain every difference. Then the green run → `a-round-50/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; remove the `node_modules` junction with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-50/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | ruler click seeks `anchorTime` unsnapped | SP3 |
| (b) | ruler click ignores Alt (bypass always `false`) | SP4, SP5 |
| (c) | ruler click reads Alt from `pointerdown` instead of `pointerup` | SP4 |
| (d) | playhead drag snaps only on release (moves free) | SP7 |
| (e) | playhead drag ignores the step entirely | SP7 |
| (f) | ruler drag (navigation) also seeks | SP6 |
| (g) | playhead ←/→ snapped to the grid | SP10 |
| (h) | lane-background click unsnapped | SP11 |
| (i) | lane-background click reads Alt from `pointerdown` | SP12 |
| (j) | clip-body click unsnapped (round-49 code) | SE10 |
| (k) | clip-body click ignores Alt | SE10b |
| (l) | `resolveGridTime` rounds the free value to ms | SP1 |
| (m) | `resolveGridTime` uses a fixed 1 s when Alt-enabling | SP5, SP1 |
| (n) | C's (n): trim clamp-then-snap | SE20 |
| (p) | C's (p): only `'before-start'` suppresses lane ghosts | SE21 |
| (r) | the clip-body click clamps the snapped seek to the clip | SP16 |

If any of these survives, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source or rendered output; no snapshot tests; no fake timers.

### 2.3 After the code

- **Self-check:** the frozen suites of §4.8, then the full `npx vitest run` → **84 files / 1418 + 3 (SE10b, SE20, SE21) + your new-file `it` count, 0 failures** (SE10 is rewritten, not removed).
- **Biome:** follow the §Baseline line-ending rule. Then read-only `npx biome check ./app` → **≤ 5 errors, every one a CRLF-only `format` error on the baseline list**; ≤ 218 warnings; 1 info. The new test file has 0 diagnostics; `npx biome check` on the LF owned files (`ArrangementRuler.tsx`, `ArrangementClip.tsx`, `grid.ts`, `grid-snap-edit.test.tsx`) → 0; `npx biome lint app/components/arrangement/StudioWorkspace.tsx` → 0.
- **Review:** run the `code-reviewer` agent on the diff (6+ files). If your session cannot spawn subagents, say so; root runs it. Report findings and dispositions. **Architecture notes** go to B (`a-round-50.md` §5), not into the code.
- **Browser smoke** (A; one run; fresh state under `a-round-50/`; not a PASS claim): `/studio-lab` 1440×900 → G → REAL click on the ruler at ~7.3 s → the handle reads 7.000 (`aria-valuetext` `00:07.000`).
- **`/check`:** `npm run verify` → exit 0. Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.1 only (one new export) |
| `app/components/arrangement/ArrangementRuler.tsx` | A | §0.2 only |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.3 two spots + the grid import |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.4 one line in `finishGesture` + the grid import |
| `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` | A | §0.7 only |
| `app/lib/arrangement/__tests__/grid-snap-position.test.tsx` | A | new (§2.2 a) |
| `docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md` | A | new (§0.8) |
| `../tmp/studio-real-loop/a-round-50.md`, `a-round-50/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-50.md`, `c-round-50.json`, `c-round-50/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end** (7 paths):
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
 M app/lib/arrangement/grid.ts
?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
```
`sha256sum -c b-round-49-r50-tree-sha256.txt` at the end → **401 OK**, 0 non-OK. If root changes something meanwhile, record it as foreign and do not touch it.

### 3.2 Frozen this round

- All **401** files in `b-round-49-r50-tree-sha256.txt`, and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase/R2/auth/purchase code;
  - `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**` (root's).
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests (SE10 is rewritten in place, not deleted);
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server;
  - `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load. **Layout L50** = L49:
- the demo video at 0;
- `სრული მიქსი` on music at 7–23;
- `Soft impact` on SFX at 4–6;
- Master 0 dB;
- zoom 40 px/s unless stated (read `arrangement-zoom-readout`).

C may copy its round-49 setup chain into `c-round-50/`.

**Harness rules:**
- **REAL** = `$B click` / `$B press` / `$B type`. Drags and any click with Alt held are REAL-mouse (PW, labelled; pending GSTACK-NO-MOUSE): `mouse.down` / `move` / `up`, with `keyboard.down('Alt')` / `up`.
- **SYNTHETIC** (labelled) = dispatched events or `.focus()`. Never for acceptance IDs below.
- **Reads:** playhead handle `aria-valuenow` / `aria-valuetext`, the transport time readout, `data-clip-start`, `data-range-*`, `data-snap`, `data-grid-seconds`, the status line, the Undo button title. `window.__c` only for reads if the setup chain already provides it.
- No source instrumentation. Mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order if the session may end:** G50-2 → R50-S → R50-U → R50-RULER → R50-DRAG → R50-LANE → R50-CLIP → R50-PASTE → R50-PLAY → R50-REG → the rest. Write `c-round-50/checkpoint.md` as you go.

### 4.1 R50-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot, and `git diff`. Changes only where §0.1–§0.4 and §0.7 allow, with no line-ending churn:
  - `grid.ts`: one new export, existing lines byte-identical, LF;
  - `ArrangementRuler.tsx`: two optional props, the click-seek spot, the two playhead-drag spots, the import; LF;
  - `StudioWorkspace.tsx`: the two ruler props, the one lane-background seek line, the import; **CRLF kept** (count CRLF = line count);
  - `ArrangementClip.tsx`: one line in `finishGesture` + the import; `beginGesture`, `handlePointerMove`, `DRAG_THRESHOLD_PX` byte-identical; LF;
  - `grid-snap-edit.test.tsx`: SE10 rewritten, SE10b, SE20, SE21 added; everything else byte-identical.
- 401 OK; protected 4/4.
- Banned content in the diff and the new test: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, new component export, fake timers, snapshots.

### 4.2 R50-U — unit tests and mutations

- The new file and the changed `grid-snap-edit` are green. A's red run matches §2.2; otherwise A explains each difference.
- The frozen suites of §4.8 are green.
- C re-runs A's mutations (a)–(r) in its own scratch copy; each must fail its named test. **C extra:**
  - **(q):** `StudioWorkspace` passes `snapSeconds={gridSeconds}` to the ruler regardless of Snap → must fail SP2 and SP9 (the handle shares the ruler props);
  - **(s):** the clip-body click reads Alt from `pointerdown` (stored on the gesture) instead of the `pointerup` → must fail SE10b.

### 4.3 R50-RULER (REAL / REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| RU-OFF | Snap off; REAL click on the ruler at ~7.3 s | handle `aria-valuenow` = the free time (7.3 ± 0.025) |
| RU-1 | REAL `g`; REAL click at ~7.3, then at ~7.6 | **7** then **8** (`aria-valuetext` `00:07.000`, `00:08.000`) |
| RU-ALT | Snap on; PW Alt held, click at ~7.3 | free (7.3 ± 0.025); `data-snap="on"` stays |
| RU-ALT-ON | Snap off, division 1; PW Alt click at ~7.3; then select 0.25 (REAL select) and Alt click at ~7.3 | 7, then 7.25; `data-snap="off"` |
| RU-NAV | Snap on; PW drag the ruler horizontally ~100 px, then vertically ~60 px | scroll / zoom change as before; **no** position change; Follow pauses during playback as before |
| RU-DBL | Snap on; REAL double-click the ruler | Fit (status `Fit: …`) as before; the position may be set by the first click (record the value: it must be on the grid) |
| RU-10 | division 10, Snap on; click at ~4.9 | 0 |
| RU-1280 | RU-1 at 1280×720 | same |
| P-END | Snap on 10 s; click at the far right of the ruler | record `aria-valuenow` and the drawn timeline length (P6, record only) |

### 4.4 R50-DRAG (REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| DR-1 | Snap on 1 s; drag the playhead handle from 0 to ~5.4 s, read before release, release at ~5.6 s | `aria-valuenow` 5 during, **6** after; the playhead line in the lanes at the same x (± 1 px) |
| DR-ALT | Snap on; Alt held through the drag | free values during and after |
| DR-OFF | Snap off; same drag | free (today's behaviour) |
| DR-PLAY | during playback (REAL Space), Snap on, drag the handle to ~10.4 and release | playback continues from **10.000** (transport readout passes 10.0x right after release); stop with Space |
| DR-KEY | Snap on; focus the handle (REAL click on it), ArrowRight ×2 | +0.1 s each (P3, unchanged) |

### 4.5 R50-LANE and R50-CLIP (REAL-mouse (PW) unless stated)

| ID | Steps | Expected |
|---|---|---|
| LA-1 | Snap on 1 s; REAL click on the empty stems lane at ~4.6 s | position **5**; stems is the active lane; clip selection cleared; no range |
| LA-ALT | Snap on; mouse down without Alt, press Alt, mouse up (same spot) | free 4.6 ± 0.025 (Alt read on release) |
| LA-OFF | Snap off; REAL click at ~4.6 | free |
| LA-MARQUEE | Snap on; marquee drag on the empty stems/SFX area over `Soft impact` | `Soft impact` selected; position unchanged |
| CL-1 | Snap on 1 s; click (no move) in the music body at ~7.3 s | position **7**, no range |
| CL-ALT | same with Alt held | 7.3 ± 0.025 |
| CL-EDGE | Snap on; move `Soft impact` to 4.3 first (Snap off, header drag), then Snap on and click its body at ~4.4 | position **4** (outside the clip: not clamped, P5) — record |
| CL-RANGE | Snap on; body range drag 7.3 → 9.6 (stage 2) | `{7, 10}` as in round 49 (regression) |

### 4.6 R50-PASTE and R50-PLAY

| ID | Steps | Expected |
|---|---|---|
| PA-1 | REAL click `Soft impact` (selects it and makes SFX the active lane), REAL Ctrl+C; Snap on; REAL ruler click ~9.3; REAL Ctrl+V | a new clip on SFX at **9.000** (`data-clip-start`); status `ჩასმა (1): 00:09.000-ზე · … ხაზზე` naming the SFX lane (record the exact text); Undo `ჩასმა (1)`; REAL Ctrl+Z removes it |
| PA-ALT | PW Alt ruler click ~9.3; REAL Ctrl+V | new clip at 9.3 ± 0.025 (P4, record) |
| PL-1 (real audio) | Video Mute (REAL). Snap on 1 s; REAL ruler click ~3.6 → handle 4; REAL Space; sample the SFX track meter and the transport readout (AU-2 method from round 49) | playback starts at 4.000 and the SFX meter is above −∞ by readout ≤ 4.15 s |
| PL-OFF | Snap off; ruler click ~3.6 (free 3.6); Space; same sampling | the SFX meter stays −∞ until readout ≥ 3.95 s (about 0.4 s of silence) — the contrast proves that playback really starts from the snapped position |

### 4.7 R50-REG — directly related regressions

- REG-HYD: fresh load 1440×900, console for 3 s → no hydration-mismatch, React or `useLayoutEffect` warning. Record the C-R23-01 NUL count and offsets (a move is not a fix).
- Stage-2 trim (TR-1) and Alt move (AL-1): one run each, same results as round 49.
- G toggle and division select: status texts unchanged.
- Render cost: `render-budget.test.tsx` green in the full run.

### 4.8 Gates and frozen suites

**G50-1:**
- tsc 0;
- vitest = **84 files / 1418 + 3 + the new-file `it` count, 0 failures** (record `node.exe`; re-run a timed-out file alone and report both runs; a recurrence of C-R48-01 is recorded under that ID);
- build passes;
- Biome `./app` read-only: ≤ 5 errors, all CRLF-only `format` errors on the baseline list; ≤ 218 warnings; 1 info; the new file and the LF owned files 0 diagnostics; `biome lint` on `StudioWorkspace.tsx` 0;
- **`npm run verify` exit 0**.

**G50-2:** protected 4/4 OK; 401 OK; `git status --short` = §3.1; HEAD at the start and at the end.

**G50-3 (anonymous workspace and purchase protection), fresh browse state:**
- `/studio-lab` direct and via the header link shows the workspace with the demo badge;
- no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code;
- anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401;
- `/studio/middle-east` → "Sign in required".

Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Frozen suites** (A self-check, C G50-1): the new file; `grid-snap-edit`; `grid`; `grid-snap-ui`; `selection`; `model`; `gesture-reentry`; `gesture-guard`; `track-layout`; `render-budget`; `context-hygiene`; `view`; `ArrangementContext.test.ts`; `delete-selection-ui`; `all-lane-clipboard`; `clip-gain`; `detail-panel-polish`; `ssr-layout-effect`.

**Not re-run this round (not PASS):** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root only).

### 4.9 Ableton source and compliance (workflow addendum 2026-10-11)

**Sources (existing records, no new fetch this round):**
- Live 12 Reference Manual, chapter 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/` — sections **6.2/6.3** (scrub area, transport), **6.6** (loop brace), **6.9** (`#selecting-clips-and-time`), **6.10** (`#using-the-editing-grid`). Fetched by B with gstack browse on 2026-10-16; text in `b-round-46/ableton-arrangement-view-20261016.txt` and `b-round-46/ableton-6.7-6.10-20261016.txt`. B re-read both for this task (2026-10-17) and made **no new fetch**.
- No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clicking the arrangement background places a point in time (insert marker) | 6.9 "Clicking into the Arrangement background selects a point in time, represented by a flashing insert marker" | **Confirmed** (text) | same: an empty-lane click sets the position | LA-1 |
| That point follows the editing grid | 6.10 "the cursor will snap to grid lines" (general statement; the insert marker is not named) | **Confirmed in general terms** | same, while Snap is on | LA-1, CL-1 |
| Alt during the action bypasses / temporarily enables the grid | 6.10 "hold down the Alt (Win) … while performing an action to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it" | **Confirmed** (text) | same; for a click Alt is read on release (P1) | RU-ALT, RU-ALT-ON, LA-ALT, CL-ALT |
| A click inside a clip's waveform sets the insert point | 6.9 names clicking a clip (selects the clip) and dragging in the waveform (selects time); a plain click in the waveform is not described | **Unconfirmed** | CZABA: body click = position (SRW-04/round 49), now snapped. Round 49's §4.8 row called this "confirmed" — **that over-claimed**; corrected here | CL-1 |
| Clicking the scrub area above the tracks | 6.2/6.3 "Clicking anywhere in the scrub area launches playback from that point … the jump between triggered play positions is quantized based on the Quantization Menu's value" | **Confirmed** (text) | **Deliberate difference:** CZABA's ruler click moves the playhead without starting playback (SRW-04, D-27) and uses the editing grid, because CZABA has one grid and the user asked that the play position follow it; there is no launch quantization in CZABA | RU-1 |
| The beat-time ruler drag scrolls/zooms | 6.2 "drag left or right to scroll … drag vertically to zoom" | **Confirmed** | same, unchanged, no seek | RU-NAV |
| Dragging a playhead handle | none found (Live's scrub-area hold loops playback by launch quantization) | **Not applicable** / unconfirmed | CZABA's draggable handle (SRW-04) snaps every sample (P2) | DR-1 |
| Arrow keys move the insert marker | 6.9 "The insert marker can then be moved in time with the left and right arrow keys" (no step stated) | **Confirmed** (that they move it); the step is **unconfirmed** | CZABA keeps ±0.1 s (P3) | DR-KEY |
| Paste goes to the insert marker | 6.9 describes select-then-command (Paste) but not the paste location | **Unconfirmed** | CZABA: paste at the current position (SRW-09); follows the grid through the snapped position (P4) | PA-1, PA-ALT |
| Loop-brace arrows nudge by the grid | 6.6 "The left and right arrow keys nudge the loop brace … based on the current grid settings" | **Confirmed** (text) | **stage 3b (round 51)** | — |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R48-01 (Low, render-budget :547 cold flake; did not reproduce in round 49);
  - C-R41-01 (Low, TL-Q-VIEWPORT);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome; C-R27-01 includes RF3-1, RF3-2, R5-L6);
  - C-R23-01 + C-R38-01 (Tech Lead).
- **Closing this round if green:** C-R49-01 (SE20), C-R49-02 (SE21).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, A-R47-GROUP-LANE-DELTA, F1 (D-29z14).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK (info), SHIFT-BEFORE-DOWN-NOTE; recorded reviewer risks R49-OUTWARD-TRIM-SHRINK and R49-WIDE-DIVISION-RANGE (→ R49-T(3) / stage 4).
- **Root items:** ARCH-CHECKPOINT-SRW13; **ARCH-CHECKPOINT-SRW14-PREFS** (still unanswered; renewed, wanted before round 52); GSTACK-ACL; GSTACK-NO-MOUSE (pending acceptance); SRW-21; the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T (1–3), and **R50-T**: real mouse, Snap on: (1) click the ruler, an empty lane and a clip body — the playhead lands on the line you expect; (2) paste after such a click lands on the grid, and whether you also expect paste to snap after Stop/←/→ (P4); (3) Alt+click in real Windows Chrome (app-menu question as in R49-T(2)).

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-49-r50-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-49-r50-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/ArrangementRuler.tsx app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/grid.ts; do cmp -s "$f" "../tmp/studio-real-loop/b-round-49-r50-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/view.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the one named in §2.2.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173` and do not start or stop servers. If it is down, say so and do the offline items (G50-1/2, R50-S, R50-U).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-50.md`:**
1. the pre-flight gate and §1.2 baseline;
2. red run per case, mutations (a)–(r), green run;
3. diff summary per file (with EOL counts);
4. smoke result;
5. code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on);
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-50.md` and `c-round-50.json`** (the usual schema). For each ID give PASS, FAIL (with a bug ID) or **not run** (with the reason):
- R50-S and the R50-U mutation table, including C's (q) and (s);
- R50-RULER, R50-DRAG, R50-LANE, R50-CLIP, R50-PASTE, R50-PLAY, with REAL / REAL-mouse (PW) / SYNTHETIC labels;
- R50-REG, REG-HYD, G50-1..3;
- the Ableton two-verdict table (§4.9);
- C-R49-01 / C-R49-02 closure verdicts;
- the carried items.

`passed` lists only IDs C ran in this round. State **commit readiness** for root (the 7 paths).

## 7. Next (orientation only; not this round)

- **Round 51 — SRW-14 stage 3b:** library drop ghost + drop position on the grid (`ArrangementLane.tsx` `libraryDropStart`, Alt from `DragEvent`), loop brace move/resize drag on the grid (`ArrangementLoopBrace.tsx`), loop-brace ←/→ by the grid (Live 6.6; `stepLoopRange` in the context, to be read first).
- **Round 52 — stage 4:** clip-edge snap, right-click division menu, narrow/widen keys; preceded, if root answers, by the ARCH-CHECKPOINT-SRW14-PREFS result and the `trimRequestOnGrid` / `rangeEndsOnGrid` signal.
- **Then:** stage 5 after SRW-15 (BPM grid, bars/beats, metronome; R14-G1), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, Lows (R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY, C-R48-01), SRW-21 adapter, full regression and root review, T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 50 -StartPhase A` and a higher limit.
