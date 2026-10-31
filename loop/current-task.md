# Round 294: FIX-PD-1c3. Gate-293 fix-up: GATE293-T1 (Medium). The Store theme-marker guard must know the narrow screen

**Planned by:** B, at the round 293 → 294 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z732:** round 293 is **C PASS**, with `browserVerified` and `realVerified` both true and 13 of 13 rows passing (`c-round-293.json`). C-R292-01 is closed on that evidence. Gate 293 then **failed** [K1, K5]: the full suite ran 226 files, and 1 failed, `store-theme-tokens.test.ts` ST6. Nothing was published. FIX-PD-1c stays open as **მოწმდება**, not **მზადაა**: it passed C but has not passed the gate.
- **D-29z733:** GATE293-T1 is **Medium**, following the GATE276-T1 precedent: a stale test that blocks publication. It is caused by B's round-292 sweep (§9).
- **D-29z734:** this round's scope: ST6, the TH4 title, and doc 218 (§3).
- **D-29z735:** rulings on round 293's INFO items and A's Architecture note (§2).
- **D-29z736:** L23 gains an evidence clause (§9).
- **D-29z737:** the order after this round (`b-round-293.md` §6).

**Owner:** A. **Verifier:** C. **Grants:** §4 (3 paths).
- **No app source changes.** Only two test files and one doc change.
- No Store page, auth, cart, checkout, purchase or protected file is touched.

## Baseline: HEAD `88b23dd` [K1] + the working tree from rounds 292 and 293 (9 paths) [K2]
- Gate 293 is `failed` [K1], so HEAD is still `88b23dd`.
- The 9 paths from rounds 292 and 293 are uncommitted and are **kept**. They include round 293's edits to `studio-lab.tsx`, the NG5c test and doc 218. A re-implements nothing (loop policy 6).
- **Frozen list:** `b-round-293-r294-tree-sha256.txt`, 1,162 entries hashed on the current tree; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
  - It has the same paths as the round-293 list.
  - It differs from that list only in the 3 files round 293 changed, which is the same result C's SOURCE-SCOPE row reported.
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-293/claims-294.sh` **before editing**. Its output must equal `b-round-293/claims-294-output.txt`. Any difference is a STOP (§8).
- **Publishing:** root publishes rounds 292, 293 and 294 together after C PASS and the gate.
  - That covers the 9 paths plus `app/lib/__tests__/store-theme-tokens.test.ts`, **10 paths in all**.
  - `studio-theme-obsidian.test.tsx` and doc 218 are already among the 9.

## 0. Read first
1. `lessons.md` (every role), especially L11, L12, L23, L28, L29, L52 and L56.
2. This task.
3. `gates/round-293/verify.log`: search for `ST6`. The failure is at test l.690 and reads `expected { total: 4, script: 2 } to deeply equal { total: 3, script: 1 }` [K5].
4. B's sketch, pre-run on a scratch copy (`/tmp/b294-scratch`; the store tree was not touched):
   - `b-round-293/sketch-st6.diff` and `b-round-293/sketch-th4-title.diff`;
   - the run in `b-round-293/sketch-tests.log`: 6 files, 90 tests pass, and Biome reports no fixes on the 2 files;
   - mutants: `b-round-293/mutant-st6-store-marker.log` and `mutant-st6-old-map.log`, both red;
   - the build: `b-round-293/scratch-build.log`, rc 0. Gate 293 stopped at the test step, so the build never ran there.
5. A's primitives: `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

## 1. Why
**GATE293-T1** (`gates/gate-round-293.json`, `gates/round-293/verify.log`) [K5]:
- ST6 is in `app/lib/__tests__/store-theme-tokens.test.ts`, at l.684, with its totals at l.690 [K6]. It scans every non-test file under `app/` and pins the exact set of files that contain `data-studio-theme`. Its purpose is that **no Store markup** picks up the Studio's Obsidian theme.
- Round 292 added the marker to `components/arrangement/StudioNarrowScreen.tsx` l.89 [K7], by design. Its B-THEME row passed C: on a phone, the narrow screen is the only Studio surface, and it carries the marker only when the workspace is not rendered.
- TH4 (`studio-theme-obsidian.test.tsx`) was updated in round 292 to allow that file [K9]. ST6, which is the same guard seen from the Store side, was not.

**Ruling (D-29z734):** `StudioNarrowScreen.tsx` is Studio markup under `components/arrangement/`, not Store markup.
- ST6's allowlist gains that one entry, and its totals become `{ total: 4, script: 2 }`.
- The guard stays an **exact per-file map**. It does **not** become a folder rule, so any new marker anywhere still turns it red. The Footer mutant proves this (§5).

## 2. Rulings on round 293 (L10)
| Item | Ruling |
|---|---|
| C-R292-01 | **Closed** on C round 293 evidence (B-NARROW-PREVIEW: RMS 0 at 100 ms to 10 s on both viewports and at 390). It is publishable once the gate passes. |
| INFO-C293-K15 (claim K15 counted the whole file) | **Accepted.** It was a B claim-wording gap. This round's claims count only what they say. |
| INFO-C293-DOC-L21 | **Scheduled now** (§3.3): this round touches doc 218 anyway. |
| INFO-C293-BASS-NAME | Noted. The option's accessible name is `BassStem00:16.000` under the group heading "Synthetic demo · Night Pulse". Rows here use the visible text `Bass` scoped to the library. |
| INFO-C293-AUTH-ATTEMPT1 | Noted. One environment-invalid attempt was replaced inside C's budget. |
| A's Architecture note: one context `silenceAll()` method instead of the route's informal stop list | `architecture_signals` as **A-R293-ARCH-SILENCE-ALL**. Not scheduled: `ArrangementContext.tsx` is frozen, and the current stop list has a SWEEP row (L49). It is a candidate whenever a task next unfreezes the context. |
| A-R292-REVIEW-L-TH4-TITLE (Low, deferred) | **Fixed now** under the bug-gate exception ("the round already owns that code and it costs little"). It concerns the same marker and has the same cause. Only the title changes, and B pre-ran it green (`sketch-th4-title.diff`). The Low closes when C passes this round. |

## 3. What A changes

### 3.1 `app/lib/__tests__/store-theme-tokens.test.ts`, ST6 only (exactly `b-round-293/sketch-st6.diff`)
- l.690: `{ total: 3, script: 1 }` becomes `{ total: 4, script: 2 }` [K6].
- In the `linesByFile` map, add `'components/arrangement/StudioNarrowScreen.tsx': 1,` as the first key, in alphabetical order, before `StudioWorkspace.tsx`.
- **Do not change** the title, the helper `studioThemeMarkerLinesByFile`, any other row in the file, or any other line.

### 3.2 `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`, TH4 title only (exactly `b-round-293/sketch-th4-title.diff`)
- The l.187 title [K9] becomes:
  `TH4: the data-studio-theme marker exists only on StudioWorkspace, StudioNarrowScreen and in the app.css selector`
- The body and its map are already correct [K9: the map has `StudioNarrowScreen.tsx`]. Do not change them.

### 3.3 `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md`
- **l.4** becomes exactly `**სტატუსი:** Completed (C round 294 PASS)` [K10]. This is the L28 re-dispatch rule: the rewrite of N is implicitly granted.
- **l.21** (the "wide-ის შემდეგ შევიწროებული" bullet) [K11]:
  - Replace `playback-ს `togglePlayback`-ით აჩერებს` with:
    `playback-ს `togglePlayback`-ით, ხოლო library preview-ს `stopLibraryPreview`-ით აჩერებს`
  - Nothing else on that line changes. This is INFO-C293-DOC-L21.
- Under **პრობლემები და გადაწყვეტები**, add one entry after the C-R292-01 entry, in the same Problem → Solution style. In Georgian it says:
  - Problem (GATE293-T1, Medium): the Store-side guard ST6 in `store-theme-tokens.test.ts` pinned the theme marker to `StudioWorkspace.tsx` and `app.css`. The narrow screen's marker therefore broke the full suite, and gate 293 failed.
  - Solution: ST6's exact map gains `StudioNarrowScreen.tsx` (total 4, script 2). The guard stays per-file, so a marker on Store markup still fails it.
- **Testing (l.66, the TH4 line [K11]):** append ` ST6 (store-theme-tokens) განახლდა: ზუსტ map-ში დაემატა `StudioNarrowScreen.tsx`; TH4-ის სათაური ასახავს ორივე Studio-ს ზედაპირს.`
- Cite only ids that exist (L26). Do not create a new doc [K12].

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/lib/__tests__/store-theme-tokens.test.ts` | §3.1 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | the TH4 title only (§3.2) |
| `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md` | l.4, l.21 and the §3.3 additions |

**Frozen:** every other entry of `b-round-293-r294-tree-sha256.txt`. That includes:
- all app source: `studio-lab.tsx`, `StudioNarrowScreen.tsx`, `StudioWorkspace.tsx` and `app.css`;
- the other test files: `studio-narrow-gate-ui`, `studio-focus-ring`, `panel-radius-ui` and `library-row-strings-ui`;
- every Store file, including `Footer.tsx`;
- the 7 protected files [K4];
- `package.json` and the lock file.

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §6 CLAIMS deltas).
- `npm run typecheck` and `npm run lint`. `npx biome check` on the 2 test files: rc 0, with no new ignore.
- **Covering set (the K8 SWEEP: every test file that mentions the marker, plus the Store focus neighbour):** `npx vitest run` on:
  - `app/lib/__tests__/store-theme-tokens.test.ts`
  - `app/lib/__tests__/store-focus-ring.test.ts`
  - `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`
  - `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`
  - `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx`
  - `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx`

  Expected: 6 files and 90 tests, all passing (B's scratch run). Report the counts, and every test above 50 % of its timeout (L11).
- **Mutants on a scratch copy** (never in `store/`):
  - (a) Add `data-studio-theme="obsidian"` to the first `<footer` in `app/components/layout/Footer.tsx` [K14]: ST6 must turn red.
  - (b) Restore the old ST6 map and totals: ST6 must turn red.

  Restore the copy and `cmp` it afterwards.
- `npm run build` is **not** required of A. It is a gate row, and B's scratch build passed.
- **code-reviewer:** the real subagent is **required** because 3 paths change (speed rules). Pass its Architecture note to B.

## 6. Acceptance (C)
Browser rows run in Playwright Chromium against `http://127.0.0.1:5173`, with fresh contexts and empty storage. Load each page once, untimed, first (L38).

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Differences only in: K3 (rc 1, failing only on the 3 §4 paths); K6 (`totals l.` empty, because the old literal is gone; `StudioNarrowScreen in file: 1`; the line count is 746); K9 (old-title hit 0); K10 `Completed (C round 294 PASS)`; K11 (`stopLibraryPreview on l.21: 1`; `ST6/GATE293 mentions` ≥ 2; the TH4 line number may move by the added entry's line count). K2 becomes 10: the one new dirty path is `store-theme-tokens.test.ts`. Every other K line is identical |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly 10 paths: the 9 above plus `store-theme-tokens.test.ts`. `sha256sum -c` on `b-round-293-r294-tree-sha256.txt` fails only on the 3 §4 paths. The 7 protected files are unchanged. **No non-test, non-doc file differs** |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 6 files and 90 tests pass. ST6 and TH4 are present by name. None is above 50 % of its timeout |
| UNIT-MUTANTS | scratch copy | (a) Footer marker → ST6 red; (b) old map → ST6 red; the scratch restore diff is empty |
| B-MARKER (what ST6 guards, in the real browser) | 1440×900 and 1280×720; then 390×844 | `/studio-lab` wide: exactly 1 `[data-studio-theme="obsidian"]`, on the workspace root, and `body:has([data-studio-theme="obsidian"])` matches. `/studio-lab` at 390×844 (direct load): exactly 1 marker, on the narrow screen root. `/` and `/store` at 1440×900: **0** markers. Marker presence is the only pass criterion: the Store also uses a dark palette, so body colour is not compared. If `/` or `/store` returns ≥ 500 or does not render its main landmark, mark that half BLOCKED with the reason, not PASS. Screenshots of each page |
| B-DESK-SAME | 1280×720, 1440×900 | 0 differing pixels against `b-round-291/probe/desk-5173-*.png` [K15], with the same method as rounds 292 and 293. This shows that a test-only round left the desktop untouched |
| G294-AUTH | fresh context | `/studio-lab` anonymous (badge at 1440, narrow state at 390), `auth_user` null; `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`; the token API returns 401 without a header, and no token |
| DOC-218 | doc | l.4 is byte-exact `**სტატუსი:** Completed (C round 294 PASS)`. l.21 names both `togglePlayback` and `stopLibraryPreview`. The GATE293-T1 Problem → Solution entry is present. ST6 is cited and exists. Every other cited id exists |
| gate | — | The full suite (ST6 included), build, Biome, `verify` and `test:e2e:smoke` are root's gate rows |

**Carried, not re-run:**
- the round-293 rows: B-NARROW-PREVIEW, B-NARROW-MIX, B-RESIZE-KEEP, B-NARROW-WIDE and B-NARROW-LOAD;
- the round-292 rows: B-BOUNDARY, B-THEME, B-AX, B-FOCUS-ORDER, B-PREVIEW, B-SEND, B-AUDIO-ERROR, B-NET and B-JOURNEY-292.

SOURCE-SCOPE proves that every app source file is byte-identical to the tree C passed in round 293. C may re-run any carried row if SOURCE-SCOPE shows otherwise.

**Adjacent behaviour that could break:**
- the Store pages picking up the Studio theme (B-MARKER, ST6 mutant a);
- the Studio theme on the narrow screen (B-MARKER at 390; TH4, NG tests);
- desktop pixels (B-DESK-SAME).

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** the Store never wears the Studio theme, and both Studio surfaces do.
- **Ableton:** not applicable.
- **Reference-first:** not in scope. This is a test- and doc-only gate fix-up.
- **Screen budget:** not in scope, because nothing visible changes (B-DESK-SAME).

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-294.md` and change nothing else if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- either ST6 mutant stays green;
- the fix needs any path outside §4, any app source file in particular;
- Biome asks for a new ignore;
- a grep of `data-studio-theme` in `app/**/__tests__`, `perf/**`, `e2e/**` and `tests/**` finds a test file not in the K8 list.

## 9. Why we missed it (gate-found; short)
- **B spec (round 292):** the covering set listed "the two folder scanners", `studio-theme-obsidian` and `studio-focus-ring`. Both live in `app/lib/arrangement/__tests__`.
  - Round 292's K13 counted the marker only in non-test `.tsx` files.
  - Nobody grepped the new token across `app/**/__tests__`. ST6 lives in `app/lib/__tests__` and scans the whole `app/` tree, so it was never run.
  - L23 already demands that grep root. This was an **execution gap**: a hand-picked list where L23 asks for a grep.
- **A self-check:** A ran the covering set B named. That set had no Store test in it.
- **C:** by the speed rules, C does not run the full suite.
- **Gate:** it caught the failure, as designed.
- **Rule (D-29z736):** L23 gains one clause, with no new line. When a task **adds** a marker, data attribute or class that a repo-scan test pins, B greps that token across every test root (`app/**/__tests__`, `perf/**`, `e2e/**`) and adds every hit file to the covering set. That is the claims `SWEEP`; this round's is K8. Evidence: GATE293-T1 (1×). lessons.md stays at 59 lines.

## 9b. Deliverables
- **A:** `a-round-294.md`, with:
  - the changed files;
  - the covering-run counts and timings;
  - typecheck, lint and Biome;
  - both mutant results;
  - the reviewer's findings and its Architecture note.

  A STOP goes at the top.
- **C:** `c-round-294.md` and `c-round-294.json`, with evidence under `c-round-294/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish rounds 292, 293 and 294 together after C PASS and the gate. The changing paths are the 10 listed in SOURCE-SCOPE.

## 10. Claims (`b-round-293/claims-294.sh`; expected output `b-round-293/claims-294-output.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `88b23dd`; gate 293 `failed`; gate 291 commit `88b23dd` |
| K2 | `git status --short --untracked-files=all` has 9 lines |
| K3 | frozen list 1162 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | gate-293 `verify.log` has the ST6 assertion text (2 hits) and `Test Files 1 failed \| 225 passed (226)` |
| K6 | `store-theme-tokens.test.ts` 745 lines; ST6 at l.684; totals `{ total: 3, script: 1 }` at l.690; 0 `StudioNarrowScreen` mentions |
| K7 | SWEEP, marker in non-test app source: `StudioWorkspace.tsx:2752`, `StudioNarrowScreen.tsx:89`, `app.css:3905`, `app.css:3906` |
| K8 | SWEEP, test files that mention the marker (roots `app perf e2e tests`): `store-theme-tokens`, `panel-radius-ui`, `studio-focus-ring`, `studio-narrow-gate-ui`, `studio-theme-obsidian` |
| K9 | TH4 title at l.187, 1 old-title hit; the TH4 map already has `StudioNarrowScreen.tsx` (1) |
| K10 | doc 218 l.4 `**სტატუსი:** Completed (C round 293 PASS)` |
| K11 | doc 218 l.21 is the latched bullet (1), with 0 `stopLibraryPreview`; 0 `ST6`/`GATE293` mentions; the TH4 testing line at l.66 |
| K12 | 0 quarter-IV docs start with 219 |
| K13 | B's artifacts exist: the two sketches, `sketch-tests.log`, the two mutant logs, `scratch-build.log`, `backlog-before-294.json` |
| K14 | `Footer.tsx` has 0 markers and 1 `<footer` |
| K15 | C-293 evidence and the `b-round-291/probe/desk-5173-*.png` baselines exist |
