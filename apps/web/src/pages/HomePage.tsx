import { Link } from "react-router-dom";

import { AlbumHomeHeader } from "../components/home/AlbumHomeHeader";
import {
  HomeActionCard,
  HomeCollectionCard,
  HomeDashboardSkeleton,
  HomeProgressCard,
} from "../components/home/AlbumHomeCards";
import { useAlbumData } from "../features/album/useAlbumData";
import { useAuth } from "../features/auth/useAuth";

export function HomePage(): React.JSX.Element {
  const { user, currentUserProfile } = useAuth();
  const { albumStickers, progress, loading, error } = useAlbumData();
  const displayName = currentUserProfile?.displayName ?? user?.displayName ?? "Cuervo";
  const collectedNotPasted = albumStickers.filter(
    (albumSticker) => albumSticker.isCollected && !albumSticker.isPasted,
  ).length;
  const missingStickers = Math.max(progress.totalStickers - progress.collectedStickers, 0);

  return (
    <main className="album-home-page">
      <section className="album-home-shell" aria-label="Inicio AlbumSL">
        <AlbumHomeHeader
          displayName={displayName}
          email={currentUserProfile?.email ?? user?.email ?? null}
          photoURL={currentUserProfile?.photoURL ?? user?.photoURL ?? null}
          authenticated={user !== null}
        />

        {loading ? (
          <HomeDashboardSkeleton />
        ) : (
          <>
            {error ? (
              <p className="album-home-alert" role="alert">
                {error}
              </p>
            ) : null}

            <div className="album-home-dashboard">
              <section className="album-home-hero">
                <p className="album-home-eyebrow">La pasión se colecciona</p>
                <Link className="album-home-button album-home-button--red" to="/album">
                  Ir a mi álbum
                </Link>
              </section>

              <HomeProgressCard
                percentage={progress.completionPercentage}
                collected={progress.collectedStickers}
                missing={missingStickers}
              />

              <HomeCollectionCard
                newCount={collectedNotPasted}
                repeatedCount={progress.repeatedStickers}
                pastedCount={progress.pastedStickers}
              />

              <HomeActionCard
                className="album-home-action--exchange"
                eyebrow="Zona de intercambio"
                icon="exchange"
                title={
                  progress.repeatedStickers > 0
                    ? `${progress.repeatedStickers} repetidas listas`
                    : "Prepará tus repetidas"
                }
                description="Revisá tus cromos disponibles para futuros intercambios."
                action="Ver mis repetidas"
                to="/duplicates"
              />

              <HomeActionCard
                className="album-home-action--packs"
                eyebrow="Sobres"
                icon="pack"
                title="Tenés un sobre para abrir"
                description="Abrilo y sumá nuevas figuritas a tu colección."
                action="Abrir sobres"
                to="/open-pack"
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
