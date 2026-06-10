# AlbumSL Agents

## Objetivo

Kernel mínimo para trabajar con IA/Codex en AlbumSL sin gastar tokens de más.

Regla principal: usar el mínimo contexto necesario para la tarea. No leer más documentación de la necesaria si el cambio se resuelve con `docs/AI_ROUTER.md` y los archivos afectados.

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
4. No revertir cambios previos no relacionados.

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

## Protocolo mínimo

- Si hace falta delegar, seguir `docs/AI_ROUTER.md`.
- Leer solo los archivos/docs que correspondan según la tarea.
- Mantener este kernel como fuente de invariantes globales; los detalles de roles, selección de agentes, validación y rutas viven en el router y en los docs de agentes.
- Antes de commit, PR, handoff importante o deploy, ejecutar `npm run validate`; si no se ejecuta, informar la validación parcial y el motivo.
- Responder compacto: implementación = resumen, archivos, cambios, validación y riesgos; review = hallazgos por severidad, ubicación, riesgo y recomendación.
