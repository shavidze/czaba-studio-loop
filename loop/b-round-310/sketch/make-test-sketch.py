import sys
base = sys.argv[1]
path = base + '/sketch-r2-proxy.test.mjs.txt'
t = open(path).read()
def sub(text, old, new):
    assert text.count(old) == 1, old
    return text.replace(old, new)
t = sub(t, """        const range = options?.range;
        let slice = DATA;
        if (range) {
""", """        const range = options?.range;
        let slice = DATA;
        if (range && [range.offset, range.length, range.suffix].some((value) => value !== undefined && !Number.isSafeInteger(value))) throw new TypeError('R2 range value is not a safe integer');
        if (range) {
""")
t = sub(t, """    assert.equal(heads.length, 1);
    assert.equal((await publicRequest('preview/mall/a.wav', { failGet: true })).response.status, 500);
  });""", """    assert.equal(heads.length, 1);
    const whole = await publicRequest('preview/mall/a.wav', { failGet: true });
    assert.equal(whole.response.status, 500);
    assert.equal(whole.heads.length, 0);
  });""")
t = sub(t, """        assert.equal(response.headers.get('Cache-Control'), 'no-store');
        assert.equal(body, null);
      }
    }
    const rejected""", """        assert.equal(response.headers.get('Cache-Control'), 'no-store');
        assert.equal(response.headers.get('ETag'), ETAG);
        assert.equal(body, null);
        assert.ok(opened.every((o) => o.cancelled), `${outOfRange} ${range}`);
      }
    }
    const rejected""")
t = sub(t, """        const { response, body } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange, empty: true });""", """        const { response, body, opened } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange, empty: true });""")
new_rows = """  test(`${name}: PR16 a range value beyond a safe integer is never sent to R2 and still gives the clamped 206 or the 416`, async () => {
    const huge = '9'.repeat(400);
    const cases = [[`bytes=0-${huge}`, { offset: 0 }, 'bytes 0-99/100', 0], [`bytes=10-99999999999999999999`, { offset: 10 }, 'bytes 10-99/100', 10], [`bytes=-${huge}`, { offset: 0 }, 'bytes 0-99/100', 0], ['bytes=-99999999999999999999', { offset: 0 }, 'bytes 0-99/100', 0], ['bytes=10-9007199254741000', { offset: 10, length: 9007199254740991 }, 'bytes 10-99/100', 10]];
    for (const outOfRange of ['throw', 'short']) {
      for (const [range, sent, contentRange, first] of cases) {
        const label = `${outOfRange} ${range.slice(0, 32)}`;
        const { response, body, reads, heads } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange });
        assert.equal(response.status, 206, label);
        assert.deepEqual(reads.map((r) => r.range), [sent], label);
        assert.equal(heads.length, 0, label);
        assert.equal(response.headers.get('Content-Range'), contentRange, label);
        assert.equal(response.headers.get('Content-Length'), String(100 - first), label);
        assert.equal(body.length, 100 - first, label);
        assert.equal(body[0], first, label);
      }
      const far = await publicRequest('preview/mall/a.wav', { headers: { Range: `bytes=${huge}-` }, outOfRange });
      assert.equal(far.response.status, 416, outOfRange);
      assert.equal(far.response.headers.get('Content-Range'), 'bytes */100');
      assert.equal(far.response.headers.get('Cache-Control'), 'no-store');
    }
  });
  test(`${name}: PR17 the If-Range re-read answers If-None-Match and takes its ETag from the second object`, async () => {
    for (const outOfRange of ['throw', 'short']) {
      for (const range of ['bytes=0-9', 'bytes=500-']) {
        const label = `${outOfRange} ${range}`;
        const served = await publicRequest('preview/mall/a.wav', { headers: { Range: range, 'If-Range': '"old"' }, outOfRange, changedOnSecondRead: true });
        assert.equal(served.response.status, 200, label);
        assert.equal(served.response.headers.get('ETag'), '"etag-2"', label);
        assert.equal(served.body.length, 100, label);
        assert.equal(served.reads.length, 2, label);
        const fresh = await publicRequest('preview/mall/a.wav', { headers: { Range: range, 'If-Range': '"old"', 'If-None-Match': '"etag-2"' }, outOfRange, changedOnSecondRead: true });
        assert.equal(fresh.response.status, 304, label);
        assert.equal(fresh.body, null, label);
        assert.equal(fresh.response.headers.get('ETag'), '"etag-2"', label);
        assert.equal(fresh.response.headers.get('Content-Type'), null, label);
        assert.equal(fresh.response.headers.get('Content-Length'), null, label);
        assert.equal(fresh.response.headers.get('Content-Range'), null, label);
        assert.equal(fresh.response.headers.get('Accept-Ranges'), null, label);
        assert.equal(fresh.response.headers.get('Cache-Control'), 'public, max-age=86400', label);
        assert.equal(fresh.reads.length, 2, label);
        assert.ok(fresh.opened.length > 0 && fresh.opened.every((o) => o.cancelled), label);
      }
    }
  });
  test(`${name}: PR18 HEAD answers If-None-Match with 304 and an unsatisfiable range with a no-store 416 from one head`, async () => {
    const fresh = await publicRequest('preview/mall/a.wav', { method: 'HEAD', headers: { 'If-None-Match': ETAG, Range: 'bytes=0-9' } });
    assert.equal(fresh.response.status, 304);
    assert.equal(fresh.response.headers.get('ETag'), ETAG);
    assert.equal(fresh.response.headers.get('Content-Type'), null);
    assert.equal(fresh.heads.length, 1);
    assert.equal(fresh.reads.length, 0);
    const far = await publicRequest('preview/mall/a.wav', { method: 'HEAD', headers: { Range: 'bytes=500-' } });
    assert.equal(far.response.status, 416);
    assert.equal(far.response.headers.get('Content-Range'), 'bytes */100');
    assert.equal(far.response.headers.get('Cache-Control'), 'no-store');
    assert.equal(far.response.headers.get('Content-Type'), null);
    assert.equal(far.heads.length, 1);
    assert.equal(far.reads.length, 0);
  });
  if (name === 'proxy') {"""
t = sub(t, "  if (name === 'proxy') {", new_rows)
open(path, 'w').write(t)
print('ok')
