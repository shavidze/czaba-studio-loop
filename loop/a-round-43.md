# A — Round 43 report (SRW-13 4b-2 group 4; D-29z8)

Implementer: A (Claude Opus 5.5) · 2026-10-14 → 2026-10-15 · No commit/push/deploy. **No PASS claimed; C verifies.**
Artifacts: `a-round-43/` (red-run, order-table, r37-mutation(+snapshot), ht-mutation-b/c, green-run, vitest-full, biome-*, build, verify, final-gates, checkpoint).

## 1. Pre-flight gate

- **Assumptions:**
  - The task is three Low items: a hold-tick geometry fix in `ArrangementMaster.tsx` only, plus two test-only items.
  - A-R38: "proof" means the both-order run plus a written argument, since `useRelativeFaderDrag.ts` must not change.
  - The `fader-guards` grant covers only the `C-R36-01` describe.
- **Smallest version:**
  - one conditional transform write and 2 local consts (~6 lines);
  - 3 new HT `it`s and 5 S `it`s;
  - +11 lines in `fader-guards`.
- **Files:** exactly the §3.2 list.
- **Success:**
  - HT1 red on the snapshot and green after;
  - the S-table identical in both orders (or a red test);
  - N5 red at the new pin under R4;
  - tsc 0;
  - vitest 1333 + 8;
  - build and verify pass;
  - Biome `./app` = 2 baseline errors / ≤ 218 warnings.
- **Baseline before any edit:**
  - HEAD `b6a96f8`; `git status` empty;
  - 387 OK (non-OK count 0);
  - snapshots `1707798c`/`9721d08f` = working copies;
  - protected 4/4 OK;
  - node.exe 24;
  - `/studio-lab` 200.
- **§1.4 re-check (grep `__tests__/` for `translateX`, `data-hold-db`, `style.transform`, `arrangement-master-meter`):**
  - `render-budget.test.tsx:244` parses `translateX` only in `detailTranslatePercent` (the detail playhead);
  - `meter-ui.test.tsx:334/550` reads the meter by testid; only the attributes and `aria-hidden` are read;
  - `data-hold-db` is read only in `meter-ui` and `track-meter-ui`.
  - **No frozen test parses the Master hold transform or class**, so there is no stop condition.
- **Biome before/after on the 2 existing files:**
  - I did not run the "before" check prior to the first edit (deviation).
  - A later stdin attempt on the snapshot contents was inconclusive: stdin mode prints a formatting result.
  - "After": both files have 0 diagnostics ("No fixes applied"), and `./app` totals equal the baseline. So no new diagnostic.

## 2. Runs

### 2.1 Red run (`a-round-43/red-run.txt`), order as required

1. HT2/HT3 were written first and run against the snapshot `ArrangementMaster.tsx` (sha `1707798c`).
   - The first run made HT3 red on float32 noise: `translateX(72.72727234350457%)` vs `72.727272…`. That was a test defect, not product behaviour.
   - Fix: parse the `%` with a regex (the plain `translateX(N%)` form is still required) and compare with `toBeCloseTo(…, 4)`. HT2/HT3 then went green.
2. **Form chosen after a jsdom probe.** jsdom drops `translateX(min(…))` and `translateX(clamp(…))` and returns `""`. It keeps `calc()` and plain `%`.
3. HT1 was added and run on the snapshot: **HT1 red** (`expected 'translateX(99.99999967176774%)' to be 'translateX(calc(100% - 1px))'`), HT2 and HT3 green.

### 2.2 A-R38 both-order table (`a-round-43/order-table.txt`)

**Method:**
- Scratch = a copy of `store/app` under `tmp/studio-real-loop/a-round-43/scratch`.
- **`scratch/node_modules` is a directory junction to `store/node_modules`.** This is not an install. Remove it only with `cmd /c rmdir`, never with `rm -rf`.
- Hook shas: current `dabedf7d`, mutation (i) `5294862e`.

| Case | Current | (i) | Differs |
|---|---|---|---|
| S1 Clip Gain "3" → music Volume press | at press: `Clip Gain` +3, status `Clip Gain: Hit — +3.0 dB.`, field `3.0`, focus = music Volume; after: chain [Clip Gain], not blocked | identical | no |
| S2 music Volume key preview → SFX Volume press | one `Volume`, focus SFX Volume, status unchanged | identical | no |
| S3 Master key preview → music Volume press | one `Master Volume` | identical | no |
| S4 Pan key step → music Volume press | only `Pan — მუსიკა` | identical | no |
| S5 (A's choice) music Volume key preview → Master press | one `Volume` (exercises the `gestureCount > 0` guard in `commitTrackVolume`, l.2100) | identical | no |

**Runs:**
- control 76/76;
- (i) 76/76 (`fader-focus-order` + `fader-guards`).

**Diagnostic (scratch only):**
- (i) with the StudioWorkspace root capture removed → **S1 red** (`expected null to be 'Clip Gain'`);
- the capture removed with the current hook → 5/5 green.

**Outcome:** equivalence today. S1–S5 are kept as must-not pins, green in both orders; they **do not** detect the order. The argument with file/line references is in doc 040 §A-R38.

### 2.3 R4 mutation (`a-round-43/r37-mutation.txt`)

The mutation: in scratch `ArrangementDetailPanel.commitClipGain`, the blocked branch always calls `setClipGainText(currentText)`.

- **New `fader-guards`:** 4 red.
  - N1 at l.1630 (`'0.0'` vs `'3'`): the same assertion as before.
  - N2 at l.1658.
  - N3 at l.1679.
  - **N5 at the new pin l.1711.**
- **Snapshot `fader-guards` under the same mutation** (`r37-mutation-snapshot.txt`): 3 red, **N5 green**, so the hardening adds coverage.

### 2.4 Extra HT mutations (scratch)

- (b) clamp at every level (`calc(f% − f px)`): HT1, HT2 and HT3 red (NaN from the parse).
- (c) visibility always `visible`: HT3 red (`'visible'` vs `'hidden'`).
- **Inset (added after the advisor review):** hold layer class `inset-0` → `inset-y-0 left-0 right-px`. This leaves every transform string unchanged, so it is the other way to do C's mutation (b). HT2 is now red at its new class pin (`ht-mutation-inset.txt`).
- (a) = the red run.
- (d) = (i): documented as equivalent.
- (e) = R4.

### 2.5 Green run (`green-run.txt`)

The §4.7 suites: 12 files, **227/227**.

## 3. Diff summary

- **`ArrangementMaster.tsx`** (sha `849e6b40`):
  - adds the `METER_CEILING_DB` import;
  - adds `MASTER_HOLD_CLAMP_FROM_DB = METER_CEILING_DB − 1` and `MASTER_HOLD_TOP_TRANSFORM = 'translateX(calc(100% - 1px))'`, both unexported;
  - `writeMeter` writes the top transform when `holdDb > +5`, otherwise the unchanged `translateX(f·100%)`.
  - Nothing else changed: no class changes, no layout read, the same per-frame path.
- **`fader-guards.test.tsx`** (`f60b34d9`), only inside `C-R36-01`:
  - **N1:** `act(() => { field.blur(); })` + `activeElement !== field`; after `field.focus()`, `activeElement === field`.
  - **N2:** the same, plus a pin that the second-pointer Master press does **not** move focus (it is refused before `focus()`).
  - **N5:** `field.value === '3'` and `undoLabel === null` between the release and `selectClip`.
  - Every snapshot `expect` is kept unchanged (+7 expects, 0 removed; the reviewer confirmed this by count).
- **`master-hold-tick.test.tsx`** (new, `93eb697a`):
  - **HT1:** +6, +12, +5.5 → top transform, 2 px classes kept; +4.9 → unclamped.
  - **HT2:** 0 dB = 60/66, plus a structural pin that the hold layer keeps `inset-0` and has no `right-`/`left-`/`inset-x-` class.
  - **HT3:** −12 dB = 48/66 and visible; Pause → `-inf` and hidden.
  - These are structural pins; jsdom has no layout (stated in the describe title).
- **`fader-focus-order.test.tsx`** (new, `113d74b4`): S1–S5 per §2.2.
- **Doc 040** (new, `f91ab6cb`), in Georgian:
  - TEMPLATE sections, a Mermaid diagram and the Ableton table (all rows "not applicable");
  - the A-R38 argument with references;
  - TODO: rounds 44 and 45, then SRW-14.

## 4. Browser smoke: **not run**

- The dev server was up (`/studio-lab` 200 at 1440×900).
- The Master meter rect was read on an empty arrangement: left 973.09, 80 × 6 px, `data-hold-db` `-inf`.
- The layout set-up failed: the daemon logged "Server failed to start within 15s" once. Then every `eval` of the C helper scripts failed in my fresh state (`a-round-43/browse-a43.json`), so `window.__c` stayed undefined and L43 could not be built.
- I stopped within the attempt budget. No `$B restart` was used.
- **C's R43-HT browser geometry is the real acceptance and remains unverified by A.**

## 5. code-reviewer (real subagent run): approve, 9/10, no High or Medium

| Finding | Severity | Disposition |
|---|---|---|
| The +5 threshold stays monotonic only while W ≥ 66 px; nothing enforces it | Low | Documented in doc 040 (holds for `w-20`); no code |
| No pin at exactly +5.0 (`>` vs `≥`) | Low | Deferred and documented: float32 cannot produce an exact +5.0, and a direct `writeMeter` test needs a new export |
| The focus-order pins cannot detect the order swap | Low | Describe title renamed ("contract pins … do not detect the order"); doc says so |
| `1px`/`-ml-px` are fixed while `w-20`/`w-0.5` scale with the root font, so the guarantee holds at a 16 px root | Info | Noted in the doc |
| HT1 title wrongly said +12 is "clamped by the meter" | Info | Title fixed |
| The `FakeSplitter.connect` override did nothing | Info | Removed |
| `rounded-full` clips the tick vertically at the ends | Info | Already accepted (§0.1.5) |
| Synthetic keyDown+change without keyUp for a pending preview | Info | Accepted (reaches the path; C's REAL keys cover the user flow) |
| The blur path calls `syncPlayback`, the flush path does not | Info | Frozen file; documented as internal and not observable |

All doc line references were checked by the reviewer.

## 6. Command tails (verbatim, abbreviated)

**Final gates** (`a-round-43/final-gates.txt`, after the review edits):

```
== final gates node.exe 32 11:05:49
b6a96f8706b5c7b8630c133c82ac89c65dc1e906
 M app/components/arrangement/ArrangementMaster.tsx
 M app/lib/arrangement/__tests__/fader-guards.test.tsx
?? app/lib/arrangement/__tests__/fader-focus-order.test.tsx
?? app/lib/arrangement/__tests__/master-hold-tick.test.tsx
?? docs/implementation/2026/quarter-IV/040-studio-lab-master-hold-tick-and-fader-test-hardening.md
387 non-OK: 0
protected: 4 × OK
tsc exit 0
 Test Files  76 passed (76)
      Tests  1341 passed (1341)
Found 2 errors.   (app\lib\auth.ts format, app\lib\__tests__\bug-hunting\auth-bugs.test.ts format — baseline CRLF)
Found 218 warnings.
Found 1 info.
== idle node.exe 44 11:06:49
```

The full vitest run for the final tree is in `verify.txt`: 76 files, 1341/1341.

- **Build** (`build.txt`): `✓ built in 6.14s`, `BUILD_EXIT 0`.
  - The first background build+verify was killed at the background time limit while loading the config (esbuild "service was stopped", node.exe 28). The foreground re-run passed.
- **`npm run verify` on the final tree** (`verify.txt`, 11:05:18, after every edit including the HT2 class pin): 76 / 1341, `✓ built in 33.71s` / `5.80s`, `VERIFY_EXIT 0`.
  - An earlier verify, run before the review edits, also exited 0.
- **Biome on the owned files:** `--write` on the 4 code files → "No fixes applied".
  - Diagnostics in my files within `./app`: 0.

## 7. Deviations and self-check

- **Hold form is a branch, not the B-suggested `min()`.** jsdom drops `min()`, which the task anticipated. The 0.21 px rightward step just above +5 dB is allowed by §0.1.3.
- **Biome "before"** was not run prior to editing (§1).
- **Browser smoke** not run (§4).
- **Scratch `node_modules` junction:** used only for the scratch runs. **Removed after the runs** with `cmd /c rmdir` (link only; `store/node_modules` intact). A rerun needs it re-created the same way. `mutate.cjs` reproduces every mutation.
- **Self-check:**
  - no `any`, `@ts-ignore`, type assertions (`instanceof` guards only), `//` comments, hardcoded colours or new exports;
  - semicolons; LF line endings.
  - Edge cases: +12 dB (fraction clamps), the floor (hidden), float32 near +6.

## 8. B acceptance items A actually passed (self-run; C must re-verify)

- §2.3 red/green order: met.
- A-R38 table recorded: met.
- R4 mutation run: met.
- Frozen suites green: met.
- `git status` = §3.2: met.
- 387 OK, protected 4/4: met.
- **Not met by A:** the browser smoke.
- **Not A's to claim:** R43-HT, REG, G43-3.

## 9. Exact next C checks

1. **G43-2:** HEAD, `git status`, 387, protected; shas from §3.
2. **R43-S:**
   - `diff -u` of both snapshot files (Master: import + 2 consts + transform branch only; fader-guards: `C-R36-01` only);
   - the no-`any`/comment/colour/export check.
3. **R43-HT in the browser:**
   - HT-TOP: every sample with `holdDb ≥ +6` must keep the tick inside.
     - Expected tick rect: left = meter.left + 78, right = meter.right. Compare with `≤` plus a float tolerance.
     - Inline `hold.style.transform` = `translateX(calc(100% - 1px))` for every sample > +5.0.
     - `getComputedStyle(hold).transform` ≈ `matrix(1, 0, 0, 1, 79, 0)` at W = 80.
     - At 0 dB the computed transform is ≈ `matrix(1, 0, 0, 1, 72.727, 0)`.
   - HT-ZERO, HT-LOW: unchanged centre within 0.5 px.
   - HT-FLOOR, HT-1280, HT-TRACK.
   - Also look at samples in (+5, +6): centre 79 px.
4. **R43-U:** re-run mutations (a)–(e) yourself. Confirm or refute the A-R38 equivalence argument (doc 040 references), and try to construct a differing case (→ C-R43-xx).
5. **R43-REG, R43-Doc, G43-1, G43-3.**

## 10. Carried items for B/C (unchanged; not addressed this round)

- **Open C bugs:** C-R41-01 (TL-Q-VIEWPORT); C-R27-01; C-R6-02; C-R8-01; C-R23-01 + C-R38-01 (Tech Lead).
- **Open Low items:** R26-M1; round 44 (R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY); round 45 polish items; A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE; L3-REMOVED-TRACK-TAPS.
- **Root items** (`root-pre-push-review.md` 2026-10-07 — M1–M3, L1–L4, L6–L8 closed, L5 accepted; `publication-checkpoint.json` has no `round42Checkpoint` entry yet; root records `b6a96f8`):
  - GSTACK-ACL;
  - the ignored `.kilo/`;
  - e2e smoke (root only);
  - SRW-21;
  - the CRLF Biome errors on the auth files;
  - ENV-BROWSE-DAEMON. Seen again this round: "Server failed to start within 15s" on the first command of a fresh state file.
- **New A-local items for B:**
  - **A-R43-REVIEW-W66** (Low): the hold threshold is coupled to a meter width ≥ 66 px;
  - **A-R43-REVIEW-ROOTFONT** (Info);
  - **A-R43-EXACT-5DB** (Low): no pin at exactly +5.0;

Round 43 becomes checkpoint-ready only after C PASS.
