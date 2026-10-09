import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoot = mkdtempSync(join(tmpdir(), 'is-kit-package-smoke-'));
const packageDirectory = join(temporaryRoot, 'package');
const consumerDirectory = join(temporaryRoot, 'consumer');
const npmCacheDirectory = join(temporaryRoot, 'npm-cache');
const npmEnvironment = {
  ...process.env,
  npm_config_cache: npmCacheDirectory,
  npm_config_update_notifier: 'false'
};

const run = (command, args, cwd = consumerDirectory) =>
  execFileSync(command, args, {
    cwd,
    env: npmEnvironment,
    stdio: 'inherit'
  });

const writeConsumerFile = (name, contents) =>
  writeFileSync(join(consumerDirectory, name), contents);

const typescriptCli = resolve(
  repositoryRoot,
  'node_modules/typescript/bin/tsc'
);

const nodeNextCompilerOptions = {
  module: 'NodeNext',
  moduleResolution: 'NodeNext',
  noEmit: true,
  strict: true,
  target: 'ES2022'
};

const writeTypeScriptProject = (fileName, projectName, source) => {
  writeConsumerFile(fileName, source);
  writeConsumerFile(
    projectName,
    `${JSON.stringify(
      {
        compilerOptions: nodeNextCompilerOptions,
        files: [fileName]
      },
      null,
      2
    )}\n`
  );
};

const compileTypeScript = (projectName) =>
  run(process.execPath, [
    typescriptCli,
    '--project',
    projectName,
    '--pretty',
    'false'
  ]);

try {
  mkdirSync(packageDirectory, { recursive: true });
  mkdirSync(consumerDirectory, { recursive: true });

  run('npm', ['pack', '--pack-destination', packageDirectory], repositoryRoot);
  const [filename] = readdirSync(packageDirectory).filter((name) =>
    name.endsWith('.tgz')
  );
  if (!filename) throw new Error('npm pack did not create a tarball');
  const tarballPath = join(packageDirectory, filename);

  writeConsumerFile(
    'package.json',
    `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`
  );

  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    tarballPath
  ]);

  const installedPackageDirectory = join(
    consumerDirectory,
    'node_modules',
    'is-kit'
  );
  const installedPackageJson = JSON.parse(
    readFileSync(join(installedPackageDirectory, 'package.json'), 'utf8')
  );
  const rootExport = installedPackageJson.exports['.'];

  assert.deepEqual(installedPackageJson.dependencies ?? {}, {});
  assert.equal(rootExport.types, './dist/index.d.ts');
  assert.equal(rootExport.import, './dist/index.mjs');
  assert.equal(rootExport.require, './dist/index.js');
  assert.match(
    readFileSync(join(installedPackageDirectory, 'dist', 'index.d.ts'), 'utf8'),
    /^\/\*\*\n \* is-kit guard authoring guide:/
  );

  writeConsumerFile(
    'esm-smoke.mjs',
    `import assert from 'node:assert/strict';
import { arrayOf, isString } from 'is-kit';

assert.equal(isString('value'), true);
assert.equal(arrayOf(isString)(['a', 'b']), true);
assert.equal(arrayOf(isString)(['a', 1]), false);
`
  );

  writeConsumerFile(
    'cjs-smoke.cjs',
    `const assert = require('node:assert/strict');
const { arrayOf, isString } = require('is-kit');

assert.equal(isString('value'), true);
assert.equal(arrayOf(isString)(['a', 'b']), true);
assert.equal(arrayOf(isString)(['a', 1]), false);
`
  );

  // WHY: A `.ts` file in this `"type": "module"` consumer is ESM only because
  // of the package context. `.mts` and `.cts` force NodeNext to resolve the
  // package `import` and `require` conditions separately, so one declaration
  // path is not assumed to cover both module formats.
  const valueAndTypeChecks = `
const isStringArray: Predicate<readonly string[]> = arrayOf(isString);
const result: ParseResult<string> = safeParse(isString, 'value');

void isStringArray;
void result;
`;

  const esmTypeSmoke = `import { arrayOf, isString, safeParse } from 'is-kit';
import type { ParseResult, Predicate } from 'is-kit';

${valueAndTypeChecks}
const moduleMeta: ImportMeta = import.meta;
void moduleMeta;
`;

  // WHY: import-equals-require is valid only in CommonJS and resolves through
  // the package require condition. It fails if NodeNext treats this file as
  // an ES module.
  const cjsTypeSmoke = `import { arrayOf, isString, safeParse } from 'is-kit';
import type { ParseResult, Predicate } from 'is-kit';
import isKit = require('is-kit');

${valueAndTypeChecks}
const requiredResult: isKit.ParseResult<string> = isKit.safeParse(
  isKit.isString,
  'value'
);
void requiredResult;
`;

  writeTypeScriptProject('types-esm.mts', 'tsconfig.esm.json', esmTypeSmoke);
  writeTypeScriptProject('types-cjs.cts', 'tsconfig.cjs.json', cjsTypeSmoke);

  run(process.execPath, ['esm-smoke.mjs']);
  run(process.execPath, ['cjs-smoke.cjs']);
  compileTypeScript('tsconfig.esm.json');
  compileTypeScript('tsconfig.cjs.json');

  console.log(
    'Package smoke test passed for ESM, CJS, and TypeScript ESM/CJS.'
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
