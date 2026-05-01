---
name: albumsl-compact-prompt
description: Compact response and execution style for AlbumSL. Use when the user asks to save tokens, be brief, avoid repeating documented context, or produce concise implementation summaries while preserving exact code, commands, paths, errors, and technical accuracy.
---

# AlbumSL Compact Prompt

- Responder breve y directo.
- No repetir contexto que ya este en `AGENTS.md` o `docs/`.
- Leer solo los archivos necesarios para la tarea.
- Devolver cambios en formato compacto: archivos, resumen, validacion, riesgos.
- No recortar codigo, comandos, rutas, errores ni resultados importantes.
- Mantener precision tecnica aunque la respuesta sea corta.
- Si hay riesgo de ambiguedad, priorizar claridad sobre brevedad.
- No ocultar warnings, fallos de validacion ni riesgos relevantes.
