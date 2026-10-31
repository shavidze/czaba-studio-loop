# A round 299: STUDIO-LINK-a4 (test-only hydration fix-up)

**No STOP.** All §7 conditions checked; none triggered. Evidence folder: `a-round-299/`.

## Changed files (exactly the 4 §4 grants, each `cmp`-equal to B's sketch)
- `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` = `sketch-studio-link-hydrate-ssr-ui.test.tsx.txt`
- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` = `sketch-studio-link-hydrate-ui.test.tsx.txt`
- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` = `sketch-studio-narrow-gate-ui.test.tsx.txt`
- `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` = `sketch-220-studio-link-deep-link.md.txt`

No app source, protected, frozen, package or config file touched. `git status --short` = these 4 lines (` M`).

## Claims
- **Before editing:** `claims-299.sh` output `diff`-equal to `b-round-298/claims-299-output.txt` (rc 0, no difference).
- **After:** differs from the before output only on K2 (`status lines 4`), K3 (`frozen 1168 rc 1`; `sha256sum -c` fails only on the 4 §4 paths), K5, K6, K8, K9, K10. Those lines are identical to `claims-299-after-sketch.txt`. The after-sketch file differs from the real tree only on K1 (scratch has no git HEAD) and K2 (scratch 0 vs real 4), both expected per §Baseline. K4, K7, K11 identical. Saved: `a-round-299/claims-before.txt`, `a-round-299/claims-after.txt`.

## Checks (speed rules)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`a-round-299/tsc.log`) |
| `npm run lint` | rc 0; 205 warnings + 1 info, pre-existing, none in granted files (`lint.log`) |
| `npx biome check` on the 3 test files | rc 0, "Checked 3 files … No fixes applied", no finding (`biome.log`) |
| Covering set (7 files) | **7 files, 58 tests passed** (`covering-run.log`, `cov.clean.log`) |

**Timings (L11):** slowest NG5 2,085 ms (timeout 15 s = 14 %), LH3 793 ms, LH1 601 ms, NG2 426 ms; every other test < 400 ms. None above 50 % of its timeout.

**stderr vs the §3.1 pattern:** exactly two matches, both `Warning: Prop \`muted\` did not match. Server: "false" Client: "true"`: one under LH1 (log l.1028) and one under NG9c (l.2160). **No match under LH3 or NG9.** No other matching line.

## Mutants (own scratch `/tmp/a299-scratch` = `git archive HEAD` + my 4 files, `node_modules` symlinked, own `cacheDir` `/tmp/a299-vite-cache`)
Runner: a copy of B's `run-mutant.sh` at `a-round-299/run-mutant.sh` (only change: snapshot dir `/tmp/a299-snap`), so B's `mutant-*.log` were not overwritten; my logs are `a-round-299/mutant-<name>.log`. Every restore printed `restore cmp-equal`. Store tree untouched.

| Mutant | Expected | Result (of 20 tests) |
|---|---|---|
| (x) server-only attr on library option | LH3 + NG9 red | LH3, NG9 red (2 failed) ✔ |
| (v) server-only attr on standby `<video>` | LH3 + NG9 red | LH3, NG9 red (2 failed) ✔ |
| (y) server-only extra node | LH3, NG9, NG9c red | LH3, NG9, NG9c red (3 failed) ✔ |
| (h) differing value | LH3 + NG9 red | LH3, NG9 red (2 failed) ✔ |
| (r) LH3 without helper | LH3 red | LH3 red (1 failed) ✔ |
| (r2) NG9 without helper | NG9 red | NG9 red (1 failed) ✔ |
| (e) | LH1 + LH3 red | LH1, LH3 red (2 failed) ✔ |
| (g) | LH4 red | LH4 red (1 failed) ✔ |
| (i) informational | green | 20/20 green ✔ |
| vacuity (`vacuity-identity-order.py`) | LH3 red on `firstOptionSourceId` | LH3 red at l.184 `expect(firstOptionSourceId()).not.toBe(PREVIEW_SOURCE_ID)` ✔ |
| none (unmutated scratch) | green | 20/20 green |

Controls (x)/(v) on unmodified `ece19e3` were not re-run by A (C row UNIT-MUTANTS; B's `mutant-control-*-at-head.log` exist).

## code-reviewer (real subagent run, 4 paths): 8.5/10, no Critical/High
Passed to B; **not acted on**, because every grant is byte-equal to the sketch:
- **Medium (A-R299-REVIEW-1):** NG9's `toEqual([])` relies on being the first `hydrateRoot` in `studio-narrow-gate-ui.test.tsx` (React's once-per-module `didWarnInvalidHydration`). A hydrate test added above it, or `--sequence.shuffle`, would make it vacuous; doc 220 does not state this dependency. Suggests moving NG9's warning check to its own file (like LH3). Note: it holds today (mutants x/v/y/h/r2 red on NG9).
- **Low (A-R299-REVIEW-2):** NG9/NG9c unmount inline after assertions; a failing `expect` leaves the root mounted (the hydrate files now use register-before-act + `afterEach`).
- **Low (A-R299-REVIEW-3):** the regex is duplicated inline in NG9 rather than shared with `HYDRATION_WARNING_PATTERN`; drift risk.
- **Low (A-R299-REVIEW-4):** `applyBrowserParsedMutedState` silently no-ops if no `<video>` exists; an `≥ 1 video` check would make the premise explicit.
- **Info:** "There was an error while hydrating…" (thrown-render recovery) is not in the pattern; outside the stated intent.
- Reviewer verified: the regex covers all 7 react-dom 18.3.1 flag sites; helper cannot hide a real `muted` mismatch; unmount-before-act is correct and idempotent; TS strict, semicolons OK; doc 220 claims match the tests.

**Architecture note (proposal for B/root, not done):** the same hydration harness (`installViewportStub`, `mountServerHtml`, `hydrateRoute`, regex, muted helper) has been edited in three files across rounds 297–299 (signal 3). Proposal: `__tests__/helpers/hydration-harness.ts` exporting the pattern, the helper and register-before-act `hydrateRoute`, with NG9's warning check in its own file. Fits the existing A-R298-ARCH-HYDRATE-HARNESS entry.

## Known gaps
- No browser rows run by A (test-only round; C's B-DOCK-MUTED, B-COLD-DEEPLINK, G299-AUTH, JSDOM-MUTED-PREMISE are C's).
- Full suite, build, `verify`, `test:e2e:smoke` not run (gate rows).
- Doc 220 l.4 carries B's sketched status "In Progress (stage 1 of 2; C round 296 PASS; tests rounds 297–299)" as required by §3.4.

## Next C checks
CLAIMS; SOURCE-SCOPE (4 paths, `cmp` vs sketches); TYPECHECK; UNIT (7/58, stderr only LH1/NG9c); UNIT-MUTANTS incl. controls (x)/(v) at `ece19e3`; UNIT-VACUITY; UNIT-CLEANUP; JSDOM-MUTED-PREMISE (node + curl + Chromium DOMParser); B-DOCK-MUTED and B-COLD-DEEPLINK at both viewports; G299-AUTH; DOC-220.

## Acceptance A can honestly mark
CLAIMS (A's run), SOURCE-SCOPE, TYPECHECK, UNIT, UNIT-MUTANTS (excluding HEAD controls), UNIT-VACUITY: passed in A's runs. Browser rows and DOC-220 are not marked by A.
