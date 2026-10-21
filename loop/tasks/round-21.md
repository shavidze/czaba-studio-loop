# CURRENT TASK — Round 21: milestone full regression, run 2 of 2 (video/sync, C-R12-01, SRW-11B end to end) (D-29l)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this round.** C round 20 was a **PASS** with no new bug (`c-round-20.md`, `c-round-20.json`):
- all 17 run-1 IDs passed;
- R20-Doc and G20-1..3 passed; vitest 999/999.

No C bug can be fixed app-side right now:
- C-R6-02 and C-R8-01 wait for the Tech Lead's quiet Chrome run;
- C-R12-01 is assigned to this run (RF5-3).

The milestone regression therefore finishes now with **run 2**, on the same frozen tree (D-29k, D-29l). The milestone fix round comes after, and SRW-13 after that.

**A's part has no file change.** The loop always runs A. C flagged no stale store doc in round 20, so A gets no doc task. A only attests that the tree is untouched (§2). **Nothing under `store/` changes.**

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-20.md`.

**References.**
- B's record: `b-round-20.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-19, D-19a, D-19b, D-24, D-24a, D-29d..D-29l).
- Original acceptance texts:
  - `tasks/round-2.md` §SRW-02/03 (R2-V1, R3-V1, R3-V2, R3-V4);
  - `tasks/round-3.md` §SRW-05 (R5-L3, R5-E1);
  - `tasks/round-4.md` l.547–551 (the D-19 harness notes);
  - `tasks/round-5.md` l.136 (RF5-3);
  - `tasks/round-10.md` §4 (H1, H2);
  - `tasks/round-12.md` (H3, R12-S under D-19b);
  - `tasks/round-8.md`, `round-11.md`, `round-13.md` (R11-P*, R13-F*).
- Latest C values for SRW-11B:
  - `c-round-11.md` §2;
  - `c-round-13.md` §2;
  - `c-round-15.md` §8;
  - `c-round-16.md`..`c-round-19.md`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline.** HEAD `c5ed47b`, plus the round-6..20 dirty tree that C verified at the end of round 20 (`c-round-20/gates/git-status-*.txt`). It has 42 lines and is identical to `c-round-19/gates/git-status-end.txt`.
- B re-hashed the same 50 files into `../tmp/studio-real-loop/b-round-20-tree-sha256.txt`, and all 50 are OK on the live tree. Only doc 027 differs from the round-19 list (`9a75b672…`, equal to C's G20-2).
- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit them or delete them. Root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (A):** tree attestation only (§2). No source, test, style, config or doc change.

**In (C):** regression run 2 (§4.1):
- R2-V1, R3-V2, R3-V4, R5-L3 with adjacent R5-E1;
- C-R12-01 under RF5-3;
- SRW-11B end to end (R11-P1b, R11-P1c, R11-P2, R11-P3, R11-P4, R11-U), plus one information-only R3-V1 mode-D run;
- gates G21-1..3 and a real export sanity check.

R2-V1 is also the "one quick per ready FB" for FB-15. FB-02/FB-03 had theirs in round 20.

**Not in this round** (scheduled; not PASS):
- **Milestone fix round** (the next round):
  - every run-2 bug first;
  - then the A round-11 follow-ups: `aria-controls` on the lane fold button, Home on separators seeking, `ring-inset` on the track name, the panel found via `nextElementSibling`, and the silent fold refusal during a gesture;
  - then the `ArrangementLane.tsx:661` reason text.
  - It is bounded to one function or at most three related bugs per round, so it may split.
- **Then** SRW-13 (FB-04/05/14, including the R13-M4 export hard-clip, and M1/L8 if the Tech Lead run has not happened). After it, in dependency order: SRW-14 → SRW-15 → SRW-16, SRW-17, SRW-18 → SRW-19, and SRW-20. Then the SRW-21 adapter, then T12.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), and the manual list in §4.4.
- The lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected.** Nothing in the app, because `store/` is frozen. The risk is in the evidence: a regression result is valid only on the frozen tree, and G21-2 proves that tree.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and `c-round-20.md` §0–§1.
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-20-tree-sha256.txt`. Expect 50 OK. Report any difference **before** doing anything else, and do not "fix" it.
3. Post a short pre-flight gate at the top of your report: assumptions, "no file changes", and the commands that prove it.

## 2. A: tree attestation (no file change)

A runs the §5 commands and reports their real output tails:
- `sha256sum -c` gives 50 OK;
- tsc 0;
- vitest ≥ 999, 0 failures;
- the build passes;
- `git status --short` has 42 lines, identical to `c-round-20/gates/git-status-end.txt` (if that file is missing, compare with `c-round-19/gates/git-status-end.txt`);
- protected 4/4 OK;
- `Header.tsx` diff vs `cc1e531` is +21/−0.

**Not allowed:**
- any edit, create or delete under `store/`;
- Biome `--write`, `npm run check` or `npm run format`;
- browser use;
- starting or killing processes beyond the listed commands;
- claiming any PASS.

If a command fails, report it verbatim and stop. Do not repair anything.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx,detail-panel-polish.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..027}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `../tmp/studio-real-loop/a-round-21.md`, `a-round-21/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-21.md`, `c-round-21.json`, `c-round-21/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state (A does not browse) |

### 3.3 Frozen this round

**All 50 files in `b-round-20-tree-sha256.txt`, and everything else under `store/`.** In particular:
- all of `app/`;
- docs 015–027;
- `app/types/*`;
- `components/ui/Modal.tsx`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting round-6..20 work; killing processes you did not start; starting or stopping the dev server.

## 4. Acceptance (C)

Viewport 1440×900 unless stated. R11-P1b, R11-P2, R11-P3 and R11-P4 run at both 1440×900 and 1280×720.

**Harness rules:**
- "Real click" means `$B click` at the element centre, and keys mean real `$B press`.
- `$B type` goes only into an **enabled, focused** input. `Control+a` outside an input selects all clips.
- Pointer drags are synthetic with `buttons: 1`. Say so for each drag.
- At 1280 the detail panel may load collapsed (persisted state). Open it with a real toggle click before you measure.

**D-19 harness rules (`tasks/round-4.md` l.547–551):**
- Spy `currentTime`/`playbackRate` setters and log rVFC on **both** `<video>` nodes, or on `HTMLMediaElement.prototype`.
- Re-resolve `[data-video-role="active"]` on every sample.

**Sync rules:**
- **H1, H2 and H3** apply (`tasks/round-10.md` §4, `tasks/round-12.md`).
- **D-24/D-24a** exclusions apply.
- Report the dock counters (`data-video-swaps/fallbacks/hard-seeks/escalations/settles`) before and after every sync run.

**Setup.** Start from the demo arrangement. Build each layout through the UI or through the arrangement's own actions in page state, as in round 20. Record the exact clip table (lane, start, length, offset) before each check. If the demo differs from the original numbers, adapt them. Keep the assertion type and every tolerance, and write down the mapping. Fixtures are in `../tmp/studio-real-loop/media/` (`SHA256SUMS.txt`).

### 4.1 Regression run 2

**Budget, per layout:**
- **One valid execution** for a functional (non-sync) ID.
- A **sync layout** needs 3 valid runs, plus at most 2 extra attempts that may only replace runs the environment made invalid (name the cause).
- A real failure is a bug (`C-R21-NN`) with its severity, steps and evidence. Do not retry a real failure into a PASS, and do not widen any tolerance.
- If the run budget runs out, list every un-run ID under `blocked` as **not run**, never as PASS. B carries those IDs to the fix round.

**Layouts:**

| Layout | IDs | Kind |
|---|---|---|
| L-import | R2-V1 | functional, 1 valid |
| L-mute | R3-V2 | functional (mute flag, RMS, source counters; not drift), 1 valid |
| L-space | R3-V4 | functional, 1 valid (real presses + an 8 ms burst) |
| L-loop | R5-L3, R5-E1 | audio, 1 valid (3 wraps) + 1 export pair |
| L-first | RF5-3 + C-R12-01 | sync, 3 valid |
| L-panel | R11-P1b, R11-P1c, R11-P2, R11-P4, R11-U | functional, 1 valid per viewport |
| L-float | R11-P3 | sync, 3 valid (the R13-F5 method) |
| L-D | R3-V1 mode D | information only, 1 run |

- **R2-V1 (r2, FB-15).**
  - Upload `beeps-6s-vp9-opus.webm` through the picker, then drop `clip-4s-vp9-opus.webm` on the dropzone (synthetic `DragEvent` with a `DataTransfer` holding the `File`). The first clip is 0–d₁ with d₁ = 6.008 ± 0.02 (the browser-reported duration), and the second clip starts exactly at the first clip's end.
  - One Undo removes only the second clip; Redo restores the same id.
  - The status names each file.
  - MP4/MOV: accepted where `canPlayType` supports them; otherwise there is the clear probe error and nothing is added. Mark the positive MP4/MOV path "env-limited → Tech Lead in real Chrome", not PASS.
  - The network log during the import shows only `blob:`.
- **R3-V2 (r2).** Layout: the webm video clip at 0 plus a music clip.
  - Toggle the video lane's M during playback: `video.paused === false` throughout, `video.muted === true` always, and the source counters are unchanged (no restart).
  - Master RMS in the beep windows: < −80 dBFS while muted; audible within 100 ms of unmute.
  - Solo on music silences the video beeps.
- **R3-V4 (r2, D-19 form from `tasks/round-4.md` l.550).** Space ×10 with video + audio, as real presses plus an 8 ms synthetic burst:
  - no doubled sources (patch `AudioBufferSourceNode.start/stop` and count);
  - at the end, `video.paused === !isPlaying` for the active element;
  - **exactly 2 `<video>` elements, both paused and both at rate 1.**

  The round-2 text "exactly one `<video>`" is superseded by D-19. Do not fail on it.
- **R5-L3 (r3).** Loop 2–4, with music at 0 and Soft impact at 3. Play from 1.0 and let it wrap 3 times. Patch `AudioBufferSourceNode.start/stop`.
  - Each iteration: one source per clip that intersects [2, 4]. `start()` is called ≥ 100 ms before its `when`. `when(k+1)` = the previous stop, within 1 ms.
  - Master tap: no 5 ms window below −60 dBFS around the wraps while music is under them. At most one sounding source per clip.
  - The playhead and time readout stay within [2, 4] after the first wrap.
  - Separately, a brace whose end lies 2 s past `projectEnd` keeps wrapping: silence until `loop.end`, then the wrap. Playback does not stop at `projectEnd`.
- **R5-E1 (r3, adjacent).** The loop-on WAV export equals the loop-off export, maxDiff ≤ **1.2e-7** (the accepted `export-clip-onset-1lsb`).
- **RF5-3 (r5) + C-R12-01 (D-19b, D-29l).** Use the R3-V1 layout (video 0–6.008 and 8–12.008, plus music at 0) and a fresh Play from 1.
  - **RF5-3, verbatim, under H2:**
    - during the start hold, the active element is **paused until `play()` is issued**;
    - `play()` lands within [`startAt` − min(frameInterval, 20 ms), `startAt` + one measured rAF interval, max 34 ms];
    - the shown media time must not advance before `startAt` by more than one frame;
    - drift ≤ 0.1 for `startAt`..+100 ms and ≤ 0.06 for +100..+300 ms;
    - `data-video-settles` stays 0 until the first swap.
  - **C-R12-01 instrument.** Read the dock's own reference: inside the `playbackRate` setter spy, at the moment of each write, call the arrangement's `getLivePosition()` through C's existing read-only context reader (the `st20.js` pattern). Compute `d_dock = active.currentTime − (live − clip.start + clip.sourceOffset)`, where `clip` is the video clip that `live` maps to (the dock's `resolveVideoTarget` → `findVideoClipAt` in `app/lib/arrangement/video.ts`; read its boundary rule there, read-only). In the 6–8 s gap there is no target, so the row is out of scope. Log the harness's ctx-based `d` on the same row. No source instrumentation.
  - **Decision table** (for every rate ≠ 1 write outside a settle window, from Play to 2 s after the first swap):

    | Observation | Verdict |
    |---|---|
    | Any write with \|d_dock\| ≤ 0.02 | **New bug** (D-19 steady rule writes inside its own dead band), Medium unless audible. A new ID with its own round. C-R12-01 stays open and points to it |
    | Every write has \|d_dock\| > 0.02 (in all 3 valid runs) | **C-R12-01 closes** as a harness-reference artifact. Report the max \|d − d_dock\| |
    | No pre-arm write occurs in the 3 valid runs | C-R12-01 is **not reproduced**: report it as such, not closed. B decides |

  - The steady-state R12-S keeps its D-19b reading (from the first arm, outside the swap → +1.0 s settle windows; rate ≠ 1 only when the same row has |d| > 0.02). The 0.02 threshold is unchanged.
- **SRW-11B end to end** (the user flow; oracles are the current contract, with constants from `panels.ts` that equal the last C-passed values):
  - **R11-P1b, both viewports.** Collapse and expand the detail panel with real clicks: 36 px collapsed; default 144; the separator's real ↑/↓ steps by 16 and clamps at 120 and 280; `aria-valuenow` matches. While collapsed, `aria-valuenow` = the stored height and `aria-valuetext` = `დაკეცილია · {h} px` (N2). The timeline shrinks and grows and is never covered. No history entry.
  - **R11-P1c (1440).**
    - One clip selected → name, lane, start, length and offset, with the Georgian labels of round 19 (`c-round-19.md` §2). Several selected → the group summary. None → the empty state.
    - The range inputs apply inside the clip (one history entry), or refuse with a reason (history unchanged).
    - Play across the selected clip: the detail playhead moves by transform only. It causes no `useArrangement()` consumer re-render (the R9-D3 contract; `render-budget.test.tsx` green).
  - **R11-P2, both viewports.**
    - Fold a track → 36 px row, with M/S usable.
    - Track height by drag and by ↑/↓: 60–180 for audio and 52–180 for video, ±8 per key. The header aligns with the lane ±1 px.
    - A cross-lane clip drag and a marquee across mixed heights hit the right lane.
    - No history entry from fold or height.
  - **R11-P3, both viewports** (the R13-F1..F4 flows, with today's D-29e/D-29f placement):
    - ⤢ while playing → floating, with the **D-29f placement** computed from C's own measured rects (`c-round-15.md` §3): width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9)), top = max(body.t + 8, body.b − 8 − h), left = lib.l + 8. Tolerance is Δ ≤ 0.02 px, 16:9, inside the body, and no overlap with header/search/preview/separator. Check it at 1440/288, 1440/480, 1280/288 and 1280/480. The last C-passed values (`c-round-15.md` §3: 8,523 272×153; 8,450.5 429.33×241.48; 8,379.5 207.11×116.48; 8,379.5 235.55×132.48) are a reference only. If the body rect differs since round 15, the formula is the oracle, and C records the difference. The round-13 "272×153 at 8,92" is superseded by D-29e/D-29f. Do not fail on it;
    - drag (synthetic) and ⠿ + real arrows (+16 each) clamp to the viewport, with no history entry;
    - ✕, the placeholder button and Esc each return to the compact 160×90 dock. Esc priority with a focused search is unchanged (`c-round-15.md` §8);
    - ◀ on the expanded video → compact, with the verbatim status;
    - ⤢ from the collapsed rail → temporary open, then re-collapse on return;
    - the same `<video>` nodes throughout (`isSameNode`).
    - **Sync (L-float, 3 valid runs, the R13-F5 method):** |d| ≤ 0.1 outside the 300 ms windows after each observed layout change; 0 sets while seeking; counters reported.
  - **R11-P4, both viewports.** Screenshots of: detail open and collapsed, a folded track, the expanded video, and the library open and collapsed. Audit for:
    - no overlap or clipping;
    - 4 lanes + ruler + loop strip visible (auto-fit);
    - the shortcut hint line is one line (N1);
    - the compact dock ≥ 160×90.
  - **R11-U.** Re-run `panels.test.ts`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `track-layout.test.tsx`, `floating-video.test.tsx` and `render-budget.test.tsx`. Report the counts and confirm the sha is unchanged. A static read plus a green run is enough.
  - **R3-V1 mode D (information only).** One light-harness run with the panel open and music selected (`c-round-9/scripts/modeD.js`). Report max, cover, app LoAF and `tick` + mt p95. **This is not a C-R8-01 verdict and not a PASS/FAIL ID.**

### 4.2 Gates

- **G21-1:** tsc 0; vitest ≥ **999**, 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both); build passes; Biome 0 errors on `./app` (read-only).
- **G21-2:**
  - protected hashes 4/4 OK;
  - `sha256sum -c b-round-20-tree-sha256.txt` gives **50 OK**;
  - `git status --short` shows the same 42 lines as `c-round-20/gates/git-status-end.txt` (or `c-round-19/gates/git-status-end.txt`);
  - `Header.tsx` is identical to HEAD;
  - no change under `store/` at all.
- **G21-3:** anonymous `/studio-lab`, opened directly and via the header link:
  - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
  - media only from the 2 demo MP3s and `blob:`;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
  - `/studio/middle-east` shows "Sign in required".

  These are known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts` (a Vite module, not an R2 host).
- **Real export sanity:** one real `WAV-ის ექსპორტი` through the dialog, **with the imported webm video clip on the timeline** (video audio in the mix). Report the frames, duration, NaN count and the full-scale sample count. The oracle is internal consistency: duration = projectEnd as shown in the dialog, NaN 0, the FS count reported, and a valid header. It is **not** equality with the 18.000 s / 864 000-frame demo baseline of rounds 16–20, because the video clip changes the length. The R13-M4 hard-clip is a known carry.

### 4.3 A's attestation (R21-A)

C confirms that A changed no file:
- G21-2 holds;
- A's report is consistent with C's own gate numbers.

### 4.4 Carried, honest (not PASS, not new bugs unless they change)

Root (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..20 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4 and A round-19 deviation 5 (python processes; root);
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

Tech Lead manual checks: R23-1/2, R12-L4 (real drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`, and the positive MP4/MOV import path.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-20-tree-sha256.txt
npx tsc --noEmit
npx vitest run
npm run build
git status --short
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A needs no code-reviewer, because no file changes.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-21.md`:**
1. the pre-flight gate;
2. the verbatim command tails;
3. the statement "no file under `store/` changed", proven by sha 50 OK and the 42-line status;
4. deviations.

Do not claim PASS.

**C → `c-round-21.md` and `c-round-21.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (budget, with the reason);
- the C-R12-01 decision-table row, with the numbers;
- the setup mapping for each ID whose numbers differ from the original;
- the information-only mode-D numbers;
- the gates;
- carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 22: the milestone fix round.**
  - Run-2 bugs first (and a new D-19 bug, if the C-R12-01 table finds one).
  - Then the A round-11 follow-ups and `ArrangementLane.tsx:661`.
  - One function or at most three related bugs per round, so it may split.
- **Then:**
  - SRW-13 (FB-04 clip gain, FB-05 pan, FB-14 master volume/mute and the overload indicator; the R13-M4 hard-clip; M1/L8 if still open);
  - SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo, never audio stretch) → SRW-16 (FB-10 markers);
  - SRW-17 (FB-12 track groups);
  - SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
  - SRW-20 (range export, MP3).
- **Then** the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission), then T12.
- **Loop runner:** the `run-loop.ps1` default `RoundLimit` is 20. To dispatch this task, restart it with `-StartRound 21 -StartPhase A` and a higher `-RoundLimit`.
