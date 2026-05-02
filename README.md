# AlbumSL

Album virtual de figuritas de San Lorenzo de Almagro.

## Requisitos previos

- Node.js 22 o superior.
- npm.
- Firebase CLI, cuando se configure Firebase.

## Instalacion

```bash
npm install
```

En PowerShell, si la politica local bloquea `npm.ps1`, usar:

```bash
npm.cmd install
```

## Estructura del monorepo

- `apps/web`: frontend React + Vite + TypeScript.
- `functions`: adapter serverless inicial con Firebase Cloud Functions.
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
npm run dev
npm run build
npm run lint
npm run test
npm run typecheck
npm run validate
npm run format
npm run format:check
npm run seed:stickers:dry-run
npm run seed:stickers
```

## Correr frontend

```bash
npm run dev
```

Antes de levantar el frontend, crear `.env` local a partir de `.env.example` con las variables
`VITE_FIREBASE_*` del proyecto Firebase. Para emuladores, usar
`VITE_USE_FIREBASE_EMULATORS=true`.

## Compilar functions

```bash
npm run build:functions
```

## Seed del catalogo

```bash
npm run seed:stickers:dry-run
npm run seed:stickers
```

El seed usa Firebase Admin SDK desde `packages/infra-firebase`. Para proyecto real, configurar
`FIREBASE_PROJECT_ID` y credenciales Admin SDK. Para emulador, usar `FIRESTORE_EMULATOR_HOST`.

## Validar todo

```bash
npm run validate
```

## CI

GitHub Actions ejecuta `npm ci` y `npm run validate` en cada push o pull request a `master`.
El workflow valida typecheck, lint, tests, build y formato. No despliega a produccion.

## Deploy Manual

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para deploy manual Firebase dev/prod. No hay deploy
automatico desde CI.

## Configurar Firebase mas adelante

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
- Las Cloud Functions deben actuar como adaptadores delgados.
- Las operaciones sensibles deben pasar por backend.
- El frontend no debe asignar figuritas ni escribir datos sensibles directamente.

## Admin MVP

Ver [docs/ADMIN.md](docs/ADMIN.md) para el panel admin solo lectura protegido por custom claim
`admin == true`.

Para asignar o quitar custom claims admin de forma operativa, ver
[docs/ADMIN_CLAIMS.md](docs/ADMIN_CLAIMS.md).

## Operaciones

Ver [docs/OPERATIONS.md](docs/OPERATIONS.md) para logs seguros, eventos observados y
troubleshooting basico de Cloud Functions.

## Performance

Ver [docs/PERFORMANCE.md](docs/PERFORMANCE.md) para lazy routes, lecturas Firestore y cache inicial
del catalogo.
