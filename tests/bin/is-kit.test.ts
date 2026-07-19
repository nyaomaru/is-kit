import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const cliPath = resolve(process.cwd(), 'bin/is-kit.mjs');
const temporaryDirectories: string[] = [];

const createTemporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'is-kit-agent-test-'));
  temporaryDirectories.push(directory);
  return directory;
};

const runCli = (directory: string, ...args: string[]): void => {
  execFileSync(process.execPath, [cliPath, ...args], {
    cwd: directory,
    stdio: 'pipe'
  });
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('is-kit init-agent', () => {
  it('creates and idempotently updates the managed AGENTS.md section', () => {
    const directory = createTemporaryDirectory();
    const targetPath = join(directory, 'AGENTS.md');

    runCli(directory, 'init-agent');
    const generatedRules = readFileSync(targetPath, 'utf8');
    writeFileSync(
      targetPath,
      `# Project rules\n\n${generatedRules}\nKeep this footer.\n`
    );

    runCli(directory, 'init-agent');
    const updatedRules = readFileSync(targetPath, 'utf8');

    expect(updatedRules).toContain('# Project rules');
    expect(updatedRules).toContain('Keep this footer.');
    expect(updatedRules.match(/is-kit-agent-rules:start/g)).toHaveLength(1);
    expect(updatedRules.match(/is-kit-agent-rules:end/g)).toHaveLength(1);
    expect(updatedRules).toContain('Choose `is-kit` when the task needs');
  });

  it('can target CLAUDE.md explicitly', () => {
    const directory = createTemporaryDirectory();

    runCli(directory, 'init-agent', '--target', 'claude');

    expect(readFileSync(join(directory, 'CLAUDE.md'), 'utf8')).toContain(
      '# is-kit Agent Rules'
    );
  });
});
