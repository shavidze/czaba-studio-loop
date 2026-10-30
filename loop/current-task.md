# Round 276: SYS-5 stage 1 (of 2). The seven transport buttons that are unavailable keep their reason reachable by keyboard: `aria-disabled="true"` instead of native `disabled`, still focusable, a reason in every title, the click does nothing, the look is unchanged. Plus RT-FIX 276 (C re-checks only the retro lines B corrected)

**Planned by:** B, at the round 275 → 276 planning, 2026-10-30. **Decisions:**
- D-29z613: RETRO 275 RT-FIX (C-R275-01, C-R275-02; see `b-round-275.md` §2).
- D-29z614: round 276 = SYS-5 stage 1 (the 7 transport buttons). Stage 2 (round 277) = the metronome toggle (`ArrangementTempoRow.tsx`) and the library Add button (`ArrangementLibraryPreview.tsx`), with the helper moved to a shared file. The backlog `owner_area` that put the metronome in `ArrangementTransport.tsx` was wrong and is corrected.
- D-29z615: the contract of §2 (`product-designer` decided Q1–Q3; `tech-lead` decided the helper's place, the class variants and the handoff; their one disagreement is ruled in §3).
- D-29z616: keyboard shortcuts are unchanged (L49). This is a fix-up of a Saba-approved recommendation (DUX-R-4(b), `user-review/design-ux-decisions.md`, 2026-10-25), so no AGREE note and no YouTube request; the reference section below is still written.
- D-29z617: the outcome table of §11.

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-275-r276-grants.txt`. **Frozen list:** `b-round-275-r276-tree-sha256.txt` (every tracked file except the grants).

## Baseline: HEAD `a4c0e24`, clean tree
`gates/gate-round-275.json` is `skipped` (C FAIL on retro documents only), so nothing new was published and the baseline is gate 274's commit `a4c0e24`. At planning `git status --short` was empty and `git ls-files | wc -l` was 1138.

## 0. Read first
`lessons.md` (every role). Then this task. Primitives for A: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (the component is touched), `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

## 1. What changes, and why
Today seven transport buttons use native `disabled` [K1]. The browser removes them from the Tab order, so a keyboard or screen-reader user never reaches the reason, which lives only in `title` (C-R229-01, GATE229-S1). Four of the seven titles do not even state a reason: Undo, Redo, Split and Delete name only the action [K7][K10]. At HEAD the transport has 7 Tab stops in the empty demo at both viewports (Follow, Play, Stop, Back to start, Zoom (px/s), Fit, Export) [K10].

| Button | Unavailable when [K1] | Title today when unavailable [K10] | Title after |
|---|---|---|---|
| Undo | no undo label | `Undo (Ctrl+Z)` (no reason) | `Undo — nothing to undo yet (Ctrl+Z)` |
| Redo | no redo label | `Redo (Ctrl+Shift+Z)` (no reason) | `Redo — nothing to redo (Ctrl+Shift+Z)` |
| Split | no range and no selected clip | `Split at the insert marker (Ctrl+E)` (no reason) | `Split — select a clip or make a time selection first (Ctrl+E)` |
| Delete | no range and no selected clip | `Delete clip — leaves a gap (Delete)` (no reason) | `Delete — select a clip or make a time selection first (Delete)` |
| Loop | no range and no loop | `Loop: make a time selection first (Ctrl+L)` | unchanged |
| Zoom to selection | no range | `Zoom to selection: make a time selection first (Z)` | unchanged |
| Zoom back | empty zoom history | `Previous zoom: the history is empty — use Fit or Zoom to selection first (X)` | unchanged |

The available-state titles do not change. The visible text of every button does not change: `<span className="truncate">Undo` stays byte-identical, because `perf/lib/app-labels.ts` searches the source for it [K12].

## Reference: how others do it
| Point | Source | What it shows | CZABA |
|---|---|---|---|
| Disabled toolbar controls stay focusable | WAI-ARIA APG, "Developing a Keyboard Interface" → "Focusability of disabled controls" (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/, read 2026-10-30) | Browsers remove `disabled` elements from the Tab sequence; `aria-disabled="true"` keeps a control focusable. The APG gives toolbar buttons that must stay discoverable (Copy, Cut, Paste) as the `aria-disabled` case, and a control whose presence is inferable from its neighbours as the `disabled` case | Follows the APG: all seven are toolbar buttons whose presence is not inferable |
| Live 12 Tab navigation | Ableton Live 12 manual, "Accessibility and Keyboard Navigation", §41.1.1 "Using Tab for Navigation" and §41.4.1.1 "Control Bar" (https://www.ableton.com/en/live-manual/12/accessibility-and-keyboard-navigation, read 2026-10-30) | "Tab moves to the next control"; in the Control Bar, Tab and Shift+Tab move between control groupings | CZABA's toolbar is already Tab-navigable; this round adds the unavailable buttons as stops |
| How Live treats an unavailable control under Tab or a screen reader | **No reference found.** Searched: the chapter above (§41.1–§41.5 as read), the search results for "Ableton Live 12 keyboard navigation Tab screen reader accessibility manual disabled controls" (including "Accessibility in Live Overview"). The chapter does not mention disabled or unavailable controls | Not guessed. Recorded as **LIVE-MEAS-SYS5-DISABLED** in `user-review/live-checks.md` for root (non-blocking: the behaviour is Saba-approved) |
| Reason text for an unavailable command | No reason text found in the manual (same search) | **Better than Live (Saba-approved DUX-R-4(b)):** the reason is the button's title, so the hover tooltip and the screen reader's description carry it |

**Deviations:** none from a confirmed Live behaviour. The reason text is the Saba-approved addition. No new persistent screen text (L39): the reasons live only in titles; the quieter homes considered were tooltip (chosen), the `?` sheet (does not explain the current state), status line (rejected in §3 Q1).

## 2. The contract (D-29z615)
### 2.1 One local pattern, seven buttons
- A small helper **inside `ArrangementTransport.tsx`** (`tech-lead`: stage 2 moves it to `app/components/arrangement/` when TempoRow and LibraryPreview give it three users; a prop on `~/components/ui` Button is not used, because the transport uses plain `<button>` and a shared Button prop needs an architecture checkpoint first). A names it per `AGENT_DISCOVERABLE_CODE.md` (suggestion: `softDisabledButtonProps(isUnavailable)` and `isSoftDisabledEvent(event)`).
- For each of the seven buttons, when unavailable: **no `disabled` attribute**; `aria-disabled="true"`; the attribute is **absent** when available (not `"false"`); the button stays in the Tab order (no `tabIndex` change).
- **Click guard:** the first statement of each button's `onClick` returns when the button is soft-disabled, **before** `armFocusHandoff` and before the action. So a click, Enter, Ctrl+Space or a repeated Enter on a soft-disabled button runs nothing: no edit, no history entry, no status write, no range, loop or zoom change. (The actions behind these buttons do write status when called in the unavailable state, e.g. `ZOOM_RANGE_MISSING_MESSAGE`, `ZOOM_HISTORY_EMPTY_MESSAGE` [K8], and in the context `needsSelection`, `splitNeedsTarget`, `deleteNeedsTarget`, `GESTURE_UNDO_BLOCKED_MESSAGE`; the guard keeps them unreachable from the buttons, exactly as native `disabled` did.)
- **Mouse focus:** `mousedown` on a soft-disabled button calls `preventDefault()`, so a mouse click does not pull focus out of the timeline (a native disabled button never took focus). The click guard still runs on the following `click`.
- **Keyboard shortcuts are unchanged** (D-29z616). Ctrl+Z, Ctrl+Shift+Z, Ctrl+E, Delete/Backspace, Ctrl+L, Z and X keep their handlers and their status texts. L49 ruling: putting the button guard on the shortcut paths would drop side effects that exist today (Z with no range writes `ZOOM_RANGE_MISSING_MESSAGE`, X with an empty history writes `ZOOM_HISTORY_EMPTY_MESSAGE` [K8]); for a keyboard user those texts are the reason. **Side effects of native `disabled`, ruled one by one (L49):** not focusable → dropped on purpose; click suppressed → kept (guard, SD2, M1); `:disabled` CSS variants → moved (§2.3, SD7, M5); AX "unavailable" state → kept (`aria-disabled`, B-AX); skipped by the `:disabled` opener checks → dropped on purpose (§2.5, B-SHEET-RESTORE); handoff predicate → rekeyed (§2.4, M3); global press scale → kept (§2.3, V-PRESS); no mouse focus → kept (mousedown, SD3, M2).
- `preventRepeatedEnterKeyDown` stays where it is [K3]. It is **not** added to Split, Loop or Zoom to selection (an available button's held Enter is pre-existing behaviour; recorded as B-R275-SPLIT-HELD-ENTER, Low, `deferred_low_polish`).

### 2.2 Titles (the reasons)
- `studioEditStrings.undoTitle(null)` returns `Undo — nothing to undo yet (Ctrl+Z)`; `redoTitle(null)` returns `Redo — nothing to redo (Ctrl+Shift+Z)`. The labelled forms (`Undo: <label> (Ctrl+Z)`) are unchanged.
- Two new strings in `studioEditStrings`, built with `studioShortcutTitle` like their neighbours: `splitNeedsTargetTitle` = `studioShortcutTitle('Split — select a clip or make a time selection first', 'split')`; `deleteNeedsTargetTitle` = `studioShortcutTitle('Delete — select a clip or make a time selection first', 'delete')`.
- Split's title: range → `splitRangeTitle`; else a selected clip → `splitAtInsertMarkerTitle`; else `splitNeedsTargetTitle`. Delete's title: range → the range hint (unchanged); else a selected clip → `deleteClipTitle`; else `deleteNeedsTargetTitle`. Delete's `aria-label` is unchanged in every state.
- Loop, Zoom to selection and Zoom back titles: unchanged.

### 2.3 Look (unchanged at rest, no hover light)
`tech-lead` compiled two of these forms with the installed Tailwind 4.1.18 [K11]: `aria-disabled:opacity-40` builds to `&[aria-disabled="true"]`, and `not-aria-disabled:hover:bg-*` to `&:not(*[aria-disabled="true"]):hover`. The stacked child form `aria-disabled:*:opacity-40` was **not** compiled by anyone. **A pre-step:** before the tests, confirm that a build (or one Tailwind compile of the changed file) emits a rule matching `[aria-disabled="true"] > *` with `opacity: 40%`/`0.4` for that token; paste the emitted selector in `a-round-276.md`. If it is not emitted, STOP (§10); do not substitute another form.
- In `toolButtonClass` (l.53 [K4]): `enabled:hover:bg-foreground/8` → `not-aria-disabled:hover:bg-foreground/8`; `enabled:active:bg-foreground/12` → `not-aria-disabled:active:bg-foreground/12`; `disabled:cursor-not-allowed` → `aria-disabled:cursor-not-allowed`; `disabled:opacity-40` → `aria-disabled:*:opacity-40` (the **children** are dimmed, not the button, so the focus ring keeps full strength; ruling in §3).
- Every `enabled:` override in the same file moves to `not-aria-disabled:` **in the same change** (l.221 Follow-on, l.253–254 Play/Stop, l.308 Loop-on [K5]). Reason (`tech-lead`): `cn` uses tailwind-merge, which drops a duplicate only when the variant prefix matches exactly; a leftover `enabled:hover:` would emit two hover colours at equal specificity. After the change `ArrangementTransport.tsx` contains **0** `enabled:` and **0** `disabled:` class tokens.
- The global press scale `button:active:not(:disabled)` / `[role="button"]:active:not(:disabled)` exists twice, in `app/styles/app.css` l.380–381 and `app/styles/base/utilities.css` l.73–74 [K6]. Both selectors gain `:not([aria-disabled="true"])`, so a soft-disabled button does not shrink when pressed. Nothing else in those files changes.
- No new token, no hard-coded colour, no new persistent text.

### 2.4 Focus handoff: rekeyed, not removed
The layout effect at l.107–122 moves focus Delete → Undo, Undo → Redo, Redo → Undo and Zoom back → Fit when the pressed button becomes unavailable [K2]. It is a recorded product decision (doc 093, D-29z73): after Delete, the next Enter undoes. With `aria-disabled` the source never reports `.disabled`, so the effect would silently stop. Ruling:
- The source test becomes "the source now has `aria-disabled="true"`"; the partner test becomes "the partner does not have `aria-disabled="true"`".
- **Named focus targets (L47):** after the action, if the source became unavailable and the partner is available → the partner (Undo, Redo, Undo, Fit respectively). If the partner is also unavailable → focus **stays on the source button**, which is still focusable. Never BODY.
- Because the guard runs first, a click on an already soft-disabled button never arms the handoff.

### 2.5 Other readers of native `disabled` (the SWEEP, L49)
`[SW1]` (§9) lists the files. Rulings for the runtime (non-test) hits:

| Hit | Sees the seven buttons? | Ruling |
|---|---|---|
| `StudioWorkspace.tsx` `focusPastHiddenOverview` (`!button.disabled`, l.467) | No: it searches only inside the video dock [K9] | Exclusion |
| `ArrangementExportDialog.tsx` l.61 (focusable list) | No: inside the dialog only [K9] | Exclusion |
| `ArrangementShortcutSheet.tsx` l.15 (focusable list) | No: inside the sheet only [K9] | Exclusion |
| `ArrangementExportDialog.tsx` l.147 and `ArrangementShortcutSheet.tsx` l.41 (restore focus to the opener unless `:disabled`) | Yes: a soft-disabled Undo that had focus when `?` was pressed is now restored (`:disabled` used to skip it) | Intended. Row B-SHEET-RESTORE |
| `app.css` l.380–381, `utilities.css` l.73–74 (press scale) | Yes | Changed (§2.3). Row V-PRESS |
| `ArrangementTransport.tsx` l.111 (handoff) | Yes | Rekeyed (§2.4) |
| `LeadMagnetPopup.tsx`, the store forms, the `perf/**` library-Add checks | No (the perf hits read the library Add button: stage 2) | Exclusion |

### 2.6 Out of scope (recorded, not built)
- The metronome toggle and the library Add button: stage 2 (round 277), which closes ROOT-R66-L3 (disabled-reason half) and C-R130-ADD-DISABLED-NO-REASON.
- A visible reason on keyboard focus for sighted users without a screen reader (`product-designer`: a `title` does not show on focus). Recorded as B-R275-FOCUS-REASON-VISIBLE (Low, `deferred_low_polish`), revisited after stage 2.
- Held Enter on an **available** Split, Loop or Zoom to selection (B-R275-SPLIT-HELD-ENTER).

## 3. Why this is the smallest honest behaviour, and the consult rulings
- **Q1, activating a soft-disabled button: silent no-op** (`product-designer`). Rejected: writing the reason to the status line. Why: the screen reader already reads the title as the description on focus, so a status write would say it twice; a mouse click on a greyed button would start writing status text, which costs screen budget and is not what Live does. Trade-off accepted: a sighted keyboard-only user sees no visible reason (B-R275-FOCUS-REASON-VISIBLE). No `setStatus` is added, so L51 reduces to "the status line does not change" (row B-NOOP), and ARCH-CHECKPOINT-SYS6-STATUS-TAG gets the evidence line "SYS-5 stage 1 adds no status write".
- **Q2, handoff: keep, rekeyed** (`product-designer` and `tech-lead` agree; doc 093 / D-29z73).
- **Q3, dimming: the one disagreement.** `tech-lead` proposed `aria-disabled:opacity-40` on the button (the HEAD look, one token). `product-designer` objected that opacity on the button also dims its own `:focus-visible` outline to about 40 %, and the button is now focusable. **Ruling: dim the children** (`aria-disabled:*:opacity-40`). The icon and label get HEAD's effective colour; the only visual delta is the button's `bg-foreground/5` fill, which is no longer dimmed (named and measured in V-REST). The ring keeps full strength (V-RING).
- **Reasons in titles** (`product-designer`): Undo, Redo, Split and Delete had no reason, so making them focusable without one would give keyboard users nothing.

## 4. Neighbour risk
- **Focus handoff** (FL3–FL6, FL10 in `self-disabling-focus.test.tsx`): a missed rekey makes focus stay on the source silently. Rows B-HANDOFF-*, mutant M3.
- **Tab order:** the transport grows from 7 to 14 stops in the empty demo. Tests that Tab through the workspace are in A's run set (§6.3).
- **Hover and press colours** of Play, Stop, Follow-on and Loop-on (their `enabled:` overrides move): V-HOVER-ENABLED.
- **Opener restore** after the shortcut sheet or the export dialog closes: B-SHEET-RESTORE.
- **Space and Enter on a focused toolbar button:** the workspace keydown handler `preventDefault`s Space (l.2272–2290 [K13]) and the Enter branch skips button targets (l.2573–2577 [K13]). B-SPACE compares with HEAD.
- **Perf source needle** for Undo [K12].

## 5. Grants (exact; also in `b-round-275-r276-grants.txt`)
| Path | What may change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` | §2.1–§2.4 only: the local helper; the seven buttons' `disabled` → soft-disabled props and `onClick` guards; the Split/Delete titles; `toolButtonClass` and the four `enabled:` overrides; the handoff predicate. Everything else byte-identical (Play/Stop handlers, the position writer, the layout grid classes) |
| `app/lib/arrangement/strings.ts` | the `undoTitle` / `redoTitle` null branches; new `splitNeedsTargetTitle`, `deleteNeedsTargetTitle` next to `splitAtInsertMarkerTitle` / `deleteClipTitle` |
| `app/styles/app.css` | l.380–381 selectors only (§2.3) |
| `app/styles/base/utilities.css` | l.73–74 selectors only (§2.3) |
| `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` | the `.disabled` reads at l.306–401 become `aria-disabled` reads (§6.1), plus the new describe of §6.2 |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | `BASE_FILL` (l.152–155) and the token lists naming the transport's `enabled:`/`disabled:` tokens (around l.249–251, l.307–324, l.382–395, l.551–558) move to the new tokens; `loop.disabled` (l.382) → the `aria-disabled` read. No assertion removed |
| `app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx` | the transport tokens at l.180–191 and the `transportOn` source string at l.476–481 (count stays 2) move to `not-aria-disabled:`; l.278 and l.295 only if they read a transport button. The `WORKSPACE_PATH` and `TEMPO_ROW_PATH` expectations byte-identical |
| `app/lib/arrangement/__tests__/waveform-zoom.test.tsx` | `transportButton` (l.387) returns `ariaDisabled: button.getAttribute('aria-disabled') === 'true'` instead of `button.disabled` (otherwise it is always false and tests nothing); the expectations that use it (l.604–613, l.686–699) follow |
| `app/lib/arrangement/__tests__/strings.test.ts` | the null-branch expectations (l.619, l.621) get the new texts; the two new keys are added wherever the file inventories `studioEditStrings` (the l.411–417 table, the formatter samples near l.455) |
| `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` | new. l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 276 PASS)` (L28) |

**Frozen** (examples; the manifest is the authority): `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementShortcutSheet.tsx`, `ArrangementExportDialog.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLibraryPreview.tsx`, `shortcuts.ts`, `perf/**`, `e2e/**`, `package.json`, `package-lock.json`, and every other test file (`meta-shortcuts-ui`, `delete-selection-ui`, `metronome-ui`, `lane-strings-ui`, `markers-ui` must pass unchanged).
**Protected auth/purchase (never touched):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.

## 6. Tests
### 6.1 Tests that change (no assertion lost; equal or stronger replacements allowed, L4)
- `self-disabling-focus.test.tsx`: each `expect(x.disabled).toBe(true|false)` becomes `expect(x.getAttribute('aria-disabled')).toBe('true')` / `.toBeNull()` **and** `expect(x.hasAttribute('disabled')).toBe(false)` (stronger). The FL focus assertions stay as they are.
- `transport-surface-ui.test.tsx`, `mode-toggle-colour-ui.test.tsx`: token-for-token replacement per §2.3; every list keeps its length or grows.
- `waveform-zoom.test.tsx`: `disabled` → `ariaDisabled`.
- `strings.test.ts`: the new exact texts.

A test whose only change is removing an assertion is a Medium bug (policy, 2026-10-28).

### 6.2 New rows (in `self-disabling-focus.test.tsx`, a new `describe('SYS-5 stage 1: soft-disabled transport buttons (D-29z615)')`)
| Row | Start → action → expected |
|---|---|
| SD1 | empty arrangement → read the seven buttons → each has `aria-disabled="true"` and no `disabled` attribute; `button.focus()` makes it `document.activeElement`; its `title` equals the §1 "Title after" (built from `studioEditStrings` / `studioLoopStrings` / `studioViewStrings`, not literals) |
| SD2 | empty arrangement, a known status text set first → `fireEvent.click` on each of the seven → the status text, the Undo title, the range, the loop and the zoom history are unchanged after each click |
| SD3 | `fireEvent.mouseDown` on each soft-disabled button returns `false` (default prevented); on Fit it returns `true` |
| SD4 | a clip selected → Split and Delete have no `aria-disabled`; titles `splitAtInsertMarkerTitle` / `deleteClipTitle`. A range → `splitRangeTitle` and the range hint |
| SD5 | one undoable edit → click Undo → Undo becomes soft-disabled and focus is on Redo; click Redo → focus is on Undo (the rekeyed handoff, in addition to FL3–FL6/FL10). **SD5b (partner unavailable → focus stays on the source):** A writes it only if a reachable state exists in jsdom; if none exists (every handoff partner is available whenever its source can become unavailable), A states this with the reason in `a-round-276.md`, and C checks the statement against §2.4 |
| SD6 | Redo soft-disabled and focused → `undo()` through the context (as Ctrl+Z does) → Redo loses `aria-disabled` and keeps focus; `fireEvent.click(redo)` performs the redo (the Undo title has the label again) |
| SD7 | source scan of `ArrangementTransport.tsx`: 0 `enabled:` tokens, 0 `disabled:` tokens, 0 `disabled={` props; the rendered Undo button's class contains `not-aria-disabled:hover:bg-foreground/8`, `not-aria-disabled:active:bg-foreground/12`, `aria-disabled:cursor-not-allowed` and `aria-disabled:*:opacity-40` (rendered, so a tailwind-merge drop is caught) |

New test files: none. (The interim GATE264-ARCH-TEST-HELPER rule applies only to new files.)

### 6.3 What A runs (speed rules)
`npm run typecheck`; `npm run lint`; `npx vitest run` on these files under `app/lib/arrangement/__tests__/`: `self-disabling-focus`, `transport-surface-ui`, `mode-toggle-colour-ui`, `waveform-zoom`, `strings`, `meta-shortcuts-ui`, `delete-selection-ui`, `metronome-ui`, `markers-ui`, `shortcut-sheet-ui`, `markers-move-ui`, `grid-snap-menu`, `export-dialog-focus`, `export-dialog-focus-restore`, `export-dialog-tab-stops`, `export-cancel-ui`, `export-range-ui`, `grid-musical-ui`, `grid-triplet-ui`, `tempo-ui`. Then `code-reviewer` (more than 3 files). The full suite and `verify` are gate rows. L31: the slowest of these at gate 274 is `meta-shortcuts-ui` (30 tests, 12.2 s for the file); no row is added to it.

### 6.4 Mutants (A runs each on a scratch copy and reports red/green; C re-runs M1 and M3)
| Mutant | Must turn red |
|---|---|
| M1: delete the guard in Split's `onClick` | SD2 |
| M2: delete the mousedown `preventDefault` | SD3 |
| M3: revert the handoff predicate to `.disabled` | FL3 (Delete → Undo) and SD5 |
| M4: `undoTitle(null)` back to `'Undo'` | SD1 and the `strings.test.ts` row |
| M5: `disabled:opacity-40` instead of the children token | SD7 |

## 7. B's pre-check (L23, L50)
- **Collision grep** (L23 "cannot pre-apply" form: B did not apply the change on a scratch copy). Command [SW1]. The test files that pin a transport button through a `disabled` read or an `enabled:`/`disabled:` token are exactly `self-disabling-focus` (11 hits), `transport-surface-ui` (20), `mode-toggle-colour-ui` (7) and `waveform-zoom` (1); `strings.test.ts` pins the null titles by text [K7]. All five are granted. A hit A finds in any other file that pins a transport button is a **STOP** (L11), not an edit.
- **Focus origins (L50):** `grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/components/arrangement/ArrangementTransport.tsx` → 2 hits [K14]: l.120 `handoff.partner.focus()` (rows B-HANDOFF-*) and l.227 the Follow label ternary (out of scope: text only). No action in this round unmounts a focused element.
- **Baseline browser probe:** `b-round-275/probe/baseline.cjs` → `baseline.json`, `head-1440.png`, `head-1280.png` (Tab stops, titles, `disabled` flags) [K10].
- Space on a focused toolbar button was **not** settled by B: in the empty demo playback does not start (`b-round-275/probe/space.json`: `data-playing` stayed false even with focus on the body), so the probe was inconclusive. B-SPACE therefore uses a control in the same C run.

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720 unless noted, fresh anonymous contexts; wait for `Demo collection ready` first, L48)
Start from `b-round-275/probe/baseline.cjs` (copy it into `c-round-276/`). For playback rows add a clip the way `c-round-275/c275-smoke.cjs` does (`addPulse`). HEAD control values come from a second server at `a4c0e24` (HR-SECOND-SERVER-VITE) or, for the empty-demo facts, from `b-round-275/probe/`.

**Scope, claims, tests**
| Row | Check |
|---|---|
| SOURCE-SCOPE | `git diff --stat` and `git status --short` list only §5 paths; `sha256sum -c b-round-275-r276-tree-sha256.txt` rc 0 |
| HUNK-SCOPE | `app.css` and `utilities.css`: only the two selector lines each; `strings.ts`: only §2.2; `ArrangementTransport.tsx`: only §2.1–§2.4 |
| CLAIMS | re-run §9 at HEAD `a4c0e24` (`git show a4c0e24:<path>` or the second server), plus the L29 sweep over this task |
| SWEEP | re-run [SW1] on A's tree; every hit has a §2.5 ruling, a §5 grant, or is unchanged |
| TESTS-TARGETED, TEST-CHANGES, MUTANTS | the §6.3 files pass; §6.1 no assertion lost (read the diff); M1 and M3 red |

**Browser behaviour**
| Row | Recipe | Expected |
|---|---|---|
| B-TAB | empty demo, focus the document start, Tab ×60; also at 375×812 (L1, ≥ 2 s settle) | transport stops in order: Undo, Redo, Split, Delete, Follow, Play, Stop, Back to start, Loop, Zoom (px/s), Zoom to selection, Zoom, Fit, Export (14, against 7 at HEAD [K10]); each soft-disabled stop has `aria-disabled="true"` and a visible ring; no stop at effective opacity 0. Backward: End, then Shift+Tab reaches the same set in reverse |
| B-AX | CDP `Accessibility.getFullAXTree` on the seven | each is a button, `disabled: true` in the AX tree, description = its §1 "Title after". Control at HEAD: `disabled: true` and the HEAD titles |
| B-NOOP | empty demo: Tab to each soft-disabled button; Enter; then Ctrl+Space; then a mouse click | nothing changes: status text (same string), Undo title, clip count, range, loop, zoom readout identical before and after (read after 500 ms) |
| B-MOUSE-FOCUS | empty demo (Split is already soft-disabled, nothing unmounts): Tab until a focusable element outside the transport has focus (e.g. the first library item), record `document.activeElement`; mouse-click the soft-disabled Split | `document.activeElement` is the same element as before the click (not Split, not BODY). Control at HEAD: record where focus goes when the natively disabled Split is clicked (data only) |
| B-REASON-TITLES | hover each of the seven 1.5 s | the native tooltip appears; `title` = §1 "Title after". With a clip selected: `Split at the insert marker (Ctrl+E)` / `Delete clip — leaves a gap (Delete)`; with a range: `Split clips at the time selection (Ctrl+E)` / the range hint |
| B-HANDOFF-DELETE | add one clip, select it, Tab to Delete, Enter | the clip is deleted and focus is on **Undo** (ring visible). Enter again → the clip is back |
| B-HANDOFF-ZOOM | a range, Z twice to build zoom history; Tab to Zoom back; Enter until the history is empty | focus is on **Fit** after the last pop |
| B-HANDOFF-UNDO | one edit; Tab to Undo, Enter | the edit is undone, focus is on **Redo** |
| B-ENABLE-WHILE-FOCUSED | after B-HANDOFF-UNDO: Enter on Redo (the redo runs; focus moves to Undo), Tab to the now soft-disabled Redo, Ctrl+Z | Redo loses `aria-disabled` and keeps focus; Enter on it redoes |
| B-SPACE | a clip present; focus soft-disabled Zoom to selection (no range); Space; read `[data-playing]` after 1.2 s; Space again. Control: the same with focus on Fit in the same build, and at HEAD on Fit | `data-playing` follows the control (true, then false); zoom unchanged; focus stays on the button |
| B-SHORTCUTS | empty demo, focus on the timeline: Ctrl+Z, Ctrl+E, Delete, Ctrl+L, Z, X | each status text is byte-identical to HEAD's for the same key (control at HEAD) |
| B-SHEET-RESTORE | focus soft-disabled Undo, press `?`, then Esc | the sheet opens and closes; focus returns to **Undo**. Record HEAD's target as data (HEAD could not focus a disabled Undo) |
| STUDIO-SMOKE-276 | the round-275 smoke (play/stop + export) | `data-playing` false→true→false; export sha256 `1fea093b…` as in round 275 (no audio path changed) |

**Look**
| Row | Check |
|---|---|
| V-REST | each soft-disabled button at rest against HEAD's natively disabled one, sampled pixels (screenshot) on the label text and on the fill. **Expected, derived by B from the tokens** (`--color-surface` #161412, `--color-foreground` #ECE6DA; `b-round-275.md` §3): HEAD text ≈ surface + 0.40·(fg − surface) = rgb(108,104,98), new ≈ surface + 0.43·(fg − surface) = rgb(114,110,104), predicted ΔE2000 2.43; HEAD fill ≈ rgb(26,24,22), new ≈ rgb(33,30,28), ΔE2000 1.99. Pass: text and fill within ±4 per channel of the "new" values (anti-aliasing allowance) and ΔE2000 vs HEAD ≤ 3. The delta is the §3 ruling, not a bug. Boxes ±0 px |
| V-HOVER-SOFT | hover a soft-disabled button | computed `background-color` equals its rest value; `cursor: not-allowed` |
| V-HOVER-ENABLED | hover and press Fit, Follow (on), Play, Stop, Loop (on, with a loop) | computed backgrounds equal HEAD's in the same state |
| V-PRESS | mousedown and hold on a soft-disabled button | computed `transform` is `none`; on Fit it equals HEAD's pressed transform |
| V-RING | keyboard-focus each soft-disabled button | outline ≥ 1 px painted (L9) in the brass ring colour, equal to the ring on Fit (not dimmed); ring vs the toolbar background ≥ 3:1 (measured) |
| SCREEN-BUDGET | persistent text lines outside the timeline, empty demo and demo with a clip, HEAD vs new | equal (L39) |

**Guards and docs**
| Row | Check |
|---|---|
| G276-AUTH | `/studio-lab` anonymous, badge "Demo collection — no sign-in required"; `/studio/middle-east` signed out → "Sign in required", 0 `audio[src]`; `/api/studio-token?product=middle-east&file=Music.wav` without a header → 401, no token |
| DOC-206 | l.4 byte-exact (§5); the 7 TEMPLATE headings in order (L26); every cited row id exists in the test file |
| RT-FIX-276 | only the lines B changed at this planning: `retros/retro-275.md` §8 (the two `RT-FIX 276` bullets), `backlog.json` `retro_candidates` RC-R265-AT-RISK-NO-ROW, `architecture_signals` GATE264-ARCH-TEST-HELPER status, `open_findings` C-R275-01/02, `retro_runs` 275, `b-round-274/stops.txt` comment, `user-review/screen-review-275.md` SR-275-1. Each is true against its cited source (C-R265-01 is in L49's evidence list; D-29z575 names the L4 clause; `grep -rl workspace-test-environment app \| wc -l` = 13) |

**Gate rows** (C does not claim them): full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke`.

**Ableton conformance** (separate from the CZABA requirement): the APG point = confirmed by its source; Live's handling of unavailable controls = **unconfirmed** (no source; LIVE-MEAS-SYS5-DISABLED); the reason text = Saba-approved addition.

## 9. Claims (L29). Run from `store/` at HEAD `a4c0e24`
**Run them with `bash ../tmp/studio-real-loop/b-round-275/claims.sh`** (the same commands with plain `|`). In this table `\|` is only the Markdown cell escape; typed verbatim into `grep -E` it does not match. B's own output at HEAD is `b-round-275/claims-output-at-a4c0e24.txt`.
| Tag | Command | Expected |
|---|---|---|
| K1 | `grep -nE "disabled=\{" app/components/arrangement/ArrangementTransport.tsx` | 7 lines: 147, 163, 175, 192, 294, 343, 363 |
| K2 | `grep -n "\.disabled" app/components/arrangement/ArrangementTransport.tsx` | 1 line: 111 (`if (!handoff?.source.disabled \|\| !handoff.partner \|\| handoff.partner.disabled) {`) |
| K3 | `grep -n "preventRepeatedEnterKeyDown" app/components/arrangement/ArrangementTransport.tsx` | 7 lines: 124 (definition), 146 (Undo), 162 (Redo), 191 (Delete), 243 (Play), 267 (Stop), 362 (Zoom back) |
| K4 | `sed -n 53p app/components/arrangement/ArrangementTransport.tsx \| grep -oE "enabled:[a-z:/0-9-]+\|disabled:[a-z-]+[0-9]*"` | 4 lines: `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `disabled:cursor-not-allowed`, `disabled:opacity-40` |
| K5 | `grep -nE "enabled:hover" app/components/arrangement/ArrangementTransport.tsx \| cut -d: -f1` | 5 lines: 53, 221, 253, 254, 308 |
| K6 | `grep -nE ":not\(:disabled\)" app/styles/app.css app/styles/base/utilities.css` | 4 lines: app.css 380, 381; utilities.css 73, 74 |
| K7 | `grep -nE "splitAtInsertMarkerTitle:\|deleteClipTitle:\|undoTitle:\|redoTitle:" app/lib/arrangement/strings.ts`; `sed -n 619,621p app/lib/arrangement/__tests__/strings.test.ts` | 145, 150, 151, 153; l.619 expects `'Undo (Ctrl+Z)'`, l.621 `'Redo (Ctrl+Shift+Z)'` |
| K8 | `grep -nE "ZOOM_RANGE_MISSING_MESSAGE\|ZOOM_HISTORY_EMPTY_MESSAGE" app/components/arrangement/StudioWorkspace.tsx` | 4 lines: 182, 183 (constants), 1351, 1372 (`current.setStatus(...)`) |
| K9 | `sed -n 461,470p app/components/arrangement/StudioWorkspace.tsx`; `sed -n 55,62p app/components/arrangement/ArrangementExportDialog.tsx`; `sed -n 12,16p app/components/arrangement/ArrangementShortcutSheet.tsx` | the dock query (`dock.querySelectorAll`), the dialog-scoped list, the sheet-scoped selector |
| K10 | browser: `node b-round-275/probe/baseline.cjs` (empty demo; it writes next to itself, copy it first) | transport Tab stops `Follow, Play, Stop, Back to start, Zoom (px/s), Fit, Export` at 1440×900 and 1280×720; Undo, Redo, Split, Delete, Loop, Zoom to selection, Zoom back have `disabled: true` with the "Title today" of §1 |
| K11 | `node -e "console.log(require('./node_modules/tailwindcss/package.json').version)"` | `4.1.18` |
| K12 | `grep -n 'truncate">Undo' perf/lib/app-labels.ts app/components/arrangement/ArrangementTransport.tsx` | `perf/lib/app-labels.ts` l.83 and `ArrangementTransport.tsx` l.153 |
| K13 | `sed -n 2272,2290p app/components/arrangement/StudioWorkspace.tsx \| grep -c preventDefault`; `sed -n 2573,2577p app/components/arrangement/StudioWorkspace.tsx` | `2`; the Enter branch containing `!(event.target instanceof HTMLButtonElement) &&` |
| K14 | the L50 grep of §7 | 2 lines: 120, 227 |
| SW1 | `grep -rlE "toBeDisabled\|toBeEnabled\|\.disabled\b\|:disabled\|\[disabled\]\|disabled=\{\|enabled:(hover\|active)\|disabled:(opacity\|cursor)" app perf \| grep -E "__tests__\|perf/" \| wc -l`; then, for those files, `grep -lE "ArrangementTransport\|arrangement-transport\|TRANSPORT_PATH\|mountTransport\|transportButton\|undoButton\|zoomBackButton"` | 40 files; the second filter gives exactly `transport-surface-ui`, `mode-toggle-colour-ui`, `waveform-zoom`, `self-disabling-focus` (hit counts with the first regex: 20, 7, 1, 11) |

## 10. STOP conditions (L11)
- A test outside §5 that pins a transport button's `disabled`, an `enabled:`/`disabled:` token of the transport, or a §1 title fails → STOP with the hit list.
- The `aria-disabled:*:opacity-40` pre-step (§2.3) finds no emitted `[aria-disabled="true"] > *` rule → STOP with the build output.
- tailwind-merge drops a `not-aria-disabled:` or `aria-disabled:*:` token in the rendered class (SD7 red for a merge reason) → STOP; do not reorder unrelated classes.
- A covering test above 50 % of its timeout → STOP.
- Any change needed in a frozen file (for example `StudioWorkspace.tsx` or `ArrangementShortcutSheet.tsx`) → STOP.

## 11. Outcome, fixed in advance (D-29z617)
| C result | B at the round-277 planning |
|---|---|
| PASS, planning before 2026-11-02 | Round 277 = SYS-5 stage 2 (metronome + library Add; the helper moves to a shared file; closes ROOT-R66-L3 disabled-reason half and C-R130-ADD-DISABLED-NO-REASON). C-R229-01 / GATE229-S1 close on this round's PASS |
| PASS, planning on or after 2026-11-02 | REGRESSION round first (3-day rule), then stage 2 |
| A behaviour or look row fails at Medium+ | a bounded fix-up of that row, same grants |
| RT-FIX-276 fails | B corrects the line; the next C round re-checks it only |
| SOURCE-SCOPE fails | Stop; root inspects; nothing is published |

## 12. Deliverables
- **A:** the code and test changes of §2/§6, doc 206, `a-round-276.md` (changed files, commands run with results, the mutants table, the code-reviewer result and its Architecture note if any).
- **C:** `c-round-276.md`, `c-round-276.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `claimRerunMinutes`, `shadowRowSeverityVerdict`), evidence under `c-round-276/`.

## 13. Root notes
- No dependency change, no root request. The round-274 checkpoint addendum stands (non-blocking).
- After C PASS the change is ready for the gate (stage 1 of a two-stage item; not a release).
