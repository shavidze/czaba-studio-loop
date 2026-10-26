import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
d=json.load(open(L+'backlog.json')); d['updated']='2026-10-26 (B round 190 -> 191 planning, D-29z156)'
json.dump(d,open(L+'backlog.json','w'),ensure_ascii=False,indent=1)
p=L+'feature-status.md'; s=open(p).read(); lines=s.split('\n')
lines[2]='განახლდა: 2026-10-26 · ავტორი: B (round 190 → round 191 დაგეგმვა, D-29z156) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
i=[k for k,l in enumerate(lines) if l.startswith('- **Round 189 (D-29z154): STORE-1d')][0]
new190=('- **Round 190 (D-29z155): STORE-1d-ის გასწორება — მზადაა; STORE-1 — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`, 16 row, ბაგი 0; gate 190 გამოქვეყნდა `338564e` (rounds 189 + 190). '
 'CLS-FRESH-190: fresh-mode CLS median 0.00005 / 0.0014 / 0.0009 (375 / 1280 / 1440), overlay-ის shift 0; overlay-ის მშობელი `BODY`, სიმაღლე = viewport. დადასტურებული მიზეზი (A-ის bisect): `PageTransition`-ის `translateY` transform იყო fixed overlay-ის containing block; გამოსწორება — `createPortal` `document.body`-ში. '
 'DUR 1158.9–1165.5 ms, HIT ≤ 964 ms, SKIP (Tab / Shift+Tab 2.4–3.8 ms, R67), H1, RM, SESSION, STORE-AFTER (0 px), G190-3, STUDIO-RV (0 px), T-RUN (m1–m4) — PASS (`c-round-190.md`). C-R189-01 და C-R189-02 დაიხურა. '
 'ინფო: C-R190-I1 (portal-ს unit test არ იცავს → შემდეგი SpotlightLoader-ის მფლობელი რაუნდი + რეგრესიის store smoke), I2 (harness-ის წესი), I4 (ArrowDown loader-ის ქვეშ გვერდს ახვევს → `deferred_low_polish`). '
 '**Round 191 (D-29z156): SABA-B-3 — მუშავდება.** Saba-ს ბაგი (Medium): fader-ზე დაჭერისას მთელი კონტროლი brass ყუთად იქცევა. B-მ ბრაუზერში გაიმეორა (`b-round-190/shots/vol-pressed.png`): `ring-2` + global `:focus-visible` outline (ჰიპოთეზა, A ადასტურებს). '
 'R68: ხაზის/ჯგუფის/Master-ის/Clip Gain-ის fader — graphite track, brass value fill, ჩვეულებრივი ივორის thumb; R69: ექვსივე range-ზე ერთი თხელი offset ring; R70: Pan და Zoom — მხოლოდ focus-ის გასწორება; R71: საერთო `studio-fader.ts`. **⚠ ვეტოს შესაძლებლობით:** R68 ცვლის ოთხი fader-ის მოსვენების იერსაც (DUX-R-5b-1-ის ნეიტრალური fill → brass fill). '
 'რეგრესიის რაუნდი — პირველ დაგეგმვაზე 2026-10-27-ის შემდეგ.')
lines.insert(i+1,new190)
s='\n'.join(lines)
old_sr='**1d** (D10 entrance loader; + C-R187-I1: loader-მა card-ის Play არ უნდა დაბლოკოს; + C-R188-I1: loader-ის h1) — **ბაგია** (Round 189 C FAIL: C-R189-01 Medium fresh-mode CLS, C-R189-02 Low Tab), გასწორება Round 190 (D-29z155).'
assert old_sr in s
s=s.replace(old_sr,'**1d** (D10 entrance loader; + C-R187-I1; + C-R188-I1) — **მზადაა** (Round 189 + 190 C PASS `browserVerified`, `338564e`). **STORE-1 — მზადაა.** შემდეგი: SABA-B-3 (Round 191, Saba-ს ბრძანება), რეგრესია (2026-10-27-დან), შემდეგ STORE-2.')
s=s.replace('`c-round-189.md`; backlog `post_current_stage_queue` → STORE-REDESIGN (`store1d_result`, `store1d_fixup_d29z155`) |','`c-round-190.md`; backlog `post_current_stage_queue` → STORE-REDESIGN (`store1d_result`, `store1d_fixup_result`) |')
# bugs table: insert after header separator of section 3
lines=s.split('\n')
h=[k for k,l in enumerate(lines) if l.startswith('## 3. ღია ბაგები')][0]
sep=[k for k in range(h,h+6) if lines[k].startswith('|---')][0]
lines.insert(sep+1,'| SABA-B-3 | Medium (Saba, 2026-10-26) | **მუშავდება** (Round 191, D-29z156) — fader-ზე დაჭერისას/drag-ისას brass ყუთი, თეთრი track და დიდი thumb (ხაზის Volume; იგივე class ექვსივე range-ზე) | `user-review/img/saba-2026-10-26-volume-fader-click.png`; `b-round-190/shots/vol-*.png`, `b-round-190/tools/fader-probe.cjs` | Round 191: K0 მიზეზის დადასტურება, R68–R71; C PRESS-191 / LOOK-191 / BEHAVIOUR-191 / AUDIO-191 ორივე ზომაზე |')
s='\n'.join(lines)
# section 7 STUDIO-PERFORMANCE row after REVIEW-RECOMMENDATIONS row
lines=s.split('\n')
k=[k for k,l in enumerate(lines) if l.startswith('| REVIEW-RECOMMENDATIONS |')][0]
lines.insert(k+1,'| STUDIO-PERFORMANCE | **არ დაწყებულა** (Saba, 2026-10-26; REVIEW-RECOMMENDATIONS-ის შემდეგ, T12-ADVANCED-მდე) — PERF-1 (harness) პირველი; ყოველ PERF დავალებამდე B ეკითხება `performance-optimizer`-სა და `tech-lead`-ს და თავიდან ზომავს | `docs/technical/performance/perf-plan.md`; backlog `post_current_stage_queue` → STUDIO-PERFORMANCE |')
lines.insert(k+2,'| RETRO | **არ დაწყებულა** — პირველი STORE-REDESIGN-ის შემდეგ ან round 200-ზე (რომელიც უფრო ადრეა); შემდეგ ყოველ 15 რაუნდში და რიგის ყოველი ერთეულის ბოლოს. კოდი არ იცვლება; შედეგი `retros/retro-<round>.md` და `lessons.md` | backlog `retro_policy`; კანდიდატი სისტემური ამოცანა: GLOBAL-FOCUS-VISIBLE-UNLAYERED |')
open(p,'w').write('\n'.join(lines))
print('ok')
