# usage: python3 -I table.py <summary.jsonl>  -> one line per probe row
import json, sys
for l in open(sys.argv[1]):
    d = json.loads(l); fc = d['firstCovered']; rm = d['removedAt']; ds = float(d['dataStart']) if d['dataStart'] else None
    print(d['w'], 'cpu' + d['cpu'], d['mode'], 'fp', d['fp'], 'fc', fc, 'rem', rm, 'remFc', (rm - fc) if rm and fc else None,
          'remDs', round(rm - ds) if rm and ds else None, 'logo', d['logoFullMs'], 'tag', d['tagFullMs'], 'state', d['finalState'],
          'scrollY', d['scrollY'], 'gaps', d['gapsWhileCovered'], 'black', d['blackFrames'], 'url', d['url'], 'focus', d['finalFocus'], 'hydErr', d.get('hydrationErrors'), 'markT', d.get('markT'), 'covAfterMark', d.get('coveredAfterMark'), 'remAfterMark', d.get('removedAfterMarkMs'))
