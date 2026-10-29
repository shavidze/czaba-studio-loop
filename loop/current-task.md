# Round 253: SABA-B-10a stage 2b fix-up — the stale Follow/playing status after Stop, and the paused-Follow copy

This round fixes three closely related Lows. They share one root cause: a status or title that was written during playback stays on screen after Stop, or after round 252 changed what pauses and resumes Follow, and is then false.

- **Item 1 (C-R252-01, Low).** This bug fails the round-252 row C-FOLLOW-STOP-252.
  - **Problem:** after a ruler click pauses Follow, Stop resumes Follow, but the stopped screen still reads `Insert marker at 00:06.500 — playback continues, Follow paused. …`.
  - **Fix:** when playback stops and the status is one of the **three playing-only texts** (`insertMarkerWhilePlaying(marker)`, `insertMarkerWhilePlayingFollowPaused(marker)`, `followPaused`), the stop replaces it with `insertMarkerAfterStop(marker)` = `Stopped — Space plays from the insert marker at 00:06.500.` Every other status is left alone.
- **Item 2 (B-R253-STALE-PLAYING-STATUS, Low, pre-existing at HEAD; fixed by the same conditional).** The same stale text appears without a Follow pause:
  - with Follow off, a ruler click during playback and then Stop leaves `… playback continues …`;
  - a scroll that pauses Follow, then Stop, leaves `Follow paused by manual navigation …` although Follow is on again.
- **Item 3 (C-N252-FOLLOW-TITLE, Low, L29 changed-meaning).** `followPausedTitle` and `followPaused` still say "Follow or Play resumes it". After round 252, Stop also resumes Follow and a ruler click also pauses it. The new texts:
  - title (it does not name a cause): `Follow paused — press Follow, or stop playback, to resume`;
  - status (written only by the manual-navigation pause): `Follow paused by manual navigation. Press Follow, or stop playback, to resume it.`
- **Doc 191:** l.4 becomes `Completed (C round 253 PASS)`, under L28's re-dispatch clause.

**Planned by:** B, at the round 252 → 253 planning, 2026-10-29. **Decisions:** D-29z461…D-29z466.

**Why this round (D-29z461):**
- **C round 252: FAIL**, with `browserVerified` and `realVerified` both true. Every other row passed at both viewports. One row failed as written: C-FOLLOW-STOP-252 (C-R252-01).
- **Gate 252 was `skipped`** (C taskStatus FAIL). Nothing was published, and HEAD is still `83b7c75`.
- **The 13 round-252 files stay in the working tree** (policy: preserve partial work). Gate 253 publishes rounds 252 and 253 together.
- **B's ruling on C-R252-01 is option (a).**
  - The round-252 row could be read two ways. A read it as "not `followResumed`"; C read it as "no Follow text on the stopped screen". C's plain reading wins.
  - The false "Follow paused" clause is new in round 252, and it stays on screen while the Follow button reads `Follow`.
  - The fix is a few lines in a file this stage already owns. Deferring a false sentence would not be the smallest honest behaviour (the user's rule).
- **Item 2 is folded in.** It uses the same conditional and costs nothing extra; leaving it out would make the difference between the two cases silent.
- **Item 3 is folded in.** It touches the same grants (`strings.ts`, `strings.test.ts`, `navigation-strings-ui`) and has the same L29 cause.
- **REGRESSION is not due today.** `regression-last.json` is dated 2026-10-27, and today (2026-10-29) is only 2 days later; the rule needs ≥ 3 days. It **is due at the next planning** if that falls on or after 2026-10-30 (§7).

**Read first:** `lessons.md` in full. These lessons apply directly:
- **L51:** status clobber. §1.1 replaces only the listed texts.
- **L29:** a changed meaning makes every readout a consumer.
- **L3:** the widest state. C-STATUS-WIDE re-measures the new `followPaused`.
- **L23:** B's pre-check, in §0.2.
- **L28:** doc 191, re-dispatch clause.
- **L39:** nothing persistent is added.
- **L52:** playing-branch asserts in jsdom.

## 0. Baseline and scope

**Start state (not a clean tree):**
- **HEAD** = `83b7c756ce3108d0e31f023a1aa2b0e59547d913` (`b-round-252/head-at-planning.txt`).
- **`git status --short --untracked-files=all` lists exactly the 13 round-252 files as `M` and nothing untracked** (`b-round-252/git-status-at-planning.txt`, 13 lines). These are the 6 grants (§0.1) plus the 7 carried files.
- **STOP (L11)** if HEAD differs, if the status lists anything else, or if any hash check below fails. Exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Hash checks.** Run all of them from `store/`; each gave rc 0 at planning.
- **Frozen, unchanged since HEAD.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-252-r253-tree-sha256.txt` covers **1,097** files, the same list as round 252.
  - The list includes the 7 protected auth and purchase files, each once. `git diff --quiet HEAD` gives rc 0 on each:
    - `app/routes/studio.$productId.tsx`
    - `app/routes/api.studio-token.ts`
    - `app/routes/account.downloads.tsx`
    - `app/lib/__tests__/download-routes.test.ts`
    - `app/lib/auth.ts`
    - `app/contexts/AuthContext.tsx`
    - `app/entry.server.tsx`
  - It also includes `ArrangementContext.tsx`, `ArrangementTransport.tsx` (which only references `followPausedTitle`), `mode-toggle-colour-ui.test.tsx`, `grid-snap-menu.test.tsx`, `markers-move-ui.test.tsx` and `focus-reveal-ui.test.tsx`.
- **Carried: the round-252 end state, which must stay byte-equal.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-252-r253-carried-sha256.txt` covers 7 files:
  - `ArrangementMarkerRow.tsx`
  - `insert-marker-ui.test.tsx`
  - `markers-ui.test.tsx`
  - `marker-edge-nav-ui.test.tsx`
  - `status-announcement-ui.test.tsx`
  - `clip-strings-ui.test.tsx`
  - `track-layout.test.tsx`
- **Grants start state (the round-252 end state):** `b-round-252-r253-grants-start-sha256.txt`, with copies in `b-round-252/r253-granted-start/`.
- **Root-owned files, which must equal HEAD:** `b-round-252-r253-root-files-start-sha256.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). No dependency is needed.
- **Controls for C:**
  - **HEAD control** (pure `83b7c75`): a tar copy of the store with `b-round-251/r252-granted-start/` restored.
  - **Round-252 control:** a tar copy of the store with `b-round-252/r253-granted-start/` restored.

### 0.1 Grants (`b-round-252-r253-grants.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Items 1–2: the stop branch of the `isPlaying` effect (§1.2). Nothing else. |
| 2 | `app/lib/arrangement/strings.ts` | New `studioPlaybackStrings.insertMarkerAfterStop`; changed `studioViewStrings.followPausedTitle` and `followPaused` (§1.3). |
| 3 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | FW6 amended; new FW8, FW9 and FW10 (§2). |
| 4 | `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>ST17: the two new literals.</li><li>ST12: a sample for the new formatter.</li><li>The exact-key list of `studioPlaybackStrings`, if one exists, gets the new key.</li><li>ST11: the exact text of `insertMarkerAfterStop('00:06.500')`.</li></ul> |
| 5 | `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS3b: the two new literals. Nothing else changes. |
| 6 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | <ul><li>l.4 becomes exactly `**სტატუსი:** Completed (C round 253 PASS)`.</li><li>Add a round-253 part to each of the 7 TEMPLATE sections without rewriting earlier text.</li></ul> |

- **Every other file is frozen,** including the 7 carried files. `ArrangementTransport.tsx` needs no change because it only reads the key.
- **No assertion may be removed** unless a stronger one replaces it in the same place. A test whose only change is a removed assertion is a Medium bug (policy).
- **Read before editing:**
  - `AGENT_DISCOVERABLE_CODE.md` (for the new key)
  - `AUDIO_ARCHITECTURE.md`
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`
  - `.claude/prompts/studio-feature.md`

### 0.2 B's pre-check (L23, done)
**Setup:** the scratch `/tmp/b253-scratch` is a tar copy of the round-252 working tree with B's candidate fix applied (`b-round-252/precheck-fix.diff`, 47 lines). Results are in `b-round-252/precheck-fails.txt`.

**Results:**
- `tsc --noEmit` gives rc 0.
- `npx vitest run app/lib/arrangement app/components`: 165 files, 2,408 tests. **4 fail, all in granted files:**
  - FW6 (grant 3): its paused half pins "status unchanged after stop", and the new contract writes the stopped text.
  - NS3b (grant 5): the two old literals.
  - ST12 and ST17 (grant 4): the new formatter sample and the two literals.
- **Frozen neighbours stay green:** `mode-toggle-colour-ui`, GM24, `markers-move-ui`, `focus-reveal-ui`, `insert-marker-ui`, `status-announcement-ui` and `ArrangementContext.test`. In `mode-toggle-colour-ui`, the `'Follow paused'` in `expectModeTokens(…, 'Follow paused', …)` is only an `expect` message label.
- **Nothing on the stop path writes a status for this fix to clobber.**
  - The project-end auto-stop (`tick` → `stopPlayback`, context l.1153–1158) writes none.
  - A stopped ruler click writes none (the stopped branch of `setInsertMarker`).
  - So there is no existing stopped text to reuse, and one new key is needed.
- **Contract proved on the scratch.** FW6's paused half, amended to the exact stopped text (`00:06.000`) and `statusSequence` + 1, **passes**. At effect time, `workspaceRef.current.status` is the composed text and `getLocatorPosition()` returns the insert marker, not the stop position.
- **The diff is a sketch, not a prescription.** A may write it differently as long as the §1 behaviour and the §2 rows hold.

## 1. Rulings

### 1.1 What the stopped screen says (D-29z462)
| Status showing when playback stops (any cause: Space, the transport button, the project-end auto-stop) | Status after the stop |
|---|---|
| `insertMarkerWhilePlayingFollowPaused(fmt(marker))` | **`insertMarkerAfterStop(fmt(marker))`** |
| `insertMarkerWhilePlaying(fmt(marker))` | **`insertMarkerAfterStop(fmt(marker))`** |
| `followPaused` (the manual-navigation pause) | **`insertMarkerAfterStop(fmt(marker))`** |
| anything else (`followResumed`, tempo, edit, past-end, export, empty, …) | **unchanged** (no write) |

- **Definitions:** `marker` = `getLocatorPosition()`, read in the stop branch; while stopped, that is the insert marker. `fmt` = `formatArrangementTime(Math.max(0, …))`.
- **Residual case.** A playing text that names a time other than the current marker is left alone. This would need something to move the marker during playback without writing a status, so it is not in the three-text guard on purpose; matching by prefix risks clobbering. It is recorded as residual under B-R253-STALE-PLAYING-STATUS. C reports it if it sees it, and it is not a failure of this round.
- **Follow after a stop is unchanged from round 252:** `paused` → `on` silently, and `off` stays `off`. The replacement text has no Follow clause.

**Why this text:**
- Under 10a, after a stop Space plays from the insert marker (D-29z430). The sentence is therefore true at both viewports and in both BPM and no-BPM projects.
- It names neither Follow nor "playback continues".
- It is shorter than the composed text, so the status box cannot grow. C still measures it.

**Rejected alternatives:**
- Option (b), rewriting the row and putting the bug in `deferred_low_polish`: it leaves on screen a false sentence that this stage introduced.
- Writing `followResumed` on Stop: it is still a Follow text, and Live shows no message (§3).
- Clearing the status: an empty polite region gives no stop feedback and wipes unrelated text.
- Replacing every status on stop: it clobbers unrelated texts (L51), and the FW6 control half turns red.

### 1.2 Where it lives (D-29z462)
- **Owner:** the existing `useEffect` on `isPlaying` in `StudioWorkspace.tsx`, in its `!isPlaying` branch (around l.1918–1923). This effect already owns the stop resume.
- **Order in the branch:** first the Follow `paused → on` step (unchanged), then the conditional status replacement. The `isPlaying === true` branch is unchanged.
- **Reads** go through `workspaceRef.current` (`status`, `getLocatorPosition`, `setStatus`). The dependency list stays `[isPlaying, setFollowMode]`.
- **No context change.** `ArrangementContext.tsx` is frozen. The ref is assigned during render, so `workspaceRef.current.status` should not be stale when the effect runs. If it is stale, or if the guard never matches because `getLocatorPosition()` in the stop effect returns the stop position, A STOPs with evidence. B's scratch showed neither (§0.2).
- **L50 focus:** the hunk changes only status text; it does not move focus or unmount anything. C re-runs the round-252 L50 regex over grant 1, which gave 20 hits in `StudioWorkspace.tsx` in round 252. Any new hit needs a ruling.

### 1.3 Copy (D-29z463)
- **New key:** `studioPlaybackStrings.insertMarkerAfterStop: (time: string): string` returns `` `Stopped — Space plays from the insert marker at ${time}.` ``.
- **`followPausedTitle`** becomes `'Follow paused — press Follow, or stop playback, to resume'`.
  - It names no cause, because the title shows for both causes (a ruler click and manual navigation).
  - It keeps the `Follow paused` prefix.
- **`followPaused`** becomes `'Follow paused by manual navigation. Press Follow, or stop playback, to resume it.'`.
  - Only `pauseFollowForNavigation` writes it, so the stated cause is true.
  - It does not name the scrub strip, which does not exist in a no-BPM project; the strip's own title says `Click = play from here`.
- **L29 sweep (C re-runs it):** `grep -rn "Follow or Play\|press Follow or Play" app --include=*.ts --include=*.tsx` gives 0 hits.

### 1.4 Screen budget (L39) and Lows
- **Nothing persistent is added.** The status is transient, and the title is a tooltip.
- **A-R252-REVIEW-PLAYING-SOURCE** (Low, from A's reviewer) goes to `deferred_low_polish` with its repro (D-29z464). Its fix needs a ref-backed getter on the frozen context.

## 2. Rows (grants 3–5)
| Row | What it pins | Red-proof (named mutant A runs on a scratch) |
|---|---|---|
| FW6 (amended) | <ul><li>**Plain half (kept as the control):** strip click, then stop. Status and `statusSequence` are unchanged.</li><li>**Paused half:** lower-zone click during playback, then Space. Follow is `on` with text `Follow`, the status is **exactly** `insertMarkerAfterStop(fmt(marker))`, and `statusSequence` goes up by 1.</li><li>The two removed asserts (`toBe(pausedBeforeStop)` and the sequence equality) are replaced in place by these.</li></ul> | <ul><li>MU-STOP-NO-REPLACE (replacement deleted): paused half red.</li><li>MU-STOP-REPLACE-ANY (guard deleted): plain half red.</li></ul> |
| FW8 (new) | Follow `on`, playing, then a manual scroll (+200 px, `fireEvent.scroll`, as in NS3b): the status is `followPaused`. Then Space: Follow is `on` and the status is **exactly** `insertMarkerAfterStop(fmt(marker))`. | MU-STOP-NO-FOLLOWPAUSED (third clause deleted) |
| FW9 (new) | Follow `off` (button), playing, then a lower-zone click: the status is the HEAD text `insertMarkerWhilePlaying(t)`. Then Space: Follow stays `off` and the status is **exactly** `insertMarkerAfterStop(t)` (item 2). | MU-STOP-NO-PLAIN (first clause deleted) |
| FW10 (new) | During playback, reach `followResumed` with Follow `on`, then stop. The status stays `followResumed` and `statusSequence` is unchanged (no clobber, L51). | MU-STOP-REPLACE-ANY |
| NS3b (amended) | The two new literals, exact. The rest is unchanged. | MU-COPY-OLD (old literals restored) |
| ST11/ST12/ST17 (+) | The exact `insertMarkerAfterStop('00:06.500')` text, a sample of it in ST12, and the two exact literals in ST17. | MU-COPY-OLD |

- **FW10 recipe:** any sequence that gives `followResumed` with Follow `on` during playback. The known one is NS3b's: scroll to pause, then click Follow. A states the sequence used.
- **Helpers:** use the existing `bars-ruler-ui` helpers: `mountTempo90SnapOn`, `clickStrip`, `clickLower`, `clickAt`, `followButton`, `statusText` and `live(...).statusSequence`.
- **Mutant table:** A lists each mutant with its failing line in `a-round-253/mutants/summary.txt`, plus FIX-CONTROL, which must be green.

## 3. Reference: how Ableton Live 12 does it
**Source:** Live 12 Reference Manual, chapter 6 "Arrangement View", https://www.ableton.com/en/manual/arrangement-view/, section 6.2. B fetched the quote in round 252 (2026-10-29), and C checked it verbatim (`c-round-252.md` §AN-REVIEW).

| Behaviour | Ableton source | Confirmed there | CZABA decision / deviation | C check |
|---|---|---|---|---|
| Follow resumes on stop | 6.2: "Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area." | Follow restarts on stop. | Match (round 252, unchanged). | FW6, C-FOLLOW-STOP-253 |
| A status message on stop | None: Live has no status line (C round 252 §3). | – | **CZABA addition:** on stop, a playing-only text is replaced with `Stopped — Space plays from the insert marker at <t>.`, because a sentence that is true only during playback must not stay on the stopped screen. | FW6/FW8/FW9, C-FOLLOW-STOP-253 |
| Follow button tooltip while paused | No reference found. B searched the 6.2 text fetched in round 252, which describes the behaviour, not the tooltip. | – | The CZABA copy names the two resumes that exist in every project: Follow and stop. The scrub-strip resume exists only in a BPM project, and the strip's own title describes it. | NS3b, C-TITLES-253 |

There are no new deviations from Live. SABA-Q-FOLLOW-EDIT-RESTART (a)–(c) and SABA-Q-TIME-RULER-ROLE (b) stay `awaiting_user`, unchanged.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state.** Every §0 check gives rc 0, and the status is exactly the 13 `M` files.
2. **Implement** §1 and §2.
3. **Static checks.** Run `npm run typecheck`, `npx biome check` on grants 1–5, and `npm run lint`.
4. **Covering set.** Run `b-round-252/covering-253.txt` **alone** (130 files, the same set as round 252). Report the counts and any test above 50 % of its timeout (L11).
5. **Mutants.** Run the six mutants named in §2 plus FIX-CONTROL, on a tar scratch outside the repo. The repo `git status` must be identical before and after.
6. **Code review.** Run the code-reviewer subagent (6 files, so ≥ 3), and pass on its Architecture note.
7. **Playwright at both viewports**, a fresh page each time.
   - **Setup:** open `/studio-lab` and wait for `Demo collection ready`. Click `demo-stem-pulse`, then Add, blur, and press `=` four times (97.7 px/s, tempo 120).
   - **Sequences:** pause then stop; Follow off then stop (FW9); scroll-pause then stop (FW8).
   - **Aiming:** click the lower zone 300 px left of the scroller's right edge and confirm with `elementFromPoint` that the target is `arrangement-bars-ruler`. The metronome toggle overlaps the band at x ≈ 488.
   - **Output:** save the JSON and screenshots under `a-round-253/`.
8. **Report.** Write `a-round-253.md`: files changed, tests actually run, mutants, reviewer findings, and a STOP at the top if there is one.

## 5. C: acceptance
**Only these rows run this round.** The other round-252 rows keep their round-252 evidence for this tree, because their code paths are untouched: C-FOLLOW-PAUSE, SECONDS, RESUME, OFF, STOPPED and LANE; C-FOCUS; C-PASTEND; C-COPY; C-MUT-252.

Run each browser row at **1440×900 and 1280×720**, in a fresh context, with the setup from §4 step 7. Wait for `Demo collection ready` first (L48).

| ID | Check | Pass |
|---|---|---|
| C-SCOPE-253 | HEAD, status, hashes | <ul><li>HEAD is `83b7c75`.</li><li>The status is exactly the 13 round-252 `M` files, with nothing untracked.</li><li>The frozen (1,097), carried (7) and root checks give rc 0.</li><li>The 7 protected files give rc 0.</li><li>A `diff` against `b-round-252/r253-granted-start/` touches only grants 1–6.</li><li>Grant 1's diff stays inside the `!isPlaying` branch.</li></ul> |
| C-UNIT-253 | Run alone: `bars-ruler-ui`, `strings.test`, `navigation-strings-ui`, `mode-toggle-colour-ui` (frozen neighbour), `insert-marker-ui`, `status-announcement-ui` | <ul><li>All green.</li><li>FW6, FW8, FW9, FW10 and NS3b are present (grep the ids).</li><li>Every removed `expect` has its replacement in the same place.</li></ul> |
| C-MUT-253 | C re-runs at least 3 of A's mutants: MU-STOP-NO-REPLACE, MU-STOP-REPLACE-ANY and MU-STOP-NO-PLAIN | Each is red on its row, and FIX-CONTROL is green. |
| C-FOLLOW-STOP-253 | Play; click the lower zone (aim confirmed by `elementFromPoint`); press Space | <ul><li>`data-follow-mode="on"` and text `Follow`.</li><li>The status is **exactly** `Stopped — Space plays from the insert marker at <t>.`, where `<t>` equals the insert-marker time (`[data-insert-marker]`) and the time the paused text named.</li><li>A MutationObserver on the status shows exactly one write at the stop. This is the same fact as FW6's `statusSequence` + 1: one text replacement counts as one write, even if a single mutation record removes one node and adds another. `setFollowMode` touches the button, not the status region.</li><li>**Round-252 control:** the paused text stays.</li></ul> |
| C-STOP-PLAIN-253 | Turn Follow off (button); play; click the lower zone; press Space | <ul><li>Follow is `off`.</li><li>The status is exactly the stopped text for that time.</li><li>**HEAD control:** `… playback continues …` stays.</li></ul> |
| C-STOP-SCROLL-253 | Play; scroll the scroller manually by +200 px (the status becomes `Follow paused by manual navigation. Press Follow, or stop playback, to resume it.`); press Space | <ul><li>Follow is `on`.</li><li>The status is exactly the stopped text for the insert marker.</li></ul> |
| C-STOP-UNRELATED-253 | Two cases: play, then Space with no click (a plain stop); and a strip click at ≥ 13 s, then let playback reach the 16 s project end (auto-stop) | The stop does not change the status: the MutationObserver shows 0 writes at the stop (L51 clobber check). |
| C-TITLES-253 | The Follow button's `title` while paused (by a ruler click and by a scroll) and after the resume | <ul><li>Paused: exactly `Follow paused — press Follow, or stop playback, to resume`.</li><li>On: the HEAD `followOnTitle`.</li><li>The L29 sweep (§1.3) gives 0 hits.</li></ul> |
| C-STATUS-WIDE-253 | The new `followPaused` and the stopped text, at both viewports | One line each, with no transport overlap. Measure as in `c-round-252/c252.cjs` `statusBox`, with the round-252 composed text as the control. |
| C-NAV-ORIGIN-253 (rewritten row; no code change) | <ul><li>**Stopped:** the round-252 recipe. Place markers at 2 and 6; ruler click at 1; play about 3 s; stop; press Ctrl+→ until the status reads `No more markers after the insert marker`.</li><li>**Playing (reachable in the browser):** Home, Space, then two Ctrl+← within about 60 ms.</li></ul> | <ul><li>Stopped: as in round 252 (Ctrl+→ goes to marker 2 first).</li><li>Playing: `No more markers before the playhead`, and playback continues.</li><li>The playing "after the playhead" case at the project end is **jsdom-only** (IM24), because playback auto-stops at the end. C notes that it cannot be reached in the browser; that is not a failure.</li></ul> |
| C-BUDGET-253 | Persistent text lines, empty and demo projects | Equal to round 252: 85/101 at 1440, 69/85 at 1280. |
| C-LESSON-253 | `lessons.md` | ≤ 60 lines; L51 and L52 are present. |
| AN-REVIEW-253 | Doc 191 | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 253 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every cited row id exists, including FW8–FW10.</li></ul> |
| LAB-SMOKE-253 | `/studio-lab` loads, plays and exports a WAV | <ul><li>No page errors.</li><li>The export sha256 equals round 252's (`1fea093b…`). A change is a regression.</li></ul> |
| Auth | `/studio/<handle>` without a session | <ul><li>`Sign in required`, and no `audio[src]`.</li><li>`/api/studio-token` never returns 200.</li></ul> |
| Purchased origin | `/studio/$productId`, purchased copy | **BLOCKED:** backend unavailable in cloud. |
| gate | full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows; C does not claim them. |

**Ableton conformity:** C reports each §3 row separately as confirmed, deliberate difference, unconfirmed, or not applicable.

## 6. Neighbouring behaviour that could break (C probes these first)
- **A strip click during playback with Follow `on` (BR3):** no status write, and Follow stays `on`.
- **A stopped strip click (BR2):** plays from the snapped line.
- **Past-end and at-end texts (C-PASTEND-252):** a refused play writes them, not a stop, so they must stay.
- **A stop right after an edit during playback** (for example a clip move, or M) keeps that edit's status.
- **Residual case (observe, not a failure):** ruler click while playing, then Ctrl+→ (moves the marker during playback), then Space. C reports which text remains and whether `seekTo` wrote a status. B uses this to size B-R253-STALE-PLAYING-STATUS's residual.
- **`followResumed` after a strip-click resume, then Stop:** the text stays, because it is not one of the three texts (FW10).
- **Escape and the transport play/pause button** stop through the same effect, so the same table applies. C probes one of them.
- **Export, history labels, clip drag and trim** are unchanged. The export hash is the check.

## 7. Next (D-29z466)
**If C passes and the gate publishes:**
- **SABA-B-10a is done:** stages 1, 2a and 2b, rounds 249–253. Gate 253 publishes rounds 252 and 253 together.
- **These close:** C-R235-02, B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, B-R251-PASTEND-AT-END, B-R236-END-WORDING, A-R251-REVIEW-IM22-PLAYING, C-R252-01, C-N252-FOLLOW-TITLE and B-R253-STALE-PLAYING-STATUS.
- **Checkpoint request:** B writes the **ARCH-CHECKPOINT-TRANSPORT-POSITIONS** request for root (non-blocking), with addendum 4 (`useTimelineFollow`, D-29z465).

**If C fails:** a fix-up on the same grants.

**Then:**
1. **REGRESSION-ROUND-2026-10-30** at the next planning, if it falls on or after 2026-10-30. It is due then and goes before any new scope. It carries every `scope_additions` entry, including C-FOLLOW-252/253, C-NAV-ORIGIN-253 and C-CAPTION-251.
2. **SABA-B-10b:** the visible flashing marker (`motion-safe:`), the sheet rows, the sheet marker copy, and `useArrangementInsertMarkerWriter`.
3. **SABA-B-9**, then **SABA-B-11c**. **SABA-B-7** when Saba answers.
