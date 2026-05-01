# Decisions

## DEC-001 - Usar Firebase para salir rápido
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Usar Firebase como infraestructura inicial para autenticación, base de datos, hosting y funciones.
Motivo: Permite validar el producto rápido con un stack integrado y operativo desde el inicio.
Alternativas consideradas: Backend propio con Express, NestJS o Fastify desde el día 1.
Impacto: Reduce tiempo de arranque y complejidad operativa inicial.
Riesgos: Dependencia accidental de Firebase si no se respeta la separación por capas.

## DEC-002 - No acoplar dominio a Firebase
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Mantener `domain` y `application` libres de dependencias Firebase.
Motivo: Habilita portabilidad futura del backend.
Alternativas consideradas: Acceder directo a Firestore desde casos de uso.
Impacto: Exige puertos, adaptadores y contratos claros.
Riesgos: Mayor disciplina arquitectónica y algo más de código de integración.

## DEC-003 - Usar monorepo
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Organizar el proyecto como monorepo.
Motivo: Facilita compartir tipos, tests y contratos entre capas.
Alternativas consideradas: Repos separados para frontend y backend.
Impacto: Mejor coherencia entre módulos y menor duplicación.
Riesgos: Requiere orden para evitar dependencias circulares.

## DEC-004 - Usar npm workspaces
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Gestionar paquetes con npm workspaces.
Motivo: Mantiene el stack simple y alineado con el entorno base del proyecto.
Alternativas consideradas: pnpm o yarn workspaces.
Impacto: Simplifica instalación y scripts compartidos.
Riesgos: Menor sofisticación de workspace frente a alternativas más avanzadas.

## DEC-005 - Usar TypeScript estricto
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Activar TypeScript estricto en todo el monorepo.
Motivo: El dominio y los contratos requieren consistencia fuerte de tipos.
Alternativas consideradas: TypeScript relajado o JavaScript.
Impacto: Mejora seguridad de cambios y detecta errores temprano.
Riesgos: Mayor fricción inicial por correcciones de tipos.

## DEC-006 - Usar Cloud Functions para operaciones sensibles
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Resolver operaciones sensibles mediante Cloud Functions.
Motivo: Centraliza validación, auditoría y lógica crítica del lado servidor.
Alternativas consideradas: Escrituras directas desde el frontend a Firestore.
Impacto: Reduce superficie de ataque y evita decisiones de negocio en el cliente.
Riesgos: Los handlers deben mantenerse delgados para no convertir funciones en una nueva monolito opaco.

## DEC-007 - No permitir asignación de figuritas desde frontend
Fecha: 2026-04-30
Estado: Aprobada
Decisión: El frontend nunca podrá asignar figuritas directamente.
Motivo: Evita manipulación del catálogo y fraude del sistema.
Alternativas consideradas: Calcular figuritas en cliente y solo persistir resultado.
Impacto: La lógica de apertura vive en backend.
Riesgos: Requiere cuidado en contratos para no exponer datos manipulables.

## DEC-008 - Implementar MVP sin intercambio entre usuarios
Fecha: 2026-04-30
Estado: Aprobada
Decisión: No incluir intercambio entre usuarios en el MVP.
Motivo: El intercambio agrega fraude, moderación, matching y complejidad social.
Alternativas consideradas: Lanzar trading desde el inicio.
Impacto: Permite focalizar el MVP en colección y apertura de sobres.
Riesgos: La retención futura deberá apoyarse en otras dinámicas hasta habilitar trading.

## DEC-009 - Aceptar riesgo limitado de GPS falseado para el sobre de estadio
Fecha: 2026-04-30
Estado: Aprobada
Decisión: Aceptar que el claim de estadio tenga riesgo limitado de falsificación en el MVP.
Motivo: Es una funcionalidad futura valiosa que no justifica frenar el lanzamiento inicial.
Alternativas consideradas: Eliminar geocerca o implementar anti-fraude avanzado desde el inicio.
Impacto: El backend valida elegibilidad, pero no se persigue una garantía antifraude total.
Riesgos: Usuarios podrían simular ubicación; el feature requiere hardening posterior.

