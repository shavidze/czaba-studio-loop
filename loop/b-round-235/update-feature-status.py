p='feature-status.md'; lines=open(p).read().split('\n')
assert lines[2].startswith('განახლდა: 2026-10-28 · ავტორი: B (round 234 → round 235')
lines[2]=lines[2].replace('B (round 234 → round 235 დაგეგმვა, D-29z327…D-29z332)','B (round 235 → round 236 დაგეგმვა, D-29z333…D-29z338)')
i=[k for k,l in enumerate(lines) if l.startswith('- **Round 235 (D-29z327…D-29z332): SABA-B-11a ეტაპი 2 — მუშავდება.**')]
assert len(i)==1; i=i[0]
old=lines[i]
lines[i]=('- **Round 235 (D-29z327…D-29z332): SABA-B-11a ეტაპი 2 — მზადაა (C PASS, `browserVerified: true`, `realVerified: true`, გამოქვეყნდა `49b4c74`, D-29z333).** '
 'C 19 row PASS, 0 blocked (`c-round-235.json`). **SABA-B-11a — მზადაა** (ეტაპი 1 `c95b8a8`, ეტაპი 2 `49b4c74`, ორივე ბრაუზერით). '
 'ღია ბაგები ამ გზაზე: GATE235-S1 (Medium — scrub ზოლზე double-click დაკვრას იწყებს და Fit-საც აკეთებს), A-R235-REVIEW-M1 (Medium, ფარული — render-state `isPlaying`), C-R235-01 (Low — ბოლოზე snap → დაკვრა 0-დან) → round 236 SABA-B-11a-FIX-1. '
 'C-R235-02 (Low — Follow ruler-ის click-ზე Live 6.2-ისგან განსხვავდება) → SABA-B-10a-ის ფარგლებში (D-29z335). ძველი ჩანაწერი: '+old[2:])
new236=('- **Round 236 (D-29z333…D-29z338): SABA-B-11a-FIX-1 — მუშავდება.** scrub ზოლის „play from here“ გზის სამი ბაგი: context-ის ახალი `playFrom` კითხულობს `isPlayingRef`-ს (A-R235-REVIEW-M1); '
 'ზოლზე დაწყებული double-click აღარ აკეთებს Fit-ს, ქვედა ზონა — აკეთებს (GATE235-S1; zone ჩაწერილი pointerdown-იდან, რადგან Chromium `dblclick`-ს capture-ის root-ზე აგზავნის); '
 'ბოლოზე snap → `playPastEnd` status, დაკვრა 0-დან აღარ (C-R235-01). Saba-ს ახალი კითხვა: SABA-Q-SCRUB-DOUBLE-CLICK. '
 'შემდეგი: round 237 SABA-B-11a-FIX-2 (seed status: A-R234-REVIEW-M1 — `/studio-lab`-შიც მიღწევადია ჩატვირთვიდან ~1–2 წამში, B-R235-READY-CLOBBER; GATE234-S2, GATE234-S3), შემდეგ SABA-B-11b. `current-task.md`, `b-round-235.md`')
lines.insert(i+1,new236)
j=[k for k,l in enumerate(lines) if l.startswith('| SABA-B-9-10-11-TRANSPORT-GRID | **მუშავდება** —')]
assert len(j)==1; j=j[0]
lines[j]=lines[j].replace('| SABA-B-9-10-11-TRANSPORT-GRID | **მუშავდება** — ','| SABA-B-9-10-11-TRANSPORT-GRID | **მუშავდება** — SABA-B-11a **მზადაა** (round 234 `c95b8a8` + round 235 `49b4c74`, C PASS ბრაუზერით); round 236 = SABA-B-11a-FIX-1 (GATE235-S1, A-R235-REVIEW-M1, C-R235-01, D-29z333); round 237 = SABA-B-11a-FIX-2 (seed status, D-29z334); შემდეგ 11b → 10a (C-R235-02-ით) → 10b → 9 → 11c. ძველი: ',1)
open(p,'w').write('\n'.join(lines))
print('ok')
