# C round 86 — independent verification (X1 + SRW-20 stage 2: MP3, WAV + MP3)

Verifier: C · Date: 2026-10-22 · Attempt 2 (attempt 1 stopped by session limit; its 1440 suite log `c-round-86/tools/mp-1440.log` was kept and is cited, not re-run).
Target: `http://127.0.0.1:5173/studio-lab`, Playwright Chromium (headless, Linux), new anonymous context per session, real `page.mouse` / keyboard. Viewports 1440x900 and 1280x720.

**Verdict: PASS** — every runnable REAL-browser row ran at both viewports (MP-TIMEOUT at 1440 only, as specified); `browserVerified=true`, `realVerified=true`. One row BLOCKED (fake-Bearer 403, backend unavailable in cloud). No bug found.

## 1. Source state (SOURCE-UNCHANGED)
- Start (15:47, attempt 1) and resume (16:5x): HEAD `51e024a`, `git status` = 6 M + 4 ??, frozen 487/487 OK, A end hashes OK, `app/utils/ffmpeg.ts` = `0995ae78`, protected 4/4 OK (`protected-baseline.json`). End check: §6.
- Server: `:5173/studio-lab` 200 (`env-status.json`).

## 2. Results — main suite `tools/mp.cjs` (both viewports, 16/16 PASS each)
Logs: `c-round-86/tools/mp-1440.log`, `mp-1280.log`; data `mp-1440x900.json`, `mp-1280x720.json`; shots in `c-round-86/shots/`.
Setup: demo project, `projectEnd` = 101.702 s → WAV frames `ceil(101.702×48000)` = 4 881 696.

| Row | 1440x900 | 1280x720 | Evidence |
|---|---|---|---|
| X1-PROJECT | PASS | PASS | No range: project radio checked + enabled, range radio disabled, `aria-describedby=":R6mr5:"` = reason span id, resolves to `მონიშნე დროის მონაკვეთი Arrangement-ში (drag კლიპზე ან სახაზავზე)`; Tab cycle in dialog: დახურვა → WAV-ის ექსპორტი → Close → format(WAV) → **project scope** → wrap; aria snapshot shows range radio `[disabled]` with reason in name. With range 4–9: range checked, no `aria-describedby`, project enabled |
| MP-FORMAT | PASS | PASS | WAV / MP3 / WAV + MP3 enabled, exact labels + notes, video disabled with unchanged reason; no `ამ ეტაპზე ხელმისაწვდომი არ არის`; button text follows format; reopen → WAV. Shot `mp-format-*.png` |
| MP-WAV-UNCHANGED | PASS | PASS | project `czaba-studio-lab.wav` 4 881 696 frames, 24-bit/48k/2ch, exact message; range `czaba-studio-lab-range.wav` 240 000 frames, exact message, ≤1 LSB vs project WAV slice |
| MP-MP3 | PASS | PASS | `czaba-studio-lab.mp3` 3 311 037 B; MPEG-1 L III 48 kHz stereo; **Xing = VBR**, avg 260.4 kbps (hist 32:16, 112:1, 128:1, 192:57, 224:872, 256:2455, 320:838; first frame 320); LAME tag encDelay 576 / padding 1056, Xing duration 101.702 s; decoded (page AudioContext) 4 881 696 frames = 101.702 s; best lag 0; corr L/R 0.99984 / 0.99987; exact message, role=status. Encoder load (msg "encoder იტვირთება" → "MP3-ის შექმნა…") 3 353 ms / 3 466 ms. During render format radios enabled, scope radios disabled |
| MP-REUSE | PASS | PASS | 1 `ffmpeg-core.wasm` request before and after second export; durations 5 001 → 1 461 ms (1440), 5 042 → 1 444 ms (1280) |
| MP-BOTH (project) | PASS | PASS | exactly `czaba-studio-lab.wav`, then `czaba-studio-lab.mp3` (t 1404/1413 ms; 1351/1356 ms); WAV 4 881 696 frames; vs plain WAV: 1440 maxLSB 1 (3 481 nonzero samples — HR-C-R84-L1 jitter), 1280 identical (sha equal); MP3 corr 0.99984/0.99987, lag 0; exact message. Chromium (Playwright) delivered both downloads without a prompt |
| MP-BOTH (range) | PASS | PASS | `-range.wav` then `-range.mp3`; WAV 240 000 frames; vs plain range WAV 1440 maxLSB 1 (3 369 nonzero), 1280 identical; MP3 dur 5.000 s, corr 0.99997, lag 0 |
| MP-RANGE | PASS | PASS | readout 00:04.000 — 00:09.000 (Snap); `czaba-studio-lab-range.mp3`, decoded 5.000 s, corr 0.999965/0.999963, lag 0; message `MP3 შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 48 kHz · stereo.` |
| MP-KEYS | PASS | PASS | Enter on Export opens; Tab to format group; ArrowDown → MP3 radio; Tab to `MP3-ის ექსპორტი`; Enter → `czaba-studio-lab-range.mp3` (a valid range existed, so range scope was the default); focus inside dialog at every step; Escape → focus back on Export |
| MP-MUTE | PASS | PASS | Master Mute pressed: MP3 and WAV + MP3 messages end with ` Master დადუმებულია — ფაილი სიჩუმეა.`; decoded MP3 maxAbs 0 (both) |
| MP-OVERLOAD | PASS | PASS | music muted, Master +6 dB, range 1–6: WAV, MP3, WAV + MP3 warnings identical `გადატვირთვა: პიკი +7.5 dBFS — 5252 sample შეიზღუდა 0 dBFS-ზე. …` |
| MP-NET | PASS | PASS | unpkg requests before the first MP3 click: 0 (also after WAV export); afterwards only `/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js` and `.wasm`; no studio-token / R2 / download request; 0 auth headers |
| REG-HYD | PASS | PASS | main sessions: no hydration / useLayoutEffect warning, no non-noise error |

## 3. Failure paths and video — `tools/fail.cjs`
| Row | 1440x900 | 1280x720 | Evidence |
|---|---|---|---|
| MP-CDNFAIL | PASS | PASS | `page.route('**/unpkg.com/**', abort)`: MP3 → exact load-failure message, role=alert at ~0.4 s, 0 downloads, Close enabled; WAV + MP3 → same, 0 downloads; WAV export → `czaba-studio-lab.wav` 4 881 696 frames, exact message; aborted requests 2 (`ffmpeg-core.js`); after `unroute`, MP3 in the same page → `czaba-studio-lab.mp3`, message exact, decoded 101.702 s, corr 0.99984/0.99987 (7.5 s incl. load). 1280: alert at 0.47 s, 0 downloads for MP3 and WAV + MP3, WAV 4 881 696 frames, retry after unroute → `.mp3`, exact message, corr 0.99984/0.99987, 6.6 s |
| MP-TIMEOUT (1440 only) | PASS | n/a | unpkg route never answered (`ffmpeg-core.js` hung): encoder message from 557 ms; at 60.2 s still `MP3 encoder იტვირთება…`, button `მიმდინარეობს…`, Close disabled (known/intended); exact timeout message, role=alert at 120 394 ms (119 837 ms after the encoder message); 0 downloads; Close enabled afterwards and closes the dialog. Shots `timeout-60s-1440x900.png`, `timeout-msg-1440x900.png`. REG-HYD clean |
| MP-X3 | PASS | PASS | video `beeps-6s-vp9-opus.webm` (local synthetic) at 2–8 s: no fade → video option disabled with unchanged reason, no fades line; after fade-in 1.0 s → round-84 line `ვიდეოს fade-ები მხოლოდ პრევიუშია — …`; MP3 → `czaba-studio-lab.mp3`, WAV + MP3 → `.wav`,`.mp3`; all downloads `.wav`/`.mp3` only |
| REG-HYD (CDN session) | observation | observation (same 2 errors) | exactly 2 console errors `❌ Failed to load FFmpeg.wasm: TypeError: Failed to fetch` from the frozen `app/utils/ffmpeg.ts` (toBlobURL), **induced by C's `route.abort()`**; no hydration warning, no other error. Not a bug of A's work |

- The `ok:false` entries `REG-HYD-CDN-1440x900` / `REG-HYD-CDN-1280x720` in `c-round-86/fail-1440x900-cdn_x3.json` and `fail-1280x720-cdn_x3.json` are exactly these induced-abort errors. Summary verdict: REG-HYD = PASS for every non-induced session.

## 4. G86-3 purchase protection (both viewports; `tools/g86.cjs`, `tools/tok.cjs`)
- `/studio/middle-east` anonymous → "Sign in required", workspace 0 — PASS (both).
- Header link from `/` → `/studio-lab`, workspace present, demo badge `დემო კოლექცია` — PASS (both). localStorage only `czaba_spotlight_last_shown`, `czaba_session_id`; 0 auth headers; no forbidden request.
- `/api/studio-token?product=middle-east&file=stem1.wav` anonymous → **401** `{"error":"Please sign in to access Studio."}` (request API and in-page fetch) — PASS. Without params → 400 (validation before auth, pre-existing).
- Fake Bearer → **500** `{"error":"Unable to prepare Studio access"}` (not 403) → **BLOCKED: backend unavailable in cloud**.

## 5. T86-TARGETED
C re-ran A's `a-round-86/targeted-list.txt` (61 files): **61 passed, 1086 tests passed** (`c-round-86/targeted-c.log`, 16:55 UTC). Full suite / verify / build / Biome / e2e smoke = `gate` rows (not claimed). **Production MP3 (built bundle) not run** — no preview server in the cloud.

## 6. Environment and end state
- 16:56:25 and 16:56:33 Vite logged `new dependencies optimized … reloading` (triggered by C's first visit of `/` and `/studio/middle-east` in g86) and force-reloaded the two open export sessions (MP-TIMEOUT 1440 and CDN/X3 1280) → invalid attempt 1 (`*.invalid1.log`), rerun. Env note for root: the first dev-server visit of a non-lab route re-optimizes deps and reloads every open tab.
- Rerun (16:58–17:00): MP-TIMEOUT 1440 and CDN/X3 1280 both completed validly (1 env-invalid attempt each, within budget).
- End (17:00 UTC): HEAD `51e024a`, 6 M + 4 ??, frozen 487/487 OK, A end hashes OK, `ffmpeg.ts` `0995ae78`, protected 4/4 OK — **SOURCE-UNCHANGED PASS**. Exported `.wav`/`.mp3` files deleted (0 left); hashes and stats kept in the JSONs.

## 7. Extra check (not a B row)
- **EXTRA-FORMAT-SWITCH-DURING-MP3** (1440, `tools/sw.cjs`): switched the format radio to WAV 409 ms after the MP3 click (while the encoder loaded). The running export still produced only `czaba-studio-lab.mp3` and the MP3 message; the button then read `WAV-ის ექსპორტი` and WAV was checked. Matches the M1 spec ("a change during a render does not affect the running export").

## 8. Ableton match (separate from PASS; source: Live 12 manual §5.1.3.1–5.1.3.2 per task §4, not re-fetched by C)
| Behaviour | Status | C observation |
|---|---|---|
| PCM and MP3 rendering | confirmed | WAV and MP3 both export |
| MP3 alone or with a PCM file | confirmed idea, **conscious simplification** | one 3-way radio instead of two toggles; WAV + MP3 = both-or-none |
| MP3 CBR 320 kbps | **conscious difference** | file is VBR (Xing header), avg ≈260 kbps, frames 32–320 kbps; UI does not claim 320 |
| Small silence at MP3 start | same class (fact split) | raw file has LAME encoder delay 576 + padding 1056 samples in the LAME tag; Chromium's decoder honours the gapless tag, so the decoded stream lines up at lag 0 and the length equals the WAV. C does not claim "no silence is added" |
| Render range applies to every format | confirmed | range applies to WAV, MP3, WAV + MP3 |
| Clear error, no file when the encoder cannot load | not applicable (CZABA requirement) | MP-CDNFAIL, MP-TIMEOUT pass |
| Project radio / reason link | not applicable | X1 passes |

## 9. Notes for B (no bugs)
- Default demo project already peaks +1.7 dBFS (470 clipped samples) at Master 0 dB, so every default export shows the overload warning. Pre-existing, unchanged this round; listed for awareness only.
- The frozen `ffmpeg.ts` logs `console.error` on a failed load (induced only by C's abort). Not A's code.
- Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) are `gate`, not claimed. Production MP3 (built bundle) not run: no preview server in the cloud.
- Env: the first dev-server visit of a non-lab route re-optimizes Vite deps and reloads every open tab; avoid running route probes in parallel with export sessions.
- FB-01..FB-16 are not mapped one by one this round; B's §5 rows are the acceptance contract for round 86.
