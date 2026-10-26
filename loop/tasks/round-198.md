# CURRENT TASK — Round 198: C-R196-02 — keyboard focus inside the timeline is never hidden under the sticky chrome (R91 keyboard-gated focus reveal)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 (planned at 22:34 UTC) · Decision: **D-29z163** (`backlog.json` → open finding `C-R196-02` `b_probe_r198`, `narrow_grants` round 198, `rounds[198]`)

- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text. `loop/lessons.md` does not exist yet; the first RETRO (round 200) creates it.
- **Previous task:** `tasks/round-197.md` is an exact copy of the round-197 `current-task.md` (`cmp` OK). B's reasoning is in `b-round-197.md`.
- **Why this round:**
  - C round 197 is a **PASS** (`browserVerified=true`) and was published as `2505252`. SABA-B-4 stage 1 is done.
  - **C-R196-02** (Medium, pre-existing, WCAG 2.4.11) is still open. R89 was reverted under its stop rule, because scroll-padding made focus on the sticky chrome jump the view to the top.
  - Round 197 §7 placed C-R196-02 "right after the regression round". But the regression round is due at the first planning on or after 2026-10-27. This planning ran on 2026-10-26 at 22:34 UTC (`regression-last.json` = 2026-10-24), so it is not due yet. Under the bug gate a Medium comes first. The order is: **198 = C-R196-02, 199 = REGRESSION, 200 = RETRO.**

## Baseline: HEAD `2505252`, clean tree
- `gates/gate-round-197.json` is `published`, commit `250525200f42…`. `git status --short` is empty (`b-round-197/git-status-at-planning.txt`).
- **Frozen list:** `b-round-197-r198-tree-sha256.txt`, **1027 entries** (the 1030 tracked files minus the 3 grants).
- **Grants:** `b-round-197-r198-grants.txt` (3 files, each narrow, see §2). **New files:** `b-round-197-r198-new-files.txt` (2).
- **Start hashes:** `b-round-197-r198-granted-start-sha256.txt`. **Start copies:** `b-round-197/r198-granted-start/`.
- **A's first step.** Check all four, running everything from the store root. If anything differs, stop and report.
  1. HEAD is `2505252`.
  2. `git status --short` is empty.
  3. The frozen list is OK (`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-197-r198-tree-sha256.txt`).
  4. The 3 start hashes are OK.

## 0. B's evidence: live probes, no source change
These are B's own Playwright runs on `:5173` (Chromium 143.0.7499.4, DPR 2), using C's round-197 rich scene. Scripts and JSON are in `b-round-197/` (`probe-scroll-margin.cjs <W> <mode>`, `probe-check*.cjs`, `probe-minimal*.cjs`). In every mode, CSS or a listener was injected with `page.evaluate`/`addStyleTag`.

| Mode (1280 rich unless noted) | Hidden stops, Tab / Shift+Tab | Chrome focus while scrolled to 46: playhead grab, flag `focus()`, F2 rename, Tab onto Snap, 5 Tabs on through the chrome | Mouse: Snap, lane Mute |
|---|---|---|---|
| **none** (HEAD) | **6 / 6** (i69–74, Video row, tops 267–293 < chrome bottom 313) | 46 everywhere | 46 → 46 |
| `scroll-margin-top` = chrome height on lane descendants | 6 / 6 (no effect) | 46 | 46 |
| `scroll-padding-top` = 84 px (R89) | 0 / 0 | **0** (grab, flag, F2) | 46 |
| `scroll-padding` + `scroll-margin-top:-84px` on the chrome | 0 / 0 | grab and flag stay 46, but **F2 → 0, Tab through the chrome → 0** | 46 |
| **keyboard-gated reveal** (focusin, outside the chrome, `html[data-focus-source=keyboard]`, `scrollTop -= chromeBottom − targetTop`) | **0 / 0** | **46 everywhere** | **46 → 46** |
| keyboard-gated reveal, 1440 rich (the control case) | 0 / 0 | 0 (nothing to scroll) | 0 → 0 |

- **Why scroll-margin fails (confirmed fact).** A minimal page (`probe-minimal*.cjs`) shows the same thing. Chromium 143 honours `scroll-margin` for `scrollIntoView({block:'start'})` (150 → 100). For `focus()` and `block:'nearest'` it does not (150 → 150), because the element's own box is already inside the scrollport.
- **Why scroll-padding fails.** Sticky chrome controls sit inside the padded band, so focusing one scrolls the view up toward the chrome's unstuck position.
- **Inference, not a confirmed fact:** B's probe used a raw `focusin` listener. React `onFocus` is delegated as `focusin` and should run in the same dispatch, before Chromium's focus scroll. Only A's live proof confirms that the React path has the same timing.
- **Inference, not a confirmed fact:** an element-level reveal that skips the chrome and pointer focus is the smallest mechanism that meets every row.
- `handleTimelineScroll` (~l.1473) only reacts to `scrollLeft` changes (closing the marker menu, pausing follow). A vertical-only change leaves both alone; `notifyTimelineScroll` still runs.

## 1. What changes (exact)

### R91: keyboard-gated focus reveal (vetoable by Saba; record it in doc 159, section "Round 198")
- **Lifted ban.** Round 197's R89 stop rule and AN-REVIEW-197 forbade a focusin handler. Given the probe table above, this round explicitly allows **exactly one** focus handler: a React `onFocus` prop on the timeline scroller div (`StudioWorkspace.tsx` ~l.2255, `data-testid="arrangement-timeline-scroller"`). React `onFocus` bubbles like focusin and needs no `addEventListener`, effect or cleanup.
- **Still forbidden:** `addEventListener`, a new `useEffect`/`useLayoutEffect`, `scrollIntoView`, `scrollTo`/`scrollBy` with `behavior: 'smooth'`, `scroll-padding`, and `scroll-margin`. The page-wide focus-source listeners from R85 stay as they are.
- **Behaviour.** When focus lands on an element `t` inside the scroller:
  1. Do nothing unless `document.documentElement.dataset.focusSource === 'keyboard'`. This is the same signal R85 uses to show the ring, so pointer focus never scrolls. A missing value also means do nothing.
  2. Do nothing if `t` is inside the chrome (`timelineChromeRef.current.contains(t)`), or if the chrome ref is null.
  3. Read `chromeBottom = timelineChromeRef.current.getBoundingClientRect().bottom` and `targetTop = t.getBoundingClientRect().top`.
  4. `next = resolveFocusRevealScrollTop({ scrollTop, chromeBottom, targetTop })`. If it is not `null`, set `scroller.scrollTop = next`. Vertical only: never touch `scrollLeft`.
- **Helper** (new file `app/lib/arrangement/focus-reveal.ts`, pure, no DOM):
  - `resolveFocusRevealScrollTop(input: { scrollTop: number; chromeBottom: number; targetTop: number }): number | null`.
  - `delta = chromeBottom − targetTop`.
  - If `delta <= 0.5` or any input is not finite, return `null`.
  - Otherwise return `Math.max(0, scrollTop − delta)`.
  - The exported name and file follow `AGENT_DISCOVERABLE_CODE.md`; a better name is fine if it is recorded.
- **Optional:** add `data-testid="arrangement-timeline-chrome"` to the chrome div (~l.2266), for tests and C. No other attribute changes.
- **Stop rule.** If, after R91, the live probe still shows any keyboard stop in the scroller with its top above the chrome bottom (more than 0.5 px), or any chrome or pointer action changes `scrollTop`, **do not add a second mechanism**. Report the numbers. C-R196-02 then stays open, and B re-plans it.
- **Out of scope:** horizontal reveal under the sticky lane headers (`scroll-padding-left`, clips under the header), the 1440 layout, and the bottom edge (Chromium's native focus scroll already handles it: 0 bottom-hidden stops in every probe).

### Not in this round (recorded, not scheduled here)
- **C-R197-01** (tightly packed markers, Low) → `deferred_low_polish`. `ArrangementMarkerRow.tsx` is frozen.
- **C-R196-05** and **C-R196-03** stay where round 197 put them (deferred Low, and a SABA-B-4 stage-2 input).

## 2. A: files you own (everything else is frozen)
- `app/components/arrangement/StudioWorkspace.tsx`: **only** R91. That means one `useCallback` handler, the `onFocus` prop on the scroller div, the helper import, and optionally the chrome `data-testid`. No other line.
- **New:** `app/lib/arrangement/focus-reveal.ts` (the helper).
- **New:** `app/lib/arrangement/__tests__/focus-reveal.test.ts` (unit tests FRU-*).
- `app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx`: **replace** the 3 `it.todo` with the real FR-* rows. Do not delete the file.
- `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md`: append a Georgian "Round 198" section (R91, the probe table, the rejected alternatives, the measurements). Use Edit/Write, not a shell heredoc.
- **Read first:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `prompts/new-test.md` and `prompts/studio-feature.md`.
- Write `a-round-198/end-sha256.txt` (grants plus new files) and `a-round-198/diff-vs-start.patch` (grants vs `b-round-197/r198-granted-start/`; new files in full). No commit, no push.
- **Any other red frozen test:** change your implementation, or stop and report. No other test edits are pre-authorised.

## 3. A: tests and checks (speed rules)
- **`focus-reveal.test.ts` (unit):**
  - **FRU-1:** 46 / 313 / 267 → `0`.
  - **FRU-2:** a target at or below the chrome bottom (313 / 313, and 313 / 400) → `null`.
  - **FRU-3:** the result is never negative (scrollTop 10, delta 46 → `0`).
  - **FRU-4:** `delta` of 0.5 → `null`; `delta` of 0.6 → `scrollTop − 0.6`.
  - **FRU-5:** `NaN` or `Infinity` in any input → `null`.
- **`focus-reveal-ui.test.tsx` (jsdom):** render the Studio and reuse `__tests__/helpers/workspace-test-environment.ts`. Stub the chrome's and the target's `getBoundingClientRect`, and stub the scroller's `scrollTop` with an instance getter/setter (`Object.defineProperty`, no type assertions).
  - **FR-a:** `data-focus-source="keyboard"`, scrollTop 46, chrome bottom 313. Focusing a Video-lane header button with top 267 gives scrollTop **0**.
  - **FR-b:** the same with `data-focus-source="pointer"`, and again with the attribute absent → scrollTop stays **46**.
  - **FR-c:** keyboard focus on a chrome control (Snap, and the marker add button) whose rect top is above the chrome bottom → **46**.
  - **FR-d:** keyboard focus on a lane control with top ≥ the chrome bottom → **46**. Its `scrollLeft` is unchanged in every FR row.
  - **FR-e:** after FR-a, the marker menu is not closed and follow mode is unchanged. A may pick the cheapest observable for each. FR-e is a smoke row (a stubbed `scrollTop` fires no scroll event in jsdom); SIDE-198 is the real check.
  - **Red proof** on the start copies (a scratch copy without R91): FR-a red. FRU-* are red because the module does not exist.
- **Mutants** (A on scratch copies; C repeats them):
  - m1 removes the `onFocus` prop → FR-a red.
  - m2 drops the keyboard gate → FR-b red.
  - m3 drops the chrome exclusion → FR-c red.
  - m4 removes `Math.max(0, …)` → FRU-3 red.
  - m5 changes `<= 0.5` to `< 0` → FRU-4 red.
- **Neighbour suites green:** every suite that queries `arrangement-timeline-scroller` (grep; 10 today), plus `focus-source`, `studio-focus-ring`, `markers-ui`, `track-layout` and the detail-panel suites. Then `npm run typecheck`, `npm run lint` (count vs round 197: 214 warnings + 1 info; no new ones), and `npx biome check` on every changed or new file (0 errors). Do not run the full suite.
- **Live proof** (Playwright Chromium on `:5173`, DPR 2, `--disable-lcd-text`; save under `a-round-198/`). Copying `b-round-197/probe-scroll-margin.cjs` and `lib-b197.cjs` is fine; run mode `none` against the real tree.
  1. **Forward and backward Tab**, rich scene, at 1280 and 1440. Every stop in the scroller and outside the chrome has top ≥ the chrome bottom − 0.5, and its ring has changed pixels.
  2. **Chrome and pointer focus**, while scrolled to the maximum: playhead grab and drag, flag focus, F2 rename, Tab onto Snap and on through the chrome, a mouse click on Snap, and a mouse click on a lane Mute. Each leaves `scrollTop` unchanged.
  3. **Load:** `scrollTop`/`scrollLeft` are 0/0 at both viewports, with 0 console errors (the expected cart `ERR_CONNECTION_REFUSED` aside).
- **Code review:** 3+ files change, so use the `code-reviewer` subagent. Pass its Architecture note to B verbatim. Fix its Medium+ findings inside the grants.

## 4. C: rows
**Setup:** real Playwright Chromium on the shared `:5173`, a fresh anonymous context, DPR 2, `--disable-lcd-text`, at **1440×900 and 1280×720**. Record the engine version.
- **Ref:** HEAD `2505252`, i.e. a scratch copy of the tree with the 3 grants restored from `b-round-197/r198-granted-start/` and the 2 new files removed. Check it against the frozen list. Serve it on a separate port with its own `cacheDir`, and say how it was built.
- **Rich scene:** round 197's recipe (`c-round-197/tools/rich.cjs`): drop `demo-middle-east` on Music, Shift-click Stems + SFX names, Ctrl+G, add a marker, open the detail panel, click the clip.

| Row | What | Pass |
|---|---|---|
| **FOCUS-REVEAL-198** (C-R196-02) | Rich scene at 1280 and 1440, plus the default scene: a full Tab cycle forward, then Shift+Tab back through every lane-header control. | <ul><li>For **every** stop inside the scroller and outside the chrome, the element's top ≥ the chrome bottom − 0.5 px.</li><li>Its ring is visible: changed px > 0, on four sides or on the sides round 197 recorded as clipped.</li><li>At 1280 rich, i69–74 (and the second-cycle stops) are visible.</li><li>The reached set and order equal the ref.</li><li>At 1440, where the ref has no hidden stop, the per-stop `scrollTop` sequence equals the ref.</li></ul> |
| **CHROME-FOCUS-198** | Rich scene at 1280, scrolled to the maximum (46 in the probes). One step at a time, re-scrolling to the maximum between steps: <ul><li>playhead handle grab and drag;</li><li>Tab onto the marker flag;</li><li>programmatic `focus()` on the flag;</li><li>F2 rename, then Escape;</li><li>Tab onto Snap and 5 more Tabs through the chrome;</li><li>Shift+Tab from the first lane control back into the chrome.</li></ul> | `scrollTop` is unchanged after every step, equal to the ref. |
| **POINTER-198** | Mouse clicks while scrolled: Snap, a fully visible lane Mute, and a lane control whose top is partly under the chrome (scroll so it is cut by 2–10 px, then click its visible part). Repeat the last one at 1440 if a layout allows it; otherwise note n/a. | <ul><li>`scrollTop` is unchanged.</li><li>No ring after the press (R85).</li><li>A following ArrowUp/Tab shows the ring and reveals the control.</li></ul> |
| **SIDE-198** | <ul><li>During playback with Follow on, Tab into the Video row at 1280 rich.</li><li>Open the marker context menu, then move focus by keyboard into a lane under the chrome.</li></ul> | <ul><li>`scrollLeft` is never changed by the reveal.</li><li>Follow stays on (its button state is unchanged).</li><li>The marker-menu behaviour equals the ref: if the ref keeps it open, the tree keeps it open; if the ref closes it, so does the tree.</li><li>0 console errors.</li></ul> |
| **RING-KEY-198** | Re-run RING-KEY-197 on both scenes at both viewports. | <ul><li>Same reached set and order as the ref.</li><li>Every stop: computed width `1px` or `1.5px`, brass at 80 %, offset per the K0 list and the flag edge constant.</li><li>Ring ≥ 3:1 on the sampled types.</li><li>**No stop is hidden under the chrome**, which now holds at 1280 too.</li></ul> |
| **REST-198** | `/studio-lab` at rest at both viewports vs the ref. | <ul><li>0 changed px.</li><li>Chrome, strips and lane boxes Δ 0.</li><li>Load `scrollTop`/`scrollLeft` equal the ref (0/0).</li><li>0 console errors.</li></ul> |
| **G198-3** | Same as G197-3. | <ul><li>`/studio-lab` loads anonymously, with the workspace and the demo badge present.</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`.</li><li>studio-token with no header → 401; with a fake Bearer → 403 (mock-backed; if the mock is not running, start it from the loop folder and stop that PID).</li></ul> |
| **SCOPE-198** | <ul><li>Frozen list (1027) at C's start and end.</li><li>A's `end-sha256.txt`.</li><li>`git status`.</li><li>The diff of each grant vs the start copies.</li></ul> | <ul><li>`git status` = ` M` on the 3 grants + `??` on the 2 new files, nothing else.</li><li>The StudioWorkspace diff is only R91: the handler, `onFocus`, the import and the optional testid.</li><li>The UI test only replaces the todos.</li><li>Doc 159 has a Georgian Round-198 section.</li></ul> |
| **T-RUN-198** | <ul><li>The new and changed suites on the tree and on a start-copy scratch.</li><li>Mutants m1–m5 (§3).</li></ul> | <ul><li>The tree is green.</li><li>FR-a red on the scratch; FRU-* fail there (no module).</li><li>Each mutant turns its listed test red.</li></ul> |
| **AN-REVIEW-198** | The diff, the new tests and doc 159. | <ul><li>No `as`, `any` or `@ts-ignore`, and no hex or colour function in `.tsx`.</li><li>**Exactly one** new focus handler: a React `onFocus` on the scroller.</li><li>No `addEventListener`, no new effect, no `scrollIntoView`, no `scroll-padding`/`scroll-margin`, no smooth scrolling.</li><li>The helper is pure.</li><li>The doc is in Georgian.</li></ul> |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror, 0 hydration messages, 0 non-font remote requests, 0 Authorization headers. |

**Outcomes written in advance:**
- Any keyboard stop in the scroller still above the chrome bottom → **FAIL (Medium, C-R196-02)**, unless A invoked the stop rule. In that case FOCUS-REVEAL-198 is `notRun` with A's measurement, and C-R196-02 stays open.
- Any chrome-focus, pointer or load step that changes `scrollTop`/`scrollLeft` vs the ref → regression **FAIL (Medium)**.
- Follow mode pauses, or the marker-menu behaviour differs from the ref → **FAIL (Medium)**.
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE honesty:** if A stops without implementing, SCOPE-198 is `notRun` with a `scopeNote`.

**Adjacent behaviour that could break, and the check that catches it:**

| Risk | Check |
|---|---|
| Chrome focus jumps the lanes (the R89 failure) | CHROME-FOCUS-198, FR-c |
| A mouse press scrolls the view | POINTER-198, FR-b |
| Follow mode pauses, or the marker menu closes, through a scroll event | SIDE-198, FR-e |
| Tab order or ring styles change | RING-KEY-198 |
| Load or resize scrolls by itself | REST-198 |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Keyboard focus revealed below a sticky timeline header | **None.** The Live 12 manual does not specify keyboard focus rings or how focus scrolls the view. | Nothing. | WCAG 2.4.11 (Focus Not Obscured); Saba's SABA-B-4 request. | Parity **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-198.md` and `a-round-198/`.
- **C:** `c-round-198.md`, `c-round-198.json` and `c-round-198/`.
- Write them as you go.

## 7. Outcome, fixed in advance
| Condition | Round 199 |
|---|---|
| **C PASS** (`browserVerified=true`) | <ul><li>Root publishes round 198 against `2505252`. C-R196-02 is closed.</li><li>Round 199 is the **REGRESSION round** (due now). It covers every done or c_pass item, SABA-B-4 stage 1 and this reveal, and runs `npm run test:e2e:smoke`.</li><li>Round 200 is the **RETRO**. Then SABA-B-4 stage 2 (store pages, C-R196-03 input), then STORE-2b.</li></ul> |
| PASS with the stop rule invoked | Do not publish a no-op. Round 199 is the regression round, and C-R196-02 is re-planned after it with A's numbers. |
| **C FAIL** on a Medium+ row of this round | One more bounded fix-up, then the regression round. |
| A browser row that could run here did not run | `browserVerified=false`. The item is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate on C PASS:** round 198 against `2505252`: 3 modified + 2 new files.
- **For Saba (vetoable, non-blocking):** R91 (keyboard-only focus reveal). R83–R90 are still pending his veto.
- **Requested from root (non-blocking):** a bounded frontend-architect checkpoint at this SABA-B-4 stage-1 boundary (`b-round-197.md` §6). It does not hold back round 198.
- **Architecture signals kept (not scheduled):** ARCH-R197-FOCUS-TEST-COST (reviewer Signal 3, the maintenance cost of the source-parsing focus tests). A-R196 Signal 4 (move the R85 mount out of `StudioWorkspace` at the stage-2 store-mount decision). ARCH-R193-THEME-REGION.
