# Operations

## Objetivo

Dar una guia minima para observar y diagnosticar el backend Node dev en Render sin exponer datos
sensibles. Las Cloud Functions quedan como codigo legacy/local y no se deployan en Spark-only.

## Como Leer Logs

- Render dev: Logs del Web Service `albumsl-api-dev`.
- Firebase Console/Google Cloud Logging: solo para Functions legacy/local si se usan en emulador.
- Local/emulador: revisar la salida de `firebase emulators:start`.

## Eventos Logueados

El backend Node registra eventos estructurados minimos por request:

- `request_start`
- `auth_start`
- `auth_ok`
- `body_start`
- `body_ok`
- `claim_daily_start`
- `claim_daily_ok`
- `open_pack_start`
- `open_pack_ok`
- `paste_sticker_start`
- `paste_sticker_ok`
- `request_ok`
- `request_error`

Las Functions legacy/local tambien pueden registrar:

- `function_start`
- `function_success`
- `function_error`

Funciones legacy instrumentadas:

- `claimDailyPack`
- `openPack`
- `pasteSticker`
- `adminGetDashboard`

Runtime real dev:

- `claimDailyPack`, `openPack` y `pasteSticker` van por Backend Node en Render.
- `adminGetDashboard` queda diferido en PR19 y no se deploya como Cloud Function.

## Metadata Permitida

- `requestId`
- `method`
- `path`
- `stage`
- `statusCode`
- `durationMs`
- `hasOrigin`
- `claimStatus`
- `functionName` en legacy/local
- `userId`
- `source`
- `claimId`
- `stickerId`
- `packOpeningId`
- `errorCode`
- `admin`

## Datos Que No Se Loguean

- emails
- tokens
- credenciales
- payloads completos
- stack traces
- secretos
- datos personales innecesarios

## Errores Conocidos

- `UNAUTHENTICATED`: falta auth.
- `PERMISSION_DENIED`: usuario sin permiso.
- `INVALID_ARGUMENT`: payload invalido.
- `INVALID_CLAIM`: claim inexistente o invalido.
- `CLAIM_EXPIRED`: claim vencido.
- `CLAIM_ALREADY_CONSUMED`: claim ya usado.
- `PACK_NOT_AVAILABLE`: sobre no disponible.
- `NO_ACTIVE_STICKERS`: catalogo activo vacio.
- `STICKER_NOT_FOUND`: figurita inexistente.
- `INSUFFICIENT_QUANTITY`: no hay cantidad disponible.
- `INTERNAL_ERROR`: error no esperado, sin exponer detalles al cliente.

## Troubleshooting

### claimDailyPack

- Verificar que el usuario este autenticado.
- Buscar `request_error` en `POST /api/packs/claim-daily`.
- Si aparece `ALREADY_CLAIMED`, confirmar si el claim diario ya existe para la fecha UTC.

### openPack

- Verificar `source` y `claimId`.
- Confirmar que el claim pertenezca al `userId` logueado.
- Revisar errores `CLAIM_EXPIRED`, `CLAIM_ALREADY_CONSUMED` o `NO_ACTIVE_STICKERS`.
- Buscar `request_error` en `POST /api/packs/open`.

### pasteSticker

- Verificar `stickerId`.
- Si aparece `INSUFFICIENT_QUANTITY`, el usuario no tiene cantidad disponible para pegar.
- Confirmar que no haya escrituras directas desde frontend a `userStickers`.
- Buscar `request_error` en `POST /api/stickers/paste`.

### adminGetDashboard

- PR19 lo difiere para despues del MVP jugable.
- `/admin` debe mostrar mensaje de backend pendiente.
- Implementacion futura: `GET /api/admin/dashboard` en Backend Node con custom claim
  `admin == true`.

## Smoke pendiente

Smoke autenticado completo sigue pendiente:

- login Google
- `claimDailyPack`
- `openPack`
- `pasteSticker`
- `/album`
- `/duplicates`
- logout/login
- persistencia
- Console sin errores graves
- Network sin `localhost`, CORS OK y sin 500
- Render logs sin tokens ni service account
