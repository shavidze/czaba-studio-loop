# CURRENT TASK — Round 161: V-3c-1 — the library glyphs become lucide icons (◀ ▶ × ▾ ▸ in the panel, ▶ Preview / ■ Stop / ＋ Add / ▶ Playing), boxes stay within ±1 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z126** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c_plan_d29z126`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-160.md`, an exact copy of the round-160 `current-task.md` (sha256 `2bee548c…a84410c8`). Rationale for this round: `b-round-160.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ (◀ → `ChevronLeft` library collapse; ▶ → `Play` "Play, მოსმენა"; "the icon matches the old symbol's box, so the element does not move"). It is source material only and grants no permissions.
- **User decision files:** `tmp/studio-real-loop/user-review/` (not `loop/user-review/`). It has no `ableton-decisions.md` and no `design-ux-decisions.md` at this planning.

## Baseline = HEAD `aeba543`, clean tree (gate 160 published)
- `gates/gate-round-160.json`: status `published`, commit `aeba543e80cda33921023081dc4ba6ed476e05c9`, on both remotes (round 160).
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **979** files.
- **Frozen list:** `b-round-160-r161-tree-sha256.txt`, **968 entries** (979 minus the 11 grants).
- **Grants:** `b-round-160-r161-grants.txt` (11 existing files). **New file:** `b-round-160-r161-new-files.txt` (1: doc 130).
- **Start hashes:** `b-round-160-r161-granted-start-sha256.txt`. **Start copies:** `b-round-160/r161-granted-start/`.
- **A's first step:** check that HEAD = `aeba543`, the tree is clean, the 968 frozen files match (`sha256sum -c --quiet`) and the 11 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z126)
- **Round 160: C PASS.** `browserVerified` and `realVerified` are true, there are 0 bugs, and the only blocked row is the fake-Bearer 403 (backend unavailable in cloud). Root published round 160 as `aeba543`, so **V-3b → მზადაა**.
- **The outcome is fixed by `tasks/round-160.md` §7, "C PASS" row:**
  - B asks root for the frontend-architect checkpoint: `b-round-160-checkpoint-request.md`. It is non-blocking.
  - Round 161 = V-3c, first stage. B splits V-3c by owner (§0.3).
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **User decisions:** none (see above).
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
- **Why Library first:**
  - It is the largest single glyph owner: 5 glyph sites in `ArrangementLibrary.tsx` and 3 in `ArrangementLibraryPreview.tsx`.
  - Two of its glyphs are in the spec table (◀, ▶ listening).
  - It touches no surface recipe, so it does not depend on the checkpoint question about `toolButtonClass` (Q4). That question only matters for V-3c-4 (surfaces).

### 0.1 B evidence (planning data, not C rows)
**Glyph metrics** (`b-round-160/lib-glyph-metrics.cjs` → `out/lib-glyph-metrics.json`), measured in real Chromium on `/studio-lab` at `aeba543`, identical at 1440 and 1280:

| Site | Font | Glyph advance | Space after | Box |
|---|---|---|---|---|
| ◀ collapse | 16 px | 12.31 | — | fixed 28×28 (`h-7 w-7`) |
| ▶ expand (collapsed rail) | 16 px | 12.31 | — | fixed 32×32 (`h-8 w-8`) |
| × search clear | 16 px | 9.00 | — | fixed 24×24 (`h-6 w-6`, absolute) |
| ▾/▸ collection fold | 12 px | 6.03 | — | fixed 16 px wide (`w-4`), row height |
| ▶ Preview / ■ Stop | 14 px | 10.78 / 13.23 | 3.016 | `flex-1` (128×34) |
| ＋ Add | 14 px | 14.00 | 3.00 | `flex-1` (128×34) |
| ▶ Playing (row marker) | 12 px | 9.23 | 2.016 | block, 16 px line |

**Variant probe** (`b-round-160/lib-icon-probe.cjs` → `out/lib-icon-probe.json` and screenshots; `add-probe.cjs` → `out/add-probe.json`):
- The probe swaps each glyph for an svg of the R2'' size (§0.2) with the classes below.
- It measures every library element: 47 in S0, 33 with search text, 48 while a preview plays, and 2 on the collapsed rail.
- **Result:** max edge delta **0.000 px** in all four states at both viewports. Every fixed-box icon is centred exactly (dCentre 0/0). The Add swap is also 0.000 px.
- A plain inline svg is not used: `flex items-center justify-center` centres the icon in the fixed boxes, and `flex items-center` + `gap` is used in the text buttons. None of these hosts' outer boxes depend on `display`, because they are flex items, absolute, or block-level.

**d6 keys:**
- Library controls are keyed by `data-testid`; the collection fold buttons are keyed by `aria-label`, which is unchanged.
- **Only `button:＋ Add#1` changes**, to `button:Add#1`. It is unique; the probe found exactly 1 button with the text `Add`.
- Map: `b-round-160-r161-d6-key-renames.json`.
- **New RV-1 reference:** `c-round-160/out/d6/d6-{1440,1280}-r1.json`. C measured it on the published `aeba543` content with the same `d6.cjs` (sha256 `3abc88fe…`, equal to `b-round-157/tools-sha256.txt`). So the round-160 rename map is not stacked on the older f8a316a reference.

**Pre-change box baseline for C:** `b-round-160/out/lib-states-before.json` (`before` arrays for the 4 states, from the same probe).

**Vitest base:** `b-round-160-r161-vitest-base.txt` (18 files). B ran it at `aeba543`: **330/330** (`b-round-160/out/vitest-base-r161.json`). The tree was clean after the run.

### 0.2 B rulings (D-29z126; all user-vetoable in `feature-status.md`)
**R1 — Sizing rule R2'' (R2' generalised; one rule for all of V-3c, recorded under Q-V3-ICON-SIZE):**

| Glyph text size | Icon | `strokeWidth` (1 px line = 24 / size) |
|---|---|---|
| 12 px (`text-xs`) | `size-2.5` (10 px) | `2.4` |
| 14 px and 16 px | `size-3` (12 px) | `2` |
| ⌫ (V-3b only) | `size-5` (20 px) | `1.2` |

- In icon + label hosts, the gap equals the old space: `gap-0.75` at 14 px and `gap-0.5` at 12 px.
- Fixed boxes centre the icon with `flex items-center justify-center`.
- The spec's 16 px / 1.5 option stays open as Q-V3-ICON-SIZE (a).

**R2 — Icon mapping:**

| Site | Glyph | Icon | Source |
|---|---|---|---|
| Library collapse | ◀ | `ChevronLeft` | spec |
| Library expand (rail) | ▶ | `ChevronRight` | **B ruling (spec gap).** The spec maps ▶ to `Play` for listening. Expand is the mirror of collapse, and a Play icon on it would suggest audio. |
| Search clear | × | `X` | B ruling (spec gap) |
| Collection fold | ▾ / ▸ | `ChevronDown` / `ChevronRight` | **B ruling (spec gap).** It becomes the forward constraint for the lane and group fold in V-3c-2. |
| Preview toggle, idle | ▶ | `Play` | spec ("მოსმენა") |
| Preview toggle, playing | ■ | `Square` | B ruling (spec gap). Stop is not Pause: the preview restarts from 0. |
| Add | ＋ | `Plus` | B ruling (spec gap) |
| Row marker "Playing" | ▶ | `Play` | spec |

**R3 — Sentence-glyph rule SG (closes the "V-3c decides" question for every sentence glyph):**
- A string cannot hold an icon.
- A glyph that **names a control or an action** inside a sentence or label becomes the word: `Space = ▶/■` → `Space = play/stop`.
- A **decorative leading** glyph is dropped: `⌫ Deleted …` → `Deleted …`. R9 of round 160 used the same reasoning, because a screen reader reads a glyph by its geometric name.
- **Keyboard-key notation stays:** ← → ↔ ↕ in hints name keys or gestures, not icons.
- **Assignment by owner:** the `previewWaveLabel` and `deleteRangeDone` strings change this round, since `strings.ts` is already granted and only `strings.test.ts` pins `deleteRangeDone`. The two "Esc or ✕" sentences (l.305, l.307) go to V-3c-3 with the dock's ✕ button.

**R4 — Strings this round** (`strings.ts`, exactly these 6 values; line numbers at `aeba543`):

| Line | Key | Old | New |
|---|---|---|---|
| l.157 | `studioEditStrings.deleteRangeDone` | `` `⌫ Deleted ${start} — ${end} ${lanes}; the gap remains.` `` | `` `Deleted ${start} — ${end} ${lanes}; the gap remains.` `` |
| l.754 | `studioSourceLoadStrings.rowPreviewing` | `'▶ Playing'` | `'Playing'` |
| l.774 | `studioLibraryPanelStrings.previewWaveLabel` | `'… · Space = ▶/■'` | `'… · Space = play/stop'` (rest byte-identical) |
| l.777 | `previewPlay` | `'▶ Preview'` | `'Preview'` |
| l.778 | `previewStop` | `'■ Stop'` | `'Stop'` |
| l.779 | `add` | `'＋ Add'` | `'Add'` |

- `collection.ts` interpolates `studioLibraryPanelStrings.add` into both "ready" sentences, so they become `… (Enter or Add).` with no edit to `collection.ts`. It stays frozen.

**R5 — Accessibility notes (recorded, not changed):**
- The preview toggle's accessible name becomes `Preview` / `Stop`, inside the region also named `Preview`. The roles differ, so this is acceptable.
- The Add button's name becomes `Add`.
- Both are signals for the polish pass, not findings.

### 0.3 V-3c split by owner (D-29z126; nothing dropped)
| Stage | Owner files | Content |
|---|---|---|
| **V-3c-1 (round 161)** | `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx` + 6 strings | this task |
| V-3c-2 | `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementClip.tsx` | <ul><li>Lane fold ▸▾, lane ＋ (l.720) + `videoImportLabel`/`videoEmptyHint` "＋ Your own video".</li><li>GroupHeader fold: CSS `before:content-['▸'/'▾']` + the `data-fold-glyph` hook. This is structural, not a children swap, and needs its own ruling.</li><li>GroupHeader ▣ (l.270).</li><li>Clip marks ▶ / ⠿ (l.849).</li></ul> |
| V-3c-3 | `ArrangementVideoDock.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementGridMenu.tsx`, `StudioWorkspace.tsx` | <ul><li>Dock: ⤢ → `Maximize2` (spec), ⠿, ✕, and the two "Esc or ✕" sentences (SG).</li><li>Marker ◀ / ▶.</li><li>Detail panel `expandText`/`collapseText`.</li><li>Grid menu ✓.</li><li>`← CZABA`.</li><li>May split again if the grants exceed about 12.</li></ul> |
| V-3c-4 | per component | Other components' button surfaces: border → fill, 8 px radius. Needs checkpoint Q4 (shared recipe) or B's fallback (c). |
| V-3c-5 | obsidian token, narrow `app.css` grant (V-1 precedent) | 10 px panel radius |

Then M1, M3, M4, then RV-1/2/3/5 and the deferred Low polish.

## 1. What changes (exact; line numbers at `aeba543`)
| ID | File | Change |
|---|---|---|
| L0 | `ArrangementLibrary.tsx` imports | Add `import { ChevronDown, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';` in Biome order. |
| L1 | l.429–440 expand (rail) | <ul><li>Class: prepend `flex items-center justify-center` to the existing string.</li><li>Children `▶` → `<ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`.</li></ul> |
| L2 | l.448–459 collapse | <ul><li>Class: prepend `flex items-center justify-center`.</li><li>Children `◀` → `<ChevronLeft className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`.</li></ul> |
| L3 | l.474–484 search clear | <ul><li>Class: prepend `flex items-center justify-center`.</li><li>Children `×` → `<X className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`.</li></ul> |
| L4 | l.527–535 collection fold | <ul><li>Class: prepend `flex items-center justify-center`.</li><li>Children `{isExpanded ? '▾' : '▸'}` → `{isExpanded ? <ChevronDown …/> : <ChevronRight …/>}`, each `className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true"`.</li><li>`aria-expanded` and `aria-label` are unchanged.</li></ul> |
| L5 | l.128–135 row marker | <ul><li>Class `whitespace-nowrap text-xs text-brand` → `flex items-center gap-0.5 whitespace-nowrap text-xs text-brand`.</li><li>Children → `<Play className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /><span>{studioSourceLoadStrings.rowPreviewing}</span>`.</li><li>`data-testid` is unchanged.</li></ul> |
| P0 | `ArrangementLibraryPreview.tsx` imports | Add `import { Play, Plus, Square } from 'lucide-react';` in Biome order. |
| P1 | l.289–316 preview toggle | <ul><li>Base class gains `flex items-center justify-center gap-0.75`. The state branches, `disabled:`, handlers and `data-testid` are unchanged.</li><li>Children → `{isPreviewing ? <Square …/> : <Play …/>}` (`size-3 shrink-0`, `strokeWidth={2}`, `aria-hidden="true"`), then `<span>{isPreviewing ? previewStop : previewPlay}</span>`.</li></ul> |
| P2 | l.317–329 Add | <ul><li>Class gains `flex items-center justify-center gap-0.75`.</li><li>Children → `<Plus className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" /><span>{studioLibraryPanelStrings.add}</span>`.</li></ul> |
| — | both files | **Everything else is byte-identical:** surfaces (`rounded-sm`, borders, hovers), widths, `title`/`aria-*`, handlers, `onKeyDown` guards, refs, focus handoff, the tree/list/option markup, the waveform slider. If Biome reorders class tokens, follow it and report the final strings. |
| S1 | `strings.ts` | R4: exactly the 6 values. Every other byte is unchanged, including l.305/l.307 (✕ sentences, V-3c-3) and l.735/l.736 (detail `expandText`/`collapseText`, V-3c-3). |
| D3 | **new** `docs/implementation/2026/quarter-IV/130-studio-v3c1-library-icons.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1 (R2'') with the §0.1 tables, R2 mapping, R3 (SG), R4, R5, the V-3c split, class/children before and after, tests and mutations.</li><li>TODO: V-3c-2..5, Q-V3-ICON-SIZE, M1/M3/M4, the stale glyph `it` titles listed in §2.</li><li>Status: `In Progress (awaiting C round 161)`.</li></ul> |
| D4 | `129-studio-v3b-transport-icons.md` | Exactly one edit: the status line **l.4** (l.3 is the date) → `**სტატუსი:** Completed (C round 160 PASS; published aeba543)`. |

**Tailwind generation check by A:**
- Fetch the served dev CSS (`http://127.0.0.1:5173/app/styles/app.css?direct`).
- Confirm that `.gap-0\.75`, `.gap-0\.5`, `.size-2\.5`, `.size-3`, `.items-center`, `.justify-center` and `.flex` exist. They are all used elsewhere already, so this is a guard, not a generation change.
- Save the result as `a-round-161/tailwind-css-check.json`. If the dev server is not running, start it in the background and record that.

**Not allowed:**
- `app/styles/**`, any other component, `collection.ts`, `package.json`, `~/components/icons`;
- `style=`, custom CSS, a hex value, an arbitrary `[...]` value, or a new token;
- any surface/colour/radius/border/hover change (V-3c-4);
- strings other than the six in R4.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | L0–L5 |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | P0–P2 |
| `app/lib/arrangement/strings.ts` | S1 (6 values) |
| `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>N1: expected values follow R4 at l.517, l.519, l.522, l.2292, l.2428 and l.2431–2433.</li><li>l.2472 `lp.add.startsWith(0xff0b)` is no longer true. Replace it with `expect(lp.add).toBe('Add')`.</li><li>Add **LG1** (V-3c-1 glyph lock): `rowPreviewing`, `previewWaveLabel`, `previewPlay`, `previewStop`, `add` and `deleteRangeDone({start:'00:01.000',end:'00:02.000',lanes:'on all tracks'})` match none of `▶◀×▾▸■＋⌫`. `previewWaveLabel` ends with `Space = play/stop`.</li></ul> |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | <ul><li>N2: `PREVIEW_WAVE_NAME`, `DEMO_READY` (l.129, l.133), LRS1/LRS3 texts (`'Playing'`), and LRS3's exact `className`. Its expected value is the **final** L5 class string as Biome leaves it; A reports that string. A further clause: l.351 `toContain(addText)` becomes `toContain('(Enter or Add)')`.</li><li>Toggle texts `'Preview'`/`'Stop'`; Add name/text `'Add'`.</li><li>`it` titles may drop the glyph.</li><li>Add **LI1–LI3** (see below).</li></ul> |
| `app/lib/arrangement/__tests__/library-preview.test.tsx` | N3: l.251 name `'Add'`; l.272, l.291–306 texts `'Preview'`/`'Stop'`. Nothing else. |
| `app/lib/arrangement/__tests__/held-enter-add.test.tsx` | N4: l.269 and l.287 name `'Add'`; the HA5 title may drop `＋`. |
| `app/lib/arrangement/__tests__/collection.test.ts` | N5: l.377 and l.390 → `… (Enter or Add).` |
| `app/lib/arrangement/__tests__/collection-load-status.test.tsx` | N6: l.51 and l.57 → `… (Enter or Add).` |
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | N7: l.35 and l.40 → `… (Enter or Add).` |
| `docs/…/129-studio-v3b-transport-icons.md` | D4 only |
| **new** `docs/…/130-studio-v3c1-library-icons.md` | D3 |

**LI1–LI3 (new, in `library-row-strings-ui.test.tsx`, using its existing full-workspace mount):**
- **LI1, expanded panel.** The row fixture renders collection fold buttons (see the existing l.279–289). If it did not, A would use the demo-collection mount instead and must not drop the fold lock.
- **LI1 checks:**
  - collapse, the search clear (after typing), and each collection fold button each contain exactly one `svg` with `aria-hidden="true"`;
  - lucide classes `lucide-chevron-left`, `lucide-x`, and `lucide-chevron-down`, then `lucide-chevron-right` after a fold click;
  - size tokens and `stroke-width` per R1;
  - `textContent` `''`;
  - the class contains `flex`, `items-center` and `justify-center`.
- **LI2, preview:**
  - the toggle has one svg `lucide-play` + text `Preview` when idle, and `lucide-square` + `Stop` while previewing;
  - Add has `lucide-plus` + `Add`;
  - size-3 / stroke 2 / `gap-0.75`, no `gap-1`;
  - the playing row marker has one svg `lucide-play`, `size-2.5`, stroke `2.4`, and text `Playing`.
- **LI3, collapsed rail:**
  - expand has one svg `lucide-chevron-right`, size-3;
  - **no element inside `[data-testid="arrangement-library"]` has text containing any of `▶◀×▾▸■＋`**, checked in the expanded, previewing and collapsed states.

**Glyph `it` titles in frozen files** (`floating-video`, `library-focus-handoff`, `library-video-return-focus`): their titles mention ◀ ▶ × but assert no glyph text (they use test ids). They stay frozen. List them in doc 130's TODO for the polish pass.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `aeba543` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `studio-theme-obsidian.test.tsx`, `transport-surface-ui.test.tsx`, `studio-lab.tsx`, docs 127/128.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning:**
- The library glyphs appear in source only in the two components and `strings.ts`.
- In tests they appear as assertions only in the 7 granted test files; the 3 frozen files have titles only.
- No e2e spec uses them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 18 files in `b-round-160-r161-vitest-base.txt`. Expect 330/330. Save the list as `a-round-161/vitest-files.txt` and the result as `a-round-161/vitest-baseline.json`.
- **After the edits:**
  - Run the same 18 files. Expect 330 plus the new `it`s (LI1–LI3, LG1), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 10 code and test files (2 components, `strings.ts`, 7 test files).
- **`expect(` counts:** record them per granted test file, before and after. A drop needs a reason; l.2472 is replaced 1:1.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-161/mutations/`):
  - **m162:** swap `ChevronLeft` ↔ `ChevronRight` on collapse/expand. LI1 or LI3 turns red.
  - **m163:** the playing toggle icon `Square` → `Pause`. LI2 turns red.
  - **m164:** the row marker icon `size-2.5` → `size-3`. LI2 turns red.
  - **m165:** remove `gap-0.75` from the preview toggle. LI2 turns red.
  - **m166:** restore `'▶ Playing'` in `strings.ts` `rowPreviewing`. LG1 and LI3 turn red.
  - (m160 was an equivalent mutant: lucide sets `aria-hidden` by default. Do not use a "remove aria-hidden" mutant.)
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 968 files are OK, and the protected diff vs `aeba543` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 130), nothing else.
  - Write `a-round-161/end-sha256.txt` (all changed paths + doc 130) and `a-round-161/diff-vs-start.patch` (vs `b-round-160/r161-granted-start/`, plus doc 130 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD / ENV-FIRST-LOAD-LUCIDE: the new lucide imports can trigger it).
- **Harness rules:** make a range by a clip-body drag (a ruler drag navigates). Escape does not clear a range. The idle Export footer button is **Done**.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T161-TARGETED | Re-run `a-round-161/vitest-files.txt`. The counts equal A's, and LI1–LI3 and LG1 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `aeba543`.</li><li>The frozen 968 files are OK at start and at end.</li><li>The end hashes equal `a-round-161/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 130 as `??`, nothing else.</li><li>The protected diff vs `aeba543` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-160/r161-granted-start/` itself:<ul><li>The components change only L0–L5 and P0–P2.</li><li>`strings.ts` changes exactly the 6 R4 values.</li><li>The test files change only N1–N7 plus LI1–LI3/LG1. No assertion is weakened: count `expect(` per file before and after; a drop needs a reason.</li><li>Doc 129 changes only D4, and doc 130 exists with the D3 sections.</li><li>No `style=`, no CSS file, no hex, no arbitrary `[...]`, no surface change.</li></ul> |
| ICON-V3C1 | Both viewports. States: idle expanded; search text typed; a preview playing; a collection folded; the library collapsed.<ul><li>Each icon site has exactly one `svg`, `aria-hidden="true"`, the lucide class from R2, a rendered box of 12×12 (row marker and collection fold 10×10) ±0.5 px, and the `stroke-width` from R1.</li><li>Computed `stroke` equals the host's computed `color`: muted at rest, foreground on hover for the panel buttons; brand for Preview/Add/marker; accent for Stop.</li><li>Each fixed-box icon is centred in its button (centre delta ≤ 0.5 px).</li><li>No `▶◀×▾▸■＋` text anywhere inside `[data-testid="arrangement-library"]`.</li><li>CDP accessible names: collapse `Collapse library` / expand `Expand library`, clear `Clear search` (all unchanged), fold `<collection> — Fold` / `— Unfold`, toggle `Preview` / `Stop`, Add `Add`, wave slider ending `Space = play/stop`.</li><li>Screenshots of the library in each state at both viewports.</li></ul> |
| RV1-V3C1 | <ul><li>Run `c-round-160/tools/d6.cjs` (sha256 `3abc88fe…`, = `b-round-157/tools-sha256.txt`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-160/out/d6/d6-{1440,1280}-r1.json`** after applying `b-round-160-r161-d6-key-renames.json` (1 rename).</li><li>Expected: no key missing or added apart from that rename, and every x/y/w/h within ±1 px. The probe predicts 0 px for every library element.</li><li>A missing or added key outside the map, a collision, or any delta > 1 px is a finding.</li><li>Report the per-key deltas for the library panel and the preview.</li></ul> |
| LIB-STATES-BOX | The states d6 does not cover, at both viewports, as raw `getBoundingClientRect` values (0.01 px). The **pre-change baseline is B's probe at `aeba543`**: `b-round-160/out/lib-states-before.json`, `"before"` arrays per state (`S0-expanded`, `search-typed`, `preview-playing`, `collapsed-rail`). They are keyed `testid | aria-label | tag:text` + `#n` and measured by `b-round-160/lib-icon-probe.cjs`, whose `measure()` C may reuse. The same preparation steps apply: type `a` into the search; click the preview toggle and wait 500 ms; click collapse and wait 500 ms. Compare every element after mapping the text keys that R4 changes (`button:＋ Add`, `▶ Preview`/`■ Stop`, `▶ Playing`). **Finding set:** the elements keyed by `data-testid` or `aria-label`, plus the `arrangement-library` and `arrangement-library-preview` panels. A key mismatch on a text-keyed `p`/`span`/`h2` entry is a note, because loading or playhead text can differ for reasons unrelated to icons.<ul><li>(a) Collapsed rail: the expand button is 32×32 and the rail 40 px wide.</li><li>(b) Search typed: clear is 24×24, and the input is unchanged.</li><li>(c) Preview playing: the toggle and Add are each 128×34, and the playing option row and its marker line (16 px) are unchanged.</li><li>(d) A collection folded (not in the B baseline): the fold button stays 16 px wide, and its folders hide and show as before.</li></ul>Any delta > 1 px against the baseline is a finding. |
| FUNC-SMOKE-LIB | Each control does its real action, at both viewports:<ul><li>**Collapse** collapses the library (rail 40 px, `LIBRARY_RAIL_WIDTH_PX`) and focus goes to Expand; **Expand** restores it and focus goes to Collapse (LF1/LF2 behaviour).</li><li>**Search clear** empties the query, the × disappears, and focus is on the search input.</li><li>**Collection fold** hides and shows its folders.</li><li>**Preview** plays (real output tap peak > 0 or the preview playhead advances), shows `Stop` + Square, and the row shows `Playing` + icon. **Stop** ends it and the marker disappears.</li><li>**Add** puts the selected source on the active track (clip count +1), with one Undo entry.</li><li>**Range Delete:** the status reads exactly `Deleted 00:0x.000 — 00:0y.000 on the … track; the gap remains.` (no ⌫).</li></ul> |
| READY-STATUS | On a fresh `/studio-lab` load, the status after the demo collection loads reads exactly `Demo collection ready. Choose a track and add a sound (Enter or Add).` |
| G161-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–160): the transport rows (ICON-V3B, SURFACE-STYLE, CASCADE-SCOPE), CONTRAST-V3A and every V-2 row. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Library/preview boxes, list rows, separator | RV1-V3C1, LIB-STATES-BOX |
| Collapse/expand/clear focus handoff (LF1–LF11, VR1–VR7) | FUNC-SMOKE-LIB, T161-TARGETED |
| Held-Enter guard on Add (HA5) | T161-TARGETED |
| Demo/purchased "ready" status text | READY-STATUS, T161-TARGETED (N5–N7) |
| Range-delete status announcement | FUNC-SMOKE-LIB |
| Preview audio start/stop | FUNC-SMOKE-LIB |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Lucide icons for library panel, preview and row marker glyphs, sized to the old glyph slot | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts and focus are unchanged. `ChevronRight`/`X`/`Chevron*`/`Square`/`Plus` are CZABA's choices (R2), not Ableton claims. | Requirement: ICON-V3C1, RV1-V3C1, FUNC-SMOKE-LIB. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-161.md`, `a-round-161-result.json` and `a-round-161/` (vitest JSON and list, tailwind-css-check, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-161.md` and `c-round-161.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ICON-V3C1, RV1-V3C1 and LIB-STATES-BOX tables (both viewports). Put tools, out and shots in `c-round-161/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 162 planning)
| Condition | Round 162 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item, both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on RV1-V3C1 / LIB-STATES-BOX (> 1 px) | B re-plans with C's measurements within R1, or records Q-V3-ICON-SIZE as needing Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-1's own code and cheap; otherwise `deferred_low_polish`, and V-3c-2 goes ahead. |
| C PASS | Root publishes round 161. V-3c-1 → **მზადაა**. Round 162 = **V-3c-2** (Lane / GroupHeader / Clip glyphs), unless the regression is due. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Gate:** on a C PASS, publish round 161: the changed granted paths plus the new doc 130, vs `aeba543`. `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `StudioWorkspace.tsx`, `collection.ts`, `ArrangementTransport.tsx` and the purchase/auth files are unchanged.
- **Checkpoint:** `b-round-160-checkpoint-request.md` asks for the bounded frontend-architect checkpoint, consolidating the pending 148/155/157/158 requests, ARCH-R159-GLOBAL-TRANSITION-COUPLING and the round-160 reviewer note. It is non-blocking for V-3c-1..3 (icons only). It **is** the input B needs before V-3c-4 (surfaces); without an answer by then, B applies fallback (c), copies locked by tests, and records it.
- **User-visible decisions (may be vetoed in `feature-status.md`):** R1 (R2'' sizing), R2 (`ChevronRight` expand, `X`, `ChevronDown`/`ChevronRight` fold, `Square` stop, `Plus` add), R3 (SG rule), R4 (`Deleted …`, `Space = play/stop`, `(Enter or Add)`).
