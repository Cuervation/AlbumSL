# Local Development

## Arquitectura dev actual

Flujo real de dev:

- React + Vite corre en Firebase Hosting o Vite local.
- Firebase real dev usa Hosting, Auth Google, Firestore y Firestore Rules/Indexes.
- Backend Node externo corre en Render: `https://albumsl-api-dev.onrender.com`.
- Backend Node usa Firebase Admin SDK y service account fuera del repo.
- Operaciones sensibles pasan por backend Node: `claimDailyPack`, `openPack` y `pasteSticker`.
- Dashboard admin queda diferido; `/admin` muestra backend pendiente.
- Firestore Rules bloquean escrituras sensibles directas desde cliente.
- Cloud Functions no se deployan a Firebase real en Spark-only.

Ambientes dev actuales:

- Hosting dev: `https://albumsl-dev-cuervation.web.app`
- Backend dev: `https://albumsl-api-dev.onrender.com`
- Healthcheck backend: `https://albumsl-api-dev.onrender.com/api/health`

## Instalar dependencias

Desde la raiz del repo:

```bash
npm install
```

Si PowerShell bloquea `npm.ps1`, usar:

```bash
npm.cmd install
```

## Correr validaciones

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run test:rules
npm.cmd run build
npm.cmd run validate
```

`npm.cmd run validate` ejecuta typecheck, lint, tests, build y chequeo de formato.

## Tests de Firestore Rules

```powershell
npm.cmd run test:rules
```

El comando usa `firebase emulators:exec` con Firestore Emulator y
`@firebase/rules-unit-testing`. No requiere secretos reales ni proyecto Firebase productivo.

Cubre:

- ownership de `users`, `userAlbums`, `userStickers`, `packClaims` y `packOpenings`
- lectura admin con custom claim `admin == true`
- lectura de stickers activos e inactivos segun permisos
- bloqueo de escrituras cliente sobre datos sensibles
- lectura/escritura de `auditLogs`
- lectura de `system/config`
- default deny para paths no modelados

## CI

- Validacion local: `npm.cmd run validate`.
- Validacion CI: GitHub Actions ejecuta `npm ci` y `npm run validate` en push/PR a `master`.
- El CI no despliega a produccion.

## Deploy manual

Ver `docs/DEPLOYMENT.md` para deploy manual Firebase dev. Prod queda fuera del flujo actual.

Los scripts usan aliases `dev` y `prod` de Firebase CLI. No commitear `.firebaserc` con IDs reales
sin decision explicita.

Flujo Spark-only recomendado:

- `npm.cmd run deploy:dev`
- `npm.cmd run deploy:dev:rules`
- `npm.cmd run deploy:dev:hosting`

No usar en Spark-only:

- `npm.cmd run deploy:dev:functions`
- `npm.cmd run deploy:prod`
- `npm.cmd run deploy:prod:functions`
- `npm.cmd run deploy:prod:hosting`
- `npm.cmd run deploy:prod:rules`

Ese flujo queda bloqueado hasta decision manual explicita. No tocar prod desde runbook dev.

## Flujo de trabajo con agentes

Antes de pedir o implementar cambios, revisar `AGENTS.md` y elegir solo los roles necesarios para
la tarea.

Los agentes especificos estan en `docs/agents/`.

Las skills locales estan en `.codex/skills/` y se pueden invocar por nombre para ahorrar contexto:
`albumsl-compact-prompt`, `albumsl-feature-slice`, `albumsl-security-review`,
`albumsl-qa-check`, `albumsl-firebase-backend` y `albumsl-frontend-ui`.

Ejemplos:

- UI no sensible: Frontend Agent + QA Agent.
- Operacion sensible: Domain / Application Agent + Backend / Firebase Functions Agent + Security / Ciberseguridad Agent + QA Agent.
- Catalogo o seed: Data / Content Agent + Domain / Application Agent + QA Agent.
- Deploy: Release / Operations Agent + Architect / DevOps Agent + Security / Ciberseguridad Agent.

Aunque la tarea sea solo documental, cerrar con `npm.cmd run validate` para verificar que el repo sigue
consistente.

## Correr el frontend

```powershell
npm.cmd run dev
```

El comando levanta `apps/web` con Vite.

Para que Firebase Auth funcione, crear `.env` local con:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
VITE_ALBUMSL_API_BASE_URL=http://localhost:8081
```

Tambien hay que habilitar Google como provider en Firebase Auth.

## Correr backend Node local

El backend Node externo se usa para acciones sensibles que no deben ejecutarse directo desde el
frontend. Para dev con Firebase real dev:

```powershell
$env:FIREBASE_PROJECT_ID = "albumsl-dev-cuervation"
$env:GCLOUD_PROJECT = "albumsl-dev-cuervation"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\FirebaseKeys\albumsl-dev-cuervation-adminsdk.json"
$env:ALBUMSL_ALLOWED_ORIGINS = "http://localhost:5173"
$env:PORT = "8081"
npm.cmd --workspace @albumsl/api run build
node apps/api/dist/main.js
```

No guardar ni commitear el JSON de service account.
`PORT` lo lee el backend desde `process.env.PORT`; Render lo inyecta automaticamente.
`ALBUMSL_ALLOWED_ORIGINS` controla CORS. Para dev local, incluir `http://localhost:5173`.

El backend local expone:

- `GET /api/health`
- `POST /api/packs/claim-daily`
- `POST /api/packs/open`
- `POST /api/stickers/paste`

No expone dashboard admin en PR19. La implementacion futura debe ser
`GET /api/admin/dashboard` con custom claim `admin == true`.

Todos los endpoints sensibles usan `Authorization: Bearer <Firebase ID token>` y el backend toma la
identidad desde el token, no desde el body.

## Frontend dev publico

Para compilar Hosting dev contra Render dev, `.env` local debe usar:

```bash
VITE_ALBUMSL_API_BASE_URL=https://albumsl-api-dev.onrender.com
```

Build:

```powershell
npm.cmd run build:web
```

Verificar bundle:

- contiene `albumsl-api-dev.onrender.com`
- no contiene `localhost:8081` como API base

Deploy Hosting dev:

```powershell
npm.cmd run deploy:dev:hosting
```

No deployar Functions.

## Compilar functions

```powershell
npm.cmd run build:functions
```

Las functions viven en `functions/` y deben mantenerse como adapters delgados que llaman a
`packages/application`.
En Spark-only, `functions` se compila localmente pero no se despliega a Firebase real.

## Seed del catalogo de figuritas

Dry-run:

```powershell
npm.cmd run seed:stickers:dry-run
```

Seed real:

```powershell
npm.cmd run seed:stickers
```

Para emulador local:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:FIREBASE_PROJECT_ID = "albumsl-local"
npm.cmd run seed:stickers:dry-run
```

Para un proyecto Firebase real, configurar `FIREBASE_PROJECT_ID` y credenciales Admin SDK, por
ejemplo con `GOOGLE_APPLICATION_CREDENTIALS`.

El seed valida el catalogo antes de escribir, es idempotente y no borra figuritas que no esten en
el dataset.

## Admin custom claims

Dry-run:

```powershell
npm.cmd run admin:claim:dry-run -- --uid USER_UID --admin true
```

Cambio real con confirmacion:

```powershell
npm.cmd run admin:claim -- --uid USER_UID --admin true --confirm
npm.cmd run admin:claim -- --uid USER_UID --admin false --confirm
```

Requiere `FIREBASE_PROJECT_ID` o `GCLOUD_PROJECT` y credenciales Admin SDK, por ejemplo
`GOOGLE_APPLICATION_CREDENTIALS`. Ver `docs/ADMIN_CLAIMS.md`.

## Firebase local futuro

Cuando Firebase quede configurado:

```bash
firebase emulators:start
```

Emuladores previstos:

- Auth
- Functions
- Firestore
- Hosting
- Emulator UI

Antes de usar emuladores hay que configurar el proyecto Firebase y revisar `.firebaserc`.

## Probar claim diario, apertura y pegado

Flujo local con backend Node:

```powershell
$env:FIREBASE_PROJECT_ID = "albumsl-dev-cuervation"
$env:GCLOUD_PROJECT = "albumsl-dev-cuervation"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\FirebaseKeys\albumsl-dev-cuervation-adminsdk.json"
$env:ALBUMSL_ALLOWED_ORIGINS = "http://localhost:5173"
$env:PORT = "8081"
npm.cmd --workspace @albumsl/api run build
node apps/api/dist/main.js
```

En otra terminal:

```powershell
$env:VITE_ALBUMSL_API_BASE_URL = "http://localhost:8081"
npm.cmd run dev
```

Luego iniciar sesion en el frontend e ir a `/open-pack`.

La UI usa backend para operaciones sensibles:

- `claimDailyPack`: backend Node externo (`POST /api/packs/claim-daily`)
- `openPack`: backend Node externo (`POST /api/packs/open`)
- `pasteSticker`: backend Node externo (`POST /api/stickers/paste`)

El frontend no escribe `packClaims`, `packOpenings`, `userStickers`, `userAlbums` ni `auditLogs`
directamente.

Para usar emuladores desde el frontend, configurar:

```bash
VITE_USE_FIREBASE_EMULATORS=true
VITE_ALBUMSL_API_BASE_URL=http://localhost:8081
```

Para probar el flujo:

- Terminal 1: correr `apps/api` en `PORT=8081` con credenciales Admin SDK fuera del repo.
- Terminal 2: correr `npm.cmd run dev` con `VITE_ALBUMSL_API_BASE_URL=http://localhost:8081`.
- Iniciar sesion con Google, ir a `/open-pack`, reclamar y abrir sobre.
- Ir a `/album`, abrir detalle de una figurita obtenida y pegarla.
- En Network deben verse requests al backend Node. No imprimir tokens.

## Probar CORS con backend dev publico

Hosting dev ya apunta al backend Render dev. Smoke autenticado completo queda pendiente para PR
futuro.

Validar en Network:

- `Origin`: `https://albumsl-dev-cuervation.web.app`
- respuesta con `Access-Control-Allow-Origin: https://albumsl-dev-cuervation.web.app`
- preflight `OPTIONS` con `Access-Control-Allow-Headers: Authorization, Content-Type`
- ningun token ni JSON de service account impreso en consola

## Smoke test pendiente

Pendiente para otro momento:

- login Google
- `claimDailyPack`
- `openPack`
- ver figuritas obtenidas
- `/album`
- `pasteSticker`
- `/duplicates`
- logout/login
- persistencia
- revisar Console sin errores graves
- revisar Network sin `localhost`, sin 500 y con CORS OK
- revisar Render logs sin tokens ni service account

## Probar UI del album

Con el frontend corriendo:

```powershell
npm.cmd run dev
```

Rutas protegidas principales:

- `/album`: album, progreso, filtros y busqueda
- `/album/:stickerId`: detalle de figurita y boton para pegar si hay cantidad disponible
- `/duplicates`: copias disponibles/repetidas

Para que haya datos utiles:

- autenticar con Google o emulador de Auth
- cargar catalogo con `npm.cmd run seed:stickers`
- reclamar y abrir un sobre desde `/open-pack` mediante backend Node

La accion de pegar llama `POST /api/stickers/paste`. El frontend no escribe directo en
`userStickers` ni en `userAlbums`.

## Variables de entorno

Usar `.env.example` como guia y crear `.env` local sin commitearlo.

No guardar secretos reales en el repo.
