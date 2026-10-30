# Round 268: GATE264-S2 fix-up. C-R267-01: during a drag, Ctrl+AltGraph+Arrow moves the insert marker (Medium)

**Planned by:** B, at the round 267 → 268 planning, 2026-10-30.

**Decisions:**
- D-29z571: the round-267 result (C FAIL, gate 267 skipped, dirty tree kept);
- D-29z572: B's ruling on A's STOP A-R267-REVIEW-GESTURE-ARROW and C-R267-01 (L10);
- D-29z573: Saba's 2026-10-30 answers recorded (SABA-B-7, SABA-B-11c);
- D-29z574: the order of the next rounds;
- D-29z575: B's planning gap, the signal and the lesson clause.

**Read first:** `lessons.md` in full. These apply directly:
- L4 (one element, one rule: this round's cause);
- L10 and L11 (STOP);
- L23 (B's scratch pre-check, §3);
- L28 (doc 199 l.4 is re-granted for round 268);
- L29 (claims, §7);
- L31 (timeouts);
- L50 and L51 (§2.5).

**Previous task:** `tasks/round-267.md` (exact copy of the round-267 `current-task.md`).
- C's result: `c-round-267.json` = **FAIL**, with `browserVerified` true and `realVerified` true. Every §4 row of round 267 passed; the round failed only on C-R267-01.
- Gate 267: `skipped` ("C taskStatus FAIL"). Nothing was published.

**What this round is:** the bounded fix-up of round 267 (D-29z568: "C finds a Medium or higher in a changed path → fix-up with the same grants"), with B's ruling on A's STOP. One condition is added to one line. Everything round 267 built stays.

## Baseline: HEAD `7ba7cd2` plus A's round-267 diff (NOT clean)
- HEAD is still `7ba7cd297accd7c1fadda76f95f54342a93205ef` [K1]. The gate skipped round 267, so the working tree carries A's round-267 work on exactly the 3 grant paths [K1]:
  - ` M app/components/arrangement/StudioWorkspace.tsx`: 1 added line (`commandChord`) and 11 substitutions [K8, K18];
  - ` M app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`: the new `describe` block with AG1–AG6 [K15, K17];
  - `?? docs/implementation/2026/quarter-IV/199-gate264-s2-altgr-shortcuts.md`.
- **A builds on this diff. Never revert, re-create or reformat it.** Planning snapshots (loop root): `b-round-267/tree-diff-at-planning.diff`, `b-round-267/meta-shortcuts-ui.test.at-planning.tsx`, `b-round-267/doc199.at-planning.md`, `b-round-267/git-status-at-planning.txt`.
- **Grant (edit):** `b-round-267-r268-grants.txt`, the same 3 files:
  - `StudioWorkspace.tsx`: only the `handleKeyDown` function, and only the one change in §2.1. The round-267 lines stay as they are.
  - `meta-shortcuts-ui.test.tsx`: **add-only against the planning snapshot.** Add AG7 and AG8 inside the existing `GATE264-S2` `describe` (after AG6). Every line of `b-round-267/meta-shortcuts-ui.test.at-planning.tsx` stays byte-identical; names may be added to existing import lines.
  - doc 199: l.4 and the sections named in §2.3.
- **Not granted:** everything else, including `shortcuts.ts`, `view.ts`, `ArrangementContext.tsx`, `ArrangementMarkerRow.tsx`, every other test, `perf/**`, `e2e/**`, `package.json`, `.claude/**`, `CLAUDE.md`, and the protected auth and purchase files and the rest of `global_forbidden_files` in `backlog.json` (for example `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth*`, `app/contexts/AuthContext.tsx`).
- **Scope check:** `git status --porcelain` lists only the 3 grant paths, as at planning.

## 0. Why this round
**C-R267-01 (Medium, a regression in a changed hunk).** C reproduced it in Chromium at both viewports against a HEAD control (`c-round-267/gesture-diff.json`, `gesture-head.json`). B reproduced it again at this planning on the current tree (`b-round-267/probe-arrow-tree.json`, 0 page errors):
1. Open `/studio-lab`, wait for "Demo collection ready", add one clip (first library option, Enter).
2. Click 300 px into the clip (marker 7.500), blur.
3. Press the mouse on the clip and move 6 px, holding the button (a pointer gesture is active).
4. Dispatch `keydown {key:'ArrowRight', code:'ArrowRight', ctrlKey:true, modifierAltGraph:true}` on `document.body` (altKey false).
5. Result: the marker jumps 7.500 → 101.352 (the clip end) during the drag, no blocked message. At HEAD the same chord was blocked with "Editing does not work while dragging — let go first.".

**Cause** [K2, K3, K4, K8]:
- Round 267 put `commandChord` on the whole gesture-block arm, including its ArrowLeft/ArrowRight alternatives (HEAD l.2323 `((modifier &&` → tree l.2324 `((commandChord &&`). For Ctrl+AltGraph without altKey, `commandChord` is false and `!modifier` is false, so the arm no longer catches the chord.
- The Ctrl+Arrow branch (HEAD l.2420, `(event.ctrlKey && !event.altKey)`) has no AltGraph term, so the chord reaches `stepMarker` (HEAD l.2443) mid-gesture.
- The same branch also steps the marker for this chord **without** a gesture: measured on the tree (`probe-arrow-tree.json` → `noGesture.ctrlAltGraphNoAlt`), inferred at HEAD (the branch is unchanged).

**Reachability.** Contract state only, the same as AG6: in this headless Linux Chromium, real input never produces AltGraph without altKey (`c-round-267/c267-browser.json` → `platformProbe`). No real platform has been shown to send it. The Medium stays as C rated it: the fix is one condition, and it restores the rule round 267 set out to enforce.

**Planning gap (B's, D-29z575).** Round 267's §2.1.2 put `commandChord` on the whole arm while §2.1.3 froze the Ctrl+Arrow branch. Two clauses bound one key path (L4), and §3 "At risk" had no gesture + Ctrl+Arrow row. A stopped correctly (L11).

## 1. B's ruling (L10, D-29z572)
**The rule:** a chord with Alt or AltGraph held is never a command chord anywhere in `handleKeyDown`. It is not executed, not gesture-blocked and not `preventDefault`-ed. This is the rule round 267 already applies to the letters (AG5); it now applies to the Ctrl+Arrow branch too.

**Fix option (a)** from `a-round-267.md`. Option (b) (keep `modifier` for the two Arrow alternatives in the gesture arm) is rejected: it leaves the no-gesture Ctrl+AltGraph+Arrow step open, and the gesture arm's letters and arrows would follow different rules.

| Chord + ArrowLeft/ArrowRight | HEAD `7ba7cd2` | Round-267 tree | **Round 268 (ruled)** |
|---|---|---|---|
| gesture + Ctrl+AltGraph (altKey false) | blocked + message, prevented | **marker moves**, prevented | marker unchanged, status unchanged, **not prevented** |
| gesture + Ctrl+Alt / Meta+Alt / Ctrl+Alt+AltGraph | blocked + message, prevented | silent, not prevented | silent, not prevented (**accepted change from HEAD**) |
| gesture + plain Ctrl | blocked + message, prevented | same | same as HEAD |
| no gesture + Ctrl+AltGraph (altKey false) | marker steps (inferred) | marker steps (measured) | marker unchanged, not prevented |
| no gesture + plain Ctrl | marker steps to the next clip edge | same | same as HEAD |
| macOS Alt+Arrow (Apple arm) | marker steps | same | same as HEAD (Alt is that arm's command; untouched) |

**Why the change from HEAD in row 2 is accepted.** The blocked message ("Editing does not work while dragging — let go first.") tells the user an edit was refused. An Alt chord on Arrow is no edit in CZABA, so the message is misleading. Silence is the smallest honest behaviour and matches the letter rule (AG5). It is listed here as a change, not hidden under "unchanged".

**Where the chord lands.** Between the Ctrl+Arrow branch and `if (modifier) { return; }` (HEAD l.2459) the handler has one top-level `if`: the Ctrl+G branch, whose `key` is `shortcutLetter(event)` = `'arrowright'` for an arrow [K4, K5]. So rows 1, 2 and 4 fall through to the silent `return` (not prevented). B measured this on the sketch in the browser (§3).

## 2. A: what to do
### 2.1 Behaviour (only `handleKeyDown` in `StudioWorkspace.tsx`)
1. In the Ctrl+Arrow branch, change only the Ctrl arm `(event.ctrlKey && !event.altKey)` [K2] so that it also requires `!event.getModifierState('AltGraph')`. B's sketch: `b-round-267/sketch-r268.diff`:
   `((event.ctrlKey && !event.altKey && !event.getModifierState('AltGraph')) ||`
   Biome formats it unchanged (`lineWidth` 100 [K16]; the line is 92 characters).
   - Equivalent alternative: `(commandChord ||`. The branch already requires `!event.metaKey`, so it means the same. A picks one and names it in the report.
2. **Do not change:**
   - the Apple Alt+Arrow arm [K6];
   - the gesture-block arm (it keeps `commandChord` from round 267) [K8];
   - any other round-267 line, the KeyO branch, Space, `timelineNavigationKey`, `if (modifier) { return; }`, any status string or sheet text.

### 2.2 Tests: add-only, inside the existing `GATE264-S2` describe, after AG6
Reuse the block's helpers (`press`, `addOneClip`, `live`, `CTRL`, `selectOnlyClip`) and `live(api).getLocatorPosition()` [K9], which returns the insert marker while stopped [K13]. The gesture technique is AG5's `claimPointerGesture(42, () => {})` [K10]. Put the state recipe first: 1 clip, `selectOnlyClip`, then `act(() => live(api).setInsertMarker(clip.start + 1))`, and assert the locator reads that value before any key. B ran this recipe in this file's mount on the scratch copy (5/5 green on the sketch).

| Row | Start state | Action | Expected |
|---|---|---|---|
| AG7 (`it.each` over 4 variants: Ctrl+AltGraph with `altKey: false`, Ctrl+Alt, Meta+Alt, Ctrl+Alt+AltGraph) | 1 clip, marker inside it, gesture claimed | chord + `{ key: 'ArrowRight', code: 'ArrowRight' }`, then chord + ArrowLeft | `getLocatorPosition()` unchanged; status unchanged and not `GESTURE_EDIT_BLOCKED_MESSAGE`; both not prevented |
| | | plain Ctrl+ArrowRight (positive control), then release the gesture | status `GESTURE_EDIT_BLOCKED_MESSAGE`; locator unchanged |
| AG8 | 1 clip, marker inside it, **no** gesture | `{ key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: false, modifierAltGraph: true }` | locator unchanged, status unchanged, not prevented |
| | | plain Ctrl+ArrowRight (positive control) | locator moves to a later clip edge (greater than before) |

AG7's first variant and AG8 are contract rows, not claims about a real platform (as AG6).

**Red-proofs** on a scratch copy outside `store/`, logged to `a-round-268/`, scratch restored afterwards:
- **M-ARROW:** remove the new AltGraph term. AG7's Ctrl+AltGraph variant and AG8 go red; name the rows and lines. (B ran this: the current tree is M-ARROW, and B's throwaway AG7/AG8 sketch rows went red exactly there, `b-round-267/recipe-ag7-ag8-tree.txt`; green on the sketch, `recipe-ag7-ag8-sketch.txt`.)
- **M-GESTURE** (round 267's mutant, re-run): in the gesture arm, change `commandChord` back to `modifier` (HEAD's arm). AG5 and **all four** AG7 variants go red (each chord then gets the blocked message and is prevented).

**Timeouts (L31).** A's round-267 run: `meta-shortcuts-ui.test.tsx` 25/25, the AG rows about 70–100 ms each against the 5 s default. Report any new row above 2.5 s at the top of the report.

### 2.3 Implementation doc 199 (L26, L28)
- l.4 becomes exactly `**სტატუსი:** Completed (C round 268 PASS)` (L28 re-dispatch clause).
- Add the Ctrl+Arrow change and this ruling to the existing sections (the "მიდგომა" or architecture text, "შეცვლილი ფაილები", "პრობლემები და გადაწყვეტები" as a Problem → Solution entry citing C-R267-01, "ტესტირება" with AG7, AG8 and the two new mutants).
- In "TODO / შემდეგი ნაბიჯები", replace the "B-ს გადაწყვეტილებას ელოდება (A-R267-REVIEW-GESTURE-ARROW…)" item with the ruling's outcome (resolved in round 268). Keep the other TODO items.
- TEMPLATE's seven headings stay in order; cite only rows that exist.

### 2.4 Checks (speed rules), from `store/`
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the 2 granted code files.
- `npx vitest run` on these 13 files: `app/lib/arrangement/__tests__/` `meta-shortcuts-ui.test.tsx`, `overview-visibility-ui.test.tsx`, `shortcut-sheet-ui.test.tsx`, `insert-marker-ui.test.tsx`, `marker-edge-nav-ui.test.tsx`, `grid-snap-keys.test.tsx`, `grid-adaptive-ui.test.tsx`, `grid-triplet-ui.test.tsx`, `clip-envelope-ui.test.tsx`, `track-group-collapse-ui.test.tsx`, `track-groups-ui.test.tsx`, `background-time-selection-ui.test.tsx`; and `app/lib/__tests__/focus-source-typing.test.tsx` (it lives there, not in the arrangement folder).
- 3 files are changed, so run the read-only `code-reviewer` subagent and pass its Architecture note to B.
- No full suite and no `npm run verify`: those are gate rows.

### 2.5 Focus and status (L50, L51)
- **L50:** the 20 hits of the round-267 grep over `StudioWorkspace.tsx` all lie outside `handleKeyDown` (HEAD 2206–2584) [K7, K11]. Same class ruling as round 267: out of scope. This change only removes one action path for an Alt/AltGraph chord; nothing mounts or unmounts.
- **L51:** no status write is added. The change removes one path to `stepMarker` for one chord; the handler's status writes stay at HEAD l.2263, 2341, 2566 [K12]. AG7 covers both sides of the blocked message.

### 2.6 STOP conditions (L11: write them at the top of `a-round-268.md`)
- A needed change outside the 3 grants, outside `handleKeyDown`, or to a round-267 line.
- An existing test goes red. B's pre-check (§3) found none.
- A line of the planning snapshot of `meta-shortcuts-ui.test.tsx` changes, other than names added to an import line.
- A §2.2 mutant stays green and you cannot show it is equivalent.
- A test runs above 50 % of its timeout.

## 3. Neighbouring behaviour at risk, and B's pre-check (L23)
**Pre-check on a scratch copy** (`/tmp/b267-scratch` = `git archive HEAD` + the round-267 tree diff + doc 199 + `sketch-r268.diff`):
- `npx vitest run` on every test file under `app/` that mentions `altKey|modifierAltGraph|getModifierState|ctrlKey|metaKey|Control+|Meta+|claimPointerGesture`: **54 files, 1065/1065 pass** (`b-round-267/precheck-files.txt`, `precheck-vitest.txt`).
- `tsc --noEmit`: rc 0 (`b-round-267/precheck-typecheck.txt`).
- **Collisions: 0.**

**Browser, both viewports, 0 page errors** (`b-round-267/probe-arrow.mjs <base> <out.json>`; the sketch served on scratch :5174, stopped afterwards; the control is the current tree on :5173):

| Case | Tree (`probe-arrow-tree.json`) | Sketch (`probe-arrow-sketch.json`) |
|---|---|---|
| gesture + Ctrl+AltGraph (no alt) | marker 7.500 → 101.352, prevented | 7.500, not prevented, no message |
| gesture + Ctrl+Alt, Meta+Alt, Ctrl+Alt+AltGraph (dispatched) and real `Control+Alt+ArrowRight` | silent, not prevented | same |
| gesture + plain Ctrl (dispatched and real) | blocked message, prevented | same |
| no gesture + Ctrl+AltGraph (no alt) | 7.500 → 101.352, prevented | 7.500, not prevented |
| no gesture + Ctrl+Alt, Meta+Alt, Ctrl+Alt+AltGraph, real `Control+Alt+ArrowRight` | silent | same |
| no gesture + plain Ctrl (dispatched and real) | 7.500 → 101.352 | same |

**At risk.** Each item is covered by A's test list or by C's rows:
- plain Ctrl+Arrow edge navigation (`marker-edge-nav-ui.test.tsx`, C's NOGESTURE-ARROW positive control);
- the macOS Alt+Arrow arm (no Ctrl, so the AltGraph term cannot affect it; `marker-edge-nav-ui.test.tsx`);
- the gesture block for plain Ctrl+Arrow and for plain Arrow/Delete/Enter/M (AG7's control; `track-groups-ui.test.tsx`);
- every round-267 row (AG1–AG6 and C's round-267 browser rows, re-run in §4).

## 4. C: what to verify
Run the browser rows at 1440×900 and 1280×720, in a fresh anonymous context on `http://127.0.0.1:5173/studio-lab`. Wait for "Demo collection ready" first (L48).

| Row | Steps | PASS when |
|---|---|---|
| SOURCE-SCOPE | `git rev-parse HEAD`; `git status --porcelain` | HEAD is `7ba7cd2`; only the 3 grant paths are listed |
| HUNK-SCOPE | `git diff -U0 app/components/arrangement/StudioWorkspace.tsx`; loop root: `diff b-round-267/meta-shortcuts-ui.test.at-planning.tsx <store test file>` | the code diff is the round-267 diff (1 added line, 11 substitutions) plus exactly 1 more substitution, on the Ctrl+Arrow line (HEAD l.2420) [K2]; every hunk lies between HEAD l.2206 and 2584 [K7]; the test diff against the snapshot is add-only (import-line additions allowed) |
| CLAIMS | re-run §7 K1–K20 verbatim | every output matches |
| TESTS-TARGETED | the §2.4 file list | all green; report the counts |
| MUTANTS | on C's own scratch: M-ARROW, M-GESTURE, M-AG and at least 2 per-branch mutants of round 267 | each turns its named rows red (M-GESTURE: AG5 and all four AG7 variants) |
| GESTURE-ARROW | `b-round-267/probe-arrow.mjs` (or `c-round-267/c267-gesture.mjs`) on :5173, gesture mode, all 7 cases | Ctrl+AltGraph (no alt): marker unchanged, `dispatchEvent` true, no blocked message; Ctrl+Alt, Meta+Alt, Ctrl+Alt+AltGraph and real `Control+Alt+ArrowRight`: marker unchanged, no blocked message, dispatched ones return true; plain Ctrl (dispatched and real): blocked message, marker unchanged, dispatched one returns false |
| NOGESTURE-ARROW | the same script, no-gesture mode | Ctrl+AltGraph (no alt) and every Alt variant: marker 7.500 unchanged, dispatched ones return true; plain Ctrl+ArrowRight (dispatched and real): marker moves to the clip end (101.352 in B's run), dispatched one returns false |
| MAC-ALT-ARROW | `b-round-267/probe-mac-alt.mjs <base> <out.json>`: a fresh context with a macOS Chrome `userAgent` and `navigator.platform` `MacIntel` (init script); 1 clip, click 300 px in, blur; real `Alt+ArrowRight` | marker moves 7.500 → 101.352 (the Apple arm still works; B's recipe run on the tree: `b-round-267/probe-mac-alt-tree.json`) |
| R267-ROWS | round 267's browser rows ALTGR-UNDO, ALTGR-EDIT, CTRLALT-REAL, META-ALT-REAL, POS-CTRL 1–5, FOCUS-ALT (`tasks/round-267.md` §4) | all as in round 267 |
| DOC-199 | l.4; the headings; grep the cited rows | l.4 byte-exact `**სტატუსი:** Completed (C round 268 PASS)`; TEMPLATE's 7 headings in order; every cited row (AG1–AG8) exists in the test file; the TODO no longer says the STOP awaits B |
| G268-AUTH | `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token` with no header | workspace and demo notice shown, `auth_user` null; "Sign in required", 0 `audio[src]`; 401, no token |
| Gate rows | full vitest, build, Biome full, `npm run verify`, `npm run test:e2e:smoke` | **gate**, not claimed |

**Ableton conformance**, judged separately:
- Ctrl+Alt+letter rows: "confirmed" (Live 12 manual ch. 42, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/, §42.1/§42.12/§42.16/§42.19: Ctrl+Alt+letter is a different command);
- Ctrl+Arrow marker step outside a drag: CZABA's edge navigation, as accepted in earlier rounds (SABA-Q-10A-CTRL-ARROW-RANGE stays with Saba);
- **Ctrl+Alt+Arrow or AltGr+Arrow during a drag: no reference found.** B searched ch. 42 (WebFetch at round-266 planning, read to character 100000) for "Alt", "AltGr" and the arrow-key rows; no entry describes a chord during a mouse drag. C writes "no source, not judged".

**Not in scope:** real Windows AltGr hardware (TLM-R232-ALTGR-WIN stays with Saba); Linux AltGr without `ctrlKey` (B-R266-LINUX-ALTGR-PLAIN-LETTERS, Tech Lead list).

**Screen budget (L39):** nothing visible is added or changed.

## 5. Outcome, fixed in advance (D-29z574)
- **PASS and gate published:** GATE264-S2 and C-R267-01 close. Round 269 = **SABA-B-7** (Saba's 2026-10-30 answer: option A dB taper), unless REGRESSION is due (on or after 2026-11-02 at planning time).
- **Gate fail:** a bounded fix-up with the same grants.
- **C finds a Medium or higher in a changed path:** a fix-up with the same grants.
- **STOP:** B rules first (L10).

## 6. Next rounds (not this round; D-29z574)
1. **SABA-B-7** (agreed 2026-10-30): envelope axis and interpolation on the lane-fader dB scale (0 to −60 dB, bottom −∞), scheduling in short linear ramps of ≤ 0.5 dB, readout in dB (listed deviation from Live's %), saved projects keep their point gains but change shape between points (D-29z573). Reference: `user-review/AGREE-SABA-B-7.md`, `reference/ableton-live-measurements-2026-10-30.md`.
2. **GATE266-S1** (Medium regression from SABA-B-11c stage 1) with GATE266-S4 and B-R266-CLIPS-SPLIT-COPY; B reproduces it in the browser first.
3. **SABA-B-11c stage 2** (relative snap, option (a)); closes R49-T and F1-ABSOLUTE-SNAP on C PASS.
4. Then SYS-6, as ordered. REGRESSION goes first whenever it is due (on or after 2026-11-02).

## 7. Claims (L29)
C re-runs each command verbatim. Commands run from `store/` unless marked "loop root". Set `W=app/components/arrangement/StudioWorkspace.tsx` and `T=app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`. HEAD facts read HEAD through `git show HEAD:` and do not change with A's diff. Tree facts above l.2421 (K8) are not moved by the one-line change. Planning-tree facts are pinned to loop-root snapshots. In the table, `\|` stands for a literal `|`.

| Tag | Claim | Command | Expected output |
|---|---|---|---|
| K1 | HEAD and the planning tree | `git rev-parse HEAD`; loop root: `cat b-round-267/git-status-at-planning.txt` | `7ba7cd297accd7c1fadda76f95f54342a93205ef`; the 3 lines ` M app/components/arrangement/StudioWorkspace.tsx`, ` M app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`, `?? docs/implementation/2026/quarter-IV/199-gate264-s2-altgr-shortcuts.md` |
| K2 | the Ctrl arm of the Ctrl+Arrow branch at HEAD | `git show HEAD:$W \| grep -n "((event.ctrlKey && !event.altKey) \|\|"` | 1 line: `2420:        ((event.ctrlKey && !event.altKey) \|\|` |
| K3 | the keyboard marker step at HEAD | `git show HEAD:$W \| grep -n "markerRowRef.current?.stepMarker("` | 1 line at `2443:` |
| K4 | the only top-level branches between the Ctrl+Arrow branch and the modifier return | `git show HEAD:$W \| awk 'NR>=2447 && NR<=2459' \| grep -n "^      if ("` | `2:      if (modifier && key === 'g' && !event.altKey) {` and `13:      if (modifier) {` |
| K5 | `key` for an arrow is the lower-cased `event.key` | `git show HEAD:$W \| grep -n "event.code.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase()"` | 1 line at `498:` |
| K6 | the Apple Alt+Arrow arm | `git show HEAD:$W \| grep -n "isApplePlatform(navigator.platform, navigator.userAgent)))"` | 1 line at `2423:` |
| K7 | the handler's bounds at HEAD | `git show HEAD:$W \| grep -n "const handleKeyDown = (event: KeyboardEvent)\|window.addEventListener('keydown', handleKeyDown)"` | `2206:` and `2606:` |
| K8 | round 267's `commandChord` and the gesture arm in the tree | `grep -n "((commandChord &&\|const commandChord = " $W` | `2270:` (the declaration) and `2324:        ((commandChord &&` |
| K9 | the locator getter | `grep -n "getLocatorPosition: () => number;" app/contexts/ArrangementContext.tsx` | 1 line at `324:` |
| K10 | AG5's gesture technique | loop root: `grep -n "claimPointerGesture(42" b-round-267/meta-shortcuts-ui.test.at-planning.tsx` | 1 line at `436:` |
| K11 | the L50 counts | (a) `git show HEAD:$W \| grep -cE "onPointerDown(Capture)?\|onBlur\|settleEditor\(\|\.focus\(\|^\s*\{[^}]*(\.map\(\|&&\|\?)"`; (b) the same pattern with `-nE` piped to `awk -F: '$1>=2206 && $1<=2584' \| wc -l` | (a) `20`; (b) `0` |
| K12 | the handler's status writes at HEAD | `git show HEAD:$W \| grep -n "setStatus(" \| awk -F: '$1>=2206 && $1<=2584' \| cut -d: -f1 \| tr '\n' ' '` | `2263 2341 2566 ` |
| K13 | the locator getter returns the insert marker while stopped | `grep -n "isPlayingRef.current ? livePosition() : insertMarkerRef.current" app/contexts/ArrangementContext.tsx` | 1 line at `1480:` |
| K14 | doc 199 l.4 at planning | loop root: `sed -n 4p b-round-267/doc199.at-planning.md` | `**სტატუსი:** Completed (C round 267 PASS)` |
| K15 | the test-file snapshot | loop root: `sha256sum b-round-267/meta-shortcuts-ui.test.at-planning.tsx`; `wc -l < b-round-267/meta-shortcuts-ui.test.at-planning.tsx` | `07e7ba1c9af88797707eb5f73b00dac67dbad64e74e5a42d3069143ab31060fe`; `468` |
| K16 | Biome line width | `grep -n '"lineWidth"' biome.json` | `46:    "lineWidth": 100` |
| K17 | the describe blocks in the snapshot | loop root: `grep -n "^describe(" b-round-267/meta-shortcuts-ui.test.at-planning.tsx` | `212:` (L46-CONTRACT-CHECKS) and `321:describe('GATE264-S2: …` |
| K18 | the round-267 code diff at planning | loop root: `awk '/^diff --git a\/app\/components/{f=1;next} /^diff --git/{f=0} f' b-round-267/tree-diff-at-planning.diff \| grep -c "^+ "`; the same with `"^- "` | `12`; `11` (1 added declaration + 11 substituted lines) |
| K19 | the blocked-message import in the snapshot | loop root: `grep -n "^  GESTURE_EDIT_BLOCKED_MESSAGE," b-round-267/meta-shortcuts-ui.test.at-planning.tsx` | 1 line at `8:` |
| K20 | 199 is the doc number in use (no new doc this round) | `git ls-tree --name-only HEAD docs/implementation/2026/quarter-IV/ \| sort -V \| tail -1` | `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md` |

**Browser claims (§0, §3):** loop root `b-round-267/probe-arrow-tree.json` and `b-round-267/probe-arrow-sketch.json`; script `b-round-267/probe-arrow.mjs <base> <out.json>`.
