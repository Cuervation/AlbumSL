# Roadmap

## MVP 0
- Definir base técnica y documental.
- Levantar monorepo.
- Establecer contratos y dominio mínimo.
- Configurar Firebase y ambientes.
- Crear reglas base de seguridad.

## MVP 1
- Auth y perfil básico.
- Catálogo de figuritas.
- Álbum y progreso.
- Apertura de sobres.
- Sobre diario.
- Auditoría de eventos críticos.

## Post-MVP
- Repetidas con mayor detalle.
- Sobre por estadio.
- Admin básico.
- Observabilidad.
- CI/CD.

## Funcionalidades futuras
- Intercambio entre usuarios.
- Sobres por promociones.
- Sobres por eventos.
- Geocerca avanzada.
- Panel admin completo.
- Notificaciones.
- Social features.
- Ranking y logros.

## Orden recomendado de implementación
1. Base DevOps del repo.
2. Dominio y contratos.
3. Firebase schema y security rules.
4. Auth y perfil.
5. Catálogo de figuritas.
6. Apertura de sobres.
7. UI del álbum.
8. Repetidas.
9. Sobre diario.
10. Sobre por estadio.
11. Admin básico.
12. Observabilidad.
13. CI/CD.
14. Hardening final.

## Notas de priorización
- Todo lo sensible debe pasar por backend desde el principio.
- La UI puede avanzar en paralelo si consume contratos estables.
- Las features futuras deben entrar como slices independientes, no como código mezclado en el núcleo.

