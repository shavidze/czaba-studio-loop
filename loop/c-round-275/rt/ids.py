import json
d=json.load(open('backlog.json'))
print('version',d.get('version'))
of={x.get('id'):x for x in d.get('open_findings',[]) if isinstance(x,dict)}
dl=d.get('deferred_low_polish',[]); dli={x.get('id'):x for x in dl if isinstance(x,dict)}
print('deferred len',len(dl))
for i in ['C-R271-01-NUDGE-STALE-STATUS','GATE270-S2-REPEAT-ANNOUNCE','A-R273-REPEAT-PASTEND','GATE273-S4-PBS9-DESCRIBE']:
    print(i,'in_deferred',i in dli,'| of:',str(of.get(i,{}).get('status'))[:90], '| dl:', str(dli.get(i,{}).get('status'))[:90] if i in dli else '')
for s in d.get('systemic_tasks',[]):
    if s.get('id','').startswith('SYS-6'): print('SYS-6',str(s.get('status'))[:80])
g=of.get('GATE274-S1-HELD-REPEAT-ANNOUNCE',{}); print('GATE274-S1',g.get('severity'),str(g.get('status'))[:60])
for i in ['GATE274-S2-GROUP-HOLD-TEXT','GATE274-S3-GROUP-ANCHOR-GUARD','GATE274-S4-ZERO-DIRECTION','A-R274-GROUP-NUDGE-FLOAT-DRIFT']: print(i,i in dli, dli.get(i,{}).get('severity'))
tl=[x for x in d.get('tech_lead_manual_checks',[]) if isinstance(x,dict) and x.get('id')=='TLM-R274-SR-HELD-REPEAT']; print('TLM',json.dumps(tl)[:400])
print('arch', [ (x.get('id'),str(x.get('status'))[:120]) for x in d.get('architecture_signals',[]) if x.get('id') in ('GATE274-ARCH-NUDGE-DESCRIBE','ARCH-CHECKPOINT-SYS6-STATUS-TAG')])
for k in ('open_findings',):
    for x in d[k]:
        if x.get('id')=='ARCH-CHECKPOINT-SYS6-STATUS-TAG': print('ARCH in of', str(x.get('status'))[:200])
rr=d.get('retro_runs',[]); print('retro_runs', [(x.get('round'),str(x.get('status'))[:40]) for x in rr if x.get('round') in (260,275)])
rp=d.get('retro_policy',{}); print('next_due',rp.get('next_due'))
src=[x for x in d.get('screen_review_candidates',[]) if str(x.get('id','')).startswith('SR-275')]; print('SR275',[(x['id'],x['status']) for x in src])
print('final_acc', json.dumps(d.get('final_acceptance_saba_manual_items'))[:1500])
print('hr',[x.get('id') for x in d.get('harness_rules',[]) if x.get('id') in ('HR-TRUNCATE-LEAF-BOXES','HR-C-SHADOW-FIELDS')])
dec=[x.get('id') for x in d.get('decisions_log_b',[]) if isinstance(x,dict)]; print('dec',[i for i in dec if i and i.startswith('D-29z6') and '605'<=i[5:]<='612'])
