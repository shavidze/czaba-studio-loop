import sys, pathlib
root = pathlib.Path(sys.argv[1])
def edit(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    assert s.count(old) == count, (rel, old[:60], s.count(old))
    p.write_text(s.replace(old, new))

# collection.ts helper
edit('app/lib/arrangement/collection.ts',
"export function workspaceCollectionCopy(",
"""export function settledCollectionStatus(
  current: string,
  copy: WorkspaceCollectionCopy,
  failed: number,
): string {
  const settled = failed === 0 ? copy.ready : copy.failed(failed);
  if (current === copy.loading) {
    return settled;
  }
  const loadingPrefix = `${copy.loading} `;
  if (current.startsWith(loadingPrefix)) {
    return `${settled} ${current.slice(loadingPrefix.length)}`;
  }
  return failed === 0 ? current : settled;
}

export function workspaceCollectionCopy(""")

# context
ctx = 'app/contexts/ArrangementContext.tsx'
edit(ctx, "  setStatus: (message: string) => void;\n  setMetronomeBpm", "  setStatus: (update: ArrangementStatusUpdate) => void;\n  setMetronomeBpm")
edit(ctx, "      setStatus(failed === 0 ? copy.ready : copy.failed(failed));",
"      const failedCount = failed;\n      setStatus((current) => settledCollectionStatus(current, copy, failedCount));")
p = root/ctx; s = p.read_text()
import re
m = re.search(r"import \{([^}]*)\} from '~/lib/arrangement/collection';", s)
assert m, 'collection import'
names = [n.strip() for n in m.group(1).split(',') if n.strip()]
names.append('settledCollectionStatus')
names = sorted(set(names), key=lambda n: n.replace('type ','').lower())
joined = ', '.join(names)
line = "import { " + joined + " } from '~/lib/arrangement/collection';"
if len(line) > 100:
    line = "import {\n" + ''.join(f"  {n},\n" for n in names) + "} from '~/lib/arrangement/collection';"
s = s[:m.start()] + line + s[m.end():]
p.write_text(s)

# tempo-seed.ts
edit('app/lib/arrangement/tempo-seed.ts', "export function findAssetTempoSeed(",
"""export function hasAssetTempoSource(sources: readonly WorkspaceSource[]): boolean {
  return sources.some((source) => catalogueTempoBpm(source) !== null);
}

export function findAssetTempoSeed(""")

# StudioWorkspace
sw = 'app/components/arrangement/StudioWorkspace.tsx'
edit(sw, "import { findAssetTempoSeed } from '~/lib/arrangement/tempo-seed';",
"import { findAssetTempoSeed, hasAssetTempoSource } from '~/lib/arrangement/tempo-seed';")
edit(sw, """  useEffect(() => {
    if (!tempoSeedOpenRef.current || tempoBpmRef.current !== null) {
      return;
    }""", """  const collectionHasTempoSource = useMemo(
    () => hasAssetTempoSource(collection.sources),
    [collection.sources],
  );

  useEffect(() => {
    if (!collectionHasTempoSource || !tempoSeedOpenRef.current || tempoBpmRef.current !== null) {
      return;
    }""")
edit(sw, """    workspaceRef.current.setStatus([workspaceRef.current.status, ...parts].join(' '));
  }, [arrangement.clips, arrangement.tracks, collection.sources]);""",
"""    workspaceRef.current.setStatus((current) =>
      [current, ...parts].filter((part) => part.length > 0).join(' '),
    );
  }, [arrangement.clips, arrangement.tracks, collection.sources, collectionHasTempoSource]);""")
print('ok')

# part 2: the loading write keeps a status that already starts with this collection's loading text
edit('app/lib/arrangement/collection.ts', "export function settledCollectionStatus(",
"""export function loadingCollectionStatus(current: string, copy: WorkspaceCollectionCopy): string {
  return current === copy.loading || current.startsWith(`${copy.loading} `)
    ? current
    : copy.loading;
}

export function settledCollectionStatus(""")
edit(ctx, "import { settledCollectionStatus, workspaceCollectionCopy } from '~/lib/arrangement/collection';",
"""import {
  loadingCollectionStatus,
  settledCollectionStatus,
  workspaceCollectionCopy,
} from '~/lib/arrangement/collection';""")
edit(ctx, """    setStatus(copy.loading);
    const decodeContext = getDecodeContext();""", """    setStatus((current) => loadingCollectionStatus(current, copy));
    const decodeContext = getDecodeContext();""")
print('ok2')
