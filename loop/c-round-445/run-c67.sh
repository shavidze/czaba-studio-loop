#!/usr/bin/env bash
cd /home/runner/czaba-project/tmp/studio-real-loop
O=c-round-445
BASE=http://127.0.0.1:5173 node b-round-441/probe/ime-sites.mjs ALL 1440x900,1280x720 > $O/sites.json 2>$O/sites.err
BASE=http://127.0.0.1:5173 node b-round-442/probe/ime-held.mjs ALL 1440x900,1280x720 > $O/held.json 2>$O/held.err
BASE=http://127.0.0.1:5173 COMPOSE=so node b-round-443/probe/ime-stage2.mjs ALL 1440x900,1280x720 > $O/stage2.json 2>$O/stage2.err
BASE=http://127.0.0.1:5173 node b-round-442/probe/plain-held.mjs ALL 1440x900,1280x720 > $O/plain-tree.json 2>$O/plain-tree.err
BASE=http://127.0.0.1:5177 node b-round-442/probe/plain-held.mjs ALL 1440x900,1280x720 > $O/plain-head.json 2>$O/plain-head.err
echo done > $O/c67.done
