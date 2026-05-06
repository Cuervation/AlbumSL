import { StickerCategory, StickerEra, StickerRarity, type AlbumStickerView } from "@albumsl/domain";
import { Link } from "react-router-dom";

import { getAlbumStatusClassName, getAlbumStatusLabel } from "../features/album/album-view-labels";
import { AlbumStatusFilter, useAlbumFilters } from "../features/album/useAlbumFilters";
import { useAlbumData } from "../features/album/useAlbumData";

export function AlbumPage(): React.JSX.Element {
  const { albumStickers, progress, loading, error, refresh } = useAlbumData();
  const { filters, filteredStickers, updateFilter, resetFilters } = useAlbumFilters(albumStickers);
  const hasNoCollectedStickers = !loading && !error && progress.collectedStickers === 0;
  const completion = Math.max(0, Math.min(100, progress.completionPercentage));
  const libertadoresStickers = albumStickers.filter(isLibertadores2014Sticker);
  const filteredLibertadoresStickers = filteredStickers.filter(isLibertadores2014Sticker);
  const filteredOtherStickers = filteredStickers.filter(
    (albumSticker) => !isLibertadores2014Sticker(albumSticker),
  );
  const libertadoresProgress = getCollectionProgress(libertadoresStickers);

  return (
    <main className="page album-page">
      <section className="album-hero album-hero--featured">
        <div className="album-hero-copy">
          <p className="eyebrow">Mi Album</p>
          <h1>Tu coleccion azulgrana</h1>
          <p>
            Mira que figuritas ya conseguiste, cuales pegaste y cuales todavia faltan para completar
            el album.
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

      <section className="album-progress-banner" aria-label="Resumen visual del album">
        <div className="album-progress-banner-copy">
          <p className="eyebrow">Progreso</p>
          <h2>{progress.completionPercentage}% completo</h2>
          <p>
            {progress.collectedStickers} conseguidas, {progress.pastedStickers} pegadas y{" "}
            {progress.repeatedStickers} repetidas.
          </p>
        </div>
        <div className="album-progress-meter" aria-hidden="true">
          <span style={{ width: `${completion}%` }} />
        </div>
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
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : null}
      {hasNoCollectedStickers ? (
        <div className="album-empty-state">
          <strong>Todavia no tenes figuritas.</strong>
          <span>Abri un sobre para empezar la coleccion.</span>
          <Link className="primary-link" to="/open-pack">
            Ir a sobres
          </Link>
        </div>
      ) : null}
      {!loading && !error && !hasNoCollectedStickers && filteredStickers.length === 0 ? (
        <p className="state-message">No hay figuritas para los filtros elegidos.</p>
      ) : null}

      {filteredLibertadoresStickers.length > 0 ? (
        <CollectionSection
          title="Libertadores 2014"
          description="Casilleros de la coleccion campeona: faltantes, disponibles y pegadas en una sola pagina."
          progress={libertadoresProgress}
          stickers={filteredLibertadoresStickers}
        />
      ) : null}

      {filteredOtherStickers.length > 0 ? (
        <section className="album-collection-section" aria-label="Otras figuritas del album">
          <div className="album-collection-header">
            <div>
              <p className="eyebrow">AlbumSL</p>
              <h2>Otras figuritas</h2>
              <p>Resto del catalogo azulgrana disponible con los mismos estados del album.</p>
            </div>
          </div>
          <div className="album-grid album-slot-grid">
            {filteredOtherStickers.map((albumSticker) => (
              <AlbumStickerCard key={albumSticker.sticker.id} albumSticker={albumSticker} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function CollectionSection({
  title,
  description,
  progress,
  stickers,
}: {
  readonly title: string;
  readonly description: string;
  readonly progress: CollectionProgress;
  readonly stickers: readonly AlbumStickerView[];
}): React.JSX.Element {
  const completion = progress.total > 0 ? Math.round((progress.pasted / progress.total) * 100) : 0;

  return (
    <section className="album-collection-section" aria-labelledby="libertadores-2014-title">
      <div className="album-collection-header">
        <div>
          <p className="eyebrow">Coleccion</p>
          <h2 id="libertadores-2014-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="collection-progress-pill" aria-label="Progreso Libertadores 2014">
          <strong>
            {progress.pasted} / {progress.total}
          </strong>
          <span>{progress.collected} conseguidas</span>
        </div>
      </div>

      <div className="collection-progress-meter" aria-hidden="true">
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="album-grid album-slot-grid">
        {stickers.map((albumSticker) => (
          <AlbumStickerCard key={albumSticker.sticker.id} albumSticker={albumSticker} />
        ))}
      </div>
    </section>
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

interface CollectionProgress {
  readonly total: number;
  readonly collected: number;
  readonly pasted: number;
}

function getCollectionProgress(stickers: readonly AlbumStickerView[]): CollectionProgress {
  return stickers.reduce<CollectionProgress>(
    (progress, albumSticker) => ({
      total: progress.total + 1,
      collected: progress.collected + (albumSticker.isCollected ? 1 : 0),
      pasted: progress.pasted + (albumSticker.isPasted ? 1 : 0),
    }),
    {
      total: 0,
      collected: 0,
      pasted: 0,
    },
  );
}

function isLibertadores2014Sticker(albumSticker: AlbumStickerView): boolean {
  return albumSticker.sticker.tags.includes("libertadores-2014");
}

function AlbumStickerCard({
  albumSticker,
}: {
  readonly albumSticker: AlbumStickerView;
}): React.JSX.Element {
  const { sticker } = albumSticker;
  const statusClassName = getAlbumStatusClassName(albumSticker.status);
  const shouldShowImage = albumSticker.isCollected || albumSticker.isPasted;
  const rarityClassName = `album-slot--${sticker.rarity.toLowerCase()}`;
  const availableQuantity = Math.max(
    0,
    (albumSticker.userSticker?.quantity ?? 0) - (albumSticker.userSticker?.pastedQuantity ?? 0),
  );
  const slotHint = getAlbumSlotHint(albumSticker, availableQuantity);
  const extraClassName = albumSticker.repeatedQuantity > 0 ? "album-slot--extra" : "";

  return (
    <Link
      className={`album-slot ${statusClassName} ${rarityClassName} ${extraClassName}`}
      to={`/album/${sticker.id}`}
      aria-label={`Figurita ${sticker.number}: ${sticker.title}. ${slotHint}`}
    >
      <span className="album-slot-number">#{sticker.number}</span>
      <div className="album-slot-art">
        {shouldShowImage ? (
          sticker.imageUrl.startsWith("placeholder://") ? (
            <span>#{sticker.number}</span>
          ) : (
            <img src={sticker.imageUrl} alt={sticker.title} loading="lazy" />
          )
        ) : (
          <span className="album-slot-empty-number">#{sticker.number}</span>
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
        <span className="album-slot-hint">{slotHint}</span>
      </div>
    </Link>
  );
}

function getAlbumSlotHint(albumSticker: AlbumStickerView, availableQuantity: number): string {
  if (!albumSticker.isCollected) {
    return "Casillero vacio";
  }

  if (albumSticker.isPasted && albumSticker.repeatedQuantity > 0) {
    return `Pegada, +${albumSticker.repeatedQuantity} repetida${
      albumSticker.repeatedQuantity === 1 ? "" : "s"
    }`;
  }

  if (albumSticker.isPasted) {
    return "Pegada en el album";
  }

  return `${availableQuantity} disponible${availableQuantity === 1 ? "" : "s"} para pegar`;
}
