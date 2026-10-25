# CURRENT TASK — Round 163: V-3c-3a — video dock glyphs become lucide icons (⠿ GripVertical, ⤢ Maximize2, ✕ X) + the two "Esc or ✕" status sentences; boxes stay within ±1 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z128** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c3a_plan_d29z128`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-162.md`, an exact copy of the round-162 `current-task.md` (sha256 `e6acddcc…a929816`). Rationale for this round: `b-round-162.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „იკონები“ (⤢ → `Maximize2`; "the icon matches the old symbol's box, so the element does not move"). It is source material only and grants no permissions.
- **User decision files:** `tmp/studio-real-loop/user-review/`. It has no `ableton-decisions.md` and no `design-ux-decisions.md` at this planning.

## Baseline = HEAD `9a83018`, clean tree (gate 162 published)
- `gates/gate-round-162.json`: status `published`, commit `9a83018e914f745dfbe06a7c075a23f8b7c93e07`, on both remotes (round 162).
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **981** files.
- **Frozen list:** `b-round-162-r163-tree-sha256.txt`, **975 entries** (981 minus the 6 grants).
- **Grants:** `b-round-162-r163-grants.txt` (6 existing files). **New file:** `b-round-162-r163-new-files.txt` (1: doc 132).
- **Start hashes:** `b-round-162-r163-granted-start-sha256.txt`. **Start copies:** `b-round-162/r163-granted-start/`.
- **A's first step:** check that HEAD = `9a83018`, the tree is clean, the 975 frozen files match (`sha256sum -c --quiet`) and the 6 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z128)
- **Round 162: C PASS.** `browserVerified` and `realVerified` are true, there are 0 bugs, and the only blocked row is the fake-Bearer 403 (backend unavailable in cloud). Root published round 162 as `9a83018`, so **V-3c-2 → მზადაა**, and C-R154-02 and GATE139-EMPTY-VIDEO-FORMATTER are closed by C's evidence.
- **The outcome was fixed by `tasks/round-162.md` §7, "C PASS" row:** round 163 = **V-3c-3**, "split if the grants exceed about 12".
- **Split (B ruling):** the V-3c-3 inventory is 5 components (`ArrangementVideoDock`, `ArrangementMarkerRow`, `ArrangementDetailPanel`, `ArrangementGridMenu`, `StudioWorkspace`), `strings.ts`, about 6 test files and 2 docs, so about 13 grants. Only the dock has gesture and focus risk (float drag, focus-to-handle on pointerdown, no drag from the action buttons), so it goes alone:
  - **V-3c-3a = round 163:** the video dock and its two status sentences.
  - **V-3c-3b = round 164:** marker row ◀ ▶, detail `Expand ▸` / `Collapse ▾`, grid menu ✓, and the `← CZABA` back link. The inventory is in `backlog.json` `v3c3a_plan_d29z128.v3c3b_inventory`. The scope is unchanged; only the order is set.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **User decisions:** none (see above).
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **Checkpoint:** `b-round-160-checkpoint-request.md` has no answer yet. It does not block icon stages (V-3c-1…3). The round-162 architecture note was "none".

### 0.1 B evidence (planning data, not C rows)
**Glyph metrics and swap probe** (`b-round-162/v3c3a-probe.cjs` → `out/v3c3a-probe.json` + screenshots). Measured in real Chromium on `/studio-lab` at `9a83018` in three states (D0-empty, D1-video with `beeps-6s-h264-aac.mp4`, D2-expanded) at 1440 and 1280. The results are identical at both viewports.

| Site (`data-testid`) | Shown | Font | Glyph box | Button box |
|---|---|---|---|---|
| `arrangement-video-drag` ⠿ | D2 only | 12 px | 8.80×15 | fixed 24×24 (`VIDEO_FLOAT_BUTTON_CLASS`: `flex h-6 w-6 items-center justify-center … text-xs`) |
| `arrangement-video-expand` ⤢ | D0, D1, D2 (in D2 it is the return button) | 12 px | 10.00×15 | fixed 24×24 |
| `arrangement-video-close` ✕ | D2 only | 12 px | 10.06×15 | fixed 24×24 |

- **Swap with a 10×10 svg in every site:** the max edge delta is **0.000 px** for every element on the page (137–155 keyed elements per state). Every svg is centred exactly (dx = dy = 0).
- `elementFromPoint` at each svg centre resolves to the svg, inside its button.
- **The `before` arrays in that file are C's DOCK-STATES-BOX baseline.**

**Pointer-target check (B read `ArrangementVideoDock.tsx` l.795–818):**
- `handleFloatPointerDown` rejects action buttons with `event.target instanceof Element && event.target.closest('[data-video-float-action]')`.
- It finds the handle to focus with `event.target.closest('[data-video-float-handle]')` and then `instanceof HTMLElement`.
- An `SVGElement` is an `Element`, so an svg target resolves to its button. **No `pointer-events-none` is ruled.**
- Mutation m177 below proves the new lock would catch a guard that read the target directly.

**d6 keys:** box keys of the dock buttons are `data-testid` keys (`tid:arrangement-video-*`) and do not change. One contrast-section key changes: `arrangement-video-expand:⤢` → `arrangement-video-expand:Expand video`, because d6 falls back to the `aria-label` when `textContent` is empty. Map: `b-round-162-r163-d6-key-renames.json`. B checked it against the reference: 4 occurrences per viewport, 0 collisions.

**New RV-1 reference:** `c-round-162/out/d6/d6-{1440,1280}-r1.json`. C measured it on the published content with `d6.cjs` sha256 `3abc88fe…` (the same tool since round 157).

**Vitest base:** `b-round-162-r163-vitest-base.txt` (8 files). B ran it at `9a83018`: **197/197** (`b-round-162/out/vitest-base-r163.json`). The tree was clean after the run.

### 0.2 B rulings (D-29z128; all user-vetoable in `feature-status.md`)
**R1 — Size (R2'', unchanged):**
- The float buttons have `text-xs` (12 px), so each icon is `size-2.5` + `strokeWidth={2.4}`.
- The boxes are fixed, so no gap rule applies.
- `VIDEO_FLOAT_BUTTON_CLASS` is **byte-identical**: `text-xs` stays (it now sizes no text; recorded with REVIEW-R162-STATIC-CN-DEAD-TEXT for the polish pass).
- A 10 px icon in a 24 px button is recorded under Q-V3-ICON-SIZE for Saba.

**R2 — Icon mapping:**

| Site | Glyph | Icon | Source |
|---|---|---|---|
| Float drag handle | ⠿ | `GripVertical` | **B ruling (spec gap)**, the same as the round-162 audio clip grip: the same 2×3 dots on a move handle. |
| Expand and return | ⤢ | `Maximize2` **in both states** | **Spec** (⤢ → `Maximize2`, "ვიდეოს გაშლა"). The old glyph did not change between states, and the state stays in `aria-label`/`title`. Alternative for Saba: `Minimize2` in the return state. |
| Close | ✕ | `X` | **B ruling (spec gap)**, the same as the V-3c-1 search clear. |

**R3 — Sentence glyph rule (SG, from V-3c-1):** a glyph that names a control inside a sentence becomes the word. The close button's `title` is `Close (Esc)`, so the word is "Close".

| Line (`strings.ts`) | Key (`studioVideoStrings`) | Old | New |
|---|---|---|---|
| l.304–305 | `expanded` | `'The video is expanded over the library. Drag it where you want; Esc or ✕ brings it back.'` | `'The video is expanded over the library. Drag it where you want; Esc or Close brings it back.'` |
| l.306–307 | `expandedLibraryOpened` | `'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or ✕ brings it back.'` | `'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or Close brings it back.'` |

Every other byte of `strings.ts` is unchanged, including `studioDetailStrings.expandText`/`collapseText` (l.737/738; they belong to V-3c-3b) and every `studioVideoDockStrings` label and title.

**R4 — Accessibility (recorded, not changed):** every `aria-label` and `title` of the three buttons is byte-identical. The icons are `aria-hidden`, so the accessible names stay `Move the video (arrow keys: 16 px)`, `Expand video` / `Return the video to the compact view`, and `Close the expanded video`.

## 1. What changes (exact; line numbers at `9a83018`)
| ID | File | Change |
|---|---|---|
| D0 | `ArrangementVideoDock.tsx` imports | Add `import { GripVertical, Maximize2, X } from 'lucide-react';` in Biome order. |
| D1 | l.974 drag handle | Children `⠿` → `<GripVertical className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />`. |
| D2 | l.987 expand/return | Children `⤢` → `<Maximize2 className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />` (both states). |
| D3 | l.999 close | Children `✕` → `<X className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />`. |
| — | `ArrangementVideoDock.tsx` | **Everything else is byte-identical:** `VIDEO_FLOAT_BUTTON_CLASS`, handlers (`handleFloatPointerDown`, `handleFloatHandleKeyDown`), `data-video-float-handle` / `data-video-float-action`, refs, `aria-*`, `title`, `data-testid`, the placeholder, fades, captions and every other element. |
| S1 | `strings.ts` | R3: exactly the 2 values. |
| D4 | `docs/implementation/2026/quarter-IV/131-studio-v3c2-lane-group-clip-icons.md` | Exactly one edit: the status line **l.4** → `**სტატუსი:** Completed (C round 162 PASS; published 9a83018)`. |
| D5 | **new** `docs/implementation/2026/quarter-IV/132-studio-v3c3a-video-dock-icons.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: the V-3c-3 split, R1–R4, the §0.1 probe table, the pointer-target reasoning, class and children before and after, tests and mutations.</li><li>TODO: V-3c-3b (its inventory), V-3c-4/5, Q-V3-ICON-SIZE (10 px in 24 px), the `Minimize2` alternative, REVIEW-R162-STATIC-CN-DEAD-TEXT (`text-xs` on the float buttons), M1/M3/M4.</li><li>Status: `In Progress (awaiting C round 163)`.</li></ul> |

**Not allowed:**
- `app/styles/**`, any other component, `package.json`, `~/components/icons`;
- `style=` (other than the existing computed px styles), custom CSS, a hex value, an arbitrary `[...]` value, or a new token;
- any surface/colour/radius/border/hover change (V-3c-4);
- strings other than R3;
- any change to the pointer, keyboard or focus logic.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementVideoDock.tsx` | D0–D3 |
| `app/lib/arrangement/strings.ts` | S1 |
| `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>l.839 and l.841 expected values follow R3.</li><li>Add **LG3** after LG2: both sentences equal the R3 values exactly, end with `Esc or Close brings it back.`, and do not match `/[▶◀×▾▸■＋⌫▣⠿⤢✕✓]/u`.</li></ul> |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | <ul><li>l.129 and l.131 expected sentences follow R3.</li><li>`it` titles that name glyphs may stay; do not rename them.</li><li>Add **LVD2** (below).</li></ul> |
| `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` | Add **LVD1** (below). Nothing else. |
| `docs/…/131-studio-v3c2-lane-group-clip-icons.md` | D4 only |
| **new** `docs/…/132-studio-v3c3a-video-dock-icons.md` | D5 |

**New locks:**
- **LVD1, icons** (`video-dock-strings-ui`, the existing `mountDockWorkspace` mount):
  - Compact: `arrangement-video-expand` holds exactly one `svg.lucide-maximize-2` with `aria-hidden="true"`, class `size-2.5`, `stroke-width` 2.4, and its `textContent` is `''`.
  - After a click on Expand video: `arrangement-video-drag` holds one `svg.lucide-grip-vertical`, `arrangement-video-expand` holds one `svg.lucide-maximize-2`, and `arrangement-video-close` holds one `svg.lucide-x`. Each has the same props, and each button's `textContent` is `''`.
  - The three accessible names and titles equal the VDS2 values.
  - No text inside the dock `section` contains any of `⠿⤢✕`, checked compact and expanded.
- **LVD2, svg pointer targets** (`floating-video`, the existing `mountFloatWorkspace` mount, expanded):
  - `pointerDown` on the svg inside `arrangement-video-close`, then on the svg inside `arrangement-video-expand`: `isPointerGestureActive()` stays `false` and the box does not move.
  - `pointerDown` on the svg inside `arrangement-video-drag`: the gesture becomes active and `document.activeElement` is the drag **button**. A `pointerMove` then `pointerUp` on `window` moves the box by the pointer delta (clamped as in the existing drag tests).
  - A `click` on the svg inside `arrangement-video-close` returns the video to compact (`data-video-floating="false"`).

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio file; no audio, video or gesture logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `9a83018` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementClip.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementGridMenu.tsx`, `studio-lab.tsx`, docs 127–130;
- the frozen tests `library-video-return-focus`, `library-focus-handoff`, `export-dialog-focus`, `detail-panel-strings-ui` and `grid-triplet-ui`.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning:**
- The dock glyphs ⠿ ⤢ ✕ appear in source only in `ArrangementVideoDock.tsx` l.974/987/999. "Esc or ✕" appears only in `strings.ts` l.305/307.
- In tests, the only assertions on them are `strings.test.ts` l.839/841 and `floating-video.test.tsx` l.129/131. Other mentions are `it` titles or labels of `it.each` rows (`['✕', 'close']`), which are not assertions.
- No e2e spec uses these glyphs.
- `app/components/marketing/LeadMagnetPopup.tsx` has glyphs too, but it is outside Studio (VISUAL-A covers the Studio root only). It is not in scope.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 8 files in `b-round-162-r163-vitest-base.txt`. Expect 197/197. Save the list as `a-round-163/vitest-files.txt` and the result as `a-round-163/vitest-baseline.json`.
- **After the edits:**
  - Run the same 8 files. Expect 197 plus the new `it`s (LVD1, LVD2, LG3), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 5 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. At `9a83018` they are strings 527, floating-video 168, video-dock-strings-ui 27. A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-163/mutations/`):
  - **m173:** expand icon `Maximize2` → `Minimize2`. LVD1 turns red.
  - **m174:** drag handle `GripVertical` → `GripHorizontal`. LVD1 turns red.
  - **m175:** close icon `size-2.5` → `size-3`. LVD1 turns red.
  - **m176:** put back `Esc or ✕` in `expanded`. LG3 and the floating-video sentence check turn red.
  - **m177 (guard discriminator):** in `handleFloatPointerDown`, replace `event.target.closest('[data-video-float-action]')` with `event.target.hasAttribute('data-video-float-action')` (keep `instanceof Element`). LVD2 turns red (an svg on ✕ would start a drag), while the existing button-target test stays green. Restore it by Edit and verify the sha.
  - Do not use a "remove aria-hidden" mutant: it is equivalent (INFO-R160-M160-EQUIVALENT).
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 975 files are OK, and the protected diff vs `9a83018` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 132), nothing else.
  - Write `a-round-163/end-sha256.txt` (all changed paths + doc 132) and `a-round-163/diff-vs-start.patch` (vs `b-round-162/r163-granted-start/`, plus doc 132 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE: the new lucide imports can trigger "Invalid hook call").
- **Harness rules:** a range is made by a clip-body drag (a ruler drag navigates). Escape does not clear a range. Snap off before move measurements.
- Copy the tools you reuse (`c-round-162/tools/{d6,lib,lib122,h3,wav,report}.cjs`) unchanged into `c-round-163/tools/` and check the d6 sha256. B's probe and its tool copies are in `b-round-162/`.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T163-TARGETED | Re-run `a-round-163/vitest-files.txt`. The counts equal A's, and LVD1, LVD2 and LG3 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `9a83018`.</li><li>The frozen 975 files are OK at start and at end.</li><li>The end hashes equal `a-round-163/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 132 as `??`, nothing else.</li><li>The protected diff vs `9a83018` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-162/r163-granted-start/` itself:<ul><li>The dock changes only D0–D3.</li><li>`strings.ts` changes only the 2 R3 values.</li><li>The test files change only the listed lines plus LVD1/LVD2/LG3. No assertion is weakened: count `expect(` per file before and after; a drop needs a reason.</li><li>Doc 131 changes only D4, and doc 132 exists with the D5 sections.</li><li>No new `style=`, CSS file, hex, arbitrary `[...]` value, surface change, or pointer/keyboard/focus logic change.</li></ul> |
| ICON-V3C3A | Both viewports. States: D0-empty, D1-video (`beeps-6s-h264-aac.mp4`), D2-expanded (from D1, click Expand video), and D2 with the library collapsed before expanding (D2-lib-opened).<ul><li>Each visible site has exactly one `svg`, `aria-hidden="true"`, the lucide class from R2 (`lucide-grip-vertical`, `lucide-maximize-2`, `lucide-x`), a rendered box of 10×10 ±0.5 px, and `stroke-width` 2.4.</li><li>Computed `stroke` equals the button's computed `color`: muted at rest, foreground on hover (`hover:text-foreground`).</li><li>Each icon is centred in its 24×24 button (centre delta ≤ 0.5 px).</li><li>No `⠿⤢✕` text in the dock.</li><li>CDP accessible names: `Expand video` in D0/D1; `Move the video (arrow keys: 16 px)`, `Return the video to the compact view` and `Close the expanded video` in D2. Titles unchanged.</li><li>Screenshots of each state at both viewports.</li></ul> |
| RV1-V3C3A | <ul><li>Run the copied `d6.cjs` (sha256 `3abc88fe…`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-162/out/d6/d6-{1440,1280}-r1.json`** after applying `b-round-162-r163-d6-key-renames.json` (1 key).</li><li>Expected: no key missing or added apart from that rename, and every x/y/w/h within ±1 px. The probe predicts 0 px.</li><li>A missing or added key outside the map, a collision, or any delta > 1 px is a finding.</li><li>Report the deltas for the three dock buttons and the dock section.</li></ul> |
| DOCK-STATES-BOX | D0-empty, D1-video and D2-expanded at both viewports, as raw `getBoundingClientRect` values (0.01 px).<ul><li>The **pre-change baseline is B's probe at `9a83018`**: `b-round-162/out/v3c3a-probe.json`, the `"before"` arrays per viewport and state.</li><li>Keys are built by `measure()` in `b-round-162/v3c3a-probe.cjs`; C may reuse it with the same preparation. It strips ⠿⤢✕ from text keys, and every dock button is keyed by `data-testid`, so no rename is expected.</li><li>**Expected added keys:** none. `measure()` skips svg children. **Expected missing keys:** none.</li></ul>**Finding set:** any element delta > 1 px, or any missing or added key. The three buttons must stay 24×24 ±0.5 px. In D2, the expanded box position must equal the baseline (the expand itself is not changed). |
| FUNC-SMOKE-DOCK | Each control does its real action, at both viewports. **Every pointer action starts on the icon's centre**, read from the svg's rect.<ul><li>**Expand:** with the video loaded, a click on the Maximize2 svg expands the video. The placeholder `Video expanded` shows, the three float buttons appear, and the status reads exactly `The video is expanded over the library. Drag it where you want; Esc or Close brings it back.`</li><li>**Library-opened sentence:** with the library collapsed first, the same click shows exactly `The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or Close brings it back.`</li><li>**Drag:** a pointer drag that starts on the GripVertical svg moves the float box by the drag delta (±1 px, or clamped to the viewport). After the press the drag button has focus. After the release (pointerup), ArrowRight moves the box 16 px. Arrows are ignored during an active drag (`floating-video` l.729), so do not press them before the release.</li><li>**No drag from actions:** a 60 px pointer drag that starts on the X svg, and one that starts on the Maximize2 svg, does not move the box.</li><li>**Close:** a click on the X svg returns the video to compact, and focus goes to the expand button. Expanding again and pressing Esc also returns it. Expanding again and clicking Maximize2 (the return state) also returns it.</li><li>**Real video and audio:** expanded, press Play. The active `<video>` `currentTime` advances by ≥ 0.5 s over 1 s, and the audio tap peak is > 0. Stop. The same `<video>` nodes remain after the return (no remount).</li></ul> |
| G163-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–162): the lane, group and clip rows (ICON-V3C2, LANE-STATES-BOX, FUNC-SMOKE-LANE), the library rows (ICON-V3C1, LIB-STATES-BOX), the transport rows (ICON-V3B, SURFACE-STYLE, CASCADE-SCOPE), CONTRAST-V3A and every V-2 row. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Float drag start, handle focus, no drag from action buttons | FUNC-SMOKE-DOCK, LVD2 (T163-TARGETED) |
| Expand/return/close and Esc focus return | FUNC-SMOKE-DOCK, T163-TARGETED (`library-video-return-focus`, `library-focus-handoff`, `export-dialog-focus`) |
| Library temporary open/re-collapse sentence | FUNC-SMOKE-DOCK, LG3 |
| Video playback and audio in the expanded view | FUNC-SMOKE-DOCK (real video and audio) |
| Dock layout and the float buttons' boxes | RV1-V3C3A, DOCK-STATES-BOX |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Lucide icons for the video float drag handle, expand/return and close, sized to the old glyph slot; "Esc or Close" wording | None used. Source: the user-approved `visual-direction-a.md` § „იკონები“. Ableton Live has no video dock of this kind (CZABA's one-video-track scope). | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts, gestures and focus are unchanged. `GripVertical`/`X` are CZABA's choices (R2), not Ableton claims. | Requirement: ICON-V3C3A, RV1-V3C3A, DOCK-STATES-BOX, FUNC-SMOKE-DOCK. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-163.md`, `a-round-163-result.json` and `a-round-163/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-163.md` and `c-round-163.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ICON-V3C3A, RV1-V3C3A and DOCK-STATES-BOX tables (both viewports). Put tools, out and shots in `c-round-163/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 164 planning)
| Condition | Round 164 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item, both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on RV1-V3C3A / DOCK-STATES-BOX (> 1 px) | B re-plans with C's measurements within R1, or records Q-V3-ICON-SIZE as needing Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-3a's own code and cheap; otherwise `deferred_low_polish`, and V-3c-3b goes ahead. |
| C PASS | Root publishes round 163. V-3c-3a → **მზადაა**. Round 164 = **V-3c-3b** (marker row ◀ ▶, detail Expand/Collapse, grid menu ✓, `← CZABA`; B probes at planning), unless the regression is due. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 163: the changed granted paths plus the new doc 132, vs `9a83018`. `app/styles/**`, `root.tsx`, `Modal.tsx`, `Toast.tsx`, `CookieConsent.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `collection.ts`, the other Arrangement components and the purchase/auth files are unchanged.
- **Checkpoint:** `b-round-160-checkpoint-request.md` is still open. It is non-blocking for V-3c-1..3. It is the input B needs before V-3c-4 (surfaces); without an answer by then, B applies fallback (c), copies locked by tests, and records it. The round-162 review's architecture note was "none". No new request is warranted: V-3c-3b's StudioWorkspace grant will be a one-line children change, not a structural signal.
- **User-visible decisions (may be vetoed in `feature-status.md`):** R2 (`GripVertical` handle, `X` close, `Maximize2` also in the return state; alternative `Minimize2`), R3 (`Esc or Close brings it back`), R1 (10 px icon in a 24 px button, under Q-V3-ICON-SIZE).
