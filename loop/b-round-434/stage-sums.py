# RETRO 435: stage sums and B share from b-round-434/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-434/stage-sums.py > b-round-434/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('b-round-434/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'SYS-2 (422, 426-429)': [422, 426, 427, 428, 429], 'SABA-B-12 (430-434)': list(range(430, 435)), 'REGRESSION + fix-up (423-425)': [423, 424, 425], 'RETRO 420 (420)': [420], 'SYS-R418 (421)': [421]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
