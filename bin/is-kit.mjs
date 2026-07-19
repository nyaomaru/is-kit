#!/usr/bin/env node

import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const START_MARKER = '<!-- is-kit-agent-rules:start -->';
const END_MARKER = '<!-- is-kit-agent-rules:end -->';
const TARGET_FILES = {
  agents: 'AGENTS.md',
  claude: 'CLAUDE.md'
};

const usage = `Usage: is-kit init-agent [--target agents|claude]

Adds or updates the is-kit rules in AGENTS.md (default) or CLAUDE.md.`;

const isHelpRequested = (args) =>
  args.includes('--help') || args.includes('-h');

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const parseTarget = (args) => {
  const targetIndex = args.indexOf('--target');

  if (targetIndex === -1) {
    return 'agents';
  }

  const target = args[targetIndex + 1];
  if (!Object.hasOwn(TARGET_FILES, target)) {
    throw new Error(`Unknown target: ${target ?? '(missing)'}`);
  }

  return target;
};

const updateManagedSection = (existingContent, rules) => {
  const section = `${START_MARKER}\n${rules.trim()}\n${END_MARKER}`;
  const startIndex = existingContent.indexOf(START_MARKER);
  const endIndex = existingContent.indexOf(END_MARKER);

  if (startIndex === -1 && endIndex === -1) {
    const separator = existingContent.trim().length === 0 ? '' : '\n\n';
    return `${existingContent.trimEnd()}${separator}${section}\n`;
  }

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('The existing is-kit managed section is malformed.');
  }

  const afterSection = endIndex + END_MARKER.length;
  return `${existingContent.slice(0, startIndex)}${section}${existingContent.slice(afterSection)}`;
};

const initAgent = async (args) => {
  const target = parseTarget(args);
  const targetPath = resolve(process.cwd(), TARGET_FILES[target]);
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const rulesPath = resolve(packageRoot, 'docs/agent-rules.md');
  const rules = await readFile(rulesPath, 'utf8');
  const existingContent = (await fileExists(targetPath))
    ? await readFile(targetPath, 'utf8')
    : '';

  await writeFile(
    targetPath,
    updateManagedSection(existingContent, rules),
    'utf8'
  );
  process.stdout.write(
    `Updated ${TARGET_FILES[target]} with is-kit agent rules.\n`
  );
};

const main = async () => {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'init-agent') {
    if (isHelpRequested(args)) {
      process.stdout.write(`${usage}\n`);
      return;
    }

    await initAgent(args);
    return;
  }

  process.stdout.write(`${usage}\n`);
  process.exitCode = command === undefined || command === '--help' ? 0 : 1;
};

main().catch((error) => {
  process.stderr.write(`is-kit: ${error.message}\n`);
  process.exitCode = 1;
});
