# CURRENT TASK — Round 156: V-2b-3a — timecodes inside workspace sentences go mono (footer, lane and clip overlays, drop ghost, video gap)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z121** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-155.md`, an exact copy of the round-155 `current-task.md` (sha256 `fa61860d…4c179e8d69b`). Rationale: `b-round-155.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“, digits row: IBM Plex Mono 300/400, `tabular-nums`, for timecode, BPM, dB and from/to. It is source material. It grants no permissions and does not change the protected-file list.

## Baseline = HEAD `4c07d5f` (gate 155 published rounds 154 + 155), clean tree
- `gates/gate-round-155.json`: status `published`, commit `4c07d5f4b5d682c7b1599fc788ebf8b49962558c`, the same hash on both remotes. At planning, `git status --short` was empty and `git ls-files -co --exclude-standard` listed 973 files.
- **Frozen list:** `tmp/studio-real-loop/b-round-155-r156-tree-sha256.txt`, **963 entries** (973 minus the 10 grants).
- **Grants:** `b-round-155-r156-grants.txt` (10 existing files). **New files:** `b-round-155-r156-new-files.txt` (2 files, both absent at planning).
- **Start hashes:** `b-round-155-r156-granted-start-sha256.txt`. **Start copies:** `b-round-155/r156-granted-start/`.
- **First step for A:** check that HEAD is `4c07d5f`, that `git status --short` is empty, and that the frozen 963 and the 10 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z121)
- **Round 155: C PASS.** `browserVerified` = `realVerified` = true, 0 bugs, 10 rows passed. Gate 155 published rounds 154 + 155 as `4c07d5f`. **V-2b-2 → მზადაა** (browser evidence: `c-round-154.json` + `c-round-155.json`).
- The round-155 outcome table (`tasks/round-155.md` §7) fixed the next step in advance: round 156 = **V-2b-3**, plus the css2 trim if PLEX500-INVENTORY and COOKIE-SOURCE both held. Both held: `plexMono500Face: unloaded`, 0 Plex Mono ≥ 500 elements, and the cookie banner has `font-medium` only.
- **Checks at planning:**
  - The regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), so it is not due today.
  - `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B rulings (D-29z121)
- **R1 — V-2b-3 is split into two stages. The full scope is kept.** B's source sweep found **two more visible timecodes in sentences** that neither the round-154 list nor the round-155 list named:
  - the per-clip range badge (`ArrangementClip.tsx` l.934);
  - the video-gap readout "No video · 00:05.000" (`ArrangementVideoDock.tsx` l.229).

  That makes 10 render sites in 6 components. To keep one verifiable stage per round, V-2b-3 is split:
  - **V-2b-3a (this round): every workspace surface.**
    - the range readout (`StudioWorkspace.tsx` l.2543–2548);
    - the selected-clip line (l.2577–2581);
    - the library drop ghost (`ArrangementLane.tsx` l.895);
    - the all-tracks lane range label (l.1007–1008);
    - the clip range badge (`ArrangementClip.tsx` l.934);
    - the video gap (`ArrangementVideoDock.tsx` l.229).
  - **V-2b-3b (next round): the Export dialog, plus the css2 trim.**
    - `ModalDescription` (l.267);
    - the project scope option (l.395) and the range scope option (l.439);
    - the loop notes (l.443–449);
    - the css2 URL in `studio-lab.tsx` l.8 and TH7: Instrument Sans **700** and IBM Plex Mono **500** come out. **600 stays**, because the protected Export `ModalTitle` uses it.
    - The FONT-FAIL re-run and a new PLEX500/700 inventory go with the trim.
- **R2 — Which values go mono (the smallest rule that is consistent and testable):** exactly the values formatted by `formatArrangementTime` (`MM:SS.mmm`), and only where they are **visible text**. The user may veto this in `feature-status.md`. It does **not** cover:
  - Values in seconds such as "2.000 s" (`studioClipStrings.seconds`, `rangeSeconds`). They stay sans. They are durations in seconds, not timecodes, and are not on the spec's from/to list. Same rule as the round-151 pan readout.
  - `title` / `aria-label` / `aria-valuetext` attributes, such as the selected-clip `title`, the loop brace and the marker flags. Attributes cannot carry a span, so they stay plain strings.
  - Transient status announcements in the `aria-live` output, such as "Copy: …" and "Move to track — …". They are messages, not readouts. Templating about 30 formatters would be out of proportion to the spec's from/to readouts.
  - Export `noSoundNote` / `masterMutedNote`. They are conditional warnings with one duration. They are recorded as V-2b-3b "stays sans, vetoable".
  - Sites that are already mono and unchanged: the loop times (`StudioWorkspace` l.2435), the Detail panel start/length/offset (already `font-mono` per line), the transport, the project end, the library rows and preview.
- **R3 — Part templating, kept in the single strings module (M2).**
  - `strings.ts` gains a separate exported object `studioTimeTextParts` with two builders, `rangeReadout` and `selectedClipDetail`. Each returns `StudioTimeTextPart[]`, where a part is `{ id: string; text: string; isTime: boolean }` with a stable, unique `id` per part.
  - The existing `studioWorkspaceStrings.rangeReadout`, `selectedClipDetail` and `selectedClipTitle` are **derived from those parts** (joined `text`). Their output stays byte-identical. The existing exact-string tests (`strings.test.ts` l.1742–1758) are the lock.
  - `studioWorkspaceStrings` keeps exactly its 7 keys. A separate object is used so the exhaustive key list at l.1718 does not change.
- **R4 — One mono class everywhere, from the C-R154-01 lesson.** Every new mono span carries exactly `className="font-mono font-normal tabular-nums"`. Three of the sites sit under a `font-medium` container: the drop ghost l.878, the lane range label l.1006 and the clip badge l.933. Without `font-normal` they would render Plex Mono 500.
- **R5 — Text content is byte-identical, separators included.** The footer uses an em dash `—`; the lane label and the clip badge use an en dash `–`. Separators, " · " and the seconds stay in the sans text nodes. Only the timecodes move into spans.
- **R6 — Observation recorded, not fixed (B-R155-EXPORT-ZERO):** the Export `ModalDescription` passes `'0:00'` (l.267) while the project option passes `'00:00.000'` (l.395). This is a Low inconsistency → `deferred_low_polish`. Text stays byte-identical in both stages.

## 1. What changes (exact; line numbers at `4c07d5f`)
| ID | File | Change |
|---|---|---|
| S1 | `app/lib/arrangement/strings.ts` | Add `export interface StudioTimeTextPart { id: string; text: string; isTime: boolean }` and `export const studioTimeTextParts = { rangeReadout, selectedClipDetail }`. They use the existing `StudioWorkspaceRangeText` / `StudioWorkspaceClipDetail` inputs, and the parts give the exact current texts:<ul><li>`rangeReadout` = `'Time selection: '`, start, `' — '`, end, `' · length '`, length, `' ·'`;</li><li>`selectedClipDetail` = `' · start '`, start, `' · length '`, length, `' · source offset '`, offset.</li></ul>`studioWorkspaceStrings.rangeReadout` and `selectedClipDetailText` become the joined parts (a small non-exported join helper). No other object or key changes, and no other text changes. No `any`, no type assertions. |
| C1 | **new** `app/components/arrangement/ArrangementTimeText.tsx` | `export function ArrangementTimeText({ parts }: { parts: readonly StudioTimeTextPart[] })` returns a fragment.<ul><li>A time part renders `<span key={part.id} className="font-mono font-normal tabular-nums">{part.text}</span>`.</li><li>A text part renders `<Fragment key={part.id}>{part.text}</Fragment>`.</li></ul>No DOM wrapper, no state, no literal English text, no colour. It renders no element of its own, so forwardRef does not apply; still read `FORWARDREF_COMPONENT.md` and say so in the report. |
| W1 | `app/components/arrangement/StudioWorkspace.tsx` l.2544–2548 | Replace the `studioWorkspaceStrings.rangeReadout({...})` call inside `<p data-testid="arrangement-range">` with `<ArrangementTimeText parts={studioTimeTextParts.rangeReadout({...})} />`, same arguments. The `{' '}`, the all-lanes span, the delete hint and the `<p>` class stay unchanged. |
| W2 | `StudioWorkspace.tsx` l.2577–2581 | Replace the `studioWorkspaceStrings.selectedClipDetail({...})` child with `<ArrangementTimeText parts={studioTimeTextParts.selectedClipDetail({...})} />`, same arguments. The `title={studioWorkspaceStrings.selectedClipTitle(...)}` attribute, `clipLabel`, the title span and the `<p>` class stay unchanged. |
| L1 | `app/components/arrangement/ArrangementLane.tsx` l.895 | Wrap only `{formatArrangementTime(libraryGhost.start)}` in `<span className="font-mono font-normal tabular-nums">…</span>`. The note expression (l.896–901), the outer span and the container l.878 stay unchanged. |
| L2 | `ArrangementLane.tsx` l.1007–1008 | Wrap each of the two `formatArrangementTime(...)` expressions in the same span. The text between and after them (` –{' '}`, ` ·{' '}`), the seconds, `allTracks` and the label class l.1006 stay unchanged. The N6 lane-move ghost (l.929) and its container (l.912) stay byte-identical. |
| K1 | `app/components/arrangement/ArrangementClip.tsx` l.934 | Wrap `formatArrangementTime(range.start)` and `formatArrangementTime(range.end)` each in the same span. ` – `, ` ·{' '}`, the seconds (l.935) and the badge class l.933 stay unchanged. Nothing else in the file changes. |
| V1 | `app/components/arrangement/ArrangementVideoDock.tsx` l.229 | `<span ref={timeRef}>` → `<span ref={timeRef} className="font-mono font-normal tabular-nums">`. The imperative `textContent` update (l.216) and the `<p>` (l.225) stay unchanged. |
| T1 | `app/lib/arrangement/__tests__/strings.test.ts` | Append one new `describe` (no existing line changes):<ul><li>For each builder in `studioTimeTextParts`, the joined parts equal the matching `studioWorkspaceStrings` output for at least two samples, including `selectedClipTitle` = `'Clip: ' + title + joined detail`.</li><li>Exactly the parts that are timecodes have `isTime: true`: 3 per builder.</li><li>Part `id`s are unique.</li><li>`Object.keys(studioTimeTextParts)` equals `['rangeReadout', 'selectedClipDetail']`.</li><li>No part contains Georgian.</li></ul> |
| T2 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | Add **TH11** (source-level, `node:fs` like TH10; keep `// @vitest-environment node`). Exact counts of the literal `className="font-mono font-normal tabular-nums"` per file: `ArrangementTimeText.tsx` 1, `ArrangementLane.tsx` 3, `ArrangementClip.tsx` 2, `ArrangementVideoDock.tsx` 1, `StudioWorkspace.tsx` 0. `StudioWorkspace.tsx` contains `<ArrangementTimeText` exactly 2 times and no remaining `studioWorkspaceStrings.rangeReadout(` / `studioWorkspaceStrings.selectedClipDetail(` call. TH1–TH10 stay unchanged; the TH10 N6 lock must stay green as it is. |
| T3 | `app/lib/arrangement/__tests__/workspace-strings-ui.test.tsx` | Add WSU3–WSU5 in the real `StudioWorkspace` (jsdom, the existing mount helper):<ul><li>**WSU3:** set a range of 3 s → 5 s through the context API. `arrangement-range` `textContent` **starts with** `'Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · '` (the `<p>` also holds the optional all-lanes span and the delete hint, so this is a prefix check, not equality). It has exactly 3 descendant spans with class `font-mono font-normal tabular-nums`, whose texts are `00:03.000`, `00:05.000` and `00:02.000`.</li><li>**WSU4:** select one clip. `arrangement-selected-clip` `textContent` equals its `title` (byte-identical), and it has exactly 3 such spans (start, length, offset).</li><li>**WSU5:** set an all-tracks range (`allTracks: true`). The label span inside the `arrangement-lane-range` overlay of the range's own track has its `textContent` (assert the exact current string) and exactly 2 such spans.</li></ul>If an API needed for a state cannot be reached in jsdom, A stops and reports instead of weakening the test. |
| T4 | `app/lib/arrangement/__tests__/clip-strings-ui.test.tsx` | In CSU1 only, after the existing `textContent` assertion (which stays exactly as is): the badge has exactly 2 spans with class `font-mono font-normal tabular-nums`, with texts `00:03.000` and `00:05.000`. No other test changes. |
| D1 | `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | Status line → `Completed (C round 155 PASS, gate 155 4c07d5f)`. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/126-studio-v2b3a-sentence-timecodes.md` | Follow `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English:<ul><li>R1–R6;</li><li>the 6 sites;</li><li>what stays sans and why;</li><li>the part-templating design;</li><li>tests and mutations;</li><li>TODO: V-2b-3b (Export, css2 trim, FONT-FAIL) and B-R155-EXPORT-ZERO.</li></ul>Status `In Progress (awaiting C round 156)`. |

**Nothing else changes:** no colour, no `app.css`, no route, `studio-lab.tsx` and its css2 URL included, no `package.json`, and not `ArrangementExportDialog.tsx` (V-2b-3b).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | S1 only |
| `app/components/arrangement/ArrangementTimeText.tsx` (new) | C1 only |
| `app/components/arrangement/StudioWorkspace.tsx` | W1, W2 + the two imports (`ArrangementTimeText`, `studioTimeTextParts`) |
| `app/components/arrangement/ArrangementLane.tsx` | L1, L2 only |
| `app/components/arrangement/ArrangementClip.tsx` | K1 only |
| `app/components/arrangement/ArrangementVideoDock.tsx` | V1 only |
| `app/lib/arrangement/__tests__/strings.test.ts` | T1 only (append) |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T2 only |
| `app/lib/arrangement/__tests__/workspace-strings-ui.test.tsx` | T3 only (append; the existing helper may be reused, not changed) |
| `app/lib/arrangement/__tests__/clip-strings-ui.test.tsx` | T4 only |
| `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | D1 only |
| `docs/implementation/2026/quarter-IV/126-studio-v2b3a-sentence-timecodes.md` (new) | D2 only |

- **Read before editing** (`.claude/rules/read-primitives.md`): `AGENT_DISCOVERABLE_CODE.md` (new exports), `FORWARDREF_COMPONENT.md`, `prompts/new-component.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AUDIO_ARCHITECTURE.md` (Studio files; no audio logic changes), `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`.
- **Protected:** the diff vs `4c07d5f` stays empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx`, `CookieConsent.tsx`, `studio-lab.tsx` and `app.css`.
- **Not allowed:**
  - any other file;
  - commit, push, stash, install, revert, or `npm run build`.
  - Every lasting edit goes through Edit/Write (the C-R120-01 rule).
- **B grep at planning: tests that read these surfaces.** All of them use `textContent` / `toContain` / attribute checks, so they must stay green unchanged:
  - `workspace-strings-ui` l.266, `lane-strings-ui` LSU6 l.301–308, `clip-strings-ui` CSU1 l.247–250;
  - `render-budget` l.343/450/454 (video gap `textContent`; the span keeps its `ref`);
  - `all-lane-clipboard` l.501/512, `detail-panel` l.324, `delete-selection-ui` l.505–510, `grid-snap-edit` l.687;
  - the drop-ghost tests in `grid-snap-ui`, `marker-snap`, `grid-snap-loop-drop` and `export-range-ui`.

  If any of these turns red, A stops and reports the file, the line and the assertion. A does not change it.
- **Also checked at planning:** the `strings.test.ts` source scans (`readStoreSource`, l.351/928/1129/1498, ST51) only look for Georgian codepoints, so the new exports and the new component do not break them. `render-budget` l.528 pins the library playhead only, which is not touched.

## 3. A — tests and commands (speed rules)
- **Baseline run:**
  - the 24 files in `a-round-155/vitest-files.txt`;
  - plus `strings.test.ts`, `workspace-strings-ui.test.tsx`, `clip-strings-ui.test.tsx`, `lane-strings-ui.test.tsx`, `all-lane-clipboard.test.tsx`, `detail-panel.test.tsx`, `delete-selection-ui.test.tsx`, `grid-snap-edit.test.tsx`, `grid-snap-loop-drop.test.tsx`, `export-range-ui.test.tsx` and `status-announcement-ui.test.tsx` (skip any that is already in the 24).

  Save the list as `a-round-156/vitest-files.txt` and the result as `a-round-156/vitest-baseline.json`.
- **After the edits:**
  - Run the same files. Every test that passed at baseline still passes, and the new T1–T4 are green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 10 code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; the JSON for each goes in `a-round-156/mutations/`):
  - **m143:** remove `font-normal` from the `ArrangementTimeText` span. TH11 and WSU3/WSU4 turn red.
  - **m144:** in W1, render `studioWorkspaceStrings.rangeReadout(...)` (the old string) instead of the parts. The WSU3 `textContent` assertion stays green and its mono-span count turns red, and TH11 turns red. This shows the lock checks the spans, not just the text.
  - **m145:** change one part separator in S1 (`' — '` → `' - '`). The `strings.test.ts` exact strings and T1 turn red.
  - **m146:** remove the K1 span around `range.end`. CSU1's mono count and TH11 turn red; CSU1's `textContent` assertion stays green.
- **Code-reviewer: required** (more than 3 code files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 963 are OK, and the protected diff is empty.
  - `git status --short` = the 10 granted paths ` M` + the 2 new paths `??`, nothing else.
  - Write `a-round-156/end-sha256.txt` (12 paths) and `a-round-156/diff-vs-start.patch` (vs `b-round-155/r156-granted-start/`, plus the two new files in full).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session where a Google Fonts css2/woff2 response is not 200 is **invalid (environment)**; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD).
- Reuse `c-round-155/tools/` (`c155.cjs` for the repro and inventory, `g155-3.cjs`, `sum155.py`). Change only the output dir, labels and file names. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T156-TARGETED | Re-run `a-round-156/vitest-files.txt`. The counts equal A's, and T1–T4 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `4c07d5f`.</li><li>The frozen 963 are OK at start and at end.</li><li>The end hashes equal `a-round-156/end-sha256.txt`.</li><li>`git status` = the 10 ` M` + 2 `??` exactly.</li><li>The protected diff vs `4c07d5f` is empty (list in §2).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff itself:<ul><li>Each component diff is limited to the S1/C1/W1/W2/L1/L2/K1/V1 rows.</li><li>Every new mono span uses exactly `font-mono font-normal tabular-nums`.</li><li>`ArrangementExportDialog.tsx` and `studio-lab.tsx` are untouched.</li><li>The TH1–TH10 and CSU1 lines that existed before are unchanged.</li><li>Doc 125 changed only its status line.</li><li>Doc 126 follows the template, in Georgian.</li></ul> |
| TEXT-BYTES | At both viewports, read `textContent` and compare it byte for byte with a reference computed from the shown times and the `strings.ts` templates (R5 dashes):<ul><li>(a) the range readout after a ruler drag 3 s → 5 s;</li><li>(b) the selected-clip line after clicking a clip: also equals its `title`;</li><li>(c) the drop ghost while holding a library drag over SFX (free) and over an occupied place ("· No room…");</li><li>(d) the all-tracks lane label after Ctrl+Shift+L on a range;</li><li>(e) the clip badge after a body drag on a clip;</li><li>(f) the video gap readout with the playhead in a gap after a video import. If no demo video exists, use the existing video import path; if it cannot run, mark only (f) BLOCKED with the reason.</li></ul> |
| MONO-STYLE-N7…N12 | For each mono span in (a)–(f):<ul><li>computed family IBM Plex Mono, weight **400**, `font-variant-numeric` `tabular-nums`;</li><li>CDP `getPlatformFontsForNode` = "IBM Plex Mono [web]" (not "Medium");</li><li>the neighbouring sans text node keeps its family and weight: the drop ghost, lane label and clip badge text stay Instrument Sans **500** per their `font-medium` containers; the footer text stays at its round-155 weight.</li></ul>Give one table per viewport. |
| LAYOUT-FIT | Both viewports: report `clientWidth`/`scrollWidth` and line count for the range readout, the selected-clip line (with the longest demo title, "CZABA hero — საჯარო preview"), the drop ghost label, the lane label and the clip badge, compared with the same states on the round-155 evidence where it exists. **A new truncation or a new wrap that hides content is a finding, not a PASS.** B pre-ruled: it is Low unless content becomes unreachable (no `title`), which would be Medium. Mono width growth alone is not a bug. |
| PLEX500-INVENTORY-S | At 1440, in one session: S0, the states (a)–(e), the marker menu, the grid menu and the Export dialog. Then:<ul><li>IBM Plex Mono 500 stays `unloaded`;</li><li>0 visible Plex Mono elements at weight ≥ 500;</li><li>the only visible element at weight ≥ 600 is still the Export `ModalTitle`.</li></ul> |
| FUNC-SMOKE-S | Both viewports: <ul><li>Play 2 s; the playhead moves and the output peak is > 0.</li><li>A ruler range, then Delete, then Ctrl+Z restores it.</li><li>A clip drag across lanes, then Ctrl+Z.</li><li>A library drop with the ghost shown, then Ctrl+Z.</li><li>Lane M toggle and undo.</li></ul> |
| G156-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. React's SSR text separators (`<!-- -->`) are not a hydration message. |

- **Not re-run** (code unchanged since C round 154/155 verified it): WEIGHT-STYLE, MASTER-OVER, MONO-STYLE N1–N6 (N6 is only touched by TH11 staying green), RV-1, NO-CLIP/OVERLAP, FONTS-SCOPED, FONT-FAIL (moves to V-2b-3b with the css2 change), LABEL-STYLE, RV-2 and the full WAV export. A new observation about them is a note.
- **Not C rows:** V-2b-3b (Export, css2), V-2b-DISPLAY, B-R153-PREVIEW-DUR, C-R151-2/3, B-R155-EXPORT-ZERO.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Footer wrap/truncation, the delete hint position | LAYOUT-FIT, TEXT-BYTES (a)(b) |
| The N6 lane-move ghost (same file) | T156-TARGETED (TH10), AN-REVIEW |
| Video-gap imperative updates during playback | TEXT-BYTES (f), T156-TARGETED (`render-budget`) |
| Drop-ghost blocked note, range Delete/undo, clip drag | FUNC-SMOKE-S, TEXT-BYTES (c)(e) |
| Status announcements (unchanged, still sans) | FUNC-SMOKE-S (read the status text once) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Monospaced timecodes inside readouts and drag labels | None used. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** Values in seconds stay sans (R2, vetoable). | Requirement: TEXT-BYTES and MONO-STYLE-N7…N12. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-156.md`, `a-round-156-result.json`, and `a-round-156/` (vitest JSON and file list, mutations, end-sha256, the diff patch, the code-reviewer result).
- **C:** `c-round-156.md` and `c-round-156.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the TEXT-BYTES table, the MONO-STYLE tables and the LAYOUT-FIT table. Put tools, out and shots in `c-round-156/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 157 planning)
| Condition | Round 157 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL Low on a row this round owns (TEXT-BYTES, MONO-STYLE, LAYOUT-FIT) | A bounded fix-up of that row. |
| C PASS | Root publishes round 156. V-2b-3a → **მზადაა**. Round 157 = **V-2b-3b**: Export `ModalDescription` + the two scope options + the loop notes via `studioTimeTextParts` / `ArrangementTimeText`, plus the css2 trim (Instrument Sans 700 and Plex Mono 500 out, 600 kept, TH7), with a FONT-FAIL re-run and a font inventory. If the css2 rows alone fail, the fix-up is bounded to the URL and TH7. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 156 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish round 156 (12 paths). `app.css`, `studio-lab.tsx`, `root.tsx`, `Modal.tsx`, `CookieConsent.tsx` and `ArrangementExportDialog.tsx` are unchanged vs `4c07d5f`.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - D-29z121 R2: only `MM:SS.mmm` timecodes go mono; seconds values, attributes and status announcements stay sans.
  - D-29z121 R1: V-2b-3 is split into 3a/3b. The scope is unchanged.
- **Frontend-architect checkpoint:** the V-2 boundary request is now sent: `b-round-155-checkpoint-request.md`, together with the pending `b-round-148-checkpoint-request.md`. It is read-only and bounded, and it does not block V-2b-3a.
- **User questions, unchanged:** B-R153-PREVIEW-DUR (a)–(c), V-2b-DISPLAY (a)–(d) including the Export title weight, and C-R151-2.
