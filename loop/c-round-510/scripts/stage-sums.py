# RETRO 510: stage sums and B share from c-round-510/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-509/stage-sums.py > c-round-510/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('c-round-510/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'RETRO 495 (495)': [495], 'DPG-BUTTON-CLEANUP stage 1 (496-497)': [496, 497],
      'DPG-BUTTON-CLEANUP-2 2a (498)': [498], 'DPG-BUTTON-CLEANUP-2 2b-1 (499-500)': [499, 500], 'DPG-BUTTON-CLEANUP-2 2b-2 (501)': [501],
      'CART-LAYOUT bugs (502)': [502], 'DPG-BUTTON-CLEANUP-2 2b-3 (503)': [503], 'DPG-BUTTON-CLEANUP-2 2c (504)': [504],
      'DPG-BUTTON-CLEANUP-2 2d (505)': [505], 'DPG-BUTTON-CLEANUP-2 2e (506)': [506], 'NONBRAND N1 (507-508)': [507, 508],
      'B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (509)': [509]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
