# AlbumSL Agents

## Objetivo

Este archivo es el índice mínimo operativo para trabajar con IA/Codex en AlbumSL sin gastar tokens de más.

Regla principal: usar el mínimo contexto necesario para la tarea. No leer toda la documentación si el cambio se puede resolver leyendo `docs/AI_ROUTER.md` y los archivos afectados.

## Modo default

Usar siempre la skill local `albumsl-compact-prompt`, salvo que el usuario pida explícitamente análisis profundo, auditoría completa o diseño de arquitectura.

La skill vive en:

```txt
.codex/skills/albumsl-compact-prompt/SKILL.md
```

## Antes de trabajar

1. Leer este archivo.
2. Leer `docs/AI_ROUTER.md`.
3. Revisar `git status --short`.
4. Leer solo los archivos/docs que correspondan según la tarea.
5. No revertir cambios previos no relacionados.

## Reglas globales obligatorias

1. Firebase es infraestructura inicial, no el centro del dominio.
2. `packages/domain` no puede importar Firebase, React ni functions.
3. `packages/application` no puede importar Firebase, React ni functions.
4. `packages/contracts` no debe depender de implementaciones de infraestructura.
5. `packages/infra-firebase` es el único package compartido que puede acoplarse a Firebase.
6. `functions` debe ser adapter fino.
7. La lógica de negocio vive en `packages/domain` y `packages/application`.
8. `apps/web` no puede contener lógica sensible del álbum.
9. El frontend no puede asignar figuritas.
10. El frontend no puede crear `packOpenings`.
11. El frontend no puede crear `packClaims` válidos.
12. El frontend no puede incrementar `userStickers.quantity`.
13. El frontend no puede modificar contadores sensibles de `userAlbums`.
14. Las operaciones sensibles pasan por backend/server-side.
15. Firestore Rules deben negar escrituras sensibles por defecto.
16. Toda feature sensible debe tener tests.
17. No usar secretos reales.
18. No hardcodear credenciales.
19. No aplicar `npm audit fix --force` sin revisión explícita.
20. Toda decisión nueva relevante debe documentarse en `docs/DECISIONS.md`.
21. Toda feature nueva debe actualizar documentación relacionada si cambia un flujo o regla.
22. No usar `any` salvo justificación clara.
23. Mantener TypeScript estricto.
24. Mantener diseño mobile-first.
25. Mantener trazabilidad y auditoría para operaciones críticas.
26. No desplegar producción sin aprobación explícita.

## Agentes disponibles

Los agentes son roles de trabajo, no procesos automáticos. Activar solo los necesarios.

- Product / Spec Agent: producto, alcance, reglas de negocio, roadmap y criterios de aceptación.
- Architect / DevOps Agent: monorepo, scripts, ambientes, CI/CD, estructura y decisiones técnicas.
- Frontend Agent: React, rutas, hooks, componentes, UX y mobile-first.
- Backend / Firebase Functions Agent: backend, adapters, Admin SDK, functions e integración Firebase.
- Domain / Application Agent: entidades, reglas puras, casos de uso, puertos y helpers testeables.
- QA Agent: tests, regresión, validación y smoke checks.
- Security / Ciberseguridad Agent: Firestore Rules, permisos, ownership y abuso del cliente.
- Data / Content Agent: dataset de figuritas, rarezas, distribución, placeholders y copyright.
- Release / Operations Agent: deploy, ambientes, variables, troubleshooting, logs y checklist de release.

Archivos de agentes:

```txt
docs/agents/product-spec-agent.md
docs/agents/architect-devops-agent.md
docs/agents/frontend-agent.md
docs/agents/backend-functions-agent.md
docs/agents/domain-application-agent.md
docs/agents/qa-agent.md
docs/agents/security-agent.md
docs/agents/data-content-agent.md
docs/agents/release-operations-agent.md
```

## Skills locales

Las skills locales viven en `.codex/skills/`.

- `albumsl-compact-prompt`: usar por defecto para ahorrar tokens.
- `albumsl-feature-slice`: usar para implementar features por capas.
- `albumsl-security-review`: usar para revisar permisos, Rules, backend y abuso del cliente.
- `albumsl-qa-check`: usar antes de commit o handoff.
- `albumsl-firebase-backend`: usar en backend, Admin SDK, Firestore e infra Firebase.
- `albumsl-frontend-ui`: usar en pantallas, rutas, hooks, services y UX React.

## Selección mínima de agentes

- Cambio visual simple: Frontend Agent + QA Agent.
- Nueva operación sensible: Domain / Application Agent + Backend Agent + Security Agent + QA Agent.
- Cambio en catálogo o seed: Data / Content Agent + Domain / Application Agent + Security Agent + QA Agent.
- Cambio en Firestore Rules: Security Agent + Backend Agent + QA Agent.
- Deploy dev: Release / Operations Agent + Architect / DevOps Agent.
- Cambio de roadmap o alcance: Product / Spec Agent.

No activar todos los agentes salvo que la tarea realmente cruce todo el sistema.

## Validación

Durante iteración, ejecutar la validación mínima afectada.

Ejemplos:

```bash
npm --workspace @albumsl/web run typecheck
npm --workspace @albumsl/web run build
npm run test:unit
npm run test:rules
npm run format:check
```

Antes de commit, PR, handoff final importante o deploy:

```bash
npm run validate
```

Si no se ejecuta `npm run validate`, reportar exactamente qué validación parcial se corrió y por qué.

## Formato esperado de respuesta

Para implementación:

1. Resumen corto.
2. Archivos modificados.
3. Cambios realizados.
4. Validación ejecutada.
5. Riesgos pendientes.

Para review:

1. Hallazgos por severidad.
2. Archivo/línea.
3. Riesgo.
4. Recomendación concreta.
5. Resumen breve.

## Reglas de ahorro de tokens

- No repetir documentación que ya existe.
- No pegar archivos completos salvo que el usuario lo pida.
- No leer docs no relacionadas.
- No explicar arquitectura base en cada respuesta.
- No proponer refactors grandes si la tarea era chica.
- Preferir cambios localizados.
- Evitar logs largos; resumir y conservar solo errores relevantes.
