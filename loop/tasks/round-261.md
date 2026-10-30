# Round 261: PERF-HARNESS-STRINGS-DRIFT (systemic, test code only: `perf/**` + doc 195) + RT-FIX-261 (re-check of B's retro corrections)

**Planned by:** B, at the round 260 → 261 planning, 2026-10-30. **Decisions:** D-29z524 (round 260 closed, corrections), D-29z525 (scope ruling), D-29z526 (L11 ruling on A's feedback), D-29z527 (mutant must fail in `perf/`), D-29z528 (browserVerified), D-29z529 (queue).
- **Read first:** `lessons.md` in full. These apply directly: L11 (STOP; see the D-29z526 ruling in §0), L23 (grep before a rename), L26 and L28 (implementation doc), L29 (claims block; this task's claims are in §8), L30 (Biome ignores `perf/`, so use `npm run typecheck`), L38 (perf runs alone).
- **Previous task:** `tasks/round-260.md` (an exact copy of the round-260 `current-task.md`). C's result: `c-round-260.json`. B's reasoning: `b-round-260.md`.
- **Reference first / Ableton / screen budget:** not applicable. This is a test-only round (policy "Not in scope"); nothing in `/studio-lab` changes.

## Baseline: HEAD `7a960c1`, clean tree
- `gates/gate-round-260.json` = `skipped` ("C taskStatus FAIL"; nothing to publish from `store/`). The last published commit is `7a960c1511bfce1fb63d1c3779e1bb4b4ed76119` (gate 259). At planning, `git rev-parse HEAD` = `7a960c1…` and `git status --short --untracked-files=all` was empty (`b-round-260/head-at-planning.txt`, `b-round-260/git-status-at-planning.txt`, 0 bytes) [K1].
- **Frozen:** every tracked file except the 4 grants, **1,114** entries, in `b-round-260-r261-tree-sha256.txt`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-260-r261-tree-sha256.txt` → rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K2].
- **Grants (edit):** `b-round-260-r261-grants.txt`: `perf/lib/page.ts`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/studio-lab-resources.perf.spec.ts`, `perf/studio-lab.perf.spec.ts`.
- **New files:** `b-round-260-r261-new-files.txt`: `perf/lib/app-labels.ts`, `docs/implementation/2026/quarter-IV/195-perf-harness-strings-drift.md`.
- **Not granted:** everything else, especially all of `app/**` (including `app/lib/arrangement/strings.ts`), `perf/budgets*.json`, `perf/lib/report*.ts`, `playwright*.config.ts`, `package.json`, `tsconfig.json`, `biome.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files.

## 0. Why this round
- **Round 260 (RETRO) closed as C FAIL on one document row.** RT-LESSONS failed on C-R260-01 (Low): the L29 rewrite had dropped two obligations. Every other row passed, including G260-AUTH and STUDIO-SMOKE-260 at both viewports (`browserVerified` and `realVerified` true). C also filed C-R260-02 (Low), a wrong provenance phrase in retro §8. B corrected both in this planning (D-29z524), plus the retro §5 grep sentence C flagged as info. RT-FIX-261 (§3) re-checks only those lines. These are loop-artifact Lows, not app polish, so they do not go to `deferred_low_polish`.
- **Outcome fixed in advance** (task 260 §4): an RT row failed, so "Round 261 still runs as above". The planning date is 2026-10-30, before 2026-11-02, so the regression is not due (`regression-last.json`: round 258), and round 261 = **PERF-HARNESS-STRINGS-DRIFT** (`backlog.json` → `systemic_tasks`).
- **Why this task exists:** C-R258-01 (Medium, closed in round 259). The perf harness broke silently for 2 rounds because it located app labels with copied string literals (`Pause`, `… click = playhead`) that the app had renamed. The goal is that renaming or removing a label key in `strings.ts` turns `npm run typecheck` red **in a perf file**, at the gate, before the perf harness can go stale.
- **L11 ruling on A's round-260 feedback (D-29z526):** a spec conflict is two task clauses that **cannot both be met by one change**, or a clause that forces a removed accessible state or a regression against HEAD. That is a STOP. If you find one change that meets both clauses, it is not a STOP: quote both clauses and your change at the top of `a-round-261.md` under "Spec tension (B to confirm)". C rows it. The L11 text itself is unchanged this round.
- **No open Critical or High.** The parked Mediums are unchanged from task 260 §0.

## 1. Scope ruling (D-29z525): what can be wired, and what cannot
B's sweep at `7a960c1` finds **23 literal locator lines** in the 4 granted files, plus 2 literal constants [K3]. They fall into three classes:

**(a) Labels with a `strings.ts` key (11 keys): import them.** Use the key or function, never a copy of its value [K4].

| perf site | literal now | `strings.ts` source |
|---|---|---|
| `page.ts` `playButton` | `'Play'` | `studioPlaybackStrings.playLabel` |
| resources spec `primary` | `'Export WAV'` | `studioExportStrings.formatButtonWav` |
| resources spec `done` | `'Done'` | `studioExportStrings.closeButton` |
| resources spec `getByText(/^WAV created:/)` and `wavDonePattern` | `/^WAV created:/`, `/WAV created: (\d+):(\d+\.\d+)/` | `studioExportStrings.wavDone` (derive the prefix from the function) |
| interactions spec `zoomSlider` | `'Zoom (px/s)'` | `studioViewStrings.zoomSliderLabel` |
| interactions `dragTarget('range')` | `'drag = time selection · click = insert marker'` | `studioClipStrings.rangeBodyTitle` |
| interactions `dragTarget('trim')` | `'Trim — left edge'` | `studioClipStrings.trimStartLabel` |
| interactions `dragTarget('move')` and the resources spec | `/ — drag to move$/` | `studioClipStrings.moveTitle` (derive the suffix from the function) |
| 4 × `name: 'Add'` | `'Add'` | `studioLibraryPanelStrings.add` |
| studio-lab spec active-track buttons | `'Stems — set as the active track'`, `'SFX — …'` | `studioLaneStrings.activeTrackLabel(name)` |
| studio-lab spec group fader | `/^Volume — .+ \(group\)$/` | `studioGroupHeaderStrings.volumeLabel(name)` (derive the regex from the function) |

**(b) 6 labels that exist only inline in components: one perf-local allowlist.** No `strings.ts` key produces these names, and moving them there is an `app/**` change, which this round does not grant [K5]:

| label | app source |
|---|---|
| `Clip Gain — fader` | `ArrangementDetailPanel.tsx` (aria-label) [K5] |
| `Volume — ${mixLabel}` (track fader) | `ArrangementLane.tsx` (aria-label) [K5] |
| `Pan — ${track.name}` | `ArrangementLane.tsx` (aria-label) [K5] |
| `Master Volume` | `ArrangementMaster.tsx` (aria-label) [K5] |
| `Export` (toolbar button text) | `ArrangementTransport.tsx` [K5] |
| `Undo` (button text prefix, `/^Undo/`) | `ArrangementTransport.tsx` (the span text; `strings.ts`'s `'Undo'` lives only inside `undoTitle`, the title attribute) [K4][K5] |

Why not grant `app/**` (D-29z525):
- the systemic entry's `owner_area` is `perf/** only (test code)`;
- the queue put this task before SABA-B-9 stage 2 because stage 2 owns the Transport and Master area, where 3 of these 6 labels live;
- moving accessible names into `strings.ts` would make this an app round that needs browser rows.

Moving them is recorded as the architecture signal **SIG-R261-INLINE-LABELS**, a signal and not a scheduled task. **Stated limit:** these 6 are not drift-protected by the gate after this round.

**(c) Fixture data: perf-local constants.** The track names `Music`, `Stems` and `SFX`, and the demo source title `Soft impact`, are data, not UI labels. Keep them as named constants in `perf/lib/app-labels.ts`. Do not import `app/data/*`: `studio-lab-demo.ts` imports through the `~` alias, which the Playwright loader is not shown to resolve [K6].

## 2. A: what to build
1. **New `perf/lib/app-labels.ts`**, the single point where perf gets app text:
   - Exactly one import from the app: `../../app/lib/arrangement/strings` (relative). `strings.ts` imports only `./shortcuts`, and `shortcuts.ts` imports nothing [K7], so no alias is needed.
   - Export the class (a) values built from the keys and functions in §1.
   - The regexes are built from the functions. For example, the move suffix comes from `moveTitle('')`, escaped. The group fader regex must match `volumeLabel('Group 1')` and must not match `Volume — Music` (the track fader). The WAV prefix and its length pattern come from `wavDone`.
   - Export the class (b) allowlist as data, one entry per label: `{ label, sourceFile, sourceNeedle }`. `sourceNeedle` is the exact substring that is in that file at HEAD (for example `aria-label="Master Volume"`). Use data, not comments (CLAUDE.md: no code comments).
   - Export the class (c) fixture constants.
   - TypeScript strict: no `any`, no `@ts-ignore`, no type assertions (`as`), semicolons. A small regex-escape helper is fine.
2. **The 4 granted files:**
   - import every label, title and fixture text from `./lib/app-labels` (from `perf/lib/page.ts`: `./app-labels`);
   - no string or regex literal that names app text stays in them;
   - test logic, timings, budgets, step names and report fields stay unchanged;
   - the sweep in §3 PERF-SWEEP must print 0 lines.
3. **Doc 195** (`docs/implementation/2026/quarter-IV/195-perf-harness-strings-drift.md`):
   - Georgian, with the TEMPLATE headings in order (L26);
   - l.4 byte-exact `**სტატუსი:** Completed (C round 261 PASS)` (L28);
   - it cites only tests that exist;
   - it states both limits in plain words: (1) a key that still exists but is no longer rendered is not caught by typecheck; (2) the 6 allowlisted inline labels are not drift-protected (SIG-R261-INLINE-LABELS).
4. **Checks you run:**
   - `npm run typecheck` (rc 0);
   - your own mutant: rename one key on a scratch copy and paste the `perf/` error line (see C's row);
   - **`npm run test:perf`, alone (L38)**: no vitest, tsc, build or browser job at the same time. Paste the summary: rc, specs passed, `complete`, aborts, failed budget rows.
   - Do not run the full vitest suite or `npm run verify` (the gate runs them).
   - Biome does not check `perf/` (L30). Do not cite `npx biome check perf/` as evidence.
5. **Code-reviewer:** 4 changed + 2 new files, so ask `code-reviewer`, and pass its Architecture note to B. A Medium+ finding outside the grants is a STOP (L11).
6. **STOP conditions** (L11, written at the top of `a-round-261.md`):
   - a label the perf code needs that is in none of the three classes of §1;
   - a class (a) label whose rendered text differs from its key's value at HEAD (the import would change what the harness locates);
   - `test:perf` failing at a step that passed in round 259 (`c-round-259.json` RR-PERF-259).

## 3. C: what to verify
C writes `c-round-261.md` and `c-round-261.json` as it goes.

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`: <ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-260-r261-tree-sha256.txt` → rc 0;</li><li>`git status --short --untracked-files=all` lists only the 4 grants (` M`) and the 2 new files (`??`);</li><li>HEAD is still `7a960c1`.</li></ul> | Only granted and new files changed. | Any other change, especially `app/**` or a protected file. |
| **PERF-SWEEP** | Run the sweep regex of claim [K3] over the 4 granted files. Also run `grep -nE "'Soft impact'\|WAV created\|drag to move\|set as the active track\|'Master Volume'\|'Clip Gain" perf/lib/page.ts perf/*.perf.spec.ts`. | Both print 0 lines. | Any hit. |
| **WIRING** | Read `perf/lib/app-labels.ts`. | <ul><li>Exactly one app import, `../../app/lib/arrangement/strings`, and no `~/` import.</li><li>Each of the 11 class (a) rows of §1 is read from its named key or function.</li><li>No string literal in the file equals a `strings.ts` value (no copies).</li><li>The allowlist has exactly the 6 class (b) labels, each with `sourceFile` and `sourceNeedle`.</li><li>No `any`, `as` or `@ts-ignore`.</li></ul> | A copied value, a missing key, an extra allowlist entry, or an alias import. |
| **ALLOWLIST-TRUE** | For each allowlist entry, run `grep -cF "<sourceNeedle>" <sourceFile>` at HEAD. Also check that no `strings.ts` key produces the label as an accessible name. | 6/6 needles found (≥ 1). No label has a key; `Undo` counts as having none, because its only `strings.ts` occurrence is inside `undoTitle` (the title, not the name). | A needle not found, or a label with a key (it belongs in class (a)). |
| **MUTANT-PERF** (D-29z527) | Make a scratch copy of `store/` outside `store/` (`rsync -a --exclude node_modules`, then symlink `node_modules`). <ul><li>Control: `npx tsc --noEmit` in the scratch → rc 0.</li><li>Mutant 1: rename `zoomSliderLabel` → `zoomSliderLabelX` in the scratch `strings.ts` only.</li><li>Mutant 2 (fresh copy): rename `moveTitle` → `moveTitleX`.</li></ul> Run `npx tsc --noEmit` each time. | Control rc 0. Each mutant gives ≥ 1 error line whose path starts with `perf/` (TS2339/TS2551). | No `perf/` error on a mutant (the wiring is not proven), or a red control. |
| **TYPECHECK** | `npm run typecheck` in `store/`, once, before the perf run. | rc 0. | Any error. |
| **PERF-RUN (browser)** | `npm run test:perf`, **alone** (L38), once (budget: 2 replacement attempts, only for environment-invalid runs). Contract as in RR-PERF-259 (`tasks/round-259.md`). | <ul><li>rc 0 and 3/3 specs pass.</li><li>Every pass has `complete: true`, 0 aborts and 0 page errors.</li><li>Every budget row passes its contract.</li><li>`harness.audio-running` = 1 and `interact.harness.audio-running` = 1.</li><li>The PERF-1a fader "graph restarts during a drag while playing" rows = 0.</li><li>The deterministic rows are within the round-259 oracle (`c-round-259/latest*.json`); report any delta.</li></ul> | Any abort, failed spec or failed budget. A failure is Medium (C-R258-01 class). |
| **DOC-261** | Doc 195. | TEMPLATE headings in order (L26); l.4 byte-exact (L28); every cited test exists (L26); both limits of §2.3 stated. | A heading missing, a status mismatch, a non-existent test, or a limit missing. |
| **RT-FIX-261** | From the loop root: <ul><li>`diff b-round-260/lessons-before-261.md lessons.md`: only l.18 (L29) differs. `wc -l lessons.md` = 59, still 3 parts.</li><li>The new L29 contains the two inserted substrings exactly: `, and the task's state must satisfy that branch` and `when a command's source changes (position, unit, target), every readout that names the old source is a consumer (acceptance) row; ` (leading comma in the first, trailing semicolon + space in the second). Removing exactly those two substrings from l.18 gives `b-round-260/lessons-before-261.md` l.18 byte for byte (nothing else lost).</li><li>`diff b-round-260/retro-260-before-261.md retros/retro-260.md`: only l.93 and l.121 differ.</li><li>l.121 states that B-R239 → L49 came at the round-240 planning (matches `backlog.json` `retro_candidates` B-R239-BYPASSED-SIDE-EFFECT), and that only B-R237 → L51 came from retro 245.</li><li>l.93 no longer uses `agent-workflow.md` as evidence.</li><li>`backlog.json` has C-R260-01/02 in `open_findings` with a status that begins with `fixed_in_planning_awaiting_c`, plus D-29z524…D-29z529.</li></ul> | All true. | Another line changed, a phrase is missing, or something was lost. |
| **G261-AUTH (browser)** | Fresh anonymous context at 1440×900 only (no app file changed; this is a short guard): <ul><li>`/studio-lab` shows the workspace and the demo badge, and `auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`;</li><li>the token endpoint with no header.</li></ul> | No header → 401, and no token is issued. | Any bypass is Critical. |

- **Gate rows:** full vitest, build, Biome, `npm run verify` and e2e smoke. List them under `"gate"`, never in `"passed"`.
- **`browserVerified`** (D-29z528): true only if PERF-RUN and G261-AUTH ran. This round changes no `/studio-lab` UI, so it has no viewport/screen-budget rows and no Ableton rows (conformance: "not applicable").
- **Run order (L38):** do TYPECHECK and MUTANT-PERF first, then PERF-RUN alone, then G261-AUTH.

## 4. Outcome, fixed in advance
| C result | B at the round-262 planning |
|---|---|
| All rows PASS, planning **before 2026-11-02** | PERF-HARNESS-STRINGS-DRIFT and C-R260-01/02 → closed. Round 262 = **SABA-B-9 stage 2** (master volume to the workspace bottom-right; reference-first section, screen budget, SIG-R261-INLINE-LABELS reconsidered for the `ArrangementMaster`/`ArrangementTransport` labels). |
| All rows PASS, planning **on or after 2026-11-02** | Round 262 = **REGRESSION** (3-day rule), then SABA-B-9 stage 2. |
| After that | L46-CONTRACT-CHECKS, SABA-B-11c (an `ableton-arrangement-expert` consult on the off-grid offset first), SYS-6; SABA-B-7 when Saba answers; SYS-5; STUDIO-PERFORMANCE b-ii; the rest of the queue unchanged (D-29z529). |
| PERF-RUN or MUTANT-PERF fails | Round 262 = a bounded fix-up of this task (same grants). |
| RT-FIX-261 fails | B corrects the named lines again at the round-262 planning; the next round still runs as above. |
| G261-AUTH bypass | Stop. Critical, before anything else. |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published. |

## 5. Neighbour risk
- **The perf harness itself.** A derived regex that is subtly different (an unescaped `(`, a missing anchor) would locate a different element or none. The isolated PERF-RUN is the check; the round-259 oracle catches a changed measurement.
- **The group-volume regex vs the track fader.** The track fader is `Volume — Music` and the group fader is `Volume — <name> (group)`. A regex built too loosely would grab the track fader. §2.1 requires both cases.
- **The gate.** `tsconfig.json` includes `**/*.ts` [K8], so the new import puts `strings.ts` into the perf compile. Any future `~` import added to `strings.ts` would break the perf loader. The doc states this; it is not this round's problem.

## 6. Deliverables
- **A:** the 4 granted files, `perf/lib/app-labels.ts`, doc 195, and `a-round-261.md` (changes, the commands actually run and their results, the mutant line, the `test:perf` summary, the reviewer's notes).
- **C:** `c-round-261.md` and `c-round-261.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), with evidence under `c-round-261/`.

## 7. Root notes
- Commit-ready on C PASS: the 4 perf files, the new perf file and doc 195. No app behaviour changes.
- Still pending and non-blocking: the architecture checkpoint requests listed in task 260 §7. New signal SIG-R261-INLINE-LABELS, a signal only.

## 8. Claims (L29 form; C re-runs each verbatim)
`\|` inside a command is the markdown table escape; run it with `|`.

| Tag | Claim | Command (from `store/` unless stated) | Expected |
|---|---|---|---|
| K1 | gate 260 skipped; HEAD and tree at planning | from the loop root: `python3 -I -c "import json;print(json.load(open('gates/gate-round-260.json'))['status'])"; cat b-round-260/head-at-planning.txt; wc -c < b-round-260/git-status-at-planning.txt` | `skipped`; `7a960c1511bfce1fb63d1c3779e1bb4b4ed76119`; `0` |
| K2 | 1,114 frozen entries; each protected file once | from the loop root: `wc -l < b-round-260-r261-tree-sha256.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-260-r261-tree-sha256.txt; done \| tr '\n' ' '` | `1114`; `1 1 1 1 1 1 1` |
| K3 | the literal sites at `7a960c1` (baseline claim: pipe the sweep regex over `for f in perf/lib/page.ts perf/studio-lab-interactions.perf.spec.ts perf/studio-lab-resources.perf.spec.ts perf/studio-lab.perf.spec.ts; do git show 7a960c1:$f; done` with `grep -cE`, expected `23`, or compare with `b-round-260/perf-literal-sites-at-7a960c1.txt`; on the working tree after A the same sweep is PERF-SWEEP, expected 0) | `grep -nE "name: *['/]\|getByTitle\(['/]\|getByText\(['/]\|hasText: *['/]\|getByLabel\(\|slider\(page, ['/]" perf/lib/page.ts perf/*.perf.spec.ts \| wc -l; grep -n "^const membersSourceTitle\|^const wavDonePattern" perf/*.perf.spec.ts` | `23` (list in `b-round-260/perf-literal-sites-at-7a960c1.txt`); `studio-lab-resources…:53` and `studio-lab…:45` |
| K4 | the class (a) keys | `grep -nE "^\s+(playLabel\|formatButtonWav\|closeButton\|wavDone\|zoomSliderLabel\|trimStartLabel\|moveTitle\|rangeBodyTitle\|activeTrackLabel\|volumeLabel\|add):" app/lib/arrangement/strings.ts` | 11 lines: l.10, 41, 89, 223, 374, 687, 693, 694, 711, 740, 847 |
| K5 | the class (b) inline labels | `grep -n 'aria-label="Clip Gain — fader"' app/components/arrangement/ArrangementDetailPanel.tsx; grep -nF 'Pan — ${track.name}' app/components/arrangement/ArrangementLane.tsx; grep -nF 'Volume — ${mixLabel}' app/components/arrangement/ArrangementLane.tsx; grep -n 'aria-label="Master Volume"' app/components/arrangement/ArrangementMaster.tsx; grep -n '^ *Export$' app/components/arrangement/ArrangementTransport.tsx; grep -n '<span className="truncate">Undo' app/components/arrangement/ArrangementTransport.tsx` | l.429; l.797; l.832; l.208; l.397; l.153 (one hit each) |
| K6 | the fixture title and the alias import | `grep -n "title: 'Soft impact'" app/data/studio-lab-demo.ts; grep -c "from '~/" app/data/studio-lab-demo.ts` | l.61; `3` |
| K7 | `strings.ts` imports only `./shortcuts`; `shortcuts.ts` imports nothing | `grep -c "^import" app/lib/arrangement/strings.ts app/lib/arrangement/shortcuts.ts; grep -n "^import" app/lib/arrangement/strings.ts` | `…strings.ts:1`, `…shortcuts.ts:0`; `1:import { studioShortcutTitle } from './shortcuts';` |
| K8 | `perf/` is type-checked; Biome checks only `app/**`; vitest runs only `app/**` tests | `grep -n '"include"\|"exclude"' tsconfig.json; grep -n '"includes"' biome.json; grep -n "include:" vitest.config.ts` | `"include": ["**/*.ts", "**/*.tsx"]` and `"exclude": ["node_modules"]`; `["app/**/*.ts", "app/**/*.tsx"]`; `['app/**/*.test.{ts,tsx}']` |
