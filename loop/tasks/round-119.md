# CURRENT TASK — Round 119: C-R118-01 fix-up — the CF11 Master Shift pin (B spec defect), plus the doc 101/100 status lines

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~22:12–22:40 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-118.md` (exact copy, `cmp` OK). Rationale: `b-round-118.md`. Decision record: **D-29z84** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** one bug fix-up (C-R118-01). No new scope.
- **Baseline: HEAD `9cb820b` plus the round-118 working tree.** Gate 118 was `skipped` (C FAIL), so nothing was committed.
  - `git status --porcelain`: 8 ` M` + 2 `??` (the round-118 end state; md5 of the porcelain output `554bfcc8…`).
  - **Frozen list:** `tmp/studio-real-loop/b-round-118-r119-tree-sha256.txt`, **929 entries**. That is every tracked file **plus** the untracked `app/lib/arrangement/__tests__/group-volume-db.test.tsx`, except the 3 granted files in §2. `sha256sum -c` gave OK at planning.
  - **The round-118 app changes are frozen and must not be lost.** No stash, checkout, reset or restore of any kind.

## 0. Why this round
- **C round 118:** `taskStatus FAIL`, `browserVerified: true`, `realVerified: true`.
  - All 23 browser and review rows passed at 1440×900 and 1280×720: GV-PRESENT, GV-DRAG, GV-INF, GV-DBL, SH-LANE, SH-GROUP, SH-MASTER, SH-MID, NB-PAN/CLIP, G-GROUP-T3 (ratio 0.501187, 0.000 %), G-GROUP-INF (0 non-zero samples), GV-PLAY (0 new sources), TV-ANCHOR, G118-3, PX-NET/REG-HYD, DOC-100/101.
  - The only failure is **T118-TARGETED: 451/452, CF11 l.501** (`expected -1 to be -1.2`).
- **C-R118-01 is B's spec defect, not A's.** Round 118 §2.1 pinned the fine Master value as −24 × 66 / 1320 = −1.2. B's formula left out the Master step:
  - `MASTER_GAIN_STEP_DB = 0.5` (`ArrangementMaster.tsx` l.25);
  - `relativeFaderValue` rounds to the step, so −1.2 → −1.0;
  - round-118 R4 keeps the Master step unchanged.
- **Evidence that the app is right:**
  - In the browser, SH-MASTER gave Shift −2.5 dB against plain −27.5 dB (theory −2.75, within one 0.5 step) at both viewports.
  - A's mutation m5 (Master without `fineDivisor`) made CF11 receive −12, so the Shift path is live.
  - A correctly stopped and did not edit the pin.
- **Ruling D-29z84:** CF11 l.501 → `toBe(-1)`.
- **Why the gate blocks:** the red test fails the gate's full vitest. So C-R118-01 is **not** a deferred Low. It must be fixed before publication.
- **Regression round:** not due at this planning. `regression-last.json` = 2026-10-21, and B plans on 2026-10-23 22:12 UTC, which is 2 days; the rule needs 3. The **first planning on or after 2026-10-24 UTC** is the REGRESSION round.

## 1. What changes
- **App behaviour: nothing.** Every app file is frozen.
- One test expectation changes, and three documentation lines are brought up to date.

## 2. A — files you own (everything else is frozen)
| File | Change (exact) |
|---|---|
| `app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` | **l.501 only:** `expect(live(fine.api).arrangement.master.gainDb).toBe(-1.2);` → `expect(live(fine.api).arrangement.master.gainDb).toBe(-1);`. Nothing else changes: the CF11 title, l.498–500 (`trackVolumeFromDb(-5.9)`) and l.502 stay. The `expect(` / `it(` counts stay 92 / 14. Pre-edit sha256 `261472d6…` |
| `docs/implementation/2026/quarter-IV/101-studio-group-volume-db-shift-fine.md` | Pre-edit sha256 `f910ed7b…`. Four lines only (see below) |
| `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md` | Pre-edit sha256 `5912f18f…`. **l.69 only** (see below) |

**Doc 101 lines (Georgian, technical terms in English):**
- **l.4 (status):** „**სტატუსი:** Round 118 (ბრაუზერი, `c-round-118.json`) + Round 119 (CF11-ის გასწორება, D-29z84) — C-ის შედეგი `c-round-119.json`-შია; გამოქვეყნება root-ის gate-ით.“ Write this so it does not need another edit after publication.
- **l.50 (problem):** change the heading „**პრობლემა (ღია):**“ to „**პრობლემა:**“, keep the problem text, and replace the part from „**გადაწყვეტა:**“ with: B-მ დაადასტურა `toBe(-1)` (D-29z84). Master-ის Shift ნაბიჯს ამრგვალებს `MASTER_GAIN_STEP_DB = 0.5`-მდე; B-ის round-118 ფორმულამ ნაბიჯი გამოტოვა. m5 (`fineDivisor`-ის გარეშე) CF11-ს `-12`-ს აძლევს.
- **l.66:** „C-მ ბრაუზერში შეამოწმა (`c-round-118.md`): drag, Shift, ექსპორტის თანაფარდობა 0.501187, −∞ — 0 sample.“
- **l.70:** drop the line „B-ის გადაწყვეტილება CF11-ის …“. Delete the line; do not leave it blank.

**Doc 100 l.69:** `- 3b: group fader dB-ში …` → `- 3b შესრულდა: ჯგუფის fader dB-ში და Shift fine — იხ. doc 101.` (the gate-118 code-reviewer Low). Doc 100 l.13 stays: it describes the round-117 state as history.

- **Expected end state:**
  - `git status` is the round-118 state: the same 8 ` M` + 2 `??` paths. `clip-gain-fader.test.tsx`, doc 100 and doc 101 differ from their pre-edit shas.
  - `sha256sum -c --quiet b-round-118-r119-tree-sha256.txt` is OK at the start and at the end.
- **Protected (unchanged; `git diff 9cb820b` on them empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, restore, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`, any Biome `--write`.
- **Use the Edit tool for edits,** so the primitives hook fires.
- **Before editing, read:** `.claude/primitives-map.json`, `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts, semicolons.

## 3. A — checks (speed rules)
- **Before the edit:** run `npx vitest run app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` and record 1 failed (CF11).
- **m5 re-run (closes the round-118 reviewer's "no green guard for Master Shift" note):**
  - after the l.501 edit, back up `ArrangementMaster.tsx` to `tmp/studio-real-loop/a-round-119/`, remove the `fineDivisor: FADER_SHIFT_FINE_DIVISOR,` line from `masterFaderDrag` (the round-118 m5 method), run CF11, then restore by `cp` from the backup;
  - CF11 must turn red (received −12);
  - restore it and verify the `ArrangementMaster.tsx` sha256 against the frozen list (`sha256sum -c` OK). No mutation may persist.
- **After the edit:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on `clip-gain-fader.test.tsx`.
- `npx vitest run` on the round-118 list (the same 25 files): `group-volume-db`, `track-volume-db`, `track-group-mix-ui`, `clip-gain-fader`, `clip-gain-multi`, `fader-touch`, `fader-click`, `fader-guards`, `fader-focus-order`, `pan-release-recovery`, `gesture-guard`, `context-hygiene`, `pending-status`, `track-group-collapse-ui`, `track-groups-ui`, `track-group-mix`, `groups`, `master-ui`, `meter-ui`, `track-pan`, `track-layout`, `clip-gain`, `status-announcement-ui`, `self-disabling-focus`, `render-budget`. **Expected: 452/452 green.**
- No full suite and no `npm run verify` (the gate runs them).
- **The code-reviewer is not required:** one test line and two doc files, under the 3+ code-file trigger.
- **A stops and reports (no other edit; B rules) if:**
  - CF11 still fails after the edit, or receives anything other than `-1`;
  - another targeted test is red;
  - the frozen list fails at the start.
- **A's report `a-round-119.md`:**
  - start state (frozen OK, porcelain md5);
  - the l.501 `old → new` line;
  - the pre and post counts;
  - the doc lines `old → new`;
  - the m5 result and the restore sha;
  - typecheck, lint and vitest counts;
  - frozen OK at the end, and the end `git status`.

## 4. C — rows
Use real Playwright Chromium with a fresh context per session. Setup is the same as round 118 §5 (`demo-middle-east` on music @0, `demo-stem-pulse` on stems @2 s, `demo-soft-impact` on SFX @4 s, Snap off, group = stems + SFX with Ctrl+G).

| ID | Action | Expected (PASS) |
|---|---|---|
| **T119-TARGETED** | the §3 list of 25 files | **452/452** green |
| **AN-REVIEW** | `clip-gain-fader.test.tsx`: copy it **outside `store/`**, put `toBe(-1.2)` back on l.501 in the copy, and sha256 the copy; read doc 100 and doc 101 | The copy's sha256 is `261472d6…` (the round-118 file C verified), so exactly one line changed: l.501 `-1.2` → `-1`. Counts 92 / 14. Doc 101: only l.4, l.50, l.66 and l.70 differ from `f910ed7b…` (l.70 removed). Doc 100: only l.69 differs from `5912f18f…` |
| **SOURCE-SCOPE** | `git status`, `sha256sum -c b-round-118-r119-tree-sha256.txt`, protected hashes | The §2 end state. Frozen 929 OK: **every app file is byte-identical to the tree C verified in round 118**. Protected hashes unchanged |
| **SH-MASTER** (both viewports) | the round-118 SH-MASTER method: Master −40 px plain, Undo, then −40 px with Shift held from the press | Shift Δ = plain Δ / 10 ± the 0.5 dB Master step. One entry each |
| **GV-DRAG** (both) | the round-118 GV-DRAG method (group −20 px, then Ctrl+Z) | Δ = `20/w × 60` ± (0.1 + `60/w`) dB. One `Volume` entry. Ctrl+Z → `+0.0 dB` |
| **G119-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise |

- **Carried rows:** the other round-118 browser rows (GV-PRESENT, GV-INF, GV-DBL, SH-LANE, SH-GROUP, SH-MID, NB-PAN/CLIP, G-GROUP-T3, G-GROUP-INF, GV-PLAY, TV-ANCHOR, the neighbours) are carried by the SOURCE-SCOPE proof that the app source is unchanged.
  - List them in `c-round-119.json` under a separate `"carried"` key with the `c-round-118.json` reference.
  - Do **not** put them in `"passed"`.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:** an app-file change outside the grant, or a lost round-118 change = High (the publication unit would be wrong). A wrong doc line = Low.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Shift = finer drag | Live 12 Reference Manual §42.6 „Finer Resolution When Dragging: Shift“ (capture `b-round-71/ableton-shortcuts-20261021.txt`, 2026-10-21) | Confirmed | ×10 on the lane, video lane, group and Master Volume faders (round 118) | SH-MASTER |
| Fine Master values snap to the Master's own 0.5 dB step | not stated in the captures | **დაუდასტურებელი** | R4 of round 118 keeps the Master step. A fine drag therefore moves in 0.5 dB steps, 10× more travel per step. Signal **MASTER-FINE-STEP** for ABLETON-EXPERT-REVIEW (not a scope change) | SH-MASTER |

- C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 6. Evidence and reporting
- **C writes** `c-round-119.md` and `c-round-119.json`, with the fields `taskStatus`, `passed`, `failed`, `blocked`, `carried`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. Evidence goes under `c-round-119/{tools,out,shots}/`. Write as you go.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- C makes no `store/` writes. Consult only the read-only agents in your list.

## 7. Outcome
- **C PASS:** T12 stage 3b → `c_pass`. Rounds 118 + 119 publish together through the root gate, which makes it `c_pass_published`. C-R118-01 is then closed.
- **Next planning:**
  - If it is on or after **2026-10-24 UTC**, it is the **REGRESSION round** (one short browser check per done or c_pass item at both viewports, plus `npm run test:e2e:smoke`; A only fixes what C finds).
  - After that, **T12 stage 4**: the waveform shows clip gain, plus a view-only vertical zoom (T12.18/T12.19, Test 7). Then ABLETON-EXPERT-REVIEW.
  - If, unexpectedly, it is still before 2026-10-24 UTC, T12 stage 4 comes next and the regression round follows at the first planning on or after that date.
- **C FAIL:** findings with severity. B plans the fix-up first.

## 8. Root / architecture (not A's work)
- The round-118 A reviewer's Architecture note (the start capture and the stored ↔ slider mapping are now copied word for word in `ArrangementLane.tsx` and `ArrangementGroupHeader.tsx`; verdict keep; later, one bounded hook task) **is the same as checkpoint addendum (ac)**, already sent with the round-118 plan. No new addendum.
- The phase-1 / T12 checkpoint request (`b-round-91-checkpoint-request.md`, ARCH-CHECKPOINT-PHASE1-BOUNDARY) is still unanswered and non-blocking.
