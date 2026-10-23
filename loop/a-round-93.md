# A — Round 93 report (D-29z58): export dialog radio names, descriptions, format-aware notes

Implementer: A (Claude Opus 5.5) · Date: 2026-10-23 (UTC) · Task: `current-task.md` (round 93)

## Scope completed
- **D1 (GATE91-S1 + A-R86-L7):** WAV, MP3, WAV + MP3 and disabled video radios: main text in its own `<span id>` (no class), note/reason as a sibling `<span id>` with its existing classes; input has `aria-labelledby` + `aria-describedby`. Disabled range radio: name span + `aria-labelledby={hasValidRange ? undefined : optionIds.rangeName}`; the existing `aria-describedby={hasValidRange ? undefined : rangeReasonId}` is byte-identical. Valid range and project radios: no new attributes. Ids: one `useId()` base (`exportOptionIdBase`) + suffixes; `rangeReasonId` unchanged.
- **D2 (A-R86-L8):** `EXPORT_FORMAT_CREATES` next to `EXPORT_FORMAT_BUTTON_LABELS`; no-sound and Master-mute notes read `EXPORT_FORMAT_CREATES[exportFormat]`. Show conditions unchanged.
- Docs: 080 l.4 only; new 081.

## Changed files (end state: 2 M + 2 ??; HEAD `64e12d8`; frozen 518/518 OK; CR=0 in all four)
| File | State | sha256 prefix |
|---|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | M | `0040e050` |
| `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md` | M (l.4 only) | `ddce83ce` |
| `app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx` | ?? | `b54abec3` |
| `docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md` | ?? | `944c6480` |

Dialog `git diff -U0` hunks (old lines): 28 (constant), 96 (useId), 263–323 (format fieldset), 370/378 (range radio), 421/431 (the two notes). All inside the granted regions. No protected file touched.

## Tests actually run
- `npx vitest run app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx` → 9/9 pass.
- Targeted (`a-round-93/targeted-list.txt`, 18 files: every `export-*.test.*`, master-ui, meter-ui, video-fades-ui, track-group-mix-ui; covers every `__tests__` file that greps `ArrangementExportDialog`) → **18 files, 194 tests pass** (`a-round-93/targeted-vitest.log`). No frozen test turned red.
- `npm run typecheck` → rc 0. `npm run lint` → rc 0 (218 pre-existing warnings repo-wide; none in owned files). Scoped `npx biome check` on the two owned code files → clean, no fixes; `npx biome lint` → `a-round-93/biome-lint-owned.txt` (clean). Formatting checked via stdin→stdout only (the new test file took the formatter's stdout; no `--write`).
- **Fail-before:** the new file against the baseline dialog (`b93710cd`, scratch) → 7 red (AN1, AN2, AN3, AN5, NC1, NC2, NC3); AN4 and AN6 are preservation locks and pass on both versions by design.
- Full suite / verify / build: **not run** (speed rules; gate).

## Mutation proofs (scratch `a-round-93/mut/`, own `vitest.config.ts` with `cacheDir` in scratch; script `a-round-93/run-mutations.py`; results `a-round-93/mutation-results.json`; tests run: new file + export-range-ui, export-mp3, master-ui)
| ID | Mutation | Red |
|---|---|---|
| a | drop MP3 `aria-labelledby` | AN1, AN2, AN3, AN5 |
| b | drop WAV + MP3 `aria-describedby` | AN1, AN5 |
| c | WAV note back inside WAV name span | AN1, AN2, AN3 |
| d | drop disabled-range `aria-labelledby` | AN1, AN2, AN5 |
| e | range `aria-describedby` also with valid range | AN3, AN5, frozen export-mp3 MX11 |
| f | Master-mute note hardcoded `WAV შეიქმნება` | NC1, NC3 |
| g | no-sound note hardcoded `WAV შეიქმნება` | NC2 |
| h | MP3 name span gets `block` | **none red** (expected; C VIS-LAYOUT) |
Unmutated control in scratch: 49/49 pass.

## A's own smoke (not C evidence) — 1440×900, `:5173/studio-lab`, Playwright Chromium, state `a-browse.json`
`a-round-93/smoke/smoke.json`, screenshot `a93-1440-mute-mp3.png`. One demo clip, Master muted, Export open:
- CDP `getPartialAXTree`: MP3 name `MP3 · 48 kHz · stereo`, description = `MP3_FORMAT_NOTE` exactly; WAV `WAV · 24-bit · 48 kHz · stereo` / `მთელი პროექტი, იგივე graph რაც დაკვრისას`; WAV + MP3 name/description exact; disabled range `მონიშნული მონაკვეთი` / reason exact.
- LEAK-RE count 0. Click on the MP3 name text → MP3 checked, button `MP3-ის ექსპორტი`.
- Master-mute: WAV → `… — WAV შეიქმნება 00:02.000 …`; MP3 → `… — MP3 შეიქმნება 00:02.000 …` (exact D2 shape).
- Console: 0 non-noise errors/warnings (no hydration warning); 2 noise. 0 Authorization headers; 0 R2/workers.dev/studio-token/recording/download/unpkg requests.

## Code review (actual `code-reviewer` subagent, read-only) — 9/10, 0 Critical
- Q1 accname: `aria-labelledby` (step 2B) overrides the native label (2D); disabled range is read once as name and once as description; the valid-range and project radios are unchanged. **Low (rule):** Chrome falls back to the full label text as the description when `aria-labelledby` exists and no `aria-describedby` resolves, so the two attributes must always be added or removed together. Today they are. No change.
- Q2 SSR ids: `Modal` returns null when closed or on the server, so the ids never appear in the SSR HTML; both `useId` calls are unconditional, so there is no hydration risk. Already outside the diff: the hardcoded `id="arrangement-export-title"` would clash if two dialogs were mounted at once (info).
- Q3 whitespace: `textContent` is unchanged. Q4: the tests assert exact strings, are deterministic, and follow the project rules. Q5: every hunk is inside a granted region; doc 080 changes only on l.4.
- Lows addressed: doc 081 wrongly said a `#id` selector "won't work". **Fixed**: it now names `CSS.escape`.
- Lows left as they are (style or informational): the redundant `toBeTruthy()` after `getByRole`; AN5 checks ids within one mount (the spec's level); `optionIds` is rebuilt on every render (trivial cost); mutation h is left to VIS-LAYOUT.

**Architecture note (verbatim, for B):** Signal 3 (repeated expensive change): the new test file copies the audio stubs and the provider/dialog mount harness again (export-dialog-a11y-copy.test.tsx:52–200), because test files may not import from each other. `class FakeAudioBuffer` now appears in 61 files under `app/lib/arrangement/__tests__/`. Keep ArrangementExportDialog.tsx as it is; proposal for the planner: one bounded task to move the audio fakes and the dialog mount helper into a shared non-test module (for example `app/lib/arrangement/test-support/`), with existing tests moved over only when their region is next touched.

## Known gaps
- e2e grep (`store/e2e`): no spec queries the export radios by label, name or testid (`getByLabel`, `arrangement-export-format`, radio texts: 0 hits), so the name change cannot hit an e2e lock.
- Mutation h (layout drift) is not caught by unit tests; only C's VIS-LAYOUT measures it.
- NOTE-NOSOUND in a real browser was not attempted by A (unit NC2 covers it).
- Range (b)/(c) AX states, 1280 viewport, KEYS-REG, EXPORT-REG were not run by A (C rows).

## Exact next C checks
AX-NAMES (a/b/c, 1280+1440, CDP name/description per D1 table, LEAK-RE 0), AX-SELECT, NOTE-FORMAT (both viewports, + reopen reset), NOTE-NOSOUND (try; else unit-only NC2), VIS-LAYOUT (note top ≥ name bottom, heights ±1 px vs 64e12d8), EXPORT-REG, KEYS-REG, PX-NET, REG-HYD, G93-3, AN-REVIEW (re-run a and f with `python3 -I a-round-93/run-mutations.py a f` after copying current store files — the script syncs them itself), T93-TARGETED, SOURCE-UNCHANGED (hashes above).

## B acceptance criteria truly passed by A
- D1/D2 implemented as specified; frozen tests green; new tests AN1–AN6, NC1–NC3 green and fail on the baseline; mutations a–g red, h reported honestly; typecheck/lint/scoped Biome clean; end state 2 M + 2 ??, frozen 518/518.
- Not claimed: any C browser row, full verify/build (gate).
