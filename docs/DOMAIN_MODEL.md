# Domain Model

## Objetivo

Modelar el album virtual como nucleo puro, sin Firebase, Firestore, Firebase Admin SDK,
Cloud Functions ni dependencias de frontend.

El dominio vive en `packages/domain`.

## Entidades y value objects

- `Sticker`: figurita del catalogo global.
- `StickerId`: identificador de figurita.
- `StickerNumber`: numero visible dentro del album.
- `StickerTag`: etiqueta libre para clasificacion.
- `Championship`: campeonato asociado a una figurita.
- `PlayerEra`: periodo historico asociado a un jugador.
- `UserSticker`: estado de una figurita en la coleccion de un usuario.
- `UserStickerCollection`: coleccion de figuritas de un usuario.
- `UserAlbum`: album de usuario con progreso calculado.
- `AlbumProgress`: avance del usuario sobre figuritas unicas pegadas.
- `Pack`: sobre emitido por una fuente.
- `PackOpening`: apertura auditable de un sobre.
- `PackClaim`: reclamo de sobre por fuente.

## Enums

`StickerCategory`:

- `PLAYER`
- `COACH`
- `CHAMPIONSHIP`
- `HISTORIC_MOMENT`
- `STADIUM`
- `JERSEY`
- `FANS`
- `CLASSIC_MATCH`
- `SPECIAL`

`StickerEra`:

- `PRE_1990`
- `POST_1990`

`StickerRarity`:

- `COMMON`
- `UNCOMMON`
- `RARE`
- `EPIC`
- `LEGENDARY`

`PackSource`:

- `DAILY`
- `STADIUM`
- `PROMO`
- `ADMIN`

`ClaimStatus`:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `ALREADY_CLAIMED`

## Reglas modeladas

- El catalogo debe tener como minimo 600 figuritas.
- La distribucion esperada es aproximadamente 30% `PRE_1990` y 70% `POST_1990`.
- La tolerancia inicial para esa distribucion es de 5 puntos porcentuales.
- El usuario puede tener figuritas repetidas.
- Una figurita esta conseguida si `quantity > 0`.
- Una figurita esta pegada si `pastedQuantity > 0`.
- `pastedQuantity` no puede superar `quantity`.
- `repeatedQuantity = max(quantity - pastedQuantity, 0)`.
- El progreso se calcula sobre figuritas unicas pegadas.

## Helpers puros

- `isStickerCollected(userSticker)`
- `isStickerPasted(userSticker)`
- `getRepeatedQuantity(userSticker)`
- `canPasteSticker(userSticker)`
- `pasteSticker(userSticker)`
- `calculateAlbumProgress(userStickers, totalStickers)`
- `countCollectedStickers(userStickers)`
- `countPastedStickers(userStickers)`
- `countRepeatedStickers(userStickers)`
- `validateStickerCatalogDistribution(stickers)`
- `validateUserSticker(userSticker)`

## Validaciones

`validateUserSticker` devuelve un resultado tipado con `isValid` y `errors`.

`pasteSticker` lanza `DomainValidationError` cuando el estado es invalido o no hay cantidad
disponible para pegar.

`validateStickerCatalogDistribution` devuelve conteos, ratios y errores, sin tocar
infraestructura ni persistencia.
