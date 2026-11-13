import json,sys
d=json.load(open(sys.argv[1]))
for vp,r in d['rows'].items():
    e=r['editing']
    print(vp,'col',e['colBox'][2],'row',e['rowBox'][2],'content',e['contentBox'],'doc',e['docScrollW'],e['docClientW'])
    print('  inputs',[i['box'] for i in e['inputs']],'buttons',[(b['box'],b['hit']) for b in e['buttons']])
    print('  mouseSave',r['mouseSave'],'mouseCancel',r['mouseCancel']['editing'],'tapSave',r.get('tapSave'),'tapCancel',r.get('tapCancel'))
    print('  kbCancel',r['kbCancel']['box'],r['kbCancel']['focusVisible'],'saving',[(b['disabled'],b['box']) for b in r['saving']['buttons']] if r['saving'] and r['saving']['buttons'] else None)
    print('  long',r['longSaved']['puts'],r['longSaved']['body'],'longTyped inputs',[(i['box'],i['scrollW'],i['clientW']) for i in r['longTyped']['inputs']], 'restRow', r['rest']['rowBox'])
