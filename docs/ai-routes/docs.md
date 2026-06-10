# Route - Docs only

## Ejemplos

- Actualizar README.
- Actualizar documentación técnica.
- Agregar decisión.
- Mejorar instrucciones.

## Leer

```txt
archivo docs afectado
AGENTS.md si cambia una regla global
docs/AI_ROUTER.md si cambia flujo de IA
```

## Regla

No leer código salvo que la documentación dependa de detalles reales.

## Skill blocks

- `cognitive-doc-design`.
- `albumsl-compact-prompt`.

## Validación mínima recomendada

```bash
npm run format:check
```

No hace falta `npm run validate` completo salvo que el cambio toque scripts, config o reglas operativas críticas.
