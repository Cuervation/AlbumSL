# Application Ports

## Objetivo

`packages/application` orquesta casos de uso sin depender de Firebase ni de Cloud Functions.

La infraestructura concreta debe entrar por puertos.

## Puertos iniciales

`StickerCatalogRepository`:

- `count`
- `findAll`
- `findById`

`UserStickerRepository`:

- `findByUserId`
- `findByUserIdAndStickerId`
- `save`

`PackClaimRepository`:

- `findLatestByUserAndSource`
- `save`

`PackOpeningRepository`:

- `findById`
- `save`

`AuditLogRepository`:

- `record`

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

## Reglas de acoplamiento

- Application puede importar `packages/domain`.
- Application no puede importar Firebase.
- Application no puede importar `functions`.
- Application no debe conocer Firestore collections.
- Los errores de aplicacion son transportables y luego pueden mapearse a contratos API.
