# Operations

## Objetivo

Dar una guia minima para observar y diagnosticar Cloud Functions sin exponer datos sensibles.

## Como Leer Logs

- Firebase Console: Functions > Logs.
- Google Cloud Logging: filtrar por nombre de funcion o `jsonPayload.event`.
- Local/emulador: revisar la salida de `firebase emulators:start`.

## Eventos Logueados

Las callables registran eventos estructurados minimos:

- `function_start`
- `function_success`
- `function_error`

Funciones instrumentadas:

- `claimDailyPack`
- `openPack`
- `pasteSticker`
- `adminGetDashboard`

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

- Verificar que el usuario tenga custom claim `admin == true`.
- Si aparece `PERMISSION_DENIED`, revisar custom claims y no `users/{uid}.role`.
- Revisar limites de queries si las metricas crecen.
