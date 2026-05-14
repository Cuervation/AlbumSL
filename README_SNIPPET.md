# README snippet recomendado

Agregar esta sección al README.md, idealmente debajo de “Agentes operativos”.

```md
## Uso eficiente de IA / Codex

Para reducir gasto de tokens, el flujo recomendado es:

1. Leer `AGENTS.md`.
2. Leer `docs/AI_ROUTER.md`.
3. Activar solo los agentes necesarios.
4. Usar por defecto la skill `albumsl-compact-prompt`.
5. Leer solo los archivos afectados y la documentación indicada por el router.
6. Ejecutar validación mínima durante iteración.
7. Ejecutar `npm run validate` antes de commit, PR, handoff importante o deploy.

No hace falta leer toda la documentación para tareas chicas de UI, docs o fixes localizados.
```
