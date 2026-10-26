# CURRENT TASK — Round 181: M1 — the Transport Play button becomes a round, icon-only button

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z146** (`backlog.json` → VISUAL-A-OBSIDIAN `m1_plan_d29z146`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-180.md`, an exact copy of the round-180 `current-task.md` (sha256 `f714e5d1…`, checked with `cmp`). The rationale for this round is in `b-round-180.md`.

## Baseline = HEAD `59d4bab` (gate 180 published)
- **Gate:** `gates/gate-round-180.json` is `published`, commit `59d4bab`, on both remotes. `git status` is clean, with 1005 tracked files.
- **Start state:** the tree equals `c-round-180/end-tree-sha256.txt` (1005 files). B checked this with `sha256sum -c` at planning time and got OK.
- **Frozen list:** `b-round-180-r181-tree-sha256.txt`, **999 entries** (1005 minus the 6 grants).
- **Grants:** `b-round-180-r181-grants.txt` (6 existing files). **New file:** `b-round-180-r181-new-files.txt` (1 file; it does not exist yet).
- **Start hashes:** `b-round-180-r181-granted-start-sha256.txt`. **Start copies:** `b-round-180/r181-granted-start/`.
- **Vitest base:** `b-round-180-r181-vitest-base.txt` lists 15 files: every suite that finds the Play button, plus the suites that read `ArrangementTransport.tsx`, plus `strings.test.ts`. On the start tree they give **229/229** (B's run: `b-round-180/out/vitest-base-r181.json`).
- **A's first step:** check that HEAD is `59d4bab`, that `sha256sum -c --quiet b-round-180-r181-tree-sha256.txt` is OK, and that the 6 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z146)
- **Round 180: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Root published it as `59d4bab`.
  - **DUX-R-5b-3b → მზადაა.**
  - **DUX-R-5 → მზადაა.** All six slices (5a, 5b-1, 5b-2a, 5b-2b, 5b-3a, 5b-3b) have C PASS with browser evidence, and INVENTORY-EXIT found 0 unmapped tokens.
  - **Closed:** B-R174-ACCENT-EQ-BRAND and C-R179-DOC147-STALE.
- **Regression is not due.** `regression-last.json` is dated 2026-10-24, and today is 2026-10-26: 2 days, below the 3-day threshold. Any planning on or after 2026-10-27 makes the next round the **REGRESSION round**, expected to be round 182.
- **Bug gate:** no Critical, High or Medium finding is open. The decision files are unchanged: `user-review/ableton-decisions.md` (`3b132399…`), `user-review/design-ux-decisions.md` (`0da40d98…`) and `docs/technical/store-redesign/direction-decision.md` (`b8494bb4…`).
- **Next in the VISUAL-A order is M1.** It is approved in `visual-direction-a.md` §M (2026-10-21): *"On the Play button, only an icon instead of the 'Play' text; the button is round. Impact: the button narrows, and the neighbours move."* `design-ux-decisions.md` places it after DUX-R-5.
- **Architecture checkpoint.** A fresh bounded frontend-architect request for the DUX-R-5 boundary has been sent to root: `b-round-180-checkpoint-request.md`. It is non-blocking, and fallback (c) applies.

## 1. What changes (exact; line numbers are on the start tree)
Today (`ArrangementTransport.tsx` l.129–149), the button is `cn(toolButtonClass, 'w-24 justify-center bg-foreground font-medium text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88')`. It contains an icon plus a `<span>Play</span>` / `<span>Pause</span>` label. Its `aria-label` is the literal `isPlaying ? 'Pause' : 'Play'`.

| ID | File : line | Change |
|---|---|---|
| **P1** | `ArrangementTransport.tsx` l.135 | Change the extra classes to `'w-8 justify-center rounded-full px-0 bg-foreground text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88'`. That removes `w-24` and `font-medium`, and adds `w-8`, `rounded-full` and `px-0`. tailwind-merge already resolves the base's `rounded-md`, `px-2.5` and `bg-foreground/5` (GATE167-TWMERGE-DEPENDENCY). **The rendered button must carry `h-8`, `w-8`, `rounded-full`, `px-0`, `justify-center`, `bg-foreground` and `text-background`, and must not carry `w-24`, `rounded-md`, `px-2.5` or `bg-foreground/5`.** Every other base token stays: border, motion, focus ring and disabled. |
| **P2** | l.138–148 | Remove `<span>Pause</span>` and `<span>Play</span>`. If a fragment is left with one child, drop it. The lucide `Pause` / `Play` icons stay unchanged: `className="size-4 shrink-0"`, `strokeWidth={1.5}`, `aria-hidden="true"`. |
| **P3** | l.132 | `aria-label={isPlaying ? studioPlaybackStrings.pauseLabel : studioPlaybackStrings.playLabel}`, and add `title={isPlaying ? studioPlaybackStrings.pauseTitle : studioPlaybackStrings.playTitle}`. |
| **S1** | `strings.ts` l.212–220, `studioPlaybackStrings` | Add `playLabel: 'Play'`, `pauseLabel: 'Pause'`, `playTitle: 'Play (Space)'` and `pauseTitle: 'Pause (Space)'`. Nothing else changes. |

**Constraints:**
- Do not change anything else in the Transport: no other button, readout, handler, `data-*` value, order, gap or row class.
- `onClick={togglePlayback}` is unchanged. The keyboard Space handler in `StudioWorkspace.tsx` is protected and not touched.
- No new token, and no change to `app/styles/`.

**Rulings (B, vetoable, recorded in `backlog.json`):**
- **R38, tooltip.** Without a visible label, a `title` keeps the action and its shortcut discoverable. Back to start already uses the same pattern (`'Back to start (0)'`). Space toggles playback today (`StudioWorkspace.tsx` l.1742).
- **R39, accessible name.** The name stays exactly `Play` / `Pause`, not the title text. Screen readers and every existing suite then keep the same name.
- **R40, size.** The button is 32×32, matching the existing `h-8` height of the row. The icon stays 16 px, as the spec requires.

**B's layout prediction.** This is an in-page simulation from `b-round-180/tools/transport-probe.cjs` (output in `b-round-180/out/transport-probe.json`). It is a prediction, not evidence.

| Viewport | Play box today → after | Back to start … Loop (10 children: 7 controls / readout + 3 separators) | Right group (Follow…Export) | Transport row height / lines | Next row y |
|---|---|---|---|---|---|
| 1440×900 | (12, 43) 96×32 → 32×32 | x −64, y/w/h unchanged | x 925.8, unchanged | 49 / 2, unchanged | 84, unchanged |
| 1280×720 | (12, 43) 96×32 → 32×32 | x −64, y/w/h unchanged | x 765.8 (y 81), unchanged | 87 / 3, unchanged | 122, unchanged |

## 2. Tests and docs (A)
**No new test file.** Edit the existing locks only. Creating another fakes harness is exactly the cost named in the checkpoint request.

| ID | File | Change |
|---|---|---|
| **S2** | `strings.test.ts` l.651–658 | Add the 4 S1 entries to `EXPECTED_V02B_PLAIN_STRINGS.studioPlaybackStrings`, with exactly the S1 values. Nothing else changes. |
| **T1** | `transport-surface-ui.test.tsx` TS1 (l.228–289) | The loop's `expect(tokens).toContain('rounded-md')` becomes: Play contains `rounded-full` and not `rounded-md`, and the other 11 buttons contain `rounded-md`. Every other TS1 assertion is unchanged. The count stays 12, and plain stays 10. |
| **T2** | TS2 (l.291–330) | In `expectPlaySurface`, `present` replaces `'w-24'` with `'w-8'`, `'h-8'`, `'rounded-full'`, `'px-0'` and `'justify-center'`, and `absent` adds `'w-24'`, `'rounded-md'` and `'px-2.5'`. `textContent` becomes `''` for Play and for Pause; it was `'Play'` / `'Pause'`. Keep the `not.toContain('▶')` / `'❚'` checks. Add a `title` assertion: `studioPlaybackStrings.playTitle` / `pauseTitle`. Keep the svg count of 1, the lucide class, and the name lookups by role. The test title may be reworded to say "icon only, round". |
| **D1** | doc 147 l.124 | Strike the stale TODO "C round 178-ის ბრაუზერის მტკიცებულება; შემდეგ სტატუსი → Completed." and mark it done (A-R180 code-reviewer Low 7). Nothing else changes. |
| **D2** | doc 148 l.4 and l.121 | Status → `Completed`. Mark the TODO at l.121 done: C round 180 PASS, published `59d4bab`. Nothing else changes. |
| **D3** | **new** `docs/implementation/2026/quarter-IV/149-studio-m1-round-icon-play.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Include P1–P3/S1, R38–R40, the layout prediction table, mutations m299–m303, and the Ableton row (§6). Status: `In Progress (awaiting C round 181)`. |

## 3. A — files you own (everything else is frozen)
- **The 6 grants**, only at the sites in §1–§2: `ArrangementTransport.tsx`, `strings.ts`, `strings.test.ts`, `transport-surface-ui.test.tsx`, doc 147 and doc 148.
- **The new file:** doc 149.
- **Protected, byte-identical:**
  - every other component and test, including `StudioWorkspace.tsx`, `mode-toggle-colour-ui`, `panel-radius-ui`, `affordance-colour-ui` and `grid-snap-ui`;
  - `app/styles/`, `collection.ts`, `view.ts`, `root.tsx`, and every route, including `studio.$productId.tsx` and `studio-lab.tsx`;
  - `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase / download / studio-token files, `e2e/` and `.claude/**`.
- **Process rules:**
  - Read the primitives first: `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md` (Play is on the playback path), `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.
  - Make every lasting edit with Edit/Write. Use shell writes only for the temporary mutations, and restore and sha-check after each one.
  - Write `a-round-181/end-sha256.txt` (7 paths) and `a-round-181/diff-vs-start.patch` (the 6 grants against `b-round-180/r181-granted-start/`, plus doc 149 in full).
  - Helper scripts go under `a-round-181/tools/`; run them with cwd = store. No commit, no push.

## 4. A — tests and commands (speed rules)
- **Before the edits:** run `b-round-180-r181-vitest-base.txt` (15 files). Expect **229/229**. Any other result is a stop.
- **After the edits:** run the same 15 files and write the list to `a-round-181/vitest-files.txt`. Expect **229/229**, the same count, because no test is added or removed.
- **Checks:** `npm run typecheck`, `npm run lint`, and `npx biome check` on the 4 code/test files.
- **Code review:** 7 changed or new files, so ask the `code-reviewer` subagent. Pass its Architecture note to B verbatim.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and the browser rows.

### 4.1 Mutations
These are temporary shell edits. Restore and run `sha256sum -c` against A's end hashes after each one. Write one JSON + diff per mutation in `a-round-181/mutations/`.

| ID | Mutation | Must turn red | Must stay green |
|---|---|---|---|
| m299 | P1 `rounded-full` → `rounded-md` | TS1, TS2 | the other 14 base files |
| m300 | P1 `w-8` → `w-24` | TS2 | the other 14 base files |
| m301 | P2 re-add `<span>Play</span>` after the Play icon | TS2 | — |
| m302 | P3 remove the `title` attribute | TS2 | the other 14 base files |
| m303 | P3 `aria-label` → the `playTitle` / `pauseTitle` values | TS2 and at least one other base suite that finds `{ name: 'Play' }` (for example render-budget or grid-snap-ui GS14) | strings.test.ts |

If a "must turn red" test stays green, or a "must stay green" test turns red, report it. Do not weaken anything; B rules on it.

## 5. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, with a fresh anonymous context per session. Pixel reads run at DPR 2 with `--disable-lcd-text`.
- **HEAD reference:** use a measurement of HEAD `59d4bab` taken before A's edits, if C has one. Otherwise use C's round-180 HEAD/rest shots and JSON (`c-round-180/out/c180-*.json`, `shots/c180-*/rest-full.png`); the transport row was unchanged by round 180.
- **Clean HEAD copy:** only if needed. Do not share `node_modules/.vite` with the :5173 server (C-R180-HEAD-COPY-VITE-CACHE). Give it a separate vite `cacheDir`, or copy the needed values from round 180.

| Row | What | Pass |
|---|---|---|
| **T181-TARGETED** | Re-run `a-round-181/vitest-files.txt`. | 229/229, 0 failed. |
| **SCOPE-181** | Compare the tree with `c-round-180/end-tree-sha256.txt`. Check the frozen list (999) at C's start and C's end, and A's `end-sha256.txt`. Run `git status`. | Only the 6 grants differ, and doc 149 exists. Frozen 999 OK. `git status` = 6 ` M` + 1 `??`. The protected diff against `59d4bab` is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW-181** | Read the diff. | Only P1–P3, S1, S2, T1, T2 and D1–D3 as written; formatter reflow is allowed. No assertion is removed or weakened: the old `'Play'` / `'Pause'` text checks become `''`, and the name lookups stay. No colour-class selector is added. |
| **MUT-181** (read-only) | Read m299–m303. | Each diff is the described edit, each restore sha is OK, and the red / green sets match §4.1. |
| **CC-M1** | Play at rest, hover, press and playing (Pause), at both viewports. | Box 32×32 at (12, 43) ±0.5 px. Computed `border-radius` ≥ 16 px. Pixel check: each box corner (2 px in from the corner) shows the transport `surface` colour, not the fill, and the centre shows the fill. Fill rgb(236,230,218). Icon stroke rgb(14,13,12). The icon box is 16×16 and centred ±0.5 px. `innerText` = `''` in both states. Hover / press fills are `foreground/92` / `foreground/88`, the same tokens as round 180. Screenshot every state. |
| **LAYOUT-M1** | Bounding boxes of every transport child, and of the first element below the transport row, against HEAD. | Matches the §1 prediction ±0.5 px. Play is 96→32 wide. Back to start … Loop: x −64, y/w/h unchanged. The right group is unchanged. Row height 49 / 87 and line count 2 / 3 are unchanged. The next row y is 84 / 122. 0 elements are added or missing. Nothing wraps or goes off the viewport. |
| **RV1-M1** | Rest-state screenshot diff against HEAD. | Changed pixels only inside the transport row band, from x = 12 to the right edge of the old Loop box (HEAD x 900), at both viewports. 0 changed pixels anywhere else, including the right group and everything below the transport row. |
| **CONTRAST-M1** | Measure each pair. | Icon vs fill ≥ 3:1 (B expects about 15.6). Fill vs the transport `surface` ≥ 3:1 (WCAG 1.4.11; B expects about 14.8). B's computation: `b-round-180/out/contrast-m1.txt`. |
| **FOCUS-M1** | Tab to Play at both viewports. | A focus ring is visible, follows the circle, and is the K10 brass `ring-brand`. Sample one ring pixel on the diagonal of the circle (45°). Screenshot it. |
| **NO-BRASS-M1** | R−B ≥ 45 scan of the Play box at rest, hover, press and playing, without focus. | 0 brass px. Mask only the playhead (K8) if it overlaps, and list it. |
| **BEHAVIOUR-M1** | 1440 required, 1280 short. Add a Library sound. Click Play, wait 1 s with a real output tap, click again. Do the same with Space while focus is on the workspace, not on a slider. Press Space / Enter while focus is on the Play button. | Click starts playback (tap peak > 0, the playhead advances). The accessible name becomes `Pause`, the icon is `lucide-pause`, and the box is unchanged. The second click stops. Space toggles both ways. On a focused Play button, Space / Enter toggles **exactly once** per press, the same as HEAD (compare with a HEAD run or recorded HEAD behaviour). 0 pageerror. Undo restores the arrangement. If HEAD also toggles twice on a focused-button Space / Enter, C records that as a **pre-existing finding** (with its severity and the HEAD evidence), not as a round-181 FAIL. |
| **A11Y-M1** | Playwright `getByRole('button', { name: 'Play', exact: true })`, then the title attribute and the hover tooltip. | The name is exactly `Play` / `Pause`. The `title` is `Play (Space)` / `Pause (Space)`. The circle's 32 px diameter is ≥ 24 px (WCAG 2.5.8). **Info only, not a FAIL:** Chromium hit-tests rounded corners, so a click 3 px inside a box corner may miss the button. Report what happens. |
| **G181-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD).
- Every run writes a uniquely named output file. Keep screenshots under `c-round-181/`, never in `store/`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Play control and Space | Live 12 manual, ch. 6 "Arrangement View", §6.3 "Transport and Playback": https://www.ableton.com/en/live-manual/12/arrangement-view/ (fetched by B 2026-10-26 with curl; text read, figure not viewed) | **Confirmed (text):** the Control Bar has a Play button that starts playback and a separate Stop button that stops it; the space bar toggles playback on and off. | CZABA keeps its existing single Play/Pause toggle. That is a deliberate, pre-existing difference, unchanged here. Space toggles in both. | BEHAVIOUR-M1; parity: **deliberate difference** (toggle vs Play+Stop), **confirmed** (Space) |
| Icon-only, round button | The same §6.3 figure, "The Play and Stop Buttons in the Control Bar" | **Unverified.** "Icon only" is an inference from the figure, which B did not view. Nothing in the text says it is round. | User-approved CZABA M1 (visual-direction-a.md: "Apple and pro-DAW norm"). It is not claimed as Ableton behaviour. | CC-M1; parity **unverified** |

## 7. Evidence and reporting
- **A:** `a-round-181.md` and `a-round-181/`.
- **C:** `c-round-181.md`, `c-round-181.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-181/`.
- **Both:** write the report files as you go.

## 8. Outcome, fixed in advance (B at round 182 planning)
| Condition | Round 182 |
|---|---|
| **C PASS** | Root publishes round 181, and M1 → **მზადაა**. If B plans on or after 2026-10-27, round 182 is the **REGRESSION round**: every done / c_pass item gets one short check at both viewports, plus `npm run test:e2e:smoke`, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN and M1. **M3** follows it. |
| C FAIL at Medium or above in P1–P3, S1, or a layout move outside the §1 prediction | A bounded fix-up by the same owner in the same files. |
| C FAIL on Lows only | A fix-up if it is in this round's files and cheap; otherwise `deferred_low_polish`, and publication goes ahead. |
| A browser row could not run | `browserVerified=false` → M1 is not done, and B re-plans that browser half. |

## 9. Root notes
- **Gate (on C PASS):** publish round 181 against `59d4bab`: the 6 grants plus doc 149. Every protected file in §3 stays unchanged.
- **Architecture:** `b-round-180-checkpoint-request.md` is the fresh bounded frontend-architect request at the DUX-R-5 boundary. It covers Q1 recipe extraction, Q2 test infrastructure together with ROOT-RECON-GRID-HARNESS, and Q3 order. It is non-blocking, and fallback (c) applies until root answers.
