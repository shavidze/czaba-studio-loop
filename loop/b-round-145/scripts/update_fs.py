import sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) >= 1, old[:80]
    t = t.replace(old, new, count)
rep('განახლდა: 2026-10-24 · ავტორი: B (round 144 → round 145 დაგეგმვა, D-29z110)', 'განახლდა: 2026-10-24 · ავტორი: B (round 145 → round 146 დაგეგმვა, D-29z111)')
line144 = [l for l in t.split('\n') if l.startswith('- **Round 144 (V-0.4e დახურვა)')][0]
new145 = ('- **Round 145 (V-0.5a) — C FAIL, `browserVerified: true`, `realVerified: true`; gate 145 skipped (ცვლილებები დაუკომიტებელია; rounds 145+146 ერთად გამოქვეყნდება C PASS-ის შემდეგ). V-0.5a — ბაგია.** '
    'ყველა row PASS-ია (ტექსტები, შეცდომები, ძიება `stems`, ლეიბლები, auth), გარდა LAYOUT-LIB (vi)-ისა: C-R145-01 (Low) — preview-ის დროს `▶ Playing` ჩაჭრილია `▶ Play`-მდე (ABL-B-1-ის გაუარესება). '
    'Round 146 = მცირე გასწორება (D-29z111): მარკერი ცალკე ხაზზე + ორი ტესტის სიმკაცრის Low. მტკიცებულება: `c-round-145.md`, `c-round-145.json`.')
rep(line144, line144 + '\n' + new145)
rep('| C-R142-02 | Low | **მუშავდება** Round 145-ში (V-0.5a ფლობს `library.ts`-ს; LIB-SEARCH-KEYWORDS, D-29z110 R2)',
    '| C-R142-02 | Low | **მოწმდება** — Round 145-ში გაკეთდა (KW1), C LIB-SEARCH PASS ბრაუზერში; დაიხურება rounds 145+146-ის გამოქვეყნებისას (gate 145 skipped)')
rep('V-0.5a (ჩატვირთვის შეცდომები, რიგის სტატუსი, დემო ლეიბლები, ძიების keywords) — **მუშავდება** (Round 145, D-29z110)',
    'V-0.5a (ჩატვირთვის შეცდომები, რიგის სტატუსი, დემო ლეიბლები, ძიების keywords) — **ბაგია** (Round 145 C FAIL მხოლოდ C-R145-01 Low-ზე; Round 146 გასწორება, D-29z111)')
rows = ('| C-R145-01 | Low | **მუშავდება** Round 146-ში (D-29z111) — preview-ის მარკერი `▶ Playing` 126 px option-ს სცდება და `▶ Play`-მდე ჩაიჭრება (ABL-B-1-ის გაუარესება); გასწორება: მარკერი ცალკე ხაზზე. მტკიცებულება `c-round-145/shots/lib-previewing-1440.png` | C Round 146 PLAY-MARKER / LAYOUT-LIB |\n'
    '| ABL-B-1 | Low | **მუშავდება** Round 146-ში C-R145-01-თან ერთად (`deferred_low_polish`-იდან ადრე, რადგან რაუნდი ამ კოდს ფლობს) | C Round 146 PLAY-MARKER |\n'
    '| A-R145-REVIEW-DM-VALUES | Low | **მუშავდება** Round 146-ში (DL-VAL: DM1–DM4 ზუსტი მნიშვნელობები unit ტესტში) | C AN-REVIEW |\n'
    '| A-R145-REVIEW-GUARD-TEXTS | Low | **მუშავდება** Round 146-ში (PC2: purchased guard-ის ზუსტი შეტყობინებები) | C AN-REVIEW |\n')
anchor = [l for l in t.split('\n') if l.startswith('| C-R143-01 | Low |')][0]
rep(anchor, anchor + '\n' + rows.rstrip('\n'))
open(P, 'w', encoding='utf-8').write(t)
print('ok')
