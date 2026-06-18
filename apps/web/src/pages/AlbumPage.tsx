import { canPasteSticker, type AlbumStickerView } from "@albumsl/domain";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AlbumLoadingSkeleton } from "../components/LoadingSkeleton";
import { getStickerSpreadIndex } from "../features/album/album-navigation";
import { getAlbumStatusClassName } from "../features/album/album-view-labels";
import { useAlbumData } from "../features/album/useAlbumData";
import { usePasteSticker } from "../features/album/usePasteSticker";

const STICKERS_PER_ALBUM_SIDE = 16;
const STICKERS_PER_ALBUM_SPREAD = STICKERS_PER_ALBUM_SIDE * 2;
const ALBUM_PAGE_THEMES = [
  { theme: "gloria" },
  { theme: "final" },
  { theme: "plantel" },
  { theme: "boedo" },
] as const;

export function AlbumPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const { albumStickers, progress, loading, error, refresh } = useAlbumData();
  const pasteSticker = usePasteSticker();
  const hasNoCollectedStickers = !loading && !error && progress.collectedStickers === 0;
  const libertadoresStickers = albumStickers.filter(isLibertadores2014Sticker);
  const libertadoresProgress = getCollectionProgress(libertadoresStickers);
  const focusedStickerId = searchParams.get("sticker");

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
          focusedStickerId={focusedStickerId}
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
  focusedStickerId,
  loadingStickerId,
  pasteError,
  onPaste,
}: {
  readonly title: string;
  readonly description: string;
  readonly progress: CollectionProgress;
  readonly stickers: readonly AlbumStickerView[];
  readonly focusedStickerId: string | null;
  readonly loadingStickerId: string | null;
  readonly pasteError: string | null;
  readonly onPaste: (stickerId: string) => void;
}): React.JSX.Element {
  const completion = progress.total > 0 ? Math.round((progress.pasted / progress.total) * 100) : 0;
  const [displayedSpreadIndex, setDisplayedSpreadIndex] = useState(0);
  const orderedStickers = [...stickers].sort(compareAlbumStickersByNumber);
  const spreadCount = Math.max(1, Math.ceil(orderedStickers.length / STICKERS_PER_ALBUM_SPREAD));
  const focusedSpreadIndex = getStickerSpreadIndex(
    orderedStickers,
    focusedStickerId,
    STICKERS_PER_ALBUM_SPREAD,
  );
  const currentSpreadIndex = Math.min(displayedSpreadIndex, spreadCount - 1);
  const currentSpread = getAlbumSpread(orderedStickers, currentSpreadIndex);
  const canGoBack = currentSpreadIndex > 0;
  const canGoForward = currentSpreadIndex < spreadCount - 1;

  useEffect(() => {
    setDisplayedSpreadIndex(focusedSpreadIndex);
  }, [focusedSpreadIndex]);

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
        aria-label={`${title}, página ${currentSpreadIndex + 1}`}
      >
        <AlbumBookPage
          side="left"
          stickers={currentSpread.leftPageStickers}
          spreadIndex={currentSpreadIndex}
          loadingStickerId={loadingStickerId}
          focusedStickerId={focusedStickerId}
          onPaste={onPaste}
        />
        <div className="album-book-spine" aria-hidden="true" />
        <AlbumBookPage
          side="right"
          stickers={currentSpread.rightPageStickers}
          spreadIndex={currentSpreadIndex}
          loadingStickerId={loadingStickerId}
          focusedStickerId={focusedStickerId}
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
          aria-label="Página anterior"
        >
          {"‹"}
        </button>
        <span>
          Página {currentSpreadIndex + 1} de {spreadCount}
        </span>
        <button
          type="button"
          className="album-page-arrow"
          onClick={() => turnPage("next")}
          disabled={!canGoForward}
          aria-label="Página siguiente"
        >
          {"›"}
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
  focusedStickerId,
  onPaste,
}: {
  readonly side: "left" | "right";
  readonly stickers: readonly AlbumStickerView[];
  readonly spreadIndex: number;
  readonly loadingStickerId: string | null;
  readonly focusedStickerId: string | null;
  readonly onPaste: (stickerId: string) => void;
}): React.JSX.Element {
  const theme = getAlbumPageTheme(spreadIndex);

  return (
    <article
      className={`album-book-page album-book-page--${side} album-magazine-page album-magazine-page--${side} album-magazine-page--theme-${theme.theme}`}
    >
      <header className="album-magazine-header">
        <p>Libertadores 2014</p>
      </header>
      <div className="album-magazine-watermark" aria-hidden="true">
        CASLA
      </div>
      <div className="album-magazine-content">
        <div className="album-grid album-slot-grid album-slot-grid--libertadores album-book-slots album-magazine-slots">
          {stickers.map((albumSticker, stickerIndex) => (
            <AlbumStickerCard
              key={albumSticker.sticker.id}
              albumSticker={albumSticker}
              loading={loadingStickerId === albumSticker.sticker.id}
              focused={focusedStickerId === albumSticker.sticker.id}
              onPaste={onPaste}
              slotIndex={stickerIndex}
            />
          ))}
        </div>
      </div>
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

function getAlbumPageTheme(spreadIndex: number): (typeof ALBUM_PAGE_THEMES)[number] {
  return ALBUM_PAGE_THEMES[spreadIndex % ALBUM_PAGE_THEMES.length] ?? ALBUM_PAGE_THEMES[0];
}

function isLibertadores2014Sticker(albumSticker: AlbumStickerView): boolean {
  return albumSticker.sticker.tags.includes("libertadores-2014");
}

function AlbumStickerCard({
  albumSticker,
  loading,
  focused,
  onPaste,
  slotIndex,
}: {
  readonly albumSticker: AlbumStickerView;
  readonly loading: boolean;
  readonly focused: boolean;
  readonly onPaste: (stickerId: string) => void;
  readonly slotIndex?: number;
}): React.JSX.Element {
  const { sticker } = albumSticker;
  const statusClassName = getAlbumStatusClassName(albumSticker.status);
  const shouldShowImage = albumSticker.isCollected || albumSticker.isPasted;
  const rarityClassName = `album-slot--${sticker.rarity.toLowerCase()}`;
  const slotHint = getAlbumSlotHint(albumSticker);
  const slotPositionClassName =
    slotIndex === undefined ? "" : `album-slot-position-${slotIndex + 1}`;
  const focusedClassName = focused ? "album-slot--focused" : "";
  const className = `album-slot album-sticker-slot ${statusClassName} ${rarityClassName} ${slotPositionClassName} ${focusedClassName}`;
  const isAvailableToPaste =
    albumSticker.userSticker !== null &&
    albumSticker.userSticker !== undefined &&
    canPasteSticker(albumSticker.userSticker);

  const content = (
    <>
      <div className="album-slot-art">
        {shouldShowImage ? (
          sticker.imageUrl.startsWith("placeholder://") ? (
            <EmptyAlbumSlotMark stickerNumber={sticker.number} />
          ) : (
            <img src={sticker.imageUrl} alt={sticker.title} loading="lazy" />
          )
        ) : (
          <EmptyAlbumSlotMark stickerNumber={sticker.number} />
        )}
      </div>
      <div className="album-slot-body">
        <h2>{sticker.title}</h2>
        <p>
          {sticker.category} · {sticker.rarity}
        </p>
      </div>
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

function EmptyAlbumSlotMark({
  stickerNumber,
}: {
  readonly stickerNumber: number;
}): React.JSX.Element {
  return (
    <span className="album-slot-empty-mark" aria-hidden="true">
      <span className="album-slot-empty-mark-main">CASLA</span>
      <span className="album-slot-empty-mark-line" />
      <span className="album-slot-empty-mark-detail">Boedo 1908</span>
      <span className="album-slot-empty-number">#{stickerNumber}</span>
    </span>
  );
}

function getAlbumSlotHint(albumSticker: AlbumStickerView): string {
  if (!albumSticker.isCollected) {
    return "Faltante";
  }

  if (albumSticker.isPasted && albumSticker.duplicateQuantity > 0) {
    return `Pegada con ${albumSticker.duplicateQuantity} repetida${
      albumSticker.duplicateQuantity === 1 ? "" : "s"
    }`;
  }

  if (albumSticker.isPasted) {
    return "Pegada";
  }

  return "Disponible para pegar";
}
