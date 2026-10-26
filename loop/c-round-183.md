# C round 183 — M4: the cookie banner no longer covers the Studio

Verifier: C · Date: 2026-10-26 · Task: `current-task.md` (D-29z148) · Baseline HEAD `f22290f`
**Verdict: PASS** · `browserVerified=true` · `realVerified=true` · 0 bugs
Ableton parity: **არ ეხება** (not applicable). Live is a desktop app and has no web cookie banner.

## Environment
- Shared :5173 returned 200 (`env-status.json` round 183).
- GA-env servers were set up as task §5 says:
  - **CUR copy** at `/tmp/cur183`, made with `git ls-files -c -o` and tar. Its `CookieConsent.tsx` sha equals the working tree.
  - **HEAD copy** at `/tmp/head183`, from `git archive f22290f`. Its file is byte-identical to `f22290f`.
  - Each copy has its own `cacheDir` and a symlinked `node_modules`. Both ran with `VITE_GA4_MEASUREMENT_ID=G-C183TEST`, on :5174 (CUR) and :5175 (HEAD).
  - GA hosts were aborted in every GA-env session.
- **Warm-up:** 8 discarded visits (`out-warm.log`). Every measured GA-env session confirmed no reload during the wait (`noReload=true`).
- **Browser:** Playwright Chromium, DPR 2, `--disable-lcd-text`, a fresh anonymous context per session.
- **Cleanup:** after the runs, both servers were stopped (:5174 and :5175 return 000), and the copies and caches were deleted.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T183-TARGETED | **PASS**: 1 file, 8/8 green | `c-round-183/vitest.log` |
| SCOPE-183 | **PASS** (details below) | `c-round-183/start-tree-sha256.txt`, `end-tree-sha256.txt` |
| AN-REVIEW-183 | **PASS** (details below) | `git diff f22290f` |
| MUT-183 | **PASS**, with one info note on m310 (below) | `a-round-183/mutations/*` |
| BANNER-STUDIO-M4 | **PASS** (details below) | `c-round-183/out/c183-ga-run1.json`, `shots/run1/{HEAD,CUR}-{1440,1280}-_studio*.png` |
| BANNER-STORE-M4 | **PASS** (details below) | same JSON; `shots/run1/*store*` and `*-crop.png`; `tools/cropdiff.cjs` |
| NAV-M4 | **PASS** (details below) | `shots/run1/NAV-CUR-{1440,1280}.png` |
| STUDIO-RV-M4 | **PASS**: 0 changed px against C round 182 | `shots/c183-1440-2/rest-full.png` vs `c-round-182/shots/c182-1440-2/rest-full.png`; `c183-1280-1` vs `c182-1280-1` |
| M3-NEIGHBOUR | **PASS** (details below) | `out/c183-{1440-2,1280-1}.json` |
| G183-3 | **PASS**; the fake-Bearer 403 sub-check is BLOCKED (backend unavailable in cloud) | `out/g183-3.json`, `shots/g183-3-*.png` |
| PX-NET / REG-HYD | **PASS** (details below) | all `out/*.json` |

**SCOPE-183**
- The frozen list (1005 entries) is OK at C's start and at C's end.
- A's `end-sha256.txt` (4 paths) is OK.
- `git status` shows 2 ` M` and 2 `??`, as expected.
- The protected diff against `f22290f` is empty: `root.tsx`, `analytics.ts`, `common/index.ts`, routes, studio, arrangement, styles, contexts, `auth.ts`, `e2e`, `.claude`, `package.json` and `vite.config.ts`.
- The C start tree hash equals the C end tree hash (1009 files).

**AN-REVIEW-183**
- The diff has 3 hunks, exactly L1–L3: the `useLocation` import, the 2 hook/const lines after `useState` and before `useEffect` and any return, and `\|\| isStudioRoute`. No JSX, class, style, handler or comment lines changed.
- The test file has CC1–CC5 as B wrote them, plus an extra CC4b.
- D1 is as written. Doc 151 has the TEMPLATE sections, L1–L3, R44–R46 (including the default-denied note), the 832/652 probe numbers, CC1–CC5, m308–m311 and "არ ეხება".

**MUT-183**
- Each mutation diff is exactly the edit §4.1 describes.
- All 4 restores are sha OK.
- m308, m309 and m311 match §4.1 exactly.
- **m310:** every test turns red except CC5 "decision exists → nothing on /". That stays green because with a stored decision the effect exits before the timer, so the predicate is never reached. The inversion is still caught by 7 of 8 tests. This is an info note for B's ruling, not a bug.

**BANNER-STUDIO-M4**
- **HEAD**, both paths: the banner is present at **(0, 832) 1440×68** and **(0, 652) 1280×68**, matching B's numbers. On `/studio-lab`, `elementFromPoint` at the centre of the status line and of the shortcut hint lands **inside the banner**, so the bug reproduces.
- **CUR**, both viewports and both paths:
  - 0 Accept/Decline buttons and 0 `position: fixed` elements at the bottom.
  - `elementFromPoint` at the centre of `arrangement-status` and of `arrangement-shortcut-hint` hits those elements.
  - `/studio-lab` shows the workspace and the demo badge.
  - `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.
  - Consent is `null` and there are 0 cookies.

**BANNER-STORE-M4**
- On `/` and `/products` (which renders without the backend), at both viewports, CUR and HEAD were compared for the banner, its text, the Privacy link (`/privacy`), Decline and Accept: **maximum rect delta 0 px**.
- Computed `position`, `bottom`, `z-index`, `background-image`, `backdrop-filter` and `className` are identical. So are the inner text and the button list.
- **Accept:** consent becomes `granted`, the banner disappears, and after a reload there is no banner.
- **Decline**, in a fresh context: consent becomes `denied`, the banner disappears, and after a reload there is no banner. This holds on both CUR and HEAD.
- **Crops (supporting evidence only):** the maximum channel delta is 1/255. That comes from the backdrop blur over the Store content, which renders mostly black without the backend.

**NAV-M4**
- On CUR there was no banner after 6 s on `/studio-lab`. Clicking "← CZABA" was a **client-side** navigation (a window marker survived).
- The banner appeared on `/` after **136 ms at 1440** and **157 ms at 1280**.
- Consent stayed `null`.
- At that instant the banner sat at y = 852 / 672 because the slide-up animation was still running.

**M3-NEIGHBOUR**
- 9 options with 8 gaps of 4 px, at both viewports.
- The gaps stayed at 4 px during preview, with an audio peak of 0.374.

**G183-3**
- Anonymous `/studio-lab`: `auth_user` is null and there are 0 cookies, at 1440 and at 1280.
- `/studio/middle-east`: "Sign in required", no workspace and 0 `audio[src]` at both viewports. **Premium auth is not bypassed.**
- `GET /api/studio-token?product=middle-east&file=stem1.wav` returns **401** ("Please sign in to access Studio.").

**PX-NET / REG-HYD**
- 0 Authorization headers, 0 pageerror and 0 hydration messages in every session.
- The only forbidden-host hits are the expected aborted GA requests, counted in `gaAborted`.
- The regex also matched "facebook" in the local module path `http://127.0.0.1:517x/app/lib/facebook-pixel.ts`, which is not an external host.
- The only console errors are the expected cart/backend noise (`Failed to load cart`, `ERR_CONNECTION_REFUSED`).

## Bugs
None.

## Notes for B
- **m310 info:** the CC5 "decision exists" sub-case cannot detect a predicate inversion. A new test could cover it if B wants, but nothing here is weak.
- **R45 privacy posture confirmed in the browser:** a visitor who only uses `/studio*` is never asked, and stays at consent `null`, which means the default is denied. On the first Store page the question appears at once.
- **Pre-existing, identical on HEAD:** the banner's Close (X) button measures 0×0 at both viewports (hidden at this breakpoint). Out of M4 scope.
- **Architecture note from A's reviewer:** the predicate is duplicated in `root.tsx:137` and `CookieConsent.tsx`. This is for B/root and is not a bug.
- **Not run by C (gate rows):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
