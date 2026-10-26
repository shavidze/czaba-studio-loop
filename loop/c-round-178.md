# C — Round 178 verification: DUX-R-5b-3a (labels / status / hover / badge / Grid menu checks / Export note-progress-overload → neutral)

Date: 2026-10-26 · Verifier: C · Baseline `cc984b6` + A's working tree · Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, DPR 2, `--disable-lcd-text`, a fresh context per session, at 1440×900 and 1280×720.

## Verdict: **FAIL** (one Medium: the test-selector break). browserVerified = realVerified = **true**

- **The product change itself passes in the browser.** Every 5b-3a site renders neutral at both viewports. Each one has 0 brass pixels and contrast ≥ 4.5:1, and the badge border is 3.50:1. The refusal, all three export states, the Grid menu, the Library filter, Apply, 0 dB and panel collapse/expand behave as before.
- **The round cannot be published.** Two protected test files find the demo badge by the colour class `span.border-accent`, which W2 removes. Their 3 tests go red (C-R178-BADGE-SELECTOR), so the root gate's full vitest will fail.
- **No browser row was skipped**, so browserVerified stays true.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T178-TARGETED | **FAIL.** C re-ran `a-round-178/vitest-files.txt` plus `purchased-collection-ui`: 147/150, the same failures as A reports (LRS5, PW1, PW6). A's 143/144 + 4/6 matches. | `c-round-178/out/vitest-c.json` |
| SOURCE-SCOPE | **Needs B ruling.** The frozen list is OK at start and end. A's `end-sha256.txt` is OK. `git diff --name-only cc984b6` contains only the 12 grants, and the 2 new files are untracked. The tree hash at C's start equals the hash at C's end. But Biome reflowed l.2605 (1 → 4 lines) and l.676 (1 → 3 lines), so "StudioWorkspace exactly 5 lines / DetailPanel exactly 4" is literally not met. C read the hunks: the extra lines are whitespace-only reflow of the same tokens. §3.2 l.143 allowed for a Biome re-wrap. | `start-/end-tree-sha256.txt` |
| AN-REVIEW | **Needs B ruling** (same reflow). C also read the untracked files. N1 has DXL1–DXL8 (10 tests) and labelled throws; it has no `any`, `@ts-ignore` or type assertion. Its no-brass helper exempts only `focus-visible:ring-brand`, and its DXL8 kept `accent-brand` count is 5. D2 (doc 147) is in Georgian, has the TEMPLATE sections, and its status is In Progress. Every token is exactly as in P1–P4, W1–W5, Y1, G1–G3, E1–E3, L1–L6 and D1. Nothing else changed: no other attribute, text, hex or style. The §0.2 kept sites and the 5b-3b sites are untouched. | `git diff cc984b6` |
| INVENTORY-GREP | **PASS**, with 1 unclassified hit for B. All 16 5b-3a sites no longer match. The remaining non-K hits are the 5b-3b lines only (Lane 723/731/842/874/886–887/922–923, LibraryPreview 332). One unclassified hit: **GroupHeader l.252**, `border border-brand` on the group-name rename input. It is unchanged since `cc984b6`; B's note said l.252 held only the ring. | `out/inventory-raw.json` |
| CC-TEXT | **PASS** at both viewports. Group count, selection count, refusal, Library filter value, Export empty note, overload alert and Grid check glyphs (the span colour and the svg stroke) are all rgb(236,230,218). The Delete hint and the badge text are rgb(163,155,142); the badge border is rgb(115,107,96). The exit link is muted at rest and rgb(236,230,218) under real-mouse hover. Apply, 0 dB and the panel toggle are enabled and rgb(236,230,218) under hover. Their fill step is unchanged (`/0.05` → `/0.08`). The progress `accent-color` is rgb(236,230,218). | `out/c178-1440-4.json`, `out/c178-1280-5.json` |
| NO-BRASS-TEXT | **PASS.** 0 brass pixels in every region at both viewports, for example: badge 0/17920, exit hover 0/4896, Apply hover 0/7744 (1280: 0/7392), 0 dB 0/3872, toggle 0/6336, Delete hint 0/15860, selection count 0/4704, group count 0/15568, filter 0/11024, Grid checks 0/480 each, refusal 0/11388, empty note 0/34848, overload 0/73568. The progress bar during a real WAV export was 0/10824 at both viewports; these scans come from runs 1440-3 and 1280-1, captured under 20× CPU throttling. | shots `c-round-178/shots/c178-*` |
| CONTRAST-TEXT | **PASS.** Foreground text: 14.78 over surface, and 12.42 over the hover fill of the Detail buttons. Muted text (hint, badge, exit at rest): 6.68. Badge border: 3.50. These match B's §0.1 predictions. | same |
| REFUSAL | **PASS** at both viewports. A real-mouse, purely vertical drag of the Music clip onto the Video lane shows "Audio does not move to the video track ·" in rgb(236,230,218), 14.78:1, with 0 brass (ghosts excluded). On release, the clip signature is unchanged. Note: Escape does not cancel a drag (pre-existing). A drag with a horizontal part leaves the clip at its "last free spot" (seen in run 1440-2). | `refusal-during.png` |
| EXPORT-STATES | **PASS**, (a), (b) and (c) at both viewports. (a) The empty project shows the note and Export is disabled. (b) The progress bar is present during rendering. The WAV is 24-bit, 48 kHz, stereo, 102.352 s (= music end, 1 s + 101.352 s), with 0 NaN. (c) Clip +24 dB and Master +6 dB give an alert with `role=alert`: "Overload: peak +30.0 dBFS — 7485040 samples clipped…", which is neutral, not destructive. Note: a plain export at 0 dB already clips 1024 samples where the beeps, SFX and music overlap, and shows the alert. This is the existing detection, not a regression. | `out/*.wav` |
| FUNC-SMOKE-TEXT | **PASS.** Grid menu by mouse: Snap on, then 1/8 is chosen (the check moves, the menu closes). By keyboard: ArrowDown to "Snap (G)" and Enter toggles off, then on. A snapped drag of +0.37 s lands at 3.25 (on the 0.25 s grid at 120 BPM); Undo returns it to 3.0. Library filter: on shows 4 options, off ("All") shows 9. Apply "Set selection" with 2.5–3.5 gives the range readout. 0 dB: 3.0 → 0.0. Panel collapse and expand work. The exit link has `href="/"`. 0 pageerror. | `func` in the run JSONs |
| ENV-VIS | **PASS.** 6 states at both viewports, every cell ≥ 3:1, 0 drops against round 177. | `out/env/*`, cmp output |
| RV1-DUX5B3A | **PASS.** S0/S1/S2 vs round 177: 0 missing, 0 added, max box delta 0. The contrast failing set is identical. The only changed key is the demo badge (rgb(201,164,106) → rgb(163,155,142), 7.88 → 6.68), a 5b-3a site. | `out/rv1-dux5b3a.json` |
| RV3-STORE | **PASS.** 0 hex in `app/components/arrangement/`. `/cart` is pixel-identical to round 177 at both viewports. On `/`, the header band is identical; the differences sit in the full-bleed hero video frame only (diff bbox y ≥ 81). Tokens and body background are unchanged. No store file changed. The `/` pixel row in `rv3-store.json` (4.3–4.8 %) compares against round 177's intro-splash shot. `storehome178.json` supersedes it. | `out/rv3-store.json`, `out/storehome178.json` |
| G178-3 | **PASS.** Anonymous `/studio-lab` shows the neutral "Demo collection — no sign-in required" badge, with no `auth_user` and 0 cookies. `/studio/middle-east` (1440 and 1280) shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud). | `out/g178-3.json` |
| PX-NET / REG-HYD | **PASS** in every valid session (c178, env, d6, g178-3): 0 forbidden hosts, 0 Authorization headers, 0 hydration messages, 0 pageerror. Only the cart noise (2 per session). | `net` fields |

## Bug for B
**C-R178-BADGE-SELECTOR (Medium).**
- **Repro:** `npx vitest run app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` → LRS5, PW1 and PW6 are red. Both suites use `querySelector('span.border-accent')` (l.330 and l.230).
- **Scope (C grep + run):** C ran all 11 protected suites that match the removed tokens or are named in §2 (`export-progress-ui`, `workspace-strings-ui`): 105/108. Only these 3 tests fail (`out/vitest-scope.json`).
- **Why:** it is a selector tied to a colour class. The badge itself renders correctly in the browser.
- **Fix:** test-only, in protected files, so it needs a B grant. Locate the badge by its text (`workspaceCollectionCopy(origin).badge`) or by a data-testid.
- **Planning note:** `purchased-collection-ui` was not in B's base or neighbour lists.
- **Severity:** Medium, not Low, because it blocks the root gate.

## For B (info)
- **GroupHeader l.252** `border-brand` (rename input) is not classified in §0.3.
- **Exports clip at 0 dB.** The S1 mix clips at 0 dB (1024 samples), so the overload alert appears on a plain export. This is pre-existing, recorded for context.
- **Escape does not cancel a clip drag.** Pre-existing.
- **Architecture note:** A's code-reviewer note (shared harness, normalised source counts, no colour-class selectors) is confirmed by this exact failure.

## Ableton
Parity is **not applicable / unverified** (§5). No Live 12 source was captured for status-text colours; this is a CZABA DUX-R-5 rule. Behaviour rows were checked as unchanged only.

## Harness notes
- **Discarded:**
  - 1440-1: the ENV-FIRST-LOAD crash.
  - 1440-2/3 and 1280-1..4: C selector bugs (the Library tree node, and a Grid-menu click point off-screen at 1280).
- **Complete runs:** 1440-4 and 1280-5. The progress-bar pixel scans come from 1440-3 and 1280-1.
- **Misplaced screenshots:** the store-baseline run 1 wrote screenshots into `store/shots/`. They were moved to `c-round-178/shots/storebase178-run1-misplaced/` before the end hash; the end hash equals the start hash.
- **WAVs:** duplicates from discarded runs were deleted; their hashes stay in the run JSONs.
- **Read-only:** no app source was edited, and nothing was committed.
