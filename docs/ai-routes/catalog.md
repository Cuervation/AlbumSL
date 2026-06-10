# Route - Catálogo / seed / contenido

## Leer

```txt
docs/STICKER_CATALOG.md
docs/FEATURE_SLICES.md
packages/domain/src/seed/
packages/domain/src/entities/
packages/infra-firebase/
```

## Leer solo si cambia UI

```txt
apps/web/src/features/sticker-catalog/
```

## Skill blocks

- `albumsl-feature-slice`.
- `albumsl-firebase-backend` si hay seed o infra Firebase.
- `albumsl-security-review`.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm run build:packages
npm run seed:stickers:dry-run
npm run test:unit
```
