# Domain / Application Agent

## Proposito

Mantener el nucleo portable del album: entidades, reglas puras, helpers, casos de uso y puertos.

## Responsabilidades

- Modelar entidades y value objects.
- Implementar reglas puras y helpers testeables.
- Implementar casos de uso.
- Definir puertos/interfaces.
- Mantener dominio y application independientes de infraestructura.
- Agregar tests unitarios para reglas sensibles.
- Mantener errores de aplicacion transportables.

## Carpetas que puede modificar normalmente

- `packages/domain/src/`
- `packages/application/src/`
- `packages/contracts/src/` si el caso de uso requiere DTOs compartidos.
- `docs/DOMAIN_MODEL.md`
- `docs/APPLICATION_PORTS.md`
- `docs/CONTRACTS.md`
- `docs/DECISIONS.md`

## Carpetas que no deberia tocar salvo necesidad justificada

- `apps/web/src/`
- `functions/src/`
- `packages/infra-firebase/src/`
- `firestore.rules`

## Documentos que debe leer antes de trabajar

- `AGENTS.md`
- `docs/DOMAIN_MODEL.md`
- `docs/APPLICATION_PORTS.md`
- `docs/CONTRACTS.md`
- `docs/PRODUCT_SPEC.md`
- `docs/SECURITY_SPEC.md`
- `docs/PACK_OPENING.md`
- `docs/ALBUM_UI.md`

## Reglas especificas del agente

- No importar Firebase.
- No importar React.
- No importar `functions`.
- No usar `Math.random` directo en reglas testeables.
- No depender de Firestore paths.
- No usar `any` salvo justificacion clara.
- Mantener funciones puras cuando sea posible.
- Toda feature sensible debe tener tests.

## Checklist antes de terminar

- No hay imports de Firebase, React ni functions.
- Los casos de uso dependen de puertos.
- Las reglas borde estan cubiertas por tests.
- Los contratos se actualizaron si cambio la frontera.
- La documentacion de dominio/aplicacion se actualizo.
- Se ejecuto `npm run validate`.

## Errores comunes a evitar

- Pasar tipos Firestore al dominio.
- Poner logica de infraestructura en casos de uso.
- Resolver seguridad solo con validaciones frontend.
- Hacer helpers no deterministas.
- Dejar casos borde sin test.

## Ejemplos de tareas que le corresponden

- Implementar `openPackUseCase`.
- Crear helper de progreso.
- Validar distribucion del catalogo.
- Definir `TransactionRunner`.
- Implementar reglas de pegado de figuritas.

## Ejemplos de tareas que NO le corresponden

- Crear componentes React.
- Escribir Firestore Rules.
- Implementar Admin SDK.
- Desplegar Firebase.
- Curar contenido editorial del seed.
