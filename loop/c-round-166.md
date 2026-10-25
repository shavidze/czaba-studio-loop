# C round 166: V-3c-3b verification (D-29z131)

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. The only BLOCKED item is the fake-Bearer 403 (backend unavailable in cloud).
Env: `env-status.json` store 200 (13:54:56Z). Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720. Fonts were ready in every valid session, with 0 non-200 Google Fonts responses.
Ableton parity: **not applicable**. Task §5 says this is a CZABA brand decision, so no Ableton claim was made or checked.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T166-TARGETED | PASS: 211/211, the same as A's `vitest-after.json`. MS4, DPS5, TU11, TS7 and LG4 are present and passed. This is the targeted 11-file run only, not the full suite. | `c-round-166/out/vitest-c.json` |
| SOURCE-SCOPE | PASS: HEAD `7581483`. The 973 frozen files were OK at start and at end. The 12 end hashes equal `a-round-166/end-sha256.txt` at start and at end. `git status` shows 11 ` M` + 1 `??` (doc 135). The protected diff vs `7581483` is empty. No source changed during C's phase. | shell |
| AN-REVIEW | PASS: C made its own diff vs `b-round-165/r166-granted-start/`. Details below. | `c-round-166/out/c-diff.patch` |
| ICON-V3C3B 1440/1280 | PASS | `out/icon/icon-1440-2.json`, `icon-1280-1.json`, `shots/icon/` |
| ICON-BOX 1440/1280 | PASS: max 0.468 px, 0 added and 0 missing keys in all 6 states | same |
| RV1-V3C3B 1440/1280 | PASS | `out/d6/d6-{1440,1280}-r1.json`, `out/rv1-v3c3b.json`, `tools/cmp-d6-166.cjs` |
| FUNC-SMOKE-V3C3B 1440/1280 | PASS | `out/func/func-{1440,1280}-1.json`, `shots/func/` |
| G166-3 | PASS. The fake-Bearer 403 is BLOCKED (backend unavailable in cloud). | `out/g166-3.json` |
| PX-NET / REG-HYD | PASS: 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror in every valid session. Only the expected cart noise appeared. | the `net` fields in each JSON |

**Invalid run (replaced):** c166-icon 1440 attempt 1 got a white page on the cold-Vite first load, after the grid control had appeared. This is ENV-FIRST-LOAD-LUCIDE, the one allowed replacement. The screenshot is kept as `shots/icon/INVALID-coldload-…png`. Attempt 2 was valid.

## AN-REVIEW
- **ArrangementMarkerRow:**
  - K0 import added.
  - New `MARKER_STEP_BUTTON_CLASS` = `MARKER_HEADER_BUTTON_CLASS` + `inline-flex items-center justify-center`.
  - The base const and the `+` button are byte-identical.
  - Children ◀/▶ became ChevronLeft/Right (`size-2.25 shrink-0`, stroke 2.4, aria-hidden).
  - Handlers, aria, title and testid are unchanged.
- **ArrangementDetailPanel:**
  - P0 import added.
  - `px-2` → `pl-2 pr-1`, plus `inline-flex items-center gap-0.5`.
  - The icon branch follows `isCollapsed`.
  - Nothing else changed.
- **ArrangementGridMenu:**
  - G0 import added.
  - 3 spans: `w-3 text-accent` → `flex w-3 justify-center text-accent`.
  - Each span renders `cond ? <Check …/> : null`.
- **StudioWorkspace:** exactly 2 hunks, W0 (import) and W1 (exit link class + children).
- **strings.ts:** only `expandText`/`collapseText`.
- **Tests:**
  - The only removed lines are the 3 glyph expectations named in the task (l.206/215 and the `.replace('✓','')`).
  - `expect(` counts went 531→535, 33→48, 100→112, 25→40 and 56→67. None dropped.
- **Docs:** doc 134 changed only the status line. Doc 135 exists with all the TEMPLATE sections (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები, ტესტირება, TODO), and its status is In Progress.
- **Not present:** no `style=`, hex, arbitrary value, colour or surface change, and no pointer, keyboard or focus logic change.

## ICON-V3C3B (identical at 1440 and 1280; the S0/S1 toggle state is swapped between viewports, as expected)
| Site | svg class | Box | stroke-width | Stroke at rest → hover (= host color) | dx / dy | Text | CDP name |
|---|---|---|---|---|---|---|---|
| marker prev | lucide-chevron-left | 9×9 | 2.4 | muted rgb(163,155,142) → foreground rgb(236,230,218) | 0 / 0 | `''` | Previous marker (Ctrl+←) |
| marker next | lucide-chevron-right | 9×9 | 2.4 | same | 0 / 0 | `''` | Next marker (Ctrl+→) |
| marker add | no svg | — | — | — | — | `+` | Add marker (M) |
| detail toggle, open | lucide-chevron-down | 10×10 | 2.4 | foreground → brand rgb(201,164,106) | 27 / 0 | `Collapse` | Collapse details |
| detail toggle, collapsed | lucide-chevron-right | 10×10 | 2.4 | foreground → brand | 24 / 0 | `Expand` | Expand details |
| grid check, checked item only | lucide-check | 10×10 | 2.4 | accent rgb(201,164,106), also on hover | 0 / 0 (in the span) | — | division labels / `Snap (G)` unchanged |
| exit link | lucide-arrow-left | 12×12 | 2 | muted → brand | −25 / 0 | `CZABA` | link "CZABA" |

- **Grid menu:**
  - Default: only `1 s` has a check, and every other span is empty.
  - After clicking Snap: status `Snap on — grid 1 s (G)`. On reopen, `Snap (G)` has a check and `1 s` still has one.
  - The menu `textContent` contains no ✓.
- **Glyphs:** no `◀▶▸▾✓←` remain in any host.
- **Screenshots:** `shots/icon/icon-{W}-{S0,S1,S2,S2-snapToggled}-*.png`.
- **4× crops:** `shots/icon/crop4x-{W}-{marker-header,toggle,toggle-other,exit}-*.png`. C inspected them visually: the chevrons, the check and the arrow are crisp and centred.

## ICON-BOX: raw rects vs B's `b-round-165/out/v3c3b-final.json` "before" (`measure()` copied unchanged)
| VP | State | Ref keys | Cur keys | Added/missing | Max edge Δ | Moved |
|---|---|---|---|---|---|---|
| 1440 | S0 | 148 | 148 | 0/0 | 0.468 | next x −0.234 w −0.234; prev w −0.234; exit w +0.266; toggle x +0.031 w −0.031; header label w +0.031 |
| 1440 | S1 | 137 | 137 | 0/0 | 0.468 | same |
| 1440 | S2 | 157 | 157 | 0/0 | 0.468 | same |
| 1280 | S0 | 137 | 137 | 0/0 | 0.468 | same |
| 1280 | S1 | 148 | 148 | 0/0 | 0.468 | same |
| 1280 | S2 | 146 | 146 | 0/0 | 0.468 | same |

These values are identical to B's simulation. No element moved more than 1 px.

## RV1-V3C3B: d6.cjs (sha256 `3abc88fe…`, copied unchanged), one run per viewport, vs `c-round-164/out/d6/d6-{W}-r1.json` with the 6-key rename map
| VP | State / section | Ref | Cur | Missing | Added | Max Δ | >1 px |
|---|---|---|---|---|---|---|---|
| 1440 | S0 / S1 / S2 boxes | 111 / 122 / 131 | same | 0 | 0 | 0.5 (exit, d6 rounds to 0.5) | 0 |
| 1440 | contrast S0 / S1 | 170 / 188 | same | 0 | 0 | box 0 | — |
| 1280 | S0 / S1 / S2 boxes | 103 / 121 / 130 | same | 0 | 0 | 0.5 (exit) | 0 |
| 1280 | contrast S0 / S1 | 144 / 177 | same | 0 | 0 | box 0 | — |

- **Collisions:** none.
- **Contrast:** every fg, bg, ratio and pass value is unchanged.
- **Failing contrast entries:** the set is identical to the reference. These are the pre-existing disabled Undo/Redo/Split/Delete/Loop, zoom-back and metronome entries; none is new.
- **Marker prev/next:** now class `icon>=3` with ratio 6.68:1 (previously `normal>=4.5`, also 6.68). This is the note-only class change.
- **Toggle:** 14.78. **Exit link:** 6.68.

## FUNC-SMOKE-V3C3B (every pointer action started at the svg centre; `elementFromPoint` hit the svg in every case)
| Check | 1440 | 1280 |
|---|---|---|
| Markers added at 2 and 6 (M + name + Enter) | [2,6] | [2,6] |
| From 0: ChevronRight → 2.000, ChevronRight → 6.000, ChevronLeft → 2.000; focus stays on the button | 2 / 6 / 2, focus next/next/prev | same |
| Ctrl+→ / Ctrl+← | 6 / 2 | 6 / 2 |
| `+` at 4 s, then Enter | [2,4,6], "Marker “Marker 1” added at 00:04.000." | same |
| Toggle: svg click ×2, then Enter, then Space | open → collapsed → open → collapsed → open. Each state shows the right icon, text, aria-label, aria-expanded and data-collapsed. | starts collapsed; alternates correctly |
| Grid (BPM 120): click the `1/8` label, reopen | status "Grid: 1/8 · 0.25 s at 120 BPM"; check on 1/8 only | same |
| Snap item | off → on, status "Snap on — grid 1/8 (G)"; reopen: Snap checked | same |
| ArrowDown + Enter | 1/8 → 1/16, status updated, menu closes; reopen: check on 1/16 + Snap | same |
| Esc | menu closes | same |
| Audio: demo-middle-east on music at 0, Play | playhead 1.471 s after 1.5 s; tap peak 0.374; ctx running | 1.462 s; peak 0.374 |
| Exit link (fresh context): href `/`, real click on the ArrowLeft svg | path `/`; workspace gone | same |

## G166-3
- `/studio-lab` loads anonymously: no `auth_user`, 0 cookies, workspace shown, badge "Demo collection — no sign-in required".
- `/studio/middle-east` shows "Sign in required" at 1440 and 1280, with no workspace and 0 `audio[src]`.
- `GET /api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`.
- 0 forbidden requests, 0 Authorization headers, 0 errors.
- Fake-Bearer 403: BLOCKED (backend unavailable in cloud).

## Notes for B (not findings)
- **R3:** the exit link's accessible name is now "CZABA" (confirmed in CDP). Saba can veto this ruling.
- **Triplets (3):** its checked-state check icon was not exercised in the browser. Only its empty unchecked span was seen. The checked state is covered by vitest TU11 only.
- **Root:** may publish round 166 on the C PASS (the 11 changed grants + doc 135). Doc 135's status line still says "In Progress (awaiting C round 166)"; B or root updates it in a later round, as with doc 134.
