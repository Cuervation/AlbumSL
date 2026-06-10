### albumsl-compact-prompt

- Responder breve y directo.
- No repetir contexto ya cubierto por `AGENTS.md` o `docs/`.
- Leer solo archivos necesarios para la tarea.
- Reportar archivos, validacion, y riesgos.
- No ocultar warnings, fallos ni tradeoffs.

### albumsl-feature-slice

- Leer `AGENTS.md` y el agente especifico antes de cambiar archivos.
- Separar cambios por capa: domain, application, contracts, infra-firebase, functions, apps/web, docs, tests.
- `packages/domain` y `packages/application` no pueden importar Firebase, React ni functions.
- `functions` debe quedar como adapter fino.
- `apps/web` no puede contener logica sensible del album.
- Operaciones sensibles pasan por backend/server-side.
- Agregar tests a toda feature sensible.
- Actualizar docs relacionadas y `docs/DECISIONS.md` si hay decision nueva.

### albumsl-firebase-backend

- Usar Admin SDK solo en backend: `functions` o `packages/infra-firebase`.
- No meter Firebase en `packages/domain` ni `packages/application`.
- Mantener Cloud Functions finas: validar auth, mapear request, llamar use case, devolver response.
- Usar `request.auth.uid` como identidad confiable.
- Mapear errores a `HttpsError` sin exponer stack traces.
- Usar transactions para inventory, claims, openings, counters, o auditoria.
- No permitir que frontend escriba colecciones sensibles.

### albumsl-frontend-ui

- Mantener mobile-first y UI simple.
- Separar hooks, services y componentes.
- No duplicar logica de dominio en React.
- No escribir datos sensibles directo a Firestore.
- No asignar figuritas desde frontend.
- No crear claims/openings desde frontend.
- No modificar `userStickers.quantity` ni contadores de `userAlbums`.

### albumsl-qa-check

- Ejecutar `npm run validate` cuando la tarea lo requiera.
- En cambios sensibles, agregar tests unitarios criticos.
- Verificar bordes, regresiones y cobertura.
- Mantener TypeScript estricto y sin `any` salvo justificacion.
- Confirmar que docs relacionadas quedaron alineadas.
- Reportar comandos, resultados, warnings y riesgos pendientes.

### albumsl-security-review

- Revisar default deny en Firestore Rules.
- Revisar Cloud Functions sensibles y ownership por `request.auth.uid`.
- Bloquear escrituras sensibles desde frontend por defecto.
- Revisar autoasignacion de figuritas, claims duplicados y `packOpenings`.
- Revisar incrementos de `userStickers.quantity` y counters de `userAlbums`.
- Revisar audit logs, secretos, credenciales y hardcodes.
- Reportar hallazgos por severidad con archivo y linea cuando sea posible.

### caveman

- Modo terso solo cuando el usuario lo pide o la tarea pide ahorro de tokens.
- Mantener sustancia tecnica exacta; matar solo relleno.
- Usar fragmentos cortos, sin pleasantries ni hedging.
- Volver a normal si hace falta claridad, riesgo o secuencias sensibles.

### find-skills

- Usar cuando el usuario busca una habilidad o capability nueva.
- Buscar primero una skill existente antes de improvisar.
- Verificar calidad antes de recomendar o instalar.
- Si aplica, presentar nombre, utilidad y comando de instalacion.

### security-best-practices

- Usar solo para requests explicitos de seguridad, reportes, o secure-by-default en Python/JS/TS/Go.
- Identificar lenguaje/framework y cargar solo refs relevantes.
- Si se reportan hallazgos, priorizar impacto y dar linea/archivo.
- No exagerar por falta de TLS/HSTS en dev/local.
- Preferir guidance oficial si hay que consultar docs externas.

### security-threat-model

- Usar solo cuando el usuario pide threat modeling o abuse-path analysis.
- Anclar cada afirmacion a evidencia del repo y mantener supuestos explicitos.
- Enumerar boundaries, assets, entrypoints y attacker goals concretos.
- Mantener pocos threats, pero de alta calidad y accionables.
- Pedir confirmacion de supuestos clave si cambian la priorizacion.

### vercel-react-best-practices

- Atacar waterfalls primero: paralelizar fetches y mover awaits solo donde se usan.
- Preferir imports directos y lazy loading para reducir bundle size.
- Mantener Server Components por defecto; marcar `use client` solo si hace falta interactividad.
- Evitar estado o efectos innecesarios; memoizar solo trabajo caro.
- Pasar el minimo posible a componentes client.
- Optimizar render con deps primitivas, `startTransition`, y derivar estado en render.

### branch-pr

- Usar al crear, abrir o preparar PRs para review.
- Cada PR debe linkear un issue aprobado y llevar exactamente un label `type:*`.
- Branch names deben seguir `type/description` en minuscula.
- El body del PR debe incluir issue link, resumen, tabla de cambios y plan de tests.
- No usar `Co-Authored-By`; commit messages deben ser conventional commits.

### chained-pr

- Activar cuando el PR supera ~400 changed lines o el user pide stacked/chained PRs.
- Mantener cada PR reviewable y con una sola unidad de trabajo.
- Si el diff no se puede partir limpio, pedir `size:exception`.
- Incluir dependencia clara entre PRs y no mezclar estrategias en la misma cadena.
- Seguir la estrategia de delivery ya acordada antes de aplicar.

### cognitive-doc-design

- Abrir con la decision, accion u outcome; el contexto va despues.
- Usar progressive disclosure, chunking y signposting.
- Preferir tablas, checklists y ejemplos para bajar carga cognitiva.
- Hacer explicito que revisar primero y que queda fuera de scope.
- Diseñar docs para reviewers, no para recordar de memoria.

### comment-writer

- Ser util rapido: arrancar con el punto accionable.
- Tono calido y directo; sin sonar corporativo.
- Mantener respuestas cortas, 1 a 3 parrafos o bullets compactos.
- Explicar el por que tecnico cuando pidas un cambio.
- Evitar pile-ons; comentar solo lo de mayor valor.

### issue-creation

- Usar templates; no crear issues vacios.
- Buscar duplicados antes de abrir.
- Todo issue nace `status:needs-review` y necesita `status:approved` antes de un PR.
- Preguntas van a Discussions, no a issues.
- Mantener descripcion, pasos, expected/actual y area afectada completos.

### judgment-day

- Resolver skill registry antes de lanzar jueces y pasar el mismo Project Standards a ambos.
- Lanzar dos judges ciegos en paralelo; no revisar el codigo uno mismo.
- Esperar ambos verdicts antes de sintetizar.
- Pedir permiso antes de aplicar fixes del Round 1.
- Re-judgear despues de cada fix y solo terminar con estado terminal.

### playwright-interactive

- Usar `js_repl` persistente para iterar sin reiniciar todo el toolchain.
- Separar pasadas funcionales y visuales.
- Mantener handles vivos y relanzar solo si cambiaron contexto o proceso.
- Reusar viewport explicito para iteracion y native-window para validacion final separada.
- Capturar evidencia de pantalla cuando el signoff dependa de UI.

### skill-creator

- Usar solo para skills nuevas o actualizaciones reales, no para docs triviales.
- Seguir el estilo LLM-first del repo y mantener el skill conciso.
- Trigger words deben quedar en el `description`; no agregar seccion Keywords.
- Poner templates o schemas en `assets/` y referencias en `references/`.
- Registrar el skill en `AGENTS.md` si es project skill.

### vercel-deploy

- Deploy preview por defecto; production solo si el usuario lo pide explicitamente.
- Verificar `vercel` sin escalation antes de deployar.
- Si faltan credenciales o la red bloquea, usar el fallback o escalar solo el deploy real.
- No validar el URL con fetch/curl; devolver el link de preview/claim.
- Dar timeout largo para builds que tarden.

### work-unit-commits

- Cada commit debe representar una unidad de trabajo entregable.
- No partir por tipo de archivo si rompe la historia.
- Tests y docs van con el cambio que verifican o explican.
- Los commits deben ser candidatos reales a PR reviewable.
- Si la tarea crece, usar work units como base de chained PRs.
