# C — Round 179 verification: C-R178-BADGE-SELECTOR fix-up (test-only)

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. 1 sub-check BLOCKED (fake-Bearer 403: backend unavailable in cloud). Gate rows are left to root.
Date: 2026-10-26. Env: `env-status.json` store 200 (round 179). Evidence folder: `c-round-179/`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T179-TARGETED | **PASS**: 14 files, **150/150**, 0 failed. `a-round-179/vitest-files.txt` is identical to `b-round-178-r179-vitest-base.txt`. | `c-round-179/out/vitest-c.json`, `vitest-c.log` |
| SCOPE-179 | **PASS**. Against `c-round-178/end-tree-sha256.txt` (1003 files, same file set), only the 3 grant paths differ. Frozen list (1000) OK at C start and C end. A's `end-sha256.txt` OK. `git status`: 14 ` M` + 2 `??`. HEAD `cc984b6`. `git diff cc984b6` on routes, styles, `components/studio`, contexts, auth.ts, firebase.client.ts, root.tsx and `.claude`: empty. Tree hash at C start = C end = `1166c25a…667f4e`. | `c-round-179/start-tree-sha256.txt`, `end-tree-sha256.txt` |
| AN-REVIEW-179 | **PASS**. C recomputed the diff against `b-round-178/r179-granted-start/` (start copies match B's start hashes). It is byte-identical to A's `diff-vs-start.patch`. F1: `badgeText()` filters header spans by trimmed text ∈ {PURCHASED_BADGE, DEMO_BADGE}, throws `'header shows more than one collection badge'` on >1, returns `null` on none. No class token. F2: labelled `Error('workspace header missing')` then `within(header).getByText(DEMO_BADGE, { selector: 'span' })` (getByText throws if missing, so the test cannot pass vacuously). PW1 l.303-306, including both `not.toContain` lines, and PW6 l.391 are unchanged. F3: doc 147 gets status → awaiting C round 179, one Problem→Solution entry, the Round 179 file list, counts + m288–m290, and the Biome reflow sentence. Nothing else changed. Colour-selector regex on both files: **0 hits**. | `c-round-179/out/c-diff-vs-start.txt` |
| MUT-179 (read-only) | **PASS**. m288 (`'demo'`): 149/150, only PW1 red; LRS5 and PW6 green. m289 (`{''}`): 146/150, with LRS5, PW1, PW6 and DXL3 red. m290 (`border-outline-strong`→`border-accent`): 148/150, DXL3 and DXL8 red; LRS5, PW1, PW6 and DXT8 green. Each diff is exactly the described one-line edit at StudioWorkspace l.2209/l.2210. All 3 restore shas = `316f7c51…` = frozen-list entry; `restoreShaCheck` OK. The diff base `a-round-179/tools/StudioWorkspace.backup.tsx` also hashes to `316f7c51…` (the frozen hash), so each one-line diff is the only change that was applied. C did not mutate source. | `a-round-179/mutations/m288–m290.{json,diff}` |
| HASH-CARRY | **PASS**. Every non-test file (components, routes, styles, `collection.ts`, everything except the 3 grants) has the same hash as in `c-round-178/end-tree-sha256.txt`. The 13 round-178 browser rows therefore carry over to the combined 178+179 tree: INVENTORY-GREP, CC-TEXT, NO-BRASS-TEXT, CONTRAST-TEXT, REFUSAL, EXPORT-STATES (a/b/c), FUNC-SMOKE-TEXT, ENV-VIS, RV1-DUX5B3A, RV3-STORE, G178-3, PX-NET and REG-HYD. | sha256sum -c output (3 FAILED = grants only) |
| BADGE-BROWSER | **PASS at both viewports** (DPR 2, `--disable-lcd-text`, fresh anonymous context). Exactly 1 header span reads "Demo collection — no sign-in required". color rgb(163,155,142), border rgb(115,107,96). Text contrast vs header 6.68:1 (≥4.5) and border 3.5:1 (≥3). R−B≥45 scan over 19 888 device px: **0 brass px**. 1440×900 and 1280×720 values are identical. | `c-round-179/out/c179-1440-2.json`, `c179-1280-1.json`, `shots/c179-*/badge-crop.png` |
| G179-3 | **PASS**, with 1 sub-check BLOCKED. `/studio-lab` opens with `auth_user` null and 0 cookies; workspace and the demo badge show. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?product=middle-east&file=stem1.wav` → **401** `{"error":"Please sign in to access Studio."}`. Premium auth is not bypassed. The fake-Bearer 403 check is BLOCKED: backend unavailable in cloud. | `c-round-179/out/g179-3.json`, `shots/g179-3-*.png` |
| FUNC-SMOKE-179 | **PASS** (both viewports; 1440 is required). Enter on Library "demo-middle-east" with Music active added the clip at 0.000 (status "…added to the Music track at 00:00.000."; width 101.352 s). Space → 1 s → Space: the playhead advanced 0.98 s (1440) and 0.972 s (1280), then stayed still after stop. A real output tap (an AnalyserNode on the destination connection) measured peak 0.297 during play. AudioContext was running at 44.1 kHz. **Extra at 1440:** a project WAV export gave status "WAV created: 01:41.352, 24-bit · 48 kHz · stereo". The file is PCM 24-bit/48 kHz/2 ch, 4 864 896 frames = **101.352 s**, which matches the clip exactly. 0 NaN; first 1 s peak 0.300 (non-silent), tail ≤ 0.0003. Ctrl+Z → "Undo: Add — Middle East…", and the clip list returned to empty. 0 pageerror. | `c179-1440-2.json` / `c179-1280-1.json` `func.smoke`; `out/c179-1440-2-proj-czaba-studio-lab.wav`; `shots/c179-*/after-add.png` |
| SELECTOR-SWEEP (info) | See below. | `c-round-179/out/selector-sweep-raw.txt` |
| PX-NET / REG-HYD | **PASS** in every valid session (1440 #2, 1280 #1, G179-3): 0 forbidden hosts, 0 Authorization headers, 0 hydration messages, 0 pageerror. Only cart noise (2 per session). | `netOk` in each JSON |

**ENV-FIRST-LOAD:** the first cold load at 1440 (attempt 1) crashed with "Invalid hook call" plus a hydration replacement. This is the known Vite cold-start dependency optimisation. Per the harness note, it was discarded and replaced once by attempt 2, which was clean. Kept as `out/c179-1440-1-invalid-firstload.*`. This is not a product finding.

## SELECTOR-SWEEP (input for 5b-3b grants; info, not a FAIL)
Tokens at the 5b-3b sites: Lane l.723/731 (`border-brand … text-brand`), l.842 (`ring-brand`/`ring-accent`), l.874 (`text-brand`/`text-accent`), l.886/887 and l.922/923 (`border-accent bg-accent/20 text-accent` / `border-brand bg-brand/15|/20 text-brand`), LibraryPreview l.332 (`border-brand … text-brand`).
- **DOM selectors** (`querySelector*`, `closest`, `getElementsByClassName`, `locator`) on these tokens in `app/**/__tests__` and `e2e/`: **0**. `e2e/` has 0 hits for any of these tokens.
- **Locks that go red when 5b-3b changes the sites. Grant these:**
  1. `affordance-colour-ui.test.tsx:159`: `LATER_STAGE_BRASS_SITES` `[LANE_PATH, "'border-accent bg-accent/20 text-accent'", 2]`. This is a source count of Lane l.886 + l.922 (its TODO already says "moves in DUX-R-5b-3").
  2. `lane-strings-ui.test.tsx:505`: `importIncludes = ['border', 'border-brand', 'text-brand', …LSU7_SURFACE_TOKENS]` on the rendered full "Your own video" import button (Lane l.731).
  3. `library-row-strings-ui.test.tsx:578–579`: the Preview "Add" button must include `border-brand` and `text-brand` (LibraryPreview l.332); the excludes are at l.586.
- **Absence locks (stay green unless a token is reintroduced):** `mode-toggle-colour-ui.test.tsx:472` and `:474` (LIBRARY_PREVIEW_PATH `'border-accent text-accent'` and `: 'text-brand'` = 0). `studio-theme-obsidian.test.tsx:244` is about LoopBrace, not Lane.
- **Not locked:** the compact import button (Lane l.723) is checked only for layout tokens (`lane-strings-ui` l.380–382). No test locks Lane l.842 `ring-brand`/`ring-accent` or l.874 `text-brand`/`text-accent`. That means 5b-3b needs new assertions there, not just grants.
- Other hits in the raw list (export dialog, transport, label-status, mixer, detail, metronome and others) belong to other sites, mostly kept `focus-visible:ring-brand`. They are not 5b-3b sites.

## Info notes for B
- **C-R179-DOC147-STALE:** doc 147 still has the round-178 "Solution: B must decide" entry and the l.124 TODO, next to the new round-179 entry. Annotate them when doc 147 moves to Completed. A's reviewer flagged the same thing.
- **C-R179-EXPORT-PEAK:** the export peak is 1.0. This is the same signal as the existing C-R178-EXPORT-CLIPS-AT-0DB, and the product code is unchanged.
- A's Architecture note (shared workspace mount/fakes harness, `findCollectionBadge`, a single token-assertion helper) is consistent with what C saw in SELECTOR-SWEEP: three suites lock colour tokens through className.

## Ableton
- How tests find the badge: **not applicable** (internal test hygiene).
- Badge colour: **unverified**. No Ableton source was captured; this is the CZABA DUX-R-5 rule.
- C makes no parity claim.

## Not C's (gate)
Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## C side effects
Source is read-only. C made no mutation. The tree hash is the same at start and end. Vitest output was written only under `c-round-179/out/`. The browser used fresh anonymous contexts, with demo local state only.
