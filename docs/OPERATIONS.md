# Operations

## Objetivo

Dar una guia minima para observar y diagnosticar backend/Functions legacy sin exponer datos sensibles.

## Como Leer Logs

- Render dev: Logs del Web Service `albumsl-api-dev`.
- Firebase Console/Google Cloud Logging: solo para Functions legacy/local si se usan en emulador.
- Local/emulador: revisar la salida de `firebase emulators:start`.

## Eventos Logueados

Las callables registran eventos estructurados minimos:

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

- `functionName`
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
- Buscar `function_error` con `functionName: claimDailyPack`.
- Si aparece `ALREADY_CLAIMED`, confirmar si el claim diario ya existe para la fecha UTC.

### openPack

- Verificar `source` y `claimId`.
- Confirmar que el claim pertenezca al `userId` logueado.
- Revisar errores `CLAIM_EXPIRED`, `CLAIM_ALREADY_CONSUMED` o `NO_ACTIVE_STICKERS`.

### pasteSticker

- Verificar `stickerId`.
- Si aparece `INSUFFICIENT_QUANTITY`, el usuario no tiene cantidad disponible para pegar.
- Confirmar que no haya escrituras directas desde frontend a `userStickers`.

### adminGetDashboard

- PR19 lo difiere para despues del MVP jugable.
- `/admin` debe mostrar mensaje de backend pendiente.
- Implementacion futura: `GET /api/admin/dashboard` en Backend Node con custom claim
  `admin == true`.
