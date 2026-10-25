# CURRENT TASK — Round 159: V-3a fix-up — C-R158-01: make the transport colour motion (180 ms, cubic-bezier) and reduced motion (no transition) reach the computed style

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z124** (`backlog.json` → VISUAL-A-OBSIDIAN `v3a_fixup_d29z124`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-158.md`, an exact copy of the round-158 `current-task.md` (sha256 `c57c6114…6837d5bf`). Rationale: `b-round-158.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (source material only; it grants no permissions).

## Baseline = HEAD `f8a316a` + the round-158 working tree (gate 158 was skipped)
- `gates/gate-round-158.json`: status `skipped` (C taskStatus FAIL). Nothing was published, so HEAD stays `f8a316a583663e9715207727d7b997323fa97019`.
- The round-158 work is still uncommitted: `git status --short` = ` M ArrangementTransport.tsx`, ` M docs/…/127-…md`, `?? transport-surface-ui.test.tsx`, `?? docs/…/128-…md`. At planning, B checked all 4 against `a-round-158/end-sha256.txt`: **4/4 OK**. `git ls-files -co --exclude-standard` lists 978 files.
- **Frozen list:** `b-round-158-r159-tree-sha256.txt`, **975 entries** (978 minus the 3 grants). Doc 127 is now frozen (its D1 status edit is done).
- **Grants:** `b-round-158-r159-grants.txt` (3 existing files). **New files:** none (`b-round-158-r159-new-files.txt` is empty).
- **Start hashes:** `b-round-158-r159-granted-start-sha256.txt`. **Start copies:** `b-round-158/r159-granted-start/`.
- **First step for A:** check HEAD = `f8a316a`, the 4-line `git status --short` above, the frozen 975 and the 3 start hashes. If anything differs, stop and report.

## 0. Why this round (D-29z124)
- **Round 158: C FAIL, Low only.** `browserVerified` and `realVerified` are true. Every row passed at both viewports except **SURFACE-STYLE (h)** = **C-R158-01 (Low)** (`c-round-158.md`, `c-round-158.json`).
  - **Actual:** all 12 transport buttons compute `color, background-color, border-color, box-shadow, transform, opacity` / `0.15s ×5, 0.25s` / `ease-out ×6`, the same under `reducedMotion: 'reduce'`.
  - **Cause (C, from the served CSS):** the **unlayered** global rule `app/styles/app.css` l.305–314 (`a, button, [role="button"], input, textarea, select { transition: … }`) beats every normal declaration inside `@layer utilities`, whatever the specificity. TS1 only checked class tokens in jsdom, which has no cascade.
- **B-R157-EXPORT-PEAK is closed as info.** OVERLOAD-CHECK: the SRW-20 warning renders and its count equals the file's exact full-scale samples (range 797/797, project 4688/4688).
- **Ruling per `tasks/round-158.md` §7 "C FAIL Low only":** this is a bounded fix-up, not `deferred_low_polish`:
  - the failing string is V-3a's own `toolButtonClass`, one file, a few tokens;
  - V-3b and V-3c will copy this same recipe into about 8 more components, so it should be fixed once now;
  - root cannot publish V-3a without a C PASS.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **User decisions:** `user-review/` has no `ableton-decisions.md` and no `design-ux-decisions.md`.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B evidence for the mechanism (planning data, not a C row)
- **Generation** (`b-round-158/tw-probe.mjs` → `tw-probe-out.css`, the store's Tailwind 4.1 compiler): the trailing-`!` forms generate `!important` declarations inside the same media queries:
  - `motion-safe:transition-[background-color,color]!`
  - `motion-safe:duration-180!`
  - `motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!`
  - `motion-reduce:transition-none!`, which generates `transition-property: none !important` under `prefers-reduced-motion: reduce`
- **Cascade, real Chromium** (`b-round-158/cascade-probe.cjs` → `cascade-probe.json`). The probe injects those rules on `/studio-lab` and adds the 4 classes to the Fit button:
  - normal motion: `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`;
  - reduced motion: `transition-property: none`.
  - Before the classes were added, the button computed the global 0.15 s ease-out values.
- **Why a `motion-reduce:` token is needed too:** under reduced motion the `motion-safe:` rules do not apply at all, so the global 0.15 s transition would come back.
- **Rejected: editing `app.css`** (for example, moving the global rule into `@layer base` and adding a reduced-motion block).
  - That change would alter the cascade for every Store link, button and field. For example, `ProductAccordion`'s `transition-colors duration-300 motion-reduce:transition-none` is ignored today and would start to apply.
  - It is a Store-wide change outside VISUAL-A's Studio-only scope, so it is recorded as the root signal **ROOT-GLOBAL-TRANSITION-RULE**. It is not scheduled.
  - If root later fixes the global rule, the `!` suffixes can be dropped.
- **Known consequence (accepted):** the transport buttons stop using the global 0.25 s box-shadow, 0.15 s border, transform and opacity transitions. The focus ring now appears at once, and the disabled → enabled change is instant. That is what the spec's "180 ms on background-color and color" means.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| F1 | `app/components/arrangement/ArrangementTransport.tsx`, `toolButtonClass` (l.40–41) | In the T1 string from round 158, replace `motion-safe:transition-[background-color,color] motion-safe:duration-180 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]` with `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`. Every other token, and the rest of the file, is byte-identical. If Biome's class sorting wants a different token order, follow it and report the final string. |
| N1' | `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx`, TS1 only | <ul><li>For each of the 12 buttons, assert the 4 tokens above.</li><li>Also assert that the three non-important forms (`motion-safe:transition-[background-color,color]`, `motion-safe:duration-180`, `motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]`) are **absent** as exact tokens.</li><li>Keep every other TS1 assertion and TS2–TS6 unchanged. Rename the TS1 title only if it needs to mention reduced motion.</li></ul> |
| D2' | `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` | <ul><li>Status → `In Progress (awaiting C round 159; round 158 C FAIL Low C-R158-01)`.</li><li>Add a Problem → Solution entry for C-R158-01: the unlayered global rule, why `!` plus `motion-reduce:transition-none!`, why not app.css (ROOT-GLOBAL-TRANSITION-RULE), and the accepted consequence from §0.1.</li><li>Add a "tests" note: jsdom tokens do not prove the cascade; C measures the computed style.</li><li>Add m156–m157.</li></ul>Georgian, technical terms in English. |

**Tailwind generation check by A:** fetch the dev-server CSS (`http://127.0.0.1:5173/app/styles/app.css?direct` or the URL A used in round 158). Confirm that each of the 4 selectors exists and carries `!important` on `transition-property` / `transition-duration` / `transition-timing-function` inside the right media query. Save the result as `a-round-159/tailwind-css-check.json`. If the dev server is not running, start it in the background and record that. This check proves generation only; the cascade belongs to C.

**Not allowed:**
- `app/styles/**`, any other component, `strings.ts` or `package.json`;
- `style=`, custom CSS, a hex value or a new token;
- any change to surfaces, colours, icons, widths, handlers or labels;
- the leading-`!` (deprecated) form.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` | F1 only |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | N1' only |
| `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` | D2' only |

- **Read before editing** (`.claude/rules/read-primitives.md`):
  - `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
  - `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio file; no audio logic changes);
  - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md`.
- **Protected:** the diff vs `f8a316a` stays empty for:
  - the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
  - `strings.ts`, `StudioWorkspace.tsx`, `studio-theme-obsidian.test.tsx` and `studio-lab.tsx`.
  - Doc 127 must still equal its round-158 end hash `0b3cf016…` (`a-round-158/end-sha256.txt`; it is also in the frozen 975).
- **Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01).
- **B grep at planning:** only the transport component and its test file contain `duration-180` or `motion-safe:transition-[background-color`. No other test reads these tokens.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 25 files in `b-round-158-r159-vitest-base.txt` (= `a-round-158/vitest-files.txt`). Expect 386/386. Save the list as `a-round-159/vitest-files.txt` and the result as `a-round-159/vitest-baseline.json`.
- **After the edits:**
  - Run the same 25 files: 386 pass (or 386 plus any `it` A adds), and TS1 is green with the new tokens.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the component and the test file.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-159/mutations/`):
  - **m156:** in F1, `motion-safe:duration-180!` → `motion-safe:duration-180`. TS1 turns red.
  - **m157:** in F1, delete `motion-reduce:transition-none!`. TS1 turns red.
- **Code-reviewer: required** (3 changed files; speed rules and `read-primitives.md`). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 975 are OK, and the protected diff vs `f8a316a` is empty.
  - `git status --short` = the same 2 ` M` + 2 `??` as at the start, nothing else.
  - Write `a-round-159/end-sha256.txt` (the 4 round-158/159 paths) and `a-round-159/diff-vs-start.patch` (vs `b-round-158/r159-granted-start/`).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD; root note ENV-FIRST-LOAD-LUCIDE).
- **Harness rules:** make a range by a clip-body drag (a ruler drag navigates). Escape does not clear a range. The idle Export footer button is **Done**.
- Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T159-TARGETED | Re-run `a-round-159/vitest-files.txt`. The counts equal A's, and TS1–TS6 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `f8a316a`.</li><li>The frozen 975 are OK at start and at end.</li><li>The end hashes equal `a-round-159/end-sha256.txt`.</li><li>`git status` = 2 ` M` + 2 `??` exactly.</li><li>The protected diff vs `f8a316a` is empty (§2 list, including `app/styles/**`).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-158/r159-granted-start/` itself:<ul><li>The component changes only the colour-motion tokens of `toolButtonClass` (F1).</li><li>The test changes only TS1 (N1').</li><li>Doc 128 contains D2'.</li><li>No `style=`, no CSS file, no hex, and no leading `!`.</li></ul>C also reads the cumulative diff vs `f8a316a`; it must equal round 158's AN-REVIEW scope plus F1/N1'/D2'. |
| SURFACE-STYLE | Re-run every round-158 sub-row (a)–(i) at both viewports, with the same method (real hover and mousedown; precheck `matchMedia('(hover: hover)')`; colour tolerance ±0.005 alpha, ±1 channel). Results must match round 158. **(h)** For all 12 buttons, computed `transition-property` = `background-color, color`, `transition-duration` = `0.18s` and `transition-timing-function` = `cubic-bezier(0.2, 0.8, 0.2, 1)`. **(h-rm)** In a context created with `reducedMotion: 'reduce'` (record `matchMedia('(prefers-reduced-motion: reduce)').matches` = true), all 12 buttons compute `transition-property: none` **or** a duration of `0s`. **(i)** The focus-visible ring is the 2 px brand box-shadow on Play, Export and Fit. Read it once immediately (now expected at once) and once after 300 ms. Report one table per viewport. Class tokens alone are never evidence for (h) or (h-rm). |
| CASCADE-SCOPE | The fix must stay on the transport. At both viewports, read the computed transition of 3 non-transport controls: one library button, one lane header button (M or S) and the Export dialog's Done button. Record each `tagName`/`role` and confirm that it matches the global selector (`a, button, [role="button"], input, textarea, select`); a control outside that list legitimately shows `all 0s ease` and is not a finding. They must still show the global `color, background-color, border-color, box-shadow, transform, opacity` / `0.15s…0.25s` / `ease-out` values. An unimportant utility cannot override the unlayered rule, so this is the state at `f8a316a`. A difference is a finding (Medium if it changes a control outside the transport). |
| RV1-V3A | Run `b-round-157/tools/d6.cjs` unchanged (sha256 = `b-round-157/tools-sha256.txt`), **one run** per viewport. Compare S0/S1/S2 with `b-round-157/out/d6/d6-{1440,1280}-r1.json`. Expected: every key is present and every x/y/w/h is within ±1 px (expected 0). A missing or added key, or any delta > 1 px, is a finding. |
| FUNC-SMOKE-T | Short check, both viewports:<ul><li>A Play click moves the playhead, the output peak is > 0, and the button reads Pause; Space toggles back to Play.</li><li>Export opens the dialog; Done closes it and focus returns to Export.</li></ul> |
| G159-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in round 158): ICON-STYLE, CONTRAST-V3A (colours unchanged), OVERLOAD-CHECK (closed), every V-2 row. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Hover/pressed/disabled fills, Play/Export/Loop-on roles | SURFACE-STYLE (a)–(g) |
| Focus ring (its transition is gone) | SURFACE-STYLE (i) |
| Other Studio and Store controls keep the global transition | CASCADE-SCOPE |
| Button boxes | RV1-V3A |
| Play/Pause toggle, Export focus return | FUNC-SMOKE-T, T159-TARGETED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| 180 ms colour motion on transport buttons; no motion under reduced motion | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“ and WCAG 2.3.3 (reduced motion). | Not checked. | **Not applicable; CZABA brand decision.** Behaviour, shortcuts and sizes are unchanged. | Requirement: SURFACE-STYLE (h)/(h-rm), CASCADE-SCOPE. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-159.md`, `a-round-159-result.json` and `a-round-159/` (vitest JSON and list, tailwind-css-check, mutations, end-sha256, diff patch).
- **C:** `c-round-159.md` and `c-round-159.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the SURFACE-STYLE (both viewports), CASCADE-SCOPE and RV1-V3A tables. Put tools, out and shots in `c-round-159/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 160 planning)
| Condition | Round 160 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium (including CASCADE-SCOPE) | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on (h)/(h-rm) again | B re-plans with C's computed-style evidence. Options: a narrow root-approved `app/styles` grant (ROOT-GLOBAL-TRANSITION-RULE), or recording a user-vetoable deviation in `feature-status.md`. It is not deferred silently. |
| C FAIL Low only (another row) | A bounded fix-up if it is in V-3a's own code and cheap; otherwise `deferred_low_polish`, and V-3b goes ahead. |
| C PASS | Root publishes rounds 158+159 (the same 4 paths). V-3a → **მზადაა**; C-R158-01 closed. Round 160 = **V-3b**: the 7 remaining transport glyphs (↤, ↶, ↷, ✂, ⌫, ↻, ↩) with the R2 default sizing (unless Saba has answered Q-V3-ICON-SIZE), together with the glyph-pinned tests and `studioEditStrings.deleteButton`/`deleteClipLabel`. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 159 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish rounds 158+159 together: 4 paths vs `f8a316a` (ArrangementTransport.tsx, doc 127, plus the new transport-surface-ui.test.tsx and doc 128). `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `strings.ts` and `StudioWorkspace.tsx` are unchanged.
- **New root signal:** ROOT-GLOBAL-TRANSITION-RULE (`backlog.json` open_findings). The unlayered global transition rule in `app/styles/app.css` l.305–314 defeats every Tailwind transition utility on interactive elements and has no reduced-motion guard. This is Store-wide. It needs a root-approved grant and a Store-page regression, and it is not scheduled.
- **Frontend-architect checkpoint:**
  - `b-round-158-checkpoint-request.md` adds the V-3 recipe question (ARCH-R158-TOOL-BUTTON-RECIPE) to the pending `b-round-157-checkpoint-request.md`.
  - The natural point is before V-3c. It does not block round 159 or V-3b.
- **User-visible decisions (may be vetoed in `feature-status.md`):** D-29z123 R2–R4, unchanged. A-R158-IDLE-TOOLBAR-NOTE (the idle toolbar reads as mostly unframed text) belongs to the R3 veto list.
