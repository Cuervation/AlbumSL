# Feature Slices

## auth

Objetivo: permitir registro e inicio de sesión.

Frontend esperado:

- pantallas de login y registro
- estado de sesión
- logout

Backend/functions esperado:

- creación y verificación de sesión
- vínculo con Firebase Auth

Dominio/aplicación involucrado:

- mínimo
- solo integración de identidad como contexto de usuario

Datos involucrados:

- user id
- email
- provider
- timestamps de creación

Consideraciones de seguridad:

- autenticar antes de operaciones sensibles
- no confiar en identidad enviada por el cliente

Archivos esperados:

- `apps/web/src/features/auth/`
- `functions/src/routes/auth/`
- `packages/contracts/src/dtos/auth/`

Estado implementado inicial:

- login con Google en `apps/web`
- `AuthProvider` y `useAuth`
- rutas publicas y privadas
- logout desde frontend
- operaciones sensibles del album fuera de la UI

## user-profile

Objetivo: mostrar y mantener perfil básico del usuario.

Frontend esperado:

- vista de perfil
- estado de colección
- progreso del álbum

Backend/functions esperado:

- lectura y actualización de perfil permitido
- creación inicial del perfil al registrarse

Dominio/aplicación involucrado:

- entidad de perfil de usuario
- caso de uso de inicialización y consulta

Datos involucrados:

- display name
- avatar o alias
- progreso
- metadatos de cuenta

Consideraciones de seguridad:

- limitar campos editables
- no exponer datos internos innecesarios

Archivos esperados:

- `apps/web/src/features/user-profile/`
- `packages/application/src/use-cases/initialize-user-profile.ts`

Estado implementado inicial:

- lectura de `users/{uid}`
- creacion inicial restrictiva si el perfil no existe
- `role` fijo como `USER` desde frontend
- updates futuros limitados por Firestore Rules

## sticker-catalog

Objetivo: definir y leer el catálogo global de figuritas.

Frontend esperado:

- listado y detalle de figuritas
- filtros por tipo o época

Backend/functions esperado:

- lectura de catálogo
- futura administración controlada

Dominio/aplicación involucrado:

- entidad de figurita
- reglas de catálogo

Datos involucrados:

- sticker id
- tipo
- época
- rareza
- metadata histórica

Consideraciones de seguridad:

- el frontend nunca modifica el catálogo global
- el catálogo debe ser tratado como dato controlado

Archivos esperados:

- `packages/domain/src/entities/sticker.ts`
- `packages/contracts/src/dtos/sticker/`
- `apps/web/src/features/sticker-catalog/`

Estado implementado inicial:

- entidad `Sticker` con campos completos de catalogo
- validaciones puras de catalogo en `packages/domain`
- seed inicial de 50 figuritas en `packages/domain/src/seed/`
- script idempotente de seed con Admin SDK en `packages/infra-firebase`
- repositorio `FirestoreStickerCatalogRepository`
- pantalla protegida `/catalog` para leer figuritas activas
- escrituras de catalogo denegadas al frontend por Firestore Rules

## album

Objetivo: representar el álbum y su progreso.

Frontend esperado:

- grilla o páginas de álbum
- estados de completado
- pegadas vs faltantes

Backend/functions esperado:

- lectura del estado del álbum
- actualización por pegado validado

Dominio/aplicación involucrado:

- álbum
- posiciones o slots
- progreso

Datos involucrados:

- album id
- slots
- figuritas pegadas
- progreso total

Consideraciones de seguridad:

- solo el backend valida pegado válido
- no permitir sobrescritura arbitraria

Archivos esperados:

- `packages/domain/src/entities/album.ts`
- `packages/application/src/use-cases/stick-sticker.ts`
- `apps/web/src/features/album/`

## pack-opening

Objetivo: abrir sobres y recibir figuritas.

Frontend esperado:

- botón de abrir sobre
- animación o feedback de resultados
- vista de figuritas obtenidas

Backend/functions esperado:

- crear la apertura
- asignar figuritas
- auditar el evento

Dominio/aplicación involucrado:

- reglas de apertura
- generación de contenido del sobre

Datos involucrados:

- pack id
- user id
- sticker ids asignados
- timestamp
- auditoría

Consideraciones de seguridad:

- la apertura válida solo nace en backend
- el frontend no elige figuritas

Archivos esperados:

- `packages/application/src/use-cases/open-pack.ts`
- `functions/src/routes/packs/`

Estado implementado inicial:

- helpers puros de seleccion ponderada en `packages/domain`
- `openPackUseCase` en `packages/application`
- repositorios Firestore/Admin SDK en `packages/infra-firebase`
- callable `openPack` en `functions`
- pantalla protegida `/open-pack` en `apps/web`
- consumo transaccional del claim y auditoria de apertura

## daily-pack

Objetivo: permitir reclamar el sobre diario.

Frontend esperado:

- estado de elegibilidad
- botón de reclamo

Backend/functions esperado:

- verificar disponibilidad diaria
- registrar claim
- generar apertura

Dominio/aplicación involucrado:

- regla de derecho diario
- idempotencia del reclamo

Datos involucrados:

- last claim date
- claim count
- pack issuance record

Consideraciones de seguridad:

- evitar reclamos duplicados
- no confiar en reloj del cliente

Archivos esperados:

- `packages/application/src/use-cases/claim-daily-pack.ts`
- `functions/src/routes/daily-pack/`

Estado implementado inicial:

- `claimDailyPackUseCase` crea o devuelve claim diario existente
- claim diario con ID deterministico por usuario y fecha UTC
- callable `claimDailyPack` en `functions`
- UI minima para reclamar y abrir desde `/open-pack`

## stadium-pack

Objetivo: permitir reclamo por presencia en estadio.

Frontend esperado:

- acción de reclamo contextual
- mensajes de elegibilidad

Backend/functions esperado:

- validar contexto geográfico
- decidir si otorga el pack

Dominio/aplicación involucrado:

- regla de elegibilidad por geocerca

Datos involucrados:

- ubicación declarada
- ventana temporal
- resultado del claim

Consideraciones de seguridad:

- GPS puede falsearse en el MVP
- la decisión final sigue siendo backend

Archivos esperados:

- `packages/application/src/use-cases/claim-stadium-pack.ts`
- `functions/src/routes/stadium-pack/`

## duplicates

Objetivo: mostrar figuritas repetidas y cantidades.

Frontend esperado:

- vista de repetidas
- conteo por figurita

Backend/functions esperado:

- lectura agregada de inventario del usuario

Dominio/aplicación involucrado:

- inventario
- conteo de duplicados

Datos involucrados:

- sticker id
- quantity
- ownership state

Consideraciones de seguridad:

- no alterar cantidades desde frontend

Archivos esperados:

- `packages/domain/src/entities/inventory.ts`
- `apps/web/src/features/duplicates/`

## admin futuro

Objetivo: administrar catálogo, campañas y eventos.

Frontend esperado:

- panel administrativo
- gestión de campañas

Backend/functions esperado:

- endpoints protegidos por roles
- validación de permisos

Dominio/aplicación involucrado:

- reglas de administración

Datos involucrados:

- roles
- campañas
- configuración del sistema

Consideraciones de seguridad:

- solo roles autorizados
- auditoría obligatoria

Archivos esperados:

- `apps/web/src/features/admin/`
- `functions/src/routes/admin/`

## audit-log

Objetivo: registrar eventos críticos.

Frontend esperado:

- visualización limitada y eventual de auditoría

Backend/functions esperado:

- escritura de eventos
- consulta administrativa futura

Dominio/aplicación involucrado:

- eventos de negocio
- trazabilidad

Datos involucrados:

- actor
- acción
- timestamp
- metadata

Consideraciones de seguridad:

- la auditoría no debe depender del frontend
- escrituras solo desde backend

Archivos esperados:

- `packages/contracts/src/events/`
- `packages/infra-firebase/src/repositories/audit-log/`

## shared-ui

Objetivo: compartir componentes visuales reutilizables.

Frontend esperado:

- botones
- cards
- modales
- estados vacíos

Backend/functions esperado:

- no aplica

Dominio/aplicación involucrado:

- no aplica

Datos involucrados:

- props visuales

Consideraciones de seguridad:

- no mezclar UI compartida con lógica sensible

Archivos esperados:

- `apps/web/src/components/`
- `apps/web/src/shared-ui/`
