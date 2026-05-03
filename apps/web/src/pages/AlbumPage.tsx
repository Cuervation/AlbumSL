import { StickerCategory, StickerEra, StickerRarity, type AlbumStickerView } from "@albumsl/domain";
import { Link } from "react-router-dom";

import { getAlbumStatusClassName, getAlbumStatusLabel } from "../features/album/album-view-labels";
import { AlbumStatusFilter, useAlbumFilters } from "../features/album/useAlbumFilters";
import { useAlbumData } from "../features/album/useAlbumData";

export function AlbumPage(): React.JSX.Element {
  const { albumStickers, progress, loading, error, refresh } = useAlbumData();
  const { filters, filteredStickers, updateFilter, resetFilters } = useAlbumFilters(albumStickers);

  return (
    <main className="page album-page">
      <section className="album-hero">
        <div>
          <p className="eyebrow">Mi Album</p>
          <h1>Tu coleccion azulgrana</h1>
          <p>
            Mira que figuritas ya conseguiste, cuales pegaste y cuales todavia faltan para completar
            el album.
          </p>
        </div>
        <button type="button" className="ghost-button" onClick={() => void refresh()}>
          Actualizar
        </button>
      </section>

      <section className="album-progress-grid" aria-label="Progreso del album">
        <ProgressCard label="Total" value={progress.totalStickers} />
        <ProgressCard label="Conseguidas" value={progress.collectedStickers} />
        <ProgressCard label="Pegadas" value={progress.pastedStickers} />
        <ProgressCard label="Repetidas" value={progress.repeatedStickers} />
        <ProgressCard label="Completitud" value={`${progress.completionPercentage}%`} />
      </section>

      <section className="album-filters" aria-label="Filtros del album">
        <label>
          Buscar
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Titulo, descripcion o tag"
          />
        </label>

        <label>
          Categoria
          <select
            value={filters.category}
            onChange={(event) =>
              updateFilter("category", event.target.value as typeof filters.category)
            }
          >
            <option value="ALL">Todas</option>
            {Object.values(StickerCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rareza
          <select
            value={filters.rarity}
            onChange={(event) =>
              updateFilter("rarity", event.target.value as typeof filters.rarity)
            }
          >
            <option value="ALL">Todas</option>
            {Object.values(StickerRarity).map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </label>

        <label>
          Epoca
          <select
            value={filters.era}
            onChange={(event) => updateFilter("era", event.target.value as typeof filters.era)}
          >
            <option value="ALL">Todas</option>
            {Object.values(StickerEra).map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value as typeof filters.status)
            }
          >
            <option value={AlbumStatusFilter.ALL}>Todas</option>
            <option value={AlbumStatusFilter.COLLECTED}>Conseguidas</option>
            <option value={AlbumStatusFilter.PASTED}>Pegadas</option>
            <option value={AlbumStatusFilter.MISSING}>Faltantes</option>
            <option value={AlbumStatusFilter.REPEATED}>Repetidas</option>
          </select>
        </label>

        <button type="button" className="ghost-button" onClick={resetFilters}>
          Limpiar
        </button>
      </section>

      {loading ? <p className="state-message">Cargando tu album...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {!loading && !error && filteredStickers.length === 0 ? (
        <p className="state-message">No hay figuritas para los filtros elegidos.</p>
      ) : null}

      <section className="album-grid" aria-label="Figuritas del album">
        {filteredStickers.map((albumSticker) => (
          <AlbumStickerCard key={albumSticker.sticker.id} albumSticker={albumSticker} />
        ))}
      </section>
    </main>
  );
}

function ProgressCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | number;
}): React.JSX.Element {
  return (
    <article className="album-progress-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AlbumStickerCard({
  albumSticker,
}: {
  readonly albumSticker: AlbumStickerView;
}): React.JSX.Element {
  const { sticker } = albumSticker;
  const statusClassName = getAlbumStatusClassName(albumSticker.status);
  const shouldShowImage = albumSticker.isCollected || albumSticker.isPasted;

  return (
    <Link className={`album-slot ${statusClassName}`} to={`/album/${sticker.id}`}>
      <div className="album-slot-art">
        {shouldShowImage ? (
          sticker.imageUrl.startsWith("placeholder://") ? (
            <span>#{sticker.number}</span>
          ) : (
            <img src={sticker.imageUrl} alt={sticker.title} loading="lazy" />
          )
        ) : (
          <span>?</span>
        )}
      </div>
      <div className="album-slot-body">
        <span className="sticker-number">#{sticker.number}</span>
        <h2>{sticker.title}</h2>
        <p>
          {sticker.category} · {sticker.rarity}
        </p>
        <span className={`album-status ${statusClassName}`}>
          {getAlbumStatusLabel(albumSticker.status)}
        </span>
      </div>
    </Link>
  );
}
