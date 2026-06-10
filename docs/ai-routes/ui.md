# Route - UI simple

## Cuándo usar

- Cambiar estilos.
- Ajustar layout.
- Arreglar un componente visual.
- Cambiar textos.
- Mejorar loading/error/empty states.

## Leer

```txt
apps/web/src/... archivos afectados
```

## Leer solo si aplica

```txt
docs/ALBUM_UI.md
docs/AUTH.md
docs/CONTRACTS.md
```

## No leer por defecto

```txt
docs/SECURITY_SPEC.md
docs/PACK_OPENING.md
docs/STICKER_CATALOG.md
functions/
packages/infra-firebase/
firestore.rules
```

## Skill blocks

- `albumsl-frontend-ui` si aplica.

## Validación mínima recomendada

```bash
npm --workspace @albumsl/web run typecheck
npm --workspace @albumsl/web run build
```
