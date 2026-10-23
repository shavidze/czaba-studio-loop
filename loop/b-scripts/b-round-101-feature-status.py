P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P,encoding='utf-8').read().split('\n')
def find(prefix):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); return idx[0]
L[find('განახლდა: ')]='განახლდა: 2026-10-23 · ავტორი: B (round 101 → round 102 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
L[find('| GATE97-S4-REPEAT-EQ-TRUE-NIT |')]='| GATE97-S4-REPEAT-EQ-TRUE-NIT | Info | **დაიხურა** — C round 101 (SOURCE-UNCHANGED l.542→543, AN-REVIEW, T101-TARGETED 13/138; HE1–HE7 უცვლელად მწვანე); gate 101 გამოქვეყნდა `56231c0` | `c-round-101.md` | — |'
L[find('| GATE100-S1-SPACE-ON-FOCUSED-TOGGLE |')]='| GATE100-S1-SPACE-ON-FOCUSED-TOGGLE | Low | **დაიხურა** — C round 101 SPACE-TOGGLE-OBS-მა B-ის დაკვირვება დაადასტურა: focused ▶ მოუსმინე-ზე Space → toggle-ზე 0 click, preview არ ირთვება, transport ერთხელ Play → Pause (D-29z64 R2, განზრახ). Ableton — დაუდასტურებელი | `c-round-101/out/run101-space.json` | — |'
L[find('| GATE100-S4-DOC088-STATUS |')]='| GATE100-S4-DOC088-STATUS | Low | **დაიხურა** — C round 101 SOURCE-UNCHANGED (doc 088 მხოლოდ l.4); gate 101 `56231c0` | `c-round-101.md` | — |'
L[find('| GATE89-S3/S4/S6 |')]='| GATE89-S3/S4/S6 | Low | S4 და S6 — **დაიხურა** (C round 101: STRIP-1280/1440 ზოლი 0 px ორივე viewport-ზე, idle და done; VALUETEXT — WAV და MP3 ყველა ფაზაში = label; gate 101 `56231c0`). `-mx-8`/`px-8` + `pb-0` კავშირი — სიგნალი ARCH-R101-MODALBODY-PADDING-SLOT. S3 (worker watchdog) — **ბაგია** → Low-ების პაკეტი | `c-round-101.md`; `gates/round-89/review.md` | S3 — Low-ები |'
L[find('| A-R88-REVIEW-EDGES |')]='| A-R88-REVIEW-EDGES | Low | #4 და `py-4` — **დაიხურა** (C round 101). #1 — **მუშავდება** → Round 102 (D-29z67): guard ზომავს max(radio, მისი label-ბარათი); B-ის გაზომვა: 1280 done-ზე ბარათი footer-ის ქვეშ 8 px. #2 — **დაიხურა გადაწყვეტილებით** (= GATE89-S5, კოსმეტიკური). #3 — **დაიხურა: დღეს მიუწვდომელია** (footer მხოლოდ render-ის დაწყებისას/done-ზე იზრდება, scope radio-ები render-ში გამორთულია) | `b-round-101-probe/probe-focus-result.json` | A → C (CARD-1280, CARD-IDLE-REG) |'
i=find('| A-R88-REVIEW-EDGES |')
L[i+1:i+1]=[
 '| GATE101-S1/S2 | Low / Info | **მუშავდება** → Round 102 (D-29z67): ხილულ პროგრესის label-ს `aria-hidden="true"`, ერთი `progressText`. B-ის AX probe: ახლა ტექსტი AX ხეში ორჯერაა, `aria-hidden`-ით — ერთხელ, `aria-labelledby`-ით — სამჯერ | `gates/round-101/review.md` #1–#2; `b-round-101-probe/probe-ax-result.json` | A → C (AX-ONCE, VALUETEXT-REG) |',
 '| GATE101-S3 | Low | **დაბლოკილია** (გარემო: მხოლოდ Chromium) — `pb-0`-ის 0 px Firefox/WebKit-ში არ გაზომილა; GATE97-S2-თან ერთად, Tech Lead | `gates/round-101/review.md` #3 | Tech Lead |',
 '| GATE101-S4 | Low | **მუშავდება** → Round 102: doc 089 l.4 | `gates/round-101/review.md` #4 | A → C (SOURCE-UNCHANGED) |',
 '| INFO-B101-VALUETEXT-CDP | Info | ღიაა — დაკვირვება: CDP dump-ში valuetext mojibake-ად ჩანს, სახელები სწორად; სავარაუდოდ CDP-ის არტეფაქტი (დაუდასტურებელი); რეალური screen reader — Tech Lead | `b-round-101-probe/probe-ax-result.json` | Tech Lead |',
]
j=find('Round 101 (D-29z66):')
L[j:j]=['Round 102 (D-29z67): Export dialog — focus guard ზომავს focused radio-ს და მისი label-ბარათის ქვედა კიდეებიდან უფრო დაბალს (A-R88 #1; B-ის გაზომვა: 1280 done-ზე ბარათი footer-ის ქვეშ 8 px), ხილულ პროგრესის label-ს `aria-hidden` და ერთი `progressText` (GATE101-S1/S2; AX probe), doc 089 l.4 (GATE101-S4), ახალი doc 090. A-R88 #2 და #3 დაიხურა გადაწყვეტილებით. ტესტები FC1–FC3, FA1 ემატება `export-dialog-footer.test.tsx`-ს (მხოლოდ დამატება). C: CARD-1280, CARD-IDLE-REG, AX-ONCE, VALUETEXT-REG, FOCUS-REG, STRIP-REG, EXPORT-REG, PX-NET, REG-HYD, G102-3. Round 101 → C PASS `browserVerified`, გამოქვეყნდა `56231c0`. **შემდეგი B-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ — რეგრესიის რაუნდი.** შემდეგ: GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER → GATE96-S2 → grid/tempo Low-ები → R21-I2 → T12 → VISUAL-A-OBSIDIAN. ფარგლები არ მცირდება.','']
open(P,'w',encoding='utf-8').write('\n'.join(L)); print('ok')
