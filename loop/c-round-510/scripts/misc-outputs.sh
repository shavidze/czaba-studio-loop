#!/usr/bin/env bash
# Re-creates the small RETRO 510 data files. Run from the loop root: bash b-round-509/misc-outputs.sh [outdir]  (default c-round-510/data)
O=${1:-c-round-510/data}; BK=b-round-509/backlog-retro-input.json
for n in $(seq 495 509); do echo "$n: $(head -1 tasks/round-$n.md | cut -c1-230)"; done > $O/task-titles.txt
for n in $(seq 495 509); do echo "$n $(grep -E '^(\*\*|## )STOP' a-round-$n.md | grep -vc 'STOP: none')"; done > $O/stops-count.txt
python3 -I -c "
import json;d=json.load(open('$BK'));print('deferred_low_polish',len(d['deferred_low_polish']),'open_findings',len(d['open_findings']))" > $O/deferred-totals.txt
python3 -I -c "
import json;d=json.load(open('$BK'))
for f in d['open_findings']:
  s=str(f.get('severity','')).lower(); st=str(f.get('status','')).lower()
  if s.split(' ')[0] in ('critical','high','medium') and not st.startswith(('closed','done','resolved','wontfix','deferred')): print(f['id'],'|',s[:10],'|',st[:90])
" > $O/open-medium-plus.txt
python3 -I -c "
import json;d=json.load(open('b-round-509/archive-findings-snapshot.json'))
items=d if isinstance(d,list) else [x for v in d.values() if isinstance(v,list) for x in v]
for f in items:
  if isinstance(f,dict) and f.get('id','').startswith(tuple(p+str(n) for p in ('C-R','A-R','GATE') for n in range(495,510))): print(f['id'],'|',f.get('severity'),'|',str(f.get('status'))[:300])
" > $O/archived-mediums.txt
python3 -I -c "
import json
for n in range(495,510):
  print(n,list(json.load(open(f'c-round-{n}-result.json')).get('modelUsage',{})))
" > $O/c-models.txt
