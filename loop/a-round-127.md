# A round 127 — VISUAL-A V-0.1: Export copy → English via `strings.ts`

STATUS: STOP — B ruling needed (D-29z92 §4 stop rule: "a string cannot be moved without changing structure or behaviour"). All other work is complete and preserved; only one decision (P1 below) blocks the round from closing green.

## 1. Start state
- HEAD `608187fdf279d9b579c279f3c536b27be74c0eea`; `git status --porcelain` empty.
- `sha256sum -c --quiet b-round-126-r127-tree-sha256.txt` (from `store/`): **OK at start**.
- Dev server :5173 neither started nor stopped by A. A did not use a browser this round, so there is no `a-browse.json` use.

## 2. Pre-edit greps
- **Needle grep:** 51 stage-1 fragments over `app/**/*.test.ts(x)` and `e2e/`. Stage-1 text is asserted only in the 18 granted tests. No stop-rule hit.
- **Shared fragments in non-granted tests.** These are other strings, not misses:
  - `ვიდეოს ორიგინალი ხმა` in `fader-click`, `fader-touch`, `track-volume-db`: the lane fader aria-label (V-0.4);
  - `შედის` in `markers-ui`, `markers`, `metronome`: a marker name and metronome copy;
  - `წმ)` in `grid-snap-clip-edges`, `grid-snap-edit`: trim status copy;
  - track names (`ვიდეო`, `მუსიკა`, `სტემები`) in fixtures: user content.
- **`e2e/`:** no Georgian codepoint.
- **Source-reading tests on owned files, kept intact:**
  - `track-group-mix-ui` reads the dialog: `isTrackAudibleWithGroups(videoTrack, arrangement)` is still present.
  - `clip-fades`, `graph`, `clip-gain`, `envelope` and `track-pan` read `graph.client.ts` from `renderArrangementWav`: still no `pan`, `setTrackGain` or `setClipGain`. The new Error text has no `pan`.
  - `export-progress-ui` reads `ArrangementContext.tsx` for the dynamic import: unchanged.
  - All of these were run, and all are green.
- **Negative guards left Georgian on purpose** (retired strings, not stage-1, absent from sources): `export-mp3` `RETIRED_REASON`, `export-range-ui` `queryByText('მხოლოდ მონიშნული მონაკვეთი')`.
- **Test-owned fixture text left as is:** the `გახსნა` opener buttons in `export-dialog-focus`; `'Mute — მუსიკა'` in `master-ui` (not export); `OVER_SUFFIX`/`CLEAR_SUFFIX` in `meter-ui` (V-0.4); Video Fade titles and status in `video-fades-ui` (not export).

## 3. BLOCKER P1: two buttons with the accessible name "Close"
- **Cause.** The frozen `app/components/ui/Modal.tsx` l.123 ✕ button has `aria-label="Close"`. With the §1.1 glossary, the footer button text is now `Close` too, so one dialog has two buttons named "Close".
- **User impact (a11y regression, not only a test problem).** During a render, a screen reader announces two "Close" buttons: the footer one is disabled, and the ✕ one works. Before this round the names differed ("Close" vs "დახურვა"). C's EX-KEYS row ("Accessible names are now English") would find it in the browser too.
- **Failing tests.** 15 tests fail, all with `Found multiple elements with the role "button" and name "Close"`. The R3 literal swap was applied to each of these sites:

  | File | Failing tests | Query site(s) |
  |---|---|---|
  | `export-dialog-a11y-copy` | NC3 | l.393 → l.409 after formatting |
  | `export-dialog-hold-enter` | HE1–HE7 | `closeButton()` helper l.146 |
  | `export-mp3` | MX1, MX5, MX6 | l.371, 459, 503 |
  | `export-range-ui` | XU3, XU5 | `closeDialog` helper ~l.237, and l.509 |
  | `master-ui` | overload alert | l.704 |
  | `video-fades-ui` | VU4 | l.517 |

- **The collision is the only cause.** In mutation m3 (`Close` → `Closee`), every one of these tests went green (57-test run: only ST1 red).
- **Options for B, listed neutrally with their cost:**
  1. Relabel the footer button (for example `Done`). This changes the §1.1 glossary term; it removes the duplicate name; no test-query change is needed.
  2. Give the footer button an `aria-label`. This relaxes R2 (aria wiring). The reviewer warns that exact-name queries could then silently match the ✕ instead.
  3. Relabel the Modal ✕ (for example "Close dialog"). `Modal.tsx` is frozen and shared. `e2e/auth-modal.spec.ts:65`, `e2e/accessibility.spec.ts:60` and the export test helpers select `button[aria-label="Close"]`, so this needs a separate task and owner.
  4. Relax R3 for the 8 query sites (switch to the existing textContent-based `dialogButton`). This is a matcher change, and the duplicate name stays in the product.
- The code-reviewer recommends (4) to unblock and then (1) or (3) as the real fix. A makes no recommendation; B rules.

## 4. Diff summary per file (24 ` M` + 3 `??`)
- `strings.ts` (new):
  - one export, `studioExportStrings`: 46 plain strings and 21 formatters;
  - a private `StudioTimeSpanText` interface;
  - **no imports** (leaf), no assertions, no `as const`.
- `ArrangementExportDialog.tsx`: every Georgian string → module.
  - JSX text that mixed values became formatter calls: the description, the scope cards, the loop note, the video-sound label, the no-sound note, the Master-mute note and the Master-gain note. `textContent` is identical.
  - No class, `id`, `aria-*`, `data-testid`, handler or order change.
- `export-progress.ts`: import plus the 4 progress texts.
- `export-cancel.ts`: import; the 2 constants alias the module.
- `export-wav.client.ts`: import; FAILED aliases the module; STALLED = `wavWorkerStalled(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000)`. This closes GATE103-S2.
- `graph.client.ts`: import (l.11), the `formatExportOverloadWarning` return, and the empty-project Error (l.465). Nothing else.
- `ArrangementContext.tsx` changes only these:
  - the import (l.148);
  - `MASTER_MUTED_EXPORT_SUFFIX` (l.205);
  - the literals inside `exportWav`/`exportMp3` (hunks l.3030–3303).
  - The MP3 load-timeout text is now `encoderLoadTimeout(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS / 1000)`. That is still 120, and the variable is already inside the body. `WEB_AUDIO_UNAVAILABLE_MESSAGE` (l.186) and every other status text are untouched (V-0.2).
- 18 granted tests: literal → module value or formatter with the same inputs, plus one import each. Titles that quoted a Georgian label were renamed to the English label (FR1/FR3/FR4/HD1–HD3, four in `export-dialog-focus`, TH1).
- `strings.test.ts` (new): ST1–ST5.
- `docs/implementation/2026/quarter-IV/104-studio-v0-export-strings.md` (new): Georgian doc, status In Progress, with the **full key | Georgian | English | where map (R5)**.

## 5. Tests (`npx vitest run`, 33 files)
- **Result:** 451 passed, 15 failed. All 15 are P1, listed in §3.
- **`it` counts per granted file, before = after:**

  | File | `it` | File | `it` |
  |---|---|---|---|
  | export-cancel-ui | 12 | export-progress-ui | 8 |
  | export-cancel | 19 | export-progress | 3 |
  | export-dialog-a11y-copy | 9 | export-range-ui | 11 |
  | export-dialog-focus-restore | 7 | export-toolbar-hold-enter | 5 |
  | export-dialog-focus | 19 | export-wav | 18 |
  | export-dialog-footer | 15 | master-ui | 18 |
  | export-dialog-hold-enter | 7 | master | 17 |
  | export-dialog-tab-stops | 14 | meter-ui | 12 |
  | export-mp3 | 11 | video-fades-ui | 10 |

  `diff` of the before and after counts: identical.
- **Green granted files:** strings 5/5, export-cancel 19, export-progress 3, export-wav 18, master 17, export-cancel-ui 12, export-dialog-focus-restore 7, export-dialog-focus 19, export-dialog-tab-stops 14, export-toolbar-hold-enter 5, export-dialog-footer 15, export-progress-ui 8, meter-ui 12.
- **Red granted files (P1 only):** export-dialog-a11y-copy 8/9, export-dialog-hold-enter 0/7, export-mp3 8/11, export-range-ui 9/11, master-ui 17/18, video-fades-ui 9/10.
- **Neighbours, all green:** export-range 8, export-wav-in-place 5, mp3-encoder 10, graph 19, meter 15, clip-fades-ui 16, render-budget 7, status-announcement-ui 32, ArrangementContext 21, clip-fades 25, envelope 24, clip-gain 28, track-pan 26, track-group-mix-ui 10.
- **Pre-fix red:** ST2 and ST4 were red against the unmigrated sources.

## 6. Mutations
Each mutation: `cp` to `/tmp/mN.bak` → `sed -i` → run → `cp` back. The restores were verified with `sha256sum -c` (all OK).

| ID | Mutation | Result |
|---|---|---|
| m1 | the dialog **Cancel** label put back as `გაუქმება` (Cancel rather than Close, so P1 does not confound the result) | ST4 red, and export-cancel-ui CU1 red (it queries Cancel) |
| m2 | overload formatter: peak and reduction swapped | ST2 red |
| m3 | `closeButton` `Close` → `Closee` | ST1 red. The other 56 tests in the run were green, including the P1 tests, which confirms the P1 cause |
| m4 | the Georgian empty-project `Error` put back in `graph.client.ts` | ST4 red |

## 7. Typecheck / lint / Biome
- `npm run typecheck`: clean (`tsc --noEmit`, no output).
- `npm run lint`: exit 0. The repo shows 218 warnings and 1 info, but none of them is in the changed files.
- Read-only `npx biome check` on all 26 changed or new code files: "No fixes applied", no diagnostics.

## 8. Code-reviewer (real subagent, given the full diff file `a-round-127/diff.patch` and the new files)
- **Verdict:** REQUEST CHANGES, solely for P1, which needs B. Score 7/10; the migration itself is about 9/10.
- **No hidden behaviour change found.** The reviewer checked `textContent` shape, trailing and leading spaces, the derived 120/30, and the hunks staying inside the narrow ranges.
- **Derived test fragments:** none weaker than the originals.
  - `NAME_LEAK` resolves to `/LAME|either both|graph|Video is not|Make a time/`, and none of it matches a radio name.
  - The `master.test` fragments are stronger than before.
- **Fixed by A:** two titles had a space dropped by the Edit tool ("after Closealthough" / "after Closewhen"). Both now read correctly.
- **Self-comparison note (for B).** `export-cancel.test` l.211–215 and `export-wav.test` l.170/594 now compare a constant with its module source. ST1 and ST5 still pin the exact literals, but the EW8f title "stalled message is exact" overstates what that test alone checks.
- **Copy nits (Low, for B):**
  - "in this cycle" could be "in this version";
  - "the time selection is created" could be "… is exported";
  - "— No file was created." has a capital letter mid-sentence (it follows §1.1);
  - `busyButton` "Rendering…" also shows during the encoder load and the MP3 encode.
- **Naming nits:** `busyButton` and `progressEncoderLoad` vs `encoderLoading`; `overloadWarning` uses an inline params type.
- **Architecture note (verbatim gist, for B; not acted on):**
  - Audio/render modules (`graph.client.ts`, `export-wav.client.ts`) now import UI copy. That is acceptable because `strings.ts` is a leaf. **Keep**, but check the dependency direction when V-0.2 adds sibling objects.
  - One file with about 60 keys now could reach about 300 by V-0.5, and the `sample`/`samples` branch is the first logic in the module. Before V-0.3, decide whether conditional copy may live in formatters, and whether to split by file.
  - The `exportWav`/`exportMp3` hotspot (ARCH-EXPORT-MP3-ORCHESTRATION) was touched only for literals. **Keep.**

## 9. Shell writes (all listed)
- `cat >> a-round-127.md` once, for checkpoint 1 in the loop folder. Every later report write used Edit/Write.
- `mkdir -p tmp/studio-real-loop/a-round-127` and `git diff 608187f > a-round-127/diff.patch`, both for the reviewer and both in the loop folder.
- Mutations m1–m4: `cp` to `/tmp/m1–m4.bak`, then `sed -i` on `ArrangementExportDialog.tsx` (m1), `strings.ts` (m2, m3) and `graph.client.ts` (m4), then `cp` back. All were restored and verified with `sha256sum -c /tmp/mut-orig.sha` → OK.
- Temp files in `/tmp` only: `needles.txt`, `*.fmt` (Biome format output to stdout, used for diffing), the it-count files, `vt-all.log`, `lint.log`.
- Every lasting store edit used the Edit or Write tool.

## 10. End state
- `sha256sum -c --quiet b-round-126-r127-tree-sha256.txt`: **OK at end**.
- Protected files: no `git diff 608187f`, and the sha256 prefixes are unchanged: `studio.$productId.tsx` fa2cf0bc, `api.studio-token.ts` 13914809, `auth.ts` 56f5b76f, `AuthContext.tsx` bf9ee257. `Modal.tsx` is also unchanged.
- `git status --porcelain`: 24 ` M`, all granted files, plus 3 `??`: `strings.ts`, `strings.test.ts`, doc 104. Nothing else.

## 11. Deviations
- **Lines outside B's explicit line numbers, inside granted `it` blocks ("and their uses"):**
  - `master.test.ts` l.275/276: `toContain` fragments of the overload text, now derived from `overloadWarning({...})` output with the same inputs (`.split(' — ')[0]` and `.split('. ')[1]`);
  - `master-ui` l.685/694/696 (Export WAV button, overload alert, Close).
- **Test-only input change in ST2:** progress fraction 0.575 instead of 0.57, because `Math.floor(0.57 * 100)` is 56 (floating point). No code change.
- **Stale title kept (R3 forbids renaming it):** `export-cancel.test.ts` "exports the exact Georgian messages".
- **Small additions beyond the literal ask:**
  - `overloadWarning` pluralizes `sample`/`samples`. The Georgian used an invariant "sample".
  - The MP3 timeout seconds are derived from the existing constant.
- **Doc 104** status is In Progress because of P1.

## 12. Acceptance (only what truly passed)
| Item | Status |
|---|---|
| R1 module contract (leaf, one object, formatters, no assertions) | done |
| R2 copy only, no behaviour change | done for every string except P1, which is an a11y-name behaviour change B must rule on |
| R3 test swaps, `it` counts and matcher strength | done |
| R4 English literals only in `strings.test.ts` | done; the only English text elsewhere is the renamed titles R3 permits |
| R5 doc 104 map | done |
| ST1–ST5 green | done |
| m1–m4 red | done |
| typecheck / lint / Biome | done |
| §4 vitest list green | **NOT met**: 15 P1 failures |
| T127-TARGETED | **not passable** until P1 is resolved |

No browser acceptance row was run by A (C's round).

## 13. Next C checks (after B rules on P1)
- Do not run C's browser rows until P1 is resolved. If B lets C proceed anyway:
  - EX-EN-IDLE and EX-EN-RUN/RANGE/MP3/CANCEL/MUTE/EMPTY/VIDEO can be checked now. The copy is English, and the Georgian count should be 0 except for user content.
  - In EX-KEYS, C will see two buttons named "Close": the ✕ and the footer button.
- For AN-REVIEW, sample these hunks: `export-dialog-a11y-copy` `NAME_LEAK`; `master.test` l.275–285; `export-dialog-footer` `^WAV created`; `export-range-ui` noSound regex; `ArrangementContext` hunks l.3077–3095 and l.3286–3297; `graph.client` l.11, 413–417 and 465.

## 14. Attempt 2 (resume after the context restart, 2026-10-24 ~06:00 UTC)
- **Correction to §10 (the end state).** On resume, `strings.ts` l.40 still held a mutation: `closeButton: 'Closee'`. It was a second m3 run (backup `/tmp/m3b.bak`, 05:51), and the context restart cut it off after §6 had been written. So the §10 end state was **wrong for `strings.ts`** at the end of attempt 1.
  - **Why the frozen check missed it:** `strings.ts` is untracked, so it is not in `b-round-126-r127-tree-sha256.txt`.
  - **Restore (shell write):** `cp /tmp/m3b.bak app/lib/arrangement/strings.ts`, then `sha256sum -c /tmp/mut-orig.sha`. All 3 files OK. `strings.ts` is again `387f7f73…` and has `closeButton: 'Close'`.
- **Authoritative test numbers (after the restore).** These replace the §5 totals as C's T127-TARGETED target.
  - **List:** `npx vitest run` on `strings` plus B's exact §4 list. The `export*` prefix covers the 14 export files, `export-range` and `export-wav-in-place`.
  - **Result:** 29 files, **341 passed, 15 failed** (356).
  - The 15 failures are exactly the §3 P1 tests: a11y-copy NC3, hold-enter HE1–HE7, export-mp3 MX1/MX5/MX6, export-range-ui XU3/XU5, master-ui overload alert, video-fades-ui VU4.
  - **Why §5 differs:** its 451/466 over 33 files also included the extra source-reading neighbours (`clip-fades`, `envelope`, `clip-gain`, `track-pan`, `track-group-mix-ui`). Those were all green.
- **Before the restore** (with the leftover mutation in place), the same run gave 1 failed (ST1), 355 passed. That confirms the m3 finding again.
- **Typecheck after the restore:** clean.
- **End state after the restore:**
  - `git status --porcelain`: 27 entries, 24 ` M` granted plus 3 `??` (`strings.ts`, `strings.test.ts`, doc 104).
  - `sha256sum -c --quiet b-round-126-r127-tree-sha256.txt`: OK.
  - Protected files plus `Modal.tsx`: `git diff 608187f` is empty.
- **No other edits in attempt 2.** P1 is still open; A made no attempt at options 1–4. The status stays **STOP — B ruling needed on P1**.
- `a-round-127-result.json` is written by the harness, so A did not edit it.
