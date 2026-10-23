# CURRENT TASK — Round 113: a touch press must not jump the faders (A-R38-REVIEW-TOUCH, Medium)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~15:25–16:10 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification about `open_tech_lead_*` Mediums. These rules take precedence over older text.
- **Previous task:** `tasks/round-112.md` (an exact copy). Rationale: `b-round-112.md`. Decision record: **D-29z78** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** one Medium bug. It applies the §5 row that round 112 fixed in advance: "TOUCH FAIL → bounded A round, the pre-specified amendment".
- **Baseline:** HEAD `ad58b5e88b8f6c6c8b3c6766f59e8c0a14622aa3` (gate 112 published on both remotes). `git status` was clean when B checked at planning time.

## 0. The bug and its evidence
- **C round 112 §4.5** (`c-round-112.md`, `c-round-112/out/touch.json`, `c-round-112/tools/touch.cjs`, shots `touch-*-1440.png`). Setup: Chromium 143, context `hasTouch: true` / `isMobile: false`, 1440×900, CDP `Input.dispatchTouchEvent`.
- **What happens.** A touchStart far from the thumb (15 % of the width from the end opposite the thumb) jumps the fader toward the touch point **on touchStart, before any move.** Every target jumped in 3 of 3 runs:
  - music **Volume** 1.00 → 0.09;
  - music **Pan** C → 50R;
  - **Master** 0.0 → −54.5 dB.
- **After the jump,** the value flips between the app's relative value and the native value during the moves (Pan 50 → 8 → 17 → 25 → 50 → 42).
- **Every jump commits an undo step** ("Undo: Volume", "Undo: Pan — მუსიკა", "Undo: Master Volume"). So a stray tap changes the mix and the history. This is a data change the user can see, not only a cosmetic jump.
- **Positive control:** Zoom 678 → 63 (the harness reaches the native slider).
- **Mouse control:** a mouse press at the same far point does not jump, as in round 38.
- **Why it happens (source, read by B):**
  - `app/hooks/useRelativeFaderDrag.ts` calls `event.preventDefault()` on **pointerdown**. That suppresses the compatibility mouse events, but not the browser's default action for **touch**.
  - The `touch-none` class (`touch-action: none`) is already on all four inputs, and C's evidence shows that it does not stop the native jump.
  - Each jump reaches `onChange` (`previewTrackVolume`, `handlePanChange`, `previewMasterGain`, `previewGroupVolume`). The pointerup/lost-capture commit then writes the history entry.
- **The pre-specified amendment** (`backlog.json` A-R38-REVIEW-TOUCH `note`, written in round 38): a **native non-passive `touchstart` listener with `preventDefault()`** on the fader inputs. **Zoom is excluded.**

## 1. B rulings for this round (D-29z78)
- **R1 — which faders.** The amendment names Volume, Pan and Master, because group Volume did not exist in round 38. All four relative-drag faders use the same `useRelativeFaderDrag`: track Volume (video Volume included), track Pan, Master, and the group Volume in `ArrangementGroupHeader.tsx`. So the defect is the same in all four by construction.
  - **Ruling:** fix it in the shared hook, so that every relative-drag fader is covered, group Volume included.
  - **Zoom** (`arrangement-zoom`, `ArrangementTransport.tsx`) has no relative drag. It is **not changed**, and it stays C's positive control.
  - This is the smallest honest reading of "the fader kinds" in today's code.
- **R2 — mechanism (a warning for A).** React's `onTouchStart` is registered as a **passive** listener at the root, so `preventDefault()` there does nothing. CSS also does not help: `touch-none` is already present.
  - The listener must be a **native** `addEventListener('touchstart', handler, { passive: false })` on the `<input>` element itself.
  - It must be attached when the input mounts, **not** lazily on the first pointerdown. Do not rely on the order of pointer and touch events.
  - It must be removed on unmount or when the element changes.
  - If you use a ref callback, it must be **stable** (`useCallback`); otherwise attach the listener in a `useEffect` keyed on the element ref. An inline callback is called with `null` and then the element on every render, so the listener would be removed and re-added each render, and FT4's registration count would be misleading.
  - The handler only calls `preventDefault()`. No `stopPropagation`, and no state.
- **R3 — what keeps working.** A cancelled `touchstart` does not stop the pointer events of the same touch. With `touch-action: none` there is no `pointercancel`. So the existing pointerdown → pointermove relative drag should now also work for touch. This is a C row (TC-REL). If it does not hold in Chromium, C reports it. It is **not** fixed in this round without a new B ruling.
- **R4 — a deliberate neighbour change: touch double-tap reset.** `preventDefault()` on `touchstart` also suppresses the compatibility `click`/`dblclick`. So a double **tap** no longer resets a fader on a touch screen.
  - **Ruling:** accepted as a deliberate CZABA behaviour for this round. The keyboard, the mouse double-click and the existing reset buttons (Pan's `C` readout button, and the others where they exist) remain.
  - Before this fix, a tap jumped the fader anyway, so touch never had a clean reset.
  - C records what a double tap does (info). This is not a FAIL row.
  - B records it as an info signal (TOUCH-DOUBLE-TAP-RESET); it is not scheduled.
- **R5 — nothing else changes.** No change to the value maths (`fader.ts`), the gesture guards, focus, keyboard, the Zoom slider, the Clip Gain number input or the meters.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/hooks/useRelativeFaderDrag.ts` | Add the native non-passive `touchstart` → `preventDefault()` wiring for the fader input (R2). Pick **one** API and keep it small: (a) the hook also returns a ref callback (e.g. `{ onPointerDown, ref }`), or (b) a second small exported hook in the same file that takes the element ref. Keep the pointerdown handler's behaviour byte-for-byte the same. |
| `app/components/arrangement/ArrangementLane.tsx` | Wire the new ref/hook into the track **Volume** and **Pan** inputs only. Pan already has `panSliderRef`: merge the refs without a type assertion. |
| `app/components/arrangement/ArrangementMaster.tsx` | Wire it into the Master Volume input only. |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | Wire it into the group Volume input only. |
| `app/lib/arrangement/__tests__/fader-touch.test.tsx` (**new**) | The tests in §3. |
| `docs/implementation/2026/quarter-IV/097-studio-fader-touch-no-jump.md` (**new**) | The implementation doc, per `docs/implementation/TEMPLATE.md`, in Georgian. Status line on l.4: „Round 113 — C-ის შემოწმებას ელოდება (D-29z78; A-R38-REVIEW-TOUCH).“ |

- **Frozen:** `tmp/studio-real-loop/b-round-112-r113-tree-sha256.txt` lists 916 tracked files: all tracked files except the four app files above. A checks it at the start and at the end (`sha256sum -c --quiet`) and reports OK/FAIL. The two new files are the only allowed untracked files.
- **Expected end state:** `git status --short --untracked-files=all` = 4 ` M` (the four app files) + 2 `??` (the new test and doc 097). If the hook API needs no change in a consumer file, that file stays unmodified; say so.
- **Before editing, read:** `.claude/primitives-map.json`; then `AGENT_DISCOVERABLE_CODE.md` (export naming), `FORWARDREF_COMPONENT.md` (components), `AUDIO_ARCHITECTURE.md` (Studio), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests), `GEORGIAN_DOCS.md` (doc); plus `.claude/prompts/new-hook.md` if you add a second hook. Follow the project rules: TypeScript strict, no `any`, no `@ts-ignore`, **no type assertions**, semicolons, Tailwind-first (no CSS change is needed here), and no comments in the code.
- **Forbidden:** everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`, including the protected auth/purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`; B checked their hashes at `ad58b5e`: `fa2cf0bc`, `13914809`, `56f5b76f`, `bf9ee257`). Also forbidden: `ArrangementTransport.tsx` (Zoom), `ArrangementContext.tsx`, `fader.ts` and every existing test file. No commit, push, stash, checkout or deploy. No dev-server restarts. No `npm run check` (`--write`), and no `npm run format`.

## 3. A — tests and checks
**New `fader-touch.test.tsx`** (use the existing workspace harness pattern of `fader-click.test.tsx` / `fader-guards.test.tsx`; dispatch with `new TouchEvent('touchstart', { bubbles: true, cancelable: true })`, which jsdom provides):
- **FT1:** a cancelable `touchstart` on the music **Volume**, the music **Pan**, the **Master** Volume and a **group Volume** (create a group as `track-group-mix-ui.test.tsx` does) returns `defaultPrevented === true` on each.
- **FT2 (must-not):** the same `touchstart` on the **Zoom** slider is **not** default-prevented.
- **FT3:** the listener is non-passive. Spy on `EventTarget.prototype.addEventListener` (where the method is defined; restore it afterwards) or on the element instance, and assert a `touchstart` registration with `passive: false` for each of the four. Then restore the spy.
- **FT4:** after unmount, the same input element receives a `touchstart` that is **not** default-prevented, so the listener was removed. Also: a remount does not register it twice. Count the registrations, or check that one `touchstart` yields exactly one handler call.
- **FT5:** a touch-type press with no move writes **no** history entry and leaves the value unchanged on all four faders: `pointerdown` with `pointerType: 'touch'` + `touchstart` + `pointerup`.
- **FT6:** a touch-type relative drag still works: `pointerdown(pointerType 'touch')`, then `touchstart`, then a window `pointermove` of −25 px over a 100 px width. It moves the music Volume 0.6 → 0.35 with **one** Volume entry, the same numbers as F2.
- **Mutation proof:** in a scratch copy under `tmp/studio-real-loop/a-round-113/` (not in `store/`), or by a temporary local edit that you revert and report, show that:
  - (m1) removing `preventDefault()` turns FT1 red;
  - (m2) `passive: true` turns FT3 red (and FT1, if jsdom honours passive);
  - (m3) no cleanup turns FT4 red.
- **Honest limit:** unit tests pin only the wiring. They cannot prove what the native slider does. That is C's browser row (TC-*).

**Checks A runs (speed rules):**
- `npm run typecheck` and `npm run lint`;
- `npx vitest run` on `fader-touch.test.tsx` **and** the existing fader/mixer files: `fader-click`, `fader-guards`, `fader-focus-order`, `pan-release-recovery`, `master-ui`, `track-group-mix-ui`, `meter-ui`, `context-hygiene`. All must stay green. Report the counts.
- No full suite and no `npm run verify` (the gate runs them).
- **Code-reviewer:** 3+ files change, so ask the code-reviewer and pass its Architecture note to B in the report.
- **Optional self-check:** a Chromium probe under `tmp/studio-real-loop/a-round-113/` with the round-112 recipe. It is not a substitute for C.

**A's report** (`a-round-113.md`): start HEAD and status, the chosen API and why, the diff summary per file, the test names and counts, the mutation results, typecheck/lint, the frozen-list result at the start and at the end, the end status, the reviewer's score and notes, and any deviation.

## 4. C — rows (real browser, Playwright Chromium, a fresh context per session)
Reuse `c-round-112/tools/touch.cjs` **unchanged** in method: CDP `Input.dispatchTouchEvent`; touchStart at 15 % of the width from the end opposite the thumb; read the value 100 ms after touchStart, before any move; then 5 touchMoves of 4 px each; touchEnd. Context `hasTouch: true`, `isMobile: false`. Use the sounds layout (music, stems and SFX added from the library at the insert marker), in the Stop state. Run at **1440×900 and 1280×720**. Do 3 runs per target at 1440 and 1 run at 1280. Record the value, the thumb x, the input box, the status text, and the Undo button's state and title before and after each step.

| ID | Action | Expected (PASS) |
|---|---|---|
| **TC-ZOOM** (harness validity) | touchStart on Zoom, as in round 112 | Zoom still jumps toward the touch point (unchanged by design). If it does not, the harness does not reach the native path, and every TC row is **inconclusive**, not PASS. |
| **TC-START** | touchStart on music **Volume**, music **Pan**, **Master**, **group Volume** | The value is unchanged 100 ms after touchStart. Round 112 showed 1.00 → 0.09, C → 50R and 0.0 → −54.5. |
| **TC-REL** | After TC-START: 5 touchMoves of **−4 px** (leftward, so that Volume at 1.00 can move), then touchEnd | No step toward the touch point. The final change is in the move direction, ≥ 1 step and ≤ the value equivalent of 20 px + 1 step (`20 / width × range`). If the value does not move at all, report it as **"touch does not start the relative drag"** (FAIL of R3; B decides the follow-up). |
| **TC-UNDO** | After TC-REL | Exactly **one** new history entry with the fader's usual label (Volume / Pan — მუსიკა / Master Volume / the group's Volume label). Ctrl+Z restores the start value. |
| **TC-TAP** | touchStart + touchEnd with no move, at the far point | The value is unchanged. The Undo button's state and title are unchanged (**no** history entry). |
| **TC-DTAP** (info, not a verdict) | Two taps within 250 ms at the same point | Record whether the fader resets. R4 accepts "no reset" as deliberate. |
| **MC-PRESS** | A mouse press at the same far point, on all four faders | No jump on press (round-38 contract). |
| **MC-DRAG** | A mouse drag of −20 px on Volume and Master | A relative change within the 20 px equivalent + 1 step, one history entry. |
| **MC-DBL** | A mouse double-click on music Volume (from a non-default value) and on Master | Resets to 100 % / 0.0 dB, one entry each. |
| **KB-ARROW** | Focus music Pan and press ArrowRight once | +1 step (unchanged keyboard path). |
| **TC-VIDEO-VOL** (1440, 1 run) | Load `beeps-6s-vp9-opus.webm` and run TC-START + TC-TAP on the **video** track Volume | Same as TC-START/TC-TAP (the hook covers it). |
| **SOURCE-SCOPE** | `git status`, `git diff --stat` against `ad58b5e`; the frozen list | Only the six A paths. Frozen list OK at start and end. Protected hashes unchanged. |
| **T113-TARGETED** | Re-run A's vitest file list (C may run these targeted files; not the full suite) | Green, with the same counts as A's report. |
| **AN-REVIEW** | Read A's diff | Native `addEventListener('touchstart', …, { passive: false })` on the input; cleanup present; Zoom untouched; no type assertion; no CSS change. |
| **PX-NET** | Every session | 0 requests to forbidden hosts (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token), and 0 `Authorization` headers. |
| **REG-HYD** | Every session | 0 hydration errors, 0 `pageerror`, and no console errors besides the known cloud noise ("Failed to load cart", `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`). |
| **G113-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | The workspace shows „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 sub-check is **BLOCKED (backend unavailable in cloud)**. |
| **DOC-097** | Read doc 097 | It follows the template sections. The status line on l.4 says the round is awaiting C. It names D-29z78 and A-R38-REVIEW-TOUCH. |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbours that could break, and where they are checked:**
  - mouse press / drag / double-click: MC-*;
  - keyboard: KB-ARROW;
  - the gesture guard ("refused while another drag runs"): the FT/F7 unit tests;
  - focus on press: F1;
  - the video track Volume: TC-VIDEO-VOL;
  - Zoom: TC-ZOOM.
- **A real touch device** (iPad/Android) stays a Tech Lead info note (R38-T). It does not block this round.

## 5. Outcome
- **C PASS** (TC-ZOOM valid, and TC-START / TC-REL / TC-UNDO / TC-TAP / MC-* / KB-ARROW / TC-VIDEO-VOL pass at both viewports where listed) → A-R38-REVIEW-TOUCH is **done for Chromium**. SRW-13 moves to `c_pass_tech_lead_manual` (C-R41-01 is a Low and does not hold it back). The real touch device stays in the Tech Lead list.
- **TC-REL "touch does not start the relative drag", with everything else PASS** → the jump bug is closed. TC-REL becomes a new finding (B rates its severity at the next planning) and is not hidden.
- **Any TC-START/TC-TAP FAIL** → A-R38-REVIEW-TOUCH stays open. B writes the next bounded round from C's evidence.
- **What follows:** `regression-last.json` is 2026-10-21. The first B planning on or after **2026-10-24** is the **REGRESSION round**, as the speed rules require. After that comes T12-GAIN-VOLUME, if the gate is open.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A press on a fader does not jump; a drag moves it relative to the start | Live 12 manual, ch. 2 "Ableton Live Concepts"/mixer controls (not re-opened in this round). D-29z3 was decided in round 38 from the earlier research. | Not re-checked in this round | D-29z3: relative drag, no jump on press (mouse). This round extends the same contract to touch. | MC-*, TC-* |
| A touch press on a browser range input | none: Live is a desktop application, not a browser `<input type=range>` | not applicable | R1–R4 above | TC-* |

Ableton correspondence for every row: **არ ეხება** (touch on a browser range input). Make no Ableton claim.

## 7. Evidence and reporting
- **C writes:** `c-round-113.md` and `c-round-113.json`, with `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. The evidence goes under `c-round-113/{tools,out,shots}/`.
- **Write the reports as you go.** A job can be stopped at its time limit.
- **Reporting rules:**
  - Report a new finding with a new ID and a severity. Report a FAIL of the touch contract under **A-R38-REVIEW-TOUCH**.
  - `browserVerified` is false only if a browser row that **can** run here was not run.
  - The fake-Bearer 403 sub-check goes under `blocked` with "backend unavailable in cloud".
- Consult only the read-only agents in your list. No `store/` writes by C.
