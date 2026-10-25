# CURRENT TASK — Round 160: V-3b — the 7 remaining transport glyphs become lucide icons (↤ ↶ ↷ ✂ ⌫ ↻ ↩), boxes stay within ±1 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z125** (`backlog.json` → VISUAL-A-OBSIDIAN `v3b_plan_d29z125`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-159.md`, an exact copy of the round-159 `current-task.md` (sha256 `b6716c93…09c3fe3c`). Rationale for this round: `b-round-159.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ and § „ღილაკები და ზედაპირები“. It is source material only and grants no permissions.

## Baseline = HEAD `ad0df77`, clean tree (gate 159 published)
- `gates/gate-round-159.json`: status `published`, commit `ad0df770e7fec74c6feb236a8ab59a738f12c79a`, on both remotes. It contains rounds 158 and 159.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists 978 files.
- **Frozen list:** `b-round-159-r160-tree-sha256.txt`, **969 entries** (978 minus the 9 grants).
- **Grants:** `b-round-159-r160-grants.txt` (9 existing files). **New file:** `b-round-159-r160-new-files.txt` (1: doc 129).
- **Start hashes:** `b-round-159-r160-granted-start-sha256.txt`. **Start copies:** `b-round-159/r160-granted-start/`.
- **A's first step:** check that HEAD = `ad0df77`, the tree is clean, the 969 frozen files match and the 9 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z125)
- **Round 159: C PASS.** `browserVerified` and `realVerified` are true, and there are no bugs (`c-round-159.json`).
  - C-R158-01 is closed: all 12 transport buttons compute `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`, and `transition-property: none` under reduced motion.
  - Root published rounds 158 and 159 as `ad0df77`, so **V-3a → მზადაა**.
- **The outcome is fixed by `tasks/round-159.md` §7, "C PASS" row.** Round 160 is V-3b: the 7 remaining transport glyphs with the R2 default sizing, their glyph-pinned tests, and `studioEditStrings.deleteButton`/`deleteClipLabel`.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **User decisions:** `user-review/` has no `ableton-decisions.md` and no `design-ux-decisions.md`. Q-V3-ICON-SIZE has no answer, so the default applies.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B evidence (planning data, not C rows)
- **R2 as written does not keep the boxes within ±1 px.** Probe: `b-round-159/icon-probe.cjs` in real Chromium on `/studio-lab` at `ad0df77`. It swaps each glyph for an svg of the R2 size, then measures every transport control. Output: `b-round-159/out/icon-probe.json` plus screenshots.

| Variant | Max edge shift (1440 and 1280) | Why |
|---|---|---|
| R2 as written: 12/10/20 px icons, existing `gap-1` (4 px) | **4.0 px** (Loop right edge) | The old text `✂ Split` is one text node: glyph plus a 3.02 px space. With an svg, the 4 px flex gap replaces that space. That adds +1.27 px per button, and the shifts add up along the row. |
| Gap 3 px on Split/Delete/Loop, 2 px on Zoom back | 1.0 px | Exactly at the limit; too fragile. |
| **Gap 3 px on Split/Loop, 2 px on Delete/Zoom back (chosen)** | **0.53 px** | Each gap equals the old glyph's space (3.02 px text-sm, 2.02 px text-xs). Delete's 20 px icon has about 1.7 px of built-in side bearing, so 2 px reads like the others. |

- **The chosen variant shifts every element by less than 1 px.** At both viewports the shifts are: Back to start w +0.27; position, Undo, Redo x +0.27; Split x +0.27, w +0.27; Delete x +0.53, w −0.80; Loop x −0.27, w +0.27; Follow, zoom slider label, Zoom to selection x +0.06; Zoom back x +0.06, w −0.06. Heights and y do not change.
- **Generation** (`b-round-159/tw-probe.mjs` → `out/tw-probe-out.css`, the store's Tailwind 4.1):
  - `gap-0.75` = `calc(var(--spacing) * 0.75)`, which is 3 px because the served CSS has `--spacing: 0.25rem`.
  - `gap-0.5` (7 existing uses), `size-2.5`, `size-3` and `size-5` are generated too.
- **`cn`:** `twMerge` drops `gap-1` when `gap-0.75` or `gap-0.5` is added (checked with node).
- **d6 key renames:** d6 keys some buttons by text or aria-label, so V-3b renames 6 reference keys. The map is in `b-round-159-r160-d6-key-renames.json`; details in RV1-V3B.

### 0.2 B rulings (D-29z125; all user-vetoable in `feature-status.md`)
- **R2' (corrects D-29z123 R2):**
  - Icons fill the old glyph slot: 12 px for text-sm, 10 px for text-xs Zoom back, and 20 px for ⌫.
  - Each icon's `strokeWidth` keeps a **1 px visual line**, the same as 16 px at 1.5: 12 px → `2`, 10 px → `2.4`, 20 px → `1.2`.
  - The three icon+label buttons with intrinsic width take a gap equal to the old space: Split and Loop `gap-0.75`, Delete and Zoom back `gap-0.5`.
  - Undo and Redo are fixed width (`w-28`) and keep `gap-1`.
  - Q-V3-ICON-SIZE is unchanged, and its options (a) and (c) remain open.
- **R8 — Icon mapping (spec table):**

| Button | Icon | Source |
|---|---|---|
| Undo ↶ | `Undo2` | spec |
| Redo ↷ | `Redo2` | spec |
| Split ✂ | `Scissors` | spec |
| Delete ⌫ | `Delete` | spec |
| Loop ↻ | `Repeat` | spec |
| Zoom back ↩ | `Undo2` | spec ("Undo, Zoom უკან"): the same icon as Undo, kept as specified |
| Back to start ↤ | **`ArrowLeftToLine`** | **not in the spec table. B's ruling:** the shape of ↤ is an arrow and a bar, and "to the start line" matches the action. `SkipBack` is the media "previous track" convention, which would imply track navigation. This follows round 158's precedent ("Follow ‖ not in the table → B decides"). |

- **R9 — Strings this round:**
  - `deleteButton` `'⌫ Delete'` → `'Delete'`.
  - `deleteClipLabel` `'⌫ Delete — the selected clip; leaves a gap'` → `'Delete — the selected clip; leaves a gap'`. The accessible name loses the "⌫", which screen readers read as "erase to the left". That is an improvement.
  - **`braceHint`** `'Loop: make a time selection and press ↻ Loop (Ctrl+L)'` → `'Loop: make a time selection and press Loop (Ctrl+L)'`. It is brought forward from V-3c because it names the button by the visible label this round changes. Without it, the hint would point at a glyph that no longer exists.
  - **The `⌫ Deleted …` status message (`strings.ts` l.157) stays for V-3c.** It is a status sentence, not a button label, and a string cannot hold a lucide icon. V-3c decides whether to drop the glyph from it. It is added to the V-3c inventory explicitly.
- **R10 — Visible labels stay:** `Undo`/`Redo` (with history label), `Split`, `Delete`, `Loop`, `Zoom`. Back to start stays icon-only with its `aria-label`. M1 (icon-only Play) is a separate approved move.
- **R11 — Accessibility note (recorded, not changed):** Zoom back's accessible name goes from "↩ Zoom" to "Zoom", next to the slider "Zoom (px/s)". Its `title` still explains it. Adding an `aria-label` would mean a new string, so this is recorded as the signal **A11Y-R160-ZOOMBACK-NAME** for the polish pass. It is not a finding.

## 1. What changes (exact; line numbers at `ad0df77`)
| ID | File | Change |
|---|---|---|
| I0 | `ArrangementTransport.tsx` l.1 | The import becomes `ArrowLeftToLine, Delete, MoveHorizontal, Pause, Play, Redo2, Repeat, Scissors, Undo2` from `lucide-react`, in Biome order. |
| I1 | l.140–148 Back to start | Children `↤` → `<ArrowLeftToLine className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`. Class, `aria-label`, `title` and handler are unchanged. |
| I2 | l.169 Undo / l.184 Redo | `<span aria-hidden="true">↶</span>` → `<Undo2 className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`; `↷` → `<Redo2 …same props… />`. The `truncate` label span, `w-28`, refs, handlers and focus handoff are unchanged. |
| I3 | l.193–195 Split | Class becomes `cn(toolButtonClass, 'gap-0.75')`. Children become `<Scissors className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" /><span>Split</span>`. |
| I4 | l.207–209 Delete | Class becomes `cn(toolButtonClass, 'gap-0.5', range && 'border-accent text-accent')`. Children become `<Delete className="size-5 shrink-0" strokeWidth={1.2} aria-hidden="true" /><span>{studioEditStrings.deleteButton}</span>`. `title`, `aria-label` expressions and handlers are unchanged. |
| I5 | l.218–224 Loop | Class becomes `cn(toolButtonClass, 'gap-0.75', loop?.enabled && '…unchanged loop-on string…')`. Children become `<Repeat className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" /><span>Loop</span>`. |
| I6 | l.300–303 Zoom back | Class becomes `cn(toolButtonClass, 'gap-0.5 px-2 text-xs')`. Children become `<Undo2 className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /><span>Zoom</span>`. |
| — | same file | **Everything else is byte-identical:** `toolButtonClass`, Play, Zoom to selection, Follow (`Follow` / `Follow ‖` text), Fit, Export, the position readout, separators, the slider, all handlers, all `title`/`aria-*` attributes and the focus handoff. If Biome reorders class tokens, follow it and report the final strings. |
| S1 | `app/lib/arrangement/strings.ts` l.148, l.149, l.265 | R9: exactly those three values. Every other byte is unchanged, including l.157 (`⌫ Deleted …`). |
| D3 | **new** `docs/implementation/2026/quarter-IV/129-studio-v3b-transport-icons.md` | Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English. Contents: R2' with the §0.1 probe table, R8–R11, the class/children before and after, Problem → Solution (R2's gap-1 shift → per-button gap), tests and mutations, and TODO (V-3c incl. the `⌫ Deleted` status, Q-V3-ICON-SIZE, A11Y-R160-ZOOMBACK-NAME, M1/M3/M4). Status: `In Progress (awaiting C round 160)`. |
| D4 | `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` | Closes INFO-C159-DOC128-STALE. Exactly three edits:<ul><li>l.3 status → `Completed (C round 159 PASS; published ad0df77)`;</li><li>l.50: replace the claim "ამიტომ reduced motion-ისას transition არ არის" with a pointer to the C-R158-01 entry (the `!` suffixes plus `motion-reduce:transition-none!`);</li><li>l.74 "შემდეგ" row: show the four `!` tokens and `motion-reduce:transition-none!`.</li></ul>Nothing else changes. |

**Tailwind generation check by A:** fetch the served dev CSS (`http://127.0.0.1:5173/app/styles/app.css?direct`). Confirm that `.gap-0\.75` exists with `gap: calc(var(--spacing) * 0.75)`, and that `.size-2\.5`, `.size-3` and `.size-5` exist. Save the result as `a-round-160/tailwind-css-check.json`. If the dev server is not running, start it in the background and record that.

**Not allowed:**
- `app/styles/**`, any other component, `package.json`, `~/components/icons`;
- `style=`, custom CSS, a hex value, an arbitrary `[...]` size or gap, or a new token;
- any change to surfaces, colours, `toolButtonClass`, widths `w-24`/`w-28`/`w-16`/`w-8`, handlers or `title`/`aria-label` expressions;
- strings other than the three in S1.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` | I0–I6 |
| `app/lib/arrangement/strings.ts` | S1 (3 values) |
| `app/lib/arrangement/__tests__/strings.test.ts` | N2: l.418–419 and l.686 expected values follow S1. Nothing else; l.517–522 (`⌫ Deleted`) stay. |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | N3, below |
| `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` | N4: l.207–209 prefixes `'↶'`/`'↷'`/`'⌫'` → `'Undo'`/`'Redo'`/`'Delete'`. `it` titles may drop the `⌫`/`↩` glyphs (FL5, FL6, FL9, FL10); no assertion changes. |
| `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | N5: l.178–180 prefixes → `'Split'`/`'Delete'`/`'Loop'`; l.226, l.228, l.278 and l.361 expected values follow S1. Nothing else. |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | N6: l.384 `'↩ Zoom'` → `'Zoom'`. |
| `app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` | N7: l.214 helper. Find the button by its text `'Delete'` restricted to `button` elements (for example `getAllByRole('button')` filtered by `textContent === studioEditStrings.deleteButton`), and **assert exactly one match**. Plain `getByText('Delete')` may match more than one node once the glyph is gone. |
| `docs/…/128-studio-v3a-transport-surfaces.md` | D4 only |
| **new** `docs/…/129-studio-v3b-transport-icons.md` | D3 |

**N3 (`transport-surface-ui.test.tsx`):**
- **TS5:** `byText('↻ Loop')` → `byText('Loop')`. Assertions are unchanged.
- **TS6 → the V-3b lock.** Rename it to describe V-3b.
  - Each of the 7 buttons contains exactly one `svg` with `aria-hidden="true"` and the expected lucide class (`lucide-arrow-left-to-line`, `lucide-undo-2` ×2, `lucide-redo-2`, `lucide-scissors`, `lucide-delete`, `lucide-repeat`), `size-*` token and `stroke-width` attribute (R2').
  - Their `textContent` is exactly `''`, `'Undo'`, `'Redo'`, `'Split'`, `'Delete'`, `'Loop'`, `'Zoom'`.
  - No transport button's text contains any of `↤↶↷✂⌫↻↩`.
  - Split and Loop contain the token `gap-0.75`, Delete and Zoom back contain `gap-0.5`, and none of these 4 contains `gap-1`. Undo and Redo still contain `gap-1` and `w-28`.
  - Fit and Follow still contain no svg, with text `'Fit'`/`'Follow'`.
- **TS1–TS4 are unchanged.** If a TS1–TS4 query used a glyph, it moves to the new label; report it.
- Read the lucide class names from the installed package (`lucide-react` 0.561 renders `lucide lucide-<name>`). If the class differs, assert what it renders and report it.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (a Studio file; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `ad0df77` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `StudioWorkspace.tsx`, `ArrangementLoopBrace.tsx`, `studio-theme-obsidian.test.tsx`, `studio-lab.tsx`, doc 127.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01).

**B grep at planning:** the glyphs `↤↶↷✂⌫↻↩` appear in source only in the transport component and `strings.ts` (l.148, l.149, l.157, l.265). In tests they appear only in the 6 granted test files. No e2e spec uses them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 25 files in `b-round-159-r160-vitest-base.txt` (the same list as round 159). Expect 386/386. Save the list as `a-round-160/vitest-files.txt` and the result as `a-round-160/vitest-baseline.json`.
- **After the edits:**
  - Run the same 25 files. Expect 386 pass, or 386 plus any `it` A adds. TS6 is the new lock.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 8 code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-160/mutations/`):
  - **m158:** swap `Undo2` ↔ `Redo2` on the Undo/Redo buttons. TS6 turns red.
  - **m159:** Delete icon `size-5` → `size-4`. TS6 turns red.
  - **m160:** remove `aria-hidden="true"` from the Scissors icon. TS6 turns red.
  - **m161:** Split class `gap-0.75` removed (falls back to `gap-1`). TS6 turns red.
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 969 files are OK, and the protected diff vs `ad0df77` is empty.
  - `git status --short` = 9 ` M` (only the grants, or fewer if one was not needed; report it) + 1 `??` (doc 129), nothing else.
  - Write `a-round-160/end-sha256.txt` (the 10 paths) and `a-round-160/diff-vs-start.patch` (vs `b-round-159/r160-granted-start/`, plus doc 129 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD; the new lucide imports can trigger it, per root note ENV-FIRST-LOAD-LUCIDE).
- **Harness rules:** make a range by a clip-body drag (a ruler drag navigates). Escape does not clear a range. The idle Export footer button is **Done**.
- Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T160-TARGETED | Re-run `a-round-160/vitest-files.txt`. The counts equal A's, and TS1–TS6 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `ad0df77`.</li><li>The frozen 969 files are OK at start and at end.</li><li>The end hashes equal `a-round-160/end-sha256.txt`.</li><li>`git status` = the grants as ` M` plus doc 129 as `??`, nothing else.</li><li>The protected diff vs `ad0df77` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-159/r160-granted-start/` itself:<ul><li>The component changes only I0–I6.</li><li>`strings.ts` changes exactly the 3 S1 values; l.157 is untouched.</li><li>The 6 test files change only N2–N7. No assertion is weakened: count `expect(` per file before and after, and any drop needs a reason.</li><li>Doc 128 changes only D4, and doc 129 exists with the D3 sections.</li><li>No `style=`, no CSS file, no hex, no arbitrary `[...]` size or gap.</li></ul> |
| ICON-V3B | Both viewports, idle state plus one state with a range (so Delete shows the accent cue):<ul><li>Each of the 7 buttons has exactly one `svg`, `aria-hidden="true"`, the lucide class from R8, rendered box 12×12 (Zoom back 10×10, Delete 20×20) ±0.5 px, the `stroke-width` attribute from R2', and computed `stroke` = the button's computed `color` (Delete in accent with a range).</li><li>No `↤↶↷✂⌫↻↩` text anywhere in the transport.</li><li>CDP accessible names: Back to start `Back to start`; Undo `Undo` / `Undo: <label>`; Redo `Redo`; Split `Split`; Delete = the new `deleteClipLabel` (idle) or the range hint (with a range); Loop `Loop`; Zoom back `Zoom`.</li><li>Play, Pause, Zoom to selection: still one 16×16 svg with stroke-width 1.5 (V-3a, unchanged).</li><li>Screenshots of the transport at rest, with a range, Loop on, and hovering Split, at both viewports.</li></ul> |
| RV1-V3B | Run `b-round-157/tools/d6.cjs` unchanged (sha256 = `b-round-157/tools-sha256.txt`), **one run** per viewport. Compare S0/S1/S2 with `b-round-157/out/d6/d6-{1440,1280}-r1.json` **after** applying the 6 renames in `b-round-159-r160-d6-key-renames.json`. Expected: no key missing or added apart from those renames, and every x/y/w/h within ±1 px. The probe predicts at most about 0.5 px (§0.1; d6 rounds to 0.5 px). A missing or added key outside the map, a key collision, or any delta > 1 px is a finding. Report the per-key deltas for the transport row. |
| SURFACE-SPOT | Regression guard; the class string is unchanged but the children changed. Both viewports, on Split and Loop (idle, enabled with a range):<ul><li>computed rest/hover/pressed `background-color` equals round 159's (a)/(b)/(c) values;</li><li>(h) `background-color, color` / `0.18s` / the cubic-bezier;</li><li>(h-rm) `transition-property: none` in a `reducedMotion: 'reduce'` context;</li><li>Loop-on fill survives hover.</li></ul>Not the full 134-check table. |
| FUNC-SMOKE-7 | Each of the 7 buttons does its real action, at both viewports:<ul><li>**Back to start** seeks the playhead to `00:00.000` after Play has moved it.</li><li>**Undo/Redo:** make a gain edit; Undo reverts it and Redo restores it, and the label shows the edit.</li><li>**Split** at the playhead on a selected clip adds one clip.</li><li>**Delete** on a selected clip removes it and leaves a gap; focus moves to Undo.</li><li>**Loop:** with a range it turns on (`aria-pressed=true`), and the brace appears.</li><li>**Zoom back:** after Zoom to selection, it returns to the previous zoom.</li><li>**Playback:** a Play click gives output peak > 0, and Space toggles back.</li></ul> |
| BRACE-HINT | With no loop, the loop strip reads exactly `Loop: make a time selection and press Loop (Ctrl+L)`, at both viewports. |
| G160-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in round 159): the full SURFACE-STYLE table, CASCADE-SCOPE, CONTRAST-V3A and every V-2 row. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Button boxes and the right-hand group | RV1-V3B |
| Hover/pressed fills, colour motion, Loop-on fill | SURFACE-SPOT |
| Undo/Redo focus handoff, Delete → Undo focus | FUNC-SMOKE-7, T160-TARGETED (FL5, FL9) |
| Accessible names (Delete label change) | ICON-V3B |
| Loop strip hint (`ArrangementLoopBrace`) | BRACE-HINT |
| `⌫ Deleted …` status still announces (unchanged) | FUNC-SMOKE-7 Delete: record the status text |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Lucide icons for transport edit/loop/navigation buttons, sized to the old glyph slot | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts and labels are unchanged. The `ArrowLeftToLine` choice for ↤ is CZABA's (R8), not an Ableton claim. | Requirement: ICON-V3B, RV1-V3B, FUNC-SMOKE-7. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-160.md`, `a-round-160-result.json` and `a-round-160/` (vitest JSON and list, tailwind-css-check, mutations, end-sha256, diff patch).
- **C:** `c-round-160.md` and `c-round-160.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ICON-V3B and RV1-V3B tables (both viewports). Put tools, out and shots in `c-round-160/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 161 planning)
| Condition | Round 161 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on RV1-V3B (> 1 px) | B re-plans with C's measurements (gap or size adjustment within R2'), or records Q-V3-ICON-SIZE option (a)/(c) as needing Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3b's own code and cheap; otherwise `deferred_low_polish`, and V-3c goes ahead. |
| C PASS | Root publishes round 160 (10 paths). V-3b → **მზადაა**. Before V-3c, B asks root for the bounded **frontend-architect checkpoint** (pending requests 148/155/157/158 + ARCH-R158-TOOL-BUTTON-RECIPE + ARCH-R159-GLOBAL-TRANSITION-COUPLING). It does not block V-3c's first stage if root has not run it. Round 161 = **V-3c, first stage** (B splits V-3c by owner at planning). |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 160 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish round 160: the 9 granted paths that changed plus the new doc 129, vs `ad0df77`. `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `StudioWorkspace.tsx` and the purchase/auth files are unchanged.
- **ROOT-GLOBAL-TRANSITION-RULE (amended):** the unlayered global transition rule exists in **two** places: `app/styles/app.css` l.305–314 and `app/styles/base/utilities.css` l.7–15 (A round 159 reviewer, confirmed by C). Layering only one has no effect. INFO-C159-GLOBAL-RULE-SCOPE (the rule probably also overrides `ArrangementLane`/`DetailPanel` motion utilities) is an unconfirmed inference. It is still not scheduled and needs a root-approved Store-wide grant.
- **Architecture:** A round 159's reviewer note is recorded as ARCH-R159-GLOBAL-TRANSITION-COUPLING (backlog signal, not scheduled). The checkpoint request stays pending; its natural point is before V-3c.
- **User-visible decisions (may be vetoed in `feature-status.md`):** R2' (corrected default sizing, per-button gaps), R8 (`ArrowLeftToLine` for ↤; Zoom back shares `Undo2` with Undo per spec), and R9 (`braceHint` brought forward; `⌫ Deleted` status left for V-3c).
