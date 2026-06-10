# Route - Firestore Rules / seguridad

## Leer

```txt
docs/SECURITY_SPEC.md
firestore.rules
tests/firestore/
packages/contracts/
packages/domain/
packages/application/
```

## Leer solo si aplica

```txt
apps/web/src/
apps/api/
functions/
packages/infra-firebase/
```

## Skill blocks

- `albumsl-security-review`.
- `albumsl-firebase-backend` si hay backend o infra Firebase.
- `albumsl-qa-check`.

## Validación mínima recomendada

```bash
npm run test:rules
npm run test:unit
```

Antes de cerrar:

```bash
npm run validate
```
