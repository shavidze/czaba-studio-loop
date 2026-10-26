# A round 183: M4, cookie banner hidden on /studio* (A-scope complete)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-26 · Task: `current-task.md` (D-29z148) · No commit, push or deploy.

## Start checks
- HEAD `f22290f`. `sha256sum -c --quiet b-round-182-r183-tree-sha256.txt`: OK (1005). Both grant start hashes: OK.
- After all edits and the mutations, the frozen list is still OK (rechecked).

## Changed files (exactly 4)
| File | Kind | Change |
|---|---|---|
| `app/components/common/CookieConsent.tsx` | grant | L1 `import { useLocation } from '@remix-run/react';` (first import, Biome order). L2 `const { pathname } = useLocation();` and `const isStudioRoute = pathname.startsWith('/studio');` directly after `useState`, before `useEffect` and any return. L3 `if (!isVisible \|\| isStudioRoute) return null;`. 3 hunks, 0 JSX, class, style, handler or comment lines touched. |
| `docs/implementation/2026/quarter-IV/150-studio-m3-library-row-spacing.md` | grant | D1 only: l.4 → `Completed`; l.71 struck and marked done (C round 182 PASS, `f22290f`); l.72 unchanged; l.73 → "M4 (round 183), then REGRESSION round". |
| `app/components/common/__tests__/CookieConsent.test.tsx` | new | CC1–CC5 plus CC4b (8 `it`s: CC5 has 3 sub-cases; CC4b, Store → Studio rerender, was added on the code-reviewer's Low finding). `vi.hoisted` controllable mocks for `~/lib/analytics` (`GA4_MEASUREMENT_ID='G-CC183TEST'`, `hasConsentDecision`, `setAnalyticsConsent` spy) and `@remix-run/react` `useLocation`. Fake timers. Queries are by role. The only class selector is the CC1 root class-string lock. jest-dom is not in the project, so emptiness is checked with `container.innerHTML === ''`. |
| `docs/implementation/2026/quarter-IV/151-studio-m4-cookie-banner-studio.md` | new | D2: Georgian, TEMPLATE sections, L1–L3, R44–R46 (GDPR default-denied note, checked against `root.tsx` l.59–60), B's HEAD probe numbers, CC1–CC5, m308–m311 and the §6 Ableton row. Status `In Progress (awaiting C round 183)`. |

Protected files untouched: `git status` shows only ` M` CookieConsent.tsx, ` M` doc 150, `??` `app/components/common/__tests__/` and `??` doc 151.
Artifacts: `a-round-183/end-sha256.txt` (4 paths), `a-round-183/diff-vs-start.patch` (2 grant diffs against `b-round-182/r183-granted-start/` plus the 2 new files in full), `a-round-183/vitest-files.txt`, `a-round-183/tools/run-mutations.sh` and `a-round-183/mutations/`.

## Tests actually run
- `npx vitest run app/components/common/__tests__/CookieConsent.test.tsx`: **1 file, 8/8 passed** (7/7 before CC4b was added).
- `npm run typecheck`: **0 errors**.
- `npm run lint`: **exit 0** (218 repo-wide warnings, 1 info; no errors).
- `npx biome check` on the 2 code/test files: **exit 0, 3 warnings**, all `lint/a11y/useButtonType` on the 3 frozen `<button>` elements in CookieConsent's JSX. They are **pre-existing**: the same 3 warnings appear on the `f22290f` version of the file. They are out of M4 scope ("do not fix pre-existing issues"). The test file has 0 diagnostics.
- Not run by A (speed rules): full suite, `npm run verify`, build, e2e, browser rows.

## Mutations m308–m311 (`a-round-183/mutations/`)
Rerun after CC4b was added; the JSON files hold the final 8-test results. Each one: sed on the post-L1–L3 base (`base.tsx`, `base.sha256`), `mNNN.diff`, verbose `mNNN.log`, JSON `mNNN.json`, then restore. All 4 restores: `sha256sum -c base.sha256` OK (`restore.log`).

| ID | Red (observed) | Green (observed) | vs §4.1 |
|---|---|---|---|
| m308 drop `\|\| isStudioRoute` | CC2, CC3, CC4 (studio-side absence assert), CC4b | CC1, CC5 ×3 | match |
| m309 `=== '/studio-lab'` | CC3 | CC1, CC2, CC4, CC4b, CC5 ×3 | match |
| m310 `!isStudioRoute` | CC1, CC2, CC3, CC4, CC4b, CC5-Accept, CC5-Decline | **CC5 "decision exists → nothing on /"** | **deviation, reported to B** |
| m311 `bottom-0` → `top-0` | CC1 | CC2, CC3, CC4, CC4b, CC5 ×3 | match (CC5 is not listed in §4.1; it was observed green) |

**m310 deviation:** the CC5 sub-case with `hasConsentDecision() === true` stays green under the inverted predicate. This is expected: with a recorded decision the effect returns before the timer, so `isVisible` stays false and the component returns null whatever the predicate is. That sub-case cannot detect a predicate inversion. Nothing was weakened; B rules on it.

## Code review (actual `code-reviewer` subagent, score 9/10)
- **No Critical, High or Medium findings.** Correctness confirmed: hook order is stable; `useLocation` is SSR-safe (only rendered at `root.tsx:161`, inside the router; the ErrorBoundary does not render it); the predicate matches `root.tsx:137`.
- The reviewer had no shell, so it read the working tree and did not run `git diff`. A's diff (3 hunks) is in `diff-vs-start.patch`.
- **Low, addressed:** add a Store → Studio rerender test → CC4b added (8/8 green).
- **Low, not addressed (pre-existing, out of scope):** the `fbq` branch in `handleAccept` is not exercised in jsdom.
- **Low/info, privacy-conservative:** visitors who arrive only through Studio are never asked, and stay at default denied. This is already covered by R45 and routed to Saba.
- **info, addressed in doc 151:** R45 now lists all 4 denied gtag keys (`root.tsx` l.60–65) and the Pixel `fbq('consent','revoke')`.
- **info, left as is:** `includes('studio')` would survive as a mutant (no counter-route exists); `getByRole(...).not.toBeNull()` is redundant but harmless.
- **Architecture note (verbatim, for B/root, not acted on):** "Signal (coupling/duplication): the Studio route predicate now exists twice, at `app/root.tsx:137` and `app/components/common/CookieConsent.tsx:16`. **Keep**: it is one line, the meaning is identical by design (R46), and root.tsx is frozen. Proposal for planner: when root.tsx unfreezes, either pass `isStudioPage` down as a prop or move the predicate into a small shared `lib/` function so the two can't drift apart."
- After the fixes: test 8/8, typecheck 0 errors, lint exit 0, Biome on the test file has 0 diagnostics, frozen 1005 OK, end hashes and patch regenerated.

## B acceptance criteria that A passed (A-owned only)
- L1–L3 exactly, with hooks before any return and the JSX untouched: yes (diff).
- CC1–CC5 present and green: yes, 8/8. CC1–CC5 are exactly as B wrote them. CC4b is an extra test in the same owned file, not a replacement.
- D1 and D2 as written: yes.
- typecheck, lint and Biome on the 2 files: passed (only the 3 pre-existing warnings).
- Mutations: 3 of 4 match exactly; m310 has the one deviation above.
- **Not claimed:** every browser row (BANNER-STUDIO-M4, BANNER-STORE-M4, NAV-M4, STUDIO-RV-M4, M3-NEIGHBOUR, G183-3, PX-NET / REG-HYD) belongs to C. Gate rows belong to root. M4 is not done until C passes it.

## Known gaps
- jsdom cannot measure the banner rect or Store pixel parity. CC1's class lock stands in for that; C's BANNER-STORE-M4 is the real check.
- The banner never renders on :5173 (no GA env), so C needs the GA-env CUR/HEAD servers from §5.
- Pre-existing, out of scope: `useButtonType` ×3 and the inline rgba gradient `style` in CookieConsent.tsx. Proposed to B as a later Low polish item.

## Exact next checks for C
1. T183-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-183/vitest-files.txt)` → 8/8.
2. SCOPE-183: frozen 1005 OK at start and end; `sha256sum -c a-round-183/end-sha256.txt`; `git status` = 2 ` M` + 2 `??`.
3. MUT-183: read `a-round-183/mutations/*.diff`, `restore.log` and the JSON results; rule on the m310 deviation together with B.
4. BANNER-STUDIO-M4, BANNER-STORE-M4 and NAV-M4 on GA-env CUR :5174 / HEAD :5175 at both viewports.
5. STUDIO-RV-M4, M3-NEIGHBOUR, G183-3 and PX-NET / REG-HYD on :5173.

## Scope
Round 183 A-scope is implemented. The browser half and the gate are still open. The backlog is not complete.
