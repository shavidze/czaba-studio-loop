# CURRENT TASK — Round 46: SRW-13 polish part 2 — the Export dialog captures its opener in the layout phase and skips `[hidden]` controls in its Tab wrap; two doc status lines

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-15
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint section).
- Decision record: **D-29z11** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-45.md`.
- Round size: **one Low a11y item (EXPORT-DIALOG-FOCUS-RESTORE, two linked parts in one file) plus two one-line doc status fixes.** It is kept apart from round 45 because it changes focus management. **SRW-14 stage 1 (FB-13) is round 47.**

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-15 15:11). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **25** at B's gates. Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never use `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure use the approved fallback: your own `browse/dist/server-node.mjs`, started with `BROWSE_PARENT_PID=0`, a fresh state file and a log in your round folder. **Start it from `tmp/studio-real-loop/`** (round 45: a fallback started inside `c-round-45/` refused eval paths outside its cwd). Record the command, PID and log. Never kill a process you did not start; stop your own with `/T`.
> - Screenshots in a short window: CDP `Page.captureScreenshot`. Delays: bash `sleep` or in-page `performance.now()` (`$B wait N` does not delay).
> - **Corrected expectations from C round 45 (use these, not the older text):**
>   - the detail-panel start/end inputs show `8` / `10` for a range 8–10 (`rangeInputText` trims zeros), not `8.000`;
>   - at **1280×720 the detail panel starts collapsed** (36 px) and opens at 142 after a toggle; at 1440×900 it starts open (144);
>   - `+`/`−` zoom steps do **not** push zoom history; zoom-back (`x`) restores only through a Fit or Zoom-to-range (`z`) entry.

## Why this round

**Round 45 result** (`c-round-45.md`, `c-round-45.json`): **C PASS on every contracted ID, bugs `[]`.**
- **G45-1:** tsc 0; vitest **79 files / 1357**; build; Biome only the 2 baseline CRLF errors, 218 warnings, 1 info.
- **G45-2, G45-3:** 386 OK, protected 4/4; anonymous `/studio-lab` direct and via the header link, 0 token/recording/download/R2 requests, 0 Authorization headers, token 401, fake Bearer → 500 with no token, `/studio/middle-east` → "Sign in required".
- **R45-S, R45-U** (mutations a–f + C's g/h, none survived), **R45-SSR** (dev-server Δ **0** ×3, `/` control proves the log is live), **R45-REG** (hydration, detail panel 1440/1280, Clip Gain, zoom-back, refusal status, library separator, playback), **R45-Doc** (all five notes and doc 042).

**Published by root:** `8b9c813` (`fix(studio): preserve client layout effects during server rendering`, exactly the 12 round-45 paths) and `1381b0b` (root's agent-config commit — the foreign `.claude/.codex/scripts` paths C saw). B `git ls-remote` 15:11: **both master remotes at `1381b0b`**. `publication-checkpoint.json` → `round45Checkpoint`.

**Closed by C evidence:** SSR-LAYOUT-EFFECT-WARN, LIB-SEP-REASON, DOC015-DELETE-GAP-NOTE, DOC034-UNREACHABLE-NOTE, DOC035-NOTES, DOC036-R37-TAIL, DOC036-ROUND-REF. **Closed by root evidence:** ROOT-ROUND44-CHECKPOINT (`ca85109` on both remotes).

**New from round 45** (backlog `open_findings`):
- **DOC036-STATUS-LINE** (Info) and **DOC042-STATUS-LINE** (Info): the status lines still say "waiting for C" although C PASSed. **Fixed in this round** (§0.3, doc-only).
- **BIOME-HOOKS-DEPS** (Low, `biome.json`, frozen for A): Biome's `useExhaustiveDependencies` does not check custom effect hooks. Queued with root; this round adds an 8th `useIsomorphicLayoutEffect` site, so the proposal now covers 8 sites + `usePositionWriterEffect`.
- B-EXPECT-RANGE-TEXT, B-EXPECT-DP-START-1280, the zoom-history note: task-text corrections (header above).

**The defect** (EXPORT-DIALOG-FOCUS-RESTORE, Low; `checkpoint-oct13-review.md` suggestion 6). `ArrangementExportDialog.tsx`, current code:
- **l.84–94:** the opener is read from `document.activeElement` inside a **passive** `useEffect`. Passive effects run after **every** layout effect of the commit. If any layout effect in the same commit moves focus (a sibling rendered after the dialog, a future toolbar, a third-party widget), the dialog remembers that element instead of the real opener, and on close focus goes to the wrong place.
- **B's probe** (React 18.3.1 + jsdom, `b-round-45/order-probe.cjs`): a component whose capture is passive, followed by a sibling whose `useLayoutEffect` focuses a decoy → the capture sees **`decoy`**; the same capture as a layout effect sees **`opener`**. So the defect is reproducible in jsdom, and moving the capture to the layout phase fixes it.
- **l.33–37:** `exportDialogFocusableElements` filters `:disabled` only. A focusable control inside a `[hidden]` subtree would become the first or last Tab-wrap target, and the wrap would send focus to an invisible control. **Nothing in the dialog is hidden today**, so this part is unit-only (same honesty class as DOC034-UNREACHABLE-NOTE); C states that.
- **SSR:** `StudioWorkspace` always renders `<ArrangementExportDialog isOpen={false} />`, so its hooks run on the server. A **bare** `useLayoutEffect` here would be an **8th** SSR warning. Round 45's SSR1 (`ssr-layout-effect.test.tsx`) is therefore a live guard for this round: the capture must use `useIsomorphicLayoutEffect`.

## Baseline

B verified on 2026-10-15 15:11 (`b-round-45/gates.txt`, `tsc.txt`, `vitest-focus.txt`):
- HEAD **`1381b0b`**; `git status --short` **empty**; both master remotes at `1381b0b`. **One starting point only.** If HEAD is a newer root commit, report it and continue only if `git diff 1381b0b --stat -- app docs` is empty.
- **Frozen list:** `../tmp/studio-real-loop/b-round-45-tree-sha256.txt` → **395 OK** (run from `store/`). It is the round-44 list of 386, **minus** `ArrangementExportDialog.tsx`, **plus** the round-45 files now committed (`ArrangementContext.tsx`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx`, docs 015/034/035, `useIsomorphicLayoutEffect.ts`, its test, `ssr-layout-effect.test.tsx`). Docs 036 and 042 are not in the list; they are checked against snapshots. `export-dialog-focus.test.tsx` **is** in the list (frozen).
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-45-snapshots/`, `SHA256SUMS.txt` inside):

  | File | sha |
  |---|---|
  | `ArrangementExportDialog.tsx` | `89bc8e06` |
  | `export-dialog-focus.test.tsx` (frozen; snapshot for C's diff = empty) | `e5da2ea6` |
  | doc 036 | `4e6f94cf` |
  | doc 042 | `adcd6e04` |

- Other checks: protected 4/4 OK; tsc **0**; `export-dialog-focus` **19/19**, `ssr-layout-effect` 4/4, `useIsomorphicLayoutEffect` 2/2; full vitest at `1381b0b` = **79 files / 1357** (root `checkpoint-r45-verify.log`; root's first push run had 2 load timeouts, isolated re-check 22/22 and full retry 1357 — `publication-checkpoint.json` `round45Checkpoint`); `/studio-lab` 200.
- Biome `./app`: **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` (**do not touch**); 218 warnings, 1 info. Your files add 0 errors and 0 warnings.
- `grep -rn "useIsomorphicLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx` → **7** today.
- **Before you edit:** confirm HEAD, the clean tree, 395 OK and the 4 snapshot shas. If anything differs, **stop and report**. Do not touch new untracked paths; record any you see.

**Rules:** do not revert, re-create or reformat anything. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 The opener is captured in the layout phase

In `ArrangementExportDialog.tsx`:
- l.84: `useEffect(() => {` of the **opener-capture effect only** (l.84–94) becomes `useIsomorphicLayoutEffect(() => {`. The callback body and the dependency array `[isOpen]` are **byte-identical** (including the `isConnected` and `:disabled` checks in the cleanup).
- Add one import line: `import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';` (path import, round-45 precedent; `app/hooks/index.ts` is not edited).
- `useEffect` stays in the `react` import (the other two effects use it).
- **Unchanged:** the focus-to-close effect (l.96–112) and the Tab-trap effect (l.114–145) stay **passive** `useEffect`s. Moving them is a non-goal: the capture must run **before** the dialog moves focus to `დახურვა`, and today's order (capture first, then focus-to-close) is preserved because a layout effect always runs before the passive ones.

**Why the cleanup moves too (state it in doc 043):** the restore now runs in the layout phase of the closing commit instead of the passive phase. The opener is outside the dialog and still connected, so `focus()` works there; the closing commit removes the dialog first, so nothing inside the dialog keeps focus. The existing 19 cases pin the visible result (restore, removed opener, disabled opener, ✕ of the expanded video, Esc).

**Why `useIsomorphicLayoutEffect` and not `useLayoutEffect`:** the dialog is server-rendered with `isOpen={false}`; a bare layout effect is an SSR warning (round 45 SSR1 would show exactly 1 frame, `ArrangementExportDialog`).

### 0.2 The Tab wrap skips controls inside `[hidden]`

- `exportDialogFocusableElements` (l.33–37) adds one condition to its filter: an element is skipped when `element.closest('[hidden]') !== null` (this covers the element's own `hidden` attribute and any hidden ancestor inside or outside the dialog).
- **Not** `offsetParent`, `getClientRects` or computed style (jsdom has no layout; the result would differ between test and browser). **Not** `aria-hidden` (it hides from assistive technology, not from Tab; out of this contract). `inert` and CSS `display:none` via classes are out of this contract; record them in doc 043 as known limits.
- The same function is used by the focus-to-close check (l.103) and by the Tab handler (l.123). Both get the filter; that is intended.
- No other change: the selector constant, the names, the `:disabled` filter and the order stay.

### 0.3 Doc status lines (doc-only, one line each)

| ID | Doc | Change |
|---|---|---|
| DOC036-STATUS-LINE | `036-studio-lab-track-pan.md` **l.4** | Replace the final clause `C-ის შემოწმებას ელოდება` of the round-37 parenthesis with target text T1 below. No other text, including l.513 (historical note). |
| DOC042-STATUS-LINE | `042-studio-lab-ssr-layout-effect.md` **l.4** | Replace the value after `**სტატუსი:**` with target text T2 below. No other line. |

Target texts (exact; the backticks inside are literal Markdown code marks in the doc):
- T1 (doc 036 l.4, the whole line after the edit):

      **სტატუსი:** Completed (A; rounds 31–34 და 36 C-მ შეამოწმა; round 37-ის ბაგფიქსი — D-29z2, C-R36-01 — C round 37 PASS, `c-round-37.md`)

- T2 (doc 042 l.4, the whole line after the edit):

      **სტატუსი:** Completed — Round 45 C PASS (`c-round-45.md`), commit `8b9c813`; D-29z10

### 0.4 Unchanged / out of this round

**Unchanged:** every other line of `ArrangementExportDialog.tsx` (texts, classes, `data-testid`s, the selector, the export button, the notes); `Modal.tsx` (`components/ui/**` is forbidden; the `Modal.tsx` focus gap stays a root item); `StudioWorkspace.tsx`; `ArrangementContext.tsx`; `useIsomorphicLayoutEffect.ts`; every existing test file, **including `export-dialog-focus.test.tsx` (19 cases)**; `app/hooks/index.ts`; docs 001–042 apart from the two status lines.

**Out of this round** (queued, not deferred scope):
- **round 47 — SRW-14 stage 1 (FB-13):** the grid model, Snap on/off with a visible state and a shortcut, divisions, applied to clip move first. B writes the Ableton source table (Live 12 manual, grid/snap section, via gstack `/browse`) with that task.
- **then:** SRW-14 later stages (trim, range, playhead, paste, clip-edge snap) → SRW-15 (FB-09/FB-11; a grid only, never audio stretch) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20 → R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY (with the first `model.ts` round) → the SRW-21 adapter → the full regression and root review → T12.
- **root, parallel, non-gating:** the bounded `frontend-architect` checkpoint on the SRW-13 subsystem that B requests in `b-round-45.md` §6; BIOME-HOOKS-DEPS.
- **waiting for the Tech Lead:** C-R41-01 (TL-Q-VIEWPORT), C-R23-01/C-R38-01, C-R27-01, C-R6-02, C-R8-01 and the manual checks.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):** focus after closing Export by ✕, `დახურვა` and Esc; focus at open (`დახურვა`); Tab/Shift+Tab wrap with and without clips; focus during and after a WAV render; the ✕ of an expanded video after Esc; Space/Enter inside the dialog not reaching the transport; SSR warnings; hydration.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/new-test.md`, `prompts/studio-feature.md`; `docs/implementation/TEMPLATE.md`; then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:** HEAD, `git status --short`, `sha256sum -c ../tmp/studio-real-loop/b-round-45-tree-sha256.txt | grep -vc ': OK$'` → 0, `(cd ../tmp/studio-real-loop/b-round-45-snapshots && sha256sum -c SHA256SUMS.txt)` against the working files (or compare each sha), protected 4/4, `node.exe`.
3. **Read:** `ArrangementExportDialog.tsx` (all 307 lines); `export-dialog-focus.test.tsx` l.1–260 (stubs, `mountWorkspace`, helpers) and the cases at l.329, l.337, l.408, l.494; `app/components/ui/Modal.tsx` l.40–135 (read only: `role="dialog"` is the outer backdrop element; the ref, and so the dialog's `content`, is the **inner** panel that also holds the ✕ `aria-label="Close"` button); `app/hooks/useIsomorphicLayoutEffect.ts`; `ssr-layout-effect.test.tsx`; `b-round-45/order-probe.cjs`.
4. **Re-check (report each):** `grep -n "useEffect(\|useLayoutEffect(\|useIsomorphicLayoutEffect(" app/components/arrangement/ArrangementExportDialog.tsx` → 3 `useEffect(` today; `npx biome check app/components/arrangement/ArrangementExportDialog.tsx` before the edit (record diagnostics).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

The diff is limited to §0.1 and §0.2: one import line, one hook identifier, one filter condition. No comments, no new exports, no `any`, no type assertions, no `@ts-ignore`; semicolons; no reformatting of unrelated lines.

### 2.2 Docs

**Doc 043 (new):** `docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`:
- **Header:** date; status `Round 46 — D-29z11; C-ის შემოწმებას ელოდება`; the project.
- **კონტექსტი:** the passive-capture defect, B's probe result, the hidden-filter gap, and that nothing in the dialog is hidden today (unit-only).
- **მიდგომა:** why the capture (and so its cleanup) moves to the layout phase; why the other two effects stay passive; why `useIsomorphicLayoutEffect`; why `closest('[hidden]')` and not layout-based checks; known limits (`inert`, CSS `display:none`, `aria-hidden`).
- **შეცვლილი ფაილები** (no code fragments); **პრობლემები და გადაწყვეტები**; **ტესტირება** (red/green, the C IDs); **the §4.7 table**; **TODO:** round 47 (SRW-14 stage 1).
- The two §0.3 status lines in docs 036 and 042.

### 2.3 Tests (in `store/`)

**New file `app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx`** (jsdom, the default; **no pragma, no comment**). A new file keeps the 19-case suite byte-frozen (round-45 precedent).

**Setup:** copy (do not import) from `export-dialog-focus.test.tsx` what the provider needs (the `@remix-run/react` mock, the audio/ResizeObserver stubs, a small arrangement with one audio clip and a matching collection). Render `ArrangementExportDialog` under `ArrangementProvider` inside a small harness component. **Tree order matters:** inside one parent, render, in this order:
1. an `opener` button and a `decoy` button (both outside the dialog, enabled, connected);
2. `<ArrangementExportDialog isOpen={open} onClose={…} />`;
3. **after it**, a `FocusThief` component with props `active: boolean` and `open: boolean`; its `useLayoutEffect` (deps `[active, open]`) focuses `decoy` when `active && open`. FR1, FR2 and FR4 render it with `active={true}`; FR3 and HD1–HD3 with `active={false}`.

If the thief is rendered **before** the dialog, the red run is not red for the right reason (layout effects run in tree order). Open with `opener.focus()` then a state change (e.g. `fireEvent.click(opener)` with an `onClick` that sets `open`).

| ID | Case | Expected | On the snapshot |
|---|---|---|---|
| FR1 | thief active → open → after open, `დახურვა` has focus → close by `fireEvent.click` on `დახურვა` | `document.activeElement === opener` | **red**: focus is on `decoy` |
| FR2 | thief active → open → close by Esc (`keydown` Escape on the dialog content; the Modal's handler) | `document.activeElement === opener` | **red**: `decoy` |
| FR3 | thief **inactive** → open → close by `დახურვა` | `opener` (control: the harness itself restores correctly) | green |
| FR4 | thief active → open | right after open, focus is on `დახურვა` inside the dialog (the passive focus-to-close effect still runs after the thief) | green (must-not) |
| HD1 | thief inactive; open (clips present); **append** `<div hidden><button>hidden-last</button></div>` as the **last** child of the dialog content (the parent element of the ✕ `aria-label="Close"` button); focus `WAV-ის ექსპორტი`; dispatch a cancelable `Tab` keydown on it | the event is `defaultPrevented` and focus moves to ✕ (the first control) | **red**: not prevented (the hidden button is "last") |
| HD2 | as HD1, but the hidden wrapper is **inserted as the first child** of the content; focus ✕; dispatch `Shift+Tab` | `defaultPrevented`; focus moves to `WAV-ის ექსპორტი` | **red** |
| HD3 | as HD1, but the hidden attribute is on the button itself (`<button hidden>`) | the same as HD1 | **red** |

**Red/green runs:** write the tests first. Run them against the **snapshot** source (the untouched working copy before your first edit, or a scratch copy outside `store/`): FR1, FR2, HD1–HD3 red; FR3, FR4 green → `a-round-46/red-run.txt` with each failure text (FR1/FR2 must name `decoy`, not "nothing focused"). Then the green run → `a-round-46/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; `node_modules` junction removed with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1` in scripts) → `a-round-46/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | capture back to `useEffect` | FR1, FR2 |
| (b) | the `[hidden]` condition removed | HD1, HD2, HD3 |
| (c) | capture as a bare `useLayoutEffect` (imported from `react`) | `ssr-layout-effect` SSR1 with exactly 1 frame, `ArrangementExportDialog` |
| (d) | `closest('[hidden]')` replaced by `hasAttribute('hidden')` (self only) | HD1, HD2 (ancestor cases) |
| (e) | the focus-to-close effect also changed to a layout effect (a forbidden widening) | FR4 or an existing 19-case test — **record which**; if it survives, report it honestly (it is a scope guard, not a code requirement) |

If (a)–(d) survive, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source or rendered output (`დახურვა`, `WAV-ის ექსპორტი`, `Close`); no snapshot tests; no fake timers.

### 2.4 After the code

- **Self-check:** the frozen suites of §4.6 and the full `npx vitest run` (1357 + your new `it` count).
- **Biome:** `npx biome check --write` **only** on your files; then a read-only `npx biome check ./app` → exactly the 2 baseline errors, ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent on the diff; report findings and dispositions. **Architecture notes** go to B (`a-round-46.md` §5), not into the code.
- **Browser smoke** (A; one run; fresh state under `a-round-46/`; not a PASS claim): `/studio-lab` 1440×900 → REAL click on the toolbar `Export` button → REAL Esc → the focused element is the `Export` button.
- **Dev-server warning count:** `grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log` → one `curl -s -o /dev/null http://127.0.0.1:5173/studio-lab` → `sleep 3` → count again; Δ expected **0**. If the log does not grow on a `/` request either, write "not measurable".
- **`/check`:** `npm run verify`. Do not run `npm run test:e2e:smoke`.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch

HEAD `1381b0b`, clean tree.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | A | §0.1 (one import line, the l.84 identifier) and §0.2 (one filter condition) only |
| `app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | l.4 only (§0.3) |
| `docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md` | A | l.4 only (§0.3) |
| `docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-46.md`, `a-round-46/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-46.md`, `c-round-46.json`, `c-round-46/` | C | report, runs, shots, gates |
| fresh browse state files and daemon logs in the own round folder | A / C | browse state |

`a-round-45/`, `c-round-45/`, `b-round-45/` and the snapshots are read-only.

**Expected `git status --short` at the end:**
```
 M app/components/arrangement/ArrangementExportDialog.tsx
 M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
 M docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md
?? app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx
?? docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md
```
If root changes something meanwhile, record it as foreign and do not touch it.

### 3.3 Frozen this round

- All **395** files in `b-round-45-tree-sha256.txt` and everything else under `store/`, including `export-dialog-focus.test.tsx`, `ssr-layout-effect.test.tsx`, `useIsomorphicLayoutEffect.ts`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `model.ts`, `app/hooks/index.ts`, `vitest.config.ts`, `biome.json`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`: `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`; and `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**` (incl. `Modal.tsx`), `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`, firebase/R2/auth/purchase code, `routes/api.*`, `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`, the other roles' files under `../tmp/studio-real-loop/`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900 (and 1280×720 where named); fresh load. **Layout L46** = L45: the demo video at 0; `სრული მიქსი` on music at 7–23; `Soft impact` on SFX at 4–6; Master 0 dB.

**Harness rules:** **REAL** = `$B click` at the element centre, `$B press`, `$B type`. **SYNTHETIC** (label it) = dispatched events, `.focus()`, `.blur()`. Reads through `window.__c` and the DOM (label it); no source instrumentation. Mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order if the session may end:** G46-2 → R46-S → R46-U → R46-FOCUS → R46-SSR → R46-REG → the rest. Write `c-round-46/checkpoint.md` as you go.

### 4.1 R46-S — static (read-only)

- `diff -u b-round-45-snapshots/ArrangementExportDialog.tsx app/components/arrangement/ArrangementExportDialog.tsx`: exactly **one added import line**, **one identifier** change at the capture effect (`useEffect(` → `useIsomorphicLayoutEffect(`, body and `[isOpen]` byte-identical), and **one added filter condition** using `closest('[hidden]')`. The other two effects are still `useEffect(`.
- `grep -rn "useIsomorphicLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx` → **8**; bare `useLayoutEffect(` in the same paths → **0**.
- `export-dialog-focus.test.tsx` diff against its snapshot → **empty**. 395 OK. Protected 4/4.
- Banned content: no `any`, `@ts-ignore`, type assertion, `//` comment, hardcoded colour or new export in the diff or the new test.

### 4.2 R46-U — unit tests and mutations

- The new tests are green; A's red run matches §2.3 (FR1/FR2 name `decoy`; HD1–HD3 red; FR3/FR4 green); otherwise A explains each difference.
- The frozen suites of §4.6 are green, **including all 19 `export-dialog-focus` cases and `ssr-layout-effect` SSR1 = 0**.

**C's mutations** (scratch copy outside `store/`; each must make a test fail):

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | the snapshot `ArrangementExportDialog.tsx` | FR1, FR2, HD1–HD3 |
| (b) | capture back to `useEffect` only | FR1, FR2 |
| (c) | `[hidden]` condition removed only | HD1–HD3 |
| (d) | capture as a bare `useLayoutEffect` | SSR1 (exactly 1, frame `ArrangementExportDialog`) |
| (e) | `hasAttribute('hidden')` instead of `closest` | HD1, HD2 |
| (f) C extra | the thief moved **before** the dialog in the harness (test-side) | FR1/FR2 green on the snapshot too — proves the tree order of §2.3 is what makes the red meaningful (record; not a FAIL) |

### 4.3 R46-FOCUS — the dialog in the real browser (REAL where possible)

Read the focused element as `document.activeElement` (text, `aria-label`, `data-testid`; label the read).

| ID | Steps | Expected |
|---|---|---|
| F-ESC | REAL click on the toolbar `Export` → read focus → REAL Esc | at open: `დახურვა`; after Esc: the dialog is gone and focus is on the toolbar `Export` button |
| F-CLOSE | REAL Tab until the `Export` button is focused (or REAL click), REAL Enter → REAL click `დახურვა` | the dialog is gone; focus is on `Export` |
| F-X | open → REAL click ✕ (`Close`) | focus is on `Export` |
| F-WRAP | open with clips → REAL Tab from `WAV-ის ექსპორტი` → REAL Shift+Tab from ✕ | Tab → ✕; Shift+Tab → `WAV-ის ექსპორტი`; focus never leaves the dialog in 6 REAL Tabs (record the cycle: ✕ → WAV radio → `დახურვა` → `WAV-ის ექსპორტი`) |
| F-RENDER | open → REAL click `WAV-ის ექსპორტი` → read focus during the render (buttons disabled) and after `done` → REAL click `დახურვა` | focus stays inside the dialog during the render; after it, `დახურვა` is enabled; on close focus is on `Export`. A WAV file is downloaded: record its size and that its header reads `RIFF`/`WAVE` (a smoke, not the export-integrity suite) |
| F-VIDEO | if the floating/expanded video can be opened REAL: expand the video → open Export → REAL Esc | Export closes, the video stays expanded, focus is on the video's ✕ (test l.408 in the browser). If it cannot be reached REAL, record "unit-only" with the reason |
| F-SPACE | transport stopped → open → REAL Tab until the enabled WAV format radio has focus → REAL Space | the transport does not start (playhead unchanged, no new source start); the dialog stays open (the unit case `keeps Space on a dialog button away from the transport` in the browser) |
| F-1280 | F-ESC at 1280×720 | the same |

### 4.4 R46-SSR — dev-server SSR (read-only)

As round 45 §4.3: count `useLayoutEffect does nothing on the server` in `../tmp/studio-real-loop/r42-vite.err.log` → `curl` `/studio-lab` (200) → `sleep 3` → count; **3×**, Δ **0** each; one `/` control proves the log is live. If the log does not grow at all, record "not measurable" (SSR1 stands alone). Also record the `/studio-lab` HTML size, NUL count and offsets (C-R23-01 record; round 45: 64 312 bytes, 3 NUL at 11729/28025/28026).

### 4.5 R46-REG and R46-Doc

| ID | Steps | Expected |
|---|---|---|
| REG-HYD | fresh load 1440×900; console 3 s after `goto` | no hydration-mismatch, React or `useLayoutEffect` warning (the root `GET /api/cart` refusal is allowed) |
| REG-PLAY | REAL Space → ~3 s → REAL Space, before and after one Export open/close | the playhead and Master meter move and stop; Export open/close does not change playback state |
| REG-KEYS | after closing Export with Esc: REAL Ctrl+Z / Ctrl+Shift+Z on the timeline (focus on a clip by REAL click) | Undo/Redo still work (focus restore did not leave focus in a place that swallows the shortcuts) |

**R46-Doc:** doc 043 exists, follows `TEMPLATE.md`, Georgian, matches the code, has the §4.7 table and the known limits; docs 036 and 042 differ from their snapshots on **l.4 only**, with the exact §0.3 text.

### 4.6 Gates and frozen suites

**G46-1:** tsc 0; vitest = **1357 + the new `it` count**, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs); build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, 1 info.

**G46-2:** protected 4/4 OK; 395 OK; `git status --short` = §3.2; HEAD at the start and at the end.

**G46-3:** anonymous `/studio-lab`, directly and via the header link, in a **fresh** browse state: no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, no `Authorization` header from workspace code; media is only the 2 demo MP3s and `blob:`; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, a fake Bearer gets no token; `/studio/middle-east` shows "Sign in required". **Known and allowed:** the root `GET /api/cart`; GA consent-denied events; GTM; dev-module requests; the homepage hero image from `images.unsplash.com`; Google Fonts.

**Frozen suites** (A self-check, C G46-1): the new file; `export-dialog-focus`; `ssr-layout-effect`; `useIsomorphicLayoutEffect`; `context-hygiene`; `render-budget`; `ArrangementContext.test.ts`; `pending-status`; `gesture-guard`; every suite whose name contains `export` (`ls app/lib/arrangement/__tests__ | grep -i export`); `floating-video`.

**Not re-run this round** (not PASS): export WAV integrity beyond the F-RENDER smoke; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression.

### 4.7 Ableton source and compliance (workflow addendum 2026-10-11)

No Live behaviour is involved; no new browsing and no video.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Closing the Export dialog returns keyboard focus to the control that opened it, even if something else moved focus during the opening commit | none | **Not applicable** (web dialog accessibility in CZABA's React UI; the contract is CZABA's own C-R13-03 / D-29e from round 14; never presented as Live behaviour) | D-29z11 §0.1 | R46-U, R46-FOCUS |
| The Tab wrap skips controls inside `[hidden]` | none | **Not applicable** (web a11y hygiene) | D-29z11 §0.2; unit-only today | R46-U |
| Doc status lines match C results | none | **Not applicable** | D-29z11 §0.3 | R46-Doc |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:** C-R41-01 (Low, 1024×768, TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (Tech Lead; record NUL count/offsets and the hydrated U+FFFD `aria-label`s — round 45: 1, the library collapse button).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, SSR4 (round-45 positive control). **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS (root/config); DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE (record).
- **Root items** (`root-pre-push-review.md` 2026-10-07: M1–M3, L1–L4, L6–L8 closed, L5 accepted, nothing open; `publication-checkpoint.json` `round45Checkpoint` = `8b9c813`/`1381b0b`): the bounded architecture checkpoint request (`b-round-45.md` §6, non-gating); BIOME-HOOKS-DEPS; GSTACK-ACL; `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset; the homepage SSR `fetch failed` while the backend is down (info); dev-server availability; ENV-BROWSE-DAEMON (reproduced round 45; fallback works); machine load.
- **Tech Lead manual checks:** R23-1 (incl. the detail scroller), R23-2; R38-T (with A-R38-REVIEW-TOUCH, A-R33-REVIEW-TOUCH); R35-T, R30-T, R31-T, R33-T, R34-T; TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-45-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementExportDialog.tsx docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md
grep -rn "useIsomorphicLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx | wc -l
npx vitest run app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx app/lib/arrangement/__tests__/export-dialog-focus.test.tsx app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-45-snapshots/ArrangementExportDialog.tsx app/components/arrangement/ArrangementExportDialog.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the one named in §2.3.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G46-1/2, R46-S, R46-U, R46-Doc). gstack `/browse` with a fresh state file under `c-round-46/` (fallback per the header).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-46.md`:** (1) the pre-flight gate and the §1.4 re-checks; (2) the red run per case, the mutations (a)–(e), the green run; (3) the diff summary; (4) the smoke result and the dev-server Δ; (5) the code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on); (6) verbatim command tails incl. `node.exe`; (7) deviations and the §2.4 self-check. Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-46.md` and `c-round-46.json`** (the usual schema). For each ID: PASS, FAIL (with a bug ID) or **not run** (with the reason). Include the R46-S diff verdicts, the R46-U mutation table, R46-FOCUS with labelled REAL/SYNTHETIC steps and the reads, R46-SSR counts, R46-REG, R46-Doc, the Ableton two-verdict table (§4.7), the gates, the C-R23-01/C-R38-01 record and the carried items. `passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 47 — SRW-14 stage 1 (FB-13):** a grid model (seconds-based divisions without tempo; bars/beats come with SRW-15), Snap on/off with a visible toolbar state and a keyboard shortcut, divisions, free mode, applied to **clip move first** (drag and keyboard nudge), Undo atomicity unchanged. Later SRW-14 stages: trim, range, playhead/insert marker, paste, clip-edge snap. B writes the Ableton source table (Live 12 manual, "Using the Grid" / snapping sections, via gstack `/browse`) with that task, and states CZABA's deliberate differences (e.g. no adaptive zoom grid if not chosen).
- **Architecture checkpoint (root, parallel):** see `b-round-45.md` §6. Its outcome is a backlog signal; any approved extraction becomes a separate single-owner B task with behaviour-preserving tests and does not gate round 47.
- **TL-Q-VIEWPORT / C-R41-01:** scheduled next if the Tech Lead puts widths below 1280 in scope. **C-R23-01 / C-R38-01** and **C-R27-01**: when the Tech Lead answers.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 46 -StartPhase A` and a higher limit.
