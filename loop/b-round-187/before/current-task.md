# CURRENT TASK — Round 187: STORE-1b — the preview player's invisible fill and the preview button's post-mount flip

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z152** (`backlog.json` → STORE-REDESIGN `store1b_plan_d29z152`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Spec:** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-1. The spec is DATA. B checked every code claim used here at `cc207d6` (§0).
- **Previous task:** `tasks/round-186.md` is an exact copy of the round-186 `current-task.md` (sha256 `c3ce161b…`, checked with `cmp`). The reasoning for this round is in `b-round-186.md`.

## Baseline = HEAD `cc207d6` (gate 186 published)
- **Gate:** `gates/gate-round-186.json` is `published`, commit `cc207d6`, on both remotes. `git status` is clean, with **1013 tracked files**.
- **Frozen list:** `b-round-186-r187-tree-sha256.txt`, **1010 entries** (every tracked file except the 3 grants). B checked it: OK.
- **Grants:** `b-round-186-r187-grants.txt`, 3 files: `app/components/audio/AudioPlayer.tsx`, `app/components/audio/AudioPreviewButton.tsx` and `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md` (status lines only). **Start hashes:** `b-round-186-r187-granted-start-sha256.txt` (`784bf761…`, `a1a20a44…`, `384a3bfc…`). **Start copies:** `b-round-186/r187-granted-start/`.
- **New files:** `b-round-186-r187-new-files.txt`: `app/lib/__tests__/audio-preview-player.test.tsx` and `docs/implementation/2026/quarter-IV/154-store-1b-audio-preview-player.md`.
- **A's first step:** check that HEAD is `cc207d6`, that `sha256sum -c --quiet b-round-186-r187-tree-sha256.txt` is OK, that the three start hashes match, and that neither new file exists yet. If anything differs, stop and report.
- **Mock API:** `tmp/studio-real-loop/mock-api/server.mjs` serves the store data on 127.0.0.1:5199. **A and C:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round (D-29z152)
- **Round 186: C PASS.** `browserVerified` and `realVerified` are true, and 12 rows passed. Root published it as `cc207d6`. **STORE-1a → მზადაა.** C-R185-01 and C-R185-02 are resolved.
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is 2026-10-26, which is 2 days. The first planning on or after **2026-10-27** makes the next round the REGRESSION round, expected to be round 188. That is the pre-written §7 outcome of round 186: "C PASS, planning still on 2026-10-26 → STORE-1b".
- **Bug gate:** no Critical, High or Medium finding is open.
- **C's two new Lows from round 186 are not part of this round. B's reasons:**
  - **C-R186-01** (the active SFX `door-slams` with no variants shows $0.00): `product-utils.ts` l.85 deliberately returns `[]` for an SFX product without variants, and SFX are sold through `/recordings/{id}`. A fix would change either the shown price or the `productVariantId` sent to `addToCart`. That touches the purchase path, and the real backend's contract for it is unknown. So the fix is not cheap and does not belong in the player round. It stays an open Low (owner STORE-4) with an upgrade rule: it becomes **Medium** if the real `/api/products/handle` returns an active product without variants. `/products/door-slams` joins the regression smoke.
  - **C-R186-02** (the Gift Cards paragraph contrast over the gold lettering): the overlay belongs to STORE-2, so it goes to `deferred_low_polish`, owner STORE-2.
  - **C-R185-I3** (the mini-player covers the page bottom) needs page padding in `root.tsx` or a layout file, and those are frozen here. It stays deferred.
- **Doc 153 is stale in the published commit.** The gate-186 reviewer said "fix before commit", but the file still says `In Progress (awaiting C round 186)`. It is a two-line doc fix, so it rides along (K3).
- **B checked the source at `cc207d6` (read-only):**
  - `AudioPlayer.tsx` l.127 (progress) and l.189 (volume) build their inline `background` from `var(--color-primary)`. Grep shows `--color-primary` is **defined nowhere** in `app/` (these two lines are the only hits). The fill colour is therefore invalid, and the played or set part of both tracks is not drawn. `--color-brand` is defined in `app/styles/app.css` l.64 (`hsl(175, 85%, 46%)`, `--color-brand-rgb: 19, 217, 204`). The obsidian block at l.3933 only applies under `[data-studio-theme="obsidian"]`, which the store pages do not use.
  - `AudioPreviewButton.tsx` l.14–44: a `useState(false)` + `useEffect` `isClient` flag. The server render **and** the first client render take the `!isClient` branch: a button with **no `onClick`**, and on the overlay variant an extra `<span class="audio-preview-overlay-text">Preview</span>`. After mount the button re-renders without the span and with the handler. React reports **no** hydration mismatch, because the server and the first client render agree. The defect is the flip **after** mount: the icon jumps when the label disappears, and the button is a dead control until the effect runs.
  - `AudioContext.tsx` l.56: the initial state is a deterministic literal (`currentTrack: null`, not playing). The server and the first client render therefore see the same idle state without the `isClient` guard.
  - Callers: `ProductSidebar.tsx:45` (product page) and `ProductCard.tsx:129/133` (cards on `/` and `/store`, overlay variant; the second appears only on md+ hover). No caller uses the `inline` variant. `AudioPlayer` is mounted once in `root.tsx:154` and returns `null` without a current track, so `/studio-lab` never shows it.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| **K1** (fill) | `app/components/audio/AudioPlayer.tsx` l.127 and l.189 | Replace each `var(--color-primary)` with `var(--color-brand)`, four places in two strings. **Nothing else changes:** the `rgba(255, 255, 255, 0.1)` unfilled part, the percentages, the classes and the markup stay byte-identical. (The hardcoded rgba is recorded as a Tailwind-first signal for STORE-2, not changed here.) |
| **K2** (flip) | `app/components/audio/AudioPreviewButton.tsx` | Remove the `isClient` state, its effect and the whole `!isClient` branch (l.14–18 and l.24–44), so the server and every client render produce **one** markup: the current interactive markup, unchanged. Imports that become unused go away (`useEffect`, `useState`). Add `type="button"` to both returned buttons. `handleClick`, the aria-labels, `aria-busy`, the icons and the classes stay as they are. **Ruling R55 (below): the idle overlay has no "Preview" text label.** |
| **K3** (doc) | `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md` | Line 4 → `**სტატუსი:** Completed`. The line "C-ის დამოუკიდებელი ბრაუზერის შემოწმება (რაუნდი 186) ჯერ არ ჩატარებულა." → one Georgian line saying that C round 186 PASSED (`c-round-186.md`, browserVerified) and root published it as `cc207d6`. No other byte in doc 153 changes. |
| **T1** | **new** `app/lib/__tests__/audio-preview-player.test.tsx` | See §3. |
| **D1** | **new** `docs/implementation/2026/quarter-IV/154-store-1b-audio-preview-player.md` | Georgian, following `TEMPLATE.md`: date, status `In Progress (awaiting C round 187)`, project, context (the undefined token, the post-mount flip), approach and ruling R55 with the rejected alternative, changed files, problem → solution, testing, TODO (STORE-1c, 1d; the signals in §8). |

**Ruling R55 (vetoable, recorded in the backlog):** the single markup is the **interactive** markup users already get after mount: icon only, accessible name "Play preview", **no** visible "Preview" label. The alternative was to keep the label in every state. B rejected it for three reasons:
- After hydration, every user today sees no label. Keeping the interactive look means the UI people actually use changes by 0 px, and C's existing post-hydration baselines stay valid.
- The label existed only in the dead, pre-mount markup. The Pause and Loading states never had it.
- The accessible name ("Play preview") is unchanged either way.

The visible change is limited to the first paint before hydration, which loses a label that vanished a moment later anyway. `.audio-preview-overlay-text` in `app.css` becomes unused. `app.css` is frozen, so this is recorded as a signal for STORE-2/5 cleanup. The visual restyle of the button (glow, colours) belongs to STORE-2/STORE-4, not this round.

## 2. A — files you own (everything else is frozen)
- **Grants:** `AudioPlayer.tsx` (K1), `AudioPreviewButton.tsx` (K2), doc 153 (K3, two lines only).
- **New:** T1 and D1, plus your own `a-round-187.md` and `a-round-187/`.
- **Protected, byte-identical:** every other tracked file. That includes `AudioContext.tsx`, `app/components/audio/index.ts`, `ProductCard.tsx`, `ProductSidebar.tsx`, `ProductDetailPage.tsx`, `product-utils.ts`, `root.tsx`, `app/styles/app.css`, every Studio-owned file (`app/components/arrangement/*`, `app/lib/arrangement/*`, `studio-lab.tsx`, `CookieConsent.tsx`), the protected purchase and auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `app/lib/auth.ts`, `firebase.client.ts`), `public/`, `e2e/`, `.claude/**`, `package.json` and the configs. Do not touch `mock-api/` or any other loop file.
- **Read first** (rule `read-primitives.md`): `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`. K2 is not a forwardRef refactor. Do not change the component's public API (`track`, `variant`).
- Make every lasting edit with Edit/Write. Helper scripts go under `a-round-187/tools/`. Write `a-round-187/end-sha256.txt` (the 3 grants + 2 new files) and `a-round-187/diff-vs-start.patch`. No commit and no push.

## 3. A — tests and checks (speed rules)
**T1 must contain at least these cases.** Mock `~/contexts/AudioContext`'s `useAudio` with a controllable state and `vi.fn()` `play` / `pause` / `seek` / `setVolume`, plus `~/lib/analytics` and `~/lib/facebook-pixel`. Follow the mock pattern of `app/lib/__tests__/product-handle-route.test.tsx`. No type assertions.
- **B1 (the flip):** for `variant="overlay"` and `variant="inline"`, idle state: `renderToStaticMarkup(<AudioPreviewButton …/>)` **equals** `container.innerHTML` after `render()` with effects flushed (`await act(async () => {})`). **This must be red on the start copy:** the start's static markup has the "Preview" span, its post-mount DOM does not. A comparison with the *first* client render would pass on the start code and prove nothing, so it does not count.
- **B2:** the static markup has no text node "Preview". The button has `type="button"` and `aria-label="Play preview"`, and the play-path `d="M8 5v14l11-7z"` is present.
- **B3:** after `render()`, a click on the button calls `play` once with the track and stops propagation: a parent `onClick` spy is not called. With the state `isPlaying` for that track, the label is "Pause preview" and a click calls `pause`. With `isLoading`, `aria-busy="true"` and the label "Cancel loading preview".
- **B4 (hydration):** put the `renderToString` output in a container and call `hydrateRoot` inside `act`, with an `onRecoverableError` spy and a `console.error` spy. After that, both spies have **0** calls and the DOM equals the static markup.
- **P1 (fill):** a mocked state with a current track, `currentTime: 30`, `duration: 120`, `volume: 0.7`. `renderToStaticMarkup(<AudioPlayer />)`, wrapped in a `MemoryRouter` because the component uses `Link`. The progress input's `style` contains `var(--color-brand) 25%` and the volume input's contains `var(--color-brand) 70%`. The markup contains no `--color-primary`. Red on the start copy.
- **P2 (token exists):** read `app/styles/app.css` from disk. `--color-brand:` is declared in the `@theme` block (l.31 onwards) (not only inside the obsidian block), and `--color-primary` is declared nowhere. That guards K1 against a future token rename.
- **P3:** no current track → `renderToStaticMarkup(<AudioPlayer />)` is `''`.
- **Red proof:** point T1 at a scratch copy of the start files (`b-round-186/r187-granted-start/`) or list one-line mutations and their red runs. **At least B1, B4's DOM check and P1 must be red** on the start code.

**Run:** `npx vitest run app/lib/__tests__/audio-preview-player.test.tsx app/lib/__tests__/product-handle-route.test.tsx app/lib/__tests__/product-presentation.test.tsx`, then `npm run typecheck` and `npm run lint`. Do not run the full suite: that is the gate's job.
**Live proof** (mock on :5199, store on :5173), saved under `a-round-187/`:
- `curl -s http://127.0.0.1:5173/products/middle-east | grep -c 'audio-preview-overlay-text'` → **0**. The same for `/` and `/store`.
- One Playwright Chromium check at 1440 on `/products/middle-east`: click Play preview, then wait 2 s. Resolve the expected colour at runtime: add a probe element with `background-color: var(--color-brand)` and read its computed `backgroundColor`. Note: `hsl(175, 85%, 46%)` serializes to about `rgb(18, 217, 200)`, not the hand-written `--color-brand-rgb` 19, 217, 204. The progress input's computed `background-image` must contain that probe string. Save a screenshot of the player bar.

**Code review:** use the `code-reviewer` subagent, since there are 5 files. Pass its Architecture note to B verbatim.

## 4. C — rows
Use real Playwright Chromium on the shared :5173 server, with a fresh anonymous context per session, at **1440×900, 1280×720 and 375×812**. Pixel reads run at DPR 2 with `--disable-lcd-text`. Start the mock if :5199 is not listening, log to `c-round-187/mock.log`, and stop it at the end if you started it.

| Row | What | Pass |
|---|---|---|
| **FILL-187** (K1) | `/products/middle-east`, at the 3 viewports. Click Play preview and wait until `currentTime ≥ 2 s`. Read both range inputs. Then set the volume to about 0.3 (keyboard on the volume slider, or `fill` + `input` event) and read again. | Progress input: computed `background-image` contains the colour string read from a runtime probe (`background-color: var(--color-brand)` → computed `backgroundColor`; `hsl(175, 85%, 46%)` serializes to about `rgb(18, 217, 200)`, so do **not** match the literal `19, 217, 204`). A pixel sample of the track **left** of the thumb (at about half the played width, vertically centred) is within ΔE ≤ 10 of the probe colour (allow for the blur and DPR). A sample right of the thumb is **not** teal. Volume slider at the default 0.7: teal from the left edge to about 70 % ±3 % of its width. After the change to about 0.3, teal ends at that fraction ±3 %. Report the contrast of the teal fill against the unfilled track pixel next to it: ≥ 3:1 is expected (WCAG 1.4.11). A miss is a finding with its numbers. **Before:** the round-186 product shots taken during playback (`c-round-186/shots/store-after/{1440,1280,375}-product-middle-east-185seq.png`) show no teal in the track. Cite that crop. At 375 the slider may be hidden by the mobile player layout: if so, record that as a fact with a screenshot, not a FAIL. |
| **FLIP-187** (K2) | `/products/middle-east` (sidebar button), `/store` and `/` (card buttons; at 1440 and 1280 hover a card so the md+ overlay shows; at 375 the `md:hidden` corner button). Two sessions per page: **JS disabled** (`javaScriptEnabled: false`, the SSR markup) and **JS enabled** after `load` + 1 s. | The SSR HTML has **0** `audio-preview-overlay-text` and **0** "Preview" text nodes in the buttons. For the same button, `outerHTML` is identical in the JS-off session and the hydrated session, apart from React-only attributes if any appear (list them). Between the two sessions, at all 3 viewports: (a) the button's **width and height** are identical (±0.5 px); (b) the `<svg>`'s offset **relative to the button's top-left** is identical (±0.5 px). On the start code (b) differs, because the "Preview" span pushes the icon up in the column flex. Absolute page positions are **not** compared: framer-motion's SSR `initial` transform (e.g. `translateY(20px)` on the product sidebar `motion.div`) and the home/store scroll-reveal leave JS-off elements offset. That is expected, not a finding. 0 hydration messages. `aria-label="Play preview"` and `type="button"`. |
| **PREVIEW-187** | 1440: `/products/middle-east` sidebar button, then `/store` (hover the first card with audio and click its overlay button). 375: the product page. | A real `HTMLAudioElement` `currentTime` advances ≥ 1 s within 3 s. The button's label becomes "Pause preview", and a second click pauses: `paused === true`, label "Play preview". On `/store`, clicking the card's button does **not** navigate (URL unchanged): `stopPropagation`/`preventDefault` still hold. The player bar shows that card's title. |
| **STORE-AFTER-187** | `/`, `/store` and `/products/middle-east` at the 3 viewports. Use round 186's capture methods, and the **scrolled** shots `c-round-186/shots/store-after/*-scrolled.png` as the baseline for `/` (round 186's info: the old home before-shots are blank below the hero). | Hydrated, idle pages: **0** changed px on `/store` and the product page. On `/`, changes are only in the masked auto-rotating hero (STORE-3) and in the LeadMagnet popup if it appears. The product page **during playback** (round 186's Play-preview sequence): the only changed pixels are inside the fixed player bar's two tracks (the new teal fill). Report the changed-pixel bbox. Home LCP ≤ 2.5 s and CLS < 0.1 (3 loads, median; round-186 baseline 356/356/364 ms, CLS 0.0009/0.0014/0). |
| **G187-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` without a header and with `Authorization: Bearer fake`. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. No header → 401. Fake Bearer → **403** "Unable to verify ownership", with `mock.log` showing `/api/downloads auth=yes 401`. Mock-backed, not real-backend evidence. |
| **STUDIO-RV-187** | `/studio-lab` rest screenshot at 1440 and 1280 with the mock running, vs `c-round-186/shots/c186-{1440,1280}-1/rest-full.png`. | 0 changed px. Studio console: 0 errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **SCOPE-187** | Frozen list (1010) at C's start and end; A's `end-sha256.txt`; `git status`. | Frozen OK. `git status` = exactly 3 ` M` (the grants) and 2 `??` (T1, D1). The `AudioPlayer.tsx` diff = 4 token replacements on 2 lines. The doc 153 diff = 2 lines. The `AudioPreviewButton.tsx` diff only removes the `isClient` state, effect, branch and their imports, and adds `type="button"` ×2. |
| **T-RUN-187** | Run T1 yourself. Then run it against a scratch copy of the start files (`b-round-186/r187-granted-start/`), or against your own one-line mutants: put back `--color-primary`, and restore the `isClient` branch. | T1 green on the tree. B1, B4's DOM check and P1 are red on the start code or on the mutants. |
| **AN-REVIEW-187** | Read the K1–K3 diffs and D1. | The public API (`track`, `variant`) is unchanged. No new hardcoded colour or custom CSS. No new export. D1 is in Georgian, has the TEMPLATE sections and records R55 with the rejected alternative. Doc 153: line 4 `Completed`, and the C-pending line now cites round 186 PASS and `cc207d6`. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror. 0 hydration messages on `/`, `/store` and the product pages. 0 requests to remote hosts other than the Google Fonts hosts. 0 Authorization headers from the page. |

**Outcomes written in advance:**
- If the fill is still invisible because a browser drops `var()` inside an inline gradient, that is a FAIL of K1. B then plans a fix-up that moves the fill to a class (STORE-2 owns `app.css`, so that needs a new grant).
- If the JS-off and hydrated button boxes differ, FLIP-187 fails. That is a K2 fix-up.
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- a card click starts navigating instead of previewing → PREVIEW-187 and B3;
- the Pause and Loading states lose their labels → B3 and PREVIEW-187;
- a hydration warning appears because the server and client now render the interactive markup → B4 and REG-HYD;
- the player bar layout moves → STORE-AFTER-187 (playback crop);
- the Studio look → STUDIO-RV-187; purchase protection → G187-3.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store preview player and preview button (no Studio behaviour) | **None.** This is a store page, not an Arrangement feature. | Nothing. | Saba approved STORE-REDESIGN (2026-10-25). Ruling R55. | STUDIO-RV-187. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-187.md` and `a-round-187/`.
- **C:** `c-round-187.md`, `c-round-187.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-187/`. Put the after screenshots in `c-round-187/shots/store-after/`. For each page, save **scrolled** full-page shots with every image complete as the next baseline.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 188 |
|---|---|
| **C PASS**, planning on or after 2026-10-27 (expected) | Root publishes round 187. STORE-1b → **მზადაა**. Round 188 = **REGRESSION round**: one short check per done or c_pass item, at both Studio viewports, plus `npm run test:e2e:smoke`. Additions: M1, M3, M4, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN, the harness gate-log check, a store smoke against the mock (`/`, `/store`, `/products/middle-east`, `/products/door-slams` for C-R186-01, `/products/archived-rain` 404, meta from data, 0 unsplash), and the STORE-1b fill and flip. Then STORE-1c. |
| **C PASS**, planning still on 2026-10-26 | STORE-1c. Regression on the first planning on or after 2026-10-27. |
| C FAIL on FILL-187 or FLIP-187 | A bounded fix-up in the granted files (severity Low/Medium by C's evidence) comes first, before the regression round if it is cheap. |
| A browser row that can run here did not run | `browserVerified=false`, so STORE-1b is not done and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 3 grants plus T1 and D1. The mock stays in the loop folder.
- **Signals recorded, not scheduled** (gate-186 review): the sitemap lists inactive products (`sitemap[.]xml.tsx` l.24, no `isActive` filter; Low, `deferred_low_polish`, candidate for STORE-5); links that now lead to a 404 for inactive products (info); the emoji surrogate cut on the no-space meta path (nit); keep the meta helper in the route (Architecture note). New from B: the hardcoded `rgba(255, 255, 255, 0.1)` track colour and the unused `.audio-preview-overlay-text` after R55, both for STORE-2/5.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered. Fallback (c) continues, and it does not block this round. The next checkpoint point is the STORE-REDESIGN exit.
