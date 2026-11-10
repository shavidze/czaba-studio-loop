#!/bin/bash
# usage: wrapper-mutants.sh <scratch-tree> <label> <logdir>; mutants only in scratch copies
T=$1; LBL=$2; LOG=$3; A=app/components/arrangement
run() { id=$1; file=$2; body=$3; suite=$4
  printf '%s' "$body" > $T/$A/$file
  (cd $T && npx vitest run app/lib/arrangement/__tests__/$suite > $LOG/$id-$LBL.log 2>&1); rc=$?
  rm -f $T/$A/$file
  echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":$rc}"; }
run W1-RD2-WRAPPER-RADIO ArrangementMutantW1.tsx "import { Input } from '~/components/ui/Input';

export function ArrangementMutantW1() {
  return <Input type=\"radio\" name=\"f\" className=\"x\" />;
}
" studio-radio.test.ts
run W2-SF2-WRAPPER-SEARCH ArrangementMutantW2.tsx "import { Input } from '~/components/ui/Input';

export function ArrangementMutantW2() {
  return <Input type=\"search\" className=\"x\" />;
}
" studio-search-field.test.ts
run W0-BASELINE-NONE ArrangementMutantW0.tsx "export const w0 = 1;
" studio-radio.test.ts
