# C — Round 110 verification (B-R108-LIB-FOCUS-LOSS, D-29z75)

Verifier: C · Date: 2026-10-23 (~13:40–13:50 UTC) · Verdict: **PASS** for the round-110 scope. **One new Medium bug (C-R110-01):** A's reviewer finding S5, reproduced independently by C. It is outside D-29z75's scope; see Bugs.

- **Environment:** dev server `:5173/studio-lab` (200, `env-status.json` round 110), real Chromium through Playwright, headless. Every session used a fresh incognito context with no credentials.
- **Sessions:** 20 instrumented sessions plus B's 8-session sweep. Tools are in `c-round-110/tools/`, raw results in `c-round-110/out/`, screenshots in `c-round-110/shots/`.
- **Source:** read-only. C touched only the scratch copy `c-round-110/mut/store`, and restored it afterwards (`cmp` = identical to `store/`).

## Hazard control (proves that "clip count unchanged" is a real oracle)
- **Steps:** arm (focus the Middle East option, ArrowDown → `demo-hero-music` selected), `blur()`, then Enter on BODY.
- **Result:** clips **0 → 1** at both 1280×720 and 1440×900 (`out/lf-basic.json`, `control-*`).
- Every LF row below ran with this hazard armed. The selected item is `demo-hero-music` at every recorded step where the list is visible.

## Acceptance results

| ID | Result | Evidence / measurements |
|---|---|---|
| LF-COLLAPSE (1280, 1440) | PASS | Focus ◀ → Enter 1: `data-collapsed=true`, active = `arrangement-library-expand`, width 288 → 40. Enter 2: expanded, active = `arrangement-library-collapse`. Clips 0 → 0 at both viewports. `out/lf-basic.json`, `shots/lf-collapse-*.png` |
| LF-EXPAND (1280, 1440) | PASS | Mouse ◀, focus ▶ → Enter 1: expanded, active ◀. Enter 2: collapsed, active ▶. Clips 0 → 0. |
| LF-CLEAR (1280, 1440) | PASS | Typed `mid`, focused × → Enter 1: query `''`, × absent, active = `arrangement-library-search`. Enter 2: no change, clips 0 → 0. The selection was back on `demo-hero-music` after the clear, so the hazard was armed. |
| LF-MOUSE (1280) | PASS | Mouse ◀ → active ▶; Enter → expanded, active ◀, 0 clips. Mouse ◀ then mouse ▶ → active ◀; Enter → collapsed, active ▶, 0 clips. `mid` then mouse × → active = search input; Enter → 0 clips. |
| LF-HOLD (1280) | PASS | **Method:** Playwright `keyboard.down` + 600 ms + `up` emits **0** `repeat` keydowns (one non-repeat keydown only), so C used CDP `Input.dispatchKeyEvent` `keyDown` with `text:'\r'`, `windowsVirtualKeyCode:13`, 1 normal + 10 `autoRepeat:true` at 50 ms, then `keyUp`.<br>• **Control:** the same CDP hold on an unguarded tree toggle (`button[aria-expanded]`) produced **11 clicks**, so repeats really do activate buttons.<br>• **◀:** 10 repeat keydowns, all 10 `defaultPrevented`, **1 click, 1** `data-collapsed` mutation (→ true), focus ends on ▶, clips 0.<br>• **▶:** the same (1 mutation → false), focus ends on ◀.<br>• **×:** 1 click; the repeats land on the search input (a typing target), and clips stay 0.<br>`out/lf-hold.json` |
| LF-VIDEO-NEUTRAL (1440) | PASS | `activeElement` after each step (`out/lf-video.json`):<br>(a) collapsed + Play → mouse ⤢: library expanded, video floating, active = ⤢ (the mouse focused it) → refocus Play → mouse ✕: library re-collapsed, active = ⤢. That is the dock's own refocus rule, because the mouse click focused ✕.<br>(b) ⤢, then Escape with focus left on ⤢ → re-collapsed, active ⤢.<br>(c) ⤢, refocus Play, Escape → re-collapsed, active **Play**.<br>The library never moved focus to ◀ or ▶. |
| FV-710 (1440) | PASS | Expanded library → mouse ⤢ (float) → focus ◀ → Enter: library collapsed, video returned (`expanded=false`, `floating=false`), active = **▶** (not ⤢). Enter 2 → expanded, active ◀. Clips 0. |
| LF-SWEEP-NEG (1280, 1440) | PASS | Ran B's `video-focus-probe.cjs` from `c-round-110/sweep/`. Placeholder „დაბრუნება“, float ✕ and ⤢: after Enter 1, active = ⤢; Enter 2 → clips 0 at both viewports.<br>Pan reset (recorded only; deferred Low): a mouse click leaves active = `arrangement-track-pan`.<br>pageerrors [] (this script listens for pageerrors only). `sweep/video-focus-probe-result.json` |
| R12-L2-ENTER-ADD (1280) | PASS | Focus Middle East option + Enter → clips 0 → **1**. Status: „Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე. `out/reg.json` |
| REG-LIB (1280; animation also 1440) | PASS | • ArrowDown → `demo-hero-music`, ArrowUp → `demo-middle-east`.<br>• Escape in search: query cleared, focus stays in the input.<br>• Separator: ArrowRight 288 → 304, ArrowLeft → 288 (`aria-valuenow` and rect width).<br>• Per-frame sampling over 900 ms, 55 frames, mouse and keyboard ◀/▶: width 288 → 40 and 40 → 288 with **19 distinct intermediate widths** (animated). Aside `scrollLeft` = **0 in every frame** (A's preventScroll claim holds), and `scrollTop` = 0.<br>Both viewports. |
| PX-NET | PASS | 20 instrumented sessions: **0** requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and **0** `Authorization` headers. |
| REG-HYD | PASS | 20 sessions: 0 hydration warnings, 0 pageerrors, 0 non-noise console errors. 38 noise errors in total (cart / connection refused; expected in the cloud). The noise filter excludes hydration texts. |
| G110-3 (run alone, last) | PASS (fake-Bearer sub-check BLOCKED) | • The header link "Studio Lab Demo" (`/studio-lab`) opens the workspace with the badge „დემო კოლექცია — ავტორიზაცია არ სჭი…“.<br>• `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.<br>• Anonymous `/api/studio-token?product=middle-east&file=stem1.wav` → **401** („Please sign in to access Studio.“). Without parameters it returns 400 (parameter validation, before auth). Round 109's check used the parameters.<br>• Attempt 1 crashed in C's script: "execution context destroyed" during the home-page load. Retried with a `load` wait and passed. Both logs are kept (`out/log-g110-3-attempt1.txt`, `out/log-g110-3.txt`, `out/g110-3.json`, `out/token.json`). |
| AN-REVIEW (offline) | PASS | C's own mutation strings (`tools/mutate.cjs`, scratch copy, own Vite `cacheDir`):<br>• control before: 13/13 green.<br>• **fail-before** (B snapshot): red LF1, LF2, LF3, LF4, LF8, LF9, LF10, LF11, which matches A.<br>• **m1** (both `focus` calls → `void`): red LF1, LF2, LF3, LF4, LF9, LF10, LF11.<br>• **m2** (arm unconditionally): red **only LF5b**.<br>• **m4** (guard only on ×): red LF8, LF9.<br>• control after: 13/13 green.<br>LF4 counts clips through the context (`arrangement.clips.length`) and `[data-clip-id]`. The test file has no `as`, `@ts-` or `any`; its assertions are 43 `toBe` and 2 `toEqual`. `out/mutations.json` |
| T110-TARGETED (offline) | PASS | C's grep gives 12 files, identical to A's grep; with `self-disabling-focus.test.tsx` appended, 13. In scratch: **13 files, 309 tests, all pass**. `floating-video`, `render-budget` and `self-disabling-focus` are included. `out/log-targeted.txt`, `out/c-grep-list.txt` |
| DOC-095 / DOC-094-L4 (offline) | PASS | Doc 095 has the TEMPLATE sections (თარიღი/სტატუსი/პროექტი, კონტექსტი, მიდგომა, არქიტექტურა with a Mermaid sequence diagram, ფაილები, პრობლემები, ტესტირება, TODO), the F1 table, F2 and the rejected alternatives. It records the preventScroll deviation, S3 and S5.<br>Doc 094: `git diff` changes only l.4, now „Round 109 — C PASS, გამოქვეყნებულია `1fe3ba2`-ში (gate 109 …)“. |
| SOURCE-UNCHANGED | PASS | Start and end:<br>• HEAD `1fe3ba2`; status = exactly 2 M + 2 ?? (the four owned paths).<br>• Frozen list 544/544 OK.<br>• A's `end-hashes.txt` matches 4/4.<br>• Protected hashes unchanged: studio.$productId fa2cf0bc, api.studio-token 13914809, StudioContext caa388e7, ffmpeg 0995ae78, Modal 741c2341, mp3-encoder ddb70919, root c4793004, entry.client b804dc00, auth 56f5b76f, AuthContext bf9ee257, firebase.client 23468664, types/auth 280fe7f2, package.json cf14e3b1, lockfile 74a5f435, StudioWorkspace e83fa485, ArrangementContext 3c02b824.<br>• The `ArrangementLibrary.tsx` diff against the snapshot adds only an import, refs, the layout effect, the handlers and `ref`/`onClick`/`onKeyDown` on ◀/▶/×/input. No class, label, title or testid change. |

**Gate rows** (not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Bugs

### C-R110-01 — Medium — Escape from a video-opened library drops focus to BODY; the next Enter adds a clip (A's reviewer S5, independently reproduced)
- **Steps** (1440×900; also reproduced at 1280×720):
  1. Fresh `/studio-lab` → Decline.
  2. Focus the Middle East option, then ArrowDown (CZABA hero selected).
  3. Mouse ◀ (collapse the library).
  4. Mouse ⤢ (the library opens temporarily for the floating video).
  5. Focus ◀, or the selected option.
  6. Press Escape.
  7. Press Enter.
- **Expected:** Escape returns the video and re-collapses the library without stranding focus on BODY; the next Enter adds nothing.
- **Actual:** after Escape, the library is collapsed and `activeElement` = BODY. Enter → clips **0 → 1** („CZABA hero — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.). It reproduces for both ◀ and the option at 1440, and for ◀ at 1280.
- **Evidence:** `c-round-110/out/lf-video.json` (`s5-collapse-button`, `s5-option`), `c-round-110/out/reg.json` (`s5_1280`), `c-round-110/shots/s5-*.png`.
- **Pre-existing:** argued, not confirmed in a browser. The collapse goes through the frozen `returnFloatingVideo` and never arms round 110's ref, and the dev server cannot serve the snapshot. It is the same class as B-R108-LIB-FOCUS-LOSS, but outside D-29z75's scope, so it does not fail a round-110 row. B should schedule it; it touches the frozen `StudioWorkspace.tsx` or the dock, or the B-R107-ENTER-ON-BODY decision.

### Not filed by C
- **Reviewer S3 (Low):** a stale arm if the parent refuses without re-rendering. It is not reachable with the current parent, so there is no browser repro. It stays A's note for B.

## Ableton correspondence
- **Library keyboard focus:** არ ეხება (B §3). Live has no DOM focus model, and no Ableton claim is made.
- **CZABA requirement:** met (rows above).

## Other notes
- `root-pre-push-review.md` and `publication-checkpoint.json` are the round-3 era review (2026-10-07). Its RF3-1/RF3-2/R5-L6 items are tracked in the backlog and are unrelated to round 110. C ran no new check for them this round.
- **Architecture signal (A's reviewer, info):** the arm-then-layout-effect focus handoff now exists in Transport and Library, with differing "action took effect" checks. B already recorded it as ARCH-R110-FOCUS-HANDOFF-THIRD-FILE.

- **For B:** anonymous `/api/studio-token` without `product`/`file` returns 400, because parameter validation runs before auth. The G110-3 "401" criterion needs valid parameters. The scratch folder `c-round-110/mut/` is git-ignored (`loop/**/mut/`).

STATUS: DONE. C round 110 is complete; no restart is needed.
