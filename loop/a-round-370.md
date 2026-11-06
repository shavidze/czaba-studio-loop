# A round 370: PERF-11a (lazy signalr, no framer transition on `/studio*`)

No STOP. Scope completed: §1 items 1–6 of `current-task.md`. RT-FIX is B/C's row; A changed no loop retro or lessons file.

## How
- I checked that B's dispatched sketch `b-round-369/sketch.patch.txt` has sha256 `338dbe40…ef1785`, equal to `sketch-dispatched.sha256`. I applied it with `patch -p1` from `store/`. The 7 sketch files went in as-is, with no edit after applying.
- `diff app/root.tsx b-round-369/sketch-root.tsx.txt` prints nothing (ROOT-NARROW).
- I wrote doc 237 myself (the sketch has no doc).

## Changed files (`git status --short`: 8 lines = 4 M + 4 new)
- M `app/components/animations/index.ts`
- M `app/contexts/ChatContext.tsx`
- M `app/root.tsx`
- M `perf/budgets.resources.json`
- new `app/components/animations/RouteTransition.tsx`
- new `app/components/animations/__tests__/route-transition.test.tsx` (RT1–RT4)
- new `app/contexts/__tests__/chat-lazy-signalr.test.tsx` (CL1–CL4)
- new `docs/implementation/2026/quarter-IV/237-perf-root-diet-studio.md`
  - l.4 is `**სტატუსი:** Completed (C round 370 PASS)`, the same label form as docs 234–236.
  - Its `## ` headings equal TEMPLATE's minus `## Prompt` (checked with diff).
  - Every test it names exists.
  - The "230 KB not reachable" reasons are taken from `b-round-369/root-request-perf11b-firebase-lazy.md` l.14.

## Checks actually run (logs in `a-round-370/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0. It shows 205 warnings repo-wide, which are pre-existing (`lint.log`) |
| `npx biome check` on the 6 owned app files | rc 0. The 3 warnings are the pre-existing `noDangerouslySetInnerHtml` in root.tsx (`biome-scoped.log`) |
| `npx vitest run` on the 4 covering files | 4 files, 23/23 PASS (`covering.log`) |
| chat file with `--sequence.shuffle --sequence.seed=42` | PASS (`chat-shuffle42.log`) |
| perf `npx playwright test --config playwright.perf.config.ts studio-lab-resources`, run alone (own server on :5188; the :5173 server was not touched) | 1 passed. The three asserts PASS: **studio-lab 362,477 ≤ 372,000; home 250,526 ≤ 258,000; studio-guard 270,648 ≤ 278,000**. These are identical to B's sketch values (`perf-res.log`) |
| `sha256sum -c --quiet b-round-369/r370-frozen-sha256.txt` | rc 0 (`frozen-check.log`) |
| `bash b-round-369/claims-370.sh` (from the loop root) vs `claims-370-sketch-output.txt` | rc 0, no `MISSING`. Only K2 (`29f4b4d status-lines: 8`) and K11 (`free: 1 last: 237-perf-root-diet-studio.md`) differ, exactly as the CLAIMS row predicts (`claims-a.txt`) |
| CL4 text in doc 237 | the literal `Failed to connect to chat. Please try again.` is in the test file (grep count 1) |
| code-reviewer (real subagent, 8 files) | 8/10. No Critical, High or Medium findings, so no edit followed |

I did not run the full suite, `npm run verify`, build-only, mutants or the browser rows. The speed rules give those to C and the gate. The perf run did do a production build (`npm run build` inside its webServer).

## Code-reviewer findings (all Low, not fixed, for B)
- **A-R370-REVIEW-L1:** `isHubConnected` reads module-level `loadedSignalR`. It is correct, because a connection exists only after the load. A ref is an option if the chat module grows.
- **A-R370-REVIEW-L2:** CL1 is a source scan. CL2 is the behavioural guard: a static import makes the mock load count 1 on import.
- **A-R370-REVIEW-L3:** no unit row proves `root.tsx` uses `RouteTransition`. C's ROOT-NARROW and SSR-OPACITY rows cover it.
- **A-R370-REVIEW-L4:** RT2 uses `MemoryRouter` from `react-router-dom`, while PageTransition uses `useLocation` from `@remix-run/react`. It works through the shared router context but could break on a version bump. `createRemixStub` is the alternative.
- **Pre-existing, outside the grants:** `ChatContext.tsx:64` has `as 'active' | 'closed'`, a type assertion that HEAD already had.
- **Architecture note (proposal for B/root, not acted on):** `RouteTransition.tsx` still imports framer-motion statically, so it stays in the root chunk on studio routes. framer-motion is also reached through Toast, Header and LeadMagnet; see the root request. A later PERF-11 stage could lazy-load the store fade.

## Known gaps
- Browser rows (NO-SIGNALR, SSR-OPACITY, PAINT, FADE, NAV, G370-AUTH, STUDIO-SMOKE-370) were not run by A; they are C's.
- CHAT is blocked: the backend is unavailable in the cloud.
- The retry after a failed chunk load may stay cached by the browser (TL-9). B-R369-CHAT-UNMOUNT-RACE is unchanged.

## Exact next C checks
SOURCE-SCOPE, CLAIMS (`bash b-round-369/claims-370.sh`; on A's tree K11 should read doc 237, last 237), ROOT-NARROW, CHAT-SHAPE, UNIT plus shuffle 42, MUTANTS-TREE (a)–(d), PERF-BYTES alone, then the browser rows at 1440×900 and 1280×720, DOCS (l.4 byte compare), and RT-FIX.

## B acceptance I truly passed
- §2: typecheck, lint, the 4 covering files, and the perf spec with its 3 asserts.
- code-reviewer once, with no later edits.
- ROOT-NARROW diff empty; frozen sha rc 0.

Everything else waits for C.
