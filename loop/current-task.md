# CURRENT TASK — Round 166: V-3c-3b — marker ◀ ▶, detail `Expand ▸` / `Collapse ▾`, grid menu ✓ and `← CZABA` become lucide icons; every box stays within ±1 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z131** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c3b_plan_d29z131`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-165.md`, an exact copy of the round-165 `current-task.md` (sha256 `2912c36d…4245`). Rationale for this round: `b-round-165.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ ("the icon matches the old symbol's box, so the element does not move"). It is source material only and grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` are unchanged since round 164 planning. Nothing in them changes this stage.

## Baseline = HEAD `7581483`, clean tree (gate 165 published)
- `gates/gate-round-165.json`: status `published`, commit `75814838b35be7f3ac8befa2c2f007b0cde51d28`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **984** files.
- **Frozen list:** `b-round-165-r166-tree-sha256.txt`, **973 entries** (984 minus the 11 grants).
- **Grants:** `b-round-165-r166-grants.txt` (11 existing files). **New file:** `b-round-165-r166-new-files.txt` (1: doc 135).
- **Start hashes:** `b-round-165-r166-granted-start-sha256.txt`. **Start copies:** `b-round-165/r166-granted-start/`.
- **A's first step:** check that HEAD = `7581483`, the tree is clean, the 973 frozen files match (`sha256sum -c --quiet`) and the 11 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z131)
- **Round 165: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `7581483`.
  - **ROOT-RECON-MARKER-ENTER → მზადაა**, on C's evidence: MK-GESTURE passed at both viewports with real mouse hold, Shift+Tab and F2. MK-BASELINE-CHECK proved the row can fail.
  - **Caveat, kept in the backlog:** the Enter guard (K2) has no browser lock. MK-ENTER-OPEN is BLOCKED (harness). The workspace's capture-phase pointerdown handler blurs the editor before any gesture starts, so no real or synthetic browser path reaches it. K2 is covered only by MU15/MU16 and mutations m183/m184.
- **The outcome was fixed in advance** (`tasks/round-165.md` §7, "C PASS" row): round 166 = **V-3c-3b**. The inventory is in `backlog.json` `v3c3a_plan_d29z128.v3c3b_inventory`. The scope is unchanged.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **Checkpoint:** `b-round-160-checkpoint-request.md` still has no answer. B wrote a bounded addendum, `b-round-165-checkpoint-request.md` (see §8). It does not block icon stages.
- **Size:** 4 components, `strings.ts`, 5 test files and 2 docs, so 11 grants + 1 new doc. This is under the split threshold of about 12. Every change is children/class only. There is no handler, focus or gesture change.

### 0.1 B evidence (planning data, not C rows)
**Probe 1, glyph metrics and single-site swaps** (`b-round-165/v3c3b-probe.cjs` → `out/v3c3b-probe.json` + png). Measured in real Chromium on `/studio-lab` at `7581483`. States: S0-default, S1-detail-toggled and S2-grid-menu (right-click on the music lane body). The results are identical at 1440 and 1280.

| Site (`data-testid`) | Glyph | Font | Glyph box (w) | Host box | Host sizing |
|---|---|---|---|---|---|
| `arrangement-marker-prev` | ◀ | 12 px | 9.234 | 19.234×16 | content-sized (`h-4 px-1`, border 1) |
| `arrangement-marker-next` | ▶ | 12 px | 9.234 | 19.234×16 | content-sized, directly right of prev |
| `arrangement-marker-add` | + (ASCII) | 12 px | 6.000 | 16×16 | content-sized, directly left of prev |
| `arrangement-detail-toggle` | `Collapse ▾` / `Expand ▸` | 12 px (inherited) | glyph 6.031, space 2.000, word 48 / 42 | 74.031 / 68.031 × 24 | content-sized (`h-6 px-2`); the header label left of it absorbs width changes |
| `arrangement-exit` | `← CZABA` | 14 px | arrow 11.734, space 3.016, word 47.016 | 69.734×20 | content-sized (`px-1`) |
| grid menu checked span | ✓ | 12 px | 7.234 | fixed `w-3` (12 px) | fixed |

**Single-site swap results** (max element edge delta over 137–157 keyed elements):
- **Marker:**
  - A 10 px svg grows each step button by 0.766 px. If both buttons change, the right edge of `next` moves 1.53 px, which is **> 1 px**.
  - A 12 px svg moves things 2.77 px.
  - On the `+` button, a 10 px svg moves prev and next by 4 px; an 8 px svg moves them by 2 px.
- **Detail toggle:** a word + 10 px svg with a 2 px gap is +3.97 px wide, and every other gap or size is worse. The extra width is exactly the 10 px icon minus the 6.03 px glyph.
- **Exit link:** a 12 px svg with a 3 px gap is +0.266 px. A 2 px gap is −0.734 px. A 14 px svg is ≥ 1.27 px.
- **Grid ✓:** a 10 px svg in the `w-3` span moves 0.000 px. In a flex span it is centred exactly (dx 0).

**Probe 2, the combined final variant** (`b-round-165/v3c3b-final.cjs` → `out/v3c3b-final.json`). It applies all rulings below at once, in all 3 states at both viewports:
- The **max edge delta is 0.468 px**: `next` moves −0.234 and its right edge −0.468.
- Other deltas: exit width +0.266, detail toggle width −0.031 (its x +0.031), header label width +0.031.
- **0 added and 0 missing keys.** Every svg is centred in its host (dy = 0; the marker and grid svgs also have dx = 0).
- The `before` arrays in `out/v3c3b-final.json` are **C's ICON-BOX baseline**.

**d6 keys:**
- The box keys of the four hosts are `data-testid` keys and do not change.
- Six contrast and box keys change. Map: `b-round-165-r166-d6-key-renames.json`.
  - `textContent` loses the glyph: `Collapse ▾` → `Collapse`, `Expand ▸` → `Expand`, `← CZABA` → `CZABA`.
  - The icon-only marker buttons fall back to `aria-label`: `◀` → `Previous marker (Ctrl+←)`, `▶` → `Next marker (Ctrl+→)`.
  - The header box key is sliced at 40 characters: `header:← CZABACZABA Studio Lab · WorkspaceMaste#1` → `header:CZABACZABA Studio Lab · WorkspaceMasterM#1`. B measured the new value in the browser (`b-round-165/header-key.cjs`).
- B checked the map against the reference. The old-key counts are 2/0/4/2/2/3 at 1440 and 1/1/4/2/2/3 at 1280, and there are 0 collisions.

**RV-1 reference:** still `c-round-164/out/d6/d6-{1440,1280}-r1.json`, made with `d6.cjs` sha256 `3abc88fe…`. Round 165 changed behaviour only, with no class or markup change (C AN-REVIEW), so it is valid at `7581483`.

**Vitest base:** `b-round-165-r166-vitest-base.txt` (11 files). B ran it at `7581483`: **206/206** (`b-round-165/out/vitest-base-r166.json`). The tree was clean after the run.

### 0.2 B rulings (D-29z131; all user-vetoable in `feature-status.md`)
**R1 — Icon mapping and size:**

| Site | Glyph | Icon | Size / stroke | Host class change | Source |
|---|---|---|---|---|---|
| marker prev | ◀ | `ChevronLeft` | `size-2.25` (9 px), `strokeWidth={2.4}` | adds `inline-flex items-center justify-center` (prev/next only) | **B ruling.** The inventory's proposal: a step to a marker is navigation, not Play. The size is **9 px instead of R2''’s 10 px**, because at 10 px the two adjacent content-sized buttons add up to 1.53 px (probe 1). 9 px is the nearest step to the 9.234 px glyph. |
| marker next | ▶ | `ChevronRight` | same | same | same |
| marker add | + | **stays the text `+`** | — | none: its `className` is byte-identical | **B ruling R5** (below) |
| detail toggle, open | `Collapse ▾` | `Collapse` + `ChevronDown` | `size-2.5`, `strokeWidth={2.4}` | `px-2` → `pl-2 pr-1`; adds `inline-flex items-center gap-0.5` | **B ruling.** The same pair as the V-3c-1 collection fold. The gap is the old 2 px space (R2'''). The right padding is 4 px smaller because the icon is 4 px wider than the glyph (10 − 6.03), so the box and the word's x stay where they are. |
| detail toggle, collapsed | `Expand ▸` | `Expand` + `ChevronRight` | same | same | same |
| grid menu checked mark (3 sites: radio, Snap, Triplet) | ✓ | `Check` | `size-2.5`, `strokeWidth={2.4}` | span `w-3 text-accent` → `flex w-3 justify-center text-accent` | **B ruling.** The span is fixed at 12 px, so nothing moves. An empty span (unchecked) renders nothing, as now. |
| exit link | `← CZABA` | `ArrowLeft` + `CZABA` | `size-3`, `strokeWidth={2}` | adds `inline-flex items-center gap-0.75` | **B ruling, R2''** (14 px text → `size-3`/2, gap = old space ≈ 3 px). |

Every icon is `aria-hidden="true"` with `shrink-0`, the same recipe as V-3c-1…3a. The icon follows `currentColor`: muted/foreground for the marker buttons, foreground/brand for the toggle, accent for the grid check, and muted/brand for the exit link. No colour class changes.

**R2 — Strings** (`strings.ts`, `studioDetailStrings`):

| Line | Key | Old | New |
|---|---|---|---|
| l.737 | `expandText` | `'Expand ▸'` | `'Expand'` |
| l.738 | `collapseText` | `'Collapse ▾'` | `'Collapse'` |

Every other byte of `strings.ts` is unchanged. That includes `previousTitle`/`nextTitle` and every other `←`/`→` key notation (SG rule: keyboard-key notation stays), `expandLabel`/`collapseLabel`, and the shortcut hint at `StudioWorkspace.tsx` l.2610.

**R3 — Accessibility:**
- The `aria-label`, `title` and `aria-keyshortcuts` of marker prev/next and the detail toggle are byte-identical.
- The grid check spans are already `aria-hidden`, so the menu item names (the division labels, `Snap (G)`, the triplet label) are unchanged.
- **One accessible name changes:** the exit link reads `CZABA` instead of `← CZABA`, because the arrow is now a hidden icon. The arrow was decorative, and the link's purpose (back to the store) is unchanged. No `aria-label` is added. B ruling, user-vetoable.

**R4 — Out of this stage (recorded):**
- **Surfaces:** borders and fills are V-3c-4, and the panel radius is V-3c-5.
- **Text left on purpose:** `+/−` in the shortcut hint, `scenes.$productId.tsx` (`← Collection recordings`, outside Studio) and `LeadMagnetPopup.tsx` (outside Studio).
- **Out of scope:** the purchased `/studio/$productId` route (protected).

**R5 — Marker `+` stays text:**
- It is an ASCII character of the UI font, not one of the unicode symbols in the spec's table.
- A `Plus` icon of any legible size (8–10 px) moves prev/next by 2–4 px (probe 1). A 6 px icon would match the box but would be too small to read.
- B adds this as a question to Q-V3-ICON-SIZE for Saba: accept the shift, or keep `+`. Until he answers, `+` stays.

## 1. What changes (exact; line numbers at `7581483`)
| ID | File | Change |
|---|---|---|
| K0 | `ArrangementMarkerRow.tsx` imports | Add `import { ChevronLeft, ChevronRight } from 'lucide-react';` in Biome order. |
| K1 | `ArrangementMarkerRow.tsx` l.711–742 (prev/next buttons) | <ul><li>Children: `◀` → `<ChevronLeft className="size-2.25 shrink-0" strokeWidth={2.4} aria-hidden="true" />` and `▶` → `<ChevronRight …same… />`.</li><li>The two buttons' `className` = `MARKER_HEADER_BUTTON_CLASS` + `inline-flex items-center justify-center`. A may use a new module const (e.g. `MARKER_STEP_BUTTON_CLASS`).</li><li>`MARKER_HEADER_BUTTON_CLASS` itself and the add button stay **byte-identical**.</li><li>Handlers, `aria-*`, `title` and `data-testid` are unchanged.</li></ul> |
| P0 | `ArrangementDetailPanel.tsx` imports | Add `ChevronDown, ChevronRight` from `lucide-react`, merged into an existing lucide import if there is one. |
| P1 | `ArrangementDetailPanel.tsx` l.1131–1145 (toggle) | <ul><li>`className`: `px-2` → `pl-2 pr-1`, and add `inline-flex items-center gap-0.5`. Every other token is unchanged.</li><li>Children: `{size.isCollapsed ? expandText : collapseText}` followed by `size.isCollapsed ? <ChevronRight …/> : <ChevronDown …/>`, both `className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true"`.</li><li>Handlers, `aria-*` and `data-testid` are unchanged.</li></ul> |
| G0 | `ArrangementGridMenu.tsx` imports | Add `import { Check } from 'lucide-react';`. |
| G1 | `ArrangementGridMenu.tsx` l.203–205, l.223–225, l.241–243 | <ul><li>Each span's `className` `w-3 text-accent` → `flex w-3 justify-center text-accent`.</li><li>Children `cond ? '✓' : ''` → `cond ? <Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /> : null`.</li><li>Roles, `aria-checked`, `tabIndex`, handlers and `GRID_MENU_ITEM_CLASS` are unchanged.</li></ul> |
| W0 | `StudioWorkspace.tsx` imports | Add `import { ArrowLeft } from 'lucide-react';` in Biome order. Only this import line is added. |
| W1 | `StudioWorkspace.tsx` l.2193–2200 (the `arrangement-exit` `Link`) | <ul><li>`className` gains `inline-flex items-center gap-0.75`; every other token is unchanged.</li><li>Children `← CZABA` → `<ArrowLeft className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />CZABA`, with no space text node.</li><li>**No other hunk in `StudioWorkspace.tsx`.**</li></ul> |
| S1 | `strings.ts` | R2: exactly the 2 values. |
| D1 | `docs/implementation/2026/quarter-IV/134-studio-marker-gesture-commit-guard.md` | Exactly one edit: the status line **l.4** → `**სტატუსი:** Completed (C round 165 PASS; published 7581483)` (gate 165 review suggestion 1). |
| D2 | **new** `docs/implementation/2026/quarter-IV/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1–R5, the §0.1 probe tables (both probes), why 9 px and `pr-1`, the d6 rename map, class and children before and after, tests and mutations.</li><li>TODO: V-3c-4/5, Q-V3-ICON-SIZE (with the R5 `+` question), DUX-R-5, M1/M3/M4.</li><li>Status: `In Progress (awaiting C round 166)`.</li></ul> |

**Not allowed:**
- `app/styles/**`, any other component, `package.json`, `~/components/icons`;
- `style=` (other than the existing computed px styles), custom CSS, a hex value, an arbitrary `[...]` value, or a new token;
- any surface, colour, radius, border or hover change (V-3c-4);
- strings other than R2;
- any change to pointer, keyboard or focus logic.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementMarkerRow.tsx` | K0, K1 |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | P0, P1 |
| `app/components/arrangement/ArrangementGridMenu.tsx` | G0, G1 |
| `app/components/arrangement/StudioWorkspace.tsx` | W0, W1 only |
| `app/lib/arrangement/strings.ts` | S1 |
| `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>l.2164/2165 expected values follow R2.</li><li>Add **LG4** after LG3: `expandText === 'Expand'` and `collapseText === 'Collapse'`, and neither matches `/[▶◀×▾▸■＋⌫▣⠿⤢✕✓←]/u`.</li></ul> |
| `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` | <ul><li>l.206 → `'Collapse'` and l.215 → `'Expand'`.</li><li>Add **DPS5** (below).</li></ul> |
| `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` | <ul><li>l.570: drop the `.replace('✓', '')`, which no longer does anything. Compare `radio.textContent` directly with the same expected array.</li><li>Add **TU11** (below).</li></ul> |
| `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | Add **MS4** (below). Nothing else. |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | Add **TS7** (below). Its `Link` mock forwards `className` and `children`, so the real classes and icon reach the DOM. Nothing else. |
| `docs/…/134-studio-marker-gesture-commit-guard.md` | D1 only |
| **new** `docs/…/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | D2 |

**New locks.** Use each file's existing mount helper.
- **MS4, marker step icons:**
  - `arrangement-marker-prev` holds exactly one `svg.lucide-chevron-left`, and `arrangement-marker-next` exactly one `svg.lucide-chevron-right`. Each svg has `aria-hidden="true"`, class `size-2.25` and `shrink-0`, and `stroke-width` `2.4`. Each button's `textContent` is `''`.
  - Both buttons' classes contain `inline-flex`, `items-center` and `justify-center`.
  - `aria-label`, `title` and `aria-keyshortcuts` equal the MS1 values.
  - `arrangement-marker-add`: `textContent` is `'+'`, it has no `svg`, and its class has no `inline-flex`.
  - The marker header text has no `◀` or `▶`.
- **DPS5, detail toggle icon.** The initial state may be open or collapsed (in the browser it is open at 1440 and collapsed at 1280). Follow DPS1's pattern: branch on `panel.dataset.collapsed`, assert that state, click, and assert the other state.
  - Open state: one `svg.lucide-chevron-down`, no `lucide-chevron-right`, and `textContent` is `'Collapse'`.
  - Collapsed state: one `svg.lucide-chevron-right`, no `lucide-chevron-down`, and `textContent` is `'Expand'`.
  - The svg has `aria-hidden="true"`, `size-2.5`, `shrink-0` and stroke 2.4.
  - The toggle class contains `inline-flex`, `items-center`, `gap-0.5`, `pl-2` and `pr-1`, and **not** `px-2`.
  - The `aria-label` follows the existing DPS values.
- **TU11, grid menu check icons** (`mountTripletWorkspace`, right-click the music lane body):
  - Exactly one radio holds an `svg.lucide-check`: the one with `aria-checked="true"`. Every other radio's `span[aria-hidden]` is empty.
  - The Snap checkbox holds a check iff `aria-checked="true"`. Toggle Snap and reopen the menu to see both states.
  - The Triplet checkbox (when present) holds a check iff it is checked.
  - Every check svg has `size-2.5`, stroke 2.4 and `aria-hidden`, and its parent span class contains `flex`, `w-3`, `justify-center` and `text-accent`.
  - No `✓` anywhere in the menu's `textContent`.
- **TS7, exit link:**
  - `arrangement-exit` holds exactly one `svg.lucide-arrow-left` (`aria-hidden`, `size-3`, `shrink-0`, stroke 2), and its `textContent` is `'CZABA'`.
  - Its class contains `inline-flex`, `items-center` and `gap-0.75`.
  - The `href` is `/`. No `←` is inside the header's `textContent` before the `h1`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio, video or gesture logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `7581483` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementClip.tsx`, `ArrangementVideoDock.tsx`, `ArrangementMarkerMenu.tsx`, every other Arrangement component, `studio-lab.tsx`, docs 127–133;
- the frozen tests `markers-ui`, `marker-edge-nav-ui`, `grid-snap-menu`, `detail-panel`, `master-ui` and `purchased-collection-ui` (they are in the vitest list as neighbours).

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning:**
- In Studio source, ◀ ▶ appear only in `ArrangementMarkerRow.tsx` l.725/741, ✓ only in `ArrangementGridMenu.tsx` l.204/224/242, `← CZABA` only in `StudioWorkspace.tsx` l.2199, and `Expand ▸`/`Collapse ▾` only in `strings.ts` l.737/738.
- The only test assertions on them are `strings.test.ts` l.2164/2165, `detail-panel-strings-ui` l.206/215 and `grid-triplet-ui` l.570.
- `master-ui`, `meter-ui`, `transport-surface-ui`, `purchased-collection-ui` and `library-row-strings-ui` mock `Link` and do not assert its text.
- No e2e spec uses these glyphs, `arrangement-exit` or the `← CZABA` name (`e2e/navigation.spec.ts` matches an `h1` with `CZABA` on the home page, not this link).

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 11 files in `b-round-165-r166-vitest-base.txt`. Expect 206/206. Save the list as `a-round-166/vitest-files.txt` and the result as `a-round-166/vitest-baseline.json`.
- **After the edits:**
  - Run the same 11 files. Expect 206 plus the new `it`s (MS4, DPS5, TU11, TS7, LG4), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 10 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. At `7581483` they are strings 531, detail-panel-strings-ui 33, grid-triplet-ui 100, marker-strings-ui 25 and transport-surface-ui 56. A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-166/mutations/`):
  - **m185:** marker prev icon `size-2.25` → `size-2.5`. MS4 turns red.
  - **m186:** put the `inline-flex items-center justify-center` on `MARKER_HEADER_BUTTON_CLASS` itself (so the add button gets it too). MS4 turns red.
  - **m187:** detail toggle `pl-2 pr-1` → `px-2`. DPS5 turns red.
  - **m188:** collapsed-state icon `ChevronRight` → `ChevronDown`. DPS5 turns red.
  - **m189:** grid radio check rendered for every radio, not only the checked one (`cond ?` dropped). TU11 turns red.
  - **m190:** exit icon `ArrowLeft` → `ChevronLeft`. TS7 turns red.
  - **m191:** `collapseText` back to `'Collapse ▾'`. LG4 and DPS1/DPS5 turn red.
  - Do not use a "remove aria-hidden" mutant: it is equivalent (INFO-R160-M160-EQUIVALENT).
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 973 files are OK, and the protected diff vs `7581483` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 135), nothing else.
  - Write `a-round-166/end-sha256.txt` (all changed paths + doc 135) and `a-round-166/diff-vs-start.patch` (vs `b-round-165/r166-granted-start/`, plus doc 135 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE: new lucide imports can trigger "Invalid hook call" on the first load).
- Copy the tools you reuse (`b-round-165/tools/*`, `c-round-164/tools/d6.cjs`) unchanged into `c-round-166/tools/` and check the d6 sha256 (`3abc88fe…`). B's probes are `b-round-165/v3c3b-probe.cjs`, `v3c3b-final.cjs` and `header-key.cjs`.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T166-TARGETED | Re-run `a-round-166/vitest-files.txt`. The counts equal A's, and MS4, DPS5, TU11, TS7 and LG4 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `7581483`.</li><li>The frozen 973 files are OK at start and at end.</li><li>The end hashes equal `a-round-166/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 135 as `??`, nothing else.</li><li>The protected diff vs `7581483` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-165/r166-granted-start/` itself:<ul><li>Each component changes only its §1 IDs. `StudioWorkspace.tsx` has exactly 2 hunks (W0, W1).</li><li>`strings.ts` changes only the 2 R2 values.</li><li>The test files change only the listed lines plus the new locks. No assertion is weakened: count `expect(` per file; a drop needs a reason.</li><li>Doc 134 changes only l.4, and doc 135 exists with the D2 sections.</li><li>No new `style=`, CSS file, hex, arbitrary `[...]` value, colour/surface change, or pointer/keyboard/focus logic change.</li></ul> |
| ICON-V3C3B | Both viewports, states S0-default, S1-detail-toggled and S2-grid-menu (right-click on the music lane body; then toggle Snap from the menu and reopen it to see both Snap states). **The detail panel's start state differs by viewport:** S0 is open (`Collapse` + `ChevronDown`) at 1440 and collapsed (`Expand` + `ChevronRight`) at 1280. S1 is the opposite. This is not a finding.<ul><li>Each site has exactly one `svg` with `aria-hidden="true"` and the R1 lucide class (`lucide-chevron-left`, `lucide-chevron-right`, `lucide-chevron-down` / `lucide-chevron-right` in the toggle, `lucide-check`, `lucide-arrow-left`).</li><li>Rendered boxes ±0.5 px: marker 9×9, toggle 10×10, check 10×10, exit 12×12. `stroke-width` is 2.4, or 2 for the exit.</li><li>Computed `stroke` equals the host's computed `color` at rest and on hover (marker: muted → foreground; toggle and exit: → brand; check: accent).</li><li>Each icon is vertically centred in its host (|dy| ≤ 0.5 px). The marker and check icons are also centred horizontally.</li><li>The marker `+` is still the text `+`, with no svg.</li><li>No `◀▶▸▾✓` text in these hosts, and no `←` in the exit link.</li><li>CDP accessible names: `Previous marker (Ctrl+←)`, `Next marker (Ctrl+→)`, `Collapse details` / `Expand details`, `CZABA` (exit link, R3), and the grid item names unchanged (the division labels, `Snap (G)` and the triplet label).</li><li>Screenshots of each state at both viewports, and a 4× zoom crop of the marker header and the toggle.</li></ul> |
| ICON-BOX | Raw `getBoundingClientRect` values (0.01 px) in the same 3 states at both viewports.<ul><li>The **pre-change baseline is B's probe at `7581483`**: `b-round-165/out/v3c3b-final.json`, the `"before"` arrays per viewport and state.</li><li>Keys come from `measure()` in `b-round-165/v3c3b-final.cjs`, which strips the glyphs from text keys and skips svg nodes. C may reuse it unchanged with the same preparation. **Expected added or missing keys:** none.</li></ul>**Finding set:** any element delta > 1 px, or any added or missing key. The expected deltas from B's simulation are: `arrangement-marker-next` x −0.23 and right edge −0.47, `arrangement-exit` w +0.27, and `arrangement-detail-toggle`/`-header-label` ±0.03; everything else 0. |
| RV1-V3C3B | <ul><li>Run the copied `d6.cjs` (sha256 `3abc88fe…`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-164/out/d6/d6-{1440,1280}-r1.json`** after applying `b-round-165-r166-d6-key-renames.json` (6 keys).</li><li>Expected: no key missing or added apart from the map, and every x/y/w/h within ±1 px. The probe predicts ≤ 0.47 px.</li><li>The contrast entries for the 4 hosts keep their old ratios ±0.05, now under the new keys. Report the icon-only marker buttons' icon contrast (d6 `icon>=3` class).</li><li>A key outside the map, a collision, or any delta > 1 px is a finding.</li><li>d6 now classifies marker prev/next as icon-only (`icon>=3`, a 3:1 threshold instead of the text threshold). A contrast-section-only difference on those two mapped keys that comes only from this class change is reported as a note, not a FAIL. The box section stays strict.</li></ul> |
| FUNC-SMOKE-V3C3B | Each control does its real action, at both viewports. **Every pointer action starts on the icon's centre**, read from the svg's rect.<ul><li>**Marker step:** add markers at 2 s and 6 s (M with the playhead there, Enter to name them). From 0, a click on the ChevronRight svg puts the playhead at 2.000, and a second click at 6.000. A click on the ChevronLeft svg goes back to 2.000. Ctrl+→ / Ctrl+← still step. Both buttons keep focus after a click.</li><li>**Marker add `+`:** a click adds a marker at the playhead, as before.</li><li>**Detail toggle:** a click on the chevron svg toggles the panel, and a second click toggles it back. The start state differs by viewport (S0 is open at 1440 and collapsed at 1280). Check both states' icon, text, label and `aria-expanded`: open = `ChevronDown`, `Collapse`, `Collapse details`, `true`; collapsed = `ChevronRight`, `Expand`, `Expand details`, `false`. Enter and Space on the focused toggle do the same.</li><li>**Grid menu:** right-click on the music lane body. Click the `1/8` item's label, reopen: the check is on `1/8` only. Click Snap: the status reports the snap change, and on reopen the Snap check shows the new state. Arrow keys and Enter still move and choose; Esc closes the menu.</li><li>**Exit link:** `href` is `/`. A real click on the ArrowLeft svg navigates: the URL path becomes `/`. The store home may show backend-noise errors in the cloud; only the navigation is judged. Use a fresh context for this sub-row, after the other rows.</li><li>**Audio still plays:** add `demo-middle-east` on music at 0 s, press Play from 0. After 1.5 s the playhead is > 1.0 s, and the audio tap peak is > 0. Stop.</li></ul> |
| G166-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–165): the dock rows (ICON-V3C3A, DOCK-STATES-BOX, FUNC-SMOKE-DOCK), the lane, group and clip rows, the library rows, the transport rows, ENV-VIS, OV-CORNERS, and the MK-* rows. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Marker step/add buttons and Ctrl+←/→ | FUNC-SMOKE-V3C3B, T166-TARGETED (`markers-ui`, `marker-edge-nav-ui`) |
| Detail panel collapse/expand, its keyboard handlers, the header label width | FUNC-SMOKE-V3C3B, ICON-BOX, T166-TARGETED (`detail-panel`) |
| Grid menu choice, Snap toggle, keyboard roving | FUNC-SMOKE-V3C3B, T166-TARGETED (`grid-triplet-ui`, `grid-snap-menu`) |
| Header layout (exit link, heading, master section) | ICON-BOX, RV1-V3C3B, T166-TARGETED (`master-ui`, `purchased-collection-ui`) |
| Playback | FUNC-SMOKE-V3C3B (audio) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Lucide icons for marker step, detail toggle, grid check and the back link, sized to the old glyph box | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“. The Live 12 manual's locator chapter was not opened this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts and focus are unchanged. The icons are CZABA's choices (R1), not Ableton claims. | Requirement: ICON-V3C3B, ICON-BOX, RV1-V3C3B, FUNC-SMOKE-V3C3B. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-166.md`, `a-round-166-result.json` and `a-round-166/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-166.md` and `c-round-166.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ICON-V3C3B, ICON-BOX and RV1-V3C3B tables (both viewports). Put tools, out and shots in `c-round-166/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 167 planning)
| Condition | Round 167 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on ICON-BOX / RV1-V3C3B (> 1 px) | B re-plans with C's measurements within R1, or records the site under Q-V3-ICON-SIZE as needing Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-3b's own code and cheap; otherwise `deferred_low_polish`, and V-3c-4 goes ahead. |
| C PASS | Root publishes round 166. V-3c-3b → **მზადაა**, which completes V-3c-3 and the glyph-to-icon work. Round 167 = **V-3c-4** (other components' button surfaces: border → fill, 8 px radius). Its input is the frontend-architect checkpoint (Q4); without an answer by then, B applies fallback (c), copies locked by tests, and records it. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 166: the changed granted paths plus the new doc 135, vs `7581483`. `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `ArrangementContext.tsx`, `collection.ts`, the other Arrangement components and the purchase/auth files are unchanged. `StudioWorkspace.tsx` has only the import and the exit-link hunks.
- **Root note from gate 165:** the gate reviewer did not find `c-round-165.json` among its artifacts. It exists in the loop folder (`tmp/studio-real-loop/c-round-165.json`). Root may want to pass it to the reviewer.
- **Architecture checkpoint (bounded request): `b-round-165-checkpoint-request.md`.** A's code-reviewer and the gate-165 reviewer both flagged the same structural point on one owner, `ArrangementMarkerRow.tsx`: the keyboard-commit-during-gesture rule is now hand-written at 7+ sites. Both proposed one guard in the protected `ArrangementContext.commitArrangement` (`B-R164-COMMIT-DURING-PREVIEW`). That is the workflow's "repeated structural risk on one owner" condition, so B asks root to add this one question to the pending frontend-architect checkpoint. It is not scheduled, ownership is unchanged, and it does not block V-3c-3b or V-3c-4.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - R1: `ChevronLeft`/`ChevronRight` at 9 px for the marker step; `ChevronDown`/`ChevronRight` after the word on the toggle, with `pr-1`; `Check`; `ArrowLeft`.
  - R2: `Expand`/`Collapse` without glyphs.
  - R3: the exit link's name is `CZABA`.
  - R5: the marker `+` stays text (question for Saba under Q-V3-ICON-SIZE).
