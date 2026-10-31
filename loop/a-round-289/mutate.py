import sys
m, p = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (m, a)
    s = s.replace(a, b)
if m == 'M1':
    rep('libraryResultRuns.length >= 2', 'libraryResultRuns.length >= 1')
elif m == 'M2':
    rep("""        {source.shortTitle ?? source.title}
      </span>
""", """        {source.shortTitle ?? source.title}
      </span>
      {source.shortTitle ? (
        <span data-testid="arrangement-library-option-context">{source.collectionLabel}</span>
      ) : null}
""")
elif m == 'M3':
    rep("""      const last = runs[runs.length - 1];
      if (last && last.label === source.collectionLabel) {
        last.end = index + 1;""", """      const last = runs.find((run) => run.label === source.collectionLabel);
      if (last) {
        last.end = index + 1;""")
    rep("""                          {results
                            .slice(run.start, run.end)
                            .map((source, offset) =>
                              renderLibraryOption(source, run.start + offset),
                            )}""", """                          {results
                            .filter((source) => source.collectionLabel === run.label)
                            .map((source) => renderLibraryOption(source, results.indexOf(source)))}""")
elif m == 'M4':
    rep("""                            id={headingId}
""", """                            id={headingId}
                            tabIndex={0}
""")
elif m == 'M5':
    rep("bass: 'Bass',", "bass: 'ბასი',")
open(p, 'w', encoding='utf-8').write(s)
