# Admin MVP

## Objetivo

Documentar el estado del panel admin despues de PR19.

Decision actual: diferir el dashboard admin hasta despues del MVP jugable. La version anterior
dependia de la callable `adminGetDashboard`, pero Cloud Functions no se deployan en Firebase
Spark-only.

## Acceso

- La seguridad real usa Firebase custom claim `admin == true`.
- `users/{uid}.role` puede ayudar a mostrar links en la UI, pero no autoriza operaciones.
- `/admin` queda protegido por `AdminGuard`, pero no carga metricas desde Functions.
- El alta/baja operativa de admins esta documentada en `docs/ADMIN_CLAIMS.md`.

## Pantallas

- `/admin`: ruta protegida para administradores con mensaje de backend pendiente.

## Datos mostrados

- No se muestran metricas en runtime real dev.
- La implementacion futura debe devolver solo metricas minimas y evitar PII innecesaria.

## Cosas NO permitidas todavia

- Editar catalogo.
- Borrar datos.
- Crear claims admin.
- Crear geocercas.
- Crear promociones.
- Ver audit logs desde frontend.
- Modificar roles o custom claims desde la UI.
- Usar Cloud Functions reales en Spark-only.

## Seguridad

- Firestore Rules permiten lectura admin con custom claim donde corresponde.
- Firestore Rules siguen bloqueando create/update/delete sensibles desde frontend.
- La implementacion futura debe vivir en Backend Node: `GET /api/admin/dashboard`.
- Backend Node debe verificar Firebase ID token y custom claim `admin == true`.
- No alcanza con `users/{uid}.role`.

## Riesgos pendientes

- Las metricas de conteo pueden requerir cache si el volumen crece.
- Implementar dashboard admin en Backend Node queda para PR separado.
