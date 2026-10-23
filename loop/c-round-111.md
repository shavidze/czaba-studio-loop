# C — Round 111 verification: Escape returning the floating video keeps focus in the library (C-R110-01, D-29z76)

**Verdict: PASS** · browserVerified = realVerified = **true** · 0 bugs · Date 2026-10-23 (~14:20–14:30 UTC)
Env: `env-status.json` → store 200 (round 111). Real Chromium (Playwright), a fresh incognito context per row, no credentials, no storage state (`c-browse.json`). Retry wrapper never triggered (no first-load failure).

## Source state (start and end, identical)
- HEAD `832fee2`; status = 2 M + 2 ?? (StudioWorkspace.tsx, doc 095; new test, doc 096). Frozen list 545/545 OK. End hashes = A's `end-hashes.txt` (`c-round-111/out/source-end.txt`).
- Diff vs B snapshot: exactly the four allowed parts (helper `libraryRailExpandButton`, ref `pendingLibraryRailFocusRef`, arm in the `libraryOpenedForVideo` branch, deps-free layout effect); +22/-0. Doc 095: only l.4 → "Round 110 — C PASS, გამოქვეყნებულია `832fee2`-ში (gate 110 …)".

## Browser rows (`c-round-111/tools/vr.cjs`, `out/vr.json`, `shots/*.png`)
Setup each row: `/studio-lab` → Decline → wait no „იტვირთება…“ → focus Middle East → ArrowDown (CZABA hero selected). "Opened for video" = mouse ◀ then mouse ⤢.

| Row | Measured | Result |
|---|---|---|
| VR-HAZARD 1280 / 1440 | after Escape: BODY, collapsed=true, videoExpanded=false, videoFloating=false; Enter → clips 0→1 („CZABA hero … დაემატა მუსიკა ხაზზე 00:00.000-ზე“) | PASS (oracle live; rescue not fired from outside) |
| VR-ESC-BUTTON 1280 / 1440 | Escape → ▶ (`arrangement-library-expand`), collapsed, docked, 0 clips; Enter 1 → ◀, expanded, video still docked (false/false), 0; Enter 2 → ▶, collapsed, 0 | PASS |
| VR-ESC-OPTION 1280 / 1440 | Escape → ▶, collapsed, docked; Enter → 0 clips (library expands, focus ◀) | PASS |
| VR-SCROLL 1280 | 55 rAF frames over 900 ms: maxScrollLeft 0, maxScrollTop 0; width 288 → 40 (19 distinct widths) | PASS |
| VR-OUTSIDE 1440 | (a) mouse ✕ → ⤢; (b) Escape from ⤢ → ⤢; (c) Escape from Play → Play; (d) `focus()` ✕ → Escape → ⤢ (also with real Tab navigation to ✕ → ⤢). ▶ never focused. Identical to c-round-110. | PASS |
| VR-SEARCH 1440 | `mid` → Escape 1: query "", focus input, video still floating, library expanded; Escape 2: no change | PASS |
| VR-NOT-FOR-VIDEO 1440 | docked, library expanded, focus is the *same node* (`[role=option]` demo-hero-music, `sameNode: true`, `out/nfv-identity.json`) | PASS |
| FV-710 1440 | Enter on ◀ → ▶, collapsed, docked; Enter 2 → ◀, 0 clips | PASS (unchanged) |
| LF-QUICK 1280 | collapse: ◀→▶→◀; expand: ▶→◀→▶; clear: × → search, query "" → Enter 2 nothing; 0 clips throughout | PASS (= round 110) |
| R12-L2-ENTER-ADD 1280 | Enter on focused option → clips 0→1 | PASS |
| PX-NET | all 20 sessions + G111-3: 0 forbidden requests, 0 Authorization headers | PASS |
| REG-HYD | 20 Studio sessions: 0 hydration, 0 pageerror, 0 non-noise console errors (2 expected cart/connection noise per session). G111-3 session monitored pageerror/network only (0), as in round 110 | PASS |
| G111-3 (alone, last) | header `/studio-lab` → workspace + „დემო კოლექცია — ავტორიზაცია არ სჭი…“; `/studio/middle-east` → "Sign in required", no workspace, 0 `audio[src]`; `/api/studio-token?product=middle-east&file=stem1.wav` → **401** (no params → 400, informational) | PASS; fake-Bearer BLOCKED (backend unavailable in cloud) |

## Offline rows
- **AN-REVIEW:** 10 tests (VR0, 1, 2, 3a, 3b, 4, 4b, 5, 6, 7); only `toBe`/`toEqual`; no `as`, `@ts-`, `any`; VR0/VR3 count clips via context API and `[data-clip-id]`. A's fail-before list matches §1 (VR3 split into 3a/3b). C's own mutation strings in scratch `c-round-111/mut/` (own cacheDir; scratch restored, sha = store): control 10/10 before/after; **c-m1** (arm RHS never true) red VR1, VR2, VR3a, VR3b, VR7; **c-m2** (arm always true) red VR0, VR4b; **c-m3** (c-m2 + guard always true) red VR0, VR4, VR4b. Same as A. VR4b red under m2 is consistent with the design (✕ unmounts, workspace effect beats dock cleanup). `out/mutations.json`.
- **T111-TARGETED:** C grep = 6 files (same as A's 6); A appended render-budget and self-disabling-focus → 8 files, **153/153** pass in scratch (`out/log-targeted.txt`).
- **DOC-096:** all TEMPLATE sections, rule (rescue never take), arm/rescue mechanism, `preventScroll` with the 243 px evidence, "does nothing" cases, rejected alternatives incl. B's blur-on-remove probe, Mermaid sequence, TODO (B-R107-ENTER-ON-BODY, shared helper). PASS. **DOC-095-L4:** PASS.

## Gate rows (not claimed)
full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Ableton correspondence
Keyboard focus after floating-video return: **არ ეხება** — Live has no floating video over the Browser nor a DOM focus model; no Ableton claim made.

## For B
- No new bugs. C-R110-01 can close.
- Still open: user question B-R107-ENTER-ON-BODY (VR-HAZARD shows Enter on BODY still adds a clip, by current contract). A's test VR0 asserts +1 and must change with any answer.
- Pass on A's reviewer Architecture note (focus-rescue pattern now at four sites; proposed `useArmedFocusRescue` extraction as a separate bounded task).
- Regression round is due at the next planning on/after 2026-10-24 (`regression-last.json` = 2026-10-21).
