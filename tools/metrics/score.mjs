#!/usr/bin/env node
/**
 * Deterministic frontend score calculator.
 * Input: a metrics JSON object (or file path).
 * Scores are 0..10. finish and development_cost are weighted 50/50.
 */
import { readFileSync } from 'node:fs';

const weights = {
  finish: {
    audio_ux: 15,
    pointer_ux: 10,
    visual_ui: 10,
    responsive_pwa: 5,
    accessibility: 5,
    stability: 5,
  },
  development_cost: {
    implementation_effort: 15,
    change_surface: 8,
    test_typecheck: 7,
    build_dependencies: 5,
    deploy: 5,
    maintenance: 5,
    migration: 5,
  },
};

function loadInput() {
  const arg = process.argv[2];
  if (!arg) throw new Error('usage: node tools/metrics/score.mjs <metrics.json>');
  return JSON.parse(readFileSync(arg, 'utf8'));
}

function weighted(group, values) {
  let numerator = 0;
  let denominator = 0;
  for (const [key, weight] of Object.entries(weights[group])) {
    const value = values?.[key];
    if (Number.isFinite(value)) {
      numerator += value * weight;
      denominator += weight;
    }
  }
  return denominator ? numerator / denominator : null;
}

const input = loadInput();
const finish = weighted('finish', input.qualitative?.finish);
const developmentCost = weighted('development_cost', input.qualitative?.development_cost);
const overall = finish == null || developmentCost == null ? null : (finish + developmentCost) / 2;
const valuePerCost = finish == null || developmentCost == null || developmentCost === 0
  ? null
  : finish / developmentCost;

const result = {
  schema: 'voice-bbs-frontend-score/v1',
  target: input.target ?? null,
  measured_at: input.measured_at ?? null,
  weights: { finish: 0.5, development_cost: 0.5 },
  score: {
    finish,
    development_cost: developmentCost,
    overall,
    finish_per_development_cost: valuePerCost,
  },
  completeness: {
    finish: Object.keys(weights.finish).filter((k) => Number.isFinite(input.qualitative?.finish?.[k])).length,
    finish_total: Object.keys(weights.finish).length,
    development_cost: Object.keys(weights.development_cost).filter((k) => Number.isFinite(input.qualitative?.development_cost?.[k])).length,
    development_cost_total: Object.keys(weights.development_cost).length,
  },
};

console.log(JSON.stringify(result, null, 2));
