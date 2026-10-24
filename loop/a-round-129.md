# A — Round 129 report: VISUAL-A V-0.2a (English edit-command messages)

Implementer: A · Date: 2026-10-24 · Task: `current-task.md` (round 129). No commit, push, stash, checkout, reset, install or server restart.

## Start state
- HEAD `77f2763b5e968d7f09683637602668e4a710501d`; `git status --short` was empty.
- Frozen list `b-round-128-r129-tree-sha256.txt` (929 entries): `sha256sum -c --quiet` **OK** at the start.
- 11 grant start hashes (`b-round-128-r129-granted-start-sha256.txt`): **all 11 OK**.

## Pre-edit grep
Saved in `a-round-129/pre-edit-grep.txt`. Note: misplaced `--include` options made that grep scan **every** file under `app/` and `e2e/`. The scan was wider than intended, but the result is still valid.
- E-text hits are only in the 8 granted tests. There are no hits in `e2e/`.
- The other hits are frozen and out of scope:
  - `ArrangementTransport.tsx` l.72/74/177 (its own hint text, V-0.3);
  - `delete-selection-ui` l.143/145/520 (constants for those Transport hints, kept);
  - `all-lane-clipboard` l.481 title and l.490/501 (the ArrangementLane range label `ყველა ხაზი`, V-0.4, kept);
  - `collection.ts` (`Copy:` matched as part of the `WorkspaceCollectionCopy` type name, a false hit).
- The 6 constant names are used only inside the 8 commands. They appear in no test and nowhere in `e2e/`.
- The old X1 text appears only in `strings.ts` and `strings.test.ts`.

## Changed files (full diff: `a-round-129/granted.diff`, vs `b-round-128/r129-granted-start/`)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | New `export const studioEditStrings` with E1–E42: 28 plain strings and 23 formatters. Two small interfaces (`StudioTimeRangeText`, `StudioTrackSpanText`). X1 value is now `The time selection is invalid — no file was created.` No other `studioExportStrings` key or value changed. No imports. |
| `app/contexts/ArrangementContext.tsx` | (a) The import now also brings `studioEditStrings`. (b) The 6 constants `LOOP_REMOVED_MESSAGE`, `CLIPBOARD_EMPTY_MESSAGE`, `DUPLICATE_RANGE_MESSAGE`, `DUPLICATE_EMPTY_MESSAGE`, `GROUP_SPLIT_MISS_MESSAGE`, `CUT_TIME_NEEDS_RANGE_MESSAGE` are **removed** and their uses point at the module; `LOOP_STEP_BLOCKED_MESSAGE` is kept. (c) The string expressions in the 8 commands now use module values or formatters. All ternaries (`range.allTracks`, paste refusal, `hasMaterial`, the loop/marker suffix) and the `?? '—'` fallback stay in the Context. No condition, dependency array or call order changed. |
| `__tests__/strings.test.ts` | Import adds `studioEditStrings`; X1 literal in `EXPECTED_PLAIN_STRINGS` (ST1); new `describe('studioEditStrings (V-0.2a)')` with ST6–ST9. ST1–ST5 keep their structure. |
| 8 tests | Each adds `import { studioEditStrings } from '../strings';` and replaces literals with module references, keeping the same matcher. Georgian track names are kept (`მუსიკა`, `ვიდეო`, `SFX`). |
| `docs/implementation/2026/quarter-IV/105-studio-v0-edit-strings.md` | New doc in Georgian (TEMPLATE sections), status Completed. |

### Deviations (B to rule)
1. **Fragment assertions translated to English fragments.** These Georgian fragments match no module value. Keeping them would make the `not.toContain` checks pass vacuously and the `toContain` checks fail. Each keeps the same matcher:
   - `ArrangementContext.test.ts` (Cut Time over silence): `toContain('ბუფერი არ შეცვლილა')` → `toContain('the clipboard did not change')`.
   - `all-lane-clipboard.test.tsx`, two places: `toContain('ბუფერი არ შეცვლილა')` → `'the clipboard did not change'`, and `not.toContain('სიცარიელე დაიხურა')` → `not.toContain('the gap was closed')`.
   - `markers-ui.test.tsx`: `not.toContain('მარკერი წაიშალა')` → `not.toContain('marker')`. One English fragment that covers both singular and plural, like the Georgian did.
   - Where a module reference expresses the fragment, it is used instead:
     - `all-lane-clipboard`, two places: `not.toContain('SFX ხაზზე')` → `not.toContain(studioEditStrings.onTrack('SFX'))`;
     - `markers-ui`: `endsWith(' 1 მარკერი წაიშალა.')` → `endsWith(studioEditStrings.markersRemoved(1))`.
2. **The 6 constants were deleted** rather than aliased. §2(b) allows either; the gate-128 reviewer had flagged alias constants. In ST9, the check on the constants' declaration lines now has nothing to check.

## `it` counts (regex count of `it(` / `test(` / `it.each(` lines; before → after)
| File | Before → after |
|---|---|
| strings | 5 → **9** |
| delete-selection-ui | 13 → 13 |
| all-lane-clipboard | 14 → 14 |
| ArrangementContext | 21 → 21 |
| markers-ui | 22 → 22 |
| status-announcement-ui | 32 → 32 |
| fader-guards | 63 → 63 (vitest runs 71, from `it.each`) |
| self-disabling-focus | 10 → 10 |
| grid-snap-position | 17 → 17 |

No title was renamed. No `it` outside strings was added or removed.

## Checks actually run
- `npm run typecheck`: **PASS**.
- `npm run lint`: **exit 0**. It reports 218 warnings and 1 info across 461 files; none are in the changed files.
- `npx biome check` (read-only) on the 11 changed code files: **clean**.
- `npx vitest run` on the 19 files in `a-round-129/vitest-list.txt`: **19 files, 386 tests, all green**. Log: `a-round-129/vitest.log` (final run on the final tree: 19/386 green).

| File | Tests |
|---|---|
| strings | 9 |
| delete-selection-ui | 13 |
| all-lane-clipboard | 14 |
| ArrangementContext | 21 |
| markers-ui | 22 |
| status-announcement-ui | 32 |
| fader-guards | 71 |
| self-disabling-focus | 10 |
| grid-snap-position | 17 |
| delete-selection | 10 |
| clipboard | 11 |
| clip-gain | 28 |
| grid-snap-edit | 25 |
| model | 38 |
| gesture-guard | 19 |
| export-dialog-a11y-copy | 9 |
| export-range-ui | 11 |
| export-range | 8 |
| export-wav | 18 |

- Not run (left to the gate): the full suite, `npm run verify` and the build. A did no browser check; the browser rows belong to C.

## Mutations (temporary shell edits with `sed`; files restored by `cp` from a backup and confirmed by `sha256sum -c`: OK)
| Mutation | Result |
|---|---|
| **m1** `deleteClipDone` back to Georgian | **RED**: ST6 and ST8, plus ST4 (`strings.ts` is in ST4's whole-file list). |
| **m2** `'გაყოფა'` as the history label in `splitSelection` | **RED**: ST9. |
| **m3** `copyClipsDone` always `clips` | **RED**: ST7. |
| **m4** single-clip delete status → `deleteClipsDone(1)` | **SURVIVED**: all 8 UI test files green (200 tests). |
| **m4′a** (extra) `onAllTracks` → `onTrack('—')` in `deleteSelection` | **RED**: `delete-selection-ui` › "deletes the window on every lane…". |
| **m4′b** (extra) `splitDone` → `splitClipsDone({count:1})` | **RED**: `status-announcement-ui` HK2. |

Why m4 survived: no UI test asserts the single-clip delete status (or the 2+ clip delete status). This gap existed before this round: the Georgian texts `კლიპი წაიშალა…` had no test hits in the pre-edit grep. Closing it needs a new assertion outside §2's "no other line changes". **Open for B:** add one `toBe(studioEditStrings.deleteClipDone)` / `deleteClipsDone(2)` assertion in `delete-selection-ui` in a later round, or rule it acceptable. The m4′ runs show that the messages the UI tests do check are bound correctly through the module.

## Code review (real `code-reviewer` subagent)
**Verdict: approve, 9/10.** No Critical, High or Medium findings.
- **L1:** `not.toContain(pasteTrackSuffix('SFX'))` was narrower than the original. **Fixed:** now `not.toContain(onTrack('SFX'))`, the exact equivalent of `'SFX ხაზზე'`; tests and Biome rerun green.
- **L2:** fixed English fragments (`'the gap was closed'`, `'marker'`) would pass silently if the module wording changes later. Accepted for this round; B may track it.
- **L3:** the `const e = studioEditStrings` alias in `strings.test.ts` hides uses from grep. Not changed: it follows the existing `const s = studioExportStrings` in the same file. Suggest to B as a deferred Low.
- **Reviewer error:** the review says "mutation m4 caught". That is wrong: m4 survived (see above).
- **Architecture note (for B/root, not acted on):**
  - `strings.ts`: keep. It is a cohesive leaf with one object per area. Whether the inline payload types should become named types fits the checkpoint planned before V-0.3.
  - `ArrangementContext.tsx` l.1759–2089: keep. This region is edited again by every V-0.2 stage (repeat-change signal), but the change is string-only.
  - Fold "conditional copy in formatters vs Context" into the frontend-architect checkpoint already planned after V-0.2c.

## Shell writes (all temporary or outside the store)
1. Created and immediately removed an empty file `app/lib/arrangement/__tests__/strings.test.ts.append.tmp`. A mistaken heredoc; no lasting effect, and it is not in `git status`.
2. Mutations m1–m4′b: `sed -i` on `strings.ts` / `ArrangementContext.tsx`, each restored from a backup under `a-round-129/mut/`; `sha256sum -c a-round-129/mut/pre.sha` OK after each. Backups removed.
3. Files in the loop folder: `a-round-129/{checkpoint.md, pre-edit-grep.txt, vitest-list.txt, vitest.log, granted.diff, end-sha256.txt, mut/pre.sha}`.

All lasting store edits were made with the Edit/Write tools.

## End state
- `git status --short`: 11 ` M` + 1 `??` (doc 105), no other path.
- Frozen list `sha256sum -c --quiet`: **OK**.
- Protected files: `git diff 77f2763` is empty for `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx` and `Modal.tsx`.

End sha256 of the 12 grants (also in `a-round-129/end-sha256.txt`, final):
```
027bb59b17ad8c1a04e7fed58efc841c7f6565e6f7f8f0ad979a87cf9fe3ea52  app/contexts/ArrangementContext.tsx
295240377a1d40310c30cdbed0c69819f33966e701e06f7fdf48ed2d64c36309  app/lib/arrangement/__tests__/ArrangementContext.test.ts
f6843c5bf9f21ae31ea52a54813a7f36d8e3abd612582c86cdcc0e5df4027474  app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
f0a84180a95033de9565d47d66175f2126be4e7e8bc059a288f8c6f99146bab1  app/lib/arrangement/__tests__/delete-selection-ui.test.tsx
44c45c9505db26212983bd2b3ad96865315ae9737f2ad97c429f59c60d86d83b  app/lib/arrangement/__tests__/fader-guards.test.tsx
5b1e55e9455d465cc7250e138ac914ae2b19ecf8f4daa09cd00435075ddbb5bf  app/lib/arrangement/__tests__/grid-snap-position.test.tsx
d77943e23b84c1304da7b28879df73d575107595684896f361961f24210b99b2  app/lib/arrangement/__tests__/markers-ui.test.tsx
1ebd3993fb0fe5e845ddfd72d813da2299a80948bf892d46b64bda4ad587e965  app/lib/arrangement/__tests__/self-disabling-focus.test.tsx
698f7d328af3234f20b9bd0a24689fd9d67cd23ad19382ae59a2fdee3a34ff44  app/lib/arrangement/__tests__/status-announcement-ui.test.tsx
ec4de8abcd757bb64db73da6527e38c490bae0109a4d25828b894a221d290d62  app/lib/arrangement/__tests__/strings.test.ts
371bf673ed114c4c0d2b14d63de2c6dee4f18762fbe9f6715c0dfd46aa0910fb  app/lib/arrangement/strings.ts
b60c0eb72658c2bf5809c2f2c91b0b1487b499b79df7ee3e91f236e842eeeea1  docs/implementation/2026/quarter-IV/105-studio-v0-edit-strings.md
```

## Acceptance criteria A truly passed
- **§2:** only the 12 granted paths changed; frozen list OK; protected files unchanged.
- **§3.1:** ST6–ST9 added (strings 5 → 9) and green.
- **§3.2:**
  - m1, m2 and m3 are red, as required.
  - **m4 NOT met.** It survived; reason and proposal are under Mutations.
- **§4:**
  - typecheck, lint and scoped Biome: PASS.
  - The 19-file list: green.
  - code-reviewer: run, L1 fixed.
- **Not claimed:**
  - any browser row (C);
  - gate rows: full suite, verify, build, e2e smoke.

## Known gaps
- The m4 assertion gap: no UI test checks the delete-clip status.
- The status may read `on the მუსიკა track` until track names are translated (V-0.4/V-0.5), as the task decided.
- E5, E35, E38 and E39 are probably not reachable in the browser and are covered by ST7. E35 is also covered by `all-lane-clipboard`, E38 by `ArrangementContext.test`.

## Exact next C checks
Run the task's §5 rows on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720: T129-TARGETED (the list in `a-round-129/vitest-list.txt`; expect 19 files / 386 tests), SOURCE-SCOPE, AN-REVIEW (`a-round-129/granted.diff`), EDIT-COPY (a–e), UNDO-LABEL, EDIT-LAYOUT, REG-EXPORT-COPY, PX-NET/REG-HYD, and G129-3 last. Pay particular attention to:
- the E19 single-clip delete status in the browser, because no unit test checks it (m4);
- the E36 Cut Time with a marker inside (` 1 marker deleted.`);
- E42 with and without the ` · on the … track` suffix;
- the width of the Undo button `title` / visible label for `Delete time selection (all tracks)`.

Scope completed: V-0.2a implementation (A phase). This is not a claim that the backlog item is done.
