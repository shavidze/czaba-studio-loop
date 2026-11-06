import sys
s=open(sys.argv[1]).read()
a="""    writeInBackground(key, response, init);
    return response;
  };"""
assert s.count(a)==1
open(sys.argv[2],'w').write(s.replace(a,"""    return response;
  };"""))
