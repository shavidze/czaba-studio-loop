# A round 174 — DUX-R-5a: content goes neutral (implementation report)

Date: 2026-10-25 · Implementer: A · Decision D-29z139 · Status: **implemented, awaiting C round 174** (not მზადაა; browser rows not run by A).

## Pre-flight / baseline (verified before any edit)
- HEAD `02c08fd66e7f…`, `git status --short` empty, `git ls-files -co --exclude-standard` = 993.
- `sha256sum -c --quiet b-round-173-r174-tree-sha256.txt` OK; all 8 granted start hashes OK; neither new file existed.
- Base vitest (10 files): **115/115** → `a-round-174/out/vitest-before.json`.
- Baseline DXC6 counts matched B: kept sites each 1; retired tokens present (text-brand/70 ×2, text-accent/70, bg-accent/10, bg-accent/30, 'bg-brand/50' ×1).
- Primitives read: DESIGN_TOKENS, TAILWIND_FIRST, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/new-test.md, docs/implementation/TEMPLATE.md, skills/pre-flight.

## Changed files (all lasting edits via Edit/Write)
| ID | File | Change |
|---|---|---|
| C1 | ArrangementClip.tsx l.824 | `bg-accent/10` → `bg-muted-bg` (video root) |
| C2 | ArrangementClip.tsx l.840 | `bg-accent/30 text-foreground` → `bg-foreground/15 text-foreground` |
| C3 | ArrangementClip.tsx l.859 | ternary removed → `cn('relative min-h-0 flex-1 cursor-text', 'text-muted/70')` (cn and first string kept, per spec) |
| C4 | ArrangementClip.tsx l.878 (l.881 at `02c08fd`) | ternary → `'text-foreground'` |
| O1 | ArrangementOverview.tsx l.17 | `['bg-foreground/80', 'bg-muted/60', 'bg-dim']` |
| P1 | ArrangementDetailPanel.tsx l.221 | `text-brand/70` → `text-muted/70` |
| L1 | detail-panel-polish.test.tsx l.128 | exact string text-brand/70 → text-muted/70 |
| L2 | panel-radius-ui.test.tsx l.50 | exact string text-brand/70 → text-muted/70 |
| L3 | video-fades-ui.test.tsx l.383 | `.toContain('text-foreground')` + new `.not.toContain('text-accent')` on the same element |
| T1 | **new** content-colour-ui.test.tsx | DXC1–DXC6 |
| D1 | doc 141 l.83 | TODO line struck as `- ~~…~~` (bullet marker kept outside, matching docs 135–140 convention) |
| D2 | doc 142 | (a) status Completed (C round 173 PASS, `02c08fd`); (b) R25 known-result line after l.15 (B's exact text); (c) l.75 TODO struck |
| D3 | **new** doc 143 | Georgian, TEMPLATE sections, R30–R33, K1–K6, §0.1 table, split/5b list, tests, mutations, TODOs; status `In Progress (awaiting C round 174)` |

No `style=`, arbitrary values, hex, CSS, `app/styles/`, data-*, aria, handler, layout changes. Protected files untouched (frozen list OK at end).

## Tests and checks actually run
- After edits, base 10 + new file (`a-round-174/vitest-files.txt`): **121/121 passed, 0 failed** (`a-round-174/out/vitest-after.json`). New file: 6/6.
- `npm run typecheck`: clean.
- `npm run lint`: 0 errors, 218 warnings + 1 info — unchanged from gate 173 (`gates/round-173/` log: 218 warnings, 1 info); none in owned files.
- `npx biome check` (read-only) on the 7 changed/new .tsx files: clean, no fixes.
- Not run by A (gate/C): full suite, verify, build, e2e, any browser row.

## DXC4 harness choice
Three audio tracks via `createArrangement([video, music, sfx, ambience])` directly (one collection source `song` reused). Bars located positionally: `[data-timeline-overview]` → `children[1]` → each track row → `:scope > div` (no data-* allowed; same selector shape gate-173 deferred as Low).
DXC5 needed no detail toggle click: after `selectClip('a1')` the detail waveform renders in jsdom.

## Mutations (`a-round-174/mutations/m24N.json`, script `a-round-174/tools/mutate.sh`; each applied, restored, sha-equal)
| ID | Red tests |
|---|---|
| m241 | DXC1, DXC2 (shared body class), DXC6 |
| m242 | DXC2, DXC6 |
| m243 | DXC2, DXC6 |
| m244 | DXC2, video-fades-ui VU2 (the L3 lines) |
| m245 | DXC4, DXC6 (DXC6 red because of the added `'bg-brand'` lock, see below) |
| m246 | DXC5, DXC6, detail-panel-polish (b), panel-radius-ui PNR2 |
| m247 | DXC3, DXC6 |
All required reds observed; none stayed green. The script is stored under `a-round-174/tools/` (as C's tools are under `c-round-N/tools/`); every command in it runs with cwd = store. Final mutation run is after the last test edit.

## Code review (real `code-reviewer` subagent, score 8.5/10, 0 Critical/High/Medium)
Lows and handling:
1. Two fixed strings left in `cn()` at C3/C4 — **kept**: B's §1 explicitly prescribes "the cn( call and its first string stay" (C3) and the single-class form (C4). For B.
2. Positional header/body selectors (`children[0]/[1]`) in DXC2/DXC3 — **kept**: §3.2 defines header as "first child"; tokensOf throws on missing element so no false green. For B (deferred_low_polish candidate with gate-173 finding 4).
3. DXC6 locks `fill-brand` ×1 in the untouched ArrangementLibraryPreview.tsx — required by §3.2 (K5); will need updating in 5b if K5 changes.
4. Source lock missed first ladder entry — **fixed**: added `"'bg-brand'"` to the retired list (0 occurrences; strengthening only, beyond B's literal list — B may veto).
5. video-fades L3 asserts raw class string (`toContain('text-foreground')` would also match `text-brand-foreground`) — **kept**: B's L3 dictates that exact form, "nothing else"; DXC2 covers the same element with tokens.
6. Doc 141/142 edits are deliberate (D1/D2).
Design note (reviewer): Overview ladder not monotonic in contrast (10.1 / 3.3 / 5.7), same shape as before (8.32/2.87/5.69).

**Architecture note (verbatim from reviewer):**
> - Components: none. This is a token-only change with no new state, ownership or coupling.
> - Test layer, signal 3 (repeated expensive change): `content-colour-ui.test.tsx:166-247` copies the fake Web Audio / ResizeObserver harness again, as other arrangement UI tests already do. **Keep it this round**: the harness is test-only and works. The proposal already exists as `ROOT-RECON-GRID-HARNESS` in doc 142's TODO, a separate test-only task. Doc 143's TODO doesn't carry it forward, so the planner may want to.
(A carried it into doc 143 TODO. No extraction done.)

## Evidence files
- `a-round-174/end-sha256.txt` (10 paths), `a-round-174/diff-vs-start.patch` (vs `b-round-173/r174-granted-start/`, new files as /dev/null), `a-round-174/out/vitest-{before,after}.json`, `a-round-174/mutations/*.json`, `a-round-174/vitest-files.txt`.
- `git status --short`: 8 ` M` + 2 `??`, exactly the grants and new files.

## Acceptance status (A side only)
- Passed by A: §1 edits as specified; §3.1 before 115/115 and after 121/121; typecheck, lint (0 errors), scoped biome; §3.2 DXC1–DXC6; §3.3 m241–m247 all red; code-review run.
- NOT verified by A (C rows): CC-COLOUR, NO-BRASS-CONTENT, SELECTION-BRASS, CONTRAST-DUX5A, ENV-VIS, STATE-DISTINCT, RV1-DUX5A, FUNC-SMOKE-DUX5A, RV3-STORE, G174-3, PX-NET/REG-HYD. The colour numbers in doc 143 are B's computation, not measured by A.

## Known gaps
- No browser measurement by A; contrast/brass-pixel claims depend on C.
- Reviewer Lows 1/2/3/5 left as B-mandated; for B ruling.

## Exact next C checks
Run §4 rows at 1440×900 and 1280×720 on http://127.0.0.1:5173/studio-lab: T174-TARGETED (`a-round-174/vitest-files.txt`, expect 121/121), SOURCE-SCOPE (frozen list + `end-sha256.txt`), AN-REVIEW (note the extra `"'bg-brand'"` DXC6 lock and D1 bullet form), CC-COLOUR, NO-BRASS-CONTENT (blur Overview first), SELECTION-BRASS, CONTRAST-DUX5A, ENV-VIS (vs c-round-164 env-table), STATE-DISTINCT (header ≈1.52), RV1-DUX5A, FUNC-SMOKE-DUX5A, RV3-STORE, G174-3, PX-NET/REG-HYD.

Scope completed: DUX-R-5a implementation only. DUX-R-5 overall is not complete (5b pending).
