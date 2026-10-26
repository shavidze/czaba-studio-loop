import hashlib, json, subprocess, sys, pathlib, shutil
L = pathlib.Path('../tmp/studio-real-loop/a-round-177')
T = 'app/lib/arrangement/__tests__/'
C = 'app/components/arrangement/'
FILES = [T+f for f in ['mode-toggle-colour-ui.test.tsx','transport-surface-ui.test.tsx','metronome-ui.test.tsx','waveform-zoom.test.tsx','clip-envelope-ui.test.tsx','studio-theme-obsidian.test.tsx','library-row-strings-ui.test.tsx','affordance-colour-ui.test.tsx']]
FULL_ON = "'border-foreground bg-foreground/20 text-foreground enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'"
ACC_ON = "'border-accent bg-accent/20 text-accent hover:text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20'"
TR_ON = "'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'"
M = [
 ('m266', C+'ArrangementTransport.tsx', "            "+TR_ON+",\n        )}\n      >\n        <Repeat", "            'border-accent bg-accent/20 text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20',\n        )}\n      >\n        <Repeat", 1, 'T2 Loop on back to accent'),
 ('m267', C+'ArrangementTransport.tsx', "navigation.followMode === 'on' &&\n              "+TR_ON+",", "navigation.followMode === 'on' && 'text-brand',", 1, 'T3 Follow on back to text-brand'),
 ('m268', C+'ArrangementTransport.tsx', "'border-dashed border-foreground'", "'border-foreground'", 1, 'T4 Follow paused solid'),
 ('m269', C+'ArrangementTempoRow.tsx', FULL_ON, ACC_ON, 1, 'R1 Metronome on back to accent'),
 ('m270', C+'StudioWorkspace.tsx', FULL_ON, ACC_ON, 'first', 'W1 Snap on back to accent'),
 ('m271', C+'StudioWorkspace.tsx', FULL_ON, ACC_ON, 'second', 'W2 Env on back to accent'),
 ('m272', C+'StudioWorkspace.tsx', "'border-foreground bg-foreground/20',", "'border-accent bg-accent/20 text-accent',", 1, 'W3 Zoom back to accent'),
 ('m273', C+'ArrangementLoopBrace.tsx', "'border-foreground bg-foreground/20'", "'border-accent bg-accent/20'", 1, 'B1 brace back to accent'),
 ('m274', C+'ArrangementLibraryPreview.tsx', "isPreviewing ? 'border-foreground text-foreground'", "isPreviewing ? 'border-accent text-accent'", 1, 'P1 previewing back to accent'),
 ('m275', C+'ArrangementLibrary.tsx', 'text-xs text-foreground"\n          data-testid="arrangement-library-option-previewing"', 'text-xs text-brand"\n          data-testid="arrangement-library-option-previewing"', 1, 'Y1 previewing label back to text-brand'),
 ('m276', C+'ArrangementExportDialog.tsx', 'accent-brand', 'accent-foreground', 'first', 'G1 one ExportDialog accent-brand -> accent-foreground (protected, temp)'),
 ('m277', C+'ArrangementLane.tsx', "'border-accent bg-accent/20 text-accent'", "'border-foreground bg-foreground/20 text-foreground'", 'first', 'G1 one Lane ghost -> neutral (protected, temp)'),
]
only = sys.argv[1:]
summary = []
for mid, path, old, new, mode, desc in M:
    if only and mid not in only: continue
    p = pathlib.Path(path); orig = p.read_bytes(); h0 = hashlib.sha256(orig).hexdigest()
    s = orig.decode()
    n = s.count(old)
    if mode == 1:
        assert n == 1, (mid, n)
        ms = s.replace(old, new)
    else:
        assert n >= 2 if mode == 'second' else n >= 1, (mid, n)
        idx = s.find(old)
        if mode == 'second': idx = s.find(old, idx + 1)
        ms = s[:idx] + new + s[idx+len(old):]
    backup = L/'tools'/(mid+'.bak'); backup.write_bytes(orig)
    try:
        p.write_text(ms)
        out = L/'mutations'/(mid+'-vitest.json')
        subprocess.run(['npx','vitest','run',*FILES,'--reporter=json','--outputFile='+str(out)], capture_output=True)
        r = json.loads(out.read_text())
        failed = [f"{pathlib.Path(tr['name']).name} :: {a['title']}" for tr in r['testResults'] for a in tr['assertionResults'] if a['status']=='failed']
    finally:
        p.write_bytes(orig)
    h1 = hashlib.sha256(p.read_bytes()).hexdigest(); backup.unlink()
    rec = {'id':mid,'file':path,'description':desc,'red':bool(failed),'failed':failed,'passed':r['numPassedTests'],'total':r['numTotalTests'],'restored_sha256':h1,'restored_ok':h0==h1}
    (L/'mutations'/(mid+'.json')).write_text(json.dumps(rec, indent=2, ensure_ascii=False))
    summary.append(rec); print(mid, 'RED' if failed else 'GREEN!', len(failed), 'restored', h0==h1); [print('   ', f) for f in failed]
