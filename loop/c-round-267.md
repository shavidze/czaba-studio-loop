# C round 267: GATE264-S2 (Alt/AltGr + Ctrl/Cmd letter shortcuts)

**Verdict: FAIL.** `browserVerified` and `realVerified` are true.
- Every acceptance row of §4 passes: the browser rows at 1440×900 and 1280×720, the claims, the targeted tests and the mutants.
- The round still fails. A handed it over as a **STOP** (`a-round-267.md` l.3), and C reproduced that STOP in the real browser as a **Medium regression in a changed hunk**, measured against a HEAD control server.
- Under D-29z568 this calls for a fix-up with the same grants. Under L10, B rules on the STOP (fix option (a) or (b), and the Arrow rows 2–4) before the round is re-dispatched.

Environment: `env-status.json` (store 200, round 267). Store dev server is :5173. The HEAD control was `git archive 7ba7cd2` in `/tmp/c267-head`, served on :5174 and stopped after use. The tree is unchanged by C: 2 ` M` and 1 `??`, the grant paths only.

## C-R267-01 (Medium): during a pointer gesture, Ctrl+AltGraph (altKey false) + Arrow moves the insert marker
**Repro** (`c-round-267/c267-gesture.mjs`, run on both servers at both viewports):
1. Open `/studio-lab` anonymous and wait for "Demo collection ready".
2. Press Enter on the first option, which adds 1 clip.
3. Click 300 px into the clip. The marker is at 7.500.
4. Press the mouse on the clip and move it 6 px, holding the button.
5. Dispatch `keydown {key:'ArrowRight', ctrlKey:true, modifierAltGraph:true}` on `document.body`.

| Chord during the held drag | HEAD 7ba7cd2 | Diff |
|---|---|---|
| Ctrl+AltGraph, altKey false | marker 7.500, blocked message, prevented | **marker 7.500 → 101.352 (the clip end), no message, prevented** |
| real `Control+Alt+ArrowRight` | blocked message | silent, marker unchanged |
| real `Meta+Alt+ArrowRight` | blocked message | silent, marker unchanged |
| Ctrl+Alt+AltGraph (dispatched) | blocked message, prevented | silent, not prevented |
| real `Control+ArrowRight` (control) | blocked message | blocked message |

**Cause.**
- l.2324 now tests `commandChord`, so the gesture arm no longer catches the Arrow alternatives for this chord.
- The Ctrl+Arrow branch (`(event.ctrlKey && !event.altKey)`, unchanged) then runs `stepMarker` mid-gesture.

This matches A's trace and jsdom probe.

**Reachability.** C ran a fact probe (`c267-browser.json` → `platformProbe`) in headless Chromium 143 on Linux. Playwright `keyboard.down('AltGraph')` produced `altGraph=false`. With Control held, it gave `ctrl=true, alt=false, AltGraph=false`.
- So C could not produce the row-1 state with real input here.
- The state is the task's own contract state (AG6). It is not proven on a real platform.
- C keeps the code-reviewer's Medium because the hunk turns a blocked gesture into a marker move. B may re-rate it when ruling.

Rows 2–4 are Info: a consistent extension of the rule, but missing from §2.1.3.

**Planning gap, for B:**
- §2.1.2 put `commandChord` on the whole arm, including ArrowLeft and ArrowRight, while §2.1.3 froze the Ctrl+Arrow branch.
- §3 "At risk" did not list gesture + Ctrl+Arrow, and the pre-check probe had no gesture row.

A proposes AG7 (`a-round-267.md` l.26) as the row for the ruling.

## Acceptance rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: HEAD `7ba7cd2…`; ` M` StudioWorkspace.tsx, ` M` meta-shortcuts-ui.test.tsx, `??` doc 199 | `c-round-267/claims.txt` |
| HUNK-SCOPE | PASS: 1 added line (l.2270 `commandChord`) and 11 substitutions (l.2324 and e/z/y/l/a/d/c/x/v/g), all inside 2206–2584. Test diff: 0 removed lines, one import name added | `git diff -U0` (in this report's session) |
| CLAIMS K1–K16 | PASS: all outputs match verbatim, including K10 sha `fc9a6b9e…`/318 and K15 `20`/`0`/`2263 2341 2566`. L29 grep over the task: no untagged code fact (hits are grants, expected values or claim rows) | `c-round-267/claims.txt` |
| TESTS-TARGETED | PASS: 13 files, **231/231**. `focus-source-typing.test.tsx` is in `app/lib/__tests__/`, as A noted | `c-round-267/vitest-targeted.txt` |
| MUTANTS | PASS: on C's own scratch `/tmp/c267-scratch`, see the list below the table. Control (unmutated) 25/25 | `c-round-267/mutants-*.txt`, `mutants.log` |
| ALTGR-UNDO | PASS ×2 viewports: AltGr Z, Shift+Z and Y leave clips 1→1 with the status unchanged; `dispatchEvent` returns true each time | `c267-browser.json` |
| ALTGR-EDIT | PASS ×2: after a click at +300 px (marker 7.500), AltGr E, L, Shift+L, A, D, C, X, V and G leave clips 1, loop `aria-pressed="false"`, 0 groups, marker 7.500, status unchanged, not prevented | same |
| CTRLALT-REAL | PASS ×2: `Control+Alt+KeyZ`, `KeyE` and `KeyD` leave clips and status unchanged | same |
| META-ALT-REAL | PASS ×2: `Meta+Alt+KeyZ` and `KeyE` leave clips and status unchanged | same |
| POS-CTRL | PASS ×2, see the list below the table | same, `c267-1440x900.png`, `c267-1280x720.png` |
| FOCUS-ALT | PASS ×2: the first library option stays `activeElement` after AltGr Z, E and L; clips stay 0 | same |
| DOC-199 | PASS: l.4 is byte-exact `**სტატუსი:** Completed (C round 267 PASS)` (a pending claim, false while this round is FAIL); the 7 TEMPLATE headings are in order; AG1–AG6 all exist in the test file | `claims.txt` |
| G267-AUTH | PASS, see the list below the table | `c267-browser.json` → `auth`, `c267-auth-*.png` |
| Gate rows (full vitest, build, Biome full, verify, e2e smoke) | **gate**, not claimed | — |

**MUTANTS:** each mutant turned its named rows red.
- M-ALT: 8 rows red, the Ctrl+Alt and Meta+Alt variants of AG1–AG4.
- M-AG: AG6.
- M-GESTURE: AG5.
- M-RETURN: AG6.
- BRANCH-z: AG1 ×3 and AG6.
- BRANCH-e: AG2 ×3 and AG5.
- BRANCH-l: AG3 ×3.
- BRANCH-d: AG4 ×3.
- BRANCH-v: AG4 ×3.

**POS-CTRL**, in order:
1. Ctrl+Z: clips 1→0, "Undo: Add — Middle East — საჯარო preview".
2. Ctrl+Shift+Z: clips 0→1.
3. Ctrl+E: 1→2, "Clip split at 00:07.500.".
4. Ctrl+L: "To set a loop, first make a time selection (drag in a lane).".
5. Ctrl+Alt+O twice: "Overview hidden. Ctrl+Alt+O shows it again.", then "Overview shown. Ctrl+Alt+O hides it.".

0 page errors.

**G267-AUTH:**
- `/studio-lab`: 4 lanes, the demo notice is shown, `auth_user` null, 0 cookies.
- `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 audio or token requests.
- `/api/studio-token`: 401 with no header. A fake Bearer gets 500 "Unable to prepare Studio access" and no token.
- Premium auth is not bypassed.

Audio, export and video paths are not touched by this diff (keyboard handler only), so no export measurement was re-run this round.

## Ableton conformance (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Ctrl/Cmd+Alt+letter runs no Ctrl command | **confirmed** (Live 12 manual §42.1/§42.12/§42.16/§42.19: Ctrl+Alt+letter is a different command) |
| AltGr character press runs nothing | **unconfirmed** (no source) |
| Plain Ctrl+Z/Y/E/L/A/D/C/X/V/G | **confirmed** (§42.5, §42.16, §42.19) |
| Ctrl+Alt+Arrow during a drag | **no source**, not judged |

## For B
1. Rule on A's STOP and C-R267-01: fix option (a) or (b), the expected status and prevented state for Arrow rows 2–4, and AG7. Then re-dispatch with grants. Fix (a) would also remove the outside-gesture case: Ctrl+AltGraph (no altKey) + ArrowRight steps the marker 7.500 → 101.352. **Measured on the diff only** (`c267-browser.json` → `gesture.noGestureCtrlAltGraphArrow`). The branch is unchanged, so the same is **inferred** at HEAD; it was not measured there.
2. Doc 199 l.4 must stay pending until a PASS. Its TODO already lists the STOP.
3. On re-dispatch, C will repeat `c267-gesture.mjs` on both servers.
