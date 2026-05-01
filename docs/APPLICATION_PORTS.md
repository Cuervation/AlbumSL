# Application Ports

## Objetivo

`packages/application` orquesta casos de uso sin depender de Firebase ni de Cloud Functions.

La infraestructura concreta debe entrar por puertos.

## Puertos iniciales

`StickerCatalogRepository`:

- `count`
- `getActiveStickers`
- `getStickerById`
- `getStickersByIds`
- `findAll`
- `findById`

`UserStickerRepository`:

- `findByUserId`
- `findByUserIdAndStickerId`
- `save`
- `saveMany`

`PackClaimRepository`:

- `findById`
- `findLatestByUserAndSource`
- `save`

`PackOpeningRepository`:

- `findById`
- `save`

`AuditLogRepository`:

- `record`

`UserAlbumRepository`:

- `findByUserId`
- `save`

`TransactionRunner`:

- `run`
- inyecta repositorios transaccionales para apertura de sobres
- tambien se usa para pegar figuritas y mantener inventario/resumen consistentes

Servicios:

- `Clock`
- `IdGenerator`
- `RandomGenerator`

## Casos de uso iniciales

`calculateAlbumProgressUseCase`:

- recibe `userId`
- lee total de catalogo por `StickerCatalogRepository`
- lee coleccion por `UserStickerRepository`
- usa `calculateAlbumProgress` del dominio

`pasteStickerUseCase`:

- recibe `userId` y `stickerId`
- busca `UserSticker`
- valida estado con dominio
- pega una unidad con `pasteSticker`
- persiste via `UserStickerRepository`
- recalcula progreso con `StickerCatalogRepository` y `UserAlbumRepository`
- debe ejecutarse dentro de `TransactionRunner`

`claimDailyPackUseCase`:

- recibe `userId`
- calcula fecha diaria con reloj server-side
- crea o devuelve claim `DAILY` existente
- no abre el sobre

`openPackUseCase`:

- recibe `userId`, `source` y `claimId`
- valida ownership, status y expiracion del claim
- elige figuritas con dominio y random inyectado
- actualiza inventario, opening, claim, album y audit log dentro de `TransactionRunner`

## Reglas de acoplamiento

- Application puede importar `packages/domain`.
- Application no puede importar Firebase.
- Application no puede importar `functions`.
- Application no debe conocer Firestore collections.
- Los errores de aplicacion son transportables y luego pueden mapearse a contratos API.
