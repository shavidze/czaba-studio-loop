import subprocess, sys, json
L='/home/runner/czaba-project/tmp/studio-real-loop'; M=L+'/c-round-108/mut'; OUT=L+'/c-round-108/out'
TR='app/components/arrangement/ArrangementTransport.tsx'; DP='app/components/arrangement/ArrangementDetailPanel.tsx'
TEST='app/lib/arrangement/__tests__/self-disabling-focus.test.tsx'
rd=lambda f: open(f'{M}/{f}',encoding='utf-8').read()
def wr(f,s): open(f'{M}/{f}','w',encoding='utf-8').write(s)
orig={f:rd(f) for f in [TR,DP]}
def rep(s,o,n):
    assert s.count(o)==1,(o[:60],s.count(o)); return s.replace(o,n)
tr,dp=orig[TR],orig[DP]
MUTS={
 'control':{},
 # m1 C: 0 dB success no longer focuses the input (condition always false)
 'm1':{DP:rep(dp,'if (isReset && resetHeldFocus) {','if (isReset && resetHeldFocus && false) {')},
 # m3 C: effect hands off even when source still enabled
 'm3':{TR:rep(tr,'if (!handoff?.source.disabled || !handoff.partner','if (!handoff || !handoff.partner')},
 # m5 C: delete arms with a null partner
 'm5':{TR:rep(tr,"""          armFocusHandoff(event.currentTarget, undoButtonRef.current);
          deleteSelection();""","""          armFocusHandoff(event.currentTarget, null);
          deleteSelection();""")},
 # m7 C: arm regardless of held focus
 'm7':{TR:rep(tr,'document.activeElement === source ? { source, partner } : null','{ source, partner }')},
 # m8 C: undo button keydown guard removed (others keep it)
 'm8':{TR:rep(tr,"""          undo();
        }}
        onKeyDown={preventRepeatedEnterKeyDown}""","""          undo();
        }}""")},
}
res={}
order=['control']+[k for k in MUTS if k!='control']+['control2']
for k in order:
    for f in orig: wr(f,orig[f])
    for f,s in MUTS.get(k,{}).items(): wr(f,s)
    p=subprocess.run(['npx','vitest','run',TEST,'--reporter=verbose'],cwd=M,capture_output=True,text=True,timeout=600)
    o=p.stdout+p.stderr; open(f'{OUT}/mut108-{k}.log','w').write(o)
    import re
    failed=sorted(set(re.findall(r'(?:×|✗|FAIL).*?(FL\d+)',o)))
    summ=re.findall(r'Tests\s+.*',o)
    res[k]={'exit':p.returncode,'red':failed,'summary':summ[-1] if summ else None}
    print(k,res[k],flush=True)
for f in orig: wr(f,orig[f])
json.dump(res,open(f'{OUT}/mut108-summary.json','w'),indent=1)
