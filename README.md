# AlbumSL

Album virtual de figuritas de San Lorenzo de Almagro.

## Requisitos previos

- Node.js 22 o superior.
- npm.
- Firebase CLI para Hosting, Firestore Rules/Indexes y emuladores.

## Instalacion

```bash
npm install
```

En PowerShell, si la politica local bloquea `npm.ps1`, usar:

```bash
npm.cmd install
```

## Estructura del monorepo

- `apps/web`: frontend React + Vite + TypeScript publicado en Firebase Hosting.
- `apps/api`: backend Node externo para Render.
- `functions`: adapter legacy/local con Firebase Cloud Functions; no se deploya en Spark-only.
- `packages/domain`: entidades y reglas puras del negocio.
- `packages/application`: casos de uso y puertos.
- `packages/contracts`: DTOs, tipos compartidos y errores compartidos.
- `packages/infra-firebase`: implementaciones concretas con Firebase Admin SDK y Firestore.
- `docs`: documentacion tecnica y de producto.

## Agentes operativos

`AGENTS.md` es el indice general de roles especializados para trabajar en el proyecto sin perder
reglas de arquitectura, seguridad y producto.

Los agentes especificos viven en `docs/agents/`:

- Product / Spec Agent
- Architect / DevOps Agent
- Frontend Agent
- Backend / Firebase Functions Agent
- Domain / Application Agent
- QA Agent
- Security / Ciberseguridad Agent
- Data / Content Agent
- Release / Operations Agent

En proximos prompts, se puede pedir que Codex actue como uno o varios agentes segun la tarea. No
hace falta activar todos siempre; elegir el conjunto minimo suficiente.

## Skills locales del proyecto

Las skills locales viven en `.codex/skills/` y resumen flujos repetidos de trabajo.

- `albumsl-compact-prompt`: respuestas compactas.
- `albumsl-feature-slice`: features por capas.
- `albumsl-security-review`: revision de seguridad.
- `albumsl-qa-check`: validacion antes de commit.
- `albumsl-firebase-backend`: Functions e infraestructura Firebase.
- `albumsl-frontend-ui`: UI React mobile-first.

En proximos prompts se pueden invocar por nombre, por ejemplo: "usa `albumsl-qa-check`".

## Comandos principales

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run typecheck
npm.cmd run validate
npm.cmd run format
npm.cmd run format:check
npm.cmd run seed:stickers:dry-run
npm.cmd run seed:stickers
```

## Correr frontend

```bash
npm.cmd run dev
```

Antes de levantar el frontend, crear `.env` local a partir de `.env.example` con las variables
`VITE_FIREBASE_*` del proyecto Firebase. Para emuladores, usar
`VITE_USE_FIREBASE_EMULATORS=true`.

Backend local esperado para operaciones sensibles:

```bash
VITE_ALBUMSL_API_BASE_URL=http://localhost:8081
```

Frontend dev publico usa Render:

```bash
VITE_ALBUMSL_API_BASE_URL=https://albumsl-api-dev.onrender.com
```

## Compilar functions

```bash
npm.cmd run build:functions
```

Las Cloud Functions no se deployan a Firebase real en Spark-only. El backend real dev corre en
Render.

## Seed del catalogo

```bash
npm.cmd run seed:stickers:dry-run
npm.cmd run seed:stickers
```

El seed usa Firebase Admin SDK desde `packages/infra-firebase`. Para proyecto real, configurar
`FIREBASE_PROJECT_ID` y credenciales Admin SDK. Para emulador, usar `FIRESTORE_EMULATOR_HOST`.

## Validar todo

```bash
npm.cmd run validate
```

## CI

GitHub Actions ejecuta `npm ci` y `npm run validate` en cada push o pull request a `master`.
El workflow valida typecheck, lint, tests, build y formato. No despliega a produccion.

## Deploy Manual

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para deploy manual Firebase dev. No hay deploy
automatico desde CI. Prod queda fuera del flujo actual.

Comandos Spark-safe dev:

```bash
npm.cmd run deploy:dev
npm.cmd run deploy:dev:hosting
npm.cmd run deploy:dev:rules
```

No usar en flujo dev actual:

```bash
npm.cmd run deploy:dev:functions
npm.cmd run deploy:prod
npm.cmd run deploy:prod:functions
npm.cmd run deploy:prod:hosting
npm.cmd run deploy:prod:rules
```

## Configurar Firebase local/aliases

1. Crear proyectos Firebase separados para dev y prod.
2. Completar `.env` a partir de `.env.example`.
3. Configurar `.firebaserc` localmente o en CI.
4. Revisar `firebase.json`, `firestore.rules` y `firestore.indexes.json`.
5. Habilitar Google como provider en Firebase Auth.
6. Usar emuladores antes de desplegar cambios sensibles.

## Notas de arquitectura

- Firebase es infraestructura inicial, no el centro del dominio.
- `packages/domain` no debe importar Firebase ni codigo de `functions`.
- `packages/application` depende de puertos/interfaces, no de implementaciones concretas.
- Las Cloud Functions, si se conservan, deben actuar como adaptadores delgados y no se deployan en Spark-only.
- Las operaciones sensibles pasan por backend Node externo en Render.
- El frontend no debe asignar figuritas ni escribir datos sensibles directamente.
- Backend Node usa Firebase Admin SDK y `uid` del ID token; no confia en `uid` del body.
- Firestore Rules bloquean escrituras sensibles directas del cliente.

## Dev actual

- Hosting dev: `https://albumsl-dev-cuervation.web.app`
- Backend Render dev: `https://albumsl-api-dev.onrender.com`
- Healthcheck: `https://albumsl-api-dev.onrender.com/api/health`
- Firebase real dev: Hosting, Auth Google, Firestore, Rules/Indexes.
- Backend Node real dev maneja `claimDailyPack`, `openPack` y `pasteSticker`.
- Firebase Cloud Functions no se deployan en Spark-only.
- Smoke autenticado completo queda pendiente.

## Admin dashboard

Admin dashboard queda diferido para despues del MVP jugable. `/admin` queda protegido y muestra
mensaje de backend pendiente.

Futuro correcto: `GET /api/admin/dashboard` en Backend Node, con Firebase ID token y custom claim
`admin == true` verificado server-side.

Para asignar o quitar custom claims admin de forma operativa, ver
[docs/ADMIN_CLAIMS.md](docs/ADMIN_CLAIMS.md).

## Operaciones

Ver [docs/OPERATIONS.md](docs/OPERATIONS.md) para logs seguros y troubleshooting de Render dev.

## Performance

Ver [docs/PERFORMANCE.md](docs/PERFORMANCE.md) para lazy routes, lecturas Firestore y cache inicial
del catalogo.
