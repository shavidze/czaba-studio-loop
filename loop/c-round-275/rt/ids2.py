import json
d=json.load(open('backlog.json'))
def walk(o,path=''):
    if isinstance(o,dict):
        if o.get('id') in IDS: yield path,o
        for k,v in o.items(): yield from walk(v,path+'/'+k)
    elif isinstance(o,list):
        for i,v in enumerate(o): yield from walk(v,path)
IDS={'ARCH-CHECKPOINT-SYS6-STATUS-TAG','F1-ABSOLUTE-SNAP','R49-T','A-R204-SAFARI-USERMENU-CLICK','TLM-R232-ALTGR-WIN','TLM-R232-MAC','TLM-R228-META-KEYS','TLM-R233-SR-ORDER','GATE244-S4','GATE232-S2','RC-R262-DEST-CONTAINER-GREP','RC-R266-PANEL-CLAMP-CONSUMER','RC-R272-UNPROBED-PREMISE','RC-R262-METER-MUTE-BOUND','RC-R271-SCRATCH-NODE-MODULES','RC-R262-NARROW-TRUNCATE-BOXES','RC-R266-JSX-ATTR-GREP','RC-R270-TEST-ID-COLLISION','C-R261-N1-SWEEP-FORMS','C-R261-N2-WIRING-WORDING','RC-R260-ROW-SEVERITY','RC-R275-STOP-ROUTES-TO-B'}
for p,o in walk(d):
    print(o['id'],'@',p,'|',str(o.get('status'))[:230].replace('\n',' '))
    for k in ('deadline','l46_retro275','l46_deadline'):
        if k in o: print('    ',k,'=',str(o[k])[:200])
