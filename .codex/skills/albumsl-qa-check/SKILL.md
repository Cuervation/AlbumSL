---
name: albumsl-qa-check
description: QA checklist for AlbumSL before commit or handoff. Use when validating changes, reviewing tests, checking edge cases, or ensuring npm run validate passes without breaking architecture or documentation.
---

# AlbumSL QA Check

Validar:

- Ejecutar `npm run validate`.
- Tests unitarios criticos para cambios sensibles.
- Casos borde y regresiones.
- Sin `any` salvo justificacion clara.
- TypeScript estricto sin errores.
- Arquitectura por capas intacta.
- Docs relacionadas actualizadas.
- Sin TODOs peligrosos o ambiguos.
- Sin secretos reales.
- Sin cambios de dependencias no justificados.

Reportar:

- Comandos ejecutados.
- Resultado de tests y validate.
- Warnings relevantes.
- Riesgos pendientes.
- Gaps de cobertura si no se agregaron tests.
