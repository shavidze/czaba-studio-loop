# A — Round 41 report (C-R40-01, D-29z6)

Implementer: A (Claude Opus 5.5) · 2026-10-14 · No PASS claims; C verifies.

## 1. Pre-flight gate (posted before the first edit)

- **Assumptions:** placement-only change; `disabled`/`title`/`aria-describedby`, Tab order, marker row, range Apply, info column, `key` remount and wheel handler stay as they are. "Group" = `!clip && group`; "none" = `!clip && !group`; selection ⇔ clip (selection.clip is required). The none-state middle box stays empty.
- **Smallest version:** ~35 lines net in `ArrangementDetailPanel.tsx` (build each reason `<p>` once, place by state, 1 prop, 1 import, scroller `cn`). No new helper or export.
- **Files:** `ArrangementDetailPanel.tsx` (the bug), new `detail-panel-reason.test.tsx` (red-first contract), doc 038 (§2.2). Nothing else.
- **Success:** RF1/RF2/RF5 red on old source, RF3/RF4/RF6 green; all 6 green after; frozen suites unchanged; tsc 0; full vitest 1319+6; Biome `./app` = 2 baseline CRLF errors, 218 warnings, 1 info; `npm run verify` exit 0.

**Baseline (before any edit):** HEAD `63ce722dfd07…`; `git status --short` = only root's 17 `.codex/agents/*.toml`; `sha256sum -c b-round-40-tree-sha256.txt | grep -vc ': OK$'` → **0** (384 OK); `ArrangementDetailPanel.tsx` `dbcd5c2f…` and doc 038 `947d9f83…` = snapshot `SHA256SUMS.txt`; protected 4/4 OK; `node.exe` 34. Biome on the panel before: `Checked 1 file … No fixes applied` (0 diagnostics; `a-round-41/biome-before.txt`).

**§1.4 re-checks (grep over every file in `app/lib/arrangement/__tests__/`):**
- `arrangement-detail-reason` / `-clip-gain-reason`: `clip-gain` l.772/788, `detail-panel-fit` F5 l.301–308, `pending-status` PM5 l.503/508 — all by test id + text/id/aria/class tokens only; **no column or sibling position pinned**.
- `arrangement-detail-video-placeholder`: `detail-panel` l.416 pins only `textContent` (exact). No class/tag/parent pinned.
- `arrangement-detail-waveform`: `detail-panel-polish` l.317 (wheel), l.358 (`WAVEFORM_BOX_CLASS` exact — box class unchanged).
- `arrangement-detail-content`: `detail-panel` l.312 (textContent), `polish` l.303/334/364/406, `fit` l.203 — no `className`, no `children.length`.
- `firstElementChild` users on the content: `detail-panel-fit` l.203, `detail-panel-polish` l.365, l.406 → the info column, still `content.firstElementChild`. Other `firstElementChild`/`children[`/`parentElement` hits are lane/clip/header/modal DOM, unrelated. `within(` and `bg-elevated`: no hits.
- **No stop condition hit.**

## 2. Red / green

`a-round-41/red-run.txt` (old source, test file only; node.exe recorded in file):

| ID | Old source | New source |
|---|---|---|
| RF1 group → middle box, order, linked | **red** (`expected false to be true`) | green |
| RF2 video → waveform below placeholder | **red** | green |
| RF3 must-not none | green | green |
| RF4 must-not audio + marker row | green | green |
| RF5 scroller has `STUDIO_SCROLLBAR_CLASS` tokens | **red** | green |
| RF6 must-not `text-dim`, no title, whole | green | green |

Matches §2.3 exactly (3 red / 3 green). Green: `a-round-41/green-run.txt` → `Tests 6 passed (6)`.
Final-file red run (after review finding 1): `a-round-41/red-run-final.txt`, scratch copy outside `store/` with the old panel `dbcd5c2f` + final test `b919643f` → `Tests 3 failed | 3 passed (6)`, same per-case pattern.

## 3. Diff summary

- **`app/components/arrangement/ArrangementDetailPanel.tsx`** (`a-round-41/diff-panel.txt`, sha `61834b2a…`):
  - `type ReactNode` added to the react import; `import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar'`.
  - `ArrangementDetailWaveform`: optional `videoClipGainReason?: ReactNode`; the video branch is now one layer `absolute inset-0 flex flex-col items-center justify-center gap-1 bg-elevated px-2 text-center` containing `<p className="text-muted" data-testid="arrangement-detail-video-placeholder">` + the prop. Waveform box `className` unchanged.
  - Content: `isGroupState`, `isNoneState`; `rangeReasonNode` / `clipGainReasonNode` built once (same `id`, test id, `text-dim`, text; no `truncate`/`title`).
  - Scroller: `cn('flex min-h-0 flex-1 gap-3 overflow-y-auto px-3 py-2', STUDIO_SCROLLBAR_CLASS)`.
  - Waveform gets `videoClipGainReason={selection.isVideo ? clipGainReasonNode : null}`; middle box adds `flex flex-col gap-0.5 px-2 py-1` and renders both nodes only in the group state; range column and Clip Gain column render their node only in the none state.
  - Biome `--write` on the 2 TS/TSX files reordered the react import (`type ReactNode` before `type PointerEvent as ReactPointerEvent`) and wrapped lines; no other change.
- **`app/lib/arrangement/__tests__/detail-panel-reason.test.tsx`** — new, 6 `it` (RF1–RF6); helpers copied from `detail-panel-fit` (not imported); `instanceof` guards only, no assertions/any/comments/timers/snapshots.
- **`docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md`** (`a-round-41/diff-doc038.txt`, final sha `cf894ea3…`): status line verbatim per §2.2.1; l.45 now states the round-40 truth (`შეუნახავია` in the `0 dB` row; rest in `sr-only` + `title`; full string = textContent/description); new section `## Round 41 — გამორთული ველების მიზეზი ყოველთვის ჩანს (D-29z6)` (bug + C table, B measurement + fit check, state table + scroller, none rationale, rejected a–g, files, red/green, C IDs, the §4.8 two-row Ableton table, "არ ეხება" only); TODO rewritten (C-R40-01 → round 41; groups 2/3/4 → rounds 42/43/44; 4c; polish without C-R30-01; SSR-LAYOUT-EFFECT-WARN kept; closed "მესამე ხაზი" and rejected live-region removed; Tech Lead R38-T + R23-1 detail scroller). Earlier sections untouched.

## 4. Browser smoke — NOT RUN (ENV-BROWSE-DAEMON)

Dev server `http://127.0.0.1:5173/studio-lab` → 200 (curl). gstack browse (`a-round-41/b.sh`, `BROWSE_STATE_FILE=a-browse.json`): `[browse] Server failed to start within 15s` twice on attempt 1 (node.exe 31, `npm run verify` running concurrently), and again on the single retry with a fresh state file after verify ended (node.exe 43). Per task: recorded, no further retries. Gutter (expect 10), column widths (expect 288/490/176/128) and panel height (144) are **unmeasured by A**; reader prepared for C at `a-round-41/geo41.js`.

## 5. Code review (actual `code-reviewer` subagent, static; 9/10, no High/Medium)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | `red-run.txt` was run before `biome --write` reflowed the test file (trace lines 247/273/320 vs final 253/279/326) | Low | **Fixed:** re-ran red on the final test file (sha `b919643f…`) against the old panel (sha `dbcd5c2f…`) in a scratch copy outside `store/` → `a-round-41/red-run-final.txt`: RF1, RF2, RF5 red (l.253, 279, 326); RF3, RF4, RF6 green. Scratch: `a-round-41/scratch/` (copied `app/`, own `vitest.config.mts` with `cacheDir` in scratch, `node_modules` is a directory junction to `store/node_modules`, read-only use; nothing installed) |
| 2 | Below ≈1280 px width, the video reason in the `overflow-hidden contain-strict` waveform box could wrap past its height and be clipped top/bottom with no scroll (column placement was scrollable) | Low, record | **Not changed** (outside D-29z6's measured 1440/1280 range; `title` + `aria-describedby` still carry the text). For B: candidate follow-up **A-R41-REVIEW-NARROW** |
| 3 | `selection.isVideo ? clipGainReasonNode : null` redundant | Nit | Kept: makes the video-only intent explicit; no behaviour change |
| 4 | Test constants `RANGE_REASON_ID`/`CLIP_GAIN_REASON_ID` hold test ids | Nit | Kept, to keep the red-run file identical to the shipped file |
| 5 | Doc TODO polish line omitted EXPORT-DIALOG-FOCUS-RESTORE | Nit | **Fixed** in doc 038 TODO (final doc sha `cf894ea3…`) |
| 6 | Artifact timestamps don't line up (snapshot mtime 18:36 vs edits 14:1x) | Nit | Use sha256, not mtimes (machine clock/timezone of snapshot creation differs) |

## 6. Command tails (verbatim)

```
$ git rev-parse HEAD            → 63ce722dfd074bf865b236a5c5d27e2286688a54 (start and end)
$ git status --short (end)
 M app/components/arrangement/ArrangementDetailPanel.tsx
 M docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
?? app/lib/arrangement/__tests__/detail-panel-reason.test.tsx
 + 17 × ?? .codex/agents/*.toml (root)
$ sha256sum -c ../tmp/studio-real-loop/b-round-40-tree-sha256.txt | grep -v ': OK$'   → (empty; 384 OK)
$ protected: download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
$ npx vitest run …detail-panel-reason.test.tsx        → Tests 6 passed (6)
$ npx vitest run <13 frozen suites>                     → Test Files 13 passed (13) · Tests 334 passed (334)
   detail-panel 24 · track-layout 36 · floating-video 45 · fader-guards 71 · fader-click 26 · gesture-guard 19
   detail-panel-polish 16 · detail-panel-reason 6 · pending-status 22 · ArrangementContext 21 · clip-gain 28
   delete-selection-ui 13 · detail-panel-fit 7
$ npx tsc --noEmit                                      → tsc exit 0
$ npx vitest run (node.exe 45 before / 30 after)        → Test Files 73 passed (73) · Tests 1325 passed (1325)  [1319 + 6]
$ npx biome check ./app                                 → Found 2 errors. Found 218 warnings. Found 1 info.
   errors: app\lib\__tests__\bug-hunting\auth-bugs.test.ts format, app\lib\auth.ts format (root CRLF baseline)
$ npx biome check <2 owned TS/TSX files> (after --write) → Checked 2 files … No fixes applied (0 diagnostics)
$ npm run verify (node.exe 28 before / 39 after)        → … ✓ built in 11.72s (client) … ✓ built in 11.07s (SSR) · verify exit 0
$ tasklist | grep -ci node.exe                          → 34 (baseline) · 44 (end)
```

Note: `a-round-41/verify.txt` keeps only the last 40 lines (build output); the exit code 0 covers the agent-reference, lint, TypeScript, unit and build stages that `verify` runs.

## 7. Deviations, known gaps, self-check

- **No deviations from §2.1/§2.2/§2.3.** Placeholder changed from `div` to `<p>` inside the new layer as the contract requires.
- **Gap:** browser smoke not run (ENV-BROWSE-DAEMON). No geometry claim from A.
- **Gap:** mutations (a)–(h) not run by A (C's job; optional for A).
- **Self-check:** edge cases — group with `clip` set is impossible to misplace because `isGroupState` requires `!clip`; audio clip → `clipGainReasonNode` null so the waveform gets null; the `aria-describedby` targets exist in every state where they are referenced (one `<p>` per id, rendered exactly once). No XSS surface (static strings). Tokens only; the only arbitrary values are inside the existing imported `STUDIO_SCROLLBAR_CLASS`.
- Byte offsets of the SSR HTML (C-R23-01/C-R38-01 NUL record) may shift due to the new markup; not measured by A.
- **For B — A-R41-REVIEW-NARROW (Low, record):** below ≈1280 px viewport width the waveform box (`overflow-hidden contain-strict`) shrinks toward `min-w-32`; the centred video placeholder + reason stack can then exceed its height and be clipped top/bottom with no scroll. Not in D-29z6's measured range; text still reachable via `title`/`aria-describedby`.
- **Scratch:** `a-round-41/scratch/` (copied `app/` + config) is left in place as red-run evidence. Its temporary `node_modules` directory junction to `store/node_modules` was **removed** (`rmdir`, non-recursive, link only) after the run; `store/node_modules` verified intact (618 entries, `.bin/vitest` present) and `git status` unchanged.

## 7a. Carried (root) — `publication-checkpoint.json`, `root-pre-push-review.md`

- `round40Checkpoint.commit` = `63ce722dfd07…` = HEAD at start and end of this round; its `remaining` lists "C-R40-01 disabled reason clipping" — addressed by this round's code, **pending C**.
- All other root items stay as listed in task §4.9 (unchanged by this round): SSR warnings/NUL (C-R23-01/C-R38-01 — offsets may move with the new markup, C records), sync/C-R27-01, touch (R38-T), root review M1–M3 / L1–L4, L6–L8, CRLF Biome errors on auth files, `Content-Type` charset (unaffected), the 17 `.codex` files, `test:e2e:smoke` (root only), SRW-21.

## 8. Exact next C checks

1. G41-2 (HEAD, status, 384, protected) → R41-S (`diff -u` vs `b-round-40-snapshots/`).
2. R41-RV at 1440×900 and 1280×720 fresh loads, incl. RV-MIN (120 px) and RV-SWITCH; verify the 1280 group reasons and the 1280/120 px video reason are fully inside the scroller at `scrollTop` 0 (B's fit predictions 58 ≤ 69, 52 ≤ 67).
3. R41-SB: computed `scrollbar-gutter: stable`, `offsetWidth − clientWidth` = 10, columns 288/490/176/128 at 1440; SB-3 info column in 1280 group; SB-4 record only.
4. R41-NONE, R41-PM (incl. `0 dB` width 44.2 ±1, 1 line), R41-MN, R41-K.
5. R41-U mutations (a)–(h) in a scratch copy; G41-1, G41-3; Ableton two-verdict table.

## 9. Scope completed

§2.1, §2.2, §2.3 implemented; §2.4 self-check done except the browser smoke (daemon failure). Acceptance criteria are **not** marked passed by A; all R41 IDs await C. Round 41 is checkpoint-ready only after C PASS.
