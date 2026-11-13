# Round 486: B-R480-ORDER-CARD-KEYBOARD. My Orders order cards become a keyboard and screen-reader disclosure (APG Accordion: heading > button)

**Planned by:** B, at the round 485 → 486 planning on 2026-11-13 (`b-round-485.md`, `b-round-485/checkpoint.md`).
- **Archive:** the round-485 task is archived as `tasks/round-485.md`, copied byte-equal (`cmp`) from `current-task.md` before this task was written; K16 compares it with B's second copy `b-round-485/current-task-before-486.md` made from that archive (a tamper check, not an independent proof).
- **Advisor:** available and consulted (`b-round-485.md`).
- **Decisions:** D-29z1727 … D-29z1733 (`backlog.json` v478, `decisions_log_b`).

## Read first
- **`lessons.md` in full.** Directly relevant here:
  - L1: hidden focusables (the hidden panel holds none);
  - L10: one STOP threshold;
  - L23: full suite on the sketch;
  - L29/L56: claims;
  - L36: stubbed rows prove the client path only;
  - L47: focus target named;
  - L52: asserts that can fail;
  - L58: sketch, mutants, review;
  - L59: progress.json;
  - L61: hover/pressed paint.
- **L29 tagging scope:** §1 describes the sketch's contents (future code). It is pinned by K15 (byte equality with `b-round-485/sketch-486/`) and the patch sha256 (K14), not by separate tags. Facts about current code carry `[K#]`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` and the loop policy (speed rules, the 2026-10-23 bug gate, the cloud-runner section).
- **Claims:** run `bash b-round-485/claims-486.sh` (`ROOT=` and `LOOP=` can be overridden). The planning output is `b-round-485/claims-486-planning-output.txt`.
  - C runs it at C-SCOPE start and end. The output must equal the planning output, except for the deltas in `b-round-485/claims-486-sketch-delta.txt`. That delta comes from the script run on B's sketch-applied scratch with a placeholder doc 314 (`claims-486-sketch-output.txt`), not typed by hand (L56).
  - K18 ids may move to the archive, but none may be `NOT-FOUND`.
  - K20 may differ by a mock you start.

## Baseline: HEAD `0341229`, clean tree
- `gates/gate-round-485.json` is `published` at commit `0341229` on both remotes [K21]. Note: its `head` field and `context/head-sha.txt` still say `751e30e`; the commit field and `git rev-parse` are the truth [K1].
- At planning:
  - status empty [K2];
  - tracked tree manifest `b-round-485/r486-tree-sha256.txt`: 1,397 entries, rc 0 [K3];
  - protected files rc 0 [K4].
- A root-only commit after planning that leaves `git diff 0341229 HEAD -- app` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round
- **B-R480-ORDER-CARD-KEYBOARD (Medium, B pre-check, round 480):** on `/account/orders` each order card's header is a `<div>` with a mouse-only click handler [K5]. Keyboard and screen-reader users cannot open a card, so they cannot reach the order items, licence type and prices. Biome flags it (`lint/a11y/useKeyWithClickEvents`) [K6].
- **Reproduced in the browser at HEAD by B** (`b-round-485/probe/head.json`):
  - signed-in stub, two orders, both viewports;
  - a 45-step Tab walk has 0 stops inside any card (`cardStops` is `[]`);
  - after "Orders" in the account nav, focus goes to `<body>` and wraps.
- **This is the oldest open loop-fixable Medium**, so it goes first under the 2026-10-23 bug gate. No Critical or High is open; the other open Mediums are root-only, manual-only, `awaiting_user` or scheduled (`context/active-summary.md`).
- **Previous round:** CLIENT-NAV-CONTRACT (round 485) C PASS, browserVerified true, published `0341229`. The next regression round is due on or after 2026-11-16 [K19].
- **Order after this round:** 487 B-R486-PROFILE-NAME-KEYBOARD (new Medium found by B's full mouse-only sweep, `b-round-485/mouse-only-sweep.txt`: the Profile name `<p onClick>` "Click to add name" in the account layout has no keyboard path) [K22], then DPG-BUTTON-CLEANUP and the rest of DPG P1. If planning happens on or after 2026-11-16, the REGRESSION round comes first. Not in this round (L10: no widening).

## Reference: how others do it
| Point | Reference (source) | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| Structure | WAI-ARIA APG, Accordion pattern (https://www.w3.org/WAI/ARIA/apg/patterns/accordion/, read 2026-11-13; the page shows no update date) | "Each accordion header `button` is wrapped in an element with role heading"; the button is the only element in that heading | `<h3><button type="button">` wraps the whole card header; the header's inner elements become `span`s with the same classes | OC-AX, OC1 |
| State | same | the button has `aria-expanded` true when the panel is visible, else false; `aria-controls` names the panel's id | Same. The panel is always rendered with `hidden` when collapsed, so `aria-controls` always resolves (id from `useId`) | OC-KEYS, OC1–OC3 |
| Keys | same, Keyboard Interaction | Enter or Space on the header expands a collapsed panel; collapsing is allowed when the implementation supports it | Native button: Enter and Space toggle. Each card toggles independently (any number open, as at HEAD) | OC-KEYS, OC-HELD |
| Region role | same | avoid `region` where it proliferates landmarks (about six panels open at once) | No `role="region"`: up to 50 orders load [K11] | OC-AX |
| Project precedent | `app/components/product/ProductAccordion.tsx` | `h2` > `button` with `aria-expanded`/`aria-controls` [K10] | Same pattern, `h3` (the existing card heading level) | — |
| Ableton | not applicable (Store account page) | — | — | — |

No Ableton parity claim. `product-designer` was not consulted: this is a Medium bug fix with no visible change (the policy exempts fix-ups); the screen budget is unchanged (OC-PIXEL).

**Deviation from the project precedent:** ProductAccordion keeps the global 0.98 press scale; the order card does not, because the card header is a whole selectable record (order number) and HEAD had no scale. B measured that the scale makes a drag miss the last character (`probe/x-mutant-select-only.json`: "Order #100").

## 1. What changes (sketch `b-round-485/sketch-486.patch.txt`, sha256 in `b-round-485/sketch-486.sha256`)
A applies the sketch with `git apply b-round-485/sketch-486.patch.txt` from `store/`, then writes the doc (§2). Byte-equal application is the expected result. A may change a sketch line only to fix a Medium+ finding from its own code-reviewer that §4/§5 do not rule; such a change is listed old → new.

1. **`app/routes/account.orders.tsx` (`OrderCard`):**
   - The header becomes `<h3><button type="button" aria-expanded={isExpanded} aria-controls={panelId} onClick=…>`, where `panelId = useId()`.
   - The click handler uses a functional update.
   - The button classes are `block w-full select-text text-left p-4 md:p-6 hover:bg-surface/50 active:transform-none! transition-colors [--focus-offset:-2px]`. `cursor-pointer` goes, because the global `button { cursor:pointer }` gives the same cursor [K7]. There is no radius and no focus class.
   - `select-text` and `active:transform-none!` keep the HEAD mouse behaviour (sketch v2, §4): at HEAD a drag selects "Order #1001" and a press does not scale. A `<button>` blocks the selection, and the global unlayered `button:active` rule scales it to 0.98 [K7]. The important utility beats that unlayered normal rule (measured: `probe/x-sketch.json` `pressedTransform` `none`).
   - Every element inside the button is a `span` with the classes of the element it replaces (`h3` → `span` with `text-lg font-semibold text-foreground`; the text wrapper `div` → `span className="block"`).
   - The panel is `<div id={panelId} hidden={!isExpanded} className="border-t border-outline">` and is always rendered; its body is unchanged.
   - `useId` joins the React import.
2. **`app/lib/__tests__/account-orders-card.test.tsx` (new):** OC1–OC4.
   - OC1: a native `type=button` inside its `h3`, collapsed, controlling a hidden panel; no `role="button"` element.
   - OC2: click shows the item heading, variant, licence, unit price and total inside the panel; a second click hides them.
   - OC3: two cards control distinct panels and toggle independently.
   - OC4: the toggle node and focus survive expand and collapse. This is jsdom: it pins "no remount" only, and real keyboard focus is the browser row OC-KEYS (sketch review L2).
   - Pattern of `account-orders-empty-state.test.tsx` (mocked `useAuth`, `RequireAuth`, `apiClient`).

## 2. A: grants, forbidden, checks
- **Granted paths (only these):**
  - the 2 sketch files (§1; `git apply` creates the test file);
  - `docs/implementation/2026/quarter-IV/314-order-card-keyboard.md` (new; Georgian; `docs/implementation/TEMPLATE.md` sections) [K12].
- **The doc must contain:**
  - l.4 exactly `**სტატუსი:** Completed (C round 486 PASS)` (L28);
  - the seven TEMPLATE `## ` headings in order, after its `## Prompt` section (L26);
  - the APG Accordion reference and why `region` is not used;
  - why the ring is inset (`[--focus-offset:-2px]` inside an `overflow-hidden` card) and why the button has no radius (0-px diff with HEAD at rest, hovered and expanded);
  - that OC4 is jsdom-only, with the browser rows named for keyboard focus;
  - the accepted side effects of §4;
  - a TODO for B-R486-FOCUS-OFFSET-GUARD.
  - It cites only rows that exist (OC1–OC4).
- **Forbidden:**
  - `global_forbidden_files` (including `app/root.tsx`, `app/styles/**`) and `global_forbidden_actions`;
  - the protected files;
  - ProductAccordion.tsx, RequireAuth.tsx, `app/services/**`;
  - commit, push, stash, checkout, deploy;
  - restarting the :5173 dev server.
- **STOP threshold (this is the only statement of it; L10):** STOP and report if you hit any of these:
  - a Medium+ finding (your code-reviewer, or a failing covering test) that §4/§5 do not rule;
  - any need to touch a path outside the grants.
- **A runs:**
  - `npm run typecheck`;
  - `npm run lint`;
  - `npx biome check 'app/routes/account.orders.tsx' 'app/lib/__tests__/account-orders-card.test.tsx'`. Quote the paths. Expected: 1 warning, the pre-existing `noArrayIndexKey` in the loading skeleton [K6 sketch delta];
  - `npx vitest run app/lib/__tests__/account-orders-card.test.tsx app/lib/__tests__/account-orders-empty-state.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-internal-links.test.ts`. B's sketch run: 5 files, 68 tests passed (`b-round-485/sketch-covering.log`; tsc rc 0 in `sketch-tsc.log`). `store-focus-ring` and `store-theme-tokens` scan the route file;
  - the code-reviewer (3 files).
- **A does not run** the full suite. B already ran it on the sketch (`b-round-485/precheck-full.log`: 292 files, 4,263 tests, rc 0), and the gate runs it again.
- **Report in `a-round-486.md`:**
  - start HEAD;
  - `git apply` output;
  - `cmp` of both sketch files against `b-round-485/sketch-486/`;
  - the commands, with their pass counts;
  - the reviewer findings and Architecture note.

## 3. C: rows (both viewports, 1440×900 and 1280×720, unless stated otherwise)
- **Probes** (in `b-round-485/probe/`):
  - `order-card-probe.mjs <base> <out.json> <shotdir> <tag>`: signed-in stub, two orders, LeadMagnet seeded as dismissed (L1); viewports 1440×900, 1280×720 and 375×812 (the header stacks below `md`);
  - `extra-486.mjs <base> <out.json> <shotdir> <tag>`: full-page collapsed/expanded screenshots and boxes, pressed `transform`, double-click and drag selection of "Order #1001", at the same three viewports;
  - `axname.mjs <base> <out.json>`: aria snapshot and CDP AX tree;
  - `pxdiff.mjs <a.png> <b.png> …`: a pixel diff decoded in Chromium;
  - `compare.py <head.json> <sketch.json>`.
- **B's evidence:**
  - HEAD: `probe/head.json`, `probe/x-head.json`, `probe/ax-head.json`, `probe/shots/head-*.png`, taken on :5173 at `0341229`;
  - sketch v2: `probe/sketch.json`, `probe/x-sketch.json`, `probe/ax-sketch.json`, `probe/shots/sketch-*.png`, taken on a scratch dev server;
  - browser mutants: `probe/x-mutant-v1.json` (v1, no `select-text`/`active:transform-none!`: drag selection `''`, pressed `matrix(0.98…)`) and `probe/x-mutant-select-only.json` (`select-text` only: "Order #100");
  - `probe/pxdiff.txt` (12 pairs, all 0).
- **Stubs:** `localStorage.auth_user` with a stub `accessToken`, plus `page.route` for `/api/auth/profile` and `/api/orders/my` (L36). Rows that use them prove the client path only (`…-STUBBED`). The unstubbed guard and the backend ownership rows stay separate.
- **Before any row:** warm `/account/orders` once in a browser (cold dev server, L38). A run that coincides with a Vite `optimized dependencies changed. reloading` line is environment-invalid, and its replacement counts against the budget. B's first sketch runs hit exactly that.

| Row | What | Pass when |
|---|---|---|
| C-SCOPE | claims at start and end, plus K17 | output equals the planning output except the deltas in `claims-486-sketch-delta.txt`; K17 `L58 OK` |
| C-APPLY | the 2 sketch files equal `b-round-485/sketch-486/` (K15 `2 of 2`), or A's listed changes are each justified by a reviewer Medium+ | — |
| OC-TAB-STUBBED (L47, L1) | `order-card-probe.mjs` Tab walk from the top, 3 viewports | every card toggle is a Tab stop right after the account nav "Orders" link (stops 12 and 13 at 1440/1280, 8 and 9 at 375, as in `sketch.json` `cardStops`; HEAD `[]`); each has `focusVisible` true and an outline `solid` brass at 0.8 with offset `-2px` |
| OC-KEYS-STUBBED | Tab to "Order #1001", then Enter, then Space | Enter: `aria-expanded` `true`, "Middle East" visible, `document.activeElement` is the same button with `:focus-visible`. Space: `aria-expanded` `false`, no item visible, focus unchanged (`sketch.json` `afterEnter`/`afterSpace`) |
| OC-HELD-STUBBED | Enter held (1 + 5 repeats), Space held (1 + 5 repeats) | `record` — native button: Enter toggles on each repeat (sketch: even count → `false`), Space once (`true`). Not a FAIL either way unless focus leaves the button |
| OC-RING | crop of the focused card at both viewports | the brass ring is visible on all four sides inside the card border (compare `probe/shots/sketch-ring-*.png`); corner pixels may be clipped by the card radius |
| OC-PIXEL (L39) | `pxdiff.mjs` of C's screenshots (`collapsed`, `mouse-expanded`, `x-collapsed`, `x-expanded`; 3 viewports) against B's `probe/shots/head-*.png` | 0 differing pixels in all 12 pairs (B: `pxdiff.txt` all 0). If a pair is non-zero, C re-captures HEAD from a `git archive 0341229` scratch on its own port and `cacheDir` (L38), and that same-run pair decides |
| OC-BOX | `compare.py probe/head.json <C sketch.json>` and the `x-*.json` `collapsedBoxes`/`expandedBoxes` | card, header, title boxes, title font and `cardHeight` equal HEAD, collapsed and expanded, 3 viewports (the stacked 375 layout included); second card's box equal HEAD after the first expands. `headerCursor` (the `h3`) reads `auto`; the button's own cursor is `pointer` (`ax-sketch.json` `buttonCursor`) |
| OC-MOUSE-STUBBED | mouse click on "Order #1001", then again | expands then collapses (as HEAD); after the press, `data-focus-source` is `pointer` and the button has no visible ring (`focusVisible` false) |
| OC-PRESS | `extra-486.mjs`: mouse down on the title, read the button's computed `transform`, mouse up | `none` at all 3 viewports (HEAD `none`; v1 mutant `matrix(0.98…)`), and the press-release still expands the card |
| OC-SELECT | `extra-486.mjs`: drag across "Order #1001"; double-click it | drag selection is exactly `Order #1001` and double-click selects `#`, as HEAD (`x-head.json`); the card's expanded state after each gesture equals HEAD's (`afterDragExpandedState`, `afterDblclickExpandedState`) |
| OC-AX-STUBBED | `axname.mjs` | the aria snapshot has `heading "Order #1001 Paid Nov 1, 2026 $49.00 1 item" [level=3]` containing `button "Order #1001 Paid Nov 1, 2026 $49.00 1 item"` (`ax-sketch.json`); the CDP AX tree shows `expanded` false; no `region` role in the card |
| OC-SPEAKERS | K9 | speakers count 21 and 0 in the orders route, unchanged from planning |
| OC-UNIT | A's covering run, plus `python3 -I b-round-485/mutants.py <C outdir> <C scratch with the sketch applied>`, run from a scratch copy and never from `store/` | OC1–OC4 pass on A's tree; each mutant in `b-round-485/mutants/mutants-summary.txt` is red on the same rows |
| DOC | doc 314 | l.4 byte-exact; the TEMPLATE headings in order; every OC row it cites exists; the §2 contents present |
| G486-AUTH | fresh context with no credentials | `/account/orders` shows "Sign in required" [K11] with 0 order buttons; `/studio-lab` opens the demo anonymously (`auth_user` null); `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` (as in G485-AUTH) |
| OWN-BACKEND | real orders for a real account from the .NET backend | BLOCKED: backend unavailable in cloud (not a FAIL; not in `passed`) |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS | root gate only; never in `passed` |

C writes all L57 fields (`tools/l57-check.py` rc 0), including an `origin` per finding.

## 4. Rulings (L4, L10)
- **Ring offset vs the shared focus style:** the shared `:focus-visible` rule [K7] stays the only ring. Only its offset moves inside the card, through the existing `--focus-offset` hook, because the card's `overflow-hidden` would clip an outside ring on three sides.
  - No focus utility class is added (`store-focus-ring` passes on the sketch).
  - The missing guard on that hook is Low B-R486-FOCUS-OFFSET-GUARD (deferred).
- **Button vs "box unchanged":** the 0-px pixel rows (OC-PIXEL) win over any class-level reading. A must not add a radius, a focus class or a display change. Removing the radius was B's change to reach 0 px.
- **Pressed state and selection (sketch v2):** the header keeps HEAD's mouse behaviour. `active:transform-none!` cancels the global unlayered `button:active` scale [K7] on this button only (an important utility beats an unlayered normal declaration; measured `none`), and `select-text` lets a drag select the order number again. Both are pinned by OC-PRESS and OC-SELECT with the v1 browser mutant. A must not drop either.
- **Heading name:** the `h3`'s accessible name now includes the status, date, price and item count. This is accepted (APG: the heading holds the button); the order number comes first.
- **Held keys:** native button behaviour (OC-HELD, `record`).
- **Hidden panel:** its content stays in the DOM while collapsed (no focusables inside; L1). Find-in-page does not match collapsed items; HEAD did not render them at all.
- **Tab stops:** up to 50 cards means up to 50 extra stops. This is inherent to the pattern.
- **Out of scope:**
  - the protected `account.downloads.tsx` (no card there);
  - the "Browse Music" link (round 481);
  - the loading skeleton's `noArrayIndexKey`, which is pre-existing.

## 5. Sketch review (L58)
- `b-round-485/sketch-review.md` names the dispatched v2 sha256 and records `tech-lead`'s verdicts: v1 (`sketch-486-v1.patch.txt`) **APPROVE**, and the v2 delta re-review. It also records B's ruling on each Low.
- **Mutants:** 9 (M0 HEAD file, M1–M8). Logs are in `b-round-485/mutants/`, summary in `mutants-summary.txt`. They run from `/tmp/b486-mut`, never from `store/` (the script refuses it).

## 6. Outcome fixed in advance
- **C PASS with browserVerified true:**
  - B-R480-ORDER-CARD-KEYBOARD → done for the client path. OWN-BACKEND stays open evidence for a backend-enabled check; it does not block.
  - Round 487 = B-R486-PROFILE-NAME-KEYBOARD, unless the regression is due (on or after 2026-11-16).
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes.
