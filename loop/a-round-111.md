# A — Round 111 report: C-R110-01 (Escape returning the floating video keeps focus in the library, D-29z76)

Status: implementation done; waiting for C. Code-reviewer ran (9/10, no Critical; no code change required). No commit/push/deploy; no servers were started or stopped.

## Start state (checked)
- HEAD `832fee24858746c4411b1299440406c06d8baefa`; `git status` was empty; the frozen list was OK (545); `StudioWorkspace.tsx` = snapshot `e83fa485…`.

## Changed files (end sha256 in `a-round-111/end-hashes.txt`)
| File | State | sha256 |
|---|---|---|
| app/components/arrangement/StudioWorkspace.tsx | M (+22/-0) | 2acbb082… |
| app/lib/arrangement/__tests__/library-video-return-focus.test.tsx | ?? new | 4a490a9f… |
| docs/implementation/2026/quarter-IV/095-studio-library-toggle-focus.md | M (l.4 only) | 7ee01e79… |
| docs/implementation/2026/quarter-IV/096-studio-video-return-library-focus.md | ?? new | 08708763… |

End status: 2 M + 2 ?? (`--untracked-files=all`); the frozen list is still OK (545/545); HEAD is unchanged.

StudioWorkspace diff, exactly the four allowed parts:
1. A module helper `libraryRailExpandButton(aside)`, directly after `trackRowNameButton`. It uses `querySelector('[data-testid="arrangement-library-expand"]')`.
2. `const pendingLibraryRailFocusRef = useRef(false);`, directly after the `floatingVideoStateRef.current = …` assignment.
3. The arm, inside `returnFloatingVideo`'s `state.libraryOpenedForVideo` branch and before the setters. It is armed only when `document.activeElement` is an HTMLElement, is not body, and is inside `libraryAsideRef.current`.
4. A deps-free `useIsomorphicLayoutEffect`, directly after the `pendingRowFocusRef` effect. It reads and clears the ref. If the ref was armed and activeElement is body or null, it calls `libraryRailExpandButton(aside)?.focus({ preventScroll: true })`.

Nothing else changed: the Escape and Enter branches, `expandFloatingVideo`, `changeVideoExpanded`, `changeLibraryCollapsed`, `isTypingTarget`, JSX, classes, labels and testids. No import change.

## Tests (new file, 10 tests)
VR0, VR1, VR2, VR3a, VR3b, VR4, VR4b, VR5, VR6, VR7.
- VR3 is split into VR3a (◀) and VR3b (option), so each case gets a fresh mount.
- VR4b is runnable in jsdom: the float's ✕ exists after flushFrames, and Escape returns focus to ⤢ (the dock's own rule).
- Escape is dispatched on `document.activeElement` and bubbles to window. That way VR5's typing-target check is real.
- Clips are counted through the context API and through `[data-clip-id]`.
- No `as`, `@ts-` or `any`.

## Fail-before (scratch `a-round-111/mut/store`, node_modules symlink, Vitest cacheDir `a-round-111/mut/.vite-cache`, StudioWorkspace = B snapshot)
- Red: VR1, VR2, VR3a, VR3b, VR7. Green: VR0, VR4, VR4b, VR5, VR6. This matches B's expectation (VR3 is now 3a and 3b).
- Raw results: `a-round-111/mut/results/*.json` and `summary.json`; driver: `a-round-111/mut/mutate.py`.

## Mutations (scratch only; control 10/10 green before and after; the scratch file was restored to the fixed version, and its sha matches)
| ID | Mutation | Red |
|---|---|---|
| m1 | arm = `false && …` (never armed) | VR1, VR2, VR3a, VR3b, VR7 |
| m2 | arm = `true || …` (unconditional in the branch) | VR0, VR4b |
| m3 | m2 + guard `if (true)` (no body/null check) | VR0, VR4, VR4b |
| m4 | helper selects `arrangement-library-collapse` | VR1, VR2, VR3a, VR3b, VR7 |
| m5 | `.focus()` without preventScroll | VR7 |

Every mutation turns B's expected tests red. Extras beyond B's expectation:
- m2 also turns VR4b red. With an unconditional arm, the focused ✕ unmounts, focus falls to body, and the workspace layout effect moves it to ▶ before the dock's passive cleanup can move it to ⤢.
- m4 also turns VR3a and VR3b red, which is expected because they depend on the rescue.

## Checks run (speed rules)
- `npm run typecheck`: exit 0 (`a-round-111/typecheck.log`).
- `npm run lint -- --max-diagnostics=500`: exit 0, 218 warnings + 1 info repo-wide, and 0 diagnostics in the owned files (grep count 0; `a-round-111/lint.log`).
- `npx biome check` on StudioWorkspace.tsx and the new test: clean, no `--write`. The test was formatted once through stdin with `biome format --stdin-file-path` (it removed 1 blank line).
- Targeted vitest (`a-round-111/targeted-list.txt`, 8 files: export-dialog-focus, floating-video, grid-snap-menu, library-focus-handoff, library-video-return-focus, video-fades-ui, render-budget, self-disabling-focus). The grep found 6 files; render-budget and self-disabling-focus were appended. Result: **8 files, 153/153 passed** (`a-round-111/targeted.log`).
- Not run (gate's job): the full suite, `npm run verify`, build, e2e smoke.

## Self-check probe (A evidence, not C acceptance)
`a-round-111/probe/s5-probe.cjs` (a copy of round 110's), Chromium, :5173, 1440×900, fresh context per run.
- The first attempt timed out waiting for the Middle East option. This was the first load after the edit; the options were present on the next load (`list-options.cjs`, 0 pageerrors). The retry succeeded.
- collapse: after Escape, active = `arrangement-library-expand`, collapsed=true, floating=false, clips 0. After Enter, active = ◀, the library is expanded, the video stays docked, clips 0.
- option: the same result (active ▶ after Escape; after Enter, ◀ and 0 clips).
- Result file: `a-round-111/probe/s5-probe-result.json`; screenshots: `s5-*-1440.png`.

## Code-reviewer (real `code-reviewer` subagent, read-only; score 9/10, no Critical)
Reviewer caveat: its environment had no shell, so it read the four regions with Read instead of `git diff`, and it did not re-run vitest or the mutations. A's own `git diff --stat` and `git diff` confirm there are no other hunks (+22/-0 in StudioWorkspace; 095 only l.4).
Findings and A's disposition:
1. The rescue cannot fire from outside the library. **none**. The float box is in the dock's `<section>` (position: fixed, no portal), not inside the aside, so `contains` is false for ✕, ⤢, drag, Play, timeline and BODY. No change needed.
2. Effect order. **none**. The library toggle effect's ref is null on this path. The dock cleanup is passive and runs after layout; activeElement is ▶ by then, and `floatFocusRef` is false. VR7 would also catch a second focus call. No change needed.
3. Stale arm. **none**. `libraryOpenedForVideo ⇒ !isLibraryCollapsed`, so the armed branch always causes a render. Its note on Safari mouse ✕ while an option keeps focus → ▶ is beneficial and recorded here. No change needed.
4. Render count. **none**. Refs only.
5. Low: VR0's Enter +1 depends on the open B-R107-ENTER-ON-BODY contract. **Kept**: B's §1 explicitly requires VR0 to assert +1 (the hazard control, and C's VR-HAZARD row). If B-R107 changes Enter-on-body, VR0 must be updated with it. This is flagged for B.
6. Low: timeline/drag-handle focus has no dedicated test. **Not added**: same DOM class as Play/✕ (VR4/VR4b); C's VR-OUTSIDE covers the browser side.
7. Low: `mockLibraryLayoutRects` relies on a `firstElementChild` testid. **Kept**: copied verbatim from the frozen neighbour's harness, as B instructed.
8. Nit: `focusedElement !== document.body` is redundant. **Kept**: B's mechanism wording is "non-body element inside the aside"; it is harmless and explicit.
9. Nit: `instanceof HTMLElement` would skip a focused SVG. **Kept**: no focusable SVG exists in the library today.

### Architecture note (verbatim, for B/root; not acted on)
სიგნალები 3 და 4: `StudioWorkspace.tsx:821-828` და `:830-840` ახლა ორი მეზობელი ბლოკია ერთნაირი სტრუქტურით (armed ref + deps-free layout effect + `querySelector` testid-ით), ხოლო მესამე ასლი `ArrangementLibrary.tsx:196-208`-შია. ერთი და იგივე რეგიონი round-ებში 093/095/096 ზედიზედ შეიცვალა. ჯერჯერობით დავტოვოთ (თითო ბლოკი ~10 ხაზია, owner-ის შიგნითაა და ტესტით დაფარულია). Planner-ისთვის წინადადება: ცალკე, შეზღუდული დავალება `useArmedFocusRescue`-ის ტიპის hook-ის გამოსაყოფად. მიღების კრიტერიუმი: VR1, VR7 და 095-ის handoff ტესტები უცვლელად მწვანეა.

## Known gaps
- The probe ran at 1440 only; the 1280 rows are C's.
- VR-SCROLL and VR-OUTSIDE were not measured in a browser by A; they are C's rows.
- B-R107-ENTER-ON-BODY remains a user question; not touched.

## Exact next C checks
All rows of current-task §2: VR-HAZARD (1280+1440), VR-ESC-BUTTON (1280+1440), VR-ESC-OPTION (1280+1440), VR-SCROLL (1280), VR-OUTSIDE (a–d, 1440), VR-SEARCH, VR-NOT-FOR-VIDEO, FV-710, LF-QUICK, R12-L2-ENTER-ADD, PX-NET, REG-HYD, G111-3, AN-REVIEW (re-run m1/m2/m3 with C's own strings; note that m2 also reds VR4b), T111-TARGETED, DOC-096/DOC-095-L4, SOURCE-UNCHANGED.

## B acceptance criteria A actually met
- §1 implementation within the four allowed parts — yes (diff above).
- Fail-before list reported — yes (it matches).
- m1–m5 — yes (each one's expected tests turn red; the extras are explained above).
- typecheck/lint/biome/targeted — yes.
- Code-reviewer — yes, it was run and every finding has a disposition.
- Every browser acceptance row in §2 is C's and is not claimed here.

## Evidence durability
- Small copies of the mutation evidence are in `a-round-111/mut-evidence/` (mutate.py, summary.json, fail-before.json, m1–m5.json, control-*.json). The `a-round-111/mut/` scratch copy (161 MB, node_modules symlink) holds the raw files but may not persist between jobs; it was not deleted.
- Browser state: the probes used fresh incognito contexts and never wrote `a-browse.json`.
