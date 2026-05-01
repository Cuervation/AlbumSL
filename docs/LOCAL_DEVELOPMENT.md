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
