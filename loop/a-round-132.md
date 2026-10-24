# A round 132: V-0.2c2 tempo, metronome and view strings in English

**Status:** A's implementation is complete. C's browser round is next. The STOP rule did not trigger.

## Start
- HEAD was `c8ff326cab55e06838487d9ebd9c0a2d50c85f58` and `git status --short` was empty.
- The frozen list `b-round-131-r132-tree-sha256.txt` (926 entries) passed `sha256sum -c --quiet`.
- All 18 start hashes in `b-round-131-r132-granted-start-sha256.txt` were OK. The start copies in `b-round-131/r132-granted-start/` were also OK.
- Doc 108 did not exist yet; quarter-IV ended at 107.

## Pre-edit grep
- `a-round-132/pre-edit-grep.txt` holds every old Georgian text searched in `app/**` and `e2e/**`.
- `a-round-132/pre-edit-source-geo-scan.txt` holds every Georgian codepoint found in the three source files.
- All hits are §2 lines, except the frozen `ArrangementTransport.tsx` l.245 `aria-label="Zoom (px/წმ)"` (R4). There were 0 hits in `e2e/`.
- The codepoint scan found exactly the 9 granted lines: tempo l.11, 12, 43, 45; metronome l.10, 11, 115, 117; view l.258.
- The other Georgian lines in tests are the grid-divisions / grid / tempo-row texts that §1.1 (a)–(c) names. None of them pins a T/M/Z text.

## Changes per file
The full diff is in `a-round-132/granted.diff` (`diff -u` against `b-round-131/r132-granted-start/`, 513 lines).

| File | Change |
|---|---|
| `strings.ts` | +3 objects after `studioVideoStrings`:<br>`studioTempoStrings` {`emptyHint`, `cleared`, `invalid({min,max})`, `set({bpm,beatsPerBar})`}<br>`studioMetronomeStrings` {`needsTempoTitle`, `off`, `title(beatsPerBar)`, `on({bpm,beatsPerBar})`}<br>`studioViewStrings` {`zoomReadout(value)`}<br>The text is exactly §1.1, with no keys renamed. The 7 existing objects are unchanged, and the file still has no import |
| `tempo.ts` | +`import { studioTempoStrings } from './strings'`. l.11 becomes `studioTempoStrings.invalid({min: TEMPO_BPM_MIN, max: TEMPO_BPM_MAX})`; Biome wraps it over 4 lines. l.12 becomes `.emptyHint`, l.43 `.cleared`, and l.45 `.set({ bpm: formatTempoBpm(bpm), beatsPerBar: TEMPO_BEATS_PER_BAR })` |
| `metronome.ts` | +import. l.10 becomes `.needsTempoTitle`, l.11 `.title(TEMPO_BEATS_PER_BAR)`, l.115 `.off`, and l.117 `.on({ bpm: formatTempoBpm(bpm), beatsPerBar: TEMPO_BEATS_PER_BAR })` |
| `view.ts` | +import. l.258 becomes `return studioViewStrings.zoomReadout(Math.round(pxPerSecond * 10) / 10);` |
| `strings.test.ts` | Adds imports and a new describe `V-0.2c2 tempo, metronome and view strings` with ST17–ST19 (§3.1). ST1–ST16 are unchanged |
| `tempo.test.ts` | +import. In T10 the 4 literals now use module values with the same `toBe`. `toContain('92.5 BPM')` stays |
| `metronome.test.ts` | +import. In M8 the 4 literals now use module values with the same `toBe`. `toContain('92.5 BPM')` stays |
| `view.test.ts` | +import. The 3 lines use `studioViewStrings.zoomReadout(0.5)`, `(40)` and `(35.3)` with the same `toBe` |
| `tempo-ui.test.tsx` | T-UI1 is in U2 after the `tempoStatusMessage(90)` assertion.<br>T-UI2 is in U5 inside the `for` loop, as allowed; the text is the same for all three values.<br>T-UI3 and T-UI4 are in U8 |
| `metronome-ui.test.tsx` | M-UI1 is in UI1, M-UI2 and M-UI3 are in UI2, and M-UI4 is in UI3. The `'მეტრონომი'` line stays |
| 5 UI pin files (6 lines) | `'40 px/წმ'` becomes `'40 px/s'` with the same `toBe` / `not.toBe` |
| `grid-musical-ui.test.tsx` l.490, `grid-musical.test.ts` l.118 | Use the R3 literal `Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.` with the same `toBe` |
| doc 107 | Only l.4 changed, to the exact text in the task |
| doc 108 (new) | TEMPLATE sections in Georgian: T/M/Z map, facts that must survive, R3 (GATE132-TEMPO-CLEARED-MIXED) and R4, forward rule, glossary, tests and mutations. The status line names C round 132 as still to come |

## `it` counts (before → after)
- `strings.test.ts` went from 16 to 19.
- The other 12 granted test files are unchanged (`a-round-132/it-counts-before.txt` / `-after.txt`).
- No `skip`, `only` or `todo` was added.

## Checks (actually run)
- `npm run typecheck` exited 0.
- `npm run lint` exited 0 with 218 warnings and 1 info. They are pre-existing and none is in the owned files.
- A read-only `npx biome check` on the 17 changed code and test files reported "Checked 17 files … No fixes applied" with 0 diagnostics.
- `npx vitest run` on 21 files passed 364/364 tests. It was run twice, after the edits and again after the mutations were restored. Logs: `a-round-132/vitest-targeted.log`, `vitest-final.log`.
  - Granted files: strings 19, tempo 10, metronome 11, view 41, tempo-ui 12, metronome-ui 10, marker-time-snap-ui 17, grid-snap-ui 20, grid-snap-edit 25, grid-snap-position 17, grid-snap-loop-drop 36, grid-musical-ui 14, grid-musical 12.
  - Neighbours: tempo-window-ui 8, grid-triplet-ui 10, grid-triplet 7, grid 12, grid-snap-menu 39, status-announcement-ui 33, render-budget 7, video-import-status-ui 4. All 8 file names exist.
- No full suite, `npm run verify` or build was run; those belong to the gate.

## Mutations
Each mutation was a temporary shell write. After each one, the file was restored from `a-round-132/mut/saved/` and checked with `sha256sum -c a-round-132/mut/edited.sha256`, which returned OK for all three files.

| Mutation | Change | Red |
|---|---|---|
| m14 | `sed`: `set` drops ` · ${beatsPerBar}/4` | ST18 and U2 (T-UI1) |
| m15 | `sed`: `emptyHint` set back to the Georgian text | ST17, ST19 and U8 (T-UI4), plus ST4 (its whole-file scan of `strings.ts`) |
| m16 | `sed`: `title` drops ` Not included in the export.` | ST18 and UI2 (M-UI2) |
| m17 | `sed`: `view.ts` returns `` `${Math.round(pxPerSecond * 10) / 10} px/წმ` `` | ST18, ST19, `view.test` (zoom readout `it`), grid-snap-ui GS1, marker-time-snap-ui TS1, grid-snap-edit SE2, grid-snap-position SP2 and grid-snap-loop-drop SD1. grid-snap-position SP6 (`not.toBe('40 px/s')`) stays green; a `not.toBe` cannot catch a unit change, and SP2 covers that file |
| m18 | `python3 -I` swaps the branches: the null branch returns `on({bpm: formatTempoBpm(0), …})` and the non-null branch returns `off`. `formatTempoBpm(0)` is there because the parameter is typed `number` | ST18, M8, UI2 (M-UI3) and UI3 (M-UI4) |

## Shell writes (complete list)
1. m14–m17: `sed -i` on `strings.ts` (3 times) and `view.ts` (once). Each was restored with `cp` and checked by sha256.
2. m18: `python3 -I` on `metronome.ts`, restored with `cp` and checked by sha256.
3. A `python3 -I` rewrite of this report, `a-round-132.md` (loop folder). It replaced an abbreviated, partly mistyped hash list with the exact contents of `end-sha256.txt`.
4. Loop-folder artefacts only, nothing in `store/`: `a-round-132/` (grep outputs, `it` counts, vitest logs, `granted.diff`, `end-sha256.txt`, `mut/saved` copies).

All lasting `store/` edits were made with the Edit/Write tools.

## Code review (actual `code-reviewer` subagent)
The verdict was **9.5/10, PASS, with no Critical, High or Medium findings**. The reviewer had no shell; it checked every dash codepoint by grep and confirmed the load order and import graph. Its Lows:
1. `grid-snap-position.test.tsx:349` `not.toBe` is a blind spot. It predates this round and is documented in doc 108.
2. T10 / M8 / view unit pins are now module-against-module by contract. ST17/ST18 and the UI literals are the text guards.
3. `invalid({min,max})` and `zoomReadout(value)` take numbers, as §1.1/§2 prescribe. B may want to clarify "already-formatted values" for c3 / V-0.3.
4. R4 split: `aria-valuetext` is `px/s` while the `aria-label` is `px/წმ`. This is intended and tracked.

None needs a change in this round's scope, so no code was changed after the review.

**Architecture note (verbatim intent, for B):** Signal 3 (a change that keeps repeating at a cost) is at `strings.ts`, which now holds 10 objects. **Keep it for now.** Each round appends one self-contained object, and the leaf invariant is what keeps the load order safe. Splitting it during the migration would touch frozen importers. **Proposal:** after V-0.3 closes GATE132-TEMPO-CLEARED-MIXED, run one bounded task that splits it into `lib/arrangement/strings/` (one leaf file per area plus a named re-export `index.ts`, with the same exported names). Acceptance: ST1–ST19 stay unchanged. This goes to the pending checkpoint `b-round-130-checkpoint-request.md`. It is not an in-round refactor.

## End state
- `git status --short` shows 18 ` M` and 1 `??` (doc 108), with no other path.
- The frozen list passes `sha256sum -c --quiet` at the end.
- Protected files (`studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx`, `Modal.tsx`) have an empty `git diff c8ff326`.
- End sha256 of the 19 paths (exact copy of `a-round-132/end-sha256.txt`):

```
3c7c41e825b694614e33994cd732ceb06c360cace39a5b17451841dafad6c964  app/lib/arrangement/strings.ts
6e53c687c31f1fca9c240bb7671d891dd7a21f758e2be8cf6be4b960e25784b0  app/lib/arrangement/tempo.ts
abc4b8ca1cff55a14fdade5d158cc2dae8bc6e50539e0364563d01457802c302  app/lib/arrangement/metronome.ts
176a3167ae613139735bfbcacb1786e05b2e84800f166f61b3f37212076bc163  app/lib/arrangement/view.ts
ba82f7bfef9d103ba99501a3e70c24d46004c6863cc3978243fae5bf8b1e2c22  app/lib/arrangement/__tests__/strings.test.ts
fb67e2eba97369a6630535f58d52b220ed5160b2628d2fc17de15d1051e27cfa  app/lib/arrangement/__tests__/tempo.test.ts
a7059fe84dd0a3baef22e3b3d8345fb6d349cdec14b1cd06e0d847dbe157b733  app/lib/arrangement/__tests__/metronome.test.ts
0622e636053f4a5ed794edd4de1c878ed4b913cfe8510f9e2851b68bd94a988e  app/lib/arrangement/__tests__/view.test.ts
890c0ea0c7e50736c656471439f733d3fd41bdf7e52161c44f0c0790647cdd15  app/lib/arrangement/__tests__/tempo-ui.test.tsx
c286593c9ee8f9e4c54c235761d5be03b0cf2f9f31248b9f2bda56ad05f77deb  app/lib/arrangement/__tests__/metronome-ui.test.tsx
d7b5bcb44b34bbfd59832975cedbcc6eb5c92716247137c0cf921d49af3d0e05  app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx
8e60d4a835fa3455932756575af732122bd4419805417eb28e728cbeb42017ba  app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
2267e7566d68eb7f70cc7e7cba82600a967e09c5e64fe945c5a84258bec22f1b  app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
4d057dee394b154f1c8d54cf7c0635cfdd7fcc299a240aa36d9d044324cef066  app/lib/arrangement/__tests__/grid-snap-position.test.tsx
9b377059ce3d63f4dc72b741e4b9c6d4832dcb68190a234a7a95d11ac020a087  app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
a6c3543a1be1b4e9f0284a210d0d75fc69c783eb3d7db9b034f442b5794bc079  app/lib/arrangement/__tests__/grid-musical-ui.test.tsx
fc50abd8b33b5cabeeecbe75743452e46ae6ec05a96f3947ed6163848d48881c  app/lib/arrangement/__tests__/grid-musical.test.ts
78cc0bd484ba47381c8582c620ad42df07fbc2647c83f324cee1db4cdc76cb54  docs/implementation/2026/quarter-IV/107-studio-v0-video-import-strings.md
311648f5c8df8b73204984cd84c4b67a7109a20d9ba4b40f295114d753d426d6  docs/implementation/2026/quarter-IV/108-studio-v0-tempo-metronome-view-strings.md
```

## Deviations and notes for B
- **None in scope.** Key names follow §1.1 exactly. `TEMPO_INVALID_MESSAGE` wraps over 4 lines because the one-line form exceeds Biome's 100-character `lineWidth`; it is still the l.11 statement.
- The **backlog glossary** additions (§1.1) are B's task, because `backlog.json` is not A-owned. They are written in doc 108.
- **SP6 blind spot (Low, pre-existing):** under a unit mutation the `not.toBe('40 px/s')` pin cannot go red. Consider it for `deferred_low_polish` if wanted.

## B acceptance criteria truly passed by A
- §2 file ownership: exactly 18 M + 1 ??; frozen OK; protected unchanged.
- §1.1 text: exact, with every required fact present (reviewer-confirmed).
- §3.1 ST17–ST19 and §3.2 T-UI1–4 / M-UI1–4: present and green.
- §3.3 m14–m18: each turned its named tests red, with SP6 noted under m17.
- §4: typecheck, lint, scoped Biome, the 21-file vitest list and code-reviewer were all run.
- **Not claimed:** any browser row (TEMPO, METRO, ZOOM, GEO-COUNT, LAYOUT, REG-131, G132-3, PX-NET). Those belong to C. The full suite, verify and build belong to the gate.

## Exact next C checks
1. **T132-TARGETED:** the same 21-file `npx vitest run` list must give 21 files / 364 tests.
2. **SOURCE-SCOPE** and **AN-REVIEW:** use `a-round-132/granted.diff` and doc 108.
3. **Browser, both viewports:**
   - TEMPO (a)–(d), including the R3 mixed status;
   - METRO (a)–(e);
   - ZOOM: readout = `aria-valuetext`, matching `^\d+(\.\d)? px/s$`;
   - GEO-COUNT, with the subtractions named in the task;
   - LAYOUT: the bars-strip hint and the zoom readout widths change only because of their text;
   - REG-131;
   - G132-3, run last;
   - PX-NET / REG-HYD.
