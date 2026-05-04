# Deployment

## Objetivo

Preparar deploy manual a Firebase para ambientes `dev` y `prod`.

No hay CD automatico. CI solo valida. Produccion requiere aprobacion humana.
Este repo queda en Firebase Spark-only para deploy real: hosting + Firestore Rules/Indexes.
Cloud Functions quedan fuera del deploy real porque requieren Blaze.

## Proyectos Firebase Recomendados

- `dev`: pruebas internas, emulador/proyecto no productivo.
- `prod`: usuarios reales.

Usar proyectos Firebase separados. No reutilizar credenciales ni bases entre ambientes.

## Config Firebase Actual

- Hosting publica `apps/web/dist`.
- Functions usa source `functions`.
- Firestore usa `firestore.rules`.
- Indices usan `firestore.indexes.json`.
- Emulators configurados: Auth, Functions, Firestore, Hosting y UI.

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
```

`GOOGLE_APPLICATION_CREDENTIALS` debe apuntar a un archivo fuera del repo.

El backend Node externo usa Firebase Admin SDK para acciones sensibles. Deployarlo fuera de Firebase
Functions en Spark-only y configurar ahi `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT` y credenciales
seguras del proveedor.

## Backend Node Dev En Render

Objetivo PR 14: preparar deploy dev del backend Node externo en Render. No deployar desde Codex si
requiere credenciales externas o UI.

Crear un Web Service manual en Render:

| Campo             | Valor                                              |
| ----------------- | -------------------------------------------------- |
| Service type      | Web Service                                        |
| Runtime           | Node                                               |
| Branch            | `master`                                           |
| Build Command     | `npm ci && npm --workspace @albumsl/api run build` |
| Start Command     | `node apps/api/dist/main.js`                       |
| Health Check Path | `/api/health`                                      |

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
https://<backend-dev>.onrender.com/api/health
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

PR 15 conectara el frontend dev publico con `VITE_ALBUMSL_API_BASE_URL` apuntando al backend Render.
Hasta entonces, no cambiar Hosting dev para consumir el backend publico por defecto.

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

```bash
npm run validate
```

Deploy Spark-safe:

```bash
npm run deploy:dev
```

Equivale a:

```bash
npm run deploy:dev:spark
```

Solo hosting:

```bash
npm run deploy:dev:hosting
```

Solo functions:

```bash
npm run deploy:dev:functions
```

No usar en Spark-only. Este script requiere Blaze y no es parte del flujo de deploy real del repo.

Solo Firestore Rules/Indexes:

```bash
npm run deploy:dev:rules
```

## Deploy Manual A Prod

Requiere aprobacion humana antes de correr.
En este repo, no usar deploy prod salvo decision manual explicita fuera del flujo Spark-only.

Checklist minimo:

- `npm run validate` OK.
- Deploy dev probado.
- `.env` prod correcto.
- Firebase alias `prod` apunta al proyecto correcto.
- No hay service accounts dentro del repo.
- Admin claims revisados.

Deploy completo:

```bash
npm run deploy:prod
```

Solo hosting:

```bash
npm run deploy:prod:hosting
```

Solo functions:

```bash
npm run deploy:prod:functions
```

Solo Firestore Rules/Indexes:

```bash
npm run deploy:prod:rules
```

## Seed De Stickers En Dev

Configurar proyecto/credenciales dev:

```bash
$env:FIREBASE_PROJECT_ID = "DEV_PROJECT_ID"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\path\\outside\\repo\\service-account.json"
```

Dry-run:

```bash
npm run seed:stickers:dry-run
```

Seed real:

```bash
npm run seed:stickers
```

No correr seed real en prod sin aprobacion explicita.

## Custom Claims Admin

Asignar/quitar admins con script existente:

```bash
npm run admin:claim:dry-run -- --uid USER_UID --admin true
npm run admin:claim -- --uid USER_UID --admin true --confirm
```

Ver `docs/ADMIN_CLAIMS.md`.

## Rollback Basico

Hosting:

- Firebase Console > Hosting > Release history > Roll back.

Functions:

- Re-deploy de commit estable.
- Revisar logs en Firebase Console/Google Cloud Logging.

Firestore Rules:

- Revertir `firestore.rules` o `firestore.indexes.json`.
- Re-deploy:

```bash
npm run deploy:dev:rules
npm run deploy:prod:rules
```

## Seguridad

- No commitear service accounts.
- No commitear `.env`.
- No commitear `.firebaserc` con IDs reales sin decision explicita.
- Produccion requiere aprobacion manual.
- CI no despliega.
- Usar `GOOGLE_APPLICATION_CREDENTIALS` solo local/CI seguro y fuera del repo.
