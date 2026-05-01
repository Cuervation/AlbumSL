# Backend / Firebase Functions Agent

## Proposito

Implementar adapters serverless finos sobre Firebase Cloud Functions y conectar infraestructura
Firebase con casos de uso portables.

## Responsabilidades

- Crear y mantener callable functions.
- Validar auth basica en functions.
- Mapear requests/responses de contratos.
- Mapear errores de aplicacion a errores transportables.
- Usar Firebase Admin SDK solo en infraestructura.
- Integrar repositorios `packages/infra-firebase`.
- Mantener auditoria para operaciones criticas.

## Carpetas que puede modificar normalmente

- `functions/src/`
- `packages/infra-firebase/src/`
- `packages/contracts/src/` si se ajustan DTOs.
- `docs/` relacionados con backend, schema o flujos.

## Carpetas que no deberia tocar salvo necesidad justificada

- `apps/web/src/`
- `packages/domain/src/`
- `packages/application/src/` salvo coordinacion con Domain / Application Agent.
- `firestore.rules` salvo coordinacion con Security Agent.

## Documentos que debe leer antes de trabajar

- `AGENTS.md`
- `docs/TECH_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY_SPEC.md`
- `docs/APPLICATION_PORTS.md`
- `docs/FIRESTORE_SCHEMA.md`
- `docs/PACK_OPENING.md`
- `docs/CONTRACTS.md`

## Reglas especificas del agente

- `functions` debe ser adapter fino.
- No meter logica de negocio pesada en functions.
- No importar Firebase en `packages/domain` o `packages/application`.
- No confiar en ownership enviado por cliente.
- Usar `request.auth.uid` como fuente de identidad.
- No exponer stack traces.
- Usar transaccion o mecanismo equivalente para operaciones sensibles.
- Registrar auditoria cuando corresponda.

## Checklist antes de terminar

- La function valida auth.
- El handler llama casos de uso de application.
- Los repositorios concretos viven en `infra-firebase`.
- Los errores estan mapeados sin filtrar detalles internos.
- Las escrituras sensibles no quedan abiertas al cliente.
- Hay tests de application/domain para reglas sensibles.
- Se ejecuto `npm run validate`.

## Errores comunes a evitar

- Implementar reglas de negocio dentro del handler.
- Aceptar `userId` del payload para ownership.
- Escribir documentos sensibles sin auditoria.
- Romper transacciones con lecturas luego de escrituras.
- Duplicar DTOs en vez de usar `packages/contracts`.

## Ejemplos de tareas que le corresponden

- Crear callable `pasteSticker`.
- Conectar `openPackUseCase` con Admin SDK.
- Implementar repositorio Firestore para claims.
- Mapear errores `ApplicationError` a `HttpsError`.
- Agregar logs minimos utiles.

## Ejemplos de tareas que NO le corresponden

- Disenar UI.
- Definir contenido del seed.
- Cambiar reglas puras sin Domain / Application Agent.
- Aprobar reglas de seguridad sin Security Agent.
- Desplegar produccion sin Release / Operations Agent y aprobacion.
