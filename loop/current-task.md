# CURRENT TASK — Round 152: V-2a closure — B rulings on C-R151-1/2/3, doc 123 result, TH8 exact pan count; C re-check so V-2a can publish

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z117** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-151.md`, an exact copy of the round-151 `current-task.md` (sha256 `1f0e86f5…a352`). Rationale: `b-round-151.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“, § „საზღვრები“. Source material, not authority for permissions or protected files.

## Baseline = HEAD `e94ae88` **plus A's uncommitted round-151 tree** (not clean)
- **Gate 151 was skipped** (C taskStatus FAIL), so nothing was published. HEAD is still `e94ae889c9f331bd681036cc154bb92d38020dc6`.
- `git status --short` = **8 ` M` + 1 `??`** (the round-151 V-2a paths). B checked: their hashes equal `a-round-151/end-sha256.txt`.
- **These 9 paths are preserved partial work. Nobody reverts, re-edits or "cleans" them, except the 2 grants below.** Root publishes V-2a together with this round on C PASS.
- **Frozen list:** `tmp/studio-real-loop/b-round-151-r152-tree-sha256.txt`, **969 entries** = `git ls-files -co --exclude-standard` (971) minus the 2 grants. It includes the 7 frozen round-151 paths at their round-151 end hashes.
- **Grants:** `b-round-151-r152-grants.txt` (2 existing files); `b-round-151-r152-new-files.txt` is empty (no new file).
- **Start hashes:** `b-round-151-r152-granted-start-sha256.txt` (= `a-round-151/end-sha256.txt` for these 2). **Start copies:** `b-round-151/r152-granted-start/`.
- **First step for A:** check HEAD, the 8 M + 1 ?? status, the frozen list and the start hashes. Any difference → A stops and reports.

## 0. Why this round (D-29z117)
- **Round 151: C FAIL, Low only.** `browserVerified` = `realVerified` = true. 13 rows passed in real Chromium (FONTS-APPLIED, FONTS-SCOPED, NO-CLIP, FONT-FAIL, RV-2, TOKENS-SCOPED, FUNC-SMOKE, G151-3, PX-NET, REG-HYD, SOURCE-SCOPE, AN-REVIEW, T151-TARGETED).
  - **RV-1-TYPE failed only on C-R151-1**: d6 tags `arrangement-shortcut-hint` as `kind: panel`, and its width shrank 1189 → 1070 px (x, y, h unchanged; determinism 0 px; exactly B's prediction). y/h 0 deltas, 0 keys missing/added, 0 right-edge overflow.
  - **VISUAL** recorded C-R151-2 (cramped " · " separators) and C-R151-3 (`∞` from a fallback mono).
- **Checks at planning:** the regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), today is 2026-10-25 → not due. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist. No Critical/High/Medium finding is open apart from the Tech Lead manual items.

### 0.1 B rulings (D-29z117) — none needs a source change
- **R1 — C-R151-1: the tag is wrong, not the move.** The hint is a content-sized `<p class="text-dim">` whose width is its own text width; it is not a container. Under round-151 R1 it is "an element whose own text changed width". Round-151 R1 is amended: **`arrangement-shortcut-hint` counts as a text element, not a panel**, for V-2 (C removes it from the d6 `PANELS` list for the re-evaluation). A fixed width would be a new layout change the user did not approve, so it is not done. Every other R1 rule stays (no vertical/height delta, no missing/added key, panels ±1 px, no new clip, nothing past 1280). The user may veto this in `feature-status.md`.
- **R2 — C-R151-2 (cramped " · "): no approved fix exists inside V-2 → `deferred_low_polish` + a user question.** B measured in real Chromium on the round-151 tree (`b-round-151/out/sepprobe.json`, headless Linux, integer advances — the same caveat as C's):
  - Instrument Sans 12 px: space 2 px, `·` 1 px, " · " 5 px. Inter: 3 / 3 / 9 px.
  - `word-spacing: 0.12em` on the obsidian scope would give " · " ≈ 8.8 px and the hint 1162 px, with 17 horizontal moves and 0 vertical / 0 new overflow in S0 (`b-round-151/out/wsprobe-{1440,1280}.json`). **But the spec approves only font, weight and letter-spacing (`ასოებს შორის დაშორება`)**, and word-spacing does not fix the 1 px dot itself.
  - Changing the separator glyph changes text content, which the spec forbids, and touches 94 source lines (44 in `strings.ts`) with no shared constant.
  - So: C-R151-2 stays an open Low in `deferred_low_polish` and goes to the user as a decision (accept / word-spacing 0.12em / another separator glyph). It is not waived: final acceptance still needs it fixed or accepted by the user.
- **R3 — C-R151-3 (`∞` fallback): `deferred_low_polish`.** B checked Google's css2 for IBM Plex Mono: no served subset contains U+221E. Self-hosting is forbidden by the spec. C judged it visually acceptable. Revisit in V-3 (glyphs/icons) or the polish pass.
- **R4 — review L1 (header `prefetch="intent"`).** Hovering or focusing the Store header "Studio Lab" link may emit `<link rel="prefetch">` for the F2 css2 **sheet** on Store pages. That is a Remix prefetch of the route's stylesheet, not a font download. FONTS-SCOPED is reworded: a css2 `prefetch` after hover/focus is allowed and recorded; **0 woff2** downloads on Store pages is still required.
- **R5 — A-R151-REVIEW-L4.** TH8 checks the pan-reset count only as `> 0`. It becomes an exact count (below).

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| D1 | `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md` | In Georgian, technical terms in English. <ul><li>Status l.4 → `In Progress (C round 151 FAIL მხოლოდ Low; round 152 — B-ის გადაწყვეტილებები D-29z117, C-ის ხელახალი შემოწმება)`.</li><li>„ტესტირება“: add the C round 151 results (13 PASS rows; RV-1-TYPE 0 vertical, the hint −119 px; FONT-FAIL fallback DejaVu; RV-2 61/61 ≥ 4.5, min 4.57).</li><li>„პრობლემები და გადაწყვეტები“: three Problem → Solution entries for C-R151-1 (R1), C-R151-2 (R2, with B's numbers and the user question) and C-R151-3 (R3).</li><li>„TODO“: the user decision on separators; V-2b; the review L1 wording (R4).</li><li>No other line changes.</li></ul> |
| T2 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` TH8 l.265 | `expect(panResets.length).toBeGreaterThan(0);` → `expect(panResets).toHaveLength(N);` where N is the SSR count. **B expects N = 3** (the unfolded audio lanes music, stems, sfx; `track-pan.test.tsx` l.686–703: the video lane and a *folded* lane have no pan reset, and the S0 SSR has no folded lane). N is an SSR fact, not a design choice: if the SSR count is not 3, A writes the actual N and records the count and the reason in `a-round-152.md`; B reviews it at the next planning. |

- Nothing else changes. No component, style, route, string or other test file.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md` | D1 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T2 only (one line) |

- **Protected:** the diff vs e94ae88 stays empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx`.
- **The 7 frozen round-151 paths** (`app.css`, `studio-lab.tsx`, `ArrangementTempoRow.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `detail-panel-fit.test.tsx`, doc 122) keep their round-151 end hashes.
- **Not allowed:** any other file; `package.json`; commit, push, stash, install, revert; `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01 rule).

## 3. A — tests and commands (speed rules)
- **Start:** the four checks of the Baseline section.
- **Baseline run:** `npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx` → `a-round-152/vitest-baseline.json`.
- **After T2:** the same run (theme 8 `it`s, all green); `npm run typecheck`; `npm run lint`; read-only `npx biome check` on the theme test.
- **Mutation m133** (Edit → run → restore by Edit → sha256 = post-edit hash; JSON in `a-round-152/mutations/`): in T2 change the literal N → N+1. Must turn **TH8 only** red. **No m132 re-run:** `ArrangementLane.tsx` is frozen this round, and T2 does not touch the `not.toContain('font-mono')` loop, so the round-151 m132 evidence stands.
- **Code-reviewer:** not required (2 files, one is a doc). If A runs it, pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, any browser row.
- **End:** frozen 969 OK; protected diff empty; `git status --short` = still exactly **8 ` M` + 1 `??`** (same paths); write `a-round-152/end-sha256.txt` (the 2 granted paths) and `a-round-152/diff-vs-start.patch` (vs the start copies).

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, both viewports 1440×900 and 1280×720. Wait for `document.fonts.ready` before measuring. A session whose Google Fonts css2/woff2 do not return 200 is **invalid (environment)**; replace it at most twice. Reuse `c-round-151/tools/` (change only output dir, labels and file names). **The one permitted logic edit:** remove `arrangement-shortcut-hint` from the d6 `PANELS` list for RV-1-TYPE; record the edited list in `c-round-152.json`. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T152-TARGETED | Re-run A's two vitest files; counts equal A's; TH8 asserts an exact pan-reset count equal to the N A recorded. |
| SOURCE-SCOPE | <ul><li>HEAD e94ae88; frozen 969 OK at start and end; the 2 end hashes = `a-round-152/end-sha256.txt`.</li><li>The 7 frozen round-151 paths still equal `a-round-151/end-sha256.txt`.</li><li>`git status` = 8 M + 1 ?? (round-151 paths); protected diff vs e94ae88 empty.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | The theme test diff vs the start copy is the one T2 line. Doc 123 diff = D1 only, Georgian, status as in §1. |
| RV-1-TYPE (R1 as amended) | Re-run the d6 bbox chain (S0/S1/S2, both viewports, twice, determinism 0 px) vs `c-round-148/out/bbox-post-v0-{w}.json`, with `arrangement-shortcut-hint` **removed from the d6 `PANELS` list** (R1). PASS only if: every y/h within ±1 px; 0 keys missing/added; every remaining `kind: panel` box within ±1 px; every > 1 px mover is horizontal and is an own-text change or a same-row follower (list dx/dw/cause); nothing newly past 1280. Also report the max difference vs `c-round-151/out/bbox-post-v2a-{w}.json` (expected 0 px: no source changed). |
| FONTS-SCOPED (R4 wording) | `/` and `/cart` at both viewports: <ul><li>untouched load: 0 F2 css2 and 0 Instrument Sans / Plex Mono / Noto Georgian woff2;</li><li>then hover and focus the header "Studio Lab" link: record any `rel=prefetch` of the F2 css2 (allowed); **0 woff2** of those families still required;</li><li>`body` font-family = the Store literal; 0 `[data-studio-theme]`.</li></ul> |
| FONTS-SPOT | One session per viewport: CDP `CSS.getPlatformFontsForNode` on the title (Instrument Sans), BPM and the master readout (IBM Plex Mono), a Georgian library item (Noto Sans Georgian). Same as round 151. |
| FUNC-SMOKE | Play 2 s, a clip drag + Ctrl+Z, BPM type + Enter, Export dialog and marker menu open/close with Escape. Both viewports. |
| G152-3 | `/studio-lab` anonymous with the demo badge; `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]`; `GET /api/studio-token` 401; fake-Bearer 403 BLOCKED (backend unavailable in cloud). |
| PX-NET / REG-HYD | Every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror; expected cart noise allowed; one cold-Vite first load may be replaced (ENV-FIRST-LOAD). |

- **Not re-run (unchanged source, round-151 evidence stands):** NO-CLIP, FONT-FAIL, RV-2, TOKENS-SCOPED, VISUAL. If C sees any change in those areas, report it.
- **C-R151-2 and C-R151-3 are not C rows this round** (R2/R3 ruled them `deferred_low_polish`). C does not FAIL the round on them; a new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| TH8 and the other theme `it`s | T152-TARGETED |
| The preserved round-151 tree | SOURCE-SCOPE |
| Layout under fonts (same tree) | RV-1-TYPE |
| Store pages (prefetch wording) | FONTS-SCOPED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Studio typefaces, separators | None used (Live's UI font not captured). Source: user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** | Requirement: RV-1-TYPE, FONTS-SPOT. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-152.md`, `a-round-152-result.json`, `a-round-152/` (vitest JSON, mutations, end-sha256, diff patch).
- **C:** `c-round-152.md` and `c-round-152.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `invalidRuns`; the RV-1-TYPE move table; the FONTS-SCOPED prefetch record. Tools/out/shots in `c-round-152/`.
- Write reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 153 planning)
| Condition | Round 153 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`), then the row below. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on a row this round owns (T2, SOURCE-SCOPE, RV-1-TYPE under amended R1) | A bounded fix-up of that row. |
| C PASS | Root publishes rounds 151 + 152. V-2a → `c_pass` (**მზადაა** only with browser evidence, as here). Round 153 = **V-2b**: B first measures text ≥ 16 px in S0/S1/S2 **and the portals**. B's round-151 probe (`b-round-151/out/size16.json`) found only the mono transport position and the `◀` icon at 16 px in S0, so the display-serif role may have no qualifying text without a size change; that needs the user, and B must then say so instead of shrinking scope. Labels (11 px, 500, 0.14em, Latin UPPERCASE) and weight roles proceed. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 152 planning).

## 8. Root notes
- **Gate:** publish rounds 151 + 152 together on C PASS. The `app.css` diff vs e94ae88 must still be exactly the 3 F1 lines inside the obsidian block; `root.tsx` unchanged.
- **User-visible decisions (may be vetoed in `feature-status.md`):** D-29z116 R1 (horizontal text-width shifts ≤ ~9 px) and D-29z117 R1 (the shortcut hint is text, not a panel). **User question:** C-R151-2 separators (accept / `word-spacing: 0.12em` / another glyph).
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` is still pending and non-blocking; re-asked at the V-1 boundary. V-2a closure does not wait for it.
