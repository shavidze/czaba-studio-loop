P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
lines=open(P,encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა: 2026-11-10 · ავტორი: B (round 436 → round 437 დაგეგმვა, D-29z1548…D-29z1552)')
lines[2]=lines[2].replace('B (round 436 → round 437 დაგეგმვა, D-29z1548…D-29z1552)','B (round 437 → round 438 დაგეგმვა, D-29z1554…D-29z1558)')
i=next(k for k,l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1548…D-29z1552): **round 437 = COPY-PD-VIS ეტაპი 2 — მუშავდება.**'))
assert lines[i-1].startswith('  - **Round 436 = COPY-PD-VIS ეტაპი 1')
done=('  - **Round 437 = COPY-PD-VIS ეტაპი 2 (STUDIO-VIS-7 + STUDIO-VIS-10 + SABA-LANE-RESIZE-HANDLE) — მზადაა (D-29z1554).** '
 'C round 437 PASS: 14 row, `browserVerified`/`realVerified` true, 1 Low (`c-round-437.json`). B-მ გაიმეორა L57 (`b-round-437/l57-check-c437.txt` OK). '
 'Gate 437 გამოქვეყნდა `142918b` (review: COMMIT OK, 8/10). Export — შევსებული brass; CZABA — foreground; ხაზებს შორის 1 px hairline (hover /25, drag /40); WAV export 29189420 B. '
 'C-R437-01 (Low, pre-existing): Play, როცა კლიპი ჯერ decode-შია, „Loading …“ → „… is ready.“-ს წერს, მაგრამ თავად არ იწყება — round 382-ის შეგნებული წესი (D-29z1555); C-ის „სტატუსი არ ჩანს“ შესწორდა B-ის probe-ით (`b-round-437/probe/play-status.json`); auto-resume — კითხვა საბასთვის (`user-review/note-round-438-play-after-decode.md`), `deferred_low_polish`. '
 'Gate-ის და A-ს Low-ები (GATE437-S1/S4/S5, A-R437 CR-3/CR-6) → `deferred_low_polish`; L61-ის „pointer capture“ შესწორდა (D-29z1556).')
nxt=('  შემდეგი (D-29z1554…D-29z1558): **round 438 = SYS-R435-SOURCE-SCAN-HELPER — მუშავდება.** მხოლოდ ტესტები: ერთი საერთო source-scan helper TypeScript parser-ზე '
 '(`ts.createSourceFile`; spread = `JsxSpreadAttribute`, ზუსტი attribute-ის სახელები, syntax error → `path:line`), რეკურსიული walk `app/components/arrangement`-ში (ARCH-SPLIT-მდე, L8); '
 'ექვსი scanner (NF2, RD2 + ახალი IN1, PG2, SF1/SF2, DS4, HS1/HS2) გადატანილია; ხურავს 10 deferred Low-ს (+ GATE434-S2-ის subfolder ნახევარს), თითოეული mutant-ით (M1–M16, H1–H9, `b-round-437/mutants/`). '
 'Sketch `b-round-437/sketch-438.patch.txt` (v3), tech-lead: v1 → engine switch, v2/v3 approve-with-lows (`b-round-437/sketch-review.md`). C: patch identity, covering 23/23, mutants, sweep, auth + smoke + რეალური WAV export ბრაუზერში.')
lines[i]='  ძველი: '+lines[i].lstrip()
lines[i:i]=[done,nxt]
j=next(k for k,l in enumerate(lines) if l.startswith('- **SABA-LANE-RESIZE-HANDLE** (Low, Saba 2026-11-10)'))
lines[j]+=' **მზადაა — round 437 (D-29z1554)**: C PASS, gate 437 `142918b`.'
open(P,'w',encoding='utf-8').write('\n'.join(lines))
print('ok', i, j)
