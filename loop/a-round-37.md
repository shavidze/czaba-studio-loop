# A — Round 37 report: C-R36-01 (D-29z2) + round-36 test nits + doc 036

Implementer: A (Claude Opus 5.5) · Date: 2026-10-13 · Raw outputs: `a-round-37/`
No PASS claimed. C re-runs everything.

## 1. Pre-flight gate (incl. §1.4 re-check)

- Read: `.claude/rules/read-primitives.md`; primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (+ DESIGN_TOKENS, TAILWIND_FIRST injected by hook); `prompts/studio-feature.md`; `skills/pre-flight`.
- Assumptions: the fix is exactly the §2.1 branch; Enter-during-gesture contract (frozen `clip-gain.test.tsx` l.815) stays; the selection-change discard stays (remount key).
- Smallest version: 2 source lines added (wrap in `if (trigger === 'enter')`), 3 pin lines, 1 nested describe (5 `it`), doc edits.
- Files: `ArrangementDetailPanel.tsx` (the bug), `fader-guards.test.tsx` (red-first tests + nits), doc 036 (B §2.2). Nothing else.
- Success: red `3 failed | 68 passed (71)` → green 71/71; full vitest 1264.

Baseline (before any edit): HEAD `1cefea18500a…`; `git status --short` = the 9 baseline lines; `b-round-36-tree-sha256.txt` non-OK count **0**; snapshots `60d24bb0` / `ca3153ad` / `d5f206c1` all match; protected 4/4 OK; node.exe **7**. Root had not committed.

§1.4 re-check:
- No existing test blurs the Clip Gain field during an active gesture and expects reset. `fireEvent.blur` hits on Clip Gain: `clip-gain.test.tsx` l.696/700/762/764 (no gesture), `fader-guards.test.tsx` l.1158/1502 (no gesture), l.1572 (after release). gesture-guard l.447/484/522 blur Volume, not Clip Gain. ✔
- Round-36 case 10 (l.1556–1575) blurs after release; green before and after the fix, bytes unchanged (0 `-` lines in the diff). ✔
- Remount key present: `ArrangementDetailPanel.tsx` l.801 `key={selection?.clip.id ?? (group ? 'group' : 'none')}`. ✔
- `DETAIL_CLIP_GAIN_INVALID_MESSAGE` (l.52) = `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).` and the emptied-text blur gives exactly it (case 7 pin green). ✔

## 2. Red run and green run

Red (`ArrangementDetailPanel.tsx` sha re-checked `60d24bb0` immediately before; `a-round-37/red.txt`):
```
 FAIL … C-R36-01 … > "3" typed → blur during the gesture keeps "3" … Enter after release commits +3.0 dB once
AssertionError: expected '0.0' to be '3'
 FAIL … C-R36-01 … > "3" typed → a second-pointer Master press and the native blur keep "3" … the blur after release commits once
AssertionError: expected '0.0' to be '3'
 FAIL … C-R36-01 … > emptied text → blur during the gesture keeps "" … Enter after release gives the invalid status and resets
AssertionError: expected '0.0' to be ''
 Test Files  1 failed (1)
      Tests  3 failed | 68 passed (71)
```
Exactly N1–N3 red; N4, N5, both pinned cases and all others green — as B predicted.

Green after §2.1 (`a-round-37/green.txt`):
```
 Test Files  1 passed (1)
      Tests  71 passed (71)
```

## 3. Diff summary per file (vs `b-round-36-snapshots/`)

- `app/components/arrangement/ArrangementDetailPanel.tsx` (`60d24bb0` → `a48523be`): one hunk @@ -332,7 +332,9 @@ — `setClipGainText(currentText);` wrapped in `if (trigger === 'enter') { … }`. Nothing else. (`a-round-37/diff-panel.txt`)
- `app/lib/arrangement/__tests__/fader-guards.test.tsx` (`ca3153ad` → `3d120483`): **0 `-` lines**, 98 `+` lines: 1 pin in case 7 (`expect(blurStatus).toBe('Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).')`), 2 pins in case 8 (`expect(start.value).toBe('4.5')` after each `range` check), one nested describe `'C-R36-01: a blur during another pointer gesture keeps the typed Clip Gain text (D-29z2)'` with 2 local helpers (`startSeparatorGesture`, `releaseSeparatorGesture`, both assert the gesture flag), a local `INVALID_STATUS` literal and 5 `it` (N1–N5 per B's table), appended before the round-36 describe's closing line. N5 asserts end state only (per B's table; a mid-test `'3'` pin would have made it red pre-fix). (`a-round-37/diff-fader.txt`)
- `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` (`d5f206c1` → `294326f8`, after review fixes): header status line (l.4); in the l.436 sentence only `ბრაუზერში არ შემოწმებულა` → `C-მ round 36-ში ბრაუზერში გაიმეორა (C-R36-01, \`c-round-36/runs/ot.txt\` OT-5b) და round 37-ში გასწორდა (D-29z2)`; appended `## Round 37 — სხვა gesture-ის დროს blur Clip Gain-ის ტექსტს აღარ შლის` (steps/cause, D-29z2 table, decisions 1–5 with rejected B/C, Enter/blur asymmetry, selection limitation, stale status → 4b, tests + pins + red/green numbers, C IDs, Ableton §4.6 note; + post-review: corrected row 5, the kept-text-looks-committed paragraph, the supersede sentence; the l.436 clause now uses a comma instead of a second "და"). (`a-round-37/diff-doc.txt`)
  - Note for B: the remainder of the l.436 sentence still says the path "ღიად რჩება (A-R36-REVIEW-1 … შესაძლოა ეტაპი 4b)". §2.2.1 allowed only the one clause, so it was left; the appended section states the fix. B may want a later one-clause touch-up.

## 4. code-reviewer findings and dispositions

The `code-reviewer` subagent actually ran (read-only, no shell, score 8.5/10, no Critical). Findings and dispositions:

| # | Sev | Finding | Disposition |
|---|---|---|---|
| R1 | Medium | Doc l.436 now says the bug is fixed, but the same sentence still ends "…ღიად რჩება (A-R36-REVIEW-1 …; შესაძლოა ეტაპი 4b)". Nit: two "და" in a row. | **Partly fixed, inside the append only.** §2.2.1 allowed one clause, so the tail is untouched. A sentence was added in the Round 37 "შეზღუდვა" part saying this section replaces that tail. **B:** decide whether a one-clause amendment of the tail is allowed (DOC036-R37-TAIL). |
| R2 | Low | Contract row 5 ("normalised-equal text blurs during a gesture → early return") is wrong. l.330 compares raw text, so `3.00` against a stored `3.0` gets past the early return and shows the blocked status during a gesture (and is now kept). | **Doc corrected** (the appended D-29z2 table row now describes the text comparison). Code unchanged (out of scope). **B:** amend the D-29z2 row 5 wording in plan/task, or queue a normalised comparison. C's R37-MN row 2 uses `0.0` (exact text), so it is unaffected. |
| R3 | Low | After the gesture the kept text shows no dirty marker. The round-34 capture releases only a focused field, so a later fader press does not commit it; it commits on the next focus+blur/Enter. | **Documented** in one sentence in the appended "შეზღუდვა" part (panel collapse uses `hidden`, so it does not lose the text). This is a UX follow-up for B (possibly 4b). |
| R4 | Low | N5 does not assert that `'3'` was kept before the selection change, so it passes on the old source too. | **Not changed.** B's table requires N5 to be green in the red run (3 red); a mid-test `'3'` pin would make 4 red. N1 already covers keeping the text. Left for B. |
| R5 | Low | `fireEvent.blur` does not move `activeElement`, so `field.focus()` in N1/N2 does nothing. `controls.master().focus()` would model the browser better. | **Not changed** (B's §2.3 steps are explicit). C's R37-PG uses real focus moves. Possible test hardening for B. |
| R6 | Nit | The invalid literal appears 3× (l.905 is a sibling constant out of scope; l.1504 pin; l.1608 local). | Accepted: the l.1504 literal is what makes mutation (e) bite. |
| R7 | Nit | Older text l.468 says "ეტაპ 4b (round 37)"; the new section says round 38. | Not A's (earlier section frozen). B: DOC036-ROUND-REF. |

Reviewer caveats: it did not run tests and did not byte-diff the files. A's diff shows **0 `-` lines** in fader-guards (`a-round-37/diff-fader.txt`). The reviewer judged by reading that mutations (a)–(e) each fail a test, and that (d) also fails N4. C must confirm this by running them.

After the doc fixes: doc sha `294326f8`; diff hunks are still header / l.433 / append (`@@ -466,3 +466,70 @@`); `git status --short` is still 10 lines. The doc change touches no code or test, so the code gates above were not re-run.

## 5. Command tails (node.exe recorded)

| Gate | Result |
|---|---|
| node.exe | 7 (start), 11 (red run), 7 (related/full), 6 (end) |
| red fader-guards | 3 failed \| 68 passed (71) |
| green fader-guards | 71 passed (71) |
| related 11 files (§5 list) | `Test Files 11 passed (11)` / `Tests 253 passed (253)` |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | `Test Files 69 passed (69)` / `Tests 1264 passed (1264)` |
| `npm run build` | exit 0, `✓ built in 2.89s` |
| `npx biome check --write` (2 owned TS files) | `Checked 2 files … No fixes applied.` |
| `npx biome check ./app` (read-only) | `Found 2 errors. Found 218 warnings. Found 1 info.` — errors only `app\lib\auth.ts format`, `app\lib\__tests__\bug-hunting\auth-bugs.test.ts format` (baseline CRLF, root's); 0 diagnostics mention the owned files |
| `npm run verify` | exit 0 (lint step `Checked 338 files … No fixes applied.`, vitest 1264/1264, build ✓) |
| `sha256sum -c b-round-36-tree-sha256.txt` non-OK | 0 (376 OK) |
| protected 4/4 | OK ×4 |
| HEAD start / end | `1cefea18500a…` / `1cefea18500a…` |
| `git status --short` end | 10 lines = 9 baseline + ` M app/components/arrangement/ArrangementDetailPanel.tsx` |

Not run: `npm run test:e2e:smoke` (starts its own dev server — root only). Mutations (C's; optional for A) not run. Browser smoke on 127.0.0.1:5173 not run (optional per §5; skipped — no browser evidence claimed).

## 6. Deviations and §2.4 self-check

- Deviations: none from §2.1/§2.2/§2.3. Two small local helpers inside the new nested describe (`startSeparatorGesture`, `releaseSeparatorGesture`) — test-local, used by all 5 cases; no existing helper touched.
- Self-check: frozen `clip-gain.test.tsx` (incl. l.815–831), `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `gesture-guard.test.tsx`, `master-ui.test.tsx` green (in the 253/253 run); round-36 case 10 green and byte-identical; full vitest 1264/1264.
- Edge cases reviewed: unchanged-text blur during gesture still early-returns before the gesture check (l.330); Escape still resets via `handleClipGainKeyDown`; selection change discards via remount; the 0 dB reset path untouched.

## Scope completed / B acceptance

A-side items done: §2.1, §2.2, §2.3 (red-first evidence), §2.4 gates. All §4 acceptance IDs (R37-PG, R37-MN, R37-CR, R37-K, R37-S, R37-U mutations, R37-Doc, G37-1..3) are **C's** and not claimed here.

## Exact next C checks

1. R37-S: `diff -u` the 3 files vs `b-round-36-snapshots/` → panel one hunk; fader-guards 0 `-` lines; doc header + l.436 clause + append.
2. R37-U: re-run fader-guards (71) and the mutations (a)–(e) in a scratch copy outside `store/`.
3. R37-PG PG-1/2/3 + PG-1280 on `/studio-lab` (synthetic separator 41 + real Master click → field stays `3`).
4. R37-MN (Enter during gesture resets; unchanged text early-return; invalid `-` kept during gesture then invalid on Enter; `-` + Tab without gesture).
5. R37-CR, R37-K, G37-1..3.

## Carried for C/B (root items unchanged)

From `root-pre-push-review.md` / `publication-checkpoint.json` (per B §4.8): rounds 31–34 + 36 ready for root's checkpoint commit (commit after C passes round 37, not mid-round); `test:e2e:smoke` root-only; SRW-21 middle-east loader; Lenis on `/studio/*`; CRLF Biome errors on auth files; `Modal.tsx` focus gap; fake Bearer → 500; dev-server availability; others as listed in B §4.8. Stale blocked status after the gesture (C-R31-INFO-REFUSAL-STATUS) remains for 4b.

## Note for C (R37-Doc)

The doc and B's wording differ on D-29z2 row 5. The doc describes the raw-text comparison at l.330: `3.00` against a stored `3.0` gets past the early return. B's §0 and plan wording say "normalised-equal". The code is unchanged and B should amend the wording. This is not a doc FAIL. C's R37-MN row 2 uses the exact text `0.0` and is unaffected.
