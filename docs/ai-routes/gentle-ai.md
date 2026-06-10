# Route - Gentle-AI / GGA

## Leer

```txt
.gga
.gga-rules.md
docs/GENTLE_AI.md
```

## Regla

- GGA debe revisar solo riesgos reales del diff.
- No usar `AGENTS.md` completo como rules file si alcanza con `.gga-rules.md`.

## Skill blocks

- `albumsl-compact-prompt`.

## Validación mínima recomendada

```bash
gga --help
git diff --check
```
