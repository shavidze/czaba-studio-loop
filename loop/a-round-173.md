# A round 173 — V-3c-5b (D-29z138)

## Start
- HEAD `3810816`, clean tree, `sha256sum -c` of the 986 frozen files OK, 6 grant start hashes OK, doc 142 absent.
- Baseline: the 25 files of `b-round-172-r173-vitest-base.txt` → **423/423** (`a-round-173/vitest-baseline.json`, list in `a-round-173/vitest-files.txt`).

## Changed files (all 6 grants were needed, plus 1 new file)
| ID | File | Change |
|---|---|---|
| O1–O3 | `app/components/arrangement/ArrangementOverview.tsx` l.293/305/329 | `rounded-sm` → `rounded-panel` (root, overlay, frame). Clip bars still `rounded-xs`. Nothing else changed. |
| S1 | `app/components/arrangement/ArrangementTransport.tsx` l.159 | readout `rounded-sm` → `rounded-md` |
| S2 | `app/components/arrangement/ArrangementLibraryPreview.tsx` l.251 | preview wave `cn()` base `rounded-sm` → `rounded-md` |
| L1 | `studio-theme-obsidian.test.tsx` (OV1 only) | `rounded-panel` on root+frame, `not.toContain('rounded-sm')` on both (+2 expects), overlay exact string updated, title says rounded-panel |
| L2 | `panel-radius-ui.test.tsx` | counts +Overview:3, 3 new sites, PNR2 title "nine", new PNR4 + PNR5, new constants only. PNR1/PNR3 and helpers unchanged. |
| D1 | doc 141 | l.4 status exactly as required; l.82 TODO struck through |
| D2 | **new** doc 142 | R25–R29, probe table, capsule trade-off/veto, frame overflow note, tests, mutations, TODOs; status `In Progress (awaiting C round 173)` |

## Notes on PNR5 implementation (for C and B)
- The file's `@remix-run/react` `Link` mock drops `data-testid`, so in jsdom PNR5 locates the exit link with `header a[href="/"]` (unique). The mock is unchanged. R28 is also locked in source (exact `StudioWorkspace.tsx` className string, count 1; read-only).
- In the workspace the preview is already ready at mount (first source auto-selected). The **not-ready** state is checked with a second mount whose `loadSource` stays pending; the test asserts the `song` option is `aria-selected="true"` and the wave is `aria-disabled="true"` + `cursor-not-allowed` + `rounded-md`.

## Tests actually run
- After edits, the same 25 files: **425/425** (+PNR4, +PNR5) → `a-round-173/vitest-after.json`.
- `npm run typecheck` exit 0. `npm run lint` exit 0 (218 pre-existing warnings, none in changed files). Read-only `npx biome check` on the 5 changed code/test files: clean.
- `expect(` counts: obsidian 76 → 78, panel-radius-ui 25 → 37 (`a-round-173/expect-counts.json`).
- Mutations (`a-round-173/mutations/m235..m240.json`), each red as required:
  - m235 O1 → `rounded-sm`: OV1, PNR2, PNR4 red
  - m236 O2 → `rounded-sm`: OV1, PNR2, PNR4 red
  - m237 O3 → `rounded-sm`: OV1, PNR2, PNR4 red
  - m238 clip bar `rounded-xs` → `rounded-panel`: PNR2, PNR4 red
  - m239 S1 → `rounded-sm`: PNR5 red
  - m240 S2 → `rounded-sm`: PNR5 red
  - Each restored by Edit and sha256-checked against `mutations/post-edit-sha256.txt`. Deviation: the m235 restore and the m236 mutation were applied in the same batch, so the m235 restore hash was verified together with the m236 restore (OK), not separately.
  - m239 and m240 were re-run after the reviewer-driven PNR5 strengthening (throw + `aria-selected` in the pending branch): PNR5 is still red for both, and both were restored and sha-verified (the JSONs hold the re-run). m235–m238 do not touch PNR5 and were not re-run.
  - After the last restore, `end-sha256.txt` was re-checked: all 7 paths OK.
- Not run (per speed rules): full suite, `npm run verify`, build, e2e, any browser row.

## Code review (code-reviewer subagent, 9/10, nothing blocking)
- should-fix (fixed): PNR5 pending branch clicked the option only `if` present and did not prove a selected source → now throws if missing and asserts `aria-selected="true"`.
- nit (fixed): doc 142 probe table gained the Parent 956×90 / 796×90 row.
- nit (left): the first-mount option click is a no-op (already selected); harmless.
- nit (left, frozen): doc 141 l.67/l.73 still say "six sites"; D1 forbids other lines.
- **Architecture note (verbatim for B):** "Signal 3 (one region changed repeatedly at a high cost): `panel-radius-ui.test.tsx:38–100` and `studio-theme-obsidian.test.tsx:232–237`. Every radius round adds full-`className` exact-string locks to the same arrays. PNR5 (l.98–100, l.537) now also locks the source of a protected file (`StudioWorkspace.tsx`) from a test the round owns, which is a cross-file coupling. → **keep.** It is the only way to prove R28 without mutating a protected file, and B already tracks the fragility as GATE167-TOKEN-TEST-FRAGILITY. No new proposal; this is only so the planner sees the cross-file lock."

## End state
- 986 frozen files OK; protected diff vs `3810816` empty (routes, contexts, styles, ui, icons, view.ts, strings.ts, StudioWorkspace.tsx, root.tsx).
- `git status --short`: 6 × ` M` (the grants) + 1 `??` (doc 142), nothing else.
- `a-round-173/end-sha256.txt` (7 paths) and `a-round-173/diff-vs-start.patch` (vs `b-round-172/r173-granted-start/`, doc 142 as new).

## Acceptance status
- A-side items done: O1–O3, S1, S2, L1, L2, D1, D2; targeted 425/425; typecheck/lint/scoped Biome; m235–m240 red; code review addressed.
- **Not verified by A (C's rows):** RADIUS-V3C5B, OV-CORNERS, NARROW-FRAME, BOX-V3C5B, RV1-V3C5B, FUNC-SMOKE-V3C5B, G173-3, PX-NET/REG-HYD. realVerified for the round depends on C.

## Known gaps
- The capsule frame below 20 px is the accepted R25 trade-off; it is not addressed (vetoable by Saba).
- The frame overflowing the root at the right end (B-R172-OV-FRAME-OVERFLOW) is pre-existing and unchanged.
- No browser check by A.

## Exact next C checks
1. T173-TARGETED: re-run `a-round-173/vitest-files.txt`, expect 425/425.
2. SOURCE-SCOPE: compare against `a-round-173/end-sha256.txt`; frozen list OK.
3. RADIUS: Overview root/overlay/frame computed 10px (used radius on frames < 20 px), clip bars at `rounded-xs`, readout 8px, preview wave 8px in W0/W1, `arrangement-exit` 6px.
4. OV-CORNERS at O0/O1/O2, NARROW-FRAME at O1/O2/O3, BOX/RV1 vs `probe-ov.json` and `d6` r1, FUNC-SMOKE (Overview drag/click/keys/dblclick, readout during play, preview seek, focus rings).
