# RETRO 385 number index. Run from the loop root: python3 -I b-round-384/retro-numbers.py > c-round-385/data/retro-numbers-385.txt
import json, statistics
CR = json.load(open('c-round-385/data/cost-rows.json'))
R = json.load(open('c-round-385/data/rounds-369-384.json'))
print('window 369-384 rounds', len(R))
def tot(ns):
    s = [r for r in CR if r[0] in ns]
    return round(sum(r[1] + r[2] + r[3] for r in s), 2)
print('total', tot(range(369, 385)), 'B', round(sum(r[1] for r in CR), 2), 'A', round(sum(r[2] for r in CR), 2), 'C', round(sum(r[3] for r in CR), 2))
print('B share %', round(100 * sum(r[1] for r in CR) / tot(range(369, 385)), 1))
print('median round', round(statistics.median([r[1] + r[2] + r[3] for r in CR]), 2), '| B', statistics.median([r[1] for r in CR]), '| A', statistics.median([r[2] for r in CR]), '| C', statistics.median([r[3] for r in CR]))
st = {}
for r in R: st.setdefault(r.get('c_status'), []).append(r['round'])
print('C status', {k: (len(v), v) for k, v in st.items()})
gs = {}
for r in R: gs.setdefault(r.get('gate'), []).append(r['round'])
print('gate', {k: (len(v), v) for k, v in gs.items()})
print('non-PASS rounds cost [376,382,383]', tot([376, 382, 383]), '| chains 376-377', tot([376, 377]), '382-384', tot([382, 383, 384]), 'all chains', tot([376, 377, 382, 383, 384]))
print('RETRO [369]', tot([369]))
print('compare retro-369 (window 353-368): C FAIL 3/16 BLOCKED 0, total 287.91, B median 11.46, B share 60.2%, round median 16.73, L57 16/16')
