import sys
src=open(sys.argv[1]).read(); m=sys.argv[2]
a="current.status === studioPlaybackStrings.insertMarkerWhilePlaying(marker) ||\n"
c="        current.status === FOLLOW_PAUSED_MESSAGE\n"
if m=="NO-REPLACE":
    old="        current.setStatus(studioPlaybackStrings.insertMarkerAfterStop(marker));\n"; new=""
elif m=="REPLACE-ANY":
    i=src.index("      if (\n        current.status === studioPlaybackStrings.insertMarkerWhilePlaying(marker)")
    j=src.index("      ) {\n",i)+len("      ) {\n")
    old=src[i:j]; new="      {\n"
elif m=="NO-PLAIN":
    old="        "+a; new=""
elif m=="NO-FOLLOWPAUSED":
    old=" ||\n"+c; new="\n"
    old="current.status === studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(marker) ||\n"+c
    new="current.status === studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(marker)\n"
elif m=="FIX-CONTROL":
    old="";new=""
assert src.count(old)>=1 or m=="FIX-CONTROL", m
if old: assert src.count(old)==1, (m, src.count(old))
open(sys.argv[1],'w').write(src.replace(old,new,1) if old else src)
