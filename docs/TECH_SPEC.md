# Tech Spec

## Stack elegido

- Frontend: React + TypeScript + Vite.
- Backend inicial: Firebase Cloud Functions.
- Auth: Firebase Auth.
- Base de datos: Firestore.
- Hosting: Firebase Hosting.
- Infraestructura concreta: Firebase Admin SDK, Firestore y Auth.
- Gestión de dependencias: npm workspaces.
- Tipado: TypeScript estricto.

## Arquitectura general

El sistema se organiza como monorepo con capas separadas por responsabilidad:

- `packages/domain`: reglas puras del negocio.
- `packages/application`: casos de uso.
- `packages/contracts`: DTOs, tipos compartidos y errores compartidos.
- `packages/infra-firebase`: implementación concreta con Firebase.
- `functions`: adapter serverless inicial.
- `apps/web`: frontend React.

La idea central es que el dominio y los casos de uso no dependan de Firebase. Firebase es un detalle de infraestructura reemplazable.

## Estructura de carpetas propuesta

- `apps/web/`
- `functions/`
- `packages/domain/`
- `packages/application/`
- `packages/contracts/`
- `packages/infra-firebase/`
- `docs/`

Estructura interna sugerida:

- `packages/domain/src/entities/`
- `packages/domain/src/value-objects/`
- `packages/domain/src/services/`
- `packages/domain/src/helpers/`
- `packages/application/src/use-cases/`
- `packages/application/src/ports/`
- `packages/contracts/src/dtos/`
- `packages/contracts/src/errors/`
- `packages/contracts/src/events/`
- `packages/infra-firebase/src/auth/`
- `packages/infra-firebase/src/firestore/`
- `packages/infra-firebase/src/repositories/`
- `functions/src/routes/`
- `functions/src/middleware/`
- `functions/src/adapters/`
- `apps/web/src/features/`

## Responsabilidades del frontend

- Renderizar UI y estados.
- Autenticación de usuario.
- Consumir contratos tipados.
- Mostrar álbum, sobres, repetidas y progreso.
- Enviar comandos al backend.
- Nunca decidir la asignación de figuritas.
- Nunca escribir directamente datos sensibles.

## Responsabilidades de Cloud Functions

- Recibir requests.
- Validar auth básica.
- Validar permisos y contexto.
- Traducir requests a casos de uso.
- Llamar a `packages/application`.
- Devolver respuestas tipadas.
- Mantener auditoría de operaciones críticas.

## Responsabilidades de packages/domain

- Modelar entidades del álbum.
- Definir reglas puras del negocio.
- Validar invariantes del dominio.
- Exponer helpers puros.
- No importar Firebase ni SDKs de infraestructura.

## Responsabilidades de packages/application

- Orquestar casos de uso.
- Definir puertos de entrada y salida.
- Coordinar transacciones lógicas.
- Resolver reglas de aplicación.
- Pedir persistencia y servicios externos a través de interfaces.
- No importar Firebase directamente.

## Responsabilidades de packages/contracts

- Definir DTOs y comandos.
- Definir respuestas de casos de uso.
- Definir errores compartidos.
- Definir eventos o payloads de integración.
- Servir de frontera estable entre frontend y backend.

## Responsabilidades de packages/infra-firebase

- Implementar repositorios.
- Implementar acceso a Firestore.
- Implementar integración con Firebase Auth.
- Implementar lectura y escritura concretas.
- Adaptarse a puertos definidos por `packages/application`.

## Estrategia de ambientes dev/prod

- `dev`: emuladores o proyectos de desarrollo separados.
- `prod`: proyecto Firebase productivo con reglas y funciones desplegadas.
- Variables de entorno separadas por app y por función.
- Configuración de Firebase aislada por ambiente.
- Datos de prueba no deben mezclarse con producción.

## Comandos esperados

Los comandos finales del repo deberían cubrir como mínimo:

- instalar dependencias
- levantar frontend en modo desarrollo
- levantar funciones localmente
- correr tests
- lint
- typecheck
- build del monorepo
- deploy de hosting y functions

## Estrategia para no acoplar el dominio a Firebase

- El dominio no conoce Firestore, Auth ni Admin SDK.
- Los casos de uso dependen de interfaces, no de implementaciones.
- La persistencia se inyecta por puertos.
- Los DTOs viven fuera del dominio.
- Las funciones serverless actúan como adaptadores.

## Estrategia futura para migrar backend

- Mantener contratos estables entre frontend y backend.
- Mantener casos de uso independientes del transporte.
- Reemplazar `functions` por otra capa adaptadora sin tocar dominio ni aplicación.
- Reimplementar `packages/infra-firebase` por otra infraestructura, o crear una nueva infraestructura paralela.
- Migrar endpoint por endpoint, conservando contratos y tests de casos de uso.
- Si se migra a PostgreSQL, Supabase, MongoDB, Cloud Run, AWS, Railway o Render, el cambio debería afectar infraestructura y adaptadores, no reglas del álbum.
