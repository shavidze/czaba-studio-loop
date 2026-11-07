p='rows377.mjs'; s=open(p).read()
def rep(a,b):
    global s
    assert a in s, a[:60]
    s=s.replace(a,b)
rep("for (const n of ['Split', 'Delete', 'Zoom to selection', 'Zoom back']) o[n] = await read(btn(new RegExp('^' + n, 'i')));","for (const n of ['Split', 'Delete', 'Zoom to selection']) o[n] = await read(btn(new RegExp('^' + n, 'i'))); o['Zoom back'] = await read(page.getByTestId('arrangement-zoom-back'));")
rep("for (const n of ['Undo', 'Redo', 'Split', 'Delete', 'Loop', 'Zoom to selection', 'Zoom back']) o[n] = await read(btn(new RegExp('^' + n, 'i'))); return o;","for (const n of ['Undo', 'Redo', 'Split', 'Delete', 'Loop', 'Zoom to selection']) o[n] = await read(btn(new RegExp('^' + n, 'i'))); o['Zoom back'] = await read(page.getByTestId('arrangement-zoom-back')); return o;")
rep("page.getByRole('button', { name: 'Master Mute' }).first()","page.locator('button[aria-label=\"Master Mute\"]').first()")
rep("api/studio-token`","api/studio-token?product=middle-east&file=stem.wav`")
rep("const pp = prev.getByRole('button', { name: /^Play/ }).first();","const pp = prev.getByTestId('arrangement-library-preview-toggle');")
i=s.index("o.prevAfterPlay"); j=s.index("return o; });",i)
s=s[:i]+"o.prevPlaying = await pp.evaluate(e => ({ label: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), text: e.textContent.trim() })); await pp.click(); await page.waitForTimeout(300); o.prevStopped = await pp.evaluate(e => ({ label: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), text: e.textContent.trim() })); }\n      "+s[j:]
open(p,'w').write(s)
