# B round 418 -> 419: writes the SYS-R369 sketch source into <scratch>/app/lib/arrangement/stem-cache.client.ts
import sys
root = sys.argv[1]
p = root + '/app/lib/arrangement/stem-cache.client.ts'
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    if s.count(old) != 1:
        sys.exit('site not found once: ' + old[:80])
    s = s.replace(old, new)

rep("""  const remove = async (key: string): Promise<void> => {
    const record = await readRecord(key);
    await deleteRecord(key);
    if (record !== null) {
      await removeFile(record.fileName);
    }
  };
""", """  const remove = async (key: string): Promise<void> => {
    const record = await readRecord(key);
    await deleteRecord(key);
    if (record !== null) {
      await removeFile(record.fileName);
    }
  };
  const removeIfCurrent = async (held: StemCacheRecord): Promise<void> => {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(held.key);
    request.onsuccess = () => {
      const value: unknown = request.result;
      if (isStemCacheRecord(value) && value.fileName === held.fileName) {
        store.delete(held.key);
      }
    };
    await transactionDone(transaction);
    await removeFile(held.fileName);
  };
""")
rep("""      } catch {
        await remove(key);
        return null;
      }
      if (file.size !== record.size) {
        await remove(key);
        return null;
      }""", """      } catch {
        await removeIfCurrent(record);
        return null;
      }
      if (file.size !== record.size) {
        await removeIfCurrent(record);
        return null;
      }""")
rep("""      const previous = await readRecord(record.key);
      const handle""", """      const previous = await readRecord(record.key);
      if (previous !== null && previous.fileName === record.fileName) {
        throw new DOMException('The stem cache file name is already in use.', 'InvalidStateError');
      }
      const handle""")
rep("""interface PendingStemWrite {
  done: Promise<void>;
  signals: Array<AbortSignal | null | undefined>;
}
""", """interface StemKeyWrite {
  kind: 'write';
  done: Promise<void>;
  signals: Array<AbortSignal | null | undefined>;
  open: boolean;
}

interface StemKeyDelete {
  kind: 'delete';
  done: Promise<void>;
}

type StemKeyOperation = StemKeyWrite | StemKeyDelete;
""")
rep("""  let commitChain: Promise<void> = Promise.resolve();
  const writes = new Map<string, PendingStemWrite>();
  const deletes = new Set<Promise<void>>();
""", """  let commitChain: Promise<void> = Promise.resolve();
  let fileCount = 0;
  const operations = new Map<string, StemKeyOperation>();

  const settle = (key: string, operation: StemKeyOperation): void => {
    if (operations.get(key) === operation) {
      operations.delete(key);
    }
  };
""")
rep("""    for (const victim of victims) {
      await activeStore.delete(victim.key);
    }""", """    for (const victim of victims) {
      if (cancelled()) {
        return;
      }
      await activeStore.delete(victim.key);
    }""")
rep("""  const deleteAfterPendingWrite = (activeStore: StemCacheStore, key: string): void => {
    const pendingWrite = writes.get(key)?.done ?? Promise.resolve();
    const run = pendingWrite
      .then(() => enqueueCommit(() => activeStore.delete(key)))
      .catch(() => undefined);
    deletes.add(run);
    void run.finally(() => {
      deletes.delete(run);
    });
  };

  const write = async (
    activeStore: StemCacheStore,
    key: string,
    response: Response,
    abandoned: () => boolean,
  ): Promise<void> => {""", """  const deleteAfterPendingOperation = (activeStore: StemCacheStore, key: string): void => {
    const previous = operations.get(key)?.done ?? Promise.resolve();
    const operation: StemKeyDelete = { kind: 'delete', done: Promise.resolve() };
    operation.done = previous
      .then(() => enqueueCommit(() => activeStore.delete(key)))
      .catch(() => undefined)
      .finally(() => settle(key, operation));
    operations.set(key, operation);
  };

  const write = async (
    activeStore: StemCacheStore,
    key: string,
    response: Response,
    abandoned: () => boolean,
    after: Promise<void>,
  ): Promise<void> => {""")
rep("""    const at = now();
    const record: StemCacheRecord = {
      key,
      fileName: `${at.toString(36)}-${Math.random().toString(36).slice(2)}`,""", """    await after;
    const at = now();
    fileCount += 1;
    const record: StemCacheRecord = {
      key,
      fileName: `${at.toString(36)}-${fileCount.toString(36)}-${Math.random().toString(36).slice(2)}`,""")
rep("""    const pending = writes.get(key);
    if (pending !== undefined) {
      pending.signals.push(init.signal);
      return;
    }
    let copy: Response;
    try {
      copy = response.clone();
    } catch {
      return;
    }
    const signals = [init.signal];
    const done = write(store, key, copy, () => isStemWriteAbandoned(signals)).finally(() => {
      writes.delete(key);
    });
    writes.set(key, { done, signals });
  };""", """    const pending = operations.get(key);
    if (pending?.kind === 'write' && pending.open) {
      pending.signals.push(init.signal);
      return;
    }
    let copy: Response;
    try {
      copy = response.clone();
    } catch {
      return;
    }
    const operation: StemKeyWrite = {
      kind: 'write',
      done: Promise.resolve(),
      signals: [init.signal],
      open: true,
    };
    const abandoned = (): boolean => {
      if (isStemWriteAbandoned(operation.signals)) {
        operation.open = false;
        return true;
      }
      return false;
    };
    operation.done = write(store, key, copy, abandoned, pending?.done ?? Promise.resolve()).finally(
      () => settle(key, operation),
    );
    operations.set(key, operation);
  };""")
rep("""      deleteAfterPendingWrite(store, key);
      return response;
    }
    if (response.status >= 500) {""", """      deleteAfterPendingOperation(store, key);
      return response;
    }
    if (response.status >= 500) {""")
rep("""    if (response.ok && !isStorable(response)) {
      deleteAfterPendingWrite(store, key);""", """    if (response.ok && !isStorable(response)) {
      deleteAfterPendingOperation(store, key);""")
rep("""    idle: async () => {
      await Promise.all([...writes.values()].map((pending) => pending.done));
      await Promise.all([...deletes]);
      await commitChain;
    },""", """    idle: async () => {
      while (operations.size > 0) {
        await Promise.all([...operations.values()].map((operation) => operation.done));
      }
      await commitChain;
    },""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
