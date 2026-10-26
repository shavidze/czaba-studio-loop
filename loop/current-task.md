# CURRENT TASK — Round 183: M4 — the cookie banner no longer covers the Studio

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z148** (`backlog.json` → VISUAL-A-OBSIDIAN `m4_plan_d29z148`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-182.md` is an exact copy of the round-182 `current-task.md` (sha256 `4ff73521…`, checked with `cmp`). The rationale for this round is in `b-round-182.md`.

## Baseline = HEAD `f22290f` (gate 182 published)
- **Gate:** `gates/gate-round-182.json` is `published`, commit `f22290f`, on both remotes. `git status` is clean, with **1007 tracked files**.
- **Start state:** `sha256sum -c c-round-182/end-tree-sha256.txt` is OK (1006 files). The 1007th file is doc 150. It was untracked in C's list, and its hash equals A's round-182 end hash (`73b80132…`).
- **Frozen list:** `b-round-182-r183-tree-sha256.txt`, **1005 entries** (1007 minus the 2 grants). B checked it: OK.
- **Grants:** `b-round-182-r183-grants.txt` (2 existing files). **New files:** `b-round-182-r183-new-files.txt` (2 files; neither exists yet).
- **Start hashes:** `b-round-182-r183-granted-start-sha256.txt`. **Start copies:** `b-round-182/r183-granted-start/`.
- **Vitest:**
  - **There is no "before" base.** No existing suite imports `CookieConsent` or `~/lib/analytics`; B grepped every `*.test.ts(x)`.
  - **The "after" list** is `b-round-182-r183-vitest-after.txt`, with 1 new file.
  - **Never** run `npx vitest run $(cat <empty file>)`: an empty list runs the full suite.
- **A's first step:** check that HEAD is `f22290f`, that `sha256sum -c --quiet b-round-182-r183-tree-sha256.txt` is OK, and that the 2 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z148)
- **Round 182: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Root published it as `f22290f`. **M3 → მზადაა** (vetoable, M3-RATIONALE-VETOABLE).
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24, and today is 2026-10-26: 2 days, below the 3-day threshold. Any planning on or after 2026-10-27 makes the next round the **REGRESSION round**, expected to be round 184. It will include M1, M3 and M4.
- **Bug gate:** no Critical, High or Medium finding is open.
- **Next in the VISUAL-A order is M4.** It is approved in `visual-direction-a.md` §M (2026-10-21, `approved_moves.M4`): *"the cookie banner on `/studio-lab` no longer covers the bottom panel. Reason: it gets in the way of work. Impact: Store behaviour, a separate file."* M4 is the last approved M; M5 is `awaiting_user`.
- **B reproduced the problem on HEAD** (`b-round-182/out/banner-head.json`, `under-banner-head.json` and the PNGs).
  - **Setup:** a clean `f22290f` copy on :5175 with `VITE_GA4_MEASUREMENT_ID=G-B183PROBE`, its own vite `cacheDir`, and `googletagmanager.com` aborted.
  - **What happens:** 1.5 s after load, the banner on `/studio-lab` is `position: fixed` at **(0, 832) 1440×68** and **(0, 652) 1280×68**.
  - **What it covers:** the Studio status line ("Demo collection ready. Choose a track…", `aria-live`) and the keyboard-shortcut hint bar, at both viewports.
  - **Store page:** on `/` the banner has the same rect.
  - **On the shared :5173 server it never renders:** the cloud has no `.env`, so `GA4_MEASUREMENT_ID` is empty and `CookieConsent` returns early. That is why C needs its own GA-env servers (§5).
- **Grant decision (M4-COOKIE-GRANT, resolved):**
  - `app/components/common/CookieConsent.tsx` is **not** in `global_forbidden_files`. It was only frozen per round, so B grants it for this approved move, whose impact line names that file.
  - `app/root.tsx` **is** globally forbidden and stays byte-identical. The route check is done inside the component.

## 1. What changes (exact; line numbers are on the start tree)
| ID | File : line | Change |
|---|---|---|
| **L1** | `CookieConsent.tsx` l.8–10 (imports) | Add `import { useLocation } from '@remix-run/react';`. Keep Biome's import order. |
| **L2** | `CookieConsent.tsx` l.12–13 | At the top of `CookieConsent()`, before any `return`, add `const { pathname } = useLocation();` and `const isStudioRoute = pathname.startsWith('/studio');`. Hooks stay unconditional and keep their order. |
| **L3** | `CookieConsent.tsx` l.48 | `if (!isVisible) return null;` → `if (!isVisible \|\| isStudioRoute) return null;` |

**Constraints:**
- **Store routes stay exactly as they are:** the returned JSX, every class string, the inline `style`, the 1500 ms timer, `handleAccept` / `handleDecline`, the `fbq` calls, the Georgian header comment and the `GA4_MEASUREMENT_ID` / `hasConsentDecision` early exits.
- **Do not fix pre-existing issues** in this file, such as the inline rgba gradient. They are out of M4 scope.
- **No new prop, context or export.** Do not edit `root.tsx`, `analytics.ts`, `components/common/index.ts`, any Studio component or `app/styles/`.

**Rulings (B, vetoable, recorded in `backlog.json` `m4_plan_d29z148.rulings`):**
- **R44, hide, not move.** On `/studio*` the banner renders nothing.
  - VISUAL-A forbids layout moves in Studio.
  - Any fixed overlay covers some Studio surface: a bottom bar covers the status line and hint, a corner card covers lanes or the detail panel, and a top bar covers the transport.
- **R45, no replacement consent UI inside Studio this round.**
  - M4 does not change the pre-decision tracking posture. Before any click, a Studio visit has the same state as every Store page: `root.tsx` loads gtag with consent default `denied` for analytics and ad storage. Consent Mode may still send cookieless pings, but no analytics cookies or identifiers are stored.
  - The question is asked on the next Store page: the timer keeps running and `isVisible` becomes true, so the banner shows as soon as the route is not `/studio*`.
  - A Studio-native consent entry would be new behaviour and needs Saba.
- **R46, the predicate is `pathname.startsWith('/studio')`.** It is identical to `root.tsx` l.137 `isStudioPage`, so `/studio-lab` and `/studio/:productId` behave alike.

## 2. Tests and docs (A)
**New test file** `app/components/common/__tests__/CookieConsent.test.tsx`. The folder is new, and vitest `include` (`app/**/*.test.{ts,tsx}`) covers it.

Read `.claude/prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` first.

**Setup:**
- `vi.mock('~/lib/analytics', …)` with a non-empty `GA4_MEASUREMENT_ID`, a controllable `hasConsentDecision` (default `false`) and a spy `setAnalyticsConsent`.
- `vi.mock('@remix-run/react', …)` with a controllable `useLocation`, following the existing pattern in the arrangement tests.
- Fake timers, advanced by 1500 ms inside `act`.

| ID | Assert |
|---|---|
| **CC1** | Pathname `/`: before 1500 ms nothing is rendered. After 1500 ms, the Accept and Decline buttons are present, and the banner root has the exact class string `fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up`. |
| **CC2** | Pathname `/studio-lab`: after 1500 ms, and again after 5000 ms, nothing is rendered (`container` is empty). |
| **CC3** | Pathname `/studio/middle-east`: after 1500 ms, nothing is rendered. |
| **CC4** | Pathname `/studio-lab`, advance 1500 ms, and assert that nothing is rendered. Then rerender with `/products`: the banner appears **without another timer advance** (R45). |
| **CC5** | Pathname `/`, click Accept: `setAnalyticsConsent(true)` is called once, and the banner disappears. Also check Decline → `false`, and that `hasConsentDecision` true → nothing renders on `/`. |

**Test rules:** query by role or text. Use no colour-class selector, except the exact root class-string lock in CC1, which stands in for C's Store screenshot.

| ID | File | Change |
|---|---|---|
| **D1** | doc 150 | l.4 status → `Completed`. At l.71, strike the TODO and mark it done: C round 182 PASS, published `f22290f`. l.72 (veto) stays. At l.73, change the next step to "M4 (round 183), then the REGRESSION round." Nothing else changes. |
| **D2** | **new** `docs/implementation/2026/quarter-IV/151-studio-m4-cookie-banner-studio.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Include L1–L3, R44–R46 (with the GDPR default-denied note), B's HEAD probe numbers, CC1–CC5, mutations m308–m311 and the §6 row. Status: `In Progress (awaiting C round 183)`. |

## 3. A — files you own (everything else is frozen)
- **The 2 grants:** `CookieConsent.tsx` (L1–L3 only) and doc 150 (D1 only).
- **The 2 new files:** the test file and doc 151.
- **Protected, byte-identical:**
  - `app/root.tsx`, `app/lib/analytics.ts` and `app/components/common/index.ts`;
  - every route (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*` and `app/components/arrangement/*`;
  - `app/styles/`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase / download / studio-token files, `e2e/`, `.claude/**`, `package.json` and `vite.config.ts`.
- **Process rules:**
  - Read the primitives first: `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `SECURITY_AUDIT.md` (consent/tracking), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.
  - Make every lasting edit with Edit/Write. Use shell writes only for the temporary mutations, and restore and sha-check after each one.
  - Write `a-round-183/end-sha256.txt` (4 paths) and `a-round-183/diff-vs-start.patch` (the 2 grants against `b-round-182/r183-granted-start/`, plus the 2 new files in full).
  - Helper scripts go under `a-round-183/tools/`. No commit, no push.

## 4. A — tests and commands (speed rules)
- **Run:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-182-r183-vitest-after.txt)`. Expect all CC1–CC5 tests green. Write the list to `a-round-183/vitest-files.txt`.
- **Checks:** `npm run typecheck`, `npm run lint`, and `npx biome check` on the 2 code/test files.
- **Code review:** 4 changed or new files, so ask the `code-reviewer` subagent. Pass its Architecture note to B verbatim.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and the browser rows.

### 4.1 Mutations (temporary edits to `CookieConsent.tsx`; restore and sha-check after each one)
| ID | Mutation | Must turn red | Must stay green |
|---|---|---|---|
| m308 | L3: drop `\|\| isStudioRoute` | CC2, CC3, CC4 (its studio-side absence assert) | CC1, CC5 |
| m309 | L2: `startsWith('/studio')` → `=== '/studio-lab'` | CC3 | CC1, CC2, CC4, CC5 |
| m310 | L3: `isStudioRoute` → `!isStudioRoute` | CC1, CC2, CC3, CC4, CC5 (inverted on every path) | — |
| m311 | Banner root class `bottom-0` → `top-0` | CC1 (class lock) | CC2, CC3, CC4 |

If a "must turn red" test stays green, or a "must stay green" test turns red, report it. Do not weaken anything; B rules on it.

## 5. C — rows
Real Playwright Chromium, at 1440×900 and 1280×720, with a fresh anonymous context per session (localStorage empty, so `hasConsentDecision()` is false). Pixel reads run at DPR 2 with `--disable-lcd-text`.

**GA-env servers (required: the banner cannot render on :5173):**
- **CUR copy:** A's changes are uncommitted, so `git archive` would miss them. From `store/`, run `mkdir -p /tmp/cur183 && git ls-files -c -o --exclude-standard | tar -cf - -T - | tar -x -C /tmp/cur183`, then symlink `node_modules`.
- **HEAD copy:** `git archive f22290f` into `/tmp/head183`.
- **Cache:** in **each copy only**, give `vite.config.ts` its own `cacheDir` (`/tmp/<copy>-vitecache`). Never share `node_modules/.vite` (C-R180-HEAD-COPY-VITE-CACHE).
- **Start:** `VITE_GA4_MEASUREMENT_ID=G-C183TEST npx remix vite:dev --host 127.0.0.1 --port 5174` (CUR) and `--port 5175` (HEAD). B's tool `b-round-182/tools/banner-probe.cjs` shows the pattern.
- **Network:** in every GA-env session, `page.route` aborts `googletagmanager.com` and `google-analytics.com`. Those aborted requests are expected; count them under `gaAborted`, not as PX-NET forbidden hosts.
- **Cold load:** wait ≥ 6 s after `domcontentloaded`, since the banner timer is 1.5 s. If the first cold load reloads (vite re-optimizes; B's first probe did), discard that run and replace it once (ENV-FIRST-LOAD).
- **Cleanup:** remove both copies, their caches and the servers afterwards.

| Row | What | Pass |
|---|---|---|
| **T183-TARGETED** | Re-run `a-round-183/vitest-files.txt`. | All tests in the file are green, 0 failed. |
| **SCOPE-183** | Check the frozen list (1005) at C's start and C's end, and A's `end-sha256.txt`. Run `git status`. | Frozen 1005 OK. `git status` = 2 ` M` + 2 `??` (the test folder and doc 151). The protected diff against `f22290f` (§3 list) is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW-183** | Read the diff. | `CookieConsent.tsx` has only L1–L3: hooks before any return and the JSX untouched. The test file has CC1–CC5 as written. D1 and D2 are as written. |
| **MUT-183** (read-only) | Read m308–m311. | Each diff is the described edit, each restore sha is OK, and the red / green sets match §4.1. |
| **BANNER-STUDIO-M4** | On CUR :5174 and HEAD :5175, at both viewports: `/studio-lab`, then `/studio/middle-east`. | **HEAD:** the banner is present on both paths, (0, 832) 1440×68 / (0, 652) 1280×68 on `/studio-lab` (B's numbers). **CUR:** no Accept/Decline button, no `position: fixed` element at the bottom from the banner, and `elementFromPoint` at the centre of the status line and of the shortcut hint hits those elements. `/studio-lab` keeps workspace + demo badge; `/studio/middle-east` keeps "Sign in required". Screenshot each. |
| **BANNER-STORE-M4** | CUR vs HEAD at both viewports: `/` (and `/products` if it renders without the backend; otherwise note it). | **DOM / computed-style criterion:** the banner rect and the rects of its text, the Privacy Policy link, Decline and Accept equal HEAD ±0.5 px. Computed `position`, `bottom`, `z-index`, `background-image` and `backdrop-filter` equal HEAD. Accept → localStorage `czaba_analytics_consent` = `granted`, banner gone. In a fresh context, Decline → `denied`, banner gone. A reload after a decision → no banner. **The pixel crop is supporting evidence only.** The banner uses `backdrop-filter: blur(12px)` over a 0.9–0.95 black gradient, so the page content underneath (carousel, loading states, popups without a backend) bleeds through. Crop differences explained by that content are **not** a FAIL; report them. |
| **NAV-M4** | CUR, 1440 (1280 short): open `/studio-lab`, wait 6 s (no banner), then click the "← CZABA" back link. | The banner appears on the Store page within 3 s. Consent is still `null` until a button is clicked. Report whether the navigation was client-side or a full load. |
| **STUDIO-RV-M4** | Shared :5173 (no GA env), `/studio-lab` rest screenshot at both viewports vs C round-182 rest shots (`c-round-182/shots/c182-*/rest-full.png` or the equivalent). | 0 changed px. The Studio is unchanged where no banner exists. |
| **M3-NEIGHBOUR** | :5173, one short check. | The 9 library options have 4 ±0.5 px gaps at both viewports. |
| **G183-3** | :5173: anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts other than the aborted GA hosts on the GA-env servers, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Cookie consent banner inside the workspace | **None.** Ableton Live is a desktop app with no web cookie banner. | Nothing. | A user-approved CZABA move (M4, 2026-10-21), with rulings R44–R46. | BANNER-STUDIO-M4. Parity: **არ ეხება** (not applicable) |

## 7. Evidence and reporting
- **A:** `a-round-183.md` and `a-round-183/`.
- **C:** `c-round-183.md`, `c-round-183.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-183/`.
- **Both:** write the report files as you go.

## 8. Outcome, fixed in advance (B at round 184 planning)
| Condition | Round 184 |
|---|---|
| **C PASS** | Root publishes round 183, and M4 → **მზადაა** (vetoable R44/R45). Planning on or after 2026-10-27 → **REGRESSION round** (M1, M3 and M4 included, plus e2e smoke, C-R167-METRONOME-UNDER-MUTE and REG-DUX5-PLAYHEAD-RESCAN). Then ROOT-RECON-GRID-HARNESS at the VISUAL-A exit. |
| C FAIL at Medium or above | A bounded fix-up in the same files. |
| A GA-env browser row could not run | `browserVerified=false` → M4 is not done, and B re-plans that browser half. |

## 9. Root notes
- **Gate (on C PASS):** the 2 grants plus the 2 new files. `root.tsx` stays unchanged.
- **Feature boundary ahead:** after M4 and the regression round, VISUAL-A reaches its exit (ROOT-RECON-GRID-HARNESS). B will re-raise the unanswered `b-round-180-checkpoint-request.md` there as one bounded frontend-architect ask.
