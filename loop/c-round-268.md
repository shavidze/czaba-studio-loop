# C round 268 — GATE264-S2 fix-up (C-R267-01): **PASS**

`browserVerified` = `realVerified` = **true**. Chromium (Playwright) on `http://127.0.0.1:5173/studio-lab`, fresh anonymous contexts, 1440×900 and 1280×720, 0 page errors. Source was read-only; no app edits. Scratch `/tmp/c268-scratch` was deleted after the mutants ran.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS with note. HEAD is `e937046`, not `7ba7cd2`. Root's commit added only `.claude/agents/product-designer.md` and `.codex/agents/product-designer.toml`; `git diff 7ba7cd2 HEAD` touches no app file. `git status --porcelain` lists exactly the 3 grant paths. | `c-round-268/claims.txt` |
| HUNK-SCOPE | PASS. `git diff -U0`: 13 `+` / 12 `-` lines = round 267's declaration and 11 substitutions, plus 1 substitution at tree l.2421 (`!event.getModifierState('AltGraph')` added to the Ctrl arm). All hunks lie in l.2270–2449, inside `handleKeyDown`. The test file diff against the planning snapshot is `467a468,530`, with 0 `<` lines (add-only, no import change). | above |
| CLAIMS | PASS. K2–K20 match verbatim. K1's HEAD hash differs only because of the root drift noted above. L29 would make this a planning FAIL; C applies an explicit exception because the drift is root's agent-file commit and the app code is byte-identical (`git diff 7ba7cd2 HEAD` verified). The L29 grep over the task found no untagged fact about store code (the "Cause" list is tagged `[K2, K3, K4, K8]`). | `claims.txt` |
| TESTS-TARGETED | PASS. 13 files, **236/236**. `meta-shortcuts-ui` alone: 30/30, slowest 508 ms; AG7 and AG8 are well below 2.5 s. Biome on the 2 changed files is clean. | `vitest-targeted.txt`, `vitest-meta-verbose.txt` |
| MUTANTS | PASS. M-ARROW turns AG7 (Ctrl+AltGraph) and AG8 red. M-ARROW-ALT (drops `!altKey`, C's extra) turns AG7 Ctrl+Alt red. M-GESTURE turns AG5 and **all 4** AG7 variants red. M-AG turns AG6 and AG7 (Ctrl+AltGraph) red. BRANCH-z turns AG1 ×3 and AG6 red, BRANCH-e turns AG2 ×3 and AG5 red, BRANCH-l turns AG3 ×3 red. The unmutated control is 30/30. | `mutants-summary.txt`, `mutants-rows.txt`, `mutants-*.txt` |
| GESTURE-ARROW | PASS at both viewports. During a held real-mouse drag:<br>• Ctrl+AltGraph (no alt), Ctrl+Alt, Meta+Alt and Ctrl+Alt+AltGraph (dispatched): marker stays 7.500, `dispatchEvent` returns true, no blocked message, status unchanged.<br>• Real `Control+Alt+ArrowRight`: marker stays 7.500, no message.<br>• Plain Ctrl, dispatched and real: blocked message shown, marker stays 7.500, the dispatched event returns false. | `c-round-268/probe-arrow-c268.json` (+png) |
| NOGESTURE-ARROW | PASS at both viewports. Ctrl+AltGraph (no alt) and every Alt variant: marker stays 7.500, the dispatched events return true. Plain Ctrl+ArrowRight, dispatched and real: marker moves 7.500 → 101.352, and the dispatched event returns false. | same |
| MAC-ALT-ARROW | PASS. With a MacIntel UA and platform, real Alt+ArrowRight moves the marker 7.500 → 101.352 at both viewports. | `probe-mac-alt-c268.json` |
| R267-ROWS | PASS at both viewports:<br>• **FOCUS-ALT:** AltGr Z/E/L on the focused option keeps focus; 0 clips; not prevented.<br>• **ALTGR-UNDO:** AltGr+Z, +Shift+Z and +Y leave clips at 1, not prevented.<br>• **CTRLALT-REAL / META-ALT-REAL:** Z/E/D do nothing.<br>• **ALTGR-EDIT:** E, L, Shift+L, A, D, C, X, V and G leave clips, marker, loop and status unchanged; not prevented.<br>• **POS-CTRL:** 1 = Ctrl+Z undo (1→0); 2 = Ctrl+Shift+Z redo (0→1); 3 = Ctrl+E split at 07.500 (1→2); 4 = Ctrl+L with no selection shows the hint; 5 = Ctrl+Alt+O hides, then shows, the Overview. | `c268-browser.json`, `c268-<vp>.png` |
| DOC-199 | PASS. l.4 is byte-exact `**სტატუსი:** Completed (C round 268 PASS)`. The 7 TEMPLATE headings are in order (l.7, 13, 28, 45, 51, 65, 82). AG1–AG8 each exist in the test file. The TODO now says "გადაწყდა რაუნდში 268" and no longer says the STOP awaits B. | — |
| G268-AUTH | PASS.<br>• `/studio-lab`: 4 lanes, demo notice shown, `auth_user` null, no cookies.<br>• `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 audio or token requests.<br>• `/api/studio-token` with no header: 401, no token.<br>• Fake bearer: 500 "Unable to prepare Studio access", no token. This matches round 267; the backend is not available in the cloud. | `c268-auth-*.png`, `c268-browser.json` → `auth` |
| Gate rows | **gate**, not claimed: full vitest, build, Biome full, `npm run verify`, e2e smoke. | — |

## Notes for B
- **INFO-C268-HEAD-DRIFT:** see SOURCE-SCOPE. Future K1 claims should read the HEAD at dispatch.
- **INFO-C268-PROBE-LOAD:** the first `probe-arrow` attempt timed out waiting for the demo to become ready, because C's vitest and mutant runs were loading the machine at the same time. The attempt is environment-invalid and kept in `probe-arrow-attempt1-invalid.log`. The re-run alone was valid; 1 replacement attempt was used.
- **C-R268-01 (Low; same as A's reviewer finding A-R268-REVIEW-SPACE-ALTGRAPH), reproduced in the browser.** During playback, a dispatched Ctrl+Shift+AltGraph+Space (`altKey` false, keydown and keyup) moves the insert marker 0.000 → 1.483 with "Insert marker moved to the playhead…". Both events are prevented. The result is the same at both viewports, and plain Ctrl+Shift+Space behaves identically (1.459). It is contract-only, like AG6. The Space arm is unchanged since HEAD (code read; not measured at HEAD) and frozen by §2.1.2, so it is not a changed-path finding and does not fail the round. B should either move it to `deferred_low_polish` or narrow the D-29z572 wording ("anywhere in handleKeyDown"). Evidence: `c-round-268/probe-space-altgraph.json`.
- A's Architecture note (`classifyChord` helper, keep for now) is passed on unchanged.
- In the c267-style `gesture` block of `c268-browser.json`, the blocked status carries over between steps, so it cannot tell the chords apart. `probe-arrow-c268.json` resets the state before each case and is the authoritative evidence for GESTURE-ARROW.

## Ableton conformance (separate from CZABA requirement)
- **Ctrl+Alt+letter is a different command:** confirmed, using B's cited Live 12 manual ch. 42. C did not re-fetch the manual this round.
- **Ctrl+Arrow marker step outside a drag:** this is CZABA's edge navigation, accepted in earlier rounds. SABA-Q-10A stays with Saba.
- **Alt or AltGr + Arrow during a drag:** no source, not judged.

## Scope not covered
- Audio graph, export WAV and video transport: this round's change is one keyboard guard and does not reach them, so they were not re-measured. That is not a claim that they pass this round.
- Real Windows AltGr hardware stays with the Tech Lead (TLM-R232-ALTGR-WIN).
