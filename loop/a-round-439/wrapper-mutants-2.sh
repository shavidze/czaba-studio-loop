#!/bin/bash
# usage: wrapper-mutants-2.sh <scratch-tree> <label> <logdir>; mutants only in scratch copies
T=$1; LBL=$2; LOG=$3; A=app/components/arrangement
app() { id=$1; file=$2; body=$3; suite=$4; mode=$5
  f=$T/$A/$file; [ "$mode" = new ] || cp $f $f.orig
  if [ "$mode" = new ]; then printf '%s' "$body" > $f; else printf '%s' "$body" >> $f; fi
  (cd $T && npx vitest run app/lib/arrangement/__tests__/$suite > $LOG/$id-$LBL.log 2>&1); rc=$?
  if [ "$mode" = new ]; then rm -f $f; else mv $f.orig $f; fi
  echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":$rc}"; }
app W1b-RD2-WRAPPER-IN-OWNER ArrangementExportDialog.tsx "
export function MutantW1b() {
  return <Input type=\"radio\" name=\"f\" className=\"x\" />;
}
" studio-radio.test.ts append
app W2b-SF2-WRAPPER-IN-OWNER ArrangementShortcutSheet.tsx "
export function MutantW2b() {
  return <Input type=\"search\" className=\"x\" />;
}
" studio-search-field.test.ts append
app W3-RD2-POSITIVE-CONTROL ArrangementMutantW3.tsx "export function ArrangementMutantW3() {
  return <input type=\"radio\" name=\"f\" className=\"x\" />;
}
" studio-radio.test.ts new
app W4-SF2-POSITIVE-CONTROL ArrangementMutantW4.tsx "export function ArrangementMutantW4() {
  return <input type=\"search\" className=\"x\" />;
}
" studio-search-field.test.ts new
