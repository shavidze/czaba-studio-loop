import json,sys
b=json.load(open('backlog.json'))
ids=sys.argv[1:]
def walk(o,path):
    if isinstance(o,dict):
        if o.get('id') in ids: print('==',path); print(json.dumps(o,ensure_ascii=False,indent=1)[:6000])
        for k,v in o.items(): walk(v,path+'/'+k)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v,path+f'[{i}]')
walk(b,'')
