# Architecture

## Arquitectura general
El sistema se organiza como monorepo con varias capas:
- UI en `apps/web`.
- Adaptadores serverless en `functions`.
- Reglas puras de negocio en `packages/domain`.
- Casos de uso en `packages/application`.
- Contratos compartidos en `packages/contracts`.
- Implementación concreta de Firebase en `packages/infra-firebase`.

La clave es que Firebase se usa como infraestructura inicial, no como base conceptual del dominio.

## Por qué se usa monorepo
- Permite compartir tipos y contratos sin duplicación.
- Facilita evolucionar dominio, aplicación y frontend en una sola línea de trabajo.
- Reduce el riesgo de desalineación entre frontend y backend.
- Hace más simple reemplazar adaptadores sin romper contratos internos.
- Ayuda a ejecutar validaciones cruzadas con una sola base de código.

## Por qué se separa domain/application/contracts/infra
- `domain` contiene reglas que deben sobrevivir a cualquier cambio de plataforma.
- `application` coordina flujos sin atarse a frameworks.
- `contracts` estabiliza la frontera pública.
- `infra` concentra dependencias cambiantes como Firebase.

Esta separación permite migrar backend sin reescribir la lógica del álbum.

## Cómo fluye una apertura de sobre
1. El frontend envía la intención de abrir un sobre.
2. Cloud Functions verifica autenticación básica.
3. Functions llama al caso de uso de apertura.
4. El caso de uso verifica elegibilidad y reglas de negocio.
5. La infraestructura obtiene datos necesarios y persiste resultados.
6. Se registra auditoría.
7. Se devuelve al frontend el resultado ya resuelto.

Punto importante: el frontend nunca decide qué figuritas salen.

## Cómo fluye un reclamo de sobre diario
1. El usuario presiona reclamar.
2. El frontend solo envía la solicitud.
3. Cloud Functions valida identidad.
4. El caso de uso verifica si el usuario ya reclamó hoy.
5. Si corresponde, se genera la apertura y se registra.
6. Se responde con éxito o con rechazo explícito.

La fecha de referencia y la elegibilidad deben resolverse server-side.

## Cómo fluiría un reclamo por geocerca
1. El frontend manda una ubicación o contexto permitido.
2. Cloud Functions valida sesión y formato.
3. El caso de uso evalúa la regla de geocerca.
4. La infraestructura registra el claim y su resultado.
5. Se devuelve una respuesta con el estado final.

En el MVP se acepta que el GPS pueda falsearse parcialmente, pero la decisión sigue siendo backend.

## Qué partes son portables
- Reglas del álbum.
- Casos de uso.
- Contratos.
- Modelos de dominio.
- Lógica de elegibilidad.
- Auditoría como concepto.

## Qué partes quedan acopladas a Firebase
- Implementación de Auth.
- Persistencia Firestore.
- Firestore Rules.
- Hosting inicial.
- Cloud Functions como runtime serverless inicial.

## Cómo migrar en el futuro a otro backend sin reescribir todo
- Mantener `contracts` estables.
- Mantener `application` independiente de Firebase.
- Mantener `domain` puro.
- Crear una nueva infraestructura para el backend objetivo.
- Reemplazar el adapter serverless por otro runtime como Express, NestJS, Fastify o Cloud Run.
- Migrar repositorios de persistencia por detrás de los puertos existentes.
- Reusar la UI consumiendo los mismos contratos.

La migración ideal cambia el borde del sistema, no su núcleo.

