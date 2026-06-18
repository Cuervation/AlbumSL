import type { AlbumStickerView } from "@albumsl/domain";
import type { DragEvent } from "react";

import { getExchangeableQuantity } from "../../features/sticker-library/sticker-library-model";
import { HomeIcon } from "../home/HomeIcon";

const STICKER_DRAG_TYPE = "application/x-albumsl-sticker-id";

interface StickerLibrarySummaryProps {
  readonly availableToPaste: number;
  readonly repeated: number;
  readonly exchangeCount: number;
  readonly totalCopies: number;
}

interface StickerInventoryCardProps {
  readonly albumSticker: AlbumStickerView;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

interface StickerDropTargetProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly icon: "album";
  readonly selectedSticker: AlbumStickerView | null;
  readonly onDropSticker: (stickerId: string) => void;
  readonly onActivate: () => void;
}

interface ExchangeStickerTrayProps {
  readonly selectedStickers: readonly AlbumStickerView[];
  readonly activeSticker: AlbumStickerView | null;
  readonly maxStickers: number;
  readonly onDropSticker: (stickerId: string) => void;
  readonly onActivate: () => void;
  readonly onRemove: (stickerId: string) => void;
}

export function StickerLibrarySummary({
  availableToPaste,
  repeated,
  exchangeCount,
  totalCopies,
}: StickerLibrarySummaryProps): React.JSX.Element {
  const items = [
    { label: "Para pegar", value: availableToPaste, icon: "stickers" as const },
    { label: "Repetidos", value: repeated, icon: "duplicates" as const },
    { label: "En bandeja", value: exchangeCount, icon: "exchange" as const },
    { label: "Total cromos", value: totalCopies, icon: "album" as const },
  ];

  return (
    <section className="sticker-library-summary" aria-label="Resumen de colección">
      {items.map((item) => (
        <article key={item.label}>
          <span>
            <HomeIcon name={item.icon} />
          </span>
          <div>
            <strong>{item.value}</strong>
            <small>{item.label}</small>
          </div>
        </article>
      ))}
    </section>
  );
}

export function StickerInventoryCard({
  albumSticker,
  selected,
  onSelect,
}: StickerInventoryCardProps): React.JSX.Element {
  const { sticker } = albumSticker;
  const status = getInventoryStatus(albumSticker);

  function handleDragStart(event: DragEvent<HTMLButtonElement>): void {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(STICKER_DRAG_TYPE, sticker.id);
    event.dataTransfer.setData("text/plain", sticker.id);
  }

  return (
    <button
      type="button"
      className={`sticker-inventory-card${selected ? " sticker-inventory-card--selected" : ""}`}
      draggable
      onClick={onSelect}
      onDragStart={handleDragStart}
      aria-pressed={selected}
      aria-label={`${sticker.title}. ${status.label}. Seleccionar para mover.`}
    >
      <span className="sticker-inventory-number">{String(sticker.number).padStart(3, "0")}</span>
      <span className="sticker-inventory-art">
        {sticker.imageUrl.startsWith("placeholder://") ? (
          <span>#{sticker.number}</span>
        ) : (
          <img src={sticker.imageUrl} alt="" loading="lazy" draggable={false} />
        )}
      </span>
      <span className="sticker-inventory-copy">
        <strong>{sticker.title}</strong>
        <small>{sticker.category}</small>
      </span>
      <span className={`sticker-inventory-status sticker-inventory-status--${status.tone}`}>
        {status.label}
      </span>
    </button>
  );
}

export function StickerDropTarget({
  title,
  description,
  actionLabel,
  icon,
  selectedSticker,
  onDropSticker,
  onActivate,
}: StickerDropTargetProps): React.JSX.Element {
  return (
    <section
      className="sticker-drop-panel sticker-drop-panel--album"
      onDragOver={allowStickerDrop}
      onDrop={(event) => handleStickerDrop(event, onDropSticker)}
    >
      <div className="sticker-drop-panel-heading">
        <span>
          <HomeIcon name={icon} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="sticker-drop-zone">
        {selectedSticker ? (
          <StickerPreview albumSticker={selectedSticker} />
        ) : (
          <>
            <HomeIcon name="album" />
            <strong>Arrastrá una figurita acá</strong>
            <small>También podés seleccionarla y usar el botón.</small>
          </>
        )}
      </div>

      <button type="button" onClick={onActivate}>
        {actionLabel}
      </button>
    </section>
  );
}

export function ExchangeStickerTray({
  selectedStickers,
  activeSticker,
  maxStickers,
  onDropSticker,
  onActivate,
  onRemove,
}: ExchangeStickerTrayProps): React.JSX.Element {
  return (
    <section
      className="sticker-drop-panel sticker-drop-panel--exchange"
      id="exchange"
      onDragOver={allowStickerDrop}
      onDrop={(event) => handleStickerDrop(event, onDropSticker)}
    >
      <div className="sticker-drop-panel-heading">
        <span>
          <HomeIcon name="exchange" />
        </span>
        <div>
          <h2>Bandeja de intercambio</h2>
          <p>Dejá hasta {maxStickers} repetidas. Permanecen acá, sin cambiar de pantalla.</p>
        </div>
      </div>

      <div className="exchange-sticker-tray" aria-live="polite">
        {Array.from({ length: maxStickers }, (_, index) => {
          const albumSticker = selectedStickers[index];

          return albumSticker ? (
            <div key={albumSticker.sticker.id} className="exchange-sticker-item">
              <StickerPreview albumSticker={albumSticker} />
              <button
                type="button"
                onClick={() => onRemove(albumSticker.sticker.id)}
                aria-label={`Quitar ${albumSticker.sticker.title} de intercambio`}
              >
                ×
              </button>
            </div>
          ) : (
            <span key={index} className="exchange-sticker-empty">
              {index + 1}
            </span>
          );
        })}
      </div>

      <button type="button" onClick={onActivate}>
        {activeSticker ? "Agregar seleccionada" : "Seleccioná una repetida"}
      </button>
    </section>
  );
}

export function StickerLibrarySkeleton(): React.JSX.Element {
  return (
    <div className="sticker-library-skeleton" role="status" aria-label="Preparando tus cromos">
      <div className="sticker-library-skeleton-summary">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="sticker-library-skeleton-body">
        <div>
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <aside>
          <span />
          <span />
        </aside>
      </div>
    </div>
  );
}

function StickerPreview({
  albumSticker,
}: {
  readonly albumSticker: AlbumStickerView;
}): React.JSX.Element {
  const { sticker } = albumSticker;

  return (
    <span className="sticker-drag-preview">
      {sticker.imageUrl.startsWith("placeholder://") ? (
        <strong>#{sticker.number}</strong>
      ) : (
        <img src={sticker.imageUrl} alt={sticker.title} draggable={false} />
      )}
    </span>
  );
}

function allowStickerDrop(event: DragEvent<HTMLElement>): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function handleStickerDrop(
  event: DragEvent<HTMLElement>,
  onDropSticker: (stickerId: string) => void,
): void {
  event.preventDefault();
  const stickerId =
    event.dataTransfer.getData(STICKER_DRAG_TYPE) || event.dataTransfer.getData("text/plain");

  if (stickerId) {
    onDropSticker(stickerId);
  }
}

function getInventoryStatus(albumSticker: AlbumStickerView): {
  readonly label: string;
  readonly tone: "new" | "pasted" | "repeated";
} {
  const exchangeableQuantity = getExchangeableQuantity(albumSticker);

  if (exchangeableQuantity > 0) {
    return {
      label: `Repetida +${exchangeableQuantity}`,
      tone: "repeated",
    };
  }

  if (albumSticker.isPasted) {
    return {
      label: "Pegada",
      tone: "pasted",
    };
  }

  return {
    label: "Para pegar",
    tone: "new",
  };
}
