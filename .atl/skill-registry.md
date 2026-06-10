# Skill Registry

Indice minimo. Un delegador lo lee una sola vez por sesion, resuelve skills por tipo de tarea, y luego inyecta solo los bloques compactos necesarios desde `.atl/skill-rules.md`.

Regla simple: buscar el heading exacto `### <skill-name>` en `.atl/skill-rules.md` y leer solo hasta el siguiente heading del mismo nivel.

Subagentes no leen este archivo, ni `.atl/skill-rules.md`, ni `SKILL.md`: reciben reglas ya resueltas.

## Protocolo de resolucion

1. Priorizar skills del proyecto.
2. Deduplicar por nombre.
3. Omitir `sdd-*`, `_shared` y `skill-registry`.
4. Seleccionar solo skills que coincidan con ruta + tarea.
5. Inyectar unicamente los bloques compactos encontrados.

## Convenciones minimas

- Skills locales: `.codex/skills/`
- Skills globales curadas: `C:\Users\celestinoh\.codex\skills\`
- Fuente de verdad para reglas compactas: `.atl/skill-rules.md`

## Trigger / Skill / Rules locator / Source

| Trigger                                                                                                                         | Skill                       | Rules locator                     | Source                                                              |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| user asks to save tokens, be brief, avoid repeating documented context, or produce concise implementation summaries             | albumsl-compact-prompt      | `### albumsl-compact-prompt`      | `.codex/skills/albumsl-compact-prompt/SKILL.md`                     |
| feature work touching domain/application/contracts/infra-firebase/functions/apps/web/docs/tests while respecting AlbumSL layers | albumsl-feature-slice       | `### albumsl-feature-slice`       | `.codex/skills/albumsl-feature-slice/SKILL.md`                      |
| Cloud Functions, Firebase Admin SDK, Firestore repos, transactions, callable functions, or backend-sensitive operations         | albumsl-firebase-backend    | `### albumsl-firebase-backend`    | `.codex/skills/albumsl-firebase-backend/SKILL.md`                   |
| React pages, routes, hooks, services, components, mobile-first UX, or frontend integration with Cloud Functions                 | albumsl-frontend-ui         | `### albumsl-frontend-ui`         | `.codex/skills/albumsl-frontend-ui/SKILL.md`                        |
| validating changes, reviewing tests, edge cases, or ensuring validate passes                                                    | albumsl-qa-check            | `### albumsl-qa-check`            | `.codex/skills/albumsl-qa-check/SKILL.md`                           |
| Firestore Rules, ownership, claims, pack openings, user stickers, album counters, audit logs, secrets, or abuse paths           | albumsl-security-review     | `### albumsl-security-review`     | `.codex/skills/albumsl-security-review/SKILL.md`                    |
| user asks caveman mode, talk like caveman, use caveman, less tokens, or be brief                                                | caveman                     | `### caveman`                     | `.codex/skills/caveman/SKILL.md`                                    |
| user asks how to do X, find a skill, or extend capabilities with an installable skill                                           | find-skills                 | `### find-skills`                 | `.codex/skills/find-skills/SKILL.md`                                |
| explicit security best-practices guidance, report, or secure-by-default code in Python/JS/TS/Go                                 | security-best-practices     | `### security-best-practices`     | `.codex/skills/security-best-practices/SKILL.md`                    |
| explicit threat model or abuse-path analysis for a repo or path                                                                 | security-threat-model       | `### security-threat-model`       | `.codex/skills/security-threat-model/SKILL.md`                      |
| React/Next performance, data fetching, bundle optimization, or refactoring                                                      | vercel-react-best-practices | `### vercel-react-best-practices` | `.codex/skills/vercel-react-best-practices/SKILL.md`                |
| creating, opening, or preparing PRs for review                                                                                  | branch-pr                   | `### branch-pr`                   | `C:\Users\celestinoh\.codex\skills\branch-pr\SKILL.md`              |
| PRs over 400 lines, stacked PRs, or review slices                                                                               | chained-pr                  | `### chained-pr`                  | `C:\Users\celestinoh\.codex\skills\chained-pr\SKILL.md`             |
| writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs                                                  | cognitive-doc-design        | `### cognitive-doc-design`        | `C:\Users\celestinoh\.codex\skills\cognitive-doc-design\SKILL.md`   |
| PR feedback, issue replies, reviews, Slack messages, or GitHub comments                                                         | comment-writer              | `### comment-writer`              | `C:\Users\celestinoh\.codex\skills\comment-writer\SKILL.md`         |
| creating GitHub issues, bug reports, or feature requests                                                                        | issue-creation              | `### issue-creation`              | `C:\Users\celestinoh\.codex\skills\issue-creation\SKILL.md`         |
| judgment day, dual review, adversarial review, juzgar                                                                           | judgment-day                | `### judgment-day`                | `C:\Users\celestinoh\.codex\skills\judgment-day\SKILL.md`           |
| persistent browser or Electron interaction for iterative UI debugging                                                           | playwright-interactive      | `### playwright-interactive`      | `C:\Users\celestinoh\.codex\skills\playwright-interactive\SKILL.md` |
| new skills, agent instructions, or documenting AI usage patterns                                                                | skill-creator               | `### skill-creator`               | `C:\Users\celestinoh\.codex\skills\skill-creator\SKILL.md`          |
| deploy apps or websites to Vercel, preview or production                                                                        | vercel-deploy               | `### vercel-deploy`               | `C:\Users\celestinoh\.codex\skills\vercel-deploy\SKILL.md`          |
| implementation, commit splitting, chained PRs, or keeping tests/docs with code                                                  | work-unit-commits           | `### work-unit-commits`           | `C:\Users\celestinoh\.codex\skills\work-unit-commits\SKILL.md`      |
