import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, old[:80]
    s = s.replace(old, new, count)
rep('ავტორი: B (round 79 → round 80 დაგეგმვა)', 'ავტორი: B (round 80 → round 81 დაგეგმვა)')
start = s.index('მიმდინარე რაუნდი: **Round 80**')
end = s.index('\n', start)
cur = ('მიმდინარე რაუნდი: **Round 81** (`current-task.md`, D-29z46) — **SRW-17 (FB-12) ეტაპი 3: ჯგუფის Mute / Solo / Volume დაკვრასა და ექსპორტში.** '
 'ჯგუფს ემატება არჩევითი `volume`/`mute`/`solo` (ნაგულისხმევზე არ ინახება); ერთი pure `trackEffectiveGains` — შვილის ხმა = საკუთარი volume × ყველა წინაპარი ჯგუფის volume, mute ყველა დონეზე solo-ს სჯობს; '
 'ცოცხალი დაკვრა და ექსპორტი ერთსა და იმავე წესს იყენებს, ახალი audio node-ისა და გადატვირთვის გარეშე (round 79 TG-AUDIO-ს 0 source); ჯგუფის სათაურში M / S / Volume (28 px რჩება), ნახევრად ფერადი Solo (`aria-pressed="mixed"`); '
 'Ctrl+Shift+G ჯგუფის mix-ს აშორებს; export dialog-ის ვიდეოს ხაზი ჯგუფის solo-ს ითვალისწინებს. შეზღუდული fix X1 = C80-1 (focus დამალულ ხაზში → blur, შემდეგ დაკეცვა). '
 'ბაზა: HEAD `68383fa`, სუფთა tree, გაყინული 461. Ableton: Live 12 §18.3 l.90/92/112, §18.1 l.42–43, §18.6 l.169 — დადასტურებული ტექსტით; შვილის meter ჯგუფის შემდეგ დონეს აჩვენებს — CZABA-ს არჩევანი (Live-ში დაუდასტურებელი).')
s = s[:start] + cur + s[end:]
r80 = ('\n\n**Round 80-ის შედეგი:** C PASS, `browserVerified=true`, `realVerified=true` (`c-round-80.md`, `c-round-80.json`); root-მა გამოაქვეყნა `68383fa` (ორივე remote; review 8.5/10, verify 1900/1900). '
 'SRW-17 ეტაპი 2 (დაკეცვა ღილაკით და `U`-ით, დამალული ხაზები, overview, მონიშვნების მოხსნა, auto-fit, focus F1–F3, hint) — C PASS ორივე viewport-ზე. '
 'ორი Low ბაგი: C80-1 (`U` უარს drag-ის ტექსტით ამბობს, როცა მხოლოდ fader-ზეა focus) → Round 81 X1; C80-2 (fold-ის label-ის სიტყვების რიგი) → B-მ მიიღო, როგორც C2-ის კონტრაქტი. '
 'O3 (უარყოფილი cross-lane drag ჰორიზონტალურ ნაწილს ინახავს) → ერთი განმასხვავებელი რეპროდუქცია Round 82-ში. fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია).')
anchor = s.index('\n\n**Round 79-ის შედეგი:**')
s = s[:anchor] + r80 + s[anchor:]
# FB-12 row
i = s.index('| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები |'); j = s.index('\n', i)
s = s[:i] + '| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **მუშავდება** (SRW-17 ეტაპი 1 — C PASS, `74eca15`; ეტაპი 2 — C PASS `browserVerified`, `68383fa`; ეტაპი 3 — Mute/Solo/Volume, Round 81, D-29z46) | `c-round-80.md`, `current-task.md` | Round 81 → C |' + s[j:]
i = s.index('| SRW-17 | ტრეკების ჯგუფები |'); j = s.index('\n', i)
s = s[:i] + '| SRW-17 | ტრეკების ჯგუფები | **მუშავდება** (ეტაპი 1 — C PASS `browserVerified`, `74eca15`; ეტაპი 2 — C PASS `browserVerified`, `68383fa`; ეტაპი 3 — Round 81 იგზავნება: ჯგუფის Mute/Solo/Volume დაკვრასა და ექსპორტში, ჩადგმა, ნახევრად ფერადი Solo, R17-G2/G3; + X1 = C80-1) | `c-round-80.md`, `c-round-80.json`, `current-task.md` | Round 81 → C; შემდეგ R81-T |' + s[j:]
hdr = '## 3. ღია ბაგები\n\n| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |\n|---|---|---|---|---|\n'
assert hdr in s
rows = ('| C80-1 | Low | **ბაგია** → Round 81 X1 (blur, შემდეგ დაკეცვა; focus ჯერ იკითხება) | `c-round-80.md` C80-1; `c-round-80/q1-*.json` FOLD-U s5c | C: X1-FOCUS |\n'
 '| C80-2 | Low | **დაიხურა** (B, D-29z46: `ჯგუფის დაკეცვა / გახსნა — <name>` C2-ის კონტრაქტია; doc 070 l.70) | `c-round-80.md` C80-2 | — |\n'
 '| C-R80-O3 | Low (Medium, თუ უარი ჩუმია) | **ღიაა** — ერთი განმასხვავებელი რეპროდუქცია Round 82-ში | `c-round-80.md` O3; `c-round-80/probe-ghost.json` | release-ზე უარის სტატუსი ჩანს? |\n')
s = s.replace(hdr, hdr + rows, 1)
i = s.index('| R80-T |'); j = s.index('\n', i)
s = s[:j+1] + '| R81-T | რეალურ Chrome-ში ყურსასმენით: ჯგუფის ნახევრად ფერადი Solo მკაფიოდ იკითხება; ჯგუფის Volume 50% ისე ჟღერს, როგორც −6 dB ტრეკის 50%-თან შედარებით; დადუმებული ჯგუფის შვილის meter-ის ვარდნა გასაგებია | მოსმენა და ვიზუალი headless Playwright-ით ვერ ფასდება (D-29z46) |\n' + s[j+1:]
anchor = s.index('Round 80 (D-29z45): SRW-17 (FB-12) ეტაპი 2')
line = ('Round 81 (D-29z46): SRW-17 (FB-12) ეტაპი 3 — ჯგუფის Mute/Solo/Volume (`trackEffectiveGains`, bus-ის გარეშე, 0 გადატვირთვა), ჩადგმა, ნახევრად ფერადი Solo, Ctrl+Shift+G mix-ს აშორებს, export dialog; X1 = C80-1; UC2-ის ვიწრო შესწორება; doc 070 (4 ხაზი), doc 071. '
 'Round 80 — C PASS, `68383fa`. შემდეგ: Round 82 — რეგრესია, თუ დაგეგმვა 2026-10-24-ზე ან შემდეგ მოდის (C-R80-O3-ის რიგით), თორემ C-R80-O3-ის რეპროდუქცია → SRW-18 → SRW-19 → SRW-20 → Low-ების ჯგუფი → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. ფარგლები არ მცირდება.\n\n')
s = s[:anchor] + line + s[anchor:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
