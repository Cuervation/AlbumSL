import { Link } from "react-router-dom";

import { SignOutButton } from "../components/SignOutButton";
import { UserAvatar } from "../components/UserAvatar";
import { useAlbumData } from "../features/album/useAlbumData";
import { useAuth } from "../features/auth/useAuth";

export function DashboardPage(): React.JSX.Element {
  const { currentUserProfile, error, user } = useAuth();
  const albumData = useAlbumData();
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
          <h2>{albumData.progress.completionPercentage}% completo</h2>
          <p>
            {albumData.progress.pastedStickers} pegadas · {albumData.progress.collectedStickers}{" "}
            conseguidas · {albumData.progress.repeatedStickers} repetidas.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link className="primary-link" to="/album">
            Ver mi album
          </Link>
          <Link className="primary-link" to="/catalog">
            Ver catalogo
          </Link>
          <Link className="primary-link secondary" to="/open-pack">
            Abrir sobre diario
          </Link>
          <Link className="primary-link secondary" to="/duplicates">
            Mis repetidas
          </Link>
          <SignOutButton />
        </div>
      </section>

      {albumData.error ? <p className="error-message">{albumData.error}</p> : null}

      {albumData.recentOpenings.length > 0 ? (
        <section className="dashboard-openings" aria-label="Ultimas aperturas">
          <p className="eyebrow">Ultimas aperturas</p>
          <h2>Sobres recientes</h2>
          <ul>
            {albumData.recentOpenings.map((opening) => (
              <li key={opening.id}>
                <span>{opening.source}</span>
                <strong>
                  +{opening.newCount} nuevas · {opening.repeatedCount} repetidas
                </strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
