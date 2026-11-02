# Round 302: NAME-AND-HINT-a. One product name, "CZABA Studio" (Saba Q4)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-02 · Decisions: **D-29z781 … D-29z787** (`backlog.json` → `decisions_log_b`, `rounds[302]`, `post_current_stage_queue[6]` stage `NAME-AND-HINT-a`).

**Owner:** A. **Verifier:** C. **Grants:** §5 (12 paths: 10 changed, 2 new).

## Baseline: HEAD `aa7a6ef` [K1], clean tree [K2]
- `gates/gate-round-301.json` is `skipped` ("no real changes", head `aa7a6ef`). The last published commit is gate 300's `aa7a6ef…`, on both remotes. That is the baseline.
- The 7 protected files have no diff [K3]: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- **Frozen list:** `b-round-301-r302-tree-sha256.txt`, 1,170 entries hashed from `git ls-files` at HEAD; `sha256sum -c` gives 0 failures [K4].
- **Claims:** `b-round-301/claims-302.sh` → `b-round-301/claims-302-output.txt` (at HEAD) and `b-round-301/claims-302-after-sketch.txt` (K5–K10 on B's scratch, which is what HEAD + §5 must give).
- **L29 grep note:** the untagged hits of C's L29 grep in this task are acceptance expectations, microcopy, new-file names or grant descriptions (what the code will be), not facts about current code. `docs/technical/studio-real-workspace/…` in §0 is the project-level docs folder, not a file under `store/`.

## 0. Read first
- `lessons.md` in full. Directly relevant: L3 (text change → widest-state box rows), L5 (Biome line width), L23 (collisions, scratch pre-check, repo-scan red proof), L26/L28 (implementation doc), L29 (claims), L39 (screen budget), L54 (journey row), L56 (artifacts exist).
- Saba's decision: `docs/technical/studio-real-workspace/agent-workflow.md`, section "Whole-product design review: Saba's decisions and new tasks (2026-10-31)", item **Q4 / F6**; the review itself is `product-design-review-2026-10-31.md` §F6 and §Q4.
- B's reasoning: `b-round-301.md`. The previous task (round 301, REGRESSION) is archived as `tasks/round-301.md`.

## 1. What changes, and why
Saba (Q4): **one name, "CZABA Studio", everywhere.** The nav says "Studio". "Personal Mixdown Studio" and "Studio Lab · Workspace" go. The badge carries the demo status, not the name.

Today the user meets three names:
- the nav says "Studio" [K12];
- the home showcase says "Personal Mixdown Studio" (heading and mockup window title) [K5];
- the Studio says "CZABA Studio Lab · Workspace" in its h1 [K5][K8], and the tab title is "Studio Lab — Demo workspace | CZABA" [K5];
- after purchase, checkout success says "Access your Personal Mixdown Studio anytime" [K5].

This round (stage a of 2) renames those places. **Stage b (Q5, the one-time "Drag a clip by its name bar to move it" hint) is round 303.** It is scheduled, not deferred (D-29z785).

| Place | Now | After |
|---|---|---|
| `/studio-lab` `<title>` | `Studio Lab — Demo workspace \| CZABA` [K5] | `CZABA Studio — Demo collection` |
| Studio h1 (demo) | `CZABA Studio Lab` + muted span `· Workspace` [K5][K8] | `CZABA Studio`; the span and `headingSuffix` are removed |
| Studio h1 (purchased origin) | `CZABA Studio` + `· Workspace` | `CZABA Studio` (same as demo; the badge "Purchased collection" tells them apart) |
| Studio header badge | `Demo collection — no sign-in required` | unchanged |
| Home showcase h2 | `Personal Mixdown <glow>Studio</glow>` [K5] | `CZABA <glow>Studio</glow>` (the glow stays on "Studio") |
| Home mockup window title | `Personal Mixdown Studio` [K5] | `CZABA Studio` |
| Checkout success, 3rd step | `Access your Personal Mixdown Studio anytime` [K5] | `Access CZABA Studio anytime` |
| Nav (desktop and mobile) | `Studio` [K12] | unchanged |
| Narrow-screen share title | `CZABA Studio` [K15] | unchanged |

**Not changed this round** (each with its ruling in §2.3): the URL `/studio-lab`, the export filename stem `czaba-studio-lab` [K7], the testimonial quote [K13], docs [K16], the protected legacy routes, and the stale e2e badge expectation [K14].

## 2. Reference, product-designer framing and rulings

### 2.1 Reference
- **Ableton:** no reference found. B searched for Live 12's window title or product-name convention ("Ableton Live 12 manual window title bar Set name") and found no manual section on it. B claims no Live convention. The name is Saba's Q4 decision, not behaviour taken from Live.
- **Store side:** `product-design-review-2026-10-31.md` §F6 (one product, three names, "Lab" reads as unfinished).
- This is a copy round with no new behaviour, so it has no Ableton parity rows.

### 2.2 product-designer framing (consulted at planning)
- **Chosen:**
  - **Title `CZABA Studio — Demo collection`.** The one name comes first, and the demo part reuses the badge's words. "| CZABA" would repeat the brand.
  - **h1 `CZABA Studio`.** Remove the suffix completely: "Workspace" is a second name.
  - **Glow on "Studio".** The emphasis stays where it is now, on the word the nav uses.
  - **Checkout `Access CZABA Studio anytime`.** It renames only; the promise is unchanged.
- **Rejected:**
  - `CZABA Studio | CZABA` (repeats the brand).
  - Keeping `· Workspace` (a second name).
  - Rewording the checkout promise (out of scope).
- **product-designer's states checklist** became §3.2 rows N-TITLE-H1, N-HOME, N-CHECKOUT, N-EXPORT-NAME and N-RETIRED-TEXT. Its "purchased workspace" state has no browser path (SRW-21 is `deferred_user`), so it is the unit rows PW1/PW6.

### 2.3 Deviations and B's rulings
- **Export filename stem stays `czaba-studio-lab`** [K7]. This deviates from product-designer, who proposed `czaba-studio-demo`.
  - Reason: Q4 lists the nav, `<title>`, header and home copy. A download filename and the route URL are external contracts: users' media bins, and the perf liveness row in `perf/studio-lab-resources.perf.spec.ts` [K7].
  - B does not choose this for Saba. It is asked once as **SABA-Q-NAME-LAB-URL-FILE** (L44).
- **The testimonial quote ("The Mixdown Studio") stays verbatim** [K13]. It is on the keep-list, and these are a customer's words. Asked once as **SABA-Q-NAME-TESTIMONIAL**; the recommended default is to keep it.
- **Protected legacy files** (`account.downloads.tsx` "Open in Studio" / "Studio", `studio.$productId.tsx` "…in Studio.") already say "Studio" [K21] and are not edited.
- **Docs** (8 files under `docs/technical/**` and `CLAUDE.md` [K16]) are not UI. They are recorded as B-R301-DOCS-OLD-NAME. The `CLAUDE.md` tagline is a proposal "For Saba" at RETRO 305; this round does not edit it.
- **`e2e/store-page.spec.ts` "Personal Studio Included"** [K14] is a stale expectation: 0 app sources render it. It is recorded as B-R301-E2E-STALE-PERSONAL-STUDIO and not edited (the full e2e is not a gate row).
- **"Custom Mixdown"** (a feature card title in the showcase) and the FAQ's "Studio feature" describe features, not the product name. Both stay.

## 3. Acceptance rows (C)

### 3.1 Unit (A runs them, C re-runs them)
- **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-301/covering-files.txt)`, 24 files. B's runs on the sketch: 18/18 files and 317/317 tests (`b-round-301/sketch-covering-run.log`), plus the 6 colour files, 44/44 (`b-round-301/sketch-colour-ui-run.log`). Total 24 files, 361 tests.
- **New file `app/lib/__tests__/studio-naming.test.tsx`:**
  - **NM1 (repo scan):** no `.ts`/`.tsx` file under `app/` outside `__tests__` contains `Personal Mixdown|Studio Lab|Lab · Workspace|Demo workspace|headingSuffix`. Comments count too.
  - **NM2:** the rendered `StudioShowcase` h2 text is exactly `CZABA Studio`; its glow span is `Studio`; the mockup title `CZABA Studio` is present; no retired name appears in the rendered text.
- **Updated rows:**
  - `strings.test.ts`: the title literal, and the `studioWorkspaceStrings` key list without `headingSuffix`.
  - `collection.test.ts` PC9: demo heading `CZABA Studio`.
  - `purchased-collection-ui.test.tsx` PW1/PW6: both headings are exactly `CZABA Studio`, and the badges still differ.
- **Red proof** (L23; B's runs are on the scratch): see the mutants in §6, item 4.

### 3.2 Browser rows
Run every row at 1440×900 and 1280×720 unless stated. Store pages use the mock API from the loop folder (`mock-api/server.mjs` on 127.0.0.1:5199): record its PID and stop only that PID. Mock data proves the client path only.

| Row | Action | Expected |
|---|---|---|
| N-TITLE-H1 | Open `/studio-lab` and wait for `Demo collection ready` | <ul><li>`document.title` is `CZABA Studio — Demo collection`.</li><li>The header `h1` `textContent` is exactly `CZABA Studio`, it has 0 element children, and its accessible name (CDP) is `CZABA Studio`.</li><li>The badge still reads `Demo collection — no sign-in required`.</li><li>The h1 renders on one line (box height ≤ its computed line-height + 1 px).</li><li>The header does not wrap: the h1, the `arrangement-exit` link and the badge share one row (tops ±1 px), with 0 overlaps between their boxes.</li></ul> |
| N-RETIRED-TEXT | Collect the body `innerText`, every accessible name (CDP AX tree) and `document.title` in these states: <ul><li>`/studio-lab` empty;</li><li>after Enter adds a clip;</li><li>with the `?` sheet open;</li><li>with the Export dialog open;</li><li>`/` scrolled to the showcase;</li><li>`/checkout/success`;</li><li>`/products/middle-east` (mock).</li></ul> | 0 matches of `Personal Mixdown\|Studio Lab\|· Workspace\|Demo workspace` in any state. The testimonial "The Mixdown Studio" does not match the pattern and is expected to stay. |
| N-HOME | On `/` at 1440×900, 1280×720 and 390×844, scroll to the showcase. Repeat once at 1440 with `prefers-reduced-motion: reduce`. | <ul><li>The h2 reads `CZABA Studio`, and its glow span is `Studio`.</li><li>The mockup title reads `CZABA Studio`.</li><li>The h2 does not overflow its container (`scrollWidth ≤ clientWidth`).</li><li>The h2 has at most as many lines as before: the old text was longer, so it is ≤ 2 lines at 390 and 1 line at 1280 and 1440.</li><li>0 page errors other than the known cloud noise.</li></ul> |
| N-CHECKOUT | `/checkout/success` (no loader and no parent layout route [K10]); wait ≥ 1.5 s | <ul><li>The steps list shows `Access CZABA Studio anytime`, with no overflow.</li><li>The other two steps are unchanged.</li><li>0 page errors other than the known noise.</li></ul> |
| N-NAV | `/` desktop nav at 1440; the mobile menu at 390 | <ul><li>The link text is `Studio`, with `href="/studio-lab"` [K12].</li><li>Unchanged.</li></ul> |
| N-NARROW | `/studio-lab` at 390×844 | <ul><li>The narrow screen shows (no workspace).</li><li>`document.title` is the new title.</li><li>0 page errors.</li></ul> |
| N-EXPORT-NAME | Add a clip and export WAV (1440 only) | The download is named `czaba-studio-lab.wav` (ruling §2.3; unchanged). |
| N-JOURNEY (L54) | One run per viewport, with a screenshot at each step: <ol><li>`/` showcase;</li><li>nav "Studio";</li><li>the Studio title and h1;</li><li>Enter adds a clip, then Space plays ≥ 1 s (the clock advances) and Stop;</li><li>Export WAV completes (filename as N-EXPORT-NAME);</li><li>`← CZABA` returns to `/`.</li></ol> | Every step completes. The names seen are "Studio" (nav) and "CZABA Studio" (home heading, mockup, tab title, h1), and nothing else. |
| N-SCREEN-BUDGET (L39) | Full-window screenshots of `/studio-lab`, empty and with a demo clip, at both viewports; count the persistent text lines outside the timeline content, with the same method as round 300's B-SCREEN-BUDGET | <ul><li>Baseline: round 300's B-SCREEN-BUDGET counted this same tree (`aa7a6ef`): **96 lines at 1440×900 and 79 at 1280×720** (`c-round-300.md`, `c-round-300/budget.json`). Use the same state and method.</li><li>Expected after: 96 / 79 (equal). Only the `· Workspace` token disappears; it shares the h1's line.</li><li>Any increase is a finding (L39).</li></ul> |

### 3.3 Other C rows
- **SOURCE-SCOPE:**
  - `git status --short --untracked-files=all` shows exactly the 12 §5 paths.
  - `sha256sum -c b-round-301-r302-tree-sha256.txt` fails only on the 10 modified paths.
  - Each of the 11 code and test grants is `cmp`-equal to its `b-round-301/sketch-<basename>.txt`.
  - The protected files have no diff (`git diff --quiet` rc 0).
- **CLAIMS:**
  - Re-run `b-round-301/claims-302.sh`.
  - K1, K3, K7, K10–K16 and K19–K21 must equal `claims-302-output.txt`.
  - K5–K9 must equal `claims-302-after-sketch.txt`: K5 empty; K6 only `store-header-footer.test.tsx:121` and the new NM regex line; K9 = 4.
  - K2 = 12, and K4 failures = 10.
  - K17 = "221 is the last", and K18 lists docs 212, 213 **and 221** (A's new doc, l.4 `In Progress (stage 1 of 2 …)`).
  - K20: every artifact `ok`.
- **DOC:** `docs/implementation/2026/quarter-IV/221-name-and-hint.md` exists.
  - Its `## ` headings contain TEMPLATE's seven headings in order (L26).
  - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 302 PASS)` (L28: multi-stage feature).
  - Every test row it cites exists (NM1, NM2, PW1, PW6, PC9).
- **RV-EN:** 0 Georgian characters in visible text or accessible names on `/studio-lab` (round 301's rule, no ledger).
- **G302-AUTH** (short, as round 301 G301-AUTH):
  - `/studio-lab` anonymous shows the workspace and the demo badge, and `auth_user` is null.
  - `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`.
  - `GET /api/studio-token?product=middle-east&file=mix.wav` with no header → 401. Never 200, and no token in any body.
- **BLOCKED** (backend unavailable in cloud): the purchased workspace heading in a browser (SRW-21 `deferred_user`; covered by unit PW1). List it under `blocked`; it does not make `browserVerified` false.
- **Gate rows, not claimed by C:** full vitest, build, `npm run verify`.

## 4. Rulings for A and C

### 4.1 One element, one rule (L4)
- **Studio h1:** this task's text wins over any "header unchanged" reading. The header row keeps its layout (N-TITLE-H1), and its text changes.
- **Home h2:** "the glow stays on Studio" wins over any reflow concern. It may get shorter, never longer.
- **Testimonial:** the keep-list wins over NM1. NM1's pattern does not match "The Mixdown Studio" [K13], so there is no conflict.

### 4.2 L23 collisions found on the sketch
- The tests that pin the old strings are all granted [K6]:
  - `strings.test.ts` l.1779, l.1856 and l.2264 [K6];
  - `collection.test.ts` l.377 [K6];
  - `purchased-collection-ui.test.tsx` l.31 and l.38 [K6].
- `store-header-footer.test.tsx` l.121 [K6] asserts that "Studio Lab" is **absent** from the header, and it stays green.
- **The removed span's classes** (`font-normal text-muted`): the 6 `*colour-ui.test.tsx` files that render the workspace were run on the sketch, 6/6 files and 44/44 tests (`b-round-301/sketch-colour-ui-run.log`). They are in the covering set.
- **Repo-scan tests** (they read the tree) were run on the sketch: `store-focus-ring`, `store-theme-tokens`, `third-party-licenses`, `panel-radius-ui`, `studio-focus-ring`, `studio-theme-obsidian` and `timeline-cursor-map`. All are green. They are in the covering set.
- **Perf and e2e roots:** 0 hits of the retired names in `perf/**` and `e2e/**` [K5][K6]. `perf/**` pins only `czaba-studio-lab`, which stays [K7].
- **Biome:** the mockup span collapses to one line, which Biome's formatter requires. The sketch is already in that form; see `b-round-301/sketch-biome-final.log` (0 errors).
  - `checkout.success.tsx` has 2 pre-existing `noArrayIndexKey` warnings at HEAD [K11]. A must not touch them, and C does not report them.
  - The lint total at HEAD is 205 warnings [K19], and stays 205 after the change.

### 4.3 L50, L49 and L51
- **L50:** no focus moves, and no focused element can unmount. The h1, the h2 and the list item are not focusable. Out of scope, with no rows.
- **L49:** no call is replaced. `studioWorkspaceStrings` keeps its other 4 uses [K9].
- **L51:** no status write is added or moved.

## 5. Grants
A edits only these 12 paths. The 11 code and test paths must each equal their sketch byte for byte (`b-round-301/sketch-<basename>.txt`).
1. `app/routes/studio-lab.tsx`: the meta title.
2. `app/lib/arrangement/collection.ts`: the demo `heading`.
3. `app/lib/arrangement/strings.ts`: remove `headingSuffix`.
4. `app/components/arrangement/StudioWorkspace.tsx`: the h1 renders the heading only; the suffix span is removed.
5. `app/components/home/StudioShowcase.tsx`: the h2 and the JSDoc line.
6. `app/components/home/StudioMockup.tsx`: the window title (one line) and the JSDoc line.
7. `app/routes/checkout.success.tsx`: the third `STEPS` string only.
8. `app/lib/arrangement/__tests__/strings.test.ts`
9. `app/lib/arrangement/__tests__/collection.test.ts`
10. `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx`
11. `app/lib/__tests__/studio-naming.test.tsx` (**new**)
12. `docs/implementation/2026/quarter-IV/221-name-and-hint.md` (**new**). It is in Georgian, follows TEMPLATE, and has l.4 as in §3.3. The last number is 220 [K17]. Mention that stage b (Q5) follows, and list the two Saba questions.

Nothing else is granted: no `package.json`, config, context, perf, e2e, docs/technical or protected file. The other `In Progress (stage` docs, 212 and 213 [K18], belong to the open PERF-3 stage and are not touched.

## 6. A's checks (speed rules)
1. Run `bash ../tmp/studio-real-loop/b-round-301/claims-302.sh` before editing. K1–K21 must equal `claims-302-output.txt`.
2. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-301/covering-files.txt)`, run **alone** (L38). Expect 24 files and 361 tests. Report any test above 50 % of its timeout. The slowest files on the sketch were `drag-feedback-colour-ui` at 5.1 s and `library-row-strings-ui` at 4.6 s.
3. Run `npm run typecheck` and `npm run lint`. Lint must show 205 warnings, with none new in a granted file. The 2 in `checkout.success.tsx` are pre-existing [K11].
4. **Mutants** on A's own scratch (a copy of HEAD plus the 12 files, with its own `cacheDir`). Write the logs under `a-round-302/`.

   | Mutant | Change | Red rows (B's run: `b-round-301/mutant-*.log`) |
   |---|---|---|
   | m1 | mockup title back to `Personal Mixdown Studio` | NM1, NM2 (B: mutant-a) |
   | m2 | checkout step back to the old text | NM1 (B: mutant-c) |
   | m3 | glow on `CZABA` instead of `Studio` | NM2 (B: mutant-g) |
   | m4 | restore `headingSuffix: '· Workspace'` and the h1 span | NM1, ST31 (the `strings.test.ts` key list), PW1, PW6 (B: mutant-m4) |
5. A **code-reviewer** is required (12 paths). Pass its findings to B. Do not act on them, because every code grant is byte-equal to the sketch. A Medium+ regression is a STOP (L11).
6. Write `a-round-302.md` as you go.

## 7. Risks to neighbouring behaviour (C probes these)
- **The Studio header row:** a shorter h1 could shift the badge. N-TITLE-H1 checks the row.
- **Purchased origin:** both headings are now equal, so only the badge tells the origin. PW1/PW6 assert the badge, and N-TITLE-H1 checks the demo badge.
- **Home showcase reveal:** the hidden-focusables tests (`store-hidden-focusables`, in the covering set) and N-HOME with reduced motion.
- **Export:** the filename is unchanged (N-EXPORT-NAME), so the perf resources liveness row keeps its name.

## 8. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-302.md` and changes nothing else when:
- the claims output before editing differs from `claims-302-output.txt`;
- a covering test fails, or a test is above 50 % of its timeout;
- a grant cannot be byte-equal to its sketch, or a change is needed outside §5;
- `npm run typecheck` fails, or `npm run lint` reports a new finding in a granted file;
- a mutant in §6.4 stays green;
- the reviewer reports a Medium+ regression.

## 9. Next, and the frontend-architect checkpoint
- **Round 303 = NAME-AND-HINT-b (Q5)**, unless C finds a Medium+ here. B's planning for it will include:
  - the product-designer consult;
  - the Live reference section;
  - the L51 clobber list (ready text → `Added …` → hint);
  - the lifetime ruling. The smallest honest reading is once per page load; persistence is asked to Saba as a question.
  - the L39 status-line-only row.
- **Then:** PERF-3c and STUDIO-PERFORMANCE. RETRO is at round 305.
- **The checkpoint request** at the STUDIO-LINK boundary (`b-round-300.md` §6, ARCH-CHECKPOINT-STUDIO-LINK) is still unanswered. It is non-blocking, and this round touches none of its files.

## 10. Commit readiness
After C PASS and the gate, root publishes the 12 §5 paths. NAME-AND-HINT stays in progress until stage b passes.
