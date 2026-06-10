# Route - Auth / login / sesión

## Leer

```txt
docs/AUTH.md
apps/web/src/features/auth/
packages/contracts/src/
```

## Leer solo si cambia backend o claims

```txt
docs/SECURITY_SPEC.md
apps/api/
functions/
packages/infra-firebase/
firestore.rules
```

## Skill blocks

- `albumsl-frontend-ui`.
- `albumsl-firebase-backend`.
- `albumsl-security-review`.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm --workspace @albumsl/web run typecheck
npm run test:unit
```

Si cambia seguridad o Rules:

```bash
npm run test:rules
```
