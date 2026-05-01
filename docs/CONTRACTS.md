# Contracts

## Objetivo

`packages/contracts` contiene DTOs serializables para compartir entre frontend y backend.

Los contratos no ejecutan reglas de negocio. Solo describen payloads, respuestas y errores
esperados.

## DTOs de stickers

- `StickerDto`
- `UserStickerDto`
- `StickerCategoryDto`
- `StickerEraDto`
- `StickerRarityDto`

## DTOs de album

- `AlbumProgressDto`
- `PasteStickerRequestDto`
- `PasteStickerResponseDto`

## DTOs de sobres

- `OpenPackRequestDto`
- `OpenPackResponseDto`
- `ClaimDailyPackRequestDto`
- `ClaimDailyPackResponseDto`
- `ClaimStadiumPackRequestDto`
- `ClaimStadiumPackResponseDto`
- `PackSourceDto`
- `ClaimStatusDto`

## Errores API

`ApiErrorCode` incluye:

- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `INVALID_ARGUMENT`
- `ALREADY_CLAIMED`
- `INVALID_CLAIM`
- `PACK_NOT_AVAILABLE`
- `STICKER_NOT_FOUND`
- `INSUFFICIENT_QUANTITY`
- `INTERNAL_ERROR`

`ApiErrorResponse` representa errores HTTP o callable function de forma estable para frontend.

## Criterios

- Los DTOs usan strings, numbers, booleans, arrays y objetos planos.
- Fechas cruzan la frontera como strings ISO.
- El frontend puede consumir estos tipos, pero no decide resultados sensibles.
- Las respuestas de apertura de sobres son resultados ya decididos por backend.
