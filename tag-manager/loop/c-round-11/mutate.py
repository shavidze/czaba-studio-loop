import sys,re
kind,path=sys.argv[1],sys.argv[2]
s=open(path).read();o=s
if kind=='M1':
    s=s.replace("        if (result.failed.length > 0) {\n","        setEditingMetadata({});\n\n        if (result.failed.length > 0) {\n",1)
    s=s.replace("        } else {\n          setEditingMetadata({});\n","        } else {\n",1)
elif kind=='M2':
    s=s.replace("        } else {\n          setEditingMetadata({});\n","        } else {\n",1)
elif kind=='M3':
    s=s.replace("        for (const [path, updated] of Object.entries(refreshed)) {\n          updateFileMetadata","        for (const [path, updated] of Object.entries(refreshed)) {\n          if (result.failed.length > 0) continue;\n          updateFileMetadata",1)
elif kind=='M4':
    s=re.sub(r"vi\.hoisted\(\(\) => \{.*?\n\}\);\n","",s,count=1,flags=re.S)
assert s!=o, kind
open(path,'w').write(s)
