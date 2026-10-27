import sys,subprocess,shutil,re
root='/tmp/c-r19-mut'
MP=root+'/src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
FS=root+'/src/renderer/src/stores/file-store.ts'
muts={
'M1':[(MP,"        await refreshSavedFileStats([path]);\n",""),(MP,"          await refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)));\n","")],
'M2':[(MP,"refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)))","refreshSavedFileStats(paths)")],
'M3':[(MP,"        await refreshSavedFileStats([path]);\n        let updated","        let updated"),(MP,"          updated = await window.api.readMetadata(path, fields);\n","          updated = await window.api.readMetadata(path, fields);\n          await refreshSavedFileStats([path]);\n"),
      (MP,"        if (result.succeeded > 0) {\n          await refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)));\n        }\n",""),
      (MP,"          refreshed = await window.api.readMetadataBatch(","          if (result.succeeded > 0) await refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)));\n          refreshed = await window.api.readMetadataBatch(")],
'M3b':[(MP,"        if (result.succeeded > 0) {\n          await refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)));\n        }\n",""),
       (MP,"          showToast(buildReloadFailedToast(result), 'error');\n          return;\n        }\n","          showToast(buildReloadFailedToast(result), 'error');\n          return;\n        }\n        if (result.succeeded > 0) {\n          await refreshSavedFileStats(paths.filter((p) => !failedPaths.has(p)));\n        }\n")],
'M4':[(FS,"      if (!state.files.some((file) => statsByPath.has(file.path))) return state;\n      return {\n","      return { files: entries };\n      return {\n")],
'M5':[(MP,"  try {\n    const scanned = await window.api.scanFolder(folderPath);\n    const written = new Set(writtenPaths);\n    updateFileStats(scanned.filter((entry) => written.has(entry.path)));\n  } catch {\n    return;\n  }\n","  const scanned = await window.api.scanFolder(folderPath);\n  const written = new Set(writtenPaths);\n  updateFileStats(scanned.filter((entry) => written.has(entry.path)));\n")],
'M6':[(FS,"{ ...file, size: stats.size, modifiedAt: stats.modifiedAt }","{ ...file, size: stats.size }")],
'M7':[(MP,"        if (result.succeeded > 0) {","        if (true) {")],
'M8':[(FS,"      if (!state.files.some((file) => statsByPath.has(file.path))) return state;\n","")],
}
m=sys.argv[1]
orig={p:open(p).read() for p in (MP,FS)}
try:
  cur=dict(orig)
  for p,a,b in muts[m]:
    assert a in cur[p],(m,a)
    cur[p]=cur[p].replace(a,b,1)
  for p in cur: open(p,'w').write(cur[p])
  d=subprocess.run(['diff','-u',MP+'.orig' if False else '/dev/null','/dev/null'],capture_output=True)
  for p in cur:
    if cur[p]!=orig[p]:
      open('/tmp/orig_tmp','w').write(orig[p])
      out=subprocess.run(['diff','-u','/tmp/orig_tmp',p],capture_output=True,text=True).stdout
      open(f'{sys.argv[2]}/{m}.diff','a').write(out)
  r=subprocess.run('npx vitest run -c vitest.config.renderer.ts tests/renderer/stores/file-store.test.ts tests/renderer/components/metadata-panel-batch-save.test.ts',shell=True,cwd=root,capture_output=True,text=True)
  txt=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
  open(f'{sys.argv[2]}/{m}.log','w').write(txt)
  fails=[l.split(' > ')[-1][:60] for l in txt.splitlines() if l.startswith(' FAIL ')]
  summ=[l for l in txt.splitlines() if 'Tests ' in l]
  print(m,'exit',r.returncode,summ,fails)
finally:
  for p in orig: open(p,'w').write(orig[p])
