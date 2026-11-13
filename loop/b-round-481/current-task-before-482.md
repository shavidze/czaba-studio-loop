# Round 481: B-R478-DEAD-MUSIC-LINK. The "Browse Music" button on the empty My Orders page leads to the 404 page; it should go to the Store catalogue (account.orders half)

**Planned by:** B, at the round 480 → 481 planning on 2026-11-12 (`b-round-480.md`, `b-round-480/checkpoint.md`).
- **Advisor:** available. Consulted twice: after orientation, and for a closing check before hand-off. The closing check added the saved HEAD style baseline for C4, the LeadMagnet seed, the C3 scratch recipe, the C7 fallback and the root-commit note.
- **Consult:** `tech-lead` reviewed the sketch and gave APPROVE (`b-round-480/sketch-review.md`).
- **Archive:** the round-480 task is `tasks/round-480.md`, a byte-identical copy (`cmp`).
- **Regression is not due yet.** `date -u` said 2026-11-12T23:14Z, and `regression-last.json` says 2026-11-10 (2 days ago). REGRESSION-2026-11-13 is round 482 (D-29z1709).

**What this round is:** a one-line fix that closes the user-visible half of an open Medium finding. A signed-in buyer with no orders sees "No orders yet" and a brass **Browse Music** button. Today that button opens `/music`. No route matches that path, so the 404 page "Lost in the Sound" appears. After this round the button opens `/store`, the catalogue. The button's look, its text and the page are unchanged.

## Decisions (`backlog.json` v470, `decisions_log_b`)
- **D-29z1708: round 480 accepted.** C PASS, 0 bugs, browser-verified. Gate 480 was skipped because nothing changed, so HEAD stays `bbb3193`. C's three notes are ruled as accepted.
- **D-29z1709: order.**
  - **481:** this task. It meets the finding's L46 deadline.
  - **482:** REGRESSION-2026-11-13.
  - **483:** CLIENT-NAV-CONTRACT (GATE479-M1; ruling D-29z1704 is unchanged).
  - **484:** B-R480-ORDER-CARD-KEYBOARD.
  - **Then:** DPG-BUTTON-CLEANUP.
- **D-29z1710: scope.** Only the `href` changes, from `/music` to `/store`:
  - The label stays "Browse Music". Saba was told in `user-review/questions-round-478.md` Q2 that the target becomes `/store`, and no category filter is invented.
  - The element stays a plain `<a>`, so it does a full document load. A Remix `<Link>` would add one more client navigation that screen readers do not announce (GATE479-M1). The protected `account.downloads.tsx` half goes to root as ROOT-REQ-DOWNLOADS-MUSIC-LINK, so the finding stays **open** after this round.
- **D-29z1711: new findings from B's pre-check.** None of them is part of this round.
  - **B-R480-ORDER-CARD-KEYBOARD** (Medium): the order cards on this page open only on a mouse click on a `<div>`. It is scheduled for round 484.
  - **B-R480-SITEMAP-COLLECTIONS-MUSIC** (Low): deferred.
  - **SIG-R480-E2E-STALE-MUSIC-NAV:** a signal only.

## Reference: how the reference does it
This is a Store navigation fix, so there is no Ableton reference. The reference is the Store's own behaviour, measured by B in Chromium at both viewports with the L36 stub path (`b-round-480/probe/orders-probe.mjs`):
- **HEAD:** `orders-probe-head.json` and `orders-empty-head-*.png`.
- **Sketch** on a scratch dev server at :5174: `orders-probe-sketch.json` and `orders-empty-sketch-*.png`.

| Point | Source | Confirmed behaviour | After this round | C row |
|---|---|---|---|---|
| Empty-state CTA target | HEAD probe | Enter on "Browse Music" goes to `/music`. The title is "404 - Page Not Found \| CZABA" and the h1 is "Lost in the Sound" | `/store`, with title "Store \| CZABA - Cinematic Sound Collections" and h1 "Curated Sound Collections" | C4 |
| Navigation kind | HEAD probe (`markerAfter: null`) | A full document load: the `window` marker is gone after it | Unchanged: a full load | C4 |
| Focus after it | HEAD and sketch probe (`firstTab`) | The first Tab after the load focuses the header logo `a[href="/"]` "CZABA" | Unchanged | C4 |
| Signed-out guard | HEAD probe, no stubs | `/account/orders` shows "Sign in required" and 0 "Browse Music" links | Unchanged | C5 |

**Deviations:** none. The label is kept on purpose (D-29z1710).

## Rules
- **Read `lessons.md` first**, especially:
  - L10 / L11 (STOP);
  - L12 (no class selectors in tests);
  - L29 (claims);
  - L36 (stubbed client path);
  - L47 (first-Tab row);
  - L52 / L58 (asserts must be able to fail);
  - L57 (C's JSON fields).
- **Claims (L29):** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-480/claims-481.sh`. B's output:
  - at HEAD: `b-round-480/claims-481-planning-output.txt` (stderr empty);
  - on the sketch: `claims-481-sketch-output.txt`.
- **Sketch (L58):**
  - The patch is `b-round-480/sketch-481.patch.txt`, sha256 `8e1b7b6d72575086b7b7f2460c2f008630cfe32375f27865b5ef30a38d0f1362`. It was reviewed in `b-round-480/sketch-review.md` (APPROVE).
  - On a scratch copy, B got: Biome rc 0, `tsc` rc 0 (`sketch-tsc.log`), and AO1–AO2 2/2 passing (`sketch-vitest-final.log`).
  - Two mutants turn the tests red:
    - **M1** sets the href back to `/music`: AO1 and AO2 fail on asserts (`mutant-M1-music-href.log`);
    - **M2** converts the element to `<Link>`: red, but only through a "useHref outside Router" crash (`mutant-M2-router-link.log`). So AO1's `data-discover` assert is a belt and not a proven branch. The test title does not claim it.
- **Screen budget (L39):** nothing new is visible. No text, class or element is added.
- **Primitives:**
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` for the test;
  - `GEORGIAN_DOCS.md` for doc 312;
  - `API_ERROR_HANDLING.md` (read only; the route's fetch code is unchanged).
- **Protected files:** `b-round-318/protected-sha256.txt` (11 files, including `account.downloads.tsx`) must stay rc 0. Never touch them.

## Baseline
- **HEAD `bbb3193`.** Gate 479 published it. Gate 480 was skipped with no change. The tree is clean [claims K1, K7: 0 lines].
- **Frozen files:** `b-round-480/r481-frozen-sha256.txt` lists all 1,390 tracked files except `app/routes/account.orders.tsx` [K8: rc 0]. The protected list is rc 0 [K9].

### Grants (exactly these 3 paths)
| Path | What |
|---|---|
| `app/routes/account.orders.tsx` | Line 230: `href="/music"` becomes `href="/store"`. Nothing else changes: it stays `<a>`, and the label, classes, imports and the Biome warnings at l.59 and l.188 are untouched (they belong to round 484) |
| `app/lib/__tests__/account-orders-empty-state.test.tsx` (new) | AO1 and AO2, exactly as in the sketch |
| `docs/implementation/2026/quarter-IV/312-dead-music-link-orders.md` (new) | Use the `docs/implementation/TEMPLATE.md` headings, in order. Line 4 is exactly `**სტატუსი:** Completed (C round 481 PASS)`. Name D-29z1709…D-29z1711 and ROOT-REQ-DOWNLOADS-MUSIC-LINK. Cite only the test ids that exist (AO1, AO2; L26). Say that the finding stays open for the protected half |

Everything else stays unchanged. In particular: `account.downloads.tsx` (protected), `sitemap[.]xml.tsx`, `app/lib/constants.ts`, `e2e/**`, `app/root.tsx`, `app/styles/**` and `.claude/**`.

## 1. A: steps
1. **STOP (L11)** if `claims-481.sh` K1–K11 differ from `b-round-480/claims-481-planning-output.txt` before your first edit. **Exception:** if root's job applied a root commit before the round (`cloud/root-commits/`) that touches only `.claude/**` or `docs/**`, then K1 shows the new HEAD and K8 may fail on those files only. That is not a STOP. Record the commit and the files in `a-round-481.md`; C applies the same exception in C1/C2. At planning, the one pending patch (`0001-primitive-add-file-size-limits…`, `.claude/primitives/REACT_CONTEXT.md`) failed `git apply --check`.
2. **Apply the sketch:** `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-480/sketch-481.patch.txt`. Then write doc 312.
3. **Checks:**
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run app/lib/__tests__/account-orders-empty-state.test.tsx`.

   The expected result is 1 file and 2 tests, all passing. The full suite belongs to the gate.
4. **Claims:** run the script into `a-round-481/claims.txt`. After the change, expect:
   - K2: `href-music 0 href-store 1 browse-music-label 1 router-Link 0`;
   - K5: `exists AO1 AO2`;
   - K7: exactly the 3 granted paths;
   - K8 and K9: rc 0;
   - K10: `0`.
5. **Code review:** 3 files, so run code-reviewer once. Report findings of Medium and above. An unruled Medium is a STOP (L10). A Low on the pre-existing l.59 / l.188 warnings is out of scope (round 484).
6. **Report** in `a-round-481.md`.

## 2. C: what to verify
Write `c-round-481.md`, `c-round-481.json` and `c-round-481/progress.json` as you go (L59).
- The JSON carries every L57 field. `mutantRedOnSketch` = `b-round-480/mutant-M1-music-href.log`.
- Each bug has an enum `origin`.
- Before hand-off, run `python3 -I tools/l57-check.py c-round-481.json c-round-481/l57-check.txt` (rc 0).

**Browser setup.**
- Start from B's probe; it is a starting point, not evidence.
- The signed-in path is a **stubbed client path (L36, `C4-STUBBED-1`)**:
  - seed `localStorage.auth_user` with an `accessToken`;
  - `page.route` `**/api/auth/profile` → 200 profile;
  - `**/api/downloads**` → 200 `[]`, without which the purchases fetch logs the session out;
  - `**/api/orders/my**` → 200 empty page.
- It proves the client path only. Ownership of real orders is backend-only and stays BLOCKED (backend unavailable in cloud).
- Seed LeadMagnet as dismissed and submitted in every context, as in round 479: `ctx.addInitScript(() => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); })`. `/account/*` is not on the popup's excluded list (`app/hooks/useLeadMagnet.ts` `isLeadMagnetExcludedPath`), so without the seed the popup can open during a slow Tab sequence.
- Wait for "No orders yet" before acting. On a fresh dev server, warm the route once first (B's first sketch run timed out on cold optimisation).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all`, and from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-480/r481-frozen-sha256.txt` and the protected list | Exactly the 3 granted paths, with both checks rc 0 |
| C2 | CLAIMS | `bash b-round-480/claims-481.sh` | The post-change values of A step 4, 0 `MISSING`, and K1 `bbb3193` |
| C3 | TESTS MEAN SOMETHING | Run the AO file on the tree. Then, on your own scratch copy under `c-round-481/` (not `store/`), apply M1 (`href="/music"`) and rerun. Make the copy the way B did: `store/` minus `.git`, `docs`, `public` and `node_modules` (tar with excludes), then symlink `node_modules` and `public` back to `store/`'s, so the vitest config resolves | 2/2 pass on the tree, and M1 gives 2 failed on asserts, not a crash. The real tree is green again |
| C4 | BROWSER: CTA LANDS ON THE STORE (`C4-STUBBED-1`) | At 1440×900 and 1280×720, signed in through the stubs with an empty order list: screenshot the empty state, set `window.__probeMarker`, focus "Browse Music" with **Tab** (not `.focus()`), check that it has a visible focus ring (`:focus-visible` true; computed outline equal to HEAD's), press **Enter**, and wait for the load. Then press Tab once | The `href` is `/store`; the URL path is `/store`; the title is "Store \| CZABA - Cinematic Sound Collections"; the h1 is "Curated Sound Collections"; the marker is gone (full load). The first Tab focuses the header logo `a[href="/"]` (L47). The button's computed values equal B's saved HEAD baseline `b-round-480/probe/ring-probe-head.json` (run C's copy of `ring-probe.mjs`): background `rgb(201, 164, 106)`, colour `rgb(14, 13, 12)`, `500 16px`, radius `12px`, box 151×50 at y 727 (x 645 at 1440, 565 at 1280; ±1 px); focus outline `solid 1px` brass at 0.8 alpha, offset 2px; 0 open dialogs. The Tab count to reach the button (12 at both viewports on HEAD) is a record, not a pin. **Control:** B's HEAD run landed on the 404 "Lost in the Sound" |
| C5 | BROWSER: GUARD UNCHANGED | Fresh context, no stubs, both viewports: `/account/orders` | "Sign in required" and 0 "Browse Music" links |
| C6 | AUTH + STUDIO OPENS | `/studio/middle-east` anonymously; `/api/studio-token?product=middle-east&file=x` with no bearer; `/studio-lab` in a fresh context, both viewports | "Sign in required" with 0 audio `src`; 401; `/studio-lab` opens as the demo with the timeline visible. The real-owner path is BLOCKED (backend unavailable in cloud) |
| C7 | PROTECTED HALF STILL OPEN (record) | The stubbed `/account/downloads` with an empty list (same stubs) | Record the empty-state link target. `/music` is expected (protected file; ROOT-REQ-DOWNLOADS-MUSIC-LINK). B did not run this row; if the empty state does not render under these stubs, record what renders instead. **Not a FAIL either way** |
| C8 | DOC 312 | Headings, line 4, D-IDs and test ids | TEMPLATE headings in order; line 4 exact; it names D-29z1709…D-29z1711 and ROOT-REQ-DOWNLOADS-MUSIC-LINK; every test id it cites exists (grep) |
| gate | — | Full verify, code review, publish | Root's job; C does not claim it |

**What could break nearby:**
- the signed-in orders fetch, if the test's mocks leak (C3);
- the guard (C5);
- the button's look, if A touches more than the `href` (C4 box, C1).

## 3. After this round
1. **On C PASS:**
   - the `account.orders` half of B-R478-DEAD-MUSIC-LINK is C-verified;
   - the finding stays open (status: awaiting ROOT-REQ-DOWNLOADS-MUSIC-LINK);
   - root may publish.
2. **Next planning:**
   1. REGRESSION-2026-11-13 (round 482, due), with every `scope_additions` entry (L6);
   2. CLIENT-NAV-CONTRACT (round 483);
   3. B-R480-ORDER-CARD-KEYBOARD (round 484);
   4. DPG-BUTTON-CLEANUP.
3. **Root, non-blocking:**
   - ROOT-REQ-DOWNLOADS-MUSIC-LINK;
   - the DP-gate re-run after P0;
   - ROOT-REQ-DPG-PRIMITIVES-PATCH.
4. **Saba:** `user-review/questions-retro-480.md` Q1–Q7 and `questions-round-478.md` Q1 (the licence page).
