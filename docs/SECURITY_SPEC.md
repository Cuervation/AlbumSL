# Security Spec

## Qué puede hacer el frontend

- Autenticar al usuario.
- Mostrar estado de sesión.
- Leer datos no sensibles expuestos por contratos.
- Solicitar acciones al backend.
- Renderizar resultados y errores.

## Qué solo puede hacer el backend

- Asignar figuritas.
- Validar elegibilidad de sobres.
- Registrar auditoría.
- Aplicar reglas del negocio.
- Crear aperturas válidas.
- Resolver claims de sobres diarios, por estadio o por campaña.
- Autorizar acciones administrativas.

## Reglas para apertura de sobres

- Toda apertura válida nace en backend.
- El frontend solo puede solicitar la apertura.
- Cada apertura debe estar asociada a un usuario autenticado.
- La apertura debe quedar registrada con auditoría.
- La respuesta debe provenir de una regla server-side, no del cliente.

## Reglas para evitar que el usuario se autoasigne figuritas

- El frontend nunca recibe capacidad de escribir asignaciones directas.
- El catálogo global no se modifica desde frontend.
- La asignación de figuritas se calcula en backend.
- Firestore Rules deben negar escrituras directas a colecciones sensibles.
- El backend debe validar que la request no traiga figuritas elegidas por el cliente.

## Reglas para claims de sobres

- Un claim solo es válido si el backend confirma elegibilidad.
- El claim diario no puede ser forzado por el frontend.
- El claim debe ser idempotente o al menos resistente a duplicados.
- Debe registrarse auditoría de fecha, usuario y tipo de claim.

## Reglas para sobre diario

- Inicialmente cada usuario tiene derecho a 1 sobre diario.
- La elegibilidad se calcula del lado servidor.
- El usuario no puede reclamar más de lo permitido.
- El sistema debe evitar duplicados por reintentos.

## Reglas para sobre por estadio

- El backend debe validar la condición geográfica.
- El frontend no puede autoafirmar elegibilidad.
- Puede aceptarse falsificación limitada de GPS en el MVP.
- El resultado debe quedar auditable con contexto suficiente.

## Manejo futuro de admins

- Las acciones de admin deben requerir roles explícitos.
- Los privilegios deben validarse en backend.
- Las funciones administrativas deben quedar aisladas de los flujos de usuario normal.
- El frontend no debe asumir que un usuario es admin por flags locales.

## Riesgos aceptados para el MVP

- GPS falseado para el sobre de estadio.
- Reglas de campaña simples.
- Observabilidad limitada.
- Panel admin mínimo o inexistente.

## Riesgos NO aceptados

- Asignación de figuritas desde frontend.
- Modificación directa del catálogo global desde frontend.
- Creación de aperturas válidas sin backend.
- Escrituras directas sensibles desde cliente.
- Operaciones críticas sin auditoría.

## Lineamientos para Firestore Rules

- Denegar por defecto.
- Permitir solo lecturas y escrituras estrictamente necesarias.
- Bloquear escrituras directas a catálogo, auditoría y aperturas críticas.
- Exigir auth cuando corresponda.
- No usar reglas para implementar lógica de negocio compleja.
- Tratar Rules como barrera defensiva, no como motor de negocio.

## Lineamientos para Cloud Functions

- Verificar identidad antes de ejecutar operaciones sensibles.
- Validar permisos y contexto.
- Rechazar payloads manipulados.
- Registrar eventos críticos.
- No confiar en el frontend para decisiones de negocio.
- Mantener los handlers delgados y mover la lógica a casos de uso.
