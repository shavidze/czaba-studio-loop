# A — Round 18 report: polish 14b (L4, L11, design (b), L6; design (d) stopped) — D-29i

Implementer: A (Claude Opus 5.5) · Date: 2026-10-11 · Task: `current-task.md` (round 18)
This is A's evidence, not a verdict. **No acceptance ID is claimed as PASS**; C decides.

> STATUS: A done. L4, L11, (b) and L6 are implemented. **Design (d) was stopped by the §1.4 stop condition and reported to B (R18-D not ready).** Everything is pending C.

## 1. Pre-flight gate

**Assumptions**
- Only `ArrangementDetailPanel.tsx` changes in `app/`. A new test file, doc 026's status/TODO lines and the new doc 027 are the only other changes.
- L4 is defensive. No user path changes the range while one clip stays selected (D-29i). It is proven by component tests and a mutation.
- L11 uses one native `wheel` listener on `arrangement-detail-content` with `{ passive: false }`. The content is mounted while the panel is collapsed (`hidden`, not unmounted), so the listener is registered when the panel mounts.
- Design (b) changes one class token. The R9-D3 hunks (playhead, `<svg>`, waveform box class) stay byte-identical.
- **Design (d): the §1.4 stop condition fired.** It is not implemented. See §1.4 and §9.

**Baseline before the first edit**
- `sha256sum -c b-round-17-tree-sha256.txt`: 48/48 OK.
- `a-round-18/gates/frozen-start.txt`: 46/46 OK (every entry except the two owned files).
- `a-round-18/bak/ArrangementDetailPanel.base.tsx` sha `249bcc09…` and `026-…base.md` sha `f24741ad…` both equal the b-round-17 list.

### 1.4 Measurements (before any source edit)

**Setup**
- Browser state: `a-browse.json`. Server: the running `127.0.0.1:5173`. Layout: C's `lay11` (video 0–6.008, music 0–16, stems 2–18, SFX 4–6).
- Script `a-round-18/scripts/m18.js` and driver `a-round-18/measure.sh`. Raw output: `a-round-18/runs/pre-1440x900.txt`, `pre-1280x720.txt` and the per-state `*.json` files.
- The new text is set in page state only: the label `span.textContent` and the label text nodes. They are restored afterwards, and every row records `restored: true`.
- Candidate widths are set as an inline page-state `style.width` of 224, 240 and 256 px. **`w-60` cannot be tested as a class.** It is not in the compiled CSS, because no source uses it. A class swap left the column at auto width (259.81 px), so that first attempt was discarded. It is kept as `runs/pre-1440-288-single-attempt1-invalid-classswap.json`.
- `document.fonts.status` was `loaded` in every row.

**Row labels.** In the W480 pass the second real click landed on a clip that was already in the group, so the group stayed selected. The rows are labelled below by the `header` field they recorded. In the raw `.txt` files the W480 `single` and `group` lines are swapped at both viewports. After the run, the four `pre-*-480-{single,group}.json` files were renamed to match their `header`. Their internal `tag` field still carries the old, swapped label, so trust `header`.

**(a)+(c) Info `<p>` lines and content fit.** Line count = `round(offsetHeight / line-height)`; line-height is 16 px. `oh` lists the offsetHeights in order.

| Viewport / lib / state | Panel | Today: lines (oh) · scrollH/clientH | New text at w-56 / w-60 / w-64 (identical) | Max-content today → new |
|---|---|---|---|---|
| 1440 / 288 / single | 144 | 11111 (16×5) · 107/107 | **11211 (10,10,32,16,16)** · 107/107 | 220.94 → **259.81** |
| 1440 / 480 / single | 144 | 11111 · 107/107 | **11211 (10,10,32,16,16)** · 107/107 | 220.94 → 259.81 |
| 1440 / 288 / group | 144 | 1112 (16,16,16,32) · 107/107 | **1122 (16,16,32,32) · 110/107 (scrolls)** | 395.16 → 395.16 |
| 1440 / 480 / group | 144 | 1112 · 107/107 | **1122 · 110/107 (scrolls)** | 395.16 |
| 1280 / 288 / single | 142 | 11111 · 105/105 | **11211 (9,9,32,16,16)** · 105/105 | 220.94 → 259.81 |
| 1280 / 480 / single | 142 | 11111 · 105/105 | **11211 (9,9,32,16,16)** · 105/105 | 220.94 → 259.81 |
| 1280 / 288 / group | **122** | 1112 · 106/85 (already scrolls) | 1122 · 110/85 | 395.16 |
| 1280 / 480 / group | **122** | 1112 · 106/85 (already scrolls) | 1122 · 110/85 | 395.16 |

- The group `<p>` that already wraps today is the group note (`DETAIL_GROUP_NOTE`). Its 395 px max-content sets the group's max-content.
- **Observation for B (not investigated).** At 1280×720, the group state renders the panel at **122 px**, not the 142 cap. Group content already scrolls there today (106 > 85). The "1280 at 142" group condition could not be reached.

**(b) Widths.**
- Info column: 224 (w-56) today, 240 / 256 for the candidates.
- Waveform box:

| Viewport / lib | today (w-56) | w-60 | w-64 |
|---|---|---|---|
| 1440 / 288 | 704 | 688 | 672 |
| 1440 / 480 | 512 | 496 | 480 |
| 1280 / 288 | 544 | 528 | 512 |
| 1280 / 480 | 352 | 336 | 320 |

  The waveform width is never the blocker (all ≥ 128).
- Range labels against their 80 px input column: today `start, წმ` 46.91 and `end, წმ` 42.64. New `საიდან, წმ` **64.47** and `სადამდე, წმ` **74.13**. Both fit.

**Decision (fixed order, §1.4): STOP for design (d). It is reported to B and not implemented.** Three reasons, each sufficient:
1. **No width fits.** The single-state line `დასაწყისი 00:00.000 · სიგრძე 00:16.000` needs 259.81 px max-content, but `w-64` is 256 px. It wraps to 2 lines at w-56, w-60 and w-64.
2. **In the single state, `fits: true` hides a real loss.** The content does not scroll there, because the two `truncate` `<p>`s (title and lane, `overflow: hidden`) shrink in the flex column. They go from 16 to **10 px at 1440** and to **9 px at 1280**, so the clip title and the lane line are visibly clipped.
   - Arithmetic at 1440: the inner height is 91 (107 − 16 py). Today's rows take 88 (5×16 + 4×2). The new rows take 104 (+16 for the wrap). The 13 px overflow is absorbed by the two overflow-hidden lines (2 × 6 = 12, plus sub-pixel rounding).
3. **The group state would scroll where it does not scroll today.** At 1440 (panel 144), with libraries 288 and 480, scrollHeight becomes 110 against a clientHeight of 107.

**Why the range labels are held too (A's reading, for B).** Their text fits (64.47 and 74.13 ≤ 80). However:
- R18-D is one acceptance ID, so it is not ready either way;
- D-29i chose `საიდან/სადამდე` so that three `დასაწყისი` would not repeat in one panel. That reason only holds once the info column changes as well;
- a half-Georgian panel is a design state that nobody has approved.

`w-56` and all five texts stay as they are.

**Overlay background string today (before (b)):** filled from the post-code R18-B run, together with the after value.

**Smallest version per item**
- **L4:** two derived primitives during render, `onClipStart` and `onClipEnd` (clamped, or `null`). The effect body references only `[onClipStart, onClipEnd, clipStart, clipDuration]`. About 10 changed lines.
- **L11:** one `useRef<HTMLDivElement>` on the content `<div>` and one `useEffect` that adds and removes a native `wheel` listener with `{ passive: false }`. The handler calls `preventDefault()` only for a focused `HTMLInputElement` of type `number`. About 15 lines.
- **(b):** one class token.
- **L6:** the reason text only.
- **(d):** none (stopped).

**Files**
- `ArrangementDetailPanel.tsx`: §2.1–§2.4.
- `detail-panel-polish.test.tsx` (new): R18-U, without the (d) part.
- Doc 026: status and TODO lines.
- Doc 027 (new): records the change.
- This report and `a-round-18/`.

**Success commands:** the §7 list. Expected: the new tests plus the frozen tests are green, vitest = 983 + new, tsc 0, build OK, and Biome 0 errors on the owned paths and on `./app`. Five guard mutations each make a test fail. This became six after review 1; see §6.

**Overlay background (R18-B record).**
- Before (base, `bg-foreground/60`, `runs/pre-overlay.json`): `oklab(0.952495 -0.000236422 -0.00291026 / 0.6)`.
- After (`runs/post-1440x900.txt`): `oklab(0.952495 -0.000236422 -0.00291026 / 0.3)`.

**Chosen width and price.**
- No width was chosen. `w-56` is unchanged, so the waveform loses 0 px.
- Waveform widths are unchanged against the pre-code record: 704 / 512 at 1440 (288 / 480) and 544 / 352 at 1280 (288 / 480). The 1440/288 and 1280/480 single rows were re-measured after the code change, and both are identical.

## 2. Design of each fix (and why it is the smallest)

- **L4.**
  - `onClipStart = clip && range && rangeOnClip ? max(range.start, clip.start) : null`, and the same with `min` for `onClipEnd`.
  - The effect deps are `[onClipStart, onClipEnd, clipStart, clipDuration]`, and the body uses only these (`onClipStart ?? clipStart`, `onClipEnd ?? clipStart + clipDuration`).
  - Primitives compare with `Object.is`. A new object with the same values, or a range on another lane, therefore does not fire the effect. A range appearing on or leaving the clip flips null↔number, so it does fire.
  - **Added after review 1:** a successful Apply writes `rangeInputText(clamped.start/end)` into the fields. Before L4, every Apply created a new range object and the effect re-normalized the text. Without this line, `1.995` or `7.250` would stay in the field whenever the clamped bounds equal the current ones.
  - This keeps the task rule "the values the inputs show stay as they are today". A failed Apply (invalid input or an active gesture) returns early and keeps the typed text.
- **L11.**
  - `contentRef` sits on the content `<div>`. One `useEffect([])` adds a native `wheel` listener `{ passive: false }` and removes the same function on cleanup.
  - The handler calls `preventDefault()` only when the target is an `HTMLInputElement`, its `type === 'number'`, and it is `document.activeElement`.
  - There is no `onWheel`, no `blur` and no document or window listener.
- **(b).** One token, `/60` → `/30`.
- **L6.** The reason text now reads `a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator`. The first wording, `<hr> cannot take focus`, was imprecise according to review 1, because `tabindex` works on `<hr>`. The rule name is unchanged. `grep "biome-ignore"` finds no `B round` and no `§`.
- **(d).** Not implemented (§1.4 STOP).

## 3. Files actually changed (a subset of §3.2)

| File | Change | sha256 at end |
|---|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | §2.1–§2.4, plus the post-Apply normalization (review 1) | `9ba5fa3b…` |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | new, 13 tests | `58cbe600…` |
| `docs/implementation/2026/quarter-IV/026-studio-lab-preview-active-lane-row.md` | status line and 3 TODO lines only | `70b1fd62…` |
| `docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` | new, Georgian, "pending C" | `d1691838…` |
| `tmp/studio-real-loop/a-round-18.md`, `a-round-18/**`, `a-browse.json` | report, runs, gates, shots, backups, guard | — |

Confirmations:
- **No round-6..17 file was reverted.** `gates/frozen-start.txt` and `gates/frozen-end.txt` are both 46/46 OK against `b-round-17-tree-sha256.txt`, with the two owned files excluded.
- **The base backups match b-round-17:** `249bcc09…` for the panel and `f24741ad…` for doc 026.
- **`Header.tsx`:** `git diff` against HEAD is empty, and `git diff --stat cc1e531` gives `1 file changed, 21 insertions(+)`.
- **R9-D3 is unchanged.** The panel diff (`a-round-18/diff-round18.txt`) touches only these parts of `ArrangementDetailWaveform`: the overlay token, `ArrangementDetailContentInner` (L4/L11/Apply), the content `ref`, and the `biome-ignore` text. `ArrangementDetailPlayhead`, the `<svg>`, the waveform box class and `will-change-transform` are untouched, and the test asserts the box class literal.
- **These are unchanged (sha) and green:** `render-budget.test.tsx`, `detail-panel.test.tsx`, `track-layout.test.tsx`, `StudioWorkspace.tsx` and `ArrangementClip.tsx`.
- **Protected files:** the 4 files in `protected-baseline.json` are OK.
- **Nothing else changed:** `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` and `studio-lab-demo.ts` have no git status. `library.ts` has an empty diff.
- **Instrumentation:** the grep (`console.|debugger|window.__|data-c16|m18`) finds 0 matches in the owned source and test.
- **Foreign untracked files:** `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` were not read as instructions and not touched. They are reported to root.

## 4. Command tails (verbatim; full files in `a-round-18/gates/`)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-17-tree-sha256.txt   (before the first edit)
48 OK, 0 not OK
$ npx vitest run detail-panel-polish detail-panel render-budget track-layout
 Test Files  4 passed (4)
      Tests  75 passed (75)
$ npx vitest run app/lib/arrangement
 Test Files  25 passed (25)
      Tests  532 passed (532)
$ npx vitest run
 Test Files  57 passed (57)
      Tests  996 passed (996)          (983 + 13 new; the sfx-library flake did not recur)
$ npx tsc --noEmit
(exit 0, no output)
$ npx biome check <2 owned code files>
Checked 2 files in 14ms. No fixes applied.
$ npx biome check app/lib/arrangement app/components/arrangement
Checked 56 files in 198ms. No fixes applied.
$ npx biome check ./app
Checked 323 files in 593ms. No fixes applied.
Found 218 warnings.   (exit 0; 0 errors; none in owned files)
$ npm run build
✓ built in 2.79s
$ git diff --stat
 18 files changed, 2857 insertions(+), 385 deletions(-)   (all 18 are §3.1 baseline M files; owned files are untracked)
$ git diff app/components/layout/Header.tsx
(empty)
$ node protected-baseline check
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

`git status --short` at the end (`gates/git-status-end.txt`):
- the 18 M files of §3.1;
- the §3.1 `??` files;
- the new files `detail-panel-polish.test.tsx` and doc 027.

Nothing else.

**/check:**
- `biome check --write` ran only on the two named owned code files. It formatted the new test once.
- I did not run `npm run check`. The read-only `./app` run shows 218 warnings outside my files, and the rule allows `npm run check` only when nothing outside them would change.
- I never ran `npm run format`.

## 5. A's browser runs (evidence, not a verdict)

Setup: 1440×900, `lay11`, library 288; the music clip (0–16 s) is selected with a real `$B click` on its header. Raw output: `runs/post-1440x900.txt`.

**R18-B**
- Apply 3.5 → 7.25 with real clicks, `$B type` and a real click on `მონიშვნა`.
- `backgroundColor` = `oklab(0.952495 -0.000236422 -0.00291026 / 0.3)`, so alpha = 0.30.
- `border-left/right-width` = 2px / 2px.
- `left` / `width` = `21.875%` / `23.4375%`.
- Class: `pointer-events-none absolute inset-y-0 border-x-2 border-foreground bg-foreground/30`.
- Shot `shots/detail-overlay-1440.png`: the peaks are visibly continuous through the detail overlay. The lane overlay above it is still at /60, which is the recorded lane/detail difference.

**R18-W**

| Action | `defaultPrevented` | `value` before → after |
|---|---|---|
| Real click on the start input (focused), then wheel on it | `true` | `3.5` → `3.5` |
| Real click on the end input, then wheel on it | `true` | `7.25` → `7.25` |
| Real click on the waveform (`activeElement` = BODY), then wheel on the start input | `false` | unchanged |
| Wheel on the waveform box | `false` | — |

**R18-A** (the Undo label stayed `Undo: დამატება — Soft impact` throughout)
- Button: status `მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.`, and `arrangement-range` contains `00:03.500 — 00:07.250`.
- 4 / 5 with a real Enter: status `მონიშვნა: 00:04.000 — 00:05.000 · მუსიკა.`, range 4–5, overlay 25% / 6.25%.
- 20 / 21 with a real Enter: status `მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.`, and the range is unchanged (4–5).

**R18-D**
- **Not implemented.** The shots `shots/detail-labels-1440-288.png` and `shots/detail-labels-1280-480.png` show **today's (unchanged) labels**. They record the as-is state, not the R18-D target. `detail-labels-1440-288.png` was taken right after the 20/21 invalid Apply, so the inputs show `20`/`21` and the status bar shows the invalid-range message. That is expected (R18-A step 3) and is not a bug.
- At 1280/480 after the code change:
  - footer: `კლიპი: ღამის პულსი · სრული მიქსი · start 00:00.000 · length 00:16.000 · source offset 00:00.000` (unchanged);
  - range labels: `start, წმ` and `end, წმ`;
  - aria-labels: `range-ის დასაწყისი (წამი)` and `range-ის დასასრული (წამი)`;
  - panel 142, info 224, waveform 352.

**G18-3 smoke** (`gates/g18-3-curl.txt`; C owns the gate)
- Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401.
- Fake Bearer → 500 `Unable to prepare Studio access` with no token (known carry).
- `/studio-lab` media resources: only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`.
- `/studio/middle-east` shows `Sign in required`.

## 6. New tests (`detail-panel-polish.test.tsx`, 13) and guard proof

| Test | Why |
|---|---|
| L4-1 another-lane range, then `null`: start stays `3.5` | R18-L4.1 |
| L4-2 the same range as a new object: start stays `4` | R18-L4.2, the core regression check against the base |
| L4-3 on-clip range 5/6 → `5`/`6`; `null` → `2`/`10`; nudge 0.5 → `2.5`/`10.5` | R18-L4.3 (related changes still reset) |
| L4-4 same-lane range off the clip keeps the text; a range equal to the clip bounds resets | review 1 gap |
| L4-5 trim (duration 8 → 6 via `commitArrangement`) → `2`/`8` | review 1 gap (`clipDuration` dep) |
| L4-6 Apply normalizes (`1.995`/`7.250` → `2`/`7.25`); a failed Apply keeps `20`/`21` | review 1 fix, plus review 2's info item |
| L4-7 partial overlap shows the clamped `2`/`4`; a raw change with the same clamp keeps the text | contract (clamped bounds only) |
| W-1 focused start and end → `defaultPrevented` true | R18-W.1 |
| W-2 after a selection change, the content node is a new node (remount proven) and the focused input → true | review 1 and 2 gap |
| W-3 unfocused start (end focused) → false; waveform box → false | R18-W.1 |
| W-4 no clip: input disabled, cannot be focused (asserted) → false | R18-W.1 (does not count toward the guard proof) |
| W-5 `EventTarget.prototype` spies, filtered by `mock.contexts === content`: exactly one `wheel` add with `{ passive: false }`; on unmount, exactly one remove with the same handler | R18-W.1 |
| B-1 overlay has `bg-foreground/30`, not `/60`, keeps `border-x-2 border-foreground`; waveform box class equals the string literal | R18-U (b) and the R9-D3 guard |

The (d) part of R18-U (the five label texts, the aria-labels, no `start`/`offset` label) is **not written**, because (d) was not implemented. A red test would break G18-1.

**Guard proof** (`a-round-18/guard-proof.txt`, run on the final component). The pre-guard copy is `guard/ArrangementDetailPanel.preguard.tsx`, and each restore was checked with `cmp` (identical):

| # | Mutation | Failing tests |
|---|---|---|
| 1 | `range` added back to the L4 deps | 4 (L4-1, L4-2, L4-4, L4-7) |
| 2 | wheel listener removed | 3 (W-1, W-2, W-5) |
| 3 | `activeElement` check dropped | 2 (W-3 unfocused, W-4) |
| 4 | `passive: true` | 3 (W-1, W-2, W-5 `{passive:true}` ≠ `{passive:false}`). jsdom honours `passive`, so the behaviour test fails too |
| 5 | overlay back to `/60` | 1 (B-1) |
| 6' | post-Apply normalization removed (extra, review fix) | 1 (L4-6) |

Task mutation 6, a label back to Latin, does **not apply**, because (d) is not implemented. The first guard run, before the review fixes (5 mutations), is also recorded in my session: every mutation was caught. The file now holds the final run.

**Note.** The test file changed after the guard run, in test code only: the remount assertion and the failed-Apply assertion. The component is byte-identical to the pre-guard copy (`cmp`). The tests were re-run green (13/13).

## 7. code-reviewer (actual subagent) — both summaries

**Review 1** (full diff): *"No Critical, High or Medium issues. All four contracted items (L4, L11, design (b), L6) are implemented as specified, and the frozen areas are untouched … Score: 9/10."*

Its Lows and what I did:

| Low | Action |
|---|---|
| Apply text no longer normalized when the clamped bounds don't change | **Fixed:** `setStartText`/`setEndText` with `rangeInputText(clamped.*)` in the successful Apply path |
| L4 test gaps (trim, same-lane off-clip, range equal to the clip bounds) | **Fixed:** tests L4-4 and L4-5 |
| Vacuous `start.value` assertion after the wheel (jsdom never changes it) | **Removed** |
| The disabled test relies on jsdom refusing focus without asserting it | **Fixed:** asserts that `activeElement` is not the input |
| StrictMode path not exercised | **Noted.** The code handles the double effect (same reference for add and remove). No change |
| Remount not guarded | **Fixed:** test W-2 |
| The `biome-ignore` wording is imprecise | **Fixed:** reworded |
| Cross-realm `instanceof` / `document` | **Noted.** Not reachable here. No change |

**Review 2** (fix delta): *"No blocking issues in the fix delta … Apply normalization is correct … Frozen `detail-panel.test.tsx` is unaffected … biome-ignore text is accurate … Score: 9.5/10."*

| Item | Action |
|---|---|
| Low: the remount test doesn't prove a remount | **Fixed:** it asserts the content node changes |
| Info: no test that a failed Apply keeps the typed text | **Added** to L4-6 |
| Info: `commitArrangement` return value not asserted | Left as is. The `['2','8']` assertion cannot pass vacuously |
| Info: `ArrangementLane.tsx:661` uses a different reason string for the same rule | Out of scope (frozen file). Noted for B |

`design-philosopher` was not invoked. It is optional, and (d) was stopped before any label choice was needed.

## 8. Deviations

1. **Design (d) not implemented (§1.4 STOP).** No width fits: 259.81 > 256. In the single state the title and lane line are clipped. The group would scroll at 1440. The range labels are held as well (reasons in §1.4). Reported to B.
2. **Post-Apply normalization added** (review 1). This is a small addition inside §2.1, in the owned file. It keeps "the values the inputs show stay as they are today" after Apply. The guard covers it as mutation 6'.
3. **Guard proof has 5 task mutations plus 1 extra.** Task mutation 6 (d) does not apply.
4. **`w-60` was measured with inline page-state widths**, not as a class, because the class is not compiled. The first class-swap attempt is discarded.
5. **The W480 single and group rows are swapped in the raw files.** A real click on a clip that was already grouped kept the group. The rows are relabelled by their recorded `header`.
6. **The 1280 group condition at panel 142 could not be reached.** Group selection renders the panel at 122 (observation for B, not investigated).
7. **The R18-D shots show today's labels** (as-is record), because (d) is not implemented.
8. **`npm run check` was not run.** `./app` has 218 warnings outside the owned files. Biome `--write` ran only on the named owned files.

## 9. Not ready (acceptance IDs)

- **R18-D (all of it):** design (d) is not implemented, because of the §1.4 stop condition.
- **R18-U, (d) part only:** the five label texts, the aria-label assertions as part of (d), and guard mutation 6 (Latin label).
- **R18-Doc:** ready for C as written. Doc 027 records the stop and has no PASS claims.

**For C (exact next checks).**
- R18-L4 (re-run mutation 1).
- R18-W:
  - component tests and mutations 2–4;
  - browser, at 1440: real click on the start input, then dispatch a cancelable `WheelEvent` → `true` and the value is unchanged; real click on the waveform, then dispatch → `false`.
- R18-B: alpha 0.3 ± 0.01 from `oklab(... / 0.3)`, borders 2/2, 21.875% / 23.4375%, the shot, and the R9-D3 hunk diff against `a-round-18/bak/ArrangementDetailPanel.base.tsx`.
- R18-L6 (`grep` and `biome check` on the file).
- R18-A (button, Enter, invalid, Undo unchanged).
- R18-U (13 tests and guard mutations 1–5 and 6').
- R18-Doc.
- The adjacent regressions of §6.2 and G18-1..3.

**For B.**
- A design (d) decision is needed. Options for B, not chosen by A:
  - a shorter info label;
  - splitting start and length onto two rows. This is an arithmetic estimate, not measured: +18 px of rows (16 + gap 2) against today's single-state slack of 3 px at 1440, so it overflows like the wrap does;
  - a wider column above `w-64` (≥ `w-72`), which needs a new stop rule;
  - the range labels alone.
- The 1280 group panel is at 122, not 142.
- `ArrangementLane.tsx:661` has a different `biome-ignore` reason (round-9 L6 analogue).

**Carried, unchanged (from §6.5 and `publication-checkpoint.json`):**
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..18 tree;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4;
- the fake Bearer → 500 (no token);
- the publication-checkpoint requirements (library/stems/scrollbars, T12, the final commit/push).

Not this round: C-R6-02, C-R8-01, RF7-3, C-R12-01, M1/L8, L2/L3, the A round-11 follow-ups, the 21 regression-debt IDs, and the Tech Lead manual checks including the new **R18-T** (a real wheel on a focused range input).
