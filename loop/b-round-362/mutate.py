import sys,re
path,name=sys.argv[1],sys.argv[2]
s=open(path).read()
pat=re.compile(r'(const %s = )memo\(%sInner\);' % (name,name)) if name!='ArrangementPeakPath' else re.compile(r'(export const ArrangementPeakPath = )memo\(ArrangementPeakPathInner\);')
n=len(pat.findall(s)); assert n==1,(path,name,n)
s=pat.sub(lambda m:m.group(1)+name+'Inner;',s)
open(path,'w').write(s); print('mutated',name)
