import re, sys, json, subprocess
tree=sys.argv[1]; P=tree+'/app/lib/arrangement/__tests__/helpers/source-scan.ts'
cov=open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-437/covering-files.txt').read().split()
H=[
 ('H1-NO-RECURSION',"      if (!SKIPPED_DIRECTORIES.has(entry)) {\n        files.push(...listSourceFiles(path, extensions));\n      }","      continue;"),
 ('H2-NO-SPREAD-HAZARD',"      hazards.add('spread');","      attributes.set('spread', null);"),
 ('H3-IMPORTS-COUNTED',"    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {","    if (ts.isExportDeclaration(node)) {"),
 ('H4-NO-STYLE-HAZARD',"        hazards.add('style');","        attributes.set('style-seen', null);"),
 ('H5-NO-EXPRESSION-LITERAL',"  if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {","  if (initializer && ts.isJsxExpression(initializer) && initializer.expression && false) {"),
 ('H6-NO-SYNTAX-THROW',"  if (errorLine !== 0) {","  if (errorLine < 0) {"),
 ('H7-TAG-PREFIX-MATCH',"      node.tagName.getText(file) === name","      node.tagName.getText(file).startsWith(name)"),
 ('H9-PROPERTY-NAMES-COUNTED',"      !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)","      true"),
 ('H8-ANY-CALL-ARGUMENT',"        first.text === argument","        first.text.length > 0"),
]
orig=open(P).read()
for hid,old,new in H:
    assert old in orig,(hid,'anchor')
    open(P,'w').write(orig.replace(old,new,1))
    try:
        r=subprocess.run(['npx','vitest','run','--reporter=verbose',*cov],cwd=tree,capture_output=True,text=True,timeout=300)
        red=sorted(set(re.findall(r'(?:×|FAIL)[^\n]*?> ([A-Z]{2}[0-9]+[a-z]?):', re.sub(r'\x1b\[[0-9;]*m','',r.stdout))))
    finally:
        open(P,'w').write(orig)
    print(json.dumps({'id':hid,'rc':r.returncode,'red':red}),flush=True)
