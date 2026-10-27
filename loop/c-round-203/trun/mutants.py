# C round 203 — T-RUN mutants on the scratch tree copy. Each mutant: apply (exact string replace, must match), run the named tests, restore.
import subprocess, re, sys, shutil
INP='app/components/ui/Input.tsx'; FS='app/lib/focus-source.ts'; CSS='app/styles/app.css'; IB='app/components/ui/IconButton.tsx'
T_FT='app/lib/__tests__/focus-source-typing.test.tsx'; T_FX='app/lib/__tests__/store-focus-fixups.test.tsx'; T_SR='app/lib/__tests__/store-focus-ring.test.ts'
def rep(path, old, new, count=1):
    s=open(path).read(); n=s.count(old)
    assert n>=count, f'{path}: pattern not found {old[:60]!r} ({n})'
    open(path,'w').write(s.replace(old,new,count) if count>0 else s.replace(old,new))
M=[
 ('n1', [(INP,"'aria-[invalid=true]:border-destructive'","error && 'border-destructive'",-1)], [T_FX]),
 ('n2', [(INP,"aria-invalid={error ? true : undefined}\n","",-1)], [T_FX]),
 ('n3', [(INP,"          aria-invalid={error ? true : undefined}\n","",1),(INP,"{...props}","{...props}\n          aria-invalid={error ? true : undefined}",1)], [T_FX]),
 ('n4', [(FS,"isFocusSourceModifierKey(event.key) || isFocusSourceFieldEditingKey(event)","isFocusSourceModifierKey(event.key)",1)], [T_FT]),
 ('n5', [(FS,"  'Dead',\n]);","  'Dead',\n  'Escape',\n]);",1)], [T_FT]),
 ('n6', [(FS,"  'number',\n]);","  'number',\n  'range',\n]);",1)], [T_FT]),
 ('n6b',[(FS,"if (event.ctrlKey || event.metaKey || event.altKey || typeof event.key !== 'string')","if (typeof event.key !== 'string')",1)], [T_FT]),
 ('n6c',[(FS,"return isMultiLine && FOCUS_SOURCE_MULTILINE_EDITING_KEYS.has(event.key);","return FOCUS_SOURCE_MULTILINE_EDITING_KEYS.has(event.key);",1)], [T_FT]),
 ('n7', [(CSS,"box-shadow: 0 4px 20px color-mix(in srgb, var(--color-background) 60%, transparent);","box-shadow:\n    0 4px 20px rgba(19, 217, 204, 0.3),\n    0 0 40px rgba(19, 217, 204, 0.15);",1)], [T_FX]),
 ('n8', [(IB,"className={","className={'[&:focus]:outline-none ' + ",1)], [T_SR]),
 # C's own
 ('c1-textarea-only', [(INP,"'aria-[invalid=true]:border-destructive'","error && 'border-destructive'",0)], [T_FX]),
 ('c2-number-dropped', [(FS,"  'number',\n]);","]);",1)], [T_FT]),
 ('c3-hover-shadow-teal', [(CSS,"box-shadow: 0 8px 30px color-mix(in srgb, var(--color-background) 70%, transparent);","box-shadow: 0 8px 30px rgba(19, 217, 204, 0.5);",1)], [T_FX]),
 ('c4-focus-visible-arbitrary-prop', [(IB,"className={","className={'focus-visible:[outline:none] ' + ",1)], [T_SR]),
]
only=sys.argv[1:]
for name, edits, tests in M:
    if only and name not in only: continue
    files=sorted({e[0] for e in edits}); bak={f:open(f).read() for f in files}
    try:
        for (p,o,n,c) in edits:
            if name=='c1-textarea-only':
                # replace only the second occurrence (Textarea)
                s=open(p).read(); i=s.find(o); j=s.find(o,i+1); assert j>0; open(p,'w').write(s[:j]+n+s[j+len(o):])
            else: rep(p,o,n,c)
        r=subprocess.run(['npx','vitest','run',*tests],capture_output=True,text=True,timeout=600)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=sorted(set(re.findall(r'×\s+(?:[^>\n]*>\s*)*?((?:FT|IE|PB|STF)\d[^\n:]*)',out)))
        summ=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
        print(name, 'RED' if r.returncode else 'GREEN', summ, [f[:40] for f in fails][:6])
    finally:
        for f,s in bak.items(): open(f,'w').write(s)
