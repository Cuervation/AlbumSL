# Deployment

## Objetivo

Preparar deploy manual a Firebase dev y documentar backend Node externo en Render.

No hay CD automatico. CI solo valida. Produccion requiere aprobacion humana.
Este repo queda en Firebase Spark-only para deploy real: Hosting + Firestore Rules/Indexes.
Cloud Functions no se deployan a Firebase real porque requieren Blaze.

## Proyectos Firebase Recomendados

- `dev`: pruebas internas, emulador/proyecto no productivo.
- `prod`: usuarios reales.

Usar proyectos Firebase separados. No reutilizar credenciales ni bases entre ambientes.

## Arquitectura Dev Actual

- React + Vite se publica en Firebase Hosting dev.
- Firebase Auth Google autentica usuarios.
- Firestore guarda catalogo, perfiles, claims, aperturas, inventario y album.
- Firestore Rules/Indexes se deployan a Firebase dev.
- Backend Node corre como Web Service en Render dev: `https://albumsl-api-dev.onrender.com`.
- Backend Node usa Firebase Admin SDK con service account como Secret File.
- `claimDailyPack`, `openPack` y `pasteSticker` pasan por backend Node.
- Cloud Functions pueden compilarse localmente, pero no se deployan en Spark-only.

## Config Firebase Actual

- Hosting publica `apps/web/dist`.
- Firestore usa `firestore.rules`.
- Indices usan `firestore.indexes.json`.
- Emulators configurados: Auth, Functions, Firestore, Hosting y UI.
- Functions existe como adapter legacy/local, no como deploy real.

## Variables Frontend

Crear `.env` local desde `.env.example`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
VITE_ALBUMSL_API_BASE_URL=
```

No commitear `.env`.

`VITE_ALBUMSL_API_BASE_URL` es publica y debe apuntar al backend Node externo del ambiente. No poner
secretos en variables `VITE_*`.

## Variables Backend/Admin

```bash
FIREBASE_PROJECT_ID=
GCLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
FIRESTORE_EMULATOR_HOST=
ALBUMSL_ALLOWED_ORIGINS=
PORT=
```

`GOOGLE_APPLICATION_CREDENTIALS` debe apuntar a un archivo fuera del repo.

El backend Node externo usa Firebase Admin SDK para acciones sensibles. Deployarlo fuera de Firebase
Functions en Spark-only y configurar ahi `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT` y credenciales
seguras del proveedor.

## Backend Node Dev En Render

Backend dev actual: `https://albumsl-api-dev.onrender.com`.

Crear un Web Service manual en Render:

| Campo             | Valor                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Service type      | Web Service                                                                  |
| Runtime           | Node                                                                         |
| Branch            | `master`                                                                     |
| Build Command     | `npm ci && npm run build:packages && npm --workspace @albumsl/api run build` |
| Start Command     | `node apps/api/dist/main.js`                                                 |
| Health Check Path | `/api/health`                                                                |

Render inyecta `PORT`; no hardcodearlo. El backend ya escucha `process.env.PORT` y usa `8081` solo
como fallback local.

Variables de entorno dev:

```bash
NODE_VERSION=22
FIREBASE_PROJECT_ID=albumsl-dev-cuervation
GCLOUD_PROJECT=albumsl-dev-cuervation
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/albumsl-dev-cuervation-adminsdk.json
ALBUMSL_ALLOWED_ORIGINS=https://albumsl-dev-cuervation.web.app,http://localhost:5173
```

No configurar `PORT` manualmente en Render.

Service account:

- cargar el JSON de Firebase Admin SDK como Render Secret File
- filename: `albumsl-dev-cuervation-adminsdk.json`
- runtime path: `/etc/secrets/albumsl-dev-cuervation-adminsdk.json`
- no commitear el JSON
- no pegar ni imprimir su contenido
- no agregar secretos a `render.yaml`

Healthcheck esperado:

```bash
https://albumsl-api-dev.onrender.com/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "service": "albumsl-api"
}
```

Smoke CORS desde Hosting dev:

- `Origin` permitido: `https://albumsl-dev-cuervation.web.app`
- headers permitidos: `Authorization, Content-Type`
- metodos permitidos: `GET, POST, OPTIONS`
- no usar wildcard `*` con `Authorization`
- si se prueba desde local, conservar `http://localhost:5173` en `ALBUMSL_ALLOWED_ORIGINS`

El frontend dev publico usa:

```bash
VITE_ALBUMSL_API_BASE_URL=https://albumsl-api-dev.onrender.com
```

Antes de deployar Hosting dev:

- `npm.cmd run build:web`
- verificar bundle con `albumsl-api-dev.onrender.com`
- verificar bundle sin `localhost:8081` como API base

## `.firebaserc` Local

Crear localmente:

```bash
firebase use --add
```

Configurar aliases:

```bash
firebase use --add DEV_PROJECT_ID
firebase use --add PROD_PROJECT_ID
```

Aliases esperados por scripts:

```json
{
  "projects": {
    "dev": "DEV_PROJECT_ID",
    "prod": "PROD_PROJECT_ID"
  }
}
```

No commitear `.firebaserc` con IDs reales salvo decision explicita.

## Firebase CLI

Login:

```bash
firebase login
```

Ver proyectos:

```bash
firebase projects:list
```

Ver alias activo:

```bash
firebase use
```

## Deploy Manual A Dev

Validar primero:

```powershell
npm.cmd run validate
```

Deploy Spark-safe:

```powershell
npm.cmd run deploy:dev
```

Equivale a:

```powershell
npm.cmd run deploy:dev:spark
```

Solo hosting:

```powershell
npm.cmd run deploy:dev:hosting
```

Solo functions:

```powershell
npm.cmd run deploy:dev:functions
```

No usar en Spark-only. Este script requiere Blaze y no es parte del flujo de deploy real del repo.

Solo Firestore Rules/Indexes:

```powershell
npm.cmd run deploy:dev:rules
```

## Comandos que no se usan en flujo dev Spark-only

No correr:

```powershell
npm.cmd run deploy:dev:functions
npm.cmd run deploy:prod
npm.cmd run deploy:prod:functions
npm.cmd run deploy:prod:hosting
npm.cmd run deploy:prod:rules
```

No tocar prod sin aprobacion humana explicita.

## Prod

Prod queda fuera del flujo PR17.

No ejecutar comandos prod desde este runbook. Si alguna vez se habilita prod, requiere una decision
operativa nueva, checklist dedicado, aprobacion humana explicita y runbook separado.

Comandos bloqueados en flujo dev actual:

- `npm.cmd run deploy:prod`
- `npm.cmd run deploy:prod:functions`
- `npm.cmd run deploy:prod:hosting`
- `npm.cmd run deploy:prod:rules`

## Seed De Stickers En Dev

Configurar proyecto/credenciales dev:

```bash
$env:FIREBASE_PROJECT_ID = "DEV_PROJECT_ID"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\path\\outside\\repo\\service-account.json"
```

Dry-run:

```powershell
npm.cmd run seed:stickers:dry-run
```

Seed real:

```powershell
npm.cmd run seed:stickers
```

No correr seed real en prod sin aprobacion explicita.

## Custom Claims Admin

Asignar/quitar admins con script existente:

```powershell
npm.cmd run admin:claim:dry-run -- --uid USER_UID --admin true
npm.cmd run admin:claim -- --uid USER_UID --admin true --confirm
```

Ver `docs/ADMIN_CLAIMS.md`.

## Rollback Basico

Hosting:

- Firebase Console > Hosting > Release history > Roll back.

Functions:

- No aplica al flujo real Spark-only; no se deployan Cloud Functions.
- Si se mantiene codigo `functions`, usar solo build/tests/local emulator.

Firestore Rules:

- Revertir `firestore.rules` o `firestore.indexes.json`.
- Re-deploy:

```bash
npm.cmd run deploy:dev:rules
```

Prod rules requiere aprobacion explicita antes de ejecutar cualquier comando.

## Smoke test pendiente

Smoke autenticado completo pendiente:

- abrir `https://albumsl-dev-cuervation.web.app`
- login Google
- reclamar sobre diario (`POST /api/packs/claim-daily`)
- abrir sobre (`POST /api/packs/open`)
- ver figuritas obtenidas
- ir a `/album`
- pegar figurita (`POST /api/stickers/paste`)
- ir a `/duplicates`
- logout/login
- confirmar persistencia
- revisar Console sin errores graves
- revisar Network sin `localhost`, CORS OK, sin 500
- revisar Render logs sin tokens ni service account

## Seguridad

- No commitear service accounts.
- No commitear `.env`.
- No commitear `.firebaserc` con IDs reales sin decision explicita.
- Produccion requiere aprobacion manual.
- CI no despliega.
- Usar `GOOGLE_APPLICATION_CREDENTIALS` solo local/CI seguro y fuera del repo.
- Render dev usa Secret File para service account.
- No usar wildcard `*` en CORS con endpoints que reciben `Authorization`.
- No imprimir tokens, cookies, service accounts ni payloads sensibles en logs.
