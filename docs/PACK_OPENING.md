# Pack Opening

## Objetivo

Implementar la primera apertura segura de sobres. El frontend solicita acciones, pero no decide
figuritas ni escribe datos sensibles.

## Flujo De Claim Diario

1. El usuario autenticado llama `claimDailyPack`.
2. Cloud Functions valida `request.auth.uid`.
3. `claimDailyPackUseCase` calcula la fecha diaria en UTC.
4. Se usa un `claimId` deterministico por usuario y dia: `daily_{userId}_{YYYY-MM-DD}`.
5. Si el claim ya existe, se devuelve el mismo documento.
6. Si no existe, se crea con `source: DAILY`, `status: AVAILABLE` y vencimiento al inicio del dia UTC siguiente.
7. El claim no abre el sobre por si mismo.

Esto evita duplicados diarios y permite idempotencia simple aun si el usuario toca el boton mas de
una vez.

## Flujo De Apertura

1. El usuario llama `openPack` con `source` y `claimId`.
2. Cloud Functions valida auth y payload minimo.
3. `openPackUseCase` corre dentro de `TransactionRunner`.
4. Se carga y valida el claim.
5. Se cargan figuritas activas del catalogo.
6. El dominio elige 5 figuritas con pesos por rareza.
7. Se calculan nuevas y repetidas.
8. Se actualiza `userStickers/{userId}/items/{stickerId}`.
9. Se crea `packOpenings/{openingId}`.
10. Se marca el claim como `CONSUMED`.
11. Se actualiza `userAlbums/{userId}`.
12. Se registra `auditLogs/{auditLogId}`.
13. Se devuelve al frontend el resultado ya resuelto.

## Por Que El Frontend No Decide Figuritas

- El cliente es manipulable.
- Los pesos por rareza son regla de negocio.
- La apertura debe ser auditable.
- El inventario y los contadores son datos sensibles.
- Firestore Rules bloquean escrituras directas a claims, openings, userStickers, userAlbums y auditLogs.
- La seleccion de sobres usa random server-side con `node:crypto`, no `Math.random`.

## Estructura De Claims

Path: `packClaims/{claimId}`

Campos principales:

- `id`
- `userId`
- `source`
- `status`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `consumedAt`
- `packId`
- `metadata`

Estados relevantes:

- `AVAILABLE`: puede abrirse.
- `CONSUMED`: ya fue usado.
- `EXPIRED`: estado reservado para expiracion materializada.

## Estructura De PackOpenings

Path: `packOpenings/{openingId}`

Campos:

- `id`
- `userId`
- `source`
- `claimId`
- `stickerIds`
- `newCount`
- `repeatedCount`
- `createdAt`
- `metadata`
- `auditLogId`

## Configuracion De Rarezas

Config inicial en codigo:

- `packSize`: 5
- `COMMON`: 70
- `UNCOMMON`: 20
- `RARE`: 7
- `EPIC`: 2
- `LEGENDARY`: 1

Luego puede migrarse a `system/config` y leerse desde infraestructura sin cambiar el dominio.

## Manejo De Repetidas

- Si el usuario no tenia la figurita, el resultado es `isNew: true`.
- Si ya la tenia, el resultado es `isNew: false`.
- Si una misma figurita sale dos veces en el mismo sobre, solo la primera puede contar como nueva.
- `quantityAfter` informa la cantidad del usuario luego de aplicar cada figurita del sobre.

## Idempotencia

- El claim diario usa ID deterministico por usuario y fecha UTC.
- `openPack` consume el claim dentro de una transaccion.
- Un claim `CONSUMED` devuelve error `CLAIM_ALREADY_CONSUMED`.
- Un claim expirado devuelve `CLAIM_EXPIRED`.
- Tests unitarios con fakes cubren que el claim diario no se duplique el mismo dia.

## Auditoria

Cada apertura crea:

- un documento funcional en `packOpenings`
- un evento tecnico en `auditLogs`

La auditoria no depende del frontend.

## Errores Posibles

- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `INVALID_ARGUMENT`
- `INVALID_CLAIM`
- `CLAIM_EXPIRED`
- `CLAIM_ALREADY_CONSUMED`
- `NO_ACTIVE_STICKERS`
- `INTERNAL_ERROR`

## Como Probar Localmente

1. Configurar `.env` del frontend con variables `VITE_FIREBASE_*`.
2. Levantar emuladores:

```bash
firebase emulators:start
```

3. Cargar catalogo en emulador:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:FIREBASE_PROJECT_ID = "albumsl-local"
npm.cmd run seed:stickers
```

4. Levantar frontend:

```bash
npm run dev
```

5. Iniciar sesion e ir a `/open-pack`.

## Pendientes

- Tests automatizados de Firestore Rules con Emulator.
- Config dinamica desde `system/config`.
- UI para ver claims/openings historicos.
- Hardening de idempotencia para promociones, estadio y admin.
