import sys
name=sys.argv[1]
sw='/tmp/a241-scratch/app/components/arrangement/StudioWorkspace.tsx'
gm='/tmp/a241-scratch/app/components/arrangement/ArrangementGridMenu.tsx'
def sub(p,o,n):
    s=open(p).read(); assert s.count(o)==1,(name,o); open(p,'w').write(s.replace(o,n))
if name=='MU-MENU-FLAG-MISSING':
    sub(sw,"""      const tempo = tempoBpmRef.current;
      gridHandChosenRef.current = true;
      gridModeRef.current = 'adaptive';""","""      const tempo = tempoBpmRef.current;
      gridModeRef.current = 'adaptive';""")
if name=='MU-MENU-MODE-MISSING':
    sub(sw,"""      gridHandChosenRef.current = true;
      gridModeRef.current = 'adaptive';
      setGridMode('adaptive');
      gridDensityRef.current = density;""","""      gridHandChosenRef.current = true;
      gridDensityRef.current = density;""")
if name=='MU-MENU-DENSITY-MISSING':
    sub(sw,"""      gridDensityRef.current = density;
      setGridDensity(density);
      const id = resolveAdaptiveGrid(current, tempo);
      const width""","""      const id = resolveAdaptiveGrid(current, tempo);
      const width""")
if name=='MU-CHECK-PICK-IN-ADAPTIVE':
    sub(gm,"""const checked = gridMode === 'fixed' && option.id === checkedId;""","""const checked = option.id === checkedId;""")
if name=='MU-4-REPEAT':
    sub(sw,"""      if (event.code === 'Digit4' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          toggleSnap();
        }""","""      if (event.code === 'Digit4' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        toggleSnap();
        if (event.repeat) {
          return;
        }""")
