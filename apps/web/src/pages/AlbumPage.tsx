import { canPasteSticker, type AlbumStickerView } from "@albumsl/domain";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AlbumLoadingSkeleton } from "../components/LoadingSkeleton";
import { getAlbumStatusClassName } from "../features/album/album-view-labels";
import { useAlbumData } from "../features/album/useAlbumData";
import { usePasteSticker } from "../features/album/usePasteSticker";

const STICKERS_PER_ALBUM_SIDE = 6;
const STICKERS_PER_ALBUM_SPREAD = STICKERS_PER_ALBUM_SIDE * 2;
const ALBUM_PAGE_THEMES = [
  {
    theme: "gloria",
    leftTitle: "Gloria azulgrana",
    rightTitle: "Equipo campeon",
    leftKicker: "La copa eterna",
    rightKicker: "Plantel campeon",
    leftMark: "2014",
    rightMark: "CASLA",
    footerLeft: "Final",
    footerRight: "Boedo",
  },
  {
    theme: "final",
    leftTitle: "Noche de copa",
    rightTitle: "La final",
    leftKicker: "Nuevo Gasometro",
    rightKicker: "Historia grande",
    leftMark: "22",
    rightMark: "AGO",
    footerLeft: "Semis",
    footerRight: "Trofeo",
  },
  {
    theme: "plantel",
    leftTitle: "Plantel sagrado",
    rightTitle: "Festejo eterno",
    leftKicker: "Los nombres",
    rightKicker: "La vuelta",
    leftMark: "SL",
    rightMark: "COPA",
    footerLeft: "Equipo",
    footerRight: "Ciclon",
  },
  {
    theme: "boedo",
    leftTitle: "Pueblo azulgrana",
    rightTitle: "Boedo late",
    leftKicker: "La hinchada",
    rightKicker: "Identidad",
    leftMark: "B°",
    rightMark: "1908",
    footerLeft: "Tablon",
    footerRight: "Barrio",
  },
] as const;

export function AlbumPage(): React.JSX.Element {
  const { albumStickers, progress, loading, error, refresh } = useAlbumData();
  const pasteSticker = usePasteSticker();
  const hasNoCollectedStickers = !loading && !error && progress.collectedStickers === 0;
  const libertadoresStickers = albumStickers.filter(isLibertadores2014Sticker);
  const libertadoresProgress = getCollectionProgress(libertadoresStickers);

  async function handlePasteSticker(stickerId: string): Promise<void> {
    const result = await pasteSticker.paste(stickerId);

    if (result) {
      await refresh();
    }
  }

  return (
    <main className="page album-page experience-album-page album-game-screen">
      <div className="album-screen-backdrop" aria-hidden="true" />
      <section className="album-hero album-hero--featured album-game-hud">
        <div className="album-hero-copy">
          <p className="eyebrow">Mi Album</p>
          <h1>Libertadores 2014</h1>
          <p>Elegí una figurita para pegarla y recorré el álbum hoja por hoja.</p>
        </div>
        <div className="album-hero-actions">
          <Link className="album-back-link" to="/">
            Inicio
          </Link>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </section>

      {loading ? <AlbumLoadingSkeleton /> : null}
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
      {libertadoresStickers.length > 0 ? (
        <CollectionSection
          title="Libertadores 2014"
          description="Album principal"
          progress={libertadoresProgress}
          stickers={libertadoresStickers}
          loadingStickerId={pasteSticker.loadingStickerId}
          pasteError={pasteSticker.error}
          onPaste={(stickerId) => void handlePasteSticker(stickerId)}
        />
      ) : null}
    </main>
  );
}

function CollectionSection({
  title,
  description,
  progress,
  stickers,
  loadingStickerId,
  pasteError,
  onPaste,
}: {
  readonly title: string;
  readonly description: string;
  readonly progress: CollectionProgress;
  readonly stickers: readonly AlbumStickerView[];
  readonly loadingStickerId: string | null;
  readonly pasteError: string | null;
  readonly onPaste: (stickerId: string) => void;
}): React.JSX.Element {
  const completion = progress.total > 0 ? Math.round((progress.pasted / progress.total) * 100) : 0;
  const [displayedSpreadIndex, setDisplayedSpreadIndex] = useState(0);
  const orderedStickers = [...stickers].sort(compareAlbumStickersByNumber);
  const spreadCount = Math.max(1, Math.ceil(orderedStickers.length / STICKERS_PER_ALBUM_SPREAD));
  const currentSpreadIndex = Math.min(displayedSpreadIndex, spreadCount - 1);
  const currentSpread = getAlbumSpread(orderedStickers, currentSpreadIndex);
  const canGoBack = currentSpreadIndex > 0;
  const canGoForward = currentSpreadIndex < spreadCount - 1;

  function turnPage(direction: "next" | "previous"): void {
    if (direction === "previous" && !canGoBack) {
      return;
    }

    if (direction === "next" && !canGoForward) {
      return;
    }

    const nextSpreadIndex =
      direction === "next"
        ? Math.min(spreadCount - 1, currentSpreadIndex + 1)
        : Math.max(0, currentSpreadIndex - 1);

    setDisplayedSpreadIndex(nextSpreadIndex);
  }

  return (
    <section
      className="album-collection-section album-collection-section--libertadores album-spread-stage"
      aria-labelledby="libertadores-2014-title"
    >
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

      <div
        className="album-book album-object"
        aria-label={`${title}, hoja ${currentSpreadIndex + 1}`}
      >
        <AlbumBookPage
          side="left"
          stickers={currentSpread.leftPageStickers}
          spreadIndex={currentSpreadIndex}
          loadingStickerId={loadingStickerId}
          onPaste={onPaste}
        />
        <div className="album-book-spine" aria-hidden="true" />
        <AlbumBookPage
          side="right"
          stickers={currentSpread.rightPageStickers}
          spreadIndex={currentSpreadIndex}
          loadingStickerId={loadingStickerId}
          onPaste={onPaste}
        />
      </div>

      {pasteError ? (
        <p className="error-message compact" role="alert">
          {pasteError}
        </p>
      ) : null}

      <div className="album-page-nav" aria-label="Navegacion de paginas del album">
        <button
          type="button"
          className="album-page-arrow"
          onClick={() => turnPage("previous")}
          disabled={!canGoBack}
          aria-label="Hoja anterior"
        >
          {"←"}
        </button>
        <span>
          Hoja {currentSpreadIndex + 1} de {spreadCount}
        </span>
        <button
          type="button"
          className="album-page-arrow"
          onClick={() => turnPage("next")}
          disabled={!canGoForward}
          aria-label="Hoja siguiente"
        >
          {"→"}
        </button>
      </div>
    </section>
  );
}

function AlbumBookPage({
  side,
  stickers,
  spreadIndex,
  loadingStickerId,
  onPaste,
}: {
  readonly side: "left" | "right";
  readonly stickers: readonly AlbumStickerView[];
  readonly spreadIndex: number;
  readonly loadingStickerId: string | null;
  readonly onPaste: (stickerId: string) => void;
}): React.JSX.Element {
  const pageRange = getAlbumPageRangeLabel(stickers);
  const theme = getAlbumPageTheme(spreadIndex);
  const pageTitle = side === "left" ? theme.leftTitle : theme.rightTitle;
  const pageKicker = side === "left" ? theme.leftKicker : theme.rightKicker;
  const pageMark = side === "left" ? theme.leftMark : theme.rightMark;
  const pageFooter = side === "left" ? theme.footerLeft : theme.footerRight;

  return (
    <article
      className={`album-book-page album-book-page--${side} album-magazine-page album-magazine-page--${side} album-magazine-page--theme-${theme.theme}`}
    >
      <header className="album-magazine-header">
        <div>
          <p>Libertadores 2014</p>
          <h3>{pageTitle}</h3>
        </div>
        <span>{pageRange}</span>
      </header>
      <div className="album-magazine-watermark" aria-hidden="true">
        CASLA
      </div>
      <div className="album-magazine-content">
        <aside className="album-magazine-info-card" aria-hidden="true">
          <strong>{pageMark}</strong>
          <span>{pageKicker}</span>
          <small>{pageRange}</small>
        </aside>
        <div className="album-grid album-slot-grid album-slot-grid--libertadores album-book-slots album-magazine-slots">
          {stickers.map((albumSticker, stickerIndex) => (
            <AlbumStickerCard
              key={albumSticker.sticker.id}
              albumSticker={albumSticker}
              loading={loadingStickerId === albumSticker.sticker.id}
              onPaste={onPaste}
              slotIndex={stickerIndex}
            />
          ))}
        </div>
      </div>
      <footer className="album-magazine-footer">
        <span>San Lorenzo</span>
        <span>{pageFooter}</span>
      </footer>
    </article>
  );
}

interface CollectionProgress {
  readonly total: number;
  readonly collected: number;
  readonly pasted: number;
}

interface AlbumSpread {
  readonly leftPageStickers: readonly AlbumStickerView[];
  readonly rightPageStickers: readonly AlbumStickerView[];
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

function getAlbumSpread(
  orderedStickers: readonly AlbumStickerView[],
  spreadIndex: number,
): AlbumSpread {
  const spreadStartIndex = spreadIndex * STICKERS_PER_ALBUM_SPREAD;

  return {
    leftPageStickers: orderedStickers.slice(
      spreadStartIndex,
      spreadStartIndex + STICKERS_PER_ALBUM_SIDE,
    ),
    rightPageStickers: orderedStickers.slice(
      spreadStartIndex + STICKERS_PER_ALBUM_SIDE,
      spreadStartIndex + STICKERS_PER_ALBUM_SPREAD,
    ),
  };
}

function compareAlbumStickersByNumber(first: AlbumStickerView, second: AlbumStickerView): number {
  return Number(first.sticker.number) - Number(second.sticker.number);
}

function getAlbumPageRangeLabel(stickers: readonly AlbumStickerView[]): string {
  if (stickers.length === 0) {
    return "Figus";
  }

  const firstStickerNumber = stickers[0]?.sticker.number ?? "";
  const lastStickerNumber = stickers[stickers.length - 1]?.sticker.number ?? "";

  return `#${firstStickerNumber} - #${lastStickerNumber}`;
}

function getAlbumPageTheme(spreadIndex: number): (typeof ALBUM_PAGE_THEMES)[number] {
  return ALBUM_PAGE_THEMES[spreadIndex % ALBUM_PAGE_THEMES.length] ?? ALBUM_PAGE_THEMES[0];
}

function isLibertadores2014Sticker(albumSticker: AlbumStickerView): boolean {
  return albumSticker.sticker.tags.includes("libertadores-2014");
}

function AlbumStickerCard({
  albumSticker,
  loading,
  onPaste,
  slotIndex,
}: {
  readonly albumSticker: AlbumStickerView;
  readonly loading: boolean;
  readonly onPaste: (stickerId: string) => void;
  readonly slotIndex?: number;
}): React.JSX.Element {
  const { sticker } = albumSticker;
  const statusClassName = getAlbumStatusClassName(albumSticker.status);
  const shouldShowImage = albumSticker.isCollected || albumSticker.isPasted;
  const rarityClassName = `album-slot--${sticker.rarity.toLowerCase()}`;
  const slotHint = getAlbumSlotHint(albumSticker);
  const extraClassName = albumSticker.repeatedQuantity > 0 ? "album-slot--extra" : "";
  const slotPositionClassName =
    slotIndex === undefined ? "" : `album-slot-position-${slotIndex + 1}`;
  const className = `album-slot album-sticker-slot ${statusClassName} ${rarityClassName} ${extraClassName} ${slotPositionClassName}`;
  const isAvailableToPaste =
    albumSticker.userSticker !== null &&
    albumSticker.userSticker !== undefined &&
    canPasteSticker(albumSticker.userSticker);

  const content = (
    <>
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
        <h2>{sticker.title}</h2>
        <p>
          {sticker.category} · {sticker.rarity}
        </p>
      </div>
      {albumSticker.repeatedQuantity > 0 ? (
        <span className="album-slot-repeat-badge">+{albumSticker.repeatedQuantity}</span>
      ) : null}
    </>
  );

  if (isAvailableToPaste) {
    return (
      <button
        type="button"
        className={`${className} album-slot--paste-action`}
        onClick={() => onPaste(sticker.id)}
        disabled={loading}
        aria-label={`Pegar figurita ${sticker.number}: ${sticker.title}`}
      >
        {content}
        <span className="album-slot-paste-label">{loading ? "Pegando..." : "Pegar"}</span>
      </button>
    );
  }

  return (
    <Link
      className={className}
      to={`/album/${sticker.id}`}
      aria-label={`Figurita ${sticker.number}: ${sticker.title}. ${slotHint}`}
    >
      {content}
    </Link>
  );
}

function getAlbumSlotHint(albumSticker: AlbumStickerView): string {
  if (!albumSticker.isCollected) {
    return "Faltante";
  }

  if (albumSticker.isPasted && albumSticker.repeatedQuantity > 0) {
    return `Pegada con ${albumSticker.repeatedQuantity} repetida${
      albumSticker.repeatedQuantity === 1 ? "" : "s"
    }`;
  }

  if (albumSticker.isPasted) {
    return "Pegada";
  }

  return "Disponible para pegar";
}
