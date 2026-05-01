# Decisions

## DEC-001 - Usar Firebase para salir rapido

Fecha: 2026-04-30
Estado: Aprobada
Decision: Usar Firebase como infraestructura inicial para autenticacion, base de datos, hosting y funciones.
Motivo: Permite validar el producto rapido con un stack integrado y operativo desde el inicio.
Alternativas consideradas: Backend propio con Express, NestJS o Fastify desde el dia 1.
Impacto: Reduce tiempo de arranque y complejidad operativa inicial.
Riesgos: Dependencia accidental de Firebase si no se respeta la separacion por capas.

## DEC-002 - No acoplar dominio a Firebase

Fecha: 2026-04-30
Estado: Aprobada
Decision: Mantener `domain` y `application` libres de dependencias Firebase.
Motivo: Habilita portabilidad futura del backend.
Alternativas consideradas: Acceder directo a Firestore desde casos de uso.
Impacto: Exige puertos, adaptadores y contratos claros.
Riesgos: Mayor disciplina arquitectonica y algo mas de codigo de integracion.

## DEC-003 - Usar monorepo

Fecha: 2026-04-30
Estado: Aprobada
Decision: Organizar el proyecto como monorepo.
Motivo: Facilita compartir tipos, tests y contratos entre capas.
Alternativas consideradas: Repos separados para frontend y backend.
Impacto: Mejor coherencia entre modulos y menor duplicacion.
Riesgos: Requiere orden para evitar dependencias circulares.

## DEC-004 - Usar npm workspaces

Fecha: 2026-04-30
Estado: Aprobada
Decision: Gestionar paquetes con npm workspaces.
Motivo: Mantiene el stack simple y alineado con el entorno base del proyecto.
Alternativas consideradas: pnpm o yarn workspaces.
Impacto: Simplifica instalacion y scripts compartidos.
Riesgos: Menor sofisticacion de workspace frente a alternativas mas avanzadas.

## DEC-005 - Usar TypeScript estricto

Fecha: 2026-04-30
Estado: Aprobada
Decision: Activar TypeScript estricto en todo el monorepo.
Motivo: El dominio y los contratos requieren consistencia fuerte de tipos.
Alternativas consideradas: TypeScript relajado o JavaScript.
Impacto: Mejora seguridad de cambios y detecta errores temprano.
Riesgos: Mayor friccion inicial por correcciones de tipos.

## DEC-006 - Usar Cloud Functions para operaciones sensibles

Fecha: 2026-04-30
Estado: Aprobada
Decision: Resolver operaciones sensibles mediante Cloud Functions.
Motivo: Centraliza validacion, auditoria y logica critica del lado servidor.
Alternativas consideradas: Escrituras directas desde el frontend a Firestore.
Impacto: Reduce superficie de ataque y evita decisiones de negocio en el cliente.
Riesgos: Los handlers deben mantenerse delgados para no convertir functions en un monolito opaco.

## DEC-007 - No permitir asignacion de figuritas desde frontend

Fecha: 2026-04-30
Estado: Aprobada
Decision: El frontend nunca podra asignar figuritas directamente.
Motivo: Evita manipulacion del catalogo y fraude del sistema.
Alternativas consideradas: Calcular figuritas en cliente y solo persistir resultado.
Impacto: La logica de apertura vive en backend.
Riesgos: Requiere cuidado en contratos para no exponer datos manipulables.

## DEC-008 - Implementar MVP sin intercambio entre usuarios

Fecha: 2026-04-30
Estado: Aprobada
Decision: No incluir intercambio entre usuarios en el MVP.
Motivo: El intercambio agrega fraude, moderacion, matching y complejidad social.
Alternativas consideradas: Lanzar trading desde el inicio.
Impacto: Permite focalizar el MVP en coleccion y apertura de sobres.
Riesgos: La retencion futura debera apoyarse en otras dinamicas hasta habilitar trading.

## DEC-009 - Aceptar riesgo limitado de GPS falseado para el sobre de estadio

Fecha: 2026-04-30
Estado: Aprobada
Decision: Aceptar que el claim de estadio tenga riesgo limitado de falsificacion en el MVP.
Motivo: Es una funcionalidad futura valiosa que no justifica frenar el lanzamiento inicial.
Alternativas consideradas: Eliminar geocerca o implementar anti-fraude avanzado desde el inicio.
Impacto: El backend valida elegibilidad, pero no se persigue una garantia antifraude total.
Riesgos: Usuarios podrian simular ubicacion; el feature requiere hardening posterior.

## DEC-010 - Usar Vitest, ESLint flat config y Prettier como base de validacion

Fecha: 2026-04-30
Estado: Aprobada
Decision: Configurar Vitest para tests, ESLint con flat config para linting y Prettier para formato.
Motivo: Permite validar el monorepo desde el inicio con herramientas livianas y compatibles con TypeScript, Vite y npm workspaces.
Alternativas consideradas: Jest, configuraciones ESLint legacy o dejar formato manual.
Impacto: El repo queda con comandos consistentes de typecheck, lint, test, build y validate.
Riesgos: La configuracion puede necesitar ajustes cuando crezcan reglas especificas de React, Firebase o testing.
