import subprocess, sys, re, os, shutil
SCR='/home/runner/b367-scratch'
L='/home/runner/czaba-project/tmp/studio-real-loop/b-round-367/mutants'
P=SCR+'/app/lib/arrangement/stem-cache.client.ts'
ORIG='/home/runner/czaba-project/tmp/studio-real-loop/b-round-367/v2-stem-cache.client.ts.txt'
src=open(ORIG).read()
M=[
('M-SC22-ABORT-RESOLVES',"""    transaction.onabort = () =>
      reject(transaction.error ?? new DOMException('The transaction was aborted.', 'AbortError'));""","""    transaction.onabort = () => resolve();"""),
('M-SC22-ONERROR-NULL',"""    transaction.oncomplete = () => resolve();""","""    transaction.oncomplete = () => resolve();
    Object.assign(transaction, { onerror: () => reject(transaction.error) });"""),
('M-SC23-WRITE-REQUEST',"""    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    await transactionDone(transaction);""","""    await requestToPromise(
      db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record),
    );"""),
('M-SC28-NO-SIZE',"""      if (file.size !== record.size) {
        await remove(key);
        return null;
      }
""",""),
('M-L3-EVICT',"""    if (victims === null || cancelled()) {""","""    if (victims === null) {"""),
('M-L3-PUT',"""    for (const victim of victims) {
      await activeStore.delete(victim.key);
    }
    if (cancelled()) {
      return;
    }""","""    for (const victim of victims) {
      await activeStore.delete(victim.key);
    }"""),
('M-L5-GONE',"""    if (response.status === 404 || response.status === 410) {
      deleteAfterPendingWrite(store, key);""","""    if (response.status === 404 || response.status === 410) {
      await store.delete(key).catch(() => undefined);"""),
('M-L5-BLOCKING',"""    if (response.status === 404 || response.status === 410) {
      deleteAfterPendingWrite(store, key);""","""    if (response.status === 404 || response.status === 410) {
      await writes.get(key)?.done.catch(() => undefined);
      await store.delete(key).catch(() => undefined);"""),
('M-L5-UNSTORABLE',"""    if (response.ok && !isStorable(response)) {
      deleteAfterPendingWrite(store, key);""","""    if (response.ok && !isStorable(response)) {
      await store.delete(key).catch(() => undefined);"""),
('M-L6-CLONE',"""    let copy: Response;
    try {
      copy = response.clone();
    } catch {
      return;
    }""","""    const copy = response.clone();"""),
('M-L6-HEADERS',"""    try {
      headers.set('content-type', entry.record.contentType);
    } catch {
      return new Response(entry.bytes, { status: 200 });
    }""","""    headers.set('content-type', entry.record.contentType);"""),
('M-SERIAL',"""  ): Promise<void> => enqueueCommit(() => storeBytesNow(activeStore, record, bytes, abandoned));""","""  ): Promise<void> => storeBytesNow(activeStore, record, bytes, abandoned);"""),
('M-IDLE-NO-DELETES',"""      await Promise.all([...deletes]);
      await commitChain;
""",""),
('M-V2-NO-JOIN',"""      pending.signals.push(init.signal);
""",""),
('M-V2-SOME',"""  return signals.every((signal) => signal?.aborted === true);""","""  return signals.some((signal) => signal?.aborted === true);"""),
('M-C367-DELETE-SKIPS-PENDING',"""    const pendingWrite = writes.get(key)?.done ?? Promise.resolve();""","""    const pendingWrite = Promise.resolve();"""),
('M-L3-RETRY',"""        await activeStore.delete(oldest.key);
      }
      if (cancelled()) {
        return;
      }""","""        await activeStore.delete(oldest.key);
      }"""),
('M-V2-LAST-SIGNAL',"""  return signals.every((signal) => signal?.aborted === true);""","""  return signals[signals.length - 1]?.aborted === true;"""),
('M-SC32-NO-WRITE',"""    const pending = writes.get(key);
    if (pending !== undefined) {""","""    if (response.headers.get('etag') === '"v2"') {
      return;
    }
    const pending = writes.get(key);
    if (pending !== undefined) {"""),
]
only=sys.argv[1:]
summary=[]
try:
  for mid,old,new in M:
    if only and mid not in only: continue
    assert src.count(old)==1,(mid,src.count(old))
    open(P,'w').write(src.replace(old,new))
    d=subprocess.run(['diff','-u',ORIG,P],capture_output=True,text=True).stdout
    open(f'{L}/mutant-{mid}.diff.txt','w').write(d)
    r=subprocess.run(['npx','vitest','run','app/lib/arrangement/__tests__/stem-cache.test.ts'],cwd=SCR,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    open(f'{L}/mutant-{mid}.log','w').write(out)
    red=sorted(set(re.findall(r'(?:×|FAIL ).*?\b(SC\d+)\b',out)),key=lambda x:int(x[2:]))
    t=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    line=f"{mid} rc={r.returncode} red: {' '.join(red) or 'NONE'} | {t[-1] if t else '?'}"
    print(line,flush=True); summary.append(line)
finally:
  shutil.copyfile(ORIG,P)
  print('restored', subprocess.run(['cmp',ORIG,P]).returncode==0)
if not only:
  open(f'{L}/mutant-summary.txt','w').write('\n'.join(summary)+'\n')
