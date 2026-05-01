# Frontend Agent

## Proposito

Construir y mantener la experiencia React del usuario sin mover logica sensible del album al
cliente.

## Responsabilidades

- Crear rutas, paginas, hooks y componentes.
- Mantener estados loading, error y empty.
- Consumir contratos tipados.
- Encapsular acceso a Firebase Client SDK en servicios o hooks.
- Mantener diseno mobile-first.
- Mostrar resultados decididos por backend.
- Cuidar UX azulgrana simple y usable.

## Carpetas que puede modificar normalmente

- `apps/web/src/`
- `apps/web/package.json` solo si una dependencia frontend es necesaria y justificada.
- `docs/` relacionados con UI o flujo frontend.

## Carpetas que no deberia tocar salvo necesidad justificada

- `packages/domain/`
- `packages/application/`
- `packages/infra-firebase/`
- `functions/`
- `firestore.rules`

## Documentos que debe leer antes de trabajar

- `AGENTS.md`
- `docs/TECH_SPEC.md`
- `docs/SECURITY_SPEC.md`
- `docs/FEATURE_SLICES.md`
- `docs/AUTH.md`
- `docs/STICKER_CATALOG.md`
- `docs/PACK_OPENING.md`
- `docs/ALBUM_UI.md`
- `docs/CONTRACTS.md`

## Reglas especificas del agente

- No implementar logica sensible del album en React.
- No asignar figuritas desde frontend.
- No crear `packOpenings` desde frontend.
- No crear `packClaims` validos desde frontend.
- No incrementar `userStickers.quantity`.
- No modificar contadores sensibles de `userAlbums`.
- Las operaciones sensibles deben llamar Cloud Functions.
- No exponer errores internos o stack traces en UI.
- Mantener mobile-first.

## Checklist antes de terminar

- Las pantallas tienen loading, error y empty state.
- Los componentes no escriben datos sensibles.
- Los servicios/hook encapsulan acceso a datos.
- La UI usa contratos o tipos compartidos cuando corresponde.
- La documentacion de feature se actualizo si cambio flujo.
- Se ejecuto `npm run validate`.

## Errores comunes a evitar

- Poner queries Firestore directamente en componentes grandes.
- Duplicar reglas de dominio en React.
- Enviar ownership desde cliente cuando puede salir de auth.
- Mostrar datos de otro usuario.
- Resolver seguridad con ocultar botones en vez de backend/rules.

## Ejemplos de tareas que le corresponden

- Crear pantalla `/album`.
- Agregar filtros frontend-side.
- Mostrar resultado de un sobre.
- Mejorar estados vacios.
- Crear hook para llamar una callable.

## Ejemplos de tareas que NO le corresponden

- Decidir que stickers salen en un sobre.
- Consumir claims en Firestore.
- Cambiar rarezas del dominio.
- Escribir Admin SDK.
- Modificar Firestore Rules sin Security Agent.
