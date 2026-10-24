# A — Round 140 report (VISUAL-A V-0.4c) — implementation complete, awaiting C

## Deviations for B to ratify (read first)
1. **B measurement gap — `track-group-mix-ui.test.tsx` l.405.** §0 l.27 says the group Solo `title` has no existing literal. In fact l.405 (`expect(solo.getAttribute('title')).toBe('Solo (Ctrl/Cmd+click ამატებს)')`) pins it. Leaving it would make the suite fail, so I updated it per R6/GH11 to `'Solo (Ctrl/Cmd+click = add to solo)'`. The matcher is still `toBe` and no `it` was added. Pin lines changed: **31** (the 30 listed + l.405). m75 now turns both UM1 (l.405) and HM3 red.
2. **ST33 loop guard (`strings.test.ts`, V-0.3d describe).** ST33 called `expect(value).not.toMatch(…)` on every value of `studioClipEnvelopeStrings`. With the new EV formatters this threw `TypeError: .toMatch() expects to receive a string, but got function` (observed in a run). I added the same `if (typeof value === 'string')` guard that ST33 already uses for `ws`. No coverage is lost, because ST39 checks the formatter outputs. This is outside the §2 wording "imports, ST31, ST38–39".
3. **Biome-forced wrap in `track-group-collapse-ui.test.tsx` (UC4).** The shortened pin at l.659–661 had to go on one line (`expect(...).toBe('ჯგუფი 1 — group, selected');`) to get 0 Biome diagnostics. The matcher is unchanged. The file is 2 lines shorter, so the old pins at l.667/671 are now l.665/669.

None of these touch a non-granted file. The pre-grep found no V-0.4c Georgian text in any non-granted file.

## Start checks
- HEAD was `3f2c187118ee4e3a1a3f71251fbbc05bf00a711e` and `git status --short` was empty.
- Frozen list (943 entries) passed `sha256sum -c --quiet`. The 14 start hashes and the start copies were also OK.
- Pre-grep: `a-round-140/pre-grep.txt` (23 full and partial phrases across `app/**` and `e2e/**`). It found the §0 pins plus l.405. The other hits are other stages or other texts: LibraryPreview `წმ` (V-0.5), DetailPanel `კლიპი` (V-0.4e), the clip-gain-multi `კლიპი` status, export-range `მონიშნული`, and the Undo labels `Mute — ჯგუფი 1` / `Solo — ჯგუფი 1` (data, V-0.4d). `e2e/` had 0 hits.

## Changed files (16 = the grant list exactly)
- `app/lib/arrangement/strings.ts`:
  - 9 keys appended to `studioClipEnvelopeStrings`. The 4 old keys are byte-identical.
  - New `studioGroupHeaderStrings` (9 keys) and `studioMeterStrings` (5 keys) after `studioLaneStrings`.
  - 2 local non-exported interfaces (`StudioClipEnvelopePointText`, `StudioMeterPeakText`).
  - No import. All other objects are byte-identical.
- `ArrangementClipEnvelope.tsx`: strings import and EV1–EV10. EV4 uses `studioClipStrings.historyUnchanged('Envelope')`. All 5 time sites use `studioClipStrings.seconds(x.toFixed(3))`. The local constant names are kept.
- `ArrangementGroupHeader.tsx`: strings import and GH1–GH12. GH2 is `` `${studioLaneStrings.foldTitle} (U)` ``, GH6 is `selectedSuffix` and GH11 is `soloTitle`. The `trackGroupNameLabel` body keeps both branches in the caller.
- `ArrangementTrackMeter.tsx`: import, `trackMeterTitle` body (MT1/MT2) and the sr-only MT3.
- `ArrangementMaster.tsx`: import and `masterPeakLabel` body (MT4/MT5).
- `strings.test.ts`: imports, ST31 (envelope key list, plain-value check by key set, 5 formatter samples), the ST33 guard (deviation 2), and the new describe with ST38 and ST39.
- 6 pin files: the listed lines plus l.405 and the one Biome wrap.
- New `header-meter-envelope-strings-ui.test.tsx`: HM1–HM6.
- `docs/.../113-…md`: the l.21 suffix only.
- `docs/.../115-…md`: l.4 status, the l.72 sentence, and the C round 139 TODO line deleted.
- New `docs/.../116-studio-v0-header-meter-envelope-strings.md`: Georgian, follows the TEMPLATE, status says C round 140 is still pending.

## `it` counts
| File | Before | After |
|---|---|---|
| strings | 37 | 39 |
| clip-envelope-ui | 24 `it(` lines (25 results) | same |
| track-group-mix-ui | 10 | 10 |
| track-groups-ui | 14 | 14 |
| track-group-collapse-ui | 22 | 22 |
| track-meter-ui | 11 | 11 |
| meter-ui | 12 | 12 |
| header-meter-envelope-strings-ui | new | 6 |

## Checks (actually run)
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (existing repo warnings only).
- Read-only `npx biome check` on the 13 changed code and test files: exit 0, 0 diagnostics.
- `npx vitest run` on 17 files: strings, 6 pins, HM, and the neighbours clip-gain-waveform, group-volume-db, fader-touch, gesture-guard, track-volume-db, lane-strings-ui, clip-strings-ui, status-announcement-ui, render-budget. **244/244 passed.** Output is in `a-round-140/vitest.json`, the file list in `vitest-files.txt`, the log in `vitest.log`.
- The prefix selectors `^Volume — ${name}`, `aria-label^="Volume — "` and `Volume — ${trackName}` still match: group-volume-db, track-volume-db and gesture-guard are green.
- **Not run (gate owns them):** the full suite, `npm run verify`, build, e2e.

## Mutations (`a-round-140/mut/`: run.sh, `<id>.diff`, `<id>.log`, `<id>.backup`; each restored, sha256 = pre-mutation)
| ID | Mutation | Red (observed) |
|---|---|---|
| m69 | GH3 `— group` → `— grp` | ST38, plus 11 collapse-ui, 10 mix-ui and 5 groups-ui tests (27 failed) |
| m70 | `clipCount === 1` → `!== 1` | collapse-ui UC4 (l.665/669) and HM4 |
| m71 | EV4 → `'Envelope: no change.'` | clip-envelope-ui EU3 no-change (l.526) |
| m72 | the 4 status sites build `` `${t.toFixed(3)} sec` `` inline | clip-envelope-ui EU2 (l.433), EU3 (l.477/483), EU4 (l.649), EU7 (l.593) |
| m73 | Master over/normal branches swapped | meter-ui: 3 tests (the CLEAR and OVER rows) |
| m74 | `trackMeterTitle` branches swapped | track-meter-ui latch (l.477/485), the Master Peak clear test, and HM5 |
| m75 | GroupHeader `title="Solo"` | HM3 and mix-ui UM1 (l.405) |
| m76 | Georgian `ა` added to `TRACK_GROUP_NAME_TITLE` | ST39 |

## Forward rule (§3.4): key → hand-written UI literal
- EV1–3 → clip-envelope-ui l.117–119 (the Undo label constants)
- EV4 → l.526
- EV5, EV10 → HM1
- EV6 → l.433
- EV7 → l.477
- EV8 → l.483 and l.593
- EV9 → l.649
- GH1, GH8 → HM2
- GH2 → collapse-ui l.473
- GH3, GH6 → collapse-ui l.659, HM2
- GH4 → HM4
- GH5 → collapse-ui l.665/669
- GH7 → collapse-ui l.415, mix-ui l.425/680/689/694, HM4
- GH9 → mix-ui l.397
- GH10 → mix-ui l.403
- GH11 → mix-ui l.405 and HM3
- GH12 → mix-ui l.411
- MT1 → HM5 and track-meter-ui (`მუსიკა · Peak −12.0 dBFS`, unchanged line)
- MT2 → track-meter-ui l.477
- MT3 → track-meter-ui l.475
- MT4 → meter-ui `CLEAR_SUFFIX` and HM6
- MT5 → meter-ui `OVER_SUFFIX` and HM6

## HM notes
- **HM4:** the existing fixtures had no one-clip group. My own fixture in the new file has no clip on SFX, so a real Ctrl+G of `სტემები` + `SFX` holds exactly 1 clip. The overview count is asserted as 1. Nothing is faked.
- **HM6:** it finds the Master tap as `splitters[0]`, the same way the existing `track-meter-ui` harness does. `applySchedule` passes only `trackTaps`, so there is no id-based lookup for the Master (reviewer Low #3, kept and documented here).

## Code-reviewer (the actual `code-reviewer` subagent): 9/10, no Critical/High/Medium
- Low #1 (l.405) and Low #2 (ST33): out-of-grant edits that are needed. They are reported above for B to ratify.
- Low #3 (HM6 `splitters[0]`): kept, for the reason in HM notes.
- Low #4 (doc 116 used წერტილი for the final full stop): fixed to "ბოლო `.`".
- Info: the name `masterPeakLabel` now exists both as the module formatter and as the component's local picker, so a grep finds two definitions. The spec required both. B may rule on it.
- **Architecture note (for B, proposal only, not executed):**
  - **Signal 3:** `strings.ts` (612 lines, 20 objects) and `strings.test.ts` (~2085 lines) change every V-0.x round, and older ST loops need patching when objects gain formatters (ST33 this round).
  - Keep the module as it is now. It is cohesive and has no imports, and the strings-split checkpoint is already open.
  - Proposal: one shared scan helper in `strings.test.ts` for Georgian and `«»` over plain values and formatter samples. Acceptance: same `it` count, ST suites green, m76 still red.
  - **Signal 2 (minor):** the role-name regexes in 3 test files find the group button by its aria-label. This adds to the gate-139 `data-testid` proposal.

## Shell writes (all temporary or outside `store/`)
- `a-round-140/pre-grep.txt`, `vitest.json`, `vitest.log`, `vitest-files.txt` and `end-sha256.txt` (loop folder).
- `a-round-140/mut/run.sh`. Each mutation applied `perl -0pi` to one store source file, ran vitest, then restored it with `cp` from `<id>.backup`. The sha256 matched the pre-mutation hash for all 8.
- Every lasting store edit was made with Edit/Write. Pre-edit copies of the two new files were not needed: they did not exist before.

## End state
- `git status --short`: exactly the 14 ` M` and 2 `??` granted paths (diff against the grants list is empty).
- Frozen list `sha256sum -c --quiet` OK.
- Protected `git diff 3f2c187` (studio.$productId, api.studio-token, auth.ts, AuthContext, Modal, account.downloads, download-routes.test) is empty.
- End hashes: `a-round-140/end-sha256.txt` (16 lines).
- No commit, stash, checkout, install, `--write` or `check:fix`.

## B acceptance (A part) — what I actually passed
- §2 ownership: passed, apart from deviations 1–3 above, which B must ratify.
- §3.1 ST31/ST38/ST39: passed (39 `it`s).
- §3.2 pins: passed, plus l.405.
- §3.3 HM1–HM6: passed in jsdom.
- §3.4 forward rule: passed.
- §3.5 m69–m76: all red as required.
- §4 checks: passed. The full suite, build and e2e are not mine to run.
- **Browser / real-audio rows are NOT verified by A.** They belong to C.

## Exact next C checks
Run the §5 rows at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`:
- **T140-TARGETED:** from `store/`, run `npx vitest run $(cat ../tmp/studio-real-loop/a-round-140/vitest-files.txt)`. The paths in the file are relative to `store/`. It must give 17 files and 244 tests.
- **SOURCE-SCOPE:** end hashes must equal `a-round-140/end-sha256.txt`.
- **AN-REVIEW:** use deviations 1–3 above as the expected out-of-list lines.
- **ENVELOPE, GROUP-HEADER, GROUP-MIX** (including the real paired audio), **METER** (say whether the Master latch tripped at 0 dB or needed +6 dB), **GEO-COUNT**, **LAYOUT**, **REG-139**, **G140-3**, **PX-NET/REG-HYD**.
- Specifically:
  - the singular `1 clip` in the browser, if a one-clip group can be produced;
  - the track meter over title (MT2) and sr-only text (MT3) in a real browser.

## Known gaps
- No browser or real-audio check by A, by design.
- l.405 and ST33 need B's ratification.
- The duplicate `masterPeakLabel` name is a B decision.
- V-0.4d/e and V-0.5 Georgian remains as the accepted R5 mixed state.
