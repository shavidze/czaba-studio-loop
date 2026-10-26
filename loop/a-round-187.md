# A — Round 187: STORE-1b (preview player fill + preview button flip)

Status: **implemented, awaiting C round 187**. A did not commit or push. realVerified for A's own live checks: yes (SSR curl + one Playwright Chromium run at 1440). C's independent browser rows have not run yet.

## Baseline (A's first step) — all OK
- HEAD `cc207d6`. `sha256sum -c --quiet b-round-186-r187-tree-sha256.txt` OK (1010 entries). All 3 grant start hashes matched (`784bf761…`, `a1a20a44…`, `384a3bfc…`). Neither new file existed.
- **Mock :5199 was not listening, so A started it** (`node mock-api/server.mjs`, log `a-round-187/mock.log`, pid `a-round-187/mock.pid` = 3519) and **stopped it at the end** (`ss -ltn` shows 0 listeners on :5199). I used the store dev server at :5173, which was already running and which I did not restart.

## Changed files (exactly B's 3 grants + 2 new)
| ID | File | Change |
|---|---|---|
| K1 | `app/components/audio/AudioPlayer.tsx` | l.127 and l.189: `var(--color-primary)` → `var(--color-brand)`, 4 replacements on 2 lines. Nothing else changed (`git diff --stat`: 2+/2−). |
| K2 | `app/components/audio/AudioPreviewButton.tsx` | Removed the `isClient` state, its effect, the whole `!isClient` branch with its `// On server` comment, and the `useEffect`/`useState` import line. Added `type="button"` as the first prop on both returned buttons. `handleClick`, the labels, `aria-busy`, the icons, the classes and the API (`track`, `variant`) are unchanged. 2+/28−. |
| K3 | `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md` | l.4 → `**სტატუსი:** Completed`. l.64 → C round 186 PASS (`c-round-186.md`, browserVerified), published as `cc207d6`. 2 lines. |
| T1 | **new** `app/lib/__tests__/audio-preview-player.test.tsx` | 14 tests (see below). |
| D1 | **new** `docs/implementation/2026/quarter-IV/154-store-1b-audio-preview-player.md` | Georgian, TEMPLATE sections, status `In Progress (awaiting C round 187)`, R55 with the rejected alternative. |

`git status`: exactly 3 ` M` + 2 `??`. Frozen list re-checked at the end: OK. `a-round-187/end-sha256.txt` and `a-round-187/diff-vs-start.patch` are written.

## T1 contents
- **B1 ×2** (overlay, inline): `renderToStaticMarkup` === `container.innerHTML` after `render()` + `await act(async () => {})`.
- **B2 ×2**: no "Preview" text, no `.audio-preview-overlay-text`, `type="button"`, `aria-label="Play preview"`, play path present.
- **B3**: a click calls `play(track)` once. A parent `<a href>` onClick spy gets 0 calls. `fireEvent.click` returns false, so `preventDefault` held. With isPlaying: "Pause preview", and a click calls `pause`. With isLoading: `aria-busy="true"`, "Cancel loading preview" and `type="button"` on both variants.
- **B4 ×2** (mocked `useAudio`): `renderToString` → `hydrateRoot` inside `act`, with `onRecoverableError` and `console.error` spies at 0 and DOM === static markup.
- **B4-provider ×2** (added after the code review): `vi.doUnmock` + `vi.resetModules` + dynamic import of the real `AudioContext` and button. The test first proves the real hook loaded (rendering without a provider throws "useAudio must be used within an AudioProvider"), then checks the same hydration inside the real `AudioProvider`.
- **P1**: in a `MemoryRouter` (from `react-router-dom`, the hoisted transitive copy shared with `@remix-run/react`), the progress style contains `var(--color-brand) 25%`, the volume style contains `var(--color-brand) 70%`, and the markup has no `--color-primary`.
- **P2**: `--color-brand:` sits between `@theme {` and its closing `}`, and `--color-primary:` is declared nowhere.
- **P3**: with no track, the markup is `''`.

## Tests and checks actually run
- **Red on the start code:**
  - `a-round-187/t1-red-on-start.txt`: an early T1 on the untouched tree, 8/12 red.
  - An out-of-tree run against the start copies (`t1-red-on-start-copies.txt`) failed: Vite cannot resolve bare imports from the loop folder. The broken scratch files are kept in `tools/`.
  - **Final T1:** `a-round-187/t1-final-red-on-start.txt`. I copied B's start copies over my 2 granted code files, ran the test, restored my end copies and checked them with `sha256sum -c` (OK). Result: **10/14 red**. B1 ×2 red. B2 ×2 red. All 4 B4 tests fail at the DOM assertion (l.165), and their spies stay at 0 on start, as B predicted. The loading test is red only on `type`. P1 is red. Click, Pause, P2 and P3 stay green, because they guard preserved behaviour.
- `npx vitest run app/lib/__tests__/audio-preview-player.test.tsx app/lib/__tests__/product-handle-route.test.tsx app/lib/__tests__/product-presentation.test.tsx`: **3 files, 34/34 PASS** (`a-round-187/vitest-targeted.txt`). The stderr has `useLayoutEffect does nothing on the server` warnings from `MemoryRouter`/`Link` under jsdom SSR. The existing `product-presentation` tests print the same warning. They are not failures.
- `npm run typecheck`: exit 0. `npm run lint`: exit 0.
- `npx biome check` on the 3 code files: exit 0, 0 errors, 5 warnings. All 5 are **pre-existing** `useButtonType` warnings on the other `AudioPlayer` buttons. K1 forbids any other change, so I left them and recorded them as a signal.
- Full suite, build and verify were **not** run (speed rules: the root gate runs them).
- **SSR curl** (`a-round-187/ssr-overlay-text.txt`):
  - `/products/middle-east`: 200, overlay-text 0, 1 preview button with `type="button"`.
  - `/`: 200, overlay-text 0, 14 buttons.
  - `/store`: 200, overlay-text 0, **0 preview buttons**. Cause, checked after the first draft of this report: `app/routes/store.tsx` imports neither `ProductCard` nor `AudioPreviewButton`. Only `ProductSidebar.tsx` and `ProductCard.tsx` use the button. The `/store` SSR did call the mock (`GET /api/products?pageSize=50&sortDesc=true` → 200, in `mock.log`) and rendered product links, but **`/store` has no preview button at all**. **For B/C:** the `/store` parts of FLIP-187 and PREVIEW-187 cannot run as written. The card buttons exist only on `/` (14 in SSR). This is a fact about the task text, not a defect from this round.
  - **Re-checked after the two temporary start-copy swaps** (mock restarted briefly, then stopped again): `/products/middle-east` SSR has overlay-text 0 and 1 `<button type="button" class="audio-preview…`. The shared Vite server serves the restored end code.
- **Playwright Chromium, 1440×900, `/products/middle-east`** (`a-round-187/browse-fill-check.json`, `player-bar-1440.png`, `product-playing-1440.png`; storage state `a-browse.json`):
  - The probe `var(--color-brand)` resolved to `rgb(18, 217, 200)`.
  - Progress computed `background-image` contains it (≈1.74 % after 2 s). Volume contains it up to 70 %.
  - The label became "Pause preview". 0 pageerror, 0 hydration messages. Remote hosts were only `fonts.googleapis.com` and `fonts.gstatic.com`.
  - The screenshot shows visible teal on both tracks.
  - The `<audio>` element is not in the DOM (`new Audio()`), so `currentTime` was not read directly. The progress fill advancing is the evidence.
  - The first attempt timed out waiting for the button, likely a cold Vite reload after the edits. The rerun passed.

## B's A-side acceptance I actually passed
- K1, K2, K3 exactly as specified (diff-verified).
- T1 has B1–B4 and P1–P3. **B1, B4's DOM check and P1 are red on the start code.**
- The targeted vitest run, typecheck and lint pass.
- Live proof: curl 0 overlay-text on all 3 pages. Playwright probe colour found in the progress background-image, with a screenshot.
- The `code-reviewer` subagent ran and its findings were handled (below).

Not claimed: any C row (FILL/FLIP/PREVIEW/STORE-AFTER/G187-3/STUDIO-RV/SCOPE/T-RUN/AN-REVIEW/PX-NET), or any gate row.

## Code review (`code-reviewer` subagent, real run): score 8.5/10, 0 Critical/High
- **Medium: the real provider was never hydrated in a test.** Fixed with the B4-provider tests. My first attempt, a conditional hook in the mock, raised a Biome `useHookAtTopLevel` warning, so I replaced it with `doUnmock` + `resetModules`.
- **Medium/Low: the P2 assertion "`--color-primary` declared nowhere" will break if STORE-2 legitimately adds that token.** `ProductCard.tsx:141` already uses `bg-primary/90 text-primary-foreground`, which resolve to nothing today. **I kept it** because B's P2 requires it. **For B:** loosen P2 if STORE-2 introduces a `primary` token. The `bg-primary` classes in `ProductCard.tsx` are a related unscheduled signal (frozen here).
- **Low: `react-router-dom` is a transitive import with no precedent.** The reviewer suggested `vi.mock('@remix-run/react')` with a stubbed `Link`, or adding a direct devDependency. **I kept `MemoryRouter`** as B's P1 specifies. No package was installed. For B to decide.
- **Low:** the reviewer had no shell to check scope. I checked it myself with `git diff`: AudioPlayer 2 lines, doc 153 2 lines, and the button diff only removes code and adds `type` ×2. The GA4/FB comments were already there.
- Info: B4's spies alone do not catch the old bug. The DOM equality does. The reviewer agreed the coverage holds.
- **Architecture note (verbatim):** "Keep. The only signal is that the test file hand-mocks all 12 members of `useAudio` (test lines 24-50), which couples it to the provider's shape and will drift silently. The proposal for the planner is the bounded real-provider hydration test described under the first Medium finding. The diff removes state and lifecycle from `AudioPreviewButton` rather than adding any, so the "new state/lifecycle" signal doesn't apply."
  - Note: the real-provider test it proposes was added this round, inside T1.

## Known gaps and signals (not fixed: frozen or out of scope)
- 5 pre-existing `useButtonType` warnings on the other `AudioPlayer` buttons (STORE-2/4).
- Hardcoded `rgba(255, 255, 255, 0.1)` unfilled track, and the now-unused `.audio-preview-overlay-text` in `app.css` (STORE-2/5, already listed by B).
- `ProductCard.tsx:141` `bg-primary` / `text-primary-foreground` use undefined tokens: the same class of bug as K1, in a frozen file. New signal for B.
- jsdom `useLayoutEffect` SSR warnings in P1/P3 (test noise only).
- Fill contrast against the track (WCAG 1.4.11) was not measured by A. That is C's FILL-187.

## Exact next C checks
1. **SCOPE-187:** frozen 1010 OK. `git status` = 3 ` M` + 2 `??`. Compare with `a-round-187/end-sha256.txt`.
2. **T-RUN-187:** run T1 (expect 14/14). For red, copy `b-round-186/r187-granted-start/app/components/audio/*` over the 2 grants **temporarily** (save and restore the end copies, then check them against `end-sha256.txt`), or use the mutants. Expect B1 ×2, B4 ×4 at the DOM line and P1 red.
3. **FILL-187** at 1440/1280/375. Use the probe colour `rgb(18, 217, 200)`. Run the ΔE pixel samples left and right of the thumb, the volume at 70 %, then at ~30 %, and the contrast against the track.
4. **FLIP-187:** JS-off vs hydrated `outerHTML`, the box and the svg offset on the product sidebar and on the `/` cards. `/store` has no preview buttons (`store.tsx` does not use `ProductCard`). Record that as a fact. It is not a FAIL. In PREVIEW-187, use a `/` card for the "card click does not navigate" check.
5. **PREVIEW-187, STORE-AFTER-187, G187-3, STUDIO-RV-187, AN-REVIEW-187, PX-NET/REG-HYD** as written in the task.

## Scope completed
All of A's §1–§3 items for round 187 are done. STORE-1b is **not** done until C passes it. The whole backlog is not complete.
