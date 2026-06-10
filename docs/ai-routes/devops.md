# Route - DevOps / deploy dev

## Leer

```txt
docs/DEPLOYMENT.md
docs/LOCAL_DEVELOPMENT.md
docs/OPERATIONS.md
package.json
firebase.json
.firebaserc si existe localmente
.github/workflows/
```

## Recordatorio

- Dev es Spark-only.
- No deployar Functions reales en Firebase Spark.
- No tocar prod sin aprobación explícita.

## Skill blocks

- `albumsl-firebase-backend`.
- `albumsl-qa-check`.

## Validación mínima recomendada

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
