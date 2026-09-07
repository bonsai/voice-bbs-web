#!/usr/bin/env node
/**
 * Common benchmark runner for Vue / React / Next.
 * Runs build, test, and typecheck when scripts exist and records wall time.
 * It does not fail the workflow merely because an optional command is absent.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const targets = {
  vue: 'apps/web-vue',
  react: 'apps/web-react',
  next: 'apps/web-next',
};
const targetName = process.argv[2];
if (!targets[targetName]) {
  console.error(`usage: node tools/metrics/benchmark.mjs <${Object.keys(targets).join('|')}>`);
  process.exit(2);
}

const dir = join(ROOT, targets[targetName]);
const pkgPath = join(dir, 'package.json');
if (!existsSync(pkgPath)) throw new Error(`missing ${pkgPath}`);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

function runScript(name) {
  if (!pkg.scripts?.[name]) return { available: false, passed: null, duration_ms: null };
  const start = process.hrtime.bigint();
  const result = spawnSync('npm', ['run', name], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
  const duration_ms = Number(process.hrtime.bigint() - start) / 1e6;
  return {
    available: true,
    passed: result.status === 0,
    duration_ms: Math.round(duration_ms),
    exit_code: result.status,
    stderr_tail: (result.stderr ?? '').slice(-1000),
  };
}

const result = {
  schema: 'voice-bbs-frontend-benchmark/v1',
  measured_at: new Date().toISOString(),
  target: targetName,
  package: targets[targetName],
  environment: { node: process.version },
  commands: {
    build: runScript('build'),
    test: runScript('test'),
    typecheck: runScript('typecheck'),
  },
};

const outDir = join(ROOT, 'tools/metrics/results');
mkdirSync(outDir, { recursive: true });
const output = join(outDir, `${targetName}-benchmark.json`);
writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
