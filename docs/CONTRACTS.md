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

`StickerDto` incluye `id`, `number`, `title`, `description`, `category`, `era`, `rarity`,
`imageUrl`, `tags`, `sortOrder`, `active`, `createdAt` y `updatedAt`.

## DTOs de auth y perfil

- `AuthenticatedUserDto`
- `UserProfileDto`
- `UserProfileUpdateDto`
- `UserRole`

## DTOs de album

- `AlbumProgressDto`
- `PasteStickerRequestDto`
- `PasteStickerResponseDto`

## DTOs de sobres

- `OpenPackRequestDto`
- `OpenPackResponseDto`
- `PackStickerResultDto`
- `ClaimDailyPackRequestDto`
- `ClaimDailyPackResponseDto`
- `ClaimStadiumPackRequestDto`
- `ClaimStadiumPackResponseDto`
- `PackSourceDto`
- `ClaimStatusDto`

`OpenPackResponseDto` devuelve `packOpeningId`, `source`, `stickers`, `newCount`,
`repeatedCount` y `createdAt`. Cada sticker incluye `isNew` y `quantityAfter`.

## Errores API

`ApiErrorCode` incluye:

- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `INVALID_ARGUMENT`
- `ALREADY_CLAIMED`
- `INVALID_CLAIM`
- `CLAIM_EXPIRED`
- `CLAIM_ALREADY_CONSUMED`
- `PACK_NOT_AVAILABLE`
- `NO_ACTIVE_STICKERS`
- `STICKER_NOT_FOUND`
- `INSUFFICIENT_QUANTITY`
- `INTERNAL_ERROR`

`ApiErrorResponse` representa errores HTTP o callable function de forma estable para frontend.

## Criterios

- Los DTOs usan strings, numbers, booleans, arrays y objetos planos.
- Fechas cruzan la frontera como strings ISO.
- El frontend puede consumir estos tipos, pero no decide resultados sensibles.
- Las respuestas de apertura de sobres son resultados ya decididos por backend.
