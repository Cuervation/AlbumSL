# Sticker Catalog

## Proposito

El catalogo global define las figuritas disponibles del album. Vive en Firestore en
`stickers/{stickerId}`, pero su modelo base y validaciones son puras y estan en
`packages/domain`.

El frontend puede leer figuritas activas. No puede crear, editar ni borrar catalogo.

## Campos

Cada figurita usa estos campos:

- `id`: identificador estable del documento y de dominio.
- `number`: numero unico visible en el album.
- `title`: nombre de la figurita.
- `description`: descripcion breve; puede quedar vacia en seeds curatorados.
- `category`: categoria editorial.
- `era`: `PRE_1990` o `POST_1990`.
- `rarity`: rareza para futuras reglas de sobres.
- `imageUrl`: placeholder o URL controlada.
- `tags`: etiquetas editoriales, incluyendo marcadores de serie como `libertadores-2014`.
- `sortOrder`: orden de renderizado del album.
- `active`: permite ocultar sin borrar.
- `createdAt`: fecha de creacion.
- `updatedAt`: fecha de ultima actualizacion.

## Categorias

- `PLAYER`
- `COACH`
- `CHAMPIONSHIP`
- `HISTORIC_MOMENT`
- `STADIUM`
- `JERSEY`
- `FANS`
- `CLASSIC_MATCH`
- `SPECIAL`

## Eras

- `PRE_1990`
- `POST_1990`

## Rarezas

- `COMMON`
- `UNCOMMON`
- `RARE`
- `EPIC`
- `LEGENDARY`

## Seed Inicial

Ubicacion:

- `packages/domain/src/seed/stickers.seed.ts`

La ubicacion elegida mantiene el dataset como dato puro del dominio, sin Firebase. El script
concreto de escritura vive en infraestructura:

- `packages/infra-firebase/src/seed/seed-stickers.ts`

El seed inicial contiene 50 figuritas de ejemplo para validar UI, reglas, queries e integracion.
No busca precision historica definitiva.

Distribucion actual:

- 50 figuritas totales.
- 15 `PRE_1990` y 35 `POST_1990`.
- 30% / 70% exacto para esta muestra.
- `COMMON` es la rareza mayoritaria.

## Validaciones Puras

El dominio expone:

- `validateStickerCatalog(stickers, options)`
- `assertUniqueStickerNumbers(stickers)`
- `assertUniqueStickerIds(stickers)`
- `getStickerCatalogStats(stickers)`
- `getStickerCatalogDistribution(stickers)`
- `validateStickerCatalogDistribution(stickers, options)`

La validacion permite configurar `minExpectedStickers`. Para el album final se espera 600+; para
el seed inicial se usa 50.

## Correr Dry Run

```bash
npm run seed:stickers:dry-run
```

El dry-run valida el dataset y compara contra Firestore, pero no escribe cambios.

Para usar emulador:

```bash
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run seed:stickers:dry-run
```

En PowerShell:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
npm.cmd run seed:stickers:dry-run
```

## Correr Seed Real

```bash
npm run seed:stickers
```

Requisitos:

- `FIREBASE_PROJECT_ID` o `GCLOUD_PROJECT` configurado.
- Credenciales Admin SDK via entorno local, `GOOGLE_APPLICATION_CREDENTIALS`, login de Firebase
  CLI, o emulador.

El script es idempotente:

- crea figuritas faltantes.
- actualiza campos permitidos si cambiaron.
- omite figuritas ya sincronizadas.
- no borra figuritas ausentes del seed.
- preserva `createdAt` de documentos existentes.

## Lectura Desde Frontend

La pantalla protegida `/catalog` lee desde Firestore Client SDK:

- `active == true`
- ordenado por `sortOrder`

Archivos principales:

- `apps/web/src/features/sticker-catalog/sticker-catalog.service.ts`
- `apps/web/src/features/sticker-catalog/useStickerCatalog.ts`
- `apps/web/src/pages/CatalogPage.tsx`

## Seguridad

El frontend no puede:

- crear stickers.
- editar stickers.
- borrar stickers.
- cargar seeds.
- cambiar rarezas o estado `active`.

La carga de catalogo debe hacerse desde backend, scripts controlados o procesos admin con SDK
administrativo.

## Imagenes Y Copyright

El seed usa dos tipos de imagen:

- assets locales autorizados en `apps/web/public/stickers/Libertadores_2014/`
- placeholders `placeholder://albumsl/stickers/{id}` para las figuritas que todavia no tengan imagen

Las primeras 33 figuritas del seed usan los assets locales copiados desde la carpeta raiz
`stickers/Libertadores_2014/`. Esa carpeta sigue siendo la fuente original de trabajo, y la copia
en `apps/web/public` es la que publica Firebase Hosting.

No se descargan imagenes de internet y no se incluyen assets con copyright. Las imagenes reales
deben provenir de una fuente autorizada o de assets propios.

## Escalar A 600+

Para pasar de 50 a 600+:

- mantener `id` y `number` estables.
- curar categorias, eras y rarezas en lotes.
- validar 30% `PRE_1990` y 70% `POST_1990`.
- usar `active = false` para ocultar sin borrar.
- versionar cambios editoriales en PRs.
- correr dry-run antes de escribir en dev/prod.
- agregar pruebas de Firestore Rules con Emulator antes de produccion.
