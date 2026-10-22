import subprocess, shutil, sys, re, filecmp
W='app/components/arrangement/StudioWorkspace.tsx'; G='app/lib/arrangement/groups.ts'
P='../tmp/studio-real-loop/a-round-80/pristine/'
M = {
 'a': (W, "() => visibleTrackGroupRows(allTrackRows, trackLaneLayout.collapsedGroups),", "() => allTrackRows,"),
 'b': (G, "if (row.kind === 'group' && (hidden || collapsedGroups[row.id] === true)) {", "if (row.kind === 'group' && collapsedGroups[row.id] === true) {"),
 'c': (W, "const lanes = trackLaneFitEntries(tracks, previous.folded);", "const lanes = trackLaneFitEntries(arrangement.tracks, previous.folded);"),
 'd': (W, "fittedById.get(track.id) ?? previous.heights[track.id]", "fitted[arrangement.tracks.indexOf(track)] ?? previous.heights[track.id]"),
 'e': (W, "if (clipIds.some((id) => hiddenClipIds.has(id))) {", "if (clipIds.length < 0) {"),
 'f': (W, "    const handleKeyDown = (event: KeyboardEvent) => {\n", "    const handleKeyDown = (event: KeyboardEvent) => {\n      if (shortcutLetter(event) === 'u' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {\n        event.preventDefault();\n        if (!event.repeat) {\n          toggleSelectedTrackGroupsCollapse();\n        }\n        return;\n      }\n"),
 'g': (W, "pendingRowFocusRef.current = result.childIds[0];", "void result.childIds;"),
 'h': (G, "start: clip.start,", "start: clip.start + 1,"),
 'i': (W, "      if (hiddenIds.size === 0) {\n        return;\n      }\n      if (focusHidden) {", "      current.commitArrangement({ ...arrangementNow, master: { ...arrangementNow.master, volume: arrangementNow.master.volume / 2 + 0.01 } }, 'Collapse Group', arrangementNow);\n      if (hiddenIds.size === 0) {\n        return;\n      }\n      if (focusHidden) {"),
}
tests = ['app/lib/arrangement/__tests__/track-group-collapse.test.ts','app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx']
out = []
for k in sys.argv[1:]:
    path, a, b = M[k]
    s = open(path).read()
    assert s.count(a) == 1, (k, s.count(a))
    open(path,'w').write(s.replace(a,b))
    r = subprocess.run(['npx','vitest','run',*tests], capture_output=True, text=True)
    txt = re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    fails = sorted(set(re.findall(r'FAIL .*?> SRW-17[^>]*> (.+)', txt)))
    summary = [l.strip() for l in txt.splitlines() if l.strip().startswith('Tests ')]
    shutil.copy(P+path.split('/')[-1], path)
    same = filecmp.cmp(P+path.split('/')[-1], path, shallow=False)
    out.append(f"## ({k}) {path}\n- replaced: `{a.strip()[:90]}`\n- result: {summary} exit={r.returncode}\n- red tests: {fails}\n- restored + cmp identical: {same}\n")
    print(out[-1], flush=True)
open('../tmp/studio-real-loop/a-round-80/mutations.md','a').write('\n'.join(out))
