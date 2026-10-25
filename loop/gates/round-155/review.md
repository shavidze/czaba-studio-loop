COMMIT: OK. Nothing blocks this commit. The diff only changes class strings plus one wrapping `<span>`, and none of it touches auth, purchase or download code.

## Code Review: round 155 (Studio V-2b-2, font weights and timecodes)

The `verify.log` I read shows 170 test files passing and the build succeeding. `c-round-155-result.json` is a single long line, so I didn't confirm its verdict field and am relying on the PASS you reported.

### Critical Issues
- none

### Suggestions (ranked)
1. **Low: test literals break on reformatting.** `studio-theme-obsidian.test.tsx:294-344` (TH10 part c) checks exact class strings in the source files and expects each to appear exactly once. If Biome or a developer reorders or rewraps those classes, TH10 fails even though the UI is fine. Fix: next time someone works in this area, give the lane ghost timecode span its own test ID (e.g. `arrangement-lane-move-ghost-time`) and check its class tokens in a jsdom render while the ghost is showing. The ghost doesn't appear in the S0 server render, which is why string checks were used. No change needed this round.
2. **Low: the "over" state no longer looks different by weight.** `ArrangementMaster.tsx:110` removes `font-medium`, so the over state is shown by border, background and text colour only. It's still accessible: `aria-label` carries the over state through `masterPeakLabel(…, frame.over)`, and the border/background change doesn't depend on colour perception alone. No change needed, but the user should know this choice was made.
3. **Low: doc status is out of date.** `125-studio-v2b2-weights-numerals.md:4` still says "In Progress (awaiting C round 155)", and its TODO list (line 125) still names "C round 154". C round 155 has already passed. Doc 124 got its "Completed" status one round after its gate, so this follows the same pattern. Fix: change the status to Completed in this commit or the next one.
4. **Info: browser behaviour (event order, timers, listeners).** Nothing changes here. No handlers, effects, refs or state were added. `LibraryPlayheadText` still writes text through its ref, only its class changed, and `render-budget.test.tsx:528` confirms the per-frame writer path still works.
5. **Info: render cost and layout.** Moving text to mono changes its width. The ruler and tempo labels are absolutely positioned with `whitespace-nowrap`, so they don't cause layout shifts. The preview duration was correctly left in sans (B-R153-PREVIEW-DUR) because mono would cut off the title. Whether anything clips or overlaps in a real browser is covered by C's rows, not by unit tests.

### Good Practices Found
- `ArrangementLane.tsx:929`: the fix for C-R154-01 sets `font-normal` on the timecode span instead of removing `font-medium` from the container at line 912. The sans title keeps weight 500, and the diff stays small.
- `ArrangementLibrary.tsx:80-86`: wrapping only the duration in a span keeps the meta row's structure and classes the same. The loading and error branches stay in sans.
- `font-mono` uses the scoped token `--font-mono` (`app.css:3940`). There are no hardcoded fonts, colours or custom CSS, so it follows Tailwind-first.
- TH10 part (a) checks the whole `arrangement/**` tree for `font-semibold|bold|extrabold|black|[NNN]` and covers at least 20 files, which guards against regressions.
- There are no `any` types, suppression comments or type assertions, and every statement ends with a semicolon.

### Architecture note
- none. None of the four signals appear in this diff: there is no new state, effect, ownership move or coupling, and the edits are class strings spread across 9 leaf locations. One thing worth recording for the planner, as a proposal only: the css2 font URL still loads Instrument Sans 700 and Plex Mono 500. Doc 125 R4 already makes trimming them a separate task, gated on C's PLEX500-INVENTORY and COOKIE-SOURCE evidence. Nothing to do this round.

### Alternative Approach
- Not applicable. This is presentation only and has no auth, checkout or audio logic. (For the N6 ghost, the rejected option of removing the container's `font-medium` is already argued and tested in doc 125 under m142.)

### Score: 9/10