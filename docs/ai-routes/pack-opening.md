# Route - Pack opening / daily pack

## Ejemplos

- Abrir sobre.
- Reclamar sobre diario.
- Asignación de figuritas.
- Inventario.
- Auditoría de apertura.

## Leer

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

## Regla

No resolver desde frontend lógica sensible.

## Skill blocks

- `albumsl-feature-slice`.
- `albumsl-firebase-backend`.
- `albumsl-security-review`.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm run test:unit
npm run test:rules
npm run typecheck
```

Antes de cerrar una feature sensible:

```bash
npm run validate
```
