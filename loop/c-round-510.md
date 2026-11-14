# C — Round 510 (RETRO 510): verdict PASS, 3 Low retro-traceability bugs, browserVerified true

HEAD `f5d1b9e`, `store/` clean at start and end (git status 0 lines; r510 manifest and protected manifest rc 0). Evidence is in `c-round-510/`; JSON is `c-round-510.json` (L57 rc 0, `c-round-510/l57-check.txt`). Full suite, build and `npm run verify` are gate rows and are not claimed.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1, 13 | SOURCE-SCOPE | PASS | 0 lines, both manifests rc 0 |
| 2 | G510-AUTH (browser, both viewports) | PASS | `rows23.json`, `auth-*.png`, `auth2.json` |
| 3 | STUDIO-SMOKE-510 (browser, real audio) | PASS (clean run per viewport in `clean-run.json`; Space behaviour pre-ruled, see below) | `rows23.json`, `smoke2.json`, `wav-decode.json`, `export-*.wav` |
| 4 | RT-SCREEN | PASS | `screens/screen510.json`, PNGs |
| 5 | CLAIMS | PASS (identical to B's output) | `claims-C.txt` |
| 6 | RT-NUM | PASS with Lows C510-RETRO-MEDIAN-IS-MEAN, C510-LESSON-LINE-UNIT, C510-RETRO-REMAINING-79 (see limits) | `data/`, `scripts/` |
| 7 | RT-CAUSE | PASS (spot-check depth stated) | – |
| 8 | RT-IDS | PASS | – |
| 9 | RT-LESSONS | PASS | – |
| 10 | RT-CHECKERS | PASS | `checkers-window.txt`, `ledger-test/` |
| 11 | RT-SABA | PASS, with one observation | – |
| 12 | RT-PRIMITIVES | PASS | – |

## Real browser results (rows 2–4)
- **Auth guard not bypassed.** Fresh anonymous contexts at 1440×900 and 1280×720: `localStorage.auth_user` is null. `/studio-lab` opens the demo ("Demo collection — no sign-in required"). `/studio/middle-east` and `/account/downloads` show "Sign in required" with no stem or download URL (the only matched link on `/account/downloads` is the nav "Free downloads"). `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header returns 401 `Please sign in to access Studio.` and no URL. Four further runs (two per viewport): 0 page errors apart from the expected cloud ones.
- **Cold first load.** The very first anonymous load at 1440 raised `Invalid hook call` / `useState of null` during hydration (cold Vite dependency, same as round 509). Four later runs had 0. I record it as environment (INFO-C510-COLD-HYDRATION), not a Studio bug.
- **Audio graph and output.** An init script wrapped `AudioBufferSourceNode.start`. After one library item was added and Space was pressed, the context was `running` and exactly one source started at `when 0.05` (the 50 ms lookahead), offset 0, a 101.352 s stereo buffer. The state read Playing, then Stopped; the clock was 00:01.471 after 1.5 s and held at 00:01.471 after Stop.
- **Export WAV** (both viewports, byte-identical, sha256 `5fadd97a…`, my own decoder `wavdecode.py`): RIFF/WAVE PCM, 24-bit, 48 kHz, stereo, 4,864,896 frames = 101.352 s. The RIFF size is consistent, peak 1.0 with 0 samples above 1.0001, RMS 0.172, non-zero fraction 0.9977, first non-zero frame 1155. This equals B's dry run.
- **Space after add (info, pre-ruled).** The first Space within about 3 s of adding a clip does not play (Stopped, no source, status 'is ready'); the second plays. This is the round-382 ruling 'no auto-start', stated in the round-391 task and pinned by test EV3 ('Play again → plays'); B's own dry run (`play-wav.json` c1 = 00:00.000) shows it too. Not filed as a bug; Ableton conformance unconfirmed.
- **Clean run.** One run per viewport (`clean-run.json`): clips 0→1, wait 3 s, Space → Playing 00:01.471, Space → Stopped, Export WAV; the file equals the earlier exports (sha256 `5fadd97a…`, 24-bit 48 kHz stereo 101.352 s, peak 1.0, RMS 0.172, 0 bad samples).
- **Screen.** Persistent text lines equal B's at both viewports (138/168/118/144, outside 97/124/86/101); the journey is equal (the only delta is the position readout 00:01.462 vs 00:01.471 at 1440). SR-510-1 (the ruler "0:00" half hidden under the playhead edge) is visible in `screens/screen510-full-S0-1440x900.png`. The journey still lands stems one after another and Export reads 00:00.000–01:04.000 (STEM-LANES, not built).

## Retro traceability (rows 5–12)
- **RT-NUM.** I re-ran all 13 of B's scripts into `c-round-510/data/`; every `.txt` output is byte-identical to B's. Independently of those scripts I recomputed the cost totals from the `*-result.json` files (A 52.68, C 10.61, B 230.77 vs the retro's 230.74 — a rounding difference of $0.03 — total 294.06, B share 78.5 %, median 19.40 vs 19.39, same top five). I also recomputed PASS 12 / FAIL [499, 507] / BLOCKED [496], browserVerified 12/15, the 11 published gates, the STOP rounds 496/499/505/507 and the +19 % against retro 495's $247.20. **Limit:** the deferred-Low counts (79 new, 3 closed) and the category splits come from B's scripts. I reproduced them but did not derive them independently.
- **RT-CAUSE.** I spot-checked the quoted lines in `a-round-496/499/505/507/509.md`, `useAnalytics.ts:77` at `f5d1b9e`, the mutants and sketch-review files, and the "A wrote no code" lines of 502/504. Each fact is present, and opinions are labelled as tech-lead's or product-designer's. I did not read every quoted line of every file.
- **RT-IDS, RT-LESSONS, RT-CHECKERS, RT-PRIMITIVES.** All match [K15]–[K21]. L58 is 13/15 and the ledger rcs match exactly. The fixture gives rc 1, rc 1, rc 0 as specified.
- **RT-SABA.** Everything is information, a proposal or a question; nothing is called Saba's decision. Observation: Q4 (root requests) lists no defaults. Q6 says A's strengthen-only change is "already in force"; the consult marked it a policy change needing B or root agreement, which B's D-ID records. I make no call on that.

## Not covered
- No owned video was loaded, so "fit video" is not exercised or claimed. This was a RETRO round with no Studio change.
- Ableton conformance, reference-first and the screen budget do not apply to a RETRO round.

## New Lows from reading retro §2–§11 in full (origin B spec)
1. **C510-RETRO-MEDIAN-IS-MEAN:** tech-lead's and retro §7's 'median about $17' for the 11 full-sketch rounds is the mean ($17.13); the median is $15.65.
2. **C510-LESSON-LINE-UNIT:** '4,753 B' (retro §9, task K7) is characters; the longest line is 4,771 bytes before and after. The ≤ 4,800 B counter still holds.
3. **C510-RETRO-REMAINING-79:** retro §4 calls the remaining unclassified deferred Lows '79' although 18 of the 79 were classified; the consult says 78 ids.

Also verified in this pass: §9 counters (3 of 10 = L57, lessons size, fix-up chain), the doc ledger 5/11 from `gates/gate-round-N.json` and `b-round-(N-1)/doc-ledger.md`, §10 hunks (old line 44 → new 43 is a pure insertion equal to the consult's E2; old line 43 is the removed E5 line; L26 equals consult §5 C plus B's disclosed additions), §11's 18 ids = the `closes` list, tech-lead's B costs 497/508/509 = $6.74/$8.95/$8.63, `sketch-delta-v1-v2.diff.txt` l.17–42 touches only the mock and types. Journey PNGs open; the 00:01.491 in `screen-review-510.md` is the clock visible in `journey510-2-studio-playing-1440x900.png` (B's JSON read it later, 00:01.471). Temp files outside `c-round-510/` were removed.

STATUS: round 510 PASS; browserVerified true. Return to B: 3 Lows above; info notes in the JSON.
