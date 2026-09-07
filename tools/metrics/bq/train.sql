CREATE OR REPLACE MODEL `voice_bbs.frontend_score_model`
OPTIONS (
  model_type = 'linear_reg',
  input_label_cols = ['overall_score']
) AS
SELECT
  overall_score,
  finish_audio_ux,
  finish_pointer_ux,
  finish_visual_ui,
  finish_responsive_pwa,
  finish_accessibility,
  finish_stability,
  cost_implementation_effort,
  cost_change_surface,
  cost_test_typecheck,
  cost_build_dependencies,
  cost_deploy,
  cost_maintenance,
  cost_migration,
  artifact_total_bytes,
  artifact_js_bytes,
  artifact_css_bytes,
  source_files,
  source_lines,
  dependency_count,
  build_duration_ms,
  test_duration_ms,
  typecheck_duration_ms
FROM `voice_bbs.frontend_metrics`
WHERE overall_score IS NOT NULL;