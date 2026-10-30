import subprocess, shutil, hashlib, sys, re
T='app/components/arrangement/ArrangementTransport.tsx'
S='app/lib/arrangement/strings.ts'
D='app/lib/arrangement/__tests__/'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
def mutate(path, old, new):
    s=open(path).read(); assert s.count(old)==1,(path,old,s.count(old)); open(path,'w').write(s.replace(old,new))
SPLIT_GUARD="""          onClick={(event) => {
            if (isSoftDisabledButton(event.currentTarget)) {
              return;
            }
            splitSelection();
          }}"""
mutants=[
 ('M1 Split guard deleted', T, SPLIT_GUARD, "          onClick={() => {\n            splitSelection();\n          }}", [D+'self-disabling-focus.test.tsx'], 'SD2'),
 ('M2 mousedown preventDefault deleted', T, "function preventSoftDisabledMouseFocus(event: MouseEvent<HTMLButtonElement>) {\n  event.preventDefault();\n}", "function preventSoftDisabledMouseFocus(_event: MouseEvent<HTMLButtonElement>) {}", [D+'self-disabling-focus.test.tsx'], 'SD3'),
 ('M3 handoff predicate back to .disabled', T, "      !handoff ||\n      !isSoftDisabledButton(handoff.source) ||\n      !handoff.partner ||\n      isSoftDisabledButton(handoff.partner)", "      !handoff?.source.disabled ||\n      !handoff.partner ||\n      handoff.partner.disabled", [D+'self-disabling-focus.test.tsx'], 'FL5,SD5'),
 ('M4 undoTitle(null) back to Undo', S, "'Undo — nothing to undo yet'", "'Undo'", [D+'self-disabling-focus.test.tsx', D+'strings.test.ts'], 'SD1,ST-K1'),
 ('M5 disabled:opacity-40 instead of children token', T, "aria-disabled:*:opacity-40'", "disabled:opacity-40'", [D+'self-disabling-focus.test.tsx'], 'SD7'),
]
for name,path,old,new,tests,expect in mutants:
    bak='/tmp/mut-bak'; shutil.copy(path,bak); h=sha(path)
    try:
        mutate(path,old,new)
        r=subprocess.run(['npx','vitest','run',*tests],capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        failed=sorted(set(re.findall(r'(?:×|FAIL).*?((?:SD\d|FL\d+|ST-K1)\b)',out)))
        print(f"{name}: rc={r.returncode} red_rows={failed} expected={expect}")
    finally:
        shutil.copy(bak,path); assert sha(path)==h; print('  restored sha ok', h[:12])
