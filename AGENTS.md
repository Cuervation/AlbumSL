# AlbumSL Agents

## Objetivo

Este archivo es el indice operativo de agentes especializados para Album San Lorenzo.

Su objetivo es ayudar a Codex u otros agentes a trabajar con foco, sin perder las reglas de
arquitectura, seguridad y producto del proyecto.

Los agentes no son procesos automaticos. Son roles de trabajo. En cada prompt se deben activar solo
los agentes necesarios para la tarea.

## Agentes disponibles

- Product / Spec Agent: producto, alcance, reglas de negocio, roadmap y criterios de aceptacion.
- Architect / DevOps Agent: monorepo, scripts, ambientes, CI/CD, estructura y decisiones tecnicas.
- Frontend Agent: React, rutas, hooks, componentes, UX, loading/error/empty y mobile-first.
- Backend / Firebase Functions Agent: Cloud Functions, adapters, Admin SDK e integracion Firebase.
- Domain / Application Agent: entidades, reglas puras, casos de uso, puertos y helpers testeables.
- QA Agent: tests, casos borde, regresion, validacion y smoke checks.
- Security / Ciberseguridad Agent: Firestore Rules, permisos, ownership, abuso de cliente y riesgos.
- Data / Content Agent: dataset de figuritas, categorias, rarezas, distribucion, placeholders y copyright.
- Release / Operations Agent: deploy, ambientes, variables, troubleshooting, logs y checklist de release.

## Archivos de agentes

- `docs/agents/product-spec-agent.md`
- `docs/agents/architect-devops-agent.md`
- `docs/agents/frontend-agent.md`
- `docs/agents/backend-functions-agent.md`
- `docs/agents/domain-application-agent.md`
- `docs/agents/qa-agent.md`
- `docs/agents/security-agent.md`
- `docs/agents/data-content-agent.md`
- `docs/agents/release-operations-agent.md`

## Skills locales

Las skills locales viven en `.codex/skills/` y sirven para ahorrar tokens y estandarizar tareas
repetidas del proyecto.

- `albumsl-compact-prompt`: usar para respuestas breves sin perder precision tecnica.
- `albumsl-feature-slice`: usar al implementar features por capas.
- `albumsl-security-review`: usar para revisar permisos, Rules, Functions y abuso del cliente.
- `albumsl-qa-check`: usar antes de commit o handoff para validar calidad.
- `albumsl-firebase-backend`: usar en Cloud Functions, Admin SDK e `infra-firebase`.
- `albumsl-frontend-ui`: usar en pantallas, rutas, hooks, services y UX React.

Ejemplos:

- "Usa `albumsl-compact-prompt` y revisa este diff".
- "Usa `albumsl-feature-slice` para implementar daily-pack".
- "Usa `albumsl-security-review` sobre Firestore Rules y functions".
- "Usa `albumsl-qa-check` antes de commitear".

## Cuando usar cada agente

- Usar Product / Spec Agent cuando cambie alcance, reglas, MVP, roadmap o criterios de aceptacion.
- Usar Architect / DevOps Agent cuando cambie estructura, scripts, tooling, ambientes o CI/CD.
- Usar Frontend Agent cuando cambien pantallas, rutas, hooks, servicios web o UX.
- Usar Backend / Firebase Functions Agent cuando cambien callables, adapters, repositorios Firebase o Admin SDK.
- Usar Domain / Application Agent cuando cambien reglas puras, casos de uso, entidades o puertos.
- Usar QA Agent cuando se agreguen tests, se investiguen regresiones o se cierre una validacion.
- Usar Security / Ciberseguridad Agent cuando cambien permisos, Firestore Rules u operaciones sensibles.
- Usar Data / Content Agent cuando cambie el catalogo, seed, metadata, rarezas o contenido editorial.
- Usar Release / Operations Agent cuando se prepare deploy, ambientes, variables, logs o rollback.

## Regla importante

No siempre deben actuar todos los agentes.

Elegir el conjunto minimo suficiente para la tarea. Por ejemplo, un cambio visual simple puede usar
solo Frontend Agent y QA Agent. Una apertura de sobre requiere Domain / Application Agent, Backend /
Firebase Functions Agent, Security / Ciberseguridad Agent y QA Agent.

## Reglas globales obligatorias

1. Firebase es infraestructura inicial, no el centro de la arquitectura.
2. `packages/domain` no puede importar Firebase, React ni functions.
3. `packages/application` no puede importar Firebase, React ni functions.
4. `packages/contracts` no debe depender de implementaciones de infraestructura.
5. `packages/infra-firebase` es el unico package compartido que puede acoplarse a Firebase.
6. `functions` debe ser adapter fino.
7. La logica de negocio vive en `packages/domain` y `packages/application`.
8. `apps/web` no puede contener logica sensible del album.
9. El frontend no puede asignar figuritas.
10. El frontend no puede crear `packOpenings`.
11. El frontend no puede crear `packClaims` validos.
12. El frontend no puede incrementar `userStickers.quantity`.
13. El frontend no puede modificar contadores sensibles de `userAlbums`.
14. Las operaciones sensibles pasan por Cloud Functions.
15. Firestore Rules deben negar escrituras sensibles por defecto.
16. Toda feature sensible debe tener tests.
17. Todo cambio debe terminar con `npm run validate`.
18. No usar secretos reales.
19. No hardcodear credenciales.
20. No aplicar `npm audit fix --force` sin revision explicita.
21. Toda decision nueva debe documentarse en `docs/DECISIONS.md`.
22. Toda feature nueva debe actualizar documentacion relacionada.
23. No usar `any` salvo justificacion clara.
24. Mantener TypeScript estricto.
25. Mantener diseno mobile-first.
26. Mantener trazabilidad y auditoria para operaciones criticas.

## Combinaciones sugeridas

- Nueva pantalla no sensible: Frontend Agent + QA Agent.
- Nueva operacion sensible: Domain / Application Agent + Backend / Firebase Functions Agent + Security / Ciberseguridad Agent + QA Agent.
- Cambio en catalogo o seed: Data / Content Agent + Domain / Application Agent + Security / Ciberseguridad Agent + QA Agent.
- Cambio en Firestore Rules: Security / Ciberseguridad Agent + Backend / Firebase Functions Agent + QA Agent.
- Preparar deploy: Release / Operations Agent + Architect / DevOps Agent + Security / Ciberseguridad Agent + QA Agent.
- Cambiar roadmap o alcance: Product / Spec Agent + Architect / DevOps Agent si impacta arquitectura.

## Formato esperado de respuesta de Codex

Para tareas de implementacion:

1. Resumen de lo realizado.
2. Agentes/roles aplicados.
3. Archivos creados o modificados.
4. Decisiones tomadas.
5. Seguridad y arquitectura verificadas.
6. Tests o validaciones ejecutadas.
7. Riesgos pendientes.
8. Proximos pasos recomendados.

Para reviews:

1. Hallazgos ordenados por severidad.
2. Referencias a archivos y lineas.
3. Riesgos o gaps de tests.
4. Preguntas abiertas.
5. Resumen breve.

## Antes de tocar codigo

- Leer este archivo.
- Leer los documentos relevantes en `docs/`.
- Revisar `git status --short`.
- Confirmar que la tarea no viola reglas globales.
- Si hay cambios previos no relacionados, no revertirlos.

## Antes de terminar

- Actualizar documentacion si cambio una feature, regla, decision o flujo.
- Ejecutar `npm run validate`.
- Reportar cualquier warning relevante.
- No desplegar produccion sin aprobacion explicita.
