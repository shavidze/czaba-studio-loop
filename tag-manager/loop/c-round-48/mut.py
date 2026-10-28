import sys
p='/tmp/c48-mut/src/main/ipc/metadata.ts'
orig=open(p+'.orig').read()
G="get: (tag) => (tag.performers ? tag.performers.map(stripRiffNulTerminator) : []),"
S="tag.performers = val as string[];"
m=sys.argv[1]
muts={
 'M1':(S,"(tag as unknown as { albumArtists: string[] }).albumArtists = val as string[];"),
 'M2':(S,"tag.performers = [(val as string[]).join('; ')];"),
 'M3':(G,"get: (tag) => (tag.performers ? tag.performers.slice(0, 1).map(stripRiffNulTerminator) : []),"),
 'M4':(G,"get: (tag) => { const t = tag as unknown as { albumArtists?: string[] }; const p = tag.performers && tag.performers.length ? tag.performers : (t.albumArtists ?? []); return p.map(stripRiffNulTerminator); },"),
 'M5':(S,"if ((val as string[]).length) tag.performers = val as string[];"),
}
a,b=muts[m]
assert orig.count(a)==1,(m,orig.count(a))
open(p,'w').write(orig.replace(a,b))
