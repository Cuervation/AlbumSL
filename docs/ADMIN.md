# Admin MVP

## Objetivo

Implementar un panel admin basico y solo lectura para monitorear el estado del sistema sin habilitar
edicion, borrado ni acciones destructivas.

## Acceso

- La seguridad real usa Firebase custom claim `admin == true`.
- `users/{uid}.role` puede ayudar a mostrar links en la UI, pero no autoriza operaciones.
- La callable `adminGetDashboard` rechaza usuarios no autenticados o sin custom claim admin.

## Pantallas

- `/admin`: dashboard protegido para administradores.

## Datos mostrados

- Total de usuarios.
- Total de stickers.
- Stickers activos.
- Stickers inactivos.
- Total de aperturas.
- Total de claims.
- Ultimas aperturas.
- Ultimos claims.

No se muestran emails ni datos personales innecesarios en esta etapa.

## Cosas NO permitidas todavia

- Editar catalogo.
- Borrar datos.
- Crear claims admin.
- Crear geocercas.
- Crear promociones.
- Ver audit logs desde frontend.
- Modificar roles o custom claims desde la UI.

## Seguridad

- Firestore Rules permiten lectura admin con custom claim donde corresponde.
- Firestore Rules siguen bloqueando create/update/delete sensibles desde frontend.
- El backend usa Admin SDK para metricas solo lectura.
- Las queries recientes usan limite fijo.

## Riesgos pendientes

- Falta test automatizado de Firestore Rules con Emulator.
- Falta flujo operativo documentado para asignar custom claims admin.
- Las metricas de conteo pueden requerir cache si el volumen crece.
