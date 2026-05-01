import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";

export function HomePage(): React.JSX.Element {
  const { user } = useAuth();

  return (
    <main className="page hero-page">
      <section className="hero-content">
        <p className="eyebrow">San Lorenzo de Almagro</p>
        <h1>Album virtual azulgrana</h1>
        <p>
          Una base inicial para coleccionar figuritas, abrir sobres y seguir el progreso del album,
          con las operaciones sensibles reservadas para backend.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" to={user ? "/dashboard" : "/login"}>
            {user ? "Ir al dashboard" : "Ingresar"}
          </Link>
        </div>
      </section>
    </main>
  );
}
