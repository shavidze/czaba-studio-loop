# A round 303 — NAME-AND-HINT-b (one-time "Drag a clip by its name bar to move it.")

**STOP — needs B ruling on CLAIMS K9/K10** (L11: two task clauses disagree). Grant 2 requires `strings.ts` byte-equal to `sketch-strings.ts.txt`. That sketch inserts `nameBarHint` at l.293, above `moveTitle` / `rangeBodyTitle`. §3.3, however, says K9 and K10 must equal `claims-303-output.txt` (the HEAD line numbers). The line numbers therefore shift by +1, and the content is identical:

```
< K9 name bar title: 708:  moveTitle: (title: string): string => `${title} — drag to move`,
> K9 name bar title: 709:  moveTitle: (title: string): string => `${title} — drag to move`,
< K10 body title: 709:  rangeBodyTitle: 'drag = time selection · click = insert marker',
> K10 body title: 710:  rangeBodyTitle: 'drag = time selection · click = insert marker',
```

Proposed ruling: the expected K9/K10 after A's change are l.709/l.710, or the comparison ignores line numbers. **No code change is needed: the tree is at its final state.** Everything else below is complete. A found this at the CLAIMS self-check, after all §5 work was done. The only later edit is NB4b in grant 8 (the reviewer's Medium, §6.5), plus its doc 221 lines. Grants 1–2 remain byte-equal, and the ruling needed is unchanged.

## Changed files (exactly the 9 §5 paths)
1. `app/contexts/ArrangementContext.tsx`: `cmp`-equal to `b-round-302/sketch-ArrangementContext.tsx.txt` (copied with `cp`, re-checked after the mutants).
2. `app/lib/arrangement/strings.ts`: `cmp`-equal to `b-round-302/sketch-strings.ts.txt`.
3. `__tests__/tempo-seed-ui.test.tsx`: helper `firstPlacedText(title)` = `placedText + ' ' + nameBarHint`. TU2: both the template and the hard literal now contain the hint. TU5: the snapOn first add. TU9: `seeded`.
4. `__tests__/grid-snap-loop-drop.test.tsx`: helper `firstAddStatus(text)`. SD1, SD2, DE1, DE2 and DE3 wrap their `clipAdded(...)`. Biome then reformatted the SD1/SD2 calls onto multiple lines.
5. `__tests__/status-lifetime.test.tsx`: helper `firstAddStatus(text)`. LT15 `added`; LT19 `expect(added)`.
6. `__tests__/failed-source-refusal.test.tsx`: FS7, inline `${clipAdded(...)} ${nameBarHint}`. No helper.
7. `__tests__/strings.test.ts`: ST10 literal list gains `nameBarHint: 'Drag a clip by its name bar to move it.'`.
8. `__tests__/name-bar-hint-ui.test.tsx` (new): NB1–NB9, plus **NB4b**, added after the reviewer's Medium (see Code review).
9. `docs/implementation/2026/quarter-IV/221-name-and-hint.md`: l.4 = `**სტატუსი:** Completed (C round 303 PASS)`, a new `## ეტაპი b (რაუნდი 303)…` section between `## ტესტირება` and `## TODO`, and an updated TODO with SABA-Q-NAME-HINT-LIFETIME.

The collision updates keep every assertion exact (`toBe`); none was deleted or loosened to `toContain`. Each one is the same assertion with the hint appended for the first add of its mount.

## Tests actually run
- **Claims before editing:** the output equals `claims-303-output.txt` (empty diff).
- **Covering set, alone, re-run on the final tree** (`covering-files.txt` + the NB file, with NB4b): **20 files, 386 tests, all passed**, 35.3 s. Log: `a-round-303/covering-run.log`. The only pass/fail change against `sketch-covering-run.log` is that the 12 collision rows are now green.
- **Timeout headroom (L31), slowest tests:**
  - MS1: 1.74 s of the 5 s default (35 %).
  - GAU6: 1.73 s of 15 s.
  - TU3: 1.70 s of 15 s.
  - TU5: 1.67 s of 15 s.
  - TU4: 1.64 s of 15 s.
  - TU2: 1.28 s of 15 s.
  - None is above 50 %.
  - File times: tempo-seed-ui 10.0 s, grid-snap-loop-drop 7.9 s, status-lifetime 7.8 s, name-bar-hint-ui 3.6 s.
- **`npm run typecheck`:** exit 0 (`typecheck.log`).
- **`npm run lint`** (re-run on the final tree): exit 0, 205 warnings repo-wide, none in a granted path (`lint.log`). Scoped `npx biome check` on the 8 code/test paths, re-run: 0 diagnostics (`biome-scoped.log`). Typecheck was re-run after NB4b: exit 0.
- **Mutants**, on A's scratch `/tmp/a303-scratch` (tar copy, `node_modules` symlinked, own config `vitest.scratch.config.ts` with `cacheDir: /tmp/a303-vite-cache`). Only the NB file ran per mutant. Logs and diffs: `a-round-303/mutant-mN.{log,diff.txt}`.

| Mutant | Change | Red rows | Required |
|---|---|---|---|
| m1 | removed `nameBarHintShownRef.current = true` | NB2, NB5 | NB2, NB5 ✓ |
| m2 | `withNameBarHint` returns `text` | NB1–NB8 | NB1, NB3, NB6, NB7 ✓ |
| m3 | flag set in the `sourceNotLoaded`/`sourceFailed` refusal branch of `addSourceToActiveTrack` | NB4 | NB4 ✓ |
| m4 | hint before the add sentence | NB1, NB3–NB8 | NB1, NB6 ✓ |
| m5 | `nameBarHintShownRef.current = false` in `undo` | NB5 | NB5 ✓ |
| m6 (extra) | flag set in the `dropNotLoaded` branch of `dropLibrarySource` | NB4b | NB4b ✓ |
| m7 (extra) | flag set in the `canPlaceLibraryClip` blocked-drop branch | NB4b | NB4b ✓ |
| m8 (extra) | flag set in `refuseEditDuringGesture` | NB4b | NB4b ✓ |
| m9 (extra, NB9 red-proof) | `nameBarHint` literal changed to "…title bar…" in `strings.ts` | NB1–NB9, NB4b | NB9 ✓ |

  m3 was placed in the `sourceNotLoaded` branch, which is the task's "e.g." option. NB4 does not exercise `addFailed`. After the mutants, both grants are still `cmp`-equal to their sketches.
- **SOURCE-SCOPE self-check:**
  - `git status --short --untracked-files=all` shows exactly the 9 paths.
  - `sha256sum -c b-round-302-r303-tree-sha256.txt` fails on exactly the 8 modified paths.
  - The protected files have no diff (none is in the status list).
- **CLAIMS after the change** (`a-round-303/claims-after.txt`, re-run after the last edit):
  - K2 = 9, K4 failures = 8, K5 = 2, K6 = 5, K13 l.4 = the new status, K16 all `ok`.
  - K1, K3, K7, K8, K11, K12, K15 and K17 equal the HEAD output.
  - **K9/K10: the line shift above (STOP).**
- **DOC (L26):**
  - The `## ` headings of doc 221 are კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, ეტაპი b, TODO. TEMPLATE's 7 headings appear in order as a subsequence.
  - The doc cites only rows that exist: NB1–NB9, NB4b and the 12 updated collision ids. NB4b goes beyond §3.3's list; it is cited because it exists.
- **Not run by A (speed rules):** the full vitest suite, build and `npm run verify` (gate rows); browser rows (C).

## Acceptance actually passed by A
- §3.1 unit rows NB1–NB9 (+ NB4b) and the 12 collision rows: green, each NB row with a red-proof mutant.
- SOURCE-SCOPE: yes.
- CLAIMS: all equal or at their expected post-change values except K9/K10 (STOP above).
- DOC: written. C verifies it.
- **Not claimed:** every §3.2 browser row (H-*), RV-EN, G303-AUTH and the gate rows. A ran no browser in this round, so `realVerified` is false for A's part.

## Known gaps / notes for C
- **jsdom `DragEvent`:** jsdom has no `DragEvent`, so `fireEvent.drop` lost `clientX` and NB3's clip landed at 0 with a `NaN` left warning. The NB file now uses the same `vi.stubGlobal('DragEvent', class extends MouseEvent {})` as `grid-snap-loop-drop`. NB3 asserts start 2 s and the literal `00:02.000`. This is a harness fact, not a product bug.
- **NB8** samples the status twice (right after the import starts, and after it settles), not every intermediate video write. Decode is mocked to never resolve. H-VIDEO-FIRST in the browser is the real coverage.
- **NB4** covers source-not-loaded, unknown id and video lane. **NB4b** covers failed source, not-loaded drop, blocked drop (no room) and edit during a gesture. The `addFailed` branch has no test, because `addClip` does not return null for a free lane in these fixtures.
- **NB1, NB2, NB5, NB6 and NB7** use Enter on a focused library row. NB4 and NB8 call `addSourceToActiveTrack` directly; NB3 uses the drop path.

## Code review (a real `code-reviewer` subagent run on the 9 paths; score 8.5/10, no Critical or High)
- **Medium (test gap), fixed inside grant 8.** NB4 did not exercise the failed-source, not-loaded-drop, blocked-drop and edit-during-gesture refusals. New row **NB4b** covers all four: each shows its exact refusal text, no clip is added, and the next success shows the hint. Red-proof: m6, m7 and m8 (table above); m3's branch also covers the failed source. Re-runs:
  - NB file alone: 10/10 green (`a-round-303/nb-final-run.log`);
  - typecheck: exit 0;
  - Biome on the file: 0 diagnostics;
  - both grants still `cmp`-equal.

  Only the NB file changed after the covering run. Doc 221's test list now names NB4b.
- **Low (naming):** `withNameBarHint` uses up a one-time flag, so a name like `appendNameBarHintOnce` would say so. **Not changed:** grant 1 must stay byte-equal to B's sketch. For B.
- **Low:** NB8 samples the status twice (already listed under known gaps). Its last assert proves the hint was not used up.
- **Low:** NB9 duplicates ST10's literal. Kept, because NB9 is a task-specified row.
- **Low (behaviour, for B):** after an edit-during-gesture refusal, `statusAfterGestureRelease` restores `lastNonRefusalStatusRef`. If that was the first-add text, the hint text reappears as restored text, not as a new hint. Not a violation of the task; B may record it.
- **Low (pre-existing):** both add paths ignore `applyEdit`'s boolean. If an add ever committed no change, the hint would be used up with no clip. That cannot happen today, because `addClip` always returns a new arrangement.
- **Assertion-loss check:** A ran `git diff HEAD -- app/lib/arrangement/__tests__`. It shows 0 removed `expect` lines; every collision change wraps an existing exact assert.
- **Architecture note (proposal for B/root, not acted on):** keep the flag in ArrangementContext (signal 4, a new one-time UX state in an existing owner). Only the context knows an add succeeded. If a second one-time hint ever arrives, plan one bounded task: a small context-owned status-decoration helper with "consume only on success" tests.

## For B
- K9/K10 ruling (STOP above).
- SABA-Q-NAME-HINT-LIFETIME stays `awaiting_user`; it is recorded in the doc TODO.

## Exact next C checks
H-FIRST-ENTER, H-SECOND, H-FIRST-DROP, H-SEED, H-UNDO, H-RELOAD, H-VIDEO-FIRST, H-BEHAVIOUR, H-BOX, H-SR, H-BUDGET, H-JOURNEY, RV-EN and G303-AUTH at 1440×900 and 1280×720. Then SOURCE-SCOPE, CLAIMS (with B's K9/K10 ruling), DOC, and re-running NB1–NB9 plus the 12 collision rows.

## Scope completed
NAME-AND-HINT-b implementation and unit coverage are complete in the tree. The round is not complete until B rules on K9/K10, C passes the browser rows and the gate runs.
