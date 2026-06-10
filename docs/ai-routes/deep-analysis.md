# Route - Análisis profundo

## Cuándo usar

Usarlo solo si el usuario pide explícitamente:

- auditoría completa
- rediseño de arquitectura
- investigación de bug complejo
- seguridad crítica
- cambio sensible de backend
- migración de infraestructura
- preparación de release importante

## Regla

- Empezar por el route principal del dominio.
- Abrir rutas adicionales solo si el problema cruza dominios.
- Justificar brevemente qué se leyó y por qué.

## Skill blocks

- `security-threat-model` cuando haya amenazas o abuso de cliente.
- `security-best-practices` cuando la revisión sea de seguridad en JS/TS/Go.
- `cognitive-doc-design` cuando la salida sea documentación o diseño de lectura.
- `albumsl-qa-check` para cierre y verificación.

## Validación

La validación depende del dominio principal; usar la del route base y sumar las verificaciones críticas del análisis.
