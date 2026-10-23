# C — Round 93 verification: export dialog radio names, descriptions, format-aware notes (D-29z58)

Verifier: C (Claude Opus 5.5) · Date: 2026-10-23 · Target: `http://127.0.0.1:5173/studio-lab` (Playwright + installed Chromium, headless, fresh incognito context per session, no credentials)
Env: `env-status.json` = store 200 (round 93, attempt 1). Warm-up `/` → `/studio-lab` ran alone first; every session after that ran one at a time.

## Verdict: **PASS**. browserVerified = realVerified = **true**. 0 bugs.

Every browser row that can run in the cloud was run, at both viewports where the task asks for it. One part of one row is BLOCKED: the fake-Bearer part of G93-3 needs the backend. Gate rows are not claimed.

## Source integrity (SOURCE-UNCHANGED): PASS
- **Start = end:** HEAD `64e12d8`, status `2 M + 2 ??`, frozen list **518/518 OK**.
- **Owned file hashes match A:** dialog `0040e050`, doc 080 `ddce83ce`, new test `b54abec3`, doc 081 `944c6480`. CR = 0 in all four.
- **Protected hashes match the Baseline:** fa2cf0bc 13914809 caa388e7 0995ae78 741c2341 ddb70919 56f5b76f bf9ee257 23468664 280fe7f2 140f17ec (`c-round-93/end-hashes.txt`).
- **Dialog `git diff -U0` hunks** (old lines): 28 (constant), 96 (`useId`), 263–323 (format fieldset), 370/378 (range radio), 421/431 (the two notes). All are inside the grant.
- **Doc 080** changes only on l.4. **Doc 081** status line is as specified.

## Acceptance rows
| ID | Result | Evidence |
|---|---|---|
| AX-NAMES (a/b/c) 1280 + 1440 | **PASS** | `out/ax-1280x720.json`, `out/ax-1440x900.json`, shots `ax-{a,b,c}-*.png` (details below) |
| AX-SELECT 1440 | **PASS** | `out/ax-1440x900.json` `.select` (details below) |
| NOTE-FORMAT 1280 + 1440 | **PASS** | `out/note-*.json`, shots `mute-*.png` (details below) |
| NOTE-NOSOUND 1440 | **PASS (real browser, not unit-only)** | `out/note-1440x900.json` `.nosound`, shots `nosound-*.png` (details below) |
| VIS-LAYOUT 1280 + 1440 | **PASS** | `ax-*.json` `.layout`, shots `ax-a-format-*.png` (details below) |
| EXPORT-REG | **PASS** | `out/export-*.json`, shots `export-done-*.png` (details below) |
| KEYS-REG 1440 | **PASS** | `out/keys-1440x900.json` (details below) |
| PX-NET (all sessions) | **PASS** | 0 R2/workers.dev/`studio-token`/`recording-`/`download` requests; 0 `Authorization` headers; unpkg 0 before the first MP3 click (only the MP3 export session loaded `ffmpeg-core.js`/`.wasm`, after the MP3 choice); audio only `/middle-east.mp3` and `/videos/hero/hero-music.mp3` (demo) plus the local owned webm. The other third-party requests are Google Fonts and `localhost:5199/api/cart`, which is expected noise in the cloud |
| REG-HYD (all sessions) | **PASS** | Console capture started before the first navigation: 0 non-noise errors or warnings in all sessions, no hydration warning. C measured the SSR HTML of `/studio-lab` (63,610 bytes): 0 hits for `arrangement-export-title`, `-wav-name` and `:R…:-` ids, so the `useId` ids exist only on the client. The resolved ids were unique |
| G93-3 1440 | **PASS** (fake-Bearer part **BLOCKED**) | `out/g933.json`, shots `g933-*.png` (details below) |
| AN-REVIEW | **PASS** | `c-round-93/mutations.log`, `mutation-results.json` (details below) |
| T93-TARGETED | **PASS** | `c-round-93/targeted-c.log`: A's 18-file list, **18 files / 194 tests pass** |
| SOURCE-UNCHANGED | **PASS** | See the section above |
| gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3) | `gate` | Not run by C (speed rules); results are in `gates/gate-round-93.json` |

### AX-NAMES (a/b/c), 1280 and 1440
Values come from the Chrome AX tree: CDP `Accessibility.getPartialAXTree` on each input.

**(a) Demo clip, no range, no loop.** Every name and description is exact as in the D1 table:
- WAV: `WAV · 24-bit · 48 kHz · stereo` / `მთელი პროექტი, იგივე graph რაც დაკვრისას`.
- MP3, WAV + MP3, video (disabled) and range (disabled): exact name and exact note or reason.
- Project: `მთელი პროექტი · 00:00.000 — 01:41.702`, with no description and no aria attributes.
- `getByRole('radio',{name,exact:true})` count is 1 for all six radios.
- LEAK-RE count is 0.
- Every `aria-labelledby`/`aria-describedby` id resolves to one element inside the dialog.

**(b) Range 4–9 dragged on the clip.**
- The range radio is checked. Its name is `მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)`, with description `null` and neither attribute. There is no Chrome label-fallback description.
- WAV description: `მონიშნული მონაკვეთი, იგივე graph რაც დაკვრისას`.

**(c) Ctrl+L with the range turns the loop on** (`Loop 00:04.000 — 00:09.000`).
- WAV description in range scope: `მონიშნული მონაკვეთი წრფივად, იგივე მიქსით — loop იგნორირდება`.
- After clicking the project radio: `მთელი პროექტი წრფივად 0-დან ბოლომდე, იგივე მიქსით — loop იგნორირდება`.
- Both viewports pass.

### AX-SELECT, 1440
A real-mouse click on each text span:
1. MP3 name span → MP3 is checked and the button reads `MP3-ის ექსპორტი`.
2. WAV + MP3 note span → WAV + MP3 is checked, button `WAV + MP3 ექსპორტი`.
3. WAV name span → WAV is checked, button `WAV-ის ექსპორტი`.

### NOTE-FORMAT, 1280 and 1440
Master is muted with the real Master Mute button (`aria-pressed=true`). The project end read from the dialog was `01:41.702`.

The `arrangement-export-master-mute` textContent was exact in every state:
- WAV → `… — WAV შეიქმნება 01:41.702 …`.
- MP3 → `MP3 შეიქმნება`.
- WAV + MP3 → `WAV და MP3 შეიქმნება`.
- WAV again → the original text.
- Close and reopen after choosing WAV + MP3 → the format is WAV again and the note says `WAV შეიქმნება`.
- Range 4–9 with MP3 → `… — MP3 შეიქმნება 5.000 წმ სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.`

### NOTE-NOSOUND, 1440
- **Setup:** owned local media `media/noaudio-2s-vp9.webm` imported as the only clip, on the video track. The dialog shows `ვიდეოს ხმა არ აქვს` for it, and the project end is 00:02.000.
- Exact no-sound texts for WAV, MP3 and WAV + MP3: `პროექტში ხმოვანი კლიპი არ არის — {WAV|MP3|WAV და MP3} შეიქმნება 00:02.000 სიგრძის სიჩუმით.`
- Range 0.5–1.5 with MP3: `… — MP3 შეიქმნება 1.000 წმ სიგრძის სიჩუმით.`
- No media left the machine.

### VIS-LAYOUT, 1280 and 1440
- Each name span is `display:inline` with no class, a single client rect and 17 px high. In every option the note top is at or below the name bottom.
- Content-span heights:
  - WAV: 36 px (note 16 px, one line).
  - MP3, WAV + MP3 and video: 52 px (note 32 px, two lines).
  - Labels: WAV 62 px, the others 78 px.
- **Baseline:** C round 91 measured the WAV + MP3 option on the same dialog markup (the dialog file is unchanged between 77cd5b6 and 64e12d8): outer span 52 px, note 32 px (2 lines), width 443 px, at both viewports. Round 93 gives 52 / 32 / 443, so the difference is 0 px, within ±1.
- No direct round-92 measurement exists for the other three options. Their structure is equivalent and the screenshots look correct.
- Real-browser text lock: the WAV + MP3 `label.textContent` captured at 1440 is byte-identical to round-91's idle `labelText` (`c-round-91/out/note-1440x900.json`).

### EXPORT-REG
**1280, WAV project:**
- `czaba-studio-lab.wav`, RIFF/WAVE PCM (tag 1), 24-bit, 48 kHz, 2 ch.
- 4,881,696 frames = 101.702 s, which equals the project end exactly.
- NaN 0, peak 1.0, RMS 0.175.
- Done text: `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.`

**1440, MP3 range 4–9:**
- `czaba-studio-lab-range.mp3`, ID3 header. It decodes in the browser to 48 kHz, 2 ch, 5.000 s, peak 1.0.
- Done text: `MP3 შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 48 kHz · stereo.`
- unpkg had 0 requests before the MP3 choice.

The clipping alert (`გადატვირთვა: პიკი +1.7 dBFS …`) is the same pre-existing demo-mix behaviour seen in rounds 90–92 (peak 1.0 there too). It is not new.

### KEYS-REG, 1440
- Opened with the keyboard; initial focus is on `დახურვა`, as in round 90.
- **Tab cycle:** Export button → X → format (one stop, checked WAV) → scope (one stop, checked project) → დახურვა → Export → X.
- **Shift+Tab:** the exact reverse.
- **Arrows:** ArrowDown goes mp3 → both → wav and skips the disabled video radio. ArrowUp goes back. The selection and the button label follow each step.
- **Esc:** closes the dialog, and focus returns to the `Export` trigger.

### G93-3, 1440
- **Header link:** the visible header link `Studio LabDemo` opens `/studio-lab` with the workspace and the demo badge.
- **Purchased route:** `/studio/middle-east` opened anonymously shows `Sign in required`, with 0 workspace and 0 `audio[src]`.
- **Token endpoint:** `/api/studio-token?…` anonymously returns **401** `Please sign in to access Studio.`
- **Fake Bearer:** returns **500** `Unable to prepare Studio access`, because the backend is unavailable, so 403 cannot be shown. This part is **BLOCKED** (backend unavailable in cloud).
- Premium auth was not bypassed.

### AN-REVIEW
I read `export-dialog-a11y-copy.test.tsx`. AN1–AN6 and NC1–NC3 assert exact names, descriptions and texts with `getByRole({name, description})` and `toBe` on full strings.

I re-ran A's mutations in C's own scratch copy (`c-round-93/mut`, `cacheDir` in scratch):
- **a** (drop MP3 `aria-labelledby`) → red AN1, AN2, AN3, AN5 (4 failed).
- **f** (Master-mute note hardcoded to WAV) → red NC1, NC3 (2 failed).
- The unmutated control passes 49/49.
- This matches A's table.

## Two scores (Ableton rule)
- **CZABA requirement met:** yes. GATE91-S1, A-R86-L7 and A-R86-L8 are closed by browser evidence.
  - Every format radio now has its short main text as its name and its note as its description.
  - The disabled range reason is read once, as the description only.
  - Both silence notes name the selected format.
- **Ableton behavioural parity:** **არ ეხება** (not applicable) for both rows, AX-NAMES and NOTE-FORMAT. This is CZABA's own web-dialog accessibility and copy; there is no Ableton source and no parity claim.

## Notes for B (not bugs)
- **Architecture signal:** A's code-reviewer flagged the test-harness duplication (`FakeAudioBuffer` now in 61 test files). I agree it is worth one bounded task.
- **Reviewer's Low rule:** `aria-labelledby` and `aria-describedby` must be added and removed together. C confirmed in the real Chrome AX tree that the valid-range radio gets no fallback description today.
- **Root pre-push items carried:** GATE92-S4 (token URL shown in the console on a failed stem fetch). It is not reachable on `/studio-lab` and remains a prerequisite for the SRW-21 mount stage.
- **`root-pre-push-review.md` items touching this dialog:**
  - **L6** (the `graph` note is inaccurate with the loop on) is already handled: the loop variants of the WAV note were verified in state (c).
  - **M2** (the per-frame `position` re-render, which includes ExportDialog) is still an open performance item, not in this round's scope.
- **Housekeeping:** the 29 MB WAV from EXPORT-REG was deleted after parsing; its stats are in `export-1280x720.json`.
- **Tools:** all under `c-round-93/tools/` (`lib93.cjs`, `ext.cjs`, `ax.cjs`, `note.cjs`, `exp93.cjs`, `keys93.cjs`, `run-g933.cjs`, `run-mutations-c.py`).
