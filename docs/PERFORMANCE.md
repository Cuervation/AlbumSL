# Performance

## Problema

Vite advertia que el bundle inicial superaba `500 kB`. La primera optimizacion apunta a reducir la
carga inicial sin cambiar funcionalidad.

## Lazy Routes Aplicadas

Se aplico `React.lazy` + `Suspense` a rutas principales protegidas:

- `/dashboard`
- `/album`
- `/album/:stickerId`
- `/duplicates`
- `/catalog`
- `/open-pack`
- `/admin`

Se mantienen eager:

- `AppLayout`
- `AuthGuard`
- `AdminGuard`
- `LoadingScreen`
- `Home`
- `Login`
- `NotFound`

## Lecturas Firestore Por Pantalla

- Home: no lee Firestore.
- Login: usa Firebase Auth.
- Dashboard: lee `userAlbums/{uid}`, `packOpenings` propios recientes y catalogo activo via hooks.
- Catalog: lee `stickers` activos.
- Album: lee `stickers` activos, `userStickers/{uid}/items` y `userAlbums/{uid}`.
- Sticker detail: lee `stickers` activos y `userStickers/{uid}/items`.
- Duplicates: lee `stickers` activos y `userStickers/{uid}/items`.
- OpenPack: usa Cloud Functions `claimDailyPack` y `openPack`.
- Admin: usa Cloud Function `adminGetDashboard`.

## Cache Aplicada

Se agrego cache en memoria para el catalogo activo en `sticker-catalog.service`.

- Cachea solo `stickers` activos.
- Deduplica requests concurrentes.
- No usa `localStorage`.
- No cachea inventario, claims, openings ni resumen del usuario.

## Seguridad

- Las acciones sensibles siguen pasando por Cloud Functions.
- No se agregaron escrituras directas a Firestore.
- No se cachean datos sensibles del usuario.

## Riesgos Pendientes

- El bundle puede seguir superando `500 kB` por dependencias compartidas como Firebase.
- Falta analizar chunks generados y separar manualmente vendor chunks si sigue el warning.
- Falta cache con invalidacion real para catalogo si el admin edita contenido en caliente.

## Proximos Pasos

- Revisar output de Vite por chunk despues de `npm run build:web`.
- Considerar `manualChunks` para Firebase/vendor si el warning persiste.
- Evaluar prefetch de rutas frecuentes cuando haya metricas reales.
