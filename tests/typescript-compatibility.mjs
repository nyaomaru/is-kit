import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const typescriptVersionSpec = process.argv[2];

if (
  !typescriptVersionSpec ||
  !/^\d+\.\d+(?:\.\d+)?$/.test(typescriptVersionSpec)
) {
  throw new Error(
    'Pass a TypeScript minor or exact version, for example: pnpm test:typescript-compat 5.7'
  );
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const typescriptMajor = Number.parseInt(
  typescriptVersionSpec.split('.')[0],
  10
);
// WHY: TypeScript 7.0 ships a native type checker without the legacy
// JavaScript Compiler API. Its official compatibility package keeps API-based
// tools on the TypeScript 6 surface while the TypeScript 7 checker runs.
const compilerApiPackage =
  typescriptMajor >= 7
    ? '@typescript/typescript6@6.0'
    : `typescript@${typescriptVersionSpec}`;
const fixtureDirectory = join(
  repositoryRoot,
  'tests',
  'typescript-compatibility'
);
const temporaryRoot = mkdtempSync(
  join(tmpdir(), `is-kit-typescript-${typescriptVersionSpec}-`)
);
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

try {
  mkdirSync(packageDirectory, { recursive: true });
  mkdirSync(consumerDirectory, { recursive: true });

  run('npm', ['pack', '--pack-destination', packageDirectory], repositoryRoot);
  const [filename] = readdirSync(packageDirectory).filter((name) =>
    name.endsWith('.tgz')
  );
  if (!filename) throw new Error('npm pack did not create a tarball');

  copyFileSync(
    join(fixtureDirectory, 'consumer.ts'),
    join(consumerDirectory, 'consumer.ts')
  );
  copyFileSync(
    join(fixtureDirectory, 'tsconfig.json'),
    join(consumerDirectory, 'tsconfig.json')
  );

  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    join(packageDirectory, filename),
    `typescript@${typescriptVersionSpec}`,
    `typescript-api@npm:${compilerApiPackage}`
  ]);

  const installedTypescriptVersion = JSON.parse(
    readFileSync(
      join(consumerDirectory, 'node_modules', 'typescript', 'package.json'),
      'utf8'
    )
  ).version;

  run(process.execPath, [
    join(consumerDirectory, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--project',
    'tsconfig.json',
    '--pretty',
    'false'
  ]);

  console.log(
    `Published declarations passed with TypeScript ${installedTypescriptVersion} (requested ${typescriptVersionSpec}).`
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
