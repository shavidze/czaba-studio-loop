# RETRO 480: stage sums and B share from c-round-480/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-479/stage-sums.py > c-round-480/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('c-round-480/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'RETRO 465 (465)': [465], 'STORE-2b-3c-2b (466-467)': [466, 467], 'SABA-B-15 (468-470)': [468, 469, 470],
      'STORE-2c-1 (471-473)': [471, 472, 473], 'DPG-P0-1 (474)': [474], 'DPG-P0-2 (475)': [475],
      'DPG-P0-3a (476-477)': [476, 477], 'DPG-P0-3b (478)': [478], 'DPG-FOOTER-LINKS (479)': [479]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
