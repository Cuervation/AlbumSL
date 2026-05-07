import { type AlbumStickerView } from "@albumsl/domain";
import { type AnimationEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAlbumStatusClassName, getAlbumStatusLabel } from "../features/album/album-view-labels";
import { useAlbumData } from "../features/album/useAlbumData";

const STICKERS_PER_ALBUM_SIDE = 6;
const STICKERS_PER_ALBUM_SPREAD = STICKERS_PER_ALBUM_SIDE * 2;
const ALBUM_PAGE_TURN_FALLBACK_MS = 800;

export function AlbumPage(): React.JSX.Element {
  const { albumStickers, progress, loading, error, refresh } = useAlbumData();
  const hasNoCollectedStickers = !loading && !error && progress.collectedStickers === 0;
  const completion = Math.max(0, Math.min(100, progress.completionPercentage));
  const libertadoresStickers = albumStickers.filter(isLibertadores2014Sticker);
  const otherStickers = albumStickers.filter(
    (albumSticker) => !isLibertadores2014Sticker(albumSticker),
  );
  const libertadoresProgress = getCollectionProgress(libertadoresStickers);

  return (
    <main className="page album-page experience-album-page album-game-screen">
      <div className="album-screen-backdrop" aria-hidden="true" />
      <section className="album-hero album-hero--featured album-game-hud">
        <div className="album-hero-copy">
          <p className="eyebrow">Mi Album</p>
          <h1>Libertadores 2014</h1>
          <p>Completa casilleros, pega figus y avanza pagina por pagina.</p>
        </div>
        <div className="album-screen-progress" aria-label="Progreso general del album">
          <strong>{progress.completionPercentage}%</strong>
          <span>completo</span>
          <div className="album-screen-progress-meter" aria-hidden="true">
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="album-screen-stats" aria-label="Resumen de coleccion">
          <span>
            <strong>{progress.collectedStickers}</strong>
            Conseguidas
          </span>
          <span>
            <strong>{progress.pastedStickers}</strong>
            Pegadas
          </span>
          <span>
            <strong>{progress.repeatedStickers}</strong>
            Repetidas
          </span>
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
      {libertadoresStickers.length > 0 ? (
        <CollectionSection
          title="Libertadores 2014"
          description="Album principal"
          progress={libertadoresProgress}
          stickers={libertadoresStickers}
        />
      ) : null}

      <section
        className="album-progress-banner album-progress-banner--compact"
        aria-label="Resumen visual del album"
      >
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

      {otherStickers.length > 0 ? (
        <section className="album-collection-section" aria-label="Otras figuritas del album">
          <div className="album-collection-header">
            <div>
              <p className="eyebrow">AlbumSL</p>
              <h2>Otras figuritas</h2>
              <p>Resto del catalogo azulgrana disponible con los mismos estados del album.</p>
            </div>
          </div>
          <div className="album-grid album-slot-grid">
            {otherStickers.map((albumSticker) => (
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
  const [displayedSpreadIndex, setDisplayedSpreadIndex] = useState(0);
  const [targetSpreadIndex, setTargetSpreadIndex] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState<"next" | "previous" | null>(null);
  const orderedStickers = [...stickers].sort(compareAlbumStickersByNumber);
  const spreadCount = Math.max(1, Math.ceil(orderedStickers.length / STICKERS_PER_ALBUM_SPREAD));
  const currentSpreadIndex = Math.min(displayedSpreadIndex, spreadCount - 1);
  const confirmedTargetSpreadIndex =
    targetSpreadIndex === null ? null : Math.min(targetSpreadIndex, spreadCount - 1);
  const currentSpread = getAlbumSpread(orderedStickers, currentSpreadIndex);
  const targetSpread =
    confirmedTargetSpreadIndex === null
      ? null
      : getAlbumSpread(orderedStickers, confirmedTargetSpreadIndex);
  const canGoBack = currentSpreadIndex > 0;
  const canGoForward = currentSpreadIndex < spreadCount - 1;
  const isTurningPage = turnDirection !== null && targetSpread !== null;

  useEffect(() => {
    if (displayedSpreadIndex <= spreadCount - 1) {
      return;
    }

    setDisplayedSpreadIndex(spreadCount - 1);
  }, [displayedSpreadIndex, spreadCount]);

  useEffect(() => {
    if (!isTurningPage || confirmedTargetSpreadIndex === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedSpreadIndex(confirmedTargetSpreadIndex);
      setTargetSpreadIndex(null);
      setTurnDirection(null);
    }, ALBUM_PAGE_TURN_FALLBACK_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isTurningPage, confirmedTargetSpreadIndex]);

  function confirmTurnPage(): void {
    if (confirmedTargetSpreadIndex === null) {
      return;
    }

    setDisplayedSpreadIndex(confirmedTargetSpreadIndex);
    setTargetSpreadIndex(null);
    setTurnDirection(null);
  }

  function handleTurnAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.currentTarget !== event.target) {
      return;
    }

    confirmTurnPage();
  }

  function turnPage(direction: "next" | "previous"): void {
    if (isTurningPage) {
      return;
    }

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

    if (prefersReducedMotion()) {
      setDisplayedSpreadIndex(nextSpreadIndex);
      setTargetSpreadIndex(null);
      setTurnDirection(null);
      return;
    }

    setTargetSpreadIndex(nextSpreadIndex);
    setTurnDirection(direction);
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
        className={`album-book album-object album-book-transition-stage ${
          isTurningPage ? `album-book--turning-${turnDirection}` : ""
        }`}
        aria-label={`${title}, paginas ${currentSpreadIndex + 1}`}
      >
        {targetSpread ? (
          <div
            className={`album-book-target-spread album-book-target-spread--${turnDirection}`}
            aria-hidden="true"
          >
            <AlbumBookPage
              side="left"
              stickers={targetSpread.leftPageStickers}
              imageLoading="eager"
              inert
            />
            <div className="album-book-spine" aria-hidden="true" />
            <AlbumBookPage
              side="right"
              stickers={targetSpread.rightPageStickers}
              imageLoading="eager"
              inert
            />
          </div>
        ) : null}
        <AlbumBookPage side="left" stickers={currentSpread.leftPageStickers} />
        <div className="album-book-spine" aria-hidden="true" />
        <AlbumBookPage side="right" stickers={currentSpread.rightPageStickers} />
        {targetSpread && turnDirection ? (
          <AlbumTurnSheet
            direction={turnDirection}
            currentSpread={currentSpread}
            targetSpread={targetSpread}
            onAnimationEnd={handleTurnAnimationEnd}
          />
        ) : null}
      </div>

      <div className="album-page-nav" aria-label="Navegacion de paginas del album">
        <button
          type="button"
          className="album-page-arrow"
          onClick={() => turnPage("previous")}
          disabled={!canGoBack || isTurningPage}
          aria-label="Pagina anterior"
        >
          {"<"}
        </button>
        <span>
          Pagina {currentSpreadIndex + 1} / {spreadCount}
        </span>
        <button
          type="button"
          className="album-page-arrow"
          onClick={() => turnPage("next")}
          disabled={!canGoForward || isTurningPage}
          aria-label="Pagina siguiente"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}

function AlbumBookPage({
  side,
  stickers,
  imageLoading = "lazy",
  inert = false,
}: {
  readonly side: "left" | "right";
  readonly stickers: readonly AlbumStickerView[];
  readonly imageLoading?: "eager" | "lazy";
  readonly inert?: boolean;
}): React.JSX.Element {
  return (
    <div className={`album-book-page album-book-page--${side}`}>
      <div className="album-grid album-slot-grid album-slot-grid--libertadores album-book-slots">
        {stickers.map((albumSticker) => (
          <AlbumStickerCard
            key={albumSticker.sticker.id}
            albumSticker={albumSticker}
            imageLoading={imageLoading}
            inert={inert}
          />
        ))}
      </div>
    </div>
  );
}

function AlbumTurnSheet({
  direction,
  currentSpread,
  targetSpread,
  onAnimationEnd,
}: {
  readonly direction: "next" | "previous";
  readonly currentSpread: AlbumSpread;
  readonly targetSpread: AlbumSpread;
  readonly onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
}): React.JSX.Element {
  const frontStickers =
    direction === "next" ? currentSpread.rightPageStickers : currentSpread.leftPageStickers;
  const backStickers =
    direction === "next" ? targetSpread.leftPageStickers : targetSpread.rightPageStickers;

  return (
    <div
      className={`album-turn-sheet album-turn-sheet--${direction}`}
      onAnimationEnd={onAnimationEnd}
      aria-hidden="true"
    >
      <div className="album-turn-sheet-face album-turn-sheet-face--front">
        <AlbumBookPage
          side={direction === "next" ? "right" : "left"}
          stickers={frontStickers}
          imageLoading="eager"
          inert
        />
      </div>
      <div className="album-turn-sheet-face album-turn-sheet-face--back">
        <AlbumBookPage
          side={direction === "next" ? "left" : "right"}
          stickers={backStickers}
          imageLoading="eager"
          inert
        />
      </div>
    </div>
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

function isLibertadores2014Sticker(albumSticker: AlbumStickerView): boolean {
  return albumSticker.sticker.tags.includes("libertadores-2014");
}

function AlbumStickerCard({
  albumSticker,
  imageLoading = "lazy",
  inert = false,
}: {
  readonly albumSticker: AlbumStickerView;
  readonly imageLoading?: "eager" | "lazy";
  readonly inert?: boolean;
}): React.JSX.Element {
  const { sticker } = albumSticker;
  const statusClassName = getAlbumStatusClassName(albumSticker.status);
  const shouldShowImage = albumSticker.isCollected || albumSticker.isPasted;
  const rarityClassName = `album-slot--${sticker.rarity.toLowerCase()}`;
  const slotHint = getAlbumSlotHint(albumSticker);
  const extraClassName = albumSticker.repeatedQuantity > 0 ? "album-slot--extra" : "";

  return (
    <Link
      className={`album-slot album-sticker-slot ${statusClassName} ${rarityClassName} ${extraClassName}`}
      to={`/album/${sticker.id}`}
      aria-label={`Figurita ${sticker.number}: ${sticker.title}. ${slotHint}`}
      tabIndex={inert ? -1 : undefined}
    >
      <span className="album-slot-number">#{sticker.number}</span>
      <div className="album-slot-art">
        {shouldShowImage ? (
          sticker.imageUrl.startsWith("placeholder://") ? (
            <span>#{sticker.number}</span>
          ) : (
            <img src={sticker.imageUrl} alt={sticker.title} loading={imageLoading} />
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
      <span className={`album-slot-state album-slot-state--${albumSticker.status.toLowerCase()}`}>
        {getAlbumStatusLabel(albumSticker.status)}
      </span>
      {albumSticker.repeatedQuantity > 0 ? (
        <span className="album-slot-repeat-badge">+{albumSticker.repeatedQuantity}</span>
      ) : null}
    </Link>
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
