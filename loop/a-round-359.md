# A round 359 — C-R358-01: tempo, grid, Snap and metronome survive a Studio remount

STATUS: DONE for A (no STOP). Browser, PERF and gate rows are C's and root's.

## Changed files (5, exactly §2.1)
- `app/lib/arrangement/workspace-session-store.ts` (new)
- `app/contexts/ArrangementContext.tsx` (§1.3 item 2)
- `app/components/arrangement/StudioWorkspace.tsx` (§1.3 item 3)
- `app/lib/arrangement/__tests__/workspace-session-remount-ui.test.tsx` (new, B's copy verbatim, sha256 `11addde5…`)
- `docs/implementation/2026/quarter-IV/235-workspace-session-remount.md` (new, Georgian)

**Design:** B's sketch applied verbatim. `git apply b-round-358/sketch/source-delta.patch.txt`, whose sha256 `3bbe9b1d…` matches `patches.sha256`. No design change: one store per provider, saved on unmount from refs, seed effect unchanged, no new `setStatus`. Diff: `a-round-359/source.diff`.

## §3.1 rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS, byte-equal to `b-round-358/claims-359-planning-output.txt` | `a-round-359/claims-pre.txt` |
| A-RED-FIRST | PASS. Test file added first. Before: WS1–WS4 red, WS5 green. After the source: 5/5 green | `a-round-359/ws-before.log`, `ws-after.log` |
| A-TYPE | PASS, `npm run typecheck` rc 0 | `a-round-359/typecheck.log` |
| A-LINT | PASS, `npm run lint` rc 0, 205 warnings (≤ 205; gate 358 `verify.log` also had 205, so none are new) | `a-round-359/lint.log` |
| Biome, scoped (/check, scoped per task) | `npx biome check` on the 4 code files: rc 0, 0 diagnostics. Not run repo-wide; no `check:fix`. `npm run verify` and e2e smoke from `.claude/commands/check.md` are gate rows (speed rules) | `a-round-359/biome-owned.log` |
| A-COVER | PASS, 79 files, 1452/1452 (same as B's sketch). The slowest single test is 9.2 s of a declared 30 s timeout; none is above 50 % of its timeout (L11) | `a-round-359/cover.log` |
| A-MUTANT | PASS. Scratch `/home/runner/a359-scratch` (rsync of `store/` + `node_modules` symlink + scratch-only vitest `cacheDir` `/tmp/a359-vite`; it does not survive the job). M-S1 → WS3. M-S2 → WS1, WS2, WS4. M-S3 → WS2, WS4, WS5. M-S4 → WS4. M-S5 → WS1–WS4. Each equals §1.4. RM1/RM2 green under all five. `store/` git status unchanged (5 entries) | `a-round-359/mutants/m-s*.log` |
| A-REVIEW | done: `code-reviewer` (agentId `a4b07ed8ac461a479`, 19 tool uses, ~226 s) on all 5 files, evidence `a-round-359/code-review.md`. No Critical/High. One Medium (test coverage), ruled Low by §3.2 MUTANT (see below). Three Lows routed. No code changed after the review; only a doc TODO bullet was added (doc-only, so no re-review) | this report |
| A-DOC | PASS. l.4 byte-exact `**სტატუსი:** Completed (C round 359 PASS)`. 7 TEMPLATE `## ` headings in order. Cites only WS1–WS5 and M-S1–M-S5. `grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 | doc 235 |
| A-CLAIMS final | PASS. K2 `f269022 5`, K6 11, K9 `948eb8eee712`, K21 `11 10`, K22 `1 4 1`, K23 `seed-guard 1`, K24 `5 2`. Differs from `claims-359-sketch-output.txt` only on K2/K6 (the scratch values) | `a-round-359/claims-final.txt` |

## Code-reviewer findings and routing (to B)
1. **Medium (reviewer) → ruled Low by §3.2 MUTANT: coverage of the ten fields.** No WS row turns red when some restored fields are dropped. These are A's extra post-review mutants, which are not part of M-S1–M-S5. C should still write its own prediction first.
   - `x-snap` (snapEnabled not restored): **survives**.
   - `x-density` (gridDensity): **survives**.
   - `x-seconds` (secondsGridDivision): **survives**.
   - `x-handchosen` (both hand-chosen flags): **survives**.
   - `x-gridmode` → WS4 red.
   - `x-musical` → WS4 red.

   Evidence is in `a-round-359/mutants-extra/`. I added no rows: K24 pins `ws-rows 5`, and §2.2 forbids other test changes. The reviewer suggested three rows: WS6 (seeded Snap on survives), WS7 (adaptive density survives), WS8 (Snap off before any tempo clip, then remount, then add a bpm clip: Snap stays off and the grid is not forced to 1/4). Doc 235's TODO records the gap.
2. **Low: `metronomeOnRef` is written only during render** (StudioWorkspace.tsx ~l.990–991, `toggleMetronome`/`changeTempo(null)` ~l.2008, 2089–2090). Every other ref is also written inside its handler. If an unmount came before the next render, `tempoBpm: null` could be saved together with `metronomeOn: true`. The reviewer calls this unreachable in the real resize flow, and audio is safe because the bpm effect sends null. Not fixed (sketch verbatim, bug gate).
3. **Low: `ArrangementWorkspaceSessionState` fields are not `readonly`** (workspace-session-store.ts l.17–20). Cosmetic, not fixed.
4. **Low: doc overstated coverage.** Fixed with the TODO bullet in doc 235.
5. **Architecture note (signal, not an instruction).** Join it to A-R357-ARCH-PLAYBACK-SPLIT-HOOKS. The tempo/grid state now has a provider-lifetime copy in `lib/`, there is a new cleanup lifecycle in StudioWorkspace, and the tempo-seed region changed in rounds 357–359. The reviewer says keep it as is for now. Its proposal: extract the ten-field group, the seed effect and the save cleanup into a workspace hook (`useWorkspaceTempoGrid`), with `WorkspaceTempoGridSnapshot` as the contract and WS1–WS5 plus the missing rows as acceptance.

## Known gaps
- A ran no browser row and no PERF row (they are C's, per the task): TEMPO-REMOUNT, SETTINGS-REMOUNT, METRONOME-AUDIO, CLEARED, RELOAD, VIEW-STATE, REMOUNT, FOLLOW, PERF, G359-AUTH.
- A did not run the full vitest suite, the build, `npm run verify` or the e2e smoke (gate rows).
- The coverage gap in item 1 (Low by ruling).

## Exact next C checks
CLAIMS (`bash b-round-358/claims-359.sh` equals `a-round-359/claims-final.txt`), then:
- **SOURCE-SCOPE:** exactly the 5 files above; K6 11.
- **READ:** one store per provider; ten fields restored and saved; seed effect unchanged; no new `setStatus`.
- **UNIT:** the A-COVER command.
- **MUTANT:** C's own mutant, with the prediction written first.
- **Browser and perf:** TEMPO-REMOUNT and SETTINGS-REMOUNT at both viewports; METRONOME-AUDIO; CLEARED; RELOAD; VIEW-STATE (record only); REMOUNT; FOLLOW; PERF (production, alone); G359-AUTH at both viewports.
- **DOCS:** doc 235.

## Scope completed
Only the §2.1 files changed. Protected files are untouched (K6 11). No package change (K9). No commits or pushes.
