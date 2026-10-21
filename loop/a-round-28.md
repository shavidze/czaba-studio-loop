# A — Round 28: SRW-24 (Delete always leaves a gap, Ctrl+Shift+L all lanes, Ctrl+Shift+X is the only gap-closing delete)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-12 · Task: `current-task.md` (round 28) · Status: **implemented, gates run, not a PASS claim**. C verifies.

## 1. Pre-flight gate

**Pre-checks (§1.2), before any edit:**
- `sha256sum -c b-round-27-tree-sha256.txt`: **66 OK**, 0 other.
- `git status --short`: **62 lines**, byte-identical to `b-round-27-git-status.txt`.
- The 7 owned files equal the snapshot shas (`df4484a9`, `f2db8fe2`, `750c75e6`, `f0054cfd`, `ac2eed7e`, `514e2f75`, `7c93153d`).
- HEAD `c5ed47b`. `node.exe` = 36.
- No difference to report.

**Read:**
- `rules/read-primitives.md` and the primitives `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `DESIGN_TOKENS`, `TAILWIND_FIRST`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`. The inject-primitives hook also forced each of these on the first edit.
- `prompts/studio-feature.md`, the `pre-flight` skill and `delete-selection-update.md` (all of it).
- The §1.3 code sections. Root items (`root-pre-push-review.md`, `publication-checkpoint.json`) are carried by B in §4.7 and are unchanged by this round.

**Assumptions:**
- The user's contract wins over R1-B5/R1-B12/R9-C5 clause 1. Delete/Backspace and the ⌫ button on a range = remove the material, keep the gap, no playhead/loop remap.
- Ctrl+Shift+L only flags the existing range; it is not an edit.
- Ctrl+Shift+X stays `deleteTime`.

**Smallest version:** one optional flag; a flag check in the two existing pure functions plus a thin `deleteRangeKeepingGap`; one context branch plus one action; one key branch; strings; one lane overlay.

**Cut list (not added):**
- Shift+click extension;
- Split across all lanes;
- carrying the flag through the detail panel (frozen);
- a clipboard provenance flag (see §4, finding 2).

**Files:** exactly §3.2. One out-of-list text change is disclosed in §6.1.

**Success:**
- the §5 commands green;
- ≥ 16 new `it` blocks, red on the snapshot sources;
- `git status` = 62 + 4.

**design-philosopher (read-only, one run). Advice and dispositions:**
1. **Use `bg-foreground/20` for the lane overlay** because `/60` at full lane height is heavy. → **Not adopted.** B requires the clip overlay's tokens, and "the lane overlay `/60`" is already on B's later list. Kept `border-x-2 border-foreground bg-foreground/60`. Its double-layer concern is handled: clips get `range={null}` on an all-lane range.
2. **Use the same "Cut Time" wording** in the button title and the footer. → **Not adopted for the button:** the §2.4 strings are the R28-UI oracle, so they are verbatim. The footer uses `(Cut Time)`.
3. **B's example footer (with Georgian explanations, ~225 chars) will wrap.** Keep bare key names. → **Adopted:** `… Ctrl+Shift+X (Cut Time) · Ctrl+Shift+L · Ctrl+L · Ctrl+A · Delete / Backspace · …`. My smoke measured the hint at **16 px (one line) at both 1440 and 1280** (§5.3).

## 2. Red first, then green

### Red

The new tests plus the line-567 amendment ran against the unchanged sources (`a-round-28/red.txt`):
- **21 failed / 22 passed (43).**
- tsc failed with TS2339 (`extendRangeToAllTracks`), TS2305 (`deleteRangeKeepingGap`) and TS2353 (`allTracks`).
- Every pure test failed with `deleteRangeKeepingGap is not a function`. The provider/UI tests failed on the old `deleteTime` behaviour, the label `დროის წაშლა`, the missing action, Ctrl+Shift+L toggling the loop, the missing overlay and the old titles.
- The frozen amended test failed (`'დროის წაშლა'` ≠ `'წაშლა მონაკვეთზე'`).
- **Two new tests were green on the snapshot by design.** They are regression guards: "Ctrl+Shift+X still closes the gap on every lane" and "Backspace in the detail number input / library search … change no clip".

**Correction (honest):**
- In the native red run, "cuts a window across two adjacent clips" failed for a **fixture error of mine**: `createArrangement` requires one video track. I fixed the fixture only.
- I then re-proved red in a **scratch copy outside `store/`** (`a-round-28/scratch/`, a copy of `app/` and the configs, with `node_modules` as a junction). The 7 snapshot files were copied over, and the corrected tests ran there.
- Result (`a-round-28/red-scratch-snapshot.txt`): **21 failed / 22 passed**. That test now fails with `TypeError: deleteRangeKeepingGap is not a function`.

### Green

`npx vitest run` on the 3 files: **44 passed (44)** (`a-round-28/vitest-own.txt`).

**New `it` blocks: 23** (10 pure + 13 provider/UI).
- The 23rd ("zero-width window returns the same object", and the zero-width part of the provider no-op test) came from the code review.
- On the snapshot its red is trivially a missing export. Its real proof is **mutation g** below.

### Mutations

Scratch only. The runner is `a-round-28/mutate.mjs`, which does string replacement and restores the file. Restoration was verified with `diff -q` against the live files. Outputs are in `a-round-28/mut-*.txt`. The tests run are the 3 own files plus `clipboard.test.ts`.

| # | Mutation | Result |
|---|---|---|
| a | range branch calls `deleteTime` again | 6 failed |
| b | flag ignored in `cutRangeFromArrangement` | 4 failed |
| c | Ctrl+Shift+L falls through to the loop (`shiftKey`→`altKey`) | 4 failed |
| d | delete remaps the playhead | 1 failed |
| e | no-op calls `applyEdit({...arrangement})` | **0 failed: equivalent mutant.** `commitHistory` drops an identical arrangement (`isSameArrangement`), so this cannot create a history entry |
| e2 | no-op early return removed | 1 failed (range cleared, status wrong) |
| f | `cutTimeToClipboard` uses the gap helper | 5 failed (incl. the frozen R9-C3 tests) |
| g | zero-width guard removed | 2 failed |

Afterwards I removed the junction with `cmd /c rmdir`, which deletes the link only. `store/node_modules` is intact. The scratch copy (without `node_modules`) remains under `a-round-28/scratch/` for C. C should run its own mutations.

## 2a. §2.7 edge-case self-check

**Covered by tests:**

| Case | Result | Evidence |
|---|---|---|
| Range on the video clip | parts 0–2 and 4–6.008, offset 4 | test "cuts 2–4 out of the video clip" |
| All-lane range with an empty lane (`amb`, and `stems` in the smoke) | no-op on that lane; other lanes cut | pure all-lane and no-op tests, smoke overlay on `stems` |
| Delete while playing inside or behind the window | no jump, one reschedule | provider playing test |
| Zero-width window | no-op | the review fix |

**Reasoned from the code (no dedicated test):**

| Case | Reasoning |
|---|---|
| Range touching a clip edge | `cutRangeFromArrangement` skips clips with `end <= a + EPS` or `start >= b − EPS` and drops parts shorter than `CLIPBOARD_MIN_PART_SECONDS`. The adjacent-clips test touches the edge at 4. |
| Delete with a loop around the window (e.g. loop 2–6, range 3–5) | `applyEdit` has no `removed` argument and `cutRangeFromArrangement` copies `loop` unchanged, so the loop stays 2–6. The provider test covers a loop **after** the window (6–8). |
| Undo after a no-op | no history entry is written, so Undo acts on the previous entry. |
| Ctrl+Shift+L, then a click elsewhere | the background pointer-down calls `setTimeRange(null)` (StudioWorkspace marquee finish). A new clip range gesture writes a fresh range without the flag. Unchanged code. **No test: C should check this in the real UI.** |
| Detail panel on the origin clip | reads `range.trackId`/`start`/`end` and ignores the flag. Apply writes a single-lane range (accepted by §2.3). |
| Esc | no change in the key handler. |

## 3. Diff summary (hunk purposes)

`diff -u` against `b-round-27-snapshots/`:

**`types/arrangement.ts`**
- `allTracks?: true` on `TimeRange`. Nothing else.

**`clipboard.ts`**
- `copyRangeToClipboard` uses every clip when `allTracks`.
- `cutRangeFromArrangement`'s lane filter becomes `(!range.allTracks && clip.trackId !== range.trackId)`.
- New `deleteRangeKeepingGap`:
  - returns the same object for `|end−start| < CLIPBOARD_MIN_PART_SECONDS` (review fix);
  - otherwise returns `cutRangeFromArrangement` (same object when nothing changes).
- `cutTimeToClipboard` is **byte-identical**. Id/offset/min-part rules are untouched.

**`ArrangementContext.tsx`**
- Imports: `+deleteRangeKeepingGap`; the now unused `-deleteTime`.
- Interface: `+extendRangeToAllTracks`.
- `splitSelection`: an all-lane range is refused first, with the §2.3 status.
- `deleteSelection`, range branch:
  - calls `deleteRangeKeepingGap`;
  - no-op → status only (no history, range kept);
  - `applyEdit(next, label)` without `removed`, with no position remap and no loop change;
  - clears the range and the selection;
  - status `⌫ წაიშალა {a} — {b} {ხაზის სახელი} ხაზზე; სიცარიელე დარჩა.` or `… ყველა ხაზზე; …`.
  - The lane name is an inline lookup, because `trackLabel` is declared later (a TDZ in the deps array).
  - `updatePosition` was removed from this callback's deps.
- New `extendRangeToAllTracks`: gesture guard; status when there is no range; sets the flag if missing; same status when already flagged. No history.
- `copySelection` status says `ყველა ხაზი` on an all-lane range.
- `+extendRangeToAllTracks` in the value object and the deps array.
- One-clip and multi-clip delete, cut, paste, Cut Time, video, scheduler, loop, transport, meters, Master and graph: **unchanged**.

**`StudioWorkspace.tsx`**
- `modifier && key === 'l'` → `shiftKey ? extendRangeToAllTracks() : toggleLoopSelection()`.
- Footer shortcut hint text (Biome reflowed the JSX text; the rendered text is one line).
- **The `arrangement-delete-hint` text** (§6.1).

**`ArrangementTransport.tsx`**
- `rangeDeleteHint` (§2.4 strings verbatim; `ყველა ხაზზე` for all lanes) used as `title` and `aria-label` when a range exists.
- No-range strings and the disabled logic are unchanged.

**`ArrangementLane.tsx`**
- `clipRange` gets `!range.allTracks &&`.
- After the clips: one overlay `div` when `range?.allTracks`.
  - Attributes: `pointer-events-none absolute inset-y-0 z-10 border-x-2 border-foreground bg-foreground/60`, inline `left`/`width` only, `aria-hidden="true"`, `data-testid="arrangement-lane-range"`, `data-range-start`/`end` with `toFixed(3)`.
  - The label span uses the clip label's classes and appears only when `range.trackId === track.id`.

**`ArrangementContext.test.ts`** (exact diff):
```
@@ -564,7 +564,7 @@
     }
     act(() => claim.release?.());
     act(() => result.current.deleteSelection());
-    expect(result.current.undoLabel).toBe('დროის წაშლა');
+    expect(result.current.undoLabel).toBe('წაშლა მონაკვეთზე');
   });
```

**New files:**
- `delete-selection.test.ts`;
- `delete-selection-ui.test.tsx`;
- `docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md` (Georgian; includes the §4.5 Ableton table, superseded clauses, flag, no-op, Split refusal, detail-panel rewrite, overlay, keys, tests).

## 4. code-reviewer (real agent run): findings and dispositions

Score 8/10, no Critical.

1. **Medium: a zero-width range made Delete a hidden split.** A 3 px drag back to the anchor gives `start === end`. `cutRangeFromArrangement` then splits clips (on every lane when all-lane), records history and says "deleted". → **Fixed** in `deleteRangeKeepingGap` (same object below `CLIPBOARD_MIN_PART_SECONDS`, so the no-op path applies). Added the pure test and the provider case; proved by mutation g.
2. **Medium: after an all-lane Cut with material on only one audio lane, Paste routes to the active lane** (`planClipboardPaste` one-lane rule). → **Deferred to B.** This is the existing multi-lane paste rule that §2.3 tells me to reuse, and it is the same for the Cut Time clipboard today. Fixing it needs a clipboard provenance field and a `planClipboardPaste` change, outside §2.2. My Ctrl+X test uses a two-lane fixture as §2.6 requires. **Suggested follow-up:** `ArrangementClipboard.allTracks?` set by all-lane copy/cut and Cut Time, which skips active-lane routing.
3. **Low: the detail panel drops the flag.** → **Not changed.** §2.3 explicitly accepts it, and the file is frozen. Documented in doc 034.
4. **Low (a11y): the all-lane state is only visible in the transient status;** the overlay is `aria-hidden`. → **Deferred to B:** append `· ყველა ხაზი` to the `arrangement-range` footer line. This is outside my "Shift branch + hint text" hunks.
5. **Low: the Split button stays enabled on an all-lane range** (it refuses on click). → **Deferred to B** (transport hunks are limited to the delete strings).
6. **Low (tests): the Cut Time pure test never passes a range** into `cutTimeToClipboard`. → **Addressed:** the UI Ctrl+Shift+X test now also does Ctrl+Shift+L → Ctrl+Shift+X and asserts the result equals the single-lane Cut Time. The pure assertions remain because they kill mutation f.
7. **Low (tests): the clip-overlay query uses the `.border-x-2` class.** → **Not changed:** adding a testid needs `ArrangementClip.tsx`, which is frozen. Flagged for B.

## 5. Command tails (verbatim, final state after the review fixes)

### 5.1 §5 commands

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-27-tree-sha256.txt   → 66 OK (0 other)
$ npx vitest run delete-selection.test.ts delete-selection-ui.test.tsx ArrangementContext.test.ts
 Test Files  3 passed (3)
      Tests  44 passed (44)
$ npx vitest run clipboard model loop selection gesture-guard render-budget track-layout track-meter-ui
 Test Files  8 passed (8)
      Tests  169 passed (169)
$ npx tsc --noEmit            → exit 0
$ npx vitest run
 Test Files  65 passed (65)
      Tests  1119 passed (1119)          (1096 + 23)
$ npm run build               → exit 0, "✓ built in 8.53s"
$ npx biome check ./app       → exit 0, "Found 218 warnings. Found 1 info." (= round 27)
$ git status --short          → 66 lines = 62 baseline + exactly:
   M app/lib/arrangement/clipboard.ts
  ?? app/lib/arrangement/__tests__/delete-selection-ui.test.tsx
  ?? app/lib/arrangement/__tests__/delete-selection.test.ts
  ?? docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx
  app/components/layout/Header.tsx | 21 +++++++++++++++++++++
$ diff -u snapshot ArrangementContext.test.ts → only line 567 (see §3)
$ protected-baseline: download-routes.test.ts OK, account.downloads.tsx OK, api.studio-token.ts OK, studio.$productId.tsx OK
$ tasklist | grep -ci node.exe → 36 (start), 35 (during the gates), 35 (end)
```

- `types/arrangement.ts` was already ` M` in the baseline, as B stated.
- Biome `--write` ran only on my 8 owned code/test paths. It changed only the footer hint JSX text layout.
- Outputs are in `a-round-28/` (`vitest-*.txt`, `tsc.txt`, `build.txt`, `biome-app.txt`, `tree-sha.txt`, `git-status.txt`, `diff-ArrangementContext.test.txt`).
- The first full-suite run (before the review fix) was 1118/1118; there was no timeout in any run.

### 5.2 Browser smoke

Not a PASS claim. gstack browse with `a-browse.json` on the running `:5173/studio-lab`, 1440×900. I did not start or stop the dev server.
- **Daemon start.** The first call printed "Server failed to start within 15s", but navigation then worked (200).
- **Setup:** library `სრული მიქსი` → `＋ დამატება` gives music 0–16 (40 px/s). Then a real clip click, the detail panel open, the inputs 3 and 5, and Apply. Status: `მონიშვნა: 00:03.000 — 00:05.000 · მუსიკა.`
- **⌫ title on the range:** the exact §2.4 single-lane string.
- **Real `Delete`:**
  - clips `[["music",0,3],["music",5,11]]`, so **the gap is kept**;
  - status `⌫ წაიშალა 00:03.000 — 00:05.000 მუსიკა ხაზზე; სიცარიელე დარჩა.`;
  - `Undo: წაშლა მონაკვეთზე`.
- **Ctrl+Z** → `[["music",0,16]]`.
- **Range 3–5 again, real `Control+Shift+KeyL`:**
  - video/music/stems/sfx each have exactly one `arrangement-lane-range` `3.000-5.000`;
  - one label `00:03.000 – 00:05.000 · 2.000 წმ · ყველა ხაზი`;
  - 0 clip overlays;
  - no loop brace (the loop was **not** toggled);
  - Undo title unchanged (`დამატება — …`);
  - ⌫ title = the all-lane string;
  - status `მონიშვნა ყველა ხაზზე: 00:03.000 — 00:05.000.`;
  - screenshot `a-round-28/a28-all-lanes-1440.png`.
- **Real `Control+Shift+KeyX`:**
  - `[["music",0,3],["music",3,11]]`, so **the gap is closed**;
  - status `Cut Time 00:03.000 — 00:05.000: 1 ნაწილი ბუფერშია; სიცარიელე დაიხურა ყველა ხაზზე.`
- **Console:** only `ERR_CONNECTION_REFUSED` / `Failed to load cart` (the known anonymous root CartContext call; the backend is not running). No workspace error.

### 5.3 Footer geometry

Not the C oracle, because my layout is not C's reference layout.
- `arrangement-shortcut-hint` offsetHeight is **16 px (one line)** at 1440 and at 1280 (width 1026 of 1280).
- Footer offsetHeight was 89 at 1440 and 69 at 1280. Those values include the status/range lines in that state.
- C must compare the footer and scroller numbers against round 27 on its own layout.

**Cleanup:**
- I ran `browse stop`. It printed "Unable to connect", and afterwards `a-browse.json` no longer exists. I killed no process.
- The scratch `node_modules` junction was removed (link only).

## 6. Deviations

1. **`arrangement-delete-hint` text changed** (`StudioWorkspace.tsx`, inside `<footer>`).
   - The old text was `Delete = დროის წაშლა, სიცარიელე დაიხურება ყველა ხაზზე`; the new text is `Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time`.
   - B's §2.4 names only the shortcut hint. Leaving this line would show a false statement on every range, against the user's "Ctrl+Shift+X-ის დანიშნულება UI-ში გასაგებად აისახოს". The frozen `detail-panel.test.tsx` l.325 asserts only the testid (still green).
   - C/R28-S: this is one extra string-only hunk in an owned file.
2. **Status lane wording.** B wrote `{ხაზის სახელი-ზე | ყველა ხაზზე}`. I used `{name} ხაზზე` (for example `მუსიკა ხაზზე`), parallel to `ყველა ხაზზე` and the existing paste status `· {name} ხაზზე`. The exact strings are in doc 034 and the tests.
3. **Zero-width guard** in `deleteRangeKeepingGap` (review fix). It is within §2.2's "same object when nothing in the window changes"; Delete on a zero-width range is now a no-op.
4. **Copy status** shows `ყველა ხაზი` on an all-lane range (§2.3 "other commands"; one string).
5. **Unused import removed:** `deleteTime` in the context was no longer used after the branch change, so lint would flag it.
6. **Native red included one fixture-error failure.** It was corrected and re-proved in scratch (§2).
7. **Mutation e is an equivalent mutant.** It is reported, and e2 was used.

## 7. Known gaps, and what C should check next (exact)

**Open for B:**
- review findings 2, 4, 5 and 7 (§4);
- Shift+click extension (not in scope);
- the lane overlay `/60` readability (on B's later list);
- R28-T Windows Ctrl+Shift+L interception (Tech Lead).
- No change to C-R27-01/C-R27-02/C-R23-01 (round-27 code untouched; G28-2).

**Next C checks** (my suggestions; C's §4 is authoritative):
1. **G28-1/G28-2** from scratch: 1096 + 23 = 1119 expected; 66 OK; 66 status lines; the line-567-only diff.
2. **R28-S:** hunks per §3 above, including deviation 6.1 (one string) and the `deleteTime` import removal. `cutTimeToClipboard` is byte-identical.
3. **R28-DA/DB/DV/DM** with real keys, plus the export windows: silence in `[3,5)` and ≤ 1 LSB elsewhere.
4. **R28-VL/VD/CX** on the §4.2 setup, with `Soft impact` crossing 3–5 on SFX.
5. **R28-PS:** Delete while playing across the window (no jump; one reschedule).
6. **R28-UI geometry:** footer/scroller vs round 27 at 1440/1280 on C's layout.
7. **A zero-width range** (a tiny drag back to the anchor) + Delete: no history, the status `…წასაშლელი მასალა არ არის…`, and clips unchanged.
8. **All-lane Ctrl+X** where only one audio lane has material, then Ctrl+V: record where it lands (finding 2). This is informational unless B rules otherwise.
9. **R28-U:** C's own mutations a–f. Note that mutation e must actually produce a history entry; see my e/e2 note.

**Scope completed:** §2.1–§2.7 and doc 034. B's acceptance criteria are not self-marked; C verifies.
