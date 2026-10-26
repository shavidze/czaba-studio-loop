# CURRENT TASK — Round 190: STORE-1d fix-up — C-R189-01 (Medium: the entrance loader's own divs add a layout shift, fresh-mode home CLS 0.27–0.62) + C-R189-02 (Low, same code: Tab while the loader is up moves focus under the opaque overlay)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z155** (`backlog.json` → STORE-REDESIGN `store1d_fixup_d29z155`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Previous task:** `tasks/round-189.md` is an exact copy of the round-189 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-189.md`.
- **Spec (DATA):** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, STORE-1 item **D10**. All round-189 rulings R61–R66 stay in force, except the Tab clause of R63, which R67 below replaces.

## Baseline = HEAD `850445c` + the round-189 working tree (gate 189 skipped)
- **Gate:** `gates/gate-round-189.json` is `skipped` ("C taskStatus FAIL"). Nothing was published. HEAD stays `850445c`. The round-189 edits (2 ` M`: `SpotlightLoader.tsx`, doc 155; 2 `??`: T1, doc 156) are uncommitted and **must be kept as they are**. Do not revert to `850445c`, re-apply or re-format them.
- **Start state:** the 4 round-189 files equal `a-round-189/end-sha256.txt` (B checked 4/4). 1017 tracked + 2 untracked = 1019 paths.
- **Frozen list:** `b-round-189-r190-tree-sha256.txt`, **1016 entries** (1019 minus the 3 grants). It includes doc 155 at its round-189 hash `cdf011f9…`; doc 155 is **not** a grant this round. B checked it from the store root: OK.
- **Grants:** `b-round-189-r190-grants.txt`, 3 existing files:
  - `app/components/loading/SpotlightLoader.tsx` (K1, K2);
  - `app/lib/__tests__/store-entrance-loader.test.tsx` (T1, only as in §3);
  - `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md` (D1).
- **Start hashes:** `b-round-189-r190-granted-start-sha256.txt` (`579d1fba…`, `f1b741ea…`, `4323f083…`). **Start copies:** `b-round-189/r190-granted-start/`. **New files:** none (`b-round-189-r190-new-files.txt` is empty).
- **A's first step:** check these three things. If anything differs, stop and report.
  1. HEAD is `850445c`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-189-r190-tree-sha256.txt`, run **from the store root**, is OK.
  3. The three start hashes match.
- **Mock API:** `tmp/studio-real-loop/mock-api/server.mjs` on 127.0.0.1:5199. **A and C:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round
- **C round 189: FAIL, one Medium + one Low** (`c-round-189.json`; `browserVerified=true`, `realVerified=true`). 15 rows passed in the browser (DUR, HIT, SKIP, SESSION, RM, H1, E2E, KEEP, G189-3, STUDIO-RV, SCOPE, T-RUN, AN-REVIEW, PX-NET, REG-HYD). Only STORE-AFTER-189 failed, on fresh-mode CLS.
- **C-R189-01 (Medium), evidence, not a diagnosis.** On the first `/` visit in a session, one layout shift per load comes from inside `[data-testid=entrance-loader]`, about **470–495 ms after insertion**. Its sources are the `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` divs (the 500×500 main glow, the 400×200 secondary glow, the logo wrapper), reported with `previousRect` y/height `0/0` → `currentRect` height 500 / 200 / 125. Fresh-mode CLS medians: **0.0815 (1440), 0.2727 (1280), 0.6158 (375)**; acceptance is < 0.1. Seen mode (session key preset) is 0.0198 / 0.0014 / 0, the same as round 188. The overlay is opaque, so nothing visibly moves; field CLS still counts it as "poor". C's cause (the end of framer's opacity/scale/`y` animations) is a **hypothesis**. The 470–495 ms point is close to `HOLD_AT_MS` (450) and to the end of the reveal animations (250 + 250 ms), so either could be it. Whether the old 5.6 s loader had the same shift is unknown. Evidence: `c-round-189/out/cls-{1440,1280,375}.json`, `c-round-189/tools/cls.cjs`.
- **C-R189-02 (Low), fixed now because this round owns the code and the fix is one handler line** (2026-10-23 bug gate: "a Low may still be fixed earlier only when the current round already owns that code and it costs little"). Tab while the loader is up leaves the overlay in place (correct under R63), but focus moves to a card link under the black overlay. At 375 that also scrolls the card carousel, so after removal the Play the user aimed at has moved. Nothing activates. Evidence: `c-round-189/out/skip-{1440,375}.json` case c.
- **Lesson from round 189 (goes into A's checks):** the failing row measured fresh-mode CLS at 375 and 1280, but A's live proof only probed 1440 and never measured CLS. **This round A measures what C will measure:** fresh-mode CLS at all three viewports, before and after the change.
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is 2026-10-26 (2 days). The first planning on or after 2026-10-27 makes the next round the REGRESSION round, whatever this round's result (see §7).
- **No Critical or High finding is open.** No other Medium is open in cloud-reproducible form.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| **K1** (C-R189-01) | `SpotlightLoader.tsx` | Remove the layout shift that the overlay's own children cause, **without changing what the loader looks like** (R66: same black stage, cone, both glows, floor reflection, logo, rule line, tagline, dust, vignette and grain; no element removed; no new hardcoded colour, inline colour or custom CSS). **Work in this order and record each step in `a-round-190.md`:** <ol><li>**Reproduce** on the start tree with C's method (`c-round-189/tools/cls.cjs`; copy `cls.cjs`, `lib.cjs` and `ld.cjs` together into `a-round-190/tools/` if you need to change paths): fresh context, `layout-shift` PerformanceObserver installed with `addInitScript`, no session key, 3 loads at 375 and at 1280. Expect ≈ 0.62 and ≈ 0.27. If you cannot reproduce it, stop and report with your numbers; do not "fix" blind.</li><li>**Bisect:** with temporary edits, freeze the animation of one candidate element at a time (main glow, secondary glow, logo wrapper, rule line, tagline) and re-measure at 375 (one load each is enough). Name the element(s) and the property (for example a transform animation finishing, a width animation, a layout-affecting value) that produce the shift. Separate the confirmed cause from any remaining hypothesis.</li><li>**Fix** the confirmed cause in the smallest way that keeps the visuals: for example a stable box with only compositor-only properties animating, or centring that does not depend on a transform the animation replaces. A chooses; the result is judged by the measurements, not by the technique.</li><li>**Optional, info only:** run the same probe once at 375 against the 850445c loader (`b-round-188/r189-granted-start/SpotlightLoader.tsx`, temporarily over the grant; afterwards put your own working copy back and confirm it with `sha256sum` against the hash you recorded just before the swap) to say whether the shift pre-existed. It does not change whether the fix is needed.</li></ol>Every round-189 property still holds: total `T` ≤ 1200 ms from mount to unmount (R62), the logo wrapper reaches opacity ≥ 0.9 for at least 200 ms, `pointer-events-none` from the exit start, click/Escape skip, `sessionStorage` once per session, nothing under reduced motion, `aria-hidden` and no heading. |
| **K2** (C-R189-02, ruling **R67**) | `SpotlightLoader.tsx` | In the existing document `keydown` handler, `key === 'Tab'` (with or without Shift) also ends the loader **immediately**, exactly like Escape: no exit fade, timers cleared, listeners removed, `null` from then on. **Do not call `preventDefault`**: the browser's normal focus move happens, and the overlay is already gone, so the focused element is visible. No other key skips. |
| **T1** | `store-entrance-loader.test.tsx` | Replace the L6 case "Tab does not skip" with **"Tab ends it like Escape"**: at 300 ms, `fireEvent.keyDown(document, { key: 'Tab' })` removes the overlay, the returned `fireEvent` value is `true` (the event was **not** default-prevented), and the keydown listener is removed. Add the same check for `{ key: 'Tab', shiftKey: true }`. Add **"other keys do not skip"**: at 300 ms, `{ key: 'a' }`, `{ key: 'ArrowDown' }` and `{ key: 'Shift' }` leave the overlay in place. Every other case (L1–L11, L10b) stays and stays green. If the K1 fix changes something a case relies on (for example the phase constants), adjust only that case and say why. **No CLS case in T1**: jsdom cannot observe layout shift; the CLS acceptance is browser-only. |
| **D1** | doc 156 | Status → `In Progress (awaiting C round 190)`. Add **R67** to the rulings (vetoable; it replaces the Tab clause of R63, with the rejected alternatives below). Add a problem → solution entry for C-R189-01 with the confirmed cause, the bisect numbers and the before/after CLS, and one for C-R189-02. Update testing. Keep everything else. |

**Unchanged on purpose:** doc 155, `_index.tsx`, `root.tsx`, both loader barrels, the other loaders, `HeroSection.tsx`, `ProductCard.tsx`, `AudioPreviewButton.tsx` and every e2e file are byte-identical (frozen list).

### Ruling (vetoable by Saba; record it in D1)
- **R67: Tab (and Shift+Tab) end the loader, like Escape, without `preventDefault`.** It replaces R63's "Tab does not skip". R63 rejected "any key skips" on the premise that Tab has no side effects; C showed that Tab already moves focus and can scroll the hidden page. Ending the loader on Tab makes the focus move visible at once. Escape and a click on the overlay still skip; other keys still do not.
  - Rejected: make the page `inert` while the overlay is up. It needs either the frozen `_index.tsx`/`root.tsx` or the loader reaching into sibling DOM, which is not small, and it would delay keyboard users by up to 1.2 s.
  - Rejected: `preventDefault` on Tab while the overlay is up (a 1.2 s keyboard trap).
  - Rejected: keep the Low deferred. The fix is one line in code this round already owns.

## 2. A — files you own (everything else is frozen)
- **Grants:** `SpotlightLoader.tsx` (K1, K2), T1 (§1 T1 only), doc 156 (D1). Plus your own `a-round-190.md` and `a-round-190/`.
- **Protected, byte-identical:** every other path in the frozen list, including doc 155, all store and Studio files listed as protected in round 189 §2, the purchase/auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts`, `firebase.client.ts`), `public/`, `.claude/**`, `package.json` and the configs. Do not touch `mock-api/` or any other loop file.
- **Read first** (rule `read-primitives.md`): `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; template `docs/implementation/TEMPLATE.md`.
- Temporary bisect edits to `SpotlightLoader.tsx` are fine; the end state is what counts. Make lasting edits with Edit/Write. Helper scripts go under `a-round-190/tools/`. Write `a-round-190/end-sha256.txt` (the 3 grants) and `a-round-190/diff-vs-start.patch` (against `b-round-189/r190-granted-start/`). No commit and no push.

## 3. A — tests and checks (speed rules)
**Run:**
- `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx` — all green.
- **Red proof for K2:** run the new Tab cases against the start copy `b-round-189/r190-granted-start/SpotlightLoader.tsx` (temporary copy over the grant, then restore and check `end-sha256.txt`, or a scratch Vite alias). The two Tab cases must be red there; "other keys do not skip" and every other case stay green.
- `npm run typecheck`; `npm run lint` (report the count against round 189's 214 warnings + 1 info); `npx biome check` on `SpotlightLoader.tsx` and T1 (0 errors; the pre-existing `noArrayIndexKey` on the dust map is expected).
- Do not run the full suite: that is the gate's job.

**Live proof** (Playwright Chromium, mock on :5199, store on :5173), saved under `a-round-190/`:
- **CLS before and after** (the round-189 lesson): fresh context, no session key, 3 loads at **375×812, 1280×720 and 1440×900**, plus 3 seen-mode loads (key preset with `addInitScript`; a new page is a new session, C-R189-I5) at 1280. Report each value, the median, and the shift sources. After the fix: fresh median < 0.1 at all three viewports, and no overlay-sourced shift with `value ≥ 0.005` (zero-value entries from the rule-line width draw are expected).
- **Bisect table** (K1 step 2).
- **Timing:** insertion → removal at 1440 (3 loads, ≤ 1200 ms + jitter), logo opacity ≥ 0.9 for ≥ 200 ms measured **before paint** (ResizeObserver sampler, round-189 `tools/flicker-prepaint.mjs`), and a mid-loader screenshot at 375 and 1440 showing the logo, the rule line and the tagline.
- **Tab:** at 375, press Tab about 300 ms after insertion: the overlay is gone within 50 ms and `document.activeElement` is a visible focusable element.

**Code review:** use the `code-reviewer` subagent (3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
Setup: real Playwright Chromium on the shared :5173 server, a fresh anonymous context per session unless the row says otherwise, at **1440×900, 1280×720 and 375×812**. Pixel reads at DPR 2 with `--disable-lcd-text`. Start the mock if :5199 is not listening (log `c-round-190/mock.log`) and stop it at the end if you started it. Reuse `c-round-189/tools/` (`ld.cjs`, `cls.cjs`, `dur.cjs`, `skip.cjs`, `session.cjs`, `flicker.cjs`, `c189-rv.cjs`, `diff189.cjs`); copy them into `c-round-190/tools/` and change only paths and row names. **Seen-mode harnesses preset `czaba_entrance_seen` with an init script** (C-R189-I5).

| Row | What | Pass |
|---|---|---|
| **CLS-FRESH-190** (K1, C-R189-01) | `cls.cjs` method: fresh mode 3 loads × 3 viewports, seen mode 3 loads × 3 viewports. Record every shift with its sources. | Fresh-mode home CLS **median < 0.1 at 1440, 1280 and 375**, and **no load at any viewport has a shift with `value ≥ 0.005` whose source is inside `[data-testid=entrance-loader]`**. Seen mode stays at round-189 levels (0.0198 / 0.0014 / 0, each < 0.1). LCP ≤ 2.5 s median in both modes, and the LCP element is never inside the overlay. |
| **DUR-190** (K1 regression) | Fresh context on `/`, 3 loads × 3 viewports, as DUR-189. | Overlay on every load; insertion → removal median ≤ 1250 ms and every load ≤ 1300 ms (raw values reported). Logo opacity ≥ 0.9 for ≥ 200 ms in a **pre-paint** sampler (ResizeObserver, as round 189 `flicker-*.json`). Mid-loader screenshot at each viewport shows "CZABA", the rule line and the tagline. |
| **VIS-190** (R66) | Mid-loader screenshots at the same moment after insertion (≈ 550 ms and ≈ 800 ms) at 1440 and 375, compared side by side with `c-round-189/shots/loader/mid-*.png`. | Same elements present (cone, glows, logo, rule line, tagline, dust, vignette). A pixel diff is reported as info: the dust is random and the timing may shift by a frame, so no 0-px requirement; a missing or relocated element (logo centre moved > 2 px, a glow gone) is a FAIL. |
| **HIT-190** (K2 of round 189, C-R187-I1) | As HIT-189, 3 viewports, same Middle East card. | First `elementFromPoint` hit on the card Play ≤ 1250 ms after insertion; a real click after the loader starts the real preview (`currentTime` advances ≥ 0.5 s, label "Pause preview"). |
| **SKIP-190** (K2, R67) | Fresh context per case, 1440 and 375, input ≈ 300 ms after insertion: (a) click at the viewport centre; (b) Escape; (c) **Tab**; (d) **Shift+Tab**; (e) `ArrowDown`. | (a), (b): as round 189 (removed ≤ 50 ms, click never reaches the page, no audio, URL unchanged). (c), (d): the overlay is removed ≤ 50 ms after the key; `document.activeElement` is not `body`, is visible (non-zero rect, inside the viewport after the browser's scroll) and is outside the (removed) overlay; no audio, URL unchanged. (e): the overlay is **not** removed and ends by itself within the DUR bound. |
| **H1-190** | As H1-189, 3 viewports (rAF sampler from document start until 1 s after removal). | Max `h1` count = 1 at every sample; overlay `aria-hidden="true"` with no heading. |
| **RM-190** | As RM-189 at 1440 and 375. | 0 insertions in 3.5 s under `reduce`; key absent; after `no-preference` + reload the overlay shows once. |
| **SESSION-190** | As SESSION-189 (a) and (e) only, at 1440. | (a) Reload in the same page: 0 insertions in 3 s. (e) A new context shows the overlay again. |
| **STORE-AFTER-190** | `/`, `/store`, `/products/middle-east` at 3 viewports after the loader is gone, vs **`c-round-189/shots/store-after/`** (non-scrolled, popup dismissed, mouse parked at (1,1), hero masked on `/`). | 0 changed px outside the masked hero on all 9 shots. |
| **G190-3** | As G189-3 (anonymous `/studio-lab`; `/studio/middle-east`; studio-token without a header and with a fake Bearer). | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge, no entrance overlay. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. No header → 401; fake Bearer → 403 "Unable to verify ownership", `mock.log` shows `/api/downloads auth=yes 401`. Mock-backed, not real-backend evidence. |
| **STUDIO-RV-190** | `/studio-lab` rest screenshot at 1440 and 1280 vs `c-round-189/shots/c189-{1440,1280}-1/rest-full.png`. | 0 changed px; 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **SCOPE-190** | The frozen list (1016) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`; the diffs vs `b-round-189/r190-granted-start/`. | Frozen list OK at both ends. `git status` is still exactly 2 ` M` (`SpotlightLoader.tsx`, doc 155) and 2 `??` (T1, doc 156). Doc 155 unchanged since round 189 (`cdf011f9…`). `SpotlightLoader` still exported under the same name with no props; no new export besides the existing constant. |
| **T-RUN-190** | Run T1 on the tree. Run it against the start copy (scratch Vite alias, `c-round-189/tools/vitest.scratch.config.mjs`). Mutants on the end copy: (m1) remove the Tab branch; (m2) add `event.preventDefault()` for Tab; (m3) make every key skip; (m4) remove the Escape branch. | T1 green on the tree. On the start copy only the two new Tab cases are red. m1 → Tab cases red; m2 → the "not default-prevented" assertion red; m3 → "other keys do not skip" red; m4 → the Escape case red. |
| **AN-REVIEW-190** | Read the diff, T1 and D1. | No new hardcoded colour, inline colour or custom CSS compared with the start copy; no `as`, `any` or `@ts-ignore`; every listener and timer has a cleanup; no `preventDefault` on Tab; D1 is in Georgian, status `In Progress (awaiting C round 190)`, records R67 with its rejected alternatives and a C-R189-01 problem → solution entry with a **confirmed** cause backed by A's bisect numbers (or says plainly which part is still a hypothesis). |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages on store pages; 0 non-font remote requests; 0 Authorization headers from the page. The mock `digital-gift-card` 404 (C-R188-I3) is expected. |

**Outcomes written in advance:**
- Insertion after hydration (≈ 0.6 s, R61) is **info**, as in round 189.
- A single load in 1250–1300 ms with the median in bound is info (timer jitter).
- A fresh-mode median ≥ 0.1 at any viewport, or an overlay-sourced shift with `value ≥ 0.005`, is a K1 FAIL (Medium).
- Zero-value (`v: 0`) layout-shift entries whose source is the rule line `DIV.h-[1px] mx-auto mt-4 mb-4` (its width draws 0 → 100 %, y and height unchanged) were already present in round 189 and are expected: info, not a FAIL.
- ArrowDown, Space or PageDown scrolling the hidden page while the overlay is up is the same class as C-R189-02 but outside R67 (Tab only). Record it as info or a Low (→ `deferred_low_polish`), not a K2 FAIL.
- A shift whose source is **outside** the overlay and that also appears in seen mode is pre-existing page behaviour: report it as info with its source; it fails CLS-FRESH-190 only if it makes the median ≥ 0.1.
- If the fix removes or visibly moves a loader element, that is an R66 FAIL (Medium).
- If Tab is default-prevented or focus lands on `body` or an off-screen element, that is a K2 FAIL (Low; fix in this round's code).
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- The logo reveal gets shorter or flickers → DUR-190 (pre-paint ≥ 0.9 for ≥ 200 ms), VIS-190.
- The overlay blocks the card Play again → HIT-190.
- Escape or click skip stops working, or a key other than Tab/Escape skips → SKIP-190, T-RUN-190.
- A second h1 or a flash under reduced motion → H1-190, RM-190.
- The store pages or Studio change → STORE-AFTER-190, STUDIO-RV-190, G190-3.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store home entrance loader (layout stability, Tab skip) | **None.** Store page, not an Arrangement feature. | Nothing. | Saba approved STORE-REDESIGN, direction A and D10 (2026-10-25). Rulings R61–R67. | STUDIO-RV-190. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-190.md` and `a-round-190/` (reproduction, bisect table, before/after CLS JSON, timing, screenshots, review).
- **C:** `c-round-190.md`, `c-round-190.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-190/`. After screenshots in `c-round-190/shots/store-after/` are the next baseline.
- **Both:** write report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 191 |
|---|---|
| **C PASS** (`browserVerified=true`) | Root publishes rounds 189 + 190 together (`SpotlightLoader.tsx`, doc 155, T1, doc 156). STORE-1d → **მზადაა**, which completes STORE-1. Round 191 = the **REGRESSION round** if planning is on or after 2026-10-27 (it will be): `backlog.json` `regression_rounds` → `REGRESSION-ROUND-2026-10-27`, with the store smoke against the mock now including STORE-1d DUR/SESSION/RM/H1/CLS-fresh and the C-R189-I5 harness rule. Then the first STORE-2 sub-stage. |
| **C FAIL on CLS-FRESH-190 only**, with A's bisect showing the cause is outside the overlay's control (for example a Chrome attribution rule that no visual-preserving change avoids) | B brings the trade-off to Saba (keep the visuals vs a simpler fade) as an `awaiting_user` question, keeps STORE-1d **ბაგია**, and the next round is still the REGRESSION round. |
| **C FAIL on any other row** | A bounded fix-up comes after the regression round, unless it is Critical/High. |
| A browser row that can run here did not run | `browserVerified=false`; STORE-1d is not done; B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 3 grants as they end this round, plus doc 155 at `cdf011f9…`, against `850445c`.
- **Signals recorded, not scheduled** (A-189 reviewer Lows, unchanged): the tagline is fully visible for only ≈ 150 ms before the exit (design note for Saba at STORE-2); the StrictMode double effect is untested; the `typeof window` guard is dead code. Architecture note: keep; extract the once-per-session / reduced-motion gate only if a second loader needs it.
- **Info from C round 189 (routed):** I1 one-sample rAF opacity artifact (not a flicker; pre-paint sampler is the rule); I3 insertion after hydration (R61 trade-off); I4 one 1205 ms load (jitter); I5 sessionStorage is per tab → regression harness rule; I6 one late `/images/packs/cover.jpg` in the 375 full-page shot (baseline note).
- **Root request (C-R188-I3)** still open: the mock has no `digital-gift-card` product. Nothing is blocked.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered; fallback (c) continues. Next checkpoint point: the STORE-REDESIGN exit.
