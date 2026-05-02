# Security Spec

## Principios

- Denegar por defecto.
- No confiar en campos de ownership enviados por cliente.
- Comparar ownership con `request.auth.uid` cuando corresponda.
- Mantener operaciones sensibles detras de Cloud Functions o Admin SDK.
- Preparar admins futuros con custom claim `request.auth.token.admin == true`.
- Tratar Firestore Rules como barrera defensiva, no como motor de negocio.

## Que puede hacer el frontend

- Autenticar al usuario.
- Iniciar y cerrar sesion con Firebase Auth.
- Leer su propio perfil.
- Crear su perfil inicial con `uid == request.auth.uid` y `role == USER`.
- Actualizar solo campos seguros del perfil propio.
- Leer figuritas activas.
- Leer su resumen de album.
- Leer sus figuritas.
- Leer sus claims y aperturas.
- Leer eventos de estadio activos.
- Leer `system/config` si esta autenticado.

## Que solo puede hacer el backend

- Asignar figuritas.
- Incrementar `quantity`.
- Pegar figuritas.
- Recalcular contadores del album.
- Crear claims validos.
- Marcar claims como consumidos.
- Crear aperturas de sobres.
- Escribir audit logs.
- Crear o editar catalogo.
- Ejecutar seeds de catalogo.
- Crear o editar eventos de estadio.
- Modificar configuracion global.

## Matriz de permisos por coleccion

| Coleccion                                 | Lectura frontend             | Escritura frontend                     | Backend/Admin SDK |
| ----------------------------------------- | ---------------------------- | -------------------------------------- | ----------------- |
| `users/{userId}`                          | propio perfil                | create propio inicial, update limitado | si                |
| `stickers/{stickerId}`                    | activas                      | no                                     | si                |
| `userAlbums/{userId}`                     | propio resumen               | no                                     | si                |
| `userStickers/{userId}/items/{stickerId}` | propias figuritas            | no                                     | si                |
| `packClaims/{claimId}`                    | propios claims               | no                                     | si                |
| `packOpenings/{openingId}`                | propias aperturas            | no                                     | si                |
| `stadiumEvents/{eventId}`                 | activos                      | no                                     | si                |
| `auditLogs/{auditLogId}`                  | no por defecto, admin futuro | no                                     | si                |
| `system/config`                           | autenticado                  | no                                     | si                |

## Reglas para apertura de sobres

- Toda apertura valida nace en backend.
- El frontend solo puede solicitar la apertura.
- El frontend debe enviar `source` y `claimId`, nunca stickers elegidas.
- La seleccion real de figuritas usa random server-side basado en `node:crypto`.
- Cada apertura debe estar asociada a un usuario autenticado.
- El claim debe pertenecer al usuario autenticado.
- El claim debe estar `AVAILABLE`, no expirado y no consumido.
- La apertura debe quedar registrada en `packOpenings`.
- La auditoria tecnica debe quedar registrada en `auditLogs`.
- La respuesta debe provenir de una regla server-side, no del cliente.
- El consumo del claim y la escritura del inventario deben ocurrir en transaccion o mecanismo equivalente.

## Reglas para evitar autoasignacion

- El frontend no puede escribir `stickers`.
- El frontend no puede escribir `userStickers`.
- El frontend no puede incrementar `quantity`.
- El frontend no puede crear `packOpenings`.
- El frontend no puede modificar `userAlbums`.
- Las Cloud Functions deben rechazar payloads con figuritas elegidas por el cliente.

## Reglas para pegado de figuritas

- El pegado se ejecuta mediante callable `pasteSticker`.
- El frontend solo envia `stickerId`.
- La identidad confiable sale de `request.auth.uid`, no del payload.
- El backend lee `userStickers/{uid}/items/{stickerId}` dentro de una transaccion.
- Si la figurita no existe para el usuario, devuelve `INSUFFICIENT_QUANTITY`.
- Si `pastedQuantity >= quantity`, devuelve `INSUFFICIENT_QUANTITY`.
- Si el estado es invalido, devuelve `INVALID_ARGUMENT`.
- El backend incrementa `pastedQuantity` y recalcula `userAlbums/{uid}`.
- El frontend no puede pegar escribiendo directo en Firestore.

## Catalogo y seed

- El frontend solo lee `stickers` activos.
- Las escrituras de `stickers` quedan denegadas desde Firestore Client SDK.
- La carga inicial se ejecuta con Admin SDK desde `packages/infra-firebase`.
- El seed valida ids, numeros, campos requeridos y distribucion antes de escribir.
- Las imagenes del seed son placeholders y no assets descargados de internet.

## Claims de sobres

- El frontend puede leer claims propios.
- El frontend no puede crear claims validos.
- El frontend no puede cambiar `status`, `consumedAt` ni `expiresAt`.
- Claims diarios, de estadio, promo o admin son creados por backend.
- La idempotencia debe resolverse en backend.
- El claim diario usa un ID deterministico por usuario y fecha UTC.
- El frontend no puede marcar un claim como `CONSUMED`.

## Sobre diario

- El usuario tiene inicialmente derecho a 1 sobre diario.
- La elegibilidad se calcula del lado servidor.
- El reloj confiable es backend.
- Firestore Rules bloquean creacion/consumo directo de claims.
- `claimDailyPack` crea o devuelve el claim diario existente, pero no abre el sobre.

## Sobre por estadio

- El frontend puede leer eventos activos.
- Leer un evento no otorga un claim.
- La geocerca se valida en backend.
- Se acepta riesgo limitado de GPS falseado para MVP.

## Admin futuro

- El helper `isAdmin()` queda preparado para custom claims.
- Admins pueden leer mas informacion donde la regla lo permite.
- Escrituras administrativas sensibles deben seguir pasando por backend/Admin SDK.
- No asumir rol admin por flags locales en frontend.
- El admin MVP usa callable `adminGetDashboard` y valida `request.auth.token.admin == true`.
- `users/{uid}.role` puede usarse solo para UI; no es fuente de autorizacion real.
- El panel admin MVP es solo lectura y no expone emails.
- La asignacion o remocion de custom claim admin se realiza con script backend/Admin SDK, dry-run por defecto y `--confirm` obligatorio para cambios reales.

## Hardening QA actual

- Las escrituras cliente a `stickers`, `userStickers`, `userAlbums`, `packClaims`, `packOpenings` y `auditLogs` siguen bloqueadas por Rules.
- La UI del album solo lee inventario/resumen/aperturas y usa callable para `pasteSticker`.
- Los tests criticos cubren claim ajeno, claim consumido, consumo de claim, repetidas, pegado sin cantidad e idempotencia diaria.
- Firestore Rules tienen tests automatizados con Firestore Emulator y `@firebase/rules-unit-testing`.

## Auth frontend

- `apps/web` puede usar Firebase Auth Client SDK.
- El perfil inicial puede crearse desde frontend si Firestore Rules validan `uid` y `role`.
- Google provider debe configurarse en Firebase Console.
- El frontend no puede modificar custom claims.
- El frontend no puede convertir `role` a `ADMIN`.

## Riesgos aceptados para el MVP

- GPS falseado para sobre de estadio.
- Sin panel admin completo.
- Observabilidad limitada.
- Perfil inicial creado desde cliente, protegido por Rules.

## Riesgos bloqueados por rules

- Autoasignacion de figuritas.
- Incremento directo de `quantity`.
- Escritura directa de contadores del album.
- Creacion directa de aperturas.
- Creacion directa de claims.
- Escritura directa de audit logs.
- Modificacion directa de catalogo, eventos o config.
- Seed de catalogo ejecutado desde frontend.
- Elevacion de `role` desde perfil de usuario.
- Doble apertura accidental del mismo claim cuando `openPack` se ejecuta transaccionalmente.

## Limitaciones de Firestore Rules

- No reemplazan validaciones de dominio.
- No garantizan idempotencia compleja.
- No deben calcular asignacion aleatoria de figuritas.
- No validan de forma robusta geolocalizacion.
- No protegen operaciones hechas con credenciales Admin SDK mal usadas.
- Requieren mantener actualizados los tests con Emulator antes de produccion.

## Lineamientos para Cloud Functions

- Verificar identidad antes de operaciones sensibles.
- Validar permisos y contexto.
- Ignorar ownership enviado por cliente cuando pueda derivarse de auth.
- Mapear errores sin exponer stack traces.
- Registrar eventos criticos.
- Mantener handlers delgados.
- Mover logica a `packages/application`.
