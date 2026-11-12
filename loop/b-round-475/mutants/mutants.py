import json,os,subprocess,sys,re
root=os.path.abspath(sys.argv[1]); out=os.path.abspath(sys.argv[2])
store=os.path.realpath('/home/runner/czaba-project/store')
if os.path.realpath(root)==store: sys.exit('refuse: run on a cp -a copy, never the store tree')
os.makedirs(out,exist_ok=True)
L='app/components/loading/SpotlightLoader.tsx'; C='app/components/loading/EntranceCover.tsx'; H='app/components/layout/Header.tsx'
M=[
 ('M1-overlay-bg-black',L,"style={{ backgroundColor: 'var(--color-background)' }}","style={{ backgroundColor: '#000' }}"),
 ('M2-base-layer-bg-black',L,'absolute inset-0 bg-background','absolute inset-0 bg-black'),
 ('M3-wordmark-foreground',L,'font-bold text-brand','font-bold text-foreground'),
 ('M4-dust-white',L,'rounded-full bg-foreground/50','rounded-full bg-white/50'),
 ('M5-cone-white',L,'rgba(var(--color-brand-rgb),0.1) 90deg','rgba(255,255,255,0.1) 90deg'),
 ('M6-vignette-black',L,'color-mix(in srgb, var(--color-background) 80%, transparent)','rgba(0,0,0,0.8)'),
 ('M7-dust-random-per-render',L,'const [dustParticles] = useState(createDustParticles);','const dustParticles = createDustParticles();'),
 ('M8-portal-not-body',L,'    document.body,\n  );\n}','    document.body.firstElementChild ?? document.body,\n  );\n}'),
 ('M9-cover-black',C,'background:var(--color-background)','background:var(--color-black)'),
 ('M10-header-foreground',H,'tracking-tighter text-brand','tracking-tighter text-foreground'),
 ('M11-vignette-space-syntax-black',L,'color-mix(in srgb, var(--color-background) 80%, transparent)','rgba(0 0 0 / 0.8)'),
 ('M12-overlay-hex6-black',L,"style={{ backgroundColor: 'var(--color-background)' }}","style={{ backgroundColor: '#000000' }}"),
]
tests=['app/lib/__tests__/store-entrance-loader.test.tsx','app/lib/__tests__/store-header-footer.test.tsx']
summary=[]
for mid,f,a,b in M:
    p=os.path.join(root,f); orig=open(p).read()
    if orig.count(a)!=1: summary.append(f'{mid} NOT-APPLIED'); continue
    try:
        open(p,'w').write(orig.replace(a,b))
        jf=os.path.join(out,mid+'.json')
        subprocess.run(['npx','vitest','run',*tests,'--reporter=json','--outputFile='+jf],cwd=root,capture_output=True,timeout=600)
        r=json.load(open(jf)); red=sorted(t['title'].split(' ')[0] for s in r['testResults'] for t in s['assertionResults'] if t['status']!='passed')
        summary.append(f"{mid} {'RED' if red else 'GREEN'} {','.join(red)}")
    finally:
        open(p,'w').write(orig)
open(os.path.join(out,'summary.txt'),'w').write('\n'.join(summary)+'\n'); print('\n'.join(summary))
