# RETRO 369 number index. Run from the loop root: python3 -I b-round-368/retro-numbers.py > c-round-369/data/retro-numbers-369.txt
import json,statistics as st
CR=json.load(open('c-round-369/data/cost-rows.json'))
B=sum(x[1] or 0 for x in CR);A=sum(x[2] for x in CR);C=sum(x[3] for x in CR);T=B+A+C
print('window 353-368 rounds',len(CR))
print('totals B %.2f A %.2f C %.2f all %.2f'%(B,A,C,T),'B share %.1f%%'%(100*B/T))
per={x[0]:round((x[1] or 0)+x[2]+x[3],2) for x in CR}
print('median round cost %.2f'%st.median(per.values()))
print('phase medians B %.2f A %.2f C %.2f'%(st.median([x[1] for x in CR]),st.median([x[2] for x in CR]),st.median([x[3] for x in CR])))
tot=lambda L:round(sum(per[n] for n in L),2)
print('groups RETRO [353]',tot([353]),'| fix-up after a C FAIL [358,364,368]',tot([358,364,368]),'| FAIL rounds [357,363,367]',tot([357,363,367]))
print('chains 357-359',tot([357,358,359]),'363-364',tot([363,364]),'367-368',tot([367,368]),'all chains',tot([357,358,359,363,364,367,368]))
print('feature rounds (rest)',tot([n for n in per if n not in (353,357,358,359,363,364,367,368)]))
print('STOP rounds (a-round-N.md STOP line, stops-count.txt): 357 361 363 367; cost',tot([357,361,363,367]))
print('C FAIL 3 [357,363,367]; PASS 13; BLOCKED 0; gate published 12, skipped 4 [353,357,363,367], failed 0')
print('top5',sorted(per.items(),key=lambda t:-t[1])[:5])
print('compare retro-353 (window 336-352): FAIL 2/17, B median 9.98 (337-352), B share 57.9%, L57 complete 5/16, origin 1/7, total 277.65')
