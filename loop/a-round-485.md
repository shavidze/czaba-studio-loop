# A round 485: CLIENT-NAV-CONTRACT (GATE479-M1-ROUTE-ANNOUNCE + 4 Lows)

No STOP. The reviewer's one Medium is covered by B's existing ruling (`b-round-484/sketch-review.md` l.31: `studio.$productId.tsx` (protected) has no meta → "Outside this task"). The part inside the grants, an over-broad doc sentence, is fixed in doc 313. The code part needs a protected file, so it goes to root (see "For B/root").

## Start state
- Start HEAD `751e30e`, clean tree (`git status --short` empty).
- Sketch sha256 `3f06149c6bdd650ae79603488e03f46cbdd44d928aae293ca4a6d9db676ad1d3` = `b-round-484/sketch-485.sha256`.

## Apply
- `git apply --check` then `git apply -v b-round-484/sketch-485.patch.txt`: all 13 files "Applied patch … cleanly" (`a-round-485/apply.log`).
- `cmp` against `b-round-484/sketch-485/`: 13 of 13 OK (`a-round-485/cmp.log`). **No sketch line changed.**

## Changed files (store)
- The 13 sketch files: `app/components/animations/{RouteAnnouncer.tsx (new), RouteTransition.tsx, __tests__/route-transition.test.tsx}`, `app/lib/{route-name.ts (new), link-focus.ts, __tests__/link-focus.test.tsx, __tests__/route-name.test.ts (new)}`, and the routes `cart.tsx`, `search.tsx`, `account.tsx`, `account_.login.tsx`, `account.orders.tsx`, `account.reset.$id.$token.tsx`.
- `docs/implementation/2026/quarter-IV/313-client-nav-contract.md` (new, Georgian).
  - Its seven `## ` headings follow TEMPLATE order.
  - l.4 is `**სტატუსი:** Completed (C round 485 PASS)` (L28).
  - It covers the announcer contract, the rejected mount signal, the `reloadDocument` ruling, the slow-loader note, and the downloads-title TODO. It cites only rows that exist (RA1–RA9, RN1–RN3, LF3–LF7).
  - Post-review edit to l.31: the old text said Store → Studio is announced. The new text says Store → `/studio-lab` is announced and `/studio/:productId` is silent (probe below), and the TODO section gains a root item for that route's title.

## Commands actually run
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-485/typecheck.log` |
| `npm run lint` (repo) | rc 0, 191 warnings, 1 info | `a-round-485/lint.log` |
| `npx vitest run` on the 7 named files | 7 files, 93 tests passed, rc 0 (equals B's `sketch-covering.log`) | `a-round-485/vitest.log` |
| `npx biome check` on the 13 sketch files (paths quoted) | rc 0, 16 warnings, all in the 6 routes | `a-round-485/biome-scoped.log` |
| `biome lint` on a `git archive HEAD` copy of the 6 routes | 16 warnings, the same per-file counts (orders 2, reset 2, account 7, cart 5) | `a-round-485/biome-head-routes.log` |
| `bash b-round-484/claims-485.sh` | rc 0; the deltas vs planning are exactly the allowed ones (K2 the 14 paths, K3 rc 1, K5 4 routes, K12 1/1, K12b 1×6, K13 1, K15 13 of 13) | `a-round-485/claims-485-a-output.txt`, `claims-485-a-delta.txt` |
| RA-SPEAKERS grep | 21 lines = the 20 at HEAD + the `RouteAnnouncer.tsx` line (line numbers ignored, sorted) | `a-round-485/speakers-after.txt` |
| Playwright probe on :5173, 1440×900: `/faq` → client nav `/studio/middle-east` | title `''`, region `''`, 1 region; the "Sign in required" h1 is present at +4 s but is not announced | `a-round-485/studio-product-probe.{mjs,json}` |

- **Biome discrepancy (non-blocking):** the task says "14 before and 14 after"; the real count is 16 → 16. B's `sketch-biome.log` reports "Checked 12 files" and has no entry for the reset route (likely cause, not verified: the unquoted `$id.$token` path was expanded away by the shell). The 2 extra warnings in the reset route are pre-existing: `noUnusedVariables` (`signIn`) and `useButtonType`.
- Slow-test check (L11): the whole 7-file run took 2.16 s (tests 1.52 s for 93 tests); no test is near 50 % of its timeout. No STOP.
- Full suite, build and `npm run verify` were not run (speed rule; that is the gate). `/check`, applied as B scoped it: a non-mutating Biome check on the exact owned paths, plus typecheck and the covering tests. `verify` and e2e smoke stay with the gate.
- **Pre-flight (done late; stated honestly):** I read the skill after applying the sketch, not before.
  - Assumptions: the task means "apply B's sketch byte-equal plus doc 313"; HEAD has no announcer; success = K15 13/13, tsc rc 0, 93 tests green.
  - Smallest version: the sketch as dispatched; no extra abstraction.
  - Files: exactly the 13 sketch paths and doc 313.
  - The doc was written after reading the GEORGIAN_DOCS primitive and TEMPLATE headings (L26).

## Code-reviewer (actual subagent, score 8.5/10; no Critical or High)
- **Medium: `/studio/:productId` announces nothing, and the doc claimed Store → Studio is announced.**
  - Verified by the probe above. It is not a regression: HEAD announced nothing anywhere.
  - Code: B ruled it out of scope in `sketch-review.md` l.31, and the fix needs the protected `studio.$productId.tsx` → root.
  - Doc: fixed (l.31 narrowed; TODO added).
- **Low:** `target` comparison is case-sensitive (`link-focus.ts:17`); `target="_Self"` would keep focus. React Router's same-document check compares the same way, so behaviour stays consistent. Not changed, because a sketch change needs a Medium+. → `deferred_low_polish` candidate.
- **Low:** RA9 (jsdom) does not prove that Remix `<Meta>` updates the title before the rAF in a real app. That is C's RA-BROWSER/RA-TITLES row. The doc presents RA rows as unit contracts only.
- **Suggestion:** `data-route-announcer` is test/probe-only. It is kept (the probes and K9 depend on it).
- **Architecture note (for B/root, not acted on):** `RouteTransition.tsx:16-33` now mixes announcement state and timing with page-transition rendering. Keep it for now: about 15 lines, same `pathname` input, and it must live in the always-mounted component. If more focus or announcement rules are added, extract a `useRouteAnnouncement(pathname)` hook as one bounded task.

## For B/root
- **ROOT-REQ (new, proposed id B-R485-STUDIO-PRODUCT-TITLE):** give the protected `app/routes/studio.$productId.tsx` a `meta` title (from the product name), so that client navigation into the purchased Studio is announced. Evidence: `a-round-485/studio-product-probe.json`.
- **Observation (inference, not verified):** on that route the h1 fallback did not fire even though an h1 exists 4 s later. That suggests the h1 is not rendered at the rAF read when the route is title-less and gated by client auth. The six titled routes do not depend on the fallback. C's RA-BROWSER covers them.
- ROOT-REQ-DOWNLOADS-TITLE stays as planned.
- **Task text note:** task §4 says "Store → Studio: now announced". That is true only for `/studio-lab`. Doc 313 l.31 is narrowed to match the probe, so C should not fail the doc against the broader task wording.

## Known gaps
- No browser acceptance row was run by A apart from the probe above. RA-*, LF-FOOTER, STUDIO-485 and G485-AUTH are C's rows.
- The screen-reader half → TLM-R485-SR-ROUTE-ANNOUNCE (Tech Lead).

## Exact next C checks
C-SCOPE (claims start and end; expect the deltas in `a-round-485/claims-485-a-delta.txt`), C-APPLY (13 of 13), RA-ATTRS, RA-INITIAL, RA-BROWSER, RA-TITLES, RA-STUDIO, RA-TAB, RA-REPEAT, RA-SPEAKERS, RA-VISUAL, STUDIO-485, LF-RUNTIME (mutants from a scratch copy), LF-FOOTER, G485-AUTH, at both viewports. Also check the doc 313 l.31 wording against the probe, and the `/studio/middle-east` silence as a known, ruled gap (not a FAIL of this round).

## B acceptance criteria A actually met
- Sketch applied byte-equal (K15 13 of 13), doc 313 written with the required contents, typecheck rc 0, lint rc 0, 7 covering files / 93 tests pass, code-reviewer run and its findings addressed or routed.
- Everything else is pending C. Nothing in the backlog is marked complete by A.
