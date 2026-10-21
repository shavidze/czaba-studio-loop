# C — Round 37 verification: C-R36-01 (D-29z2) + round-36 test nits + doc 036

Verifier: C (independent) · Date: 2026-10-13 · 18:14–18:28 +04:00 · Raw evidence: `c-round-37/`
Browser: gstack `/browse` (`c-round-34/b.sh` wrapper, state `c-browse.json`), HeadlessChrome. Before G37-3 the daemon was restarted (`$B restart`), which gives a fresh context with no credentials (`auth_user` null, cookie `''`).
Harness labels: **REAL** = `$B click` at the element centre or `$B press`/`$B type`. **SYNTHETIC** = the dispatched separator `pointerdown`/window `pointerup` id 41 and the kdrag Volume drag. C instrumentation (labelled): the `window.__c` state reader and the earlier-round hooks installed by `c-round-34/reset.sh` (`hook30.js`, `hook31.js`, `hst.js`, `ptail.js`, `hl.js`), plus a fetch/XHR Authorization hook (`c-round-35/scripts/authhook.js`). No source instrumentation. `node.exe` is recorded in every run (6–7 throughout).

## 1. Verdict

**Task status: PASS.** Every round-37 acceptance ID passes on C's own runs: G37-1, G37-2, G37-3, R37-S, R37-PG, R37-MN, R37-CR, R37-K, R37-U and R37-Doc.

**C-R36-01 is fixed in the browser.** In round 36 (OT-5b) a synthetic separator gesture plus a real Master click reset the field to `0.0` and the typed `3` was lost. Now the field keeps `3`, and Enter or a blur after release commits it once.

I also logged two new Low items for B. They don't fail any acceptance ID:
- **C-R37-01:** UX residual of the kept text.
- **C-R37-02:** B's D-29z2 row 5 wording is wrong.

A's numbers reproduce exactly:
- the red run (my mutation (a) is byte-identical to the snapshot source and gives exactly N1–N3 red);
- green 71/71;
- full vitest 1264.

## 2. Gates

| ID | Result | Evidence |
|---|---|---|
| G37-1 | **PASS**. tsc exit 0 (0 lines). vitest **69 files / 1264 passed**. build ✓ (2.83 s). Biome `./app`: **2 errors**, only the `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` (baseline CRLF, root's), plus 218 warnings and 1 info. 0 diagnostics mention `ArrangementDetailPanel` or `fader-guards`. The 12 related files are green (**324 tests**, fader-guards **71**). node 6. | `c-round-37/gates/summary.txt`, `vitest-full.txt`, `biome-app.txt`, `biome-errors.txt` (`--diagnostic-level=error`), `related.txt` |
| G37-2 | **PASS**, same at start (18:14) and end (18:27). HEAD `1cefea18500a…`. `git status --short` = **10 lines** (the 9 baseline lines plus ` M ArrangementDetailPanel.tsx`). Frozen list **376 OK**, 0 non-OK. Protected 4/4 OK. Shas `a48523be` / `3d120483` / `294326f8` (= A's). | `gates/g37-2-start.txt`, `gates/g37-2-end.txt` |
| G37-3 | **PASS**. The fake Bearer 500 is a known root item and is carried. | §2.1 |

### 2.1 G37-3 (anonymous, fresh context)

- **Header link:** a real click on the visible `Studio LabDemo` link (`a[href="/studio-lab"]`, 1 visible, at 906,40) on `/` goes to `/studio-lab`. The workspace and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ are shown; `auth_user` null, cookie `''`. Evidence: `runs/anon-header.json`, `shots/anon-header.png`.
- **Direct open after a second restart:** the same result. Evidence: `runs/anon-direct.json`, `shots/anon-direct.png`.
- **Network:**
  - the header and direct loads: 0 requests to `studio-token`, `recording-*` or `/api/download`, and no R2 host. Media is only `middle-east.mp3` and `hero-music.mp3`. The only API call is the known `localhost:5199/api/cart`. Evidence: `runs/network-anon-*.txt`.
  - the R37-PG session (1440 + 1280, cleared before PG-1): **0 requests**, and the Authorization hook shows `[]`. That context is anonymous after all runs (`auth_user` null, cookie `''`, appended to `g37-3-session-auth.txt`). Evidence: `runs/network-session.txt`, `runs/g37-3-session-auth.txt`.
- **curl:** an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401** `Please sign in to access Studio.`. A fake Bearer returns **500** `Unable to prepare Studio access` and no token (a known root item). Evidence: `runs/curl-token.txt`.
- **`/studio/middle-east`:** "Sign in required"; no workspace; `auth_user` null. **Premium auth is not bypassed.** Evidence: `runs/anon-studio-me.json`, `shots/anon-studio-me.png`.

## 3. R37-S — static diffs (PASS)

Live files vs `b-round-36-snapshots/` (`gates/snap-*.diff`):
- **`ArrangementDetailPanel.tsx`:** exactly one hunk `@@ -332,7 +332,9 @@`: `setClipGainText(currentText);` wrapped in `if (trigger === 'enter') { … }`. Nothing else.
- **`fader-guards.test.tsx`:** 3 hunks, **0 `-` lines**, 98 `+` lines:
  - the pin in case 7;
  - the 2 `start.value` pins in case 8, each right after a `range` check;
  - the nested describe `C-R36-01: … (D-29z2)` (2 helpers, `INVALID_STATUS`, 5 `it`), appended before the round-36 describe's closing line.
- **Doc 036:** 3 hunks:
  - the header (l.4);
  - the l.436 clause (the only change in that line is `ბრაუზერში არ შემოწმებულა` → `C-მ round 36-ში … გაიმეორა (C-R36-01, …OT-5b), round 37-ში გასწორდა (D-29z2)`);
  - the append `@@ -466,3 +466,70 @@`.
- **Banned patterns:** no `any`, `@ts-ignore`, hardcoded colour or `//` comment in the added lines.

## 4. R37-PG — C-R36-01 harness (PASS)

Layout L37 = L36 (`c-round-34/reset.sh`): video `43e5be87` at 0 / 6.008; music `c17f72ac` at 7 / 16; SFX `af7667bc` (`Soft impact`) at 4 / 2. `past` 3. Detail panel expanded (`aria-expanded=true`).

Every case starts the same way:
1. a real click on the SFX header, a real click into Clip Gain, Ctrl+A, then real typing of `3`;
2. the SYNTHETIC `pointerdown` 41 on the separator → `{"ok":false,"defaultPrevented":true,"gesture":true}`;
3. a REAL click on Master Volume;
4. the SYNTHETIC window `pointerup` 41 → `gesture:false`.

| Step | Round 36 OT-5b (before fix) | PG-1 1440 | PG-2 1440 | PG-3 1440 | PG-1280 |
|---|---|---|---|---|---|
| after the real Master click | field **`0.0`**, blocked status, focus Master, past 3, SFX `-` | field **`3`**, blocked status, focus `Master Volume`, past 3, SFX `-`, Master `0` (unchanged), gesture true | same | same | same |
| after `pointerup` 41 | field `0.0` (lost) | field `3`, gesture false, past 3 | same | same | same |
| then | (header click: nothing) | real click into the field (focus = field) + real Enter → past 4, tail `[…, Clip Gain]`, SFX **3**, status `Clip Gain: Soft impact — +3.0 dB.`, field `3.0`. Real ruler click → focus **BODY**, pos 14.4. Real Ctrl+Z → status `Undo: Clip Gain`, SFX `-`, past 3 | real click into the field, then a real click on the SFX header → past 4, tail `[…, Clip Gain]`, SFX **3**, status `+3.0 dB`, focus BODY | real click on the music header → music selected, field `0.0` (its own value), **0** entries, SFX `-`. The blocked status persists (stale; C-R31-INFO-REFUSAL-STATUS, stage 4b). Back on SFX: field `0.0` | as PG-1: +1 `Clip Gain`, `+3.0 dB`, field `3.0`; ruler → BODY (pos 12.4); Ctrl+Z → `Undo: Clip Gain`, SFX `-` |

Evidence: `runs/pg-1440.txt`, `runs/pg-1280.txt`, `shots/pg-1280-end.png`; baseline `c-round-36/runs/ot.txt` OT-5b.

## 5. R37-MN — must-not (PASS)

| Case | Result | Evidence |
|---|---|---|
| **MN-1** Enter during a gesture: `3` typed, SYNTHETIC 41 held, REAL Enter | status blocked, field reset to **`0.0`**, past 3, focus stays on the field; after `pu41` still `0.0`. **PASS** (unchanged Enter contract) | `runs/mn.txt` |
| **MN-2** unchanged `0.0` during a gesture → REAL Master click | field `0.0`, 0 entries, Master `0`. The status changed from the marker (`Clip Gain უცვლელია: 0.0 dB.`) to blocked. **Control** (`runs/mn-control.txt`): the same status appears with **no field focused** (BODY) and with a focused music Volume. So the Master press refusal itself sets it (StudioWorkspace/Context gesture refusal), not the field. The field adds nothing. **PASS** | `runs/mn-marker.txt` MN-2', `runs/mn-control.txt` |
| **MN-2b** (probe for row 5) `0.00` (normalised-equal, different text) during a gesture → REAL Master | field **keeps `0.00`**, blocked status, 0 entries. After release, refocus + Enter: `Clip Gain უცვლელია: 0.0 dB.`, field `0.0`, 0 entries. So the early return compares the **raw text**. A's doc is right and B's wording "normalised-equal → early return" is wrong (**C-R37-02**, Low, wording only) | `runs/mn.txt` |
| **MN-3** invalid `-` / `1e` during a gesture → REAL Master | blocked, field value `""` with `validity.badInput=true` (the displayed text is kept; the number input reports `""`), 0 entries. After `pu41` still `badInput`. Real refocus + Enter → `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).`, field `0.0`, 0 entries. **PASS** (with a distinct status marker before `1e`) | `runs/mn.txt`, `runs/mn-marker.txt`, `shots/mn3-field-*.png` |
| **MN-4** invalid `-`, no gesture → REAL Tab | marker → invalid status, field `0.0`, 0 entries (= round 36 OT-2c). **PASS** | `runs/mn-marker.txt` MN-4' |

Note: the first MN-2/MN-3(`1e`)/MN-4 runs began with an already-matching stale status. They were re-run with a distinct status marker (`mn-marker.txt`), and the marker runs decide these rows.

## 6. R37-CR and R37-K (PASS), `runs/crk.txt`

| Row | Result |
|---|---|
| CR-1 | Clip Gain `3` → REAL click on music Volume → past 5, tail `[…, Clip Gain, Volume]`, SFX 3, status `+3.0 dB` (no blocked status), Volume 0.5. Ctrl+Z → `Undo: Volume`, Volume 1. Ctrl+Z → `Undo: Clip Gain`, SFX `-` |
| CR-2 | Clip Gain `3` → REAL click on Master → tail `[…, Clip Gain, Master Volume]` (Master −27 = the known jump-click, stage 4b) |
| CR-3 (R34-CG CG-1) | Clip Gain `3` → REAL click on the music header → +1 `Clip Gain`, music selected, focus BODY. Delete → `კლიპის წაშლა`, the music clip removed |
| K-1 | Enter → +1 entry, `+3.0 dB` |
| K-2 | 0 dB reset (REAL) → +1, `Clip Gain: Soft impact — 0.0 dB.` |
| K-3 | Escape → 0 entries, field `0.0`; the following blur → 0 entries |
| K-4 | the 0 dB reset during SYNTHETIC 41 (gain 3 committed first) → status blocked, 0 entries, SFX stays 3; after release, 0 entries |
| K-5 | SYNTHETIC music Volume drag, no field focused → `dPast` 1, tail `[…, Volume]`, Volume 1 → 0.7 |

## 7. R37-U — tests and mutations (PASS)

The 5 new cases and 2 pins exist (§3) and are green: fader-guards 71/71 in `gates/related.txt` and in the full run.

The mutations ran in a scratch copy `c-round-37/mut/app`. `node_modules` was a junction to `store/node_modules`, removed after the run with `rmdir`, and `store/node_modules` is intact. Each mutation was applied by a literal-string replace that must match exactly once (`mutate.cjs`). Scope: `fader-guards` + `clip-gain` (99 tests). After restore, `diff -rq store/app mut/app` → identical.

| Mutation | Diff lines | Result | Failing tests | Expected (B) | Verdict |
|---|---|---|---|---|---|
| control | 0 | 99/99 | — | green | ✓ |
| (a) unconditional `setClipGainText` (**= snapshot `60d24bb0`, byte-identical by `cmp`**) | 4 | **3 failed \| 96 passed** | N1, N2, N3 only (fader-guards: 3 failed \| 68 passed) | N1–N3 | ✓ (independently confirms A's red run) |
| (b) `trigger === 'blur'` | 2 | 5 failed | N1–N4, plus frozen `clip-gain.test.tsx` l.815 | N1–N4 + l.815 | ✓ |
| (c) delete `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` in the branch | 1 | 4 failed | N1–N4; **l.815 survives** (recorded, as B allowed) | N1–N4 | ✓ |
| (d) delete the whole gesture branch | 7 | 5 failed | N1–N4 + l.815 | N1–N3 (minimum) | ✓ (bites harder than predicted, as A's reviewer foresaw for N4) |
| (e) change `DETAIL_CLIP_GAIN_INVALID_MESSAGE` | 2 | 4 failed | case 7 (pin live), the round-34 header case, a clip-gain status test, N3 | case 7 | ✓ |

Evidence: `runs/mut-summary.txt`, `runs/mut-*.txt`, `runs/mut-*.diff`, `mut/run-mut.sh`, `mut/mutate.cjs`.

## 8. R37-Doc (PASS, with notes for B)

- The appended "Round 37" section covers everything §2.2 asks for:
  - the steps and cause;
  - the D-29z2 table;
  - decisions 1–5 with the rejected loci B and C;
  - the Enter/blur asymmetry;
  - the selection limitation;
  - that the stale status stays for 4b;
  - N1–N5, the pins and red/green `3 failed | 68 passed (71)` → 71 → 1264 (matches my mutation (a) and gates);
  - the C IDs and the Ableton note.
- The l.436 clause is accurate against `c-round-36/runs/ot.txt` OT-5b.
- **C confirmed these doc claims in the browser:**
  - row 5 (raw-text comparison; `0.00` vs `0.0` → blocked + kept; the later commit changes nothing): MN-2b;
  - "panel collapse doesn't erase the text": `runs/kept.txt` KEPT-1 (collapse/expand → still `3`);
  - "a later fader press does not commit it": KEPT-2.
- **Notes for B (not FAIL):**
  - **DOC036-R37-TAIL:** the unchanged tail of the l.436 sentence still says "…ღიად რჩება (A-R36-REVIEW-1 …; შესაძლოა ეტაპი 4b)". This contradicts its own new clause. The append says it supersedes the tail. B decides on a one-clause amendment.
  - **DOC036-ROUND-REF:** l.468 says stage 4b is "round 37"; it is round 38.
  - **C-R37-02:** B's D-29z2 row 5 in `current-task.md` §0 and `plan.md` says "normalised-equal text … early return". The browser shows otherwise (MN-2b), so the plan/task wording needs amending. Code and doc are consistent.

## 9. New findings

**C-R37-01 (Low, UX residual of D-29z2; documented by A, review R3; stage 4b candidate).** `runs/kept.txt`:
1. In KEPT-1, after the PG sequence the field shows `3` with no dirty marker and focus is elsewhere. The stored value is still unset (SFX `-`), and the status says only "blocked".
2. KEPT-2: a REAL click on music Volume (no gesture) writes `Volume` (past 4). The kept `3` is **not** committed, and the stale blocked status remains even though the Volume edit succeeded.
3. A later click into the field followed by a blur commits `Clip Gain` **after** the Volume entry (tail `[Volume, Clip Gain]`).

No data is lost, but the field looks committed when it is not, and the status misleads. This is not an acceptance failure; D-29z2 explicitly accepts it.

**C-R37-02 (Low, docs/plan wording):** see §8.

## 10. Ableton source — two verdicts (§4.6)

Source: Live 12 Reference Manual §18.1 "The Live Mixer", via B's capture `b-round-29/ableton-mixing-20261012.txt` (2026-10-12). C browsed no new source; no video.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| A typed, uncommitted value survives when another pointer takes focus during a drag | **PASS** (R37-PG) | **დაუდასტურებელი** (unconfirmed): the source says nothing about this |
| Enter during another drag is refused and reverts | **PASS** (R37-MN MN-1) | **დაუდასტურებელი** (unconfirmed) |
| Pan/Volume double-click reset | not in this round | **არ ეხება** (not applicable) this round (§18.1 confirmed; stage 4b, round 38) |

No claim is made that Ableton behaves this way.

## 11. Not run (not PASS)

- `npm run test:e2e:smoke`: it starts its own dev server, so only root runs it.
- Out of round scope per §4.7, not re-run:
  - exports and WAV data/duration/sample integrity;
  - audio graph checks (R31-PE/PV/PL);
  - R36-CL live audio;
  - PUI geometry;
  - video sync / transport;
  - the C-R27-01 table;
  - the full find sound → add → fit video → export flow;
  - FB-01..FB-16 (stage regression).
- Real multi-pointer input (CDP touch): not run. C-R36-01 was verified with a synthetic gesture plus a real mouse click, as specified. A two-pointer touch test stays an optional Tech Lead check.

## 12. Carried (unchanged; not new bugs)

- **C-R23-01 record:** `curl -s /studio-lab` = **63 520 bytes, NUL 2 at 28013, 28014** (= round 36). Evidence: `runs/c-r23-01-record.txt`.
- **Open C bugs:**
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 (Tech Lead);
  - C-R30-01 (polish).
- **Open low items:**
  - R26-M1;
  - stage 4b items, including the jump-click (CR-2: Master −27) and the stale refusal status (seen in PG-3, KEPT-2);
  - R9-REVIEWER-M1-L8, A-R34-REVIEW-RESIDUALS;
  - DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON;
  - DOC034-UNREACHABLE-NOTE, DOC035-NOTES, DOC015-DELETE-GAP-NOTE;
  - EXPORT-DIALOG-FOCUS-RESTORE;
  - A's review residuals R4 (N5 has no mid-test `'3'` pin) and R5 (jsdom `field.focus()` is a no-op after `fireEvent.blur`): test hardening for B.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, B §4.8):
  - rounds 31–34, 36 and now 37 (10 status lines) are C-verified and ready for root's checkpoint commit (root runs its own gates and review);
  - `test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS (no limiter);
  - CRLF Biome errors on the 2 auth files;
  - the `frontend-architect.md` Write/Bash grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the fake Bearer → 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - the dev server's availability.
- **Tech Lead manual checks:** `feature-status.md` §5 (R35-T, R30-T, R31-T, R33-T, R34-T); optionally a real two-pointer C-R36-01 test; TL-Q-FB05-FB11.
