# Round 303: NAME-AND-HINT-b. One-time "Drag a clip by its name bar to move it." (Saba Q5)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-02 · Decisions: **D-29z788 … D-29z792** (`backlog.json` → `decisions_log_b`, `rounds[303]`, `post_current_stage_queue[6]` stage `NAME-AND-HINT-b`).

**Owner:** A. **Verifier:** C. **Grants:** §5 (9 paths: 8 changed, 1 new).

## Baseline: HEAD `1fd0129` [K1], clean tree [K2]
- `gates/gate-round-302.json` is `published`, commit `1fd01292…`, on both remotes. That commit is the baseline.
- The 7 protected files have no diff [K3]: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- **Frozen list:** `b-round-302-r303-tree-sha256.txt`, 1,172 entries from `git ls-files` at HEAD. `sha256sum -c` (run from `store/`) gives 0 failures [K4].
- **Claims:** run `b-round-302/claims-303.sh` from `store/`. Its output at HEAD is `b-round-302/claims-303-output.txt`.
- **L29 grep note:** untagged hits in this task are expected values, microcopy, new-file names or grant descriptions (what the code will be), not facts about current code.

## 0. Read first
- `lessons.md` in full. Directly relevant: L3 (widest-state box), L4 (one element, one rule; the collision wording), L23 (collisions, scratch pre-check, mutants), L26/L28 (doc), L29 (claims), L31 (timeout headroom), L39 (screen budget), L49 (kept side effects), L51 (clobber list and lifetime), L52 (asserts that can fail), L54 (journey), L56 (artifacts exist).
- Saba's decision: `docs/technical/studio-real-workspace/agent-workflow.md`, section "Whole-product design review … (2026-10-31)", item **Q5**: "After the first clip is added, a one-time status says 'Drag a clip by its name bar to move it'. Behaviour does not change: body drag still makes a time selection, as in Live." The review's own default (`product-design-review-2026-10-31.md` §5 item 5) reads "only after the first clip, once".
- B's reasoning is in `b-round-302.md`. The previous task (round 302) is archived as `tasks/round-302.md`.

## 1. What changes, and why
Film editors coming from Premiere expect to drag a clip by its body. In CZABA, as in Live, the body makes a time selection and only the name bar moves the clip [K9][K10]. Q5 tells them once, in the status line, right after their first clip lands.

**The single change:** the first successful library add in a page load appends Saba's sentence to the clip-added status, in the same `setStatus` write. The two add paths are `addSourceToActiveTrack` (Enter in the workspace or on a library option, the option's add actions and the preview's Add button: 4 call sites [K17]) and `dropLibrarySource` (drag-drop). There are exactly two clip-added write sites at HEAD [K5]. Every later add shows the plain text as today.

| State | Status text after the change |
|---|---|
| First library add, source with no BPM (fresh load + Enter adds `demo-middle-east`, the default selection [K11]) | `“Middle East — public preview” added to the Music track at 00:00.000. Drag a clip by its name bar to move it.` |
| First library add, BPM source (seed) | `“Night Pulse · Full mix” added to the Music track at 00:00.000. Drag a clip by its name bar to move it. Tempo 120 BPM from “Night Pulse · Full mix” — bars ruler on. Grid only: audio is not stretched. Snap on — grid <div> (G)`. `<div>` is the division the seed picks, which is `1/2` in B's HEAD probe at both viewports (`b-round-302/probe-status.json`). C compares against the HEAD text with the hint inserted after the first sentence, not against a retyped literal. |
| Any later add | the plain `clipAdded` text, exactly as at HEAD |
| Refused or failed add (no source selected, source not loaded or failed, video lane, no room, edit during a gesture) | the refusal text as at HEAD, with no hint. The hint is **not** used up. |
| Video import | the video statuses as at HEAD, with no hint. The hint is **not** used up: the next library add still shows it. |
| Undo of the first add, then a new add | Undo's own status, then the plain `clipAdded` text. Undo does not re-arm the hint. |
| Reload, or leaving the Studio route and coming back (`← CZABA` → nav "Studio"), which remounts `ArrangementProvider` | the hint shows again on the first add. "Per page load" precisely means **per mount of the Studio route's provider in this tab**. This is not a bug. |

Behaviour is unchanged: body drag = time selection, name-bar drag = move. No new element, no new persistent text, and nothing outside the status line.

## 2. Reference, product-designer framing and rulings

### 2.1 Reference: how Ableton Live 12 does it
Source: the Live 12 Reference Manual, Arrangement View chapter (https://www.ableton.com/en/manual/arrangement-view/), read by B on 2026-11-02 with WebFetch.

| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Move a clip | §6.7 "Moving and Resizing Clips": "Dragging a clip moves it to another song position or track. Note that only the clip bar is draggable, it is not possible to drag from the clip's waveform or MIDI display." | yes | same: the name bar (`cursor-grab`, title `<name> — drag to move` [K9]) moves the clip | H-BEHAVIOUR |
| Drag in the body | §6.9 "Selecting Clips and Time": "Clicking and dragging in the clip's waveform or MIDI display allows you to select time within the clip." | yes | same: body = time selection (title `drag = time selection · click = insert marker` [K10]) | H-BEHAVIOUR |
| A one-time hint after the first clip | not in the manual. Live explains controls in its Info View on hover (§2.2.2, listed in the manual's contents; not read further) | no such hint in Live | **CZABA-only aid, Saba's Q5 decision.** This is not a planner deviation, so no L44 question is needed. | H-FIRST-ENTER, H-FIRST-DROP |
| Term | the manual says "clip bar" | — | Saba's sentence says "name bar". It is kept verbatim (his approved copy). Recorded as info. | — |

- **Cursor and hover:** unchanged (the name bar is `cursor-grab`, the body `cursor-text`).
- **Shortcuts:** none added.
- **Visuals:** text only, in the existing status line.
- **YouTube / AGREE path:** it does not apply. Saba decided Q5 himself on 2026-10-31, with the exact copy and the default. The behaviour it describes is already built and already confirmed in the manual. No new interaction is designed.

### 2.2 product-designer framing (consulted at planning)
**Chosen:**
- **Same write.** The hint goes into the same `setStatus` call as the clip-added text: one polite announcement, cause and next step together, and nothing can overwrite it in between.
- **Triggers:** Enter, the Add menu and drag-drop. Failures neither show nor use it up. Video import neither shows nor uses it up.
- **Lifetime:** once per page load, in memory. Undo does not re-arm it.
- **Copy:** Saba's sentence, verbatim. No "Tip:" prefix.

**Rejected:**
- **A second status write after the add.** A screen reader can drop or merge the first one, and later writes could clobber it.
- **Triggering on the first video.** Its async decode statuses overwrite the hint, and the editor's first goal there is the picture.
- **localStorage persistence.** That changes what Saba approved. It is asked as a question instead (below).
- **Re-arming on Undo.** That would turn a one-time hint into a loop.

**B's adjustment (product-designer did not know about the tempo seed):** on a BPM source, StudioWorkspace's existing function-form write appends the seed text to the current status [K7]. The hint therefore sits **between** the add sentence and the seed text. This is the smallest change (the seed code is untouched, L49). Moving the hint after the seed would need a cross-file hand-off for no user gain: it reads as cause, then next step, then tempo facts. Its product-designer row "the status ends with the hint" applies only to sources with no BPM.

The product-designer row "nearest free spot as the first add" cannot happen in a browser: the project starts empty, so the first add never collides. It is unit row NB7 instead.

### 2.3 Rulings and Saba question
- **SABA-Q-NAME-HINT-LIFETIME** (D-29z791), asked once: "Should the hint stop after the first visit in this browser?" The default is no: once per visit to the Studio route in this tab, which is a provider mount. It is `awaiting_user` and does not block this round.
- **L49:** no call is replaced. `withNameBarHint` wraps the string argument only. The add paths' other effects (`applyEdit`, selection, `setRange(null)`, active track) are unchanged, and the existing add tests cover them.
- **L50:** no focus moves and no focusable element unmounts. Out of scope.
- **L51 clobber list** (the strings that can land on the same line, in their real order):
  1. the loading text, then `Demo collection ready…` (both earlier; they never contain the hint);
  2. **the add write (hint);**
  3. the seed append (function form; keeps the hint, [K7]);
  4. `setRange(null)`'s `rewriteStoppedTruth`, which rewrites only exact `stopped` texts ([K8]: 8 exact-equality branches), so it cannot touch a text with the hint;
  5. any later user action replaces it (Space, Undo, next add). That is the hint's lifetime end. It is guidance, not state, so it needs no clear code.
- **Not changed:** the ready text, the video statuses, every refusal string, `clipAdded` itself.
- **Gate 302 finding 3 and the NM1 Lows** are not in this round. Round 303 owns neither `e2e/store-page.spec.ts` nor `studio-naming.test.tsx` (D-29z789; `deferred_low_polish` `A-R302-REVIEW-NM1-NARROW`).

## 3. Acceptance rows

### 3.1 Unit (A writes them; C re-runs them)
**New file `app/lib/arrangement/__tests__/name-bar-hint-ui.test.tsx`.** Every row asserts the exact full status text, not a substring.

| Row | Scenario | Expected |
|---|---|---|
| NB1 | Fresh provider, Enter adds a ready no-BPM source | text = `clipAdded(...) + ' ' + nameBarHint` |
| NB2 | Then a second add | text = plain `clipAdded(...)` |
| NB3 | Fresh provider, the first add is a library drop | hint appended (the drop path) |
| NB4 | Fresh provider: a refused add (no room, or source not loaded), then a successful add | the refusal text has no hint; the next success has it |
| NB5 | Fresh provider: first add, Undo, add again | the Undo status as at HEAD; the second add is plain |
| NB6 | Fresh provider, the first add is a BPM source; settle the seed effect the way `tempo-seed-ui` does | exact composite: `clipAdded + ' ' + nameBarHint + ' ' + seeded(...)` (+ the snap part as the seed writes it) |
| NB7 | First add lands at the nearest free spot (an arranged pre-filled lane) | `… (nearest free spot). Drag a clip by its name bar to move it.` |
| NB8 | Fresh provider: video import (the existing video-import test pattern), then a library add | 0 video statuses contain the hint; the library add has it |
| NB9 | `nameBarHint` literal | equals `'Drag a clip by its name bar to move it.'` (also in ST10's literal list) |

**Collisions (L23/L4)** in the granted test files (§5, items 3–7). B's sketch run (`b-round-302/sketch-arrangement-run.log`, [K14]) found 12 failing assertions in 5 files:
- `tempo-seed-ui` TU2, TU5, TU9;
- `grid-snap-loop-drop` SD1, SD2, DE1, DE2, DE3;
- `status-lifetime` LT15, LT19;
- `failed-source-refusal` FS7;
- `strings` ST10.

A updates each one so the first add's expected text includes the hint. **No assertion is lost; equal or stronger replacements are allowed.** A test whose only change is deleting an assertion is a Medium finding. Exact-equality checks stay exact. Do not loosen any of them to `toContain`.

**Mutants** (A, on its own scratch with its own `cacheDir`; logs under `a-round-303/`):

| Mutant | Change | Must turn red |
|---|---|---|
| m1 | never set the flag (the hint on every add) | NB2, NB5 |
| m2 | never append (return `text` unchanged) | NB1, NB3, NB6, NB7 |
| m3 | set the flag on a refusal path too (e.g. in the `addFailed` / `sourceNotLoaded` branch) | NB4 |
| m4 | put the hint before the add sentence | NB1, NB6 |
| m5 | re-arm on Undo (reset the ref in `undo`) | NB5 |

### 3.2 Browser rows (C)
Run every row at 1440×900 and at 1280×720, on a fresh context each time. Wait for `Demo collection ready` first (L48).

| Row | Action | Expected |
|---|---|---|
| H-FIRST-ENTER | Fresh load, Enter (default selection `demo-middle-east`) | `arrangement-status` text is exactly `“Middle East — public preview” added to the Music track at 00:00.000. Drag a clip by its name bar to move it.` There is exactly 1 `[data-testid="arrangement-status"]`. |
| H-SECOND | Then select another ready source and press Enter (it lands on the active lane, possibly at the nearest free spot) | the status is exactly the plain clip-added text (with ` (nearest free spot)` if the clip moved), with 0 occurrences of `name bar` |
| H-FIRST-DROP | Fresh load, drag a library option onto an empty audio lane | the clip is added and the status ends with `. Drag a clip by its name bar to move it.` |
| H-SEED | Fresh load, expand the folders, select `Night Pulse · Full mix`, press Enter, then **wait until the status contains `Tempo`** (the seed is appended by an effect one commit after the add write; the brief intermediate state is expected) | exact composite as in §1, where the seed part equals the HEAD text of the same action (C runs the same action on a HEAD reference; see note) |
| H-UNDO | Fresh load: Enter, Ctrl+Z, Enter | the second add has no hint |
| H-RELOAD | After H-SECOND, reload, Enter | the hint is back |
| H-VIDEO-FIRST | Fresh load: import a small video file (`setInputFiles` on the video input; use the repo's `public/videos/hero/1.mp4`; ffmpeg is not installed on the runner, wait until the video statuses settle, then Enter on a sound | no video status contains `name bar`; the Enter add shows the hint |
| H-BEHAVIOUR | After H-FIRST-ENTER: (a) drag the clip body 100 px; (b) drag the name bar 100 px | (a) a time selection appears (`arrangement-range` visible) and the clip `left` is unchanged; (b) the clip `left` moves by about 100 px and `arrangement-range` is absent |
| H-BOX (L3) | In the H-SEED state (the longest text) and in H-FIRST-ENTER | the status `<output>` is 1 line (its height equals its line-height of 16 px) and the footer is 53 px, as at HEAD. Bound measured by B: 1162 px of text in a 1256 px output at 1280 (`probe-status.json`). The timeline region's height is unchanged against HEAD. |
| H-SR | In H-FIRST-ENTER, read the CDP AX tree | the status node's name or text contains both sentences once; 0 other live regions repeat it |
| H-BUDGET (L39) | Full-window screenshots, empty and with one clip, at both viewports | distinct visual rows equal the 1fd0129 baselines (empty 56/49, one clip 59/51; `INFO-C302-BUDGET-METHOD`). Text-node lines are reported too. |
| H-JOURNEY (L54) | Per viewport: `/` → nav "Studio" → Enter adds (hint seen) → drag the name bar (moves) → Space plays ≥ 1 s → Stop → Export WAV → `← CZABA` | every step completes; the WAV has non-zero samples; a screenshot at each step |
| RV-EN | All the states above | 0 Georgian characters in visible text or AX names |
| G303-AUTH | Same as G302-AUTH | anonymous `/studio-lab` works with `auth_user` null; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `/api/studio-token?...` with no header → 401, with no token in any body |

**H-SEED reference note:** C may run a second dev server for the HEAD reference only with its own Vite `cacheDir` (L38). The alternative is to read the HEAD text from `b-round-302/probe-status.json` (`fullmix.added`), which is the same action at the same HEAD. Either is acceptable; C names which one it used.

**BLOCKED** (backend unavailable in cloud): the purchased workspace's first add in a browser. SRW-21 is `deferred_user`, so no route mounts it. The unit rows cover the provider, which is shared. List it under `blocked`; it does not make `browserVerified` false.

### 3.3 Other C rows
- **SOURCE-SCOPE:**
  - `git status --short --untracked-files=all` shows exactly the 9 §5 paths.
  - `sha256sum -c b-round-302-r303-tree-sha256.txt` fails only on the 8 modified paths.
  - The 2 source grants are `cmp`-equal to `b-round-302/sketch-ArrangementContext.tsx.txt` and `sketch-strings.ts.txt`.
  - The protected files have no diff.
- **CLAIMS:** re-run `claims-303.sh`. K1, K3, K7–K12, K15 and K17 must equal `claims-303-output.txt`. After A's change:
  - K2 = 9;
  - K4 failures = 8;
  - K5 = 2 (unchanged; the wrap keeps the call);
  - K6 = 5 (B's sketch: the strings key at `strings.ts:293` and 4 lines in the context: the ref, its 2 uses and the append). This follows from the byte-equal grants;
  - K13 l.4 = the new status (DOC);
  - K16 all `ok`.
- **DOC:** `docs/implementation/2026/quarter-IV/221-name-and-hint.md` gets a stage-b section. Its l.4 is exactly `**სტატუსი:** Completed (C round 303 PASS)` (L28: last stage). It cites only rows that exist (NB1–NB9 and the updated collision rows), keeps TEMPLATE's 7 headings in order, and names SABA-Q-NAME-HINT-LIFETIME.
- **Gate rows, not claimed by C:** full vitest, build, `npm run verify`.

## 4. Rulings for A and C
- **L4, one element, one rule.** The status line's text changes on the first add only. Every other status contract (refusals, seed, video, transport) is unchanged and wins over any reading of this task.
- **L31 headroom.** Gate 302's file times are `tempo-seed-ui` 7.1 s, `status-lifetime` 6.0 s and `grid-snap-loop-drop` 5.7 s. A reports any single test above 50 % of its timeout. Put the new NB rows in the new file, not in these files.
- **L52.** Each NB row has a mutant that turns it red (§3.1). NB6 asserts the full composite, so a seed regression would show.
- **Biome:** the sketch is already formatted (`npx biome check` on both files: 0 findings). Lint must show no new warning in a granted file.

## 5. Grants
A edits only these 9 paths:
1. `app/contexts/ArrangementContext.tsx`: byte-equal to `b-round-302/sketch-ArrangementContext.tsx.txt` (a `nameBarHintShownRef`, a `withNameBarHint` callback, and the two `clipAdded` writes wrapped, with their deps).
2. `app/lib/arrangement/strings.ts`: byte-equal to `b-round-302/sketch-strings.ts.txt` (`studioLibraryStrings.nameBarHint`).
3. `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx`
4. `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx`
5. `app/lib/arrangement/__tests__/status-lifetime.test.tsx`
6. `app/lib/arrangement/__tests__/failed-source-refusal.test.tsx`
7. `app/lib/arrangement/__tests__/strings.test.ts`

   Items 3–7 change only the collision rows listed in §3.1, plus at most one shared helper per file for the hint text.
8. `app/lib/arrangement/__tests__/name-bar-hint-ui.test.tsx` (**new**)
9. `docs/implementation/2026/quarter-IV/221-name-and-hint.md`: the stage-b section, l.4, and the TODO section.

Nothing else is granted: no StudioWorkspace, `collection.ts`, e2e, perf, `package.json`, docs/technical or protected file.

## 6. A's checks (speed rules)
1. Run `bash ../tmp/studio-real-loop/b-round-302/claims-303.sh` before editing. The output must equal `claims-303-output.txt`.
2. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-302/covering-files.txt) app/lib/arrangement/__tests__/name-bar-hint-ui.test.tsx`, run **alone** (L38). B's sketch run (with the old tests): 19 files, 376 tests, 12 failing, exactly the collision rows (`b-round-302/sketch-covering-run.log`). After A: all green.
3. `npm run typecheck` and `npm run lint`.
4. Mutants m1–m5 (§3.1).
5. **code-reviewer** (9 paths). Pass its findings to B; act only on Medium+ inside the grants. A Medium+ regression is a STOP (L11).
6. Write `a-round-303.md` as you go.

## 7. Risks to neighbouring behaviour (C probes these)
- **The tempo seed text:** H-SEED and NB6.
- **The status-lifetime contracts** (Space/Stop after an add, range writes): LT15 and LT19 updated, plus H-JOURNEY Space after the add.
- **Library drop on the grid:** the SD/DE rows updated, plus H-FIRST-DROP.
- **Footer height and timeline fit:** H-BOX.
- **Screen readers:** H-SR. One announcement, not two.

## 8. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-303.md` and changes nothing else when:
- the claims output before editing differs from `claims-303-output.txt`;
- a grant cannot be byte-equal to its sketch, or a change is needed outside §5;
- a covering test outside the 12 listed collisions fails, or a test is above 50 % of its timeout;
- `npm run typecheck` fails, or lint reports a new finding in a granted file;
- a mutant stays green;
- the reviewer reports a Medium+ regression.

## 9. Next
- After C PASS and the gate, NAME-AND-HINT is complete (doc 221 `Completed`). Round 304 = **PERF-3c** (STUDIO-PERFORMANCE resumes; B consults `performance-optimizer` and `tech-lead` and re-measures before writing it). If C finds a Medium+ here, the bounded fix-up comes first.
- Round 305 is **RETRO** (window 290–304). It includes the whole-screen and journey review, the "For Saba" proposals (`CLAUDE.md` tagline, B-R301-DOCS-OLD-NAME) and the awaiting-user questions.
- The next regression is due on or after 2026-11-05.
- ARCH-CHECKPOINT-STUDIO-LINK is still unanswered and does not block.

## 10. Commit readiness
After C PASS and the gate, root publishes the 9 §5 paths.
