#!/usr/bin/env bash
# Re-creates the small RETRO 416 data files. Run from the loop root: bash b-round-415/misc-outputs.sh [outdir]  (default c-round-416/data)
O=${1:-c-round-416/data}; BK=b-round-415/backlog-before-416.json
for n in $(seq 401 415); do echo "$n: $(head -1 tasks/round-$n.md | cut -c1-230)"; done > $O/task-titles.txt
for n in $(seq 401 415); do echo "$n $(grep -E '^(\*\*|## )STOP' a-round-$n.md | grep -vc 'STOP: none')"; done > $O/stops-count.txt
python3 -I -c "
import json;d=json.load(open('$BK'));print('deferred_low_polish',len(d['deferred_low_polish']),'open_findings',len(d['open_findings']))" > $O/deferred-totals.txt
python3 -I -c "
import json;d=json.load(open('$BK'))
for f in d['open_findings']:
  s=str(f.get('severity','')).lower(); st=str(f.get('status','')).lower()
  if s.split(' ')[0] in ('critical','high','medium') and not st.startswith(('closed','done','resolved','wontfix','deferred')): print(f['id'],'|',s[:10],'|',st[:90])
" > $O/open-medium-plus.txt
python3 -I -c "
import json;d=json.load(open('archive/findings-archived.json'))
items=d if isinstance(d,list) else [x for v in d.values() if isinstance(v,list) for x in v]
for f in items:
  if isinstance(f,dict) and f.get('id','').startswith(('C-R401-01','A-R411-REVIEW-M1','B-R411-SKETCH-M1-MISSED')): print(f['id'],'|',f.get('severity'),'|',str(f.get('status'))[:300])
" > $O/archived-mediums.txt
python3 -I -c "
import json
for n in range(401,416):
  print(n,list(json.load(open(f'c-round-{n}-result.json')).get('modelUsage',{})))
" > $O/c-models.txt
