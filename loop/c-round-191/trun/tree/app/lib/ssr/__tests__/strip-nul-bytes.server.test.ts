// @vitest-environment node
import { PassThrough, type Transform } from 'node:stream';
import type { EntryContext } from '@remix-run/node';
import { createElement, type ReactElement } from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import handleRequest from '~/entry.server';
import { createNulByteStripStream, stripNulBytes } from '../strip-nul-bytes.server';

vi.mock('@remix-run/react', () => ({
  RemixServer: () => buildDeleteButtonsFixture(),
}));

const GOOGLEBOT_USER_AGENT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function buildDeleteButtonsFixture(): ReactElement {
  return createElement(
    'div',
    null,
    Array.from({ length: 400 }, (_, i) =>
      // biome-ignore lint/a11y/useButtonType: adding attributes shifts react-dom 2048-byte view boundaries and can hide the NUL repro; fixture is rendered to string only
      createElement('button', { key: i, 'aria-label': 'წაშლა ' + i }, 'ა'),
    ),
  );
}

function countNulBytes(bytes: Buffer): number {
  let count = 0;
  for (const byte of bytes) {
    if (byte === 0) {
      count++;
    }
  }
  return count;
}

function collectStreamOutput(stream: Transform): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function writeChunksThroughStripper(chunks: ReadonlyArray<Buffer | string>): Promise<Buffer> {
  const stream = createNulByteStripStream();
  const output = collectStreamOutput(stream);
  for (const chunk of chunks) {
    stream.write(chunk);
  }
  stream.end();
  return output;
}

function renderFixtureInto(stream: Transform): Promise<Buffer> {
  const output = collectStreamOutput(stream);
  const { pipe } = renderToPipeableStream(buildDeleteButtonsFixture(), {
    onAllReady() {
      pipe(stream);
    },
  });
  return output;
}

function createEntryContextFixture(): EntryContext {
  return {
    manifest: {
      entry: { imports: [], module: '/entry.client.js' },
      routes: {},
      url: '/manifest.js',
      version: 'test',
    },
    routeModules: {},
    staticHandlerContext: {
      basename: '/',
      location: { pathname: '/studio-lab', search: '', hash: '', state: null, key: 'default' },
      matches: [],
      loaderData: {},
      actionData: null,
      errors: null,
      statusCode: 200,
      loaderHeaders: {},
      actionHeaders: {},
      activeDeferreds: null,
    },
    future: {
      v3_fetcherPersist: false,
      v3_relativeSplatPath: false,
      v3_throwAbortReason: false,
      v3_lazyRouteDiscovery: false,
      v3_singleFetch: false,
    },
    isSpaMode: false,
    serializeError: (error: Error) => ({ message: error.message }),
  };
}

describe('stripNulBytes', () => {
  it('SN1: returns a chunk without NUL byte-identical', () => {
    const chunk = Buffer.from('<button aria-label="წაშლა">ა</button>', 'utf8');

    const result = stripNulBytes(chunk);

    expect(result.equals(chunk)).toBe(true);
  });

  it('SN2a: removes NUL at the start, middle, end, in a run and in an all-NUL chunk_REGRESSION', () => {
    expect([...stripNulBytes(Buffer.from([0, 0x61, 0x62]))]).toEqual([0x61, 0x62]);
    expect([...stripNulBytes(Buffer.from([0x61, 0, 0x62]))]).toEqual([0x61, 0x62]);
    expect([...stripNulBytes(Buffer.from([0x61, 0x62, 0]))]).toEqual([0x61, 0x62]);
    expect([...stripNulBytes(Buffer.from([0x61, 0, 0, 0x62]))]).toEqual([0x61, 0x62]);
    expect([...stripNulBytes(Buffer.from([0, 0x61, 0, 0, 0x62, 0]))]).toEqual([0x61, 0x62]);
    expect(stripNulBytes(Buffer.from([0, 0, 0])).length).toBe(0);
  });
});

describe('createNulByteStripStream', () => {
  it('SN2b: strips NUL bytes from every written chunk_REGRESSION', async () => {
    const output = await writeChunksThroughStripper([
      Buffer.from([0x61, 0, 0, 0x62]),
      Buffer.from([0, 0, 0]),
      Buffer.from([0x63, 0]),
    ]);

    expect([...output]).toEqual([0x61, 0x62, 0x63]);
  });

  it('SN3: keeps a Georgian character intact when NULs are written between its bytes_REGRESSION', async () => {
    const word = Buffer.from('წაშლა', 'utf8');
    const output = await writeChunksThroughStripper([
      word.subarray(0, 1),
      Buffer.from([0, 0]),
      word.subarray(1, 4),
      word.subarray(4, 8),
      Buffer.from([0, 0]),
      word.subarray(8, 15),
    ]);

    expect(output.toString('utf8')).toBe('წაშლა');
    expect(output.equals(word)).toBe(true);
  });

  it('SN4: strips NUL from a string chunk after Writable string decoding_REGRESSION', async () => {
    const output = await writeChunksThroughStripper(['a\u0000b']);

    expect(output.toString('utf8')).toBe('ab');
  });

  it('SN5: react-dom 18.3.1 defect control — the unfiltered stream still carries NUL bytes (remove createNulByteStripStream when this fails)', async () => {
    expect(typeof renderToPipeableStream).toBe('function');

    const output = await renderFixtureInto(new PassThrough());

    expect(countNulBytes(output)).toBeGreaterThan(0);
  });

  it('SN6: the filtered React stream has no NUL and equals renderToString_REGRESSION', async () => {
    const output = await renderFixtureInto(createNulByteStripStream());

    expect(countNulBytes(output)).toBe(0);
    expect(output.toString('utf8')).toBe(renderToString(buildDeleteButtonsFixture()));
  });
});

describe('entry.server handleRequest', () => {
  it('SN7: the SSR response body has no NUL and equals renderToString_REGRESSION', async () => {
    const request = new Request('http://localhost/studio-lab', {
      headers: { 'user-agent': GOOGLEBOT_USER_AGENT },
    });

    const response = await handleRequest(request, 200, new Headers(), createEntryContextFixture());

    expect(response).toBeInstanceOf(Response);
    if (!(response instanceof Response)) {
      return;
    }
    const body = Buffer.from(await response.arrayBuffer());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(countNulBytes(body)).toBe(0);
    expect(body.toString('utf8')).toBe(renderToString(buildDeleteButtonsFixture()));
  });
});
