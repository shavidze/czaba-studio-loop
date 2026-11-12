# RETRO 465: stage sums and B share from c-round-465/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-464/stage-sums.py > c-round-465/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('c-round-465/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'RETRO 450 (450)': [450], 'SYS-R450-STORE-STYLE-SCAN (451-452)': [451, 452], 'STORE-2b-3b (453)': [453], 'STORE-2b-3c-1 (454)': [454],
      'SABA-B-14 (455)': [455], 'STORE-2b-3c-2a (456-458)': [456, 457, 458], 'SABA-B-13 (459-461)': [459, 460, 461], 'STORE-2b-3d (462-464)': [462, 463, 464]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
