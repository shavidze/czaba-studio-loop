# CURRENT TASK — Round 162: V-3c-2 — lane, group-header and clip glyphs become lucide icons (▾ ▸ fold, ＋ Your own video, ▣ group, ▶ / ⠿ clip marks); boxes stay within ±1 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z127** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c2_plan_d29z127`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-161.md`, an exact copy of the round-161 `current-task.md` (sha256 `6a343648…4b7c82`). Rationale for this round: `b-round-161.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ ("the icon matches the old symbol's box, so the element does not move"). It is source material only and grants no permissions.
- **User decision files:** `tmp/studio-real-loop/user-review/`. It has no `ableton-decisions.md` and no `design-ux-decisions.md` at this planning.

## Baseline = HEAD `f08c7ce`, clean tree (gate 161 published)
- `gates/gate-round-161.json`: status `published`, commit `f08c7ced97a8b160e2f9e34f931a938dd3a4a688`, on both remotes (round 161).
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **980** files.
- **Frozen list:** `b-round-161-r162-tree-sha256.txt`, **969 entries** (980 minus the 11 grants).
- **Grants:** `b-round-161-r162-grants.txt` (11 existing files). **New file:** `b-round-161-r162-new-files.txt` (1: doc 131).
- **Start hashes:** `b-round-161-r162-granted-start-sha256.txt`. **Start copies:** `b-round-161/r162-granted-start/`.
- **A's first step:** check that HEAD = `f08c7ce`, the tree is clean, the 969 frozen files match (`sha256sum -c --quiet`) and the 11 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z127)
- **Round 161: C PASS.** `browserVerified` and `realVerified` are true, there are 0 bugs, and the only blocked row is the fake-Bearer 403 (backend unavailable in cloud). Root published round 161 as `f08c7ce`, so **V-3c-1 → მზადაა**.
- **The outcome is fixed by `tasks/round-161.md` §7, "C PASS" row:** round 162 = **V-3c-2** (lane / group header / clip glyphs).
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **User decisions:** none (see above).
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **Checkpoint:** `b-round-160-checkpoint-request.md` has no answer yet. It does not block icon stages (V-3c-1…3).
- **Two deferred Lows close by construction in code this round already owns (cheap, per the 2026-10-23 rule):**
  - **C-R154-02:** the group glyph ▣ (U+25A3) is not in Instrument Sans and falls back to DejaVu Sans. It becomes an svg.
  - **GATE139-EMPTY-VIDEO-FORMATTER:** `videoEmptyHint` repeats the import label as a literal and can drift. It now interpolates the same constant (S1).

### 0.1 B evidence (planning data, not C rows)
**Glyph metrics** (`b-round-161/v3c2-probe.cjs` → `out/v3c2-probe.json`), measured in real Chromium on `/studio-lab` at `f08c7ce`, identical at 1440 and 1280:

| Site | Font | Glyph advance | Gap / space after | Box |
|---|---|---|---|---|
| Lane fold ▾/▸ | 14 px | 7.03 | — | fixed 20×20 (`h-5 w-5`, flex-centred) |
| Video import, compact ＋ (folded or tight lane) | 12 px | 12.00 | — | fixed 20×20 (flex-centred) |
| Video import, full `＋ Your own video` | 12 px | 12.00 | space 2.00 | content-sized 107×22 (`block`) |
| Group fold (CSS `::before` ▾/▸) | 14 px | 7.03 | — | fixed 24×24 (flex-centred) |
| Group mark ▣ | 12 px | 11.34 | `gap-1` 4 px | span 11.34×16 |
| Clip mark ▶ (video) | 12 px | 9.23 | `gap-1` 4 px | span 9.23×16 |
| Clip mark ⠿ (audio) | 12 px | 8.80 | `gap-1` 4 px | span 8.80×16 |

**First swap probe** (svg of the R2'' size, gaps per R2''):
- Fixed boxes: 0.000 px.
- Full import with `gap-0.5`: the button shrinks 2 px and the track-name button grows 2 px.
- Clip titles move +0.77 px (▶) and +1.20 px (⠿). The group name moves −1.34 px.
- So R2'' "gap = old space" is not enough for content-sized hosts with wide glyphs (see R1).

**Final swap probe** (`b-round-161/v3c2-probe-final.cjs` → `out/v3c2-probe-final.json` + screenshots), using the R1 pairs below:
- States: S0, S0-folded (Music + Video lanes folded), S1 (3 audio clips + video clip + group of Music and Stems, the d6 S1 recipe without marker/loop/selection), and S1-group-collapsed. Both viewports.
- **Max edge delta 0.344 px.**
  - Every element keyed by `data-testid` or `aria-label`, every clip box, track header and group header: **0.000 px**.
  - The only movers are inner text spans: clip titles +0.20 (audio) / −0.23 (video), the group name −0.34.
- Fixed-box icons are centred exactly.
- **The `before` arrays in that file are C's LANE-STATES-BOX baseline.**

**Pointer-target check (B grep):**
- No handler on these paths rejects an `SVGElement` target. The clip header's `onPointerDown` → `beginGesture('move')` and the buttons' `onClick` receive the bubbled event.
- `handleLaneBackgroundPointerDown` requires `target === currentTarget` on the lane body, and an icon is never the lane body.
- The `instanceof HTMLElement` guards in `StudioWorkspace.tsx:371-427` test the focused element or the brace/marker/separator, not these icons.
- So no `pointer-events-none` is ruled. C still grabs each icon in FUNC-SMOKE-LANE.

**d6 keys:** six keys change and nothing else: 1 import button text key, 1 compact aria-label key, and 4 clip text keys. Map: `b-round-161-r162-d6-key-renames.json`. B checked it against the reference: 0 collisions.

**New RV-1 reference:** `c-round-161/out/d6/d6-{1440,1280}-r1.json`. C measured it on the published `f08c7ce` content with `d6.cjs` sha256 `3abc88fe…` (= `b-round-157/tools-sha256.txt`).

**Vitest base:** `b-round-161-r162-vitest-base.txt` (19 files). B ran it at `f08c7ce`: **353/353** (`b-round-161/out/vitest-base-r162.json`). The tree was clean after the run.

### 0.2 B rulings (D-29z127; all user-vetoable in `feature-status.md`)
**R1 — Sizing rule R2''' (R2'' plus a box-preserving gap; recorded under Q-V3-ICON-SIZE):**
- The icon size and stroke stay R2'': 12 px text → `size-2.5` + `strokeWidth={2.4}`; 14–16 px text → `size-3` + `strokeWidth={2}`.
- **Gap rule:** in a content-sized host, icon size + gap equals the old glyph advance + the old gap/space, within ±0.5 px, using the nearest 0.25-step spacing token. In R2'' (V-3c-1) the old space happened to satisfy this.
- Fixed boxes keep centring with `flex items-center justify-center`.

| Site | Icon size / stroke | Host gap | Old glyph + gap → icon + gap |
|---|---|---|---|
| Full import | `size-2.5` / 2.4 | `gap-1` (new; the button becomes `flex items-center`) | 12 + 2 = 14 → 10 + 4 = 14 |
| Group mark | `size-2.5` / 2.4 | `gap-1` → **`gap-1.25`** on the name button | 11.34 + 4 = 15.34 → 10 + 5 = 15 |
| Clip marks | `size-2.5` / 2.4 | `gap-1` → **`gap-0.75`** on the clip header | 9.23 / 8.80 + 4 → 10 + 3 = 13 |

**R2 — Icon mapping:**

| Site | Glyph | Icon | Source |
|---|---|---|---|
| Lane fold | ▾ / ▸ | `ChevronDown` / `ChevronRight` | V-3c-1 R2 forward constraint (collection fold) |
| Group fold | ▾ / ▸ (CSS) | `ChevronDown` / `ChevronRight` | same |
| Video import, compact and full | ＋ | `Plus` | V-3c-1 R2 (Add) |
| Group mark | ▣ | `Layers` | **B ruling (spec gap).** A group is a stack of tracks. Alternatives for Saba: `SquareSquare` (literal ▣), `Group`. |
| Clip mark, video | ▶ | `Film` | **B ruling (spec gap).** It marks the clip kind and is not a control. `Play` would suggest that clicking plays it, the same reasoning as the V-3c-1 expand ruling. |
| Clip mark, audio | ⠿ | `GripVertical` | **B ruling (spec gap).** It has the same 2×3 dots, and the clip header is the move handle (`cursor-grab`). |

**R3 — Group fold: a structural change, not a children swap:**
- Remove the conditional `before:content-['▸']` / `before:content-['▾']` token pair from the `cn(...)` call.
- The self-closing `<button … />` gets children: `{collapsed ? <ChevronRight …/> : <ChevronDown …/>}` (`size-3 shrink-0`, `strokeWidth={2}`, `aria-hidden="true"`).
- **`data-fold-glyph` is removed.** No app code reads it; only `track-group-collapse-ui` UC1 does. It names a glyph that no longer renders. The state stays exposed by `aria-expanded`, the same as the lane and collection folds, and UC1 re-pins it 1:1 by the lucide class.
- The group Mute/Solo `before:content-['M'/'S']` letters are **unchanged** (letters, not glyphs).

**R4 — Strings (SG rule from V-3c-1).** In `strings.ts`, exactly the two values below, plus one new non-exported module constant:

| Line | Key | Old | New |
|---|---|---|---|
| l.641 | `studioLaneStrings.videoImportLabel` | `'＋ Your own video'` | the constant `'Your own video'` |
| l.653 | `studioLaneStrings.videoEmptyHint` | `'use “＋ Your own video” or drop a file here'` | `` `use “${…}” or drop a file here` `` with the same constant → `use “Your own video” or drop a file here` |

- A names the constant by `AGENT_DISCOVERABLE_CODE.md`, for example `STUDIO_VIDEO_IMPORT_LABEL`. It is not exported.
- `videoImportTitle` (`'Your own video'`) stays a literal and is not touched.
- **Consequence:** the compact button's accessible name becomes `Your own video`, the same as its `title`.
- l.735/l.736 `expandText`/`collapseText` stay for V-3c-3.

**R5 — Accessibility notes (recorded, not changed):**
- The full import button's name becomes `Your own video`; the icon is hidden.
- The lane fold, group fold and group name keep their `aria-label`s byte-identical.

## 1. What changes (exact; line numbers at `f08c7ce`)
| ID | File | Change |
|---|---|---|
| N0 | `ArrangementLane.tsx` imports | Add `import { ChevronDown, ChevronRight, Plus } from 'lucide-react';` in Biome order. |
| N1 | l.687 lane fold | Children `{folded ? '▸' : '▾'}` → `{folded ? <ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" /> : <ChevronDown … same props />}`. The class is unchanged (already `flex items-center justify-center`). |
| N2 | l.713–721 compact import | Children `＋` → `<Plus className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />`. Class, `aria-label={VIDEO_IMPORT_LABEL}` and `title` are unchanged. |
| N3 | l.723–729 full import | <ul><li>Class gains `flex items-center gap-1` (Biome order).</li><li>Children → `<Plus className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /><span>{VIDEO_IMPORT_LABEL}</span>`.</li></ul> |
| G0 | `ArrangementGroupHeader.tsx` imports | Add `import { ChevronDown, ChevronRight, Layers } from 'lucide-react';` in Biome order. |
| G1 | l.202–229 group fold | R3. Handlers, `aria-*`, `title`, `data-testid` and the remaining classes are unchanged. |
| G2 | l.251–272 group name | <ul><li>Name button class `gap-1` → `gap-1.25`.</li><li>The `<span aria-hidden="true" className="text-xs text-muted">▣</span>` → `<Layers className="size-2.5 shrink-0 text-muted" strokeWidth={2.4} aria-hidden="true" />`.</li><li>The name `<span className="truncate">` is unchanged.</li></ul> |
| C0 | `ArrangementClip.tsx` imports | Add `import { Film, GripVertical } from 'lucide-react';` in Biome order. |
| C1 | l.833–850 clip header | <ul><li>Header class `gap-1` → `gap-0.75`.</li><li>`<span aria-hidden="true">{isVideo ? '▶' : '⠿'}</span>` → `{isVideo ? <Film className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /> : <GripVertical … same props />}`.</li><li>`onPointerDown`, `title` and the title span are unchanged.</li></ul> |
| — | all three files | **Everything else is byte-identical:** surfaces, colours, borders, hovers, widths, handlers, refs, gestures, memo, the group Mute/Solo pseudo letters. If Biome reorders class tokens, follow it and report the final strings. |
| S1 | `strings.ts` | R4: the constant plus exactly 2 values. Every other byte is unchanged, including l.305/l.307, l.735/l.736 and `videoImportTitle`. |
| D3 | **new** `docs/implementation/2026/quarter-IV/131-studio-v3c2-lane-group-clip-icons.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1 (R2''') with both §0.1 probe tables, the R2 mapping, R3, R4, R5, class/children before and after, tests and mutations.</li><li>States that C-R154-02 and GATE139-EMPTY-VIDEO-FORMATTER close if C passes.</li><li>TODO: V-3c-3..5, Q-V3-ICON-SIZE (now with the R2''' gap rule), the stale `.replace('▣', '')` no-ops in frozen `group-volume-db` l.322 and `track-group-mix-ui` l.262/l.417 (polish pass), M1/M3/M4.</li><li>Status: `In Progress (awaiting C round 162)`.</li></ul> |
| D4 | `130-studio-v3c1-library-icons.md` | Exactly one edit: the status line **l.4** → `**სტატუსი:** Completed (C round 161 PASS; published f08c7ce)`. |

**Tailwind generation check by A:**
- Fetch the served dev CSS (`http://127.0.0.1:5173/app/styles/app.css?direct`).
- Confirm that `.gap-1\.25`, `.gap-0\.75`, `.gap-1`, `.size-2\.5`, `.size-3`, `.items-center` and `.flex` exist after the edit. `gap-1.25` is new in the source, so this is a real generation check.
- Save the result as `a-round-162/tailwind-css-check.json`. If the dev server is not running, start it in the background and record that.

**Not allowed:**
- `app/styles/**`, any other component, `package.json`, `~/components/icons`;
- `style=` (other than the existing computed px styles), custom CSS, a hex value, an arbitrary `[...]` value, or a new token;
- any surface/colour/radius/border/hover change (V-3c-4);
- strings other than R4.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | N0–N3 |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | G0–G2 |
| `app/components/arrangement/ArrangementClip.tsx` | C0–C1 |
| `app/lib/arrangement/strings.ts` | S1 |
| `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>l.1919 and l.1927 expected values follow R4.</li><li>Add **LG2** (V-3c-2 glyph lock): `videoImportLabel === 'Your own video'`, `videoEmptyHint === \`use “${videoImportLabel}” or drop a file here\``, and neither matches `/[▶◀×▾▸■＋⌫▣⠿]/u`.</li></ul> |
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | <ul><li>l.287/l.292: fold `textContent` `'▾'`/`'▸'` → the fold contains one `svg.lucide-chevron-down` / `svg.lucide-chevron-right` and `textContent` is `''`.</li><li>l.310–321: name `'Your own video'`; the full button `textContent` is `'Your own video'`; the compact `textContent` is `''` and it holds one `svg.lucide-plus`. The `it` title may drop `＋`.</li></ul> |
| `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | <ul><li>l.241–243: name `'Your own video'`, compact `textContent` `''` + one `svg.lucide-plus`, `title` unchanged.</li><li>l.255: `'No video — use “Your own video” or drop a file here'`.</li><li>Add **LV1** (see below).</li></ul> |
| `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | <ul><li>UC1 l.472/l.480: `dataset.foldGlyph` → one `svg.lucide-chevron-down` / `svg.lucide-chevron-right` in the fold, and `fold.hasAttribute('data-fold-glyph')` is `false`.</li><li>l.682, l.719, l.722: `'group:▣Group 1'` → `'group:Group 1'`.</li><li>Add **LGH1** (see below).</li></ul> |
| `app/lib/arrangement/__tests__/track-groups-ui.test.tsx` | l.454, l.493, l.533: `'group:▣Group 1'` → `'group:Group 1'`. Nothing else. |
| `app/lib/arrangement/__tests__/clip-strings-ui.test.tsx` | Add **LC1** (see below). Nothing else. |
| `docs/…/130-studio-v3c1-library-icons.md` | D4 only |
| **new** `docs/…/131-studio-v3c2-lane-group-clip-icons.md` | D3 |

**New locks:**
- **LV1, lane** (`lane-strings-ui`, existing mount):
  - Each lane fold holds exactly one `svg` with `aria-hidden="true"`: `lucide-chevron-down`, `size-3`, `stroke-width` 2, `textContent` `''`. After a fold click it holds `lucide-chevron-right`.
  - The full import button holds `svg.lucide-plus` (`size-2.5`, stroke 2.4) followed by the text `Your own video`. Its class contains `flex`, `items-center` and `gap-1`, and not `gap-0.5`.
  - The compact import button (after folding the video lane) holds one `svg.lucide-plus`, `size-2.5`, stroke 2.4, and `textContent` `''`.
  - No text inside any `[data-testid="arrangement-track-header"]` contains any of `▶◀×▾▸■＋⌫▣⠿`.
- **LGH1, group** (`track-group-collapse-ui`, existing mount + `groupStemsAndSfx`):
  - The group fold holds one `svg.lucide-chevron-down` (`size-3`, stroke 2, `aria-hidden`); after a click it holds `lucide-chevron-right`.
  - Its `className` contains neither `before:content-['▸']` nor `before:content-['▾']`.
  - The group name button holds one `svg.lucide-layers` (`size-2.5`, `text-muted`, stroke 2.4, `aria-hidden`) before the name span. Its class contains `gap-1.25`. Its `textContent` is exactly `Group 1`.
  - No text in `[data-testid="arrangement-group-header"]` contains any of `▶◀×▾▸■＋⌫▣⠿`, checked expanded and collapsed.
- **LC1, clips** (`clip-strings-ui`, existing mount with an audio clip and a video clip):
  - The audio clip header's first child is `svg.lucide-grip-vertical`; the video clip header's first child is `svg.lucide-film`. Both are `size-2.5`, stroke 2.4, `aria-hidden`.
  - The header class contains `gap-0.75` and not `gap-1`.
  - No text in any `[data-clip-id]` contains `▶` or `⠿`.
  - If this file's fixture cannot render a video clip, A puts the video half in `lane-strings-ui`, which already mounts a video clip (l.195), and reports where.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio or gesture logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `f08c7ce` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementVideoDock.tsx`, `studio-lab.tsx`, docs 127–129;
- the frozen tests `group-volume-db`, `track-group-mix-ui` and `floating-video`.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning:**
- The V-3c-2 glyphs appear in source only in the three components and `strings.ts` (l.641/l.653). `data-fold-glyph` is read only by UC1.
- In tests they appear as assertions only in the 5 granted test files.
- `group-volume-db` l.322 and `track-group-mix-ui` l.262/l.417 call `.replace('▣', '')`. That becomes a no-op and stays green, so those files stay frozen (doc 131 TODO).
- No e2e spec uses these glyphs.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 19 files in `b-round-161-r162-vitest-base.txt`. Expect 353/353. Save the list as `a-round-162/vitest-files.txt` and the result as `a-round-162/vitest-baseline.json`.
- **After the edits:**
  - Run the same 19 files. Expect 353 plus the new `it`s (LV1, LGH1, LC1, LG2), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 10 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-162/mutations/`):
  - **m167:** swap `ChevronDown` ↔ `ChevronRight` on the lane fold. LV1 or track-layout turns red.
  - **m168:** put back `"before:content-['▾']"` for the expanded group fold. LGH1 turns red.
  - **m169:** clip header `gap-0.75` → `gap-1`. LC1 turns red.
  - **m170:** group mark `size-2.5` → `size-3`. LGH1 turns red.
  - **m171:** restore `'＋ Your own video'` as the constant's value. LG2 and LV1 turn red.
  - **m172:** video clip mark `Film` → `Play`. LC1 turns red.
  - Do not use a "remove aria-hidden" mutant: it is equivalent (INFO-R160-M160-EQUIVALENT).
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 969 files are OK, and the protected diff vs `f08c7ce` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 131), nothing else.
  - Write `a-round-162/end-sha256.txt` (all changed paths + doc 131) and `a-round-162/diff-vs-start.patch` (vs `b-round-161/r162-granted-start/`, plus doc 131 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE: the new lucide imports can trigger "Invalid hook call").
- **Harness rules:** make a range by a clip-body drag (a ruler drag navigates). Escape does not clear a range. Snap off before move measurements.
- Copy the tools you reuse (`c-round-160/tools/{d6,lib,lib122,h3,wav,report}.cjs`) unchanged into `c-round-162/tools/` and check the d6 sha256. The copy keeps d6 output out of earlier folders.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T162-TARGETED | Re-run `a-round-162/vitest-files.txt`. The counts equal A's, and LV1, LGH1, LC1 and LG2 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `f08c7ce`.</li><li>The frozen 969 files are OK at start and at end.</li><li>The end hashes equal `a-round-162/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 131 as `??`, nothing else.</li><li>The protected diff vs `f08c7ce` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-161/r162-granted-start/` itself:<ul><li>The components change only N0–N3, G0–G2 and C0–C1.</li><li>`strings.ts` changes only R4 (one constant and 2 values).</li><li>The test files change only the listed lines plus LV1/LGH1/LC1/LG2. No assertion is weakened: count `expect(` per file before and after; a drop needs a reason.</li><li>Doc 130 changes only D4, and doc 131 exists with the D3 sections.</li><li>No new `style=`, no CSS file, no hex, no arbitrary `[...]`, no surface change.</li></ul> |
| ICON-V3C2 | Both viewports. States: S0; S0-folded (Music and Video folded); S1 (d6 S1 recipe: 3 audio clips, video `beeps-6s-h264-aac.mp4`, Music+Stems grouped); S1-group-collapsed.<ul><li>Each icon site has exactly one `svg`, `aria-hidden="true"`, the lucide class from R2, and a rendered box of 12×12 (folds) or 10×10 (Plus, Layers, Film, GripVertical) ±0.5 px, with the `stroke-width` from R1.</li><li>Computed `stroke` equals the host's computed `color`: muted at rest and foreground on hover for the folds; brand for both Plus; muted for Layers; the header text colour for the clip marks, including the selected clip (brand-foreground).</li><li>Fold and compact Plus icons are centred in their buttons (centre delta ≤ 0.5 px).</li><li>No `▶◀×▾▸■＋⌫▣⠿` text in any track header, group header or clip.</li><li>CDP accessible names: lane fold `Fold or unfold — <track>` and group fold/name unchanged; full and compact import `Your own video`.</li><li>**C-R154-02 closure:** the group name button has no text node with U+25A3, and `CSS.getPlatformFontsForNode` on it lists no DejaVu entry.</li><li>Empty video lane placeholder reads exactly `No video — use “Your own video” or drop a file here`.</li><li>Screenshots of each state at both viewports.</li></ul> |
| RV1-V3C2 | <ul><li>Run the copied `d6.cjs` (sha256 `3abc88fe…`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-161/out/d6/d6-{1440,1280}-r1.json`** after applying `b-round-161-r162-d6-key-renames.json` (6 keys).</li><li>Expected: no key missing or added apart from those renames, and every x/y/w/h within ±1 px. The probe predicts 0 px for every d6 element.</li><li>A missing or added key outside the map, a collision, or any delta > 1 px is a finding.</li><li>Report the per-key deltas for the track headers, the group row, the clips and the video import button.</li></ul> |
| LANE-STATES-BOX | The four probe states at both viewports, as raw `getBoundingClientRect` values (0.01 px).<ul><li>The **pre-change baseline is B's probe at `f08c7ce`**: `b-round-161/out/v3c2-probe-final.json`, `"before"` arrays per viewport and state (`S0`, `S0-folded`, `S1`, `S1-group-collapsed`).</li><li>Keys are built by `measure()` in `b-round-161/v3c2-probe-final.cjs`; C may reuse it. It strips the glyphs from text keys and the `＋ ` from aria-labels, so most keys match after the change. Four exceptions are listed below.</li><li>Use the same preparation as the probe.</li><li>**Expected renames (compare these, do not skip them):**<ul><li>`button: Your own video|track:video#1` (leading space in the baseline key) → `button:Your own video|track:video#1`.</li><li>The video track row `div:Video Your own video…|#1` and its header `div:Video Your own video|track:video#1` lose that space. Re-key both by `[data-track-id=video]` and its `[data-testid=arrangement-track-header]`, then compare the boxes.</li></ul></li><li>**Expected missing keys:** only the removed glyph spans (`span:|clip@…`, `span:|group#1`).</li><li>**Expected added keys:** exactly one `svg:` key per icon site (each lane fold, the compact or full import, the group fold, the group name, each clip header) plus one `span:Your own video|track:video#1`. Any other missing or added key is a finding, unless it is a text-keyed `div`/`p`/`span` whose text changes only by the removed glyph and space (a note).</li></ul>**Finding set:** every element keyed by `data-testid` or `aria-label`, every `[data-clip-id]`, track header and group header, any delta > 1 px. Inner title spans (clip title, group name) must stay within ±1 px; the probe predicts ≤ 0.35 px. Specifically:<ul><li>(a) Lane fold 20×20, compact import 20×20, group fold 24×24.</li><li>(b) Full import button 107×22 ±1 and the track-name button width unchanged ±1.</li><li>(c) Clip header height 20 and clip boxes unchanged.</li></ul> |
| FUNC-SMOKE-LANE | Each control does its real action, at both viewports. **Every pointer action lands on the icon's centre**, read from the svg's rect.<ul><li>**Lane fold:** clicking the chevron folds Music (row height drops, `aria-expanded=false`, chevron right) and unfolds it again. Space on the focused fold does the same.</li><li>**Video import:** the full button, and the compact button with the video lane folded, each open a file chooser (`page.waitForEvent('filechooser')`). Choosing `beeps-6s-h264-aac.mp4` through the chooser places a video clip with real duration (≈ 6 s).</li><li>**Group fold:** clicking the chevron collapses the group (member lanes hidden, overview band shown) and expands it again. `U` with the group selected still toggles it.</li><li>**Group name:** clicking on the Layers icon selects the group (the name's aria-label gets the selected suffix).</li><li>**Clip move by the icon** (snap off): a pointer drag that starts on GripVertical moves the audio clip by the dragged time (±1 px of the drag); a drag that starts on Film moves the video clip. Each move is one Undo entry; Ctrl+Z restores the start.</li><li>**Audio still plays:** Play with the moved clips gives real output (tap peak > 0).</li></ul> |
| G162-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–161): the library rows (ICON-V3C1, LIB-STATES-BOX), the transport rows (ICON-V3B, SURFACE-STYLE, CASCADE-SCOPE), CONTRAST-V3A and every V-2 row. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Track header layout: name button width, M/S, compact density | RV1-V3C2, LANE-STATES-BOX (b) |
| Clip move/select gesture starting on the header | FUNC-SMOKE-LANE (clip move by the icon) |
| Group collapse, overview band, group selection | FUNC-SMOKE-LANE, T162-TARGETED (UC1, track-groups-ui) |
| Video import path and file picker | FUNC-SMOKE-LANE |
| Clip title truncation in short clips | LANE-STATES-BOX (c), screenshots |
| Lane fold keyboard (Space, no repeat) | FUNC-SMOKE-LANE, T162-TARGETED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Lucide icons for lane/group fold, video import, group mark and clip kind/grip marks, sized to the old glyph slot | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts, gestures and focus are unchanged. `Layers`/`Film`/`GripVertical` are CZABA's choices (R2), not Ableton claims. No claim is made that Live draws its fold triangles or clip headers this way. | Requirement: ICON-V3C2, RV1-V3C2, LANE-STATES-BOX, FUNC-SMOKE-LANE. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-162.md`, `a-round-162-result.json` and `a-round-162/` (vitest JSON and list, tailwind-css-check, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-162.md` and `c-round-162.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ICON-V3C2, RV1-V3C2 and LANE-STATES-BOX tables (both viewports). Put tools, out and shots in `c-round-162/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 163 planning)
| Condition | Round 163 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item, both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on RV1-V3C2 / LANE-STATES-BOX (> 1 px) | B re-plans with C's measurements within R1, or records Q-V3-ICON-SIZE as needing Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-2's own code and cheap; otherwise `deferred_low_polish`, and V-3c-3 goes ahead. |
| C PASS | Root publishes round 162. V-3c-2 → **მზადაა**; C-R154-02 and GATE139-EMPTY-VIDEO-FORMATTER → closed. Round 163 = **V-3c-3** (dock / marker row / detail panel / grid menu / ← CZABA, split if the grants exceed about 12), unless the regression is due. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 162: the changed granted paths plus the new doc 131, vs `f08c7ce`. `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `collection.ts`, the library and transport components, and the purchase/auth files are unchanged.
- **Checkpoint:** `b-round-160-checkpoint-request.md` is still open. It is non-blocking for V-3c-1..3. It is the input B needs before V-3c-4 (surfaces); without an answer by then, B applies fallback (c), copies locked by tests, and records it. The round-161 note proposing a shared `studio-icon` size/stroke constant module after V-3c-3 (only worth it if Q-V3-ICON-SIZE (a) is chosen) is recorded as a backlog signal for that checkpoint, not scheduled.
- **User-visible decisions (may be vetoed in `feature-status.md`):** R1 (R2''' gap rule: `gap-1` import, `gap-1.25` group name, `gap-0.75` clip header), R2 (`Layers` group mark, `Film` video clip mark, `GripVertical` audio clip mark, chevron folds, `Plus` import), R3 (`data-fold-glyph` removed), R4 (`Your own video` label and hint).
