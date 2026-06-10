# AI Router - AlbumSL

## Siempre leer

```txt
AGENTS.md
docs/AI_ROUTER.md
git status --short
```

Además, leer los archivos directamente afectados por la tarea.

## Regla de uso

Elegí **un solo route file principal** para la tarea. Abrí rutas adicionales solo si la tarea cruza dominios. La selección de agentes también vive acá.

Si se delega:

1. Resolver los agentes activados mediante `docs/agents/INDEX.md`.
2. Leer `.atl/skill-registry.md` una vez por sesión.
3. Cargar de `.atl/skill-rules.md` solo los headings exactos indicados en `Skill blocks`.
4. Inyectar esas reglas al subagente; el subagente no relee registry, rules ni `SKILL.md`.

## Índice de rutas

| Tarea / patrón                                                                                     | Route file                        | Agentes                                                                                                      | Skill blocks                                                                                                              |
| -------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Cambios visuales, layout, textos, estados UI                                                       | `docs/ai-routes/ui.md`            | Frontend Agent + QA Agent                                                                                    | `albumsl-frontend-ui`, `albumsl-qa-check`                                                                                 |
| Auth, login, sesión, claims                                                                        | `docs/ai-routes/auth.md`          | Frontend Agent + Backend / Firebase Functions Agent + Security Agent + QA Agent                              | `albumsl-frontend-ui`, `albumsl-firebase-backend`, `albumsl-security-review`, `albumsl-qa-check`                          |
| UI del álbum, pegar figuritas, flujos del álbum                                                    | `docs/ai-routes/album.md`         | Frontend Agent + Domain / Application Agent + Backend / Firebase Functions Agent + Security Agent + QA Agent | `albumsl-feature-slice`, `albumsl-frontend-ui`, `albumsl-firebase-backend`, `albumsl-security-review`, `albumsl-qa-check` |
| Abrir sobre, daily pack, asignación, inventario, auditoría de apertura                             | `docs/ai-routes/pack-opening.md`  | Domain / Application Agent + Backend / Firebase Functions Agent + Security Agent + QA Agent                  | `albumsl-feature-slice`, `albumsl-firebase-backend`, `albumsl-security-review`, `albumsl-qa-check`                        |
| Firestore Rules, seguridad, permisos, ownership, abuso del cliente                                 | `docs/ai-routes/security.md`      | Security Agent + Backend / Firebase Functions Agent + QA Agent                                               | `albumsl-security-review`, `albumsl-firebase-backend`, `albumsl-qa-check`                                                 |
| Backend, API, Admin SDK, Cloud Functions, Firebase infra                                           | `docs/ai-routes/backend.md`       | Backend / Firebase Functions Agent + Security Agent + QA Agent                                               | `albumsl-firebase-backend`, `albumsl-security-review`, `albumsl-qa-check`                                                 |
| Domain / Application, entidades, casos de uso, puertos                                             | `docs/ai-routes/domain.md`        | Domain / Application Agent + QA Agent                                                                        | `albumsl-feature-slice`, `albumsl-qa-check`                                                                               |
| Catálogo, seed, contenido, rarezas, placeholders                                                   | `docs/ai-routes/catalog.md`       | Data / Content Agent + Domain / Application Agent + Security Agent + QA Agent                                | `albumsl-feature-slice`, `albumsl-firebase-backend`, `albumsl-security-review`, `albumsl-qa-check`                        |
| Docs, README, decisiones, instrucciones, router                                                    | `docs/ai-routes/docs.md`          | Product / Spec Agent + Architect / DevOps Agent + QA Agent                                                   | `cognitive-doc-design`, `albumsl-compact-prompt`                                                                          |
| Deploy, ambientes, scripts, CI/CD, operaciones                                                     | `docs/ai-routes/devops.md`        | Release / Operations Agent + Architect / DevOps Agent                                                        | `albumsl-firebase-backend`, `albumsl-qa-check`                                                                            |
| Gentle-AI / GGA                                                                                    | `docs/ai-routes/gentle-ai.md`     | Release / Operations Agent + QA Agent                                                                        | `albumsl-compact-prompt`                                                                                                  |
| Análisis profundo, auditoría completa, rediseño, seguridad crítica, migración o release importante | `docs/ai-routes/deep-analysis.md` | Los agentes del dominio cruzado, más los de seguridad/QA cuando aplique                                      | `security-threat-model`, `security-best-practices`, `cognitive-doc-design`, `albumsl-qa-check`                            |

## Regla rápida

- Si la tarea queda dentro de un solo dominio, abrí solo un route file principal.
- Si cruza dominios, sumá la ruta secundaria mínima necesaria.
- No abras docs de agentes salvo que el router active esos agentes.
