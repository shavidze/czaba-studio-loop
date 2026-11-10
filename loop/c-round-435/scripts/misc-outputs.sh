#!/usr/bin/env bash
# Re-creates the small RETRO 435 data files. Run from the loop root: bash b-round-419/misc-outputs.sh [outdir]  (default b-round-434/data)
O=${1:-b-round-434/data}; BK=b-round-434/backlog-retro-input.json
for n in $(seq 420 434); do echo "$n: $(head -1 tasks/round-$n.md | cut -c1-230)"; done > $O/task-titles.txt
for n in $(seq 420 434); do echo "$n $(grep -E '^(\*\*|## )STOP' a-round-$n.md | grep -vc 'STOP: none')"; done > $O/stops-count.txt
python3 -I -c "
import json;d=json.load(open('$BK'));print('deferred_low_polish',len(d['deferred_low_polish']),'open_findings',len(d['open_findings']))" > $O/deferred-totals.txt
python3 -I -c "
import json;d=json.load(open('$BK'))
for f in d['open_findings']:
  s=str(f.get('severity','')).lower(); st=str(f.get('status','')).lower()
  if s.split(' ')[0] in ('critical','high','medium') and not st.startswith(('closed','done','resolved','wontfix','deferred')): print(f['id'],'|',s[:10],'|',st[:90])
" > $O/open-medium-plus.txt
python3 -I -c "
import json;d=json.load(open('b-round-434/archive-findings-snapshot.json'))
items=d if isinstance(d,list) else [x for v in d.values() if isinstance(v,list) for x in v]
for f in items:
  if isinstance(f,dict) and f.get('id','').startswith(('C-R42','C-R43','A-R42','A-R43','GATE42','GATE43')): print(f['id'],'|',f.get('severity'),'|',str(f.get('status'))[:300])
" > $O/archived-mediums.txt
python3 -I -c "
import json
for n in range(420,435):
  print(n,list(json.load(open(f'c-round-{n}-result.json')).get('modelUsage',{})))
" > $O/c-models.txt
