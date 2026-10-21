# A — Round 40 report (D-29z5: detail panel content fits its height)

Implementer: A (Claude Opus 5.5) · 2026-10-14 · No PASS claimed. C verifies.

**Session note:** the first A session (16:27–16:39) made the source, test and doc edits. It ran the red/green runs, the smoke and the gates, then ended without writing a report. A recovery A session (16:51+) took over. It inspected that partial work against the snapshots, did not redo or revert any of it, re-ran every gate itself (files `*-2.txt`), ran the code-reviewer and wrote this report.

## 1. Pre-flight gate

- **Assumptions:**
  - Only the 4 contract items of §2.1 change.
  - The jsdom tests pin markup only. Geometry evidence comes from the browser (C).
  - The marker and the Clip Gain reason never render together, because `isClipGainPending` requires `clipGainReason === null`. Reviewer check: see §5.
- **Smallest version:** about 40 changed lines in one TSX file. Two string constants plus one derived constant. No helper, no new export.
- **Files:**
  - `ArrangementDetailPanel.tsx`: the bug site.
  - `detail-panel-fit.test.tsx`: the red-first contract tests.
  - doc 038: §2.2.
  - This report.
- **Success:**
  - `detail-panel-fit` 7/7, with F1–F4 and F8 red on the old source;
  - frozen suites green;
  - tsc 0; vitest 1312 + 7;
  - build OK;
  - Biome `./app` at the baseline (2 CRLF errors, 218 warnings, 1 info).
- **Primitives read (recovery session, in full):**
  - `rules/read-primitives.md`;
  - `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `DESIGN_TOKENS`, `TAILWIND_FIRST`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`;
  - `prompts/new-test.md`, `prompts/studio-feature.md`;
  - the `pre-flight` skill.

### Baseline (recovery session, 16:51)

| Check | Result |
|---|---|
| HEAD | `6c7b4bbf4fe396bc8ae3b484ac370d0f9f7dc190` (root has not committed round 39) |
| 383-file list | `sha256sum -c b-round-39-tree-sha256.txt \| grep -vc ': OK$'` → **0** |
| Protected 4/4 | download-routes.test, account.downloads, api.studio-token, studio.$productId: **OK** |
| Snapshots | `ArrangementDetailPanel.tsx` is now `dbcd5c2f…` (snapshot `4249f4f3`); doc 038 is now `c5ed8de4…` (snapshot `7bf223eb`). Both differ **only** by this round's A edits (diffs: `a-round-40/diff-panel.txt`, `diff-doc038.txt`) |
| node.exe | 24 at the start, 28 during the gates |
| Untracked paths | Only the expected ones: round 39's plus `detail-panel-fit.test.tsx`, and root's 17 `.codex/agents/*.toml`. No `.kilo` path in `git status` |

### §1.4 re-checks

Grep across **all** files in `app/lib/arrangement/__tests__/` for `arrangement-detail-clip-gain-pending|clip-gain-reason|arrangement-detail-reason|clip-gain-reset|arrangement-detail-group|შეუნახავია`:

- **pending-status.test.tsx**: `PENDING_TEXT` is used only through `pending()?.textContent` (l.444/457/481), plus `expectNoMarker` and `not.toBeNull`. `textContent` stays the exact full string, so it is compatible.
- **clip-gain.test.tsx** l.306/772/788/840: the reset by test id, the reason by test id, the reset `aria-label`. Compatible.
- **detail-panel.test.tsx** l.408–411, **detail-panel-polish** l.395: the group container's `textContent` `toContain`. Compatible.
- None of them asserts the exact `className` of the marker, reason or info lines, the marker's `parentElement`, `title` absence, or `getByText(full marker)`. **No test pins the old markup, so no stop condition.**

Scoped Biome on `ArrangementDetailPanel.tsx`:

- before: `Checked 1 file … No fixes applied.` (`biome-before.txt`);
- after (both owned TS/TSX files): `Checked 2 files … No fixes applied.`

## 2. Red run and green run

**Red** (`a-round-40/red-run.txt`, against the old source; 5 failed, 2 passed):

| ID | Old source | New source |
|---|---|---|
| F1 | red (the marker class is only `text-warning`) | green |
| F2 | red (the reset's parent is the column, not a row) | green |
| F3 | red (the input `title` is null while pending) | green |
| F4 | red (no `focus-visible:ring-warning`) | green |
| F5 | green (must-not) | green |
| F8 | red (no `shrink-0`) | green |
| F9 | green (must-not) | green |

This matches the §2.3 expectation exactly.

**Green:** `green-run.txt` (16:32) and re-run `green-run-2.txt` (16:53): **7/7**.

## 3. Diff summary

### `app/components/arrangement/ArrangementDetailPanel.tsx`

- New module constants (not exported):
  - `DETAIL_CLIP_GAIN_PENDING_FULL_TEXT`;
  - `DETAIL_CLIP_GAIN_PENDING_LABEL`;
  - `DETAIL_CLIP_GAIN_PENDING_HINT = FULL.slice(LABEL.length)` (keeps the leading space).
- Info column: `shrink-0` added to the title `<p>`, the `ხაზი` `<p>` and the group `ხაზები` `<p>`. No other class changed.
- Clip Gain input:
  - `title = clipGainReason ?? (isClipGainPending ? FULL : undefined)`;
  - `cn(inputClass, isClipGainPending && 'border-warning focus-visible:ring-warning')`.
- The `0 dB` button is wrapped in `<div className="flex items-center gap-1">`. Its attributes, handlers and test id are byte-identical (re-indented only).
- The marker `<p>` moved into that row, after the button:
  - `id`, `data-testid` unchanged;
  - `className="min-w-0 truncate text-warning"`, `title=FULL`;
  - children: the `LABEL` text node, then `<span className="sr-only">{HINT}</span>`.
- The old marker block after the reason `<p>` was removed (moved, not deleted). The reason `<p>`s are byte-identical.

### `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` (new)

- 7 tests: F1, F2, F3, F4, F5, F8, F9.
- Mounted like `pending-status` / `clip-gain`, with a copied harness and no import from other test files.
- No `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments, no snapshots, no timers.

### `docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md`

- The status line, changed to the §2.2 text.
- The layout section: the round-40 placement, with B's numbers and A's smoke numbers.
- The clipping problem entry: its round-40 solution.
- The new section `## Round 40 — detail panel-ის ჩატევა (D-29z5)`: bugs, contract, rejected a–f, files, red/green table, C IDs, Ableton table (§4.8 verbatim semantics).
- One TODO line.

## 4. Browser smoke (first A session, 16:37–16:38; one run; NOT a PASS claim)

- **Setup:** gstack `/browse`, state file `a-browse.json` (wrapper `a-round-40/b.sh`), reader `a-round-40/geo.js`.
- **Server status:** the dev server was up at 16:37. At **16:55 it is unreachable**: `curl http://127.0.0.1:5173/studio-lab` → 000, exit 7. Per the orchestrator, A did not restart it, so the smoke was not repeated in the recovery session. The source has not changed since 16:32, so the smoke reflects the current code.

**1440×900, default height, SFX clip, typed `3`** (`smoke-1440-before.json`, `smoke-1440-typed.json`):

| Quantity | Before | Typed `3` (pending) |
|---|---|---|
| panel height / first lane top | 144 / 235 | 144 / 235 |
| `arrangement-detail-content` scrollHeight / clientHeight | 107 / 107 | **107 / 107** (+0) |
| marker `<p>` rect | none | top 780, bottom 796, w **69.8**, h **16** (1 line); x 1348.2–1418, inside the column x 1300–1428 and the scroller y 724–831 |
| marker `<p>` scrollWidth / clientWidth | none | **70 / 70** (not truncated) |
| `0 dB` button | top 776, bottom 800 | same; centre 788 = marker centre 788, so the same row |
| input `title` / `aria-describedby` | null / null | the full string / the marker id `:r2:` |
| marker `textContent`, first text node, `title` | none | the full string, `შეუნახავია`, the full string |
| input border | `rgb(48, 53, 65)` | `rgb(245, 158, 11)` |
| focused input `box-shadow` ring | n/a (not focused) | **`rgb(245, 158, 11) 0px 0px 0px 2px`** (warning) |

- After Enter (`smoke-1440-enter.json`): no marker, `title` null, ring `rgb(18, 217, 200)` (brand), scroller 107/107, status `Clip Gain: Soft impact — +3.0 dB.`
- Screenshots: `pm1-marker-1440.png`, `smoke-1440-enter-full.png`.

**1280×720** (`smoke-1280-*.json`, `pm-1280-marker.png`):

- The viewport was resized in the same browse session **without a reload**. The panel was then 142 px and the lane top 273, not round 39's 144/123. Treat this as a non-canonical layout; C must re-measure on a fresh load.
- Scroller 105/105 before and while pending (+0).
- Marker 69.8 × 16, scrollWidth = clientWidth = 70, ring `rgb(245, 158, 11)`.

**Not measured by A:**
- PM-R30 / R40-INFO (the C-R30-01 state with a range shown);
- the 120 px minimum height (MN-6);
- R40-RS.

## 5. Code-reviewer

The real `code-reviewer` subagent ran read-only on the three files. Result: **0 High, 0 Medium, 5 Low; score 9/10.** It confirmed:

- the diff scope (§2.1 items only; the button attributes are byte-identical);
- twMerge resolves the conflicts: `border-outline`→`border-warning` and `ring-brand`→`ring-warning`, while `border` and `ring-2` stay;
- tokens: `--color-warning`, `app.css` l.77;
- the marker and the reason cannot render together;
- the Tab order is unchanged;
- each mutation a–i is caught by its listed test.

| # | Finding (Low) | Where | Disposition |
|---|---|---|---|
| 1 | The layout-section l.71–74 still reads as the current round-39 choice ("not `sr-only` + `title`"), contradicting round 40 | doc 038 l.71 | **Fixed** (inside the §2.2 layout section): the paragraph is prefixed `Round 39 (D-29z4), ჩანაცვლებულია ქვემოთ, Round 40-ით:`. New doc sha `947d9f83…`, final diff `a-round-40/diff-doc038-final.txt` |
| 2 | The contract table l.45 still says the full text appears under `0 dB` | doc 038 l.45 | **Handed to B**: outside the §2.2 allowed parts. Suggest folding it into DOC polish |
| 3 | Stale TODO lines: Pan group "round 40", C-R30-01 under polish, marker clipping | doc 038 l.230/233/234 | **Handed to B**: §2.2 allows one new TODO line only (same as §7) |
| 4 | The `0 dB` button has no `shrink-0` in the new row; if the label rendered wider than about 80 px (a fallback font), "0 dB" could wrap inside `h-6` | TSX l.531–543 | **Handed to B/C**: the button's attributes are frozen by §2.1. Today 118 ≤ 128 px. C may add a check that the marker rect is ≤ 80 px wide; B may schedule `shrink-0` |
| 5 | F4 does not pin `focus-visible:ring-2` | test l.281–296 | **Not changed**: not in the a–i list; optional hardening for B |

After fix 1 (doc only), no code or test changed, so the gates in §6 still apply. Live shas: the TSX file is `dbcd5c2f…`, unchanged; doc 038 is `947d9f83…`.

## 6. Command tails (recovery session, verbatim)

```
$ git rev-parse HEAD
6c7b4bbf4fe396bc8ae3b484ac370d0f9f7dc190
$ sha256sum -c ../tmp/studio-real-loop/b-round-39-tree-sha256.txt | grep -vc ': OK$'
0
$ sha256sum (live)
dbcd5c2fa934a949760441b0ef78c65a027101a19c58768837a9f99e6cd45f9a *app/components/arrangement/ArrangementDetailPanel.tsx
c5ed8de4283a039f221f3b32656467b8a3675baca0607c595f2dee807909de14 *docs/…/038-studio-lab-pending-status.md   (before reviewer fix #1)
947d9f836ce654bde7aaca2b302df7fbbe281523fe77f1b3a1b181e771346a63 *docs/…/038-studio-lab-pending-status.md   (final)
$ protected
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ npx vitest run …/detail-panel-fit.test.tsx      (green-run-2.txt)
 Test Files  1 passed (1)
      Tests  7 passed (7)
$ npx vitest run <10 frozen suites>                (frozen-suites-2.txt)
 pending-status 22, clip-gain 28, detail-panel 24, detail-panel-polish 16, track-layout 36,
 gesture-guard 19, fader-guards 71, fader-click 26, delete-selection-ui 13, ArrangementContext 21
 Test Files  10 passed (10)
      Tests  276 passed (276)
$ npx tsc --noEmit
tsc exit 0
$ npm run verify                                   (verify-2.txt)
Agent references, review roles and skill mirrors passed.
Checked 343 files … Found 218 warnings.   (lint step)
 Test Files  72 passed (72)
      Tests  1319 passed (1319)            (= 1312 + 7)
✓ built in 7.97s / ✓ built in 2.41s
verify exit 0
$ npx biome check ./app                            (biome-app-2.txt)
Found 2 errors. Found 218 warnings. Found 1 info.
  errors = app\lib\auth.ts format, app\lib\__tests__\bug-hunting\auth-bugs.test.ts format (baseline CRLF, untouched)
  0 diagnostics in ArrangementDetailPanel.tsx / detail-panel-fit.test.tsx
$ tasklist | grep -ci node.exe
24 (start) · 28 (gates) · first session: 22 / 28 / 25
$ curl http://127.0.0.1:5173/studio-lab  (16:55)
000  (exit 7: connection refused — server down; not restarted by A)
```

## 7. Deviations and self-check

- **Doc 038, stale TODO line:** the line `B-ის განსახილველი: ნიშნის მესამე ხაზის ჩამოჭრა 144 px-ზე …` and the line `ჯგუფი 2 (round 40, …)` are now stale. §2.2 allows only one new TODO line, so A left them unchanged. B should decide whether to fix them (suggest adding them to DOC-polish).
- **Smoke at 1280:** a resize without a reload (see §4); not canonical.
- **Server down:** the smoke was not repeated in the recovery session.
- **Mutations a–i:** not run by A; they are C's job (§2.4). By inspection, the tests that should catch them are: (a) F2, (b) F1, (c) F1, (d) F4, (e) F4, (f) F5, (g) F1, (h) F8, (i) F3.
- **Self-check:**
  - Edge cases: a reason and the pending state at the same time is unreachable, because the pending state requires no reason.
  - Security: no new input path and no `dangerouslySetInnerHTML`.
  - Tokens only: `text-warning`, `border-warning`, `ring-warning`; `warning` is an existing token in `app.css`.
  - No arbitrary values, no inline styles, no comments, no new exports.

## 8. Acceptance status (A view only — C decides)

| Item | A evidence |
|---|---|
| §2.1 code contract | implemented; F1–F4, F8 green after red |
| §2.3 red-first | matches (F1–F4, F8 red; F5, F9 green) |
| G40-1 (A run) | tsc 0, vitest 1319/1319, build OK, Biome at baseline |
| G40-2 (A run) | protected 4/4, 383 OK, `git status` as §3.2 |
| R40-PM geometry | A smoke only at 1440 (+0 px, 1 line, not truncated, warning ring). **Not a PASS** |
| R40-RS / R40-INFO / R40-MN / R40-K / G40-3 | not run by A |

## 9. Exact next C checks

1. **First:** confirm the dev server is up. Root must restart it, because it was down at 16:55.
2. G40-2 → R40-S (`diff -u` of the snapshots).
3. R40-PM: PM-1 at 1440 on a fresh load. PM-1280 on a **fresh load** at 1280×720, expecting panel 144 / lane 123.
4. PM-R30 and R40-INFO in the C-R30-01 state (1280×720, a range shown): check `shrink-0` with no overlap and scroll reaching the last line. Repeat with a group.
5. R40-RS: measure only.
6. MN-1..6, with MN-6 at 120 px.
7. R40-U mutations a–i in a scratch copy.
8. R40-CR, R40-K, G40-1, G40-3.
9. Record the C-R23-01/C-R38-01 NUL offsets; the byte offsets will move.

## 10. Carried for B

- Root items from `root-pre-push-review.md` / `publication-checkpoint.json`, unchanged:
  - round 39 is checkpoint-ready (5 paths). Round 40 becomes ready only after C PASS;
  - 17 `.codex` toml; `.kilo` worktrees;
  - `test:e2e:smoke` (root only); SRW-21; Lenis; CRLF auth Biome errors; the others listed in the task §4.9.
- New: the dev server was down at 16:55 (environment, not BLOCKED).
- New: the doc 038 stale TODO lines (§7).
