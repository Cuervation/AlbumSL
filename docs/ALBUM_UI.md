# Album UI

## Objetivo

Implementar la primera experiencia real para que el usuario vea su album, progreso, figuritas
conseguidas, faltantes, pegadas y repetidas sin permitir escrituras sensibles desde frontend.

## Pantallas implementadas

- `/album`: vista principal estática, organizada en hojas con navegación inferior.
- `/album/:stickerId`: detalle de figurita y accion segura para pegar.
- `/duplicates`: vista de figuritas con copias disponibles/repetidas.
- `Dashboard`: resumen liviano con accesos a abrir sobre, ver album y repetidas.

## Datos que lee el frontend

- `stickers`: catalogo activo, ordenado por `sortOrder`.
- `userStickers/{uid}/items`: inventario propio del usuario.
- `userAlbums/{uid}`: resumen materializado si existe.
- `packOpenings`: ultimas aperturas propias para el dashboard.

El acceso a Firestore queda encapsulado en servicios y hooks dentro de `apps/web/src/features/album`.
Los componentes no escriben inventario ni contadores directamente.

## Datos que NO puede escribir el frontend

- `userStickers`
- `userAlbums`
- `packClaims`
- `packOpenings`
- `auditLogs`
- `stickers`

Estas escrituras siguen reservadas a Cloud Functions o procesos backend con Admin SDK.

## Flujo para ver album

1. El usuario autenticado entra a `/album`.
2. `useAlbumData` lee catalogo activo, inventario propio y resumen de album.
3. `buildAlbumView` combina catalogo e inventario de forma pura.
4. La UI muestra los slots ordenados por `sortOrder` y `number`, distribuidos en hojas.
5. Si no hay resumen materializado, la UI calcula un fallback local solo para visualizacion.
6. Las flechas inferiores cambian de hoja inmediatamente, sin animaciones ni transiciones.

## Flujo para ver repetidas

1. El usuario entra a `/duplicates`.
2. Se reutiliza `useAlbumData`.
3. La pantalla filtra slots con `repeatedQuantity > 0`.
4. No se implementa intercambio entre usuarios en esta etapa.

Nota: por regla de dominio, `repeatedQuantity = quantity - pastedQuantity`. En UI se muestra como
copias disponibles/repetidas, porque una figurita conseguida pero aun no pegada tambien tiene una
copia disponible para pegar.

## Flujo para pegar figurita

1. El usuario puede pegar una figurita disponible directamente desde su casillero en `/album`.
2. La UI habilita la acción solo si `canPasteSticker(userSticker)` es verdadero.
3. El frontend llama la callable function `pasteSticker({ stickerId })`.
4. La function valida `request.auth`.
5. `pasteStickerUseCase` corre dentro de `TransactionRunner`.
6. El backend valida que la figurita exista en el inventario propio y que `pastedQuantity < quantity`.
7. El backend incrementa `pastedQuantity`, recalcula `userAlbums/{uid}` y devuelve el progreso.
8. La UI refresca la hoja actual del album.

El detalle `/album/:stickerId` se conserva para consultar información de la figurita.

El frontend nunca modifica `userStickers` ni `userAlbums` directamente.

## Estados visuales de figurita

- `MISSING`: el usuario no tiene la figurita.
- `COLLECTED`: el usuario la consiguio, pero todavia no esta pegada.
- `PASTED`: la figurita esta pegada y no quedan copias disponibles.
- `REPEATED`: la figurita esta pegada y quedan copias disponibles.

## Filtros disponibles

- Categoria
- Rareza
- Epoca
- Estado
- Busqueda por titulo, descripcion y tags

Los filtros son frontend-side sobre los datos ya leidos. No se agregan queries complejas en esta
etapa.

## Decisiones de UI

- Mobile-first.
- Estetica inicial azulgrana.
- Hojas estáticas sin animaciones ni transiciones.
- Navegación inferior con flecha anterior, número de hoja y flecha siguiente.
- Sin intercambio entre usuarios.
- Sin modal complejo: el detalle vive en ruta propia.
- Placeholders para figuritas no conseguidas.

## Riesgos y pendientes

- Falta test automatizado de componentes React.
- La semantica de "repetida" puede necesitar refinamiento de producto antes de trading.
- Falta test de Firestore Rules con Emulator.
- La UI depende de que el catalogo haya sido seeded previamente.
