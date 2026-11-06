sketch sha256: d37406ae45891c05f78147c6c6d1d2e60350d350fd6f0fffb73a25f8013640a8  b-round-364/sketch.patch.txt (v3, dispatched)

# B round 364 → 365: sketch review (L58)

- **Reviewer:** `tech-lead` (read-only). `code-reviewer` is not on B's consult list; `tech-lead` stands in for it (ROOT-REQ-B-CONSULT-CODE-REVIEWER).
- **Reviewed:** the v1 sketch, `sketch-v1/sketch-v1.patch.txt` (sha in `sketch-v1/sketch-dispatched.sha256`).
- **Fixes:** all Medium+ findings are fixed in the v2 sketch, together with the cheap Lows.
- **v2 checks:**
  - tsc 0 (`sketch-typecheck.log`);
  - Biome clean on the 5 files (`sketch-biome.log`);
  - covering 10 files 165/165 (`sketch-covering.log`);
  - full suite (`precheck-full.log`);
  - browser probe (`probe/sketch-cache-*.json`).
- **v1 evidence:** `probe/sketch-v1-cache-*.json`, and the v1 full suite at 248 files 3647/3647 (overwritten by the v2 run, recorded in `b-round-364.md`).

| # | Severity | Finding (v1) | Ruling | v2 |
|---|---|---|---|---|
| 1 | Medium | The quota retry called `selectStemCacheEvictions(…, MAX_VALUE, Infinity)`, which returns `[]`, so nothing was evicted | **Fixed.** The oldest other record (sorted by `lastAccessedAt`) is deleted directly; the store then retries once, and a second failure turns the cache off | `storeBytes` catch branch |
| 2 | Medium | Concurrent writes to the same key left an orphan OPFS file | **Fixed.** A per-key in-flight `writes` map means a second write while one is pending is skipped. A one-time `sweep()` before the first write of a session deletes invalid index records and OPFS files that no record references. The race across tabs is closed by the sweep | `writeInBackground`, `sweep` |
| 3 | Medium | `writeRecord` failing after the file closed left the file behind | **Fixed.** The file is removed, then the error is rethrown | `put` |
| 4 | Medium | A body read or abort error inside `write` turned the cache off for the session | **Fixed.** A body read error returns quietly. Only storage errors (`list`/`delete`/`put`/`sweep`) set `disabled` | `write` |
| 5 | Low | `clone()` was taken before the cheap checks, which tees the body for nothing | **Fixed.** `disabled`, the in-flight key, status 200 and the validators are checked before `clone()` | `writeInBackground` |
| 6 | Low | `touch` used two transactions, and the 304 path did not await it | **Fixed.** One `readwrite` transaction, and it is awaited (errors are swallowed) | `touch`, 304 branch |
| 7 | Low | `isStemCacheRecord` checked only 4 fields | **Fixed and exported.** Every field is checked (strings or `null`, finite numbers, the schema version) | `isStemCacheRecord` |
| 8 | Low | No test handle for background writes | **Fixed.** `createCachedSourceFetch` returns `{ fetchSource, idle }`; tests await `idle()` | return value |
| I1 | Info | A 304 when the entry vanished in between | Safe; no change | — |
| I2 | Info | SSR | Safe (`.client` + `typeof window`); A-SSR row | — |
| I3 | Info | A 5xx could serve the cached bytes | **Adopted.** On a hit, a status ≥ 500 returns the cached bytes (contract §1.2, row SC18) | 5xx branch |
| I4 | Info | A rejected IndexedDB open stays cached; no `onblocked`/`onversionchange` | Accepted for 9a. It degrades to plain network through `get` → miss and write → off. Recorded for 9b | — |

The TS lib has no `FileSystemDirectoryHandle.keys()` (`tsconfig` lib `DOM`, `DOM.Iterable`). The sweep uses the type guard `isListableDirectory`, not an assertion, and does nothing when `keys()` is absent.

## Second review: the v1 → v2 delta (`tech-lead`, read-only; diff `sketch-v1-to-v2.diff.txt`)

The v2 `stem-cache.client.ts` is kept as `sketch-v1/stem-cache.client.v2.ts.txt`.

| # | Severity | Finding (v2) | Ruling | v3 |
|---|---|---|---|---|
| D1 | Medium | `sweep()` could delete a file another write was still creating. Only the first writer awaited the sweep, and another tab could race it too | **Fixed.** Every write awaits one shared `sweepPromise` (errors ignored). The sweep skips unreferenced files younger than 60 s, using the base-36 time prefix of the file name | `storeBytes`, `sweep(now)` |
| D2 | Medium | A 200 on revalidation that cannot be stored (`no-store`, a disallowed `Vary`, no validators) left the old entry, which a later network error or 5xx would serve | **Fixed.** On a hit, an ok response that cannot be stored deletes the entry before it is returned | hit branch, `isStorable` |

The reviewer found nothing else at Medium or above, and no `any` or type assertion. The rows for these fixes are SC20/SC21, with mutants M11/M12.

**v3 checks:**
- tsc 0;
- Biome clean;
- covering 10 files 165/165;
- full suite and both browser probes rerun on v3 (`precheck-full.log`, `probe/sketch-cache-*.json`).

The v2 probe outputs are in `probe/v2/`.
