import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  classifyLicenseExpression,
  classifyLicenseField,
  classifyRuntimeLockPackage,
  findCopyleftRuntimePackages,
  findThirdPartySourceLink,
  isMplLicensedRuntimePackage,
  type LicenseClassification,
  listRuntimeLockPackages,
  renderThirdPartyNotices,
  THIRD_PARTY_LICENSE_EXCEPTIONS,
  type ThirdPartyLicenseException,
} from '../third-party-licenses';

const STORE_ROOT = resolve(__dirname, '../../..');
const NOTICES_PATH = join(STORE_ROOT, 'THIRD_PARTY_NOTICES.md');
const APP_ROOT = join(STORE_ROOT, 'app');
const RUNTIME_DOWNLOAD_REFERENCE = /unpkg|@ffmpeg\//;

function listAppRuntimeSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : listAppRuntimeSourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function scanRuntimeDownloadReferences(files: string[]): string[] {
  return files
    .filter((file) => RUNTIME_DOWNLOAD_REFERENCE.test(readFileSync(file, 'utf-8')))
    .map((file) => relative(STORE_ROOT, file));
}

function readJsonFile(path: string): unknown {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf-8'));
  return parsed;
}

const realLock = readJsonFile(join(STORE_ROOT, 'package-lock.json'));
const realPackageJson = readJsonFile(join(STORE_ROOT, 'package.json'));

function fixtureLock(packages: Record<string, Record<string, unknown>>): unknown {
  return {
    name: 'fixture',
    lockfileVersion: 3,
    packages: { '': { name: 'fixture' }, ...packages },
  };
}

function listDependencyNames(packageJson: unknown): string[] {
  if (typeof packageJson !== 'object' || packageJson === null) {
    return [];
  }
  const dependencies: unknown = Reflect.get(packageJson, 'dependencies');
  if (typeof dependencies !== 'object' || dependencies === null) {
    return [];
  }
  return Object.keys(dependencies);
}

function readLockVersion(lock: unknown, lockPath: string): string | null {
  if (typeof lock !== 'object' || lock === null) {
    return null;
  }
  const packages: unknown = Reflect.get(lock, 'packages');
  if (typeof packages !== 'object' || packages === null) {
    return null;
  }
  const entry: unknown = Reflect.get(packages, lockPath);
  if (typeof entry !== 'object' || entry === null) {
    return null;
  }
  const version: unknown = Reflect.get(entry, 'version');
  return typeof version === 'string' ? version : null;
}

function countDevLockEntries(lock: unknown): number {
  if (typeof lock !== 'object' || lock === null) {
    return 0;
  }
  const packages: unknown = Reflect.get(lock, 'packages');
  if (typeof packages !== 'object' || packages === null) {
    return 0;
  }
  const entries: unknown[] = Object.values(packages);
  return entries.filter(
    (entry) => typeof entry === 'object' && entry !== null && Reflect.get(entry, 'dev') === true,
  ).length;
}

function listDevOnlyPackageKeys(lock: unknown): string[] {
  if (typeof lock !== 'object' || lock === null) {
    return [];
  }
  const packages: unknown = Reflect.get(lock, 'packages');
  if (typeof packages !== 'object' || packages === null) {
    return [];
  }
  const devNames = new Set<string>();
  const runtimeNames = new Set<string>();
  const entries: [string, unknown][] = Object.entries(packages);
  for (const [lockPath, entry] of entries) {
    if (lockPath === '' || typeof entry !== 'object' || entry === null) {
      continue;
    }
    const name = lockPath.slice(lockPath.lastIndexOf('node_modules/') + 'node_modules/'.length);
    if (Reflect.get(entry, 'dev') === true) {
      devNames.add(name);
    } else {
      runtimeNames.add(name);
    }
  }
  return [...devNames].filter((name) => !runtimeNames.has(name));
}

const FFMPEG_SCOPE = '@ffmpeg/';

function readObjectKeys(source: unknown, field: string): string[] {
  if (typeof source !== 'object' || source === null) {
    return [];
  }
  const value: unknown = Reflect.get(source, field);
  return typeof value === 'object' && value !== null ? Object.keys(value) : [];
}

function listFfmpegPackageJsonKeys(packageJson: unknown): string[] {
  return [
    ...readObjectKeys(packageJson, 'dependencies'),
    ...readObjectKeys(packageJson, 'devDependencies'),
  ].filter((name) => name.startsWith(FFMPEG_SCOPE));
}

function listFfmpegLockKeys(lock: unknown): string[] {
  return readObjectKeys(lock, 'packages').filter((lockPath) =>
    lockPath.includes(`node_modules/${FFMPEG_SCOPE}`),
  );
}

function listFfmpegLockRootDependencies(lock: unknown): string[] {
  if (typeof lock !== 'object' || lock === null) {
    return [];
  }
  const packages: unknown = Reflect.get(lock, 'packages');
  const rootEntry: unknown =
    typeof packages === 'object' && packages !== null ? Reflect.get(packages, '') : undefined;
  return ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
    .flatMap((field) => readObjectKeys(rootEntry, field))
    .filter((name) => name.startsWith(FFMPEG_SCOPE));
}

function extractSection(notices: string, heading: string): string {
  const start = notices.indexOf(`## ${heading}`);
  if (start === -1) {
    return '';
  }
  const next = notices.indexOf('\n## ', start + 3);
  return next === -1 ? notices.slice(start) : notices.slice(start, next);
}

describe('TL1 classifyLicenseExpression (table-driven)', () => {
  const cases: [string, LicenseClassification][] = [
    ['MIT', 'clean'],
    ['Apache-2.0', 'clean'],
    ['MPL-2.0', 'clean'],
    ['LGPL-3.0-only', 'clean'],
    ['LGPL-2.1-or-later', 'clean'],
    ['LGPL', 'clean'],
    ['(BSD-3-Clause OR GPL-2.0)', 'clean'],
    ['(MIT OR (GPL-2.0 AND AGPL-3.0))', 'clean'],
    ['(MIT AND Zlib)', 'clean'],
    ['GPL-3.0', 'copyleft'],
    ['GPL-2.0+', 'copyleft'],
    ['GPL-2.0-or-later', 'copyleft'],
    ['gpl-3.0-only', 'copyleft'],
    ['GPL', 'copyleft'],
    ['AGPL-3.0-only', 'copyleft'],
    ['AGPL-1.0', 'copyleft'],
    ['(MIT AND GPL-3.0)', 'copyleft'],
    ['GPL-2.0 WITH Classpath-exception-2.0', 'copyleft'],
    ['(LGPL-3.0 AND AGPL-3.0)', 'copyleft'],
    ['', 'unknown'],
    ['UNLICENSED', 'unknown'],
    ['SEE LICENSE IN LICENSE.md', 'unknown'],
    ['(MIT', 'unknown'],
    ['MIT OR', 'unknown'],
    ['AND MIT', 'unknown'],
    ['GPL-2.0 WITH', 'unknown'],
    ['()', 'unknown'],
    ['((MIT))', 'clean'],
    ['GPL-2.0-with-classpath-exception', 'copyleft'],
    ['AGPL-3.0', 'copyleft'],
    ['mit or gpl-3.0', 'clean'],
    ['GPLv3', 'copyleft'],
    ['GPLv2+', 'copyleft'],
    ['GPL2', 'copyleft'],
    ['AGPLv3', 'copyleft'],
    ['MIT AND GPLv2', 'copyleft'],
    ['(MIT OR GPLv3)', 'clean'],
    ['LGPLv3', 'clean'],
    ['LGPL-2.1-only', 'clean'],
    ['LicenseRef-Proprietary', 'unknown'],
    ['Proprietary', 'clean'],
  ];

  it.each(cases)('TL1 classifies %j as %s', (expression, expected) => {
    expect(classifyLicenseExpression(expression)).toBe(expected);
  });

  it('TL1 legacy { type } objects: GPL-3.0 is copyleft, MIT is clean, a non-string is unknown', () => {
    expect(classifyLicenseField({ type: 'GPL-3.0' })).toBe('copyleft');
    expect(classifyLicenseField({ type: 'MIT' })).toBe('clean');
    expect(classifyLicenseField({ type: 3 })).toBe('unknown');
    expect(classifyLicenseField(undefined)).toBe('unknown');
    expect(classifyLicenseField(42)).toBe('unknown');
  });
});

describe('TL2 listRuntimeLockPackages on an in-memory fixture lock', () => {
  const lock = fixtureLock({
    'node_modules/dev-gpl': { version: '1.0.0', license: 'GPL-3.0', dev: true },
    'node_modules/dev-optional-gpl': { version: '1.0.0', license: 'GPL-3.0', devOptional: true },
    'node_modules/optional-gpl': { version: '1.0.0', license: 'GPL-3.0', optional: true },
    'node_modules/peer-gpl': { version: '1.0.0', license: 'GPL-3.0', peer: true },
    'node_modules/string-width-cjs': { name: 'string-width', version: '4.2.3', license: 'GPL-3.0' },
    'node_modules/@a/b/node_modules/@c/d': { version: '2.0.0', license: 'GPL-2.0' },
    'node_modules/linked': { resolved: '../linked', link: true },
    'node_modules/bundled': { version: '1.0.0', license: 'MIT', inBundle: true },
    'node_modules/dup': { version: '1.0.0', license: 'MIT' },
    'node_modules/x/node_modules/dup': { version: '1.0.0', license: 'MIT' },
    'node_modules/dup-other': { name: 'dup', version: '2.0.0', license: 'MIT' },
    'node_modules/twin': { version: '1.0.0', license: 'MIT' },
    'node_modules/y/node_modules/twin': { version: '1.0.0', license: 'MIT', inBundle: true },
  });

  it('TL2 skips the root entry and every dev: true entry, and keeps devOptional/optional/peer', () => {
    const names = listRuntimeLockPackages(lock).map((item) => item.name);
    expect(names).not.toContain('fixture');
    expect(names).not.toContain('dev-gpl');
    const failures = findCopyleftRuntimePackages(lock, []).failures.map((item) => item.name);
    expect(failures).not.toContain('dev-gpl');
    expect(failures).toEqual(
      expect.arrayContaining(['dev-optional-gpl', 'optional-gpl', 'peer-gpl']),
    );
  });

  it('TL2 an aliased entry is reported under its name field, a nested scoped path gets @c/d', () => {
    const failures = findCopyleftRuntimePackages(lock, []).failures;
    expect(failures).toContainEqual(
      expect.objectContaining({
        name: 'string-width',
        version: '4.2.3',
        lockPath: 'node_modules/string-width-cjs',
        classification: 'copyleft',
      }),
    );
    expect(failures).toContainEqual(
      expect.objectContaining({ name: '@c/d', version: '2.0.0', classification: 'copyleft' }),
    );
  });

  it('TL2 link: true and inBundle: true entries are unknown and reported', () => {
    const failures = findCopyleftRuntimePackages(lock, []).failures;
    expect(failures).toContainEqual(
      expect.objectContaining({ name: 'linked', classification: 'unknown' }),
    );
    expect(failures).toContainEqual(
      expect.objectContaining({ name: 'bundled', classification: 'unknown' }),
    );
  });

  it('TL2 a licensed duplicate does not hide an inBundle copy of the same name@version', () => {
    expect(listRuntimeLockPackages(lock).filter((item) => item.name === 'twin')).toHaveLength(1);
    expect(findCopyleftRuntimePackages(lock, []).failures).toContainEqual(
      expect.objectContaining({
        name: 'twin',
        lockPath: 'node_modules/y/node_modules/twin',
        classification: 'unknown',
      }),
    );
  });

  it('TL2 duplicate name@version entries give one row; another version gives its own row', () => {
    const dupRows = listRuntimeLockPackages(lock).filter((item) => item.name === 'dup');
    expect(dupRows.map((item) => item.version)).toEqual(['1.0.0', '2.0.0']);
    const notices = renderThirdPartyNotices(lock, []);
    expect(notices.match(/^\| dup \| 1\.0\.0 \|/gm)?.length).toBe(1);
    expect(notices.match(/^\| dup \| 2\.0\.0 \|/gm)?.length).toBe(1);
  });
});

describe('TL3 exceptions on fixtures', () => {
  const exception: ThirdPartyLicenseException = {
    name: 'nolicense',
    version: '1.0.0',
    assertedLicense: 'MIT',
    reason: 'fixture',
  };

  it('TL3 an entry with no licence and a matching exception is not reported', () => {
    const lock = fixtureLock({ 'node_modules/nolicense': { version: '1.0.0' } });
    expect(findCopyleftRuntimePackages(lock, [])).toEqual({
      failures: [
        {
          name: 'nolicense',
          version: '1.0.0',
          license: null,
          lockPath: 'node_modules/nolicense',
          classification: 'unknown',
        },
      ],
      staleExceptions: [],
    });
    expect(findCopyleftRuntimePackages(lock, [exception])).toEqual({
      failures: [],
      staleExceptions: [],
    });
  });

  it('TL3 the same entry at another version is reported and the exception is stale', () => {
    const lock = fixtureLock({ 'node_modules/nolicense': { version: '1.0.1' } });
    const report = findCopyleftRuntimePackages(lock, [exception]);
    expect(report.failures).toEqual([
      expect.objectContaining({ name: 'nolicense', version: '1.0.1', classification: 'unknown' }),
    ]);
    expect(report.staleExceptions).toEqual([
      { name: 'nolicense', version: '1.0.0', reason: 'no-runtime-entry' },
    ]);
  });

  it('TL3 an exception whose entry gained a license field is stale', () => {
    const lock = fixtureLock({ 'node_modules/nolicense': { version: '1.0.0', license: 'MIT' } });
    expect(findCopyleftRuntimePackages(lock, [exception])).toEqual({
      failures: [],
      staleExceptions: [{ name: 'nolicense', version: '1.0.0', reason: 'entry-has-license' }],
    });
  });

  it('TL3 an exception never hides a GPL licence: the entry fails and the exception is stale', () => {
    const lock = fixtureLock({
      'node_modules/nolicense': { version: '1.0.0', license: 'GPL-3.0' },
    });
    expect(findCopyleftRuntimePackages(lock, [exception])).toEqual({
      failures: [expect.objectContaining({ name: 'nolicense', classification: 'copyleft' })],
      staleExceptions: [{ name: 'nolicense', version: '1.0.0', reason: 'entry-has-license' }],
    });
  });

  it('TL3 an exception with no matching entry is stale', () => {
    const lock = fixtureLock({ 'node_modules/other': { version: '1.0.0', license: 'MIT' } });
    expect(findCopyleftRuntimePackages(lock, [exception]).staleExceptions).toEqual([
      { name: 'nolicense', version: '1.0.0', reason: 'no-runtime-entry' },
    ]);
  });
});

describe('TL4 the real package-lock.json', () => {
  const runtimePackages = listRuntimeLockPackages(realLock);
  const findRuntime = (name: string, version: string) =>
    runtimePackages.find((item) => item.name === name && item.version === version);

  it('TL4 has no copyleft or unknown runtime package and no stale exception', () => {
    expect(findCopyleftRuntimePackages(realLock, THIRD_PARTY_LICENSE_EXCEPTIONS)).toEqual({
      failures: [],
      staleExceptions: [],
    });
  });

  it('TL4 anchors: mediabunny, node-forge, limiter and the dev filter are real', () => {
    expect(findRuntime('mediabunny', '1.62.1')?.license).toBe('MPL-2.0');
    expect(findRuntime('@mediabunny/mp3-encoder', '1.62.1')?.license).toBe('MPL-2.0');
    const nodeForge = findRuntime('node-forge', '1.3.3');
    expect(nodeForge?.license).toBe('(BSD-3-Clause OR GPL-2.0)');
    expect(nodeForge === undefined ? null : classifyRuntimeLockPackage(nodeForge)).toBe('clean');
    const limiter = findRuntime('limiter', '1.1.5');
    expect(limiter).toBeDefined();
    expect(limiter?.license).toBeNull();
    expect(THIRD_PARTY_LICENSE_EXCEPTIONS).toEqual([
      expect.objectContaining({ name: 'limiter', version: '1.1.5', assertedLicense: 'MIT' }),
    ]);
    expect(findCopyleftRuntimePackages(realLock, []).failures).toEqual([
      expect.objectContaining({ name: 'limiter', version: '1.1.5', classification: 'unknown' }),
    ]);
    expect(countDevLockEntries(realLock)).toBeGreaterThan(0);
    const devOnlyKeys = listDevOnlyPackageKeys(realLock);
    expect(devOnlyKeys).toContain('vitest');
    const runtimeNames = new Set(runtimePackages.map((item) => item.name));
    expect(devOnlyKeys.filter((name) => runtimeNames.has(name))).toEqual([]);
  });
});

describe('TL5 THIRD_PARTY_NOTICES.md is in sync with package-lock.json', () => {
  it('TL5 renderThirdPartyNotices(real lock) matches the committed file', async () => {
    expect(existsSync(NOTICES_PATH)).toBe(true);
    await expect(renderThirdPartyNotices(realLock)).toMatchFileSnapshot(NOTICES_PATH);
  });
});

describe('TL6 notices content on the real lock', () => {
  const notices = renderThirdPartyNotices(realLock);

  it('TL6 every package.json dependency has a table row with its lock version', () => {
    const dependencyNames = listDependencyNames(realPackageJson);
    expect(dependencyNames.length).toBeGreaterThan(0);
    for (const name of dependencyNames) {
      const version = readLockVersion(realLock, `node_modules/${name}`);
      expect(version, name).not.toBeNull();
      expect(notices, name).toContain(`| ${name} | ${version} |`);
    }
  });

  it('TL6 every MPL-2.0 runtime package has a source link', () => {
    const mplPackages = listRuntimeLockPackages(realLock).filter(isMplLicensedRuntimePackage);
    expect(mplPackages.map((item) => item.name)).toEqual(
      expect.arrayContaining(['mediabunny', '@mediabunny/mp3-encoder', 'lightningcss']),
    );
    const mplSection = extractSection(notices, 'MPL-2.0 sources');
    for (const item of mplPackages) {
      const link = findThirdPartySourceLink(item.name);
      expect(link, item.name).not.toBeNull();
      expect(mplSection, item.name).toContain(`- \`${item.name}\`: ${link}`);
    }
    expect(mplSection).not.toContain('(no source link recorded)');
  });

  it('TL6 the LAME section has the four links, www.mp3dev.org as text only, LGPL, inlined, bundled', () => {
    const lameSection = extractSection(notices, 'LAME MP3 Encoder');
    for (const link of [
      'https://lame.sourceforge.io/',
      'https://lame.sourceforge.io/license.txt',
      'https://sourceforge.net/projects/lame/files/lame/',
      'https://github.com/Vanilagy/mediabunny/tree/main/packages/mp3-encoder',
    ]) {
      expect(lameSection).toContain(link);
    }
    expect(lameSection).toContain('`www.mp3dev.org`');
    expect(notices).not.toMatch(/https?:\/\/(www\.)?mp3dev\.org/);
    expect(notices).not.toMatch(/\]\([^)]*mp3dev/);
    for (const word of ['LGPL', 'inlined', 'bundled', 'This product uses LAME']) {
      expect(lameSection).toContain(word);
    }
  });

  it('TL6 there is no run-time downloads section', () => {
    expect(notices).not.toContain('Run-time downloads');
    expect(notices).not.toContain('unpkg');
    expect(notices).not.toContain('@ffmpeg/core');
  });

  it('TL6 the output has no \\r and ends with exactly one \\n', () => {
    expect(notices).not.toContain('\r');
    expect(notices.endsWith('\n')).toBe(true);
    expect(notices.endsWith('\n\n')).toBe(false);
  });
});

describe('TL7 renderer determinism', () => {
  const packages: Record<string, Record<string, unknown>> = {
    'node_modules/abc': { version: '1.0.0', license: 'MIT' },
    'node_modules/Zed': { version: '2.0.0', license: 'ISC' },
    'node_modules/mid': { version: '1.10.0', license: 'MIT' },
    'node_modules/x/node_modules/mid': { version: '1.9.0', license: 'MIT' },
  };

  it('TL7 shuffled packages keys give byte-identical output, ordered by code point', () => {
    const forward = renderThirdPartyNotices(fixtureLock(packages), []);
    const reversed = renderThirdPartyNotices(
      fixtureLock(Object.fromEntries(Object.entries(packages).reverse())),
      [],
    );
    expect(reversed).toBe(forward);
    const rowNames = [...forward.matchAll(/^\| (\S+) \| (\S+) \|/gm)]
      .map((match) => `${match[1]}@${match[2]}`)
      .filter((row) => row !== 'Package@Version');
    expect(rowNames).toEqual(['Zed@2.0.0', 'abc@1.0.0', 'mid@1.10.0', 'mid@1.9.0']);
  });
});

describe('TL8 no app runtime code downloads a package at run time', () => {
  it('TL8 no non-test .ts/.tsx file under app/ mentions unpkg or @ffmpeg/ (unpkg.com, from or import())', () => {
    const files = listAppRuntimeSourceFiles(APP_ROOT);
    expect(files).toContain(join(APP_ROOT, 'utils/ffmpeg.ts'));
    expect(scanRuntimeDownloadReferences(files)).toEqual([]);
  });

  it('TL8 named mutant: a scratch file with the old unpkg core URL or an @ffmpeg import is flagged', () => {
    const scratchDirectory = mkdtempSync(join(tmpdir(), 'tl8-'));
    try {
      const urlMutant = join(scratchDirectory, 'legacy-url.ts');
      const staticMutant = join(scratchDirectory, 'legacy-static.ts');
      const dynamicMutant = join(scratchDirectory, 'legacy-dynamic.ts');
      const cleanFile = join(scratchDirectory, 'clean.ts');
      writeFileSync(
        urlMutant,
        "const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';\n",
      );
      writeFileSync(staticMutant, "import { FFmpeg } from '@ffmpeg/ffmpeg';\n");
      writeFileSync(dynamicMutant, "const loaded = import('@ffmpeg/util');\n");
      writeFileSync(cleanFile, "export const label = 'MP3 export';\n");
      expect(
        scanRuntimeDownloadReferences([urlMutant, staticMutant, dynamicMutant, cleanFile]),
      ).toHaveLength(3);
      expect(scanRuntimeDownloadReferences([cleanFile])).toEqual([]);
    } finally {
      rmSync(scratchDirectory, { recursive: true, force: true });
    }
  });
});

describe('TL9 the @ffmpeg/* packages stay removed', () => {
  it('TL9a package.json dependencies and devDependencies have no @ffmpeg/ key', () => {
    expect(readObjectKeys(realPackageJson, 'dependencies').length).toBeGreaterThan(0);
    expect(listFfmpegPackageJsonKeys(realPackageJson)).toEqual([]);
  });

  it('TL9b package-lock.json has no node_modules/@ffmpeg/ entry and no @ffmpeg/ root dependency', () => {
    expect(readObjectKeys(realLock, 'packages')).toContain('');
    expect(listFfmpegLockKeys(realLock)).toEqual([]);
    expect(listFfmpegLockRootDependencies(realLock)).toEqual([]);
  });

  it('TL9c the rendered notices contain no @ffmpeg/ row', () => {
    const notices = renderThirdPartyNotices(realLock);
    expect(notices).toMatch(/^\| mediabunny \| /m);
    expect(notices).not.toMatch(/^\| @ffmpeg\//m);
    expect(notices).not.toContain(FFMPEG_SCOPE);
  });

  it('TL9d named mutant: the c4e6c9d lock shape flags exactly the 3 @ffmpeg/* keys', () => {
    const c4e6c9dLockShape = {
      name: 'fixture',
      lockfileVersion: 3,
      packages: {
        '': {
          name: 'fixture',
          dependencies: { '@ffmpeg/ffmpeg': '^0.12.15', '@ffmpeg/util': '^0.12.2' },
        },
        'node_modules/@ffmpeg/ffmpeg': { version: '0.12.15', license: 'MIT' },
        'node_modules/@ffmpeg/types': { version: '0.12.4', license: 'MIT' },
        'node_modules/@ffmpeg/util': { version: '0.12.2', license: 'MIT' },
        'node_modules/mediabunny': { version: '1.62.1', license: 'MPL-2.0' },
      },
    };
    expect(listFfmpegLockKeys(c4e6c9dLockShape)).toEqual([
      'node_modules/@ffmpeg/ffmpeg',
      'node_modules/@ffmpeg/types',
      'node_modules/@ffmpeg/util',
    ]);
    expect(listFfmpegLockRootDependencies(c4e6c9dLockShape)).toEqual([
      '@ffmpeg/ffmpeg',
      '@ffmpeg/util',
    ]);
    expect(
      listFfmpegPackageJsonKeys({
        dependencies: { '@ffmpeg/ffmpeg': '^0.12.15', mediabunny: '1.62.1' },
        devDependencies: { '@ffmpeg/util': '^0.12.2' },
      }),
    ).toEqual(['@ffmpeg/ffmpeg', '@ffmpeg/util']);
  });
});

describe('TL10 the fonts section on the real lock', () => {
  const notices = renderThirdPartyNotices(realLock);
  const fontsHeading = '## Fonts (SIL Open Font License 1.1)';
  const fontFamilyLicenses: [string, string][] = [
    ['IBM Plex Mono', 'app/assets/fonts/licenses/OFL-ibm-plex-mono.txt'],
    ['Instrument Sans', 'app/assets/fonts/licenses/OFL-instrument-sans.txt'],
    ['Inter', 'app/assets/fonts/licenses/OFL-inter.txt'],
    ['Noto Sans Georgian', 'app/assets/fonts/licenses/OFL-noto-sans-georgian.txt'],
    ['Playfair Display', 'app/assets/fonts/licenses/OFL-playfair-display.txt'],
  ];

  it('TL10 the section exists exactly once and comes after the LAME section', () => {
    expect(notices.split(fontsHeading).length - 1).toBe(1);
    const lameIndex = notices.indexOf('## LAME MP3 Encoder');
    expect(lameIndex).toBeGreaterThan(-1);
    expect(notices.indexOf(fontsHeading)).toBeGreaterThan(lameIndex);
  });

  it('TL10 it names each family with its licence path, and each licence file exists', () => {
    const fontsSection = extractSection(notices, 'Fonts (SIL Open Font License 1.1)');
    for (const [family, licensePath] of fontFamilyLicenses) {
      expect(fontsSection, family).toContain(`- ${family}: \`${licensePath}\``);
      expect(existsSync(join(STORE_ROOT, licensePath)), licensePath).toBe(true);
    }
  });

  it('TL10 it says unmodified, Google Fonts, sha256 and both Reserved Font Names', () => {
    const fontsSection = extractSection(notices, 'Fonts (SIL Open Font License 1.1)');
    for (const word of ['unmodified', 'Google Fonts', 'sha256', '"Playfair Display"', '"Plex"']) {
      expect(fontsSection, word).toContain(word);
    }
    expect(fontsSection).not.toMatch(/fonts\.(googleapis|gstatic)\.com|@fontsource/);
    for (const line of fontsSection.split('\n')) {
      expect(line.length, line).toBeLessThanOrEqual(100);
    }
  });
});
