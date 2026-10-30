**COMMIT: OK.** No blocking issues; the diff stays inside `handleKeyDown` and the tests.

I read the three candidate paths, `diff.patch`, the surrounding handler (`StudioWorkspace.tsx:2230–2560`), `timelineNavigationKey` (`view.ts:275`), doc 199, `verify.log` and `c-round-268.json`. No auth, purchase or download code is touched.

## Code Review: StudioWorkspace.tsx (handleKeyDown) + meta-shortcuts-ui.test.tsx + doc 199

### Critical Issues
- none

### Findings, ranked
1. **Low: the Space branch is the one place that still treats Alt/AltGraph chords as commands** (`StudioWorkspace.tsx:2274`). The check `modifier && event.shiftKey && !event.altKey` doesn't look at AltGraph. So Ctrl+AltGraph+Shift+Space, with `altKey` false, still moves the insert marker and calls `preventDefault`. That breaks doc 199's rule that "an Alt or AltGraph chord is never a command chord anywhere in `handleKeyDown`". C found the same thing (C-R268-01). This round froze that branch, and it only matters on a platform that sends AltGraph without `altKey`, so it doesn't block. **Fix (next round):** use `!event.getModifierState('AltGraph')` in that condition, plus the matching keyup arm around `:2591`. The other option is to narrow the wording in doc 199.
2. **Low: the plain-letter branches only check `!event.altKey`** (`:2463`, `:2470`, `:2477`, `:2484`, `:2492–2517`). If AltGr arrives as AltGraph with no `ctrlKey` and no `altKey` (an unconfirmed Linux X11 guess, B-R266), AltGr+M, G, A or U would run plain shortcuts. Doc 199 already lists this as an open question. **Fix (only after a real repro):** build one `plainKey = !modifier && !event.altKey && !event.getModifierState('AltGraph')` and use it in those branches.
3. **Nit: a redundant check** at `:2449`. `commandChord && key === 'g' && !event.altKey` already excludes `altKey` through `commandChord`. **Fix:** drop the `&& !event.altKey`.
4. **Real-browser behaviour change (intended, worth knowing):** on Mac, Cmd+Option+Arrow during a pointer gesture used to hit the gesture block and get `preventDefault`. Now it passes through, and Chrome uses that chord to switch tabs. A tab switch in the middle of a drag depends on the existing pointercancel/blur cleanup in the gesture lifecycle; this diff doesn't change that cleanup. Doc 199 records the change as accepted, and C ran MAC-ALT-ARROW. No action needed, but don't count this as a reason to touch the gesture lifecycle.
5. **Test caveat:** AG6, AG7 (AltGraph-only variant) and AG8 build `modifierAltGraph` without `altKey` in jsdom. As doc 199 says, they lock the contract but don't prove any real platform sends that combination. Real Windows AltGr hardware (TLM-R232-ALTGR-WIN) is still with Saba.

### Suggestions
- Do findings 1–3 as one small polish task: `commandChord` plus a `plainKey` predicate, so the "no Alt/AltGraph" rule lives in one place and not in five forms.

### Good Practices Found
- One boolean `commandChord` replaces 11 separate edits, and the `if (modifier) return;` stop at `:2460` deliberately stays on `modifier`. That keeps AltGr chords out of the plain G/M/A branches, and the M-RETURN mutant proves it.
- Alt chords now skip `preventDefault`, so AltGr characters (ż, ę, €) reach the browser. The tests assert `dispatchEvent === true` and end each row with a plain-Ctrl positive control on the same mount.
- No new listener, timer, state or render path; render cost and leak risk are unchanged. TS strict holds: no `any`, no assertions (`as const` is only used for literal tuples), and semicolons are present. No UI or Tailwind changes, so accessibility is unaffected.
- `verify.log` shows 3221 tests passing and the build succeeding. C ran the browser rows (GESTURE-ARROW, NOGESTURE-ARROW, MAC-ALT-ARROW).
- The KeyO overview branch (`:2247–2253`) already checked AltGraph, and this diff matches it.

### Architecture note
- Signal 3 (one region changed repeatedly at high cost): the `handleKeyDown` modifier checks, `StudioWorkspace.tsx:2268–2460`. Rounds 266–268 each changed modifier predicates here, and each round needed new mutants and a contract test file. **Keep for now:** the handler is a single ordered dispatch, and the branch order matters (gesture block → command chords → `modifier` stop → plain keys). Moving it out would put that ordering and the gesture lifecycle at risk.
- **Proposal for the planner (not scope for this round):** move only the modifier classification into one pure function in `app/lib/arrangement/` that returns `'command' | 'alt-chord' | 'plain' | 'other'` from `{ctrlKey, metaKey, altKey, shiftKey, altGraph}`. Unit-test it as a table. The handler would change only its predicates; branch order and `useArrangement()` stay the same. Acceptance: existing L46 and GATE264-S2 tests pass unchanged, and findings 1–2 are fixed with that function. Cost: low; risk: low.

### Alternative Approach
- **Current:** a local `commandChord` that requires no Alt and no AltGraph, with an early return on `modifier`.
- **Alternative:** the shared pure classifier above, or registering shortcuts in a declarative keymap table.
- **Verdict:** the current approach is the right size for a bug fix. It's minimal, mutant-proven and keeps the ordering. A keymap table would be a rewrite and risks the event ordering and gesture-block behaviour that tests can't fully cover. The pure classifier is worth doing only if the Space / plain-letter work (findings 1–2) goes ahead.

### Score: 8.5/10