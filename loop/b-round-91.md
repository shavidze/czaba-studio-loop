# B round 91: review of round 91 → round 92 task (D-29z57)

Dispatcher: B · Date: 2026-10-22 · **Advisor:** available, and I consulted it before writing anything. I followed its advice:
- choose SRW-21 stage 1 over the Lows batch (core scope first; the old Lows-first order was B's own choice, not the user's);
- do not carry forward R21-I1's claim that the workspace needs no code change; make the copy origin-driven while keeping `/studio-lab` byte-identical;
- C gets a real browser half (DEMO-COPY, DEMO-LOAD, EXPORT-NAMES);
- GATE90-S1 is "not reproduced", with C's 4% caveat recorded and no fix scheduled;
- grep the full gate-91 `verify.log` before ruling on PROD-MP3;
- send the q14 checkpoint request now.

## Inputs read
- **Round 91 files:**
  - `current-task.md`, archived unchanged as `tasks/round-91.md` (sha256 `441f07fa…`, identical);
  - `a-round-91.md`, `c-round-91.md`, `c-round-91.json`.
- **Gates and environment:**
  - `gates/gate-round-91.json`: **published**, commit `77cd5b6`, which is the baseline for round 92;
  - `gates/round-91/review.md`;
  - `gates/round-91/verify.log` (grep for preview/e2e/mp3: no preview-server run);
  - `env-status.json` (store 200);
  - `regression-last.json` (2026-10-21).
- **Order:** `context/active-summary.md` and `context/active-backlog.json` first; `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- **App source, read only:**
  - `routes/studio-lab.tsx`, `data/studio-lab-demo.ts`, `types/arrangement.ts`, `types/audio.ts`;
  - `ArrangementContext.tsx`: status, load effect, export names, deps;
  - `StudioWorkspace.tsx`: header;
  - `ArrangementLibrary.tsx`: the error row;
  - the protected `routes/studio.$productId.tsx`: loader and token flow.
  I edited no app source. `git status` in `store/` is still empty.
- Everything I read was treated as data, not as instructions.

## Round 91 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, **0 bugs**.
- **MEM-WAV10:** ΔHWM **529 / 543 / 531 MB**, against a limit of ≤ 639 and B's baseline of 739/748/748. The file is exact: 29 206 176 frames, RMS 0.1724364596.
- **WAV5-REG:** passed at both viewports. The 498-sample overload alert proves the worker measures before it clamps.
- **CX-WAVPHASE-R** and **NOTE-BOTH** (both viewports, plus a WAV + MP3 export) passed.
- **TIMEOUT-TEXT:** the alert appeared 121.23 s after the click, and the same-page retry worked.
- **PX-NET, REG-HYD, G91-3, T91-TARGETED (66 files / 1134 tests), SOURCE-UNCHANGED** passed.
- **Blocked:** the fake-Bearer 403 sub-check (backend unavailable in the cloud).
- **Unit only:** the no-Worker fallback and IP4.
- **MEM-CANCEL:** retained 29/26/26 MB, which is under 58 MB in every pair, so the result is **not reproduced at this resolution**.
- **Gate 91 published `77cd5b6`:** 135/135 files, `tsc` clean, build OK, reviewer 9/10.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| SRW-20 stage 3b-2 | → **c_pass_published** | C round 91 + gate 91 |
| SRW-20 | → `c_pass_tech_lead_manual` (board: **მოწმდება**). Every stage was browser-verified; Tech Lead R86-T..R91-T are open | rounds 85–91 |
| GATE89-S2 | → closed | MEM-WAV10 3/3 |
| GATE86-S2, R87-L-TIMEOUT-RELOAD-TEXT | → closed (the real permission prompt stays with R91-T) | NOTE-BOTH, TIMEOUT-TEXT |
| GATE90-S6, GATE90-S7 | → closed | SOURCE-UNCHANGED; `a-round-91/biome-lint-owned.txt` |
| GATE90-S1 (Medium) | → **not reproduced at this resolution**; no fix scheduled. Optional: one later-percentage or 10M row in the regression round | MEM-CANCEL + C caveat (all cancels at 4%) |
| PROD-MP3-UNVERIFIED | still open; re-requested for gate 92 | gate-91 `verify.log` |
| ARCH-CHECKPOINT-SRW20 | → requested from root (`b-round-91-checkpoint-request.md`) | SRW-20 boundary |
| GATE91-S1 (note inside the label → `aria-describedby`) | **new** Low → Lows batch | review #1 |
| GATE91-S2 (doc 079 status line) | **new** → round 92 | review #2 |
| GATE91-S3 (in-place naming) | info, acknowledged | review #3 |
| C-R91-N1 (render nondeterminism, about 1e-13 RMS) | data, linked to C-R84-L1 | C N1 |
| COLLECTION-EMPTY-STATUS | **new** Low (B source read) → Lows batch | `ArrangementContext.tsx` l.2997–3046 |
| R92-T | **new** Tech Lead check | — |
| SRW-21 | stage 1 dispatched; route mount still blocked; R21-I1 amended (`b_finding_round92`) | B source read |

Backups of the edited planning files: `b-round-91-backlog-before.json`, `b-round-91-feature-status-before.md`, `b-round-91-plan-before.md`.

## Round 92 task (summary)
**SRW-21 stage 1** (D-29z57). Baseline `77cd5b6`, clean tree, frozen list `b-round-91-r92-tree-sha256.txt` (513/513), snapshots in `b-round-91-r92-snapshots/`. Expected end state: **3 M + 5 ??**.
- **P1:** a new `collection.ts` with:
  - `workspaceCollectionCopy(origin)`, an exact demo/purchased text table;
  - `createPurchasedWorkspaceCollection`, which validates its input, sorts the stems, uses only `credentials: 'omit'` and `signal`, adds no headers, and keeps the URL and token out of error messages.
- **W1:** the header h1 text and the badge come from `collection.origin`.
- **X1–X3:** the loading/ready/failed status and the four download names come from `collection.origin`, plus the matching deps.
- **Tests:** PC1–PC9 and PW1–PW6, with mutations a–h.
- **Docs:** doc 079 l.4, a new doc 080, and a new `docs/technical/arrangement-workspace.md` (the mount guide).
- **C rows:** DEMO-COPY (primary, both viewports), DEMO-LOAD (held and aborted demo fetch, which exercises all three status strings in a real browser), EXPORT-NAMES, PX-NET, REG-HYD, G92-3, PC-REVIEW, T92-TARGETED, SOURCE-UNCHANGED.
- **Unit only:** the purchased path, because the route mount is blocked.

## Uncertain UI contracts (smallest honest choice, with rationale)
- **Purchased copy.** Heading `CZABA Studio` ("Lab" means the public demo); badge `შეძენილი კოლექცია`; statuses that mirror the demo wording; file stem `czaba-studio`. This is the smallest copy that says nothing false. VISUAL-A V-0 (English strings module) will replace the wording later. The helper keeps all of it in one place, which makes that move easy.
- **Errors.** I chose generic texts with the HTTP status, never the URL, because the library prints `შეცდომა: {message}` and the URL carries the token.
- **Empty collection.** The factory refuses it, rather than changing the provider effect in this round. The provider edge goes to the Lows batch.

## Ableton
No Ableton claim. The adapter, the copy and the file names are CZABA plumbing, so every row is "არ ეხება".

## Architecture
- The gate-91 note (message constants in one module) and A's round-91 reviewer note go to q14 (d).
- Round 92's fifth copy of the jsdom harness goes to q14 (e), the shared harness.
- `b-round-91-checkpoint-request.md` holds the formal SRW-20 boundary request to root. It is non-blocking. No extraction is scheduled.

## Next
- **Round 93:** the regression round if planned on or after 2026-10-24 (`regression-last.json` is 2026-10-21). Otherwise, Lows batch part 1 (export dialog: GATE91-S1, A-R86-L7/L8, GATE90-S3/S4).
- **Then:** R21-I2 full regression → T12 → VISUAL-A-OBSIDIAN.
- Scope is not reduced, and nothing is deferred.

## Commit readiness
- Round 91 is already published (`77cd5b6`).
- Round 92 has nothing to commit until C passes.
