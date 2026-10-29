import subprocess, shutil, re, sys
S='/tmp/a254-scratch'
SW=f'{S}/app/components/arrangement/StudioWorkspace.tsx'
SC=f'{S}/app/lib/arrangement/shortcuts.ts'
TESTS=['app/lib/arrangement/__tests__/shortcuts.test.ts','app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx','app/lib/arrangement/__tests__/insert-marker-ui.test.tsx','app/lib/arrangement/__tests__/render-budget.test.tsx']
orig={p:open(p).read() for p in (SW,SC)}
def sub(text,a,b):
    assert text.count(a)>=1,(a[:60])
    return text.replace(a,b)
sw=orig[SW]; sc=orig[SC]
NEW_ROWS="""      {
        id: 'continue-playback',
        action: 'Continue from where playback stopped',
        keys: ['Shift+Space'],
        ariaKeyShortcuts: 'Shift+Space',
      },
      {
        id: 'insert-marker-to-playhead',
        action: 'Move the insert marker to the playhead',
        keys: ['Ctrl+Shift+Space'],
        ariaKeyShortcuts: 'Control+Shift+Space Meta+Shift+Space',
      },
"""
OLD_SIGNAL=subprocess.run(['git','show','HEAD:app/components/arrangement/StudioWorkspace.tsx'],cwd='/home/runner/czaba-project/store',capture_output=True,text=True).stdout
m=re.search(r'function ArrangementInsertMarkerSignal\(\) \{.*?\n\}\n',OLD_SIGNAL,re.S).group(0)
new_comp=re.search(r'function ArrangementInsertMarkerLine\(\{.*?\n\}\n',sw,re.S).group(0)
mutants={
 'MU-SHEET-NO-ROWS':{SC:sub(sc,NEW_ROWS,'')},
 'MU-ARIA-NO-META':{SC:sub(sc,"ariaKeyShortcuts: 'Control+Shift+Space Meta+Shift+Space'","ariaKeyShortcuts: 'Control+Shift+Space'")},
 'MU-COPY-OLD':{SC:sub(sub(sc,"'Play from the insert marker or the selection start · Stop'","'Play / Stop'"),"'Add a marker at the selection start, the insert marker, or the playhead while playing'","'Add a marker at the insert marker'")},
 'MU-HIDDEN-SIGNAL':{SW:sub(sub(sw,new_comp,m.replace('ArrangementInsertMarkerSignal','ArrangementInsertMarkerLine').replace('function ArrangementInsertMarkerLine()','function ArrangementInsertMarkerLine(_props: { pxPerSecond: number; hidden: boolean })')),'','')},
 'MU-LEFT-FROZEN':{SW:sub(sw,"        line.style.left = `${ARRANGEMENT_HEADER_WIDTH_PX + position * pxPerSecond}px`;\n",'')},
 'MU-NO-HIDE':{SW:sub(sw,'      hidden={hidden}\n','')},
 'MU-NO-PPS-DEP':{SW:sub(sw,'  }, [insertMarkerStore, pxPerSecond]);','  }, [insertMarkerStore]);')},
 'MU-REMOUNT':{SW:sub(sw,'<ArrangementInsertMarkerLine pxPerSecond','<ArrangementInsertMarkerLine key={String(isPlaying)} pxPerSecond')},
 'MU-ZORDER':{SW:sub(sw,'              <ArrangementInsertMarkerLine pxPerSecond={pxPerSecond} hidden={range !== null} />\n              <ArrangementPlayheadLine pxPerSecond={pxPerSecond} />\n','              <ArrangementPlayheadLine pxPerSecond={pxPerSecond} />\n              <ArrangementInsertMarkerLine pxPerSecond={pxPerSecond} hidden={range !== null} />\n')},
 'FIX-CONTROL':{},
}
only=sys.argv[1:]
for name,files in mutants.items():
    if only and name not in only: continue
    for p,t in orig.items(): open(p,'w').write(t)
    for p,t in files.items(): open(p,'w').write(t)
    r=subprocess.run(['npx','vitest','run',*TESTS],cwd=S,capture_output=True,text=True)
    out=r.stdout+r.stderr
    fails=sorted(set(re.findall(r'(?:×|✗|FAIL)\s+[^\n]*?>\s*([^\n]+?)(?:\s+\d+ms)?\n',out)))
    summ=re.findall(r'Tests\s+[^\n]+',out)
    lines=sorted(set(re.findall(r'__tests__/([\w.-]+):(\d+):\d+',out)))
    print(f'== {name}: rc={r.returncode} {summ[-1] if summ else ""}')
    for f in fails: print('   FAIL', re.sub(r'\x1b\[[0-9;]*m','',f))
    print('   lines', [f'{a}:{b}' for a,b in lines][:12])
    open(f'/home/runner/czaba-project/tmp/studio-real-loop/a-round-254/mutants/{name}.log','w').write(out)
for p,t in orig.items(): open(p,'w').write(t)
