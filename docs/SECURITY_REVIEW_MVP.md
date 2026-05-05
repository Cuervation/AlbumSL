# Security Review MVP Dev

Fecha: 2026-05-05.

## Resumen ejecutivo

Review final del MVP dev actual. No se detectaron hallazgos criticos. Se aplico un hardening chico
en el backend para no propagar `details` internos cuando `openPack` enmascara claims invalidos o
ajenos. Smoke autenticado completo queda pendiente y no bloquea este review.

## Arquitectura revisada

- React + Vite en Firebase Hosting dev.
- Firebase Auth Google emite ID tokens.
- Frontend envia `Authorization: Bearer <idToken>` al backend Node.
- Backend Node corre en Render y verifica tokens con Firebase Admin SDK.
- Backend usa `uid` del token; no confia en `uid` del body.
- Firestore real dev guarda catalogo, usuarios, inventario, album, claims, aperturas y audit logs.
- Firestore Rules/Indexes protegen lecturas por ownership y bloquean escrituras sensibles directas.
- Service account vive fuera del repo o como Render Secret File.
- Cloud Functions no se deployan en Spark-only.

## Threat model compacto

Activos:

- Service account de Firebase Admin SDK.
- Firebase ID tokens.
- Inventario de usuario.
- Claims y openings de sobres.
- Album y stickers pegadas.
- Datos admin/audit logs.

Entrypoints:

- `GET /api/health`.
- `GET /api/me`.
- `POST /api/packs/claim-daily`.
- `POST /api/packs/open`.
- `POST /api/stickers/paste`.
- Firebase Hosting frontend.
- Lecturas cliente a Firestore.

Trust boundaries:

- Browser -> Render API: HTTPS + `Authorization: Bearer`.
- Render API -> Firebase Admin SDK / Firestore: service account runtime.
- Browser -> Firestore: Firebase Auth + Firestore Rules.
- Render Secret File -> runtime: secreto fuera del repo.

Amenazas principales:

- Robo o logging de token.
- CORS abierto o wildcard con Authorization.
- Spoofing de `uid`.
- Leak de ownership de claims.
- Tampering de inventario, album, claims u openings.
- Escrituras directas a Firestore desde cliente.
- Exposicion de service account.
- Abuso por falta de rate limiting.

## Hallazgos

### Criticos

Ninguno encontrado.

### Altos

Ninguno explotable confirmado.

### Medios

1. Falta rate limiting en API publica de Render.
   Impacto: abuso autenticado o spam de endpoints sensibles, aunque reglas de negocio y auth reducen fraude directo.
   Estado: aceptado por ahora; requiere decision de arquitectura/infra o middleware dedicado.

2. Security headers/CSP no visibles en repo para Hosting.
   Impacto: defensa XSS/clickjacking depende de Firebase Hosting defaults o configuracion futura.
   Estado: aceptado por ahora; recomendado medir headers reales y planear CSP incremental.

3. Cloud Functions legacy/local siguen en el repo.
   Impacto: confusion operativa si alguien corre deploy de Functions.
   Estado: mitigado por docs y scripts separados; no se deploya en flujo Spark-only.

### Bajos

1. `GET /api/health` publico.
   Impacto: expone solo estado basico de servicio.
   Estado: aceptado.

2. Logs API incluyen path, stage, requestId, status y duracion.
   Impacto: bajo; no incluyen tokens ni service account.
   Estado: aceptado.

## Fixes aplicados

- `openPack` ya convertia `PERMISSION_DENIED` / `INVALID_CLAIM` a 404 generico. Ahora tambien elimina
  `details` internos para evitar futuros leaks de ownership.
- Test actualizado para confirmar que el error de claim ajeno no revela detalles.
- Test agregado para JSON invalido en endpoint sensible con respuesta 400 controlada.

## Controles verificados

- Auth Bearer obligatoria en endpoints sensibles.
- `verifyIdToken` via Firebase Admin SDK.
- `uid` tomado desde token autenticado.
- `uid` enviado en body ignorado en claim/open/paste.
- CORS allowlist via `ALBUMSL_ALLOWED_ORIGINS`; no wildcard.
- Preflight `OPTIONS` manejado.
- Body JSON limitado a 16 KB.
- JSON invalido devuelve 400.
- Rutas desconocidas devuelven 404.
- 500 generico sin stack trace.
- Healthcheck sin secretos.
- Frontend usa `getIdToken()` y no guarda tokens en storage.
- Firestore Rules: default deny y escrituras sensibles bloqueadas.
- `.env.example` sin secretos.
- Render Secret File documentado.
- Scripts dev Spark-safe separados de Functions/prod.

## Riesgos aceptados

- Sin rate limiting app-level en Render API.
- CSP/security headers no modelados en repo.
- Smoke autenticado completo pendiente.
- `npm audit` no ejecutado ni modificado; no se aplica `npm audit fix`.

## Comandos corridos

```powershell
git status --short
npm.cmd --workspace @albumsl/api run test -- --run src/server.test.ts
```

Pendiente al cierre del review:

```powershell
npm.cmd run validate
```
