import subprocess, shutil, sys, re
T='/home/runner/czaba-project/tmp/studio-real-loop/c-round-202/trun/tree/'
TESTS=['app/lib/__tests__/store-focus-ring.test.ts','app/lib/__tests__/sfx-video-choose-button.test.tsx']
M=[
 ('m1','app/components/ui/Button.tsx',"'cursor-pointer',","'cursor-pointer', 'focus-visible:ring-2',"),
 ('m2','app/styles/app.css',".video-volume-slider {\n  width: 100px;",".video-volume-slider {\n  outline: none;\n  width: 100px;"),
 ('m3','app/components/arrangement/StudioWorkspace.tsx',"export function StudioWorkspace() {\n","export function StudioWorkspace() {\n  useFocusSourceAttribute();\n"),
 ('m4','app/root.tsx',"  useFocusSourceAttribute();\n",""),
 ('m5','app/components/chat/ChatInput.tsx',"              'resize-none',","              'resize-none',\n              'focus-within:ring-2',"),
 ('m6','app/components/product/ProductCard.tsx'," focus-within:opacity-100",""),
 ('m7','app/components/recordings/SfxVideoSync.tsx','tabIndex={-1}\n            className="hidden"','className="absolute inset-0 cursor-pointer opacity-0"'),
 ('m8','app/components/recordings/SfxVideoSync.tsx',"onClick={() => fileInputRef.current?.click()}","onClick={() => {}}"),
 ('c1-guestform-focus-border','app/components/chat/GuestForm.tsx',"errors.name ? 'border-destructive' : 'border-outline-strong',","errors.name ? 'border-destructive' : 'border-outline-strong',\n              'focus:border-brand',"),
 ('c2-hook-twice','app/root.tsx',"  useFocusSourceAttribute();\n","  useFocusSourceAttribute();\n  useFocusSourceAttribute();\n"),
 ('c3-arbitrary-outline','app/components/ui/IconButton.tsx',"className={","className={'[&:focus]:outline-none ' + "),
]
out=[]
for mid,f,a,b in M:
    p=T+f; orig=open(p).read()
    if a not in orig: out.append(f'{mid}: ANCHOR MISSING'); continue
    open(p,'w').write(orig.replace(a,b,1))
    r=subprocess.run(['npx','vitest','run',*TESTS],cwd=T,capture_output=True,text=True,timeout=600)
    open(p,'w').write(orig)
    txt=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    fails=sorted(set(re.findall(r'FAIL .*?> (STF\d[^\n]*?|SV\d[^\n]*?|\([abc]\)[^\n]*?)(?::| —|$)',txt,re.M)))
    fails=[x[:40] for x in fails]
    out.append(f'{mid}: rc={r.returncode} red={fails}')
    print(out[-1],flush=True)
open(sys.argv[1],'w').write('\n'.join(out)+'\n')
