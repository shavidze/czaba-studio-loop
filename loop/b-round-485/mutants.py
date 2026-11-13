# usage: python3 -I mutants.py <outdir> [<sketch-applied scratch, default /tmp/b486-scratch>]  (mutates a copy in /tmp/b486-mut; refuses store/)
import os, subprocess, sys, shutil, re
OUT=sys.argv[1]; SRC=sys.argv[2] if len(sys.argv)>2 else '/tmp/b486-scratch'; MUT='/tmp/b486-mut'
for x in (SRC,MUT,OUT):
    if os.path.realpath(x).startswith('/home/runner/czaba-project/store'): sys.exit('refuse store')
F='app/routes/account.orders.tsx'; T='app/lib/__tests__/account-orders-card.test.tsx'
HEADF='/home/runner/czaba-project/tmp/studio-real-loop/b-round-485/head-account.orders.tsx'
M={
 'M0-HEAD-FILE': None,
 'M1-NO-ARIA-EXPANDED': ('          aria-expanded={isExpanded}\n',''),
 'M2-NO-HIDDEN': (' hidden={!isExpanded}',''),
 'M3-WRONG-CONTROLS': ('aria-controls={panelId}','aria-controls={`${panelId}-x`}'),
 'M4-CONST-PANEL-ID': ('const panelId = useId();',"const panelId = 'order-panel';"),
 'M5-REMOUNT-TOGGLE': ('        <button\n          type="button"','        <button\n          key={String(isExpanded)}\n          type="button"'),
 'M6-NO-TYPE': ('          type="button"\n',''),
 'M7-NO-HEADING': ('      <h3>\n        <button','      <div>\n        <button'),
 'M8-PANEL-INSIDE-BUTTON': None,
}
os.makedirs(OUT,exist_ok=True); summary=[]
for name,rep in M.items():
    if os.path.exists(MUT): shutil.rmtree(MUT)
    os.makedirs(MUT); 
    for d in ['app']: shutil.copytree(os.path.join(SRC,d),os.path.join(MUT,d))
    for f in os.listdir(SRC):
        p=os.path.join(SRC,f)
        if os.path.isfile(p): shutil.copy(p,MUT)
    os.symlink('/home/runner/czaba-project/store/node_modules',os.path.join(MUT,'node_modules'))
    fp=os.path.join(MUT,F); s=open(fp).read()
    if name=='M0-HEAD-FILE': s=open(HEADF).read()
    elif name=='M7-NO-HEADING':
        s=s.replace(rep[0],rep[1],1).replace('        </button>\n      </h3>','        </button>\n      </div>',1)
    elif name=='M8-PANEL-INSIDE-BUTTON':
        s=s.replace('aria-controls={panelId}','aria-controls={panelId}',1)
        s=s.replace('          </span>\n        </button>','          </span>\n          <span id={panelId} hidden={!isExpanded} />\n        </button>',1).replace('<div id={panelId} hidden={!isExpanded}','<div hidden={!isExpanded}',1)
    else:
        assert rep[0] in s, name; s=s.replace(rep[0],rep[1],1)
    open(fp,'w').write(s)
    r=subprocess.run(['npx','vitest','run',T,'--reporter=verbose'],cwd=MUT,capture_output=True,text=True)
    log=r.stdout+r.stderr; open(os.path.join(OUT,f'mutant-{name}.log'),'w').write(log)
    red=sorted(set(re.findall(r'(?:×|✗|FAIL).*?(OC\d)',log)))
    summary.append(f'{name} rc={r.returncode} red={",".join(red) or "NONE"}')
    print(summary[-1],flush=True)
open(os.path.join(OUT,'mutants-summary.txt'),'w').write('\n'.join(summary)+'\n')
shutil.rmtree(MUT)
