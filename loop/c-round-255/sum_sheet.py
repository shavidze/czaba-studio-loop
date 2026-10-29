import json; R=json.load(open('browser/c255.json'))
for k,v in R['rows'].items():
  if not k.startswith('sheet'): continue
  print(k, 'pass',v.get('pass'), v.get('error'))
  for f in ['textOk','orderOk','markerOk','searchOk','searchExact','boundOk','changedOk','escOk','closeOk']: print(' ',f,v.get(f))
  print('  sc new',v['new']['sc'],'head',v['head']['sc'],'dlg',v['new']['dlgSW'],v['new']['dlgCW'])
  print('  changed',v['changedRows']); print('  otherDiffs',v['otherDiffs'],'headOnly',v['headOnly'])
  print('  search',v['newSearch']); print('  escKey',v['newAfterEscKey'],'btn',v.get('newBtnLabel'),v.get('newAfterEscBtn'),'headBtn',v.get('headAfterEscBtn'))
  print('  close',v['newClose']); print('  errs',v['newErrors'], len(v['perRow']))
