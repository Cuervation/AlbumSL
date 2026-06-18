# Album UI

## Objetivo

Implementar la primera experiencia real para que el usuario vea su album, progreso, figuritas
conseguidas, faltantes, pegadas y repetidas sin permitir escrituras sensibles desde frontend.

## Pantallas implementadas

- `/album`: vista principal estática, organizada en hojas con navegación inferior.
- `/album/:stickerId`: detalle de figurita y accion segura para pegar.
- `/duplicates`: biblioteca de cromos conseguidos con drag and drop local.
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

## Flujo para ver Mis cromos

1. El usuario entra a `/duplicates`.
2. Se reutiliza `useAlbumData`.
3. La pantalla muestra todas las figuritas conseguidas, sin filtros ni buscador.
4. Una figurita se puede seleccionar o arrastrar al destino `Abrir hoja`.
5. La UI abre `/album?sticker={stickerId}` en la hoja que contiene esa figurita.
6. Las copias repetidas se pueden arrastrar a una bandeja local de hasta tres elementos.
7. Agregar una figurita a la bandeja no navega ni crea un intercambio real.

Nota: por regla de dominio, `duplicateQuantity = max(quantity - 1, 0)`.
`repeatedQuantity` se mantiene como alias temporal por compatibilidad. La bandeja de intercambio
solo ofrece copias duplicadas reales y reserva siempre una copia para el album.

## Flujo para pegar figurita

1. El usuario puede pegar una figurita disponible directamente desde su casillero en `/album`.
2. La UI habilita la acción solo si `canPasteSticker(userSticker)` es verdadero.
3. El frontend llama la callable function `pasteSticker({ stickerId })`.
4. La function valida `request.auth`.
5. `pasteStickerUseCase` corre dentro de `TransactionRunner`.
6. El backend valida que la figurita exista en el inventario propio y que aun no este pegada.
7. El backend setea `pastedQuantity = 1`, recalcula `userAlbums/{uid}` y devuelve el progreso.
8. La UI refresca la hoja actual del album.

El detalle `/album/:stickerId` se conserva para consultar información de la figurita.

El frontend nunca modifica `userStickers` ni `userAlbums` directamente.

## Estados de figurita

- `placementState` indica ubicacion en el album: `MISSING`, `UNPASTED` o `PASTED`.
- `duplicateQuantity` indica copias repetidas reales: `max(quantity - 1, 0)`.
- Una figurita puede estar `PASTED` y, a la vez, tener duplicadas.
- `status` queda como etiqueta visual/backcompat; los filtros de repetidas usan `duplicateQuantity`.

## Decisiones de UI

- Mobile-first.
- Estetica inicial azulgrana.
- Hojas estáticas sin animaciones ni transiciones.
- Navegación inferior con flecha anterior, número de hoja y flecha siguiente.
- Drag and drop con alternativa de seleccion y boton para dispositivos tactiles o teclado.
- Bandeja de intercambio solo local; sin intercambio entre usuarios ni mutacion de inventario.
- Sin modal complejo: el detalle vive en ruta propia.
- Placeholders para figuritas no conseguidas.

## Riesgos y pendientes

- Falta test automatizado de componentes React.
- La semantica de "repetida" puede necesitar refinamiento de producto antes de trading.
- Falta test de Firestore Rules con Emulator.
- La UI depende de que el catalogo haya sido seeded previamente.
