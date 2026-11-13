#!/bin/bash
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-483
until grep -q B423B-DONE $C/b423b.status 2>/dev/null; do sleep 5; done
cd $C/s423 && timeout 600 node leaf.cjs > $C/423out/leaf-cjs2.log 2>&1; echo "leaf-cjs2 rc=$?" >> $C/b423b.status
cp $C/out/leaf.json $C/423out/leaf-cjs.json 2>/dev/null
echo FINAL-DONE >> $C/b423b.status
