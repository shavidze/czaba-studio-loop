# CURRENT TASK — Round 117: fix C-R116-01 (lane-slider test scope in track-group-mix-ui), then publish rounds 116 and 117 together

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~20:37–21:15 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-116.md` (an exact copy). Rationale: `b-round-116.md`. Decision record: **D-29z82** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** a bug fix-up round with one Medium bug, test scope only. No app code changes.
- **Baseline (not a clean commit):** HEAD is `d5de68fe27c165b00b5578f016703af90730500b`, the last published commit. Gate 116 is `skipped` because C FAILed. On top of that commit sits the round-116 working tree that C verified (11 ` M` + 3 `??`). `git status --porcelain | md5sum` = `49a4b7cd717023e3a2c52dd5912658c1`. That is the same value C recorded at its round-116 start and end, which is the chain of custody. **Keep this work. Do not revert it, stash it or redo it.**

## 0. Why this round
- **C round 116 = FAIL only on T116-TARGETED (367/370).** Every real-browser row passed at 1440×900 and 1280×720 with `browserVerified: true`, including:
  - G-T3 0.501187;
  - G-T4 1.412537;
  - G-INF: 0 non-zero samples;
  - G-VIDEO 0.501187;
  - TV-PLAY: 10.78 dB drop, 0 new sources.
- **C-R116-01 (Medium):** `track-group-mix-ui.test.tsx` UM3, UM5 and UM9 still write **linear** values into the **lane** Volume slider. The slider is now in dB, so these tests are red, and the gate's full vitest would be red too.
  - Root cause: in round-115 planning B built the grant list from a grep that was too narrow. This is B's defect, not A's. A stopped correctly and did not edit the file.
- **B's grep at this planning:** read-only, over the whole `app` and `e2e` test tree, for lane slider queries (`Volume — `, `laneFader(`, `trackVolume(`), linear `fireEvent.change` values and `%` readouts.
  - Lane-driven writes exist only in the 11 round-116 grant files, in `track-volume-db.test.tsx` and in this file. `pan-release-recovery`, `pending-status` and `track-layout` match only as selectors or context-driven lines; they ran green.
  - The other slider tests (`detail-panel`, `export-dialog-footer`, `grid-snap-position`, `library-preview`, `marker-edge-nav-ui`, `marker-time-snap-ui`, `markers-ui`) have no `Volume` or `.volume` match.
  - `e2e` has no match.
  - Remaining linear `fireEvent.change` values: `clip-gain-fader:567` (Clip Gain fader), `fader-focus-order:331` (pan), `grid-snap-keys:446` (grid select), and `track-group-mix-ui:477/492/671` (group faders). None of them is a lane Volume write.
- **Regression round:** `regression-last.json` is 2026-10-21. B planned at 2026-10-23 20:37 UTC, so 2 days have passed and it is not due yet. **The next B planning on or after 2026-10-24 is the REGRESSION round. T12 stage 3b comes after it.**
- **Not in this round:** any app source change. That includes OBS-2 `aria-hidden`, any readout tweak, the group dB fader and Shift fine (3b).

## 1. B rulings (D-29z82)
- **R1 — the grant (scale-only, exact).** A adds `import { trackVolumeFromDb } from '../track-volume-db';` and changes exactly these lines. The line numbers are from the current file, which is unchanged since `d5de68f`.

| Line | Test | Now | New | Formula |
|---|---|---|---|---|
| l.480 | UM3 | `dragFader(stemsFader, 12, -50)` | **unchanged** | — |
| l.482 | UM3 | `expect(trackVolume(api, 'stems')).toBe(0.5)` | `.toBe(trackVolumeFromDb(-30))` | start 0 dB (stored 1); −50/100 × 60 = −30 dB |
| l.522 | UM3 | `expect(trackVolume(api, 'stems')).toBe(0.5)` | `.toBe(trackVolumeFromDb(-30))` | the same lane drag value after two Undos; the `0.6` at l.518/l.521 is context-driven and stays |
| l.569 | UM5 | `keyboardFader(laneFader(view, 'სტემები'), '0.5')` | value `'-6'` | 0.5 → 20·log10 0.5 = −6.02 → −6 dB |
| l.571 | UM5 | `expect(trackVolume(api, 'stems')).toBe(0.5)` | `.toBe(trackVolumeFromDb(-6))` | — |
| l.575 | UM5 | `toEqual({ video: 1, music: 1, stems: 0.25, sfx: 0.5 })` | `stems: trackVolumeFromDb(-6) * 0.5`, all else unchanged | see R2 |
| l.657 | UM9 | `fireEvent.change(pending, { target: { value: '0.7' } })` | value `'-3.1'` | 0.7 → −3.10 → −3.1 dB |
| l.660 | UM9 | `expect(trackVolume(api, 'stems')).toBe(0.7)` | `.toBe(trackVolumeFromDb(-3.1))` | — |

- **R2 — the UM5 l.575 matcher.**
  - `trackEffectiveGains` (`schedule.ts`) computes `chain.reduce((p, g) => p * trackGroupVolume(g), track.volume)`.
  - The stems chain is G1 = `0.5`, then G2 = `trackGroupVolume` default `1` (`groups.ts:93`, `group.volume ?? 1`).
  - Both factors are exact binary fractions, so `trackVolumeFromDb(-6) * 0.5` is bitwise equal to the reduced product.
  - The matcher stays an exact `toEqual`. Line l.576 `toEqual(storedGains(api))` stays unchanged.
  - **STOP:** if the exact match still fails (for example because the fake `gain.value` is stored as float32), A stops and reports the received value. A does not loosen the matcher.
- **R3 — must stay unchanged.**
  - Every group-fader line in this file: l.472–478, l.487–517, l.570, l.572, l.671 and the rest.
  - Every context-driven line (l.510–521: `previewTrackVolume('stems', 0.6)` / `previewGroupVolume` and their expectations) and l.523.
  - Every line in every other test.
  - The steps, pixel deltas, pointer ids, test titles, and the counts of `expect(` and `it(`.
  - No `toBeCloseTo`, no looser matcher.
- **R4 — doc 100.** Doc 100 is A's round-116 untracked file. A appends one bullet to its **ტესტირება** section: „Round 117 (D-29z82): `track-group-mix-ui.test.tsx` UM3/UM5/UM9 — ხაზის slider-ის სკალაზე დამოკიდებული ხაზები dB-ზე გადავიდა (C-R116-01).“ Line l.4 stays „Round 116 — C-ის შემოწმებას ელოდება …“. Root or B updates it after the gate.
- **R5 — round-116 observations.** These are ruled now. A changes nothing for them in this round.
  - **OBS-1 (`+0.0` on the lane vs `0.0 dB` on the Master):** A's deviation 1 is accepted. R7 named both `formatMasterGainDb` and the `+0.0` examples, so the spec contradicted itself. That is B's defect.
    - The lane keeps `+0.0`. The mismatch with the Master is the Low **LANE-MASTER-ZERO-SIGN**, now in `deferred_low_polish`.
    - Stage 3b's group fader must use `formatTrackVolumeDb`, so the lane and the group agree.
  - **OBS-2 (readout read twice by a screen reader):** Low **LANE-READOUT-DOUBLE-READ**, now in `deferred_low_polish`.
  - **OBS-3 (`as const`):** accepted. It is a const assertion and an existing repo pattern. The project's no-type-assertion rule targets `as T` casts.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` | R1/R2 only, plus the import |
| `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md` | R4: one bullet |

- **Frozen:** `tmp/studio-real-loop/b-round-116-r117-tree-sha256.txt`, 928 entries. These are every tracked file plus the two round-116 untracked code files (`track-volume-db.ts`, `track-volume-db.test.tsx`), at their C-verified content. The only exclusions are the two files above.
  - A runs `sha256sum -c --quiet` at the start and the end and reports OK/FAIL.
  - `ArrangementLane.tsx`, `track-volume-db.ts`, `track-volume-db.test.tsx`, doc 099 and the 9 round-116 granted tests are frozen. Round-116 browser evidence carries over only because they do not change.
- **Expected end state:**
  - the round-116 set unchanged: ` M` for `ArrangementLane.tsx`, `clip-gain-fader`, `clip-gain-multi`, `context-hygiene`, `fader-click`, `fader-focus-order`, `fader-guards`, `fader-touch`, `gesture-guard`, `track-group-collapse-ui` and doc 099; `??` for `track-volume-db.ts`, `track-volume-db.test.tsx` and doc 100;
  - **plus** ` M app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx`.
  - No other path.
- **A stops and reports (file, line, assertion; no edit; B rules) if:**
  - a needed change is outside R1;
  - the R2 exact match fails;
  - any other targeted test is red.
- **Before editing, read:**
  - `.claude/primitives-map.json`
  - `TESTING_QUALITY_GATES.md`
  - `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md`
  - `AGENT_DISCOVERABLE_CODE.md` (import naming)
- **Use the Edit tool for the edits, not shell replacements,** so the project's primitives hook fires. This answers round-116 deviation 3.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no type assertions, semicolons, no code comments.
- **Forbidden:**
  - Everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`, including the protected files:
    - `app/routes/studio.$productId.tsx` `fa2cf0bc`
    - `app/routes/api.studio-token.ts` `13914809`
    - `app/lib/auth.ts` `56f5b76f`
    - `app/contexts/AuthContext.tsx` `bf9ee257`
  - All app source and every other test.
  - These actions: commit, push, stash, checkout, reset, deploy, dev-server restart, `npm run check` (`--write`), `npm run format`.

## 3. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed test file.
- `npx vitest run` on the same 19 files as round 116:
  - `track-volume-db`;
  - the 11 round-116 grant files: `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `pan-release-recovery`, `gesture-guard`, `context-hygiene`, `pending-status`, `track-group-collapse-ui`, `clip-gain-fader`, `clip-gain-multi`;
  - `track-group-mix-ui`, `master-ui`, `track-layout`, `clip-gain`, `status-announcement-ui`, `self-disabling-focus`, `render-budget`.
  - Also run `meter-ui` and `track-pan`.
  - **Expected:** 19 files, **370/370**. `meter-ui` + `track-pan` green (38 in round 116).
- **Mutation proof:**
  - (k1) Put back l.569 `'0.5'`. UM5 must turn red.
  - (k2) At l.575, use `stems: 0.25`. UM5 must turn red, which shows the matcher is exact.
  - Restore after each mutation and verify with sha256.
- No full suite, no `npm run verify` (the gate runs those). No code-reviewer is needed: fewer than 3 files change.
- **A's report (`a-round-117.md`):**
  - start HEAD, status md5 and frozen OK;
  - every changed line as `old → new`;
  - `expect(` and `it(` counts before and after;
  - test counts;
  - k1/k2 results;
  - typecheck and lint results;
  - frozen OK at the end;
  - end status and its md5;
  - deviations.

## 4. C — rows
Use real Playwright Chromium with a fresh context per session, at 1440×900 and 1280×720. Setup is the same as round 116: music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s and SFX `demo-soft-impact` @4 s, all from the library at the insert marker; Snap off; Stop state.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T117-TARGETED** | Re-run A's 19-file vitest list (+ `meter-ui`, `track-pan`). Targeted only. | 370/370 and green. Same counts as A. |
| **LANE-WRITE-GREP** | Read-only: grep `app` + `e2e` tests for lane Volume slider writes (`laneFader(`, `name: /^Volume — `, `aria-label^="Volume"`, `keyboardFader(` on a lane, `fireEvent.change` on a lane fader) | Every file with a lane write is in the T117 list. List any other file found as a finding. |
| **AN-REVIEW** | `git diff` of `track-group-mix-ui.test.tsx` and doc 100 | Only R1 lines and the import. `expect(`/`it(` counts unchanged. Group and context lines untouched. Exact matchers only. Doc 100 has the R4 bullet only. |
| **SOURCE-SCOPE** | `git status`, frozen list, protected hashes | The §2 end state exactly. `sha256sum -c` of `b-round-116-r117-tree-sha256.txt` OK. Protected hashes unchanged; `git diff d5de68f` on them is empty. |
| **TV-PRESENT** (both viewports, 1 run each) | load | Every lane slider: `min -60`, `max 0`, `value "0"`, `aria-valuetext` `+0.0 dB`, readout `+0.0`. |
| **TV-DRAG** (both, 1 run each) | music lane −20 px | Δ = `20/w × 60` ± (0.1 + `60/w`) dB. Readout and valuetext agree. One `Volume` entry (sentinel method). Ctrl+Z → `+0.0`. |
| **NB-GROUP** (both, 1 run each) | Ctrl+G stems+SFX, group fader −20 px, Undo | Group shows `%`, one entry. The lanes inside keep `+0.0`. |
| **G117-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace, 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)**. |
| **PX-NET / REG-HYD** | every session | 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise. |
| **DOC-100** | read | R4 bullet present; l.4 unchanged. |

- **Carried from `c-round-116.json`, not re-measured:** TV-LAYOUT, TV-EXACT-UNDO, TV-INF, TV-KEY, TV-DBL, TV-PLAY, G-T3, G-T4, G-INF, G-VIDEO, NB-TRACK-SHIFT, NB-MASTER, NB-CLIP, NB-PAN-MS.
  - These carry over because SOURCE-SCOPE proves the app code is byte-identical to the round-116 tree (policy: no re-measuring unchanged code).
  - If SOURCE-SCOPE fails, the carry-over is void and C reports that.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbours that could break:** group-fader and context lines in the same file (AN-REVIEW, T117-TARGETED). App behaviour cannot change, because the app source is frozen (SOURCE-SCOPE).

## 5. Outcome
- **C PASS:** C-R116-01 is done, and T12 stage 3a is `c_pass`. Root then gates rounds 116 + 117 together; publication makes it `c_pass_published`.
- **Next planning:** the REGRESSION round (on or after 2026-10-24), then stage 3b.
- **C FAIL:** findings with severity. A failed exact match is Medium (gate-blocking).

## 6. Ableton source
No new behaviour in this round: test scope only. The round-116 table (`tasks/round-116.md` §6) and C's round-116 correspondence ratings stand unchanged. Ableton correspondence: **not applicable**.

## 7. Evidence and reporting
- **C writes** `c-round-117.md` and `c-round-117.json`, with the fields `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `carried`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. Evidence goes under `c-round-117/{tools,out,shots}/`. Write as you go.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- Consult only the read-only agents in your list. C makes no `store/` writes.

## 8. Root / architecture (not A's work)
- **Rounds 116 + 117 publish together** after C PASS, a full verify and an independent review (GATE-72/74 precedent; `GATE-116-SKIPPED` in `open_findings`).
- **Checkpoint request:** addendum (ab) was appended to `b-round-91-checkpoint-request.md`. It covers the round-116 reviewer's Signal 4: the hook should expose the gesture start / `atStart` before stage 3b. It is non-blocking.
