import sys
p=sys.argv[1]; m=sys.argv[2]; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(m,a,s.count(a)); s=s.replace(a,b)
if m=='M1': rep("isSameSelectionSet(startSelection, useFileStore.getState().selectedPaths)","true")
elif m=='M2':
    rep("updateFileMetadata(path, updated as WavMetadata);","if (selectionUnchanged) updateFileMetadata(path, updated as WavMetadata);",2)
elif m=='M3': rep("return [...start].every((path) => current.has(path));","return true;")
elif m=='M4':
    rep("  const start = new Set(startPaths);","  return startPaths.join('\\0') === currentPaths.join('\\0');\n  const start = new Set(startPaths);")
elif m=='M5':
    rep("        const selectionUnchanged = isSelectionUnchanged();\n        if (savedEntries","        const selectionUnchanged = true;\n        if (savedEntries")
elif m=='M6':
    rep("if (selectionUnchanged) skipSyncRef.current = true;","skipSyncRef.current = true;")
    rep("if (savedEntries.length > 0 && selectionUnchanged) {","if (savedEntries.length > 0) {")
elif m=='M7':
    rep("isSameSelectionSet(startSelection, useFileStore.getState().selectedPaths)","isSameSelectionSet(startSelection, selectedFiles.map((f) => f.path))")
elif m=='M8':
    rep("        showToast('Tags saved', 'success');","        if (selectionUnchanged) showToast('Tags saved', 'success');")
    rep("          showToast(`Tags saved to ${result.succeeded} files`, 'success');","          if (selectionUnchanged) showToast(`Tags saved to ${result.succeeded} files`, 'success');")
    rep("          showToast(`${result.succeeded} saved, ${result.failed.length} failed`, 'error');","          if (selectionUnchanged) showToast(`${result.succeeded} saved, ${result.failed.length} failed`, 'error');")
elif m=='M9':
    rep("if (selectionUnchanged) setEditingMetadata({});","setEditingMetadata({});")
open(p,'w').write(s)
