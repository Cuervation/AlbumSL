import { Link } from "react-router-dom";

export function HomePage(): React.JSX.Element {
  return (
    <main className="page hero-page album-hub-page">
      <section className="hero-content album-hub-hero">
        <div>
          <p className="eyebrow">San Lorenzo de Almagro</p>
          <h1>Album virtual azulgrana</h1>
          <p>
            Entrá al ritual de coleccionar: revisá tus figus, completá la Libertadores 2014 y abrí
            el sobre diario desde un mismo lugar.
          </p>
        </div>
      </section>

      <section className="album-hub-grid" aria-label="Accesos principales del album">
        {HUB_LINKS.map((item) => (
          <Link
            key={item.title}
            className={`album-hub-card album-hub-card--${item.variant}`}
            to={item.to}
          >
            <span className="album-hub-card-kicker">{item.kicker}</span>
            <span className="album-hub-card-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="album-hub-card-title">{item.title}</span>
            <span className="album-hub-card-copy">{item.copy}</span>
            <span className="album-hub-card-action">Entrar</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

const HUB_LINKS = [
  {
    title: "Mis Figus",
    copy: "Mirá tus figuritas y repetidas.",
    kicker: "Inventario",
    icon: "FIGUS",
    to: "/duplicates",
    variant: "figus",
  },
  {
    title: "Mi Álbum",
    copy: "Pegá figuritas y completá la colección.",
    kicker: "Colección",
    icon: "ALBUM",
    to: "/album",
    variant: "album",
  },
  {
    title: "Abrir Sobres",
    copy: "Reclamá y abrí tu sobre diario.",
    kicker: "Sobre diario",
    icon: "SOBRE",
    to: "/open-pack",
    variant: "packs",
  },
] as const;
