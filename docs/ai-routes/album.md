# Route - Album UI / pegar figuritas

## Leer

```txt
docs/FEATURE_SLICES.md
docs/ALBUM_UI.md
apps/web/src/features/album/
packages/contracts/src/
```

## Si cambia pegado o reglas sensibles

```txt
packages/domain/
packages/application/
apps/api/
functions/
packages/infra-firebase/
docs/SECURITY_SPEC.md
firestore.rules
```

## Skill blocks

- `albumsl-feature-slice`.
- `albumsl-frontend-ui`.
- `albumsl-firebase-backend`.
- `albumsl-security-review`.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm run test:unit
npm --workspace @albumsl/web run typecheck
```

Si cambia Rules:

```bash
npm run test:rules
```
