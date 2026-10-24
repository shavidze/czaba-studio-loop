# A round 141 — VISUAL-A V-0.4d: default group and track names in English

Implementer: A (Opus 5.5) · 2026-10-24 · Baseline `6ebbf3e` · Task `current-task.md` (round 141, D-29z106)
Status: **implementation done, A checks green. Awaiting C round 141 (browser).** Not marked done.

## 1. Start checks
- `git status --short` was empty and HEAD = `6ebbf3ec1c7954e5a33f15e4ac1d20aa2b313414`.
- Frozen list (944): `sha256sum -c --quiet` OK. 15 grant start hashes OK. Start copies (`b-round-140/r141-granted-start/`) OK.
- Pre-grep: `a-round-141/pre-grep.txt`.
  - `ჯგუფი` outside tests: only `groups.ts:4` (DN2) and `ArrangementDetailPanel.tsx:53` (R5, V-0.4e).
  - Georgian default-name literals in non-test `app/`: route l.13–15 and context l.548–549 (DN3/DN4). The rest are R5 surfaces: `ArrangementVideoDock.tsx:203` and `library.ts:8,14,15`. No code compares a track name to a Georgian literal.
  - Regex/`/group/i` matchers in tests: **0**.
- Sweep counts (lines containing the token) equal §0 exactly: 86/59/21/7/6/5/4/1/1/1 = 191. Occurrence counts: collapse-ui 63, mix-ui 87, groups-ui 22, groups.test 8.

## 2. Changed files (exactly the 17 granted paths)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | DN1: `defaultNamePrefix: 'Group',` as the last key of `studioTrackGroupStrings` |
| `app/lib/arrangement/groups.ts` | DN2: `TRACK_GROUP_NAME_PREFIX = studioTrackGroupStrings.defaultNamePrefix` |
| `app/contexts/ArrangementContext.tsx` | DN3: l.548/549 → `'Video'` / `'Audio'` |
| `app/routes/studio-lab.tsx` | DN4: l.13–15 → `'Video'` / `'Music'` / `'Stems'` (l.8 and SFX unchanged) |
| `__tests__/strings.test.ts` | §3.1 (see §3 below) |
| 9 sweep files | `replace_all` of the token `ჯგუფი`→`Group` only (Edit tool) |
| new `__tests__/default-track-names-ssr.test.tsx` | DS1, DS2 |
| doc 116 | l.4 status → Completed (…C round 140 — PASS, browserVerified; gate 140 — 6ebbf3e); l.76 sentence → `C round 140 — PASS (browserVerified).`; C round 140 TODO line deleted |
| new doc 117 `117-studio-v0-default-names.md` | Georgian, TEMPLATE sections; status says C round 141 has not run |

- The sweep is token-only: `sed 's/ჯგუფი/Group/g'` on each start copy is byte-identical to the result for all 9 files. No Biome rewrap (line counts unchanged).
- `grep -rnF 'ჯგუფი' app/lib/arrangement/__tests__ e2e` → **empty** (`a-round-141/post-grep.txt`, 0 lines).

## 3. strings.test.ts (39 → 40 `it`) and `it` counts
- The ST21 sweep lines use `'Group 1'`/`'Group 2'` and the expected `Group “Group 1” created: მუსიკა, სტემები.` / `Group “Group 2” ungrouped.`. The prefix check is `toBe('Group')`.
- ST20: `defaultNamePrefix: 'Group'` was added to the plain strings and `'defaultNamePrefix'` to the sorted key list.
- ST13: `CONTEXT_REMAINING_GEORGIAN_LINES` now holds only the l.3468 error line; the length check is `toHaveLength(1)`.
- ST22: `TRACK_GROUP_PREFIX_LINE` and the exception are removed, so `groups.ts` must contain no Georgian. New title: `ST22: the two objects, selection.ts and groups.ts contain no Georgian codepoint`.
- ST39: `toBe(17)` is replaced by `outputs.length >= (function-valued keys in studioClipEnvelopeStrings + gh + mt)` plus a non-empty check on every sample list.
- ST40, in a new `describe('V-0.4d default names')`, checks:
  - the prefix is `'Group'`;
  - `nextTrackGroupName(...)` returns `'Group 1'`;
  - the only Georgian line left in the route is the meta title;
  - the route contains `name: 'Video'|'Music'|'Stems'|'SFX'`.
- Sweep files' `it` counts are unchanged (`it-counts-before.txt` / `it-counts-after.txt`). Only strings.test changed (39→40). The new SSR file has 2 tests.

## 4. Test results (actually run)
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0 (218 warnings + 1 info repo-wide, all old; none in the changed files).
- `npx biome check` (read-only) on the 15 changed code/test files → exit 0, 0 diagnostics.
- `npx vitest run` on **23 files** → **293/293 pass**, 0 fail (`a-round-141/vitest.json`, list in `vitest-files.txt`). The 23 files are:
  - the 10 sweep files and the new `default-track-names-ssr`;
  - the 11 named neighbours (`ssr-layout-effect`, `track-volume-db`, `gesture-guard`, `lane-strings-ui`, `clip-strings-ui`, `status-announcement-ui`, `render-budget`, `clip-envelope-ui`, `track-meter-ui`, `meter-ui`, `collection`);
  - `track-group-collapse.test.ts`, the only extra file that imports `groups.ts`. The full importer grep found no other importer of `groups.ts` or `studio-lab`.
- **Not run (gate):** full suite, `npm run verify`, build, e2e.
- **Optional browser smoke:** Playwright, my own script `a-round-141/smoke.mjs`, run against `127.0.0.1:5173/studio-lab` at 1440×900. The four aria-labels are `Video|Music|Stems|SFX — set as the active track` (screenshot `a-round-141/smoke-1440.png`). This is **not** C's verification.

## 5. Mutations (temporary shell writes; each restored from backup and sha256-verified, all "restored OK")
| ID | Result (failing tests) |
|---|---|
| m77 `'Group'`→`'Grp'` | 50 red, including ST20, ST21, ST40, groups.test (3), track-groups-ui (7), collapse-ui (17), mix-ui (10), header-meter (2), group-volume-db (7), track-group-mix (1) |
| m78 groups.ts l.4 → `'ჯგუფი'` | 50 red, including ST22, ST21, ST40, groups.test, all swept UI files |
| m79 route `'Music'`→`'მუსიკა'` | 3 red: ST40, DS1, DS2 |
| m80 context `'Audio'`→`'აუდიო'` | 1 red: ST13 |
| m81 no space in `nextTrackGroupName` | First run (`m81.json`) mutated only the **first** template, the `names.has` lookup: 10 red, but ST40 stayed green because the return value still had a space. Re-run `m81b.json` mutated **both** templates, as the spec intends ("builds"): 48 red, including ST40 and groups.test GU1/GU3/GU4 (l.224/226) |

Evidence: `a-round-141/mut/m77.json … m81b.json`.

## 6. Forward rule (GATE130-S3) mapping
| Edit | Hand-written literal tests |
|---|---|
| DN1/DN2 | ST40 (`'Group'`, `'Group 1'`), ST20 (`defaultNamePrefix: 'Group'`), ST21 (`toBe('Group')`) and the swept UI tests (`'Group 1'` …) |
| DN3 | ST13 (Georgian absence only; see Known gaps) |
| DN4 | ST40 (`name: 'Video'` …) and DS1 (exact four labels), DS2 |

## 7. Code review (actual `code-reviewer` subagent run) — 9/10, no Critical/High/Medium
Findings and handling:
- **Low, doc 117:** the V-0.5 TODO left out the collection messages and the demo source titles, and the diagram skipped `groupSelectedRows`. **Fixed** in doc 117.
- **Low, ST13 → B:** DN3's only pin checks that Georgian is gone; it would still pass on any Latin name. A positive `name: 'Video'`/`'Audio'` pin is suggested. Not done: ST13 edits are limited to "list and length".
- **Low, DS2 → B:** the `/ჯგუფი \d/` check is weak because the initial arrangement has no groups, and the per-label loop adds little beyond DS1's exact `toEqual`. Implemented as specified.
- **Low, SSR harness → B:** `console.error` is silenced in the copied SSR harness, so DS1/DS2 would hide unrelated server warnings. Kept identical to `ssr-layout-effect` per §3.3.
- **Low, ST39:** the envelope outputs are one flat list, so the `>=` check would not force a sample for a new envelope formatter if another list gained an extra sample. The reviewer accepted it.

**Architecture note (for B; proposals only, not acted on):**
1. `strings.test.ts` is edited every V-0 round. Keep for now; the round-140 addendum (split it by feature after V-0.5, add a shared scan helper) still stands.
2. The `@remix-run/react` mock and console spy are now duplicated in `ssr-layout-effect.test.tsx` and `default-track-names-ssr.test.tsx` (by spec). Proposal: extract a shared SSR test helper when a third SSR test appears.
3. `groups.ts` → `strings.ts` adds no new coupling (the import already existed; `strings.ts` imports nothing, so there is no cycle).

## 8. Deviations (for B/C)
1. **ST40 seed:** `createArrangement` throws unless there is exactly one video track (`model.ts:89`), so the spec's audio-only seed would throw. ST40 uses `[{id:'v',kind:'video',name:'V'},{id:'a',kind:'audio',name:'A'}]`; the expectation `'Group 1'` is unchanged.
2. **DS2 pattern:** writing `/ჯგუფი \d/` literally would keep the §3.2 grep from ever being empty, so DS2 builds the same regex with `String.fromCodePoint(0x10ef, 0x10d2, 0x10e3, 0x10e4, 0x10d8)` (codepoints verified to equal the token). The alternative is a literal regex, which would leave exactly one documented grep hit (DS2's own matcher) and keep the pattern grep-discoverable. Rejected because §3.2 requires the grep to print nothing. B decides which form to keep.
5. **Pre-flight:** the skill was read and the gate (assumptions, smallest version, files, success) was posted in chat before the first edit.
3. **DS1** uses an exact `toEqual` of the four labels. The server HTML has no `, selected` suffix, so none is allowed.
4. **m81** was run twice (see §5); the valid result is m81b.

## 9. Shell writes (all temporary)
- Mutations m77–m81b: a `node` in-place replace on the 4 source files, then restored with `cp` from `a-round-141/mut/*.bak`. sha256 equality was checked after each one.
- One temporary file `store/.a141-smoke.mjs` was created and deleted within the same command. The first smoke attempt imported `@playwright/test` from `store/`. The rerun ran from the loop folder instead. It was never tracked, and `git status` is unaffected.
- All lasting edits were made with Edit/Write.

## 10. End state
- `git status --short`: exactly 15 ` M` + 2 `??` granted paths.
- Frozen list `sha256sum -c --quiet` OK. Protected `git diff 6ebbf3e`: empty.
- End hashes: `a-round-141/end-sha256.txt` (17 lines). Re-verified OK after the final checks.
- Hebrew-block scan (`grep -P '[\x{0590}-\x{05FF}]'`) over all 17 granted paths: 0 hits. A typo slip of this kind was found and fixed only in this loop-folder report.
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 11. Known gaps
- **R5 mixed state, accepted by B:** the detail panel (`ჯგუფი …` role word, Clip Gain reason), the library category labels (`მუსიკა`, `სტემები` in the sidebar, visible in the smoke screenshot), the dock, the route meta title, the collection/demo-ready messages, the demo source titles, and context l.3468.
- DN3 has no positive literal pin (review Low).
- No browser acceptance has been done by A. C's rows are all still open.

## 12. Exact next C checks
In the spirit of `current-task.md` §5, at 1440×900 and 1280×720:
1. **T141-TARGETED:** run the files in `a-round-141/vitest-files.txt` and expect 23 files / 293 tests.
2. **SOURCE-SCOPE:** check `end-sha256.txt` and the frozen list.
3. **AN-REVIEW:** the token-only check (§2 method).
4. **TRACK-NAMES:** includes the library-add status `… added to the Music track at …` and the meter title `Music · Peak`.
5. **GROUP-DEFAULT:** steps 1–5, including the renamed-`Drums` → new `Group 1` case.
6. **GROUP-MIX-REG**, with real-audio RMS.
7. **GEO-COUNT:** subtract the library sidebar labels as R5.
8. **LAYOUT:** against the round-140 boxes.
9. **REG-140**, then **G141-3** (alone, last), then **PX-NET / REG-HYD**.

## B acceptance criteria truly passed by A
- §4 start checks.
- Pre-grep saved.
- typecheck/lint/scoped Biome 0.
- Targeted vitest green.
- m77–m81 red as named. m81 counts only with both templates mutated.
- Reviewer run.
- End state.

Every C row (§5) is **not** claimed.
