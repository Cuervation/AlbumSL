---
name: albumsl-firebase-backend
description: Backend and Firebase workflow for AlbumSL. Use when working on Cloud Functions, Firebase Admin SDK, Firestore repositories, infra-firebase adapters, callable functions, transactions, or backend-sensitive operations.
---

# AlbumSL Firebase Backend

- Usar Admin SDK solo en backend: `functions` o `packages/infra-firebase`.
- No meter Firebase en `packages/domain` ni `packages/application`.
- Mantener Cloud Functions finas: validar auth, mapear request, llamar use case, devolver response.
- Usar `request.auth.uid` como identidad confiable.
- Mapear errores a `HttpsError` sin exponer stack traces.
- Usar transactions cuando haya inventario, claims, openings, counters o auditoria.
- No permitir que frontend escriba colecciones sensibles.
- Registrar auditoria en operaciones criticas.
- Mantener repositorios Firebase explicitos y pequenos.
- Agregar o ajustar tests en domain/application para reglas sensibles.
- Terminar con `npm run validate`.
