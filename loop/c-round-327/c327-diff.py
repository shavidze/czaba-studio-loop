import json, sys
d = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-327/'
a = json.load(open(d + 'rows-a.json')); h = json.load(open(d + 'rows-head.json'))
out = []
def cmp(path, x, y):
    if x != y: out.append(f'DIFF {path}: A={json.dumps(x, ensure_ascii=False)[:300]} HEAD={json.dumps(y, ensure_ascii=False)[:300]}')
for vp in ['1440x900', '1280x720']:
    for row in ['fadeStatus', 'fadeCancel', 'fadePlaying', 'fadeEndStop', 'videoFade', 'export']:
        ra, rh = a.get(vp, {}).get(row), h.get(vp, {}).get(row)
        if ra is None and rh is None: continue
        if ra is None or rh is None or 'error' in (ra or {}) or 'error' in (rh or {}): out.append(f'MISSING/ERR {vp} {row}: A={str(ra)[:200]} HEAD={str(rh)[:200]}'); continue
        if row == 'export':
            for k in ['fadeInAfter', 'finalStatus', 'sha256', 'info']: cmp(f'{vp}.{row}.{k}', ra.get(k), rh.get(k))
            continue
        for k in ['before', 'down', 'after', 'undo', 'redo', 'afterUndo', 'beforeUp', 'marker', 'playing0', 'playingStart', 'stopped', 'later']:
            if k in ra or k in rh:
                xa, xh = ra.get(k) or {}, rh.get(k) or {}
                for f in ['status', 'statusSpans', 'fadeIn', 'fadeAttrs', 'fadeOut', 'undoTitle', 'redoTitle', 'playing', 'rec']:
                    if f in xa or f in xh: cmp(f'{vp}.{row}.{k}.{f}', xa.get(f), xh.get(f))
        for i, (sa, sh) in enumerate(zip(ra.get('samples', []), rh.get('samples', []))):
            for f in ['status', 'fadeIn', 'fadeAttrs', 'rec', 'playing', 'statusSpans']: cmp(f'{vp}.{row}.s{i}.{f}', sa.get(f), sh.get(f))
        for k in ['startsDuringMove', 'startsAtRelease', 'handleTitle']:
            if k in ra or k in rh: out.append(f'INFO {vp}.{row}.{k}: A={ra.get(k)} HEAD={rh.get(k)}')
print('\n'.join(out) if out else 'NO DIFFS')
