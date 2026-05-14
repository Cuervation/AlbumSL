# AI Router - AlbumSL

## Objetivo

Este archivo define qué contexto leer según el tipo de tarea para reducir gasto de tokens.

Regla principal: leer solo lo necesario. Si una tarea es chica, no abrir documentación completa del proyecto.

## Siempre leer

```txt
AGENTS.md
docs/AI_ROUTER.md
git status --short
```

Además, leer los archivos directamente afectados por la tarea.

---

## UI simple

Ejemplos:

- Cambiar estilos.
- Ajustar layout.
- Arreglar un componente visual.
- Cambiar textos.
- Mejorar loading/error/empty states.

Leer:

```txt
apps/web/src/... archivos afectados
.codex/skills/albumsl-frontend-ui/SKILL.md si aplica
```

Leer solo si aplica:

```txt
docs/ALBUM_UI.md
docs/AUTH.md
docs/CONTRACTS.md
```

No leer por defecto:

```txt
docs/SECURITY_SPEC.md
docs/PACK_OPENING.md
docs/STICKER_CATALOG.md
functions/
packages/infra-firebase/
firestore.rules
```

Validación mínima recomendada:

```bash
npm --workspace @albumsl/web run typecheck
npm --workspace @albumsl/web run build
```

---

## Auth / login / sesión

Leer:

```txt
docs/AUTH.md
apps/web/src/features/auth/
packages/contracts/src/
```

Leer solo si cambia backend o claims:

```txt
docs/SECURITY_SPEC.md
apps/api/
functions/
packages/infra-firebase/
firestore.rules
```

Validación mínima recomendada:

```bash
npm --workspace @albumsl/web run typecheck
npm run test:unit
```

Si cambia seguridad o Rules:

```bash
npm run test:rules
```

---

## Album UI / pegar figuritas

Leer:

```txt
docs/FEATURE_SLICES.md
docs/ALBUM_UI.md
apps/web/src/features/album/
packages/contracts/src/
```

Si cambia pegado o reglas sensibles:

```txt
packages/domain/
packages/application/
apps/api/
functions/
packages/infra-firebase/
docs/SECURITY_SPEC.md
firestore.rules
```

Validación mínima recomendada:

```bash
npm run test:unit
npm --workspace @albumsl/web run typecheck
```

Si cambia Rules:

```bash
npm run test:rules
```

---

## Pack opening / daily pack

Ejemplos:

- Abrir sobre.
- Reclamar sobre diario.
- Asignación de figuritas.
- Inventario.
- Auditoría de apertura.

Leer:

```txt
docs/PACK_OPENING.md
docs/FEATURE_SLICES.md
docs/SECURITY_SPEC.md
packages/domain/
packages/application/
packages/contracts/
packages/infra-firebase/
apps/api/
functions/
firestore.rules
```

No resolver desde frontend lógica sensible.

Validación mínima recomendada:

```bash
npm run test:unit
npm run test:rules
npm run typecheck
```

Antes de cerrar una feature sensible:

```bash
npm run validate
```

---

## Firestore Rules / seguridad

Leer:

```txt
docs/SECURITY_SPEC.md
firestore.rules
tests/firestore/
packages/contracts/
packages/domain/
packages/application/
```

Leer solo si aplica:

```txt
apps/web/src/
apps/api/
functions/
packages/infra-firebase/
```

Validación mínima recomendada:

```bash
npm run test:rules
npm run test:unit
```

Antes de cerrar:

```bash
npm run validate
```

---

## Backend / API / Firebase Admin SDK

Leer:

```txt
apps/api/
packages/application/
packages/domain/
packages/contracts/
packages/infra-firebase/
docs/SECURITY_SPEC.md
```

Si toca Cloud Functions legacy/local:

```txt
functions/
docs/DEPLOYMENT.md
```

Validación mínima recomendada:

```bash
npm --workspace @albumsl/api run typecheck
npm run test:unit
```

Si toca Rules:

```bash
npm run test:rules
```

---

## Domain / Application

Leer:

```txt
packages/domain/
packages/application/
packages/contracts/
docs/FEATURE_SLICES.md
```

Leer solo si aplica:

```txt
docs/PACK_OPENING.md
docs/STICKER_CATALOG.md
docs/SECURITY_SPEC.md
```

No leer por defecto:

```txt
apps/web/
apps/api/
functions/
packages/infra-firebase/
```

Validación mínima recomendada:

```bash
npm run build:packages
npm run test:unit
```

---

## Catálogo / seed / contenido

Leer:

```txt
docs/STICKER_CATALOG.md
docs/FEATURE_SLICES.md
packages/domain/src/seed/
packages/domain/src/entities/
packages/infra-firebase/
```

Leer solo si cambia UI:

```txt
apps/web/src/features/sticker-catalog/
```

Validación mínima recomendada:

```bash
npm run build:packages
npm run seed:stickers:dry-run
npm run test:unit
```

---

## Docs only

Ejemplos:

- Actualizar README.
- Actualizar documentación técnica.
- Agregar decisión.
- Mejorar instrucciones.

Leer:

```txt
archivo docs afectado
AGENTS.md si cambia una regla global
docs/AI_ROUTER.md si cambia flujo de IA
```

No leer código salvo que la documentación dependa de detalles reales.

Validación mínima recomendada:

```bash
npm run format:check
```

No hace falta `npm run validate` completo salvo que el cambio toque scripts, config o reglas operativas críticas.

---

## DevOps / deploy dev

Leer:

```txt
docs/DEPLOYMENT.md
docs/LOCAL_DEVELOPMENT.md
docs/OPERATIONS.md
package.json
firebase.json
.firebaserc si existe localmente
.github/workflows/
```

Recordatorio:

- Dev es Spark-only.
- No deployar Functions reales en Firebase Spark.
- No tocar prod sin aprobación explícita.

Validación mínima recomendada:

```bash
npm run typecheck
npm run build
npm run format:check
```

Deploy dev seguro:

```bash
npm.cmd run deploy:dev
```

No usar salvo aprobación explícita:

```bash
npm.cmd run deploy:prod
npm.cmd run deploy:prod:functions
npm.cmd run deploy:prod:hosting
npm.cmd run deploy:prod:rules
```

---

## Gentle-AI / GGA

Leer:

```txt
.gga
.gga-rules.md
docs/GENTLE_AI.md
```

Regla:

- GGA debe revisar solo riesgos reales del diff.
- No usar `AGENTS.md` completo como rules file si alcanza con `.gga-rules.md`.

Validación mínima recomendada:

```bash
gga --help
git diff --check
```

---

## Cuando sí hacer análisis profundo

Hacer análisis profundo solo si el usuario pide explícitamente:

- auditoría completa
- rediseño de arquitectura
- investigación de bug complejo
- seguridad crítica
- cambio sensible de backend
- migración de infraestructura
- preparación de release importante

En esos casos se permite leer más documentación, pero siempre justificar brevemente qué se leyó y por qué.
