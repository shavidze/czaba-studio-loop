# A round 136 — V-0.3c Marker row and marker menu in English

**Status:** implementation complete; A checks green. C round 136 (browser) still to come. Whole backlog NOT complete.

## Start state
- HEAD `70f1e4270028a8b46a734ae9647bbc0db7982244`; `git status --short` empty at start.
- Frozen list (940 entries): `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-135-r136-tree-sha256.txt` from `store/` → OK.
- 9 start hashes (`b-round-135-r136-granted-start-sha256.txt`): all OK. Start copies `b-round-135/r136-granted-start/`: `sha256sum -c` OK.

## Pre-edit grep
- Every MK Georgian text grepped in `app/**` and `e2e/**`. Hits were only at B's §0 positions: MarkerRow 16, MarkerMenu 4, and pins in markers-ui (10), marker-edge-nav-ui (3), markers-move-ui (6) and status-announcement-ui (4). `e2e/`: 0.
- Other hits are other areas, not MK texts, and were left alone:
  - `ArrangementGroupHeader.tsx:32` (`F2: სახელის შეცვლა`, the group title);
  - `ArrangementClipEnvelope.tsx:326` and `clip-envelope-ui:649` (`წაიშალა`, the envelope point);
  - `StudioWorkspace:954/964`, `track-groups-ui:613/627` and `strings.test:1336–1337` (group rename, V-0.3d).
- `«` in app/e2e: 23 lines (`a-round-136/pre-grep-guillemet.txt`). All are on the marker surface or in the frozen group rename.
- Partial forms (`toContain(`, `startsWith(` …) with Georgian or `«` near marker/flag/menu:
  - markers-ui 285/288/485: fixture names; they stay and still pass;
  - markers-ui 290/343, marker-edge-nav 398 and status-announcement 678: granted.
- **No stop-rule case.**

## Changed files (9 M + 2 ??)
- `app/lib/arrangement/strings.ts`: appended `interface StudioMarkerTimeText` (not exported) and `export const studioMarkerStrings` (MK1–MK21, keys as in §1.1). Other objects untouched (one EOF hunk). Still no import.
- `ArrangementMarkerMenu.tsx`: the import, 3 labels and the menu aria-label (`menuLabel(markerName)`).
- `ArrangementMarkerRow.tsx`: the import plus l.53–55, 219, 241 (same ternary order; Biome wrapped it onto 2 lines), 299, 314, 323, 342, 352 (`renamed?.name ?? marker.name` kept as the argument), 367, 384 (still a local `const message`), 397, 692, 708, 724, 775, 780 (`\n` and the hint stay in the caller) and 831.
- `strings.test.ts`: the import specifier plus a new `describe('V-0.3c marker strings')` with ST28–ST30 (helpers `EXPECTED_MARKER_PLAIN_STRINGS`, `MARKER_FORMATTER_SAMPLES` and `GUILLEMET`).
- 4 pin files: exactly the 23 lines, as hand-written English literals with the same matcher:
  - markers-ui: diff touches only l.277, 290, 319, 343, 370, 417, 426, 437, 443 and 516;
  - edge-nav: 371, 375, 398;
  - move-ui: 181, 318, 453, 480–482;
  - status-ann: 404, 405, 678, 687.
- New `marker-strings-ui.test.tsx`: MS1–MS3. The fake audio harness is copied from markers-ui, not imported.
- Doc 111: exactly l.4 and l.146 changed and l.150 deleted (GATE135-DOC111-STATUS).
- New doc 112, `112-studio-v0-marker-strings.md`, in Georgian.
- Full diff: `a-round-136/granted.diff`.

## `it` counts (before → after)
`it` declarations, `it.each` counted once:

| File | Before | After |
|---|---|---|
| strings.test | 27 | 30 |
| markers-ui | 22 | 22 |
| marker-edge-nav-ui | 11 | 11 (including one `it.each`) |
| markers-move-ui | 18 | 18 |
| status-announcement-ui | 33 | 33 |
| marker-strings-ui | new | 3 |

No `skip`, `only` or `todo`.

## Tests run
- `npx vitest run` on 16 files (all names exist):
  - granted/new: strings, markers-ui, marker-edge-nav-ui, markers-move-ui, status-announcement-ui, marker-strings-ui;
  - neighbours: markers, marker-snap, marker-time-snap, marker-time-snap-ui, track-groups-ui, navigation-strings-ui, edge-navigation, self-disabling-focus, pending-status, render-budget.
- Result: **274/274 passed**, 16 files.

| File | Tests |
|---|---|
| strings | 30 |
| markers-ui | 22 |
| marker-edge-nav-ui | 12 (11 declarations; the `it.each` runs 2 cases) |
| markers-move-ui | 18 |
| status-announcement-ui | 33 |
| marker-strings-ui | 3 |
| markers | 30 |
| marker-snap | 25 |
| marker-time-snap | 5 |
| marker-time-snap-ui | 17 |
| track-groups-ui | 14 |
| navigation-strings-ui | 5 |
| edge-navigation | 21 |
| self-disabling-focus | 10 |
| pending-status | 22 |
| render-budget | 7 |

  Evidence: `a-round-136/vitest-16.json`. The 16-file run was made before the doc-only L1 fix; no code changed after it (end hashes for code equal the mutation-base hashes).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It reports 218 warnings and 1 info repo-wide; none are in the 9 changed code/test files.
- Read-only `npx biome check` on the 9 code/test files: "Checked 9 files … No fixes applied", 0 diagnostics.
- Not run (gate's job): full suite, `npm run verify`, build, e2e.
- §3.4 forward rule: every MK key has at least one hand-written UI literal:
  - MK1–4: MS3, MV9;
  - MK5, MK16–18, MK20, MK21: MS1;
  - MK6: MS2, MV6, SK5 + SK9;
  - MK7: MU4, MV6, SK11;
  - MK8/9: MU6, EN4;
  - MK10: MU2, MS2;
  - MK11, MK13, MK14: MS2;
  - MK12: MU7, MS2;
  - MK15: MS2, MV1;
  - MK19: MU1, MS1.

## Mutations
Runner: `a-round-136/mutate.py`. Results: `mutations.json` and `mut-*.json`. Every mutation was restored and checked by sha256 (`restored: true`), and the base hashes were re-checked afterwards (`mut-base.sha256` OK).

| Mutation | Red tests | Required met |
|---|---|---|
| m38 | ST29, markers-ui MU4 (l.370), markers-move-ui MV6 (l.453), status-ann SK11 (l.687) | yes |
| m39 | markers-ui MU6, marker-edge-nav EN4, status-ann SK6 + SK10 | yes |
| m40 | markers-ui MU1 (l.290 negative pin), MS2 | yes |
| m41 | marker-edge-nav EN5 (l.398 negative pin; the success branch is reached), status-ann SK10 | yes |
| m42 | status-ann SK11 (l.678 selector), MS1, ST30 (also ST29) | yes |
| m43 | markers-move-ui MV9 (l.480), MS3 | yes |
| m44 | ST30, MS1 | yes |

## Code-reviewer (invoked, read-only)
- Verdict **9/10** (9.5, rounded down). No Critical, High or Medium findings.
- **L1:** doc 112 said marker-edge-nav-ui has 10 `it`. It has 11 (my grep missed the `it.each`). **Fixed** in doc 112.
- L2 (info): `const ms` alias in strings.test, the same style as the existing `s`. Kept.
- L3 (info): the copied test harness in the new file, as §3.3 asked. Noted.
- **Architecture note for B/root:** strings.ts gained one more area object (append-only, +30 lines) for the 4th V-0 round in a row. That is a weak Signal 3, and **keep** is correct now. The reviewer proposes running the pending strings-split checkpoint after V-0.3d, keeping the `~/lib/arrangement/strings` path (barrel) and the ST scans. This is a proposal only; I did no refactor.

## Shell writes
- `/tmp/mu-before`: a temporary copy outside the repo, deleted.
- Two shell `>>` appends to this report (`a-round-136.md`) as checkpoints. This file has since been rewritten with Write.
- Loop-folder artefacts in `a-round-136/`: `pre-grep-guillemet.txt`, `mut-base.sha256`, `mutate.py`, `mut-backup-*` (3), `mut-m38..m44.json`, `mutations.json`/`.err`, `vitest-16.json`/`.log`, `typecheck.log`, `lint.log`, `granted.diff`, `end-sha256.txt`.
- Temporary mutation writes to `strings.ts`, `ArrangementMarkerRow.tsx` and `ArrangementMarkerMenu.tsx` by `mutate.py`, each restored from its backup and sha256-verified.
- All lasting store edits were made with Edit/Write. I did not run `--write`, `check:fix`, stash, checkout, a commit or an install.

## End state
- `git status --short`: 9 ` M` + 2 `??` (the 11 granted paths), no other path.
- Frozen list `sha256sum -c --quiet`: OK at the end.
- Protected: `git diff --stat 70f1e42` on `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx`, `Modal.tsx`, `account.downloads.tsx` and `download-routes.test.ts` is empty.
- End sha256 of the 11 paths is in `a-round-136/end-sha256.txt`:
  - strings.ts `c902e8d6…`
  - MarkerRow `88f8a537…`
  - MarkerMenu `09edb564…`
  - strings.test `688d50d7…`
  - markers-ui `35c5805a…`
  - marker-edge-nav-ui `4cd5044f…`
  - markers-move-ui `40538c05…`
  - status-announcement-ui `d9117d6e…`
  - doc 111 `8f973895…`
  - marker-strings-ui `0908a07a…`
  - doc 112 `e31fd9f1…`

## Deviations
- None from §1.1/§2. Biome-style wraps:
  - l.241: the ternary is on 2 lines;
  - l.323 and l.397: the `added`/`moved` object arguments are on multiple lines.
  §1.1 allows these.
- strings.test.ts: four module-level consts sit just before the new describe: `EXPECTED_MARKER_PLAIN_STRINGS`, `ms`, `MARKER_FORMATTER_SAMPLES` and `GUILLEMET`. ST28–ST30 use them. They follow the ST14–16 / ST23–25 pattern (`EXPECTED_VIDEO_PLAIN_STRINGS`, `VIDEO_FORMATTER_SAMPLES`, `GRID_FORMATTER_SAMPLES`), and the reviewer passed them. They are part of the new describe's block. Nothing else in the file changed.
- MS1 seeks the playhead to 3 s before pressing M, because the fixture has a `Start` marker at 0 and M there correctly refuses with a duplicate. This is a test setup choice only.

## B acceptance criteria truly passed by A
- §2 ownership and scope; §3.1 ST28–ST30; §3.2 all 23 pins; §3.3 MS1–MS3; §3.4 forward rule; §3.5 m38–m44; §4 typecheck, lint, scoped Biome, the 16-file vitest list and the code-reviewer.
- Not claimed: any C browser row (MARKER-*, GEO-COUNT, LAYOUT, REG-135, G136-3, PX-NET). I did no browser run this round; §4 does not require one.

## Known gaps
- In the browser, a status or label could still differ from jsdom, for example the flag title newline rendering or the menu width at 1280. C checks these.
- `StudioWorkspace`'s group-rename status still uses the Georgian sentence that MK12 replaced (accepted R4; V-0.3d).

## Exact next C checks
- T136-TARGETED: run the same 16-file list; expect 274/274.
- SOURCE-SCOPE: 9 M + 2 ??; frozen OK; protected diff empty; the end hashes above.
- AN-REVIEW: `a-round-136/granted.diff` against `b-round-135/r136-granted-start/`.
- Browser rows at both sizes: MARKER-HEADER, MARKER-ADD (a–d), MARKER-EDIT, MARKER-MOVE (MK6 announced once while ArrowLeft is held), MARKER-NAV, MARKER-MENU, GEO-COUNT (0 Georgian / 0 `«»` on the marker surface), LAYOUT (menu inside the viewport), REG-135, G136-3, PX-NET/REG-HYD.
