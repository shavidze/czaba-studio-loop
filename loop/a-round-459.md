# STOP — needs B ruling on A-R459-REVIEW-R1 (Medium regression vs HEAD; the fix is in hash-pinned code, outside A's hand-edit permission)

A round 459 — SABA-B-13 Store entrance cover.

- **B's planning did not cover this scenario:** a grep of `b-round-458/sketch-review.md` and `pd-consult.md` for hydrat/418/re-render/extension/client render finds only first-paint, failsafe and late-hydration lines. There is nothing on a client re-render after a mismatch.
- **What:** if a hydration mismatch makes React 18.3.1 re-render the whole document on the client (`hydrateRoot(document)`, `app/entry.client.tsx:6`; the reviewer says browser extensions commonly cause this; A did not test an extension, only a synthetic `<div>` injected before hydration), the boot-script handshake on the React-owned `<style id="czaba-entrance-cover">` is lost:
  - the style node is replaced (`media="not all"`, no `data-start`), so the black cover goes off (A measured `styleReplaced` true and `media` `not all`; "abruptly" is the reviewer's inference, no frame timing taken);
  - `claimEntranceStart` falls through to the session claim, but the boot script already set `czaba_entrance_seen`, so **no overlay plays at all**;
  - no takeover event is sent, so the boot script's capture keydown/click listeners stay for the life of the tab (per the reviewer; A did not measure the leak).
- **A's real-browser reproduction** (prod builds, Chromium, 1440×900, mock API; script `a-round-459/r1/r1-repro.mjs`, which inserts one `<div>` into `<body>` before hydration → React #418):
  - **HEAD 891dc0f :5190** (`a-round-459/r1/head.txt`): plain `overlaySeen` true; inject `overlaySeen` **true** (#418 logged, the entrance still plays).
  - **Tree :5191:** 2 inject rows are on file (`a-round-459/r1/tree.txt`). The first plain and inject runs went to the console only:
    - `{"inject":false,"overlaySeen":true,"styleReplaced":false,"firstState":"live","curMedia":"not all","seen":"1","hydrationLogs":[]}`
    - `{"inject":true,"overlaySeen":false,"styleReplaced":true,"firstState":null,"firstStart":"64.4…","curMedia":"not all","seen":"1","injectedPresent":true,"hydrationLogs":["…React error #418…"]}`
  - **Tree result:** inject `overlaySeen` false in 3/3 runs (2 on file + 1 console-only).
  - **HEAD control:** inject `overlaySeen` true in 1/1.
  - So this is a regression against HEAD in that scenario, not a pre-existing gap.
- **Reviewer's proposed fix (not applied):** keep the handshake state on a typed `window.__czabaEntrance` global (`declare global { interface Window … }`), so the style node only controls visuals and React can always send the takeover. Add a node-replacement test (R8). This changes `EntranceCover.tsx` / `SpotlightLoader.tsx` / the test file, whose hashes C3, the claims and `mutants.txt` pin.
- **Tree state:** the B patch is applied unmodified (4 hashes OK) plus doc 300. A changed nothing in code after the reviewer ran.

## Changed files (exactly the 5 grants, `b-round-458/grants-459.txt`)
- `app/components/loading/EntranceCover.tsx` (new, from the patch)
- `app/components/loading/SpotlightLoader.tsx` (patch)
- `app/root.tsx` (patch: 2 added lines)
- `app/lib/__tests__/store-entrance-loader.test.tsx` (patch)
- `docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md` (new, written by A):
  - l.3 `**თარიღი:** 2026-11-12`; l.4 `**სტატუსი:** Completed (C round 459 PASS)`; 0 `pending`.
  - TEMPLATE's 7 headings are in order. E1–E14 and E8b are cited, and all are present in the test file.
  - After the review, A corrected the wording for R6 (failsafe: "boot script ran, bundle slow/failed", not "no JS"; E5: the overlay commits first and the cover goes off in a passive effect) and R7 (the "click doesn't reach the page" claim is marked browser-only, checked by C9).
  - **If B rules a code fix,** l.4 and the test list must be revisited, along with any R1 test that gets added.

## Steps and real results
| Step | Result | Evidence |
|---|---|---|
| 1 read | lessons A part; the 8 primitives (BUG_HUNTING_TESTS, FORWARDREF_COMPONENT and new-test.md only partly, head-limited); pre-flight SKILL read **after** applying the patch, not before (the patch is B's pinned code, so A wrote none; noted honestly) | — |
| 2 claims-before | rc 0; equals `claims-459-planning-output.txt`; stderr empty | `a-round-459/claims-before.txt`, `.err` |
| 3 apply | `sha256sum -c sketch-459.sha256` OK; `git apply` OK; `sketch-files-sha256.txt` 4 OK (re-checked at the end: 4 OK) | shell |
| 5 typecheck | rc 0 | `a-round-459/typecheck.log` |
| 5 lint | rc 0, `Found 207 warnings.` (K14) | `a-round-459/lint.log` |
| 5 biome, 4 code files | rc 0; 5 `noDangerouslySetInnerHtml` + 1 `noArrayIndexKey` (= K18); no format diff | `a-round-459/biome-4.log` |
| 5 covering | 11 files / 201 tests passed; 3.57 s total; no slow test | `a-round-459/covering.log` |
| 5 mutants | scratch `/tmp/a459-mut` (clone --shared at 891dc0f + patch + node_modules symlink); rc 0; identical to `b-round-458/mutants/mutants.txt` (20 lines: BASE green, M1–M19 red) | `a-round-459/mutants/mutants.txt`, `run.log` |
| 5 code-reviewer | ran; findings below; R1 reproduced → STOP | this file |
| 6 fresh 1440 CPU1 (prod :5191) | `firstPaintedLum` 0 (≤ 3); firstCovered 97, removedAt 1623 → **1526 ms** (in 1400–1700); gaps 0; logo 714 / tag 467; `live` | `a-round-459/fresh-1440.json` |
| 6 reload 1440 CPU1 | `anyBlackSample` false, blackFrames 0, finalState null. Its `firstPaintedLum` is 0, with no black samples; B's matrix has the same pattern on some reload/rm rows (for example 1440/cpu1/rm), so this is a probe artefact | `a-round-459/reload-1440.json` |
| 6 servers | :5190 and :5191 stopped. The dev server :5173 was not touched | — |
| 7 claims-after | rc 0; equals `claims-459-expected-after-A.txt`; stderr empty (again after the doc edit) | `a-round-459/claims-after.txt`, `claims-after2.txt` |
| 8 scope | `git status --short --untracked-files=all`: only the 5 grants | — |

## Code-reviewer findings (subagent `code-reviewer`, score 7.5/10)
| Id | Sev | Finding | A's verification / action |
|---|---|---|---|
| A-R459-REVIEW-R1 | Medium | A whole-document client re-render after a hydration error loses the handshake: no entrance, and the boot listeners leak | **Reproduced in the browser, regression vs HEAD → STOP** (above) |
| A-R459-REVIEW-R2 | Low | The boot listeners have no self-timeout. If `/` renders its ErrorBoundary and `SpotlightLoader` never mounts, they stay for the tab (harmless). Fix: `setTimeout(off, FAILSAFE+EXIT)` in the boot script | Not reproduced; code-only, for B |
| A-R459-REVIEW-R3 | Low | `var(--color-black)` is emitted only while some class uses it; if missing, the cover is silently transparent. E1 checks the string, not the built CSS | Not reproduced; doc 300 already names the dependency |
| A-R459-REVIEW-R4 | Low/info | No CSP exists (SECURITY_AUDIT §6 open). A future CSP needs hashes for the inline `<script>`/`<style>`. Both fail safe. No injection path (static constants) | Record for future CSP work |
| A-R459-REVIEW-R5 | info | A `/` opened in a background tab uses up the once-per-tab entrance while timers are throttled | Product question for Saba, next to SABA-Q-ENTRANCE-RELOAD |
| A-R459-REVIEW-R6 | Low | Doc wording: failsafe "no JS"; E5 "same commit" | **Fixed in doc 300** (A-owned) |
| A-R459-REVIEW-R7 | info | The doc claim "click doesn't reach the page" has no jsdom test | **Doc marks it browser-only (C9)** |
| A-R459-REVIEW-R8 | Low | Test gaps: no node-replacement test (R1); no "listeners gone after `expired`" assertion; E11 is a source regex (brittle); `findOverlay(_container)` ignores its parameter | For B; tests are hash-pinned |
| R9 | info | Checked and correct: hydration warnings, StrictMode, stylesheet blocking, z-order, late hydration, storage failures | — |

**Architecture note (for B/root, not acted on):** the state machine between the inline script and React is split across a JS string and a component, and its contract is DOM attributes (`media`, `data-start`, `data-state`). Keep it for now. Only if R1 is accepted: one bounded task moves the handshake into `app/lib/entrance-handshake.ts` with a typed `Window` global. E1–E14 stay green, plus a node-replacement test. `root.tsx` is untouched.

## Scope completed
- A steps 2–8 done, with the results above. Step 5 code-reviewer: done, and it produced the STOP.
- **No B/C acceptance row is marked passed by A.** C1–C15 are C's. B decides whether C runs this round as is or after a re-dispatch with an R1 fix.

## Exact next checks for C (if B lets the round proceed)
- **Mock API pitfall:** `setsid node /home/runner/czaba-project/tmp/studio-real-loop/mock-api/server.mjs` silently does nothing through the symlinked loop path (`import.meta.url !== argv[1]`). Use the real path: `setsid nohup node $(realpath /home/runner/czaba-project/tmp/studio-real-loop)/mock-api/server.mjs &`, then `curl 127.0.0.1:5199/api/products` → 200. A started one this session; do not assume it still runs.
- Playwright import from loop scripts: use the absolute `/home/runner/czaba-project/store/node_modules/...` path, as `frames.mjs` does.
- The R1 repro, as an extra row: `node a-round-459/r1/r1-repro.mjs <base> inject` on HEAD and the tree; compare `overlaySeen`.
- Otherwise rows C1–C15 as written in the task.

## Known gaps
- R1 is open (STOP).
- Firefox/Safari cannot be tested in the cloud: TLM-R459-FIREFOX-SAFARI-ENTRANCE (deadline RETRO 465).
- Saba's own check needs a fresh tab.
- A ran only one fresh and one reload sample (1440/CPU1). The full matrix is C's.
- Not run by A (speed rules, gate): full vitest, `npm run verify`, e2e. The prod build ran successfully inside `serve-prod.sh`.
