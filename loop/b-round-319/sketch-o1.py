import re,sys
root=sys.argv[1]
def conv_memo_fn(path,name,export=False):
    s=open(path).read()
    pre=('export ' if export else '')+'const %s = memo(function %s('%(name,name)
    i=s.index(pre)
    # find matching close "});" at column 0 after i
    j=s.index('\n});\n',i)
    body=s[i+len(pre):j]
    new='function %sInner('%name+body+'\n}\n\n'+('export ' if export else '')+'const %s = memo(%sInner);\n'%(name,name)
    s=s[:i]+new+s[j+len('\n});\n'):]
    open(path,'w').write(s)
def conv_plain(path,name,export=False):
    s=open(path).read()
    pre=('export ' if export else '')+'function %s('%name
    i=s.index(pre)
    j=s.index('\n}\n',i)
    s=s[:i]+'function %sInner('%name+s[i+len(pre):j]+'\n}\n\n'+('export ' if export else '')+'const %s = memo(%sInner);\n'%(name,name)+s[j+3:]
    open(path,'w').write(s)
A=root+'/app/components/arrangement/'
conv_memo_fn(A+'ArrangementClip.tsx','ArrangementClipRangeOverlay')
conv_memo_fn(A+'StudioWorkspace.tsx','ArrangementRangeReadout')
conv_plain(A+'ArrangementClip.tsx','ArrangementPeakPath',True)
conv_plain(A+'ArrangementDetailPanel.tsx','ArrangementDetailPlayhead')
conv_plain(A+'ArrangementDetailPanel.tsx','ArrangementDetailWaveform')
T=root+'/app/lib/arrangement/__tests__/'
p=T+'render-budget.test.tsx';s=open(p).read();s=s.replace("'ArrangementDetailPlayhead'","'ArrangementDetailPlayheadInner'");open(p,'w').write(s)
p=T+'clip-gain-pointer-preview.test.tsx';s=open(p).read();s=s.replace("'ArrangementPeakPath'","'ArrangementPeakPathInner'").replace("'ArrangementDetailWaveform',","'ArrangementDetailWaveformInner',");open(p,'w').write(s)
