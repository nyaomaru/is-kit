import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
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

  writeConsumerFile(
    'types-smoke.ts',
    `import { arrayOf, isString, safeParse } from 'is-kit';
import type { ParseResult, Predicate } from 'is-kit';

const isStringArray: Predicate<readonly string[]> = arrayOf(isString);
const result: ParseResult<string> = safeParse(isString, 'value');

void isStringArray;
void result;
`
  );

  writeConsumerFile(
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          strict: true,
          target: 'ES2022'
        },
        files: ['types-smoke.ts']
      },
      null,
      2
    )}\n`
  );

  run(process.execPath, ['esm-smoke.mjs']);
  run(process.execPath, ['cjs-smoke.cjs']);
  run(process.execPath, [
    resolve(repositoryRoot, 'node_modules/typescript/bin/tsc'),
    '--project',
    'tsconfig.json',
    '--pretty',
    'false'
  ]);

  console.log('Package smoke test passed for ESM, CJS, and TypeScript.');
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
