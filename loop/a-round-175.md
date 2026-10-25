# A — Round 175 (DUX-R-5b-1: controls and affordances go neutral)

**Status:** implementation complete, awaiting C. No commit or push. Browser rows are not A's, and **A has made no browser claim**.

## Pre-flight
- **Baseline matched.** HEAD is `0a4a41e`, the tree was clean with 995 files, and the frozen list (984) was OK. The 11 grant start hashes were OK, and neither new file existed.
- **Primitives read:** DESIGN_TOKENS, TAILWIND_FIRST, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AUDIO_ARCHITECTURE (the hook flagged it for the scrollbar and the docs), and prompts/new-test.md.
- **Every lasting edit went through Edit/Write.** Mutations used only temporary writes from `a-round-175/tools/mutate.mjs`, with cwd = store.

## Changed files (11 granted + 2 new; `a-round-175/end-sha256.txt`, `a-round-175/diff-vs-start.patch`)
| ID | File | Change |
|---|---|---|
| A1a–f | DetailPanel l.841, Master l.199, Lane l.766 and l.820, GroupHeader l.338, Transport l.277 | `accent-brand` → `accent-foreground`. `focus-visible:ring-brand` stays on all six. |
| A2 | Clip l.953 | The fade handle `bg-brand` → `bg-background` (hollow) |
| A3 | Clip l.969 and l.974 (now l.966 and l.971) | `hover:bg-accent/60` → `hover:bg-foreground/50` |
| A4 | LoopBrace l.263 and l.269 | same |
| A5 | Lane l.1049 and l.1050 | hover → `hover:bg-foreground/50`; dragging → `bg-foreground/50`. The folded branch is unchanged and has no bg. |
| A6 | studio-scrollbar.ts l.15 and l.16 | `bg-brand` → `bg-foreground` (hover and active) |
| A7 | Library l.638 | `hover:bg-brand/40` → `hover:bg-foreground/50`. `focus-visible:bg-brand` stays. |
| A8 | GroupHeader l.354 | the unselected block `bg-brand/25` → `bg-foreground/25`. **Biome required a formatting-only wrap:** the ternary now spans l.354-356. Tokens and logic are unchanged. C, please don't count this as an extra line. |
| A9 | Clip l.859 and l.876-879 | The two fixed-string `cn()` calls are now plain `className` strings, with the same tokens in the same order. `cn` is still used elsewhere. |
| L1/L2 | track-layout.test.tsx l.801 and l.835 | `hover:bg-accent/60` → `hover:bg-foreground/50` |
| T1 | **new** `affordance-colour-ui.test.tsx` | DXA1–DXA7 |
| D1 | doc 143 | (a) status line, (b) the l.91 TODO struck through, (c) the l.92 suffix. Nothing else changed. |
| D2 | **new** doc 144 | Georgian, with the TEMPLATE sections. Status: `In Progress (awaiting C round 175)`. |

Not touched: every 5b-2/5b-3 site, every protected file, and `app/styles/`. The frozen list check (984) passes after all edits.

## Finding for B: A-R175-DETAIL-SEP-ACCENT (Low/Medium, B decides)
- **The gap.** `ArrangementDetailPanel.tsx` l.1121 is the Clip-details height separator (`arrangement-detail-separator`). It still has `hover:bg-accent/60`. It is the same kind of affordance as Lane l.1049, but it is missing from §0.1, §0.2, §1, 5b-2 and 5b-3.
- **The contradiction.** DXA7 asks for 0 occurrences in all 9 granted files, and §1 says "only the tokens above change".
- **What A did.** A did not edit it. DXA7 pins it at exactly 1, using the labelled constant `DETAIL_SEPARATOR_ACCENT_GAP_R175` with a TODO. The other 8 files are locked at 0. Fixing the line makes the test red, so the pin has to be removed at the same time.
- **Proposal.** Do a same-owner fix-up, or list it under 5b-2: `hover:bg-foreground/50`, which gives 4.53 against the background by B's §0.1 math. Also add a hover row for it to C's scans. **None of C's round-175 rows cover this handle**, so its brass hover will pass this round's checks. The reviewer rated it Medium for that reason.

## Tests (actually run)
- **Before the edits,** the 13 base files: **199/199** (`out/vitest-base-before.json`).
- **After the edits,** the 13 base files plus `affordance-colour-ui.test.tsx` (`vitest-files.txt`): **206/206**, 51 suites (`out/vitest-after.json`).
- **DXA5 drag:** jsdom does start the height drag. During the drag the handle has `bg-foreground/50`, and after pointerup it no longer has it. So DXA5 covers m253 directly.
- **Two setup facts:** the DXA2 envelope point needs a clip with an envelope, so a1 gets two points. DXA6 selects a2 after collapsing the group, because collapsing intentionally drops hidden clips from the selection (StudioWorkspace `setTrackGroupsCollapsed`).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0, with 218 warnings and 1 info, all already present before this round.
- Scoped `npx biome check` on the 9 code files, track-layout and the new test: exit 0, clean.
- **Not run (gate or C):** the full suite, verify, build, e2e and all browser rows.

## Mutations (`a-round-175/mutations/m248–m257.json`; each restored and sha-checked, and the tree hash was checked after the whole run)
| ID | Red |
|---|---|
| m248 Lane Volume thumb | DXA1, DXA7 |
| m249 Zoom thumb | DXA1, DXA7 |
| m250 fade handle bg-brand | DXA2, DXA7 |
| m251 trim start hover | DXA3, DXA7 |
| m252 loop end hover | DXA4, DXA7 |
| m253 dragging bg-accent/60 | DXA5, DXA7 |
| m254 scrollbar hover bg-brand | DXA6, DXA7 |
| m255 unselected block bg-brand/25 | DXA6, DXA7 |
| m256 selected block → bg-foreground/25 | DXA6, DXA7 |
| m257 unfolded handle hover:bg-accent/60 | DXA5, DXA7, and track-layout C-R11-01 |

All 10 turned red as required. None stayed green.

## Code review (actual `code-reviewer` subagent, score 9/10, nothing blocking)
- **Medium M1:** the DetailPanel separator above. The reviewer called A's handling sound and recommended that B decide.
- **Lows and suggestions, all addressed in A's own files:**
  - L1: the character count in the doc is fixed (5, not 4).
  - L3: the Mermaid diagram now shows the hollow `bg-background` centre.
  - S1: added the `-thumb:active]:bg-brand` source lock.
  - S2: the hover checks now also reject `hover:*brand*`. The `focus-visible:ring-brand` focus ring (K4) is still allowed.
  - S3: removed the vacuous `toHaveLength(6)`.
- **L2 (GroupHeader wrap):** noted above for C.
- After these fixes, the tests (206/206), Biome and typecheck were re-run. All 10 mutations were then re-run against the final files: the same result, and `end-sha256.txt` was OK afterwards.
- **Architecture note (verbatim, for B):** "`affordance-colour-ui.test.tsx` is a third copy of the fake Web Audio / ResizeObserver harness (already ROOT-RECON-GRID-HARNESS), and DXA7's `readFileSync` substring counts plus the full-string `UNFOLDED_HANDLE_CLASS` lock in `track-layout.test.tsx:800-801` belong to GATE167-TOKEN-TEST-FRAGILITY (risk signal 3, the same region changed expensively across rounds). Keep it as it is this round: it is test-only and touches no audio timing, refs, gesture lifecycle, Undo/Redo or `useArrangement()` shape. The test-only extraction stays a planner proposal that already exists, not a new task."

## B acceptance that A truly passed
- §1 edits A1–A9, L1–L2 and D1–D2. **Exception:** the formatting-only wrap of A8.
- §3.1: base 199/199 before, 206/206 after; typecheck, lint and scoped Biome are clean; the code-reviewer was invoked.
- §3.2: DXA1–DXA7 are implemented and green. **Deviation:** the DXA7 DetailPanel pin (see the finding above).
- §3.3: all 10 mutations turned red as required.

**Not passed by A** (belongs to C or the gate): every §4 browser row and every gate row.

## Known gaps
- A-R175-DETAIL-SEP-ACCENT is open and needs B's ruling.
- Chromium's unfilled range-track grey is unknown until C measures it (§7 pre-rule: if it is below 3:1, the thumbs move to `accent-muted`).
- jsdom does not paint `accent-color` or scrollbar pseudo-elements. Those colours are verified only by C's pixel rows.

## Exact next C checks
- T175-TARGETED: `a-round-175/vitest-files.txt`. Expected: 206/206.
- SOURCE-SCOPE: `end-sha256.txt`. Expected: 11 ` M` + 2 `??`.
- AN-REVIEW: allow the A8 three-line wrap.
- CC-AFFORD, NO-BRASS-AFFORD and CONTRAST-DUX5B1, both viewports. This includes the thumb against the unfilled track.
- HANDLE-DISTINCT, ENV-VIS (12 cells), RV1-DUX5B1, FUNC-SMOKE-DUX5B1, RV3-STORE, G175-3, PX-NET/REG-HYD.
- **Optional, for B's finding:** hover the `arrangement-detail-separator` and record its fill. It is expected to be brass (the known gap), and should not count as A's FAIL.
