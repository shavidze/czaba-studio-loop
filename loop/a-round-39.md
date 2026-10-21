# A round 39: SRW-13 4b-2 group 1 (D-29z4): refusal status restore, unsaved Clip Gain marker, pending preview order

Implementer: A (Claude Opus 5.5) · 2026-10-14 · Task: `current-task.md` (round 39).

**Scope completed:**
- §2.1: context.
- §2.2: detail panel.
- §2.3: doc 037, 2 lines.
- §2.4: doc 038.
- §2.5: tests, red-first.
- §2.6: self-check, Biome, code-review, smoke.

**No PASS claim.** C verifies.

No commits, pushes, installs or deletions. The dev server was not started or stopped. No protected file was touched.

## 1. Pre-flight gate and §1.4 re-checks (before the first edit)

**Pre-flight gate**

- **Assumptions:**
  - The refusal restore lives only in `beginPointerGesture`'s release at count 0.
  - The raw `useState` setter stays.
  - The marker uses the same raw comparison as the blur early return.
  - The flush sits after the refusal guard and before `historyRef.current` is captured.
- **Smallest version:** context +14 lines, panel +18 lines. No new exports, no comments.
- **Files:** exactly the 5 in §3.2.
- **Success:**
  - `pending-status.test.tsx` is red on the old source and green on the new;
  - the frozen suites, tsc, full vitest, build and verify are green;
  - Biome adds no error.

**Baseline (13:3x, before any edit)**

- HEAD `6c7b4bbf4fe396bc8ae3b484ac370d0f9f7dc190`.
- `git status --short` showed only root's 17 `?? .codex/agents/*.toml`.
- Tree check: 0 non-OK, i.e. 380 OK.
- My 3 files matched the snapshots (`06338774`, `a48523be`, `263325b9`).
- Protected 4/4 OK. node.exe 5.

**§1.4 re-checks**

- **Refusal call sites** (grep `app/`, excluding tests), 10 in total:
  - `ArrangementContext` l.598, 1839, 1852;
  - `ArrangementLane` l.308 (`refuseFaderPress`);
  - `ArrangementMaster` l.134;
  - `ArrangementDetailPanel` l.288, 334, 373;
  - `StudioWorkspace` l.499, 1102.
  - All of them use the context `setStatus`. Lane l.113 and Master l.123 destructure it from `useArrangement()`. StudioWorkspace l.308 takes it from `useArrangement()` and passes it to the panel (l.1475). No component keeps its own status state.
- **The only decrement of `gestureCountRef`** is `beginPointerGesture`'s release (snapshot l.1322). Other uses are reads only (l.597, 1380, 1838, 1851, 2086, 2335).
- **Biome on the 2 source files before the change:** `Checked 2 files … No fixes applied` (`a-round-39/biome-before.txt`). After: `Checked 3 files … No fixes applied` (`biome-after.txt`).
- **Frozen suites with `GESTURE_*` status assertions after a release** all stay green (§6).
- **Hook dependencies:**
  - `beginPointerGesture` keeps `[]`. It uses only refs and the raw setter.
  - `previewTrackVolume` deps gained `flushPendingMaster`.
  - Biome: no new diagnostic.

## 2. Red and green runs (`pending-status.test.tsx`, 22 `it`)

**Red, first run.** In place, on the unchanged source, 19 tests, before any source edit (`a-round-39/red-run.txt`): **14 red / 5 green.**
- Red: S1, S2, S4, S5, S5b, S7, S8, S9, PM1, PM2, PM3, PM4, PM6, PO1.
- Green (must-not): S3, S6, PM5, PO2, PO3.
- PM2 and PM3 were first vacuously green. I tightened them with the PM1 precondition before Enter/Escape; they then turned red. B's expected list matches exactly.
- Later fix: `toggleTrackSolo('music')` → `('music', false)` (a tsc error). The runtime is identical, because the refusal fires before `additive` is read.

**Red, final run.** 22 tests, in a scratch copy outside `store/` with the snapshot sources (`a-round-39/red-run-final-raw.txt`, sources sha 06338774 / a48523be): **15 red / 7 green.**
- Red: S1, S2, **S1-same-act**, S4, S5, S5b, S7, S8, S9, PM1, PM2, PM3, PM4, PM6, PO1.
- PO1 old result: labels Mute, Master Volume, Volume; Master stays −3.
- Green (must-not / unchanged): S3, **S3-same-act**, S6, PM5, PO2, PO3, **PO4**.

**Green:** 22/22 (`a-round-39/green-run.txt`, and inside the frozen-suites run).

**New tests added after code review**, all in my file:
- **S1-same-act:** a refusal and the release in one `act`.
- **S3-same-act:** a new status and the release in one `act`.
- **PO4:** a Volume preview refused during a gesture flushes nothing; the Master preview stays pending and later commits as one `Master Volume` entry.
- PM6 now asserts `Object.hasOwn(clip, 'gainDb') === false`, not `?? 0`.

**Mutations** (scratch copy only, `a-round-39/mutations.txt`). Every mutation is caught:

| # | Caught by |
|---|---|
| (a) no restore | S1, S2, S1-same-act, S4, S5, S5b, S7, S8, S9 |
| (b) restore always | **S3-same-act only.** S3 does NOT catch (b): `'Y'` is committed in its own `act`, so the ref already equals `'Y'`. Correction for C's §4.7 table: row (b) → S3-same-act |
| (b2) first-refusal snapshot (an approximate emulation, not an exact mutation) | S5b |
| (c) restore at 2→1 | S4 |
| (d) edit refusal only | S2, S5 |
| (e) marker never | S9, PM1, PM2, PM3, PM4, PM6 |
| (f) marker also when the text is equal | PM1, PM2, PM3, PM4, PM6 |
| (g) no flush | PO1 |
| (h) extra: flush before the refusal guard | PO4 |

`a-round-39/scratch` is left in mutation (h) state. `a-round-39/README.txt` says how to restore the snapshot before C re-runs it.

## 3. Diff summary (`a-round-39/diff-context.txt`, `diff-panel.txt`, `diff-doc037.txt`)

**`app/contexts/ArrangementContext.tsx`** (sha `91fa12d6…`)
- After `const [status, setStatus] = useState(…)` (which is unchanged): `lastNonRefusalStatusRef = useRef(status)` and a `useLayoutEffect([status])`. The effect copies every status that is neither `GESTURE_EDIT_BLOCKED_MESSAGE` nor `GESTURE_UNDO_BLOCKED_MESSAGE`.
- `beginPointerGesture` release, count-0 branch: `setStatus((current) => isRefusal(current) ? lastNonRefusalStatusRef.current : current)`. The check is inlined; there is no helper and no wrapper.
- `previewTrackVolume`: after the refusal guard and before `const current = historyRef.current`, it runs `if (!volumeBeforeRef.current) flushPendingMaster();`. `flushPendingMaster` was added to the deps.
- Nothing else changed.

**`app/components/arrangement/ArrangementDetailPanel.tsx`** (sha `4249f4f3…`)
- `clipGainPendingId = useId()`.
- `isClipGainPending = clipGainReason === null && clipGainText !== clipGainInputText(clipGainDb)`.
- Input:
  - `aria-describedby` = reason id, else pending id, else `undefined`;
  - `data-pending="true"` when pending;
  - `className={cn(inputClass, isClipGainPending && 'border-warning')}`. twMerge drops `border-outline`.
- `<p id={clipGainPendingId} className="text-warning" data-testid="arrangement-detail-clip-gain-pending">შეუნახავია — Enter ინახავს, Esc აბრუნებს</p>`, after the reason `<p>` (the same slot; never both).
- Nothing else changed.

**Other files**
- **Doc 037** (sha `9d9f2122…`): only the status line (`Completed. Round 38 C PASS (c-round-38.md); Tech Lead R38-T ღიაა.`) and one TODO line → D-29z4 / doc 038.
- **Doc 038** (new, sha `7bf223eb…`):
  - the contract tables;
  - the rejected alternatives a–d;
  - the layout decision with measurements;
  - files;
  - problems: the re-claim edge, the same-batch edge, the unreachable no-gesture refusal, the marker clipping, SSR and live-region notes;
  - the red/green table and mutations;
  - C IDs;
  - the Ableton table (§4.8, verbatim statuses);
  - TODO for groups 2–4.
- **`pending-status.test.tsx`** (new, sha `f2cd4b53…`): no `any`, `@ts-ignore`, type assertions or comments. `GESTURE_*` strings are imported from the source.

## 4. Layout variant: **visible text**

- **Why visible:** the outer `section` height is fixed by `style={{ height }}` (the resizable size), and the content is `overflow-y-auto`. The outer panel therefore cannot grow, so the contract's `sr-only` trigger is not met.
- **Smoke at 1440×900** (`a-round-39/browser-smoke.txt`, screenshot `pm1-marker-1440.png`):
  - The panel is **144 px before and after** typing `3`. The first lane top is 235 px before and after (±0).
  - Border `rgb(245, 158, 11)` (= `--color-warning`).
  - After Enter: border `rgb(48, 53, 65)`, no marker, status `Clip Gain: Soft impact — +3.0 dB.`
- **Finding (open, B):** the content overflows internally (`scrollHeight` 107 → 122 vs `clientHeight` 107). At the default 144 px open height, the marker's 3rd line ("აბრუნებს") is clipped, and the content scrolls.
  - Fixing it means changing the text, the `w-32` slot or the default height. All three are outside A's ownership.
  - I did not switch to `sr-only`: that would hide the notice from sighted users, and the contract trigger is not met.
  - While the input is focused, the teal focus ring visually dominates the orange border.
- 1280×720 is not measured by A (C's PM-1280).

## 5. Code review (actual `code-reviewer` subagent, 3 code files): 8.5/10, no Critical/High

| # | Finding | Disposition |
|---|---|---|
| 1 | Medium: mutation (b) is not caught by S3; the same-act behaviour is untested | **Fixed:** added S1-same-act and S3-same-act. Mutation run confirms (b) is caught by S3-same-act |
| 2 | Low: a `setStatus('Z')` + refusal + release in one batch restores the older L | Unreachable today; recorded in doc 038 problems |
| 3 | Low: raw `useLayoutEffect` in an SSR-rendered provider (React 18 dev warning) | **Not changed:** B named `useLayoutEffect` explicitly. The same class already exists in StudioWorkspace and DetailPanel. **B follow-up** (alias l.410, or `useEffect`) |
| 4 | Low: PM6 `gainDb ?? 0` is loose | **Fixed:** `Object.hasOwn(clip,'gainDb') === false` |
| 5(i) | Low: a refused Volume preview flushing nothing is untested | **Fixed:** PO4 added; mutation (h) is caught |
| 5(ii), 7 | Info: a refusal with no gesture is unreachable | Recorded in doc 038 (wording: "unreachable", and a later gesture's release would restore it) |
| 6 | Info: the same-pointer re-claim hands off through count 0 | Recorded in doc 038 problems (accepted, D-29z4) |
| 8 | Info: the marker is not a live region | **Not changed** (not in the contract). B follow-up |
| 9 | Info: layout is not reviewable statically | Measured in the smoke (§4); the clipping was found |

## 6. Command tails (verbatim; full outputs in `a-round-39/`)

**Snapshot and status checks**

```
git rev-parse HEAD → 6c7b4bbf4fe396bc8ae3b484ac370d0f9f7dc190   (start and end)
git status --short (excluding root's 17 ?? .codex/agents/*.toml, unchanged):
 M app/components/arrangement/ArrangementDetailPanel.tsx
 M app/contexts/ArrangementContext.tsx
 M docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md
?? app/lib/arrangement/__tests__/pending-status.test.tsx
?? docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
sha256sum -c b-round-38-tree-sha256.txt | grep -vc ': OK$' → 0
protected: download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
```

**Tests**

```
pending-status: Tests 22 passed (22)
frozen suites (12 files incl. pending-status, final): Test Files 12 passed (12) · Tests 320 passed (320) · node 8→8
  (fader-guards 71, fader-click 26, gesture-guard 19, track-pan 26, master-ui 18, clip-gain 28, detail-panel 24,
   detail-panel-polish 16, track-layout 36, delete-selection-ui 13, ArrangementContext 21, pending-status 22)
npx tsc --noEmit → exit 0
npx vitest run (final) → Test Files 71 passed (71) · Tests 1312 passed (1312) · exit 0 · node 8→8   (1290 + 22)
```

**Build, Biome, verify**

```
npm run build → ✓ built in 6.69s · exit 0
npx biome check ./app → Checked 342 files · Found 2 errors · Found 218 warnings · Found 1 info
  2 errors = app\lib\auth.ts format + app\lib\__tests__\bug-hunting\auth-bugs.test.ts format (root CRLF; confirmed by a direct check)
  app/contexts + app/components/arrangement + app/lib/arrangement → 0 errors, 15 warnings, 1 info
npm run verify (final) → Test Files 71 passed · Tests 1312 passed · build ✓ · verify exit 0 · node 8→8
tasklist | grep -ci node.exe → 5 at start · 14 during the external bun storm · 8 at end
```

**Gate history (honest)**

1. **First frozen-suites run** (11 files): 297/298. The miss was the known `track-layout` "folds a lane…" **5000 ms timeout** under load. Re-run alone: 36/36. Final frozen run: 320/320.
2. **First full vitest:** 1309/1309, before the 3 review tests were added.
3. **First `npm run verify`:** **exit 1**, with 2 failures under load:
   - the same `track-layout` timeout;
   - `render-budget.test.tsx` l.547, `getLivePosition()` 0.007 ≠ 0 right after Play. Its fake clock is `Date.now()`, so this is wall-clock drift; no gesture or status is involved. Re-run alone 3×: 7/7 each time.
   - **Final `verify`: exit 0.**
4. **Environment:**
   - A bun.exe storm from other parent processes (131 bun.exe at peak), not mine. I did not touch it.
   - It caused a PreToolUse hook timeout, and two of my background jobs were killed by their time limit and then re-run.
   - `npm run test:e2e:smoke` was **not run**: it starts its own dev server (task §2.6; root only).

## 7. Deviations and §2.6 self-check

**Deviations**
- 3 tests beyond B's table: S1-same-act, S3-same-act, PO4. These came from code review; the gate allows "+ new it count".
- Correction to B's §4.7 mutation table: (b) is caught by S3-same-act, not by S3.
- No frozen test was amended. No frozen test failed outside load timeouts.

**Self-check**
- Edge cases: an empty status is never written by the mechanism; the 2→1 count drop is a no-op; the claim path's deferred release is covered by S8 (blur) and the separator path by S7.
- The marker never coexists with the disabled reason.
- No hardcoded colour and no custom CSS: tokens only (`border-warning`, `text-warning`).

## 8. Browser smoke (optional, one run, not a PASS)

- See §4 and `a-round-39/browser-smoke.txt`.
- The gstack daemon failed to start 7 times. The last attempt came up late and was reused, with my own state file `a-browse.json`.
- I stopped the daemon afterwards: pid 31204 and its children are gone, and `a-browse.json` is removed.

## Known gaps / open items for C and B

- **Marker clipping** at the default 144 px open height (the 3rd line is hidden; the content scrolls). B decides: shorter text, wider slot or taller default.
- **B follow-ups:** an SSR-safe layout effect (review #3); a live region for the marker (review #8).
- **A did not check in the browser:** R39-ST status restore, PM-KEPT, PM-RAW, PM-VID, Escape, 1280×720, G39-3 network. R39-PO is unit-only by design.
- **Carried items, unchanged:**
  - C-R27-01, C-R6-02, C-R8-01, C-R23-01 + C-R38-01, C-R30-01;
  - 4b-2 groups 2–4;
  - the root items in `root-pre-push-review.md` / `publication-checkpoint.json`, as listed in task §4.10. These include SRW-21, Lenis on `/studio/*`, the export hard-clip, the auth CRLF Biome errors, the `frontend-architect.md` grant, the Modal focus gap, GA scroll with consent denied, fake Bearer → 500, the CDP allowlist, `Content-Type` charset, dev-server availability, and the 17 `.codex` files.
  - My byte changes to the 2 source files may move the C-R23-01 NUL offsets; C re-records them.

## Exact next C checks

1. **G39-2:** HEAD `6c7b4bb`; the 5 lines above + root's 17; 380 OK; protected 4/4.
2. **R39-S:** `diff -u` the snapshots against the live files (only the hunks in §3).
3. **R39-U:** re-run `pending-status.test.tsx` (22) and my red run against the snapshot. Restore `a-round-39/scratch` first (README), or use a fresh scratch copy. Re-run mutations (a)–(h); note that (b) maps to S3-same-act.
4. **R39-ST**, ST-1…ST-6 and ST-1280:
   - read the status immediately and again ≥100 ms after `pointerup` 41;
   - ST-5 may be "unit only: S3 / S3-same-act".
5. **R39-PM**, PM-1…PM-1280:
   - geometry: the outer panel height and the first lane top;
   - record the internal-overflow clipping finding at 144 px and at 1280×720;
   - border `rgb(245, 158, 11)`;
   - PM-KEPT: the marker stays and the status is restored after `pointerup` 41;
   - PM-RAW; PM-VID.
6. **R39-MN, R39-CR, R39-K, R39-Doc**, and G39-1 / G39-3 as in the task.

**Ready for C. Not ready for a root checkpoint until C passes it.**
