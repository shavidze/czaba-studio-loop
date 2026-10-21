# A — Round 45 report: SRW-13 polish part 1 (SSR-LAYOUT-EFFECT-WARN, LIB-SEP-REASON, five doc notes; D-29z10)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-15 13:31–13:58 +04:00 · Evidence folder: `a-round-45/`
**No PASS claim.** C verifies. No commit, stash, push or deploy. Dev server not started or stopped.

## 1. Pre-flight gate

**Read before the first edit:** `.claude/rules/read-primitives.md`; the primitives `AGENT_DISCOVERABLE_CODE`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS` and `GEORGIAN_DOCS`; `prompts/new-hook.md`, `new-test.md` and `studio-feature.md`; `docs/implementation/TEMPLATE.md`; the `pre-flight` skill. The hook also injected `FORWARDREF_COMPONENT`, `DESIGN_TOKENS` and `TAILWIND_FIRST`. Nothing in this diff touches styling or component structure.

**Overrides recorded:**
- `prompts/new-hook.md` asks for a barrel export and JSDoc. The task overrides both: there is no `app/hooks/index.ts` edit (the `useRelativeFaderDrag` precedent), and there are no comments.

**Assumptions:**
- The literal ask is the 7 identifier swaps, one shared hook, one reason string and 5 doc notes. Behaviour does not change.
- `typeof window` is evaluated once at module load. That matches `usePositionWriterEffect`.

**Smallest version:**
- a 4-line hook;
- 7 identifier swaps plus import lines;
- 1 comment text;
- 2 test files.

**Success criteria:**
- SSR1 is red with 7 frames on the snapshots and green after;
- ISO is red (module missing) and then green;
- tsc 0; vitest 1351 + new tests; build passes;
- Biome: 2 baseline errors and ≤ 218 warnings;
- dev-server Δ 0.

**Baseline at start (13:31): starting point (b).**
- HEAD `ca851093ad77`; `git status --short` is empty.
- `sha256sum -c b-round-44-tree-sha256.txt | grep -vc ': OK$'` → **0** (386 OK).
- All 8 snapshot shas match the working files: `623f381e`, `7fe98434`, `61834b2a`, `dcfcf532`, `befdfd03`, `c26afb41`, `88330af8`, `294326f8`.
- Protected 4/4 OK. node.exe 19.

**§1.4 re-checks:**
- `grep -rn "useLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx` found exactly the 7 sites: Context 475; Workspace 669; DetailPanel 253, 261, 268, 618 and 629. **Stop condition not hit.**
- `grep -rn "useLayoutEffect" app --include=*.ts* | grep -v __tests__` found sites only in those 3 Studio files, plus the `usePositionWriterEffect` alias at Context l.410. **There is no non-Studio `useLayoutEffect` site** (§6.8 for B: none).
- `npx biome check` on the 4 source files before the edit gave 0 diagnostics (`a-round-45/biome-before.txt`).

## 2. Red run, mutations, green run

**Red** (`a-round-45/red-run.txt`; the sources were the untouched working copy, sha-equal to the snapshots; node.exe 19):

| ID | Result | Failure text |
|---|---|---|
| SSR1 | **red**, 7 matches | `expected [ 'ArrangementProvider', …(6) ] to deeply equal []`. Received, in order: `ArrangementProvider`, `StudioWorkspace`, `ArrangementDetailPanel`, `ArrangementDetailPanel`, `ArrangementDetailContentInner` ×3. This is exactly B's table. |
| SSR2 | green | — |
| SSR3 | green | — |
| ISO1/ISO2 | red (suite) | `Failed to resolve import "~/hooks/useIsomorphicLayoutEffect" … Does the file exist?` |

**Green v1** (`green-run.txt`): 5/5.

**SSR4 was added after review** (§5). It is a positive control: a probe component with a bare `useLayoutEffect` must give exactly `['ServerLayoutEffectProbe']`.
- It is a regression guard. It is green on the snapshots too, so it is not part of the red evidence.
- Its spy is per-test (`mockRestore` in `afterEach`), so SSR1's count is unaffected.

**Green v2** (`green-run-v2.txt`): **6/6**.

**Mutations** (`a-round-45/mutations.txt` is v2 with SSR4; `mutations-v1.txt` is the earlier run):
- Setup: a scratch copy of `store/app` in `a-round-45/scratch/`, script `tools/run-mutations.sh` + `tools/mutate.cjs`.
- `node_modules` was a junction, removed with `cmd /c rmdir` after each session. node.exe 19–27.

| # | Mutation | Failed | Expected | Frames |
|---|---|---|---|---|
| base | unmutated copy | none (6/6) | — | — |
| (a) | hook always `useLayoutEffect` | SSR1 | SSR1 (7) | the 7 of B's table ✓ |
| (b) | hook always `useEffect` | ISO1, ISO2 (`[true]` vs `[false]`) | ISO1 + ISO2 ✓ | — |
| (c) | DetailPanel cap-resize site (l.629) bare again | SSR1 | exactly 1 ✓ | `ArrangementDetailPanel` |
| (d) | inverted condition | SSR1, ISO1, ISO2 | SSR1 + ISO1 ✓ | 7 |
| (e) | pragma removed | SSR3, SSR1 | SSR3 (and SSR1) ✓ | 16 (in jsdom every alias, including `usePositionWriterEffect`, selects `useLayoutEffect`) |
| snapshot | the 4 sources at the `b-round-44-snapshots` | SSR1 | 7 ✓ | 7, same order |

**Harness deviation (not a test result):** in the first (e) run, MSYS path conversion rewrote the argument `// @vitest-environment node` to `/` and made the file uncompilable. It was re-run with `MSYS_NO_PATHCONV=1` (now in the script). **No mutation survived.**

## 3. Diff summary (against `b-round-44-snapshots/`)

- **`app/hooks/useIsomorphicLayoutEffect.ts`** (new, sha `0877f6ae`):
  - it imports `{ useEffect, useLayoutEffect }` from `react`;
  - it has one export, `useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect`;
  - Biome wrapped the line after `=`.
- **`ArrangementContext.tsx`** (`91634d8f`):
  - +1 import line (`~/hooks/useIsomorphicLayoutEffect`, after the `react` import);
  - the l.475 site is now at **l.476**, identifier only;
  - `useLayoutEffect` stays in the `react` import;
  - `usePositionWriterEffect` (l.411) and its 3 call sites are unchanged.
- **`StudioWorkspace.tsx`** (`30cdee8b`): `useLayoutEffect` was removed from the `react` import; +1 import after `~/contexts/ArrangementContext`; l.669 identifier only.
- **`ArrangementDetailPanel.tsx`** (`00dc8d66`): the same import change; 5 sites (253, 261, 268, 618, 629), identifier only.
- **`ArrangementLibrary.tsx`** (`a2b6f78d`): one line differs, the `biome-ignore` line.
  - It keeps the rule `lint/a11y/useSemanticElements`.
  - The new reason is `a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator`. That is the same wording as the existing DetailPanel separator at l.805.
  - The reason contains no `B`, `task`, `§` or `round`.
- **Bodies and dependency arrays at all 7 sites are byte-identical.** `diff -u` shows only `-useLayoutEffect(` / `+useIsomorphicLayoutEffect(` and the import lines (`a-round-45` command output above).
- **Tests:**
  - `ssr-layout-effect.test.tsx` (`0bcb6e50`; first line exactly `// @vitest-environment node`; SSR1–SSR4);
  - `useIsomorphicLayoutEffect.test.ts` (`39bf3deb`; ISO1–ISO2).
  - Neither has `any`, assertions, `@ts-ignore`, snapshots, fake timers or comments other than the pragma.
- **Docs** (line counts against the snapshots):

  | Doc | Lines | Change |
  |---|---|---|
  | 015 (`1e9af239`) | −0 +7 | new dated note at the end |
  | 034 (`797f5bd5`) | −0 +8 | new dated note at the end |
  | 035 (`7d79be58`) | −2 +10 | l.4 status, l.26 status quote, new dated note |
  | 036 (`4e6f94cf`) | −2 +2 | the l.436 clause, l.468 round |
  | 042 (`adcd6e04`) | new | — |

  - **036 l.436:** `…უცვლელია და ღიად რჩება (A-R36-REVIEW-1, B-ს ეკუთვნის; შესაძლოა ეტაპი 4b).` → `…round 36-ში უცვლელი დარჩა (A-R36-REVIEW-1) და round 37-ში D-29z2-ით დაიხურა (იხ. „Round 37“ სექცია; C round 37 PASS, `c-round-37.md`).` The l.513 sentence is untouched.
  - **036 l.468:** `ეტაპ 4b-ში (round 37) რჩება.` → `ეტაპ 4b-1-ში (round 38) განხორციელდა (C round 38 PASS, `c-round-38.md`).`
  - **035 l.4:** `Completed — C PASS (round 30, `c-round-30.md`; SRW-13 ეტაპი 3, D-29u)`. Doc 035 has no later-round sections that changed its behaviour, so none are named.
  - **035 l.26:** the quote is `Clip Gain: ღამის პულსი · სრული მიქსი — +6.0 dB.` The middle dot is U+00B7, byte-checked against `studio-lab-demo.ts` l.72. C round 30 l.231 also recorded this real status.
  - **035 note:** the `0 dB` dirty-text asymmetry (mouse → 1 entry; Tab → reset → Enter → 2 entries). Cites `a-round-30.md` §6.2a and `c-round-30.md` §10.
  - **034 note:** the non-zero no-op and "silent window with a later clip" are code paths only. The cause is the detail-panel clamp and the range-gesture clamp. Coverage is the provider tests plus C round 29 mutation (d). Cites `c-round-29.md` §4 (`no-4041.txt`, `ne-range-beyond.txt`) and §6.
  - **015 note:** doc 015 never described Delete on a range (evidence: `checkpoint-oct13-review.md` suggestion 1). Since SRW-24:
    - Delete/Backspace leaves a gap;
    - only Ctrl+Shift+X cuts time;
    - Ctrl+Shift+L extends the range to all lanes.

    It cites root `docs/technical/studio-real-workspace/delete-selection-update.md` and doc 034. **First draft corrected:** it said doc 015's "old Delete description no longer applies", but doc 015 has none.
  - **Doc 042:** Georgian, `TEMPLATE.md` sections, a Mermaid diagram, the §4.7 Ableton table (all rows not applicable), and TODO round 46/47.

## 4. Smoke and dev-server Δ (not a PASS claim)

**Browser** (`a-round-45/smoke.txt`; my own wrapper `a-round-45/b.sh`; fresh state `a-round-45/a-browse.json`; the CLI started its own daemon at 13:53; no `$B restart`; no fallback; node.exe 19–20).

**Daemon shutdown:** at the end, `$B stop` printed `Unable to connect`, and my state file was gone afterwards. Read-only check at 14:00: one `chrome.exe` remains. It is a Playwright renderer (PID 5540, parent 23832, profile `\tmp\.gstack\chromium-profile`) created at **13:47:30**, before my daemon started. So it is not mine, and it was left untouched. No other browse or chrome process remains.

**Steps:**
- **Load:** 1440×900 → `/studio-lab` (200).
  - Console: `[vite] connecting/connected` and the React DevTools info, then the known root `GET /api/cart` `ERR_CONNECTION_REFUSED` / `Failed to load cart`.
  - **No React, hydration or `useLayoutEffect` warning.**
  - Detail panel `data-collapsed=false`, height 144; ruler present.
- **Detail panel:**
  - REAL click on the `სრული მიქსი` option + REAL `＋ დამატება` → the clip was added and auto-selected. The detail inputs read start `0`, end `16`, Clip Gain `0.0`.
  - REAL `fill` start 8 + Enter, end 10 + Enter → `8 / 10 / 0.0`.
- **Zoom-back:**
  - SYNTHETIC `scrollLeft = 400` on `arrangement-timeline-scroller` (zoom slider 681, scrollWidth 2098);
  - REAL click `Zoom მონიშნულზე` → scrollLeft 2020, scrollWidth 12892, zoom 977;
  - REAL click `↩ Zoom` → **scrollLeft 400**, scrollWidth 2098, zoom 681. Exact restore.
- **Earlier attempt, discarded:** REAL `z` while focus was on the add button did nothing. REAL ArrowRight ×3 on the SYNTHETIC-focused zoom slider moved the zoom 678 → 681 and reset scrollLeft to 0. That is the slider's own behaviour and is not the zoom-back path.

**Dev-server log** (`a-round-45/devserver-delta.txt`; `r42-vite.err.log`):
- `/studio-lab` twice: 200; warnings 357 → 357 (**Δ 0**) each time; log bytes unchanged.
- Control `/` once: 200; the log grew 1161678 → 1163598 bytes, so **the log is live**. The growth is `Error loading homepage products: TypeError: fetch failed` (ECONNREFUSED: the backend is down). It contains no `useLayoutEffect` warning. That is non-Studio, for B/root info only.

## 5. Code-reviewer (actual `code-reviewer` subagent, read-only; score 9/10; no High/Medium)

| Finding | Severity | Disposition |
|---|---|---|
| Biome's `useExhaustiveDependencies` no longer checks the dependency arrays at the 7 sites. It matches hook names exactly, and `biome.json` has no `hooks` option. Same gap already existed for `usePositionWriterEffect`. | Low | **Not fixed; `biome.json` is frozen. For B/root:** add `{ name: "useIsomorphicLayoutEffect", closureIndex: 0, dependenciesIndex: 1 }` (and `usePositionWriterEffect`) under `correctness.useExhaustiveDependencies.options.hooks`. Arrays are byte-identical today; Biome showed 0 diagnostics before the edit. |
| The first-draft reason (`<hr> cannot take focus or aria-valuenow`) was loosely worded. | Low | **Fixed.** It now reuses the accurate DetailPanel l.805 reason. Doc 042 was updated. |
| SSR1 had no positive control: a React upgrade that drops the warning would make it pass vacuously. | Info | **Fixed:** SSR4 probe (red/green and mutation runs repeated, §2). |
| Doc 042's diagram said `l.475`, but the site is now l.476. | Info | **Fixed.** It now names the effect instead of a line number. |
| Doc 036 l.4 status still says round 37 waits for C (C round 37 is PASS); l.513 keeps the old tail. | Info | **Not changed.** It is out of §0.3 scope; l.513 is a historical note by contract. **For B:** a one-line status fix in a later doc round. |
| `ReturnType<typeof vi.spyOn>` could be `MockInstance<typeof console.error>`. | Info nit | Not changed; it is type-safe as is. |
| `usePositionWriterEffect` keeps an identical alias expression. | — | **Accepted, D-29z10.** |

## 6. Command tails (verbatim; node.exe on each run)

```
$ git rev-parse HEAD                          → ca851093ad775ba0cf51748559d02898cc2ab619 (start and end)
$ git status --short (end)
 M app/components/arrangement/ArrangementDetailPanel.tsx
 M app/components/arrangement/ArrangementLibrary.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/contexts/ArrangementContext.tsx
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
 M docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md
 M docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md
 M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
?? app/hooks/__tests__/useIsomorphicLayoutEffect.test.ts
?? app/hooks/useIsomorphicLayoutEffect.ts
?? app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx
?? docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md
$ sha256sum -c ../tmp/studio-real-loop/b-round-44-tree-sha256.txt | grep -vc ': OK$'   → 0 (end)
protected: download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK (end)
$ grep -rn "useLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx   → (none; exit 1)
$ grep -rn "useIsomorphicLayoutEffect(" … | wc -l   → 7
$ npx vitest run <2 new files>  (node.exe 19)  → Test Files 2 passed (2) · Tests 6 passed (6)
$ npx tsc --noEmit (node.exe 19)               → exit 0
$ npx vitest run (node.exe 19, before SSR4)    → Test Files 79 passed (79) · Tests 1356 passed (1356)
$ frozen suites, final tree with SSR4 (node.exe 19; frozen-list.txt + useIsomorphicLayoutEffect.test.ts + view, floating-video, fader-click) → Test Files 20 passed (20) · Tests 401 passed (401)   [vitest-frozen.txt, 14:00]
$ npm run build                                → ✓ built (exit 0)
$ npx biome check ./app (read-only, final tree, 14:00; biome-app.txt, biome-app-errors.txt) → Found 2 errors (app\lib\auth.ts format; app\lib\__tests__\bug-hunting\auth-bugs.test.ts format) · Found 218 warnings · Found 1 info · 0 diagnostics in Studio/hook/test files · 0 useSemanticElements / suppressions-unused
$ npm run verify (node.exe 19, after SSR4)     → tsc ok · Test Files 79 passed (79) · Tests 1357 passed (1357) · ✓ built ×2 · verify exit 0
$ grep -c "useLayoutEffect does nothing on the server" r42-vite.err.log → 357 → curl /studio-lab 200 → sleep 3 → 357 (Δ 0, ×2)
$ tasklist | grep -ci node.exe → 19 (start) … 19 (end); peak 27 during mutation runs
```

**Final count:** vitest **79 files / 1357 tests** = 77/1351 + 2 files / 6 `it`.

## 7. Deviations and self-check

- **SSR4** is an extra `it` beyond the §2.3 table. It was added on the reviewer's advice and lives in an allowed file. No other test file was created.
- **The library reason** was reworded twice (the second time after review). The final text is the one in §3.
- **Doc 015** first draft was corrected (§3).
- **Mutation (e)** harness re-run (§2).
- **Self-check:**
  - Edge cases: SSR at module load, where `window` is undefined. Hook order is identical on server and client, so hydration is unaffected.
  - Security: no new network, auth or URL code.
  - Primitives: the hook name is 3+ words, the test name equals the source name, there are no comments, and there is no barrel edit (overridden by the task).
- **Evidence refresh:** `vitest-frozen.txt` and the Biome files were re-captured on the final tree. My own superseded `a-round-45/biome-app-full.txt` (pre-SSR4) was replaced by `biome-app.txt` and removed. It was my own output, not a `store/` file.
- **Scratch** `a-round-45/scratch/` (a copy of `app` plus a vitest config) is left in A's folder; its junction is removed. Nothing was deleted from `store/`.

## 8. For B / root follow-up

- **Non-Studio `useLayoutEffect` sites:** none.
- **BIOME-HOOKS-DEPS** (Low, new, config-owned): add the custom effect hooks to the `useExhaustiveDependencies` `hooks` option (§5).
- **DOC036-STATUS-LINE** (Info, new): doc 036 l.4 still says round 37 waits for C.
- **Homepage SSR:** `Error loading homepage products: fetch failed` while the backend is down (non-Studio, info).
- **Root items unchanged** (`root-pre-push-review.md`: nothing open from it; `publication-checkpoint.json` `round44Checkpoint` = `ca85109`, pushed to both remotes, 1351 tests):
  - Round 45 is checkpoint-ready **only after C PASS**.
  - The carried items are GSTACK-ACL, `.kilo/`, e2e smoke (root only), SRW-21, Lenis, instruction-file paths, the export hard-clip, the CRLF auth errors, the `frontend-architect.md` grant, `Modal.tsx`, GA scroll, fake Bearer → 500, the CDP allowlist, the charset, dev-server availability, ENV-BROWSE-DAEMON and machine load.

## 9. Exact next C checks

1. **G45-2:** HEAD `ca85109`; `git status` = the 12 lines in §6; 386 OK; protected 4/4.
2. **R45-S:**
   - `diff -u` the 4 sources against the snapshots (identifier and import lines only; Library 1 line);
   - the hook file;
   - the greps (0 / 7);
   - banned content.
3. **R45-U:**
   - the 2 new files (6 `it`);
   - C's own mutations (a)–(f) in a C scratch copy. (f), the `StudioWorkspace` site reverted, should give exactly `['StudioWorkspace']`.
4. **R45-SSR:** `/studio-lab` ×3 Δ 0, plus the `/` control. The log is live; `/` adds a backend fetch error.
5. **R45-REG:** HYD, DP, DP-START, DP-RESIZE, CG, ZOOM, REFUSAL, LIB, PLAY at 1440×900 and 1280×720.
6. **R45-Doc:**
   - the 5 notes against the snapshots;
   - the doc 035 quote against the live status (`Clip Gain: ღამის პულსი · სრული მიქსი — +6.0 dB.` for the `სრული მიქსი` variant);
   - doc 042 and its Ableton table.
7. **G45-1:**
   - tsc 0;
   - vitest **1357**;
   - build passes;
   - Biome with the 2 baseline errors and 218 warnings.

## 10. B acceptance items A actually met (self-run; C must re-verify)

- §0.1: the shared hook is used at the 7 sites, bodies are unchanged and `usePositionWriterEffect` is untouched. Shown by the diff and greps.
- §0.2: the reason text changed on one line only.
- §0.3: the five notes are written.
- §2.3: red/green and A's mutations (a)–(e) were all caught.
- §2.4: gates, Biome counts, the code-reviewer review, the smoke and dev-server Δ 0 were all run as listed.
- **Not claimed:** any C ID (G45-*, R45-*). The backlog is not complete.
