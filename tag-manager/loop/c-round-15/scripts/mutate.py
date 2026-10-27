import sys
p, m = sys.argv[1], sys.argv[2]
s = open(p).read()
single_try = """        let updated: WavMetadata;
        try {
          updated = await window.api.readMetadata(path, fields);
        } catch {
          showToast(buildReloadFailedToast(), 'error');
          return;
        }
"""
batch_try = """        let refreshed: Record<string, WavMetadata>;
        try {
          refreshed = await window.api.readMetadataBatch(paths, fields);
        } catch {
          showToast(buildReloadFailedToast(result), 'error');
          return;
        }
"""
batch_catch = """          showToast(buildReloadFailedToast(result), 'error');
          return;"""


def rep(a, b):
    global s
    assert s.count(a) == 1, (m, a)
    s = s.replace(a, b)


if m == 'M1s':
    rep(single_try, "        const updated = await window.api.readMetadata(path, fields);\n")
elif m == 'M1b':
    rep(batch_try, "        const refreshed = await window.api.readMetadataBatch(paths, fields);\n")
elif m == 'M2':
    rep(batch_catch, "          setEditingMetadata({});\n" + batch_catch)
elif m == 'M3':
    rep(batch_catch, "          for (const p of paths) { if (!result.failed.some((f) => f.path === p)) updateFileMetadata(p, {} as WavMetadata); }\n" + batch_catch)
elif m == 'M4':
    rep("showToast(buildReloadFailedToast(), 'error');", "showToast(buildReloadFailedToast(), 'success');")
elif m == 'M5':
    rep("    } catch (err) {\n      showToast(", "    } catch (err) {\n      if (selectedFiles.length > 1) { try { await window.api.readMetadataBatch(selectedFiles.map((f) => f.path), fields); } catch {} }\n      showToast(")
else:
    raise SystemExit('unknown')
open(p, 'w').write(s)
