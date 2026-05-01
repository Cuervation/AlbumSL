---
name: albumsl-security-review
description: Security review workflow for AlbumSL. Use when reviewing Firestore Rules, Cloud Functions, frontend writes, ownership, claims, pack openings, user stickers, album counters, audit logs, secrets, or abuse paths.
---

# AlbumSL Security Review

Revisar:

- Firestore Rules y default deny.
- Cloud Functions sensibles.
- Ownership por `request.auth.uid`.
- Escrituras sensibles desde frontend.
- Autoasignacion de figuritas.
- Claims duplicados o consumidos incorrectamente.
- Creacion o modificacion de `packOpenings`.
- Incrementos de `userStickers.quantity`.
- Modificacion de counters en `userAlbums`.
- Lectura/escritura de `auditLogs`.
- Secretos, credenciales o valores hardcodeados.

Responder hallazgos por severidad:

- Critico: explotable o permite fraude directo.
- Alto: rompe ownership, reglas sensibles o datos privados.
- Medio: riesgo real con mitigacion pendiente.
- Bajo: hardening, documentacion o mejora defensiva.

Incluir archivo y linea cuando sea posible. Si no hay hallazgos, decirlo y listar riesgos residuales.
