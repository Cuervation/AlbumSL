# Auth

## Objetivo

Implementar autenticacion inicial con Firebase Auth y perfil de usuario en Firestore sin mover
logica sensible del album al frontend.

## Flujo de login

1. El usuario entra a `/login`.
2. Presiona `Ingresar con Google`.
3. `apps/web` usa Firebase Auth con popup de Google.
4. `AuthProvider` recibe el usuario en `onAuthStateChanged`.
5. Se busca `users/{uid}` en Firestore.
6. Si no existe, se crea un perfil inicial con `role: USER`.
7. El usuario autenticado puede entrar a `/dashboard`.

## Flujo de logout

1. El usuario presiona `Cerrar sesion`.
2. `AuthProvider` llama a Firebase Auth `signOut`.
3. Se limpia `user` y `currentUserProfile`.
4. Las rutas privadas vuelven a redirigir a `/login`.

## Creacion de perfil

El perfil inicial se crea desde frontend porque Firestore Rules lo permiten de forma restrictiva.

Campos:

- `uid`
- `displayName`
- `email`
- `photoURL`
- `role`
- `createdAt`
- `updatedAt`

Reglas:

- `uid` debe coincidir con `request.auth.uid`.
- `role` debe ser `USER`.
- el frontend no puede elevarse a `ADMIN`.
- updates futuros solo pueden tocar campos permitidos por Rules.

## Variables de entorno

Configurar `.env` local a partir de `.env.example`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

No commitear secretos ni credenciales reales.

## Responsabilidades del frontend

- iniciar sesion con Firebase Auth
- mantener estado de auth en `AuthProvider`
- crear perfil inicial si falta
- leer perfil propio
- proteger rutas privadas
- mostrar errores entendibles

El frontend no debe:

- asignar figuritas
- crear aperturas de sobres
- crear claims validos
- modificar contadores sensibles
- modificar catalogo

## Reglas de seguridad relacionadas

- `users/{userId}` permite lectura propia.
- `users/{userId}` permite create propio inicial si `role == USER`.
- `users/{userId}` no permite cambiar `role`.
- las colecciones sensibles siguen bloqueadas para escritura cliente.

## Riesgos y limitaciones

- El flujo depende de que Firebase project y Google provider esten configurados.
- No hay Auth emulator conectado automaticamente todavia.
- Las reglas de Firestore todavia no tienen tests automatizados con Emulator.
- El perfil inicial se crea desde cliente, con Rules como barrera defensiva.
- Admin real queda pendiente de custom claims server-side.
