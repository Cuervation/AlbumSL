# Route - Backend / API / Firebase Admin SDK

## Leer

```txt
apps/api/
packages/application/
packages/domain/
packages/contracts/
packages/infra-firebase/
docs/SECURITY_SPEC.md
```

## Si toca Cloud Functions legacy/local

```txt
functions/
docs/DEPLOYMENT.md
```

## Skill blocks

- `albumsl-firebase-backend`.
- `albumsl-security-review`.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm --workspace @albumsl/api run typecheck
npm run test:unit
```

Si toca Rules:

```bash
npm run test:rules
```
