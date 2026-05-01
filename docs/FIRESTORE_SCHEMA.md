# Firestore Schema

## Objetivo

Definir la primera version del schema Firestore sin mover reglas de negocio al cliente.

Firebase es infraestructura inicial. El dominio y `packages/application` siguen siendo portables.

## users/{userId}

Proposito: perfil basico del usuario.

Campos:

- `uid`: string
- `displayName`: string o null
- `email`: string o null
- `photoURL`: string o null
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `role`: string, inicialmente `USER`

Quien lee:

- el usuario autenticado sobre su propio perfil
- admin futuro con custom claim

Quien escribe:

- frontend: solo creacion inicial propia y updates limitados
- backend/Admin SDK: permitido para operaciones server-side

Escritura frontend permitida:

- create si `uid == request.auth.uid` y `role == USER`
- update solo `displayName`, `photoURL`, `updatedAt`
- no puede modificar `uid`, `email`, `createdAt` ni `role`

Queries esperadas:

- lectura directa por `users/{uid}`
- futura lectura admin

Indices necesarios:

- no requiere indice compuesto inicial

Seguridad:

- no confiar en `uid` enviado por cliente sin compararlo con `request.auth.uid`
- `role` nunca debe ser elevable desde cliente

## stickers/{stickerId}

Proposito: catalogo global de figuritas.

Campos:

- `id`: string
- `number`: number
- `title`: string
- `description`: string
- `category`: string
- `era`: string
- `rarity`: string
- `imageUrl`: string
- `tags`: array
- `sortOrder`: number
- `active`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Quien lee:

- usuarios autenticados, solo figuritas activas
- admin futuro puede leer activas e inactivas

Quien escribe:

- backend/Admin SDK
- script controlado de seed en `packages/infra-firebase`

Escritura frontend permitida:

- no

Queries esperadas:

- `active == true orderBy sortOrder`
- `active == true where category == X orderBy sortOrder`
- `active == true where era == X orderBy sortOrder`
- `active == true where rarity == X orderBy sortOrder`

Indices necesarios:

- `active + sortOrder`
- `active + category + sortOrder`
- `active + era + sortOrder`
- `active + rarity + sortOrder`

Seguridad:

- el cliente nunca crea, edita ni borra catalogo
- la carga inicial usa Admin SDK y valida el dataset antes de escribir
- `active = false` permite ocultar figuritas sin borrar documentos historicos

## userAlbums/{userId}

Proposito: resumen materializado del progreso del album.

Campos:

- `userId`: string
- `totalStickers`: number
- `collectedCount`: number
- `pastedCount`: number
- `repeatedCount`: number
- `completionPercentage`: number
- `createdAt`: timestamp
- `updatedAt`: timestamp

Quien lee:

- el usuario autenticado sobre su propio resumen
- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- lectura directa por `userAlbums/{uid}`

Indices necesarios:

- no requiere indice compuesto inicial

Seguridad:

- los contadores son sensibles y no se aceptan updates desde cliente
- la apertura de sobres recalcula el resumen desde el inventario actualizado

## userStickers/{userId}/items/{stickerId}

Proposito: inventario de figuritas de un usuario.

Campos:

- `stickerId`: string
- `userId`: string
- `quantity`: number
- `pastedQuantity`: number
- `firstCollectedAt`: timestamp
- `lastCollectedAt`: timestamp
- `updatedAt`: timestamp

Quien lee:

- el usuario autenticado sobre sus propias figuritas
- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- listar `userStickers/{uid}/items`
- lectura directa de `userStickers/{uid}/items/{stickerId}`

Indices necesarios:

- no aplica indice compuesto inicial porque se consulta una subcoleccion de usuario
- si luego se usa collection group sobre `items`, definir indices especificos

Seguridad:

- el cliente no puede crear items ni incrementar `quantity`
- el pegado debe pasar por Cloud Function

## packClaims/{claimId}

Proposito: derechos a abrir sobres.

Campos:

- `id`: string
- `userId`: string
- `source`: string
- `status`: string
- `eventId`: string o null
- `createdAt`: timestamp
- `expiresAt`: timestamp o null
- `consumedAt`: timestamp o null
- `updatedAt`: timestamp o null
- `metadata`: map
- `packId`: string o null

Quien lee:

- el usuario autenticado sobre sus propios claims
- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- `where userId == uid where status == X orderBy createdAt desc`
- `where userId == uid where source == X orderBy createdAt desc`

Indices necesarios:

- `userId + status + createdAt`
- `userId + source + createdAt`

Seguridad:

- el cliente no puede crear claims validos ni marcarlos consumidos
- el claim diario usa ID deterministico por usuario y fecha UTC
- `openPack` valida ownership, status y expiracion antes de consumir

## packOpenings/{openingId}

Proposito: auditoria funcional de aperturas de sobres.

Campos:

- `id`: string
- `userId`: string
- `source`: string
- `claimId`: string o null
- `stickerIds`: array
- `newCount`: number
- `repeatedCount`: number
- `createdAt`: timestamp
- `metadata`: map
- `auditLogId`: string o null

Quien lee:

- el usuario autenticado sobre sus propias aperturas
- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- `where userId == uid orderBy createdAt desc`

Indices necesarios:

- `userId + createdAt`

Seguridad:

- el cliente no crea, modifica ni borra aperturas
- cada apertura se crea desde backend dentro del flujo transaccional de consumo de claim

## stadiumEvents/{eventId}

Proposito: eventos de estadio/geocerca.

Campos:

- `id`: string
- `title`: string
- `stadiumName`: string
- `latitude`: number
- `longitude`: number
- `radiusMeters`: number
- `startsAt`: timestamp
- `endsAt`: timestamp
- `active`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Quien lee:

- usuarios autenticados, solo eventos activos
- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- `where active == true orderBy startsAt`

Indices necesarios:

- `active + startsAt`

Seguridad:

- la lectura del evento no otorga claim por si misma
- la validacion de geocerca queda en backend

## auditLogs/{auditLogId}

Proposito: auditoria tecnica y trazabilidad critica.

Campos:

- `id`: string
- `actorUserId`: string
- `action`: string
- `entityType`: string
- `entityId`: string
- `createdAt`: timestamp
- `metadata`: map
- `severity`: string

Quien lee:

- admin futuro

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- futuras consultas admin por accion, usuario o entidad

Indices necesarios:

- ninguno inicial

Seguridad:

- usuarios normales no leen auditoria tecnica
- clientes no escriben auditoria

## system/config

Proposito: configuracion global runtime.

Campos posibles:

- `packSize`: number
- `dailyPackEnabled`: boolean
- `stadiumPackEnabled`: boolean
- `rarityWeights`: map
- `updatedAt`: timestamp

Quien lee:

- usuarios autenticados

Quien escribe:

- backend/Admin SDK

Escritura frontend permitida:

- no

Queries esperadas:

- lectura directa de `system/config`

Indices necesarios:

- ninguno

Seguridad:

- no guardar secretos
- no permitir que el cliente cambie flags ni pesos de rareza
