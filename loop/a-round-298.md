# A — round 298 (STUDIO-LINK-a3, test-only)

**CLAIMS DEVIATION — K11 only (environment), B ruling requested. Not a STOP by A's reading; see §1.**
**GATE297-F1 is only partly closed (A-R298-REVIEW-1, Medium, confirmed in react-dom source):** LH3 now catches prop-value mismatches that hydrate before the dock, but not server-only extra attributes or extra nodes. Do not close F1 on C PASS alone; it needs a follow-up with a widened regex and an add-attribute mutant.

If B rules this a STOP, the only store changes are the three byte-for-byte copies at the §4 paths below.

## 1. Claims
- **Before editing:** `claims-298.sh` output equals `claims-298-output.txt` on K1–K10 exactly. K11 differs: `MISSING:b-round-297/sketch.patch`.
  - Cause proven: `git check-ignore -v b-round-297/sketch.patch` (loop repo) → `.gitignore:14:loop/**/*.patch`. The patch was gitignored, so it did not survive the job hand-over to this fresh machine. The three full sketch files A copies are present.
  - Substitute: `a-round-298/reconstructed-sketch.patch` (HEAD → sketch diffs of all 3 files). Its content matches §3.1–3.3 exactly (LH3 + `hydrationWarnings` removed; `mountedRouteUnmounts`, idempotent unmount, `afterEach` unmount; doc l.4, both test files listed, S5 paragraph/TODO, round 299). Sketch line counts 188/186/82 = K10 of the after-sketch.
  - Retro candidate: B artifacts named `*.patch` are lost under the loop `.gitignore`; use `.patch.txt`.
- **After the change** (`a-round-298/a298-claims-after.txt` vs `claims-298-after-sketch.txt`): differences only K1 (real HEAD line `77d5341`, allowed), K2 = 3 lines (allowed), and the same K11 gap. K3–K10 identical to the after-sketch (K3 `frozen 1167 rc 1`; K4/K7/K9 unchanged).
- CLAIMS row: **equal except K11 (environment)** — not marked as a clean pass.

## 2. Changed files (exactly the §4 grants; each `cmp`-equal to its sketch)
- `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` (new)
- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` (modified)
- `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` (modified)

`git status --short`: these 3 lines only. No app source, frozen or protected file touched.

## 3. Checks (actually run)
- `npm run typecheck`: rc 0 (`a-round-298/typecheck.log`).
- `npm run lint`: rc 0 (205 warnings, 1 info — repo-wide pre-existing; none in owned files).
- `npx biome check` on the two test files: rc 0, no finding (`biome.log`).
- Covering set (7 files): **7 files, 58 tests passed** (`covering-run.log`, `covering-run.clean.log`).
  - LH3 runs from the new file (560 ms); LH1 797 ms, LH2 501 ms, LH4 467 ms from the old one (default 5 s timeout → max 16 %).
  - Slowest overall: NG5 2,270 ms of its 15 s describe timeout (15 %). Nothing above 50 %.
  - LH3 stderr: only the server-render `useLayoutEffect does nothing on the server` warnings and one `Prop \`muted\` did not match. Server: "false" Client: "true"` (GATE297-S5). Nothing else.
- Build and full suite: gate rows (not run by A, per speed rules).

## 4. Mutants (scratch `/tmp/a298-scratch` = `git archive HEAD` + A's two test files, own `cacheDir: '/tmp/a298-vite-cache'`; store tree untouched; every restore `cmp`-equal to store)
| Mutant | Result | Expected |
|---|---|---|
| baseline | 4/4 green | — |
| (h) `data-probe` option attr | **LH3 red** (1 failed / 3 passed); warning names `data-probe` (Server "detached", Client "mounted") | LH3 red ✔ |
| (e) drop `initialSelectedSourceId={previewSourceId}` | **LH1 + LH3 red** (2/4) | ✔ |
| (g) drop `previewFocusSettledRef.current = true;` | **LH4 red** (1/4) | ✔ |
| (i) spy moved above `mountServerHtml()` | LH3 green (1/1) | green (informational) ✔ |
| Vacuity: drop `.reverse()` in new file | **LH3 red** on `expect(firstOptionSourceId()).not.toBe(PREVIEW_SOURCE_ID)` | ✔ |
| Control: (h) with HEAD's `studio-link-hydrate-ui.test.tsx`, new file absent | 4/4 green — reproduces F1 | ✔ |

Logs: `a-round-298/mutant-{baseline,h,e,g,i,vacuity,control-h-head-file}.log`.

## 5. code-reviewer (actually run; score 7/10; no Critical)
Limitation: the reviewer had no shell. It read the final files against A's description and checked the StudioWorkspace order, but did not see `git diff`. Root's gate review should diff independently.
A did **not** apply any finding: §3/§4 require byte-equality with B's sketches (a C SOURCE-SCOPE row), and §7 makes any deviation a B ruling. All go to B.
- **A-R298-REVIEW-1 (Medium, confirmed by A in source):** the narrowed regex `/did not match|Expected server HTML|Hydration failed/i` misses other dev warnings that consume the same `didWarnInvalidHydration` flag. `react-dom.development.js` sets the flag at l.9579 before `error('Extra attributes from the server: %s')` (l.9585) and at l.10475/10486 before `Did not expect server HTML to contain a <%s>…` / `…the text node…` (l.10477/10488). None match the regex, so a server-only extra attribute on an option would silently pass LH3. Mutant (h) only covers a changed value. Suggested fix: widen the regex (`Extra attributes|Did not expect server HTML`), plus a mutant that adds a server-only attribute.
- **A-R298-REVIEW-2 (Medium, reviewer, not verified by A):** text/structure mismatches in React 18 go through `hydrateRoot`'s `onRecoverableError` (default `reportError`), so they may never reach `console.error` under jsdom. Suggest passing `onRecoverableError` and asserting the collected list is empty (gate-297 rejected this for *prop* mismatches only; it still applies to throws).
- **A-R298-REVIEW-3 (Medium, reviewer):** LH3 depends on `<ArrangementLibrary>` (StudioWorkspace.tsx:2782) hydrating before `<ArrangementVideoDock>` (l.2793). Suggest a `compareDocumentPosition` guard (listbox before `arrangement-video`).
- **A-R298-REVIEW-4 (Low):** `mountedRouteUnmounts.push(unmount)` runs after `await act(...)`; if hydration throws, the root is not tracked. Register before the await. The doc's "row-ის ჩავარდნის შემთხვევაშიც" therefore overstates it slightly. Relevant to UNIT-CLEANUP.
- **A-R298-REVIEW-5 (Low):** `toBeLessThanOrEqual(1)` cannot currently fail (warn-once). `args[1] !== 'muted'` depends on the message format (it fails safe, toward red).
- **A-R298-REVIEW-6 (Low):** "one hydration per file" is only a convention; suggest a one-line Georgian comment or a guard.
- **A-R298-REVIEW-7 (Info, doc 220):** l.68 still says "9 ფაილი, 89 ტესტი" (round-297 set; this round's set is 7/58). l.71 says the warning check moved, but the whole of LH3 moved. In the new file the `useLayoutEffect` warning is excluded by the spy order (spy after `renderToString`), not only by the regex; mutant (i) shows the regex alone also excludes it.
- **Architecture note (proposal for B/root):** l.9–157 are near-duplicates in the two files. Keep `vi.mock`/`vi.hoisted` per file. Candidate: extract the viewport stub, selector helpers, `mountServerHtml`/`hydrateRoute` (register before the await, collect `onRecoverableError`) and the lifecycle into `__tests__/helpers/studio-route-hydration.ts`. Acceptance: LH1–LH4 green; (e)/(g)/(h) red. Not done (outside ownership).

## 6. Acceptance status (A's own; C verifies)
- SOURCE-SCOPE, TYPECHECK, UNIT, UNIT-MUTANTS, UNIT-VACUITY: passed in A's runs.
- UNIT-CLEANUP: by reading — both files' `afterEach` splice-and-call every tracked unmount before `document.body.innerHTML = ''`; the unmount nulls `root` before calling, so a second call is a no-op. Not separately exercised by a failing-row run.
- CLAIMS: equal except K11 (environment) — B ruling.
- B-COLD-DEEPLINK, G298-AUTH, DOC-220: C's rows; A did not run a browser (no app source change).

## 7. Known gaps
- Reviewer Medium findings A-R298-REVIEW-1..3 are open (B ruling; not fixed because of the byte-equality grant). REVIEW-1 means F1 is only partly closed: LH3 now catches prop-value mismatches before the dock, but not server-only extra attributes or extra nodes.
- K11 sketch.patch absent (environment, §1).
- GATE297-S5 (`<video muted>` SSR mismatch) still consumes React's one-warning flag; LH3 catches only mismatches hydrating before the video dock (documented in doc 220).

## 8. Next C checks
CLAIMS (expect K11 gap), SOURCE-SCOPE + `cmp` vs sketches, TYPECHECK, UNIT (7/58), UNIT-MUTANTS incl. control, UNIT-VACUITY, UNIT-CLEANUP, B-COLD-DEEPLINK both viewports, G298-AUTH, DOC-220.

Scope completed: §3.1–3.3 and §5 checks. Backlog not self-marked.
