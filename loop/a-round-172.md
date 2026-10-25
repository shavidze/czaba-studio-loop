# A — Round 172 report: V-3c-5a — 10 px panel radius (`--radius-panel`)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-25 · Task: `current-task.md` (D-29z137) · Baseline HEAD `13ad2bd`

## Start checks (all OK)
- HEAD `13ad2bd63db5…`, `git status --short` empty.
- `sha256sum -c --quiet b-round-171-r172-tree-sha256.txt` → OK (983 frozen).
- 7 granted start hashes match; the 2 new files did not exist.
- Pre-flight run; primitives read: DESIGN_TOKENS, TAILWIND_FIRST, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; prompts new-test, studio-feature.

## Changed files (numstat vs 13ad2bd)
| Path | Change | ± |
|---|---|---|
| `app/styles/app.css` | T1: `  --radius-panel: 0.625rem; /* 10px - Studio panels */` inside `@theme` after `--radius-md` (l.132) | +1 |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | P1 l.221, P2 l.702: `rounded-sm` → `rounded-panel` | 2/2 |
| `app/components/arrangement/ArrangementVideoDock.tsx` | P3 l.901, P4 l.920 (`cn()` base string): `rounded-sm` → `rounded-panel` | 2/2 |
| `app/components/arrangement/ArrangementGridMenu.tsx` | P5 l.175: `rounded-md` → `rounded-panel` | 1/1 |
| `app/components/arrangement/ArrangementMarkerMenu.tsx` | P6 l.126: `rounded-md` → `rounded-panel` | 1/1 |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | L1: `WAVEFORM_BOX_CLASS` one token | 1/1 |
| `docs/…/140-…md` | D1: l.4 exact status text; l.114 TODO struck through | 2/2 |
| **new** `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` | PNR1, PNR2, PNR3a/b/c (5 `it`, 25 `expect(`) | new |
| **new** `docs/…/141-studio-v3c5a-panel-radius.md` | D2, status `In Progress (awaiting C round 172)` | new |

All 7 grants were needed. Menu row constants, Overview and every R24 site untouched.

## Tests actually run
- Baseline (20 files, before edits): **357/357** → `a-round-172/vitest-baseline.json`.
- After (21 files, `a-round-172/vitest-files.txt`): **362/362**, 0 failed → `a-round-172/vitest-after.json` (final run after review fixes).
- `npm run typecheck` exit 0; `npm run lint` exit 0 (pre-existing warnings only).
- `npx biome check` on the 6 changed/new TS/TSX files: clean. `app.css` is not checked by Biome (`biome.json` includes only ts/tsx) — the token is locked by PNR1 instead.
- `expect(` counts (`a-round-172/expect-counts.txt`): `detail-panel-polish` **53** (unchanged); `panel-radius-ui` **25** (24 in the first file version; final 25 after review fix).
- **Mutations** (`a-round-172/mutations/m227…m234.json`; shell sed, restored from backup, sha256 verified equal each time):

| Mutation | Red tests | Restored |
|---|---|---|
| m227 token 0.75rem | PNR1 | ✔ (re-run after the PNR1 review fix) |
| m228 token removed | PNR1 | ✔ (re-run after the PNR1 review fix) |
| m229 P1 → rounded-sm | PNR2 + detail-panel-polish l.358 (PNR3 does not render P1; the task lists only PNR2 + polish for it) | ✔ |
| m230 P2 → rounded-sm | PNR2 + PNR3b | ✔ |
| m231 P4 → rounded-sm | PNR2 + PNR3a | ✔ |
| m232 P3 → rounded-sm | PNR2 + PNR3a | ✔ |
| m233 P5 → rounded-md | PNR2 + PNR3c | ✔ |
| m234 Grid row const → rounded-panel | PNR2 + PNR3c | ✔ |

All eight mutations were re-run against the final test file (after the review fixes); the results are identical. `end-sha256.txt` and the 983 frozen files were re-verified OK afterwards.

## Code review (actual code-reviewer subagent)
- Score 9/10, no blocking issues. **Architecture note: none** ("the diff only swaps class tokens").
- Nits addressed: `@theme` end now found by brace matching (not `'\n}'`); marker-row count decoupled; doc 141 mentions the struck TODO in doc 140.
- Nits not addressed (reported): obsidian body end = first `}` (safe while TH1 keeps that block flat); `//` comment stripper on CSS would mis-handle a future protocol-relative `url(//…)` (none exists today).

## End checks
- 983 frozen files: `sha256sum -c` OK.
- Protected diff vs `13ad2bd` empty (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `Modal.tsx`, `app/contexts`, `ArrangementOverview.tsx`, `ArrangementExportDialog.tsx`, `strings.ts`, `studio-lab.tsx`).
- `git status --short` = 7 ` M` (grants) + 2 `??` (new test, doc 141); nothing else.
- `a-round-172/end-sha256.txt` (9 paths, verified), `a-round-172/diff-vs-start.patch` (vs `b-round-171/r172-granted-start/`, new files as new).
- No commit/push/stash/install/build/e2e/browser by A.

## B acceptance criteria truly passed by A
- T1, P1–P6, L1, D1, D2 implemented exactly as §1.
- PNR1–PNR3 present and green; 357 baseline still green; `detail-panel-polish` `expect(` count 53.
- m227–m234 each red as required.
- typecheck, lint, scoped Biome clean; code-reviewer run.
- **Not claimed:** every browser row (RADIUS, BOX, RV1, FUNC-SMOKE, G172-3, PX-NET) — C's; full suite/verify/build — gate.

## Known gaps
- Biome does not lint `app.css`; only PNR1 guards it.
- No browser evidence from A (by design). Before-values for P1/P2/P5/P6 boxes do not exist (per task).
- The global `@theme` token is visible to Store; PNR2 locks that only the six Studio sites use it.

## Exact next C checks
1. T172-TARGETED: `npx vitest run $(cat a-round-172/vitest-files.txt)` → 362/362.
2. SOURCE-SCOPE: `sha256sum -c a-round-172/end-sha256.txt` and the 983 frozen list; git status as above.
3. AN-REVIEW: read `a-round-172/diff-vs-start.patch`.
4. RADIUS-V3C5A: computed `border-*-radius` 10px on P1 (D1), P2 (D2, Ctrl+click group), P3/P4 (V1 floating), P4 (V0 compact) and P5/P6 menus; menu rows 6px; Overview root/overlay/frame still 6px; 4× corner crops incl. P4 over a real video frame (no square corner).
5. BOX-V3C5A, RV1-V3C5A (d6 via d6-fontwrap), FUNC-SMOKE-V3C5A, G172-3, PX-NET/REG-HYD at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`.

## For B / root
- Architecture note: none.
- Q-V3C5-MODAL-RADIUS still open (protected `Modal.tsx`).

Scope completed: V-3c-5a implementation (A part). Not marking the stage or backlog complete; awaits C round 172.
