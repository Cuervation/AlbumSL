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
- `validateStickerCatalog(stickers, options)`
- `assertUniqueStickerNumbers(stickers)`
- `assertUniqueStickerIds(stickers)`
- `getStickerCatalogStats(stickers)`
- `getStickerCatalogDistribution(stickers)`
- `validateStickerCatalogDistribution(stickers)`
- `validateUserSticker(userSticker)`
- `getRarityWeight(rarity, weights)`
- `groupStickersByRarity(stickers)`
- `pickStickerByWeightedRarity(stickers, weights, random)`
- `pickPackStickers(stickers, config, random)`
- `calculatePackResult(previousUserStickers, pickedStickers)`
- `calculateUpdatedUserStickers(previousUserStickers, pickedStickers)`
- `validatePackConfig(config)`

## Validaciones

`validateUserSticker` devuelve un resultado tipado con `isValid` y `errors`.

`pasteSticker` lanza `DomainValidationError` cuando el estado es invalido o no hay cantidad
disponible para pegar.

`validateStickerCatalog` verifica ids, numeros, campos requeridos, enums, orden, imagenes
placeholder y distribucion esperada, sin tocar infraestructura ni persistencia.

`validateStickerCatalogDistribution` devuelve conteos, ratios y errores por era.

Los helpers de sobres no usan `Math.random` directamente. Reciben un random inyectado para que la
seleccion sea testeable y portable.
