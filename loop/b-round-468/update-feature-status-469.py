import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = os.path.join(L, 'b-round-468/update-feature-status-469.done')
if os.path.exists(done): sys.exit('already applied')
p = os.path.join(L, 'feature-status.md')
t = open(p, encoding='utf-8').read()
old_hdr = 'განახლდა: 2026-11-12 · ავტორი: B (round 467 → round 468 დაგეგმვა, D-29z1647…D-29z1649)'
assert t.count(old_hdr) == 1
t = t.replace(old_hdr, 'განახლდა: 2026-11-12 · ავტორი: B (round 468 → round 469 დაგეგმვა, D-29z1650…D-29z1651)')
anchor = '  შემდეგი (D-29z1649): **round 468 = SABA-B-15 ეტაპი 1'
assert t.count(anchor) == 1
new = (
 '  - **Round 468 = SABA-B-15 ეტაპი 1 (დიაგნოსტიკა) — მზადაა (D-29z1650).** C round 468 PASS: C1–C9, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-468.json`); store-ის ხე უცვლელია, gate 468 გამოტოვდა („no real changes“). '
 'მიზეზი cloud-ის software raster-ში დადასტურდა: სამი დიდი `filter: blur()` glow (`ProductSection.tsx` l.38–39, `StudioShowcase.tsx` l.75). Gradient-ით შეცვლა `/`-ის მედიანას 0/0-მდე ამცირებს, eased scroll რჩება (`c-round-468.md` C2/C3). '
 'A-ს „For B“ სია backlog-ში სიგნალებადაა (SIG-R469-UNMEASURED-BLURS, SIG-R469-GLOW-PROMOTION-TRAP, INFO-R468-HERO-KENBURNS-INVALIDATION).\n'
 '  შემდეგი (D-29z1651): **round 469 = SABA-B-15 ეტაპი 2 — ფიქსი — მუშავდება.** სამი glow იცვლება radial gradient-ით დღევანდელი სიკაშკაშით: product-designer-ის ზოლი HEAD-ის 0.8–1.3×-ია (`b-round-468/pd-ruling.md`), რადგან A-ს ვარიანტი 2.4–3.1× ძლიერი იყო. '
 'B-ის sketch (`b-round-468/sketch-469.diff.txt`): ratio 1.09–1.21; frozen probe `/` 0/0; მთელი გვერდი 1/1 (HEAD 8/5); guard ტესტი SP1–SP3 მწვანეა, HEAD-ის ფაილებზე კი წითელი. '
 '**SABA-B-15 ამ რაუნდით არ იხურება:** `/free-downloads` cloud-ში არ მეორდება და გაზომვა software raster-შია. საბას შეკითხვა: `user-review/questions-round-468.md` (TLM-R468-SABA-SCROLL-DEVICE, ვადა RETRO 480). REGRESSION-2026-11-13 მომდევნო დაგეგმვაზეა, რომელიც 2026-11-13-ზე ან მის შემდეგ ტარდება.\n'
 '  ძველი: ')
t = t.replace(anchor, new + anchor.lstrip(), 1)
open(p, 'w', encoding='utf-8').write(t)
open(done, 'w').write('ok\n')
print('ok')
