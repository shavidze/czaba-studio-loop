import re, sys, os, json, subprocess, shutil
# usage: mutate.py <tree> -> runs every mutant on <tree>, prints JSON lines {id, rc}
tree=sys.argv[1]; only=sys.argv[2:] 
A='app/components/arrangement/'
T='app/lib/arrangement/__tests__/'
M=[
 ('M1-NF2-TYPE-BOUNDARY', A+'ArrangementGroupHeader.tsx', '            type="text"\n', '            type="text"\n            data-input-type="number"\n', T+'studio-number-field.test.ts'),
 ('M2-NF2-CLASSNAME-CONST', A+'ArrangementDetailPanel.tsx', [('disabled:text-dim ${STUDIO_NUMBER_FIELD_CLASS}`;', 'disabled:text-dim`;'), ("className={cn(inputClass, 'shrink-0', isPending && 'border-warning')}", 'className={STUDIO_NUMBER_FIELD_CLASS}'), ('              className={inputClass}\n              data-testid="arrangement-detail-start"', '              className={STUDIO_NUMBER_FIELD_CLASS}\n              data-testid="arrangement-detail-start"'), ('              className={inputClass}\n              data-testid="arrangement-detail-end"', '              className={STUDIO_NUMBER_FIELD_CLASS}\n              data-testid="arrangement-detail-end"')], None, T+'studio-number-field.test.ts'),
 ('M3-RD2-SPREAD-AFTER-TYPE', A+'ArrangementExportDialog.tsx', '                type="radio"\n', '                type="radio"\n                {...radioOverrides}\n', T+'studio-radio.test.ts'),
 ('M4-RD2-DATA-TYPE', A+'ArrangementGroupHeader.tsx', '            type="text"\n', '            type="text"\n            data-type="radio"\n', T+'studio-radio.test.ts'),
 ('M5-RD2-DATETIME-LOCAL', A+'StudioNarrowScreen.tsx', '              type="text"\n', '              type="datetime-local"\n', T+'studio-radio.test.ts'),
 ('M6-PG2-SPREAD', A+'ArrangementExportDialog.tsx', '                  data-testid="arrangement-export-progress"\n', '                  data-testid="arrangement-export-progress"\n                  {...progressOverrides}\n', T+'studio-progress.test.ts'),
 ('M7-PG2-STYLE', A+'ArrangementExportDialog.tsx', '                  data-testid="arrangement-export-progress"\n', '                  data-testid="arrangement-export-progress"\n                  style={{ accentColor: "red" }}\n', T+'studio-progress.test.ts'),
 ('M8-PG2-CREATE-ELEMENT', A+'studio-progress.ts', None, "\nexport const legacyProgress = () => document.createElement('progress');\n", T+'studio-progress.test.ts'),
 ('M9-SF2-SPREAD', A+'ArrangementShortcutSheet.tsx', '            type="search"\n', '            type="search"\n            {...searchOverrides}\n', T+'studio-search-field.test.ts'),
 ('M10-SF2-COMMENT-APOSTROPHE', A+'ArrangementShortcutSheet.tsx', '            type="search"\n', '            type="search"\n            // the browser\'s cancel > is hidden below\n', T+'studio-search-field.test.ts'),
 ('M11-DS4-SUBFOLDER-MODAL', A+'dialogs/ArrangementNewDialog.tsx', None, "import { Modal } from '~/components/ui';\n\nexport function ArrangementNewDialog() {\n  return (\n    <Modal isOpen onClose={() => {}} aria-label=\"New\">\n      <p>x</p>\n    </Modal>\n  );\n}\n", T+'studio-dialog-scrollbar.test.tsx'),
 ('M12-HS1-NEGATED-REPEAT', A+'studio-repeat-safe.ts', None, "\nexport function isFreshEnter(event: KeyboardEvent): boolean {\n  return !event.repeat && event.key === 'Enter';\n}\n", T+'held-enter-source-scan.test.ts'),
 ('M14-NF2-TAG-DROPS-CLASS', A+'ArrangementDetailPanel.tsx', '              className={inputClass}\n              data-testid="arrangement-detail-start"', '              className="h-6 w-20"\n              data-testid="arrangement-detail-start"', T+'studio-number-field.test.ts'),
 ('M15-NF2-HANDOFF-LITERAL', A+'ArrangementDetailPanel.tsx', '        inputClass={inputClass}\n', '        inputClass="h-6 w-20 rounded-md"\n', T+'studio-number-field.test.ts'),
 ('M16-NF2-TERNARY-CARRIER', A+'ArrangementDetailPanel.tsx', '              className={inputClass}\n              data-testid="arrangement-detail-start"', '              className={clip ? \'h-6\' : inputClass}\n              data-testid="arrangement-detail-start"', T+'studio-number-field.test.ts'),
 ('M13-NF2-NUMBER-STYLE', A+'ArrangementDetailPanel.tsx', '              className={inputClass}\n', '              className={inputClass}\n              style={{ appearance: "auto" }}\n', T+'studio-number-field.test.ts'),
 ('M17-NF2-WRAPPER-NEW-FILE', A+'ArrangementMutantM17.tsx', None, "import { Input } from '~/components/ui/Input';\n\nexport function ArrangementMutantM17() {\n  return <Input type=\"number\" className=\"x\" />;\n}\n", T+'studio-number-field.test.ts'),
 ('M18-NF2-WRAPPER-IN-OWNER', A+'ArrangementDetailPanel.tsx', '            {studioDetailStrings.rangeToLabel}\n', '            {studioDetailStrings.rangeToLabel}\n            <Input type="number" className="x" />\n', T+'studio-number-field.test.ts'),
 ('M19-PG2-STRING-MARKUP', A+'ArrangementExportDialog.tsx', None, "\nexport const legacyProgressMarkup = '<progress max=\"1\"></progress>';\n", T+'studio-progress.test.ts'),
 ('M20-RD2-STRING-MARKUP', A+'ArrangementExportDialog.tsx', None, "\nexport const legacyRadioMarkup = '<input type=\"radio\" name=\"f\" />';\n", T+'studio-radio.test.ts'),
 ('M21-SF2-STRING-MARKUP', A+'ArrangementShortcutSheet.tsx', None, "\nexport const legacySearchMarkup = '<input type=\"search\" />';\n", T+'studio-search-field.test.ts'),
 ('M22-NF2-STRING-MARKUP', A+'ArrangementGroupHeader.tsx', None, "\nexport const legacyNumberMarkup = '<input type=\"number\" />';\n", T+'studio-number-field.test.ts'),
 ('M23-NF2-WRAPPER-COMPUTED-TYPE', A+'ArrangementMutantM23.tsx', None, "import { Input } from '~/components/ui/Input';\n\nexport function ArrangementMutantM23() {\n  return <Input type={'number' as const} className=\"x\" />;\n}\n", T+'studio-number-field.test.ts'),
 ('M21b-SF2-STRING-MARKUP-VIA-IN1', A+'ArrangementShortcutSheet.tsx', None, "\nexport const legacySearchMarkup = '<input type=\"search\" />';\n", T+'studio-radio.test.ts'),
 ('M24-PG2-PAIRED-WITH-CLASS', A+'ArrangementExportDialog.tsx', '                  className={STUDIO_PROGRESS_CLASS}\n                />\n', '                  className={STUDIO_PROGRESS_CLASS}\n                ></progress>\n', T+'studio-progress.test.ts'),
 ('M25-PG2-PAIRED-NO-CLASS', A+'ArrangementExportDialog.tsx', '                  className={STUDIO_PROGRESS_CLASS}\n                />\n', '                  className="h-1"\n                ></progress>\n', T+'studio-progress.test.ts'),
]
for mid,path,old,new,test in M:
    if only and mid not in only: continue
    full=os.path.join(tree,path); existed=os.path.exists(full)
    orig=open(full).read() if existed else None
    if isinstance(old,list):
        text=orig
        for o,n in old:
            assert o in text,(mid,'anchor missing',o[:40])
            text=text.replace(o,n,1)
        open(full,'w').write(text)
    elif old is None:
        os.makedirs(os.path.dirname(full),exist_ok=True)
        open(full,'w').write((orig or '')+new)
    else:
        assert orig is not None and old in orig, (mid,'anchor missing')
        open(full,'w').write(orig.replace(old,new,1))
    try:
        r=subprocess.run(['npx','vitest','run','--reporter=verbose',test],cwd=tree,capture_output=True,text=True,timeout=300)
        rc=r.returncode
        fails=sorted(set(re.findall(r'(?:×|FAIL)[^\n]*?> ([A-Z]{2}[0-9]+[a-z]?):', re.sub(r'\x1b\[[0-9;]*m','',r.stdout))))
    finally:
        if existed: open(full,'w').write(orig)
        else:
            os.remove(full)
            d=os.path.dirname(full)
            if not os.listdir(d): os.rmdir(d)
    print(json.dumps({'id':mid,'test':test.split('/')[-1],'rc':rc,'fails':fails}),flush=True)
