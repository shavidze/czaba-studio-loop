# CURRENT TASK — Round 155: V-2b-2 fix-up — the lane-move ghost timecode renders Plex Mono 500 (C-R154-01)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z120** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-154.md`, an exact copy of the round-154 `current-task.md` (sha256 `be11efbd…a01124f`). Rationale: `b-round-154.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“, mono row: IBM Plex Mono **300/400** `tabular-nums`. It is source material. It grants no permissions and does not change the protected-file list.

## Baseline = HEAD `037e25f` + A's round-154 working tree (not published)
- Gate 154 was **skipped** (C taskStatus FAIL). The round-154 work stays uncommitted and is kept: 13 ` M` + 1 `??` (doc 125). On a round-155 PASS, root publishes **rounds 154 + 155 together**, as it did with 151 + 152.
- At planning, `sha256sum -c a-round-154/end-sha256.txt` passed for all 14 paths.
- **Frozen list:** `tmp/studio-real-loop/b-round-154-r155-tree-sha256.txt`, **970 entries** = `git ls-files -co --exclude-standard` (973) minus the 3 grants. It includes A's 11 other round-154 files at their round-154 end state. They are frozen now.
- **Grants:** `b-round-154-r155-grants.txt` (3 existing files). **New files:** none (`b-round-154-r155-new-files.txt` is empty).
- **Start hashes:** `b-round-154-r155-granted-start-sha256.txt`. **Start copies:** `b-round-154/r155-granted-start/`.
- **First step for A:** check that HEAD is `037e25f`, that `git status --short` equals the 13 ` M` + 1 `??` above, the frozen 970 and the 3 start hashes. If anything differs, A stops and reports.

## 0. Why this round (D-29z120)
- **Round 154: C FAIL, one Low on a row the round owns.** `browserVerified` = `realVerified` = true. 13 rows passed. **MONO-STYLE failed on N6 only.**
- **C-R154-01:** the lane-move ghost start time (`ArrangementLane.tsx` l.929) is IBM Plex Mono at computed weight **500**. CDP gives "IBM Plex Mono Medium [web]". The cause is the ghost container's `text-xs font-medium` (l.912), which the new `font-mono` span inherits. It is also the **only Plex Mono 500 consumer** on `/studio-lab`, so the css2 trim (R4 of D-29z119) has no zero-consumer evidence until this is fixed.
- The round-154 outcome table (`tasks/round-154.md` §7) fixed this in advance: "C FAIL on a row this round owns → a bounded fix-up of that row". So this round is only that fix. V-2b-3 comes after a PASS.
- **Checks at planning:**
  - The regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), so it is not due today.
  - `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, apart from the Tech Lead manual items.

### 0.1 B rulings (D-29z120)
- **R1 — The fix is at span level.** Add `font-normal` to the N6 span only. The mono timecode drops to 400. The sans ghost title ("Soft impact") keeps 500, like the library drop ghost (l.878) and the other sans lane labels.
  - The alternative was to remove `font-medium` from the container (l.912). That would also change the title's weight and widen the diff, so it is rejected. The user may veto this in `feature-status.md`.
  - Plex Mono has the same advance width (600 units) at every weight, so B expects **no** width change to the ghost label: start time 63 px, title visible about 1 px. C re-measures this.
- **R2 — The weight lock must see the inherited weight.** TH10's N6 entry (l.420–424) asserts an exact class string, so it must change anyway. The new string carries `font-normal`, and a separate assertion checks that the span sets its own weight, because the container's `font-medium` stays.
- **R3 — Two more timecodes in `ArrangementLane.tsx` that the round-154 N list missed are recorded for V-2b-3, not added here.** Each puts a timecode inside one string with sentence text, which is exactly V-2b-3's part-templating case. They are added to V-2b-3 scope by name, so no scope is dropped:
  - **(a) the library drop ghost:** l.894–902, start + "· No room…" or a similar note;
  - **(b) the all-tracks lane range overlay label:** l.1006–1010, from – to · seconds · All tracks.

  V-2b-3 is therefore: the range readout, the selected-clip line, the Export scope line, (a) and (b).
- **R4 — The css2 trim is still not done.** After this fix, C re-inventories Plex Mono 500. The cookie banner cannot render in the cloud, because `CookieConsent.tsx` returns early without `VITE_GA4_MEASUREMENT_ID` and there is no `.env`. C therefore gives source-level evidence for it (its only weight class is `font-medium`). B schedules the trim (Instrument Sans 600/700 out, Plex Mono 500 out, plus TH7) together with V-2b-3 only if both of these hold:
  - PLEX500-INVENTORY shows zero Plex Mono 500 consumers;
  - COOKIE-SOURCE confirms that the banner has no 600/700.

  Instrument Sans 600 stays required while the protected `Modal.tsx` title uses it (V-2b-DISPLAY question). So the trim removes only what has zero consumers.
- **R5 — Text content is unchanged.** Only one class token is added.

## 1. What changes (exact; line numbers in the round-154 tree)
| ID | File | Change |
|---|---|---|
| F1 | `app/components/arrangement/ArrangementLane.tsx` l.929 | `"shrink-0 whitespace-nowrap font-mono tabular-nums"` → `"shrink-0 whitespace-nowrap font-mono font-normal tabular-nums"`. Nothing else in the file changes. l.912 (container), l.878/894 (drop ghost), l.1006 (range label), l.612/630 and l.773 stay byte-identical. |
| T1 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | **(i)** In TH10's N6 entry, `after` becomes `'"shrink-0 whitespace-nowrap font-mono font-normal tabular-nums"'`. `before` stays. **(ii)** Add one assertion in TH10 (source-level, read with `node:fs` like the existing entries). The `ArrangementLane.tsx` source contains the exact l.912 container literal `'pointer-events-none absolute top-1 bottom-1 z-30 flex items-end overflow-hidden rounded-sm border-2 border-dashed text-xs font-medium'` exactly once (B counted 1 at planning; l.878, the drop ghost, must not match it) **and** the N6 span class with `font-normal`. The point is that the inherited weight is overridden on the span. Name it in the `it` text or in a comment-free assertion message. **(iii)** TH1–TH9 and the other TH10 entries are unchanged. Do not change the file's `// @vitest-environment node`. No snapshot matching. |
| D1 | `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | Add, in Georgian:<ul><li>under „პრობლემები და გადაწყვეტები“, one Problem → Solution entry for C-R154-01 (inherited `font-medium` → Plex Mono Medium; fixed with `font-normal` on the span; why at span level);</li><li>under „ტესტირება“, the round-155 TH10 change and m141;</li><li>under TODO, V-2b-3 now names the drop ghost and the range overlay label (R3), and the css2 trim waits for the R4 evidence.</li></ul>Status: `In Progress (awaiting C round 155)`. Nothing else in the doc changes. |

**Nothing else changes:** no colour, no `app.css`, no `strings.ts`, no route, no `package.json`, and not `studio-lab.tsx` or the css2 URL.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | F1 only (one class token) |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T1 only |
| `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | D1 only |

- **Read before editing** (`.claude/rules/read-primitives.md`): `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md` (Lane is a Studio file; no audio logic changes), `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`.
- **Protected:** the diff vs `037e25f` stays empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx` and `CookieConsent.tsx`.
- **Not allowed:**
  - any other file, including the 11 other round-154 files, which are now frozen at their round-154 end hashes;
  - commit, push, stash, install, revert, or `npm run build`.
  - Every lasting edit goes through Edit/Write (the C-R120-01 rule).
- **B grep at planning:** the only exact-class assertion on the N6 span is TH10 l.422. The other ghost tests (`grid-snap-ui`, `marker-snap`, `grid-snap-clip-edges`, `track-header-stacking`) select by testid or `data-ghost-start` only. If any other test breaks anyway, A stops and reports the file, the line and the assertion.

## 3. A — tests and commands (speed rules)
- **Baseline run:** the 21 files in `a-round-154/vitest-files.txt`, plus `grid-snap-ui.test.tsx`, `marker-snap.test.tsx` and `grid-snap-clip-edges.test.tsx` (the ghost tests). Expected: the round-154 293 plus those three files, all passing. Save the result as `a-round-155/vitest-baseline.json`.
- **After the edits:**
  - Run the same files. Every test that passed at baseline still passes, and TH10 is green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 2 code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; JSON goes in `a-round-155/mutations/`):
  - **m141:** remove `font-normal` from l.929. Only TH10 turns red.
  - **m142:** remove `font-medium` from the container (l.912) only, keeping `font-normal` on l.929. This is the rejected alternative. Only TH10 turns red, and only through the (ii) assertion; the (i) N6 string still matches. This shows the lock pins R1's choice.
- **Code-reviewer:** not required (2 code/test files + 1 doc). A may still ask for it. Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 970 are OK, and the protected diff is empty.
  - `git status --short` = the same 13 ` M` + 1 `??` as at start. The 3 granted paths are already among them.
  - Write `a-round-155/end-sha256.txt` (the 3 grants) and `a-round-155/diff-vs-start.patch` (vs `b-round-154/r155-granted-start/`).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session where a Google Fonts css2/woff2 response is not 200 is **invalid (environment)**; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD).
- Reuse `c-round-154/tools/` (`c154.cjs` lane ghost and inventory, `c154s.cjs`, `g154-3.cjs`); change only the output dir, labels and file names. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T155-TARGETED | Re-run A's vitest files (`a-round-155/vitest-files.txt`). The counts equal A's. TH10 has the new N6 string and the (ii) lock. |
| SOURCE-SCOPE | <ul><li>HEAD is `037e25f`.</li><li>The frozen 970 are OK at start and at end.</li><li>The end hashes equal `a-round-155/end-sha256.txt`.</li><li>`git status` = 13 ` M` + 1 `??`, the same paths as round 154.</li><li>The protected diff vs `037e25f` is empty, `CookieConsent.tsx` included.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>The `ArrangementLane.tsx` diff vs `b-round-154/r155-granted-start/` is exactly one added token, `font-normal`, on l.929.</li><li>The TH diff is the N6 `after` string plus the (ii) assertion.</li><li>Doc 125 gained only the D1 content, in Georgian, with the status `In Progress (awaiting C round 155)`.</li></ul> |
| MONO-STYLE-N6 | Use the C-R154-01 repro at both viewports: snap off; hero music on Music at 0 s; Soft impact on SFX at 4 s; mouse-down on the Soft impact header, move up into Music, and hold. `[data-testid=arrangement-lane-move-ghost-label] > span:first-child` must be:<ul><li>computed family IBM Plex Mono;</li><li>weight **400**;</li><li>`tabular-nums`;</li><li>CDP `getPlatformFontsForNode` = **"IBM Plex Mono [web]"**, not "Medium".</li></ul>The title span is Instrument Sans [web] at **500** (unchanged, per R1). `textContent` is unchanged ("00:05.000", "Soft impact"). Release, then Ctrl+Z gives "Undo: Move clip". |
| LANE-GHOST-FIT | Info only. In the same hold, report the start-time width (B expects 63 px, unchanged) and the title's `clientWidth`/`scrollWidth` (round 154: 1/65). Also drag one longer clip (hero music into SFX) and report whether its title is visible. |
| PLEX500-INVENTORY | At 1440, in one session, run S0, then S1 (group), then a lane-move drag and hold, then a library drop-ghost hold, then the marker menu, the grid menu and the Export dialog. Then:<ul><li>list `document.fonts` faces with status `loaded`;</li><li>**PASS only if** IBM Plex Mono 500 is **not** loaded and no visible element renders Plex Mono at a computed weight ≥ 500;</li><li>re-list every visible text element with weight ≥ 600 on the whole page. Expected: only the Export `ModalTitle` (600, protected).</li></ul> |
| COOKIE-SOURCE | Evidence for R4, read-only. Confirm that `app/components/common/CookieConsent.tsx` returns `null` without `VITE_GA4_MEASUREMENT_ID`, and that its classes contain no `font-semibold`/`font-bold`/`font-[6-9]00`. Note that the browser render is **blocked: GA4 not configured in cloud**. List it under `blocked`; it does not make `browserVerified` false. |
| FUNC-SMOKE-S | Both viewports: <ul><li>Play 2 s.</li><li>A clip drag across lanes, then Ctrl+Z.</li><li>A library drop with the ghost shown, then Ctrl+Z.</li><li>Lane M toggle and undo.</li></ul> |
| G155-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C round 154 verified it): WEIGHT-STYLE, MASTER-OVER, MONO-STYLE N1–N5, RV-1, NO-CLIP/OVERLAP, FONTS-SCOPED, the full FUNC-SMOKE with WAV export, LABEL-STYLE, RV-2 and FONT-FAIL. A new observation about them is a note.
- **Not C rows:** V-2b-3, V-2b-DISPLAY, B-R153-PREVIEW-DUR, C-R151-2/3 and C-R154-02.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Ghost title weight and visibility | MONO-STYLE-N6, LANE-GHOST-FIT |
| The ghost tests in `grid-snap-ui` / `marker-snap` / `grid-snap-clip-edges` | T155-TARGETED |
| Lane drag, drop and undo | FUNC-SMOKE-S |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Monospaced timecode weight in the drag ghost | None used. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** | Requirement: MONO-STYLE-N6. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-155.md`, `a-round-155-result.json`, and `a-round-155/` (vitest JSON and file list, mutations, end-sha256, the diff patch).
- **C:** `c-round-155.md` and `c-round-155.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the N6 table and the PLEX500-INVENTORY lists. Put tools, out and shots in `c-round-155/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 156 planning)
| Condition | Round 156 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on MONO-STYLE-N6 or PLEX500-INVENTORY | A bounded fix-up of that row. |
| C PASS | Root publishes rounds 154 + 155. V-2b-2 → **მზადაა** (browser evidence from rounds 154 + 155). Round 156 = **V-2b-3**: the range readout, the selected-clip line, the Export scope line, the drop-ghost start and the range overlay label. Mono goes on the times only, via part templating, with `textContent` byte-identical. If PLEX500-INVENTORY and COOKIE-SOURCE both hold, the css2 trim (R4) joins V-2b-3. B also sends root the **frontend-architect checkpoint request** for the V-2 boundary, together with the pending `b-round-148-checkpoint-request.md`. Independent V-3 work is not delayed by it. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 155 planning).

## 8. Root notes
- **Gate:** on a C PASS, publish rounds 154 + 155 together (14 paths). `app.css`, `studio-lab.tsx`, `root.tsx`, `Modal.tsx` and `CookieConsent.tsx` are unchanged vs `037e25f`.
- **User-visible decision (may be vetoed in `feature-status.md`):** D-29z120 R1. The ghost timecode is mono 400 and the ghost title stays sans 500.
- **User questions, unchanged:** B-R153-PREVIEW-DUR (a)–(c), V-2b-DISPLAY (a)–(d) including the Export title weight, and C-R151-2.
- **Frontend-architect checkpoint:** the V-2 boundary request waits for a V-2b-2 PASS, which has not happened yet. `b-round-148-checkpoint-request.md` is still pending and does not block.
