# RETRO 495: stage sums and B share from b-round-494/data/cost-rows.json. Run from the loop root:
# python3 -I b-round-494/stage-sums.py > b-round-494/data/stage-sums.txt
import json
R = {r[0]: r for r in json.load(open('b-round-494/data/cost-rows.json'))}
tot = lambda ns: round(sum(R[n][1] + R[n][2] + R[n][3] for n in ns), 2)
st = {'RETRO 480 (480)': [480], 'B-R478-DEAD-MUSIC-LINK (481)': [481], 'REGRESSION-2026-11-13 (482-484)': [482, 483, 484],
      'CLIENT-NAV-CONTRACT (485)': [485], 'B-R480-ORDER-CARD-KEYBOARD (486)': [486], 'B-R486-PROFILE-NAME-KEYBOARD (487-488)': [487, 488],
      'SABA-B-17-ENTRANCE-3-4S (489-490)': [489, 490], 'B-R487-PROFILE-EDITOR-NARROW-OVERFLOW (491)': [491],
      'B-R488-PASSWORD-MODAL-DIALOG (492-494)': [492, 493, 494]}
for k, ns in st.items(): print(k, 'rounds', len(ns), 'sum', tot(ns), 'avg', round(tot(ns) / len(ns), 2))
allc = tot(R); b = round(sum(R[n][1] for n in R), 2)
print('all', allc, 'B', b, 'B share %', round(b / allc * 100, 1))
