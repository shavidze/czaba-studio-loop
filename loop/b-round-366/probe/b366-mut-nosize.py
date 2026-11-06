import sys
s=open(sys.argv[1]).read()
a="""      if (file.size !== record.size) {
        await remove(key);
        return null;
      }
"""
assert s.count(a)==1
open(sys.argv[2],'w').write(s.replace(a,''))
