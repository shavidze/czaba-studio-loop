import json,sys
d=json.load(open(sys.argv[1]))
for k,v in d.items():
  b=v.get('before',{});a=v.get('after',{})
  print(k, ('ERROR '+v['error'][:60]) if 'error' in v else '', 'focused', b.get('focused'),'->',a.get('focused'), '| lib', repr(b.get('libQuery')),'->',repr(a.get('libQuery')), '| sheet', b.get('sheetOpen'),'->',a.get('sheetOpen'), repr(a.get('sheetQuery')), '| fs', b.get('focusSource'),'->',a.get('focusSource'), '| pageErrors', len(v.get('pageErrors',[])))
