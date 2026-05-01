# Local Development

## Instalar dependencias

Desde la raiz del repo:

```bash
npm install
```

Si PowerShell bloquea `npm.ps1`, usar:

```bash
npm.cmd install
```

## Correr validaciones

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run validate
```

`npm run validate` ejecuta typecheck, lint, tests, build y chequeo de formato.

## Correr el frontend

```bash
npm run dev
```

El comando levanta `apps/web` con Vite.

## Compilar functions

```bash
npm run build:functions
```

Las functions viven en `functions/` y deben mantenerse como adapters delgados que llaman a
`packages/application`.

## Firebase local futuro

Cuando Firebase quede configurado:

```bash
firebase emulators:start
```

Emuladores previstos:

- Auth
- Functions
- Firestore
- Hosting
- Emulator UI

Antes de usar emuladores hay que configurar el proyecto Firebase y revisar `.firebaserc`.

## Variables de entorno

Usar `.env.example` como guia y crear `.env` local sin commitearlo.

No guardar secretos reales en el repo.
