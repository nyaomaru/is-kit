import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const VLT_VERSION_SPEC = '1';
const NPM_REGISTRY = 'https://registry.npmjs.org/';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoot = mkdtempSync(join(tmpdir(), 'is-kit-vlt-smoke-'));
const packageDirectory = join(temporaryRoot, 'package');
const consumerDirectory = join(temporaryRoot, 'consumer');
const npmCacheDirectory = join(temporaryRoot, 'npm-cache');
const npmEnvironment = {
  ...process.env,
  npm_config_cache: npmCacheDirectory,
  npm_config_ignore_scripts: 'true',
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
  // WHY: vlt 1.0.2 fails to unpack absolute local tarball paths but supports
  // the documented relative-path form.
  const tarballSpec = relative(consumerDirectory, tarballPath);

  writeConsumerFile(
    'package.json',
    `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`
  );

  run('npm', [
    'exec',
    '--yes',
    `--package=vlt@${VLT_VERSION_SPEC}`,
    '--',
    'vlt',
    `--registry=${NPM_REGISTRY}`,
    'install',
    tarballSpec
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

  run(process.execPath, ['esm-smoke.mjs']);
  run(process.execPath, ['cjs-smoke.cjs']);

  console.log(
    `Package smoke test passed for ESM and CJS using vlt ${VLT_VERSION_SPEC}.x.`
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
