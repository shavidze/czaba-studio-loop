#!/usr/bin/env bash
# Re-creates the small RETRO 401 data files. Run from the loop root: bash b-round-400/misc-outputs.sh [outdir]  (default b-round-400/data)
O=${1:-b-round-400/data}; BK=b-round-400/backlog-before-401.json
for n in $(seq 385 400); do echo "$n: $(head -1 tasks/round-$n.md | cut -c1-230)"; done > $O/task-titles.txt
for n in $(seq 385 400); do echo "$n $(grep -cE '^(\*\*|## )STOP' a-round-$n.md)"; done > $O/stops-count.txt
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
  if isinstance(f,dict) and f.get('id','').startswith(('C-R387-01','C-R391-01','C-R391-02','C-R394-01','C-R399-01','TL-R398-SK-M2')): print(f['id'],'|',f.get('severity'),'|',str(f.get('status'))[:300])
" > $O/archived-mediums.txt
python3 -I -c "
import json
for n in range(385,401):
  print(n,list(json.load(open(f'c-round-{n}-result.json')).get('modelUsage',{})))
" > $O/c-models.txt
