---
name: albumsl-feature-slice
description: Implement AlbumSL feature slices while preserving clean architecture. Use for feature work that may touch domain, application, contracts, infra-firebase, functions, apps/web, docs, or tests and must respect AlbumSL layer boundaries.
---

# AlbumSL Feature Slice

- Leer `AGENTS.md` y el agente especifico antes de cambiar archivos.
- Separar cambios por capa: `domain`, `application`, `contracts`, `infra-firebase`, `functions`, `apps/web`, `docs`, `tests`.
- Mantener `packages/domain` sin Firebase, React ni functions.
- Mantener `packages/application` sin Firebase, React ni functions.
- Mantener `functions` como adapters finos que validan auth, llaman use cases y devuelven respuestas.
- Mantener `apps/web` sin logica sensible del album.
- Pasar operaciones sensibles por Cloud Functions.
- Agregar tests a toda feature sensible.
- Actualizar docs relacionadas y `docs/DECISIONS.md` si hay decision nueva.
- Terminar con `npm run validate`.
