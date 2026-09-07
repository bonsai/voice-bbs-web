#!/usr/bin/env node
/**
 * Voice BBS frontend evaluation metrics collector.
 *
 * Usage:
 *   node tools/metrics/collect.mjs vue
 *   node tools/metrics/collect.mjs react
 *   node tools/metrics/collect.mjs next
 *
 * The collector intentionally separates measured values from qualitative scores.
 * It never invents a metric when the target artifact is unavailable.
 */
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const targets = {
  vue: { label: 'Vue 3 + Vite', dir: 'apps/web-vue', dist: 'apps/web-vue/dist' },
  react: { label: 'React + Vite', dir: 'apps/web-react', dist: 'apps/web-react/dist' },
  next: { label: 'Next.js', dir: 'apps/web-next', dist: 'apps/web-next/out' },
};

const targetName = process.argv[2];
if (!targetName || !targets[targetName]) {
  console.error(`usage: node tools/metrics/collect.mjs <${Object.keys(targets).join('|')}>`);
  process.exit(2);
}

const target = targets[targetName];
const absDir = join(ROOT, target.dir);
const absDist = join(ROOT, target.dist);

function bytesUnder(dir) {
  if (!existsSync(dir)) return null;
  let total = 0;
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const bytes = statSync(full).size;
        total += bytes;
        files.push({ path: relative(dir, full), bytes });
      }
    }
  };
  walk(dir);
  return { bytes: total, files: files.sort((a, b) => b.bytes - a.bytes) };
}

function countSourceFiles(dir) {
  if (!existsSync(dir)) return null;
  let files = 0;
  let lines = 0;
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory() && !['node_modules', 'dist', 'out', '.next'].includes(entry.name)) walk(full);
      else if (entry.isFile() && /\.(vue|tsx?|jsx?|css|html)$/.test(entry.name)) {
        files += 1;
        lines += readFileSync(full, 'utf8').split(/\r?\n/).length;
      }
    }
  };
  walk(dir);
  return { files, lines };
}

const dist = bytesUnder(absDist);
const source = countSourceFiles(absDir);
const packagePath = join(absDir, 'package.json');
let dependencies = null;
if (existsSync(packagePath)) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  dependencies = Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).length;
}

const result = {
  schema: 'voice-bbs-frontend-metrics/v1',
  measured_at: new Date().toISOString(),
  target: targetName,
  framework: target.label,
  environment: {
    node: process.version,
    cwd: ROOT,
  },
  measured: {
    artifact: dist
      ? {
          path: target.dist,
          total_bytes: dist.bytes,
          js_bytes: dist.files.filter((f) => /\.m?js$/.test(f.path)).reduce((n, f) => n + f.bytes, 0),
          css_bytes: dist.files.filter((f) => /\.css$/.test(f.path)).reduce((n, f) => n + f.bytes, 0),
        }
      : null,
    source: source,
    dependency_count: dependencies,
  },
  qualitative: {
    finish: null,
    development_cost: null,
  },
  notes: [
    'Build time, test time, typecheck time, deploy steps, and interaction scores are recorded separately by the benchmark runner/manual review.',
    'null means not measured; do not substitute an estimate.',
  ],
};

const outDir = join(ROOT, 'tools/metrics/results');
mkdirSync(outDir, { recursive: true });
const output = join(outDir, `${targetName}.json`);
writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
console.error(`wrote ${output}`);
