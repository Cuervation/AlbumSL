---
name: albumsl-frontend-ui
description: Frontend UI workflow for AlbumSL. Use when building or reviewing React pages, routes, hooks, services, components, UX states, mobile-first album screens, or frontend integration with Cloud Functions.
---

# AlbumSL Frontend UI

- Mantener mobile-first.
- Usar estetica azulgrana simple y clara.
- Incluir estados loading, error y empty.
- Separar hooks, services y componentes.
- No escribir datos sensibles directo a Firestore.
- Ejecutar operaciones sensibles via Cloud Functions.
- No duplicar logica de dominio en React.
- No asignar figuritas desde frontend.
- No crear claims/openings desde frontend.
- No modificar `userStickers.quantity` ni counters de `userAlbums`.
- Mantener componentes simples, testeables y mantenibles.
- Mostrar errores entendibles sin detalles internos.
- Terminar con `npm run validate`.
