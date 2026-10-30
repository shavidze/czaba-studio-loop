import subprocess, shutil, hashlib, re
T='app/components/arrangement/ArrangementTransport.tsx'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
G="""            if (isSoftDisabledButton(event.currentTarget)) {
              return;
            }
            armFocusHandoff(event.currentTarget, {partner});
            {action}();"""
for name,partner,action in [('M6 Undo guard deleted','redoButtonRef.current','undo'),('M7 Redo guard deleted','undoButtonRef.current','redo')]:
    old=G.replace('{partner}',partner).replace('{action}',action)
    new=f"            armFocusHandoff(event.currentTarget, {partner});\n            {action}();"
    shutil.copy(T,'/tmp/mut-bak'); h=sha(T)
    try:
        s=open(T).read(); assert s.count(old)==1,name; open(T,'w').write(s.replace(old,new))
        r=subprocess.run(['npx','vitest','run','app/lib/arrangement/__tests__/self-disabling-focus.test.tsx'],capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        print(name,'rc',r.returncode,'red',sorted(set(re.findall(r'(?:×|FAIL).*?((?:SD\d+b?|FL\d+)\b)',out))))
    finally:
        shutil.copy('/tmp/mut-bak',T); assert sha(T)==h; print('  restored', h[:12])
