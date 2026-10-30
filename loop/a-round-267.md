# A round 267 — GATE264-S2 (Alt/AltGr + Ctrl/Cmd letter shortcuts)

## STOP — needs B ruling on §2.1.2 / §2.1.3 vs reviewer Medium A-R267-REVIEW-GESTURE-ARROW (gesture-arm Arrow fall-through)

The task's required substitution (`commandChord` in the **whole** gesture-block Ctrl arm, §2.1.2, B sketch) forces a regression against HEAD. Both fixes conflict with the task text, so per L11 (spec conflict / task forces a regression vs HEAD) A did not rule on it.

**Trace.** Gesture active + `{ctrlKey:true, altKey:false, AltGraph:true}` + ArrowLeft/ArrowRight:
- HEAD: gesture arm uses `modifier` → blocked, `GESTURE_EDIT_BLOCKED_MESSAGE`, prevented.
- Diff: `commandChord` false and `!modifier` false → not blocked → letter branches skip → Ctrl+Arrow branch (`StudioWorkspace.tsx` ~2417–2445, `(event.ctrlKey && !event.altKey)`) runs: `preventDefault` + `stepMarker` mid-gesture. The keyboard `stepMarker` has no own gesture guard (`ArrangementMarkerRow.tsx` buttons use `runUnlessGesture`, the key path does not).

**Measurement** (`a-round-267/arrow-gesture-probe.log`, throwaway jsdom probe on scratch `/tmp/a267-scratch`, scratch restored afterwards; locator set to 1 s, 1 clip 0–20 s, gesture claimed id 42, then ArrowRight + chord):

| chord | HEAD | diff |
|---|---|---|
| Ctrl+AltGraph (no altKey) | locator 1→1, prevented, blocked msg | **locator 1→20, prevented, no msg** (marker moves mid-gesture) |
| Ctrl+Alt | 1→1, prevented, blocked msg | 1→1, not prevented, status unchanged (silent pass-through) |
| Meta+Alt | 1→1, prevented, blocked msg | 1→1, not prevented, silent |
| Ctrl+Alt+AltGraph | 1→1, prevented, blocked msg | 1→1, not prevented, silent |
| plain Ctrl | 1→1, prevented, blocked msg | same as HEAD |

Row 1 is the Medium (contract-only modifier state, same as AG6; no real platform proven). Rows 2–4 are a second behaviour change the task's "unchanged" list omits (reviewer: Info; consistent with the letter rule, but not stated in the task). B should rule on both.

**Fix options (not applied):**
- (a) add `!event.getModifierState('AltGraph')` to the Ctrl arm of the Ctrl+Arrow branch. Also removes the pre-existing inconsistency that Ctrl+AltGraph+Arrow outside a gesture steps the marker. Breaks §2.1.3 ("do not change … the Ctrl+Arrow branch") and C's HUNK-SCOPE (1 add + 11 subs).
- (b) keep `modifier` for the two Arrow alternatives in the gesture arm: `(commandChord && letters) || (modifier && (ArrowLeft || ArrowRight)) || (!modifier && …)`. Restores HEAD for all Arrow rows (blocked + msg). Breaks §2.1.2 ("use it instead of `modifier` in exactly these places: the `modifier && (key === 'e' || …)` arm") and HUNK-SCOPE.
- Proposed test row **AG7**: gesture claimed; `{key:'ArrowRight', code:'ArrowRight', ctrlKey:true, modifierAltGraph:true}` → `getLocatorPosition()` unchanged; plus the expected status/prevented per B's ruling; positive control plain Ctrl+ArrowRight → `GESTURE_EDIT_BLOCKED_MESSAGE`.

Tree left at the last consistent state: B's sketch exactly as specified, tests green, only the 3 grant paths.

## Other STOP conditions (§2.6) — checked
- Change outside the 3 grants / outside `handleKeyDown`: no.
- Existing test red: no (231/231 targeted).
- Existing line of `meta-shortcuts-ui.test.tsx` changed: no (0 removed lines in diff; one name added to the `~/contexts/ArrangementContext` import).
- Mutant staying green: no (14/14 red).
- Test above 50 % of its timeout: no. Slowest covering tests: UC5 3430 ms (A) / 3951 ms (gate 266 verify.log), UC1 3096 / 3415 ms, TG1 3252 / 3056 ms, all with declared 20 000 ms. New AG rows ≈ 70–100 ms each (default 5 s).

## Changed files
- `app/components/arrangement/StudioWorkspace.tsx` — `handleKeyDown` only: +1 line (`const commandChord = modifier && !event.altKey && !event.getModifierState('AltGraph');`), 11 substitutions (gesture Ctrl arm; branches e z y l a d c x v g; the g line keeps `&& !event.altKey`). Identical to `b-round-266/sketch.diff`.
- `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` — add-only: `GESTURE_EDIT_BLOCKED_MESSAGE` added to the existing import; one new `describe('GATE264-S2: Alt or AltGr held with Ctrl/Meta runs no Ctrl-letter command')` with AG1–AG6 (helpers `ALT_CHORDS`, `CTRL`, `selectOnlyClip` are inside the describe). After the reviewer: AG1 ends with plain Ctrl+Y (0→1), AG5 asserts not prevented, AG6 ends with plain Ctrl+Z (1→0).
- `docs/implementation/2026/quarter-IV/199-gate264-s2-altgr-shortcuts.md` — new; l.4 `**სტატუსი:** Completed (C round 267 PASS)`; TEMPLATE's 7 headings in order; cites AG1–AG6, the 14 mutants, manual §42; Linux hypothesis as open question; the STOP item listed in TODO as awaiting B.

`git status --porcelain`: ` M` StudioWorkspace.tsx, ` M` meta-shortcuts-ui.test.tsx, `??` doc 199. Nothing else.

## Tests actually run (from `store/`)
- `npx vitest run` on the §2.4 list: 12 arrangement files 225/225 + `app/lib/__tests__/focus-source-typing.test.tsx` 6/6 = **231/231** (`a-round-267/vitest-targeted.txt`). Note: the task wrote `focus-source-typing.test.tsx` among arrangement tests; it lives in `app/lib/__tests__/`. meta-shortcuts-ui re-run after the test tightening: 25/25.
- `npm run typecheck`: rc 0. `npm run lint`: rc 0 (205 warnings / 1 info, none in owned files). `npx biome check` on the 2 code files: "No fixes applied", no diagnostics.
- Red-proofs on `/tmp/a267-scratch` (`a-round-267/mutants.log`, `mutants-detail.log`; scratch restored, `cmp` identical), re-run with the final tests:
  - BRANCH-e → AG2 ×3, AG5; BRANCH-z → AG1 ×3, AG6; BRANCH-y → AG1 ×3; BRANCH-l → AG3 ×3; BRANCH-a/d/c/x/v → AG4 ×3 each; BRANCH-g → AG6 (status assertion, refusal "To group tracks…", final-file line 462).
  - M-ALT → 8 rows (Ctrl+Alt and Meta+Alt variants of AG1–AG4); M-AG → AG6; M-GESTURE → AG5; M-RETURN → AG6 (Snap `aria-pressed` 'true' vs 'false', final-file line 459; `mutants-detail.log` line numbers predate the AG1/AG5 tightening).
- Not run (gate rows): full vitest, build, Biome full, `npm run verify`, e2e smoke. No browser run by A → **realVerified=false** for A; C's browser rows pending.

## Code review (actual `code-reviewer` subagent, 3 files)
- **Medium** gesture-arm Arrow fall-through → the STOP above (not fixed: outside the task's allowed hunks).
- Low AG5 no notPrevented → fixed. Low AG6 no positive control → fixed. Low AG1 no redo positive control → fixed. Low AG4 `a` effect assertions can only fail via notPrevented → acknowledged (A branch always prevents; notPrevented catches it, BRANCH-a red).
- Info: redundant `&& !event.altKey` on g → kept (task allows either). Info: positional `ALT_CHORDS[0][1]` → replaced with an explicit AltGr literal. Doc claims → positive-control sentence now true; Biome listed.
- **Architecture note (for B/root, not a refactor instruction):** `handleKeyDown` (StudioWorkspace.tsx ~2206–2520) is a repeatedly-changed region with costly full-mount tests; this round's regression came from branch-order interaction between the gesture arm and the Ctrl+Arrow branch. Keep for now; proposal: a pure chord classifier in `app/lib/arrangement/` (event fields → command id | null) with mount-free unit tests, dispatch/refs/gesture checks staying in the component.

## B acceptance criteria truly passed by A
- §2.1 items 1–3 as written (sketch applied exactly) — yes; §2.1 item 4 "does not show the gesture-blocked message" holds for letters (AG5) but the Arrow side is the STOP.
- §2.2 rows AG1–AG6 present and green; mutants all red — yes.
- §2.3 doc 199 — written (l.4, headings).
- §2.4 checks — yes (above). Code review — yes.
- Not claimed: anything C or the gate verifies; GATE264-S2 closure.

## Exact next C checks (if B rules the round continues as is or after a fix-up)
- SOURCE-SCOPE, HUNK-SCOPE (`git diff -U0` = 1 add + 11 subs unless B rules fix (a)/(b)), CLAIMS K1–K16.
- TESTS-TARGETED (note focus-source-typing path), MUTANTS (M-ALT, M-AG, M-GESTURE, M-RETURN + ≥3 branch).
- Browser: ALTGR-UNDO, ALTGR-EDIT, CTRLALT-REAL, META-ALT-REAL, POS-CTRL 1–5, FOCUS-ALT, DOC-199, G267-AUTH at 1440×900 and 1280×720.
- New, for B's ruling: during a real drag (pointer held on a clip), Ctrl+Alt+ArrowRight and a dispatched Ctrl+AltGraph(no altKey)+ArrowRight — locator must not move.

## Scope completed
Implementation and tests of §2 done; round handed over as **STOP** for B's ruling on the gesture-arm Arrow behaviour. Not self-marked complete.
