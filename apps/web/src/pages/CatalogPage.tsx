import { useStickerCatalog } from "../features/sticker-catalog/useStickerCatalog";

export function CatalogPage(): React.JSX.Element {
  const { stickers, loading, error, refresh } = useStickerCatalog();

  return (
    <main className="page catalog-page">
      <section className="catalog-header">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Figuritas activas</h1>
          <p>Vista temporal para validar la lectura del catalogo global desde Firestore.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => void refresh()}>
          Actualizar
        </button>
      </section>

      {loading ? <p className="state-message">Cargando figuritas...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {!loading && !error && stickers.length === 0 ? (
        <p className="state-message">Todavia no hay figuritas activas para mostrar.</p>
      ) : null}

      <section className="catalog-grid" aria-label="Catalogo de figuritas">
        {stickers.map((sticker) => (
          <article className="sticker-card" key={sticker.id}>
            <div className="sticker-card-art">
              {sticker.imageUrl.startsWith("placeholder://") ? (
                <span className="sticker-card-placeholder">#{sticker.number}</span>
              ) : (
                <img src={sticker.imageUrl} alt={sticker.title} loading="lazy" />
              )}
            </div>
            <span className="sticker-number">#{sticker.number}</span>
            <dl>
              <div>
                <dt>Epoca</dt>
                <dd>{getCatalogEraLabel(sticker.tags, sticker.imageUrl, sticker.era)}</dd>
              </div>
              <div>
                <dt>Rareza</dt>
                <dd>{sticker.rarity}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

function getCatalogEraLabel(tags: readonly string[], imageUrl: string, era: string): string {
  if (tags.includes("libertadores-2014")) {
    return "Libertadores 2014";
  }

  if (imageUrl.includes("/Libertadores_2014/")) {
    return "Libertadores 2014";
  }

  return era;
}
