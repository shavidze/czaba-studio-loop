# C314 ROW-EQUALITY: every deterministic row's samples (and commits-per-move ratio details) vs the HEAD-harness control.
import json,sys
ref=json.load(open(sys.argv[1])); 
R={r['id']:r for r in ref['rows'] if r.get('kind')=='deterministic'}
for f in sys.argv[2:]:
    d=json.load(open(f)); D={r['id']:r for r in d['rows'] if r.get('kind')=='deterministic'}
    diff=[i for i in R if i not in D or R[i]['samples']!=D[i]['samples']]
    extra=[i for i in D if i not in R]
    print(f, 'ref-det',len(R),'run-det',len(D),'equal',len(R)-len(diff),'differ',len(diff),diff[:10],'extra',extra)
