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

## DEC-011 - Validar distribucion del catalogo con tolerancia inicial

Fecha: 2026-04-30
Estado: Aprobada
Decision: Usar una tolerancia inicial de 5 puntos porcentuales para validar la distribucion 30% `PRE_1990` y 70% `POST_1990`.
Motivo: La regla de producto habla de una distribucion aproximada, no exacta.
Alternativas consideradas: Exigir 30/70 exacto o no validar distribucion hasta cargar el catalogo real.
Impacto: El dominio puede detectar catalogos claramente desviados sin bloquear pequenas variaciones editoriales.
Riesgos: La tolerancia puede necesitar ajuste cuando exista el catalogo curado definitivo.

## DEC-012 - Bloquear escrituras sensibles desde Firestore client SDK

Fecha: 2026-04-30
Estado: Aprobada
Decision: Denegar escrituras cliente a catalogo, inventario, contadores, claims, aperturas, auditoria, eventos y configuracion.
Motivo: El frontend no debe poder autoasignarse figuritas, crear aperturas validas ni modificar reglas del sistema.
Alternativas consideradas: Permitir escrituras cliente parciales con validaciones complejas en Rules.
Impacto: Las operaciones sensibles deberan pasar por Cloud Functions o procesos backend con Admin SDK.
Riesgos: Requiere implementar endpoints backend antes de que ciertas acciones sean usables desde la UI.

## DEC-013 - Usar subcoleccion por usuario para inventario de figuritas

Fecha: 2026-04-30
Estado: Aprobada
Decision: Modelar inventario como `userStickers/{userId}/items/{stickerId}`.
Motivo: Hace evidente el ownership por path y simplifica lecturas del inventario propio.
Alternativas consideradas: Coleccion plana `userStickers` con `userId` y `stickerId`.
Impacto: Las consultas principales del usuario no requieren indice compuesto inicial.
Riesgos: Consultas globales o analytics futuras requeriran collection group queries e indices especificos.

## DEC-014 - Usar Firebase Auth Client SDK en el frontend para login inicial

Fecha: 2026-04-30
Estado: Aprobada
Decision: Implementar login con Google desde `apps/web` usando Firebase Auth Client SDK y crear el perfil inicial en `users/{uid}` cuando no exista.
Motivo: Firebase Auth es parte del stack inicial y permite habilitar acceso rapido sin introducir backend propio antes de tiempo.
Alternativas consideradas: Crear perfil solo desde Cloud Functions o esperar a un backend dedicado.
Impacto: El frontend puede autenticar y crear el perfil minimo, mientras Firestore Rules bloquean elevacion de rol y escrituras sensibles.
Riesgos: La seguridad del perfil inicial depende de que las Rules se mantengan restrictivas y testeadas con Emulator.

## DEC-015 - Mantener el seed inicial de catalogo como dato puro

Fecha: 2026-04-30
Estado: Aprobada
Decision: Ubicar el dataset inicial de stickers en `packages/domain/src/seed/` y ejecutar la escritura a Firestore desde `packages/infra-firebase`.
Motivo: El catalogo de ejemplo debe poder validarse sin Firebase, mientras la persistencia concreta queda en infraestructura.
Alternativas consideradas: Guardar el seed solo en un script Firebase o cargarlo desde el frontend.
Impacto: El dominio conserva portabilidad y el seed real queda controlado por Admin SDK.
Riesgos: El seed de dominio no debe transformarse en logica de infraestructura ni incluir assets con copyright.

## DEC-016 - Usar claim diario deterministico

Fecha: 2026-05-01
Estado: Aprobada
Decision: Generar el claim diario con ID deterministico por usuario y fecha UTC.
Motivo: Evita duplicados diarios y simplifica idempotencia inicial sin depender del cliente.
Alternativas consideradas: Crear IDs aleatorios y buscar claims por query diaria.
Impacto: `claimDailyPack` puede crear o devolver el mismo claim de forma estable.
Riesgos: La regla de dia UTC puede requerir ajuste si producto define dia local Argentina.

## DEC-017 - Abrir sobres dentro de TransactionRunner

Fecha: 2026-05-01
Estado: Aprobada
Decision: Orquestar `openPackUseCase` con `TransactionRunner` para claim, inventario, opening, album y audit log.
Motivo: Evita doble consumo accidental del mismo claim y agrupa escrituras sensibles.
Alternativas consideradas: Escrituras Firestore independientes desde la function.
Impacto: La consistencia queda en infraestructura sin acoplar application a Firebase.
Riesgos: Las lecturas transaccionales deben ocurrir antes de las escrituras y requieren cuidado al ampliar el flujo.

## DEC-018 - Mantener configuracion inicial de sobres en codigo

Fecha: 2026-05-01
Estado: Aprobada
Decision: Definir `packSize` y `rarityWeights` iniciales en dominio como configuracion por defecto.
Motivo: Permite validar el flujo sin introducir administracion dinamica prematura.
Alternativas consideradas: Leer pesos desde `system/config` desde el primer cambio.
Impacto: La configuracion es testeable y portable, y luego puede migrar a Firestore.
Riesgos: Cambios de pesos requieren deploy hasta implementar config dinamica.

## DEC-019 - Construir vista de album como helper puro

Fecha: 2026-05-01
Estado: Aprobada
Decision: Implementar `buildAlbumView` en `packages/domain` para combinar catalogo e inventario.
Motivo: La combinacion de slots es regla pura reutilizable y no debe depender de React ni Firebase.
Alternativas consideradas: Resolver la combinacion dentro de componentes React.
Impacto: La UI queda mas delgada y la logica se puede testear sin navegador ni infraestructura.
Riesgos: El dominio expone un modelo cercano a UI; debe mantenerse libre de detalles visuales.

## DEC-020 - Pegar figuritas mediante callable transaccional

Fecha: 2026-05-01
Estado: Aprobada
Decision: Exponer `pasteSticker` como Cloud Function callable que llama `pasteStickerUseCase`.
Motivo: Pegar cambia inventario y contadores sensibles, por lo que no debe hacerse con escrituras cliente.
Alternativas consideradas: Permitir update directo de `pastedQuantity` desde frontend con Rules complejas.
Impacto: Mantiene seguridad y consistencia del resumen del album.
Riesgos: Requiere emuladores o proyecto Firebase configurado para probar el flujo completo localmente.

## DEC-021 - Usar AGENTS.md como indice operativo de agentes

Fecha: 2026-05-01
Estado: Aprobada
Decision: Usar `AGENTS.md` como indice general y `docs/agents/*.md` como documentacion separada de agentes especializados.
Motivo: El proyecto ya tiene varias capas y necesita reglas operativas claras para que futuros prompts o agentes trabajen sin romper arquitectura, seguridad ni producto.
Alternativas consideradas: Mantener instrucciones de agentes mezcladas en README o en documentos de feature.
Impacto: Facilita elegir roles por tarea, evita activar todos los agentes innecesariamente y centraliza reglas globales.
Riesgos: La documentacion de agentes debe mantenerse actualizada cuando cambien reglas o responsabilidades.

## DEC-022 - Usar GitHub Actions para validacion automatica

Fecha: 2026-05-02
Estado: Aprobada
Decision: Agregar un workflow de GitHub Actions que ejecuta `npm ci` y `npm run validate` en push y pull request a `master`, sin deploy automatico.
Motivo: Detectar errores de typecheck, lint, tests, build y formato antes de integrar cambios.
Alternativas consideradas: Validacion solo local o configurar CI con deploy desde el inicio.
Impacto: Mejora la calidad automatizada del repo manteniendo despliegues manuales.
Riesgos: El CI puede requerir ajuste futuro si se agregan servicios externos o emuladores obligatorios.

## DEC-023 - Logs estructurados minimos sin datos sensibles

Fecha: 2026-05-02
Estado: Aprobada
Decision: Instrumentar Cloud Functions con logs estructurados minimos y metadata permitida por allowlist.
Motivo: Mejorar troubleshooting de operaciones sensibles sin exponer emails, tokens, payloads completos ni stack traces.
Alternativas consideradas: Logs libres por funcion o no agregar observabilidad hasta produccion.
Impacto: Facilita diagnostico de claims, aperturas, pegado y admin manteniendo privacidad.
Riesgos: La observabilidad sigue siendo basica y puede requerir metricas/alertas cuando haya trafico real.
