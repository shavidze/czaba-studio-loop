# C round 146 — V-0.5a fix-up verification (C-R145-01 / ABL-B-1 + two test-strength Lows)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. Bugs: 1 Low, pre-existing and not caused by this round (C-R146-01 → `deferred_low_polish`). BLOCKED rows (backend unavailable in cloud): PURCHASED-LABEL and G146-3 fake-Bearer 403.
Environment: `env-status.json` round 146, store 200. Real Playwright Chromium (headless, installed) on `http://127.0.0.1:5173/studio-lab`, fresh context per session. Snap was `off` at start in every session. Both viewports: 1440×900 and 1280×720.
Evidence: `c-round-146/{tools,out,shots}/`, JSON in `c-round-146.json`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T146-TARGETED | PASS. C ran the 10 files itself: 128/128. Per-file counts equal A's: library-row-strings-ui 3, studio-lab-demo 13, collection 14, strings 48, library 12, collection-load-status 10, purchased-collection-ui 6, library-preview 7, held-enter-add 8, render-budget 7 | `out/vitest.json`, `out/vitest.log` |
| SOURCE-SCOPE | PASS. HEAD 9a67abd. Frozen list (960 entries) OK at start and at end. The 5 grants equal `a-round-146/end-sha256.txt` at start and end. Only the 5 grants differ from `a-round-145/end-sha256.txt`. `git status --short` = 17 entries (the round-145 set), identical at start and end. C's diff vs `b-round-145/r146-granted-start/` equals A's patch, and its `ArrangementLibrary.tsx` hunk is PM1 only. Protected-file diff vs 9a67abd is empty. No source changed during C's phase | `out/diff-vs-start.patch`, `out/git-status-{start,end}.txt` |
| AN-REVIEW | PASS. **PM1:** the marker span has className `whitespace-nowrap text-xs text-brand` and testid `arrangement-library-option-previewing`. It is the last child of the option button. The meta row's className and both children are unchanged. **LRS3** asserts parent = option, last child, meta row with 2 children and no `flex-wrap`, and the marker gone after stop, all with hand-written literals. **DL-VAL** asserts the exact label, notice and Set of collection labels with hand-written literals, plus the U+00B7/U+2014 codepoints. **PC2** asserts the three exact messages, which match `strings.ts` l.674–676. **Doc 119:** the status line matches §2 word for word. Only the §2 edits are present (one new Problem→Solution bullet, the m91 sentence, Testing, files), in Georgian. The round-145 result it states matches `c-round-145.json` | patch |
| PLAY-MARKER (a) | PASS at both viewports. The marker text is `▶ Playing`. Its box is [156, y, 110, 16]; the glyph Range is [156, y, 54, 15], one rect, right edge 210 ≤ 267. `elementFromPoint` at the glyph centre and at its right end returns the marker. Colour is the brand teal. At 1440 the option is [148,370,126,63.25] and the marker y is 411.25 = meta y + 16. At 1280 the option is [148,408,126,63.25] and the marker y is 449.25 | `shots/marker-{1440,1280}.png`, `shots/row-playing-*.png`, `shots/lib-previewing-*.png` |
| PLAY-MARKER (b) | PASS. The waveform `aria-valuenow` goes from 0 to 1 within about 0.7 s of the play click. `createBufferSource` count +1. AudioContext `running` at 44.1 kHz | `out/c146-*.json` m.previewSamples/audio |
| PLAY-MARKER (c) | PASS. Stopped at about 0.93 s, while the 2 s source was still playing (toggle showed `■ შეჩერება`, 1 marker). After the stop: 0 markers, and the option box returns to [148,370\|408,126,47.5], equal to its `ready` box | m.afterStop |
| PLAY-MARKER (d) | PASS. With Slow rise playing, the marker exists only in Slow rise and Soft impact has none. Playback advances. After the marker is scrolled into view, the glyph is fully visible and `elementFromPoint` returns the marker | m.slowRise, `shots/row-playing-slowrise-*.png` |
| Neighbour: click the marker | PASS. Clicking the marker during the Slow rise preview keeps `aria-selected="true"`. No clip is added and the preview keeps playing. A click on the option title, used as a control, behaves the same | m.markerClick |
| LAYOUT-LIB | PASS (i)–(v) at both viewports, compared with `b-round-144/out/libbase-{W}.json`. (i) `ready` and `error`: 0 nodes > 1 px. (ii) The option box equals libbase previewing exactly (d 0). `meta`, `meta0` and `meta1` equal their libbase **ready** boxes (d 0, h 16, one line). The marker has x 156, y = meta y + 16, h 16, right edge 266; there is no `meta2`. (iii) Every other previewing node: 0 deltas. (iv) In all 3 states, all 9 options have scrollWidth = clientWidth, the list is 134/134 (round 145 previewing: 155/134) and the tree is 133/133. (v) Tree and list scroll to their last item, the page has no horizontal overflow, and no row text is clipped. The only remaining previewing deltas are the expected (ii) ones: meta h 32 → 16, because the libbase marker wrapped there | `out/layout146-{W}.json` |
| LAYOUT-REST | PASS. 102 (1440) / 91 (1280) nodes outside the library: 0 deltas > 1 px between ready and previewing/error. The library root equals libbase (d 0) in all 3 states | layout146 rest |
| LIB-ROW-TEXT-SMOKE | PASS at both viewports. Abort on `**/middle-east.mp3`: the meta shows `Music` + `Error: File failed to load (network)`, and there are 0 markers in the document | `shots/row-error-*.png` |
| PURCHASED-LABEL | BLOCKED (backend unavailable in cloud). Unit evidence only, green in T146-TARGETED | — |
| G146-3 | PASS. In a fresh anonymous context `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token` returns 401. Fake-Bearer 403 is BLOCKED (backend unavailable in cloud) | `out/g146-3.json`, `shots/g146-3-*.png` |
| PX-NET / REG-HYD | PASS. All sessions: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerrors. The only console errors are the known cart/connection noise (2–3 per session) | net in `out/c146-*.json` |

Gate rows, not claimed by C: full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## CZABA requirement vs Ableton
- **CZABA requirement met:** yes. The marker is fully readable, sits on its own line and does not change the `ready` or `error` layout.
- **Ableton correspondence:** unconfirmed / not applicable. This is a CZABA-only row marker, and task §5 makes no Live parity claim. C made no Live claim.

## Invalid runs (harness, not the app)
1. `c146.cjs 1440` #1: Soft impact is a 2.000 s source, and the stop/marker click came about 2.5 s after the preview started, so the preview had already ended by itself. Fix: measure at +250 ms, stop at about 0.93 s, and do the marker click on Slow rise (5 s).
2. `c146.cjs 1280` #1: the Slow rise row was partly below the 1280 list viewport (list y 271–484). The marker at y 477.5–493.5 was under the list edge, so `elementFromPoint` hit the preview section. Fix: scroll the marker into view first, then the check passed. See note 2.

The `out/c146-{1440,1280}.json` files on disk are the last of three valid runs at each viewport. The earlier valid runs gave the same check results and were overwritten.

## Notes for B
1. **Harness relocation:** the marker is located as `[data-testid=arrangement-library-option-previewing]`, a sibling after the meta row. `measure()` takes the meta row as the last option span that is not the marker. The round-145 key `opt:…:meta2` no longer exists, as expected.
2. **C-R146-01 (Low, pre-existing, not caused by round 146):** at 1280×720, a preview started on a row at the list's bottom edge puts its `▶ Playing` line below the visible list (Slow rise marker y 477.5–493.5, list bottom 484; `elementFromPoint` hits the preview section). The list does not auto-scroll, so after a real click the marker can be hidden. The option grows by the same 16 px as in libbase (63.5), so round 146 did not cause this. Steps, expected/actual and evidence are in `c-round-146.json` `bugs`. Per the 2026-10-23 gate and §7, this goes to `deferred_low_polish`.
3. **Info, observed behaviour:** selecting another option while a preview plays moves the preview and the marker to that option without pressing play. This is outside this round's criteria.
4. The marker glyph is 54 px wide, as A reported (the task text said 42 px). The span box is 110 px because of the flex-col stretch, which the task allowed.
5. The preview header title `Middle East — საჯარო preview` is truncated with an ellipsis by design (204/194 px), the same as in round 145.
6. Under §7, C PASS lets root publish rounds 145 + 146 together, and round 147 becomes V-0.5b (unless the regression round is due on or after 2026-10-27).
