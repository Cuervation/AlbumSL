# Gentle-AI en AlbumSL

## Objetivo

Gentle-AI se usa como tooling local opcional para mejorar el trabajo con Codex, SDD, skills,
memoria y revision de commits con GGA.

No forma parte del runtime, no se deploya y no modifica el flujo Spark-only.

## Instalacion Windows

```powershell
scoop bucket add gentleman https://github.com/Gentleman-Programming/scoop-bucket
scoop install gentle-ai
gentle-ai --version
```

## Uso local

- `AGENTS.md` sigue siendo la referencia operativa del proyecto.
- `.gga` define la configuracion local de review para GGA.
- Gentle-AI solo acompana el trabajo local; no cambia el runtime ni el deploy.
