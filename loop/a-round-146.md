# A round 146 — V-0.5a fix-up (C-R145-01 / ABL-B-1 + two V-0.5a test-strength Lows)

STATUS: A done; C pending. Nothing committed, pushed or stashed. HEAD unchanged.

## Start checks (all OK)
- HEAD `9a67abd78b41162262c0882544dbdd4544afef1b`; `git status --short` = 15 ` M` + 2 `??` (round-145 set).
- Frozen list `b-round-145-r146-tree-sha256.txt` (960): OK. 5 grant start hashes: OK. 5 start copies: `cmp` equal. `a-round-145/end-sha256.txt`: OK.
- Before the first Edit I read: the pre-flight skill, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `DESIGN_TOKENS`, `TAILWIND_FIRST`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `GEORGIAN_DOCS`.

## Changed files (the 5 grants only)
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | PM1 only. The marker span moved out of the meta row. It is now the last child of the `role="option"` button, with className `whitespace-nowrap text-xs text-brand` and testid `arrangement-library-option-previewing`. The meta row's className and both of its children are byte-identical. `diff` vs the start copy shows only the moved span. The JSX is written in the multi-line form Biome expects, with no `--write`. |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | +1 `it` **LRS3**, after LRS2. LRS1 and LRS2 are byte-unchanged. |
| `app/data/__tests__/studio-lab-demo.test.ts` | +1 `it` **DL-VAL**. In 4 titles (DL1, DL2, DL3, DL5-decode) the word `Georgian` became `English`. |
| `app/lib/arrangement/__tests__/collection.test.ts` | PC2: the three `.toThrow(Error)` are now `.toThrow('<exact full message>')`. The title and fixtures are unchanged. |
| `docs/implementation/2026/quarter-IV/119-studio-v0-library-source-strings.md` | The status line (exact §2 text); a new Problem → Solution bullet (C-R145-01/ABL-B-1, why the marker gets its own line, why `flex-wrap` was rejected: the B probe); one sentence appended to the m91 bullet (D-29z111 spec error); Testing: the real round-145 C result and one round-146 line; "შეცვლილი ფაილები" + 4 round-146 files. Georgian. |

## What the tests assert
- **LRS3:** before the preview, the `song` row has 0 markers. After the preview starts, it has exactly 1, with text `▶ Playing` and className `whitespace-nowrap text-xs text-brand`. Its `parentElement` is the `role="option"` button (`libraryRow(view,'song')`), and it is the button's `lastElementChild`. The `broken` row has 0 markers. The meta row is the child whose text contains `00:20.000`. It does not contain the marker, has exactly 2 children, and its classes include `flex` and not `flex-wrap`. Its full className is `flex gap-2 text-xs tabular-nums text-muted`, and its `nextElementSibling` is the marker. After stop, the marker is gone. All literals are hand-written.
- **DL-VAL:** exact `label`, exact `notice`, and the exact Set of `collectionLabel` = {`CZABA public previews + synthetic SFX`, `Synthetic demo · ღამის პულსი`}. The codepoints are checked on the data with `String.fromCodePoint(0x00b7)` / `(0x2014)`. The file has exactly 1 Georgian line (the allowed R3 literal).
  - Note: the Edit tool turned `·`/`—` escape sequences into the literal characters. I therefore used `String.fromCodePoint` so that the check does not depend on the test's own literal.
- **PC2:** `'The purchased collection has no stems'`, `'A stem id repeats in the purchased collection'`, `'The purchased collection has no productId'`. `toThrow(string)` matches a substring, which §3.3 explicitly accepts.

## Commands actually run
- `npm run typecheck`: exit 0. `npm run lint`: exit 0 (existing warnings only). Read-only `npx biome check` on the 4 code/test files: "Checked 4 files … No fixes applied", 0 diagnostics.
- `npx vitest run` on the 10 listed files: **128/128 passed** (`a-round-146/vitest.json`, re-run after the review fixes). Runtime `it` counts:
  - These two changed, and they are the only allowed changes: library-row-strings-ui 3 (round 145: 2), studio-lab-demo 13 (12).
  - Unchanged vs round 145: strings 48, library 12, collection 14, collection-load-status 10, purchased-collection-ui 6, library-preview 7, held-enter-add 8, render-budget 7.
- Mutations: each one was made with Edit, the target test was run, Edit restored it, and sha256 confirmed the restore.
  - **m97** (marker back inside the meta row, keeping its testid so that only its position changes): LRS3 red (`parentElement`). Restored; hashes equal post-edit.
  - **m98** (meta row + `flex-wrap`): LRS3 red. Restored.
  - **m99** (`studio-lab-demo.ts` notice `—` → `-`): DL-VAL red. Restored; frozen list OK.
  - **m100** (`purchasedNoStems` → `…no stem`): PC2 and ST45 red. Restored; frozen list OK.
  - After the review tightening, I re-ran m97 and m98 against the final LRS3. m97 is red at l.213 (`parentElement` is the meta span, not the button). m98 is red at l.224 (`not.toContain('flex-wrap')`). Both are restored, and `end-sha256.txt` and the frozen list are OK.
- Read-only Biome on the 4 files: exit 0. Sorted `git status --short` is saved in `a-round-146/git-status.txt` (17 lines) for C to diff against round 145.

## Notes for B
- The exact className pins in LRS3 (marker `text-brand`/`text-xs`, meta row `text-muted`) mean VISUAL-A-OBSIDIAN token changes must also edit LRS3. This is a maintenance consequence, not a defect.
- Probe datum for LAYOUT-LIB (ii): the marker's glyph extent is 54 px wide (task text said 42 px for the marker), and the previewing option height is 63.25 (predicted 63.5). Both are inside tolerance.
- End checks:
  - Frozen list OK.
  - HEAD unchanged. `git status --short` = 17 entries, all ` M` or `??`; no new path.
  - Only the 5 grants differ from `a-round-145/end-sha256.txt`.
  - `git diff 9a67abd` on the protected files: empty.
  - End hashes: `a-round-146/end-sha256.txt`. Diff: `a-round-146/diff-vs-start.patch`.
- Not run (gate): full suite, `npm run verify`, build, e2e.

## Code review (real `code-reviewer` subagent, score 8.5/10, no Critical/High)
- Medium: LRS3 did not pin the marker className → **fixed** (exact `toBe`).
- Low: it did not prove the marker is the last child → **fixed** (`lastElementChild`, `nextElementSibling`).
- Low: the meta row was checked only for `flex`/no `flex-wrap` → **fixed** (full className `toBe`).
- Low (not changed, spec-bound): PC2 `toThrow(string)` is a substring match. §3.3 explicitly accepts this. A stricter form (`toThrow(new Error(...))` or an anchored regex) is a proposal for B.
- Info: in a11y terms, the accessible name of the option is unchanged ("▶ Playing" is still the last text). The existing `▶` glyph may be read aloud, and there is no separate preview-state attribute. Both predate this round; out of scope, recorded for B.
- **Architecture note (for B, verbatim intent):** no signal. The change is a JSX move inside one presentational owner; keep it. If the row keeps changing in later rounds, B could propose extracting `ArrangementLibraryOption` into its own file. Not now.

## Optional A-only Chromium sanity probe (NOT acceptance; C rows unclaimed)
- `a-round-146/probe/probe146.cjs` → `probe/out/probe146.json`, plus marker and option screenshots. The flow is real Chromium on :5173: a fresh context, click Soft impact, then press the preview toggle.
- 1440×900: marker box [156, 411.25, 110, 16]; glyph [156, 411.25, 54, 15]; option [148, 370, 126, 63.25]; option scroll 126/126; list scroll 134/134; `elementFromPoint` hits the marker at its middle and at its right end; parent = option. After stop: the marker is gone and the option is back to height 47.25.
- 1280×720: the same values, with y shifted by +38 (option [148, 408, 126, 63.25]).
- Option height 63.25 vs B's predicted 63.5 ± 1. Waveform advance, `createBufferSource`, the second-source move and LAYOUT-LIB deltas were not probed. Those belong to C.

## B acceptance (§3) that A actually passed
- Start checks; PM1 exact; LRS3, DL-VAL and PC2 as specified; m97–m100 red as required; typecheck, lint and Biome clean; targeted vitest green with the allowed count changes only; code-reviewer run and its findings handled; end scope checks OK.
- Not claimed: every C row (T146-TARGETED, SOURCE-SCOPE, AN-REVIEW, PLAY-MARKER, LAYOUT-LIB, LAYOUT-REST, LIB-ROW-TEXT-SMOKE, G146-3, PX-NET/REG-HYD). PURCHASED-LABEL is BLOCKED (no backend in the cloud).

## Known gaps
- PC2 uses a substring match (accepted by spec).
- The `▶` glyph a11y point predates this round.
- In the probe, the option's preview height is 63.25, not the 63.5 libbase value. That is within ±1, but C measures the authoritative value.

## Next C checks (exact)
1. SOURCE-SCOPE: frozen 960 OK; grants vs `b-round-145/r146-granted-start/` match `a-round-146/diff-vs-start.patch`; end hashes = `a-round-146/end-sha256.txt`.
2. PLAY-MARKER (a)–(d) at both viewports, plus clicking the marker itself (`aria-selected` stays true). Locator: `[data-testid="arrangement-library-option-previewing"]`, a sibling after the meta row, not `meta2`.
3. LAYOUT-LIB (i)–(v) vs `b-round-144/out/libbase-{W}.json`; LAYOUT-REST; LIB-ROW-TEXT-SMOKE (the error row has no marker).
4. G146-3, PX-NET/REG-HYD.
