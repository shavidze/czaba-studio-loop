# B round 431 -> 432 (SABA-B-12 stage 2b): judge progress-probe.json. usage: python3 -I compare-progress.py <dir with progress-probe.json>
import json, math, sys
r = json.load(open(sys.argv[1] + '/progress-probe.json'))
FG, TRACK, SURF = (236, 230, 218), (46, 42, 38), (22, 20, 18)
def near(p, q, tol): return all(abs(a - b) <= tol for a, b in zip(p, q))
ok_all = True
out = []
for key, c in r['cells'].items():
    bad = []
    if c['pageErrors']: bad.append('pageErrors %s' % c['pageErrors'][:2])
    if not c.get('warmupMp3'): bad.append('ENV warm-up MP3 did not download (retry, L38)')
    ind = c['indeterminate']
    s = ind['samples']
    if ind['stalled'] < 1: bad.append('ind: encoder request not stalled')
    if any(q['hasValue'] for q in s): bad.append('ind: value attribute present')
    if any(q['appearance'] != 'none' for q in s): bad.append('ind: appearance %s' % {q['appearance'] for q in s})
    if any(q['tag'] != 'PROGRESS' or round(q['h']) != 8 or round(q['w']) != 494 or q['radius'] != '9999px' for q in s): bad.append('ind: tag/box/radius')
    if any(q['animationName'] != 'pulse' for q in s): bad.append('ind: animation %s' % {q['animationName'] for q in s})
    op = [float(q['opacity']) for q in s]
    if max(op) - min(op) < 0.2: bad.append('ind: opacity does not pulse %s' % op)
    mid = ind['shot']['px']['row'][247]
    if not (100 <= mid[0] <= 160 and abs(mid[0] - mid[1]) < 12): bad.append('ind: mid pixel %s not a dimmed neutral fill' % mid)
    if not near(ind['shot']['px']['corner'], SURF, 6): bad.append('ind: corner %s not surface (not rounded)' % ind['shot']['px']['corner'])
    if not ind['download']: bad.append('ind: MP3 did not download after release')
    rm = c['reducedMotion']
    if any(q['animationName'] != 'none' or q['opacity'] != '1' for q in rm['samples']): bad.append('reduced: animation/opacity %s' % [(q['animationName'], q['opacity']) for q in rm['samples']])
    rmid = rm['shot']['px']['row'][247]
    if not (100 <= rmid[0] <= 160): bad.append('reduced: no dimmed fill %s' % rmid)
    if any(q['hasValue'] for q in rm['samples']): bad.append('reduced: value attribute present')
    if not rm['download']: bad.append('reduced: MP3 did not download')
    fc = c['forcedColors']
    if any(q['appearance'] != 'auto' for q in fc['samples']): bad.append('forced: appearance %s' % {q['appearance'] for q in fc['samples']})
    if not fc['download']: bad.append('forced: MP3 did not download')
    shots = [x for x in c['determinate']['shots'] if x['samePhase']]
    if not shots: bad.append('det: no same-phase shot (retry, L38)')
    for i, x in enumerate(shots):
        lo = math.floor(min(x['before'], x['after']) * x['width']) - 2
        hi = math.ceil(max(x['before'], x['after']) * x['width']) + 2
        if not (lo <= x['fillPx'] <= hi): bad.append('det%d: fill %dpx outside [%d,%d]' % (i, x['fillPx'], lo, hi))
        if x['fillPx'] > 4 and not near(x['fillColour'], FG, 8): bad.append('det%d: fill colour %s' % (i, x['fillColour']))
        if not near(x['trackColour'], TRACK, 6): bad.append('det%d: track colour %s' % (i, x['trackColour']))
        if x['green']: bad.append('det%d: %d green pixels' % (i, x['green']))
        if x['appearance'] != 'none' or x['tag'] != 'PROGRESS' or round(x['h']) != 8 or x['radius'] != '9999px': bad.append('det%d: appearance/tag/h/radius' % i)
        if not near(x['corner'], SURF, 6): bad.append('det%d: corner %s' % (i, x['corner']))
    if not c.get('wavDownload'): bad.append('det: WAV did not download')
    if c.get('barAfterDone') is not None: bad.append('bar still mounted after done')
    out.append('%s %s (%d same-phase determinate shots)' % (key, 'OK' if not bad else 'NOT OK: ' + '; '.join(bad), len(shots)))
    ok_all = ok_all and not bad
out.append('ALL OK (2 cells, 4 states each)' if ok_all and len(r['cells']) == 2 else 'NOT ALL OK')
print('\n'.join(out))
