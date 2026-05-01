import { Link } from "react-router-dom";

import { SignOutButton } from "../components/SignOutButton";
import { UserAvatar } from "../components/UserAvatar";
import { useAuth } from "../features/auth/useAuth";

export function DashboardPage(): React.JSX.Element {
  const { currentUserProfile, error, user } = useAuth();
  const displayName = currentUserProfile?.displayName ?? user?.displayName ?? "Cuervo";
  const email = currentUserProfile?.email ?? user?.email ?? null;
  const photoURL = currentUserProfile?.photoURL ?? user?.photoURL ?? null;

  return (
    <main className="page dashboard-page">
      <section className="dashboard-header">
        <UserAvatar displayName={displayName} email={email} photoURL={photoURL} />
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Hola, {displayName}</h1>
          {email ? <p>{email}</p> : null}
        </div>
      </section>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="album-placeholder" aria-label="Estado del album">
        <div>
          <p className="eyebrow">Album</p>
          <h2>Estado inicial</h2>
          <p>
            El progreso, figuritas y sobres van a vivir en casos de uso protegidos. Este dashboard
            solo muestra el perfil autenticado por ahora.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link className="primary-link" to="/catalog">
            Ver catalogo
          </Link>
          <Link className="primary-link secondary" to="/open-pack">
            Abrir sobre diario
          </Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
