# A round 161: V-3c-1, library glyphs become lucide icons (D-29z126)

Implementer: A · Date: 2026-10-25 · Task: `current-task.md` · Evidence: `a-round-161/`

## Start checks (all OK)
- HEAD = `aeba543e80cda33921023081dc4ba6ed476e05c9`, `git status --short` empty, 979 files listed.
- Frozen 968 matched (`sha256sum -c --quiet`); all 11 granted start hashes matched.
- Dev server on 5173 already running (`/studio-lab` HTTP 200). A did not start or stop any server and used no browser.

## Changed files (11 grants, all needed + new doc 130)
| ID | File | Change |
|---|---|---|
| L0 | `ArrangementLibrary.tsx` | `import { ChevronDown, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';` (Biome accepts the order). |
| L1 | same, expand (rail) | class prefixed `flex items-center justify-center`; `▶` → `ChevronRight` (`size-3 shrink-0`, stroke 2, aria-hidden). |
| L2 | same, collapse | prefixed `flex items-center justify-center`; `◀` → `ChevronLeft` (size-3, 2). |
| L3 | same, search clear | prefixed `flex items-center justify-center`; `×` → `X` (size-3, 2). |
| L4 | same, collection fold | prefixed `flex items-center justify-center`; `▾`/`▸` → `ChevronDown`/`ChevronRight` (`size-2.5 shrink-0`, stroke 2.4). `aria-expanded`/`aria-label` unchanged. |
| L5 | same, row marker | final class **`flex items-center gap-0.5 whitespace-nowrap text-xs text-brand`** (Biome left it as written); children `Play` (size-2.5, 2.4) + `<span>{rowPreviewing}</span>`. `data-testid` unchanged. |
| P0 | `ArrangementLibraryPreview.tsx` | `import { Play, Plus, Square } from 'lucide-react';` |
| P1 | same, preview toggle | base class now `flex flex-1 items-center justify-center gap-0.75 rounded-sm border px-2 py-1.5 text-sm font-medium …` (rest unchanged); children `Square`/`Play` (size-3, 2) + `<span>` label. State branches, disabled, handlers, testid unchanged. |
| P2 | same, Add | class now `flex flex-1 items-center justify-center gap-0.75 rounded-sm border border-brand bg-brand/10 …` (rest unchanged); `Plus` (size-3, 2) + `<span>{add}</span>`. |
| S1 | `strings.ts` | exactly the 6 R4 values. `previewWaveLabel` is wrapped onto two lines by Biome formatting (value byte-identical to R4). l.305/307 and l.735/736 untouched. |
| N1 | `strings.test.ts` | l.517/519/522, l.2292, l.2428 (wrapped like S1), l.2431–2433 follow R4; l.2472 → `expect(lp.add).toBe('Add')`; new **LG1**. |
| N2 | `library-row-strings-ui.test.tsx` | `PREVIEW_WAVE_NAME`, `DEMO_READY`, LRS1/LRS3 `'Playing'`, LRS3 className = final L5 string, toggle `'Preview'`/`'Stop'`, Add `'Add'`, l.351 → `toContain('(Enter or Add)')`; LRS1/LRS3 titles drop ▶; new **LI1–LI3** + 3 helpers. |
| N3 | `library-preview.test.tsx` | l.251 name `'Add'`; toggle texts `'Preview'`/`'Stop'`. |
| N4 | `held-enter-add.test.tsx` | l.269/l.287 name `'Add'`; HA5 title drops `＋`. HA6 title ("the ＋ guard") left as is (listed in doc 130 TODO). |
| N5 | `collection.test.ts` | l.377/l.390 → `(Enter or Add).` **Plus one line not listed by B:** l.399 `expect(demo.ready).toContain('＋')` would fail after R4; replaced 1:1 with `toContain('(Enter or Add)')`. Reviewer judged it acceptable and not weaker. |
| N6 | `collection-load-status.test.tsx` | l.51/l.57 → `(Enter or Add).` |
| N7 | `purchased-collection-ui.test.tsx` | l.35/l.40 → `(Enter or Add).` |
| D4 | doc 129 | l.4 only → `**სტატუსი:** Completed (C round 160 PASS; published aeba543)`. |
| D3 | doc 130 (new) | Georgian, TEMPLATE sections; R1 + §0.1 tables, R2, R3, R4, R5, V-3c split, before/after, problems, tests, mutations, TODO (V-3c-2..5, Q-V3-ICON-SIZE, M1/M3/M4, stale glyph `it` titles in floating-video / library-focus-handoff / library-video-return-focus + HA6). Status `In Progress (awaiting C round 161)`. |

No `style=`, hex, arbitrary `[...]`, new token, CSS file or surface change was added.

**New tests:**
- **LI1:** collapse, search clear (after typing `so`) and the fold button each have exactly 1 svg, `aria-hidden="true"`, `lucide-chevron-left` / `lucide-x` / `lucide-chevron-down`, then `lucide-chevron-right` (and not chevron-down) after a fold click. Each also has its size token, `shrink-0` and `stroke-width` (2 / 2.4), `textContent ''`, and the classes `flex items-center justify-center`. The row fixture renders 1 fold button.
- **LI2:**
  - The toggle shows `lucide-play` + `Preview`, then `lucide-square` + `Stop` (and no play icon) while previewing, then Preview again.
  - Add shows `lucide-plus` + `Add`.
  - Both have size-3, stroke 2, `gap-0.75`, no `gap-1`, and `justify-center`. The `justify-center` check was added after the reviewer's Low finding.
  - The marker has `lucide-play`, size-2.5, stroke 2.4, `gap-0.5` and the text `Playing`.
- **LI3:** the rail expand has `lucide-chevron-right` and size-3. The text of `[data-testid="arrangement-library"]` matches no `▶◀×▾▸■＋` in the expanded, previewing and collapsed states.
- **LG1:** the 6 values match none of `▶◀×▾▸■＋⌫`. `previewWaveLabel` ends with `Space = play/stop`, and `deleteRangeDone` gives the exact text.

**`expect(` counts (before → after):** strings.test 520 → 523 · library-row-strings-ui 72 → 95 · library-preview 35 → 35 · held-enter-add 46 → 46 · collection 49 → 49 · collection-load-status 50 → 50 · purchased-collection-ui 31 → 31. No drops (`expect-counts-before.txt` / `-after.txt`).

## Commands and tests actually run
- **Baseline:** the 18 files (`a-round-161/vitest-files.txt` = `b-round-160-r161-vitest-base.txt`), **330/330** (`vitest-baseline.json`).
- **After:** the same 18 files, **334/334** (330 + LI1, LI2, LI3, LG1), all green (`vitest-after.json`, final run after the reviewer fix).
- `npm run typecheck`: exit 0 (`typecheck.log`).
- `npm run lint`: exit 0. It reports 218 warnings + 1 info, the same pre-existing count as round 160 (`lint.log`). The scoped Biome run shows nothing in the owned files.
- `npx biome check` (read-only) on the 10 code/test files: "Checked 10 files … No fixes applied", exit 0 (`biome-scoped.log`).
- **Tailwind generation** (`tailwind-css-check.json`, `served-app.css`, `served-headers.txt`; HTTP 200): `allOk: true`. It found `.gap-0\.75 {gap: calc(var(--spacing) * 0.75)}`, `.gap-0\.5`, `.size-2\.5`, `.size-3` (`var(--spacing-3)`), `.items-center`, `.justify-center` and `.flex`. This proves only that the classes are generated, not the layout.
- **Mutations** (Edit → vitest → restore by Edit → sha256 = post-edit hash; runner `a-round-161/tools/run-mutation.sh`, JSON per mutation in `a-round-161/mutations/`):
  - **m162:** collapse/expand ChevronLeft ↔ ChevronRight. **Killed** by LI1 + LI3; restore verified.
  - **m163:** playing toggle Square → Pause (the import was extended for the run). **Killed** by LI2; restore verified.
  - **m164:** marker size-2.5 → size-3. **Killed** by LI2; restore verified.
  - **m165:** gap-0.75 removed from the toggle. **Killed** by LI2; restore verified.
  - **m166:** `rowPreviewing` = `'▶ Playing'`. **Killed** by LG1, LI3, LI2, LRS3 and ST45; restore verified.
  - `a-round-161/post-edit-sha256.txt` (the mutation reference) predates the reviewer fix. It is intentionally not regenerated, and only its `library-row-strings-ui.test.tsx` entry differs from `end-sha256.txt` (`3605cf4b…` → `26a14ec2…`). The three mutated files are identical in both.
  - The mutations ran before the reviewer fix, which added 2 `justify-center` asserts to LI2. Those asserts only strengthen LI2, and the component and strings hashes are unchanged since the restores.
- **Not run by A** (speed rules): full suite, `npm run verify`, build, e2e, and every browser row.

## Code-reviewer (actual subagent, 12 files): 9/10, no Critical/High/Medium
- It confirmed:
  - The components change only L0–L5 and P0–P2.
  - `strings.ts` changes exactly 6 values.
  - No assertion was weakened, and the l.399 swap is acceptable.
  - LI1–LI3 and LG1 lock what they claim.
  - The TS-strict and Tailwind-first rules are respected.
  - Doc 130 matches the code.
- **Low, test gap:** `justify-center` was not asserted on the toggle and Add. **Fixed** in LI2.
- **Low, evidence:** the scoped Biome log and the end artifacts were missing. **Fixed:** `biome-scoped.log`, `end-sha256.txt` and `diff-vs-start.patch` are written.
- **Info:**
  - The `<span>` label wrap is checked only via `textContent`.
  - The new class tokens are at the front in Library but inserted mid-string in Preview. Both are allowed by L1–L4 / P1–P2, and Biome does not sort classes.
  - The HA6 title still contains ＋ (in doc 130's TODO).
  - `LIBRARY_GLYPHS` is declared after the `describe`, which works (no TDZ issue) but would read better first.
  - Optional idea: l.399 could be `not.toContain('＋')`.
- **Architecture note (verbatim, for B/root; not acted on):**
  > Signal 3 (one region changed repeatedly), weak: the R2'' icon class recipe (`size-3 shrink-0` + `strokeWidth={2}`, `size-2.5 shrink-0` + `2.4`) is now repeated at 10 sites in two files (`ArrangementLibrary.tsx:135,441,460,485,537-547`; `ArrangementLibraryPreview.tsx:315,317,336`). V-3c-2 and V-3c-3 will repeat it in about eight more owners. **Keep for now.** The icons don't touch audio timing, refs or gesture lifecycle. The literals are pinned by tests and measured by C, and a shared helper would put a new dependency between owners in the middle of the V-3c rollout. **Proposal for B (after V-3c-3):** a bounded task to collect the two R2'' size/stroke pairs into one `studio-icon` constant module under `app/components/arrangement/`. Only the V-3c call sites would use it, with no change to rendered output, and the existing LI/ICON tests would be the acceptance check. Only worth doing if Q-V3-ICON-SIZE (a) is chosen, since that would otherwise mean editing every site.

## End checks
- Frozen 968 OK. HEAD is still `aeba543`. `git ls-files -co --exclude-standard` = 980 (979 + doc 130).
- `git status --short` = the 11 grants as ` M` + doc 130 as `??`, nothing else.
- The protected diff vs `aeba543` is empty: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, AuthContext, StudioContext, `collection.ts`, Modal, Toast, `root.tsx`, `app/styles/`, `app/components/icons/`, StudioWorkspace, ArrangementTransport, `studio-lab.tsx`.
- `a-round-161/end-sha256.txt` covers the 12 paths. `a-round-161/diff-vs-start.patch` is against `b-round-160/r161-granted-start/`, with doc 130 as new.

## B acceptance (A's part) actually passed
- L0–L5, P0–P2, S1, N1–N7, LI1–LI3, LG1, D3 and D4 are done, with one disclosed extra line: collection.test l.399, a 1:1 replacement.
- The 18-file baseline was 330/330; after the edits it is 334/334 with the new its green.
- Typecheck, lint and scoped Biome are clean. The Tailwind check is OK.
- m162–m166 were all killed, with restore hashes verified.
- A real code-reviewer ran. Both Lows are fixed, and the architecture note is handed to B.
- The end-state checks are OK.

**Not claimed:** every C browser row (ICON-V3C1, RV1-V3C1, LIB-STATES-BOX, FUNC-SMOKE-LIB, READY-STATUS, G161-3, PX-NET/REG-HYD).

## Known gaps
- jsdom cannot measure layout. These are C-only:
  - the ±1 px boxes, the rendered 12/10 px icons and their centring;
  - computed `stroke` = `color` (muted/foreground/brand/accent);
  - the CDP accessible names.
- The row marker changed from a plain block span to `flex`. B's probe predicted 0 px; C's LIB-STATES-BOX (c) must confirm the 16 px line.
- LI3 scans text only. Glyphs in `aria-label`/`title` attributes are not scanned; none are known in the library.
- The HA6 title and the 3 frozen titles still mention glyphs (polish pass).
- R5: the accessible names `Preview`/`Stop`/`Add` are short (signal for the polish pass, not a finding).

## Exact next C checks
1. **T161-TARGETED:** re-run `a-round-161/vitest-files.txt` and expect 334/334, with LI1–LI3 and LG1 green.
2. **SOURCE-SCOPE:** check the frozen 968 and `a-round-161/end-sha256.txt`. `git status` should be 11 ` M` + 1 `??`, and the protected diff empty.
3. **AN-REVIEW:** read `a-round-161/diff-vs-start.patch` and compare the `expect(` counts above. Note the collection.test l.399 extra line.
4. **ICON-V3C1:** at both viewports, check svg boxes of 12×12 (marker/fold 10×10) ±0.5, stroke-width 2/2.4, stroke = color, centring ≤ 0.5 px, no glyph text, and the accessible names (toggle `Preview`/`Stop`, Add `Add`, slider ending `Space = play/stop`).
5. **RV1-V3C1:** d6 vs `c-round-160/out/d6/d6-{1440,1280}-r1.json` with the 1 rename (`button:＋ Add#1` → `button:Add#1`).
6. **LIB-STATES-BOX:** vs `b-round-160/out/lib-states-before.json`, including (d) a folded collection.
7. Then **FUNC-SMOKE-LIB** (range delete status without ⌫), **READY-STATUS** (`… (Enter or Add).`), **G161-3** and **PX-NET/REG-HYD**. Watch for ENV-FIRST-LOAD-LUCIDE on the first cold load.
