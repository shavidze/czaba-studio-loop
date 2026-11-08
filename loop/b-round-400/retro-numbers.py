# RETRO 401 number index. Run from the loop root: python3 -I b-round-400/retro-numbers.py > b-round-400/data/retro-numbers-401.txt
import json, statistics
CR = json.load(open('b-round-400/data/cost-rows.json'))
R = json.load(open('b-round-400/data/rounds-385-400.json'))
print('window 385-400 rounds', len(R))
def tot(ns):
    s = [r for r in CR if r[0] in ns]
    return round(sum(r[1] + r[2] + r[3] for r in s), 2)
print('total', tot(range(385, 401)), 'B', round(sum(r[1] for r in CR), 2), 'A', round(sum(r[2] for r in CR), 2), 'C', round(sum(r[3] for r in CR), 2))
print('B share %', round(100 * sum(r[1] for r in CR) / tot(range(385, 401)), 1))
print('median round', round(statistics.median([r[1] + r[2] + r[3] for r in CR]), 2), '| B', statistics.median([r[1] for r in CR]), '| A', statistics.median([r[2] for r in CR]), '| C', statistics.median([r[3] for r in CR]))
st = {}
for r in R: st.setdefault(r.get('c_status'), []).append(r['round'])
print('C status', {k: (len(v), v) for k, v in st.items()})
gs = {}
for r in R: gs.setdefault(r.get('gate'), []).append(r['round'])
print('gate', {k: (len(v), v) for k, v in gs.items()})
print('C FAIL rounds cost [387,391,394,399]', tot([387, 391, 394, 399]), '| chains 387-388', tot([387, 388]), '391-392', tot([391, 392]), '394-395', tot([394, 395]), '399-400', tot([399, 400]), 'all chains', tot([387, 388, 391, 392, 394, 395, 399, 400]))
print('RETRO [385]', tot([385]), '| REGRESSION [389,390]', tot([389, 390]))
print('compare retro-385 (window 369-384): PASS 13 FAIL 1 BLOCKED 2, total 320.36, B 195.21 A 102.83 C 22.32, B share 60.9%, round median 19.63, B median 12.505, L57 15/16')
