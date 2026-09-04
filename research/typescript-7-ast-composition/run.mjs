import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
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

const researchDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(researchDirectory, '../..');
const fixturesDirectory = join(researchDirectory, 'fixtures');
const keepTemporaryFiles = process.argv.includes('--keep');
const temporaryRoot = mkdtempSync(
  join(tmpdir(), 'is-kit-ts7-composition-research-')
);
const packageDirectory = join(temporaryRoot, 'package');
const npmCacheDirectory = join(temporaryRoot, 'npm-cache');
const npmEnvironment = {
  ...process.env,
  npm_config_cache: npmCacheDirectory,
  npm_config_update_notifier: 'false'
};

const versions = [
  { label: 'ts6', version: '6.0.3', fixture: 'ts6' },
  { label: 'ts7-stable', version: '7.0.2', fixture: 'ts7' },
  {
    label: 'ts7-next',
    version: '7.1.0-dev.20260902.1',
    fixture: 'ts7'
  }
];

const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    env: npmEnvironment,
    stdio: 'inherit'
  });

try {
  mkdirSync(packageDirectory, { recursive: true });
  run('npm', ['pack', '--pack-destination', packageDirectory], repositoryRoot);

  const packageFilename = readdirSync(packageDirectory).find((name) =>
    name.endsWith('.tgz')
  );
  if (!packageFilename) throw new Error('npm pack did not create a tarball');

  for (const { label, version, fixture } of versions) {
    const consumerDirectory = join(temporaryRoot, label);
    mkdirSync(consumerDirectory, { recursive: true });
    cpSync(join(fixturesDirectory, fixture), consumerDirectory, {
      recursive: true
    });
    copyFileSync(
      join(fixturesDirectory, 'common', 'generic-controls.ts'),
      join(consumerDirectory, 'generic-controls.ts')
    );
    copyFileSync(
      join(fixturesDirectory, 'tsconfig.json'),
      join(consumerDirectory, 'tsconfig.json')
    );
    writeFileSync(
      join(consumerDirectory, 'package.json'),
      `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`
    );

    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        `typescript@${version}`,
        join(packageDirectory, packageFilename)
      ],
      consumerDirectory
    );

    const installedVersion = JSON.parse(
      readFileSync(
        join(consumerDirectory, 'node_modules/typescript/package.json'),
        'utf8'
      )
    ).version;
    if (installedVersion !== version) {
      throw new Error(
        `Expected TypeScript ${version}, got ${installedVersion}`
      );
    }

    run(
      process.execPath,
      [
        join(consumerDirectory, 'node_modules/typescript/bin/tsc'),
        '--project',
        'tsconfig.json',
        '--pretty',
        'false'
      ],
      consumerDirectory
    );

    const optionModes = [
      {
        label: 'relaxed optional properties',
        args: ['--exactOptionalPropertyTypes', 'false']
      },
      {
        label: 'checked indexed access disabled',
        args: ['--noUncheckedIndexedAccess', 'false']
      },
      {
        label: 'both strictness options disabled',
        args: [
          '--exactOptionalPropertyTypes',
          'false',
          '--noUncheckedIndexedAccess',
          'false'
        ]
      }
    ];

    for (const { label: modeLabel, args } of optionModes) {
      run(
        process.execPath,
        [
          join(consumerDirectory, 'node_modules/typescript/bin/tsc'),
          '--project',
          'tsconfig.json',
          '--pretty',
          'false',
          '--outDir',
          `declarations-${modeLabel.replaceAll(' ', '-')}`,
          ...args
        ],
        consumerDirectory
      );
      console.log(`${label}: ${modeLabel} passed`);
    }

    console.log(`\n===== ${label}: TypeScript ${installedVersion} =====`);
    for (const declaration of readdirSync(
      join(consumerDirectory, 'declarations')
    ).sort()) {
      console.log(`\n--- ${declaration} ---`);
      console.log(
        readFileSync(
          join(consumerDirectory, 'declarations', declaration),
          'utf8'
        )
      );
    }
  }

  console.log(`\nTemporary research directory: ${temporaryRoot}`);
} finally {
  if (!keepTemporaryFiles) {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
