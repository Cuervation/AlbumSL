import { Link } from "react-router-dom";

export function HomePage(): React.JSX.Element {
  return (
    <main className="page hero-page album-hub-page experience-shell app-experience-shell">
      <div className="stadium-backdrop" aria-hidden="true" />
      <section className="experience-stage app-stage" aria-labelledby="album-hub-title">
        <div className="experience-skyline" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="album-hub-hero">
          <p className="eyebrow">San Lorenzo de Almagro</p>
          <h1 id="album-hub-title">Tu album azulgrana</h1>
          <p>
            Entra a la cancha: revisa tus figus, abri sobres y completa la Libertadores 2014 desde
            un hub con espiritu de juego.
          </p>
        </div>

        <div className="experience-objects" aria-label="Accesos principales del album">
          <Link
            className="experience-card experience-card--figus"
            to="/duplicates"
            aria-label="Abrir Mis Figus"
          >
            <span className="experience-card-kicker">Inventario</span>
            <span className="figus-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="experience-card-title">Mis Figus</span>
            <span className="experience-card-copy">Tus cromos repetidos y listos para mirar.</span>
          </Link>

          <Link
            className="experience-card experience-card--album experience-card--featured"
            to="/album"
            aria-label="Abrir Mi Album"
          >
            <span className="experience-card-kicker">Coleccion</span>
            <span className="album-object" aria-hidden="true">
              <span className="album-object-cover">SL</span>
              <span className="album-object-page" />
            </span>
            <span className="experience-card-title">Mi Album</span>
            <span className="experience-card-copy">Pega figuritas y persegui el 100% campeon.</span>
          </Link>

          <Link
            className="experience-card experience-card--packs"
            to="/open-pack"
            aria-label="Abrir Sobres"
          >
            <span className="experience-card-kicker">Sobre diario</span>
            <span className="pack-object" aria-hidden="true">
              <span />
            </span>
            <span className="experience-card-title">Abrir Sobres</span>
            <span className="experience-card-copy">Reclama y abri tu sobre del dia.</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
