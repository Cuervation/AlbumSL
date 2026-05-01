# AlbumSL

Album virtual de figuritas de San Lorenzo de Almagro.

## Requisitos previos

- Node.js 22 o superior.
- npm.
- Firebase CLI, cuando se configure Firebase.

## Instalacion

```bash
npm install
```

En PowerShell, si la politica local bloquea `npm.ps1`, usar:

```bash
npm.cmd install
```

## Estructura del monorepo

- `apps/web`: frontend React + Vite + TypeScript.
- `functions`: adapter serverless inicial con Firebase Cloud Functions.
- `packages/domain`: entidades y reglas puras del negocio.
- `packages/application`: casos de uso y puertos.
- `packages/contracts`: DTOs, tipos compartidos y errores compartidos.
- `packages/infra-firebase`: implementaciones concretas con Firebase Admin SDK y Firestore.
- `docs`: documentacion tecnica y de producto.

## Comandos principales

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run typecheck
npm run validate
npm run format
npm run format:check
```

## Correr frontend

```bash
npm run dev
```

## Compilar functions

```bash
npm run build:functions
```

## Validar todo

```bash
npm run validate
```

## Configurar Firebase mas adelante

1. Crear proyectos Firebase separados para dev y prod.
2. Completar `.env` a partir de `.env.example`.
3. Configurar `.firebaserc` localmente o en CI.
4. Revisar `firebase.json`, `firestore.rules` y `firestore.indexes.json`.
5. Usar emuladores antes de desplegar cambios sensibles.

## Notas de arquitectura

- Firebase es infraestructura inicial, no el centro del dominio.
- `packages/domain` no debe importar Firebase ni codigo de `functions`.
- `packages/application` depende de puertos/interfaces, no de implementaciones concretas.
- Las Cloud Functions deben actuar como adaptadores delgados.
- Las operaciones sensibles deben pasar por backend.
- El frontend no debe asignar figuritas ni escribir datos sensibles directamente.
