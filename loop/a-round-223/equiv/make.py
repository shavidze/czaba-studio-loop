import re,subprocess,sys
store='/home/runner/czaba-project/store'; E=sys.argv[1]
specs={'1a':'studio-lab.perf.spec.ts','1bi':'studio-lab-interactions.perf.spec.ts','1bii':'studio-lab-resources.perf.spec.ts'}
builders={'1a':'buildReport','1bi':'buildInteractionReport','1bii':'buildResourceReport'}
def prep(text, builder):
    i=text.index("\ntest('studio-lab perf harness")
    text=text[:i]+f"\nexport {{ {builder} as builder }};\n"
    text=text.replace("from './lib/", f"from '{store}/perf/lib/")
    return text
for k,f in specs.items():
    head=subprocess.check_output(['git','-C',store,'show','2d4a93ff6a214e669dc5a69d6721ae4c1e99b7cd:perf/'+f]).decode()
    new=open(f'{store}/perf/{f}').read()
    open(f'{E}/src/oracle-{k}.ts','w').write(prep(head,builders[k]))
    n=prep(new,builders[k])
    open(f'{E}/src/new-{k}.ts','w').write(n)
    mut={'1bii':('MA','    assertWhenPartial: true,\n','    assertWhenPartial: false,\n'),
         '1bi':('MB','    determinismRequiresKind: true,\n','    determinismRequiresKind: false,\n'),
         '1a':('MC','    crossRateMetrics,\n  });','  });')}[k]
    assert n.count(mut[1])==1,(k,mut)
    open(f'{E}/src/mutant-{mut[0]}-{k}.ts','w').write(n.replace(mut[1],mut[2]))
