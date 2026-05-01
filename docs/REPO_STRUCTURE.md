# Repo Structure

## Raiz

Contiene la configuracion compartida del monorepo:

- `package.json`
- `tsconfig.base.json`
- `eslint.config.js`
- `.prettierrc.json`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`

## apps/web

Frontend React + TypeScript + Vite.

Responsabilidades:

- renderizar UI
- consumir contratos tipados
- llamar backend para operaciones sensibles

No debe:

- asignar figuritas
- escribir datos sensibles directamente
- contener reglas criticas del negocio

## functions

Adapter serverless inicial con Firebase Cloud Functions.

Responsabilidades:

- recibir requests
- validar auth basica
- llamar casos de uso de `packages/application`
- devolver responses

No debe contener logica pesada del dominio.

## packages/domain

Nucleo puro del negocio.

Responsabilidades:

- entidades
- value objects
- reglas puras
- helpers testeables sin infraestructura

No puede importar Firebase, functions ni infraestructura.

## packages/application

Casos de uso y puertos.

Responsabilidades:

- orquestar flujos
- depender de interfaces
- coordinar dominio e infraestructura a traves de puertos

No debe importar Firebase directamente.

## packages/contracts

Tipos compartidos entre frontend y backend.

Responsabilidades:

- DTOs
- request/response types
- errores compartidos
- eventos compartidos

## packages/infra-firebase

Implementaciones concretas sobre Firebase.

Responsabilidades:

- Firebase Admin SDK
- Firestore
- Auth server-side
- repositorios concretos

Esta es la capa donde el acoplamiento a Firebase esta permitido.

## docs

Documentacion tecnica, producto, seguridad, arquitectura, decisiones y roadmap.
