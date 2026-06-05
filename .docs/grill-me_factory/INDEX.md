# Indice de Respuestas del Grill-me

| ID | Pregunta | Archivo | Estado | Decision |
|---|---|---|---|---|
| GQ-001 | Que tipo de fabrica quieres construir primero? | `GQ-001_alcance_de_la_fabrica.md` | accepted | `factory_scope = personal_agent_agnostic_stack_agnostic` |
| GQ-002 | Como se descarga, instala y ejecuta la fabrica? | `GQ-002_distribucion_runtime_y_uso.md` | accepted | `install_model = npx_gridwork_init`; `gridwork_run_command_v1 = false`; uso por prompts MD en chat |
| GQ-003 | Que se versiona en Git y que queda como runtime local? | `GQ-003_versionado_git_y_runtime_local.md` | accepted | `.gridwork/` versionado; `.factory/` runtime local; `gridwork init` actualiza `.gitignore` |
| GQ-004 | Que debe contener `.gridwork/factory.json`? | `GQ-004_factory_json_configuracion_raiz.md` | accepted | `factory_json_model = minimal_referential_manifest`; activacion por prompts; CLI init-only |
| GQ-005 | Como se define un agente agnostico? | `GQ-005_modelo_de_agente_agnostico.md` | accepted | `agent_model = declarative_provider_agnostic_manifest` |
| GQ-006 | Como funcionan los adapters de agentes? | `GQ-006_adapters_de_agentes.md` | accepted | `initial_adapters = manual-chat`; `codex,mock` diferidos |
| GQ-007 | Como se define una skill en Gridwork? | `GQ-007_modelo_de_skill.md` | accepted | `skill_model = versioned_folder_with_manifest_and_instructions` |
| GQ-008 | Como se agregan stacks especificos sin contaminar el core? | `GQ-008_stack_packs.md` | accepted | `stack_extension_model = predefined_stack_pack_for_v1`; `default_stack_pack = nextjs_springboot_postgresql_docker_compose` |
| GQ-009 | Como se instalan o crean skills y stack packs? | `GQ-009_instalacion_creacion_skills_stack_packs.md` | accepted | `dynamic_skill_stack_installation = false`; cambios manuales despues de `gridwork init` |
| GQ-010 | Como se definen y ejecutan workflows? | `GQ-010_modelo_de_workflows.md` | accepted | `workflow_model = versioned_prompt_playbook`; sin `gridwork run` en v1 |
| GQ-011 | Que workflows base vienen en v1 y en que modo? | `GQ-011_workflows_base_v1.md` | accepted | workflows: intake, ideation, architecture-ddd, tdd-implementation, verification-pr; skills: sdd-requirements, backlog-planning, github-actions-cicd, diagnose-bug, handoff; tool: gh |
| GQ-012 | Como se gobierna GitHub CLI (`gh`)? | `GQ-012_github_cli_policy.md` | accepted | `github_cli_policy = allowlist_by_risk`; writes require dry-run/approval |
| GQ-013 | Que agentes base vienen en v1? | `GQ-013_agentes_base_v1.md` | accepted | `agents_v1 = orchestrator,intake-agent,software-architect,planner-agent,implementer-agent,verifier-agent` |
| GQ-014 | Que permisos tiene cada agente? | `GQ-014_permisos_por_agente.md` | accepted | `agent_permissions_model = capability_permissions_plus_workspace_scopes` |
| GQ-015 | Que dominios de carpetas puede usar cada agente? | `GQ-015_workspace_domains_y_path_scopes.md` | accepted | `filesystem_governance_model = workspace_domain_plus_path_scope` |
| GQ-016 | Que layout de proyecto usa el stack v1? | `GQ-016_layout_proyecto_stack_v1.md` | accepted | `gridwork_init_generates_product_code = false`; stack predefinido solo instala skills/policies/templates |
| GQ-017 | Como detecta o declara Gridwork el layout real del proyecto? | `GQ-017_deteccion_de_layout_del_proyecto.md` | accepted | sin comandos detect/configure; orquestador pregunta/detecta dentro del prompt |
| GQ-018 | Como funciona la activacion por prompts Markdown? | `GQ-018_activacion_por_prompts_markdown.md` | accepted | activacion por `.gridwork/agents/orchestrator/PROMPT.md`; contratos en `AGENT.md` |
| GQ-019 | Como separar prompts, contratos de agentes, workflows y skills? | `GQ-019_prompts_generados_por_init.md` | accepted | `PROMPT.md` activa; `AGENT.md` contrata; `WORKFLOW.md` procesa; `SKILL.md` capacita; prompt obligatorio solo orquestador |
| GQ-020 | Como se registran trazabilidad, logs, metricas y runs? | `GQ-020_observabilidad_trazabilidad_runs.md` | accepted | observabilidad local file-based; todo runtime v1 solo en `.factory/`; sin reportes versionados automaticos |
| GQ-021 | Como se crean work orders y se delegan tareas a agentes? | `GQ-021_work_orders_y_delegacion.md` | accepted | work orders obligatorios solo para agentes AFK; viven en `.factory/runs/<run-id>/` |
| GQ-022 | Cuando debe detenerse un agente AFK y pedir aprobacion? | `GQ-022_human_gates_y_aprobaciones.md` | accepted | agentes AFK se detienen ante gates; pueden proponer alternativas pero no ejecutarlas sin aprobacion |
| GQ-023 | Como se organizan ramas, PRs y merge hacia develop? | `GQ-023_git_branching_pr_lifecycle.md` | accepted | modelo `main`/`develop`/`feature`; `develop` obligatorio; agentes no hacen push/PR/merge sin aprobacion |
| GQ-024 | Como se crean issues de backlog como vertical slices? | `GQ-024_backlog_issues_vertical_slices.md` | accepted | issues vertical slice; drafts en `.factory`; skill `github-issue-publisher` crea issues reales con aprobacion |
| GQ-025 | Que debe contener el SDD generado por `sdd-requirements`? | `GQ-025_sdd_requirements_structure.md` | accepted | SDD enfocado en requisitos, casos de uso y pruebas; drafts en `.factory`; aprobado versionado en `docs/sdd/` |
| GQ-026 | Que artefactos produce `architecture-ddd`? | `GQ-026_architecture_ddd_outputs.md` | accepted | arquitectura en multiples documentos; ADRs; diagramas/graficos en HTML; skill candidata `html-architecture-diagrams` |
| GQ-027 | Como deben funcionar los diagramas HTML de arquitectura? | `GQ-027_html_architecture_diagrams.md` | accepted | HTML autocontenido; sin CDN, build step ni npm install; abre como archivo local |
| GQ-028 | Que debe instalar exactamente `npx gridwork init`? | `GQ-028_init_installed_factory_layout.md` | accepted | instala paquete base completo; `.gridwork/` versionado; `.factory/` ignorado; no genera codigo productivo |
| GQ-029 | Que pasa si `npx gridwork init` se ejecuta de nuevo? | `GQ-029_init_idempotencia_actualizaciones.md` | accepted | init idempotente; no sobrescribe; crea faltantes; conflictos en `.factory/init/<init-run-id>/` |
| GQ-030 | Que preflight checks debe hacer `npx gridwork init`? | `GQ-030_init_preflight_checks.md` | accepted | preflight activo; solo bloquea errores criticos de instalacion; faltantes operativos son warnings |
| GQ-031 | Que labels y metadata deben usar las issues de GitHub? | `GQ-031_github_issue_labels_metadata.md` | accepted | labels con prefijos; catalogo JSON en `.gridwork/policies/github-labels.json`; agentes no inventan labels |
| GQ-032 | Que puede decidir `verification-pr` sobre una PR? | `GQ-032_verification_pr_decisiones.md` | accepted | genera reporte local obligatorio; puede comentar PR con `gh pr comment` bajo aprobacion; no mergea |
| GQ-033 | Que formato debe tener el reporte y comentario de `verification-pr`? | `GQ-033_verification_report_comment_format.md` | accepted | reporte local completo; comentario GitHub resumido con findings principales; sin logs sensibles |
| GQ-034 | Que evidencia TDD debe producir `tdd-implementation`? | `GQ-034_tdd_implementation_evidence.md` | accepted | evidencia TDD red/green/refactor; si falta red/green pasa a verifier como `needs_more_evidence`; inspirado en TDD de Matt |
| GQ-035 | Que comandos de test puede ejecutar el implementer-agent? | `GQ-035_test_commands_allowlist.md` | accepted | allowlist conservadora por stack; sin shell libre; ampliable manualmente |
| GQ-036 | Que alcance tiene la skill `diagnose-bug`? | `GQ-036_diagnose_bug_scope.md` | accepted | diagnostica y propone; no modifica codigo; puede apoyar al implementer dentro de TDD |
| GQ-037 | Que debe contener la skill `handoff`? | `GQ-037_handoff_skill.md` | accepted | obligatorio solo en transferencia de agente/sesion; no en cada cierre de workflow |
| GQ-038 | Que formato deben tener logs, eventos y metricas de los agentes? | `GQ-038_logs_eventos_metricas.md` | accepted | modelo hibrido JSONL/JSON/Markdown; sin dashboard v1; sin logs sensibles |
| GQ-039 | Como se nombran y correlacionan runs, work orders y artefactos? | `GQ-039_ids_correlacion_trazabilidad.md` | accepted | IDs legibles con fecha, hora y slug corto; GitHub como referencia externa |
| GQ-040 | Que ciclo de vida y estados debe tener un run? | `GQ-040_run_lifecycle_estados.md` | accepted | maquina de estados simple y comun para todos los workflows |
| GQ-041 | Que contrato debe tener un work order AFK? | `GQ-041_work_order_contract.md` | accepted | Markdown con front matter YAML; contrato obligatorio para agentes AFK |
| GQ-042 | Como decide el orquestador que workflow y agente activar? | `GQ-042_orchestrator_routing_policy.md` | accepted | matriz semi-deterministica con confidence score; pregunta si la confianza es baja |
| GQ-043 | Que contrato estandar debe tener cada agente? | `GQ-043_agent_contract_structure.md` | accepted | plantilla estandar comun para `AGENT.md` con secciones especificas por agente |
| GQ-044 | Que contrato estandar debe tener cada skill? | `GQ-044_skill_contract_structure.md` | accepted | plantilla estandar comun para `SKILL.md` con secciones especificas por categoria |
| GQ-045 | Que contrato estandar debe tener cada workflow? | `GQ-045_workflow_contract_structure.md` | accepted | plantilla estandar comun para `WORKFLOW.md` con fases especificas por workflow |
| GQ-046 | Como se resuelven conflictos entre policies, agentes, workflows, skills y work orders? | `GQ-046_policy_precedence_conflicts.md` | accepted | deny by default; regla mas restrictiva gana; skills no elevan permisos |
| GQ-047 | Que debe incluir el stack pack Next.js + Spring Boot + PostgreSQL? | `GQ-047_stack_pack_next_spring_postgres_contents.md` | accepted | incluye skills especificas por tecnologia como guidance; no genera codigo ni eleva permisos |
| GQ-048 | Como se activa y usa un stack pack durante un workflow? | `GQ-048_stack_pack_activation_usage.md` | accepted | disponible como default; se aplica solo con deteccion o confirmacion |
| GQ-049 | Como debe convertir `backlog-planning` arquitectura y SDD en issues? | `GQ-049_backlog_planning_issue_pipeline.md` | accepted | `backlog-planning` crea drafts locales; `github-issue-publisher` publica con approval gate |
| GQ-050 | Como debe publicar issues reales `github-issue-publisher`? | `GQ-050_github_issue_publisher.md` | accepted | publica lotes pequenos con un approval gate por publish plan; lotes grandes/riesgosos se dividen |
| GQ-051 | Como debe descubrir issues `github-issue-discovery` para implementacion? | `GQ-051_github_issue_discovery.md` | accepted | solo lectura y recomendacion; no crea work orders automaticamente |
| GQ-052 | Como se convierte una issue ready en work order AFK? | `GQ-052_issue_to_work_order.md` | accepted | draft local automatico si issue esta ready; delegacion AFK requiere confirmacion humana |
| GQ-053 | Como ejecuta el implementer-agent un work order AFK bajo TDD? | `GQ-053_tdd_implementation_work_order_execution.md` | accepted | bloquea sin red phase clara; excepcion solo no testeable/documentacion con `needs_more_evidence`; basado en TDD de Matt |
| GQ-054 | Como verifica el verifier-agent una implementacion o PR? | `GQ-054_verifier_agent_review_execution.md` | accepted | verifier puede ejecutar comandos allowlisted; no modifica codigo ni usa shell libre |
| GQ-055 | Como se maneja el ciclo de cambios entre verifier-agent e implementer-agent? | `GQ-055_verifier_implementer_feedback_loop.md` | accepted | mismo work order con revisiones si el scope no cambia; nuevo work order si cambia el alcance |
| GQ-056 | Como debe manejar Gridwork ramas, commits, PRs y push? | `GQ-056_git_branch_pr_push_policy.md` | accepted | commits locales con aprobacion; push/PR con aprobacion separada; merge manual |
| GQ-057 | Como debe funcionar la skill `github-actions-cicd`? | `GQ-057_github_actions_cicd_skill.md` | accepted | modo default `draft-only`; escritura en `.github/workflows/` solo con aprobacion; deploy deshabilitado |
| GQ-058 | Como debe funcionar `ideation-from-zero` junto a `sdd-requirements`? | `GQ-058_ideation_sdd_requirements_flow.md` | accepted | documentos separados durante ideacion; SDD consolidado al cierre en `docs/sdd/` |
| GQ-059 | Como debe funcionar el grill-me de `architecture-ddd`? | `GQ-059_architecture_ddd_grill_me_flow.md` | accepted | dos pasadas: primero DDD, despues mapeo tecnico y ADRs |
| GQ-060 | Como debe funcionar `intake-existing-code` para bugs, mejoras y features? | `GQ-060_intake_existing_code_flow.md` | accepted | flujo HITL; puede preparar issue drafts y candidate work orders; no publica ni delega sin aprobacion |
| GQ-061 | Que debe contener el `PROMPT.md` del orquestador? | `GQ-061_orchestrator_activation_prompt.md` | accepted | loader operativo con checklist de arranque; primera respuesta obligatoria; sin duplicar contratos |
| GQ-062 | Como debe validar Gridwork manifests, schemas y estructura? | `GQ-062_validation_schemas_governance.md` | accepted | validador minimo sin dependencias externas; schemas versionados como contratos |
| GQ-063 | Como debe manejar Gridwork secretos, datos sensibles y redaccion? | `GQ-063_security_secrets_redaction.md` | accepted | v1 no lee valores secretos reales; usa examples/templates o informacion sanitizada; redaccion obligatoria |
| GQ-064 | Como debe estructurarse la CLI TypeScript y el paquete npm? | `GQ-064_typescript_cli_package_init.md` | accepted | CLI npm como bootstrapper; descarga fabrica desde release/tag versionado; lockfile con source/version/hash |
| GQ-065 | Como debe funcionar la skill `gridwork-release-publisher`? | `GQ-065_gridwork_release_publisher_skill.md` | accepted | prepara release plan por defecto; crea tag/release solo con aprobacion explicita |
| GQ-066 | Como debe actualizar `init` una fabrica ya instalada? | `GQ-066_init_update_installed_factory.md` | accepted | sin auto-update; `init` repara lockfile actual; update explicito con `--factory-version` |
| GQ-067 | Como debe organizarse el repositorio fuente de Gridwork? | `GQ-067_gridwork_source_repository_layout.md` | accepted | monorepo v1; CLI en `packages/cli/`; fabrica en `factory/.gridwork/`; tags separados |
| GQ-068 | Que debe contener y como se verifica el bundle de release de fabrica? | `GQ-068_factory_release_bundle_contract.md` | accepted | release con zip, manifest, SHA256SUMS y notes; CLI verifica antes de instalar |
| GQ-069 | Como resuelve `init` la fuente y version de fabrica? | `GQ-069_init_source_resolution.md` | accepted | source oficial embebido; override `--source owner/repo --factory-version`; sin URLs/branches/main |
| GQ-070 | Como se gobierna compatibilidad entre CLI, fabrica y schemas? | `GQ-070_version_compatibility_contract.md` | accepted | versiones independientes; bloqueo estricto si CLI/schema/contracts no son compatibles |
| GQ-071 | Como se publica el paquete npm `gridwork`? | `GQ-071_npm_cli_publish_contract.md` | accepted | modelo hibrido; skill prepara; tag `cli-v<version>`; GitHub Actions publica npm |
| GQ-072 | Que package manager y toolchain usa el monorepo? | `GQ-072_monorepo_toolchain_package_manager.md` | accepted | npm workspaces; `package-lock.json`; Node >=20; sin pnpm/yarn/bun en v1 |
| GQ-073 | Que debe validar el CI del repositorio fuente de Gridwork? | `GQ-073_source_repository_ci_contract.md` | accepted | contrato completo desde v1; implementacion por etapas; CI no publica |
| GQ-074 | Como comunica `init` resultados, errores y exit codes? | `GQ-074_init_cli_output_errors_exit_codes.md` | accepted | consola breve; reportes en `.factory/init/`; exit codes estables; `--verbose` |
| GQ-075 | Como extrae la CLI el bundle zip de forma segura? | `GQ-075_bundle_extraction_strategy.md` | accepted | zip con dependencia runtime minima y auditada; staging; sin herramientas del sistema |
| GQ-076 | Como aplica `init` archivos sin pisar personalizaciones? | `GQ-076_init_file_apply_conflict_strategy.md` | accepted | hashes en `.gridwork-lock.json`; actualiza solo archivos no personalizados; candidates en `.factory/` |
| GQ-077 | Que contrato debe tener `.gridwork-lock.json`? | `GQ-077_gridwork_lockfile_contract.md` | accepted | lockfile versionado en raiz; deterministico; sin secretos; hashes por archivo |
| GQ-078 | Que nivel de seguridad de supply chain usa v1? | `GQ-078_supply_chain_trust_signing.md` | accepted | checksums obligatorios + provenance/metadata GitHub/npm; sin firmas externas v1 |
| GQ-079 | Como manejar nombre npm y ownership del paquete? | `GQ-079_npm_package_name_and_registry_ownership.md` | accepted | `gridwork` preferido; fallback scoped `@<scope>/gridwork`; bin `gridwork` |
| GQ-080 | Como se define el source oficial embebido de la CLI? | `GQ-080_official_source_coordinates.md` | accepted | defaults de build validados; release bloqueado si source oficial queda placeholder |
| GQ-081 | Como se publican releases de fabrica? | `GQ-081_factory_publish_mechanism.md` | accepted | v1 publica fabrica con `gridwork-release-publisher` + `gh release create` bajo approval; GitHub Actions queda como objetivo futuro |
| GQ-082 | Como manejar canales de release y prereleases? | `GQ-082_release_channels_and_prereleases.md` | accepted | stable por defecto; prerelease solo con version exacta + `--allow-prerelease`; sin canales v1 |
| GQ-083 | Como accede `init` a GitHub Releases, auth y rate limits? | `GQ-083_init_github_access_auth_and_rate_limits.md` | accepted | publico por defecto; token opcional `GITHUB_TOKEN`/`GH_TOKEN`; sin `gh` requerido; sin secretos en reportes |
| GQ-084 | Como maneja `init` cache, reintentos y offline? | `GQ-084_init_cache_retries_and_offline_behavior.md` | accepted | cache local verificada en `.factory/cache/bundles/`; sin cache global; offline limitado a repair con cache |
| GQ-085 | En que orden implementar el MVP de Gridwork? | `GQ-085_mvp_implementation_roadmap.md` | accepted | roadmap por rebanadas verticales; primero `init` + fabrica minima instalable + lockfile/reportes |
| GQ-086 | Que DoD y pruebas de aceptacion debe cumplir `init` MVP? | `GQ-086_init_definition_of_done_acceptance_tests.md` | accepted | DoD e2e para `init`: new install, re-run, conflicto, fallo seguro, reportes, lockfile y seguridad |
| GQ-087 | Que inventario de archivos instala la fabrica? | `GQ-087_factory_installed_file_inventory.md` | accepted | inventarios separados `minimal-mvp` / `full-v1`; `factoryProfile` guia validacion |
| GQ-088 | Que documentacion y quickstart instala Gridwork? | `GQ-088_documentation_quickstart_and_onboarding.md` | accepted | docs instalados dentro de `.gridwork/`; sin docs en raiz; consola apunta a quickstart y prompt |
| GQ-089 | Como convertir el grill-me en backlog inicial de implementacion? | `GQ-089_grill_me_to_implementation_backlog.md` | accepted | drafts locales primero en `.docs/grill-me_factory/backlog/`; GitHub por lotes con aprobacion |
| GQ-090 | Que alcance tendra el primer lote de drafts del backlog MVP? | `GQ-090_first_mvp_backlog_draft_batch.md` | accepted | mapa liviano completo + drafts detallados de fase 0 y fase 1; sin publish GitHub |
| GQ-091 | Debe ampliarse el catalogo de labels para el backlog inicial de Gridwork? | `GQ-091_backlog_label_catalog_extension.md` | accepted | extension minima con `phase:*`, `area:*` y `slice:enabling`; crear labels GitHub requiere aprobacion |
| GQ-092 | Como revisar y aprobar los drafts antes de publicar o implementar? | `GQ-092_backlog_draft_review_and_readiness.md` | accepted | review por lote con checklist; solo drafts `ready` se publican o implementan sin excepcion |
| GQ-093 | Como iniciar la implementacion del MVP despues del review? | `GQ-093_mvp_implementation_start_strategy.md` | accepted | review de readiness primero; luego implementar fase 0 localmente; sin publish GitHub previo |
| GQ-094 | Como ejecutar el review de readiness del primer lote? | `GQ-094_execute_first_backlog_readiness_review.md` | accepted | fase 0 full review `ready`; fase 1 light audit; publish GitHub sigue bloqueado |
| GQ-095 | Implementamos fase 0 localmente ahora? | `GQ-095_implement_phase_0_now.md` | accepted | `phase_0_implementation_mode = implement_all_ready_phase_0_drafts`; implementado localmente |
| GQ-096 | Revisamos fase 1 e implementamos fabrica minima? | `GQ-096_phase_1_minimal_factory_review_and_implementation.md` | accepted | `phase_1_strategy = review_full_then_implement_if_ready`; implementado localmente |
| GQ-097 | Detallamos fase 2 para `gridwork init` local-first? | `GQ-097_phase_2_local_first_init_backlog.md` | accepted | `phase_2_strategy = create_detailed_drafts_then_review`; drafts creados |
| GQ-098 | Revisamos fase 2 e implementamos `init` local-first? | `GQ-098_phase_2_readiness_review_and_implementation.md` | accepted | `phase_2_strategy = review_full_then_implement_if_ready`; implementado localmente |
| GQ-099 | Detallamos fase 3 para bundle, descarga, verificacion y cache? | `GQ-099_phase_3_bundle_download_verify_cache_backlog.md` | accepted | `phase_3_strategy = create_detailed_drafts_then_review`; drafts creados |
| GQ-100 | Revisamos fase 3 e implementamos bundle verificable? | `GQ-100_phase_3_readiness_review_and_implementation.md` | accepted | `phase_3_strategy = review_full_then_implement_if_ready`; implementado localmente |
| GQ-101 | Detallamos fase 4 para publicar la primera release de fabrica? | `GQ-101_phase_4_factory_release_publisher_backlog.md` | accepted | `phase_4_strategy = create_detailed_drafts_then_review`; drafts creados |
| GQ-102 | Revisamos fase 4 e implementamos release publisher? | `GQ-102_phase_4_readiness_review_and_implementation.md` | accepted | `phase_4_strategy = review_full_resolve_contract_then_implement_if_ready`; implementado dry-run/plan |
| GQ-103 | Detallamos fase 5 para publicar la CLI npm? | `GQ-103_phase_5_npm_cli_publish_backlog.md` | accepted | `phase_5_strategy = create_detailed_drafts_then_review`; drafts creados |
| GQ-104 | Revisamos fase 5 e implementamos publish CLI dry-run? | `GQ-104_phase_5_readiness_review_and_implementation.md` | accepted | `phase_5_strategy = review_full_then_implement_safe_dry_run`; implementado dry-run/plan |
| GQ-105 | Detallamos fase 6 para expandir la fabrica full-v1? | `GQ-105_phase_6_full_factory_v1_backlog.md` | accepted | `phase_6_strategy = create_detailed_drafts_then_review`; drafts creados |
| GQ-106 | Revisamos fase 6 e implementamos full-v1? | `GQ-106_phase_6_readiness_review_and_implementation.md` | accepted | `phase_6_strategy = review_full_then_implement_by_subphase`; implementado localmente |
| GQ-107 | Preparamos release dry-run de fabrica full-v1? | `GQ-107_full_v1_factory_release_dry_run.md` | accepted | `factory_release_dry_run_completed = true`; publish real no ejecutado |
| GQ-108 | Publicamos release real de fabrica full-v1 0.1.0? | `GQ-108_publish_real_factory_release_v010.md` | accepted | artefactos revisados; publish real bloqueado por working tree sin commit |
| GQ-109 | Preparamos commit fuente antes de publicar factory-v0.1.0? | `GQ-109_prepare_source_commit_before_factory_release.md` | accepted | source commit preparado; publish real no ejecutado |
| GQ-110 | Publicamos factory-v0.1.0 despues del commit fuente? | `GQ-110_publish_factory_v010_after_source_commit.md` | accepted | artefactos finales revisados; publish real no ejecutado |
| GQ-111 | Hacemos preflight remoto o publish real de factory-v0.1.0? | `GQ-111_remote_publish_factory_v010_gate.md` | accepted | preflight remoto pasado; no se publico |
| GQ-112 | Publicamos release real factory-v0.1.0? | `GQ-112_publish_real_factory_v010.md` | accepted | release real publicada en GitHub |
| GQ-113 | Validamos instalacion desde release real factory-v0.1.0? | `GQ-113_validate_real_factory_release_install.md` | accepted | smoke remoto e idempotencia pasaron |
| GQ-114 | Preparamos fuente para release CLI v0.1.0? | `GQ-114_prepare_cli_v010_release_source.md` | pending | TBD |

## Convencion de IDs

- `GQ`: Grill Question.
- `001`: numero correlativo de la pregunta en `grill-me_software_factory.md`.
- El slug del archivo resume el tema de la pregunta.

## Proxima pregunta activa

```text
GQ-114 - Preparamos fuente para release CLI v0.1.0?
```
