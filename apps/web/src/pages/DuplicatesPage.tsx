import { Link } from "react-router-dom";

import { getAlbumStatusClassName, getAlbumStatusLabel } from "../features/album/album-view-labels";
import { useAlbumData } from "../features/album/useAlbumData";

export function DuplicatesPage(): React.JSX.Element {
  const { albumStickers, loading, error, refresh } = useAlbumData();
  const duplicatedStickers = albumStickers.filter(
    (albumSticker) => albumSticker.repeatedQuantity > 0,
  );

  return (
    <main className="page album-page">
      <section className="album-hero">
        <div>
          <p className="eyebrow">Mis repetidas</p>
          <h1>Figuritas para futuros intercambios</h1>
          <p>
            Una repetida es una figurita que ya tenes pegada o disponible mas de una vez. Por ahora
            solo las mostramos; los intercambios quedan para mas adelante.
          </p>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </section>

      {loading ? <p className="state-message">Cargando repetidas...</p> : null}
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && duplicatedStickers.length === 0 ? (
        <div className="state-message empty-state">
          <strong>Todavia no tenes repetidas.</strong>
          <span>Abri mas sobres para sumar figuritas y encontrar copias.</span>
          <Link className="primary-link" to="/open-pack">
            Ir a sobres
          </Link>
        </div>
      ) : null}

      <section className="duplicates-grid" aria-label="Figuritas repetidas">
        {duplicatedStickers.map((albumSticker) => (
          <Link
            key={albumSticker.sticker.id}
            className="duplicate-card"
            to={`/album/${albumSticker.sticker.id}`}
          >
            <div className="sticker-placeholder">
              {albumSticker.sticker.imageUrl.startsWith("placeholder://") ? (
                <>#{albumSticker.sticker.number}</>
              ) : (
                <img
                  src={albumSticker.sticker.imageUrl}
                  alt={albumSticker.sticker.title}
                  loading="lazy"
                />
              )}
            </div>
            <div>
              <span className={`album-status ${getAlbumStatusClassName(albumSticker.status)}`}>
                {getAlbumStatusLabel(albumSticker.status)}
              </span>
              <h2>{albumSticker.sticker.title}</h2>
              <p>
                {albumSticker.sticker.category} · {albumSticker.sticker.rarity}
              </p>
              <strong>{albumSticker.repeatedQuantity} repetida(s)</strong>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
