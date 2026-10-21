# A — Round 23 report: lane-header a11y follow-ups (D-29n), `ArrangementLane.tsx` only

Implementer: A (Claude Opus 5.5) · Date: 2026-10-11 · Task: `current-task.md` (round 23). No commits, stash, push or deploy. Dev server not started or stopped. No browser used.

## 1. Pre-flight gate

Mandatory reads done:
- `read-primitives.md`;
- primitives: FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AGENT_DISCOVERABLE_CODE (the inject hook also delivered AUDIO_ARCHITECTURE);
- `prompts/new-component.md`, `skills/pre-flight/SKILL.md`, `docs/implementation/TEMPLATE.md`;
- `ArrangementLane.tsx` in full, `ArrangementDetailPanel.tsx` l.400–424 and l.612–659, `track-layout.test.tsx` l.1–460, l.776–815 and l.950–976.

Baseline before any edit:
- `sha256sum -c b-round-22-tree-sha256.txt`: **50 OK**, 0 other.
- `git status --short`: **45 lines**, `diff` against `c-round-22/gates/git-status-end.txt` is identical.
- HEAD is `c5ed47b`.
- `ArrangementLane.tsx` sha `5b427e3e…` and `track-layout.test.tsx` sha `426586b3…` equal B's snapshots. There was no partial earlier attempt: `a-round-23-result.json` was the runner's empty file.

> **Pre-flight gate:**
> - **Assumptions:**
>   - `aria-controls` targets the `laneBodyRef` div, which is always rendered;
>   - React 18 `useId` gives each lane a unique `:rN:` id;
>   - the ring change is the one class `focus-visible:ring-inset`;
>   - the comment is copied verbatim from DetailPanel l.620.
> - **Smallest version:** 6 changed lines in the component and 2 new `it` blocks appended inside the existing second `describe`, reusing its `beforeEach`. No new helper outside the blocks.
> - **Files to touch:** `ArrangementLane.tsx` (§2.1–2.3), `track-layout.test.tsx` (§2.4) and doc 029 (required).
> - **Success:**
>   - the new tests fail on the old code and pass after the change;
>   - tsc 0; vitest 1005 + 2 with 0 failures; build OK; Biome 0 errors;
>   - `git status` has 46 lines; 50 OK; protected 4/4.

### Scope completed and changed files

- **Scope completed:**
  - `ArrangementLane.tsx`: §2.1, §2.2 and §2.3;
  - `track-layout.test.tsx`: §2.4, two `it` blocks;
  - doc 029.
- **Changed files (only these):**
  - `app/components/arrangement/ArrangementLane.tsx` (already ` M`);
  - `app/lib/arrangement/__tests__/track-layout.test.tsx` (already `??`);
  - `docs/implementation/2026/quarter-IV/029-studio-lab-lane-header-a11y.md` (new `??`).
  - Plus my own artifacts: `../tmp/studio-real-loop/a-round-23.md` and `a-round-23/`. Nothing else under `store/` changed.
- **Acceptance IDs claimed as PASS:** none. C verifies.
- **§2.5 self-check:**
  - **Video lane:** it has no clips, keeps its `arrangement-video-dropzone` testid, and its target is the body. Clip checks only apply to the audio lanes.
  - **Folded lane:** the body is still rendered and the same id resolves in the same row, after both fold and unfold.
  - **4 lanes:** the `Set` size is 4, so the ids are unique.
  - **Tight lane:** the class is static and independent of density. The browser check is left to C (R23-N).

## 2. Red-first, then green

**Red** (the new tests against the unchanged `ArrangementLane.tsx`; full output in `a-round-23/red-first.txt`):

```
     × points every fold button’s aria-controls at its own lane body, outside the header, through fold and unfold (R23-F1) 23ms
     × draws the track-name button’s focus ring inset on folded and unfolded lanes (R23-N) 72ms
AssertionError: expected '' not to be '' // Object.is equality
AssertionError: expected [ 'min-w-0', 'flex-1', …(9) ] to include 'focus-visible:ring-inset'
      Tests  2 failed | 31 passed (33)
```

Both new behaviour tests failed, each for its own reason: there was no `aria-controls`, and the ring class was missing. All 31 existing tests stayed green, including the fold test (l.273) and the round-16 refusal test (l.957).

After the code-reviewer, I added two stronger assertions to the same new blocks:
- `target === header.nextElementSibling` in R23-F1;
- `aria-expanded === 'false'` before the folded half of R23-N.

These assertions run after assertions that already fail on the old code, so the red result does not change. I did not re-run the red test against the old file, because the in-place mutation rule forbids it.

**Green** (final; `a-round-23/green-final.txt`, verbose):

```
 ✓ … > points every fold button’s aria-controls at its own lane body, outside the header, through fold and unfold (R23-F1) 74ms
 ✓ … > draws the track-name button’s focus ring inset on folded and unfolded lanes (R23-N) 158ms
      Tests  33 passed (33)
```

## 3. Diff summary

`diff -u b-round-22-snapshots/ArrangementLane.tsx` against the live file gives 5 hunks, with 6 added lines and 2 removed lines (`a-round-23/lane-snapshot.diff`):

| Live line | Change |
|---|---|
| 7 | `useId,` in the react import (alphabetical, between `useEffect` and `useRef`) |
| 126 | `const laneBodyId = useId();` |
| 424 | `aria-controls={laneBodyId}` on the fold button (after `aria-expanded`) |
| 434 | the name button class: `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand` |
| 520 | `id={laneBodyId}` on the lane body div (after `ref={laneBodyRef}`) |
| 665 | the `biome-ignore lint/a11y/useSemanticElements` reason, verbatim from DetailPanel l.620 |

Nothing else changed:
- `handleFoldKeyDown` and `handleFoldKeyUp`, the height handle, the drop handlers, M/S, volume, density and every other class are untouched.
- `biome check --write` on the 2 files reported "No fixes applied".

**Test file diff** against the snapshot (`a-round-23/test-snapshot.diff`): **0 removed lines, 59 added lines**. It adds 2 new `it` blocks at the end of the `panel polish 14a` describe. Each block has local closures (`controlled`, `expectInsetRing`). No existing test was changed.

**Final sha256:**
- `ArrangementLane.tsx`: `cdaf07f4…776e`;
- `track-layout.test.tsx`: `fba42d8a…b325`;
- doc 029: `38414675…cefe`.

## 4. The code-reviewer (actual `code-reviewer` subagent run) and my dispositions

Score 9/10, with no Critical, High or Medium findings.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Low | The video lane has no clips. "In the row, outside the header" would also accept the height handle as the target. | **Fixed.** R23-F1 now asserts `target === header(trackId).nextElementSibling` (the lane body) on every lane. |
| 2 | Low | The folded half of R23-N never checks that the fold actually happened. | **Fixed.** It now asserts `aria-expanded === 'false'` on music and video before the re-check. |
| 3 | Low | A folded lane's clips stay in the accessibility tree, so `aria-expanded=false` is a looser promise than "hidden". This is existing behaviour and out of scope. | **Not changed** (scope). Recorded in doc 029 TODO for B. |
| 4 | Nit | The `length > 0` guard comes after the loop. | Kept. The result is the same and the order is readable. |
| 5 | Nit | `querySelector` by clip id vs `contains(node)`. | Kept. The fixture ids are plain. |

The reviewer confirmed:
- the target is always rendered;
- the ids are unique per instance;
- lane body only is the right target, because the volume row unmounts on fold;
- the refs and drop handlers are intact;
- the project rules are met: semicolons, no `any`, no new comments.

## 5. Command tails (verbatim, final run after the review fixes)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-22-tree-sha256.txt   → 50 ": OK", 0 other
$ npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx
      Tests  33 passed (33)
$ npx tsc --noEmit            → exit 0, no output
$ npx vitest run
 Test Files  57 passed (57)
      Tests  1007 passed (1007)
$ npm run build               → exit 0, "✓ built in 2.22s"
$ npx biome check ./app       → exit 0
Checked 323 files in 630ms. No fixes applied.
Found 218 warnings.
Found 1 info.
$ npx biome check <2 owned files>  → exit 0, "Checked 2 files in 46ms. No fixes applied." (0 diagnostics; no unused-suppression on l.665)
$ git status --short | wc -l  → 46 ; diff vs c-round-22 git-status-end: only "> ?? docs/implementation/2026/quarter-IV/029-studio-lab-lane-header-a11y.md"
$ git diff --stat -- app/components/arrangement/ArrangementLane.tsx
 app/components/arrangement/ArrangementLane.tsx | 378 +++++++++++++++++++++----
 1 file changed, 328 insertions(+), 50 deletions(-)      (cumulative vs HEAD, includes rounds 6–22)
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx
 app/components/layout/Header.tsx | 21 +++++++++++++++++++++
$ git diff --quiet HEAD -- app/components/layout/Header.tsx → identical to HEAD
$ node -e "…protected-baseline…"
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

Notes on these results:
- The Biome `./app` warnings and the info are the existing tree. The two files I own report 0 diagnostics.
- I did not record the warning count before my edit, so I cannot show a before/after count for the whole `./app`.
- Vitest: 1007 = 1005 + 2 new tests. The `sfx-library.test.tsx` flake did not appear in either full run.

Gate outputs are saved in `a-round-23/`:
- `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `biome-owned.txt`;
- `sha-tree.txt`, `git-status-end.txt`;
- `red-first.txt`, `green*.txt`, `*.diff`.

## 6. Deviations

1. The two review-driven assertions were added after the red-first run. Following §2.5 ("or reason on the diff when a copy cannot run"), I reasoned on the diff instead of running a scratch copy:
   - each new assertion runs after one that already fails on the old code;
   - in R23-F1, `not.toBe('')` fails before `nextElementSibling` is checked;
   - in R23-N, the first `expectInsetRing` (unfolded) fails before any fold.

   So the red result is unchanged. C's scratch-copy mutation check (R23-U) confirms it independently.
2. **`/check`:** `store/.claude/commands/check.md` runs `npm run check`, which is a repository-wide Biome `--write`. §2.5 limits `--write` to my 2 files, so I ran the scoped equivalent of `/check`:
   - `npx biome check --write` on the 2 owned files;
   - read-only `npx biome check ./app`;
   - `tsc` and `npm run build`.
3. No browser smoke check. The task made it optional and gave it no PASS value. The focus-ring crop and the computed `box-shadow` (R23-N), the fold by click and Space (R23-F1), and the regressions are left to C.
4. None otherwise. No other file under `store/` was touched, and I made no mutation of `store/`.

## 7. Known gaps and carried items (honest)

- I claim no PASS for any acceptance ID. R23-F1, F2, N, R, S, U, Doc and G23-1..3 are for C.
- Code-reviewer finding 3 (folded clips stay in the accessibility tree) is existing behaviour. It is a candidate note for B, not a new bug.
- Carried from the root and the publication checkpoint (unchanged by this round):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the R13-M4 export hard-clip at 0 dBFS (SRW-13);
  - the final commit/push only after everything; the uncommitted round-6..23 tree;
  - the shared `Modal.tsx` focus gap;
  - root GA `scroll` with consent denied;
  - the two foreign agent files;
  - the earlier in-place-mutation deviations (A rounds 17, 19 and 22);
  - the fake Bearer gets 500;
  - the CDP allowlist denies `Input.dispatchMouseEvent`;
  - the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).
- Round 24 (part 2) and SRW-13+ are not started.

## 8. Exact next C checks

1. **R23-S:**
   - `diff -u ../tmp/studio-real-loop/b-round-22-snapshots/ArrangementLane.tsx app/components/arrangement/ArrangementLane.tsx` should show exactly the 6 changes in §3;
   - the same against the snapshot `track-layout.test.tsx` should show only added lines (59).
2. **R23-U:** in a scratch copy outside `store/`:
   - remove `aria-controls={laneBodyId}`, and R23-F1 should fail;
   - remove `focus-visible:ring-inset` from the name button only, and R23-N should fail. The fold button keeps its own inset, so the test must target the name button, which it does.
3. **R23-F1 (browser):**
   - read each lane's fold `aria-controls` and use `document.getElementById`;
   - the 4 values are unique;
   - each target lies inside the same `[data-track-id]` row, outside the header, and is the lane body; on `lay11` it contains that lane's clips;
   - fold and unfold by real click, then fold by Space, with the transport stopped.
4. **R23-N:**
   - at 1440×900 and 1280×720, on a folded lane and on the video lane tight at 52, Tab from fold to name;
   - `:focus-visible` matches and the computed `box-shadow` contains `inset`;
   - take a crop and report the rects;
   - the fold button's `box-shadow` also contains `inset`.
5. **R23-F2:** the fold refusal during a held clip drag shows the status text, the height is unchanged, and after release one click folds.
6. **R23-R:**
   - file drop onto the video lane (the body gained an `id`);
   - library drop onto music at 7;
   - header Tab order on audio and video lanes;
   - M/S on a folded lane; the handle ±8.
7. **G23-1..3** and the real `lay11` WAV export sanity check (864 000 frames reference).
