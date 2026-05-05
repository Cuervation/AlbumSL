# Admin Claims

## Objetivo

Definir el flujo operativo seguro para asignar o quitar el custom claim `admin` de Firebase Auth.

## `users/{uid}.role` vs Custom Claim

- `users/{uid}.role` puede usarse solo para UI o metadata visible.
- La seguridad real usa `request.auth.token.admin == true`.
- Firestore Rules y Cloud Functions no deben confiar en `users/{uid}.role` para autorizar admins.

## Variables Necesarias

Configurar entorno backend/admin:

```bash
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
```

Tambien puede usarse `GCLOUD_PROJECT` si el entorno ya autentica al Admin SDK.

No commitear credenciales ni secretos.

## Dry-Run

Por defecto el script no escribe cambios.

```bash
npm run admin:claim:dry-run -- --uid USER_UID --admin true
```

Tambien se puede buscar por email:

```bash
npm run admin:claim:dry-run -- --email user@example.com --admin true
```

## Asignar Admin

Requiere confirmacion explicita:

```bash
npm run admin:claim -- --uid USER_UID --admin true --confirm
```

## Quitar Admin

Requiere confirmacion explicita:

```bash
npm run admin:claim -- --uid USER_UID --admin false --confirm
```

## Verificacion Posterior

- Pedir al usuario que cierre sesion y vuelva a iniciar sesion para refrescar ID token.
- Entrar a `/admin`.
- Confirmar que la ruta queda protegida por `AdminGuard`.
- PR19 difiere las metricas admin: no hay `adminGetDashboard` real en Spark-only.
- Cuando exista `GET /api/admin/dashboard` en Backend Node, confirmar respuesta 200 para admin y 403 para no admin.

## Riesgos

- Asignar admin a un usuario incorrecto habilita lectura administrativa.
- Quitar admin puede bloquear operaciones internas.
- Los custom claims pueden tardar hasta que el usuario refresque su token.
- Produccion requiere aprobacion manual antes de ejecutar cambios reales.

## Seguridad Operativa

- No imprime tokens ni secretos.
- No ejecuta cambios reales sin `--confirm`.
- Requiere `FIREBASE_PROJECT_ID` o `GCLOUD_PROJECT`.
- Usa Firebase Admin SDK desde script backend, no desde frontend.
