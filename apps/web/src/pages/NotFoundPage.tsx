import { Link } from "react-router-dom";

export function NotFoundPage(): React.JSX.Element {
  return (
    <main className="page not-found-page">
      <section>
        <p className="eyebrow">404</p>
        <h1>Pagina no encontrada</h1>
        <p>La ruta que buscabas no existe.</p>
        <Link className="primary-link" to="/">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
