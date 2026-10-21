# C — Round 45 verification (SRW-13 polish part 1; D-29z10)

Verifier: C · 2026-10-15 14:02–14:36 +04:00 · Evidence: `c-round-45/` · Source read-only; no commit, push or deploy.

**Verdict: PASS on every contracted ID. Bugs: none.** Everything below was re-run by C; A's numbers were not reused.

Harness labels:
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** = PointerEvent dispatch with pointerId 41, `.blur()`, `scrollLeft` set.
- Reads come from the existing `window.__c` reader and the DOM. No source was instrumented.

`node.exe` was recorded on every run: 17–38.

## 1. Gates

| ID | Result | Evidence |
|---|---|---|
| **G45-1** | **PASS** | `g45-1.txt`, `build.txt`, `biome-app-full.txt`. tsc exit 0. vitest **79 files / 1357 passed** (= 1351 + 6; node.exe 37→23). Build ✓. Biome `./app` read-only: **2 errors** (only the baseline CRLF `format` on `app/lib/auth.ts` and `auth-bugs.test.ts`), **218 warnings**, 1 info. **0** diagnostics in Studio/hook/test files, and 0 `useSemanticElements` (the suppression still matches). |
| **G45-2** | **PASS** | Start (14:02): HEAD `ca85109` (starting point **(b)**); `git status` = exactly the 12 lines of §3.2(b); 386 OK; protected 4/4; `context-hygiene.test.tsx` `63b5dbe5`; doc 041 `5dadac1f`. End (14:35, `g45-2-end.txt`): HEAD `ca85109`; 386 OK; protected 4/4; A's 7 file shas are unchanged since the start (hook `0877f6ae`, Context `91634d8f`, Workspace `30cdee8b`, DetailPanel `00dc8d66`, Library `a2b6f78d`, SSR test `0bcb6e50`, ISO test `39bf3deb`). **Foreign paths, recorded and not touched (§6):** root-owned paths changed **during** C's run, after A had finished. |
| **G45-3** | **PASS** | `runs/g45-3.txt`, `runs/anon-*.json`, `runs/network-anon-*.txt`, `shots/anon-*.png`. Run in a fresh anonymous daemon (own state `c-round-45/anon/c-browse-anon.json`, `cookies []`, `about:blank` at start). Direct and header-link `/studio-lab` both opened the workspace: `auth_user` null, cookie empty, badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება". **0** requests to studio-token, recording-, `/api/download` or R2. Media was only `middle-east.mp3` and `hero-music.mp3`. The fetch/XHR Authorization hook recorded **0** headers during a REAL `＋ დამატება` and REAL Space ×2. curl: anonymous → **401**; fake Bearer → **500** with no token (known root item). `/studio/middle-east` → "Sign in required", no workspace. **Premium auth is not bypassed.** Other hosts were the known ones (`localhost:5199/api/cart`, GA, GTM, Google Fonts). |

## 2. R45-S — static (PASS)

Evidence: `r45s-source-diff.txt`; `diff -u` against `b-round-44-snapshots/`.

**The 7 sites:**

| Site | Change |
|---|---|
| Context l.475→476 | `useLayoutEffect(` → `useIsomorphicLayoutEffect(` |
| Workspace l.669 | same |
| DetailPanel l.253, 261, 268, 618, 629 | same |

- Callback bodies and dependency arrays are byte-identical.
- **Imports:**
  - `ArrangementContext.tsx`: +1 hook import; `useLayoutEffect` stays in the `react` import, because the alias uses it.
  - `StudioWorkspace.tsx` and `ArrangementDetailPanel.tsx`: `useLayoutEffect` was removed from the `react` import, and +1 hook import was added.
- **`usePositionWriterEffect`** (l.411) and its 3 calls (l.2806/2823/2843) are not in the diff.
- **Hook file:** one import of `{ useEffect, useLayoutEffect }` from `react`; one export, `typeof window === 'undefined' ? useEffect : useLayoutEffect`.
- **Library:** one line differs. The rule is still `lint/a11y/useSemanticElements`. The reason is "a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator". It contains 0 of `B`/`task`/`§`/`round`. The separator element is byte-identical.
- **Greps:**
  - bare `useLayoutEffect(` in `app/components/arrangement` + Context → **0**;
  - `useIsomorphicLayoutEffect(` → **7**.
  - There is no `useLayoutEffect` outside Studio.
- **Banned content:** none in the diff, the hook or the two tests. The only `//` lines are the pragma (SSR test l.1) and the reworded `biome-ignore`. The one ` as ` match is test-name text ("…, as the dev server does"), not an assertion.

## 3. R45-U — unit tests and mutations (PASS)

**Green:** 6/6, inside the full run, and in C's scratch base run.

**SSR4 is A's addition** beyond the §2.3 table: a positive-control probe. It is in an allowed file, was added on the reviewer's advice, and is counted in 1357. It is a deviation recorded for B, not a defect.

**C's mutations** (`mutations.txt`; scratch copy in `c-round-45/scratch/` with a `node_modules` junction, removed with `cmd /c rmdir`; script `tools/mutate.cjs`; node.exe 24–36):

| # | Mutation | Caught by | Detail |
|---|---|---|---|
| base | unmutated copy | — | 6/6 green |
| (a) | the 4 snapshot sources | SSR1 | **7** frames: `ArrangementProvider`, `StudioWorkspace`, `ArrangementDetailPanel` ×2, `ArrangementDetailContentInner` ×3 (= B's table); SSR2/3/4 green |
| (b) | hook always `useLayoutEffect` | SSR1 | the same 7 frames |
| (c) | hook always `useEffect` | ISO1 + ISO2 | `useEffect` vs `useLayoutEffect`; `[true]` vs `[false]` |
| (d) | DetailPanel Clip Gain site (l.268) bare again | SSR1 | exactly 1: `ArrangementDetailContentInner` |
| (e) | pragma removed | SSR3 + SSR1 | `'object'` vs `'undefined'`; SSR1 16 frames, because jsdom also selects `usePositionWriterEffect` |
| (f) | StudioWorkspace site bare again | SSR1 | exactly 1: `StudioWorkspace` |
| (g) C extra | Context l.476 site bare again | SSR1 | exactly 1: `ArrangementProvider` |
| (h) C extra | the route's default export renders `null` | SSR2 | `expected '' to contain 'data-testid="arrangement-ruler"'`. This proves SSR1 cannot pass on an empty render. |

All 9 runs behaved as expected; none survived. A's red run (`a-round-45/red-run.txt`) (which contains the `ArrangementProvider` frame) agrees with C's (a).

## 4. R45-SSR — real dev-server SSR (PASS)

Evidence: `r45-ssr.txt`. Log: `r42-vite.err.log`.

| Request | HTTP | Warnings | Δ | Log bytes |
|---|---|---|---|---|
| `/studio-lab` run 1 | 200 | 357 → 357 | **0** | 1163598 → 1163598 |
| `/studio-lab` run 2 | 200 | 357 → 357 | **0** | unchanged |
| `/studio-lab` run 3 | 200 | 357 → 357 | **0** | unchanged |
| `/` control | 200 | 357 → 357 | **0** | **+1920** |

- The `/` control proves the log is live. Its growth is `Error loading homepage products: TypeError: fetch failed` (backend down). It is non-Studio and **contains no `useLayoutEffect` warning**.
- B's baseline was +7 per `/studio-lab` request (336 → 343).
- **C-R23-01 record:** `/studio-lab` HTML **64312** bytes; **3 NUL** at 11729, 28025, 28026. This is identical to round 44 (`c-round-45/studio-lab.html`).

## 5. R45-REG — neighbouring behaviour (PASS)

**Layout L45** (from the round-44 setup chain): video at 0, `სრული მიქსი` on music at 7–23, `Soft impact` on SFX at 4–6, Master 0 dB.

**Browser:** the CLI daemon failed after the first fresh load (see §6). All runs below used C's own `server-node.mjs` fallback:
- PID 16940, state `c-round-45/c-browse-fb2.json`, log `runs/daemon-fg2.log`;
- anonymous: PID 28184, `runs/daemon-anon.log`.

| ID | Result | What was observed (REAL unless labelled) | Evidence |
|---|---|---|---|
| **REG-HYD** | **PASS** | The console was read 3 s after `goto`, before any C script was injected. It showed only `[vite] connecting/connected`, the React DevTools info, then the known root `GET /api/cart` `ERR_CONNECTION_REFUSED` / `Failed to load cart`. **No hydration-mismatch, React or `useLayoutEffect` warning**, at 1440 (×3 loads) and 1280 (×4 loads). The console after all REG steps had no new warning. | `runs/fresh-1440-c.txt`, `fresh-1280*.txt`, `reg2-1440.txt` |
| **REG-DP** (1440 + 1280) | **PASS** | Panel start/end/Clip Gain inputs: music click → `7 / 23 / 0.0`; SFX click → `4 / 6 / 0.0`; SYNTHETIC range drag 8→10 (41) → `8 / 10 / 0.0`, range `{8,10,music}`; SFX click → `4 / 6`, range cleared. No stale value at any step. **B-expectation note:** the inputs show `8` / `10`, not `8.000` / `10.000`. `rangeInputText` = `String(Math.round(v*1000)/1000)`, and that function body is unchanged. This is not a round-45 change. | `runs/reg-dp-cg-1440.txt`, `reg-dp-cg-1280.txt`, `shots/reg-dp-range-1440.png` |
| **REG-DP-START** | **PASS** | **1440×900:** open, **144** (3 fresh loads). **1280×720:** **collapsed** (36), `aria-valuenow` **142** (4 fresh loads). The predicate input is deterministic: scroller 386 − 108 = 278 < content 368 (4 lanes × 81 + ruler). A REAL toggle click opens it at **142**. This matches the historical record: round 21 `p4-1280x720-detail-collapsed-onload.png`. Round 40/41's "142 / 273 fresh-load" came from `lib40.sh fresh()`, which calls `openpanel()` (a toggle click) after the load. That was not the start decision. | `runs/fresh-1280*.txt`, `shots/dp-start-1280*.png` |
| **REG-DP-RESIZE** | **PASS** | SYNTHETIC separator drag (41). 1440: 144 → up 80 → **224** → far up → **280** (= `aria-valuemax`, the cap) → release 280 → back → **144**. 1280: from collapsed (122) a drag opens to 280 (cap) → back to 144. No console error. | `runs/reg2-1440.txt`, `reg2-1280.txt` |
| **REG-CG** (1440 + 1280) | **PASS** | SFX selected; REAL click field, Ctrl+A, type `3`, Enter → input `3.0`; status `Clip Gain: Soft impact — +3.0 dB.`; Undo label `Clip Gain`; past 3→4 (**one** entry); clip `gainDb` 3. REAL Ctrl+Z (focus first moved to the clip by a REAL click) → input `0.0`, `Undo: Clip Gain`, past 3. The text follows each change (l.268 site). | `runs/reg-dp-cg-1440.txt`, `reg-dp-cg-1280.txt` |
| **REG-ZOOM** (1440 + 1280) | **PASS** | SYNTHETIC range 8–10, SYNTHETIC `scrollLeft=200`, blur. REAL `z` → zoom 678→977 (1280: 947), scrollLeft 2020 (1668). REAL `+` → 1000 / 2421; at 1280 two steps, 982/2180 then 1000/2502. SYNTHETIC scroll to about 10 s (9800). REAL `x` → **zoom 678, scrollLeft 200.0** (Δ 0 px). A second REAL `x` → "Zoom-ის ისტორია ცარიელია…", view unchanged. The l.669 path applied the pending scroll on each zoom change. | `runs/reg2-1440.txt`, `reg2-1280.txt`, `shots/reg-zoom-*.png` |
| **REG-REFUSAL** (1440 + 1280) | **PASS** | SYNTHETIC pointerdown + move on music Volume (41, not released): gesture true, volume follows the drag. **REAL Ctrl+Z while held** → status = `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` (the `GESTURE_UNDO_BLOCKED_MESSAGE` text, read from the DOM); past unchanged; nothing undone. SYNTHETIC window pointerup (41) → status = **S0** (the last non-refusal status) on the next read and +0.5 s; past +1 (the drag's own `Volume` entry). **Control:** REAL Mute → held + REAL Ctrl+Z refused → release restores S → REAL Ctrl+Z then undoes `Mute — მუსიკა`. | `runs/reg-refusal-1440.txt`, `reg-refusal-1280.txt`, `shots/reg-refusal-held-*.png` |
| **REG-LIB** (1440 + 1280) | **PASS** | REAL click focuses the separator (`aria-valuenow` 288, min 288 / max 480). REAL ArrowLeft at the minimum → 288 (clamped). REAL ArrowRight ×2 → **320**, panel width 320. SYNTHETIC drag +40 → 360, −40 → 320. `aria-valuenow` follows the width. | `runs/reg2-1440.txt`, `reg2-1280.txt` |
| **REG-PLAY** | **PASS** | **1440** (from 15 s): REAL Space → pos 16.22 → 17.58 → 19.01 while playing; Master meter `data-level-db` −8.7 / −7.2 / −11.9 (hold −6.5…); 1 live source start. REAL Space → stopped at 19.87; meter `-inf`; position held at +1 s. **1280** (from 0): 1.66 → 3.46, meter −15.6 / −11.7, stop at 3.69 and held. **Discarded harness attempt (1280, reg2):** playback started at 15 reached the 23 s end-stop during slow calls, so the second Space restarted from 0 (the R44-TR end-stop → restart behaviour). It was re-run from 0 and passed. | `runs/reg2-1440.txt`, `reg-play-1280.txt`, `reg2-1280.txt` |

## 6. R45-Doc (PASS)

Evidence: `r45-doc-diff.txt`; each doc was diffed against its snapshot. No other line changed.

| Note | Verdict |
|---|---|
| **DOC036-ROUND-REF** (l.468) | **PASS.** "ეტაპ 4b-1-ში (round 38) განხორციელდა (C round 38 PASS)". `c-round-38.json` passed `R38-DC`, `DC-*`, `MN-RESET`. *Info:* the round-38 PASS was SYNTHETIC `dblclick`; a REAL double-click is still Tech Lead R38-T. The note is accurate as written. |
| **DOC036-R37-TAIL** (l.436) | **PASS.** Closed in round 37 by D-29z2; `c-round-37.json` is PASS. The l.513 sentence is untouched. |
| **DOC035-NOTES (1)** l.4 | **PASS.** `C PASS (round 30, c-round-30.md; …)`; `c-round-30.json` is PASS. |
| **DOC035-NOTES (2)** l.26 | **PASS.** The doc quote `Clip Gain: ღამის პულსი · სრული მიქსი — +6.0 dB.` is **byte-equal to the live status** after REAL `6` + Enter on the music clip, at 1440 and 1280. `SYNTHETIC_COMPOSITION_TITLE = 'ღამის პულსი'`. |
| **DOC035-NOTES (3)** | **PASS.** Mouse → 1 entry; Tab → reset → Enter → 2 entries. Cites `a-round-30.md` §6.2a (verified text) and `c-round-30.md` §10 (verified text). C did not re-measure it in the browser (not contracted). |
| **DOC034-UNREACHABLE-NOTE** | **PASS.** It matches `c-round-29.md` l.6, l.123–127 and l.189 (mutation (d)): the detail clamp, and 25→30 → 25–26. |
| **DOC015-DELETE-GAP-NOTE** | **PASS.** Delete/Backspace leaves a gap; only Ctrl+Shift+X cuts time; Ctrl+Shift+L extends the range to all lanes. It cites `delete-selection-update.md` and doc 034. |
| **Doc 042** | **PASS.** Georgian; follows the TEMPLATE sections; Mermaid diagram. It states that the shared hook leaves `usePositionWriterEffect` untouched, and why the pragma is needed. It has the §4.7 table (all three rows "არ ეხება") and TODO round 46/47. |

## 7. Ableton — two verdicts per row (§4.7)

| Behaviour | CZABA requirement | Ableton conformity |
|---|---|---|
| Server rendering does not select layout effects | **Met** (R45-U, R45-SSR, R45-REG) | **Not applicable** (React SSR in CZABA's web stack; no Live claim) |
| A lint suppression gives a technical reason | **Met** (R45-S) | **Not applicable** (developer hygiene) |
| The docs describe the shipped Delete/gap, Cut Time, Clip Gain and Pan behaviour accurately | **Met** (R45-Doc) | **Not applicable** for the notes. The behaviours keep their earlier verdicts; no new source was consulted. |

## 8. Findings for B (no bugs)

- **B-EXPECT-RANGE-TEXT** (info): REG-DP expected `8.000 / 10.000`. The live inputs show `8 / 10` (`rangeInputText`, unchanged code). Correct the expectation in future tasks.
- **B-EXPECT-DP-START-1280** (info): at 1280×720 the panel **starts collapsed** (expanded height 142). Round 40/41's "142 fresh-load" included `openpanel()`. Future tasks should say "collapsed at load, 142 after toggle".
- **REG-ZOOM step note** (info): `+`/`−` steps do not push zoom history. Only Fit and Zoom-to-range (`z`) do. So "zoom-in twice → zoom-back" restores only through a `z` entry. C used `z` + `+`.
- **DOC042-STATUS-LINE** (info): doc 042's status still reads "C-ის შემოწმებას ელოდება". B/root should update it after this PASS (same class as DOC036-STATUS-LINE).
- **Doc 035 later rounds:** C grep confirms that doc 035 has no later-round behaviour section. l.160 is a forward TODO mention of round 31, so A's "none named" holds.
- **SSR4** (A deviation, accepted by C as harmless): an extra `it` in an allowed file.
- **A's §8 items, carried:**
  - BIOME-HOOKS-DEPS (Low, config-owned): add `useIsomorphicLayoutEffect`/`usePositionWriterEffect` to the `useExhaustiveDependencies.hooks` option;
  - DOC036-STATUS-LINE (Info);
  - the homepage SSR `fetch failed` while the backend is down (non-Studio, info).
- **Foreign working-tree changes during C's run** (root-owned; not A's; not touched):
  - modified at 14:09–14:27: ` M .claude/agents/{code-reviewer,frontend-architect,tech-lead}.md`, ` M .codex/agents/{code-reviewer,frontend-architect,tech-lead}.toml`, ` M scripts/check-agents.mjs`;
  - new: `?? .claude/references/architecture-checkpoint.md`.
  - C's G45-1 ran at 14:02–14:04, before these changes.
  - **Root:** exclude them from the round-45 checkpoint, or review them separately. `npm run verify` (agent-reference check) was not re-run by C after they appeared.
- **ENV-BROWSE-DAEMON reproduced:**
  - The CLI-spawned daemon (state `c-round-45/c-browse.json`) served the first fresh load (14:08), then lost its page and state file before the next script. Its restarts timed out (`runs/reg-dp-cg-1440.txt` first attempt was discarded and overwritten by the valid run).
  - C then used the approved fallback. The first fallback (PID 37544, started from `c-round-45/`) refused eval paths outside its cwd, so C stopped it (own process; its chrome child was not tree-killed and may linger).
  - The second fallback (PID 16940) and the anonymous one (PID 28184) were started from the loop folder. Both were stopped with `/T` at the end.
  - Foreign `browse.exe` (7352 → 18404 → 12324) and `chrome.exe` 5540 were never touched.

## 9. Carried (not re-run; not PASS)

- **Not contracted this round:** export/WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression.
- **Open C bugs:**
  - C-R41-01 (Low, 1024×768, TL-Q-VIEWPORT);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). This round's record: 64312 bytes, 3 NUL @ 11729/28025/28026; **1** hydrated U+FFFD `aria-label` (`ბიბ�ლიოთეკის დაკეცვა`, library collapse; at 1440 and 1280). All unchanged from round 44.
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT. **To the Tech Lead:** A-R33-REVIEW-TOUCH.
- **Open Low items:**
  - EXPORT-DIALOG-FOCUS-RESTORE (round 46);
  - R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY;
  - DETAIL-RESET-SHRINK, ESC-DESELECT-NOTE.
- **Root items** (`root-pre-push-review.md`: nothing open; `publication-checkpoint.json` `round44Checkpoint` = `ca85109`):
  - **ROUND-45 is checkpoint-ready for root on C PASS.** The paths are the 12 of §3.2(b) only, not the foreign `.claude/.codex/scripts` changes.
  - Also carried: GSTACK-ACL; `.kilo/`; e2e smoke (root only); SRW-21; Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip; the CRLF auth Biome errors; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA scroll with consent denied; fake Bearer → 500; the CDP allowlist; the charset; dev-server availability (200 throughout); ENV-BROWSE-DAEMON (reproduced, above); machine load (node.exe 17–38).
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT.
