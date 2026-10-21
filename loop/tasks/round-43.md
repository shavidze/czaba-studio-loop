# CURRENT TASK — Round 43: SRW-13 stage 4b-2 group 4 — the Master hold tick stays inside the meter at the top of the scale, and two fader test hardenings

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-14
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13; behavioural reverse-engineering 2026-10-14).
- Decision record: **D-29z8** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-42.md`.
- Round size: **three Low items from the plan-approved group 4** (`plan.md` round table). One is a one-element visual fix in `ArrangementMaster.tsx`; two are test-only and share the fader-focus theme (`fader-guards.test.tsx` round-37 describe, a new focus-order test). No new feature, no context change.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **000** at 19:2x and **200** at B's gates (2026-10-14 19:27). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load and browse daemon:** `node.exe` was **32–36** at B's gates. Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs.
>
> **Browse rule (new, from C round 42):** **never use `$B restart`.** It broke the gstack daemon twice in round 42. For a fresh anonymous context, start with a **new** `BROWSE_STATE_FILE` (e.g. `c-round-43/browse-anon.json`). If the daemon fails to start, record it, do the offline IDs, retry once with another fresh state file, and never weaken a criterion.

## Why this round

**Round 42 result** (`c-round-42.md`, `c-round-42.json`): **C PASS on every contracted ID** — G42-1 (`npm run verify` exit 0, 74 files, 1333/1333), G42-2, G42-3 (anonymous `/studio-lab` direct and via header, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 without a token, `/studio/middle-east` → Sign in required), R42-S, R42-U (old source PK1/PK3/RW1/RW2 red; mutations a–f each caught), R42-Doc, R42-PK (1440 + 1280), R42-RW, R42-REG. **Closed: A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES.** Root committed round 42 as **`b6a96f8`** (`fix(studio): recover pan controls and scope deployment triggers`; it also contains root's `.github/workflows/ci.yml` and `vercel.json`). B verified both master remotes at `b6a96f8`.

**Task-text correction (TASK-R42-REGDEL):** round 42 §2.3 PK4 and §4.3 REG-DEL wrongly said Delete with focus on Pan deletes the selected clip. The frozen contract (C-R31-02; `StudioWorkspace.tsx` l.1181–1184; `fader-guards` "keep the selected clip…"; `track-pan` l.822) is: **Delete/Backspace with focus on any range input keep the selected clip, write 0 entries, and Space still toggles playback.** This round's REG uses the correct wording.

**Group 3 needs no code (D-29z8, B decision with rationale; see `b-round-42.md` §3):**
- **FADER-KEY-ENTRIES → accepted.** Volume and Master commit on `keyup`, Pan writes one entry per value-changing key. All three faders follow the D-29v rule "keyboard step = one entry". C already recorded this behaviour: round 42 REG-FADERS (Volume, Master) and REG-KEYS (Pan); round 30 R30-K. No Ableton claim.
- **A-R29-REVIEW-1 → accepted.** A pending Volume/Master preview is a real, uncommitted user change. `applyEdit` writes it before the next edit. After a no-op Cut Time the undo label truthfully names that fader entry, and the status speaks about the Cut Time. It is reachable only by key rollover (an arrow held on a fader while Ctrl+Shift+X is pressed). No C evidence exists, so it is **accepted**, not "closed".
- **A-R33-REVIEW-TOUCH → Tech Lead (R38-T).** Skipping `pointerType === 'touch'` in the timeline capture handler would bring C-R32-01 back on touchscreen laptops with a keyboard (tap a clip, press Delete, the fader keeps focus). Fix only on real-device evidence.

**So this round is group 4**, the next code group in the plan:

| ID | Severity | Today (source read, HEAD `b6a96f8`) |
|---|---|---|
| **MASTER-HOLD-TICK-EDGE** | Low (C round 26 §9 measurement) | `ArrangementMaster.tsx` l.55 writes `translateX(${meterDbToFraction(holdDb) * 100}%)` on the hold layer (`absolute inset-0`, l.88). The tick inside is `absolute inset-y-0 left-0 -ml-px w-0.5` (l.89): it spans −1…+1 px around its position. The meter box is `relative h-1.5 w-20 overflow-hidden rounded-full` (l.76, 80 px). At `holdDb ≥ +6` (fraction 1) the tick spans 79…81 px, so only **1 px** is visible. The track meter does not have this problem: its hold layer ends `right-0.5` and its tick has no `-ml-px` (C round 27). |
| **A-R38-TEST-ORDER** | Low (test-only) | `useRelativeFaderDrag.ts` calls `fader.focus()` before `beginGesture(pointerId)`. C's round-38 mutation (i), which swaps the two, survived 97/97. B's source read suggests the swap may be **behaviourally equivalent** today: the workspace root capture releases a focused text field before any fader handler runs (C-R34-01, D-29z), and `beginTrackVolumeGesture` itself flushes a pending Volume/Master preview (ArrangementContext l.2150–2151). A either finds an observable difference and pins it, or proves the equivalence (§2.3). |
| **A-R37-TEST-HARDENING** | Low (test-only) | In `fader-guards.test.tsx`, describe `C-R36-01` (l.1607–1708): N5 (l.1695) has no pin that `"3"` was still kept after the release, before the selection change, so it would pass even if the blur during the gesture reset the text. N1/N2 (l.1621, l.1642) call `fireEvent.blur(field)`, which does not move `document.activeElement`, so the later `field.focus()` is a no-op. |

## Baseline

B verified on 2026-10-14 19:27 (`b-round-42/gates.txt`):
- HEAD **`b6a96f8`**, root's round-42 checkpoint, on both master remotes (`TCzaba/czaba-store`, `shavidze/czaba-store`). `git status --short` is **empty**.
- Round-42 files at HEAD equal C's shas: `ArrangementLane.tsx` `855bc517`, `pan-release-recovery.test.tsx` `de42634f`, doc 039 `9b15bc74`.
- **Frozen list:** `../tmp/studio-real-loop/b-round-42-tree-sha256.txt` → **387 OK**. It is the round-41 list of 386, minus `ArrangementMaster.tsx` and `fader-guards.test.tsx` (opened this round), plus the 3 round-42 files. Run it from `store/`.
- Protected files 4/4 OK. tsc 0. vitest **74 files / 1333 passed**. Dev server `/studio-lab` 200.
- Biome `./app` (C round 42): **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. **Do not touch them.** Also 218 warnings and 1 info. Your files must add 0 errors and 0 warnings.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-42-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementMaster.tsx` **`1707798c`**, `fader-guards.test.tsx` **`9721d08f`**, both = HEAD.
- **Before you edit:** confirm that HEAD is `b6a96f8`, or a newer root commit that leaves both snapshot files unchanged and the 387 list OK. If anything differs, **stop and report**.
- Do not touch new untracked paths; record any you see. `.kilo/` shows only as ignored.

**Rules:**
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 MASTER-HOLD-TICK-EDGE — contract (geometric; C measures it)

Let `W` be the Master meter box width (80 px today) and `f = meterDbToFraction(holdDb)`.

1. **Top of the scale:** for every `holdDb ≥ METER_CEILING_DB` (+6), the whole tick is inside the meter box: `tick.left ≥ meter.left` and `tick.right ≤ meter.right` (`getBoundingClientRect`), and the tick is still 2 px wide.
2. **Unchanged below:** for every `holdDb ≤ +5 dB`, the tick centre stays at `meter.left + f × W` within **0.5 px**, exactly as today. In particular, at 0 dBFS the tick overlaps the 0 dBFS mark (the `border-l` at 10/11 of `W`).
3. **Between +5 and +6 dB:** the tick never leaves the box and never moves left as `holdDb` rises.
4. **Unchanged:**
   - visibility (hidden at the floor, visible above it);
   - `data-level-db` and `data-hold-db`;
   - the level cover;
   - the meter size (80 × 6 px) and the Peak button;
   - the per-frame write path (no layout read per frame, no React render per frame);
   - `ArrangementTrackMeter.tsx` (frozen).
5. **Accepted:** `rounded-full` (3 px radius) clips the tick vertically in the last 3 px at each end. The bar is fully red there. Record this in the doc. It is not a new ID.

**Implementation choice is A's**, inside `ArrangementMaster.tsx` only.
- One candidate clamps the translation, e.g. `translateX(min(X%, calc(100% - 1px)))`, or a JS clamp of the fraction.
- A wrapper inset alone (`right-px`, `left-px right-px`, or a copy of the track meter's `right-0.5` without `-ml-px`) moves the 0 dB tick by about 0.8–1.8 px and fails rule 2.
- If you use a CSS `min()`/`calc()` string, check that jsdom keeps it in `style.transform`. If jsdom drops it, say so and choose a form your test can read.
- B checked: no frozen test parses the Master hold transform. `render-budget` l.244 parses only the detail playhead; `meter-ui` and `track-meter-ui` read only `data-hold-db`. Re-check this yourself (§1.4).

### 0.2 A-R38-TEST-ORDER — contract (test-only)

The goal is a jsdom test that **fails when `fader.focus()` is moved after `beginGesture`** in `useRelativeFaderDrag.ts` (C's mutation (i)), **or** a written proof that no observable difference exists today.

Steps:
1. Try at least these scenarios, each on the current hook and on the hook with mutation (i) applied **in a scratch copy outside `store/`**:
   - **S1:** Clip Gain text `3` typed on SFX (not committed) → `pointerdown` on the music Volume (button 0, buttons 1, pointerId 41) → `pointerup`.
   - **S2:** music Volume focused, `keyDown` ArrowLeft + `change` (pending preview, no `keyUp`) → `pointerdown` 41 on the **SFX** Volume → `pointerup`.
   - **S3:** Master focused with a pending keyboard preview → `pointerdown` 41 on the music Volume → `pointerup`.
   - **S4:** music Pan focused after a keyboard step → `pointerdown` 41 on the music Volume → `pointerup`.
   - **S5:** one more case of A's choice, picked from the blur handlers, that A judges most likely to differ.
2. For each case, record the undo chain, the status, `document.activeElement` and the stored values for both orders.
3. **If a case differs:** add it as a test to the new file `app/lib/arrangement/__tests__/fader-focus-order.test.tsx`. It must be **green** on the current hook and **red** on mutation (i). Record the failure text.
4. **If none differs:** still add S1–S3 to the new file as must-not regression pins (green on both orders; say so). Write the equivalence argument into doc 040: which handler releases or flushes first in each case, with file/line references. C then confirms or refutes it.
5. **Do not** change `useRelativeFaderDrag.ts` or `StudioWorkspace.tsx` to make a difference visible.

### 0.3 A-R37-TEST-HARDENING — contract (frozen test file, narrow grant)

**Grant:** `fader-guards.test.tsx`, **inside the describe `C-R36-01: a blur during another pointer gesture keeps the typed Clip Gain text (D-29z2)` only** (l.1607–1708 at the snapshot).
- **N5 (R4):** after `releaseSeparatorGesture(api)` and before the first `selectClip`, add `expect(field.value).toBe('3')` (and, if useful, `expect(live(api).undoLabel).toBeNull()`).
- **N1, N2 (R5):** make the blur move focus the way a browser does, so that the later `field.focus()` really refocuses. Replace `fireEvent.blur(field)` with `act(() => { field.blur(); })`, or a real focus move to another element. Assert `document.activeElement !== field` after the blur, and `document.activeElement === field` after `field.focus()`.
  - In N2 the second-pointer Master press stays as it is. If the Master press itself already moves focus in jsdom, record it and keep the order of steps.
- **Every existing `expect` is kept, with the same expected value.** No other `it` or describe is touched. No helper outside the describe changes.
- **Mutation to prove R4:** in a scratch copy, make the Clip Gain blur during another gesture reset the text to the stored value (the round-36 behaviour; locate it in `ArrangementDetailPanel.tsx`; do not edit that file in `store/`). Then N5 must fail **at the new pin**, and N1 must still fail as before. Record both.

### 0.4 Unchanged / out of this round

**Unchanged:**
- `ArrangementTrackMeter.tsx`, `meter.ts`, `ArrangementContext.tsx`, `useRelativeFaderDrag.ts`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementLane.tsx`;
- every other test file, and docs 001–039.

**Out of this round** (queued, not deferred scope):
- **round 44 — 4c:** R9-REVIEWER-M1-L8 and PREVIEW-VOLUME-IDENTITY (both in `ArrangementContext.tsx`);
- **round 45 — polish:** SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, and the doc notes DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, DOC015-DELETE-GAP-NOTE (split if over the round size);
- **then:** SRW-14 (FB-13 Grid/Snap, stage 1) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20, R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, the SRW-21 adapter, the full regression and the root check; then T12;
- **waiting for the Tech Lead:** C-R41-01 (TL-Q-VIEWPORT).

**Out of scope for the whole project:** plugins and effects (including compressor, limiter and normalise), pitch, multiple video layers, and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- the Master meter: level cover, 0 dBFS mark, visibility at the floor, the Peak button and its latch reset;
- the track meters (unchanged file, shared `meter.ts`);
- the frozen suites `meter-ui`, `master-ui`, `track-meter-ui`, `render-budget`, `fader-guards`, `fader-click`, `track-pan`, `pan-release-recovery`, `gesture-guard`;
- the fader press focus and the Clip Gain blur rules (test-only changes must not hide a regression).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md` and `prompts/studio-feature.md`; `docs/implementation/TEMPLATE.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-42-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - both snapshot shas;
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementMaster.tsx` (whole) and `ArrangementTrackMeter.tsx` (whole);
   - `meter.ts` l.1–60, l.120–140;
   - `meter-ui.test.tsx` (how the Master meter is driven: the fake analyser or store publish);
   - `useRelativeFaderDrag.ts` (whole);
   - `ArrangementContext.tsx` l.928–973 (flush, `applyEdit`), l.2096–2183 (Volume commit/begin/blur), l.2316–2430 (Master preview/commit/blur);
   - `StudioWorkspace.tsx`: the root pointerdown capture (C-R34-01/D-29z, grep `onPointerDownCapture`);
   - `fader-guards.test.tsx` l.196–262 (harness) and l.1363–1708;
   - `a-round-37.md` §4 R4/R5; `c-round-38.md` §9.1 (i); `c-round-26.md` §9 (the hold tick record).
4. **Re-check (report each):**
   - Grep `app/lib/arrangement/__tests__/` for `translateX`, `data-hold-db`, `style.transform` and `arrangement-master-meter`. **Stop and report** if a frozen test parses or snapshots the Master hold layer's transform or class.
   - Run `npx biome check app/components/arrangement/ArrangementMaster.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx` before and after: no new diagnostic.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementMaster.tsx`

The diff is limited to the hold tick geometry (§0.1): the hold layer's transform write in `writeMeter`, and/or the hold layer and tick classes (l.88–90).

**Rules:**
- No comments, no new exports, no `any`, no type assertions, no `@ts-ignore`.
- Tokens only; no hardcoded colours. Semicolons.
- Nothing else in the file changes.

### 2.2 Doc 040 (new)

`docs/implementation/2026/quarter-IV/040-studio-lab-master-hold-tick-and-fader-test-hardening.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md` (Georgian, technical terms in English):
- თარიღი, სტატუსი (`Round 43 — D-29z8; C-ის შემოწმებას ელოდება`), შეცვლილი პროექტი;
- კონტექსტი: the three items with today's code paths (the table above), and the group-3 dispositions in one short paragraph;
- მიდგომა: the hold geometry rule, the option chosen and why the wrapper-inset options fail rule 2; the A-R38 scenario table and its outcome (difference found, or the equivalence argument with file/line references); the A-R37 edits;
- შეცვლილი ფაილები (no code fragments);
- პრობლემები და გადაწყვეტები (Problem → Solution);
- ტესტირება: red/green per case, the C IDs;
- the Ableton table (§4.8);
- TODO: round 44 (4c), round 45 (polish), then SRW-14.

### 2.3 Tests (in `store/`)

**(a) New file `app/lib/arrangement/__tests__/master-hold-tick.test.tsx`.**
- Mount the way `meter-ui.test.tsx` does. **Copy** what you need; do not import from another test file.
- These are **structural pins**: jsdom has no layout, so they read the written style or classes. Say so in the `describe` title. C's browser geometry (§4.1) is the real acceptance.

| ID | Case | Expected | Snapshot source |
|---|---|---|---|
| HT1 | Publish a frame with `holdDb = +6` (and one with `+12`, which the meter clamps) | The written hold geometry keeps the 2 px tick inside the box, by your chosen form (e.g. the clamp term is present, or the computed offset is ≤ `W − 1` px) | red |
| HT2 | `holdDb = 0` | The hold transform equals the snapshot's `translateX(${(60 / 66) * 100}%)` value (or the same position in your chosen form) | green |
| HT3 | `holdDb = −12`, then the floor | The position equals the snapshot's formula; visibility `visible`, then `hidden` | green |

**(b) New file `app/lib/arrangement/__tests__/fader-focus-order.test.tsx`:** per §0.2. Copy the `fader-guards` harness; do not import from another test file.

**(c) `fader-guards.test.tsx`:** per §0.3 only.

**Red/green runs:**
- For (a): write HT2/HT3 first and run them against the snapshot. Then choose the §0.1 form, write HT1 for that form, and run HT1–HT3 against the snapshot `ArrangementMaster.tsx` (HT1 must be red) → `a-round-43/red-run.txt`. Report this order.
- Record the (b) both-order table → `a-round-43/order-table.txt`.
- Record the §0.3 R4 mutation run → `a-round-43/r37-mutation.txt`.
- Then the green run → `a-round-43/green-run.txt`.

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments;
- exact strings come from the rendered DOM or exported constants;
- no snapshot tests; no fake timers unless the copied harness already uses them.

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.7 and the full `npx vitest run` (1333 plus your new `it` count).
- **Biome:**
  - run `npx biome check --write` **only** on `ArrangementMaster.tsx`, `fader-guards.test.tsx` and the two new tests;
  - then a read-only `npx biome check ./app`: exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent. Report its findings and your dispositions.
- **Browser smoke** (A; one run if the server and daemon are up; `a-browse.json` or a fresh state file; not a PASS claim): Master +6 dB, a read-only sampler on `data-hold-db`, play past the `Soft impact` hit and stop before 7 s, then report the tick and meter rects of the max-hold sample at 1440×900. The meter floors on stop, so rects read after stop show a hidden tick.
- **Mutations:** only in a scratch copy outside `store/`.
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `b6a96f8` with an empty `git status`, or a newer root commit that leaves both snapshot files unchanged and the 387 list OK.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementMaster.tsx` | A | §2.1 only |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §0.3 only (inside the `C-R36-01` describe) |
| `app/lib/arrangement/__tests__/master-hold-tick.test.tsx` | A | new (§2.3 a) |
| `app/lib/arrangement/__tests__/fader-focus-order.test.tsx` | A | new (§2.3 b) |
| `docs/implementation/2026/quarter-IV/040-studio-lab-master-hold-tick-and-fader-test-hardening.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-43.md`, `a-round-43/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-43.md`, `c-round-43.json`, `c-round-43/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` / fresh state files in the own round folder | A / C | browse state |

- `a-round-42/`, `c-round-42/` and `b-round-42/` are read-only.
- **Expected `git status --short` at the end:**
  - ` M app/components/arrangement/ArrangementMaster.tsx`
  - ` M app/lib/arrangement/__tests__/fader-guards.test.tsx`
  - `?? app/lib/arrangement/__tests__/fader-focus-order.test.tsx`
  - `?? app/lib/arrangement/__tests__/master-hold-tick.test.tsx`
  - `?? docs/implementation/2026/quarter-IV/040-studio-lab-master-hold-tick-and-fader-test-hardening.md`

  Nothing else. If root changes something meanwhile, record it as foreign and do not touch it.

### 3.3 Frozen this round

- All **387** files in `b-round-42-tree-sha256.txt`, and everything else under `store/`.
- This includes: `ArrangementTrackMeter.tsx`, `meter.ts`, `useRelativeFaderDrag.ts`, `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `model.ts`; every other existing test; docs 001–039.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, fresh load (`viewport`, then `goto`, then the setup chain); the geometry case repeated at 1280×720. **Layout L43** = L42: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Master at 0 dB unless a step says otherwise. In R43-HT, stop playback **before 7 s** (the music clip), so the hold comes from the SFX hit only.

**Harness rules:**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** (label it): `PointerEvent` dispatch with an explicit `pointerId` (C uses **41**), `window.dispatchEvent(new Event('blur'))`, `.blur()`, `.focus()`, a native value setter + `input`/`change`.
- C may read state through the existing `window.__c` reader (undo labels, `isPointerGestureActive`, stored values) and read rects with `getBoundingClientRect`. Label it. No source instrumentation. Mutations run only in a scratch copy outside `store/`.
- No `$B restart`; fresh state files only (see the header).
- Every run and gate records `node.exe`.

**Checkpoint order if the session may end:** G43-2 → R43-S → R43-HT → R43-U → R43-REG → the rest. Write `c-round-43/checkpoint.md` as you go.

### 4.1 R43-HT — the Master hold tick (REAL playback, measured geometry)

**Timing (important):** the meter **floors on stop** (`floorMasterMeter`, `meter.ts` l.93–101: `holdDb` → floor, so the hold layer is hidden), and while playing the hold falls back to the level `METER_PEAK_HOLD_MS` (1500 ms) after the peak. The latched thing after stop is the Peak/Clip button, not the hold tick. So the geometry is measured **during playback, inside the hold window**:
- before Space, install a read-only page-side sampler (label it **SYNTHETIC instrumentation**, same class as the `window.__c` reader; no source change): a `MutationObserver` on the meter's `data-hold-db`, or a rAF loop, that records `{ t, holdDb, meterRect, tickRect, markRect, transform }` on every change;
- REAL Space → let the `Soft impact` hit at 4 s pass → REAL Space **before 7 s**;
- evaluate the sample with the **maximum** `holdDb` (and, for HT-TOP, every sample with `holdDb ≥ +6`).

Record per case: the meter rect, the tick rect (the inner tick element of the hold layer), the 0 dBFS mark rect, `data-hold-db` and the computed `transform`.

| Case | Steps | Expected |
|---|---|---|
| HT-TOP (1440) | REAL keyboard on Master until the readout is `+6.0 dB` (or a SYNTHETIC native setter + `change`; name it) → sampler → REAL Space → past the hit → REAL Space before 7 s | In every sample with `holdDb ≥ +6.0`: `tick.left ≥ meter.left`, `tick.right ≤ meter.right`, tick width 2 px (± 0.1). A zoomed screenshot of the meter taken **during** the hold window |
| HT-ZERO | Fresh load, Master 0 dB, sampler, play past the hit, stop before 7 s | Max-hold sample ≈ `+0.0` (round-26 fixture): the tick overlaps the 0 dBFS mark; tick centre within 0.5 px of `meter.left + (60/66) × W` |
| HT-LOW | Master −12 dB, same | Max-hold sample ≈ −12: tick centre within 0.5 px of `meter.left + (48/66) × W` |
| HT-FLOOR | After any stop above | The tick is hidden (floor on stop, unchanged); the Peak button keeps its latch; a REAL click on Master Peak resets it; 0 entries |
| HT-1280 | HT-TOP once at 1280×720 | As HT-TOP |
| HT-TRACK | During HT-TOP, the same sampler on the SFX track meter | Its tick stays fully inside its own box (unchanged since round 27); record the rects |

### 4.2 R43-U — unit tests and mutations

- The new tests are green. A's red run matches §2.3 (HT1 red on the snapshot; HT2/HT3 green), or A explains each difference with the failure text.
- **A-R38 outcome:** verify A's both-order table **yourself** by applying mutation (i) in a scratch copy.
  - If A claims a difference: the named test is red on (i) and green on the current hook.
  - If A claims equivalence: read the cited handlers and confirm or refute each row. If you can construct a case that differs, that is **C-R43-xx** (a test gap, Low) with steps.
- **A-R37:** `diff -u` of the snapshot `fader-guards.test.tsx` against the working copy shows changes only inside the `C-R36-01` describe. Every snapshot `expect` line is still present with the same expected value (list any reworded line). The R4 mutation (blur during a gesture resets the text) makes N5 fail at the new pin.
- The frozen suites of §4.7 are green.
- **Mutations** (scratch copy outside `store/`; each must make a test fail):

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | Master hold transform back to the snapshot form | HT1 |
| (b) | The clamp applied at every level (e.g. the position always uses `W − 1` px as the full scale) | HT2 or HT3 |
| (c) | Hold visibility always `visible` | HT3 (floor) or the frozen `meter-ui` |
| (d) | `fader.focus()` after `beginGesture` (= C round 38 (i)) | the A-R38 test, **or** documented as equivalent (§0.2 step 4) |
| (e) | The Clip Gain blur during another gesture resets the text | N1 and N5 (new pin) |

### 4.3 R43-REG — regression (REAL where possible)

| ID | Expected |
|---|---|
| REG-METER | Master level cover and the latched Peak/Clip still follow playback (round 26): Master +6 dB play → Peak shows Clip; reset → clears; Master 0 → `+0.0`; no entries from the meter |
| REG-FADERS | Music Volume and Master: a SYNTHETIC drag gives one entry each; REAL ArrowLeft/ArrowRight give one entry per key (FADER-KEY-ENTRIES accepted contract; record it) |
| REG-PAN | Pan: REAL ArrowRight ×2 → one entry per key; a REAL click on the Pan centre → 0 entries, no jump |
| REG-DEL | SFX clip selected, focus on the music Volume (REAL click on it after selecting): REAL Delete and REAL Backspace **keep** the clip and write **0** entries (C-R31-02); REAL Space toggles playback. Then a REAL click on an empty lane area and the clip, then REAL Delete → the clip is deleted with one entry |
| REG-CG | Clip Gain `3` typed (no Enter) → REAL click on the music Volume → `Clip Gain` +3.0 dB is committed once, no blocked status (round 34/37 behaviour) |

### 4.4 R43-S, R43-Doc

**R43-S** (static, read-only):
- `diff -u ../tmp/studio-real-loop/b-round-42-snapshots/ArrangementMaster.tsx app/components/arrangement/ArrangementMaster.tsx` shows only the §2.1 items.
- `diff -u` of `fader-guards.test.tsx` shows only §0.3 changes.
- 387 OK.
- No `any`, `@ts-ignore`, type assertion, `//` comment, hardcoded colour or new export.

**R43-Doc:** doc 040 exists, follows `TEMPLATE.md`, is in Georgian, matches the code (the geometry form, the A-R38 outcome) and has the §4.8 table.

### 4.5 Gates

**G43-1:** tsc 0; vitest = 1333 + the new `it` count, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs); the build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, plus 1 info.

**G43-2:** protected 4/4 OK; `sha256sum -c b-round-42-tree-sha256.txt` → 387 OK; `git status --short` = §3.2; HEAD at the start and at the end.

**G43-3:** anonymous `/studio-lab`, opened directly and via the header link, in a **fresh** browse state:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module requests, the homepage hero image from `images.unsplash.com`, Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).

**Not re-run this round** (not PASS): exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; the detail-panel geometry.

### 4.7 Frozen suites (A self-check, C G43-1)

`master-hold-tick`, `fader-focus-order`, `fader-guards`, `meter-ui`, `master-ui`, `track-meter-ui`, `render-budget`, `fader-click`, `track-pan`, `pan-release-recovery`, `gesture-guard`, `ArrangementContext.test.ts`.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

No new Live behaviour is copied. No new browsing and no video.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| The Master peak-hold tick stays fully visible at the top of the meter scale | none | **Not applicable** (CZABA meter geometry, round 26 design) | D-29z8 (§0.1) | R43-HT |
| A fader press focuses the fader before its drag gesture begins | none | **Not applicable** (CZABA focus and gesture rules, D-29z/D-29z3) | test-only | R43-U |
| A Clip Gain value typed during another gesture is kept until the release | none | **Not applicable** (CZABA rule D-29z2) | test-only | R43-U |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - **C-R41-01** (Low, 1024×768, TL-Q-VIEWPORT; not re-run);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab` and the hydrated U+FFFD `aria-label`s. Round 42: 64 312 bytes, **3 NUL** at 11729, 28025, 28026; **1** U+FFFD label (library collapse).
- **Accepted this planning (B, D-29z8; no code):** FADER-KEY-ENTRIES, A-R29-REVIEW-1. **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low items:** R26-M1; R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY (round 44); SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, the DOC034/035/036/015 notes (round 45); A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS; DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE (record).
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - round 42 is committed as `b6a96f8` (both remotes verified by B; `publication-checkpoint.json` has no `round42Checkpoint` entry yet; root records it). Round 43 becomes checkpoint-ready only after C PASS;
  - FOREIGN-CI-YML is resolved: root committed `.github/workflows/ci.yml` (and `vercel.json`) on purpose in `b6a96f8`;
  - GSTACK-ACL (C round 42): `tmp/studio-real-loop` and `tmp` carry a single non-inherited owner-only ACE. The timing is unknown. Root decides whether to restore inheritance. A and C run no ACL command;
  - the ignored `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset;
  - `root-pre-push-review.md` (2026-10-07): M1–M3, L1–L4 and L6–L8 are **closed**, and L5 is accepted. Nothing from it is open beyond the shared items above;
  - dev-server availability (000 once at B time); ENV-BROWSE-DAEMON (no `$B restart`); machine load (Defender).
- **Tech Lead manual checks:**
  - R23-1 (including the detail scroller), R23-2;
  - R38-T (including A-R38-REVIEW-TOUCH and, new, A-R33-REVIEW-TOUCH: on a touch device, a touch scroll on the timeline with a fader focused after a keyboard step; record whether an entry is written early);
  - R35-T, R30-T, R31-T (with the round-42 Alt+Tab step), R33-T, R34-T;
  - TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-42-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementMaster.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/master-hold-tick.test.tsx app/lib/arrangement/__tests__/fader-focus-order.test.tsx
npx vitest run app/lib/arrangement/__tests__/master-hold-tick.test.tsx app/lib/arrangement/__tests__/fader-focus-order.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/pan-release-recovery.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-42-snapshots/ArrangementMaster.tsx app/components/arrangement/ArrangementMaster.tsx
diff -u ../tmp/studio-real-loop/b-round-42-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than the two named in §2.3.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G43-1/2, R43-S, R43-U, R43-Doc). Use gstack `/browse` with a fresh state file under `c-round-43/`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-43.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case), the A-R38 both-order table, the R4 mutation run and the green run;
3. the diff summary per file;
4. the smoke result (if run);
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-43.md` and `c-round-43.json`** (the usual schema): for each ID, PASS, FAIL (with a bug ID) or **not run** (with the reason). Include:
- the R43-HT geometry table with rects and labelled REAL/SYNTHETIC steps;
- the R43-U verdict on the A-R38 outcome, and the mutation table;
- R43-REG;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 44 — 4c:** R9-REVIEWER-M1-L8 (rename or remove the `transportRunningRef` latch without behaviour change; `useArrangementPositionStore` error text) and PREVIEW-VOLUME-IDENTITY (`previewTrackVolume` identity short-circuit, as `previewMasterGain` has), `ArrangementContext.tsx`.
- **Round 45 — polish:** SSR-LAYOUT-EFFECT-WARN (isomorphic alias pattern), EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, and the doc notes (split if over the round size).
- **Then SRW-14 stage 1 (FB-13):** the grid model (`grid.ts`, seconds grid without tempo), Snap on/off with a visible state and shortcut, divisions; it applies to clip move first. Later stages cover trim/range/playhead/paste and clip-edge snap, then SRW-15 (bars/beats, project BPM as a grid only, metronome not exported). B prepares the Ableton source table (Live 12 manual, grid/snap section, via gstack `/browse`) when it writes that task.
- **TL-Q-VIEWPORT / C-R41-01:** if the Tech Lead puts widths below 1280 in scope, it is scheduled next (candidate in `b-round-41.md` §4).
- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH / A-R33-REVIEW-TOUCH:** if R38-T confirms a touch problem, B schedules the pre-specified fix.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 43 -StartPhase A` and a higher limit.
