# CURRENT TASK — Round 111: returning the floating video with Escape keeps keyboard focus in the library (C-R110-01, Medium)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned ~13:55–14:30 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner, speed rules and the **2026-10-23 bug-gate decision** in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-110.md` (exact copy). Rationale: `b-round-110.md`. Decision record: **D-29z76** in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug, one product file (narrow), one implementer (A). Plus a one-line doc status fix (gate-110 review item 4).
- **Why now:**
  - The 2026-10-23 user decision says: fix the open Medium findings first, then open T12. C-R110-01 is a new open Medium, found and reproduced by C in round 110.
  - Round 110 (B-R108-LIB-FOCUS-LOSS) is C PASS (`browserVerified: true`) and published in `832fee2`.
  - The regression round is **not due yet**: `regression-last.json` is 2026-10-21; today is 2026-10-23. The next B planning on or after 2026-10-24 is the regression round.

## The defect (C round 110, independently reproduced; A's reviewer S5)
- **Evidence:** `c-round-110/out/lf-video.json` (`s5-collapse-button`, `s5-option`), `c-round-110/out/reg.json` (`s5_1280`), `c-round-110/shots/s5-*.png`; A's own Chromium repro `a-round-110/probe/s5-probe-result.json`. The tree C tested is the tree published in `832fee2`.
- **Repro** (1440×900; also 1280×720): fresh `/studio-lab` → Decline → focus the Middle East option → ArrowDown (CZABA hero selected) → mouse ◀ (collapse) → mouse ⤢ (`arrangement-video-expand`: the library opens for the floating video) → focus ◀ **or** the selected option → Escape → Enter.
- **Actual:** after Escape the video is docked, the library is collapsed and `activeElement` is BODY. Enter adds a clip (**0 → 1**, „CZABA hero — საჯარო preview დაემატა მუსიკა ხაზზე 00:00.000-ზე“).
- **Cause:** the window Escape branch (`StudioWorkspace.tsx` l.1687–1695) calls `returnFloatingVideo` (l.592–606). Because the library was opened for the video (`libraryOpenedForVideo`), it re-collapses the library (`setIsLibraryCollapsed(true)`). The focused ◀ or option is inside the expanded panel, so it unmounts. Chromium drops focus to BODY. The workspace Enter branch (l.1971–1981) then adds the active library item.
- **Same class as** B-R108-LIB-FOCUS-LOSS (round 110, doc 095) and C-R107-01 (round 108, doc 093). Round 110 fixed the library's own buttons. This path is driven by the workspace, so round 110's armed ref never fires. That was by design in D-29z75 ("video-driven collapse never moves focus").
- **Not this round:** whether Enter on BODY should add anything stays the open user question **B-R107-ENTER-ON-BODY**. As in rounds 108 and 110, this round closes the Medium by keeping focus in place, without changing that contract.

## Decision (D-29z76, amends D-29z75 F1)

### The rule
- **Before (D-29z75):** "video-driven collapse/expand never moves focus."
- **Now:** the workspace never **takes** focus from outside the library. It only **rescues** focus that was inside the library when `returnFloatingVideo` re-collapsed it and would otherwise land on BODY.
- **Where focus goes:** ▶ (`arrangement-library-expand`), the library rail's only control.
  - It is in the same region the user was working in.
  - It matches D-29z75: when a collapse happens while the library has focus, focus lands on ▶.
  - One more Enter re-opens the library (round-110 handoff: focus then moves to ◀). It does not re-float the video.
- **When the rescue does nothing (unchanged behaviour):**
  - focus was outside the library (Play, ⤢, ✕, the timeline, BODY);
  - the library was **not** opened for the video. Then `returnFloatingVideo` does not collapse it, so nothing unmounts;
  - focus was in the search input. The window handler ignores typing targets (`isTypingTarget`, l.1683), and Escape in the input only clears the query (`ArrangementLibrary.tsx` l.265–267). The video stays floating; that is today's behaviour.
- **LF6 and LF-VIDEO-NEUTRAL stay valid.** In those cases focus is on Play or ⤢, outside the library.

### Mechanism (workspace-side, deterministic; refs only)
1. **Arm.** In `returnFloatingVideo`, inside the `state.libraryOpenedForVideo` branch only, **before** the state setters, record whether `document.activeElement` is a non-body element inside `libraryAsideRef.current` (`contains`). Store the result in a new ref, e.g. `pendingLibraryRailFocusRef`. At this moment Escape's target still has focus, so the check is exact.
2. **Rescue.** Add one new `useIsomorphicLayoutEffect` **without a dependency array**, next to the existing `pendingRowFocusRef` effect (l.811–818), with the same shape:
   - read the ref, then clear it;
   - if it was armed and `document.activeElement` is `document.body` or `null`, focus ▶ inside `libraryAsideRef.current` with `{ preventScroll: true }`.
3. **Find ▶** with a small module-level helper next to `trackRowNameButton` (l.308). It uses the same `querySelector('[data-testid="…"]')` approach that helper already uses.
4. **`preventScroll: true` is required.** Round 110 measured a 243 px `scrollLeft` jump of the overflow-hidden aside without it (`a-round-110/probe/scroll-probe-result-before-preventScroll.json`).

**Why it is safe:**
- **No stale arm.** The armed branch always calls `setIsLibraryCollapsed(true)` on a library that is currently expanded, so a render always follows. The effect also clears the ref on every render.
- **No race with the video dock.**
  - The workspace layout effect runs in the commit's layout phase. The dock's passive float cleanup (`ArrangementVideoDock.tsx` l.770–775) runs later. When it runs, `activeElement` is ▶, not body, so the dock does not move focus.
  - The dock's own `floatFocusRef` is false in this path anyway, because focus was in the library.
- **Render count is unchanged:** refs only, no new state (`render-budget.test.tsx`).

### Why the workspace and not the library (B probe, recorded)
A library-side "focus-within" flag (onFocus/onBlur on the aside, like the dock's `floatFocusRef`) was considered.
- **B's probe** `b-round-110/probe/blur-on-remove-result.json` (Chromium 143.0.7499.4): removing a focused button **does** fire `blur` and `focusout` synchronously, with `relatedTarget: null`, during the removal.
- A blur-tracked flag would therefore depend on whether React delivers that event for a node it is deleting. That is a React-internals detail.
- The snapshot in `returnFloatingVideo` happens before any DOM change. It needs no event bookkeeping.

### Rejected
- **Library-side focus-within flag:** see the probe above.
- **Focus ⤢ (the invoker of the float):** focus was in the library, not in the float. ⤢ + Enter would re-float the video and re-open the library, which is a bigger action than the user's last context.
- **Change Enter-on-body:** user question B-R107-ENTER-ON-BODY.
- **Keep the library expanded on Escape:** changes the agreed float/return contract (`floating-video.test.tsx`, the video dock).
- **A document-level focus listener:** rejected in D-29z73.

## Baseline (measured by B, 2026-10-23 ~14:05 UTC)
- **HEAD `832fee24858746c4411b1299440406c06d8baefa`** (gate 110 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-110-r111-tree-sha256.txt`, **545** entries.
  - It is the round-110 list (544), minus `app/components/arrangement/StudioWorkspace.tsx`, plus the two published round-110 code paths (`app/components/arrangement/ArrangementLibrary.tsx` `58103e8d…`, `app/lib/arrangement/__tests__/library-focus-handoff.test.tsx`), hashed from the tree at `832fee2`.
  - Docs are not in the list. The doc rule is checked by `git status` and `git diff`.
  - Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-110-r111-tree-sha256.txt`. B checked it: OK.
- **Snapshot:** `../tmp/studio-real-loop/b-round-110-r111-snapshots/StudioWorkspace.tsx` (sha256 `e83fa485…`, 2529 lines). Fail-before runs against it.
- **Owned files:**

  | File | Permission |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` (`e83fa485`) | **owned, narrow.** Only these four parts:<br>(1) one new module-level helper next to `trackRowNameButton` (l.308–318) that returns the ▶ button inside a given aside;<br>(2) one new `useRef` next to `floatingVideoStateRef` (l.551–556);<br>(3) inside `returnFloatingVideo` (l.592–606), in the `state.libraryOpenedForVideo` branch only, the arm statement(s) before the setters;<br>(4) one new deps-free `useIsomorphicLayoutEffect` directly after the `pendingRowFocusRef` effect (l.811–818). `useIsomorphicLayoutEffect` is already imported.<br>**Byte-identical:** the Escape branch (l.1687–1695), the Enter branch (l.1971–1981), `expandFloatingVideo`, `changeVideoExpanded`, `changeLibraryCollapsed`, `isTypingTarget`, all JSX, every class string, label and `data-testid`. No import change is expected; if one is needed, report why. |
  | `app/lib/arrangement/__tests__/library-video-return-focus.test.tsx` | **owned (new).** |
  | `docs/implementation/2026/quarter-IV/096-studio-video-return-library-focus.md` | **owned (new doc, whole).** |
  | `docs/implementation/2026/quarter-IV/095-studio-library-toggle-focus.md` (`1e1e45c7`) | **owned, one line:** l.4, the status line only. It must say that round 110 is C PASS and published in `832fee2` (gate 110). Every other line stays byte-identical (gate-110 review item 4). |

- **Expected end state:** `git status --short --untracked-files=all` = **2 M + 2 ??** (exactly the four paths above).
- **Frozen neighbours that must stay green and unedited:**
  - `ArrangementLibrary.tsx` (`58103e8d`) and `library-focus-handoff.test.tsx`;
  - `ArrangementVideoDock.tsx` (`7563ef26`), `ArrangementTransport.tsx`;
  - `app/contexts/ArrangementContext.tsx`;
  - `floating-video.test.tsx`, `render-budget.test.tsx`, `self-disabling-focus.test.tsx`.
- **Protected (frozen, never edited; B re-checked at `832fee2`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts`, `app/components/ui/Modal.tsx`, `app/lib/arrangement/mp3-encoder.client.ts`, `app/root.tsx`, `app/entry.client.tsx`, `app/entry.server.tsx`, `app/lib/ssr/**`;
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts`, `app/types/auth.ts`;
  - `package.json` (`cf14e3b1`) and the lockfile; no new dependency.
  - All of these are in the frozen list.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`, round 110). The backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean, commit or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-111/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status is not empty, or a frozen file changed.

## 1. What changes (A)
Read first:
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (component edit), `AUDIO_ARCHITECTURE.md` (Studio file; confirm no audio path is touched), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, and docs 093 and 095 for the precedent.

No visual change: no class, label, title or `data-testid` changes. Names are A's choice per `AGENT_DISCOVERABLE_CODE.md`.

### Tests (`app/lib/arrangement/__tests__/library-video-return-focus.test.tsx`)
- Mount the real `StudioWorkspace` with the demo collection.
  - Copy the harness from `library-focus-handoff.test.tsx` or `floating-video.test.tsx`. Do not import from or edit a frozen test.
- Exact assertions only (`toBe`, `toEqual`). No `as` (including `as const`), no `@ts-` and no `any`.
- Count clips through the context API **and** `[data-clip-id]`, not through status text alone.
- **Common setup ("opened for video"):**
  1. Arm the hazard: select a source, so that Enter on BODY would add a clip.
  2. Collapse the library with an unfocused ◀ click, so round 110's handoff does not arm.
  3. Click ⤢ (`arrangement-video-expand`): the library opens for the video.
  4. Flush frames as `floating-video.test.tsx` does.
- **Escape:** dispatch `keydown` Escape on `document.activeElement`, bubbling to `window`.

Cases:
- **VR0 (hazard control and the "not armed" negative):** common setup, then blur everything (`activeElement` = body). Escape → the video is docked, the library is collapsed, `activeElement` is **body**. Then Enter on body adds **+1** clip. This proves VR3 can fail, and that focus outside the library is not moved.
- **VR1:** common setup, focus ◀ → Escape → the library is collapsed, the video is docked, and `activeElement` is ▶ (`arrangement-library-expand`).
- **VR2:** the same, with focus on the selected library option instead of ◀ → `activeElement` is ▶.
- **VR3 (the user-visible oracle):** after VR1, and separately after VR2, Enter on `document.activeElement` adds **no** clip.
- **VR4 (focus outside is untouched):** common setup, focus Play (the transport button) → Escape → `activeElement` stays Play. If the harness can focus the float's ✕, add **VR4b**: focus ✕ → Escape → `activeElement` is ⤢ (the dock's own rule; the workspace rescue is not armed). If jsdom cannot show it, say why; C's VR-OUTSIDE (d) covers it.
- **VR5 (typing target):** common setup, type a query in the search input (focus stays there) → Escape → the query is empty, focus stays in the input, and the video is **still** floating (`returnFloatingVideo` not called).
- **VR6 (library not opened for the video):** library expanded (no collapse step), ⤢ → the video floats, the library stays expanded. Focus the selected option → Escape → the video is docked, the library stays expanded, and focus stays on the option.
- **VR7 (no scroll jump):** spy on `HTMLElement.prototype.focus` around the VR1 Escape. The rescue calls it exactly once, with `{ preventScroll: true }`.

**Fail-before** (scratch; `StudioWorkspace.tsx` = the snapshot):
- B expects **red:** VR1, VR2, VR3, VR7.
- B expects **green:** VR0, VR4, VR5, VR6.
- Report the exact list.

**Mutations** (scratch only; one unmutated control before and after; record the red tests):
- **m1:** no arm (the ref is never set) → VR1, VR2, VR3, VR7 red.
- **m2:** arm unconditionally in the `libraryOpenedForVideo` branch (ignore "focus inside the aside") → VR0 red.
  - In VR0 focus is on body, so the effect would move it to ▶, and the Enter would add nothing.
  - VR4 stays green, because the body/null check protects Play.
- **m3:** m2 **plus** drop the body/null check in the effect → VR4 red. This proves that the body/null check guards focus outside the library.
- **m4:** the helper returns ◀ (`arrangement-library-collapse`, already unmounted) instead of ▶ → VR1 and VR2 red.
- **m5:** `focus()` without `{ preventScroll: true }` → VR7 red.

### Docs
- **Doc 096 (new):** `docs/implementation/TEMPLATE.md`, in Georgian with English technical terms.
  - **Status:** round 111 waits for C (D-29z76).
  - **Context:** C-R110-01 with C's evidence; the links to docs 093 and 095; the D-29z75 amendment.
  - **Approach:** the rule (rescue, never take), the arm/rescue mechanism, `preventScroll`, the "does nothing" cases, and the rejected alternatives, including B's blur-on-remove probe.
  - **Architecture:** a Mermaid sequence diagram: Escape → `returnFloatingVideo` arm → commit (option/◀ unmount → body) → workspace layout effect → ▶ focus → dock passive cleanup (no move).
  - **Problems and solutions, Testing:** fail-before, m1–m5 and the targeted count.
  - **TODO:** B-R107-ENTER-ON-BODY (user question); the shared focus-handoff helper question (architecture checkpoint, now four sites).
- **Doc 095:** l.4 only (see Baseline).

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint` with 0 diagnostics in the owned files (`--max-diagnostics` and grep, as in round 110).
- `npx biome check` on the 2 owned code/test files, without `--write`.
- **Targeted vitest:**
  - Build the list: `grep -rlE "arrangement-video-expand|returnFloatingVideo|arrangement-library-expand|library-video-return-focus" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-111/targeted-list.txt`. B's grep at `832fee2` gives 5 files (export-dialog-focus, floating-video, grid-snap-menu, library-focus-handoff, video-fades-ui); with the new file, 6.
  - Append `app/lib/arrangement/__tests__/render-budget.test.tsx` and `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` if the grep misses them (B expects 8 files).
  - Run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-111/targeted-list.txt)`. Report the files and the counts.
- Do **not** run the full suite or `npm run verify` (gate).
- **Code-reviewer:** run it (4 files change). Ask it to check:
  - the rescue cannot fire when focus was outside the library;
  - the layout-effect vs dock-cleanup order;
  - no stale arm;
  - render count unchanged.
  - Pass its Architecture note through verbatim.
- **Self-check (A evidence, not C acceptance):** re-run the S5 repro in Chromium (copy A's own `a-round-110/probe/s5-probe.cjs` to `a-round-111/probe/`). Expected: after Escape, `activeElement` = ▶; Enter adds no clip.

## 2. Acceptance — what C checks
**Environment:** the dev server at `:5173`, real Chromium (Playwright). Every browser session is a fresh incognito context with no credentials.
- **Setup for every VR row:** `/studio-lab` → Decline → wait until no option shows „იტვირთება…“ → focus the Middle East option → ArrowDown (CZABA hero selected). Now an Enter on BODY **would** add a clip (the hazard is armed).
- **"Opened for video"** means: mouse ◀, then mouse ⤢.
- **"Docked"** means C's round-110 measurement `videoExpanded=false`, `videoFloating=false`.

| ID | Steps | PASS when |
|---|---|---|
| **VR-HAZARD** (1280 and 1440) | Opened for video → `blur()` (body) → Escape → Enter. | After Escape: docked, the library is collapsed, and `activeElement` stays BODY (not moved). Enter adds **1** clip. This proves the oracle, and that the rescue does not fire when focus was outside the library. |
| **VR-ESC-BUTTON** (1280 and 1440) | Opened for video → focus ◀ → Escape → Enter → Enter. | After Escape: docked, `data-collapsed="true"`, `activeElement` = ▶. Enter 1: **0** clips added; the library expands, focus is on ◀, and the video stays docked. Enter 2: collapses, focus on ▶, 0 clips. |
| **VR-ESC-OPTION** (1280 and 1440) | Opened for video → focus the selected option → Escape → Enter. | After Escape: collapsed, `activeElement` = ▶. Enter adds **0** clips. |
| **VR-SCROLL** (1280) | VR-ESC-BUTTON's Escape, with the aside `scrollLeft`/`scrollTop` sampled every animation frame for 900 ms. | `scrollLeft` = 0 and `scrollTop` = 0 in every frame; width animates from ≥ 288 to 40. |
| **VR-OUTSIDE** (1440) | Round 110's LF-VIDEO-NEUTRAL (a), (b), (c): library collapsed, focus Play → mouse ⤢ → refocus Play → mouse ✕; ⤢, then Escape with focus left on ⤢; ⤢, refocus Play, Escape. **(d)** opened for video → focus the float's ✕ with the keyboard (Tab or `locator.focus()`) → Escape. | Exactly round 110's results: (a) ⤢ (the dock's own rule), (b) ⤢, (c) Play. (d) ⤢: focus was in the float, not in the library, so the dock's rule applies and the workspace rescue stays unarmed. The workspace never moves focus to ▶ in these steps. Record `activeElement` after each step. |
| **VR-SEARCH** (1440) | Opened for video → type `mid` in the search → Escape. | The query is empty, focus stays in the search input, and the video is **still floating**. Record a second Escape's effect (expected: nothing; typing target). |
| **VR-NOT-FOR-VIDEO** (1440) | Library expanded (no ◀) → mouse ⤢ → focus the selected option → Escape. | Docked, the library stays expanded, and focus stays on the option. No Enter in this row. |
| **FV-710** (1440) | Expanded library → mouse ⤢ (float) → focus ◀ → Enter. | Unchanged from round 110: the library collapses, the video returns, focus = ▶ (not ⤢), and Enter 2 adds 0 clips. |
| **LF-QUICK** (1280) | Round 110's LF-COLLAPSE, LF-EXPAND and LF-CLEAR, at one viewport. | The same results as in c-round-110 (focus on the partner after Enter 1, 0 clips after Enter 2). |
| **R12-L2-ENTER-ADD** (1280) | Regression: focus an option and press Enter. | Exactly one clip is added (SRW-12 R12-L2 unchanged). |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror, no non-noise console error. A first-load failure after a dep re-optimization: retry once and record both. |
| **G111-3** | anonymous, run alone, after all rows | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in, no workspace and 0 `audio[src]`. `/api/studio-token?product=middle-east&file=stem1.wav` returns **401**. (Without parameters it returns 400 from parameter validation; that is not the criterion.) The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud) and goes under `blocked`. |
| **AN-REVIEW** (offline) | Review A's tests. | The fail-before list matches §1, or A explains the difference. C re-runs m1, m2 (expect VR0 red) and m3 (expect VR4 red) with its own mutation strings and gets the same red tests. VR3 counts clips (not status text). Exact assertions only; no `as`, `@ts-` or `any`. |
| **T111-TARGETED** (offline) | `npx vitest run $(cat a-round-111/targeted-list.txt)`, in scratch with its own `cacheDir`. | All pass. C re-runs the grep and reports any missing file. `floating-video`, `library-focus-handoff`, `render-budget` and `self-disabling-focus` are in the list. |
| **DOC-096 / DOC-095-L4** (offline) | Read doc 096; diff doc 095 against `832fee2`. | Doc 096 has the TEMPLATE sections, the rule, the mechanism, the rejected alternatives and the probe. In doc 095 only l.4 changed, and it names round 110 as C PASS and published in `832fee2`. |
| **SOURCE-UNCHANGED** | start and end | HEAD `832fee2`; the start status is empty and the end status is **2 M + 2 ??** (`--untracked-files=all`). The frozen list checks 545/545. The `StudioWorkspace.tsx` diff against the snapshot touches only the four parts listed in Baseline. The protected hashes are unchanged. |

- **Gate rows** (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbouring behaviour that could break:**
  - **Floating video float/return:** VR-OUTSIDE, VR-NOT-FOR-VIDEO, FV-710, `floating-video.test.tsx`.
  - **Round-110 library handoff:** LF-QUICK, `library-focus-handoff.test.tsx`.
  - **Search Escape:** VR-SEARCH.
  - **Render budget:** T111-TARGETED.
  - **Purchase protection:** G111-3.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Keyboard focus after the floating video returns and the library re-collapses | None checked this round. Live has no floating video over the Browser and no DOM keyboard focus model, so there is nothing to compare. | — | CZABA's own a11y/keyboard rule (docs 093/095 extended to a workspace-driven collapse); no Ableton claim is made. | არ ეხება |

## 4. Report (A)
Write `a-round-111.md` and `a-round-111/a-round-111-summary.json` as you go (the harness writes `a-round-111-result.json`). Include:
- the changed files with end sha256 (`a-round-111/end-hashes.txt`);
- the exact commands and their results;
- the fail-before list;
- the m1–m5 table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the self-check probe result;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
