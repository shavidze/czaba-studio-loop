P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P,encoding='utf-8').read().split('\n')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
i=idx('განახლდა: ')
L[i]='განახლდა: 2026-10-23 · ავტორი: B (round 104 → round 105 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
i=idx('| GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED |')
L[i]=('| GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED | Low | **მოწმდება → Round 105 (D-29z70):** Round 104-ში C PASS (`browserVerified=true`: SR-REPEAT-SPACE 1280/1440, SR-REPEAT-FAILED-ROW), მაგრამ gate 104 **დაიბლოკა** — გამოსწორებამ drag-ზე ერთი და იგივე წინადადების განმეორება გამოიწვია (A-R104-REPEAT-DRAG). გამოქვეყნებული არ არის; Round 105-ის გამოსწორებასთან ერთად ქვეყნდება. '
 'რეალური screen reader — Tech Lead R104-T. | `c-round-104.md`; `gates/round-104/review.md` | A → C (HD-*, SR-REPEAT-*) |')
i=idx('| GATE103-S5 |')
L[i]='| GATE103-S5 | Low | **მოწმდება** — C round 104 SOURCE-UNCHANGED: doc 091-ში მხოლოდ l.4; gate 104 დაიბლოკა, ამიტომ გამოქვეყნებული არ არის. Round 105-ში doc 091 frozen-ია. | `c-round-104.md` | root (გამოქვეყნება Round 105-თან ერთად) |'
new=[
 '| A-R104-REPEAT-DRAG | Medium | **მუშავდება → Round 105 (D-29z70):** დაბლოკილ drag-ზე 81 pointermove → 81 span (80 იდენტური წინადადება), fade-ის clamp-ზე 21 იდენტური readout. გამოსწორება provider-შია: `reduceArrangementStatus`-ს ემატება `gestureActive`; claimed gesture-ის დროს იგივე ტექსტი → `previous`. `gestureCountRef` `useReducer`-ის ზემოთ გადადის (B-ის probe-ში სხვაგვარად `ReferenceError`). B probe: tsc 0, biome 0, 69 ფაილი 1123/1123. | `c-round-104/out/blocked-1280x720.json`; `gates/round-104/review.md` #1; `b-round-104/probe/` | A → C (HD-BLOCKED-HOLD, HD-FADE-CLAMP) |',
 '| GATE104-S2 | Low | **ღია (არ არის დაგეგმილი)** — mount-ზე ჩატვირთვის ტექსტი შეიძლება ერთხელ გამოცხადდეს (sequence 0 → 1); reviewer-მა მიიღო. | `gates/round-104/review.md` #2 | Low-ები |',
 '| GATE104-S3 | Low | **მუშავდება** → Round 105: doc 092 l.4 და l.60 | `gates/round-104/review.md` #3 | A → C (SOURCE-UNCHANGED) |',
 '| ARCH-R104-STATUS-COALESCING | Info | **გამოყენებულია Round 105-ში** — reviewer-ის Architecture note (Signal 4, keep) სწორედ ამ გამოსწორებას გვთავაზობდა; ცალკე checkpoint-ის პუნქტი არ არის. | `gates/round-104/review.md` Architecture note | — |',
]
L[i+1:i+1]=new
i=idx('| R104-T |')
L[i]=L[i].replace(' | headless-ში',' ; Round 105-დან: დაბლოკილი clip-ის drag-ისა და fade-ის clamp-ის ~2 წმ-ით დაჭერისას წინადადება ერთხელ ისმის | headless-ში',1)
i=idx('Round 104 (D-29z69):')
L[i]=L[i]+' → **C PASS** (`browserVerified=true`), 1 ბაგი (A-R104-REPEAT-DRAG, Medium); **gate 104 დაიბლოკა**, არ გამოქვეყნებულა. SR-REGION-STABLE B-მ არასწორად დაწერა (Space play/pause სტატუსს არ ცვლის) — შესწორდა.'
L[i:i]=['Round 105 (D-29z70): A-R104-REPEAT-DRAG — drag-ის დროს ერთი და იგივე სტატუსი აღარ მეორდება. `status-announcement.ts`: `reduceArrangementStatus`-ს ემატება სავალდებულო `gestureActive`; claimed gesture-ის დროს იგივე string → `previous` (commit-ისა და span-ის ცვლილების გარეშე). `ArrangementContext.tsx`: `gestureCountRef` `useReducer`-ის ზემოთ, inline reducer `gestureCountRef.current > 0`-ით; call site-ები უცვლელია. GATE104-S3: doc 092. ტესტები SA6/SA7, SU5/SU6. C: HD-BLOCKED-HOLD (1280/1440), HD-FADE-CLAMP, HD-READOUT-CHANGING, SR-REPEAT-SPACE, SR-REPEAT-FAILED-ROW, SR-TEXT-REG. Baseline: `3b6178b` + Round 104-ის 3 M + 4 ??. **შემდეგი B-ის დაგეგმვა (2026-10-24-ზე ან შემდეგ) — რეგრესიის რაუნდი.**','']
open(P,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
