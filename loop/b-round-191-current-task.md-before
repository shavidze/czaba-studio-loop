# CURRENT TASK — Round 191: SABA-B-3 (Medium, Saba 2026-10-26) — the Studio faders turn into a solid brass box while pressed or dragged; one quiet fader look for track / group / Master / Clip Gain, a single thin offset focus ring on all six range controls

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z156** (`backlog.json` → `open_findings` SABA-B-3, `rounds[191]`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the "Saba's bug and the performance queue (2026-10-26)" section. They take precedence over older text.
- **Previous task:** `tasks/round-190.md` is an exact copy of the round-190 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-190.md`.
- **Saba's report (DATA):** "On a lane's Volume fader (next to M, readout '+6.0'), pressing it turns the whole control into a solid brass box with a white track and an oversized white thumb. … The pressed, focused and active states should stay quiet: a graphite track with the brass value fill, the normal thumb, and a thin brass focus ring (`focus-visible` only, offset), with no filled background box. The same must hold for every fader of that kind: track, group, master and clip gain."
- **Saba's screenshot:** `user-review/img/saba-2026-10-26-volume-fader-click.png`, also copied to `b-round-190/shots/`. B viewed it. It shows the track Volume fader at +6.0 inside a filled brass rectangle, with an ivory track and an ivory thumb.

## Baseline = HEAD `338564e` (gate 190 published), clean tree
- **Gate:** `gates/gate-round-190.json` is `published`, commit `338564e` (rounds 189 + 190), and both remotes match. `git status` is clean (B checked: 0 lines). 1019 tracked paths.
- **Frozen list:** `b-round-190-r191-tree-sha256.txt`, **1013 entries** (1019 minus the 6 grants). B checked it from the store root: OK.
- **Grants (existing files):** `b-round-190-r191-grants.txt`, 6 files:
  - `app/components/arrangement/ArrangementLane.tsx` (track Volume + Pan);
  - `app/components/arrangement/ArrangementGroupHeader.tsx` (group Volume);
  - `app/components/arrangement/ArrangementMaster.tsx` (Master Volume);
  - `app/components/arrangement/ArrangementDetailPanel.tsx` (Clip Gain fader);
  - `app/components/arrangement/ArrangementTransport.tsx` (Zoom; focus part only, see K3);
  - `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` (DXA1 only, see T2).
- **New files:** `b-round-190-r191-new-files.txt`:
  - `app/components/arrangement/studio-fader.ts`;
  - `app/lib/arrangement/__tests__/fader-style-ui.test.tsx`;
  - `docs/implementation/2026/quarter-IV/157-saba-b-3-fader-pressed-state.md`.

  All three paths are free at `338564e`.
- **Start hashes:** `b-round-190-r191-granted-start-sha256.txt`. **Start copies:** `b-round-190/r191-granted-start/`.
- **A's first step:** check these three things. If anything differs, stop and report.
  1. HEAD is `338564e`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-190-r191-tree-sha256.txt`, run **from the store root**, is OK.
  3. The six start hashes match.
- **Mock API:** only G191-3 and STORE-AFTER-191 need it. If :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round
- **Saba's direct order (2026-10-26):** SABA-B-3 is a **Medium**. It is fixed **next**, ahead of the remaining STORE stages, and only Studio fader files are touched.
- **Round 190 closed.** C PASS (`browserVerified=true`, `realVerified=true`, 0 bugs), and gate 190 published `338564e`. STORE-1d → **მზადაა**, which completes STORE-1.
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is 2026-10-26 (2 days). The round-190 task predicted that round 191 would be the regression round. That assumed planning on 2026-10-27, which did not happen. The first planning on or after 2026-10-27 makes that round the REGRESSION round (§7).
- **B's reproduction (DATA for A, not a diagnosis to copy).** Tool: `b-round-190/tools/fader-probe.cjs`. Shots: `b-round-190/shots/vol-{rest,pressed,drag,released,keyboard}.png`. Setup: `/studio-lab`, 1440×900, DPR 2, the first track's Volume fader.
  - **Rest:** ivory fill and thumb (`accent-foreground` = `#ece6da`) on Chromium's native track.
  - **Pointer-down:** the control becomes a brass rectangle around the 4 px-high input, with the ivory track and thumb inside. This matches Saba's screenshot.
  - **Computed style while pressed:** `:focus-visible` = **true** on a mouse press. `box-shadow` is a 2 px `rgb(201,164,106)` ring (`focus-visible:ring-2 ring-brand`). `outline` is `rgb(201,164,106) solid 2px`, even though the class list has `focus-visible:outline-none`.
  - **B's hypothesis (A confirms it):** the global unlayered rule `:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px }` (`app.css:379`) beats Tailwind v4's layered `outline-none`. The 2 px ring hugging the element and the 2 px outline at a 2 px offset then merge into one band about 4 px wide around a 4 px-high control.
  - **Same class string on all six range inputs:** `accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand` is on track Volume, Pan, group Volume, Master, Clip Gain and Zoom.
- **No Critical or High finding is open.** No other cloud-reproducible Medium is open.

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in D1)
- **R68 — the level-fader look (track Volume, group Volume, Master Volume, Clip Gain).** These four faders follow Saba's 2026-10-26 description in **every** state: rest, hover, pointer-down, dragging, after release and keyboard focus.
  - **Track:** graphite. Use an existing Obsidian theme token, for example `muted-bg` or `outline-strong`. A chooses and C measures. The track must be visible against the parent background.
  - **Value fill:** brass (`brand` token), from the minimum (the left edge) to the thumb centre. At the minimum the fill is empty: `CLIP_GAIN_MIN_DB` for Clip Gain, `TRACK_VOLUME_DB_MIN` / −∞ for track and group, `MASTER_GAIN_MIN_DB` for Master.
  - **Thumb:** the normal one. Today's ivory (`foreground`) round thumb, the same diameter as today's rest thumb ± 1 px. Never brass, and it does not grow when pressed.
  - **No filled box** and no background change in any state.
  - **Why:** Saba named the target colour by colour, and his note is newer than DUX-R-5b-1. R68 therefore **supersedes DUX-R-5b-1 for the fill of these four faders only**. Thumbs stay neutral, and brass stays reserved everywhere else.
  - This intentionally changes the **rest** look of the four faders, not only the pressed look. Saba may veto it.
- **R69 — one focus indicator.** All six range controls (the four above plus Pan and Zoom) show **one** thin brass ring.
  - It is at most 2 px thick and offset from the control, so that a gap of the parent's background shows between them.
  - It appears only while `:focus-visible` matches. Chromium matches it on a mouse press of a range input (B's probe), so a thin ring after a click is correct under Saba's own "`focus-visible` only" wording.
  - The double ring and the filled band are the bug.
- **R70 — Pan and Zoom keep their neutral look.** They get only R69, the focus fix. Their track, fill and thumb stay as they are today.
  - **Why:** Saba named "track, group, master and clip gain". Pan is a centre-based control and Zoom is not a level, so a brass fill on them would be a different design. Fixing their focus anyway means Pan, which sits next to the Volume fader, does not keep the box bug.
  - Rejected: brass fill on Pan and Zoom (not requested, and a different design).
  - Rejected: leaving Pan and Zoom with the double ring (same bug, same class string).
- **R71 — one shared recipe.** The classes live in **one** new module, `app/components/arrangement/studio-fader.ts`, following the precedent of `studio-scrollbar.ts` (`STUDIO_SCROLLBAR_CLASS`).
  - A names the exports per `AGENT_DISCOVERABLE_CODE.md`: for example one focus-ring constant used by all six controls and one level-fader constant used by four.
  - Size classes stay at each site. Clip Gain keeps `h-4 w-24` and `disabled:opacity-50`. The widths (`w-12`, `w-24`, `flex-1`, `w-20`) do not change.

| ID | File(s) | Change |
|---|---|---|
| **K0** (evidence first) | none (temporary edits allowed) | <ol><li>On the start tree, **reproduce** B's probe at 1440 and 1280: copy `b-round-190/tools/fader-probe.cjs` into `a-round-191/tools/` and extend it to all six controls.</li><li>**Confirm the cause** on one fader with temporary edits, one half at a time: (a) remove `focus-visible:ring-2 focus-visible:ring-brand`; (b) neutralise the global outline for that element only, for example with Tailwind's `!` important modifier, which this codebase already uses in `ArrangementMaster.tsx`.</li><li>Record the computed `outline` / `box-shadow` and a crop for each variant in `a-round-191.md`. Keep the confirmed cause and any remaining hypothesis apart.</li></ol>**`app/styles/app.css` is frozen**: the fix lives in the grants and the new module. |
| **K1** (R68, R71) | `studio-fader.ts`, `ArrangementLane.tsx` (Volume), `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementDetailPanel.tsx` | Apply the level-fader look to the four faders. **Technique is A's choice, judged by C's pixels.** Constraints: <ul><li>Tailwind and tokens only: no hardcoded colour, no inline colour, no new rule in any `.css` file.</li><li>No `as`, `any` or `@ts-ignore`. An inline `style` carrying a **percentage** or a width is allowed; a colour in `style` is not.</li><li>Chromium has no native fill pseudo-element. Either approach is fine: `appearance-none` plus `[&::-webkit-slider-runnable-track]` / `[&::-webkit-slider-thumb]` / `[&::-moz-range-*]` utilities, or a fill element behind a transparent track.</li><li>The `<input type="range">` stays the interactive element. Unchanged: its `ref`s (`useRelativeFaderDrag`), handlers, `min` / `max` / `step` / `value`, `aria-label`, `aria-valuetext`, `title`, `data-testid` and its **width**. The relative drag maths, Shift-fine drag, touch, double-click reset, keyboard steps and commit-on-release must behave exactly as before.</li><li>**Height, so the ring can enclose the thumb.** Three of the level faders are `h-1` (4 px), and the ≈ 16 px thumb overflows that box. A ring that follows such a box would cut through the thumb. **The input's height may grow so that its box encloses the thumb**, provided that: the visible track keeps its current thickness; the thumb keeps its size; and the row and panel heights and the M/S/readout boxes stay unchanged ± 1 px (the rows are `items-center` with `h-5` buttons). Prefer this to a ring on a wrapper; if A uses a wrapper (`:has(:focus-visible)`), record why. The same rule applies to Pan and Zoom (K3).</li><li>During a drag, the fill follows the live preview value, not only the committed value.</li></ul> |
| **K2** (R69, R71) | the same four files | Replace the double ring with the single offset ring of R69 on the four level faders. Either remove `focus-visible:ring-2 focus-visible:ring-brand` and the ineffective `focus-visible:outline-none`, or replace them with one mechanism that produces exactly one ring. A chooses. |
| **K3** (R69, R70) | `ArrangementLane.tsx` (Pan), `ArrangementTransport.tsx` (Zoom) | The same single ring as K2. Pan and Zoom keep `accent-foreground` and their current track, fill and thumb. No other change to these two inputs. |
| **T1** (new) | `fader-style-ui.test.tsx` | Mount the workspace the way `affordance-colour-ui.test.tsx` does. Reuse its pattern; `helpers/workspace-test-environment.ts` may be used read-only. Cases: <ol><li>**FS1:** all six range inputs carry the shared focus recipe, and none still carries the old `focus-visible:ring-2`.</li><li>**FS2:** the four level faders carry the level recipe, and their fill reflects the value. At the minimum it is 0 %; at the maximum, 100 %; at a mid value it matches `(value − min) / (max − min)` within 0.5 %. Track Volume at −∞ is 0 %.</li><li>**FS3:** after a keyboard ArrowRight or ArrowLeft on each level fader, the fill follows the new value.</li><li>**FS4:** a preview value (the fader's `onChange`, without a commit) moves the fill.</li><li>**FS5:** Pan and Zoom carry **no** level recipe and keep `accent-foreground`.</li><li>**FS6:** the disabled Clip Gain fader stays `disabled`, keeps `disabled:opacity-50` and still shows its fill at its value.</li></ol>jsdom cannot paint, so these cases assert tokens and computed fill values. The look itself is a browser acceptance (§4). |
| **T2** (DXA1) | `affordance-colour-ui.test.tsx` | Amend **only** DXA1 and its helper `expectNeutralThumb`. The **thumb** stays neutral on all six controls (no brass thumb token). Brass is allowed only on the level faders' fill token(s) and on the focus ring. The test name states R68. Every other case in the file stays byte-identical. |
| **D1** (new) | doc 157 | Georgian, following `docs/implementation/TEMPLATE.md`. <ul><li>Status `In Progress (awaiting C round 191)`.</li><li>R68–R71 with their rejected alternatives.</li><li>A problem → solution entry for SABA-B-3, with K0's confirmed cause and before/after crops.</li><li>A note that the unlayered global `:focus-visible` rule probably affects every control that uses `focus-visible:outline-none focus-visible:ring-2` (B counted 53 component sites). It is recorded as signal `GLOBAL-FOCUS-VISIBLE-UNLAYERED` and is **not** fixed this round.</li><li>Testing, and a TODO naming the Safari/Firefox manual check.</li></ul> |

**Unchanged on purpose (frozen list, byte-identical):**
- `app/styles/*.css`, `useRelativeFaderDrag.ts`, `fader.ts`, `ArrangementContext.tsx` and every other component;
- every other test, including `fader-click`, `fader-touch`, `fader-guards`, `clip-gain-*`, `track-volume-db`, `group-volume-db`, `waveform-zoom` and the other `*-colour-ui` suites;
- the store files and every protected file.

## 2. A — files you own (everything else is frozen)
- **Grants:** the 6 files above (T2 limited to DXA1 and its helper) and the 3 new files. Plus your own `a-round-191.md` and `a-round-191/`.
- **Protected, byte-identical:** every other path in the frozen list. That includes the purchase/auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts`, `firebase.client.ts`), `app/styles/**`, `public/`, `.claude/**`, `package.json` and the configs. Do not touch `mock-api/` or any other loop file.
- **If a frozen test turns red** because of your change (for example a source-scanning count in `label-status-colour-ui`, `drag-feedback-colour-ui` or `mode-toggle-colour-ui`), change your implementation so that it stays green. If that is impossible without dropping a requirement, **stop and report** the exact failing assertion. Do not edit the frozen test.
- **Read first** (rule `read-primitives.md`):
  - primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AUDIO_ARCHITECTURE.md` (the faders drive the audio graph), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - prompt: `prompts/studio-feature.md`;
  - template: `docs/implementation/TEMPLATE.md`.
- Write `a-round-191/end-sha256.txt` (6 grants + 3 new files) and `a-round-191/diff-vs-start.patch` (grants against `b-round-190/r191-granted-start/`, new files in full). No commit and no push.

## 3. A — tests and checks (speed rules)
**Run:**
- `npx vitest run app/lib/arrangement/__tests__/fader-style-ui.test.tsx app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx`: all green.
- The **neighbour suites** that cover the changed inputs, all green (all under `app/lib/arrangement/__tests__/`): `fader-click`, `fader-touch`, `fader-guards`, `clip-gain-fader`, `clip-gain-multi`, `clip-gain-waveform`, `track-volume-db`, `group-volume-db`, `waveform-zoom`, `track-layout`, `track-group-mix-ui`, `track-group-collapse-ui`, `drag-feedback-colour-ui`, `label-status-colour-ui`, `mixer-onstate-colour-ui`, `mode-toggle-colour-ui`, `studio-theme-obsidian`, `panel-radius-ui`.
- **Red proof:** run T1 against the start copies, either as a temporary copy over the grants (then restore and check `end-sha256.txt`) or through a scratch Vite alias. FS1, FS2, FS3, FS4 and FS6 must be red there; FS5 may be green.
- `npm run typecheck`. `npm run lint`, reporting the count against round 190's 214 warnings + 1 info. `npx biome check` on every changed and new file: 0 errors.
- Do not run the full suite: that is the gate's job.

**Live proof** (Playwright Chromium on :5173, DPR 2, `--disable-lcd-text`), saved under `a-round-191/`:
- K0's before evidence and the cause table.
- After the fix, for **each of the six controls at 1440×900 and 1280×720**:
  - crops at rest, pointer-down (held 200 ms), mid-drag, after release, and keyboard focus (Tab to it, then ArrowLeft);
  - in each state: the computed `outline` and `box-shadow`, the thumb bbox (rest vs pressed), and the fill's right edge against the thumb centre.
- Clip Gain needs a selected audio clip. Group Volume needs a group: create one with the existing UI and record the steps.
- **Real audio:** with playback running, drag the Master fader down by ≥ 12 dB and back. The output analyser peak must drop and then recover. Use the existing approach of the earlier T12 rounds and name the tool you used.

**Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on the shared :5173 server, a fresh anonymous context, at **1440×900 and 1280×720**. Pixel reads at DPR 2 with `--disable-lcd-text`.
- Start the mock only for G191-3 / STORE-AFTER-191 (log `c-round-191/mock.log`), and stop it at the end if you started it.
- **Brass** = token `brand`, `#c9a46a`. A pixel counts as brass when every channel is within 24 of it.
- **Parent background** = the colour sampled 8 px outside the control on the same row.

| Row | What | Pass |
|---|---|---|
| **PRESS-191** (SABA-B-3 core) | Six controls (track Volume, Pan, group Volume, Master, Clip Gain, Zoom) × 2 viewports × 5 states: rest, pointer-down held 200 ms, mid-drag, after release (focus kept), keyboard focus (Tab in, ArrowLeft). Crop = control box + 8 px. | **No filled box in any state.** <ul><li>Brass pixels outside the level fill form only one ring, ≤ 2 css px (≤ 4 device px) thick.</li><li>Between the control box and the ring is a gap of ≥ 1 css px whose pixels equal the parent background (each channel within 8).</li><li>Exactly one ring, with no second concentric band.</li><li>**The ring does not cross the thumb:** the thumb bbox lies inside the ring's inner edge, and the gap criterion holds along the ring's whole perimeter, including at the thumb's x-position.</li><li>The ring is present when `:focus-visible` matches (record `matches(':focus-visible')`) and absent at rest.</li><li>Pressed vs rest at the same value: thumb bbox within 1 px, thumb colour within 8 per channel.</li></ul> |
| **LOOK-191** (R68) | The four level faders at rest, at 2 values each (the default, and a lower value set by keyboard), 2 viewports. | <ul><li>Unfilled track: one theme-token colour, visible against the parent background. Report the contrast; FAIL only if the per-channel difference is < 10.</li><li>Fill: brass, from the left end of the track to the thumb centre ± 2 px. Fill vs unfilled track ≥ 3:1.</li><li>Thumb: ivory, the same diameter as the round-190 rest baseline thumb ± 1 px. Thumb vs the adjacent track ≥ 3:1.</li><li>Ring vs parent background ≥ 3:1 (WCAG 1.4.11).</li><li>Disabled Clip Gain (no clip selected): dimmed, with the fill at its value.</li></ul> |
| **PANZOOM-191** (R70) | Pan and Zoom at rest and pressed, 2 viewports. | Rest: **0 changed px** inside their boxes vs the round-190 rest baseline. Pressed or focused: the only addition is the single ring of R69. |
| **BEHAVIOUR-191** | On each of the six controls: drag, Shift+drag (fine), double-click reset, keyboard arrows. Then Undo/Redo after one track Volume drag. | <ul><li>Values and readouts change as at HEAD (spot-check against the behaviour of `338564e`).</li><li>One drag = one Undo step.</li><li>Double-click resets to the default.</li><li>Shift+drag moves less than a plain drag over the same distance.</li><li>The Mute/Solo buttons next to the faders are visually and functionally unchanged.</li></ul> |
| **AUDIO-191** (real audio) | With playback on: drag Master down ≥ 12 dB and back; drag one track Volume to −∞ and back. | Master: the output analyser peak drops and recovers. Track: it contributes no output at −∞ and returns afterwards. Same direction and magnitude as at HEAD. |
| **LAYOUT-191** | Lane rows, group header, Master bar, detail panel and transport, 2 viewports. "Fader rect" = the input box ∪ the thumb bbox. | Each input's **width and x-position** are unchanged ± 1 px vs the round-190 baseline. The M/S buttons, the readouts, the fader rect's vertical centre, and each row and panel height are unchanged ± 1 px. The input's own height may grow (K1). |
| **STUDIO-RV-191** | `/studio-lab` rest screenshot at 1440 and 1280 vs `c-round-190/shots/c190-{1440,1280}-1/rest-full.png`, with the four level faders masked: fader rect (input box ∪ thumb bbox) + 4 px. | **0 changed px outside the mask.** Pan and Zoom are not masked, so they must be 0 px at rest. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **STORE-AFTER-191** | `/`, `/store`, `/products/middle-east` at 1440, 1280 and 375 vs `c-round-190/shots/store-after/`, same method as round 190. | 0 changed px outside the masked hero. |
| **G191-3** | As G190-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403 (mock-backed). |
| **SCOPE-191** | The frozen list (1013) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`. | Frozen list OK at both ends. `git status` is exactly the 6 granted ` M` + 3 `??`. No change under `app/styles/`. |
| **T-RUN-191** | Run T1 + T2 on the tree and on the start copies (scratch alias). Mutants on the end copy: <ul><li>m1: put back `focus-visible:ring-2 focus-visible:ring-brand` on one level fader;</li><li>m2: remove the fill on one level fader;</li><li>m3: invert the fill (`max − value`);</li><li>m4: a brass thumb token on one fader;</li><li>m5: the level recipe added to Pan.</li></ul> | T1/T2 green on the tree. FS1–FS4 and FS6 red on the start copies. m1 → FS1 red; m2 → FS2 red; m3 → FS2/FS3 red; m4 → DXA1 red; m5 → FS5 red. |
| **AN-REVIEW-191** | Read the diff, the new module, T1/T2 and D1. | <ul><li>Tokens only: no hardcoded colour, no inline colour, no new CSS rule.</li><li>No `as`, `any` or `@ts-ignore`.</li><li>Handlers, refs and ARIA unchanged.</li><li>DXA1 changed only as T2 allows.</li><li>D1 is in Georgian, with status `In Progress (awaiting C round 191)`. It records R68–R71 with their rejected alternatives, and a SABA-B-3 problem → solution entry whose cause is either **confirmed** by K0's toggles or plainly labelled a hypothesis.</li></ul> |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- A thin ring after a **mouse** press is expected: R69, because Chromium matches `:focus-visible` there. It is not a FAIL.
- Each of these is a **SABA-B-3 FAIL (Medium)**: a filled band, a double ring, a brass thumb, a thumb that grows when pressed, or a track that changes colour when pressed.
- The intended rest-look change of the four level faders (R68) is not a regression. A change outside their masked boxes is.
- Any change in fader values, commit/Undo, Shift-fine, touch or audio is a **regression FAIL (Medium)**.
- Fader hover is not changed by this task. A hover difference vs HEAD is info, unless it brings back a box.
- Safari and Firefox rendering cannot be checked here. They go on the Tech Lead manual list (`TECH-LEAD-MANUAL`) and are not a FAIL.
- New Lows go to `deferred_low_polish`.
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- `appearance-none` or a taller input changes the input's box, so the drag maths, the hit area or the row height shift → LAYOUT-191, BEHAVIOUR-191 and the neighbour suites.
- The fill lags a drag preview → FS4, PRESS-191 mid-drag.
- The Mute/Solo on-states next to the fader change → BEHAVIOUR-191 and the `mixer-onstate-colour-ui` suite.
- The rest of the Studio shifts → STUDIO-RV-191.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A fader's look while pressed or focused | **None used.** B did not consult a Live 12 manual section for this row. This is a visual-state bug in CZABA's own Obsidian design, and Saba gave the target explicitly. | Nothing. | Saba's 2026-10-26 visual target (R68–R70); CZABA's own design, not an Ableton imitation. | Parity: **არ ეხება** (not applicable). Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-191.md` and `a-round-191/`: K0 reproduction and cause table, before/after crops, computed styles, audio proof, review.
- **C:** `c-round-191.md`, `c-round-191.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-191/`. The after screenshots become the next baseline: `c-round-191/shots/c191-{1440,1280}-1/rest-full.png` and the fader crops.
- **Both:** write report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 192 |
|---|---|
| **C PASS** (`browserVerified=true`) | Root publishes round 191, and SABA-B-3 → **მზადაა**. If round 192 is planned on or after **2026-10-27**, it is the **REGRESSION round** (`REGRESSION-ROUND-2026-10-27`). Its scope additions are in `backlog.json`; they now also include SABA-B-3 PRESS/LOOK on one fader of each kind, and the STORE-1d overlay parent/height + fresh-CLS check. Otherwise round 192 is the first STORE-2 sub-stage, and the regression comes at the first planning on or after 2026-10-27. |
| **C FAIL on a SABA-B-3 row** | A bounded fix-up in round 192 (Medium; it goes before the regression round). |
| **C FAIL only on a regression row** (behaviour, audio or layout) | The same: a fix-up first, because the regression would be a Medium this round caused. |
| A browser row that can run here did not run | `browserVerified=false`. SABA-B-3 is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 6 grants and the 3 new files, against `338564e`.
- **Signals recorded, not scheduled:**
  - `GLOBAL-FOCUS-VISIBLE-UNLAYERED`: the unlayered `:focus-visible` outline in `app.css` defeats `focus-visible:outline-none`, which probably doubles the ring on 53 component sites. It is a candidate systemic task for the next RETRO, related to C-R169-N1 (double focus ring, deferred Low).
  - `ARCH-R190-PAGETRANSITION-FIXED` (the A-190 reviewer's Architecture note): `PageTransition`'s `y` transform is the containing block for every `fixed` overlay inside routes. Two of the files it names are protected.
- **Routed from C round 190:**
  - I1 (no unit guard for the portal) → a `parentElement === document.body` case in the next round that owns `SpotlightLoader.tsx` (STORE-5), plus an overlay parent/height + fresh-CLS check in the regression store smoke.
  - I2 → a regression harness rule: scroll only after `performance.now() > 250`.
  - I4 (ArrowDown scrolls the page under the loader) → `deferred_low_polish`.
  - I3 and I5: info.
- **Queue additions made at this planning:**
  - `STUDIO-PERFORMANCE`, after REVIEW-RECOMMENDATIONS and before T12-ADVANCED. Outline: `docs/technical/performance/perf-plan.md`. PERF-1 (the harness) comes first, and B consults `performance-optimizer` and `tech-lead` before each PERF task.
  - The RETRO policy. The first RETRO comes after STORE-REDESIGN or at round 200, whichever is first.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered, so fallback (c) continues. Next checkpoint point: the STORE-REDESIGN exit.
- **Root request (C-R188-I3)** is still open: the mock has no `digital-gift-card` product. Nothing is blocked.
