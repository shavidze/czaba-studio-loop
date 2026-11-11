# B round 447 → 448 planning report

- **Date:** 2026-11-11.
- **Decisions:** D-29z1589 … D-29z1591. `backlog.json` goes from v433 to v434 through `b-round-447/update-backlog.py`.
- **Advisor:** available, and consulted after orientation and before writing.
- **Consults:** `tech-lead` sketch review: v1 APPROVE-WITH-CHANGES, then a v2 delta review, APPROVE.

## 1. Round 447 accepted (D-29z1589)
- **C evidence:** `c-round-447.json` is a PASS. `browserVerified` and `realVerified` are true, C1–C15 passed, and there are 0 bugs. The two BLOCKED halves (the "Sign in required" text and the `account.downloads` card) are blocked only because the backend is unavailable in the cloud, and they are listed under `blocked`.
- **Gate 447:** `published`, commit `cce5eda` on both remotes. The review says COMMIT OK, 9/10, and verify is green. **The baseline for round 448 is `cce5eda`.** `context/head-sha.txt` still says `5df7717`.
- **STORE-2b-2a is done.** The checkout ripple question to Saba, SABA-Q-CHECKOUT-RIPPLE, is still `awaiting_user`; the default (removed) ships.
- **A's reviewer Lows** (L7: a confirmation is not a new id):

| Id | Disposition |
|---|---|
| A-R447-REVIEW-L1 (exact counts) | taken into round 448 |
| A-R447-REVIEW-L2 (inline `boxShadow` coverage) | `deferred_low_polish` |
| A-R447-REVIEW-L3 (`perf/` scan) | taken into round 448 |
| A-R447-REVIEW-L4 (S button yellow, solo = active) | `deferred_low_polish`, `confirmedBy` C round 447 O2 and gate reviewer suggestion 1 |

- **C observations:**
  - **O3** (unattributed hero pixel diff): carried into round 448 as the C10 HEAD-vs-HEAD control row (INFO-C447-O3-HERO-PIXEL-DIFF).
  - **C7 row note** (Export Mix contrast was measured only by A): C11 re-measures it.
  - **C14:** the round-447 C14 premise ("Sign in required" visible) does not hold in the cloud. That was B's spec error (B-R447-AUTH-ROW-PREMISE). The purchase-protection row now asserts 0 `audio[src]`, 0 media requests and HEAD parity.
  - **L57:** `c-round-447.json` has none of the 12 L57 fields (`b-round-447/l57-check-447.txt`, INFO-C447-L57-ABSENT). The round-448 task names "all L57 fields" and the checker.
- **Retro candidate for RETRO 450:** A made the source edits through python string replaces in the shell, so the hook did not fire. A also read primitives after editing and ran `git stash` in the store tree (RETRO450-A-SHELL-EDITS-BYPASS-HOOK).
- **Architecture notes:** gate 447 says keep, with one planner-level note: the allow-list test is a ratchet that will be edited at every sweep stage. It is not scheduled. There is no checkpoint request, because no structural risk is accumulating on one owner.

## 2. What is next and why (D-29z1590)
- **Due dates:** regression is not due (on or after 2026-11-13); RETRO is round 450. There is no C bug above Low and no loop-runnable Critical or High. STEM-LANES is still `awaiting_user`, so STORE-REDESIGN continues: 2b-2b.
- **`email.server.ts` is dead.**
  - It has 0 importers in `app`, `perf` and `e2e` (K5). `sendOrderPaidEmail` was added in `39a2cd6` and lost its caller in `3b094eb`, the Shopify removal (K21).
  - Restyling dead code proves nothing in a browser, so the file is not restyled, by the same rule as `Timeline.tsx` in round 447. It joins **LEGACY-DEAD-STORE-COMPONENTS**, with `PianoCurtainLoader.tsx` (K6). Removal follows Saba's legacy policy in the next cleanup or ARCH-SPLIT round.
- **The 3 live hits are the `/hire-us` inquiry e-mail.** B captured the e-mail HEAD really sends: `probe/capture-hire-us-email.ts` runs the real `action` with `fetch` stubbed. B rendered it in Chromium on a white and a #121212 client background (`probe/email-contrast.cjs`):
  - light client: **10 of 12 text elements fail**, with the submitted values white on white;
  - dark client: 1 fails.

  This is filed as **B-R447-HIREUS-EMAIL-LIGHT-CLIENT** (Medium, pre-existing). A teal→brass swap alone cannot pass, because brass on white is 2.33:1. The fix therefore includes the e-mail's own background.
- **Reference:** the Store spec has no e-mail guidance (K17: 0 hits). B wrote "no reference found" and used the `@theme` palette plus round 447's designer rulings.

## 3. Round 448 = STORE-2b-2b (D-29z1591)
- **Sketch:** `b-round-447/sketch-448.patch.txt`, v2, sha256 `76965797…` (`sketch-review.md`).
  - Builder `app/lib/hire-us-inquiry-email.server.ts`. Its palette mirrors `@theme` and is pinned by HE1. The background is painted by an outer presentation table, its `td` and the content `div`.
  - The route wires the builder in.
  - Tests HE1–HE7 (node) and HE8–HE9 (jsdom contrast).
  - `store-teal-sweep`: exact counts (L1) and a `perf/` scan TS5 (L3).
- **Pre-check on v2:**
  - typecheck rc 0;
  - build rc 0, with the builder in `build/server` only;
  - full suite: see §6, K14b;
  - mutants M1–M10, each red on its named rows (K13);
  - Chromium probe: 0 failing rows in both clients, min 7.06:1 (K11).
- **`tech-lead` v1 findings applied:**
  - an in-suite contrast test;
  - the table/`bgcolor` hardening;
  - no `as` and no implicit `any`;
  - fallback pin HE6;
  - the characterisation label on HE7;
  - the `@theme {` anchor;
  - the "Inquiry" naming.
- **Deferred Lows** (`deferred_low_polish`):
  - TL-R448-L5-TEAL-REGEX-COPY;
  - TL-R448-L6-HIREUS-ACTION-HARDENING (pre-existing: prototype lookup → 500, the subject going through the HTML escaper, mailto URL-encoding, casts);
  - TL-R448-D1-HE8-OWN-COLOUR;
  - TL-R448-D2-MESSAGE-LONGHAND.
- **Signal:** SIG-R448-EMAIL-HTML-SHARED, not scheduled.
- **Collision check (L23):** the tests that name `hire-us` are `store-theme-tokens`, `store-focus-ring`, `store-header-footer` and `store-teal-sweep` (K9). They read the page's form markup, which is unchanged. All four are in `covering-448.txt` and are green in the sketch's full run. The e2e specs visit `/hire-us` but do not submit.
- **Tech Lead manual:** TLM-R448-HIREUS-EMAIL-CLIENTS: one real send, checked in Gmail, Outlook and Apple Mail. Deadline RETRO 465.

## 4. Ready for commit
Round 447 is published (`cce5eda`). B has nothing else for root to publish. Round 448 is dispatched.

## 5. For Saba
- **SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE** (proposal only; a project-rule file, so the loop does not edit it): `.claude/primitives/DESIGN_TOKENS.md` still lists brand as teal #13D9CC and accent as orange, while `app/styles/app.css` defines brand #c9a46a. Suggestion: update the primitive to the Obsidian & Brass tokens.
- **SABA-Q-HIREUS-EMAIL-THEME** (default ships): the Hire-Us inquiry e-mail you receive now has the Store's dark Obsidian background with light text and a brass link, readable in light and dark mail clients. Do you prefer a light e-mail instead (dark text on white, brass link)?
- **For root:** `docs/technical/studio-real-workspace/agent-workflow.md` on disk is 87 lines and ends at the "Loop v2" section, while the policy snapshot in B's prompt continues with the cloud-runner, speed, bug-gate and later sections. The policy says the file wins when they differ, so please check whether the later sections were meant to be in the file.
- Still open: SABA-Q-CHECKOUT-RIPPLE, SABA-Q-LEADMAGNET-NAV-RULES, SABA-Q-LEADMAGNET-RECORDINGS-SCENES and AGREE-STEM-LANES.

## 6. Commands (for A step 6 and C3)
Capture the e-mail the action sends from a tree whose root is `$ROOT`, into `$OUT.html`. `$ROOT` is the store, or for HEAD a `git clone --shared` of the store checked out at `cce5eda` with a `node_modules` symlink to the store's. Do not use `git worktree`, which writes into the store's `.git`.

```bash
cd $ROOT && STORE_ROOT=$ROOT npx vite-node --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-447/probe/vn.config.mjs \
  /home/runner/czaba-project/tmp/studio-real-loop/b-round-447/probe/capture-hire-us-email.ts $OUT.html
```

Measure it in Chromium on a light and a dark client, writing JSON and screenshots:

```bash
STORE_ROOT=/home/runner/czaba-project/store node <copy of probe/email-contrast.cjs> $OUT.html $OUT.json $OUT-shot
```

- **Claims at planning:** `b-round-447/claims-448-planning-output.txt`.
- **Claims on the sketch:** `b-round-447/claims-448-sketch-output.txt` (`STORE_ROOT=/tmp/b448-scratch`).
- **Advisor follow-up (after the first hand-off check):**
  - `/hire-us` page probe on dev servers, HEAD `:5178` vs sketch `:5179`: 0 px both ways at 3 viewports, the same empty and filled submit results (`probe/hire-us-page-sketch.json`, K26).
  - v2 structure diff saved (K27).
  - Lint and check on v2: rc 0, 205 warnings = HEAD.
  - `git apply --check` rc 0.
  - A repo-wide `git grep` for `sendOrderPaidEmail` and `email.server` finds only `docs/technical/future/stripe-migration-guide.md` and the teal test: no live importer.
  - **`sketch-server.sh` patch mode is a silent no-op inside the loop's git repo.** The served copy lives under the loop folder, which is the `czaba-studio-loop` checkout, so `git apply` resolves paths against that repo and skips the patch. B served the sketch with `patch -p1` instead. Recorded as B-R447-SKETCH-SERVER-PATCH-SILENT. Rounds 446 and 447 used only `none` mode for C.
  - The superseded v1 task draft is `b-round-447/task-draft-v1-SUPERSEDED.md`.

## Artifacts
In `b-round-447/`:
- **Task inputs:** `grants-448.txt`, `covering-448.txt`, `claims-448.sh` (K1–K24) and its outputs.
- **Sketch and review:** `sketch-448.patch.txt`, `sketch-review.md`.
- **Mutants:** `run-mutants.sh`, `mutant-M1..M10.log`.
- **Pre-check:** `precheck-*.log`.
- **Probes:** `probe/`.
- **Updates:** `update-backlog.py`, `update-feature-status.py`.
- **Backups:** `backlog-before-448.json`, `feature-status-before-448.md`, `b-next-before-448.json`, `current-task-before-448.md`.
