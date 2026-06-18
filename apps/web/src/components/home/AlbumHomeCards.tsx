import { Link } from "react-router-dom";

import { HomeIcon, type HomeIconName } from "./HomeIcon";

interface HomeProgressCardProps {
  readonly percentage: number;
  readonly collected: number;
  readonly missing: number;
}

interface HomeCollectionCardProps {
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly pastedCount: number;
}

interface HomeActionCardProps {
  readonly className: string;
  readonly eyebrow: string;
  readonly icon: HomeIconName;
  readonly title: string;
  readonly description: string;
  readonly action: string;
  readonly to: string;
}

export function HomeProgressCard({
  percentage,
  collected,
  missing,
}: HomeProgressCardProps): React.JSX.Element {
  const safePercentage = Math.min(Math.max(Math.round(percentage), 0), 100);

  return (
    <section className="album-home-panel album-home-progress" aria-labelledby="home-progress-title">
      <h2 id="home-progress-title">Tu progreso</h2>
      <div
        className="album-home-progress-ring"
        style={{ "--album-progress": `${safePercentage * 3.6}deg` } as React.CSSProperties}
        aria-label={`${safePercentage}% del álbum completado`}
      >
        <span>
          <strong>{safePercentage}%</strong>
          <small>del álbum</small>
        </span>
      </div>
      <dl className="album-home-progress-stats">
        <div>
          <dt>{collected}</dt>
          <dd>Conseguidos</dd>
        </div>
        <div>
          <dt>{missing}</dt>
          <dd>Faltantes</dd>
        </div>
      </dl>
    </section>
  );
}

export function HomeCollectionCard({
  newCount,
  repeatedCount,
  pastedCount,
}: HomeCollectionCardProps): React.JSX.Element {
  const collectionRows = [
    { label: "Nuevos", value: newCount, icon: "stickers" as const },
    { label: "Repetidos", value: repeatedCount, icon: "duplicates" as const },
    { label: "Pegados", value: pastedCount, icon: "album" as const },
  ];

  return (
    <section className="album-home-panel album-home-collection" aria-labelledby="home-cards-title">
      <h2 id="home-cards-title">Mis cromos</h2>
      <div className="album-home-collection-list">
        {collectionRows.map((row) => (
          <Link key={row.label} to="/duplicates" className="album-home-collection-row">
            <span className="album-home-stat-icon">
              <HomeIcon name={row.icon} />
            </span>
            <span className="album-home-stat-copy">
              <strong>{row.value}</strong>
              <small>{row.label}</small>
            </span>
            <span className="album-home-chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
      <Link className="album-home-button album-home-button--red" to="/duplicates">
        Ver mis cromos
      </Link>
    </section>
  );
}

export function HomeActionCard({
  className,
  eyebrow,
  icon,
  title,
  description,
  action,
  to,
}: HomeActionCardProps): React.JSX.Element {
  return (
    <section className={`album-home-panel album-home-action ${className}`}>
      <h2>{eyebrow}</h2>
      <div className="album-home-action-copy">
        <span className="album-home-action-icon" aria-hidden="true">
          <HomeIcon name={icon} />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
      </div>
      <Link className="album-home-button album-home-button--blue" to={to}>
        {action}
      </Link>
    </section>
  );
}

export function HomeDashboardSkeleton(): React.JSX.Element {
  return (
    <div
      className="album-home-dashboard album-home-dashboard--skeleton"
      role="status"
      aria-label="Preparando inicio"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`album-home-skeleton album-home-skeleton--${index + 1}`} />
      ))}
    </div>
  );
}
