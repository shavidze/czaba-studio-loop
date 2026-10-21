# A — Round 24 report (Home on separators, explicit detail-panel ref; D-29o)

Implementer: A (Claude Opus 5.5) · 2026-10-11 · No PASS claimed; C verifies.
Gate output files: `../tmp/studio-real-loop/a-round-24/`.

## 1. Pre-flight gate

Before touching anything, I read the following:
- the rules: `read-primitives.md`;
- the primitives: `FORWARDREF_COMPONENT`, `AGENT_DISCOVERABLE_CODE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS` and `GEORGIAN_DOCS`. The hook also injected `AUDIO_ARCHITECTURE` when I wrote the doc;
- `prompts/new-component.md`;
- the `pre-flight` skill.

**Baseline before editing:**
- `sha256sum -c b-round-23-tree-sha256.txt` → **51 OK**, no failures.
- `git status --short` → **46 lines**, byte-identical to `c-round-23/gates/git-status-end.txt`.
- My three files matched the dispatch snapshots: `47e33554…`, `f28e069f…` and `fba42d8a…`.
- HEAD is `c5ed47b`.
- `a-round-24-prompt.txt` and `a-round-24-result.json` (0 bytes) were loop-runner artefacts. I did not touch them.

**Pre-flight gate:**
- **Assumptions:**
  - Home on a `role=separator` target keeps `preventDefault` and skips `seekTo(0)`.
  - Every other Home path is unchanged.
  - The ref refactor changes no behaviour: the R11-P2a test is the oracle.
  - `forwardRef` is deliberately not used, because the frozen `render-budget` counts renders by function name.
- **Smallest version:** about 12 changed source lines in total:
  - a 3-line Home branch;
  - 1 ref declaration, 2 read sites, 2 guard simplifications and 1 prop pass;
  - 4 lines in DetailPanel.
- **Files touched, and why:**
  - `StudioWorkspace.tsx`: the Home handler and the panel lookup.
  - `ArrangementDetailPanel.tsx`: the `panelRef` prop.
  - `track-layout.test.tsx`: the red-first tests.
  - doc 030: required.
- **Success criteria:**
  - R24-H and R24-F fail on the old code and pass on the new code; R24-HC passes on both;
  - tsc 0, the full vitest run at 1007+3 with 0 failures, and the build OK;
  - Biome on `./app` with 0 errors and ≤218 warnings + 1 info;
  - G24-2: 51 OK, 47 status lines, protected 4/4.

## 2. Red-first, then green

**Red, against the unchanged sources** (`a-round-24/red-track-layout.txt`): 2 failed and 34 passed (36).
- R24-H: `AssertionError: expected +0 to be 5` at `readPosition()` after Home on the music lane height separator.
- R24-F: `AssertionError: expected null not to be null`.
- R24-HC: passed (it is the control).
- tsc on the test file failed as B expected (`a-round-24/red-tsc.txt`): `TS2322 … Property 'panelRef' does not exist on type 'IntrinsicAttributes & ArrangementDetailPanelProps'`.

**Red run repeated with the final test version** (`a-round-24/red-final-scratch.txt`):
- After the red run I changed R24-F in two ways (see deviation 1):
  - a plain ref object instead of `createRef`;
  - an `act` flush.
- So I re-proved red in a scratch copy outside `store/`, at `../tmp/studio-real-loop/a-round-24/scratch`. It holds a copy of `app/` and the configs, with the dispatch snapshot sources (`StudioWorkspace.tsx` sha `47e33554`) and the final tests. `node_modules` was linked through a temporary junction, which I removed afterwards (the link only; the store's `node_modules` is intact).
- Result: R24-H ×, R24-HC ✓, R24-F ×, with the same two assertion errors; 2 failed and 34 passed.

**Green** (`a-round-24/green-track-layout.txt`): `Tests 36 passed (36)`, with no stderr.
- Run together with `render-budget.test.tsx` and `detail-panel.test.tsx` (`green-targeted.txt`, run before the deviation-1 edit): `Test Files 3 passed (3)`, `Tests 67 passed (67)`.
- The existing R11-P2a refit test is unchanged and green.

## 3. Diff summary (against `b-round-23-snapshots/`)

**`StudioWorkspace.tsx`** (+10/−7 changed lines in the live diff; the full `diff -u` against the snapshot is in `a-round-24/diff-StudioWorkspace.txt`). The first scoped `biome check --write` reported "Fixed 1 file", and that file was `StudioWorkspace.tsx`:
- Biome collapsed the 4-line `if (\n event.propertyName === 'height' &&\n event.target === scrollerRef.current?.nextElementSibling\n )` in `handleDetailPanelTransitionEnd` onto one line: `if (event.propertyName === 'height' && event.target === detailPanelRef.current) {`. The condition got shorter and now fits the line width.
- That is the only Biome reflow, and it sits inside the §2.2 read site. Nothing else was reformatted.

The changes:
- `const detailPanelRef = useRef<HTMLElement>(null);` after `libraryBodyRef`.
- `refreshTrackLaneLayout`:
  - `const panel = detailPanelRef.current;`;
  - `panel ? panel.offsetHeight : 0`;
  - `panel !== null &&` replaces the `instanceof HTMLElement` guard.
- `handleDetailPanelTransitionEnd`: `event.target === detailPanelRef.current`.
- Home: `preventDefault()` is kept, and the seek is now `if (!isSeparatorTarget(event.target)) { current.seekTo(0); }`. It uses the existing helper; there is no new helper, and `isSliderTarget` is unchanged.
- `panelRef={detailPanelRef}` is passed to `<ArrangementDetailPanel>`.
- `grep -c nextElementSibling` → **0**.

**`ArrangementDetailPanel.tsx`** (+4/−0):
- `type RefObject,` in the react import;
- `panelRef?: RefObject<HTMLElement>;` in `ArrangementDetailPanelProps`;
- `panelRef,` in the destructuring;
- `ref={panelRef}` on the root `<section>`.

There is no re-indent and no `forwardRef`; it is still a plain `function ArrangementDetailPanel`.

**`track-layout.test.tsx`**: only added lines (`diff -u | grep -c '^-[^-]'` → 0).
- 3 import additions: `ArrangementDetailPanel`, `useArrangementPositionStore` and the `ArrangementPositionStore` type.
- A new `describe('separator Home and the detail-panel ref (R24-H, R24-HC, R24-F; D-29o)')` with the same stubs as the earlier describes.
- Local helpers: a `PositionStoreProbe` and a `mountHomeHarness`. The harness gives `readPosition` (through the context's position store), `seekToFive` (`live(api).seekTo(5)` with a read-back of 5) and `pressHome` (focus, then `fireEvent.keyDown` Home).
- The three `it` blocks:
  - **R24-H:** opens the detail panel; the library is expanded by default, so its separator is present. For each of the music `მუსიკა სიმაღლე`, `arrangement-detail-separator` and `arrangement-library-separator`, it asserts that:
    - `fireEvent` returns `false` (`defaultPrevented`);
    - focus stays on the separator;
    - the position stays 5;
    - `aria-valuenow` is unchanged;
    - `status` is unchanged.
  - **R24-HC:**
    - body → position 0;
    - music fold button → position 0;
    - music volume `input[type=range]` → not prevented, position stays 5.
  - **R24-F:** renders `ArrangementDetailPanel` alone (CapHarness-style props) with a `panelRef`, then asserts that `ref.current` is the `arrangement-detail-panel` section.

**Doc 030:** `docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md`, in Georgian. It covers:
- the separator Home contract and its rationale;
- why `nextElementSibling` was fragile;
- why a `panelRef` prop instead of `forwardRef`;
- the tests and the gates.

**Edge-case self-check (§2.4), by reasoning and the reviewer's read; not browser-proven unless stated:**
- **Library collapsed:** its separator is not rendered, so there is nothing to handle.
- **Folded lane handle:** it is still `role=separator` with `tabIndex=0` (`ArrangementLane.tsx:666-675`), so the same rule covers it.
- **Ctrl/Meta+Home:** the early `if (modifier) return;` comes before the Home branch, so it is unchanged.
- **Shift+Home:** Shift is not a modifier here, so on a separator it does not seek either. This is consistent with the contract.
- **Home during playback:** the separator branch only calls `preventDefault`, so playback is untouched. Not unit-tested; it is C's R24-H playback step.
- **Detail panel collapsed:** the `<section>` stays mounted, so the ref still points at it.
- **First mount:** React sets the child ref before the parent's effects run, so the initial `refreshTrackLaneLayout` from the ResizeObserver effect sees the panel.

## 4. Code-reviewer (actual `code-reviewer` subagent run; read-only)

Result: **no critical, high or medium findings; score 9/10.** Findings and my dispositions:

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | low | Ctrl+Home on a focused separator can still let the browser scroll (it returns early before the Home branch) | Pre-existing, and the spec says to keep the modifier order unchanged. No change. |
| 2 | low | In R24-H, `document.activeElement === separator` proves little in jsdom | Kept: it is cheap and mirrors C's browser oracle. No weakening. |
| 3 | low | No unit test for Shift+Home or for Home on a folded or collapsed handle | Generic code path; the spec assigns these to the §2.4 self-check and C. Left as is (§3). |
| 4 | nit | The `beforeEach` is duplicated from earlier describes | Deliberate: it keeps the test diff to added lines only (R24-S). |
| 5 | nit | A plain ref object instead of `createRef` | Deliberate; deviation 1 and doc 030. |
| 6 | nit | The doc's gate numbers are A's claims | True: C re-runs them. |

The reviewer also confirmed:
- `render-budget.test.tsx:30` counts only `typeof type === 'function'`, which supports the reason for not using `forwardRef`;
- dropping `panelRef={detailPanelRef}` in the workspace would fail the existing R11-P2a test (`commits === 0`), so that test guards the wiring.

## 5. Verbatim command tails (cwd `store/`)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-23-tree-sha256.txt   → 51 × OK, 0 failures   (a-round-24/sha.txt)
$ npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx
 Test Files  1 passed (1)
      Tests  36 passed (36)
$ npx tsc --noEmit                → exit 0, empty output (a-round-24/tsc.txt; re-run after the final test edit)
$ npx vitest run
 Test Files  57 passed (57)
      Tests  1010 passed (1010)
   Duration  22.82s
$ npm run build                   → exit 0
build/server/index.js                    1,281.53 kB
✓ built in 3.28s
$ npx biome check --write <my 3 code/test files>  → "Checked 3 files … No fixes applied." (final run; an earlier run reported "Fixed 1 file")
$ npx biome check ./app           → exit 0
Checked 323 files in 635ms. No fixes applied.
Found 218 warnings.
Found 1 info.
$ grep -c nextElementSibling app/components/arrangement/StudioWorkspace.tsx  → 0
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx
 app/components/layout/Header.tsx | 21 +++++++++++++++++++++
 1 file changed, 21 insertions(+)
$ node -e "…protected-baseline.json…"
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ git status --short | wc -l      → 47 (the 46 baseline lines + "?? docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md")
```

The sha check, Biome and the protected-hash run happened after the code changes. The full vitest run and the build happened after the final test edit. tsc first ran before that edit; I re-ran it after the edit (exit 0) once the advisor review pointed out the gap. The final `git status` was taken after doc 030 was written.

**Browser smoke** (allowed by §5; not a PASS claim). gstack browse, state `a-browse.json`, the existing `:5173`, 1440×900, `/studio-lab` with the empty demo arrangement:
- I seeked to `00:05.000` with a **synthetic** ruler pointerdown/up. This is not a real click, because gstack has no coordinate click.
- I focused `მუსიკა სიმაღლე` and pressed real Home (`$B press Home`). Position `00:05.000`, focus still on the handle, `aria-valuenow` 80, status unchanged.
- I moved focus to body and pressed real Home: position `00:00.000`.
- Console errors: only the known anonymous `GET /api/cart` `ERR_CONNECTION_REFUSED` / "Failed to load cart" (no backend running). Nothing from the workspace.

## 6. Deviations

1. **R24-F uses `const panelRef: { current: HTMLElement | null } = { current: null }` instead of `createRef<HTMLElement>()`.**
   - `createRef` would need a change to the existing `import { Profiler, type ReactNode } from 'react'` line, but R24-S requires the test file to show only added lines.
   - The object is structurally a React 18 `RefObject<HTMLElement>`.
   - I also added an `await act(...)` microtask flush after render, as in `mountTrackLayout`. It removes an `act()` warning from the provider's async load.
   - Red was re-proved for this final version in the scratch copy (§2).
2. **R24-H reads the position through `useArrangementPositionStore().getPosition()`.** The position is not in `useArrangement()`'s value, so a local `PositionStoreProbe` is mounted inside the same provider.
3. **The scratch directory** `../tmp/studio-real-loop/a-round-24/scratch/` (a copy of `app/` and the configs; no `node_modules`) remains under my report folder.
4. **The smoke seek was synthetic** (see §5).
5. **Biome reflowed one `if` condition** in `handleDetailPanelTransitionEnd` (from 4 lines to 1), because the shorter ref comparison fits on one line. It is inside a §2.2 read site, and there is no other re-indent (§3). C should expect this hunk in R24-S.

## 7. Exact next checks for C

- **R24-H**, real Home at 1440×900 and 1280×720 on the four separators: music height, video height, detail (open) and library (expanded). The oracle is in §4.1:
  - position ±1 frame;
  - `activeElement`;
  - `aria-valuenow`;
  - scroller `scrollTop`/`scrollLeft` and `window.scrollY`;
  - status.

  Also the playback case (position 200 ms later > position at the press) and arrows on each separator, before and after.
- **R24-HC:** body, fold button and selected clip → 0; volume range → native minimum and no seek (restore it afterwards).
- **R24-F:** R11-P2a open/close heights on `lay11` against round 21 §2.6; detail separator drag refit; floating-video placement after the library `transitionend`; `grep -c nextElementSibling` = 0.
- **R24-R, R24-S** (`diff -u` against the snapshots), **R24-U**, mutations in a scratch copy:
  - revert the Home condition → R24-H fails;
  - remove `ref={panelRef}` → R24-F fails;
  - optionally, the wrong `transitionend` target → the l.546 refit test fails.
- **R24-Doc** and G24-1..3; the real WAV export sanity check; the C-R23-01 NUL information record (`curl -s …/studio-lab`).
- Not verified by A: Shift+Home and Home on a folded handle in the browser; Home during playback in the browser.

## 8. Scope completed / carried

- **Done by A, and acceptance-relevant items A could verify locally:**
  - §2.1, §2.2, §2.3 (3 new `it` blocks) and doc 030;
  - the G24-1 numbers as I ran them (tsc 0, vitest 1010/1010, build OK, Biome 0 errors / 218 warnings / 1 info);
  - the G24-2 numbers as I ran them (51 OK, 47 lines, protected 4/4, Header +21/−0).

  C re-runs them; nothing here is a PASS.
- **Carried (unchanged by this round):**
  - **C-R23-01**, the SSR NUL bytes. Waiting for the Tech Lead: (a) React 19 or (b) a narrow `entry.server.tsx` grant.
  - The `ArrangementLibrary.tsx:549` biome-ignore reason.
  - SRW-13 and later rounds.
  - The Tech Lead items C-R6-02 and C-R8-01.
  - The root pre-push / publication-checkpoint items listed in task §4.7:
    - the purchased loader hardcodes middle-east (SRW-21);
    - Lenis on `/studio/*`;
    - portable instruction paths;
    - the export hard-clip R13-M4;
    - the final commit/push after everything;
    - the `Modal.tsx` focus gap;
    - GA `scroll` with consent denied;
    - the two foreign agent files;
    - the fake Bearer gets 500;
    - the CDP allowlist;
    - the publication-checkpoint requirements;
    - the `Content-Type` without a charset.

  None were touched, and none are closed.
- No commits, pushes, installs or deletions. The dev server was not started or stopped.
