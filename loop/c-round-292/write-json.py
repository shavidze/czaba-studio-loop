import json
L='/home/runner/czaba-project/tmp/studio-real-loop'
env=json.load(open(f'{L}/env-status.json'))
rows={
 "CLAIMS":"PASS: K1 88b23dd unchanged; deltas exactly K2 9, K3 rc1, K5 '91 2 0', K7 '193 379', K8 '180 264 1', K11 '218 1', K12 'exists exists 2', K13 '386 3906 2', plus K14 gains studio-narrow-gate-ui (A's D3, an expected consequence); other K lines identical. L29 grep: 35 untagged hits, all grants/new-file contracts/K-table/paths outside store; none an untagged fact about current store code (c-round-292/l29-untagged.txt)",
 "SOURCE-SCOPE":"PASS: git status = exactly the 9 §4 paths; sha256sum -c fails only on the 5 granted existing files; 7 protected files unchanged",
 "TYPECHECK":"PASS rc 0",
 "UNIT":"PASS: 8 files / 145 tests (7 files 138 + studio-focus-ring 7). NG1–NG9 (+NG5b, NG7a–d, NG9b, NG9c), TH4, TH10 both h1 targets, LRS4 present; LRS describe carries { timeout: 15_000 }. Max shares: LRS4 2578/15000 ms (17 %), NG5 2185/15000 (15 %), MS1 1657/5000 (33 %); none > 50 %",
 "UNIT-MUTANTS":"PASS: 9/9 red on a scratch copy: M1 gate below provider→NG1; M2 latch starts true→NG1,NG9,NG9b; M3 server snapshot false→NG9c only (NG3 green, A's D2 confirmed); M4 >900→NG4; M5 provider only wide→NG5,NG5b; M6 heading focus removed→NG5; M7 workspace kept mounted→NG5,NG5b,NG6; M8 latch during hydration→NG9; M9 stop child removed→NG5b. Restore diff empty",
 "B-NARROW-LOAD":"PASS at 390x844, 768x1024, 899x900: activeElement BODY after 2 s, one visible h1 'The Studio works on a computer', body line exact, arrangement-exit 0 in DOM, scrollWidth = viewport, exit href '/', 0 hydration warnings, 0 non-backend errors",
 "B-BOUNDARY":"PASS: JS 899 narrow only (no exit), 900 workspace + narrow display:none rects 0; no-JS 899 wrapper display:none child rects 0, narrow flex; no-JS 900 the reverse",
 "B-DESK-SAME":"PASS: 0 differing pixels at 1280x720 and 1440x900 vs b-round-291/probe/desk-5173-*.png; 0 hydration warnings",
 "B-THEME":"PASS: body rgb(14, 13, 12); audio color-scheme dark; heading 15.62:1, body line 7.06:1 (exit 7.06, button 15.62)",
 "B-AX":"PASS: 1 heading level 1; Audio role named 'Middle East — public preview'; button 'Send link'; 1 status region (the <output>, A's D1); 1 main landmark",
 "B-FOCUS-ORDER":"PASS: exit → audio (host :focus-visible, 1px brass outline; then 5 native internal stops with Chromium's own white ring, screenshot focus-390-tab3.png) → Send link (:focus-visible, 1px outline)",
 "B-PREVIEW":"PASS: duration 101.35 s (1:41) before Play, readyState 4; after native play click paused false, currentTime +1.005 s in 1 s; second click paused, time frozen",
 "B-SEND":"PASS: (a) 'Link copied', clipboard = URL; (b) writeText reject → \"Couldn't copy the link.\", 'Studio link' field = URL, focused and selected [0,32], second failure refocuses; (c) share stub called once {title:'CZABA Studio', url}, status empty, 0 clipboard writes; (d) AbortError → status empty, 0 writes",
 "B-AUDIO-ERROR":"PASS: route abort → 'Preview unavailable.', label gone, 0 audio, Send link → 'Link copied'",
 "B-RESIZE-KEEP":"PASS (with a recipe note): at 1440 and 1280, narrow → heading focused, workspace gone; Space on Send link → 'Link copied', clipboard = URL; back → same clip count 1, Music muted, data-playing false, focus arrangement-exit, Ctrl+Z un-mutes. The literal recipe's RMS is vacuous (Bass lands on the Music lane, which the recipe mutes: RMS 0 even while playing); C's unmuted variant X-RESIZE-AUDIBLE gives RMS 0.0448/0.0479 while playing and 0 at +100/+200/+300 ms after the resize, both viewports",
 "B-NARROW-WIDE":"PASS: 390→1440 with Send link focused → workspace visible, focus arrangement-exit; add Bass + Play → data-playing true, RMS 0.0479",
 "B-NET":"PASS: 390 media URLs ⊆ {/middle-east.mp3, /videos/hero/hero-music.mp3} = HEAD set; 3 requests (media + fetch of middle-east, fetch of hero-music), all ERR_ABORTED at 390 (provider unmount)",
 "B-JOURNEY-292":"PASS: / → Toggle menu → 'Studio' (href /studio-lab) → narrow state (BODY focus, no workspace) → Send link 'Link copied' → '← CZABA' back to /; 5 screenshots",
 "G292-AUTH":"PASS: /studio-lab anonymous at 1440 (badge 'Demo collection — no sign-in required'), narrow at 390, auth_user null; /studio/middle-east 'Sign in required', 0 audio[src]; /api/studio-token?product=middle-east&file=stem-01.wav without header → 401 'Please sign in to access Studio.', no token",
 "DOC-218":"PASS: l.4 byte-exact; the 7 TEMPLATE headings in order; cited ids NG1, NG5b, NG7a, NG9, NG9b, NG9c, TH4, TH10, LRS4 all exist; limitation (B-R291-NARROW-PREFETCH) and both SABA-Q ids recorded",
 "X-LIBRARY-PREVIEW":"FAIL (C extra probe; A's known gap): library preview stays audible behind the narrow screen with no control",
 "X-BODY-KEYS / X-DELETE-SELECTED":"PASS (C extra): latched narrow with focus on body, Space/Delete/Backspace/Ctrl+X/Ctrl+Z do nothing; selected clip survives Delete (control at wide deletes it)",
 "gate":"full suite, build, Biome, verify, test:e2e:smoke are root gate rows"
}
bug={"id":"C-R292-01","severity":"medium","origin":"B spec (§3.3 named only togglePlayback; A flagged it as a known gap, a-round-292.md 'Known gaps'); caused by this round",
 "row":"X-LIBRARY-PREVIEW (C extra probe of the §1 promise and the 'playback stopped' intent of B-RESIZE-KEEP)",
 "steps":["Fresh context at 1440x900 (also 1280x720), open http://127.0.0.1:5173/studio-lab, wait for 'Demo collection ready'","Click the library option 'Bass', click the library 'Preview' button; master-tap RMS ≈ 0.047","Resize the window to 899 (or 390) px wide","Read the master tap RMS at +0.3, +1, +2.5, +5, +10 s; look for any stop control on the narrow screen"],
 "expected":"Narrowing stops every Studio sound the user can no longer see or control (transport is stopped by StopPlaybackOnNarrow; the library preview must stop too), as at HEAD where the preview's Stop button stayed reachable",
 "actual":"The preview keeps sounding behind 'The Studio works on a computer': RMS 0.102 at 0.3 s, 0.048 at 1 s, 0.046 at 2.5 s, 0.096 at 5 s, 0.103 at 10 s, silent only at 20 s (the preview's natural end). The narrow screen offers only the native <audio> and 'Send link', neither stops it. Widening shows the library button still reading 'Stop'. Both viewports",
 "evidence":"tmp/studio-real-loop/c-round-292/c292.json rows X-LIBRARY-PREVIEW and X-PREVIEW-LIFETIME; shots/libpreview-1440-narrow.png, libpreview-1280-narrow.png, libpreview-390-after-narrow.png; script c292.cjs"}
info=[
 {"id":"INFO-C292-RESIZE-RECIPE-VACUOUS","origin":"B spec","detail":"B-RESIZE-KEEP's recipe adds Bass (which lands on the active Music lane) and then mutes Music, so the master tap reads 0 even while playing; the 'RMS 0 within 300 ms' clause is vacuous as written. C's unmuted variant X-RESIZE-AUDIBLE carries the measurement (0 at +100 ms)."},
 {"id":"INFO-C292-D1-OUTPUT","origin":"A deviation","detail":"Status line is <output aria-live=polite> instead of <p role=status> (Biome useSemanticElements). AX tree exposes role status; B should acknowledge."},
 {"id":"INFO-C292-D2-MUTANT-MAP","origin":"B spec","detail":"§3.5 maps 'server snapshot false' to NG3; under §3.3 SSR renders the wide tree whenever !isHydrated, so NG3 stays green. C confirmed NG9c is the red row (mutants.json M3)."},
 {"id":"INFO-C292-K14","origin":"B spec","detail":"K14 gains studio-narrow-gate-ui.test.tsx after the edit (A's D3); §6 CLAIMS did not list it."},
 {"id":"INFO-C292-D4-HYDRATION","origin":"pre-existing","detail":"A's jsdom 'Prop muted did not match' did not appear in Chromium: 0 hydration warnings at 390, 768, 899, 900, 1280, 1440 in every row."},
 {"id":"INFO-C292-DESK-MEDIA","origin":"this round, accepted in doc 218","detail":"At 1280/1440 the hidden narrow <audio preload=metadata> adds one 'media' request for /middle-east.mp3 (3 media requests on desktop). Belongs to B-R291-NARROW-PREFETCH."},
 {"id":"INFO-C292-AUDIO-TABSTOPS","origin":"accepted deviation §2","detail":"The native audio adds 6 Tab stops (host + 5 internal controls); the internal ones show Chromium's white focus ring, not the brass ring."}
]
passed=[k for k,v in rows.items() if v.startswith('PASS') and not k.startswith('X-')]
out={"round":292,"role":"C","taskStatus":"FAIL","browserVerified":True,"realVerified":True,"envStatus":env,
 "bugs":[bug],"info":info,"passed":passed,"failed":["C-R292-01 (X-LIBRARY-PREVIEW)"],"blocked":[],"gate":["full test suite","build","Biome","verify","test:e2e:smoke"],
 "rows":rows,
 "ableton":{"czabaRequirement":"narrow state, preview, link and no work loss on resize: met except C-R292-01","abletonConformity":"not applicable (Live has no browser or phone version)"},
 "manifestPaths":["c-round-292/claims-on-A.txt","c-round-292/sha-check.txt","c-round-292/l29-untagged.txt","c-round-292/typecheck.log","c-round-292/covering.log","c-round-292/covering-focusring.log","c-round-292/mutants.py","c-round-292/mutants.json","c-round-292/c292.cjs","c-round-292/c292.json","c-round-292/shots/"],
 "missingPaths":[],"countMismatches":[],"claimCheckMinutes":1}
json.dump(out,open(f'{L}/c-round-292.json','w'),ensure_ascii=False,indent=1)
print(len(passed),passed)
