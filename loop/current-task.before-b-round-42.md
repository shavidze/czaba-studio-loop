# CURRENT TASK — Round 42: SRW-13 stage 4b-2 group 2 — the Lane Pan recovers after a lost release (keyboard unlock) and ends its drag bookkeeping on window blur

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-14
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13; behavioural reverse-engineering 2026-10-14).
- Decision record: **D-29z7** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-41.md`.
- Round size: **two closely related Low bug pairs** in **one source file** (`ArrangementLane.tsx`, the Pan slider's own bookkeeping), one new test file and one new implementation doc. No new feature.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B time (2026-10-14 17:33). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load and browse daemon:** `node.exe` was **32** at B's gates. In round 41 Windows Defender (`MsMpEng`, ≈ 172 % CPU) made C's first vitest run time out, and the gstack browse daemon was slow to start (ENV-BROWSE-DAEMON). Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs. If the daemon fails, record it, do the offline IDs, retry once with a fresh state file, and never weaken a criterion.

## Why this round

**Round 41 result** (`c-round-41.md`, `c-round-41.json`): **C PASS on every contracted ID** — G41-1..3 (idle re-run: `npm run verify` exit 0, 73 files, 1325/1325), R41-S, R41-U (old source: RF1/RF2/RF5 red; mutations a–h each caught), R41-Doc, R41-RV (6/6, at 1440, 1280 and the 120 px minimum), R41-SB, R41-NONE, R41-PM, R41-MN-1..4, R41-K. **Closed: C-R40-01, DOC038-STALE-LINES.** Root committed and published round 41 as **`ea35611`** (`publication-checkpoint.json` → `round41Checkpoint`).

**New C bug C-R41-01 (Low) is not this round** (D-29z7):
- It is measured at **1024×768**, outside the two viewports the user named (1280×720 and 1440×900, `publication-checkpoint.json` → `scrollbarUserRequest`) and outside the plan's "two mandatory viewports". C itself did not record it as a round-41 FAIL.
- It is honestly a round-41 effect at that width: the video reason now sits in the `overflow-hidden` waveform box and is clipped 4.5 px top and bottom with no scroll; the group Clip Gain reason is 28 px below the visible area but scrollable. The text stays reachable through `title` and `aria-describedby`.
- B does not widen the viewport matrix on its own. It is a **Tech Lead question** (`feature-status.md`): if widths below 1280 are in scope, C-R41-01 is scheduled **before group 3** with the pre-specified candidate in `b-round-41.md` §4 (a hypothesis, not verified).
- The workflow lets a non-blocking, non-security, non-data-loss Low wait while the next independent item starts.

**So this round is the planned 4b-2 group 2** (Pan, Lane only). The pairs share one cause: the Lane's Pan bookkeeping only ends on a `pointerup`/`pointercancel` of the drag pointer, so a lost release leaves it stuck.

| ID | Severity | Today (source read, `ArrangementLane.tsx` HEAD `ea35611`) |
|---|---|---|
| **A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK** | Low | `handlePanBlur` (l.368–377) sets the blur suppression for the drag pointer (`suppressPanPointerAfterBlur`, l.262–279). It ends only on a `window` `pointerup`/`pointercancel` **of that pointer** or on a new Pan press (l.286). While it is set, `handlePanChange` (l.345–348) drops **every** change, including arrow keys. Real path: Pan drag → Alt+Tab (Chrome blurs the slider) → the button is released outside the window, so that pointer's `pointerup` never arrives → back in the window the Pan keyboard is dead until the user clicks the slider again |
| **A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES** | Low / info | `beginPanPointerDrag` (l.281–306) ends the Lane's bookkeeping (`panDragCleanupRef`, `panDragPointerRef`, `panDraft`) only on `pointerup`/`pointercancel` of that pointer. `claimPointerGesture` (ArrangementContext l.1340–1388) aborts the Pan gesture on `window` `blur` and restores the stored pan, but the Lane keeps its draft and its cleanup ref. Effects: (1) the slider keeps showing the stale draft value; (2) `handlePanChange` l.350 gates the draft on the **global** `isPointerGestureActive()`, so during any other gesture a Pan keyboard change becomes a visual-only draft that is never written |

## Baseline

B verified on 2026-10-14 17:33 (`b-round-41/gates.txt`):
- HEAD **`ea35611`** (`fix(studio): show detail reasons and style panel scrolling`), root's round-41 checkpoint, published to both master remotes. `git status --short` is **empty** (root's 17 `.codex/agents/*.toml` are tracked since `54922e6`).
- Round-41 files at HEAD equal C's shas: `ArrangementDetailPanel.tsx` `61834b2a`, doc 038 `cf894ea3`, `detail-panel-reason.test.tsx` `b919643f`.
- **Frozen list:** `../tmp/studio-real-loop/b-round-41-tree-sha256.txt` → **386 OK** (= the round-40 list of 384 − `ArrangementLane.tsx` + the 3 round-41 files). Run from `store/`.
- Protected files 4/4 OK. tsc 0. vitest: see `b-round-41/gates.txt` (C round 41: **73 files, 1325/1325**). Dev server `/studio-lab` 200.
- Biome `./app` (C round 41): **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. **Do not touch them.** Also 218 warnings and 1 info. Your files must add 0 errors and 0 warnings.
- **Dispatch snapshot** (`../tmp/studio-real-loop/b-round-41-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementLane.tsx` **`7de5a093`** = HEAD.
- **Before you edit:** confirm HEAD is `ea35611` (or a newer root commit that leaves `ArrangementLane.tsx` at `7de5a093` and the 386 list OK), and the Lane equals its snapshot. If anything differs, **stop and report**.
- Do not touch new untracked paths; record any you see. `.kilo/` shows only as ignored.

**Rules:**
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `AGENTS.md` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 The contract (D-29z7), `ArrangementLane.tsx` only

**A. Keyboard unlocks the Pan blur suppression (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK).**
- The Pan `<input type="range">` (`data-testid="arrangement-track-pan"`) gets an `onKeyDown` handler that clears an active blur suppression (`panBlurSuppressionCleanupRef.current?.()`), and does nothing else.
- It calls **no** `preventDefault` and **no** `stopPropagation`, so Delete/Backspace/Space keep reaching the window listeners (frozen `fader-guards` "the Pan slider no longer stops Delete", `track-pan` l.827–838).
- A keydown happens before the browser's `input`/`change` for that key, so the same arrow press is applied: exactly **one** `Pan — <track>` entry per value-changing key, through the existing `setTrackPan` path.
- A keydown on **another** element does not clear the Pan suppression.
- A `change` **without** a keydown during the suppression stays ignored (frozen `fader-guards` l.363–430, C-R31-01).
- After the keydown has cleared it, a late `pointerup`/`pointercancel` of the old pointer writes nothing.

**B. The Lane's Pan bookkeeping also ends on `window` `blur` (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES).**
- `beginPanPointerDrag` adds `window.addEventListener('blur', cleanup)` next to its `pointerup`/`pointercancel` listeners. `cleanup` removes all three.
- `cleanup` keeps its current body: it nulls `panDragCleanupRef` and `panDragPointerRef` only if they still belong to it, and sets `panDraft` to `null`.
- Result after a `window` `blur` during a Pan drag, with no element blur:
  - the slider and the reset button show the **stored** pan (the context has already restored it);
  - no entry, `isPointerGestureActive()` false;
  - a later keyboard Pan change goes through `setTrackPan`: one entry when no other gesture is active, and the existing gesture-blocked refusal (status `GESTURE_EDIT_BLOCKED_MESSAGE`, slider stays at the stored value) when another gesture is active. **No visual-only draft.**
- The window blur does **not** set or clear the blur suppression. The `handlePanBlur` path stays as it is.

**Unchanged:**
- `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and `suppressPanPointerAfterBlur` bodies (except that `cleanup` is now also reachable from `window` `blur`);
- `useRelativeFaderDrag`, `ArrangementContext.tsx` (`claimPointerGesture`, `beginTrackPanGesture`, `commitTrackPan`, `cancelTrackPan`, `previewTrackPan`, `setTrackPan`);
- the Volume and Master faders; the Pan reset button; `onDoubleClick`; the slider's attributes, classes and Tab order;
- the round-36 root capture and the round-38 no-jump press.

**Considered and rejected (D-29z7):**
- (a) Clearing the suppression on `focus`: the press itself focuses the slider (`useRelativeFaderDrag` `fader.focus()`), so focus is not proof of keyboard intent.
- (b) Clearing the suppression on `window` `blur`: Chrome blurs the slider on Alt+Tab while the button may still be held, so the C-R31-01 guarantee for a still-held pointer would be lost. The keydown covers the user-visible lock.
- (c) Gating the draft on a context "is this my Pan gesture" API: it needs a new `ArrangementContext` export (frozen file, more surface). Ending the Lane bookkeeping with the context's own abort trigger removes the stale state with a Lane-only change.
- (d) Filtering keydown by key: non-value keys produce no `change`, so clearing on any keydown is the smallest honest rule.

**Known, accepted edge (record in the doc):** if the user presses a key **while still physically holding** the same pointer after a blur, the suppression ends and a later native thumb `change` from that held pointer would be written through `setTrackPan`. A mouse press is `preventDefault`ed (round 38), so native thumb drags no longer occur for the mouse. Not reproducible headless; not a new ID.

**Out of this round** (queued, not deferred scope):
- C-R41-01 (Tech Lead viewport question; candidate in `b-round-41.md` §4);
- round 43: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH;
- round 44: MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER;
- then 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY;
- polish: SSR-LAYOUT-EFFECT-WARN, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE;
- DETAIL-RESET-SHRINK (info; no measured defect);
- then SRW-14..20 (FB-13, FB-09/11, FB-10, FB-12, FB-06, FB-07), the SRW-21 adapter, the full regression, T12.

**Out of scope for the whole project:** plugins and effects (including compressor, limiter and normalise), pitch, multiple video layers, and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- the frozen suites `fader-guards`, `track-pan`, `fader-click`, `gesture-guard`, `track-layout`, `delete-selection-ui`, `ArrangementContext.test.ts`;
- Pan keyboard steps and reset; Delete/Backspace/Space with focus on Pan;
- the Pan drag (pointer events) and its single entry; the gesture-blocked status during other gestures;
- Volume and Master faders (they share `useRelativeFaderDrag`, which is unchanged).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md` and `prompts/studio-feature.md`; `docs/implementation/TEMPLATE.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-41-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `ArrangementLane.tsx` against the snapshot sha;
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementLane.tsx` l.134–160, l.256–377, l.619–655;
   - `app/hooks/useRelativeFaderDrag.ts` (whole);
   - `ArrangementContext.tsx` l.1340–1391 (`claimPointerGesture`) and l.2180–2296 (Pan);
   - `fader-guards.test.tsx` l.196–262 (harness), l.318–340, l.363–460 (C-R31-01 group);
   - `track-pan.test.tsx` l.785–842;
   - `a-round-31.md` §4 finding 2, `a-round-32.md` §4 finding 1, `checkpoint-r37-review.md` suggestions 1–2;
   - doc `036-studio-lab-track-pan.md` (context only; it is frozen).
4. **Re-check (report each):**
   - Grep every test under `app/lib/arrangement/__tests__/` for `arrangement-track-pan`, `Pan — `, `'blur'`, `keyDown(` on a Pan slider, and `window.dispatchEvent(new Event('blur'))`.
   - **Stop and report** (do not amend the test) if any frozen test expects: a Pan `change` to be ignored **after a keydown on the Pan slider**; the stale draft to stay visible after a `window` `blur`; or a Pan keydown to be prevented or stopped.
   - Run `npx biome check app/components/arrangement/ArrangementLane.tsx` before and after: no new diagnostic.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementLane.tsx`

The diff is limited to:
- the `window` `blur` listener added and removed inside `beginPanPointerDrag` (§0.1 B);
- one Pan keydown handler that only clears the suppression, wired as `onKeyDown` on the Pan slider (§0.1 A). Choose a discoverable name (e.g. `handlePanKeyDown`).

**Rules:**
- No comments, no new exports, no `any`, no type assertions, no `@ts-ignore`.
- Tokens only; no class change. Semicolons.
- Nothing else in the file changes.

### 2.2 Doc 039 (new)

`docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md` (Georgian, technical terms in English):
- თარიღი, სტატუსი (`Round 42 — D-29z7; C-ის შემოწმებას ელოდება`), შეცვლილი პროექტი;
- კონტექსტი: the two pairs with today's code paths (the table above);
- მიდგომა: the contract A/B, rejected a–d, the accepted edge;
- არქიტექტურა: one small Mermaid sequence (drag → blur / window blur → keydown) if useful;
- შეცვლილი ფაილები (no code fragments);
- პრობლემები და გადაწყვეტები (Problem → Solution);
- ტესტირება: red/green per case, the C IDs;
- the Ableton table (§4.8);
- TODO: C-R41-01 (Tech Lead question), groups 3/4 → rounds 43/44, 4c, polish.

Doc 036 is frozen; do not edit it.

### 2.3 Tests (red-first, in `store/`)

**New file:** `app/lib/arrangement/__tests__/pan-release-recovery.test.tsx`.
- Mount the way `fader-guards.test.tsx` does (`mountFaderWorkspace`, the fake audio graph, `press`, `windowPointer`, `undoChainLabels`, `trackOf`). **Copy** what you need; do not import from another test file.
- A `window` blur is `act(() => { window.dispatchEvent(new Event('blur')); })` — **no** element blur.
- Write every case first, run it against the **current** source, and record red/green per case in `a-round-42/red-run.txt`. Then the green run in `a-round-42/green-run.txt`.

| ID | Case | Expected | Old source (B's prediction; A records the truth) |
|---|---|---|---|
| PK1 | Music Pan: `pointerDown` (pointerId 41, `press`), `change` −10, **element blur**, no pointer release. Then `keyDown` ArrowRight on the Pan slider, followed by `change` `5` | Stored music pan **0.1**; slider value `5`; exactly one new entry, undo chain head `Pan — მუსიკა`; `isPointerGestureActive()` false | red |
| PK2 | Must-not: the same suppressed state; `keyDown` ArrowRight on the **music Volume** slider, then `change` `5` on the Pan slider | Ignored: stored pan unchanged (0), slider `0`, no entry | green |
| PK3 | After PK1's keyboard entry: `windowPointer('pointerup', 41)` and then `windowPointer('pointercancel', 41)` | No further entry; stored pan stays 0.1; slider `5` | red (PK1's step fails first) |
| PK4 | Must-not: suppressed state with the SFX clip selected; Pan focused; `keyDown` Delete on the Pan slider (window listener as in `fader-guards` l.321–340) | The window listener receives Delete with `defaultPrevented` false; the SFX clip is deleted with exactly one `კლიპის წაშლა` entry; no Pan entry | green |
| RW1 | Music Pan: `pointerDown` 41, `change` −10 (draft), then **`window` blur only** | Slider value `0` (stored) and the reset button text = `formatTrackPan(0)` from the DOM before the drag; `isPointerGestureActive()` false; the arrangement object is the one from before the press; no entry | red |
| RW2 | After RW1: `claimPointerGesture(77, noop)` in `act`; `change` `5` on the Pan slider; then release 77; then `change` `5` again | While 77 is held: slider stays `0`, status `GESTURE_EDIT_BLOCKED_MESSAGE`, no entry. After the release: stored pan 0.1, exactly one `Pan — მუსიკა` entry | red |
| RW3 | Must-not: a normal drag ended by `pointerUp` 41 on the slider (one Pan entry), then `window` blur | Nothing changes: value, stored pan and the undo chain are the same as before the blur | green |
| RW4 | Must-not: the window blur does not suppress: after RW1, `change` `3` with **no** keydown and no other gesture | Exactly one Pan entry, stored pan 0.06 | green |

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments;
- exact strings come from the rendered DOM or exported constants;
- no snapshot tests; no fake timers unless the copied harness already uses them.

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.7 and the full `npx vitest run` (1325 plus your new `it` count; B expects 8).
- **Biome:**
  - run `npx biome check --write` **only** on `ArrangementLane.tsx` and the new test;
  - then a read-only `npx biome check ./app`: exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent. Report its findings and your dispositions.
- **Browser smoke** (A; one run if the server and daemon are up; `a-browse.json`; not a PASS claim): the PK-B scenario of §4.1 once at 1440×900.
- **Mutations:** only in a scratch copy outside `store/`; they are C's job, A may skip them.
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `ea35611` with an empty `git status`, or a newer root commit that leaves `ArrangementLane.tsx` at `7de5a093` and the 386 list OK.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.1 only |
| `app/lib/arrangement/__tests__/pan-release-recovery.test.tsx` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-42.md`, `a-round-42/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-42.md`, `c-round-42.json`, `c-round-42/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

- `a-round-41/`, `c-round-41/` and `b-round-41/` are read-only.
- **Expected `git status --short` at the end:** ` M app/components/arrangement/ArrangementLane.tsx`, `?? app/lib/arrangement/__tests__/pan-release-recovery.test.tsx`, `?? docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md`. Nothing else.

### 3.3 Frozen this round

- All **386** files in `b-round-41-tree-sha256.txt`, and everything else under `store/`.
- This includes: `useRelativeFaderDrag.ts`, `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx`, `model.ts`; every existing test (`fader-guards`, `track-pan`, `fader-click`, `gesture-guard` …); docs 001–038.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, fresh load (`viewport`, then `goto`, then the setup chain); one case repeated at 1280×720. **Layout L42** = L41: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Music Pan stored at C (0) unless a step says otherwise.

**Harness rules (unchanged):**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** (label it): `PointerEvent` dispatch with an explicit `pointerId` (C uses **41**, which the real mouse never has), `window.dispatchEvent(new Event('blur'))`, `.blur()`, `.focus()`, `scrollTop`.
- C may read state through the existing `window.__c` reader (undo labels, `isPointerGestureActive`, stored pan). Label it. No source instrumentation. Mutations run only in a scratch copy outside `store/`.
- Every run and gate records `node.exe`.

**Checkpoint order if the session may end:** G42-2 → R42-S → R42-PK → R42-RW → R42-U → R42-REG → the rest. Write `c-round-42/checkpoint.md` as you go.

### 4.1 R42-PK — the keyboard unlocks Pan after a lost release

| Case | Steps | Expected |
|---|---|---|
| PK-B (1440) | SYNTHETIC `pointerdown` (pointerId 41, button 0, buttons 1, centre of the music Pan slider) → SYNTHETIC `pointermove` 41 on `window` +10 px (draft visible: record `aria-valuetext`) → REAL click on a neutral element that starts no gesture (the detail panel's info text after expanding the panel with a REAL click on `arrangement-detail-toggle` if `aria-expanded` is false — at 1280 a fresh load may start collapsed — or the `დემო კოლექცია` badge; name the one used; it blurs the slider; the real mouse pointer is not 41) → no release of 41 → SYNTHETIC `.focus()` on the Pan slider (or REAL Shift+Tab back; name it) → REAL `ArrowRight` | Before the key: stored pan unchanged, no Pan entry, slider shows the stored value. After the key: the slider moves one step right of the stored value, `aria-valuetext` and the reset button text agree, **exactly one** new `Pan — მუსიკა` entry, `isPointerGestureActive` false. A second REAL `ArrowRight` → one more entry |
| PK-LATE | Continue: SYNTHETIC `pointerup` 41 on `window` | No new entry; the value stays |
| PK-NEG | Fresh load; same suppressed state; REAL click on the music **Volume** slider is **not** used (it would start a gesture). Instead SYNTHETIC `.focus()` on the music Volume and REAL `ArrowRight` there; then SYNTHETIC `.focus()` on Pan and **no** key; SYNTHETIC `input`/`change` dispatch on Pan with a new value | Volume behaves as before (record its entry). The Pan `change` is ignored: stored pan unchanged, no Pan entry |
| PK-1280 | PK-B once at 1280×720 | As PK-B |

### 4.2 R42-RW — window blur ends the Lane Pan drag

| Case | Steps | Expected |
|---|---|---|
| RW-B (1440) | SYNTHETIC `pointerdown` 41 on music Pan → SYNTHETIC `pointermove` +10 px (record the draft `aria-valuetext`) → SYNTHETIC `window` blur only (the slider stays focused: check `document.activeElement`) | The slider, `aria-valuetext` and the reset button return to the stored value; `isPointerGestureActive` false; 0 entries |
| RW-KEY | Continue: REAL `ArrowRight` on the focused Pan | Exactly one `Pan — მუსიკა` entry, value = stored + 1 step |
| RW-GESTURE | Fresh load; RW-B; then SYNTHETIC `pointerdown` (pointerId 52) on an SFX clip body to start a clip-move gesture (do not release); REAL `ArrowRight` on the focused Pan; then SYNTHETIC `pointerup` 52 | While 52 is held: the slider does **not** move (no visual-only draft), status = the gesture-blocked message, 0 Pan entries. After the release: record the clip state (a click without movement must add no move entry) |
| RW-NORMAL | Fresh load; SYNTHETIC `pointerdown` 41 → `pointermove` +10 → `pointerup` 41 (one Pan entry) → SYNTHETIC `window` blur | Nothing changes after the blur (value, entries) |

### 4.3 R42-REG — regression (REAL where possible)

| ID | Expected |
|---|---|
| REG-KEYS | Pan focused, REAL `ArrowRight` ×2, `ArrowLeft` ×1: one entry per key (unchanged behaviour of rounds 36–38; record it) |
| REG-RESET | REAL click on the Pan reset button → value C, one entry, focus back on the slider |
| REG-DEL | SFX selected, Pan focused, REAL Delete → the SFX clip is deleted (one entry); REAL Space → playback toggles |
| REG-DRAG | SYNTHETIC drag 41 (down → move +10 → up) → exactly one Pan entry; a click without movement → 0 entries and no jump (round 38) |
| REG-FADERS | music Volume and Master: a SYNTHETIC drag gives one entry each; REAL keyboard unchanged |

### 4.4 R42-S, R42-U, R42-Doc

**R42-S** (static, read-only): `diff -u ../tmp/studio-real-loop/b-round-41-snapshots/ArrangementLane.tsx app/components/arrangement/ArrangementLane.tsx` shows only the §2.1 items (the `blur` add/remove pair inside `beginPanPointerDrag`; one keydown handler; `onKeyDown` on the Pan slider). 386 OK. No `any`, `@ts-ignore`, type assertion, `//` comment, `preventDefault`/`stopPropagation` in the new handler, class change or new export.

**R42-U:**
- The new tests are green; A's red run matches §2.3 (PK1, PK3, RW1, RW2 red; PK2, PK4, RW3, RW4 green), or A explains each difference with the failure text.
- `fader-guards` (71), `track-pan`, `fader-click` (26), `gesture-guard` (19) are green **unchanged**.
- **Mutations** in a scratch copy outside `store/`; each must make a test fail:

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | No `onKeyDown` on the Pan slider | PK1 |
| (b) | The keydown handler also calls `event.preventDefault()` | PK4 / `fader-guards` "no longer stops Delete" |
| (c) | The suppression check removed from `handlePanChange` (any change clears it) | `fader-guards` C-R31-01 group / PK2 |
| (d) | No `window` `blur` listener in `beginPanPointerDrag` | RW1, RW2 |
| (e) | The window blur also sets the suppression (calls `suppressPanPointerAfterBlur`) | RW4 |
| (f) | The keydown handler attached to the lane header instead of the slider (so a Volume keydown clears it) | PK2 |

**R42-Doc:** doc 039 exists, follows `TEMPLATE.md`, is in Georgian, matches the code (handler name, listener) and has the §4.8 table.

### 4.5 Gates

**G42-1:** tsc 0; vitest = 1325 + the new `it` count, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs); the build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, plus 1 info.

**G42-2:** protected 4/4 OK; `sha256sum -c b-round-41-tree-sha256.txt` → 386 OK; `git status --short` = §3.2; HEAD at the start and at the end.

**G42-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module requests, the homepage hero image from `images.unsplash.com`, **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`; recorded by C in rounds 40–41).

**Not re-run this round** (not PASS): exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; the detail-panel geometry (round 41).

### 4.7 Frozen suites (A self-check, C G42-1)

`pan-release-recovery`, `fader-guards`, `track-pan`, `fader-click`, `gesture-guard`, `track-layout`, `delete-selection-ui`, `pending-status`, `clip-gain`, `ArrangementContext.test.ts`.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

No new Live behaviour is copied. No new browsing and no video. The only cited source stays the round-37 capture: Live 12 Reference Manual §3.2, https://www.ableton.com/en/live-manual/12/live-concepts/, captured 2026-10-13, `b-round-37/ableton-live-concepts-20261013.txt`.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| After an interrupted mouse drag (focus lost, release outside the window), the Pan keyboard works again on the next key | none | **Not applicable** (input robustness of CZABA's web slider) | D-29z7 A | R42-PK |
| A window blur during a Pan drag cancels the drag and shows the stored value | none | **Not applicable** | D-29z7 B; CZABA's existing gesture-abort rule (D-29w) | R42-RW |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - **C-R41-01** (Low, 1024×768, Tech Lead viewport question; not re-run);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab` and the hydrated U+FFFD `aria-label`s. Round 41: 64 312 bytes, **3 NUL** at 11729, 28025, 28026; **1** U+FFFD label (library collapse).
- **Open Low items:** R26-M1; 4b-2 groups 3–4 (rounds 43–44); A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN; the DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE; DETAIL-RESET-SHRINK (info).
- **Records from round 41 (info, not scheduled):** SB-4 (Shift+Tab reaches the detail scroller; ArrowDown scrolls it); the none-state reasons at the 120 px minimum clipped 7/13 px (accepted, the info hint shows the same text); MN-4 range overlay over the video reason (readable); ESC-DESELECT-NOTE (REAL Escape did not clear a group with focus on the Playhead slider; no workspace deselect handler; focus-dependent).
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - round 41 is committed and published as `ea35611` (`round41Checkpoint`); round 42 becomes checkpoint-ready only after C PASS;
  - the ignored `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset;
  - `root-pre-push-review.md` (2026-10-07): its M1–M3, L1–L4 and L6–L8 are **closed** (backlog; `b-round-32.md`; `feature-status.md` §6) and L5 is accepted. Earlier task texts (rounds 40–41) wrongly listed them as open; nothing from that review is open now except the items above that it shares with `publication-checkpoint.json`;
  - dev-server availability; ENV-BROWSE-DAEMON; machine load (Defender).
- **Tech Lead manual checks:** R23-1 (including the detail scroller), R23-2, R38-T (including A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, and the new **TL-Q-VIEWPORT** (C-R41-01). R31-T gains one step: real mouse Pan drag → Alt+Tab while holding → release → back → ArrowRight moves Pan.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-41-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementLane.tsx
npx vitest run app/lib/arrangement/__tests__/pan-release-recovery.test.tsx
npx vitest run app/lib/arrangement/__tests__/pan-release-recovery.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-41-snapshots/ArrangementLane.tsx app/components/arrangement/ArrangementLane.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than `pan-release-recovery.test.tsx`.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G42-1/2, R42-S, R42-U, R42-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-42.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case) and the green run;
3. the diff summary per file;
4. the smoke result (if run);
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-42.md` and `c-round-42.json`** (the usual schema): per ID PASS, FAIL (with a bug ID) or **not run** (with the reason); the R42-PK and R42-RW tables with labelled REAL/SYNTHETIC steps; R42-REG; the mutation table; the Ableton two-verdict table (§4.8); the gates, the C-R23-01/C-R38-01 record and the carried items. `passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **TL-Q-VIEWPORT / C-R41-01:** if the Tech Lead puts widths below 1280 in scope, it is scheduled before group 3 (candidate in `b-round-41.md` §4).
- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH:** if R38-T confirms a touch jump, B schedules the pre-specified fix (non-passive `touchstart` + `preventDefault` on Volume, Pan and Master; Zoom excluded).
- **Round 43 — 4b-2 group 3:** FADER-KEY-ENTRIES (re-read C's R30-K record first), A-R29-REVIEW-1, A-R33-REVIEW-TOUCH.
- **Round 44 — group 4:** MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER.
- **Then:** 4c (round-9 M1/L8, PREVIEW-VOLUME-IDENTITY) and polish; SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10); SRW-17 (FB-12); SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07); SRW-20; R26-M1 hardening; the SRW-21 adapter; the full regression and the root check; then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 42 -StartPhase A` and a higher limit.
