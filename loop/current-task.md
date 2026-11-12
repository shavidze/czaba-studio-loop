# Round 461: SABA-B-13 test hardening. Real `hydrateRoot` rows for the entrance cover (A-R460-REVIEW-1, -6, -7)

**Planned by:** B at the round 460 → 461 planning, 2026-11-12 (`b-round-460.md`). D-29z1628 records the round-460 result and D-29z1629 this dispatch.

**Advisor:** available and consulted after orientation, before the sketch. B applied its advice in four ways:
- the bug gate ranks this fixable Medium ahead of STORE-2b-3c-2b;
- jsdom feasibility was proven before scoping;
- each row has a named red mutant, and the row with no source mutant is a tripwire;
- a real-browser anchor row is kept.

**Archive:** the round-460 task is saved as `tasks/round-460.md`, a byte-identical copy (`cmp` OK).

**Baseline:** gate 460 is `published` with commit `ffd0c7c` [K1]. That is the baseline HEAD. The store tree is clean, and no app code differs from it [K2].

**Regression:** not due today (2026-11-12). The last one ran on 2026-11-10 (round 425). The next round planned on or after 2026-11-13 is REGRESSION-2026-11-13.

**Next RETRO:** round 465.

**Type:** test-only. The reference-first section, the `product-designer` consult and the screen budget do not apply: nothing visible changes and no app code changes.

## 1. Why this round
- **Round 460 passed and is published** (`c-round-460.json`: C1–C16 PASS, `browserVerified`/`realVerified` true, 0 bugs; gate 460 `ffd0c7c`, review COMMIT OK 8.5/10). SABA-B-13 is now **მზადაა** for Chromium. Firefox and Safari stay as TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465.
- **A-R460-REVIEW-1 (Medium, code-reviewer, round 460):** no unit test runs a real React `hydrateRoot` [K3]. E15–E19 imitate the re-render with `renderToString` and `head.innerHTML`. Two React assumptions the fix depends on are therefore guarded only by C's browser rows:
  - (a) after a hydration mismatch, the client re-render recreates the cover `<style>` with the `media` that `isEntrancePending()` computes at render time;
  - (b) a clean hydration keeps the boot script's node, its `media="all"` and its `data-start`.

  Under the 2026-10-23 bug gate, a Medium that A can fix inside the loop comes before new scope. STORE-2b-3c-2b is Low/info only, so it waits.
- **Two Lows in the same file, which cost little:**
  - **A-R460-REVIEW-6:** E9 can false-pass, because the removal of the window takeover listener and of the boot capture listeners is not asserted [K4].
  - **A-R460-REVIEW-7:** the server branch of `isEntrancePending` is never exercised. The branch exists [K3].
- **Two gate-review nits in the same file:**
  - **GATE460-4:** the E11 source regex is too strict [K4]. It is the E11 part of A-R459-REVIEW-R8.
  - **GATE460-5:** E8 has a dead `let` [K4]. It joins TL-R459-TEST-NITS.

## 2. What changes (grants: exactly 2 paths, `b-round-460/grants-461.txt`)
1. **`app/lib/__tests__/store-entrance-loader.test.tsx`:** A applies `b-round-460/sketch-461.patch.txt` **byte for byte**.
   - Afterwards the file's sha256 must match `b-round-460/sketch-461-files-sha256.txt`.
   - A hand edit to this file is a STOP. A reports it to B and does not fix it.

   The sketch adds or changes:
   - **Helper `hydrateHeadCover({ foreignNode, elapsedMs })`:**
     - it server-renders the head, runs the boot script and advances the clock;
     - with `foreignNode`, it first inserts a `<div>` as the first child of `head`, which forces React 18.3.1 [K13] to re-render on the client;
     - it then runs a real `hydrateRoot(document.head, <EntranceCoverHead />)` inside `act`;
     - it counts the recoverable errors whose message matches `/hydrat/i`, silences jsdom's error report in `try/finally`, and keeps the root at module scope.

     `unmountHydratedHead()` in `afterEach` unmounts that root, so a failing row cannot leak into the next.
   - **E1b:** a pending handshake gives `media="all"` in jsdom. With `window` stubbed to `undefined`, the server render gives `media="not all"`. The stub is removed in `finally`. Closes A-R460-REVIEW-7.
   - **E9, strengthened:** the boot capture listeners count 2 and the window takeover listener counts 1 before the takeover; both counts are 0 after it. New helper `trackTakeoverListeners()`. Closes A-R460-REVIEW-6.
   - **E8:** `const notPrevented = skip();` (GATE460-5).
   - **E11:** `/<Links \/>\s*<EntranceCoverHead \/>/` (GATE460-4). The one-instance assert is unchanged.
   - **E20:** a mismatch at 160 ms gives hydration recoverable errors > 0. A new `<style>` replaces the server node (the server node is detached and the new one has no `data-start`). The new style's media is `all` and the handshake is still `pending`. `SpotlightLoader` then takes over: the overlay appears, the state is `live` and the new style is `not all`. Closes half (a) of A-R460-REVIEW-1.
   - **E20b:** a mismatch at the failsafe time renders the replaced style `not all`, and the handshake is still `pending`.
   - **E21:** a clean hydration at 160 ms has 0 recoverable errors and 0 `console.error` calls, keeps the same node with media `all`, and `data-start` equals the handshake start. Closes half (b) of A-R460-REVIEW-1.
   - **E21b (React tripwire):** a clean hydration at the failsafe time keeps the same node with media `all`. No source mutant can turn this row red; it turns red only if React starts patching hydrated attributes.
   - **Order:** E21 and E21b come **before** E20 and E20b, under a Georgian context comment. React's dev build prints its hydration warning only once per module, so a mismatch row that runs first would make E21's console assert vacuous. B found this with the whole-file mutant run: M5 was GREEN in v2 (`b-round-460/v2-superseded/mutants-whole-v2/mutants.txt`).
2. **`docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md`:**
   - **l.4:** `**სტატუსი:** Completed (C round 461 PASS)` [K12] (L28).
   - **The word `pending` must not appear anywhere in doc 300.** This keeps the round-460 invariant: `grep -ci pending` = 0. Write the handshake state in Georgian, for example „მოლოდინის მდგომარეობა“, and do not name the `pending` value or `isEntrancePending`.
   - **Under ტესტირება, a round-461 paragraph in Georgian** that:
     - names E1b, E9, E20, E20b, E21 and E21b and A-R460-REVIEW-1/-6/-7;
     - **records the three gaps tech-lead named against production** (`b-round-460/sketch-review.md` review 1, finding 2): production runs `hydrateRoot(document)` inside `startTransition`; a mismatch removes the whole `<html>` (stylesheets and body too), while the test only empties `head`; and the test's foreign node sits in `head`, not in `body`. These gaps stay covered only by the browser rows (round 460 C11–C13 and C7 here);
     - labels E21b as a React tripwire.
   - **Under TODO, the new deferred Lows:** A-R460-REVIEW-2, -4, -5 and GATE460-2.
   - No other doc section changes.

**Not in scope:** any app source, including `EntranceCover.tsx`, `SpotlightLoader.tsx` and `root.tsx`. The deferred Lows stay deferred:
- TL-R459-COLOR-BLACK-DEP = A-R460-REVIEW-3 = GATE460-1. It needs a decision on the hardcoded fallback colour, at the polish pass;
- GATE460-2 (dust particles);
- A-R460-REVIEW-2, -4 and -5;
- the `findOverlay(_container)` parameter.

## 3. What B measured on the sketch (scratch `ffd0c7c` + `sketch-461.patch.txt`)
- **Hydration really happens in jsdom.** This was B's first probe, which was not kept. It showed a mismatch gives 3 recoverable errors, a new node and media `all`, and a clean hydration keeps the same node with 0 errors. The pinned rows E20/E21 now assert this.
- **Mutants:** `b-round-460/mutants/mutants.py <scratch> <out> whole` runs the **whole file** for every mutant, which is how C4 and the gate run it. Output: `mutants/mutants.txt` [K6]. The last column lists the failing rows. BASE and BASE-ALL are GREEN. Each of M1–M10 is RED, with its target row among the failing ones:

| Mutant | Change | Row that goes red |
|---|---|---|
| M1 | media constant `not all` | E20 (also E15, E16, E19, E1b) |
| M2 | no time bound in `isEntrancePending` | E20b (also E19) |
| M3 | server branch returns `true` | E1b |
| M4 | server guard removed | E1b |
| M5 | `suppressHydrationWarning` removed from the style | E21 |
| M6 | boot `off` keeps the window takeover listener | E9 |
| M7 | `SpotlightLoader` sends no takeover event | E9 (also E15) |
| M8 | boot `off` keeps the keydown capture listener | E9 (also E15, E17, E18) |
| M9 | boot script writes no `data-start` | E21 (also E2) |
| M10 | `<EntranceCoverHead />` before `<Links />` in `root.tsx` | E11 |

- **No leak:** with E20 forced to fail, E20b, E21 and E21b still pass (`sketch-review.md`).
- **Prechecks** [K7]:
  - the covering set [K8], 3 files, gives 62 tests green;
  - the entrance file runs in about 0.5 s, so timeout headroom is fine (L31);
  - `npm run lint` on the sketch gives 207 warnings (`b-round-460/precheck-lint.txt`) [K15];
  - `git apply --check` of the sketch on the store tree is OK (`b-round-460/apply-check.txt`) [K16];
  - `tsc --noEmit` rc 0;
  - Biome on the test file is clean;
  - 0 `Hydration failed` lines in the covering log.
- **Review** (`b-round-460/sketch-review.md`) [K5, K9], all by `tech-lead`:
  - review 1: APPROVE-WITH-CHANGES on v1, all 7 findings applied;
  - review 2: APPROVE on v2;
  - review 3: **APPROVE** on the dispatched v3, sha `b154ff5396da0d16cc564931836b7f9124694b0eda6583d255cd2179775376f5`. v3 changes only the row order.

## 4. A steps
1. **Read:** the A part of `lessons.md`, and the primitives `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Claims before:** run `bash b-round-460/claims-461.sh` from the loop root. Its output must be identical to `b-round-460/claims-461-planning-output.txt`.
3. **Apply the sketch:**
   - `cd b-round-460 && sha256sum -c sketch-461.sha256` must give 1 OK;
   - from the store root: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-460/sketch-461.patch.txt`;
   - then `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-460/sketch-461-files-sha256.txt` must give 1 OK.
4. **Doc 300:** make the edits listed in §2.2.
5. **Checks:**
   - `npm run typecheck`;
   - `npm run lint` (207 warnings on the sketch, `b-round-460/precheck-lint.txt` [K15]);
   - `npx biome check` on the 2 grant paths;
   - `npx vitest run` on the 3 covering files [K8];
   - the mutants: `python3 -I b-round-460/mutants/mutants.py <A scratch: git clone --shared at ffd0c7c + the sketch, node_modules symlinked> a-round-461/mutants whole`. Its `mutants.txt` must be identical to B's.

   A code-reviewer run is optional (2 files). Do not run the full suite or `verify`; those are gate rows.
6. **Claims after:** the output must be identical to `b-round-460/claims-461-expected-after-A.txt`.
7. **Scope:** `git status --short --untracked-files=all` shows exactly the 2 grant paths.

## 5. C rows
| Row | Command / where | PASS when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --name-only ffd0c7c -- app/components app/root.tsx` | exactly the 2 grant paths; the second command prints nothing |
| C2 CLAIMS | `bash b-round-460/claims-461.sh` and the L29 grep below | output identical to `claims-461-expected-after-A.txt`, empty stderr; every L29 hit is a grant path, a command argument, a planned change or a `[K#]` claim |
| C3 APPLY | from the store root: `sha256sum -c …/b-round-460/sketch-461-files-sha256.txt` | 1 OK |
| C4 COVERING | `npx vitest run` on the 3 files in `covering-461.txt` | 3 files / 62 tests green; 0 `Hydration failed` lines in the output; E1b, E9, E20, E20b, E21 and E21b are listed as passed |
| C5 MUTANTS | `python3 -I b-round-460/mutants/mutants.py <C scratch of ffd0c7c + sketch> c-round-461/mutants whole` (whole file, no `-t` filter) | `mutants.txt` is identical to B's: BASE and BASE-ALL GREEN, M1–M10 RED, each target row among the failing rows; E21 is before E20 in the file |
| C6 TRIPWIRE LABEL | read E21b in the test file and doc 300 | E21b is described in the doc as a React tripwire with no source mutant (record only, not counted as a mutant row) |
| C7 BROWSER ANCHOR (unchanged app) | the probe scripts exist [K11]; production build of the tree: `R=<store> bash b-round-459/probe/serve-prod.sh start <c-round-461/prod> 5191 TREE` with the mock API on :5199; `node b-round-459/probe/r1-repro.mjs http://127.0.0.1:5191 inject` ×2; `node b-round-459/probe/frames.mjs http://127.0.0.1:5191 1440 900 1 fresh c-round-461/fresh-1440.json` ×1; then stop the server | inject: `overlaySeen` true, `styleReplaced` true, `curState` `live` (2/2); fresh: `firstPaintedLum` 0, `firstCovered` ≤ `fp`, `gapsWhileCovered` 0. B did not run this row this round. The expected values are C's own round-460 results on the same app code (K2 = 0 code diff vs `ffd0c7c`): `c-round-460/r1-c.txt`, `c-round-460/matrix/5191-1440-cpu1-fresh.json` [K14] |
| C8 STUDIO + PROTECTION | `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> <dev base> <tag>` on :5173 | 1440 and 1280: `/studio-lab` has 1 clip, goes Playing → Stopped, `stopHeld` true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. Expected values are from C round 460 on the same app code (`c-round-460/c15.json`, `c-round-460/prot.mjs`) [K14]. A first `NO-BODY` read is a dev first-compile race: re-run it ×3, as round 460 did |
| C9 DOCS | doc 300 | l.4 exact; `grep -ci pending` on doc 300 = 0; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 hits (L28); TEMPLATE headings in order; the round-461 paragraph names E1b, E9, E20, E20b, E21, E21b, A-R460-REVIEW-1/-6/-7 and the three production gaps; the TODO lists A-R460-REVIEW-2/-4/-5 and GATE460-2 |
| C10 L57 | `python3 -I tools/l57-check.py c-round-461.json c-round-461/l57-check.txt` | rc 0 |
| gate | full vitest, typecheck, build, Biome, lint, verify | marked `gate`, not claimed in `passed` |

**C2's L29 grep** (from the loop root):

```bash
grep -nE 'l\.[0-9]+|(app|perf|docs)/[^ `]+|data-testid|aria-[a-z-]+' current-task.md > c-round-461/l29.txt
```

B's run on this task gives 6 hits (`b-round-460/l29-planning.txt`). Each one is a grant path, a planned change or a command argument.

**Notes for C:**
- **`c-round-461.json`:**
  - Write all L57 fields and give every finding an `origin`.
  - `mutantRedOnSketch` = `b-round-460/mutants/mutants.txt`.
  - `affectedChecksRunOnSketch` = `b-round-460/precheck-covering.log`.
- **`browserVerified`** depends on C7 and C8; both can run in the cloud.
- **Not testable here:** Firefox and Safari (TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465).
- **Optional:** if time allows, probe A-R460-REVIEW-4 (a skip inside the claim → hand-off window, one black frame?) and record the result. It is not a PASS condition.

**Neighbours that could break:**
- the other two covering files (`store-teal-sweep`, `store-live-teal`) read the same source tree;
- a leaked React root or a stubbed `window` would break later tests in the file. `afterEach` covers this, and C4 runs the whole file.

## 6. Claims
Run from the loop root: `bash b-round-460/claims-461.sh`. Every `b-round-460/` file this task cites exists [K10].
- Planning output: `b-round-460/claims-461-planning-output.txt`.
- After-A expectation: `b-round-460/claims-461-expected-after-A.txt`, which is the script output on B's sketch scratch (`S=/tmp/b461-scratch`).
- Both stderr files are empty.
