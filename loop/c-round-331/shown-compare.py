import json,sys
F=['readout','readoutTitle','hint','detail','groupView','gainRange','gainInput','fadeIn','nClips','undo']
for vp in ['1440x900','1280x720']:
  a=json.load(open(f'shown/a-{vp}.json')); h=json.load(open(f'shown/head-{vp}.json'))
  print('==',vp,'samples A',len(a['samples']),'HEAD',len(h['samples']),'errors',a['errors'],h['errors'])
  pre={}
  for sa,sh in zip(a['samples'],h['samples']):
    lab=sa['label']; assert lab==sh['label']
    if lab in('selected','group-reselected'): pre[lab]=sa
    diffs=[f for f in F if sa.get(f)!=sh.get(f)]
    note=''
    if lab.startswith('fade-move') or lab.startswith('group-fade-move'):
      ref=pre['selected']
      same=all(sa[f]==ref[f] for f in ('readout','readoutTitle','detail'))
      note=f"A frozen-vs-predrag={same} HEAD frozen-vs-predrag={all(sh[f]==ref[f] for f in ('readout','readoutTitle','detail'))}"
    if lab.startswith('move-move'): note=f"hint A={bool(sa['hint'])} readoutAbsent A={sa['readout'] is None} HEAD={sh['readout'] is None}"
    print(f"{lab:20s} A==HEAD diffs={diffs} fadeIn A={sa['fadeIn']} H={sh['fadeIn']} {note}")
    for f in diffs: print('    ',f,'A=',repr(sa.get(f))[:160],'\n     H=',repr(sh.get(f))[:160])
