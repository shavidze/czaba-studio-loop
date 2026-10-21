# C — Round 46 verification (D-29z11: EXPORT-DIALOG-FOCUS-RESTORE + DOC036/DOC042 status lines)

Verifier: C · 2026-10-15 15:50–16:12 · read-only for app source; no commit/push/deploy. A's numbers were not trusted; every gate below was re-run by C.

**Verdict: PASS on every contracted ID that C could run. Bugs: none.** F-VIDEO's "✕ as the opener" part is **unit-only** (see below; contract allows this). Two notes go to B: a corrected expectation for mutation (f) and the browser reproduction of A-R46-RESTORE-SELECTION (SYNTHETIC only, not reachable by REAL input).

Harness: **REAL** = gstack `/browse` `click <selector>` (Playwright pointer click at the element centre), `press`. **SYNTHETIC** = `js` `.focus()` / `.blur()`. **DOM read** = `document.activeElement` (tag, text, `aria-label`, `data-testid`) through `js`. Setup chain = round-45 `fresh45.sh` copied to `c-round-46/fresh46.sh` (only the wrapper path changed) → Layout L46: video at 0, `სრული მიქსი` music 7–23, `Soft impact` SFX 4–6, Master 0 dB (`runs/fresh-1440-b.txt`: `["music",7,16],["sfx",4,2],["video",0,6.008]`).

**Browser environment (ENV-BROWSE-DAEMON reproduced):** the CLI daemon printed `Server failed to start within 15s` on the first command (`runs/fresh-1440-a.txt`, the run is discarded). C stopped its own daemon (`b.sh stop`; PID 21280 gone) and used the approved fallback, started from `tmp/studio-real-loop/`:
`BROWSE_PARENT_PID=0 BROWSE_STATE_FILE=…/c-round-46/c-browse.json node ~/.claude/skills/gstack/browse/dist/server-node.mjs` → PID **14304**, log `c-round-46/runs/daemon-fg.log`. Anonymous: same command with `c-round-46/anon/c-browse-anon.json` → PID **29132**, `runs/daemon-anon.log`. Both stopped by C with `taskkill /T` at 16:11. Foreign `chrome.exe` 5540 was not touched. Dev server `/studio-lab` 200 throughout. node.exe 20–36 over the run.

## 1. Gates

| ID | Result | Evidence |
|---|---|---|
| **G46-1** | **PASS** | `npx tsc --noEmit` exit 0 (node 20). `npx vitest run` **80 files / 1364 tests passed** (= 1357 + 7), exit 0, no timeouts (node 20). `npm run build` ✓ exit 0. `npx biome check ./app`: 352 files, **2 errors** = the baseline CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`; **218 warnings, 1 info**; 0 diagnostics in any arrangement file; the 2 owned TS files: no diagnostics. `runs/tsc.txt`, `vitest-all.txt`, `build.txt`, `biome-app.txt` |
| **G46-2** | **PASS** | Start 15:50 and end 16:11: HEAD `1381b0b9984c…` both times; `git status --short` = exactly the five §3.2 paths; `b-round-45-tree-sha256.txt` **395 OK / 0 not-OK**; protected **4/4 OK**. No new untracked path. End shas: dialog `22abaeb8`, new test `e4ad8336`, doc 036 `0dad8df0`, doc 042 `056f93a9`, doc 043 `5bc8ff58`. `runs/g46-2-start.txt`, `g46-2-end.txt` |
| **G46-3** | **PASS** | Fresh anonymous server (own state; `about:blank`, `cookies []`). Direct `/studio-lab`: workspace present, `auth_user` null, cookie empty, badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება". localStorage held only `czaba_session_id` (the cart session id from the root `/api/cart` path; not a credential). REAL `＋ დამატება` + REAL Space ×2 with the authhook: **0 Authorization headers** (`[]`). Header link "Studio Lab" (REAL click) → `/studio-lab` workspace, no auth. Network (direct / session / header): **0** requests to studio-token, recording-, `/api/download`, R2; media only `middle-east.mp3`, `hero-music.mp3`; other hosts = the known root `localhost:5199/api/cart`, GA, GTM, Google Fonts. curl anonymous → **401** "Please sign in to access Studio."; fake Bearer → **500**, no token (known root item). `/studio/middle-east` → "Sign in required", no workspace. **Premium auth is not bypassed.** `runs/g46-3.txt`, `runs/anon-*.json`, `runs/network-anon-*.txt`, `runs/curl-token.txt`, `shots/anon-*.png` |

## 2. R46-S — static

**PASS** (`runs/r46s-diff.txt`).
- `diff -u` snapshot → working dialog: exactly **(1)** `+import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';`, **(2)** the filter line gains `&& element.closest('[hidden]') === null` (`:disabled` filter, selector, names unchanged), **(3)** l.85 `useEffect(() => {` → `useIsomorphicLayoutEffect(() => {`. The body and `[isOpen]` are outside the hunk, so they are byte-identical. l.97 and l.115 are still `useEffect(`.
- `useIsomorphicLayoutEffect(` in `app/components/arrangement` + `ArrangementContext.tsx` = **8**; bare `useLayoutEffect(` = **0**.
- `export-dialog-focus.test.tsx` `cmp` against the snapshot: **identical**.
- Banned content in the diff and the new test: no `any`, `@ts-ignore`, `as` assertion, `//` comment, colour or new export. The test uses `querySelector<HTMLButtonElement>` generics and `throw` guards, no assertions.

## 3. R46-U — unit tests and mutations

**PASS.** Scratch copy `c-round-46/scratch/` (copy of `store/app` + own `vitest.config.mts`; `node_modules` junction created with `mklink /J`, removed with `cmd /c rmdir` — the real `store/node_modules` is intact). Script `tools/run-mutations.sh`, output `runs/mutations.txt`. Each run executes the new file + the 19-case file + `ssr-layout-effect` (30 tests). node.exe 20 for every run.

| # | Mutation | Failed (C run) | Expected | Verdict |
|---|---|---|---|---|
| base | unmutated working copy | none (30/30) | green | ✔ |
| (a) | snapshot dialog `89bc8e06` | **FR1, FR2** (`- data-testid="opener" / + data-testid="decoy"`), **HD1, HD2, HD3** (`defaultPrevented` false); FR3, FR4 green; 19/19 and SSR 4/4 green | FR1, FR2, HD1–HD3 | ✔ |
| (b) | capture back to `useEffect` only | **FR1, FR2** (decoy) | FR1, FR2 | ✔ |
| (c) | `[hidden]` condition removed only | **HD1, HD2, HD3** | HD1–HD3 | ✔ |
| (d) | capture as bare `useLayoutEffect` (import from `react`) | **SSR1**: `expected [ 'ArrangementExportDialog' ] to deeply equal []` — exactly 1 frame | SSR1, 1 frame | ✔ |
| (e) | `!element.hasAttribute('hidden')` instead of `closest` | **HD1, HD2**; HD3 green | HD1, HD2 | ✔ |
| (f1) C extra | test-side: `FocusThief` moved **before** the dialog; snapshot dialog | FR1, FR2 (decoy), HD1–HD3 | B text: "FR1/FR2 green on the snapshot too" | **B expectation wrong** (record, not a FAIL) |
| (f2) C extra | thief before the dialog; **fixed** dialog | **FR1, FR2 still red** (decoy) | — | record |

**B-EXPECT-R46-F (note to B):** A's pre-check is confirmed by C's own run. With the thief before the dialog, FR1/FR2 are red on **both** the snapshot and the fixed code. A passive capture always runs after every layout effect; a layout capture runs in tree order, so a thief rendered earlier also wins. Tree order decides whether the **green** run is meaningful (the fix can only beat later layout effects); it does not make the red run red. Doc 043 already states that layout effects rendered before the dialog are outside the contract.

A's red run (`a-round-46/red-run.txt`) matches §2.3 (FR1/FR2 name `decoy`; HD1–HD3 red; FR3/FR4 green). Mutation (e) in A's table (focus-to-close moved to a layout effect → FR4, plus FR1/FR2) was **not re-run by C**; it is A's record only.

Frozen suites of §4.6: all inside the full run of G46-1 (80/1364 green), including `export-dialog-focus` 19/19 and `ssr-layout-effect` SSR1 = 0.

## 4. R46-FOCUS — real browser

All reads are DOM reads of `document.activeElement` after the step (`runs/f-*.txt`).

| ID | Result | Observed |
|---|---|---|
| **F-ESC** (1440×900) | **PASS** | Focus before: BODY. REAL click `Export` → focus `დახურვა` (in dialog). REAL Escape → dialog gone, focus `BUTTON "Export"`. `shots/f-esc-open-1440.png` |
| **F-CLOSE** | **PASS** | From `Export`: REAL Shift+Tab → `Fit`; REAL Tab → `Export`; REAL Enter → dialog, focus `დახურვა`; REAL click `დახურვა` → dialog gone, focus `Export`. |
| **F-X** | **PASS** | REAL click `Export` → `დახურვა`; REAL click ✕ (`aria-label="Close"`) → dialog gone, focus `Export`. |
| **F-WRAP** (3 clips) | **PASS** | From `დახურვა`, 6 REAL Tabs: `WAV-ის ექსპორტი` → ✕ `Close` → `INPUT` (WAV radio) → `დახურვა` → `WAV-ის ექსპორტი` → ✕. Focus stayed in the dialog on every step. REAL Shift+Tab from ✕ → `WAV-ის ექსპორტი`; again → `დახურვა`. REAL Esc → `Export`. `shots/f-wrap-1440.png` |
| **F-RENDER** | **PASS** | REAL click `Export` → REAL click `WAV-ის ექსპორტი`. An in-page rAF sampler (DOM read) logged: t=4 ms focus `დახურვა`; t=320 ms buttons `დახურვა:disabled`, `მიმდინარეობს…:disabled`, focus on the dialog's trap element (inside the dialog); t=648 ms buttons enabled; t=702 ms focus back on `დახურვა`, inside the dialog. REAL click `დახურვა` → focus `Export`. WAV: the download anchor (`czaba-studio-lab.wav`) was intercepted by C's setup hook and the blob read instead (SYNTHETIC intercept). **6 624 044 bytes; `RIFF` (len 6 624 036) / `WAVE` / `fmt ` / `data` 6 624 000 bytes; 2 ch, 48 000 Hz, 24-bit → 23.000 s** (= project 0–23). Sampled non-zero data; peak 0 dBFS (the known export hard-clip / DEMO-SFX-FULL-SCALE items, not new). Smoke only, not the integrity suite. `runs/f-render-1440.txt`, `shots/f-render-done-1440.png` |
| **F-VIDEO** | **Partly REAL; ✕-as-opener = unit-only** | REAL click `arrangement-video-expand` → `data-video-expanded="true"`, the video ✕ exists. REAL click `Export` → dialog open; `elementFromPoint` at the video ✕ centre hits the **dialog backdrop**, so ✕ cannot be clicked while Export is open. REAL Esc → dialog gone, **video still expanded**, focus on `Export` (the real opener). There is no REAL path that opens Export while focus stays on the video ✕: a pointer click on `Export` focuses `Export`, and the keyboard reaches `Export` only by moving focus to it. So "focus returns to the video ✕" (test l.408) stays **unit-only**. Not listed as passed. `runs/f-video-1440.txt`, `shots/f-video-*.png` |
| **F-SPACE** | **PASS** | Transport stopped (pos 0, source starts 0). REAL click `Export`; 3 REAL Tabs → focus on `INPUT radio` (checked). REAL Space → after 1.5 s and 3 s: `playing:false`, pos 0, starts 0, dialog still open, radio still checked. REAL Esc → `Export`. |
| **F-1280** | **PASS** | Fresh load at 1280×720: F-ESC gives `დახურვა` at open and `Export` after Esc. C also repeated F-CLOSE, F-X and F-WRAP at 1280; the results were identical to 1440 (`runs/f-esc-1280.txt`, `f-close-x-wrap-1280.txt`). |

### Probe for B (not contracted): A-R46-RESTORE-SELECTION in the browser

`runs/probe-restore-selection-1440.txt`, `probe-backdrop-1440.txt`
- **P1** (REAL open → SYNTHETIC `blur()` to body → REAL Esc): focus → `Export`. ✔
- **P2** (REAL open → SYNTHETIC `.focus()` on toolbar `Fit`, outside the dialog → REAL Esc): the dialog closes, but focus **stays on `Fit`**. Under the snapshot's passive restore this would have been `Export`. This confirms A's jsdom probe in Chrome.
- **Reachability by REAL input:** none was found.
  - The backdrop covers the toolbar and the expanded video ✕ (`elementFromPoint` = dialog).
  - The Tab trap held for 6 Tabs (F-WRAP).
  - A REAL click on the dialog element kept focus inside it (on the trap DIV).
- C tested only mouse and keyboard; assistive technology was not driven. `Modal.tsx` l.101 declares `aria-modal="true"`, so screen readers should also keep focus inside the dialog, and the limit stays theoretical. So it is **not filed as a bug**. B decides whether to accept it as a documented limit (doc 043 lists it) or to schedule the reviewer's alternative (capture into a ref in the layout phase, restore in a passive cleanup).

## 5. R46-SSR

**PASS** (`runs/r46-ssr.txt`). Count of `useLayoutEffect does nothing on the server` in `r42-vite.err.log`, three `curl /studio-lab` runs (each 200, then 3 s): **357 → 357, Δ 0** each time. The log size stayed at 1 169 358 bytes. Control `curl /` grew the log to 1 171 278, so the log is live. SSR1 = 0 in G46-1.
**C-R23-01 record:** `/studio-lab` HTML **64 312 bytes, 3 NUL at 11729 / 28025 / 28026**, the same as round 45. **C-R38-01 record:** hydrated `aria-label`s with U+FFFD = **1** (`ბიბ�ლიოთეკის დაკეცვა`, the library collapse button), the same as round 45.

## 6. R46-REG

| ID | Result | Observed |
|---|---|---|
| **REG-HYD** | **PASS** | Fresh loads at 1440×900 and 1280×720. Over both loads and every later step, the whole console had only: `[vite] connecting/connected`, the React DevTools info, and the root `GET /api/cart` `ERR_CONNECTION_REFUSED` / `Failed to load cart`. There was **no hydration-mismatch, React or `useLayoutEffect` warning**. Detail panel at 1440: open, 144. `runs/console-all.txt`, `fresh-1440-b.txt`, `fresh-1280.txt` |
| **REG-PLAY** | **PASS** | Before Export (SYNTHETIC blur to body): REAL Space → after 3 s `playing:true`, pos 3.39, source starts 0→3, Master meter finite (max −5.9 dB); REAL Space → stopped at 3.782 and stable 1 s later. REAL Export open + REAL Esc: playing, pos and starts unchanged. After Export, with focus on the restored `Export` button: REAL Space → `playing:true`, pos 16.129→19.409, starts +1, meter −11.1 dB; REAL Space → stopped at 19.639, stable. Space on the restored `Export` drives the transport and does **not** reopen the dialog. One messy intermediate sequence (the play state toggled out of step with the script and ran to the project end at 23) is kept in the log; the clean runs above are the evidence. `runs/reg-play-1440.txt` |
| **REG-KEYS** | **PASS** | REAL Export → REAL Esc (focus `Export`) → REAL click on the music clip body → REAL Ctrl+Z → SFX clip removed, status `Undo: დამატება — Soft impact`, past 3→2 → REAL Ctrl+Shift+Z → SFX clip back, `Redo: დამატება — Soft impact`, past 3. The restored focus does not swallow the shortcuts. (Observation: the clip click left focus on `Export`; the shortcuts still worked.) `runs/reg-keys-1440.txt` |

## 7. R46-Doc

**PASS.**
- Doc 043 exists. Its headings follow `TEMPLATE.md` (თარიღი / სტატუსი / შეცვლილი პროექტი, კონტექსტი, მიდგომა, არქიტექტურა with a Mermaid diagram, შეცვლილი ფაილები with no code fragments, პრობლემები და გადაწყვეტები, ტესტირება, TODO / შემდეგი ნაბიჯები).
- It is in Georgian and matches the code: the layout capture plus its layout cleanup, the two passive effects, why `useIsomorphicLayoutEffect`, why `closest('[hidden]')`.
- It contains the §4.7 table, the known limits (`inert`, CSS `display:none`, `aria-hidden`, A-R46-RESTORE-SELECTION) and a round-47 TODO.
- Docs 036 and 042 differ from their snapshots on **l.4 only**, with the exact T1 and T2 text.

## 8. Ableton — two verdicts per row (§4.7)

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Export close returns focus to the opener, even if a later layout effect moved focus during the opening commit | **Met** (R46-U FR1/FR2 + mutations; R46-FOCUS F-ESC/F-CLOSE/F-X/F-1280) | **Not applicable** — CZABA's own web-dialog a11y contract (C-R13-03 / D-29e); no Live behaviour is claimed |
| The Tab wrap skips controls inside `[hidden]` | **Met, unit-only** (HD1–HD3 + mutations c/e; nothing is hidden in the dialog today) | **Not applicable** |
| Doc status lines match C results | **Met** (R46-Doc) | **Not applicable** |

## 9. Not run this round (not PASS)

- **F-VIDEO ✕-as-opener:** unit-only (reason above).
- **Out of this round's scope (§4.6):** export WAV integrity beyond the F-RENDER smoke; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression.
- **Not re-run by C:** A's mutation (e) (focus-to-close moved to the layout phase).

## 10. Carried items (unchanged, not new bugs)

- **Open C bugs:** C-R41-01 (Low, TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (records in §5 are unchanged).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, SSR4.
- **To the Tech Lead:** A-R33-REVIEW-TOUCH.
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE (the WAV peak is 0 dBFS again), L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS (now 8 `useIsomorphicLayoutEffect` sites + `usePositionWriterEffect`). Info: DETAIL-RESET-SHRINK, ESC-DESELECT-NOTE.
- **Root items:**
  - `root-pre-push-review.md`: nothing open (M1–M3, L1–L4, L6–L8 closed; L5 accepted).
  - `publication-checkpoint.json` `round45Checkpoint` = `8b9c813` / `1381b0b`, both remotes, `release:false`. HEAD is still `1381b0b`; this round's five paths are uncommitted.
  - Other root items: the architecture checkpoint request (`b-round-45.md` §6); GSTACK-ACL; `.kilo/`; e2e smoke (root only); SRW-21; Lenis on `/studio/*`; portable instruction paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA scroll with consent denied; fake Bearer → 500 (re-observed); the CDP allowlist; the charset; the homepage SSR `fetch failed`; dev-server availability (200 throughout); **ENV-BROWSE-DAEMON (reproduced again; fallback worked)**; machine load (node.exe 20–36).
- **Tech Lead manual checks:** unchanged (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT).

## 11. For B

1. **Ready for root's checkpoint commit:** this round's five paths. C found no defect; the gates are green.
2. **B-EXPECT-R46-F:** correct the §4.2(f) expectation. Placing the thief before the dialog keeps FR1/FR2 red on both versions.
3. **A-R46-RESTORE-SELECTION** (Low/Info): reproduced in Chrome by SYNTHETIC focus only; no REAL path was found. Decide whether to accept it or schedule the ref + passive-restore alternative.
4. **Round 47 (SRW-14 stage 1, FB-13)** can start; nothing in this round blocks it.
