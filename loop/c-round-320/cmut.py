import sys
root, name = sys.argv[1], sys.argv[2]
A='app/components/arrangement/ArrangementClip.tsx'; D='app/components/arrangement/ArrangementDetailPanel.tsx'; S='app/components/arrangement/StudioWorkspace.tsx'
M={
 'C-MU-PLAYHEAD-NO-MEMO':(D,'const ArrangementDetailPlayhead = memo(ArrangementDetailPlayheadInner);','const ArrangementDetailPlayhead = ArrangementDetailPlayheadInner;'),
 'C-MU-PEAKPATH-NO-MEMO':(A,'export const ArrangementPeakPath = memo(ArrangementPeakPathInner);','export const ArrangementPeakPath = ArrangementPeakPathInner;'),
 'C-MU-WAVEFORM-NO-MEMO':(D,'const ArrangementDetailWaveform = memo(ArrangementDetailWaveformInner);','const ArrangementDetailWaveform = ArrangementDetailWaveformInner;'),
 'C-MU-READOUT-NO-MEMO':(S,'const ArrangementRangeReadout = memo(ArrangementRangeReadoutInner);','const ArrangementRangeReadout = ArrangementRangeReadoutInner;'),
}
p,o,n=M[name]; f=root+'/'+p; s=open(f).read(); assert s.count(o)==1,(name,'count'); open(f,'w').write(s.replace(o,n)); print('applied',name)
