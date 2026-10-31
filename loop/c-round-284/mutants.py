import sys,shutil
n=sys.argv[1]
def sub(p,a,b):
    s=open(p).read(); assert a in s,(n,p,a[:60]); open(p,'w').write(s.replace(a,b,1))
C='app/components/arrangement/ArrangementClip.tsx'; E='app/components/arrangement/ArrangementClipEnvelope.tsx'; P='app/lib/arrangement/peaks.ts'
if n=='HEADCODE':
    for f in [C,E,P]: shutil.copy('/tmp/c284/head/'+f, f)
    # tests import new exports from peaks: keep sketch peaks exports but HEAD components
    shutil.copy('/tmp/c284/a/'+P, P)
elif n=='Z1': sub(C,"const peakColumns = waveformPeakColumns(clip.duration, pxPerSecond);","const peakColumns = Math.round(Math.min(width, 4096));")
elif n=='Z2': sub(P,"const PEAK_COLUMN_BAND_FACTOR = 4;","const PEAK_COLUMN_BAND_FACTOR = 2;")
elif n=='Z3': sub(E,"(point) => `${point.time - sourceOffset},","(point) => `${(point.time - sourceOffset) * props.pxPerSecond},")
elif n=='Z4': sub(E,"  }, [clip]);","  }, []);")
elif n=='Z5': sub(P,"  return Math.max(1, Math.min(PEAK_SHAPE_MAX_COLUMNS, Math.ceil(buckets / bucketsPerColumn)));","  return Math.max(1, Math.min(PEAK_SHAPE_MAX_COLUMNS, buckets));")
else: raise SystemExit('unknown')
