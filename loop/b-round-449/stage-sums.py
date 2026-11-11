# RETRO 450: stage sums and B share from b-round-449/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-449/stage-sums.py > b-round-449/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('b-round-449/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'RETRO 435 (435)': [435], 'COPY-PD-VIS (436-437)': [436, 437], 'SYS-R435-SOURCE-SCAN-HELPER (438-439)': [438, 439], 'SYS-1 (440-441)': [440, 441],
      'SYS-3 (442-445)': [442, 443, 444, 445], 'STORE-2b (446-449)': [446, 447, 448, 449]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
