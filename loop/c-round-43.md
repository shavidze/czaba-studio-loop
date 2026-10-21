# C — Round 43 verification (SRW-13 4b-2 group 4; D-29z8)

Verifier: C (Claude Opus 5.5) · 2026-10-15 11:08–11:46 · read-only for app source · no commit/push/deploy.
Artifacts: `c-round-43/` (`gates/`, `runs/`, `shots/`, `mut/`, `scripts/`, `checkpoint.md`), `c-round-43.json`.

**Verdict: PASS** on every contracted ID that C ran. No product bug was found. One environment item (ENV-BROWSE-DAEMON, new symptom) and one task-text note (TASK-R43-HTZERO) go to B.

## 1. Gates

| ID | Result | Evidence |
|---|---|---|
| **G43-2 start** | PASS | `gates/g43-2-start.txt` (11:08, node.exe 36): HEAD `b6a96f8`; `git status` = the 5 paths of §3.2; 387 non-OK 0; protected 4/4 OK; `/studio-lab` 200. Snapshots `1707798c`/`9721d08f`. Working copies: Master `849e6b40`, fader-guards `f60b34d9`, master-hold-tick `93eb697a`, fader-focus-order `113d74b4`, doc 040 `f91ab6cb` (= A's report). |
| **G43-1** | PASS | `gates/g43-1-summary.txt`. tsc exit 0. vitest **76 files / 1341** (= 1333 + 8 new `it`: 3 HT + 5 S), 0 failures (node.exe 34). Frozen §4.7 suites **12 files / 227**. `npm run build` exit 0. `npm run verify` exit 0 (76/1341, both builds). Biome `./app`: **2 errors** (only `app/lib/auth.ts` and `auth-bugs.test.ts` format, baseline CRLF; `gates/biome-targeted.txt`), **218 warnings**, **1 info**. The 4 owned code files have 0 diagnostics. No timeouts, so no re-run was needed. |
| **G43-2 end** | PASS | `gates/g43-2-end.txt` (11:44, node.exe 42): same HEAD, same 5 paths, same shas, 387 OK, protected 4/4. Ignored only: `.claude/settings.local.json`, `.env`, `.gstack/`, `.husky/_/`, `.kilo/` (known). No foreign change. |
| **G43-3** | PASS | `runs/g43-3.txt`, `runs/anon-*.json`, `runs/network-anon-*.txt`, `shots/anon-*.png`. Fresh anonymous daemon (own state `c-round-43/anon/browse-anon.json`, `cookies []`, no `$B restart`). Direct and header-link `/studio-lab`: workspace open, `auth_user` null, cookie empty, badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება". Network (direct, session with REAL add + REAL Space, header): **0** requests to `studio-token`, `recording-`, `/api/download` or R2; media = only the 2 local demo MP3s (`/middle-east.mp3`, `/videos/hero/hero-music.mp3`); hooked fetch/XHR Authorization **0/1**. Other hosts: the known `localhost:5199/api/cart`, GA (consent denied), GTM and Google Fonts. Anonymous token curl → **401** "Please sign in"; fake Bearer → **500** "Unable to prepare Studio access", with no token (known root item). `/studio/middle-east` → "Sign in required", no workspace. **Premium auth is not bypassed.** |

## 2. R43-S — static (PASS)

- `gates/r43-s-master.diff` contains only §2.1 changes: the `METER_CEILING_DB` import, two unexported consts (`MASTER_HOLD_CLAMP_FROM_DB = METER_CEILING_DB − 1`, `MASTER_HOLD_TOP_TRANSFORM = 'translateX(calc(100% - 1px))'`) and the hold transform branch (`holdDb > +5` → top transform, otherwise the unchanged `translateX(f·100%)`). There are no class changes, no layout reads and the same per-frame path. The visibility line is unchanged.
- `gates/r43-s-fg.diff` has 5 hunks, all inside `describe('C-R36-01…')` (which starts at l.1607):
  - the only removed lines are the two `fireEvent.blur(field)` calls (N1, N2), replaced by `act(() => field.blur())`;
  - every snapshot `expect` is kept with the same value;
  - 7 `expect`s were added (activeElement pins in N1/N2, the N2 "Master press does not move focus" pin, and the N5 `'3'` + `undoLabel null` pins).
- `gates/r43-s-static.txt`: no `any`, `@ts-ignore`, `as` cast, `//` comment, hex/rgb colour or `export` in the new tests or the added Master lines. LF line endings.
- 387 OK.

## 3. R43-HT — Master hold tick in real playback (PASS)

**Setup:**
- Layout L43 (video at 0, `სრული მიქსი` music at 7, `Soft impact` SFX at 4), fresh load per run (`c-round-43/fresh43.sh`).
- **REAL:** `$B click` on Master Volume, `$B press ArrowRight/ArrowLeft` steps of 0.5 dB, `$B press Space` play/stop, a REAL click on video Mute where stated, and a REAL click on Master Peak.
- **SYNTHETIC instrumentation:** a read-only page-side sampler (`scripts/sampler.js`), with a `MutationObserver` on `data-hold-db` of the Master meter and of the SFX track meter. On every change it records `getBoundingClientRect` of the meter, the inner tick, the 0 dBFS mark and the track box/tick, plus the inline and computed transform. Summary: `scripts/summ.js`.
- No source instrumentation.
- Expected centre for samples ≤ +5 dB: `(hold+60)/66 × W` from the 1-decimal attribute (±0.06 px rounding) and from the written `%`.

| Case | Run (viewport) | Max hold sample | Result |
|---|---|---|---|
| **HT-TOP** | `runs/ht-top-1440.txt` (1440×900; REAL ArrowRight ×12 → readout `+6.0 dB`; stop 6.43 s) | `+9.4` at 4.001 s: meter 973.09–1053.09 (W 80); tick 78.000–80.000 rel. (w 2.000); inline `translateX(calc(100% - 1px))`; computed `matrix(1,0,0,1,79,0)` | **89/89** samples ≥ +6 are inside, width 2, the same transform. PASS |
| HT-TOP repeat + zoomed shot | `runs/ht-top-1440-cdp.txt` (stop 6.85 s) | same values | **90/90** inside. The 8× CDP capture **during the hold window** (hold = 9.4 before and after the capture) is `shots/ht-top-cdp-5.png`: the tick is at the right end and fully inside. The `rounded-full` vertical clip of the last px is the accepted §0.1.5 case. PASS |
| **HT-1280** | `runs/ht-top-1280.txt` (1280×720; stop 6.995 s) | `+9.4`: meter 813.09–893.09, tick 78–80 rel., `matrix(…79,0)` | **91/91** inside, width 2. The 8× CDP capture `shots/ht-top-1280-hold-x8.png` (started at pos 4.14, inside the hold window) shows the white tick at the right end, inside the box. The grey line at about 72 px is the 0 dBFS mark. PASS |
| (+5,+6) band (§0.1.3) | `runs/ht-band-1440.txt` (Master +2 dB; stop 6.27 s) | `+5.4`: tick 78–80, centre 79, `calc(100% - 1px)` | **91/91** band samples inside. The tick never moves left while the hold rises: `risingLeftMoves` = 0 in every run. PASS |
| **HT-ZERO** | `runs/ht-zero-1440-vmute-b.txt` (video Mute REAL, Master 0; stop 6.66 s) | `0.0` at 4.011 s: centre **72.727** = (60/66)×80 (Δ 0.000); tick 71.727–73.727; mark (border-l) 71.812–72.812 → **overlaps** | 161 samples ≤ +5: max \|Δ\| vs formula 0.061 px, vs written % 0.001 px, all inside, 2 px. 92 near-0 samples all overlap the mark. PASS |
| HT-ZERO (L43 as specified, video audio on) | `runs/ht-zero-1440.txt` | `+3.4` (not ≈ 0.0; see TASK-R43-HTZERO) | 373 samples / 64 distinct holds ≤ +5: max \|Δ\| 0.061 px, all inside. The geometry rule holds |
| **HT-LOW** | `runs/ht-low-1440-vmute.txt` (video Mute, REAL ArrowLeft ×24 → `−12.0 dB`; stop 6.19 s) | `−12.0`: centre **58.182** = (48/66)×80; `translateX(72.7273%)` | 131 samples: max \|Δ\| 0.058 px, all inside. PASS |
| **HT-FLOOR** | `runs/ht-floor-1440.txt` + every "after stop" line | after stop: hold `-inf`, layer `hidden`; Peak keeps `+5.4` / `data-state=over` | a REAL click on Master Peak → `−∞`, `clear`, `past` 7→7 (**0 entries**). PASS |
| **HT-TRACK** | SFX track meter in every run above | max `0.0`: box 300–497, tick 477.27–479.27 (w 2) | `outside = 0` in every run (129–177 visible samples per run). PASS |

**Rule 2 at the 0 dBFS mark:**
- The tick (71.73–73.73) overlaps the 1 px `border-l` mark at 71.81 px.
- The mark sits at 71.81 rather than 72.73 because the bordered flex item shares 79 px of free space. That has been unchanged since round 26 and is not a regression.

**Runs that did not count (budget: 3 valid + 2 replacements per layout):**
- `ht-zero-1440-attempt1-invalid.txt`: the daemon died.
- `ht-zero-1440-vmute.txt`: stopped at 7.53 s, after the 7 s limit, so it was replaced by `-vmute-b`. Its geometry was the same.
- `ht-top-1440-x4.txt`: `--scale 4` was not applied and it stopped at 10.5 s. Its geometry was the same.
- `ht-top-1440-shot.txt`: a screenshot burst. The Playwright screenshot takes 2–4 s under load and missed the window, which is why `shots/ht-*-hold.png` show the decayed tick.
- Each layout stayed within budget: HT-TOP 1440 has 2 valid runs + 2 invalid, HT-ZERO-vmute 1 valid + 1 replaced.

## 4. R43-U — unit tests and mutations (PASS)

Scratch: `c-round-43/mut/scratch`, a copy of `store/app` outside `store/`. `node_modules` was a directory junction to `store/node_modules`, which is not an install. It was **removed with `cmd rmdir`** after the runs, and `store/node_modules` is intact (618 entries). Script: `mut/run-mut.sh` + `mut/mutate.cjs`. Outputs: `mut/run-*.txt`, `mut/summary-1.txt`, `mut/summary-2.txt`.

| # | Mutation | Expected catcher | Result |
|---|---|---|---|
| control | none | — | 5 files / 109 green |
| (a) | snapshot `ArrangementMaster.tsx` (`1707798c`) | HT1 | **HT1 red**: `expected 'translateX(99.99999967176774%)' to be 'translateX(calc(100% - 1px))'`. HT2/HT3 green. This matches A's red run. |
| (b1) | clamp at every level: `calc(f% − f px)` | HT2/HT3 | HT1, HT2, HT3 red (NaN from the plain-% parse) |
| (b2) | wrapper inset `inset-0` → `inset-y-0 left-0 right-px` (transform string unchanged) | HT2/HT3 | **HT2 red** at the class pin |
| (b3) | top transform at every level (`holdDb > METER_FLOOR_DB`) | HT2/HT3 | HT1–HT3 red |
| (c) | visibility always `visible` | HT3 | **HT3 red**: `'visible'` vs `'hidden'` |
| (d) | `fader.focus()` after `beginGesture` (C round 38 (i)) | A-R38 test or documented equivalence | **green**, 6 files / 155 (`fader-focus-order`, `fader-guards`, `fader-click`, `gesture-guard`, `track-pan`, `pan-release-recovery`), as A claimed. See below. |
| (e) | Clip Gain blur during a gesture always resets the text (`ArrangementDetailPanel` blocked branch) | N1 + N5 new pin | **4 red**: N1 l.1630, N2 l.1658, N3 l.1679, **N5 at the new pin l.1711**. On the **snapshot** test file (`e-snap`), only 3 are red and N5 stays green. So the hardening adds real coverage. |

After the runs, all scratch files were restored to the working-copy shas.

**A-R38 equivalence: confirmed. C found no case that differs.** C read the handlers independently:
- **Text fields:** the root capture `releaseTypingFocusBeforeRangePointerDown` (`StudioWorkspace.tsx` l.911–924, bound at l.1334, covering the header Master too) blurs any focused typing target before a range handler runs, when no gesture is active. When a gesture *is* active, the hook refuses before `focus()` (hook l.36–38). So the Clip Gain blur never sees the new gesture in either order.
- **Other blur handlers in the arrangement** (grep `onBlur=`: Clip Gain, Pan, Volume, Master, video float):
  - **Volume and Master:** `beginTrackVolumeGesture` (l.2126) and `beginMasterGainGesture` (l.2372) call `flushPendingVolume` + `flushPendingMaster` after the claim. The later blur then does nothing:
    - `blurTrackVolume` (l.2173) is a no-op for another track's gesture;
    - `commitTrackVolume` returns when `gestureCount > 0` (l.2100);
    - `blurMasterGain` (l.2418) only cancels its *own* gesture.
  - **Pan:** `handlePanBlur` (Lane l.370) acts only during a Pan drag, which is itself an active gesture and is refused first.
  - **Video float:** the blur has no gesture dependence.
- **No focus listeners** (`focusin`/`focusout`/`'focus'`) exist in arrangement code apart from the video float `onFocus`.
- **Claim refusal** (`claimPointerGesture` l.1340) only happens when another gesture is active, and the hook has already refused in that case.
- **Browser cross-check:** REG-CG (S1 with REAL typing) committed `Clip Gain` +3.0 once.
- **Conclusion:** the S1–S5 pins are contract pins that cannot detect the order (A's describe title says so). This is honest, not a gap C can turn into a failing case today.

## 5. R43-REG (PASS)

All REG steps ran at 1440×900 (`runs/reg-1440x900.txt`).

| ID | Steps | Observed |
|---|---|---|
| REG-METER | HT runs | Master +6 → Peak `+9.4` `over` (Clip); Master 0 → Peak `+0.0` (video Mute on; L43 as specified gives `+3.4`, see TASK-R43-HTZERO); a REAL Peak click resets to `−∞`/`clear`; no entry from playback or meter (`past` unchanged during every play). PASS |
| REG-FADERS | SYNTHETIC drag 41 (+10 px) on music Volume, then on Master; REAL keys | The +10 px music Volume drag wrote **no** entry because the value was already at max 1 (no change). Re-measured leftwards (`runs/reg-faders-volume-drag.txt`): −10 px → 1→0.91 with **1** `Volume` entry; a two-move drag (−5, −20 px) → 0.72 with **1** entry. The Master drag gave 0→+6 and **1 entry** `Master Volume`. REAL music Volume ArrowLeft/ArrowRight → 1 `Volume` entry each (0.99, 1). REAL Master ArrowLeft/ArrowRight → 1 `Master Volume` entry each. The HT runs confirm it too: 12 keys → 12 entries, 24 → 24, 4 → 4. That is the accepted FADER-KEY-ENTRIES contract (one entry per key). PASS |
| REG-PAN | REAL click on Pan centre; ArrowRight ×2; REAL click on centre again | click → 0 entries, value 0; keys → `1R`, `2R`, one `Pan — მუსიკა` per key; second click → stays `2R`, **0 entries, no jump**. PASS |
| REG-DEL | SFX clip selected, REAL click on music Volume, REAL Delete, REAL Backspace, REAL Space ×2, then a REAL click on the empty stems lane, then the clip header, then REAL Delete | With focus on Volume, Delete and Backspace **keep** the clip with **0** entries (C-R31-02). Space toggles play (pos 1.0, `playing` true → false). After the lane and clip clicks, Delete → clip removed, **1 entry** `კლიპის წაშლა`, status "კლიპი წაიშალა; სიცარიელე დარჩა." PASS |
| REG-CG | Ctrl+Z, select SFX, REAL type `3` (no Enter), REAL click on music Volume | `Clip Gain` +3.0 dB committed **once** (`past` 10→11), status "Clip Gain: Soft impact — +3.0 dB.", no blocked status, focus on Volume. PASS |

REG-FADERS note: the first +10 px Volume drag was a no-op at max, so C re-measured with leftward drags; both gave exactly one entry.

## 6. R43-Doc (PASS)

Doc 040 exists in Georgian, with English technical terms, and follows `TEMPLATE.md`:
- the header (date, status `Round 43 — D-29z8; C-ის შემოწმებას ელოდება`, project);
- the sections კონტექსტი, მიდგომა, არქიტექტურა (Mermaid), შეცვლილი ფაილები (no code fragments), პრობლემები და გადაწყვეტები, ტესტირება, the Ableton table and TODO (round 44 → round 45 → SRW-14).

It matches the code (the `> +5` branch and `calc(100% - 1px)`), the A-R38 equivalence argument with correct line references (checked in §4), the rounded-full note (l.53) and the A-R37 edits.

## 7. Ableton two-verdict table (§4.8)

| Behaviour | CZABA requirement | Ableton conformity |
|---|---|---|
| Master peak-hold tick fully visible at the top of the scale | **Met** (R43-HT, real playback at 1440 and 1280) | **Not applicable**: CZABA meter geometry; no Ableton source was used or claimed |
| A fader press focuses before its drag gesture | **Met** as an unchanged contract; the order is equivalent and documented (R43-U (d)) | **Not applicable** (D-29z/D-29z3) |
| Clip Gain typed during another gesture is kept until release | **Met** (R43-U (e), N5 pin, REG-CG) | **Not applicable** (D-29z2) |

C makes no claim that "Ableton does it this way" for any row.

## 8. Findings for B

- **No product bug.** Bugs list empty.
- **TASK-R43-HTZERO (task-text note, info):**
  - Under L43 the demo video's own audio (0–6 s) sums with the SFX hit. So at Master 0 the max Master hold is **+3.4**, not the round-26 ≈ +0.0, and at Master +6 it is +9.4.
  - C reproduced the 0 dB fixture by muting the video track (REAL click, 1 entry).
  - Future HT-type tasks should say "video Mute on", or use the measured +3.4.
- **ENV-BROWSE-DAEMON (environment; new symptom):**
  - Each daemon spawned by the gstack CLI exited within about 60–90 s, even idle on `about:blank`: PIDs 16112, 25844, 32156, 2700, 10944, 24952 and 22744 each died (`runs/daemon-diag.txt`). `restart` was not used.
  - A second, foreign `server-node.mjs` (PID 4216, parent gone) was running at the same time. C did not touch it.
  - **Workaround that worked:** C ran `node …/browse/dist/server-node.mjs` as its own background task with `BROWSE_PARENT_PID=0`, a fresh state file and a log (`runs/daemon-fg.log`, `runs/daemon-anon.log`). It stayed up for the rest of the run.
  - **Retry budget:** the task allows one retry with a fresh state file. C exceeded it: 7 CLI-spawned daemons died, then C switched to a self-launched `server-node.mjs`. That self-launched daemon is the deviation. It used fresh state files, no `$B restart` and no foreign process was touched. No criterion was weakened, and all browser IDs were then run on the stable daemon.
  - **Diagnostic value for root:** `runs/daemon-diag.txt` shows the CLI daemons dying while **idle on `about:blank`** (11:21:57 and 11:23:06), not only during playback. So the cause is outside the page under test.
  - Also: under playback load a Playwright `screenshot` takes 2–4 s, while CDP `Page.captureScreenshot` with `clip.scale: 8` takes about 0.4 s. Use CDP for screenshots inside a short window.
- **A-local items (from A, not re-tested beyond the above):**
  - A-R43-REVIEW-W66 (Low: the +5 threshold assumes W ≥ 66 px);
  - A-R43-EXACT-5DB (Low: no pin at exactly +5.0);
  - A-R43-REVIEW-ROOTFONT (Info).
  - C observed the 0.21 px rightward step at +5 indirectly (band samples centre 79 vs unclamped 79.27). It is allowed by §0.1.3.
- **Round 43 is checkpoint-ready from C's side** (5 paths of §3.2; root decides).

## 9. Carried (not re-run this round; not PASS)

- **Not re-run (per §4.5):** exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; the detail-panel geometry.
- **Open C bugs:** C-R41-01 (Low, 1024×768, TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (Tech Lead).
  - **Record** (`runs/c-r23-01-record.txt`): `curl /studio-lab` = **64 312 bytes, 3 NUL at 11729, 28025, 28026**; **1** hydrated U+FFFD `aria-label` (`ბიბ�ლიოთეკის დაკეცვა`, library collapse). Unchanged from round 42.
- **Accepted (B, D-29z8):** FADER-KEY-ENTRIES (C re-observed one entry per key on Volume, Master and Pan); A-R29-REVIEW-1.
  - **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low items:**
  - R26-M1;
  - round 44: R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY;
  - round 45: SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, the DOC034/035/036/015 notes;
  - A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS;
  - DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE.
- **Root items** (`root-pre-push-review.md` 2026-10-07: M1–M3, L1–L4, L6–L8 closed, L5 accepted, nothing else open):
  - `publication-checkpoint.json` still has **no `round42Checkpoint`** entry: the latest is `round41Checkpoint`, and `b6a96f8` is not recorded;
  - GSTACK-ACL; the ignored `.kilo/`; e2e smoke (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths;
  - the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied; fake Bearer → 500 (re-seen); the CDP allowlist; `Content-Type` without a charset;
  - dev-server availability (200 throughout this run); ENV-BROWSE-DAEMON; machine load (node.exe 31–48).
- **Tech Lead manual checks:** R23-1, R23-2, R38-T (+ A-R38/A-R33-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 10. Environment record

- node.exe: 32–48 during the run (per run in the headers).
- Dev server `/studio-lab` 200 throughout.
- Browser: C's own server-node daemons (state `c-round-43/browse-c43b.json` and `c-round-43/anon/browse-anon.json`), left running; the idle timeout is 30 min.
- No `$B restart`. No foreign process was killed. No app source was edited.
