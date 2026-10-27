import sys
p='current-task.md'
s=open(p,encoding='utf-8').read()
reps=[
("""| (u3) | 151 paths `/m/0.wav…/m/150.wav`; chunks 1 and 3 **reject**, chunk 2 resolves (same mock style as (u2)); generation `() => 7` | `failedPaths` toEqual `[...paths.slice(0, 50), ...paths.slice(100, 150)]`; `failures === 100`; `Object.keys(data)` toEqual `paths.slice(50, 100)`; `Object.keys(readGenerations)` toEqual `paths.slice(50, 100)`, each value 7; `/m/150.wav` (chunk 4, if any) — n/a: 151 paths = chunks of 50/50/50/1, so chunk 4 (`/m/150.wav`) **resolves** with the 4th mock and must not be in `failedPaths` | green (test gap) |

- Correction to the table: 151 paths make **four** chunks (50, 50, 50, 1). The mock sequence is reject, resolve, reject, resolve.
  - `failedPaths` toEqual `[...paths.slice(0, 50), ...paths.slice(100, 150)]`;
  - `failures === 100`;
  - `data` and `readGenerations` keys are `[...paths.slice(50, 100), '/m/150.wav']`.
""","""| (u3) | 151 paths `/m/0.wav…/m/150.wav` = **four** chunks (50, 50, 50, 1). Mock sequence (same style as (u2)): chunk 1 **rejects**, chunk 2 resolves, chunk 3 **rejects**, chunk 4 resolves. Generation `() => 7` | `failedPaths` toEqual `[...paths.slice(0, 50), ...paths.slice(100, 150)]`; `failures === 100`; `Object.keys(data)` and `Object.keys(readGenerations)` toEqual `[...paths.slice(50, 100), '/m/150.wav']`; every `readGenerations` value is 7; `/m/150.wav` is not in `failedPaths` | green (test gap) |

"""),
("""<li>**ME-5:** the new `else` in `handleOpenFolder` calls `setMetadata({})` **before** `setFiles(wavFiles)` and also on non-empty folders (i.e. an unconditional `setMetadata({})` right after `scanFolder` resolves).</li></ul>""",
 """<li>**ME-5:** instead of the `else`, `handleOpenFolder` calls `setMetadata({})` unconditionally right after `scanFolder` resolves (empty and non-empty folders alike).</li></ul>"""),
("""<li>ME-5: at least one of (k6)/(r*) (a superseded entry must survive; if C shows ME-5 is equivalent on every existing test, report it as a test-gap finding, not a FAIL).</li></ul>A survivor of EX-1…ME-4 is a FAIL unless C shows that it is equivalent.""",
 """<li>ME-5: (k2) (the same folder with a rejected read must keep its entries); C also names any (r*) killer.</li></ul>A survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 31."""),
]
for a,b in reps:
    assert s.count(a)==1, a[:60]
    s=s.replace(a,b)
open(p,'w',encoding='utf-8').write(s)
print('ok')
