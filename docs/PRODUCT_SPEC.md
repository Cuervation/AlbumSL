# Product Spec

## Objetivo del producto

Crear un álbum virtual de figuritas de San Lorenzo de Almagro donde los usuarios puedan registrarse, abrir sobres, coleccionar figuritas, pegarlas en su álbum, ver repetidas y, en una etapa futura, intercambiar figuritas con otros usuarios.

El producto debe sentirse como un álbum digital coleccionable, auditable y extensible, con lógica de negocio independiente de Firebase.

## Usuarios principales

- Hinchas y coleccionistas que quieren completar el álbum.
- Usuarios casuales que abren sobres diarios o por promociones.
- Usuarios que visitan el estadio y pueden obtener beneficios geolocalizados.
- Administradores que más adelante gestionarán catálogo, campañas y auditoría.

## Funcionalidades MVP

- Registro e inicio de sesión.
- Perfil básico de usuario.
- Catálogo de figuritas.
- Visualización del álbum.
- Apertura de sobres.
- Asignación server-side de figuritas.
- Pegado de figuritas al álbum.
- Visualización de figuritas repetidas.
- Reclamo de un sobre diario.
- Auditoría de aperturas y reclamos.
- Progreso básico del álbum.

## Funcionalidades futuras

- Intercambio entre usuarios.
- Sobres por promociones.
- Sobres por eventos.
- Sobres por geocerca del estadio.
- Sobres por admins.
- Panel administrativo.
- Reglas de campañas dinámicas.
- Notificaciones.
- Estadísticas y logros.
- Social features y ranking.

## Reglas de negocio iniciales

- El álbum tendrá por lo menos 600 figuritas.
- Aproximadamente 30% serán de 1990 para atrás.
- Aproximadamente 70% serán de 1990 en adelante.
- Habrá figuritas de jugadores, técnicos, campeonatos, momentos históricos, estadios, camisetas, hinchada, clásicos y especiales.
- Los usuarios pueden tener figuritas repetidas.
- Los usuarios pueden pegar figuritas en su álbum.
- La apertura de sobres debe quedar auditada.
- La asignación de figuritas NO puede decidirse desde el frontend.
- El usuario tendrá inicialmente derecho a 1 sobre diario.
- En el futuro podrá haber sobres por promociones, eventos, geocerca del estadio y admins.

## Definición de éxito del MVP

- Un usuario puede registrarse, iniciar sesión y abrir su sobre diario.
- El sistema asigna figuritas desde backend de forma auditable.
- El usuario ve su colección, su progreso y sus repetidas.
- El usuario puede pegar figuritas válidas en su álbum.
- Las operaciones sensibles no dependen del frontend para decidir resultados.
- La base documental y técnica permite extender el sistema sin rediseñar el dominio.

## Cosas que NO se harán en la primera versión

- Intercambio entre usuarios.
- Mercado, trading o subastas.
- Recompensas complejas o gamificación avanzada.
- Moderación social.
- App nativa móvil.
- Multi-tenant.
- Catálogo editable por frontend.
- Motor de campañas sofisticado.
- Sincronización offline avanzada.
- Observabilidad completa de producción desde el día 1.

## Supuestos iniciales

- Firebase será la infraestructura inicial.
- El dominio debe poder migrar en el futuro.
- El usuario autenticado es el actor principal del MVP.
- El catálogo base se administra del lado servidor.
- Las reglas de apertura de sobres se evaluarán en backend.
- El álbum y el catálogo tendrán esquema suficientemente estable para empezar.

## Riesgos del producto

- Los usuarios pueden intentar manipular el cliente.
- El catálogo y las reglas pueden crecer más rápido que la arquitectura inicial.
- El sobre diario puede ser abusado si la lógica no está bien protegida.
- La geolocalización puede ser falsificada.
- El intercambio entre usuarios introduce fraude y complejidad futura.
- La separación entre dominio e infraestructura puede romperse si no se disciplina el diseño.
