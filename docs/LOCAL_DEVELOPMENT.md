# Local Development

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

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run validate
```

`npm run validate` ejecuta typecheck, lint, tests, build y chequeo de formato.

## CI

- Validacion local: `npm run validate`.
- Validacion CI: GitHub Actions ejecuta `npm ci` y `npm run validate` en push/PR a `master`.
- El CI no despliega a produccion.

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

Aunque la tarea sea solo documental, cerrar con `npm run validate` para verificar que el repo sigue
consistente.

## Correr el frontend

```bash
npm run dev
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
```

Tambien hay que habilitar Google como provider en Firebase Auth.

## Compilar functions

```bash
npm run build:functions
```

Las functions viven en `functions/` y deben mantenerse como adapters delgados que llaman a
`packages/application`.

## Seed del catalogo de figuritas

Dry-run:

```bash
npm run seed:stickers:dry-run
```

Seed real:

```bash
npm run seed:stickers
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

## Probar claim diario y apertura

Flujo local recomendado:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:FIREBASE_PROJECT_ID = "albumsl-local"
firebase emulators:start
```

En otra terminal:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:FIREBASE_PROJECT_ID = "albumsl-local"
npm.cmd run seed:stickers
npm.cmd run dev
```

Luego iniciar sesion en el frontend e ir a `/open-pack`.

La UI llama callables:

- `claimDailyPack`
- `openPack`

El frontend no escribe `packClaims`, `packOpenings`, `userStickers`, `userAlbums` ni `auditLogs`
directamente.

Para usar emuladores desde el frontend, configurar:

```bash
VITE_USE_FIREBASE_EMULATORS=true
```

## Probar UI del album

Con el frontend corriendo:

```bash
npm run dev
```

Rutas protegidas principales:

- `/album`: album, progreso, filtros y busqueda
- `/album/:stickerId`: detalle de figurita y boton para pegar si hay cantidad disponible
- `/duplicates`: copias disponibles/repetidas

Para que haya datos utiles:

- autenticar con Google o emulador de Auth
- cargar catalogo con `npm run seed:stickers`
- reclamar y abrir un sobre desde `/open-pack`

La accion de pegar llama la callable `pasteSticker`. El frontend no escribe directo en
`userStickers` ni en `userAlbums`.

## Tests futuros de Firestore Rules

Todavia no hay setup automatizado para testear `firestore.rules`.

TODO:

- instalar y configurar `@firebase/rules-unit-testing`
- levantar Firebase Emulator Suite en CI
- cubrir lectura/escritura de `users`, `stickers`, `userStickers`, `packClaims`, `packOpenings`, `auditLogs` y `system/config`
- probar que un usuario no puede leer ni escribir datos de otro usuario
- probar que escrituras sensibles quedan denegadas desde cliente

## Variables de entorno

Usar `.env.example` como guia y crear `.env` local sin commitearlo.

No guardar secretos reales en el repo.
