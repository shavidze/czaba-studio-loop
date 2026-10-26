# A — Round 198: C-R196-02, R91 keyboard-gated focus reveal

Implementer: A (Claude Opus 5.5) · 2026-10-26 · Baseline HEAD `2505252` · No commit, push or deploy.

## Start checks (all OK)
1. HEAD is `2505252`.
2. `git status --short` was empty.
3. The frozen list `b-round-197-r198-tree-sha256.txt` passes `sha256sum -c --quiet` (1027 entries). I re-checked at the end: OK.
4. The 3 grant start hashes are OK.

Pre-flight was run in chat. I read these primitives and templates: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/new-test.md, prompts/studio-feature.md. The hook also listed DESIGN_TOKENS, TAILWIND_FIRST and AUDIO_ARCHITECTURE, which I skimmed. This change has no styling or audio part.

## Changed files (exactly the grants + new files)
- ` M app/components/arrangement/StudioWorkspace.tsx`, R91 only:
  - the helper import;
  - one `useCallback` handler, `revealKeyboardFocusBelowChrome`;
  - `onFocus={revealKeyboardFocusBelowChrome}` on the scroller div;
  - `data-testid="arrangement-timeline-chrome"` on the chrome div.
  - No other line changed.
- ` M app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx`: the 3 `it.todo` are replaced by FR-a…FR-f.
- ` M docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md`: a new Georgian "Round 198" section with R91, the probe table, the rejected alternatives and the measurements.
- `?? app/lib/arrangement/focus-reveal.ts`: the pure helper `resolveFocusRevealScrollTop` plus `FocusRevealScrollInput` and `FOCUS_REVEAL_TOLERANCE_PX`. It has no DOM access.
- `?? app/lib/arrangement/__tests__/focus-reveal.test.ts`: FRU-1, 1b, 2, 3, 4 and 5.
- Evidence: `a-round-198/end-sha256.txt` and `a-round-198/diff-vs-start.patch` (the grants against `b-round-197/r198-granted-start/`, and the new files in full).

### Deviations from the task text (please review)
1. **An extra guard in the same handler: `event.target === scroller || !scroller.contains(event.target)`.**
   - This is code-reviewer **High H1**. `ArrangementMarkerMenu` is portaled to `document.body`, but React still bubbles `onFocus` through the component tree to the scroller.
   - Without the guard, a keyboard-opened marker menu (Shift+F10) focuses item 0, whose top is above the chrome bottom, and the timeline would scroll.
   - Task §1 says "When focus lands on an element `t` inside the scroller". The guard enforces that, inside the one handler, so I read it as in scope and not a second mechanism. B should confirm.
   - It also covers reviewer L1 (focus on the scroller itself).
2. **The handler parameter is typed structurally as `{ target: Element }`.** This keeps the `react` import line unchanged ("no other line"). React's `FocusEvent` satisfies it with no assertion, and typecheck is clean.
3. **FR-f was added**: a keyboard Shift+F10 marker menu never scrolls. It is the regression row for H1.

## Tests and checks actually run
- `npx vitest run focus-reveal.test.ts focus-reveal-ui.test.tsx`: **12/12 pass** (6 FRU + 6 FR).
- **Red proof** (`a-round-198/red-proof-head.txt`, full output): I re-captured it on the final tests, with StudioWorkspace temporarily restored from the start copy and the helper removed. I then restored both, and `end-sha256` is OK.
  - FRU: `Failed to resolve import "../focus-reveal"`.
  - FR-a…FR-f: all 6 fail, because the chrome testid is absent.
  - The m4 and m5 sed targets (`return Math.max(0, scrollTop - delta);`, `if (delta <= FOCUS_REVEAL_TOLERANCE_PX) {`) are unchanged in the final Biome-formatted file, at lines 22 and 19, so C can repeat them one-to-one. On a copy without the `onFocus` prop but with the testid (m1), FR-a and FR-e are red.
- **Mutants** (`a-round-198/mutants/`). Each was applied in place, run, and then restored; restoration was verified with `cmp`.

  | Mutant | Change | Red tests |
  |---|---|---|
  | m1 | no `onFocus` | FR-a, FR-e |
  | m2 | keyboard gate dropped | FR-b |
  | m3 | chrome exclusion dropped | FR-c, FR-f |
  | m4 | no `Math.max(0, …)` | FRU-3 |
  | m5 | `<= 0.5` changed to `< 0` | FRU-2, FRU-4 |
  | m6 (extra) | `scroller.contains` guard dropped | FR-e, FR-f |

  The m3 and m6 files hold the final runs. The earlier runs, before the H1 fix, gave m3 → FR-c only.
- **Neighbour suites**: 25 files and **465 tests pass** (`a-round-198/neighbour-suites.txt`). They cover:
  - all 10 suites that query `arrangement-timeline-scroller`, plus the detail-panel suites;
  - focus-source, studio-focus-ring, markers-ui, track-layout and marker-strings-ui;
  - every source-parsing suite that reads StudioWorkspace.tsx: label-status-colour, panel-radius, studio-theme-obsidian, strings, mode-toggle-colour and store-theme-tokens;
  - the 2 new and changed suites.
- `npm run typecheck`: passes (exit 0).
- `npm run lint`: **214 warnings + 1 info**, the same as round 197, so no new ones.
- `npx biome check` on the 4 changed code and test files: **0 errors**. I ran `biome format --write` only on my own new or granted test and helper files.
- I did not run the full suite, verify, build or e2e. Per the speed rules these are root-gate rows.

## Live proof (Playwright Chromium 143.0.7499.4, DPR 2, `--disable-lcd-text`, shared `:5173`, not restarted)
- Script: `a-round-198/probe-a198.cjs <W> <rich|default>`. It was adapted from B's `probe-scroll-margin.cjs` in mode none, with no injection, and adds a ring changed-pixel check at every scroller stop.
- `servedR91=true` on every run: the chrome testid is present, so the server was serving the new code.
- **1280 rich** (`probe-a198-rich-1280.json`):
  - 82 stops, 33 of them in the scroller outside the chrome.
  - Hidden stops: **forward 0 and backward 0**. B's HEAD reference had 6 / 6.
  - i69–74 now have top 313.0 with the chrome bottom at 313.0.
  - Ring changed px is above 0 at every scroller stop (286–7920).
  - The reached set and order equal B's HEAD reference in both directions.
  - `scrollTop` differs only at the intended Video-row reveals (46 → 0).
  - `scrollLeft` stays 0 throughout.
- **Chrome and pointer actions at scrollTop 46**, final code. Every one leaves `scrollTop` at 46:

  | Action | scrollTop |
  |---|---|
  | playhead grab | 46 |
  | playhead drag | 46 |
  | flag `focus()` with the keyboard source | 46 |
  | F2 | 46 |
  | **Shift+F10 menu** (open, focus in the menu) | **46** |
  | ArrowDown in the menu | 46 |
  | Escape | 46 |
  | Snap click | 46 |
  | lane Mute click | 46 → 46 |
  | Tab onto Snap | 46 → 46 |
  | 5 Tabs through the chrome | 46 |

  - Mouse click on the Video fold button cut by 6 px: scrollTop 6 → 6, `outline: none`, source `pointer`.
  - **Follow-up**, measured in the final 1280 rich run: **ArrowUp** gives scrollTop 6 → 0, the element top is 313 = chrome bottom, outline `solid`, source `keyboard`.
    - **Inference:** this reveal does **not** come from R91. ArrowUp dispatches no `focus` event, because the control is already focused. The scroll is most likely Chromium's native ArrowUp scroll of the focused scroller, about 40 px.
    - It therefore depends on there being room to scroll up. A keydown-based reveal would be a second mechanism, which the task forbids. If C needs this guaranteed, it is B's call.
  - **Tab** then moves to "Video — set as the active track": top 313, ring solid, scrollTop 0.
- **Top-band ring check** at the stops that land exactly on the chrome bottom (i69–71, top 313.0). The changed px in the band above the element top are 0, as expected: these 3 controls use the inset ring (`outline-offset: -2px`), so the ring is drawn inside the box. Total changed px is 286 / 1414 / 285. The Mute, Solo and Volume stops of that row sit at 335 or lower, not at the edge.
- **1440 rich**: 0 / 0 hidden stops. The order matches the reference, and the `scrollTop` sequence is **identical to the reference** (0 differences). All chrome and pointer steps stay at 0.
- **Default scene** at 1280 and 1440: 68 stops, 0 / 0 hidden, and a ring at every scroller stop.
- **Load**: scrollTop/scrollLeft are 0/0 at both viewports. 0 pageerror, 0 hydration messages, and 0 console errors apart from the expected cart `ERR_CONNECTION_REFUSED` / "Failed to load cart".
- The first 1280 run aborted once at load: the scroller was null right after the first navigation, probably a cold dev-server compile. The retry was clean, and the 5 later runs had no problem.
- The stop rule was **not** invoked: no keyboard stop is hidden, and no chrome, pointer or load action changes `scrollTop`.

## Code review (actual `code-reviewer` subagent, score 7/10)
- **H1 (High)**: the portaled marker menu scrolls when opened by keyboard. **Fixed** with the `scroller.contains` guard, plus FR-f, mutant m6, and the live Shift+F10 = 46 above.
- **M1 (Medium)**: FR-e was weak. **Addressed**:
  - it now asserts `topWrites == [0]`;
  - it dispatches a real `scroll` event after the write, with a baseline scroll first so the stubbed scrollLeft is not seen as a horizontal change;
  - the keyboard-first menu path is now FR-f.
  - Follow during playback is still only a smoke check in jsdom; SIDE-198 is the real check.
- **L1** is covered by the same guard.
- **L2** is documented in doc 159: the keyboard source persists until the next pointerdown, so programmatic `focus()` after a keyboard action also reveals. This is correct for 2.4.11.
- **L3, L4 and L5** are noted only. L5: a reveal while the grid menu is open would close it through `closeGridMenuOnUserScroll`, which is acceptable.
- **L6**: the test filename `focus-reveal-ui.test.tsx` tests StudioWorkspace. The file pre-existed, so it is kept.
- **Architecture note (verbatim, for B):**
  > - **Signal 4 (new state or lifecycle in an existing owner):** absent. The diff adds no state, effect, timer or listener.
  > - **Signal 3 (one region changed repeatedly at high cost):** a weak signal. The scroller/chrome focus region was touched in rounds 196–198, and R89 was reverted. `StudioWorkspace.tsx:1504-1521` → keep, because the logic already sits in `lib/focus-reveal.ts`, the component holds only the DOM read/write on refs it already owns, and the handler doesn't affect audio timing, gestures or Undo/Redo.
  > - Signals 1 and 2: none.

## B acceptance (§3) that I truly passed
- FRU-1…5 pass. FR-a…FR-e pass, plus FR-f.
- Red proof done.
- m1–m5 each red on their listed test (plus m6).
- Neighbour suites, typecheck, lint count and Biome all pass.
- Live proof items 1–3 pass at 1280 and 1440, on the rich and default scenes, on the final code.
- Code review done and its Medium+ findings fixed within the grants.

## Known gaps
- I did not measure H1 live *without* the guard, because I did not run a mutant on the shared `:5173`. The jsdom m6 shows the guard is needed, and the live Shift+F10 check shows the final code is correct.
- I did not run C's SIDE-198: playback with Follow on, plus the marker menu across a real reveal.
- POINTER-198's ArrowUp reveal was observed, but as I explain above, it comes from native scrolling and not from R91.
- `a-round-198-result.json` is harness output (session and usage fields), so I did not write it.
- I did not set up a separate ref server. My order and `scrollTop` comparisons use B's `b-round-197/probe-none-{1280,1440}.json`, recorded on HEAD.
- Horizontal reveal under sticky lane headers is out of scope.

## Exact next C checks
- FOCUS-REVEAL-198, CHROME-FOCUS-198, POINTER-198 and SIDE-198 against a real ref server.
- Add one CHROME-FOCUS step: **keyboard Shift+F10 on the marker flag while scrolled to the maximum, then ArrowDown, then Escape**. This is the new H1 path.
- RING-KEY-198 and REST-198.
- G198-3, SCOPE-198, T-RUN-198 (m1–m5, plus m6 if C wants it) and AN-REVIEW-198.
- AN-REVIEW note: StudioWorkspace's handler has one extra guard line (deviation 1).

## Scope
Round 198 R91 is implemented within the grants. C-R196-02 is **not** self-closed; it awaits C. The backlog is not marked complete.
