# C — Round 42 verification (D-29z7: the Pan recovers after a lost release; the Lane ends its Pan drag on window blur)

Verifier: C · 2026-10-14 · 18:07–18:59 (+04:00) · HEAD **`ea35611`** at the start and at the end.

## 0. Verdict

**taskStatus: PASS.** Every contracted round-42 ID passed on C's own runs:
- G42-1, G42-2, G42-3;
- R42-S, R42-U, R42-Doc;
- R42-PK (PK-B, PK-LATE, PK-NEG, PK-1280);
- R42-RW (RW-B, RW-KEY, RW-GESTURE, RW-NORMAL);
- R42-REG (KEYS, RESET, DEL with the corrected expectation, DRAG, FADERS).

**There are no new app bugs.** Closed by this round: **A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK** and **A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES**. For the real Alt+Tab case, the Tech Lead's R31-T step is still needed (§9).

**Three records for B and root (not A defects; the third, GSTACK-ACL, is a browse-tool/environment item, see §1):**
1. **TASK-R42-REGDEL (task-text error):** §2.3 PK4 and §4.3 REG-DEL expected Delete with focus on Pan to delete the SFX clip. The frozen contract says the opposite:
   - `StudioWorkspace.tsx` l.1181–1184 returns early when Delete/Backspace targets a range input;
   - `fader-guards` C-R31-02 ("keep the selected clip…", for `pan`) and `track-pan` l.822 assert this.

   C tested the corrected expectation (clip kept, 0 entries, Space toggles playback), and it passed. A had already flagged this (a-round-42 §7). B should fix the text in future tasks.
2. **FOREIGN-CI-YML (root):** ` M .github/workflows/ci.yml` appeared in `git status` during C's run.
   - It is mtime **18:46:21**, after C's start gate at 18:07, which was clean apart from the 3 contracted paths.
   - The diff removes the `pull_request` trigger and adds a `concurrency` group with `cancel-in-progress` (`c-round-42/gates/ci-yml-foreign-diff.txt`).
   - A, C and the Lane did not make this change. `.github/**` is root-owned. C did not touch or revert it.
   - It is not in the 386 list, so 386 OK still holds.
   - **Root must confirm ownership and keep it out of the round-42 checkpoint**, or commit it separately on purpose. Because of this file, the end-of-round `git status` is 3 contracted paths + 1 foreign path.

## 1. Environment and harness

**Machine and dev server**
- `node.exe` was 36–51.
- The dev server answered 200 throughout. C did not start or stop it.

**gstack browse (ENV-BROWSE-DAEMON)**
- The first start printed "failed to start within 15s", then the daemon came up about 10 s later with a fresh `about:blank` context.
- The G42-3 `restart` (for a fresh anonymous context) broke the daemon twice. The client spawned new servers that each "failed within 15s", and the state file `c-browse.json` flickered. Attempt 1 ran during the gate run (load). Attempt 2 ran idle and was stopped at its 10 min background limit.
- gstack printed this once during the restart churn: `Failed to restrict Windows ACL on C:/Apps/czaba-project/tmp/studio-real-loop: Command failed: icacls … /inheritance:r /grant:r sshav:(OI)(CI)(F)`. C did not ask for it and ran no ACL-writing command.
- **What C actually measured** (`c-round-42/gates/acl-record.txt`, read-only `icacls`, 19:0x):
  - `tmp\studio-real-loop` and its parent `tmp` both have a single **non-inherited** ACE, `sshav:(OI)(CI)(F)`, with no SYSTEM/Administrators entries;
  - children such as `c-round-41` inherit it (`(I)`);
  - `store/` has the normal inherited set.
- So the loop folder is in the state that `/inheritance:r /grant:r` produces. C **cannot tell** whether that was applied earlier (the parent `tmp` has the same pattern, and C has no earlier ACL record) or partially during this run despite the "failed" message.
- **Recorded for root as GSTACK-ACL**, not as a CZABA bug. It is a security-relevant side effect of the browse tool on the loop folder, outside the app.
- G42-3 was finally captured:
  - in daemon PID 40120 (created by the restart: `cookies []`, `auth_user` null) for direct, session and premium;
  - in a new daemon, PID 43760, for the header link (§7).
- **Retry budget:** the task allows one daemon retry. C used more, and says so plainly:
  - attempt 1 was invalid under gate load;
  - attempt 2 was stopped at the 10 min limit with partial output;
  - attempt 3 (`g42-3b.sh`, no restart) covered direct, session and premium;
  - the header step ran separately once a new daemon (PID 43760) answered.
  The recorded data is from valid runs only.
- **Lesson for the next C:** `$B restart` is what broke the daemon both times. The sanctioned path is a fresh `BROWSE_STATE_FILE`.
- C's daemon is left running; `stop` hung in round 40. No foreign process was killed, and `tasklist` shows no separate `bun`/`browse` image name to count.

**Harness labels**
- **REAL** = `$B click` at the element centre, or `$B press`.
- **SYNTHETIC**, labelled per step:
  - `PointerEvent` with pointerId **41** (52 for the clip gesture);
  - `window.dispatchEvent(new Event('blur'))`;
  - `.focus()`;
  - a native value setter + `input` + `change` with **no** keydown.

  C did not use `C.pend`, because it sends a keydown.
- **C instrumentation (read-only):**
  - the `window.__c` reader (`c-round-41/fresh41.sh` setup chain), which gives `isPointerGestureActive`, the undo chain and the stored pan;
  - the round-33 `hook31.js` StereoPanner probe.

  Helpers are in `c-round-42/lib42.sh`. There is no source instrumentation.
- **Hydration gate:** before every synthetic press, `hyd()` confirmed `C.cv()`, the React fiber on the Pan slider and `C.hst()`.
- **Layout L42:** confirmed on every fresh load: video 0–6.008, `სრული მიქსი` music at 7, `Soft impact` SFX at 4, music pan 0 (`C`).

## 2. Results by ID

| ID | Result | Evidence |
|---|---|---|
| G42-1 | **PASS** | `gates/g42-1-summary.txt`:<br>• tsc exit 0<br>• the 10 §4.7 suites: **10 files, 270/270**<br>• `npx vitest run`: **74 files, 1333/1333** (= 1325 + 8)<br>• `npm run build` exit 0<br>• `npm run verify` **exit 0** (agents check, 74/1333, both builds)<br>• Biome `./app`: **2 errors, 218 warnings, 1 info**. The errors are `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, both `format` (the baseline CRLF; error-level run in `gates/biome-errors.txt`). 0 diagnostics in the Lane and the new test (`biome-scoped.txt`).<br>• node.exe 48→40. No timeouts. |
| G42-2 | **PASS** for the round's files, with the FOREIGN-CI-YML record (§0) | Start (`gates/g42-2-start.txt`):<br>• HEAD `ea35611`<br>• status = exactly the 3 §3.2 paths<br>• 386/386 OK; protected 4/4 OK<br>• snapshot `SHA256SUMS` OK<br>End (`g42-2-end.txt`):<br>• HEAD `ea35611`; 386 OK; protected 4/4<br>• Lane `855bc517…`, test `de42634f…`, doc 039 `9b15bc74…` (= A's report)<br>• **+ foreign ` M .github/workflows/ci.yml`** |
| G42-3 | **PASS** | §7 |
| R42-S | **PASS** | §3 |
| R42-U | **PASS** | §5 |
| R42-Doc | **PASS** | §6 |
| R42-PK | **PASS** (4/4) | §4.1 |
| R42-RW | **PASS** (4/4) | §4.2 |
| R42-REG | **PASS** (5/5; DEL with the corrected expectation) | §4.3 |

**Not re-run this round** (§4.6), so these are **not PASS**:
- exports and WAV integrity;
- video sync and C-R27-01;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression;
- the detail-panel geometry.

## 3. R42-S (static)

`diff -u` of the snapshot against the working Lane (`gates/r42-s-diff.txt`) shows exactly 4 hunks, +7/−0:
1. `window.removeEventListener('blur', cleanup)` inside `cleanup`;
2. `window.addEventListener('blur', cleanup)` next to `pointerup`/`pointercancel` in `beginPanPointerDrag`;
3. `const handlePanKeyDown = () => { panBlurSuppressionCleanupRef.current?.(); };`. It takes no event parameter, so `preventDefault`/`stopPropagation` are impossible;
4. `onKeyDown={handlePanKeyDown}` on the Pan input.

- No class or attribute change, no `any`, `@ts-ignore`, type assertion, `//` comment or new export. The bodies of `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and `suppressPanPointerAfterBlur` are unchanged.
- **EOL:** `git diff` warns "LF will be replaced by CRLF". The working Lane has 0 CR, and the diff contains only the 4 hunks, so this is not a reformat.
- `useRelativeFaderDrag.ts` (read in full) is unchanged and in the 386 list. It also stops its own move listener on `window` `blur`. C confirmed this in the browser: a `pointermove` 41 after the window blur did not re-create a draft (`runs/rw-b-key-1440.txt` step 3).

## 4. Browser results (1440×900 unless noted; fresh load each)

### 4.1 R42-PK

| Case | Steps (REAL/SYNTHETIC) | Observed | Result |
|---|---|---|---|
| PK-B 1440 (`runs/pk-b-1440.txt`, `shots/pk-b-1440.png`) | SYN `pointerdown` 41 at the Pan centre (prevented) → SYN window `pointermove` 41 +10 px → **REAL click** on the badge `header span.border-accent` (`დემო კოლექცია — ავტორიზაცია არ სჭირდება`; the only match) → no release of 41 → SYN `.focus()` Pan → REAL ArrowRight ×2 | Draft `21`/`21R`/reset `21R`, gesture true, no entry. After the click: focus BODY, slider `0`/`C`, reset `C`, stored 0, `g` false, past 3. After ArrowRight 1: `1`/`1R`/reset `1R`, stored 0.02, past 4, head `Pan — მუსიკა`, `g` false. After ArrowRight 2: `2`/`2R`, stored 0.04, past 5 (**exactly one entry per key**) | PASS |
| Real audio (`runs/pk-b-1440-audio.txt`) | REAL Space with Pan focused → REAL ArrowLeft during playback → REAL Space | The live music `StereoPannerNode.pan` = **0.04** at start. ArrowLeft → `setTargetAtTime(0.02)` at pos 1.75, pan **0.02**, stored 0.02, one entry. Playback toggled on and off | PASS (audio follows) |
| PK-LATE | SYN window `pointerup` 41, then `pointercancel` 41 | Value `2R`, stored 0.04, past 5 unchanged | PASS |
| PK-NEG (`runs/pk-neg-1440.txt`) | Fresh load → same suppressed state → SYN `.focus()` music Volume + REAL ArrowRight, then REAL ArrowLeft → SYN `.focus()` Pan, **no key** → SYN value setter + `input` + `change` `5`, then `-7` → control: REAL ArrowRight on Pan | Volume ArrowRight at max 1: no change, 0 entries (at the limit). ArrowLeft: `0.99`, one `Volume` entry (unchanged behaviour). Pan `change` 5 and −7 **ignored**: slider `0`, stored 0, past 4. Control: REAL ArrowRight → `1R`, one `Pan — მუსიკა` entry | PASS |
| PK-1280 (`runs/pk-b-1280.txt`, `shots/pk-b-1280.png`) | 1280×720 confirmed (`innerWidth` 1280×720). PK-B steps. **Extra:** after the click, a SYN `change` 5 with no key proved the suppression was active (ignored), then REAL ArrowRight ×2 → SYN window `pointerup` 41 | Same as 1440: `0`/`C` after the click; the SYN change was ignored; `1R` (one entry), `2R` (one entry); the late pointerup changed nothing; `g` false | PASS |

### 4.2 R42-RW

| Case | Steps | Observed | Result |
|---|---|---|---|
| RW-B (`runs/rw-b-key-1440.txt`) | SYN pd 41 → SYN window pm +10 → **SYN window blur only** | Draft `21R` → after the blur, `document.activeElement` is **still Pan**. Slider `0`/`C`, reset `C`, stored 0, `g` false, past 3 (0 entries). A further SYN pm 41 +40 changed nothing (the hook had stopped) | PASS |
| RW-KEY | REAL ArrowRight on the focused Pan → SYN late `pointerup` 41 | `1`/`1R`, stored 0.02, exactly one `Pan — მუსიკა` entry; the late pointerup changed nothing | PASS |
| RW-GESTURE (`runs/rw-gesture-1440.txt`) | Fresh load → RW-B → SYN `pointerdown` 52 on the SFX clip body (`[title^="drag = "]`) → the clip press moved focus to BODY, so SYN `.focus()` Pan → REAL ArrowRight → SYN window `pointerup` 52 → REAL ArrowRight | While 52 was held: `g` true, slider **stayed `0`/`C`** (no visual draft), status = `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` (= exported `GESTURE_EDIT_BLOCKED_MESSAGE`, ArrangementContext l.134), past 3. After the release: SFX clip still at 4 / len 2 (**no move entry**), past 3. Then ArrowRight → `1R`, one Pan entry | PASS |
| RW-NORMAL (`runs/rw-normal-1440.txt`) | SYN pd 41 → pm +10 → window pu 41 → SYN window blur | One `Pan — მუსიკა` entry (stored 0.42, `21R`). After the blur: unchanged (`21R`, 0.42, past 4) | PASS |
| RW4 in the browser (extra, `runs/reg-1440.txt`) | RW-B → SYN `change` 3 with **no key** | Written: `3R`, stored 0.06, exactly one entry. The window blur sets no suppression | PASS (extra) |

### 4.3 R42-REG

| ID | Observed | Result |
|---|---|---|
| REG-KEYS (`runs/reg-1440.txt`) | REAL ArrowRight ×2 and ArrowLeft ×1 → `4R`, `5R`, `4R`; past 5 → 6 → 7, one entry per key | PASS |
| REG-RESET | REAL click on `[data-track-id=music] [data-testid=arrangement-track-pan-reset]` → `0`/`C`, stored 0, past 8 (one entry), focus back on `Pan — მუსიკა` | PASS |
| REG-DEL (**corrected**, `runs/reg2-1440.txt`) | REAL click on the SFX clip header selects it. REAL click on the Pan centre focuses Pan: 0 entries, value stays `C`, so **no jump** (round 38). REAL Delete and REAL Backspace: the SFX clip is **kept**, selection kept, past 3, 0 entries (frozen C-R31-02). REAL Space → playing (pos 1.26), REAL Space → stopped, 0 entries | PASS against the frozen contract. **The literal task text ("the SFX clip is deleted") would fail; it is wrong** (TASK-R42-REGDEL) |
| REG-DRAG | SYN drag 41 (down, +10, up) → one `Pan — მუსიკა` entry (0.42). A SYN click 41 without movement → 0 entries and no value change. The REAL click above also produced no jump | PASS |
| REG-FADERS (`runs/reg-faders-1440.txt`) | Music Volume: SYN drag −10 px → `0.91`, one `Volume` entry; REAL ArrowLeft/ArrowRight → `0.90`/`0.91`, one entry each. Master: SYN drag −10 px → −7 dB, one `Master Volume` entry; REAL ArrowLeft/ArrowRight → −7.5 / −7, one entry each. A window blur during a Volume drag restored `0.91`, `g` false, 0 entries | PASS |

## 5. R42-U (unit tests and mutations)

**Test file review** (sha `de42634f…`, 407 lines):
- 8 `it` (PK1–4, RW1–4);
- no `any`, `@ts-ignore`, type assertion, `//` comment, snapshot or fake timers;
- the `vi.spyOn` calls in RW3 are restored by `afterEach` (`vi.restoreAllMocks`);
- RW3 asserts that every added `blur` listener was removed, not the listener order.

**Scratch setup:** C's own scratch copy is at `c-round-42/mut/scratch/` (a copy of `app/` and its own `vitest.config.mts`). `node_modules` was a temporary junction to `store/node_modules`, removed afterwards; `store/node_modules` was verified intact (618 entries, `vitest/package.json` present). Mutations are produced by `mut/mutate.cjs` from the working Lane.

**Runs** (`mut/summary-1.txt`, `mut/summary-2.txt`, `mut/run-*.txt`):
- **Baseline scratch, unmutated:** pan-release-recovery + fader-guards + track-pan → **105/105** green.
- **Red re-run:** the snapshot Lane `7de5a093` with the final test → **PK1, PK3, RW1, RW2 fail; PK2, PK4, RW3, RW4 pass**. This is exactly B's §2.3 prediction and A's record.

| # | Mutation | Failing tests (C's run) | Required | Caught |
|---|---|---|---|---|
| (a) | `onKeyDown` removed from the Pan slider | PK1, PK3 | PK1 | ✔ |
| (b) | The handler also calls `event.preventDefault()` | PK4; `fader-guards` "Delete and Backspace on the focused pan slider keep…"; "the Pan slider no longer stops Delete" | PK4 / fader-guards | ✔ |
| (c) | The suppression check in `handlePanChange` replaced by "any change clears it" | PK2 + 5 `fader-guards` C-R31-01 tests | C-R31-01 / PK2 | ✔ |
| (d) | No `window` `blur` listener in `beginPanPointerDrag` | RW1, RW2 | RW1, RW2 | ✔ |
| (e) | The window blur also calls `suppressPanPointerAfterBlur(pointerId)` | RW2, RW3*, RW4 | RW4 | ✔ |
| (f) | `onKeyDown` moved from the slider to the `arrangement-track-header` div. In the browser C confirmed this div contains both music Volume and Pan | PK2 | PK2 | ✔ |

\* RW3 fails under (e) only because C's extra `{ once: true }` listener is never removed. RW4 is the meaningful catch.

## 6. R42-Doc — PASS

`docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md` (sha `9b15bc74…`):
- It is in Georgian with technical terms in English, and follows TEMPLATE: თარიღი, სტატუსი `Round 42 — D-29z7; C-ის შემოწმებას ელოდება`, project, კონტექსტი (both pairs), მიდგომა (contracts A/B, rejected a–d, the accepted held-pointer edge), a Mermaid sequence, files (no code), Problem → Solution (including the REG-DEL correction), red/green per case, the two-row §4.8 table (both "არ ეხება") and TODO.
- The handler name `handlePanKeyDown` and the `window` `blur` → `cleanup` listener match the code.
- **Minor, info only:** the doc's test numbers are A's (270 / 1333). C's runs reproduce them.

## 7. G42-3 — anonymous access, premium not bypassed: PASS

**Direct** (`runs/g42-3b.txt`, `runs/anon-direct.json`, `shots/anon-direct.png`; daemon PID 40120 created by `restart`, `cookies []`):
- `/studio-lab`: `auth_user` null; localStorage only `czaba_session_id`; cookie empty;
- the workspace and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება` are shown.

**Session** (`authhook.js`):
- REAL `＋ დამატება` → `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`, then REAL Space ×2;
- `fetch`/XHR with an Authorization header: **`[]`**. Workspace code sent no `Authorization` header.

**Network** (direct + session):
- **0** requests to `studio-token` / `recording-` / `/api/download` / R2;
- media only `middle-east.mp3` and `hero-music.mp3`;
- API only the root `GET localhost:5199/api/cart` (plus the dev module `app/services/api/client.ts`);
- hosts: GA/GTM/google.com (root, allowed) and Google Fonts (allowed per §4.6).

**Header link** (`runs/g42-3-header.txt`, `shots/anon-header.png`; new daemon PID 43760):
- Home (`auth_user` null, cookie empty) → visible `Studio LabDemo` link → `/studio-lab`, workspace shown, `auth_user` null;
- 0 forbidden requests; the same 2 MP3s; `images.unsplash.com` from the homepage hero (allowed).

**Premium:**
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`
- A fake Bearer → **500** `Unable to prepare Studio access`, **no token** (known root item).
- `/studio/middle-east` → `signIn: true`, no workspace (`runs/g42-3.txt`, `shots/anon-studio-me.png`).

**Invalid attempts, kept as evidence:**
- `runs/g42-3-attempt1-invalid.txt` (daemon down during the gate load);
- the first direct/header part of `runs/g42-3.txt`. Its `/studio/middle-east` and curl parts are valid.

## 8. Ableton two-verdict table (§4.8)

No new browsing and no video. The only cited source is the round-37 capture: Live 12 Reference Manual §3.2, https://www.ableton.com/en/live-manual/12/live-concepts/, captured 2026-10-13.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| After an interrupted mouse drag (focus lost, release lost), the Pan keyboard works on the next key | **Met** (R42-PK at 1440 and 1280; unit PK1–4) | **Not applicable.** This is input robustness of CZABA's web slider. No Ableton claim is made |
| A window blur during a Pan drag cancels it and shows the stored value | **Met** (R42-RW; unit RW1–4) | **Not applicable** (CZABA rule D-29w / D-29z7 B). No Ableton claim is made |

## 9. Carried items (honest; not PASS)

**Open C bugs**
- **C-R41-01** (Low, 1024×768; TL-Q-VIEWPORT). Not re-run.
- C-R27-01, C-R6-02, C-R8-01 (quiet Chrome).
- **C-R23-01 + C-R38-01** (Tech Lead; `runs/c-r23-01-record.txt`): `curl /studio-lab` = **64 312 bytes, 3 NUL at 11729, 28025, 28026**, identical to round 41. The hydrated DOM has **1** U+FFFD label (`ბიბ�ლიოთეკის დაკეცვა`).

**Open Low items**
- R26-M1;
- 4b-2 groups 3–4 (rounds 43–44: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER);
- 4c (R9 M1/L8, PREVIEW-VOLUME-IDENTITY), A-R34-REVIEW-RESIDUALS;
- DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN;
- the DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE, DETAIL-RESET-SHRINK (info);
- ESC-DESELECT-NOTE (round 41 record).

**A's accepted edge (doc 039)**
- Any key on Pan clears the suppression, even while the same pointer is physically held. Mouse thumb drags are prevented (round 38), so this cannot be reproduced headless.
- It belongs to the Tech Lead's R31-T together with the new step: real mouse Pan drag → Alt+Tab while holding → release outside → back → ArrowRight moves Pan.
- **C's synthetic runs do not replace that real Alt+Tab check.**

**Root items** (`publication-checkpoint.json`, `root-pre-push-review.md`)
- Round 41 is published as `ea35611` (`round41Checkpoint`). Round 42 is checkpoint-ready after this C PASS **only for the 3 contracted paths**. FOREIGN-CI-YML (§0) needs root's decision.
- Still open: the ignored `.kilo/`; `test:e2e:smoke` (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset.
- `root-pre-push-review.md` M1–M3, L1–L4 and L6–L8 are closed and L5 is accepted, per B. Nothing from it is open beyond the shared items above.
- Environment: ENV-BROWSE-DAEMON (restart instability, this round twice; retry budget exceeded, §1); **GSTACK-ACL** (the loop folder and `tmp` have a non-inherited owner-only ACE; the timing is unknown; §1); machine load.

**Tech Lead manual checks:** R23-1, R23-2, R38-T (+ A-R38-REVIEW-TOUCH), R35-T, R30-T, **R31-T (+ the round-42 Alt+Tab step)**, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 10. For B (next)

- Update the PK4/REG-DEL wording to the frozen C-R31-02 contract.
- Ask root about FOREIGN-CI-YML before the round-42 checkpoint.
- The round-43 queue is unchanged (group 3). C-R41-01 waits for TL-Q-VIEWPORT.
