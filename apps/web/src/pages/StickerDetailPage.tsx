import { canPasteSticker, type AlbumStickerView } from "@albumsl/domain";
import { Link, useParams } from "react-router-dom";

import { getAlbumStatusClassName, getAlbumStatusLabel } from "../features/album/album-view-labels";
import { useAlbumData } from "../features/album/useAlbumData";
import { usePasteSticker } from "../features/album/usePasteSticker";

export function StickerDetailPage(): React.JSX.Element {
  const { stickerId } = useParams();
  const { albumStickers, loading, error, refresh } = useAlbumData();
  const pasteSticker = usePasteSticker();
  const albumSticker = albumStickers.find((item) => item.sticker.id === stickerId);

  async function handlePaste(): Promise<void> {
    if (!albumSticker) {
      return;
    }

    const result = await pasteSticker.paste(albumSticker.sticker.id);

    if (result) {
      await refresh();
    }
  }

  if (loading) {
    return (
      <main className="page album-page">
        <p className="state-message">Cargando figurita...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page album-page">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  if (!albumSticker) {
    return (
      <main className="page album-page">
        <p className="state-message">No encontramos esa figurita.</p>
        <Link className="primary-link" to="/album">
          Volver al album
        </Link>
      </main>
    );
  }

  return (
    <main className="page album-page">
      <section className="sticker-detail">
        <div className="sticker-detail-art">
          {albumSticker.sticker.imageUrl.startsWith("placeholder://") ? (
            <span>#{albumSticker.sticker.number}</span>
          ) : (
            <img
              src={albumSticker.sticker.imageUrl}
              alt={albumSticker.sticker.title}
              loading="lazy"
            />
          )}
        </div>
        <div className="sticker-detail-body">
          <Link className="back-link" to="/album">
            Volver al album
          </Link>
          <span className={`album-status ${getAlbumStatusClassName(albumSticker.status)}`}>
            {getAlbumStatusLabel(albumSticker.status)}
          </span>
          <h1>{albumSticker.sticker.title}</h1>
          <p>{albumSticker.sticker.description}</p>

          <StickerDetailStats albumSticker={albumSticker} />

          {albumSticker.sticker.tags.length > 0 ? (
            <div className="tag-list">
              {albumSticker.sticker.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

          {albumSticker.userSticker && canPasteSticker(albumSticker.userSticker) ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => void handlePaste()}
              disabled={pasteSticker.loadingStickerId === albumSticker.sticker.id}
            >
              {pasteSticker.loadingStickerId === albumSticker.sticker.id
                ? "Pegando..."
                : "Pegar en album"}
            </button>
          ) : (
            <p className="state-message compact">
              Necesitas una figurita disponible sin pegar para usar esta accion.
            </p>
          )}

          {pasteSticker.error ? <p className="error-message">{pasteSticker.error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function StickerDetailStats({
  albumSticker,
}: {
  readonly albumSticker: AlbumStickerView;
}): React.JSX.Element {
  return (
    <dl className="sticker-detail-stats">
      <div>
        <dt>Numero</dt>
        <dd>#{albumSticker.sticker.number}</dd>
      </div>
      <div>
        <dt>Categoria</dt>
        <dd>{albumSticker.sticker.category}</dd>
      </div>
      <div>
        <dt>Epoca</dt>
        <dd>{albumSticker.sticker.era}</dd>
      </div>
      <div>
        <dt>Rareza</dt>
        <dd>{albumSticker.sticker.rarity}</dd>
      </div>
      <div>
        <dt>Cantidad total</dt>
        <dd>{albumSticker.userSticker?.quantity ?? 0}</dd>
      </div>
      <div>
        <dt>Pegadas</dt>
        <dd>{albumSticker.userSticker?.pastedQuantity ?? 0}</dd>
      </div>
      <div>
        <dt>Repetidas</dt>
        <dd>{albumSticker.repeatedQuantity}</dd>
      </div>
    </dl>
  );
}
