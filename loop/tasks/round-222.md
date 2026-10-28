# Round 222: B-R220-LEGACY-EXPORT-NO-STEMS (Medium): the purchased-Studio export dialog opens with every stem selected

**Planned by:** B, at the round 221 → 222 planning, 2026-10-28. **Decisions:** D-29z237…D-29z242.
**Type:** a bug fix (one Medium) in a single component, plus its own test file and implementation doc.
**Queue position:** STUDIO-PERFORMANCE. PERF-16 is complete with round 221 (C PASS, published `6dd45a1`). This bug was fixed in advance as round 222 by the round-221 outcome table (`tasks/round-221.md` §6, row 1: C PASS and planning before 2026-10-30). Next comes PERF-HARNESS-SHARED-LIB (§8).
**Read first:** `lessons.md` (B, A and C). It applies in full, especially L11, L12, L14, L23, L26, L27, L28, L32, L33 and L36.

## 0. Baseline and scope

**Baseline:** HEAD = `6dd45a1eb0f2a756de3168e950707a89aa6942df` (gate 221 published on both remotes). The tree must be clean: `b-round-221/git-status-at-planning.txt` is empty.
- If HEAD differs, or the tree is not clean at start, **STOP** (L11). The exception is a root commit that only touches `package.json`, `package-lock.json` or `vite.config.ts`: re-hash those 3 and continue.

**Frozen:** `b-round-221-r222-tree-sha256.txt` holds 1,069 files: every tracked file except the 1 grant and the 3 root-owned files. `sha256sum -c` gives rc 0 at planning.

**Root-owned, must equal HEAD:** `package.json`, `package-lock.json` and `vite.config.ts` (`b-round-221-r222-root-files-start-sha256.txt`). No deps request this round, and no `vite.config.ts` grant (VITE-EXCLUDE-STALE stays with root).

### 0.1 Grants
| # | Path | What may change | Start sha256 |
|---|---|---|---|
| 1 | `app/components/studio/ExportDialog.tsx` | **Narrow grant** (`app/components/studio/**` is in `global_forbidden_files`; precedent: round 201, D-29z166). Only the stem-selection state logic: the `selectedStems` initialisation and its synchronisation with the stem-ID set (today l.28–30), plus at most one small pure helper in the same file if A wants one. Not allowed: JSX, classes, copy, labels, the button handlers' other behaviour, `handleExport`, `handleAbletonExport`, and the 10 pre-existing Biome a11y warnings (l.141–263; Low, not this round). | `b-round-221-r222-granted-start-sha256.txt` |

### 0.2 New files (`b-round-221-r222-new-files.txt`)
- `app/lib/__tests__/legacy-export-dialog-stems.test.tsx`. Ruled location (D-29z238): `app/components/studio/__tests__/` does not exist and falls under the forbidden glob. `app/lib/__tests__/` already hosts non-lib route and component tests (`download-routes.test.ts`) and matches the vitest include `app/**/*.test.{ts,tsx}`.
- `docs/implementation/2026/quarter-IV/174-legacy-export-dialog-stem-selection.md` (next free number; 173 is the last).

### 0.3 Untouched (the fix lives entirely in the dialog)
- `app/routes/studio.$productId.tsx` (protected; the always-mounted `<ExportDialog>` at l.311 stays as is. A `key` prop there is **rejected**: protected file).
- `app/contexts/StudioContext.tsx`, `app/types/studio.ts`, `app/components/ui/Modal.tsx`, and all other `app/components/studio/**` files.
- The lab dialog `app/components/arrangement/ArrangementExportDialog.tsx` and its tests.
- Auth and purchase files: `protected-baseline.json` (4 files) and `global_forbidden_files`.

## 1. The bug

**B-R220-LEGACY-EXPORT-NO-STEMS** (Medium, pre-existing since the dialog was written; not caused by PERF-16).
- **Repro:** on `/studio/middle-east` (HR-LEGACY-STUBBED), wait for "Export Mix" to be enabled, click it, then count the checked stem checkboxes. Result: **0 of 10**, and "Export Audio" is disabled until "Select All" is pressed.
- **Evidence:**
  - `b-round-220/legacy-ui-probe/result.json` (checkedBefore 0, totalBoxes 10 at Low, Medium and High);
  - `c-round-221/legacy/{Low,Medium,High}-1440x900-dialog-initial.png` and `High-1280x720-dialog-initial.png` (C, round 221, 4 out of 4 runs).
- **Cause:** the route mounts `ExportDialog` once, before `loadProduct` fills `state.stems` (`studio.$productId.tsx` l.311). `useState(new Set(state.stems.map(…)))` (`ExportDialog.tsx` l.28–30) therefore captures an empty set, and nothing updates it later.

## 2. Contract: the smallest honest behaviour (D-29z237)

1. **Trigger = the set of stem IDs.** When the set of IDs in `state.stems` changes (stems added, removed or replaced, for example the first load or a different product), the selection becomes **every current stem ID**.
2. **Same IDs → no change.** `StudioContext` rebuilds `state.stems` with the same IDs on mute, solo, volume, trim and loading updates (`StudioContext.tsx` l.382, 899, 965, 1007, 1047, 1055). These rebuilds must **not** touch the selection. A change in order alone is not a change.
3. **User toggles persist** across close and reopen while the ID set is unchanged. This is how it behaves today, because the component stays mounted.
4. **Removed IDs leave the selection.** This follows from rule 1: the selection never holds an ID that is not in `state.stems`, so `selectedStems.size === state.stems.length` (the Select/Deselect All label) stays correct.
5. **No extra render pass with a stale selection when the dialog opens.** Adjusting during render (the "store the previous key in state" pattern) or deriving the selection from the key are both acceptable. A `useEffect` that resets on `state.stems` identity is **not** (it breaks rule 2). No `any`, no type assertions, no `@ts-ignore`, semicolons (CLAUDE.md).

**Rationale (recorded).**
- The initializer's evident intent is "all stems selected". Restoring it is the smallest change that makes Export work without an extra click.
- Reopen behaviour is unchanged, and the Ableton tab (`.als`) gets the same fix for free, because it reads the same `selectedStems`.
- Resetting on every open was rejected: it would discard a user's deliberate deselection after a mute click or a reopen, which is a bigger behaviour change than this bug needs.

**B's scratch proof** (`b-round-221/scratch-run.txt`): on the start copy, a sketch of ES1 and ES5 is red (0 instead of 10 and 2) and ES3 is green. A 7-line render-time key adjustment (`b-round-221/scratch-fix.diff`) turns all 3 green with tsc rc 0. The sketch keyed on ordered IDs; the contract needs set semantics (ES4). A writes its own code and tests; the sketch is an existence proof, not the solution.

## 3. Reference: how Ableton Live 12 does it

**Source:** Ableton Live 12 Reference Manual, chapter "Managing Files and Sets", **§5.1.3 "Exporting Audio and Video" → §5.1.3.1 "Selection Options"**: https://www.ableton.com/en/live-manual/12/managing-files-and-sets/ (checked by B with WebFetch on 2026-10-28, the whole page in two parts).

| Behaviour | What the manual says (fact) | CZABA's decision or difference | C's check |
|---|---|---|---|
| What gets rendered | The **Rendered Track** chooser offers Main, All Individual Tracks, Selected Tracks Only, or one named track. The manual calls Main the option "most users will choose". | The legacy dialog has no Rendered Track chooser. It mixes the ticked stems into one file. All stems ticked = the full mix, the closest match to **Main**. | REF-222-1: the initial state is all 10 ticked = full mix (LEGACY-UI-STUBBED-222). |
| Default selection | **Not stated.** The manual names no default for the chooser. The only stated default is Render Start/Length = the whole Set. B searched the whole page and found no sentence on it. | We do not claim "Live defaults to Main". The all-stems default is CZABA's choice (rationale in §2). | Status: **unconfirmed** (no source). Not a FAIL reason. |
| Choosing a subset | "Selected Tracks Only" renders only the tracks selected **before** the dialog was opened. | **Better than Live:** the user can include or exclude stems inside the dialog, and the choice persists while the stem set is unchanged. | REF-222-2: deselect, close, reopen = 9/10 (PERSIST-222). |
| Remembering settings | **Not stated** in the manual. | CZABA keeps toggles while the dialog stays mounted (today's behaviour). Nothing is written to storage. | Unconfirmed vs Live; CZABA behaviour checked by PERSIST-222. |

**Deviations:**
- **No Rendered Track chooser.** CZABA's model is purchased stems → one personal mixdown (the user's agreed scope). This is not a simplification for build cost.
- **Per-stem checkboxes** have no direct Live equivalent. Live users will recognise them as a subset render.

**Not Ableton:** cursors and shortcuts are unchanged (no new interaction).

## 4. Tests: A writes them in the new file

**Mock shape (prescribed; there is no existing `StudioContext` mock in the tree).**
- `vi.mock('~/contexts/StudioContext', () => ({ useStudio: () => studio }))`, where `studio` is a mutable module-level object `{ state: { stems, isExporting, exportProgress, productTitle }, exportAudio: vi.fn(...) }`.
- The tests replace `studio.state` and call `rerender` with a **freshly created element** each time (L27). Reusing the same element bails out and `useStudio` is never re-read.
- **No `@testing-library/jest-dom` in this repo:** `toBeEnabled` and `toBeInTheDocument` throw. Use `hasAttribute('disabled')`, `.checked`, and `getAllByRole(...).toHaveLength(n)`.
- Query by role and name inside `getByRole('dialog')`, never by class (L12). Every button name A asserts on is unique in the dialog (L14).

| Row | Start state → action → expected | Red on the start copy? |
|---|---|---|
| ES1 | Mounted closed with `stems: []` → 10 stems load (new ID set) → open: 10/10 checked, "Export Audio" has no `disabled`, exactly one "Deselect All" button. | **Red** (0/10) |
| ES2 | Mounted open with 3 stems from the start → 3/3 checked (initializer path). | green (guard) |
| ES3 | 3 stems, user unchecks the 2nd → `state.stems` rebuilt with the **same IDs** and a changed `isMuted`/`volume` → still 2/3, the same 2. Then close → reopen → still the same 2. | green (regression guard for contract rule 2; a `state.stems`-identity reset makes it red) |
| ES4 | 3 stems, user unchecks one → same IDs in a **different order** → selection unchanged. | green (guards the set semantics) |
| ES5 | IDs `a,b`, user unchecks `a` → ID set replaced by `x,y` → 2/2 checked; click "Export Audio" → `exportAudio` called once with `includedStemIds` equal to `['x','y']` (no `a` or `b`). | **Red** (0/2) |
| ES6 | IDs `a,b,c`, all selected → `c` removed → 2/2 checked, the label is "Deselect All"; "Deselect All" → 0, "Export Audio" disabled; "Select All" → 2/2. | **Red** at the label: on the start copy the stale set still holds `c` (size 3 ≠ 2), so the label reads "Select All" (B's reading of the HEAD code; A records the real first failing assertion) |
| ES7 | 10 stems loaded after mount → open → switch to the Ableton tab → its export button has no `disabled`. | **Red** |

- **Red-proof (L23).** A runs the new file on the start copy of `ExportDialog.tsx` (`git stash` is forbidden; use a scratch copy, or the grant's start file from `b-round-221-r222-granted-start-sha256.txt`) and records which rows are red. At least ES1, ES5 and ES7 must be red there. Then a named mutant: a `useEffect` that resets on `[state.stems]` identity must turn ES3 red. Both logs go in `a-round-222.md`.
- **Covering runs (speed rule).** `npx vitest run app/lib/__tests__/legacy-export-dialog-stems.test.tsx`, `npm run typecheck` and `npm run lint` (0 new errors; the 10 old warnings stay). No full suite: that is the gate.
- **L31:** the new file sets no custom timeout. Each row must stay well under the vitest default, and A reports the file's duration.
- **Code review:** 3 files change (component, test, doc), so A asks `code-reviewer` (rules) and passes on its Architecture note.

## 5. Implementation doc 174 (A)
- Georgian, TEMPLATE.md sections in order (`docs/implementation/TEMPLATE.md`).
- **l.4 exactly:** `**სტატუსი:** Completed (C round 222 PASS)` (L28).
- **Contents:**
  - the cause (always mounted + initializer);
  - the contract (§2) and why a reset on every open was rejected;
  - the Reference table summary with its "not stated" facts;
  - the 7 test rows by id;
  - the red-proof.
- **L26:** only test rows that exist. **TODO:** the export-pipeline checkpoint (§9); LEGACY-OWNERSHIP stays backend-only.

## 6. What C checks (browser rows: real Chromium, Playwright, both viewports unless stated)

**Harness.**
- HR-LEGACY-STUBBED: reuse `c-round-221/c221-legacy.cjs` or `b-round-220/legacy-ui-probe.cjs`. Synthetic 4 s, 48 kHz stems, a distinct sine per stem.
- **Warm-up (HR-MP3-WARMUP, amended D-29z241):** before the first measured row, load `/studio/middle-east` once as a throwaway (cold loads took more than 180 s in round 221). One invalid replacement per row is allowed for a cold-load timeout. It is not a finding.

| Row | What | Pass when |
|---|---|---|
| SCOPE-222 (start + end) | `git status`, the frozen `sha256sum -c`, the root-owned 3, the grants and new files | Only grant 1 (`M`) and the 2 new files (`??`); frozen rc 0; root-owned identical to HEAD; HEAD `6dd45a1` (or the root-only exception in §0). |
| UNIT-222 | C runs the new file with `CI=true`, plus `npm run typecheck` | 7/7 rows (ES1–ES7) present by id and green; tsc rc 0. |
| REDPROOF-222 | A's logs, plus C's own mutant on a copy (never the repo file): revert the init to the HEAD form; then the `[state.stems]`-identity `useEffect` reset | Mutant 1 turns ES1, ES5 and ES7 red; mutant 2 turns ES3 red. |
| CODE-222 | Read the diff of `ExportDialog.tsx` | Only the selection state logic changed (§0.1). No JSX, class or copy change; no `any`, assertion or `@ts-ignore`; semicolons. |
| **LEGACY-UI-STUBBED-222** (STUBBED: proves the client path, never ownership) | `/studio/middle-east` → "Export Mix" → **without pressing Select All** | Initial checked count **10/10** and "Export Audio" **enabled**, at 1440×900 and 1280×720, with screenshots. Then MP3 High at 1440: `Middle East-export.mp3` walks as 168 × 320 kbps frames plus Xing to EOF and decodes to 2 ch. **Same-session proof that the default equals Select All** (script-independent; no number borrowed from round 221): in the same page, export WAV once without touching the selection, then press Deselect All → Select All and export WAV again. The two files are byte-identical (or, if a header timestamp differs, the decoded PCM is identical). 0 page errors. |
| SUBSET-AUDIO-222 (STUBBED) | WAV (the default format), 1440: uncheck exactly one stem k (name it), export | The file's spectrum (Goertzel or FFT at each stem's sine frequency) shows stem k at least 30 dB below the median of the 9 included stems, and every included stem present. This proves the selection drives the real audio. **The stem → Hz map must be attributable:** C records it in the evidence as stem name → R2 path → Hz (for example `c221-legacy.cjs`'s `stemFreqs` by path, joined to the stem names in the dialog). A map known only by request arrival order, with no path, is not acceptable. |
| PERSIST-222 (STUBBED) | 1280: uncheck one stem → close (✕ or Cancel) → reopen; then toggle Mute on a different stem in the mixer → reopen | 9/10 both times, the same stem unchecked. The label reads "Select All" (9 ≠ 10). |
| SELECT-ALL-222 (STUBBED) | "Deselect All" → "Select All" | 0/10 with "Export Audio" disabled, then 10/10 with it enabled (existing behaviour kept). |
| ABLETON-TAB-222 (STUBBED) | Ableton tab at open, 1440 | Its export button is enabled at 10/10. Do not download the `.als`; enabled state only. |
| LAB-SMOKE-222 | `/studio-lab` WAV export, 1440 | WAV with PCM 2 ch, 48 kHz, 24-bit, frames = the shown length × 48000 (diff 0), and the RMS of round 221 (−15.29 dBFS). The lab dialog is untouched. |
| G222-3 (unstubbed auth guard) | `/studio-lab` anonymous; `/studio/middle-east` with no stubs | Lab 200, demo badge, workspace present, `auth_user` null. The purchased route shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` with no header → 401. Both viewports. |
| LEGACY-OWNERSHIP-222 | real ownership through the backend | **BLOCKED**: backend unavailable in cloud. Not PASS; not a FAIL of A. |
| AN-REVIEW-222 | doc 174 | TEMPLATE headings in order; l.4 byte-exact; every test row it cites exists (L26); the Reference facts match §3 (no "Live defaults to …" claim). |
| gate | full suite, build, Biome, verify, e2e smoke | `gate` in `c-round-222.json`; not claimed. |

**Ableton conformance status per row:**
- REF-222-1 and REF-222-2: **conscious deviation / better than Live**, as listed in §3;
- the default selection: **unconfirmed** (no source);
- everything else: not applicable.

## 7. Adjacent behaviour that could break
- **Mute/solo/volume clicks wiping the selection.** This is the main risk; ES3 and PERSIST-222 cover it.
- **The legacy MP3/WAV export** (PERF-16b-i facade): LEGACY-UI-STUBBED-222 and SUBSET-AUDIO-222 cover it.
- **The Ableton `.als` export** reads the same selection: ABLETON-TAB-222.
- **The lab Studio:** not touched; LAB-SMOKE-222.
- **Purchase protection:** no auth file is touched; G222-3, unstubbed.

## 8. Outcome, fixed in advance
| C result | B at round-223 planning |
|---|---|
| PASS, planning before 2026-10-30 | B-R220-LEGACY-EXPORT-NO-STEMS closes. Round 223 = **PERF-HARNESS-SHARED-LIB** (test-only, D-29z215), after the `performance-optimizer` and `tech-lead` consults and a re-measurement. The export-pipeline checkpoint (§9) runs alongside, with root. |
| PASS, planning on or after 2026-10-30 | Round 223 = **REGRESSION** (scope_additions include LEGACY-UI-STUBBED with **10/10** expected). Then PERF-HARNESS-SHARED-LIB. |
| A STOP (HEAD drift, a protected-file need, a red covering test) | B rules first (L10). No re-dispatch without a ruling. |
| A unit, red-proof, code or doc row fails | A bounded fix-up in the same 3 files. |
| A browser row fails (count not 10/10, subset audio wrong, persistence lost) | A fix-up first, before PERF-HARNESS-SHARED-LIB. |
| G222-3 or LAB-SMOKE-222 finds Medium+ | A fix-up first. A Low goes to `deferred_low_polish`. |

## 9. For root
- **Publication after C PASS.** Grant 1 plus the 2 new files. Suggested message: `fix(studio): legacy export dialog selects every stem once the stems load (B-R220-LEGACY-EXPORT-NO-STEMS)`. Reviewer focus: the ID-set trigger (no reset on mute, solo or volume), the narrow grant, and the test mock.
- **New, non-blocking:** `b-round-221-checkpoint-request.md` asks for the export-pipeline frontend-architect checkpoint (PERF-16 boundary).
- **Still pending, non-blocking:**
  - `b-round-220-root-request-vite.md` (VITE-EXCLUDE-STALE);
  - `b-round-215-root-request-l28.md`;
  - the frontend-architect checkpoint D-29z195 (`b-round-211-checkpoint-request.md`).
- **C-R221-01, ruled (D-29z239):** DEPS-221 meant "no installed `@ffmpeg` package". C measured exactly that: `npm ls` empty, `require.resolve` MODULE_NOT_FOUND, 0 lock entries. The empty `node_modules/@ffmpeg/` directory was left by root's `npm uninstall`. It is gitignored, and a fresh job's `npm ci` does not create it. Closed as an environment artifact; an `rmdir` is optional.
